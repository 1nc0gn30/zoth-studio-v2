import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShieldIcon from '@mui/icons-material/Shield';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import TerminalIcon from '@mui/icons-material/Terminal';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  useCopy,
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_DARK = '#38BDF8';
const ACCENT_LIGHT = '#0369A1';
const RELAY_PORT = 8765;
const RELAY_BASE_URL = `http://127.0.0.1:${RELAY_PORT}`;

const PROFILE_PRESETS = {
  'read-only': {
    label: 'read-only',
    summary: 'Inspect allowed_dirs only; no writes or shell execution',
    read: true,
    write: false,
    exec: false,
    dashboard: false,
    rateLimit: 60,
  },
  workspace: {
    label: 'workspace',
    summary: 'Read/write inside allowed_dirs; no shell execution',
    read: true,
    write: true,
    exec: false,
    dashboard: false,
    rateLimit: 120,
  },
  exec: {
    label: 'exec',
    summary: 'File R/W + non-interactive shell gated by sanitizer blocklist',
    read: true,
    write: true,
    exec: true,
    dashboard: false,
    rateLimit: 90,
  },
  dev: {
    label: 'dev',
    summary: 'Landlock kernel sandbox + workspace R/W + 127.0.0.1:4100-4199 bind',
    read: true,
    write: true,
    exec: true,
    dashboard: false,
    rateLimit: 180,
  },
  mobile: {
    label: 'mobile',
    summary: 'POST /v1/ask & /v1/live/token only; zero host file or shell access',
    read: false,
    write: false,
    exec: false,
    dashboard: false,
    rateLimit: 40,
  },
};

/** Pure deterministic SHA-256 hex digest (FIPS 180-4) so preview hashes are real and SSR-safe. */
function sha256Hex(message) {
  const utf8 = unescape(encodeURIComponent(String(message || '')));
  const bytes = [];
  for (let i = 0; i < utf8.length; i += 1) {
    bytes.push(utf8.charCodeAt(i));
  }
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }
  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen >>> 0;
  bytes.push(
    (highBits >>> 24) & 0xff,
    (highBits >>> 16) & 0xff,
    (highBits >>> 8) & 0xff,
    highBits & 0xff,
    (lowBits >>> 24) & 0xff,
    (lowBits >>> 16) & 0xff,
    (lowBits >>> 8) & 0xff,
    lowBits & 0xff,
  );

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  const w = new Array(64);

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] =
        ((bytes[offset + i * 4] << 24) |
          (bytes[offset + i * 4 + 1] << 16) |
          (bytes[offset + i * 4 + 2] << 8) |
          bytes[offset + i * 4 + 3]) >>>
        0;
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
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
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

function generatePreviewToken(agentId, nonce) {
  const digest = sha256Hex(`zoth-relay-preview:${agentId}:${nonce}`);
  return `zr_${agentId.replace(/[^a-z0-9]/gi, '').slice(0, 8)}_${digest.slice(0, 32)}`;
}

const INITIAL_AGENTS = [
  {
    id: 'hermes',
    enabled: true,
    profile: 'dev',
    allowedDirs: ['/home/operator/NullAITech', '/home/operator/agent-workspace/hermes'],
    read: true,
    write: true,
    exec: true,
    dashboard: false,
    rateLimit: 180,
    tokenNonce: 1,
  },
  {
    id: 'agy',
    enabled: true,
    profile: 'exec',
    allowedDirs: ['/home/operator/NullAITech', '/home/operator/agent-workspace/agy'],
    read: true,
    write: true,
    exec: true,
    dashboard: true,
    rateLimit: 150,
    tokenNonce: 1,
  },
  {
    id: 'claude-code',
    enabled: true,
    profile: 'workspace',
    allowedDirs: ['/home/operator/NullAITech'],
    read: true,
    write: true,
    exec: false,
    dashboard: false,
    rateLimit: 120,
    tokenNonce: 1,
  },
  {
    id: 'codex',
    enabled: true,
    profile: 'read-only',
    allowedDirs: ['/home/operator/NullAITech'],
    read: true,
    write: false,
    exec: false,
    dashboard: false,
    rateLimit: 60,
    tokenNonce: 1,
  },
];

// Faithful port of zoth_relay/sanitizer.py + config.yaml.example blocklist rules
const BANNED_PROGRAMS = new Set([
  'shutdown', 'reboot', 'poweroff', 'halt', 'init', 'telinit',
  'mkfs', 'mke2fs', 'mkswap', 'wipefs', 'fdisk', 'sfdisk', 'cfdisk', 'parted',
  'gdisk', 'sgdisk', 'shred', 'blkdiscard', 'cryptsetup', 'lvremove', 'vgremove',
  'pvremove', 'mdadm', 'sudo', 'su', 'doas', 'pkexec', 'passwd', 'chpasswd',
  'useradd', 'userdel', 'usermod', 'visudo', 'insmod', 'rmmod', 'modprobe',
  'kexec', 'crontab', 'systemctl', 'iptables', 'nft', 'ufw',
]);

const BANNED_PREFIXES = ['mkfs.', 'mkfs-', 'fsck.'];

const WRAPPERS = new Set([
  'env', 'nohup', 'exec', 'command', 'builtin', 'nice', 'ionice', 'time',
  'stdbuf', 'setsid', 'busybox', 'xargs', 'chrt', 'taskset', 'unbuffer',
  'timeout', 'watch', 'strace', 'ltrace', 'eval', 'then', 'do', 'else', '!',
]);

const ROOTISH_TARGETS = new Set([
  '/', '/*', '~', '~/', '$home', '${home}', '/home', '/etc', '/usr',
  '/var', '/boot', '/bin', '/sbin', '/lib', '/opt', '/root', '.', '..', '*',
]);

const DEFAULT_EXTRA_BLOCKLIST = [
  'rm -rf /',
  'chmod -R 777 /',
  '> /dev/sda',
  'nc -e',
  '/etc/shadow',
];

const SENSITIVE_PATH_PATTERNS = [
  { rx: /^\/etc\/(shadow|gshadow|sudoers)(\/|$)/, label: 'SYSTEM_SHADOW_SECRET' },
  { rx: /^\/home\/[^/]+\/\.ssh(\/|$)/, label: 'SSH_PRIVATE_KEY_DIR' },
  { rx: /^\/root(\/|$)/, label: 'ROOT_HOME_DIR' },
  { rx: /^\/etc\/zoth-relay(\/|$)/, label: 'RELAY_TOKEN_REGISTRY' },
  { rx: /^\/proc\/(1|self)\/environ$/, label: 'PROC_ENVIRON_EXPOSURE' },
];

const SPLIT_RE = /\|\||&&|[;&|\n()`{}]|\$\(/;
const ASSIGN_RE = /^[a-z_][a-z0-9_]*=/;
const FORKBOMB_RE = /:\s*\(\s*\)\s*\{.*:\s*\|\s*:.*&.*\}/;
const GENERIC_FORKBOMB_RE = /(\w+)\s*\(\s*\)\s*\{[^}]*\b\1\s*\|\s*\1/;
const DEV_WRITE_RE = />\s*\/dev\/(sd|nvme|hd|vd|mmcblk|xvd|dm-|md|loop|mapper|disk)/;
const PIPE_TO_SHELL_RE = /(base64\s+(-d|--decode)|xxd\s+-r).*\|\s*(ba|z|da|k)?sh\b/;
const REMOTE_PIPE_TO_SHELL_RE = /\b(curl|wget|fetch)\b[^|\n]*\|\s*(sudo\s+)?(ba|z|da|k)?sh\b|\b(curl|wget)\b[^|\n]*\|\s*python3?\b/;

function normalizePosixPath(rawPath, baseDir = '/home/operator/agent-workspace') {
  const trimmed = String(rawPath || '').trim();
  if (!trimmed) return '';
  let expanded = trimmed;
  if (expanded === '~') {
    expanded = '/home/operator';
  } else if (expanded.startsWith('~/')) {
    expanded = `/home/operator/${expanded.slice(2)}`;
  }
  const combined = expanded.startsWith('/') ? expanded : `${baseDir.replace(/\/+$/, '')}/${expanded}`;
  const segments = combined.split('/');
  const resolved = [];
  for (const seg of segments) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      if (resolved.length > 0) resolved.pop();
    } else {
      resolved.push(seg);
    }
  }
  return `/${resolved.join('/')}`;
}

function isPathInsideDir(resolvedPath, allowedDir) {
  const cleanRoot = normalizePosixPath(allowedDir, '/home/operator');
  if (cleanRoot === '/') return true;
  return resolvedPath === cleanRoot || resolvedPath.startsWith(`${cleanRoot}/`);
}

function evaluatePathSandbox(rawPath, agent, operation = 'read') {
  const input = String(rawPath || '').trim();
  const baseDir = (agent.allowedDirs && agent.allowedDirs[0]) || '/home/operator/agent-workspace';
  const normalizedDirs = (agent.allowedDirs || [])
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => normalizePosixPath(d, '/home/operator'));

  const makeResult = (verdict, rule, reason, canonicalPath) => ({
    verdict,
    rule,
    reason,
    canonicalPath,
    auditEntry: {
      ts: '2026-11-24T17:40:00Z',
      agent: agent.id,
      profile: agent.profile,
      protocol: 'mcp',
      tool: operation === 'write' ? 'write_file' : 'read_file',
      input_path: input,
      resolved_path: canonicalPath,
      verdict,
      rule,
      reason,
      rate_limit_rpm: agent.rateLimit,
    },
  });

  if (!agent.enabled) {
    return makeResult('BLOCK', 'AGENT_REVOKED', `Agent "${agent.id}" is disabled/revoked in registry.`, '');
  }
  if (!input || input.includes('\u0000')) {
    return makeResult('BLOCK', 'INVALID_PATH', 'Path is empty or contains a NUL byte.', '');
  }

  const canonical = normalizePosixPath(input, baseDir);

  if (operation === 'read' && !agent.read) {
    return makeResult(
      'BLOCK',
      'PERMISSION_DENIED_READ',
      `Agent "${agent.id}" (profile: ${agent.profile}) does not hold read_file permission.`,
      canonical,
    );
  }
  if (operation === 'write' && !agent.write) {
    return makeResult(
      'BLOCK',
      'PERMISSION_DENIED_WRITE',
      `Agent "${agent.id}" (profile: ${agent.profile}) does not hold write_file permission.`,
      canonical,
    );
  }

  const sensitiveHit = SENSITIVE_PATH_PATTERNS.find((p) => p.rx.test(canonical));
  if (sensitiveHit) {
    return makeResult(
      'BLOCK',
      sensitiveHit.label,
      `Canonical path "${canonical}" targets protected host credential/system path (${sensitiveHit.label}).`,
      canonical,
    );
  }

  if (normalizedDirs.length === 0) {
    return makeResult(
      'BLOCK',
      'NO_ALLOWED_DIRS',
      `Agent "${agent.id}" has zero configured allowed_dirs; all host paths are confined.`,
      canonical,
    );
  }

  const matchedRoot = normalizedDirs.find((dir) => isPathInsideDir(canonical, dir));
  if (!matchedRoot) {
    const hasTraversal = input.includes('..');
    return makeResult(
      'BLOCK',
      hasTraversal ? 'PATH_TRAVERSAL_ESCAPE' : 'SANDBOX_OUTSIDE_ALLOWED_DIRS',
      hasTraversal
        ? `Traversal sequence escaped workspace: "${input}" resolved to "${canonical}", outside [${normalizedDirs.join(', ')}].`
        : `Resolved path "${canonical}" lies outside agent allowed_dirs [${normalizedDirs.join(', ')}].`,
      canonical,
    );
  }

  return makeResult(
    'ALLOW',
    'ALLOWED_DIR_MATCH',
    `Canonical path "${canonical}" verified inside allowed root "${matchedRoot}" (${operation.toUpperCase()} permitted).`,
    canonical,
  );
}

function normaliseCommand(cmd) {
  let s = String(cmd || '').replace(/\\\n/g, ' ');
  s = s.replace(/\$\{?ifs\}?/gi, ' ');
  s = s.replace(/['"\\]/g, '');
  s = s.replace(/[ \t\r\f\v]+/g, ' ');
  return s.trim().toLowerCase();
}

function extractRealProgram(words) {
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    if (ASSIGN_RE.test(w)) {
      i += 1;
      continue;
    }
    const base = w.split('/').pop() || '';
    if (WRAPPERS.has(base)) {
      i += 1;
      while (i < words.length && (words[i].startsWith('-') || /^[\d.]+[smhd]?$/.test(words[i]))) {
        i += 1;
      }
      continue;
    }
    return [base, words.slice(i + 1)];
  }
  return ['', []];
}

function checkSimpleCommand(words) {
  const [prog, args] = extractRealProgram(words);
  if (!prog) return null;

  if (BANNED_PROGRAMS.has(prog) || BANNED_PREFIXES.some((p) => prog.startsWith(p))) {
    return { rule: 'BANNED_PROGRAM', reason: `Program '${prog}' is unconditionally blocked by zoth-relay sanitizer.` };
  }
  if (prog === 'rm') {
    const flags = args
      .filter((a) => a.startsWith('-') && !a.startsWith('--'))
      .map((a) => a.replace(/^-+/, ''))
      .join('');
    const longFlags = new Set(args.filter((a) => a.startsWith('--')));
    const recursive = flags.includes('r') || longFlags.has('--recursive');
    const targets = args.filter((a) => !a.startsWith('-'));
    if (longFlags.has('--no-preserve-root')) {
      return { rule: 'RM_NO_PRESERVE_ROOT', reason: 'rm --no-preserve-root is blocked.' };
    }
    const strippedRoots = new Set(Array.from(ROOTISH_TARGETS).map((x) => x.replace(/\/+$/, '')));
    if (
      recursive &&
      targets.some(
        (t) =>
          strippedRoots.has(t.replace(/\/+$/, '')) ||
          ROOTISH_TARGETS.has(t) ||
          /^\/[^/]*\/?\*?$/.test(t),
      )
    ) {
      return { rule: 'RM_RECURSIVE_ROOTISH', reason: 'Recursive rm on a root, system, or home directory is blocked.' };
    }
  }
  if (
    prog === 'dd' &&
    args.some(
      (a) =>
        a.startsWith('of=/dev/') &&
        !a.startsWith('of=/dev/null') &&
        !a.startsWith('of=/dev/stdout') &&
        !a.startsWith('of=/dev/stderr'),
    )
  ) {
    return { rule: 'DD_BLOCK_DEVICE', reason: 'Direct dd write to a /dev/* device is blocked.' };
  }
  if (
    (prog === 'chmod' || prog === 'chown' || prog === 'chgrp') &&
    args.some((a) => a === '-r' || a === '--recursive') &&
    args.some((a) => ROOTISH_TARGETS.has(a))
  ) {
    return { rule: 'RECURSIVE_PERM_SYSTEM', reason: `Recursive ${prog} on a system/root path is blocked.` };
  }
  if (prog === 'mv' && args.some((a) => a === '/' || a === '/*')) {
    return { rule: 'MV_ROOT', reason: 'Moving / or /* is blocked.' };
  }
  return null;
}

function evaluateCommandPolicy(rawCmd, agent, extraBlocklist = DEFAULT_EXTRA_BLOCKLIST) {
  const input = String(rawCmd || '');
  const norm = normaliseCommand(input);
  const compact = norm.replace(/\s+/g, '');

  const makeResult = (verdict, rule, reason) => ({
    verdict,
    rule,
    reason,
    normalized: norm,
    auditEntry: {
      ts: '2026-11-24T17:40:00Z',
      agent: agent.id,
      profile: agent.profile,
      protocol: 'rest',
      endpoint: 'POST /v1/exec/run',
      command: input.trim(),
      normalized: norm,
      verdict,
      rule,
      reason,
      landlock_confined: agent.profile === 'dev',
    },
  });

  if (!agent.enabled) {
    return makeResult('BLOCK', 'AGENT_REVOKED', `Agent "${agent.id}" is disabled/revoked in registry.`);
  }
  if (!agent.exec) {
    return makeResult(
      'BLOCK',
      'EXEC_PERMISSION_DENIED',
      `Agent "${agent.id}" (profile: ${agent.profile}) does not permit shell execution (run_command disabled).`,
    );
  }
  if (!input.trim()) {
    return makeResult('BLOCK', 'EMPTY_COMMAND', 'Command string is empty.');
  }
  if (input.includes('\u0000')) {
    return makeResult('BLOCK', 'NUL_BYTE', 'NUL byte detected in command payload.');
  }
  if (FORKBOMB_RE.test(norm) || compact.includes(':(){:|:&};:') || GENERIC_FORKBOMB_RE.test(norm)) {
    return makeResult('BLOCK', 'FORK_BOMB', 'Fork bomb recursion pattern blocked.');
  }
  if (DEV_WRITE_RE.test(norm)) {
    return makeResult('BLOCK', 'BLOCK_DEVICE_REDIRECT', 'Shell redirection directly into a block device (/dev/sd*, nvme*, etc.) is blocked.');
  }
  if (PIPE_TO_SHELL_RE.test(norm)) {
    return makeResult('BLOCK', 'ENCODED_PIPE_TO_SHELL', 'Decoded binary/base64 payload piped into a shell interpreter is blocked.');
  }
  if (REMOTE_PIPE_TO_SHELL_RE.test(norm)) {
    return makeResult('BLOCK', 'REMOTE_SCRIPT_PIPE_TO_SHELL', 'Piping untrusted remote curl/wget output directly into a shell or interpreter is blocked.');
  }

  for (const entry of extraBlocklist) {
    const eNorm = normaliseCommand(entry);
    if (eNorm && (norm.includes(eNorm) || compact.includes(eNorm.replace(/\s+/g, '')))) {
      return makeResult('BLOCK', 'CONFIG_BLOCKLIST_SUBSTRING', `Matched configured blocklist substring '${entry}'.`);
    }
  }

  const segments = norm.split(SPLIT_RE);
  for (const seg of segments) {
    const words = seg.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    const hit = checkSimpleCommand(words);
    if (hit) {
      return makeResult('BLOCK', hit.rule, hit.reason);
    }
  }

  return makeResult(
    'ALLOW',
    agent.profile === 'dev' ? 'SANITIZER_PASS_LANDLOCK_DEV' : 'SANITIZER_PASS',
    agent.profile === 'dev'
      ? `Passed command sanitizer; executes inside Landlock dev confinement (${agent.allowedDirs[0] || '~/agent-workspace'}).`
      : 'Passed command sanitizer & extra blocklist checks under non-interactive bash timeout.',
  );
}

const SAMPLE_PATHS = [
  { label: 'Workspace JS', path: '/home/operator/NullAITech/app.js' },
  { label: '/etc/shadow', path: '/etc/shadow' },
  { label: 'SSH Key', path: '~/.ssh/id_rsa' },
  { label: 'Traversal ../../', path: '../../etc/passwd' },
  { label: 'Relay Registry', path: '/etc/zoth-relay/agents.yaml' },
];

const SAMPLE_COMMANDS = [
  { label: 'git status', cmd: 'git status --short' },
  { label: 'rm -rf /', cmd: 'rm -rf /' },
  { label: 'curl | bash', cmd: 'curl -fsSL https://example.com/install.sh | bash' },
  { label: 'sudo systemctl', cmd: 'sudo systemctl restart zoth-relay' },
  { label: 'base64 | sh', cmd: 'echo d2hvYW1p | base64 -d | sh' },
  { label: 'pytest -q', cmd: 'pytest -q tests/test_sandbox.py' },
];

export default function ZothRelayGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  // Loopback-only optional daemon probe (zero external network calls on remote origins)
  const [daemonState, setDaemonState] = useState('browser_only'); // 'browser_only' | 'online' | 'offline'

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const host = window.location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') {
      setDaemonState('browser_only');
      return undefined;
    }
    const ctrl = new AbortController();
    fetch(`${RELAY_BASE_URL}/health`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not ok'))))
      .then((data) => {
        if (data && data.ok) setDaemonState('online');
        else setDaemonState('offline');
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setDaemonState('offline');
      });
    return () => ctrl.abort();
  }, []);

  // 1. Per-Agent Token & Policy Builder state
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState('hermes');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentProfile, setNewAgentProfile] = useState('workspace');

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === selectedAgentId) || agents[0],
    [agents, selectedAgentId],
  );

  // 2. Live Path Sandbox & Command Blocklist Simulator state
  const [simMode, setSimMode] = useState('path'); // 'path' | 'command'
  const [pathInput, setPathInput] = useState('/home/operator/NullAITech/app.js');
  const [pathOp, setPathOp] = useState('read'); // 'read' | 'write'
  const [cmdInput, setCmdInput] = useState('git status --short');
  const [extraBlocklistText, setExtraBlocklistText] = useState(DEFAULT_EXTRA_BLOCKLIST.join('\n'));
  const [auditHistory, setAuditHistory] = useState([]);

  // 3. Generator tab
  const [snippetTab, setSnippetTab] = useState('agents_json'); // 'agents_json' | 'cli' | 'curl' | 'mcp_http' | 'mcp_stdio'

  const extraBlocklist = useMemo(
    () =>
      extraBlocklistText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [extraBlocklistText],
  );

  const pathEval = useMemo(
    () => evaluatePathSandbox(pathInput, selectedAgent, pathOp),
    [pathInput, selectedAgent, pathOp],
  );

  const cmdEval = useMemo(
    () => evaluateCommandPolicy(cmdInput, selectedAgent, extraBlocklist),
    [cmdInput, selectedAgent, extraBlocklist],
  );

  const activeEval = simMode === 'path' ? pathEval : cmdEval;

  const updateSelectedAgent = (patch) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedAgent.id ? { ...a, ...patch } : a)),
    );
  };

  const handleProfileChange = (nextProfile) => {
    const preset = PROFILE_PRESETS[nextProfile];
    if (!preset) return;
    updateSelectedAgent({
      profile: nextProfile,
      read: preset.read,
      write: preset.write,
      exec: preset.exec,
      dashboard: preset.dashboard,
      rateLimit: preset.rateLimit,
    });
  };

  const handleAddAgent = () => {
    const clean = newAgentName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 28);
    if (!clean || agents.some((a) => a.id === clean)) return;
    const preset = PROFILE_PRESETS[newAgentProfile] || PROFILE_PRESETS.workspace;
    const created = {
      id: clean,
      enabled: true,
      profile: newAgentProfile,
      allowedDirs: newAgentProfile === 'mobile' ? [] : [`/home/operator/agent-workspace/${clean}`],
      read: preset.read,
      write: preset.write,
      exec: preset.exec,
      dashboard: preset.dashboard,
      rateLimit: preset.rateLimit,
      tokenNonce: 1,
    };
    setAgents((prev) => [...prev, created]);
    setSelectedAgentId(clean);
    setNewAgentName('');
  };

  const handleDeleteAgent = (id) => {
    if (agents.length <= 1) return;
    const remaining = agents.filter((a) => a.id !== id);
    setAgents(remaining);
    if (selectedAgentId === id) {
      setSelectedAgentId(remaining[0].id);
    }
  };

  const handleLogAudit = () => {
    setAuditHistory((prev) => [
      { ...activeEval.auditEntry, id: `${Date.now()}-${prev.length}` },
      ...prev.slice(0, 7),
    ]);
  };

  const selectedPreviewToken = useMemo(
    () => generatePreviewToken(selectedAgent.id, selectedAgent.tokenNonce),
    [selectedAgent.id, selectedAgent.tokenNonce],
  );

  // Exported agents.json payload (stores SHA-256 token digests like zoth-relay)
  const agentsJson = useMemo(() => {
    const payload = {
      schema: 'zoth-relay/agents/v1',
      bind: `127.0.0.1:${RELAY_PORT}`,
      extra_blocklist: extraBlocklist,
      agents: agents.map((a) => {
        const previewToken = generatePreviewToken(a.id, a.tokenNonce);
        return {
          name: a.id,
          enabled: a.enabled,
          profile: a.profile,
          token_sha256: sha256Hex(previewToken),
          permissions: {
            status: true,
            read: a.read,
            write: a.write,
            exec: a.exec,
            dashboard: a.dashboard,
          },
          allowed_dirs: a.allowedDirs,
          rate_limit_rpm: a.rateLimit,
        };
      }),
    };
    return JSON.stringify(payload, null, 2);
  }, [agents, extraBlocklist]);

  // Real zoth-relay CLI commands
  const cliCommands = useMemo(() => {
    const lines = [
      '# Provision configured agents on ZothOS host (127.0.0.1:8765)',
      'sudo systemctl status zoth-relay',
      '',
    ];
    agents.forEach((a) => {
      if (!a.enabled) {
        lines.push(`# Agent '${a.id}' disabled — revoke active bearer token`);
        lines.push(`sudo zoth-relay agent revoke ${a.id}`);
        return;
      }
      const dirFlags = a.allowedDirs.map((d) => `--dir "${d}"`).join(' ');
      const dashFlag = a.dashboard ? ' --dashboard' : '';
      lines.push(
        `sudo zoth-relay agent add ${a.id} --profile ${a.profile}${dirFlags ? ` ${dirFlags}` : ''} --rate ${a.rateLimit}${dashFlag}`,
      );
    });
    lines.push('', '# Inspect active registry & rotate token');
    lines.push('sudo zoth-relay agent list');
    lines.push(`sudo zoth-relay agent rotate ${selectedAgent.id}`);
    return lines.join('\n');
  }, [agents, selectedAgent.id]);

  // Copyable curl snippet
  const curlSnippet = useMemo(() => {
    const escapedPath = pathInput.replace(/"/g, '\\"');
    const escapedCmd = cmdInput.replace(/"/g, '\\"');
    return [
      `# Target agent: ${selectedAgent.id} (${selectedAgent.profile}) · Loopback relay :${RELAY_PORT}`,
      `export ZOTH_RELAY_TOKEN="${selectedPreviewToken}"`,
      '',
      '# 1. Unauthenticated liveness probe',
      `curl -sS ${RELAY_BASE_URL}/health`,
      '',
      '# 2. Authenticated status & sandboxed file read',
      `curl -sS -H "Authorization: Bearer $ZOTH_RELAY_TOKEN" \\`,
      `  "${RELAY_BASE_URL}/v1/status"`,
      '',
      `curl -sS -G -H "Authorization: Bearer $ZOTH_RELAY_TOKEN" \\`,
      `  --data-urlencode "path=${escapedPath}" \\`,
      `  "${RELAY_BASE_URL}/v1/file"`,
      '',
      '# 3. Synchronous command execution (subject to sanitizer & Landlock)',
      `curl -sS -X POST "${RELAY_BASE_URL}/v1/exec/run" \\`,
      '  -H "Authorization: Bearer $ZOTH_RELAY_TOKEN" \\',
      '  -H "Content-Type: application/json" \\',
      `  -d '{"command": "${escapedCmd}", "timeout": 30}'`,
    ].join('\n');
  }, [selectedAgent.id, selectedAgent.profile, selectedPreviewToken, pathInput, cmdInput]);

  // MCP Streamable HTTP config
  const mcpHttpConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            [`zoth-relay-${selectedAgent.id}`]: {
              type: 'streamable-http',
              url: `${RELAY_BASE_URL}/mcp`,
              headers: {
                Authorization: `Bearer ${selectedPreviewToken}`,
              },
            },
          },
        },
        null,
        2,
      ),
    [selectedAgent.id, selectedPreviewToken],
  );

  // MCP Stdio bridge config
  const mcpStdioConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            [`zoth-relay-${selectedAgent.id}`]: {
              command: 'zoth-relay',
              args: ['mcp-stdio'],
              env: {
                ZOTH_RELAY_URL: RELAY_BASE_URL,
                ZOTH_RELAY_TOKEN: selectedPreviewToken,
              },
            },
          },
        },
        null,
        2,
      ),
    [selectedAgent.id, selectedPreviewToken],
  );

  const activeSnippet = useMemo(() => {
    switch (snippetTab) {
      case 'cli':
        return { title: 'zoth-relay-provision.sh', badge: 'ZOTH-RELAY CLI', code: cliCommands, ext: 'sh' };
      case 'curl':
        return { title: 'zoth-relay-requests.sh', badge: 'HTTP / REST V1', code: curlSnippet, ext: 'sh' };
      case 'mcp_http':
        return { title: 'mcp-streamable-http.json', badge: 'MCP HTTP :8765', code: mcpHttpConfig, ext: 'json' };
      case 'mcp_stdio':
        return { title: 'mcp-stdio-bridge.json', badge: 'MCP STDIO', code: mcpStdioConfig, ext: 'json' };
      default:
        return { title: 'agents.json', badge: 'SHA-256 REGISTRY JSON', code: agentsJson, ext: 'json' };
    }
  }, [snippetTab, agentsJson, cliCommands, curlSnippet, mcpHttpConfig, mcpStdioConfig]);

  const enabledCount = agents.filter((a) => a.enabled).length;
  const landlockCount = agents.filter((a) => a.enabled && a.profile === 'dev').length;

  const kpis = [
    {
      label: 'Configured Agents',
      value: `${enabledCount}/${agents.length}`,
      unit: `${landlockCount} Landlock dev`,
      accent: ACCENT_DARK,
    },
    {
      label: 'Active Policy',
      value: selectedAgent.id,
      unit: `${selectedAgent.profile} · ${selectedAgent.rateLimit} rpm`,
      accent: SOV.gold,
    },
    {
      label: 'Simulator Verdict',
      value: activeEval.verdict,
      unit: activeEval.rule,
      accent: activeEval.verdict === 'ALLOW' ? SOV.emerald : SOV.crimson,
    },
    {
      label: 'Relay Endpoint',
      value: `:${RELAY_PORT}`,
      unit: daemonState === 'online' ? 'loopback live' : 'client policy deck',
      accent: daemonState === 'online' ? SOV.emerald : SOV.amber,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={daemonState === 'online' ? 'online' : 'standby'}
        label={
          daemonState === 'online'
            ? 'LOCALHOST :8765 DAEMON REACHABLE'
            : daemonState === 'offline'
              ? 'LOCALHOST :8765 OFFLINE · SIMULATOR ACTIVE'
              : 'REMOTE BROWSER MODE · DETERMINISTIC POLICY SIMULATOR'
        }
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'agents_json' ? 'Copied agents.json' : 'Copy agents.json',
      icon: copied === 'agents_json' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(agentsJson, 'agents_json'),
      primary: true,
    },
    {
      label: 'Download agents.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(agentsJson, 'agents.json', 'application/json;charset=utf-8'),
    },
    {
      label: copied === 'cli' ? 'Copied CLI Script' : 'Copy CLI Provision',
      icon: copied === 'cli' ? <CheckIcon fontSize="small" /> : <TerminalIcon fontSize="small" />,
      onClick: () => copy(cliCommands, 'cli'),
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignAlertBanner
        severity={daemonState === 'online' ? 'success' : 'info'}
        title="Runtime Scope Disclosure"
        message={
          daemonState === 'online'
            ? 'Detected local zoth-relay daemon on 127.0.0.1:8765. Policy simulation and SHA-256 registry exports run deterministically in-browser; apply changes to /etc/zoth-relay/agents.yaml via sudo zoth-relay agent add.'
            : 'Policy building, SHA-256 token hashing, path confinement checks, and command sanitizer evaluations execute 100% client-side in your browser with zero external requests. Run sudo systemctl start zoth-relay on your ZothOS host to enforce live traffic on 127.0.0.1:8765.'
        }
      />

      <SovereignCard
        index="01"
        eyebrow="PER-AGENT TOKEN & POLICY BUILDER"
        title="Agent Registry & Permissions"
        subtitle="Select an agent to edit allowed_dirs, R/W/Exec scopes, rate limits, and SHA-256 token digest"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {agents.map((ag) => {
            const active = ag.id === selectedAgent.id;
            const col = ag.enabled ? accent : resolveModeAccent(SOV.crimson, isDark);
            return (
              <Chip
                key={ag.id}
                label={`${ag.id} · ${ag.profile}${ag.enabled ? '' : ' (OFF)'}`}
                clickable
                onClick={() => setSelectedAgentId(ag.id)}
                onDelete={agents.length > 1 ? () => handleDeleteAgent(ag.id) : undefined}
                deleteIcon={<DeleteOutlineIcon fontSize="small" />}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(col, isDark ? 0.2 : 0.12) : 'transparent',
                  color: active ? col : 'text.secondary',
                  border: `1px solid ${active ? col : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        {/* Quick add new agent */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            label="New Agent Name"
            placeholder="e.g. cursor-bot"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddAgent();
            }}
            sx={{ flex: '1 1 160px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel id="new-agent-profile-lbl">Profile</InputLabel>
            <Select
              labelId="new-agent-profile-lbl"
              label="Profile"
              value={newAgentProfile}
              onChange={(e) => setNewAgentProfile(e.target.value)}
              sx={{ fontFamily: MONO, fontSize: '0.78rem' }}
            >
              {Object.keys(PROFILE_PRESETS).map((key) => (
                <MenuItem key={key} value={key} sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddAgent}
            disabled={!newAgentName.trim()}
            sx={{
              minHeight: 40,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'none',
              borderColor: rgba(accent, 0.5),
              color: accent,
            }}
          >
            Add Agent
          </Button>
        </Box>

        <Divider sx={{ my: 1.75 }} />

        {/* Selected agent editor */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <ShieldIcon fontSize="small" sx={{ color: accent }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 700 }}>
              Editing: {selectedAgent.id}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={selectedAgent.enabled}
                onChange={(e) => updateSelectedAgent({ enabled: e.target.checked })}
              />
            }
            label={
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600 }}>
                {selectedAgent.enabled ? 'Token Active' : 'Revoked'}
              </Typography>
            }
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.75 }}>
          <FormControl size="small" sx={{ flex: '1 1 170px' }}>
            <InputLabel id="edit-profile-lbl">Security Profile</InputLabel>
            <Select
              labelId="edit-profile-lbl"
              label="Security Profile"
              value={selectedAgent.profile}
              onChange={(e) => handleProfileChange(e.target.value)}
              sx={{ fontFamily: MONO, fontSize: '0.78rem' }}
            >
              {Object.keys(PROFILE_PRESETS).map((key) => (
                <MenuItem key={key} value={key} sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="number"
            label="Rate Limit (req/min)"
            inputProps={{ min: 1, max: 3600 }}
            value={selectedAgent.rateLimit}
            onChange={(e) => {
              const n = Math.max(1, Math.min(3600, Number(e.target.value) || 1));
              updateSelectedAgent({ rateLimit: n });
            }}
            sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
        </Box>

        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5, fontFamily: MONO }}>
          {PROFILE_PRESETS[selectedAgent.profile]?.summary}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
          {[
            { key: 'read', label: 'Read Files' },
            { key: 'write', label: 'Write Files' },
            { key: 'exec', label: 'Shell Exec' },
            { key: 'dashboard', label: 'Loopback Dashboard' },
          ].map((perm) => (
            <FormControlLabel
              key={perm.key}
              control={
                <Switch
                  size="small"
                  checked={Boolean(selectedAgent[perm.key])}
                  onChange={(e) => updateSelectedAgent({ [perm.key]: e.target.checked })}
                />
              }
              label={<Typography sx={{ fontFamily: MONO, fontSize: '0.73rem' }}>{perm.label}</Typography>}
            />
          ))}
        </Box>

        <TextField
          label="Allowed Directories (one absolute path per line)"
          multiline
          minRows={2}
          maxRows={5}
          fullWidth
          value={selectedAgent.allowedDirs.join('\n')}
          onChange={(e) =>
            updateSelectedAgent({
              allowedDirs: e.target.value
                .split('\n')
                .map((d) => d.trim())
                .filter(Boolean),
            })
          }
          sx={{
            mb: 1.75,
            '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 },
          }}
        />

        {/* Deterministic SHA-256 preview token strip */}
        <Box
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(16,24,40,0.03)',
            border: `1px solid ${rgba(accent, 0.25)}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: accent }}>
              PREVIEW BEARER TOKEN (CLIENT-SIDE SIMULATION)
            </Typography>
            <IconButton
              size="small"
              aria-label="Rotate preview token"
              onClick={() => updateSelectedAgent({ tokenNonce: (selectedAgent.tokenNonce || 1) + 1 })}
              sx={{ color: accent }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', wordBreak: 'break-all', mt: 0.25 }}>
            {selectedPreviewToken}
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', color: 'text.secondary', wordBreak: 'break-all', mt: 0.5 }}>
            SHA-256: {sha256Hex(selectedPreviewToken)}
          </Typography>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="EXTRA BLOCKLIST RULES"
        title="Custom Config Substring Blocklist"
        subtitle="Additional substrings enforced on top of zoth-relay built-in sanitizer (one per line)"
        accent={ACCENT_DARK}
      >
        <TextField
          label="Extra Command Blocklist Substrings"
          multiline
          minRows={3}
          maxRows={6}
          fullWidth
          value={extraBlocklistText}
          onChange={(e) => setExtraBlocklistText(e.target.value)}
          sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.5 } }}
        />
      </SovereignCard>
    </Box>
  );

  const verdictColor = resolveModeAccent(activeEval.verdict === 'ALLOW' ? SOV.emerald : SOV.crimson, isDark);

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE PATH SANDBOX & COMMAND BLOCKLIST SIMULATOR"
        title={`Evaluating as "${selectedAgent.id}" (${selectedAgent.profile})`}
        subtitle="Deterministic port of zoth_relay/sandbox.py & sanitizer.py — test paths and shell commands immediately"
        accent={activeEval.verdict === 'ALLOW' ? SOV.emerald : SOV.crimson}
      >
        {/* Mode selector */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
          {[
            { id: 'path', label: 'Filesystem Path Sandbox', icon: <FolderOpenIcon fontSize="small" /> },
            { id: 'command', label: 'Shell Command Blocklist', icon: <TerminalIcon fontSize="small" /> },
          ].map((tab) => {
            const active = simMode === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                startIcon={tab.icon}
                onClick={() => setSimMode(tab.id)}
                sx={{
                  minHeight: 40,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: accent, color: isDark ? '#08080B' : '#FFFFFF', '&:hover': { bgcolor: accent } }
                    : { borderColor: rgba(accent, 0.45), color: accent }),
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {simMode === 'path' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {SAMPLE_PATHS.map((sample) => (
                <Chip
                  key={sample.path}
                  label={sample.label}
                  clickable
                  size="small"
                  onClick={() => setPathInput(sample.path)}
                  sx={{
                    minHeight: 32,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    bgcolor: isDark ? rgba(ACCENT_DARK, 0.12) : rgba(accent, 0.08),
                    color: accent,
                    border: `1px solid ${rgba(accent, 0.3)}`,
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
              <TextField
                size="small"
                label="Target Filesystem Path"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                sx={{ flex: '1 1 240px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
              />
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                {['read', 'write'].map((op) => {
                  const active = pathOp === op;
                  return (
                    <Chip
                      key={op}
                      label={op.toUpperCase()}
                      clickable
                      onClick={() => setPathOp(op)}
                      sx={{
                        minHeight: 36,
                        fontFamily: MONO,
                        fontSize: '0.71rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                        color: active ? accent : 'text.secondary',
                        border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {SAMPLE_COMMANDS.map((sample) => (
                <Chip
                  key={sample.cmd}
                  label={sample.label}
                  clickable
                  size="small"
                  onClick={() => setCmdInput(sample.cmd)}
                  sx={{
                    minHeight: 32,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    bgcolor: isDark ? rgba(ACCENT_DARK, 0.12) : rgba(accent, 0.08),
                    color: accent,
                    border: `1px solid ${rgba(accent, 0.3)}`,
                  }}
                />
              ))}
            </Box>

            <TextField
              size="small"
              label="Shell Command to Evaluate"
              fullWidth
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
          </Box>
        )}

        {/* Verdict box */}
        <Box
          sx={{
            mt: 1.75,
            p: 1.5,
            borderRadius: 1.5,
            borderLeft: `4px solid ${verdictColor}`,
            bgcolor: isDark ? rgba(verdictColor, 0.09) : rgba(verdictColor, 0.06),
            border: `1px solid ${rgba(verdictColor, 0.32)}`,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
              {activeEval.verdict === 'ALLOW' ? (
                <GppGoodIcon sx={{ color: verdictColor }} />
              ) : (
                <GppBadIcon sx={{ color: verdictColor }} />
              )}
              <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 800, color: verdictColor }}>
                {activeEval.verdict} · {activeEval.rule}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              onClick={handleLogAudit}
              sx={{
                minHeight: 32,
                fontFamily: MONO,
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: rgba(verdictColor, 0.5),
                color: verdictColor,
              }}
            >
              Record Audit Event
            </Button>
          </Box>

          <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.5, mb: 1 }}>
            {activeEval.reason}
          </Typography>

          {simMode === 'path' && activeEval.canonicalPath && (
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              Canonical path: <strong>{activeEval.canonicalPath}</strong>
            </Typography>
          )}
          {simMode === 'command' && activeEval.normalized && (
            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
              Normalized command: <strong>{activeEval.normalized}</strong>
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <SovereignCodeBlock
            title="/var/log/zoth-relay/audit.log (JSON ENTRY)"
            badge={activeEval.verdict}
            code={JSON.stringify(activeEval.auditEntry, null, 2)}
            filename="audit-entry.json"
            accent={activeEval.verdict === 'ALLOW' ? SOV.emerald : SOV.crimson}
            maxHeight={210}
          />
        </Box>

        {auditHistory.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                SESSION AUDIT TRAIL ({auditHistory.length})
              </Typography>
              <Button
                size="small"
                onClick={() => setAuditHistory([])}
                sx={{ fontFamily: MONO, fontSize: '0.68rem', textTransform: 'none', minHeight: 28 }}
              >
                Clear
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {auditHistory.map((ev) => {
                const evCol = resolveModeAccent(ev.verdict === 'ALLOW' ? SOV.emerald : SOV.crimson, isDark);
                return (
                  <Box
                    key={ev.id}
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(16,24,40,0.025)',
                      borderLeft: `3px solid ${evCol}`,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      justifyContent: 'space-between',
                      fontFamily: MONO,
                      fontSize: '0.7rem',
                    }}
                  >
                    <Box component="span" sx={{ color: evCol, fontWeight: 700 }}>
                      [{ev.verdict}] {ev.agent} · {ev.rule}
                    </Box>
                    <Box component="span" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
                      {ev.input_path || ev.command}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="MCP / HTTP REQUEST & CLI GENERATOR"
        title="Export Configs, curl Requests & Provisioning CLI"
        subtitle={`Copyable client configs and REST/MCP snippets pre-bound to ${RELAY_BASE_URL} for "${selectedAgent.id}"`}
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {[
            { id: 'agents_json', label: 'agents.json' },
            { id: 'cli', label: 'zoth-relay CLI' },
            { id: 'curl', label: 'curl REST v1' },
            { id: 'mcp_http', label: 'MCP HTTP' },
            { id: 'mcp_stdio', label: 'MCP Stdio' },
          ].map((t) => {
            const active = snippetTab === t.id;
            return (
              <Chip
                key={t.id}
                label={t.label}
                clickable
                onClick={() => setSnippetTab(t.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.secondary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={activeSnippet.title}
          badge={activeSnippet.badge}
          code={activeSnippet.code}
          filename={activeSnippet.title}
          accent={ACCENT_DARK}
          maxHeight={310}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="zoth-relay"
      category="SWARM & CORE · HARDENED MCP BRIDGE"
      title="Zoth Relay Policy & Sandbox Workstation"
      subtitle="Per-agent SHA-256 token & policy builder, real-time POSIX path confinement and command blocklist simulator, and copyable MCP/HTTP/CLI configuration generator for 127.0.0.1:8765."
      version="0.5.0"
      variant="hex-lattice"
      accent={ACCENT_DARK}
      metrics={kpis}
      status={statusNode}
      actions={actions}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={5}
      rightCols={7}
    />
  );
}
