export interface ProgressScoreMetrics {
  goalProgressPct?: number; // based on bodyweight or strength changes
  workoutConsistencyPct?: number; // e.g. completed / scheduled over last 30 days
  nutritionConsistencyPct?: number; // e.g. adherence to cal/protein
  taskConsistencyPct?: number;
  challengeProgressPct?: number;
  lifestyleConsistencyPct?: number;
}

export function calculateTransformationScore(metrics: ProgressScoreMetrics): { score: number, distribution: Record<string, number> } {
  const baseWeights = {
    goal: 35,
    workout: 20,
    nutrition: 20,
    task: 10,
    challenge: 10,
    lifestyle: 5
  };

  const available = {
    goal: metrics.goalProgressPct !== undefined,
    workout: metrics.workoutConsistencyPct !== undefined,
    nutrition: metrics.nutritionConsistencyPct !== undefined,
    task: metrics.taskConsistencyPct !== undefined,
    challenge: metrics.challengeProgressPct !== undefined,
    lifestyle: metrics.lifestyleConsistencyPct !== undefined
  };

  // Calculate missing weight total
  let missingWeight = 0;
  let availableWeightTotal = 0;
  
  (Object.keys(baseWeights) as (keyof typeof baseWeights)[]).forEach(key => {
    if (!available[key]) {
      missingWeight += baseWeights[key];
    } else {
      availableWeightTotal += baseWeights[key];
    }
  });

  // If literally no data, return 0
  if (availableWeightTotal === 0) {
    return { score: 0, distribution: {} };
  }

  // Redistribute missing weight proportionally
  const finalWeights = { ...baseWeights };
  (Object.keys(baseWeights) as (keyof typeof baseWeights)[]).forEach(key => {
    if (available[key]) {
      finalWeights[key] = baseWeights[key] + (missingWeight * (baseWeights[key] / availableWeightTotal));
    } else {
      finalWeights[key] = 0;
    }
  });

  // Calculate final score
  let score = 0;
  if (available.goal) score += (metrics.goalProgressPct! / 100) * finalWeights.goal;
  if (available.workout) score += (metrics.workoutConsistencyPct! / 100) * finalWeights.workout;
  if (available.nutrition) score += (metrics.nutritionConsistencyPct! / 100) * finalWeights.nutrition;
  if (available.task) score += (metrics.taskConsistencyPct! / 100) * finalWeights.task;
  if (available.challenge) score += (metrics.challengeProgressPct! / 100) * finalWeights.challenge;
  if (available.lifestyle) score += (metrics.lifestyleConsistencyPct! / 100) * finalWeights.lifestyle;

  return {
    score: Math.round(score),
    distribution: finalWeights
  };
}
