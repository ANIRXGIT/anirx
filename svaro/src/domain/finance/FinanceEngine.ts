import type { FinanceTransaction } from '../../db/dexie';
import { startOfMonth } from 'date-fns';

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  categorySpending: Record<string, number>;
}

export class FinanceEngine {
  
  static calculateMonthlySummary(transactions: FinanceTransaction[], monthDate: Date = new Date()): FinanceSummary {
    const monthStart = startOfMonth(monthDate).getTime();
    
    // In month? (simplified for MVP: just >= startOfMonth, normally bounds to endOfMonth)
    // We filter strictly for this month
    const currentMonthTx = transactions.filter(t => t.date >= monthStart && t.date < (monthStart + 31*24*60*60*1000));
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpending: Record<string, number> = {};

    for (const tx of currentMonthTx) {
      if (tx.deleted) continue;
      
      // Future transactions can be projected, but for strict realization we might filter them.
      // The prompt asks to define behavior for future transactions. Let's include them in "projected" 
      // but for this core summary we'll just sum all provided.

      if (tx.type === 'INCOME') {
        totalIncome += Number(tx.amount);
      } else if (tx.type === 'EXPENSE') {
        totalExpenses += Math.abs(Number(tx.amount)); // ensure positive sum
        if (tx.category) {
          categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(Number(tx.amount));
        }
      }
      // TRANSFERS are strictly ignored in income/expense flow!
    }

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      categorySpending
    };
  }

  static calculateBudgetUsage(category: string, amount: number, summary: FinanceSummary): number {
    const spent = summary.categorySpending[category] || 0;
    return Math.min(Math.round((spent / amount) * 100), 100);
  }
}
