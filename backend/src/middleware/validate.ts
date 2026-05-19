import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validate =
  (validations: ValidationChain[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors
        .array()
        .map((e) => ('msg' in e ? e.msg : 'Invalid input'))
        .join(', ');
      return next(new AppError(message, 400));
    }
    next();
  };
