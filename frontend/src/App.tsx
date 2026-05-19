import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import StoreLayout from '@/layouts/StoreLayout';
import AdminLayout from '@/layouts/AdminLayout';
import GuestOnlyRoute from '@/routes/GuestOnlyRoute';
import AdminRoute from '@/routes/AdminRoute';
import UserRoute from '@/routes/UserRoute';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import WishlistPage from '@/pages/WishlistPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminCartsPage from '@/pages/admin/AdminCartsPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';
import { RedirectOrderDetail } from '@/routes/LegacyRedirects';

export default function App() {
  return (
    <Routes>
      {/* Auth — public, redirect if already logged in */}
      <Route element={<AuthLayout />}>
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Admin panel — separate layout, no cart/search */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/carts" element={<AdminCartsPage />} />
        </Route>
      </Route>

      {/* Storefront — public shopping */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Customer account — logged-in users only */}
        <Route element={<UserRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          <Route path="/account/wishlist" element={<WishlistPage />} />
        </Route>
      </Route>

      {/* Legacy paths */}
      <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
      <Route path="/orders/:id" element={<RedirectOrderDetail />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
