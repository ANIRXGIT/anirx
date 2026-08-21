import { describe, it, expect } from 'vitest';
import { calculateCompletionPercentage, isDayQualifying } from './completion';

describe('Completion Calculator', () => {
  const targets = {
    calories: 2000,
    protein: 150,
    waterMl: 3000,
    steps: 10000
  };

  it('calculates 100% for perfect adherence', () => {
    const actuals = {
      calories: 2000,
      protein: 160,
      waterMl: 3000,
      steps: 10000,
      workoutCompleted: true,
      habitScores: [1, 1]
    };
    const pct = calculateCompletionPercentage(actuals, targets, true);
    expect(pct).toBe(100);
  });

  it('calculates partial scores', () => {
    const actuals = {
      calories: 1500, // off by > 20%, 0 points
      protein: 75, // off, 0 points
      waterMl: 1500, // 0.5 points
      steps: 5000, // 0.5 points
      workoutCompleted: false, // 0 points
      habitScores: []
    };
    const pct = calculateCompletionPercentage(actuals, targets, true);
    // max score: 1(cal) + 1(pro) + 1(wat) + 1(step) + 2(work) = 6
    // actual: 0 + 0 + 0.5 + 0.5 + 0 = 1
    // 1 / 6 = 16.66%
    expect(pct).toBe(17);
  });

  it('verifies qualifying threshold', () => {
    expect(isDayQualifying(85, 80)).toBe(true);
    expect(isDayQualifying(75, 80)).toBe(false);
  });
});
