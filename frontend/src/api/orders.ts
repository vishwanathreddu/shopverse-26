import { api } from './client';
import type { Order, ShippingAddress } from '@/types';

export async function createOrder(shippingAddress: ShippingAddress & { fullName: string }) {
  const { data } = await api.post<{
    order: Order;
    checkoutUrl?: string;
    demoMode?: boolean;
  }>('/orders', { shippingAddress });
  return data;
}

export async function fetchOrders() {
  const { data } = await api.get<{ orders: Order[] }>('/orders');
  return data.orders;
}

export async function fetchOrder(id: string) {
  const { data } = await api.get<{ order: Order }>(`/orders/${id}`);
  return data.order;
}

export async function confirmPayment(orderId: string) {
  const { data } = await api.post<{ order: Order }>(`/orders/${orderId}/confirm`);
  return data.order;
}
