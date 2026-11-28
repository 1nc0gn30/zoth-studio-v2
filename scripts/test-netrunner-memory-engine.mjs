import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import crypto from 'node:crypto';
import {
  NETRUNNER_MEMORY_SCHEMA_VERSION,
  NEUROMODULATOR_PROFILES,
  buildOfflineNetrunnerMemorySnapshot,
  computeAssociativeTrace,
  computeEbbinghausRetention,
  computeStdpDelta,
  escapeCsvFormulaCell,
  evaluateNetrunnerMemory,
  formatNetrunnerMemoryExports,
  normalizeNetrunnerMemorySnapshot,
  redactMemoryPayload,
  runHybridRecall,
  sampleStdpCurve,
  sha256Hex,
  synthesizeMemoryPlaybooks,
} from '../src/utils/netrunnerMemoryEngine.js';
import { studioMiddleware } from '../server/studio-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('src/utils/netrunnerMemoryEngine.js and server/netrunner-memory-engine.mjs are byte-identical & clean', () => {
  const clientPath = path.join(ROOT, 'src', 'utils', 'netrunnerMemoryEngine.js');
  const serverPath = path.join(ROOT, 'server', 'netrunner-memory-engine.mjs');
  const clientBuf = fs.readFileSync(clientPath);
  const serverBuf = fs.readFileSync(serverPath);
  assert.equal(Buffer.compare(clientBuf, serverBuf), 0, 'Client and server engines must be byte-identical');

  const srcText = clientBuf.toString('utf8');
  assert.doesNotMatch(srcText, /\beval\s*\(/);
  assert.doesNotMatch(srcText, /\bnew\s+Function\b/);
  assert.doesNotMatch(srcText, /\bMath\.random\s*\(/);
  assert.doesNotMatch(srcText, /\/home\/[a-z0-9._-]+\//i);

  // Orphaned Netrunner3DWorld.jsx must stay retired
  assert.equal(fs.existsSync(path.join(ROOT, 'src', 'components', 'Netrunner3DWorld.jsx')), false);
});

test('synchronous FIPS 180-4 SHA-256 matches Node crypto.createHash', () => {
  for (const sample of ['', 'lucy-netrunner-memory-hub', '{"deltaT":0,"deltaW":0}']) {
    const expected = crypto.createHash('sha256').update(sample, 'utf8').digest('hex');
    assert.equal(sha256Hex(sample), expected);
  }
});

test('Asymmetric Hebbian STDP enforces Δw(0) === 0, causal LTP > 0, and anti-causal LTD < 0', () => {
  const zero = computeStdpDelta(0, { neuromodulator: 'balanced' });
  assert.equal(zero.ok, true);
  assert.equal(zero.deltaW, 0);
  assert.equal(zero.regime, 'NEUTRAL');

  for (const prof of NEUROMODULATOR_PROFILES) {
    assert.equal(computeStdpDelta(0, { neuromodulator: prof.id }).deltaW, 0);
  }

  const ltp = computeStdpDelta(10, { aPlus: 0.85, tauPlusMs: 16.8, neuromodulator: 'balanced' });
  assert.equal(ltp.ok, true);
  assert.equal(ltp.regime, 'LTP');
  assert.ok(ltp.deltaW > 0.45 && ltp.deltaW < 0.5);

  const ltpDopa = computeStdpDelta(10, { aPlus: 0.85, tauPlusMs: 16.8, neuromodulator: 'dopamine' });
  assert.ok(ltpDopa.deltaW > ltp.deltaW, 'Dopamine must amplify causal LTP gain');

  const ltd = computeStdpDelta(-15, { aMinus: 0.45, tauMinusMs: 33.7, neuromodulator: 'balanced' });
  assert.equal(ltd.ok, true);
  assert.equal(ltd.regime, 'LTD');
  assert.ok(ltd.deltaW < -0.25 && ltd.deltaW > -0.35);

  const curve = sampleStdpCurve({ stepMs: 5 });
  const originPt = curve.find((p) => p.deltaTMs === 0);
  assert.ok(originPt, 'STDP curve must include Δt = 0ms');
  assert.equal(originPt.deltaW, 0);
  assert.equal(curve[0].deltaTMs, -100);
  assert.equal(curve[curve.length - 1].deltaTMs, 100);
});

test('Ebbinghaus retention decays monotonically and responds to neuromodulator & access spacing', () => {
  const r0 = computeEbbinghausRetention({ ageHours: 0, stabilityHours: 72, accessCount: 1 });
  const r24 = computeEbbinghausRetention({ ageHours: 24, stabilityHours: 72, accessCount: 1 });
  const r120 = computeEbbinghausRetention({ ageHours: 120, stabilityHours: 72, accessCount: 1 });
  assert.equal(r0.retention, 1);
  assert.ok(r24.retention < r0.retention && r120.retention < r24.retention);

  const rSerotonin = computeEbbinghausRetention({
    ageHours: 48,
    stabilityHours: 72,
    accessCount: 1,
    neuromodulator: 'serotonin',
  });
  const rBalanced = computeEbbinghausRetention({
    ageHours: 48,
    stabilityHours: 72,
    accessCount: 1,
    neuromodulator: 'balanced',
  });
  assert.ok(rSerotonin.retention > rBalanced.retention, 'Serotonin lowers decayMultiplier and extends retention');
});

test('Hybrid recall computes genuine BM25 + hashed n-gram cosine + salience ranking', () => {
  const offline = buildOfflineNetrunnerMemorySnapshot();
  assert.equal(offline.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.equal(offline.readOnly, true);

  const res = runHybridRecall(offline.engrams, {
    query: 'bm25 cosine ebbinghaus hybrid recall',
    weights: { bm25: 0.45, cosine: 0.35, salience: 0.2 },
  });
  assert.equal(res.results[0].id, 'engram-hybrid-recall-04');
  assert.ok(res.results[0].bm25Score > 0.9);
  assert.ok(res.results[0].cosineScore > 0.4);
  assert.ok(res.results[0].compositeScore > res.results[res.results.length - 1].compositeScore);

  const trace = computeAssociativeTrace(offline.graph, { seedNodeId: 'engram-stdp-core-01', maxHops: 2 });
  assert.equal(trace.seedId, 'engram-stdp-core-01');
  assert.ok(trace.totalActivated >= 4);
  assert.ok(trace.ca3Coherence > 0);
});

test('Read-only :8094 normalizer redacts home paths & secrets and exports neutralize CSV formulas', () => {
  const snap = normalizeNetrunnerMemorySnapshot({
    mode: 'LIVE_LOOPBACK',
    checkedAt: '2026-11-28T08:00:00.000Z',
    health: { status: 'ok', version: '0.1.0', service: 'neuro-memory-daemon' },
    stats: {
      total_memories: 5469,
      total_synapses: 266858,
      synaptic_density: 48.79,
      average_importance: 0.631,
      average_accesses: 1.35,
      categories: { episodic: 4825, security_chain: 262 },
    },
    memories: {
      memories: [
        {
          id: 'mem-redact-1',
          text: '=CMD("calc") leaked path /home/operator/secret/key and sk-abcdefgh1234567890',
          tags: ['+evil', '-tag'],
          importance: 0.9,
          category: 'security_chain',
          access_count: 3,
          synapses: { b: 0.8 },
        },
      ],
    },
    graph: {
      nodes: [{ id: 'mem-redact-1', label: 'Node /home/operator/x', category: 'security_chain', importance: 0.9 }],
      edges: [],
      total_nodes: 1,
      total_edges: 0,
    },
    probes: { health: { online: true, httpStatus: 200, latencyMs: 2 } },
  });

  assert.equal(snap.schemaVersion, NETRUNNER_MEMORY_SCHEMA_VERSION);
  assert.equal(snap.readOnly, true);
  assert.equal(snap.summary.totalMemories, 5469);
  assert.equal(snap.summary.totalSynapses, 266858);
  assert.match(snap.receiptSha256, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(snap), /\/home\/operator/);
  assert.doesNotMatch(JSON.stringify(snap), /sk-abcdefgh1234567890/);

  assert.equal(escapeCsvFormulaCell('=SUM(A1:A2)'), "'=SUM(A1:A2)");
  assert.equal(escapeCsvFormulaCell('+1+1'), "'+1+1");
  assert.equal(escapeCsvFormulaCell('-cmd'), "'-cmd");
  assert.equal(escapeCsvFormulaCell('@alert'), "'@alert");

  const ev = evaluateNetrunnerMemory({ deltaTMs: 12, query: 'leaked' }, snap);
  const pbs = synthesizeMemoryPlaybooks({ query: 'stdp' });
  const exp = formatNetrunnerMemoryExports(snap, ev, pbs);
  assert.match(exp.receiptSha256, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(exp.json, /\/home\/operator/);
  assert.match(exp.csv, /'=CMD/);
  assert.equal(redactMemoryPayload({ p: '/home/tester/app' }).p, '~/app');
});

test('/api/studio/netrunner-memory* enforces Host/Origin 403, 64KB 413, HEAD 200, and read-only evaluation', async () => {
  const mw = studioMiddleware();
  const server = http.createServer((req, res) => {
    mw(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const rawReq = (urlPath, { method = 'GET', headers = {}, body = null } = {}) =>
    new Promise((resolve, reject) => {
      const req = http.request(
        { host: '127.0.0.1', port, path: urlPath, method, headers },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
        },
      );
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });

  try {
    // HEAD 200 + HEAD untrusted Origin 403
    let r = await rawReq('/api/studio/netrunner-memory', { method: 'HEAD' });
    assert.equal(r.status, 200);
    r = await rawReq('/api/studio/netrunner-memory', { method: 'HEAD', headers: { Origin: 'https://evil.example' } });
    assert.equal(r.status, 403);

    // GET Host & Origin 403
    r = await rawReq('/api/studio/netrunner-memory', { headers: { Host: 'evil.example' } });
    assert.equal(r.status, 403);
    r = await rawReq('/api/studio/netrunner-memory', { headers: { Origin: 'https://evil.example' } });
    assert.equal(r.status, 403);

    // GET 200 strictly read-only
    r = await rawReq('/api/studio/netrunner-memory');
    assert.equal(r.status, 200);
    const snap = JSON.parse(r.body);
    assert.equal(snap.ok, true);
    assert.equal(snap.readOnly, true);
    assert.equal(snap.schemaVersion, NETRUNNER_MEMORY_SCHEMA_VERSION);
    assert.match(snap.receiptSha256, /^[0-9a-f]{64}$/);
    assert.doesNotMatch(r.body, /\/home\/[a-z0-9_-]+\//i);

    // POST evaluate security checks
    r = await rawReq('/api/studio/netrunner-memory/evaluate', {
      method: 'POST',
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaTMs: 12 }),
    });
    assert.equal(r.status, 403);

    r = await rawReq('/api/studio/netrunner-memory/evaluate', {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: '{invalid-json',
    });
    assert.equal(r.status, 400);

    r = await rawReq('/api/studio/netrunner-memory/evaluate', {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'X'.repeat(70000) }),
    });
    assert.equal(r.status, 413);

    r = await rawReq('/api/studio/netrunner-memory/evaluate', {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaTMs: 0, neuromodulator: 'acetylcholine', query: 'stdp /home/operator/key' }),
    });
    assert.equal(r.status, 200);
    const ev = JSON.parse(r.body);
    assert.equal(ev.ok, true);
    assert.equal(ev.readOnly, true);
    assert.equal(ev.deltaWAtZero, 0);
    assert.equal(ev.stdp.deltaW, 0);
    assert.match(ev.receiptSha256, /^[0-9a-f]{64}$/);
    assert.doesNotMatch(r.body, /\/home\/[a-z0-9_-]+\//i);
  } finally {
    server.close();
  }
});
