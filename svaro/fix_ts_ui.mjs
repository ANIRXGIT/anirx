import fs from 'fs';

function fixFile(file, match, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(match, replace);
  fs.writeFileSync(file, content);
}

fixFile('src/features/career/CareerOverview.tsx', 
  /import { APPLICATION_STATUSES, ApplicationStatus } from '\.\.\/\.\.\/domain\/career\/CareerEngine';/, 
  "import { APPLICATION_STATUSES } from '../../domain/career/CareerEngine';\nimport type { ApplicationStatus } from '../../domain/career/CareerEngine';"
);

fixFile('src/features/finance/FinanceOverview.tsx', 
  /import { FinanceEngine, FinanceSummary } from '\.\.\/\.\.\/domain\/finance\/FinanceEngine';/, 
  "import { FinanceEngine } from '../../domain/finance/FinanceEngine';\nimport type { FinanceSummary } from '../../domain/finance/FinanceEngine';"
);

fixFile('src/features/finance/FinanceOverview.tsx', 
  /import { FinanceTransaction } from '\.\.\/\.\.\/db\/dexie';/, 
  "import type { FinanceTransaction } from '../../db/dexie';"
);

fixFile('src/features/projects/ProjectsOverview.tsx', 
  /import { ProjectEngine, ProjectStats } from '\.\.\/\.\.\/domain\/projects\/ProjectEngine';/, 
  "import { ProjectEngine } from '../../domain/projects/ProjectEngine';\nimport type { ProjectStats } from '../../domain/projects/ProjectEngine';"
);

fixFile('src/features/study/StudyOverview.tsx', 
  /import { StudyEngine, StudyStats } from '\.\.\/\.\.\/domain\/study\/StudyEngine';/, 
  "import { StudyEngine } from '../../domain/study/StudyEngine';\nimport type { StudyStats } from '../../domain/study/StudyEngine';"
);
