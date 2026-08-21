import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncQueue } from './SyncQueue';
import { SyncPush } from './SyncPush';
import { SyncPull } from './SyncPull';
import { db } from '../db/dexie';
import { supabase } from '../lib/supabase';

// Mock dependencies
vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}));

describe('Sync Engine - Phase 4 Requirements', () => {
  beforeEach(async () => {
    await db.sync_queue.clear();
    await db.sync_cursors.clear();
    vi.clearAllMocks();
  });

  const userA = 'user-a';
  const userB = 'user-b';

  it('A. Queue ownership isolation', async () => {
    await SyncQueue.enqueue(userA, 'ENTITY_MUTATION', 'goals', '1', { name: 'A' });
    await SyncQueue.enqueue(userB, 'ENTITY_MUTATION', 'goals', '2', { name: 'B' });

    const pendingA = await SyncQueue.getPendingByType(userA, 'ENTITY_MUTATION');
    expect(pendingA).toHaveLength(1);
    expect(pendingA[0].user_id).toBe(userA);

    const pendingB = await SyncQueue.getPendingByType(userB, 'ENTITY_MUTATION');
    expect(pendingB).toHaveLength(1);
    expect(pendingB[0].user_id).toBe(userB);
  });

  it('B. Mutation idempotency', async () => {
    const mutId = await SyncQueue.enqueue(userA, 'ENTITY_MUTATION', 'goals', '1', { name: 'A' });
    const pending = await SyncQueue.getPendingByType(userA, 'ENTITY_MUTATION');
    expect(pending[0].mutation_id).toBe(mutId);

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: [{ mutation_id: mutId, status: 'SUCCESS', note: 'duplicate' }],
      error: null
    } as any);

    await SyncPush.pushAll(userA);
    const remaining = await SyncQueue.getPendingByType(userA, 'ENTITY_MUTATION');
    expect(remaining).toHaveLength(0); // Duplicate success removed it from queue
  });

  it('C. Cursor safety', async () => {
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ 
        data: [{ id: '1', user_id: userA, change_sequence: 10 }], 
        error: null 
      })
    } as any);

    // Mock put to throw
    const originalTx = db.transaction;
    db.transaction = vi.fn().mockRejectedValue(new Error('Transaction Failed'));

    try {
      await SyncPull.pullTable(userA, 'goals');
    } catch (e) {}

    db.transaction = originalTx;

    const cursor = await db.sync_cursors.get(['goals', userA]);
    expect(cursor).toBeUndefined(); // Cursor did NOT advance because transaction failed
  });

  it('D. Delta pulling', async () => {
    await db.sync_cursors.put({ table_name: 'goals', user_id: userA, last_change_sequence: 5 });

    const gtMock = vi.fn().mockReturnThis();
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      gt: gtMock,
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    } as any);

    await SyncPull.pullTable(userA, 'goals');
    expect(gtMock).toHaveBeenCalledWith('change_sequence', 5);
  });

  it('H. Account switching', async () => {
    await SyncQueue.enqueue(userA, 'ENTITY_MUTATION', 'goals', '1', { name: 'A' });

    // Simulate User B sync
    await SyncPush.pushAll(userB);

    const pendingA = await SyncQueue.getPendingByType(userA, 'ENTITY_MUTATION');
    expect(pendingA).toHaveLength(1); // Still there, untouched by B
  });
});
