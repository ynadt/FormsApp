import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middlewares/authMiddleware';
import APIError from '../utils/APIError';
import { DEFAULT_LIMIT } from '../constants';
import supabase from '../supabase';
import {
  bulkDeleteSchema,
  formSchema,
  updateFormSchema,
} from '../validators/formsValidation';

const router = Router();

const transformForm = (frm: any) => ({
  id: frm.id,
  authorId: frm.user?.id || '',
  authorEmail: frm.user?.email || '',
  authorName: frm.user?.name || '',
  createdAt: frm.createdAt.toISOString(),
  updatedAt: frm.updatedAt.toISOString(),
  version: frm.version,
  answers: frm.answers,
  template: frm.template
    ? {
        id: frm.template.id,
        title: frm.template.title,
        description: frm.template.description,
        image_url: frm.template.image_url,
        public: frm.template.public,
        createdAt: frm.template.createdAt.toISOString(),
        updatedAt: frm.template.updatedAt.toISOString(),
        version: frm.template.version,
        authorId: frm.template.user?.id || '',
        authorEmail: frm.template.user?.email || '',
        authorName: frm.template.user?.name || '',
        questions: frm.template.questions || [],
        topic: frm.template.topic
          ? { id: frm.template.topic.id, name: frm.template.topic.name }
          : null,
        tags:
          frm.template.tags?.map((tt: any) => ({
            id: tt.id,
            name: tt.tag.name,
          })) || [],
      }
    : null,
});

/**
 * GET /forms
 * - For admins: returns all forms.
 * - For non-admin/unauthenticated: returns only forms whose associated template is public.
 * Returns a paginated list of transformed forms.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sort = req.query.sort as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

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
      skip: offset,
      take: limit,
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

    if (sort) {
      const [field, direction] = sort.split(':');
      if (field && direction) {
        if (field === 'authorEmail') {
          queryOptions.orderBy = { user: { email: direction } };
        } else if (field === 'templateTitle') {
          queryOptions.orderBy = { template: { title: direction } };
        } else {
          queryOptions.orderBy = { [field]: direction };
        }
      } else if (sort === 'popular') {
        queryOptions.orderBy = { answers: { _count: 'desc' } };
      } else if (sort === 'newest') {
        queryOptions.orderBy = { createdAt: 'desc' };
      }
    } else {
      queryOptions.orderBy = { createdAt: 'desc' };
    }

    if (!currentUser || currentUser.role !== 'ADMIN') {
      queryOptions.where = {
        ...queryOptions.where,
        template: { public: true },
      };
    }

    const totalCount = await prisma.form.count({
      where: queryOptions.where,
    });
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      const queryOptions: any = {
        where: {
          OR: [{ userId: req.userId }, { template: { userId: req.userId } }],
        },
        skip: offset,
        take: limit,
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

      const sort = req.query.sort as string | undefined;
      if (sort) {
        const [field, direction] = sort.split(':');
        if (field && direction) {
          if (field === 'authorEmail') {
            queryOptions.orderBy = { user: { email: direction } };
          } else if (field === 'templateTitle') {
            queryOptions.orderBy = { template: { title: direction } };
          } else {
            queryOptions.orderBy = { [field]: direction };
          }
        } else if (sort === 'popular') {
          queryOptions.orderBy = { answers: { _count: 'desc' } };
        } else if (sort === 'newest') {
          queryOptions.orderBy = { createdAt: 'desc' };
        }
      } else {
        queryOptions.orderBy = { createdAt: 'desc' };
      }

      const totalCount = await prisma.form.count({
        where: queryOptions.where,
      });
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
