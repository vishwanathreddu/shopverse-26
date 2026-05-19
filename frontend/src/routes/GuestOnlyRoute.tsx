import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Login/register — redirect if already signed in */
export default function GuestOnlyRoute() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user) {
    return <Navigate to={from ?? '/products'} replace />;
  }

  return <Outlet />;
}
