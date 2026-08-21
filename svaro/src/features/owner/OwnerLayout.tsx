import { Outlet, Link, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../components/navigation/ErrorBoundary';
import { useAuthStore } from '../../stores/useAuthStore';

export default function OwnerLayout() {
  const { pathname } = useLocation();
  const { signOut } = useAuthStore();

  const links = [
    { to: '/owner', label: 'Overview' },
    { to: '/owner/system', label: 'System Config' },
    { to: '/owner/users', label: 'Users & Roles' },
    { to: '/owner/audit', label: 'Audit Logs' },
    { to: '/owner/content', label: 'Content' },
    { to: '/owner/backup', label: 'Backup' },
  ];

  return (
    <div className="min-h-full bg-background text-text flex flex-col">
      <header className="border-b border-border bg-surface p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-text-muted hover:text-text font-bold">&larr; Back to App</Link>
          <h1 className="text-lg font-black text-accent tracking-widest">OWNER MODE</h1>
        </div>
        <button onClick={signOut} className="text-xs border border-border px-3 py-1 rounded hover:bg-surface-hover">
          Sign Out
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 border-r border-border bg-surface flex flex-col p-4 space-y-2">
          {links.map(l => (
            <Link 
              key={l.to} 
              to={l.to}
              className={`p-2 rounded text-sm font-bold ${pathname === l.to ? 'bg-accent/20 text-accent' : 'hover:bg-surface-hover'}`}
            >
              {l.label}
            </Link>
          ))}
        </aside>
        
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

