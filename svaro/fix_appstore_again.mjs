import fs from 'fs';

let store = fs.readFileSync('src/stores/useAppStore.ts', 'utf8');

const startIndex = store.indexOf('refreshRecommendations: async () => {');
if (startIndex !== -1) {
  // We know it's the last function in the store
  const newFunction = `refreshRecommendations: async () => {
    const userId = get().profile?.user_id;
    if (!userId) return;
    const { RecommendationEngine } = await import('../domain/recommendations/engine');
    await RecommendationEngine.runCycle(userId);
  }
}));`;

  const before = store.substring(0, startIndex);
  fs.writeFileSync('src/stores/useAppStore.ts', before + newFunction);
}

