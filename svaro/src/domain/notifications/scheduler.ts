import { LocalNotifications } from '@capacitor/local-notifications';
import { localRepo } from '../../db/repositories/LocalRepository';
import { Capacitor } from '@capacitor/core';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.getPlatform() === 'web') {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
}

export async function syncNotifications(userId: string = 'test') {
  const rules = await localRepo.getNotificationRules(userId);
  
  if (Capacitor.getPlatform() !== 'web') {
    // Clear all existing
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  }

  let idCounter = 1;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const [hour, min] = rule.time.split(':').map(Number);

    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `SVARO: ${rule.type} Reminder`,
            body: `Don't forget your ${rule.type} today!`,
            id: idCounter++,
            schedule: {
              on: { hour, minute: min } // Daily at that time
            }
          }
        ]
      });
    } else {
      // In web, we can't reliably background schedule without Service Workers.
      // We will just log that web scheduling is a stub.
      console.log(`[Web Notification Stub] Scheduled ${rule.type} for ${rule.time}`);
    }
  }
}
