import type { StudySession, Goal } from '../../db/dexie';
import { startOfDay, startOfWeek, startOfMonth, isAfter, isBefore } from 'date-fns';

export interface StudyStats {
  dailyMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  subjectMinutes: Record<string, number>;
}

export class StudyEngine {
  static calculateStats(sessions: StudySession[], now: Date = new Date()): StudyStats {
    const today = startOfDay(now).getTime();
    const week = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const month = startOfMonth(now).getTime();

    let dailyMinutes = 0;
    let weeklyMinutes = 0;
    let monthlyMinutes = 0;
    const subjectMinutes: Record<string, number> = {};

    for (const session of sessions) {
      if (!session.durationMinutes) continue;
      
      if (session.startTime >= today) {
        dailyMinutes += session.durationMinutes;
      }
      if (session.startTime >= week) {
        weeklyMinutes += session.durationMinutes;
      }
      if (session.startTime >= month) {
        monthlyMinutes += session.durationMinutes;
      }

      if (session.subjectId) {
        subjectMinutes[session.subjectId] = (subjectMinutes[session.subjectId] || 0) + session.durationMinutes;
      }
    }

    return {
      dailyMinutes,
      weeklyMinutes,
      monthlyMinutes,
      subjectMinutes
    };
  }

  static calculateGoalProgress(goal: Goal, sessions: StudySession[]): number {
    if (!goal.targetValue) return 0;
    
    let total = 0;
    for (const session of sessions) {
      if (!session.durationMinutes) continue;
      
      const sessionDate = new Date(session.startTime);
      if (goal.startDate && isBefore(sessionDate, new Date(goal.startDate))) continue;
      if (goal.endDate && isAfter(sessionDate, new Date(goal.endDate))) continue;
      
      total += session.durationMinutes;
    }

    // Assuming target is in hours based on prompt example "10 hours this week"
    let currentVal = goal.unit === 'hours' ? total / 60 : total;
    return Math.min(Math.round((currentVal / goal.targetValue) * 100), 100);
  }
}
