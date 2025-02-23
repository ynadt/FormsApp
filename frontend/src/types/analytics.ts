import { QuestionType } from './template.ts';

type QuestionAnalytics = {
  questionId: string;
  questionTitle: string;
  questionType: QuestionType;
  aggregatedData: {
    answerCount?: number;
    mostFrequentAnswer?: string;
    average?: number;
    count?: number;
    checkedCount?: number;
    uncheckedCount?: number;
    totalCount?: number;
  };
};

export type AnalyticsData = {
  responseCount: number;
  questionAnalyticsData: QuestionAnalytics[];
};
