import { SyncPush } from './SyncPush';
import { SyncPull } from './SyncPull';
import { MediaSync } from './MediaSync';
import { SyncReconciler } from './SyncReconciler';

export class SyncEngine {
  static async forceUploadAllLocalData(userId: string): Promise<void> {
    if (!userId) return;
    const { SyncQueue } = await import('./SyncQueue');
    const { db } = await import('../db/dexie');
    
    for (const table of db.tables) {
      if (['sync_queue', 'sync_cursors', 'local_media'].includes(table.name)) continue;
      const records = await table.toArray();
      for (const record of records) {
        if (record.user_id !== userId) continue;
        await SyncQueue.enqueue(userId, 'ENTITY_MUTATION', table.name, record.id, { ...record, operation: 'UPSERT' });
      }
    }
    await this.runSyncCycle();
  }

  static isSyncing = false;
  private static currentUserId: string | null = null;
  private static syncInterval: any = null;
  private static hasReconciled = false;

  static initialize(userId: string | null) {
    if (this.currentUserId === userId) return;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.currentUserId = userId;
    this.hasReconciled = false;

    if (userId) {
      this.syncInterval = setInterval(() => this.runSyncCycle(), 15000); 
      
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.runSyncCycle());
        window.addEventListener('focus', () => this.runSyncCycle());
      }

      setTimeout(() => this.runSyncCycle(), 1000);
    }
  }

  static async runSyncCycle(): Promise<void> {
    const userId = this.currentUserId;
    if (!userId || this.isSyncing) return;
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    if (typeof navigator !== 'undefined' && navigator.locks) {
      await navigator.locks.request('svaro_sync_lock', { ifAvailable: true }, async (lock) => {
        if (!lock) return;
        await this._executeSync(userId);
      });
    } else {
      await this._executeSync(userId);
    }
  }

  private static async _executeSync(userId: string): Promise<void> {
    try {
      this.isSyncing = true;

      await MediaSync.syncMedia(userId);
      await SyncPush.pushAll(userId);
      const pulledChanges = await SyncPull.pullAll(userId);

      if (!this.hasReconciled) {
         await SyncReconciler.sweep(userId);
         this.hasReconciled = true;
      }

      if (pulledChanges || this.hasReconciled) {
        const { useAppStore } = await import('../stores/useAppStore');
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
