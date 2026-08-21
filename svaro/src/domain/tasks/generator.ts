import { localRepo } from '../../db/repositories/LocalRepository';
import { TaskEngine } from './TaskEngine';

export async function generateDailyTasks(userId: string, dateStr: string) {
  const targetDate = new Date(dateStr);
  const existingTasks = await localRepo.getTasksForDate(userId, dateStr);
  const templates = await localRepo.getTaskTemplates(userId);

  // Filter templates that have already generated tasks for today
  const newTasks = TaskEngine.generateRecurringTasks(templates, existingTasks, targetDate, userId);

  // Save them
  for (const task of newTasks) {
    await localRepo.saveTask(task);
  }

  // Return combined
  const allTasks = [...existingTasks, ...newTasks];
  
  // Re-evaluate statuses (e.g. overdue)
  return allTasks.map(t => ({
    ...t,
    status: TaskEngine.getStatus(t, new Date())
  }));
}
