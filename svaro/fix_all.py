import pathlib
import re

def p(path, old, new):
    c = pathlib.Path(path).read_text(encoding="utf-8")
    if old in c:
        pathlib.Path(path).write_text(c.replace(old, new), encoding="utf-8")

# Progress.tsx
c = pathlib.Path("src/features/progress/Progress.tsx").read_text(encoding="utf-8")
c = c.replace("localRepo.getWeightLogs()", "localRepo.getWeightLogs(useAuthStore.getState().user?.id || '')")
pathlib.Path("src/features/progress/Progress.tsx").write_text(c, encoding="utf-8")

# useAppStore.ts
c = pathlib.Path("src/stores/useAppStore.ts").read_text(encoding="utf-8")
c = c.replace("localRepo.getSessionSets(setLog.sessionId)", "localRepo.getSessionSets(get().profile?.user_id || '', setLog.sessionId)")
c = c.replace("const rec: Recommendation = {", "const rec: Recommendation = { ...createBaseEntity(get().profile?.user_id || ''),")
c = c.replace("...createBaseEntity(get().profile?.user_id || ''),\n      ...rec,", "...createBaseEntity(get().profile?.user_id || ''),\n      ...rec") # Fix duplicate createBaseEntity injected before
pathlib.Path("src/stores/useAppStore.ts").write_text(c, encoding="utf-8")

# CalendarView.tsx
c = pathlib.Path("src/features/calendar/CalendarView.tsx").read_text(encoding="utf-8")
c = c.replace("const data = await localRepo.getLogsForDate(date);", "const data = await localRepo.getLogsForDate(useAuthStore.getState().user?.id || '', date);")
c = c.replace("const bath: BathLog = {\n      id: crypto.randomUUID(),", "const bath: BathLog = {\n      ...createBaseEntity(useAuthStore.getState().user?.id || ''),")
c = c.replace("const reset: NoFapReset = {\n      id: crypto.randomUUID(),", "const reset: NoFapReset = {\n      ...createBaseEntity(useAuthStore.getState().user?.id || ''),")
if "import { useAuthStore } from '../../stores/useAuthStore';" not in c:
    c = c.replace("import { useAppStore } from '../../stores/useAppStore';", "import { useAuthStore } from '../../stores/useAuthStore';\nimport { useAppStore } from '../../stores/useAppStore';")
pathlib.Path("src/features/calendar/CalendarView.tsx").write_text(c, encoding="utf-8")

# TasksWidget.tsx
c = pathlib.Path("src/features/tasks/TasksWidget.tsx").read_text(encoding="utf-8")
c = c.replace("generateDailyTasks(todayStr)", "generateDailyTasks(useAuthStore.getState().user?.id || '', todayStr)")
pathlib.Path("src/features/tasks/TasksWidget.tsx").write_text(c, encoding="utf-8")

# generator.test.ts (workout)
p("src/domain/workout/generator.test.ts", "generateWorkoutPlan(3", "generateWorkoutPlan('test', 3")
p("src/domain/workout/generator.test.ts", "generateWorkoutPlan(5", "generateWorkoutPlan('test', 5")

# tasks.test.ts
p("src/domain/tasks/tasks.test.ts", "generateDailyTasks(today)", "generateDailyTasks('test', today)")

# summaries.test.ts
p("src/domain/progress/summaries.test.ts", "generateWeeklySummary(d)", "generateWeeklySummary('test', d.getTime())")

# challenges.test.ts
p("src/domain/challenges/challenges.test.ts", "evaluateChallengeRequirements(challenge", "evaluateChallengeRequirements('test', challenge")
p("src/domain/challenges/challenges.test.ts", "evaluateChallenge(challenge.id)", "evaluateChallenge('test', challenge.id)")

# recommendations.test.ts
c = pathlib.Path("src/domain/recommendations/recommendations.test.ts").read_text(encoding="utf-8")
c = c.replace("const rec1: Recommendation = {", "const rec1: Recommendation = { user_id: 'test', created_at: Date.now(), updated_at: Date.now(), privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false,")
pathlib.Path("src/domain/recommendations/recommendations.test.ts").write_text(c, encoding="utf-8")

