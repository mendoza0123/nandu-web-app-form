"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 180; // 3 minutes

type Props = {
  sessionId: string;
  questionId: string;
  audioPath: string | null;
  audioUrl: string | null;
  onUploaded: (audioPath: string, durationSeconds: number, audioUrl: string) => void;
  onCleared: () => void;
  disabled?: boolean;
};

type RecorderState = 'idle' | 'recording' | 'uploading' | 'saved' | 'error';

export function VoiceRecorder({
  sessionId,
  questionId,
  audioPath,
  audioUrl,
  onUploaded,
  onCleared,
  disabled = false,
}: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [state, setState] = useState<RecorderState>(audioPath ? 'saved' : 'idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Reset when the question changes
  useEffect(() => {
    setState(audioPath ? 'saved' : 'idle');
    setElapsed(0);
    setError(null);
  }, [questionId, audioPath]);

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  const handleStop = useCallback(async () => {
    const blob = new Blob(chunksRef.current, {
      type: chunksRef.current[0]?.type || 'audio/webm',
    });
    chunksRef.current = [];
    stopStream();
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

    if (blob.size === 0) {
      setState('idle');
      setElapsed(0);
      setError('Recording empty — try again.');
      return;
    }

    setState('uploading');
    setError(null);
    try {
      const form = new FormData();
      form.append('file', blob, `note.${guessExt(blob.type)}`);
      form.append('sessionId', sessionId);
      form.append('questionId', questionId);
      form.append('durationSeconds', String(duration));

      const res = await fetch('/api/audio', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const url = `${supabaseUrl}/storage/v1/object/public/interview-audio/${json.path}`;
      onUploaded(json.path, duration, url);
      setState('saved');
      setElapsed(0);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
      setState('error');
    }
  }, [onUploaded, questionId, sessionId]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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
      setState('recording');

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
      setState('error');
    }
  }, [handleStop]);

  const stop = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      try {
        mr.stop();
      } catch {}
    }
  }, []);

  const clear = useCallback(() => {
    setState('idle');
    setElapsed(0);
    setError(null);
    onCleared();
  }, [onCleared]);

  if (supported === false) {
    return (
      <p className="muted small">Voice notes need a modern browser with mic access (Chrome / Safari).</p>
    );
  }
  if (supported === null) {
    return null; // brief mount tick
  }

  return (
    <div className="recorder-wrap">
      {state === 'idle' && (
        <button
          type="button"
          className="btn secondary recorder-btn"
          onClick={start}
          disabled={disabled}
        >
          <DotIcon />
          <span>Add voice note (optional)</span>
        </button>
      )}

      {state === 'recording' && (
        <div className="recorder-recording">
          <button
            type="button"
            className="btn recorder-btn recorder-stop"
            onClick={stop}
            disabled={disabled}
          >
            <SquareIcon />
            <span>Stop recording</span>
          </button>
          <div className="recorder-meter">
            <span className="recorder-blink" aria-hidden="true" />
            <span className="recorder-time">{formatTime(elapsed)} / {formatTime(MAX_SECONDS)}</span>
          </div>
          <div className="recorder-bar">
            <div style={{ width: `${Math.min(100, (elapsed / MAX_SECONDS) * 100)}%` }} />
          </div>
        </div>
      )}

      {state === 'uploading' && (
        <p className="muted small">Uploading voice note...</p>
      )}

      {state === 'saved' && audioUrl && (
        <div className="recorder-saved">
          <audio controls src={audioUrl} preload="metadata" className="recorder-audio" />
          <button
            type="button"
            className="btn secondary recorder-btn"
            onClick={clear}
            disabled={disabled}
          >
            Re-record
          </button>
        </div>
      )}

      {error && <p className="voice-error">{error}</p>}
      {state === 'error' && (
        <button
          type="button"
          className="btn secondary recorder-btn"
          onClick={() => {
            setError(null);
            setState('idle');
          }}
          disabled={disabled}
        >
          Try again
        </button>
      )}
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function guessExt(mime: string): string {
  if (!mime) return 'webm';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
  return 'webm';
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

function DotIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
