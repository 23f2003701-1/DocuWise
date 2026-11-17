import DocumentModel from '../models/Document';

/**
 * Calculate expiry status based on the expiry date.
 * - 'Expired' if the date is in the past
 * - 'Expiring Soon' if within the next 30 days
 * - 'Valid' if more than 30 days away
 * - 'No Expiry' if no date provided
 */
export const calculateExpiryStatus = (
  expiryDate?: Date | string | null
): 'Valid' | 'Expiring Soon' | 'Expired' | 'No Expiry' => {
  if (!expiryDate) {
    return 'No Expiry';
  }

  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  if (expiry < now) {
    return 'Expired';
  }

  if (expiry <= thirtyDaysFromNow) {
    return 'Expiring Soon';
  }

  return 'Valid';
};

/**
 * Update a document's expiry status based on its expiry date.
 */
export const updateDocumentExpiryStatus = async (documentId: string): Promise<void> => {
  const doc = await DocumentModel.findById(documentId);
  if (!doc) return;
  doc.expiryStatus = calculateExpiryStatus(doc.expiryDate);
  await doc.save();
};

/**
 * Find documents expiring in exactly N days from now.
 * Returns documents with their associated user populated.
 */
export const getExpiringDocuments = async (daysUntilExpiry: number) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysUntilExpiry);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return DocumentModel.find({
    expiryDate: { $gte: startOfDay, $lte: endOfDay },
    expiryStatus: { $ne: 'No Expiry' },
  }).populate('userId', 'name email pushToken notificationPreferences');
};
