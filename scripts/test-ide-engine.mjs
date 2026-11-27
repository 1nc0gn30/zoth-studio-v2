#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  IDE_ENGINE_VERSION,
  IDE_STARTER_FILES,
  IDE_VULNERABLE_SAMPLE,
  IDE_HARDENED_SAMPLE,
  sha256Hex,
  isValidRepoSlug,
  isValidRelativeFilePath,
  isBlockedSecretPath,
  redactIdeOutput,
  analyzeSourceStructure,
  lintSourceCode,
  computeUnifiedDiff,
  evaluatePureExpression,
  buildIdeExports,
  buildOfflineIdeSnapshot,
} from '../src/utils/ideEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('src/utils/ideEngine.js and server/ide-engine.mjs are byte-identical', () => {
  const clientBuf = fs.readFileSync(path.join(rootDir, 'src/utils/ideEngine.js'));
  const serverBuf = fs.readFileSync(path.join(rootDir, 'server/ide-engine.mjs'));
  assert.equal(Buffer.compare(clientBuf, serverBuf), 0, 'Client and server IDE engine mirrors drifted');
  assert.equal(IDE_ENGINE_VERSION, '2.3.0');
});

test('FIPS 180-4 SHA-256 matches standard NIST test vectors', () => {
  assert.equal(
    sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  );
  assert.equal(
    sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('multi-language AST & symbol outline extractor parses JS, Python, Rust, JSON, YAML, Markdown', () => {
  for (const starter of IDE_STARTER_FILES) {
    const res = analyzeSourceStructure(starter.content, starter.language);
    assert.ok(res.lineCount > 5, `${starter.filename} lineCount`);
    assert.ok(res.tokenCount > 10, `${starter.filename} tokenCount`);
    assert.ok(res.symbols.length >= 2, `${starter.filename} extracted symbols`);
    assert.equal(res.bracketBalance.balanced, true, `${starter.filename} brackets balanced`);
    assert.match(res.sha256, /^[0-9a-f]{64}$/);
  }

  const pyRes = analyzeSourceStructure(IDE_STARTER_FILES[1].content, 'python');
  assert.ok(pyRes.imports.some((i) => i.source === 'dataclasses'));
  assert.ok(pyRes.symbols.some((s) => s.kind === 'class' && s.name === 'ProbeSample'));
  assert.ok(pyRes.symbols.some((s) => s.kind === 'function' && s.name === 'probe_loopback_port'));

  const rsRes = analyzeSourceStructure(IDE_STARTER_FILES[2].content, 'rust');
  assert.ok(rsRes.symbols.some((s) => s.kind === 'struct' && s.name === 'QuorumSpec'));
  assert.ok(rsRes.symbols.some((s) => s.kind === 'impl' && s.name === 'QuorumSpec'));

  const mdRes = analyzeSourceStructure('# Main Title\n\n## Architecture\n\nBody text.', 'markdown');
  assert.equal(mdRes.symbols.length, 2);
  assert.equal(mdRes.symbols[0].kind, 'h1');

  const jsonRes = analyzeSourceStructure('{"ok": true, "count": 4}', 'json');
  assert.equal(jsonRes.jsonValid, true);
  assert.equal(jsonRes.symbols.length, 2);
});

test('static security & hygiene linter detects all critical/high rules and passes clean buffers', () => {
  const vuln = lintSourceCode(
    IDE_VULNERABLE_SAMPLE.content,
    IDE_VULNERABLE_SAMPLE.language,
    IDE_VULNERABLE_SAMPLE.filename,
  );
  const ruleIds = new Set(vuln.findings.map((f) => f.ruleId));
  assert.ok(ruleIds.has('SEC-EVAL'));
  assert.ok(ruleIds.has('SEC-XSS-HTML'));
  assert.ok(ruleIds.has('SEC-SHELL-EXEC'));
  assert.ok(ruleIds.has('SEC-SECRET-KEY'));
  assert.ok(ruleIds.has('SEC-HOME-PATH'));
  assert.ok(ruleIds.has('SEC-EXT-CDN'));
  assert.ok(ruleIds.has('HYG-DEBUG-STMT'));
  assert.ok(ruleIds.has('HYG-CONSOLE-LOG'));
  assert.equal(vuln.score, 0);
  assert.equal(vuln.grade, 'F');

  // Ensure findings excerpts redact secrets & home paths
  for (const f of vuln.findings) {
    assert.ok(!/\/home\/[a-z0-9_-]+\//i.test(f.excerpt), 'Home path leaked in lint excerpt');
    assert.ok(!/ghp_[A-Za-z0-9_]{12,}/.test(f.excerpt), 'Token leaked in lint excerpt');
  }

  const clean = lintSourceCode(
    IDE_HARDENED_SAMPLE.content,
    IDE_HARDENED_SAMPLE.language,
    IDE_HARDENED_SAMPLE.filename,
  );
  assert.equal(clean.summary.total, 0);
  assert.equal(clean.score, 100);
  assert.equal(clean.grade, 'A+');

  const brokenBrackets = lintSourceCode('export function broken(a {\n  return a;\n', 'javascript', 'broken.js');
  assert.ok(brokenBrackets.findings.some((f) => f.ruleId === 'SYN-BRACKET'));
});

test('unified diff generator produces valid LCS hunks and stats', () => {
  const orig = 'line 1\nline 2\nline 3\nline 4';
  const mod = 'line 1\nline 2 edited\nline 3\nline 4\nline 5 added';
  const diff = computeUnifiedDiff(orig, mod, 'demo.js');
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.stats.added, 2);
  assert.equal(diff.stats.removed, 1);
  assert.equal(diff.stats.unchanged, 3);
  assert.ok(diff.patchText.includes('--- a/demo.js'));
  assert.ok(diff.patchText.includes('+++ b/demo.js'));
  assert.ok(diff.patchText.includes('@@ '));
  assert.ok(diff.patchText.includes('-line 2'));
  assert.ok(diff.patchText.includes('+line 2 edited'));
  assert.ok(diff.patchText.includes('+line 5 added'));
});

test('pure expression evaluator computes math/bitwise/crypto safely with zero eval', () => {
  const r1 = evaluatePureExpression('(1 << 10) + clamp(145, 0, 100)');
  assert.equal(r1.ok, true);
  assert.equal(r1.value, 1124);

  const r2 = evaluatePureExpression('sha256("abc")');
  assert.equal(r2.ok, true);
  assert.equal(r2.value, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

  const r3 = evaluatePureExpression('base64Decode(base64Encode("zero-egress"))');
  assert.equal(r3.ok, true);
  assert.equal(r3.value, 'zero-egress');

  const r4 = evaluatePureExpression('jsonValid("{\\"ok\\":true}") && regexTest("^[a-z-]+$", "sovereign-ide")');
  assert.equal(r4.ok, true);
  assert.equal(r4.value, true);

  const blocked = evaluatePureExpression('process.exit(1)');
  assert.equal(blocked.ok, false);

  const blockedFn = evaluatePureExpression('eval("1+1")');
  assert.equal(blockedFn.ok, false);
});

test('security containment helpers validate slugs, block traversal & secret files, and redact output', () => {
  assert.equal(isValidRepoSlug('zoth-studio-v2'), true);
  assert.equal(isValidRepoSlug('.hidden'), false);
  assert.equal(isValidRepoSlug('../etc'), false);
  assert.equal(isValidRepoSlug('a/b'), false);
  assert.equal(isValidRepoSlug('a\\b'), false);

  assert.equal(isValidRelativeFilePath('src/utils/ideEngine.js'), true);
  assert.equal(isValidRelativeFilePath('../package.json'), false);
  assert.equal(isValidRelativeFilePath('/etc/passwd'), false);
  assert.equal(isValidRelativeFilePath('src/\0evil.js'), false);

  for (const blocked of [
    '.env',
    '.env.local',
    'config/.env.production',
    'certs/server.pem',
    'tls/private.key',
    'keys/id_rsa',
    'keys/id_ed25519.pub',
    '.config/gh/hosts.yml',
    '.git-credentials',
    'credentials.json',
    'data/my_secret_notes.txt',
    'auth/api_token.json',
    'state.db',
    'memory.sqlite3',
    '.git/config',
  ]) {
    assert.equal(isBlockedSecretPath(blocked), true, `Expected secret path blocked: ${blocked}`);
  }
  assert.equal(isBlockedSecretPath('src/utils/ideEngine.js'), false);
  assert.equal(isBlockedSecretPath('package.json'), false);

  const redacted = redactIdeOutput({
    path: '/home/operator/NullAITech/zoth-studio-v2/src/app.js',
    tok: `Bearer ${['ghp', '1234567890abcdef1234567890abcdef'].join('_')}`,
  });
  assert.equal(redacted.path, '~/NullAITech/zoth-studio-v2/src/app.js');
  assert.equal(redacted.tok, 'Bearer [REDACTED_TOKEN]');
});

test('exports neutralize CSV formulas and include deterministic SHA-256 receipt', () => {
  const structure = {
    lineCount: 1,
    nonEmptyLines: 1,
    byteLength: 10,
    tokenCount: 3,
    cyclomaticComplexity: 1,
    complexityBand: 'LOW',
    bracketBalance: { balanced: true },
    imports: [],
    exports: [],
    symbols: [{ kind: 'function', name: '=CMD|calc', line: 1, detail: '+danger' }],
    sha256: sha256Hex('demo'),
  };
  const lint = lintSourceCode('export const ok = 1;', 'javascript', 'demo.js');
  const diff = computeUnifiedDiff('a', 'b', 'demo.js');
  const exp = buildIdeExports({ filename: 'demo.js', language: 'javascript', structure, lint, diff });
  assert.match(exp.receiptSha256, /^[0-9a-f]{64}$/);
  assert.ok(exp.csv.includes("'=CMD|calc"), 'Leading = in CSV cell must be neutralized');
  assert.ok(exp.csv.includes("'+danger"), 'Leading + in CSV cell must be neutralized');
  assert.equal(buildOfflineIdeSnapshot().mode, 'BROWSER_OFFLINE_FALLBACK');
});
