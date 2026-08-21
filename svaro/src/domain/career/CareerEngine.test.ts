import { describe, it, expect } from 'vitest';
import { CareerEngine } from './CareerEngine';

describe('CareerEngine', () => {
  it('validates forward status transitions', () => {
    expect(CareerEngine.isValidTransition('TARGET', 'APPLIED')).toBe(true);
    expect(CareerEngine.isValidTransition('APPLIED', 'INTERVIEW')).toBe(true);
    expect(CareerEngine.isValidTransition('INTERVIEW', 'OFFER')).toBe(true);
  });

  it('rejects normal backward transitions', () => {
    expect(CareerEngine.isValidTransition('INTERVIEW', 'TARGET')).toBe(false);
    expect(CareerEngine.isValidTransition('OFFER', 'APPLIED')).toBe(false);
  });

  it('always allows rejection or withdrawal', () => {
    expect(CareerEngine.isValidTransition('INTERVIEW', 'REJECTED')).toBe(true);
    expect(CareerEngine.isValidTransition('APPLIED', 'WITHDRAWN')).toBe(true);
  });
});
