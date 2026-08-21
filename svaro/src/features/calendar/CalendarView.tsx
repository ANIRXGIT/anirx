import { useState, useEffect } from 'react';
import { getMonthDays, isSameDay } from '../../domain/calendar/dateUtils';
import { localRepo } from '../../db/repositories/LocalRepository';
import { useAuthStore } from '../../stores/useAuthStore';

import { CalendarEngine } from '../../domain/calendar/CalendarEngine';
import type { DailyTask } from '../../db/dexie';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedTasks, setSelectedTasks] = useState<DailyTask[]>([]);
  
  const userId = useAuthStore(state => state.user?.id) || '';

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      localRepo.getLogsForDate(userId, selectedDate),
      // We also need daily tasks for the calendar engine
      // But getLogsForDate doesn't return tasks yet, we fetch them here
      localRepo.getTasksForDate(userId, selectedDate.toISOString())
    ]).then(([logs, tasks]) => {
      setSelectedData(logs);
      setSelectedTasks(tasks);
    });
  }, [selectedDate, userId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getMonthDays(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const firstDayOfWeek = daysInMonth[0].getDay();
  const [completions, setCompletions] = useState<Record<string, number>>({});
  const [hasDataMap, setHasDataMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) return;

    const fetchCompletions = async () => {
      const result: Record<string, number> = {};
      const dataMap: Record<string, boolean> = {};
      
      for (const date of daysInMonth) {
        if (date > new Date()) continue;
        
        const logs = await localRepo.getLogsForDate(userId, date);
        const tasks = await localRepo.getTasksForDate(userId, date.toISOString());
        
        const state = CalendarEngine.getDailyState(
          date,
          tasks,
          logs.habitLogs || [],
          logs.workouts,
          logs.foods,
          logs.waters,
          logs.steps
        );

        dataMap[date.toISOString().split('T')[0]] = state.hasData;
        if (state.hasData) {
          result[date.toISOString().split('T')[0]] = state.overallAdherencePercentage;
        }
      }
      setCompletions(result);
      setHasDataMap(dataMap);
    };
    fetchCompletions();
  }, [month, year, userId]);

  const padding = Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} className="h-10"></div>);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-surface p-4 rounded-full border border-border">
        <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors font-bold">&lt;</button>
        <span className="font-black text-sm uppercase tracking-widest">{monthNames[month]} {year}</span>
        <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors font-bold">&gt;</button>
      </header>
      
      <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl">
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-[10px] font-black text-text-muted uppercase tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {padding}
          {daysInMonth.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            const hasData = hasDataMap[dateStr];
            const completion = completions[dateStr] || 0;
            
            let borderClass = 'border-transparent';
            let bgClass = 'bg-transparent text-text hover:bg-surface-hover';
            
            if (hasData) {
              if (completion >= 80) {
                borderClass = 'border-accent';
                bgClass = 'bg-accent/20 text-accent font-black';
              } else if (completion >= 50) {
                borderClass = 'border-accent/50';
                bgClass = 'bg-accent/10 text-accent/80 font-bold';
              } else {
                borderClass = 'border-border';
                bgClass = 'bg-surface text-text font-bold';
              }
            }

            if (isSelected) {
              borderClass = 'border-white';
              bgClass = 'bg-white text-black font-black';
            } else if (isToday) {
              borderClass = 'border-text-muted border-dashed';
            }

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  h-10 w-full rounded-full flex items-center justify-center text-xs transition-all border-2
                  ${borderClass} ${bgClass}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-black text-text-muted uppercase tracking-widest">{selectedDate.toDateString()}</h2>
        
        {selectedData ? (
          <div className="space-y-3">
            {/* Daily Tasks */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
              <h3 className="font-black text-[10px] text-text-muted uppercase tracking-widest mb-2">Daily Tasks</h3>
              {selectedTasks.length > 0 ? (
                <div>
                  {selectedTasks.map(t => (
                    <p key={t.id} className="font-bold tracking-wide">
                      {t.title} <span className="text-xs text-text-muted uppercase">({t.status})</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-text-muted">No tasks generated.</p>
              )}
            </div>

            {/* Workout */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
              <h3 className="font-black text-[10px] text-text-muted uppercase tracking-widest mb-2">Workout</h3>
              {selectedData.workouts.length > 0 ? (
                <div>
                  {selectedData.workouts.map((w: any) => (
                    <p key={w.id} className="font-bold tracking-wide">{w.name} {w.completed ? '(Completed)' : '(Started)'}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-text-muted">No workout logged.</p>
              )}
            </div>

            {/* Nutrition */}
            <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
              <h3 className="font-black text-[10px] text-text-muted uppercase tracking-widest mb-2">Nutrition</h3>
              {selectedData.foods.length > 0 ? (
                <p className="font-bold tracking-wide">{selectedData.foods.reduce((acc: number, log: any) => acc + log.calories, 0)} kcal</p>
              ) : (
                <p className="text-sm font-medium text-text-muted">No food logged.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-text-muted">Loading records...</p>
        )}
      </div>
    </div>
  );
}

