"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  /** UI label only — Whisper backend is always 'hi' then transliterated to Hinglish. */
  lang?: string;
  disabled?: boolean;
  /** Required for Whisper upload. If absent, the mic button is hidden. */
  sessionId?: string;
  questionId?: string;
  /**
   * Fired once /api/audio responds. Parent stores the audio_path so admin
   * can replay what Whisper transcribed, and audioTranscript so the answer
   * row carries the spoken Hinglish text too.
   */
  onAudioUploaded?: (audioPath: string, durationSeconds: number, audioUrl: string, transcript: string) => void;
};

type Phase = 'idle' | 'recording' | 'transcribing' | 'error';

const MAX_SECONDS = 180; // 3 minutes — same cap as VoiceRecorder

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
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const onAudioUploadedRef = useRef(onAudioUploaded);

  onChangeRef.current = onChange;
  onAudioUploadedRef.current = onAudioUploaded;

  const canRecord = Boolean(sessionId && questionId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok =
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
      typeof window.MediaRecorder !== 'undefined';
    setSupported(ok);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      stopStream();
    };
  }, []);

  function stopStream() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }

  const handleStop = useCallback(async () => {
    const chunks = chunksRef.current;
    chunksRef.current = [];
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopStream();
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    if (chunks.length === 0) {
      setPhase('idle');
      setElapsed(0);
      return;
    }
    const blob = new Blob(chunks, { type: chunks[0].type || 'audio/webm' });
    if (blob.size < 1024) {
      setPhase('idle');
      setElapsed(0);
      return;
    }
    if (!sessionId || !questionId) {
      setPhase('idle');
      setElapsed(0);
      return;
    }

    setPhase('transcribing');
    try {
      const form = new FormData();
      form.append('file', blob, `bolo.${guessExt(blob.type)}`);
      form.append('sessionId', sessionId);
      form.append('questionId', questionId);
      form.append('durationSeconds', String(duration));
      const res = await fetch('/api/audio', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      const transcript = String(json.transcript || '').trim();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const url = `${supabaseUrl}/storage/v1/object/public/interview-audio/${json.path}`;
      if (transcript) {
        // Append to whatever's already in the textarea, so typed-then-spoken
        // and multi-press additive flows both work.
        onChangeRef.current((prev) => {
          if (!prev || !prev.trim()) return transcript;
          const sep = /[\s।!?.,]$/.test(prev) ? '' : ' ';
          return prev + sep + transcript;
        });
      }
      onAudioUploadedRef.current?.(json.path, duration, url, transcript);
      setPhase('idle');
      setElapsed(0);
    } catch (e: any) {
      console.warn('[bolo] transcribe failed:', e?.message || e);
      setError(e?.message || 'Transcription failed — try again.');
      setPhase('error');
    }
  }, [questionId, sessionId]);

  const start = useCallback(async () => {
    setError(null);
    if (!canRecord) {
      setError('Recording is not configured for this question.');
      setPhase('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = pickMimeType();
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        handleStop();
      };

      mr.start();
      startedAtRef.current = Date.now();
      setElapsed(0);
      setPhase('recording');

      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsed(seconds);
        if (seconds >= MAX_SECONDS) {
          try {
            mr.stop();
          } catch {}
        }
      }, 200);
    } catch (e: any) {
      const code = e?.name || 'unknown';
      if (code === 'NotAllowedError' || code === 'SecurityError') {
        setError('Mic permission denied. Browser settings mein allow karo.');
      } else if (code === 'NotFoundError' || code === 'OverconstrainedError') {
        setError('Koi mic nahi mila device pe.');
      } else {
        setError(`Mic error: ${e?.message || code}`);
      }
      setPhase('error');
    }
  }, [canRecord, handleStop]);

  const stop = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      try {
        mr.stop();
      } catch {}
    }
  }, []);

  return (
    <div className="voice-wrap">
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={phase === 'recording' ? 'Sun raha hoon... bolte raho' : placeholder}
        disabled={disabled}
      />

      {supported === true && canRecord && (
        <div className="voice-controls">
          {phase === 'idle' || phase === 'error' ? (
            <button
              type="button"
              className="mic-btn"
              onClick={start}
              disabled={disabled}
              aria-label="Start recording"
            >
              <MicIcon />
              <span>Bolo (Speak)</span>
            </button>
          ) : null}
          {phase === 'recording' ? (
            <button
              type="button"
              className="mic-btn mic-listening"
              onClick={stop}
              disabled={disabled}
              aria-pressed="true"
              aria-label="Stop recording"
            >
              <MicIcon />
              <span>Stop · {formatTime(elapsed)} / {formatTime(MAX_SECONDS)}</span>
            </button>
          ) : null}
          {phase === 'transcribing' ? (
            <button type="button" className="mic-btn" disabled>
              <Spinner />
              <span>Transcribing…</span>
            </button>
          ) : null}
          <span className="muted small voice-lang">
            {phase === 'recording'
              ? 'Pause kar sakte ho — Stop dabake transcribe ho jayega'
              : phase === 'transcribing'
                ? 'Whisper text bana raha hai (Hinglish)…'
                : `Whisper (Hindi → Hinglish) · ${lang}`}
          </span>
        </div>
      )}

      {supported === true && !canRecord && (
        <p className="muted small">Mic input becomes available once the session is started.</p>
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

function Spinner() {
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
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
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
