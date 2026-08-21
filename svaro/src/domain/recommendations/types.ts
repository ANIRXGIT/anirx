export type RecommendationType = 'workout' | 'nutrition' | 'lifestyle' | 'data';
export type RecommendationStatus = 'pending' | 'accepted' | 'modified' | 'dismissed' | 'completed';

export interface RecommendationDraft {
  ruleId: string;
  type: RecommendationType;
  title: string;
  what: string;
  why: string;
  action: string;
  priorityScore: number; // Base score, higher is more important
}

export interface UserStateContext {
  todayStr: string;
  weightTrend: 'up' | 'down' | 'stable' | 'unknown';
  hasWeightInLastWeek: boolean;
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
  waterMl: number;
  waterTargetMl: number;
  steps: number;
  stepsTarget: number;
  sleepMinutes: number;
  sleepTargetMinutes: number;
  workoutScheduled: boolean;
  workoutCompleted: boolean;
  missedWorkoutDays: number;
}
