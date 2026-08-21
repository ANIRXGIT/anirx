import { localRepo } from '../../db/repositories/LocalRepository';
import type { SystemConfig, FeatureFlag } from '../../db/dexie';
import { supabase } from '../../lib/supabase';

export class AdminEngine {
  
  static async getConfigValue<T>(key: string, defaultValue: T): Promise<T> {
    const config = await localRepo.getSystemConfig(key);
    if (!config) return defaultValue;
    return config.value as T;
  }

  static async setConfigValue(key: string, value: any, userId: string): Promise<void> {
    const config: SystemConfig = {
      key,
      value,
      updated_at: Date.now(),
      updated_by: userId
    };
    await localRepo.saveSystemConfig(config);
    // Write to audit log
    await this.logAudit(userId, 'UPDATE_SYSTEM_CONFIG', 'system_config', key, { newValue: value });
  }

  static async getFlag(flag: string, defaultState = false): Promise<boolean> {
    const item = await localRepo.getFeatureFlag(flag);
    if (!item) return defaultState;
    return item.enabled;
  }

  static async setFlag(flag: string, enabled: boolean, userId: string): Promise<void> {
    const item: FeatureFlag = {
      flag,
      enabled,
      updated_at: Date.now(),
      updated_by: userId
    };
    await localRepo.saveFeatureFlag(item);
    await this.logAudit(userId, 'UPDATE_FEATURE_FLAG', 'feature_flags', flag, { enabled });
  }

  private static async logAudit(actorUserId: string, action: string, entityType: string, entityId: string, metadata: any) {
    // Audit logs strictly append to Supabase
    try {
      await supabase.from('audit_logs').insert({
        actor_user_id: actorUserId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }
  }
}
