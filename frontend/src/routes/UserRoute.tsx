import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Customer account — signed-in shoppers only (not admin) */
export default function UserRoute() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
