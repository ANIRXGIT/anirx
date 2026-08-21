import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import DomainPlaceholder from '.\/features\/placeholders\/DomainPlaceholder';/, `import DomainPlaceholder from './features/placeholders/DomainPlaceholder';
import StudyOverview from './features/study/StudyOverview';
import CareerOverview from './features/career/CareerOverview';
import ProjectsOverview from './features/projects/ProjectsOverview';
import FinanceOverview from './features/finance/FinanceOverview';`);

content = content.replace(/<Route path="\/study\/\*" element={<DomainPlaceholder title="Study" domain="Study & Academics" \/>} \/>/, '<Route path="/study/*" element={<StudyOverview />} />');
content = content.replace(/<Route path="\/career\/\*" element={<DomainPlaceholder title="Career" domain="Career & Skills" \/>} \/>/, '<Route path="/career/*" element={<CareerOverview />} />');
content = content.replace(/<Route path="\/projects\/\*" element={<DomainPlaceholder title="Projects" domain="Projects" \/>} \/>/, '<Route path="/projects/*" element={<ProjectsOverview />} />');
content = content.replace(/<Route path="\/finance\/\*" element={<DomainPlaceholder title="Finance" domain="Finance" \/>} \/>/, '<Route path="/finance/*" element={<FinanceOverview />} />');

fs.writeFileSync('src/App.tsx', content);
