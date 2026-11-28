import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  KONSOLE_RELAY_SCHEMA_VERSION,
  KONSOLE_RELAY_UNIT,
  KONSOLE_RELAY_DEFAULT_PORT,
  KONSOLE_RELAY_CLI_PRESETS,
  redactKonsoleRelayText,
  redactKonsoleRelayPaths,
  parseKonsoleRelayListener,
  scoreKonsoleRelayPosture,
  synthesizeMaintenanceChecklist,
  synthesizeKonsoleRelayStatus,
  buildOfflineKonsoleRelaySnapshot,
} from '../src/utils/konsoleRelayEngine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('1. src/utils/konsoleRelayEngine.js and server/konsole-relay-engine.mjs are byte-identical', () => {
  const srcBytes = fs.readFileSync(path.join(ROOT, 'src/utils/konsoleRelayEngine.js'));
  const srvBytes = fs.readFileSync(path.join(ROOT, 'server/konsole-relay-engine.mjs'));
  assert.equal(Buffer.compare(srcBytes, srvBytes), 0, 'Client and server konsole-relay engines must be byte-identical');
});

test('2. schema metadata and safe read-only CLI presets', () => {
  assert.equal(KONSOLE_RELAY_SCHEMA_VERSION, '2.1.0');
  assert.equal(KONSOLE_RELAY_UNIT, 'konsole-relay.service');
  assert.equal(KONSOLE_RELAY_DEFAULT_PORT, 8797);
  assert.ok(KONSOLE_RELAY_CLI_PRESETS.length >= 4);
  for (const p of KONSOLE_RELAY_CLI_PRESETS) {
    assert.equal(p.readOnly, true);
    assert.ok(!/POST|send|restart|stop|kill/i.test(p.command));
  }
});

test('3. redactKonsoleRelayText and redactKonsoleRelayPaths strip /home/<user> and secrets', () => {
  const fakeBearer = 'Bearer ' + 'z'.repeat(36);
  const raw = `/home/operator/.config/konsole-relay/token ${fakeBearer} password=mysecret`;
  const clean = redactKonsoleRelayText(raw);
  assert.ok(!clean.includes('/home/operator'));
  assert.ok(clean.includes('~/.config/konsole-relay/token'));
  assert.ok(!clean.includes('z'.repeat(36)));
  assert.ok(!clean.includes('mysecret'));
  assert.ok(clean.includes('[REDACTED]'));

  const nested = redactKonsoleRelayPaths({ a: ['/home/alice/x', { b: '/Users/bob/y' }] });
  assert.equal(nested.a[0], '~/x');
  assert.equal(nested.a[1].b, '~/y');
});

test('4. parseKonsoleRelayListener detects strictly loopback 127.0.0.1:8797 by PID', () => {
  const ss = [
    'State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process',
    'LISTEN 0      32     127.0.0.1:8797     0.0.0.0:*         users:(("python3",pid=1528,fd=3))',
  ].join('\n');
  const parsed = parseKonsoleRelayListener(ss, 1528, 8797);
  assert.equal(parsed.host, '127.0.0.1');
  assert.equal(parsed.port, 8797);
  assert.equal(parsed.loopbackOnly, true);
  assert.equal(parsed.wildcardExposed, false);
  assert.equal(parsed.discovery, 'ss-pid');
});

test('5. parseKonsoleRelayListener flags wildcard 0.0.0.0 exposure', () => {
  const ss = 'LISTEN 0 5 0.0.0.0:8797 0.0.0.0:* users:(("python3",pid=999,fd=3))';
  const parsed = parseKonsoleRelayListener(ss, 999, 8797);
  assert.equal(parsed.loopbackOnly, false);
  assert.equal(parsed.wildcardExposed, true);
});

test('6. scoreKonsoleRelayPosture awards 100/A when fully hardened and excluded from cloud backup', () => {
  const posture = scoreKonsoleRelayPosture({
    systemd: {
      active: true,
      hardening: { noNewPrivileges: true, privateTmp: true, umask: '0077', memoryMax: '128M' },
    },
    listener: { host: '127.0.0.1', port: 8797, loopbackOnly: true, wildcardExposed: false },
    health: { ok: true, statusCode: 200 },
    permissions: {
      confDir: { exists: true, mode: '0700' },
      tokenFile: { exists: true, mode: '0600', size: 43 },
      auditFile: { exists: true, mode: '0600', size: 730 },
    },
    backupExcluded: true,
  });
  assert.equal(posture.score, 100);
  assert.equal(posture.grade, 'A');
  assert.equal(posture.advisories.length, 0);
});

test('7. scoreKonsoleRelayPosture surfaces maintenance-window advisory on live unhardened unit', () => {
  const posture = scoreKonsoleRelayPosture({
    systemd: {
      active: true,
      hardening: { noNewPrivileges: false, privateTmp: false, umask: '0002', memoryMax: 'infinity' },
    },
    listener: { host: '127.0.0.1', port: 8797, loopbackOnly: true, wildcardExposed: false },
    health: { ok: true, statusCode: 200 },
    permissions: {
      confDir: { exists: true, mode: '0700' },
      tokenFile: { exists: true, mode: '0600', size: 43 },
      auditFile: { exists: true, mode: '0600', size: 730 },
    },
    backupExcluded: true,
  });
  assert.equal(posture.score, 85);
  assert.equal(posture.grade, 'B');
  assert.ok(posture.advisories.some((a) => a.code === 'MAINTENANCE_WINDOW_CUTOVER'));
  const checklist = synthesizeMaintenanceChecklist(posture);
  assert.equal(checklist.pendingCutover, true);
  assert.equal(checklist.steps.length, 5);
});

test('8. scoreKonsoleRelayPosture flags cloud backup leak when backupExcluded is false', () => {
  const posture = scoreKonsoleRelayPosture({
    systemd: { active: true, hardening: {} },
    listener: { host: '127.0.0.1', port: 8797, loopbackOnly: true, wildcardExposed: false },
    health: { ok: true, statusCode: 200 },
    permissions: {
      confDir: { exists: true, mode: '0700' },
      tokenFile: { exists: true, mode: '0600', size: 43 },
      auditFile: { exists: true, mode: '0600', size: 730 },
    },
    backupExcluded: false,
  });
  assert.ok(posture.advisories.some((a) => a.code === 'CLOUD_BACKUP_LEAK'));
});

test('9. synthesizeKonsoleRelayStatus redacts fragmentPath and builds readOnly schema', () => {
  const snap = synthesizeKonsoleRelayStatus({
    systemd: {
      available: true,
      active: true,
      activeState: 'active',
      subState: 'running',
      pid: 1528,
      memoryCurrentBytes: 5 * 1024 * 1024,
      fragmentPath: '/home/operator/.config/systemd/user/konsole-relay.service',
      hardening: { noNewPrivileges: false, privateTmp: false, umask: '0002', memoryMax: 'infinity' },
    },
    listener: { host: '127.0.0.1', port: 8797, url: 'http://127.0.0.1:8797', loopbackOnly: true, wildcardExposed: false },
    health: { ok: true, statusCode: 200, latencyMs: 3 },
    permissions: {
      confDir: { path: '~/.config/konsole-relay', exists: true, mode: '0700', size: 4096 },
      tokenFile: { path: '~/.config/konsole-relay/token', exists: true, mode: '0600', size: 43 },
      auditFile: { path: '~/.config/konsole-relay/audit.log', exists: true, mode: '0600', size: 730 },
    },
    backupExcluded: true,
    konsoleSessions: 7,
  });
  assert.equal(snap.readOnly, true);
  assert.equal(snap.active, true);
  assert.equal(snap.konsoleSessions, 7);
  assert.equal(snap.systemd.memoryCurrentMb, 5);
  assert.ok(!JSON.stringify(snap).includes('/home/operator'));
  assert.ok(snap.posture.checks.some((c) => c.label === 'Bearer Token Mode (0600, stat-only)'));
  assert.ok(snap.maintenanceChecklist.steps[4].command.includes('/home/.config/konsole-relay'));
});

test('10. buildOfflineKonsoleRelaySnapshot produces honest offline fallback with zero leaks', () => {
  const off = buildOfflineKonsoleRelaySnapshot();
  assert.equal(off.mode, 'offline-fallback');
  assert.equal(off.readOnly, true);
  assert.equal(off.active, false);
  assert.equal(off.port, 8797);
  assert.ok(!/\/home\/[a-z0-9_-]+\//i.test(JSON.stringify(off)));
});
