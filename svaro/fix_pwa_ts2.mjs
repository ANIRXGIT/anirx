import fs from 'fs';
let badge = fs.readFileSync('src/components/PWABadge.tsx', 'utf8');
badge = badge.replace(/onRegistered\(r\)/, 'onRegistered(r: any)');
badge = badge.replace(/onRegisterError\(error\)/, 'onRegisterError(error: any)');
fs.writeFileSync('src/components/PWABadge.tsx', badge);
