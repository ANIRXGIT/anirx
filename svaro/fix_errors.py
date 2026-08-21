import re
from pathlib import Path

def patch(path_str, old, new):
    p = Path(path_str)
    c = p.read_text(encoding="utf-8")
    if old in c:
        p.write_text(c.replace(old, new), encoding="utf-8")

patch("src/domain/challenges/challenges.test.ts", 
      "const mockFoodLogs: FoodLog[] = [\n    {\n      id", 
      "const mockFoodLogs: FoodLog[] = [\n    { user_id: 'test-user', created_at: Date.now(), updated_at: Date.now(), privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false,\n      id")
patch("src/domain/challenges/challenges.test.ts", 
      "    },\n    {\n      id", 
      "    },\n    { user_id: 'test-user', created_at: Date.now(), updated_at: Date.now(), privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false,\n      id")

patch("src/domain/challenges/engine.ts", "evaluateChallenges()", "evaluateChallenges(userId: string = 'test-user')")

c = Path("src/domain/notifications/scheduler.ts").read_text(encoding="utf-8")
c = re.sub(r"getNotificationRules\([^)]*\)", "getNotificationRules(userId)", c)
Path("src/domain/notifications/scheduler.ts").write_text(c, encoding="utf-8")

c = Path("src/domain/progress/summaries.ts").read_text(encoding="utf-8")
c = re.sub(r"generateWeeklySummary\([^)]*\)", "generateWeeklySummary(userId: string = 'test-user')", c)
c = re.sub(r"getLogsForDate\([^)]*\)", "getLogsForDate(userId, d)", c)
Path("src/domain/progress/summaries.ts").write_text(c, encoding="utf-8")

patch("src/domain/recommendations/recommendations.test.ts", "createdAt:", "created_at:")

c = Path("src/domain/tasks/generator.ts").read_text(encoding="utf-8")
c = c.replace("generateDailyTasks(dateStr: string)", "generateDailyTasks(userId: string, dateStr: string)")
c = re.sub(r"getTaskTemplates\([^)]*\)", "getTaskTemplates(userId)", c)
c = re.sub(r"getTasksForDate\([^)]*\)", "getTasksForDate(userId, dateStr)", c)
Path("src/domain/tasks/generator.ts").write_text(c, encoding="utf-8")

patch("src/domain/tasks/tasks.test.ts", "generateDailyTasks(today)", "generateDailyTasks('test-user', today)")

patch("src/domain/workout/generator.test.ts", "generateWorkoutPlan(3", "generateWorkoutPlan('test-user', 3")
patch("src/domain/workout/generator.test.ts", "generateWorkoutPlan(5", "generateWorkoutPlan('test-user', 5")

c = Path("src/features/calendar/CalendarView.tsx").read_text(encoding="utf-8")
c = re.sub(r"const bath: BathLog = \{[^}]+durationMinutes,[^}]+\};", 
           "const bath: BathLog = { ...createBaseEntity(useAuthStore.getState().user?.id || ''), durationMinutes, timestamp: Date.now() };", c)
c = re.sub(r"const reset: NoFapReset = \{[^}]+timestamp: Date\.now\(\)[^}]+\};", 
           "const reset: NoFapReset = { ...createBaseEntity(useAuthStore.getState().user?.id || ''), timestamp: Date.now() };", c)
c = c.replace("loadData(date)", "loadData(date, useAuthStore.getState().user?.id || '')")
c = c.replace("const loadData = async (date: Date) =>", "const loadData = async (date: Date, userId: string = '') =>")
c = c.replace("localRepo.getLogsForDate(user.id, date)", "localRepo.getLogsForDate(userId, date)")
Path("src/features/calendar/CalendarView.tsx").write_text(c, encoding="utf-8")

c = Path("src/features/progress/Progress.tsx").read_text(encoding="utf-8")
c = c.replace("generateWeeklySummary()", "generateWeeklySummary(useAuthStore.getState().user?.id || '')")
Path("src/features/progress/Progress.tsx").write_text(c, encoding="utf-8")

c = Path("src/features/tasks/TasksWidget.tsx").read_text(encoding="utf-8")
if "useAuthStore" not in c:
    c = c.replace("import { useState", "import { useAuthStore } from '../../stores/useAuthStore';\nimport { useState")
c = c.replace("generateDailyTasks(todayStr)", "generateDailyTasks(useAuthStore.getState().user?.id || '', todayStr)")
Path("src/features/tasks/TasksWidget.tsx").write_text(c, encoding="utf-8")

c = Path("src/stores/useAppStore.ts").read_text(encoding="utf-8")
c = c.replace("localRepo.getSessionSets(todayWorkout.id)", "localRepo.getSessionSets(userId, todayWorkout.id)")
c = c.replace("createdAt:", "created_at:")
c = c.replace("...rec, id: crypto.randomUUID(),", "...createBaseEntity(get().profile?.user_id || ''), ...rec,")
Path("src/stores/useAppStore.ts").write_text(c, encoding="utf-8")

