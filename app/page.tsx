"use client";

import { useEffect, useMemo, useState } from 'react';
import { QUESTION_SETS } from '@/lib/questions';
import type { InterviewRole, Question } from '@/lib/types';
import { VoiceTextarea } from '@/app/components/VoiceTextarea';
import { VoiceRecorder } from '@/app/components/VoiceRecorder';

type CompletionState = {
  summary: string;
  model?: string;
  themes?: string[];
};

type ResumeOption = {
  sessionId: string;
  role: InterviewRole;
  respondentName: string | null;
  answeredCount: number;
  startedAt: string;
};

const STORAGE_KEY = 'nandu_session_id';

export default function Page() {
  const [role, setRole] = useState<InterviewRole | null>(null);
  const [respondentName, setRespondentName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Ready to start');
  const [textValue, setTextValue] = useState('');
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [completion, setCompletion] = useState<CompletionState | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<Array<{ questionId: string; answer: string; audioUrl?: string | null; audioDurationSeconds?: number | null }>>([]);
  const [resumeOption, setResumeOption] = useState<ResumeOption | null>(null);
  const [resumeChecked, setResumeChecked] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number | null>(null);

  const questions = useMemo(() => (role ? QUESTION_SETS[role] : []), [role]);
  const current: Question | undefined = questions[index];
  const progress = questions.length ? Math.round((index / questions.length) * 100) : 0;

  useEffect(() => {
    setTextValue('');
    setMultiValue([]);
    setAudioPath(null);
    setAudioUrl(null);
    setAudioDurationSeconds(null);
  }, [index, role]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedId = window.localStorage.getItem(STORAGE_KEY);
    if (!storedId) {
      setResumeChecked(true);
      return;
    }
    fetch(`/api/sessions/${storedId}`)
      .then(async (res) => {
        if (!res.ok) {
          window.localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.session) return;
        if (data.session.status === 'in_progress') {
          setResumeOption({
            sessionId: data.session.id,
            role: data.session.role,
            respondentName: data.session.respondent_name,
            answeredCount: Array.isArray(data.answeredQuestionIds) ? data.answeredQuestionIds.length : 0,
            startedAt: data.session.started_at,
          });
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {
        // network error — let the user start fresh
      })
      .finally(() => setResumeChecked(true));
  }, []);

  async function startSession(selectedRole: InterviewRole) {
    setBusy(true);
    setStatus('Creating session...');
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, respondentName }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to start session');
      const newId = json.session.id;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, newId);
      }
      setRole(selectedRole);
      setSessionId(newId);
      setIndex(0);
      setStatus('Session started');
      setCompletion(null);
      setSavedAnswers([]);
      setResumeOption(null);
    } catch (err: any) {
      setStatus(err.message || 'Failed to start');
    } finally {
      setBusy(false);
    }
  }

  function resumeSession() {
    if (!resumeOption) return;
    setRole(resumeOption.role);
    setSessionId(resumeOption.sessionId);
    setIndex(resumeOption.answeredCount);
    setStatus(`Resumed from question ${resumeOption.answeredCount + 1}`);
    setCompletion(null);
    setSavedAnswers([]);
    setResumeOption(null);
  }

  function discardResume() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setResumeOption(null);
  }

  async function saveAndNext(answer: string | string[]) {
    if (!current || !sessionId) return;
    setBusy(true);
    setStatus('Saving answer...');
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: current.id,
          questionText: current.prompt,
          section: current.section,
          answer,
          audioPath,
          audioDurationSeconds,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to save answer');
      setSavedAnswers((prev) => [
        ...prev,
        {
          questionId: current.id,
          answer: Array.isArray(answer) ? answer.join(' | ') : answer,
          audioUrl,
          audioDurationSeconds,
        },
      ]);

      if (index + 1 >= questions.length) {
        setStatus('Generating LLM summary...');
        const done = await fetch('/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const doneJson = await done.json();
        if (!done.ok) throw new Error(doneJson.error || 'Failed to complete session');
        setCompletion({ summary: doneJson.summary, model: doneJson.model, themes: doneJson.themes });
        setStatus('Session completed');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        setIndex((v) => v + 1);
        setStatus('Answer saved');
      }
    } catch (err: any) {
      setStatus(err.message || 'Failed to save answer');
    } finally {
      setBusy(false);
    }
  }

  function toggleMulti(option: string) {
    setMultiValue((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  if (!role) {
    return (
      <main className="container">
        <section className="hero">
          <div className="card grid" style={{ gap: 18 }}>
            <span className="pill">LD Brain • Supabase • Vercel • LLM</span>
            <h1 className="h1">Nandu Web App Form</h1>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              A high-tech interview system for Nandu Bhai. It captures answers one by one in Hinglish (type or speak),
              stores them in Supabase, and uses an LLM to generate summaries and SOP-ready knowledge.
            </p>
            <div className="grid-2">
              <div className="card" style={{ background: 'rgba(37,99,235,0.10)' }}>
                <strong>Voice-first capture</strong>
                <p className="muted small">Bolo, mat type karo. Hindi/English mix bhi chalega.</p>
              </div>
              <div className="card" style={{ background: 'rgba(124,58,237,0.10)' }}>
                <strong>Resume anytime</strong>
                <p className="muted small">Beech mein band karoge to wahi se shuru hoga (same device).</p>
              </div>
            </div>
          </div>

          <div className="card grid" style={{ gap: 16 }}>
            {resumeChecked && resumeOption ? (
              <div className="card" style={{ background: 'rgba(6,182,212,0.10)', border: '1px solid rgba(34,211,238,0.35)' }}>
                <h2 className="h2" style={{ marginBottom: 8 }}>Pichla session mila</h2>
                <p className="muted small" style={{ marginTop: 0 }}>
                  {resumeOption.respondentName ? `${resumeOption.respondentName} — ` : ''}
                  {resumeOption.answeredCount} answers saved. Started {new Date(resumeOption.startedAt).toLocaleString()}.
                </p>
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <button className="btn" disabled={busy} onClick={resumeSession}>
                    Resume from Q{resumeOption.answeredCount + 1}
                  </button>
                  <button className="btn secondary" disabled={busy} onClick={discardResume}>
                    Start new
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="h2">Start a session</h2>
                <label className="grid" style={{ gap: 8 }}>
                  <span className="muted small">Respondent name</span>
                  <input
                    className="input"
                    placeholder="Nandu Bhai"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                  />
                </label>

                <div className="grid" style={{ gap: 10 }}>
                  <button className="btn" disabled={busy} onClick={() => startSession('nandu')}>
                    Start Nandu Flow
                  </button>
                </div>
                <p className="muted small">{status}</p>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  const displayAnswer = current?.type === 'checkbox' ? multiValue : textValue;
  const canContinue = current
    ? current.type === 'checkbox'
      ? multiValue.length > 0
      : textValue.trim().length > 0
    : false;

  return (
    <main className="container grid" style={{ gap: 18 }}>
      <div className="card grid" style={{ gap: 12 }}>
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="pill">Session #{sessionId.slice(0, 8)} • {role.toUpperCase()}</span>
            <h1 className="h2" style={{ marginTop: 12 }}>{current?.section}</h1>
          </div>
          <div style={{ justifySelf: 'end', minWidth: 240, width: '100%' }}>
            <div className="progress"><div style={{ width: `${progress}%` }} /></div>
            <p className="muted small" style={{ marginTop: 8 }}>{index + 1} of {questions.length} questions</p>
          </div>
        </div>
        <p className="question-prompt">{current?.prompt}</p>
      </div>

      <div className="question-layout">
        <section className="card grid" style={{ gap: 14 }}>
          {current?.type === 'textarea' || current?.type === 'text' ? (
            <VoiceTextarea value={textValue} onChange={setTextValue} disabled={busy} />
          ) : null}

          {current?.type === 'radio' && current.options ? (
            <div className="grid" style={{ gap: 10 }}>
              {current.options.map((option) => (
                <label key={option} className="option">
                  <input type="radio" name={current.id} checked={textValue === option} onChange={() => setTextValue(option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : null}

          {current?.type === 'checkbox' && current.options ? (
            <div className="grid" style={{ gap: 10 }}>
              {current.options.map((option) => (
                <label key={option} className="option">
                  <input type="checkbox" checked={multiValue.includes(option)} onChange={() => toggleMulti(option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : null}

          {current && sessionId ? (
            <VoiceRecorder
              sessionId={sessionId}
              questionId={current.id}
              audioPath={audioPath}
              audioUrl={audioUrl}
              onUploaded={(path, durationSeconds, url) => {
                setAudioPath(path);
                setAudioUrl(url);
                setAudioDurationSeconds(durationSeconds);
              }}
              onCleared={() => {
                setAudioPath(null);
                setAudioUrl(null);
                setAudioDurationSeconds(null);
              }}
              disabled={busy}
            />
          ) : null}

          <div className="grid-2">
            <button className="btn secondary" disabled={busy || index === 0} onClick={() => setIndex((v) => Math.max(0, v - 1))}>Back</button>
            <button className="btn" disabled={busy || !canContinue} onClick={() => saveAndNext(displayAnswer)}>Save &amp; Continue</button>
          </div>

          <p className="muted small">{status}</p>
        </section>

        <aside className="card grid" style={{ gap: 14 }}>
          <h2 className="h2">Saved answers</h2>
          <div className="answer-list">
            {savedAnswers.slice(-5).map((item) => (
              <div key={item.questionId} className="answer-item">
                <div className="muted small">{item.questionId}{item.audioDurationSeconds ? ` • voice note ${item.audioDurationSeconds}s` : ''}</div>
                <div>{item.answer}</div>
                {item.audioUrl ? (
                  <audio controls src={item.audioUrl} preload="none" className="recorder-audio" />
                ) : null}
              </div>
            ))}
            {savedAnswers.length === 0 ? <p className="muted small">No answers saved yet.</p> : null}
          </div>

          {completion ? (
            <div className="card" style={{ background: 'rgba(6,182,212,0.08)' }}>
              <h3 style={{ marginTop: 0 }}>LLM Summary</h3>
              <p className="small muted">Model: {completion.model || 'unknown'}</p>
              <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{completion.summary}</pre>
              {sessionId ? (
                <a
                  className="btn"
                  href={`/api/export/${sessionId}`}
                  style={{ marginTop: 14, display: 'inline-flex', textDecoration: 'none', justifyContent: 'center' }}
                  download
                >
                  Download for LD-Brain (.md)
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
