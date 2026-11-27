import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseAndScoreHttpHeaders,
  computeShannonEntropy,
  auditLocalCodeSnippets,
  classifyLoopbackPortProbe,
  buildExecutiveReportMarkdown,
  sanitizeCsvCell,
  exportFindingsCsv,
} from '../src/utils/hexstrikeEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('src/utils/hexstrikeEngine.js and server/hexstrike-engine.mjs are byte-identical mirrors', () => {
  const srcBytes = fs.readFileSync(path.join(rootDir, 'src/utils/hexstrikeEngine.js'));
  const srvBytes = fs.readFileSync(path.join(rootDir, 'server/hexstrike-engine.mjs'));
  assert.equal(Buffer.compare(srcBytes, srvBytes), 0, 'Client and server hexstrike engine mirrors diverged');
});

test('parseAndScoreHttpHeaders never fabricates PASS or 100/100 when CORS-blocked or empty', () => {
  const blocked = parseAndScoreHttpHeaders({}, { domain: 'example.com', corsBlocked: true });
  assert.equal(blocked.verified, false);
  assert.equal(blocked.status, 'UNVERIFIED (CORS-blocked)');
  assert.equal(blocked.score, null);
  assert.equal(blocked.grade, 'UNVERIFIED');
  assert.ok(blocked.findings.every((f) => f.status === 'UNVERIFIED' && f.earned === 0));

  const partial = parseAndScoreHttpHeaders(
    'X-Content-Type-Options: nosniff\nX-Frame-Options: SAMEORIGIN\nServer: BaseHTTP/0.6 Python/3.12.13\n',
    { domain: '127.0.0.1:8138' }
  );
  assert.equal(partial.verified, true);
  assert.equal(partial.score, 30);
  assert.equal(partial.grade, 'D');
  assert.equal(partial.disclosures.length, 1);

  const full = parseAndScoreHttpHeaders({
    'Strict-Transport-Security': 'max-age=31536000',
    'Content-Security-Policy': "default-src 'self'",
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=()',
  });
  assert.equal(full.score, 100);
  assert.equal(full.grade, 'A+');
});

test('computeShannonEntropy computes exact 0.0 and 8.0 bounds and hex decoding', () => {
  const zero = computeShannonEntropy('AAAAAAAAAAAAAAAA');
  assert.equal(zero.shannonEntropy, 0);
  assert.equal(zero.classification, 'LOW_ENTROPY / STRUCTURED');

  const uniform = new Uint8Array(256);
  for (let i = 0; i < 256; i++) uniform[i] = i;
  const max = computeShannonEntropy(uniform);
  assert.equal(max.shannonEntropy, 8);
  assert.equal(max.classification, 'PACKED / ENCRYPTED');

  const hex = computeShannonEntropy('41424344', { isHex: true });
  assert.equal(hex.byteCount, 4);
  assert.equal(hex.shannonEntropy, 2);

  assert.throws(() => computeShannonEntropy('ABC', { isHex: true }), /even number/);
});

test('auditLocalCodeSnippets detects shell, eval, innerHTML, webSecurity:false, and secret shapes', () => {
  const dirty = [
    'subprocess.run(cmd, shell=True)',
    'eval(userInput)',
    'el.innerHTML = data',
    'webSecurity: false',
    'uses: actions/checkout@main',
  ].join('\n');
  const res = auditLocalCodeSnippets(dirty);
  assert.equal(res.findingCount, 5);
  assert.ok(res.score < 50);

  const clean = auditLocalCodeSnippets('const x = 1 + 2;\nconsole.log(x);');
  assert.equal(clean.findingCount, 0);
  assert.equal(clean.score, 100);
});

test('classifyLoopbackPortProbe never marks refused browser errors as OPEN', () => {
  const refusedFast = classifyLoopbackPortProbe({ ok: false, errorType: 'TypeError', latencyMs: 3 });
  assert.equal(refusedFast.status, 'CLOSED / UNREACHABLE');
  assert.ok(!refusedFast.status.includes('OPEN'));

  const daemonOpen = classifyLoopbackPortProbe({ daemonAuthoritative: true, daemonOpen: true, latencyMs: 2 });
  assert.equal(daemonOpen.status, 'OPEN');
});

test('buildExecutiveReportMarkdown and CSV exports are honest and formula-safe', () => {
  const emptyMd = buildExecutiveReportMarkdown({ targetScope: '127.0.0.1' });
  assert.ok(emptyMd.includes('UNVERIFIED'));
  assert.ok(!emptyMd.includes('98 / 100'));
  assert.ok(!emptyMd.includes('0 Unmitigated Zero-Day Criticals'));

  assert.equal(sanitizeCsvCell('=cmd|"/C calc"!A0'), '"\'=cmd|""/C calc""!A0"');
  const csv = exportFindingsCsv([{ category: 'TEST', item: '+1+1', status: 'WARN', detail: 'ok' }]);
  assert.ok(csv.includes("'+1+1"));
});
