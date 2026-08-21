import { useState, useEffect } from 'react';
import { createBaseEntity } from '../../domain/core/BaseEntity';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { localRepo } from '../../db/repositories/LocalRepository';
import type { Food, FoodLog } from '../../db/dexie';
import { getLocalYYYYMMDD } from '../../domain/calendar/dateUtils';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function Nutrition() {
  const [activeTab, setActiveTab] = useState<'LOG' | 'HISTORY'>('LOG');

  useEffect(() => {
    const saved = localStorage.getItem('svaro_fuel_tab');
    if (saved === 'LOG' || saved === 'HISTORY') setActiveTab(saved);
  }, []);

  const setTab = (tab: 'LOG'|'HISTORY') => {
    setActiveTab(tab);
    localStorage.setItem('svaro_fuel_tab', tab);
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <div className="flex border-b border-border bg-surface sticky top-0 z-10">
        <button className={`flex-1 py-4 text-center font-bold text-sm tracking-wider ${activeTab === 'LOG' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`} onClick={() => setTab('LOG')}>LOG</button>
        <button className={`flex-1 py-4 text-center font-bold text-sm tracking-wider ${activeTab === 'HISTORY' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`} onClick={() => setTab('HISTORY')}>HISTORY</button>
      </div>
      <div className="flex-1 p-4">
        {activeTab === 'LOG' && <LogTab />}
        {activeTab === 'HISTORY' && <HistoryTab />}
      </div>
    </div>
  );
}

function LogTab() {
  const userId = useAuthStore(state => state.user?.id);
  const { nutritionTarget } = useAppStore();
  
  const [date, setDate] = useState(new Date());
  const [foods, setFoods] = useState<Food[]>([]);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadData();
  }, [userId, date]);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    
    const [allFoods, allLogs] = await Promise.all([
      localRepo.getFoods(),
      localRepo.getFoodLogs(userId)
    ]);
    
    const activeFoods = allFoods.filter((f: any) => !f.deleted);
    setFoods(activeFoods.sort((a: any,b: any) => a.name.localeCompare(b.name)));
    
    const ds = getLocalYYYYMMDD(date);
    const dayLogs = allLogs.filter(l => !l.deleted && getLocalYYYYMMDD(new Date(l.timestamp)) === ds);
    setLogs(dayLogs);
    setLoading(false);
  };

  const deleteLog = async (id: string) => {
    if (!userId) return;
    const log = await localRepo.db.food_logs.get(id);
    if (log) {
      log.deleted = true;
      await localRepo.saveFoodLog(log);
      loadData();
    }
  };

  const prevDay = () => {
    const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d);
  };
  const nextDay = () => {
    const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d);
  };

  const totals = logs.reduce((acc, l) => ({
    cal: acc.cal + l.calories,
    pro: acc.pro + l.protein,
    car: acc.car + l.carbs,
    fat: acc.fat + l.fat
  }), { cal: 0, pro: 0, car: 0, fat: 0 });

  if (loading) return <div className="p-8 text-center font-bold text-text-muted text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-2xl border border-border">
        <button onClick={prevDay} className="p-2"><ChevronLeft size={20}/></button>
        <span className="font-black uppercase tracking-widest text-sm">
          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button onClick={nextDay} className="p-2"><ChevronRight size={20}/></button>
      </div>

      {/* Summary */}
      <div className="bg-surface rounded-3xl p-5 border border-border">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-xl font-black">{Math.round(totals.cal)}</p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted">Kcal</p>
            {nutritionTarget && <div className="w-full h-1 bg-background mt-2 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${Math.min(100, (totals.cal/nutritionTarget.calories)*100)}%` }}/></div>}
          </div>
          <div>
            <p className="text-xl font-black text-blue-400">{Math.round(totals.pro)}<span className="text-xs">g</span></p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted">Pro</p>
          </div>
          <div>
            <p className="text-xl font-black text-yellow-400">{Math.round(totals.car)}<span className="text-xs">g</span></p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted">Carbs</p>
          </div>
          <div>
            <p className="text-xl font-black text-red-400">{Math.round(totals.fat)}<span className="text-xs">g</span></p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted">Fat</p>
          </div>
        </div>
      </div>

      <button onClick={() => setIsLogging(true)} className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 flex items-center justify-center space-x-2">
        <Plus size={20} />
        <span>Log Food</span>
      </button>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">No food logged yet.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-surface p-4 rounded-2xl border border-border flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{log.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-bold text-accent">{log.amount}{log.servingUnit || 'g'}</span>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest">{Math.round(log.calories)} kcal</span>
                </div>
                {log.mealType && <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-1">{log.mealType}</p>}
              </div>
              <button onClick={() => deleteLog(log.id)} className="p-2 text-text-muted hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {isLogging && (
        <LogFoodModal 
          date={date}
          foods={foods} 
          onClose={() => setIsLogging(false)} 
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

function LogFoodModal({ date, foods, onRefresh, onClose }: { date: string|Date, foods: Food[], onRefresh: ()=>void, onClose: ()=>void }) {
  const userId = useAuthStore(state => state.user?.id);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  
  const [amount, setAmount] = useState<number | ''>(100);
  const [unit, setUnit] = useState<'g' | 'ml' | 'piece'>('g');
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'PRE-WORKOUT' | 'POST-WORKOUT' | 'SNACK'>('BREAKFAST');
  
  const [cal, setCal] = useState<number | ''>('');
  const [pro, setPro] = useState<number | ''>('');
  const [car, setCar] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isCreatingCustom && selectedFoodId && selectedFoodId !== 'CUSTOM' && amount !== '' && !isManualOverride) {
      const f = foods.find((f: any) => f.id === selectedFoodId);
      if (f) {
        setUnit(f.servingUnit as any || 'g');
        const factor = Number(amount) / f.servingSize;
        setCal(Number((f.calories * factor).toFixed(1)));
        setPro(Number((f.protein * factor).toFixed(1)));
        setCar(Number((f.carbs * factor).toFixed(1)));
        setFat(Number((f.fat * factor).toFixed(1)));
      }
    }
  }, [selectedFoodId, amount, foods, isCreatingCustom, isManualOverride]);

  const handleManualChange = (setter: any, val: string) => {
    setIsManualOverride(true);
    setter(Number(val) || '');
  };

  const handleSave = async () => {
    if (!userId) return;

    if (isCreatingCustom) {
      if (!customName || cal === '') {
        setErrorMsg('Name and Calories required');
        return;
      }
      const newFood: Food = {
        id: `custom_${Date.now()}`,
        name: customName,
        servingSize: Number(amount) || (unit === 'piece' ? 1 : 100),
        servingUnit: unit,
        calories: Number(cal),
        protein: Number(pro) || 0,
        carbs: Number(car) || 0,
        fat: Number(fat) || 0,
        fiber: 0,
        source: 'user',
        created_at: Date.now()
      };
      await localRepo.saveFood(newFood);
      
      setIsCreatingCustom(false);
      setCustomName('');
      setAmount(100);
      setUnit('g');
      setCal(''); setPro(''); setCar(''); setFat('');
      setIsManualOverride(false);
      onRefresh();
      return;
    }

    if (!selectedFoodId) {
      setErrorMsg('Please select a food');
      return;
    }

    const f = foods.find((f: any) => f.id === selectedFoodId);
    if (!f) return;

    const log: FoodLog = {
      ...createBaseEntity(userId),
      foodId: f.id,
      name: f.name,
      amount: Number(amount) || f.servingSize,
      servingUnit: unit,
      mealType,
      calories: Number(cal) || 0,
      protein: Number(pro) || 0,
      carbs: Number(car) || 0,
      fat: Number(fat) || 0,
      fiber: 0,
      timestamp: new Date(date).setHours(12,0,0,0)
    };
    
    await localRepo.saveFoodLog(log);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-3xl border border-border p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-xl uppercase">{isCreatingCustom ? 'Create Custom Food' : 'Log Food'}</h2>
          {isManualOverride && !isCreatingCustom && <span className="text-[10px] bg-accent text-white px-2 py-1 rounded font-black tracking-widest uppercase">Manual Edit</span>}
        </div>
        {errorMsg && <p className="text-red-500 text-xs font-bold mb-4">{errorMsg}</p>}
        
        <div className="space-y-4">
          {!isCreatingCustom ? (
            <>
              <div className="relative">
                <select 
                  className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold appearance-none pr-12"
                  value={selectedFoodId}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') {
                      setIsCreatingCustom(true);
                      setAmount(100);
                      setUnit('g');
                      setCal(''); setPro(''); setCar(''); setFat('');
                      setIsManualOverride(true);
                    } else {
                      setSelectedFoodId(e.target.value);
                      setIsManualOverride(false);
                      const f = foods.find((fx:any) => fx.id === e.target.value);
                      if (f) setUnit(f.servingUnit as any || 'g');
                    }
                  }}
                >
                  <option value="">Select a food...</option>
                  <option value="CUSTOM" className="text-accent">+ Create Custom Food</option>
                  {foods.filter((f: any) => !f.deleted).map((f: any) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {selectedFoodId && selectedFoodId !== 'CUSTOM' && foods.find((f:any) => f.id === selectedFoodId)?.source === 'user' && (
                  <button 
                    onClick={async () => {
                      const f = foods.find((fx:any) => fx.id === selectedFoodId);
                      if (f && f.source === 'user') {
                        await localRepo.saveFood({ ...f, deleted: true, updated_at: Date.now() });
                        setSelectedFoodId('');
                        onRefresh();
                      }
                    }}
                    className="absolute right-2 top-2 p-2 bg-red-500/10 text-red-500 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Meal Timing</label>
                <select 
                  className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold appearance-none"
                  value={mealType}
                  onChange={e => setMealType(e.target.value as any)}
                >
                  <option value="BREAKFAST">BREAKFAST</option>
                  <option value="LUNCH">LUNCH</option>
                  <option value="DINNER">DINNER</option>
                  <option value="PRE-WORKOUT">PRE-WORKOUT</option>
                  <option value="POST-WORKOUT">POST-WORKOUT</option>
                  <option value="SNACK">SNACK</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Custom Food Name" 
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold"
              />
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Unit Type</label>
                <select 
                  className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold appearance-none"
                  value={unit}
                  onChange={e => {
                    setUnit(e.target.value as any);
                    if (e.target.value === 'piece') setAmount(1);
                    else setAmount(100);
                  }}
                >
                  <option value="g">Grams (g)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="piece">Pieces (e.g., 1 egg)</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              {isCreatingCustom ? 'Base Amount' : 'Amount'} ({unit})
            </label>
            <input 
              type="number" 
              placeholder={unit === 'piece' ? '1' : '100'} 
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || '')}
              className="w-full bg-background border border-border p-4 rounded-xl text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Calories (kcal)</label>
              <input type="number" value={cal} onChange={e => handleManualChange(setCal, e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl font-bold text-center" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Protein (g)</label>
              <input type="number" value={pro} onChange={e => handleManualChange(setPro, e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl font-bold text-center text-blue-400" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Carbs (g)</label>
              <input type="number" value={car} onChange={e => handleManualChange(setCar, e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl font-bold text-center text-yellow-400" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fat (g)</label>
              <input type="number" value={fat} onChange={e => handleManualChange(setFat, e.target.value)} className="w-full bg-background border border-border p-3 rounded-xl font-bold text-center text-red-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={isCreatingCustom ? () => { setIsCreatingCustom(false); setIsManualOverride(false); setSelectedFoodId(''); } : onClose} className="flex-1 bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} className="flex-1 bg-accent border-2 border-accent text-white py-4 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg">{isCreatingCustom ? 'Save Definition' : 'Log Food'}</button>
        </div>
      </div>
    </div>
  );
}

function HistoryTab() {
  const userId = useAuthStore(state => state.user?.id);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) return;
    const logs = await localRepo.getFoodLogs(userId);
    const valid = logs.filter(l => !l.deleted);
    
    // Group by date
    const groups: Record<string, typeof valid> = {};
    valid.forEach(l => {
      const d = getLocalYYYYMMDD(new Date(l.timestamp));
      if (!groups[d]) groups[d] = [];
      groups[d].push(l);
    });

    const sortedDates = Object.keys(groups).sort((a,b) => b.localeCompare(a));
    const h = sortedDates.map(date => ({
      date,
      logs: groups[date],
      cal: groups[date].reduce((a,b)=>a+b.calories,0),
      pro: groups[date].reduce((a,b)=>a+b.protein,0),
      car: groups[date].reduce((a,b)=>a+b.carbs,0),
      fat: groups[date].reduce((a,b)=>a+b.fat,0),
    }));
    
    setHistory(h);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-sm font-bold text-text-muted">Loading...</div>;

  return (
    <div className="space-y-4">
      {history.length === 0 ? <p className="text-center text-sm text-text-muted py-8">No history found.</p> : history.map(day => (
        <div key={day.date} className="bg-surface p-5 rounded-2xl border border-border">
          <h3 className="font-black text-sm uppercase tracking-widest mb-3">
            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4 pb-4 border-b border-border">
            <div><span className="block text-white text-base mb-1">{Math.round(day.cal)}</span>Kcal</div>
            <div><span className="block text-blue-400 text-base mb-1">{Math.round(day.pro)}</span>Pro</div>
            <div><span className="block text-yellow-400 text-base mb-1">{Math.round(day.car)}</span>Carbs</div>
            <div><span className="block text-red-400 text-base mb-1">{Math.round(day.fat)}</span>Fat</div>
          </div>
            <div className="space-y-3">
              {day.logs.map((l: FoodLog) => (
                <div key={l.id} className="flex flex-col">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">{l.name} <span className="text-text-muted font-normal">({l.amount}{l.servingUnit || 'g'})</span></span>
                    <span className="text-accent font-bold">{Math.round(l.calories)} kcal</span>
                  </div>
                  {l.mealType && <span className="text-[9px] text-text-muted font-bold tracking-widest uppercase">{l.mealType}</span>}
                </div>
              ))}
            </div>
        </div>
      ))}
    </div>
  );
}
