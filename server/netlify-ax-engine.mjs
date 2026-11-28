/**
 * Zoth Netlify AX & Serverless Edge Engine (v2.4.0)
 * Pure zero-dependency ESM module mirrored byte-identically between:
 *   - src/utils/netlifyAxEngine.js
 *   - server/netlify-ax-engine.mjs
 *
 * Invariants:
 *   - Zero external dependencies, zero dynamic code execution, zero nondeterministic RNG.
 *   - Deterministic netlify.toml / _redirects / _headers parsing, redirect loop & splat-shadow
 *     detection, Edge & Serverless request router simulation, and 14-point pre-deploy guardrail audit.
 *   - Strict ~/ path redaction, token/secret redaction, CSV formula neutralization,
 *     copy-only safe CLI synthesis (never triggers live remote deploys or reads ~/.config/netlify),
 *     and synchronous FIPS 180-4 SHA-256 verification receipts.
 */

export const NETLIFY_AX_SCHEMA_VERSION = '2.4.0';

export const VALID_REDIRECT_STATUSES = Object.freeze([200, 301, 302, 303, 307, 308, 404, 410, 451]);

export const DEFAULT_SIMULATOR_PATHS = Object.freeze([
  '/api/edge/telemetry',
  '/api/edge/geo',
  '/api/studio/status',
  '/hub/tools',
  '/workstations/netlify-ax',
  '/assets/index.js',
  '/robots.txt',
]);

export const DEFAULT_REPO_NETLIFY_TOML = `# Zoth Studio v2 — Netlify Production Configuration
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--no-audit"

[functions]
  node_bundler = "esbuild"

[images]
  remote_images = ["https://zoth.nullai.tech/.*", "https://*.nullai.tech/.*"]

[[edge_functions]]
  function = "edge-telemetry"
  path = "/api/edge/*"

[[redirects]]
  from = "/api/studio/*"
  to = "/.netlify/functions/studio-api/:splat"
  status = 200

[[redirects]]
  from = "/hub"
  to = "/"
  status = 301

[[redirects]]
  from = "/hub/*"
  to = "/:splat"
  status = 301

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    Content-Security-Policy = "frame-ancestors 'self' https://zoth.nullai.tech https://*.nullai.tech http://127.0.0.1:* http://localhost:*"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(self), microphone=(self), geolocation=()"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "credentialless"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sitemap.xml"
  [headers.values]
    Content-Type = "application/xml; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/robots.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/llms.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/ai.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/api/*"
  [headers.values]
    Content-Type = "application/json; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, OPTIONS"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/.well-known/*"
  [headers.values]
    Content-Type = "application/json; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, OPTIONS"
    Cache-Control = "public, max-age=3600, must-revalidate"
`;

export const BROKEN_DEMO_NETLIFY_TOML = `# Broken Config Demo — Circular Redirects, Splat Shadowing, Missing Headers & Unpinned Node
[build]
  publish = "public"
  command = "echo 'placeholder build'"

[[redirects]]
  from = "/alpha"
  to = "/beta"
  status = 301

[[redirects]]
  from = "/beta"
  to = "/alpha"
  status = 301

[[redirects]]
  from = "/self-loop"
  to = "/self-loop"
  status = 302

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/docs/legacy"
  to = "/docs"
  status = 301

[[redirects]]
  from = "/bad-status"
  to = "/target"
  status = 999

[[headers]]
  for = "/*"
  [headers.values]
    X-Powered-By = "demo"
`;

export const BROKEN_DEMO_REDIRECTS = `/old-blog /new-blog 301
/new-blog /old-blog 301
`;

export const HARDENED_TEMPLATE_NETLIFY_TOML = `# Hardened AEO + COOP/COEP + Zero-Egress Netlify Production Template
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "20.18.0"
  NPM_FLAGS = "--no-audit"

[functions]
  node_bundler = "esbuild"

[[edge_functions]]
  function = "edge-telemetry"
  path = "/api/edge/*"

[[redirects]]
  from = "/api/studio/*"
  to = "/.netlify/functions/studio-api/:splat"
  status = 200

[[redirects]]
  from = "/hub"
  to = "/"
  status = 301

[[redirects]]
  from = "/hub/*"
  to = "/:splat"
  status = 301

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    Content-Security-Policy = "default-src 'self'; frame-ancestors 'self' https://zoth.nullai.tech"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "credentialless"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/robots.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/sitemap.xml"
  [headers.values]
    Content-Type = "application/xml; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/llms.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/ai.txt"
  [headers.values]
    Content-Type = "text/plain; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"

[[headers]]
  for = "/.well-known/*"
  [headers.values]
    Content-Type = "application/json; charset=UTF-8"
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=3600, must-revalidate"
`;

export const HARDENED_TEMPLATE_REDIRECTS = `# Hardened _redirects (ordered specific -> generic; SPA catch-all last)
/api/studio/* /.netlify/functions/studio-api/:splat 200
/hub / 301
/hub/* /:splat 301
/* /index.html 200
`;

export const HARDENED_TEMPLATE_HEADERS = `# Hardened _headers (Security + WebGPU COOP/COEP + AEO Discovery)
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/robots.txt
  Content-Type: text/plain; charset=UTF-8
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600, must-revalidate

/sitemap.xml
  Content-Type: application/xml; charset=UTF-8
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600, must-revalidate

/llms.txt
  Content-Type: text/plain; charset=UTF-8
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600, must-revalidate
`;

export const NETLIFY_AX_PRESETS = Object.freeze([
  Object.freeze({
    id: 'repo-production',
    label: 'Repo Production netlify.toml',
    description: 'Zoth Studio v2 production configuration with Edge telemetry, API proxy, SPA rewrite, COOP/COEP enclave, and AEO CORS headers.',
    toml: DEFAULT_REPO_NETLIFY_TOML,
    redirects: '',
    headers: '',
  }),
  Object.freeze({
    id: 'broken-loop-shadow',
    label: 'Broken Redirect Loop & Shadow Demo',
    description: 'Intentionally misconfigured netlify.toml + _redirects demonstrating circular loops, self-redirects, splat shadowing, unpinned Node, and missing security headers.',
    toml: BROKEN_DEMO_NETLIFY_TOML,
    redirects: BROKEN_DEMO_REDIRECTS,
    headers: '',
  }),
  Object.freeze({
    id: 'hardened-aeo-coop',
    label: 'Hardened AEO / COOP Template',
    description: 'Clean hardened baseline with pinned Node 20.18.0, HSTS, CSP, COOP/COEP, immutable /assets/* caching, and full AEO headers.',
    toml: HARDENED_TEMPLATE_NETLIFY_TOML,
    redirects: '',
    headers: '',
  }),
]);

export const OFFLINE_EDGE_FUNCTIONS = Object.freeze([
  Object.freeze({
    name: 'edge-telemetry',
    file: 'netlify/edge-functions/edge-telemetry.js',
    runtime: 'Deno (Netlify Edge)',
    paths: ['/api/edge/telemetry', '/api/edge/geo'],
    declaredInToml: true,
    sizeBytes: 2046,
    emitsCoopCoep: true,
    description: 'Edge POP geolocation, masked client IP, COOP/COEP enclave verification, and sub-millisecond timestamps.',
  }),
]);

export const OFFLINE_SERVERLESS_FUNCTIONS = Object.freeze([
  Object.freeze({
    name: 'studio-api',
    file: 'netlify/functions/studio-api.js',
    runtime: 'Node.js 20 (esbuild)',
    routePrefix: '/.netlify/functions/studio-api',
    proxiedFrom: '/api/studio/*',
    endpoints: ['/api/studio/status', '/api/studio/memory', '/api/studio/bridge', '/api/studio/zoth-ai', '/api/studio/benchmarks', '/api/studio/netlify-spec'],
    sizeBytes: 10801,
    description: 'Hosted showcase fallback API serving status, sample memory vectors, bridge metadata, and platform spec.',
  }),
]);

// ── Synchronous FIPS 180-4 SHA-256 ──────────────────────────────────────────

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
  const s = String(str ?? '');
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s);
  }
  const bytes = [];
  for (let i = 0; i < s.length; i += 1) {
    let cp = s.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < s.length) {
      const next = s.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        cp = ((cp - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        i += 1;
      }
    }
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    else if (cp < 0x10000) bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    else bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  }
  return new Uint8Array(bytes);
}

export function sha256Hex(input) {
  const bytes = utf8ToBytes(input);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
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
    for (let i = 0; i < 64; i += 1) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
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
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((n) => n.toString(16).padStart(8, '0')).join('');
}

// ── Path & Secret Redaction ─────────────────────────────────────────────────

const SECRET_DETECTORS = Object.freeze([
  Object.freeze({
    id: 'NETLIFY_TOKEN',
    label: 'Netlify Personal Access / Auth Token',
    regex: /\b(?:NETLIFY_AUTH_TOKEN\s*=\s*["']?[A-Za-z0-9._-]{12,}["']?|nfp_[A-Za-z0-9]{20,})\b/g,
  }),
  Object.freeze({
    id: 'GITHUB_TOKEN',
    label: 'GitHub Personal Access Token',
    regex: /\b(?:ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{24,})\b/g,
  }),
  Object.freeze({
    id: 'STRIPE_KEY',
    label: 'Stripe Secret API Key',
    regex: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  }),
  Object.freeze({
    id: 'OPENAI_KEY',
    label: 'OpenAI / Provider Secret Key',
    regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  }),
  Object.freeze({
    id: 'AWS_ACCESS_KEY',
    label: 'AWS Access Key ID',
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
  }),
  Object.freeze({
    id: 'GOOGLE_API_KEY',
    label: 'Google API Key',
    regex: /\bAIza[0-9A-Za-z_-]{30,}\b/g,
  }),
  Object.freeze({
    id: 'PRIVATE_KEY_BLOCK',
    label: 'PEM Private Key Material',
    regex: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/g,
  }),
]);

export function redactNetlifyText(input) {
  let out = String(input ?? '');
  out = out.replace(/\/home\/[A-Za-z0-9._-]+/g, '~');
  out = out.replace(/\/Users\/[A-Za-z0-9._-]+/g, '~');
  out = out.replace(/(NETLIFY_AUTH_TOKEN\s*=\s*["']?)[A-Za-z0-9._-]{6,}(["']?)/g, '$1[REDACTED_TOKEN]$2');
  out = out.replace(/\b(?:nfp_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{16,}|gho_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|sk_(?:live|test)_[A-Za-z0-9]{12,}|sk-(?:proj-)?[A-Za-z0-9_-]{18,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{28,})\b/g, '[REDACTED_TOKEN]');
  out = out.replace(/Bearer\s+[A-Za-z0-9._-]{16,}/gi, 'Bearer [REDACTED_TOKEN]');
  out = out.replace(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]');
  return out;
}

export function redactNetlifyPayload(value) {
  if (typeof value === 'string') return redactNetlifyText(value);
  if (Array.isArray(value)) return value.map((item) => redactNetlifyPayload(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactNetlifyPayload(v);
    }
    return out;
  }
  return value;
}

export function detectSecretPatterns(text) {
  const src = String(text ?? '');
  const lines = src.split(/\r?\n/);
  const findings = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const det of SECRET_DETECTORS) {
      det.regex.lastIndex = 0;
      if (det.regex.test(line)) {
        findings.push({
          id: det.id,
          label: det.label,
          line: i + 1,
          preview: redactNetlifyText(line.trim()).slice(0, 120),
        });
      }
    }
  }
  return findings;
}

// ── Parsers: netlify.toml, _redirects, _headers ─────────────────────────────

function stripTomlComment(line) {
  let inDouble = false;
  let inSingle = false;
  let escaped = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inDouble) {
      escaped = true;
      continue;
    }
    if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '#' && !inDouble && !inSingle) return line.slice(0, i);
  }
  return line;
}

function parseTomlScalar(rawVal, lineNo, errors) {
  const val = rawVal.trim();
  if (!val) {
    errors.push({ line: lineNo, message: 'Missing value after "="' });
    return '';
  }
  if (val.startsWith('"')) {
    if (val.length < 2 || !val.endsWith('"')) {
      errors.push({ line: lineNo, message: 'Unterminated double-quoted string' });
      return val.slice(1);
    }
    return val.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (val.startsWith("'")) {
    if (val.length < 2 || !val.endsWith("'")) {
      errors.push({ line: lineNo, message: 'Unterminated single-quoted string' });
      return val.slice(1);
    }
    return val.slice(1, -1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  if (val.startsWith('[')) {
    if (!val.endsWith(']')) {
      errors.push({ line: lineNo, message: 'Unterminated array literal' });
      return [];
    }
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    const items = [];
    let cur = '';
    let inD = false;
    let inS = false;
    for (let i = 0; i < inner.length; i += 1) {
      const ch = inner[i];
      if (ch === '"' && !inS) inD = !inD;
      else if (ch === "'" && !inD) inS = !inS;
      if (ch === ',' && !inD && !inS) {
        if (cur.trim()) items.push(parseTomlScalar(cur, lineNo, errors));
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) items.push(parseTomlScalar(cur, lineNo, errors));
    return items;
  }
  if (val.startsWith('{') && val.endsWith('}')) {
    const inner = val.slice(1, -1).trim();
    const obj = {};
    if (!inner) return obj;
    for (const part of inner.split(',')) {
      const eq = part.indexOf('=');
      if (eq > 0) {
        const k = part.slice(0, eq).trim().replace(/^["']|["']$/g, '');
        const v = parseTomlScalar(part.slice(eq + 1), lineNo, errors);
        obj[k] = v;
      }
    }
    return obj;
  }
  return val;
}

export function parseNetlifyToml(tomlText) {
  const src = String(tomlText ?? '');
  const lines = src.split(/\r?\n/);
  const errors = [];
  const build = {};
  const buildEnvironment = {};
  const functions = {};
  const images = {};
  const site = {};
  const processing = {};
  const edgeFunctions = [];
  const redirects = [];
  const headers = [];

  let currentSection = null;
  let currentItem = null;

  for (let idx = 0; idx < lines.length; idx += 1) {
    const lineNo = idx + 1;
    const cleaned = stripTomlComment(lines[idx]).trim();
    if (!cleaned) continue;

    if (cleaned.startsWith('[[')) {
      if (!cleaned.endsWith(']]')) {
        errors.push({ line: lineNo, message: `Unclosed array-of-tables header: ${cleaned}` });
        continue;
      }
      const name = cleaned.slice(2, -2).trim();
      currentSection = `[[${name}]]`;
      if (name === 'edge_functions') {
        currentItem = { line: lineNo, function: '', path: '', cache: '' };
        edgeFunctions.push(currentItem);
      } else if (name === 'redirects') {
        currentItem = { line: lineNo, source: 'netlify.toml', from: '', to: '', status: 301, force: false };
        redirects.push(currentItem);
      } else if (name === 'headers') {
        currentItem = { line: lineNo, source: 'netlify.toml', for: '', values: {} };
        headers.push(currentItem);
      } else {
        currentItem = { line: lineNo };
      }
      continue;
    }

    if (cleaned.startsWith('[')) {
      if (!cleaned.endsWith(']')) {
        errors.push({ line: lineNo, message: `Unclosed table header: ${cleaned}` });
        continue;
      }
      const name = cleaned.slice(1, -1).trim();
      currentSection = `[${name}]`;
      if (name === 'headers.values') {
        if (!headers.length) {
          errors.push({ line: lineNo, message: '[headers.values] declared before [[headers]]' });
          currentItem = null;
        } else {
          currentItem = headers[headers.length - 1];
        }
      } else if (name === 'redirects.query' || name === 'redirects.conditions') {
        currentItem = redirects.length ? redirects[redirects.length - 1] : null;
      } else {
        currentItem = null;
      }
      continue;
    }

    const eqIdx = cleaned.indexOf('=');
    if (eqIdx <= 0) {
      errors.push({ line: lineNo, message: `Invalid key/value assignment: ${cleaned.slice(0, 60)}` });
      continue;
    }
    const rawKey = cleaned.slice(0, eqIdx).trim().replace(/^["']|["']$/g, '');
    const parsedVal = parseTomlScalar(cleaned.slice(eqIdx + 1), lineNo, errors);

    if (currentSection === '[build]') {
      build[rawKey] = parsedVal;
    } else if (currentSection === '[build.environment]') {
      buildEnvironment[rawKey] = parsedVal;
    } else if (currentSection === '[functions]') {
      functions[rawKey] = parsedVal;
    } else if (currentSection === '[images]') {
      images[rawKey] = parsedVal;
    } else if (currentSection === '[site]') {
      site[rawKey] = parsedVal;
    } else if (currentSection && currentSection.startsWith('[build.processing')) {
      processing[currentSection.slice(1, -1)] = {
        ...(processing[currentSection.slice(1, -1)] || {}),
        [rawKey]: parsedVal,
      };
    } else if (currentSection === '[[edge_functions]]' && currentItem) {
      currentItem[rawKey] = parsedVal;
    } else if (currentSection === '[[redirects]]' && currentItem) {
      if (rawKey === 'status') {
        currentItem.status = Number(parsedVal);
      } else if (rawKey === 'force') {
        currentItem.force = Boolean(parsedVal);
      } else {
        currentItem[rawKey] = parsedVal;
      }
    } else if (currentSection === '[[headers]]' && currentItem) {
      currentItem[rawKey] = parsedVal;
    } else if (currentSection === '[headers.values]' && currentItem) {
      currentItem.values[rawKey] = String(parsedVal);
    }
  }

  return {
    ok: errors.length === 0,
    lineCount: lines.length,
    errors,
    build,
    buildEnvironment,
    functions,
    images,
    site,
    processing,
    edgeFunctions,
    redirects,
    headers,
  };
}

export function parseRedirectsFile(text) {
  const src = String(text ?? '');
  const lines = src.split(/\r?\n/);
  const rules = [];
  const errors = [];

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      errors.push({ line: lineNo, message: `Malformed _redirects rule: "${trimmed}"` });
      continue;
    }
    const from = parts[0];
    const to = parts[1];
    let status = 301;
    let force = false;
    if (parts[2] && /^\d{3}!?$/.test(parts[2])) {
      force = parts[2].endsWith('!');
      status = Number(parts[2].replace('!', ''));
    } else if (parts[2] && !parts[2].includes('=')) {
      errors.push({ line: lineNo, message: `Invalid status token "${parts[2]}" in _redirects` });
    }
    rules.push({
      line: lineNo,
      source: '_redirects',
      from,
      to,
      status,
      force,
    });
  }

  return { ok: errors.length === 0, rules, errors };
}

export function parseHeadersFile(text) {
  const src = String(text ?? '');
  const lines = src.split(/\r?\n/);
  const blocks = [];
  const errors = [];
  let current = null;

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (!/^\s/.test(raw) && (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://'))) {
      current = { line: lineNo, source: '_headers', for: trimmed, values: {} };
      blocks.push(current);
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (!current || colonIdx <= 0) {
      errors.push({ line: lineNo, message: `Header line outside path block or missing ":": "${trimmed.slice(0, 60)}"` });
      continue;
    }
    const key = trimmed.slice(0, colonIdx).trim();
    const val = trimmed.slice(colonIdx + 1).trim();
    current.values[key] = val;
  }

  return { ok: errors.length === 0, blocks, errors };
}

// ── Pattern Matching & Redirect Graph Analyzer ──────────────────────────────

function normalizePath(p) {
  const s = String(p || '/').trim();
  if (!s) return '/';
  if (/^https?:\/\//i.test(s)) return s;
  const noQuery = s.split('?')[0].split('#')[0];
  if (noQuery.length > 1 && noQuery.endsWith('/')) return noQuery.slice(0, -1);
  return noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
}

export function matchNetlifyPattern(pattern, requestPath) {
  const pat = String(pattern || '').trim();
  const req = normalizePath(requestPath);
  if (!pat) return { matched: false, splat: '', params: {} };
  if (pat === '/*' || pat === '*') {
    return { matched: true, splat: req.replace(/^\/+/, ''), params: {} };
  }
  const cleanPat = normalizePath(pat);
  if (cleanPat.endsWith('/*')) {
    const prefix = cleanPat.slice(0, -2);
    if (req === prefix || req.startsWith(`${prefix}/`)) {
      const splat = req.length > prefix.length ? req.slice(prefix.length + 1) : '';
      return { matched: true, splat, params: {} };
    }
    return { matched: false, splat: '', params: {} };
  }
  if (cleanPat.includes(':')) {
    const patSegs = cleanPat.split('/').filter(Boolean);
    const reqSegs = req.split('/').filter(Boolean);
    if (patSegs.length !== reqSegs.length) return { matched: false, splat: '', params: {} };
    const params = {};
    for (let i = 0; i < patSegs.length; i += 1) {
      if (patSegs[i].startsWith(':')) {
        params[patSegs[i].slice(1)] = reqSegs[i];
      } else if (patSegs[i] !== reqSegs[i]) {
        return { matched: false, splat: '', params: {} };
      }
    }
    return { matched: true, splat: '', params };
  }
  return { matched: cleanPat === req, splat: '', params: {} };
}

function applyRedirectTarget(toPattern, matchInfo) {
  let out = String(toPattern || '/');
  out = out.replace(/:splat/g, matchInfo.splat || '');
  for (const [k, v] of Object.entries(matchInfo.params || {})) {
    out = out.replace(new RegExp(`:${k}\\b`, 'g'), v);
  }
  return out;
}

export function analyzeRedirects(allRedirects) {
  const rules = Array.isArray(allRedirects) ? allRedirects : [];
  const selfRedirects = [];
  const invalidStatuses = [];
  const shadowedRules = [];
  const cycles = [];

  let firstGlobalSplatIdx = -1;
  let spaFallbackRule = null;

  // Build adjacency for cycle detection among non-wildcard rules
  const adj = new Map();

  for (let i = 0; i < rules.length; i += 1) {
    const r = rules[i];
    const fromNorm = normalizePath(r.from);
    const toNorm = normalizePath(r.to);
    const status = Number(r.status);

    if (!VALID_REDIRECT_STATUSES.includes(status)) {
      invalidStatuses.push({
        index: i,
        line: r.line,
        source: r.source,
        from: r.from,
        to: r.to,
        status: r.status,
      });
    }

    if (fromNorm === toNorm) {
      selfRedirects.push({
        index: i,
        line: r.line,
        source: r.source,
        from: r.from,
        to: r.to,
        status,
      });
    }

    if (r.from === '/*' && toNorm === '/index.html' && status === 200) {
      spaFallbackRule = { index: i, line: r.line, source: r.source, from: r.from, to: r.to, status };
    }

    if (firstGlobalSplatIdx >= 0 && i > firstGlobalSplatIdx) {
      shadowedRules.push({
        index: i,
        line: r.line,
        source: r.source,
        from: r.from,
        to: r.to,
        status,
        shadowedByIndex: firstGlobalSplatIdx,
        shadowedByLine: rules[firstGlobalSplatIdx].line,
      });
    }

    if (r.from === '/*' && firstGlobalSplatIdx < 0) {
      firstGlobalSplatIdx = i;
    }

    if (!r.from.includes('*') && !r.to.includes('*') && !/^https?:\/\//i.test(r.to) && status >= 300 && status < 400) {
      if (!adj.has(fromNorm)) adj.set(fromNorm, []);
      adj.get(fromNorm).push(toNorm);
    }
  }

  // Deterministic DFS cycle finder
  const visited = new Set();
  const inStack = new Set();
  const stack = [];
  const cycleKeys = new Set();

  function dfs(node) {
    visited.add(node);
    inStack.add(node);
    stack.push(node);
    const neighbors = adj.get(node) || [];
    for (const next of neighbors) {
      if (next === node) continue; // already reported in selfRedirects
      if (!visited.has(next)) {
        dfs(next);
      } else if (inStack.has(next)) {
        const start = stack.indexOf(next);
        const loop = [...stack.slice(start), next];
        const canonical = [...loop.slice(0, -1)].sort().join('->');
        if (!cycleKeys.has(canonical)) {
          cycleKeys.add(canonical);
          cycles.push(loop);
        }
      }
    }
    stack.pop();
    inStack.delete(node);
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) dfs(node);
  }

  return {
    totalRules: rules.length,
    selfRedirects,
    cycles,
    shadowedRules,
    invalidStatuses,
    hasSpaFallback: Boolean(spaFallbackRule),
    spaFallbackRule,
    hasLoops: selfRedirects.length > 0 || cycles.length > 0,
    clean: selfRedirects.length === 0 && cycles.length === 0 && shadowedRules.length === 0 && invalidStatuses.length === 0,
  };
}

// ── Edge & Serverless Request Router Simulator ──────────────────────────────

export function simulateNetlifyRequest({
  path: inputPath = '/api/edge/telemetry',
  parsedToml = null,
  parsedRedirects = null,
  parsedHeaders = null,
  edgeFunctionsManifest = OFFLINE_EDGE_FUNCTIONS,
  serverlessManifest = OFFLINE_SERVERLESS_FUNCTIONS,
} = {}) {
  const rawPath = String(inputPath || '/').trim() || '/';
  const [pathOnly, queryString = ''] = rawPath.split('?');
  const reqPath = normalizePath(pathOnly);
  const toml = parsedToml || parseNetlifyToml(DEFAULT_REPO_NETLIFY_TOML);
  const allRedirects = [
    ...(toml.redirects || []),
    ...(parsedRedirects?.rules || []),
  ];
  const allHeaders = [
    ...(toml.headers || []),
    ...(parsedHeaders?.blocks || []),
  ];

  // 1. Evaluate Edge Functions (toml [[edge_functions]] + manifest config.path)
  const matchedEdgeFunctions = [];
  const seenEdge = new Set();

  for (const ef of toml.edgeFunctions || []) {
    if (!ef.path) continue;
    const m = matchNetlifyPattern(ef.path, reqPath);
    if (m.matched) {
      const key = `${ef.function}:${ef.path}`;
      if (!seenEdge.has(key)) {
        seenEdge.add(key);
        matchedEdgeFunctions.push({
          function: ef.function || 'edge-fn',
          pattern: ef.path,
          source: 'netlify.toml [[edge_functions]]',
          runtime: 'Deno (Netlify Edge)',
        });
      }
    }
  }

  for (const mf of edgeFunctionsManifest || []) {
    for (const p of mf.paths || []) {
      const m = matchNetlifyPattern(p, reqPath);
      if (m.matched) {
        const key = `${mf.name}:${p}`;
        if (!seenEdge.has(key)) {
          seenEdge.add(key);
          matchedEdgeFunctions.push({
            function: mf.name,
            pattern: p,
            source: mf.file || 'netlify/edge-functions',
            runtime: mf.runtime || 'Deno (Netlify Edge)',
          });
        }
      }
    }
  }

  // 2. Evaluate Redirects / Rewrites (multi-hop up to 8 hops with loop guard)
  const redirectChain = [];
  let currentPath = reqPath;
  let finalStatus = 200;
  let finalTarget = reqPath;
  let matchedRedirect = null;
  let cycleDetected = false;
  const seenPaths = new Set([currentPath]);

  for (let hop = 0; hop < 8; hop += 1) {
    let hit = null;
    let hitMatch = null;
    for (const rule of allRedirects) {
      const m = matchNetlifyPattern(rule.from, currentPath);
      if (m.matched) {
        hit = rule;
        hitMatch = m;
        break;
      }
    }
    if (!hit) break;

    const resolvedTarget = applyRedirectTarget(hit.to, hitMatch);
    const step = {
      hop: hop + 1,
      from: hit.from,
      to: hit.to,
      resolvedTarget,
      status: Number(hit.status) || 301,
      force: Boolean(hit.force),
      source: hit.source || 'netlify.toml',
      line: hit.line || null,
    };
    redirectChain.push(step);
    if (!matchedRedirect) matchedRedirect = step;
    finalStatus = step.status;
    finalTarget = resolvedTarget;

    // 200 rewrite terminates routing (either serverless proxy or SPA rewrite)
    if (step.status === 200 || step.status >= 400 || /^https?:\/\//i.test(resolvedTarget)) {
      break;
    }

    const nextNorm = normalizePath(resolvedTarget);
    if (seenPaths.has(nextNorm)) {
      cycleDetected = true;
      break;
    }
    seenPaths.add(nextNorm);
    currentPath = nextNorm;
  }

  // 3. Check Serverless Function target
  let matchedServerlessFunction = null;
  const fnMatch = String(finalTarget || '').match(/^\/\.netlify\/functions\/([A-Za-z0-9._-]+)(?:\/(.*))?$/);
  if (fnMatch) {
    const fnName = fnMatch[1];
    const fnMeta = (serverlessManifest || []).find((f) => f.name === fnName) || null;
    matchedServerlessFunction = {
      name: fnName,
      subpath: fnMatch[2] || '',
      runtime: fnMeta?.runtime || 'Node.js 20 (esbuild)',
      file: fnMeta?.file || `netlify/functions/${fnName}.js`,
    };
  }

  // 4. Evaluate Headers (merge all matching header blocks in order)
  const effectiveHeaders = {};
  const matchedHeaderBlocks = [];
  for (const blk of allHeaders) {
    if (!blk.for) continue;
    const m = matchNetlifyPattern(blk.for, reqPath);
    if (m.matched) {
      matchedHeaderBlocks.push({
        for: blk.for,
        source: blk.source || 'netlify.toml',
        line: blk.line || null,
        headerCount: Object.keys(blk.values || {}).length,
      });
      for (const [k, v] of Object.entries(blk.values || {})) {
        effectiveHeaders[k] = { value: v, fromBlock: blk.for };
      }
    }
  }

  // Determine route resolution classification
  let resolutionType = 'STATIC_ASSET_OR_PRERENDERED';
  if (cycleDetected) resolutionType = 'REDIRECT_LOOP_ERROR';
  else if (matchedEdgeFunctions.length > 0) resolutionType = 'EDGE_FUNCTION_INTERCEPT';
  else if (matchedServerlessFunction) resolutionType = 'SERVERLESS_FUNCTION_PROXY';
  else if (matchedRedirect && matchedRedirect.status >= 300 && matchedRedirect.status < 400) resolutionType = 'HTTP_REDIRECT';
  else if (matchedRedirect && finalTarget === '/index.html' && matchedRedirect.status === 200) resolutionType = 'SPA_REWRITE_FALLBACK';

  const result = redactNetlifyPayload({
    ok: !cycleDetected,
    requestPath: reqPath,
    queryString,
    resolutionType,
    cycleDetected,
    finalStatus: cycleDetected ? 508 : finalStatus,
    finalTarget,
    matchedEdgeFunctions,
    matchedServerlessFunction,
    matchedRedirect,
    redirectChain,
    matchedHeaderBlocks,
    effectiveHeaders,
  });

  return {
    ...result,
    receiptSha256: sha256Hex(JSON.stringify(result)),
  };
}

// ── 14-Point Pre-Deployment Production Guardrail Auditor ────────────────────

export function gradeFromAuditScore(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 82) return 'B';
  if (score >= 70) return 'C';
  if (score >= 55) return 'D';
  return 'F';
}

function findHeaderValueCaseInsensitive(headersBlocks, pathPattern, headerName) {
  const target = headerName.toLowerCase();
  for (const blk of headersBlocks || []) {
    if (pathPattern && blk.for !== pathPattern) continue;
    for (const [k, v] of Object.entries(blk.values || {})) {
      if (k.toLowerCase() === target) return String(v);
    }
  }
  return null;
}

export function auditNetlifyConfig({
  toml = DEFAULT_REPO_NETLIFY_TOML,
  redirects = '',
  headers = '',
  repoContext = null,
} = {}) {
  const parsedToml = parseNetlifyToml(toml);
  const parsedRedirects = parseRedirectsFile(redirects);
  const parsedHeaders = parseHeadersFile(headers);

  const allRedirects = [...parsedToml.redirects, ...parsedRedirects.rules];
  const allHeaders = [...parsedToml.headers, ...parsedHeaders.blocks];
  const redirectAnalysis = analyzeRedirects(allRedirects);
  const secretFindings = [
    ...detectSecretPatterns(toml),
    ...detectSecretPatterns(redirects),
    ...detectSecretPatterns(headers),
  ];

  const checks = [];
  const addCheck = (id, category, name, status, weight, message, fixPatch = '') => {
    checks.push({ id, category, name, status, weight, message, fixPatch });
  };

  // 1. Publish directory configured
  const publishDir = String(parsedToml.build.publish || '').trim();
  if (publishDir) {
    const distInfo = repoContext?.distSummary
      ? ` (live ${publishDir}/ has ${repoContext.distSummary.fileCount} files, ${repoContext.distSummary.totalMiB} MiB)`
      : '';
    addCheck(
      'PUB_DIR_CONFIGURED',
      'build',
      'Publish Directory Configured',
      'PASS',
      8,
      `[build] publish = "${publishDir}"${distInfo}.`,
    );
  } else {
    addCheck(
      'PUB_DIR_CONFIGURED',
      'build',
      'Publish Directory Configured',
      'FAIL',
      8,
      'Missing [build] publish directory in netlify.toml.',
      '[build]\n  publish = "dist"',
    );
  }

  // 2. Build command configured
  const buildCmd = String(parsedToml.build.command || '').trim();
  if (buildCmd && !/^echo\s+/i.test(buildCmd)) {
    addCheck('BUILD_COMMAND_CONFIGURED', 'build', 'Deterministic Build Command', 'PASS', 6, `[build] command = "${buildCmd}".`);
  } else if (buildCmd) {
    addCheck(
      'BUILD_COMMAND_CONFIGURED',
      'build',
      'Deterministic Build Command',
      'WARN',
      6,
      `Build command "${buildCmd}" looks like a placeholder echo stub instead of a real build pipeline.`,
      '[build]\n  command = "npm run build"',
    );
  } else {
    addCheck(
      'BUILD_COMMAND_CONFIGURED',
      'build',
      'Deterministic Build Command',
      'FAIL',
      6,
      'Missing [build] command in netlify.toml.',
      '[build]\n  command = "npm run build"',
    );
  }

  // 3. Config syntax validity
  const syntaxErrors = [...parsedToml.errors, ...parsedRedirects.errors, ...parsedHeaders.errors];
  if (syntaxErrors.length === 0) {
    addCheck('TOML_SYNTAX_VALID', 'config', 'TOML / _redirects / _headers Syntax', 'PASS', 8, `Parsed ${parsedToml.lineCount} lines cleanly with zero syntax errors.`);
  } else {
    addCheck(
      'TOML_SYNTAX_VALID',
      'config',
      'TOML / _redirects / _headers Syntax',
      'FAIL',
      8,
      `${syntaxErrors.length} syntax error(s): line ${syntaxErrors[0].line} — ${syntaxErrors[0].message}.`,
      'Fix unclosed brackets, quotes, or malformed key/value lines before deploy.',
    );
  }

  // 4. Redirect loop guard
  if (!redirectAnalysis.hasLoops) {
    addCheck(
      'REDIRECT_LOOP_GUARD',
      'routing',
      'Circular & Self-Redirect Loop Guard',
      'PASS',
      10,
      `Validated ${redirectAnalysis.totalRules} redirect rule(s) with zero cycles or self-redirects.`,
    );
  } else {
    const detail = [
      ...redirectAnalysis.selfRedirects.map((s) => `${s.from} -> ${s.to} (line ${s.line})`),
      ...redirectAnalysis.cycles.map((c) => c.join(' -> ')),
    ].join('; ');
    addCheck(
      'REDIRECT_LOOP_GUARD',
      'routing',
      'Circular & Self-Redirect Loop Guard',
      'FAIL',
      10,
      `Detected redirect loop(s): ${detail}.`,
      'Remove self-referential rules and break circular redirect chains before publishing.',
    );
  }

  // 5. Redirect shadowing & status codes
  if (redirectAnalysis.shadowedRules.length === 0 && redirectAnalysis.invalidStatuses.length === 0) {
    addCheck(
      'REDIRECT_SHADOW_GUARD',
      'routing',
      'Splat Shadowing & HTTP Status Validation',
      'PASS',
      8,
      'No rules are shadowed by an earlier /* splat, and all redirect HTTP status codes are valid.',
    );
  } else {
    const parts = [];
    if (redirectAnalysis.shadowedRules.length > 0) {
      parts.push(`${redirectAnalysis.shadowedRules.length} rule(s) shadowed after /* on line ${redirectAnalysis.shadowedRules[0].shadowedByLine}`);
    }
    if (redirectAnalysis.invalidStatuses.length > 0) {
      parts.push(`${redirectAnalysis.invalidStatuses.length} invalid status code(s) (${redirectAnalysis.invalidStatuses.map((x) => x.status).join(', ')})`);
    }
    addCheck(
      'REDIRECT_SHADOW_GUARD',
      'routing',
      'Splat Shadowing & HTTP Status Validation',
      'FAIL',
      8,
      parts.join('; ') + '.',
      'Move specific redirects above the terminal /* -> /index.html 200 rule and use valid codes (200, 301, 302, 307, 308, 404).',
    );
  }

  // 6. SPA fallback
  if (redirectAnalysis.hasSpaFallback) {
    addCheck(
      'SPA_FALLBACK_PRESENT',
      'routing',
      'SPA Deep-Link Catch-All Rewrite',
      'PASS',
      6,
      `SPA fallback /* -> /index.html (200) active at line ${redirectAnalysis.spaFallbackRule.line}.`,
    );
  } else {
    addCheck(
      'SPA_FALLBACK_PRESENT',
      'routing',
      'SPA Deep-Link Catch-All Rewrite',
      'WARN',
      6,
      'No terminal /* -> /index.html 200 rewrite rule detected; SPA deep-links may 404 on reload.',
      '[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200',
    );
  }

  // 7. Node runtime pin
  const nodeVer = String(parsedToml.buildEnvironment.NODE_VERSION || '').trim();
  if (nodeVer && /^\d+(\.\d+){0,2}$/.test(nodeVer)) {
    addCheck('NODE_VERSION_PINNED', 'runtime', 'Node.js Build Runtime Pin', 'PASS', 6, `NODE_VERSION = "${nodeVer}" pinned in [build.environment].`);
  } else {
    addCheck(
      'NODE_VERSION_PINNED',
      'runtime',
      'Node.js Build Runtime Pin',
      'FAIL',
      6,
      'NODE_VERSION is not pinned in [build.environment]; builds risk runtime drift.',
      '[build.environment]\n  NODE_VERSION = "20"',
    );
  }

  // 8. Core Security Headers
  const xfo = findHeaderValueCaseInsensitive(allHeaders, '/*', 'X-Frame-Options');
  const xcto = findHeaderValueCaseInsensitive(allHeaders, '/*', 'X-Content-Type-Options');
  const refPol = findHeaderValueCaseInsensitive(allHeaders, '/*', 'Referrer-Policy');
  const csp = findHeaderValueCaseInsensitive(allHeaders, '/*', 'Content-Security-Policy');
  const missingSec = [];
  if (!xfo) missingSec.push('X-Frame-Options');
  if (!xcto || xcto.toLowerCase() !== 'nosniff') missingSec.push('X-Content-Type-Options=nosniff');
  if (!refPol) missingSec.push('Referrer-Policy');
  if (!csp) missingSec.push('Content-Security-Policy');
  if (missingSec.length === 0) {
    addCheck(
      'SECURITY_HEADERS_CORE',
      'security',
      'Core Security Headers (/*)',
      'PASS',
      10,
      `X-Frame-Options (${xfo}), X-Content-Type-Options (${xcto}), Referrer-Policy (${refPol}), and Content-Security-Policy active.`,
    );
  } else {
    addCheck(
      'SECURITY_HEADERS_CORE',
      'security',
      'Core Security Headers (/*)',
      missingSec.length >= 2 ? 'FAIL' : 'WARN',
      10,
      `Missing on /*: ${missingSec.join(', ')}.`,
      '[[headers]]\n  for = "/*"\n  [headers.values]\n    X-Frame-Options = "SAMEORIGIN"\n    X-Content-Type-Options = "nosniff"\n    Referrer-Policy = "strict-origin-when-cross-origin"\n    Content-Security-Policy = "frame-ancestors \'self\'"',
    );
  }

  // 9. COOP / COEP Enclave Headers
  const coop = findHeaderValueCaseInsensitive(allHeaders, '/*', 'Cross-Origin-Opener-Policy');
  const coep = findHeaderValueCaseInsensitive(allHeaders, '/*', 'Cross-Origin-Embedder-Policy');
  if (coop && coep) {
    addCheck(
      'COOP_COEP_ENCLAVE',
      'security',
      'Cross-Origin Isolation (COOP + COEP)',
      'PASS',
      6,
      `COOP="${coop}" and COEP="${coep}" enable SharedArrayBuffer and WebGPU high-resolution timers.`,
    );
  } else {
    addCheck(
      'COOP_COEP_ENCLAVE',
      'security',
      'Cross-Origin Isolation (COOP + COEP)',
      'WARN',
      6,
      `Missing ${[!coop && 'Cross-Origin-Opener-Policy', !coep && 'Cross-Origin-Embedder-Policy'].filter(Boolean).join(' & ')} on /*.`,
      'Cross-Origin-Opener-Policy = "same-origin"\nCross-Origin-Embedder-Policy = "credentialless"',
    );
  }

  // 10. Immutable Cache Policy
  const assetCache = findHeaderValueCaseInsensitive(allHeaders, '/assets/*', 'Cache-Control');
  if (assetCache && /immutable/i.test(assetCache) && /max-age=/i.test(assetCache)) {
    addCheck('IMMUTABLE_CACHE_POLICY', 'cdn', 'Immutable Asset Cache-Control (/assets/*)', 'PASS', 6, `Cache-Control = "${assetCache}".`);
  } else {
    addCheck(
      'IMMUTABLE_CACHE_POLICY',
      'cdn',
      'Immutable Asset Cache-Control (/assets/*)',
      'WARN',
      6,
      'Missing immutable Cache-Control header block for hashed /assets/* bundles.',
      '[[headers]]\n  for = "/assets/*"\n  [headers.values]\n    Cache-Control = "public, max-age=31536000, immutable"',
    );
  }

  // 11. AEO / SEO Discovery Files
  const requiredDiscovery = ['robots.txt', 'sitemap.xml', 'llms.txt', 'ai.txt', '.well-known/mcp.json'];
  if (repoContext?.discoveryFiles) {
    const missingFiles = requiredDiscovery.filter((f) => !repoContext.discoveryFiles[f]?.present);
    if (missingFiles.length === 0) {
      addCheck('AEO_SEO_DISCOVERY', 'aeo', 'AEO / SEO Discovery Surface (5 Files)', 'PASS', 6, `All 5 discovery assets present in public/: ${requiredDiscovery.join(', ')}.`);
    } else {
      addCheck('AEO_SEO_DISCOVERY', 'aeo', 'AEO / SEO Discovery Surface (5 Files)', 'WARN', 6, `Missing discovery file(s): ${missingFiles.join(', ')}.`, 'Generate missing AEO discovery manifests in public/.');
    }
  } else {
    const hasDiscoveryRules = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/ai.txt'].filter((p) =>
      allHeaders.some((h) => h.for === p),
    );
    if (hasDiscoveryRules.length >= 3) {
      addCheck('AEO_SEO_DISCOVERY', 'aeo', 'AEO / SEO Discovery Surface', 'PASS', 6, `Header rules declared for ${hasDiscoveryRules.join(', ')}.`);
    } else {
      addCheck('AEO_SEO_DISCOVERY', 'aeo', 'AEO / SEO Discovery Surface', 'WARN', 6, 'Add explicit MIME/CORS header blocks for /robots.txt, /sitemap.xml, /llms.txt, and /ai.txt.');
    }
  }

  // 12. AEO MIME & CORS Headers
  const aeoPaths = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/ai.txt'];
  const coveredAeo = aeoPaths.filter((p) => Boolean(findHeaderValueCaseInsensitive(allHeaders, p, 'Content-Type')));
  if (coveredAeo.length >= 4) {
    addCheck('AEO_MIME_CORS_HEADERS', 'aeo', 'AEO MIME & Crawler CORS Headers', 'PASS', 6, `Explicit Content-Type + CORS headers configured for all ${coveredAeo.length} AEO manifests.`);
  } else {
    addCheck(
      'AEO_MIME_CORS_HEADERS',
      'aeo',
      'AEO MIME & Crawler CORS Headers',
      'WARN',
      6,
      `Only ${coveredAeo.length}/4 AEO manifests (${aeoPaths.join(', ')}) have explicit Content-Type headers.`,
      'Add [[headers]] blocks with Content-Type and Access-Control-Allow-Origin = "*" for /robots.txt, /sitemap.xml, /llms.txt, and /ai.txt.',
    );
  }

  // 13. Edge & Serverless Bundler Readiness
  const bundler = String(parsedToml.functions.node_bundler || '').trim();
  const hasEdgeCfg = Boolean(parsedToml.build.edge_functions || parsedToml.edgeFunctions.length > 0);
  if (bundler === 'esbuild' && hasEdgeCfg) {
    addCheck(
      'EDGE_SERVERLESS_BUNDLER',
      'edge',
      'Edge & Serverless Bundler (esbuild)',
      'PASS',
      6,
      `[functions] node_bundler = "esbuild" with ${parsedToml.edgeFunctions.length} [[edge_functions]] route(s).`,
    );
  } else {
    addCheck(
      'EDGE_SERVERLESS_BUNDLER',
      'edge',
      'Edge & Serverless Bundler (esbuild)',
      'WARN',
      6,
      `node_bundler="${bundler || 'unset'}", edge_functions routes=${parsedToml.edgeFunctions.length}.`,
      '[functions]\n  node_bundler = "esbuild"',
    );
  }

  // 14. Secret-Pattern & Static Asset Budget Hygiene
  const oversized = repoContext?.distSummary?.oversizedFiles || [];
  if (secretFindings.length > 0) {
    addCheck(
      'SECRET_PATTERN_HYGIENE',
      'security',
      'Secret-Pattern & Asset Budget Hygiene',
      'FAIL',
      8,
      `Detected ${secretFindings.length} secret pattern(s): ${secretFindings.map((f) => `${f.id} (line ${f.line})`).join(', ')}.`,
      'Remove plaintext credentials from config files and inject them via netlify env:set KEY VALUE.',
    );
  } else if (oversized.length > 0) {
    addCheck(
      'SECRET_PATTERN_HYGIENE',
      'security',
      'Secret-Pattern & Asset Budget Hygiene',
      'WARN',
      8,
      `Zero plaintext secret patterns found; ${oversized.length} static asset(s) exceed 30 MiB budget (${oversized[0].path}: ${oversized[0].sizeMiB} MiB).`,
      'Move large installers or media artifacts to release storage to keep CDN deploys lean.',
    );
  } else {
    addCheck(
      'SECRET_PATTERN_HYGIENE',
      'security',
      'Secret-Pattern & Asset Budget Hygiene',
      'PASS',
      8,
      'Zero plaintext secret patterns (NETLIFY_AUTH_TOKEN, ghp_, sk_live_, AKIA, private keys) detected and static payload budget is clean.',
    );
  }

  const maxScore = checks.reduce((acc, c) => acc + c.weight, 0);
  const earned = checks.reduce((acc, c) => {
    if (c.status === 'PASS') return acc + c.weight;
    if (c.status === 'WARN') return acc + c.weight * 0.5;
    return acc;
  }, 0);
  const score = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;
  const grade = gradeFromAuditScore(score);

  const summary = {
    score,
    grade,
    totalChecks: checks.length,
    passCount: checks.filter((c) => c.status === 'PASS').length,
    warnCount: checks.filter((c) => c.status === 'WARN').length,
    failCount: checks.filter((c) => c.status === 'FAIL').length,
    redirectCount: allRedirects.length,
    headerBlockCount: allHeaders.length,
    edgeFunctionRouteCount: parsedToml.edgeFunctions.length,
    secretFindingsCount: secretFindings.length,
  };

  const payload = redactNetlifyPayload({
    ok: true,
    schemaVersion: NETLIFY_AX_SCHEMA_VERSION,
    summary,
    checks,
    redirectAnalysis,
    secretFindings,
    parsed: {
      build: parsedToml.build,
      buildEnvironment: parsedToml.buildEnvironment,
      functions: parsedToml.functions,
      edgeFunctions: parsedToml.edgeFunctions,
      redirects: allRedirects,
      headers: allHeaders,
      syntaxErrors,
    },
  });

  return {
    ...payload,
    receiptSha256: sha256Hex(JSON.stringify(payload)),
  };
}

// ── Copy-Only Safe CLI & Hardened Config Synthesizer ────────────────────────

function sanitizeCliToken(val, fallback) {
  const cleaned = String(val ?? '')
    .trim()
    .replace(/[^A-Za-z0-9._:/@-]/g, '');
  return cleaned || fallback;
}

export function synthesizeNetlifyCliPlaybook({
  siteName = 'zoth-studio-v2',
  envKey = 'NODE_VERSION',
  envValue = '20',
  functionName = 'studio-api',
} = {}) {
  const safeSite = sanitizeCliToken(siteName, 'zoth-studio-v2');
  const safeKey = sanitizeCliToken(envKey, 'NODE_VERSION').toUpperCase();
  const safeVal = sanitizeCliToken(envValue, '20');
  const safeFn = sanitizeCliToken(functionName, 'studio-api');

  const commands = [
    {
      id: 'version',
      title: 'Check Host Netlify CLI Version (Read-Only)',
      command: 'netlify --version',
      safety: 'READ_ONLY',
      note: 'Verifies local CLI version without touching network or credentials.',
    },
    {
      id: 'status',
      title: 'Inspect Linked Site Status (Read-Only)',
      command: 'netlify status',
      safety: 'READ_ONLY',
      note: 'Displays linked project metadata in your local terminal.',
    },
    {
      id: 'build-dry',
      title: 'Dry-Run Production Build & Config Validation',
      command: 'netlify build --dry',
      safety: 'LOCAL_DRY_RUN',
      note: 'Simulates build lifecycle hooks and netlify.toml parsing locally without uploading.',
    },
    {
      id: 'dev',
      title: 'Start Local Netlify Dev Edge + Functions Emulator',
      command: 'netlify dev --port 8888',
      safety: 'LOCAL_ONLY',
      note: 'Runs local Edge Functions and Serverless Functions against dist/ on loopback.',
    },
    {
      id: 'functions-list',
      title: 'List Bundled Serverless & Edge Functions',
      command: 'netlify functions:list',
      safety: 'READ_ONLY',
      note: `Inspects deployed or local functions including ${safeFn}.`,
    },
    {
      id: 'env-set',
      title: 'Inject Environment Variable Safely (Never Commit Secrets)',
      command: `netlify env:set ${safeKey} ${safeVal}`,
      safety: 'MANUAL_OPERATOR_ACTION',
      note: `Copy and run manually in your terminal for site ${safeSite}; Studio never executes remote writes.`,
    },
    {
      id: 'studio-open',
      title: 'Open Workstation via Zoth Studio CLI',
      command: 'zoth open netlify-ax --json',
      safety: 'READ_ONLY',
      note: 'Prints canonical local/production route metadata for netlify-ax.',
    },
    {
      id: 'engine-test',
      title: 'Run Deterministic Netlify AX Test Suite',
      command: 'npm run test:netlify-ax',
      safety: 'LOCAL_ONLY',
      note: 'Executes pure engine parity, parser, loop detector, simulator, and security tests.',
    },
  ];

  const bundle = redactNetlifyPayload({
    readOnlyCopyOnly: true,
    siteName: safeSite,
    commands,
  });

  return {
    ...bundle,
    receiptSha256: sha256Hex(JSON.stringify(bundle)),
  };
}

export function synthesizeHardenedConfigs({
  publishDir = 'dist',
  buildCommand = 'npm run build',
  nodeVersion = '20',
  domain = 'zoth.nullai.tech',
} = {}) {
  const safePub = sanitizeCliToken(publishDir, 'dist');
  const safeNode = sanitizeCliToken(nodeVersion, '20');
  const safeDomain = sanitizeCliToken(domain, 'zoth.nullai.tech');
  const safeCmd = String(buildCommand || 'npm run build').replace(/[\r\n"]/g, '').trim() || 'npm run build';

  const toml = HARDENED_TEMPLATE_NETLIFY_TOML
    .replace('publish = "dist"', `publish = "${safePub}"`)
    .replace('command = "npm run build"', `command = "${safeCmd}"`)
    .replace('NODE_VERSION = "20.18.0"', `NODE_VERSION = "${safeNode}"`)
    .replace(/zoth\.nullai\.tech/g, safeDomain);

  return redactNetlifyPayload({
    toml,
    redirects: HARDENED_TEMPLATE_REDIRECTS,
    headers: HARDENED_TEMPLATE_HEADERS,
    receiptSha256: sha256Hex(`${toml}\n${HARDENED_TEMPLATE_REDIRECTS}\n${HARDENED_TEMPLATE_HEADERS}`),
  });
}

// ── Formula-Safe CSV & Multi-Format Exporters ───────────────────────────────

export function csvEscape(value) {
  let s = redactNetlifyText(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function formatNetlifyAxExports({
  snapshot = null,
  audit = null,
  simulation = null,
  tomlText = DEFAULT_REPO_NETLIFY_TOML,
} = {}) {
  const effectiveAudit = audit || auditNetlifyConfig({ toml: tomlText });
  const effectiveSim = simulation || simulateNetlifyRequest({ path: '/api/edge/telemetry' });

  const csvHeader = ['check_id', 'category', 'name', 'status', 'weight', 'message', 'fix_patch'].join(',');
  const csvRows = (effectiveAudit.checks || []).map((c) =>
    [
      csvEscape(c.id),
      csvEscape(c.category),
      csvEscape(c.name),
      csvEscape(c.status),
      csvEscape(c.weight),
      csvEscape(c.message),
      csvEscape(c.fixPatch || ''),
    ].join(','),
  );
  const csv = [csvHeader, ...csvRows].join('\n');

  const mdLines = [
    '# Zoth Netlify AX & Serverless Edge Audit Dossier',
    '',
    `- **Schema Version:** \`${NETLIFY_AX_SCHEMA_VERSION}\``,
    `- **Mode:** \`${snapshot?.mode || 'BROWSER_OFFLINE_FALLBACK'}\``,
    `- **Guardrail Score:** **${effectiveAudit.summary.score} / 100** (Grade **${effectiveAudit.summary.grade}**)`,
    `- **Checks:** ${effectiveAudit.summary.passCount} PASS · ${effectiveAudit.summary.warnCount} WARN · ${effectiveAudit.summary.failCount} FAIL`,
    `- **Route Simulation Sample:** \`${effectiveSim.requestPath}\` → \`${effectiveSim.resolutionType}\` (HTTP \`${effectiveSim.finalStatus}\`, target \`${effectiveSim.finalTarget}\`)`,
    '',
    '## 14-Point Pre-Deployment Production Guardrails',
    '',
    '| ID | Category | Status | Diagnostic |',
    '| :--- | :--- | :---: | :--- |',
    ...(effectiveAudit.checks || []).map(
      (c) => `| \`${c.id}\` | ${c.category} | **${c.status}** | ${redactNetlifyText(c.message).replace(/\|/g, '\\|')} |`,
    ),
    '',
  ];

  const payloadCore = redactNetlifyPayload({
    schemaVersion: NETLIFY_AX_SCHEMA_VERSION,
    mode: snapshot?.mode || 'BROWSER_OFFLINE_FALLBACK',
    netlifyCliVersion: snapshot?.netlifyCli?.version || null,
    summary: effectiveAudit.summary,
    checks: effectiveAudit.checks,
    redirectAnalysis: effectiveAudit.redirectAnalysis,
    simulation: effectiveSim,
  });
  const receiptSha256 = sha256Hex(JSON.stringify(payloadCore));
  const json = JSON.stringify({ ...payloadCore, receiptSha256 }, null, 2);

  mdLines.push(`- **SHA-256 Verification Receipt:** \`${receiptSha256}\``);
  mdLines.push('- **Attribution:** Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform');

  return {
    json,
    markdown: mdLines.join('\n'),
    csv,
    toml: redactNetlifyText(tomlText),
    receiptSha256,
  };
}

// ── Snapshot Builders (Live Loopback + Offline Fallback) ────────────────────

export function buildNetlifyAxSnapshot({
  mode = 'LIVE_LOOPBACK',
  checkedAt = '2026-11-28T00:00:00.000Z',
  netlifyCli = { installed: false, version: null },
  tomlText = DEFAULT_REPO_NETLIFY_TOML,
  redirectsText = '',
  headersText = '',
  edgeFunctions = OFFLINE_EDGE_FUNCTIONS,
  serverlessFunctions = OFFLINE_SERVERLESS_FUNCTIONS,
  discoveryFiles = null,
  distSummary = null,
  offlineNotice = null,
} = {}) {
  const repoContext = { discoveryFiles, distSummary };
  const audit = auditNetlifyConfig({
    toml: tomlText,
    redirects: redirectsText,
    headers: headersText,
    repoContext,
  });

  const base = redactNetlifyPayload({
    ok: true,
    schemaVersion: NETLIFY_AX_SCHEMA_VERSION,
    mode,
    readOnly: true,
    checkedAt,
    offlineNotice,
    securityBoundary: {
      readsNetlifyCredentials: false,
      readsDotEnvFiles: false,
      remoteDeployMutations: false,
      loopbackOnly: true,
    },
    netlifyCli: {
      installed: Boolean(netlifyCli?.installed),
      version: netlifyCli?.version ? String(netlifyCli.version).trim() : null,
    },
    config: {
      toml: tomlText,
      redirects: redirectsText,
      headers: headersText,
    },
    edgeFunctions: Array.isArray(edgeFunctions) ? edgeFunctions : [],
    serverlessFunctions: Array.isArray(serverlessFunctions) ? serverlessFunctions : [],
    discoveryFiles: discoveryFiles || {
      'robots.txt': { present: true, sizeBytes: 1177 },
      'sitemap.xml': { present: true, sizeBytes: 31128 },
      'llms.txt': { present: true, sizeBytes: 15798 },
      'ai.txt': { present: true, sizeBytes: 1948 },
      '.well-known/mcp.json': { present: true, sizeBytes: 14825 },
    },
    distSummary: distSummary || {
      exists: true,
      fileCount: 0,
      htmlRouteCount: 0,
      totalMiB: 0,
      oversizedFiles: [],
    },
    audit,
  });

  return {
    ...base,
    receiptSha256: sha256Hex(JSON.stringify(base)),
  };
}

export function buildOfflineNetlifyAxSnapshot() {
  return buildNetlifyAxSnapshot({
    mode: 'BROWSER_OFFLINE_FALLBACK',
    checkedAt: '2026-11-28T00:00:00.000Z',
    netlifyCli: { installed: false, version: 'offline-browser-mode' },
    tomlText: DEFAULT_REPO_NETLIFY_TOML,
    redirectsText: '',
    headersText: '',
    edgeFunctions: OFFLINE_EDGE_FUNCTIONS,
    serverlessFunctions: OFFLINE_SERVERLESS_FUNCTIONS,
    distSummary: {
      exists: true,
      fileCount: 162,
      htmlRouteCount: 147,
      totalMiB: 14.8,
      oversizedFiles: [],
    },
    offlineNotice:
      'Loopback :3000 Studio API not detected — running 100% client-side with the curated Zoth Studio v2 netlify.toml snapshot. All parser, redirect loop/shadow, router simulator, 14-point guardrail, and export tools work offline.',
  });
}
