import fs from 'fs';
let content = fs.readFileSync('src/sync/SyncEngine.ts', 'utf8');

const runSyncCycleOriginal = `  static async runSyncCycle(): Promise<void> {
    const userId = this.currentUserId;
    if (!userId || this.isSyncing) return;
    
    // Only run if online
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    try {
      this.isSyncing = true;

      // 1. Media Uploads
      await MediaSync.syncMedia(userId);

      // 2. Push Mutations
      await SyncPush.pushAll(userId);

      // 3. Pull Deltas
      await SyncPull.pullAll(userId);

    } catch (e) {
      console.error('Sync Cycle Error:', e);
    } finally {
      this.isSyncing = false;
    }
  }`;

const runSyncCycleReplacement = `  static async runSyncCycle(): Promise<void> {
    const userId = this.currentUserId;
    if (!userId || this.isSyncing) return;
    
    // Only run if online
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    // Web Locks API guarantees only one tab processes the sync loop at a time.
    if (typeof navigator !== 'undefined' && navigator.locks) {
      await navigator.locks.request('svaro_sync_lock', { mode: 'exclusive', ifAvailable: true }, async (lock) => {
        if (!lock) {
          // Another tab is currently syncing
          return;
        }
        await this._executeSync(userId);
      });
    } else {
      // Fallback for unsupported browsers
      await this._executeSync(userId);
    }
  }

  private static async _executeSync(userId: string): Promise<void> {
    try {
      this.isSyncing = true;
      await MediaSync.syncMedia(userId);
      await SyncPush.pushAll(userId);
      await SyncPull.pullAll(userId);
    } catch (e) {
      console.error('Sync Cycle Error:', e);
    } finally {
      this.isSyncing = false;
    }
  }`;

content = content.replace(runSyncCycleOriginal, runSyncCycleReplacement);
fs.writeFileSync('src/sync/SyncEngine.ts', content);
