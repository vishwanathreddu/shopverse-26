import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchCategories } from '@/api/products';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page')) || 1;
  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? '';

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search, category, sort }],
    queryFn: () =>
      fetchProducts({
        page,
        search: search || undefined,
        category: category || undefined,
        sort: sort || undefined,
      }),
  });

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-slate-900">All products</h1>
      {search && <p className="mt-2 text-slate-500">Results for &quot;{search}&quot;</p>}

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="card p-4 space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Category</p>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => setFilter('category', '')}
                  className={`block w-full rounded px-2 py-1.5 text-left text-sm ${!category ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All
                </button>
                {categories?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setFilter('category', c._id)}
                    className={`block w-full rounded px-2 py-1.5 text-left text-sm ${category === c._id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Sort by</p>
              <select
                value={sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="input-field mt-2"
              >
                <option value="">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-slate-200" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data?.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {data && data.pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParams({ ...Object.fromEntries(params), page: String(page - 1) })}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm text-slate-600">
                    Page {page} of {data.pagination.pages}
                  </span>
                  <button
                    disabled={page >= data.pagination.pages}
                    onClick={() => setParams({ ...Object.fromEntries(params), page: String(page + 1) })}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
