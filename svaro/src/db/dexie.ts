import Dexie, { type Table } from 'dexie';
import type { BaseEntity } from '../domain/core/BaseEntity';

export interface Profile extends BaseEntity {
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
  trainingExperience: 'beginner' | 'intermediate' | 'advanced';
  trainingDays: number;
  gymEquipment: 'full_gym' | 'home_gym' | 'dumbbells_only' | 'bodyweight';
  physicalLimitations: string[];
  dietaryRestrictions: string[];
  transformationDurationDays: number;
  transformationStartDate?: number;
  pin?: string;
}

export interface Goal extends BaseEntity {
  type: string;
  priority: number;
  targetValue?: number;
  unit?: string;
  startDate?: number;
  endDate?: number;
  status?: string;
  domain?: string;
}

export interface NutritionTarget extends BaseEntity {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  active: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  youtubeUrl?: string;
}

export interface WorkoutTemplate extends BaseEntity {
  name: string;
  splitType: string;
  exercises: { exerciseId: string; sets: number; reps: string; restSeconds: number }[];
  active: boolean;
}

export interface WorkoutSession extends BaseEntity {
  templateId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  completed: boolean;
}

export interface SetLog extends BaseEntity {
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number;
  rir?: number;
  completed: boolean;
  notes?: string;
}

export interface Food extends Partial<BaseEntity> {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: 'system' | 'user';
  created_at: number;
}

export interface FoodLog extends BaseEntity {
  foodId: string;
  name: string;
  amount: number;
  servingUnit?: string;
  mealType?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  timestamp: number;
}

export interface WeightLog extends BaseEntity {
  weightKg: number;
  timestamp: number;
}

export interface WaterLog extends BaseEntity {
  amountMl: number;
  timestamp: number;
}

export interface StepLog extends BaseEntity {
  steps: number;
  timestamp: number;
}

export interface TaskTemplate extends BaseEntity {
  title: string;
  description?: string;
  category: string;
  frequency: string;
  target?: string;
  active: boolean;
}

export interface DailyTask extends BaseEntity {
  templateId?: string;
  title: string;
  description?: string;
  category: string;
  source: 'system' | 'user';
  completed: boolean;
  status: 'pending' | 'completed' | 'skipped' | 'overdue';
  priority: number;
  dueDate?: number;
  timestamp: number;
  notes?: string;
  linkedEntityId?: string;
  linkedDomain?: string;
}

export interface ChallengeRequirement {
  type: string;
  target: number;
}

export interface Challenge extends BaseEntity {
  name: string;
  goal?: string;
  startDate: number;
  endDate: number;
  requirements: ChallengeRequirement[];
  thresholdPercentage: number;
  status: 'upcoming' | 'active' | 'completed' | 'failed' | 'cancelled';
}

export interface NotificationRule extends BaseEntity {
  type: string;
  enabled: boolean;
  time: string;
  days: number[];
  frequency: string;
  referenceId?: string;
}

export interface MeasurementLog extends BaseEntity {
  timestamp: number;
  type: 'neck' | 'shoulders' | 'chest' | 'waist' | 'arms' | 'hips' | 'thighs' | 'calves' | 'custom';
  customName?: string;
  value: number;
  unit: string;
  notes?: string;
}

export interface ProgressPhoto extends BaseEntity {
  timestamp: number;
  category: 'front' | 'side' | 'back';
  weight?: number;
  day_of_transformation?: number;
  notes?: string;
  storage_path?: string;
  imageData: string;
}

export interface WeeklySummary extends BaseEntity {
  timestamp: number;
  weekStartDate: number;
  weightChange: number;
  workoutCompletionPct: number;
  avgCalories: number;
  proteinAdherencePct: number;
  avgSteps: number;
  avgSleep: number;
  avgWater: number;
  taskCompletionPct: number;
  challengeProgressPct: number;
  progressScore: number;
}

export interface MonthlySummary extends BaseEntity {
  timestamp: number;
  monthStartDate: number;
  startingWeight: number;
  currentWeight: number;
  weightChange: number;
  measurementChanges: Record<string, number>;
  workoutCompletionPct: number;
  strengthChanges: Record<string, number>;
  avgCalories: number;
  proteinAdherencePct: number;
  avgSteps: number;
  avgSleep: number;
  taskCompletionPct: number;
  whatImproved: string;
  whatStalled: string;
  whatShouldChange: string;
}

export interface Recommendation extends BaseEntity {
  ruleId: string;
  contextDate: string;
  priority: number;
  type: 'workout' | 'nutrition' | 'lifestyle' | 'data' | 'study' | 'career' | 'projects' | 'finance';
  title: string;
  what: string;
  why: string;
  action: string;
  status: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'completed' | 'expired';
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionType?: 'CREATE_TASK' | 'NAVIGATE' | 'NONE';
  actionPayload?: any;
  confidence?: number;
  source?: 'DETERMINISTIC' | 'AI';
  expiresAt?: number;
}

export interface SleepLog extends BaseEntity {
  durationMinutes: number;
  quality: number;
  timestamp: number;
}

export interface Supplement extends BaseEntity {
  name: string;
  dose: string;
  unit: string;
  frequency: string;
  timeOfDay: string;
  active: boolean;
}

export interface SupplementLog extends BaseEntity {
  name: string;
  amount: number;
  timestamp: number;
}

export interface BathLog extends BaseEntity {
  durationMinutes: number;
  notes?: string;
  timestamp: number;
}

export interface NoFapReset extends BaseEntity {
  timestamp: number;
  notes?: string;
}

export interface Habit extends BaseEntity {
  name: string;
  description?: string;
  category: string;
  trackingType: 'boolean' | 'numeric' | 'timer';
  unit?: string;
  target: number;
  frequency: string;
  active: boolean;
  showOnCalendar: boolean;
  showOnDashboard: boolean;
  startDate?: number;
  endDate?: number;
}

export interface HabitLog extends BaseEntity {
  habitId: string;
  value: number;
  completed: boolean;
  status?: 'completed' | 'skipped' | 'failed';
  notes?: string;
  timestamp: number;
}

export interface SyncQueueItem {
  id: string; // uuid
  user_id: string;
  mutation_id: string; // uuid
  type: 'ENTITY_MUTATION' | 'MEDIA_UPLOAD' | 'MEDIA_DELETE';
  entity_type: string;
  entity_id: string;
  payload: any;
  created_at: number;
  retry_count: number;
}

export interface SyncCursor {
  table_name: string;
  user_id: string;
  last_change_sequence: number;
}

export interface LocalMedia {
  id: string; // uuid
  user_id: string;
  blob: Blob;
  mime_type: string;
  created_at: number;
}

export interface AppConfig {
  id: string;
  cloudSyncEnabled: boolean;
  theme: string;
  completionThreshold: number;
  noFapStartDate?: number;
}


// Phase 7 Domains
export interface StudySubject extends BaseEntity {
  name: string;
  color?: string;
}

export interface StudySession extends BaseEntity {
  subjectId?: string;
  startTime: number;
  endTime?: number;
  durationMinutes?: number;
  notes?: string;
}

export interface Exam extends BaseEntity {
  subjectId?: string;
  title: string;
  dateTime: number;
  location?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Assignment extends BaseEntity {
  subjectId?: string;
  title: string;
  dueDate: number;
  priority: number;
  status: 'pending' | 'completed' | 'overdue';
}

export interface CareerSkill extends BaseEntity {
  name: string;
  category?: string;
  currentLevel: number;
  targetLevel?: number;
  notes?: string;
}

export interface CareerApplication extends BaseEntity {
  company: string;
  role: string;
  applicationDate?: number;
  status: 'TARGET' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
  source?: string;
  notes?: string;
  nextAction?: string;
  deadline?: number;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  priority: number;
  deadline?: number;
}

export interface ProjectMilestone extends BaseEntity {
  projectId?: string;
  title: string;
  deadline?: number;
  completed: boolean;
}

export interface FinanceAccount extends BaseEntity {
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export interface FinanceTransaction extends BaseEntity {
  accountId?: string;
  targetAccountId?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category?: string;
  date: number;
  description?: string;
  isRecurring?: boolean;
}

export interface FinanceBudget extends BaseEntity {
  category: string;
  amount: number;
  period: string;
}


export interface GamificationTransaction extends BaseEntity {
  currency_type: 'XP' | 'CREDIT';
  amount: number;
  idempotency_key: string;
  description: string;
}

export interface UserBadge extends BaseEntity {
  badge_id: string;
  earned_at: number;
  idempotency_key: string;
}

export interface UserGamificationProfile extends BaseEntity {
  total_xp: number;
  total_credits: number;
  current_level: number;
}


export interface SystemConfig {
  key: string;
  value: any;
  updated_at: number;
  updated_by: string;
}

export interface FeatureFlag {
  flag: string;
  enabled: boolean;
  updated_at: number;
  updated_by: string;
}

export interface TaskDefinition extends BaseEntity {
  title: string;
  time?: string;
  duration?: number;
  repeatPattern: 'daily' | 'weekly' | 'weekdays' | 'weekends';
  startDate: string;
  endDate?: string;
}

export interface TaskState extends BaseEntity {
  taskId: string;
  date: string;
  status: 'DONE' | 'NOT DONE' | 'SKIPPED';
}

export class SvaroDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  goals!: Table<Goal, string>;
  nutrition_targets!: Table<NutritionTarget, string>;
  config!: Table<AppConfig, string>;
  sync_queue!: Table<SyncQueueItem, string>;
  sync_cursors!: Table<SyncCursor, [string, string]>;
  local_media!: Table<LocalMedia, string>;

  task_definitions!: Table<TaskDefinition, string>;
  task_states!: Table<TaskState, string>;

  exercises!: Table<Exercise, string>;
  workout_templates!: Table<WorkoutTemplate, string>;
  workout_sessions!: Table<WorkoutSession, string>;
  set_logs!: Table<SetLog, string>;
  foods!: Table<Food, string>;
  food_logs!: Table<FoodLog, string>;
  weight_logs!: Table<WeightLog, string>;
  water_logs!: Table<WaterLog, string>;
  step_logs!: Table<StepLog, string>;
  sleep_logs!: Table<SleepLog, string>;
  daily_tasks!: Table<DailyTask, string>;
  task_templates!: Table<TaskTemplate, string>;
  challenges!: Table<Challenge, string>;
  notification_rules!: Table<NotificationRule, string>;
  supplements!: Table<Supplement, string>;
  supplement_logs!: Table<SupplementLog, string>;
  bath_logs!: Table<BathLog, string>;
  nofap_resets!: Table<NoFapReset, string>;
  habits!: Table<Habit, string>;
  habit_logs!: Table<HabitLog, string>;
  recommendations!: Table<Recommendation, string>;
  gamification_transactions!: Table<GamificationTransaction, string>;
  user_badges!: Table<UserBadge, string>;
  user_gamification_profile!: Table<UserGamificationProfile, string>;
  system_config!: Table<SystemConfig, string>;
  feature_flags!: Table<FeatureFlag, string>;


  measurement_logs!: Table<MeasurementLog, string>;
  progress_photos!: Table<ProgressPhoto, string>;
  weekly_summaries!: Table<WeeklySummary, string>;
  monthly_summaries!: Table<MonthlySummary, string>;
  study_subjects!: Table<StudySubject, string>;
  study_sessions!: Table<StudySession, string>;
  exams!: Table<Exam, string>;
  assignments!: Table<Assignment, string>;
  career_skills!: Table<CareerSkill, string>;
  career_applications!: Table<CareerApplication, string>;
  projects!: Table<Project, string>;
  project_milestones!: Table<ProjectMilestone, string>;
  finance_accounts!: Table<FinanceAccount, string>;
  finance_transactions!: Table<FinanceTransaction, string>;
  finance_budgets!: Table<FinanceBudget, string>;


  constructor() {
    super("SvaroDB");
    
    this.version(10).stores({
      profiles: "id",
      goals: "id",
      nutrition_targets: "id",
      exercises: "id",
      workout_templates: "id",
      workout_sessions: "id, startTime",
      set_logs: "id, sessionId",
      foods: "id",
      food_logs: "id, timestamp",
      weight_logs: "id, timestamp",
      water_logs: "id, timestamp",
      step_logs: "id, timestamp",
      sleep_logs: "id, timestamp",
      daily_tasks: "id, timestamp",
      task_templates: "id",
      challenges: "id",
      supplements: "id",
      supplement_logs: "id, timestamp",
      bath_logs: "id, timestamp",
      nofap_resets: "id, timestamp",
      habits: "id",
      habit_logs: "id, timestamp",
      recommendations: "id",
      measurement_logs: "id, timestamp",
      progress_photos: "id, timestamp",
      weekly_summaries: "weekStartDate",
      monthly_summaries: "monthStartDate",
      notification_rules: "id"
    });

    this.version(14).stores({
      study_subjects: "id, user_id",
      study_sessions: "id, user_id, [user_id+startTime]",
      exams: "id, user_id, [user_id+dateTime]",
      assignments: "id, user_id, [user_id+dueDate]",
      career_skills: "id, user_id",
      career_applications: "id, user_id, [user_id+status]",
      projects: "id, user_id, [user_id+status]",
      project_milestones: "id, user_id, [user_id+projectId]",
      finance_accounts: "id, user_id",
      finance_transactions: "id, user_id, [user_id+date], [user_id+accountId]",
      finance_budgets: "id, user_id"
    });
    this.version(15).stores({
      study_subjects: "id, user_id",
      study_sessions: "id, user_id, [user_id+startTime]",
      exams: "id, user_id, [user_id+dateTime]",
      assignments: "id, user_id, [user_id+dueDate]",
      career_skills: "id, user_id",
      career_applications: "id, user_id, [user_id+status]",
      projects: "id, user_id, [user_id+status]",
      project_milestones: "id, user_id, [user_id+projectId]",
      finance_accounts: "id, user_id",
      finance_transactions: "id, user_id, [user_id+date], [user_id+accountId]",
      finance_budgets: "id, user_id",
      recommendations: "id, user_id, [user_id+contextDate]"
    }).upgrade(async trans => {
      await trans.table('recommendations').toCollection().modify(rec => {
        if (!rec.source) rec.source = 'DETERMINISTIC';
        if (!rec.actionType) rec.actionType = 'NONE';
      });
    });

    this.version(16).stores({
      task_definitions: "id, user_id",
      task_states: "id, user_id, [user_id+date], taskId"
    });

    this.version(11).stores({
      profiles: "id, user_id",
      goals: "id, user_id",
      nutrition_targets: "id, user_id",
      exercises: "id",
      workout_templates: "id, user_id",
      workout_sessions: "id, user_id, [user_id+startTime]",
      set_logs: "id, user_id, [user_id+sessionId]",
      foods: "id, user_id",
      food_logs: "id, user_id, [user_id+timestamp]",
      weight_logs: "id, user_id, [user_id+timestamp]",
      water_logs: "id, user_id, [user_id+timestamp]",
      step_logs: "id, user_id, [user_id+timestamp]",
      sleep_logs: "id, user_id, [user_id+timestamp]",
      daily_tasks: "id, user_id, [user_id+timestamp]",
      task_templates: "id, user_id",
      challenges: "id, user_id",
      supplements: "id, user_id",
      supplement_logs: "id, user_id, [user_id+timestamp]",
      bath_logs: "id, user_id, [user_id+timestamp]",
      nofap_resets: "id, user_id, [user_id+timestamp]",
      habits: "id, user_id",
      habit_logs: "id, user_id, [user_id+timestamp]",
      recommendations: "id, user_id, [user_id+status]",
      measurement_logs: "id, user_id, [user_id+timestamp]",
      progress_photos: "id, user_id, [user_id+timestamp]",
      weekly_summaries: "id, user_id, [user_id+weekStartDate]",
      monthly_summaries: "id, user_id, [user_id+monthStartDate]",
      notification_rules: "id, user_id",
      config: "id"
    }).upgrade(async trans => {
      const LEGACY_ID = "LEGACY_LOCAL_USER";
      const now = Date.now();
      
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
        await trans.table(tableName).toCollection().modify((r: any) => {
           if (!r.user_id) r.user_id = LEGACY_ID;
           if (!r.created_at) r.created_at = r.timestamp || r.startTime || now;
           if (!r.updated_at) r.updated_at = r.timestamp || r.startTime || now;
           if (!r.privacy_level) r.privacy_level = "PRIVATE";
           if (!r.sync_state) r.sync_state = "PENDING";
           if (r.deleted === undefined) r.deleted = false;
        });
      }
      
      await trans.table("foods").toCollection().modify((r: any) => {
        if (r.source === "user") {
           if (!r.user_id) r.user_id = LEGACY_ID;
           if (!r.created_at) r.created_at = now;
           if (!r.updated_at) r.updated_at = now;
           if (!r.privacy_level) r.privacy_level = "PRIVATE";
           if (!r.sync_state) r.sync_state = "PENDING";
           if (r.deleted === undefined) r.deleted = false;
        }
      });
    });

    this.version(12).stores({
      sync_queue: 'id, user_id, [user_id+type]',
      sync_cursors: '[table_name+user_id]',
      local_media: 'id, user_id'
    });

    this.version(13).stores({
      habits: "id, user_id, [user_id+active]",
      daily_tasks: "id, user_id, [user_id+status], [user_id+dueDate]",
      habit_logs: "id, user_id, [user_id+habitId+timestamp]"
    }).upgrade(async trans => {
      // Safely migrate existing data
      await trans.table('daily_tasks').toCollection().modify((task) => {
        if (!task.status) {
          task.status = task.completed ? 'completed' : 'pending';
        }
        if (task.priority === undefined) {
          task.priority = 0;
        }
      });
      await trans.table('habit_logs').toCollection().modify((log) => {
        if (!log.status) {
          log.status = 'completed';
        }
        if (log.completed === undefined) {
          log.completed = true;
        }
      });
    });
  }
}

export const db = new SvaroDatabase();
import { registerSyncHooks } from '../sync/SyncHook';
registerSyncHooks();
