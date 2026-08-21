import pathlib
c = pathlib.Path("src/db/repositories/LocalRepository.ts").read_text(encoding="utf-8")
if "claimLegacyData" not in c:
    claiming_method = """
  async claimLegacyData(userId: string): Promise<void> {
    const LEGACY_ID = "LEGACY_LOCAL_USER";
    const userTables = [
      "profiles", "goals", "nutrition_targets", "workout_templates", 
      "workout_sessions", "set_logs", "food_logs", "weight_logs",
      "water_logs", "step_logs", "sleep_logs", "daily_tasks",
      "task_templates", "challenges", "supplements", "supplement_logs",
      "bath_logs", "nofap_resets", "habits", "habit_logs",
      "recommendations", "measurement_logs", "progress_photos",
      "weekly_summaries", "monthly_summaries", "notification_rules"
    ];
    for (const tableName of userTables) {
      await db.table(tableName).where('user_id').equals(LEGACY_ID).modify({ user_id: userId });
    }
    await db.table("foods").where('user_id').equals(LEGACY_ID).modify({ user_id: userId });
  }
"""
    c = c.replace("export class LocalRepository {", "export class LocalRepository {" + claiming_method)
    pathlib.Path("src/db/repositories/LocalRepository.ts").write_text(c, encoding="utf-8")

a = pathlib.Path("src/stores/useAuthStore.ts").read_text(encoding="utf-8")
if "claimLegacyData" not in a:
    a = a.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { localRepo } from '../db/repositories/LocalRepository';")
    a = a.replace("set({ session, user: session?.user ?? null, isOwner, isLoading: false });", "if (session?.user) { await localRepo.claimLegacyData(session.user.id); }\n      set({ session, user: session?.user ?? null, isOwner, isLoading: false });")
    a = a.replace("set({ session, user: session?.user ?? null, isOwner });", "if (session?.user) { await localRepo.claimLegacyData(session.user.id); }\n          set({ session, user: session?.user ?? null, isOwner });")
    pathlib.Path("src/stores/useAuthStore.ts").write_text(a, encoding="utf-8")
