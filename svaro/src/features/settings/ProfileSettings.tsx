import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.user?.id);
  const { profile, loadInitialData } = useAppStore();

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState(profile?.sex || 'male');
  const [height, setHeight] = useState(profile?.heightCm?.toString() || '');
  const [weight, setWeight] = useState(profile?.weightKg?.toString() || '');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAge(profile.age?.toString() || '');
      setSex(profile.sex || 'male');
      setHeight(profile.heightCm?.toString() || '');
      setWeight(profile.weightKg?.toString() || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!userId || !profile) return;
    
    const updated: any = {
      ...profile,
      name,
      age: Number(age) || 0,
      sex,
      heightCm: Number(height) || 0,
      weightKg: Number(weight) || 0,
      updated_at: Date.now()
    };
    
    await localRepo.saveProfile(updated);
    
    // Also push the weight to the weight log for today so it's consistent
    const { getLocalYYYYMMDD } = await import('../../domain/calendar/dateUtils');
    const { createBaseEntity } = await import('../../domain/core/BaseEntity');
    const ds = getLocalYYYYMMDD(new Date());
    await localRepo.logWeight({
      ...createBaseEntity(userId),
      id: `${userId}_${ds}_weight`,
      weightKg: Number(weight) || 0,
      timestamp: Date.now()
    });

    await loadInitialData(userId);
    navigate('/settings');
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <header className="p-6 sticky top-0 bg-background/90 backdrop-blur z-10 border-b border-border flex items-center space-x-4">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:bg-surface rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <h1 className="text-2xl font-black uppercase tracking-tight">Profile</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Gender</label>
              <select value={sex} onChange={e => setSex(e.target.value as any)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent">
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="other">OTHER</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Height (cm)</label>
              <input type="number" step="0.5" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Weight (kg)</label>
              <input type="number" step="any" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-surface border border-border p-4 rounded-xl font-bold mt-1 outline-none focus:border-accent" />
            </div>
          </div>
        </div>
        
        <button onClick={handleSave} className="w-full bg-accent text-white py-5 rounded-2xl font-black text-sm tracking-widest uppercase active:scale-[0.98] transition-transform">
          Save Profile
        </button>
        
        <div className="pt-4 mt-6 border-t border-surface">
          <h3 className="text-sm font-bold text-accent mb-2">DEVELOPER / SYNC</h3>
          <p className="text-xs text-text-muted mb-4">If your cloud data is missing, click below to safely force upload all your local Vercel data to the cloud.</p>
          <button
            onClick={async () => {
              try {
                const { SyncEngine } = await import('../../sync/SyncEngine');
                const { useAuthStore } = await import('../../stores/useAuthStore');
                const currentUser = useAuthStore.getState().user;
                if (!currentUser) throw new Error('Not logged in');
                await SyncEngine.forceUploadAllLocalData(currentUser.id);
                alert('Force sync complete! Data uploaded.');
              } catch (e: any) {
                alert('Sync failed: ' + e.message);
              }
            }}
            className="w-full py-3 bg-surface hover:bg-surface-elevated text-text font-bold rounded-lg transition-colors border border-accent/20"
          >
            FORCE HYDRATE TO CLOUD
          </button>
        </div>

      </div>
    </div>
  );
}
