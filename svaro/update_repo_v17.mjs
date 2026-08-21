import fs from 'fs';
let content = fs.readFileSync('src/db/repositories/LocalRepository.ts', 'utf8');

const injection = `
  // System Config
  async getSystemConfig(key: string) { return db.system_config.get(key); }
  async getAllSystemConfigs() { return db.system_config.toArray(); }
  async saveSystemConfig(config: any) { await db.system_config.put(config); }
  
  // Feature Flags
  async getFeatureFlag(flag: string) { return db.feature_flags.get(flag); }
  async getAllFeatureFlags() { return db.feature_flags.toArray(); }
  async saveFeatureFlag(flagObj: any) { await db.feature_flags.put(flagObj); }
}
`;

content = content.replace(/}\s*export const localRepo = new LocalRepository\(\);/, injection + '\nexport const localRepo = new LocalRepository();');
fs.writeFileSync('src/db/repositories/LocalRepository.ts', content);
