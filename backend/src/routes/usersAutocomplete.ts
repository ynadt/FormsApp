import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import APIError from '../utils/APIError';
import { requireAuth } from '../middlewares/authMiddleware';
import { Prisma } from '@prisma/client';

const router = Router();

router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string | undefined;

      if (!search) {
        res.json([]);
        return;
      }

      const whereClause: Prisma.UserWhereInput = {
        OR: [
          {
            email: {
              startsWith: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            name: {
              startsWith: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ],
      };

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
        },
        take: 10,
      });
      res.json(users);
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

export default router;
