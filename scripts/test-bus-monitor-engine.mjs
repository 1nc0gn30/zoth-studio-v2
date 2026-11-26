#!/usr/bin/env node
/**
 * Unit, Security & Parity Test Suite for Zoth Swarm NOC & Signal Bridge Engine (v2.3.0)
 * Run: node --test scripts/test-bus-monitor-engine.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  BUS_MONITOR_VERSION,
  LOOPBACK_BUS_TARGETS,
  isLoopbackHostString,
  validateLoopbackPort,
  classifyProbeStatus,
  computeLatencyStats,
  normalizeBridgeChannels,
  inspectEnvelopeStructure,
  signHmacSha256Envelope,
  verifyHmacSha256Envelope,
  escapeCsvCell,
  exportBusReportJson,
  exportBusReportCsv,
  exportBusReportMarkdown,
} from '../src/utils/busMonitorEngine.js';

import { isLocalHost, isLocalRequest } from '../server/studio-api.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

test('src/utils/busMonitorEngine.js and server/bus-monitor-engine.mjs stay byte-identical', () => {
  const srcBuf = fs.readFileSync(path.join(root, 'src/utils/busMonitorEngine.js'));
  const srvBuf = fs.readFileSync(path.join(root, 'server/bus-monitor-engine.mjs'));
  assert.equal(sha256(srcBuf), sha256(srvBuf));
  assert.equal(BUS_MONITOR_VERSION, '2.3.0');
});

test('LOOPBACK_BUS_TARGETS has 12 unique targets with unique ports and unique 3-char codes', () => {
  assert.equal(LOOPBACK_BUS_TARGETS.length, 12);
  const ids = new Set(LOOPBACK_BUS_TARGETS.map((t) => t.id));
  const ports = new Set(LOOPBACK_BUS_TARGETS.map((t) => t.port));
  const codes = new Set(LOOPBACK_BUS_TARGETS.map((t) => t.code));
  assert.equal(ids.size, 12);
  assert.equal(ports.size, 12);
  assert.equal(codes.size, 12);
  for (const t of LOOPBACK_BUS_TARGETS) {
    assert.ok(t.port >= 1024 && t.port <= 65535);
    assert.ok(t.code.length >= 3 && t.code.length <= 4);
  }
});

test('validateLoopbackPort strictly rejects SSRF hosts, metadata IPs, URLs, and invalid ports', () => {
  assert.equal(validateLoopbackPort(3000).valid, true);
  assert.equal(validateLoopbackPort('8102').valid, true);
  assert.equal(validateLoopbackPort(8094, { host: '127.0.0.1' }).valid, true);
  assert.equal(validateLoopbackPort(8094, { host: 'localhost' }).valid, true);

  // SSRF / external host attacks
  assert.equal(validateLoopbackPort(80, { host: '169.254.169.254' }).valid, false);
  assert.equal(validateLoopbackPort(3000, { host: '169.254.169.254' }).valid, false);
  assert.equal(validateLoopbackPort(3000, { host: 'example.com' }).valid, false);
  assert.equal(validateLoopbackPort(3000, { host: '10.0.0.1' }).valid, false);
  assert.equal(validateLoopbackPort(3000, { host: '192.168.1.1' }).valid, false);
  assert.equal(validateLoopbackPort(3000, { host: 'file:///etc/passwd' }).valid, false);
  assert.equal(validateLoopbackPort(3000, { host: 'http://127.0.0.1' }).valid, false);

  // Invalid ports
  assert.equal(validateLoopbackPort(80).valid, false);
  assert.equal(validateLoopbackPort(0).valid, false);
  assert.equal(validateLoopbackPort(70000).valid, false);
  assert.equal(validateLoopbackPort('3000/../../etc').valid, false);
  assert.equal(validateLoopbackPort(NaN).valid, false);
  assert.equal(validateLoopbackPort(null).valid, false);
});

test('isLoopbackHostString and server isLocalHost / isLocalRequest defeat GET/POST DNS-rebinding', () => {
  assert.equal(isLoopbackHostString('127.0.0.1:3000'), true);
  assert.equal(isLoopbackHostString('localhost:3000'), true);
  assert.equal(isLoopbackHostString('[::1]:3000'), true);
  assert.equal(isLoopbackHostString('evil.example.invalid'), false);
  assert.equal(isLoopbackHostString('evil.example.invalid:3000'), false);
  assert.equal(isLoopbackHostString('127.0.0.1.evil.com'), false);
  assert.equal(isLoopbackHostString(''), false);

  assert.equal(isLocalHost({ headers: { host: '127.0.0.1:3000' } }), true);
  assert.equal(isLocalHost({ headers: { host: 'evil.example.invalid' } }), false);
  assert.equal(
    isLocalRequest({ headers: { host: '127.0.0.1:3000', origin: 'https://evil.example.invalid' } }),
    false
  );
  assert.equal(
    isLocalRequest({ headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' } }),
    true
  );
});

test('classifyProbeStatus and computeLatencyStats produce exact p50/p95 without fabrication', () => {
  assert.equal(classifyProbeStatus({ ok: false, rttMs: null }), 'OFFLINE');
  assert.equal(classifyProbeStatus({ ok: true, rttMs: 12.4 }), 'ONLINE');
  assert.equal(classifyProbeStatus({ ok: true, rttMs: 320 }), 'DEGRADED');

  const empty = computeLatencyStats([
    { ok: false, rttMs: null },
    { ok: false, rttMs: null },
  ]);
  assert.equal(empty.count, 2);
  assert.equal(empty.onlineCount, 0);
  assert.equal(empty.offlineCount, 2);
  assert.equal(empty.p50Ms, null);
  assert.equal(empty.p95Ms, null);
  assert.equal(empty.minMs, null);
  assert.equal(empty.maxMs, null);

  const stats = computeLatencyStats([
    { ok: true, rttMs: 2.0 },
    { ok: true, rttMs: 4.0 },
    { ok: true, rttMs: 10.0 },
    { ok: true, rttMs: 20.0 },
    { ok: true, rttMs: 300.0 },
    { ok: false, rttMs: null },
  ]);
  assert.equal(stats.count, 6);
  assert.equal(stats.onlineCount, 5);
  assert.equal(stats.degradedCount, 1);
  assert.equal(stats.offlineCount, 1);
  assert.equal(stats.minMs, 2.0);
  assert.equal(stats.p50Ms, 10.0);
  assert.equal(stats.p95Ms, 300.0);
  assert.equal(stats.maxMs, 300.0);
});

test('normalizeBridgeChannels guarantees unique IDs and unique topology codes (SGNL vs HOOK)', () => {
  const rawFrom8102 = [
    { name: 'Signal Messenger', type: 'signal', account: '+15550000000', latency_ms: 12.4, status: 'HEALTHY' },
    { name: 'SimpleX Chat', type: 'simplex', account: 'simplex://invitation/smp-test-node', latency_ms: 18.1, status: 'HEALTHY' },
    { name: 'Matrix Relay', type: 'matrix', latency_ms: 45.8, status: 'HEALTHY' },
    { name: 'Telegram Bot', type: 'telegram', latency_ms: 62.3, status: 'HEALTHY' },
    { name: 'Signed HTTP Webhook', type: 'webhook', latency_ms: 4.2, status: 'HEALTHY' },
  ];
  const normalized = normalizeBridgeChannels(rawFrom8102);
  assert.equal(normalized.length, 5);

  const ids = new Set(normalized.map((c) => c.id));
  const codes = new Set(normalized.map((c) => c.code));
  assert.equal(ids.size, 5, 'Every channel must have a unique defined id');
  assert.equal(codes.size, 5, 'Every channel must have a unique topology code');
  assert.equal(normalized.every((c) => typeof c.id === 'string' && c.id.length > 0), true);

  const signal = normalized.find((c) => c.type === 'signal');
  const webhook = normalized.find((c) => c.type === 'webhook');
  assert.equal(signal.code, 'SGNL');
  assert.equal(webhook.code, 'HOOK');
  assert.notEqual(signal.code, webhook.code);
  assert.equal(signal.isStaticMock, true);
});

test('WebCrypto HKDF-SHA256 / HMAC-SHA256 envelope signing, verification & tamper detection', async () => {
  const payload = JSON.stringify({ event: 'noc.ping', port: 3000 });
  const testKey = 'demo-loopback-key-00000000000000';
  const nonce = '0123456789abcdef01234567';
  const timestamp = '1795619000';

  const signed = await signHmacSha256Envelope({ payload, secret: testKey, nonce, timestamp });
  assert.match(signed.signatureHex, /^[0-9a-f]{64}$/);
  assert.equal(signed.algorithm, 'HKDF-SHA256 / HMAC-SHA256');

  const audit = inspectEnvelopeStructure({
    payload,
    secret: testKey,
    nonce,
    timestamp,
    signatureHex: signed.signatureHex,
  });
  assert.equal(audit.valid, true);

  const validVerify = await verifyHmacSha256Envelope({
    payload,
    secret: testKey,
    nonce,
    timestamp,
    signatureHex: signed.signatureHex,
  });
  assert.equal(validVerify.verified, true);

  const tamperedVerify = await verifyHmacSha256Envelope({
    payload: payload + ' ',
    secret: testKey,
    nonce,
    timestamp,
    signatureHex: signed.signatureHex,
  });
  assert.equal(tamperedVerify.verified, false);
});

test('JSON, CSV (with formula-injection neutralization), and Markdown exporters work cleanly', () => {
  assert.equal(escapeCsvCell('=CMD|"/C calc"!A0'), `"'=CMD|""/C calc""!A0"`);
  assert.equal(escapeCsvCell('+1+1'), `'+1+1`);
  assert.equal(escapeCsvCell('-10'), `'-10`);
  assert.equal(escapeCsvCell('@SUM(A1:A2)'), `'@SUM(A1:A2)`);

  const snapshot = {
    timestamp: '2026-11-26T15:00:00Z',
    nodes: [
      { id: 'zoth-studio', code: 'STD', name: '=HYPERLINK("evil")', port: 3000, protocol: 'HTTP', category: 'Hub', ok: true, httpStatus: 200, rttMs: 1.8, status: 'ONLINE' },
      { id: 'swarm-coordinator', code: 'SWM', name: 'Swarm Coordinator', port: 8989, protocol: 'HTTP', category: 'Swarm', ok: false, httpStatus: null, rttMs: null, status: 'OFFLINE' },
    ],
    unixSockets: [],
  };

  const jsonStr = exportBusReportJson(snapshot);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.schemaVersion, '2.3.0');
  assert.equal(parsed.summary.onlineCount, 1);
  assert.equal(parsed.summary.offlineCount, 1);

  const csvStr = exportBusReportCsv(snapshot);
  assert.ok(csvStr.includes(`"'=HYPERLINK(""evil"")"`), 'CSV must neutralize leading = formula');

  const mdStr = exportBusReportMarkdown(snapshot);
  assert.ok(mdStr.includes('Zoth Swarm NOC & Signal Bridge Diagnostic Report (v2.3.0)'));
  assert.ok(mdStr.includes('127.0.0.1:3000'));
  assert.ok(mdStr.includes('**OFFLINE**'));
});
