import fs from 'fs';
let content = fs.readFileSync('src/features/auth/Login.tsx', 'utf8');

const regex = /<div className="pt-2 flex gap-3">[\s\S]*?<\/form>/;
const newContent = `<div className="pt-2 flex gap-3">
              <button 
                type="submit"
                onClick={() => setMode('login')}
                disabled={isLoading}
                className={\`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 \${mode === 'login' ? 'bg-accent text-white border border-transparent' : 'bg-background border border-border text-text hover:bg-surface-hover'}\`}
              >
                Sign In
              </button>
              <button 
                type="submit"
                onClick={() => setMode('signup')}
                disabled={isLoading}
                className={\`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 \${mode === 'signup' ? 'bg-accent text-white border border-transparent' : 'bg-background border border-border text-text hover:bg-surface-hover'}\`}
              >
                Create Account
              </button>
            </div>
          </form>`;

content = content.replace(regex, newContent);
fs.writeFileSync('src/features/auth/Login.tsx', content);
