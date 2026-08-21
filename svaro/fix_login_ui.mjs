import fs from 'fs';
let content = fs.readFileSync('src/features/auth/Login.tsx', 'utf8');

// Add signUp to useAuthStore imports and state
content = content.replace(/const \{ signInWithGoogle, signInWithEmail, isLoading \} = useAuthStore\(\);/, "const { signInWithGoogle, signInWithEmail, signUp, isLoading } = useAuthStore();");
content = content.replace(/const \[mode, setMode\] = useState<'login' \| 'magic'>\('login'\);/, "const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login');");

// Fix handleEmailAuth to include signup
const handleEmailAuthOrig = `      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signInWithEmail(email);
        alert('Magic link sent to ' + email);
      }`;
const handleEmailAuthNew = `      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password);
        alert('Signup successful! Check your email for confirmation if required, or login.');
      } else {
        await signInWithEmail(email);
        alert('Magic link sent to ' + email);
      }`;
content = content.replace(handleEmailAuthOrig, handleEmailAuthNew);

// Fix UI buttons
const uiButtonOrig = `{mode === 'login' ? 'Authenticate' : 'Send Magic Link'}`;
const uiButtonNew = `{mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}`;
content = content.replace(uiButtonOrig, uiButtonNew);

const modeToggleOrig = `Toggle Mode: {mode === 'login' ? 'Switch to Magic Link' : 'Switch to Password'}`;
const modeToggleNew = `Toggle Mode: {mode === 'login' ? 'Switch to Sign Up' : mode === 'signup' ? 'Switch to Magic Link' : 'Switch to Login'}`;
content = content.replace(modeToggleOrig, modeToggleNew);

const setModeOrig = `onClick={() => setMode(mode === 'login' ? 'magic' : 'login')}`;
const setModeNew = `onClick={() => setMode(mode === 'login' ? 'signup' : mode === 'signup' ? 'magic' : 'login')}`;
content = content.replace(setModeOrig, setModeNew);

fs.writeFileSync('src/features/auth/Login.tsx', content);
