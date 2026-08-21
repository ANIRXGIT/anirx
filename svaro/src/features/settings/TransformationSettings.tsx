import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';

export default function TransformationSettings() {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.user?.id);
  const { profile } = useAppStore();
  
  const [duration, setDuration] = useState<number>(90);
  const [custom, setCustom] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (profile?.transformationDurationDays) {
      setDuration(profile.transformationDurationDays);
      if (![30, 45, 60, 90, 120].includes(profile.transformationDurationDays)) {
        setCustom(profile.transformationDurationDays.toString());
      }
    }
  }, [profile]);

  const handleResetTransformation = async () => {
    if (!userId || !profile) return;
    const { localRepo } = await import('../../db/repositories/LocalRepository');
    await localRepo.saveProfile({ ...profile, transformationStartDate: Date.now(), updated_at: Date.now() });
    const { useAppStore } = await import('../../stores/useAppStore');
    await useAppStore.getState().loadInitialData(userId);
    setShowResetConfirm(false);
    navigate(-1);
  };

  const handleSave = async (val: number) => {
    if (!userId || !profile) return;
    const { localRepo } = await import('../../db/repositories/LocalRepository');
    await localRepo.saveProfile({ ...profile, transformationDurationDays: val, updated_at: Date.now() });
    const { useAppStore } = await import('../../stores/useAppStore');
    await useAppStore.getState().loadInitialData(userId);
    navigate(-1);
  };

  const handleCustomSave = () => {
    const val = Number(custom);
    if (!isNaN(val) && val > 0) {
      handleSave(val);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <header className="p-4 sticky top-0 bg-background/90 backdrop-blur z-10 border-b border-border flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-black uppercase tracking-tight">Transformation</h1>
      </header>

      <div className="p-4 space-y-6 mt-2">
        <div className="bg-surface p-6 rounded-3xl border border-border">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Duration (Days)</h2>
          
          <div className="space-y-3">
            {[30, 45, 60, 90, 120].map(val => (
              <button 
                key={val}
                onClick={() => handleSave(val)}
                className={`w-full p-4 rounded-xl font-bold transition-colors ${duration === val && !custom ? 'bg-accent text-white border-accent' : 'bg-background border-border text-text'} border-2`}
              >
                {val} Days
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Custom Duration</h2>
            <div className="flex space-x-2">
              <input 
                type="number" 
                value={custom}
                onChange={e => {
                  setCustom(e.target.value);
                  setDuration(Number(e.target.value));
                }}
                placeholder="e.g. 75"
                className="flex-1 bg-background border border-border p-4 rounded-xl text-sm font-bold focus:border-accent outline-none"
              />
              <button onClick={handleCustomSave} className="bg-accent text-white px-6 rounded-xl font-black uppercase tracking-widest">Set</button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={() => setShowResetConfirm(true)} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-xl font-black uppercase tracking-widest active:scale-[0.98]">
            Start New Transformation
          </button>
        </div>
        
        <p className="text-xs text-text-muted font-bold text-center">Changing duration adjusts the timeline, it does not delete historical data.</p>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl">
            <h2 className="font-black text-xl mb-4 text-center">Start Over?</h2>
            <p className="text-sm font-bold text-text-muted text-center mb-6">This resets your transformation clock to DAY 1 starting today. Your history and data remain intact.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleResetTransformation} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
