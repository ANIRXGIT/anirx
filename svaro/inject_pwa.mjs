import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import
content = content.replace(/import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';/, "import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';\nimport { PWABadge } from './components/PWABadge';");

// Insert PWABadge
content = content.replace(/<Router>/, '<Router>\n      <PWABadge />');

fs.writeFileSync('src/App.tsx', content);
