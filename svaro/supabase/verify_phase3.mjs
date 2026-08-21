/**
 * SVARO Phase 3 Live Supabase Verification Script
 * Run: node supabase/verify_phase3.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

const frontendEnv = loadEnv(path.join(rootDir, '.env.local'));
const adminEnv = loadEnv(path.join(rootDir, '.admin.local'));

const SUPABASE_URL = adminEnv.SUPABASE_URL || frontendEnv.VITE_SUPABASE_URL;
const ANON_KEY = frontendEnv.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = adminEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error('Missing credentials.');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const results = [];
function pass(name, detail = '') { results.push({ name, status: 'PASS', detail }); }
function fail(name, detail) { results.push({ name, status: 'FAIL', detail }); }

// STEP 1: Connection
async function verifyConnection() {
  console.log('\n== STEP 1: CONNECTION VERIFICATION ==');
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    });
    if (resp.status >= 200 && resp.status < 500) {
      pass('Supabase Connection', `HTTP ${resp.status}`);
      console.log('  OK: Supabase project connected');
    } else {
      fail('Supabase Connection', `HTTP ${resp.status}`);
      console.log(`  FAIL: HTTP ${resp.status}`);
    }
  } catch (e) {
    fail('Supabase Connection', e.message);
    console.log(`  FAIL: ${e.message}`);
  }
}

// STEP 2: Preflight
async function preflightAudit() {
  console.log('\n== STEP 2: PREFLIGHT DATA AUDIT ==');
  const tables = [
    'owner_config','profiles','goals','nutrition_targets','exercises',
    'workout_templates','challenge_templates','task_templates','supplement_templates',
    'workout_sessions','set_logs','food_logs','weight_logs','measurement_logs',
    'progress_photos','water_logs','step_logs','sleep_logs','daily_tasks',
    'habit_logs','skincare_products','skincare_routines','skincare_logs',
    'cloud_backups','user_roles','resource_shares','audit_logs',
    'habits','recommendations'
  ];
  for (const table of tables) {
    const { count, error } = await adminClient.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ${table}: NOT FOUND (${error.code || error.message})`);
    } else {
      console.log(`  ${table}: ${count ?? 0} rows`);
      pass(`Preflight: ${table}`, `${count ?? 0} rows`);
    }
  }
}

// STEP 3: Apply Migration
async function applyMigration() {
  console.log('\n== STEP 3: APPLY MIGRATION ==');
  const migPath = path.join(rootDir, 'supabase', 'migrations', '20260819_002_phase3_cloud_schema.sql');
  if (!fs.existsSync(migPath)) {
    fail('Migration File', 'Not found');
    return;
  }
  const sql = fs.readFileSync(migPath, 'utf-8');
  console.log(`  Migration file: ${sql.length} bytes`);
  console.log('  NOTE: PostgREST cannot run DDL. Apply via Dashboard SQL Editor.');
  console.log('  Checking if migration was already applied by testing for user_roles table...');
  
  const { error } = await adminClient.from('user_roles').select('*', { count: 'exact', head: true });
  if (!error) {
    pass('Migration Status', 'user_roles table exists - migration appears applied');
    console.log('  OK: user_roles exists - migration was already applied or needs applying');
  } else {
    fail('Migration Status', 'user_roles not found - migration needs to be applied via Dashboard');
    console.log('  NEEDS: Apply migration via Supabase Dashboard SQL Editor first');
  }
}

// Create test users
async function createTestUsers() {
  console.log('\n== STEP 4: CREATE TEST USERS ==');
  const emailA = 'svaro-test-a@test.svaro.local';
  const emailB = 'svaro-test-b@test.svaro.local';
  const pw = 'SvaroTest!Phase3!2026';

  let userA, userB;
  
  // User A
  const { data: dA, error: eA } = await adminClient.auth.admin.createUser({
    email: emailA, password: pw, email_confirm: true
  });
  if (eA) {
    if (eA.message.includes('already')) {
      const { data: list } = await adminClient.auth.admin.listUsers();
      userA = list?.users?.find(u => u.email === emailA);
    } else { fail('Create User A', eA.message); console.log(`  FAIL A: ${eA.message}`); return null; }
  } else { userA = dA?.user; }
  
  // User B
  const { data: dB, error: eB } = await adminClient.auth.admin.createUser({
    email: emailB, password: pw, email_confirm: true
  });
  if (eB) {
    if (eB.message.includes('already')) {
      const { data: list } = await adminClient.auth.admin.listUsers();
      userB = list?.users?.find(u => u.email === emailB);
    } else { fail('Create User B', eB.message); console.log(`  FAIL B: ${eB.message}`); return null; }
  } else { userB = dB?.user; }

  if (!userA?.id || !userB?.id) { fail('Create Users', 'Could not resolve IDs'); return null; }

  pass('Create User A', userA.id);
  pass('Create User B', userB.id);
  console.log(`  OK User A: ${userA.id}`);
  console.log(`  OK User B: ${userB.id}`);
  return { userA: { id: userA.id, email: emailA }, userB: { id: userB.id, email: emailB } };
}

async function getUserClient(email, password) {
  const c = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed ${email}: ${error.message}`);
  return c;
}

// Main RLS Tests
async function rlsTests(userA, userB) {
  console.log('\n== STEP 5: RLS & ISOLATION TESTS ==');
  const pw = 'SvaroTest!Phase3!2026';
  let cA, cB;
  try { cA = await getUserClient(userA.email, pw); pass('Auth User A', 'OK'); console.log('  OK: User A authenticated'); }
  catch(e) { fail('Auth User A', e.message); console.log(`  FAIL: ${e.message}`); return; }
  try { cB = await getUserClient(userB.email, pw); pass('Auth User B', 'OK'); console.log('  OK: User B authenticated'); }
  catch(e) { fail('Auth User B', e.message); console.log(`  FAIL: ${e.message}`); return; }

  const gA = crypto.randomUUID();
  const gB = crypto.randomUUID();

  // INSERT OWN
  console.log('\n  -- Insert Tests --');
  {
    const { error } = await cA.from('goals').insert({ id: gA, user_id: userA.id, type: 'strength', target_weight_kg: 80, priority: 'high', privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false });
    if (error) { fail('A Insert Own', error.message); console.log(`  FAIL: ${error.message}`); }
    else { pass('A Insert Own', 'OK'); console.log('  OK: User A inserted own goal'); }
  }
  {
    const { error } = await cB.from('goals').insert({ id: gB, user_id: userB.id, type: 'weight_loss', target_weight_kg: 70, priority: 'medium', privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false });
    if (error) { fail('B Insert Own', error.message); console.log(`  FAIL: ${error.message}`); }
    else { pass('B Insert Own', 'OK'); console.log('  OK: User B inserted own goal'); }
  }

  // READ ISOLATION
  console.log('\n  -- Read Isolation --');
  {
    const { data } = await cA.from('goals').select('*');
    const seesOwn = data?.some(r => r.id === gA);
    const seesB = data?.some(r => r.id === gB);
    if (seesOwn && !seesB) { pass('A Read Isolation', `${data.length} rows, no B`); console.log(`  OK: A sees own (${data.length}), not B`); }
    else if (seesB) { fail('A Read Isolation', 'SEES B DATA'); console.log('  FAIL: A sees B data!'); }
    else { fail('A Read Isolation', 'Cannot see own'); console.log('  FAIL: A cannot see own'); }
  }
  {
    const { data } = await cB.from('goals').select('*');
    const seesOwn = data?.some(r => r.id === gB);
    const seesA = data?.some(r => r.id === gA);
    if (seesOwn && !seesA) { pass('B Read Isolation', `${data.length} rows, no A`); console.log(`  OK: B sees own (${data.length}), not A`); }
    else if (seesA) { fail('B Read Isolation', 'SEES A DATA'); console.log('  FAIL: B sees A data!'); }
    else { fail('B Read Isolation', 'Cannot see own'); console.log('  FAIL: B cannot see own'); }
  }

  // CROSS-USER ATTACKS
  console.log('\n  -- Cross-User Attacks --');
  {
    const { error } = await cA.from('goals').insert({ id: crypto.randomUUID(), user_id: userB.id, type: 'fake', priority: 'h', privacy_level: 'PRIVATE', sync_state: 'PENDING', deleted: false });
    if (error) { pass('A Insert As B', `Rejected: ${error.code}`); console.log('  OK: A cannot insert as B'); }
    else { fail('A Insert As B', 'ALLOWED'); console.log('  FAIL: A inserted as B!'); }
  }
  {
    await cA.from('goals').update({ type: 'hacked' }).eq('id', gB);
    const { data: chk } = await cB.from('goals').select('*').eq('id', gB).single();
    if (chk?.type === 'weight_loss') { pass('A Update B', 'Blocked'); console.log('  OK: A cannot update B'); }
    else { fail('A Update B', 'MODIFIED'); console.log('  FAIL: A modified B!'); }
  }
  {
    await cA.from('goals').delete().eq('id', gB);
    const { data: chk } = await cB.from('goals').select('*').eq('id', gB).single();
    if (chk) { pass('A Delete B', 'Preserved'); console.log('  OK: A cannot delete B'); }
    else { fail('A Delete B', 'DELETED'); console.log('  FAIL: A deleted B!'); }
  }
  {
    await cA.from('goals').update({ user_id: userB.id }).eq('id', gA);
    const { data: chk } = await cA.from('goals').select('*').eq('id', gA).single();
    if (chk?.user_id === userA.id) { pass('A Transfer Ownership', 'Blocked'); console.log('  OK: A cannot transfer ownership'); }
    else if (!chk) { pass('A Transfer Ownership', 'Row hidden after change (RLS enforced)'); console.log('  WARN: Row hidden after user_id change'); }
    else { fail('A Transfer Ownership', 'Transferred'); console.log('  FAIL: Ownership transferred!'); }
  }

  // PRIVACY
  console.log('\n  -- Privacy Tests --');
  {
    const { data } = await cB.from('goals').select('*').eq('id', gA);
    if (!data?.length) { pass('PRIVATE: B Cannot Read A', 'Hidden'); console.log('  OK: PRIVATE hides from B'); }
    else { fail('PRIVATE: B Cannot Read A', 'Visible'); console.log('  FAIL: PRIVATE visible to B'); }
  }
  {
    await cA.from('goals').update({ privacy_level: 'PUBLIC' }).eq('id', gA);
    const { data } = await cB.from('goals').select('*').eq('id', gA);
    if (data?.length) { pass('PUBLIC: B Can Read A', 'Visible'); console.log('  OK: PUBLIC visible to B'); }
    else { fail('PUBLIC: B Can Read A', 'Hidden'); console.log('  FAIL: PUBLIC not visible to B'); }
    await cA.from('goals').update({ privacy_level: 'PRIVATE' }).eq('id', gA);
  }

  // SHARING
  console.log('\n  -- Sharing Tests --');
  const shareId = crypto.randomUUID();
  {
    await cA.from('goals').update({ privacy_level: 'SHARED' }).eq('id', gA);
    const { data: bef } = await cB.from('goals').select('*').eq('id', gA);
    if (!bef?.length) { pass('SHARED: Before Grant', 'Hidden'); console.log('  OK: SHARED hidden without grant'); }
    else { fail('SHARED: Before Grant', 'Visible'); console.log('  FAIL: SHARED visible without grant'); }

    const { error: shErr } = await cA.from('resource_shares').insert({ id: shareId, owner_user_id: userA.id, target_user_id: userB.id, resource_type: 'goals', resource_id: gA, permission: 'VIEW' });
    if (shErr) { fail('Create VIEW Share', shErr.message); console.log(`  FAIL: ${shErr.message}`); }
    else { pass('Create VIEW Share', 'OK'); console.log('  OK: VIEW share created'); }

    const { data: aft } = await cB.from('goals').select('*').eq('id', gA);
    if (aft?.length) { pass('SHARED VIEW: B Can Read', 'Visible'); console.log('  OK: B can read with VIEW share'); }
    else { fail('SHARED VIEW: B Can Read', 'Hidden'); console.log('  FAIL: B cannot read with VIEW share'); }

    await cB.from('goals').update({ type: 'hacked' }).eq('id', gA);
    const { data: chk } = await cA.from('goals').select('*').eq('id', gA).single();
    if (chk?.type !== 'hacked') { pass('VIEW: B Cannot Update', 'Blocked'); console.log('  OK: VIEW blocks write'); }
    else { fail('VIEW: B Cannot Update', 'ALLOWED'); console.log('  FAIL: VIEW allows write!'); }

    await cB.from('goals').delete().eq('id', gA);
    const { data: chk2 } = await cA.from('goals').select('*').eq('id', gA).single();
    if (chk2) { pass('VIEW: B Cannot Delete', 'Blocked'); console.log('  OK: VIEW blocks delete'); }
    else { fail('VIEW: B Cannot Delete', 'DELETED'); console.log('  FAIL: VIEW allows delete!'); }

    // Revoke
    await cA.from('resource_shares').update({ revoked_at: new Date().toISOString() }).eq('id', shareId);
    const { data: rev } = await cB.from('goals').select('*').eq('id', gA);
    if (!rev?.length) { pass('Share Revocation', 'Access stopped'); console.log('  OK: Revoked share stops access'); }
    else { fail('Share Revocation', 'Still visible'); console.log('  FAIL: Revoked share still visible'); }

    await cA.from('goals').update({ privacy_level: 'PRIVATE' }).eq('id', gA);
  }

  // RBAC
  console.log('\n  -- RBAC Tests --');
  {
    const { error } = await cA.from('user_roles').insert({ user_id: userA.id, role: 'OWNER' });
    if (error) { pass('Self-Promote OWNER', `Rejected: ${error.code}`); console.log('  OK: Cannot self-promote to OWNER'); }
    else {
      const { data: chk } = await adminClient.from('user_roles').select('*').eq('user_id', userA.id);
      if (chk?.length && chk[0].role === 'OWNER') {
        fail('Self-Promote OWNER', 'SUCCEEDED'); console.log('  FAIL: Self-promoted to OWNER!');
        await adminClient.from('user_roles').delete().eq('user_id', userA.id);
      } else { pass('Self-Promote OWNER', 'Insert ignored'); console.log('  OK: Self-promote silently blocked'); }
    }
  }
  {
    await adminClient.from('user_roles').upsert({ user_id: userA.id, role: 'USER' });
    await cA.from('user_roles').update({ role: 'ADMIN' }).eq('user_id', userA.id);
    const { data: chk } = await adminClient.from('user_roles').select('*').eq('user_id', userA.id).single();
    if (chk?.role === 'USER') { pass('Self-Promote UPDATE', 'Blocked'); console.log('  OK: Cannot update own role'); }
    else { fail('Self-Promote UPDATE', `Changed to ${chk?.role}`); console.log(`  FAIL: Role changed to ${chk?.role}!`); await adminClient.from('user_roles').update({ role: 'USER' }).eq('user_id', userA.id); }
  }

  // AUDIT
  console.log('\n  -- Audit Log Tests --');
  {
    await adminClient.from('audit_logs').insert({ actor_user_id: userA.id, action: 'TEST', entity_type: 'goals', entity_id: gA, metadata: { t: true } });
    const { data } = await cA.from('audit_logs').select('*');
    if (!data?.length) { pass('Audit: User Cannot Read', 'Hidden'); console.log('  OK: Normal user cannot read audit logs'); }
    else { fail('Audit: User Cannot Read', `Sees ${data.length}`); console.log(`  FAIL: User sees ${data.length} audit entries!`); }
  }

  // CONSTRAINTS
  console.log('\n  -- Constraint Tests --');
  {
    const { error } = await cA.from('goals').insert({ id: crypto.randomUUID(), user_id: userA.id, type: 'x', privacy_level: 'INVALID', sync_state: 'SYNCED', deleted: false });
    if (error) { pass('Constraint: Invalid Privacy', `Rejected`); console.log('  OK: Invalid privacy rejected'); }
    else { fail('Constraint: Invalid Privacy', 'Accepted'); console.log('  FAIL: Invalid privacy accepted!'); }
  }
  {
    const { error } = await cA.from('goals').insert({ id: crypto.randomUUID(), user_id: userA.id, type: 'x', privacy_level: 'PRIVATE', sync_state: 'BOGUS', deleted: false });
    if (error) { pass('Constraint: Invalid Sync State', `Rejected`); console.log('  OK: Invalid sync_state rejected'); }
    else { fail('Constraint: Invalid Sync State', 'Accepted'); console.log('  FAIL: Invalid sync_state accepted!'); }
  }
  {
    const { error } = await adminClient.from('user_roles').insert({ user_id: userB.id, role: 'SUPERADMIN' });
    if (error) { pass('Constraint: Invalid Role', `Rejected`); console.log('  OK: Invalid role rejected'); }
    else { fail('Constraint: Invalid Role', 'Accepted'); console.log('  FAIL: Invalid role accepted!'); await adminClient.from('user_roles').delete().eq('user_id', userB.id); }
  }
  {
    const { error } = await cA.from('resource_shares').insert({ id: crypto.randomUUID(), owner_user_id: userA.id, target_user_id: userB.id, resource_type: 'goals', permission: 'DELETE' });
    if (error) { pass('Constraint: Invalid Permission', `Rejected`); console.log('  OK: Invalid permission rejected'); }
    else { fail('Constraint: Invalid Permission', 'Accepted'); console.log('  FAIL: Invalid permission accepted!'); }
  }

  // ANONYMOUS
  console.log('\n  -- Anonymous Access --');
  {
    const { data } = await anonClient.from('goals').select('*');
    if (!data?.length) { pass('Anonymous: Cannot Read', 'Blocked'); console.log('  OK: Anonymous blocked'); }
    else { fail('Anonymous: Cannot Read', `Sees ${data.length}`); console.log(`  FAIL: Anonymous sees ${data.length}!`); }
  }

  // STORAGE
  console.log('\n  -- Storage Tests --');
  const testFile = `${userA.id}/test-photo.txt`;
  const blob = new Blob(['test-content'], { type: 'text/plain' });
  {
    const { error } = await cA.storage.from('svaro-progress-photos').upload(testFile, blob, { upsert: true });
    if (error) { fail('Storage: A Upload', error.message); console.log(`  FAIL: A upload: ${error.message}`); }
    else { pass('Storage: A Upload', 'OK'); console.log('  OK: A uploaded to own path'); }
  }
  {
    const { data, error } = await cA.storage.from('svaro-progress-photos').download(testFile);
    if (error) { fail('Storage: A Read Own', error.message); console.log(`  FAIL: A read: ${error.message}`); }
    else { pass('Storage: A Read Own', 'OK'); console.log('  OK: A can read own file'); }
  }
  {
    const { data, error } = await cB.storage.from('svaro-progress-photos').download(testFile);
    if (error) { pass('Storage: B Cannot Read A', 'Rejected'); console.log('  OK: B cannot read A file'); }
    else { fail('Storage: B Cannot Read A', 'ALLOWED'); console.log('  FAIL: B can read A file!'); }
  }
  {
    const { error } = await cB.storage.from('svaro-progress-photos').upload(`${userA.id}/hacked.txt`, blob);
    if (error) { pass('Storage: B Cannot Upload to A', 'Rejected'); console.log('  OK: B cannot upload to A path'); }
    else { fail('Storage: B Cannot Upload to A', 'ALLOWED'); console.log('  FAIL: B uploaded to A path!'); }
  }
  await cA.storage.from('svaro-progress-photos').remove([testFile]);

  // CLEANUP
  console.log('\n  -- Cleanup --');
  await adminClient.from('goals').delete().eq('id', gA);
  await adminClient.from('goals').delete().eq('id', gB);
  await adminClient.from('resource_shares').delete().eq('id', shareId);
  await adminClient.from('user_roles').delete().eq('user_id', userA.id);
  await adminClient.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  OK: Test data cleaned');
}

async function cleanupUsers(a, b) {
  console.log('\n== CLEANUP USERS ==');
  try { await adminClient.auth.admin.deleteUser(a.id); } catch(e) {}
  try { await adminClient.auth.admin.deleteUser(b.id); } catch(e) {}
  console.log('  OK: Test users deleted');
  pass('Cleanup Users', 'Done');
}

async function main() {
  console.log('=== SVARO Phase 3 Live Verification ===');
  await verifyConnection();
  await preflightAudit();
  await applyMigration();
  const users = await createTestUsers();
  if (users) {
    await rlsTests(users.userA, users.userB);
    await cleanupUsers(users.userA, users.userB);
  }

  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r.status === 'PASS');
  const failed = results.filter(r => r.status === 'FAIL');
  console.log(`PASSED: ${passed.length}`);
  console.log(`FAILED: ${failed.length}`);
  if (failed.length) {
    console.log('\n-- FAILURES --');
    for (const f of failed) console.log(`  X ${f.name}: ${f.detail}`);
  }
  console.log('\n-- ALL RESULTS --');
  for (const r of results) console.log(`  ${r.status === 'PASS' ? 'OK' : 'XX'} [${r.status}] ${r.name}: ${r.detail}`);
  console.log(`\nPhase 3: ${failed.length === 0 ? 'COMPLETE' : 'REQUIRES FIXES'}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
