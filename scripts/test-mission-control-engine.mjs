import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MISSION_CONTROL_SCHEMA_VERSION,
  MISSION_PRESETS,
  redactMissionControlText,
  redactMissionControlPayload,
  sanitizeCsvCell,
  sha256Hex,
  computeLatencyPercentiles,
  evaluatePbftQuorum,
  normalizeFleetSnapshot,
  normalizeCoreDaemons,
  buildMissionControlSnapshot,
  buildOfflineMissionControlSnapshot,
  planMissionDag,
  formatMissionControlExports,
} from '../src/utils/missionControlEngine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('src/utils/missionControlEngine.js and server/mission-control-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(ROOT, 'src/utils/missionControlEngine.js'));
  const serverBytes = fs.readFileSync(path.join(ROOT, 'server/mission-control-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Engine mirror drifted from browser module');
  assert.equal(MISSION_CONTROL_SCHEMA_VERSION, '2.5.0');
});

test('pure engine contains zero eval, new Function, or Math.random', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/utils/missionControlEngine.js'), 'utf8');
  assert.doesNotMatch(src, /\beval\s*\(/);
  assert.doesNotMatch(src, /\bnew\s+Function\s*\(/);
  assert.doesNotMatch(src, /\bMath\.random\s*\(/);
});

test('FIPS 180-4 SHA-256 matches NIST test vectors', () => {
  assert.equal(sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('redactMissionControlText & Payload strip literal home paths and token shapes', () => {
  const dirty = 'Unit /home/operator/.config/systemd/user/hermes.service token=supersecret123456 Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig ghp_1234567890abcdef123456';
  const clean = redactMissionControlText(dirty);
  assert.doesNotMatch(clean, /\/home\/operator/);
  assert.match(clean, /~\/\.config\/systemd\/user\/hermes\.service/);
  assert.doesNotMatch(clean, /supersecret123456/);
  assert.doesNotMatch(clean, /ghp_1234567890abcdef123456/);

  const obj = redactMissionControlPayload({
    path: '/home/tester/NullAITech/zoth-studio-v2',
    token: 'plain-secret-value',
    nested: [{ note: 'sk-abcdef1234567890abcd' }],
  });
  assert.equal(obj.path, '~/NullAITech/zoth-studio-v2');
  assert.equal(obj.token, '[REDACTED]');
  assert.doesNotMatch(obj.nested[0].note, /sk-abcdef/);
});

test('sanitizeCsvCell neutralizes spreadsheet formula prefixes and redacts home paths', () => {
  assert.equal(sanitizeCsvCell('=CMD("calc")'), `"'=CMD(""calc"")"`);
  assert.equal(sanitizeCsvCell('+1+2'), `"'` + `+1+2"`);
  assert.equal(sanitizeCsvCell('-SUM(A1)'), `"'-SUM(A1)"`);
  assert.equal(sanitizeCsvCell('@SUM(A1)'), `"'@SUM(A1)"`);
  assert.equal(sanitizeCsvCell('/home/alice/secrets.txt'), `"~/secrets.txt"`);
});

test('computeLatencyPercentiles computes deterministic min/p50/p95/max/avg', () => {
  const stats = computeLatencyPercentiles([40, 10, 20, 30, 100, 50, 60, 70, 80, 90]);
  assert.equal(stats.count, 10);
  assert.equal(stats.min, 10);
  assert.equal(stats.p50, 50);
  assert.equal(stats.p95, 100);
  assert.equal(stats.max, 100);
  assert.equal(stats.avg, 55);
  assert.deepEqual(computeLatencyPercentiles([]), { count: 0, min: 0, p50: 0, p95: 0, max: 0, avg: 0 });
});

test('evaluatePbftQuorum enforces N >= 3f + 1 and Q = 2f + 1 bounds', () => {
  const safe = evaluatePbftQuorum(7, 2, 5);
  assert.equal(safe.quorumSafe, true);
  assert.equal(safe.quorumRequired, 5);
  assert.equal(safe.fMax, 2);
  assert.equal(safe.liveMeetsQuorum, true);

  const unsafe = evaluatePbftQuorum(6, 2, 6);
  assert.equal(unsafe.quorumSafe, false);
  assert.equal(unsafe.liveMeetsQuorum, false);

  const degraded = evaluatePbftQuorum(7, 2, 4);
  assert.equal(degraded.quorumSafe, true);
  assert.equal(degraded.liveMeetsQuorum, false);
});

test('normalizeFleetSnapshot aggregates categories, live/dark counts, and RTT percentiles', () => {
  const norm = normalizeFleetSnapshot({
    fleet: [
      { port: 3000, id: 'studio', name: 'Studio', category: 'Hub', isCore: true, up: true, latencyMs: 12 },
      { port: 8094, id: 'memory', name: 'Memory', category: 'Core', isCore: true, up: true, latencyMs: 44 },
      { port: 8141, id: 'swarm', name: 'Swarm', category: 'Core', isCore: false, up: false, latencyMs: 0 },
    ],
  });
  assert.equal(norm.total, 3);
  assert.equal(norm.live, 2);
  assert.equal(norm.dark, 1);
  assert.equal(norm.availabilityPct, 66.7);
  assert.equal(norm.latency.p50, 12);
  assert.equal(norm.latency.p95, 44);
  assert.equal(norm.categories.length, 2);
});

test('normalizeCoreDaemons counts live and dark services and preserves KVM status', () => {
  const norm = normalizeCoreDaemons({
    kvm: true,
    services: {
      memory: { name: 'Neuro-Memory', port: 8094, up: true },
      swarm: { name: 'Swarm', port: 8989, up: false },
    },
  });
  assert.equal(norm.kvm, true);
  assert.equal(norm.total, 2);
  assert.equal(norm.live, 1);
  assert.equal(norm.dark, 1);
});

test('buildOfflineMissionControlSnapshot reports honest BROWSER_OFFLINE_FALLBACK with zero fake live ports', () => {
  const snap = buildOfflineMissionControlSnapshot('2026-11-28T06:00:00.000Z');
  assert.equal(snap.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.equal(snap.liveApiReachable, false);
  assert.equal(snap.summary.livePorts, 0);
  assert.equal(snap.summary.healthState, 'offline-fallback');
  assert.match(snap.receiptSha256, /^[0-9a-f]{64}$/);
  assert.ok(snap.triage.some((i) => i.id === 'mc-offline-fallback'));
});

test('buildMissionControlSnapshot aggregates all 4 sources, ranks incidents, and redacts paths', () => {
  const snap = buildMissionControlSnapshot({
    fleet: {
      fleet: [
        { port: 3000, id: 'studio', name: 'Studio', category: 'Hub', isCore: true, up: true, latencyMs: 8 },
        { port: 8094, id: 'memory', name: 'Memory', category: 'Core', isCore: true, up: true, latencyMs: 320 },
      ],
    },
    status: {
      kvm: true,
      services: {
        memory: { name: 'Neuro-Memory', port: 8094, up: true },
        bridge: { name: 'Signal Bridge', port: 8102, up: false },
      },
    },
    hermes: {
      liveApiReachable: true,
      active: true,
      systemd: { pid: 1525 },
      warnings: [{ code: 'STATE_DB_BLOAT', severity: 'warning', title: 'state.db large', detail: '/home/operator/.hermes/state.db is 2.2 GiB' }],
      webchat: { active: true, systemd: { pid: 1574 }, advisories: [] },
    },
    konsoleRelay: { active: true, systemd: { pid: 1528 }, posture: { tokenHardened: true } },
    checkedAt: '2026-11-28T06:00:00.000Z',
    mode: 'LIVE_LOOPBACK',
  });
  assert.equal(snap.mode, 'LIVE_LOOPBACK');
  assert.equal(snap.summary.hermesGatewayPid, 1525);
  assert.equal(snap.summary.konsoleRelayPid, 1528);
  assert.ok(snap.triage.some((t) => t.id === 'daemon-down-bridge'));
  assert.ok(snap.triage.some((t) => t.id === 'hermes-STATE_DB_BLOAT'));
  assert.ok(snap.triage.some((t) => t.id === 'slow-port-8094'));
  assert.doesNotMatch(JSON.stringify(snap), /\/home\/operator/);
});

test('planMissionDag schedules Kahn waves, critical path, and live fleet readiness deterministically', () => {
  const preset = MISSION_PRESETS[0];
  const fleetPorts = [
    { port: 3000, up: true, latencyMs: 5 },
    { port: 8094, up: true, latencyMs: 9 },
    { port: 8102, up: true, latencyMs: 7 },
    { port: 8797, up: true, latencyMs: 4 },
    { port: 8178, up: true, latencyMs: 0 },
  ];
  const planA = planMissionDag(preset, { fleetPorts, mode: 'LIVE_LOOPBACK' });
  const planB = planMissionDag(preset, { fleetPorts, mode: 'LIVE_LOOPBACK' });
  assert.equal(planA.ok, true);
  assert.equal(planA.hasCycle, false);
  assert.equal(planA.waveCount, 4);
  assert.equal(planA.readinessScore, 100);
  assert.equal(planA.criticalPathMs, 600); // 120 + 180 + 210 + 90
  assert.deepEqual(planA.criticalPathStageIds, ['hub-check', 'memory-check', 'hermes-check', 'dossier-seal']);
  assert.equal(planA.receiptSha256, planB.receiptSha256);
});

test('planMissionDag rejects cycles, self-loops, unknown dependencies, and empty stage lists', () => {
  const cyc = planMissionDag({
    name: 'Cyclic DAG',
    stages: [
      { id: 'a', dependsOn: ['b'], estimatedMs: 100 },
      { id: 'b', dependsOn: ['a'], estimatedMs: 100 },
    ],
  });
  assert.equal(cyc.ok, false);
  assert.equal(cyc.hasCycle, true);
  assert.deepEqual(cyc.cycleNodes, ['a', 'b']);

  const selfLoop = planMissionDag({
    name: 'Self Loop',
    stages: [{ id: 'a', dependsOn: ['a'], estimatedMs: 50 }],
  });
  assert.equal(selfLoop.ok, false);
  assert.equal(selfLoop.hasCycle, true);

  const missingDep = planMissionDag({
    name: 'Missing Dep',
    stages: [{ id: 'a', dependsOn: ['ghost'], estimatedMs: 50 }],
  });
  assert.equal(missingDep.ok, false);
  assert.match(missingDep.error, /unknown stage/);

  const empty = planMissionDag({ name: 'Empty', stages: [] });
  assert.equal(empty.ok, false);
});

test('formatMissionControlExports emits formula-safe CSV, Markdown, YAML, JSON, and 64-hex SHA-256 receipt', () => {
  const snap = buildMissionControlSnapshot({
    fleet: {
      fleet: [
        { port: 3000, id: '=BAD', name: '+Evil /home/operator/file', category: 'Hub', isCore: true, up: true, latencyMs: 6 },
      ],
    },
    status: { kvm: true, services: {} },
    mode: 'LIVE_LOOPBACK',
  });
  const plan = planMissionDag(MISSION_PRESETS[1], { fleetPorts: snap.fleet.ports, mode: 'LIVE_LOOPBACK' });
  const exp = formatMissionControlExports(snap, plan);

  assert.match(exp.receiptSha256, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(exp.json, /\/home\/operator/);
  assert.doesNotMatch(exp.markdown, /\/home\/operator/);
  assert.doesNotMatch(exp.csv, /\/home\/operator/);
  assert.doesNotMatch(exp.yaml, /\/home\/operator/);
  assert.match(exp.csv, /"'=BAD"/);
  assert.match(exp.csv, /"'\+Evil ~\/file"/);
  assert.match(exp.yaml, /planReceiptSha256:/);
  assert.match(exp.markdown, /Snapshot SHA-256 Receipt:/);
});
