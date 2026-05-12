import type { RoleMeta } from '@/lib/types';

// Code-defined roles. Custom roles added via /admin live in the
// `custom_roles` Supabase table and are merged at runtime by /api/roles.

export const CODED_ROLES: Record<string, RoleMeta> = {
  nandu: {
    key: 'nandu',
    label: 'Nandu Bhai',
    company: 'Linkd Prints',
    framing: 'sop',
    expectedMinutes: 15,
    source: 'code',
    description: 'Production floor SOPs and AI-productivity capture for Linkd Prints.',
  },
  md: {
    key: 'md',
    label: 'MD / Leader',
    company: undefined,
    framing: 'leadership',
    expectedMinutes: 10,
    source: 'code',
    description: 'Strategy, priorities, and decision rules for company MDs and leaders.',
  },
};

export function getCodedRole(key: string): RoleMeta | undefined {
  return CODED_ROLES[key];
}

export function listCodedRoles(): RoleMeta[] {
  return Object.values(CODED_ROLES);
}

// Folder shape for the LD-Brain markdown export. Falls back to the
// group-level overview folder when a role has no company.
export function ldBrainFolder(company: string | undefined | null): string {
  if (!company) return 'LD Group Overview/dynamic/interviews';
  return `${company}/dynamic/interviews`;
}
