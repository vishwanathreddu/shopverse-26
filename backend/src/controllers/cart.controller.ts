import type { Response } from 'express';
import { body, param } from 'express-validator';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getProductId } from '../utils/cartHelpers.js';
import { resolveCart } from '../utils/cartResolver.js';
import type { AuthRequest } from '../middleware/auth.js';

const PRODUCT_SELECT = 'name slug price images stock active';

async function cartResponse(cart: Awaited<ReturnType<typeof resolveCart>>, res: Response) {
  await cart.populate({ path: 'items.product', select: PRODUCT_SELECT });
  res.json({ success: true, cart });
}

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await resolveCart(req, true);
  res.json({ success: true, cart });
});

export const addToCartValidation = [
  body('productId').isMongoId(),
  body('qty').optional().isInt({ min: 1 }),
];

export const updateCartItemValidation = [
  param('productId').isMongoId(),
  body('qty').isInt({ min: 0 }),
];

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.active) throw new AppError('Product not found', 404);
  if (product.stock < qty) throw new AppError('Insufficient stock', 400);

  const cart = await resolveCart(req, false);
  const existing = cart.items.find((i) => getProductId(i.product) === productId);

  if (existing) {
    existing.qty += qty;
    if (existing.qty > product.stock) throw new AppError('Insufficient stock', 400);
  } else {
    cart.items.push({ product: product._id, qty });
  }

  await cart.save();
  await cartResponse(cart, res);
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = String(req.params.productId);
  const qty = Number(req.body.qty);
  const cart = await resolveCart(req, false);
  const item = cart.items.find((i) => getProductId(i.product) === productId);

  if (!item) throw new AppError('Item not in cart', 404);

  if (qty <= 0) {
    cart.items = cart.items.filter((i) => getProductId(i.product) !== productId);
  } else {
    const product = await Product.findById(productId);
    if (!product || product.stock < qty) throw new AppError('Insufficient stock', 400);
    item.qty = qty;
  }

  await cart.save();
  await cartResponse(cart, res);
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await resolveCart(req, false);
  cart.items = [];
  await cart.save();
  await cartResponse(cart, res);
});
