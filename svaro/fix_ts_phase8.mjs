import fs from 'fs';

// 1. LocalRepository
let repo = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');
const lines = repo.split('\n');
let newLines = [];
let seenGetRecs = false;
let seenSaveRecs = false;
for (const line of lines) {
  if (line.includes('async getRecommendations(userId: string)')) {
    if (seenGetRecs) continue;
    seenGetRecs = true;
  }
  if (line.includes('async saveRecommendation(rec: any)')) {
    if (seenSaveRecs) continue;
    seenSaveRecs = true;
  }
  newLines.push(line);
}
fs.writeFileSync('src/db/repositories/LocalRepository.ts', newLines.join('\n'));

// 2. AIProvider.ts
let ai = fs.readFileSync('src/domain/ai/AIProvider.ts', 'utf8');
ai = ai.replace(/private apiKey: string/g, 'apiKey: string');
ai = ai.replace(/constructor\(apiKey: string\) \{\}/, 'apiKey: string; constructor(apiKey: string) { this.apiKey = apiKey; }');
ai = ai.replace(/context: AILifeStateContext/g, '_context: AILifeStateContext');
fs.writeFileSync('src/domain/ai/AIProvider.ts', ai);

// 3. engine.ts
let engine = fs.readFileSync('src/domain/recommendations/engine.ts', 'utf8');
engine = engine.replace(/import { LifeStateEngine, FullLifeStateContext }/, "import { LifeStateEngine } from '../core/LifeStateEngine';\nimport type { FullLifeStateContext }");
engine = engine.replace(/import { AIProvider, NullAIProvider }/, "import { NullAIProvider } from '../ai/AIProvider';\nimport type { AIProvider }");
engine = engine.replace(/linkedEntityId: rec.actionPayload.linkedEntityId \|\| rec.relatedEntityId/, "linkedEntityId: rec.actionPayload.linkedEntityId || rec.relatedEntityId,\n        category: rec.category || ''");
fs.writeFileSync('src/domain/recommendations/engine.ts', engine);

// 4. rules.ts
let rules = fs.readFileSync('src/domain/recommendations/rules.ts', 'utf8');
rules = rules.replace(/import { v4 as uuidv4 } from 'uuid';\n/, '');
fs.writeFileSync('src/domain/recommendations/rules.ts', rules);

// 5. ActionCenter.tsx
let ac = fs.readFileSync('src/features/dashboard/ActionCenter.tsx', 'utf8');
ac = ac.replace(/import { Recommendation } from '\.\.\/\.\.\/db\/dexie';/, "import type { Recommendation } from '../../db/dexie';");
fs.writeFileSync('src/features/dashboard/ActionCenter.tsx', ac);

// 6. Delete old recommendations.test.ts since we rewrote the engine and we will create a new one
if (fs.existsSync('src/domain/recommendations/recommendations.test.ts')) {
  fs.unlinkSync('src/domain/recommendations/recommendations.test.ts');
}

// 7. useAppStore.ts (AppStore had a hardcoded legacy hook to run the recommendation engine)
let store = fs.readFileSync('src/stores/useAppStore.ts', 'utf8');
store = store.replace(/import { generateRecommendationsForContext } from '\.\.\/domain\/recommendations\/engine';\n/, '');
store = store.replace(/      \/\/ \.\.\. run recommendations\n      const context = \{[\s\S]*?generateRecommendationsForContext\([\s\S]*?drafts\.forEach[\s\S]*?\}\);/g, '');
store = store.replace(/const drafts = generateRecommendationsForContext\([\s\S]*?\}\);/, '');
fs.writeFileSync('src/stores/useAppStore.ts', store);

