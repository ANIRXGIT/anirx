export interface DailyTargets {
  calories: number;
  protein: number;
  waterMl: number;
  steps: number;
}

export interface DailyActuals {
  calories: number;
  protein: number;
  waterMl: number;
  steps: number;
  workoutCompleted: boolean;
  habitScores: number[]; // 0 to 1 for each active habit
}

export function calculateCompletionPercentage(actuals: DailyActuals, targets: DailyTargets, hasWorkoutScheduled: boolean): number {
  let totalScore = 0;
  let maxScore = 0;

  // Nutrition (2 points: Calories and Protein)
  if (targets.calories > 0) {
    maxScore += 1;
    // Score based on being close to calories (e.g., within 10%)
    const diff = Math.abs(actuals.calories - targets.calories) / targets.calories;
    if (diff <= 0.1) totalScore += 1;
    else if (diff <= 0.2) totalScore += 0.5;
  }
  
  if (targets.protein > 0) {
    maxScore += 1;
    if (actuals.protein >= targets.protein * 0.9) totalScore += 1; // 90% adherence
  }

  // Water (1 point)
  if (targets.waterMl > 0) {
    maxScore += 1;
    totalScore += Math.min(1, actuals.waterMl / targets.waterMl);
  }

  // Steps (1 point)
  if (targets.steps > 0) {
    maxScore += 1;
    totalScore += Math.min(1, actuals.steps / targets.steps);
  }

  // Workout (2 points if scheduled)
  if (hasWorkoutScheduled) {
    maxScore += 2;
    if (actuals.workoutCompleted) totalScore += 2;
  }

  // Habits (1 point each)
  for (const score of actuals.habitScores) {
    maxScore += 1;
    totalScore += Math.min(1, score);
  }

  if (maxScore === 0) return 0;
  return Math.round((totalScore / maxScore) * 100);
}

export function isDayQualifying(percentage: number, threshold: number): boolean {
  return percentage >= threshold;
}
