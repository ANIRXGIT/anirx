import pathlib
import re

# challenges.test.ts
c = pathlib.Path("src/domain/challenges/challenges.test.ts").read_text(encoding="utf-8")
c = re.sub(r"evaluateChallengeRequirements\(([^,]+),\s*'([0-9-]+)'\)", r"evaluateChallengeRequirements('test-user', \1, '\2')", c)
pathlib.Path("src/domain/challenges/challenges.test.ts").write_text(c, encoding="utf-8")

# summaries.test.ts
c = pathlib.Path("src/domain/progress/summaries.test.ts").read_text(encoding="utf-8")
c = re.sub(r"generateWeeklySummary\(([^)]+)\)", r"generateWeeklySummary('test-user', \1.getTime())", c) # Wait, d.getTime() since weekStartDate is number
pathlib.Path("src/domain/progress/summaries.test.ts").write_text(c, encoding="utf-8")

# recommendations.test.ts
c = pathlib.Path("src/domain/recommendations/recommendations.test.ts").read_text(encoding="utf-8")
c = c.replace("const rec: Recommendation = {", "const rec: Recommendation = { user_id: 'test-user', created_at: Date.now(), updated_at: Date.now(), privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false,")
pathlib.Path("src/domain/recommendations/recommendations.test.ts").write_text(c, encoding="utf-8")

# tasks.test.ts
c = pathlib.Path("src/domain/tasks/tasks.test.ts").read_text(encoding="utf-8")
c = re.sub(r"generateDailyTasks\(([^)]+)\)", r"generateDailyTasks('test-user', \1)", c)
pathlib.Path("src/domain/tasks/tasks.test.ts").write_text(c, encoding="utf-8")

# generator.test.ts
c = pathlib.Path("src/domain/workout/generator.test.ts").read_text(encoding="utf-8")
c = re.sub(r"generateWorkoutPlan\((3|5),", r"generateWorkoutPlan('test-user', \1,", c)
pathlib.Path("src/domain/workout/generator.test.ts").write_text(c, encoding="utf-8")
