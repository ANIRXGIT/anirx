import fs from 'fs';
let content = fs.readFileSync('src/sync/SyncPull.ts', 'utf8');

// The original buggy code:
// const safeData = data.filter(r => r.user_id === userId || tableName === 'exercises');
// if (safeData.length === 0 && data.length > 0) break;

const replacement = `
      // RLS guarantees the data belongs to the user or is global.
      // We don't filter aggressively here to avoid cursor stagnation on global tables like system_config.
      const safeData = data;
`;

content = content.replace(/const safeData = data\.filter.*?if \(safeData\.length === 0 && data\.length > 0\) break;/s, replacement);

fs.writeFileSync('src/sync/SyncPull.ts', content);
