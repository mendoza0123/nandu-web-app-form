-- Migration v3: add voice-note support
-- Adds two columns on interview_answers and creates a public storage bucket
-- for raw audio. Public-read is fine for soft launch (paths are UUIDs;
-- no listing endpoint is exposed). Lock down with signed URLs in v1.1+.

-- 1) Columns on interview_answers
alter table interview_answers
  add column if not exists audio_path text;
alter table interview_answers
  add column if not exists audio_duration_seconds integer;

-- 2) Storage bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('interview-audio', 'interview-audio', true)
on conflict (id) do nothing;
