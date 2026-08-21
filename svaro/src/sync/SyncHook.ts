import { db } from '../db/dexie';
import { v4 as uuidv4 } from 'uuid';

export function registerSyncHooks() {
  for (const table of db.tables) {
    // Skip sync-internal tables
    if (['sync_queue', 'sync_cursors', 'local_media', 'exercises'].includes(table.name)) continue;

    const tableName = table.name;

    table.hook('creating', function (primKey, obj, transaction) {
      if ((obj as any).__fromSync) {
        delete (obj as any).__fromSync;
        return; // Came from cloud pull, do not queue
      }

      obj.sync_state = 'PENDING';
      obj.updated_at = Date.now();

      const item = {
        id: uuidv4(),
        user_id: obj.user_id,
        mutation_id: uuidv4(),
        type: 'ENTITY_MUTATION',
        entity_type: tableName,
        entity_id: primKey || obj.id,
        payload: { ...obj },
        created_at: Date.now(),
        retry_count: 0
      };

      transaction.table('sync_queue').add(item);
    });

    table.hook('updating', function (modifications, primKey, obj, transaction) {
      if ((modifications as any).__fromSync) {
        return { __fromSync: undefined }; // Remove the flag, do not queue
      }

      // Create the final merged object
      const newObj = { ...obj, ...modifications, sync_state: 'PENDING', updated_at: Date.now() };
      delete (newObj as any).__fromSync;

      const item = {
        id: uuidv4(),
        user_id: obj.user_id || newObj.user_id,
        mutation_id: uuidv4(),
        type: 'ENTITY_MUTATION',
        entity_type: tableName,
        entity_id: primKey,
        payload: newObj,
        created_at: Date.now(),
        retry_count: 0
      };

      transaction.table('sync_queue').add(item);
      
      return { sync_state: 'PENDING', updated_at: newObj.updated_at };
    });

    table.hook('deleting', function (primKey, obj, transaction) {
      if ((obj as any).__fromSync) return; // Deleted by pull engine (e.g. revocation)
      
      const item = {
        id: uuidv4(),
        user_id: obj.user_id,
        mutation_id: uuidv4(),
        type: 'ENTITY_MUTATION',
        entity_type: tableName,
        entity_id: primKey,
        payload: { ...obj, deleted: true, sync_state: 'PENDING', updated_at: Date.now() },
        created_at: Date.now(),
        retry_count: 0
      };

      transaction.table('sync_queue').add(item);
    });
  }
}
