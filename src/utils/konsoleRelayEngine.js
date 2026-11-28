/**
 * Konsole Relay (#050) Pure ESM Telemetry, Security Posture & Runbook Engine.
 * Byte-identical between src/utils/konsoleRelayEngine.js and server/konsole-relay-engine.mjs.
 * Strictly read-only: NEVER reads bearer tokens and NEVER invokes POST /send.
 */

export const KONSOLE_RELAY_SCHEMA_VERSION = '2.1.0';
export const KONSOLE_RELAY_UNIT = 'konsole-relay.service';
export const KONSOLE_RELAY_DEFAULT_PORT = 8797;

export const KONSOLE_RELAY_CLI_PRESETS = Object.freeze([
  {
    id: 'status',
    label: 'Daemon Status (JSON)',
    command: 'konsole-relay status --json',
    readOnly: true,
    description: 'Inspect systemd unit state, loopback /health, 0700/0600 permissions, and Konsole session count.',
  },
  {
    id: 'ls',
    label: 'List Konsole Sessions (JSON)',
    command: 'konsole-relay ls --json',
    readOnly: true,
    description: 'Enumerate active KDE Konsole D-Bus sessions with explicit svc/sid identifiers.',
  },
  {
    id: 'health',
    label: 'Loopback /health Probe',
    command: 'konsole-relay health --json',
    readOnly: true,
    description: 'Verify http://127.0.0.1:8797/health responds HTTP 200 without authentication.',
  },
  {
    id: 'audit',
    label: 'Recent Audit Trail',
    command: 'konsole-relay audit -n 20 --json',
    readOnly: true,
    description: 'Display recent secret-scrubbed entries from ~/.config/konsole-relay/audit.log.',
  },
  {
    id: 'journal',
    label: 'User Journal Tail',
    command: 'journalctl --user -u konsole-relay.service -n 20 --no-pager',
    readOnly: true,
    description: 'Inspect recent systemd user journal logs for konsole-relay.service.',
  },
]);

const HOME_PATH_RE = /(?<![A-Za-z0-9._:-])\/(?:home|Users)\/(?!\.config\b)[A-Za-z0-9._-]+(?=\/|$)/g;
const BEARER_RE = /\b(Bearer\s+)(?=[A-Za-z0-9._~+/=-]{16,}\b)[^\s"'`]+/gi;
const SECRET_TOKEN_RE = /\b(?:sk-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,}|AIza[0-9A-Za-z_-]{20,})\b/g;
const KV_SECRET_RE = /\b(password|passwd|secret|token|api[_-]?key|access[_-]?token)(\s*[:=]\s*)([^\s&;,"']+)/gi;

export function redactKonsoleRelayText(text) {
  if (typeof text !== 'string' || !text) return text;
  return text
    .replace(HOME_PATH_RE, '~')
    .replace(BEARER_RE, '$1[REDACTED]')
    .replace(SECRET_TOKEN_RE, '[REDACTED]')
    .replace(KV_SECRET_RE, '$1$2[REDACTED]');
}

export function redactKonsoleRelayPaths(value) {
  if (typeof value === 'string') return redactKonsoleRelayText(value);
  if (Array.isArray(value)) return value.map((item) => redactKonsoleRelayPaths(item));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactKonsoleRelayPaths(v);
    }
    return out;
  }
  return value;
}

export function parseKonsoleRelayListener(ssOutput, pid = null, expectedPort = KONSOLE_RELAY_DEFAULT_PORT) {
  const result = {
    host: null,
    port: expectedPort,
    url: null,
    loopbackOnly: false,
    wildcardExposed: false,
    discovery: 'none',
  };
  if (typeof ssOutput !== 'string' || !ssOutput.trim()) return result;

  const lines = ssOutput.split(/\r?\n/);
  const pidToken = pid ? `pid=${pid}` : null;
  const portSuffix = `:${expectedPort}`;

  const matched = [];
  for (const line of lines) {
    if (!line.includes('LISTEN')) continue;
    const cols = line.trim().split(/\s+/);
    const localAddr = cols[3] || '';
    const matchesPid = pidToken && line.includes(pidToken);
    const matchesPort = localAddr.endsWith(portSuffix);
    if (!matchesPid && !matchesPort) continue;

    const lastColon = localAddr.lastIndexOf(':');
    if (lastColon <= 0) continue;
    const rawHost = localAddr.slice(0, lastColon).replace(/^\[|\]$/g, '');
    const portNum = Number(localAddr.slice(lastColon + 1));
    if (!Number.isInteger(portNum) || portNum <= 0 || portNum > 65535) continue;
    matched.push({ host: rawHost, port: portNum, matchesPid: Boolean(matchesPid) });
  }

  if (matched.length === 0) return result;
  matched.sort((a, b) => Number(b.matchesPid) - Number(a.matchesPid));
  const best = matched[0];
  const isWildcard = best.host === '0.0.0.0' || best.host === '*' || best.host === '::';
  const isLoopback = best.host === '127.0.0.1' || best.host === '::1' || best.host === 'localhost';

  return {
    host: best.host,
    port: best.port,
    url: isLoopback ? `http://127.0.0.1:${best.port}` : `http://${best.host}:${best.port}`,
    loopbackOnly: isLoopback && !isWildcard,
    wildcardExposed: isWildcard,
    discovery: best.matchesPid ? 'ss-pid' : 'ss-port',
  };
}

export function scoreKonsoleRelayPosture({
  systemd = {},
  listener = {},
  health = {},
  permissions = {},
  backupExcluded = true,
} = {}) {
  const checks = [];
  const advisories = [];

  const loopbackOk = Boolean(listener?.loopbackOnly) && !listener?.wildcardExposed;
  checks.push({
    id: 'loopback_bind',
    label: 'Loopback-Only Bind (127.0.0.1)',
    passed: loopbackOk,
    weight: 20,
    detail: loopbackOk
      ? `Bound strictly to ${listener.host}:${listener.port}`
      : (listener?.wildcardExposed ? 'Wildcard exposure detected!' : 'Listener not detected on 127.0.0.1:8797'),
  });
  if (!loopbackOk && listener?.wildcardExposed) {
    advisories.push({
      code: 'WILDCARD_BIND',
      severity: 'warning',
      title: 'Wildcard listener detected',
      detail: 'konsole-relay must bind strictly to 127.0.0.1:8797 and never 0.0.0.0.',
    });
  }

  const healthOk = Boolean(health?.ok);
  checks.push({
    id: 'health_ok',
    label: 'Loopback /health Liveness',
    passed: healthOk,
    weight: 15,
    detail: healthOk ? `HTTP ${health.statusCode || 200} on :${listener?.port || KONSOLE_RELAY_DEFAULT_PORT}` : 'Loopback /health unreachable',
  });

  const confOk = Boolean(permissions?.confDir?.exists) && permissions?.confDir?.mode === '0700';
  checks.push({
    id: 'conf_mode',
    label: 'Config Dir Mode (0700)',
    passed: confOk,
    weight: 10,
    detail: permissions?.confDir?.exists ? `mode ${permissions.confDir.mode}` : '~/.config/konsole-relay missing',
  });

  const tokenOk = Boolean(permissions?.tokenFile?.exists) && permissions?.tokenFile?.mode === '0600';
  checks.push({
    id: 'token_mode',
    label: 'Bearer Token Mode (0600, stat-only)',
    passed: tokenOk,
    weight: 15,
    detail: permissions?.tokenFile?.exists
      ? `mode ${permissions.tokenFile.mode} (${permissions.tokenFile.size ?? 0} B, never read)`
      : '~/.config/konsole-relay/token missing',
  });
  if (!tokenOk) {
    advisories.push({
      code: 'TOKEN_PERMS',
      severity: 'warning',
      title: 'Token file mode requires 0600',
      detail: 'Run `chmod 0700 ~/.config/konsole-relay && chmod 0600 ~/.config/konsole-relay/token`.',
    });
  }

  const auditOk = !permissions?.auditFile?.exists || permissions?.auditFile?.mode === '0600';
  checks.push({
    id: 'audit_mode',
    label: 'Audit Log Mode (0600)',
    passed: auditOk,
    weight: 10,
    detail: permissions?.auditFile?.exists
      ? `mode ${permissions.auditFile.mode} (${permissions.auditFile.size ?? 0} B)`
      : 'No audit.log created yet',
  });

  const backupOk = Boolean(backupExcluded);
  checks.push({
    id: 'cloud_backup_excluded',
    label: 'Cloud Backup Exclusion (zoth-gdrive-backup)',
    passed: backupOk,
    weight: 15,
    detail: backupOk
      ? '~/.config/konsole-relay excluded from Google Drive backup script'
      : 'CRITICAL: ~/.config/konsole-relay still referenced in zoth-gdrive-backup',
  });
  if (!backupOk) {
    advisories.push({
      code: 'CLOUD_BACKUP_LEAK',
      severity: 'warning',
      title: 'Cloud backup references ~/.config/konsole-relay',
      detail: 'Remove ~/.config/konsole-relay from /usr/local/bin/zoth-gdrive-backup and rotate the bearer token.',
    });
  }

  const h = systemd?.hardening || {};
  const unitHardened = Boolean(
    h.noNewPrivileges &&
    h.privateTmp &&
    String(h.umask || '').endsWith('077') &&
    h.memoryMax &&
    h.memoryMax !== 'infinity'
  );
  checks.push({
    id: 'systemd_hardening',
    label: 'Systemd Unit Hardening Active',
    passed: unitHardened,
    weight: 15,
    detail: unitHardened
      ? `NoNewPrivileges=yes · PrivateTmp=yes · UMask=${h.umask} · MemoryMax=${h.memoryMax}`
      : 'Hardened unit staged on disk; pending opt-in maintenance-window reload',
  });
  if (systemd?.active && !unitHardened) {
    advisories.push({
      code: 'MAINTENANCE_WINDOW_CUTOVER',
      severity: 'info',
      title: 'Hardened v2.1.0 unit & daemon staged on disk',
      detail: 'Live konsole-relay.service was kept untouched. During your next maintenance window, install ~/konsole-relay/konsole-relay.service, run `konsole-relay init-token --rotate`, restart the user unit, and purge any legacy cloud backup copy.',
    });
  }

  const score = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : 'D';

  return { score, grade, checks, advisories };
}

export function synthesizeMaintenanceChecklist(posture = {}) {
  const steps = [
    {
      step: 1,
      title: 'Install hardened %h-portable systemd user unit',
      command: 'cp ~/konsole-relay/konsole-relay.service ~/.config/systemd/user/konsole-relay.service && systemctl --user daemon-reload',
    },
    {
      step: 2,
      title: 'Verify unit syntax cleanly',
      command: 'systemd-analyze --user verify ~/.config/systemd/user/konsole-relay.service',
    },
    {
      step: 3,
      title: 'Atomically rotate 0600 bearer token (never printed)',
      command: 'konsole-relay init-token --rotate',
    },
    {
      step: 4,
      title: 'Restart konsole-relay.service during maintenance window & verify',
      command: 'systemctl --user restart konsole-relay.service && konsole-relay status --json',
    },
    {
      step: 5,
      title: 'Purge any historical cloud backup copy of old token/audit log',
      command: 'rclone purge "gdrive20tb:Zoth-Workstation-Backup-2026-11/home/.config/konsole-relay"',
    },
  ];
  return {
    pendingCutover: Boolean((posture.advisories || []).some((a) => a.code === 'MAINTENANCE_WINDOW_CUTOVER')),
    steps,
  };
}

export function synthesizeKonsoleRelayStatus({
  systemd = {},
  listener = {},
  health = {},
  permissions = {},
  backupExcluded = true,
  konsoleSessions = null,
} = {}) {
  const memBytes = systemd?.memoryCurrentBytes;
  const memPeakBytes = systemd?.memoryPeakBytes;
  const normSystemd = {
    available: Boolean(systemd?.available),
    unit: systemd?.unit || KONSOLE_RELAY_UNIT,
    active: Boolean(systemd?.active),
    activeState: systemd?.activeState || 'unavailable',
    subState: systemd?.subState || 'unknown',
    unitFileState: systemd?.unitFileState || 'unknown',
    pid: systemd?.pid ?? null,
    tasks: systemd?.tasks ?? null,
    startedAt: systemd?.startedAt || null,
    memoryCurrentBytes: memBytes ?? null,
    memoryCurrentMb: typeof memBytes === 'number' ? Number((memBytes / (1024 * 1024)).toFixed(1)) : null,
    memoryPeakBytes: memPeakBytes ?? null,
    memoryPeakMb: typeof memPeakBytes === 'number' ? Number((memPeakBytes / (1024 * 1024)).toFixed(1)) : null,
    fragmentPath: redactKonsoleRelayText(systemd?.fragmentPath || '~/.config/systemd/user/konsole-relay.service'),
    hardening: {
      noNewPrivileges: Boolean(systemd?.hardening?.noNewPrivileges),
      privateTmp: Boolean(systemd?.hardening?.privateTmp),
      umask: String(systemd?.hardening?.umask || ''),
      memoryMax: String(systemd?.hardening?.memoryMax || ''),
    },
  };

  const normListener = {
    host: listener?.host || null,
    port: listener?.port || KONSOLE_RELAY_DEFAULT_PORT,
    url: listener?.url || null,
    loopbackOnly: Boolean(listener?.loopbackOnly),
    wildcardExposed: Boolean(listener?.wildcardExposed),
    discovery: listener?.discovery || 'none',
  };

  const normHealth = {
    ok: Boolean(health?.ok),
    statusCode: health?.statusCode ?? 0,
    latencyMs: health?.latencyMs ?? null,
  };

  const posture = scoreKonsoleRelayPosture({
    systemd: normSystemd,
    listener: normListener,
    health: normHealth,
    permissions,
    backupExcluded,
  });

  const active = Boolean(normSystemd.active || normHealth.ok);

  return redactKonsoleRelayPaths({
    schemaVersion: KONSOLE_RELAY_SCHEMA_VERSION,
    mode: 'loopback-live',
    readOnly: true,
    checkedAt: new Date().toISOString(),
    unit: KONSOLE_RELAY_UNIT,
    port: normListener.port,
    active,
    systemd: normSystemd,
    listener: normListener,
    health: normHealth,
    permissions,
    backupExcluded: Boolean(backupExcluded),
    konsoleSessions: typeof konsoleSessions === 'number' ? konsoleSessions : null,
    posture,
    maintenanceChecklist: synthesizeMaintenanceChecklist(posture),
    cliPresets: KONSOLE_RELAY_CLI_PRESETS,
  });
}

export function buildOfflineKonsoleRelaySnapshot() {
  const posture = scoreKonsoleRelayPosture({
    systemd: { active: false, hardening: {} },
    listener: { host: null, port: KONSOLE_RELAY_DEFAULT_PORT, loopbackOnly: false },
    health: { ok: false, statusCode: 0 },
    permissions: {},
    backupExcluded: true,
  });
  return {
    schemaVersion: KONSOLE_RELAY_SCHEMA_VERSION,
    mode: 'offline-fallback',
    readOnly: true,
    checkedAt: new Date().toISOString(),
    unit: KONSOLE_RELAY_UNIT,
    port: KONSOLE_RELAY_DEFAULT_PORT,
    active: false,
    systemd: {
      available: false,
      unit: KONSOLE_RELAY_UNIT,
      active: false,
      activeState: 'offline',
      subState: 'unprobed',
      unitFileState: 'unknown',
      pid: null,
      tasks: null,
      startedAt: null,
      memoryCurrentBytes: null,
      memoryCurrentMb: null,
      memoryPeakBytes: null,
      memoryPeakMb: null,
      fragmentPath: '~/.config/systemd/user/konsole-relay.service',
      hardening: { noNewPrivileges: false, privateTmp: false, umask: '', memoryMax: '' },
    },
    listener: {
      host: '127.0.0.1',
      port: KONSOLE_RELAY_DEFAULT_PORT,
      url: `http://127.0.0.1:${KONSOLE_RELAY_DEFAULT_PORT}`,
      loopbackOnly: true,
      wildcardExposed: false,
      discovery: 'offline',
    },
    health: { ok: false, statusCode: 0, latencyMs: null },
    permissions: {
      confDir: { path: '~/.config/konsole-relay', exists: false, mode: null, size: null, worldOrGroupPermissive: false },
      tokenFile: { path: '~/.config/konsole-relay/token', exists: false, mode: null, size: null, worldOrGroupPermissive: false },
      auditFile: { path: '~/.config/konsole-relay/audit.log', exists: false, mode: null, size: null, worldOrGroupPermissive: false },
    },
    backupExcluded: true,
    konsoleSessions: null,
    posture,
    maintenanceChecklist: synthesizeMaintenanceChecklist(posture),
    cliPresets: KONSOLE_RELAY_CLI_PRESETS,
  };
}
