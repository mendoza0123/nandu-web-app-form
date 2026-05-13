import { getSupabaseAdmin } from '@/lib/supabase';
import { getCodedRole } from '@/lib/roles';
import { audioUrl } from '@/lib/export/markdown';

const WEBHOOK_TIMEOUT_MS = 3000;
const PARTIAL_BATCH_SIZE = 5;

type SessionRow = {
  id: string;
  role: string;
  respondent_name: string | null;
  company: string | null;
  started_at: string;
  completed_at: string | null;
};

type AnswerRow = {
  id: string;
  question_id: string;
  question_text: string;
  section: string;
  answer_text: string;
  audio_path: string | null;
  audio_duration_seconds: number | null;
};

type SyncOpts = {
  sessionId: string;
  trigger: 'partial' | 'final';
  // If provided, summary is attached to the first row of this batch.
  summary?: { summary: string; model: string } | null;
};

/**
 * Fires the configured Sheets webhook with unsent answers for a session,
 * then marks them as sent. Never throws. Returns counts for logging.
 *
 * - trigger='partial': only fires if at least PARTIAL_BATCH_SIZE answers
 *   are unsent. Sends up to PARTIAL_BATCH_SIZE answers per call (oldest first).
 * - trigger='final': always fires if there are any unsent rows OR a summary,
 *   to flush the tail of the session along with the LLM summary.
 */
export async function syncUnsentAnswersToSheets(opts: SyncOpts): Promise<{ sent: number; skipped: boolean; reason?: string }> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return { sent: 0, skipped: true, reason: 'no webhook url configured' };

  const supabase = getSupabaseAdmin();

  const { data: session, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('id, role, respondent_name, company, started_at, completed_at')
    .eq('id', opts.sessionId)
    .maybeSingle();
  if (sessionError || !session) {
    return { sent: 0, skipped: true, reason: sessionError?.message || 'session not found' };
  }

  const limit = opts.trigger === 'partial' ? PARTIAL_BATCH_SIZE : 1000;
  const { data: unsent, error: ansError } = await supabase
    .from('interview_answers')
    .select('id, question_id, question_text, section, answer_text, audio_path, audio_duration_seconds, created_at')
    .eq('session_id', opts.sessionId)
    .eq('sent_to_sheets', false)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (ansError) {
    // Most likely cause: schema_v5.sql hasn't been applied yet, so the
    // `sent_to_sheets` column doesn't exist. Bail out quietly so the
    // /api/answers and /api/complete routes don't 500.
    return { sent: 0, skipped: true, reason: ansError.message };
  }
  const answers = (unsent ?? []) as (AnswerRow & { created_at: string })[];

  if (opts.trigger === 'partial' && answers.length < PARTIAL_BATCH_SIZE) {
    return { sent: 0, skipped: true, reason: `only ${answers.length} unsent (need ${PARTIAL_BATCH_SIZE})` };
  }
  if (answers.length === 0 && !opts.summary) {
    return { sent: 0, skipped: true, reason: 'nothing to send' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const coded = getCodedRole(session.role);
  const company = session.company || coded?.company || '';
  const roleLabel = coded?.label || session.role;

  const rows = answers.map((a, i) => ({
    session_id: session.id,
    respondent_name: session.respondent_name || '',
    role: session.role,
    role_label: roleLabel,
    company,
    completed_at: session.completed_at || '',
    question_id: a.question_id,
    section: a.section,
    question_text: a.question_text,
    answer_text: a.answer_text,
    audio_url: a.audio_path ? audioUrl(supabaseUrl, a.audio_path) : '',
    audio_duration_seconds: a.audio_duration_seconds ?? '',
    summary_text: i === 0 && opts.summary ? opts.summary.summary : '',
    model: i === 0 && opts.summary ? opts.summary.model : '',
    trigger: opts.trigger,
  }));

  // If no answers but we have a summary (rare — empty session completed),
  // send a single summary-only row anchored to the session.
  if (rows.length === 0 && opts.summary) {
    rows.push({
      session_id: session.id,
      respondent_name: session.respondent_name || '',
      role: session.role,
      role_label: roleLabel,
      company,
      completed_at: session.completed_at || '',
      question_id: '',
      section: '',
      question_text: '',
      answer_text: '',
      audio_url: '',
      audio_duration_seconds: '',
      summary_text: opts.summary.summary,
      model: opts.summary.model,
      trigger: opts.trigger,
    });
  }

  // Fire the webhook with a hard timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  let webhookOk = false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, rows, trigger: opts.trigger }),
      signal: controller.signal,
    });
    if (res.ok) {
      webhookOk = true;
    } else {
      const body = await res.text().catch(() => '');
      console.error(`[sheets] non-2xx ${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err: any) {
    console.error(`[sheets] webhook failed: ${err?.message || err}`);
  } finally {
    clearTimeout(timer);
  }

  // Only mark rows as sent if the webhook actually succeeded — that way a
  // transient failure will be retried on the next save / completion.
  if (webhookOk && answers.length > 0) {
    const ids = answers.map((a) => a.id);
    const { error: updateError } = await supabase
      .from('interview_answers')
      .update({ sent_to_sheets: true })
      .in('id', ids);
    if (updateError) {
      console.error(`[sheets] failed to mark sent: ${updateError.message}`);
    }
  }

  return { sent: webhookOk ? answers.length : 0, skipped: !webhookOk, reason: webhookOk ? undefined : 'webhook failed' };
}
