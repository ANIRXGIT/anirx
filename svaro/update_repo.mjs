import fs from 'fs';
let content = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

const injection = `
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
}
`;

content = content.replace(/}\s*export const localRepo = new LocalRepository\(\);/, injection + '\nexport const localRepo = new LocalRepository();');
fs.writeFileSync('src/db/repositories/LocalRepository.ts', content);
