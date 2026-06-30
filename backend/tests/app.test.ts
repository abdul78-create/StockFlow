import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('API Gateway Sanity Checks', () => {
  it('GET /health should return 200 and environment metadata', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('env');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1/auth/me should return 401 when token cookie is missing', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
});
