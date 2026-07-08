import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../models/constants';
import { unauthorized } from '../services/error.service';

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(unauthorized('No token provided'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    (req as any).user = payload;
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
};
