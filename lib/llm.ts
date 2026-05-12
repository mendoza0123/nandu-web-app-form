import OpenAI from 'openai';
import type { InterviewRole } from '@/lib/types';

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      ...(process.env.OPENROUTER_APP_URL ? { 'HTTP-Referer': process.env.OPENROUTER_APP_URL } : {}),
      ...(process.env.OPENROUTER_APP_NAME ? { 'X-Title': process.env.OPENROUTER_APP_NAME } : {}),
    },
  });
}

export async function summarizeInterview(role: InterviewRole, respondentName: string | null, transcript: Array<{ question_id: string; question_text: string; section: string; answer_text: string }>) {
  const client = getClient();
  const roleLabel = role === 'nandu' ? 'Nandu Bhai / Production' : 'Management / MD';

  const transcriptText = transcript
    .map((item, i) => `${i + 1}. [${item.section}] ${item.question_text}\nAnswer: ${item.answer_text}`)
    .join('\n\n');

  if (!client) {
    return {
      summary: `LLM not configured. Captured ${transcript.length} answers for ${respondentName || roleLabel}.`,
      model: 'fallback',
      themes: ['fallback', 'no-llm-configured'],
    };
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'openai/gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are an internal LD Brain analyst. Convert interview answers into a crisp knowledge summary. Output plain text with headings: Executive Summary, Operational Rules, Risks / Gaps, Reusable SOP Notes, and Next Questions. Be concise but specific.',
      },
      {
        role: 'user',
        content: `Role: ${roleLabel}\nRespondent: ${respondentName || 'Unknown'}\n\nTranscript:\n${transcriptText}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() || 'No summary returned by model.';
  const themes = [role, 'ld-brain', 'knowledge-capture'];

  return {
    summary: text,
    model: response.model,
    themes,
  };
}
