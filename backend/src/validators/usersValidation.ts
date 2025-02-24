import { z } from 'zod';

export const bulkUpdateRoleSchema = z.object({
  ids: z.array(z.string()),
  role: z.enum(['ADMIN', 'USER']),
});

export const bulkBlockSchema = z.object({
  ids: z.array(z.string()),
  blocked: z.boolean(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
});
