import fs from 'fs';
let repo = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

repo = repo.replace(/  async getRecommendations\(userId: string\) \{ return db\.recommendations\.where\('user_id'\)\.equals\(userId\)\.toArray\(\); \}\n  async saveRecommendation\(rec: any\) \{ await db\.recommendations\.put\(rec\); \}\n/, '');

fs.writeFileSync('src/db/repositories/LocalRepository.ts', repo);
