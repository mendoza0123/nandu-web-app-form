import type { RoleMeta } from '@/lib/types';

// Code-defined roles. Custom roles added via /admin live in the
// `custom_roles` Supabase table and are merged at runtime by /api/roles.

export const CODED_ROLES: Record<string, RoleMeta> = {
  nandu: {
    key: 'nandu',
    label: 'Nandu Bhai',
    company: 'Linkd Prints',
    framing: 'sop',
    expectedMinutes: 90,
    source: 'code',
    description: 'Production floor SOPs and AI-productivity capture for Linkd Prints (factory ops).',
    visible: true,
  },
  gaurav: {
    key: 'gaurav',
    label: 'Gaurav Ji',
    company: 'LD Silk Mills',
    framing: 'leadership',
    expectedMinutes: 60,
    source: 'code',
    description: 'Sales territory, broker relationships, customer churn, ICP, and Cotton sales intelligence for LD Silk Mills.',
    visible: true,
  },
  md: {
    key: 'md',
    label: 'MD / Leader',
    company: undefined,
    framing: 'leadership',
    expectedMinutes: 10,
    source: 'code',
    description: 'Strategy, priorities, and decision rules for company MDs and leaders.',
    // Hidden on the landing page until we revisit; the question set still
    // lives in lib/questions.ts so a direct ?role=md link could resume.
    visible: false,
  },
};

export function getCodedRole(key: string): RoleMeta | undefined {
  return CODED_ROLES[key];
}

export function listCodedRoles(): RoleMeta[] {
  return Object.values(CODED_ROLES);
}

export function listVisibleCodedRoles(): RoleMeta[] {
  return Object.values(CODED_ROLES).filter((r) => r.visible !== false);
}

// Folder shape for the LD-Brain markdown export. Falls back to the
// group-level overview folder when a role has no company.
export function ldBrainFolder(company: string | undefined | null): string {
  if (!company) return 'LD Group Overview/dynamic/interviews';
  return `${company}/dynamic/interviews`;
}
