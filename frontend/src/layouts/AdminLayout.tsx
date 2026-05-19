import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Store,
  Package,
  ShoppingBag,
  Users,
  ShoppingCart,
  FolderTree,
  MessageSquare,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '@/api/auth';
import toast from 'react-hot-toast';
import MobileDrawer from '@/components/MobileDrawer';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      /* ignore */
    }
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/carts', label: 'Active carts', icon: ShoppingCart },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarNav = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ to, end, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={closeSidebar}>
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-slate-200 p-4">
        <Link
          to="/products"
          onClick={closeSidebar}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <Store className="h-4 w-4 shrink-0" />
          View storefront
        </Link>
        <button
          type="button"
          onClick={() => {
            closeSidebar();
            void handleLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="font-display text-lg font-bold text-brand-700">ShopVerse</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Admin panel
          </p>
        </div>
        {sidebarNav}
      </aside>

      <MobileDrawer
        open={sidebarOpen}
        onClose={closeSidebar}
        title="ShopVerse"
        subtitle="Admin panel"
      >
        <div className="flex min-h-0 flex-1 flex-col">{sidebarNav}</div>
      </MobileDrawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0 lg:hidden">
              <p className="truncate font-display font-bold text-brand-700">Admin</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <p className="hidden truncate text-sm text-slate-500 lg:block">
            Signed in as <span className="font-medium text-slate-800">{user?.email}</span>
          </p>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:hidden">
            <Link
              to="/products"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              title="View storefront"
            >
              <Store className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
