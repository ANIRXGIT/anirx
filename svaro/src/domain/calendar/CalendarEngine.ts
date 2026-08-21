import type { DailyTask, HabitLog, WorkoutSession, FoodLog, WaterLog, StepLog, Exam, Assignment, ProjectMilestone, StudySession, CareerApplication } from '../../db/dexie';
import { isSameDay } from 'date-fns';

export interface DailyExecutionState {
  hasData: boolean;
  taskCompletionPercentage: number;
  habitCompletionPercentage: number;
  workoutCompleted: boolean;
  nutritionLogged: boolean;
  overallAdherencePercentage: number;
  // Domain Extensions
  exams: Exam[];
  assignments: Assignment[];
  milestones: ProjectMilestone[];
  studySessions: StudySession[];
  careerDeadlines: CareerApplication[];
}

export class CalendarEngine {
  static getDailyState(
    date: Date,
    tasks: DailyTask[],
    habitLogs: HabitLog[],
    workouts: WorkoutSession[],
    foods: FoodLog[],
    waters: WaterLog[],
    steps: StepLog[],
    exams: Exam[] = [],
    assignments: Assignment[] = [],
    milestones: ProjectMilestone[] = [],
    studySessions: StudySession[] = [],
    careerApps: CareerApplication[] = []
  ): DailyExecutionState {
    
    const dTasks = tasks.filter(t => isSameDay(new Date(t.timestamp), date));
    const dHabits = habitLogs.filter(h => isSameDay(new Date(h.timestamp), date));
    const dWorkouts = workouts.filter(w => isSameDay(new Date(w.startTime), date));
    const dFoods = foods.filter(f => isSameDay(new Date(f.timestamp), date));
    const dWaters = waters.filter(w => isSameDay(new Date(w.timestamp), date));
    const dSteps = steps.filter(s => isSameDay(new Date(s.timestamp), date));
    
    // Domain matches
    const dExams = exams.filter(e => isSameDay(new Date(e.dateTime), date));
    const dAssignments = assignments.filter(a => isSameDay(new Date(a.dueDate), date));
    const dMilestones = milestones.filter(m => m.deadline && isSameDay(new Date(m.deadline), date));
    const dStudy = studySessions.filter(s => isSameDay(new Date(s.startTime), date));
    const dCareer = careerApps.filter(c => c.deadline && isSameDay(new Date(c.deadline), date));

    const hasData = (
      dTasks.length > 0 || dHabits.length > 0 || dWorkouts.length > 0 || 
      dFoods.length > 0 || dWaters.length > 0 || dSteps.length > 0 ||
      dExams.length > 0 || dAssignments.length > 0 || dMilestones.length > 0 ||
      dStudy.length > 0 || dCareer.length > 0
    );

    if (!hasData) {
      return {
        hasData: false,
        taskCompletionPercentage: 0,
        habitCompletionPercentage: 0,
        workoutCompleted: false,
        nutritionLogged: false,
        overallAdherencePercentage: 0,
        exams: [], assignments: [], milestones: [], studySessions: [], careerDeadlines: []
      };
    }

    let taskCompletionPercentage = 0;
    if (dTasks.length > 0) {
      const completed = dTasks.filter(t => t.status === 'completed').length;
      taskCompletionPercentage = Math.round((completed / dTasks.length) * 100);
    }

    let habitCompletionPercentage = 0;
    if (dHabits.length > 0) {
      const completed = dHabits.filter(h => h.completed).length;
      habitCompletionPercentage = Math.round((completed / dHabits.length) * 100);
    }

    const workoutCompleted = dWorkouts.some(w => w.completed);
    const nutritionLogged = dFoods.length > 0;

    let totalScore = 0;
    let possibleWeights = 0;

    if (dTasks.length > 0) {
      possibleWeights += 30;
      totalScore += (taskCompletionPercentage / 100) * 30;
    }
    if (dHabits.length > 0) {
      possibleWeights += 30;
      totalScore += (habitCompletionPercentage / 100) * 30;
    }
    if (dWorkouts.length > 0) {
      possibleWeights += 20;
      totalScore += workoutCompleted ? 20 : 0;
    }
    if (dFoods.length > 0) {
      possibleWeights += 20;
      totalScore += nutritionLogged ? 20 : 0;
    }

    let overallAdherencePercentage = 0;
    if (possibleWeights > 0) {
      overallAdherencePercentage = Math.round((totalScore / possibleWeights) * 100);
    }

    return {
      hasData,
      taskCompletionPercentage,
      habitCompletionPercentage,
      workoutCompleted,
      nutritionLogged,
      overallAdherencePercentage,
      exams: dExams,
      assignments: dAssignments,
      milestones: dMilestones,
      studySessions: dStudy,
      careerDeadlines: dCareer
    };
  }
}
