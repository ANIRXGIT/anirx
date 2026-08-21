import fs from 'fs';
let content = fs.readFileSync('src/features/owner/OwnerLayout.tsx', 'utf8');

const importStatement = "import { ErrorBoundary } from '../../components/navigation/ErrorBoundary';";
if (!content.includes('ErrorBoundary')) {
  content = content.replace(/import \{ Outlet, Link, useLocation \} from 'react-router-dom';/, "import { Outlet, Link, useLocation } from 'react-router-dom';\n" + importStatement);
  
  content = content.replace(/<Outlet \/>/, '<ErrorBoundary>\n            <Outlet />\n          </ErrorBoundary>');
  fs.writeFileSync('src/features/owner/OwnerLayout.tsx', content);
}
