import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import { useNavigate } from 'react-router-dom';
import { getLocalYYYYMMDD } from '../../domain/calendar/dateUtils';
import { createBaseEntity } from '../../domain/core/BaseEntity';
import { Plus, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = useAuthStore(state => state.user?.id);
  const { profile } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  
  // Data
  const [waterAmount, setWaterAmount] = useState(0);
  const [sleepData, setSleepData] = useState<any>(null);
  const [weightData, setWeightData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null);
  const [todaysFood, setTodaysFood] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Modals
  const [isLoggingSleep, setIsLoggingSleep] = useState(false);
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isEditingWater, setIsEditingWater] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (userId) loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    if (!userId) return;
    
    const today = new Date();
    const ds = getLocalYYYYMMDD(today);
    
    // YESTERDAY for Sleep
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yds = getLocalYYYYMMDD(yesterday);

    const water = await localRepo.getWaterLogs(userId);
    const todayWater = water.find(w => w.id === `${userId}_${ds}_water` && !w.deleted);
    setWaterAmount(todayWater?.amountMl || 0);

    const sleeps = await localRepo.getSleepLogs(userId);
    const ySleep = sleeps.find(s => s.id === `${userId}_${yds}_sleep` && !s.deleted);
    setSleepData(ySleep);

    const weights = await localRepo.getWeightLogs(userId);
    const tWeight = weights.find(w => w.id === `${userId}_${ds}_weight` && !w.deleted);
    setWeightData(tWeight);

    const sessions = await localRepo.getWorkoutSessions(userId);
    const tSession = sessions.find(s => !s.deleted && getLocalYYYYMMDD(new Date(s.startTime)) === ds);
    setTodaysWorkout(tSession);

    const foods = await localRepo.getFoodLogs(userId);
    const tFoods = foods.filter(f => !f.deleted && getLocalYYYYMMDD(new Date(f.timestamp)) === ds);
    const c = tFoods.reduce((sum, f) => sum + f.calories, 0);
    const p = tFoods.reduce((sum, f) => sum + f.protein, 0);
    const cb = tFoods.reduce((sum, f) => sum + f.carbs, 0);
    const f = tFoods.reduce((sum, f) => sum + f.fat, 0);
    setTodaysFood({ calories: c, protein: p, carbs: cb, fat: f });

    const defs = await localRepo.getTaskDefinitions(userId);
    const states = await localRepo.db.task_states.where('user_id').equals(userId).toArray();
    
    const activeDefs = defs.filter(d => !d.deleted);
    const mapped = activeDefs.map(d => {
      const state = states.find(s => s.taskId === d.id && s.date === ds && !s.deleted);
      return { ...d, state: state?.status || 'NOT DONE' };
    });
    setTasks(mapped);

    setLoading(false);
  };

  const addWater = async (amt: number) => {
    if (!userId) return;
    const ds = getLocalYYYYMMDD(new Date());
    const id = `${userId}_${ds}_water`;
    const newAmt = waterAmount + amt;
    await localRepo.logWater({
      ...createBaseEntity(userId),
      id,
      amountMl: newAmt,
      timestamp: Date.now()
    });
    setWaterAmount(newAmt);
  };

  const setTaskStatus = async (taskId: string, status: 'DONE'|'NOT DONE'|'SKIPPED') => {
    if (!userId) return;
    const ds = getLocalYYYYMMDD(new Date());
    const id = `${userId}_${ds}_${taskId}`;
    await localRepo.saveTaskState({
      ...createBaseEntity(userId),
      id,
      taskId,
      date: ds,
      status
    });
    loadDashboard();
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const task = tasks.find(t => t.id === taskToDelete);
    if (task) {
      await localRepo.saveTaskDefinition({ ...task, deleted: true, active: false, updated_at: Date.now() });
    }
    setTaskToDelete(null);
    loadDashboard();
  };

  if (loading) {
    return <div className="p-8 text-center font-bold tracking-widest text-text-muted text-sm uppercase">Loading Command Center...</div>;
  }

  const startMs = profile?.transformationStartDate || profile?.created_at || Date.now();
  const durDays = profile?.transformationDurationDays || 90;
  // Use proper day calculation to avoid fractional anomalies
  const dayIndex = Math.floor((new Date().getTime() - new Date(startMs).setHours(0,0,0,0)) / (1000*60*60*24)) + 1;
  const daysRemaining = durDays - dayIndex;

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      
      {/* HEADER */}
      <header className="p-6 pb-2">
        <p className="text-xs font-black uppercase tracking-widest text-text-muted mt-1">
          DAY {dayIndex} / {durDays} • {daysRemaining > 0 ? `${daysRemaining} DAYS REMAINING` : 'TRANSFORMATION COMPLETE'}
        </p>
      </header>

      <div className="p-4 space-y-4">
        
        {/* NUTRITION */}
        <div onClick={() => navigate('/nutrition')} className="bg-surface p-5 rounded-3xl border border-border flex items-center justify-between cursor-pointer active:scale-95 transition-transform">
          <div>
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nutrition</h2>
            <div className="flex space-x-4">
              <div><p className="text-lg font-black">{Math.round(todaysFood.calories)}</p><p className="text-[10px] font-bold text-text-muted uppercase">Cal</p></div>
              <div><p className="text-lg font-black">{Math.round(todaysFood.protein)}g</p><p className="text-[10px] font-bold text-text-muted uppercase">Pro</p></div>
              <div><p className="text-lg font-black">{Math.round(todaysFood.carbs)}g</p><p className="text-[10px] font-bold text-text-muted uppercase">Carb</p></div>
              <div><p className="text-lg font-black">{Math.round(todaysFood.fat)}g</p><p className="text-[10px] font-bold text-text-muted uppercase">Fat</p></div>
            </div>
          </div>
          <ChevronRight />
        </div>

        {/* WORKOUT */}
        <div onClick={() => navigate('/fitness')} className="bg-surface p-5 rounded-3xl border border-border flex flex-col justify-center cursor-pointer active:scale-95 transition-transform">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Today's Workout</h2>
          <p className="text-lg font-black uppercase">{todaysWorkout ? todaysWorkout.name : 'REST DAY'}</p>
        </div>

        {/* WATER */}
        <div className="bg-surface p-5 rounded-3xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Water</h2>
              <button onClick={() => setIsEditingWater(true)} className="text-[10px] text-accent uppercase tracking-widest font-black underline">Edit</button>
            </div>
            <span className="text-lg font-black">{waterAmount} ml</span>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => addWater(250)} className="flex-1 bg-background border border-border py-2 rounded-xl text-xs font-black">+250</button>
            <button onClick={() => addWater(500)} className="flex-1 bg-background border border-border py-2 rounded-xl text-xs font-black">+500</button>
            <button onClick={() => addWater(1000)} className="flex-1 bg-background border border-border py-2 rounded-xl text-xs font-black text-accent border-accent/30">+1000</button>
          </div>
        </div>

        {/* SLEEP & WEIGHT GRIDS */}
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => setIsLoggingSleep(true)} className="bg-surface p-5 rounded-3xl border border-border cursor-pointer active:scale-95 transition-transform">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Sleep</h2>
            <p className="text-lg font-black">{sleepData ? `${Math.floor(sleepData.durationMinutes/60)}h ${sleepData.durationMinutes%60}m` : 'LOG'}</p>
          </div>
          
          <div onClick={() => setIsLoggingWeight(true)} className="bg-surface p-5 rounded-3xl border border-border cursor-pointer active:scale-95 transition-transform">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Weight</h2>
            <p className="text-lg font-black">{weightData ? `${weightData.weightKg} kg` : 'LOG'}</p>
          </div>
        </div>

        {/* TASKS */}
        <div>
          <div className="flex justify-between items-center px-2 mb-2 mt-4">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Today's Tasks</h2>
            <button onClick={() => setIsCreatingTask(true)} className="text-accent p-1"><Plus size={16} /></button>
          </div>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-xs text-text-muted px-2 italic font-bold">No tasks assigned today.</p>
            ) : (
              tasks.map(t => (
                <div key={t.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${t.state === 'DONE' ? 'bg-green-500/10 border-green-500/20' : t.state === 'SKIPPED' ? 'bg-red-500/10 border-red-500/20' : 'bg-surface border-border'}`}>
                  <div>
                    <p className={`font-black uppercase text-sm ${t.state === 'DONE' ? 'text-green-500' : t.state === 'SKIPPED' ? 'text-red-500 line-through' : 'text-text'}`}>{t.title}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t.timeStr} • {t.durationMinutes}m</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setTaskToDelete(t.id)} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => setTaskStatus(t.id, t.state === 'SKIPPED' ? 'NOT DONE' : 'SKIPPED')} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${t.state === 'SKIPPED' ? 'border-red-500 text-red-500 bg-red-500/20' : 'border-border text-text-muted'}`}>✕</button>
                    <button onClick={() => setTaskStatus(t.id, t.state === 'DONE' ? 'NOT DONE' : 'DONE')} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${t.state === 'DONE' ? 'border-green-500 text-green-500 bg-green-500/20' : 'border-border text-text-muted'}`}>✓</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {taskToDelete && (
        <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl">
            <h2 className="font-black text-xl mb-4 text-center">Delete Task?</h2>
            <p className="text-sm font-bold text-text-muted text-center mb-6">This will remove the task from all future days. Historical logs will remain intact.</p>
            <div className="flex gap-4">
              <button onClick={() => setTaskToDelete(null)} className="flex-1 bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={confirmDeleteTask} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isEditingWater && <WaterModal currentAmount={waterAmount} onClose={() => setIsEditingWater(false)} onSave={loadDashboard} userId={userId} />}
      {isLoggingSleep && <SleepModal onClose={() => setIsLoggingSleep(false)} onSave={loadDashboard} userId={userId!} />}
      {isLoggingWeight && <WeightModal onClose={() => setIsLoggingWeight(false)} onSave={loadDashboard} userId={userId!} />}
      {isCreatingTask && <TaskModal onClose={() => setIsCreatingTask(false)} onSave={loadDashboard} userId={userId!} />}

    </div>
  );
}

function ChevronRight() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><path d="m9 18 6-6-6-6"/></svg>;
}

function WaterModal({ currentAmount, onClose, onSave, userId }: any) {
  const [val, setVal] = useState(currentAmount.toString());

  const handleSave = async () => {
    const amt = Number(val) || 0;
    const { getLocalYYYYMMDD } = await import('../../domain/calendar/dateUtils');
    const ds = getLocalYYYYMMDD(new Date());
    
    await localRepo.logWater({
      ...createBaseEntity(userId),
      id: `${userId}_${ds}_water`,
      amountMl: amt,
      timestamp: Date.now()
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl">
        <h2 className="font-black text-xl mb-4 text-center">Edit Total Water</h2>
        <input type="number" step="any" value={val} onChange={e => setVal(e.target.value)} placeholder="Total ml" className="w-full bg-background border border-border p-4 rounded-xl text-lg font-bold text-center mb-6 outline-none focus:border-accent" />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-accent text-white py-4 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg">Save</button>
        </div>
      </div>
    </div>
  );
}

function SleepModal({ onClose, onSave, userId }: any) {
  const [h, setH] = useState('');
  const [m, setM] = useState('');

  const handleSave = async () => {
    const mins = (Number(h) || 0) * 60 + (Number(m) || 0);
    if (mins <= 0) return;
    const { getLocalYYYYMMDD } = await import('../../domain/calendar/dateUtils');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const ds = getLocalYYYYMMDD(yesterday);
    
    await localRepo.logSleep({
      ...createBaseEntity(userId),
      id: `${userId}_${ds}_sleep`,
      durationMinutes: mins,
      timestamp: yesterday.getTime()
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl">
        <h2 className="font-black text-xl mb-1">Previous Night's Sleep</h2>
        <p className="text-xs text-text-muted font-bold mb-4 uppercase tracking-widest">Logged against yesterday's date</p>
        <div className="flex space-x-4 mb-6">
          <input type="number" value={h} onChange={e => setH(e.target.value)} placeholder="Hrs" className="w-full bg-background border border-border p-4 rounded-xl text-lg font-bold text-center outline-none focus:border-accent" />
          <input type="number" value={m} onChange={e => setM(e.target.value)} placeholder="Mins" className="w-full bg-background border border-border p-4 rounded-xl text-lg font-bold text-center outline-none focus:border-accent" />
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 border-2 border-border py-4 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-accent border-2 border-accent text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">Save</button>
        </div>
      </div>
    </div>
  );
}

function WeightModal({ onClose, onSave, userId }: any) {
  const [w, setW] = useState('');

  const handleSave = async () => {
    const val = Number(w);
    if (val <= 0) return;
    const { getLocalYYYYMMDD } = await import('../../domain/calendar/dateUtils');
    const ds = getLocalYYYYMMDD(new Date());
    
    await localRepo.logWeight({
      ...createBaseEntity(userId),
      id: `${userId}_${ds}_weight`,
      weightKg: val,
      timestamp: Date.now()
    });

    const prof = await localRepo.db.profiles.get(userId);
    if (prof) {
      await localRepo.saveProfile({ ...prof, weightKg: val, updated_at: Date.now() });
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl">
        <h2 className="font-black text-xl mb-4">Today's Weight</h2>
        <input type="number" step="0.1" value={w} onChange={e => setW(e.target.value)} placeholder="e.g. 75.5" className="w-full bg-background border border-border p-4 rounded-xl text-lg font-bold text-center mb-6 outline-none focus:border-accent" />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 border-2 border-border py-4 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-accent border-2 border-accent text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">Save</button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ onClose, onSave, userId }: any) {
  const [title, setTitle] = useState('');
  const [timeStr, setTimeStr] = useState('08:00');
  const [dur, setDur] = useState('30');

  const handleSave = async () => {
    if (!title) return;
    await localRepo.saveTaskDefinition({
      ...createBaseEntity(userId),
      id: crypto.randomUUID(),
      title,
      category: 'General',
      timeStr,
      durationMinutes: Number(dur) || 30,
      frequency: 'DAILY',
      active: true
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex flex-col justify-end">
      <div className="bg-surface w-full rounded-t-3xl border-t border-border p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom-full">
        <h2 className="font-black text-xl mb-6 uppercase">Create Task</h2>
        <div className="space-y-4 mb-6">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task Name" className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold outline-none focus:border-accent" />
          <div className="flex space-x-4">
            <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold outline-none focus:border-accent" />
            <input type="number" value={dur} onChange={e => setDur(e.target.value)} placeholder="Mins" className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold outline-none focus:border-accent" />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 border-2 border-border py-4 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-accent border-2 border-accent text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">Create</button>
        </div>
      </div>
    </div>
  );
}
