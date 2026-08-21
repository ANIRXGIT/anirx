import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateChallengeRequirements, evaluateChallenge } from './engine';
import { localRepo } from '../../db/repositories/LocalRepository';

vi.mock('../../db/repositories/LocalRepository', () => ({
  localRepo: {
    getAllChallenges: vi.fn(),
    saveChallenge: vi.fn(),
    getTodayFoodLogs: vi.fn(),
    getTasksForDate: vi.fn()
  }
}));

describe('Challenge Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('evaluates requirements deterministically from logs', async () => {
    vi.mocked(localRepo.getTodayFoodLogs).mockResolvedValue([
      { user_id: 'test', created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false, id: '1', foodId: 'f1', name: 'Chicken', timestamp: Date.now(), amount: 100, calories: 500, protein: 50, carbs: 0, fat: 0, fiber: 0 },
      { user_id: 'test', created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false, id: '2', foodId: 'f2', name: 'Beef', timestamp: Date.now(), amount: 100, calories: 500, protein: 60, carbs: 0, fat: 0, fiber: 0 }
    ]);
    vi.mocked(localRepo.getTasksForDate).mockResolvedValue([
      { id: 't1', completed: true },
      { id: 't2', completed: false }
    ]);

    const challenge = {
      requirements: [
        { type: 'protein', target: 100 },
        { type: 'tasks', target: 2 }
      ]
    };

    const results = await evaluateChallengeRequirements('test', challenge, '2026-08-19');
    
    // Protein: 50+60 = 110 >= 100 -> true
    expect(results.find(r => r.type === 'protein')?.completed).toBe(true);
    // Tasks: 1 completed, target 2 -> false
    expect(results.find(r => r.type === 'tasks')?.completed).toBe(false);
  });

  it('updates challenge status when end date passes', async () => {
    const pastChallenge = {
      id: 'c1',
      status: 'active',
      startDate: Date.now() - 1000000,
      endDate: Date.now() - 1000 // expired
    };

    vi.mocked(localRepo.getAllChallenges).mockResolvedValue([pastChallenge]);

    await evaluateChallenge('test-user', 'c1');
    expect(localRepo.saveChallenge).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
  });
});
