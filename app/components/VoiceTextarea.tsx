"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  lang?: string;
  disabled?: boolean;
  // If both sessionId and questionId are provided AND MediaRecorder is
  // supported, the mic also captures raw audio alongside live transcription
  // and uploads it on stop. onAudioUploaded fires with the resulting storage
  // path + duration so the parent can attach it to the next /api/answers save.
  sessionId?: string;
  questionId?: string;
  onAudioUploaded?: (audioPath: string, durationSeconds: number, audioUrl: string) => void;
};

export function VoiceTextarea({
  value,
  onChange,
  placeholder = 'Type your answer here, or tap the mic to speak...',
  lang = 'hi-IN',
  disabled = false,
  sessionId,
  questionId,
  onAudioUploaded,
}: Props) {
  const [listening, setListening] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const onAudioUploadedRef = useRef(onAudioUploaded);
  // Android Chrome ignores continuous=true and emits cumulative finals.
  // Using continuous=false + manual auto-restart on onend gives a
  // feels-continuous UX while avoiding the cumulative-final duplication bug.
  const shouldKeepListeningRef = useRef(false);
  const emittedFinalsRef = useRef<Set<number>>(new Set());
  const lastFinalTextRef = useRef('');
  // Raw audio capture (parallel to SpeechRecognition).
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStartedAtRef = useRef<number>(0);
  const canCaptureAudio = Boolean(sessionId && questionId && onAudioUploaded);

  onChangeRef.current = onChange;
  onAudioUploadedRef.current = onAudioUploaded;

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
        stopAudioCapture(true);
        return;
      }
      if (code === 'network') {
        setError('Network error — internet check karo.');
        shouldKeepListeningRef.current = false;
        setListening(false);
        stopAudioCapture(true);
        return;
      }
      setError(`Mic error: ${code}`);
      shouldKeepListeningRef.current = false;
      setListening(false);
      stopAudioCapture(true);
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
                stopAudioCapture();
              }
            }
          }, 120);
        }
      } else {
        setListening(false);
        stopAudioCapture();
      }
    };

    recognitionRef.current = recognition;
    return () => {
      shouldKeepListeningRef.current = false;
      try { recognition.abort(); } catch {}
      stopAudioCapture(true);
    };
  }, [lang]);

  function stopAudioCapture(discard = false) {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      try {
        // If we want to discard, swap onstop to a no-op first
        if (discard) {
          mr.onstop = null;
          audioChunksRef.current = [];
        }
        mr.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }

  async function startAudioCapture(): Promise<boolean> {
    if (!canCaptureAudio) return false;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
    if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = pickMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: chunks[0].type || 'audio/webm' });
        if (blob.size < 1024) return; // skip tiny/empty recordings
        const duration = Math.max(1, Math.round((Date.now() - audioStartedAtRef.current) / 1000));
        await uploadAudio(blob, duration);
      };
      mediaRecorderRef.current = mr;
      audioStartedAtRef.current = Date.now();
      mr.start();
      return true;
    } catch (e) {
      // Mic may already be held by SpeechRecognition on some browsers; fail
      // silently — the live transcript still works, just no audio capture.
      console.warn('[voice] audio capture unavailable:', e);
      return false;
    }
  }

  async function uploadAudio(blob: Blob, durationSeconds: number) {
    if (!sessionId || !questionId) return;
    setUploadingAudio(true);
    try {
      const form = new FormData();
      form.append('file', blob, `transcript.${guessExt(blob.type)}`);
      form.append('sessionId', sessionId);
      form.append('questionId', questionId);
      form.append('durationSeconds', String(durationSeconds));
      const res = await fetch('/api/audio', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const url = `${supabaseUrl}/storage/v1/object/public/interview-audio/${json.path}`;
      onAudioUploadedRef.current?.(json.path, durationSeconds, url);
    } catch (e: any) {
      console.warn('[voice] audio upload failed:', e?.message || e);
    } finally {
      setUploadingAudio(false);
    }
  }

  const start = useCallback(async () => {
    if (!recognitionRef.current) return;
    setError(null);
    emittedFinalsRef.current = new Set();
    lastFinalTextRef.current = '';
    shouldKeepListeningRef.current = true;
    // Start audio capture FIRST (gets fresh mic permission, then starts MR).
    // SpeechRecognition uses its own mic pathway on most browsers, so the two
    // can run in parallel. If audio capture fails, transcript still works.
    if (canCaptureAudio) {
      await startAudioCapture();
    }
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setListening(true);
    }
  }, [canCaptureAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setListening(false);
    // MediaRecorder will fire its onstop and upload the captured audio
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      try { mr.stop(); } catch {}
    }
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
          <span className="muted small voice-lang">
            {listening
              ? 'Pause kar sakte ho — fir bolo, mic chalu rahega'
              : uploadingAudio
                ? 'Audio upload ho raha hai...'
                : canCaptureAudio
                  ? `Text + audio • ${lang}`
                  : `Hindi/Hinglish • ${lang}`}
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

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const m of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {}
  }
  return '';
}

function guessExt(mime: string): string {
  if (!mime) return 'webm';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
  return 'webm';
}
