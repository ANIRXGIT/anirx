import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
 // Using generic icons if available, else standard emojis or svgs

function mapAuthError(err: any): string {
  if (!err) return 'Something went wrong. Please try again.';
  const msg = err.message || '';
  
  if (msg.includes('provider is not enabled')) return 'Google sign-in is currently unavailable.';
  if (msg.toLowerCase().includes('invalid login credentials')) return 'Incorrect email or password.';
  if (msg.toLowerCase().includes('already registered')) return 'This email is already registered. Try signing in instead.';
  if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('unverified')) return 'Please verify your email before continuing.';
  if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) return 'Unable to connect. Please check your internet connection and try again.';
  if (msg.toLowerCase().includes('rate limit')) return 'Too many attempts. Please try again later.';
  
  return 'Something went wrong. Please try again.';
}

export default function Login() {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUp, 
    isLoading, 
    requiresEmailVerification, 
    verificationEmailSentTo,
    resendVerificationEmail,
    resetVerificationState
  } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await resendVerificationEmail();
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(mapAuthError(err));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(mapAuthError(err));
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(mapAuthError(err));
    }
  };

  if (requiresEmailVerification) {
    return (
      <div className="min-h-full bg-background text-text flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-3xl border border-border shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-black tracking-tighter uppercase">Check Your Email</h2>
          
          <p className="text-sm text-text-muted mt-4">
            We've sent a verification email to:<br/>
            <span className="font-bold text-text">{verificationEmailSentTo}</span>
          </p>
          <p className="text-xs text-text-muted mt-4 mb-8">
            Please verify your email address, then return to SVARO to continue.
          </p>

          {error && (
            <div className="bg-error/10 border border-error text-error p-3 rounded-xl text-xs font-bold text-center mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="w-full bg-surface-hover border border-border py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend verification email'}
            </button>
            
            <button 
              onClick={resetVerificationState}
              className="text-[10px] text-text-muted hover:text-accent font-black uppercase tracking-widest"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-text flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-3xl border border-border shadow-2xl">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">SVARO</h1>
          <p className="text-xs font-black tracking-widest uppercase text-accent">Life Operating System</p>
        </header>

        {error && (
          <div className="bg-error/10 border border-error text-error p-3 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button 
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-all shadow-md hover:bg-gray-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-[10px] font-black uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-background border border-border rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-accent transition-colors"
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-background border border-border rounded-xl p-4 pr-12 text-sm font-bold focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="pt-2 flex gap-3">
              <button 
                type="submit"
                onClick={() => setMode('login')}
                disabled={isLoading}
                className={`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 ${mode === 'login' ? 'bg-accent text-white border border-transparent' : 'bg-background border border-border text-text hover:bg-surface-hover'}`}
              >
                Sign In
              </button>
              <button 
                type="submit"
                onClick={() => setMode('signup')}
                disabled={isLoading}
                className={`flex-1 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-colors disabled:opacity-50 ${mode === 'signup' ? 'bg-accent text-white border border-transparent' : 'bg-background border border-border text-text hover:bg-surface-hover'}`}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

