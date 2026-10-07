import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';

describe('Tasks, Kanban, Analytics & AI Integration Suite', () => {
  let token: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up
    await User.deleteMany({ email: /@suite-test\.com$/ });
    await Organization.deleteMany({ name: /Suite Test Org/ });
    await Project.deleteMany({ key: 'SUITE' });
    await Task.deleteMany({ key: /^SUITE-/ });

    // Register user
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Sam Engineer',
      email: 'sam@suite-test.com',
      password: 'Password123!',
      organizationName: 'Suite Test Org',
    });
    token = userRes.body.data.token;

    // Create project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Suite Project',
        key: 'SUITE',
        description: 'Testing tasks and AI assistant',
      });
    projectId = projRes.body.data._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@suite-test\.com$/ });
    await Organization.deleteMany({ name: /Suite Test Org/ });
    await Project.deleteMany({ key: 'SUITE' });
    await Task.deleteMany({ key: /^SUITE-/ });
    await mongoose.connection.close();
  });

  it('POST /api/tasks creates task with sequential key SUITE-1', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        title: 'Design API Architecture',
        description: 'Setup REST and WebSocket endpoints',
        priority: 'high',
        status: 'todo',
        labels: ['backend', 'architecture'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('SUITE-1');
    expect(res.body.data.title).toBe('Design API Architecture');
    taskId = res.body.data._id;
  });

  it('PATCH /api/tasks/:id/status updates Kanban column to in_progress', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'in_progress',
        newOrder: 0,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('POST /api/tasks/:id/subtasks adds a subtask and PATCH toggles it', async () => {
    const addRes = await request(app)
      .post(`/api/tasks/${taskId}/subtasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Write OpenAPI Documentation',
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.data.length).toBe(1);
    const subtaskId = addRes.body.data[0]._id;

    const toggleRes = await request(app)
      .patch(`/api/tasks/${taskId}/subtasks/${subtaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        completed: true,
      });

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.data[0].completed).toBe(true);
  });

  it('POST /api/comments adds a comment to the task', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        taskId,
        content: 'Work has begun on the database layer schemas.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Work has begun on the database layer schemas.');
  });

  it('GET /api/analytics/dashboard returns calculated metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalProjects).toBeGreaterThanOrEqual(1);
    expect(res.body.data.summary.totalTasks).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/ai/generate-tasks produces structured tasks', async () => {
    const res = await request(app)
      .post('/api/ai/generate-tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goal: 'Build an e-commerce website',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.tasks)).toBe(true);
    expect(res.body.data.tasks.length).toBeGreaterThan(0);
    expect(res.body.data.tasks[0].title).toBeDefined();
    expect(res.body.data.engine).toBeDefined();
  });

  it('POST /api/ai/prioritize-tasks suggests workload prioritization', async () => {
    const res = await request(app)
      .post('/api/ai/prioritize-tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('POST /api/ai/summarize-project generates executive progress report', async () => {
    const res = await request(app)
      .post('/api/ai/summarize-project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.executiveSummary).toBeDefined();
    expect(res.body.data.summary.recommendations).toBeDefined();
  });
});
