import pathlib
import re

# challenges.test.ts
c = pathlib.Path("src/domain/challenges/challenges.test.ts").read_text(encoding="utf-8")
c = c.replace("evaluateChallenge('c1')", "evaluateChallenge('test-user', 'c1')")
pathlib.Path("src/domain/challenges/challenges.test.ts").write_text(c, encoding="utf-8")

# recommendations.test.ts
c = pathlib.Path("src/domain/recommendations/recommendations.test.ts").read_text(encoding="utf-8")
c = c.replace("id: '1',", "id: '1', user_id: 'test-user', updated_at: 123, privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false,")
pathlib.Path("src/domain/recommendations/recommendations.test.ts").write_text(c, encoding="utf-8")

# summaries.test.ts
c = pathlib.Path("src/domain/progress/summaries.test.ts").read_text(encoding="utf-8")
c = c.replace("generateWeeklySummary('test-user', d.getTime())", "generateWeeklySummary('test-user', Date.now())")
c = c.replace("generateWeeklySummary('test-user', d.getTime().getTime())", "generateWeeklySummary('test-user', Date.now())")
c = re.sub(r"generateWeeklySummary\([^)]*\)", "generateWeeklySummary('test-user', Date.now())", c)
pathlib.Path("src/domain/progress/summaries.test.ts").write_text(c, encoding="utf-8")

# generator.test.ts
c = pathlib.Path("src/domain/workout/generator.test.ts").read_text(encoding="utf-8")
c = c.replace("generateWorkoutPlan(3, 'beginner'", "generateWorkoutPlan('test-user', 3, 'beginner'")
c = c.replace("generateWorkoutPlan(5, 'advanced'", "generateWorkoutPlan('test-user', 5, 'advanced'")
pathlib.Path("src/domain/workout/generator.test.ts").write_text(c, encoding="utf-8")
