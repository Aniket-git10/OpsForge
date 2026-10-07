import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Project } from '../models/Project.js';

describe('Project & Organization Management Tests', () => {
  let adminToken: string;
  let devToken: string;
  let orgId: string;
  let projectId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up
    await User.deleteMany({ email: /@project-test\.com$/ });
    await Organization.deleteMany({ name: /Project Test Org/ });
    await Project.deleteMany({ key: { $in: ['PROJ', 'ALPHA'] } });

    // Register admin user
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Jordan Admin',
      email: 'jordan@project-test.com',
      password: 'Password123!',
      organizationName: 'Project Test Org',
    });
    adminToken = adminRes.body.data.token;
    orgId = adminRes.body.data.user.organization.id;

    // Register normal developer user
    const devRes = await request(app).post('/api/auth/register').send({
      name: 'Taylor Dev',
      email: 'taylor@project-test.com',
      password: 'Password123!',
      organizationName: 'Taylor Separate Org',
    });
    devToken = devRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@project-test\.com$/ });
    await Organization.deleteMany({ name: /Project Test Org/ });
    await Project.deleteMany({ key: { $in: ['PROJ', 'ALPHA'] } });
    await mongoose.connection.close();
  });

  it('GET /api/organization returns workspace and members', async () => {
    const res = await request(app)
      .get('/api/organization')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Project Test Org');
    expect(res.body.data.members.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/projects creates project with key and owner', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'OpsForge Core Platform',
        key: 'PROJ',
        description: 'Next gen developer cockpit',
        priority: 'high',
        status: 'active',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('PROJ');
    expect(res.body.data.name).toBe('OpsForge Core Platform');
    projectId = res.body.data._id;
  });

  it('POST /api/projects rejects duplicate project key in same workspace', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Another Project Same Key',
        key: 'PROJ',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/projects returns list of projects with task stats', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].stats).toBeDefined();
  });

  it('PATCH /api/projects/:id updates project status and priority', async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        priority: 'critical',
        status: 'active',
        description: 'Updated core platform description',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.priority).toBe('critical');
    expect(res.body.data.description).toBe('Updated core platform description');
  });

  it('GET /api/projects/:id returns single project details', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(projectId);
    expect(res.body.data.stats.totalTasks).toBe(0);
  });
});
