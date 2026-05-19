import type { Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadImageBuffer } from '../utils/cloudinary.js';
import type { AuthRequest } from '../middleware/auth.js';

export const uploadProductImage = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!env.cloudinary.enabled) {
      throw new AppError(
        'Image upload is not configured. Add CLOUDINARY_* env vars or paste an image URL instead.',
        503
      );
    }

    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    try {
      const url = await uploadImageBuffer(req.file.buffer);
      res.json({ success: true, url });
    } catch {
      next(new AppError('Image upload failed', 500));
    }
  }
);
