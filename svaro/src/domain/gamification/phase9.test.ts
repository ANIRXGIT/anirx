import { describe, it, expect } from 'vitest';
import { GamificationEngine } from './GamificationEngine';

describe('Phase 9 Gamification', () => {
  
  it('Calculates correct level curve', () => {
    // Level 1 = 0 XP
    // Level 2 = 100 XP
    // Level 3 = 400 XP
    // Level 4 = 900 XP
    
    expect(GamificationEngine.getLevelForXP(0)).toBe(1);
    expect(GamificationEngine.getLevelForXP(100)).toBe(2);
    expect(GamificationEngine.getLevelForXP(400)).toBe(3);
    expect(GamificationEngine.getLevelForXP(900)).toBe(4);
    
    expect(GamificationEngine.getXPForLevel(1)).toBe(0);
    expect(GamificationEngine.getXPForLevel(2)).toBe(100);
    expect(GamificationEngine.getXPForLevel(3)).toBe(400);
    expect(GamificationEngine.getXPForLevel(4)).toBe(900);
  });
  
  it('Calculates progress to next level', () => {
    // Current XP = 250 (Level 2).
    // Base Level 2 = 100 XP.
    // Next Level (3) = 400 XP.
    // Into level = 150. Required = 300. Progress = 50%.
    const progress = GamificationEngine.getProgressToNextLevel(250);
    expect(progress.currentLevel).toBe(2);
    expect(progress.nextLevelXP).toBe(400);
    expect(progress.progressPct).toBe(50);
  });

});
