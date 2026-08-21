import { useEffect, useState } from 'react';
import { db } from '../../db/dexie';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SyncStatus() {
  const user = useAuthStore(state => state.user);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Poll sync engine's public state if it had one, but we didn't add getters.
  // Instead, we can observe the sync queue count as an indicator.
  const pendingCount = useLiveQuery(
    () => user ? db.sync_queue.where('user_id').equals(user.id).count() : 0,
    [user?.id],
    0
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        OFFLINE
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-2 text-accent bg-accent/10 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">
        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        SYNCING ({pendingCount})
      </div>
    );
  }

  return null;
}
