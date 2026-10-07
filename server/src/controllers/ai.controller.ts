import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai/ai.service.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const generateTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { goal, context } = req.body;
    const result = await aiService.generateTasks(goal, context);
    sendSuccess(res, result, 'Tasks generated successfully');
  } catch (error) {
    next(error);
  }
};

export const generateSubtasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { taskTitle, taskDescription } = req.body;
    const result = await aiService.generateSubtasks(taskTitle, taskDescription);
    sendSuccess(res, result, 'Subtasks generated successfully');
  } catch (error) {
    next(error);
  }
};

export const prioritizeTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.body;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: projectId, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const tasks = await Task.find({ project: projectId }).select(
      'key title status priority dueDate assignee estimatedHours'
    );

    const result = await aiService.prioritizeTasks(project, tasks);
    sendSuccess(res, result, 'Priority recommendations generated');
  } catch (error) {
    next(error);
  }
};

export const summarizeProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.body;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: projectId, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const tasks = await Task.find({ project: projectId });
    const result = await aiService.summarizeProject(project, tasks);
    sendSuccess(res, result, 'Project executive summary generated');
  } catch (error) {
    next(error);
  }
};

export const generateProductivityInsights = async (
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

    const [totalTasks, completedTasks, overdueTasks, projects] = await Promise.all([
      Task.countDocuments({ organization: orgId }),
      Task.countDocuments({ organization: orgId, status: 'done' }),
      Task.countDocuments({
        organization: orgId,
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() },
      }),
      Project.find({ organization: orgId, isArchived: false }).select('name key'),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const analyticsData = {
      summary: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate,
      },
      projectBreakdown: projects.map((p) => ({
        name: p.name,
        key: p.key,
        total: totalTasks,
        percentage: completionRate,
      })),
      teamWorkload: [],
    };

    const result = await aiService.generateInsights(analyticsData);
    sendSuccess(res, result, 'Productivity insights generated');
  } catch (error) {
    next(error);
  }
};
