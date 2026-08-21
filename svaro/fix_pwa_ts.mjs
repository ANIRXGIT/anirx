import fs from 'fs';
let content = fs.readFileSync('src/vite-env.d.ts', 'utf8');
content += "\n/// <reference types=\"vite-plugin-pwa/client\" />\n/// <reference types=\"vite-plugin-pwa/react\" />\n";
fs.writeFileSync('src/vite-env.d.ts', content);

let badge = fs.readFileSync('src/components/PWABadge.tsx', 'utf8');
badge = badge.replace(/onRegistered\(r\)/, 'onRegistered(r: any)');
badge = badge.replace(/onRegisterError\(error\)/, 'onRegisterError(error: any)');
fs.writeFileSync('src/components/PWABadge.tsx', badge);
