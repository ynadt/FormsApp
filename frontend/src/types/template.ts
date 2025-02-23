export interface TemplateBase {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  authorId: string;
  authorEmail: string;
  authorName?: string;
  topic?: Topic | null;
  tags: TemplateTag[];
}

export interface FullTemplate extends TemplateBase {
  questions: Question[];
  templateAccesses: TemplateAccess[];
}

export interface TemplateTag {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  order?: number;
  required: boolean;
  showInResults: boolean;
}

export type QuestionType =
  | 'SINGLE_LINE'
  | 'MULTI_LINE'
  | 'INTEGER'
  | 'CHECKBOX';

export interface TemplateAccess {
  id: string;
  user: TemplateAccessUser;
}

export interface TemplateAccessUser {
  id: string;
  email: string;
  name?: string;
}

export interface TemplateCreateData {
  title: string;
  description?: string;
  image_url?: string;
  public: boolean;
  topicId?: string;
  tags: string[];
  questions: NewQuestion[];
  templateAccesses?: { userId: string }[];
}

export interface TemplateUpdateData {
  title: string;
  description?: string;
  image_url?: string;
  public?: boolean;
  topicId?: string;
  version: number;
  tags: string[];
  questions: NewQuestion[];
  templateAccesses: { userId: string }[];
}

export type NewQuestion = Omit<Question, 'id'>;

export interface TemplateListResponse {
  data: TemplateBase[];
  total: number;
  page: number;
  limit: number;
}
