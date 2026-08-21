import fs from 'fs';

let content = fs.readFileSync('src/db/dexie.ts', 'utf8');

// Update Habit
content = content.replace(
  /export interface Habit extends BaseEntity {[\s\S]*?showOnDashboard: boolean;\s*}/,
  `export interface Habit extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  trackingType: 'boolean' | 'numeric' | 'timer';
  unit?: string;
  target: number;
  frequency: string;
  active: boolean;
  showOnCalendar: boolean;
  showOnDashboard: boolean;
  startDate?: number;
  endDate?: number;
}`
);

// Update HabitLog
content = content.replace(
  /export interface HabitLog extends BaseEntity {[\s\S]*?notes\?: string;\s*}/,
  `export interface HabitLog extends BaseEntity {
  habitId: string;
  value: number;
  completed: boolean;
  status?: 'completed' | 'skipped' | 'failed';
  notes?: string;
  timestamp: number;
}`
);

// Update DailyTask - NOTE: My previous PowerShell replace might have added duplicate fields. Let's fix that.
// First strip any previous bad replacements
content = content.replace(/status\?: 'pending' \| 'completed' \| 'skipped' \| 'overdue';\s*/g, '');
content = content.replace(/dueDate\?: number;\s*/g, '');
content = content.replace(/priority\?: number;\s*/g, '');

content = content.replace(
  /export interface DailyTask extends BaseEntity {[\s\S]*?notes\?: string;\s*}/,
  `export interface DailyTask extends BaseEntity {
  templateId?: string;
  title: string;
  description?: string;
  category: string;
  source: 'system' | 'user';
  completed: boolean;
  status: 'pending' | 'completed' | 'skipped' | 'overdue';
  priority: number;
  dueDate?: number;
  timestamp: number;
  notes?: string;
}`
);

// Add version 13
if (!content.includes('this.version(13)')) {
  content = content.replace(
    /this\.version\(12\)\.stores\({[\s\S]*?}\);/,
    `this.version(12).stores({
      sync_queue: 'id, user_id, [user_id+type]',
      sync_cursors: '[table_name+user_id]',
      local_media: 'id, user_id'
    });

    this.version(13).stores({
      habits: "id, user_id, [user_id+active]",
      daily_tasks: "id, user_id, [user_id+status], [user_id+dueDate]",
      habit_logs: "id, user_id, [user_id+habitId+timestamp]"
    }).upgrade(async trans => {
      // Safely migrate existing data
      await trans.table('daily_tasks').toCollection().modify((task) => {
        if (!task.status) {
          task.status = task.completed ? 'completed' : 'pending';
        }
        if (task.priority === undefined) {
          task.priority = 0;
        }
      });
      await trans.table('habit_logs').toCollection().modify((log) => {
        if (!log.status) {
          log.status = 'completed';
        }
        if (log.completed === undefined) {
          log.completed = true;
        }
      });
    });`
  );
}

fs.writeFileSync('src/db/dexie.ts', content, 'utf8');
