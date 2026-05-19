import { api } from './client';
import type { Product, Pagination, Category } from '@/types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export async function fetchProducts(filters: ProductFilters = {}) {
  const { data } = await api.get<{
    products: Product[];
    pagination: Pagination;
  }>('/products', { params: filters });
  return data;
}

export async function fetchProduct(slugOrId: string) {
  const { data } = await api.get<{ product: Product }>(`/products/${slugOrId}`);
  return data.product;
}

export async function fetchCategories() {
  const { data } = await api.get<{ categories: Category[] }>('/categories');
  return data.categories;
}
