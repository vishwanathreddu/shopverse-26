import type { Response } from 'express';
import { body, param } from 'express-validator';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import type { AuthRequest } from '../middleware/auth.js';

export const listCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  res.json({ success: true, categories });
});

export const categoryIdParam = [param('id').isMongoId()];

export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
];

export const updateCategoryValidation = [
  ...categoryIdParam,
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
];

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const slug = slugify(name);

  const existing = await Category.findOne({ slug });
  if (existing) throw new AppError('Category with this name already exists', 409);

  const category = await Category.create({ name, slug, description });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  const { name, description } = req.body;
  if (name !== undefined) {
    category.name = name;
    category.slug = slugify(name);
    const duplicate = await Category.findOne({
      slug: category.slug,
      _id: { $ne: category._id },
    });
    if (duplicate) throw new AppError('Category with this name already exists', 409);
  }
  if (description !== undefined) category.description = description;

  await category.save();
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new AppError(
      `Cannot delete category with ${productCount} product(s). Reassign or remove products first.`,
      400
    );
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
