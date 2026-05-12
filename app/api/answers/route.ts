import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionId, questionText, section, answer } = body;

    if (!sessionId || !questionId || !questionText || !section) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const answerText = Array.isArray(answer) ? answer.join(' | ') : String(answer ?? '');
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('interview_answers')
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          question_text: questionText,
          section,
          answer_text: answerText,
          answer_json: Array.isArray(answer) ? answer : { value: answerText },
        },
        { onConflict: 'session_id,question_id' },
      )
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save answer' }, { status: 500 });
  }
}
