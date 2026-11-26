import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, TextField,
  IconButton, Tabs, Tab, Slider, InputAdornment, Link,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import { STRIPE_COFFEE_URL, SOLANA_TIP_ADDRESS } from '../sovereign/SovereignPrimitives.jsx';
import { useCopy, downloadJson } from '../sovereign/hooks.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export const CAPSULE_DAEMON_ORIGIN = 'http://127.0.0.1:8105';
export const CAPSULE_TOKEN_STORAGE_KEY = 'acj-token';
const TARGET_VERSION = '2.6.0';

// ---------------------------------------------------------------------------
// Live enclave presets — sent verbatim as `command` to POST /api/exec.
// A string command runs as `/bin/sh -c <command>` inside the bubblewrap jail.
// ---------------------------------------------------------------------------
const ENCLAVE_PRESETS = [
  {
    label: 'Identity & kernel view',
    command: 'id && uname -sr && echo "cwd=$(pwd)" && ls /',
  },
  {
    label: 'Write scratch files (fs_diff)',
    command: 'echo \'{"ok":true}\' > receipt.json && mkdir -p out && date -u > out/stamp.txt && ls -la',
  },
  {
    label: 'Read-only root check',
    command: 'touch /usr/capsule_probe; echo "touch exit=$?"; ls -la /home /root /tmp',
  },
  {
    label: 'Network egress attempt',
    command: 'python3 -c "import socket; socket.create_connection((\'1.1.1.1\', 443), timeout=3); print(\'NETWORK REACHABLE\')"',
  },
  {
    label: 'Env secret stripping',
    command: 'env | cut -d= -f1 | sort',
  },
  {
    label: 'Process cap (max_procs)',
    command: 'i=0; while [ $i -lt 200 ]; do sleep 2 & i=$((i+1)); done; echo "spawn loop finished"; wait',
  },
];

// ---------------------------------------------------------------------------
// Offline browser worker presets — JavaScript evaluated in a Blob Web Worker.
// ---------------------------------------------------------------------------
const WORKER_PRESETS = [
  {
    label: 'Prime computation',
    code: `// Plain JavaScript computed inside the Web Worker thread
const primes = [];
for (let n = 2; n < 2000; n++) {
  let isP = true;
  for (let i = 2; i * i <= n; i++) { if (n % i === 0) { isP = false; break; } }
  if (isP) primes.push(n);
}
console.log("primes below 2000:", primes.length);
return { primeCount: primes.length, largest: primes[primes.length - 1] };`,
  },
  {
    label: 'Virtual scratch files',
    code: `// In-memory scratch map (not a real filesystem)
fs.writeFile("notes.txt", "written inside the worker at " + new Date().toISOString());
fs.writeFile("data.json", JSON.stringify({ items: [1, 2, 3] }, null, 2));
console.log("virtual files:", fs.listFiles().join(", "));
return { files: fs.listFiles() };`,
  },
  {
    label: 'Egress probes (should all block)',
    code: `// Each probe should report BLOCKED — including the prototype path
const probes = {
  fetch: () => fetch("https://example.com"),
  protoFetch: () => WorkerGlobalScope.prototype.fetch.call(self, "https://example.com"),
  xhr: () => new XMLHttpRequest(),
  websocket: () => new WebSocket("wss://example.com"),
  eventSource: () => new EventSource("https://example.com"),
  importScripts: () => importScripts("https://example.com/x.js"),
  nestedWorker: () => new Worker("data:text/javascript,1"),
  caches: () => caches.open("x"),
};
const report = {};
for (const [name, fn] of Object.entries(probes)) {
  try { fn(); report[name] = "REACHABLE"; }
  catch (err) { report[name] = "BLOCKED: " + String(err.message).slice(0, 80); }
}
console.log(JSON.stringify(report, null, 2));
return report;`,
  },
  {
    label: 'Infinite loop (watchdog)',
    code: `// The main thread calls worker.terminate() when the timeout expires
console.log("starting an infinite loop");
while (true) {}`,
  },
];

// ---------------------------------------------------------------------------
// Worker source. Lockdown runs BEFORE any user code: every egress primitive is
// deleted and replaced with a throwing getter on the global object AND on
// every prototype in its chain (DedicatedWorkerGlobalScope.prototype,
// WorkerGlobalScope.prototype, EventTarget.prototype). If any primitive is
// still reachable afterwards the worker refuses to run the code (fail closed).
// Results travel over a private MessagePort; self.postMessage is removed so
// user code cannot forge a result message.
// ---------------------------------------------------------------------------
const WORKER_BLOB_CODE = `
'use strict';
var BLOCKED = ['fetch', 'fetchLater', 'XMLHttpRequest', 'XMLHttpRequestUpload', 'XMLHttpRequestEventTarget',
  'WebSocket', 'WebSocketStream', 'EventSource', 'WebTransport', 'importScripts', 'Worker', 'SharedWorker',
  'indexedDB', 'IDBFactory', 'caches', 'CacheStorage', 'Cache', 'BroadcastChannel', 'FontFace', 'fonts',
  'RTCPeerConnection', 'webkitRTCPeerConnection', 'RTCDataChannel', 'navigator', 'Request'];

function chainOf(obj) {
  var out = [];
  var cur = obj;
  while (cur) { out.push(cur); cur = Object.getPrototypeOf(cur); }
  return out;
}

function blocker(name) {
  return function () {
    throw new Error('CAPSULE_EGRESS_BLOCKED: "' + name + '" is disabled in the offline browser worker sandbox');
  };
}

function lockdown() {
  var chain = chainOf(self);
  ['DedicatedWorkerGlobalScope', 'WorkerGlobalScope', 'EventTarget'].forEach(function (k) {
    try { var c = self[k]; if (c && c.prototype && chain.indexOf(c.prototype) === -1) chain.push(c.prototype); } catch (e) {}
  });
  var failures = [];
  BLOCKED.forEach(function (name) {
    chain.forEach(function (obj) {
      var desc = Object.getOwnPropertyDescriptor(obj, name);
      if (!desc && obj !== self) return;
      try { delete obj[name]; } catch (e) {}
      try {
        Object.defineProperty(obj, name, { get: blocker(name), set: function () {}, configurable: false, enumerable: false });
      } catch (e) {
        if (Object.getOwnPropertyDescriptor(obj, name)) failures.push(name);
      }
    });
  });
  // Verify: every remaining descriptor must be our throwing accessor.
  BLOCKED.forEach(function (name) {
    chain.forEach(function (obj) {
      var d = Object.getOwnPropertyDescriptor(obj, name);
      if (d && (d.value !== undefined || !d.get)) failures.push(name);
    });
  });
  return failures;
}

self.onmessage = function (e) {
  var port = e.ports && e.ports[0];
  if (!port) return;
  var send = port.postMessage.bind(port);
  self.onmessage = null;
  try { delete self.postMessage; } catch (err) {}
  try { Object.defineProperty(self, 'postMessage', { value: undefined, configurable: false, writable: false }); } catch (err) {}
  ['DedicatedWorkerGlobalScope'].forEach(function (k) {
    try { var p = self[k] && self[k].prototype; if (p) { delete p.postMessage; } } catch (err) {}
  });

  var failures = lockdown();
  var logs = [];
  var virtualFs = {};
  function fmt(args) {
    return Array.prototype.map.call(args, function (a) {
      if (typeof a === 'object') { try { return JSON.stringify(a); } catch (x) { return String(a); } }
      return String(a);
    }).join(' ');
  }
  var sandboxConsole = {
    log: function () { logs.push({ type: 'log', text: fmt(arguments) }); },
    info: function () { logs.push({ type: 'log', text: fmt(arguments) }); },
    warn: function () { logs.push({ type: 'warn', text: fmt(arguments) }); },
    error: function () { logs.push({ type: 'error', text: fmt(arguments) }); },
  };
  var fsApi = {
    writeFile: function (name, content) { virtualFs[String(name)] = String(content); logs.push({ type: 'fs', text: '[vfs] wrote ' + name }); },
    readFile: function (name) { return Object.prototype.hasOwnProperty.call(virtualFs, name) ? virtualFs[name] : null; },
    listFiles: function () { return Object.keys(virtualFs); },
  };
  function safe(v) {
    if (v === undefined) return undefined;
    try { return JSON.parse(JSON.stringify(v)); } catch (x) { return String(v); }
  }
  if (failures.length) {
    send({ success: false, error: 'Lockdown incomplete (' + failures.join(', ') + '); refusing to run code.', logs: logs, elapsed: 0, virtualFs: {}, lockdown: failures });
    return;
  }
  var t0 = performance.now();
  function done(ok, payload) {
    var elapsed = performance.now() - t0;
    if (ok) send({ success: true, result: safe(payload), logs: logs, elapsed: elapsed, virtualFs: virtualFs });
    else send({ success: false, error: String(payload && payload.message || payload), logs: logs, elapsed: elapsed, virtualFs: virtualFs });
  }
  try {
    var fn = new Function('console', 'fs', '"use strict";\\n' + e.data.code);
    var out = fn(sandboxConsole, fsApi);
    if (out && typeof out.then === 'function') out.then(function (v) { done(true, v); }, function (err) { done(false, err); });
    else done(true, out);
  } catch (err) {
    done(false, err);
  }
};
`;

// Recursively key-sorted JSON with no whitespace — matches Python
// json.dumps(sort_keys=True, separators=(",", ":"), ensure_ascii=False).
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

async function sha256Hex(text) {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readSessionToken() {
  try { return window.sessionStorage.getItem(CAPSULE_TOKEN_STORAGE_KEY) || ''; } catch { return ''; }
}

function writeSessionToken(value) {
  try {
    if (value) window.sessionStorage.setItem(CAPSULE_TOKEN_STORAGE_KEY, value);
    else window.sessionStorage.removeItem(CAPSULE_TOKEN_STORAGE_KEY);
  } catch { /* storage disabled */ }
}

function formatUptime(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}

const HTTP_HINTS = {
  400: 'Bad input or policy violation — the daemon rejected the request body.',
  401: 'Missing or invalid token. Run `agent-capsule-jail token` and paste the value above.',
  403: 'Blocked by the origin/host guard or the network opt-in gate (CAPSULE_ALLOW_NETWORK=1).',
  413: 'Request body is larger than 5 MB.',
  500: 'Internal daemon error — check the daemon log.',
};

export function AgentCapsuleJailGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const t = useMemo(() => ({
    text: isDark ? '#F5F1E6' : '#101828',
    sub: isDark ? '#A3AAB8' : '#475467',
    gold: isDark ? '#D4AF37' : '#7A5808',
    accent: isDark ? '#38BDF8' : '#0369A1',
    accentSoft: isDark ? 'rgba(56,189,248,0.12)' : '#E0F2FE',
    ok: isDark ? '#34D399' : '#047857',
    okSoft: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
    bad: isDark ? '#F87171' : '#B42318',
    badSoft: isDark ? 'rgba(248,113,113,0.12)' : '#FEF3F2',
    warn: isDark ? '#FBBF24' : '#B54708',
    warnSoft: isDark ? 'rgba(251,191,36,0.12)' : '#FFFAEB',
    card: isDark ? '#0D0F16' : '#FFFFFF',
    sunk: isDark ? '#08080B' : '#F7F5EF',
    border: isDark ? 'rgba(245,241,230,0.12)' : 'rgba(16,24,40,0.12)',
    term: isDark ? '#E2E8F0' : '#1D2939',
  }), [isDark]);

  const [mode, setMode] = useState('enclave'); // 'enclave' | 'worker'

  // --- Live daemon state ---------------------------------------------------
  const [health, setHealth] = useState({ state: 'checking', data: null, error: null });
  const [token, setToken] = useState(readSessionToken);
  const [showToken, setShowToken] = useState(false);
  const [command, setCommand] = useState(ENCLAVE_PRESETS[0].command);
  const [timeoutSec, setTimeoutSec] = useState(10);
  const [memoryMb, setMemoryMb] = useState(512);
  const [maxProcs, setMaxProcs] = useState(64);
  const [running, setRunning] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [liveError, setLiveError] = useState(null);
  const [receiptCheck, setReceiptCheck] = useState(null);
  const [liveTab, setLiveTab] = useState(0);

  // --- Offline worker state ------------------------------------------------
  const [workerCode, setWorkerCode] = useState(WORKER_PRESETS[0].code);
  const [workerTimeout, setWorkerTimeout] = useState(5);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerResult, setWorkerResult] = useState(null);
  const [workerTab, setWorkerTab] = useState(0);

  const workerRef = useRef(null);
  const watchdogRef = useRef(null);
  const workerUrlRef = useRef(null);
  const { copied, copy } = useCopy(1800);

  const probeHealth = useCallback(async () => {
    setHealth((h) => ({ ...h, state: 'checking' }));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    try {
      const res = await fetch(`${CAPSULE_DAEMON_ORIGIN}/api/health`, { cache: 'no-store', signal: ctrl.signal });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setHealth({ state: 'error', data: body, error: `HTTP ${res.status}${body?.error ? ` — ${body.error}` : ''}` });
      } else {
        setHealth({ state: 'online', data: body, error: null });
      }
    } catch (err) {
      setHealth({
        state: 'offline',
        data: null,
        error: err?.name === 'AbortError' ? 'No response from 127.0.0.1:8105 within 3 s' : `Unreachable: ${err?.message || err}`,
      });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => { probeHealth(); }, [probeHealth]);

  const killWorker = useCallback(() => {
    if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }
    if (workerUrlRef.current) { URL.revokeObjectURL(workerUrlRef.current); workerUrlRef.current = null; }
  }, []);

  useEffect(() => killWorker, [killWorker]);

  const updateToken = (value) => {
    setToken(value);
    writeSessionToken(value.trim());
  };

  // -------------------------------------------------------------------------
  // Live enclave execution: POST /api/exec on the local daemon
  // -------------------------------------------------------------------------
  const runEnclave = async () => {
    if (!command.trim() || running) return;
    setRunning(true);
    setLiveResult(null);
    setLiveError(null);
    setReceiptCheck(null);
    const headers = { 'Content-Type': 'application/json' };
    if (token.trim()) headers['X-Capsule-Token'] = token.trim();
    try {
      const res = await fetch(`${CAPSULE_DAEMON_ORIGIN}/api/exec`, {
        method: 'POST',
        headers,
        cache: 'no-store',
        body: JSON.stringify({ command, timeout_sec: timeoutSec, memory_mb: memoryMb, max_procs: maxProcs }),
      });
      const text = await res.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = null; }
      if (!res.ok) {
        setLiveError({
          kind: 'http',
          status: res.status,
          message: body?.error || text.slice(0, 300) || res.statusText || 'Request failed',
          hint: body?.hint || HTTP_HINTS[res.status] || null,
          policy: body?.policy_violation || null,
        });
        return;
      }
      if (!body || typeof body !== 'object') {
        setLiveError({ kind: 'parse', status: res.status, message: 'Daemon returned a non-JSON body', hint: null });
        return;
      }
      setLiveResult(body);
      setLiveTab(0);
      const local = await sha256Hex(canonicalJson({
        capsule_id: body.capsule_id,
        command: body.command,
        exit_code: body.exit_code,
        stdout: body.stdout,
        stderr: body.stderr,
        fs_diff: body.fs_diff,
      })).catch(() => null);
      if (!body.receipt_sha256) setReceiptCheck({ state: 'missing' });
      else if (!local) setReceiptCheck({ state: 'unavailable' });
      else setReceiptCheck({ state: local === body.receipt_sha256 ? 'match' : 'mismatch', local });
    } catch (err) {
      setLiveError({
        kind: 'network',
        status: null,
        message: `Network error — could not reach ${CAPSULE_DAEMON_ORIGIN}/api/exec (${err?.message || err})`,
        hint: 'Start the daemon with `agent-capsule-jail serve` and press Re-check.',
      });
    } finally {
      setRunning(false);
    }
  };

  // -------------------------------------------------------------------------
  // Offline browser JS worker (no kernel isolation, no bwrap)
  // -------------------------------------------------------------------------
  const runWorker = () => {
    if (!workerCode.trim()) return;
    killWorker();
    setWorkerRunning(true);
    setWorkerResult(null);
    try {
      const url = URL.createObjectURL(new Blob([WORKER_BLOB_CODE], { type: 'application/javascript' }));
      workerUrlRef.current = url;
      const worker = new Worker(url);
      workerRef.current = worker;
      const channel = new MessageChannel();
      watchdogRef.current = setTimeout(() => {
        killWorker();
        setWorkerRunning(false);
        setWorkerResult({
          success: false,
          timedOut: true,
          error: `Timed out after ${workerTimeout}s — worker.terminate() called by the main thread.`,
          elapsed: workerTimeout * 1000,
          logs: [],
          virtualFs: {},
        });
      }, workerTimeout * 1000);
      channel.port1.onmessage = (ev) => {
        killWorker();
        setWorkerRunning(false);
        setWorkerResult(ev.data);
      };
      worker.onerror = (err) => {
        err.preventDefault?.();
        killWorker();
        setWorkerRunning(false);
        setWorkerResult({ success: false, error: err.message || 'Worker error', elapsed: 0, logs: [], virtualFs: {} });
      };
      worker.postMessage({ code: workerCode }, [channel.port2]);
    } catch (err) {
      killWorker();
      setWorkerRunning(false);
      setWorkerResult({ success: false, error: err.message, elapsed: 0, logs: [], virtualFs: {} });
    }
  };

  // -------------------------------------------------------------------------
  // Shared UI pieces
  // -------------------------------------------------------------------------
  const btnSx = { minHeight: 44, fontFamily: mono, fontWeight: 700, textTransform: 'none', fontSize: '0.78rem' };
  const cardSx = { p: { xs: 2, md: 2.5 }, bgcolor: t.card, border: `1px solid ${t.border}`, borderRadius: 2, boxShadow: 'none', backgroundImage: 'none' };
  const termSx = {
    m: 0, p: 1.75, borderRadius: 1.5, bgcolor: t.sunk, border: `1px solid ${t.border}`, color: t.term,
    fontFamily: mono, fontSize: '0.76rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    overflowY: 'auto', maxHeight: 340, minHeight: 72,
  };
  const sliderSx = (color) => ({
    color,
    '&.MuiSlider-root': { py: '20px' },
    '& .MuiSlider-thumb': {
      width: 44, height: 44, bgcolor: 'transparent', boxShadow: 'none',
      '&::before': { width: 18, height: 18, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: color, boxShadow: 'none' },
      '&::after': { width: 44, height: 44 },
      '&:hover, &.Mui-focusVisible': { boxShadow: 'none', '&::before': { boxShadow: `0 0 0 6px ${color}33` } },
    },
  });

  const pill = (label, tone) => {
    const map = { ok: [t.ok, t.okSoft], bad: [t.bad, t.badSoft], warn: [t.warn, t.warnSoft], info: [t.accent, t.accentSoft], muted: [t.sub, t.sunk] };
    const [fg, bg] = map[tone] || map.muted;
    return (
      <Chip
        label={label}
        size="small"
        sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.7rem', color: fg, bgcolor: bg, border: `1px solid ${fg}44`, height: 'auto', py: 0.5, '& .MuiChip-label': { whiteSpace: 'normal' } }}
      />
    );
  };

  const kv = (rows) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
      {rows.map(([k, v]) => (
        <Box key={k} sx={{ p: 1, borderRadius: 1.25, bgcolor: t.sunk, border: `1px solid ${t.border}`, minWidth: 0 }}>
          <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: t.sub }}>{k}</Typography>
          <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 700, color: t.text, wordBreak: 'break-word' }}>{v}</Typography>
        </Box>
      ))}
    </Box>
  );

  const labelSx = { fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: t.sub, display: 'block', mb: 0.25 };

  const limitSlider = ({ id, label, value, onChange, min, max, step, unit, color, note }) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography component="label" id={`${id}-label`} htmlFor={id} sx={labelSx}>
        {label}: <strong style={{ color: t.text }}>{value}{unit}</strong>
      </Typography>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v)}
        aria-labelledby={`${id}-label`}
        slotProps={{ input: { id } }}
        sx={sliderSx(color)}
      />
      {note && <Typography sx={{ fontSize: '0.7rem', color: t.sub, mt: -0.5 }}>{note}</Typography>}
    </Box>
  );

  const hd = health.data || {};
  const daemonOnline = health.state === 'online';
  const healthPill = health.state === 'online'
    ? pill('DAEMON ONLINE', 'ok')
    : health.state === 'checking'
    ? pill('CHECKING…', 'warn')
    : health.state === 'error'
    ? pill('DAEMON ERROR', 'bad')
    : pill('DAEMON OFFLINE', 'bad');

  const statusTone = (s) => (s === 'success' ? 'ok' : s === 'timeout' || s === 'oom_killed' ? 'warn' : 'bad');
  const fsd = liveResult?.fs_diff || {};
  const fsCreated = Array.isArray(fsd.created) ? fsd.created : [];
  const fsModified = Array.isArray(fsd.modified) ? fsd.modified : [];
  const fsDeleted = Array.isArray(fsd.deleted) ? fsd.deleted : [];

  const fileRow = (f, tag) => {
    const item = typeof f === 'string' ? { path: f } : f || {};
    return (
      <Box key={`${tag}-${item.path}`} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'baseline', py: 0.5, borderBottom: `1px dashed ${t.border}` }}>
        <Box component="span" sx={{ color: tag === 'D' ? t.bad : tag === 'M' ? t.warn : t.ok, fontWeight: 800 }}>{tag}</Box>
        <Box component="span" sx={{ color: t.text, wordBreak: 'break-all' }}>{item.path}{item.is_dir ? '/' : ''}</Box>
        {item.size_bytes != null && <Box component="span" sx={{ color: t.sub }}>{item.size_bytes} B</Box>}
        {item.sha256 && <Box component="span" sx={{ color: t.sub, wordBreak: 'break-all' }}>sha256 {String(item.sha256).slice(0, 16)}…</Box>}
      </Box>
    );
  };

  return (
    <Box id="acj-deck" sx={{ mt: 1, color: t.text }}>
      <SovereignEyebrow accent={t.accent} right="Security & Enclave">
        {'agent-capsule-jail · v2.6.0'}
      </SovereignEyebrow>
      <SovereignBand
        seed="agent-capsule-jail"
        eyebrow="Capsule Seal / Namespace Ring"
        caption="Agent Capsule Jail"
        label="Agent Capsule Jail — capsule seal and namespace ring visualisation"
      />

      {/* Mode switch */}
      <Paper sx={{ ...cardSx, mb: 2.5 }}>
        <Typography sx={{ fontSize: '0.92rem', color: t.sub, mb: 1.5, maxWidth: 820 }}>
          Real isolation happens in the local Python daemon: Linux bubblewrap namespaces, prlimit / cgroup process caps,
          environment secret stripping, and a SHA-256 receipt per run. The browser worker below is a separate JavaScript
          preview with no kernel isolation.
        </Typography>
        <Box role="group" aria-label="Execution mode" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            aria-pressed={mode === 'enclave'}
            variant={mode === 'enclave' ? 'contained' : 'outlined'}
            onClick={() => setMode('enclave')}
            sx={{ ...btnSx, flex: { xs: '1 1 100%', sm: '1 1 0' }, bgcolor: mode === 'enclave' ? t.accent : 'transparent', color: mode === 'enclave' ? (isDark ? '#08080B' : '#FFFFFF') : t.accent, borderColor: t.accent, '&:hover': { bgcolor: mode === 'enclave' ? t.accent : t.accentSoft } }}
          >
            Real Enclave Execution (127.0.0.1:8105)
          </Button>
          <Button
            aria-pressed={mode === 'worker'}
            variant={mode === 'worker' ? 'contained' : 'outlined'}
            onClick={() => setMode('worker')}
            sx={{ ...btnSx, flex: { xs: '1 1 100%', sm: '1 1 0' }, bgcolor: mode === 'worker' ? t.gold : 'transparent', color: mode === 'worker' ? (isDark ? '#08080B' : '#FFFFFF') : t.gold, borderColor: t.gold, '&:hover': { bgcolor: mode === 'worker' ? t.gold : `${t.gold}1A` } }}
          >
            Offline Browser JS Worker Sandbox (No Kernel/bwrap)
          </Button>
        </Box>
      </Paper>

      {mode === 'enclave' ? (
        <Grid container spacing={2.5}>
          <Grid xs={12} lg={5}>
            {/* Daemon status */}
            <Paper sx={{ ...cardSx, mb: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                  <Typography component="h3" sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', color: t.accent }}>
                    LOCAL DAEMON
                  </Typography>
                  {healthPill}
                </Box>
                <Button onClick={probeHealth} startIcon={<RefreshIcon />} variant="outlined" sx={{ ...btnSx, borderColor: t.border, color: t.text }}>
                  Re-check
                </Button>
              </Box>
              {daemonOnline ? (
                <>
                  {kv([
                    ['version', hd.version || '—'],
                    ['sandbox', hd.sandbox || '—'],
                    ['pids_enforcement', hd.pids_enforcement || '—'],
                    ['network opt-in', hd.network_opt_in_enabled ? 'enabled' : 'disabled'],
                    ['capsules run', hd.total_capsules ?? '—'],
                    ['uptime', hd.uptime_seconds != null ? formatUptime(hd.uptime_seconds) : '—'],
                  ])}
                  {hd.sandbox && hd.sandbox !== 'bwrap' && (
                    <Box sx={{ mt: 1.5 }}>{pill(`sandbox = ${hd.sandbox}: commands are NOT inside bubblewrap on this host`, 'bad')}</Box>
                  )}
                  {hd.version && hd.version !== TARGET_VERSION && (
                    <Box sx={{ mt: 1.5 }}>{pill(`daemon reports v${hd.version}; this deck targets v${TARGET_VERSION}`, 'warn')}</Box>
                  )}
                </>
              ) : (
                <Box>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: health.state === 'checking' ? t.sub : t.bad, mb: 1 }}>
                    {health.state === 'checking' ? `Probing ${CAPSULE_DAEMON_ORIGIN}/api/health…` : health.error}
                  </Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: t.sub }}>
                    Live execution needs the daemon on this machine. Start it with{' '}
                    <Box component="code" sx={{ fontFamily: mono, color: t.text }}>agent-capsule-jail serve</Box>{' '}
                    (binds 127.0.0.1:8105 only), then press Re-check. Nothing runs and no result is shown until it answers.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Request builder */}
            <Paper sx={cardSx}>
              <TextField
                id="acj-token"
                label="Capsule exec token (X-Capsule-Token)"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => updateToken(e.target.value)}
                fullWidth
                autoComplete="off"
                helperText="Get it with `agent-capsule-jail token`. Kept in sessionStorage for this tab only."
                InputProps={{
                  sx: { fontFamily: mono, minHeight: 56 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showToken ? 'Hide token' : 'Show token'}
                        onClick={() => setShowToken((s) => !s)}
                        sx={{ width: 44, height: 44 }}
                      >
                        {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                FormHelperTextProps={{ sx: { fontFamily: mono, fontSize: '0.68rem' } }}
                sx={{ mb: 1 }}
              />
              {token && (
                <Button onClick={() => updateToken('')} variant="text" sx={{ ...btnSx, color: t.sub, mb: 1 }}>
                  Clear token
                </Button>
              )}

              <Typography sx={{ ...labelSx, mt: 1, mb: 0.75 }}>Presets</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {ENCLAVE_PRESETS.map((p) => (
                  <Button
                    key={p.label}
                    variant="outlined"
                    onClick={() => setCommand(p.command)}
                    aria-pressed={command === p.command}
                    sx={{ ...btnSx, fontSize: '0.72rem', borderColor: command === p.command ? t.accent : t.border, color: command === p.command ? t.accent : t.text, bgcolor: command === p.command ? t.accentSoft : 'transparent' }}
                  >
                    {p.label}
                  </Button>
                ))}
              </Box>

              <TextField
                id="acj-command"
                label="Command (runs as /bin/sh -c inside the jail)"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr', lg: '1fr' }, gap: { xs: 0.5, sm: 2, lg: 0.5 }, mb: 1.5 }}>
                {limitSlider({ id: "acj-timeout", label: "timeout_sec", value: timeoutSec, onChange: setTimeoutSec, min: 1, max: 60, step: 1, unit: " s", color: t.gold, })}
                {limitSlider({ id: "acj-memory", label: "memory_mb (live enclave only)", value: memoryMb, onChange: setMemoryMb, min: 32, max: 4096, step: 32, unit: " MB", color: t.accent, })}
                {limitSlider({ id: "acj-procs", label: "max_procs", value: maxProcs, onChange: setMaxProcs, min: 1, max: 512, step: 1, unit: "", color: t.ok, })}
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={runEnclave}
                disabled={running || !command.trim()}
                startIcon={<PlayArrowIcon />}
                sx={{ ...btnSx, py: 1.25, bgcolor: t.accent, color: isDark ? '#08080B' : '#FFFFFF', '&:hover': { bgcolor: t.accent, filter: 'brightness(0.92)' } }}
              >
                {running ? 'Running in the enclave…' : 'Run in enclave (POST /api/exec)'}
              </Button>
              {!daemonOnline && health.state !== 'checking' && (
                <Typography sx={{ fontSize: '0.72rem', color: t.sub, mt: 1 }}>
                  The daemon did not answer the health probe; a run will report the real network error.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Live results */}
          <Grid xs={12} lg={7}>
            <Paper sx={{ ...cardSx, height: '100%' }} aria-live="polite">
              <Typography component="h3" sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', color: t.accent, mb: 1.5 }}>
                ENCLAVE RESULT
              </Typography>

              {!liveResult && !liveError && (
                <Box sx={{ ...termSx, color: t.sub }}>
                  {running ? 'Waiting for the daemon response…' : 'No run yet. Results shown here come only from the daemon response.'}
                </Box>
              )}

              {liveError && (
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${t.bad}66`, bgcolor: t.badSoft }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {pill('ERROR', 'bad')}
                    {pill(liveError.status ? `HTTP ${liveError.status}` : liveError.kind === 'network' ? 'NETWORK' : 'PARSE', 'bad')}
                    {liveError.policy && pill('POLICY VIOLATION', 'bad')}
                  </Box>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', color: t.text, wordBreak: 'break-word' }}>{liveError.message}</Typography>
                  {liveError.policy && typeof liveError.policy === 'string' && (
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', color: t.text, mt: 0.75 }}>{liveError.policy}</Typography>
                  )}
                  {liveError.hint && <Typography sx={{ fontSize: '0.78rem', color: t.sub, mt: 1 }}>{liveError.hint}</Typography>}
                </Box>
              )}

              {liveResult && (
                <>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {pill(String(liveResult.status || 'unknown').toUpperCase(), statusTone(liveResult.status))}
                    {pill(`exit ${liveResult.exit_code}`, liveResult.exit_code === 0 ? 'ok' : 'bad')}
                    {liveResult.timed_out && pill('TIMED OUT', 'warn')}
                    {liveResult.memory_exceeded && pill('MEMORY EXCEEDED', 'warn')}
                    {pill(`flight recorder: ${liveResult.flight_recorder_dispatched ? 'dispatched' : 'not dispatched'}`, liveResult.flight_recorder_dispatched ? 'info' : 'muted')}
                  </Box>
                  {kv([
                    ['duration', `${Number(liveResult.duration_ms ?? 0).toFixed(1)} ms`],
                    ['cpu user', `${Number(liveResult.cpu_time_user_s ?? 0).toFixed(4)} s`],
                    ['cpu sys', `${Number(liveResult.cpu_time_sys_s ?? liveResult.cpu_time_system_s ?? 0).toFixed(4)} s`],
                    ['max rss', liveResult.max_rss_kb != null ? `${(liveResult.max_rss_kb / 1024).toFixed(1)} MB` : '—'],
                    ['sandbox', liveResult.sandbox_mode || '—'],
                    ['pids', liveResult.pids_enforcement || '—'],
                  ])}

                  <Tabs
                    value={liveTab}
                    onChange={(_, v) => setLiveTab(v)}
                    variant="fullWidth"
                    aria-label="Enclave result views"
                    sx={{ mt: 2, mb: 1.5, borderBottom: `1px solid ${t.border}`, '& .MuiTab-root': { fontFamily: mono, fontWeight: 800, fontSize: '0.7rem', minHeight: 48, color: t.sub, px: 0.5 }, '& .Mui-selected': { color: `${t.accent} !important` }, '& .MuiTabs-indicator': { bgcolor: t.accent } }}
                  >
                    <Tab label="OUTPUT" />
                    <Tab label={`FS DIFF (${fsd.total_changes ?? fsCreated.length + fsModified.length + fsDeleted.length})`} />
                    <Tab label="RECEIPT" />
                  </Tabs>

                  {liveTab === 0 && (
                    <>
                      <Typography sx={labelSx}>stdout</Typography>
                      <Box component="pre" sx={{ ...termSx, mb: 1.5 }}>{liveResult.stdout || '(empty)'}</Box>
                      <Typography sx={labelSx}>stderr</Typography>
                      <Box component="pre" sx={{ ...termSx, color: liveResult.stderr ? t.bad : t.sub }}>{liveResult.stderr || '(empty)'}</Box>
                    </>
                  )}

                  {liveTab === 1 && (
                    <Box sx={{ ...termSx, maxHeight: 400 }}>
                      {fsCreated.length + fsModified.length + fsDeleted.length === 0
                        ? 'No filesystem changes in the capsule scratch directory.'
                        : (
                          <>
                            {fsCreated.map((f) => fileRow(f, 'A'))}
                            {fsModified.map((f) => fileRow(f, 'M'))}
                            {fsDeleted.map((f) => fileRow(f, 'D'))}
                          </>
                        )}
                      <Box sx={{ mt: 1, color: t.sub }}>committed: {String(Boolean(liveResult.committed))}</Box>
                    </Box>
                  )}

                  {liveTab === 2 && (
                    <Box>
                      <Typography sx={labelSx}>receipt_sha256</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box component="code" sx={{ ...termSx, minHeight: 0, flex: 1, py: 1.25, wordBreak: 'break-all' }}>{liveResult.receipt_sha256 || '(not provided)'}</Box>
                        <IconButton aria-label="Copy receipt SHA-256" onClick={() => copy(liveResult.receipt_sha256 || '', 'receipt')} sx={{ width: 44, height: 44, border: `1px solid ${t.border}`, color: t.text }}>
                          {copied === 'receipt' ? <CheckIcon /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        {receiptCheck?.state === 'match' && pill('Recomputed in this browser: matches', 'ok')}
                        {receiptCheck?.state === 'mismatch' && pill('Recomputed in this browser: MISMATCH', 'bad')}
                        {receiptCheck?.state === 'unavailable' && pill('crypto.subtle unavailable here; not re-verified', 'warn')}
                        {receiptCheck?.state === 'missing' && pill('Daemon returned no receipt', 'warn')}
                      </Box>
                      {kv([
                        ['capsule_id', liveResult.capsule_id || '—'],
                        ['timeout', liveResult.limits?.timeout_sec != null ? `${liveResult.limits.timeout_sec} s` : '—'],
                        ['memory', liveResult.limits?.memory_mb != null ? `${liveResult.limits.memory_mb} MB` : '—'],
                        ['max_procs', liveResult.limits?.max_procs ?? '—'],
                        ['env denied', Array.isArray(liveResult.env_denied) ? (liveResult.env_denied.length ? liveResult.env_denied.join(', ') : 'none') : '—'],
                        ['timestamp', liveResult.timestamp || '—'],
                      ])}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                        <Button variant="outlined" startIcon={copied === 'json' ? <CheckIcon /> : <ContentCopyIcon />} onClick={() => copy(JSON.stringify(liveResult, null, 2), 'json')} sx={{ ...btnSx, borderColor: t.border, color: t.text }}>
                          {copied === 'json' ? 'Copied' : 'Copy result JSON'}
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadJson(liveResult, `capsule-${liveResult.capsule_id || 'result'}.json`)} sx={{ ...btnSx, borderColor: t.border, color: t.text }}>
                          Download JSON
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          <Grid xs={12} lg={6}>
            <Paper sx={cardSx}>
              <Box sx={{ p: 1.5, mb: 2, borderRadius: 1.5, border: `1px solid ${t.warn}55`, bgcolor: t.warnSoft }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: t.warn, mb: 0.5 }}>
                  OFFLINE BROWSER JS WORKER SANDBOX — NO KERNEL / BWRAP
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: t.text }}>
                  JavaScript runs in a Blob Web Worker. Network primitives (fetch, XMLHttpRequest, WebSocket, EventSource,
                  importScripts, nested Workers, caches, IndexedDB) are removed from the global and its prototypes before
                  your code runs, and the timeout calls worker.terminate(). There is no memory cap, process isolation, or
                  shell here — use Real Enclave Execution for that.
                </Typography>
              </Box>

              <Typography sx={{ ...labelSx, mb: 0.75 }}>Presets</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {WORKER_PRESETS.map((p) => (
                  <Button
                    key={p.label}
                    variant="outlined"
                    onClick={() => setWorkerCode(p.code)}
                    aria-pressed={workerCode === p.code}
                    sx={{ ...btnSx, fontSize: '0.72rem', borderColor: workerCode === p.code ? t.gold : t.border, color: workerCode === p.code ? t.gold : t.text }}
                  >
                    {p.label}
                  </Button>
                ))}
              </Box>

              <TextField
                id="acj-worker-code"
                label="JavaScript (function body; `console` and `fs` are provided)"
                value={workerCode}
                onChange={(e) => setWorkerCode(e.target.value)}
                fullWidth
                multiline
                minRows={10}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.5 } }}
                sx={{ mb: 2 }}
              />

              {limitSlider({ id: "acj-worker-timeout", label: "Worker timeout (worker.terminate)", value: workerTimeout, onChange: setWorkerTimeout, min: 1, max: 15, step: 1, unit: " s", color: t.gold, })}

              <Button
                fullWidth
                variant="contained"
                onClick={runWorker}
                disabled={workerRunning || !workerCode.trim()}
                startIcon={<PlayArrowIcon />}
                sx={{ ...btnSx, mt: 1, py: 1.25, bgcolor: t.gold, color: isDark ? '#08080B' : '#FFFFFF', '&:hover': { bgcolor: t.gold, filter: 'brightness(0.92)' } }}
              >
                {workerRunning ? 'Running in browser worker…' : 'Run in browser worker'}
              </Button>
            </Paper>
          </Grid>

          <Grid xs={12} lg={6}>
            <Paper sx={{ ...cardSx, height: '100%' }} aria-live="polite">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography component="h3" sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', color: t.gold }}>
                  WORKER RESULT
                </Typography>
                {workerResult && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {pill(workerResult.success ? 'COMPLETED' : workerResult.timedOut ? 'TIMED OUT' : 'ERROR', workerResult.success ? 'ok' : workerResult.timedOut ? 'warn' : 'bad')}
                    {pill(`${Number(workerResult.elapsed || 0).toFixed(1)} ms`, 'muted')}
                  </Box>
                )}
              </Box>
              <Tabs
                value={workerTab}
                onChange={(_, v) => setWorkerTab(v)}
                variant="fullWidth"
                aria-label="Worker result views"
                sx={{ mb: 1.5, borderBottom: `1px solid ${t.border}`, '& .MuiTab-root': { fontFamily: mono, fontWeight: 800, fontSize: '0.7rem', minHeight: 48, color: t.sub, px: 0.5 }, '& .Mui-selected': { color: `${t.gold} !important` }, '& .MuiTabs-indicator': { bgcolor: t.gold } }}
              >
                <Tab label="LOGS" />
                <Tab label={`VFS (${workerResult ? Object.keys(workerResult.virtualFs || {}).length : 0})`} />
                <Tab label="RETURN" />
              </Tabs>

              {workerTab === 0 && (
                <Box sx={{ ...termSx, maxHeight: 400 }}>
                  {!workerResult ? (
                    <Box component="span" sx={{ color: t.sub }}>{workerRunning ? 'Running…' : 'Idle. Nothing has run in the worker yet.'}</Box>
                  ) : (
                    <>
                      {(workerResult.logs || []).map((log, idx) => (
                        <Box key={idx} sx={{ color: log.type === 'error' ? t.bad : log.type === 'warn' ? t.warn : log.type === 'fs' ? t.accent : t.term }}>
                          <Box component="span" sx={{ opacity: 0.6 }}>[{log.type}]</Box> {log.text}
                        </Box>
                      ))}
                      {workerResult.error && <Box sx={{ color: t.bad, fontWeight: 700, mt: 1 }}>{workerResult.error}</Box>}
                      {!workerResult.error && !(workerResult.logs || []).length && <Box component="span" sx={{ color: t.sub }}>(no console output)</Box>}
                    </>
                  )}
                </Box>
              )}

              {workerTab === 1 && (
                <Box sx={{ ...termSx, maxHeight: 400 }}>
                  {!workerResult || !Object.keys(workerResult.virtualFs || {}).length
                    ? <Box component="span" sx={{ color: t.sub }}>No virtual files. Use fs.writeFile(name, content).</Box>
                    : Object.entries(workerResult.virtualFs).map(([name, content]) => (
                      <Box key={name} sx={{ mb: 1.5 }}>
                        <Box sx={{ color: t.accent, fontWeight: 700 }}>{name} · {new TextEncoder().encode(content).length} B</Box>
                        <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontFamily: mono }}>{content}</Box>
                      </Box>
                    ))}
                </Box>
              )}

              {workerTab === 2 && (
                <Box component="pre" sx={{ ...termSx, maxHeight: 400 }}>
                  {!workerResult || workerResult.result === undefined
                    ? 'No return value.'
                    : typeof workerResult.result === 'object' ? JSON.stringify(workerResult.result, null, 2) : String(workerResult.result)}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Support + attribution */}
      <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: t.sub }}>
          Engineered by Neal Frazier Tech (@1nc0gn30) •{' '}
          <Link href="https://nullai.tech" target="_blank" rel="noopener noreferrer" sx={{ color: t.sub, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>NullAI Platform</Link>
          {' · '}
          <Link href="https://github.com/1nc0gn30/agent-capsule-jail" target="_blank" rel="noopener noreferrer" sx={{ color: t.sub, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>source</Link>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button href={STRIPE_COFFEE_URL} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ ...btnSx, borderColor: t.border, color: t.gold }}>
            ☕ Buy Us a Coffee
          </Button>
          <Button variant="outlined" onClick={() => copy(SOLANA_TIP_ADDRESS, 'sol')} sx={{ ...btnSx, borderColor: t.border, color: t.text }}>
            {copied === 'sol' ? 'Solana address copied' : '◎ Copy Solana tip address'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AgentCapsuleJailGodModeTool;
