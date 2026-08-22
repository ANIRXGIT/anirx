import { create } from 'zustand';
import { localRepo } from '../db/repositories/LocalRepository';
import { db, type Profile, type Goal, type NutritionTarget, type WorkoutTemplate, type WorkoutSession, type FoodLog, type SetLog, type NoFapReset, type Recommendation } from '../db/dexie';
import { createBaseEntity } from '../domain/core/BaseEntity';
import { calculateBMR, calculateTDEE, generateNutritionTarget } from '../domain/nutrition/calculator';
import { generateWorkoutPlan } from '../domain/workout/generator';
import { SEED_EXERCISES } from '../db/seed';

interface AppState {
  profile: Profile | null;
  goals: Goal[];
  nutritionTarget: NutritionTarget | null;
  workoutTemplates: WorkoutTemplate[];
  todayWorkout?: WorkoutSession;
  activeSessionSets: SetLog[];
  todayFoodLogs: FoodLog[];
  todayWater: number;
  todaySteps: number;
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  loadInitialData: (userId?: string) => Promise<void>;
  setProfileAndGeneratePlan: (profile: Profile, goalType: string) => Promise<void>;
  logFood: (log: FoodLog) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  logSteps: (steps: number) => Promise<void>;
  logWeight: (weightKg: number) => Promise<void>;
  logNoFapReset: () => Promise<void>;
  startWorkoutSession: (templateId: string, name: string) => Promise<void>;
  completeSet: (setLog: SetLog) => Promise<void>;
  finishWorkoutSession: () => Promise<void>;
  loadRecommendations: () => Promise<void>;
  updateRecommendationStatus: (id: string, status: Recommendation['status']) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  goals: [],
  nutritionTarget: null,
  workoutTemplates: [],
  activeSessionSets: [],
  todayFoodLogs: [],
  todayWater: 0,
  todaySteps: 0,
  recommendations: [],
  isLoading: true,
  error: null,
  
  loadInitialData: async (userId?: string) => {
    try {
      const isAlreadyLoaded = !!get().profile;
      if (!isAlreadyLoaded) {
        set({ isLoading: true });
      }
      await localRepo.seedExercises(SEED_EXERCISES);
      await localRepo.seedFoods();
      
      if (!userId) {
        set({ isLoading: false });
        return;
      }

      let profile = await localRepo.getProfile(userId);
      
      // Pull all data from cloud if missing locally (fresh device hydration)
      if (!profile) {
        const { SyncEngine } = await import('../sync/SyncEngine');
        await SyncEngine.runInitialSync(userId);
        
        // Re-check profile after pull
        profile = await localRepo.getProfile(userId);
      }

      const goals = await localRepo.getGoals(userId);
      const nutritionTarget = await localRepo.getActiveNutritionTarget(userId);
      const workoutTemplates = await localRepo.getActiveWorkoutTemplates(userId);
      const todayWorkout = await localRepo.getTodayWorkoutSession(userId);
      const todayFoodLogs = await localRepo.getTodayFoodLogs(userId);
      const todayWaterLogs = await localRepo.getTodayWaterLogs(userId);
      const todayStepLogs = await localRepo.getTodayStepLogs(userId);
      
      const todayWater = todayWaterLogs.reduce((sum, log) => sum + log.amountMl, 0);
      const todaySteps = todayStepLogs.reduce((sum, log) => sum + log.steps, 0);

      let activeSessionSets: SetLog[] = [];
      if (todayWorkout && !todayWorkout.completed) {
        activeSessionSets = await localRepo.getSessionSets(userId, todayWorkout.id);
      }
      
      set({ 
        profile: profile || null, 
        goals, 
        nutritionTarget: nutritionTarget || null, 
        workoutTemplates,
        todayWorkout,
        activeSessionSets,
        todayFoodLogs,
        todayWater,
        todaySteps,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setProfileAndGeneratePlan: async (profile, goalType) => {
    await localRepo.saveProfile(profile);
    const goal: Goal = {
      ...createBaseEntity(profile.user_id),
      type: goalType,
      priority: 1
    };
    await localRepo.saveGoal(goal);
    
    const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const macros = generateNutritionTarget(tdee, goalType, profile.weightKg);
    
    const nutritionTarget: NutritionTarget = {
      ...createBaseEntity(profile.user_id),
      ...macros,
      active: true
    };
    await localRepo.saveNutritionTarget(nutritionTarget);

    const allExercises = await localRepo.getExercises();
    const templates = generateWorkoutPlan(profile.user_id, profile.trainingDays, profile.trainingExperience, goalType, allExercises);
    for (const t of templates) {
      await localRepo.saveWorkoutTemplate(t);
    }

    set({ profile, goals: [goal], nutritionTarget, workoutTemplates: templates });
  },

  logFood: async (log) => {
    await localRepo.saveFoodLog(log);
    const logs = await localRepo.getTodayFoodLogs(get().profile?.user_id || '');
    set({ todayFoodLogs: logs });
  },

  logWater: async (amountMl) => {
    const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); 
    const { getLocalYYYYMMDD } = await import('../domain/calendar/dateUtils');
    const ds = getLocalYYYYMMDD(new Date());
    await localRepo.logWater({ ...createBaseEntity(userId), id: `${userId}_${ds}_water`, amountMl, timestamp: Date.now() });
    set(state => ({ todayWater: state.todayWater + amountMl }));
  },

  logSteps: async (steps) => {
    const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); 
    const { getLocalYYYYMMDD } = await import('../domain/calendar/dateUtils');
    const ds = getLocalYYYYMMDD(new Date());
    await localRepo.logSteps({ ...createBaseEntity(userId), id: `${userId}_${ds}_steps`, steps, timestamp: Date.now() });
    const logs = await localRepo.getTodayStepLogs(userId);
    set({ todaySteps: logs.reduce((acc, log) => acc + log.steps, 0) });
  },

  logWeight: async (weightKg) => {
    const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); 
    const { getLocalYYYYMMDD } = await import('../domain/calendar/dateUtils');
    const ds = getLocalYYYYMMDD(new Date());
    await localRepo.logWeight({ ...createBaseEntity(userId), id: `${userId}_${ds}_weight`, weightKg, timestamp: Date.now() });
    const currentProfile = get().profile;
    if (currentProfile && currentProfile.user_id) {
      const p = await localRepo.getProfile(currentProfile.user_id);
      if (p) {
        const updatedProfile = { ...p, weightKg, updated_at: Date.now() };
        await localRepo.saveProfile(updatedProfile);
        set({ profile: updatedProfile });
      }
    }
  },

  logNoFapReset: async () => {
    const userId = get().profile?.user_id; if(!userId) throw new Error('Unauthenticated'); const reset: NoFapReset = { ...createBaseEntity(userId), timestamp: Date.now() };
    await db.nofap_resets.put(reset);
    // state could be updated here to reflect immediately
  },

  startWorkoutSession: async (templateId, name) => {
    const session: WorkoutSession = {
      ...createBaseEntity(get().profile?.user_id || ''),
      templateId,
      name,
      startTime: Date.now(),
      completed: false
    }; if (!session.user_id) throw new Error('Unauthenticated');
    await localRepo.saveWorkoutSession(session);
    set({ todayWorkout: session, activeSessionSets: [] });
  },

  completeSet: async (setLog) => {
    await localRepo.saveSetLog(setLog);
    const sets = await localRepo.getSessionSets(get().profile?.user_id || '', setLog.sessionId);
    set({ activeSessionSets: sets });
  },

  finishWorkoutSession: async () => {
    set(state => {
      if (state.todayWorkout) {
        const finished = { ...state.todayWorkout, endTime: Date.now(), completed: true };
        localRepo.saveWorkoutSession(finished);
        return { todayWorkout: finished };
      }
      return state;
    });
  },

  loadRecommendations: async () => {
    const userId = get().profile?.user_id; if (!userId) throw new Error('Unauthenticated'); const recs = await localRepo.getActiveRecommendations(userId);
    // Sort by priority locally as well just to be safe
    set({ recommendations: recs.sort((a, b) => b.priority - a.priority) });
  },

  updateRecommendationStatus: async (id, status) => {
    const state = get();
    const rec = state.recommendations.find(r => r.id === id);
    if (rec) {
      const updated = { ...rec, status };
      await localRepo.saveRecommendation(updated);
      await get().loadRecommendations(); // reload to filter completed/dismissed from 'active' if needed
    }
  },

  refreshRecommendations: async () => {
    const userId = get().profile?.user_id;
    if (!userId) return;
    const { RecommendationEngine } = await import('../domain/recommendations/engine');
    await RecommendationEngine.runCycle(userId);
  }
}));