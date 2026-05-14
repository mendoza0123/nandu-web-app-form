import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { summarizeInterview } from '@/lib/llm';

export const runtime = 'nodejs';
export const maxDuration = 60;

function checkAuth(req: Request): boolean {
  const passcode = (process.env.ADMIN_PASSCODE || '').trim();
  if (!passcode) return false;
  const url = new URL(req.url);
  const rawKey = url.searchParams.get('key') || req.headers.get('x-admin-key') || '';
  return rawKey.trim() === passcode;
}

/**
 * Manually trigger the LLM summary for a session. Used when the
 * background after() invocation in /api/complete failed silently
 * (e.g. free-tier OpenRouter 429) and the summary row is missing
 * or stale. Always upserts — overwrites any existing summary.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name')
      .eq('id', id)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('question_id, question_text, section, answer_text, created_at')
      .eq('session_id', id)
      .order('created_at', { ascending: true });
    if (answersError) throw answersError;

    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'No answers to summarize' }, { status: 400 });
    }

    const summary = await summarizeInterview(session.role, session.respondent_name, answers);

    const { error: upsertError } = await supabase
      .from('interview_summaries')
      .upsert({
        session_id: id,
        summary_text: summary.summary,
        llm_model: summary.model,
        themes: summary.themes,
      });
    if (upsertError) throw upsertError;

    return NextResponse.json({
      ok: true,
      summary: summary.summary,
      model: summary.model,
      themes: summary.themes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to summarize' }, { status: 500 });
  }
}
