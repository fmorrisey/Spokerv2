import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../models/constants';

export const authenticate: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(Object.assign(new Error('No token provided'), { statusCode: 401 }));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    (req as any).user = payload;
    next();
  } catch {
    next(Object.assign(new Error('Invalid or expired token'), { statusCode: 401 }));
  }
};
