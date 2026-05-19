import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { Product } from '@/types';
import WishlistButton from '@/components/WishlistButton';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <Link to={`/products/${product.slug}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton productId={product._id} size="sm" />
        </div>
        <img
          src={product.images[0] ?? 'https://via.placeholder.com/400'}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        {product.brand && (
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{product.brand}</p>
        )}
        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-amber-500">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="text-xs font-medium text-slate-600">
            {product.rating.toFixed(1)} ({product.numReviews})
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-slate-400 line-through">${product.compareAtPrice.toFixed(2)}</span>
          )}
          {discount > 0 && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
