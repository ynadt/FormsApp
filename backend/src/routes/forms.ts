import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middlewares/authMiddleware';
import APIError from '../utils/APIError';
import supabase from '../supabase';
import {
  bulkDeleteSchema,
  formSchema,
  updateFormSchema,
} from '../validators/formsValidation';
import { transformForm } from '../utils/transformers';
import {
  buildPaginationOptions,
  buildSortingOptions,
} from '../utils/queryOptions';

const router = Router();

/**
 * GET /forms
 * - For admins: returns all forms.
 * - For non-admin/unauthenticated: returns only forms whose associated template is public.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take, page, limit } = buildPaginationOptions(req.query);
    const orderBy = buildSortingOptions(req.query.sort as string);

    let currentUser: { id: string; role: string } | null = null;
    const token = req.cookies.access_token;
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        const userRecord = await prisma.user.findUnique({
          where: { id: data.user.id },
          select: { role: true },
        });
        currentUser = { id: data.user.id, role: userRecord?.role || 'USER' };
      }
    }

    const queryOptions: any = {
      where: {},
      skip,
      take,
      orderBy,
      include: {
        user: { select: { id: true, email: true, name: true } },
        template: {
          include: {
            user: { select: { id: true, email: true, name: true } },
            topic: true,
            tags: { include: { tag: true } },
          },
        },
        answers: true,
      },
    };

    if (!currentUser || currentUser.role !== 'ADMIN') {
      queryOptions.where = {
        ...queryOptions.where,
        template: { public: true },
      };
    }

    const totalCount = await prisma.form.count({ where: queryOptions.where });
    const forms = await prisma.form.findMany(queryOptions);
    const transformedForms = forms.map(transformForm);

    res.json({ data: transformedForms, total: totalCount, page, limit });
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

router.get(
  '/my-forms',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take, page, limit } = buildPaginationOptions(req.query);
      const orderBy = buildSortingOptions(req.query.sort as string);

      const queryOptions: any = {
        where: {
          OR: [{ userId: req.userId }, { template: { userId: req.userId } }],
        },
        skip,
        take,
        orderBy,
        include: {
          user: { select: { id: true, email: true, name: true } },
          template: {
            include: {
              user: { select: { id: true, email: true, name: true } },
              topic: true,
              tags: { include: { tag: true } },
            },
          },
          answers: true,
        },
      };

      const totalCount = await prisma.form.count({ where: queryOptions.where });
      const forms = await prisma.form.findMany(queryOptions);
      const transformedForms = forms.map(transformForm);

      res.json({ data: transformedForms, total: totalCount, page, limit });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.delete(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
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

      const deleteFilter =
        req.role === 'ADMIN'
          ? { id: { in: ids } }
          : { id: { in: ids }, userId: req.userId };

      await prisma.$transaction([
        prisma.answer.deleteMany({
          where: { form: { id: { in: ids } } },
        }),
      ]);
      const result = await prisma.form.deleteMany({
        where: deleteFilter,
      });

      res.json({ deletedCount: result.count });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await prisma.form.findUnique({
        where: { id: req.params.id },
        include: {
          user: { select: { id: true, email: true, name: true } },
          answers: true,
          template: {
            include: {
              user: { select: { id: true, email: true, name: true } },
              topic: true,
              tags: { include: { tag: true } },
              questions: true,
            },
          },
        },
      });
      if (!form) {
        return next(new APIError('Form not found', 404));
      }
      res.json(transformForm(form));
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = formSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const { templateId, answers } = validation.data;
      const newForm = await prisma.form.create({
        data: {
          templateId,
          userId: req.userId!,
        },
      });

      const answerPromises = Object.entries(answers).map(
        ([questionId, answerValue]) =>
          prisma.answer.create({
            data: {
              formId: newForm.id,
              questionId,
              value: answerValue || null,
            },
          }),
      );
      await Promise.all(answerPromises);
      const fullForm = await prisma.form.findUnique({
        where: { id: newForm.id },
        include: { answers: true },
      });
      res.status(201).json(fullForm);
    } catch (error: any) {
      if (error instanceof Error) {
        next(new APIError(error.message, 500));
      }
    }
  },
);

router.put(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existingForm = await prisma.form.findUnique({
        where: { id: req.params.id },
        include: { answers: true },
      });
      if (!existingForm) {
        return next(new APIError('Form not found', 404));
      }

      if (existingForm.userId !== req.userId && req.role !== 'ADMIN') {
        return next(new APIError('Not authorized to edit this form', 403));
      }

      const validation = updateFormSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const { answers, version } = validation.data;
      const updateFormResult = await prisma.form.updateMany({
        where: { id: req.params.id, version },
        data: { version: { increment: 1 } },
      });
      if (updateFormResult.count === 0) {
        return next(
          new APIError(
            'Conflict detected. The form has been modified by someone else.',
            409,
          ),
        );
      }
      const answerUpsertPromises = Object.entries(answers).map(
        ([questionId, answerValue]) =>
          prisma.answer.upsert({
            where: {
              formId_questionId: {
                formId: req.params.id,
                questionId,
              },
            },
            update: {
              value: answerValue || null,
            },
            create: {
              formId: req.params.id,
              questionId,
              value: answerValue || null,
            },
          }),
      );
      await Promise.all(answerUpsertPromises);
      const updatedForm = await prisma.form.findUnique({
        where: { id: req.params.id },
        include: { answers: true },
      });
      res.json(updatedForm);
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

export default router;
