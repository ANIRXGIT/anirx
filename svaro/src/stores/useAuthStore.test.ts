import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    rpc: vi.fn().mockResolvedValue({ data: true })
  }
}));

describe('Authentication Store', () => {
  it('initializes with loading state', () => {
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.user).toBeNull();
  });

  it('updates state correctly on initialization', async () => {
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
  });
});
