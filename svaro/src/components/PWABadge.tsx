import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWABadge() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-surface border border-border p-4 rounded-xl shadow-2xl flex flex-col items-start gap-2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="font-bold text-sm">Update Available</div>
      <div className="text-xs text-text-muted">A new version of SVARO is ready to install.</div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-accent text-white px-3 py-1.5 rounded text-xs font-bold"
        >
          Reload
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="bg-background text-text px-3 py-1.5 rounded border border-border text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
}
