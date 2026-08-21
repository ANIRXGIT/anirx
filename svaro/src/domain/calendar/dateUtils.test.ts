import { describe, it, expect } from 'vitest';
import { getMonthDays, isSameDay } from './dateUtils';

describe('Date Utils', () => {
  it('generates correct days for a leap year February', () => {
    const days = getMonthDays(2024, 1); // 1 = Feb
    expect(days.length).toBe(29);
    expect(days[0].getDate()).toBe(1);
    expect(days[28].getDate()).toBe(29);
  });

  it('generates correct days for non-leap year February', () => {
    const days = getMonthDays(2023, 1);
    expect(days.length).toBe(28);
  });

  it('correctly compares same days across time components', () => {
    const d1 = new Date(2023, 5, 15, 10, 30);
    const d2 = new Date(2023, 5, 15, 23, 45);
    const d3 = new Date(2023, 5, 16, 0, 1);
    expect(isSameDay(d1, d2)).toBe(true);
    expect(isSameDay(d1, d3)).toBe(false);
  });
});
