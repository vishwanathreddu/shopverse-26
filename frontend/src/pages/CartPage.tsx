import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCart, updateCartItem, clearCart } from '@/api/cart';
import type { Product } from '@/types';

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (msg) return msg;
  }
  return 'Something went wrong';
}

export default function CartPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: user?.role !== 'admin',
  });

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const updateMutation = useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
      updateCartItem(productId, qty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => {
    const p = item.product as Product;
    return sum + (p?.price ?? 0) * item.qty;
  }, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">Loading cart...</div>;
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Add some products to get started.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-slate-900">Shopping cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const p = item.product as Product;
            const productId = p._id;
            return (
              <div key={productId} className="card flex gap-4 p-4">
                <img
                  src={p.images?.[0] ?? 'https://via.placeholder.com/96'}
                  alt={p.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link to={`/products/${p.slug}`} className="font-semibold hover:text-brand-600">
                      {p.name}
                    </Link>
                    <p className="text-sm text-slate-500">${p.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded border border-slate-200">
                      <button
                        type="button"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({ productId, qty: item.qty - 1 })
                        }
                        className="p-2 hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        disabled={updateMutation.isPending || item.qty >= p.stock}
                        onClick={() =>
                          updateMutation.mutate({ productId, qty: item.qty + 1 })
                        }
                        className="p-2 hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="font-semibold">${(p.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="text-sm text-red-600 hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Clear cart
          </button>
        </div>

        <div className="card h-fit p-6">
          <h2 className="font-semibold text-lg">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Shipping</dt>
              <dd>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Tax (8%)</dt>
              <dd>${tax.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>${total.toFixed(2)}</dd>
            </div>
          </dl>
          <Link
            to="/checkout"
            className="btn-primary mt-6 w-full text-center"
            data-testid="proceed-checkout"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
