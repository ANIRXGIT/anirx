import fs from 'fs';

let career = fs.readFileSync('src/domain/career/CareerEngine.ts', 'utf8');
career = career.replace(/import { CareerApplication } from '\.\.\/\.\.\/db\/dexie';\n/, '');
fs.writeFileSync('src/domain/career/CareerEngine.ts', career);

let finance = fs.readFileSync('src/domain/finance/FinanceEngine.ts', 'utf8');
finance = finance.replace(/import { FinanceTransaction, FinanceBudget, Goal } from '\.\.\/\.\.\/db\/dexie';/, "import type { FinanceTransaction } from '../../db/dexie';");
finance = finance.replace(/, isAfter, isBefore/, "");
fs.writeFileSync('src/domain/finance/FinanceEngine.ts', finance);

let study = fs.readFileSync('src/domain/study/StudyEngine.ts', 'utf8');
study = study.replace(/import { StudySession, Goal } from '\.\.\/\.\.\/db\/dexie';/, "import type { StudySession, Goal } from '../../db/dexie';");
fs.writeFileSync('src/domain/study/StudyEngine.ts', study);

