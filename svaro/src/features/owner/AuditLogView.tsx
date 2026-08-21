import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

export default function AuditLogView() {
  const [logs, setLogs] = useState<any[]>([]);
  const isOwner = useAuthStore(state => state.isOwner);

  useEffect(() => {
    async function load() {
      // Use standard pagination .range(0, 50) as required
      const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (data) setLogs(data);
    }
    if (isOwner) load();
  }, [isOwner]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tight">System Audit Log</h1>
      
      <div className="bg-surface rounded-3xl border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-4 font-bold uppercase tracking-widest text-text-muted text-xs">Timestamp</th>
              <th className="p-4 font-bold uppercase tracking-widest text-text-muted text-xs">Actor</th>
              <th className="p-4 font-bold uppercase tracking-widest text-text-muted text-xs">Action</th>
              <th className="p-4 font-bold uppercase tracking-widest text-text-muted text-xs">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-border/50">
                <td className="p-4 text-text-muted whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-4 font-mono text-xs">{log.actor_user_id?.substring(0,8)}...</td>
                <td className="p-4 font-bold">{log.action}</td>
                <td className="p-4 font-mono text-xs">
                  {log.entity_type} / {log.entity_id}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted">No audit logs found or access denied.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

