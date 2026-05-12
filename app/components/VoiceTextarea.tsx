"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  lang?: string;
  disabled?: boolean;
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
  const recognitionRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

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
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText.trim()) {
        const prev = valueRef.current;
        const sep = prev && !/[\s।!?.,]$/.test(prev) ? ' ' : '';
        onChangeRef.current((prev || '') + sep + finalText.trim());
      }
      setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      const code = e?.error || 'unknown';
      if (code === 'no-speech') {
        setError('Kuch sunai nahi diya — phir se bolo.');
      } else if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('Mic permission denied. Browser settings mein allow karo.');
      } else if (code === 'network') {
        setError('Network error — internet check karo.');
      } else {
        setError(`Mic error: ${code}`);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e: any) {
      setError(e?.message || 'Mic shuru nahi ho payi.');
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  return (
    <div className="voice-wrap">
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={listening ? 'Sun raha hoon... bolte raho' : placeholder}
        disabled={disabled}
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
            disabled={disabled}
            aria-pressed={listening}
            aria-label={listening ? 'Stop recording' : 'Start recording'}
          >
            <MicIcon />
            <span>{listening ? 'Stop (Bandh karo)' : 'Bolo (Speak)'}</span>
          </button>
          <span className="muted small voice-lang">Hindi/Hinglish • {lang}</span>
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
