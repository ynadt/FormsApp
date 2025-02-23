/// <reference path="../types/express.d.ts" />
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import supabase from '../supabase';
import { syncUserRecord } from '../utils/syncUser';
import { requireAuth } from '../middlewares/authMiddleware';
import APIError from '../utils/APIError';
import { setAuthCookies, clearAuthCookies } from '../utils/authHelpers';
import prisma from '../prisma';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

router.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const { email, password, name } = validation.data;
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return next(new APIError(error.message, 400));
      }
      if (data.user && data.session) {
        const user = await syncUserRecord({ ...data.user, name });
        setAuthCookies(
          res,
          data.session.access_token,
          data.session.refresh_token,
        );
        res.status(201).json({
          supabase: { user: data.user },
          user,
        });
        return;
      }
      res.status(201).json(data);
    } catch (err: any) {
      next(err);
    }
  },
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post(
  '/login',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return next(
          new APIError(
            'Validation failed',
            400,
            JSON.stringify(validation.error.errors),
          ),
        );
      }
      const { email, password } = validation.data;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return next(new APIError(error.message, 400));
      }
      if (data.user && data.session) {
        const user = await syncUserRecord(data.user);
        if (user.blocked) {
          clearAuthCookies(res);
          return next(new APIError('User is blocked', 403));
        }
        setAuthCookies(
          res,
          data.session.access_token,
          data.session.refresh_token,
        );
        res.json({
          supabase: { user: data.user },
          user,
        });
        return;
      }
      res.json(data);
    } catch (err: any) {
      next(err);
    }
  },
);

router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.access_token;
      if (token) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          return next(new APIError(error.message, 400));
        }
      }
      clearAuthCookies(res);
      res.json({ message: 'Logged out successfully' });
    } catch (err: any) {
      next(err);
    }
  },
);

router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshTokenFromCookie = req.cookies.refresh_token;
      if (!refreshTokenFromCookie) {
        return next(new APIError('Missing refresh token', 400));
      }
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshTokenFromCookie,
      });
      if (error || !data.session) {
        return next(
          new APIError(error?.message || 'Refresh token failed', 400),
        );
      }
      setAuthCookies(
        res,
        data.session.access_token,
        data.session.refresh_token,
      );
      res.json({ message: 'Token refreshed' });
    } catch (err: any) {
      next(err);
    }
  },
);

router.get(
  '/user',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRecord = await prisma.user.findUnique({
        where: { id: req.userId! },
      });
      if (!userRecord) {
        return next(new APIError('Unable to fetch user details', 400));
      }
      res.json(userRecord);
    } catch (err: any) {
      next(err);
    }
  },
);

export default router;
