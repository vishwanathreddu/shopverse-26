import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { register as registerApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await registerApi(data.name, data.email, data.password);
      setAuth(res.user, res.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Account created!');
      navigate('/products', { replace: true });
    } catch {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-center">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-4 p-6">
        {(['name', 'email', 'password', 'confirmPassword'] as const).map((field) => (
          <div key={field}>
            <label className="text-sm font-medium capitalize">
              {field === 'confirmPassword' ? 'Confirm password' : field}
            </label>
            <input
              {...register(field)}
              type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
              className="input-field mt-1"
            />
            {errors[field] && (
              <p className="text-xs text-red-600 mt-1">{errors[field]?.message}</p>
            )}
          </div>
        ))}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
