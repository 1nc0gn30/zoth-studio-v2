/**
 * Zoth Studio v2 — Sovereign Operator Cockpit Engine (Pure JS, Zero Dependencies)
 * Canonical client module mirrored byte-identically at server/cockpit-engine.mjs.
 *
 * Responsibilities:
 *  - Host telemetry normalization (CPU %, loadavg, RAM, disk, thermal zones, GPU, honest audio)
 *  - Strict home-path redaction (/home/<user>/, /Users/<user>/, file:///home/<user>/ -> ~/) & secret scrubbing
 *  - Live 88-port loopback fleet health classification & filtering (ALL / LIVE / DARK + category + search)
 *  - Fuzzy Command Palette matcher across all 85 tools, 45 workstations, and operator actions
 *  - Honest offline browser-inspector fallback when /api/studio/cockpit is unreachable
 *  - Sanitized JSON, Markdown, and formula-injection-neutralized CSV diagnostic snapshot exporters
 */

export const COCKPIT_SCHEMA_VERSION = '2.3.0';

const HOME_URI_RE = /file:\/\/\/(?:home|Users)\/[A-Za-z0-9._-]+\//gi;
const HOME_PATH_RE = /\/(?:home|Users)\/[A-Za-z0-9._-]+\//g;
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const SECRET_RE = /\b(?:sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{20,}|xox[baprs]-[A-Za-z0-9-]{16,}|AKIA[0-9A-Z]{16})\b/g;

export const DEFAULT_OPERATOR_ACTIONS = Object.freeze([
  {
    id: 'action-refresh-cockpit',
    kind: 'action',
    name: 'Refresh Live Host & Fleet Telemetry',
    category: 'Cockpit Action',
    route: '/workstations/cockpit',
    port: 3000,
    cli: 'curl -sS http://127.0.0.1:3000/api/studio/cockpit | jq .',
    executionType: 'hybrid',
    description: 'Re-sample CPU delta, RAM, root disk, thermal zones, GPU, core daemons, and 88 loopback ports.',
  },
  {
    id: 'action-zoth-cockpit-status',
    kind: 'action',
    name: 'ZothOS Cockpit Headless Status Snapshot',
    category: 'ZothOS CLI',
    route: '/workstations/cockpit',
    port: null,
    cli: 'zoth-cockpit --status',
    executionType: 'local_cli',
    description: 'Print live hardware telemetry, AI engines, security arsenal, and daemon table in terminal.',
  },
  {
    id: 'action-zoth-cockpit-json',
    kind: 'action',
    name: 'ZothOS Cockpit Machine JSON Telemetry',
    category: 'ZothOS CLI',
    route: '/workstations/cockpit',
    port: null,
    cli: 'zoth-cockpit --json',
    executionType: 'local_cli',
    description: 'Emit machine-readable JSON host, AI stack, and loopback daemon status from zoth-cockpit.',
  },
  {
    id: 'action-bus-monitor',
    kind: 'action',
    name: 'Open Swarm NOC & Loopback Signal Bridge',
    category: 'Navigation',
    route: '/workstations/bus-monitor',
    port: 8102,
    cli: 'zoth open bus-monitor',
    executionType: 'hybrid',
    description: 'Measure p50/p95 loopback RTT and verify HKDF-SHA256 / HMAC-SHA256 signal bridge envelopes.',
  },
  {
    id: 'action-chronicle',
    kind: 'action',
    name: 'Open Chronicle Hub & Continuity Vault',
    category: 'Navigation',
    route: '/workstations/chronicle',
    port: 8161,
    cli: 'zoth open chronicle',
    executionType: 'hybrid',
    description: 'Search local FTS5 conversation memory (:8161) or analyze JSONL/Markdown transcripts offline.',
  },
  {
    id: 'action-ax-powerhouse',
    kind: 'action',
    name: 'Open AX Powerhouse & Contract Auditor',
    category: 'Navigation',
    route: '/workstations/ax-powerhouse',
    port: 3000,
    cli: 'zoth open ax-powerhouse',
    executionType: 'hybrid',
    description: 'Audit llms.txt, ai.txt, robots.txt, mcp.json, agent.json, and Schema.org @graph parity.',
  },
]);

export function sanitizeCockpitText(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(CTRL_RE, '')
    .replace(HOME_URI_RE, '~/')
    .replace(HOME_PATH_RE, '~/')
    .replace(SECRET_RE, '[REDACTED_SECRET]');
}

export function sanitizeCockpitPayload(value) {
  if (typeof value === 'string') return sanitizeCockpitText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeCockpitPayload(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[sanitizeCockpitText(k)] = sanitizeCockpitPayload(v);
    }
    return out;
  }
  return value;
}

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

export function formatUptimeSeconds(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, '0')}m`;
  return `${mins}m ${String(s % 60).padStart(2, '0')}s`;
}

export function classifyThermalState(maxTempC) {
  if (maxTempC === null || maxTempC === undefined || !Number.isFinite(Number(maxTempC))) {
    return 'UNKNOWN';
  }
  const t = Number(maxTempC);
  if (t >= 82) return 'HOT';
  if (t >= 65) return 'WARM';
  return 'COOL';
}

export function normalizeHostTelemetry(raw = {}) {
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
  const usedMiB = Math.max(0, src.memory?.usedMiB !== undefined ? Math.round(Number(src.memory.usedMiB) || 0) : totalMiB - freeMiB);
  const memUsedPct = totalMiB > 0 ? round1(clampNum((usedMiB / totalMiB) * 100, 0, 100, 0)) : 0;

  const rawDisk = src.disk && typeof src.disk === 'object' ? src.disk : {};
  const diskTotalGiB = round2(Math.max(0, Number(rawDisk.totalGiB ?? 0) || 0));
  const diskFreeGiB = round2(Math.max(0, Number(rawDisk.freeGiB ?? 0) || 0));
  const diskUsedGiB = round2(
    Math.max(0, rawDisk.usedGiB !== undefined ? Number(rawDisk.usedGiB) || 0 : diskTotalGiB - diskFreeGiB)
  );
  const diskUsedPct = diskTotalGiB > 0
    ? round1(clampNum((diskUsedGiB / diskTotalGiB) * 100, 0, 100, 0))
    : 0;

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
        name: sanitizeCockpitText(z?.name || `thermal_zone${i}`),
        type: sanitizeCockpitText(z?.type || 'sensor'),
        tempC: round1(tempVal),
      };
    })
    .filter(Boolean);
  const maxTempC = zones.length > 0 ? round1(Math.max(...zones.map((z) => z.tempC))) : null;
  const thermalState = classifyThermalState(maxTempC);

  let gpu = null;
  if (src.gpu && typeof src.gpu === 'object' && src.gpu.name) {
    const gUsed = Math.max(0, Math.round(Number(src.gpu.memoryUsedMiB ?? 0) || 0));
    const gTotal = Math.max(0, Math.round(Number(src.gpu.memoryTotalMiB ?? 0) || 0));
    gpu = {
      name: sanitizeCockpitText(src.gpu.name),
      tempC: Number.isFinite(Number(src.gpu.tempC)) ? round1(Number(src.gpu.tempC)) : null,
      utilizationPct: Number.isFinite(Number(src.gpu.utilizationPct))
        ? round1(clampNum(src.gpu.utilizationPct, 0, 100, 0))
        : null,
      memoryUsedMiB: gUsed,
      memoryTotalMiB: gTotal,
      memoryPct: gTotal > 0 ? round1(clampNum((gUsed / gTotal) * 100, 0, 100, 0)) : 0,
    };
  }

  const audioObj = src.audio && typeof src.audio === 'object'
    ? {
        subsystem: sanitizeCockpitText(src.audio.subsystem || 'Unavailable'),
        device: sanitizeCockpitText(src.audio.device || 'No local audio device detected'),
        detected: Boolean(src.audio.detected),
      }
    : {
        subsystem: src.audioDevice ? 'Detected' : 'Unavailable',
        device: sanitizeCockpitText(src.audioDevice || 'No local audio device detected'),
        detected: Boolean(src.audioDevice),
      };

  const uptimeSec = Math.max(0, Math.round(Number(src.uptime ?? src.uptimeSec ?? 0) || 0));

  const installedTools = {};
  if (src.installedTools && typeof src.installedTools === 'object') {
    for (const [k, v] of Object.entries(src.installedTools)) {
      installedTools[sanitizeCockpitText(k)] = Boolean(v);
    }
  }

  return {
    isZothOS: Boolean(src.isZothOS),
    distro: sanitizeCockpitText(src.distro || 'Linux Host'),
    release: sanitizeCockpitText(src.release || ''),
    kernel: sanitizeCockpitText(src.kernel || 'unknown'),
    arch: sanitizeCockpitText(src.arch || 'unknown'),
    hostname: sanitizeCockpitText(src.hostname || 'localhost'),
    cpu: {
      cores,
      model: sanitizeCockpitText(src.cpuModel ?? src.cpu?.model ?? 'Host CPU'),
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
      mount: sanitizeCockpitText(rawDisk.mount || '/'),
      totalGiB: diskTotalGiB,
      usedGiB: diskUsedGiB,
      freeGiB: diskFreeGiB,
      usedPct: diskUsedPct,
    },
    thermal: {
      zones,
      maxTempC,
      state: thermalState,
    },
    gpu,
    audio: audioObj,
    uptimeSec,
    uptimeFormatted: formatUptimeSeconds(uptimeSec),
    installedTools,
  };
}

export function normalizeFleetData(rawFleet = {}) {
  const src = rawFleet && typeof rawFleet === 'object' ? rawFleet : {};
  const list = Array.isArray(src.fleet)
    ? src.fleet
    : Array.isArray(src.services)
    ? src.services
    : [];

  const services = list
    .map((item) => {
      const port = Number(item?.port);
      if (!Number.isFinite(port) || port <= 0) return null;
      const up = Boolean(item?.up);
      return {
        port,
        id: sanitizeCockpitText(item?.id || `port-${port}`),
        name: sanitizeCockpitText(item?.name || `Service :${port}`),
        category: sanitizeCockpitText(item?.category || 'Uncategorized'),
        executionType: sanitizeCockpitText(item?.executionType || item?.execution_type || (item?.isCore ? 'core_daemon' : 'local_daemon')),
        isCore: Boolean(item?.isCore),
        up,
        status: up ? 'LIVE' : 'DARK',
        latencyMs: up ? Math.max(0, Math.round(Number(item?.latencyMs) || 0)) : 0,
        statusCode: up ? Math.max(0, Math.round(Number(item?.statusCode) || 200)) : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.port - b.port);

  const live = services.filter((s) => s.up).length;
  const total = services.length;
  const dark = total - live;
  const categories = [...new Set(services.map((s) => s.category))].sort((a, b) => a.localeCompare(b));

  return {
    checkedAt: sanitizeCockpitText(src.checkedAt || new Date().toISOString()),
    total,
    live,
    dark,
    healthPct: total > 0 ? round1((live / total) * 100) : 0,
    categories,
    services,
  };
}

export function filterFleetServices(services = [], { status = 'ALL', category = 'ALL', query = '' } = {}) {
  const list = Array.isArray(services) ? services : [];
  const normStatus = String(status || 'ALL').toUpperCase();
  const normCategory = String(category || 'ALL');
  const q = String(query || '').trim().toLowerCase();

  return list.filter((svc) => {
    if (normStatus === 'LIVE' && !svc.up) return false;
    if (normStatus === 'DARK' && svc.up) return false;
    if (normCategory !== 'ALL' && svc.category !== normCategory) return false;
    if (!q) return true;
    const hay = `${svc.name} ${svc.id} ${svc.category} :${svc.port} ${svc.port}`.toLowerCase();
    return hay.includes(q);
  });
}

export function buildCommandPaletteEntries(tools = [], workstations = [], operatorActions = DEFAULT_OPERATOR_ACTIONS) {
  const entries = [];
  const seenKeys = new Set();

  for (const act of Array.isArray(operatorActions) ? operatorActions : []) {
    const key = `action:${act.id}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    entries.push({
      key,
      id: sanitizeCockpitText(act.id),
      kind: 'action',
      name: sanitizeCockpitText(act.name),
      category: sanitizeCockpitText(act.category || 'Operator Action'),
      route: sanitizeCockpitText(act.route || '/workstations/cockpit'),
      port: act.port ?? null,
      cli: sanitizeCockpitText(act.cli || ''),
      executionType: sanitizeCockpitText(act.executionType || 'hybrid'),
      description: sanitizeCockpitText(act.description || ''),
    });
  }

  for (const ws of Array.isArray(workstations) ? workstations : []) {
    if (!ws?.id) continue;
    const key = `workstation:${ws.id}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    entries.push({
      key,
      id: sanitizeCockpitText(ws.id),
      kind: 'workstation',
      name: sanitizeCockpitText(ws.name || ws.id),
      category: sanitizeCockpitText(ws.band || 'Workstation'),
      route: `/workstations/${sanitizeCockpitText(ws.id)}`,
      port: ws.port ?? null,
      cli: sanitizeCockpitText(ws.pullCommand || `zoth open ${ws.id}`),
      executionType: sanitizeCockpitText(ws.executionType || 'browser'),
      description: sanitizeCockpitText(ws.description || ''),
    });
  }

  for (const tool of Array.isArray(tools) ? tools : []) {
    if (!tool?.id) continue;
    const key = `tool:${tool.id}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    const port = tool.localPort ?? tool.port ?? null;
    entries.push({
      key,
      id: sanitizeCockpitText(tool.id),
      kind: 'tool',
      name: sanitizeCockpitText(tool.name || tool.id),
      category: sanitizeCockpitText(tool.category || 'Arsenal'),
      route: `/tools/${sanitizeCockpitText(tool.id)}`,
      port,
      cli: sanitizeCockpitText(`zoth open ${tool.id}`),
      executionType: sanitizeCockpitText(tool.executionType || tool.execution_type || 'browser'),
      description: sanitizeCockpitText(tool.description || ''),
    });
  }

  return entries;
}

function fuzzySubsequenceScore(needle, haystack) {
  let ni = 0;
  let consecutive = 0;
  let score = 0;
  for (let hi = 0; hi < haystack.length && ni < needle.length; hi += 1) {
    if (haystack[hi] === needle[ni]) {
      ni += 1;
      consecutive += 1;
      score += 2 + consecutive;
    } else {
      consecutive = 0;
    }
  }
  return ni === needle.length ? score : 0;
}

export function matchCommandPalette(entries = [], query = '', { kind = 'ALL', limit = 40 } = {}) {
  const list = Array.isArray(entries) ? entries : [];
  const normKind = String(kind || 'ALL').toLowerCase();
  const q = String(query || '').trim().toLowerCase();
  const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

  const filtered = list.filter((e) => normKind === 'all' || e.kind === normKind);
  if (tokens.length === 0) {
    return filtered.slice(0, limit);
  }

  const scored = [];
  for (const item of filtered) {
    const idLow = item.id.toLowerCase();
    const nameLow = item.name.toLowerCase();
    const catLow = item.category.toLowerCase();
    const portStr = item.port ? String(item.port) : '';
    const cliLow = item.cli.toLowerCase();
    const descLow = item.description.toLowerCase();
    const combined = `${idLow} ${nameLow} ${catLow} ${portStr} :${portStr} ${cliLow} ${descLow}`;

    let totalScore = 0;
    let allTokensMatched = true;

    for (const tok of tokens) {
      let tokScore = 0;
      if (idLow === tok || portStr === tok || `:${portStr}` === tok) {
        tokScore = 120;
      } else if (idLow.startsWith(tok) || nameLow.startsWith(tok)) {
        tokScore = 85;
      } else if (idLow.includes(tok) || nameLow.includes(tok)) {
        tokScore = 60;
      } else if (catLow.includes(tok) || cliLow.includes(tok) || portStr.includes(tok)) {
        tokScore = 40;
      } else if (descLow.includes(tok)) {
        tokScore = 24;
      } else {
        const fuzzy = fuzzySubsequenceScore(tok, `${idLow} ${nameLow}`);
        if (fuzzy > 0 && tok.length >= 2) {
          tokScore = Math.min(20, fuzzy);
        }
      }

      if (tokScore === 0 && !combined.includes(tok)) {
        allTokensMatched = false;
        break;
      }
      totalScore += tokScore;
    }

    if (allTokensMatched && totalScore > 0) {
      scored.push({ item, score: totalScore });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  return scored.slice(0, limit).map((s) => s.item);
}

export function buildOfflineBrowserSnapshot(env = {}) {
  const nav = env.navigator || (typeof navigator !== 'undefined' ? navigator : {});
  const scr = env.screen || (typeof screen !== 'undefined' ? screen : {});
  const cores = Math.max(1, Number(nav.hardwareConcurrency) || 1);
  const deviceMemoryGiB = Number.isFinite(Number(nav.deviceMemory)) ? Number(nav.deviceMemory) : null;
  const platform = sanitizeCockpitText(nav.userAgentData?.platform || nav.platform || 'Browser Sandbox');
  const language = sanitizeCockpitText(nav.language || 'en-US');
  let timezone = 'UTC';
  try {
    timezone = sanitizeCockpitText(env.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  } catch {}
  const viewport = scr.width && scr.height ? `${scr.width}×${scr.height} (${scr.colorDepth || 24}-bit)` : 'Unknown';

  return {
    schemaVersion: COCKPIT_SCHEMA_VERSION,
    mode: 'browser-fallback',
    checkedAt: new Date().toISOString(),
    notice: 'Static / remote browser session — loopback host daemon (127.0.0.1:3000 /api/studio/cockpit) is unavailable. Showing honest browser inspector telemetry and the full 85-tool / 45-workstation Command Palette.',
    browser: {
      cores,
      deviceMemoryGiB,
      platform,
      language,
      timezone,
      viewport,
      online: nav.onLine !== undefined ? Boolean(nav.onLine) : true,
    },
    host: null,
    daemons: null,
    fleet: {
      checkedAt: new Date().toISOString(),
      total: 0,
      live: 0,
      dark: 0,
      healthPct: 0,
      categories: [],
      services: [],
    },
    reality: {
      mode: 'browser',
      allModes: ['gold', 'ghost', 'matrix', 'incognito'],
    },
  };
}

export function neutralizeCsvCell(value) {
  const clean = sanitizeCockpitText(value);
  const formulaSafe = /^[=+\-@\t\r]/.test(clean) ? `'${clean}` : clean;
  if (/[",\r\n]/.test(formulaSafe)) {
    return `"${formulaSafe.replace(/"/g, '""')}"`;
  }
  return formulaSafe;
}

export function buildCockpitJsonSnapshot(snapshot = {}) {
  const safe = sanitizeCockpitPayload({
    schemaVersion: snapshot.schemaVersion || COCKPIT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    mode: snapshot.mode || 'browser-fallback',
    checkedAt: snapshot.checkedAt || new Date().toISOString(),
    reality: snapshot.reality || null,
    host: snapshot.host || null,
    browser: snapshot.browser || null,
    daemons: snapshot.daemons || null,
    fleet: snapshot.fleet || null,
    counts: snapshot.counts || null,
  });
  return JSON.stringify(safe, null, 2);
}

export function buildCockpitMarkdownReport(snapshot = {}) {
  const safe = sanitizeCockpitPayload(snapshot || {});
  const lines = [
    '# The Cockpit // Sovereign Operator Diagnostic Snapshot',
    '',
    `- **Schema Version:** \`${safe.schemaVersion || COCKPIT_SCHEMA_VERSION}\``,
    `- **Mode:** \`${safe.mode || 'browser-fallback'}\``,
    `- **Checked At:** \`${safe.checkedAt || new Date().toISOString()}\``,
    `- **Reality Profile:** \`${safe.reality?.mode || 'gold'}\``,
    '',
  ];

  if (safe.host) {
    const h = safe.host;
    lines.push('## Host Telemetry');
    lines.push(`- **OS / Kernel:** ${h.distro} (${h.kernel} · ${h.arch})`);
    lines.push(`- **CPU:** ${h.cpu?.model || 'Host CPU'} (${h.cpu?.cores || 1} cores) — **${h.cpu?.pct ?? 0}%** · LoadAvg: \`${(h.cpu?.loadavg || [0, 0, 0]).join(', ')}\``);
    lines.push(`- **Memory:** ${h.memory?.usedMiB ?? 0} / ${h.memory?.totalMiB ?? 0} MiB (**${h.memory?.usedPct ?? 0}%**)`);
    lines.push(`- **Root Disk (${h.disk?.mount || '/'}):** ${h.disk?.usedGiB ?? 0} / ${h.disk?.totalGiB ?? 0} GiB (**${h.disk?.usedPct ?? 0}%**, ${h.disk?.freeGiB ?? 0} GiB free)`);
    lines.push(`- **Thermal:** ${h.thermal?.maxTempC !== null && h.thermal?.maxTempC !== undefined ? `${h.thermal.maxTempC}°C (${h.thermal.state})` : 'Unavailable'} (${(h.thermal?.zones || []).length} zone(s))`);
    lines.push(`- **GPU:** ${h.gpu ? `${h.gpu.name} (${h.gpu.tempC ?? '—'}°C · ${h.gpu.utilizationPct ?? 0}% util · ${h.gpu.memoryUsedMiB}/${h.gpu.memoryTotalMiB} MiB)` : 'Not detected'}`);
    lines.push(`- **Audio Subsystem:** ${h.audio?.subsystem || 'Unavailable'} — ${h.audio?.device || 'None'}`);
    lines.push(`- **Uptime:** ${h.uptimeFormatted || '—'}`);
    lines.push('');
  } else if (safe.browser) {
    const b = safe.browser;
    lines.push('## Browser Inspector Fallback (Offline Mode)');
    lines.push(`- **Platform:** ${b.platform}`);
    lines.push(`- **Hardware Concurrency:** ${b.cores} logical thread(s)`);
    lines.push(`- **Device Memory:** ${b.deviceMemoryGiB ? `${b.deviceMemoryGiB} GiB (approx)` : 'Not exposed by browser'}`);
    lines.push(`- **Display:** ${b.viewport} · **Timezone:** ${b.timezone} · **Language:** ${b.language}`);
    lines.push('');
  }

  if (safe.daemons) {
    lines.push('## Core Enclave Daemons');
    lines.push(`- **KVM Hardware Virtualization:** ${safe.daemons.kvm ? 'AVAILABLE (/dev/kvm)' : 'UNAVAILABLE'}`);
    for (const svc of safe.daemons.core || []) {
      const extra = Array.isArray(svc.models) && svc.models.length > 0 ? ` (${svc.models.length} local models)` : '';
      lines.push(`- **${svc.name}** (\`:${svc.port}\`): ${svc.up ? 'ONLINE' : 'OFFLINE'}${extra}`);
    }
    lines.push('');
  }

  const fleet = safe.fleet || { total: 0, live: 0, dark: 0, services: [] };
  lines.push(`## Loopback Fleet Matrix (${fleet.live}/${fleet.total} LIVE · ${fleet.dark} DARK)`);
  if (fleet.services && fleet.services.length > 0) {
    lines.push('');
    lines.push('| Port | Service | Category | Status | Latency |');
    lines.push('| ---: | :--- | :--- | :---: | ---: |');
    for (const s of fleet.services) {
      lines.push(`| :${s.port} | ${s.name} | ${s.category} | ${s.status} | ${s.up ? `${s.latencyMs} ms` : '—'} |`);
    }
  } else {
    lines.push('- No loopback fleet scan data available in offline browser mode.');
  }

  lines.push('');
  lines.push('---');
  lines.push('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform');
  return lines.join('\n');
}

export function buildCockpitCsvReport(fleetServices = []) {
  const header = ['port', 'id', 'name', 'category', 'status', 'latency_ms', 'status_code', 'execution_type', 'core'];
  const rows = [header.join(',')];
  for (const svc of Array.isArray(fleetServices) ? fleetServices : []) {
    rows.push(
      [
        neutralizeCsvCell(svc.port ?? ''),
        neutralizeCsvCell(svc.id ?? ''),
        neutralizeCsvCell(svc.name ?? ''),
        neutralizeCsvCell(svc.category ?? ''),
        neutralizeCsvCell(svc.status ?? (svc.up ? 'LIVE' : 'DARK')),
        neutralizeCsvCell(svc.latencyMs ?? 0),
        neutralizeCsvCell(svc.statusCode ?? 0),
        neutralizeCsvCell(svc.executionType ?? ''),
        neutralizeCsvCell(svc.isCore ? 'true' : 'false'),
      ].join(',')
    );
  }
  return rows.join('\n');
}
