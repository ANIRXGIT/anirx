import fs from 'fs';
let content = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

const injection = `
  async getExams(userId: string) { return db.exams.where('user_id').equals(userId).toArray(); }
  async saveExam(exam: any) { await db.exams.put(exam); }
  
  async getFinanceBudgets(userId: string) { return db.finance_budgets.where('user_id').equals(userId).toArray(); }
  async saveFinanceBudget(budget: any) { await db.finance_budgets.put(budget); }
  
  async getRecommendations(userId: string) { return db.recommendations.where('user_id').equals(userId).toArray(); }
  async saveRecommendation(rec: any) { await db.recommendations.put(rec); }
}
`;

content = content.replace(/}\s*export const localRepo = new LocalRepository\(\);/, injection + '\nexport const localRepo = new LocalRepository();');
fs.writeFileSync('src/db/repositories/LocalRepository.ts', content);
