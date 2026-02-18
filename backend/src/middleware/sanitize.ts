import { Request, Response, NextFunction } from 'express';

function stripHtml(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '') // strip script/style with content
      .replace(/<[^>]*>/g, '')                               // strip remaining tags
      .trim();
  }
  if (Array.isArray(value)) return value.map(stripHtml);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripHtml(v)])
    );
  }
  return value;
}

export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = stripHtml(req.body) as any;
  if (req.query) req.query = stripHtml(req.query) as any;
  if (req.params) req.params = stripHtml(req.params) as any;
  next();
};
