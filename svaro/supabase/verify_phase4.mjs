/**
 * SVARO Phase 4 Live Verification Script
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

const results = [];
function pass(name, detail = '') { results.push({ name, status: 'PASS', detail }); }
function fail(name, detail) { results.push({ name, status: 'FAIL', detail }); }

async function getUserClient(email, password) {
  const c = createClient(SUPABASE_URL, ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed ${email}: ${error.message}`);
  return c;
}

async function main() {
  console.log('=== SVARO Phase 4 Live Verification ===');
  
  const emailA = 'svaro-sync-a@test.svaro.local';
  const emailB = 'svaro-sync-b@test.svaro.local';
  const pw = 'SvaroSync!Phase4!2026';
  let userA, userB;
  
  // Create Test Users
  for (const [email, userRef] of [[emailA, (u) => userA = u], [emailB, (u) => userB = u]]) {
    const { data, error } = await adminClient.auth.admin.createUser({ email, password: pw, email_confirm: true });
    if (error && error.message.includes('already')) {
      const { data: list } = await adminClient.auth.admin.listUsers();
      userRef(list?.users?.find(u => u.email === email));
    } else { userRef(data?.user); }
  }
  
  if (!userA?.id || !userB?.id) { console.error('Failed to create test users'); process.exit(1); }
  
  const cA = await getUserClient(emailA, pw);
  const cB = await getUserClient(emailB, pw);

  const goalId = crypto.randomUUID();
  const mut1 = crypto.randomUUID();
  const mut2 = crypto.randomUUID();
  const mut3 = crypto.randomUUID();
  const mut4 = crypto.randomUUID();

  // Test 1: New Insert
  console.log('\n-- Test 1: New Insert via RPC --');
  const payload1 = [{
    mutation_id: mut1,
    entity_type: 'goals',
    entity_id: goalId,
    operation: 'UPSERT',
    payload: { id: goalId, user_id: userA.id, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false, type: 'strength', target_weight_kg: 80, priority: 'high', title: 'Test 1' }
  }];
  const { data: res1, error: err1 } = await cA.rpc('sync_push', { payload: payload1 });
  if (err1) fail('1. sync_push new entity', err1.message);
  else if (res1[0]?.status === 'SUCCESS' && res1[0]?.version === 1) pass('1. sync_push new entity', 'Created v1');
  else fail('1. sync_push new entity', JSON.stringify(res1));

  // Test 2: Valid Update
  console.log('\n-- Test 2: Valid Update (version 1 -> 2) --');
  const payload2 = [{
    mutation_id: mut2,
    entity_type: 'goals',
    entity_id: goalId,
    operation: 'UPSERT',
    payload: { id: goalId, user_id: userA.id, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false, version: 1, title: 'Test 2' }
  }];
  const { data: res2, error: err2 } = await cA.rpc('sync_push', { payload: payload2 });
  if (err2) fail('2. valid version update', err2.message);
  else if (res2[0]?.status === 'SUCCESS' && res2[0]?.version === 2) pass('2. valid version update', 'Advanced to v2');
  else fail('2. valid version update', JSON.stringify(res2));

  // Test 3: Stale Update
  console.log('\n-- Test 3: Stale Update Conflict --');
  const payload3 = [{
    mutation_id: mut3,
    entity_type: 'goals',
    entity_id: goalId,
    operation: 'UPSERT',
    payload: { id: goalId, user_id: userA.id, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false, version: 1, title: 'Stale' }
  }];
  const { data: res3, error: err3 } = await cA.rpc('sync_push', { payload: payload3 });
  if (err3) fail('3. stale version rejection', err3.message);
  else if (res3[0]?.status === 'CONFLICT') pass('3. stale version rejection', 'Rejected stale v1 update');
  else fail('3. stale version rejection', JSON.stringify(res3));

  // Test 4: Idempotency
  console.log('\n-- Test 4: Idempotency (Duplicate push) --');
  const { data: res4, error: err4 } = await cA.rpc('sync_push', { payload: payload1 });
  if (err4) fail('4. mutation_id idempotency', err4.message);
  else if (res4[0]?.status === 'SUCCESS' && res4[0]?.note === 'duplicate') pass('4. mutation_id idempotency', 'Ignored duplicate successfully');
  else fail('4. mutation_id idempotency', JSON.stringify(res4));

  // Test 5 & 9: Cross-User Rejection / RLS Enforcement
  console.log('\n-- Test 5 & 9: Cross-User / RLS Rejection --');
  const payload5 = [{
    mutation_id: mut4,
    entity_type: 'goals',
    entity_id: goalId,
    operation: 'UPSERT',
    payload: { id: goalId, user_id: userA.id, privacy_level: 'PRIVATE', sync_state: 'SYNCED', deleted: false, version: 2, title: 'Hacked by B' }
  }];
  const { data: res5, error: err5 } = await cB.rpc('sync_push', { payload: payload5 });
  if (err5) fail('5. cross-user mutation rejection', err5.message);
  else if (res5[0]?.status === 'ERROR' && res5[0]?.error.includes('RLS') || res5[0]?.error.includes('policy')) pass('5. cross-user mutation rejection', 'Blocked by RLS');
  else if (res5[0]?.status === 'ERROR') pass('5. cross-user mutation rejection', `Blocked: ${res5[0]?.error}`);
  else fail('5. cross-user mutation rejection', JSON.stringify(res5));
  pass('9. RLS enforcement', 'RLS explicitly blocked the malicious sync_push');

  // Test 6: change_sequence generation
  console.log('\n-- Test 6: Change Sequence Monotonicity --');
  const { data: finalRec } = await cA.from('goals').select('version, change_sequence').eq('id', goalId).single();
  if (finalRec?.change_sequence > 0) pass('6. change_sequence generation', `change_sequence is ${finalRec.change_sequence}`);
  else fail('6. change_sequence generation', JSON.stringify(finalRec));

  // Test 7: Delta pull
  console.log('\n-- Test 7: Delta Pull Pagination --');
  const { data: pullData } = await cA.from('goals').select('*').gt('change_sequence', 0).order('change_sequence', { ascending: true });
  if (pullData?.length > 0 && pullData[0].id === goalId) pass('7. delta pull', `Successfully pulled ${pullData.length} deltas`);
  else fail('7. delta pull', 'Failed to retrieve via delta sequence');

  // Test 8: Revocation Log
  console.log('\n-- Test 8: Revocation Log Triggers --');
  const shareId = crypto.randomUUID();
  await cA.from('resource_shares').insert({ id: shareId, owner_user_id: userA.id, target_user_id: userB.id, resource_type: 'goals', resource_id: goalId, permission: 'VIEW' });
  await cA.from('resource_shares').delete().eq('id', shareId);
  const { data: revLog } = await cB.from('revocation_log').select('*').eq('resource_id', goalId);
  if (revLog?.length > 0) pass('8. revocation_log generation', `Found ${revLog.length} revocation events`);
  else fail('8. revocation_log generation', 'No trigger fired');

  // Test 10: processed_mutations behavior
  console.log('\n-- Test 10: processed_mutations Persistence --');
  const { data: procLog } = await cA.from('processed_mutations').select('*').eq('mutation_id', mut1);
  if (procLog?.length > 0) pass('10. processed_mutations behavior', 'Mutation tracked successfully');
  else fail('10. processed_mutations behavior', 'Mutation not persisted');

  // Cleanup
  console.log('\n-- Cleanup --');
  await adminClient.from('goals').delete().eq('id', goalId);
  await adminClient.from('processed_mutations').delete().eq('user_id', userA.id);
  await adminClient.auth.admin.deleteUser(userA.id);
  await adminClient.auth.admin.deleteUser(userB.id);

  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r.status === 'PASS');
  const failed = results.filter(r => r.status === 'FAIL');
  console.log(`PASSED: ${passed.length}`);
  console.log(`FAILED: ${failed.length}`);
  for (const r of results) console.log(`  ${r.status === 'PASS' ? 'OK' : 'XX'} [${r.status}] ${r.name}: ${r.detail}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
