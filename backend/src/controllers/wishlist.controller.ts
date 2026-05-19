import type { Response } from 'express';
import { body, param } from 'express-validator';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getProductId } from '../utils/cartHelpers.js';
import { resolveCart } from '../utils/cartResolver.js';
import type { AuthRequest } from '../middleware/auth.js';

const PRODUCT_SELECT = 'name slug price images stock active compareAtPrice brand rating numReviews';

async function getOrCreateWishlist(userId: string) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
}

async function wishlistResponse(wishlist: Awaited<ReturnType<typeof getOrCreateWishlist>>, res: Response) {
  await wishlist.populate({ path: 'items.product', select: PRODUCT_SELECT });
  const items = wishlist.items.filter((i) => {
    const p = i.product as { active?: boolean };
    return p && typeof p === 'object' && p.active !== false;
  });
  res.json({ success: true, wishlist: { _id: wishlist._id, items } });
}

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  await wishlistResponse(wishlist, res);
});

export const getWishlistProductIds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await Wishlist.findOne({ user: req.user!._id }).lean();
  const productIds = wishlist?.items.map((i) => i.product.toString()) ?? [];
  res.json({ success: true, productIds });
});

export const addToWishlistValidation = [body('productId').isMongoId()];

export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.active) throw new AppError('Product not found', 404);

  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  const exists = wishlist.items.some((i) => getProductId(i.product) === productId);
  if (!exists) {
    wishlist.items.push({ product: product._id, addedAt: new Date() });
    await wishlist.save();
  }

  await wishlistResponse(wishlist, res);
});

export const removeFromWishlistValidation = [param('productId').isMongoId()];

export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = String(req.params.productId);
  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  wishlist.items = wishlist.items.filter((i) => getProductId(i.product) !== productId);
  await wishlist.save();
  await wishlistResponse(wishlist, res);
});

export const clearWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  wishlist.items = [];
  await wishlist.save();
  await wishlistResponse(wishlist, res);
});

export const moveToCartValidation = [
  param('productId').isMongoId(),
  body('qty').optional().isInt({ min: 1 }),
];

export const moveWishlistItemToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = String(req.params.productId);
  const qty = Number(req.body.qty ?? 1);

  const product = await Product.findById(productId);
  if (!product || !product.active) throw new AppError('Product not found', 404);
  if (product.stock < qty) throw new AppError('Insufficient stock', 400);

  const wishlist = await getOrCreateWishlist(req.user!._id.toString());
  const inWishlist = wishlist.items.some((i) => getProductId(i.product) === productId);
  if (!inWishlist) throw new AppError('Item not in wishlist', 404);

  const cart = await resolveCart(req, false);
  const existing = cart.items.find((i) => getProductId(i.product) === productId);
  if (existing) {
    const newQty = existing.qty + qty;
    if (newQty > product.stock) throw new AppError('Insufficient stock', 400);
    existing.qty = newQty;
  } else {
    cart.items.push({ product: product._id, qty });
  }
  await cart.save();

  wishlist.items = wishlist.items.filter((i) => getProductId(i.product) !== productId);
  await wishlist.save();

  await cart.populate({ path: 'items.product', select: PRODUCT_SELECT });
  await wishlist.populate({ path: 'items.product', select: PRODUCT_SELECT });

  res.json({
    success: true,
    cart,
    wishlist: { _id: wishlist._id, items: wishlist.items },
  });
});
