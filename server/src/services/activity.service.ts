import { Activity, ActivityAction, ActivityEntityType } from '../models/Activity.js';
import { Types } from 'mongoose';

interface LogActivityParams {
  organization: string | Types.ObjectId;
  project?: string | Types.ObjectId;
  task?: string | Types.ObjectId;
  user: string | Types.ObjectId;
  action: ActivityAction;
  entityType: ActivityEntityType;
  details: {
    field?: string;
    from?: any;
    to?: any;
    summary: string;
  };
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    const activity = await Activity.create({
      organization: params.organization,
      project: params.project,
      task: params.task,
      user: params.user,
      action: params.action,
      entityType: params.entityType,
      details: params.details,
    });
    return activity;
  } catch (error) {
    console.error('[Activity] Failed to log activity:', error);
    return null;
  }
};
