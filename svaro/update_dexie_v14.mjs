import fs from 'fs';

let content = fs.readFileSync('src/db/dexie.ts', 'utf8');

const newInterfaces = `
// Phase 7 Domains
export interface StudySubject extends BaseEntity {
  name: string;
  color?: string;
}

export interface StudySession extends BaseEntity {
  subjectId?: string;
  startTime: number;
  endTime?: number;
  durationMinutes?: number;
  notes?: string;
}

export interface Exam extends BaseEntity {
  subjectId?: string;
  title: string;
  dateTime: number;
  location?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Assignment extends BaseEntity {
  subjectId?: string;
  title: string;
  dueDate: number;
  priority: number;
  status: 'pending' | 'completed' | 'overdue';
}

export interface CareerSkill extends BaseEntity {
  name: string;
  category?: string;
  currentLevel: number;
  targetLevel?: number;
  notes?: string;
}

export interface CareerApplication extends BaseEntity {
  company: string;
  role: string;
  applicationDate?: number;
  status: 'TARGET' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
  source?: string;
  notes?: string;
  nextAction?: string;
  deadline?: number;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  priority: number;
  deadline?: number;
}

export interface ProjectMilestone extends BaseEntity {
  projectId?: string;
  title: string;
  deadline?: number;
  completed: boolean;
}

export interface FinanceAccount extends BaseEntity {
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export interface FinanceTransaction extends BaseEntity {
  accountId?: string;
  targetAccountId?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category?: string;
  date: number;
  description?: string;
  isRecurring?: boolean;
}

export interface FinanceBudget extends BaseEntity {
  category: string;
  amount: number;
  period: string;
}
`;

// Insert new interfaces before SvaroDatabase class
content = content.replace(/export class SvaroDatabase extends Dexie {/, newInterfaces + '\nexport class SvaroDatabase extends Dexie {');

// Extend Goal
content = content.replace(
  /export interface Goal extends BaseEntity {[\s\S]*?priority: number;\s*}/,
  `export interface Goal extends BaseEntity {
  type: string;
  priority: number;
  targetValue?: number;
  unit?: string;
  startDate?: number;
  endDate?: number;
  status?: string;
  domain?: string;
}`
);

// Extend DailyTask
content = content.replace(
  /export interface DailyTask extends BaseEntity {([\s\S]*?)timestamp: number;\s*notes\?: string;\s*}/,
  `export interface DailyTask extends BaseEntity {$1timestamp: number;\n  notes?: string;\n  linkedEntityId?: string;\n  linkedDomain?: string;\n}`
);

// Add table definitions to SvaroDatabase class
const tableDefs = `
  study_subjects!: Table<StudySubject, string>;
  study_sessions!: Table<StudySession, string>;
  exams!: Table<Exam, string>;
  assignments!: Table<Assignment, string>;
  career_skills!: Table<CareerSkill, string>;
  career_applications!: Table<CareerApplication, string>;
  projects!: Table<Project, string>;
  project_milestones!: Table<ProjectMilestone, string>;
  finance_accounts!: Table<FinanceAccount, string>;
  finance_transactions!: Table<FinanceTransaction, string>;
  finance_budgets!: Table<FinanceBudget, string>;
`;

content = content.replace(/  monthly_summaries!: Table<MonthlySummary, string>;/, `  monthly_summaries!: Table<MonthlySummary, string>;${tableDefs}`);

// Add v14
const v14Stores = `
    this.version(14).stores({
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
      finance_budgets: "id, user_id"
    });
`;

content = content.replace(/    \}\);/, `    });\n${v14Stores}`);

fs.writeFileSync('src/db/dexie.ts', content);
