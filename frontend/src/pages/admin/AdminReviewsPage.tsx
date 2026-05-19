import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { fetchAdminReviews, deleteReview } from '@/api/admin';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page],
    queryFn: () => fetchAdminReviews(page),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Review deleted');
    },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Reviews</h1>
        <p className="mt-1 text-slate-500">Moderate customer product reviews</p>
      </div>

      <div className="card mt-8 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3">Comment</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.reviews.map((r) => (
                    <tr key={r._id} className="border-t border-slate-100">
                      <td className="px-6 py-3">
                        {r.product ? (
                          <Link
                            to={`/products/${r.product.slug}`}
                            className="font-medium text-brand-600 hover:underline"
                          >
                            {r.product.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-medium">{r.name}</p>
                        {r.user?.email && (
                          <p className="text-xs text-slate-500">{r.user.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="max-w-xs px-6 py-3 text-slate-600">
                        <p className="line-clamp-2">{r.comment}</p>
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this review?')) {
                              deleteMutation.mutate(r._id);
                            }
                          }}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data?.reviews.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No reviews yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 border-t border-slate-200 p-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center text-sm text-slate-600">
                  Page {page} of {data.pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
