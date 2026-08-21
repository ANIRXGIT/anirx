import fs from 'fs';
let content = fs.readFileSync('src/stores/useAuthStore.ts', 'utf8');

content = content.replace(/signInWithEmail: \(email: string, password\?: string\) => Promise<void>;/, "signInWithEmail: (email: string, password?: string) => Promise<void>;\n  signUp: (email: string, password?: string) => Promise<void>;");

const signUpFunc = `  signUp: async (email: string, password?: string) => {
    set({ isLoading: true });
    if (!password) {
      set({ isLoading: false });
      throw new Error('Password required for signup');
    }
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) {
      set({ isLoading: false });
      throw error;
    }
    set({ isLoading: false });
  },`;

content = content.replace(/signInWithPhone: async \(phone: string, otp\?: string\) => \{/, signUpFunc + "\n\n  signInWithPhone: async (phone: string, otp?: string) => {");

fs.writeFileSync('src/stores/useAuthStore.ts', content);
