import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './stores/useAppStore';
import { useAuthStore } from './stores/useAuthStore';

// Layouts
import MainLayout from './components/navigation/MainLayout';
import OwnerProtectedRoute from './features/owner/OwnerProtectedRoute';

// Features
import Dashboard from './features/dashboard/Dashboard';
import Onboarding from './features/onboarding/Onboarding';
import Workout from './features/workout/Workout';
import Nutrition from './features/nutrition/Nutrition';
import Progress from './features/progress/Progress';
import More from './features/settings/More';
import Login from './features/auth/Login';

function App() {
  const { profile, isLoading: isAppLoading, loadInitialData } = useAppStore();
  const { user, initialize: initAuth, isLoading: isAuthLoading } = useAuthStore();

  const isLoading = isAppLoading || isAuthLoading;

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (user) {
      loadInitialData(user.id);
    } else {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-text">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-surface border-t-accent rounded-full animate-spin"></div>
          <p className="font-bold tracking-widest text-sm text-text-muted">LOADING SVARO OS</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<Login />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : !profile ? (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fitness" element={<Workout />} />
            <Route path="/nutrition/*" element={<Nutrition />} />
            <Route path="/health/*" element={<Progress />} />
            <Route path="/settings/*" element={<More />} />
          </Route>
        )}

        <Route path="/owner/*" element={<OwnerProtectedRoute />} />
        
        <Route path="*" element={<Navigate to={!user ? "/auth" : (!profile ? "/onboarding" : "/")} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
