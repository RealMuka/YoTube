import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { HttpError } from './errorHandler.js';

interface TokenPayload extends JwtPayload {
  sub: string;
  role: 'admin' | 'editor' | 'user';
  email: string;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new HttpError(401, 'Для выполнения запроса необходимо войти в систему'));

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET не задан в переменных окружения');
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
    next();
  } catch {
    next(new HttpError(401, 'Токен недействителен или срок его действия истёк'));
  }
};
