import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EDGE_FORGE_VERSION,
  WASM_KERNEL_PRESETS,
  EDGE_TARGETS,
  EXPECTED_HOST_TOOLCHAINS,
  redactHomePaths,
  redactPayload,
  neutralizeCsvCell,
  sha256Hex,
  assembleWasmPreset,
  inspectWasmBinary,
  executeWasmModule,
  bytesToBase64,
  base64ToBytes,
  synthesizeEdgeTarget,
  simulateEdgeRequest,
  buildHostToolchainSnapshot,
  buildOfflineToolchainSnapshot,
  exportEdgeJson,
  exportEdgeMarkdown,
  exportEdgeCsv,
} from '../src/utils/edgeForgeEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('src/utils/edgeForgeEngine.js and server/edge-forge-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(rootDir, 'src/utils/edgeForgeEngine.js'));
  const serverBytes = fs.readFileSync(path.join(rootDir, 'server/edge-forge-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Client and server edgeForgeEngine must be byte-identical');
  assert.equal(EDGE_FORGE_VERSION, '2.3.0');
});

test('sha256Hex matches FIPS 180-4 NIST test vectors for strings and Uint8Array', () => {
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );
  const raw = new Uint8Array([0x61, 0x62, 0x63]);
  assert.equal(
    sha256Hex(raw),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
});

test('assembleWasmPreset emits valid \\0asm v1 WebAssembly binaries that pass WebAssembly.validate() and execute accurately', async () => {
  assert.equal(WASM_KERNEL_PRESETS.length, 4);

  // 1. add_i32(17, 25) === 42
  const addMod = assembleWasmPreset('add_i32');
  assert.equal(addMod.inspection.validMagic, true);
  assert.equal(addMod.inspection.magicHex, '00 61 73 6d');
  assert.equal(addMod.inspection.version, 1);
  assert.equal(WebAssembly.validate(addMod.bytes), true);
  assert.deepEqual(
    addMod.inspection.sections.map((s) => s.name),
    ['Type', 'Function', 'Export', 'Code']
  );
  assert.equal(addMod.inspection.exports[0].name, 'add_i32');
  const addExec = await executeWasmModule(addMod.bytes, 'add_i32', [17, 25]);
  assert.equal(addExec.ok, true);
  assert.equal(addExec.result, 42);

  // Round-trip base64
  const roundTrip = base64ToBytes(bytesToBase64(addMod.bytes));
  assert.equal(Buffer.compare(Buffer.from(addMod.bytes), Buffer.from(roundTrip)), 0);

  // 2. fib_i32(10) === 55, fib_i32(0) === 0, fib_i32(7) === 13
  const fibMod = assembleWasmPreset('fib_i32');
  assert.equal(WebAssembly.validate(fibMod.bytes), true);
  const fib10 = await executeWasmModule(fibMod.bytes, 'fib_i32', [10]);
  assert.equal(fib10.ok, true);
  assert.equal(fib10.result, 55);
  const fib0 = await executeWasmModule(fibMod.bytes, 'fib_i32', [0]);
  assert.equal(fib0.result, 0);
  const fib7 = await executeWasmModule(fibMod.bytes, 'fib_i32', [7]);
  assert.equal(fib7.result, 13);

  // 3. checksum_xor deterministic check
  const xorMod = assembleWasmPreset('checksum_xor');
  assert.equal(WebAssembly.validate(xorMod.bytes), true);
  const xorExec = await executeWasmModule(xorMod.bytes, 'checksum_xor', [1337, 4096]);
  assert.equal(xorExec.ok, true);
  const expectedXor = (Math.imul(1337 ^ 4096, -1640531535) ^ (1337 >>> 3)) | 0;
  assert.equal(xorExec.result, expectedXor);

  // 4. clamped_scale bounds check [0, 1000]
  const scaleMod = assembleWasmPreset('clamped_scale');
  assert.equal(WebAssembly.validate(scaleMod.bytes), true);
  assert.equal((await executeWasmModule(scaleMod.bytes, 'clamped_scale', [40, 3])).result, 120);
  assert.equal((await executeWasmModule(scaleMod.bytes, 'clamped_scale', [-5, 10])).result, 0);
  assert.equal((await executeWasmModule(scaleMod.bytes, 'clamped_scale', [500, 4])).result, 1000);

  // Invalid binary detection
  const badInsp = inspectWasmBinary(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
  assert.equal(badInsp.validMagic, false);
});

test('synthesizeEdgeTarget generates non-empty runnable source & config across all 5 targets', () => {
  assert.equal(EDGE_TARGETS.length, 5);
  for (const target of EDGE_TARGETS) {
    const out = synthesizeEdgeTarget(target.id, {
      serviceName: 'zoth-test-svc',
      routePath: '/api/edge/ping',
      memoryMb: 256,
      zeroEgress: true,
      readOnlyRootfs: true,
      wasmPresetId: 'fib_i32',
    });
    assert.equal(out.targetId, target.id);
    assert.ok(out.artifacts.source.content.length > 80, `${target.id} source should be non-empty`);
    assert.ok(out.artifacts.config.content.length > 50, `${target.id} config should be non-empty`);
    assert.match(out.artifacts.source.sha256, /^[0-9a-f]{64}$/);
    assert.match(out.manifestSha256, /^[0-9a-f]{64}$/);
  }

  const kvm = synthesizeEdgeTarget('kvm-microkernel', { zeroEgress: true, readOnlyRootfs: true });
  assert.ok(kvm.artifacts.source.content.includes('-net none'));
  assert.ok(kvm.artifacts.source.content.includes('readonly=on'));

  const oci = synthesizeEdgeTarget('oci-scratch', { zeroEgress: true });
  assert.ok(oci.artifacts.source.content.includes('FROM scratch'));
  assert.ok(oci.artifacts.config.content.includes('SCMP_ACT_ERRNO'));
});

test('simulateEdgeRequest is deterministic and computes route match, status, and SHA-256 receipt', () => {
  const r1 = simulateEdgeRequest('netlify-edge', {
    method: 'GET',
    configuredRoute: '/api/edge/telemetry',
    requestPath: '/api/edge/telemetry',
    coldStart: true,
    payloadBytes: 1024,
  });
  const r2 = simulateEdgeRequest('netlify-edge', {
    method: 'GET',
    configuredRoute: '/api/edge/telemetry',
    requestPath: '/api/edge/telemetry',
    coldStart: true,
    payloadBytes: 1024,
  });
  assert.equal(r1.status, 200);
  assert.equal(r1.routeMatch, 'exact');
  assert.equal(r1.receiptSha256, r2.receiptSha256);
  assert.match(r1.receiptSha256, /^[0-9a-f]{64}$/);

  const miss = simulateEdgeRequest('cloudflare-worker', {
    method: 'GET',
    configuredRoute: '/api/edge/telemetry',
    requestPath: '/unknown',
  });
  assert.equal(miss.status, 404);
  assert.equal(miss.verdict, 'ROUTE_NOT_FOUND');

  const blocked = simulateEdgeRequest('netlify-edge', { method: 'DELETE' });
  assert.equal(blocked.status, 405);
  assert.equal(blocked.verdict, 'METHOD_BLOCKED');
});

test('redactHomePaths, buildHostToolchainSnapshot, and sanitized JSON/MD/CSV exporters prevent /home/ leaks and CSV formula injection', () => {
  const fakeHome = '/home/operator/NullAITech/zoth-studio-v2';
  const redacted = redactHomePaths(`Binary at ${fakeHome}/bin and file:///home/operator/.cargo/bin/rustc`);
  assert.ok(!redacted.includes('/home/operator'));
  assert.ok(redacted.includes('~/NullAITech/zoth-studio-v2/bin'));
  assert.ok(redacted.includes('~/.cargo/bin/rustc'));

  const snap = buildHostToolchainSnapshot({
    kvm: true,
    checkedAt: '2026-11-26T22:15:00.000Z',
    toolchains: [
      { id: 'wat2wasm', label: 'wat2wasm', category: 'WASM', installed: true, path: '/usr/bin/wat2wasm', version: '1.0.36' },
      { id: 'rustc', label: 'rustc', category: 'Native', installed: true, path: '/home/operator/.cargo/bin/rustc', version: 'rustc 1.82.0' },
    ],
  });
  assert.equal(snap.mode, 'LIVE_HOST_TOOLCHAINS');
  assert.equal(snap.summary.installed, 2);
  assert.equal(snap.summary.wat2wasmReady, true);
  assert.ok(!JSON.stringify(snap).includes('/home/operator'));

  const offline = buildOfflineToolchainSnapshot();
  assert.equal(offline.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.equal(offline.toolchains.length, EXPECTED_HOST_TOOLCHAINS.length);

  assert.equal(neutralizeCsvCell('=CMD()'), "'=CMD()");
  assert.equal(neutralizeCsvCell('+1+1'), "'+1+1");
  assert.equal(neutralizeCsvCell('-2+3'), "'-2+3");
  assert.equal(neutralizeCsvCell('@SUM(A1)'), "'@SUM(A1)");

  const csv = exportEdgeCsv({
    hostSnapshot: snap,
    customRows: [{ rowType: 'TEST', id: '=CMD()', category: 'SEC', status: 'OK', artifact: '/home/operator/a.wasm', metric: '+10', latency: 1, note: '@evil' }],
  });
  assert.ok(!csv.includes('/home/operator'));
  assert.ok(csv.includes("'=CMD()"));
  assert.ok(csv.includes("'+10"));
  assert.ok(csv.includes("'@evil"));

  const wasm = assembleWasmPreset('add_i32');
  const targetSynthesis = synthesizeEdgeTarget('netlify-edge');
  const json = exportEdgeJson({ wasm, targetSynthesis, hostSnapshot: snap });
  const md = exportEdgeMarkdown({ wasm, targetSynthesis, hostSnapshot: snap });
  assert.ok(!json.includes('/home/operator'));
  assert.ok(!md.includes('/home/operator'));
  assert.ok(md.includes('Engineered by Neal Frazier Tech (@1nc0gn30)'));
});
