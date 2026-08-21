import fs from 'fs';
let code = fs.readFileSync('src/domain/gamification/GamificationEngine.ts', 'utf8');

// Fix unused imports
code = code.replace(/import type \{ GamificationTransaction, UserGamificationProfile, UserBadge \} from '\.\.\/\.\.\/db\/dexie';/, "import type { GamificationTransaction, UserGamificationProfile } from '../../db/dexie';");

// Fix strict null checks
code = code.replace(/let profile = await localRepo.getGamificationProfile\(userId\);\n    if \(!profile\) \{[\s\S]*?\} as any;\n    \}/, `let profile: UserGamificationProfile | undefined = await localRepo.getGamificationProfile(userId);
    if (!profile) {
      profile = {
        ...createBaseEntity(userId),
        id: uuidv4(),
        total_xp: 0,
        total_credits: 0,
        current_level: 1
      } as unknown as UserGamificationProfile;
    }`);

fs.writeFileSync('src/domain/gamification/GamificationEngine.ts', code);
