import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middlewares/authMiddleware';
import APIError from '../utils/APIError';
import { commentSchema } from '../validators/commentsValidation';

const router = Router();

router.get(
  '/:templateId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comments = await prisma.comment.findMany({
        where: { templateId: req.params.templateId },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      res.json(comments);
    } catch (error) {
      if (error instanceof Error) {
        next(new APIError(error.message, 500));
      }
    }
  },
);

router.post(
  '/:templateId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = commentSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const comment = await prisma.comment.create({
        data: {
          templateId: req.params.templateId,
          userId: req.userId!,
          text: validation.data.text,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof Error) {
        next(new APIError(error.message, 500));
      }
    }
  },
);

// DELETE /comments/:templateId/:commentId – Delete a comment.
router.delete(
  '/:templateId/:commentId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: req.params.commentId },
      });
      if (!comment) {
        return next(new APIError('Comment not found', 404));
      }
      if (comment.userId !== req.userId) {
        return next(new APIError('Not authorized to delete this comment', 403));
      }
      await prisma.comment.delete({ where: { id: req.params.commentId } });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        next(new APIError(error.message, 500));
      }
    }
  },
);

export default router;
