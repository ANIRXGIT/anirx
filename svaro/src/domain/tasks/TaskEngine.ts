import type { DailyTask, TaskTemplate } from '../../db/dexie';
import { startOfDay, isBefore, isSameDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { createBaseEntity } from '../core/BaseEntity';

export class TaskEngine {

  /**
   * Evaluates the determinisitc status of a task based on its properties and the current time.
   */
  static getStatus(task: DailyTask, now: Date = new Date()): DailyTask['status'] {
    if (task.status === 'completed' || task.status === 'skipped') {
      return task.status;
    }

    if (task.dueDate && task.status === 'pending') {
      if (isBefore(new Date(task.dueDate), now) && !isSameDay(new Date(task.dueDate), now)) {
        return 'overdue';
      }
    }

    // Default to what's stored
    return task.status;
  }

  /**
   * Generates recurring tasks deterministically for a given date.
   * Prevents duplicates by checking if a task for that template already exists on that date.
   */
  static generateRecurringTasks(templates: TaskTemplate[], existingTasks: DailyTask[], targetDate: Date, userId: string): DailyTask[] {
    const newTasks: DailyTask[] = [];
    const targetDay = startOfDay(targetDate);
    
    // Map existing tasks for quick lookup
    const existingTemplateIdsForDay = new Set(
      existingTasks
        .filter(t => t.templateId && isSameDay(new Date(t.timestamp), targetDate))
        .map(t => t.templateId)
    );

    for (const template of templates) {
      if (!template.active) continue;

      let shouldGenerate = false;

      // Evaluate frequency
      if (template.frequency === 'DAILY') {
        shouldGenerate = true;
      } else if (template.frequency.startsWith('WEEKLY:')) {
        const days = template.frequency.split(':')[1].split(',').map(Number);
        if (days.includes(targetDate.getDay())) {
          shouldGenerate = true;
        }
      }

      if (shouldGenerate && !existingTemplateIdsForDay.has(template.id)) {
        newTasks.push({
          ...createBaseEntity(userId),
          id: uuidv4(),
          templateId: template.id,
          title: template.title,
          description: template.description,
          category: template.category,
          source: 'system',
          completed: false,
          status: 'pending',
          priority: 0,
          timestamp: targetDay.getTime(),
          dueDate: targetDay.getTime() // defaults to end of that day structurally, but timestamp suffices
        });
      }
    }

    return newTasks;
  }
}
