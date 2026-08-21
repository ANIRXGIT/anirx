import { describe, it, expect } from 'vitest';
import { TaskEngine } from './TaskEngine';
import type { DailyTask, TaskTemplate } from '../../db/dexie';

describe('TaskEngine', () => {
  const mockTemplate: TaskTemplate = {
    id: 'tpl-1',
    user_id: 'user-1',
    title: 'Morning Routine',
    category: 'morning',
    frequency: 'DAILY',
    active: true,
    created_at: 0,
    updated_at: 0,
    privacy_level: 'PRIVATE',
    sync_state: 'SYNCED',
    deleted: false
  };

  it('determines overdue status correctly', () => {
    // Generate dates using local timezone to avoid cross-tz testing errors
    const baseDate = new Date(2026, 7, 1, 10, 0, 0); // Aug 1, 2026 10:00 AM
    
    const task: DailyTask = {
      id: 'task-1',
      user_id: 'user-1',
      title: 'Morning Routine',
      category: 'morning',
      source: 'system',
      completed: false,
      status: 'pending',
      priority: 0,
      timestamp: baseDate.getTime(),
      dueDate: baseDate.getTime(),
      created_at: 0,
      updated_at: 0,
      privacy_level: 'PRIVATE',
      sync_state: 'SYNCED',
      deleted: false
    };

    // If it's still Aug 1st
    const sameDay = new Date(2026, 7, 1, 23, 0, 0);
    expect(TaskEngine.getStatus(task, sameDay)).toBe('pending');

    // If it's Aug 2nd
    const nextDay = new Date(2026, 7, 2, 10, 0, 0);
    expect(TaskEngine.getStatus(task, nextDay)).toBe('overdue');
  });

  it('prevents duplicate generation of recurring tasks', () => {
    const targetDate = new Date(2026, 7, 1, 10, 0, 0);
    
    // Run generation once
    const firstRun = TaskEngine.generateRecurringTasks([mockTemplate], [], targetDate, 'user-1');
    expect(firstRun.length).toBe(1);
    
    // Run generation again with the first run tasks provided
    const secondRun = TaskEngine.generateRecurringTasks([mockTemplate], firstRun, targetDate, 'user-1');
    expect(secondRun.length).toBe(0); // Should not duplicate
  });
});
