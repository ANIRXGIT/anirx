import fs from 'fs';
let content = fs.readFileSync('src/sync/SyncPull.ts', 'utf8');

// Insert the recalculation hook inside pullTable after the transaction
const replacement = `
        if (maxSequence > lastCursor) {
          await db.sync_cursors.put({ table_name: tableName, user_id: userId, last_change_sequence: maxSequence });
        }
      });

      // Execute cache invalidation hooks
      if (tableName === 'gamification_transactions') {
        const txs = await db.gamification_transactions.where('user_id').equals(userId).toArray();
        const totalXP = txs.filter(t => t.currency_type === 'XP').reduce((sum, t) => sum + t.amount, 0);
        const totalCredits = txs.filter(t => t.currency_type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
        
        let profile = await db.user_gamification_profile.get(userId);
        if (profile) {
          profile.total_xp = totalXP;
          profile.total_credits = totalCredits;
          profile.current_level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
          await db.user_gamification_profile.put(profile);
        }
      }
`;

content = content.replace(/if \(maxSequence > lastCursor\) \{\s*await db\.sync_cursors\.put\(\{ table_name: tableName, user_id: userId, last_change_sequence: maxSequence \}\);\s*\}\s*\}\);/, replacement);

fs.writeFileSync('src/sync/SyncPull.ts', content);
