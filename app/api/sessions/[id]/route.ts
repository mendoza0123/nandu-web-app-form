import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, status, started_at, completed_at')
      .eq('id', id)
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { data: answers, error: answersError } = await supabase
      .from('interview_answers')
      .select('question_id')
      .eq('session_id', id);

    if (answersError) throw answersError;

    const answeredQuestionIds = (answers ?? []).map((row: any) => row.question_id);

    return NextResponse.json({ session, answeredQuestionIds });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load session' },
      { status: 500 },
    );
  }
}
