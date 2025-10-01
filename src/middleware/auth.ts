import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const providedKey = req.header('x-api-key');
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: 'Server misconfiguration: API_KEY not set' });
  }
  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}


