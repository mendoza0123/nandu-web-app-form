# LD Brain — helper scripts

## translate-questions.mjs

Takes a JSON array of questions in Latin Hinglish and produces the same
array with Devanagari fields (`sectionHi`, `promptHi`, `optionsHi`)
filled in. Use when onboarding a new role (Raghav, Dilip, Laxmikant,
etc.) so you don't hand-write Hindi for every question.

### Workflow

1. Write the English/Hinglish version of the new role's questions as a
   plain array in a temporary `.json` file. Example:
   ```json
   [
     {
       "id": "A1",
       "section": "Sec 1: Customer Strategy",
       "prompt": "Aapke top 5 customers kaun se hain?",
       "type": "textarea"
     },
     {
       "id": "A2",
       "section": "Sec 1: Customer Strategy",
       "prompt": "Customer churn ke main reasons?",
       "type": "checkbox",
       "options": ["A. Price", "B. Quality", "C. Range", "D. Service"]
     }
   ]
   ```

2. Run the script from the project root:
   ```bash
   node scripts/translate-questions.mjs questions-in.json questions-out.json
   ```
   Script reads `.env.local` for `OPENAI_API_KEY`, `OPENAI_BASE_URL`,
   `OPENAI_MODEL`. Defaults to `openai/gpt-4o-mini` via OpenRouter.

3. Output is the same array with Hindi fields added:
   ```json
   [
     {
       "id": "A1",
       "section": "Sec 1: Customer Strategy",
       "sectionHi": "भाग 1: Customer Strategy",
       "prompt": "Aapke top 5 customers kaun se hain?",
       "promptHi": "आपके top 5 customers कौन से हैं?",
       "type": "textarea"
     },
     ...
   ]
   ```

4. Copy the array into `lib/questions.ts` under the new role key, then
   register the role in `lib/roles.ts`. Bump `QUESTION_SET_VERSION` in
   `app/page.tsx` if existing sessions might collide.

### Notes
- Translation rules baked into the system prompt:
  - English technical terms (machine, ICC profile, KATA, Delta-E, etc.)
    stay in Latin script.
  - Numbers + units stay as-is.
  - Option letter prefixes (A., B.) preserved.
- Chunked at 5 questions per LLM call to keep output reliable.
- Cost on `gpt-4o-mini`: well under a cent for a typical 15-question set.
