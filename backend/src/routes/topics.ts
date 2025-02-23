import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import APIError from '../utils/APIError';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const topics = await prisma.topic.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
      select: { id: true, name: true },
    });
    res.json(topics);
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

export default router;
