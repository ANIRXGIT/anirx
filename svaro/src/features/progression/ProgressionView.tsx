import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import { GamificationEngine } from '../../domain/gamification/GamificationEngine';
import { BadgeRegistry, BADGES } from '../../domain/gamification/BadgeRegistry';
import type { UserGamificationProfile, UserBadge } from '../../db/dexie';

export default function ProgressionView() {
  const userId = useAuthStore(state => state.user?.id);
  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    if (!userId) return;
    
    // Evaluate badges in background on mount
    BadgeRegistry.evaluate(userId).then(() => {
      localRepo.getGamificationProfile(userId).then(p => {
        if (p) setProfile(p);
      });
      localRepo.getUserBadges(userId).then(setBadges);
    });
  }, [userId]);

  if (!profile) {
    return <div className="p-6 text-center text-text-muted">Loading Progression...</div>;
  }

  const { nextLevelXP, progressPct } = GamificationEngine.getProgressToNextLevel(profile.total_xp);

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Progression</h1>
        <p className="text-text-muted">Your SVARO journey and verified real-world milestones.</p>
      </div>

      <div className="bg-surface border border-border p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-32 h-32 rounded-full border-8 border-background flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-border"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent"
                strokeWidth="3"
                strokeDasharray={`${progressPct}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="text-center">
              <span className="block text-4xl font-black">{profile.current_level}</span>
              <span className="block text-[10px] uppercase tracking-widest text-text-muted font-bold">Level</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-text-muted text-sm font-bold uppercase tracking-widest">Total XP</span>
              <h2 className="text-3xl font-black">{profile.total_xp.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <span className="text-text-muted text-sm font-bold uppercase tracking-widest">Next Level</span>
              <h2 className="text-xl font-black text-text-muted">{nextLevelXP.toLocaleString()}</h2>
            </div>
          </div>
          
          <div className="bg-background rounded-xl p-4 flex justify-between items-center border border-border">
            <span className="font-black text-sm uppercase tracking-widest text-text-muted">Virtual Credits</span>
            <span className="font-black text-xl text-yellow-500">{profile.total_credits.toLocaleString()} C</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-black text-sm uppercase tracking-widest text-text-muted mb-4">Achievements ({badges.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(BADGES).map(def => {
            const unlocked = badges.find(b => b.badge_id === def.id);
            return (
              <div key={def.id} className={`p-4 rounded-2xl border ${unlocked ? 'border-accent/30 bg-accent/5' : 'border-border bg-surface opacity-50 grayscale'}`}>
                <div className="text-4xl mb-2">{def.icon}</div>
                <h4 className="font-black text-sm">{def.name}</h4>
                <p className="text-xs text-text-muted mt-1 font-medium">{def.description}</p>
                {unlocked && <p className="text-[10px] text-accent mt-2 font-black uppercase">Unlocked</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

