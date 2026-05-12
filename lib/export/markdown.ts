import type { RoleMeta } from '@/lib/types';
import { ldBrainFolder } from '@/lib/roles';

export interface SessionRow {
  id: string;
  role: string;
  respondent_name: string | null;
  company: string | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AnswerRow {
  question_id: string;
  question_text: string;
  section: string;
  answer_text: string;
  answer_json?: unknown;
  audio_path?: string | null;
  audio_duration_seconds?: number | null;
}

export interface SummaryRow {
  summary_text: string;
  llm_model: string | null;
  themes?: unknown;
}

export interface BuildArgs {
  session: SessionRow;
  answers: AnswerRow[];
  summary: SummaryRow | null;
  role: RoleMeta;
  supabaseUrl: string;
}

export function buildLdBrainMarkdown({
  session,
  answers,
  summary,
  role,
  supabaseUrl,
}: BuildArgs): { markdown: string; filename: string; suggestedPath: string } {
  const respondent = (session.respondent_name || role.label || role.key).trim();
  const completedAt = session.completed_at || new Date().toISOString();
  const dateStr = (completedAt.split('T')[0] || '').replaceAll('-', '');
  const slugRespondent = slug(respondent);
  const slugRole = slug(role.key);
  const filename = `${dateStr}_${slugRole}_${slugRespondent}.md`;
  const suggestedPath = `${ldBrainFolder(role.company)}/${filename}`;

  const header =
    role.framing === 'sop'
      ? `# SOP & AI Productivity Tools Interview — ${respondent}`
      : `# Leadership Interview — ${respondent}`;

  const framingNote =
    role.framing === 'sop'
      ? '> Captured for SOP improvement and AI productivity tools. Frame insights as process clarity, not as succession or knowledge transfer.'
      : '> Captured for strategic and leadership context.';

  const lines: string[] = [];

  lines.push('---');
  lines.push(`session_id: ${session.id}`);
  lines.push(`respondent: ${yamlEscape(respondent)}`);
  lines.push(`role: ${role.key}`);
  lines.push(`role_label: ${yamlEscape(role.label)}`);
  if (role.company) lines.push(`company: ${yamlEscape(role.company)}`);
  lines.push(`framing: ${role.framing}`);
  lines.push(`started_at: ${session.started_at}`);
  lines.push(`completed_at: ${completedAt}`);
  if (summary?.llm_model) lines.push(`model: ${summary.llm_model}`);
  lines.push(`suggested_path: ${yamlEscape(suggestedPath)}`);
  lines.push('---');
  lines.push('');
  lines.push(header);
  lines.push('');
  lines.push(framingNote);
  lines.push('');
  lines.push(`*Source: nandu-web-app-form.vercel.app · Captured ${completedAt}*`);
  lines.push('');

  if (summary?.summary_text) {
    lines.push('## Summary');
    lines.push('');
    lines.push(summary.summary_text.trim());
    lines.push('');
  }

  lines.push('## Raw Answers');
  lines.push('');

  const grouped = groupBySection(answers);
  for (const section of grouped.keys()) {
    lines.push(`### ${section}`);
    lines.push('');
    for (const a of grouped.get(section)!) {
      lines.push(`**${a.question_id} — ${a.question_text}**`);
      lines.push('');
      const answerBlock = (a.answer_text || '').trim();
      if (answerBlock) {
        for (const line of answerBlock.split(/\r?\n/)) {
          lines.push(`> ${line}`);
        }
      } else {
        lines.push('> _(no text answer)_');
      }
      if (a.audio_path) {
        const url = audioUrl(supabaseUrl, a.audio_path);
        const duration = a.audio_duration_seconds
          ? ` (${formatDuration(a.audio_duration_seconds)})`
          : '';
        lines.push('');
        lines.push(`🎙️ [Voice note${duration}](${url})`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return { markdown: lines.join('\n'), filename, suggestedPath };
}

function groupBySection(answers: AnswerRow[]): Map<string, AnswerRow[]> {
  const map = new Map<string, AnswerRow[]>();
  for (const a of answers) {
    if (!map.has(a.section)) map.set(a.section, []);
    map.get(a.section)!.push(a);
  }
  return map;
}

export function audioUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/interview-audio/${path}`;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'untitled';
}

function yamlEscape(value: string): string {
  if (/[:#@`'"\[\]\{\},&*?|<>=!%]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
