import { describe, it, expect } from 'vitest';
import { calculateTransformationScore } from './score';

describe('Progress Score Calculator', () => {
  it('calculates full score correctly', () => {
    const res = calculateTransformationScore({
      goalProgressPct: 100,
      workoutConsistencyPct: 100,
      nutritionConsistencyPct: 100,
      taskConsistencyPct: 100,
      challengeProgressPct: 100,
      lifestyleConsistencyPct: 100
    });
    expect(res.score).toBe(100);
  });

  it('calculates partial score correctly', () => {
    const res = calculateTransformationScore({
      goalProgressPct: 50, // 35 * 0.5 = 17.5
      workoutConsistencyPct: 50, // 20 * 0.5 = 10
      nutritionConsistencyPct: 50, // 20 * 0.5 = 10
      taskConsistencyPct: 50, // 10 * 0.5 = 5
      challengeProgressPct: 50, // 10 * 0.5 = 5
      lifestyleConsistencyPct: 50 // 5 * 0.5 = 2.5
    });
    // total = 50
    expect(res.score).toBe(50);
  });

  it('redistributes missing weight proportionally', () => {
    // Only workout (20) and nutrition (20) available.
    // Total available base weight = 40. Missing = 60.
    // They both represent 50% of the available pool.
    // So both should end up with a final weight of 20 + (60 * 0.5) = 50.
    const res = calculateTransformationScore({
      workoutConsistencyPct: 100,
      nutritionConsistencyPct: 50
    });
    
    // score = (100% of 50) + (50% of 50) = 50 + 25 = 75
    expect(res.score).toBe(75);
    expect(res.distribution.workout).toBe(50);
    expect(res.distribution.nutrition).toBe(50);
    expect(res.distribution.goal).toBe(0);
  });
});
