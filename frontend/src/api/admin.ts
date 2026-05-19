import { api } from './client';
import type { Order, Product, Category, Review } from '@/types';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AdminCart {
  _id: string;
  user?: AdminUser;
  sessionId?: string;
  items: { product: Product; qty: number }[];
  updatedAt: string;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  slug: string;
}

export interface SalesChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function fetchAdminStats() {
  const { data } = await api.get<{
    stats: { totalOrders: number; totalProducts: number; totalUsers: number; revenue: number };
    recentOrders: Order[];
  }>('/admin/stats');
  return data;
}

export async function fetchAdminAnalytics(days = 30) {
  const { data } = await api.get<{
    chart: SalesChartPoint[];
    days: number;
    lowStock: LowStockProduct[];
    uploadEnabled: boolean;
  }>('/admin/analytics', { params: { days } });
  return data;
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<{ url: string }>('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

export async function fetchAdminOrders(page = 1) {
  const { data } = await api.get<{
    orders: Order[];
    pagination: { page: number; pages: number; total: number };
  }>('/admin/orders', { params: { page } });
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await api.patch<{ order: Order }>(`/admin/orders/${orderId}/status`, {
    status,
  });
  return data.order;
}

export async function fetchAdminUsers(page = 1) {
  const { data } = await api.get<{
    users: AdminUser[];
    pagination: { page: number; pages: number; total: number };
  }>('/admin/users', { params: { page } });
  return data;
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const { data } = await api.patch<{ user: AdminUser }>(`/admin/users/${userId}/role`, { role });
  return data.user;
}

export async function fetchAdminProducts(page = 1) {
  const { data } = await api.get<{
    products: Product[];
    pagination: { page: number; pages: number; total: number };
  }>('/admin/products', { params: { page } });
  return data;
}

export async function fetchAdminCarts() {
  const { data } = await api.get<{ carts: AdminCart[] }>('/admin/carts');
  return data.carts;
}

export async function createProduct(payload: Record<string, unknown>) {
  const { data } = await api.post<{ product: Product }>('/products', payload);
  return data.product;
}

export async function updateProduct(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<{ product: Product }>(`/products/${id}`, payload);
  return data.product;
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<{ categories: Category[] }>('/categories');
  return data.categories;
}

export async function createCategory(payload: { name: string; description?: string }) {
  const { data } = await api.post<{ category: Category }>('/admin/categories', payload);
  return data.category;
}

export async function updateCategory(
  id: string,
  payload: { name?: string; description?: string }
) {
  const { data } = await api.put<{ category: Category }>(`/admin/categories/${id}`, payload);
  return data.category;
}

export async function deleteCategory(id: string) {
  await api.delete(`/admin/categories/${id}`);
}

export async function fetchAdminReviews(page = 1) {
  const { data } = await api.get<{
    reviews: Review[];
    pagination: { page: number; pages: number; total: number };
  }>('/admin/reviews', { params: { page } });
  return data;
}

export async function deleteReview(id: string) {
  await api.delete(`/admin/reviews/${id}`);
}
