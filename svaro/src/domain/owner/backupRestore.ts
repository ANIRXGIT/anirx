import { db } from '../../db/dexie';
import { cloudRepo } from '../../db/repositories/CloudRepository';

export async function exportLocalDataToJSON(): Promise<string> {
  const data: Record<string, any[]> = {};
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }
  return JSON.stringify(data);
}

export async function createCloudBackup(): Promise<void> {
  const payload = await exportLocalDataToJSON();
  await cloudRepo.createBackup(payload);
}

export async function restoreFromCloudBackup(backupId: string, confirm: boolean): Promise<void> {
  if (!confirm) throw new Error("Explicit confirmation required to restore from backup.");
  
  const payload = await cloudRepo.getBackupPayload(backupId);
  if (!payload) throw new Error("Backup payload is empty.");

  // Run everything in a transaction to prevent partial restores
  await db.transaction('rw', db.tables, async () => {
    // Clear all existing data to prevent duplicated ghost records
    for (const table of db.tables) {
      await table.clear();
      
      const records = payload[table.name];
      if (records && Array.isArray(records) && records.length > 0) {
        await table.bulkAdd(records);
      }
    }
  });
}

// Local File Export/Import
export function downloadJSON(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importLocalJSON(jsonString: string, confirm: boolean): Promise<void> {
  if (!confirm) throw new Error("Explicit confirmation required for local import.");
  
  const payload = JSON.parse(jsonString);
  if (typeof payload !== 'object' || payload === null) throw new Error("Invalid backup format.");
  
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      const records = payload[table.name];
      if (records && Array.isArray(records)) {
        await table.clear();
        await table.bulkAdd(records);
      }
    }
  });
}
