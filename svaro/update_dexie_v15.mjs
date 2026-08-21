import fs from 'fs';

let content = fs.readFileSync('src/db/dexie.ts', 'utf8');

// Update Recommendation interface
content = content.replace(
  /export interface Recommendation extends BaseEntity {[\s\S]*?status: 'pending' \| 'accepted' \| 'modified' \| 'dismissed' \| 'completed';\s*}/,
  `export interface Recommendation extends BaseEntity {
  ruleId: string;
  contextDate: string;
  priority: number;
  type: 'workout' | 'nutrition' | 'lifestyle' | 'data' | 'study' | 'career' | 'projects' | 'finance';
  title: string;
  what: string;
  why: string;
  action: string;
  status: 'pending' | 'accepted' | 'modified' | 'dismissed' | 'completed' | 'expired';
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionType?: 'CREATE_TASK' | 'NAVIGATE' | 'NONE';
  actionPayload?: any;
  confidence?: number;
  source?: 'DETERMINISTIC' | 'AI';
  expiresAt?: number;
}`
);

// Add v15 to dexie
const v15Stores = `
    this.version(15).stores({
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
      recommendations: "id, user_id, [user_id+contextDate]"
    }).upgrade(async trans => {
      await trans.table('recommendations').toCollection().modify(rec => {
        if (!rec.source) rec.source = 'DETERMINISTIC';
        if (!rec.actionType) rec.actionType = 'NONE';
      });
    });
`;

if (!content.includes('this.version(15)')) {
  // Find the end of version(14) chain and append version(15)
  // v14 doesn't have an upgrade block, it just ends with `});` inside the constructor.
  content = content.replace(/      finance_budgets: "id, user_id"\n    \}\);/, '      finance_budgets: "id, user_id"\n    });' + v15Stores);
}

fs.writeFileSync('src/db/dexie.ts', content);
