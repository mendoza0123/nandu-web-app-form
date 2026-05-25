import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 60;

function checkAuth(req: Request): boolean {
  const passcode = (process.env.ADMIN_PASSCODE || '').trim();
  if (!passcode) return false;
  const url = new URL(req.url);
  const rawKey = url.searchParams.get('key') || req.headers.get('x-admin-key') || '';
  return rawKey.trim() === passcode;
}

function openaiClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'https://linkdprints.com',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'LD Brain Admin Ask',
    },
  });
}

/**
 * Admin-only "Ask LD Brain" endpoint. Concatenates every saved answer
 * across every session into the system prompt, then asks the LLM the
 * user's question. Cites session names + question ids so the admin can
 * trace claims back to the source row.
 *
 * Soft launch scale (< 100 sessions, ~50 answers each, ~500 chars per
 * answer) gives < 2.5M chars / ~625k tokens which exceeds gpt-4o-mini's
 * 128k context — so we limit to the most recent 30 sessions. Will need
 * embedding/retrieval when the corpus grows beyond that.
 */
export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: sessions, error: sessionsErr } = await supabase
      .from('interview_sessions')
      .select('id, role, respondent_name, status, started_at, completed_at')
      .order('started_at', { ascending: false })
      .limit(30);
    if (sessionsErr) throw sessionsErr;
    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        ok: true,
        answer: 'No interview data has been collected yet. Once a respondent answers some questions, ask again.',
        model: process.env.OPENAI_MODEL || 'openai/gpt-4o-mini',
        sourceCount: 0,
      });
    }

    const sessionIds = sessions.map((s) => s.id);
    const { data: answers, error: answersErr } = await supabase
      .from('interview_answers')
      .select('session_id, question_id, question_text, section, answer_text, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true });
    if (answersErr) throw answersErr;

    const answersBySession = new Map<string, typeof answers>();
    for (const a of answers || []) {
      const list = answersBySession.get(a.session_id) || [];
      list.push(a);
      answersBySession.set(a.session_id, list);
    }

    const blocks: string[] = [];
    for (const s of sessions) {
      const rows = answersBySession.get(s.id) || [];
      if (rows.length === 0) continue;
      const header = `### Session — ${s.respondent_name || '(no name)'} · ${s.role} · ${s.status}`;
      const body = rows
        .map((r) => `[${r.question_id}] ${r.question_text}\n→ ${r.answer_text}`)
        .join('\n\n');
      blocks.push(`${header}\n${body}`);
    }

    const corpus = blocks.join('\n\n---\n\n');
    const systemPrompt = `You are LD Brain's query interface, answering questions for the admin team (Mahesh + Aditya). You have access to interview data from LD Group factory operations and sales.

Rules:
1. Answer ONLY using the data below. If the data does not cover the question, say so plainly.
2. Be specific. Cite respondent name + question id (e.g., "Nandu desai's Q5") when referencing a claim.
3. If multiple respondents disagree, surface the disagreement explicitly.
4. Keep answers concise (3-8 sentences for most questions, bulleted when listing).
5. Use Hinglish naturally — same flavour as the source data.
6. Answers literally "(skipped)" mean the respondent skipped that question — not a data point. Don't quote them as evidence. If a skip is relevant to the user's question, say "the respondent skipped this question — follow up needed".

Data:
${corpus}`;

    const client = openaiClient();
    const model = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question.trim() },
      ],
      temperature: 0.2,
    });
    const answer = response.choices[0]?.message?.content?.trim() || '(empty response)';

    return NextResponse.json({
      ok: true,
      answer,
      model,
      sourceCount: blocks.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Ask LD Brain failed' }, { status: 500 });
  }
}
