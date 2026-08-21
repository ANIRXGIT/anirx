import fs from 'fs';
let repo = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

const injection = `
  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    return db.workout_sessions.where('user_id').equals(userId).toArray();
  }
`;

repo = repo.replace(/async saveWorkoutSession\(session: WorkoutSession\): Promise<void> \{/, injection + '\n  async saveWorkoutSession(session: WorkoutSession): Promise<void> {');

fs.writeFileSync('src/db/repositories/LocalRepository.ts', repo);

let reg = fs.readFileSync('src/domain/gamification/BadgeRegistry.ts', 'utf8');
reg = reg.replace(/getWorkouts/g, 'getWorkoutSessions');
fs.writeFileSync('src/domain/gamification/BadgeRegistry.ts', reg);

