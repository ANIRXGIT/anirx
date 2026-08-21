import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import OwnerLayout from './OwnerLayout';
import Overview from './Overview';
import BackupRestore from './BackupRestore';
import ContentManagement from './ContentManagement';
import SystemConfigView from './SystemConfigView';
import UserAdminView from './UserAdminView';
import AuditLogView from './AuditLogView';

export default function OwnerProtectedRoute() {
  const { session, isOwner, isLoading, signInWithGoogle } = useAuthStore();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Verifying Identity...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <h1 className="text-xl font-bold">Owner Access Required</h1>
        <button onClick={signInWithGoogle} className="bg-accent text-white px-4 py-2 rounded font-bold">
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4 text-center px-4">
        <h1 className="text-xl font-bold text-red-500">Access Denied</h1>
        <p>Your account is not authorized as the Owner.</p>
        <button onClick={() => window.location.href = '/'} className="bg-surface text-text px-4 py-2 rounded border border-border">
          Return to App
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<OwnerLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/system" element={<SystemConfigView />} />
        <Route path="/users" element={<UserAdminView />} />
        <Route path="/audit" element={<AuditLogView />} />
        <Route path="/backup" element={<BackupRestore />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="*" element={<Navigate to="/owner" replace />} />
      </Route>
    </Routes>
  );
}
