import fs from 'fs';
let content = fs.readFileSync('src/stores/useAuthStore.ts', 'utf8');

const onAuthStateChangeOrig = `      supabase.auth.onAuthStateChange(async (_event, session) => {
        let isOwner = false;
        if (session?.user) {
          try {
            const { data } = await supabase.rpc('is_owner');
            isOwner = !!data;
          } catch (e) {}
        }
        if (session?.user) { 
           await localRepo.claimLegacyData(session.user.id);
           SyncEngine.initialize(session.user.id);
        } else {
           SyncEngine.initialize(null);
        }
        set({ session, user: session?.user ?? null, isOwner, isLoading: false });
      });`;

const onAuthStateChangeNew = `      supabase.auth.onAuthStateChange(async (_event, session) => {
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
          set({ session, user: session?.user ?? null, isOwner, isLoading: false });
        }
      });`;

content = content.replace(onAuthStateChangeOrig, onAuthStateChangeNew);

fs.writeFileSync('src/stores/useAuthStore.ts', content);
