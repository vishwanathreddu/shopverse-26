import { api } from './client';
import type { Cart } from '@/types';

export async function fetchCart() {
  const { data } = await api.get<{ cart: Cart }>('/cart');
  return data.cart;
}

export async function addToCart(productId: string, qty = 1) {
  const { data } = await api.post<{ cart: Cart }>('/cart/items', { productId, qty });
  return data.cart;
}

export async function updateCartItem(productId: string, qty: number) {
  const { data } = await api.patch<{ cart: Cart }>(`/cart/items/${productId}`, { qty });
  return data.cart;
}

export async function clearCart() {
  const { data } = await api.delete<{ cart: Cart }>('/cart');
  return data.cart;
}
