# Nandu Web App Form — Project Skill / Handoff

## Overview
This project is a Next.js questionnaire app for capturing structured interview answers from Nandu Bhai, MDs, and other leaders.

It is designed for:
- one-question-at-a-time chat flow
- structured answer capture
- Supabase-backed storage
- LLM-assisted summaries
- Vercel deployment for `linkdprints.com`

This file is a project-local handoff so VS Code and future work sessions can quickly understand what has already been built.

## What has already been done
- Created the project in:
  - `/mnt/e/Nandu web app form`
- Built a Next.js + TypeScript app scaffold
- Added chat-style interview UI
- Added question routing for different leadership roles
- Added LLM support using an OpenAI-compatible client pattern
- Added Supabase integration files and schema
- Added API routes for:
  - `/api/sessions`
  - `/api/answers`
  - `/api/complete`
- Created a vision / plan document based on the questionnaire reference
- Verified the app builds successfully with `npm run build`

## Main files
- `app/page.tsx` — main chat/form UI
- `app/layout.tsx` — app shell and metadata
- `app/api/sessions/route.ts` — create or load interview sessions
- `app/api/answers/route.ts` — store submitted answers
- `app/api/complete/route.ts` — generate final summary at completion
- `lib/questions.ts` — questionnaire definition and flow
- `lib/llm.ts` — LLM summary helper
- `lib/supabase.ts` — Supabase client helpers
- `supabase/schema.sql` — database schema
- `.env.example` — required environment variables
- `IMPLEMENTATION_PLAN.md` — rollout plan
- `Nandu_Web_App_Form_Vision_and_Plan.md` — product vision and questionnaire mapping
- `Nandu_Web_App_Form_Vision_and_Plan.docx` — document version of the same

## Current architecture
- Frontend: Next.js App Router
- Backend: Next.js API routes
- Storage: Supabase
- LLM: OpenAI-compatible API endpoint, with OpenRouter-compatible setup by default
- Hosting target: Vercel
- Domain target: `linkdprints.com`

## Environment variables
Expected env vars are documented in `.env.example`.

Typical required values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` or compatible LLM key
- `OPENAI_BASE_URL` for OpenRouter-compatible setup

## Working rules for this project
- Do not delete user files unless explicitly requested
- Prefer copying over moving when organizing files
- Keep the interview flow human and one-question-at-a-time
- Preserve the ability to export answers cleanly
- Treat the app as a product, not just a static form

## Suggested next steps
1. Connect the app to a real Supabase project
2. Add authentication for admin use
3. Add an answer review/export screen
4. Add deployment config for Vercel
5. Add nicer analytics / dashboard outputs for LD Brain
6. Add question editor so the form can evolve without code changes

## Verification
Before shipping changes, confirm:
- `npm install` succeeds
- `npm run build` succeeds
- Supabase tables match `supabase/schema.sql`
- LLM env vars are present if summaries are expected
- Session flow still works from start to completion
