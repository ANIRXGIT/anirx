import { supabase } from '../lib/supabase';
import { db } from '../db/dexie';
import { startOfDay } from '../domain/calendar/dateUtils';
import { SyncQueue } from './SyncQueue';

export interface ReconciliationReport {
  entity: string;
  local_count_before: number;
  cloud_count: number;
  matched: number;
  cloud_only: number;
  local_only: number;
  pending: number;
  stale_candidates: number;
  logical_duplicates: number;
}

export class SyncReconciler {
  static async sweep(userId: string): Promise<ReconciliationReport[]> {
    if (!userId) return [];
    const reports: ReconciliationReport[] = [];

    for (const table of db.tables) {
      if (['sync_queue', 'sync_cursors', 'local_media'].includes(table.name)) continue;

      const report: ReconciliationReport = {
        entity: table.name,
        local_count_before: 0,
        cloud_count: 0,
        matched: 0,
        cloud_only: 0,
        local_only: 0,
        pending: 0,
        stale_candidates: 0,
        logical_duplicates: 0,
      };

      const localRecords = await table.where('user_id').equals(userId).toArray();
      report.local_count_before = localRecords.length;

      // 1. Fetch ALL active Cloud IDs securely
      const cloudIds = new Set<string>();
      let page = 0;
      let errorOccurred = false;
      while (true) {
        const { data, error } = await supabase
          .from(table.name)
          .select('id')
          .eq('user_id', userId)
          .range(page * 1000, (page + 1) * 1000 - 1);
          
        if (error) {
          console.error(`Reconciliation failed fetching ${table.name}`, error);
          errorOccurred = true;
          break;
        }
        if (!data || data.length === 0) break;
        data.forEach((r: any) => cloudIds.add(r.id));
        if (data.length < 1000) break;
        page++;
      }

      if (errorOccurred) {
        console.warn(`[SYNC] Skipped ${table.name} due to fetch error. NO local deletions allowed.`);
        continue; // ABORT for this table
      }

      report.cloud_count = cloudIds.size;

      const queueItems = await db.sync_queue.where('user_id').equals(userId).toArray();
      const queuedIds = new Set(queueItems.map(q => q.entity_id));
      
      // 2. Classify & Handle Ghost Records (RULE C)
      for (const local of localRecords) {
        if (cloudIds.has(local.id)) {
           report.matched++;
        } else {
           report.local_only++;
           if (local.sync_state === 'PENDING') {
              report.pending++;
              if (!queuedIds.has(local.id)) {
                 await SyncQueue.enqueue(userId, 'ENTITY_MUTATION', table.name, local.id, { ...local, operation: 'UPSERT' });
              }
           } else {
              // Stale Ghost!
              report.stale_candidates++;
              // DO NOT physically delete. Soft-delete and tag for diagnostic mode.
              await table.update(local.id, { 
                deleted: true, 
                _diagnostic_ghost: true 
              });
           }
        }
      }
      
      report.cloud_only = report.cloud_count - report.matched;

      // 3. Logical Duplicates (RULE E)
      const activeRecords = await table.where('user_id').equals(userId).and((r: any) => !r.deleted).toArray();
      
      if (['water_logs', 'weight_logs', 'sleep_logs'].includes(table.name)) {
        const grouped = new Map<number, any[]>();
        for (const r of activeRecords) {
          // startOfDay normalizes to local timezone exactly
          const day = startOfDay(new Date(r.timestamp));
          if (!grouped.has(day)) grouped.set(day, []);
          grouped.get(day)!.push(r);
        }
        
        for (const group of grouped.values()) {
           if (group.length > 1) {
              const canonical = group.find(r => cloudIds.has(r.id)) || group[0];
              for (const r of group) {
                 if (r.id !== canonical.id) {
                    report.logical_duplicates++;
                    await table.update(r.id, { deleted: true, _diagnostic_duplicate: true });
                 }
              }
           }
        }
      }

      // task_states grouping by taskId + date
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
                 if (r.id !== canonical.id) {
                    report.logical_duplicates++;
                    await table.update(r.id, { deleted: true, _diagnostic_duplicate: true });
                 }
              }
           }
         }
      }

      reports.push(report);
    }
    
    console.table(reports);
    return reports;
  }
}
