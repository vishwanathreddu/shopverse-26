import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { Category } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { slugify } from '../../utils/slugify.js';

export const TEST_USER = {
  email: 'demo@shopverse.dev',
  password: 'Demo123!',
  name: 'Demo Shopper',
};

export const TEST_ADMIN = {
  email: 'admin@shopverse.dev',
  password: 'Admin123!',
  name: 'Admin User',
};

export async function seedTestData() {
  const [userHash, adminHash] = await Promise.all([
    bcrypt.hash(TEST_USER.password, 10),
    bcrypt.hash(TEST_ADMIN.password, 10),
  ]);

  const [user, admin] = await User.create([
    { name: TEST_USER.name, email: TEST_USER.email, password: userHash, role: 'user' },
    { name: TEST_ADMIN.name, email: TEST_ADMIN.email, password: adminHash, role: 'admin' },
  ]);

  const category = await Category.create({
    name: 'Electronics',
    slug: 'electronics',
    description: 'Test category',
  });

  const product = await Product.create({
    name: 'Test Headphones',
    slug: slugify('Test Headphones'),
    description: 'Test product for API tests',
    price: 99.99,
    category: category._id,
    stock: 50,
    sku: 'TEST-SKU-001',
    brand: 'TestBrand',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    rating: 4.5,
    numReviews: 10,
    featured: true,
    active: true,
  });

  return { user, admin, category, product };
}
