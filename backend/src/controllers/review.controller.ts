import type { Response } from 'express';
import { body } from 'express-validator';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const createReviewValidation = [
  body('productId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty(),
];

export const getProductReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name _id')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, reviews });
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, rating, comment } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const existing = await Review.findOne({ user: req.user!._id, product: productId });
  if (existing) throw new AppError('Already reviewed this product', 409);

  const review = await Review.create({
    user: req.user!._id,
    product: productId,
    name: req.user!.name,
    rating,
    comment,
  });

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  product.rating = Math.round((stats[0]?.avg ?? rating) * 10) / 10;
  product.numReviews = stats[0]?.count ?? 1;
  await product.save();

  res.status(201).json({ success: true, review });
});

export const listAllReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(),
  ]);

  res.json({
    success: true,
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  const productId = review.product;
  await review.deleteOne();

  const product = await Product.findById(productId);
  if (product) {
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    product.rating = stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0;
    product.numReviews = stats[0]?.count ?? 0;
    await product.save();
  }

  res.json({ success: true, message: 'Review deleted' });
});
