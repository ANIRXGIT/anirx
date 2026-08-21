import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { AdminEngine } from '../../domain/admin/AdminEngine';
import { SecureStorage } from '../../domain/admin/SecureStorage';

export default function SystemConfigView() {
  const userId = useAuthStore(state => state.user?.id);
  const [taskXp, setTaskXp] = useState(10);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setTaskXp(await AdminEngine.getConfigValue('gamification.task_xp', 10));
      setAiEnabled(await AdminEngine.getFlag('AI_ROUTING_ENABLED', false));
      setGeminiKey(await SecureStorage.get('GEMINI_API_KEY') || '');
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    
    // System Config
    await AdminEngine.setConfigValue('gamification.task_xp', taskXp, userId);
    
    // Feature Flags
    await AdminEngine.setFlag('AI_ROUTING_ENABLED', aiEnabled, userId);
    
    // AI Credentials (Zero-Knowledge)
    if (geminiKey) {
      await SecureStorage.set('GEMINI_API_KEY', geminiKey);
    } else {
      await SecureStorage.remove('GEMINI_API_KEY');
    }
    
    setSaving(false);
    alert('System Configuration Updated & Audited');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tight">System Configuration</h1>
      
      <div className="bg-surface p-6 rounded-3xl border border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">Gamification Parameters</h2>
        <div className="flex flex-col">
          <label className="text-sm text-text-muted font-bold mb-1">Task Completion XP</label>
          <input 
            type="number" 
            value={taskXp} 
            onChange={e => setTaskXp(Number(e.target.value))}
            className="bg-background border border-border p-2 rounded focus:border-accent outline-none"
          />
        </div>
      </div>

      <div className="bg-surface p-6 rounded-3xl border border-border space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-2">Artificial Intelligence</h2>
        
        <div className="flex items-center justify-between">
          <label className="text-sm text-text-muted font-bold">Enable AI Routing Engine</label>
          <input 
            type="checkbox" 
            checked={aiEnabled}
            onChange={e => setAiEnabled(e.target.checked)}
            className="w-5 h-5 accent-accent"
          />
        </div>

        <div className="flex flex-col mt-4">
          <label className="text-sm text-text-muted font-bold mb-1">Gemini API Key (Local Secure Storage Only)</label>
          <input 
            type="password" 
            value={geminiKey} 
            onChange={e => setGeminiKey(e.target.value)}
            placeholder="AI credentials never leave this device"
            className="bg-background border border-border p-2 rounded focus:border-accent outline-none font-mono"
          />
        </div>
      </div>

      <button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-accent text-white font-black py-4 rounded-xl hover:opacity-90 disabled:opacity-50"
      >
        {saving ? 'Synchronizing...' : 'Save Configuration'}
      </button>

    </div>
  );
}

