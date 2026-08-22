import { supabase } from '../lib/supabase';
import { db } from '../db/dexie';

export class SyncPull {
  static async pullAll(userId: string): Promise<boolean> {
    if (!userId) return false;

    let hasChanges = false;
    for (const table of db.tables) {
      if (['sync_queue', 'sync_cursors', 'local_media'].includes(table.name)) continue;
      const changed = await this.pullTable(userId, table.name);
      if (changed) hasChanges = true;
    }
    await this.pullRevocations(userId);
    return hasChanges;
  }

  static async pullTable(userId: string, tableName: string): Promise<boolean> {
    const limit = 1000;
    let hasChanges = false;
    let pageCount = 0;
    while (true) {
      const cursorRecord = await db.sync_cursors.get([tableName, userId]);
      let lastCursor = cursorRecord ? cursorRecord.last_change_sequence : 0;

      // Diagnostic Cursor Reset Fix (Detect Cloud Wipes)
      if (pageCount === 0 && lastCursor > 0) {
        const { data: maxSeqData } = await supabase
          .from(tableName)
          .select('change_sequence')
          .order('change_sequence', { ascending: false })
          .limit(1);
        const maxCloudSeq = maxSeqData?.[0]?.change_sequence || 0;
        if (maxCloudSeq > 0 && lastCursor > maxCloudSeq) {
          console.warn(`[SYNC] Stale cursor detected for ${tableName}. Local: ${lastCursor}, Cloud Max: ${maxCloudSeq}. Resetting to 0.`);
          lastCursor = 0;
          await db.sync_cursors.put({ table_name: tableName, user_id: userId, last_change_sequence: 0 });
        }
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .gt('change_sequence', lastCursor)
        .order('change_sequence', { ascending: true })
        .limit(limit);

      if (error) {
        console.error(`SYNC FAILED\ntable: ${tableName}\noperation: select\ncode: ${error.code || 'UNKNOWN'}\nmessage: ${error.message || JSON.stringify(error)}\nuser_id: ${userId}\ntimestamp: ${new Date().toISOString()}`);
        break;
      }
      if (!data || data.length === 0) break;

      hasChanges = true;
      pageCount++;
      
      // RLS guarantees the data belongs to the user or is global.
      // We don't filter aggressively here to avoid cursor stagnation on global tables like system_config.
      const safeData = data;


      let maxSequence = lastCursor;

      await db.transaction('rw', db.table(tableName), db.sync_cursors, async () => {
        for (const record of safeData) {
          record.sync_state = 'SYNCED';
          (record as any).__fromSync = true;
          
          if (record.change_sequence > maxSequence) {
            maxSequence = record.change_sequence;
          }
          await db.table(tableName).put(record);
        }

        
        if (maxSequence > lastCursor) {
          await db.sync_cursors.put({ table_name: tableName, user_id: userId, last_change_sequence: maxSequence });
        }
      });

      // Execute cache invalidation hooks
      if (tableName === 'gamification_transactions') {
        const txs = await db.gamification_transactions.where('user_id').equals(userId).toArray();
        const totalXP = txs.filter(t => t.currency_type === 'XP').reduce((sum, t) => sum + t.amount, 0);
        const totalCredits = txs.filter(t => t.currency_type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
        
        let profile = await db.user_gamification_profile.get(userId);
        if (profile) {
          profile.total_xp = totalXP;
          profile.total_credits = totalCredits;
          profile.current_level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
          await db.user_gamification_profile.put(profile);
        }
      }


      if (data.length < limit) break;
    }
    return hasChanges;
  }

  static async pullRevocations(userId: string): Promise<void> {
    const limit = 1000;
    const tableName = 'revocation_log';

    while (true) {
      const cursorRecord = await db.sync_cursors.get([tableName, userId]);
      const lastCursor = cursorRecord ? cursorRecord.last_change_sequence : 0;

      const { data, error } = await supabase
        .from('revocation_log')
        .select('*')
        .eq('target_user_id', userId)
        .gt('change_sequence', lastCursor)
        .order('change_sequence', { ascending: true })
        .limit(limit);

      if (error) break;
      if (!data || data.length === 0) break;

      let maxSequence = lastCursor;

      for (const record of data) {
        if (record.target_user_id !== userId) continue;
        const resourceTable = record.resource_type;
        const t = db.tables.find(tbl => tbl.name === resourceTable);
        if (t) {
           await db.transaction('rw', t, db.sync_cursors, async () => {
              const existing = await t.get(record.resource_id);
              if (existing) {
                 (existing as any).__fromSync = true;
                 await t.delete(record.resource_id);
              }
           });
        }
        if (record.change_sequence > maxSequence) maxSequence = record.change_sequence;
      }

      if (maxSequence > lastCursor) {
        await db.sync_cursors.put({ table_name: tableName, user_id: userId, last_change_sequence: maxSequence });
      }

      if (data.length < limit) break;
    }
  }
}
