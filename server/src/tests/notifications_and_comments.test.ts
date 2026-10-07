import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';

describe('Notifications & Comments API Integration Suite', () => {
  let token: string;
  let userId: string;
  let orgId: string;
  let projectId: string;
  let taskId: string;
  let commentId: string;
  let notificationId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsforge_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up test data
    await User.deleteMany({ email: /@notif-test\.com$/ });
    await Organization.deleteMany({ name: /Notif Test Org/ });
    await Project.deleteMany({ key: 'NOTIF' });
    await Task.deleteMany({ key: /^NOTIF-/ });

    // Register user
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Alex Rivera',
      email: 'alex@notif-test.com',
      password: 'Password123!',
      organizationName: 'Notif Test Org',
    });
    token = userRes.body.data.token;
    userId = userRes.body.data.user.id;
    orgId = userRes.body.data.user.organization.id;

    // Create a project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Notification Testing Project',
        key: 'NOTIF',
        description: 'Test project for comments and alerts',
      });
    projectId = projRes.body.data._id;

    // Create a task
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectId,
        title: 'Task for Discussion Testing',
        description: 'Testing comment threads and notifications',
        status: 'todo',
        priority: 'medium',
      });
    taskId = taskRes.body.data._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@notif-test\.com$/ });
    await Organization.deleteMany({ name: /Notif Test Org/ });
    await Project.deleteMany({ key: 'NOTIF' });
    await Task.deleteMany({ key: /^NOTIF-/ });
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  it('POST /api/comments creates a comment on a task', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        taskId,
        content: 'Initial engineering review comment.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Initial engineering review comment.');
    expect(res.body.data.task.toString()).toBe(taskId);
    commentId = res.body.data._id;
  });

  it('GET /api/comments/task/:taskId retrieves all task comments', async () => {
    const res = await request(app)
      .get(`/api/comments/task/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].content).toBe('Initial engineering review comment.');
  });

  it('PATCH /api/comments/:id updates comment content', async () => {
    const res = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Updated engineering review comment with benchmark findings.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Updated engineering review comment with benchmark findings.');
  });

  it('GET /api/notifications returns user notification feed', async () => {
    // Seed a notification item
    const notif = await Notification.create({
      recipient: new mongoose.Types.ObjectId(userId),
      organization: new mongoose.Types.ObjectId(orgId),
      type: 'task_assigned',
      title: 'New Task Assignment',
      message: 'You were assigned to Task for Discussion Testing',
      isRead: false,
    });
    notificationId = notif._id.toString();

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/notifications/:id/read marks notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);
  });

  it('POST /api/notifications/mark-all-read sets all unread notifications to read', async () => {
    // Add another unread notification
    await Notification.create({
      recipient: new mongoose.Types.ObjectId(userId),
      organization: new mongoose.Types.ObjectId(orgId),
      type: 'mention',
      title: 'Mentioned in comment',
      message: 'Someone mentioned you in a comment',
      isRead: false,
    });

    const res = await request(app)
      .post('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(checkRes.body.data.unreadCount).toBe(0);
  });

  it('DELETE /api/comments/:id removes a comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const listRes = await request(app)
      .get(`/api/comments/task/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.body.data.find((c: any) => c._id === commentId)).toBeUndefined();
  });
});
