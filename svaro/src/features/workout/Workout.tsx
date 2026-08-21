import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import { createBaseEntity } from '../../domain/core/BaseEntity';
import type { Exercise, WorkoutTemplate, WorkoutSession, SetLog } from '../../db/dexie';
import { ChevronLeft, ChevronRight, Trash2, Search } from 'lucide-react';

export default function Workout() {
  const [activeTab, setActiveTab] = useState<'PLAN' | 'LOG' | 'HISTORY'>(() => {
    const saved = localStorage.getItem('svaro_workout_tab');
    if (saved === 'PLAN' || saved === 'LOG' || saved === 'HISTORY') return saved as 'PLAN' | 'LOG' | 'HISTORY';
    return 'PLAN';
  });

  const setTab = (tab: 'PLAN'|'LOG'|'HISTORY') => {
    setActiveTab(tab);
    localStorage.setItem('svaro_workout_tab', tab);
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <div className="flex border-b border-border bg-surface sticky top-0 z-10">
        <button className={`flex-1 py-4 text-center font-bold text-sm tracking-wider ${activeTab === 'PLAN' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`} onClick={() => setTab('PLAN')}>PLAN</button>
        <button className={`flex-1 py-4 text-center font-bold text-sm tracking-wider ${activeTab === 'LOG' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`} onClick={() => setTab('LOG')}>LOG</button>
        <button className={`flex-1 py-4 text-center font-bold text-sm tracking-wider ${activeTab === 'HISTORY' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`} onClick={() => setTab('HISTORY')}>HISTORY</button>
      </div>
      <div className="flex-1 p-4">
        {activeTab === 'PLAN' && <WorkoutPlanner />}
        {activeTab === 'LOG' && <WorkoutLog />}
        {activeTab === 'HISTORY' && <WorkoutHistory />}
      </div>
    </div>
  );
}

function WorkoutPlanner() {
  const userId = useAuthStore(state => state.user?.id);
  const profile = useAppStore(state => state.profile);
  const [days, setDays] = useState(profile?.trainingDays || 3);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [selectingForTemplate, setSelectingForTemplate] = useState<number | null>(null);

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    const [exs, tmpls] = await Promise.all([
      localRepo.getExercises(),
      localRepo.getActiveWorkoutTemplates(userId)
    ]);
    setAllExercises(exs);
    
    if (tmpls.length > 0) {
      setTemplates(tmpls.sort((a, b) => a.created_at - b.created_at));
      setDays(tmpls.length);
    } else {
      const initialDays = profile?.trainingDays || 3;
      const emptyTmpls: WorkoutTemplate[] = [];
      for (let i = 0; i < initialDays; i++) {
        emptyTmpls.push({
          ...createBaseEntity(userId),
          name: `Day ${i + 1}`,
          splitType: 'custom',
          exercises: [],
          active: true
        });
      }
      for (const t of emptyTmpls) await localRepo.saveWorkoutTemplate(t);
      setTemplates(emptyTmpls);
      setDays(initialDays);
    }
    setLoading(false);
  };

  const handleDaysChange = async (newDays: number) => {
    if (!userId || newDays < 1 || newDays > 7) return;
    const current = [...templates];
    if (newDays > current.length) {
      for (let i = current.length; i < newDays; i++) {
        const newTmpl: WorkoutTemplate = {
          ...createBaseEntity(userId),
          name: `Day ${i + 1}`,
          splitType: 'custom',
          exercises: [],
          active: true
        };
        await localRepo.saveWorkoutTemplate(newTmpl);
        current.push(newTmpl);
      }
    } else if (newDays < current.length) {
      const toRemove = current.slice(newDays);
      for (const tmpl of toRemove) {
        tmpl.active = false;
        await localRepo.saveWorkoutTemplate(tmpl);
      }
      current.splice(newDays);
    }
    setDays(newDays);
    setTemplates(current);
  };

  const updateTemplateName = async (index: number, newName: string) => {
    const tmpl = templates[index];
    tmpl.name = newName;
    await localRepo.saveWorkoutTemplate(tmpl);
    const newTemplates = [...templates];
    newTemplates[index] = tmpl;
    setTemplates(newTemplates);
  };

  const addExercise = async (exId: string) => {
    if (selectingForTemplate === null) return;
    const tmpl = templates[selectingForTemplate];
    tmpl.exercises.push({ exerciseId: exId, sets: 3, reps: '8-12', restSeconds: 90 });
    await localRepo.saveWorkoutTemplate(tmpl);
    setSelectingForTemplate(null);
    loadData();
  };

  if (loading) return <div className="text-center font-bold p-8">Loading Plan...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Training Days Per Week</h2>
        <div className="flex items-center justify-between bg-background p-2 rounded-xl border border-border">
          <button onClick={() => handleDaysChange(days - 1)} className="p-3 bg-surface rounded-lg font-black active:scale-95">-</button>
          <span className="text-3xl font-black">{days}</span>
          <button onClick={() => handleDaysChange(days + 1)} className="p-3 bg-surface rounded-lg font-black active:scale-95">+</button>
        </div>
      </div>

      <div className="space-y-4">
        {templates.map((tmpl, idx) => (
          <div key={tmpl.id} className="bg-surface p-5 rounded-2xl border border-border space-y-4">
            <input 
              type="text" 
              value={tmpl.name} 
              onChange={e => updateTemplateName(idx, e.target.value)}
              className="w-full bg-transparent text-xl font-black uppercase border-b-2 border-border focus:outline-none focus:border-accent"
              placeholder={`Day ${idx + 1}`}
            />
            
            {tmpl.exercises.length === 0 ? (
              <p className="text-xs text-text-muted">No exercises assigned.</p>
            ) : (
              <div className="space-y-2">
                {tmpl.exercises.map((ex, exIdx) => {
                  const definition = allExercises.find(e => e.id === ex.exerciseId);
                  return (
                    <div key={exIdx} className="bg-background p-3 rounded-xl border border-border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{definition?.name || ex.exerciseId}</p>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted">
                          {ex.sets} sets • {ex.reps} reps
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button onClick={() => setSelectingForTemplate(idx)} className="w-full bg-background border border-border py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface active:scale-[0.98]">
              + Add Exercise
            </button>
          </div>
        ))}
      </div>

      {selectingForTemplate !== null && (
        <ExerciseSelectorModal 
          exercises={allExercises} 
          onSelect={addExercise} 
          onClose={() => setSelectingForTemplate(null)} 
          userId={userId!}
          onCustomCreated={loadData}
        />
      )}
    </div>
  );
}

function ExerciseSelectorModal({ exercises, onSelect, onClose, onCustomCreated }: any) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [customName, setCustomName] = useState('');

  const filtered = exercises.filter((e: any) => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreateCustom = async () => {
    if (!customName) return;
    const ex: Exercise = {
      id: `custom_${Date.now()}`,
      name: customName,
      primaryMuscle: 'custom',
      equipment: 'custom',
      difficulty: 'beginner',
      instructions: 'Custom exercise'
    };
    await localRepo.saveExercise(ex);
    onCustomCreated();
    onSelect(ex.id);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-3xl border border-border p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <h2 className="font-black text-xl mb-4">Select Exercise</h2>
        
        {!isCreating ? (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-background border border-border p-3 pl-10 rounded-xl text-sm font-bold"
              />
            </div>
            <div className="overflow-y-auto flex-1 space-y-2 mb-4">
              <button onClick={() => setIsCreating(true)} className="w-full text-left p-3 rounded-xl border border-accent/30 text-accent font-bold text-sm bg-accent/5">
                + Create Custom "{search}"
              </button>
              {filtered.map((ex: any) => (
                <button key={ex.id} onClick={() => onSelect(ex.id)} className="w-full text-left p-3 rounded-xl border border-border bg-background hover:bg-surface font-bold text-sm transition-colors">
                  {ex.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4 mb-4">
            <input 
              type="text" 
              placeholder="Exercise Name" 
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold"
            />
            <button onClick={handleCreateCustom} className="w-full bg-accent text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg">Save Custom</button>
          </div>
        )}
        
        <button onClick={onClose} className="w-full bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest">Cancel</button>
      </div>
    </div>
  );
}

function WorkoutLog() {
  const userId = useAuthStore(state => state.user?.id);
  const [date, setDate] = useState(new Date());
  const [activeTemplates, setActiveTemplates] = useState<WorkoutTemplate[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sets, setSets] = useState<SetLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (userId) loadDayData();
  }, [userId, date]);

  const loadDayData = async () => {
    if (!userId) return;
    setLoading(true);

    const [tmpls, exs] = await Promise.all([
      localRepo.getActiveWorkoutTemplates(userId),
      localRepo.getExercises()
    ]);
    setActiveTemplates(tmpls);
    setAllExercises(exs);

    const startMs = new Date(date).setHours(0,0,0,0);
    const endMs = new Date(date).setHours(23,59,59,999);
    const sessions = await localRepo.getWorkoutSessionsByDateRange(userId, startMs, endMs);
    const activeSessions = sessions.filter(s => !s.deleted);
    
    if (activeSessions.length > 0) {
      setSession(activeSessions[0]);
      const loggedSets = await localRepo.getSessionSets(userId, activeSessions[0].id);
      setSets(loggedSets.filter(s => !s.deleted).sort((a,b) => a.created_at - b.created_at));
    } else {
      setSession(null);
      setSets([]);
    }
    setUnsavedChanges(false);
    setLoading(false);
  };

  const assignDay = async (templateId: string, name: string) => {
    if (!userId) return;
    
    const sess: WorkoutSession = {
      ...createBaseEntity(userId),
      templateId: templateId === 'REST' ? undefined : templateId,
      name,
      startTime: new Date(date).setHours(12,0,0,0),
      completed: false
    };
    
    await localRepo.saveWorkoutSession(sess);
    
    if (templateId !== 'REST') {
      const tmpl = activeTemplates.find(t => t.id === templateId);
      if (tmpl) {
        let order = 0;
        for (const ex of tmpl.exercises) {
          for (let s = 1; s <= ex.sets; s++) {
            await localRepo.saveSetLog({
              ...createBaseEntity(userId),
              id: `${sess.id}_set_${order++}`,
              sessionId: sess.id,
              exerciseId: ex.exerciseId,
              setNumber: s,
              reps: 0,
              weight: 0,
              completed: false,
              created_at: Date.now() + order
            });
          }
        }
      }
    }
    loadDayData();
  };

  const updateSet = (setId: string, field: 'weight'|'reps', val: string) => {
    const num = val === '' ? 0 : Number(val);
    if (isNaN(num)) return;
    
    const newSets = [...sets];
    const sIndex = newSets.findIndex(s => s.id === setId);
    if (sIndex === -1) return;
    
    newSets[sIndex] = { ...newSets[sIndex], [field]: num, completed: true };
    setSets(newSets);
    setUnsavedChanges(true);
  };

  const saveAllSets = async () => {
    for (const s of sets) {
      await localRepo.saveSetLog(s);
    }
    setUnsavedChanges(false);
  };

  const markSessionComplete = async () => {
    if (!session) return;
    await saveAllSets();
    session.completed = true;
    session.endTime = Date.now();
    await localRepo.saveWorkoutSession(session);
    loadDayData();
  };

  const removeAssignment = async () => {
    if (!session) return;
    await localRepo.saveWorkoutSession({ ...session, deleted: true, updated_at: Date.now() });
    
    // Also delete all sets in this session
    for (const s of sets) {
      await localRepo.saveSetLog({ ...s, deleted: true, updated_at: Date.now() });
    }

    loadDayData();
  };

  if (loading) return <div className="text-center font-bold p-8">Loading Assignment...</div>;

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-2xl border border-border">
        <button onClick={() => setDate(new Date(date.getTime() - 86400000))} className="p-2"><ChevronLeft size={20}/></button>
        <span className="font-black uppercase tracking-widest text-sm">
          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button onClick={() => setDate(new Date(date.getTime() + 86400000))} className="p-2"><ChevronRight size={20}/></button>
      </div>

      {!session ? (
        <div className="bg-surface p-6 rounded-3xl border border-border space-y-4">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Assign Workout for {date.toLocaleDateString()}</h2>
          <div className="space-y-2">
            {activeTemplates.map(t => (
              <button key={t.id} onClick={() => assignDay(t.id, t.name)} className="w-full bg-background border border-border py-4 rounded-xl font-bold active:scale-[0.98]">
                {t.name}
              </button>
            ))}
            <button onClick={() => assignDay('REST', 'Rest Day')} className="w-full bg-background border border-border py-4 rounded-xl font-bold text-accent active:scale-[0.98]">
              Rest Day
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-black uppercase">{session.name}</h2>
            <div className="flex items-center space-x-2">
              <button onClick={removeAssignment} className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 active:scale-95 transition-transform">Remove</button>
              {session.completed ? (
                <span className="text-[10px] font-black uppercase tracking-widest bg-accent text-white px-2 py-1 rounded">Completed</span>
              ) : (
                unsavedChanges && <button onClick={saveAllSets} className="text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-black px-3 py-1 rounded-full animate-pulse">Save Sets</button>
              )}
            </div>
          </div>

          {session.name === 'Rest Day' ? (
            <div className="bg-surface p-8 rounded-3xl border border-border text-center">
              <p className="font-bold text-text-muted uppercase tracking-widest text-xs">Recovery Day</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sets.length === 0 ? <p className="text-sm text-text-muted">No exercises.</p> : (
                <div className="space-y-6">
                  {Array.from(new Set(sets.map(s => s.exerciseId))).map(exId => {
                    const exSets = sets.filter(s => s.exerciseId === exId);
                    const def = allExercises.find(e => e.id === exId);
                    return (
                      <div key={exId} className="bg-surface p-4 rounded-2xl border border-border">
                        <h3 className="font-bold mb-4">{def?.name || exId}</h3>
                        <div className="grid grid-cols-[1fr_2fr_2fr] gap-2 mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">
                          <div>Set</div>
                          <div>KG</div>
                          <div>Reps</div>
                        </div>
                        <div className="space-y-2">
                          {exSets.map(s => (
                            <div key={s.id} className={`grid grid-cols-[1fr_2fr_2fr] gap-2 items-center text-center p-2 rounded-xl transition-colors ${s.completed ? 'bg-background' : ''}`}>
                              <span className="font-bold">{s.setNumber}</span>
                              <input 
                                type="number" 
                                step="any"
                                className="w-full bg-background border border-border rounded-lg py-2 text-center font-bold focus:border-accent outline-none"
                                value={s.weight || ''}
                                onChange={e => updateSet(s.id, 'weight', e.target.value)}
                                placeholder="--"
                              />
                              <input 
                                type="number" 
                                className="w-full bg-background border border-border rounded-lg py-2 text-center font-bold focus:border-accent outline-none"
                                value={s.reps || ''}
                                onChange={e => updateSet(s.id, 'reps', e.target.value)}
                                placeholder="--"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!session.completed && (
                <button onClick={markSessionComplete} className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,59,48,0.3)] active:scale-[0.98]">
                  Finish Workout
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutHistory() {
  const userId = useAuthStore(state => state.user?.id);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string|null>(null);

  useEffect(() => {
    if (userId) loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) return;
    const allSessions = await localRepo.getWorkoutSessions(userId);
    setSessions(allSessions.filter(s => !s.deleted && s.completed).sort((a,b) => b.startTime - a.startTime));
    setLoading(false);
  };

  const deleteSession = async (id: string) => {
    if (!userId) return;
    const sess = await localRepo.db.workout_sessions.get(id);
    if (sess) {
      sess.deleted = true;
      await localRepo.saveWorkoutSession(sess);
      
      // CASCADE DELETE sets
      const sets = await localRepo.getSessionSets(userId, id);
      for (const s of sets) {
        s.deleted = true;
        await localRepo.saveSetLog(s);
      }
      
      loadHistory();
    }
  };

  if (loading) return <div className="text-center font-bold p-8">Loading History...</div>;

  return (
    <div className="space-y-4">
      {sessions.length === 0 ? (
        <p className="text-center py-8 text-sm text-text-muted">No completed workouts yet.</p>
      ) : (
        sessions.map(s => (
          <div key={s.id} className="bg-surface p-5 rounded-2xl border border-border flex justify-between items-center">
            <div>
              <p className="font-black uppercase">{s.name}</p>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {new Date(s.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            {confirmDeleteId === s.id ? (
              <button onClick={() => deleteSession(s.id)} className="px-3 py-1 bg-red-500 text-white rounded font-bold text-[10px] tracking-widest uppercase">
                Confirm
              </button>
            ) : (
              <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

