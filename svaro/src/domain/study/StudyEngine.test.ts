import { describe, it, expect } from 'vitest';
import { StudyEngine } from './StudyEngine';
import type { StudySession, Goal } from '../../db/dexie';

describe('StudyEngine', () => {
  it('calculates study time correctly', () => {
    const sessions: StudySession[] = [
      { id: '1', user_id: 'u', subjectId: 's1', startTime: new Date().getTime(), durationMinutes: 60 } as any,
      { id: '2', user_id: 'u', subjectId: 's1', startTime: new Date().getTime(), durationMinutes: 30 } as any,
      { id: '3', user_id: 'u', subjectId: 's2', startTime: new Date().getTime() - 86400000 * 2, durationMinutes: 45 } as any,
    ];
    
    const stats = StudyEngine.calculateStats(sessions, new Date());
    expect(stats.dailyMinutes).toBe(90); // 60 + 30
    expect(stats.weeklyMinutes).toBeGreaterThanOrEqual(90); 
    expect(stats.subjectMinutes['s1']).toBe(90);
    expect(stats.subjectMinutes['s2']).toBe(45);
  });

  it('calculates study goal progress correctly', () => {
    const goal: Goal = {
      id: 'g1', user_id: 'u', type: 'study', priority: 1, targetValue: 10, unit: 'hours', created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false
    };

    const sessions: StudySession[] = [
      { id: '1', user_id: 'u', startTime: new Date().getTime(), durationMinutes: 300 } as any, // 5 hours
    ];

    const progress = StudyEngine.calculateGoalProgress(goal, sessions);
    expect(progress).toBe(50); // 5 hours of 10 hours = 50%
  });
});
