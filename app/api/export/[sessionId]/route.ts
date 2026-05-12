import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildLdBrainMarkdown } from '@/lib/export/markdown';
import { getCodedRole } from '@/lib/roles';
import type { RoleMeta } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, company, status, started_at, completed_at, metadata')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const [{ data: answers, error: ansErr }, { data: summary, error: sumErr }] = await Promise.all([
      supabase
        .from('interview_answers')
        .select('question_id, question_text, section, answer_text, answer_json, audio_path, audio_duration_seconds, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true }),
      supabase
        .from('interview_summaries')
        .select('summary_text, llm_model, themes')
        .eq('session_id', sessionId)
        .maybeSingle(),
    ]);
    if (ansErr) throw ansErr;
    if (sumErr) throw sumErr;

    const role = await resolveRole(session.role, supabase);

    const { markdown, filename, suggestedPath } = buildLdBrainMarkdown({
      session,
      answers: answers ?? [],
      summary: summary ?? null,
      role,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    });

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Suggested-Path': suggestedPath,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to build export' },
      { status: 500 },
    );
  }
}

async function resolveRole(roleKey: string, supabase: ReturnType<typeof getSupabaseAdmin>): Promise<RoleMeta> {
  const coded = getCodedRole(roleKey);
  if (coded) return coded;

  const { data, error } = await supabase
    .from('custom_roles')
    .select('key, label, company, framing, expected_minutes, description')
    .eq('key', roleKey)
    .maybeSingle();

  if (!error && data) {
    return {
      key: data.key,
      label: data.label,
      company: data.company ?? undefined,
      framing: (data.framing === 'sop' ? 'sop' : 'leadership'),
      expectedMinutes: data.expected_minutes ?? undefined,
      source: 'db',
      description: data.description ?? undefined,
    };
  }

  // Fallback for sessions whose role isn't found anywhere
  return {
    key: roleKey,
    label: roleKey,
    framing: 'leadership',
    source: 'code',
  };
}
