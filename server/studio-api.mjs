import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const STUDIO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOME_DIR = process.env.ZOTH_HOME || os.homedir();
const NULLAITECH_ROOT = process.env.NULLAITECH_ROOT || path.join(HOME_DIR, 'NullAITech');
const LOCAL_BIN = process.env.ZOTH_LOCAL_BIN || path.join(HOME_DIR, '.local', 'bin');
const GROK_BIN_DIR = process.env.ZOTH_GROK_BIN_DIR || path.join(HOME_DIR, '.grok', 'bin');
const CONDUCTOR_BIN = process.env.ZOTH_CONDUCTOR_BIN || path.join(NULLAITECH_ROOT, 'bin', 'zoth-agent-conductor');

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
  const [memoryPrimary, memorySec, bridgePrimary, bridgeSec, swarmPrimary, swarmSec, ollama, vault, egress, mock, firewall, flight, capsule, policy, civ, webgen] = await Promise.all([
    requestJson(8094, '/health'),
    requestJson(8788, '/health'),
    requestJson(8102, '/api/health'),
    requestJson(8789, '/api/health'),
    requestJson(8989, '/status'),
    requestJson(8790, '/status'),
    requestJson(11434, '/api/tags'),
    requestJson(8787, '/health'),
    requestJson(8095, '/api/stats'),
    requestJson(8097, '/api/stats'),
    requestJson(8098, '/api/stats'),
    requestJson(8104, '/api/stats'),
    requestJson(8105, '/api/stats'),
    requestJson(8106, '/api/stats'),
    requestJson(9393, '/api/status', { timeout: 1000 }),
    requestJson(8092, '/api/status', { timeout: 700 }),
  ]);

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
        name: 'Zoth WebGen Foundry (One-Shot + Netlify)',
        port: 8092,
        up: webgen.up,
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

      if (req.method === 'GET' && url.pathname === '/api/studio/agent/triad') {
        exec(`${shellQuote(CONDUCTOR_BIN)} agents --json`, { timeout: 6000 }, (err, stdout) => {
          if (err) {
            send(res, 500, { error: err.message });
            return;
          }
          try {
            send(res, 200, JSON.parse(stdout));
          } catch {
            send(res, 200, { raw: stdout });
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
        const dryRunFlag = body.dryRun ? '--dry-run' : '';
        const safePrompt = JSON.stringify(promptText);
        const safeDir = JSON.stringify(dirPath);
        exec(`${shellQuote(CONDUCTOR_BIN)} dispatch --engine ${engine} --model ${modelName} --dir ${safeDir} ${dryRunFlag} --json ${safePrompt}`, { timeout: 95000 }, (err, stdout, stderr) => {
          try {
            send(res, 200, JSON.parse(stdout));
          } catch {
            send(res, 200, {
              success: !err,
              engine,
              output: stdout || stderr || (err ? err.message : ''),
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
          webgen: `cd ${shellQuote(path.join(NULLAITECH_ROOT, 'zoth-webgen'))} && nohup python3 server.py --port 8092 >/tmp/zoth-webgen-supervisor.log 2>&1 &`,
          daemons: `${shellQuote(CONDUCTOR_BIN)} up >/tmp/zoth-daemons-supervisor.log 2>&1 && nohup node ${shellQuote(path.join(STUDIO_ROOT, 'bin', 'zoth.js'))} up >>/tmp/zoth-daemons-supervisor.log 2>&1 &`,
        };
        if (!bootMap[target]) {
          send(res, 400, { error: `Unknown service "${target}". Allowed: civilization, webgen, daemons.` });
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
        const result = await requestJson(8092, '/api/production-templates', { timeout: 4000 });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth WebGen Foundry daemon is not answering on 127.0.0.1:8092.' });
          return;
        }
        send(res, 200, result.json);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/studio/webgen/presets') {
        const qs = url.search || '';
        const result = await requestJson(8092, `/api/presets${qs}`, { timeout: 4000 });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth WebGen Foundry daemon is not answering on 127.0.0.1:8092.' });
          return;
        }
        send(res, 200, result.json);
        return;
      }

      if (req.method === 'POST' && (url.pathname === '/api/studio/webgen/oneshot' || url.pathname === '/api/studio/webgen/deploy')) {
        const body = await readBody(req);
        const upstream = url.pathname.endsWith('/deploy') ? '/api/deploy' : '/api/oneshot';
        const result = await requestJson(8092, upstream, { method: 'POST', body, timeout: 60000 });
        if (!result.up || !result.json) {
          send(res, 503, { error: 'Zoth WebGen Foundry daemon (:8092) did not respond in time.' });
          return;
        }
        send(res, result.status || 200, result.json);
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

      send(res, 404, { error: 'Unknown studio API route.' });
    } catch (error) {
      send(res, 400, { error: error.message || 'Bad request' });
    }
  };
}
