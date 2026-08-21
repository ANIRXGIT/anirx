import fs from 'fs';

let adminEngine = fs.readFileSync('src/domain/admin/AdminEngine.ts', 'utf8');
adminEngine = adminEngine.replace(/import \{ supabase \} from '\.\.\/\.\.\/db\/supabase';/, "import { supabase } from '../../lib/supabase';");
fs.writeFileSync('src/domain/admin/AdminEngine.ts', adminEngine);

let testFile = fs.readFileSync('src/domain/gamification/phase9.test.ts', 'utf8');
testFile = testFile.replace(/import \{ describe, it, expect, vi \} from 'vitest';/, "import { describe, it, expect } from 'vitest';");
fs.writeFileSync('src/domain/gamification/phase9.test.ts', testFile);
