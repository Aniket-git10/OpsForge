import { Request, Response, NextFunction } from 'express';
import { Project, IProject } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activity.service.js';

export const getProjects = async (
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

    const { status, priority, search, includeArchived } = req.query;

    const query: any = { organization: orgId };

    if (!includeArchived || includeArchived === 'false') {
      query.isArchived = false;
    }

    if (status && typeof status === 'string') {
      query.status = status;
    }

    if (priority && typeof priority === 'string') {
      query.priority = priority;
    }

    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    // Aggregate task statistics per project
    const projectIds = projects.map((p) => p._id);
    const taskStats = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          doneTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = new Map(
      taskStats.map((s) => [
        s._id.toString(),
        {
          totalTasks: s.totalTasks,
          doneTasks: s.doneTasks,
          progress: s.totalTasks > 0 ? Math.round((s.doneTasks / s.totalTasks) * 100) : 0,
        },
      ])
    );

    const enrichedProjects = projects.map((p) => {
      const stats = statsMap.get(p._id.toString()) || {
        totalTasks: 0,
        doneTasks: 0,
        progress: 0,
      };
      return {
        ...p.toObject(),
        stats,
      };
    });

    sendSuccess(res, enrichedProjects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: id, organization: orgId })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const [totalTasks, doneTasks, inProgressTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: 'done' }),
      Task.countDocuments({ project: project._id, status: 'in_progress' }),
      Task.countDocuments({
        project: project._id,
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    sendSuccess(res, {
      ...project.toObject(),
      stats: {
        totalTasks,
        doneTasks,
        inProgressTasks,
        overdueTasks,
        progress,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.user?.organization;
    const { name, key, description, priority, status, startDate, deadline, members } = req.body;

    const normalizedKey = key.toUpperCase().trim();

    // Check key collision in organization
    const existingKey = await Project.findOne({
      organization: orgId,
      key: normalizedKey,
    });
    if (existingKey) {
      sendError(res, `A project with key "${normalizedKey}" already exists in this workspace`, 409);
      return;
    }

    const projectMembers = members || [];
    // Ensure creator is included as manager
    if (!projectMembers.some((m: any) => m.user === req.user!.id)) {
      projectMembers.push({ user: req.user!.id, role: 'manager' });
    }

    const project = await Project.create({
      name,
      key: normalizedKey,
      description,
      organization: orgId,
      owner: req.user!.id,
      priority: priority || 'medium',
      status: status || 'active',
      startDate,
      deadline,
      members: projectMembers,
    });

    await logActivity({
      organization: orgId!,
      project: project._id,
      user: req.user!.id,
      action: 'created',
      entityType: 'project',
      details: {
        summary: `${req.user!.name || 'User'} created project ${project.name} (${project.key})`,
      },
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    sendSuccess(res, populated, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: id, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const updates = req.body;
    Object.assign(project, updates);
    await project.save();

    await logActivity({
      organization: orgId!,
      project: project._id,
      user: req.user!.id,
      action: 'updated',
      entityType: 'project',
      details: {
        summary: `${req.user!.name || 'User'} updated project ${project.name}`,
      },
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    sendSuccess(res, updated, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: id, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    // Soft-delete / archive
    project.isArchived = true;
    project.status = 'archived';
    await project.save();

    await logActivity({
      organization: orgId!,
      project: project._id,
      user: req.user!.id,
      action: 'archived',
      entityType: 'project',
      details: {
        summary: `${req.user!.name || 'User'} archived project ${project.name}`,
      },
    });

    sendSuccess(res, null, 'Project archived successfully');
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: id, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    const exists = project.members.some((m) => m.user.toString() === userId);
    if (exists) {
      sendError(res, 'User is already a member of this project', 409);
      return;
    }

    project.members.push({ user: userId as any, role: role || 'contributor' });
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    sendSuccess(res, updated, 'Member added to project');
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: id, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    project.members = project.members.filter((m) => m.user.toString() !== userId);
    await project.save();

    sendSuccess(res, null, 'Member removed from project');
  } catch (error) {
    next(error);
  }
};
