import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activity.service.js';
import { createNotification } from '../services/notification.service.js';
import { emitCommentCreated } from '../services/socket.service.js';

export const getTaskComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: taskId, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 });

    sendSuccess(res, comments);
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { taskId, content } = req.body;
    const orgId = req.user?.organization;

    const task = await Task.findOne({ _id: taskId, organization: orgId });
    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const comment = await Comment.create({
      task: task._id,
      project: task.project,
      organization: orgId,
      author: req.user!.id,
      content,
    });

    await logActivity({
      organization: orgId!,
      project: task.project,
      task: task._id,
      user: req.user!.id,
      action: 'commented',
      entityType: 'comment',
      details: {
        summary: `${req.user!.name || 'User'} commented on ${task.key}`,
      },
    });

    // Notify task assignee if someone else comments
    if (task.assignee && task.assignee.toString() !== req.user!.id) {
      await createNotification({
        recipient: task.assignee,
        sender: req.user!.id,
        organization: orgId!,
        project: task.project,
        task: task._id,
        type: 'comment_added',
        title: 'New Comment',
        message: `${req.user!.name || 'A team member'} commented on "${task.key}: ${task.title}"`,
        link: `/app/projects/${task.project}?taskId=${task._id}`,
      });
    }

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar role'
    );

    emitCommentCreated(task.project.toString(), populated);

    sendSuccess(res, populated, 'Comment posted', 201);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const orgId = req.user?.organization;

    const comment = await Comment.findOne({ _id: id, organization: orgId });
    if (!comment) {
      sendError(res, 'Comment not found', 404);
      return;
    }

    if (comment.author.toString() !== req.user!.id) {
      sendError(res, 'You are not authorized to edit this comment', 403);
      return;
    }

    comment.content = content;
    comment.edited = true;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name email avatar role'
    );

    sendSuccess(res, populated, 'Comment updated');
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization;

    const comment = await Comment.findOne({ _id: id, organization: orgId });
    if (!comment) {
      sendError(res, 'Comment not found', 404);
      return;
    }

    // Only author or admin can delete
    if (comment.author.toString() !== req.user!.id && req.user!.role !== 'admin') {
      sendError(res, 'You are not authorized to delete this comment', 403);
      return;
    }

    await comment.deleteOne();

    sendSuccess(res, null, 'Comment deleted');
  } catch (error) {
    next(error);
  }
};
