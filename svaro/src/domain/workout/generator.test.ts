import { describe, it, expect } from 'vitest';
import { generateWorkoutPlan } from './generator';
import { SEED_EXERCISES } from '../../db/seed';

describe('Workout Generator', () => {
  it('generates a full body plan for 3 days', () => {
    const templates = generateWorkoutPlan('test-user', 3, 'beginner', 'strength', SEED_EXERCISES);
    expect(templates.length).toBe(2);
    expect(templates[0].splitType).toBe('full_body');
    // Ensure progressive overload constraints
    expect(templates[0].exercises.length).toBeGreaterThan(2);
  });

  it('generates an upper/lower plan for 4 days', () => {
    const templates = generateWorkoutPlan('test-user', 4, 'intermediate', 'hypertrophy', SEED_EXERCISES);
    expect(templates.length).toBe(4);
    expect(templates[0].splitType).toBe('upper');
    expect(templates[1].splitType).toBe('lower');
  });
});
