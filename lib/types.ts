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
  // false → hidden from the landing page chooser. Defaults to true.
  visible?: boolean;
}

export type QuestionType = 'radio' | 'checkbox' | 'textarea' | 'text' | 'number' | 'date';

export interface Question {
  id: string;
  section: string;
  sectionHi?: string;
  prompt: string;
  promptHi?: string;
  type: QuestionType;
  options?: string[];
  optionsHi?: string[];
  help?: string;
  required?: boolean;
  // For MCQ-style questions, allow an additional free-text "Notes" / अन्य
  // textarea below the options so Nandu can write in something beyond A/B/C/D.
  allowNotes?: boolean;
}

export type PromptLang = 'hi' | 'en';

export interface SessionResponse {
  id: string;
  role: InterviewRole;
  respondentName?: string | null;
}
