export type InterviewRole = string;

export type Framing = 'sop' | 'leadership';
export type RoleSource = 'code' | 'db';

export interface RoleMeta {
  key: string;
  label: string;
  company?: string;
  framing: Framing;
  expectedMinutes?: number;
  source: RoleSource;
  description?: string;
}

export type QuestionType = 'radio' | 'checkbox' | 'textarea' | 'text' | 'number' | 'date';

export interface Question {
  id: string;
  section: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  help?: string;
  required?: boolean;
}

export interface SessionResponse {
  id: string;
  role: InterviewRole;
  respondentName?: string | null;
}
