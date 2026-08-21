import fs from 'fs';
let layout = fs.readFileSync('src/features/owner/OwnerLayout.tsx', 'utf8');

const newLinks = `const links = [
    { to: '/owner', label: 'Overview' },
    { to: '/owner/system', label: 'System Config' },
    { to: '/owner/users', label: 'Users & Roles' },
    { to: '/owner/audit', label: 'Audit Logs' },
    { to: '/owner/content', label: 'Content' },
    { to: '/owner/skincare', label: 'Skincare' },
    { to: '/owner/backup', label: 'Backup' },
  ];`;

layout = layout.replace(/const links = \[[\s\S]*?\];/, newLinks);
fs.writeFileSync('src/features/owner/OwnerLayout.tsx', layout);
