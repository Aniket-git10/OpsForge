import { Request, Response, NextFunction } from 'express';
import { Task, ITask } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activity.service.js';
import { createNotification } from '../services/notification.service.js';
import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskMoved,
  emitTaskDeleted,
} from '../services/socket.service.js';

export const getProjectTasks = async (
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

    const { status, priority, assignee, label, search } = req.query;

    const query: any = { project: projectId, organization: orgId };

    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (priority && typeof priority === 'string') {
      query.priority = priority;
    }
    if (assignee && typeof assignee === 'string') {
      query.assignee = assignee;
    }
    if (label && typeof label === 'string') {
      query.labels = label;
    }
    if (search && typeof search === 'string') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar role')
      .populate('creator', 'name email avatar')
      .sort({ status: 1, order: 1, createdAt: -1 });

    sendSuccess(res, tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: id, organization: orgId })
      .populate('project', 'name key')
      .populate('assignee', 'name email avatar role')
      .populate('creator', 'name email avatar');

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      projectId,
      title,
      description,
      status = 'todo',
      priority = 'medium',
      assignee,
      labels = [],
      estimatedHours,
      dueDate,
      subtasks = [],
    } = req.body;
    const orgId = req.user?.organization;

    const project = await Project.findOne({ _id: projectId, organization: orgId });
    if (!project) {
      sendError(res, 'Project not found', 404);
      return;
    }

    // Atomic increment for sequential project task key
    project.taskCounter += 1;
    await project.save();

    const taskKey = `${project.key}-${project.taskCounter}`;

    // Get max order in the designated status column
    const highestOrderTask = await Task.findOne({ project: projectId, status })
      .sort({ order: -1 })
      .select('order');
    const order = highestOrderTask ? highestOrderTask.order + 1 : 0;

    const task = await Task.create({
      key: taskKey,
      taskNumber: project.taskCounter,
      project: project._id,
      organization: orgId,
      title,
      description,
      status,
      priority,
      order,
      creator: req.user!.id,
      assignee: assignee || null,
      labels,
      estimatedHours,
      dueDate,
      subtasks,
    });

    // Log Activity
    await logActivity({
      organization: orgId!,
      project: project._id,
      task: task._id,
      user: req.user!.id,
      action: 'created',
      entityType: 'task',
      details: {
        summary: `${req.user!.name || 'User'} created task ${task.key}: ${task.title}`,
      },
    });

    // Notify assignee if assigned to someone else
    if (assignee && assignee.toString() !== req.user!.id) {
      await createNotification({
        recipient: assignee,
        sender: req.user!.id,
        organization: orgId!,
        project: project._id,
        task: task._id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user!.name || 'A team member'} assigned you to "${task.key}: ${task.title}"`,
        link: `/app/projects/${project._id}?taskId=${task._id}`,
      });
    }

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar role')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key');

    emitTaskCreated(project._id.toString(), populated);

    sendSuccess(res, populated, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: id, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const previousAssignee = task.assignee?.toString();
    const previousStatus = task.status;
    const updates = req.body;

    Object.assign(task, updates);
    await task.save();

    // Check if assignee changed
    if (updates.assignee && updates.assignee.toString() !== previousAssignee) {
      await logActivity({
        organization: orgId!,
        project: task.project,
        task: task._id,
        user: req.user!.id,
        action: 'assigned',
        entityType: 'task',
        details: {
          field: 'assignee',
          summary: `${req.user!.name || 'User'} assigned ${task.key} to team member`,
        },
      });

      if (updates.assignee !== req.user!.id) {
        await createNotification({
          recipient: updates.assignee,
          sender: req.user!.id,
          organization: orgId!,
          project: task.project,
          task: task._id,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `${req.user!.name || 'A team member'} assigned you to "${task.key}: ${task.title}"`,
          link: `/app/projects/${task.project}?taskId=${task._id}`,
        });
      }
    }

    // Check if status changed
    if (updates.status && updates.status !== previousStatus) {
      await logActivity({
        organization: orgId!,
        project: task.project,
        task: task._id,
        user: req.user!.id,
        action: 'status_changed',
        entityType: 'task',
        details: {
          field: 'status',
          from: previousStatus,
          to: updates.status,
          summary: `${req.user!.name || 'User'} moved ${task.key} to ${updates.status.replace('_', ' ').toUpperCase()}`,
        },
      });
    }

    const updated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar role')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key');

    emitTaskUpdated(task.project.toString(), updated);

    sendSuccess(res, updated, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, newOrder = 0 } = req.body;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: id, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const oldStatus = task.status;
    task.status = status;
    task.order = newOrder;
    await task.save();

    // Reorder other tasks in destination column if needed
    await Task.updateMany(
      {
        project: task.project,
        status,
        _id: { $ne: task._id },
        order: { $gte: newOrder },
      },
      { $inc: { order: 1 } }
    );

    if (oldStatus !== status) {
      await logActivity({
        organization: orgId!,
        project: task.project,
        task: task._id,
        user: req.user!.id,
        action: 'status_changed',
        entityType: 'task',
        details: {
          field: 'status',
          from: oldStatus,
          to: status,
          summary: `${req.user!.name || 'User'} moved ${task.key} from ${oldStatus.toUpperCase()} to ${status.toUpperCase()}`,
        },
      });
    }

    const updated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar role')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key');

    emitTaskMoved(task.project.toString(), {
      taskId: task._id.toString(),
      fromStatus: oldStatus,
      toStatus: status,
      newOrder,
      task: updated,
      updatedBy: req.user!.id,
    });

    sendSuccess(res, updated, 'Task status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const task = await Task.findOneAndDelete({ _id: id, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await logActivity({
      organization: orgId!,
      project: task.project,
      task: task._id,
      user: req.user!.id,
      action: 'deleted',
      entityType: 'task',
      details: {
        summary: `${req.user!.name || 'User'} deleted task ${task.key}: ${task.title}`,
      },
    });

    emitTaskDeleted(task.project.toString(), task._id.toString());

    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: id, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    task.subtasks.push({
      title,
      completed: false,
    } as any);

    await task.save();

    sendSuccess(res, task.subtasks, 'Subtask added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, subtaskId } = req.params;
    const { completed, title } = req.body;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: id, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const subtask = task.subtasks.find((s) => s._id.toString() === subtaskId);
    if (!subtask) {
      sendError(res, 'Subtask not found', 404);
      return;
    }

    if (completed !== undefined) {
      subtask.completed = completed;
      subtask.completedAt = completed ? new Date() : undefined;
    }
    if (title !== undefined) {
      subtask.title = title;
    }

    await task.save();

    sendSuccess(res, task.subtasks, 'Subtask updated');
  } catch (error) {
    next(error);
  }
};

export const deleteSubtask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, subtaskId } = req.params;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: id, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    task.subtasks = task.subtasks.filter((s) => s._id.toString() !== subtaskId);
    await task.save();

    sendSuccess(res, task.subtasks, 'Subtask deleted');
  } catch (error) {
    next(error);
  }
};
