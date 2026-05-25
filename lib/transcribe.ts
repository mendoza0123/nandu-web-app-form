import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

const DEFAULT_MODEL = 'openai/whisper-large-v3-turbo';

/**
 * Transcribe a single audio blob via OpenRouter's Whisper endpoint
 * (announced May 2026, OpenAI-compatible). Uses the same OPENAI_API_KEY
 * + OPENAI_BASE_URL pair that powers chat completions — no extra vendor.
 *
 * Never throws. Returns an empty string and logs on failure so callers
 * (e.g. /api/audio) can still succeed with the audio upload alone.
 *
 * Language hint is forced to 'hi' (Hindi) — the user base speaks
 * Hinglish, and the Hindi-tuned Whisper path handles mixed
 * English/Devanagari technical phrases noticeably better than letting
 * it auto-detect.
 */
export async function transcribeAudio(
  audio: ArrayBuffer | Blob,
  mimeType: string,
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[transcribe] OPENAI_API_KEY not set — skipping transcription');
    return { text: '', model: 'none' };
  }
  const model = (process.env.OPENAI_AUDIO_MODEL || DEFAULT_MODEL).trim();

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        ...(process.env.OPENROUTER_APP_URL ? { 'HTTP-Referer': process.env.OPENROUTER_APP_URL } : {}),
        ...(process.env.OPENROUTER_APP_NAME ? { 'X-Title': process.env.OPENROUTER_APP_NAME } : {}),
      },
    });

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

    const text = (response.text || '').trim();
    return { text, model };
  } catch (err: any) {
    console.error('[transcribe] failed:', err?.message || err);
    return { text: '', model };
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
