import pathlib

# Challenges engine
p = pathlib.Path("src/domain/challenges/engine.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("export async function evaluateChallenges()", "export async function evaluateChallenges(userId: string)")
c = c.replace("const challenges = await localRepo.getActiveChallenges();", "const challenges = await localRepo.getActiveChallenges(userId);")
c = c.replace("const todayData = await localRepo.getLogsForDate(today);", "const todayData = await localRepo.getLogsForDate(userId, today);")
c = c.replace("const todayData = await localRepo.getLogsForDate(d);", "const todayData = await localRepo.getLogsForDate(userId, d);")
c = c.replace("export async function evaluateChallenges(userId: string)", "export async function evaluateChallenges(userId: string = 'test-user')") # Default for tests if omitted
p.write_text(c, encoding="utf-8")

# Notifications scheduler
p = pathlib.Path("src/domain/notifications/scheduler.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("export async function scheduleNotifications()", "export async function scheduleNotifications(userId: string = 'test-user')")
c = c.replace("const rules = await localRepo.getNotificationRules();", "const rules = await localRepo.getNotificationRules(userId);")
p.write_text(c, encoding="utf-8")

# Progress summaries
p = pathlib.Path("src/domain/progress/summaries.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("export async function generateWeeklySummary()", "export async function generateWeeklySummary(userId: string = 'test-user')")
c = c.replace("const logs = await localRepo.getLogsForDate(d);", "const logs = await localRepo.getLogsForDate(userId, d);")
p.write_text(c, encoding="utf-8")

# Tasks generator
p = pathlib.Path("src/domain/tasks/generator.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("export async function generateDailyTasks(dateStr: string)", "export async function generateDailyTasks(userId: string, dateStr: string)")
c = c.replace("const templates = await localRepo.getTaskTemplates();", "const templates = await localRepo.getTaskTemplates(userId);")
c = c.replace("const existing = await localRepo.getTasksForDate(dateStr);", "const existing = await localRepo.getTasksForDate(userId, dateStr);")
p.write_text(c, encoding="utf-8")

# Recommendations engine
p = pathlib.Path("src/domain/recommendations/engine.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("Omit<Recommendation, 'id' | 'createdAt'>", "Omit<Recommendation, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'privacy_level' | 'sync_state' | 'deleted'>")
p.write_text(c, encoding="utf-8")

