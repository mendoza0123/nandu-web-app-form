"use client";

import { useCallback, useEffect, useState } from 'react';

type Session = {
  id: string;
  role: string;
  respondent_name: string | null;
  company: string | null;
  status: 'in_progress' | 'completed' | string;
  started_at: string;
  completed_at: string | null;
  answeredCount: number;
  totalQuestions: number | null;
  lastAnswerAt: string | null;
};

type Stats = {
  total: number;
  inProgress: number;
  completed: number;
};

export default function AdminPage() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Read ?key= from URL on first load + remember origin for resume URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOrigin(window.location.origin);
    const url = new URL(window.location.href);
    const k = url.searchParams.get('key') || window.sessionStorage.getItem('admin_key') || '';
    if (k) {
      setKey(k);
      load(k);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async (keyOverride?: string) => {
    const useKey = (keyOverride ?? key).trim();
    if (!useKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/sessions?key=${encodeURIComponent(useKey)}`);
      const json = await res.json();
      if (!res.ok) {
        setAuthed(false);
        throw new Error(json.error || 'Failed to load');
      }
      setAuthed(true);
      setSessions(json.sessions || []);
      setStats(json.stats || null);
      if (typeof window !== 'undefined') window.sessionStorage.setItem('admin_key', useKey);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [key]);

  async function copyResumeUrl(sessionId: string) {
    const url = `${origin}/?resume=${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(sessionId);
      setTimeout(() => setCopiedId((cur) => (cur === sessionId ? null : cur)), 2000);
    } catch {
      window.prompt('Copy this URL and send to Nandu:', url);
    }
  }

  if (!authed) {
    return (
      <main className="container">
        <section className="card grid" style={{ gap: 16, maxWidth: 460, margin: '60px auto' }}>
          <h1 className="h2" style={{ margin: 0 }}>LD Brain Admin</h1>
          <p className="muted small" style={{ margin: 0 }}>
            Enter the admin passcode to view all sessions.
          </p>
          <input
            className="input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin passcode"
            onKeyDown={(e) => {
              if (e.key === 'Enter') load();
            }}
            autoFocus
          />
          <button className="btn" onClick={() => load()} disabled={loading || !key.trim()}>
            {loading ? 'Loading...' : 'Unlock'}
          </button>
          {error ? <p className="voice-error" style={{ margin: 0 }}>{error}</p> : null}
          <p className="muted small" style={{ margin: 0 }}>
            Hint: passcode is the <code>ADMIN_PASSCODE</code> env var on Vercel.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="container grid" style={{ gap: 18 }}>
      <div className="card grid" style={{ gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span className="pill">LD Brain · Admin</span>
          <h1 className="h2" style={{ margin: 0 }}>All sessions</h1>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn secondary" onClick={() => load()} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        {stats ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatChip label="Total" value={stats.total} />
            <StatChip label="In progress" value={stats.inProgress} tone="warm" />
            <StatChip label="Completed" value={stats.completed} tone="accent" />
          </div>
        ) : null}
        {error ? <p className="voice-error" style={{ margin: 0 }}>{error}</p> : null}
      </div>

      <div className="card grid" style={{ gap: 12 }}>
        {sessions.length === 0 ? (
          <p className="muted">No sessions yet.</p>
        ) : (
          sessions.map((s) => <SessionRow key={s.id} session={s} origin={origin} onCopyResume={copyResumeUrl} copied={copiedId === s.id} />)
        )}
      </div>
    </main>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone?: 'warm' | 'accent' }) {
  const bg = tone === 'warm' ? 'var(--warm-soft)' : tone === 'accent' ? 'var(--accent-soft)' : 'var(--surface-2)';
  const color = tone === 'warm' ? 'var(--warm)' : tone === 'accent' ? 'var(--accent-hover)' : 'var(--text-2)';
  return (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: 14,
        background: bg,
        border: '1px solid var(--border)',
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function SessionRow({
  session,
  origin,
  onCopyResume,
  copied,
}: {
  session: Session;
  origin: string;
  onCopyResume: (id: string) => void;
  copied: boolean;
}) {
  const pct = session.totalQuestions ? Math.round((session.answeredCount / session.totalQuestions) * 100) : 0;
  const isInProgress = session.status === 'in_progress';
  const isCompleted = session.status === 'completed';
  const exportUrl = `/api/export/${session.id}`;
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: '1.05rem' }}>{session.respondent_name || '(no name)'}</strong>
          <span className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            {session.role}
          </span>
          <StatusPill status={session.status} />
        </div>
        <div className="muted small" style={{ fontFamily: 'ui-monospace, monospace' }}>
          {session.id.slice(0, 8)}…
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 200, flex: 1 }}>
          <div className="progress"><div style={{ width: `${pct}%` }} /></div>
        </div>
        <span className="muted small" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {session.answeredCount}{session.totalQuestions ? ` / ${session.totalQuestions}` : ''} answered · {pct}%
        </span>
      </div>

      <div className="muted small" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Started: {fmt(session.started_at)}</span>
        {session.lastAnswerAt ? <span>Last answer: {fmt(session.lastAnswerAt)} ({timeAgo(session.lastAnswerAt)})</span> : <span>No answers yet</span>}
        {isCompleted && session.completed_at ? <span>Completed: {fmt(session.completed_at)}</span> : null}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {isInProgress ? (
          <button className="btn secondary" onClick={() => onCopyResume(session.id)}>
            {copied ? 'Copied!' : 'Copy resume URL'}
          </button>
        ) : null}
        {isCompleted ? (
          <a className="btn secondary" href={exportUrl} download>
            Download .md
          </a>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === 'in_progress') {
    return (
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '4px 10px',
          borderRadius: 999,
          background: 'var(--warm-soft)',
          color: 'var(--warm)',
          border: '1px solid #f0d6a8',
        }}
      >
        In progress
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '4px 10px',
          borderRadius: 999,
          background: 'var(--accent-soft)',
          color: 'var(--accent-hover)',
          border: '1px solid var(--accent-line)',
        }}
      >
        Completed
      </span>
    );
  }
  return (
    <span className="pill" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', borderColor: 'var(--border)' }}>
      {status}
    </span>
  );
}

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(diff) || diff < 0) return '';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
