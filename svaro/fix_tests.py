import pathlib

p = pathlib.Path("src/domain/recommendations/recommendations.test.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("createdAt: Date.now()", "created_at: Date.now()")
p.write_text(c, encoding="utf-8")

p = pathlib.Path("src/domain/challenges/challenges.test.ts")
c = p.read_text(encoding="utf-8")
c = c.replace("const mockFoodLog: FoodLog = {", "const mockFoodLog: FoodLog = { user_id: 'test-user', created_at: Date.now(), updated_at: Date.now(), privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false,")
p.write_text(c, encoding="utf-8")

