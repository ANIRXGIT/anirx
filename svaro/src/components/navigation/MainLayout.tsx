import { Outlet, Link, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import SyncStatus from './SyncStatus';

export default function MainLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/fitness', label: 'Fitness', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
    { path: '/nutrition', label: 'Diet', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { path: '/health', label: 'Progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/settings', label: 'More', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-black w-full">
      <div className="flex flex-col h-screen w-full max-w-[430px] bg-background text-text overflow-hidden relative shadow-2xl border-x border-border">
        {/* TOP BAR */}
        <header className="relative flex items-center justify-center p-4 border-b border-border bg-surface z-40">
          <span className="font-black tracking-widest text-lg">SVARO</span>
          <div className="absolute right-4">
            <SyncStatus />
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative w-full custom-scrollbar">
          <div className="w-full h-full">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

        {/* BOTTOM NAV */}
        <nav className="w-full bg-surface border-t border-border flex justify-around p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-[10px] font-bold z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-accent' : 'text-text-muted hover:text-text'}`}
              >
                <svg 
                  className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
