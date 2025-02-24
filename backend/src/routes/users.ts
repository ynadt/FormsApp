import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import APIError from '../utils/APIError';
import { requireAuth, adminOnly } from '../middlewares/authMiddleware';
import supabase from '../supabase';
import {
  bulkBlockSchema,
  bulkUpdateRoleSchema,
} from '../validators/usersValidation';
import { bulkDeleteSchema } from '../validators/formsValidation';
import {
  buildPaginationOptions,
  buildSortingOptions,
} from '../utils/queryOptions';

const router = Router();

router.use(requireAuth);
router.use(adminOnly);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take, page, limit } = buildPaginationOptions(req.query);
    const orderBy = buildSortingOptions(req.query.sort as string);

    const queryOptions: any = {
      skip,
      take,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        blocked: true,
      },
    };

    const totalCount = await prisma.user.count();
    const users = await prisma.user.findMany(queryOptions);

    res.json({ data: users, total: totalCount, page, limit });
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
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
