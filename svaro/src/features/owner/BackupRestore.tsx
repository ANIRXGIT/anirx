import { useState, useEffect, useRef } from 'react';
import { cloudRepo } from '../../db/repositories/CloudRepository';
import { createCloudBackup, restoreFromCloudBackup, exportLocalDataToJSON, downloadJSON, importLocalJSON } from '../../domain/owner/backupRestore';

export default function BackupRestore() {
  const [backups, setBackups] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBackups = async () => {
    try {
      const data = await cloudRepo.getBackups();
      setBackups(data);
    } catch (e: any) {
      setMessage(`Failed to load backups: ${e.message}`);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleBackup = async () => {
    setIsProcessing(true);
    setMessage('Creating backup...');
    try {
      await createCloudBackup();
      await loadBackups();
      setMessage('Backup created successfully.');
    } catch (e: any) {
      setMessage(`Backup failed: ${e.message}`);
    }
    setIsProcessing(false);
  };

  const handleRestore = async (id: string) => {
    if (!window.confirm("WARNING: This will replace all current local data with the selected backup. Proceed?")) return;
    
    setIsProcessing(true);
    setMessage('Restoring...');
    try {
      await restoreFromCloudBackup(id, true);
      setMessage('Restore successful. Please reload the app.');
    } catch (e: any) {
      setMessage(`Restore failed: ${e.message}`);
    }
    setIsProcessing(false);
  };

  const handleLocalExport = async () => {
    try {
      const json = await exportLocalDataToJSON();
      downloadJSON(`svaro_backup_${new Date().toISOString().split('T')[0]}.json`, json);
      setMessage('Export downloaded.');
    } catch (e: any) {
      setMessage(`Export failed: ${e.message}`);
    }
  };

  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (window.confirm("WARNING: This will replace all current data with the imported file. Proceed?")) {
          setIsProcessing(true);
          await importLocalJSON(text, true);
          setMessage('Import successful. Please reload the app.');
        }
      } catch (err: any) {
        setMessage(`Import failed: ${err.message}`);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl pb-24">
      <h1 className="text-2xl font-bold">Cloud Backups</h1>
      <p className="text-text-muted">Manually snapshot your local state to the cloud or restore an existing snapshot.</p>

      {message && (
        <div className="bg-surface border border-border p-3 rounded text-sm font-medium">
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={handleBackup} 
          disabled={isProcessing}
          className="bg-accent text-white px-6 py-2 rounded font-bold hover:bg-accent-hover disabled:opacity-50"
        >
          Create New Cloud Backup
        </button>
        <button 
          onClick={handleLocalExport} 
          disabled={isProcessing}
          className="bg-surface text-text border border-border px-6 py-2 rounded font-bold hover:bg-surface-hover disabled:opacity-50"
        >
          Export JSON
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isProcessing}
          className="bg-surface text-text border border-border px-6 py-2 rounded font-bold hover:bg-surface-hover disabled:opacity-50"
        >
          Import JSON
        </button>
        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleLocalImport} 
        />
      </div>

      <div className="space-y-3 mt-8">
        <h2 className="text-lg font-bold">History</h2>
        {backups.length === 0 ? (
          <p className="text-text-muted">No backups found.</p>
        ) : (
          backups.map(b => (
            <div key={b.id} className="bg-surface p-4 rounded-xl border border-border flex justify-between items-center">
              <div>
                <p className="font-bold">{new Date(b.timestamp).toLocaleString()}</p>
                <p className="text-xs text-text-muted">{b.device_info}</p>
              </div>
              <button 
                onClick={() => handleRestore(b.id)}
                disabled={isProcessing}
                className="bg-red-900/30 text-red-500 hover:bg-red-900/50 px-4 py-2 rounded text-sm font-bold disabled:opacity-50 transition-colors"
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

