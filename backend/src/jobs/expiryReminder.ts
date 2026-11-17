import cron from 'node-cron';
import { getExpiringDocuments } from '../services/expiryService';
import { sendExpiryReminder } from '../services/notificationService';
import Reminder from '../models/Reminder';

const REMINDER_CONFIG: { days: number; type: '30_day' | '7_day' | '1_day' }[] = [
  { days: 30, type: '30_day' },
  { days: 7, type: '7_day' },
  { days: 1, type: '1_day' },
];

export async function runExpiryCheck(): Promise<void> {
  console.log('[ExpiryReminder] Starting expiry check...');

  let totalSent = 0;
  let totalSkipped = 0;

  for (const { days, type } of REMINDER_CONFIG) {
    try {
      const documents = await getExpiringDocuments(days);
      console.log(`[ExpiryReminder] Found ${documents.length} document(s) expiring in ${days} day(s)`);

      for (const doc of documents) {
        try {
          const user = doc.userId as any;

          // Check if reminder already exists for this document and type
          const existingReminder = await Reminder.findOne({
            documentId: doc._id,
            reminderType: type,
          });

          if (existingReminder) {
            totalSkipped++;
            continue;
          }

          // Check if user has expiry reminders enabled and has a push token
          if (
            !user ||
            !user.pushToken ||
            !user.notificationPreferences?.expiryReminders
          ) {
            totalSkipped++;
            continue;
          }

          // Send push notification
          await sendExpiryReminder(user.pushToken, doc.title, days);

          // Create reminder record
          await Reminder.create({
            documentId: doc._id,
            userId: user._id,
            reminderType: type,
            message: `Your document "${doc.title}" will expire in ${days} day${days === 1 ? '' : 's'}. Please review and renew it.`,
            isRead: false,
            sentAt: new Date(),
          });

          totalSent++;
          console.log(`[ExpiryReminder] Sent ${type} reminder for document "${doc.title}" to user ${user._id}`);
        } catch (docError) {
          console.error(`[ExpiryReminder] Error processing document ${doc._id}:`, docError);
        }
      }
    } catch (error) {
      console.error(`[ExpiryReminder] Error fetching documents expiring in ${days} days:`, error);
    }
  }

  console.log(`[ExpiryReminder] Check complete. Sent: ${totalSent}, Skipped: ${totalSkipped}`);
}

export function startExpiryReminderJob(): void {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[ExpiryReminder] Cron job triggered at', new Date().toISOString());
    await runExpiryCheck();
  });

  console.log('[ExpiryReminder] Expiry reminder cron job scheduled (daily at 9:00 AM)');
}
