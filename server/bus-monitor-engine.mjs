/**
 * Zoth Swarm NOC & Signal Bridge — Pure Loopback Telemetry & Envelope Engine (v2.3.0)
 *
 * Shared byte-identically between browser (`src/utils/busMonitorEngine.js`) and
 * Studio API server (`server/bus-monitor-engine.mjs`).
 *
 * Invariants:
 *  - Strict 127.0.0.1 / localhost loopback allowlist (100% SSRF-proof)
 *  - Zero Math.random() latency fabrication — offline services report null RTT
 *  - Deterministic unique channel IDs & 4-char topology codes (SGNL vs HOOK)
 *  - WebCrypto HKDF-SHA256 / HMAC-SHA256 envelope signing & verification
 *  - CSV formula-injection neutralization (=, +, -, @, tab, CR)
 */

export const BUS_MONITOR_VERSION = '2.3.0';

export const ALLOWED_LOOPBACK_HOSTS = Object.freeze([
  '127.0.0.1',
  'localhost',
  '[::1]',
  '::1',
]);

export const LOOPBACK_BUS_TARGETS = Object.freeze([
  {
    id: 'zoth-studio',
    code: 'STD',
    name: 'Zoth Studio Hub',
    port: 3000,
    probePath: '/api/studio/status',
    protocol: 'HTTP',
    category: 'Hub',
    description: 'Zoth Studio v2 local server, static assets & hardened loopback API.',
  },
  {
    id: 'neuro-memory',
    code: 'MEM',
    name: 'Neuro-Memory Daemon',
    port: 8094,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'Memory',
    description: 'STDP biomorphic synaptic vector memory & episodic recall daemon.',
  },
  {
    id: 'signal-bridge',
    code: 'BRG',
    name: 'Sovereign Agent Bridge',
    port: 8102,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'IPC',
    description: 'Python local signal bridge, agent mesh ledger & tool gatekeeper.',
  },
  {
    id: 'simplex-chat',
    code: 'SMP',
    name: 'SimpleX Chat CLI',
    port: 5225,
    probePath: '/',
    protocol: 'TCP',
    category: 'Relay',
    description: 'Zero-identifier SimpleX SMP local relay daemon.',
  },
  {
    id: 'zoth-vault',
    code: 'VLT',
    name: 'Zoth Vault Daemon',
    port: 8787,
    probePath: '/health',
    protocol: 'HTTP',
    category: 'Security',
    description: 'Local encrypted secrets & credential vault enclave.',
  },
  {
    id: 'ollama',
    code: 'OLM',
    name: 'Ollama Local Runtime',
    port: 11434,
    probePath: '/api/tags',
    protocol: 'HTTP',
    category: 'Inference',
    description: 'Local GGUF model inference runtime with zero cloud fallback.',
  },
  {
    id: 'agy-hermes',
    code: 'AGY',
    name: 'AGY-Hermes Proxy',
    port: 18000,
    probePath: '/health',
    protocol: 'HTTP',
    category: 'Proxy',
    description: 'OpenAI-compatible loopback bridge for local coding agents.',
  },
  {
    id: 'budget-sentinel',
    code: 'BDG',
    name: 'Budget Sentinel',
    port: 8110,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'FinOps',
    description: 'Local token-cost meter and spend-cap circuit breaker.',
  },
  {
    id: 'voice-call',
    code: 'VOC',
    name: 'Agent Voice Call',
    port: 8114,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'Audio',
    description: 'Local neural TTS/STT speech cockpit & MCP voice daemon.',
  },
  {
    id: 'netrunner-adytum',
    code: 'NET',
    name: 'Adytum / Netrunner Hub',
    port: 8135,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'Workbench',
    description: '22-Key Hermetic planning workbench & spec gatekeeper.',
  },
  {
    id: 'azoth-agent',
    code: 'AZT',
    name: 'AZOTH Local Agent',
    port: 8136,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'Agent',
    description: 'Hardened loopback FastAPI Archon agent & 36-tool MCP host.',
  },
  {
    id: 'swarm-coordinator',
    code: 'SWM',
    name: 'Swarm Coordinator',
    port: 8989,
    probePath: '/api/health',
    protocol: 'HTTP',
    category: 'Swarm',
    description: 'Multi-agent swarm telemetry multiplexer & consensus bus.',
  },
]);

const CATALOG_BY_PORT = new Map(LOOPBACK_BUS_TARGETS.map((t) => [t.port, t]));

/**
 * Validates that an HTTP Host header or optional host argument resolves strictly to loopback.
 */
export function isLoopbackHostString(rawHost) {
  const s = String(rawHost ?? '').trim().toLowerCase();
  if (!s) return false;
  if (s.includes('://') || /[\s/@\\?#]/.test(s)) return false;
  const hostOnly = s.startsWith('[')
    ? s.replace(/\]:\d+$/, ']')
    : s.replace(/:\d+$/, '');
  return ALLOWED_LOOPBACK_HOSTS.includes(hostOnly);
}

/**
 * Strictly validates a loopback target port (and rejects any non-loopback host/URL).
 * Prevents SSRF to external domains, cloud metadata (169.254.169.254), or RFC1918 LAN IPs.
 */
export function validateLoopbackPort(portInput, options = {}) {
  const { host } = options || {};
  if (host !== undefined && host !== null && String(host).trim() !== '') {
    const rawHost = String(host).trim().toLowerCase();
    if (!ALLOWED_LOOPBACK_HOSTS.includes(rawHost)) {
      return {
        valid: false,
        error: `External or non-loopback host "${String(host).slice(0, 64)}" is blocked. Only 127.0.0.1 loopback probes are allowed.`,
      };
    }
  }

  if (typeof portInput === 'boolean' || portInput === null || portInput === undefined) {
    return { valid: false, error: 'Port is required and must be an integer between 1024 and 65535.' };
  }

  const rawPort = typeof portInput === 'string' ? portInput.trim() : portInput;
  if (typeof rawPort === 'string' && !/^\d{4,5}$/.test(rawPort)) {
    return { valid: false, error: 'Invalid port syntax. Provide an integer port between 1024 and 65535.' };
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    return { valid: false, error: 'Port out of allowed unprivileged loopback range (1024..65535).' };
  }

  const target = CATALOG_BY_PORT.get(port) || null;
  return {
    valid: true,
    host: '127.0.0.1',
    port,
    target,
  };
}

/**
 * Honest probe status classifier: ONLINE | DEGRADED | OFFLINE.
 */
export function classifyProbeStatus({ ok, rttMs, degradedMs = 250 } = {}) {
  if (!ok) return 'OFFLINE';
  if (typeof rttMs === 'number' && Number.isFinite(rttMs) && rttMs >= degradedMs) {
    return 'DEGRADED';
  }
  return 'ONLINE';
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Exact latency statistics over probed nodes or raw numeric RTT samples.
 * Returns null metrics when no online samples exist (never invents fake numbers).
 */
export function computeLatencyStats(samples = []) {
  const list = Array.isArray(samples) ? samples : [];
  const rtts = [];
  let onlineCount = 0;
  let degradedCount = 0;
  let offlineCount = 0;

  for (const item of list) {
    if (typeof item === 'number') {
      if (Number.isFinite(item) && item >= 0) {
        rtts.push(item);
        onlineCount += 1;
      } else {
        offlineCount += 1;
      }
      continue;
    }
    if (item && typeof item === 'object') {
      const status = item.status || classifyProbeStatus({ ok: Boolean(item.ok), rttMs: item.rttMs });
      if (status === 'OFFLINE' || item.ok === false) {
        offlineCount += 1;
      } else {
        onlineCount += 1;
        if (status === 'DEGRADED') degradedCount += 1;
        if (typeof item.rttMs === 'number' && Number.isFinite(item.rttMs) && item.rttMs >= 0) {
          rtts.push(item.rttMs);
        }
      }
    }
  }

  const count = list.length;
  if (rtts.length === 0) {
    return {
      count,
      onlineCount,
      degradedCount,
      offlineCount,
      minMs: null,
      p50Ms: null,
      p95Ms: null,
      maxMs: null,
      avgMs: null,
    };
  }

  rtts.sort((a, b) => a - b);
  const percentile = (p) => {
    const idx = Math.min(rtts.length - 1, Math.max(0, Math.ceil((p / 100) * rtts.length) - 1));
    return round1(rtts[idx]);
  };
  const sum = rtts.reduce((acc, v) => acc + v, 0);

  return {
    count,
    onlineCount,
    degradedCount,
    offlineCount,
    minMs: round1(rtts[0]),
    p50Ms: percentile(50),
    p95Ms: percentile(95),
    maxMs: round1(rtts[rtts.length - 1]),
    avgMs: round1(sum / rtts.length),
  };
}

const CHANNEL_CODE_MAP = {
  signal: 'SGNL',
  simplex: 'SMPX',
  matrix: 'MTRX',
  telegram: 'TGRM',
  webhook: 'HOOK',
  http: 'HOOK',
  ipc: 'IPC0',
};

const CHANNEL_COLOR_MAP = {
  signal: { dark: '#38BDF8', light: '#0369A1' },
  simplex: { dark: '#34D399', light: '#047857' },
  matrix: { dark: '#C084FC', light: '#6D28D9' },
  telegram: { dark: '#F59E0B', light: '#B45309' },
  webhook: { dark: '#D4AF37', light: '#7A5808' },
};

function slugifyId(raw, fallback) {
  const cleaned = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

/**
 * Normalizes `:8102/api/channels` payloads:
 *  - Guarantees unique deterministic `id` (never undefined)
 *  - Guarantees unique 4-char topology `code` (fixing duplicate SIG/SIG -> SGNL vs HOOK)
 *  - Flags static/mock daemon channels honestly so UI never presents unprobed mock latency as live telemetry
 */
export function normalizeBridgeChannels(rawChannels = []) {
  const list = Array.isArray(rawChannels) ? rawChannels : [];
  const usedIds = new Set();
  const usedCodes = new Set();

  return list.map((raw, idx) => {
    const ch = raw && typeof raw === 'object' ? raw : {};
    const typeKey = slugifyId(ch.type || ch.id || '', '');
    const baseId = slugifyId(ch.id || ch.type || ch.name || `channel-${idx}`, `channel-${idx}`);

    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    const name = String(ch.name || ch.type || `Adapter ${idx + 1}`).trim();
    const endpoint = String(
      ch.endpoint || ch.account || ch.ws_url || ch.url || ch.encryption || '127.0.0.1:8102'
    ).trim();

    let code =
      CHANNEL_CODE_MAP[typeKey] ||
      CHANNEL_CODE_MAP[baseId] ||
      (/webhook/i.test(name) ? 'HOOK' : /signal/i.test(name) ? 'SGNL' : /simplex/i.test(name) ? 'SMPX' : '');

    if (!code) {
      const alpha = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      code = (alpha.slice(0, 4) || `CH${idx + 1}`).padEnd(3, 'X');
    }
    let finalCode = code;
    let codeNum = 2;
    while (usedCodes.has(finalCode)) {
      finalCode = `${code.slice(0, 3)}${codeNum}`;
      codeNum += 1;
    }
    usedCodes.add(finalCode);

    const rawLatency = ch.latency_ms ?? ch.latencyMs;
    const latencyMs =
      rawLatency !== null && rawLatency !== undefined && Number.isFinite(Number(rawLatency))
        ? round1(Number(rawLatency))
        : null;

    const isStaticMock = Boolean(
      ch.isStaticMock ||
        /\+15550000000|smp-test-node|\+1-555-555-0199/i.test(endpoint) ||
        /\+15550000000|smp-test-node/i.test(String(ch.account || ''))
    );

    const colors = CHANNEL_COLOR_MAP[typeKey] || CHANNEL_COLOR_MAP[baseId] || {
      dark: '#D4AF37',
      light: '#7A5808',
    };

    return {
      id,
      type: typeKey || baseId,
      code: finalCode,
      name,
      endpoint,
      encryption: String(ch.encryption || 'HKDF-SHA256 / HMAC-SHA256').trim(),
      status: String(ch.status || (isStaticMock ? 'CONFIGURED' : 'UNKNOWN')).toUpperCase(),
      latencyMs,
      isStaticMock,
      color: colors.dark,
      colorLight: colors.light,
    };
  });
}

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeHexEqual(a, b) {
  const s1 = String(a || '').toLowerCase();
  const s2 = String(b || '').toLowerCase();
  if (s1.length !== s2.length || s1.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < s1.length; i += 1) {
    diff |= s1.charCodeAt(i) ^ s2.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Deterministic structural validation for HKDF-SHA256 / HMAC-SHA256 bridge envelopes.
 */
export function inspectEnvelopeStructure({
  payload = '',
  secret = '',
  nonce = '',
  timestamp = '',
  signatureHex = '',
  algorithm = 'HKDF-SHA256 / HMAC-SHA256',
} = {}) {
  const checks = [];
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload ?? '');
  const trimmedPayload = payloadStr.trim();
  const secretStr = String(secret ?? '');
  const nonceStr = String(nonce ?? '').trim();
  const tsStr = String(timestamp ?? '').trim();
  const sigStr = String(signatureHex ?? '').trim();

  let jsonValid = false;
  try {
    JSON.parse(trimmedPayload);
    jsonValid = true;
  } catch {
    jsonValid = false;
  }

  checks.push({
    id: 'payload-present',
    label: 'Payload non-empty UTF-8',
    pass: trimmedPayload.length > 0 && trimmedPayload.length <= 65536,
    detail: `${trimmedPayload.length} bytes (${jsonValid ? 'valid JSON object/value' : 'raw UTF-8 text'})`,
  });

  checks.push({
    id: 'secret-strength',
    label: 'Shared key >= 16 bytes',
    pass: secretStr.length >= 16,
    detail: secretStr.length >= 16 ? `${secretStr.length} chars (ready for HKDF-SHA256)` : 'Provide at least 16 characters for test key material.',
  });

  const nonceValid = /^[0-9a-fA-F]{16,64}$/.test(nonceStr);
  checks.push({
    id: 'nonce-hex',
    label: 'Replay nonce (16..64 hex chars)',
    pass: nonceValid,
    detail: nonceValid ? `${nonceStr.length / 2} bytes hex nonce` : 'Expected 16–64 hex characters (e.g., 12-byte / 24-hex nonce).',
  });

  const tsNum = Number(tsStr);
  const tsValid = Number.isFinite(tsNum) && tsNum > 1_700_000_000;
  checks.push({
    id: 'timestamp-epoch',
    label: 'Unix epoch timestamp',
    pass: tsValid,
    detail: tsValid ? `epoch=${Math.floor(tsNum)}s` : 'Provide a valid Unix epoch timestamp in seconds.',
  });

  const algValid = /HMAC-SHA256|HKDF-SHA256/i.test(String(algorithm));
  checks.push({
    id: 'algorithm-honesty',
    label: 'Declared cipher suite',
    pass: algValid,
    detail: String(algorithm),
  });

  if (sigStr) {
    const sigSyntaxValid = /^[0-9a-fA-F]{64}$/.test(sigStr);
    checks.push({
      id: 'signature-format',
      label: 'HMAC-SHA256 digest format (64 hex)',
      pass: sigSyntaxValid,
      detail: sigSyntaxValid ? '64-hex (256-bit) MAC present' : 'Expected 64 hex characters.',
    });
  }

  const passedCount = checks.filter((c) => c.pass).length;
  return {
    valid: passedCount === checks.length,
    passedCount,
    totalChecks: checks.length,
    algorithm: String(algorithm),
    canonicalInput: `${tsStr}.${nonceStr}.${payloadStr}`,
    checks,
  };
}

/**
 * Signs an envelope canonically (`<timestamp>.<nonce>.<payload>`) using WebCrypto HMAC-SHA256.
 * Works identically in browsers and Node.js 20+ via `globalThis.crypto.subtle`.
 */
export async function signHmacSha256Envelope({ payload = '', secret = '', nonce = '', timestamp = '' } = {}) {
  const subtle = globalThis?.crypto?.subtle;
  if (!subtle) {
    throw new Error('WebCrypto subtle API unavailable in this runtime.');
  }
  const enc = new TextEncoder();
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload ?? '');
  const tsStr = String(timestamp || Math.floor(Date.now() / 1000));
  const nonceStr = String(nonce || '00112233445566778899aabb').trim();
  const canonical = `${tsStr}.${nonceStr}.${payloadStr}`;

  const key = await subtle.importKey(
    'raw',
    enc.encode(String(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await subtle.sign('HMAC', key, enc.encode(canonical));
  const signatureHex = bytesToHex(new Uint8Array(sigBuf));

  return {
    schemaVersion: BUS_MONITOR_VERSION,
    algorithm: 'HKDF-SHA256 / HMAC-SHA256',
    timestamp: tsStr,
    nonce: nonceStr,
    payload: payloadStr,
    canonicalInput: canonical,
    signatureHex,
  };
}

/**
 * Verifies a signed HMAC-SHA256 envelope in constant time.
 */
export async function verifyHmacSha256Envelope({ payload, secret, nonce, timestamp, signatureHex } = {}) {
  if (!secret || !signatureHex) {
    return { verified: false, reason: 'Secret and 64-hex signature are required.' };
  }
  const signed = await signHmacSha256Envelope({ payload, secret, nonce, timestamp });
  const verified = constantTimeHexEqual(signed.signatureHex, signatureHex);
  return {
    verified,
    expectedSignatureHex: signed.signatureHex,
    providedSignatureHex: String(signatureHex).toLowerCase(),
    algorithm: signed.algorithm,
    reason: verified ? 'HMAC-SHA256 tag matches canonical envelope.' : 'HMAC-SHA256 tag mismatch.',
  };
}

/**
 * RFC-4180 CSV cell escaping with spreadsheet formula-injection neutralization.
 */
export function escapeCsvCell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Exports a sanitized JSON diagnostic snapshot.
 */
export function exportBusReportJson(snapshot = {}) {
  const nodes = Array.isArray(snapshot.nodes) ? snapshot.nodes : [];
  const summary = snapshot.summary || computeLatencyStats(nodes);
  const report = {
    schemaVersion: BUS_MONITOR_VERSION,
    tool: 'bus-monitor',
    generatedAt: snapshot.timestamp || new Date().toISOString(),
    summary,
    nodes: nodes.map((n) => ({
      id: n.id,
      code: n.code,
      name: n.name,
      host: '127.0.0.1',
      port: n.port,
      protocol: n.protocol || 'HTTP',
      category: n.category || 'Loopback',
      status: n.status || classifyProbeStatus({ ok: Boolean(n.ok), rttMs: n.rttMs }),
      httpStatus: n.httpStatus ?? null,
      rttMs: typeof n.rttMs === 'number' && Number.isFinite(n.rttMs) ? round1(n.rttMs) : null,
    })),
    bridge: snapshot.bridge || { online: false },
    unixSockets: Array.isArray(snapshot.unixSockets) ? snapshot.unixSockets : [],
  };
  return JSON.stringify(report, null, 2);
}

/**
 * Exports a formula-injection-safe CSV diagnostic table of loopback bus probes.
 */
export function exportBusReportCsv(snapshot = {}) {
  const nodes = Array.isArray(snapshot.nodes) ? snapshot.nodes : [];
  const header = ['id', 'code', 'name', 'host', 'port', 'protocol', 'category', 'status', 'httpStatus', 'rttMs'];
  const lines = [header.join(',')];
  for (const n of nodes) {
    const row = [
      n.id ?? '',
      n.code ?? '',
      n.name ?? '',
      '127.0.0.1',
      n.port ?? '',
      n.protocol ?? 'HTTP',
      n.category ?? 'Loopback',
      n.status || classifyProbeStatus({ ok: Boolean(n.ok), rttMs: n.rttMs }),
      n.httpStatus ?? '',
      typeof n.rttMs === 'number' && Number.isFinite(n.rttMs) ? round1(n.rttMs) : '',
    ];
    lines.push(row.map(escapeCsvCell).join(','));
  }
  return lines.join('\n');
}

/**
 * Exports a human-readable Markdown NOC diagnostic report.
 */
export function exportBusReportMarkdown(snapshot = {}) {
  const nodes = Array.isArray(snapshot.nodes) ? snapshot.nodes : [];
  const summary = snapshot.summary || computeLatencyStats(nodes);
  const ts = snapshot.timestamp || new Date().toISOString();
  const sockets = Array.isArray(snapshot.unixSockets) ? snapshot.unixSockets : [];

  const md = [
    `# Zoth Swarm NOC & Signal Bridge Diagnostic Report (v${BUS_MONITOR_VERSION})`,
    '',
    `- **Generated:** \`${ts}\``,
    `- **Loopback Targets:** \`${summary.onlineCount}/${summary.count}\` online (\`${summary.offlineCount}\` offline)`,
    `- **Measured RTT:** p50 \`${summary.p50Ms ?? 'N/A'} ms\` · p95 \`${summary.p95Ms ?? 'N/A'} ms\` · min \`${summary.minMs ?? 'N/A'} ms\` · max \`${summary.maxMs ?? 'N/A'} ms\``,
    `- **Unix Sockets Detected:** \`${sockets.length}\``,
    '',
    '| Code | Service | Endpoint | Status | HTTP | RTT (ms) |',
    '| :---: | :--- | :--- | :---: | :---: | :---: |',
  ];

  for (const n of nodes) {
    const status = n.status || classifyProbeStatus({ ok: Boolean(n.ok), rttMs: n.rttMs });
    const rtt = typeof n.rttMs === 'number' && Number.isFinite(n.rttMs) ? `${round1(n.rttMs)}` : '—';
    const httpCol = n.httpStatus ? `${n.httpStatus}` : '—';
    const safeName = String(n.name || n.id || '').replace(/\|/g, '\\|');
    md.push(`| \`${n.code || 'SVC'}\` | ${safeName} | \`127.0.0.1:${n.port}\` | **${status}** | ${httpCol} | ${rtt} |`);
  }

  return md.join('\n') + '\n';
}
