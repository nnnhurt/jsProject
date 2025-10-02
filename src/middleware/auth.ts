// для аутентификации.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
  }
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  try {
    const payload = jwt.verify(token, secret);
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}


