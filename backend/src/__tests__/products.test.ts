import { api, loginAs, authHeader } from './helpers/request.js';
import { seedTestData, TEST_USER } from './helpers/seedTestData.js';

describe('Products API', () => {
  let productId: string;

  beforeEach(async () => {
    const data = await seedTestData();
    productId = data.product._id.toString();
  });

  it('GET /api/products — lists active products', async () => {
    const res = await api.get('/api/products').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/products/:slug — returns product by slug', async () => {
    const res = await api.get('/api/products/test-headphones').expect(200);

    expect(res.body.product.name).toBe('Test Headphones');
    expect(res.body.product.slug).toBe('test-headphones');
  });

  it('GET /api/products/:slug — 404 for unknown slug', async () => {
    await api.get('/api/products/does-not-exist').expect(404);
  });

  it('POST /api/cart/items — adds product when logged in', async () => {
    const { accessToken } = await loginAs(TEST_USER.email, TEST_USER.password);

    const res = await api
      .post('/api/cart/items')
      .set(authHeader(accessToken))
      .send({ productId, qty: 2 })
      .expect(200);

    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.cart.items[0].qty).toBe(2);
  });
});
