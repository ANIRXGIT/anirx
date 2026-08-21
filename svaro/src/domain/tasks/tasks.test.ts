import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDailyTasks } from './generator';
import { localRepo } from '../../db/repositories/LocalRepository';

vi.mock('../../db/repositories/LocalRepository', () => ({
  localRepo: {
    getTasksForDate: vi.fn(),
    saveTask: vi.fn(),
    getTaskTemplates: vi.fn()
  }
}));

vi.mock('../../stores/useAppStore', () => ({
  useAppStore: {
    getState: vi.fn(() => ({
      profile: { transformationDurationDays: 90 },
      nutritionTarget: { protein: 180, calories: 2500 }
    }))
  }
}));

describe('Task Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates system tasks if not already generated', async () => {
    vi.mocked(localRepo.getTaskTemplates).mockResolvedValue([{ id: 't1', title: 'Read Book', category: 'Study', frequency: 'DAILY', active: true }]);
    vi.mocked(localRepo.getTasksForDate).mockResolvedValue([]);
    vi.mocked(localRepo.getTaskTemplates).mockResolvedValue([
      { id: 't1', title: 'Read Book', category: 'Study', frequency: 'DAILY', active: true }
    ]);

    const tasks = await generateDailyTasks('test-user', '2026-08-19');
    
    // 1 goal review, 2 nutrition, 1 custom template = 4 tasks
    expect(tasks).toHaveLength(1);
    expect(tasks.some(t => t.title === 'Read Book')).toBe(true);
    
    
    expect(localRepo.saveTask).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate generation on subsequent renders', async () => {
    vi.mocked(localRepo.getTaskTemplates).mockResolvedValue([{ id: 't1', title: 'Read Book', category: 'Study', frequency: 'DAILY', active: true }]);
    vi.mocked(localRepo.getTasksForDate).mockResolvedValue([
      { id: '123', templateId: 't1', timestamp: new Date('2026-08-19T10:00:00').getTime(), source: 'system', title: 'Read Book' }
    ]);

    const tasks = await generateDailyTasks('test-user', '2026-08-19');
    
    // Should return existing without generating new ones
    expect(tasks).toHaveLength(1);
    expect(localRepo.saveTask).not.toHaveBeenCalled();
  });
});
