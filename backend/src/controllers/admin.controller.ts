import type { Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [totalOrders, totalProducts, totalUsers, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ active: true }),
    User.countDocuments(),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      revenue: revenueAgg[0]?.total ?? 0,
    },
    recentOrders,
  });
});

export const listAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(),
  ]);

  res.json({
    success: true,
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const valid = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) throw new AppError('Invalid status', 400);

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status,
      ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
    },
    { new: true }
  );

  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, order });
});

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateUserRoleValidation = [body('role').isIn(['user', 'admin'])];

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  const targetId = req.params.id;

  if (targetId === req.user!._id.toString()) {
    throw new AppError('Cannot change your own role', 400);
  }

  const user = await User.findByIdAndUpdate(targetId, { role }, { new: true }).select(
    'name email role createdAt'
  );

  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, user });
});

export const listAdminProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(),
  ]);

  res.json({
    success: true,
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const listCarts = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const carts = await Cart.find({ 'items.0': { $exists: true } })
    .populate('user', 'name email')
    .populate('items.product', 'name price slug')
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  res.json({ success: true, carts });
});

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

export const getSalesAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const salesByDay = await Order.aggregate<{ _id: string; revenue: number; orders: number }>([
    { $match: { status: { $in: PAID_STATUSES }, createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byDate = new Map(salesByDay.map((row) => [row._id, row]));
  const chart: { date: string; revenue: number; orders: number }[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    chart.push({
      date: key,
      revenue: Math.round((row?.revenue ?? 0) * 100) / 100,
      orders: row?.orders ?? 0,
    });
  }

  const [lowStock, uploadEnabled] = await Promise.all([
    Product.find({ active: true, stock: { $lte: 10 } })
      .select('name sku stock slug')
      .sort({ stock: 1 })
      .limit(8)
      .lean(),
    Promise.resolve(env.cloudinary.enabled),
  ]);

  res.json({
    success: true,
    chart,
    days,
    lowStock,
    uploadEnabled,
  });
});
