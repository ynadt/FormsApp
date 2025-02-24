import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import APIError from '../utils/APIError';
import supabase from '../supabase';
import { buildPaginationOptions } from '../utils/queryOptions';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParam = req.query.q as string | undefined;
    const { skip, take, page, limit } = buildPaginationOptions(req.query);
    const offset = skip;

    if (!queryParam || queryParam.trim() === '') {
      res.json({ data: [], total: 0, page, limit });
    }

    let userId: string | null = null;
    let userRole: string | null = null;
    const token = req.cookies.access_token;
    if (token) {
      const { data: supaData } = await supabase.auth.getUser(token);
      if (supaData.user) {
        userId = supaData.user.id;
        const userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        userRole = userRecord?.role || null;
      }
    }

    let results: any, countResults: any;

    if (!userId) {
      results = await prisma.$queryRaw`
        SELECT
          t.id,
          t.title,
          t.description,
          t.image_url,
          t.public,
          t.version,
          t."createdAt",
          t."updatedAt",
          t."userId" AS "authorId",
          u.email AS "authorEmail",
          u.name AS "authorName",
          (SELECT json_build_object('id', top.id, 'name', top.name)
           FROM "Topic" top
           WHERE top.id = t."topicId") AS topic,
          (
            SELECT COALESCE(json_agg(json_build_object('id', tag.id, 'name', tag.name)), '[]'::json)
            FROM "TemplateTag" tt2
            JOIN "Tag" tag ON tt2."tagId" = tag.id
            WHERE tt2."templateId" = t.id
          ) AS tags
        FROM "Template" t
        LEFT JOIN "User" u ON t."userId" = u.id
        LEFT JOIN "Question" q ON t.id = q."templateId"
        LEFT JOIN "Comment" c ON t.id = c."templateId"
        LEFT JOIN "Topic" top ON t."topicId" = top.id
        LEFT JOIN "TemplateTag" tt ON t.id = tt."templateId"
        LEFT JOIN "Tag" tag ON tt."tagId" = tag.id
        WHERE
          (
            t.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR q.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR c.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR top.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR EXISTS (
              SELECT 1 FROM "TemplateTag" tt2
              JOIN "Tag" tag2 ON tt2."tagId" = tag2.id
              WHERE tt2."templateId" = t.id
                AND tag2.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            )
          )
          AND t.public = true
        GROUP BY t.id, u.email, u.name, top.id, top.name
        ORDER BY t."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countResults = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Template" t
        WHERE
          t.search_vector @@ websearch_to_tsquery('english', ${queryParam})
          AND t.public = true
      `;
    } else if (userRole !== 'ADMIN') {
      results = await prisma.$queryRaw`
        SELECT
          t.id,
          t.title,
          t.description,
          t.image_url,
          t.public,
          t.version,
          t."createdAt",
          t."updatedAt",
          t."userId" AS "authorId",
          u.email AS "authorEmail",
          u.name AS "authorName",
          (SELECT json_build_object('id', top.id, 'name', top.name)
           FROM "Topic" top
           WHERE top.id = t."topicId") AS topic,
          (
            SELECT COALESCE(json_agg(json_build_object('id', tag.id, 'name', tag.name)), '[]'::json)
            FROM "TemplateTag" tt2
            JOIN "Tag" tag ON tt2."tagId" = tag.id
            WHERE tt2."templateId" = t.id
          ) AS tags
        FROM "Template" t
        LEFT JOIN "User" u ON t."userId" = u.id
        LEFT JOIN "Topic" top ON t."topicId" = top.id
        LEFT JOIN "TemplateTag" tt ON t.id = tt."templateId"
        LEFT JOIN "Tag" tag ON tt."tagId" = tag.id
        LEFT JOIN "Question" q ON t.id = q."templateId"
        LEFT JOIN "Comment" c ON t.id = c."templateId"
        WHERE
          (
            t.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR q.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR c.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR top.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR EXISTS (
              SELECT 1 FROM "TemplateTag" tt2
              JOIN "Tag" tag2 ON tt2."tagId" = tag2.id
              WHERE tt2."templateId" = t.id
                AND tag2.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            )
          )
          AND (
            t.public = true
            OR t."userId" = ${userId}
            OR EXISTS (
              SELECT 1 FROM "TemplateAccess" ta
              WHERE ta."templateId" = t.id AND ta."userId" = ${userId}
            )
          )
        GROUP BY t.id, u.email, u.name, top.id, top.name
        ORDER BY t."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countResults = await prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM "Template" t
        WHERE
          t.search_vector @@ websearch_to_tsquery('english', ${queryParam})
          AND (
            t.public = true
            OR t."userId" = ${userId}
            OR EXISTS (
              SELECT 1 FROM "TemplateAccess" ta
              WHERE ta."templateId" = t.id AND ta."userId" = ${userId}
            )
          )
      `;
    } else {
      // Admin users.
      results = await prisma.$queryRaw`
        SELECT
          t.id,
          t.title,
          t.description,
          t.image_url,
          t.public,
          t.version,
          t."createdAt",
          t."updatedAt",
          t."userId" AS "authorId",
          u.email AS "authorEmail",
          u.name AS "authorName",
          (SELECT json_build_object('id', top.id, 'name', top.name)
           FROM "Topic" top
           WHERE top.id = t."topicId") AS topic,
          (
            SELECT COALESCE(json_agg(json_build_object('id', tag.id, 'name', tag.name)), '[]'::json)
            FROM "TemplateTag" tt2
            JOIN "Tag" tag ON tt2."tagId" = tag.id
            WHERE tt2."templateId" = t.id
          ) AS tags
        FROM "Template" t
        LEFT JOIN "User" u ON t."userId" = u.id
        LEFT JOIN "Topic" top ON t."topicId" = top.id
        LEFT JOIN "TemplateTag" tt ON t.id = tt."templateId"
        LEFT JOIN "Tag" tag ON tt."tagId" = tag.id
        LEFT JOIN "Question" q ON t.id = q."templateId"
        LEFT JOIN "Comment" c ON t.id = c."templateId"
        WHERE
          (
            t.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR q.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR c.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR top.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR EXISTS (
              SELECT 1 FROM "TemplateTag" tt2
              JOIN "Tag" tag2 ON tt2."tagId" = tag2.id
              WHERE tt2."templateId" = t.id
                AND tag2.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            )
          )
        GROUP BY t.id, u.email, u.name, top.id, top.name
        ORDER BY t."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      countResults = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT t.id)::int AS count
        FROM "Template" t
        LEFT JOIN "Question" q ON t.id = q."templateId"
        LEFT JOIN "Comment" c ON t.id = c."templateId"
        LEFT JOIN "Topic" top ON t."topicId" = top.id
        LEFT JOIN "TemplateTag" tt ON t.id = tt."templateId"
        LEFT JOIN "Tag" tag ON tt."tagId" = tag.id
        WHERE
          (
            t.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR q.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR c.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR top.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            OR EXISTS (
              SELECT 1 FROM "TemplateTag" tt2
              JOIN "Tag" tag2 ON tt2."tagId" = tag2.id
              WHERE tt2."templateId" = t.id
                AND tag2.search_vector @@ websearch_to_tsquery('english', ${queryParam})
            )
          )
      `;
    }

    const totalCount = countResults[0]?.count || 0;

    res.json({ data: results, total: totalCount, page, limit });
  } catch (error: any) {
    next(new APIError(error.message, 500));
  }
});

export default router;
