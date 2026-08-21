import { describe, it, expect } from 'vitest';
import { calculateBMR, calculateTDEE, generateNutritionTarget } from './calculator';

describe('Nutrition Calculator', () => {
  it('calculates BMR correctly for male', () => {
    // Mifflin-St Jeor: 10 * weight + 6.25 * height - 5 * age + 5
    // 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
    const bmr = calculateBMR(80, 180, 30, 'male');
    expect(bmr).toBe(1780);
  });

  it('calculates TDEE for moderate activity', () => {
    const tdee = calculateTDEE(1780, 'moderate'); // 1780 * 1.55 = 2759
    expect(tdee).toBe(2759);
  });

  it('generates strength target (maintenance)', () => {
    const target = generateNutritionTarget(2759, 'strength', 80);
    // target calories = 2759 (maintenance)
    expect(target.calories).toBe(2759);
    // protein = 2.2 * 80 = 176
    expect(target.protein).toBe(176);
  });
});
