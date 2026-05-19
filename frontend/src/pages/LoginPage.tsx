import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const rawFrom = (location.state as { from?: string } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await login(data.email, data.password);
      setAuth(res.user, res.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Welcome back!');
      if (res.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const dest =
          rawFrom && !rawFrom.startsWith('/admin') ? rawFrom : '/products';
        navigate(dest, { replace: true });
      }
    } catch {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-center">Sign in</h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Customer: demo@shopverse.dev / Demo123!
        <br />
        Admin: admin@shopverse.dev / Admin123!
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-4 p-6" data-testid="login-form">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            {...register('email')}
            type="email"
            className="input-field mt-1"
            data-testid="login-email"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            {...register('password')}
            type="password"
            className="input-field mt-1"
            data-testid="login-password"
          />
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full" data-testid="login-submit">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
