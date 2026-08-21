import type { Exercise, Food } from './dexie';

export const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    primaryMuscle: 'chest',
    equipment: 'full_gym',
    difficulty: 'intermediate',
    instructions: 'Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Lower to your mid-chest, press up.',
  },
  {
    id: 'ex-squat',
    name: 'Barbell Back Squat',
    primaryMuscle: 'legs',
    equipment: 'full_gym',
    difficulty: 'intermediate',
    instructions: 'Rest the barbell on your upper back. Squat down until your thighs are parallel to the floor, then stand back up.',
  },
  {
    id: 'ex-deadlift',
    name: 'Barbell Deadlift',
    primaryMuscle: 'back',
    equipment: 'full_gym',
    difficulty: 'advanced',
    instructions: 'Stand with mid-foot under the bar. Hinge at hips, grip the bar, and pull it up while keeping your back straight.',
  },
  {
    id: 'ex-overhead-press',
    name: 'Overhead Press',
    primaryMuscle: 'shoulders',
    equipment: 'full_gym',
    difficulty: 'intermediate',
    instructions: 'Press the barbell from your shoulders overhead until your arms are fully extended.',
  },
  {
    id: 'ex-pullup',
    name: 'Pull-up',
    primaryMuscle: 'back',
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    instructions: 'Hang from a bar, pull yourself up until your chin clears the bar.',
  },
  {
    id: 'ex-pushup',
    name: 'Push-up',
    primaryMuscle: 'chest',
    equipment: 'bodyweight',
    difficulty: 'beginner',
    instructions: 'Start in a plank position, lower your body until your chest touches the floor, and push back up.',
  }
];

export const SEED_FOODS: Food[] = [];
