import { z } from 'zod';

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const templateCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image_url: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().url().optional(),
  ),
  public: z.boolean().default(true),
  topicId: z.string().optional(),
  questions: z.array(
    z.object({
      type: z.enum(['SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX']),
      title: z.string().min(1),
      description: z.string().optional(),
      required: z.boolean(),
      showInResults: z.boolean(),
      order: z.number().optional(),
    }),
  ),
  tags: z.array(z.string()),
  templateAccesses: z.array(z.object({ userId: z.string() })).optional(),
});

export const templateUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image_url: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().url().optional(),
  ),
  public: z.boolean().optional(),
  topicId: z.string().optional(),
  tags: z.array(z.string()),
  version: z.number(),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(['SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX']),
        title: z.string().min(1),
        description: z.string().optional(),
        required: z.boolean(),
        showInResults: z.boolean(),
        order: z.number().optional(),
      }),
    )
    .optional(),
  templateAccesses: z
    .array(
      z.object({
        userId: z.string(),
      }),
    )
    .optional(),
});
