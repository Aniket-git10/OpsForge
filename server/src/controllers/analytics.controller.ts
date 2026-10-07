import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getDashboardAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.organization;
    if (!orgId) {
      sendError(res, 'Organization context required', 400);
      return;
    }

    const orgObjectId = new Types.ObjectId(orgId);
    const { timeRange = '30d' } = req.query;

    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const now = new Date();

    // High level metrics
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      statusBreakdown,
      priorityBreakdown,
      assigneeWorkload,
      projectBreakdown,
      recentCompletedTasks,
    ] = await Promise.all([
      Project.countDocuments({ organization: orgObjectId, isArchived: false }),
      Project.countDocuments({
        organization: orgObjectId,
        isArchived: false,
        status: { $in: ['active', 'planning'] },
      }),
      Task.countDocuments({ organization: orgObjectId }),
      Task.countDocuments({ organization: orgObjectId, status: 'done' }),
      Task.countDocuments({
        organization: orgObjectId,
        status: { $ne: 'done' },
        dueDate: { $lt: now },
      }),

      // Breakdown by status
      Task.aggregate([
        { $match: { organization: orgObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Breakdown by priority
      Task.aggregate([
        { $match: { organization: orgObjectId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Team Workload
      Task.aggregate([
        { $match: { organization: orgObjectId, assignee: { $ne: null } } },
        {
          $group: {
            _id: '$assignee',
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            avatar: '$user.avatar',
            role: '$user.role',
            total: 1,
            completed: 1,
            inProgress: 1,
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Project Progress Breakdown
      Task.aggregate([
        { $match: { organization: orgObjectId } },
        {
          $group: {
            _id: '$project',
            total: { $sum: 1 },
            done: {
              $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $project: {
            projectId: '$_id',
            name: '$project.name',
            key: '$project.key',
            total: 1,
            done: 1,
            percentage: {
              $cond: [
                { $gt: ['$total', 0] },
                { $round: [{ $multiply: [{ $divide: ['$done', '$total'] }, 100] }, 0] },
                0,
              ],
            },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Daily completion trend for timeRange
      Task.aggregate([
        {
          $match: {
            organization: orgObjectId,
            status: 'done',
            updatedAt: { $gte: sinceDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    sendSuccess(res, {
      summary: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate,
        timeRange,
      },
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s._id,
        count: s.count,
      })),
      priorityBreakdown: priorityBreakdown.map((p) => ({
        priority: p._id,
        count: p.count,
      })),
      teamWorkload: assigneeWorkload,
      projectBreakdown,
      completionTrend: recentCompletedTasks.map((t) => ({
        date: t._id,
        completed: t.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: projectId, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const projectObjectId = new Types.ObjectId(projectId as string);

    const [statusDist, priorityDist, tasks] = await Promise.all([
      Task.aggregate([
        { $match: { project: projectObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: projectObjectId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.find({ project: projectObjectId }).select('status dueDate estimatedHours subtasks'),
    ]);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'done').length;
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    let totalSubtasks = 0;
    let completedSubtasks = 0;
    let totalEstimatedHours = 0;

    tasks.forEach((t) => {
      if (t.estimatedHours) totalEstimatedHours += t.estimatedHours;
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter((st: any) => st.completed).length;
      }
    });

    sendSuccess(res, {
      project: {
        id: project._id,
        name: project.name,
        key: project.key,
        status: project.status,
        deadline: project.deadline,
      },
      metrics: {
        totalTasks,
        doneTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        totalSubtasks,
        completedSubtasks,
        subtaskCompletionRate:
          totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0,
        totalEstimatedHours,
      },
      statusDistribution: statusDist.map((s) => ({ status: s._id, count: s.count })),
      priorityDistribution: priorityDist.map((p) => ({ priority: p._id, count: p.count })),
    });
  } catch (error) {
    next(error);
  }
};
