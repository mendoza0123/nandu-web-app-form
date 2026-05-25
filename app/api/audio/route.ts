import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { transcribeAudio, toLatinHinglish } from '@/lib/transcribe';

export const runtime = 'nodejs';
// Storage upload ~1-2s + Whisper ~3-8s + transliterate ~1-2s.
// 60s comfortably covers the 3-min max recording.
export const maxDuration = 60;

const BUCKET = 'interview-audio';
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB — 3 min of opus ~ 1.5 MB, generous headroom

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const sessionId = String(form.get('sessionId') || '');
    const questionId = String(form.get('questionId') || '');
    const durationSeconds = Number(form.get('durationSeconds') || 0);

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }
    if (!sessionId || !questionId) {
      return NextResponse.json({ error: 'Missing sessionId or questionId' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Empty audio file' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Audio too large (max ${MAX_BYTES} bytes)` }, { status: 413 });
    }

    const safeQuestionId = questionId.replace(/[^A-Za-z0-9_-]/g, '_');
    const ext = guessExtension(file.type);
    const path = `${sessionId}/${safeQuestionId}-${Date.now()}.${ext}`;

    const supabase = getSupabaseAdmin();
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type || 'audio/webm',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Two-step transcription pipeline:
    //  1. Whisper: audio -> Devanagari Hindi (+ English words as-is)
    //  2. GPT-4o-mini: Devanagari -> Latin Hinglish (skipped if no Devanagari)
    // Both steps are best-effort — failures don't lose the audio upload.
    const whisper = await transcribeAudio(arrayBuffer, file.type || 'audio/webm');
    const hinglishTranscript = whisper.text ? await toLatinHinglish(whisper.text) : '';

    return NextResponse.json({
      ok: true,
      path,
      durationSeconds: Number.isFinite(durationSeconds) ? Math.round(durationSeconds) : null,
      transcript: hinglishTranscript,
      transcriptDevanagari: whisper.text, // kept for reference / debugging
      transcribeModel: whisper.model,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to upload audio' },
      { status: 500 },
    );
  }
}

function guessExtension(mime: string): string {
  if (!mime) return 'webm';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}
