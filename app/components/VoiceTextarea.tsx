"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  lang?: string;
  disabled?: boolean;
  // Kept for API compatibility with the page (Bolo no longer uploads
  // audio — user uses the separate Add voice note button if they want
  // audio captured for admin to listen to).
  sessionId?: string;
  questionId?: string;
  onAudioUploaded?: (audioPath: string, durationSeconds: number, audioUrl: string, transcript: string) => void;
};

export function VoiceTextarea({
  value,
  onChange,
  placeholder = 'Type your answer here, or tap the mic to speak...',
  lang = 'hi-IN',
  disabled = false,
}: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transliterating, setTransliterating] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  // Android Chrome ignores continuous=true and emits cumulative finals.
  // Using continuous=false + manual auto-restart on onend gives a
  // feels-continuous UX while avoiding cumulative-final duplication.
  const shouldKeepListeningRef = useRef(false);
  const emittedFinalsRef = useRef<Set<number>>(new Set());
  const lastFinalTextRef = useRef('');

  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      emittedFinalsRef.current = new Set();
      lastFinalTextRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interimText = '';
      const newFinalChunks: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          if (!emittedFinalsRef.current.has(i)) {
            emittedFinalsRef.current.add(i);
            let chunk = String(result[0].transcript || '').trim();
            // Defensive: if a new final extends the previous final
            // (Android Chrome cumulative bug), only emit the new tail.
            const prev = lastFinalTextRef.current;
            if (prev && chunk.startsWith(prev)) {
              chunk = chunk.slice(prev.length).trim();
            }
            if (chunk) {
              newFinalChunks.push(chunk);
              lastFinalTextRef.current = String(result[0].transcript || '').trim();
            }
          }
        } else {
          interimText += result[0].transcript;
        }
      }
      if (newFinalChunks.length > 0) {
        const newFinalText = newFinalChunks.join(' ');
        onChangeRef.current((prev) => {
          const sep = prev && !/[\s।!?.,]$/.test(prev) ? ' ' : '';
          return (prev || '') + sep + newFinalText;
        });
      }
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      const code = e?.error || 'unknown';
      if (code === 'no-speech' || code === 'aborted') return;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('Mic permission denied. Browser settings mein allow karo.');
        shouldKeepListeningRef.current = false;
        setListening(false);
        return;
      }
      if (code === 'network') {
        setError('Network error — internet check karo.');
        shouldKeepListeningRef.current = false;
        setListening(false);
        return;
      }
      setError(`Mic error: ${code}`);
      shouldKeepListeningRef.current = false;
      setListening(false);
    };

    recognition.onend = () => {
      setInterim('');
      emittedFinalsRef.current = new Set();
      lastFinalTextRef.current = '';
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setTimeout(() => {
            if (shouldKeepListeningRef.current) {
              try {
                recognition.start();
              } catch {
                shouldKeepListeningRef.current = false;
                setListening(false);
              }
            }
          }, 120);
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      shouldKeepListeningRef.current = false;
      try {
        recognition.abort();
      } catch {}
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    emittedFinalsRef.current = new Set();
    lastFinalTextRef.current = '';
    shouldKeepListeningRef.current = true;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(true);
    }
  }, []);

  /**
   * User-initiated stop:
   *  1. Stop SR (it's still capturing Devanagari live into the textarea)
   *  2. Take whatever is now in the textarea, transliterate Devanagari → Latin Hinglish
   *  3. Replace textarea content with Hinglish
   *
   * Skips the API call entirely when there's no Devanagari to convert
   * (the helper does the same check) and falls back to the original text
   * on any failure — never breaks the user's typed/spoken content.
   */
  const stop = useCallback(async () => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setListening(false);

    const currentText = valueRef.current || '';
    if (!/[ऀ-ॿ]/.test(currentText)) return; // no Devanagari, nothing to do

    setTransliterating(true);
    try {
      const res = await fetch('/api/transliterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText }),
      });
      const json = await res.json();
      if (res.ok && typeof json.text === 'string' && json.text.trim()) {
        onChangeRef.current(json.text);
      }
    } catch (e) {
      console.warn('[bolo] transliterate failed:', e);
    } finally {
      setTransliterating(false);
    }
  }, []);

  return (
    <div className="voice-wrap">
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={listening ? 'Sun raha hoon... bolte raho' : placeholder}
        disabled={disabled || transliterating}
      />

      {interim && (
        <p className="voice-interim">
          <span className="voice-dot" aria-hidden="true" />
          {interim}
        </p>
      )}

      {supported === true && (
        <div className="voice-controls">
          <button
            type="button"
            className={`mic-btn ${listening ? 'mic-listening' : ''}`}
            onClick={listening ? stop : start}
            disabled={disabled || transliterating}
            aria-pressed={listening}
            aria-label={listening ? 'Stop recording' : 'Start recording'}
          >
            <MicIcon />
            <span>{listening ? 'Stop (Bandh karo)' : 'Bolo (Speak)'}</span>
          </button>
          <span className="muted small voice-lang">
            {transliterating
              ? 'Hinglish mein convert ho raha hai…'
              : listening
                ? 'Live transcription · Stop dabake Hinglish mein convert hoga'
                : `Live Hindi → Hinglish on Stop · ${lang}`}
          </span>
        </div>
      )}

      {supported === false && (
        <p className="muted small">
          Voice input is not supported in this browser. Use Chrome or Safari on mobile / desktop.
        </p>
      )}

      {error && <p className="voice-error">{error}</p>}
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
