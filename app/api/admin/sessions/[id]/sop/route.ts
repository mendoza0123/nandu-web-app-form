import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCodedRole } from '@/lib/roles';
import { ldBrainFolder } from '@/lib/roles';

export const runtime = 'nodejs';
export const maxDuration = 90;

function checkAuth(req: Request): boolean {
  const passcode = (process.env.ADMIN_PASSCODE || '').trim();
  if (!passcode) return false;
  const url = new URL(req.url);
  const rawKey = url.searchParams.get('key') || req.headers.get('x-admin-key') || '';
  return rawKey.trim() === passcode;
}

/**
 * Generate an SOP markdown document from a session's interview answers.
 * Optional topic parameter focuses the SOP (e.g. "Morning Production Routine",
 * "Defect Diagnosis"). Without a topic, the LLM picks the strongest theme
 * from the answers and writes a general factory SOP.
 *
 * Returns plain markdown — admin downloads or copies it into the
 * LD-Brain-main repo under the appropriate company folder.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';

    const supabase = getSupabaseAdmin();
    const { data: session, error: sessionErr } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, company, started_at, completed_at')
      .eq('id', id)
      .maybeSingle();
    if (sessionErr) throw sessionErr;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const { data: answers, error: answersErr } = await supabase
      .from('interview_answers')
      .select('question_id, question_text, section, answer_text, created_at')
      .eq('session_id', id)
      .order('created_at', { ascending: true });
    if (answersErr) throw answersErr;
    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'No answers to base an SOP on' }, { status: 400 });
    }

    const roleMeta = getCodedRole(session.role);
    const company = session.company || roleMeta?.company || 'LD Group';
    const respondent = session.respondent_name || roleMeta?.label || session.role;

    const dataDump = answers
      .map((a) => `[${a.question_id}] (${a.section}) ${a.question_text}\nA: ${a.answer_text}`)
      .join('\n\n');

    const systemPrompt = `You are a senior operations consultant writing factory SOP (Standard Operating Procedure) documents for LD Group. You convert raw interview transcripts into clean, immediately-useful SOP markdown.

Style rules:
- Output strict markdown. No commentary outside the document itself.
- Start with: # <SOP Title>
- Then a 1-paragraph "Purpose & Scope" section.
- Then numbered procedure steps under "## Procedure" — each step actionable and specific (who does what, with what tool, with what threshold).
- Then "## Decision Rules" — explicit if/then rules surfaced from the interview.
- Then "## Quality Thresholds" — numeric values (temperatures, times, tolerances) that came up.
- Then "## People & Roles" — named humans referenced in the interview (Nandu, Anand bhai, Raghav bhai, etc.) with what they decide.
- Then "## Open Gaps" — questions the interview did NOT answer that the SOP still needs.

Tone:
- English is the SOP language. Quote Hindi/Hinglish source phrases verbatim in parentheses when useful (e.g., "हाथ से रगड़ने पर रंग निकलता है").
- Be specific and quantitative wherever the interview gave numbers.
- Never invent facts not present in the source. If the interview is vague, say so under Open Gaps.
- Cite question IDs ([Q1], [Q22]) inline so the source is traceable.

Length: aim for 400-900 words. More if the interview is rich, less if sparse.`;

    const userPrompt = topic
      ? `Generate an SOP for the topic: "${topic}" — using only relevant content from the interview below.\n\nRespondent: ${respondent} · Role: ${session.role} · Company: ${company}\n\nInterview transcript:\n\n${dataDump}`
      : `Generate the most useful single SOP this interview supports. Pick the topic with the most concrete content from the transcript below.\n\nRespondent: ${respondent} · Role: ${session.role} · Company: ${company}\n\nInterview transcript:\n\n${dataDump}`;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'https://linkdprints.com',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'LD Brain SOP Generator',
      },
    });
    const model = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });
    const markdown = response.choices[0]?.message?.content?.trim() || '';
    if (!markdown) {
      return NextResponse.json({ error: 'Empty SOP from LLM' }, { status: 502 });
    }

    const dateStr = (session.completed_at || new Date().toISOString()).split('T')[0].replaceAll('-', '');
    const slugTopic = (topic || 'general-sop').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const slugRespondent = respondent.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const filename = `${dateStr}_${slugRespondent}_${slugTopic}_SOP.md`;
    const suggestedPath = `${ldBrainFolder(company)}/${filename}`;

    return NextResponse.json({
      ok: true,
      markdown,
      model,
      filename,
      suggestedPath,
      topic: topic || '(auto-picked)',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'SOP generation failed' }, { status: 500 });
  }
}
