import { describe, it, expect, vi } from 'vitest';
import { generateWeeklySummary, generateMonthlySummary } from './summaries';

vi.mock('../../db/repositories/LocalRepository', () => ({
  localRepo: {
    getWeightLogs: vi.fn().mockResolvedValue([]),
    getMeasurementLogs: vi.fn().mockResolvedValue([]),
    getActiveNutritionTarget: vi.fn().mockResolvedValue({ calories: 2000, protein: 150, carbs: 200, fat: 50 }),
    getLogsForDate: vi.fn().mockResolvedValue({ foods: [], workouts: [], waters: [], steps: [], baths: [], habitLogs: [] })
  }
}));

describe('Progress Summaries', () => {
  it('generates a weekly summary correctly', async () => {
    const summary = await generateWeeklySummary('test-user', Date.now());
    expect(summary.weekStartDate).toBeDefined();
    expect(summary.progressScore).toBeGreaterThanOrEqual(0);
    expect(summary.avgCalories).toBeDefined();
  });

  it('generates a monthly summary correctly', async () => {
    const summary = await generateMonthlySummary('test-user', new Date('2023-10-01'));
    expect(summary.monthStartDate).toBeDefined();
    expect(summary.weightChange).toBeDefined();
    expect(summary.whatImproved).toBeDefined();
  });
});
