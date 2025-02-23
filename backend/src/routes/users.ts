import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { z } from 'zod';
import APIError from '../utils/APIError';
import { requireAuth, adminOnly } from '../middlewares/authMiddleware';
import supabase from '../supabase';

const router = Router();
const DEFAULT_LIMIT = 10;

router.use(requireAuth);
router.use(adminOnly);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;
    const sort = req.query.sort as string | undefined;

    const queryOptions: any = {
      skip: offset,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
      },
    };

    if (sort) {
      const [field, direction] = sort.split(':');
      if (field && direction) {
        queryOptions.orderBy = { [field]: direction };
      }
    }

    const totalCount = await prisma.user.count();
    const users = await prisma.user.findMany(queryOptions);

    res.json({ data: users, total: totalCount, page, limit });
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

const bulkUpdateRoleSchema = z.object({
  ids: z.array(z.string()),
  role: z.enum(['ADMIN', 'USER']),
});
router.put(
  '/update-role',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = bulkUpdateRoleSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const { ids, role } = validation.data;
      const updated = await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role },
      });
      res.json({ updatedCount: updated.count });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

const bulkBlockSchema = z.object({
  ids: z.array(z.string()),
  blocked: z.boolean(),
});
router.put(
  '/block',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = bulkBlockSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const { ids, blocked } = validation.data;
      const updated = await prisma.user.updateMany({
        where: { id: { in: ids }, blocked: { not: blocked } },
        data: { blocked },
      });
      res.json({
        updatedCount: updated.count,
        message:
          updated.count === 0
            ? 'No changes made. Users already in desired state.'
            : 'Users block state updated.',
      });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
});
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = bulkDeleteSchema.safeParse(req.body);
    if (!validation.success) {
      return next(
        new APIError(
          'Validation failed',
          400,
          JSON.stringify(validation.error.errors),
        ),
      );
    }
    const { ids } = validation.data;
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
    const deletionResults = await Promise.all(
      ids.map(async (userId) => {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        return { userId, error };
      }),
    );
    const failedDeletions = deletionResults.filter((result) => result.error);
    if (failedDeletions.length > 0) {
      console.error('Supabase deletion errors:', failedDeletions);
      return next(
        new APIError(
          `Failed to delete ${failedDeletions.length} Supabase user(s)`,
          500,
        ),
      );
    }
    res.json({ deletedCount: deleted.count });
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

export default router;
