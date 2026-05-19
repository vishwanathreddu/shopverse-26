import { useQuery } from '@tanstack/react-query';
import { fetchAdminCarts } from '@/api/admin';
import type { Product } from '@/types';

export default function AdminCartsPage() {
  const { data: carts, isLoading } = useQuery({
    queryKey: ['admin-carts'],
    queryFn: fetchAdminCarts,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Active carts</h1>
      <p className="mt-1 text-slate-500">
        Read-only view of carts with items (guest sessions and logged-in users)
      </p>

      <div className="card mt-8 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : !carts?.length ? (
          <p className="p-8 text-center text-slate-500">No active carts</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {carts.map((cart) => {
              const itemCount = cart.items.reduce((s, i) => s + i.qty, 0);
              const total = cart.items.reduce((s, i) => {
                const p = i.product as Product;
                return s + (p?.price ?? 0) * i.qty;
              }, 0);
              return (
                <div key={cart._id} className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">
                        {cart.user
                          ? `${cart.user.name} (${cart.user.email})`
                          : `Guest · session ${cart.sessionId?.slice(0, 8)}…`}
                      </p>
                      <p className="text-xs text-slate-500">
                        Updated {new Date(cart.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {itemCount} items · ${total.toFixed(2)}
                    </p>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    {cart.items.map((item, idx) => {
                      const p = item.product as Product;
                      return (
                        <li key={idx}>
                          {p?.name ?? 'Product'} × {item.qty} — ${((p?.price ?? 0) * item.qty).toFixed(2)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
