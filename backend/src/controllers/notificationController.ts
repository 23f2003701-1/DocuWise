import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHelper';
import Reminder from '../models/Reminder';
import User from '../models/User';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Reminder.find({ userId: req.user!._id })
        .populate('documentId', 'title category expiryDate expiryStatus')
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit),
      Reminder.countDocuments({ userId: req.user!._id }),
    ]);

    sendSuccess(res, 200, 'Notifications retrieved successfully', {
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve notifications', error);
  }
}

export async function updatePreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { expiryReminders, reminderDays } = req.body;

    const user = await User.findById(req.user!._id);

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    if (expiryReminders !== undefined) {
      user.notificationPreferences.expiryReminders = expiryReminders;
    }

    if (reminderDays !== undefined) {
      user.notificationPreferences.reminderDays = reminderDays;
    }

    await user.save();

    sendSuccess(res, 200, 'Notification preferences updated successfully', user.notificationPreferences);
  } catch (error) {
    sendError(res, 500, 'Failed to update notification preferences', error);
  }
}
