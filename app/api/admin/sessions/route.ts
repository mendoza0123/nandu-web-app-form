import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { QUESTION_SETS } from '@/lib/questions';

export const runtime = 'nodejs';

function checkAuth(req: Request): { ok: boolean; reason?: string } {
  const passcode = (process.env.ADMIN_PASSCODE || '').trim();
  if (!passcode) return { ok: false, reason: 'ADMIN_PASSCODE env var is not set on the deployment.' };
  const url = new URL(req.url);
  const rawKey = url.searchParams.get('key') || req.headers.get('x-admin-key') || '';
  const key = rawKey.trim();
  if (key !== passcode) return { ok: false, reason: 'Wrong or missing key.' };
  return { ok: true };
}

export async function GET(req: Request) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: sessions, error: sessionsError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, company, status, started_at, completed_at')
      .order('started_at', { ascending: false })
      .limit(200);
    if (sessionsError) throw sessionsError;

    const ids = (sessions ?? []).map((s) => s.id);
    let answersByGroup = new Map<string, { count: number; lastAt: string | null; questionIds: string[] }>();

    if (ids.length > 0) {
      const { data: answers, error: answersError } = await supabase
        .from('interview_answers')
        .select('session_id, question_id, created_at')
        .in('session_id', ids);
      if (answersError) throw answersError;

      for (const a of answers ?? []) {
        const bucket = answersByGroup.get(a.session_id) || { count: 0, lastAt: null, questionIds: [] };
        bucket.count += 1;
        bucket.questionIds.push(a.question_id);
        if (!bucket.lastAt || a.created_at > bucket.lastAt) bucket.lastAt = a.created_at;
        answersByGroup.set(a.session_id, bucket);
      }
    }

    const enriched = (sessions ?? []).map((s) => {
      const bucket = answersByGroup.get(s.id);
      const totalQuestions = (QUESTION_SETS[s.role] || []).length || null;
      return {
        ...s,
        answeredCount: bucket?.count ?? 0,
        totalQuestions,
        lastAnswerAt: bucket?.lastAt ?? null,
        questionIds: bucket?.questionIds ?? [],
      };
    });

    const stats = {
      total: enriched.length,
      inProgress: enriched.filter((s) => s.status === 'in_progress').length,
      completed: enriched.filter((s) => s.status === 'completed').length,
    };

    return NextResponse.json({ stats, sessions: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load sessions' }, { status: 500 });
  }
}
