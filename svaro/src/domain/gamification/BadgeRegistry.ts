import { localRepo } from '../../db/repositories/LocalRepository';
import type { UserBadge } from '../../db/dexie';
import { v4 as uuidv4 } from 'uuid';
import { createBaseEntity } from '../core/BaseEntity';
import { GamificationEngine } from './GamificationEngine';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
  FIRST_WORKOUT: { id: 'FIRST_WORKOUT', name: 'First Blood', description: 'Completed your first workout.', icon: '💪' },
  STREAK_7: { id: 'STREAK_7', name: '7-Day Warrior', description: 'Maintained a 7-day habit streak.', icon: '🔥' },
  LEVEL_10: { id: 'LEVEL_10', name: 'Adept', description: 'Reached Level 10.', icon: '⭐' }
};

export class BadgeRegistry {
  
  static async evaluate(userId: string) {
    const existingBadges = await localRepo.getUserBadges(userId);
    const hasBadge = (id: string) => existingBadges.some(b => b.badge_id === id);

    const newBadges: UserBadge[] = [];

    // Rule: LEVEL_10
    if (!hasBadge('LEVEL_10')) {
      const profile = await localRepo.getGamificationProfile(userId);
      if (profile && profile.current_level >= 10) {
        newBadges.push(this.createBadge(userId, 'LEVEL_10', 'LEVEL_10'));
      }
    }

    // Rule: FIRST_WORKOUT
    if (!hasBadge('FIRST_WORKOUT')) {
      const workouts = await localRepo.getWorkoutSessions(userId);
      if (workouts.some((w: any) => w.completed)) {
        newBadges.push(this.createBadge(userId, 'FIRST_WORKOUT', 'FIRST_WORKOUT'));
      }
    }

    // Save
    for (const b of newBadges) {
      await localRepo.saveUserBadge(b);
      // Badges award 50 XP
      await GamificationEngine.awardXP(userId, 50, `BADGE:${b.badge_id}`, `Earned Badge: ${BADGES[b.badge_id]?.name}`);
    }
  }

  private static createBadge(userId: string, badgeId: string, idempotencyKey: string): UserBadge {
    return {
      ...createBaseEntity(userId),
      id: uuidv4(),
      badge_id: badgeId,
      earned_at: Date.now(),
      idempotency_key: idempotencyKey
    };
  }
}
