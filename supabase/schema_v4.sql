-- Migration v4: support DB-backed custom roles + questions for the admin UI.
-- Coded roles (Nandu, MD, etc.) stay in lib/roles.ts. The /api/roles route
-- merges these tables with the coded list at runtime.
--
-- Safe to run multiple times.

create table if not exists custom_roles (
  key text primary key,
  label text not null,
  company text,
  framing text not null default 'leadership' check (framing in ('sop', 'leadership')),
  expected_minutes int,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists custom_questions (
  id uuid primary key default gen_random_uuid(),
  role_key text not null references custom_roles(key) on delete cascade,
  section text not null,
  prompt text not null,
  type text not null check (type in ('text', 'textarea', 'radio', 'checkbox')),
  options jsonb,
  position int not null default 0,
  required boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_questions_role_position
  on custom_questions(role_key, position);

-- Make sure anonymous/authenticated users cannot mutate role/question
-- definitions. Only the service-role key (used by /api/admin/*) writes.
revoke insert, update, delete on custom_roles from anon, authenticated;
revoke insert, update, delete on custom_questions from anon, authenticated;
