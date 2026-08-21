import type { Challenge, DailyTask, HabitLog, FoodLog, WorkoutSession } from '../../db/dexie';

export interface ChallengeProgress {
  percentage: number;
  status: Challenge['status'];
  metRequirements: number;
  totalRequirements: number;
}

export class ChallengeEngine {
  
  /**
   * Deterministically calculates challenge progress purely from database logs.
   */
  static calculateProgress(
    challenge: Challenge,
    tasks: DailyTask[],
    habitLogs: HabitLog[],
    foodLogs: FoodLog[],
    workouts: WorkoutSession[],
    now: Date = new Date()
  ): ChallengeProgress {
    
    let status = challenge.status;
    const nowTime = now.getTime();

    if (status !== 'completed' && status !== 'cancelled' && status !== 'failed') {
      if (nowTime < challenge.startDate) {
        status = 'upcoming';
      } else if (nowTime > challenge.endDate) {
        // Evaluate if failed at the end
        status = 'failed'; 
      } else {
        status = 'active';
      }
    }

    let metCount = 0;
    const totalReq = challenge.requirements.length;

    for (const req of challenge.requirements) {
      let currentProgress = 0;

      if (req.type === 'calories') {
        const cals = foodLogs
          .filter(l => l.timestamp >= challenge.startDate && l.timestamp <= challenge.endDate)
          .reduce((acc, log) => acc + log.calories, 0);
        currentProgress = cals;
      } 
      else if (req.type === 'workouts') {
        const count = workouts
          .filter(w => w.completed && w.startTime >= challenge.startDate && w.startTime <= challenge.endDate)
          .length;
        currentProgress = count;
      }
      else if (req.type.startsWith('task:')) {
        const cat = req.type.split(':')[1];
        const count = tasks
          .filter(t => t.status === 'completed' && t.category === cat && t.timestamp >= challenge.startDate && t.timestamp <= challenge.endDate)
          .length;
        currentProgress = count;
      }
      else if (req.type.startsWith('habit:')) {
        const hId = req.type.split(':')[1];
        const count = habitLogs
          .filter(h => h.habitId === hId && h.completed && h.timestamp >= challenge.startDate && h.timestamp <= challenge.endDate)
          .length;
        currentProgress = count;
      }

      if (currentProgress >= req.target) {
        metCount++;
      }
    }

    let percentage = 0;
    if (totalReq > 0) {
      percentage = Math.round((metCount / totalReq) * 100);
    }

    // Auto complete if threshold met
    if (status === 'active' && percentage >= challenge.thresholdPercentage) {
      status = 'completed';
    } else if (status === 'failed' && percentage >= challenge.thresholdPercentage) {
      // It passed by the end date
      status = 'completed';
    }

    return {
      percentage,
      status,
      metRequirements: metCount,
      totalRequirements: totalReq
    };
  }
}
