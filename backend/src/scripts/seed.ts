import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { slugify } from '../utils/slugify.js';

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets and devices' },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
  { name: 'Home', slug: 'home', description: 'Furniture and decor' },
  { name: 'Sports', slug: 'sports', description: 'Fitness and outdoor gear' },
];

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with 30h battery, ANC, and Bluetooth 5.3.',
    price: 249.99,
    compareAtPrice: 299.99,
    categorySlug: 'electronics',
    stock: 45,
    sku: 'SV-HP-001',
    brand: 'SoundWave',
    featured: true,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
  },
  {
    name: 'Smart Watch Pro',
    description: 'Health tracking, GPS, always-on display, water resistant to 50m.',
    price: 399.0,
    categorySlug: 'electronics',
    stock: 30,
    sku: 'SV-SW-002',
    brand: 'PulseTech',
    featured: true,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
  },
  {
    name: 'Minimalist Leather Backpack',
    description: 'Handcrafted full-grain leather, laptop compartment, lifetime warranty.',
    price: 129.0,
    categorySlug: 'fashion',
    stock: 60,
    sku: 'SV-BP-003',
    brand: 'UrbanCraft',
    featured: true,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Soft, breathable, GOTS-certified organic cotton. Unisex fit.',
    price: 34.99,
    categorySlug: 'fashion',
    stock: 120,
    sku: 'SV-TS-004',
    brand: 'EcoWear',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    description: 'Includes dripper, carafe, and filters. Dishwasher safe.',
    price: 58.5,
    categorySlug: 'home',
    stock: 40,
    sku: 'SV-CF-005',
    brand: 'BrewHaus',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'],
  },
  {
    name: 'Yoga Mat — Extra Thick',
    description: '6mm non-slip mat with alignment lines. Includes carrying strap.',
    price: 45.0,
    categorySlug: 'sports',
    stock: 80,
    sku: 'SV-YM-006',
    brand: 'ZenFit',
    featured: true,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83b5a404?w=600'],
  },
  {
    name: 'Running Shoes — Lightweight',
    description: 'Responsive foam midsole, breathable mesh upper, road-ready.',
    price: 119.99,
    compareAtPrice: 140.0,
    categorySlug: 'sports',
    stock: 55,
    sku: 'SV-RS-007',
    brand: 'StrideX',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
  },
  {
    name: 'Desk Lamp with USB-C',
    description: 'Adjustable arm, dimmable LED, built-in wireless charging pad.',
    price: 79.0,
    categorySlug: 'home',
    stock: 35,
    sku: 'SV-DL-008',
    brand: 'LumaDesk',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
  },
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const adminHash = await bcrypt.hash('Admin123!', 12);
  const demoHash = await bcrypt.hash('Demo123!', 12);

  await User.create([
    { name: 'Admin User', email: 'admin@shopverse.dev', password: adminHash, role: 'admin' },
    { name: 'Demo Shopper', email: 'demo@shopverse.dev', password: demoHash, role: 'user' },
  ]);

  const createdCategories = await Category.insertMany(categories);
  const categoryMap = Object.fromEntries(
    createdCategories.map((c) => [c.slug, c._id])
  );

  await Product.insertMany(
    products.map((p) => ({
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: categoryMap[p.categorySlug],
      stock: p.stock,
      sku: p.sku,
      brand: p.brand,
      featured: p.featured ?? false,
      images: p.images,
      rating: 4 + Math.random(),
      numReviews: Math.floor(Math.random() * 50) + 5,
      active: true,
    }))
  );

  console.log('Seed complete!');
  console.log('Admin: admin@shopverse.dev / Admin123!');
  console.log('User:  demo@shopverse.dev / Demo123!');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
