import { api } from './client';
import type { Review } from '@/types';

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data } = await api.get<{ reviews: Review[] }>(`/reviews/product/${productId}`);
  return data.reviews;
}

export async function createReview(productId: string, rating: number, comment: string) {
  const { data } = await api.post<{ review: Review }>('/reviews', {
    productId,
    rating,
    comment,
  });
  return data.review;
}
