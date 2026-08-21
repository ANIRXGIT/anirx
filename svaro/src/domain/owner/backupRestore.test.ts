import { describe, it, expect, vi } from 'vitest';
import { exportLocalDataToJSON } from './backupRestore';

// Mock Dexie
vi.mock('../../db/dexie', () => ({
  db: {
    tables: [
      { name: 'profiles', toArray: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]) },
      { name: 'goals', toArray: vi.fn().mockResolvedValue([]) }
    ]
  }
}));

describe('Backup and Restore Logic', () => {
  it('exports local database to JSON payload', async () => {
    const json = await exportLocalDataToJSON();
    const parsed = JSON.parse(json);
    
    expect(parsed).toHaveProperty('profiles');
    expect(parsed.profiles).toHaveLength(1);
    expect(parsed.profiles[0].name).toBe('Test');
    expect(parsed).toHaveProperty('goals');
  });
});
