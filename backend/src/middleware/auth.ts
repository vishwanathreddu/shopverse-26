import type { Request, Response, NextFunction } from 'express';
import { User, type IUser } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(async (req: AuthRequest, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) throw new AppError('Not authorized', 401);

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.userId);

  if (!user) throw new AppError('User not found', 401);

  req.user = user;
  next();
});

/** Sets req.user when a valid token is sent; does not fail when missing/invalid */
export const optionalAuth = asyncHandler(async (req: AuthRequest, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user) req.user = user;
    } catch {
      // Guest cart flow — ignore invalid/expired access token
    }
  }

  next();
});

export const adminOnly = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};
