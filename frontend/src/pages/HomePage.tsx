import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react';
import { fetchProducts } from '@/api/products';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ featured: true, limit: 4 }),
  });

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
              MERN Stack Portfolio Project
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Shop smarter with ShopVerse
            </h1>
            <p className="mt-6 text-lg text-brand-100">
              A production-style e-commerce platform with JWT auth, Stripe payments,
              admin dashboard, and a modern React storefront.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
                Browse collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Truck, title: 'Free shipping', desc: 'On orders over $100' },
            { icon: Shield, title: 'Secure checkout', desc: 'Stripe-powered payments' },
            { icon: RefreshCw, title: 'Easy returns', desc: '30-day return policy' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Featured products</h2>
            <p className="mt-1 text-slate-500">Hand-picked favorites from our catalog</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card aspect-[3/4] animate-pulse bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
