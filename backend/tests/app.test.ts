import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('API Gateway Sanity Checks', () => {
  it('GET /health should return 200 and professional status metadata', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('redis', 'connected');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET / should return 200 and root API information', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('application', 'StockFlow ERP API');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('redis', 'connected');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('documentation', '/api-docs');
    expect(res.body).toHaveProperty('health', '/health');
  });

  it('GET /api/v1/auth/me should return 401 when token cookie is missing', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
});
