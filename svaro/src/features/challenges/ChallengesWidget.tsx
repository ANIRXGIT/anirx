import { useAuthStore } from '../../stores/useAuthStore';
import { useState, useEffect } from 'react';
import { localRepo } from '../../db/repositories/LocalRepository';

export default function ChallengesWidget() {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const active = await localRepo.getActiveChallenges(useAuthStore.getState().user?.id || '');
    setChallenges(active);
  };

  if (challenges.length === 0) {
    return <p className="text-sm text-text-muted">No active challenges.</p>;
  }

  return (
    <div className="space-y-3">
      {challenges.map(challenge => {
        const total = challenge.endDate - challenge.startDate;
        const elapsed = Date.now() - challenge.startDate;
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        const daysLeft = Math.max(0, Math.ceil((challenge.endDate - Date.now()) / (1000 * 60 * 60 * 24)));

        return (
          <div key={challenge.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg leading-tight tracking-wide">{challenge.name}</h3>
                {challenge.goal && <p className="text-xs text-text-muted mt-0.5">{challenge.goal}</p>}
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase bg-accent/10 text-accent px-2 py-1 rounded-full">{challenge.status}</span>
            </div>
            
            <div className="w-full bg-background h-2 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-accent h-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{Math.round(progress)}% COMPLETE</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{daysLeft} DAYS LEFT</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

