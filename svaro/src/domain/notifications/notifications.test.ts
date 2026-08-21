import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncNotifications } from './scheduler';
import { localRepo } from '../../db/repositories/LocalRepository';
import { LocalNotifications } from '@capacitor/local-notifications';

vi.mock('../../db/repositories/LocalRepository', () => ({
  localRepo: {
    getNotificationRules: vi.fn()
  }
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'android')
  }
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    getPending: vi.fn(() => Promise.resolve({ notifications: [{ id: 99 }] })),
    cancel: vi.fn(),
    schedule: vi.fn()
  }
}));

describe('Notification Scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels existing notifications and schedules enabled rules', async () => {
    vi.mocked(localRepo.getNotificationRules).mockResolvedValue([
      { id: '1', enabled: true, type: 'workout', time: '08:00', days: [1] },
      { id: '2', enabled: false, type: 'water', time: '10:00', days: [1] }
    ]);

    await syncNotifications();

    // Verify cancellation of old
    expect(LocalNotifications.cancel).toHaveBeenCalled();
    
    // Verify only enabled rule is scheduled
    expect(LocalNotifications.schedule).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(LocalNotifications.schedule).mock.calls[0][0];
    expect(callArgs.notifications[0].title).toContain('workout');
    expect(callArgs.notifications[0].schedule?.on?.hour).toBe(8);
  });
});
