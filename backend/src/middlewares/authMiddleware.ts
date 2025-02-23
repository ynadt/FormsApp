import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import supabase from '../supabase';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies.access_token;
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid auth token' });
      return;
    }
    const userRecord = await prisma.user.findUnique({
      where: { id: data.user.id },
    });
    if (!userRecord) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }
    if (userRecord.blocked) {
      res.status(403).json({ error: 'User is blocked' });
      return;
    }
    req.userId = data.user.id;
    req.role = userRecord.role;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to restrict access to admin users.
 * Requires requireAuth to run first (so that req.userId is set).
 */
export async function adminOnly(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
