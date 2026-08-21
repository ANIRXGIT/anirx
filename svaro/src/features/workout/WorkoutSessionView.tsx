import { useState, useEffect } from 'react';
import { createBaseEntity } from '../../domain/core/BaseEntity';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import type { Exercise, WorkoutTemplate, SetLog } from '../../db/dexie';

export default function WorkoutSessionView({ template }: { template: WorkoutTemplate }) {
  const { todayWorkout, activeSessionSets, completeSet, finishWorkoutSession } = useAppStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  useEffect(() => {
    localRepo.getExercises().then(setExercises);
  }, []);

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  
  if (!todayWorkout) return null;
  if (exercises.length === 0) return <div>Loading...</div>;

  const currentTemplateExercise = template.exercises[currentExerciseIdx];
  if (!currentTemplateExercise) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Workout Complete</h2>
        <button onClick={finishWorkoutSession} className="w-full bg-accent text-white py-3 rounded font-bold">
          Finish Session
        </button>
      </div>
    );
  }

  const exerciseDetails = exercises.find(e => e.id === currentTemplateExercise.exerciseId);
  const setsLogged = activeSessionSets.filter(s => s.exerciseId === currentTemplateExercise.exerciseId);
  
  const handleLogSet = async (reps: number, weight: number, rpe: number, rir?: number, notes?: string) => {
    const setLog: SetLog = {
      ...createBaseEntity(useAuthStore.getState().user?.id || ''),
      sessionId: todayWorkout.id,
      exerciseId: currentTemplateExercise.exerciseId,
      setNumber: setsLogged.length + 1,
      reps,
      weight,
      rpe,
      rir,
      notes,
      completed: true,
      
    };
    await completeSet(setLog);
    
    // Check if exercise is complete
    if (setsLogged.length + 1 >= currentTemplateExercise.sets) {
      setTimeout(() => {
        setCurrentExerciseIdx(idx => idx + 1);
      }, 500);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <span className="text-accent font-black tracking-widest uppercase text-[10px]">Exercise {currentExerciseIdx + 1} of {template.exercises.length}</span>
          <h2 className="font-black text-3xl leading-tight mt-1">{exerciseDetails?.name}</h2>
        </div>
      </div>
      
      {setsLogged.length > 0 && (
        <div className="space-y-2">
          {setsLogged.map(set => (
            <div key={set.id} className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border">
              <span className="text-text-muted font-bold tracking-wider uppercase text-xs">Set {set.setNumber}</span>
              <span className="font-black text-lg">{set.weight}kg <span className="text-text-muted text-sm mx-1">×</span> {set.reps} <span className="text-text-muted text-xs font-normal ml-2">@RPE{set.rpe}</span></span>
            </div>
          ))}
        </div>
      )}

      {setsLogged.length < currentTemplateExercise.sets && (
        <SetInputForm 
          targetReps={currentTemplateExercise.reps} 
          setNumber={setsLogged.length + 1}
          onLog={handleLogSet} 
        />
      )}

      <div className="pt-4 flex justify-between mt-8">
        <button 
          onClick={() => setCurrentExerciseIdx(idx => Math.max(0, idx - 1))}
          disabled={currentExerciseIdx === 0}
          className="text-text-muted font-bold text-sm tracking-wider uppercase disabled:opacity-30"
        >
          Previous
        </button>
        <button 
          onClick={() => setCurrentExerciseIdx(idx => idx + 1)}
          className="text-accent font-bold text-sm tracking-wider uppercase"
        >
          Skip Exercise
        </button>
      </div>
    </div>
  );
}

function SetInputForm({ targetReps, setNumber, onLog }: { targetReps: string, setNumber: number, onLog: (reps: number, weight: number, rpe: number, rir?: number, notes?: string) => void }) {
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(20);
  const [rpe, setRpe] = useState(8);

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-2xl flex flex-col space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-accent font-black tracking-widest uppercase text-xs">Current Set</span>
          <h3 className="font-black text-4xl leading-none">SET {setNumber}</h3>
        </div>
        <p className="text-sm font-bold text-text-muted">Target: {targetReps} reps</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Input */}
        <div className="bg-background rounded-xl p-3 border border-border flex flex-col items-center">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Weight (kg)</label>
          <div className="flex items-center justify-between w-full">
            <button onClick={() => setWeight(w => Math.max(0, w - 2.5))} className="w-10 h-10 flex items-center justify-center bg-surface rounded-full text-xl font-bold hover:bg-surface-hover active:scale-95 transition-all">-</button>
            <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-14 bg-transparent text-center text-2xl font-black outline-none" />
            <button onClick={() => setWeight(w => w + 2.5)} className="w-10 h-10 flex items-center justify-center bg-surface rounded-full text-xl font-bold hover:bg-surface-hover active:scale-95 transition-all">+</button>
          </div>
        </div>

        {/* Reps Input */}
        <div className="bg-background rounded-xl p-3 border border-border flex flex-col items-center">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Reps</label>
          <div className="flex items-center justify-between w-full">
            <button onClick={() => setReps(r => Math.max(0, r - 1))} className="w-10 h-10 flex items-center justify-center bg-surface rounded-full text-xl font-bold hover:bg-surface-hover active:scale-95 transition-all">-</button>
            <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} className="w-14 bg-transparent text-center text-2xl font-black outline-none" />
            <button onClick={() => setReps(r => r + 1)} className="w-10 h-10 flex items-center justify-center bg-surface rounded-full text-xl font-bold hover:bg-surface-hover active:scale-95 transition-all">+</button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-background rounded-xl p-4 border border-border">
        <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Intensity (RPE)</label>
        <div className="flex gap-2">
          {[7, 8, 9, 10].map(val => (
            <button 
              key={val}
              onClick={() => setRpe(val)}
              className={`w-10 h-10 rounded-full font-bold transition-all ${rpe === val ? 'bg-accent text-white border-accent' : 'bg-surface border-border text-text-muted border hover:border-accent/50'}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => onLog(reps, weight, rpe, undefined, '')}
        className="w-full bg-accent hover:bg-accent-hover text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,59,48,0.3)]"
      >
        Complete Set
      </button>
    </div>
  );
}

