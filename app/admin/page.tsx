"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { QUESTION_SETS } from '@/lib/questions';
import { CODED_ROLES } from '@/lib/roles';

// Precomputed per-role section maps so section progress is cheap to render
// for every row on every refresh. Built once at module load — admin page is
// the only consumer of QUESTION_SETS on the client, so bundle impact is
// scoped to /admin.
const SECTION_COUNTS: Record<string, Record<string, number>> = {};
const SECTION_ORDER: Record<string, string[]> = {};
const QUESTION_TO_SECTION: Record<string, Record<string, string>> = {};
for (const [roleKey, questions] of Object.entries(QUESTION_SETS)) {
  const counts: Record<string, number> = {};
  const order: string[] = [];
  const map: Record<string, string> = {};
  for (const q of questions) {
    counts[q.section] = (counts[q.section] || 0) + 1;
    if (!order.includes(q.section)) order.push(q.section);
    map[q.id] = q.section;
  }
  SECTION_COUNTS[roleKey] = counts;
  SECTION_ORDER[roleKey] = order;
  QUESTION_TO_SECTION[roleKey] = map;
}

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
  questionIds: string[];
};

type AnswerRow = {
  id: string;
  question_id: string;
  question_text: string;
  section: string;
  answer_text: string;
  audio_path: string | null;
  audio_duration_seconds: number | null;
  created_at: string;
};

type SessionDetail = {
  answers: AnswerRow[];
  summary: { summary_text: string; llm_model: string | null } | null;
  loading: boolean;
  error: string | null;
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
  const [expanded, setExpanded] = useState<Record<string, SessionDetail | undefined>>({});
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
  const [askOpen, setAskOpen] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askAnswer, setAskAnswer] = useState<{ answer: string; model: string; sourceCount: number } | null>(null);
  const [askError, setAskError] = useState<string | null>(null);
  const [sopState, setSopState] = useState<{ sessionId: string; loading: boolean; markdown: string | null; filename: string | null; suggestedPath: string | null; topic: string; model: string | null; error: string | null } | null>(null);

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

  async function deleteSession(sessionId: string, label: string) {
    const ok = typeof window !== 'undefined'
      ? window.confirm(`Delete this session?\n\n${label}\n\nThis removes the session row, all answers, the summary, and any uploaded voice notes. Cannot be undone.`)
      : false;
    if (!ok) return;
    try {
      const useKey = key.trim();
      const res = await fetch(`/api/admin/sessions/${sessionId}?key=${encodeURIComponent(useKey)}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Delete failed (${res.status})`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setStats((prev) => prev ? {
        total: prev.total - 1,
        inProgress: prev.inProgress - (sessions.find((s) => s.id === sessionId)?.status === 'in_progress' ? 1 : 0),
        completed: prev.completed - (sessions.find((s) => s.id === sessionId)?.status === 'completed' ? 1 : 0),
      } : prev);
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  }

  function openSopModal(sessionId: string) {
    setSopState({ sessionId, loading: false, markdown: null, filename: null, suggestedPath: null, topic: '', model: null, error: null });
  }

  function closeSopModal() {
    setSopState(null);
  }

  async function generateSop(sessionId: string, topic: string) {
    setSopState((prev) => prev && prev.sessionId === sessionId ? { ...prev, loading: true, error: null } : prev);
    try {
      const useKey = key.trim();
      const res = await fetch(`/api/admin/sessions/${sessionId}/sop?key=${encodeURIComponent(useKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'SOP failed');
      setSopState((prev) => prev && prev.sessionId === sessionId ? {
        ...prev,
        loading: false,
        markdown: json.markdown,
        filename: json.filename,
        suggestedPath: json.suggestedPath,
        model: json.model,
        topic: json.topic || topic,
        error: null,
      } : prev);
    } catch (e: any) {
      setSopState((prev) => prev && prev.sessionId === sessionId ? { ...prev, loading: false, error: e?.message || 'Failed' } : prev);
    }
  }

  function downloadSop() {
    if (!sopState?.markdown || !sopState?.filename) return;
    const blob = new Blob([sopState.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sopState.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function submitAskQuestion() {
    const q = askQuestion.trim();
    if (!q || askLoading) return;
    setAskLoading(true);
    setAskError(null);
    setAskAnswer(null);
    try {
      const useKey = key.trim();
      const res = await fetch(`/api/admin/ask?key=${encodeURIComponent(useKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ask failed');
      setAskAnswer({ answer: json.answer, model: json.model, sourceCount: json.sourceCount });
    } catch (e: any) {
      setAskError(e?.message || 'Ask failed');
    } finally {
      setAskLoading(false);
    }
  }

  async function regenerateSummary(sessionId: string) {
    setRegenerating((prev) => ({ ...prev, [sessionId]: true }));
    try {
      const useKey = key.trim();
      const res = await fetch(`/api/admin/sessions/${sessionId}/summarize?key=${encodeURIComponent(useKey)}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to regenerate');
      // Update the expanded detail in place so the new summary shows immediately
      setExpanded((prev) => {
        const cur = prev[sessionId];
        if (!cur) return prev;
        return {
          ...prev,
          [sessionId]: {
            ...cur,
            summary: { summary_text: json.summary, llm_model: json.model },
          },
        };
      });
    } catch (e: any) {
      setError(e?.message || 'Regenerate failed');
    } finally {
      setRegenerating((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
    }
  }

  async function toggleAnswers(sessionId: string) {
    const cur = expanded[sessionId];
    if (cur && !cur.loading && !cur.error) {
      // already loaded — just collapse
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      return;
    }
    setExpanded((prev) => ({ ...prev, [sessionId]: { answers: [], summary: null, loading: true, error: null } }));
    try {
      const useKey = key.trim();
      const res = await fetch(`/api/admin/sessions/${sessionId}?key=${encodeURIComponent(useKey)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load answers');
      setExpanded((prev) => ({
        ...prev,
        [sessionId]: { answers: json.answers || [], summary: json.summary || null, loading: false, error: null },
      }));
    } catch (e: any) {
      setExpanded((prev) => ({
        ...prev,
        [sessionId]: { answers: [], summary: null, loading: false, error: e?.message || 'Failed' },
      }));
    }
  }

  const supabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL || '' : '';
  function audioUrl(path: string | null): string | null {
    if (!path) return null;
    return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/interview-audio/${path}`;
  }

  // Per-role counts for the filter chip row, recomputed when sessions
  // change. Kept ordered with the coded-roles order first (matches the
  // landing-chooser order users would expect) then anything else.
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      counts[s.role] = (counts[s.role] || 0) + 1;
    }
    return counts;
  }, [sessions]);

  const orderedRoles = useMemo(() => {
    const codedKeys = Object.keys(CODED_ROLES);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const k of codedKeys) {
      if (roleCounts[k] !== undefined) {
        out.push(k);
        seen.add(k);
      }
    }
    for (const k of Object.keys(roleCounts)) {
      if (!seen.has(k)) out.push(k);
    }
    return out;
  }, [roleCounts]);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (roleFilter && s.role !== roleFilter) return false;
      if (q) {
        const name = (s.respondent_name || '').toLowerCase();
        const role = (s.role || '').toLowerCase();
        if (!name.includes(q) && !role.includes(q)) return false;
      }
      return true;
    });
  }, [sessions, roleFilter, query]);

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
      {sopState ? (
        <SopModal
          state={sopState}
          onGenerate={generateSop}
          onDownload={downloadSop}
          onClose={closeSopModal}
        />
      ) : null}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <strong style={{ fontSize: '1.05rem' }}>Ask LD Brain</strong>
            <p className="muted small" style={{ margin: '2px 0 0' }}>
              Query everything Nandu / Gaurav / etc. have answered so far.
            </p>
          </div>
          <button className="btn secondary" onClick={() => setAskOpen((v) => !v)}>
            {askOpen ? 'Close' : 'Open'}
          </button>
        </div>
        {askOpen ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <textarea
              className="textarea"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              placeholder="e.g. What does Nandu do when Banding appears? OR Who supplies Korean paper? OR Which sections of the form does Nandu skip most?"
              style={{ minHeight: 70 }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitAskQuestion();
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="muted small">Tip: Cmd/Ctrl + Enter to send</span>
              <button
                className="btn"
                onClick={submitAskQuestion}
                disabled={askLoading || !askQuestion.trim()}
                style={{ minWidth: 140 }}
              >
                {askLoading ? 'Asking…' : 'Ask'}
              </button>
            </div>
            {askError ? <p className="voice-error" style={{ margin: 0 }}>{askError}</p> : null}
            {askAnswer ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-line)',
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  Answer · {askAnswer.model} · {askAnswer.sourceCount} session{askAnswer.sourceCount === 1 ? '' : 's'} in context
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.55 }}>
                  {askAnswer.answer}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="card grid" style={{ gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <FilterChip
            label={`All (${sessions.length})`}
            active={roleFilter === null}
            onClick={() => setRoleFilter(null)}
          />
          {orderedRoles.map((roleKey) => {
            const meta = CODED_ROLES[roleKey];
            const label = meta?.label || roleKey;
            return (
              <FilterChip
                key={roleKey}
                label={`${label} (${roleCounts[roleKey]})`}
                active={roleFilter === roleKey}
                onClick={() => setRoleFilter(roleKey)}
              />
            );
          })}
          <div style={{ marginLeft: 'auto', minWidth: 220, flex: 1, maxWidth: 360 }}>
            <input
              className="input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by respondent name…"
              style={{ padding: '10px 14px' }}
            />
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <p className="muted">
            {sessions.length === 0
              ? 'No sessions yet.'
              : 'No sessions match the current filter.'}
          </p>
        ) : (
          filteredSessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              origin={origin}
              onCopyResume={copyResumeUrl}
              copied={copiedId === s.id}
              detail={expanded[s.id]}
              onToggleAnswers={toggleAnswers}
              onDelete={deleteSession}
              onRegenerate={regenerateSummary}
              regenerating={Boolean(regenerating[s.id])}
              onOpenSop={openSopModal}
              audioUrl={audioUrl}
            />
          ))
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
  detail,
  onToggleAnswers,
  onDelete,
  onRegenerate,
  regenerating,
  onOpenSop,
  audioUrl,
}: {
  session: Session;
  origin: string;
  onCopyResume: (id: string) => void;
  copied: boolean;
  detail: SessionDetail | undefined;
  onToggleAnswers: (id: string) => void;
  onDelete: (id: string, label: string) => void;
  onRegenerate: (id: string) => void;
  regenerating: boolean;
  onOpenSop: (id: string) => void;
  audioUrl: (path: string | null) => string | null;
}) {
  const pct = session.totalQuestions ? Math.round((session.answeredCount / session.totalQuestions) * 100) : 0;
  const isInProgress = session.status === 'in_progress';
  const isCompleted = session.status === 'completed';
  const exportUrl = `/api/export/${session.id}`;
  const isExpanded = Boolean(detail);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="muted small" style={{ fontFamily: 'ui-monospace, monospace' }}>
            {session.id.slice(0, 8)}…
          </span>
          <button
            type="button"
            className="admin-x"
            onClick={() => onDelete(session.id, `${session.respondent_name || '(no name)'} · ${session.role} · ${session.answeredCount} answered`)}
            aria-label="Delete session"
            title="Delete this session and all its answers / voice notes"
          >
            ×
          </button>
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
        <span>Active duration: {durationLabel(session.started_at, session.completed_at || session.lastAnswerAt)}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          className="btn secondary"
          onClick={() => onToggleAnswers(session.id)}
          disabled={session.answeredCount === 0}
          title={session.answeredCount === 0 ? 'No answers yet' : ''}
        >
          {isExpanded ? 'Hide answers' : `View ${session.answeredCount} answer${session.answeredCount === 1 ? '' : 's'}`}
        </button>
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
        {session.answeredCount > 0 ? (
          <button className="btn secondary" onClick={() => onOpenSop(session.id)}>
            Generate SOP
          </button>
        ) : null}
      </div>

      {isExpanded && detail ? (
        <div
          style={{
            marginTop: 8,
            padding: 14,
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'grid',
            gap: 12,
          }}
        >
          {detail.loading ? (
            <p className="muted small" style={{ margin: 0 }}>Loading answers…</p>
          ) : detail.error ? (
            <p className="voice-error" style={{ margin: 0 }}>{detail.error}</p>
          ) : (
            <>
              <SectionProgress
                role={session.role}
                answeredIds={session.questionIds || []}
              />

              {detail.summary?.summary_text ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-line)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <div className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      LLM Summary
                      {detail.summary.llm_model ? <span style={{ marginLeft: 6, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>· {detail.summary.llm_model}</span> : null}
                    </div>
                    <button
                      className="btn secondary"
                      onClick={() => onRegenerate(session.id)}
                      disabled={regenerating}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      {regenerating ? 'Regenerating…' : 'Regenerate'}
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize: '0.92rem', lineHeight: 1.55 }}>
                    {detail.summary.summary_text}
                  </pre>
                </div>
              ) : isCompleted && session.answeredCount > 0 ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'var(--warm-soft)',
                    border: '1px solid #f0d6a8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Summary missing</div>
                    <div className="muted small" style={{ marginTop: 2 }}>
                      Background job may have failed (free-tier 429s happen). Re-run the LLM call here.
                    </div>
                  </div>
                  <button
                    className="btn"
                    onClick={() => onRegenerate(session.id)}
                    disabled={regenerating}
                    style={{ padding: '8px 16px' }}
                  >
                    {regenerating ? 'Generating…' : 'Generate summary'}
                  </button>
                </div>
              ) : null}

              {detail.answers.length === 0 ? (
                <p className="muted small" style={{ margin: 0 }}>No answers yet.</p>
              ) : (
                detail.answers.map((a) => <AnswerCard key={a.id} answer={a} audioUrl={audioUrl} />)
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AnswerCard({
  answer,
  audioUrl,
}: {
  answer: AnswerRow;
  audioUrl: (path: string | null) => string | null;
}) {
  const url = audioUrl(answer.audio_path);
  const isSkipped = (answer.answer_text || '').trim().toLowerCase().startsWith('(skipped');
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background: isSkipped ? 'var(--warm-soft)' : 'var(--surface-2)',
        border: `1px solid ${isSkipped ? '#f0d6a8' : 'var(--border)'}`,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          {answer.question_id} · {answer.section}
        </div>
        {isSkipped ? (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--warm)',
              color: 'var(--text-inverse)',
            }}
          >
            Skipped
          </span>
        ) : null}
      </div>
      <div style={{ fontWeight: 600, lineHeight: 1.5 }}>{answer.question_text}</div>
      {answer.answer_text ? (
        <div
          style={{
            padding: '8px 12px',
            borderLeft: `3px solid ${isSkipped ? 'var(--warm)' : 'var(--accent)'}`,
            background: isSkipped ? 'rgba(180, 83, 9, 0.06)' : 'rgba(11, 110, 90, 0.05)',
            borderRadius: 6,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
            fontStyle: isSkipped ? 'italic' : 'normal',
            color: isSkipped ? 'var(--text-2)' : 'var(--text)',
          }}
        >
          {isSkipped ? 'Respondent skipped this — follow up needed.' : answer.answer_text}
        </div>
      ) : (
        <em className="muted small">(no text answer)</em>
      )}
      {url ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <audio controls src={url} preload="none" style={{ flex: 1, minWidth: 220, height: 36 }} />
          {answer.audio_duration_seconds ? (
            <span className="muted small">{answer.audio_duration_seconds}s voice note</span>
          ) : null}
        </div>
      ) : null}
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

function SopModal({
  state,
  onGenerate,
  onDownload,
  onClose,
}: {
  state: {
    sessionId: string;
    loading: boolean;
    markdown: string | null;
    filename: string | null;
    suggestedPath: string | null;
    topic: string;
    model: string | null;
    error: string | null;
  };
  onGenerate: (sessionId: string, topic: string) => void;
  onDownload: () => void;
  onClose: () => void;
}) {
  const [topic, setTopic] = useState(state.topic || '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function copyToClipboard() {
    if (!state.markdown) return;
    try {
      await navigator.clipboard.writeText(state.markdown);
    } catch {}
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-card"
        style={{ maxWidth: 780, textAlign: 'left', padding: 24 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <h2 className="h2" style={{ margin: 0 }}>Generate SOP</h2>
          <button className="admin-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <p className="muted small" style={{ marginTop: 0 }}>
          Pick a topic (or leave blank for the strongest auto-picked SOP), then generate. Output is markdown you can paste into <code>LD-Brain-main/&lt;Company&gt;/dynamic/</code>.
        </p>

        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Morning Production Routine · Defect Diagnosis · KATA Process"
            style={{ flex: 1, minWidth: 240, padding: '10px 14px' }}
          />
          <button
            className="btn"
            onClick={() => onGenerate(state.sessionId, topic)}
            disabled={state.loading}
            style={{ minWidth: 140 }}
          >
            {state.loading ? 'Generating…' : state.markdown ? 'Regenerate' : 'Generate'}
          </button>
        </div>

        {state.error ? <p className="voice-error" style={{ margin: 0 }}>{state.error}</p> : null}

        {state.markdown ? (
          <>
            <div className="muted small" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span>Topic: {state.topic}{state.model ? ` · ${state.model}` : ''}</span>
              {state.suggestedPath ? <span>Suggested path: <code>{state.suggestedPath}</code></span> : null}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button className="btn secondary" onClick={copyToClipboard} style={{ padding: '8px 14px' }}>Copy markdown</button>
              <button className="btn" onClick={onDownload} style={{ padding: '8px 14px' }}>Download .md</button>
            </div>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                margin: 0,
                padding: 14,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                maxHeight: 420,
                overflow: 'auto',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                lineHeight: 1.55,
              }}
            >
              {state.markdown}
            </pre>
          </>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '6px 14px',
        borderRadius: 999,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? 'var(--text-inverse)' : 'var(--text)',
        fontSize: '0.85rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

function SectionProgress({
  role,
  answeredIds,
}: {
  role: string;
  answeredIds: string[];
}) {
  const totals = SECTION_COUNTS[role];
  const order = SECTION_ORDER[role];
  const map = QUESTION_TO_SECTION[role];
  if (!totals || !order || !map) return null;

  const answeredBySection: Record<string, number> = {};
  for (const qid of answeredIds) {
    const sec = map[qid];
    if (sec) answeredBySection[sec] = (answeredBySection[sec] || 0) + 1;
  }

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 10,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="muted small" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: 8 }}>
        Section progress
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {order.map((section) => {
          const answered = answeredBySection[section] || 0;
          const total = totals[section] || 0;
          const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
          const done = total > 0 && answered === total;
          return (
            <div
              key={section}
              style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {section}
                  </span>
                  <span className="muted" style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {answered}/{total}
                    {done ? ' ✓' : ''}
                  </span>
                </div>
                <div className="progress" style={{ height: 5, marginTop: 4 }}>
                  <div style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function durationLabel(startedAt: string, endAt: string | null): string {
  if (!endAt) return '—';
  const ms = new Date(endAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 60_000) return '<1 min';
  const totalMin = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}m`;
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
