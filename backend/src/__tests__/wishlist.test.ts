import { api, loginAs, authHeader } from './helpers/request.js';
import { seedTestData, TEST_USER } from './helpers/seedTestData.js';

describe('Wishlist API', () => {
  let productId: string;
  let accessToken: string;

  beforeEach(async () => {
    const data = await seedTestData();
    productId = data.product._id.toString();
    const login = await loginAs(TEST_USER.email, TEST_USER.password);
    accessToken = login.accessToken;
  });

  it('GET /api/wishlist — empty wishlist for new user', async () => {
    const res = await api.get('/api/wishlist').set(authHeader(accessToken)).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.wishlist.items).toEqual([]);
  });

  it('POST /api/wishlist/items — adds product', async () => {
    const res = await api
      .post('/api/wishlist/items')
      .set(authHeader(accessToken))
      .send({ productId })
      .expect(200);

    expect(res.body.wishlist.items.length).toBe(1);
  });

  it('GET /api/wishlist/ids — returns product ids', async () => {
    await api
      .post('/api/wishlist/items')
      .set(authHeader(accessToken))
      .send({ productId });

    const res = await api.get('/api/wishlist/ids').set(authHeader(accessToken)).expect(200);

    expect(res.body.productIds).toContain(productId);
  });

  it('DELETE /api/wishlist/items/:productId — removes product', async () => {
    await api
      .post('/api/wishlist/items')
      .set(authHeader(accessToken))
      .send({ productId });

    const res = await api
      .delete(`/api/wishlist/items/${productId}`)
      .set(authHeader(accessToken))
      .expect(200);

    expect(res.body.wishlist.items.length).toBe(0);
  });

  it('POST move-to-cart — moves item to cart', async () => {
    await api
      .post('/api/wishlist/items')
      .set(authHeader(accessToken))
      .send({ productId });

    const res = await api
      .post(`/api/wishlist/items/${productId}/move-to-cart`)
      .set(authHeader(accessToken))
      .send({ qty: 1 })
      .expect(200);

    expect(res.body.cart.items.length).toBe(1);
    expect(res.body.wishlist.items.length).toBe(0);
  });

  it('requires authentication', async () => {
    await api.get('/api/wishlist').expect(401);
  });
});
