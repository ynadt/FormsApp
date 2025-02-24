import { z } from 'zod';

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const formSchema = z.object({
  templateId: z.string(),
  answers: z.record(z.string().optional()),
});

export const updateFormSchema = z.object({
  answers: z.record(z.string().optional()),
  version: z.number(),
});
