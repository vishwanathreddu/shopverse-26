import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminOrders, updateOrderStatus } from '@/api/admin';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => fetchAdminOrders(page),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Order updated');
    },
    onError: () => toast.error('Failed to update order'),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Orders</h1>
      <p className="mt-1 text-slate-500">View and update order status</p>

      <div className="card mt-8 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.orders.map((order) => (
                    <tr key={order._id} className="border-t border-slate-100">
                      <td className="px-6 py-3 font-mono text-xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-3">
                        {(order as { user?: { name?: string; email?: string } }).user?.name ??
                          '—'}
                        <br />
                        <span className="text-xs text-slate-400">
                          {(order as { user?: { email?: string } }).user?.email}
                        </span>
                      </td>
                      <td className="px-6 py-3">{order.orderItems.length}</td>
                      <td className="px-6 py-3 font-medium">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            statusMutation.mutate({ id: order._id, status: e.target.value })
                          }
                          className="rounded border border-slate-200 px-2 py-1 text-xs capitalize"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 border-t border-slate-200 p-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center text-sm text-slate-600">
                  Page {page} of {data.pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
