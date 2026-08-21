import fs from 'fs';
let content = fs.readFileSync('src/features/auth/Login.tsx', 'utf8');
content = content.replace(/import \{ EyeIcon, EyeSlashIcon, EnvelopeIcon \} from '@heroicons\/react\/24\/outline';/, "");
fs.writeFileSync('src/features/auth/Login.tsx', content);
