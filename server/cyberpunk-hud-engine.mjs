/**
 * Zoth Studio v2 — Cyberpunk Telemetry HUD Engine (Pure JS, Zero Dependencies)
 * Canonical client module mirrored byte-identically at server/cyberpunk-hud-engine.mjs.
 *
 * Capabilities:
 *  - Exact Shannon Entropy & Byte-Distribution Analyzer: H = -sum(p_i * log2(p_i)) bits/byte
 *  - Deterministic synchronous FIPS 180-4 SHA-256 frame fingerprinting (browser & Node identical)
 *  - Live host, daemon & loopback fleet telemetry aggregator with sorted p50/p95/max RTT percentiles
 *  - Strict host home-path redaction (/home/<user>, /Users/<user>, file:///home/<user> -> ~) & secret scrubbing
 *  - Honest 100% in-browser offline telemetry fallback (BROWSER_OFFLINE_FALLBACK, zero Math.random())
 *  - Sanitized JSON, Markdown, and formula-injection-neutralized CSV diagnostic snapshot exporters
 */

export const CYBERPUNK_HUD_SCHEMA_VERSION = '2.3.0';

const HOME_URI_RE = /file:\/\/\/(?:home|Users)\/[A-Za-z0-9._-]+\/?/gi;
const HOME_PATH_RE = /\/(?:home|Users)\/[A-Za-z0-9._-]+(?=\/|$|[\s"'`,;:)\]}])/g;
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SECRET_RE = /\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{20,}|xox[baprs]-[A-Za-z0-9-]{16,}|AKIA[0-9A-Z]{16})\b/g;

export const ENTROPY_SAMPLE_PACKETS = Object.freeze([
  {
    id: 'structured-json',
    label: 'Telemetry JSON Frame',
    description: 'Typical structured JSON telemetry packet (~4.2–4.8 bits/byte).',
    payload: JSON.stringify(
      {
        version: '2.3.0',
        mode: 'LIVE_HOST_TELEMETRY',
        host: { cpuPct: 24.5, loadavg: [1.42, 1.18, 0.96], ramUsedPct: 48.2, maxTempC: 54.0 },
        fleet: { total: 88, live: 33, dark: 55, p50Ms: 2.4, p95Ms: 11.8 },
        bind: '127.0.0.1:3000',
      },
      null,
      2
    ),
  },
  {
    id: 'zero-padding',
    label: 'Repeating Frame (0.0 bits/B)',
    description: 'Uniform single-symbol payload proving exact 0.0000 bits/byte floor.',
    payload: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  {
    id: 'binary-alternation',
    label: 'Binary Signal (1.0 bits/B)',
    description: 'Balanced 2-symbol alternating stream proving exact 1.0000 bits/byte.',
    payload: '0101010101010101010101010101010101010101010101010101010101010101',
  },
  {
    id: 'hex-loopback-log',
    label: 'Loopback Packet Log',
    description: 'Dense loopback socket & daemon heartbeat trace with hex digests.',
    payload: [
      'ts=2026-11-26T19:20:00Z src=127.0.0.1:3000 dst=127.0.0.1:8094 rtt_ms=1.8 status=200 frame=9f86d081884c',
      'ts=2026-11-26T19:20:00Z src=127.0.0.1:3000 dst=127.0.0.1:8102 rtt_ms=2.3 status=200 frame=6b86b273ff34',
      'ts=2026-11-26T19:20:00Z src=127.0.0.1:3000 dst=127.0.0.1:11434 rtt_ms=4.1 status=200 frame=d4735e3a265e',
      'ts=2026-11-26T19:20:00Z src=127.0.0.1:3000 dst=127.0.0.1:18000 rtt_ms=3.6 status=200 frame=4e07408562be',
    ].join('\n'),
  },
  {
    id: 'high-entropy-digest',
    label: 'High-Entropy Digest Stream',
    description: 'High-dispersion ASCII-85 / Base64-like ciphertext block (~5.9+ bits/byte).',
    payload: '9fK2!xQ7#mZ4$vL8@pR1%tW6^yN3&bJ5*cD0(eF-gH+jK=lM[nP]qS{uV}wX|zA~B2C4E6G8I0K1M3O5Q7S9U!W#Y$a%c^e&g*i(k)m-o+q=s[u]w{y}0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  },
]);

// ============================================================================
// 1. STRICT HOME-PATH REDACTION & SANITIZATION
// ============================================================================

export function redactHomePaths(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(CTRL_RE, '')
    .replace(HOME_URI_RE, (m) => (m.endsWith('/') ? '~/' : '~'))
    .replace(HOME_PATH_RE, '~')
    .replace(SECRET_RE, '[REDACTED_SECRET]');
}

export function redactPayload(value) {
  if (typeof value === 'string') return redactHomePaths(value);
  if (Array.isArray(value)) return value.map((item) => redactPayload(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[redactHomePaths(k)] = redactPayload(v);
    }
    return out;
  }
  return value;
}

// ============================================================================
// 2. PURE-JS FIPS 180-4 SHA-256 (Synchronous, Browser & Node Byte-Identical)
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

function toUtf8Bytes(input) {
  if (input instanceof Uint8Array) return input;
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  const str = String(input ?? '');
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const encoded = unescape(encodeURIComponent(str));
  const out = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i += 1) {
    out[i] = encoded.charCodeAt(i);
  }
  return out;
}

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Hex(input) {
  const msg = toUtf8Bytes(input);
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
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
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

    for (let i = 0; i < 64; i += 1) {
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

// ============================================================================
// 3. EXACT SHANNON ENTROPY & BYTE-DISTRIBUTION ANALYZER
// ============================================================================

function clampNum(v, min, max, fallback = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function round1(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function round2(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function round4(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10000) / 10000 : 0;
}

export function classifyEntropyTier(entropyBitsPerByte, byteLength) {
  if (!byteLength || byteLength <= 0) return 'EMPTY_FRAME';
  if (entropyBitsPerByte >= 7.2) return 'HIGH_ENTROPY_ANOMALY';
  if (entropyBitsPerByte >= 5.2) return 'COMPRESSED_OR_CIPHERTEXT';
  if (entropyBitsPerByte >= 3.5) return 'TELEMETRY_DENSE';
  return 'STRUCTURED_TEXT';
}

function formatByteLabel(byte) {
  if (byte === 0x20) return 'SP';
  if (byte === 0x0a) return 'LF';
  if (byte === 0x0d) return 'CR';
  if (byte === 0x09) return 'TAB';
  if (byte >= 0x21 && byte <= 0x7e) return String.fromCharCode(byte);
  return `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`;
}

export function computeShannonEntropy(input) {
  const bytes = toUtf8Bytes(input);
  const byteLength = bytes.length;
  const sha256 = sha256Hex(bytes);

  if (byteLength === 0) {
    return {
      byteLength: 0,
      uniqueSymbols: 0,
      entropyBitsPerByte: 0,
      efficiencyPct: 0,
      tier: 'EMPTY_FRAME',
      topBytes: [],
      sha256,
    };
  }

  const freq = new Uint32Array(256);
  for (let i = 0; i < byteLength; i += 1) {
    freq[bytes[i]] += 1;
  }

  let entropy = 0;
  let uniqueSymbols = 0;
  const entries = [];
  for (let b = 0; b < 256; b += 1) {
    const count = freq[b];
    if (count > 0) {
      uniqueSymbols += 1;
      const p = count / byteLength;
      entropy -= p * Math.log2(p);
      entries.push({
        byte: b,
        hex: `0x${b.toString(16).padStart(2, '0').toUpperCase()}`,
        label: formatByteLabel(b),
        count,
        ratioPct: round2(p * 100),
      });
    }
  }

  entries.sort((a, b) => b.count - a.count || a.byte - b.byte);
  const clampedEntropy = Math.max(0, Math.min(8, entropy));
  const entropyBitsPerByte = round4(clampedEntropy);
  const efficiencyPct = round2((clampedEntropy / 8) * 100);

  return {
    byteLength,
    uniqueSymbols,
    entropyBitsPerByte,
    efficiencyPct,
    tier: classifyEntropyTier(entropyBitsPerByte, byteLength),
    topBytes: entries.slice(0, 12),
    sha256,
  };
}

// ============================================================================
// 4. LATENCY PERCENTILE & TELEMETRY NORMALIZATION
// ============================================================================

export function computeLatencyPercentiles(values = []) {
  const sorted = (Array.isArray(values) ? values : [])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v >= 0)
    .sort((a, b) => a - b);

  const count = sorted.length;
  if (count === 0) {
    return { count: 0, min: 0, p50: 0, p95: 0, max: 0, avg: 0 };
  }

  const atPercentile = (p) => {
    const idx = Math.min(count - 1, Math.max(0, Math.ceil((p / 100) * count) - 1));
    return sorted[idx];
  };

  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    count,
    min: round2(sorted[0]),
    p50: round2(atPercentile(50)),
    p95: round2(atPercentile(95)),
    max: round2(sorted[count - 1]),
    avg: round2(sum / count),
  };
}

export function formatUptime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, '0')}m`;
  return `${mins}m ${String(s % 60).padStart(2, '0')}s`;
}

export function classifyThermalBand(maxTempC) {
  if (maxTempC === null || maxTempC === undefined || !Number.isFinite(Number(maxTempC))) {
    return { state: 'UNKNOWN', critical: false };
  }
  const t = Number(maxTempC);
  if (t >= 85) return { state: 'CRITICAL', critical: true };
  if (t >= 75) return { state: 'HOT', critical: false };
  if (t >= 62) return { state: 'WARM', critical: false };
  return { state: 'COOL', critical: false };
}

function normalizeHostBlock(raw = {}) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const cores = Math.max(1, Math.floor(Number(src.cpus ?? src.cpu?.cores ?? 1) || 1));
  const rawLoad = Array.isArray(src.loadavg)
    ? src.loadavg
    : Array.isArray(src.cpu?.loadavg)
    ? src.cpu.loadavg
    : [0, 0, 0];
  const loadavg = [
    round2(clampNum(rawLoad[0], 0, 1024, 0)),
    round2(clampNum(rawLoad[1], 0, 1024, 0)),
    round2(clampNum(rawLoad[2], 0, 1024, 0)),
  ];
  const cpuPct = round1(clampNum(src.cpuPct ?? src.cpu?.pct ?? 0, 0, 100, 0));

  const totalMiB = Math.max(0, Math.round(Number(src.totalMem ?? src.memory?.totalMiB ?? 0) || 0));
  const freeMiB = Math.max(0, Math.round(Number(src.freeMem ?? src.memory?.freeMiB ?? 0) || 0));
  const usedMiB = Math.max(
    0,
    src.memory?.usedMiB !== undefined ? Math.round(Number(src.memory.usedMiB) || 0) : totalMiB - freeMiB
  );
  const memUsedPct = totalMiB > 0 ? round1(clampNum((usedMiB / totalMiB) * 100, 0, 100, 0)) : 0;

  const rawDisk = src.disk && typeof src.disk === 'object' ? src.disk : {};
  const diskTotalGiB = round2(Math.max(0, Number(rawDisk.totalGiB ?? 0) || 0));
  const diskFreeGiB = round2(Math.max(0, Number(rawDisk.freeGiB ?? 0) || 0));
  const diskUsedGiB = round2(
    Math.max(0, rawDisk.usedGiB !== undefined ? Number(rawDisk.usedGiB) || 0 : diskTotalGiB - diskFreeGiB)
  );
  const diskUsedPct =
    diskTotalGiB > 0 ? round1(clampNum((diskUsedGiB / diskTotalGiB) * 100, 0, 100, 0)) : 0;

  const rawZones = Array.isArray(src.thermal?.zones)
    ? src.thermal.zones
    : Array.isArray(src.thermalZones)
    ? src.thermalZones
    : [];
  const zones = rawZones
    .map((z, i) => {
      const tempVal = Number(z?.tempC);
      if (!Number.isFinite(tempVal) || tempVal < -30 || tempVal > 150) return null;
      return {
        name: redactHomePaths(z?.name || `thermal_zone${i}`),
        type: redactHomePaths(z?.type || 'sensor'),
        tempC: round1(tempVal),
      };
    })
    .filter(Boolean);

  const temps = zones.map((z) => z.tempC);
  const minTempC = temps.length > 0 ? round1(Math.min(...temps)) : null;
  const maxTempC = temps.length > 0 ? round1(Math.max(...temps)) : null;
  const avgTempC =
    temps.length > 0 ? round1(temps.reduce((acc, v) => acc + v, 0) / temps.length) : null;
  const thermalBand = classifyThermalBand(maxTempC);

  let gpu = null;
  if (src.gpu && typeof src.gpu === 'object' && src.gpu.name) {
    const gUsed = Math.max(0, Math.round(Number(src.gpu.memoryUsedMiB ?? 0) || 0));
    const gTotal = Math.max(0, Math.round(Number(src.gpu.memoryTotalMiB ?? 0) || 0));
    gpu = {
      name: redactHomePaths(src.gpu.name),
      tempC: Number.isFinite(Number(src.gpu.tempC)) ? round1(Number(src.gpu.tempC)) : null,
      utilizationPct: Number.isFinite(Number(src.gpu.utilizationPct))
        ? round1(clampNum(src.gpu.utilizationPct, 0, 100, 0))
        : null,
      memoryUsedMiB: gUsed,
      memoryTotalMiB: gTotal,
      memoryPct: gTotal > 0 ? round1(clampNum((gUsed / gTotal) * 100, 0, 100, 0)) : 0,
    };
  }

  const audio =
    src.audio && typeof src.audio === 'object'
      ? {
          subsystem: redactHomePaths(src.audio.subsystem || 'Unavailable'),
          device: redactHomePaths(src.audio.device || 'No local audio subsystem detected'),
          detected: Boolean(src.audio.detected),
        }
      : {
          subsystem: src.audioDevice ? 'Detected' : 'Unavailable',
          device: redactHomePaths(src.audioDevice || 'No local audio subsystem detected'),
          detected: Boolean(src.audioDevice),
        };

  const uptimeSec = Math.max(0, Math.round(Number(src.uptime ?? src.uptimeSec ?? 0) || 0));

  return {
    isZothOS: Boolean(src.isZothOS),
    distro: redactHomePaths(src.distro || 'Linux Host'),
    release: redactHomePaths(src.release || ''),
    kernel: redactHomePaths(src.kernel || 'unknown'),
    arch: redactHomePaths(src.arch || 'unknown'),
    hostname: redactHomePaths(src.hostname || 'localhost'),
    cpu: {
      cores,
      model: redactHomePaths(src.cpuModel ?? src.cpu?.model ?? 'Host CPU'),
      pct: cpuPct,
      loadavg,
      loadPerCore: round2(loadavg[0] / cores),
    },
    memory: {
      totalMiB,
      freeMiB,
      usedMiB,
      usedPct: memUsedPct,
    },
    disk: {
      mount: redactHomePaths(rawDisk.mount || '/'),
      totalGiB: diskTotalGiB,
      usedGiB: diskUsedGiB,
      freeGiB: diskFreeGiB,
      usedPct: diskUsedPct,
    },
    thermal: {
      count: zones.length,
      minTempC,
      avgTempC,
      maxTempC,
      state: thermalBand.state,
      critical: thermalBand.critical,
      zones,
    },
    gpu,
    audio,
    uptimeSec,
    uptimeFormatted: formatUptime(uptimeSec),
  };
}

function normalizeDaemonsBlock(status = {}) {
  const src = status && typeof status === 'object' ? status : {};
  const svcs = src.services && typeof src.services === 'object' ? src.services : {};
  const preferredOrder = [
    { key: 'memory', fallbackName: 'Neuro-Memory Daemon', fallbackPort: 8094 },
    { key: 'bridge', fallbackName: 'Sovereign Signal Bridge', fallbackPort: 8102 },
    { key: 'vault', fallbackName: 'Zoth Vault Daemon', fallbackPort: 8787 },
    { key: 'ollama', fallbackName: 'Ollama Local LLM', fallbackPort: 11434 },
    { key: 'agy-hermes-proxy', fallbackName: 'AGY-Hermes Proxy', fallbackPort: 18000 },
    { key: 'chronicleVault', fallbackName: 'Chronicle Memory Vault', fallbackPort: 8161 },
    { key: 'webgen', fallbackName: 'Zoth Bolt / WebGen', fallbackPort: 5173 },
  ];

  const core = [];
  for (const spec of preferredOrder) {
    const entry = svcs[spec.key];
    if (!entry) continue;
    const up = Boolean(entry.up);
    core.push({
      id: spec.key,
      name: redactHomePaths(entry.name || spec.fallbackName),
      port: Number(entry.port || spec.fallbackPort) || spec.fallbackPort,
      up,
      status: up ? 'ONLINE' : 'OFFLINE',
      modelsCount: Array.isArray(entry.models)
        ? entry.models.length
        : Number.isFinite(Number(entry.modelsCount))
        ? Number(entry.modelsCount)
        : null,
    });
  }

  return {
    kvm: Boolean(src.kvm),
    onlineCount: core.filter((d) => d.up).length,
    totalCount: core.length,
    core,
  };
}

function normalizeFleetBlock(rawFleet = {}) {
  const src = rawFleet && typeof rawFleet === 'object' ? rawFleet : {};
  const list = Array.isArray(src.fleet)
    ? src.fleet
    : Array.isArray(src.ports)
    ? src.ports
    : Array.isArray(src.services)
    ? src.services
    : [];

  const ports = list
    .map((item) => {
      const port = Number(item?.port);
      if (!Number.isFinite(port) || port <= 0) return null;
      const up = Boolean(item?.up);
      const latencyMs = up ? round2(Math.max(0, Number(item?.latencyMs) || 0)) : 0;
      const statusCode = up ? Math.max(0, Math.round(Number(item?.statusCode) || 200)) : 0;
      const status = up ? 'LIVE' : 'DARK';
      const frameHash = sha256Hex(`${port}:${status}:${latencyMs}:${statusCode}`).slice(0, 12);
      return {
        port,
        id: redactHomePaths(item?.id || `port-${port}`),
        name: redactHomePaths(item?.name || `Service :${port}`),
        category: redactHomePaths(item?.category || 'Loopback'),
        isCore: Boolean(item?.isCore),
        up,
        status,
        latencyMs,
        statusCode,
        frameHash,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.port - b.port);

  const livePorts = ports.filter((p) => p.up);
  const total = ports.length;
  const live = livePorts.length;
  const dark = total - live;
  const latencyStats = computeLatencyPercentiles(livePorts.map((p) => p.latencyMs));

  return {
    checkedAt: redactHomePaths(src.checkedAt || new Date().toISOString()),
    total,
    live,
    dark,
    healthPct: total > 0 ? round1((live / total) * 100) : 0,
    latencyStats,
    ports,
  };
}

export function buildCyberpunkHudSnapshot({
  host = {},
  status = {},
  fleet = {},
  reality = null,
  timestamp = new Date().toISOString(),
} = {}) {
  const checkedAt = redactHomePaths(timestamp || new Date().toISOString());
  const normHost = normalizeHostBlock(host);
  const normDaemons = normalizeDaemonsBlock(status);
  const normFleet = normalizeFleetBlock(fleet);

  const canonicalFrame = JSON.stringify({
    version: CYBERPUNK_HUD_SCHEMA_VERSION,
    checkedAt,
    host: {
      cpuPct: normHost.cpu.pct,
      loadavg: normHost.cpu.loadavg,
      memUsedPct: normHost.memory.usedPct,
      diskUsedPct: normHost.disk.usedPct,
      maxTempC: normHost.thermal.maxTempC,
      gpuTempC: normHost.gpu?.tempC ?? null,
    },
    daemons: {
      kvm: normDaemons.kvm,
      onlineCount: normDaemons.onlineCount,
      totalCount: normDaemons.totalCount,
      states: normDaemons.core.map((d) => `${d.id}:${d.port}:${d.up ? 1 : 0}`),
    },
    fleet: {
      live: normFleet.live,
      dark: normFleet.dark,
      total: normFleet.total,
      latencyStats: normFleet.latencyStats,
      liveFrames: normFleet.ports.filter((p) => p.up).map((p) => `${p.port}:${p.latencyMs}:${p.frameHash}`),
    },
  });

  const entropy = computeShannonEntropy(canonicalFrame);

  return redactPayload({
    version: CYBERPUNK_HUD_SCHEMA_VERSION,
    schemaVersion: CYBERPUNK_HUD_SCHEMA_VERSION,
    mode: 'LIVE_HOST_TELEMETRY',
    checkedAt,
    host: normHost,
    daemons: normDaemons,
    fleet: normFleet,
    entropy,
    frameReceipt: {
      algorithm: 'SHA-256 (FIPS 180-4)',
      sha256: entropy.sha256,
      packetBytes: entropy.byteLength,
      generatedAt: checkedAt,
      deterministic: true,
    },
    reality: reality
      ? {
          mode: redactHomePaths(reality.mode || 'gold'),
          allModes: Array.isArray(reality.allModes) ? reality.allModes : ['gold', 'ghost', 'matrix', 'incognito'],
        }
      : {
          mode: 'gold',
          allModes: ['gold', 'ghost', 'matrix', 'incognito'],
        },
  });
}

// ============================================================================
// 5. HONEST 100% IN-BROWSER OFFLINE TELEMETRY FALLBACK
// ============================================================================

export function buildBrowserOfflineTelemetry(nav, perf, scr) {
  const navObj = nav || (typeof navigator !== 'undefined' ? navigator : {});
  const perfObj = perf || (typeof performance !== 'undefined' ? performance : {});
  const scrObj = scr || (typeof window !== 'undefined' && window.screen ? window.screen : {});

  const checkedAt = new Date().toISOString();
  const hardwareConcurrency = Math.max(1, Number(navObj.hardwareConcurrency) || 1);
  const deviceMemoryGiB = Number.isFinite(Number(navObj.deviceMemory))
    ? Number(navObj.deviceMemory)
    : null;
  const monotonicMs =
    typeof perfObj.now === 'function' && Number.isFinite(Number(perfObj.now()))
      ? round2(Number(perfObj.now()))
      : 0;
  const screenWidth = Number(scrObj.width) || 0;
  const screenHeight = Number(scrObj.height) || 0;
  const colorDepth = Number(scrObj.colorDepth) || 24;
  const online = navObj.onLine !== undefined ? Boolean(navObj.onLine) : true;
  const language = redactHomePaths(navObj.language || 'en-US');
  const platform = redactHomePaths(navObj.userAgentData?.platform || navObj.platform || 'Browser Sandbox');

  let timezone = 'UTC';
  try {
    timezone = redactHomePaths(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  } catch {}

  const browser = {
    platform,
    hardwareConcurrency,
    deviceMemoryGiB,
    monotonicMs,
    screenResolution: screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : 'Unavailable',
    colorDepth,
    online,
    language,
    timezone,
  };

  const packet = JSON.stringify({
    version: CYBERPUNK_HUD_SCHEMA_VERSION,
    mode: 'BROWSER_OFFLINE_FALLBACK',
    checkedAt,
    browser,
  });
  const entropy = computeShannonEntropy(packet);

  return redactPayload({
    version: CYBERPUNK_HUD_SCHEMA_VERSION,
    schemaVersion: CYBERPUNK_HUD_SCHEMA_VERSION,
    mode: 'BROWSER_OFFLINE_FALLBACK',
    checkedAt,
    notice:
      'Local Zoth Studio API (127.0.0.1:3000 /api/studio/cyberpunk-hud) is unreachable. Displaying genuine browser runtime telemetry and full client-side Shannon entropy & SHA-256 inspection with zero fabricated host temperatures or fake port scans.',
    browser,
    host: null,
    daemons: {
      kvm: false,
      onlineCount: 0,
      totalCount: 0,
      core: [],
    },
    fleet: {
      checkedAt,
      total: 0,
      live: 0,
      dark: 0,
      healthPct: 0,
      latencyStats: { count: 0, min: 0, p50: 0, p95: 0, max: 0, avg: 0 },
      ports: [],
    },
    entropy,
    frameReceipt: {
      algorithm: 'SHA-256 (FIPS 180-4)',
      sha256: entropy.sha256,
      packetBytes: entropy.byteLength,
      generatedAt: checkedAt,
      deterministic: true,
    },
    reality: {
      mode: 'browser',
      allModes: ['gold', 'ghost', 'matrix', 'incognito'],
    },
  });
}

// ============================================================================
// 6. SANITIZED DIAGNOSTIC EXPORTERS (JSON / MARKDOWN / FORMULA-SAFE CSV)
// ============================================================================

export function neutralizeCsvCell(value) {
  const clean = redactHomePaths(value);
  const formulaSafe = /^[=+\-@\t\r]/.test(clean) ? `'${clean}` : clean;
  if (/[",\r\n]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }
  return formulaSafe;
}

export function exportHudJson(snapshot = {}) {
  const safe = redactPayload({
    version: snapshot.version || CYBERPUNK_HUD_SCHEMA_VERSION,
    mode: snapshot.mode || 'BROWSER_OFFLINE_FALLBACK',
    checkedAt: snapshot.checkedAt || new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    host: snapshot.host || null,
    browser: snapshot.browser || null,
    daemons: snapshot.daemons || null,
    fleet: snapshot.fleet || null,
    entropy: snapshot.entropy || null,
    frameReceipt: snapshot.frameReceipt || null,
  });
  return JSON.stringify(safe, null, 2);
}

export function exportHudMarkdown(snapshot = {}) {
  const safe = redactPayload(snapshot || {});
  const lines = [
    '# Cyberpunk Telemetry HUD Cockpit — Diagnostic Snapshot',
    '',
    `- **Version:** ${safe.version || CYBERPUNK_HUD_SCHEMA_VERSION}`,
    `- **Mode:** ${safe.mode || 'BROWSER_OFFLINE_FALLBACK'}`,
    `- **Checked At:** ${safe.checkedAt || new Date().toISOString()}`,
    `- **Frame SHA-256:** ${safe.frameReceipt?.sha256 || safe.entropy?.sha256 || 'unavailable'}`,
    `- **Telemetry Packet Shannon Entropy:** ${safe.entropy?.entropyBitsPerByte ?? 0} bits/byte (${safe.entropy?.efficiencyPct ?? 0}% · ${safe.entropy?.tier || 'EMPTY_FRAME'})`,
    '',
  ];

  if (safe.host) {
    const h = safe.host;
    lines.push('## Live Host Telemetry');
    lines.push(`- **OS / Kernel:** ${h.distro} (${h.kernel} · ${h.arch})`);
    lines.push(`- **CPU:** ${h.cpu?.model || 'Host CPU'} (${h.cpu?.cores || 1} cores) — ${h.cpu?.pct ?? 0}% · LoadAvg: ${(h.cpu?.loadavg || [0, 0, 0]).join(', ')}`);
    lines.push(`- **Memory:** ${h.memory?.usedMiB ?? 0} / ${h.memory?.totalMiB ?? 0} MiB (${h.memory?.usedPct ?? 0}%)`);
    lines.push(`- **Root Disk (${h.disk?.mount || '/'}):** ${h.disk?.usedGiB ?? 0} / ${h.disk?.totalGiB ?? 0} GiB (${h.disk?.usedPct ?? 0}%)`);
    lines.push(
      `- **Thermal Zones (${h.thermal?.count ?? 0}):** min ${h.thermal?.minTempC ?? 'N/A'}°C · avg ${h.thermal?.avgTempC ?? 'N/A'}°C · max ${h.thermal?.maxTempC ?? 'N/A'}°C (${h.thermal?.state || 'UNKNOWN'})`
    );
    lines.push(
      `- **GPU:** ${h.gpu ? `${h.gpu.name} (${h.gpu.tempC ?? 'N/A'}°C · ${h.gpu.memoryUsedMiB}/${h.gpu.memoryTotalMiB} MiB)` : 'Not detected'}`
    );
    lines.push(`- **Audio:** ${h.audio?.subsystem || 'Unavailable'} — ${h.audio?.device || 'None'}`);
    lines.push('');
  } else if (safe.browser) {
    const b = safe.browser;
    lines.push('## Browser Offline Telemetry Fallback');
    lines.push(`- **Platform:** ${b.platform}`);
    lines.push(`- **Hardware Concurrency:** ${b.hardwareConcurrency} thread(s)`);
    lines.push(`- **Device Memory:** ${b.deviceMemoryGiB ? `${b.deviceMemoryGiB} GiB` : 'Not exposed'}`);
    lines.push(`- **Display & Clock:** ${b.screenResolution} (${b.colorDepth}-bit) · performance.now() ${b.monotonicMs} ms`);
    lines.push(`- **Online / Locale / TZ:** ${b.online ? 'online' : 'offline'} · ${b.language} · ${b.timezone}`);
    lines.push('');
  }

  if (safe.daemons && Array.isArray(safe.daemons.core) && safe.daemons.core.length > 0) {
    lines.push(`## Core Daemons (${safe.daemons.onlineCount}/${safe.daemons.totalCount} ONLINE · KVM ${safe.daemons.kvm ? 'UP' : 'OFF'})`);
    for (const d of safe.daemons.core) {
      lines.push(`- **${d.name}** (:${d.port}): ${d.status}`);
    }
    lines.push('');
  }

  const fleet = safe.fleet || { total: 0, live: 0, dark: 0, latencyStats: {}, ports: [] };
  lines.push(
    `## Loopback Fleet Stream (${fleet.live}/${fleet.total} LIVE · p50 ${fleet.latencyStats?.p50 ?? 0} ms · p95 ${fleet.latencyStats?.p95 ?? 0} ms · max ${fleet.latencyStats?.max ?? 0} ms)`
  );
  if (Array.isArray(fleet.ports) && fleet.ports.length > 0) {
    lines.push('');
    lines.push('| Port | Service | Category | Status | Latency (ms) | HTTP | Frame Hash |');
    lines.push('| ---: | :--- | :--- | :---: | ---: | ---: | :--- |');
    for (const p of fleet.ports) {
      lines.push(`| :${p.port} | ${p.name} | ${p.category} | ${p.status} | ${p.up ? p.latencyMs : 0} | ${p.statusCode} | ${p.frameHash} |`);
    }
  } else {
    lines.push('- Loopback port scan unavailable in browser offline fallback mode.');
  }

  lines.push('');
  lines.push('---');
  lines.push('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform');
  return lines.join('\n');
}

export function exportHudCsv(snapshot = {}) {
  const safe = redactPayload(snapshot || {});
  const header = ['record_type', 'id', 'name', 'category', 'status', 'port', 'latency_ms', 'status_code', 'detail'];
  const rows = [header.join(',')];

  rows.push(
    [
      neutralizeCsvCell('summary'),
      neutralizeCsvCell('cyberpunk-hud'),
      neutralizeCsvCell(safe.mode || 'BROWSER_OFFLINE_FALLBACK'),
      neutralizeCsvCell('telemetry'),
      neutralizeCsvCell(safe.entropy?.tier || 'EMPTY_FRAME'),
      neutralizeCsvCell(3000),
      neutralizeCsvCell(safe.fleet?.latencyStats?.p50 ?? 0),
      neutralizeCsvCell(200),
      neutralizeCsvCell(
        `entropy=${safe.entropy?.entropyBitsPerByte ?? 0}b/B sha256=${safe.frameReceipt?.sha256 || ''}`
      ),
    ].join(',')
  );

  for (const d of safe.daemons?.core || []) {
    rows.push(
      [
        neutralizeCsvCell('daemon'),
        neutralizeCsvCell(d.id),
        neutralizeCsvCell(d.name),
        neutralizeCsvCell('Core Daemon'),
        neutralizeCsvCell(d.status),
        neutralizeCsvCell(d.port ?? ''),
        neutralizeCsvCell(0),
        neutralizeCsvCell(d.up ? 200 : 0),
        neutralizeCsvCell(d.modelsCount !== null && d.modelsCount !== undefined ? `models=${d.modelsCount}` : ''),
      ].join(',')
    );
  }

  for (const p of safe.fleet?.ports || []) {
    rows.push(
      [
        neutralizeCsvCell('fleet_port'),
        neutralizeCsvCell(p.id),
        neutralizeCsvCell(p.name),
        neutralizeCsvCell(p.category),
        neutralizeCsvCell(p.status),
        neutralizeCsvCell(p.port),
        neutralizeCsvCell(p.latencyMs ?? 0),
        neutralizeCsvCell(p.statusCode ?? 0),
        neutralizeCsvCell(p.frameHash ?? ''),
      ].join(',')
    );
  }

  return rows.join('\n');
}
