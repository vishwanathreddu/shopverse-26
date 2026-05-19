import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { AuthRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';

/** Cross-origin SPA (Vercel) + API (Render) requires SameSite=None in production. */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: (env.isProd ? 'none' : 'lax') as 'lax' | 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
];

export const loginValidation = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered', 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });

  const accessToken = issueTokens(res, user._id.toString(), user.role);
  res.status(201).json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = issueTokens(res, user._id.toString(), user.role);
  res.json({ success: true, accessToken, user: sanitizeUser(user) });
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('Refresh token missing', 401);

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId);
  if (!user) throw new AppError('User not found', 401);

  const accessToken = issueTokens(res, user._id.toString(), user.role);
  res.json({ success: true, accessToken, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out' });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: sanitizeUser(req.user!) });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, address } = req.body;
  const user = req.user!;

  if (name) user.name = name;
  if (address) user.address = address;
  await user.save();

  res.json({ success: true, user: sanitizeUser(user) });
});

function issueTokens(res: Response, userId: string, role: string): string {
  const payload = { userId, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  return accessToken;
}

function sanitizeUser(user: { _id: unknown; name: string; email: string; role: string; address?: unknown }) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address,
  };
}
