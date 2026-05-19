import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToWishlist, fetchWishlistProductIds, removeFromWishlist } from '@/api/wishlist';
import { useAuthStore } from '@/store/authStore';

interface Props {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (msg) return msg;
  }
  return 'Something went wrong';
}

export default function WishlistButton({ productId, className = '', size = 'md' }: Props) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const isCustomer = user && user.role !== 'admin';

  const { data: wishlistIds = [] } = useQuery({
    queryKey: ['wishlist', 'ids'],
    queryFn: fetchWishlistProductIds,
    enabled: !!isCustomer,
  });

  const inWishlist = wishlistIds.includes(productId);

  const toggleMutation = useMutation({
    mutationFn: () => (inWishlist ? removeFromWishlist(productId) : addToWishlist(productId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const iconClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonClass =
    size === 'sm'
      ? 'rounded-full p-1.5 shadow-sm'
      : 'rounded-lg p-2';

  if (!isCustomer) {
    return (
      <Link
        to="/login"
        state={{ from: window.location.pathname }}
        className={`inline-flex items-center justify-center bg-white/90 text-slate-500 hover:text-red-500 ${buttonClass} ${className}`}
        title="Sign in to save to wishlist"
        aria-label="Sign in to save to wishlist"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart className={iconClass} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMutation.mutate();
      }}
      disabled={toggleMutation.isPending}
      className={`inline-flex items-center justify-center bg-white/90 transition disabled:opacity-50 ${
        inWishlist ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
      } ${buttonClass} ${className}`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
      data-testid="wishlist-toggle"
    >
      <Heart className={`${iconClass} ${inWishlist ? 'fill-current' : ''}`} />
    </button>
  );
}
