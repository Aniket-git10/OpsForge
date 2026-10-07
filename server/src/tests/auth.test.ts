import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';

describe('Auth & System Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    // Clean up test collections
    await User.deleteMany({ email: /@test-opsforge\.com$/ });
    await Organization.deleteMany({ name: /Test Workspace/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@test-opsforge\.com$/ });
    await Organization.deleteMany({ name: /Test Workspace/ });
    await mongoose.connection.close();
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('OpsForge API Server');
  });

  it('POST /api/auth/register creates a user and default organization', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alex Rivera',
      email: 'alex@test-opsforge.com',
      password: 'Password123!',
      organizationName: 'Alex Test Workspace',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alex@test-opsforge.com');
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.organization.name).toBe('Alex Test Workspace');
  });

  it('POST /api/auth/login logs in user and returns JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alex@test-opsforge.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe('Alex Rivera');
  });

  it('GET /api/auth/me returns authenticated user details', async () => {
    // First login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'alex@test-opsforge.com',
      password: 'Password123!',
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alex@test-opsforge.com');
  });

  it('GET /api/auth/me rejects request without token with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
