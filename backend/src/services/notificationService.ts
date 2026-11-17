import axios from 'axios';

/**
 * Send a push notification via Expo Push Notification service
 */
export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    if (!pushToken || !pushToken.startsWith('ExponentPushToken')) {
      console.warn('Invalid push token:', pushToken);
      return;
    }

    await axios.post(
      'https://exp.host/--/api/v2/push/send',
      {
        to: pushToken,
        title,
        body,
        data: data || {},
        sound: 'default',
        priority: 'high',
      },
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Push notification sent to ${pushToken}`);
  } catch (error) {
    console.error('Failed to send push notification:', error);
    // Don't throw - notification failure shouldn't break the flow
  }
};

/**
 * Send an expiry reminder push notification with contextual messaging
 * based on how many days until the document expires.
 */
export const sendExpiryReminder = async (
  pushToken: string,
  documentTitle: string,
  daysUntilExpiry: number
): Promise<void> => {
  let title: string;
  let body: string;

  if (daysUntilExpiry <= 1) {
    title = '⚠️ Document Expires Tomorrow!';
    body = `Your document "${documentTitle}" expires tomorrow. Please renew it soon.`;
  } else if (daysUntilExpiry <= 7) {
    title = '📋 Document Expiring Soon';
    body = `Your document "${documentTitle}" expires in ${daysUntilExpiry} days.`;
  } else {
    title = '📄 Upcoming Document Expiry';
    body = `Your document "${documentTitle}" will expire in ${daysUntilExpiry} days.`;
  }

  await sendPushNotification(pushToken, title, body, { type: 'expiry_reminder' });
};
