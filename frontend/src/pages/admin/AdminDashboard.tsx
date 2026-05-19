import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Users, DollarSign, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';
import { fetchAdminStats, fetchAdminAnalytics } from '@/api/admin';
import SalesChart from '@/components/admin/SalesChart';

export default function AdminDashboard() {
  const [chartDays, setChartDays] = useState(30);

  const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats });
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics', chartDays],
    queryFn: () => fetchAdminAnalytics(chartDays),
  });
  const stats = data?.stats;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Dashboard</h1>
      <p className="mt-1 text-slate-500">Overview of your store performance</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Revenue', value: `$${(stats?.revenue ?? 0).toLocaleString()}`, icon: DollarSign },
          { label: 'Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag },
          { label: 'Products', value: stats?.totalProducts ?? 0, icon: Package },
          { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <Icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg text-slate-900">Sales</h2>
              <p className="text-sm text-slate-500">Revenue from paid orders</p>
            </div>
            <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm">
              {[7, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setChartDays(d)}
                  className={`rounded-md px-3 py-1.5 font-medium transition ${
                    chartDays === d
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <SalesChart data={analytics?.chart ?? []} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-lg text-slate-900">Low stock</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Products with ≤10 units</p>
          <ul className="mt-4 space-y-3">
            {(analytics?.lowStock ?? []).length === 0 ? (
              <li className="text-sm text-slate-500">All products are well stocked.</li>
            ) : (
              analytics?.lowStock.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-2 text-sm">
                  <Link
                    to="/admin/products"
                    className="truncate font-medium text-brand-600 hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.stock}
                  </span>
                </li>
              ))
            )}
          </ul>
          {(analytics?.lowStock?.length ?? 0) > 0 && (
            <Link
              to="/admin/products"
              className="mt-4 inline-flex text-sm font-medium text-brand-600 hover:underline"
            >
              Manage products →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: '/admin/orders', label: 'Manage orders' },
          { to: '/admin/products', label: 'Manage products' },
          { to: '/admin/categories', label: 'Manage categories' },
          { to: '/admin/reviews', label: 'Moderate reviews' },
          { to: '/admin/users', label: 'Manage users' },
          { to: '/admin/carts', label: 'View active carts' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="card flex items-center justify-between p-4 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            {label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-lg">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).map((order) => (
                <tr key={order._id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-mono text-xs">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-3">
                    {(order as { user?: { email?: string } }).user?.email ?? '—'}
                  </td>
                  <td className="px-6 py-3">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-3 capitalize">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
