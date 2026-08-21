import fs from 'fs';
let content = fs.readFileSync('src/features/auth/Login.tsx', 'utf8');

content = content.replace(/\{mode === 'login' && \(/, "{(mode === 'login' || mode === 'signup') && (");

fs.writeFileSync('src/features/auth/Login.tsx', content);
