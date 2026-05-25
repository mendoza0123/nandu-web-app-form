-- Migration v6: audio transcription column.
-- The /api/audio endpoint now calls OpenRouter Whisper after the Storage
-- upload, transliterates Devanagari to Latin Hinglish, and stores the
-- resulting transcript on the answer row so admin can read what was
-- spoken without playing the audio file.
--
-- Safe to run multiple times. The app's runtime is migration-tolerant:
-- if this column doesn't exist, transcripts are silently dropped on
-- save and admin selects fall back to a column-less query. Running
-- this SQL is what UNLOCKS the persistence + display.

alter table interview_answers
  add column if not exists audio_transcript text;
