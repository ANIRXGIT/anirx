import { describe, it, expect } from 'vitest';
import { FinanceEngine } from './FinanceEngine';
import type { FinanceTransaction } from '../../db/dexie';

describe('FinanceEngine', () => {
  it('calculates monthly summary correctly and ignores transfers', () => {
    // Force date to be within the same month for calculation
    const now = new Date();
    const d1 = now.getTime();

    const tx: FinanceTransaction[] = [
      { id: '1', user_id: 'u', amount: 1000, type: 'INCOME', date: d1, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false },
      { id: '2', user_id: 'u', amount: -200, type: 'EXPENSE', category: 'Food', date: d1, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false },
      { id: '3', user_id: 'u', amount: 300, type: 'EXPENSE', category: 'Rent', date: d1, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false }, // user entered positive expense
      { id: '4', user_id: 'u', amount: 500, type: 'TRANSFER', date: d1, created_at: 0, updated_at: 0, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false },
    ];

    const summary = FinanceEngine.calculateMonthlySummary(tx, now);
    
    expect(summary.totalIncome).toBe(1000);
    expect(summary.totalExpenses).toBe(500); // 200 + 300 (absolute values)
    expect(summary.netCashFlow).toBe(500);
    expect(summary.categorySpending['Food']).toBe(200);
    expect(summary.categorySpending['Rent']).toBe(300);
  });
});
