import { NextResponse, after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { summarizeInterview } from '@/lib/llm';
import { syncUnsentAnswersToSheets } from '@/lib/sheets';

export const runtime = 'nodejs';

/**
 * Mark the session completed FAST and return so the respondent sees a
 * "Thank you" popup within a second. The expensive bits — LLM summary,
 * summary row upsert, final Sheets sync — run in after() so they execute
 * AFTER the HTTP response is sent, even though the user has already moved
 * on. Failures inside after() never reach the respondent's UI; they land
 * in the Vercel logs and the admin panel just shows no summary card until
 * the background job succeeds (manual re-run via a future admin button if
 * we need it).
 */
export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Fast pre-checks + immediate completed status, all before responding.
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, company, started_at, status')
      .eq('id', sessionId)
      .single();
    if (sessionError) throw sessionError;

    const completedAt = new Date().toISOString();

    // Idempotent: if already completed, still respond ok and skip the
    // expensive work — don't burn an LLM call on a refresh / retry.
    if (session.status !== 'completed') {
      const { error: sessionUpdateError } = await supabase
        .from('interview_sessions')
        .update({ status: 'completed', completed_at: completedAt })
        .eq('id', sessionId);
      if (sessionUpdateError) throw sessionUpdateError;

      after(async () => {
        try {
          const { data: answers, error: answersError } = await supabase
            .from('interview_answers')
            .select('question_id, question_text, section, answer_text, audio_path, audio_duration_seconds, audio_transcript, created_at')
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

          try {
            await syncUnsentAnswersToSheets({
              sessionId,
              trigger: 'final',
              summary: { summary: summary.summary, model: summary.model },
            });
          } catch (sheetsErr) {
            console.error('[complete:after] sheets sync failed:', sheetsErr);
          }
        } catch (bgError) {
          console.error('[complete:after] background summarization failed:', bgError);
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to complete session' }, { status: 500 });
  }
}
