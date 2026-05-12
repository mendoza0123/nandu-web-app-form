export type InterviewRole = 'nandu' | 'md';
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
