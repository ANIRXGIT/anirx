import { SyncQueue } from './SyncQueue';
import { type SyncQueueItem } from '../db/dexie';

export class MutationTracker {
  private inFlight = new Set<string>();

  /**
   * Acquire a lock on a mutation to prevent concurrent processing.
   */
  acquire(mutationId: string): boolean {
    if (this.inFlight.has(mutationId)) {
      return false;
    }
    this.inFlight.add(mutationId);
    return true;
  }

  /**
   * Release a lock on a mutation.
   */
  release(mutationId: string): void {
    this.inFlight.delete(mutationId);
  }

  /**
   * Check if a mutation is currently in flight.
   */
  isInFlight(mutationId: string): boolean {
    return this.inFlight.has(mutationId);
  }

  /**
   * Handle successful processing of a mutation.
   * Removes it from the local Dexie queue.
   */
  async markSuccess(item: SyncQueueItem, userId: string): Promise<void> {
    if (item.user_id !== userId) return;
    await SyncQueue.remove(item.id, userId);
    this.release(item.mutation_id);
  }

  /**
   * Handle transient failure of a mutation.
   * Increments retry count but does NOT discard the mutation.
   */
  async markFailure(item: SyncQueueItem, userId: string): Promise<void> {
    if (item.user_id !== userId) return;
    await SyncQueue.incrementRetry(item.id, userId);
    this.release(item.mutation_id);
  }
}

// Singleton instance for global tracking
export const mutationTracker = new MutationTracker();
