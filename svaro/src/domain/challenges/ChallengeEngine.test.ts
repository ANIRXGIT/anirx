import { describe, it, expect } from 'vitest';
import { ChallengeEngine } from './ChallengeEngine';
import type { Challenge } from '../../db/dexie';

describe('ChallengeEngine', () => {
  it('calculates progress deterministically from logs', () => {
    const challenge: Challenge = {
      id: 'c1',
      user_id: 'u1',
      name: '75 Hard',
      startDate: new Date('2026-08-01T00:00:00Z').getTime(),
      endDate: new Date('2026-08-05T00:00:00Z').getTime(),
      requirements: [
        { type: 'workouts', target: 2 }
      ],
      thresholdPercentage: 100,
      status: 'active',
      created_at: 0,
      updated_at: 0,
      privacy_level: 'PRIVATE',
      sync_state: 'SYNCED',
      deleted: false
    };

    // 1 workout completed
    const progress1 = ChallengeEngine.calculateProgress(
      challenge, 
      [], 
      [], 
      [], 
      [{ id: 'w1', user_id: 'u1', name: 'W1', startTime: new Date('2026-08-02T10:00:00Z').getTime(), completed: true } as any],
      new Date('2026-08-03T00:00:00Z')
    );

    expect(progress1.metRequirements).toBe(0);
    expect(progress1.status).toBe('active');

    // 2 workouts completed
    const progress2 = ChallengeEngine.calculateProgress(
      challenge, 
      [], 
      [], 
      [], 
      [
        { id: 'w1', user_id: 'u1', name: 'W1', startTime: new Date('2026-08-02T10:00:00Z').getTime(), completed: true } as any,
        { id: 'w2', user_id: 'u1', name: 'W2', startTime: new Date('2026-08-03T10:00:00Z').getTime(), completed: true } as any
      ],
      new Date('2026-08-03T00:00:00Z')
    );

    expect(progress2.metRequirements).toBe(1);
    expect(progress2.percentage).toBe(100);
    expect(progress2.status).toBe('completed');
  });
});
