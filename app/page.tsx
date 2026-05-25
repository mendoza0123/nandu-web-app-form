"use client";

import { useEffect, useMemo, useState } from 'react';
import { QUESTION_SETS } from '@/lib/questions';
import { listLandingRoles } from '@/lib/roles';
import type { InterviewRole, PromptLang, Question } from '@/lib/types';
import { VoiceTextarea } from '@/app/components/VoiceTextarea';
import { VoiceRecorder } from '@/app/components/VoiceRecorder';
import { CompletionModal } from '@/app/components/CompletionModal';

type CompletionState = {
  thanks: true;
};

type ResumeOption = {
  sessionId: string;
  role: InterviewRole;
  respondentName: string | null;
  answeredCount: number;
  startedAt: string;
};

const STORAGE_KEY = 'nandu_session_id';
const LANG_KEY = 'nandu_prompt_lang';
// Bumped whenever lib/questions.ts changes shape/content in a way that
// invalidates stored sessions. Stale sessions on a previous schema are
// abandoned (the rows stay in Supabase but the UI starts fresh).
const QUESTION_SET_VERSION = 'v3';
const QUESTION_SET_VERSION_KEY = 'nandu_question_set_version';

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
  const [notesValue, setNotesValue] = useState('');
  const [lang, setLang] = useState<PromptLang>('en');

  const questions = useMemo(() => (role ? QUESTION_SETS[role] : []), [role]);
  const current: Question | undefined = questions[index];
  const progress = questions.length ? Math.round((index / questions.length) * 100) : 0;

  useEffect(() => {
    setTextValue('');
    setMultiValue([]);
    setAudioPath(null);
    setAudioUrl(null);
    setAudioDurationSeconds(null);
    setNotesValue('');
  }, [index, role]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLang = window.localStorage.getItem(LANG_KEY);
    if (storedLang === 'hi' || storedLang === 'en') setLang(storedLang);

    // Admin-triggered recovery: a link like /?resume=<sessionId> forces the
    // app to pick up that specific session, overriding whatever is already
    // in localStorage. Useful when Nandu's browser data was cleared OR he
    // opened the link on a different phone — admin sends him a recovery URL
    // from /admin and the next page load picks up his real in-progress row.
    const url = new URL(window.location.href);
    const resumeOverride = url.searchParams.get('resume');
    if (resumeOverride) {
      window.localStorage.setItem(STORAGE_KEY, resumeOverride);
      window.localStorage.setItem(QUESTION_SET_VERSION_KEY, QUESTION_SET_VERSION);
      // Clean the URL so a refresh doesn't keep retriggering the override.
      url.searchParams.delete('resume');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
    }

    // One-time wipe: when the question set schema changes (e.g. v2 -> v3),
    // abandon stored sessions from the old schema so resume doesn't drop
    // the user into a misaligned index. The `?resume=` override above
    // already set the version key, so admin-recovered sessions survive.
    const storedVersion = window.localStorage.getItem(QUESTION_SET_VERSION_KEY);
    if (storedVersion !== QUESTION_SET_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem(QUESTION_SET_VERSION_KEY, QUESTION_SET_VERSION);
      setResumeChecked(true);
      return;
    }

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

  function toggleLang() {
    setLang((prev) => {
      const next: PromptLang = prev === 'hi' ? 'en' : 'hi';
      if (typeof window !== 'undefined') window.localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }

  async function saveAndNext(answer: string | string[]) {
    if (!current || !sessionId) return;
    setBusy(true);
    setStatus('Saving answer...');
    try {
      // For MCQ questions (radio or checkbox), append the optional
      // Notes / अन्य write-in so it reaches the DB and Sheets as part of
      // the same answer row.
      const trimmedNotes = notesValue.trim();
      let combinedAnswer: string | string[] = answer;
      if ((current.type === 'radio' || current.type === 'checkbox') && current.allowNotes && trimmedNotes) {
        const base = Array.isArray(answer) ? answer.join(' | ') : String(answer);
        combinedAnswer = base ? `${base} | Notes: ${trimmedNotes}` : `Notes: ${trimmedNotes}`;
      }

      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: current.id,
          questionText: current.prompt,
          section: current.section,
          answer: combinedAnswer,
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
          answer: Array.isArray(combinedAnswer) ? combinedAnswer.join(' | ') : combinedAnswer,
          audioUrl,
          audioDurationSeconds,
        },
      ]);

      if (index + 1 >= questions.length) {
        setStatus('Finalising...');
        const done = await fetch('/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const doneJson = await done.json();
        if (!done.ok) throw new Error(doneJson.error || 'Failed to complete session');
        // LLM summary is generated in the background via after() on the
        // server — respondent only sees a thank-you modal. Summary lands in
        // Supabase + Google Sheets within ~30 s and shows in admin then.
        setCompletion({ thanks: true });
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

  async function skipAndNext() {
    if (!current || !sessionId) return;
    setBusy(true);
    setStatus('Skipping…');
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: current.id,
          questionText: current.prompt,
          section: current.section,
          answer: '(skipped)',
          // explicitly NOT attaching audioPath / audioDurationSeconds —
          // skipping intentionally clears any partial recording so the
          // row is unambiguously a skip, not a half-finished answer.
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to skip');
      setSavedAnswers((prev) => [
        ...prev,
        {
          questionId: current.id,
          answer: '(skipped)',
          audioUrl: null,
          audioDurationSeconds: null,
        },
      ]);

      if (index + 1 >= questions.length) {
        // Skipping the final question still triggers completion — but the
        // background LLM will see the skip marker and call it out.
        setStatus('Finalising…');
        const done = await fetch('/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const doneJson = await done.json();
        if (!done.ok) throw new Error(doneJson.error || 'Failed to complete session');
        setCompletion({ thanks: true });
        setStatus('Session completed');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        setIndex((v) => v + 1);
        setStatus('Skipped — moved to next');
      }
    } catch (err: any) {
      setStatus(err.message || 'Failed to skip');
    } finally {
      setBusy(false);
    }
  }

  function toggleMulti(option: string) {
    setMultiValue((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  function closeCompletion() {
    // Close the thank-you modal and return to a clean landing state so
    // the next visitor (or another fresh start by the same person) gets
    // a clean form. localStorage was already cleared when /api/complete
    // returned ok.
    setCompletion(null);
    setRole(null);
    setSessionId('');
    setIndex(0);
    setSavedAnswers([]);
    setStatus('Ready to start');
    setRespondentName('');
  }

  if (!role) {
    return (
      <main className="container">
        <section className="hero">
          <div className="card grid" style={{ gap: 18 }}>
            <span className="pill">LD Brain · Knowledge Capture</span>
            {(() => {
              const landingRoles = listLandingRoles();
              const heroTitle = landingRoles.length === 1
                ? `${landingRoles[0].label} Interview`
                : 'LD Brain Interview';
              return <h1 className="h1">{heroTitle}</h1>;
            })()}
            <p className="muted" style={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
              Ek aasan form jo ek-ek sawaal poochta hai. Type karo ya mic dabake bolo —
              Hindi / English mix bhi chalega. Beech mein ruk sakte ho, baad mein wahi se shuru
              hoga. Aapka jawab apne aap LD Brain mein save ho jaayega.
            </p>
            <div className="grid-2">
              <div className="card" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' }}>
                <strong>Voice-first capture</strong>
                <p className="muted small">Bolo, mat type karo. Hindi/English mix bhi chalega.</p>
              </div>
              <div className="card" style={{ background: 'var(--warm-soft)', borderColor: '#f0d6a8' }}>
                <strong>Resume anytime</strong>
                <p className="muted small">Beech mein band karoge to wahi se shuru hoga (same device).</p>
              </div>
            </div>
          </div>

          <div className="card grid" style={{ gap: 16 }}>
            {resumeChecked && resumeOption ? (
              <div className="card" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' }}>
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
                    placeholder="Aapka naam"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                  />
                </label>

                {(() => {
                  const landingRoles = listLandingRoles();
                  const isLocked = landingRoles.length === 1;
                  return (
                    <>
                      <p className="muted small" style={{ margin: 0 }}>
                        {isLocked ? 'Start your interview when ready:' : 'Choose the flow that applies to you:'}
                      </p>
                      <div className="grid" style={{ gap: 10 }}>
                        {landingRoles.map((roleMeta) => (
                          <button
                            key={roleMeta.key}
                            className="btn"
                            disabled={busy}
                            onClick={() => startSession(roleMeta.key)}
                            style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, textAlign: 'left' }}
                          >
                            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Start {roleMeta.label} flow</span>
                            {roleMeta.description ? (
                              <span style={{ fontSize: '0.82rem', fontWeight: 500, opacity: 0.92, lineHeight: 1.4 }}>
                                {roleMeta.description}
                              </span>
                            ) : null}
                            {roleMeta.company || roleMeta.expectedMinutes ? (
                              <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.78, letterSpacing: '0.02em' }}>
                                {[roleMeta.company, roleMeta.expectedMinutes ? `~${roleMeta.expectedMinutes} min` : null].filter(Boolean).join(' · ')}
                              </span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
                <p className="muted small">{status}</p>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  const displayAnswer = current?.type === 'checkbox' ? multiValue : textValue;
  const hasOptionAnswer = current?.type === 'checkbox'
    ? multiValue.length > 0
    : textValue.trim().length > 0;
  const hasNotesAnswer = current?.allowNotes ? notesValue.trim().length > 0 : false;
  // Allow Save & Continue if the user has either picked option(s) OR written
  // something in the Notes / अन्य field. This matches the PDF's design where
  // "अन्य" is itself a valid answer when none of A/B/C/D fit.
  const canContinue = current ? (hasOptionAnswer || hasNotesAnswer) : false;

  return (
    <main className="container grid" style={{ gap: 18 }}>
      {completion?.thanks ? (
        <CompletionModal onClose={closeCompletion} respondentName={respondentName} lang={lang} />
      ) : null}
      <div className="card grid" style={{ gap: 12 }}>
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="pill">Session #{sessionId.slice(0, 8)} • {role.toUpperCase()}</span>
              <button
                type="button"
                className="lang-toggle"
                onClick={toggleLang}
                aria-label="Toggle language"
                title="Toggle between Hinglish (Latin) and Hindi (Devanagari)"
              >
                {lang === 'hi' ? 'क → ABC' : 'ABC → क'}
              </button>
            </div>
            <h1 className="h2" style={{ marginTop: 12 }}>
              {(lang === 'hi' && current?.sectionHi) || current?.section}
            </h1>
          </div>
          <div style={{ justifySelf: 'end', minWidth: 240, width: '100%' }}>
            <div className="progress"><div style={{ width: `${progress}%` }} /></div>
            <p className="muted small" style={{ marginTop: 8 }}>{index + 1} of {questions.length} questions</p>
          </div>
        </div>
        <p className="question-prompt">{(lang === 'hi' && current?.promptHi) || current?.prompt}</p>
        {current?.help ? <p className="muted small" style={{ margin: 0 }}>{current.help}</p> : null}
      </div>

      <div className="question-layout">
        <section className="card grid" style={{ gap: 14 }}>
          {current?.type === 'textarea' || current?.type === 'text' ? (
            <VoiceTextarea value={textValue} onChange={setTextValue} disabled={busy} />
          ) : null}

          {current?.type === 'radio' && current.options ? (
            <div className="grid" style={{ gap: 10 }}>
              {current.options.map((option, i) => {
                // The saved value is always the English (Latin) option so the
                // DB stays consistent regardless of which script the user is
                // reading in. The label below shows the user's chosen script.
                const display =
                  lang === 'hi' && current.optionsHi && current.optionsHi[i]
                    ? current.optionsHi[i]
                    : option;
                return (
                  <label key={option} className="option">
                    <input
                      type="radio"
                      name={current.id}
                      checked={textValue === option}
                      onChange={() => setTextValue(option)}
                    />
                    <span>{display}</span>
                  </label>
                );
              })}
              {current.allowNotes ? (
                <textarea
                  className="textarea notes-textarea"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder={lang === 'hi' ? 'अन्य / Notes (optional)' : 'Notes / अन्य (optional)'}
                  disabled={busy}
                />
              ) : null}
            </div>
          ) : null}

          {current?.type === 'checkbox' && current.options ? (
            <div className="grid" style={{ gap: 10 }}>
              {current.options.map((option, i) => {
                const display =
                  lang === 'hi' && current.optionsHi && current.optionsHi[i]
                    ? current.optionsHi[i]
                    : option;
                return (
                  <label key={option} className="option">
                    <input
                      type="checkbox"
                      checked={multiValue.includes(option)}
                      onChange={() => toggleMulti(option)}
                    />
                    <span>{display}</span>
                  </label>
                );
              })}
              {current.allowNotes ? (
                <textarea
                  className="textarea notes-textarea"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder={lang === 'hi' ? 'अन्य / Notes (optional)' : 'Notes / अन्य (optional)'}
                  disabled={busy}
                />
              ) : null}
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

          <div className="action-row">
            <button className="btn secondary" disabled={busy || index === 0} onClick={() => setIndex((v) => Math.max(0, v - 1))}>Back</button>
            <button className="btn ghost" disabled={busy} onClick={skipAndNext} title="Skip this question for now — you can come back later via Back">
              Skip karo (baad mein)
            </button>
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

          {/* Summary no longer surfaces inline for the respondent — it's
              generated in the background and visible to admins via /admin.
              The respondent just sees the thank-you modal then lands back
              on the welcome screen. */}
        </aside>
      </div>
    </main>
  );
}
