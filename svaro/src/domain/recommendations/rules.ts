import type { FullLifeStateContext } from '../core/LifeStateEngine';
import type { Recommendation } from '../../db/dexie';

export function evaluateDeterministicRules(context: FullLifeStateContext): Partial<Recommendation>[] {
  const drafts: Partial<Recommendation>[] = [];

  for (const deficit of context.deficits) {
    if (deficit.domain === 'finance' && deficit.metric === 'budget_utilization') {
      drafts.push({
        ruleId: 'finance_budget_critical',
        type: 'finance',
        title: 'Spending Freeze Recommended',
        what: 'Review budget utilization',
        why: `You have used ${deficit.value}% of your budget this period.`,
        action: 'Review Finances',
        actionType: 'NAVIGATE',
        actionPayload: { route: '/finance' },
        priority: 95,
        confidence: 1.0,
        source: 'DETERMINISTIC'
      });
    }

    if (deficit.domain === 'tasks' && deficit.metric === 'overdue_count') {
      drafts.push({
        ruleId: 'tasks_overdue',
        type: 'lifestyle',
        title: 'Overdue Tasks',
        what: `Clear ${deficit.value} overdue tasks`,
        why: 'Task backlog is accumulating.',
        action: 'View Tasks',
        actionType: 'NAVIGATE',
        actionPayload: { route: '/tasks' },
        priority: deficit.severity === 'high' ? 85 : 60,
        confidence: 1.0,
        source: 'DETERMINISTIC'
      });
    }

    if (deficit.domain === 'habits' && deficit.metric === 'missed_days') {
      drafts.push({
        ruleId: `habit_missed_${deficit.relatedEntityId}`,
        type: 'lifestyle',
        title: 'Streak at Risk',
        what: 'Complete your habit today',
        why: 'You are at risk of breaking your consistency.',
        action: 'Complete Habit',
        actionType: 'CREATE_TASK',
        actionPayload: { title: 'Recover Habit Streak', priority: 1, linkedEntityId: deficit.relatedEntityId },
        relatedEntityId: deficit.relatedEntityId,
        priority: 80,
        confidence: 1.0,
        source: 'DETERMINISTIC'
      });
    }
  }

  // General state rules
  if (context.upcomingExamsCount > 0) {
    drafts.push({
      ruleId: 'study_exam_approaching',
      type: 'study',
      title: 'Upcoming Exam',
      what: 'Schedule a study block',
      why: 'You have an exam approaching soon.',
      action: 'Schedule Study',
      actionType: 'CREATE_TASK',
      actionPayload: { title: 'Exam Review Block', priority: 2 },
      priority: 90,
      confidence: 1.0,
      source: 'DETERMINISTIC'
    });
  }

  return drafts;
}
