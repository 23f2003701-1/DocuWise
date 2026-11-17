import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHelper';
import DocumentModel from '../models/Document';

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!._id;

    const [totalDocuments, categoryCounts, statusCounts, recentDocuments, upcomingExpiries] =
      await Promise.all([
        DocumentModel.countDocuments({ userId }),

        DocumentModel.aggregate([
          { $match: { userId } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $project: { _id: 0, category: '$_id', count: '$count' } },
        ]),

        DocumentModel.aggregate([
          { $match: { userId } },
          { $group: { _id: '$expiryStatus', count: { $sum: 1 } } },
          { $project: { _id: 0, status: '$_id', count: '$count' } },
        ]),

        DocumentModel.find({ userId }).sort({ createdAt: -1 }).limit(5),

        DocumentModel.find({
          userId,
          expiryDate: { $gte: new Date() },
          expiryStatus: { $in: ['Valid', 'Expiring Soon'] },
        })
          .sort({ expiryDate: 1 })
          .limit(10),
      ]);

    sendSuccess(res, 200, 'Dashboard stats retrieved successfully', {
      totalDocuments,
      categoryCounts,
      statusCounts,
      recentDocuments,
      upcomingExpiries,
    });
  } catch (error) {
    sendError(res, 500, 'Failed to retrieve dashboard stats', error);
  }
}
