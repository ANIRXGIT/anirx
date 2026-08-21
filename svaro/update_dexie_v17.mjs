import fs from 'fs';

let content = fs.readFileSync('src/db/dexie.ts', 'utf8');

// Insert new interfaces before 'export class SvaroDatabase'
const interfaces = `
export interface SystemConfig {
  key: string;
  value: any;
  updated_at: number;
  updated_by: string;
}

export interface FeatureFlag {
  flag: string;
  enabled: boolean;
  updated_at: number;
  updated_by: string;
}
`;

content = content.replace(/export class SvaroDatabase extends Dexie {/, interfaces + '\nexport class SvaroDatabase extends Dexie {');

// Add table definitions to class
const tables = `
  system_config!: Table<SystemConfig, string>;
  feature_flags!: Table<FeatureFlag, string>;
`;
content = content.replace(/user_gamification_profile!: Table<UserGamificationProfile, string>;/, 'user_gamification_profile!: Table<UserGamificationProfile, string>;' + tables);

// Add v17
const v17Stores = `
    this.version(17).stores({
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
      user_gamification_profile: "id, user_id",
      system_config: "key",
      feature_flags: "flag"
    });
`;

// Insert v17 after v16
content = content.replace(/\}\);\n\s*\}\n\s*async performInitialSetup/, '});\n' + v17Stores + '\n  }\n\n  async performInitialSetup');

fs.writeFileSync('src/db/dexie.ts', content);
