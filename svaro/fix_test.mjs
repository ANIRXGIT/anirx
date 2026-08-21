import fs from 'fs';
let content = fs.readFileSync('src/domain/admin/phase10.test.ts', 'utf8');

// Mock localRepo so we don't hit IndexedDB in tests
content = content.replace(/import \{ AdminEngine \} from '\.\/AdminEngine';/, "import { AdminEngine } from './AdminEngine';\nimport { vi } from 'vitest';\n\nvi.mock('../../db/repositories/LocalRepository', () => ({\n  localRepo: {\n    getSystemConfig: vi.fn().mockResolvedValue(null),\n    saveSystemConfig: vi.fn().mockResolvedValue(undefined)\n  }\n}));");

// Remove the vi from import list to avoid redeclaration if it already exists
content = content.replace(/import \{ describe, it, expect, vi \} from 'vitest';/, "import { describe, it, expect } from 'vitest';");

fs.writeFileSync('src/domain/admin/phase10.test.ts', content);
