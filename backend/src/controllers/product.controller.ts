import type { Response } from 'express';
import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import type { AuthRequest } from '../middleware/auth.js';

export const listProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { active: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.minPrice) filter.price = { ...(filter.price as object), $gte: Number(req.query.minPrice) };
  if (req.query.maxPrice) filter.price = { ...(filter.price as object), $lte: Number(req.query.maxPrice) };

  if (req.query.search) {
    filter.$text = { $search: String(req.query.search) };
  }

  type SortOption = Record<string, 1 | -1>;
  let sort: SortOption = { createdAt: -1 };
  if (req.query.sort === 'price-asc') sort = { price: 1 };
  else if (req.query.sort === 'price-desc') sort = { price: -1 };
  else if (req.query.sort === 'rating') sort = { rating: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const slugOrId = String(req.params.slugOrId);
  const isObjectId =
    mongoose.Types.ObjectId.isValid(slugOrId) && /^[a-fA-F0-9]{24}$/.test(slugOrId);

  const product = await Product.findOne({
    ...(isObjectId ? { _id: slugOrId } : { slug: slugOrId }),
    active: true,
  }).populate('category', 'name slug');

  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

export const createProductValidation = [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').isMongoId(),
  body('stock').isInt({ min: 0 }),
  body('sku').trim().notEmpty(),
];

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.body.category);
  if (!category) throw new AppError('Category not found', 404);

  const slug = slugify(req.body.name);
  const product = await Product.create({
    ...req.body,
    slug,
    images: req.body.images ?? [],
  });

  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ...(req.body.name ? { slug: slugify(req.body.name) } : {}) },
    { new: true, runValidators: true }
  );

  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deactivated' });
});

export const productIdParam = [param('id').isMongoId()];
