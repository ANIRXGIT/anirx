import pathlib
p = pathlib.Path("src/stores/useAppStore.ts")
c = p.read_text(encoding="utf-8")

c = c.replace("await localRepo.getSessionSets(todayWorkout.id)", "await localRepo.getSessionSets(userId, todayWorkout.id)")
c = c.replace("const recs = await localRepo.getActiveRecommendations();", "const userId = get().profile?.user_id; if (!userId) throw new Error('Unauthenticated'); const recs = await localRepo.getActiveRecommendations(userId);")
c = c.replace("const recs = await localRepo.getActiveRecommendations()", "const userId = get().profile?.user_id; if (!userId) throw new Error('Unauthenticated'); const recs = await localRepo.getActiveRecommendations(userId)")
c = c.replace("localRepo.getActiveRecommendations();", "localRepo.getActiveRecommendations(get().profile?.user_id || '');")

p.write_text(c, encoding="utf-8")
