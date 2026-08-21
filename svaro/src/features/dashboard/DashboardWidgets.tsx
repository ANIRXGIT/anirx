import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import { FinanceEngine } from '../../domain/finance/FinanceEngine';
import { StudyEngine } from '../../domain/study/StudyEngine';


export function FinanceWidget() {
  const userId = useAuthStore(state => state.user?.id);
  const [summary, setSummary] = useState<any>(null);
  
  useEffect(() => {
    if (!userId) return;
    localRepo.getFinanceTransactions(userId).then(tx => {
      setSummary(FinanceEngine.calculateMonthlySummary(tx, new Date()));
    });
  }, [userId]);

  if (!summary) return null;

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <h3 className="font-black text-[10px] text-text-muted uppercase tracking-widest mb-3">Finance (Private)</h3>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-text-muted">Net Cash Flow</span>
        <span className={`font-black ${summary.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          ${summary.netCashFlow.toFixed(2)}
        </span>
      </div>
      <div className="w-full h-1 bg-background rounded-full overflow-hidden flex">
        <div className="bg-green-500 h-full" style={{ width: `${Math.min((summary.totalIncome / (summary.totalIncome + summary.totalExpenses || 1)) * 100, 100)}%` }}></div>
        <div className="bg-red-500 h-full" style={{ width: `${Math.min((summary.totalExpenses / (summary.totalIncome + summary.totalExpenses || 1)) * 100, 100)}%` }}></div>
      </div>
    </div>
  );
}

export function ProjectsWidget() {
  const userId = useAuthStore(state => state.user?.id);
  const [projects, setProjects] = useState<any[]>([]);
  
  useEffect(() => {
    if (!userId) return;
    localRepo.getProjects(userId).then(p => setProjects(p.filter(x => x.status === 'ACTIVE')));
  }, [userId]);

  if (projects.length === 0) return null;

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <h3 className="font-black text-[10px] text-text-muted uppercase tracking-widest mb-3">Active Projects</h3>
      <div className="space-y-2">
        {projects.slice(0, 3).map(p => (
          <div key={p.id} className="flex justify-between items-center text-sm">
            <span className="font-bold truncate">{p.name}</span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded font-black">ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyWidget() {
  const userId = useAuthStore(state => state.user?.id);
  const [mins, setMins] = useState(0);
  
  useEffect(() => {
    if (!userId) return;
    localRepo.getStudySessions(userId).then(sess => {
      setMins(StudyEngine.calculateStats(sess, new Date()).dailyMinutes);
    });
  }, [userId]);

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <h3 className="font-black text-[10px] text-text-muted uppercase tracking-widest mb-3">Today's Study</h3>
      <p className="font-black text-xl">{mins} <span className="text-sm text-text-muted font-medium">minutes</span></p>
    </div>
  );
}

