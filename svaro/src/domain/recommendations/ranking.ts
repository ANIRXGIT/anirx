import type { RecommendationDraft } from './types';

export function rankRecommendations(drafts: RecommendationDraft[]): RecommendationDraft[] {
  // Sort by priorityScore descending
  // Deterministic fallback to ruleId to avoid random shuffling of tied scores
  return [...drafts].sort((a, b) => {
    if (a.priorityScore !== b.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return a.ruleId.localeCompare(b.ruleId);
  });
}
