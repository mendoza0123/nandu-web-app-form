import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { summarizeInterview } from '@/lib/llm';
import { syncUnsentAnswersToSheets } from '@/lib/sheets';

export const runtime = 'nodejs';

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

    // Fire-and-forget final sync: flushes any remaining unsent answers to
    // Sheets (the tail not yet batched, e.g. answers 31-34 if the user
    // answered 34 questions and partial-sync fired at 5/10/15/20/25/30)
    // and attaches the LLM summary to the first row of that batch.
    syncUnsentAnswersToSheets({
      sessionId,
      trigger: 'final',
      summary: { summary: summary.summary, model: summary.model },
    }).catch((err) => console.error('[complete] final sync failed:', err));

    return NextResponse.json({ ok: true, summary: summary.summary, model: summary.model, themes: summary.themes });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to complete session' }, { status: 500 });
  }
}
