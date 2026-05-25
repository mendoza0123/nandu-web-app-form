import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

const DEFAULT_AUDIO_MODEL = 'openai/whisper-large-v3-turbo';
const DEFAULT_TEXT_MODEL = 'openai/gpt-4o-mini';

function getClient(): OpenAI | null {
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

/**
 * Transcribe audio via OpenRouter's Whisper endpoint (May 2026 launch).
 * Returns Devanagari for Hindi content; English words stay as-is.
 *
 * Never throws. Returns empty string + logs on any failure so callers
 * can still succeed with just the audio upload.
 */
export async function transcribeAudio(
  audio: ArrayBuffer | Blob,
  mimeType: string,
): Promise<{ text: string; model: string }> {
  const client = getClient();
  if (!client) {
    console.warn('[transcribe] OPENAI_API_KEY not set — skipping transcription');
    return { text: '', model: 'none' };
  }
  const model = (process.env.OPENAI_AUDIO_MODEL || DEFAULT_AUDIO_MODEL).trim();

  try {
    const filename = `recording.${extFromMime(mimeType)}`;
    const file = await toFile(
      audio instanceof Blob ? audio : new Blob([audio], { type: mimeType || 'audio/webm' }),
      filename,
      { type: mimeType || 'audio/webm' },
    );
    const response = await client.audio.transcriptions.create({
      file,
      model,
      language: 'hi',
    });
    return { text: (response.text || '').trim(), model };
  } catch (err: any) {
    console.error('[transcribe] failed:', err?.message || err);
    return { text: '', model };
  }
}

/**
 * Transliterate Devanagari Hindi to Latin-script Hinglish. Keeps English
 * words as-is, converts Hindi words to phonetic Latin transliteration.
 *
 * Example: "सुबह factory आने के बाद" → "Subah factory aane ke baad"
 *
 * Skips the LLM call (returns input as-is) when no Devanagari is present
 * — saves a round-trip on pure-English transcripts. Never throws.
 */
export async function toLatinHinglish(devanagariText: string): Promise<string> {
  const text = (devanagariText || '').trim();
  if (!text) return '';
  // Devanagari Unicode range: U+0900–U+097F. Skip the LLM call entirely
  // if there's no Devanagari to convert.
  if (!/[ऀ-ॿ]/.test(text)) return text;

  const client = getClient();
  if (!client) return text;
  const model = (process.env.OPENAI_MODEL || DEFAULT_TEXT_MODEL).trim();

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            'You transliterate Hindi (Devanagari) to natural Hinglish in Latin script. RULES: 1) Convert every Devanagari word to its phonetic Latin transliteration (सुबह → "Subah", फैक्टरी → "factory"). 2) Keep words already in Latin script unchanged (machine, ICC profile, KATA, Delta-E, etc. stay as-is). 3) Preserve numbers, punctuation, currency symbols (₹), and formatting exactly. 4) Output ONLY the transliterated text — no commentary, no quotation marks, no "Here is..." preamble. 5) Capitalize sentence-initial words normally; otherwise keep natural casing.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });
    const out = (response.choices[0]?.message?.content || '').trim();
    return out || text;
  } catch (err: any) {
    console.error('[transliterate] failed:', err?.message || err);
    return text; // fall back to the original Devanagari so we never lose data
  }
}

function extFromMime(mime: string): string {
  if (!mime) return 'webm';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}
