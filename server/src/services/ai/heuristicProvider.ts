import {
  AIEngineProvider,
  GeneratedTask,
  GeneratedSubtask,
  TaskPriorityRecommendation,
  ProjectSummaryReport,
  ProductivityInsightItem,
} from './types.js';

export class HeuristicProvider implements AIEngineProvider {
  name = 'HeuristicEngine (Deterministic AI)';

  async generateTasks(goal: string, context?: string): Promise<GeneratedTask[]> {
    const lower = goal.toLowerCase();

    if (lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store')) {
      return [
        {
          title: 'Design Product and Order Database Schema',
          description: 'Model products, categories, inventory, orders, and customer address entities in MongoDB with appropriate indexes.',
          priority: 'high',
          labels: ['database', 'architecture'],
          estimatedHours: 6,
        },
        {
          title: 'Implement Customer Authentication & Session Management',
          description: 'Build JWT signup, login, password recovery, and role-based access for buyers and store admins.',
          priority: 'critical',
          labels: ['auth', 'security', 'backend'],
          estimatedHours: 8,
        },
        {
          title: 'Develop Product Catalog & Search API',
          description: 'Create REST endpoints for product listing, pagination, filtering by category/price, and full-text search.',
          priority: 'high',
          labels: ['api', 'backend'],
          estimatedHours: 7,
        },
        {
          title: 'Build Responsive Product Grid & Detail Pages',
          description: 'Construct modern React UI components for browsing products, image galleries, and stock availability indicators.',
          priority: 'medium',
          labels: ['frontend', 'ui'],
          estimatedHours: 9,
        },
        {
          title: 'Implement Shopping Cart & Persistent State',
          description: 'Build shopping cart drawer, quantity adjustment, line-item pricing calculations, and local storage sync.',
          priority: 'high',
          labels: ['frontend', 'state-management'],
          estimatedHours: 6,
        },
        {
          title: 'Integrate Payment Gateway & Checkout Pipeline',
          description: 'Set up Stripe or payment webhook processing, order confirmation, and transactional receipts.',
          priority: 'critical',
          labels: ['payments', 'api'],
          estimatedHours: 10,
        },
        {
          title: 'End-to-End Testing & Deployment Checklist',
          description: 'Write integration tests for checkout flow, configure environment secrets, and verify production deployment.',
          priority: 'medium',
          labels: ['qa', 'devops'],
          estimatedHours: 5,
        },
      ];
    }

    if (lower.includes('chat') || lower.includes('realtime') || lower.includes('real-time') || lower.includes('collaboration')) {
      return [
        {
          title: 'Set Up WebSocket / Socket.IO Infrastructure',
          description: 'Initialize Socket.IO server with JWT authentication handshake, error handling, and reconnection strategy.',
          priority: 'critical',
          labels: ['backend', 'realtime'],
          estimatedHours: 6,
        },
        {
          title: 'Design Channel & Message Data Models',
          description: 'Create Mongoose models for channels, direct messages, read receipts, and media attachments with TTL/indexes.',
          priority: 'high',
          labels: ['database'],
          estimatedHours: 5,
        },
        {
          title: 'Build Live Messaging UI & Auto-Scroll Feed',
          description: 'Construct message thread UI, markdown rendering, date separators, and optimistic message rendering.',
          priority: 'high',
          labels: ['frontend', 'ui'],
          estimatedHours: 8,
        },
        {
          title: 'Implement Online Presence & Typing Indicators',
          description: 'Handle user join/leave room events, broadcast typing status with debounce, and show active badges.',
          priority: 'medium',
          labels: ['realtime', 'frontend'],
          estimatedHours: 4,
        },
        {
          title: 'Add Push & In-App Notification Dispatcher',
          description: 'Send alerts when users are mentioned (@user) or receive direct messages while offline.',
          priority: 'medium',
          labels: ['notifications', 'backend'],
          estimatedHours: 5,
        },
      ];
    }

    // Generic modern software project task generator
    const goalClean = goal.replace(/^(build|create|implement|design)\s+/i, '').trim();
    return [
      {
        title: `Define Architecture & Technical Specs for ${goalClean}`,
        description: `Outline system architecture, data models, external integrations, and API contract specifications for ${goalClean}.`,
        priority: 'high',
        labels: ['planning', 'architecture'],
        estimatedHours: 4,
      },
      {
        title: `Design Database Schema & Core Entities`,
        description: 'Create normalized database schemas, define constraints, setup indexes, and write seed fixtures.',
        priority: 'critical',
        labels: ['database', 'backend'],
        estimatedHours: 6,
      },
      {
        title: `Implement Backend RESTful API Services`,
        description: 'Construct CRUD controllers, validation middleware, business logic, and error handlers.',
        priority: 'high',
        labels: ['backend', 'api'],
        estimatedHours: 8,
      },
      {
        title: `Build Responsive User Interface Components`,
        description: 'Develop reusable React UI components, page layouts, empty states, and loading skeletons.',
        priority: 'high',
        labels: ['frontend', 'ui'],
        estimatedHours: 9,
      },
      {
        title: `Connect Client State & API Integration`,
        description: 'Wire TanStack Query hooks, form submission handling, mutation caches, and toast feedback.',
        priority: 'medium',
        labels: ['frontend', 'integration'],
        estimatedHours: 6,
      },
      {
        title: `Quality Assurance, Automated Testing & Documentation`,
        description: 'Write integration test coverage, verify edge cases, review security headers, and draft documentation.',
        priority: 'medium',
        labels: ['testing', 'docs'],
        estimatedHours: 5,
      },
    ];
  }

  async generateSubtasks(taskTitle: string, taskDescription?: string): Promise<GeneratedSubtask[]> {
    const lower = taskTitle.toLowerCase();

    if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt')) {
      return [
        { title: 'Install bcrypt and JWT crypto dependencies' },
        { title: 'Create User password hashing pre-save hook and comparePassword method' },
        { title: 'Implement registration and login controllers with JWT token issuance' },
        { title: 'Write authenticateJWT middleware verifying Bearer tokens and cookies' },
        { title: 'Build React login form with validation and error toast notifications' },
        { title: 'Write automated integration tests for valid and invalid credentials' },
      ];
    }

    if (lower.includes('database') || lower.includes('schema') || lower.includes('model')) {
      return [
        { title: 'Draft entity relationship specifications and required fields' },
        { title: 'Create Mongoose schema with type constraints and validation rules' },
        { title: 'Define performance indexes on frequently queried foreign keys' },
        { title: 'Add schema lifecycle hooks or virtual populate helpers' },
        { title: 'Write unit tests validating valid document creation and schema rejects' },
      ];
    }

    if (lower.includes('ui') || lower.includes('component') || lower.includes('frontend')) {
      return [
        { title: 'Build component layout structure and responsive breakpoints' },
        { title: 'Apply Tailwind typography, color tokens, and accessibility labels' },
        { title: 'Implement interactive hover, focus, and disabled states' },
        { title: 'Integrate loading skeleton state and empty placeholder state' },
        { title: 'Connect props with parent container and server state hooks' },
      ];
    }

    if (lower.includes('api') || lower.includes('endpoint') || lower.includes('backend')) {
      return [
        { title: 'Define Zod validation schemas for request body and query params' },
        { title: 'Implement controller handler with try/catch and error formatting' },
        { title: 'Attach authentication and role guard middleware to route' },
        { title: 'Verify database query performance and lean projection' },
        { title: 'Add supertest API test covering success and 400/401 error cases' },
      ];
    }

    // General fallback subtasks
    return [
      { title: `Analyze technical requirements and edge cases for "${taskTitle}"` },
      { title: 'Implement core business logic and functions' },
      { title: 'Add defensive input validation and comprehensive error handling' },
      { title: 'Perform manual smoke test across realistic usage flows' },
      { title: 'Document updates and submit code review' },
    ];
  }

  async prioritizeTasks(projectData: any, tasks: any[]): Promise<TaskPriorityRecommendation[]> {
    const now = new Date();

    return tasks.map((t) => {
      let score = 50;
      const reasons: string[] = [];
      let suggestedPriority = t.priority || 'medium';

      // Check dueDate
      if (t.dueDate) {
        const due = new Date(t.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0 && t.status !== 'done') {
          score += 35;
          suggestedPriority = 'critical';
          reasons.push(`Task is overdue by ${Math.abs(diffDays)} day(s)`);
        } else if (diffDays <= 2 && t.status !== 'done') {
          score += 25;
          if (suggestedPriority === 'low' || suggestedPriority === 'medium') {
            suggestedPriority = 'high';
          }
          reasons.push('Deadline is approaching within 48 hours');
        } else if (diffDays <= 7 && t.status !== 'done') {
          score += 10;
          reasons.push('Due within the next 7 days');
        }
      }

      // Check priority
      if (t.priority === 'critical') {
        score += 20;
        reasons.push('Marked as critical priority');
      } else if (t.priority === 'high') {
        score += 10;
        reasons.push('Marked as high priority');
      }

      // Check status
      if (t.status === 'in_progress') {
        score += 15;
        reasons.push('Work is actively in progress - finish before starting new items');
      } else if (t.status === 'in_review') {
        score += 10;
        reasons.push('Under review - unblock reviewer to reach completion');
      } else if (t.status === 'done') {
        score = 5;
        reasons.push('Already marked done');
      }

      // Unassigned risk
      if (!t.assignee && t.status !== 'done' && (t.priority === 'critical' || t.priority === 'high')) {
        score += 10;
        reasons.push('High-impact task currently lacks an assigned owner');
      }

      const finalScore = Math.min(100, Math.max(1, score));
      const urgencyLevel: 'high' | 'medium' | 'low' =
        finalScore >= 75 ? 'high' : finalScore >= 50 ? 'medium' : 'low';

      return {
        taskId: t._id.toString(),
        key: t.key,
        title: t.title,
        currentPriority: t.priority,
        suggestedPriority,
        score: finalScore,
        rationale: reasons.join('; ') || 'Standard progression based on roadmap position',
        urgencyLevel,
      };
    }).sort((a, b) => b.score - a.score);
  }

  async summarizeProject(project: any, tasks: any[]): Promise<ProjectSummaryReport> {
    const total = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done');
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    );
    const unassignedTasks = tasks.filter((t) => !t.assignee && t.status !== 'done');

    const progressRate = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;

    const blockersAndRisks: string[] = [];
    if (overdueTasks.length > 0) {
      blockersAndRisks.push(`${overdueTasks.length} task(s) have passed their scheduled deadline`);
    }
    if (unassignedTasks.length > 0) {
      blockersAndRisks.push(`${unassignedTasks.length} pending task(s) currently have no assigned developer`);
    }
    if (progressRate < 50 && project.deadline && new Date(project.deadline) < new Date(Date.now() + 7 * 86400000)) {
      blockersAndRisks.push('Project deadline is in under 7 days with less than 50% tasks completed');
    }
    if (blockersAndRisks.length === 0) {
      blockersAndRisks.push('No critical velocity blockers detected. Sprint cadence is on track.');
    }

    const recommendations: string[] = [];
    if (overdueTasks.length > 0) {
      recommendations.push(`Triage the ${overdueTasks.length} overdue task(s) immediately to reassign or adjust target dates.`);
    }
    if (inProgressTasks.length > 5) {
      recommendations.push('High work-in-progress limit detected. Encourage team to finish active tasks before starting new ones.');
    }
    if (unassignedTasks.length > 0) {
      recommendations.push('Assign team owners to unassigned backlog items to prevent bottlenecking.');
    }
    recommendations.push('Review pull requests in "In Review" column to increase completion velocity.');

    return {
      executiveSummary: `Project "${project.name}" (${project.key}) is currently at ${progressRate}% completion with ${doneTasks.length} of ${total} tasks delivered. ${inProgressTasks.length} tasks are currently in progress across the engineering team.`,
      progressRate,
      completedHighlights: doneTasks.slice(0, 5).map((t) => `${t.key}: ${t.title}`),
      inProgressHighlights: inProgressTasks.slice(0, 5).map((t) => `${t.key}: ${t.title}`),
      blockersAndRisks,
      overdueItems: overdueTasks.map((t) => `${t.key}: ${t.title} (Due: ${new Date(t.dueDate).toLocaleDateString()})`),
      recommendations,
    };
  }

  async generateInsights(analyticsData: any): Promise<ProductivityInsightItem[]> {
    const { summary, teamWorkload = [], projectBreakdown = [] } = analyticsData;
    const insights: ProductivityInsightItem[] = [];

    // Overdue tasks insight
    if (summary.overdueTasks > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Delivery Warning',
        message: `${summary.overdueTasks} task(s) are currently past their due date across active projects. Immediate re-estimation or reassignment recommended.`,
        metric: `${summary.overdueTasks} Overdue`,
      });
    } else {
      insights.push({
        type: 'positive',
        title: 'Zero Overdue Tasks',
        message: 'All scheduled deliverables are on track or completed ahead of deadline.',
        metric: '100% On-Time',
      });
    }

    // Workload distribution insight
    if (teamWorkload.length > 1) {
      const highest = teamWorkload[0];
      const lowest = teamWorkload[teamWorkload.length - 1];
      if (highest.total > lowest.total * 3 && highest.total >= 5) {
        insights.push({
          type: 'workload',
          title: 'Workload Concentration Detected',
          message: `${highest.name} has ${highest.total} active tasks while team average is ${Math.round(summary.totalTasks / teamWorkload.length)}. Consider load balancing assignments.`,
          metric: `${highest.total} Tasks on ${highest.name.split(' ')[0]}`,
        });
      }
    }

    // Completion velocity insight
    if (summary.completionRate >= 70) {
      insights.push({
        type: 'positive',
        title: 'High Sprint Completion Velocity',
        message: `Your team has completed ${summary.completionRate}% of planned tasks. Great momentum heading into release review.`,
        metric: `${summary.completionRate}% Done`,
      });
    } else if (summary.completionRate < 35 && summary.totalTasks > 10) {
      insights.push({
        type: 'tip',
        title: 'Backlog Grooming Suggested',
        message: `Only ${summary.completionRate}% of tasks are completed. Break large items into granular subtasks to improve flow through In Progress.`,
        metric: `${summary.completionRate}% Done`,
      });
    }

    // Best performing project
    if (projectBreakdown.length > 0) {
      const topProj = [...projectBreakdown].sort((a, b) => b.percentage - a.percentage)[0];
      if (topProj && topProj.total > 0) {
        insights.push({
          type: 'tip',
          title: `Project Highlight: ${topProj.name}`,
          message: `${topProj.name} (${topProj.key}) leads delivery with ${topProj.percentage}% completion across ${topProj.total} total tasks.`,
          metric: `${topProj.percentage}% Complete`,
        });
      }
    }

    return insights;
  }
}
