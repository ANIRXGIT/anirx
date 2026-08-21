import type { Recommendation } from '../../db/dexie';
import type { RecommendationDraft as DomainDraft } from './types';

export function deduplicate(newDrafts: DomainDraft[], existingRecommendations: Recommendation[], todayStr: string): DomainDraft[] {
  return newDrafts.filter(draft => {
    // Find if we already have this exact rule generated for today
    const existing = existingRecommendations.find(r => 
      r.ruleId === draft.ruleId && 
      r.contextDate === todayStr
    );
    
    if (!existing) return true;
    
    // If it exists, we skip creating a new one if it is pending or dismissed
    // If it is completed, we might generate it again if the condition is still true (e.g. water low again after logging some)
    // but the spec says "do not repeatedly create identical records".
    // For safety, we filter out if it's pending, dismissed, or completed for today.
    if (['pending', 'dismissed', 'completed'].includes(existing.status)) {
      return false;
    }
    
    return true;
  });
}
