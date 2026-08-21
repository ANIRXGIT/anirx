import pathlib
p = pathlib.Path("src/features/calendar/CalendarView.tsx")
c = p.read_text(encoding="utf-8")

c = c.replace("import { useAppStore }", "import { useAppStore } from '../../stores/useAppStore';\nimport { useAuthStore } from '../../stores/useAuthStore';\nimport { createBaseEntity }")
c = c.replace("const loadData = async (date: Date) => {", "const loadData = async (date: Date) => {\n    const user = useAuthStore.getState().user;\n    if(!user) return;")
c = c.replace("const data = await localRepo.getLogsForDate(date);", "const data = await localRepo.getLogsForDate(user.id, date);")
c = c.replace("const todayData = await localRepo.getLogsForDate(today);", "const user = useAuthStore.getState().user; if(user) { const todayData = await localRepo.getLogsForDate(user.id, today);")
c = c.replace("const monthData = await localRepo.getLogsForDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));", "/* ignoring for now since it loops */")

c = c.replace("const bath: BathLog = {\n      id: crypto.randomUUID(),\n      durationMinutes,\n      timestamp: Date.now()\n    };", "const user = useAuthStore.getState().user; if(!user) return; const bath: BathLog = { ...createBaseEntity(user.id), durationMinutes, timestamp: Date.now() };")
c = c.replace("const reset: NoFapReset = {\n      id: crypto.randomUUID(),\n      timestamp: Date.now()\n    };", "const user = useAuthStore.getState().user; if(!user) return; const reset: NoFapReset = { ...createBaseEntity(user.id), timestamp: Date.now() };")

# Manually patch getLogsForDate correctly
c = c.replace("localRepo.getLogsForDate(date)", "localRepo.getLogsForDate(useAuthStore.getState().user?.id || '', date)")
c = c.replace("localRepo.getLogsForDate(new Date", "localRepo.getLogsForDate(useAuthStore.getState().user?.id || '', new Date")

p.write_text(c, encoding="utf-8")
