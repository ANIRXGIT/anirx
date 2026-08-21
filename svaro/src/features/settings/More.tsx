import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAppStore } from '../../stores/useAppStore';
import { User, Target, Bell, Shield, Database, LogOut } from 'lucide-react';
import NotificationsSettings from './NotificationsSettings';
import TransformationSettings from './TransformationSettings';
import ProfileSettings from './ProfileSettings';
import GoalsSettings from './GoalsSettings';
import { useState } from 'react';

export default function More() {
  return (
    <Routes>
      <Route path="/" element={<SettingsMenu />} />
      <Route path="/notifications" element={<NotificationsSettings />} />
      <Route path="/transformation" element={<TransformationSettings />} />
      <Route path="/profile" element={<ProfileSettings />} />
      <Route path="/goals" element={<GoalsSettings />} />
    </Routes>
  );
}

function SettingsMenu() {
  const navigate = useNavigate();
  const { signOut, isOwner } = useAuthStore();
  const { profile } = useAppStore();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  return (
    <div className="flex flex-col min-h-full bg-background text-text max-w-[430px] mx-auto w-full pb-6">
      <header className="p-6 pb-4 sticky top-0 bg-background/90 backdrop-blur z-10 border-b border-border">
        <h1 className="text-2xl font-black uppercase tracking-tight">Settings</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex items-center space-x-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center border border-accent/30">
            <User size={32} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase">{profile?.name || 'USER'}</h2>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{profile?.age}Y • {profile?.weightKg}KG • {profile?.heightCm}CM</p>
          </div>
        </div>

        {/* Configuration */}
        <div>
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-4 mb-2">Configuration</h3>
          <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            
            <button onClick={() => navigate('/settings/profile')} className="w-full flex items-center justify-between p-5 border-b border-border active:bg-background transition-colors">
              <div className="flex items-center space-x-3">
                <User size={20} className="text-text-muted" />
                <span className="font-bold text-sm">Profile</span>
              </div>
            </button>

            <button onClick={() => navigate('/settings/goals')} className="w-full flex items-center justify-between p-5 border-b border-border active:bg-background transition-colors">
              <div className="flex items-center space-x-3">
                <Target size={20} className="text-text-muted" />
                <span className="font-bold text-sm">Goals & Targets</span>
              </div>
            </button>
            
            <button onClick={() => navigate('/settings/transformation')} className="w-full flex items-center justify-between p-5 border-b border-border active:bg-background transition-colors">
              <div className="flex items-center space-x-3">
                <Database size={20} className="text-text-muted" />
                <span className="font-bold text-sm">Transformation Config</span>
              </div>
            </button>

            <button onClick={() => navigate('/settings/notifications')} className="w-full flex items-center justify-between p-5 border-b border-border active:bg-background transition-colors">
              <div className="flex items-center space-x-3">
                <Bell size={20} className="text-text-muted" />
                <span className="font-bold text-sm">Notifications</span>
              </div>
            </button>

            <button onClick={() => setShowSignOutConfirm(true)} className="w-full flex items-center justify-between p-5 active:bg-background transition-colors text-red-500">
              <div className="flex items-center space-x-3">
                <LogOut size={20} />
                <span className="font-bold text-sm">Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Owner Only */}
        {isOwner && (
          <div>
            <h3 className="text-[10px] font-black text-accent uppercase tracking-widest px-4 mb-2">Owner Controls</h3>
            <div className="bg-surface rounded-3xl border border-accent/30 overflow-hidden shadow-[0_0_15px_rgba(255,59,48,0.1)]">
              <button onClick={() => navigate('/owner')} className="w-full flex items-center justify-between p-5 active:bg-background transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield size={20} className="text-accent" />
                  <span className="font-bold text-sm text-accent">System Administration</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl text-center space-y-6">
            <h2 className="font-black text-xl">Sign Out?</h2>
            <div className="flex gap-4">
              <button onClick={() => setShowSignOutConfirm(false)} className="flex-1 bg-transparent border-2 border-border py-4 rounded-xl font-bold active:scale-95 text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={signOut} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-black active:scale-95 text-xs uppercase tracking-widest shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
