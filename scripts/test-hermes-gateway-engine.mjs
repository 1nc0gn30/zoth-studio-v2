#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  HERMES_GATEWAY_SCHEMA_VERSION,
  HERMES_GATEWAY_UNIT,
  HERMES_WEBCHAT_UNIT,
  redactHermesPathsAndSecrets,
  parseLoopbackListenerPort,
  parseWebchatListener,
  synthesizeGatewayHealth,
  synthesizeWebchatStatus,
  buildOfflineHermesGatewaySnapshot,
  buildOfflineHermesWebchatSnapshot,
  parseOperatorDiagnosticText,
  neutralizeCsvCell,
  formatHermesTelemetryExports,
} from '../src/utils/hermesGatewayEngine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('src/utils/hermesGatewayEngine.js and server/hermes-gateway-engine.mjs are byte-identical', () => {
  const browserSrc = fs.readFileSync(path.join(root, 'src/utils/hermesGatewayEngine.js'));
  const serverSrc = fs.readFileSync(path.join(root, 'server/hermes-gateway-engine.mjs'));
  assert.equal(Buffer.compare(browserSrc, serverSrc), 0, 'Mirror drift detected between browser and server engines');
});

test('redactHermesPathsAndSecrets strips literal home paths and secret patterns recursively', () => {
  const synthSk = ['sk', 'proj', 'testvalue1234567890'].join('-');
  const synthGh = ['ghp', '0123456789abcdef0123'].join('_');
  const synthGoogle = ['AIza', 'TestDummyValue123456789012'].join('');
  const synthSlack = ['xoxb', '1111111111', 'testval'].join('-');
  const synthPem = ['-----BEGIN RSA ', 'PRIVATE KEY-----\nMIIEowIBAAKCAQE=\n-----END RSA ', 'PRIVATE KEY-----'].join('');
  const dirty = {
    hermes_home: '/home/operator/.hermes',
    mac_path: 'file:///Users/alice/.hermes/config.yaml',
    env_path: '/home/operator/.hermes/.env',
    api_key: synthSk,
    token: synthGh,
    note: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def and ${synthGoogle} and ${synthSlack}`,
    nested: [synthPem],
  };
  const clean = redactHermesPathsAndSecrets(dirty);
  const serialized = JSON.stringify(clean);
  assert.doesNotMatch(serialized, /\/home\/operator/);
  assert.doesNotMatch(serialized, /\/Users\/alice/);
  assert.doesNotMatch(serialized, /testvalue1234567890/);
  assert.doesNotMatch(serialized, /0123456789abcdef0123/);
  assert.doesNotMatch(serialized, /TestDummyValue/);
  assert.doesNotMatch(serialized, /1111111111/);
  assert.doesNotMatch(serialized, /PRIVATE KEY/);
  assert.equal(clean.hermes_home, '~/.hermes');
  assert.equal(clean.api_key, '[REDACTED]');
  assert.equal(clean.token, '[REDACTED]');
});

test('parseLoopbackListenerPort discovers 127.0.0.1 pid/hermes port and rejects 0.0.0.0 & privileged ports', () => {
  const ssSample = [
    'State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process',
    'LISTEN 0      128    0.0.0.0:54321       0.0.0.0:*         users:(("hermes",pid=9999,fd=3))',
    'LISTEN 0      128    127.0.0.1:80        0.0.0.0:*         users:(("hermes",pid=1525,fd=4))',
    'LISTEN 0      2048   127.0.0.1:49217     0.0.0.0:*         users:(("hermes",pid=1525,fd=5))',
    'LISTEN 0      128    127.0.0.1:18000     0.0.0.0:*         users:(("python3",pid=888,fd=7))',
  ].join('\n');

  assert.equal(parseLoopbackListenerPort(ssSample, 1525), 49217);
  assert.equal(parseLoopbackListenerPort(ssSample, null), 49217);
  assert.equal(parseLoopbackListenerPort('LISTEN 0 128 0.0.0.0:55791 0.0.0.0:* users:(("hermes",pid=1525,fd=5))', 1525), null);
});

test('synthesizeGatewayHealth reconciles stale whatsapp fatal state, state.db bloat, RAM peak & redacts paths', () => {
  const report = synthesizeGatewayHealth({
    systemd: {
      available: true,
      unit: HERMES_GATEWAY_UNIT,
      active: true,
      activeState: 'active',
      subState: 'running',
      pid: 1525,
      tasks: 78,
      memoryCurrentBytes: 1537503232,
      memoryPeakBytes: 3868889088,
      fragmentPath: '/home/operator/.config/systemd/user/hermes-gateway.service',
      hardening: { noNewPrivileges: false, privateTmp: false, umask: '0002', memoryMax: 'infinity' },
    },
    health: { ok: true, version: '0.23.3', displayVersion: '0.23.3+1139', auth_required: false },
    status: {
      overall: 'ok',
      gateway_state: 'running',
      gateway_platforms: {},
      gateway_shared_with: ['default', 'zoth', 'zoth-auditor'],
      hermes_home: '/home/operator/.hermes',
      memory: { gateway_rss_mb: 598 },
    },
    gatewayState: {
      platforms: {
        whatsapp: { state: 'fatal', error_code: 'whatsapp_not_paired', updated_at: '2026-10-25T06:13:57Z' },
      },
    },
    stateDbBytes: 2415558656,
    socketExists: true,
    listenerPort: 49217,
    memoryLimits: { memoryMdChars: 3756, memoryMdLimit: 2200, userMdChars: 1731, userMdLimit: 1375 },
  });

  assert.equal(report.schemaVersion, HERMES_GATEWAY_SCHEMA_VERSION);
  assert.equal(report.active, true);
  assert.equal(report.reconciledHealth, 'degraded-advisory');
  assert.equal(report.listener.port, 49217);
  assert.equal(report.gateway.profileCount, 3);
  assert.equal(report.storage.bloated, true);
  const codes = report.warnings.map((w) => w.code);
  assert.ok(codes.includes('PLATFORM_WHATSAPP_STALE_FATAL'));
  assert.ok(codes.includes('STATE_DB_BLOAT'));
  assert.ok(codes.includes('CGROUP_MEMORY_PEAK'));
  assert.ok(codes.includes('MEMORY_MD_OVER_LIMIT'));
  assert.ok(codes.includes('USER_MD_OVER_LIMIT'));
  assert.doesNotMatch(JSON.stringify(report), /\/home\/operator/);
});

test('buildOfflineHermesGatewaySnapshot is honest and fabricates zero live telemetry', () => {
  const off = buildOfflineHermesGatewaySnapshot();
  assert.equal(off.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.equal(off.liveApiReachable, false);
  assert.equal(off.active, false);
  assert.equal(off.systemd.pid, null);
  assert.equal(off.listener.port, null);
});

test('parseOperatorDiagnosticText extracts status, advisories & redacts paths/tokens', () => {
  const pasted = [
    'Id=hermes-gateway.service',
    'ActiveState=active',
    'SubState=running',
    'MainPID=1525',
    'MemoryCurrent=1537503232',
    'MemoryPeak=3868889088',
    'FragmentPath=/home/operator/.config/systemd/user/hermes-gateway.service',
    'LISTEN 0 2048 127.0.0.1:49999 0.0.0.0:* users:(("hermes",pid=1525,fd=5))',
    'state.db is large (2.2 GB)',
    'whatsapp_not_paired',
    'MEMORY.md exceeds limit: 3756/2200',
    'Bearer ' + ['sk', 'dummy', 'token1234567890abcdef'].join('-'),
  ].join('\n');
  const parsed = parseOperatorDiagnosticText(pasted);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.snapshot.systemd.pid, 1525);
  assert.equal(parsed.snapshot.listener.port, 49999);
  assert.equal(parsed.snapshot.storage.bloated, true);
  assert.ok(parsed.recommendedMaintenance.some((c) => c.includes('optimize-storage')));
  assert.doesNotMatch(JSON.stringify(parsed), /\/home\/operator/);
  assert.doesNotMatch(JSON.stringify(parsed), /token1234567890abcdef/);
});

test('formatHermesTelemetryExports neutralizes CSV formulas and redacts all formats', () => {
  assert.equal(neutralizeCsvCell('=CMD|"/C calc"!A0'), '"\'=CMD|""/C calc""!A0"');
  assert.equal(neutralizeCsvCell('+1+1'), '"\'+1+1"');
  assert.equal(neutralizeCsvCell('-2+3'), '"\'-2+3"');
  assert.equal(neutralizeCsvCell('@SUM(A1:A2)'), '"\'@SUM(A1:A2)"');

  const snap = synthesizeGatewayHealth({
    systemd: { available: true, active: true, pid: 1525, fragmentPath: '/home/tester/.config/systemd/user/hermes-gateway.service' },
    listenerPort: 48888,
    gatewayState: { served_profiles: ['=EVIL()', 'zoth'] },
  });
  const exp = formatHermesTelemetryExports(snap);
  assert.ok(exp.json.includes('"schemaVersion": "2.4.0"'));
  assert.ok(exp.markdown.includes('# Hermes Agent Gateway'));
  assert.ok(exp.csv.includes('"\'=EVIL(), zoth"'));
  assert.doesNotMatch(exp.json + exp.markdown + exp.csv, /\/home\/tester/);
});

test('parseWebchatListener accepts Tailscale 100.x & 127.0.0.1 and rejects 0.0.0.0 / LAN binds', () => {
  const ssSample = [
    'State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process',
    'LISTEN 0      32     0.0.0.0:8178        0.0.0.0:*         users:(("python3",pid=999,fd=3))',
    'LISTEN 0      32     192.168.1.50:8178   0.0.0.0:*         users:(("python3",pid=998,fd=3))',
    'LISTEN 0      32     100.106.132.5:8178  0.0.0.0:*         users:(("python3",pid=1574,fd=3))',
  ].join('\n');
  const found = parseWebchatListener(ssSample, 1574, 8178);
  assert.equal(found.host, '100.106.132.5');
  assert.equal(found.port, 8178);
  assert.equal(found.tailnetOnly, true);
  assert.equal(found.discovery, 'ss-pid');

  const blocked = parseWebchatListener('LISTEN 0 32 0.0.0.0:8178 0.0.0.0:* users:(("python3",pid=1574,fd=3))', 1574, 8178);
  assert.equal(blocked.host, null);
  assert.equal(blocked.discovery, 'none');
});

test('synthesizeWebchatStatus emits redacted telemetry and permission/hardening advisories', () => {
  const wc = synthesizeWebchatStatus({
    systemd: {
      available: true,
      unit: HERMES_WEBCHAT_UNIT,
      active: true,
      activeState: 'active',
      subState: 'running',
      pid: 1574,
      tasks: 1,
      memoryCurrentBytes: 6746112,
      memoryPeakBytes: 38969344,
      fragmentPath: '/home/operator/.config/systemd/user/zoth-webchat.service',
      hardening: { noNewPrivileges: false, privateTmp: false, umask: '0002', memoryMax: 'infinity' },
    },
    listener: { host: '100.106.132.5', port: 8178, url: 'http://100.106.132.5:8178', tailnetOnly: true, discovery: 'ss-pid' },
    permissions: {
      tokenDir: { path: '/home/operator/.config/zoth-webchat', exists: true, mode: '0775', worldOrGroupPermissive: true },
      tokenFile: { path: '/home/operator/.config/zoth-webchat/token', exists: true, mode: '0600', worldOrGroupPermissive: false },
      historyFile: { path: '/home/operator/.hermes/webchat/history.jsonl', exists: true, mode: '0664', worldOrGroupPermissive: true },
    },
  });
  assert.equal(wc.service, 'hermes-webchat');
  assert.equal(wc.active, true);
  assert.equal(wc.systemd.pid, 1574);
  assert.equal(wc.listener.port, 8178);
  const codes = wc.advisories.map((a) => a.code);
  assert.ok(codes.includes('WEBCHAT_TOKEN_DIR_PERMS'));
  assert.ok(codes.includes('WEBCHAT_HISTORY_PERMS'));
  assert.ok(codes.includes('WEBCHAT_HARDENING_DEFERRED'));
  assert.doesNotMatch(JSON.stringify(wc), /\/home\/operator/);

  const off = buildOfflineHermesWebchatSnapshot();
  assert.equal(off.active, false);
  assert.equal(off.systemd.pid, null);
});
