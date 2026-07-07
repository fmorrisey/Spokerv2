import { RequestHandler } from 'express';
import { forbidden } from '../services/error.service';

/**
 * Role-based access control. Runs *after* `authenticate`, which sets
 * `req.user = { userId, role }`. Rejects with 403 unless the authenticated
 * user's role is one of the allowed roles.
 */
export const authorize = (...roles: string[]): RequestHandler => {
  return (req, _res, next) => {
    const user = (req as any).user as { role?: string } | undefined;
    if (!user?.role || !roles.includes(user.role)) {
      return next(forbidden('Insufficient permissions'));
    }
    next();
  };
};
