import { NextResponse } from 'next/server';
import { toLatinHinglish } from '@/lib/transcribe';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Convert Devanagari text to Latin-script Hinglish via gpt-4o-mini.
 * Called from VoiceTextarea on user-initiated Stop, so the live SR
 * Devanagari that appeared as the user spoke gets snapped to Hinglish
 * once they're done.
 *
 * Returns the input unchanged if it contains no Devanagari, and
 * silently falls back to the input on any LLM failure (never breaks
 * the textarea content).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text : '';
    if (!text.trim()) {
      return NextResponse.json({ ok: true, text: '' });
    }
    const hinglish = await toLatinHinglish(text);
    return NextResponse.json({ ok: true, text: hinglish });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Transliterate failed' },
      { status: 500 },
    );
  }
}
