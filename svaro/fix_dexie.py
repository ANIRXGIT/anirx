import pathlib
c = pathlib.Path('src/db/dexie.ts').read_text(encoding='utf-8')

# Ensure BaseEntity is extended for appropriate models
replacements = {
    'export interface WorkoutTemplate {': 'export interface WorkoutTemplate extends BaseEntity {',
    'export interface Challenge {': 'export interface Challenge extends BaseEntity {',
    'export interface Recommendation {': 'export interface Recommendation extends BaseEntity {',
    'export interface WorkoutSession {': 'export interface WorkoutSession extends BaseEntity {',
    'export interface SetLog {': 'export interface SetLog extends BaseEntity {',
    'export interface FoodLog {': 'export interface FoodLog extends BaseEntity {',
    'export interface WeightLog {': 'export interface WeightLog extends BaseEntity {',
    'export interface WaterLog {': 'export interface WaterLog extends BaseEntity {',
    'export interface StepLog {': 'export interface StepLog extends BaseEntity {',
    'export interface TaskTemplate {': 'export interface TaskTemplate extends BaseEntity {',
    'export interface DailyTask {': 'export interface DailyTask extends BaseEntity {',
    'export interface NotificationRule {': 'export interface NotificationRule extends BaseEntity {',
    'export interface MeasurementLog {': 'export interface MeasurementLog extends BaseEntity {',
    'export interface ProgressPhoto {': 'export interface ProgressPhoto extends BaseEntity {',
    'export interface WeeklySummary {': 'export interface WeeklySummary extends BaseEntity {',
    'export interface MonthlySummary {': 'export interface MonthlySummary extends BaseEntity {',
    'export interface SleepLog {': 'export interface SleepLog extends BaseEntity {',
    'export interface Supplement {': 'export interface Supplement extends BaseEntity {',
    'export interface SupplementLog {': 'export interface SupplementLog extends BaseEntity {',
    'export interface BathLog {': 'export interface BathLog extends BaseEntity {',
    'export interface NoFapReset {': 'export interface NoFapReset extends BaseEntity {',
    'export interface Habit {': 'export interface Habit extends BaseEntity {',
    'export interface HabitLog {': 'export interface HabitLog extends BaseEntity {',
    'export interface Food {': 'export interface Food extends Partial<BaseEntity> {'
}

for k, v in replacements.items():
    if k in c and v not in c:
        c = c.replace(k, v)

# Clean up previously left fields that duplicate BaseEntity
c = c.replace('  id: string;\n', '')
# But some are necessary, so I'll write a script that does it properly. Wait, I shouldn't remove id globally!
