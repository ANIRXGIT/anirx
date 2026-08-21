import { supabase } from '../lib/supabase';
import { SyncQueue } from './SyncQueue';
import { mutationTracker } from './MutationTracker';
import { SyncPull } from './SyncPull';

export class SyncPush {
  static async pushAll(userId: string): Promise<void> {
    if (!userId) return;

    
    const allPending = await SyncQueue.getPendingByType(userId, 'ENTITY_MUTATION');
    if (allPending.length === 0) return;

    // Apply exponential backoff filter
    const now = Date.now();
    const pending = allPending.filter(item => {
      if (item.retry_count === 0) return true;
      const backoffMs = Math.pow(2, Math.min(item.retry_count, 10)) * 1000; 
      return (now - item.created_at) > backoffMs;
    });

    if (pending.length === 0) return;


    // Process in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      await this.pushBatch(userId, batch);
    }
  }

  static async pushBatch(userId: string, batch: any[]): Promise<void> {
    const payload = [];
    const lockedItems = [];

    // 1. Acquire Locks
    for (const item of batch) {
      if (item.user_id !== userId) continue; // Security invariant
      if (mutationTracker.acquire(item.mutation_id)) {
        lockedItems.push(item);
        payload.push({
          mutation_id: item.mutation_id,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          operation: 'UPSERT',
          payload: item.payload
        });
      }
    }

    if (payload.length === 0) return;

    // 2. Transmit to RPC
    try {
      const { data, error } = await supabase.rpc('sync_push', { payload });

      if (error) {
        // Network or fatal RPC error
        console.error('SyncPush Batch Error:', error);
        for (const item of lockedItems) {
          await mutationTracker.markFailure(item, userId);
        }
        return;
      }

      // 3. Process Results
      const results = data as any[];
      const conflictTables = new Set<string>();

      for (const item of lockedItems) {
        const result = results.find(r => r.mutation_id === item.mutation_id);
        
        if (!result) {
          // Should not happen unless server crashes mid-array
          await mutationTracker.markFailure(item, userId);
          continue;
        }

        if (result.status === 'SUCCESS') {
          // Success (including idempotent duplicates)
          await mutationTracker.markSuccess(item, userId);
        } else if (result.status === 'CONFLICT') {
          // Conflict: Server rejected our stale version.
          // Architecture says: Pull latest server state (do not overwrite).
          conflictTables.add(item.entity_type);
          
          // Discard the failing local mutation because server state won
          await mutationTracker.markSuccess(item, userId); // markSuccess removes it from queue
        } else if (result.status === 'ERROR') {
          // RLS or schema error. Do not loop endlessly.
          console.error(`SYNC FAILED\ntable: ${item.entity_type}\noperation: upsert\ncode: ${result.error?.code || 'UNKNOWN'}\nmessage: ${result.error?.message || JSON.stringify(result.error)}\nuser_id: ${userId}\ntimestamp: ${new Date().toISOString()}`);
          await mutationTracker.markSuccess(item, userId); 
        } else {
          // Unknown status
          await mutationTracker.markFailure(item, userId);
        }
      }

      // 4. Resolve Conflicts (Pull latest for affected tables)
      for (const table of conflictTables) {
        await SyncPull.pullTable(userId, table);
      }

    } catch (e) {
      // Network Exception
      for (const item of lockedItems) {
        await mutationTracker.markFailure(item, userId);
      }
    }
  }
}
