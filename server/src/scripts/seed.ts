import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Purging existing demo collections...');

    // Clear old demo records
    await Promise.all([
      User.deleteMany({ email: /@opsforge\.demo$/ }),
      Organization.deleteMany({ slug: 'opsforge-demo' }),
      Project.deleteMany({ key: { $in: ['OPS', 'MOB', 'SRE'] } }),
      Task.deleteMany({ key: /^(OPS|MOB|SRE)-/ }),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo organization & users...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo1234!', salt);

    // Create Organization placeholder
    const org = await Organization.create({
      name: 'OpsForge Demo Engineering',
      slug: 'opsforge-demo',
      owner: new mongoose.Types.ObjectId(), // Will update after admin is created
      members: [],
    });

    // Create Users
    const adminUser = await User.create({
      name: 'Aniket Atole (Admin)',
      email: 'admin@opsforge.demo',
      passwordHash: demoPasswordHash,
      role: 'admin',
      organization: org._id,
      bio: 'Lead Staff Architect & Platform Engineering Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const managerUser = await User.create({
      name: 'Sarah Connor (PM)',
      email: 'manager@opsforge.demo',
      passwordHash: demoPasswordHash,
      role: 'project_manager',
      organization: org._id,
      bio: 'Technical Product Manager & Agile Delivery Lead',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    const devUser = await User.create({
      name: 'David Chen (Dev)',
      email: 'developer@opsforge.demo',
      passwordHash: demoPasswordHash,
      role: 'developer',
      organization: org._id,
      bio: 'Full-Stack Systems Engineer & Distributed Systems Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const memberUser = await User.create({
      name: 'Elena Rostova (QA)',
      email: 'member@opsforge.demo',
      passwordHash: demoPasswordHash,
      role: 'member',
      organization: org._id,
      bio: 'QA Engineer & Test Automation Specialist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    });

    // Update organization with owner and members
    org.owner = adminUser._id;
    org.members = [
      { user: adminUser._id, role: 'admin', joinedAt: new Date() },
      { user: managerUser._id, role: 'project_manager', joinedAt: new Date() },
      { user: devUser._id, role: 'developer', joinedAt: new Date() },
      { user: memberUser._id, role: 'member', joinedAt: new Date() },
    ];
    await org.save();

    console.log('[Seed] Creating demo projects...');
    const now = new Date();
    const twoWeeksLater = new Date(Date.now() + 14 * 86400000);
    const oneMonthLater = new Date(Date.now() + 30 * 86400000);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);

    const projectCore = await Project.create({
      name: 'OpsForge Core Platform',
      key: 'OPS',
      description: 'Next-generation AI-powered developer collaboration and Kanban orchestration engine.',
      organization: org._id,
      owner: adminUser._id,
      status: 'active',
      priority: 'critical',
      startDate: threeDaysAgo,
      deadline: twoWeeksLater,
      taskCounter: 6,
      members: [
        { user: adminUser._id, role: 'manager' },
        { user: managerUser._id, role: 'manager' },
        { user: devUser._id, role: 'contributor' },
        { user: memberUser._id, role: 'viewer' },
      ],
    });

    const projectMobile = await Project.create({
      name: 'OpsForge Mobile Suite',
      key: 'MOB',
      description: 'Native iOS & Android companion applications for real-time notifications and on-call alerting.',
      organization: org._id,
      owner: managerUser._id,
      status: 'planning',
      priority: 'high',
      startDate: now,
      deadline: oneMonthLater,
      taskCounter: 3,
      members: [
        { user: managerUser._id, role: 'manager' },
        { user: devUser._id, role: 'contributor' },
      ],
    });

    const projectInfra = await Project.create({
      name: 'Cloud Infrastructure & SRE',
      key: 'SRE',
      description: 'Multi-region Kubernetes deployment, OpenTelemetry observability, and Zero-Trust network.',
      organization: org._id,
      owner: adminUser._id,
      status: 'active',
      priority: 'high',
      startDate: threeDaysAgo,
      deadline: twoWeeksLater,
      taskCounter: 3,
      members: [
        { user: adminUser._id, role: 'manager' },
        { user: devUser._id, role: 'contributor' },
      ],
    });

    console.log('[Seed] Populating realistic tasks with subtasks and labels...');
    const tasksData = [
      {
        key: 'OPS-1',
        taskNumber: 1,
        project: projectCore._id,
        organization: org._id,
        title: 'Architect JWT Authentication & Role-Based Access Control',
        description: 'Implement secure Bearer token and HTTP-only cookie authorization verifying admin, PM, dev, and member roles across all endpoints.',
        status: 'done',
        priority: 'critical',
        order: 0,
        creator: adminUser._id,
        assignee: devUser._id,
        labels: ['security', 'auth', 'backend'],
        estimatedHours: 8,
        dueDate: new Date(Date.now() - 1 * 86400000),
        subtasks: [
          { title: 'Define User Mongoose schema with passwordHash hidden', completed: true, completedAt: now },
          { title: 'Implement bcrypt compare and hash functions', completed: true, completedAt: now },
          { title: 'Construct requireRole and authenticateJWT Express middlewares', completed: true, completedAt: now },
        ],
      },
      {
        key: 'OPS-2',
        taskNumber: 2,
        project: projectCore._id,
        organization: org._id,
        title: 'Build Real-Time WebSocket Synchronization via Socket.IO',
        description: 'Provide live Kanban card movements, column reordering, instant comments, and online user presence.',
        status: 'done',
        priority: 'high',
        order: 1,
        creator: adminUser._id,
        assignee: devUser._id,
        labels: ['realtime', 'websockets', 'backend'],
        estimatedHours: 10,
        dueDate: now,
        subtasks: [
          { title: 'Implement socketAuthMiddleware using JWT handshake', completed: true, completedAt: now },
          { title: 'Wire project room joining and task moved event dispatching', completed: true, completedAt: now },
          { title: 'Maintain in-memory online presence set', completed: true, completedAt: now },
        ],
      },
      {
        key: 'OPS-3',
        taskNumber: 3,
        project: projectCore._id,
        organization: org._id,
        title: 'Develop Interactive Drag-and-Drop Kanban Board UI',
        description: 'Implement optimistic UI updates, column status transitions, priority badges, and overdue visual indicators in React.',
        status: 'in_progress',
        priority: 'critical',
        order: 0,
        creator: managerUser._id,
        assignee: devUser._id,
        labels: ['frontend', 'kanban', 'ui'],
        estimatedHours: 12,
        dueDate: new Date(Date.now() + 2 * 86400000),
        subtasks: [
          { title: 'Install @hello-pangea/dnd and construct 5 column containers', completed: true, completedAt: now },
          { title: 'Implement optimistic local cache updates with TanStack Query', completed: true, completedAt: now },
          { title: 'Add quick-create task inline modal dialog', completed: false },
        ],
      },
      {
        key: 'OPS-4',
        taskNumber: 4,
        project: projectCore._id,
        organization: org._id,
        title: 'Design AI Assistant Planner & Task Breakdown Module',
        description: 'Build server-side AI abstraction supporting Google Gemini API and high-precision heuristic fallback engine.',
        status: 'in_progress',
        priority: 'high',
        order: 1,
        creator: adminUser._id,
        assignee: adminUser._id,
        labels: ['ai', 'gemini', 'backend'],
        estimatedHours: 9,
        dueDate: new Date(Date.now() + 4 * 86400000),
        subtasks: [
          { title: 'Create AIEngineProvider interface and types', completed: true, completedAt: now },
          { title: 'Implement GeminiProvider with structured JSON schema responses', completed: true, completedAt: now },
          { title: 'Implement HeuristicProvider fallback engine for guaranteed reliability', completed: true, completedAt: now },
          { title: 'Build task preview modal prior to project insertion', completed: false },
        ],
      },
      {
        key: 'OPS-5',
        taskNumber: 5,
        project: projectCore._id,
        organization: org._id,
        title: 'Productivity Analytics Dashboard with Recharts',
        description: 'Aggregate team velocity, task status distribution, sprint completion trends, and individual workload charts.',
        status: 'in_review',
        priority: 'medium',
        order: 0,
        creator: managerUser._id,
        assignee: devUser._id,
        labels: ['analytics', 'recharts', 'frontend'],
        estimatedHours: 7,
        dueDate: new Date(Date.now() + 5 * 86400000),
        subtasks: [
          { title: 'Construct MongoDB aggregation pipelines for status and priority counts', completed: true, completedAt: now },
          { title: 'Build responsive AreaChart for daily completion trend', completed: true, completedAt: now },
          { title: 'Build BarChart for team workload breakdown', completed: true, completedAt: now },
        ],
      },
      {
        key: 'OPS-6',
        taskNumber: 6,
        project: projectCore._id,
        organization: org._id,
        title: 'Automated CI/CD Pipeline & Docker Containerization',
        description: 'Create multi-stage Dockerfile, docker-compose configuration, and GitHub Actions workflow verifying tests and builds.',
        status: 'todo',
        priority: 'medium',
        order: 0,
        creator: adminUser._id,
        assignee: adminUser._id,
        labels: ['devops', 'ci-cd', 'docker'],
        estimatedHours: 6,
        dueDate: new Date(Date.now() + 7 * 86400000),
        subtasks: [
          { title: 'Create production multi-stage Dockerfile', completed: false },
          { title: 'Setup GitHub Actions CI workflow for lint and tests', completed: false },
        ],
      },
      {
        key: 'MOB-1',
        taskNumber: 1,
        project: projectMobile._id,
        organization: org._id,
        title: 'Mobile Architecture Prototype & Figma Specifications',
        description: 'Define cross-platform React Native / PWA architecture and offline state caching strategy.',
        status: 'backlog',
        priority: 'medium',
        order: 0,
        creator: managerUser._id,
        assignee: managerUser._id,
        labels: ['mobile', 'design'],
        estimatedHours: 14,
        dueDate: new Date(Date.now() + 18 * 86400000),
        subtasks: [],
      },
      {
        key: 'SRE-1',
        taskNumber: 1,
        project: projectInfra._id,
        organization: org._id,
        title: 'Setup Centralized Structured Logging & Health Probes',
        description: 'Integrate HTTP request correlation IDs, JSON error formatting, and liveness/readiness probes.',
        status: 'done',
        priority: 'high',
        order: 0,
        creator: adminUser._id,
        assignee: devUser._id,
        labels: ['sre', 'devops', 'observability'],
        estimatedHours: 5,
        dueDate: threeDaysAgo,
        subtasks: [],
      },
      {
        key: 'SRE-2',
        taskNumber: 2,
        project: projectInfra._id,
        organization: org._id,
        title: 'Configure Rate Limiting & Helmet Security Policy',
        description: 'Enforce 100 req/min limits on authentication routes, enable HSTS, frameguard, and CSP protections.',
        status: 'in_progress',
        priority: 'critical',
        order: 0,
        creator: adminUser._id,
        assignee: devUser._id,
        labels: ['security', 'sre'],
        estimatedHours: 4,
        dueDate: new Date(Date.now() + 1 * 86400000),
        subtasks: [],
      },
    ];

    const createdTasks = await Task.insertMany(tasksData);

    console.log('[Seed] Adding sample comments and activity logs...');
    await Comment.create([
      {
        task: createdTasks[0]._id,
        project: projectCore._id,
        organization: org._id,
        author: adminUser._id,
        content: 'JWT implementation verified. Refresh cookies and Bearer headers are both passing integration tests.',
      },
      {
        task: createdTasks[2]._id,
        project: projectCore._id,
        organization: org._id,
        author: devUser._id,
        content: 'Kanban drag-and-drop animation is buttery smooth. Testing mobile viewport touch listeners now.',
      },
      {
        task: createdTasks[3]._id,
        project: projectCore._id,
        organization: org._id,
        author: managerUser._id,
        content: 'The AI Task Generator produced 7 perfectly scoped database and UI tasks from a single prompt. Huge time saver!',
      },
    ]);

    await Activity.create([
      {
        organization: org._id,
        project: projectCore._id,
        user: adminUser._id,
        action: 'created',
        entityType: 'project',
        details: { summary: 'Aniket created project OpsForge Core Platform (OPS)' },
      },
      {
        organization: org._id,
        project: projectCore._id,
        task: createdTasks[2]._id,
        user: devUser._id,
        action: 'status_changed',
        entityType: 'task',
        details: {
          field: 'status',
          from: 'todo',
          to: 'in_progress',
          summary: 'David Chen moved OPS-3 to IN PROGRESS',
        },
      },
      {
        organization: org._id,
        project: projectCore._id,
        task: createdTasks[0]._id,
        user: devUser._id,
        action: 'status_changed',
        entityType: 'task',
        details: {
          field: 'status',
          from: 'in_review',
          to: 'done',
          summary: 'David Chen completed OPS-1 (Architect JWT Authentication)',
        },
      },
    ]);

    await Notification.create([
      {
        recipient: devUser._id,
        sender: adminUser._id,
        organization: org._id,
        project: projectCore._id,
        task: createdTasks[2]._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'Aniket assigned you to "OPS-3: Develop Interactive Drag-and-Drop Kanban Board UI"',
        link: `/app/projects/${projectCore._id}`,
        isRead: false,
      },
      {
        recipient: adminUser._id,
        sender: devUser._id,
        organization: org._id,
        project: projectCore._id,
        task: createdTasks[0]._id,
        type: 'task_status',
        title: 'Task Completed',
        message: 'David Chen moved "OPS-1: Architect JWT Authentication" to Done',
        link: `/app/projects/${projectCore._id}`,
        isRead: true,
      },
    ]);

    console.log(`================================================================`);
    console.log(`✅ Demo database successfully seeded!`);
    console.log(`🏢 Organization: OpsForge Demo Engineering`);
    console.log(`🔑 Credentials for testing & evaluation:`);
    console.log(`   - Admin:      admin@opsforge.demo    / Demo1234!`);
    console.log(`   - Manager:    manager@opsforge.demo  / Demo1234!`);
    console.log(`   - Developer:  developer@opsforge.demo / Demo1234!`);
    console.log(`   - Member:     member@opsforge.demo   / Demo1234!`);
    console.log(`📁 Seeded: 3 Projects, 9 Tasks, Comments, Audit Logs & Notifications`);
    console.log(`================================================================`);

    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
