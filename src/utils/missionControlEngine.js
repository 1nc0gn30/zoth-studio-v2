/**
 * Zoth Studio v2 — Mission Control & Fleet Dispatcher Deterministic Engine
 * Pure zero-dependency ESM module shared byte-identically between browser UI
 * (src/utils/missionControlEngine.js) and loopback Studio API (server/mission-control-engine.mjs).
 *
 * Security & Determinism Invariants:
 *  - Zero external dependencies, zero dynamic code execution, zero PRNG randomness
 *  - Strict ~/ home-path and credential/token redaction across all outputs
 *  - Kahn topological wave scheduler, cycle detection, and critical-path latency DP
 *  - Byzantine PBFT quorum verification (N >= 3f + 1, Q = 2f + 1)
 *  - Formula-safe CSV / Markdown / YAML / JSON exporters + synchronous FIPS 180-4 SHA-256 receipts
 */

export const MISSION_CONTROL_SCHEMA_VERSION = '2.5.0';

export const MISSION_PRESETS = Object.freeze([
  {
    id: 'sovereign-health-sweep',
    name: 'Sovereign Core Fleet Health Sweep',
    summary: 'Verify Studio hub, Neuro-Memory, Signal Bridge, Hermes Gateway, and Konsole Relay before operator dispatch.',
    pbft: { n: 7, f: 2 },
    stages: [
      { id: 'hub-check', name: 'Studio Loopback Hub Probe', owner: 'archon-probe', port: 3000, estimatedMs: 120, dependsOn: [], critical: true },
      { id: 'memory-check', name: 'Neuro-Memory STDP Health', owner: 'mnemosyne', port: 8094, estimatedMs: 180, dependsOn: ['hub-check'], critical: true },
      { id: 'bridge-check', name: 'Signal Bridge IPC Check', owner: 'hermes-ipc', port: 8102, estimatedMs: 160, dependsOn: ['hub-check'], critical: true },
      { id: 'konsole-check', name: 'Konsole Relay D-Bus Posture', owner: 'relay-guard', port: 8797, estimatedMs: 140, dependsOn: ['hub-check'], critical: false },
      { id: 'hermes-check', name: 'Hermes WebChat Tailnet Check', owner: 'webchat-audit', port: 8178, estimatedMs: 210, dependsOn: ['memory-check', 'bridge-check'], critical: true },
      { id: 'dossier-seal', name: 'Seal Fleet Telemetry Receipt', owner: 'quorum-seal', port: null, estimatedMs: 90, dependsOn: ['hermes-check', 'konsole-check'], critical: true },
    ],
  },
  {
    id: 'hermes-gateway-triage',
    name: 'Hermes Gateway & Subagent Incident Triage',
    summary: 'Reconcile gateway PID, cgroup RAM ceiling, state.db footprint, and WebChat token posture without restarting daemons.',
    pbft: { n: 4, f: 1 },
    stages: [
      { id: 'systemd-read', name: 'Read-Only Systemd Snapshot', owner: 'hermes-obs', port: 3000, estimatedMs: 150, dependsOn: [], critical: true },
      { id: 'webchat-stat', name: 'WebChat Token Mode Stat', owner: 'sec-auditor', port: 8178, estimatedMs: 110, dependsOn: ['systemd-read'], critical: true },
      { id: 'proxy-probe', name: 'AGY-Hermes Proxy Health', owner: 'llm-router', port: 18000, estimatedMs: 190, dependsOn: ['systemd-read'], critical: false },
      { id: 'triage-rank', name: 'Rank Advisories & Export Brief', owner: 'incident-lead', port: null, estimatedMs: 120, dependsOn: ['webchat-stat', 'proxy-probe'], critical: true },
    ],
  },
  {
    id: 'dual-org-release-gate',
    name: 'Dual-Org Build, Secret Scan & Prerender Gate',
    summary: 'Coordinate static build, Gitleaks secret sweep, route hydration check, and dual-org release manifest sealing.',
    pbft: { n: 7, f: 2 },
    stages: [
      { id: 'schema-sync', name: 'Sync Registry & Manifests', owner: 'ax-compiler', port: 3000, estimatedMs: 240, dependsOn: [], critical: true },
      { id: 'engine-test', name: 'Run Pure Engine Unit Suites', owner: 'verifier-node', port: null, estimatedMs: 650, dependsOn: ['schema-sync'], critical: true },
      { id: 'secret-scan', name: 'Zero-Leak Secret Scan', owner: 'sentinel-sec', port: null, estimatedMs: 420, dependsOn: ['schema-sync'], critical: true },
      { id: 'memory-log', name: 'Persist Chronicle Engram', owner: 'chronicle-sync', port: 8094, estimatedMs: 180, dependsOn: ['engine-test', 'secret-scan'], critical: false },
      { id: 'release-sign', name: 'Generate SHA-256 Runbook Receipt', owner: 'release-archon', port: null, estimatedMs: 110, dependsOn: ['engine-test', 'secret-scan', 'memory-log'], critical: true },
    ],
  },
  {
    id: 'byzantine-consensus-deploy',
    name: 'Byzantine Quorum Multi-Agent Dispatch',
    summary: 'Decompose operator objective into isolated parallel worker waves gated by 2f+1 verifier quorum.',
    pbft: { n: 10, f: 3 },
    stages: [
      { id: 'intent-dag', name: 'Decompose Intent into DAG', owner: 'planner-cadre', port: 3000, estimatedMs: 200, dependsOn: [], critical: true },
      { id: 'ollama-worker', name: 'Local Ollama Inference Check', owner: 'llm-cadre', port: 11434, estimatedMs: 320, dependsOn: ['intent-dag'], critical: false },
      { id: 'mux-worker', name: 'Swarm Multiplexer Liveness', owner: 'swarm-mux', port: 8141, estimatedMs: 250, dependsOn: ['intent-dag'], critical: false },
      { id: 'bridge-relay', name: 'Encrypted IPC Envelope Relay', owner: 'bridge-cadre', port: 8102, estimatedMs: 190, dependsOn: ['intent-dag'], critical: true },
      { id: 'pbft-verify', name: 'Verify 2f+1 Quorum & Seal', owner: 'pbft-arbiter', port: null, estimatedMs: 140, dependsOn: ['ollama-worker', 'mux-worker', 'bridge-relay'], critical: true },
    ],
  },
]);

const OFFLINE_BASELINE_PORTS = Object.freeze([
  { port: 3000, id: 'zoth-studio', name: 'Zoth Studio UI', category: 'Hub & Studio', isCore: true },
  { port: 8094, id: 'neuro-memory', name: 'Neuro-Memory Studio UI', category: 'Core Synaptic', isCore: true },
  { port: 8102, id: 'sovereign-bridge', name: 'Sovereign Signal Bridge', category: 'Core IPC', isCore: true },
  { port: 8141, id: 'zoth-swarm-multiplexer', name: 'Pantheon Swarm Multiplexer', category: 'Swarm Orchestration', isCore: false },
  { port: 8178, id: 'hermes-webchat', name: 'Hermes WebChat (Zoth Console)', category: 'Tailnet Agent Console', isCore: true },
  { port: 8787, id: 'zoth-vault', name: 'Zoth Vault Daemon', category: 'Security Enclave', isCore: true },
  { port: 8797, id: 'konsole-relay', name: 'Konsole Relay (KDE D-Bus)', category: 'Desktop D-Bus Relay', isCore: true },
  { port: 11434, id: 'ollama', name: 'Ollama Model Server', category: 'Core LLM', isCore: true },
  { port: 18000, id: 'agy-hermes-proxy', name: 'AGY-Hermes Proxy', category: 'Core Agent Gateway', isCore: true },
]);

/**
 * Redacts literal host home paths (/home/<user>/, /Users/<user>/) and credential/token shapes.
 */
export function redactMissionControlText(input) {
  let out = String(input ?? '');
  out = out.replace(/\/home\/[a-zA-Z0-9._-]+\//g, '~/');
  out = out.replace(/\/home\/[a-zA-Z0-9._-]+(?=$|[\s"'`),;:])/g, '~');
  out = out.replace(/\/Users\/[a-zA-Z0-9._-]+\//g, '~/');
  out = out.replace(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]');
  out = out.replace(/\b(Bearer\s+)[A-Za-z0-9._~+/-]{12,}=*/gi, '$1[REDACTED_TOKEN]');
  out = out.replace(/\b(ghp_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{16,}|xai-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16})\b/g, '[REDACTED_SECRET]');
  out = out.replace(/((?:token|api[_-]?key|secret|password|authorization)\s*[:=]\s*["']?)([^\s"',;]{8,})/gi, '$1[REDACTED]');
  return out;
}

export function redactMissionControlPayload(value, depth = 0) {
  if (depth > 16) return null;
  if (typeof value === 'string') return redactMissionControlText(value);
  if (Array.isArray(value)) return value.map((item) => redactMissionControlPayload(item, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (/^(token|secret|password|apikey|api_key|privateKey|authorization)$/i.test(k) && typeof v === 'string') {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redactMissionControlPayload(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

export function sanitizeCsvCell(val) {
  const raw = redactMissionControlText(val === null || val === undefined ? '' : String(val));
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

function escapeYamlString(val) {
  const clean = redactMissionControlText(val === null || val === undefined ? '' : String(val));
  return JSON.stringify(clean);
}

/**
 * Pure zero-dependency synchronous FIPS 180-4 SHA-256 (UTF-8 string -> 64-char lowercase hex).
 */
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
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let cp = str.charCodeAt(i);
    if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(++i);
      cp = ((cp - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
    }
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f)
      );
    }
  }
  return bytes;
}

export function sha256Hex(input) {
  const bytes = utf8ToBytes(String(input ?? ''));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
  bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let off = 0; off < bytes.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

export function computeLatencyPercentiles(values) {
  const nums = (Array.isArray(values) ? values : [])
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .sort((a, b) => a - b);

  if (nums.length === 0) {
    return { count: 0, min: 0, p50: 0, p95: 0, max: 0, avg: 0 };
  }

  const pick = (q) => {
    const idx = Math.min(nums.length - 1, Math.max(0, Math.ceil(q * nums.length) - 1));
    return Math.round(nums[idx] * 100) / 100;
  };
  const sum = nums.reduce((acc, n) => acc + n, 0);

  return {
    count: nums.length,
    min: Math.round(nums[0] * 100) / 100,
    p50: pick(0.5),
    p95: pick(0.95),
    max: Math.round(nums[nums.length - 1] * 100) / 100,
    avg: Math.round((sum / nums.length) * 100) / 100,
  };
}

export function evaluatePbftQuorum(nodeCount = 7, faultyCount = 2, liveNodes = null) {
  const n = Math.max(1, Math.min(1000, Math.floor(Number(nodeCount) || 1)));
  const f = Math.max(0, Math.min(333, Math.floor(Number(faultyCount) || 0)));
  const minNodesForF = 3 * f + 1;
  const fMax = Math.max(0, Math.floor((n - 1) / 3));
  const quorumRequired = 2 * f + 1;
  const quorumSafe = n >= minNodesForF;
  const margin = n - minNodesForF;
  const effectiveLive = liveNodes === null || liveNodes === undefined
    ? n
    : Math.max(0, Math.min(n, Math.floor(Number(liveNodes) || 0)));
  const liveMeetsQuorum = quorumSafe && effectiveLive >= quorumRequired;

  return {
    n,
    f,
    fMax,
    minNodesForF,
    quorumRequired,
    quorumSafe,
    margin,
    liveNodes: effectiveLive,
    liveMeetsQuorum,
    safetyFormula: `N=${n} ${quorumSafe ? '>=' : '<'} 3(${f})+1=${minNodesForF} · Q=2(${f})+1=${quorumRequired}`,
    livenessNote: !quorumSafe
      ? `Safety violated: need at least ${minNodesForF} nodes to tolerate f=${f} Byzantine faults (current N=${n}).`
      : liveMeetsQuorum
        ? `Quorum reachable: ${effectiveLive}/${n} active nodes satisfy Q=${quorumRequired} (tolerates up to f_max=${fMax}).`
        : `Liveness degraded: ${effectiveLive}/${n} active nodes below required quorum Q=${quorumRequired}.`,
  };
}

export function normalizeFleetSnapshot(rawFleet) {
  const rawItems = Array.isArray(rawFleet?.fleet)
    ? rawFleet.fleet
    : Array.isArray(rawFleet?.services)
      ? rawFleet.services
      : Array.isArray(rawFleet?.ports)
        ? rawFleet.ports
        : [];

  const ports = rawItems
    .filter((item) => item && Number.isFinite(Number(item.port)))
    .map((item) => {
      const latencyRaw = Number(item.latencyMs ?? item.latency ?? 0);
      const latencyMs = Number.isFinite(latencyRaw) && latencyRaw >= 0 ? Math.round(latencyRaw * 100) / 100 : 0;
      const up = Boolean(item.up);
      return {
        port: Math.floor(Number(item.port)),
        id: redactMissionControlText(item.id || `port-${item.port}`),
        name: redactMissionControlText(item.name || `Service :${item.port}`),
        category: redactMissionControlText(item.category || 'Uncategorized'),
        isCore: Boolean(item.isCore),
        up,
        status: item.status ? String(item.status) : (up ? 'live' : 'dark'),
        latencyMs,
        statusCode: Number.isFinite(Number(item.statusCode)) ? Number(item.statusCode) : (up ? 200 : 0),
        host: redactMissionControlText(item.host || '127.0.0.1'),
        tailnetOnly: Boolean(item.tailnetOnly),
        pid: Number.isFinite(Number(item.pid)) && Number(item.pid) > 0 ? Number(item.pid) : null,
      };
    })
    .sort((a, b) => a.port - b.port);

  const livePorts = ports.filter((p) => p.up);
  const darkCount = ports.length - livePorts.length;
  const latency = computeLatencyPercentiles(livePorts.map((p) => p.latencyMs));

  const catMap = new Map();
  for (const p of ports) {
    const cur = catMap.get(p.category) || { category: p.category, total: 0, live: 0, dark: 0 };
    cur.total += 1;
    if (p.up) cur.live += 1;
    else cur.dark += 1;
    catMap.set(p.category, cur);
  }
  const categories = [...catMap.values()].sort((a, b) => b.live - a.live || a.category.localeCompare(b.category));
  const availabilityPct = ports.length > 0 ? Math.round((livePorts.length / ports.length) * 1000) / 10 : 0;

  return {
    total: ports.length,
    live: livePorts.length,
    dark: darkCount,
    availabilityPct,
    latency,
    categories,
    ports,
  };
}

export function normalizeCoreDaemons(rawStatus) {
  const svcMap = rawStatus?.services && typeof rawStatus.services === 'object' ? rawStatus.services : {};
  const daemons = Object.entries(svcMap).map(([id, entry]) => {
    const obj = entry && typeof entry === 'object' ? entry : {};
    return {
      id: redactMissionControlText(id),
      name: redactMissionControlText(obj.name || id),
      port: Number.isFinite(Number(obj.port)) ? Number(obj.port) : null,
      up: Boolean(obj.up),
      status: obj.up ? 'online' : 'offline',
      detail: obj.detail ? redactMissionControlPayload(obj.detail) : null,
    };
  }).sort((a, b) => Number(b.up) - Number(a.up) || a.id.localeCompare(b.id));

  const live = daemons.filter((d) => d.up).length;
  return {
    kvm: Boolean(rawStatus?.kvm),
    total: daemons.length,
    live,
    dark: daemons.length - live,
    daemons,
  };
}

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export function buildIncidentTriage({ fleet, daemons, hermes, konsoleRelay, mode = 'LIVE_LOOPBACK' }) {
  const incidents = [];

  if (mode === 'BROWSER_OFFLINE_FALLBACK') {
    incidents.push({
      id: 'mc-offline-fallback',
      severity: 'info',
      source: 'mission-control',
      title: 'Browser Offline Fallback Active',
      detail: 'Local Studio API (127.0.0.1:3000) is not reachable from this origin. Fleet matrix and daemon checks are unprobed; Mission DAG planning, PBFT verification, and exports remain 100% functional client-side.',
      remediation: 'Run `zoth open mission-control` or `node server/serve.mjs --port 3000` on localhost for live loopback telemetry.',
    });
    return incidents;
  }

  // 1. High-priority core daemons offline
  const priorityDaemons = new Set(['memory', 'bridge', 'hermesGateway', 'hermesWebchat', 'konsoleRelay', 'agy-hermes-proxy']);
  for (const d of (daemons?.daemons || [])) {
    if (!d.up && priorityDaemons.has(d.id)) {
      incidents.push({
        id: `daemon-down-${d.id}`,
        severity: d.id === 'memory' || d.id === 'hermesGateway' ? 'critical' : 'warning',
        source: 'core-daemons',
        title: `Core daemon offline: ${d.name}${d.port ? ` (:${d.port})` : ''}`,
        detail: `Loopback health probe reported ${d.id} as inactive during Mission Control sweep.`,
        remediation: `Inspect service logs or run \`zoth status\` locally before dispatching dependent mission waves.`,
      });
    }
  }

  // 2. Hermes Gateway & WebChat advisories
  if (hermes && typeof hermes === 'object') {
    if (hermes.liveApiReachable && !hermes.active) {
      incidents.push({
        id: 'hermes-gateway-inactive',
        severity: 'critical',
        source: 'hermes-gateway',
        title: 'Hermes Agent Gateway systemd unit inactive',
        detail: `${hermes.unit || 'hermes-gateway.service'} is not active on loopback.`,
        remediation: 'Check `hermes-gateway status --json` or `systemctl --user status hermes-gateway.service`.',
      });
    }
    for (const w of (Array.isArray(hermes.warnings) ? hermes.warnings : [])) {
      incidents.push({
        id: `hermes-${w.code || 'advisory'}`,
        severity: w.severity === 'critical' ? 'critical' : w.severity === 'warning' ? 'warning' : 'info',
        source: 'hermes-gateway',
        title: redactMissionControlText(w.title || w.code || 'Hermes advisory'),
        detail: redactMissionControlText(w.detail || ''),
        remediation: redactMissionControlText(hermes.maintenanceRunbookPath ? `Review opt-in runbook: ${hermes.maintenanceRunbookPath}` : 'Run `hermes-gateway health --json`.'),
      });
    }
    const wcAdvs = Array.isArray(hermes.webchat?.advisories) ? hermes.webchat.advisories : [];
    for (const adv of wcAdvs) {
      incidents.push({
        id: `webchat-${adv.code || 'advisory'}`,
        severity: adv.severity === 'warning' ? 'warning' : 'info',
        source: 'hermes-webchat',
        title: redactMissionControlText(adv.title || adv.code || 'WebChat advisory'),
        detail: redactMissionControlText(adv.detail || ''),
        remediation: 'Run `hermes-webchat status --json` to verify Tailnet bind and 0600 token permissions.',
      });
    }
  }

  // 3. Konsole Relay status / posture
  if (konsoleRelay && typeof konsoleRelay === 'object') {
    if (!konsoleRelay.active && konsoleRelay.mode !== 'BROWSER_OFFLINE_FALLBACK') {
      incidents.push({
        id: 'konsole-relay-inactive',
        severity: 'warning',
        source: 'konsole-relay',
        title: 'Konsole Relay (:8797) inactive',
        detail: `${konsoleRelay.unit || 'konsole-relay.service'} is currently offline.`,
        remediation: 'Run `konsole-relay status --json` to verify KDE D-Bus relay status.',
      });
    }
    const tokenWeak = konsoleRelay.permissions?.tokenFile?.worldOrGroupPermissive === true
      || konsoleRelay.posture?.tokenHardened === false;
    if (tokenWeak) {
      incidents.push({
        id: 'konsole-relay-token-mode',
        severity: 'warning',
        source: 'konsole-relay',
        title: 'Konsole Relay token file permissions advisory',
        detail: 'Token file permissions are not strictly 0600.',
        remediation: 'Run `chmod 600 ~/.config/konsole-relay/token` locally.',
      });
    }
  }

  // 4. High-latency live fleet ports (>= 250 ms)
  const slowPorts = (fleet?.ports || [])
    .filter((p) => p.up && p.latencyMs >= 250)
    .sort((a, b) => b.latencyMs - a.latencyMs)
    .slice(0, 5);
  for (const sp of slowPorts) {
    incidents.push({
      id: `slow-port-${sp.port}`,
      severity: sp.latencyMs >= 800 ? 'warning' : 'info',
      source: 'fleet-rtt',
      title: `Elevated loopback latency on :${sp.port} (${sp.name})`,
      detail: `Measured loopback RTT ${sp.latencyMs} ms exceeds 250 ms operator budget.`,
      remediation: `Inspect local process load on 127.0.0.1:${sp.port}.`,
    });
  }

  // Deduplicate by id and sort deterministically by severity then id
  const seen = new Set();
  const deduped = [];
  for (const inc of incidents) {
    if (seen.has(inc.id)) continue;
    seen.add(inc.id);
    deduped.push(inc);
  }
  deduped.sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity] ?? 3;
    const sb = SEVERITY_ORDER[b.severity] ?? 3;
    if (sa !== sb) return sa - sb;
    return a.id.localeCompare(b.id);
  });
  return deduped;
}

export function buildMissionControlSnapshot({
  fleet = null,
  status = null,
  hermes = null,
  konsoleRelay = null,
  checkedAt = null,
  mode = 'LIVE_LOOPBACK',
} = {}) {
  const normFleet = normalizeFleetSnapshot(fleet);
  const normDaemons = normalizeCoreDaemons(status);
  const safeHermes = hermes ? redactMissionControlPayload(hermes) : null;
  const safeKonsole = konsoleRelay ? redactMissionControlPayload(konsoleRelay) : null;
  const triage = buildIncidentTriage({
    fleet: normFleet,
    daemons: normDaemons,
    hermes: safeHermes,
    konsoleRelay: safeKonsole,
    mode,
  });

  const criticalCount = triage.filter((i) => i.severity === 'critical').length;
  const warningCount = triage.filter((i) => i.severity === 'warning').length;
  const healthState = mode === 'BROWSER_OFFLINE_FALLBACK'
    ? 'offline-fallback'
    : criticalCount > 0
      ? 'degraded-critical'
      : warningCount > 0
        ? 'degraded-advisory'
        : 'nominal';

  const coreLiveCount = normFleet.ports.filter((p) => p.isCore && p.up).length;
  const coreTotalCount = Math.max(1, normFleet.ports.filter((p) => p.isCore).length);
  const pbftF = Math.max(0, Math.floor((coreTotalCount - 1) / 3));
  const pbft = evaluatePbftQuorum(coreTotalCount, pbftF, coreLiveCount);

  const canonicalBasis = JSON.stringify({
    schemaVersion: MISSION_CONTROL_SCHEMA_VERSION,
    mode,
    fleet: { total: normFleet.total, live: normFleet.live, dark: normFleet.dark, p50: normFleet.latency.p50, p95: normFleet.latency.p95 },
    daemons: { total: normDaemons.total, live: normDaemons.live, kvm: normDaemons.kvm },
    hermesActive: Boolean(safeHermes?.active),
    konsoleActive: Boolean(safeKonsole?.active),
    triageIds: triage.map((t) => `${t.severity}:${t.id}`),
  });

  const snapshot = {
    schemaVersion: MISSION_CONTROL_SCHEMA_VERSION,
    mode,
    liveApiReachable: mode === 'LIVE_LOOPBACK',
    readOnly: true,
    checkedAt: checkedAt || new Date().toISOString(),
    summary: {
      healthState,
      totalPorts: normFleet.total,
      livePorts: normFleet.live,
      darkPorts: normFleet.dark,
      availabilityPct: normFleet.availabilityPct,
      p50LatencyMs: normFleet.latency.p50,
      p95LatencyMs: normFleet.latency.p95,
      coreDaemonsLive: normDaemons.live,
      coreDaemonsTotal: normDaemons.total,
      kvmReady: normDaemons.kvm,
      hermesGatewayActive: Boolean(safeHermes?.active),
      hermesGatewayPid: safeHermes?.systemd?.pid ?? null,
      hermesWebchatActive: Boolean(safeHermes?.webchat?.active),
      hermesWebchatPid: safeHermes?.webchat?.systemd?.pid ?? null,
      konsoleRelayActive: Boolean(safeKonsole?.active),
      konsoleRelayPid: safeKonsole?.systemd?.pid ?? null,
      criticalIncidents: criticalCount,
      warningIncidents: warningCount,
      totalIncidents: triage.length,
    },
    fleet: normFleet,
    daemons: normDaemons,
    hermes: safeHermes,
    konsoleRelay: safeKonsole,
    pbft,
    triage,
    receiptSha256: sha256Hex(canonicalBasis),
  };

  return redactMissionControlPayload(snapshot);
}

export function buildOfflineMissionControlSnapshot(checkedAt = null) {
  const ports = OFFLINE_BASELINE_PORTS.map((item) => ({
    ...item,
    up: false,
    status: 'unprobed',
    latencyMs: 0,
    statusCode: 0,
    host: '127.0.0.1',
  }));
  return buildMissionControlSnapshot({
    fleet: { fleet: ports },
    status: {
      kvm: false,
      services: {
        memory: { name: 'Neuro-Memory STDP', port: 8094, up: false },
        bridge: { name: 'Sovereign Signal Bridge', port: 8102, up: false },
        hermesGateway: { name: 'Hermes Agent Gateway', port: null, up: false },
        hermesWebchat: { name: 'Hermes WebChat (Zoth Console)', port: 8178, up: false },
        konsoleRelay: { name: 'Konsole Relay (KDE D-Bus)', port: 8797, up: false },
        ollama: { name: 'Ollama Model Server', port: 11434, up: false },
      },
    },
    hermes: {
      schemaVersion: '2.4.0',
      mode: 'BROWSER_OFFLINE_FALLBACK',
      liveApiReachable: false,
      readOnly: true,
      unit: 'hermes-gateway.service',
      active: false,
      systemd: { pid: null, activeState: 'unprobed', subState: 'offline-fallback' },
      gateway: { profileCount: 0, profiles: [] },
      warnings: [],
      webchat: {
        unit: 'zoth-webchat.service',
        active: false,
        systemd: { pid: null },
        listener: { port: 8178, tailnetOnly: true },
        advisories: [],
      },
    },
    konsoleRelay: {
      schemaVersion: '2.1.0',
      mode: 'BROWSER_OFFLINE_FALLBACK',
      readOnly: true,
      unit: 'konsole-relay.service',
      port: 8797,
      active: false,
      systemd: { pid: null, activeState: 'unprobed' },
      posture: { loopbackOnly: true, tokenHardened: null },
    },
    checkedAt: checkedAt || '1970-01-01T00:00:00.000Z',
    mode: 'BROWSER_OFFLINE_FALLBACK',
  });
}

/**
 * Deterministic Mission DAG & Runbook Scheduler (Kahn's Topological Waves + Cycle Detector + Critical Path DP).
 */
export function planMissionDag(spec, { fleetPorts = [], mode = 'LIVE_LOOPBACK' } = {}) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    return { ok: false, error: 'Mission DAG spec must be a JSON object with a non-empty "stages" array.' };
  }
  const rawStages = Array.isArray(spec.stages) ? spec.stages : null;
  if (!rawStages || rawStages.length === 0) {
    return { ok: false, error: 'Mission DAG must contain at least 1 stage.' };
  }
  if (rawStages.length > 32) {
    return { ok: false, error: 'Mission DAG exceeds maximum of 32 stages.' };
  }

  const name = redactMissionControlText(String(spec.name || 'Custom Operator Mission').trim() || 'Custom Operator Mission').slice(0, 120);
  const id = redactMissionControlText(String(spec.id || 'custom-mission').trim() || 'custom-mission').slice(0, 64);

  const stageMap = new Map();
  const stages = [];

  for (let idx = 0; idx < rawStages.length; idx++) {
    const s = rawStages[idx];
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      return { ok: false, error: `Stage at index ${idx} must be an object.` };
    }
    const sid = String(s.id || '').trim();
    if (!sid || !/^[a-zA-Z0-9._-]{1,48}$/.test(sid)) {
      return { ok: false, error: `Invalid stage id "${sid}" at index ${idx}. Use 1-48 alphanumeric/.-_ characters.` };
    }
    if (stageMap.has(sid)) {
      return { ok: false, error: `Duplicate stage id "${sid}" in Mission DAG.` };
    }
    const est = Number(s.estimatedMs ?? 150);
    if (!Number.isFinite(est) || est < 1 || est > 600000) {
      return { ok: false, error: `Stage "${sid}" estimatedMs must be a finite number between 1 and 600000.` };
    }
    let port = null;
    if (s.port !== null && s.port !== undefined && s.port !== '') {
      const pNum = Number(s.port);
      if (!Number.isInteger(pNum) || pNum < 1 || pNum > 65535) {
        return { ok: false, error: `Stage "${sid}" port must be null or an integer in 1..65535.` };
      }
      port = pNum;
    }
    const dependsOn = Array.isArray(s.dependsOn)
      ? [...new Set(s.dependsOn.map((d) => String(d || '').trim()).filter(Boolean))]
      : [];

    const norm = {
      id: sid,
      name: redactMissionControlText(String(s.name || sid).trim() || sid).slice(0, 120),
      owner: redactMissionControlText(String(s.owner || 'operator').trim() || 'operator').slice(0, 64),
      port,
      estimatedMs: Math.round(est),
      dependsOn,
      critical: s.critical !== false,
    };
    stageMap.set(sid, norm);
    stages.push(norm);
  }

  // Validate dependency edges
  for (const s of stages) {
    for (const dep of s.dependsOn) {
      if (dep === s.id) {
        return { ok: false, hasCycle: true, cycleNodes: [s.id], error: `Self-dependency cycle detected on stage "${s.id}".` };
      }
      if (!stageMap.has(dep)) {
        return { ok: false, error: `Stage "${s.id}" depends on unknown stage "${dep}".` };
      }
    }
  }

  // Build adjacency and in-degree maps
  const inDegree = new Map();
  const dependents = new Map();
  for (const s of stages) {
    inDegree.set(s.id, s.dependsOn.length);
    dependents.set(s.id, []);
  }
  for (const s of stages) {
    for (const dep of s.dependsOn) {
      dependents.get(dep).push(s.id);
    }
  }

  // Map fleet ports for readiness checks
  const portLookup = new Map();
  for (const fp of (Array.isArray(fleetPorts) ? fleetPorts : [])) {
    if (fp && Number.isFinite(Number(fp.port))) {
      portLookup.set(Number(fp.port), fp);
    }
  }

  const stageReadiness = new Map();
  for (const s of stages) {
    if (s.port === null) {
      stageReadiness.set(s.id, { status: 'client-only', up: true, latencyMs: 0, note: 'Pure in-process deterministic stage' });
    } else if (mode === 'BROWSER_OFFLINE_FALLBACK') {
      stageReadiness.set(s.id, { status: 'unprobed', up: false, latencyMs: 0, note: `Port :${s.port} unprobed (offline fallback)` });
    } else {
      const fp = portLookup.get(s.port);
      if (fp && fp.up) {
        stageReadiness.set(s.id, { status: 'ready', up: true, latencyMs: fp.latencyMs || 0, note: `Live on 127.0.0.1:${s.port} (${fp.latencyMs || 0} ms)` });
      } else {
        stageReadiness.set(s.id, { status: 'offline-port', up: false, latencyMs: 0, note: `Target port :${s.port} offline or unmounted` });
      }
    }
  }

  // Kahn topological wave execution
  const waves = [];
  const orderedStageIds = [];
  let frontier = stages.filter((s) => inDegree.get(s.id) === 0).map((s) => s.id).sort();

  while (frontier.length > 0) {
    const waveStages = frontier.map((sid) => {
      const s = stageMap.get(sid);
      const r = stageReadiness.get(sid);
      return { ...s, readiness: r };
    });
    const waveLatencyMs = Math.max(...waveStages.map((s) => s.estimatedMs));
    waves.push({
      wave: waves.length + 1,
      stageIds: [...frontier],
      stages: waveStages,
      waveLatencyMs,
    });
    const nextSet = new Set();
    for (const sid of frontier) {
      orderedStageIds.push(sid);
      for (const nxt of dependents.get(sid)) {
        const deg = inDegree.get(nxt) - 1;
        inDegree.set(nxt, deg);
        if (deg === 0) nextSet.add(nxt);
      }
    }
    frontier = [...nextSet].sort();
  }

  if (orderedStageIds.length < stages.length) {
    const cycleNodes = stages
      .filter((s) => !orderedStageIds.includes(s.id))
      .map((s) => s.id)
      .sort();
    return {
      ok: false,
      hasCycle: true,
      cycleNodes,
      error: `Cycle detected in Mission DAG involving stage(s): ${cycleNodes.join(', ')}.`,
    };
  }

  // Critical path DP over topological order
  const dist = new Map();
  const prev = new Map();
  for (const sid of orderedStageIds) {
    const s = stageMap.get(sid);
    let bestPred = null;
    let bestCost = 0;
    for (const dep of s.dependsOn) {
      const c = dist.get(dep) || 0;
      if (c > bestCost) {
        bestCost = c;
        bestPred = dep;
      }
    }
    dist.set(sid, bestCost + s.estimatedMs);
    prev.set(sid, bestPred);
  }

  let endNode = orderedStageIds[0];
  for (const sid of orderedStageIds) {
    if ((dist.get(sid) || 0) > (dist.get(endNode) || 0)) {
      endNode = sid;
    }
  }
  const criticalPathStageIds = [];
  for (let cur = endNode; cur; cur = prev.get(cur)) {
    criticalPathStageIds.unshift(cur);
  }
  const criticalPathMs = dist.get(endNode) || 0;
  const totalSequentialMs = stages.reduce((acc, s) => acc + s.estimatedMs, 0);
  const parallelSpeedup = criticalPathMs > 0 ? Math.round((totalSequentialMs / criticalPathMs) * 100) / 100 : 1;

  const readyStages = stages.filter((s) => stageReadiness.get(s.id)?.up).length;
  const blockingStages = stages
    .filter((s) => s.critical && !stageReadiness.get(s.id)?.up)
    .map((s) => ({ id: s.id, name: s.name, port: s.port, status: stageReadiness.get(s.id)?.status }));
  const readinessScore = Math.round((readyStages / stages.length) * 100);

  const pbftSpec = spec.pbft && typeof spec.pbft === 'object' ? spec.pbft : {};
  const pbftN = Number.isFinite(Number(pbftSpec.n)) ? Number(pbftSpec.n) : Math.max(4, stages.length);
  const pbftF = Number.isFinite(Number(pbftSpec.f)) ? Number(pbftSpec.f) : Math.floor((pbftN - 1) / 3);
  const pbft = evaluatePbftQuorum(pbftN, pbftF, mode === 'BROWSER_OFFLINE_FALLBACK' ? readyStages : Math.min(pbftN, Math.max(readyStages, pbftN - blockingStages.length)));

  const receiptPayload = JSON.stringify({
    schemaVersion: MISSION_CONTROL_SCHEMA_VERSION,
    id,
    name,
    orderedStageIds,
    waves: waves.map((w) => w.stageIds),
    criticalPathMs,
    criticalPathStageIds,
    readinessScore,
    pbft: { n: pbft.n, f: pbft.f, quorumSafe: pbft.quorumSafe },
  });

  return {
    ok: true,
    schemaVersion: MISSION_CONTROL_SCHEMA_VERSION,
    mode,
    id,
    name,
    hasCycle: false,
    stageCount: stages.length,
    waveCount: waves.length,
    orderedStageIds,
    waves,
    criticalPathMs,
    criticalPathStageIds,
    totalSequentialMs,
    parallelSpeedup,
    readyStages,
    readinessScore,
    blockingStages,
    pbft,
    receiptSha256: sha256Hex(receiptPayload),
  };
}

/**
 * Formula-safe JSON, Markdown, CSV, and declarative Mission Runbook YAML exporters.
 */
export function formatMissionControlExports(snapshot, planResult = null) {
  const safeSnap = redactMissionControlPayload(snapshot || buildOfflineMissionControlSnapshot());
  const safePlan = planResult ? redactMissionControlPayload(planResult) : planMissionDag(MISSION_PRESETS[0], {
    fleetPorts: safeSnap.fleet?.ports || [],
    mode: safeSnap.mode,
  });

  const bundleObj = {
    schemaVersion: MISSION_CONTROL_SCHEMA_VERSION,
    mode: safeSnap.mode,
    checkedAt: safeSnap.checkedAt,
    summary: safeSnap.summary,
    pbft: safeSnap.pbft,
    triage: safeSnap.triage,
    missionPlan: safePlan,
    fleetCategories: safeSnap.fleet?.categories || [],
    receiptSha256: safeSnap.receiptSha256,
  };
  const json = JSON.stringify(bundleObj, null, 2);

  const mdLines = [
    `# Zoth Mission Control & Fleet Dispatcher Brief (v${MISSION_CONTROL_SCHEMA_VERSION})`,
    '',
    `- **Mode:** \`${safeSnap.mode}\``,
    `- **Health State:** \`${safeSnap.summary?.healthState || 'unknown'}\``,
    `- **Fleet Ports:** ${safeSnap.summary?.livePorts ?? 0} live / ${safeSnap.summary?.totalPorts ?? 0} total (${safeSnap.summary?.availabilityPct ?? 0}%)`,
    `- **Loopback RTT:** p50 \`${safeSnap.summary?.p50LatencyMs ?? 0} ms\` · p95 \`${safeSnap.summary?.p95LatencyMs ?? 0} ms\``,
    `- **Core Daemons:** ${safeSnap.summary?.coreDaemonsLive ?? 0}/${safeSnap.summary?.coreDaemonsTotal ?? 0} online · KVM \`${safeSnap.summary?.kvmReady ? 'ready' : 'unavailable'}\``,
    `- **Hermes Gateway:** ${safeSnap.summary?.hermesGatewayActive ? `ACTIVE (PID ${safeSnap.summary.hermesGatewayPid ?? '—'})` : 'INACTIVE/UNPROBED'} · **WebChat:** ${safeSnap.summary?.hermesWebchatActive ? `ACTIVE (PID ${safeSnap.summary.hermesWebchatPid ?? '—'})` : 'INACTIVE/UNPROBED'} · **Konsole Relay:** ${safeSnap.summary?.konsoleRelayActive ? `ACTIVE (PID ${safeSnap.summary.konsoleRelayPid ?? '—'})` : 'INACTIVE/UNPROBED'}`,
    `- **PBFT Quorum:** \`${safeSnap.pbft?.safetyFormula || 'N/A'}\``,
    `- **Snapshot SHA-256 Receipt:** \`${safeSnap.receiptSha256}\``,
    '',
    '## Incident Triage Queue',
    '',
    '| Severity | Source | Title | Remediation |',
    '| :--- | :--- | :--- | :--- |',
  ];
  const triageList = Array.isArray(safeSnap.triage) && safeSnap.triage.length > 0
    ? safeSnap.triage
    : [{ severity: 'info', source: 'mission-control', title: 'Zero active incidents', remediation: 'All monitored services nominal.' }];
  for (const inc of triageList) {
    mdLines.push(`| ${String(inc.severity).toUpperCase()} | ${inc.source} | ${String(inc.title).replace(/\|/g, '\\|')} | ${String(inc.remediation || '').replace(/\|/g, '\\|')} |`);
  }

  if (safePlan && safePlan.ok) {
    mdLines.push(
      '',
      `## Scheduled Mission DAG: ${safePlan.name}`,
      '',
      `- **Waves:** ${safePlan.waveCount} · **Stages:** ${safePlan.stageCount} · **Critical Path:** ${safePlan.criticalPathMs} ms (${safePlan.parallelSpeedup}x speedup) · **Readiness:** ${safePlan.readinessScore}%`,
      `- **Plan SHA-256 Receipt:** \`${safePlan.receiptSha256}\``,
      '',
      '| Wave | Stage ID | Name | Port | Est (ms) | Readiness |',
      '| :---: | :--- | :--- | :---: | :---: | :--- |',
    );
    for (const w of safePlan.waves) {
      for (const st of w.stages) {
        mdLines.push(`| W${w.wave} | \`${st.id}\` | ${String(st.name).replace(/\|/g, '\\|')} | ${st.port ? `:${st.port}` : 'local'} | ${st.estimatedMs} | ${st.readiness?.status || 'unknown'} |`);
      }
    }
  }
  const markdown = mdLines.join('\n');

  // Formula-safe CSV covering fleet ports + triage rows
  const csvRows = [
    ['record_type', 'id', 'name', 'category_or_source', 'port', 'status_or_severity', 'latency_ms', 'detail']
      .map(sanitizeCsvCell)
      .join(','),
  ];
  for (const p of (safeSnap.fleet?.ports || [])) {
    csvRows.push([
      'fleet_port',
      p.id,
      p.name,
      p.category,
      p.port,
      p.status,
      p.latencyMs,
      p.isCore ? 'core' : 'tool',
    ].map(sanitizeCsvCell).join(','));
  }
  for (const inc of (safeSnap.triage || [])) {
    csvRows.push([
      'incident',
      inc.id,
      inc.title,
      inc.source,
      '',
      inc.severity,
      '',
      inc.detail,
    ].map(sanitizeCsvCell).join(','));
  }
  const csv = csvRows.join('\n');

  // Declarative Mission Runbook YAML
  const yamlLines = [
    `# Zoth Mission Control Declarative Runbook (v${MISSION_CONTROL_SCHEMA_VERSION})`,
    `# Snapshot SHA-256: ${safeSnap.receiptSha256}`,
    `schemaVersion: ${escapeYamlString(MISSION_CONTROL_SCHEMA_VERSION)}`,
    `mode: ${escapeYamlString(safeSnap.mode)}`,
    `mission:`,
    `  id: ${escapeYamlString(safePlan?.id || 'custom-mission')}`,
    `  name: ${escapeYamlString(safePlan?.name || 'Custom Operator Mission')}`,
    `  criticalPathMs: ${safePlan?.criticalPathMs ?? 0}`,
    `  readinessScore: ${safePlan?.readinessScore ?? 0}`,
    `  planReceiptSha256: ${escapeYamlString(safePlan?.receiptSha256 || '')}`,
    `pbft:`,
    `  nodes: ${safePlan?.pbft?.n ?? safeSnap.pbft?.n ?? 4}`,
    `  faults: ${safePlan?.pbft?.f ?? safeSnap.pbft?.f ?? 1}`,
    `  quorumRequired: ${safePlan?.pbft?.quorumRequired ?? safeSnap.pbft?.quorumRequired ?? 3}`,
    `  quorumSafe: ${Boolean(safePlan?.pbft?.quorumSafe ?? safeSnap.pbft?.quorumSafe)}`,
    `waves:`,
  ];
  for (const w of (safePlan?.waves || [])) {
    yamlLines.push(`  - wave: ${w.wave}`);
    yamlLines.push(`    waveLatencyMs: ${w.waveLatencyMs}`);
    yamlLines.push(`    stages:`);
    for (const st of w.stages) {
      yamlLines.push(`      - id: ${escapeYamlString(st.id)}`);
      yamlLines.push(`        name: ${escapeYamlString(st.name)}`);
      yamlLines.push(`        owner: ${escapeYamlString(st.owner)}`);
      yamlLines.push(`        port: ${st.port === null ? 'null' : st.port}`);
      yamlLines.push(`        estimatedMs: ${st.estimatedMs}`);
      yamlLines.push(`        readiness: ${escapeYamlString(st.readiness?.status || 'unknown')}`);
      yamlLines.push(`        dependsOn: [${st.dependsOn.map(escapeYamlString).join(', ')}]`);
    }
  }
  const yaml = yamlLines.join('\n');

  const receiptSha256 = sha256Hex(JSON.stringify({
    snapReceipt: safeSnap.receiptSha256,
    planReceipt: safePlan?.receiptSha256 || '',
  }));

  return { json, markdown, csv, yaml, receiptSha256 };
}
