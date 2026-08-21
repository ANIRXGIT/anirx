import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import { RecommendationEngine } from '../../domain/recommendations/engine';
import type { Recommendation } from '../../db/dexie';
import { NullAIProvider } from '../../domain/ai/AIProvider';

export default function ActionCenter() {
  const userId = useAuthStore(state => state.user?.id);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    const data = await localRepo.getRecommendations(userId);
    setRecs(data.filter(r => r.status === 'pending').sort((a,b) => b.priority - a.priority));
  };

  useEffect(() => { loadData(); }, [userId]);

  const generate = async () => {
    if (!userId) return;
    setLoading(true);
    await RecommendationEngine.runCycle(userId, new NullAIProvider());
    await loadData();
    setLoading(false);
  };

  const handleAccept = async (r: Recommendation) => {
    if (!userId) return;
    await RecommendationEngine.acceptRecommendation(r, userId);
    loadData();
  };

  const handleDismiss = async (r: Recommendation) => {
    await RecommendationEngine.dismissRecommendation(r);
    loadData();
  };

  if (recs.length === 0) {
    return (
      <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col items-center justify-center space-y-4">
        <h3 className="font-black uppercase tracking-widest text-text-muted text-xs">Action Center</h3>
        <p className="text-sm text-text-muted">You're all caught up.</p>
        <button onClick={generate} disabled={loading} className="px-4 py-2 bg-accent/10 text-accent font-bold rounded-lg hover:bg-accent/20">
          {loading ? 'Evaluating...' : 'Refresh AI Context'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-3xl border border-border space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black uppercase tracking-widest text-text-muted text-xs">Action Center</h3>
        <button onClick={generate} disabled={loading} className="text-[10px] uppercase font-black tracking-widest text-accent hover:underline">
          {loading ? 'Running...' : 'Run Cycle'}
        </button>
      </div>
      
      <div className="space-y-3">
        {recs.slice(0, 3).map(r => (
          <div key={r.id} className="p-4 rounded-xl border border-border bg-background flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h4 className="font-black text-sm">{r.title}</h4>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                r.priority >= 80 ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'
              }`}>
                {r.priority >= 80 ? 'Critical' : 'Suggested'}
              </span>
            </div>
            <p className="text-xs font-bold text-text">{r.what}</p>
            <p className="text-xs text-text-muted">{r.why}</p>
            
            <div className="flex gap-2 mt-2 pt-2 border-t border-border">
              <button onClick={() => handleAccept(r)} className="flex-1 bg-accent text-white py-1.5 rounded text-xs font-black">
                {r.action}
              </button>
              <button onClick={() => handleDismiss(r)} className="px-3 bg-surface border border-border text-text-muted py-1.5 rounded text-xs font-black">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

