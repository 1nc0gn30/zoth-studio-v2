#!/usr/bin/env node
/**
 * Zoth CLI. Ships with this repo.
 *   npm run zoth -- <command>
 * Pulls published Zoth tools and starts the
 * memory daemon and signal bridge from those checkouts.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { microTools } from '../src/data/toolsData.js';
import { pantheonAgents } from '../src/data/pantheon.js';
import { probeStatus } from '../server/studio-api.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateDir = path.join(root, '.zoth');
const pidFile = path.join(stateDir, 'pids.json');

const GOLD = '\x1b[38;2;212;175;55m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function banner() {
  console.log(`\n${GOLD}${BOLD}Zoth CLI${RESET}  studio root ${GRAY}${root}${RESET}\n`);
}

function toolDir(repo) {
  const candidates = [
    path.join(process.cwd(), 'tools', repo),
    path.join(root, 'tools', repo),
    path.join(root, '..', 'zoth-tools', repo),
    path.join(root, '..', repo),
  ];
  return candidates.find((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory()) || null;
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

function readPids() {
  try {
    return JSON.parse(fs.readFileSync(pidFile, 'utf8'));
  } catch {
    return {};
  }
}

function writePids(pids) {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(pidFile, JSON.stringify(pids, null, 2));
}

function alive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function handleDoctor() {
  banner();
  const status = await probeStatus();
  const rows = Object.values(status.services);
  for (const service of rows) {
    const mark = service.up ? `${GREEN}up${RESET}` : `${RED}down${RESET}`;
    const extra = service.models ? `  local models: ${service.models.length}` : '';
    console.log(`  ${mark}  ${service.name.padEnd(24)} 127.0.0.1:${service.port}${extra}`);
  }
  console.log(`  ${status.kvm ? GREEN + 'yes' : RED + 'no'}${RESET}  /dev/kvm`);
  console.log(`\n${BOLD}Published tool checkouts${RESET}`);
  for (const tool of microTools) {
    const dir = toolDir(tool.repo);
    const where = dir ? path.relative(root, dir) : 'not checked out';
    const pub = tool.published ? '' : ` ${GRAY}(no GitHub repo)${RESET}`;
    console.log(`  ${dir ? GREEN + '●' : GRAY + '○'}${RESET} ${tool.repo.padEnd(32)} ${where}${pub}`);
  }
  console.log(`\n${GRAY}Roster on disk: ${pantheonAgents.length} named pantheon roles. That list is not a live process table.${RESET}`);
}

async function handlePull(name, { all = false } = {}) {
  banner();
  const selected = all
    ? microTools.filter((tool) => tool.published)
    : microTools.filter((tool) => tool.repo === name || tool.id === name);
  if (!all && selected.length === 0) {
    const known = microTools.find((tool) => tool.repo === name || tool.id === name);
    if (known && !known.published) {
      console.log(`${RED}✖ ${known.repo} is in the catalog but is not a published repository.${RESET}`);
    } else {
      console.log(`${RED}✖ Unknown tool "${name || ''}".${RESET} Run ${CYAN}npm run zoth -- list${RESET}`);
    }
    process.exitCode = 1;
    return;
  }

  let failed = 0;
  for (const tool of selected) {
    const dest = path.join(root, 'tools', tool.repo);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(path.join(dest, '.git'))) {
      console.log(`${CYAN}updating${RESET} ${tool.repo}`);
      const code = await run('git', ['-C', dest, 'pull', '--ff-only'], {});
      if (code !== 0) failed += 1;
      continue;
    }
    if (fs.existsSync(dest)) {
      console.log(`${RED}✖ ${dest} exists and is not a git checkout. Refusing to overwrite it.${RESET}`);
      failed += 1;
      continue;
    }
    console.log(`${CYAN}cloning${RESET} ${tool.repo}`);
    const code = await run('git', ['clone', '--depth', '1', `${tool.github}.git`, dest]);
    if (code !== 0) {
      failed += 1;
      fs.rmSync(dest, { recursive: true, force: true });
    }
  }
  if (failed) {
    console.log(`\n${RED}✖ ${failed} pull${failed === 1 ? '' : 's'} failed.${RESET}`);
    process.exitCode = 1;
  } else {
    console.log(`\n${GREEN}✔ Pull finished.${RESET}`);
  }
}

function spawnDaemon(id, command, args, cwd) {
  const logPath = path.join(stateDir, `${id}.log`);
  fs.mkdirSync(stateDir, { recursive: true });
  const log = fs.openSync(logPath, 'a');
  const child = spawn(command, args, {
    cwd,
    detached: true,
    stdio: ['ignore', log, log],
    env: { ...process.env, PYTHONPATH: 'src' },
  });
  child.unref();
  fs.closeSync(log);
  return { pid: child.pid, log: logPath };
}

async function handleUp() {
  banner();
  const before = await probeStatus();
  const pids = readPids();

  const memoryDir = toolDir('neuro-memory-daemon');
  const bridgeDir = toolDir('sovereign-agent-bridge');

  if (!before.services.memory.up) {
    if (!memoryDir) {
      console.log(`${RED}✖ neuro-memory-daemon is not checked out.${RESET} Run ${CYAN}npm run zoth -- pull neuro-memory-daemon${RESET}`);
    } else {
      const started = spawnDaemon(
        'memory',
        'python3',
        ['-m', 'neuro_memory_daemon', 'serve', '-H', '127.0.0.1', '-p', '8788'],
        memoryDir
      );
      pids.memory = started;
      console.log(`${GREEN}✔ memory${RESET} pid ${started.pid}  log ${path.relative(root, started.log)}`);
    }
  } else {
    console.log(`${GREEN}✔ memory${RESET} already listening on 127.0.0.1:8788`);
  }

  if (!before.services.bridge.up) {
    if (!bridgeDir) {
      console.log(`${RED}✖ sovereign-agent-bridge is not checked out.${RESET} Run ${CYAN}npm run zoth -- pull sovereign-agent-bridge${RESET}`);
    } else {
      const started = spawnDaemon(
        'bridge',
        'python3',
        ['-m', 'sovereign_agent_bridge', 'serve', '--host', '127.0.0.1', '--port', '8789'],
        bridgeDir
      );
      pids.bridge = started;
      console.log(`${GREEN}✔ bridge${RESET} pid ${started.pid}  log ${path.relative(root, started.log)}`);
    }
  } else {
    console.log(`${GREEN}✔ bridge${RESET} already listening on 127.0.0.1:8789`);
  }

  if (before.services.vault.up) {
    console.log(`${GREEN}✔ vault${RESET} already listening on 127.0.0.1:8787`);
  } else {
    console.log(`${GRAY}○ vault${RESET} is not running. This repo does not ship the vault binary. Start zoth-vault-daemon --port 8787 yourself if you have it.`);
  }

  if (before.services.ollama.up) {
    console.log(`${GREEN}✔ ollama${RESET} ${before.services.ollama.models.length} local model${before.services.ollama.models.length === 1 ? '' : 's'}`);
  } else {
    console.log(`${GRAY}○ ollama${RESET} is not answering on 127.0.0.1:11434`);
  }

  writePids(pids);
  console.log(`\n${BOLD}UI${RESET}  ${CYAN}npm run dev${RESET}  →  http://127.0.0.1:3000/`);
  console.log(`${GRAY}Give the daemons a second, then run npm run zoth -- doctor.${RESET}`);
}

function handleDown() {
  banner();
  const pids = readPids();
  for (const [name, record] of Object.entries(pids)) {
    if (!record?.pid) continue;
    if (!alive(record.pid)) {
      console.log(`${GRAY}○ ${name} pid ${record.pid} is already gone${RESET}`);
      continue;
    }
    process.kill(record.pid, 'SIGTERM');
    console.log(`${GREEN}✔ stopped ${name}${RESET} pid ${record.pid}`);
  }
  writePids({});
}

function handleList() {
  banner();
  microTools.forEach((tool, index) => {
    const dir = toolDir(tool.repo);
    const mark = dir ? `${GREEN}local${RESET}` : `${GRAY}absent${RESET}`;
    const source = tool.published ? `${GREEN}published${RESET}` : `${RED}not published${RESET}`;
    console.log(`${String(index + 1).padStart(2, ' ')}. ${BOLD}${tool.name}${RESET}  ${CYAN}${tool.repo}${RESET}  v${tool.version}`);
    console.log(`    ${mark}  ${source}`);
  });
}

function handleSwarm() {
  banner();
  console.log(`${BOLD}Documented pantheon roster (${pantheonAgents.length})${RESET}`);
  console.log(`${GRAY}Names and roles from the legacy agent index. No load or task counts are invented here.${RESET}\n`);
  for (const agent of pantheonAgents) {
    console.log(`  ${GOLD}${agent.id.padEnd(16)}${RESET} ${agent.cadre.padEnd(12)} ${agent.role}`);
  }
}

function handleHelp() {
  banner();
  console.log(`${BOLD}Commands${RESET}`);
  console.log(`  ${GOLD}npm run zoth -- doctor${RESET}          Probe loopback services and local checkouts`);
  console.log(`  ${GOLD}npm run zoth -- list${RESET}            Catalog, with published GitHub URLs`);
  console.log(`  ${GOLD}npm run zoth -- pull <repo>${RESET}     Clone or fast-forward one published tool into ./tools`);
  console.log(`  ${GOLD}npm run zoth -- pull --all${RESET}      Clone every published tool`);
  console.log(`  ${GOLD}npm run zoth -- up${RESET}              Start memory (:8788) and bridge (:8789) if checked out`);
  console.log(`  ${GOLD}npm run zoth -- down${RESET}            Stop processes this CLI started`);
  console.log(`  ${GOLD}npm run zoth -- swarm${RESET}           Print the pantheon roster`);
  console.log(`  ${GOLD}npm run dev${RESET}                     Studio UI on http://127.0.0.1:3000/`);
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

if (command === 'doctor' || command === 'status') {
  await handleDoctor();
} else if (command === 'pull') {
  await handlePull(args.includes('--all') ? null : args[1], { all: args.includes('--all') });
} else if (command === 'up') {
  await handleUp();
} else if (command === 'down') {
  handleDown();
} else if (command === 'list' || command === 'tools') {
  handleList();
} else if (command === 'swarm') {
  handleSwarm();
} else if (command === 'init') {
  fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });
  console.log(`${GREEN}✔ ./tools and ./.zoth are ready.${RESET} Next: ${CYAN}npm run zoth -- pull --all${RESET}`);
} else {
  handleHelp();
}
