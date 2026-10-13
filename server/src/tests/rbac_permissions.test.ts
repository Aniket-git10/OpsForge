import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

describe('Role-Based Access Control (RBAC) & Tenant Isolation Suite', () => {
  let adminToken: string;
  let devToken: string;
  let memberToken: string;
  let hackerToken: string;
  let adminProjectId: string;
  let assignedTaskId: string;
  let unassignedTaskId: string;
  let memberUserId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up test data
    await User.deleteMany({ email: /@rbac-test\.com$/ });
    await Organization.deleteMany({ name: /RBAC Test/ });
    await Project.deleteMany({ key: /^RBAC/ });
    await Task.deleteMany({ key: /^RBAC/ });

    // 1. Create Org A Admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Admin',
      email: 'alice@rbac-test.com',
      password: 'Password123!',
      organizationName: 'RBAC Test Org A',
    });
    adminToken = adminRes.body.data.token;
    const orgId = adminRes.body.data.user.organization.id;

    // 2. Create Org A Developer
    const devUser = await User.create({
      name: 'Bob Dev',
      email: 'bob@rbac-test.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
      role: 'developer',
      organization: orgId,
    });
    const devLoginRes = await request(app).post('/api/auth/login').send({
      email: 'bob@rbac-test.com',
      password: 'Password123!',
    });
    // Or generate token directly / set password
    devUser.passwordHash = await (await import('bcryptjs')).default.hash('Password123!', 10);
    await devUser.save();
    const devLogin = await request(app).post('/api/auth/login').send({
      email: 'bob@rbac-test.com',
      password: 'Password123!',
    });
    devToken = devLogin.body.data.token;

    // 3. Create Org A Member
    const memUser = await User.create({
      name: 'Charlie Member',
      email: 'charlie@rbac-test.com',
      passwordHash: await (await import('bcryptjs')).default.hash('Password123!', 10),
      role: 'member',
      organization: orgId,
    });
    memberUserId = memUser._id.toString();
    const memLogin = await request(app).post('/api/auth/login').send({
      email: 'charlie@rbac-test.com',
      password: 'Password123!',
    });
    memberToken = memLogin.body.data.token;

    // 4. Create Org B Hacker
    const hackerRes = await request(app).post('/api/auth/register').send({
      name: 'Mallory Hacker',
      email: 'mallory@rbac-test.com',
      password: 'Password123!',
      organizationName: 'RBAC Test Org B',
    });
    hackerToken = hackerRes.body.data.token;

    // 5. Admin creates project in Org A
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Secured Project',
        key: 'RBAC',
        description: 'Testing permissions',
      });
    adminProjectId = projRes.body.data._id;

    // 6. Create assigned task
    const assignedRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        projectId: adminProjectId,
        title: 'Assigned Task for Member',
        status: 'todo',
        priority: 'medium',
        assignee: memberUserId,
      });
    assignedTaskId = assignedRes.body.data._id;

    // 7. Create unassigned task
    const unassignedRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        projectId: adminProjectId,
        title: 'Unassigned Protected Task',
        status: 'todo',
        priority: 'high',
      });
    unassignedTaskId = unassignedRes.body.data._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@rbac-test\.com$/ });
    await Organization.deleteMany({ name: /RBAC Test/ });
    await Project.deleteMany({ key: /^RBAC/ });
    await Task.deleteMany({ key: /^RBAC/ });
    await mongoose.connection.close();
  });

  it('Rejects project creation from member with 403', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Illegal Proj', key: 'FAIL' });
    expect(res.status).toBe(403);
  });

  it('Rejects project creation from developer with 403', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ name: 'Illegal Dev Proj', key: 'FAIL2' });
    expect(res.status).toBe(403);
  });

  it('Rejects member creating tasks directly with 403', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        projectId: adminProjectId,
        title: 'Unauthorized Task',
      });
    expect(res.status).toBe(403);
  });

  it('Allows member to update task assigned to them with 200', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${assignedTaskId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'in_progress', newOrder: 0 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('Rejects member updating unassigned task with 403', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${unassignedTaskId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'done', newOrder: 0 });
    expect(res.status).toBe(403);
  });

  it('Rejects member deleting task with 403', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${assignedTaskId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('Enforces cross-tenant isolation: User from Org B gets 404 when querying Org A project', async () => {
    const res = await request(app)
      .get(`/api/projects/${adminProjectId}`)
      .set('Authorization', `Bearer ${hackerToken}`);
    expect(res.status).toBe(404);
  });
});
