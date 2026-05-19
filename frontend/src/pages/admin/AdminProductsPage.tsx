import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  fetchAdminProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '@/api/admin';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: '',
  stock: '',
  sku: '',
  brand: '',
  image: '',
  featured: false,
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => fetchAdminProducts(page),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        category: form.category,
        stock: Number(form.stock),
        sku: form.sku,
        brand: form.brand || undefined,
        images: form.image ? [form.image] : [],
        featured: form.featured,
        active: true,
      };
      if (editing) return updateProduct(editing._id, payload);
      return createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(editing ? 'Product updated' : 'Product created');
      closeModal();
    },
    onError: () => toast.error('Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Product deactivated');
    },
    onError: () => toast.error('Delete failed'),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
      category: typeof p.category === 'object' ? p.category._id : String(p.category),
      stock: String(p.stock),
      sku: p.sku,
      brand: p.brand ?? '',
      image: p.images[0] ?? '',
      featured: p.featured,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setUploading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Products</h1>
          <p className="mt-1 text-slate-500">Create, edit, and deactivate catalog items</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add product
        </button>
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
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.products.map((p) => (
                    <tr key={p._id} className="border-t border-slate-100">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] && (
                            <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                          )}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            {p.featured && (
                              <span className="text-xs text-amber-600">Featured</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{p.sku}</td>
                      <td className="px-6 py-3">${p.price.toFixed(2)}</td>
                      <td className="px-6 py-3">{p.stock}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {p.active && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Deactivate this product?')) {
                                  deleteMutation.mutate(p._id);
                                }
                              }}
                              className="rounded p-1.5 text-red-600 hover:bg-red-50"
                              title="Deactivate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
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

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <h2 className="text-lg font-bold">{editing ? 'Edit product' : 'New product'}</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
            >
              {[
                ['name', 'Name', 'text'],
                ['sku', 'SKU', 'text'],
                ['brand', 'Brand', 'text'],
                ['price', 'Price', 'number'],
                ['compareAtPrice', 'Compare at price', 'number'],
                ['stock', 'Stock', 'number'],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    type={type}
                    required={['name', 'sku', 'price', 'stock', 'category'].includes(key)}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium">Product image</label>
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="mt-2 h-24 w-24 rounded-lg border border-slate-200 object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Upload to Cloudinary (if configured) or paste a URL below
                </p>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="input-field mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="">Select category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured product
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1">
                  {saveMutation.isPending ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
