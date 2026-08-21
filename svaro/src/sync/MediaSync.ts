import { supabase } from '../lib/supabase';
import { db } from '../db/dexie';
import { SyncQueue } from './SyncQueue';
import { mutationTracker } from './MutationTracker';

export class MediaSync {
  static async syncMedia(userId: string): Promise<void> {
    if (!userId) return;

    // Process Uploads
    const uploads = await SyncQueue.getPendingByType(userId, 'MEDIA_UPLOAD');
    for (const task of uploads) {
      if (mutationTracker.acquire(task.mutation_id)) {
        await this.processUpload(userId, task);
      }
    }

    // Process Deletes
    const deletes = await SyncQueue.getPendingByType(userId, 'MEDIA_DELETE');
    for (const task of deletes) {
      if (mutationTracker.acquire(task.mutation_id)) {
        await this.processDelete(userId, task);
      }
    }
  }

  private static async processUpload(userId: string, task: any): Promise<void> {
    try {
      const mediaRecord = await db.local_media.get(task.entity_id);
      
      // If deleted locally before upload, just purge
      if (!mediaRecord) {
        await mutationTracker.markSuccess(task, userId);
        return;
      }

      // Payload contains bucket and path
      const { bucket, path } = task.payload;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, mediaRecord.blob, {
          contentType: mediaRecord.mime_type,
          upsert: true
        });

      if (error) {
        console.error('Media Upload Error:', error);
        await mutationTracker.markFailure(task, userId);
        return;
      }

      // Success: Remove local blob
      await db.local_media.delete(task.entity_id);
      await mutationTracker.markSuccess(task, userId);

    } catch (e) {
      console.error('Media Upload Exception:', e);
      await mutationTracker.markFailure(task, userId);
    }
  }

  private static async processDelete(userId: string, task: any): Promise<void> {
    try {
      const { bucket, path } = task.payload;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      // If it's already gone or we lack access, consider it successful deletion locally to unblock queue
      if (error && !error.message.includes('not found')) {
         console.error('Media Delete Error:', error);
         await mutationTracker.markFailure(task, userId);
         return;
      }

      await mutationTracker.markSuccess(task, userId);
    } catch (e) {
      console.error('Media Delete Exception:', e);
      await mutationTracker.markFailure(task, userId);
    }
  }
}
