import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isColumnMissingError } from '@/lib/dbTolerant';

export const runtime = 'nodejs';

function checkAuth(req: Request): boolean {
  const passcode = (process.env.ADMIN_PASSCODE || '').trim();
  if (!passcode) return false;
  const url = new URL(req.url);
  const rawKey = url.searchParams.get('key') || req.headers.get('x-admin-key') || '';
  return rawKey.trim() === passcode;
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

    const [{ data: session, error: sessionErr }, ansResult, { data: summary, error: sumErr }] = await Promise.all([
      supabase
        .from('interview_sessions')
        .select('id, role, respondent_name, company, status, started_at, completed_at')
        .eq('id', id)
        .maybeSingle(),
      // Try with audio_transcript first; fall back to the legacy column set
      // if schema_v6 hasn't been applied yet. Either way the response shape
      // includes audio_transcript (null when the column is missing).
      supabase
        .from('interview_answers')
        .select('id, question_id, question_text, section, answer_text, audio_path, audio_duration_seconds, audio_transcript, created_at')
        .eq('session_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('interview_summaries')
        .select('summary_text, llm_model, themes')
        .eq('session_id', id)
        .maybeSingle(),
    ]);

    let answers = ansResult.data;
    let ansErr = ansResult.error;
    if (ansErr && isColumnMissingError(ansErr, 'audio_transcript')) {
      const retry = await supabase
        .from('interview_answers')
        .select('id, question_id, question_text, section, answer_text, audio_path, audio_duration_seconds, created_at')
        .eq('session_id', id)
        .order('created_at', { ascending: true });
      if (!retry.error) {
        answers = (retry.data || []).map((a: any) => ({ ...a, audio_transcript: null }));
        ansErr = null;
      }
    }

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

export async function DELETE(
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

    // Collect audio paths so we can remove the blobs from Storage too.
    // (FK rows in interview_answers + interview_summaries cascade-delete
    // when the session row goes, but Supabase Storage objects do not.)
    const { data: answers } = await supabase
      .from('interview_answers')
      .select('audio_path')
      .eq('session_id', id);
    const audioPaths = (answers ?? [])
      .map((a) => a.audio_path)
      .filter((p): p is string => Boolean(p));

    if (audioPaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('interview-audio')
        .remove(audioPaths);
      if (storageError) {
        // Don't abort the whole delete on storage errors — just log; the DB
        // rows are the source of truth, orphan audio can be cleaned later.
        console.error('[admin delete] storage cleanup failed:', storageError);
      }
    }

    const { error: deleteError } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ ok: true, deletedAudio: audioPaths.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete session' },
      { status: 500 },
    );
  }
}
