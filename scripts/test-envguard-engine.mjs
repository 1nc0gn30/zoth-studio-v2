import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

import {
  ENVGUARD_VERSION,
  MCP_TOOLS,
  PBKDF2_DEFAULT_ITERATIONS,
  PBKDF2_MIN_ITERATIONS,
  PBKDF2_MAX_ITERATIONS,
  SAMPLE_PRESETS,
  auditRotation,
  diffEnvironments,
  executeRotation,
  generateEnvExample,
  maskEnvContent,
  scanSecrets,
  shamirCombine,
  shamirSplit,
  validateKdfIterations,
  vaultDecrypt,
  vaultEncrypt,
} from '../src/utils/envguardEngine.js';

const ENVGUARD_SRC = path.join(os.homedir(), 'NullAITech', 'envguard-secrets-vault', 'src');

test('version and 11 real MCP tools match canonical backend', () => {
  assert.equal(ENVGUARD_VERSION, '2.6.0');
  assert.equal(PBKDF2_DEFAULT_ITERATIONS, 600_000);
  assert.equal(MCP_TOOLS.length, 11);
  assert.ok(MCP_TOOLS.some((t) => t.name === 'env_scan_secrets'));
  assert.ok(MCP_TOOLS.some((t) => t.name === 'env_shamir_split'));
  assert.ok(MCP_TOOLS.some((t) => t.name === 'env_rotate_secrets'));
});

test('scanner flags OpenAI, GitHub PAT, Resend, Stripe, AWS, DB URI without UUID false positives', () => {
  const leakRes = scanSecrets(SAMPLE_PRESETS['nextjs-leak']);
  assert.equal(leakRes.passed, false);
  assert.ok(leakRes.metrics.critical_count >= 5, `expected >= 5 criticals, got ${leakRes.metrics.critical_count}`);
  const keysFlagged = new Set(leakRes.findings.map((f) => f.key));
  assert.ok(keysFlagged.has('OPENAI_API_KEY'));
  assert.ok(keysFlagged.has('GITHUB_PERSONAL_ACCESS_TOKEN'));
  assert.ok(keysFlagged.has('RESEND_API_KEY'));
  assert.ok(keysFlagged.has('NEXT_PUBLIC_STRIPE_SECRET_KEY'));
  assert.ok(!keysFlagged.has('SESSION_UUID'), 'UUID must not false-positive');
  assert.ok(!keysFlagged.has('APP_DOMAIN'), '2-dot domain must not false-positive');

  const cleanRes = scanSecrets(SAMPLE_PRESETS['clean-config']);
  assert.equal(cleanRes.passed, true);
  assert.equal(cleanRes.score, 100);
  assert.equal(cleanRes.total_findings, 0);
});

test('PBKDF2 bounds enforcement rejects low, high, and non-integer counts', () => {
  assert.equal(validateKdfIterations(PBKDF2_MIN_ITERATIONS), 100_000);
  assert.equal(validateKdfIterations(PBKDF2_MAX_ITERATIONS), 2_000_000);
  assert.throws(() => validateKdfIterations(50_000));
  assert.throws(() => validateKdfIterations(2_500_000));
  assert.throws(() => validateKdfIterations('not-a-number'));
  assert.throws(() => validateKdfIterations(true));
});

test('AES-256-CTR-HMAC-SHA256 roundtrip (JSON & armor) + tamper detection', async () => {
  const payload = 'APP_ENV=production\n' + 'BLOCK_LINE=0123456789abcdef\n'.repeat(12);
  const pass = 'CrossPlatformTestPass#2026!';
  const enc = await vaultEncrypt(payload, pass, { iterations: 100_000 });

  const decJson = await vaultDecrypt(enc.json_string, pass);
  assert.equal(decJson.decrypted_content, payload);

  const decArmor = await vaultDecrypt(enc.vault_armor, pass);
  assert.equal(decArmor.decrypted_content, payload);

  await assert.rejects(() => vaultDecrypt(enc.json_string, 'wrong-password'), /Authentication failed/);
});

test('exact byte-for-byte cross-platform crypto interop between JS WebCrypto and Python mcp_server', async () => {
  // Multi-block payload (> 16 bytes) specifically tests 128-bit CTR counter increment parity!
  const multiBlock = Array.from({ length: 10 }, (_, i) => `SECRET_KEY_${i}=value_block_${i}_abcdefghijklmnop`).join('\n') + '\n';
  const pass = 'InteropMasterPass!2026';

  // 1. Encrypt in JS -> Decrypt in Python
  const jsEnc = await vaultEncrypt(multiBlock, pass, { iterations: 100_000 });
  const pyDecJson = execFileSync(
    'python3',
    [
      '-c',
      'import sys, json; from envguard_secrets_vault.mcp_server import vault_decrypt; d = json.loads(sys.stdin.read()); print(vault_decrypt(d["payload"], d["pwd"])["decrypted_content"], end="")',
    ],
    {
      env: { ...process.env, PYTHONPATH: ENVGUARD_SRC },
      input: JSON.stringify({ payload: jsEnc.json_string, pwd: pass }),
      encoding: 'utf-8',
    }
  );
  assert.equal(pyDecJson, multiBlock, 'Python must decrypt JS JSON envelope identically');

  const pyDecArmor = execFileSync(
    'python3',
    [
      '-c',
      'import sys, json; from envguard_secrets_vault.mcp_server import vault_decrypt; d = json.loads(sys.stdin.read()); print(vault_decrypt(d["payload"], d["pwd"])["decrypted_content"], end="")',
    ],
    {
      env: { ...process.env, PYTHONPATH: ENVGUARD_SRC },
      input: JSON.stringify({ payload: jsEnc.vault_armor, pwd: pass }),
      encoding: 'utf-8',
    }
  );
  assert.equal(pyDecArmor, multiBlock, 'Python must decrypt JS armored envelope identically');

  // 2. Encrypt in Python -> Decrypt in JS
  const pyArmor = execFileSync(
    'python3',
    [
      '-c',
      'import sys, json; from envguard_secrets_vault.mcp_server import vault_encrypt; d = json.loads(sys.stdin.read()); print(vault_encrypt(d["plain"], d["pwd"], iterations=100000)["vault_armor"], end="")',
    ],
    {
      env: { ...process.env, PYTHONPATH: ENVGUARD_SRC },
      input: JSON.stringify({ plain: multiBlock, pwd: pass }),
      encoding: 'utf-8',
    }
  );
  const jsDecFromPy = await vaultDecrypt(pyArmor, pass);
  assert.equal(jsDecFromPy.decrypted_content, multiBlock, 'JS must decrypt Python armored envelope identically');
});

test('Shamir GF(256) split, combine, tamper rejection, and Python interop', async () => {
  const secret = 'MASTER_VAULT_SIGNING_KEY_2026_SOVEREIGN!';
  const split = await shamirSplit(secret, 3, 5, 'test-quorum');
  assert.equal(split.shares.length, 5);

  const rec = await shamirCombine([split.armored_shares[0], split.armored_shares[2], split.armored_shares[4]]);
  assert.equal(rec.secret_text, secret);

  // Tamper one share byte -> must reject with checksum mismatch
  const tampered = structuredClone(split.shares[1]);
  const bytes = Buffer.from(tampered.data_b64, 'base64');
  bytes[0] ^= 0xff;
  tampered.data_b64 = bytes.toString('base64');
  await assert.rejects(() => shamirCombine([split.shares[0], tampered, split.shares[2]]), /Share checksum mismatch/);

  // Cross-interop: JS shares reconstructed by Python shamir_quorum
  const pySecret = execFileSync(
    'python3',
    [
      '-c',
      'import sys, json; from envguard_secrets_vault.shamir_quorum import combine_shares_to_secret; shares = json.loads(sys.stdin.read()); print(combine_shares_to_secret(shares)["secret_text"], end="")',
    ],
    {
      env: { ...process.env, PYTHONPATH: ENVGUARD_SRC },
      input: JSON.stringify(split.armored_shares.slice(1, 4)),
      encoding: 'utf-8',
    }
  );
  assert.equal(pySecret, secret);
});

test('masker, .env.example generator, diff, and rotation sentinel work deterministically', () => {
  const synthKey = ['sk', 'proj', '000011112222333344445555'].join('-');
  const masked = maskEnvContent(`PORT=8088\nOPENAI_API_KEY=${synthKey}\n`, 'partial');
  assert.ok(masked.masked_content.includes('PORT=8088'));
  assert.ok(masked.masked_content.includes('****'));

  const ex = generateEnvExample(`PORT=8088\nOPENAI_API_KEY=${synthKey}\n`);
  assert.ok(ex.example_content.includes('OPENAI_API_KEY="your-openai-api-key-here"'));

  const diff = diffEnvironments('PORT=3000\nDEBUG=true\n', 'PORT=8088\nNODE_ENV=production\n');
  assert.deepEqual(diff.keys_only_in_a, ['DEBUG']);
  assert.deepEqual(diff.keys_only_in_b, ['NODE_ENV']);

  const rotAudit = auditRotation(SAMPLE_PRESETS['rotation-demo'], new Date('2026-11-26T00:00:00Z'));
  assert.ok(rotAudit.expired_count >= 1);
  const rotExec = executeRotation(SAMPLE_PRESETS['rotation-demo'], 60);
  assert.ok(rotExec.rotated_count >= 1);
  assert.ok(rotExec.updated_content.includes('@rotation_days: 60'));
});
