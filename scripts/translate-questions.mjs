#!/usr/bin/env node
// Auto-translate a question set from Latin Hinglish to Devanagari.
//
// Usage:
//   node scripts/translate-questions.mjs <input.json> [output.json]
//
// Input file shape: an array of Question objects with at least
// { id, section, prompt, type, options? }. The script asks the LLM to
// add sectionHi / promptHi / optionsHi to each entry, preserving English
// technical terms ("machine", "ICC profile", etc.) in Latin script — the
// same convention used in Nandu's hand-written set. Output is the same
// array with the Hindi fields filled in, suitable for pasting into
// lib/questions.ts.
//
// Reads OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL from .env.local.

import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SYSTEM_PROMPT = `You translate Indian factory interview questions from Latin Hinglish to Devanagari-script Hinglish.

Rules:
1. Output Devanagari for Hindi words/grammar. Keep English technical terms (machine, ICC profile, Delta-E, KATA, polyester, etc.) in Latin script — DO NOT transliterate them to Devanagari.
2. Numbers and units stay as-is (5 din, 15 metres, 185-190°C, etc.).
3. Keep option-letter prefixes (A., B., C.) and structure identical to the input.
4. Section names: same Hindi style as 'भाग 1: मशीन चयन (Machine Selection)' — Hindi prefix, parenthetical English.
5. Preserve the meaning exactly. Do not paraphrase or shorten.
6. Output strict JSON only, no commentary, matching the input shape but with sectionHi/promptHi/optionsHi added.`;

async function main() {
  const inputArg = process.argv[2];
  const outputArg = process.argv[3];
  if (!inputArg) {
    console.error('Usage: node scripts/translate-questions.mjs <input.json> [output.json]');
    process.exit(1);
  }
  loadDotEnvLocal();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in .env.local');
    process.exit(1);
  }
  const baseURL = process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

  const inputPath = path.resolve(inputArg);
  const outputPath = path.resolve(outputArg || inputArg.replace(/\.json$/, '.translated.json'));
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  if (!Array.isArray(input)) {
    console.error('Input JSON must be an array of question objects.');
    process.exit(1);
  }

  console.log(`Translating ${input.length} questions with ${model}...`);
  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'https://linkdprints.com',
      'X-Title': process.env.OPENROUTER_APP_NAME || 'LD Brain Question Translator',
    },
  });

  // Process in small chunks so the LLM isn't asked to translate 50 questions
  // in one shot (output token limits + drift on long arrays).
  const CHUNK = 5;
  const out = [];
  for (let i = 0; i < input.length; i += CHUNK) {
    const slice = input.slice(i, i + CHUNK);
    process.stdout.write(`  chunk ${i / CHUNK + 1}/${Math.ceil(input.length / CHUNK)}: ${slice.length} questions… `);
    const userPrompt = `Translate these ${slice.length} questions. Return JSON: { "items": [<same shape, with sectionHi/promptHi/optionsHi added>] }.\n\nInput:\n${JSON.stringify(slice, null, 2)}`;
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    const text = response.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('\nFailed to parse LLM JSON for chunk', i / CHUNK + 1);
      console.error(text);
      process.exit(1);
    }
    const items = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    if (items.length !== slice.length) {
      console.error(`\nChunk returned ${items.length} items but ${slice.length} were sent.`);
      process.exit(1);
    }
    out.push(...items);
    console.log('ok');
  }

  fs.writeFileSync(outputPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`\nWrote ${out.length} translated questions to ${outputPath}`);
  console.log('Copy the array into lib/questions.ts under the appropriate role key.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
