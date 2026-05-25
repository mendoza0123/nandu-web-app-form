import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { syncUnsentAnswersToSheets } from '@/lib/sheets';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionId, questionText, section, answer, audioPath, audioDurationSeconds } = body;

    if (!sessionId || !questionId || !questionText || !section) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const answerText = Array.isArray(answer) ? answer.join(' | ') : String(answer ?? '');
    const supabase = getSupabaseAdmin();

    const row: Record<string, unknown> = {
      session_id: sessionId,
      question_id: questionId,
      question_text: questionText,
      section,
      answer_text: answerText,
      answer_json: Array.isArray(answer) ? answer : { value: answerText },
    };
    if (audioPath) row.audio_path = audioPath;
    if (typeof audioDurationSeconds === 'number' && Number.isFinite(audioDurationSeconds)) {
      row.audio_duration_seconds = Math.round(audioDurationSeconds);
    }

    const { data, error } = await supabase
      .from('interview_answers')
      .upsert(row, { onConflict: 'session_id,question_id' })
      .select('id')
      .single();

    if (error) throw error;

    // Fire-and-forget: if there are now >= 5 unsent answers for this session,
    // batch them to Sheets. Never blocks the user's Save & Continue.
    syncUnsentAnswersToSheets({ sessionId, trigger: 'partial' }).catch((err) =>
      console.error('[answers] partial sync failed:', err),
    );

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save answer' }, { status: 500 });
  }
}
