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
  
  const [progressState, setProgressState] = useState<{
    status: 'idle' | 'running' | 'verifying' | 'error' | 'success';
    queued: number;
    success: number;
    failed: number;
    currentTable: string;
    currentRecord: string;
    errorDetails: string;
  }>({
    status: 'idle',
    queued: 0,
    success: 0,
    failed: 0,
    currentTable: '-',
    currentRecord: '-',
    errorDetails: ''
  });

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
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (count) cloudCount = count;

        setStats({ local: localCount, cloud: cloudCount });
        setProgressState(s => ({ ...s, queued: localCount }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user.id]);

  const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const generateStableUuid = async (input: string) => {
    if (isUuid(input)) return input;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-1', data);
    const bytes = new Uint8Array(hash);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
  };

  const handleHydrate = async (testMode: boolean = false) => {
    setHydrating(true);
    setProgressState(s => ({ ...s, status: 'running', errorDetails: '', success: 0, failed: 0 }));
    try {
      const { db } = await import('../../db/dexie');
      const { supabase } = await import('../../lib/supabase');
      
      const tableGroups: Record<string, any[]> = {};
      
      if (testMode) {
        // TEST MODE: Only upload the ONE profile record
        const profiles = await db.profiles.toArray();
        const profile = profiles.find(p => p.user_id === user.id);
        if (!profile) throw new Error("No profile record found in local IndexedDB to test.");
        tableGroups['profiles'] = [profile];
      } else {
        // FULL MODE
        for (const table of db.tables) {
          if (['sync_queue', 'sync_cursors', 'local_media'].includes(table.name)) continue;
          const records = await table.toArray();
          tableGroups[table.name] = records.filter(r => r.user_id === user.id);
        }
      }

      for (const [tableName, records] of Object.entries(tableGroups)) {
        if (records.length === 0) continue;
        
        const BATCH_SIZE = 25;
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batchRecords = records.slice(i, i + BATCH_SIZE);
          
          setProgressState(s => ({ 
            ...s, 
            currentTable: tableName, 
            currentRecord: testMode ? 'TEST MODE (1 Record)' : `Batch ${Math.floor(i/BATCH_SIZE) + 1} (${i} to ${i + batchRecords.length})` 
          }));

          const payload = await Promise.all(batchRecords.map(async b => {
            // Map legacy string IDs (e.g. goal_1787...) to deterministic UUIDs for PostgreSQL compatibility
            const validUuidId = await generateStableUuid(b.id);
            const mappedRecord = { ...b, id: validUuidId };

            return {
              mutation_id: crypto.randomUUID(), 
              entity_type: tableName,
              entity_id: validUuidId,
              operation: 'UPSERT',
              payload: mappedRecord
            };
          }));

          // DEBUG PAUSE
          if (testMode || (i === 0 && Object.keys(tableGroups).indexOf(tableName) === 0)) {
            const debugPayload = payload.map((p, idx) => ({
              TABLE: p.entity_type,
              ENTITY_TYPE: p.entity_type,
              ENTITY_ID: p.entity_id,
              ORIGINAL_LOCAL_ID: batchRecords[idx].id,
              MUTATION_ID: p.mutation_id,
              USER_ID: p.payload.user_id
            }));
            const proceed = window.confirm(`DEBUG PREVIEW BEFORE RPC:\n\n${JSON.stringify(debugPayload, null, 2)}\n\nProceed with RPC call?`);
            if (!proceed) {
              throw new Error('User aborted at debug preview.');
            }
          }

          const { data, error } = await supabase.rpc('sync_push', { payload });

          if (error) {
            throw new Error(`RPC ERROR: [${error.code}] ${error.message} \nDetails: ${error.details || 'None'}`);
          }

          const results = data as any[];
          let batchErrors = 0;
          let batchSuccess = 0;

          for (const res of results) {
            if (res.status === 'ERROR') {
              batchErrors++;
              console.error('Record error:', res);
              throw new Error(`RECORD ERROR in table ${tableName}:\n[${res.error?.code}] ${res.error?.message}`);
            } else {
              batchSuccess++;
            }
          }

          setProgressState(s => ({ 
            ...s, 
            success: s.success + batchSuccess, 
            failed: s.failed + batchErrors 
          }));
        }
      }

      // Verify
      setProgressState(s => ({ ...s, status: 'verifying', currentTable: 'profiles', currentRecord: 'Verifying Cloud State' }));
      
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id);
        
      if (verifyError) {
        throw new Error(`Verification query failed: [${verifyError.code}] ${verifyError.message}`);
      }
      
      if (!verifyData || verifyData.length === 0) {
        throw new Error(`Verification failed: Supabase still returned 0 profile rows for UUID ${user.id} after upload. Sync is fundamentally broken.`);
      }

      setProgressState(s => ({ ...s, status: 'success' }));
      alert(testMode ? 'TEST UPLOAD SUCCESS! Profile verified in Supabase.' : 'Hydration and Verification Successful!');
      
      if (!testMode) {
        onClose();
      }

    } catch (e: any) {
      setProgressState(s => ({ ...s, status: 'error', errorDetails: e.message || String(e) }));
      setHydrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <h2 className="font-black text-xl mb-4 text-center uppercase tracking-widest text-accent">Safe Migration</h2>
        
        <div className="overflow-y-auto space-y-4 mb-6 text-sm flex-1">
          <div className="bg-background p-4 rounded-xl border border-border">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Authenticated Email</p>
            <p className="font-bold break-all">{user.email}</p>
          </div>
          <div className="bg-background p-4 rounded-xl border border-border">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Auth User ID</p>
            <p className="font-mono text-[10px] text-text-muted break-all">{user.id}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-xl border border-border text-center">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Local</p>
              <p className="font-black text-xl">{loading ? '...' : stats?.local}</p>
            </div>
            <div className="bg-background p-4 rounded-xl border border-border text-center">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Cloud</p>
              <p className="font-black text-xl">{loading ? '...' : stats?.cloud}</p>
            </div>
          </div>
          
          {progressState.status !== 'idle' && (
            <div className="bg-background p-4 rounded-xl border border-accent/20 space-y-3 font-mono text-[10px]">
              <div className="flex justify-between border-b border-border pb-1">
                <span className="text-text-muted">Status:</span>
                <span className={progressState.status === 'error' ? 'text-red-500 font-bold' : 'text-accent font-bold uppercase'}>{progressState.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Queued:</span>
                <span>{progressState.queued}</span>
              </div>
              <div className="flex justify-between text-green-500">
                <span className="text-text-muted">Success:</span>
                <span>{progressState.success}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span className="text-text-muted">Failed:</span>
                <span>{progressState.failed}</span>
              </div>
              <div className="flex flex-col mt-2 pt-2 border-t border-border">
                <span className="text-text-muted">Current Table:</span>
                <span className="truncate">{progressState.currentTable}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">Current Op:</span>
                <span className="truncate">{progressState.currentRecord}</span>
              </div>
              
              {progressState.status === 'error' && (
                <div className="mt-2 pt-2 border-t border-red-500/30 text-red-500 break-all whitespace-pre-wrap font-bold">
                  {progressState.errorDetails}
                </div>
              )}
            </div>
          )}
        </div>
        
        {progressState.status === 'idle' && (
          <p className="text-xs text-text-muted mb-4 text-center font-bold">
            This will directly push all {stats?.local || 0} local records to the cloud and report any errors immediately.
          </p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          {progressState.status !== 'success' && (
            <>
              <button onClick={() => handleHydrate(true)} disabled={hydrating || loading} className="w-full bg-surface border-2 border-accent/50 hover:border-accent text-accent py-3 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg disabled:opacity-50 transition-colors">
                1. Test Profile Record
              </button>
              <button onClick={() => handleHydrate(false)} disabled={hydrating || loading} className="w-full bg-accent border-2 border-accent text-white py-3 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg disabled:opacity-50">
                2. Hydrate All Data
              </button>
            </>
          )}
          <button onClick={onClose} disabled={hydrating && progressState.status !== 'error'} className="w-full bg-transparent border-2 border-border py-3 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50 mt-2">
            {progressState.status === 'success' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
