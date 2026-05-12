import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { summarizeInterview } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('question_id, question_text, section, answer_text, created_at')
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

    const { error: sessionUpdateError } = await supabase
      .from('interview_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (sessionUpdateError) throw sessionUpdateError;

    return NextResponse.json({ ok: true, summary: summary.summary, model: summary.model, themes: summary.themes });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to complete session' }, { status: 500 });
  }
}
