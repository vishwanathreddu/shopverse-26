import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchWishlist,
  clearWishlist,
  removeFromWishlist,
  moveWishlistItemToCart,
} from '@/api/wishlist';
import type { Product } from '@/types';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (msg) return msg;
  }
  return 'Something went wrong';
}

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: () => {
      invalidate();
      toast.success('Removed from wishlist');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const moveMutation = useMutation({
    mutationFn: (productId: string) => moveWishlistItemToCart(productId, 1),
    onSuccess: () => {
      invalidate();
      toast.success('Moved to cart');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const clearMutation = useMutation({
    mutationFn: clearWishlist,
    onSuccess: () => {
      invalidate();
      toast.success('Wishlist cleared');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = wishlist?.items ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">Loading wishlist...</div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 font-display text-2xl font-bold">Your wishlist is empty</h1>
        <p className="mt-2 text-slate-500">Save items you love and come back later.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-slate-900">My wishlist</h1>
        <button
          type="button"
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
          className="text-sm text-red-600 hover:underline flex items-center gap-1 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" /> Clear wishlist
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const p = item.product as Product;
          const outOfStock = p.stock === 0;
          return (
            <article key={p._id} className="card overflow-hidden">
              <Link to={`/products/${p.slug}`} className="block aspect-square overflow-hidden bg-slate-100">
                <img
                  src={p.images?.[0] ?? 'https://via.placeholder.com/400'}
                  alt={p.name}
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              </Link>
              <div className="p-4">
                <Link to={`/products/${p.slug}`} className="font-semibold hover:text-brand-600 line-clamp-2">
                  {p.name}
                </Link>
                <p className="mt-2 text-lg font-bold">${p.price.toFixed(2)}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {outOfStock ? (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  ) : (
                    <span className="text-green-600 font-medium">{p.stock} in stock</span>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moveMutation.mutate(p._id)}
                    disabled={outOfStock || moveMutation.isPending}
                    className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(p._id)}
                    disabled={removeMutation.isPending}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
