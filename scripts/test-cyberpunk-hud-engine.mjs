import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CYBERPUNK_HUD_SCHEMA_VERSION,
  redactHomePaths,
  redactPayload,
  sha256Hex,
  computeShannonEntropy,
  computeLatencyPercentiles,
  buildCyberpunkHudSnapshot,
  buildBrowserOfflineTelemetry,
  neutralizeCsvCell,
  exportHudJson,
  exportHudMarkdown,
  exportHudCsv,
} from '../src/utils/cyberpunkHudEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('src/utils/cyberpunkHudEngine.js and server/cyberpunk-hud-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(rootDir, 'src/utils/cyberpunkHudEngine.js'));
  const serverBytes = fs.readFileSync(path.join(rootDir, 'server/cyberpunk-hud-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Client and server cyberpunkHudEngine must be byte-identical');
  assert.equal(CYBERPUNK_HUD_SCHEMA_VERSION, '2.3.0');
});

test('computeShannonEntropy produces exact Shannon bounds (0.0, 1.0, 8.0 bits/byte)', () => {
  const zero = computeShannonEntropy('AAAA');
  assert.equal(zero.entropyBitsPerByte, 0);
  assert.equal(zero.uniqueSymbols, 1);
  assert.equal(zero.efficiencyPct, 0);
  assert.equal(zero.tier, 'STRUCTURED_TEXT');

  const binary = computeShannonEntropy('01');
  assert.equal(binary.entropyBitsPerByte, 1);
  assert.equal(binary.uniqueSymbols, 2);
  assert.equal(binary.efficiencyPct, 12.5);

  const uniform256 = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) uniform256[i] = i;
  const maxEnt = computeShannonEntropy(uniform256);
  assert.equal(maxEnt.byteLength, 256);
  assert.equal(maxEnt.uniqueSymbols, 256);
  assert.equal(maxEnt.entropyBitsPerByte, 8);
  assert.equal(maxEnt.efficiencyPct, 100);
  assert.equal(maxEnt.tier, 'HIGH_ENTROPY_ANOMALY');

  const empty = computeShannonEntropy('');
  assert.equal(empty.byteLength, 0);
  assert.equal(empty.entropyBitsPerByte, 0);
  assert.equal(empty.tier, 'EMPTY_FRAME');
});

test('sha256Hex matches FIPS 180-4 NIST test vectors deterministically', () => {
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
});

test('computeLatencyPercentiles calculates exact sorted p50/p95/max percentiles', () => {
  const stats = computeLatencyPercentiles([42, 3, 12, 8, 100, 1, 5, 19, 2, 15]);
  assert.equal(stats.count, 10);
  assert.equal(stats.min, 1);
  assert.equal(stats.p50, 8);
  assert.equal(stats.p95, 100);
  assert.equal(stats.max, 100);
  assert.equal(stats.avg, 20.7);

  const empty = computeLatencyPercentiles([]);
  assert.equal(empty.count, 0);
  assert.equal(empty.p50, 0);
  assert.equal(empty.p95, 0);
  assert.equal(empty.max, 0);
});

test('redactHomePaths & buildCyberpunkHudSnapshot redact /home/<user> and produce deterministic LIVE_HOST_TELEMETRY', () => {
  const fakeHome = '/home/operator/NullAITech/zoth-studio-v2';
  const cleaned = redactHomePaths(`Log path ${fakeHome} and file:///home/operator/.config`);
  assert.ok(!cleaned.includes('/home/operator'), 'Must redact /home/operator');
  assert.ok(cleaned.includes('~/NullAITech/zoth-studio-v2'));
  assert.ok(cleaned.includes('~/.config'));

  const snap = buildCyberpunkHudSnapshot({
    timestamp: '2026-11-26T19:30:00.000Z',
    host: {
      isZothOS: true,
      distro: 'ZothOS Sovereign Linux',
      kernel: '6.12.111-amd64',
      arch: 'x64',
      hostname: 'node-01',
      cpus: 12,
      cpuModel: 'Xeon E-2176M',
      cpuPct: 31.4,
      loadavg: [2.1, 1.8, 1.5],
      totalMem: 32000,
      freeMem: 16000,
      uptime: 7200,
      disk: { mount: '/', totalGiB: 400, usedGiB: 200, freeGiB: 200 },
      thermalZones: [
        { name: 'thermal_zone0', type: 'acpitz', tempC: 42 },
        { name: 'thermal_zone1', type: 'x86_pkg_temp', tempC: 64 },
      ],
      gpu: { name: 'Quadro P1000', tempC: 51, utilizationPct: 12, memoryUsedMiB: 512, memoryTotalMiB: 4096 },
      audio: { subsystem: 'PipeWire', device: 'Built-in Audio', detected: true },
    },
    status: {
      kvm: true,
      services: {
        memory: { name: 'Neuro-Memory', port: 8094, up: true },
        ollama: { name: 'Ollama', port: 11434, up: true, models: ['qwen2.5:1.5b'] },
      },
    },
    fleet: {
      fleet: [
        { port: 3000, id: 'studio', name: 'Zoth Studio', category: 'Core', up: true, latencyMs: 2, statusCode: 200 },
        { port: 8094, id: 'memory', name: 'Memory /home/operator/db', category: 'Core', up: true, latencyMs: 7, statusCode: 200 },
        { port: 9999, id: 'dark', name: 'Offline Worker', category: 'Tool', up: false, latencyMs: 0, statusCode: 0 },
      ],
    },
  });

  assert.equal(snap.version, '2.3.0');
  assert.equal(snap.mode, 'LIVE_HOST_TELEMETRY');
  assert.equal(snap.host.thermal.minTempC, 42);
  assert.equal(snap.host.thermal.avgTempC, 53);
  assert.equal(snap.host.thermal.maxTempC, 64);
  assert.equal(snap.fleet.live, 2);
  assert.equal(snap.fleet.dark, 1);
  assert.equal(snap.fleet.total, 3);
  assert.equal(snap.fleet.latencyStats.p50, 2);
  assert.equal(snap.fleet.latencyStats.p95, 7);
  assert.match(snap.frameReceipt.sha256, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(snap).includes('/home/operator'), 'Snapshot JSON must have 0 /home/ leaks');
});

test('buildBrowserOfflineTelemetry returns honest BROWSER_OFFLINE_FALLBACK with zero fabricated host sensors', () => {
  const offline = buildBrowserOfflineTelemetry(
    { hardwareConcurrency: 8, deviceMemory: 16, onLine: true, language: 'en-US', platform: 'Linux x86_64' },
    { now: () => 1234.56 },
    { width: 1440, height: 900, colorDepth: 24 }
  );
  assert.equal(offline.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.equal(offline.host, null);
  assert.equal(offline.browser.hardwareConcurrency, 8);
  assert.equal(offline.browser.deviceMemoryGiB, 16);
  assert.equal(offline.browser.screenResolution, '1440x900');
  assert.equal(offline.fleet.total, 0);
  assert.ok(offline.entropy.entropyBitsPerByte > 0);
  assert.match(offline.frameReceipt.sha256, /^[0-9a-f]{64}$/);
});

test('neutralizeCsvCell and exporters prevent CSV formula injection and redact paths', () => {
  assert.equal(neutralizeCsvCell('=CMD()'), "'=CMD()");
  assert.equal(neutralizeCsvCell('+1+1'), "'+1+1");
  assert.equal(neutralizeCsvCell('-SUM(A1:A2)'), "'-SUM(A1:A2)");
  assert.equal(neutralizeCsvCell('@HYPERLINK("x")'), `"'@HYPERLINK(""x"")"`);

  const snap = buildCyberpunkHudSnapshot({
    fleet: {
      fleet: [
        { port: 8080, id: '=BAD', name: '=CMD() /home/alice/key', category: '+CAT', up: true, latencyMs: 4, statusCode: 200 },
      ],
    },
  });
  const csv = exportHudCsv(snap);
  assert.ok(csv.includes("'=BAD"), 'CSV must neutralize leading = in id');
  assert.ok(csv.includes("'=CMD() ~/key"), 'CSV must neutralize formula and redact /home/ path');
  assert.ok(!csv.includes('/home/alice'), 'CSV must have zero /home/ leaks');

  const md = exportHudMarkdown(snap);
  assert.ok(md.includes('Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform'));
  assert.ok(!md.includes('/home/alice'));

  const jsonStr = exportHudJson(snap);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.version, '2.3.0');
  assert.ok(!jsonStr.includes('/home/alice'));
});
