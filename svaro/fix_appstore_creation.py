import pathlib
p = pathlib.Path("src/stores/useAppStore.ts")
c = p.read_text(encoding="utf-8")

c = c.replace("await localRepo.logWater({ id: crypto.randomUUID(), amountMl, timestamp: Date.now() });", 
"const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); await localRepo.logWater({ ...createBaseEntity(userId), amountMl, timestamp: Date.now() });")

c = c.replace("await localRepo.logSteps({ id: crypto.randomUUID(), steps, timestamp: Date.now() });", 
"const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); await localRepo.logSteps({ ...createBaseEntity(userId), steps, timestamp: Date.now() });")

c = c.replace("await localRepo.logWeight({ id: crypto.randomUUID(), weightKg, timestamp: Date.now() });", 
"const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); await localRepo.logWeight({ ...createBaseEntity(userId), weightKg, timestamp: Date.now() });")

c = c.replace("const reset: NoFapReset = { id: crypto.randomUUID(), timestamp: Date.now() };", 
"const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); const reset: NoFapReset = { ...createBaseEntity(userId), timestamp: Date.now() };")

c = c.replace("id: crypto.randomUUID(),\n      templateId,", "...createBaseEntity(get().profile?.user_id || ''),\n      templateId,")
c = c.replace("completed: false\n    };", "completed: false\n    }; if (!session.user_id) throw new Error('Unauthenticated');")

c = c.replace("id: crypto.randomUUID(),\n      sessionId:", "...createBaseEntity(get().profile?.user_id || ''),\n      sessionId:")
c = c.replace("completed: true,\n      created_at: Date.now()\n    };", "completed: true\n    }; if (!setLog.user_id) throw new Error('Unauthenticated');")

p.write_text(c, encoding="utf-8")
