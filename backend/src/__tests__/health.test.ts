import { api } from './helpers/request.js';

describe('Health', () => {
  it('GET /api/health returns running status', async () => {
    const res = await api.get('/api/health').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});
