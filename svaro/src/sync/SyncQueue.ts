import { v4 as uuidv4 } from 'uuid';
import { db, type SyncQueueItem } from '../db/dexie';

export class SyncQueue {
  /**
   * Enqueue a new mutation into the local sync queue.
   * Scopes the mutation to the authenticated user.
   */
  static async enqueue(
    userId: string,
    type: 'ENTITY_MUTATION' | 'MEDIA_UPLOAD' | 'MEDIA_DELETE',
    entityType: string,
    entityId: string,
    payload: any
  ): Promise<string> {
    if (!userId) throw new Error('Cannot enqueue mutation without user_id');

    const id = uuidv4();
    const mutation_id = uuidv4(); // Generated exactly once per queued mutation

    const item: SyncQueueItem = {
      id,
      user_id: userId,
      mutation_id,
      type,
      entity_type: entityType,
      entity_id: entityId,
      payload,
      created_at: Date.now(),
      retry_count: 0
    };

    await db.sync_queue.add(item);
    return mutation_id;
  }

  /**
   * Fetch all pending mutations for a specific user.
   * STRICTLY SCOPED to the active user to prevent cross-account pollution.
   */
  static async getPending(userId: string): Promise<SyncQueueItem[]> {
    if (!userId) return [];
    return db.sync_queue.where('user_id').equals(userId).sortBy('created_at');
  }

  /**
   * Fetch pending mutations of a specific type for a user.
   */
  static async getPendingByType(userId: string, type: string): Promise<SyncQueueItem[]> {
    if (!userId) return [];
    return db.sync_queue.where('[user_id+type]').equals([userId, type]).sortBy('created_at');
  }

  /**
   * Remove an item from the queue after successful synchronization.
   */
  static async remove(itemId: string, userId: string): Promise<void> {
    // Ensure we only delete if it matches the user
    const item = await db.sync_queue.get(itemId);
    if (item && item.user_id === userId) {
      await db.sync_queue.delete(itemId);
    }
  }

  /**
   * Increment retry count for a queue item.
   */
  static async incrementRetry(itemId: string, userId: string): Promise<void> {
    const item = await db.sync_queue.get(itemId);
    if (item && item.user_id === userId) {
      await db.sync_queue.update(itemId, { retry_count: item.retry_count + 1 });
    }
  }

  /**
   * Purge all items for a user (used if needed).
   */
  static async purgeForUser(userId: string): Promise<void> {
    if (!userId) return;
    await db.sync_queue.where('user_id').equals(userId).delete();
  }
}
