import type { Exercise, WorkoutTemplate } from '../../db/dexie';
import { createBaseEntity } from '../core/BaseEntity';

export function generateWorkoutPlan(
  userId: string,
  daysPerWeek: number, 
  experience: 'beginner' | 'intermediate' | 'advanced',
  goalType: string,
  availableExercises: Exercise[]
): WorkoutTemplate[] {
  
  // This is a minimal deterministic generator for MVP.
  // It selects basic exercises from the database to form templates.
  
  const templates: WorkoutTemplate[] = [];
  
  const getExercisesByMuscle = (muscle: string, limit: number) => {
    return availableExercises.filter(e => e.primaryMuscle.toLowerCase().includes(muscle)).slice(0, limit);
  };
  
  const buildTemplate = (name: string, splitType: string, muscleGroups: string[]): WorkoutTemplate => {
    const templateExercises: any[] = [];
    muscleGroups.forEach(muscle => {
      const ex = getExercisesByMuscle(muscle, 1)[0];
      if (ex) {
        templateExercises.push({
          exerciseId: ex.id,
          sets: experience === 'beginner' ? 3 : 4,
          reps: goalType === 'strength' ? '4-6' : '8-12',
          restSeconds: goalType === 'strength' ? 180 : 90
        });
      }
    });
    
    return {
      ...createBaseEntity(userId),
      name,
      splitType,
      exercises: templateExercises,
      active: true,
      
    };
  };

  if (daysPerWeek <= 3) {
    templates.push(buildTemplate('Full Body A', 'full_body', ['chest', 'back', 'legs', 'shoulders']));
    templates.push(buildTemplate('Full Body B', 'full_body', ['back', 'legs', 'chest', 'arms']));
  } else if (daysPerWeek === 4) {
    templates.push(buildTemplate('Upper A', 'upper', ['chest', 'back', 'shoulders', 'arms']));
    templates.push(buildTemplate('Lower A', 'lower', ['legs', 'calves', 'core']));
    templates.push(buildTemplate('Upper B', 'upper', ['back', 'chest', 'shoulders', 'arms']));
    templates.push(buildTemplate('Lower B', 'lower', ['legs', 'calves', 'core']));
  } else {
    // 5 or 6 days: Push Pull Legs
    templates.push(buildTemplate('Push', 'push', ['chest', 'shoulders', 'triceps']));
    templates.push(buildTemplate('Pull', 'pull', ['back', 'biceps', 'rear_delts']));
    templates.push(buildTemplate('Legs', 'legs', ['quads', 'hamstrings', 'calves']));
  }

  return templates;
}
