import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, updateUserRole } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => fetchAdminUsers(page),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User role updated');
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Update failed';
      toast.error(msg ?? 'Update failed');
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Users</h1>
      <p className="mt-1 text-slate-500">Manage customer and admin accounts</p>

      <div className="card mt-8 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : (
          <>
            <div className="table-scroll">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map((u) => (
                    <tr key={u._id} className="border-t border-slate-100">
                      <td className="px-6 py-3 font-medium">{u.name}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">
                        {u._id === currentUser?._id ? (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800 capitalize">
                            {u.role} (you)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              roleMutation.mutate({
                                id: u._id,
                                role: e.target.value as 'user' | 'admin',
                              })
                            }
                            className="rounded border border-slate-200 px-2 py-1 text-xs capitalize"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
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
