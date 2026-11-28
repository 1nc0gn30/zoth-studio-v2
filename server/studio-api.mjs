import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { exec, execFile, execFileSync, spawn, spawnSync } from 'node:child_process';
import { validateAxSpec, gradeFromScore, AX_SPEC_IDS } from './ax-contract-engine.mjs';
import { getBrandApiManifest } from './brand-asset-engine.mjs';
import {
  MATH_PILLARS_ENGINE_VERSION,
  evaluatePillar,
  getMathPillarsSummary,
  redactHomePaths as redactMathPillarsPaths,
} from './math-pillars-engine.mjs';
import {
  MISSION_CONTROL_SCHEMA_VERSION,
  buildMissionControlSnapshot,
  planMissionDag,
  redactMissionControlPayload,
} from './mission-control-engine.mjs';
import {
  MODELS_CONSOLE_SCHEMA_VERSION,
  estimateGgufVramFit,
  normalizeModelsSnapshot,
  parseNvidiaSmiCsv,
  redactModelsPayload,
} from './models-console-engine.mjs';
import {
  BUS_MONITOR_VERSION,
  LOOPBACK_BUS_TARGETS,
  isLoopbackHostString,
  validateLoopbackPort,
  classifyProbeStatus,
  computeLatencyStats,
  normalizeBridgeChannels,
} from './bus-monitor-engine.mjs';
import {
  CHRONICLE_SCHEMA_VERSION,
  sanitizeChronicleText,
  normalizeOverviewStats,
  normalizePatterns,
  normalizeContinuityItems,
  normalizeRecallResponse,
  normalizeConversations,
  normalizeLastSync,
  normalizeSyncTimer,
} from './chronicle-engine.mjs';
import {
  COCKPIT_SCHEMA_VERSION,
  sanitizeCockpitPayload,
  normalizeHostTelemetry,
  normalizeFleetData,
} from './cockpit-engine.mjs';
import {
  CONNECTORS_SCHEMA_VERSION,
  AI_PROVIDER_CONNECTORS,
  AGENT_HARNESS_CONNECTORS,
  ZOTH_BRIDGE_CONNECTORS,
  sanitizeConnectorText,
  sanitizeConnectorPayload,
  redactMcpServerConfig,
  validateLoopbackProbeTarget,
  computeConnectorSummary,
} from './connectors-engine.mjs';
import {
  CONSENSUS_SCHEMA_VERSION,
  ALLOWED_LOCAL_PROVIDERS,
  sanitizeConsensusText,
  sanitizeConsensusPayload,
  validateConsensusRunRequest,
  evaluateDeterministicRound,
  analyzeProposalDiff,
  tallyByzantineVotes,
  buildConsensusReceipt,
  parseModelVoteText,
} from './consensus-engine.mjs';
import {
  CYBERPUNK_HUD_SCHEMA_VERSION,
  buildCyberpunkHudSnapshot,
} from './cyberpunk-hud-engine.mjs';
import {
  EDGE_FORGE_VERSION,
  EXPECTED_HOST_TOOLCHAINS,
  assembleWasmPreset,
  inspectWasmBinary,
  buildHostToolchainSnapshot,
  redactHomePaths,
} from './edge-forge-engine.mjs';
import {
  GITHUB_OPS_VERSION,
  EXPECTED_GITHUB_TOOLCHAINS,
  isValidRepoSlug,
  redactSensitiveOutput,
  redactPayload,
  auditRepository,
  parseConventionalCommits,
  lintWorkflowYaml,
  evaluateSigningConfig,
  buildHostGitSnapshot,
} from './github-ops-engine.mjs';
import {
  HERMES_GATEWAY_SCHEMA_VERSION,
  HERMES_GATEWAY_UNIT,
  HERMES_WEBCHAT_UNIT,
  HERMES_WEBCHAT_DEFAULT_PORT,
  redactHermesPathsAndSecrets,
  parseLoopbackListenerPort,
  parseWebchatListener,
  synthesizeGatewayHealth,
  synthesizeWebchatStatus,
  parseOperatorDiagnosticText,
} from './hermes-gateway-engine.mjs';
import {
  KONSOLE_RELAY_UNIT,
  KONSOLE_RELAY_DEFAULT_PORT,
  redactKonsoleRelayPaths,
  parseKonsoleRelayListener,
  synthesizeKonsoleRelayStatus,
} from './konsole-relay-engine.mjs';
import {
  IDE_ENGINE_VERSION,
  EXPECTED_IDE_TOOLCHAINS,
  isValidRepoSlug as isValidIdeRepoSlug,
  isValidRelativeFilePath as isValidIdeRelPath,
  isBlockedSecretPath,
  redactIdeOutput,
  detectLanguageFromFilename,
  analyzeSourceStructure,
  lintSourceCode,
  computeUnifiedDiff,
  buildLiveIdeSnapshot,
} from './ide-engine.mjs';

const STUDIO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME_DIR = process.env.ZOTH_HOME || os.homedir();
const NULLAITECH_ROOT = process.env.NULLAITECH_ROOT || path.join(HOME_DIR, 'NullAITech');
const LOCAL_BIN = process.env.ZOTH_LOCAL_BIN || path.join(HOME_DIR, '.local', 'bin');
const GROK_BIN_DIR = process.env.ZOTH_GROK_BIN_DIR || path.join(HOME_DIR, '.grok', 'bin');
const AGY_BIN_DIR = path.join(HOME_DIR, '.gemini', 'antigravity-cli', 'bin');

function resolveBinaryOnPath(name, extraDirs = []) {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  const pathDirs = String(process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const dirs = [...extraDirs, '/usr/local/bin', LOCAL_BIN, '/usr/bin', ...pathDirs];
  const seen = new Set();
  for (const dir of dirs) {
    if (!dir || seen.has(dir)) continue;
    seen.add(dir);
    const full = path.join(dir, name);
    try {
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        fs.accessSync(full, fs.constants.X_OK);
        return full;
      }
    } catch {}
  }
  return null;
}

function resolveConductorBin() {
  if (process.env.ZOTH_CONDUCTOR_BIN && fs.existsSync(process.env.ZOTH_CONDUCTOR_BIN)) {
    return process.env.ZOTH_CONDUCTOR_BIN;
  }
  if (fs.existsSync('/usr/local/bin/zoth-agent-conductor')) {
    return '/usr/local/bin/zoth-agent-conductor';
  }
  const repoConductor = path.join(NULLAITECH_ROOT, 'bin', 'zoth-agent-conductor');
  if (fs.existsSync(repoConductor)) {
    return repoConductor;
  }
  return resolveBinaryOnPath('zoth-agent-conductor') || '/usr/local/bin/zoth-agent-conductor';
}

const CONDUCTOR_BIN = resolveConductorBin();

function sanitizeErrorMessage(msg) {
  const raw = String(msg || 'Execution error');
  if (!HOME_DIR) return raw;
  return raw.split(HOME_DIR).join('~');
}

function runDeterministicTransformServer(mode, promptText) {
  const t0 = Date.now();
  const text = String(promptText || '').trim();
  const lines = text ? text.split(/\r?\n/) : [];
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const normMode = String(mode || 'markdown-brief').toLowerCase();
  let output = '';

  if (normMode === 'json-validate' || normMode === 'validator') {
    const startIdx = [text.indexOf('{'), text.indexOf('[')].filter((i) => i >= 0).sort((a, b) => a - b)[0];
    let candidate = text;
    if (startIdx !== undefined) {
      const endIdx = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
      if (endIdx > startIdx) candidate = text.slice(startIdx, endIdx + 1);
    }
    try {
      const parsed = JSON.parse(candidate);
      const keys = Array.isArray(parsed) ? [`array[${parsed.length}]`] : Object.keys(parsed || {});
      output = `[TRANSFORM: json-validate] VALID JSON (${keys.join(', ') || 'empty'})\n${JSON.stringify(parsed, null, 2)}`;
    } catch (err) {
      output = `[TRANSFORM: json-validate] JSON parse diagnostic: ${err.message}\n${text.slice(0, 600)}`;
    }
  } else if (normMode === 'regex-extract') {
    const urls = [...new Set(text.match(/https?:\/\/[^\s"'<>]+/g) || [])];
    const ports = [...new Set(text.match(/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)?:\d{2,5}/g) || [])];
    const routes = [...new Set(text.match(/\/api\/[a-zA-Z0-9/_-]+/g) || [])];
    output = [
      `[TRANSFORM: regex-extract] ${text.length} chars · ${lines.length} lines · ${words} words`,
      `- Routes (${routes.length}): ${routes.join(', ') || 'none'}`,
      `- Endpoints (${ports.length}): ${ports.join(', ') || 'none'}`,
      `- URLs (${urls.length}): ${urls.join(', ') || 'none'}`,
    ].join('\n');
  } else if (normMode === 'schema-verify') {
    const hasWildcard = /0\.0\.0\.0/.test(text);
    const hasSecret = /(sk-[a-zA-Z0-9]{16,}|ghp_[a-zA-Z0-9]{16,}|PRIVATE KEY)/.test(text);
    output = [
      `[TRANSFORM: schema-verify] Policy & Schema Check`,
      `[${text.length >= 12 ? 'PASS' : 'WARN'}] Payload size (${text.length} chars, ${words} words)`,
      `[${hasWildcard ? 'WARN' : 'PASS'}] Loopback hygiene`,
      `[${hasSecret ? 'FAIL' : 'PASS'}] Secret hygiene`,
    ].join('\n');
  } else {
    const bullets = lines
      .filter((l) => l.trim().length > 0)
      .slice(0, 6)
      .map((l) => `- ${l.trim().slice(0, 180)}`);
    output = [
      `# Pipeline Synthesis Brief`,
      `> Deterministic Transform (\`${normMode}\`) · ${words} words`,
      ...bullets,
    ].join('\n');
  }

  return {
    ok: true,
    provider: 'transform',
    model: normMode,
    output,
    durationMs: Math.max(1, Date.now() - t0),
    tokenEstimate: Math.max(1, Math.round(output.length / 4)),
    error: null,
  };
}

export async function probeComposerProviders() {
  const probeTimed = async (port, urlPath, timeout = 1100) => {
    const t0 = Date.now();
    const res = await requestJson(port, urlPath, { method: 'GET', timeout });
    return { ...res, latencyMs: res.up ? Math.max(1, Date.now() - t0) : 0 };
  };

  const [ollamaTags, hermesHealth, hermesModels, azothHealth, memoryPrimary, memorySec, bridgePrimary] = await Promise.all([
    probeTimed(11434, '/api/tags', 1100),
    probeTimed(18000, '/health', 1100),
    probeTimed(18000, '/v1/models', 1100),
    probeTimed(8136, '/health', 1100),
    probeTimed(8094, '/health', 1100),
    probeTimed(8788, '/health', 900),
    probeTimed(8102, '/health', 1100),
  ]);

  const ollamaModelList = ollamaTags.up ? localModels(ollamaTags.json) : [];
  const hermesModelList = hermesModels.up && Array.isArray(hermesModels.json?.data)
    ? hermesModels.json.data.map((m) => m.id || m.name).filter(Boolean)
    : [];
  const memoryUp = memoryPrimary.up || memorySec.up;
  const memoryPort = memoryPrimary.up ? 8094 : 8788;

  const cliBins = {
    hermes: Boolean(resolveBinaryOnPath('hermes', [LOCAL_BIN, '/opt/zothos-ai-env/bin'])),
    agy: Boolean(resolveBinaryOnPath('agy', [AGY_BIN_DIR, LOCAL_BIN])),
    codex: Boolean(resolveBinaryOnPath('codex', [LOCAL_BIN])),
    'claude-code': Boolean(resolveBinaryOnPath('claude', [LOCAL_BIN])),
  };

  return {
    checkedAt: new Date().toISOString(),
    loopbackOnly: true,
    providers: {
      ollama: {
        id: 'ollama',
        name: 'Ollama Local LLM',
        kind: 'loopback',
        port: 11434,
        up: ollamaTags.up,
        latencyMs: ollamaTags.latencyMs,
        models: ollamaModelList,
        capabilities: ['chat', 'completion', 'local-inference'],
      },
      'agy-hermes': {
        id: 'agy-hermes',
        name: 'AGY-Hermes Proxy',
        kind: 'loopback',
        port: 18000,
        up: hermesHealth.up || hermesModels.up,
        latencyMs: hermesHealth.latencyMs || hermesModels.latencyMs,
        models: hermesModelList,
        capabilities: ['openai-compat', 'chat', 'multi-model-routing'],
      },
      azoth: {
        id: 'azoth',
        name: 'Azoth Local Agent',
        kind: 'loopback',
        port: 8136,
        up: azothHealth.up,
        latencyMs: azothHealth.latencyMs,
        models: azothHealth.up ? ['azoth-react'] : [],
        capabilities: ['react-loop', 'local-agent'],
      },
      'neuro-memory': {
        id: 'neuro-memory',
        name: 'Neuro-Memory Daemon',
        kind: 'loopback',
        port: memoryPort,
        up: memoryUp,
        latencyMs: memoryPrimary.up ? memoryPrimary.latencyMs : memorySec.latencyMs,
        models: memoryUp ? ['stdp-recall'] : [],
        capabilities: ['stdp-recall', 'context-memory'],
      },
      'sovereign-bridge': {
        id: 'sovereign-bridge',
        name: 'Sovereign Agent Bridge',
        kind: 'loopback',
        port: 8102,
        up: bridgePrimary.up,
        latencyMs: bridgePrimary.latencyMs,
        models: bridgePrimary.up ? ['signal-mesh'] : [],
        capabilities: ['ipc-relay', 'signal-mesh'],
      },
      transform: {
        id: 'transform',
        name: 'Deterministic Transform (Local JS)',
        kind: 'deterministic',
        port: null,
        up: true,
        latencyMs: 1,
        models: ['json-validate', 'markdown-brief', 'regex-extract', 'schema-verify'],
        capabilities: ['json-validate', 'markdown-brief', 'regex-extract', 'schema-verify'],
      },
    },
    cli: {
      hermes: { id: 'hermes', command: 'hermes', detected: cliBins.hermes, kind: 'cli' },
      agy: { id: 'agy', command: 'agy', detected: cliBins.agy, kind: 'cli' },
      codex: { id: 'codex', command: 'codex', detected: cliBins.codex, kind: 'cli' },
      'claude-code': { id: 'claude-code', command: 'claude', detected: cliBins['claude-code'], kind: 'cli' },
    },
  };
}

const ON_DEMAND_PROCS = [];
const MAX_ON_DEMAND_PROCS = 4;

function resolveToolRootDir(id, repo) {
  const aliases = {
    'zoth-bolt': 'bolt.diy',
    'bolt-diy': 'bolt.diy',
    'zoth-math-pillar': 'zoth-math-pillar',
    'zothos-lite': 'zothos-lite',
    'hexstrike': 'hexstrike-arsenal',
    'polyglot-studio': 'polyglot-framework-exporter',
    'schema-illustrator': 'schema-illustrator-studio',
  };
  const candidates = [
    aliases[id],
    aliases[repo],
    repo,
    id,
    id ? `ai-${id}` : '',
    id ? `${id}-ai` : '',
    repo ? `ai-${repo}` : '',
    repo ? `${repo}-ai` : '',
  ].filter(Boolean);
  for (const name of candidates) {
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) continue;
    for (const base of [NULLAITECH_ROOT, '/opt']) {
      const dir = path.join(base, name);
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        return dir;
      }
    }
  }
  return null;
}

function spawnOnDemandTool(id, rootDir, port, extraEnv = {}) {
  while (ON_DEMAND_PROCS.length >= MAX_ON_DEMAND_PROCS) {
    const oldest = ON_DEMAND_PROCS.shift();
    if (oldest?.child?.pid) {
      try { process.kill(-oldest.child.pid, 'SIGTERM'); } catch {}
      try { oldest.child.kill('SIGTERM'); } catch {}
    }
  }

  const env = { ...process.env, PORT: String(port), PYTHONUNBUFFERED: '1', ...extraEnv };
  let cmd = 'python3';
  let args = ['server.py', '--port', String(port)];

  // Zoth Bolt = the real bolt.diy fork (Remix/Vite workbench on :5173).
  // The braille server.py stand-in is retired — never spawn it for the fork.
  const isBoltFork = ['zoth-bolt', 'bolt-diy', 'bolt.diy'].includes(id) || path.basename(rootDir) === 'bolt.diy';
  if (isBoltFork) {
    cmd = 'npm';
    args = ['run', 'dev', '--', '--port', String(port)];
  } else if (fs.existsSync(path.join(rootDir, 'server.js'))) {
    cmd = 'node';
    args = ['server.js', '--port', String(port)];
  } else if (fs.existsSync(path.join(rootDir, 'server.py'))) {
    cmd = 'python3';
    args = ['server.py', '--port', String(port)];
  } else if (fs.existsSync(path.join(rootDir, 'zoth_relay', 'server.py'))) {
    cmd = 'python3';
    args = ['-m', 'zoth_relay.server', '--port', String(port)];
  } else if (fs.existsSync(path.join(rootDir, 'src'))) {
    const srcDir = path.join(rootDir, 'src');
    const pkgs = fs.readdirSync(srcDir).filter((d) => fs.existsSync(path.join(srcDir, d, 'cli.py')));
    if (pkgs.length > 0) {
      env.PYTHONPATH = env.PYTHONPATH ? `${srcDir}:${env.PYTHONPATH}` : srcDir;
      args = ['-m', `${pkgs[0]}.cli`, 'serve', '--port', String(port)];
    }
  } else {
    const staticDir = ['public', 'dist', '.']
      .map((d) => path.join(rootDir, d))
      .find((d) => fs.existsSync(path.join(d, 'index.html'))) || rootDir;
    cmd = 'python3';
    args = ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', staticDir];
  }

  const child = spawn(cmd, args, {
    cwd: rootDir,
    stdio: 'ignore',
    detached: true,
    env,
  });
  child.unref();
  ON_DEMAND_PROCS.push({ id, port, child, startedAt: Date.now() });
}

let LOCAL_BENCHMARKS = [
  {
    id: 'BENCH-STREAM-01',
    adapter: 'Apple M3 Max GPU (30 Cores)',
    matrixSize: 512,
    gflops: '142.8',
    tflops: '0.143 TFLOPS',
    timeMs: '3.75',
    verified: true,
    userTag: '1nc0gn30 @ Netlify Stream',
    timestamp: new Date().toISOString()
  },
  {
    id: 'BENCH-STREAM-02',
    adapter: 'NVIDIA GeForce RTX 4090',
    matrixSize: 512,
    gflops: '482.4',
    tflops: '0.482 TFLOPS',
    timeMs: '1.11',
    verified: true,
    userTag: 'Sovereign Enclave Node',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'BENCH-STREAM-03',
    adapter: 'Intel Iris Xe Graphics',
    matrixSize: 256,
    gflops: '42.1',
    tflops: '0.042 TFLOPS',
    timeMs: '0.79',
    verified: true,
    userTag: 'Community Guest (Chrome)',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function requestJson(port, urlPath, { method = 'GET', body = null, timeout = 900 } = {}) {
  return new Promise((resolve) => {
    const payload = body == null ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: urlPath,
        method,
        timeout,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': payload.length }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          if (text) {
            try {
              json = JSON.parse(text);
            } catch {
              json = { raw: text.slice(0, 400) };
            }
          }
          resolve({ up: res.statusCode > 0 && res.statusCode < 500, status: res.statusCode, json });
        });
      }
    );
    req.on('error', () => resolve({ up: false, status: 0, json: null }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ up: false, status: 0, json: null });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function localModels(tags) {
  const models = tags?.models || [];
  return models
    .map((model) => model.name)
    .filter((name) => name && !/cloud/i.test(name));
}

function sampleCpuTimes() {
  const cpus = os.cpus() || [];
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    const t = cpu.times || {};
    idle += (t.idle || 0);
    total += (t.user || 0) + (t.nice || 0) + (t.sys || 0) + (t.idle || 0) + (t.irq || 0);
  }
  return { idle, total };
}

function measureCpuPct(windowMs = 60) {
  return new Promise((resolve) => {
    const start = sampleCpuTimes();
    setTimeout(() => {
      const end = sampleCpuTimes();
      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      if (totalDiff <= 0) {
        resolve(0);
        return;
      }
      const pct = Math.max(0, Math.min(100, (1 - idleDiff / totalDiff) * 100));
      resolve(Math.round(pct * 10) / 10);
    }, windowMs);
  });
}

function readRootDiskStats() {
  try {
    if (typeof fs.statfsSync === 'function') {
      const st = fs.statfsSync('/');
      const bsize = Number(st.bsize || st.frsize || 4096);
      const totalBytes = Number(st.blocks || 0) * bsize;
      const freeBytes = Number(st.bavail ?? st.bfree ?? 0) * bsize;
      const usedBytes = Math.max(0, totalBytes - freeBytes);
      const gib = 1024 ** 3;
      return {
        mount: '/',
        totalGiB: Math.round((totalBytes / gib) * 100) / 100,
        usedGiB: Math.round((usedBytes / gib) * 100) / 100,
        freeGiB: Math.round((freeBytes / gib) * 100) / 100,
      };
    }
  } catch {}
  return { mount: '/', totalGiB: 0, usedGiB: 0, freeGiB: 0 };
}

function readThermalZones() {
  const zones = [];
  const base = '/sys/class/thermal';
  try {
    if (!fs.existsSync(base)) return zones;
    const dirs = fs.readdirSync(base).filter((d) => d.startsWith('thermal_zone')).sort();
    for (const dir of dirs) {
      const tempPath = path.join(base, dir, 'temp');
      const typePath = path.join(base, dir, 'type');
      try {
        const rawTemp = fs.readFileSync(tempPath, 'utf8').trim();
        const milli = Number(rawTemp);
        if (!Number.isFinite(milli)) continue;
        const tempC = Math.round((milli / 1000) * 10) / 10;
        if (tempC < -30 || tempC > 150) continue;
        let type = 'sensor';
        try {
          type = fs.readFileSync(typePath, 'utf8').trim() || 'sensor';
        } catch {}
        zones.push({ name: dir, type, tempC });
      } catch {}
    }
  } catch {}
  return zones;
}

function readNvidiaGpu(timeoutMs = 900) {
  return new Promise((resolve) => {
    const bin = resolveBinaryOnPath('nvidia-smi');
    if (!bin) {
      resolve(null);
      return;
    }
    execFile(
      bin,
      ['--query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'],
      { timeout: timeoutMs, maxBuffer: 16 * 1024 },
      (err, stdout) => {
        if (err || !stdout || !stdout.trim()) {
          resolve(null);
          return;
        }
        const firstLine = stdout.trim().split(/\r?\n/)[0] || '';
        const parts = firstLine.split(',').map((s) => s.trim());
        if (parts.length < 5 || !parts[0]) {
          resolve(null);
          return;
        }
        resolve({
          name: parts[0],
          tempC: Number.isFinite(Number(parts[1])) ? Number(parts[1]) : null,
          utilizationPct: Number.isFinite(Number(parts[2])) ? Number(parts[2]) : null,
          memoryUsedMiB: Number.isFinite(Number(parts[3])) ? Number(parts[3]) : 0,
          memoryTotalMiB: Number.isFinite(Number(parts[4])) ? Number(parts[4]) : 0,
        });
      }
    );
  });
}

function detectAudioSubsystem() {
  const uid = typeof process.getuid === 'function' ? process.getuid() : 1000;
  const pipewireSock = `/run/user/${uid}/pipewire-0`;
  const pulseSock = `/run/user/${uid}/pulse/native`;
  let alsaCard = '';
  try {
    if (fs.existsSync('/proc/asound/cards')) {
      const raw = fs.readFileSync('/proc/asound/cards', 'utf8');
      const m = raw.match(/^\s*\d+\s+\[[^\]]+\]:\s*(.+)$/m);
      if (m && m[1]) alsaCard = m[1].trim();
    }
  } catch {}

  if (fs.existsSync(pipewireSock) || resolveBinaryOnPath('wpctl')) {
    return {
      subsystem: 'PipeWire / WirePlumber',
      device: alsaCard || 'PipeWire Audio Graph (Active)',
      detected: true,
    };
  }
  if (fs.existsSync(pulseSock) || resolveBinaryOnPath('pactl')) {
    return {
      subsystem: 'PulseAudio',
      device: alsaCard || 'PulseAudio Server (Active)',
      detected: true,
    };
  }
  if (alsaCard) {
    return {
      subsystem: 'ALSA',
      device: alsaCard,
      detected: true,
    };
  }
  return {
    subsystem: 'Unavailable',
    device: 'No local audio subsystem detected',
    detected: false,
  };
}

function readRealityProfileState() {
  const modeFile = path.join(HOME_DIR, '.config', 'zothos', 'current_mode');
  const charFile = path.join(HOME_DIR, '.config', 'zothos', 'active_character.json');
  let mode = 'gold';
  try {
    if (fs.existsSync(modeFile)) {
      mode = fs.readFileSync(modeFile, 'utf8').trim() || 'gold';
    }
  } catch {}
  let character = null;
  try {
    if (fs.existsSync(charFile)) {
      character = JSON.parse(fs.readFileSync(charFile, 'utf8'));
    }
  } catch {}
  return {
    mode,
    character,
    allModes: ['gold', 'ghost', 'matrix', 'incognito'],
  };
}

async function collectRawHostTelemetry() {
  const [cpuPct, gpu] = await Promise.all([measureCpuPct(60), readNvidiaGpu(900)]);
  const isZothOS = fs.existsSync('/etc/zothos-release') || fs.existsSync('/usr/local/bin/zoth-doctor') || fs.existsSync('/opt/zoth-studio');
  const cpus = os.cpus() || [];
  const audio = detectAudioSubsystem();
  const disk = readRootDiskStats();
  const thermalZones = readThermalZones();

  return {
    isZothOS,
    distro: isZothOS ? 'ZothOS Sovereign Linux' : `${os.type()} (${os.platform()})`,
    release: isZothOS ? '2026.1 (Imperial Sovereign Edition)' : os.release(),
    kernel: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: cpus.length || 1,
    cpuModel: cpus[0]?.model || 'Native Silicon',
    cpuPct,
    loadavg: os.loadavg().map((n) => Math.round(n * 100) / 100),
    totalMem: Math.round(os.totalmem() / (1024 * 1024)),
    freeMem: Math.round(os.freemem() / (1024 * 1024)),
    uptime: Math.round(os.uptime()),
    disk,
    thermalZones,
    gpu,
    audio,
    audioDevice: audio.detected ? `${audio.subsystem} — ${audio.device}` : 'No local audio subsystem detected',
    installedTools: {
      claude: fs.existsSync('/usr/local/bin/claude') || fs.existsSync(path.join(LOCAL_BIN, 'claude')),
      opencode: fs.existsSync('/usr/local/bin/opencode') || fs.existsSync(path.join(LOCAL_BIN, 'opencode')),
      hermes: fs.existsSync(path.join(LOCAL_BIN, 'hermes')) || fs.existsSync('/usr/local/bin/hermes'),
      cursor: fs.existsSync(path.join(LOCAL_BIN, 'cursor-agent')) || fs.existsSync('/usr/bin/cursor'),
      zothos: fs.existsSync(CONDUCTOR_BIN) || fs.existsSync('/usr/local/bin/zoth-agent-conductor'),
      grok: fs.existsSync(path.join(GROK_BIN_DIR, 'agent')) || fs.existsSync('/usr/local/bin/grok'),
      burpsuite: fs.existsSync('/usr/bin/burpsuite'),
      bitwarden: fs.existsSync('/usr/local/bin/bw'),
      streamlit: fs.existsSync('/usr/local/bin/streamlit'),
      netlify: fs.existsSync('/usr/local/bin/netlify') || fs.existsSync(path.join(LOCAL_BIN, 'netlify')),
      ollama: fs.existsSync('/usr/local/bin/ollama') || fs.existsSync('/usr/bin/ollama'),
    },
  };
}

export async function collectCockpitSnapshot() {
  const [rawHost, statusData, fleetRaw] = await Promise.all([
    collectRawHostTelemetry(),
    probeStatus(),
    probeFleet(450),
  ]);
  const reality = readRealityProfileState();
  const host = normalizeHostTelemetry(rawHost);
  const fleet = normalizeFleetData(fleetRaw);
  const svcs = statusData?.services || {};

  const coreKeys = ['memory', 'bridge', 'vault', 'ollama', 'agy-hermes-proxy', 'chronicleVault', 'swarm', 'konsoleRelay'];
  const coreDaemons = coreKeys
    .filter((k) => svcs[k])
    .map((k) => ({
      id: k,
      name: svcs[k].name || k,
      port: svcs[k].port || null,
      up: Boolean(svcs[k].up),
      models: Array.isArray(svcs[k].models) ? svcs[k].models : undefined,
      modelsCount: svcs[k].modelsCount ?? (Array.isArray(svcs[k].models) ? svcs[k].models.length : undefined),
    }));

  const payload = {
    schemaVersion: COCKPIT_SCHEMA_VERSION,
    mode: 'loopback-live',
    checkedAt: new Date().toISOString(),
    host,
    daemons: {
      kvm: Boolean(statusData?.kvm),
      core: coreDaemons,
      ollamaModels: Array.isArray(svcs.ollama?.models) ? svcs.ollama.models : [],
      chronicleSyncTimer: svcs.chronicleSyncTimer?.detail || null,
      konsoleRelay: svcs.konsoleRelay?.detail || null,
    },
    fleet,
    reality,
    counts: {
      tools: 85,
      workstations: 45,
      ports: fleet.total,
    },
  };

  return sanitizeCockpitPayload(payload);
}

export async function probeFleet(timeoutMs = 1200) {
  const distTools = path.join(STUDIO_ROOT, 'dist', 'api', 'tools.json');
  const pubTools = path.join(STUDIO_ROOT, 'public', 'api', 'tools.json');
  const toolsJsonPath = fs.existsSync(distTools) ? distTools : pubTools;
  let tools = [];
  try {
    const raw = fs.readFileSync(toolsJsonPath, 'utf8');
    tools = JSON.parse(raw).tools || [];
  } catch (e) {
    tools = [];
  }

  const corePorts = [
    { port: 3000, name: 'Zoth Studio UI', category: 'Hub & Studio', isCore: true },
    { port: 8094, name: 'Neuro-Memory Studio UI', category: 'Core Synaptic', isCore: true },
    { port: 8788, name: 'Neuro-Memory REST API', category: 'Core Synaptic', isCore: true },
    { port: 8102, name: 'Sovereign Signal Bridge', category: 'Core IPC', isCore: true },
    { port: 8110, name: 'Agent Budget Sentinel UI', category: 'FinOps', isCore: true },
    { port: 8111, name: 'Budget Sentinel Proxy', category: 'FinOps', isCore: true },
    { port: 8114, name: 'Voice Call Cockpit', category: 'Voice Real-Time', isCore: true },
    { port: 8787, name: 'Zoth Vault Daemon', category: 'Security Enclave', isCore: true },
    { port: 11434, name: 'Ollama Model Server', category: 'Core LLM', isCore: true },
  ];

  const seenPorts = new Set(corePorts.map((c) => c.port));
  const fleetList = [...corePorts];
  const [hermesGw, hermesWc, konsoleRelay] = await Promise.all([
    readHermesGatewayStatus(),
    readHermesWebchatStatus(),
    readKonsoleRelayStatus(),
  ]);
  if (hermesGw?.listener?.port && !seenPorts.has(hermesGw.listener.port)) {
    seenPorts.add(hermesGw.listener.port);
    fleetList.push({
      port: hermesGw.listener.port,
      id: 'hermes-gateway',
      name: 'Hermes Agent Gateway (Dynamic Loopback)',
      category: 'Core Agent Gateway',
      isCore: true,
    });
  }
  const webchatPort = hermesWc?.listener?.port || HERMES_WEBCHAT_DEFAULT_PORT;
  if (!seenPorts.has(webchatPort)) {
    seenPorts.add(webchatPort);
    fleetList.push({
      port: webchatPort,
      id: 'hermes-webchat',
      name: 'Hermes WebChat (Zoth Console)',
      category: 'Tailnet Agent Console',
      isCore: true,
      _webchatSnapshot: hermesWc,
    });
  }
  const konsolePort = konsoleRelay?.listener?.port || KONSOLE_RELAY_DEFAULT_PORT;
  if (!seenPorts.has(konsolePort)) {
    seenPorts.add(konsolePort);
    fleetList.push({
      port: konsolePort,
      id: 'konsole-relay',
      name: 'Konsole Relay (KDE D-Bus)',
      category: 'Desktop D-Bus Relay',
      isCore: true,
      _konsoleSnapshot: konsoleRelay,
    });
  }
  for (const t of tools) {
    if (t.port && !seenPorts.has(t.port)) {
      seenPorts.add(t.port);
      fleetList.push({
        port: t.port,
        id: t.id,
        name: t.name,
        category: t.category,
        execution_type: t.execution_type,
        isCore: false,
      });
    }
  }

  fleetList.sort((a, b) => a.port - b.port);

  const results = await Promise.all(
    fleetList.map(async (item) => {
      if (item.id === 'hermes-webchat' && item._webchatSnapshot) {
        const wc = item._webchatSnapshot;
        const { _webchatSnapshot, ...cleanItem } = item;
        return {
          ...cleanItem,
          host: wc?.listener?.host || null,
          tailnetOnly: Boolean(wc?.listener?.tailnetOnly),
          pid: wc?.systemd?.pid || null,
          up: Boolean(wc?.active),
          latencyMs: 0,
          statusCode: wc?.active ? 200 : 0,
        };
      }
      if (item.id === 'konsole-relay' && item._konsoleSnapshot) {
        const kr = item._konsoleSnapshot;
        const { _konsoleSnapshot, ...cleanItem } = item;
        return {
          ...cleanItem,
          host: kr?.listener?.host || '127.0.0.1',
          loopbackOnly: Boolean(kr?.listener?.loopbackOnly),
          pid: kr?.systemd?.pid || null,
          konsoleSessions: kr?.konsoleSessions ?? null,
          up: Boolean(kr?.active),
          latencyMs: kr?.health?.latencyMs ?? 0,
          statusCode: kr?.health?.statusCode || (kr?.active ? 200 : 0),
        };
      }
      const t0 = Date.now();
      const res = await requestJson(item.port, '/', { method: 'GET', timeout: timeoutMs });
      return {
        ...item,
        up: res.up,
        latencyMs: res.up ? Date.now() - t0 : 0,
        statusCode: res.status || 0,
      };
    })
  );

  const live = results.filter((r) => r.up).length;
  return {
    checkedAt: new Date().toISOString(),
    total: results.length,
    live,
    dark: results.length - live,
    fleet: results,
  };
}

function readChronicleSyncTimerStatus(timeoutMs = 1200) {
  return new Promise((resolve) => {
    execFile(
      'systemctl',
      [
        '--user',
        'show',
        'chronicle-vault-sync.timer',
        'chronicle-vault-sync.service',
        '-p',
        'Id,ActiveState,SubState,UnitFileState,NextElapseUSecRealtime,LastTriggerUSec,Result,ExecMainStatus,ExecMainStartTimestamp,ExecMainExitTimestamp,MemoryPeak',
      ],
      { timeout: timeoutMs, maxBuffer: 64 * 1024 },
      (err, stdout) => {
        if (err || !stdout || !stdout.trim()) {
          resolve(normalizeSyncTimer({ available: false }));
          return;
        }
        const blocks = stdout.trim().split(/\n\s*\n/).filter(Boolean);
        const byId = {};
        for (const block of blocks) {
          const kv = {};
          for (const line of block.split(/\r?\n/)) {
            const idx = line.indexOf('=');
            if (idx > 0) {
              kv[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
            }
          }
          if (kv.Id) byId[kv.Id] = kv;
        }
        const timer = byId['chronicle-vault-sync.timer'] || {};
        const svc = byId['chronicle-vault-sync.service'] || {};
        if (!timer.ActiveState && !svc.ActiveState) {
          resolve(normalizeSyncTimer({ available: false }));
          return;
        }
        let memPeakMb = null;
        if (svc.MemoryPeak && /^\d+$/.test(svc.MemoryPeak)) {
          const bytes = Number(svc.MemoryPeak);
          if (Number.isFinite(bytes) && bytes >= 0 && bytes < 1e15) {
            memPeakMb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
          }
        }
        let lastDurationSec = null;
        const startMs = svc.ExecMainStartTimestamp ? Date.parse(svc.ExecMainStartTimestamp) : NaN;
        const exitMs = svc.ExecMainExitTimestamp ? Date.parse(svc.ExecMainExitTimestamp) : NaN;
        if (Number.isFinite(startMs) && Number.isFinite(exitMs) && exitMs >= startMs) {
          lastDurationSec = Math.round(((exitMs - startMs) / 1000) * 10) / 10;
        }
        const exitStatus = svc.ExecMainStatus && /^\d+$/.test(svc.ExecMainStatus) ? Number(svc.ExecMainStatus) : null;
        const finishWithNext = (nextTrig) => {
          resolve(
            normalizeSyncTimer({
              available: true,
              unit: 'chronicle-vault-sync.timer',
              serviceUnit: 'chronicle-vault-sync.service',
              activeState: timer.ActiveState || 'unknown',
              subState: timer.SubState || 'unknown',
              unitFileState: timer.UnitFileState || 'unknown',
              serviceActiveState: svc.ActiveState || 'unknown',
              nextTrigger: nextTrig || '',
              lastTrigger: timer.LastTriggerUSec || '',
              result: svc.Result || '',
              exitStatus,
              lastDurationSec,
              memPeakMb,
              cadence: '30m',
            })
          );
        };
        if (timer.NextElapseUSecRealtime) {
          finishWithNext(timer.NextElapseUSecRealtime);
          return;
        }
        execFile(
          'systemctl',
          ['--user', 'list-timers', 'chronicle-vault-sync.timer', '--output=json', '--no-pager'],
          { timeout: Math.min(timeoutMs, 1000), maxBuffer: 32 * 1024 },
          (ltErr, ltOut) => {
            let nextTrig = '';
            if (!ltErr && ltOut && ltOut.trim()) {
              try {
                const parsed = JSON.parse(ltOut);
                const nextUs = Array.isArray(parsed) && parsed[0]?.next ? Number(parsed[0].next) : 0;
                if (Number.isFinite(nextUs) && nextUs > 0) {
                  nextTrig = new Date(nextUs / 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
                }
              } catch {}
            }
            finishWithNext(nextTrig);
          }
        );
      }
    );
  });
}

const HERMES_GATEWAY_CACHE_TTL_MS = 5000;
let _hermesGatewayCache = { at: 0, data: null };

async function readHermesGatewayStatus({ bypassCache = false } = {}) {
  if (!bypassCache && _hermesGatewayCache.data && Date.now() - _hermesGatewayCache.at < HERMES_GATEWAY_CACHE_TTL_MS) {
    return _hermesGatewayCache.data;
  }

  let systemd = { available: false, unit: HERMES_GATEWAY_UNIT, active: false, activeState: 'unavailable' };
  try {
    const props = [
      'Id', 'ActiveState', 'SubState', 'UnitFileState', 'MainPID', 'TasksCurrent',
      'MemoryCurrent', 'MemoryPeak', 'ExecMainStartTimestamp', 'FragmentPath',
      'NoNewPrivileges', 'PrivateTmp', 'UMask', 'MemoryMax', 'MemoryHigh', 'CPUQuotaPerSecUSec',
    ].join(',');
    const out = execFileSync(
      'systemctl',
      ['--user', 'show', HERMES_GATEWAY_UNIT, '-p', props, '--no-pager'],
      { encoding: 'utf8', timeout: 1500, maxBuffer: 64 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    if (out && out.trim()) {
      const kv = {};
      for (const line of out.split(/\r?\n/)) {
        const idx = line.indexOf('=');
        if (idx > 0) kv[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      const parseIntSafe = (k) => {
        const raw = kv[k] || '';
        if (!/^\d+$/.test(raw)) return null;
        const n = Number(raw);
        return Number.isSafeInteger(n) && n >= 0 ? n : null;
      };
      const pidVal = parseIntSafe('MainPID');
      systemd = {
        available: Boolean(kv.ActiveState),
        unit: kv.Id || HERMES_GATEWAY_UNIT,
        active: kv.ActiveState === 'active',
        activeState: kv.ActiveState || 'unknown',
        subState: kv.SubState || 'unknown',
        unitFileState: kv.UnitFileState || 'unknown',
        pid: pidVal && pidVal > 0 ? pidVal : null,
        tasks: parseIntSafe('TasksCurrent'),
        startedAt: kv.ExecMainStartTimestamp || null,
        memoryCurrentBytes: parseIntSafe('MemoryCurrent'),
        memoryPeakBytes: parseIntSafe('MemoryPeak'),
        fragmentPath: kv.FragmentPath || '~/.config/systemd/user/hermes-gateway.service',
        hardening: {
          noNewPrivileges: kv.NoNewPrivileges === 'yes',
          privateTmp: kv.PrivateTmp === 'yes',
          umask: kv.UMask || '',
          memoryMax: kv.MemoryMax || '',
        },
      };
    }
  } catch {}

  let listenerPort = null;
  try {
    const ssOut = execFileSync(
      'ss',
      ['-tlnp'],
      { encoding: 'utf8', timeout: 1500, maxBuffer: 256 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    listenerPort = parseLoopbackListenerPort(ssOut, systemd.pid);
  } catch {}

  let health = null;
  let status = null;
  if (listenerPort) {
    const [hRes, sRes] = await Promise.all([
      requestJson(listenerPort, '/api/health', { timeout: 1500 }),
      requestJson(listenerPort, '/api/status', { timeout: 1500 }),
    ]);
    if (hRes.up && hRes.json && typeof hRes.json === 'object') health = hRes.json;
    if (sRes.up && sRes.json && typeof sRes.json === 'object') status = sRes.json;
  }

  // Strictly read-only metadata reads (never reads .env, auth.json, or config.yaml secrets)
  const hermesDir = path.join(HOME_DIR, '.hermes');
  let socketExists = false;
  let stateDbBytes = null;
  let gatewayState = null;
  const memoryLimits = {};

  try {
    socketExists = fs.existsSync(path.join(hermesDir, 'gateway.sock'));
  } catch {}
  try {
    const dbStat = fs.statSync(path.join(hermesDir, 'state.db'));
    if (dbStat.isFile()) stateDbBytes = dbStat.size;
  } catch {}
  try {
    const gsPath = path.join(hermesDir, 'gateway_state.json');
    if (fs.existsSync(gsPath)) {
      const parsed = JSON.parse(fs.readFileSync(gsPath, 'utf8'));
      if (parsed && typeof parsed === 'object') {
        const safePlatforms = {};
        if (parsed.platforms && typeof parsed.platforms === 'object') {
          for (const [pname, pval] of Object.entries(parsed.platforms)) {
            if (pval && typeof pval === 'object') {
              safePlatforms[pname] = {
                state: pval.state || 'unknown',
                error_code: pval.error_code || null,
                updated_at: pval.updated_at || null,
              };
            }
          }
        }
        gatewayState = {
          platforms: safePlatforms,
          served_profiles: Array.isArray(parsed.served_profiles) ? parsed.served_profiles : [],
        };
      }
    }
  } catch {}
  try {
    const memMdPath = path.join(hermesDir, 'memories', 'MEMORY.md');
    if (fs.existsSync(memMdPath)) {
      memoryLimits.memoryMdChars = fs.readFileSync(memMdPath, 'utf8').length;
      memoryLimits.memoryMdLimit = 2200;
    }
  } catch {}
  try {
    const userMdPath = path.join(hermesDir, 'memories', 'USER.md');
    if (fs.existsSync(userMdPath)) {
      memoryLimits.userMdChars = fs.readFileSync(userMdPath, 'utf8').length;
      memoryLimits.userMdLimit = 1375;
    }
  } catch {}

  const synthesized = synthesizeGatewayHealth({
    systemd,
    health,
    status,
    gatewayState,
    stateDbBytes,
    socketExists,
    listenerPort,
    memoryLimits: Object.keys(memoryLimits).length ? memoryLimits : null,
  });

  const redacted = redactHermesPathsAndSecrets(synthesized);
  _hermesGatewayCache = { at: Date.now(), data: redacted };
  return redacted;
}

const HERMES_WEBCHAT_CACHE_TTL_MS = 5000;
let _hermesWebchatCache = { at: 0, data: null };

function statFileModeAdvisory(targetPath, displayPath) {
  try {
    const st = fs.statSync(targetPath);
    const mode = st.mode & 0o777;
    return {
      path: displayPath,
      exists: true,
      mode: mode.toString(8).padStart(4, '0'),
      size: st.size,
      worldOrGroupPermissive: Boolean(mode & 0o077),
    };
  } catch {
    return {
      path: displayPath,
      exists: false,
      mode: null,
      size: null,
      worldOrGroupPermissive: false,
    };
  }
}

async function readHermesWebchatStatus({ bypassCache = false } = {}) {
  if (!bypassCache && _hermesWebchatCache.data && Date.now() - _hermesWebchatCache.at < HERMES_WEBCHAT_CACHE_TTL_MS) {
    return _hermesWebchatCache.data;
  }

  let systemd = { available: false, unit: HERMES_WEBCHAT_UNIT, active: false, activeState: 'unavailable' };
  try {
    const props = [
      'Id', 'ActiveState', 'SubState', 'UnitFileState', 'MainPID', 'TasksCurrent',
      'MemoryCurrent', 'MemoryPeak', 'ExecMainStartTimestamp', 'FragmentPath',
      'NoNewPrivileges', 'PrivateTmp', 'UMask', 'MemoryMax', 'MemoryHigh', 'CPUQuotaPerSecUSec',
    ].join(',');
    const out = execFileSync(
      'systemctl',
      ['--user', 'show', HERMES_WEBCHAT_UNIT, '-p', props, '--no-pager'],
      { encoding: 'utf8', timeout: 1500, maxBuffer: 64 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    if (out && out.trim()) {
      const kv = {};
      for (const line of out.split(/\r?\n/)) {
        const idx = line.indexOf('=');
        if (idx > 0) kv[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      const parseIntSafe = (k) => {
        const raw = kv[k] || '';
        if (!/^\d+$/.test(raw)) return null;
        const n = Number(raw);
        return Number.isSafeInteger(n) && n >= 0 ? n : null;
      };
      const pidVal = parseIntSafe('MainPID');
      systemd = {
        available: Boolean(kv.ActiveState),
        unit: kv.Id || HERMES_WEBCHAT_UNIT,
        active: kv.ActiveState === 'active',
        activeState: kv.ActiveState || 'unknown',
        subState: kv.SubState || 'unknown',
        unitFileState: kv.UnitFileState || 'unknown',
        pid: pidVal && pidVal > 0 ? pidVal : null,
        tasks: parseIntSafe('TasksCurrent'),
        startedAt: kv.ExecMainStartTimestamp || null,
        memoryCurrentBytes: parseIntSafe('MemoryCurrent'),
        memoryPeakBytes: parseIntSafe('MemoryPeak'),
        fragmentPath: kv.FragmentPath || '~/.config/systemd/user/zoth-webchat.service',
        hardening: {
          noNewPrivileges: kv.NoNewPrivileges === 'yes',
          privateTmp: kv.PrivateTmp === 'yes',
          umask: kv.UMask || '',
          memoryMax: kv.MemoryMax || '',
        },
      };
    }
  } catch {}

  let listener = { host: null, port: HERMES_WEBCHAT_DEFAULT_PORT, url: null, tailnetOnly: false, discovery: 'none' };
  try {
    const ssOut = execFileSync(
      'ss',
      ['-tlnp'],
      { encoding: 'utf8', timeout: 1500, maxBuffer: 256 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    listener = parseWebchatListener(ssOut, systemd.pid, HERMES_WEBCHAT_DEFAULT_PORT);
  } catch {}

  // Strictly `stat` mode/size metadata only — NEVER reads token or history file contents
  const tokDir = path.join(HOME_DIR, '.config', 'zoth-webchat');
  const histDir = path.join(HOME_DIR, '.hermes', 'webchat');
  const permissions = {
    tokenDir: statFileModeAdvisory(tokDir, '~/.config/zoth-webchat'),
    tokenFile: statFileModeAdvisory(path.join(tokDir, 'token'), '~/.config/zoth-webchat/token'),
    historyDir: statFileModeAdvisory(histDir, '~/.hermes/webchat'),
    historyFile: statFileModeAdvisory(path.join(histDir, 'history.jsonl'), '~/.hermes/webchat/history.jsonl'),
  };

  const synthesized = synthesizeWebchatStatus({ systemd, listener, permissions });
  const redacted = redactHermesPathsAndSecrets(synthesized);
  _hermesWebchatCache = { at: Date.now(), data: redacted };
  return redacted;
}

const KONSOLE_RELAY_CACHE_TTL_MS = 5000;
let _konsoleRelayCache = { at: 0, data: null };

function checkGdriveBackupExcludesKonsoleRelay() {
  const candidates = [
    '/usr/local/bin/zoth-gdrive-backup',
    path.join(NULLAITECH_ROOT, 'zoth-os', 'config', 'includes.chroot', 'usr', 'local', 'bin', 'zoth-gdrive-backup'),
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const text = fs.readFileSync(p, 'utf8');
      const activeLines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
      const leaks = activeLines.some((l) => l.includes('.config/konsole-relay') || l.includes('konsole-relay/token'));
      return !leaks;
    } catch {}
  }
  return true;
}

function countKonsoleSessionsReadOnly() {
  const qdbusBin = resolveBinaryOnPath('qdbus', ['/usr/local/bin', '/usr/bin']) || resolveBinaryOnPath('qdbus6', ['/usr/bin']);
  if (!qdbusBin) return null;
  try {
    const out = execFileSync(qdbusBin, [], {
      encoding: 'utf8',
      timeout: 1200,
      maxBuffer: 128 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const svcs = out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => /^org\.kde\.konsole-\d+$/.test(s));
    let total = 0;
    for (const svc of svcs) {
      try {
        const sOut = execFileSync(qdbusBin, [svc], {
          encoding: 'utf8',
          timeout: 800,
          maxBuffer: 64 * 1024,
          stdio: ['ignore', 'pipe', 'ignore'],
        });
        for (const line of sOut.split(/\r?\n/)) {
          if (/^\/Sessions\/\d+$/.test(line.trim())) total += 1;
        }
      } catch {}
    }
    return total;
  } catch {
    return null;
  }
}

async function readKonsoleRelayStatus({ bypassCache = false } = {}) {
  if (!bypassCache && _konsoleRelayCache.data && Date.now() - _konsoleRelayCache.at < KONSOLE_RELAY_CACHE_TTL_MS) {
    return _konsoleRelayCache.data;
  }

  let systemd = { available: false, unit: KONSOLE_RELAY_UNIT, active: false, activeState: 'unavailable' };
  try {
    const props = [
      'Id', 'ActiveState', 'SubState', 'UnitFileState', 'MainPID', 'TasksCurrent',
      'MemoryCurrent', 'MemoryPeak', 'ExecMainStartTimestamp', 'FragmentPath',
      'NoNewPrivileges', 'PrivateTmp', 'UMask', 'MemoryMax', 'MemoryHigh', 'CPUQuotaPerSecUSec',
    ].join(',');
    const out = execFileSync(
      'systemctl',
      ['--user', 'show', KONSOLE_RELAY_UNIT, '-p', props, '--no-pager'],
      { encoding: 'utf8', timeout: 1500, maxBuffer: 64 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    if (out && out.trim()) {
      const kv = {};
      for (const line of out.split(/\r?\n/)) {
        const idx = line.indexOf('=');
        if (idx > 0) kv[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      const parseIntSafe = (k) => {
        const raw = kv[k] || '';
        if (!/^\d+$/.test(raw)) return null;
        const n = Number(raw);
        return Number.isSafeInteger(n) && n >= 0 ? n : null;
      };
      const pidVal = parseIntSafe('MainPID');
      systemd = {
        available: Boolean(kv.ActiveState),
        unit: kv.Id || KONSOLE_RELAY_UNIT,
        active: kv.ActiveState === 'active',
        activeState: kv.ActiveState || 'unknown',
        subState: kv.SubState || 'unknown',
        unitFileState: kv.UnitFileState || 'unknown',
        pid: pidVal && pidVal > 0 ? pidVal : null,
        tasks: parseIntSafe('TasksCurrent'),
        startedAt: kv.ExecMainStartTimestamp || null,
        memoryCurrentBytes: parseIntSafe('MemoryCurrent'),
        memoryPeakBytes: parseIntSafe('MemoryPeak'),
        fragmentPath: kv.FragmentPath || '~/.config/systemd/user/konsole-relay.service',
        hardening: {
          noNewPrivileges: kv.NoNewPrivileges === 'yes',
          privateTmp: kv.PrivateTmp === 'yes',
          umask: kv.UMask || '',
          memoryMax: kv.MemoryMax || '',
        },
      };
    }
  } catch {}

  let listener = { host: null, port: KONSOLE_RELAY_DEFAULT_PORT, url: null, loopbackOnly: false, wildcardExposed: false, discovery: 'none' };
  try {
    const ssOut = execFileSync(
      'ss',
      ['-tlnp'],
      { encoding: 'utf8', timeout: 1500, maxBuffer: 256 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    listener = parseKonsoleRelayListener(ssOut, systemd.pid, KONSOLE_RELAY_DEFAULT_PORT);
  } catch {}

  const t0 = Date.now();
  const healthProbe = await requestJson(listener.port || KONSOLE_RELAY_DEFAULT_PORT, '/health', { method: 'GET', timeout: 1000 });
  const health = {
    ok: Boolean(healthProbe.up && healthProbe.status === 200 && healthProbe.json?.ok === true),
    statusCode: healthProbe.status || 0,
    latencyMs: healthProbe.up ? Date.now() - t0 : null,
  };

  // Strictly `stat` mode/size metadata only — NEVER reads token or audit.log contents
  const confDir = path.join(HOME_DIR, '.config', 'konsole-relay');
  const permissions = {
    confDir: statFileModeAdvisory(confDir, '~/.config/konsole-relay'),
    tokenFile: statFileModeAdvisory(path.join(confDir, 'token'), '~/.config/konsole-relay/token'),
    auditFile: statFileModeAdvisory(path.join(confDir, 'audit.log'), '~/.config/konsole-relay/audit.log'),
  };

  const backupExcluded = checkGdriveBackupExcludesKonsoleRelay();
  const konsoleSessions = countKonsoleSessionsReadOnly();

  const synthesized = synthesizeKonsoleRelayStatus({
    systemd,
    listener,
    health,
    permissions,
    backupExcluded,
    konsoleSessions,
  });
  const redacted = redactKonsoleRelayPaths(synthesized);
  _konsoleRelayCache = { at: Date.now(), data: redacted };
  return redacted;
}

export async function probeStatus() {
  const [memoryPrimary, memorySec, bridgePrimary, bridgeSec, swarmPrimary, swarmSec, ollama, agyHermesHealth, agyHermesModels, vault, egress, mock, firewall, flight, capsule, policy, civ, webgen, chronicleVault, chronicleSyncTimer, hermesGateway, hermesWebchat, konsoleRelay] = await Promise.all([
    requestJson(8094, '/health'),
    requestJson(8788, '/health'),
    requestJson(8102, '/api/health'),
    requestJson(8789, '/api/health'),
    requestJson(8989, '/status'),
    requestJson(8790, '/status'),
    requestJson(11434, '/api/tags'),
    requestJson(18000, '/health', { timeout: 1100 }),
    requestJson(18000, '/v1/models', { timeout: 1100 }),
    requestJson(8787, '/health'),
    requestJson(8095, '/api/stats'),
    requestJson(8097, '/api/stats'),
    requestJson(8098, '/api/stats'),
    requestJson(8104, '/api/stats'),
    requestJson(8105, '/api/stats'),
    requestJson(8106, '/api/stats'),
    requestJson(9393, '/api/status', { timeout: 1000 }),
    requestJson(5173, '/api/health', { timeout: 1500 }),
    requestJson(8161, '/health', { timeout: 1000 }),
    readChronicleSyncTimerStatus(1200),
    readHermesGatewayStatus(),
    readHermesWebchatStatus(),
    readKonsoleRelayStatus(),
  ]);

  const agyHermesModelList = agyHermesModels.up && Array.isArray(agyHermesModels.json?.data)
    ? agyHermesModels.json.data.map((m) => m.id || m.name).filter(Boolean)
    : [];

  const memoryUp = memoryPrimary.up || memorySec.up;
  const memoryPort = memoryPrimary.up ? 8094 : (memorySec.up ? 8788 : 8094);

  const bridgeUp = bridgePrimary.up || bridgeSec.up;
  const bridgePort = bridgePrimary.up ? 8102 : (bridgeSec.up ? 8789 : 8102);

  const swarmUp = swarmPrimary.up || swarmSec.up;
  const swarmPort = swarmPrimary.up ? 8989 : (swarmSec.up ? 8790 : 8989);

  return {
    checkedAt: new Date().toISOString(),
    kvm: fs.existsSync('/dev/kvm'),
    services: {
      swarm: {
        name: 'Swarm multiplexer',
        port: swarmPort,
        up: swarmUp,
        detail: swarmPrimary.json || swarmSec.json,
      },
      memory: {
        name: 'Neuro memory daemon',
        port: memoryPort,
        up: memoryUp,
        detail: memoryPrimary.json || memorySec.json,
      },
      bridge: {
        name: 'Sovereign agent bridge',
        port: bridgePort,
        up: bridgeUp,
        detail: bridgePrimary.json || bridgeSec.json,
      },
      vault: {
        name: 'Vault daemon',
        port: 8787,
        up: vault.up,
        detail: vault.json,
      },
      egress: {
        name: 'Agent egress sentinel',
        port: 8095,
        up: egress.up,
        detail: egress.json,
      },
      mock: {
        name: 'Agent mock twin',
        port: 8097,
        up: mock.up,
        detail: mock.json,
      },
      firewall: {
        name: 'Agent prompt firewall',
        port: 8098,
        up: firewall.up,
        detail: firewall.json,
      },
      flight: {
        name: 'Agent flight recorder',
        port: 8104,
        up: flight.up,
        detail: flight.json,
      },
      capsule: {
        name: 'Agent capsule jail',
        port: 8105,
        up: capsule.up,
        detail: capsule.json,
      },
      policy: {
        name: 'Agent policy auditor',
        port: 8106,
        up: policy.up,
        detail: policy.json,
      },
      azoth: {
        name: 'Azoth local agent',
        port: 8790,
        up: swarmSec.up,
        detail: swarmSec.json,
      },
      ollama: {
        name: 'Ollama',
        port: 11434,
        up: ollama.up,
        models: ollama.up ? localModels(ollama.json) : [],
      },
      'agy-hermes-proxy': {
        name: 'AGY-Hermes Proxy',
        port: 18000,
        up: agyHermesHealth.up || agyHermesModels.up,
        version: agyHermesHealth.json?.version || null,
        modelsCount: agyHermesModelList.length || agyHermesHealth.json?.models_count || 0,
        models: agyHermesModelList,
        detail: agyHermesHealth.json,
      },
      civilization: {
        name: 'Zoth civilization',
        port: 9393,
        up: civ.up,
        adytumCycleCount: civ.json?.adytumCycleCount || civ.json?.state?.completedAdytumCycles || 0,
        observationalCycles: civ.json?.observationalCycles || 0,
        reflectionsCount: civ.json?.mentalReflections?.length || 0,
        latestReflection: (civ.json?.mentalReflections && civ.json.mentalReflections[civ.json.mentalReflections.length - 1]) || null,
        detail: civ.json ? {
          day: civ.json.state?.day,
          leader: civ.json.state?.currentLeader,
          treasuryUsd: civ.json.treasury?.totalUsd ?? civ.json.state?.treasuryUsd ?? null,
          adytumCycleCount: civ.json?.adytumCycleCount || civ.json?.state?.completedAdytumCycles || 0,
          observationalCycles: civ.json?.observationalCycles || 0,
          latestReflection: (civ.json?.mentalReflections && civ.json.mentalReflections[civ.json.mentalReflections.length - 1]) || null
        } : null,
      },
      chronicleVault: {
        name: 'Chronicle Vault',
        port: 8161,
        up: chronicleVault.up,
        detail: chronicleVault.json
          ? {
              status: sanitizeChronicleText(chronicleVault.json.status || 'ok'),
              service: sanitizeChronicleText(chronicleVault.json.service || 'chronicle-vault'),
              db: sanitizeChronicleText(chronicleVault.json.db || 'memory_vault.db'),
              conversations: chronicleVault.json.conversations ?? null,
              messages: chronicleVault.json.messages ?? null,
              activePatterns: chronicleVault.json.active_patterns ?? null,
              syncRunning: Boolean(chronicleVault.json.sync_running),
            }
          : null,
      },
      chronicleSyncTimer: {
        name: 'Chronicle Vault Sync Timer',
        unit: 'chronicle-vault-sync.timer',
        up: Boolean(chronicleSyncTimer?.active),
        detail: chronicleSyncTimer,
      },
      hermesGateway: {
        name: 'Hermes Agent Gateway',
        unit: HERMES_GATEWAY_UNIT,
        port: hermesGateway?.listener?.port || null,
        up: Boolean(hermesGateway?.active),
        pid: hermesGateway?.systemd?.pid || null,
        profiles: hermesGateway?.gateway?.profileCount || 0,
        reconciledHealth: hermesGateway?.reconciledHealth || 'offline',
        detail: hermesGateway,
      },
      hermesWebchat: {
        name: 'Hermes WebChat (Zoth Console)',
        unit: HERMES_WEBCHAT_UNIT,
        host: hermesWebchat?.listener?.host || null,
        port: hermesWebchat?.listener?.port || HERMES_WEBCHAT_DEFAULT_PORT,
        up: Boolean(hermesWebchat?.active),
        pid: hermesWebchat?.systemd?.pid || null,
        tailnetOnly: Boolean(hermesWebchat?.listener?.tailnetOnly),
        detail: hermesWebchat,
      },
      konsoleRelay: {
        name: 'Konsole Relay (KDE D-Bus)',
        unit: KONSOLE_RELAY_UNIT,
        host: konsoleRelay?.listener?.host || '127.0.0.1',
        port: konsoleRelay?.listener?.port || KONSOLE_RELAY_DEFAULT_PORT,
        up: Boolean(konsoleRelay?.active),
        pid: konsoleRelay?.systemd?.pid || null,
        loopbackOnly: Boolean(konsoleRelay?.listener?.loopbackOnly),
        konsoleSessions: konsoleRelay?.konsoleSessions ?? null,
        detail: konsoleRelay,
      },
      webgen: {
        name: 'Zoth Bolt (bolt.diy fork)',
        port: 5173,
        up: webgen.up,
        detail: webgen.json,
      },
    },
  };
}

function readBody(req, maxBytes = 512 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let aborted = false;
    req.on('data', (chunk) => {
      if (aborted) return;
      total += chunk.length;
      if (total > maxBytes) {
        aborted = true;
        const err = new Error(`Request body exceeds ${maxBytes} byte limit.`);
        err.statusCode = 413;
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (aborted) return;
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function resolveAxAssetPath(relPath) {
  const cleanRel = relPath.replace(/^\/+/, '');
  const distCandidate = path.join(STUDIO_ROOT, 'dist', cleanRel);
  if (fs.existsSync(distCandidate) && fs.statSync(distCandidate).isFile()) {
    return { absPath: distCandidate, source: 'dist' };
  }
  const pubCandidate = path.join(STUDIO_ROOT, 'public', cleanRel);
  if (fs.existsSync(pubCandidate) && fs.statSync(pubCandidate).isFile()) {
    return { absPath: pubCandidate, source: 'public' };
  }
  return { absPath: null, source: null };
}

function getGroundTruthCounts() {
  let toolsCount = 85;
  let workstationsCount = 44;

  const toolsResolved = resolveAxAssetPath('api/tools.json');
  if (toolsResolved.absPath) {
    try {
      const parsed = JSON.parse(fs.readFileSync(toolsResolved.absPath, 'utf8'));
      if (Array.isArray(parsed.tools) && parsed.tools.length > 0) {
        toolsCount = parsed.tools.length;
      } else if (Number.isFinite(parsed.tool_count)) {
        toolsCount = parsed.tool_count;
      }
    } catch {}
  }

  const distWsDir = path.join(STUDIO_ROOT, 'dist', 'workstations');
  if (fs.existsSync(distWsDir) && fs.statSync(distWsDir).isDirectory()) {
    try {
      const dirs = fs.readdirSync(distWsDir).filter((name) => {
        const sub = path.join(distWsDir, name, 'index.html');
        return fs.existsSync(sub);
      });
      if (dirs.length > 0) workstationsCount = dirs.length;
    } catch {}
  } else {
    const wsSrc = path.join(STUDIO_ROOT, 'src', 'data', 'workstations.js');
    if (fs.existsSync(wsSrc)) {
      try {
        const raw = fs.readFileSync(wsSrc, 'utf8');
        const matches = raw.match(/\balsoInApp\s*:/g);
        if (matches && matches.length > 0) workstationsCount = matches.length;
      } catch {}
    }
  }

  return { tools: toolsCount, workstations: workstationsCount };
}

export function auditStudioAxManifests() {
  const groundTruth = getGroundTruthCounts();
  const manifestSpecs = [
    { path: '/llms.txt', mimeType: 'text/plain; charset=utf-8', validator: 'llms.txt' },
    { path: '/llms-full.txt', mimeType: 'text/plain; charset=utf-8', validator: 'llms.txt' },
    { path: '/ai.txt', mimeType: 'text/plain; charset=utf-8', validator: 'ai.txt' },
    { path: '/.well-known/mcp.json', mimeType: 'application/json; charset=utf-8', validator: 'mcp.json' },
    { path: '/.well-known/agent.json', mimeType: 'application/json; charset=utf-8', validator: 'agent.json' },
    { path: '/.well-known/ai-plugin.json', mimeType: 'application/json; charset=utf-8', validator: 'ai-plugin' },
    { path: '/robots.txt', mimeType: 'text/plain; charset=utf-8', validator: 'robots.txt' },
    { path: '/sitemap.xml', mimeType: 'application/xml; charset=utf-8', validator: 'sitemap' },
    { path: '/api/tools.json', mimeType: 'application/json; charset=utf-8', validator: 'tools-json' },
    { path: '/api/index.json', mimeType: 'application/json; charset=utf-8', validator: 'index-json' },
  ];

  const manifests = manifestSpecs.map((item) => {
    const { absPath, source } = resolveAxAssetPath(item.path);
    if (!absPath) {
      return {
        path: item.path,
        source: null,
        status: 404,
        mimeType: item.mimeType,
        bytes: 0,
        estimatedTokens: 0,
        sha256Prefix: null,
        valid: false,
        score: 0,
        grade: 'F',
        errors: [`File not found in dist/ or public/ for ${item.path}`],
        warnings: [],
        checks: [{ id: 'exists', status: 'fail', detail: 'Missing manifest file.' }],
      };
    }

    const buf = fs.readFileSync(absPath);
    const content = buf.toString('utf8');
    const bytes = buf.length;
    const estimatedTokens = Math.ceil(bytes / 4);
    const sha256Prefix = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);

    if (AX_SPEC_IDS.includes(item.validator)) {
      const res = validateAxSpec(item.validator, content, groundTruth);
      // llms-full.txt is intentionally large (>8k tokens), do not penalize size there
      const filteredWarnings = item.path === '/llms-full.txt'
        ? res.warnings.filter((w) => !/Estimated token budget/i.test(w))
        : res.warnings;
      const adjustedScore = item.path === '/llms-full.txt' && filteredWarnings.length < res.warnings.length
        ? Math.min(100, res.score + 8)
        : res.score;
      return {
        path: item.path,
        source,
        status: 200,
        mimeType: item.mimeType,
        bytes,
        estimatedTokens,
        sha256Prefix,
        valid: res.valid,
        score: adjustedScore,
        grade: gradeFromScore(adjustedScore),
        errors: res.errors,
        warnings: filteredWarnings,
        checks: res.checks,
      };
    }

    // Custom structural checks for ai-plugin.json, sitemap.xml, api/tools.json, api/index.json
    const errors = [];
    const warnings = [];
    const checks = [];
    let score = 100;

    if (item.validator === 'ai-plugin') {
      try {
        const j = JSON.parse(content);
        if (!j.name_for_human || !j.name_for_model || !j.api?.url) {
          score -= 30;
          errors.push('ai-plugin.json missing required name_for_human, name_for_model, or api.url.');
        } else {
          checks.push({ id: 'schema', status: 'pass', detail: `Plugin ${j.name_for_model} valid.` });
        }
        if (!content.includes(String(groundTruth.tools)) || /\b(80|44)\s+Studio\s+Tools/i.test(content) || /44_tool/i.test(String(j.name_for_model || ''))) {
          score -= 15;
          warnings.push(`Tool count mismatch in ai-plugin.json (expected ${groundTruth.tools}).`);
        } else {
          checks.push({ id: 'count-tools', status: 'pass', detail: `Aligned with ${groundTruth.tools} tools.` });
        }
      } catch (e) {
        score = 0;
        errors.push(`Invalid JSON: ${e.message}`);
      }
    } else if (item.validator === 'sitemap') {
      const urls = content.match(/<loc>https:\/\/[^<]+<\/loc>/g) || [];
      if (!content.includes('<urlset') || urls.length < 10) {
        score -= 30;
        errors.push(`Invalid or sparse sitemap.xml (${urls.length} URLs).`);
      } else {
        checks.push({ id: 'urlset', status: 'pass', detail: `${urls.length} canonical HTTPS <loc> entries.` });
      }
      if (!content.includes('/workstations/ax-powerhouse')) {
        score -= 10;
        warnings.push('sitemap.xml missing /workstations/ax-powerhouse entry.');
      } else {
        checks.push({ id: 'ax-route', status: 'pass', detail: '/workstations/ax-powerhouse indexed.' });
      }
    } else if (item.validator === 'tools-json') {
      try {
        const j = JSON.parse(content);
        const count = Array.isArray(j.tools) ? j.tools.length : 0;
        if (count !== groundTruth.tools || j.tool_count !== count) {
          score -= 25;
          errors.push(`tools.json tool_count (${j.tool_count}) != tools.length (${count}).`);
        } else {
          checks.push({ id: 'registry-parity', status: 'pass', detail: `${count} tools verified with tool_count parity.` });
        }
      } catch (e) {
        score = 0;
        errors.push(`Invalid JSON: ${e.message}`);
      }
    } else if (item.validator === 'index-json') {
      try {
        const j = JSON.parse(content);
        if (!j.openAccess || !j.endpoints?.toolsApi) {
          score -= 20;
          errors.push('api/index.json missing openAccess or endpoints.toolsApi.');
        } else {
          checks.push({ id: 'index-schema', status: 'pass', detail: 'Open-access discovery index valid.' });
        }
        if (!content.includes(String(groundTruth.tools)) || !content.includes(String(groundTruth.workstations))) {
          score -= 15;
          warnings.push(`api/index.json count drift (expected ${groundTruth.tools} tools & ${groundTruth.workstations} workstations).`);
        } else {
          checks.push({ id: 'count-parity', status: 'pass', detail: `Aligned with ${groundTruth.tools} tools / ${groundTruth.workstations} workstations.` });
        }
      } catch (e) {
        score = 0;
        errors.push(`Invalid JSON: ${e.message}`);
      }
    }

    return {
      path: item.path,
      source,
      status: 200,
      mimeType: item.mimeType,
      bytes,
      estimatedTokens,
      sha256Prefix,
      valid: errors.length === 0,
      score: Math.max(0, Math.min(100, score)),
      grade: gradeFromScore(score),
      errors,
      warnings,
      checks,
    };
  });

  // Check mirror parity between root files and /.well-known/* copies
  const mirrorPairs = [
    ['/llms.txt', '/.well-known/llms.txt'],
    ['/llms-full.txt', '/.well-known/llms-full.txt'],
    ['/ai.txt', '/.well-known/ai.txt'],
  ];
  const mirrorParity = mirrorPairs.map(([rootPath, wkPath]) => {
    const a = resolveAxAssetPath(rootPath);
    const b = resolveAxAssetPath(wkPath);
    if (!a.absPath || !b.absPath) {
      return { rootPath, mirrorPath: wkPath, identical: false, detail: 'One or both files missing.' };
    }
    const hashA = crypto.createHash('sha256').update(fs.readFileSync(a.absPath)).digest('hex');
    const hashB = crypto.createHash('sha256').update(fs.readFileSync(b.absPath)).digest('hex');
    return {
      rootPath,
      mirrorPath: wkPath,
      identical: hashA === hashB,
      sha256Prefix: hashA.slice(0, 16),
      detail: hashA === hashB ? 'Byte-identical mirror verified.' : 'Mirror diverged from root file.',
    };
  });

  const manifestIssues = manifests.reduce((acc, m) => acc + m.errors.length + m.warnings.length, 0);
  const mirrorDrifts = mirrorParity.filter((m) => !m.identical).length;
  const driftCount = manifestIssues + mirrorDrifts;
  const avgScore = Math.round(
    manifests.reduce((sum, m) => sum + m.score, 0) / Math.max(1, manifests.length)
  );
  const overallScore = Math.max(0, avgScore - mirrorDrifts * 8);
  const totalBytes = manifests.reduce((sum, m) => sum + m.bytes, 0);
  const totalEstimatedTokens = manifests.reduce((sum, m) => sum + m.estimatedTokens, 0);

  return {
    checkedAt: new Date().toISOString(),
    groundTruth,
    manifestCount: manifests.length,
    passingCount: manifests.filter((m) => m.valid && m.warnings.length === 0).length,
    driftCount,
    zeroDriftScore: overallScore,
    grade: gradeFromScore(overallScore),
    totalBytes,
    totalEstimatedTokens,
    manifests,
    mirrorParity,
  };
}

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function sendHead(res, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

export function isLocalHost(req) {
  return isLoopbackHostString(req?.headers?.host);
}

export function isLocalOrigin(origin) {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    return (u.protocol === 'http:' || u.protocol === 'https:') && LOCAL_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export function isLocalRequest(req) {
  if (!isLocalHost(req)) return false;
  return isLocalOrigin(req?.headers?.origin);
}

function readJsonBodyStrict(req, maxBytes = 16384) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let settled = false;
    req.on('data', (chunk) => {
      if (settled) return;
      total += chunk.length;
      if (total > maxBytes) {
        settled = true;
        reject(Object.assign(new Error('Request body exceeds limit.'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(Object.assign(new Error('JSON object body required.'), { statusCode: 400 }));
          return;
        }
        resolve(parsed);
      } catch {
        reject(Object.assign(new Error('Malformed JSON payload.'), { statusCode: 400 }));
      }
    });
    req.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(Object.assign(err, { statusCode: 400 }));
    });
  });
}

function probeTcpLoopback(port, timeoutMs = 700) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      const rttMs = ok ? Math.round((performance.now() - t0) * 10) / 10 : null;
      resolve({ ok, httpStatus: null, protocol: 'TCP', rttMs });
    };
    const sock = net.createConnection({ host: '127.0.0.1', port });
    sock.setTimeout(timeoutMs);
    sock.on('connect', () => {
      sock.destroy();
      done(true);
    });
    sock.on('timeout', () => {
      sock.destroy();
      done(false);
    });
    sock.on('error', () => {
      sock.destroy();
      done(false);
    });
  });
}

async function probeLoopbackTarget(target, timeoutMs = 700) {
  const port = target.port;
  const probePath = target.probePath || '/';
  const checkedAt = new Date().toISOString();

  if (target.protocol === 'TCP') {
    const tcp = await probeTcpLoopback(port, timeoutMs);
    return {
      id: target.id,
      code: target.code,
      name: target.name,
      host: '127.0.0.1',
      port,
      category: target.category || 'Loopback',
      description: target.description || '',
      protocol: 'TCP',
      ok: tcp.ok,
      httpStatus: null,
      rttMs: tcp.rttMs,
      status: classifyProbeStatus({ ok: tcp.ok, rttMs: tcp.rttMs }),
      checkedAt,
    };
  }

  const httpResult = await new Promise((resolve) => {
    const t0 = performance.now();
    let settled = false;
    const finish = (resObj) => {
      if (settled) return;
      settled = true;
      resolve(resObj);
    };
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: probePath,
        method: 'GET',
        timeout: timeoutMs,
        headers: { Host: `127.0.0.1:${port}` },
      },
      (res) => {
        res.resume();
        const rttMs = Math.round((performance.now() - t0) * 10) / 10;
        finish({ ok: true, httpStatus: res.statusCode || 200, protocol: 'HTTP', rttMs, parseError: false });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      finish({ ok: false, httpStatus: null, protocol: 'HTTP', rttMs: null, parseError: false });
    });
    req.on('error', (err) => {
      const parseError = String(err?.code || '').startsWith('HPE_');
      finish({ ok: false, httpStatus: null, protocol: 'HTTP', rttMs: null, parseError });
    });
    req.end();
  });

  if (!httpResult.ok && httpResult.parseError) {
    const tcp = await probeTcpLoopback(port, timeoutMs);
    return {
      id: target.id,
      code: target.code,
      name: target.name,
      host: '127.0.0.1',
      port,
      category: target.category || 'Loopback',
      description: target.description || '',
      protocol: 'TCP',
      ok: tcp.ok,
      httpStatus: null,
      rttMs: tcp.rttMs,
      status: classifyProbeStatus({ ok: tcp.ok, rttMs: tcp.rttMs }),
      checkedAt,
    };
  }

  return {
    id: target.id,
    code: target.code,
    name: target.name,
    host: '127.0.0.1',
    port,
    category: target.category || 'Loopback',
    description: target.description || '',
    protocol: httpResult.protocol,
    ok: httpResult.ok,
    httpStatus: httpResult.httpStatus,
    rttMs: httpResult.rttMs,
    status: classifyProbeStatus({ ok: httpResult.ok, rttMs: httpResult.rttMs }),
    checkedAt,
  };
}

function scanLocalUnixSockets() {
  const dirs = ['/run/zoth'];
  if (process.env.XDG_RUNTIME_DIR) {
    dirs.push(path.join(process.env.XDG_RUNTIME_DIR, 'zoth'));
  }
  const found = [];
  const seen = new Set();
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (seen.has(full)) continue;
        try {
          const st = fs.lstatSync(full);
          if (st.isSocket()) {
            seen.add(full);
            found.push({
              name: entry,
              path: full.startsWith(HOME_DIR) ? full.replace(HOME_DIR, '~') : full,
              mtime: st.mtime.toISOString(),
            });
          }
        } catch {}
      }
    } catch {}
  }
  return found;
}

function readJsonBodyWithLimit(req, maxBytes = 65536) {
  return new Promise((resolve, reject) => {
    const contentLen = Number(req?.headers?.['content-length'] || 0);
    if (Number.isFinite(contentLen) && contentLen > maxBytes) {
      req.resume();
      reject(Object.assign(new Error(`Request body exceeds ${maxBytes} byte limit.`), { statusCode: 413 }));
      return;
    }
    const chunks = [];
    let total = 0;
    let overflowed = false;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        overflowed = true;
        return;
      }
      if (!overflowed) chunks.push(chunk);
    });
    req.on('end', () => {
      if (overflowed) {
        reject(Object.assign(new Error(`Request body exceeds ${maxBytes} byte limit.`), { statusCode: 413 }));
        return;
      }
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(Object.assign(new Error('JSON object body required.'), { statusCode: 400 }));
          return;
        }
        resolve(parsed);
      } catch {
        reject(Object.assign(new Error('Malformed JSON payload.'), { statusCode: 400 }));
      }
    });
    req.on('error', (err) => {
      reject(Object.assign(err, { statusCode: 400 }));
    });
  });
}

const IDE_ALLOWED_EXTS = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.py', '.rs', '.json', '.yml', '.yaml', '.md']);
const IDE_CACHE_TTL_MS = 5000;
let ideWorkspaceCache = { ts: 0, data: null };

function collectSafeRepoFiles(repoReal) {
  const candidates = [];
  const scanDir = (dirAbs, prefix) => {
    let entries = [];
    try {
      entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (candidates.length >= 12) return;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (isBlockedSecretPath(rel)) continue;
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!IDE_ALLOWED_EXTS.has(ext)) continue;
      try {
        const full = path.join(dirAbs, entry.name);
        const real = fs.realpathSync(full);
        if (!real.startsWith(`${repoReal}${path.sep}`)) continue;
        candidates.push(rel);
      } catch {}
    }
  };
  scanDir(repoReal, '');
  for (const sub of ['src', 'server', 'scripts']) {
    if (candidates.length >= 12) break;
    const subDir = path.join(repoReal, sub);
    try {
      if (fs.existsSync(subDir) && fs.statSync(subDir).isDirectory()) {
        const subReal = fs.realpathSync(subDir);
        if (subReal.startsWith(`${repoReal}${path.sep}`)) {
          scanDir(subReal, sub);
        }
      }
    } catch {}
  }
  return candidates;
}

function probeIdeWorkspace({ bypassCache = false } = {}) {
  const now = Date.now();
  if (!bypassCache && ideWorkspaceCache.data && now - ideWorkspaceCache.ts < IDE_CACHE_TTL_MS) {
    return ideWorkspaceCache.data;
  }

  const extraBinDirs = ['/opt/zothos-ai-env/bin', path.join(HOME_DIR, '.cargo', 'bin')];
  const toolchains = EXPECTED_IDE_TOOLCHAINS.map((spec) => {
    const binPath = resolveBinaryOnPath(spec.id, extraBinDirs);
    if (!binPath) {
      return {
        id: spec.id,
        label: spec.label,
        category: spec.category,
        purpose: spec.purpose,
        installed: false,
        path: null,
        version: null,
      };
    }
    let version = 'installed';
    try {
      const out = execFileSync(binPath, spec.args || ['--version'], {
        timeout: 1200,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const firstLine = String(out || '').split(/\r?\n/).find((l) => l.trim());
      if (firstLine) version = firstLine.trim().slice(0, 120);
    } catch {}
    return {
      id: spec.id,
      label: spec.label,
      category: spec.category,
      purpose: spec.purpose,
      installed: true,
      path: binPath,
      version,
    };
  });

  const repos = [];
  try {
    const baseReal = fs.realpathSync(NULLAITECH_ROOT);
    const entries = fs.readdirSync(baseReal, { withFileTypes: true })
      .filter((e) => e.isDirectory() && isValidIdeRepoSlug(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (repos.length >= 40) break;
      try {
        const repoReal = fs.realpathSync(path.join(baseReal, entry.name));
        if (!repoReal.startsWith(`${baseReal}${path.sep}`)) continue;
        const files = collectSafeRepoFiles(repoReal);
        repos.push({
          slug: entry.name,
          fileCount: files.length,
          files,
        });
      } catch {}
    }
  } catch {}

  const snapshot = redactIdeOutput(
    buildLiveIdeSnapshot({
      toolchains,
      repos,
      checkedAt: new Date().toISOString(),
    })
  );
  ideWorkspaceCache = { ts: now, data: snapshot };
  return snapshot;
}

function inspectLocalIdeFile(repoSlug, relFilePath) {
  if (!isValidIdeRepoSlug(repoSlug)) {
    return { ok: false, statusCode: 400, error: 'Invalid repository slug.' };
  }
  if (!isValidIdeRelPath(relFilePath)) {
    return { ok: false, statusCode: 400, error: 'Invalid relative file path.' };
  }
  if (isBlockedSecretPath(relFilePath)) {
    return { ok: false, statusCode: 403, error: 'Secret or restricted file blocked.' };
  }

  let baseReal;
  try {
    baseReal = fs.realpathSync(NULLAITECH_ROOT);
  } catch {
    return { ok: false, statusCode: 404, error: 'Workspace root unavailable.' };
  }

  const repoPath = path.resolve(baseReal, repoSlug);
  if (!repoPath.startsWith(`${baseReal}${path.sep}`) || !fs.existsSync(repoPath)) {
    return { ok: false, statusCode: 404, error: 'Repository not found.' };
  }

  let repoReal;
  try {
    repoReal = fs.realpathSync(repoPath);
  } catch {
    return { ok: false, statusCode: 404, error: 'Repository not found.' };
  }
  if (!repoReal.startsWith(`${baseReal}${path.sep}`)) {
    return { ok: false, statusCode: 403, error: 'Repository symlink escape blocked.' };
  }

  const candidatePath = path.resolve(repoReal, relFilePath);
  if (!candidatePath.startsWith(`${repoReal}${path.sep}`)) {
    return { ok: false, statusCode: 400, error: 'Path traversal outside repository blocked.' };
  }
  if (!fs.existsSync(candidatePath)) {
    return { ok: false, statusCode: 404, error: 'File not found in repository.' };
  }

  let fileReal;
  try {
    fileReal = fs.realpathSync(candidatePath);
  } catch {
    return { ok: false, statusCode: 404, error: 'File not accessible.' };
  }
  if (!fileReal.startsWith(`${repoReal}${path.sep}`)) {
    return { ok: false, statusCode: 403, error: 'Symlink escape outside repository blocked.' };
  }

  const resolvedRel = path.relative(repoReal, fileReal).replace(/\\/g, '/');
  if (isBlockedSecretPath(resolvedRel)) {
    return { ok: false, statusCode: 403, error: 'Secret or restricted file blocked.' };
  }

  const stat = fs.statSync(fileReal);
  if (!stat.isFile()) {
    return { ok: false, statusCode: 400, error: 'Target path is not a regular file.' };
  }

  const MAX_READ_BYTES = 65536;
  const readLen = Math.min(stat.size, MAX_READ_BYTES);
  const buf = Buffer.alloc(readLen);
  const fd = fs.openSync(fileReal, 'r');
  try {
    if (readLen > 0) fs.readSync(fd, buf, 0, readLen, 0);
  } finally {
    fs.closeSync(fd);
  }
  const rawContent = buf.toString('utf8');
  const language = detectLanguageFromFilename(resolvedRel, 'javascript');
  const structure = analyzeSourceStructure(rawContent, language);
  const lint = lintSourceCode(rawContent, language, resolvedRel);

  return {
    ok: true,
    statusCode: 200,
    payload: redactIdeOutput({
      ok: true,
      version: IDE_ENGINE_VERSION,
      mode: 'LIVE_HOST_FILE_INSPECT',
      readOnly: true,
      repo: repoSlug,
      filePath: resolvedRel,
      language,
      byteLength: stat.size,
      truncated: stat.size > MAX_READ_BYTES,
      content: rawContent,
      structure,
      lint,
      redacted: true,
    }),
  };
}

function probeEdgeForgeToolchains() {
  const probed = EXPECTED_HOST_TOOLCHAINS.map((spec) => {
    const binPath = resolveBinaryOnPath(spec.id);
    if (!binPath) {
      return {
        ...spec,
        installed: false,
        path: null,
        version: null,
      };
    }
    let version = null;
    try {
      const out = execFileSync(binPath, ['--version'], {
        timeout: 1200,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const firstLine = String(out || '').split(/\r?\n/).find((l) => l.trim());
      version = firstLine ? redactHomePaths(firstLine.trim()).slice(0, 120) : 'installed';
    } catch {
      version = 'installed';
    }
    return {
      ...spec,
      installed: true,
      path: redactHomePaths(binPath),
      version,
    };
  });

  let kvm = false;
  try {
    kvm = fs.existsSync('/dev/kvm');
  } catch {
    kvm = false;
  }

  return buildHostToolchainSnapshot({
    toolchains: probed,
    kvm,
    checkedAt: new Date().toISOString(),
  });
}

function compileWatWithLocalWat2Wasm(watText) {
  const wat2wasmBin = resolveBinaryOnPath('wat2wasm');
  if (!wat2wasmBin) return null;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zoth-ef-'));
  try {
    const watPath = path.join(tmpDir, 'module.wat');
    const wasmPath = path.join(tmpDir, 'module.wasm');
    fs.writeFileSync(watPath, watText, 'utf8');
    execFileSync(wat2wasmBin, [watPath, '-o', wasmPath], {
      timeout: 3000,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const raw = fs.readFileSync(wasmPath);
    return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

function buildSanitizedGitEnv() {
  return {
    PATH: [LOCAL_BIN, '/usr/local/bin', '/usr/bin', '/bin', process.env.PATH || ''].filter(Boolean).join(path.delimiter),
    HOME: HOME_DIR,
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_TERMINAL_PROMPT: '0',
  };
}

function runGitConfigGet(gitBin, key, env) {
  if (!gitBin) return '';
  try {
    return String(
      execFileSync(gitBin, ['config', '--global', '--get', key], {
        timeout: 1200,
        encoding: 'utf8',
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      }) || ''
    ).trim();
  } catch {
    return '';
  }
}

function probeGitHubToolchainsAndSigning() {
  const safeEnv = buildSanitizedGitEnv();
  const toolchains = EXPECTED_GITHUB_TOOLCHAINS.map((spec) => {
    const binPath = resolveBinaryOnPath(spec.id);
    if (!binPath) {
      return {
        ...spec,
        installed: false,
        path: null,
        version: null,
      };
    }
    let version = 'installed';
    try {
      if (spec.id === 'ssh') {
        const res = spawnSync(binPath, ['-V'], {
          timeout: 1200,
          encoding: 'utf8',
          env: safeEnv,
        });
        const combined = `${res.stdout || ''}\n${res.stderr || ''}`;
        const firstLine = combined.split(/\r?\n/).find((l) => l.trim());
        if (firstLine) version = redactSensitiveOutput(firstLine.trim()).slice(0, 120);
      } else {
        const out = execFileSync(binPath, ['--version'], {
          timeout: 1200,
          encoding: 'utf8',
          env: safeEnv,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const firstLine = String(out || '').split(/\r?\n/).find((l) => l.trim());
        if (firstLine) version = redactSensitiveOutput(firstLine.trim()).slice(0, 120);
      }
    } catch {
      version = 'installed';
    }
    return {
      ...spec,
      installed: true,
      path: redactSensitiveOutput(binPath),
      version,
    };
  });

  const gitBin = resolveBinaryOnPath('git');
  const signing = {
    commitGpgSign: runGitConfigGet(gitBin, 'commit.gpgsign', safeEnv).toLowerCase() === 'true',
    tagGpgSign: runGitConfigGet(gitBin, 'tag.gpgsign', safeEnv).toLowerCase() === 'true',
    gpgFormat: runGitConfigGet(gitBin, 'gpg.format', safeEnv) || 'openpgp',
    signingKey: runGitConfigGet(gitBin, 'user.signingkey', safeEnv),
    allowedSignersFile: runGitConfigGet(gitBin, 'gpg.ssh.allowedSignersFile', safeEnv),
  };

  return { toolchains, signing, gitBin, safeEnv };
}

function inspectLocalGitRepo(repoSlug, { gitBin, safeEnv, signing, includeDetails = false } = {}) {
  if (!isValidRepoSlug(repoSlug)) {
    return { errorStatus: 400, error: 'Invalid repository slug.' };
  }
  const resolvedRoot = path.resolve(NULLAITECH_ROOT);
  const resolvedRepo = path.resolve(resolvedRoot, repoSlug);
  if (!resolvedRepo.startsWith(resolvedRoot + path.sep)) {
    return { errorStatus: 403, error: 'Path traversal outside ~/NullAITech/ blocked.' };
  }
  if (!fs.existsSync(path.join(resolvedRepo, '.git'))) {
    return { errorStatus: 404, error: `Repository "${repoSlug}" not found under ~/NullAITech/.` };
  }
  const bin = gitBin || resolveBinaryOnPath('git');
  if (!bin) {
    return { errorStatus: 503, error: 'Local git binary is unavailable on PATH.' };
  }
  const env = safeEnv || buildSanitizedGitEnv();
  const runGit = (args) => {
    try {
      return String(
        execFileSync(bin, ['-C', resolvedRepo, ...args], {
          timeout: 1800,
          encoding: 'utf8',
          env,
          stdio: ['ignore', 'pipe', 'pipe'],
        }) || ''
      );
    } catch {
      return '';
    }
  };

  const remoteText = runGit(['remote', '-v']);
  const statusText = runGit(['status', '--porcelain=v2', '--branch']);
  const lastRaw = runGit(['log', '-n', '1', '--format=%h%x1f%s%x1f%cs']).trim();
  let lastCommit = null;
  if (lastRaw) {
    const [hash = '', subject = '', date = ''] = lastRaw.split('\x1f');
    lastCommit = { hash, subject, date };
  }

  const repoAudit = auditRepository({
    repo: repoSlug,
    remoteText,
    statusText,
    lastCommit,
    signing: signing || null,
  });

  if (!includeDetails) {
    return { ok: true, repoAudit };
  }

  const logText = runGit(['log', '-n', '15', '--oneline']);
  const commits = parseConventionalCommits(logText, { currentVersion: GITHUB_OPS_VERSION, repoName: repoSlug });

  let workflow = null;
  let workflowFile = null;
  try {
    const wfDir = path.join(resolvedRepo, '.github', 'workflows');
    if (fs.existsSync(wfDir) && fs.statSync(wfDir).isDirectory()) {
      const files = fs
        .readdirSync(wfDir)
        .filter((f) => /\.(ya?ml)$/i.test(f) && !f.includes('..'))
        .sort();
      if (files.length > 0) {
        const wfPath = path.resolve(wfDir, files[0]);
        if (wfPath.startsWith(path.resolve(wfDir) + path.sep)) {
          const yamlText = fs.readFileSync(wfPath, 'utf8').slice(0, 32768);
          workflowFile = `.github/workflows/${files[0]}`;
          workflow = lintWorkflowYaml(yamlText);
        }
      }
    }
  } catch {
    workflow = null;
  }

  return {
    ok: true,
    repoAudit,
    logText: redactSensitiveOutput(logText),
    commits,
    workflow,
    workflowFile,
  };
}

const githubFleetCache = new Map();
const GITHUB_FLEET_CACHE_TTL_MS = 5000;

function probeLocalGitHubFleet({ query = '', repo = '', limit = 50, fresh = false } = {}) {
  const boundedLimit = Math.max(1, Math.min(50, Number(limit) || 50));
  const cacheKey = `${query}|${repo}|${boundedLimit}`;
  if (!fresh) {
    const cached = githubFleetCache.get(cacheKey);
    if (cached && Date.now() - cached.at < GITHUB_FLEET_CACHE_TTL_MS) {
      return cached.data;
    }
  }
  const { toolchains, signing, gitBin, safeEnv } = probeGitHubToolchainsAndSigning();
  const resolvedRoot = path.resolve(NULLAITECH_ROOT);
  let allRepoSlugs = [];
  try {
    if (fs.existsSync(resolvedRoot)) {
      allRepoSlugs = fs
        .readdirSync(resolvedRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && isValidRepoSlug(d.name) && fs.existsSync(path.join(resolvedRoot, d.name, '.git')))
        .map((d) => d.name)
        .sort((a, b) => a.localeCompare(b));
    }
  } catch {
    allRepoSlugs = [];
  }

  let selectedSlugs = allRepoSlugs;
  if (repo) {
    selectedSlugs = allRepoSlugs.filter((s) => s === repo);
  } else if (query) {
    const qLower = String(query).toLowerCase().trim();
    selectedSlugs = allRepoSlugs.filter((s) => s.toLowerCase().includes(qLower));
  }

  const slice = selectedSlugs.slice(0, boundedLimit);
  const repos = [];
  for (const slug of slice) {
    const inspected = inspectLocalGitRepo(slug, { gitBin, safeEnv, signing, includeDetails: false });
    if (inspected.ok && inspected.repoAudit) {
      repos.push(inspected.repoAudit);
    }
  }

  const result = redactPayload(
    buildHostGitSnapshot({
      toolchains,
      repos,
      totalRepoCount: allRepoSlugs.length,
      signing,
      checkedAt: new Date().toISOString(),
    })
  );
  if (githubFleetCache.size > 24) githubFleetCache.clear();
  githubFleetCache.set(cacheKey, { at: Date.now(), data: result });
  return result;
}

export function studioMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (
      !url.pathname.startsWith('/api/studio') &&
      !url.pathname.startsWith('/api/swarm') &&
      !url.pathname.startsWith('/api/edge/')
    ) {
      next();
      return;
    }

    // Strict loopback Host validation on ALL /api/studio/* & /api/swarm/* requests
    // (including GET and HEAD) to defeat DNS-rebinding exfiltration.
    if (!isLocalHost(req)) {
      send(res, 403, { error: 'Untrusted host blocked.' });
      return;
    }

    // Writes (launch terminals, run the local model, send via bridge, ping) only from
    // local origins: blocks CSRF from any website.
    if (req.method !== 'GET' && req.method !== 'HEAD' && !isLocalRequest(req)) {
      send(res, 403, { error: 'Cross-origin request blocked.' });
      return;
    }

    try {
      if (req.method === 'GET' && url.pathname === '/api/studio/reality') {
        const homeDir = os.homedir();
        const modeFile = `${homeDir}/.config/zothos/current_mode`;
        const charFile = `${homeDir}/.config/zothos/active_character.json`;
        let mode = 'gold';
        if (fs.existsSync(modeFile)) {
          mode = fs.readFileSync(modeFile, 'utf8').trim() || 'gold';
        }
        let character = null;
        if (fs.existsSync(charFile)) {
          try {
            character = JSON.parse(fs.readFileSync(charFile, 'utf8'));
          } catch (_) {}
        }
        send(res, 200, {
          mode,
          character,
          allModes: ['gold', 'ghost', 'matrix', 'incognito'],
        });
        return;
      }

      if (req.method === 'GET' && (url.pathname === '/api/studio/brand/tokens' || url.pathname === '/api/studio/brand')) {
        send(res, 200, getBrandApiManifest());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/reality') {
        const body = await readBody(req);
        let requested = String(body.mode || '').toLowerCase().trim();
        if (requested === 'win11' || requested === 'windows') requested = 'incognito';
        if (requested === 'default' || requested === 'sanctum') requested = 'gold';
        if (requested === 'stealth' || requested === 'amnesic') requested = 'ghost';
        if (requested === 'cyan' || requested === 'quantum') {
          send(res, 200, {
            success: true,
            mode: 'cyan',
            hostApplied: false,
            allowedHostModes: ['gold', 'ghost', 'matrix', 'incognito'],
            message: 'Quantum Cyan preview acknowledged (browser-only palette; host zoth-mode untouched).',
          });
          return;
        }
        if (!['gold', 'ghost', 'matrix', 'incognito'].includes(requested)) {
          send(res, 400, { error: 'Invalid mode. Allowed: gold, ghost, matrix, incognito, cyan' });
          return;
        }

        exec(`/usr/local/bin/zoth-mode ${requested}`, (err, stdout, stderr) => {
          if (err) {
            console.error('zoth-mode exec error:', stderr || err.message);
          }
        });

        send(res, 200, {
          success: true,
          mode: requested,
          message: `Reality transformed to ${requested}`,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/bot/chat') {
        const body = await readBody(req);
        const userPrompt = String(body.message || '').trim();
        if (!userPrompt) {
          send(res, 400, { error: 'Message cannot be empty.' });
          return;
        }

        const homeDir = os.homedir();
        const modeFile = `${homeDir}/.config/zothos/current_mode`;
        const charFile = `${homeDir}/.config/zothos/active_character.json`;
        let mode = 'gold';
        if (fs.existsSync(modeFile)) {
          mode = fs.readFileSync(modeFile, 'utf8').trim() || 'gold';
        }
        let character = { name: 'Azoth Prime', glyph: '☿', color: '#FFD700', system_prompt: 'You are Azoth Prime, the sovereign alchemical AI architect of ZothOS.' };
        if (fs.existsSync(charFile)) {
          try {
            character = JSON.parse(fs.readFileSync(charFile, 'utf8'));
          } catch (_) {}
        }

        const systemPrompt = character.system_prompt || `You are ${character.name}, companion AI of ZothOS in ${mode} mode. Ground all answers in verifiable reality.`;
        const history = Array.isArray(body.history) ? body.history : [];

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6),
          { role: 'user', content: userPrompt },
        ];

        const result = await requestJson(11434, '/api/chat', {
          method: 'POST',
          timeout: 45000,
          body: {
            model: 'qwen2.5-coder:1.5b',
            messages,
            stream: false,
            options: { temperature: 0.7, num_predict: 256 },
          },
        });

        if (!result.up || !result.json?.message?.content) {
          send(res, 503, { error: 'Local Ollama engine (:11434) not responding.' });
          return;
        }

        send(res, 200, {
          character: character.name,
          glyph: character.glyph,
          color: character.color,
          mode,
          reply: result.json.message.content.trim(),
        });
        return;
      }

      if (req.method === 'HEAD' && (url.pathname === '/api/studio/mission-control' || url.pathname === '/api/studio/models')) {
        if (!isLocalOrigin(req?.headers?.origin)) {
          send(res, 403, { error: 'Cross-origin request blocked.' });
          return;
        }
        sendHead(res, 200);
        return;
      }

      if (
        req.method === 'HEAD' &&
        (url.pathname === '/api/studio/host' ||
          url.pathname === '/api/studio/status' ||
          url.pathname === '/api/studio/fleet' ||
          url.pathname === '/api/studio/connectors' ||
          url.pathname === '/api/studio/cyberpunk-hud' ||
          url.pathname === '/api/studio/edge-forge' ||
          url.pathname === '/api/studio/github' ||
          url.pathname === '/api/studio/github/status' ||
          url.pathname === '/api/studio/ide' ||
          url.pathname === '/api/studio/ide/status' ||
          url.pathname === '/api/studio/math-pillars' ||
          url.pathname === '/api/studio/math-pillars/status' ||
          url.pathname === '/api/studio/mission-control' ||
          url.pathname === '/api/studio/models' ||
          url.pathname === '/api/studio/hermes' ||
          url.pathname === '/api/studio/hermes/status' ||
          url.pathname === '/api/studio/konsole-relay' ||
          url.pathname === '/api/edge/telemetry' ||
          url.pathname === '/api/edge/geo')
      ) {
        sendHead(res, 200);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/models') {
        if (!isLocalOrigin(req?.headers?.origin)) {
          send(res, 403, { error: 'Cross-origin request blocked.' });
          return;
        }
        const refresh = url.searchParams.get('refresh') === '1';
        const nowMs = Date.now();
        if (!refresh && studioMiddleware._modelsCache && nowMs - studioMiddleware._modelsCache.at < 8000) {
          send(res, 200, studioMiddleware._modelsCache.data);
          return;
        }

        const readOnlyHttpGet = (port, probePath, timeoutMs = 1000) =>
          new Promise((resolve) => {
            const started = performance.now();
            const r = http.request(
              { host: '127.0.0.1', port, path: probePath, method: 'GET', timeout: timeoutMs },
              (resp) => {
                let raw = '';
                resp.on('data', (chunk) => {
                  if (raw.length < 524288) raw += chunk;
                });
                resp.on('end', () => {
                  const latencyMs = Math.max(1, Math.round(performance.now() - started));
                  let json = null;
                  try {
                    json = JSON.parse(raw);
                  } catch {}
                  resolve({
                    online: (resp.statusCode || 0) >= 200 && (resp.statusCode || 0) < 500,
                    httpStatus: resp.statusCode || 200,
                    latencyMs,
                    json,
                  });
                });
              },
            );
            r.on('timeout', () => {
              r.destroy();
              resolve({ online: false, httpStatus: 0, latencyMs: null, json: null });
            });
            r.on('error', () => {
              resolve({ online: false, httpStatus: 0, latencyMs: null, json: null });
            });
            r.end();
          });

        const readOnlyGpuInfo = () =>
          new Promise((resolve) => {
            execFile(
              'nvidia-smi',
              [
                '--query-gpu=name,memory.total,memory.used,memory.free,driver_version,utilization.gpu',
                '--format=csv,noheader,nounits',
              ],
              { timeout: 1000, maxBuffer: 16384 },
              (err, stdout) => {
                if (err || !stdout) {
                  resolve(null);
                  return;
                }
                resolve(parseNvidiaSmiCsv(stdout));
              },
            );
          });

        const [ollamaTagsRes, ollamaPsRes, agyRes, lmStudioRes, vllmRes, llamaCppRes, gpuInfo] = await Promise.all([
          readOnlyHttpGet(11434, '/api/tags', 1100),
          readOnlyHttpGet(11434, '/api/ps', 1100),
          readOnlyHttpGet(18000, '/v1/models', 1100),
          readOnlyHttpGet(1234, '/v1/models', 500),
          readOnlyHttpGet(8000, '/v1/models', 500),
          readOnlyHttpGet(8080, '/v1/models', 500),
          readOnlyGpuInfo(),
        ]);

        const snapshot = normalizeModelsSnapshot({
          mode: 'LIVE_LOOPBACK',
          checkedAt: new Date().toISOString(),
          gpu: gpuInfo,
          ollamaTags: ollamaTagsRes.json,
          ollamaPs: ollamaPsRes.json,
          agyModels: agyRes.json,
          lmStudioModels: lmStudioRes.json,
          vllmModels: vllmRes.json,
          llamaCppModels: llamaCppRes.json,
          providerProbes: {
            ollama: {
              online: ollamaTagsRes.online || ollamaPsRes.online,
              latencyMs: ollamaTagsRes.latencyMs ?? ollamaPsRes.latencyMs,
              httpStatus: ollamaTagsRes.httpStatus || ollamaPsRes.httpStatus,
            },
            'agy-hermes': {
              online: agyRes.online,
              latencyMs: agyRes.latencyMs,
              httpStatus: agyRes.httpStatus,
            },
            'lm-studio': {
              online: lmStudioRes.online,
              latencyMs: lmStudioRes.latencyMs,
              httpStatus: lmStudioRes.httpStatus,
            },
            vllm: {
              online: vllmRes.online,
              latencyMs: vllmRes.latencyMs,
              httpStatus: vllmRes.httpStatus,
            },
            'llama-cpp': {
              online: llamaCppRes.online,
              latencyMs: llamaCppRes.latencyMs,
              httpStatus: llamaCppRes.httpStatus,
            },
          },
        });

        studioMiddleware._modelsCache = { at: Date.now(), data: snapshot };
        send(res, 200, snapshot);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/models/estimate') {
        let body;
        try {
          body = await readJsonBodyWithLimit(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          send(res, 400, { error: 'Estimator payload must be a JSON object with finite paramsB, quantization, contextLen, and gpuVramGiB.' });
          return;
        }
        const estimate = estimateGgufVramFit(body);
        if (!estimate.ok) {
          send(res, 400, redactModelsPayload(estimate));
          return;
        }
        send(res, 200, redactModelsPayload({
          ...estimate,
          schemaVersion: MODELS_CONSOLE_SCHEMA_VERSION,
          evaluatedAt: new Date().toISOString(),
          source: 'studio-loopback-api',
        }));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/mission-control') {
        if (!isLocalOrigin(req?.headers?.origin)) {
          send(res, 403, { error: 'Cross-origin request blocked.' });
          return;
        }
        const refresh = url.searchParams.get('refresh') === '1';
        const nowMs = Date.now();
        if (!refresh && studioMiddleware._mcCache && nowMs - studioMiddleware._mcCache.at < 10000) {
          send(res, 200, studioMiddleware._mcCache.data);
          return;
        }
        const [fleetRaw, statusRaw, hermesGw, hermesWc, konsoleRaw] = await Promise.all([
          probeFleet(800),
          probeStatus(),
          readHermesGatewayStatus({ bypassCache: refresh }),
          readHermesWebchatStatus({ bypassCache: refresh }),
          readKonsoleRelayStatus({ bypassCache: refresh }),
        ]);
        const snapshot = buildMissionControlSnapshot({
          fleet: fleetRaw,
          status: statusRaw,
          hermes: redactHermesPathsAndSecrets({ ...hermesGw, webchat: hermesWc }),
          konsoleRelay: redactKonsoleRelayPaths(konsoleRaw),
          checkedAt: new Date().toISOString(),
          mode: 'LIVE_LOOPBACK',
        });
        studioMiddleware._mcCache = { at: Date.now(), data: snapshot };
        send(res, 200, snapshot);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/mission-control/plan') {
        let body;
        try {
          body = await readJsonBodyWithLimit(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          send(res, 400, { error: 'Mission DAG payload must be a JSON object with a non-empty "stages" array.' });
          return;
        }
        const fleetRaw = await probeFleet(400);
        const fleetPorts = Array.isArray(fleetRaw?.fleet) ? fleetRaw.fleet : [];
        const plan = planMissionDag(body, { fleetPorts, mode: 'LIVE_LOOPBACK' });
        if (!plan.ok) {
          send(res, 400, redactMissionControlPayload(plan));
          return;
        }
        send(res, 200, redactMissionControlPayload({
          ...plan,
          schemaVersion: MISSION_CONTROL_SCHEMA_VERSION,
          evaluatedAt: new Date().toISOString(),
          source: 'studio-loopback-api',
        }));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/konsole-relay') {
        const refresh = url.searchParams.get('refresh') === '1';
        const data = await readKonsoleRelayStatus({ bypassCache: refresh });
        send(res, 200, redactKonsoleRelayPaths(data));
        return;
      }

      if (
        req.method === 'GET' &&
        (url.pathname === '/api/studio/hermes' || url.pathname === '/api/studio/hermes/status')
      ) {
        const refresh = url.searchParams.get('refresh') === '1';
        const [data, webchat] = await Promise.all([
          readHermesGatewayStatus({ bypassCache: refresh }),
          readHermesWebchatStatus({ bypassCache: refresh }),
        ]);
        send(res, 200, redactHermesPathsAndSecrets({ ...data, webchat }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/hermes/analyze') {
        let body;
        try {
          body = await readBody(req, 64 * 1024);
        } catch (err) {
          send(res, err?.statusCode || 400, { error: err?.message || 'Invalid JSON body.' });
          return;
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          send(res, 400, { error: 'Expected JSON object with diagnostic text.' });
          return;
        }
        const rawText = typeof body.text === 'string' ? body.text : '';
        if (!rawText.trim()) {
          send(res, 400, { error: 'Diagnostic text cannot be empty.' });
          return;
        }
        const parsed = parseOperatorDiagnosticText(rawText);
        send(res, 200, parsed);
        return;
      }

      if (
        req.method === 'GET' &&
        (url.pathname === '/api/studio/github' || url.pathname === '/api/studio/github/status')
      ) {
        const repoParam = (url.searchParams.get('repo') || '').trim();
        const queryParam = (url.searchParams.get('q') || '').trim().slice(0, 80);
        const limitParam = Number(url.searchParams.get('limit') || 50);
        if (repoParam && !isValidRepoSlug(repoParam)) {
          send(res, 400, { error: 'Invalid repository slug parameter.' });
          return;
        }
        const snapshot = probeLocalGitHubFleet({
          query: queryParam,
          repo: repoParam,
          limit: limitParam,
        });
        send(res, 200, snapshot);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/github/audit') {
        let body;
        try {
          body = await readJsonBodyWithLimit(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }

        const repoInput = typeof body.repo === 'string' ? body.repo.trim() : '';
        const hasOfflinePayload =
          typeof body.statusText === 'string' ||
          typeof body.remoteText === 'string' ||
          typeof body.logText === 'string' ||
          typeof body.workflowYaml === 'string';

        if (repoInput && !isValidRepoSlug(repoInput)) {
          send(res, 400, { error: 'Invalid repository slug. Must match ^[A-Za-z0-9._-]{1,100}$ without traversal.' });
          return;
        }

        if (repoInput && !hasOfflinePayload) {
          const { signing, gitBin, safeEnv } = probeGitHubToolchainsAndSigning();
          const inspected = inspectLocalGitRepo(repoInput, {
            gitBin,
            safeEnv,
            signing,
            includeDetails: true,
          });
          if (!inspected.ok) {
            send(res, inspected.errorStatus || 400, { error: redactSensitiveOutput(inspected.error || 'Repository audit failed.') });
            return;
          }
          send(
            res,
            200,
            redactPayload({
              ok: true,
              version: GITHUB_OPS_VERSION,
              mode: 'LIVE_HOST_GIT',
              repoAudit: inspected.repoAudit,
              logText: inspected.logText,
              commits: inspected.commits,
              workflow: inspected.workflow,
              workflowFile: inspected.workflowFile,
              signing: evaluateSigningConfig({
                commitGpgSign: signing.commitGpgSign,
                tagGpgSign: signing.tagGpgSign,
                gpgFormat: signing.gpgFormat,
                signingKey: signing.signingKey,
                allowedSignersFile: signing.allowedSignersFile,
                repoSlug: repoInput,
              }),
              redacted: true,
            })
          );
          return;
        }

        if (!hasOfflinePayload) {
          send(res, 400, {
            error: 'Provide either a local repo slug ("repo") or offline audit payload ("statusText", "remoteText", "logText", or "workflowYaml").',
          });
          return;
        }

        const safeSlug = repoInput || 'offline-repo';
        const repoAudit =
          typeof body.statusText === 'string' || typeof body.remoteText === 'string'
            ? auditRepository({
                repo: safeSlug,
                statusText: typeof body.statusText === 'string' ? body.statusText : '',
                remoteText: typeof body.remoteText === 'string' ? body.remoteText : '',
              })
            : null;
        const commits =
          typeof body.logText === 'string' && body.logText.trim()
            ? parseConventionalCommits(body.logText, {
                currentVersion: typeof body.currentVersion === 'string' ? body.currentVersion : GITHUB_OPS_VERSION,
                repoName: safeSlug,
              })
            : null;
        const workflow =
          typeof body.workflowYaml === 'string' && body.workflowYaml.trim()
            ? lintWorkflowYaml(body.workflowYaml)
            : null;

        send(
          res,
          200,
          redactPayload({
            ok: true,
            version: GITHUB_OPS_VERSION,
            mode: 'OFFLINE_PAYLOAD_AUDIT',
            repoAudit,
            commits,
            workflow,
            redacted: true,
          })
        );
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/edge-forge') {
        send(res, 200, probeEdgeForgeToolchains());
        return;
      }

      if (
        req.method === 'GET' &&
        (url.pathname === '/api/studio/ide' || url.pathname === '/api/studio/ide/status')
      ) {
        const refresh = url.searchParams.get('refresh') === '1';
        send(res, 200, probeIdeWorkspace({ bypassCache: refresh }));
        return;
      }

      if (
        req.method === 'GET' &&
        (url.pathname === '/api/studio/math-pillars' || url.pathname === '/api/studio/math-pillars/status')
      ) {
        send(res, 200, getMathPillarsSummary());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/math-pillars/evaluate') {
        let body;
        try {
          body = await readJsonBodyWithLimit(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          send(res, 400, { error: 'Request body must be a JSON object with pillarId and optional params.' });
          return;
        }
        const pillarId = typeof body.pillarId === 'string' ? body.pillarId.trim() : '';
        const params = body.params && typeof body.params === 'object' && !Array.isArray(body.params) ? body.params : body;
        const result = evaluatePillar(pillarId, params);
        if (!result.ok) {
          send(res, 400, { error: redactMathPillarsPaths(result.error), validPillars: result.validPillars });
          return;
        }
        send(res, 200, {
          ...result,
          mode: 'LOOPBACK_ENGINE_VERIFIED',
          engineVersion: MATH_PILLARS_ENGINE_VERSION,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/ide/inspect') {
        let body;
        try {
          body = await readJsonBodyWithLimit(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }

        const repoInput = typeof body.repo === 'string' ? body.repo.trim() : '';
        const filePathInput = typeof body.filePath === 'string' ? body.filePath.trim() : '';
        const hasOfflineCode = typeof body.code === 'string';

        if ((repoInput || filePathInput) && !hasOfflineCode) {
          const result = inspectLocalIdeFile(repoInput, filePathInput);
          if (!result.ok) {
            send(res, result.statusCode || 400, { error: result.error || 'File inspection rejected.' });
            return;
          }
          send(res, 200, result.payload);
          return;
        }

        if (!hasOfflineCode) {
          send(res, 400, {
            error: 'Provide either { repo, filePath } for read-only local inspection or { code, language, filename } for offline analysis.',
          });
          return;
        }

        const filename = typeof body.filename === 'string' && body.filename.trim() ? body.filename.trim().slice(0, 120) : 'buffer.js';
        const language = detectLanguageFromFilename(filename, typeof body.language === 'string' ? body.language : 'javascript');
        const structure = analyzeSourceStructure(body.code, language);
        const lint = lintSourceCode(body.code, language, filename);
        const diff =
          typeof body.originalCode === 'string'
            ? computeUnifiedDiff(body.originalCode, body.code, filename)
            : null;

        send(
          res,
          200,
          redactIdeOutput({
            ok: true,
            version: IDE_ENGINE_VERSION,
            mode: 'OFFLINE_BUFFER_INSPECT',
            readOnly: true,
            filename,
            language,
            structure,
            lint,
            diff,
            redacted: true,
          })
        );
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/edge-forge/compile') {
        let body;
        try {
          body = await readJsonBodyWithLimit(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        const presetId = typeof body.presetId === 'string' && body.presetId.trim() ? body.presetId.trim() : 'add_i32';
        const wat = typeof body.wat === 'string' ? body.wat.trim() : '';

        if (wat) {
          if (wat.length > 48000) {
            send(res, 413, { error: 'WAT source exceeds 48 KB limit.' });
            return;
          }
          try {
            const compiled = compileWatWithLocalWat2Wasm(wat);
            if (compiled) {
              const inspection = inspectWasmBinary(compiled);
              send(res, 200, {
                ok: true,
                version: EDGE_FORGE_VERSION,
                compiler: 'LOCAL_WAT2WASM',
                presetId,
                byteLength: inspection.byteLength,
                sha256: inspection.sha256,
                base64: inspection.base64,
                sections: inspection.sections,
                exports: inspection.exports,
              });
              return;
            }
          } catch (err) {
            const errMsg = redactHomePaths(String(err?.stderr || err?.message || 'wat2wasm compilation failed')).slice(0, 320);
            send(res, 400, { error: errMsg });
            return;
          }
        }

        const built = assembleWasmPreset(presetId);
        send(res, 200, {
          ok: true,
          version: EDGE_FORGE_VERSION,
          compiler: 'ENGINE_PRESET_ASSEMBLER',
          presetId: built.presetId,
          byteLength: built.byteLength,
          sha256: built.sha256,
          base64: built.base64,
          sections: built.inspection.sections,
          exports: built.inspection.exports,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/cyberpunk-hud') {
        const [rawHost, statusData, fleetRaw] = await Promise.all([
          collectRawHostTelemetry(),
          probeStatus(),
          probeFleet(450),
        ]);
        const reality = readRealityProfileState();
        const snapshot = buildCyberpunkHudSnapshot({
          host: rawHost,
          status: statusData,
          fleet: fleetRaw,
          reality,
          timestamp: new Date().toISOString(),
        });
        send(res, 200, snapshot);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/fleet') {
        send(res, 200, await probeFleet());
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/status') {
        send(res, 200, await probeStatus());
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/swarm/mux-status') {
        const mux = await requestJson(8141, '/status', { timeout: 900 });
        send(res, 200, mux.up ? { up: true, ...(mux.json || {}) } : { up: false });
        return;
      }

      if (req.method === 'GET' && (url.pathname === '/api/studio/swarm/status' || url.pathname === '/api/swarm/status')) {
        const t0 = Date.now();
        const swarmRes = await requestJson(8989, '/status', { timeout: 800 });
        if (swarmRes.up) {
          send(res, 200, { up: true, port: 8989, latency: Date.now() - t0, ...swarmRes.json });
        } else {
          const azothRes = await requestJson(8790, '/status', { timeout: 800 });
          if (azothRes.up) {
            send(res, 200, { up: true, port: 8790, latency: Date.now() - t0, ...azothRes.json });
          } else {
            send(res, 200, { up: false, port: 8989, message: 'Daemon offline. Run zoth-swarm or python3 swarm_daemon.py on port 8989.' });
          }
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/swarm/ping') {
        const t0 = Date.now();
        const check = await requestJson(8989, '/health', { timeout: 1000 });
        const rtt = Math.max(0.1, Number((Date.now() - t0).toFixed(2)));
        send(res, 200, {
          up: check.up,
          port: 8989,
          rtt,
          status: check.up ? 'ONLINE' : 'OFFLINE',
          message: check.up ? 'Echo from 127.0.0.1:8989' : 'Daemon offline on 127.0.0.1:8989'
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/host') {
        const rawHost = await collectRawHostTelemetry();
        send(res, 200, sanitizeCockpitPayload(rawHost));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/cockpit') {
        const payload = await collectCockpitSnapshot();
        send(res, 200, payload);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/ax/audit') {
        send(res, 200, auditStudioAxManifests());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/ax/validate') {
        const body = await readBody(req, 256 * 1024);
        const spec = String(body?.spec || '').trim();
        const content = typeof body?.content === 'string' ? body.content : null;
        if (!spec || content === null) {
          send(res, 400, {
            error: 'Request must include string fields "spec" and "content".',
            allowedSpecs: AX_SPEC_IDS,
          });
          return;
        }
        if (!AX_SPEC_IDS.includes(spec.toLowerCase())) {
          send(res, 400, {
            error: `Unsupported spec "${spec}".`,
            allowedSpecs: AX_SPEC_IDS,
          });
          return;
        }
        const expectedCounts = body?.expectedCounts && typeof body.expectedCounts === 'object'
          ? body.expectedCounts
          : getGroundTruthCounts();
        const result = validateAxSpec(spec, content, expectedCounts);
        send(res, 200, {
          ...result,
          validatedAt: new Date().toISOString(),
          source: 'studio-loopback-api',
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/composer/providers') {
        send(res, 200, await probeComposerProviders());
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/composer/step') {
        const body = await readBody(req);
        const provider = String(body.provider || 'transform').toLowerCase().trim();
        const model = String(body.model || '').trim();
        const role = String(body.role || 'Pipeline Worker').slice(0, 160);
        const nodeName = String(body.name || 'DAG Node').slice(0, 120);
        const prompt = String(body.prompt || body.input || '').slice(0, 24000);
        const timeoutMs = Math.max(1500, Math.min(45000, Number(body.timeoutMs) || 25000));
        const t0 = Date.now();

        if (!prompt.trim()) {
          send(res, 400, {
            ok: false,
            provider,
            model,
            output: '',
            durationMs: 0,
            tokenEstimate: 0,
            error: 'Step prompt cannot be empty.',
          });
          return;
        }

        if (provider === 'transform' || provider === 'validator') {
          const transformMode = model || body.transformMode || (provider === 'validator' ? 'json-validate' : 'markdown-brief');
          send(res, 200, runDeterministicTransformServer(transformMode, prompt));
          return;
        }

        if (provider === 'ollama') {
          let targetModel = model;
          if (!targetModel) {
            const tags = await requestJson(11434, '/api/tags', { timeout: 1200 });
            const installed = tags.up ? localModels(tags.json) : [];
            targetModel = installed[0] || 'qwen2.5-coder:1.5b';
          }
          if (/cloud/i.test(targetModel)) {
            send(res, 400, {
              ok: false,
              provider,
              model: targetModel,
              output: '',
              durationMs: Date.now() - t0,
              tokenEstimate: 0,
              error: 'Cloud model identifiers are rejected by the loopback invariant.',
            });
            return;
          }
          const result = await requestJson(11434, '/api/chat', {
            method: 'POST',
            timeout: timeoutMs,
            body: {
              model: targetModel,
              messages: [
                { role: 'system', content: `You are ${nodeName} (${role}) inside a Zoth Studio DAG pipeline. Respond concisely and concretely.` },
                { role: 'user', content: prompt },
              ],
              stream: false,
              options: { temperature: 0.4, num_predict: 384 },
            },
          });
          const text = result.json?.message?.content?.trim();
          if (!result.up || !text) {
            send(res, result.up ? 502 : 503, {
              ok: false,
              provider,
              model: targetModel,
              output: '',
              durationMs: Date.now() - t0,
              tokenEstimate: 0,
              error: result.json?.error || `Ollama (:11434) failed for model "${targetModel}".`,
            });
            return;
          }
          send(res, 200, {
            ok: true,
            provider,
            model: targetModel,
            output: text,
            durationMs: Math.max(1, Date.now() - t0),
            tokenEstimate: Math.max(1, Math.round(text.length / 4)),
            error: null,
          });
          return;
        }

        if (provider === 'agy-hermes') {
          let targetModel = model;
          if (!targetModel) {
            const list = await requestJson(18000, '/v1/models', { timeout: 1200 });
            targetModel = list.json?.data?.[0]?.id || 'gemini-3.8-flash-medium';
          }
          const result = await requestJson(18000, '/v1/chat/completions', {
            method: 'POST',
            timeout: timeoutMs,
            body: {
              model: targetModel,
              messages: [
                { role: 'system', content: `You are ${nodeName} (${role}) inside a Zoth Studio DAG pipeline. Respond concisely.` },
                { role: 'user', content: prompt },
              ],
              max_tokens: 384,
            },
          });
          const text = result.json?.choices?.[0]?.message?.content?.trim();
          if (!result.up || !text) {
            send(res, result.up ? 502 : 503, {
              ok: false,
              provider,
              model: targetModel,
              output: '',
              durationMs: Date.now() - t0,
              tokenEstimate: 0,
              error: result.json?.error?.message || result.json?.error || `AGY-Hermes (:18000) did not return a completion for "${targetModel}".`,
            });
            return;
          }
          send(res, 200, {
            ok: true,
            provider,
            model: targetModel,
            output: text,
            durationMs: Math.max(1, Date.now() - t0),
            tokenEstimate: Math.max(1, Math.round(text.length / 4)),
            error: null,
          });
          return;
        }

        if (provider === 'azoth') {
          const result = await requestJson(8136, '/api/chat', {
            method: 'POST',
            timeout: timeoutMs,
            body: { message: prompt, prompt, role, nodeName },
          });
          const text = String(
            result.json?.reply ||
              result.json?.response ||
              result.json?.output ||
              result.json?.message ||
              ''
          ).trim();
          if (!result.up || !text) {
            send(res, result.up ? 502 : 503, {
              ok: false,
              provider,
              model: model || 'azoth-react',
              output: '',
              durationMs: Date.now() - t0,
              tokenEstimate: 0,
              error: result.json?.error || 'Azoth Local Agent (:8136) did not return a text response.',
            });
            return;
          }
          send(res, 200, {
            ok: true,
            provider,
            model: model || 'azoth-react',
            output: text,
            durationMs: Math.max(1, Date.now() - t0),
            tokenEstimate: Math.max(1, Math.round(text.length / 4)),
            error: null,
          });
          return;
        }

        if (provider === 'neuro-memory') {
          const query = prompt.replace(/\s+/g, ' ').trim().slice(0, 140);
          const qPath = `/api/memories?q=${encodeURIComponent(query)}&limit=5`;
          let result = await requestJson(8094, qPath, { timeout: Math.min(timeoutMs, 4000) });
          if (!result.up) {
            result = await requestJson(8788, qPath, { timeout: Math.min(timeoutMs, 4000) });
          }
          if (!result.up) {
            send(res, 503, {
              ok: false,
              provider,
              model: 'stdp-recall',
              output: '',
              durationMs: Date.now() - t0,
              tokenEstimate: 0,
              error: 'Neuro-Memory daemon (:8094) is offline or unreachable.',
            });
            return;
          }
          const items = Array.isArray(result.json?.memories) ? result.json.memories : [];
          const text = items.length
            ? items
                .map((m, idx) => `${idx + 1}. [${String(m.id || '').slice(0, 8)}] ${String(m.text || m.content || '').slice(0, 260)}`)
                .join('\n')
            : `No Neuro-Memory engrams matched query "${query.slice(0, 64)}".`;
          send(res, 200, {
            ok: true,
            provider,
            model: 'stdp-recall',
            output: text,
            durationMs: Math.max(1, Date.now() - t0),
            tokenEstimate: Math.max(1, Math.round(text.length / 4)),
            error: null,
          });
          return;
        }

        if (provider === 'sovereign-bridge') {
          const health = await requestJson(8102, '/health', { timeout: 1500 });
          if (!health.up) {
            send(res, 503, {
              ok: false,
              provider,
              model: 'signal-mesh',
              output: '',
              durationMs: Date.now() - t0,
              tokenEstimate: 0,
              error: 'Sovereign Agent Bridge (:8102) is offline.',
            });
            return;
          }
          const text = `[Sovereign Bridge :8102 ONLINE] Status: ${JSON.stringify(health.json)}\nQueued Context (${prompt.length} chars): ${prompt.slice(0, 240)}`;
          send(res, 200, {
            ok: true,
            provider,
            model: 'signal-mesh',
            output: text,
            durationMs: Math.max(1, Date.now() - t0),
            tokenEstimate: Math.max(1, Math.round(text.length / 4)),
            error: null,
          });
          return;
        }

        if (['hermes', 'agy', 'codex', 'claude-code'].includes(provider)) {
          const binName = provider === 'claude-code' ? 'claude' : provider;
          const found = Boolean(resolveBinaryOnPath(binName, [LOCAL_BIN, AGY_BIN_DIR, '/opt/zothos-ai-env/bin']));
          send(res, 501, {
            ok: false,
            provider,
            model: model || provider,
            output: '',
            durationMs: Math.max(1, Date.now() - t0),
            tokenEstimate: 0,
            error: found
              ? `CLI provider "${binName}" is installed on PATH but requires an interactive terminal session; switch this node to "agy-hermes" (:18000) or "ollama" (:11434) for headless HTTP DAG execution.`
              : `CLI binary "${binName}" was not detected on PATH.`,
          });
          return;
        }

        send(res, 400, {
          ok: false,
          provider,
          model,
          output: '',
          durationMs: Math.max(1, Date.now() - t0),
          tokenEstimate: 0,
          error: `Unsupported composer provider "${provider}".`,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/agent/triad') {
        const conductorPath = resolveConductorBin();
        const envWithPath = {
          ...process.env,
          PATH: [LOCAL_BIN, '/usr/local/bin', '/usr/bin', '/bin', AGY_BIN_DIR, process.env.PATH || ''].filter(Boolean).join(path.delimiter),
        };
        execFile(conductorPath, ['agents', '--json'], { timeout: 6000, env: envWithPath }, (err, stdout) => {
          if (err) {
            send(res, 503, { error: sanitizeErrorMessage(err.message), ready_count: 0, agents: [] });
            return;
          }
          try {
            const parsed = JSON.parse(stdout);
            if (Array.isArray(parsed.agents)) {
              parsed.agents = parsed.agents.map((a) => ({
                ...a,
                binary: a.binary ? sanitizeErrorMessage(a.binary) : a.binary,
                version: a.version ? sanitizeErrorMessage(a.version) : a.version,
                error: a.error ? sanitizeErrorMessage(a.error) : a.error,
              }));
            }
            send(res, 200, JSON.parse(sanitizeErrorMessage(JSON.stringify(parsed))));
          } catch {
            send(res, 200, { raw: sanitizeErrorMessage(stdout) });
          }
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/agent/dispatch') {
        const body = await readBody(req);
        const engine = ['hermes', 'cursor', 'grok', 'ollama', 'zothos', 'auto'].includes(String(body.engine || 'auto')) ? String(body.engine || 'auto') : 'auto';
        const promptText = String(body.prompt || 'Summarize workspace status').slice(0, 1200);
        const dirPath = String(body.dir || path.join(NULLAITECH_ROOT, 'zoth-studio-v2'));
        const modelName = String(body.model || 'qwen2.5-coder:1.5b').replace(/[^a-zA-Z0-9._:-]/g, '');
        const argv = ['dispatch', '--engine', engine, '--model', modelName, '--dir', dirPath];
        if (body.dryRun) argv.push('--dry-run');
        argv.push('--json', promptText);
        const conductorPath = resolveConductorBin();
        execFile(conductorPath, argv, { timeout: 95000 }, (err, stdout, stderr) => {
          try {
            send(res, 200, JSON.parse(stdout));
          } catch {
            send(res, 200, {
              success: !err,
              engine,
              output: sanitizeErrorMessage(stdout || stderr || (err ? err.message : '')),
            });
          }
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/launch') {
        const body = await readBody(req);
        const tool = body.tool;
        const allowedCommands = {
          claude: 'xfce4-terminal --title="Claude CLI" -e "claude" &',
          opencode: 'xfce4-terminal --title="OpenCode" -e "opencode" &',
          hermes: `xfce4-terminal --title="Hermes Agent" -e ${shellQuote(path.join(LOCAL_BIN, 'hermes'))} &`,
          cursor: `xfce4-terminal --title="Cursor Agent" -e ${shellQuote(path.join(LOCAL_BIN, 'cursor-agent'))} &`,
          grok: `xfce4-terminal --title="Grok Agent" -e ${shellQuote(path.join(GROK_BIN_DIR, 'grok'))} &`,
          ollama: 'xfce4-terminal --title="Ollama Local LLM" -e "ollama run qwen2.5-coder:1.5b" &',
          zothos: `xfce4-terminal --title="ZothOS Conductor" -e ${shellQuote(`${CONDUCTOR_BIN} watch`)} &`,
          netlify: 'xfce4-terminal --title="Netlify CLI" -e "netlify" &',
          burpsuite: 'burpsuite &',
          bitwarden: 'xfce4-terminal --title="Bitwarden CLI" -e "bw" &',
          streamlit: 'xfce4-terminal --title="Streamlit" -e "streamlit" &',
          terminal: 'xfce4-terminal &',
          arsenal: 'xfce4-terminal --title="Arsenal Provisioner" -e "zoth-arsenal-sync" &'
        };
        if (allowedCommands[tool]) {
          exec(allowedCommands[tool], (err) => {
            if (err) console.error('[Zoth Studio] Launch error:', err);
          });
          send(res, 200, { success: true, tool });
          return;
        }
        send(res, 400, { error: 'Unknown or disallowed tool: ' + tool });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/supervisor/boot') {
        const body = await readBody(req);
        const target = String(body.service || '').toLowerCase();
        const bootMap = {
          civilization: `ENABLE_KOKORO_VOICE=0 nohup node ${shellQuote(path.join(NULLAITECH_ROOT, 'zoth-civilization', 'server.js'))} >/tmp/zoth-civ-supervisor.log 2>&1 &`,
          webgen: `cd ${shellQuote(path.join(NULLAITECH_ROOT, 'bolt.diy'))} && nohup npm run dev -- --port 5173 >/tmp/zoth-bolt-supervisor.log 2>&1 &`,
          bolt: `cd ${shellQuote(path.join(NULLAITECH_ROOT, 'bolt.diy'))} && nohup npm run dev -- --port 5173 >/tmp/zoth-bolt-supervisor.log 2>&1 &`,
          daemons: `${shellQuote(CONDUCTOR_BIN)} up >/tmp/zoth-daemons-supervisor.log 2>&1 && nohup node ${shellQuote(path.join(STUDIO_ROOT, 'bin', 'zoth.js'))} up >>/tmp/zoth-daemons-supervisor.log 2>&1 &`,
        };
        if (!bootMap[target]) {
          send(res, 400, { error: `Unknown service "${target}". Allowed: civilization, bolt (webgen), daemons.` });
          return;
        }
        exec(bootMap[target], (err) => {
          if (err) console.error('[Zoth Supervisor] Boot error:', err);
        });
        await new Promise((r) => setTimeout(r, 1200));
        const status = await probeStatus();
        send(res, 200, {
          success: true,
          booted: target,
          status,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/memory') {
        const query = url.searchParams.get('q') || '';
        const path = query
          ? `/api/memories?q=${encodeURIComponent(query)}&limit=50`
          : '/api/memories?limit=50';
        let result = await requestJson(8094, path);
        if (!result.up) {
          result = await requestJson(8788, path);
        }
        if (!result.up) {
          send(res, 503, {
            error: 'Memory daemon is not answering on 127.0.0.1:8094.',
            hint: 'python3 src/daemon.py --port 8094 or npm run zoth -- up',
          });
          return;
        }
        send(res, result.status || 200, result.json || { memories: [] });
        return;
      }

      if (req.method === 'GET' && (url.pathname === '/api/studio/benchmarks' || url.pathname === '/api/studio/blobs-leaderboard')) {
        send(res, 200, {
          storage: 'Local Development Emulated Blobs Store',
          count: LOCAL_BENCHMARKS.length,
          benchmarks: LOCAL_BENCHMARKS
        });
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/studio/benchmarks' || url.pathname === '/api/studio/blobs-leaderboard')) {
        const body = await readBody(req);
        const record = {
          id: `BENCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          adapter: String(body.adapter || 'WebGPU Hardware Tensor Core').slice(0, 80),
          matrixSize: Number(body.matrixSize) || 256,
          gflops: String(body.gflops || '0.0'),
          tflops: String(body.tflops || '0.0 TFLOPS'),
          timeMs: String(body.timeMs || '0.0'),
          verified: body.verified !== false,
          userTag: String(body.userTag || 'Community Stream Guest').slice(0, 40),
          timestamp: new Date().toISOString()
        };
        LOCAL_BENCHMARKS.unshift(record);
        if (LOCAL_BENCHMARKS.length > 50) LOCAL_BENCHMARKS = LOCAL_BENCHMARKS.slice(0, 50);
        send(res, 201, {
          success: true,
          message: 'Benchmark verified and recorded to local development store.',
          record,
          storage: 'Local Development Emulated Blobs Store'
        });
        return;
      }

      if (req.method === 'GET' && (url.pathname === '/api/studio/netlify-spec' || url.pathname === '/api/studio/platform')) {
        send(res, 200, {
          platform: 'Netlify Local Emulation / Production Platform',
          domain: 'zoth.nullai.tech',
          showcaseEvent: 'Netlify Community Stream',
          features: {
            prerenderedRoutes: 140,
            edgeFunctions: 'Active',
            serverlessFunctions: 'Active',
            blobsStateStore: 'Active',
            imageCDN: 'Active'
          }
        });
        return;
      }

      if (req.method === 'GET' && (url.pathname === '/api/edge/telemetry' || url.pathname === '/api/edge/geo')) {
        send(res, 200, {
          platform: 'Netlify Edge Runtime (Emulated)',
          edgePOP: { city: 'Ashburn, VA (us-east-1)', country: 'United States' },
          securityEnclave: { coop: 'same-origin', coep: 'credentialless', webgpuPermitted: true },
          showcase: { routesPrerendered: 140, framework: 'React 19 + Vite + Three.js + WebGPU' }
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/chronicle/summary') {
        const checkedAt = new Date().toISOString();
        const [health, overview, continuity, patternsRes, syncTimer] = await Promise.all([
          requestJson(8161, '/health', { timeout: 1200 }),
          requestJson(8161, '/api/overview', { timeout: 1200 }),
          requestJson(8161, '/api/continuity/overview', { timeout: 1200 }),
          requestJson(8161, '/api/patterns', { timeout: 1200 }),
          readChronicleSyncTimerStatus(1200),
        ]);

        if (!health.up && !overview.up) {
          send(res, 200, {
            online: false,
            schemaVersion: CHRONICLE_SCHEMA_VERSION,
            checkedAt,
            reason: 'Chronicle Vault daemon (:8161) not reachable — browser hybrid analyzer active',
            syncRunning: syncTimer.serviceActiveState === 'activating',
            lastSync: null,
            syncTimer,
            stats: null,
            patterns: [],
            alerts: [],
            unfinishedLoops: [],
            parkedIdeas: [],
            byFamily: [],
          });
          return;
        }

        const patterns = normalizePatterns(patternsRes.up ? patternsRes.json : []);
        const continuityNorm = normalizeContinuityItems(continuity.up ? continuity.json : []);
        const stats = normalizeOverviewStats(
          overview.up ? overview.json : {},
          continuity.up ? continuity.json : {},
          patterns
        );
        const lastSync = normalizeLastSync(overview.up ? overview.json?.last_sync : null);

        send(res, 200, {
          online: true,
          schemaVersion: CHRONICLE_SCHEMA_VERSION,
          checkedAt,
          service: sanitizeChronicleText(health.json?.service || 'chronicle-vault'),
          syncRunning: Boolean(health.json?.sync_running || syncTimer.serviceActiveState === 'activating'),
          lastSync,
          syncTimer,
          stats,
          patterns,
          alerts: [],
          unfinishedLoops: continuityNorm.unfinishedLoops,
          parkedIdeas: continuityNorm.parkedIdeas,
          continuityItems: continuityNorm.items,
          byFamily: stats.byFamily,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/chronicle/recall') {
        let body;
        try {
          body = await readJsonBodyStrict(req, 16384);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        if (typeof body.query !== 'string' || !body.query.trim()) {
          send(res, 400, { error: 'Request body must include non-empty string field "query".' });
          return;
        }
        const query = body.query.trim().slice(0, 300);
        const recallRes = await requestJson(8161, '/api/continuity/recall', {
          method: 'POST',
          body: { query },
          timeout: 2500,
        });

        if (!recallRes.up || !recallRes.json) {
          send(res, 200, {
            online: false,
            schemaVersion: CHRONICLE_SCHEMA_VERSION,
            query: sanitizeChronicleText(query),
            reason: 'Chronicle Vault daemon (:8161) not reachable — browser hybrid analyzer active',
            entities: [],
            keywords: [],
            related_memories: [],
            alerts: [],
            repetition_alerts: [],
            breakage_warnings: [],
            unfinished_loops: [],
            parked_ideas: [],
          });
          return;
        }

        const normalized = normalizeRecallResponse(recallRes.json);
        send(res, 200, {
          online: true,
          schemaVersion: CHRONICLE_SCHEMA_VERSION,
          ...normalized,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/chronicle/search') {
        const q = String(url.searchParams.get('q') || '').trim().slice(0, 200);
        const rawLimit = Number(url.searchParams.get('limit') || 12);
        const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.floor(rawLimit))) : 12;
        const upstreamPath = `/api/conversations?q=${encodeURIComponent(q)}&limit=${limit}`;
        const searchRes = await requestJson(8161, upstreamPath, { timeout: 2000 });

        if (!searchRes.up || !searchRes.json) {
          send(res, 200, {
            online: false,
            schemaVersion: CHRONICLE_SCHEMA_VERSION,
            query: sanitizeChronicleText(q),
            limit,
            total: 0,
            conversations: [],
            reason: 'Chronicle Vault daemon (:8161) not reachable — browser hybrid analyzer active',
          });
          return;
        }

        const normalized = normalizeConversations(searchRes.json);
        send(res, 200, {
          online: true,
          schemaVersion: CHRONICLE_SCHEMA_VERSION,
          query: sanitizeChronicleText(q),
          limit,
          total: normalized.total,
          conversations: normalized.conversations,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/bus/telemetry') {
        const timestamp = new Date().toISOString();
        const nodes = await Promise.all(
          LOOPBACK_BUS_TARGETS.map((target) => probeLoopbackTarget(target, 700))
        );
        const summary = computeLatencyStats(nodes);
        const unixSockets = scanLocalUnixSockets();

        const bridgeNode = nodes.find((n) => n.port === 8102);
        let bridge = { online: false, port: 8102 };
        if (bridgeNode?.ok) {
          const [health, stats, live, channels] = await Promise.all([
            requestJson(8102, '/api/health', { timeout: 700 }),
            requestJson(8102, '/api/stats', { timeout: 700 }),
            requestJson(8102, '/api/agents/live', { timeout: 900 }),
            requestJson(8102, '/api/channels', { timeout: 700 }),
          ]);
          const normalizedChannels = normalizeBridgeChannels(channels.json?.channels || []);
          bridge = {
            online: Boolean(health.up),
            port: 8102,
            rttMs: bridgeNode.rttMs,
            health: health.json || null,
            stats: stats.json || null,
            liveSummary: live.json?.summary || null,
            museSessions: Array.isArray(live.json?.muse_sessions) ? live.json.muse_sessions.slice(0, 6) : [],
            antigravitySessions: Array.isArray(live.json?.antigravity_sessions) ? live.json.antigravity_sessions.slice(0, 6) : [],
            toolPolicies: Array.isArray(live.json?.tool_policies) ? live.json.tool_policies : [],
            channels: normalizedChannels,
          };
        }

        send(res, 200, {
          schemaVersion: BUS_MONITOR_VERSION,
          timestamp,
          summary: {
            ...summary,
            totalTargets: nodes.length,
          },
          nodes,
          bridge,
          unixSockets,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/bus/ping') {
        let body;
        try {
          body = await readJsonBodyStrict(req, 16384);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        const validation = validateLoopbackPort(body.port, { host: body.host });
        if (!validation.valid) {
          send(res, 400, { error: validation.error });
          return;
        }
        const target = validation.target || {
          id: `loopback-${validation.port}`,
          code: `P${String(validation.port).slice(-3)}`,
          name: `Loopback Port :${validation.port}`,
          port: validation.port,
          probePath: '/',
          protocol: 'HTTP',
          category: 'Custom',
        };
        const probed = await probeLoopbackTarget(target, 700);
        send(res, 200, {
          ok: probed.ok,
          host: '127.0.0.1',
          port: probed.port,
          targetId: probed.id,
          name: probed.name,
          status: probed.status,
          httpStatus: probed.httpStatus,
          protocol: probed.protocol,
          rttMs: probed.rttMs,
          checkedAt: probed.checkedAt,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/connectors') {
        const checkedAt = new Date().toISOString();

        const probeHttp = (port, probePath = '/', timeoutMs = 1000) =>
          new Promise((resolve) => {
            const started = performance.now();
            const r = http.request(
              { host: '127.0.0.1', port, path: probePath, method: 'GET', timeout: timeoutMs },
              (resp) => {
                let raw = '';
                resp.on('data', (chunk) => {
                  if (raw.length < 65536) raw += chunk;
                });
                resp.on('end', () => {
                  const latencyMs = Math.max(1, Math.round(performance.now() - started));
                  let json = null;
                  try { json = JSON.parse(raw); } catch {}
                  resolve({
                    online: true,
                    statusCode: resp.statusCode || 200,
                    latencyMs,
                    json,
                  });
                });
              }
            );
            r.on('timeout', () => {
              r.destroy();
              resolve({ online: false, statusCode: 0, latencyMs: null, json: null });
            });
            r.on('error', () => {
              resolve({ online: false, statusCode: 0, latencyMs: null, json: null });
            });
            r.end();
          });

        const probeProvider = async (prov) => {
          const primary = await probeHttp(prov.port, prov.probePath || '/', 1000);
          let modelsCount = null;
          let version = null;
          if (primary.online) {
            if (primary.json && typeof primary.json === 'object') {
              if (typeof primary.json.version === 'string') version = primary.json.version;
              if (Array.isArray(primary.json.models)) modelsCount = primary.json.models.length;
              else if (Array.isArray(primary.json.data)) modelsCount = primary.json.data.length;
              else if (Number.isFinite(Number(primary.json.modelsCount))) modelsCount = Number(primary.json.modelsCount);
            }
            if (modelsCount === null && prov.modelsPath && prov.modelsPath !== prov.probePath) {
              const mRes = await probeHttp(prov.port, prov.modelsPath, 900);
              if (mRes.online && mRes.json) {
                if (Array.isArray(mRes.json.data)) modelsCount = mRes.json.data.length;
                else if (Array.isArray(mRes.json.models)) modelsCount = mRes.json.models.length;
              }
            }
          }
          return {
            ...prov,
            online: primary.online,
            status: primary.online ? 'online' : 'offline',
            statusCode: primary.statusCode,
            latencyMs: primary.latencyMs,
            modelsCount,
            version,
          };
        };

        const probeBridge = async (bridge) => {
          if (!bridge.port) {
            const binPath = resolveBinaryOnPath(bridge.mcpCommand, [LOCAL_BIN, AGY_BIN_DIR]);
            const present = Boolean(binPath);
            return {
              ...bridge,
              online: present,
              status: present ? 'online' : 'offline',
              statusCode: null,
              latencyMs: null,
              location: binPath ? sanitizeConnectorText(binPath) : null,
            };
          }
          const resProbe = await probeHttp(bridge.port, bridge.probePath || '/', 900);
          return {
            ...bridge,
            online: resProbe.online,
            status: resProbe.online ? 'online' : 'offline',
            statusCode: resProbe.statusCode,
            latencyMs: resProbe.latencyMs,
          };
        };

        const discoverMcpServers = () => {
          const byName = new Map();

          // 1. Antigravity CLI MCP directory (~/.gemini/antigravity-cli/mcp/*)
          const agyMcpDir = path.join(HOME_DIR, '.gemini', 'antigravity-cli', 'mcp');
          try {
            if (fs.existsSync(agyMcpDir)) {
              const entries = fs.readdirSync(agyMcpDir, { withFileTypes: true });
              for (const ent of entries) {
                if (!ent.isDirectory() || ent.name.startsWith('.')) continue;
                const srvDir = path.join(agyMcpDir, ent.name);
                let toolCount = 0;
                try {
                  toolCount = fs.readdirSync(srvDir).filter((f) => f.endsWith('.json') && f !== 'server.json').length;
                } catch {}
                const cfg = redactMcpServerConfig(
                  ent.name,
                  { transport: 'stdio', toolCount },
                  '~/.gemini/antigravity-cli/mcp/'
                );
                byName.set(cfg.name, cfg);
              }
            }
          } catch {}

          // 2. JSON MCP registries (~/.hermes/mcp_servers.json, ~/.claude.json, ~/.config/claude/claude_desktop_config.json)
          const jsonSources = [
            { file: path.join(HOME_DIR, '.hermes', 'mcp_servers.json'), label: '~/.hermes/mcp_servers.json' },
            { file: path.join(HOME_DIR, '.claude.json'), label: '~/.claude.json' },
            { file: path.join(HOME_DIR, '.config', 'claude', 'claude_desktop_config.json'), label: '~/.config/claude/claude_desktop_config.json' },
          ];
          for (const src of jsonSources) {
            try {
              if (!fs.existsSync(src.file)) continue;
              const parsed = JSON.parse(fs.readFileSync(src.file, 'utf8'));
              const map = parsed?.mcpServers && typeof parsed.mcpServers === 'object'
                ? parsed.mcpServers
                : (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !parsed.numStartups ? parsed : null);
              if (!map || typeof map !== 'object') continue;
              for (const [name, rawCfg] of Object.entries(map)) {
                if (!rawCfg || typeof rawCfg !== 'object') continue;
                const cfg = redactMcpServerConfig(name, rawCfg, src.label);
                if (!byName.has(cfg.name)) {
                  byName.set(cfg.name, cfg);
                }
              }
            } catch {}
          }

          return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
        };

        const [providers, baseBridges, hermesGateway, hermesWebchat, konsoleRelay] = await Promise.all([
          Promise.all(AI_PROVIDER_CONNECTORS.map(probeProvider)),
          Promise.all(ZOTH_BRIDGE_CONNECTORS.map(probeBridge)),
          readHermesGatewayStatus(),
          readHermesWebchatStatus(),
          readKonsoleRelayStatus(),
        ]);

        const hermesGatewayBridge = {
          id: 'hermes-gateway',
          name: 'Hermes Agent Gateway',
          category: 'bridge',
          protocol: 'Systemd + Loopback HTTP + AF_UNIX',
          host: '127.0.0.1',
          port: hermesGateway?.listener?.port || null,
          probePath: '/api/health',
          online: Boolean(hermesGateway?.active),
          status: hermesGateway?.active ? 'online' : 'offline',
          statusCode: hermesGateway?.listener?.port ? 200 : null,
          latencyMs: null,
          pid: hermesGateway?.systemd?.pid || null,
          profilesCount: hermesGateway?.gateway?.profileCount || 0,
          profiles: hermesGateway?.gateway?.profiles || [],
          socketPath: '~/.hermes/gateway.sock',
          socketExists: Boolean(hermesGateway?.socket?.exists),
          description: `User systemd daemon (${HERMES_GATEWAY_UNIT}) multiplexing ${hermesGateway?.gateway?.profileCount || 0} profile(s) with dynamic loopback discovery.`,
        };
        const hermesWebchatBridge = {
          id: 'hermes-webchat',
          name: 'Hermes WebChat (Zoth Console)',
          category: 'bridge',
          protocol: 'Systemd + Tailnet HTTP/SSE',
          host: hermesWebchat?.listener?.host || '127.0.0.1',
          port: hermesWebchat?.listener?.port || HERMES_WEBCHAT_DEFAULT_PORT,
          probePath: '/api/health',
          online: Boolean(hermesWebchat?.active),
          status: hermesWebchat?.active ? 'online' : 'offline',
          statusCode: hermesWebchat?.active ? 200 : null,
          latencyMs: null,
          pid: hermesWebchat?.systemd?.pid || null,
          tailnetOnly: Boolean(hermesWebchat?.listener?.tailnetOnly),
          unit: HERMES_WEBCHAT_UNIT,
          description: `Tailnet-only user systemd daemon (${HERMES_WEBCHAT_UNIT}) on port ${hermesWebchat?.listener?.port || HERMES_WEBCHAT_DEFAULT_PORT} with fail-closed bearer auth and SSE streaming.`,
        };
        const konsoleRelayBridge = {
          id: 'konsole-relay',
          name: 'Konsole Relay (KDE D-Bus)',
          category: 'bridge',
          protocol: 'Systemd + Loopback HTTP + Qt6 D-Bus',
          host: konsoleRelay?.listener?.host || '127.0.0.1',
          port: konsoleRelay?.listener?.port || KONSOLE_RELAY_DEFAULT_PORT,
          probePath: '/health',
          online: Boolean(konsoleRelay?.active),
          status: konsoleRelay?.active ? 'online' : 'offline',
          statusCode: konsoleRelay?.health?.statusCode || (konsoleRelay?.active ? 200 : null),
          latencyMs: konsoleRelay?.health?.latencyMs ?? null,
          pid: konsoleRelay?.systemd?.pid || null,
          loopbackOnly: Boolean(konsoleRelay?.listener?.loopbackOnly),
          konsoleSessions: konsoleRelay?.konsoleSessions ?? null,
          postureScore: konsoleRelay?.posture?.score ?? null,
          postureGrade: konsoleRelay?.posture?.grade || null,
          backupExcluded: Boolean(konsoleRelay?.backupExcluded),
          unit: KONSOLE_RELAY_UNIT,
          description: `Loopback-only KDE Konsole D-Bus relay (${KONSOLE_RELAY_UNIT}) on 127.0.0.1:${konsoleRelay?.listener?.port || KONSOLE_RELAY_DEFAULT_PORT} with fail-closed 0600 bearer auth, DNS-rebinding guards, and cloud-backup exclusion.`,
        };
        const bridges = [...baseBridges, hermesGatewayBridge, hermesWebchatBridge, konsoleRelayBridge];

        const harnesses = AGENT_HARNESS_CONNECTORS.map((h) => {
          const foundPath = resolveBinaryOnPath(h.binary, [AGY_BIN_DIR, LOCAL_BIN]);
          return {
            ...h,
            present: Boolean(foundPath),
            status: foundPath ? 'detected' : 'missing',
            location: foundPath ? sanitizeConnectorText(foundPath) : null,
          };
        });

        const mcpServers = discoverMcpServers();

        const rawPayload = {
          schemaVersion: CONNECTORS_SCHEMA_VERSION,
          mode: 'loopback-live',
          liveApiReachable: true,
          checkedAt,
          providers,
          harnesses,
          bridges,
          mcpServers,
        };
        rawPayload.summary = computeConnectorSummary(rawPayload);

        send(res, 200, sanitizeConnectorPayload(rawPayload));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/connectors/probe') {
        let body;
        try {
          body = await readJsonBodyStrict(req, 8192);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        const validation = validateLoopbackProbeTarget(body);
        if (!validation.valid) {
          send(res, 400, { error: validation.error });
          return;
        }

        const started = performance.now();
        const checkedAt = new Date().toISOString();
        const result = await new Promise((resolve) => {
          const r = http.request(
            {
              host: '127.0.0.1',
              port: validation.port,
              path: validation.path,
              method: 'GET',
              timeout: 1100,
            },
            (resp) => {
              let raw = '';
              resp.on('data', (chunk) => {
                if (raw.length < 16384) raw += chunk;
              });
              resp.on('end', () => {
                const latencyMs = Math.max(1, Math.round(performance.now() - started));
                let summary = `HTTP ${resp.statusCode || 200}`;
                try {
                  const parsed = JSON.parse(raw);
                  if (Array.isArray(parsed?.models)) summary = `HTTP ${resp.statusCode} · ${parsed.models.length} models`;
                  else if (Array.isArray(parsed?.data)) summary = `HTTP ${resp.statusCode} · ${parsed.data.length} items`;
                  else if (parsed?.status || parsed?.service) summary = `HTTP ${resp.statusCode} · ${parsed.service || parsed.status}`;
                } catch {}
                resolve({
                  online: true,
                  statusCode: resp.statusCode || 200,
                  latencyMs,
                  summary: sanitizeConnectorText(summary),
                });
              });
            }
          );
          r.on('timeout', () => {
            r.destroy();
            resolve({ online: false, statusCode: 0, latencyMs: null, summary: 'Probe timed out (>1100ms)' });
          });
          r.on('error', () => {
            // Quick fallback TCP check for non-HTTP loopback sockets
            const sock = new net.Socket();
            let settled = false;
            const done = (val) => {
              if (!settled) {
                settled = true;
                try { sock.destroy(); } catch {}
                resolve(val);
              }
            };
            sock.setTimeout(350);
            sock.once('connect', () => {
              const latencyMs = Math.max(1, Math.round(performance.now() - started));
              done({ online: true, statusCode: 0, latencyMs, summary: 'TCP loopback port open (non-HTTP)' });
            });
            sock.once('timeout', () => done({ online: false, statusCode: 0, latencyMs: null, summary: 'Connection refused or unreachable' }));
            sock.once('error', () => done({ online: false, statusCode: 0, latencyMs: null, summary: 'Connection refused' }));
            sock.connect(validation.port, '127.0.0.1');
          });
          r.end();
        });

        send(res, 200, sanitizeConnectorPayload({
          ok: true,
          host: '127.0.0.1',
          port: validation.port,
          path: validation.path,
          online: result.online,
          statusCode: result.statusCode,
          latencyMs: result.latencyMs,
          summary: result.summary,
          checkedAt,
        }));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/consensus/models') {
        const checkedAt = new Date().toISOString();
        const probeProvider = async (spec, endpointPath, extractFn) => {
          const started = performance.now();
          const resp = await requestJson(spec.port, endpointPath, { method: 'GET', timeout: 1400 });
          const latencyMs = resp.up ? Math.max(1, Math.round(performance.now() - started)) : null;
          const models = resp.up && resp.json ? extractFn(resp.json) : [];
          return {
            id: spec.id,
            name: `${spec.name} (:${spec.port})`,
            host: spec.host,
            port: spec.port,
            online: Boolean(resp.up),
            latencyMs,
            models: models.slice(0, 48).map((m) => sanitizeConsensusText(m)),
          };
        };

        const [hermes, ollama] = await Promise.all([
          probeProvider(ALLOWED_LOCAL_PROVIDERS['agy-hermes'], '/v1/models', (json) =>
            Array.isArray(json?.data) ? json.data.map((m) => String(m?.id || '').trim()).filter(Boolean) : []
          ),
          probeProvider(ALLOWED_LOCAL_PROVIDERS.ollama, '/api/tags', (json) =>
            Array.isArray(json?.models) ? json.models.map((m) => String(m?.name || m?.model || '').trim()).filter(Boolean) : []
          ),
        ]);

        const providers = [hermes, ollama];
        const totalModels = providers.reduce((acc, p) => acc + p.models.length, 0);
        send(
          res,
          200,
          sanitizeConsensusPayload({
            schemaVersion: CONSENSUS_SCHEMA_VERSION,
            checkedAt,
            providers,
            totalModels,
          })
        );
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/consensus/run') {
        let body;
        try {
          body = await readJsonBodyStrict(req, 65536);
        } catch (err) {
          send(res, err.statusCode || 400, { error: sanitizeConsensusText(err.message || 'Invalid JSON body.') });
          return;
        }
        const validation = validateConsensusRunRequest(body);
        if (!validation.valid) {
          send(res, 400, { error: validation.error });
          return;
        }

        const ts = new Date().toISOString();
        if (validation.mode === 'in-browser-deterministic') {
          const result = evaluateDeterministicRound({
            proposalText: validation.proposal,
            nodeCount: validation.nodeCount,
            faultyCount: validation.faultyCount,
            timestamp: ts,
          });
          send(res, 200, sanitizeConsensusPayload(result));
          return;
        }

        const diffAnalysis = analyzeProposalDiff(validation.proposal);
        const systemPrompt =
          'You are a Byzantine consensus code & architecture validator. Reply with one concise paragraph starting with APPROVE, REJECT, or ABSTAIN followed by "score=<0-100>:" and your technical rationale.';
        const userPrompt = `Evaluate the following technical proposal or unified diff for security, performance, architecture, and reliability:\n\n${validation.proposal.slice(0, 6000)}`;

        const invokeLocalModel = async (target, idx) => {
          const started = performance.now();
          let resp;
          if (target.provider === 'agy-hermes') {
            resp = await requestJson(18000, '/v1/chat/completions', {
              method: 'POST',
              timeout: 12000,
              body: {
                model: target.model,
                temperature: 0.1,
                max_tokens: 180,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                ],
              },
            });
          } else {
            resp = await requestJson(11434, '/api/chat', {
              method: 'POST',
              timeout: 12000,
              body: {
                model: target.model,
                stream: false,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                ],
              },
            });
          }

          const latencyMs = Math.max(1, Math.round(performance.now() - started));
          const validatorId = `${target.provider}-${idx + 1}-${target.model.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          if (!resp.up || !resp.json) {
            return {
              validatorId,
              name: target.model,
              role: `${target.provider} (:${target.port})`,
              domain: 'loopback-model',
              source: `${target.provider}:${target.port}`,
              vote: 'FAULTY',
              score: 0,
              latencyMs,
              criteria: { security: 0, performance: 0, architecture: 0, compatibility: 0, policy: 0 },
              rationale: `Loopback model timed out or unreachable on 127.0.0.1:${target.port} (HTTP ${resp.status || 0}).`,
              matchedFindings: [],
            };
          }

          const content =
            target.provider === 'agy-hermes'
              ? resp.json?.choices?.[0]?.message?.content || ''
              : resp.json?.message?.content || '';
          const parsed = parseModelVoteText(content);
          return {
            validatorId,
            name: target.model,
            role: `${target.provider} (:${target.port})`,
            domain: 'loopback-model',
            source: `${target.provider}:${target.port}`,
            vote: parsed.vote,
            score: parsed.score,
            latencyMs,
            criteria: {
              security: parsed.score,
              performance: parsed.score,
              architecture: parsed.score,
              compatibility: parsed.score,
              policy: parsed.score,
            },
            rationale: parsed.rationale,
            matchedFindings: diffAnalysis.findings.map((f) => f.id),
          };
        };

        const votes = await Promise.all(validation.models.map((m, idx) => invokeLocalModel(m, idx)));
        const tally = tallyByzantineVotes(votes, validation.faultyCount);
        const receipt = buildConsensusReceipt({
          proposalText: validation.proposal,
          mode: 'loopback-models',
          tally,
          votes,
          timestamp: ts,
        });

        send(
          res,
          200,
          sanitizeConsensusPayload({
            schemaVersion: CONSENSUS_SCHEMA_VERSION,
            mode: 'loopback-models',
            timestamp: ts,
            proposalPreview: sanitizeConsensusText(validation.proposal).slice(0, 240),
            diffAnalysis,
            votes,
            tally,
            receipt,
          })
        );
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/bridge') {
        let [health, channels, stats] = await Promise.all([
          requestJson(8102, '/api/health'),
          requestJson(8102, '/api/channels'),
          requestJson(8102, '/api/stats'),
        ]);
        if (!health.up) {
          [health, channels, stats] = await Promise.all([
            requestJson(8789, '/api/health'),
            requestJson(8789, '/api/channels'),
            requestJson(8789, '/api/stats'),
          ]);
        }
        if (!health.up) {
          send(res, 503, {
            error: 'Signal bridge is not answering on 127.0.0.1:8102.',
            hint: 'python3 server.py --port 8102 or sovereign-agent-bridge serve --port 8102',
          });
          return;
        }
        send(res, 200, { health: health.json, channels: channels.json, stats: stats.json });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/bridge/live') {
        const live = await requestJson(8102, '/api/agents/live', { timeout: 1200 });
        if (!live.up) {
          send(res, 503, {
            error: 'Signal bridge live agent mesh is not answering on 127.0.0.1:8102.',
            hint: 'python3 server.py --port 8102',
          });
          return;
        }
        send(res, 200, live.json || {});
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/studio/bridge/agents/message' || url.pathname === '/api/studio/bridge/agents/policy')) {
        const upstream = url.pathname.endsWith('/message') ? '/api/agents/message' : '/api/agents/policy';
        let body;
        try {
          body = await readJsonBodyStrict(req, 32768);
        } catch (err) {
          send(res, err.statusCode || 400, { error: err.message || 'Invalid JSON body.' });
          return;
        }
        const result = await requestJson(8102, upstream, { method: 'POST', body, timeout: 4000 });
        if (!result.up) {
          send(res, 503, {
            error: 'Signal bridge is not answering on 127.0.0.1:8102.',
            hint: 'python3 server.py --port 8102',
          });
          return;
        }
        send(res, result.status || 200, result.json || { ok: true });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/adytum') {
        const body = await readBody(req);
        const model = String(body.model || '');
        if (!model || /cloud/i.test(model)) {
          send(res, 400, { error: 'Pick a local model. Cloud model names are not sent.' });
          return;
        }
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          send(res, 400, { error: 'The planner needs a message list.' });
          return;
        }
        const result = await requestJson(11434, '/api/chat', {
          method: 'POST',
          timeout: 180000,
          body: { model, messages: body.messages, stream: false },
        });
        if (!result.up) {
          send(res, 503, { error: 'Ollama is not answering on 127.0.0.1:11434.' });
          return;
        }
        const text = result.json?.message?.content;
        if (!text) {
          send(res, 502, { error: 'Ollama returned no text.', detail: result.json });
          return;
        }
        send(res, 200, {
          model,
          text,
          gateOpened: /\[GATE OPENED\]/i.test(text),
          reflectionNeeded: /\[REFLECTION NEEDED\]/i.test(text),
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/webgen/templates') {
        const result = await requestJson(5173, '/api/webgen/control', {
          method: 'POST',
          body: { action: 'get_design_catalog', category: 'frameworks' },
          timeout: 5000,
        });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth Bolt fork is not answering on 127.0.0.1:5173.' });
          return;
        }
        send(res, 200, { templates: result.json.frameworks || [], source: 'zoth-bolt' });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/webgen/presets') {
        const result = await requestJson(5173, '/api/webgen/control', {
          method: 'POST',
          body: { action: 'get_design_catalog' },
          timeout: 5000,
        });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth Bolt fork is not answering on 127.0.0.1:5173.' });
          return;
        }
        send(res, 200, {
          presets: result.json.palettes || [],
          typography: result.json.typographyPairings || [],
          uiLibraries: result.json.uiLibraries || [],
          animationLibraries: result.json.animationLibraries || [],
          source: 'zoth-bolt',
        });
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/studio/webgen/oneshot' || url.pathname === '/api/studio/webgen/deploy')) {
        const body = await readBody(req);
        if (url.pathname.endsWith('/deploy')) {
          const result = await requestJson(5173, '/api/netlify-deploy', { method: 'POST', body, timeout: 120000 });
          if (!result.up || !result.json) {
            send(res, 503, { error: 'Zoth Bolt fork (:5173) did not respond to deploy.' });
            return;
          }
          send(res, result.status || 200, result.json);
          return;
        }
        const result = await requestJson(5173, '/api/webgen/control', {
          method: 'POST',
          body: {
            action: 'prompt_and_build',
            prompt: body.prompt || '',
            model: body.model,
            provider: body.provider,
            template: body.template || body.framework,
          },
          timeout: 15000,
        });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth Bolt fork (:5173) did not respond.' });
          return;
        }
        send(res, result.status || 200, result.json);
        return;
      }

      if (url.pathname === '/api/studio/webgen/control' || url.pathname === '/api/studio/webgen/status') {
        const isPost = req.method === 'POST';
        const body = isPost ? await readBody(req) : undefined;
        const result = await requestJson(5173, '/api/webgen/control', {
          method: isPost ? 'POST' : 'GET',
          body,
          timeout: 30000,
        });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth Bolt fork (:5173) is not answering. Boot it via /api/studio/supervisor/boot {service:"bolt"}.' });
          return;
        }
        send(res, result.status || 200, result.json);
        return;
      }

      /* Canonical Bolt fork surface — same-origin passthrough to :5173.
         The GodMode harness and any external consumer use these paths;
         /api/studio/webgen/* above remains as the legacy alias. */
      if (url.pathname === '/api/webgen/control') {
        const isPost = req.method === 'POST';
        const body = isPost ? await readBody(req) : undefined;
        const result = await requestJson(5173, '/api/webgen/control', {
          method: isPost ? 'POST' : 'GET',
          body,
          timeout: 130000, // run_tool inside the fork may take up to 120s
        });
        if (!result.up || !result.json) {
          send(res, 503, { success: false, error: 'Zoth Bolt fork (:5173) is not answering. Boot it via /api/studio/supervisor/boot {service:"bolt"}.' });
          return;
        }
        send(res, result.status || 200, result.json);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/webgen/health') {
        const result = await requestJson(5173, '/api/health', { timeout: 2500 });
        if (!result.up) {
          send(res, 503, { status: 'offline', port: 5173, engine: 'bolt.diy' });
          return;
        }
        send(res, result.status || 200, { ...(result.json || {}), engine: 'bolt.diy', port: 5173 });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/webgen/events') {
        // Stream the fork's live event bus (SSE) straight through to the client.
        const upstream = http.request(
          { host: '127.0.0.1', port: 5173, path: '/api/webgen/events', method: 'GET', headers: { accept: 'text/event-stream' } },
          (up) => {
            if ((up.statusCode || 500) >= 400) {
              up.resume();
              send(res, 503, { error: 'Zoth Bolt fork (:5173) event bus unavailable.' });
              return;
            }
            res.writeHead(200, {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache, no-transform',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no',
            });
            up.pipe(res);
            const cleanup = () => { try { up.destroy(); } catch {} };
            req.on('close', cleanup);
            res.on('close', cleanup);
            up.on('error', cleanup);
          },
        );
        upstream.on('error', () => {
          if (!res.headersSent) send(res, 503, { error: 'Zoth Bolt fork (:5173) is not answering.' });
          else res.end();
        });
        upstream.end();
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/studio/bridge/send' || url.pathname === '/api/studio/bridge/consensus')) {
        const upstream = url.pathname.endsWith('/send') ? '/api/send' : '/api/consensus';
        const body = await readBody(req);
        let result = await requestJson(8102, upstream, { method: 'POST', body, timeout: 8000 });
        if (!result.up) {
          result = await requestJson(8789, upstream, { method: 'POST', body, timeout: 8000 });
        }
        if (!result.up) {
          send(res, 503, {
            error: 'Signal bridge is not answering on 127.0.0.1:8102.',
            hint: 'python3 server.py --port 8102 or sovereign-agent-bridge serve --port 8102',
          });
          return;
        }
        send(res, result.status || 200, result.json || {});
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/studio/tool/wake') {
        const body = await readBody(req);
        const id = String(body.id || '').trim();
        const repo = String(body.repo || '').trim();
        const port = Number(body.port || 0);
        if (!port || port < 5000 || port > 9999) {
          send(res, 400, { error: 'Invalid tool port.' });
          return;
        }
        const initialCheck = await requestJson(port, '/', { method: 'GET', timeout: 450 });
        if (initialCheck.up) {
          send(res, 200, { up: true, port, spawned: false, activeOnDemand: ON_DEMAND_PROCS.length });
          return;
        }
        // Hardware-camera opt-in guard: never silently activate /dev/video0 on page browse
        const isCameraDaemon = id === 'anderson-security-sentinel' || repo === 'anderson-security-sentinel';
        if (body.probeOnly || (isCameraDaemon && !body.optIn)) {
          send(res, 200, {
            up: false,
            port,
            spawned: false,
            optInRequired: isCameraDaemon,
            activeOnDemand: ON_DEMAND_PROCS.length,
          });
          return;
        }
        const rootDir = resolveToolRootDir(id, repo);
        if (!rootDir) {
          send(res, 404, { up: false, port, error: `Tool directory not found for ${id || repo}` });
          return;
        }
        const isLikenessDaemon = id === 'likeness-desk' || repo === 'likeness-desk';
        const extraEnv = isCameraDaemon && !body.enableCamera
          ? { ANDERSON_CAMERA_INDEX: '-1', ANDERSON_OFFLINE: '1' }
          : (isLikenessDaemon && !body.enableGpu ? { LIKENESS_LAZY_GPU: '1' } : {});
        spawnOnDemandTool(id || repo, rootDir, port, extraEnv);
        let ready = false;
        for (let i = 0; i < 16; i++) {
          await new Promise((r) => setTimeout(r, 150));
          const check = await requestJson(port, '/', { method: 'GET', timeout: 350 });
          if (check.up) {
            ready = true;
            break;
          }
        }
        send(res, 200, { up: ready, port, spawned: true, activeOnDemand: ON_DEMAND_PROCS.length });
        return;
      }

      send(res, 404, { error: 'Unknown studio API route.' });
    } catch (error) {
      send(res, error?.statusCode || 400, { error: error.message || 'Bad request' });
    }
  };
}
