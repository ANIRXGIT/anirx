import fs from 'fs';

let store = fs.readFileSync('src/stores/useAppStore.ts', 'utf8');

// Replace refreshRecommendations
store = store.replace(
  /refreshRecommendations: async \(\) => \{[\s\S]*?\}\n  \}\)\);/,
  `refreshRecommendations: async () => {
    const userId = get().profile?.user_id;
    if (!userId) return;
    const { RecommendationEngine } = await import('../domain/recommendations/engine');
    await RecommendationEngine.runCycle(userId);
    // Note: Use of legacy recommendations array in useAppStore is deprecated
    // ActionCenter handles it natively, but we satisfy the interface here.
  }
  }));`
);

fs.writeFileSync('src/stores/useAppStore.ts', store);

// Also fix AIProvider context log and unused imports in engine.ts
let ai = fs.readFileSync('src/domain/ai/AIProvider.ts', 'utf8');
ai = ai.replace(/console\.log\("Simulating AI generation for context", context\);/, 'console.log("Simulating AI generation for context", _context);');
fs.writeFileSync('src/domain/ai/AIProvider.ts', ai);

let engine = fs.readFileSync('src/domain/recommendations/engine.ts', 'utf8');
engine = engine.replace(/import type \{ FullLifeStateContext \} from '\.\.\/core\/LifeStateEngine';\n/, '');
engine = engine.replace(/rec.category \|\| ''/g, "rec.type || ''");
fs.writeFileSync('src/domain/recommendations/engine.ts', engine);
