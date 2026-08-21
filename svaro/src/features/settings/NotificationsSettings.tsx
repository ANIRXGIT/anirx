import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function NotificationsSettings() {
  const navigate = useNavigate();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const [toggles, setToggles] = useState({
    tasks: false,
    workout: false,
    water: false,
    sleep: false,
    progress: false
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('denied'); // Not supported
    }

    const saved = localStorage.getItem('svaro_notification_prefs');
    if (saved) {
      setToggles(JSON.parse(saved));
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPermission(perm);
  };

  const handleToggle = (key: keyof typeof toggles) => {
    if (permission !== 'granted') {
      alert('Please enable browser notifications first.');
      return;
    }
    const newToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(newToggles);
    localStorage.setItem('svaro_notification_prefs', JSON.stringify(newToggles));
  };

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <header className="p-4 sticky top-0 bg-background/90 backdrop-blur z-10 border-b border-border flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-black uppercase tracking-tight">Notifications</h1>
      </header>

      <div className="p-4 space-y-6 mt-2">
        <div className="bg-surface p-6 rounded-3xl border border-border">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">System Permission</h2>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">Push Notifications</span>
            {permission === 'granted' ? (
              <span className="text-[10px] font-black uppercase tracking-widest bg-accent text-white px-2 py-1 rounded">Enabled</span>
            ) : (
              <button onClick={requestPermission} className="text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white px-3 py-1 rounded">Enable</button>
            )}
          </div>
          {permission === 'denied' && (
            <p className="text-xs text-red-500 mt-2 font-bold">Notifications blocked by browser/OS. Please enable in your device settings.</p>
          )}
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-border space-y-6">
          <h2 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Notification Types</h2>
          
          <ToggleRow label="Task Reminders" active={toggles.tasks} onToggle={() => handleToggle('tasks')} />
          <ToggleRow label="Workout Reminders" active={toggles.workout} onToggle={() => handleToggle('workout')} />
          <ToggleRow label="Water Reminders" active={toggles.water} onToggle={() => handleToggle('water')} />
          <ToggleRow label="Sleep Reminders" active={toggles.sleep} onToggle={() => handleToggle('sleep')} />
          <ToggleRow label="Progress Reminders" active={toggles.progress} onToggle={() => handleToggle('progress')} />
        </div>
        <p className="text-xs text-text-muted font-bold mt-4 uppercase tracking-widest leading-relaxed">
          LIMITATION: iOS and many mobile browsers restrict background Push Notifications for PWAs without a dedicated Push Server. These toggles currently enable IN-APP alerts only while SVARO is actively open.
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-sm">{label}</span>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-accent' : 'bg-border'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
