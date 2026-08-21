import fs from 'fs';
let repo = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

repo = repo.replace(
  /async getActiveRecommendations\(userId: string\): Promise<Recommendation\[\]> \{/,
  `async getRecommendations(userId: string): Promise<Recommendation[]> { return db.recommendations.where('user_id').equals(userId).toArray(); }
  
  async getActiveRecommendations(userId: string): Promise<Recommendation[]> {`
);

fs.writeFileSync('src/db/repositories/LocalRepository.ts', repo);
