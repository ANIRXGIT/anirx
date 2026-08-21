import { describe, it, expect } from 'vitest';
import { LifeStateEngine } from '../core/LifeStateEngine';
import type { FullLifeStateContext } from '../core/LifeStateEngine';
import { evaluateDeterministicRules } from './rules';
import { NullAIProvider, GeminiProvider } from '../ai/AIProvider';

describe('Phase 8 Recommendations', () => {
  
  it('Privacy Filter strictly removes Finance from AI Context', () => {
    const mockFull: FullLifeStateContext = {
      userId: 'u1',
      dateStr: '2026-08-20',
      activeProjectsCount: 1,
      upcomingExamsCount: 0,
      activeInterviewsCount: 0,
      budgetUtilizationPct: 95,
      habitAdherencePct: 100,
      taskAdherencePct: 100,
      deficits: [
        { domain: 'finance', metric: 'budget_utilization', value: 95, severity: 'critical', privacyLevel: 'PRIVATE' },
        { domain: 'tasks', metric: 'overdue_count', value: 3, severity: 'medium', privacyLevel: 'PRIVATE' }
      ]
    };

    const aiContext = LifeStateEngine.getAIContext(mockFull);
    
    // Finance should be completely gone
    const hasFinance = aiContext.deficits.some(d => d.domain === 'finance');
    expect(hasFinance).toBe(false);

    // Tasks should be present, but without privacyLevel string
    const hasTasks = aiContext.deficits.some(d => d.domain === 'tasks');
    expect(hasTasks).toBe(true);
    expect((aiContext.deficits[0] as any).privacyLevel).toBeUndefined();
  });

  it('Deterministic rules evaluate correctly', () => {
    const mockFull: FullLifeStateContext = {
      userId: 'u1',
      dateStr: '2026-08-20',
      activeProjectsCount: 0,
      upcomingExamsCount: 1,
      activeInterviewsCount: 0,
      budgetUtilizationPct: 95,
      habitAdherencePct: 100,
      taskAdherencePct: 100,
      deficits: [
        { domain: 'finance', metric: 'budget_utilization', value: 95, severity: 'critical', privacyLevel: 'PRIVATE' }
      ]
    };

    const drafts = evaluateDeterministicRules(mockFull);
    
    // Exam -> Study rule
    expect(drafts.some(d => d.ruleId === 'study_exam_approaching')).toBe(true);
    
    // Finance -> Budget rule
    expect(drafts.some(d => d.ruleId === 'finance_budget_critical')).toBe(true);
  });

  it('AI Fallback (NullAIProvider) returns empty safely', async () => {
    const provider = new NullAIProvider();
    const result = await provider.generateRecommendations({} as any);
    expect(result).toHaveLength(0);
  });
  
  it('AI Provider (Gemini mock) parses successfully', async () => {
    const provider = new GeminiProvider('mock_key');
    const result = await provider.generateRecommendations({} as any);
    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe('ai_generic_focus');
    expect(result[0].source).toBe('AI');
  });

});
