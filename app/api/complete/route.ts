import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { summarizeInterview } from '@/lib/llm';
import { getCodedRole } from '@/lib/roles';
import { audioUrl } from '@/lib/export/markdown';

export const runtime = 'nodejs';

const WEBHOOK_TIMEOUT_MS = 3000;

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, company, started_at')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('question_id, question_text, section, answer_text, audio_path, audio_duration_seconds, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (answersError) throw answersError;

    const summary = await summarizeInterview(session.role, session.respondent_name, answers || []);

    const { error: summaryError } = await supabase
      .from('interview_summaries')
      .upsert({
        session_id: sessionId,
        summary_text: summary.summary,
        llm_model: summary.model,
        themes: summary.themes,
      });

    if (summaryError) throw summaryError;

    const completedAt = new Date().toISOString();
    const { error: sessionUpdateError } = await supabase
      .from('interview_sessions')
      .update({ status: 'completed', completed_at: completedAt })
      .eq('id', sessionId);

    if (sessionUpdateError) throw sessionUpdateError;

    // Fire-and-forget Google Sheets webhook. Never blocks the response.
    fireSheetsWebhook({
      session: { ...session, completed_at: completedAt },
      answers: answers || [],
      summary,
    }).catch((err) => console.error('[sheets-webhook] failed:', err));

    return NextResponse.json({ ok: true, summary: summary.summary, model: summary.model, themes: summary.themes });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to complete session' }, { status: 500 });
  }
}

type WebhookPayload = {
  session: {
    id: string;
    role: string;
    respondent_name: string | null;
    company: string | null;
    started_at: string;
    completed_at: string;
  };
  answers: Array<{
    question_id: string;
    question_text: string;
    section: string;
    answer_text: string;
    audio_path: string | null;
    audio_duration_seconds: number | null;
  }>;
  summary: { summary: string; model: string; themes: string[] };
};

async function fireSheetsWebhook(payload: WebhookPayload): Promise<void> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const coded = getCodedRole(payload.session.role);
  const company = payload.session.company || coded?.company || '';
  const roleLabel = coded?.label || payload.session.role;

  const rows = payload.answers.map((a, i) => ({
    session_id: payload.session.id,
    respondent_name: payload.session.respondent_name || '',
    role: payload.session.role,
    role_label: roleLabel,
    company,
    completed_at: payload.session.completed_at,
    question_id: a.question_id,
    section: a.section,
    question_text: a.question_text,
    answer_text: a.answer_text,
    audio_url: a.audio_path ? audioUrl(supabaseUrl, a.audio_path) : '',
    audio_duration_seconds: a.audio_duration_seconds ?? '',
    summary_text: i === 0 ? payload.summary.summary : '',
    model: i === 0 ? payload.summary.model : '',
  }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: payload.session, rows }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[sheets-webhook] non-2xx ${res.status}: ${body.slice(0, 200)}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
