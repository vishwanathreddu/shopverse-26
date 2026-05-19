import request from 'supertest';
import app from '../../app.js';

export const api = request(app);

export async function loginAs(
  email: string,
  password: string
): Promise<{ accessToken: string; user: { _id: string; role: string } }> {
  const res = await api.post('/api/auth/login').send({ email, password }).expect(200);

  return {
    accessToken: res.body.accessToken,
    user: res.body.user,
  };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
