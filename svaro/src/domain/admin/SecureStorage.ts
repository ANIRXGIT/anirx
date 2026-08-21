/**
 * Mocking Capacitor Secure Storage for the web version.
 * In a real mobile app, this would use `@capacitor-community/secure-storage`.
 * This guarantees secrets stay out of Dexie and Supabase.
 */
export class SecureStorage {
  private static PREFIX = 'SVARO_SECURE_';

  static async set(key: string, value: string): Promise<void> {
    // In production mobile: await SecureStoragePlugin.set({ key, value });
    localStorage.setItem(this.PREFIX + key, value);
  }

  static async get(key: string): Promise<string | null> {
    // In production mobile: const { value } = await SecureStoragePlugin.get({ key });
    return localStorage.getItem(this.PREFIX + key);
  }

  static async remove(key: string): Promise<void> {
    localStorage.removeItem(this.PREFIX + key);
  }
}
