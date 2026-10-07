import { Notification, NotificationType } from '../models/Notification.js';
import { Types } from 'mongoose';
import { emitNotification } from './socket.service.js';

interface CreateNotificationParams {
  recipient: string | Types.ObjectId;
  sender?: string | Types.ObjectId;
  organization: string | Types.ObjectId;
  project?: string | Types.ObjectId;
  task?: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    // Avoid notifying self
    if (params.sender && params.recipient.toString() === params.sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient: params.recipient,
      sender: params.sender,
      organization: params.organization,
      project: params.project,
      task: params.task,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    });

    emitNotification(params.recipient.toString(), notification);

    return notification;
  } catch (error) {
    console.error('[Notification] Failed to create notification:', error);
    return null;
  }
};
