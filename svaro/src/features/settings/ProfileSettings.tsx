import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.user?.id);
  const user = useAuthStore(state => state.user);
  const { profile, loadInitialData } = useAppStore();

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [sex, setSex] = useState(profile?.sex || 'male');
  const [height, setHeight] = useState(profile?.heightCm?.toString() || '');
  const [weight, setWeight] = useState(profile?.weightKg?.toString() || '');

  const [isHydrateModalOpen, setIsHydrateModalOpen] = useState(false);

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
            onClick={() => setIsHydrateModalOpen(true)}
            className="w-full py-3 bg-surface hover:bg-surface-elevated text-text font-bold rounded-lg transition-colors border border-accent/20"
          >
            FORCE HYDRATE TO CLOUD
          </button>
        </div>

      </div>

      {isHydrateModalOpen && user && (
        <HydrateModal user={user} onClose={() => setIsHydrateModalOpen(false)} />
      )}
    </div>
  );
}

function HydrateModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [stats, setStats] = useState<{ local: number, cloud: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const { db } = await import('../../db/dexie');
        const { supabase } = await import('../../lib/supabase');
        
        let localCount = 0;
        for (const table of db.tables) {
          if (['sync_queue', 'sync_cursors', 'local_media'].includes(table.name)) continue;
          const records = await table.toArray();
          localCount += records.filter(r => r.user_id === user.id).length;
        }

        let cloudCount = 0;
        // Check profiles table as a proxy for cloud data existence
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (count) cloudCount = count;

        setStats({ local: localCount, cloud: cloudCount });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user.id]);

  const handleHydrate = async () => {
    setHydrating(true);
    try {
      const { SyncEngine } = await import('../../sync/SyncEngine');
      await SyncEngine.forceUploadAllLocalData(user.id);
      alert('Force sync queued successfully. Data is uploading in the background.');
      onClose();
    } catch (e: any) {
      alert('Hydration failed: ' + e.message);
      setHydrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl">
        <h2 className="font-black text-xl mb-4 text-center uppercase tracking-widest text-accent">Safe Migration</h2>
        <div className="space-y-4 mb-6 text-sm">
          <div className="bg-background p-4 rounded-xl border border-border">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Authenticated Email</p>
            <p className="font-bold break-all">{user.email}</p>
          </div>
          <div className="bg-background p-4 rounded-xl border border-border">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Auth User ID</p>
            <p className="font-mono text-xs text-text-muted break-all">{user.id}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-xl border border-border text-center">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Local Records</p>
              <p className="font-black text-xl">{loading ? '...' : stats?.local}</p>
            </div>
            <div className="bg-background p-4 rounded-xl border border-border text-center">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Cloud Profiles</p>
              <p className="font-black text-xl">{loading ? '...' : stats?.cloud}</p>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-text-muted mb-6 text-center font-bold">
          This action will safely queue all {stats?.local || 0} local records for upload to this specific cloud account. It will not overwrite newer cloud data.
        </p>

        <div className="flex gap-4">
          <button onClick={onClose} disabled={hydrating} className="flex-1 bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50">Cancel</button>
          <button onClick={handleHydrate} disabled={hydrating || loading} className="flex-1 bg-accent border-2 border-accent text-white py-4 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg disabled:opacity-50">
            {hydrating ? 'Queuing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
