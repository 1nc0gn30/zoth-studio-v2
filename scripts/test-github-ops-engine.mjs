import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GITHUB_OPS_VERSION,
  EXPECTED_GITHUB_TOOLCHAINS,
  isValidRepoSlug,
  redactSensitiveOutput,
  redactPayload,
  maskSigningKey,
  neutralizeCsvCell,
  parseGitRemotes,
  parseGitStatusPorcelainV2,
  auditRepository,
  parseConventionalCommits,
  lintWorkflowYaml,
  evaluateSigningConfig,
  buildHostGitSnapshot,
  buildOfflineGitSnapshot,
  SAMPLE_COMMIT_LOG,
  SAMPLE_WORKFLOW_HARDENED,
  SAMPLE_WORKFLOW_VULNERABLE,
  exportGitHubOpsJson,
  exportGitHubOpsMarkdown,
  exportGitHubOpsCsv,
} from '../src/utils/githubOpsEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

test('src/utils/githubOpsEngine.js and server/github-ops-engine.mjs are byte-identical', () => {
  const clientBytes = fs.readFileSync(path.join(rootDir, 'src/utils/githubOpsEngine.js'));
  const serverBytes = fs.readFileSync(path.join(rootDir, 'server/github-ops-engine.mjs'));
  assert.equal(Buffer.compare(clientBytes, serverBytes), 0, 'Client and server githubOpsEngine must be byte-identical');
  assert.equal(GITHUB_OPS_VERSION, '2.3.0');
});

test('isValidRepoSlug enforces strict slug allowlist and blocks traversal', () => {
  assert.equal(isValidRepoSlug('zoth-studio-v2'), true);
  assert.equal(isValidRepoSlug('bolt.diy'), true);
  assert.equal(isValidRepoSlug('repo_01'), true);
  assert.equal(isValidRepoSlug('../etc/passwd'), false);
  assert.equal(isValidRepoSlug('..'), false);
  assert.equal(isValidRepoSlug('.'), false);
  assert.equal(isValidRepoSlug('foo/bar'), false);
  assert.equal(isValidRepoSlug('foo\\bar'), false);
  assert.equal(isValidRepoSlug('repo;rm -rf /'), false);
  assert.equal(isValidRepoSlug(''), false);
  assert.equal(isValidRepoSlug('a'.repeat(101)), false);
});

test('redactSensitiveOutput scrubs home paths, embedded remote credentials, token shapes, and private keys', () => {
  const fakePat = 'ghp_' + 'AbCdEf1234567890XyZ';
  const fakeFinePat = 'github_pat_' + '11ABCDEF0123456789_xyz987654321';
  const fakeOpenAi = 'sk-' + 'testKey9876543210abcdef';
  const fakeAws = 'AKIA' + 'IOSFODNN7EXAMPLE';
  const input = [
    'Repo path: /home/operator/NullAITech/zoth-studio-v2',
    'Mac path: /Users/alice/dev/repo',
    `Remote: https://alice:${fakePat}@github.com/NullAITech/zoth-studio-v2.git`,
    `Tokens: ${fakePat} ${fakeFinePat} ${fakeOpenAi} ${fakeAws}`,
    '-----BEGIN OPENSSH PRIVATE KEY-----\nabc123\n-----END OPENSSH PRIVATE KEY-----',
  ].join('\n');

  const clean = redactSensitiveOutput(input);
  assert.ok(!clean.includes('/home/operator'));
  assert.ok(!clean.includes('/Users/alice'));
  assert.ok(!clean.includes(fakePat));
  assert.ok(!clean.includes(fakeFinePat));
  assert.ok(!clean.includes(fakeOpenAi));
  assert.ok(!clean.includes(fakeAws));
  assert.ok(!clean.includes('BEGIN OPENSSH PRIVATE KEY'));
  assert.ok(clean.includes('~/NullAITech/zoth-studio-v2'));
  assert.ok(clean.includes('https://[REDACTED_CRED]@github.com/NullAITech/zoth-studio-v2.git'));
  assert.ok(clean.includes('[REDACTED_TOKEN]'));
  assert.ok(clean.includes('[REDACTED_PRIVATE_KEY]'));
});

test('parseGitRemotes & parseGitStatusPorcelainV2 audit dual-org parity, dirty trees, and credential leaks', () => {
  const dualRemote = [
    'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (fetch)',
    'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (push)',
    'personal\tgit@github.com:1nc0gn30/zoth-studio-v2.git (fetch)',
    'personal\tgit@github.com:1nc0gn30/zoth-studio-v2.git (push)',
  ].join('\n');

  const cleanStatus = [
    '# branch.oid 89cec2c691e9023a25bab6d42c2541c54f3fd053',
    '# branch.head main',
    '# branch.upstream origin/main',
    '# branch.ab +0 -0',
  ].join('\n');

  const cleanAudit = auditRepository({
    repo: 'zoth-studio-v2',
    remoteText: dualRemote,
    statusText: cleanStatus,
    signing: { commitGpgSign: true, gpgFormat: 'ssh' },
  });
  assert.equal(cleanAudit.score, 100);
  assert.equal(cleanAudit.grade, 'A+');
  assert.equal(cleanAudit.remotes.dualOrgReady, true);
  assert.equal(cleanAudit.status.clean, true);
  assert.equal(cleanAudit.status.branch, 'main');

  const leakyRemote = `origin\thttps://user:ghp_SecretToken999999999@github.com/NullAITech/zoth-studio-v2.git (fetch)`;
  const dirtyDetached = [
    '# branch.oid 1234567890abcdef',
    '# branch.head (detached)',
    '# branch.ab +2 -3',
    '1 M. N... 100644 100644 100644 a b src/index.js',
    '1 .M N... 100644 100644 100644 a b src/app.js',
    '? /home/operator/untracked.tmp',
  ].join('\n');

  const dirtyAudit = auditRepository({
    repo: 'zoth-studio-v2',
    remoteText: leakyRemote,
    statusText: dirtyDetached,
  });
  assert.equal(dirtyAudit.remotes.embeddedCredLeaks, 1);
  assert.equal(dirtyAudit.remotes.dualOrgReady, false);
  assert.equal(dirtyAudit.status.detached, true);
  assert.equal(dirtyAudit.status.staged, 1);
  assert.equal(dirtyAudit.status.unstaged, 1);
  assert.equal(dirtyAudit.status.untracked, 1);
  assert.equal(dirtyAudit.status.dirtyCount, 3);
  assert.equal(dirtyAudit.status.behind, 3);
  assert.ok(dirtyAudit.score < 50);
  assert.ok(!JSON.stringify(dirtyAudit).includes('SecretToken999999999'));
  assert.ok(!JSON.stringify(dirtyAudit).includes('/home/operator'));
});

test('parseConventionalCommits computes semver bumps, flags non-conforming commits, and builds release notes', () => {
  const minor = parseConventionalCommits(SAMPLE_COMMIT_LOG, { currentVersion: '2.3.0', repoName: 'zoth-studio-v2' });
  assert.equal(minor.bump, 'MINOR');
  assert.equal(minor.nextVersion, '2.4.0');
  assert.equal(minor.compliancePct, 100);
  assert.equal(minor.nonConformingCount, 0);
  assert.ok(minor.releaseNotesMarkdown.includes('## Release `v2.4.0`'));
  assert.ok(minor.releaseNotesMarkdown.includes('Engineered by Neal Frazier Tech (@1nc0gn30)'));

  const mixedLog = [
    'abc1234 feat(api)!: remove legacy /studio/github-tool.html',
    'def5678 fix: handle detached HEAD',
    'WIP forgot conventional prefix',
  ].join('\n');
  const major = parseConventionalCommits(mixedLog, { currentVersion: '2.3.0', repoName: 'zoth-studio-v2' });
  assert.equal(major.bump, 'MAJOR');
  assert.equal(major.nextVersion, '3.0.0');
  assert.equal(major.breakingCount, 1);
  assert.equal(major.nonConformingCount, 1);
  assert.ok(major.releaseNotesMarkdown.includes('### Breaking Changes'));
  assert.ok(major.releaseNotesMarkdown.includes('### Needs Conventional Rewording'));

  const patchOnly = parseConventionalCommits('fix(ci): pin checkout SHA', { currentVersion: '2.3.0' });
  assert.equal(patchOnly.bump, 'PATCH');
  assert.equal(patchOnly.nextVersion, '2.3.1');
});

test('lintWorkflowYaml scores hardened CI workflows highly and catches supply-chain/PR-target flaws', () => {
  const good = lintWorkflowYaml(SAMPLE_WORKFLOW_HARDENED);
  assert.equal(good.score, 100);
  assert.equal(good.grade, 'A+');
  assert.equal(good.pinnedShaCount, 2);
  assert.equal(good.unpinnedCount, 0);
  assert.equal(good.hasPermissionsBlock, true);
  assert.equal(good.hasConcurrency, true);

  const bad = lintWorkflowYaml(SAMPLE_WORKFLOW_VULNERABLE);
  assert.ok(bad.score <= 30, `Expected vulnerable workflow score <= 30, got ${bad.score}`);
  assert.equal(bad.unpinnedMutableHits, 1);
  assert.equal(bad.secretEchoHits, 1);
  assert.equal(bad.scriptInjectionHits, 1);
  assert.equal(bad.hasPermissionsBlock, false);
  const codes = new Set(bad.findings.map((f) => f.code));
  assert.ok(codes.has('ACTION_UNPINNED_BRANCH'));
  assert.ok(codes.has('PWN_REQUEST_PR_TARGET'));
  assert.ok(codes.has('SECRET_ECHO_RISK'));
  assert.ok(codes.has('SCRIPT_INJECTION_EXPR'));
  assert.ok(codes.has('PERMISSIONS_MISSING'));
  assert.ok(codes.has('CONCURRENCY_MISSING'));
});

test('evaluateSigningConfig strips private keys and generates clean .gitconfig and dual-push commands', () => {
  const safe = evaluateSigningConfig({
    commitGpgSign: true,
    tagGpgSign: true,
    gpgFormat: 'ssh',
    signingKey: '~/.ssh/id_ed25519.pub',
    repoSlug: 'zoth-studio-v2',
  });
  assert.equal(safe.score, 100);
  assert.equal(safe.privateKeyDetected, false);
  assert.ok(safe.gitconfigSnippet.includes('format = ssh'));
  assert.ok(safe.dualPushCommands.includes('NullAITech/zoth-studio-v2.git'));
  assert.ok(safe.dualPushCommands.includes('1nc0gn30/zoth-studio-v2.git'));

  const unsafe = evaluateSigningConfig({
    commitGpgSign: true,
    gpgFormat: 'ssh',
    signingKey: '-----BEGIN OPENSSH PRIVATE KEY-----\nSECRET_MATERIAL',
  });
  assert.equal(unsafe.privateKeyDetected, true);
  assert.ok(!unsafe.gitconfigSnippet.includes('SECRET_MATERIAL'));
  assert.ok(!unsafe.signingKeyMasked.includes('SECRET_MATERIAL'));
  assert.equal(maskSigningKey('ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMockKeyData1234567890'), 'ssh-ed25519 AAAAC3Nz...567890');
});

test('buildHostGitSnapshot, buildOfflineGitSnapshot, and formula-safe JSON/MD/CSV exports redact leaks', () => {
  const hostSnap = buildHostGitSnapshot({
    toolchains: [
      { id: 'git', installed: true, path: '/usr/bin/git', version: 'git version 2.47.3' },
      { id: 'gh', installed: true, path: '/home/operator/.local/bin/gh', version: 'gh version 2.46.0' },
    ],
    repos: [
      auditRepository({
        repo: 'zoth-studio-v2',
        remoteText: 'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (fetch)\npersonal\thttps://github.com/1nc0gn30/zoth-studio-v2.git (fetch)',
        statusText: '# branch.head main\n# branch.ab +0 -0',
      }),
    ],
    totalRepoCount: 141,
  });
  assert.equal(hostSnap.mode, 'LIVE_HOST_GIT');
  assert.equal(hostSnap.toolchains.length, EXPECTED_GITHUB_TOOLCHAINS.length);
  assert.equal(hostSnap.summary.toolchainsInstalled, 2);
  assert.equal(hostSnap.summary.totalReposDiscovered, 141);
  assert.ok(!JSON.stringify(hostSnap).includes('/home/operator'));

  const offlineSnap = buildOfflineGitSnapshot();
  assert.equal(offlineSnap.mode, 'BROWSER_OFFLINE_FALLBACK');
  assert.ok(offlineSnap.repos.length >= 3);

  assert.equal(neutralizeCsvCell('=HYPERLINK("http://evil")'), `"'=HYPERLINK(\\"http://evil\\")"`.slice(1, -1).replace(/\\"/g, '"'));
  assert.equal(neutralizeCsvCell('+1+2'), "'+1+2");
  assert.equal(neutralizeCsvCell('-1+2'), "'-1+2");
  assert.equal(neutralizeCsvCell('@SUM(A1:A2)'), "'@SUM(A1:A2)");
  assert.equal(neutralizeCsvCell('\t=CMD()'), "'\t=CMD()");

  const csv = exportGitHubOpsCsv({
    repos: hostSnap.repos,
    customRows: [
      { repo: '=CMD()', branch: '+main', clean: true, dirtyCount: 0, ahead: 0, behind: 0, dualOrgReady: true, owners: '@org', score: 100, grade: 'A+', lastCommit: '/home/operator/fix' },
    ],
  });
  assert.ok(!csv.includes('/home/operator'));
  assert.ok(csv.includes("'=CMD()"));
  assert.ok(csv.includes("'+main"));
  assert.ok(csv.includes("'@org"));

  const json = exportGitHubOpsJson({ snapshot: hostSnap, repoAudit: hostSnap.repos[0] });
  const md = exportGitHubOpsMarkdown({ snapshot: hostSnap, repoAudit: hostSnap.repos[0] });
  assert.ok(!json.includes('/home/operator'));
  assert.ok(!md.includes('/home/operator'));
  assert.ok(md.includes('Engineered by Neal Frazier Tech (@1nc0gn30)'));
  assert.deepEqual(redactPayload({ p: '/home/operator/x' }), { p: '~/x' });
});
