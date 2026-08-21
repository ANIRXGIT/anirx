import pathlib
import glob

# Progress.tsx
p = pathlib.Path("src/features/progress/Progress.tsx")
c = p.read_text(encoding="utf-8")
if "useAuthStore" not in c:
    c = c.replace("import { useAppStore", "import { useAuthStore } from '../../stores/useAuthStore';\nimport { useAppStore")
c = c.replace("await localRepo.getWeightLogs()", "await localRepo.getWeightLogs(useAuthStore.getState().user?.id || '')")
c = c.replace("await localRepo.getMeasurementLogs()", "await localRepo.getMeasurementLogs(useAuthStore.getState().user?.id || '')")
c = c.replace("await localRepo.getProgressPhotos()", "await localRepo.getProgressPhotos(useAuthStore.getState().user?.id || '')")
p.write_text(c, encoding="utf-8")

# ChallengesWidget.tsx
p = pathlib.Path("src/features/challenges/ChallengesWidget.tsx")
c = p.read_text(encoding="utf-8")
if "useAuthStore" not in c:
    c = c.replace("import { useState", "import { useAuthStore } from '../../stores/useAuthStore';\nimport { useState")
c = c.replace("await localRepo.getActiveChallenges()", "await localRepo.getActiveChallenges(useAuthStore.getState().user?.id || '')")
p.write_text(c, encoding="utf-8")

# NotificationsSettings.tsx
p = pathlib.Path("src/features/settings/NotificationsSettings.tsx")
c = p.read_text(encoding="utf-8")
if "useAuthStore" not in c:
    c = c.replace("import { useState", "import { useAuthStore } from '../../stores/useAuthStore';\nimport { useState")
c = c.replace("await localRepo.getNotificationRules()", "await localRepo.getNotificationRules(useAuthStore.getState().user?.id || '')")
p.write_text(c, encoding="utf-8")

# Nutrition.tsx
p = pathlib.Path("src/features/nutrition/Nutrition.tsx")
c = p.read_text(encoding="utf-8")
if "createBaseEntity" not in c:
    c = c.replace("import { useAppStore", "import { createBaseEntity } from '../../domain/core/BaseEntity';\nimport { useAuthStore } from '../../stores/useAuthStore';\nimport { useAppStore")
c = c.replace("id: crypto.randomUUID(),\n      foodId", "...createBaseEntity(useAuthStore.getState().user?.id || ''),\n      foodId")
p.write_text(c, encoding="utf-8")

# WorkoutSessionView.tsx
p = pathlib.Path("src/features/workout/WorkoutSessionView.tsx")
c = p.read_text(encoding="utf-8")
if "createBaseEntity" not in c:
    c = c.replace("import { useAppStore", "import { createBaseEntity } from '../../domain/core/BaseEntity';\nimport { useAuthStore } from '../../stores/useAuthStore';\nimport { useAppStore")
c = c.replace("id: crypto.randomUUID(),\n      sessionId", "...createBaseEntity(useAuthStore.getState().user?.id || ''),\n      sessionId")
c = c.replace("created_at: Date.now()", "")
p.write_text(c, encoding="utf-8")

