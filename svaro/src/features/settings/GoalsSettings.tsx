import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { localRepo } from '../../db/repositories/LocalRepository';

export default function GoalsSettings() {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.user?.id);

  const [tWeight, setTWeight] = useState('');
  const [cal, setCal] = useState('');
  const [pro, setPro] = useState('');
  const [car, setCar] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (userId) loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    if (!userId) return;
    const goals = await localRepo.db.goals.where('user_id').equals(userId).toArray();
    const active: any = goals.filter(g => !g.deleted).sort((a,b) => b.created_at - a.created_at)[0];
    if (active) {
      setTWeight(active.targetWeightKg?.toString() || '');
      setCal(active.targetCalories?.toString() || '');
      setPro(active.targetProtein?.toString() || '');
      setCar(active.targetCarbs?.toString() || '');
      setFat(active.targetFat?.toString() || '');
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    const { createBaseEntity } = await import('../../domain/core/BaseEntity');
    
    await localRepo.saveGoal({
      ...createBaseEntity(userId),
      id: `goal_${Date.now()}`,
      targetWeightKg: Number(tWeight) || 0,
      targetCalories: Number(cal) || 0,
      targetProtein: Number(pro) || 0,
      targetCarbs: Number(car) || 0,
      targetFat: Number(fat) || 0,
    } as any);
    
    navigate('/settings');
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <header className="p-6 sticky top-0 bg-background/90 backdrop-blur z-10 border-b border-border flex items-center space-x-4">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:bg-surface rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="text-2xl font-black uppercase tracking-tight">Goals</h1>
      </header>

      <div className="p-6 space-y-6">
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Target Weight (kg)</label>
          <input type="number" step="any" value={tWeight} onChange={e => setTWeight(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Target Calories</label>
            <input type="number" value={cal} onChange={e => setCal(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Protein (g)</label>
            <input type="number" value={pro} onChange={e => setPro(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Carbs (g)</label>
            <input type="number" value={car} onChange={e => setCar(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Fat (g)</label>
            <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
          </div>
        </div>
        
        <button onClick={handleSave} className="w-full bg-accent text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase active:scale-[0.98] transition-transform">
          Save Goals
        </button>
      </div>
    </div>
  );
}
