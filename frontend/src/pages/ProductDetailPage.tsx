import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import WishlistButton from '@/components/WishlistButton';
import toast from 'react-hot-toast';
import { fetchProduct } from '@/api/products';
import { addToCart } from '@/api/cart';
import { fetchProductReviews, createReview } from '@/api/reviews';
import { useAuthStore } from '@/store/authStore';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
  });

  const addMutation = useMutation({
    mutationFn: () => addToCart(product!._id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart');
    },
    onError: () => toast.error('Could not add to cart'),
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn: () => fetchProductReviews(product!._id),
    enabled: !!product?._id,
  });

  const reviewMutation = useMutation({
    mutationFn: () => createReview(product!._id, rating, comment.trim()),
    onSuccess: () => {
      setComment('');
      setRating(5);
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      toast.success('Review submitted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Could not submit review');
    },
  });

  const userAlreadyReviewed = reviews.some(
    (r) => r.user?._id === user?._id || r.name === user?.name
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <p className="p-10 text-center">Product not found</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-slate-100">
          <div className="absolute right-3 top-3 z-10">
            <WishlistButton productId={product._id} />
          </div>
          <img
            src={product.images[0] ?? 'https://via.placeholder.com/600'}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          {product.brand && (
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              {product.brand}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {product.rating.toFixed(1)} ({product.numReviews} reviews)
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-slate-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

          <p className="mt-4 text-sm text-slate-500">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{product.stock} in stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of stock</span>
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-slate-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 text-slate-600 hover:bg-slate-50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="p-3 text-slate-600 hover:bg-slate-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addMutation.mutate()}
              disabled={product.stock === 0 || addMutation.isPending}
              className="btn-primary"
              data-testid="add-to-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-slate-200 pt-12">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Customer reviews ({reviews.length})
        </h2>

        {user && user.role !== 'admin' && !userAlreadyReviewed && (
          <form
            className="card mt-6 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) {
                toast.error('Please write a comment');
                return;
              }
              reviewMutation.mutate();
            }}
          >
            <p className="text-sm font-medium text-slate-700">Write a review</p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="text-amber-500"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={`h-6 w-6 ${n <= rating ? 'fill-current' : 'text-slate-200'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              required
              rows={3}
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field mt-3"
            />
            <button
              type="submit"
              disabled={reviewMutation.isPending}
              className="btn-primary mt-3"
            >
              {reviewMutation.isPending ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}

        {user && userAlreadyReviewed && (
          <p className="mt-4 text-sm text-slate-500">You have already reviewed this product.</p>
        )}

        {!user && (
          <p className="mt-4 text-sm text-slate-500">
            <Link to="/login" className="text-brand-600 hover:underline">
              Sign in
            </Link>{' '}
            to write a review.
          </p>
        )}

        <div className="mt-8 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="border-b border-slate-100 pb-6 last:border-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-1 flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-slate-600">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
