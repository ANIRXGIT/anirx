import { startOfDay, isBefore, isAfter } from 'date-fns';

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionPercentage: number;
  missedDays: number;
}

export class StreakEngine {
  
  static calculate(
    completionDates: Date[], 
    startDate: Date, 
    endDate: Date, 
    frequencyDays: number[] | null = null,
    referenceToday: Date = new Date()
  ): StreakMetrics {
    
    if (isAfter(startOfDay(startDate), startOfDay(endDate))) {
      return { currentStreak: 0, longestStreak: 0, totalCompletions: 0, completionPercentage: 0, missedDays: 0 };
    }

    const completedDaySet = new Set(
      completionDates
        .filter(d => !isAfter(startOfDay(d), startOfDay(endDate)))
        .map(d => startOfDay(d).getTime().toString())
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let totalPossible = 0;
    let missedDays = 0;
    const today = startOfDay(referenceToday);
    
    let iter = startOfDay(startDate);
    const end = startOfDay(endDate);

    while (iter <= end) {
      let required = true;
      if (frequencyDays !== null && !frequencyDays.includes(iter.getDay())) {
        required = false;
      }

      if (required) {
        totalPossible++;
        const iterStr = iter.getTime().toString();
        
        if (completedDaySet.has(iterStr)) {
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else {
          missedDays++;
          
          if (isBefore(iter, today)) {
            currentStreak = 0;
          }
        }
      }

      iter = new Date(iter.getTime() + 86400000);
    }

    const totalCompletions = completedDaySet.size;
    const completionPercentage = totalPossible === 0 ? 0 : Math.round((totalCompletions / totalPossible) * 100);

    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      completionPercentage,
      missedDays
    };
  }
}
