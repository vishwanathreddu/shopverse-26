import type { Response } from 'express';
import { body } from 'express-validator';
import Stripe from 'stripe';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveCart, clearCartsForUser } from '../utils/cartResolver.js';
import { getProductId } from '../utils/cartHelpers.js';
import type { AuthRequest } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { queueOrderConfirmationEmail } from '../utils/orderEmail.js';

const TAX_RATE = 0.08;
const SHIPPING_FLAT = 9.99;
const FREE_SHIPPING_THRESHOLD = 100;

function getStripe(): Stripe | null {
  const key = env.stripe.secretKey;
  if (!key || key.includes('your_stripe') || key.length < 20) return null;
  return new Stripe(key);
}

export const createOrderValidation = [
  body('shippingAddress.fullName').notEmpty(),
  body('shippingAddress.street').notEmpty(),
  body('shippingAddress.city').notEmpty(),
  body('shippingAddress.state').notEmpty(),
  body('shippingAddress.zip').notEmpty(),
  body('shippingAddress.country').notEmpty(),
];

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await resolveCart(req, true);
  if (!cart.items.length) throw new AppError('Cart is empty', 400);

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const productId = getProductId(item.product);
    const product = await Product.findById(productId);
    if (!product?.active) throw new AppError('Product unavailable', 400);
    if (product.stock < item.qty) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] ?? '',
      price: product.price,
      qty: item.qty,
    });
    itemsPrice += product.price * item.qty;
  }

  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user!._id,
    orderItems,
    shippingAddress: req.body.shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    status: 'pending',
  });

  const stripe = getStripe();

  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: orderItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name, images: item.image ? [item.image] : [] },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      success_url: `${env.clientUrl}/account/orders/${order._id}?success=true`,
      cancel_url: `${env.clientUrl}/checkout?cancelled=true`,
      metadata: { orderId: order._id.toString() },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(201).json({
      success: true,
      order,
      checkoutUrl: session.url,
    });
    return;
  }

  // Demo mode without Stripe — mark as paid for local testing
  order.status = 'paid';
  order.paidAt = new Date();
  order.paymentResult = { id: 'demo', status: 'paid' };
  await order.save();

  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  const sessionId = req.headers['x-session-id'] as string | undefined;
  await clearCartsForUser(req.user!._id.toString(), sessionId);

  queueOrderConfirmationEmail(order._id.toString());

  res.status(201).json({ success: true, order, demoMode: true });
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }
  res.json({ success: true, order });
});

export const confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user!._id.toString()) throw new AppError('Not authorized', 403);

  if (order.status === 'paid') {
    res.json({ success: true, order });
    return;
  }

  const stripe = getStripe();
  if (stripe && order.stripeSessionId) {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status !== 'paid') {
      throw new AppError('Payment not completed', 400);
    }
  }

  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  const sessionId = req.headers['x-session-id'] as string | undefined;
  await clearCartsForUser(req.user!._id.toString(), sessionId);

  queueOrderConfirmationEmail(order._id.toString());

  res.json({ success: true, order });
});
