import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { z } from 'zod';
import { requireAuth } from '../middlewares/authMiddleware';
import APIError from '../utils/APIError';

const router = Router();
router.use(requireAuth);

router.get(
  '/:id/users',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessList = await prisma.templateAccess.findMany({
        where: { templateId: req.params.id },
        include: { user: { select: { id: true, email: true } } },
      });
      res.json(accessList.map((item) => item.user));
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

const addUserSchema = z.object({ userId: z.string() });
router.post(
  '/:id/users',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = addUserSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const access = await prisma.templateAccess.create({
        data: { templateId: req.params.id, userId: validation.data.userId },
      });
      res.status(201).json(access);
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.delete(
  '/:id/users/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.templateAccess.deleteMany({
        where: { templateId: req.params.id, userId: req.params.userId },
      });
      res.status(204).send();
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

export default router;
