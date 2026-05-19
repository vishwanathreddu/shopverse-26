import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/api/orders';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center">Loading orders...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">My orders</h1>

      {!orders?.length ? (
        <p className="mt-8 text-slate-500">No orders yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/account/orders/${order._id}`}
              className="card flex items-center justify-between p-4 transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.orderItems.length}{' '}
                  items
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">${order.totalPrice.toFixed(2)}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] ?? 'bg-slate-100'}`}
                >
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
