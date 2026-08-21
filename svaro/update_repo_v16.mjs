import fs from 'fs';
let content = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

const injection = `
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
}
`;

content = content.replace(/}\s*export const localRepo = new LocalRepository\(\);/, injection + '\nexport const localRepo = new LocalRepository();');
fs.writeFileSync('src/db/repositories/LocalRepository.ts', content);
