import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import APIError from '../utils/APIError';
import supabase from '../supabase';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/:templateId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const userId = req.userId!;
      const existing = await prisma.like.findFirst({
        where: { templateId, userId },
      });
      if (existing) {
        return next(new APIError('Already liked', 400));
      }
      const like = await prisma.like.create({
        data: { templateId, userId },
      });
      res.status(201).json(like);
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.delete(
  '/:templateId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const userId = req.userId!;
      await prisma.like.deleteMany({
        where: { templateId, userId },
      });
      res.status(204).send();
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.get(
  '/:templateId/count',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const count = await prisma.like.count({
        where: { templateId },
      });
      res.json({ count });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.get(
  '/:templateId/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { templateId } = req.params;
      const count = await prisma.like.count({ where: { templateId } });

      let userId: string | null = null;
      const token = req.cookies.access_token;
      if (token) {
        const { data } = await supabase.auth.getUser(token);
        if (data.user) {
          userId = data.user.id;
        }
      }

      if (!userId) {
        res.json({ count, liked: false });
        return;
      }

      const likedRecord = await prisma.like.findFirst({
        where: { templateId, userId: userId! },
      });

      res.json({ count, liked: Boolean(likedRecord) });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

export default router;
