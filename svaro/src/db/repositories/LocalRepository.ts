import { db, type Profile, type Goal, type NutritionTarget, type Exercise, type WorkoutTemplate, type WorkoutSession, type Food, type FoodLog, type SetLog, type WeightLog, type WaterLog, type StepLog, type BathLog, type NoFapReset, type Recommendation, type MeasurementLog, type ProgressPhoto } from '../dexie';

export class LocalRepository {
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

  async getProfile(userId: string): Promise<Profile | undefined> {
    return db.profiles.filter(p => p.user_id === userId).first();
  }

  async saveProfile(profile: Profile): Promise<void> {
    await db.profiles.put(profile);
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return db.goals.filter(g => g.user_id === userId).toArray();
  }

  async saveGoal(goal: Goal): Promise<void> {
    await db.goals.put(goal);
  }
  
  async getActiveNutritionTarget(userId: string): Promise<NutritionTarget | undefined> {
    return db.nutrition_targets.filter(t => t.user_id === userId && t.active).first();
  }
  
  async saveNutritionTarget(target: NutritionTarget): Promise<void> {
    await db.nutrition_targets.put(target);
  }

  async seedExercises(exercises: Exercise[]): Promise<void> {
    const count = await db.exercises.count();
    if (count === 0) {
      await db.exercises.bulkAdd(exercises);
    }
  }

  async getExercises(): Promise<Exercise[]> {
    return db.exercises.toArray();
  }

  async saveExercise(exercise: Exercise): Promise<void> {
    await db.exercises.put(exercise);
  }

  async getActiveWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {
    return db.workout_templates.filter(t => t.user_id === userId && t.active).toArray();
  }

  async saveWorkoutTemplate(template: WorkoutTemplate): Promise<void> {
    await db.workout_templates.put(template);
  }

  async getTodayWorkoutSession(userId: string): Promise<WorkoutSession | undefined> {
    const today = new Date();
    today.setHours(0,0,0,0);
    return db.workout_sessions.where('[user_id+startTime]').between([userId, today.getTime()], [userId, Infinity]).first();
  }

  
  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    return db.workout_sessions.where('user_id').equals(userId).toArray();
  }

  async getWorkoutSessionsByDateRange(userId: string, startMs: number, endMs: number): Promise<WorkoutSession[]> {
    return db.workout_sessions.where('[user_id+startTime]').between([userId, startMs], [userId, endMs], true, true).toArray();
  }

  async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    await db.workout_sessions.put(session);
  }

  async saveSetLog(setLog: SetLog): Promise<void> {
    await db.set_logs.put(setLog);
  }

  async getSessionSets(userId: string, sessionId: string): Promise<SetLog[]> {
    return db.set_logs.where('[user_id+sessionId]').equals([userId, sessionId]).toArray();
  }

  async logWeight(weight: WeightLog): Promise<void> {
    await db.weight_logs.put(weight);
  }
  async deleteWeightLog(id: string): Promise<void> {
    await db.weight_logs.delete(id);
  }
  
  async logWater(water: WaterLog): Promise<void> {
    await db.water_logs.put(water);
  }
  async deleteWaterLog(id: string): Promise<void> {
    await db.water_logs.delete(id);
  }

  async logSteps(steps: StepLog): Promise<void> {
    await db.step_logs.put(steps);
  }
  async deleteStepLog(id: string): Promise<void> {
    await db.step_logs.delete(id);
  }

  async logSleep(sleep: any): Promise<void> {
    await db.sleep_logs.put(sleep);
  }
  async deleteSleepLog(id: string): Promise<void> {
    await db.sleep_logs.delete(id);
  }

  async logBath(bath: BathLog): Promise<void> {
    await db.bath_logs.put(bath);
  }

  async logNoFapReset(reset: NoFapReset): Promise<void> {
    await db.nofap_resets.put(reset);
  }

  async getRecommendations(userId: string): Promise<Recommendation[]> { return db.recommendations.where('user_id').equals(userId).toArray(); }
  
  async getActiveRecommendations(userId: string): Promise<Recommendation[]> {
    // Needs multi-field index or filter. Using filter for now since status isn't part of composite.
    return db.recommendations.filter(r => r.user_id === userId && ['pending', 'accepted', 'modified'].includes(r.status)).toArray();
  }
  
  async saveRecommendation(rec: Recommendation): Promise<void> {
    await db.recommendations.put(rec);
  }
  
  async bulkSaveRecommendations(recs: Recommendation[]): Promise<void> {
    await db.recommendations.bulkPut(recs);
  }

  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    return db.weight_logs.where('user_id').equals(userId).sortBy('timestamp');
  }

  async getMeasurementLogs(userId: string): Promise<MeasurementLog[]> {
    return db.measurement_logs.where('user_id').equals(userId).sortBy('timestamp');
  }

  async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
    return db.progress_photos.where('user_id').equals(userId).reverse().sortBy('timestamp');
  }

  async saveProgressPhoto(photo: ProgressPhoto): Promise<void> {
    await db.progress_photos.put(photo);
  }

  async getTodayWaterLogs(userId: string): Promise<WaterLog[]> {
    const today = new Date();
    today.setHours(0,0,0,0);
    return db.water_logs.where('[user_id+timestamp]').between([userId, today.getTime()], [userId, Infinity]).toArray();
  }

  async getLogsForDate(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    
    const [workouts, foods, waters, steps, baths, habitLogs, sleeps, weights] = await Promise.all([
      db.workout_sessions.where('[user_id+startTime]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.food_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.water_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.step_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.bath_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.habit_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.sleep_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
      db.weight_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray(),
    ]);
    
    return { workouts, foods, waters, steps, baths, habitLogs, sleeps, weights };
  }

  async getTodayStepLogs(userId: string): Promise<StepLog[]> {
    const today = new Date();
    today.setHours(0,0,0,0);
    return db.step_logs.where('[user_id+timestamp]').between([userId, today.getTime()], [userId, Infinity]).toArray();
  }

  async seedFoods(): Promise<void> {
    // We now proactively soft-delete legacy hardcoded system foods so they don't clutter the user's list.
    const systemFoods = await db.foods.filter(f => f.source === 'system' && !f.deleted).toArray();
    if (systemFoods.length > 0) {
      for (const f of systemFoods) {
        f.deleted = true;
        f.updated_at = Date.now();
      }
      await db.foods.bulkPut(systemFoods);
    }
  }

  async searchFoods(query: string): Promise<Food[]> {
    return db.foods.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).toArray();
  }

  async saveFoodLog(log: FoodLog): Promise<void> {
    await db.food_logs.put(log);
  }

  async getTodayFoodLogs(userId: string): Promise<FoodLog[]> {
    const today = new Date();
    today.setHours(0,0,0,0);
    return db.food_logs.where('[user_id+timestamp]').between([userId, today.getTime()], [userId, Infinity]).toArray();
  }

  async getFoodLogsForDate(userId: string, date: Date): Promise<FoodLog[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return db.food_logs.where('[user_id+timestamp]').between([userId, start.getTime()], [userId, end.getTime()], true, true).toArray();
  }

  async deleteFoodLog(id: string): Promise<void> {
    const log = await db.food_logs.get(id);
    if (log) {
      await db.food_logs.put({ ...log, deleted: true, updated_at: Date.now() });
    }
  }

  async saveFood(food: Food): Promise<void> {
    await db.foods.put(food);
  }

  async deleteFood(id: string): Promise<void> {
    await db.foods.delete(id);
  }

  async getUserFoods(userId: string): Promise<Food[]> {
    return db.foods.filter(f => f.source === 'user' && f.user_id === userId && !f.deleted).toArray();
  }

  // Tasks
  async getTasksForDate(userId: string, dateStr: string): Promise<any[]> {
    const d = new Date(dateStr);
    const start = new Date(d.setHours(0,0,0,0)).getTime();
    const end = new Date(d.setHours(23,59,59,999)).getTime();
    return db.daily_tasks.where('[user_id+timestamp]').between([userId, start], [userId, end], true, true).toArray();
  }

  async saveTask(task: any): Promise<void> {
    await db.daily_tasks.put(task);
  }

  async getTaskTemplates(userId: string): Promise<any[]> {
    return db.task_templates.where('user_id').equals(userId).toArray();
  }

  async saveTaskTemplate(template: any): Promise<void> {
    await db.task_templates.put(template);
  }

  // Challenges
  async getActiveChallenges(userId: string): Promise<any[]> {
    const now = Date.now();
    return db.challenges.filter(c => c.user_id === userId && c.status === 'active' && c.endDate >= now).toArray();
  }

  async getAllChallenges(userId: string): Promise<any[]> {
    return db.challenges.where('user_id').equals(userId).toArray();
  }

  async saveChallenge(challenge: any): Promise<void> {
    await db.challenges.put(challenge);
  }

  // Notification Rules
  async getNotificationRules(userId: string): Promise<any[]> {
    return db.notification_rules.where('user_id').equals(userId).toArray();
  }

  async saveNotificationRule(rule: any): Promise<void> {
    await db.notification_rules.put(rule);
  }

  // HABITS
  async getHabits(userId: string) {
    return db.habits.where('user_id').equals(userId).toArray();
  }
  async getHabitLogs(userId: string, habitId: string) {
    // Requires [user_id+habitId+timestamp] index in V13
    return db.habit_logs.where('[user_id+habitId+timestamp]').between([userId, habitId, 0], [userId, habitId, Date.now()]).toArray();
  }
  async getHabitLog(id: string) {
    return db.habit_logs.get(id);
  }
  async saveHabitLog(log: any) {
    await db.habit_logs.put(log);
  }
  async saveHabit(habit: any) {
    await db.habits.put(habit);
  }

  // STUDY
  async getStudySubjects(userId: string) { return db.study_subjects.where('user_id').equals(userId).toArray(); }
  async saveStudySubject(subject: any) { await db.study_subjects.put(subject); }
  async getStudySessions(userId: string) { return db.study_sessions.where('user_id').equals(userId).toArray(); }
  async saveStudySession(session: any) { await db.study_sessions.put(session); }
  
  // CAREER
  async getCareerSkills(userId: string) { return db.career_skills.where('user_id').equals(userId).toArray(); }
  async saveCareerSkill(skill: any) { await db.career_skills.put(skill); }
  async getCareerApplications(userId: string) { return db.career_applications.where('user_id').equals(userId).toArray(); }
  async saveCareerApplication(app: any) { await db.career_applications.put(app); }
  
  // PROJECTS
  async getProjects(userId: string) { return db.projects.where('user_id').equals(userId).toArray(); }
  async saveProject(project: any) { await db.projects.put(project); }
  async getProjectMilestones(userId: string, projectId: string) { return db.project_milestones.where('[user_id+projectId]').equals([userId, projectId]).toArray(); }
  async saveProjectMilestone(m: any) { await db.project_milestones.put(m); }
  
  // FINANCE
  async getFinanceAccounts(userId: string) { return db.finance_accounts.where('user_id').equals(userId).toArray(); }
  async saveFinanceAccount(acc: any) { await db.finance_accounts.put(acc); }
  async getFinanceTransactions(userId: string) { return db.finance_transactions.where('user_id').equals(userId).toArray(); }
  async saveFinanceTransaction(tx: any) { await db.finance_transactions.put(tx); }

  async getExams(userId: string) { return db.exams.where('user_id').equals(userId).toArray(); }
  async saveExam(exam: any) { await db.exams.put(exam); }
  
  async getFinanceBudgets(userId: string) { return db.finance_budgets.where('user_id').equals(userId).toArray(); }
  async saveFinanceBudget(budget: any) { await db.finance_budgets.put(budget); }
  

  // Gamification
  async getGamificationProfile(userId: string) {
    return db.user_gamification_profile.where('user_id').equals(userId).first();
  }
  async saveGamificationProfile(profile: any) {
    await db.user_gamification_profile.put(profile);
  }
  async getGamificationTransactions(userId: string) {
    return db.gamification_transactions.where('user_id').equals(userId).toArray();
  }
  async getGamificationTransactionByIdempotency(userId: string, key: string) {
    return db.gamification_transactions.where('[user_id+idempotency_key]').equals([userId, key]).first();
  }
  async saveGamificationTransaction(tx: any) {
    await db.gamification_transactions.put(tx);
  }
  async getUserBadges(userId: string) {
    return db.user_badges.where('user_id').equals(userId).toArray();
  }
  async saveUserBadge(badge: any) {
    await db.user_badges.put(badge);
  }

  // System Config
  async getSystemConfig(key: string) { return db.system_config.get(key); }
  async getAllSystemConfigs() { return db.system_config.toArray(); }
  async saveSystemConfig(config: any) { await db.system_config.put(config); }
  
  // Feature Flags
  async getFeatureFlag(flag: string) { return db.feature_flags.get(flag); }
  async getAllFeatureFlags() { return db.feature_flags.toArray(); }
  async saveFeatureFlag(flagObj: any) { await db.feature_flags.put(flagObj); }

  // Tasks (v16)
  async getTaskDefinitions(userId: string) {
    return db.task_definitions.where('user_id').equals(userId).filter(t => !t.deleted).toArray();
  }
  async saveTaskDefinition(task: any) {
    await db.task_definitions.put(task);
  }
  async getTaskStatesByDate(userId: string, date: string) {
    return db.task_states.where('[user_id+date]').equals([userId, date]).toArray();
  }
  async saveTaskState(state: any) {
    await db.task_states.put(state);
  }

  // Missing Wrappers
  async getSleepLogs(userId: string) { return db.sleep_logs.where('user_id').equals(userId).toArray(); }
  async getWaterLogs(userId: string) { return db.water_logs.where('user_id').equals(userId).toArray(); }
  async getFoods() { return db.foods.toArray(); }
  async getFoodLogs(userId: string) { return db.food_logs.where('user_id').equals(userId).toArray(); }
  
  get db() { return db; }
}

export const localRepo = new LocalRepository();
