import type { AILifeStateContext } from '../core/LifeStateEngine';
import type { Recommendation } from '../../db/dexie';

export interface AIProvider {
  generateRecommendations(_context: AILifeStateContext): Promise<Partial<Recommendation>[]>;
}

export class NullAIProvider implements AIProvider {
  async generateRecommendations(_context: AILifeStateContext): Promise<Partial<Recommendation>[]> {
    return []; // The Null Provider always relies on the deterministic engine
  }
}

// Stub for Gemini/OpenAI integration, keys managed entirely by Owner settings
export class GeminiProvider implements AIProvider {
  apiKey: string; constructor(apiKey: string) { this.apiKey = apiKey; }

  async generateRecommendations(_context: AILifeStateContext): Promise<Partial<Recommendation>[]> {
    if (!this.apiKey) return [];
    
    // In production, this would make an HTTPS request to Gemini API
    // returning strongly-typed JSON representing Partial<Recommendation>[].
    // Catch JSON.parse failures and return [].
    console.log("Simulating AI generation for context", _context);
    
    return [
      {
        ruleId: 'ai_generic_focus',
        type: 'lifestyle',
        title: 'Focus on Completion',
        what: 'Prioritize your backlog',
        why: 'AI noticed your task adherence is slightly low.',
        action: 'Review Backlog',
        actionType: 'NAVIGATE',
        actionPayload: { route: '/' },
        priority: 50,
        confidence: 0.8,
        source: 'AI'
      }
    ];
  }
}
