import { api, loginAs } from './helpers/request.js';
import { seedTestData, TEST_USER, TEST_ADMIN } from './helpers/seedTestData.js';

describe('Auth API', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  it('POST /api/auth/login — customer', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.user.role).toBe('user');
  });

  it('POST /api/auth/login — admin', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password })
      .expect(200);

    expect(res.body.user.role).toBe('admin');
  });

  it('POST /api/auth/login — rejects invalid credentials', async () => {
    const res = await api
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'wrong-password' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register — creates a new user', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({
        name: 'New User',
        email: 'newuser@test.dev',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('newuser@test.dev');
  });

  it('GET /api/auth/me — requires authentication', async () => {
    await api.get('/api/auth/me').expect(401);

    const { accessToken } = await loginAs(TEST_USER.email, TEST_USER.password);

    const res = await api
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.user.email).toBe(TEST_USER.email);
  });
});
