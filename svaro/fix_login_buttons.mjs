import fs from 'fs';
let content = fs.readFileSync('src/features/auth/Login.tsx', 'utf8');

const oldButtons = `              <button 
                type="button"
                onClick={() => { setMode('login'); handleEmailAuth(e as any); }}
                disabled={isLoading}
                className={\\\`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 \\\${mode === 'login' ? 'bg-accent text-white' : 'bg-surface-hover border border-border text-text'}\\\`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setMode('signup'); handleEmailAuth(e as any); }}
                disabled={isLoading}
                className={\\\`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 \\\${mode === 'signup' ? 'bg-accent text-white' : 'bg-surface-hover border border-border text-text'}\\\`}
              >
                Create Account
              </button>`;

const newButtons = `              <button 
                type="submit"
                onClick={() => setMode('login')}
                disabled={isLoading}
                className={\`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 \${mode === 'login' ? 'bg-accent text-white border-transparent' : 'bg-surface-hover border border-border text-text'}\`}
              >
                Sign In
              </button>
              <button 
                type="submit"
                onClick={() => setMode('signup')}
                disabled={isLoading}
                className={\`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 \${mode === 'signup' ? 'bg-accent text-white border-transparent' : 'bg-surface-hover border border-border text-text'}\`}
              >
                Create Account
              </button>`;

content = content.replace(oldButtons, newButtons);
fs.writeFileSync('src/features/auth/Login.tsx', content);
