-- Migration v6: audio transcription column.
-- The /api/audio endpoint now calls OpenRouter Whisper after the Storage
-- upload and stores the resulting transcript on the answer row so admin
-- can read what was spoken without playing the audio file.
--
-- Safe to run multiple times.

alter table interview_answers
  add column if not exists audio_transcript text;
