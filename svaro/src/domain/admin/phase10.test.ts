import { describe, it, expect } from 'vitest';
import { AdminEngine } from './AdminEngine';
import { vi } from 'vitest';

vi.mock('../../db/repositories/LocalRepository', () => ({
  localRepo: {
    getSystemConfig: vi.fn().mockResolvedValue(null),
    saveSystemConfig: vi.fn().mockResolvedValue(undefined)
  }
}));
import { SecureStorage } from './SecureStorage';

describe('Phase 10 Admin & Config', () => {

  it('SecureStorage mock correctly saves and retrieves without throwing', async () => {
    // This is essentially just testing localStorage mock in jsdom
    await SecureStorage.set('TEST_KEY', 'SECRET_VALUE');
    const val = await SecureStorage.get('TEST_KEY');
    expect(val).toBe('SECRET_VALUE');
    await SecureStorage.remove('TEST_KEY');
    const removed = await SecureStorage.get('TEST_KEY');
    expect(removed).toBeNull();
  });

  // AdminEngine requires Dexie initialized so we mock it safely or rely on vitest setup
  it('AdminEngine returns default if config is missing', async () => {
    const val = await AdminEngine.getConfigValue('gamification.task_xp', 42);
    expect(val).toBe(42);
  });

});
