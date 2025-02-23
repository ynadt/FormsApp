import { Question, TemplateBase } from './template.ts';

export interface Answer {
  id: string;
  formId: string;
  questionId: string;
  value?: string | null;
}

export interface FormType {
  id: string;
  authorId: string;
  authorEmail: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  answers: Answer[];
  template: TemplateBase & { questions: Question[] };
}

export interface FormListResponse {
  data: FormType[];
  total: number;
  page: number;
  limit: number;
}
