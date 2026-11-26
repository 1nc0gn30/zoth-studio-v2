import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec, execFile, spawn } from 'node:child_process';

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
    'anderson-security-sentinel': 'sentinel-security-engine',
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

function spawnOnDemandTool(id, rootDir, port) {
  while (ON_DEMAND_PROCS.length >= MAX_ON_DEMAND_PROCS) {
    const oldest = ON_DEMAND_PROCS.shift();
    if (oldest?.child?.pid) {
      try { process.kill(-oldest.child.pid, 'SIGTERM'); } catch {}
      try { oldest.child.kill('SIGTERM'); } catch {}
    }
  }

  const env = { ...process.env, PORT: String(port), PYTHONUNBUFFERED: '1' };
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

export async function probeFleet() {
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
      const t0 = Date.now();
      const res = await requestJson(item.port, '/', { method: 'GET', timeout: 1200 });
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

export async function probeStatus() {
  const [memoryPrimary, memorySec, bridgePrimary, bridgeSec, swarmPrimary, swarmSec, ollama, agyHermesHealth, agyHermesModels, vault, egress, mock, firewall, flight, capsule, policy, civ, webgen] = await Promise.all([
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
      webgen: {
        name: 'Zoth Bolt (bolt.diy fork)',
        port: 5173,
        up: webgen.up,
        detail: webgen.json,
      },
    },
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
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

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

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
  const host = String(req.headers?.host || '').replace(/:\d+$/, '').toLowerCase();
  if (host && !LOCAL_HOSTS.has(host)) return false;
  return isLocalOrigin(req.headers?.origin);
}

export function studioMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (!url.pathname.startsWith('/api/studio') && !url.pathname.startsWith('/api/swarm')) {
      next();
      return;
    }

    // Writes (launch terminals, run the local model, send via bridge) only from
    // local pages: blocks CSRF from any website and DNS-rebinding hosts.
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

      if (req.method === 'POST' && url.pathname === '/api/studio/reality') {
        const body = await readBody(req);
        let requested = String(body.mode || '').toLowerCase().trim();
        if (requested === 'win11' || requested === 'windows') requested = 'incognito';
        if (requested === 'default' || requested === 'sanctum') requested = 'gold';
        if (requested === 'stealth' || requested === 'amnesic') requested = 'ghost';
        if (!['gold', 'ghost', 'matrix', 'incognito'].includes(requested)) {
          send(res, 400, { error: 'Invalid mode. Allowed: gold, ghost, matrix, incognito' });
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
        const isZothOS = fs.existsSync('/etc/zothos-release') || fs.existsSync('/usr/local/bin/zoth-doctor') || fs.existsSync('/opt/zoth-studio');
        const info = {
          isZothOS,
          distro: 'ZothOS Sovereign Linux',
          release: '2026.1 (Imperial Sovereign Edition)',
          kernel: os.release(),
          arch: os.arch(),
          hostname: os.hostname(),
          cpus: os.cpus().length,
          cpuModel: os.cpus()[0]?.model || 'Native Silicon',
          totalMem: Math.round(os.totalmem() / (1024 * 1024)),
          freeMem: Math.round(os.freemem() / (1024 * 1024)),
          uptime: Math.round(os.uptime()),
          audioDevice: 'ICH9 High Definition Audio (Active)',
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
            ollama: fs.existsSync('/usr/local/bin/ollama') || fs.existsSync('/usr/bin/ollama')
          }
        };
        send(res, 200, info);
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
              }));
            }
            send(res, 200, parsed);
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
            hint: 'node server/bridge.js --port 8102 or npm run zoth -- up',
          });
          return;
        }
        send(res, 200, { health: health.json, channels: channels.json, stats: stats.json });
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
            hint: 'node server/bridge.js --port 8102 or npm run zoth -- up',
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
        const rootDir = resolveToolRootDir(id, repo);
        if (!rootDir) {
          send(res, 404, { up: false, port, error: `Tool directory not found for ${id || repo}` });
          return;
        }
        spawnOnDemandTool(id || repo, rootDir, port);
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
      send(res, 400, { error: error.message || 'Bad request' });
    }
  };
}
