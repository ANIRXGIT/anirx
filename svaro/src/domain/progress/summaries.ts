import { localRepo } from '../../db/repositories/LocalRepository';
import { calculateTransformationScore } from './score';

export async function generateWeeklySummary(userId: string, weekStartDate: number) {
  const start = new Date(weekStartDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const weightLogs = (await localRepo.getWeightLogs(userId)).filter(l => !l.deleted && l.timestamp >= start.getTime() && l.timestamp <= end.getTime());
  let weightChange = 0;
  if (weightLogs.length >= 2) {
    weightChange = weightLogs[weightLogs.length - 1].weightKg - weightLogs[0].weightKg;
  }

  let totalCalories = 0;
  let caloriesDays = 0;
  
  let totalWorkouts = 0;
  let completedWorkouts = 0;

  let totalProtein = 0;
  
  let totalSteps = 0;
  let stepsDays = 0;

  let totalSleep = 0;
  let sleepDays = 0;

  let totalWater = 0;
  let waterDays = 0;
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const logs = await localRepo.getLogsForDate(userId, d);
    
    // Nutrition
    const foods = logs.foods?.filter(l => !l.deleted) || [];
    if (foods.length > 0) {
      totalCalories += foods.reduce((acc, f) => acc + (f.calories || 0), 0);
      totalProtein += foods.reduce((acc, f) => acc + (f.protein || 0), 0);
      caloriesDays++;
    }

    // Workouts
    const workouts = logs.workouts?.filter(l => !l.deleted) || [];
    if (workouts.length > 0) {
      totalWorkouts += workouts.length;
      completedWorkouts += workouts.filter(w => w.completed).length;
    }

    // Steps
    const steps = logs.steps?.filter(l => !l.deleted) || [];
    if (steps.length > 0) {
      totalSteps += steps[steps.length - 1].steps; // take last log of day
      stepsDays++;
    }

    // Sleep
    const sleeps = logs.sleeps?.filter(l => !l.deleted) || [];
    if (sleeps.length > 0) {
      totalSleep += sleeps[sleeps.length - 1].durationMinutes;
      sleepDays++;
    }

    // Water
    const waters = logs.waters?.filter(l => !l.deleted) || [];
    if (waters.length > 0) {
      totalWater += waters.reduce((acc, w) => acc + (w.amountMl || 0), 0);
      waterDays++;
    }
  }

  const avgCalories = caloriesDays > 0 ? totalCalories / caloriesDays : 0;
  const avgProtein = caloriesDays > 0 ? totalProtein / caloriesDays : 0;
  const avgSteps = stepsDays > 0 ? totalSteps / stepsDays : 0;
  const avgSleep = sleepDays > 0 ? totalSleep / sleepDays : 0;
  const avgWater = waterDays > 0 ? totalWater / waterDays : 0;
  const workoutCompletionPct = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
  
  // Need targets for accurate adherence, but for now we just return absolute values or base percentages.
  // Real implementation would pull nutrition target. Let's get it.
  const target = await localRepo.getActiveNutritionTarget(userId);
  const proteinAdherencePct = target && target.protein > 0 ? Math.min(100, (avgProtein / target.protein) * 100) : 0;

  const scoreData = calculateTransformationScore({
    goalProgressPct: 0,
    workoutConsistencyPct: workoutCompletionPct, 
    nutritionConsistencyPct: proteinAdherencePct
  });

  return {
    weekStartDate: start.getTime(),
    weightChange,
    avgCalories,
    workoutCompletionPct,
    proteinAdherencePct,
    avgSteps,
    avgSleep,
    avgWater,
    taskCompletionPct: 0,
    challengeProgressPct: 0,
    progressScore: scoreData.score
  };
}

export async function generateMonthlySummary(userId: string, monthStartDate: Date) {
  const start = new Date(monthStartDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  const weightLogs = (await localRepo.getWeightLogs(userId)).filter(l => !l.deleted && l.timestamp >= start.getTime() && l.timestamp <= end.getTime());
  let weightChange = 0;
  let startingWeight = 0;
  let currentWeight = 0;
  if (weightLogs.length > 0) {
    startingWeight = weightLogs[0].weightKg;
    currentWeight = weightLogs[weightLogs.length - 1].weightKg;
    weightChange = currentWeight - startingWeight;
  }

  let totalCalories = 0;
  let caloriesDays = 0;
  
  let totalWorkouts = 0;
  let completedWorkouts = 0;

  let totalProtein = 0;
  
  let totalSteps = 0;
  let stepsDays = 0;

  let totalSleep = 0;
  let sleepDays = 0;

  const daysInMonth = end.getDate();
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const logs = await localRepo.getLogsForDate(userId, d);
    
    const foods = logs.foods?.filter(l => !l.deleted) || [];
    if (foods.length > 0) {
      totalCalories += foods.reduce((acc, f) => acc + (f.calories || 0), 0);
      totalProtein += foods.reduce((acc, f) => acc + (f.protein || 0), 0);
      caloriesDays++;
    }

    const workouts = logs.workouts?.filter(l => !l.deleted) || [];
    if (workouts.length > 0) {
      totalWorkouts += workouts.length;
      completedWorkouts += workouts.filter(w => w.completed).length;
    }

    const steps = logs.steps?.filter(l => !l.deleted) || [];
    if (steps.length > 0) {
      totalSteps += steps[steps.length - 1].steps;
      stepsDays++;
    }

    const sleeps = logs.sleeps?.filter(l => !l.deleted) || [];
    if (sleeps.length > 0) {
      totalSleep += sleeps[sleeps.length - 1].durationMinutes;
      sleepDays++;
    }
  }

  const avgCalories = caloriesDays > 0 ? totalCalories / caloriesDays : 0;
  const avgProtein = caloriesDays > 0 ? totalProtein / caloriesDays : 0;
  const avgSteps = stepsDays > 0 ? totalSteps / stepsDays : 0;
  const avgSleep = sleepDays > 0 ? totalSleep / sleepDays : 0;
  const workoutCompletionPct = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
  
  const target = await localRepo.getActiveNutritionTarget(userId);
  const proteinAdherencePct = target && target.protein > 0 ? Math.min(100, (avgProtein / target.protein) * 100) : 0;

  return {
    monthStartDate: start.getTime(),
    startingWeight,
    currentWeight,
    weightChange,
    measurementChanges: {},
    workoutCompletionPct,
    strengthChanges: {},
    avgCalories,
    proteinAdherencePct,
    avgSteps,
    avgSleep,
    taskCompletionPct: 0,
    whatImproved: "",
    whatStalled: "",
    whatShouldChange: ""
  };
}
