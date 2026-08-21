import pathlib
p = pathlib.Path("src/stores/useAppStore.ts")
c = p.read_text(encoding="utf-8")

c = c.replace("await localRepo.getTodayFoodLogs(userId);", "await localRepo.getTodayFoodLogs(get().profile?.user_id || '');")
c = c.replace("await localRepo.getTodayStepLogs(userId);", "await localRepo.getTodayStepLogs(get().profile?.user_id || '');")

p.write_text(c, encoding="utf-8")
