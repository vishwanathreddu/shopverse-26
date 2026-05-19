import { api } from './client';
import type { Product } from '@/types';

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  items: WishlistItem[];
}

export async function fetchWishlist() {
  const { data } = await api.get<{ wishlist: Wishlist }>('/wishlist');
  return data.wishlist;
}

export async function fetchWishlistProductIds() {
  const { data } = await api.get<{ productIds: string[] }>('/wishlist/ids');
  return data.productIds;
}

export async function addToWishlist(productId: string) {
  const { data } = await api.post<{ wishlist: Wishlist }>('/wishlist/items', { productId });
  return data.wishlist;
}

export async function removeFromWishlist(productId: string) {
  const { data } = await api.delete<{ wishlist: Wishlist }>(`/wishlist/items/${productId}`);
  return data.wishlist;
}

export async function clearWishlist() {
  const { data } = await api.delete<{ wishlist: Wishlist }>('/wishlist');
  return data.wishlist;
}

export async function moveWishlistItemToCart(productId: string, qty = 1) {
  const { data } = await api.post<{ wishlist: Wishlist; cart: unknown }>(
    `/wishlist/items/${productId}/move-to-cart`,
    { qty }
  );
  return data;
}
