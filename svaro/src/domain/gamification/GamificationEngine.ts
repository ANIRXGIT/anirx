import { localRepo } from '../../db/repositories/LocalRepository';
import type { GamificationTransaction, UserGamificationProfile } from '../../db/dexie';
import { v4 as uuidv4 } from 'uuid';
import { createBaseEntity } from '../core/BaseEntity';

export class GamificationEngine {
  
  /**
   * f(xp) = floor(sqrt(xp / 100)) + 1
   */
  static getLevelForXP(xp: number): number {
    if (xp < 0) return 1;
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  static getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 100;
  }

  static getProgressToNextLevel(xp: number): { currentLevel: number, currentXP: number, nextLevelXP: number, progressPct: number } {
    const currentLevel = this.getLevelForXP(xp);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    const currentLevelBaseXP = this.getXPForLevel(currentLevel);
    
    const xpIntoLevel = xp - currentLevelBaseXP;
    const xpRequiredForLevel = nextLevelXP - currentLevelBaseXP;
    
    return {
      currentLevel,
      currentXP: xp,
      nextLevelXP,
      progressPct: Math.round((xpIntoLevel / xpRequiredForLevel) * 100)
    };
  }

  static async awardXP(userId: string, amount: number, idempotencyKey: string, description: string) {
    // 1. Check idempotency
    const existing = await localRepo.getGamificationTransactionByIdempotency(userId, idempotencyKey);
    if (existing) {
      console.log(`[Gamification] Blocked duplicate XP for key: ${idempotencyKey}`);
      return;
    }

    // 2. Create Transaction
    const tx: GamificationTransaction = {
      ...createBaseEntity(userId),
      id: uuidv4(),
      currency_type: 'XP',
      amount,
      idempotency_key: idempotencyKey,
      description
    };
    await localRepo.saveGamificationTransaction(tx);

    // 3. Update Cache
    let profile: UserGamificationProfile | undefined = await localRepo.getGamificationProfile(userId);
    if (!profile) {
      profile = {
        ...createBaseEntity(userId),
        id: uuidv4(),
        total_xp: 0,
        total_credits: 0,
        current_level: 1
      } as unknown as UserGamificationProfile;
    }
    
    profile.total_xp += amount;
    const newLevel = this.getLevelForXP(profile.total_xp);
    
    // Level up reward
    if (newLevel > profile.current_level) {
      profile.current_level = newLevel;
      // Bonus credits on level up
      const creditReward = newLevel * 10;
      await this.awardCredits(userId, creditReward, `LEVEL_UP:${newLevel}`, `Level ${newLevel} Bonus`);
      profile.total_credits += creditReward;
    }
    
    await localRepo.saveGamificationProfile(profile);
  }

  static async awardCredits(userId: string, amount: number, idempotencyKey: string, description: string) {
    const existing = await localRepo.getGamificationTransactionByIdempotency(userId, idempotencyKey);
    if (existing) return;

    const tx: GamificationTransaction = {
      ...createBaseEntity(userId),
      id: uuidv4(),
      currency_type: 'CREDIT',
      amount,
      idempotency_key: idempotencyKey,
      description
    };
    await localRepo.saveGamificationTransaction(tx);
  }
}
