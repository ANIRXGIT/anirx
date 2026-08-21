import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

export default function UserAdminView() {
  const [users, setUsers] = useState<any[]>([]);
  const isOwner = useAuthStore(state => state.isOwner);

  useEffect(() => {
    async function load() {
      // In a real scenario, this would query auth.users if exposed, 
      // or query user_roles directly.
      const { data } = await supabase.from('user_roles').select('*');
      if (data) setUsers(data);
    }
    if (isOwner) load();
  }, [isOwner]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tight">User Roles</h1>
      
      <div className="bg-surface rounded-3xl border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-4 font-bold uppercase tracking-widest text-text-muted text-xs">User ID</th>
              <th className="p-4 font-bold uppercase tracking-widest text-text-muted text-xs">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={`${u.user_id}-${u.role}`} className="border-b border-border/50">
                <td className="p-4 font-mono">{u.user_id}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-bold tracking-widest">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-text-muted">No roles defined or access denied.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

