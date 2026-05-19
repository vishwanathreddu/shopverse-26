import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createOrder } from '@/api/orders';

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'United States' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createOrder(data),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.success('Order placed successfully!');
        navigate(`/account/orders/${result.order._id}?success=true`, { replace: true });
      }
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg ?? 'Checkout failed');
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-2 text-slate-500">Enter your shipping details to complete your order.</p>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="card mt-8 space-y-4 p-6"
      >
        {(['fullName', 'street', 'city', 'state', 'zip', 'country', 'phone'] as const).map(
          (field) => (
            <div key={field}>
              <label
                htmlFor={`checkout-${field}`}
                className="mb-1 block text-sm font-medium capitalize text-slate-700"
              >
                {field === 'fullName' ? 'Full name' : field}
              </label>
              <input
                id={`checkout-${field}`}
                {...register(field)}
                className="input-field"
                data-testid={`checkout-${field}`}
              />
              {errors[field] && (
                <p className="mt-1 text-xs text-red-600">{errors[field]?.message}</p>
              )}
            </div>
          )
        )}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary w-full"
          data-testid="place-order"
        >
          {mutation.isPending ? 'Processing...' : 'Place order'}
        </button>
        <p className="text-center text-xs text-slate-400">
          Without Stripe keys, orders run in demo mode (instant confirmation).
        </p>
      </form>
    </div>
  );
}
