import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

function checkAuth(req: Request): boolean {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) return false;
  const url = new URL(req.url);
  const key = url.searchParams.get('key') || req.headers.get('x-admin-key');
  return key === passcode;
}

export async function GET(
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

    const [{ data: session, error: sessionErr }, { data: answers, error: ansErr }, { data: summary, error: sumErr }] = await Promise.all([
      supabase
        .from('interview_sessions')
        .select('id, role, respondent_name, company, status, started_at, completed_at')
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('interview_answers')
        .select('id, question_id, question_text, section, answer_text, audio_path, audio_duration_seconds, created_at')
        .eq('session_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('interview_summaries')
        .select('summary_text, llm_model, themes')
        .eq('session_id', id)
        .maybeSingle(),
    ]);

    if (sessionErr) throw sessionErr;
    if (ansErr) throw ansErr;
    if (sumErr) throw sumErr;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    return NextResponse.json({
      session,
      answers: answers ?? [],
      summary: summary ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load session' }, { status: 500 });
  }
}
