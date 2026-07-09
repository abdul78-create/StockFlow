import request from 'supertest';
import app from '../src/app';
import prisma from '../src/infra/database/prisma';

describe('Auth API', () => {
  let cookie: string[];
  let userId: string;

  beforeAll(async () => {
    // 1. Ensure clean slate
    await prisma.session.deleteMany({ where: { user: { email: 'test.auth@stockflow.com' } } });
    await prisma.user.deleteMany({ where: { email: 'test.auth@stockflow.com' } });

    // 2. Sign up to get a session
    const signupRes = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'test.auth@stockflow.com',
        password: 'Password123!',
        firstName: 'InitialFirst',
        lastName: 'InitialLast',
      });

    expect(signupRes.status).toBe(201);
    cookie = signupRes.get('Set-Cookie') || [];
    userId = signupRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { user: { email: 'test.auth@stockflow.com' } } });
    await prisma.user.deleteMany({ where: { email: 'test.auth@stockflow.com' } });
  });

  describe('PATCH /api/v1/auth/profile', () => {
    it('should update the authenticated user profile', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Cookie', cookie)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe('UpdatedFirst');
      expect(res.body.data.lastName).toBe('UpdatedLast');
    });

    it('should prevent unauthenticated users from updating profile', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/profile')
        .send({
          firstName: 'Hacker',
          lastName: 'Man',
        });

      expect(res.status).toBe(401);
    });

    it('should validate inputs', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Cookie', cookie)
        .send({
          firstName: '',
        });

      expect(res.status).toBe(422); // Validation error is 422
    });
  });

  describe('POST /api/v1/auth/google', () => {
    it('should reject invalid idToken', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({
          idToken: 'invalid_token',
        });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid Google ID token');
    });

    it('should fail if idToken is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({});
      
      expect(res.status).toBe(422);
    });
  });
});
