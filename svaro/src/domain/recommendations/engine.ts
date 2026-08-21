import { LifeStateEngine } from '../core/LifeStateEngine';
import { evaluateDeterministicRules } from './rules';
import { NullAIProvider } from '../ai/AIProvider';
import type { AIProvider } from '../ai/AIProvider';
import type { Recommendation, DailyTask } from '../../db/dexie';
import { localRepo } from '../../db/repositories/LocalRepository';
import { v4 as uuidv4 } from 'uuid';
import { createBaseEntity } from '../core/BaseEntity';

export class RecommendationEngine {
  
  static async runCycle(userId: string, aiProvider: AIProvider = new NullAIProvider()) {
    const fullState = await LifeStateEngine.getFullState(userId);
    const existing = await localRepo.getRecommendations(userId);
    
    // 1. Deterministic
    const drafts = evaluateDeterministicRules(fullState);
    
    // 2. AI (Optional)
    try {
      const aiContext = LifeStateEngine.getAIContext(fullState);
      const aiDrafts = await aiProvider.generateRecommendations(aiContext);
      drafts.push(...aiDrafts);
    } catch (e) {
      console.warn("AI generation failed, relying on deterministic", e);
    }

    // 3. Deduplicate
    const newRecs: Recommendation[] = [];
    const dateStr = fullState.dateStr;

    for (const draft of drafts) {
      const isDuplicate = existing.some(r => 
        r.ruleId === draft.ruleId && 
        r.contextDate === dateStr &&
        r.status !== 'completed' &&
        r.status !== 'expired'
      );

      if (!isDuplicate) {
        newRecs.push({
          ...createBaseEntity(userId),
          id: uuidv4(),
          contextDate: dateStr,
          ruleId: draft.ruleId || 'unknown',
          type: draft.type || 'lifestyle',
          title: draft.title || 'Suggestion',
          what: draft.what || '',
          why: draft.why || '',
          action: draft.action || 'View',
          status: 'pending',
          priority: draft.priority || 50,
          confidence: draft.confidence || 1.0,
          source: draft.source || 'DETERMINISTIC',
          actionType: draft.actionType || 'NONE',
          actionPayload: draft.actionPayload,
          relatedEntityId: draft.relatedEntityId
        });
      }
    }

    // 4. Save
    for (const rec of newRecs) {
      await localRepo.saveRecommendation(rec);
    }
  }

  static async acceptRecommendation(rec: Recommendation, userId: string) {
    rec.status = 'accepted';
    rec.updated_at = Date.now();
    await localRepo.saveRecommendation(rec);

    if (rec.actionType === 'CREATE_TASK' && rec.actionPayload) {
      const task: DailyTask = {
        ...createBaseEntity(userId),
        id: uuidv4(),
        title: rec.actionPayload.title || rec.title,
        source: 'system',
        completed: false,
        status: 'pending',
        priority: rec.actionPayload.priority || 0,
        timestamp: Date.now(),
        linkedEntityId: rec.actionPayload.linkedEntityId || rec.relatedEntityId,
        category: rec.type || ''
      };
      await localRepo.saveTask(task);
    }
  }

  static async dismissRecommendation(rec: Recommendation) {
    rec.status = 'dismissed';
    rec.updated_at = Date.now();
    await localRepo.saveRecommendation(rec);
  }
}
