# Nandu Web App Form

A Next.js + Supabase + LLM interview app for LD Brain knowledge capture.

## What it does
- Chat-style one-question-at-a-time flow
- Role-based capture for Nandu Bhai and MDs
- Saves answers to Supabase
- Uses an LLM for summary and knowledge extraction
- Ready to deploy on Vercel and point to linkdprints.com

## Tech stack
- Next.js 14
- TypeScript
- Supabase
- OpenAI-compatible LLM endpoint (OpenRouter recommended)
- Vercel hosting

## Local setup
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase + LLM keys
3. Install dependencies:
   `npm install`
4. Run:
   `npm run dev`

## Supabase
Run `supabase/schema.sql` in the Supabase SQL editor.

## Deploy to Vercel
1. Push this folder to GitHub
2. Import the repo in Vercel
3. Add env vars
4. Set the custom domain `linkdprints.com`
5. Deploy

## Next steps
- Add login / admin protection
- Add question editor UI
- Add reports and exports
- Add MD interview flows
