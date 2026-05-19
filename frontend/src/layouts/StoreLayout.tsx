import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  LogOut,
  Search,
  LayoutDashboard,
  Menu,
  User,
  Heart,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { fetchCart } from '@/api/cart';
import { fetchWishlistProductIds } from '@/api/wishlist';
import { logoutApi } from '@/api/auth';
import toast from 'react-hot-toast';
import MobileDrawer from '@/components/MobileDrawer';

export default function StoreLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isCustomer = user && !isAdmin;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: !isAdmin,
  });

  const cartCount = cart?.items.reduce((sum, i) => sum + i.qty, 0) ?? 0;

  const { data: wishlistIds = [] } = useQuery({
    queryKey: ['wishlist', 'ids'],
    queryFn: fetchWishlistProductIds,
    enabled: !!isCustomer,
  });
  const wishlistCount = wishlistIds.length;

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

  const closeMenu = () => setMenuOpen(false);

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
    }`;

  const storefrontNav = !isAdmin && (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>
        Home
      </NavLink>
      <NavLink to="/products" className={mobileNavLinkClass} onClick={closeMenu}>
        Shop all
      </NavLink>
      <NavLink to="/cart" className={mobileNavLinkClass} onClick={closeMenu}>
        <ShoppingBag className="h-4 w-4" />
        Cart{cartCount > 0 ? ` (${cartCount})` : ''}
      </NavLink>
      {isCustomer && (
        <>
          <NavLink to="/account/wishlist" className={mobileNavLinkClass} onClick={closeMenu}>
            <Heart className="h-4 w-4" />
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
          </NavLink>
          <NavLink to="/account/orders" className={mobileNavLinkClass} onClick={closeMenu}>
            <Package className="h-4 w-4" />
            My orders
          </NavLink>
        </>
      )}
      {isCustomer ? (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            void handleLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      ) : (
        <NavLink to="/login" className={mobileNavLinkClass} onClick={closeMenu}>
          <User className="h-4 w-4" />
          Sign in
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-drawer"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link
              to={isAdmin ? '/admin' : '/'}
              className="truncate font-display text-xl font-bold tracking-tight text-brand-700 sm:text-2xl"
            >
              ShopVerse
            </Link>
          </div>

          {!isAdmin && (
            <form
              className="hidden flex-1 max-w-md md:flex"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get('q') as string;
                navigate(`/products?search=${encodeURIComponent(q)}`);
              }}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input name="q" placeholder="Search products..." className="input-field pl-10" />
              </div>
            </form>
          )}

          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm sm:px-4"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin panel</span>
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/products"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:block"
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  title="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {isCustomer ? (
                  <>
                    <Link
                      to="/account/wishlist"
                      className="relative hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:block"
                      title="Wishlist"
                    >
                      <Heart className="h-5 w-5" />
                      {wishlistCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/account/orders"
                      className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:block"
                      title="My orders"
                    >
                      <Package className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:block"
                      title="Sign out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">
                    Sign in
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {!isAdmin && (
          <form
            className="border-t border-slate-100 px-4 py-2 md:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get('q') as string;
              navigate(`/products?search=${encodeURIComponent(q)}`);
            }}
          >
            <div className="relative mx-auto max-w-7xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                placeholder="Search products..."
                className="input-field pl-10"
                aria-label="Search products"
              />
            </div>
          </form>
        )}
      </header>

      {!isAdmin && (
        <MobileDrawer open={menuOpen} onClose={closeMenu} title="ShopVerse" subtitle="Menu">
          <div className="flex min-h-0 flex-1 flex-col">{storefrontNav}</div>
        </MobileDrawer>
      )}

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          <p className="font-display text-lg font-semibold text-slate-800">ShopVerse</p>
          <p className="mt-2">MERN Stack E-Commerce — Portfolio Project</p>
          <p className="mt-1">© {new Date().getFullYear()} ShopVerse</p>
        </div>
      </footer>
    </div>
  );
}
