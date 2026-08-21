import { useState, useEffect } from 'react';
import { cloudRepo } from '../../db/repositories/CloudRepository';

type Tab = 'exercises' | 'foods' | 'workouts' | 'challenges' | 'tasks' | 'supplements';

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('exercises');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'exercises') setItems(await cloudRepo.getExercises());
      else if (activeTab === 'foods') setItems(await cloudRepo.getFoods());
      else if (activeTab === 'workouts') setItems(await cloudRepo.getWorkoutTemplates());
      else if (activeTab === 'challenges') setItems(await cloudRepo.getChallengeTemplates());
      else if (activeTab === 'tasks') setItems(await cloudRepo.getTaskTemplates());
      else if (activeTab === 'supplements') setItems(await cloudRepo.getSupplementTemplates());
      else setItems([]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async (item: any) => {
    try {
      if (activeTab === 'exercises') await cloudRepo.saveExercise(item);
      else if (activeTab === 'foods') await cloudRepo.saveFood(item);
      else if (activeTab === 'workouts') await cloudRepo.saveWorkoutTemplate(item);
      else if (activeTab === 'challenges') await cloudRepo.saveChallengeTemplate(item);
      else if (activeTab === 'tasks') await cloudRepo.saveTaskTemplate(item);
      else if (activeTab === 'supplements') await cloudRepo.saveSupplementTemplate(item);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const [editingItem, setEditingItem] = useState<any>(null);

  const handleAddNew = () => {
    setEditingItem({ id: crypto.randomUUID() });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    await handleSave(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8 pb-24 relative">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-none">DATABASE</h1>
          <p className="text-[10px] font-black text-accent mt-1 uppercase tracking-widest">Global Repository</p>
        </div>
      </header>
      
      <div className="flex bg-surface rounded-full p-1 gap-1 border border-border overflow-x-auto snap-x hide-scrollbar">
        {['exercises', 'foods', 'workouts', 'challenges', 'tasks', 'supplements'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex-1 min-w-[100px] snap-center text-[10px] font-black uppercase tracking-widest py-3 rounded-full transition-all ${
              activeTab === tab ? 'bg-accent text-white shadow-md' : 'text-text-muted hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-text-muted animate-pulse">Syncing Vault...</div>
      ) : (
        <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-[10px] text-text-muted uppercase tracking-widest">{activeTab} Entities</h2>
            <button 
              onClick={handleAddNew}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors active:scale-95"
            >
              + Create
            </button>
          </div>
          
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest text-center py-8">Zero records found.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-background border border-border rounded-xl hover:border-accent transition-colors shadow-sm">
                  <div>
                    <p className="font-bold tracking-wide">{item.name || item.title || 'Unnamed Entity'}</p>
                    <p className="text-[9px] font-mono text-text-muted mt-1 uppercase opacity-70">{item.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="text-[10px] font-black uppercase tracking-widest text-text hover:text-accent px-3 py-1 bg-surface border border-border rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Deactivate?")) await handleSave({ ...item, active: false });
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-error hover:text-white px-3 py-1 bg-surface border border-error/50 hover:bg-error rounded transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Edit {activeTab}</h2>
            <div className="flex-1 overflow-y-auto mb-4">
              <textarea 
                className="w-full h-64 bg-background border border-border rounded p-3 font-mono text-sm"
                value={JSON.stringify(editingItem, null, 2)}
                onChange={(e) => {
                  try {
                    setEditingItem(JSON.parse(e.target.value));
                  } catch (err) {
                    // ignore parse errors while typing
                  }
                }}
              />
              <p className="text-xs text-text-muted mt-2">Edit JSON representation. Ensure correct schema.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSaveEdit}
                className="flex-1 bg-accent text-white font-bold py-2 rounded hover:bg-accent-hover"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-surface-hover text-text font-bold border border-border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

