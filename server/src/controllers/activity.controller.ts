import { Request, Response, NextFunction } from 'express';
import { Activity } from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProjectActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const orgId = req.user?.organization;

    const activities = await Activity.find({
      project: projectId,
      organization: orgId,
    })
      .populate('user', 'name email avatar role')
      .populate('task', 'title key')
      .sort({ createdAt: -1 })
      .limit(50);

    sendSuccess(res, activities);
  } catch (error) {
    next(error);
  }
};

export const getOrganizationActivity = async (
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

    const activities = await Activity.find({ organization: orgId })
      .populate('user', 'name email avatar role')
      .populate('project', 'name key')
      .populate('task', 'title key')
      .sort({ createdAt: -1 })
      .limit(50);

    sendSuccess(res, activities);
  } catch (error) {
    next(error);
  }
};
