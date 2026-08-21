import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { localRepo } from '../db/repositories/LocalRepository';
import type { User, Session } from '@supabase/supabase-js';
import { SyncEngine } from '../sync/SyncEngine';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isOwner: boolean;
  requiresEmailVerification: boolean;
  verificationEmailSentTo: string | null;
  
  initialize: () => Promise<void>;
  
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  resetVerificationState: () => void;
  resendVerificationEmail: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isOwner: false,
  requiresEmailVerification: false,
  verificationEmailSentTo: null,
  
  resetVerificationState: () => set({ requiresEmailVerification: false, verificationEmailSentTo: null }),
  
  resendVerificationEmail: async () => {
    const email = get().verificationEmailSentTo;
    if (!email) throw new Error("No email to verify.");
    
    // For Resend verification email, we can call resend via OTP/Magic link or just use resend API if configured
    // Supabase supports resending confirmation email:
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      let isOwner = false;
      if (session?.user) {
        try {
          const { data } = await supabase.rpc('is_owner');
          isOwner = !!data;
        } catch (e) {}
      }

      if (session?.user) { 
         try {
           await localRepo.claimLegacyData(session.user.id);
         } catch (e) {
           console.warn('Failed to claim legacy data', e);
         }
         SyncEngine.initialize(session.user.id);
      } else {
         SyncEngine.initialize(null);
      }

      set({ session, user: session?.user ?? null, isOwner, isLoading: false, requiresEmailVerification: false });

      supabase.auth.onAuthStateChange(async (_event, session) => {
        let isOwner = false;
        try {
          if (session?.user) {
            try {
              const { data } = await supabase.rpc('is_owner');
              isOwner = !!data;
            } catch (e) {}
            try {
              await localRepo.claimLegacyData(session.user.id);
            } catch (e) {
              console.warn('Failed to claim legacy data', e);
            }
            SyncEngine.initialize(session.user.id);
          } else {
            SyncEngine.initialize(null);
          }
        } finally {
          set({ session, user: session?.user ?? null, isOwner, isLoading: false, requiresEmailVerification: false });
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth', error);
      SyncEngine.initialize(null);
      set({ session: null, user: null, isOwner: false, isLoading: false });
    }
  },
  
  signInWithGoogle: async () => {
    set({ isLoading: true });
    // We do not catch here to allow Login.tsx to handle the error mapping.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      throw error;
    }
    // Success - onAuthStateChange will handle session update and set isLoading to false
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    
    if (error) {
      set({ isLoading: false });
      throw error;
    }
    
    if (data.user && !data.session) {
      // Email confirmation is required by Supabase
      set({ isLoading: false, requiresEmailVerification: true, verificationEmailSentTo: email });
    } else {
      // Auto-login (email confirmation disabled)
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    // onAuthStateChange sets user/session to null
  }
}));
