/**
 * Zoth Studio v2 — Pure Byzantine Consensus Battle Arena Engine (v2.3.0)
 *
 * Zero-dependency ESM module shared byte-identically between:
 *   - Browser workstation: src/utils/consensusEngine.js
 *   - Hardened loopback API: server/consensus-engine.mjs
 *
 * Capabilities:
 *   1. Exact Byzantine Fault Tolerance (BFT) quorum math: N >= 3f + 1, fMax = floor((N-1)/3), Q = 2f + 1 / supermajority
 *   2. Deterministic multi-agent proposal & unified-diff rubric arbiter (zero Math.random(), zero canned outputs)
 *   3. Genuine FIPS 180-4 SHA-256 digesting, binary SHA-256 Merkle root, and cryptographic receipt verification
 *   4. SSRF-safe local model target allowlist (agy-hermes :18000 & ollama :11434 only)
 *   5. Home-path redaction and formula-neutralized JSON / Markdown / CSV audit exports
 */

export const CONSENSUS_SCHEMA_VERSION = '2.3.0';

export const ALLOWED_LOCAL_PROVIDERS = Object.freeze({
  'agy-hermes': { id: 'agy-hermes', name: 'AGY-Hermes Proxy', host: '127.0.0.1', port: 18000 },
  ollama: { id: 'ollama', name: 'Ollama Local', host: '127.0.0.1', port: 11434 },
});

export const VALIDATOR_ROSTER = Object.freeze([
  {
    id: 'sec-auditor',
    name: 'Security Auditor',
    role: 'AppSec & Zero-Egress Reviewer',
    domain: 'security',
    focus: 'Detects eval/XSS sinks, wildcard 0.0.0.0 binds, secret leaks, and missing Host/Origin checks.',
  },
  {
    id: 'perf-engineer',
    name: 'Performance Engineer',
    role: 'Latency & Query Profiler',
    domain: 'performance',
    focus: 'Flags SELECT * queries, blocking sync I/O, nested O(n^2) loops, and excessive diff churn.',
  },
  {
    id: 'arch-reviewer',
    name: 'Architecture Reviewer',
    role: 'Invariants & Error Handling',
    domain: 'architecture',
    focus: 'Checks try/catch resilience, input validation, structured returns, and TODO/FIXME debt.',
  },
  {
    id: 'compat-verifier',
    name: 'Compatibility Verifier',
    role: 'Diff & Contract Auditor',
    domain: 'compatibility',
    focus: 'Inspects unified diff structure, breaking removals, schema versioning, and test coverage hints.',
  },
  {
    id: 'policy-gatekeeper',
    name: 'Policy Gatekeeper',
    role: 'Sovereign & Open-Access Policy',
    domain: 'policy',
    focus: 'Enforces loopback-only binds, zero paywall/blur gates, and zero host home-path leaks.',
  },
  {
    id: 'crypto-verifier',
    name: 'Cryptographic Verifier',
    role: 'Integrity & Digest Auditor',
    domain: 'crypto',
    focus: 'Audits SHA-256/HMAC usage and rejects MD5, SHA-1, or Math.random() in security flows.',
  },
  {
    id: 'reliability-sre',
    name: 'Reliability SRE',
    role: 'Timeouts & Graceful Fallback',
    domain: 'reliability',
    focus: 'Verifies AbortController/timeout bounds, payload limits, and deterministic fallback behavior.',
  },
]);

export const STARTER_PRESETS = Object.freeze([
  {
    id: 'hardened-loopback-diff',
    label: 'Hardened Loopback Patch (Approve)',
    summary: 'Unified diff adding Host/Origin guard, timeout bounds, SHA-256 sealing, and unit tests.',
    proposal: `diff --git a/server/consensus-route.mjs b/server/consensus-route.mjs
--- a/server/consensus-route.mjs
+++ b/server/consensus-route.mjs
@@ -12,8 +12,22 @@
-const BIND_HOST = '0.0.0.0';
+const BIND_HOST = '127.0.0.1';
+const MAX_BODY_BYTES = 65536;
+const MODEL_TIMEOUT_MS = 12000;
 
 export async function handleConsensusRun(req, res) {
+  if (!isLocalHost(req) || !isLocalRequest(req)) {
+    return send(res, 403, { error: 'Loopback origin required.' });
+  }
+  const ctl = new AbortController();
+  const timer = setTimeout(() => ctl.abort(), MODEL_TIMEOUT_MS);
+  try {
+    const body = await readJsonBodyStrict(req, MAX_BODY_BYTES);
+    const digest = createHash('sha256').update(body.proposal).digest('hex');
+    return send(res, 200, { ok: true, sha256: digest });
+  } catch (err) {
+    return send(res, 400, { error: sanitizeError(err.message) });
+  } finally {
+    clearTimeout(timer);
+  }
 }
+// test: assert.equal(res.status, 403) on untrusted Host header`,
  },
  {
    id: 'unsafe-eval-wildcard-diff',
    label: 'Risky Eval & Wildcard Patch (Reject)',
    summary: 'Introduces eval(), innerHTML, 0.0.0.0 listener, SELECT *, and Math.random() session token.',
    proposal: `diff --git a/src/legacy-handler.js b/src/legacy-handler.js
--- a/src/legacy-handler.js
+++ b/src/legacy-handler.js
@@ -1,5 +1,14 @@
-export function evaluateRule(input) { return parseSafe(input); }
+const LISTEN_HOST = '0.0.0.0';
+export function evaluateRule(input, targetEl) {
+  const token = 'tok_' + Math.random().toString(16).slice(2);
+  const result = eval(input);
+  targetEl.innerHTML = '<div>' + result + '</div>';
+  const rows = db.execSync('SELECT * FROM audit_logs');
+  // TODO: add validation and remove /home/alice/secrets.env reference
+  return { token, result, rows, hash: md5(input) };
+}`,
  },
  {
    id: 'borderline-refactor-diff',
    label: 'Borderline Refactor (Split Quorum)',
    summary: 'Loopback-safe refactor with clean SHA-256 hashing, but leaves blocking I/O and TODO debt.',
    proposal: `diff --git a/src/quorum-sync.js b/src/quorum-sync.js
--- a/src/quorum-sync.js
+++ b/src/quorum-sync.js
@@ -20,6 +20,13 @@
 export function syncQuorumLog(entries) {
+  const host = '127.0.0.1';
+  const raw = fs.readFileSync('./quorum-state.json', 'utf8');
+  // TODO: switch to async streaming parser before large batches
+  const rows = db.query('SELECT * FROM quorum_rounds LIMIT 50');
+  const digest = sha256Hex(raw + host);
+  return { count: entries.length, rows: rows.length, digest };
 }`,
  },
]);

// ============================================================================
// 1. PURE-JS FIPS 180-4 SHA-256 (Browser & Node Byte-Identical)
// ============================================================================

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function utf8ToBytes(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(String(str ?? ''));
  }
  const s = unescape(encodeURIComponent(String(str ?? '')));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Hex(input) {
  const msg = input instanceof Uint8Array ? input : utf8ToBytes(input);
  const bitLen = msg.length * 8;
  const padLen = ((msg.length + 9 + 63) >> 6) << 6;
  const buf = new Uint8Array(padLen);
  buf.set(msg);
  buf[msg.length] = 0x80;
  const view = new DataView(buf.buffer);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  view.setUint32(padLen - 8, hi, false);
  view.setUint32(padLen - 4, lo, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

export async function sha256Async(input) {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle?.digest) {
      const bytes = input instanceof Uint8Array ? input : utf8ToBytes(input);
      const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fall through to identical pure-JS FIPS 180-4 SHA-256
  }
  return sha256Hex(input);
}

export function canonicalizeJson(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalizeJson(v)).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalizeJson(value[k])}`).join(',')}}`;
}

export function computeMerkleRoot(leafHashes) {
  const leaves = Array.isArray(leafHashes) ? leafHashes.map((h) => String(h || '')) : [];
  if (leaves.length === 0) {
    const emptyRoot = sha256Hex('');
    return { root: emptyRoot, levels: [[emptyRoot]], leafCount: 0 };
  }
  const levels = [leaves.slice()];
  let current = leaves.slice();
  while (current.length > 1) {
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = i + 1 < current.length ? current[i + 1] : left;
      next.push(sha256Hex(`${left}:${right}`));
    }
    levels.push(next);
    current = next;
  }
  return { root: current[0], levels, leafCount: leaves.length };
}

// ============================================================================
// 2. SANITIZATION & FORMULA NEUTRALIZATION
// ============================================================================

export function sanitizeConsensusText(value) {
  let out = String(value ?? '');
  out = out.replace(/\/home\/[a-zA-Z0-9._-]+\//g, '~/');
  out = out.replace(/\/Users\/[a-zA-Z0-9._-]+\//g, '~/');
  out = out.replace(/[A-Za-z]:\\Users\\[a-zA-Z0-9._-]+\\/g, '~\\');
  out = out.replace(/\b(sk-[a-zA-Z0-9_-]{16,}|ghp_[a-zA-Z0-9]{16,}|AKIA[0-9A-Z]{16})\b/g, '[REDACTED_TOKEN]');
  return out;
}

export function sanitizeConsensusPayload(value) {
  if (typeof value === 'string') return sanitizeConsensusText(value);
  if (Array.isArray(value)) return value.map((v) => sanitizeConsensusPayload(v));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeConsensusPayload(v);
    }
    return out;
  }
  return value;
}

export function neutralizeCsvCell(value) {
  let s = sanitizeConsensusText(value === null || value === undefined ? '' : String(value));
  s = s.replace(/\r?\n/g, ' ');
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ============================================================================
// 3. REAL BYZANTINE FAULT TOLERANT (BFT) QUORUM MATH
// ============================================================================

export function computeBftBounds(totalNodes, faultyNodes = 0) {
  const n = Math.max(1, Math.min(64, Math.floor(Number(totalNodes) || 0)));
  const f = Math.max(0, Math.min(n, Math.floor(Number(faultyNodes) || 0)));
  const fMax = Math.floor((n - 1) / 3);
  const minNodesForF = 3 * f + 1;
  const byzantineSafe = n >= minNodesForF && f <= fMax;
  const quorumByF = 2 * f + 1;
  const supermajority = Math.floor((2 * n) / 3) + 1;
  const quorumRequired = Math.min(n, Math.max(quorumByF, supermajority));
  const honestNodes = Math.max(0, n - f);

  return {
    totalNodes: n,
    faultyNodes: f,
    honestNodes,
    fMax,
    minNodesForF,
    byzantineSafe,
    quorumByF,
    supermajority,
    quorumRequired,
    formula: `N=${n} >= 3(${f})+1=${minNodesForF} · f_max=${fMax} · Q=${quorumRequired}`,
  };
}

export function tallyByzantineVotes(votes, declaredFaulty = 0) {
  const list = Array.isArray(votes) ? votes : [];
  const counts = { APPROVE: 0, REJECT: 0, ABSTAIN: 0, FAULTY: 0 };
  for (const v of list) {
    const k = String(v?.vote || 'ABSTAIN').toUpperCase();
    if (k in counts) counts[k] += 1;
    else counts.ABSTAIN += 1;
  }

  const effectiveFaulty = Math.max(Math.max(0, Math.floor(Number(declaredFaulty) || 0)), counts.FAULTY);
  const bounds = computeBftBounds(list.length || 1, effectiveFaulty);

  let verdict = 'BYZANTINE_SPLIT';
  let decision = 'NO_QUORUM';
  let safetyIntact = bounds.byzantineSafe;
  let livenessIntact = false;

  if (!bounds.byzantineSafe) {
    verdict = 'FAULT_THRESHOLD_EXCEEDED';
    decision = 'HALTED_UNSAFE';
    safetyIntact = false;
    livenessIntact = false;
  } else if (counts.APPROVE >= bounds.quorumRequired) {
    verdict = 'QUORUM_REACHED';
    decision = 'APPROVE';
    safetyIntact = true;
    livenessIntact = true;
  } else if (counts.REJECT >= bounds.quorumRequired) {
    verdict = 'QUORUM_REACHED';
    decision = 'REJECT';
    safetyIntact = true;
    livenessIntact = true;
  } else {
    verdict = 'BYZANTINE_SPLIT';
    decision = 'NO_QUORUM';
    safetyIntact = true;
    livenessIntact = false;
  }

  const topVoteCount = Math.max(counts.APPROVE, counts.REJECT);
  const agreementPct = list.length > 0 ? Math.round((topVoteCount / list.length) * 100) : 0;

  return {
    counts,
    bounds,
    verdict,
    decision,
    safetyIntact,
    livenessIntact,
    agreementPct,
    summary: !bounds.byzantineSafe
      ? `Safety boundary violated: f=${bounds.faultyNodes} exceeds f_max=${bounds.fMax} for N=${bounds.totalNodes} (requires N >= ${bounds.minNodesForF}).`
      : verdict === 'QUORUM_REACHED'
      ? `${decision} ratified with ${decision === 'APPROVE' ? counts.APPROVE : counts.REJECT}/${bounds.totalNodes} votes (quorum Q=${bounds.quorumRequired}, f=${bounds.faultyNodes} <= ${bounds.fMax}).`
      : `Split vote (${counts.APPROVE} APPROVE / ${counts.REJECT} REJECT / ${counts.ABSTAIN} ABSTAIN / ${counts.FAULTY} FAULTY) — below quorum Q=${bounds.quorumRequired}.`,
  };
}

// ============================================================================
// 4. REAL UNIFIED DIFF & PROPOSAL RUBRIC ANALYZER
// ============================================================================

const RISK_RULES = [
  {
    id: 'SEC-EVAL',
    domain: 'security',
    severity: 'CRITICAL',
    penalty: 45,
    regex: /\b(eval\s*\(|new\s+Function\s*\()/i,
    title: 'Dynamic code execution sink (eval / new Function)',
  },
  {
    id: 'SEC-XSS',
    domain: 'security',
    severity: 'CRITICAL',
    penalty: 38,
    regex: /\b(innerHTML|outerHTML|dangerouslySetInnerHTML|document\.write)\b/i,
    title: 'Unsanitized DOM HTML injection sink',
  },
  {
    id: 'SEC-WILDCARD',
    domain: 'security',
    severity: 'HIGH',
    penalty: 30,
    regex: /0\.0\.0\.0/,
    title: 'Wildcard 0.0.0.0 network bind violates loopback-only invariant',
  },
  {
    id: 'SEC-SECRET',
    domain: 'security',
    severity: 'CRITICAL',
    penalty: 45,
    regex: /(sk-[a-zA-Z0-9_-]{16,}|ghp_[a-zA-Z0-9]{16,}|BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY)/,
    title: 'Plaintext secret or private key material detected',
  },
  {
    id: 'POL-HOMEPATH',
    domain: 'policy',
    severity: 'HIGH',
    penalty: 32,
    regex: /(\/home\/[a-zA-Z0-9._-]+\/|\/Users\/[a-zA-Z0-9._-]+\/)/,
    title: 'Literal host home directory path leak',
  },
  {
    id: 'POL-PAYWALL',
    domain: 'policy',
    severity: 'HIGH',
    penalty: 35,
    regex: /(filter\s*:\s*blur|depay|license[_-]?modal|paywall)/i,
    title: 'Open-access policy violation (paywall / blur lock / DePay)',
  },
  {
    id: 'PERF-SELECT-STAR',
    domain: 'performance',
    severity: 'MEDIUM',
    penalty: 24,
    regex: /\bSELECT\s+\*\s+FROM\b/i,
    title: 'Unbounded SELECT * query without explicit projection',
  },
  {
    id: 'PERF-SYNC-IO',
    domain: 'performance',
    severity: 'MEDIUM',
    penalty: 24,
    regex: /\b(execSync|readFileSync|writeFileSync|spawnSync)\s*\(/,
    title: 'Blocking synchronous I/O call in request/runtime path',
  },
  {
    id: 'ARCH-TODO',
    domain: 'architecture',
    severity: 'MEDIUM',
    penalty: 20,
    regex: /\b(TODO|FIXME|HACK|XXX)\b/,
    title: 'Unresolved TODO/FIXME technical debt marker',
  },
  {
    id: 'CRYPTO-WEAK',
    domain: 'crypto',
    severity: 'HIGH',
    penalty: 34,
    regex: /\b(md5\s*\(|sha1\s*\(|createHash\s*\(\s*['"](?:md5|sha1)['"]\s*\))/i,
    title: 'Deprecated cryptographic hash (MD5 / SHA-1)',
  },
  {
    id: 'CRYPTO-RANDOM',
    domain: 'crypto',
    severity: 'HIGH',
    penalty: 30,
    regex: /Math\.random\s*\(/,
    title: 'Non-cryptographic Math.random() entropy source',
  },
];

const POSITIVE_RULES = [
  { id: 'POS-LOOPBACK', domain: 'security', bonus: 14, regex: /127\.0\.0\.1|isLocalHost|isLocalRequest/, title: 'Explicit 127.0.0.1 loopback / Host-Origin guard' },
  { id: 'POS-TRYCATCH', domain: 'architecture', bonus: 12, regex: /\btry\s*\{[\s\S]*?\bcatch\b/, title: 'Structured try/catch error handling' },
  { id: 'POS-SHA256', domain: 'crypto', bonus: 14, regex: /sha-?256|sha256Hex|crypto\.subtle/i, title: 'Verified SHA-256 cryptographic digesting' },
  { id: 'POS-TIMEOUT', domain: 'reliability', bonus: 12, regex: /AbortController|timeout|MAX_BODY_BYTES|limit/i, title: 'Explicit timeout or payload size boundary' },
  { id: 'POS-TESTS', domain: 'compatibility', bonus: 12, regex: /\b(assert\.|expect\(|test\(|describe\(|pytest)\b/i, title: 'Automated verification or assertion coverage' },
];

export function analyzeProposalDiff(rawText) {
  const text = String(rawText ?? '');
  const lines = text.split(/\r?\n/);
  const files = [];
  const hunks = [];
  let addedLines = 0;
  let removedLines = 0;
  let contextLines = 0;
  let isUnifiedDiff = false;

  const lineBreakdown = [];
  const findings = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNo = idx + 1;
    let kind = 'context';

    if (line.startsWith('diff --git ') || line.startsWith('+++ ')) {
      isUnifiedDiff = true;
      kind = 'header';
      if (line.startsWith('+++ ')) {
        const f = line.replace(/^\+\+\+\s+(?:b\/)?/, '').trim();
        if (f && f !== '/dev/null' && !files.includes(f)) files.push(f);
      }
    } else if (line.startsWith('--- ')) {
      isUnifiedDiff = true;
      kind = 'header';
    } else if (line.startsWith('@@ ')) {
      isUnifiedDiff = true;
      kind = 'hunk';
      hunks.push({ lineNo, header: line.trim() });
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      kind = 'add';
      addedLines += 1;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      kind = 'remove';
      removedLines += 1;
    } else {
      contextLines += 1;
    }

    // Only inspect active / added lines (ignore removed '-' diff lines so fixing a vulnerability is rewarded!)
    const inspectLine = kind !== 'remove' && kind !== 'header';
    const matchedIds = [];
    if (inspectLine) {
      for (const rule of RISK_RULES) {
        if (rule.regex.test(line)) {
          matchedIds.push(rule.id);
          findings.push({
            id: rule.id,
            domain: rule.domain,
            severity: rule.severity,
            penalty: rule.penalty,
            title: rule.title,
            lineNo,
            snippet: sanitizeConsensusText(line.trim().slice(0, 120)),
          });
        }
      }
    }

    lineBreakdown.push({
      lineNo,
      kind,
      text: sanitizeConsensusText(line),
      findingIds: matchedIds,
    });
  }

  // Evaluate positive signals on non-removed text
  const activeText = lineBreakdown
    .filter((l) => l.kind !== 'remove')
    .map((l) => l.text)
    .join('\n');

  const positives = [];
  for (const rule of POSITIVE_RULES) {
    if (rule.regex.test(activeText)) {
      positives.push({
        id: rule.id,
        domain: rule.domain,
        bonus: rule.bonus,
        title: rule.title,
      });
    }
  }

  const totalNonEmpty = lines.filter((l) => l.trim().length > 0).length;
  const churnRatio = totalNonEmpty > 0 ? Number(((addedLines + removedLines) / totalNonEmpty).toFixed(2)) : 0;

  return {
    isUnifiedDiff,
    files,
    hunkCount: hunks.length,
    hunks,
    lineCount: lines.length,
    addedLines,
    removedLines,
    contextLines,
    churnRatio,
    findings,
    positives,
    lineBreakdown: lineBreakdown.slice(0, 200),
  };
}

// ============================================================================
// 5. DETERMINISTIC IN-BROWSER MULTI-AGENT ARBITER & RECEIPT SEALING
// ============================================================================

export function evaluateDeterministicRound({
  proposalText,
  nodeCount = 5,
  faultyCount = 1,
  injectedFaultIds = [],
  timestamp = null,
}) {
  const rawProposal = String(proposalText || '').trim();
  const safeProposal = sanitizeConsensusText(rawProposal);
  const n = Math.max(4, Math.min(VALIDATOR_ROSTER.length, Math.floor(Number(nodeCount) || 5)));
  const declaredFaulty = Math.max(0, Math.min(n, Math.floor(Number(faultyCount) || 0)));
  const roster = VALIDATOR_ROSTER.slice(0, n);
  const diffAnalysis = analyzeProposalDiff(rawProposal);
  const ts = timestamp || new Date().toISOString();

  // Determine which validator IDs are injected as Byzantine faulty
  const faultSet = new Set(Array.isArray(injectedFaultIds) ? injectedFaultIds : []);
  if (faultSet.size < declaredFaulty) {
    for (let i = roster.length - 1; i >= 0 && faultSet.size < declaredFaulty; i--) {
      faultSet.add(roster[i].id);
    }
  }

  const totalFindingsPenalty = diffAnalysis.findings.reduce((acc, f) => acc + f.penalty, 0);
  const hasCritical = diffAnalysis.findings.some((f) => f.severity === 'CRITICAL');

  const votes = roster.map((validator) => {
    if (faultSet.has(validator.id)) {
      return {
        validatorId: validator.id,
        name: validator.name,
        role: validator.role,
        domain: validator.domain,
        source: 'deterministic-bft',
        vote: 'FAULTY',
        score: 0,
        latencyMs: 1,
        criteria: {
          security: 0,
          performance: 0,
          architecture: 0,
          compatibility: 0,
          policy: 0,
        },
        rationale: 'Injected Byzantine fault: equivocating / non-responsive validator excluded from honest quorum.',
        matchedFindings: [],
      };
    }

    const domainFindings = diffAnalysis.findings.filter((f) => f.domain === validator.domain);
    const otherFindings = diffAnalysis.findings.filter((f) => f.domain !== validator.domain);
    const domainPositives = diffAnalysis.positives.filter((p) => p.domain === validator.domain);
    const allPositivesBonus = diffAnalysis.positives.reduce((acc, p) => acc + Math.round(p.bonus * 0.35), 0);

    let score = 78;
    // Direct domain findings carry full weight; cross-domain findings carry calibrated secondary weight
    for (const f of domainFindings) score -= f.penalty;
    for (const f of otherFindings) score -= Math.round(f.penalty * 0.35);
    for (const p of domainPositives) score += p.bonus;
    score += Math.min(12, allPositivesBonus);

    if (safeProposal.length < 24) score -= 28;
    if (validator.domain === 'compatibility' && diffAnalysis.removedLines > diffAnalysis.addedLines * 2 + 4) {
      score -= 16;
    }
    if (validator.domain === 'performance' && diffAnalysis.addedLines > 80) {
      score -= 10;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let vote = 'APPROVE';
    if (domainFindings.some((f) => f.severity === 'CRITICAL') || score < 55) {
      vote = 'REJECT';
    } else if (score < 70 || (hasCritical && score < 78)) {
      vote = 'ABSTAIN';
    } else {
      vote = 'APPROVE';
    }

    const domainScore = (dom) => {
      const pen = diffAnalysis.findings.filter((f) => f.domain === dom).reduce((a, b) => a + b.penalty, 0);
      const bon = diffAnalysis.positives.filter((p) => p.domain === dom).reduce((a, b) => a + b.bonus, 0);
      return Math.max(0, Math.min(100, 80 - pen + bon));
    };

    const rationaleParts = [];
    if (domainFindings.length > 0) {
      rationaleParts.push(
        `Flagged ${domainFindings.length} ${validator.domain} issue(s): ${domainFindings.map((f) => `${f.id} (L${f.lineNo})`).join(', ')}.`
      );
    } else if (otherFindings.length > 0) {
      rationaleParts.push(
        `No direct ${validator.domain} defects, noted ${otherFindings.length} cross-domain risk(s) (${otherFindings.slice(0, 2).map((f) => f.id).join(', ')}).`
      );
    } else {
      rationaleParts.push(`Zero ${validator.domain} regressions across ${diffAnalysis.lineCount} inspected lines.`);
    }
    if (domainPositives.length > 0) {
      rationaleParts.push(`Verified: ${domainPositives.map((p) => p.title).join('; ')}.`);
    }
    if (safeProposal.length < 24) {
      rationaleParts.push('Proposal body too short for high-confidence ratification.');
    }

    return {
      validatorId: validator.id,
      name: validator.name,
      role: validator.role,
      domain: validator.domain,
      source: 'deterministic-bft',
      vote,
      score,
      latencyMs: 1,
      criteria: {
        security: domainScore('security'),
        performance: domainScore('performance'),
        architecture: domainScore('architecture'),
        compatibility: domainScore('compatibility'),
        policy: domainScore('policy'),
      },
      rationale: sanitizeConsensusText(rationaleParts.join(' ')),
      matchedFindings: domainFindings.map((f) => f.id),
    };
  });

  const tally = tallyByzantineVotes(votes, faultSet.size);
  const receipt = buildConsensusReceipt({
    proposalText: safeProposal,
    mode: 'in-browser-deterministic',
    tally,
    votes,
    timestamp: ts,
  });

  return sanitizeConsensusPayload({
    schemaVersion: CONSENSUS_SCHEMA_VERSION,
    mode: 'in-browser-deterministic',
    timestamp: ts,
    proposalPreview: safeProposal.slice(0, 240),
    diffAnalysis: {
      ...diffAnalysis,
      totalFindingsPenalty,
    },
    votes,
    tally,
    receipt,
  });
}

// ============================================================================
// 6. CRYPTOGRAPHIC SHA-256 RECEIPT & MERKLE PROOF
// ============================================================================

export function buildConsensusReceipt({ proposalText, mode, tally, votes, timestamp }) {
  const safeProposal = sanitizeConsensusText(proposalText || '');
  const proposalHash = sha256Hex(safeProposal);
  const sortedVotes = (Array.isArray(votes) ? votes : [])
    .slice()
    .sort((a, b) => String(a.validatorId).localeCompare(String(b.validatorId)));

  const leafEntries = sortedVotes.map((v) => {
    const canonicalVote = canonicalizeJson({
      validatorId: v.validatorId,
      vote: v.vote,
      score: Number(v.score || 0),
      rationale: sanitizeConsensusText(v.rationale || ''),
    });
    return {
      validatorId: v.validatorId,
      vote: v.vote,
      leafHash: sha256Hex(canonicalVote),
    };
  });

  const merkle = computeMerkleRoot(leafEntries.map((l) => l.leafHash));
  const envelope = {
    schemaVersion: CONSENSUS_SCHEMA_VERSION,
    mode: String(mode || 'in-browser-deterministic'),
    proposalHash,
    merkleRoot: merkle.root,
    verdict: tally?.verdict || 'BYZANTINE_SPLIT',
    decision: tally?.decision || 'NO_QUORUM',
    totalNodes: tally?.bounds?.totalNodes || sortedVotes.length,
    faultyNodes: tally?.bounds?.faultyNodes || 0,
    quorumRequired: tally?.bounds?.quorumRequired || 1,
  };
  const receiptHash = sha256Hex(canonicalizeJson(envelope));

  return {
    algorithm: 'SHA-256 (FIPS 180-4) + Binary Merkle Tree',
    timestamp: timestamp || new Date().toISOString(),
    proposalHash,
    merkleRoot: merkle.root,
    merkleDepth: merkle.levels.length,
    leafCount: merkle.leafCount,
    leaves: leafEntries,
    envelope,
    receiptHash,
  };
}

export function verifyConsensusReceipt(receipt, proposalText, votes) {
  const checks = [];
  if (!receipt || typeof receipt !== 'object') {
    return { valid: false, checks: [{ name: 'Receipt structure', ok: false, detail: 'Missing receipt object' }] };
  }

  const expectedProposalHash = sha256Hex(sanitizeConsensusText(proposalText || ''));
  const propOk = /^[0-9a-f]{64}$/.test(receipt.proposalHash || '') && receipt.proposalHash === expectedProposalHash;
  checks.push({
    name: 'Proposal SHA-256 digest',
    ok: propOk,
    detail: propOk ? `Matches ${expectedProposalHash.slice(0, 16)}…` : 'Proposal hash mismatch',
  });

  let leavesOk = Array.isArray(receipt.leaves) && receipt.leaves.length > 0;
  let recomputedLeaves = [];
  if (Array.isArray(votes) && votes.length > 0) {
    const sortedVotes = votes.slice().sort((a, b) => String(a.validatorId).localeCompare(String(b.validatorId)));
    recomputedLeaves = sortedVotes.map((v) =>
      sha256Hex(
        canonicalizeJson({
          validatorId: v.validatorId,
          vote: v.vote,
          score: Number(v.score || 0),
          rationale: sanitizeConsensusText(v.rationale || ''),
        })
      )
    );
    leavesOk =
      recomputedLeaves.length === (receipt.leaves || []).length &&
      recomputedLeaves.every((h, idx) => receipt.leaves[idx]?.leafHash === h);
  } else {
    recomputedLeaves = (receipt.leaves || []).map((l) => l.leafHash);
    leavesOk = recomputedLeaves.every((h) => /^[0-9a-f]{64}$/.test(h || ''));
  }

  checks.push({
    name: 'Per-validator canonical leaf hashes',
    ok: leavesOk,
    detail: leavesOk ? `${recomputedLeaves.length} SHA-256 leaves verified` : 'Leaf hash mismatch',
  });

  const merkle = computeMerkleRoot(recomputedLeaves);
  const merkleOk = /^[0-9a-f]{64}$/.test(receipt.merkleRoot || '') && receipt.merkleRoot === merkle.root;
  checks.push({
    name: 'Binary SHA-256 Merkle root',
    ok: merkleOk,
    detail: merkleOk ? `Matches ${merkle.root.slice(0, 16)}…` : 'Merkle root mismatch',
  });

  const expectedReceiptHash = sha256Hex(canonicalizeJson(receipt.envelope || {}));
  const receiptOk = /^[0-9a-f]{64}$/.test(receipt.receiptHash || '') && receipt.receiptHash === expectedReceiptHash;
  checks.push({
    name: 'Canonical receipt envelope hash',
    ok: receiptOk,
    detail: receiptOk ? `Sealed ${expectedReceiptHash.slice(0, 16)}…` : 'Envelope hash mismatch',
  });

  return {
    valid: checks.every((c) => c.ok),
    checks,
  };
}

// ============================================================================
// 7. SSRF-SAFE LOCAL MODEL TARGET & REQUEST VALIDATION
// ============================================================================

const FORBIDDEN_SSRF_KEYS = ['url', 'host', 'hostname', 'endpoint', 'baseUrl', 'base_url', 'targetUrl', 'proxyUrl'];
const SAFE_MODEL_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/;

export function validateLocalModelTarget(target) {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return { valid: false, error: 'Model target must be an object with { provider, model }.' };
  }
  for (const key of FORBIDDEN_SSRF_KEYS) {
    if (key in target && target[key] !== undefined && target[key] !== null && target[key] !== '') {
      return { valid: false, error: `Arbitrary ${key} fields are blocked (loopback provider allowlist only).` };
    }
  }
  const providerKey = String(target.provider || '').trim().toLowerCase();
  const providerSpec = ALLOWED_LOCAL_PROVIDERS[providerKey];
  if (!providerSpec) {
    return { valid: false, error: 'Provider must be "agy-hermes" (:18000) or "ollama" (:11434).' };
  }
  const model = String(target.model || '').trim();
  if (!model || !SAFE_MODEL_ID_RE.test(model) || /https?:\/\//i.test(model) || model.includes('..')) {
    return { valid: false, error: 'Invalid model identifier (must be a clean local model ID without URLs or shell characters).' };
  }
  return {
    valid: true,
    provider: providerSpec.id,
    host: providerSpec.host,
    port: providerSpec.port,
    model,
  };
}

export function validateConsensusRunRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }
  for (const key of FORBIDDEN_SSRF_KEYS) {
    if (key in body && body[key] !== undefined && body[key] !== null && body[key] !== '') {
      return { valid: false, error: `External target field "${key}" is rejected by loopback SSRF policy.` };
    }
  }
  const proposal = String(body.proposal ?? '').trim();
  if (!proposal) {
    return { valid: false, error: 'Proposal or diff text is required.' };
  }
  if (proposal.length > 48000) {
    return { valid: false, error: 'Proposal exceeds 48,000 character limit.' };
  }

  const mode = String(body.mode || 'in-browser-deterministic').trim().toLowerCase();
  if (mode !== 'in-browser-deterministic' && mode !== 'loopback-models') {
    return { valid: false, error: 'Mode must be "in-browser-deterministic" or "loopback-models".' };
  }

  const nodeCount = Math.max(4, Math.min(7, Math.floor(Number(body.nodeCount ?? 5))));
  const faultyCount = Math.max(0, Math.min(nodeCount, Math.floor(Number(body.faultyCount ?? 1))));

  const validatedModels = [];
  if (mode === 'loopback-models') {
    const rawModels = Array.isArray(body.models) ? body.models : [];
    if (rawModels.length === 0) {
      return { valid: false, error: 'At least 1 local model target is required for loopback-models mode.' };
    }
    if (rawModels.length > 4) {
      return { valid: false, error: 'Maximum of 4 concurrent loopback models per consensus round.' };
    }
    for (const m of rawModels) {
      const check = validateLocalModelTarget(m);
      if (!check.valid) return check;
      validatedModels.push(check);
    }
  }

  return {
    valid: true,
    proposal,
    mode,
    nodeCount,
    faultyCount,
    models: validatedModels,
  };
}

export function parseModelVoteText(rawText) {
  const text = sanitizeConsensusText(rawText || '').trim();
  if (!text) {
    return { vote: 'FAULTY', score: 0, rationale: 'Empty model response.' };
  }
  const firstMatch = text.match(/\b(APPROVE|REJECT|ABSTAIN)\b/i);
  const vote = firstMatch ? firstMatch[1].toUpperCase() : 'ABSTAIN';
  const scoreMatch = text.match(/(?:score|confidence)\s*[:=]\s*(\d{1,3})/i);
  let score = scoreMatch ? Number(scoreMatch[1]) : vote === 'APPROVE' ? 84 : vote === 'REJECT' ? 32 : 55;
  score = Math.max(0, Math.min(100, score));
  const rationale = text.replace(/\s+/g, ' ').slice(0, 260);
  return { vote, score, rationale };
}

// ============================================================================
// 8. SANITIZED AUDIT EXPORTS (JSON, MARKDOWN, FORMULA-NEUTRALIZED CSV)
// ============================================================================

export function buildConsensusJsonExport(roundResult) {
  return JSON.stringify(sanitizeConsensusPayload(roundResult), null, 2);
}

export function buildConsensusMarkdownExport(roundResult) {
  const r = sanitizeConsensusPayload(roundResult || {});
  const bounds = r.tally?.bounds || computeBftBounds(r.votes?.length || 4, 0);
  const lines = [
    '# Byzantine Consensus Battle Arena — Quorum Verdict Receipt',
    '',
    `- **Schema Version**: \`${r.schemaVersion || CONSENSUS_SCHEMA_VERSION}\``,
    `- **Mode**: \`${r.mode || 'in-browser-deterministic'}\``,
    `- **Timestamp**: \`${r.timestamp || ''}\``,
    `- **Verdict**: **${r.tally?.verdict || 'UNKNOWN'}** → **${r.tally?.decision || 'NO_QUORUM'}**`,
    `- **BFT Quorum Bounds**: \`N=${bounds.totalNodes}\`, \`f=${bounds.faultyNodes}\`, \`f_max=${bounds.fMax}\`, \`Q=${bounds.quorumRequired}\` (\`N >= 3f + 1\`: ${bounds.byzantineSafe ? 'SAFE' : 'VIOLATED'})`,
    `- **Proposal SHA-256**: \`${r.receipt?.proposalHash || ''}\``,
    `- **Merkle Root (SHA-256)**: \`${r.receipt?.merkleRoot || ''}\``,
    `- **Receipt Digest**: \`${r.receipt?.receiptHash || ''}\``,
    '',
    '## Validator Vote Matrix',
    '',
    '| Validator | Role | Source | Vote | Score | Rationale |',
    '| :--- | :--- | :--- | :---: | :---: | :--- |',
    ...(r.votes || []).map(
      (v) =>
        `| ${v.name} | ${v.role} | \`${v.source}\` | **${v.vote}** | ${v.score}/100 | ${String(v.rationale || '').replace(/\|/g, '/')} |`
    ),
    '',
    '---',
    '*Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform*',
  ];
  return lines.join('\n');
}

export function buildConsensusCsvExport(roundResult) {
  const r = sanitizeConsensusPayload(roundResult || {});
  const header = ['validator_id', 'name', 'role', 'source', 'vote', 'score', 'latency_ms', 'verdict', 'merkle_root', 'rationale'];
  const rows = (r.votes || []).map((v) =>
    [
      v.validatorId,
      v.name,
      v.role,
      v.source,
      v.vote,
      v.score,
      v.latencyMs ?? 0,
      r.tally?.verdict || '',
      r.receipt?.merkleRoot || '',
      v.rationale || '',
    ]
      .map(neutralizeCsvCell)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}
