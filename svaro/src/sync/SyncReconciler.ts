import { supabase } from '../lib/supabase';
import { db } from '../db/dexie';
import { startOfDay } from '../domain/calendar/dateUtils';
import { SyncQueue } from './SyncQueue';

export class SyncReconciler {
  static async sweep(userId: string) {
    if (!userId) return;

    for (const table of db.tables) {
      if (['sync_queue', 'sync_cursors', 'local_media'].includes(table.name)) continue;

      const cloudIds = new Set<string>();
      let page = 0;
      while (true) {
        const { data, error } = await supabase
          .from(table.name)
          .select('id')
          .eq('user_id', userId)
          .range(page * 1000, (page + 1) * 1000 - 1);
          
        if (error || !data || data.length === 0) break;
        data.forEach((r: any) => cloudIds.add(r.id));
        if (data.length < 1000) break;
        page++;
      }

      const localRecords = await table.where('user_id').equals(userId).toArray();
      const queueItems = await db.sync_queue.where('user_id').equals(userId).toArray();
      const queuedIds = new Set(queueItems.map(q => q.entity_id));
      
      for (const local of localRecords) {
        if (!cloudIds.has(local.id)) {
          if (local.sync_state === 'PENDING') {
             if (!queuedIds.has(local.id)) {
                await SyncQueue.enqueue(userId, 'ENTITY_MUTATION', table.name, local.id, { ...local, operation: 'UPSERT' });
             }
          } else {
             await table.delete(local.id);
          }
        }
      }

      const activeRecords = await table.where('user_id').equals(userId).toArray();
      
      if (['water_logs', 'weight_logs', 'sleep_logs'].includes(table.name)) {
        const grouped = new Map<number, any[]>();
        for (const r of activeRecords) {
          const day = startOfDay(new Date(r.timestamp));
          if (!grouped.has(day)) grouped.set(day, []);
          grouped.get(day)!.push(r);
        }
        
        for (const group of grouped.values()) {
           if (group.length > 1) {
              const canonical = group.find(r => cloudIds.has(r.id)) || group[0];
              for (const r of group) {
                 if (r.id !== canonical.id) {
                    await table.delete(r.id);
                 }
              }
           }
        }
      }
      
      if (table.name === 'task_definitions') {
         const grouped = new Map<string, any[]>();
         for (const r of activeRecords) {
           const keyStr = r.title.toLowerCase().trim();
           if (!grouped.has(keyStr)) grouped.set(keyStr, []);
           grouped.get(keyStr)!.push(r);
         }
         for (const group of grouped.values()) {
           if (group.length > 1) {
              const canonical = group.find(r => cloudIds.has(r.id)) || group[0];
              for (const r of group) {
                 if (r.id !== canonical.id) await table.delete(r.id);
              }
           }
         }
      }

      if (table.name === 'task_states') {
         const grouped = new Map<string, any[]>();
         for (const r of activeRecords) {
           const keyStr = `${r.taskId}_${r.date}`;
           if (!grouped.has(keyStr)) grouped.set(keyStr, []);
           grouped.get(keyStr)!.push(r);
         }
         for (const group of grouped.values()) {
           if (group.length > 1) {
              const canonical = group.find(r => cloudIds.has(r.id)) || group[0];
              for (const r of group) {
                 if (r.id !== canonical.id) await table.delete(r.id);
              }
           }
         }
      }

      if (table.name === 'workout_templates') {
         const grouped = new Map<string, any[]>();
         for (const r of activeRecords) {
           const keyStr = r.name.toLowerCase().trim();
           if (!grouped.has(keyStr)) grouped.set(keyStr, []);
           grouped.get(keyStr)!.push(r);
         }
         for (const group of grouped.values()) {
           if (group.length > 1) {
              const canonical = group.find(r => cloudIds.has(r.id)) || group[0];
              for (const r of group) {
                 if (r.id !== canonical.id) await table.delete(r.id);
              }
           }
         }
      }
    }
  }
}
