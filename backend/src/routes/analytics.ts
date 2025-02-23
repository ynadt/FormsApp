import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import APIError from '../utils/APIError';

const router = Router();

const getMostFrequentAnswer = (answers: string[]): string => {
  const frequency: Record<string, number> = {};
  answers.forEach((answer) => {
    frequency[answer] = (frequency[answer] || 0) + 1;
  });
  let mostFrequent = '';
  let maxCount = 0;
  for (const [answer, count] of Object.entries(frequency)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = answer;
    }
  }
  return mostFrequent;
};

router.get(
  '/:templateId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;

      const responseCount = await prisma.form.count({
        where: { templateId },
      });

      const questions = await prisma.question.findMany({
        where: { templateId, showInResults: true },
        include: {
          answers: {
            select: {
              value: true,
            },
          },
        },
      });

      const questionAnalyticsData = questions.map((question) => {
        const answers = question.answers.map((answer) => answer.value);
        const nonNullAnswers = answers.filter((a): a is string => a !== null);
        const questionType = question.type;
        const questionTitle = question.title;

        let aggregatedData: any = {};

        if (questionType === 'SINGLE_LINE' || questionType === 'MULTI_LINE') {
          const mostFrequentAnswer = getMostFrequentAnswer(nonNullAnswers);
          aggregatedData = {
            answerCount: nonNullAnswers.length,
            mostFrequentAnswer,
          };
        } else if (questionType === 'CHECKBOX') {
          const checkedCount = nonNullAnswers.filter(
            (v) => v === 'true',
          ).length;
          const uncheckedCount = nonNullAnswers.filter(
            (v) => v === 'false',
          ).length;
          aggregatedData = {
            checkedCount,
            uncheckedCount,
            totalCount: nonNullAnswers.length,
          };
        } else if (questionType === 'INTEGER') {
          const numericAnswers = nonNullAnswers
            .map(Number)
            .filter((v) => !isNaN(v));
          const avg =
            numericAnswers.length > 0
              ? numericAnswers.reduce((a: number, b: number) => a + b, 0) /
                numericAnswers.length
              : 0;
          aggregatedData = { average: avg, count: numericAnswers.length };
        }

        return {
          questionId: question.id,
          questionTitle,
          questionType,
          aggregatedData,
        };
      });

      res.json({ responseCount, questionAnalyticsData });
    } catch (error) {
      if (error instanceof Error) {
        next(new APIError(error.message, 500));
      }
    }
  },
);

export default router;
