export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  address?: ShippingAddress;
}

export interface ShippingAddress {
  fullName?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { _id: string; name: string; email?: string };
  product?: { _id: string; name: string; slug: string };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: Category | string;
  images: string[];
  stock: number;
  sku: string;
  brand?: string;
  rating: number;
  numReviews: number;
  featured: boolean;
  active?: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

export interface Order {
  _id: string;
  orderItems: { name: string; qty: number; price: number; image: string }[];
  shippingAddress: ShippingAddress & { fullName: string };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
