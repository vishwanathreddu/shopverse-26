import { api, loginAs, authHeader } from './helpers/request.js';
import { seedTestData, TEST_ADMIN, TEST_USER } from './helpers/seedTestData.js';

describe('Admin API', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  it('GET /api/admin/stats — forbidden for customers', async () => {
    const { accessToken } = await loginAs(TEST_USER.email, TEST_USER.password);
    await api.get('/api/admin/stats').set(authHeader(accessToken)).expect(403);
  });

  it('GET /api/admin/stats — returns stats for admin', async () => {
    const { accessToken } = await loginAs(TEST_ADMIN.email, TEST_ADMIN.password);

    const res = await api.get('/api/admin/stats').set(authHeader(accessToken)).expect(200);

    expect(res.body.stats).toMatchObject({
      totalOrders: expect.any(Number),
      totalProducts: expect.any(Number),
      totalUsers: expect.any(Number),
      revenue: expect.any(Number),
    });
  });

  it('GET /api/admin/analytics — returns chart data for admin', async () => {
    const { accessToken } = await loginAs(TEST_ADMIN.email, TEST_ADMIN.password);

    const res = await api
      .get('/api/admin/analytics')
      .query({ days: 7 })
      .set(authHeader(accessToken))
      .expect(200);

    expect(res.body.chart).toHaveLength(7);
    expect(res.body.lowStock).toBeDefined();
  });
});
