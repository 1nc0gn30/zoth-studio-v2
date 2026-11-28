import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BROKEN_DEMO_NETLIFY_TOML,
  BROKEN_DEMO_REDIRECTS,
  DEFAULT_REPO_NETLIFY_TOML,
  NETLIFY_AX_PRESETS,
  NETLIFY_AX_SCHEMA_VERSION,
  analyzeRedirects,
  auditNetlifyConfig,
  buildNetlifyAxSnapshot,
  buildOfflineNetlifyAxSnapshot,
  csvEscape,
  detectSecretPatterns,
  formatNetlifyAxExports,
  parseHeadersFile,
  parseNetlifyToml,
  parseRedirectsFile,
  redactNetlifyPayload,
  redactNetlifyText,
  sha256Hex,
  simulateNetlifyRequest,
  synthesizeHardenedConfigs,
  synthesizeNetlifyCliPlaybook,
} from '../src/utils/netlifyAxEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('1. Byte-identical parity between src/utils/netlifyAxEngine.js and server/netlify-ax-engine.mjs', () => {
  const browserSrc = fs.readFileSync(path.join(ROOT, 'src/utils/netlifyAxEngine.js'));
  const serverSrc = fs.readFileSync(path.join(ROOT, 'server/netlify-ax-engine.mjs'));
  assert.equal(Buffer.compare(browserSrc, serverSrc), 0, 'Browser and server Netlify AX engines must be byte-identical');
});

test('2. Pure engine & UI invariants: zero eval, new Function, Math.random, or literal /home/<user> paths', () => {
  const engineSrc = fs.readFileSync(path.join(ROOT, 'src/utils/netlifyAxEngine.js'), 'utf8');
  const uiSrc = fs.readFileSync(path.join(ROOT, 'src/components/tools/NetlifyAxConsoleGodModeTool.jsx'), 'utf8');
  for (const src of [engineSrc, uiSrc]) {
    assert.doesNotMatch(src, /\beval\s*\(/);
    assert.doesNotMatch(src, /\bnew\s+Function\s*\(/);
    assert.doesNotMatch(src, /\bMath\.random\s*\(/);
    assert.doesNotMatch(src, /\/home\/[a-z0-9._-]+/i);
  }
  assert.equal(NETLIFY_AX_SCHEMA_VERSION, '2.4.0');
  assert.equal(NETLIFY_AX_PRESETS.length, 3);
});

test('3. Synchronous FIPS 180-4 SHA-256 matches NIST vectors', () => {
  assert.equal(sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('4. Parses real repo netlify.toml cleanly with build, env, functions, edge_functions, redirects, and headers', () => {
  const realToml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  const parsed = parseNetlifyToml(realToml);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.build.publish, 'dist');
  assert.equal(parsed.build.command, 'npm run build');
  assert.equal(parsed.buildEnvironment.NODE_VERSION, '20');
  assert.equal(parsed.functions.node_bundler, 'esbuild');
  assert.ok(parsed.edgeFunctions.some((e) => e.function === 'edge-telemetry' && e.path === '/api/edge/*'));
  assert.ok(parsed.redirects.length >= 4);
  assert.ok(parsed.headers.length >= 8);
});

test('5. Parses plain-text _redirects and _headers files and flags malformed lines', () => {
  const r = parseRedirectsFile('/old /new 301!\n/api/* /.netlify/functions/api/:splat 200\n/broken-only-one-token');
  assert.equal(r.ok, false);
  assert.equal(r.rules.length, 2);
  assert.equal(r.rules[0].force, true);
  assert.equal(r.rules[0].status, 301);
  assert.equal(r.errors.length, 1);

  const h = parseHeadersFile('/*\n  X-Frame-Options: SAMEORIGIN\n  X-Content-Type-Options: nosniff\n');
  assert.equal(h.ok, true);
  assert.equal(h.blocks.length, 1);
  assert.equal(h.blocks[0].values['X-Frame-Options'], 'SAMEORIGIN');
});

test('6. Redirect graph analyzer catches circular cycles, self-redirects, splat shadowing, and invalid status codes', () => {
  const parsedToml = parseNetlifyToml(BROKEN_DEMO_NETLIFY_TOML);
  const parsedRedirects = parseRedirectsFile(BROKEN_DEMO_REDIRECTS);
  const analysis = analyzeRedirects([...parsedToml.redirects, ...parsedRedirects.rules]);

  assert.equal(analysis.clean, false);
  assert.equal(analysis.hasLoops, true);
  assert.ok(analysis.selfRedirects.some((s) => s.from === '/self-loop'));
  assert.ok(analysis.cycles.length >= 2, 'Should catch both /alpha<->/beta and /old-blog<->/new-blog cycles');
  assert.ok(analysis.shadowedRules.length >= 2, 'Should flag rules after /* splat as shadowed');
  assert.ok(analysis.invalidStatuses.some((s) => s.status === 999));
});

test('7. Edge & Serverless Request Router Simulator traces Edge Functions, Serverless proxies, redirects, SPA & headers', () => {
  const parsedToml = parseNetlifyToml(DEFAULT_REPO_NETLIFY_TOML);

  const edgeSim = simulateNetlifyRequest({ path: '/api/edge/telemetry', parsedToml });
  assert.equal(edgeSim.ok, true);
  assert.equal(edgeSim.resolutionType, 'EDGE_FUNCTION_INTERCEPT');
  assert.ok(edgeSim.matchedEdgeFunctions.some((e) => e.function === 'edge-telemetry'));
  assert.equal(edgeSim.effectiveHeaders['Cross-Origin-Opener-Policy']?.value, 'same-origin');
  assert.match(edgeSim.receiptSha256, /^[0-9a-f]{64}$/);

  const fnSim = simulateNetlifyRequest({ path: '/api/studio/status', parsedToml });
  assert.equal(fnSim.resolutionType, 'SERVERLESS_FUNCTION_PROXY');
  assert.equal(fnSim.matchedServerlessFunction?.name, 'studio-api');
  assert.equal(fnSim.finalTarget, '/.netlify/functions/studio-api/status');

  const hubSim = simulateNetlifyRequest({ path: '/hub/tools', parsedToml });
  assert.equal(hubSim.resolutionType, 'HTTP_REDIRECT');
  assert.equal(hubSim.redirectChain[0].status, 301);
  assert.equal(hubSim.redirectChain[0].resolvedTarget, '/tools');

  const spaSim = simulateNetlifyRequest({ path: '/workstations/netlify-ax', parsedToml });
  assert.equal(spaSim.resolutionType, 'SPA_REWRITE_FALLBACK');
  assert.equal(spaSim.finalTarget, '/index.html');
  assert.equal(spaSim.effectiveHeaders['X-Frame-Options']?.value, 'SAMEORIGIN');

  // Cycle simulation returns HTTP 508 REDIRECT_LOOP_ERROR
  const brokenToml = parseNetlifyToml(BROKEN_DEMO_NETLIFY_TOML);
  const loopSim = simulateNetlifyRequest({ path: '/alpha', parsedToml: brokenToml });
  assert.equal(loopSim.ok, false);
  assert.equal(loopSim.cycleDetected, true);
  assert.equal(loopSim.finalStatus, 508);
});

test('8. 14-point guardrail auditor scores repo netlify.toml cleanly and catches defects in broken demo', () => {
  const realToml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  const goodAudit = auditNetlifyConfig({ toml: realToml });
  assert.equal(goodAudit.ok, true);
  assert.equal(goodAudit.checks.length, 14);
  assert.equal(goodAudit.summary.failCount, 0);
  assert.ok(goodAudit.summary.score >= 95, `Expected repo score >= 95, got ${goodAudit.summary.score}`);
  assert.equal(goodAudit.summary.grade, 'A+');
  assert.match(goodAudit.receiptSha256, /^[0-9a-f]{64}$/);

  const badAudit = auditNetlifyConfig({ toml: BROKEN_DEMO_NETLIFY_TOML, redirects: BROKEN_DEMO_REDIRECTS });
  assert.ok(badAudit.summary.failCount >= 4);
  assert.ok(badAudit.summary.score < 60);
});

test('9. Secret-pattern detector & redactor catch tokens/keys and strip /home/<user> paths', () => {
  const fakeNetlifyTok = ['nfp', '_', 'a'.repeat(24)].join('');
  const fakeGhTok = ['ghp', '_', 'b'.repeat(28)].join('');
  const fakeStripeTok = ['sk', '_live_', 'c'.repeat(24)].join('');
  const fakeAwsKey = ['AKIA', '1'.repeat(16)].join('');
  const dirtyToml = `${DEFAULT_REPO_NETLIFY_TOML}\n# leaked NETLIFY_AUTH_TOKEN=${fakeNetlifyTok}\n# /home/operator/secret\n# ${fakeGhTok}\n`;
  const hits = detectSecretPatterns(dirtyToml);
  assert.ok(hits.length >= 2);
  assert.ok(hits.some((h) => h.id === 'NETLIFY_TOKEN'));
  assert.ok(hits.some((h) => h.id === 'GITHUB_TOKEN'));

  const auditWithSecret = auditNetlifyConfig({ toml: dirtyToml });
  const secCheck = auditWithSecret.checks.find((c) => c.id === 'SECRET_PATTERN_HYGIENE');
  assert.equal(secCheck.status, 'FAIL');
  assert.doesNotMatch(JSON.stringify(auditWithSecret), /\/home\/operator/);
  assert.ok(!JSON.stringify(auditWithSecret).includes(fakeNetlifyTok));

  const redacted = redactNetlifyText(`path /home/alice/repo token ${fakeStripeTok}`);
  assert.equal(redacted, 'path ~/repo token [REDACTED_TOKEN]');
  const obj = redactNetlifyPayload({ a: '/Users/bob/.config', b: fakeAwsKey });
  assert.equal(obj.a, '~/.config');
  assert.equal(obj.b, '[REDACTED_TOKEN]');
});

test('10. Copy-only CLI playbook & hardened config synthesizer sanitize shell metacharacters', () => {
  const pb = synthesizeNetlifyCliPlaybook({
    siteName: 'my-site; rm -rf /',
    envKey: 'API_KEY$(whoami)',
    envValue: 'val|cat',
  });
  assert.equal(pb.readOnlyCopyOnly, true);
  assert.ok(pb.commands.length >= 6);
  for (const c of pb.commands) {
    assert.doesNotMatch(c.command, /[;$|`]/);
    assert.doesNotMatch(c.command, /--prod/);
  }
  const tpl = synthesizeHardenedConfigs({ publishDir: 'dist', domain: 'example.nullai.tech' });
  assert.ok(tpl.toml.includes('publish = "dist"'));
  assert.ok(tpl.toml.includes('example.nullai.tech'));
  assert.match(tpl.receiptSha256, /^[0-9a-f]{64}$/);
});

test('11. Formula-safe CSV & bundle exports neutralize spreadsheet formulas and attach SHA-256 receipts', () => {
  assert.equal(csvEscape('=CMD("calc")'), `"'=CMD(""calc"")"`);
  assert.equal(csvEscape('+SUM(A1:A2)'), `'+SUM(A1:A2)`);
  assert.equal(csvEscape('-1+2'), `'-1+2`);
  assert.equal(csvEscape('@malicious'), `'@malicious`);

  const snap = buildOfflineNetlifyAxSnapshot();
  assert.equal(snap.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.equal(snap.securityBoundary.readsNetlifyCredentials, false);
  assert.equal(snap.securityBoundary.remoteDeployMutations, false);

  const exported = formatNetlifyAxExports({ snapshot: snap, audit: snap.audit });
  assert.match(exported.receiptSha256, /^[0-9a-f]{64}$/);
  assert.ok(exported.markdown.includes(exported.receiptSha256));
  const parsedJson = JSON.parse(exported.json);
  assert.equal(parsedJson.receiptSha256, exported.receiptSha256);
});

test('12. Server handler never reads ~/.config/netlify/config.json, .env*, or NETLIFY_AUTH_TOKEN', () => {
  const apiSrc = fs.readFileSync(path.join(ROOT, 'server/studio-api.mjs'), 'utf8');
  const start = apiSrc.indexOf('collectNetlifyAxRepoInspection');
  const end = apiSrc.indexOf("url.pathname === '/api/edge/telemetry'", start);
  assert.ok(start > 0 && end > start, 'Netlify AX server handler section must exist in server/studio-api.mjs');
  const section = apiSrc.slice(start, end);
  assert.doesNotMatch(section, /NETLIFY_AUTH_TOKEN/);
  assert.doesNotMatch(section, /\.config\/netlify/);
  assert.ok(section.includes("isLocalOrigin(req?.headers?.origin)"));
  assert.ok(section.includes('readJsonBodyWithLimit(req, 65536)'));
});

test('13. Deterministic offline fallback snapshot produces stable SHA-256 receipt across calls', () => {
  const s1 = buildOfflineNetlifyAxSnapshot();
  const s2 = buildOfflineNetlifyAxSnapshot();
  assert.equal(s1.receiptSha256, s2.receiptSha256);
  const sLive = buildNetlifyAxSnapshot({ mode: 'LIVE_LOOPBACK', checkedAt: '2026-11-28T07:00:00.000Z' });
  assert.equal(sLive.mode, 'LIVE_LOOPBACK');
  assert.equal(sLive.readOnly, true);
});
