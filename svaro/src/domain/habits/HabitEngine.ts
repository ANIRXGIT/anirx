import type { Habit, HabitLog } from '../../db/dexie';
import { StreakEngine } from '../core/StreakEngine';
import type { StreakMetrics } from '../core/StreakEngine';
import { startOfDay, isBefore } from 'date-fns';

export interface HabitStreakData extends StreakMetrics {
  lastCompletedDate: Date | null;
}

export class HabitEngine {
  
  static calculateMetrics(habit: Habit, logs: HabitLog[], todayDate: Date = new Date()): HabitStreakData {
    const today = startOfDay(todayDate);
    
    const rawStart = habit.startDate || habit.created_at || Date.now();
    const startDate = startOfDay(new Date(rawStart));
    
    let endDate = today;
    if (habit.endDate && isBefore(startOfDay(new Date(habit.endDate)), today)) {
      endDate = startOfDay(new Date(habit.endDate));
    }
    
    if (!habit.active && habit.updated_at) {
      const inactiveDate = startOfDay(new Date(habit.updated_at));
      if (isBefore(inactiveDate, endDate)) {
        endDate = inactiveDate;
      }
    }

    const completedLogs = logs.filter(l => l.status === 'completed' && l.completed);
    const completionDates = completedLogs.map(l => new Date(l.timestamp));

    let lastCompletedDate: Date | null = null;
    if (completionDates.length > 0) {
      completionDates.sort((a, b) => b.getTime() - a.getTime());
      lastCompletedDate = startOfDay(completionDates[0]);
    }

    let frequencyDays: number[] | null = null;
    if (habit.frequency && habit.frequency.startsWith('SPECIFIC_DAYS:')) {
      frequencyDays = habit.frequency.split(':')[1].split(',').map(Number);
    }

    const baseMetrics = StreakEngine.calculate(completionDates, startDate, endDate, frequencyDays, todayDate);

    return {
      ...baseMetrics,
      lastCompletedDate
    };
  }
}
