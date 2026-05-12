# Nandu Web App Form — Implementation Plan

## Goal
Build a production-ready interview app for LD Brain using Next.js, Supabase, Vercel, and an LLM so Nandu Bhai and MDs can be captured in a structured, reusable way.

## Architecture
- Frontend: Next.js App Router on Vercel
- Storage: Supabase tables for sessions, answers, and summaries
- Intelligence: OpenAI-compatible LLM endpoint, ideally OpenRouter
- Deployment: GitHub -> Vercel -> custom domain linkdprints.com

## Phase 1 — Core app
1. Keep the role chooser and name input.
2. Start a session in Supabase.
3. Show one question at a time.
4. Save each answer immediately.
5. Complete the session and generate an LLM summary.

## Phase 2 — Admin and governance
1. Add auth for internal users.
2. Add question editor UI.
3. Add export to CSV / Excel / SOP.
4. Add audit trail and review workflow.

## Phase 3 — LD Brain expansion
1. Add more role-based flows.
2. Add document linking and file attachments.
3. Connect outputs to daily LD Brain updates.
4. Add analytics for missing knowledge gaps.

## Files created so far
- app/page.tsx
- app/api/sessions/route.ts
- app/api/answers/route.ts
- app/api/complete/route.ts
- lib/questions.ts
- lib/llm.ts
- lib/supabase.ts
- supabase/schema.sql
- .env.example
- README.md

## Notes
- The app is designed to be expanded beyond Nandu Bhai.
- MD interview mode is already included in the first scaffold.
- OpenRouter-compatible LLM support is wired into the backend.
