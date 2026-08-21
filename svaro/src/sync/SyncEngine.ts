import { SyncPush } from './SyncPush';
import { SyncPull } from './SyncPull';
import { MediaSync } from './MediaSync';

export class SyncEngine {
  private static isSyncing = false;
  private static currentUserId: string | null = null;
  private static syncInterval: any = null;

  static initialize(userId: string | null) {
    if (this.currentUserId === userId) return;
    
    // Stop existing sync loop
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.currentUserId = userId;

    if (userId) {
      // Start loop
      this.syncInterval = setInterval(() => this.runSyncCycle(), 15000); // every 15s
      
      // Listen for reconnect
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.runSyncCycle());
        window.addEventListener('focus', () => this.runSyncCycle());
      }

      // Initial kickoff
      setTimeout(() => this.runSyncCycle(), 1000);
    }
  }

  static async runSyncCycle(): Promise<void> {
    const userId = this.currentUserId;
    if (!userId || this.isSyncing) return;
    
    // Only run if online
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    if (typeof navigator !== 'undefined' && navigator.locks) {
      await navigator.locks.request('svaro_sync_lock', { ifAvailable: true }, async (lock) => {
        if (!lock) return; // Another tab is currently syncing
        await this._executeSync(userId);
      });
    } else {
      await this._executeSync(userId);
    }
  }

  private static async _executeSync(userId: string): Promise<void> {
    try {
      this.isSyncing = true;

      // 1. Media Uploads
      await MediaSync.syncMedia(userId);

      // 2. Push Mutations
      await SyncPush.pushAll(userId);

      // 3. Pull Deltas
      const pulledChanges = await SyncPull.pullAll(userId);

      if (pulledChanges) {
        // Trigger React UI hydration
        const { useAppStore } = await import('../stores/useAppStore');
        // Do not pass userId here, or it will re-trigger the empty-profile check.
        // Or wait, if we pass userId, `loadInitialData(userId)` will just reload everything from localRepo,
        // because localRepo now HAS the profile from SyncPull!
        await useAppStore.getState().loadInitialData(userId);
      }

    } catch (e) {
      console.error('Sync Cycle Error:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * For the UI to explicitly trigger a sync ("Sync Now")
   */
  static async triggerManualSync(): Promise<void> {
    await this.runSyncCycle();
  }

  /**
   * Perform initial full sync for a fresh device
   */
  static async runInitialSync(userId: string): Promise<void> {
    if (!userId) return;
    // Initial sync is just pulling all tables up to date, which SyncPull.pullAll handles beautifully via cursor
    await SyncPull.pullAll(userId);
  }
}
