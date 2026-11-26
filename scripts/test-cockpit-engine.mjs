import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  COCKPIT_SCHEMA_VERSION,
  DEFAULT_OPERATOR_ACTIONS,
  sanitizeCockpitText,
  sanitizeCockpitPayload,
  classifyThermalState,
  formatUptimeSeconds,
  normalizeHostTelemetry,
  normalizeFleetData,
  filterFleetServices,
  buildCommandPaletteEntries,
  matchCommandPalette,
  buildOfflineBrowserSnapshot,
  neutralizeCsvCell,
  buildCockpitJsonSnapshot,
  buildCockpitMarkdownReport,
  buildCockpitCsvReport,
} from '../src/utils/cockpitEngine.js';
import { microTools } from '../src/data/toolsData.js';
import { workstations } from '../src/data/workstations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const FAKE_HOME = '/home/operator/';
const FAKE_FILE_HOME = 'file:///home/operator/';

test('cockpitEngine.js and server/cockpit-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(rootDir, 'src/utils/cockpitEngine.js'));
  const serverBytes = fs.readFileSync(path.join(rootDir, 'server/cockpit-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Client and server Cockpit engines must stay byte-identical');
  assert.equal(COCKPIT_SCHEMA_VERSION, '2.3.0');
});

test('sanitizeCockpitText & sanitizeCockpitPayload redact /home/, /Users/, file:///home/, control chars, and secret shapes', () => {
  const synthKey = ['sk', '-', 'x'.repeat(24)].join('');
  const dirty = `Path ${FAKE_HOME}NullAITech/zoth-studio-v2 and ${FAKE_FILE_HOME}.config and /Users/alice/dev\x00 token ${synthKey}`;
  const clean = sanitizeCockpitText(dirty);
  assert.ok(!clean.includes(FAKE_HOME), 'Must redact /home/<user>/');
  assert.ok(!clean.includes('file:///home/'), 'Must redact file:///home/');
  assert.ok(!clean.includes('/Users/alice/'), 'Must redact /Users/<user>/');
  assert.ok(!clean.includes('\x00'), 'Must strip NUL bytes');
  assert.ok(!clean.includes(synthKey), 'Must scrub API keys');
  assert.ok(clean.includes('~/NullAITech/zoth-studio-v2'));
  assert.ok(clean.includes('[REDACTED_SECRET]'));

  const nested = sanitizeCockpitPayload({
    host: { note: `Loaded from ${FAKE_HOME}scripts/run.sh`, list: [`${FAKE_FILE_HOME}vault`] },
  });
  assert.equal(nested.host.note, 'Loaded from ~/scripts/run.sh');
  assert.equal(nested.host.list[0], '~/vault');
});

test('normalizeHostTelemetry normalizes CPU, loadavg, RAM, root disk, thermal zones, GPU, and honest audio', () => {
  const host = normalizeHostTelemetry({
    isZothOS: true,
    distro: 'ZothOS Sovereign Linux',
    release: '2026.1',
    kernel: '6.12.111+deb13-amd64',
    arch: 'x64',
    hostname: 'zoth-node',
    cpus: 12,
    cpuModel: 'Intel(R) Xeon(R) E-2176M CPU @ 2.70GHz',
    cpuPct: 24.6,
    loadavg: [1.8, 1.4, 1.1],
    totalMem: 31717,
    freeMem: 10566,
    uptime: 93720,
    disk: { mount: '/', totalGiB: 424.04, usedGiB: 281.25, freeGiB: 142.79 },
    thermalZones: [
      { name: 'thermal_zone0', type: 'acpitz', tempC: 48.0 },
      { name: 'thermal_zone1', type: 'x86_pkg_temp', tempC: 67.5 },
      { name: 'thermal_zone_bad', type: 'invalid', tempC: 999 },
    ],
    gpu: { name: 'Quadro P1000', tempC: 49, utilizationPct: 4, memoryUsedMiB: 471, memoryTotalMiB: 4096 },
    audio: { subsystem: 'PipeWire / WirePlumber', device: 'HDA Intel PCH', detected: true },
    installedTools: { ollama: true, hermes: true, claude: false },
  });

  assert.equal(host.cpu.cores, 12);
  assert.equal(host.cpu.pct, 24.6);
  assert.deepEqual(host.cpu.loadavg, [1.8, 1.4, 1.1]);
  assert.equal(host.memory.usedMiB, 21151);
  assert.equal(host.memory.usedPct, 66.7);
  assert.equal(host.disk.usedPct, 66.3);
  assert.equal(host.thermal.zones.length, 2);
  assert.equal(host.thermal.maxTempC, 67.5);
  assert.equal(host.thermal.state, 'WARM');
  assert.equal(host.gpu.name, 'Quadro P1000');
  assert.equal(host.gpu.memoryPct, 11.5);
  assert.equal(host.audio.subsystem, 'PipeWire / WirePlumber');
  assert.equal(host.uptimeFormatted, formatUptimeSeconds(93720));
  assert.equal(classifyThermalState(50), 'COOL');
  assert.equal(classifyThermalState(70), 'WARM');
  assert.equal(classifyThermalState(88), 'HOT');
  assert.equal(classifyThermalState(null), 'UNKNOWN');
});

test('normalizeFleetData and filterFleetServices classify and filter LIVE/DARK/category/search cleanly', () => {
  const fleet = normalizeFleetData({
    checkedAt: '2026-11-26T18:50:00Z',
    fleet: [
      { port: 3000, name: 'Zoth Studio UI', category: 'Hub & Studio', isCore: true, up: true, latencyMs: 3, statusCode: 200 },
      { port: 8094, name: 'Neuro-Memory Studio UI', category: 'Core Synaptic', isCore: true, up: true, latencyMs: 6, statusCode: 200 },
      { port: 8989, id: 'swarm-mux', name: 'Swarm Multiplexer', category: 'Swarm & Consensus', isCore: false, up: false, latencyMs: 0, statusCode: 0 },
    ],
  });

  assert.equal(fleet.total, 3);
  assert.equal(fleet.live, 2);
  assert.equal(fleet.dark, 1);
  assert.equal(fleet.healthPct, 66.7);
  assert.equal(fleet.categories.length, 3);

  assert.equal(filterFleetServices(fleet.services, { status: 'LIVE' }).length, 2);
  assert.equal(filterFleetServices(fleet.services, { status: 'DARK' }).length, 1);
  assert.equal(filterFleetServices(fleet.services, { category: 'Core Synaptic' }).length, 1);
  assert.equal(filterFleetServices(fleet.services, { query: '8094' })[0].port, 8094);
});

test('Command Palette indexes all 85 tools, 45 workstations, and operator actions with fuzzy matching', () => {
  assert.equal(microTools.length, 85);
  assert.equal(workstations.length, 45);
  const entries = buildCommandPaletteEntries(microTools, workstations, DEFAULT_OPERATOR_ACTIONS);
  assert.equal(entries.length, 85 + 45 + DEFAULT_OPERATOR_ACTIONS.length);

  const exactCockpit = matchCommandPalette(entries, 'cockpit', { kind: 'workstation' });
  assert.ok(exactCockpit.length > 0);
  assert.equal(exactCockpit[0].id, 'cockpit');

  const portMatch = matchCommandPalette(entries, '8094');
  assert.ok(portMatch.some((m) => m.port === 8094));

  const fuzzyMatch = matchCommandPalette(entries, 'chrncl');
  assert.ok(fuzzyMatch.some((m) => m.id.includes('chronicle')));
});

test('buildOfflineBrowserSnapshot provides honest browser fallback without fabricating host metrics', () => {
  const snap = buildOfflineBrowserSnapshot({
    navigator: { hardwareConcurrency: 8, deviceMemory: 16, platform: 'Linux x86_64', language: 'en-US', onLine: true },
    screen: { width: 1440, height: 900, colorDepth: 24 },
    timezone: 'America/New_York',
  });
  assert.equal(snap.mode, 'browser-fallback');
  assert.equal(snap.host, null);
  assert.equal(snap.browser.cores, 8);
  assert.equal(snap.browser.deviceMemoryGiB, 16);
  assert.equal(snap.browser.timezone, 'America/New_York');
});

test('JSON, Markdown, and CSV exporters redact home paths and neutralize spreadsheet formula injection', () => {
  assert.equal(neutralizeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"` );
  assert.equal(neutralizeCsvCell('+1+2'), "'+1+2");
  assert.equal(neutralizeCsvCell('-10'), "'-10");
  assert.equal(neutralizeCsvCell('@SUM(A1:A2)'), "'@SUM(A1:A2)");
  assert.equal(neutralizeCsvCell('\tINJECT'), "'\tINJECT");
  assert.equal(neutralizeCsvCell('\rINJECT'), `"'\rINJECT"`);

  const csv = buildCockpitCsvReport([
    {
      port: 3000,
      id: '=EVIL()',
      name: `Studio at ${FAKE_HOME}zoth`,
      category: '+Core',
      status: 'LIVE',
      latencyMs: 2,
      statusCode: 200,
      executionType: '-daemon',
      isCore: true,
    },
  ]);
  assert.ok(csv.includes("'=EVIL()"));
  assert.ok(csv.includes("'+Core"));
  assert.ok(csv.includes("'-daemon"));
  assert.ok(!csv.includes(FAKE_HOME));

  const snap = {
    schemaVersion: COCKPIT_SCHEMA_VERSION,
    mode: 'loopback-live',
    checkedAt: '2026-11-26T18:55:00Z',
    reality: { mode: 'gold' },
    host: normalizeHostTelemetry({
      distro: `ZothOS at ${FAKE_HOME}build`,
      cpus: 12,
      cpuPct: 12.5,
      loadavg: [1.1, 0.9, 0.7],
      totalMem: 32000,
      freeMem: 16000,
      disk: { mount: '/', totalGiB: 500, usedGiB: 250, freeGiB: 250 },
    }),
    fleet: normalizeFleetData({
      fleet: [{ port: 3000, name: 'Zoth Studio UI', category: 'Hub & Studio', isCore: true, up: true, latencyMs: 2 }],
    }),
  };

  const jsonStr = buildCockpitJsonSnapshot(snap);
  assert.ok(!jsonStr.includes(FAKE_HOME));
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.schemaVersion, '2.3.0');

  const md = buildCockpitMarkdownReport(snap);
  assert.ok(md.includes('# The Cockpit // Sovereign Operator Diagnostic Snapshot'));
  assert.ok(md.includes('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform'));
  assert.ok(!md.includes(FAKE_HOME));
});
