import fs from 'fs';
let content = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

const injection = `
  // STUDY
  async getStudySubjects(userId: string) { return db.study_subjects.where('user_id').equals(userId).toArray(); }
  async saveStudySubject(subject: any) { await db.study_subjects.put(subject); }
  async getStudySessions(userId: string) { return db.study_sessions.where('user_id').equals(userId).toArray(); }
  async saveStudySession(session: any) { await db.study_sessions.put(session); }
  
  // CAREER
  async getCareerSkills(userId: string) { return db.career_skills.where('user_id').equals(userId).toArray(); }
  async saveCareerSkill(skill: any) { await db.career_skills.put(skill); }
  async getCareerApplications(userId: string) { return db.career_applications.where('user_id').equals(userId).toArray(); }
  async saveCareerApplication(app: any) { await db.career_applications.put(app); }
  
  // PROJECTS
  async getProjects(userId: string) { return db.projects.where('user_id').equals(userId).toArray(); }
  async saveProject(project: any) { await db.projects.put(project); }
  async getProjectMilestones(userId: string, projectId: string) { return db.project_milestones.where('[user_id+projectId]').equals([userId, projectId]).toArray(); }
  async saveProjectMilestone(m: any) { await db.project_milestones.put(m); }
  
  // FINANCE
  async getFinanceAccounts(userId: string) { return db.finance_accounts.where('user_id').equals(userId).toArray(); }
  async saveFinanceAccount(acc: any) { await db.finance_accounts.put(acc); }
  async getFinanceTransactions(userId: string) { return db.finance_transactions.where('user_id').equals(userId).toArray(); }
  async saveFinanceTransaction(tx: any) { await db.finance_transactions.put(tx); }
}
`;

content = content.replace(/}\s*export const localRepo = new LocalRepository\(\);/, injection + '\nexport const localRepo = new LocalRepository();');
fs.writeFileSync('src/db/repositories/LocalRepository.ts', content);
