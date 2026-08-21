export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female' | 'other'): number {
  if (sex === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  // Default to male calculation for male and other
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.20,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.90
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = activityMultipliers[activityLevel] || 1.20;
  return bmr * multiplier;
}

export function generateNutritionTarget(tdee: number, goalType: string, weightKg: number) {
  let targetCalories = tdee;
  
  if (goalType === 'fat_loss') {
    targetCalories = tdee - 500; // standard 500 deficit
  } else if (goalType === 'muscle_gain') {
    targetCalories = tdee + 300; // mild surplus
  } else if (goalType === 'recomposition') {
    targetCalories = tdee - 200; // slight deficit
  }
  
  // Base protein: 2.2g per kg of bodyweight for active individuals
  const targetProtein = Math.round(weightKg * 2.2);
  
  // Fat: 25% of calories
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  
  // Carbs: Remainder
  const proteinCalories = targetProtein * 4;
  const fatCalories = targetFat * 9;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const targetCarbs = Math.round(remainingCalories / 4);

  return {
    calories: Math.round(targetCalories),
    protein: targetProtein,
    fat: targetFat,
    carbs: targetCarbs > 0 ? targetCarbs : 0
  };
}
