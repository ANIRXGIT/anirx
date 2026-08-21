import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Progress() {
  const userId = useAuthStore(state => state.user?.id);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D'|'30D'|'90D'|'ALL'>('30D');

  const [weightData, setWeightData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [gymStats, setGymStats] = useState({ planned: 0, completed: 0, percent: 0 });
  const [taskStats, setTaskStats] = useState({ total: 0, done: 0, percent: 0 });
  
  // Task History Matrix
  const [taskMatrix, setTaskMatrix] = useState<{dates: string[], tasks: Record<string, any[]>}>({ dates: [], tasks: {} });

  useEffect(() => {
    if (userId) loadAnalytics();
  }, [userId, timeRange]);

  const loadAnalytics = async () => {
    if (!userId) return;
    setLoading(true);

    const now = Date.now();
    let cutoffDate = new Date(0); // For 'ALL'

    const weights = await localRepo.getWeightLogs(userId);
    const sleeps = await localRepo.getSleepLogs(userId);
    const sessions = await localRepo.getWorkoutSessions(userId);
    const taskStates = await localRepo.db.task_states.where('user_id').equals(userId).toArray();

    // Determine actual earliest data date if ALL
    if (timeRange === 'ALL') {
      const timestamps = [
        ...weights.map(w => w.timestamp),
        ...sleeps.map(s => s.timestamp),
        ...sessions.map(s => s.startTime),
        ...taskStates.map(t => new Date(t.date).getTime())
      ].filter(t => t > 0);
      if (timestamps.length > 0) {
        cutoffDate = new Date(Math.min(...timestamps));
        cutoffDate.setHours(0,0,0,0);
      } else {
        cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000); // fallback
      }
    } else {
      const daysMap: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90 }; 
      const daysToLookBack = daysMap[timeRange] || 30;
      cutoffDate = new Date(now - daysToLookBack * 24 * 60 * 60 * 1000);
      cutoffDate.setHours(0,0,0,0);
    }

    const weightMap = new Map<string, any>();
    weights
      .filter(w => !w.deleted && new Date(w.timestamp) >= cutoffDate)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(w => {
        const dateStr = new Date(w.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        weightMap.set(dateStr, { date: dateStr, weight: w.weightKg });
      });
    setWeightData(Array.from(weightMap.values()));

    const sleepMap = new Map<string, any>();
    sleeps
      .filter(s => !s.deleted && new Date(s.timestamp) >= cutoffDate)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(s => {
        const dateStr = new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        sleepMap.set(dateStr, { date: dateStr, hours: Number((s.durationMinutes / 60).toFixed(1)) });
      });
    setSleepData(Array.from(sleepMap.values()));

    const recentSessions = sessions.filter(s => !s.deleted && s.startTime >= cutoffDate.getTime());
    const completedSessions = recentSessions.filter(s => s.completed);
    
    const activeTemplates = await localRepo.getActiveWorkoutTemplates(userId);
    const trainingDaysPerWeek = activeTemplates.length || 3;
    const daysDiff = Math.max(1, Math.floor((now - cutoffDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksInRange = daysDiff / 7;
    const plannedWorkouts = Math.round(trainingDaysPerWeek * weeksInRange);
    
    const percentGym = plannedWorkouts > 0 ? Math.round((completedSessions.length / plannedWorkouts) * 100) : 0;
    setGymStats({ planned: plannedWorkouts, completed: completedSessions.length, percent: Math.min(100, percentGym) });

    const recentTasks = taskStates.filter(t => !t.deleted && new Date(t.date).getTime() >= cutoffDate.getTime());
    const doneTasks = recentTasks.filter(t => t.status === 'DONE');
    
    const percentTasks = recentTasks.length > 0 ? Math.round((doneTasks.length / recentTasks.length) * 100) : 0;
    setTaskStats({ total: recentTasks.length, done: doneTasks.length, percent: percentTasks });

    // Build Task Matrix
    const { getLocalYYYYMMDD } = await import('../../domain/calendar/dateUtils');
    const matrixDates: string[] = [];
    
    for (let d = new Date(cutoffDate); d.getTime() <= now; d.setDate(d.getDate() + 1)) {
      matrixDates.push(getLocalYYYYMMDD(d));
    }

    const defs = await localRepo.getTaskDefinitions(userId);
    const tasksRecord: Record<string, any[]> = {};
    
    defs.forEach(def => {
      if (def.deleted) return;
      const defCreatedTime = new Date(def.created_at).setHours(0,0,0,0);
      tasksRecord[def.title] = matrixDates.map(dateStr => {
        const matrixDateObj = new Date(dateStr + 'T00:00:00'); // Safe parsing
        if (matrixDateObj.getTime() < defCreatedTime) return null; // Task didn't exist yet
        const state = taskStates.find(t => t.taskId === def.id && t.date === dateStr && !t.deleted);
        return state ? state.status : 'NOT DONE';
      });
    });

    setTaskMatrix({ dates: matrixDates, tasks: tasksRecord });
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted font-bold tracking-widest uppercase text-xs mt-10">Analyzing...</div>;
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <div className="p-6 sticky top-0 bg-background/90 backdrop-blur z-10 border-b border-border flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Progress</h1>
        <select 
          value={timeRange} 
          onChange={e => setTimeRange(e.target.value as any)}
          className="bg-surface text-xs font-bold uppercase tracking-widest p-2 rounded-lg border border-border outline-none"
        >
          <option value="7D">Last 7 Days</option>
          <option value="30D">Last 30 Days</option>
          <option value="90D">Last 90 Days</option>
          <option value="ALL">All Time</option>
        </select>
      </div>

      <div className="p-4 space-y-6">
        
        {/* TASK MATRIX */}
        <div className="bg-surface p-6 rounded-3xl border border-border overflow-x-auto custom-scrollbar">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Task History ({timeRange})</h2>
          
          <div className="min-w-fit pr-4">
            <div className="flex mb-2 text-center text-[10px] font-bold text-text-muted">
              <div className="w-[100px] text-left shrink-0">Task</div>
              <div className="flex space-x-1">
                {taskMatrix.dates.map(d => (
                  <div key={d} className="w-6 shrink-0">{parseInt(d.split('-')[2])}</div>
                ))}
              </div>
            </div>
            
            {Object.entries(taskMatrix.tasks).length === 0 ? (
              <p className="text-xs text-text-muted italic">No active tasks.</p>
            ) : (
              Object.entries(taskMatrix.tasks).map(([title, statuses]) => (
                <div key={title} className="flex items-center mb-2">
                  <div className="w-[100px] text-[10px] font-bold truncate pr-2 shrink-0 uppercase tracking-wide">{title}</div>
                  <div className="flex space-x-1">
                      {statuses.map((s, idx) => (
                        <div 
                          key={idx} 
                          title={`${taskMatrix.dates[idx]} - ${s}`}
                          className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[10px] font-black transition-colors ${
                            s === 'DONE' ? 'bg-accent text-white' : 
                            s === 'SKIPPED' ? 'bg-border text-text-muted' : 
                            s === null ? 'bg-transparent text-transparent' : 
                            'bg-background border border-border text-text-muted/50'
                          }`}
                        >
                          {s === 'DONE' ? '✓' : s === 'SKIPPED' ? '✕' : ''}
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CONSISTENCY METRICS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface p-6 rounded-3xl border border-border text-center">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Gym Consistency</h3>
            {gymStats.planned > 0 ? (
              <>
                <p className="text-3xl font-black">{gymStats.percent}%</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{gymStats.completed} / {gymStats.planned} completed</p>
              </>
            ) : (
              <p className="text-xs text-text-muted mt-2 font-bold uppercase tracking-widest">Not Enough Data</p>
            )}
          </div>
          <div className="bg-surface p-6 rounded-3xl border border-border text-center">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Task Consistency</h3>
            {taskStats.total > 0 ? (
              <>
                <p className="text-3xl font-black">{taskStats.percent}%</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{taskStats.done} / {taskStats.total} done</p>
              </>
            ) : (
              <p className="text-xs text-text-muted mt-2 font-bold uppercase tracking-widest">Not Enough Data</p>
            )}
          </div>
        </div>

        {/* WEIGHT TREND */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Body Weight Trend</h2>
          </div>
          {weightData.length < 2 ? (
            <p className="text-[10px] text-text-muted text-center py-8 font-bold uppercase tracking-widest">Not Enough Data</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="weight" stroke="#FF3B30" strokeWidth={3} dot={{ r: 4, fill: '#FF3B30' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* SLEEP TREND */}
        <div className="bg-surface p-6 rounded-3xl border border-border">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Sleep Duration</h2>
          {sleepData.length < 2 ? (
            <p className="text-[10px] text-text-muted text-center py-8 font-bold uppercase tracking-widest">Not Enough Data</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData}>
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 'auto']} ticks={[0, 2, 4, 6, 8, 10]} tickFormatter={v => `${v}h`} fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: '#2C2C2E' }} />
                  <Bar dataKey="hours" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
