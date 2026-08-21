import fs from 'fs';

// 1. Fix dexie.ts HabitLog
let dexie = fs.readFileSync('src/db/dexie.ts', 'utf8');
dexie = dexie.replace(
  /export interface HabitLog extends BaseEntity {[\s\S]*?timestamp: number;\s*}/,
  `export interface HabitLog extends BaseEntity {
  habitId: string;
  value: number;
  completed: boolean;
  status?: 'completed' | 'skipped' | 'failed';
  notes?: string;
  timestamp: number;
}`
);
fs.writeFileSync('src/db/dexie.ts', dexie);

// Helper to replace import { Type } with import type { Type }
function fixImports(file, types) {
  let text = fs.readFileSync(file, 'utf8');
  for (const t of types) {
    const regex = new RegExp(`import\\s+\\{([^}]*\\b${t}\\b[^}]*)\\}\\s+from\\s+(['"][^'"]+['"]);`, 'g');
    text = text.replace(regex, (match, imports, modulePath) => {
      const parts = imports.split(',').map(s => s.trim());
      const typeParts = parts.filter(p => types.includes(p));
      const valParts = parts.filter(p => !types.includes(p));
      
      let res = '';
      if (valParts.length > 0) {
        res += `import { ${valParts.join(', ')} } from ${modulePath};\n`;
      }
      res += `import type { ${typeParts.join(', ')} } from ${modulePath};`;
      return res;
    });
  }
  fs.writeFileSync(file, text);
}

// src/domain/calendar/CalendarEngine.ts
fixImports('src/domain/calendar/CalendarEngine.ts', ['DailyTask', 'HabitLog', 'WorkoutSession', 'FoodLog', 'WaterLog', 'StepLog']);

// src/domain/challenges/ChallengeEngine.test.ts
fixImports('src/domain/challenges/ChallengeEngine.test.ts', ['Challenge']);

// src/domain/challenges/ChallengeEngine.ts
fixImports('src/domain/challenges/ChallengeEngine.ts', ['Challenge', 'DailyTask', 'HabitLog', 'FoodLog', 'WorkoutSession']);

// src/domain/habits/HabitEngine.test.ts
fixImports('src/domain/habits/HabitEngine.test.ts', ['Habit', 'HabitLog']);

// src/domain/habits/HabitEngine.ts
fixImports('src/domain/habits/HabitEngine.ts', ['Habit', 'HabitLog']);
let he = fs.readFileSync('src/domain/habits/HabitEngine.ts', 'utf8');
he = he.replace(/differenceInDays,\s*/g, '');
fs.writeFileSync('src/domain/habits/HabitEngine.ts', he);

// src/domain/tasks/generator.ts
let tg = fs.readFileSync('src/domain/tasks/generator.ts', 'utf8');
tg = tg.replace(/import { useAuthStore } from '\.\.\/\.\.\/stores\/useAuthStore';\n/, '');
fs.writeFileSync('src/domain/tasks/generator.ts', tg);

// src/domain/tasks/TaskEngine.test.ts
fixImports('src/domain/tasks/TaskEngine.test.ts', ['DailyTask', 'TaskTemplate']);

// src/domain/tasks/TaskEngine.ts
fixImports('src/domain/tasks/TaskEngine.ts', ['DailyTask', 'TaskTemplate']);

// src/features/calendar/CalendarView.tsx
fixImports('src/features/calendar/CalendarView.tsx', ['DailyTask']);
let cv = fs.readFileSync('src/features/calendar/CalendarView.tsx', 'utf8');
cv = cv.replace(/import { createBaseEntity } from '\.\.\/\.\.\/domain\/core\/BaseEntity';\n/, '');
fs.writeFileSync('src/features/calendar/CalendarView.tsx', cv);

// src/features/habits/HabitsWidget.tsx
fixImports('src/features/habits/HabitsWidget.tsx', ['Habit', 'HabitLog']);

// src/features/tasks/TasksWidget.tsx
fixImports('src/features/tasks/TasksWidget.tsx', ['DailyTask']);

