import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

function signToken(user: { _id: unknown; role: string; email: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET должен содержать не менее 32 символов');
  return jwt.sign({ sub: String(user._id), role: user.role, email: user.email }, secret, { expiresIn: '7d' });
}

function publicUser(user: { _id: unknown; name: string; email: string; role: string; createdAt: Date }) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

router.post('/register', asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (name.length < 2) throw new HttpError(400, 'Имя должно содержать минимум 2 символа');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Укажите корректный email');
  if (password.length < 8) throw new HttpError(400, 'Пароль должен содержать минимум 8 символов');
  if (await User.exists({ email })) throw new HttpError(409, 'Пользователь с таким email уже зарегистрирован');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role: 'user' });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, 'Неверный email или пароль');
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new HttpError(401, 'Пользователь не найден');
  res.json({ user: publicUser(user) });
}));

export default router;
