import fs from 'fs';
let content = fs.readFileSync('src/stores/useAuthStore.ts', 'utf8');

// Fix magic link redirect
content = content.replace(/await supabase\.auth\.signInWithOtp\(\{ email \}\);/, "await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });");

fs.writeFileSync('src/stores/useAuthStore.ts', content);
