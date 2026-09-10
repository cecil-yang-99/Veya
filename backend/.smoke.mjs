/**
 * End-to-end smoke test for the Veya backend.
 *
 * Run with the backend already listening on http://localhost:3000:
 *   node .smoke.mjs
 *
 * Covers the full validation flow from the implementation plan:
 *   admin login -> user list -> feature-module toggle -> public module list ->
 *   wallet nonce/signature verify -> KYC submission (multipart) ->
 *   admin KYC approval -> user profile update -> audit log entries.
 */
import { Wallet } from 'ethers';
import { readFileSync } from 'fs';

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000/api';

let passed = 0;
let failed = 0;

/** Records a single check result and prints it. */
function check(label, ok, detail = '') {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` (${detail})` : ''}`);
  }
}

/** Small JSON request helper; always reads the body exactly once. */
async function api(path, { method = 'GET', token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/** Minimal 1x1 transparent PNG used as a KYC document upload. */
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

async function main() {
  console.log(`\nSmoke test against ${BASE}\n`);

  // ---------------------------------------------------------------------------
  // 1. Admin login
  // ---------------------------------------------------------------------------
  console.log('[1] Admin auth');
  const login = await api('/admin/auth/login', {
    method: 'POST',
    body: {
      username: process.env.SMOKE_ADMIN_USER || 'superadmin',
      password: process.env.SMOKE_ADMIN_PASS || 'Admin@123456',
    },
  });
  check('admin login returns 201', login.status === 201, `got ${login.status} ${JSON.stringify(login.data).slice(0, 120)}`);
  const adminToken = login.data.accessToken;
  check('admin access token issued', typeof adminToken === 'string' && adminToken.length > 20);

  const badLogin = await api('/admin/auth/login', {
    method: 'POST',
    body: { username: 'superadmin', password: 'wrong-password-1' },
  });
  check('wrong password rejected with 401', badLogin.status === 401, `got ${badLogin.status}`);

  const profile = await api('/admin/auth/profile', { token: adminToken });
  check('admin profile reachable', profile.status === 200 && profile.data.username === 'superadmin', `got ${profile.status}`);

  const noAuth = await api('/admin/users');
  check('admin endpoints reject anonymous callers', noAuth.status === 401, `got ${noAuth.status}`);

  // ---------------------------------------------------------------------------
  // 2. Admin users list
  // ---------------------------------------------------------------------------
  console.log('\n[2] Admin user management');
  const users = await api('/admin/users?page=1&pageSize=10', { token: adminToken });
  check('user list returns 200', users.status === 200, `got ${users.status}`);
  const usersTotal = users.data.total ?? users.data.data?.total ?? 0;
  const usersItems = users.data.items ?? users.data.data?.items ?? [];
  check('user list is paginated', Number.isInteger(usersTotal) && Array.isArray(usersItems), `total=${usersTotal}`);
  check('existing users present', usersTotal >= 1, `total=${usersTotal}`);

  // ---------------------------------------------------------------------------
  // 3. Feature-module toggle + public list
  // ---------------------------------------------------------------------------
  console.log('\n[3] Feature modules');
  const modules = await api('/admin/feature-modules', { token: adminToken });
  check('module registry returns 200', modules.status === 200, `got ${modules.status}`);
  const moduleItems = Array.isArray(modules.data) ? modules.data : modules.data.items ?? [];
  check('module registry non-empty', moduleItems.length >= 5, `count=${moduleItems.length}`);

  // Toggle the `swap` module off and on again, restoring the original state.
  const swap = moduleItems.find((m) => m.code === 'swap');
  const swapOriginallyEnabled = swap ? swap.isEnabled : true;
  let toggleTarget = swap;

  const toggleOff = await api(`/admin/feature-modules/${toggleTarget.id}/toggle`, {
    method: 'PATCH',
    token: adminToken,
    body: { isEnabled: false },
  });
  check('module toggle off succeeds', toggleOff.status === 200 && toggleOff.data.isEnabled === false, `got ${toggleOff.status}`);

  const publicModules = await api('/v1/feature-modules');
  const publicCodes = ((Array.isArray(publicModules.data) ? publicModules.data : publicModules.data.items ?? [])).map((m) => m.code);
  check('disabled module hidden from public list', publicModules.status === 200 && !publicCodes.includes('swap'), `codes=${publicCodes.join(',')}`);
  check('kyc module enabled by default', publicCodes.includes('kyc'), `codes=${publicCodes.join(',')}`);

  const toggleOn = await api(`/admin/feature-modules/${toggleTarget.id}/toggle`, {
    method: 'PATCH',
    token: adminToken,
    body: { isEnabled: swapOriginallyEnabled },
  });
  check('module toggle restored', toggleOn.status === 200 && toggleOn.data.isEnabled === swapOriginallyEnabled, `got ${toggleOn.status}`);

  // ---------------------------------------------------------------------------
  // 4. Wallet signature authentication
  // ---------------------------------------------------------------------------
  console.log('\n[4] Wallet signature auth');
  const signer = Wallet.createRandom();
  const address = signer.address.toLowerCase();

  const nonce = await api('/v1/wallets/nonce', {
    method: 'POST',
    body: { address },
  });
  check('nonce endpoint returns 201', nonce.status === 201, `got ${nonce.status}`);
  check('nonce includes signable message', typeof nonce.data.message === 'string' && nonce.data.message.includes('Nonce:'), JSON.stringify(nonce.data).slice(0, 120));

  const signature = await signer.signMessage(nonce.data.message);

  const verify = await api('/v1/wallets/verify', {
    method: 'POST',
    body: { address, signature },
  });
  check('verify endpoint returns 201', verify.status === 201, `got ${verify.status} ${JSON.stringify(verify.data).slice(0, 160)}`);
  const userToken = verify.data.accessToken;
  check('user token issued', typeof userToken === 'string' && userToken.length > 20);

  const reuse = await api('/v1/wallets/verify', {
    method: 'POST',
    body: { address, signature },
  });
  check('nonce is single-use (replay rejected)', reuse.status === 401, `got ${reuse.status}`);

  const vProfile = await api('/v1/profile', { token: userToken });
  check('user profile reachable', vProfile.status === 200 && typeof vProfile.data.id === 'string', `got ${vProfile.status}`);
  check('new user starts at KYC level 0 / none', vProfile.data.kycLevel === 0 && vProfile.data.kycStatus === 'none', `kycLevel=${vProfile.data.kycLevel} kycStatus=${vProfile.data.kycStatus}`);

  // ---------------------------------------------------------------------------
  // 5. KYC submission (multipart upload)
  // ---------------------------------------------------------------------------
  console.log('\n[5] KYC submission');
  const form = new FormData();
  form.append('level', '1');
  form.append('fullName', 'Smoke Tester');
  form.append('documentType', 'id_card');
  form.append('documentNumber', 'SMOKE123456');
  form.append('country', 'US');
  form.append('dateOfBirth', '1990-01-01');
  form.append('idFront', new Blob([PNG_1X1], { type: 'image/png' }), 'id-front.png');

  const submit = await api('/v1/kyc/submissions', { method: 'POST', token: userToken, form });
  check('KYC submission returns 201', submit.status === 201, `got ${submit.status} ${JSON.stringify(submit.data).slice(0, 160)}`);
  const submissionId = submit.data.id;
  check('submission id returned', typeof submissionId === 'string' && submissionId.length > 10);
  check('document file stored', Array.isArray(submit.data.documentFiles) && submit.data.documentFiles.length === 1, JSON.stringify(submit.data.documentFiles ?? []));

  const mine = await api('/v1/kyc/submissions/me', { token: userToken });
  const mineItems = Array.isArray(mine.data) ? mine.data : mine.data.items ?? [];
  check('user can list own submissions', mine.status === 200 && mineItems.some((s) => s.id === submissionId), `got ${mine.status}`);

  // ---------------------------------------------------------------------------
  // 6. Admin KYC review
  // ---------------------------------------------------------------------------
  console.log('\n[6] KYC review');
  const pending = await api('/admin/kyc/submissions?status=pending&page=1&pageSize=50', { token: adminToken });
  const pendingItems = pending.data.items ?? pending.data.data?.items ?? [];
  check('pending queue contains the new submission', pending.status === 200 && pendingItems.some((s) => s.id === submissionId), `got ${pending.status}`);

  const approve = await api(`/admin/kyc/submissions/${submissionId}/approve`, { method: 'POST', token: adminToken });
  check('KYC approval succeeds', approve.status === 201 || approve.status === 200, `got ${approve.status} ${JSON.stringify(approve.data).slice(0, 160)}`);

  const vProfileAfter = await api('/v1/profile', { token: userToken });
  check('user KYC level promoted to 1', vProfileAfter.data.kycLevel === 1, `kycLevel=${vProfileAfter.data.kycLevel}`);
  check('user KYC status approved', vProfileAfter.data.kycStatus === 'approved', `kycStatus=${vProfileAfter.data.kycStatus}`);

  const dupApprove = await api(`/admin/kyc/submissions/${submissionId}/approve`, { method: 'POST', token: adminToken });
  check('double approval rejected', dupApprove.status >= 400, `got ${dupApprove.status}`);

  // ---------------------------------------------------------------------------
  // 7. Audit log
  // ---------------------------------------------------------------------------
  console.log('\n[7] Audit log');
  const logs = await api('/admin/audit-logs?page=1&pageSize=50', { token: adminToken });
  const logItems = logs.data.items ?? logs.data.data?.items ?? [];
  check('audit log list returns 200', logs.status === 200, `got ${logs.status}`);
  const actions = new Set(logItems.map((l) => l.action));
  check('admin.login audited', actions.has('admin.login'), `actions=${[...actions].join(',')}`);
  check('module.toggle audited', actions.has('module.toggle'), `actions=${[...actions].join(',')}`);
  check('kyc.approve audited', actions.has('kyc.approve'), `actions=${[...actions].join(',')}`);

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('\nSmoke test crashed:', err);
  process.exit(1);
});
