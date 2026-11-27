/**
 * Hermes Agent Gateway — Pure Telemetry, Redaction & Diagnostic Engine (v2.4.0)
 *
 * Mirrored byte-identically between browser (`src/utils/hermesGatewayEngine.js`)
 * and Studio API server (`server/hermes-gateway-engine.mjs`).
 *
 * Security & Honesty Invariants:
 *  - Zero hardcoded ephemeral ports (discovers live 127.0.0.1:<port> from `ss -tlnp`)
 *  - Zero literal `/home/<user>` or `/Users/<user>` paths emitted (always redacted to `~/`)
 *  - Strips token, bearer, API key, and PEM private key patterns recursively
 *  - Honest `BROWSER_OFFLINE_FALLBACK` when `:3000` is unavailable
 *  - Formula-injection-neutralized CSV (`=`, `+`, `-`, `@`, `\t`, `\r`)
 */

export const HERMES_GATEWAY_SCHEMA_VERSION = '2.4.0';
export const HERMES_GATEWAY_UNIT = 'hermes-gateway.service';
export const STATE_DB_WARNING_BYTES = 1024 * 1024 * 1024; // 1 GiB
export const MEMORY_HIGH_BYTES = 3 * 1024 * 1024 * 1024; // 3 GiB
export const MEMORY_MAX_BYTES = 4 * 1024 * 1024 * 1024; // 4 GiB

export const UPSTREAM_SECURITY_UI_ADVISORIES = Object.freeze([
  {
    id: 'UPSTREAM-STATUS-REDACT',
    severity: 'info',
    area: 'upstream-security',
    summary: 'Upstream :ephemeral /api/status exposes literal host paths when auth_required=false; Studio proxy strictly redacts all paths to ~/.',
  },
  {
    id: 'UPSTREAM-SECURITY-HEADERS',
    severity: 'info',
    area: 'upstream-security',
    summary: 'Upstream dashboard omits global X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and CSP headers; tracked for upstream patch.',
  },
  {
    id: 'UPSTREAM-OPENAPI-DUP-OPID',
    severity: 'info',
    area: 'upstream-api',
    summary: 'Upstream webapp_relay_proxy.py registers multi-method relay_http without distinct operation IDs; tracked alongside /docs gating.',
  },
  {
    id: 'UPSTREAM-DASHBOARD-THEME',
    severity: 'info',
    area: 'upstream-ui',
    summary: 'Standalone Hermes Dashboard defaults to dark CRT theme and stalls on large state.db; use Studio Dual-Theme Telemetry Panel for fast read-only ops.',
  },
]);

export const SAFE_OPERATOR_COMMANDS = Object.freeze([
  {
    id: 'gateway-status-json',
    label: 'Read-Only Gateway Telemetry (JSON)',
    command: 'hermes-gateway status --json',
  },
  {
    id: 'gateway-port',
    label: 'Discover Live Loopback Port',
    command: 'hermes-gateway port --json',
  },
  {
    id: 'gateway-health',
    label: 'Check Health & Systemd Unit',
    command: 'hermes-gateway health --json',
  },
  {
    id: 'gateway-list',
    label: 'List Multiplexed Profiles',
    command: 'hermes-gateway list',
  },
  {
    id: 'gateway-journal',
    label: 'Tail User Systemd Journal',
    command: 'journalctl --user -u hermes-gateway.service -n 50 --no-pager',
  },
]);

const HOME_PATH_RE = /(?:file:\/\/)?\/(?:home|Users)\/[A-Za-z0-9._-]+(?=\/|\b)/g;

const SECRET_VALUE_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{12,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{16,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi,
  /-----BEGIN [A-Z0-9 ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]+PRIVATE KEY-----/g,
];

const SECRET_KEY_RE = /^(?:token|secret|api_?key|password|authorization|private_?key|env_?secret|access_?token|refresh_?token|bot_?token|client_?secret)$/i;

/**
 * Recursively redact user home paths (`/home/<user>`, `/Users/<user>`) to `~`
 * and scrub token/key/PEM patterns from strings, arrays, and plain objects.
 */
export function redactHermesPathsAndSecrets(value) {
  if (typeof value === 'string') {
    let out = value.replace(HOME_PATH_RE, '~');
    for (const pat of SECRET_VALUE_PATTERNS) {
      out = out.replace(pat, '[REDACTED]');
    }
    return out;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactHermesPathsAndSecrets(item));
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (SECRET_KEY_RE.test(key)) {
        clean[key] = '[REDACTED]';
      } else if (key === 'env_path' && typeof val === 'string') {
        clean[key] = redactHermesPathsAndSecrets(val);
      } else {
        clean[key] = redactHermesPathsAndSecrets(val);
      }
    }
    return clean;
  }
  return value;
}

/**
 * Deterministically parse `ss -tlnp` output to discover the active 127.0.0.1
 * loopback TCP port owned by `pid` or `"hermes"`. Rejects `0.0.0.0` / non-loopback
 * binds and privileged ports `< 1024`. Never hardcodes a port number.
 */
export function parseLoopbackListenerPort(ssOutput, pid = null) {
  if (typeof ssOutput !== 'string' || !ssOutput.trim()) return null;
  const pidNum = Number.isInteger(pid) && pid > 0 ? pid : (typeof pid === 'string' && /^\d+$/.test(pid) ? Number(pid) : null);
  const pidNeedle = pidNum ? `pid=${pidNum}` : null;

  let fallbackHermesPort = null;
  const lines = ssOutput.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes('127.0.0.1:')) continue;
    // Reject wildcard / non-loopback lines even if 127.0.0.1 appears later as peer
    const match = line.match(/^\s*LISTEN\s+\S+\s+\S+\s+127\.0\.0\.1:(\d{2,5})\s+/i)
      || line.match(/\b127\.0\.0\.1:(\d{2,5})\b/);
    if (!match) continue;
    // Ensure the local address column itself is 127.0.0.1, not 0.0.0.0 or [::]
    const tokens = line.trim().split(/\s+/);
    const localAddr = tokens.find((tok) => tok.includes(':') && !tok.startsWith('users:'));
    if (localAddr && !localAddr.startsWith('127.0.0.1:')) continue;

    const port = Number(match[1]);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) continue;

    if (pidNeedle && line.includes(pidNeedle)) {
      return port;
    }
    if (/"hermes"/i.test(line) && fallbackHermesPort === null) {
      fallbackHermesPort = port;
    }
  }
  return fallbackHermesPort;
}

function bytesToGib(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return null;
  return Math.round((bytes / (1024 ** 3)) * 100) / 100;
}

function bytesToMib(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return null;
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

/**
 * Build a unified, honest health & advisory report reconciling systemd state,
 * `/api/health`, `/api/status`, local `gateway_state.json`, AF_UNIX socket,
 * and `state.db` size. All output is strictly redacted.
 */
export function synthesizeGatewayHealth({
  systemd = null,
  health = null,
  status = null,
  gatewayState = null,
  stateDbBytes = null,
  socketExists = false,
  listenerPort = null,
  memoryLimits = null,
  checkedAt = null,
} = {}) {
  const safeSystemd = systemd && typeof systemd === 'object' ? systemd : {};
  const safeHealth = health && typeof health === 'object' ? health : null;
  const safeStatus = status && typeof status === 'object' ? status : null;
  const safeState = gatewayState && typeof gatewayState === 'object' ? gatewayState : null;

  const validPort = Number.isInteger(listenerPort) && listenerPort >= 1024 && listenerPort <= 65535
    ? listenerPort
    : null;

  const active = Boolean(
    safeSystemd.active
    || safeSystemd.activeState === 'active'
    || (safeHealth && safeHealth.ok === true)
  );

  const pid = Number.isInteger(safeSystemd.pid) && safeSystemd.pid > 0
    ? safeSystemd.pid
    : (Number.isInteger(safeStatus?.gateway_pid) && safeStatus.gateway_pid > 0 ? safeStatus.gateway_pid : null);

  const profilesRaw = Array.isArray(safeStatus?.gateway_shared_with) && safeStatus.gateway_shared_with.length > 0
    ? safeStatus.gateway_shared_with
    : (Array.isArray(safeState?.served_profiles) ? safeState.served_profiles : []);
  const profiles = Array.from(new Set(profilesRaw.filter((p) => typeof p === 'string' && p.trim()).map((p) => p.trim())));

  // Reconcile platforms from gateway_state.json vs /api/status
  const platforms = {};
  if (safeState?.platforms && typeof safeState.platforms === 'object') {
    for (const [name, pdata] of Object.entries(safeState.platforms)) {
      if (pdata && typeof pdata === 'object') {
        platforms[name] = {
          state: String(pdata.state || 'unknown'),
          errorCode: pdata.error_code || pdata.errorCode || null,
          updatedAt: pdata.updated_at || pdata.updatedAt || null,
          source: 'gateway_state.json',
        };
      }
    }
  }
  if (safeStatus?.gateway_platforms && typeof safeStatus.gateway_platforms === 'object') {
    for (const [name, pdata] of Object.entries(safeStatus.gateway_platforms)) {
      if (!platforms[name] && pdata && typeof pdata === 'object') {
        platforms[name] = {
          state: String(pdata.state || 'ok'),
          errorCode: pdata.error_code || null,
          updatedAt: pdata.updated_at || null,
          source: '/api/status',
        };
      }
    }
  }

  const memCurrentBytes = Number.isFinite(safeSystemd.memoryCurrentBytes) ? safeSystemd.memoryCurrentBytes : null;
  const memPeakBytes = Number.isFinite(safeSystemd.memoryPeakBytes) ? safeSystemd.memoryPeakBytes : null;
  const rssMb = Number.isFinite(safeStatus?.memory?.gateway_rss_mb) ? safeStatus.memory.gateway_rss_mb : null;
  const dbBytes = Number.isFinite(stateDbBytes) && stateDbBytes >= 0 ? stateDbBytes : null;

  const warnings = [];

  // 1. Reconcile platform contradictions (e.g. stale whatsapp fatal vs /api/status overall=ok)
  for (const [pname, pinfo] of Object.entries(platforms)) {
    if (pinfo.state === 'fatal' || pinfo.state === 'error') {
      const statusClaimsOk = safeStatus?.overall === 'ok' && (!safeStatus.gateway_platforms || !safeStatus.gateway_platforms[pname]);
      warnings.push({
        code: `PLATFORM_${pname.toUpperCase()}_STALE_FATAL`,
        severity: 'warning',
        title: `${pname} platform state is ${pinfo.state}`,
        detail: `${pinfo.source} reports ${pname} in ${pinfo.state} (${pinfo.errorCode || 'unpaired'})${pinfo.updatedAt ? ` since ${pinfo.updatedAt.slice(0, 10)}` : ''}${statusClaimsOk ? ' while /api/status omits it and reports overall=ok' : ''}. Clear or pair during a planned maintenance window.`,
      });
    }
  }

  // 2. state.db bloat threshold (>= 1 GiB)
  if (dbBytes !== null && dbBytes >= STATE_DB_WARNING_BYTES) {
    warnings.push({
      code: 'STATE_DB_BLOAT',
      severity: 'warning',
      title: `state.db is ${bytesToGib(dbBytes)} GiB (>= 1.0 GiB)`,
      detail: 'Large SQLite session history slows standalone dashboard initial hydration. Compact during a maintenance window with `hermes sessions optimize-storage`.',
    });
  }

  // 3. Cgroup memory peak vs 3 GiB high / 4 GiB max target
  if (memPeakBytes !== null && memPeakBytes >= MEMORY_HIGH_BYTES) {
    warnings.push({
      code: 'CGROUP_MEMORY_PEAK',
      severity: memPeakBytes >= MEMORY_MAX_BYTES ? 'warning' : 'info',
      title: `Cgroup memory peak reached ${bytesToGib(memPeakBytes)} GiB`,
      detail: `Current cgroup usage is ${bytesToGib(memCurrentBytes) ?? 'n/a'} GiB${rssMb ? ` (main process RSS ${rssMb} MiB + child harnesses)` : ''}. Hardened ZothOS unit sets MemoryHigh=3G / MemoryMax=4G.`,
    });
  }

  // 4. MEMORY.md / USER.md limit advisories
  if (memoryLimits && typeof memoryLimits === 'object') {
    if (Number.isFinite(memoryLimits.memoryMdChars) && memoryLimits.memoryMdChars > (memoryLimits.memoryMdLimit || 2200)) {
      warnings.push({
        code: 'MEMORY_MD_OVER_LIMIT',
        severity: 'warning',
        title: `MEMORY.md over limit (${memoryLimits.memoryMdChars} / ${memoryLimits.memoryMdLimit || 2200} chars)`,
        detail: 'Trim ~/.hermes/memories/MEMORY.md below 2,200 chars during maintenance so memory writes resume cleanly.',
      });
    }
    if (Number.isFinite(memoryLimits.userMdChars) && memoryLimits.userMdChars > (memoryLimits.userMdLimit || 1375)) {
      warnings.push({
        code: 'USER_MD_OVER_LIMIT',
        severity: 'warning',
        title: `USER.md over limit (${memoryLimits.userMdChars} / ${memoryLimits.userMdLimit || 1375} chars)`,
        detail: 'Trim ~/.hermes/memories/USER.md below 1,375 chars during maintenance so user profile memory updates are not blocked.',
      });
    }
  }

  // 5. Hardening status on live unit
  const hardening = safeSystemd.hardening && typeof safeSystemd.hardening === 'object' ? safeSystemd.hardening : null;
  if (safeSystemd.available && hardening && (!hardening.noNewPrivileges || !hardening.privateTmp)) {
    warnings.push({
      code: 'SYSTEMD_HARDENING_DEFERRED',
      severity: 'info',
      title: 'Hardened %h-portable unit staged in ZothOS chroot',
      detail: 'Live daemon runs untouched. Apply UMask=0077, NoNewPrivileges=yes, PrivateTmp=yes, MemoryMax=4G during the next scheduled maintenance window.',
    });
  }

  const warningCount = warnings.filter((w) => w.severity === 'warning').length;
  const reconciledHealth = !active
    ? 'offline'
    : (warningCount > 0 ? 'degraded-advisory' : 'healthy');

  const payload = {
    schemaVersion: HERMES_GATEWAY_SCHEMA_VERSION,
    mode: 'LIVE_LOOPBACK_TELEMETRY',
    liveApiReachable: true,
    readOnly: true,
    checkedAt: checkedAt || new Date().toISOString(),
    unit: safeSystemd.unit || HERMES_GATEWAY_UNIT,
    active,
    reconciledHealth,
    systemd: {
      available: Boolean(safeSystemd.available),
      activeState: safeSystemd.activeState || (active ? 'active' : 'inactive'),
      subState: safeSystemd.subState || (active ? 'running' : 'dead'),
      unitFileState: safeSystemd.unitFileState || 'unknown',
      pid,
      tasks: Number.isFinite(safeSystemd.tasks) ? safeSystemd.tasks : null,
      startedAt: safeSystemd.startedAt || null,
      memoryCurrentBytes: memCurrentBytes,
      memoryPeakBytes: memPeakBytes,
      memoryCurrentGib: bytesToGib(memCurrentBytes),
      memoryPeakGib: bytesToGib(memPeakBytes),
      memoryCurrentMib: bytesToMib(memCurrentBytes),
      memoryPeakMib: bytesToMib(memPeakBytes),
      targetMemoryHighGib: 3,
      targetMemoryMaxGib: 4,
      fragmentPath: safeSystemd.fragmentPath || '~/.config/systemd/user/hermes-gateway.service',
      hardening: hardening || {
        noNewPrivileges: false,
        privateTmp: false,
        umask: '',
        memoryMax: '',
      },
    },
    listener: {
      host: validPort ? '127.0.0.1' : null,
      port: validPort,
      url: validPort ? `http://127.0.0.1:${validPort}` : null,
      healthUrl: validPort ? `http://127.0.0.1:${validPort}/api/health` : null,
      loopbackOnly: true,
      discovery: validPort ? 'ss-loopback-pid' : 'none',
    },
    socket: {
      path: '~/.hermes/gateway.sock',
      exists: Boolean(socketExists),
    },
    storage: {
      stateDbPath: '~/.hermes/state.db',
      stateDbBytes: dbBytes,
      stateDbGib: bytesToGib(dbBytes),
      bloatThresholdGib: 1,
      bloated: dbBytes !== null && dbBytes >= STATE_DB_WARNING_BYTES,
    },
    gateway: {
      version: safeHealth?.displayVersion || safeHealth?.version || safeStatus?.version || null,
      commit: safeHealth?.commit || null,
      authRequired: typeof safeHealth?.auth_required === 'boolean' ? safeHealth.auth_required : null,
      state: safeStatus?.gateway_state || safeSystemd.subState || (active ? 'running' : 'offline'),
      upstreamOverall: safeStatus?.overall || null,
      gatewayRssMb: rssMb,
      activeAgents: Number.isFinite(safeStatus?.active_agents) ? safeStatus.active_agents : 0,
      activeSessions: Number.isFinite(safeStatus?.active_sessions) ? safeStatus.active_sessions : 0,
      profiles,
      profileCount: profiles.length,
      platforms,
    },
    warnings,
    upstreamAdvisories: [...UPSTREAM_SECURITY_UI_ADVISORIES],
    operatorCommands: [...SAFE_OPERATOR_COMMANDS],
    maintenanceRunbookPath: '~/NullAITech/zoth-os/docs/HERMES_GATEWAY_MAINTENANCE.md',
  };

  return redactHermesPathsAndSecrets(payload);
}

/**
 * Honest `BROWSER_OFFLINE_FALLBACK` snapshot when Studio `:3000` loopback API
 * is unreachable (e.g. static Netlify deployment). Fabricates zero live PID/port.
 */
export function buildOfflineHermesGatewaySnapshot(checkedAt = null) {
  return {
    schemaVersion: HERMES_GATEWAY_SCHEMA_VERSION,
    mode: 'BROWSER_OFFLINE_FALLBACK',
    liveApiReachable: false,
    readOnly: true,
    checkedAt: checkedAt || new Date().toISOString(),
    unit: HERMES_GATEWAY_UNIT,
    active: false,
    reconciledHealth: 'offline-browser',
    systemd: {
      available: false,
      activeState: 'unprobed',
      subState: 'browser-offline',
      unitFileState: 'unknown',
      pid: null,
      tasks: null,
      startedAt: null,
      memoryCurrentBytes: null,
      memoryPeakBytes: null,
      memoryCurrentGib: null,
      memoryPeakGib: null,
      memoryCurrentMib: null,
      memoryPeakMib: null,
      targetMemoryHighGib: 3,
      targetMemoryMaxGib: 4,
      fragmentPath: '~/.config/systemd/user/hermes-gateway.service',
      hardening: {
        noNewPrivileges: false,
        privateTmp: false,
        umask: '',
        memoryMax: '',
      },
    },
    listener: {
      host: null,
      port: null,
      url: null,
      healthUrl: null,
      loopbackOnly: true,
      discovery: 'offline-fallback',
    },
    socket: {
      path: '~/.hermes/gateway.sock',
      exists: false,
    },
    storage: {
      stateDbPath: '~/.hermes/state.db',
      stateDbBytes: null,
      stateDbGib: null,
      bloatThresholdGib: 1,
      bloated: false,
    },
    gateway: {
      version: null,
      commit: null,
      authRequired: null,
      state: 'unprobed',
      upstreamOverall: null,
      gatewayRssMb: null,
      activeAgents: 0,
      activeSessions: 0,
      profiles: [],
      profileCount: 0,
      platforms: {},
    },
    warnings: [
      {
        code: 'STUDIO_LOOPBACK_OFFLINE',
        severity: 'info',
        title: 'Running in static browser fallback (Studio :3000 unreachable)',
        detail: 'Start Zoth Studio locally (`zoth up` on 127.0.0.1:3000) or paste output from `hermes-gateway status` / `systemctl --user show hermes-gateway.service` into the Offline Diagnostic Analyzer below.',
      },
    ],
    upstreamAdvisories: [...UPSTREAM_SECURITY_UI_ADVISORIES],
    operatorCommands: [...SAFE_OPERATOR_COMMANDS],
    maintenanceRunbookPath: '~/NullAITech/zoth-os/docs/HERMES_GATEWAY_MAINTENANCE.md',
  };
}

/**
 * Pure offline diagnostic parser for operator-pasted `hermes gateway status`
 * or `systemctl --user show hermes-gateway.service` output.
 */
export function parseOperatorDiagnosticText(rawText) {
  const safeText = redactHermesPathsAndSecrets(String(rawText || '').slice(0, 64 * 1024));
  const lines = safeText.split(/\r?\n/);

  const kv = {};
  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx > 0 && /^[A-Za-z][A-Za-z0-9_]*$/.test(line.slice(0, idx).trim())) {
      kv[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  let pid = kv.MainPID && /^\d+$/.test(kv.MainPID) && Number(kv.MainPID) > 0 ? Number(kv.MainPID) : null;
  if (!pid) {
    const m = safeText.match(/\bPID[:=\s]+(\d{2,7})\b/i);
    if (m) pid = Number(m[1]);
  }

  const active = kv.ActiveState === 'active'
    || /active\s*\(running\)/i.test(safeText)
    || /gateway service is running/i.test(safeText);

  const memCurrentBytes = kv.MemoryCurrent && /^\d+$/.test(kv.MemoryCurrent) ? Number(kv.MemoryCurrent) : null;
  const memPeakBytes = kv.MemoryPeak && /^\d+$/.test(kv.MemoryPeak) ? Number(kv.MemoryPeak) : null;

  const listenerPort = parseLoopbackListenerPort(safeText, pid)
    || (() => {
      const m = safeText.match(/\b127\.0\.0\.1:(\d{4,5})\b/);
      if (m) {
        const p = Number(m[1]);
        if (p >= 1024 && p <= 65535) return p;
      }
      return null;
    })();

  let stateDbBytes = null;
  const dbMatch = safeText.match(/state\.db[^\n]*?(\d+(?:\.\d+)?)\s*(GB|GiB|MB|MiB)/i);
  if (dbMatch) {
    const num = Number(dbMatch[1]);
    const unit = dbMatch[2].toLowerCase();
    if (Number.isFinite(num)) {
      stateDbBytes = Math.round(num * (unit.startsWith('g') ? 1024 ** 3 : 1024 ** 2));
    }
  }

  const platforms = {};
  if (/whatsapp.*(?:not paired|fatal|whatsapp_not_paired)/i.test(safeText)) {
    platforms.whatsapp = { state: 'fatal', error_code: 'whatsapp_not_paired', updated_at: null };
  }

  const profiles = [];
  const profMatch = safeText.match(/profiles?[^:\n]*:\s*([a-z0-9_,\s-]+)/i);
  if (profMatch) {
    for (const tok of profMatch[1].split(/[\s,]+/)) {
      const clean = tok.trim();
      if (clean && !/^\d+$/.test(clean) && clean.length <= 32 && !profiles.includes(clean)) {
        profiles.push(clean);
      }
    }
  }

  const memoryLimits = {};
  const memMd = safeText.match(/MEMORY\.md[^\n]*?(\d{3,6})\s*\/\s*(\d{3,5})/i);
  if (memMd) {
    memoryLimits.memoryMdChars = Number(memMd[1]);
    memoryLimits.memoryMdLimit = Number(memMd[2]);
  }
  const userMd = safeText.match(/USER\.md[^\n]*?(\d{3,6})\s*\/\s*(\d{3,5})/i);
  if (userMd) {
    memoryLimits.userMdChars = Number(userMd[1]);
    memoryLimits.userMdLimit = Number(userMd[2]);
  }

  const snapshot = synthesizeGatewayHealth({
    systemd: {
      available: Boolean(Object.keys(kv).length > 0 || active || pid),
      unit: kv.Id || HERMES_GATEWAY_UNIT,
      active,
      activeState: kv.ActiveState || (active ? 'active' : 'unknown'),
      subState: kv.SubState || (active ? 'running' : 'unknown'),
      unitFileState: kv.UnitFileState || 'unknown',
      pid,
      memoryCurrentBytes: memCurrentBytes,
      memoryPeakBytes: memPeakBytes,
      startedAt: kv.ExecMainStartTimestamp || null,
      fragmentPath: kv.FragmentPath || '~/.config/systemd/user/hermes-gateway.service',
      hardening: {
        noNewPrivileges: kv.NoNewPrivileges === 'yes',
        privateTmp: kv.PrivateTmp === 'yes',
        umask: kv.UMask || '',
        memoryMax: kv.MemoryMax || '',
      },
    },
    gatewayState: { platforms, served_profiles: profiles },
    stateDbBytes,
    socketExists: /gateway\.sock/i.test(safeText),
    listenerPort,
    memoryLimits: Object.keys(memoryLimits).length ? memoryLimits : null,
  });

  const recommendedMaintenance = [];
  if (snapshot.storage.bloated) {
    recommendedMaintenance.push('hermes sessions optimize-storage');
  }
  if (snapshot.warnings.some((w) => w.code === 'MEMORY_MD_OVER_LIMIT' || w.code === 'USER_MD_OVER_LIMIT')) {
    recommendedMaintenance.push('# Trim ~/.hermes/memories/MEMORY.md (<2200 chars) and USER.md (<1375 chars)');
  }
  if (snapshot.warnings.some((w) => w.code.startsWith('PLATFORM_'))) {
    recommendedMaintenance.push('# Reconcile stale platform entry in ~/.hermes/gateway_state.json during maintenance window');
  }
  if (snapshot.warnings.some((w) => w.code === 'SYSTEMD_HARDENING_DEFERRED')) {
    recommendedMaintenance.push('cp ~/NullAITech/zoth-os/config/includes.chroot/etc/systemd/user/hermes-gateway.service ~/.config/systemd/user/hermes-gateway.service && systemctl --user daemon-reload');
  }

  return redactHermesPathsAndSecrets({
    ok: true,
    mode: 'DIAGNOSTIC_PARSER',
    redacted: true,
    lineCount: lines.length,
    snapshot,
    recommendedMaintenance,
  });
}

/**
 * Neutralize spreadsheet formula-injection prefixes (`=`, `+`, `-`, `@`, `\t`, `\r`).
 */
export function neutralizeCsvCell(value) {
  const raw = redactHermesPathsAndSecrets(value === null || value === undefined ? '' : String(value));
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Format sanitized JSON, Markdown operator brief, and formula-safe CSV exports.
 */
export function formatHermesTelemetryExports(snapshot) {
  const safe = redactHermesPathsAndSecrets(snapshot || buildOfflineHermesGatewaySnapshot());

  const json = JSON.stringify(safe, null, 2);

  const profilesStr = safe.gateway?.profiles?.length
    ? safe.gateway.profiles.join(', ')
    : 'none reported';

  const warningLines = (safe.warnings || []).length
    ? safe.warnings.map((w) => `- **[${String(w.severity || 'info').toUpperCase()}] ${w.code}**: ${w.title} — ${w.detail}`).join('\n')
    : '- None';

  const markdown = [
    '# Hermes Agent Gateway — Read-Only Operator Brief',
    '',
    `- **Mode:** \`${safe.mode}\``,
    `- **Checked At:** \`${safe.checkedAt}\``,
    `- **Unit:** \`${safe.unit}\` (\`${safe.systemd?.activeState}/${safe.systemd?.subState}\`, PID \`${safe.systemd?.pid ?? 'n/a'}\`)`,
    `- **Loopback Listener:** \`${safe.listener?.url || 'none'}\` (discovery: \`${safe.listener?.discovery || 'none'}\`)`,
    `- **AF_UNIX Socket:** \`${safe.socket?.path || '~/.hermes/gateway.sock'}\` (${safe.socket?.exists ? 'present' : 'missing'})`,
    `- **Cgroup RAM:** \`${safe.systemd?.memoryCurrentGib ?? 'n/a'} GiB\` current / \`${safe.systemd?.memoryPeakGib ?? 'n/a'} GiB\` peak (target High \`3 GiB\` / Max \`4 GiB\`)`,
    `- **State DB:** \`${safe.storage?.stateDbPath || '~/.hermes/state.db'}\` (\`${safe.storage?.stateDbGib ?? 'n/a'} GiB\`)`,
    `- **Multiplexed Profiles (${safe.gateway?.profileCount ?? 0}):** ${profilesStr}`,
    '',
    '## Operational Advisories',
    warningLines,
    '',
    '## Safe Read-Only CLI Commands',
    ...(safe.operatorCommands || []).map((c) => `- \`${c.command}\` — ${c.label}`),
    '',
    `Maintenance Runbook (opt-in only): \`${safe.maintenanceRunbookPath || '~/NullAITech/zoth-os/docs/HERMES_GATEWAY_MAINTENANCE.md'}\``,
  ].join('\n');

  const rows = [
    ['Section', 'Key', 'Value', 'Status'],
    ['Systemd', 'unit', safe.unit, safe.systemd?.activeState || 'unknown'],
    ['Systemd', 'pid', safe.systemd?.pid ?? '', safe.active ? 'active' : 'offline'],
    ['Systemd', 'memory_current_gib', safe.systemd?.memoryCurrentGib ?? '', 'info'],
    ['Systemd', 'memory_peak_gib', safe.systemd?.memoryPeakGib ?? '', safe.systemd?.memoryPeakGib >= 3 ? 'warning' : 'ok'],
    ['Listener', 'loopback_url', safe.listener?.url || '', safe.listener?.port ? 'active' : 'offline'],
    ['Socket', 'gateway_sock', safe.socket?.path || '~/.hermes/gateway.sock', safe.socket?.exists ? 'present' : 'missing'],
    ['Storage', 'state_db_gib', safe.storage?.stateDbGib ?? '', safe.storage?.bloated ? 'warning' : 'ok'],
    ['Profiles', 'multiplexed_profiles', profilesStr, String(safe.gateway?.profileCount ?? 0)],
    ...(safe.warnings || []).map((w) => ['Advisory', w.code, `${w.title}: ${w.detail}`, w.severity]),
  ];

  const csv = rows.map((row) => row.map(neutralizeCsvCell).join(',')).join('\n');

  return { json, markdown, csv };
}
