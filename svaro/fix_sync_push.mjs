import fs from 'fs';
let content = fs.readFileSync('src/sync/SyncPush.ts', 'utf8');

// The original pushAll:
// const pending = await SyncQueue.getPendingByType(userId, 'ENTITY_MUTATION');
// if (pending.length === 0) return;

const replacement = `
    const allPending = await SyncQueue.getPendingByType(userId, 'ENTITY_MUTATION');
    if (allPending.length === 0) return;

    // Apply exponential backoff filter
    const now = Date.now();
    const pending = allPending.filter(item => {
      if (item.retry_count === 0) return true;
      const backoffMs = Math.pow(2, Math.min(item.retry_count, 10)) * 1000; 
      return (now - item.created_at) > backoffMs;
    });

    if (pending.length === 0) return;
`;

content = content.replace(/const pending = await SyncQueue\.getPendingByType\(userId, 'ENTITY_MUTATION'\);\s*if \(pending\.length === 0\) return;/s, replacement);

fs.writeFileSync('src/sync/SyncPush.ts', content);
