import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from './streak';
import { calculateNoFapStreak } from './nofap';

describe('Streak Calculator', () => {
  it('calculates current streak correctly including today', () => {
    // string format YYYY-MM-DD
    const qualifying = ['2023-10-01', '2023-10-02', '2023-10-03'];
    expect(calculateCurrentStreak(qualifying, '2023-10-03', '2023-10-02')).toBe(3);
  });

  it('calculates current streak correctly missing today but including yesterday', () => {
    const qualifying = ['2023-10-01', '2023-10-02'];
    expect(calculateCurrentStreak(qualifying, '2023-10-03', '2023-10-02')).toBe(2);
  });

  it('breaks streak if missing yesterday and today', () => {
    const qualifying = ['2023-10-01'];
    expect(calculateCurrentStreak(qualifying, '2023-10-03', '2023-10-02')).toBe(0);
  });
});

describe('NoFap Calculator', () => {
  it('calculates days and hours since start', () => {
    const start = new Date('2023-10-01T12:00:00Z').getTime();
    const now = new Date('2023-10-03T14:30:00Z').getTime(); // 2 days, 2.5 hours
    const { days, hours } = calculateNoFapStreak(start, undefined, now);
    expect(days).toBe(2);
    expect(hours).toBe(2);
  });
  
  it('handles resets correctly', () => {
    const start = new Date('2023-10-01T12:00:00Z').getTime();
    const reset = new Date('2023-10-02T12:00:00Z').getTime();
    const now = new Date('2023-10-03T14:30:00Z').getTime();
    const { days, hours } = calculateNoFapStreak(start, reset, now);
    expect(days).toBe(1);
    expect(hours).toBe(2);
  });
});
