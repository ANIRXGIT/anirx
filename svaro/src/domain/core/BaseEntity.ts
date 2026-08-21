export type PrivacyLevel = 'PRIVATE' | 'SHARED' | 'PUBLIC';

export type SyncState = 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';

export interface BaseEntity {
  id: string;
  user_id: string;
  created_at: number;
  updated_at: number;
  privacy_level: PrivacyLevel;
  sync_state: SyncState;
  deleted: boolean;
}

export function createBaseEntity(user_id: string): BaseEntity {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    user_id,
    created_at: now,
    updated_at: now,
    privacy_level: 'PRIVATE',
    sync_state: 'PENDING',
    deleted: false
  };
}
