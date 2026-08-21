import fs from 'fs';
let content = fs.readFileSync('src/db/dexie.ts', 'utf8');

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
  }
}
`;

if (!content.includes('this.version(14)')) {
  content = content.replace(/  \}\n\}/, v14Stores);
  fs.writeFileSync('src/db/dexie.ts', content);
}
