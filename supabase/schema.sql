create extension if not exists pgcrypto;

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  respondent_name text,
  company text not null default 'LD Group',
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists interview_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references interview_sessions(id) on delete cascade,
  question_id text not null,
  question_text text not null,
  section text not null,
  answer_text text not null,
  answer_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_interview_answers_session_id on interview_answers(session_id);
create index if not exists idx_interview_sessions_role on interview_sessions(role);
create index if not exists idx_interview_sessions_status on interview_sessions(status);

create table if not exists interview_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references interview_sessions(id) on delete cascade,
  summary_text text not null,
  llm_model text,
  themes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
