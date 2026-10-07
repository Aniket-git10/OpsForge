import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { unreadOnly, limit = 30 } = req.query;

    const query: any = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    sendSuccess(res, {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    sendSuccess(res, notification, 'Marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    sendSuccess(res, null, 'Notification removed');
  } catch (error) {
    next(error);
  }
};
