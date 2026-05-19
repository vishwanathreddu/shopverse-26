import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchOrder, confirmPayment } from '@/api/orders';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';

  const { data: order, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmPayment(id!),
    onSuccess: () => {
      toast.success('Payment confirmed');
      refetch();
    },
  });

  useEffect(() => {
    if (success && order?.status === 'pending') {
      confirmMutation.mutate();
    }
  }, [success, order?.status]);

  if (!order) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        Order #{order._id.slice(-8).toUpperCase()}
      </h1>
      <p className="mt-2 capitalize text-slate-500">Status: {order.status}</p>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-4 space-y-3">
          {order.orderItems.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.qty}
              </span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-slate-200 pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="card mt-4 p-6">
        <h2 className="font-semibold">Shipping address</h2>
        <p className="mt-2 text-sm text-slate-600">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.street}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          <br />
          {order.shippingAddress.country}
        </p>
      </div>
    </div>
  );
}
