import fs from 'fs';

let content = fs.readFileSync('src/db/dexie.ts', 'utf8');

// Insert new interfaces before 'export class SvaroDatabase'
const interfaces = `
export interface GamificationTransaction extends BaseEntity {
  currency_type: 'XP' | 'CREDIT';
  amount: number;
  idempotency_key: string;
  description: string;
}

export interface UserBadge extends BaseEntity {
  badge_id: string;
  earned_at: number;
  idempotency_key: string;
}

export interface UserGamificationProfile extends BaseEntity {
  total_xp: number;
  total_credits: number;
  current_level: number;
}
`;

content = content.replace(/export class SvaroDatabase extends Dexie {/, interfaces + '\nexport class SvaroDatabase extends Dexie {');

// Add table definitions to class
const tables = `
  gamification_transactions!: Table<GamificationTransaction, string>;
  user_badges!: Table<UserBadge, string>;
  user_gamification_profile!: Table<UserGamificationProfile, string>;
`;
content = content.replace(/recommendations!: Table<Recommendation, string>;/, 'recommendations!: Table<Recommendation, string>;' + tables);

// Add v16
const v16Stores = `
    this.version(16).stores({
      study_subjects: "id, user_id",
      study_sessions: "id, user_id, [user_id+startTime]",
      exams: "id, user_id, [user_id+dateTime]",
      assignments: "id, user_id, [user_id+dueDate]",
      career_skills: "id, user_id",
      career_applications: "id, user_id, [user_id+status]",
      projects: "id, user_id, [user_id+status]",
      project_milestones: "id, user_id, [user_id+projectId]",
      finance_accounts: "id, user_id",
      finance_transactions: "id, user_id, [user_id+date], [user_id+accountId]",
      finance_budgets: "id, user_id",
      recommendations: "id, user_id, [user_id+contextDate]",
      gamification_transactions: "id, user_id, [user_id+idempotency_key]",
      user_badges: "id, user_id, [user_id+idempotency_key], badge_id",
      user_gamification_profile: "id, user_id"
    });
`;

// Insert v16 after v15
content = content.replace(/\}\);\n\s*\}\n\s*async performInitialSetup/, '});\n' + v16Stores + '\n  }\n\n  async performInitialSetup');

fs.writeFileSync('src/db/dexie.ts', content);
