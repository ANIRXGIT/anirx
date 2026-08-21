import { localRepo } from '../../db/repositories/LocalRepository';
import { startOfDay } from 'date-fns';

export interface DomainDeficit {
  domain: string;
  metric: string;
  value: any;
  target?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedEntityId?: string;
  privacyLevel: 'PUBLIC' | 'PRIVATE';
}

export interface FullLifeStateContext {
  userId: string;
  dateStr: string;
  deficits: DomainDeficit[];
  // Raw high-level aggregates
  activeProjectsCount: number;
  upcomingExamsCount: number;
  activeInterviewsCount: number;
  budgetUtilizationPct: number;
  habitAdherencePct: number;
  taskAdherencePct: number;
}

export interface AILifeStateContext {
  dateStr: string;
  deficits: Omit<DomainDeficit, 'privacyLevel' | 'relatedEntityId'>[];
  activeProjectsCount: number;
  upcomingExamsCount: number;
  activeInterviewsCount: number;
  habitAdherencePct: number;
  taskAdherencePct: number;
}

export class LifeStateEngine {
  
  static async getFullState(userId: string): Promise<FullLifeStateContext> {
    const today = startOfDay(new Date());
    const dateStr = today.toISOString().split('T')[0];
    
    // Fetch data
    const habits = await localRepo.getHabits(userId);
    const tasks = await localRepo.getTasksForDate(userId, dateStr);
    const projects = await localRepo.getProjects(userId);
    const exams = await localRepo.getExams ? await localRepo.getExams(userId) : [];
    const apps = await localRepo.getCareerApplications(userId);
    const tx = await localRepo.getFinanceTransactions(userId);
    const budgets = await localRepo.getFinanceBudgets ? await localRepo.getFinanceBudgets(userId) : [];

    const deficits: DomainDeficit[] = [];

    // Habit Deficits
    const activeHabits = habits.filter(h => h.active);
    let habitsCompletedToday = 0;
    for (const h of activeHabits) {
      const logs = await localRepo.getHabitLogs(userId, h.id);
      const todayLog = logs.find(l => l.timestamp >= today.getTime() && l.timestamp < today.getTime() + 86400000);
      if (todayLog && todayLog.completed) {
        habitsCompletedToday++;
      } else {
        deficits.push({
          domain: 'habits',
          metric: 'missed_days',
          value: 1,
          severity: 'medium',
          relatedEntityId: h.id,
          privacyLevel: h.privacy_level as any || 'PRIVATE'
        });
      }
    }
    
    const habitAdherencePct = activeHabits.length > 0 ? Math.round((habitsCompletedToday / activeHabits.length) * 100) : 100;

    // Task Deficits
    const overdueTasks = tasks.filter(t => t.status === 'overdue');
    if (overdueTasks.length > 0) {
      deficits.push({
        domain: 'tasks',
        metric: 'overdue_count',
        value: overdueTasks.length,
        severity: overdueTasks.length > 3 ? 'high' : 'medium',
        privacyLevel: 'PRIVATE'
      });
    }

    // Finance Deficits
    let totalSpent = 0;
    tx.filter(t => t.type === 'EXPENSE').forEach(t => totalSpent += Number(t.amount));
    const totalBudget = budgets.reduce((sum: number, b: any) => sum + Number(b.amount), 0);
    let budgetUtilizationPct = 0;
    if (totalBudget > 0) {
      budgetUtilizationPct = Math.round((totalSpent / totalBudget) * 100);
      if (budgetUtilizationPct > 90) {
        deficits.push({
          domain: 'finance',
          metric: 'budget_utilization',
          value: budgetUtilizationPct,
          target: 100,
          severity: 'critical',
          privacyLevel: 'PRIVATE' // Finance is ALWAYS private
        });
      }
    }

    // Projects
    const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;

    // Study
    const upcomingExamsCount = exams.filter((e: any) => e.status === 'upcoming' && e.dateTime > Date.now()).length;

    // Career
    const activeInterviewsCount = apps.filter(a => a.status === 'INTERVIEW').length;

    return {
      userId,
      dateStr,
      deficits,
      activeProjectsCount,
      upcomingExamsCount,
      activeInterviewsCount,
      budgetUtilizationPct,
      habitAdherencePct,
      taskAdherencePct: tasks.length > 0 ? Math.round((tasks.filter(t => t.status==='completed').length / tasks.length)*100) : 100
    };
  }

  static getAIContext(fullState: FullLifeStateContext): AILifeStateContext {
    return {
      dateStr: fullState.dateStr,
      activeProjectsCount: fullState.activeProjectsCount,
      upcomingExamsCount: fullState.upcomingExamsCount,
      activeInterviewsCount: fullState.activeInterviewsCount,
      habitAdherencePct: fullState.habitAdherencePct,
      taskAdherencePct: fullState.taskAdherencePct,
      // Strip related_entity_id, and completely remove finance or other explicitly private items from AI payload
      deficits: fullState.deficits
        .filter(d => d.domain !== 'finance') // Strict Finance isolation
        .filter(d => d.privacyLevel !== 'PRIVATE' || d.domain === 'habits' || d.domain === 'tasks') // Allow generic domains but mask IDs
        .map(d => ({
          domain: d.domain,
          metric: d.metric,
          value: d.value,
          target: d.target,
          severity: d.severity
        }))
    };
  }
}
