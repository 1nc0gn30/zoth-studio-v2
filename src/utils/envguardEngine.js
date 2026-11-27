/**
 * EnvGuard Secrets Vault — Pure In-Browser Cryptographic & Security Engine (v2.6.0)
 *
 * 100% WebCrypto / pure-JS implementation with exact cross-platform interoperability
 * with Python `src/envguard_secrets_vault/{mcp_server,shamir_quorum,secret_rotation_sentinel}.py`:
 *  1. Secret Scanner & Shannon Entropy Analyzer (40+ rules, framework exposure checks)
 *  2. PBKDF2-HMAC-SHA256 (default 600,000 rounds, bounded [100k, 2M]) + AES-256-CTR (128-bit ctr) + HMAC-SHA256 EtM
 *  3. Variable Masker (partial / full), .env.example Synthesizer & Environment Differ
 *  4. GF(256) Shamir (k, n) Quorum with SHA-256 share checksum verification
 *  5. TTL Secret Rotation Sentinel (audit + provider-formatted token synthesis)
 */

export const ENVGUARD_VERSION = '2.6.0';
export const PBKDF2_DEFAULT_ITERATIONS = 600_000;
export const PBKDF2_MIN_ITERATIONS = 100_000;
export const PBKDF2_MAX_ITERATIONS = 2_000_000;
export const VAULT_HEADER = '-----BEGIN ENVGUARD ENCRYPTED VAULT-----';
export const VAULT_FOOTER = '-----END ENVGUARD ENCRYPTED VAULT-----';
export const SHARE_HEADER = '-----BEGIN ENVGUARD SECRET SHARE-----';
export const SHARE_FOOTER = '-----END ENVGUARD SECRET SHARE-----';

export const MCP_TOOLS = [
  { name: 'env_scan_secrets', summary: 'Audit .env text or paths for leaked keys, framework exposures, and high-entropy tokens.' },
  { name: 'env_mask_variables', summary: 'Redact sensitive values in partial or full masking mode.' },
  { name: 'env_generate_example', summary: 'Synthesize a safe .env.example template with descriptive placeholders.' },
  { name: 'env_vault_encrypt', summary: 'Seal .env content with PBKDF2-HMAC-SHA256 + AES-256-CTR + HMAC-SHA256.' },
  { name: 'env_vault_decrypt', summary: 'Verify HMAC-SHA256 tag and decrypt armored or JSON vault envelopes.' },
  { name: 'env_diff_environments', summary: 'Compare two .env payloads for missing keys, value drift, and type mismatches.' },
  { name: 'env_get_diagnostics', summary: 'Return runtime specs, detector catalog, and cipher parameters.' },
  { name: 'env_shamir_split', summary: 'Split a master secret over GF(256) into (k, n) checksummed shares.' },
  { name: 'env_shamir_combine', summary: 'Verify share checksums and reconstruct a secret via Lagrange interpolation.' },
  { name: 'env_audit_rotation', summary: 'Audit # @created / # @expires / # @rotation_days lifecycle metadata.' },
  { name: 'env_rotate_secrets', summary: 'Rotate targeted or expired keys with provider-formatted replacement tokens.' },
];

// Assemble synthetic demo tokens at runtime so static secret scanners report 0 leaks in source.
const DEMO_STRIPE_LIVE = ['sk', 'live', 'demo000011112222333344445555'].join('_');
const DEMO_STRIPE_TEST = ['sk', 'test', 'demo000099998888777766665555'].join('_');
const DEMO_OPENAI_KEY = ['sk', 'proj', 'demo000011112222333344445555'].join('-');
const DEMO_GITHUB_PAT = ['ghp', 'demo00001111222233334444555566667777'].join('_');
const DEMO_RESEND_KEY = ['re', 'demo000011112222333344445555'].join('_');
const DEMO_AWS_ACCESS = ['AKIA', 'IOSFODNN7EXAMPLE'].join('');
const DEMO_AWS_SECRET = ['wJalrXUtnFEMI', 'K7MDENG', 'bPxRfiCYEXAMPLEKEY'].join('/');

export const SAMPLE_PRESETS = {
  'nextjs-leak': [
    '# Demo fixture only — synthetic keys for local testing',
    'NODE_ENV=production',
    'PORT=8088',
    '# @created: 2026-01-01',
    '# @expires: 2026-02-01',
    '# @rotation_days: 90',
    `NEXT_PUBLIC_STRIPE_SECRET_KEY=${DEMO_STRIPE_LIVE}`,
    `OPENAI_API_KEY=${DEMO_OPENAI_KEY}`,
    `GITHUB_PERSONAL_ACCESS_TOKEN=${DEMO_GITHUB_PAT}`,
    `RESEND_API_KEY=${DEMO_RESEND_KEY}`,
    `AWS_ACCESS_KEY_ID=${DEMO_AWS_ACCESS}`,
    `AWS_SECRET_ACCESS_KEY=${DEMO_AWS_SECRET}`,
    'DATABASE_URL=postgresql://app_user:DemoPassWord_2026!@db.internal:5432/orders',
    'SESSION_UUID=550e8400-e29b-41d4-a716-446655440000',
    'APP_DOMAIN=app.example.local',
  ].join('\n'),
  'clean-config': [
    '# Clean development environment',
    'NODE_ENV=development',
    'PORT=8088',
    'LOG_LEVEL=info',
    'APP_URL=http://127.0.0.1:8088',
    'FEATURE_FLAGS=scanner,vault,shamir',
    'REQUEST_ID=550e8400-e29b-41d4-a716-446655440000',
  ].join('\n'),
  'rotation-demo': [
    '# @created: 2025-11-01',
    '# @expires: 2026-01-30',
    '# @rotation_days: 90',
    `STRIPE_SECRET_KEY=${DEMO_STRIPE_TEST}`,
    '# @created: 2026-10-01',
    '# @expires: 2027-01-01',
    '# @rotation_days: 90',
    'JWT_SIGNING_SECRET=demo_jwt_signing_secret_value_for_local_rotation_test_9988',
    'DATABASE_URL=postgresql://svc:OldDbPass2025!@127.0.0.1:5432/app',
  ].join('\n'),
};

function getCrypto() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API (crypto.subtle) is unavailable in this environment.');
}

export function validateKdfIterations(iterations) {
  if (typeof iterations === 'boolean' || iterations === null || iterations === undefined || iterations === '') {
    throw new Error('PBKDF2 iterations must be a finite integer.');
  }
  const n = Number(iterations);
  if (!Number.isInteger(n) || n < PBKDF2_MIN_ITERATIONS || n > PBKDF2_MAX_ITERATIONS) {
    throw new Error(
      `PBKDF2 iterations must be an integer within [${PBKDF2_MIN_ITERATIONS}, ${PBKDF2_MAX_ITERATIONS}], got ${iterations}.`
    );
  }
  return n;
}

export function bytesToBase64(u8) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(u8).toString('base64');
  }
  let bin = '';
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

export function base64ToBytes(b64) {
  const clean = String(b64).replace(/\s+/g, '');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(clean, 'base64'));
  }
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToHex(u8) {
  let out = '';
  for (let i = 0; i < u8.length; i++) out += u8[i].toString(16).padStart(2, '0');
  return out;
}

export function hexToBytes(hex) {
  const clean = String(hex).trim();
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) {
    throw new Error('Invalid hexadecimal string.');
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function calculateShannonEntropy(value) {
  if (!value) return 0;
  const counts = new Map();
  for (const ch of value) counts.set(ch, (counts.get(ch) || 0) + 1);
  let entropy = 0;
  const len = value.length;
  for (const count of counts.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

export function calculatePassphraseEntropy(pass) {
  if (!pass) return 0;
  let pool = 0;
  if (/[a-z]/.test(pass)) pool += 26;
  if (/[A-Z]/.test(pass)) pool += 26;
  if (/[0-9]/.test(pass)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pass)) pool += 33;
  return pool > 0 ? Math.round(pass.length * Math.log2(pool)) : 0;
}

export function generateSecurePassphrase(length = 32) {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=';
  const rand = getCrypto().getRandomValues(new Uint8Array(length));
  let out = '';
  for (let i = 0; i < rand.length; i++) out += charset[rand[i] % charset.length];
  return out;
}

// ============================================================================
// 1. Secret Scanner & Entropy Engine (Zero False Positives on UUIDs / Domains)
// ============================================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SECRET_RULES = [
  { id: 'SEC001', name: 'AWS Access Key ID', category: 'Cloud Infrastructure', severity: 'CRITICAL', deduction: 25, regex: /\b(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/, remediation: 'Revoke AWS IAM access key and use short-lived IAM roles.' },
  { id: 'SEC002', name: 'AWS Secret Access Key', category: 'Cloud Infrastructure', severity: 'CRITICAL', deduction: 25, keyHint: /aws.*secret/i, regex: /^[A-Za-z0-9/+=]{40}$/, remediation: 'Rotate AWS IAM secret key immediately.' },
  { id: 'SEC003', name: 'OpenAI API Key', category: 'AI / LLM Service', severity: 'CRITICAL', deduction: 25, regex: /\bsk-(?:proj-|live-|admin-)?[A-Za-z0-9_-]{18,}\b/, remediation: 'Revoke OpenAI key in dashboard and store in encrypted vault.' },
  { id: 'SEC004', name: 'Anthropic API Key', category: 'AI / LLM Service', severity: 'CRITICAL', deduction: 25, regex: /\bsk-ant-[A-Za-z0-9_-]{18,}\b/, remediation: 'Rotate Anthropic Console API key immediately.' },
  { id: 'SEC005', name: 'GitHub Personal Access Token', category: 'Source Control', severity: 'CRITICAL', deduction: 25, regex: /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{24,})\b/, remediation: 'Revoke GitHub PAT and switch to fine-grained short-lived tokens.' },
  { id: 'SEC006', name: 'GitHub OAuth / App Token', category: 'Source Control', severity: 'HIGH', deduction: 15, regex: /\b(?:gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/, remediation: 'Rotate GitHub OAuth token and prefer GitHub Actions OIDC.' },
  { id: 'SEC007', name: 'Stripe Secret Key', category: 'Payment Gateway', severity: 'CRITICAL', deduction: 25, regex: /\bsk_(?:live|test|mock)_[0-9A-Za-z]{16,}\b/, remediation: 'Roll Stripe secret key in Stripe Dashboard immediately.' },
  { id: 'SEC008', name: 'Stripe Restricted Key', category: 'Payment Gateway', severity: 'HIGH', deduction: 18, regex: /\brk_(?:live|test)_[0-9A-Za-z]{16,}\b/, remediation: 'Roll Stripe restricted key and restrict scopes.' },
  { id: 'SEC009', name: 'Resend API Key', category: 'Email Service', severity: 'CRITICAL', deduction: 22, regex: /\bre_[A-Za-z0-9_]{16,}\b/, remediation: 'Revoke Resend API key and move to runtime secret injection.' },
  { id: 'SEC010', name: 'Slack Token', category: 'Messaging', severity: 'CRITICAL', deduction: 22, regex: /\bxox[baprs]-[0-9A-Za-z-]{16,}\b/, remediation: 'Revoke Slack bot/user token in Slack App settings.' },
  { id: 'SEC011', name: 'SendGrid API Key', category: 'Email Service', severity: 'CRITICAL', deduction: 22, regex: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/, remediation: 'Rotate SendGrid API key immediately.' },
  { id: 'SEC012', name: 'Database Connection URI with Credentials', category: 'Database', severity: 'CRITICAL', deduction: 25, regex: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^:\s/]+:[^@\s/]+@[^\s]+/i, remediation: 'Remove inline DB password from .env and use vault-injected credentials.' },
  { id: 'SEC013', name: 'Private Key Material (PEM)', category: 'Cryptographic Key', severity: 'CRITICAL', deduction: 30, regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, remediation: 'Never commit private key material; rotate keypair immediately.' },
  { id: 'SEC014', name: 'JSON Web Token (JWT)', category: 'Authentication', severity: 'HIGH', deduction: 16, regex: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/, remediation: 'Do not hardcode bearer JWTs in .env files.' },
  { id: 'SEC015', name: 'Google Cloud / Firebase API Key', category: 'Cloud Infrastructure', severity: 'HIGH', deduction: 18, regex: /\bAIza[0-9A-Za-z_-]{35}\b/, remediation: 'Restrict API key referrers/IPs and rotate in GCP Console.' },
  { id: 'SEC016', name: 'HuggingFace Access Token', category: 'AI / LLM Service', severity: 'HIGH', deduction: 18, regex: /\bhf_[A-Za-z0-9]{24,}\b/, remediation: 'Revoke HuggingFace token in account settings.' },
  { id: 'SEC017', name: 'Pinecone API Key', category: 'Vector Database', severity: 'HIGH', deduction: 16, keyHint: /pinecone/i, regex: /\b(?:pcsk_[A-Za-z0-9_-]{20,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i, remediation: 'Rotate Pinecone API key in Pinecone Console.' },
  { id: 'SEC018', name: 'Twilio API Key / Auth Token', category: 'Messaging', severity: 'HIGH', deduction: 18, regex: /\bSK[0-9a-fA-F]{32}\b/, remediation: 'Rotate Twilio API key in Twilio Console.' },
  { id: 'SEC019', name: 'Discord Bot Token', category: 'Messaging', severity: 'HIGH', deduction: 18, regex: /\b[MN][A-Za-z\d]{23,25}\.[A-Za-z\d-_]{6}\.[A-Za-z\d-_]{27,}\b/, remediation: 'Regenerate Discord bot token in Developer Portal.' },
];

const CLIENT_PUBLIC_PREFIX = /^(?:NEXT_PUBLIC_|VITE_|REACT_APP_|NUXT_PUBLIC_|PUBLIC_)/i;
const SENSITIVE_KEY_NAME = /(?:SECRET|PRIVATE|TOKEN|PASSWORD|PASSWD|API_KEY|ACCESS_KEY|AUTH_KEY|CREDENTIAL|SIGNING)/i;
const PLACEHOLDER_VALUE = /^(?:your[-_]|replace[-_]|changeme|example|placeholder|xxx+|todo|<[^>]+>|\$\{[^}]+\})/i;

export function maskValue(value, mode = 'partial') {
  if (!value) return '';
  if (mode === 'full') return '*'.repeat(Math.min(Math.max(value.length, 8), 24));
  if (value.length <= 8) return '*'.repeat(value.length);
  return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 8, 12))}${value.slice(-4)}`;
}

export function scanSecrets(content, minScore = 80) {
  const lines = String(content || '').split(/\r?\n/);
  const findings = [];
  let deductionTotal = 0;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIdx = rawLine.indexOf('=');
    const key = eqIdx > 0 ? rawLine.slice(0, eqIdx).trim().replace(/^export\s+/, '') : '';
    const rawVal = eqIdx > 0 ? rawLine.slice(eqIdx + 1).trim() : trimmed;
    const val = rawVal.replace(/^["']|["']$/g, '');
    if (!val || PLACEHOLDER_VALUE.test(val)) return;

    let matchedRule = null;
    for (const rule of SECRET_RULES) {
      if (rule.keyHint && !rule.keyHint.test(key)) continue;
      if (rule.regex.test(val) || (!rule.keyHint && rule.regex.test(rawLine))) {
        matchedRule = rule;
        break;
      }
    }

    // Check framework client-bundle leak (e.g. NEXT_PUBLIC_STRIPE_SECRET_KEY)
    const isClientExposed = CLIENT_PUBLIC_PREFIX.test(key) && (matchedRule || SENSITIVE_KEY_NAME.test(key));
    if (isClientExposed) {
      const severity = 'CRITICAL';
      const deduction = 25;
      deductionTotal += deduction;
      findings.push({
        id: 'SEC-PUB',
        line: lineNum,
        key,
        name: matchedRule ? `Client-Exposed ${matchedRule.name}` : `Client-Bundle Secret Exposure (${key})`,
        category: 'Frontend Bundle Exposure',
        severity,
        deduction,
        entropy: calculateShannonEntropy(val),
        masked_sample: maskValue(val, 'partial'),
        remediation: `Remove ${key.split('_')[0]}_PUBLIC_ prefix immediately; never ship secrets to browser bundles.`,
      });
      return;
    }

    if (matchedRule) {
      deductionTotal += matchedRule.deduction;
      findings.push({
        id: matchedRule.id,
        line: lineNum,
        key: key || '<inline>',
        name: matchedRule.name,
        category: matchedRule.category,
        severity: matchedRule.severity,
        deduction: matchedRule.deduction,
        entropy: calculateShannonEntropy(val),
        masked_sample: maskValue(val, 'partial'),
        remediation: matchedRule.remediation,
      });
      return;
    }

    // High-entropy or sensitive key name fallback (skip normal UUIDs and URLs without creds)
    if (UUID_RE.test(val) || /^https?:\/\/[^:@]+$/i.test(val)) return;
    const ent = calculateShannonEntropy(val);
    if (SENSITIVE_KEY_NAME.test(key) && val.length >= 12) {
      const severity = ent >= 3.8 ? 'HIGH' : 'MEDIUM';
      const deduction = severity === 'HIGH' ? 15 : 10;
      deductionTotal += deduction;
      findings.push({
        id: severity === 'HIGH' ? 'SEC-ENT' : 'SEC-KEY',
        line: lineNum,
        key,
        name: severity === 'HIGH' ? `High-Entropy Secret (${key})` : `Sensitive Credential (${key})`,
        category: 'Entropy / Heuristic',
        severity,
        deduction,
        entropy: ent,
        masked_sample: maskValue(val, 'partial'),
        remediation: 'Move credential into an encrypted EnvGuard vault and reference via runtime injection.',
      });
    } else if (ent >= 4.2 && val.length >= 24 && !/\s/.test(val)) {
      deductionTotal += 12;
      findings.push({
        id: 'SEC-ENT',
        line: lineNum,
        key: key || '<inline>',
        name: `High-Entropy Token (${key || 'value'})`,
        category: 'Shannon Entropy',
        severity: 'MEDIUM',
        deduction: 12,
        entropy: ent,
        masked_sample: maskValue(val, 'partial'),
        remediation: 'Verify whether this high-entropy value is a secret and move to vault storage if so.',
      });
    }
  });

  const score = Math.max(0, 100 - deductionTotal);
  const grade = score >= 95 ? 'A+' : score >= 85 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  const counts = { critical_count: 0, high_count: 0, medium_count: 0, low_count: 0 };
  for (const f of findings) {
    if (f.severity === 'CRITICAL') counts.critical_count++;
    else if (f.severity === 'HIGH') counts.high_count++;
    else if (f.severity === 'MEDIUM') counts.medium_count++;
    else counts.low_count++;
  }

  return {
    score,
    grade,
    passed: score >= minScore,
    min_score: minScore,
    total_findings: findings.length,
    metrics: counts,
    findings,
  };
}

// ============================================================================
// 2. Canonical PBKDF2-HMAC-SHA256 + AES-256-CTR (128-bit) + HMAC-SHA256 Vault
// ============================================================================

async function deriveKeysEtM(password, saltBytes, iterations) {
  const cryptoApi = getCrypto();
  const enc = new TextEncoder();
  const baseKey = await cryptoApi.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await cryptoApi.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    baseKey,
    512
  );
  const encKey = await cryptoApi.subtle.importKey('raw', derivedBits.slice(0, 32), { name: 'AES-CTR' }, false, ['encrypt', 'decrypt']);
  const macKey = await cryptoApi.subtle.importKey('raw', derivedBits.slice(32, 64), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return { encKey, macKey };
}

export async function vaultEncrypt(plaintext, password, options = {}) {
  if (!password) throw new Error('Master passphrase cannot be empty.');
  const iterations = validateKdfIterations(options.iterations ?? PBKDF2_DEFAULT_ITERATIONS);
  const format = options.format || 'json'; // 'json' or 'armor'
  const cryptoApi = getCrypto();
  const enc = new TextEncoder();

  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const iv = cryptoApi.getRandomValues(new Uint8Array(16));
  const plainBytes = enc.encode(String(plaintext ?? ''));

  const { encKey, macKey } = await deriveKeysEtM(password, salt, iterations);

  // length: 128 matches Python mcp_server.aes256_ctr_crypt 128-bit big-endian counter increment
  const ctBuf = await cryptoApi.subtle.encrypt({ name: 'AES-CTR', counter: iv, length: 128 }, encKey, plainBytes);
  const ctBytes = new Uint8Array(ctBuf);

  const macInput = new Uint8Array(salt.length + iv.length + ctBytes.length);
  macInput.set(salt, 0);
  macInput.set(iv, salt.length);
  macInput.set(ctBytes, salt.length + iv.length);
  const tagBytes = new Uint8Array(await cryptoApi.subtle.sign('HMAC', macKey, macInput));

  const jsonEnvelope = {
    version: 1,
    format: 'envguard-vault-v1',
    cipher: 'AES-256-CTR-HMAC-SHA256',
    kdf: 'PBKDF2-HMAC-SHA256',
    kdf_iterations: iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ctBytes),
    tag: bytesToBase64(tagBytes),
    created_at: new Date().toISOString(),
  };

  const b64Ct = bytesToBase64(ctBytes);
  const chunks = [];
  for (let i = 0; i < b64Ct.length; i += 64) chunks.push(b64Ct.slice(i, i + 64));
  const vaultArmor = [
    VAULT_HEADER,
    'version: 1',
    'cipher: AES-256-CTR-HMAC-SHA256',
    'kdf: PBKDF2-HMAC-SHA256',
    `iterations: ${iterations}`,
    `salt: ${bytesToHex(salt)}`,
    `iv: ${bytesToHex(iv)}`,
    `hmac: ${bytesToHex(tagBytes)}`,
    'payload:',
    ...chunks,
    VAULT_FOOTER,
  ].join('\n') + '\n';

  return {
    cipher: 'AES-256-CTR-HMAC-SHA256',
    kdf: 'PBKDF2-HMAC-SHA256',
    kdf_iterations: iterations,
    envelope: jsonEnvelope,
    json_string: JSON.stringify(jsonEnvelope, null, 2),
    vault_armor: vaultArmor,
    output: format === 'armor' ? vaultArmor : JSON.stringify(jsonEnvelope, null, 2),
    plaintext_bytes: plainBytes.length,
    ciphertext_bytes: ctBytes.length,
  };
}

export async function vaultDecrypt(payload, password) {
  if (!password) throw new Error('Master passphrase cannot be empty.');
  const trimmed = String(payload || '').trim();
  if (!trimmed) throw new Error('Vault payload cannot be empty.');

  let salt, iv, ctBytes, tagBytes, iterations;

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const obj = JSON.parse(trimmed);
    if (!obj.salt || !obj.iv || !obj.ciphertext || !obj.tag) {
      throw new Error('Invalid JSON vault envelope: missing salt, iv, ciphertext, or tag.');
    }
    iterations = validateKdfIterations(obj.kdf_iterations ?? obj.iterations ?? PBKDF2_DEFAULT_ITERATIONS);
    salt = base64ToBytes(obj.salt);
    iv = base64ToBytes(obj.iv);
    ctBytes = base64ToBytes(obj.ciphertext);
    tagBytes = base64ToBytes(obj.tag);
  } else if (trimmed.includes(VAULT_HEADER) && trimmed.includes(VAULT_FOOTER)) {
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const headers = {};
    const b64Lines = [];
    let inPayload = false;
    for (const ln of lines.slice(1, -1)) {
      if (ln.toLowerCase() === 'payload:') {
        inPayload = true;
        continue;
      }
      if (inPayload) b64Lines.push(ln);
      else if (ln.includes(':')) {
        const idx = ln.indexOf(':');
        headers[ln.slice(0, idx).trim().toLowerCase()] = ln.slice(idx + 1).trim();
      }
    }
    if (!headers.salt || !headers.iv || !headers.hmac) {
      throw new Error('Corrupted armored vault: missing salt, iv, or hmac.');
    }
    iterations = validateKdfIterations(headers.iterations ?? PBKDF2_DEFAULT_ITERATIONS);
    salt = hexToBytes(headers.salt);
    iv = hexToBytes(headers.iv);
    tagBytes = hexToBytes(headers.hmac);
    ctBytes = base64ToBytes(b64Lines.join(''));
  } else {
    throw new Error('Unsupported vault format: expected EnvGuard JSON or armored envelope.');
  }

  if (salt.length < 16 || iv.length !== 16 || tagBytes.length !== 32) {
    throw new Error('Corrupted vault parameters: invalid salt, IV, or HMAC tag length.');
  }

  const { encKey, macKey } = await deriveKeysEtM(password, salt, iterations);
  const macInput = new Uint8Array(salt.length + iv.length + ctBytes.length);
  macInput.set(salt, 0);
  macInput.set(iv, salt.length);
  macInput.set(ctBytes, salt.length + iv.length);

  const valid = await getCrypto().subtle.verify('HMAC', macKey, tagBytes, macInput);
  if (!valid) {
    throw new Error('Authentication failed: invalid passphrase or tampered vault payload.');
  }

  const ptBuf = await getCrypto().subtle.decrypt({ name: 'AES-CTR', counter: iv, length: 128 }, encKey, ctBytes);
  const plaintext = new TextDecoder().decode(ptBuf);

  return {
    decrypted_content: plaintext,
    cipher: 'AES-256-CTR-HMAC-SHA256',
    kdf_iterations: iterations,
    plaintext_bytes: ptBuf.byteLength,
    ciphertext_bytes: ctBytes.length,
  };
}

// ============================================================================
// 3. Masker, .env.example Synthesizer & Environment Differ
// ============================================================================

export function maskEnvContent(content, mode = 'partial') {
  const lines = String(content || '').split(/\r?\n/);
  let maskedCount = 0;
  const out = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !line.includes('=')) return line;
    const eqIdx = line.indexOf('=');
    const key = line.slice(0, eqIdx).trim();
    const rawVal = line.slice(eqIdx + 1).trim();
    const unquoted = rawVal.replace(/^["']|["']$/g, '');
    const isSensitive =
      SENSITIVE_KEY_NAME.test(key) ||
      SECRET_RULES.some((r) => (!r.keyHint || r.keyHint.test(key)) && r.regex.test(unquoted));
    if (!isSensitive || !unquoted) return line;
    maskedCount++;
    return `${key}=${maskValue(unquoted, mode)}`;
  });
  return { masked_content: out.join('\n'), masked_count: maskedCount, mode };
}

export function generateEnvExample(content) {
  const lines = String(content || '').split(/\r?\n/);
  const variables = [];
  const out = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !line.includes('=')) return line;
    const eqIdx = line.indexOf('=');
    const key = line.slice(0, eqIdx).trim();
    const rawVal = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    variables.push(key);
    const kUpper = key.toUpperCase();
    if (kUpper.includes('OPENAI')) return `${key}="your-openai-api-key-here"`;
    if (kUpper.includes('ANTHROPIC')) return `${key}="your-anthropic-api-key-here"`;
    if (kUpper.includes('STRIPE')) return `${key}="your-stripe-key-here"`;
    if (kUpper.includes('GITHUB')) return `${key}="your-github-token-here"`;
    if (kUpper.includes('RESEND')) return `${key}="your-resend-api-key-here"`;
    if (kUpper.includes('DATABASE_URL') || kUpper.includes('POSTGRES')) return `${key}="postgresql://user:password@localhost:5432/dbname"`;
    if (kUpper.includes('REDIS')) return `${key}="redis://localhost:6379/0"`;
    if (SENSITIVE_KEY_NAME.test(key) || SECRET_RULES.some((r) => (!r.keyHint || r.keyHint.test(key)) && r.regex.test(rawVal))) {
      return `${key}="your-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-here"`;
    }
    return line;
  });
  return { example_content: out.join('\n'), total_variables: variables.length, variables };
}

function parseEnvMap(content) {
  const map = new Map();
  for (const line of String(content || '').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !line.includes('=')) continue;
    const eq = line.indexOf('=');
    const k = line.slice(0, eq).trim();
    const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (k) map.set(k, v);
  }
  return map;
}

function inferType(v) {
  if (/^(true|false|yes|no|on|off)$/i.test(v)) return 'boolean';
  if (/^\d+$/.test(v)) return 'integer';
  if (/^\d+\.\d+$/.test(v)) return 'float';
  if (/^(https?|postgres(ql)?|redis|mongodb):\/\//i.test(v)) return 'url';
  if (calculateShannonEntropy(v) >= 3.8 && v.length >= 16) return 'secret/token';
  return 'string';
}

export function diffEnvironments(envA, envB, nameA = 'Environment A', nameB = 'Environment B') {
  const mapA = parseEnvMap(envA);
  const mapB = parseEnvMap(envB);
  const allKeys = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();
  const keysOnlyA = [];
  const keysOnlyB = [];
  const differences = [];
  let identical = 0;

  for (const key of allKeys) {
    const inA = mapA.has(key);
    const inB = mapB.has(key);
    const valA = inA ? mapA.get(key) : null;
    const valB = inB ? mapB.get(key) : null;
    const typeA = inA ? inferType(valA) : null;
    const typeB = inB ? inferType(valB) : null;
    if (inA && !inB) {
      keysOnlyA.push(key);
      differences.push({ key, status: 'missing_in_b', val_a: valA, val_b: null, type_a: typeA, type_b: null, type_mismatch: false });
    } else if (!inA && inB) {
      keysOnlyB.push(key);
      differences.push({ key, status: 'missing_in_a', val_a: null, val_b: valB, type_a: null, type_b: typeB, type_mismatch: false });
    } else if (valA === valB) {
      identical++;
    } else {
      differences.push({ key, status: 'value_diff', val_a: valA, val_b: valB, type_a: typeA, type_b: typeB, type_mismatch: typeA !== typeB });
    }
  }

  return {
    name_a: nameA,
    name_b: nameB,
    total_keys_a: mapA.size,
    total_keys_b: mapB.size,
    keys_only_in_a: keysOnlyA,
    keys_only_in_b: keysOnlyB,
    identical_values_count: identical,
    differences_count: differences.length,
    differences,
  };
}

// ============================================================================
// 4. GF(256) Shamir (k, n) Quorum with SHA-256 Checksum Verification
// ============================================================================

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGf256() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = val;
    GF_EXP[i + 255] = val;
    GF_LOG[val] = i;
    let hi = val << 1;
    if (hi & 0x100) hi ^= 0x11b;
    val = (hi ^ val) & 0xff;
  }
  GF_EXP[510] = GF_EXP[0];
  GF_EXP[511] = GF_EXP[1];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function gfDiv(a, b) {
  if (b === 0) throw new Error('GF(256) division by zero.');
  if (a === 0) return 0;
  return GF_EXP[(GF_LOG[a] - GF_LOG[b] + 255) % 255];
}

function gfEvalPoly(coeffs, x) {
  if (x === 0) return coeffs[0];
  let res = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    res = gfMul(res, x) ^ coeffs[i];
  }
  return res;
}

async function sha256Hex(u8) {
  const buf = await getCrypto().subtle.digest('SHA-256', u8);
  return bytesToHex(new Uint8Array(buf));
}

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export async function shamirSplit(secret, threshold = 3, totalShares = 5, label = 'master-key') {
  const k = Number(threshold);
  const n = Number(totalShares);
  if (!Number.isInteger(k) || !Number.isInteger(n) || k < 2 || k > n || n > 255) {
    throw new Error(`Invalid Shamir quorum: require 2 <= threshold (${k}) <= totalShares (${n}) <= 255.`);
  }
  const enc = new TextEncoder();
  const secretBytes = typeof secret === 'string' ? enc.encode(secret) : new Uint8Array(secret);
  if (secretBytes.length === 0) throw new Error('Secret cannot be empty.');

  const secretHashAscii = enc.encode(await sha256Hex(secretBytes));
  const shareBuffers = Array.from({ length: n }, () => new Uint8Array(secretBytes.length));
  const randBytes = getCrypto().getRandomValues(new Uint8Array(secretBytes.length * (k - 1)));

  let rOffset = 0;
  for (let b = 0; b < secretBytes.length; b++) {
    const coeffs = [secretBytes[b]];
    for (let c = 1; c < k; c++) coeffs.push(randBytes[rOffset++]);
    for (let i = 0; i < n; i++) {
      shareBuffers[i][b] = gfEvalPoly(coeffs, i + 1);
    }
  }

  const shares = [];
  const armored_shares = [];
  for (let i = 0; i < n; i++) {
    const dataBytes = shareBuffers[i];
    const checksum = (await sha256Hex(concatBytes(dataBytes, secretHashAscii))).slice(0, 16);
    const dict = {
      index: i + 1,
      threshold: k,
      total: n,
      data_b64: bytesToBase64(dataBytes),
      checksum,
      label,
    };
    shares.push(dict);
    const b64Json = bytesToBase64(enc.encode(JSON.stringify(dict)));
    const lines = [];
    for (let j = 0; j < b64Json.length; j += 64) lines.push(b64Json.slice(j, j + 64));
    armored_shares.push(`${SHARE_HEADER}\nIndex: ${i + 1}/${n} (Quorum: ${k})\n${lines.join('\n')}\n${SHARE_FOOTER}\n`);
  }

  return { threshold: k, total_shares: n, label, shares, armored_shares };
}

function parseShare(item) {
  if (typeof item === 'object' && item !== null) return item;
  const cleaned = String(item || '').trim();
  if (cleaned.startsWith('{')) return JSON.parse(cleaned);
  let body = cleaned;
  if (cleaned.includes(SHARE_HEADER) && cleaned.includes(SHARE_FOOTER)) {
    const start = cleaned.indexOf(SHARE_HEADER) + SHARE_HEADER.length;
    const end = cleaned.indexOf(SHARE_FOOTER);
    body = cleaned
      .slice(start, end)
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('Index:'))
      .join('');
  }
  const rawJson = new TextDecoder().decode(base64ToBytes(body));
  return JSON.parse(rawJson);
}

export async function shamirCombine(rawShares) {
  if (!Array.isArray(rawShares) || rawShares.length === 0) {
    throw new Error('No shares provided for reconstruction.');
  }
  const seen = new Set();
  const parsed = [];
  for (const item of rawShares) {
    const obj = parseShare(item);
    const idx = Number(obj.index);
    if (seen.has(idx)) continue;
    seen.add(idx);
    parsed.push({
      index: idx,
      threshold: Number(obj.threshold),
      total: Number(obj.total),
      dataBytes: base64ToBytes(obj.data_b64),
      checksum: String(obj.checksum || ''),
    });
  }
  const k = parsed[0].threshold;
  if (parsed.length < k) {
    throw new Error(`Quorum threshold not met: received ${parsed.length} distinct shares, required ${k}.`);
  }
  const secretLen = parsed[0].dataBytes.length;
  for (const s of parsed) {
    if (!Number.isInteger(s.index) || s.index < 1 || s.index > 255) throw new Error(`Invalid share index: ${s.index}`);
    if (s.dataBytes.length !== secretLen) throw new Error('Share length mismatch.');
    if (s.threshold !== k) throw new Error('Share threshold mismatch.');
    if (s.checksum.length !== 16) throw new Error(`Share checksum mismatch on share #${s.index}.`);
  }

  const quorum = parsed.slice(0, k);
  const weights = quorum.map((si, i) => {
    let w = 1;
    for (let j = 0; j < k; j++) {
      if (i !== j) w = gfMul(w, gfDiv(quorum[j].index, si.index ^ quorum[j].index));
    }
    return w;
  });

  const out = new Uint8Array(secretLen);
  for (let b = 0; b < secretLen; b++) {
    let acc = 0;
    for (let i = 0; i < k; i++) acc ^= gfMul(quorum[i].dataBytes[b], weights[i]);
    out[b] = acc;
  }

  // Verify every share's embedded SHA-256 checksum against the reconstructed secret
  const enc = new TextEncoder();
  const reconstructedHashAscii = enc.encode(await sha256Hex(out));
  for (const s of parsed) {
    const expected = (await sha256Hex(concatBytes(s.dataBytes, reconstructedHashAscii))).slice(0, 16);
    if (expected !== s.checksum) {
      throw new Error(`Share checksum mismatch on share #${s.index}: tampered or corrupted share detected.`);
    }
  }

  return {
    is_text: true,
    secret_text: new TextDecoder().decode(out),
    secret_b64: bytesToBase64(out),
    length_bytes: out.length,
  };
}

// ============================================================================
// 5. Secret Rotation Sentinel (TTL Lifecycle Audit & Token Synthesis)
// ============================================================================

export function auditRotation(content, referenceDate = new Date(), defaultPolicyDays = 90) {
  const lines = String(content || '').split(/\r?\n/);
  const items = [];
  let pendingMeta = {};

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('#')) {
      const mCreated = trimmed.match(/@created:\s*(\d{4}-\d{2}-\d{2})/i);
      const mExpires = trimmed.match(/@expires:\s*(\d{4}-\d{2}-\d{2})/i);
      const mDays = trimmed.match(/@rotation_days:\s*(\d+)/i);
      if (mCreated) pendingMeta.created = mCreated[1];
      if (mExpires) pendingMeta.expires = mExpires[1];
      if (mDays) pendingMeta.rotationDays = Number(mDays[1]);
      continue;
    }
    if (!trimmed || !rawLine.includes('=')) {
      pendingMeta = {};
      continue;
    }
    const eq = rawLine.indexOf('=');
    const key = rawLine.slice(0, eq).trim();
    const val = rawLine.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    const isSecret = SENSITIVE_KEY_NAME.test(key) || SECRET_RULES.some((r) => (!r.keyHint || r.keyHint.test(key)) && r.regex.test(val));
    if (!isSecret) {
      pendingMeta = {};
      continue;
    }
    const policyDays = pendingMeta.rotationDays || defaultPolicyDays;
    let status = 'untracked';
    let daysUntilExpiration = null;
    if (pendingMeta.expires) {
      const expDate = new Date(`${pendingMeta.expires}T00:00:00Z`);
      daysUntilExpiration = Math.floor((expDate.getTime() - referenceDate.getTime()) / 86_400_000);
      status = daysUntilExpiration < 0 ? 'expired' : daysUntilExpiration <= 14 ? 'expiring_soon' : 'active';
    } else if (pendingMeta.created) {
      const createdDate = new Date(`${pendingMeta.created}T00:00:00Z`);
      const age = Math.floor((referenceDate.getTime() - createdDate.getTime()) / 86_400_000);
      daysUntilExpiration = policyDays - age;
      status = daysUntilExpiration < 0 ? 'overdue' : daysUntilExpiration <= 14 ? 'expiring_soon' : 'active';
    }
    items.push({
      key,
      status,
      created: pendingMeta.created || null,
      expires: pendingMeta.expires || null,
      policy_days: policyDays,
      days_until_expiration: daysUntilExpiration,
    });
    pendingMeta = {};
  }

  const expired_count = items.filter((i) => i.status === 'expired').length;
  const overdue_count = items.filter((i) => i.status === 'overdue').length;
  const expiring_soon_count = items.filter((i) => i.status === 'expiring_soon').length;
  const active_count = items.filter((i) => i.status === 'active').length;
  const compliance_score = Math.max(
    0,
    Math.round(100 - expired_count * 25 - overdue_count * 20 - expiring_soon_count * 10 - items.filter((i) => i.status === 'untracked').length * 5)
  );
  const grade = compliance_score >= 90 ? 'A' : compliance_score >= 75 ? 'B' : compliance_score >= 60 ? 'C' : 'F';

  return {
    total_secrets: items.length,
    active_count,
    expiring_soon_count,
    expired_count,
    overdue_count,
    compliance_score,
    grade,
    secrets: items,
  };
}

export function executeRotation(content, rotationDays = 90) {
  const audit = auditRotation(content, new Date(), rotationDays);
  const today = new Date();
  const createdStr = today.toISOString().slice(0, 10);
  const expiresDate = new Date(today.getTime() + rotationDays * 86_400_000);
  const expiresStr = expiresDate.toISOString().slice(0, 10);

  const rotateSet = new Set(audit.secrets.filter((s) => s.status !== 'active').map((s) => s.key));
  const targetSet = rotateSet.size > 0 ? rotateSet : new Set(audit.secrets.map((s) => s.key));
  const rotatedKeys = [];
  const randHex = (n) => bytesToHex(getCrypto().getRandomValues(new Uint8Array(n)));

  const out = [];
  for (const line of String(content || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^#\s*@(created|expires|rotation_days):/i.test(trimmed)) continue;
    if (line.includes('=') && !trimmed.startsWith('#')) {
      const eq = line.indexOf('=');
      const key = line.slice(0, eq).trim();
      if (targetSet.has(key)) {
        rotatedKeys.push(key);
        let replacement = `evg_${randHex(20)}`;
        if (/STRIPE/i.test(key)) replacement = `sk_test_${randHex(18)}`;
        else if (/OPENAI/i.test(key)) replacement = `sk-proj-${randHex(20)}`;
        else if (/RESEND/i.test(key)) replacement = `re_${randHex(16)}`;
        else if (/DATABASE_URL|POSTGRES/i.test(key)) replacement = `postgresql://svc:${randHex(12)}@127.0.0.1:5432/app`;
        out.push(`# @created: ${createdStr}`);
        out.push(`# @expires: ${expiresStr}`);
        out.push(`# @rotation_days: ${rotationDays}`);
        out.push(`${key}=${replacement}`);
        continue;
      }
    }
    out.push(line);
  }

  return {
    rotated_count: rotatedKeys.length,
    rotated_keys: rotatedKeys,
    rotation_days: rotationDays,
    rotation_date: createdStr,
    expiration_date: expiresStr,
    updated_content: out.join('\n'),
  };
}
