import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { z } from 'zod';
import APIError from '../utils/APIError';
import { requireAuth } from '../middlewares/authMiddleware';
import { DEFAULT_LIMIT } from '../constants';
import {
  deleteImageFromStorage,
  haveQuestionsChanged,
  isQuestionOrderChanged,
  updateTemplateAccesses,
  updateTemplateQuestions,
  updateTemplateTags,
} from '../utils/templateUtils';
import supabase from '../supabase';

const router = Router();

const transformTemplate = (tmpl: any) => ({
  id: tmpl.id,
  title: tmpl.title,
  description: tmpl.description,
  image_url: tmpl.image_url,
  public: tmpl.public,
  createdAt: tmpl.createdAt.toISOString(),
  updatedAt: tmpl.updatedAt.toISOString(),
  version: tmpl.version,
  authorId: tmpl.user?.id || '',
  authorEmail: tmpl.user?.email || '',
  authorName: tmpl.user?.name || '',
  topic: tmpl.topic ? { id: tmpl.topic.id, name: tmpl.topic.name } : null,
  tags: tmpl.tags?.map((tt: any) => ({ id: tt.id, name: tt.tag.name })) || [],
});

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
        topic: true,
        tags: { include: { tag: true } },
      },
    };

    if (sort) {
      const [field, direction] = sort.split(':');
      if (field && direction) {
        if (field === 'authorEmail') {
          queryOptions.orderBy = { user: { email: direction } };
        } else {
          queryOptions.orderBy = { [field]: direction };
        }
      } else if (sort === 'popular') {
        queryOptions.orderBy = { forms: { _count: 'desc' } };
      } else if (sort === 'newest') {
        queryOptions.orderBy = { createdAt: 'desc' };
      }
    }

    if (!currentUser || currentUser.role !== 'ADMIN') {
      queryOptions.where.public = true;
    }

    const totalCount = await prisma.template.count({
      where: queryOptions.where,
    });
    const templates = await prisma.template.findMany(queryOptions);
    const transformedTemplates = templates.map(transformTemplate);

    res.json({ data: transformedTemplates, total: totalCount, page, limit });
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

router.get(
  '/my-templates',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      const queryOptions: any = {
        where: { userId: req.userId },
        skip: offset,
        take: limit,
        include: {
          user: { select: { id: true, email: true, name: true } },
          topic: true,
          tags: { include: { tag: true } },
        },
      };

      const sort = req.query.sort as string | undefined;
      if (sort) {
        const [field, direction] = sort.split(':');
        if (field && direction) {
          if (field === 'authorEmail') {
            queryOptions.orderBy = { user: { email: direction } };
          } else {
            queryOptions.orderBy = { [field]: direction };
          }
        } else if (sort === 'popular') {
          queryOptions.orderBy = { forms: { _count: 'desc' } };
        } else if (sort === 'newest') {
          queryOptions.orderBy = { createdAt: 'desc' };
        }
      } else {
        queryOptions.orderBy = { createdAt: 'desc' };
      }

      const totalCount = await prisma.template.count({
        where: queryOptions.where,
      });
      const templates = await prisma.template.findMany(queryOptions);
      const transformedTemplates = templates.map(transformTemplate);

      res.json({ data: transformedTemplates, total: totalCount, page, limit });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        topic: true,
        tags: { include: { tag: true } },
        questions: true,
        templateAccesses: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });
    if (!template) {
      return next(new APIError('Template not found', 404));
    }

    if (!template.public) {
      const token = req.cookies.access_token;
      if (!token) {
        return next(new APIError('Not authorized to view this template', 403));
      }
      const { data } = await supabase.auth.getUser(token);
      if (!data.user) {
        return next(new APIError('Not authorized to view this template', 403));
      }
      const currentUserId = data.user.id;
      const isAuthorized =
        currentUserId === template.user.id ||
        template.templateAccesses.some(
          (access) => access.user.id === currentUserId,
        );
      if (!isAuthorized) {
        return next(new APIError('Not authorized to view this template', 403));
      }
    }

    const transformedTemplate = transformTemplate(template);
    (transformedTemplate as any).questions = template.questions;
    (transformedTemplate as any).templateAccesses = template.templateAccesses;
    res.json(transformedTemplate);
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()),
});
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
          where: { form: { templateId: { in: ids } } },
        }),
        prisma.form.deleteMany({ where: { templateId: { in: ids } } }),
        prisma.comment.deleteMany({ where: { templateId: { in: ids } } }),
        prisma.like.deleteMany({ where: { templateId: { in: ids } } }),
        prisma.templateAccess.deleteMany({
          where: { templateId: { in: ids } },
        }),
        prisma.templateTag.deleteMany({ where: { templateId: { in: ids } } }),
        prisma.question.deleteMany({ where: { templateId: { in: ids } } }),
      ]);
      const result = await prisma.template.deleteMany({
        where: deleteFilter,
      });

      res.json({ deletedCount: result.count });
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

const templateCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image_url: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().url().optional(),
  ),
  public: z.boolean().default(true),
  topicId: z.string().optional(),
  questions: z.array(
    z.object({
      type: z.enum(['SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX']),
      title: z.string().min(1),
      description: z.string().optional(),
      required: z.boolean(),
      showInResults: z.boolean(),
      order: z.number().optional(),
    }),
  ),
  tags: z.array(z.string()),
  templateAccesses: z.array(z.object({ userId: z.string() })).optional(),
});

router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = templateCreateSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error),
          ),
        );
      }
      const data = validation.data;
      const createData: any = {
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        public: data.public,
        userId: req.userId,
        questions: {
          create: data.questions.map((q, index) => ({
            type: q.type,
            title: q.title,
            description: q.description,
            order: q.order || index + 1,
            required: q.required,
            showInResults: q.showInResults,
          })),
        },
      };
      if (data.topicId) {
        createData.topicId = data.topicId;
      }
      if (data.tags && data.tags.length > 0) {
        createData.tags = {
          create: data.tags.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        };
      }
      if (data.templateAccesses && data.templateAccesses.length > 0) {
        createData.templateAccesses = {
          create: data.templateAccesses.map((access) => ({
            userId: access.userId,
          })),
        };
      }
      const newTemplate = await prisma.template.create({
        data: createData,
      });
      res.status(201).json(transformTemplate(newTemplate));
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

const templateUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image_url: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().url().optional(),
  ),
  public: z.boolean().optional(),
  topicId: z.string().optional(),
  tags: z.array(z.string()),
  version: z.number(),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(['SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX']),
        title: z.string().min(1),
        description: z.string().optional(),
        required: z.boolean(),
        showInResults: z.boolean(),
        order: z.number().optional(),
      }),
    )
    .optional(),
  templateAccesses: z
    .array(
      z.object({
        userId: z.string(),
      }),
    )
    .optional(),
});

router.put(
  '/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const validation = templateUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return next(
        new APIError(
          'Validation failed',
          400,
          JSON.stringify(validation.error.errors),
        ),
      );
    }
    const data = validation.data;

    try {
      const currentTemplate = await prisma.template.findUnique({
        where: { id },
        include: {
          questions: true,
        },
      });

      if (!currentTemplate) {
        return next(new APIError('Template not found', 404));
      }
      if (currentTemplate.userId !== req.userId) {
        return next(new APIError('Not authorized to edit this template', 403));
      }

      const existingQuestions = currentTemplate.questions;

      const questionsChanged = haveQuestionsChanged(
        data.questions,
        existingQuestions,
      );

      const orderChanged = isQuestionOrderChanged(
        data.questions,
        existingQuestions,
      );

      if (questionsChanged) {
        await prisma.$transaction([
          prisma.answer.deleteMany({
            where: { form: { templateId: id } },
          }),
          prisma.form.deleteMany({
            where: { templateId: id },
          }),
        ]);
      }

      if (
        currentTemplate.image_url &&
        currentTemplate.image_url !== data.image_url
      ) {
        await deleteImageFromStorage(currentTemplate.image_url);
      }

      const updatedQuestions = updateTemplateQuestions(data.questions);

      const updatedTemplate = await prisma.template.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          image_url: data.image_url || null,
          public: data.public,
          topicId: data.topicId,
          version: { increment: 1 },
          tags: updateTemplateTags(data.tags),
          questions: updatedQuestions,
          templateAccesses: updateTemplateAccesses(data.templateAccesses),
        },
        include: {
          user: { select: { id: true, email: true, name: true } },
          topic: true,
          tags: { include: { tag: true } },
          questions: true,
          templateAccesses: {
            include: {
              user: { select: { id: true, email: true, name: true } },
            },
          },
        },
      });

      const fullTemplate = {
        ...transformTemplate(updatedTemplate),
        questions: updatedTemplate.questions,
        templateAccesses: updatedTemplate.templateAccesses,
      };

      res.json(fullTemplate);
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

router.get(
  '/:id/forms',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await prisma.template.findUnique({
        where: { id: req.params.id },
      });

      if (
        !template ||
        (template.userId !== req.userId && req.role !== 'ADMIN')
      ) {
        return next(
          new APIError('Not authorized to view forms for this template', 403),
        );
      }

      const forms = await prisma.form.findMany({
        where: { templateId: req.params.id },
        include: {
          user: { select: { email: true, name: true } },
          answers: true,
        },
      });
      res.json(forms);
    } catch (error: any) {
      next(new APIError(error.message, 500));
    }
  },
);

export default router;
