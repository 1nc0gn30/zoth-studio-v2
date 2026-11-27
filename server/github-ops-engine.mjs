/**
 * Zoth GitHub Studio & Autonomous Repo Workstation — Pure Deterministic Engine (v2.3.0)
 *
 * Shared byte-identically between browser (`src/utils/githubOpsEngine.js`)
 * and loopback Studio API (`server/github-ops-engine.mjs`).
 *
 * Invariants:
 *  - Zero external dependencies, zero Math.random(), zero shell/network I/O.
 *  - Zero secret/token reads; scrubs embedded credentials, token shapes, and /home/<user> paths.
 *  - Neutralizes CSV spreadsheet formula injection (=, +, -, @, tab, CR).
 */

export const GITHUB_OPS_VERSION = '2.3.0';

export const DUAL_ORG_OWNERS = Object.freeze({
  primary: 'NullAITech',
  personal: '1nc0gn30',
});

export const EXPECTED_GITHUB_TOOLCHAINS = Object.freeze([
  { id: 'git', label: 'git', category: 'VCS', purpose: 'Core Git repository & worktree engine' },
  { id: 'gh', label: 'gh', category: 'GitHub CLI', purpose: 'GitHub PR, issue, release & Actions CLI' },
  { id: 'gpg', label: 'gpg', category: 'Signing', purpose: 'OpenPGP commit & tag signature verification' },
  { id: 'ssh', label: 'ssh', category: 'Transport & Signing', purpose: 'SSH remote transport & ssh-keygen signing' },
]);

export const REPO_SLUG_REGEX = /^[A-Za-z0-9._-]{1,100}$/;

const CONVENTIONAL_TYPE_MAP = Object.freeze({
  feat: 'Features',
  fix: 'Bug Fixes',
  security: 'Security Hardening',
  perf: 'Performance',
  refactor: 'Refactoring',
  docs: 'Documentation',
  test: 'Tests',
  ci: 'CI & Automation',
  build: 'Build System',
  chore: 'Chores',
  style: 'Code Style',
  revert: 'Reverts',
});

const TOKEN_PATTERNS = [
  /\bgithub_pat_[A-Za-z0-9_]{12,}\b/g,
  /\bghp_[A-Za-z0-9_]{12,}\b/g,
  /\bgho_[A-Za-z0-9_]{12,}\b/g,
  /\bghu_[A-Za-z0-9_]{12,}\b/g,
  /\bghs_[A-Za-z0-9_]{12,}\b/g,
  /\bghr_[A-Za-z0-9_]{12,}\b/g,
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bAIza[0-9A-Za-z_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];

const PRIVATE_KEY_MARKER_RE = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g;
const PRIVATE_KEY_HEADER_RE = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/i;
const URL_EMBEDDED_CRED_RE = /(https?:\/\/)([^/\s:@]+):([^/\s@]+)@/gi;
const HOME_PATH_RE = /(?:\/home|\/Users)\/[A-Za-z0-9._-]+(?=\/|["'`\s,;:)>\]]|$)/g;

export function isValidRepoSlug(slug) {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (!trimmed || trimmed === '.' || trimmed === '..') return false;
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) return false;
  return REPO_SLUG_REGEX.test(trimmed);
}

/**
 * Redacts literal /home/<user> paths, embedded URL credentials, token shapes,
 * and private key blocks from arbitrary text.
 */
export function redactSensitiveOutput(input) {
  if (input === null || input === undefined) return '';
  let out = String(input);
  out = out.replace(PRIVATE_KEY_MARKER_RE, '[REDACTED_PRIVATE_KEY]');
  if (PRIVATE_KEY_HEADER_RE.test(out)) {
    out = out.replace(PRIVATE_KEY_HEADER_RE, '[REDACTED_PRIVATE_KEY]');
  }
  out = out.replace(URL_EMBEDDED_CRED_RE, '$1[REDACTED_CRED]@');
  for (const re of TOKEN_PATTERNS) {
    out = out.replace(re, '[REDACTED_TOKEN]');
  }
  out = out.replace(HOME_PATH_RE, '~');
  return out;
}

export function redactPayload(value) {
  if (typeof value === 'string') return redactSensitiveOutput(value);
  if (Array.isArray(value)) return value.map((item) => redactPayload(item));
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      clean[k] = redactPayload(v);
    }
    return clean;
  }
  return value;
}

export function maskSigningKey(rawKey) {
  const s = redactSensitiveOutput(String(rawKey || '')).trim();
  if (!s) return '';
  if (s.includes('[REDACTED_PRIVATE_KEY]') || s.includes('[REDACTED_TOKEN]')) {
    return '[REDACTED_KEY_MATERIAL]';
  }
  if (s.startsWith('ssh-') || s.startsWith('ecdsa-') || s.startsWith('sk-ssh-')) {
    const parts = s.split(/\s+/);
    const algo = parts[0] || 'ssh-ed25519';
    const body = parts[1] || '';
    const maskedBody = body.length > 16 ? `${body.slice(0, 8)}...${body.slice(-6)}` : '[KEY]';
    return `${algo} ${maskedBody}`;
  }
  if (s.startsWith('~') || s.startsWith('/')) {
    return s;
  }
  if (s.length > 12) {
    return `${s.slice(0, 6)}...${s.slice(-4)}`;
  }
  return s;
}

export function neutralizeCsvCell(value) {
  const safe = redactSensitiveOutput(value === null || value === undefined ? '' : String(value));
  const trimmedStart = safe.replace(/^ +/, '');
  const needsPrefix =
    safe.length > 0 &&
    (/^[=+\-@\t\r]/.test(safe) || /^[=+\-@\t\r]/.test(trimmedStart));
  return needsPrefix ? `'${safe}` : safe;
}

function escapeCsvField(value) {
  const cell = neutralizeCsvCell(value);
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function gradeFromScore(score) {
  const n = Number(score) || 0;
  if (n >= 95) return 'A+';
  if (n >= 90) return 'A';
  if (n >= 80) return 'B';
  if (n >= 70) return 'C';
  if (n >= 60) return 'D';
  return 'F';
}

function extractGitHubSlug(url) {
  const raw = String(url || '').trim();
  // Match https://github.com/owner/repo(.git) or https://user:pass@github.com/owner/repo(.git)
  const httpsMatch = raw.match(/https?:\/\/(?:[^/\s@]+@)?github\.com\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/i);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2], protocol: 'https' };
  }
  // Match git@github.com:owner/repo(.git) or ssh://git@github.com/owner/repo(.git)
  const sshMatch = raw.match(/(?:git@github\.com:|ssh:\/\/git@github\.com\/)([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2], protocol: 'ssh' };
  }
  return null;
}

/**
 * Parses `git remote -v` output and evaluates dual-org (`NullAITech` + `1nc0gn30`) parity
 * and credential-in-URL leaks.
 */
export function parseGitRemotes(remoteText = '') {
  const lines = String(remoteText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const byName = new Map();
  let embeddedCredLeaks = 0;

  for (const line of lines) {
    // Format: origin\thttps://github.com/NullAITech/zoth-studio-v2.git (fetch)
    const match = line.match(/^([A-Za-z0-9._-]+)\s+(\S+)(?:\s+\((fetch|push)\))?$/);
    if (!match) continue;
    const [, name, rawUrl, direction = 'fetch'] = match;
    const hasEmbeddedCred = URL_EMBEDDED_CRED_RE.test(rawUrl);
    URL_EMBEDDED_CRED_RE.lastIndex = 0;
    const hasTokenShape = TOKEN_PATTERNS.some((re) => {
      re.lastIndex = 0;
      return re.test(rawUrl);
    });
    if (hasEmbeddedCred || hasTokenShape) {
      embeddedCredLeaks += 1;
    }

    const sanitizedUrl = redactSensitiveOutput(rawUrl);
    const gh = extractGitHubSlug(rawUrl);
    const existing = byName.get(name) || {
      name,
      fetchUrl: null,
      pushUrl: null,
      owner: gh?.owner || null,
      repo: gh?.repo || null,
      protocol: gh?.protocol || (sanitizedUrl.startsWith('https://') ? 'https' : sanitizedUrl.startsWith('http://') ? 'http' : 'other'),
      hasEmbeddedCred: false,
    };
    if (direction === 'push') {
      existing.pushUrl = sanitizedUrl;
    } else {
      existing.fetchUrl = sanitizedUrl;
    }
    if (!existing.owner && gh?.owner) existing.owner = gh.owner;
    if (!existing.repo && gh?.repo) existing.repo = gh.repo;
    if (hasEmbeddedCred || hasTokenShape) existing.hasEmbeddedCred = true;
    byName.set(name, existing);
  }

  const remotes = Array.from(byName.values());
  const owners = Array.from(new Set(remotes.map((r) => r.owner).filter(Boolean)));
  const ownersLower = owners.map((o) => o.toLowerCase());
  const hasNullAITech = ownersLower.includes(DUAL_ORG_OWNERS.primary.toLowerCase());
  const hasPersonal1nc0gn30 = ownersLower.includes(DUAL_ORG_OWNERS.personal.toLowerCase());
  const dualOrgReady = hasNullAITech && hasPersonal1nc0gn30;
  const repoNames = Array.from(new Set(remotes.map((r) => r.repo).filter(Boolean)));
  const slugMismatch = repoNames.length > 1;

  return {
    remotes,
    remoteCount: remotes.length,
    owners,
    hasNullAITech,
    hasPersonal1nc0gn30,
    dualOrgReady,
    repoNames,
    slugMismatch,
    embeddedCredLeaks,
  };
}

/**
 * Parses `git status --porcelain=v2 --branch` (and porcelain v1 fallback).
 */
export function parseGitStatusPorcelainV2(statusText = '') {
  const lines = String(statusText || '').split(/\r?\n/);
  let oid = null;
  let branch = null;
  let upstream = null;
  let ahead = 0;
  let behind = 0;
  let detached = false;
  let staged = 0;
  let unstaged = 0;
  let untracked = 0;
  let unmerged = 0;
  const files = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith('# branch.oid ')) {
      oid = line.slice('# branch.oid '.length).trim();
      continue;
    }
    if (line.startsWith('# branch.head ')) {
      branch = line.slice('# branch.head '.length).trim();
      if (branch === '(detached)') detached = true;
      continue;
    }
    if (line.startsWith('# branch.upstream ')) {
      upstream = line.slice('# branch.upstream '.length).trim();
      continue;
    }
    if (line.startsWith('# branch.ab ')) {
      const m = line.match(/\+(\d+)\s+-(\d+)/);
      if (m) {
        ahead = Number(m[1]) || 0;
        behind = Number(m[2]) || 0;
      }
      continue;
    }
    if (line.startsWith('## ')) {
      // Porcelain v1 branch header fallback: ## main...origin/main [ahead 1, behind 2]
      const header = line.slice(3).trim();
      if (header.startsWith('HEAD (no branch)') || header.includes('detached')) {
        detached = true;
        branch = '(detached)';
      } else {
        const [branchPart, bracketPart] = header.split(/\s+\[/);
        const [localB, upB] = branchPart.split('...');
        branch = localB?.trim() || branch;
        if (upB) upstream = upB.trim();
        if (bracketPart) {
          const am = bracketPart.match(/ahead (\d+)/);
          const bm = bracketPart.match(/behind (\d+)/);
          if (am) ahead = Number(am[1]) || 0;
          if (bm) behind = Number(bm[1]) || 0;
        }
      }
      continue;
    }

    // Porcelain v2 ordinary changed entry: 1 XY sub mH mI mW hH hI path
    if (line.startsWith('1 ') || line.startsWith('2 ')) {
      const parts = line.split(' ');
      const xy = parts[1] || '..';
      const x = xy[0] || '.';
      const y = xy[1] || '.';
      if (x !== '.') staged += 1;
      if (y !== '.') unstaged += 1;
      const filePath = line.startsWith('2 ')
        ? parts.slice(9).join(' ')
        : parts.slice(8).join(' ');
      if (files.length < 50) {
        files.push({ status: xy, path: redactSensitiveOutput(filePath || '(unknown)') });
      }
      continue;
    }

    // Porcelain v2 unmerged entry: u XY ...
    if (line.startsWith('u ')) {
      unmerged += 1;
      const parts = line.split(' ');
      if (files.length < 50) {
        files.push({ status: parts[1] || 'UU', path: redactSensitiveOutput(parts.slice(10).join(' ') || '(conflict)') });
      }
      continue;
    }

    // Porcelain v2 untracked: ? path
    if (line.startsWith('? ')) {
      untracked += 1;
      if (files.length < 50) {
        files.push({ status: '??', path: redactSensitiveOutput(line.slice(2).trim()) });
      }
      continue;
    }

    // Porcelain v1 fallback: XY path (e.g. "?? file", " M file", "M  file")
    if (/^[ MADRCU?!]{2}\s+/.test(line)) {
      const xy = line.slice(0, 2);
      const filePath = line.slice(3).trim();
      if (xy === '??') {
        untracked += 1;
      } else if (xy.includes('U') || xy === 'AA' || xy === 'DD') {
        unmerged += 1;
      } else {
        if (xy[0] !== ' ') staged += 1;
        if (xy[1] !== ' ') unstaged += 1;
      }
      if (files.length < 50) {
        files.push({ status: xy.trim() || 'M', path: redactSensitiveOutput(filePath) });
      }
    }
  }

  const dirtyCount = staged + unstaged + untracked + unmerged;
  return {
    oid: oid && oid !== '(initial)' ? oid.slice(0, 12) : oid,
    branch: branch || 'unknown',
    upstream,
    detached,
    ahead,
    behind,
    staged,
    unstaged,
    untracked,
    unmerged,
    dirtyCount,
    clean: dirtyCount === 0,
    files,
  };
}

/**
 * Audits a repository from remote text + status text + optional metadata.
 */
export function auditRepository({
  repo = 'custom-repo',
  remoteText = '',
  statusText = '',
  lastCommit = null,
  signing = null,
} = {}) {
  const remoteAudit = parseGitRemotes(remoteText);
  const statusAudit = parseGitStatusPorcelainV2(statusText);
  const findings = [];
  let score = 100;

  if (remoteAudit.embeddedCredLeaks > 0) {
    score -= 35;
    findings.push({
      severity: 'critical',
      code: 'REMOTE_CREDENTIAL_LEAK',
      title: 'Embedded credential or token found in Git remote URL',
      detail: `${remoteAudit.embeddedCredLeaks} remote URL(s) contain inline user:token credentials (scrubbed in output).`,
      remediation: 'Switch remotes to SSH (git@github.com:org/repo.git) or credential-helper HTTPS URLs without inline tokens, and rotate any exposed PAT.',
    });
  }

  if (remoteAudit.remoteCount === 0) {
    score -= 25;
    findings.push({
      severity: 'high',
      code: 'NO_REMOTES_CONFIGURED',
      title: 'No Git remotes detected',
      detail: 'Repository has zero configured remotes.',
      remediation: `Configure dual-org remotes: git remote add origin git@github.com:${DUAL_ORG_OWNERS.primary}/${repo}.git && git remote add personal git@github.com:${DUAL_ORG_OWNERS.personal}/${repo}.git`,
    });
  } else if (!remoteAudit.dualOrgReady) {
    const missing = [];
    if (!remoteAudit.hasNullAITech) missing.push(DUAL_ORG_OWNERS.primary);
    if (!remoteAudit.hasPersonal1nc0gn30) missing.push(DUAL_ORG_OWNERS.personal);
    score -= missing.length === 2 ? 25 : 15;
    findings.push({
      severity: 'high',
      code: 'DUAL_ORG_PARITY_MISSING',
      title: `Dual-org mirror incomplete (missing ${missing.join(' & ')})`,
      detail: `Observed remote owners: ${remoteAudit.owners.length ? remoteAudit.owners.join(', ') : 'none'}. ZothOS dual-org parity requires both ${DUAL_ORG_OWNERS.primary} and ${DUAL_ORG_OWNERS.personal}.`,
      remediation: `Add missing remote (${missing.join(', ')}) and push both remotes on release.`,
    });
  } else {
    findings.push({
      severity: 'pass',
      code: 'DUAL_ORG_PARITY_OK',
      title: 'Dual-org remote parity verified (NullAITech + 1nc0gn30)',
      detail: `Remotes mirror across ${remoteAudit.owners.join(' + ')}.`,
      remediation: 'Keep both remotes synchronized on every release push.',
    });
  }

  if (remoteAudit.slugMismatch) {
    score -= 8;
    findings.push({
      severity: 'medium',
      code: 'REMOTE_SLUG_MISMATCH',
      title: 'Remote repository slugs differ across orgs',
      detail: `Detected distinct repo names across remotes: ${remoteAudit.repoNames.join(', ')}.`,
      remediation: 'Verify whether intentional fork alias or rename so CI/mirror scripts target the right slug.',
    });
  }

  if (statusAudit.detached) {
    score -= 15;
    findings.push({
      severity: 'high',
      code: 'DETACHED_HEAD',
      title: 'Repository is in detached HEAD state',
      detail: `HEAD points directly at commit ${statusAudit.oid || 'unknown'} rather than a named branch.`,
      remediation: 'Create or checkout a named branch (git checkout -b <branch> or git switch main) before committing.',
    });
  }

  if (statusAudit.unmerged > 0) {
    score -= 20;
    findings.push({
      severity: 'critical',
      code: 'UNMERGED_CONFLICTS',
      title: `${statusAudit.unmerged} unmerged conflict file(s) present`,
      detail: 'Merge or rebase conflict markers block clean commits and releases.',
      remediation: 'Resolve all conflict files, stage them, and complete the merge/rebase.',
    });
  }

  if (statusAudit.dirtyCount > 0) {
    score -= statusAudit.dirtyCount > 10 ? 15 : 10;
    findings.push({
      severity: 'medium',
      code: 'DIRTY_WORKING_TREE',
      title: `Working tree has ${statusAudit.dirtyCount} uncommitted change(s)`,
      detail: `Staged: ${statusAudit.staged}, Unstaged: ${statusAudit.unstaged}, Untracked: ${statusAudit.untracked}.`,
      remediation: 'Review diff, commit with Conventional Commits, or stash/clean untracked build artifacts before tagging.',
    });
  } else {
    findings.push({
      severity: 'pass',
      code: 'CLEAN_WORKING_TREE',
      title: 'Working tree is clean',
      detail: `Branch ${statusAudit.branch} has 0 uncommitted changes.`,
      remediation: 'Ready for clean pull, merge, or release tag.',
    });
  }

  if (statusAudit.behind > 0) {
    score -= 8;
    findings.push({
      severity: 'medium',
      code: 'BRANCH_BEHIND_UPSTREAM',
      title: `Branch is ${statusAudit.behind} commit(s) behind upstream`,
      detail: `Upstream ${statusAudit.upstream || 'tracking branch'} has unpulled commits.`,
      remediation: 'Run git fetch --all --prune && git pull --ff-only before pushing.',
    });
  }

  if (statusAudit.ahead > 0) {
    score -= 3;
    findings.push({
      severity: 'info',
      code: 'BRANCH_AHEAD_UPSTREAM',
      title: `Branch is ${statusAudit.ahead} commit(s) ahead of upstream`,
      detail: 'Local verified commits are pending dual-org push.',
      remediation: 'Push to both origin (NullAITech) and personal (1nc0gn30) once tests pass.',
    });
  }

  if (signing && typeof signing === 'object') {
    if (signing.commitGpgSign !== true) {
      score -= 5;
      findings.push({
        severity: 'info',
        code: 'COMMIT_SIGNING_OFF',
        title: 'Automatic Git commit signing is disabled',
        detail: 'git config commit.gpgsign is not set to true.',
        remediation: 'Enable SSH or GPG signing via Tab 4 (Commit Signing & Dual-Push Playbook).',
      });
    } else {
      findings.push({
        severity: 'pass',
        code: 'COMMIT_SIGNING_ON',
        title: `Commit signing enabled (${signing.gpgFormat || 'openpgp'})`,
        detail: 'Commits are configured to be cryptographically signed.',
        remediation: 'Verify allowed_signers or GPG key expiration periodically.',
      });
    }
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  const sanitizedCommit = lastCommit
    ? {
        hash: redactSensitiveOutput(lastCommit.hash || '').slice(0, 12),
        subject: redactSensitiveOutput(lastCommit.subject || '').slice(0, 140),
        date: redactSensitiveOutput(lastCommit.date || '').slice(0, 40),
      }
    : null;

  return {
    repo: redactSensitiveOutput(repo),
    score: clampedScore,
    grade: gradeFromScore(clampedScore),
    status: statusAudit,
    remotes: remoteAudit,
    lastCommit: sanitizedCommit,
    findings,
  };
}

/**
 * Parses a commit log (`git log --oneline` or plain commit subjects), validates Conventional Commits,
 * calculates semantic version bump, and synthesizes PR / Release Notes Markdown.
 */
export function parseConventionalCommits(logText = '', { currentVersion = '2.3.0', repoName = 'zoth-studio-v2' } = {}) {
  const safeRepo = redactSensitiveOutput(repoName || 'repo');
  const lines = redactSensitiveOutput(logText)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const commits = [];
  const nonConforming = [];
  const groups = {
    breaking: [],
    feat: [],
    fix: [],
    security: [],
    perf: [],
    refactor: [],
    docs: [],
    test: [],
    ci: [],
    build: [],
    chore: [],
    style: [],
    revert: [],
  };

  const convRe = /^(?:([0-9a-f]{7,40})\s+)?([a-z]+)(?:\(([A-Za-z0-9._/-]+)\))?(!)?:\s+(.+)$/;

  lines.forEach((line, idx) => {
    const m = line.match(convRe);
    if (!m) {
      nonConforming.push({
        line: idx + 1,
        raw: line.slice(0, 160),
        reason: 'Does not match <type>(optional-scope)[!]: <description>',
      });
      commits.push({
        line: idx + 1,
        hash: null,
        type: 'non-conforming',
        scope: null,
        breaking: false,
        description: line.slice(0, 160),
        valid: false,
      });
      return;
    }

    const [, hash, rawType, scope = null, bang, desc] = m;
    const type = rawType.toLowerCase();
    const isKnownType = Object.prototype.hasOwnProperty.call(CONVENTIONAL_TYPE_MAP, type);
    const breaking = Boolean(bang) || /BREAKING CHANGE/i.test(desc);

    if (!isKnownType) {
      nonConforming.push({
        line: idx + 1,
        raw: line.slice(0, 160),
        reason: `Unknown commit type "${rawType}". Allowed: ${Object.keys(CONVENTIONAL_TYPE_MAP).join(', ')}`,
      });
      commits.push({
        line: idx + 1,
        hash: hash ? hash.slice(0, 7) : null,
        type,
        scope,
        breaking,
        description: desc.trim(),
        valid: false,
      });
      return;
    }

    const entry = {
      line: idx + 1,
      hash: hash ? hash.slice(0, 7) : null,
      type,
      scope,
      breaking,
      description: desc.trim(),
      valid: true,
    };
    commits.push(entry);
    if (breaking) groups.breaking.push(entry);
    groups[type].push(entry);
  });

  // Compute semantic version bump
  const verMatch = String(currentVersion || '0.0.0').trim().replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  const major = verMatch ? Number(verMatch[1]) : 0;
  const minor = verMatch ? Number(verMatch[2]) : 0;
  const patch = verMatch ? Number(verMatch[3]) : 0;

  let bump = 'NONE';
  let nextVersion = `${major}.${minor}.${patch}`;
  if (groups.breaking.length > 0) {
    bump = 'MAJOR';
    nextVersion = `${major + 1}.0.0`;
  } else if (groups.feat.length > 0) {
    bump = 'MINOR';
    nextVersion = `${major}.${minor + 1}.0`;
  } else if (
    groups.fix.length > 0 ||
    groups.security.length > 0 ||
    groups.perf.length > 0 ||
    groups.refactor.length > 0 ||
    groups.revert.length > 0
  ) {
    bump = 'PATCH';
    nextVersion = `${major}.${minor}.${patch + 1}`;
  }

  const validCount = commits.filter((c) => c.valid).length;
  const compliancePct = commits.length ? Math.round((validCount / commits.length) * 100) : 100;

  const formatCommitBullet = (c) => {
    const scopeStr = c.scope ? `**${c.scope}**: ` : '';
    const hashStr = c.hash ? ` (\`${c.hash}\`)` : '';
    return `- ${scopeStr}${c.description}${hashStr}`;
  };

  const mdLines = [
    `## Release \`v${nextVersion}\` — ${safeRepo}`,
    '',
    `- **Semver Bump**: \`${bump}\` (\`v${major}.${minor}.${patch}\` -> \`v${nextVersion}\`)`,
    `- **Commits Parsed**: ${commits.length} (${validCount} Conventional, ${nonConforming.length} non-conforming, ${compliancePct}% compliant)`,
    '',
  ];

  if (groups.breaking.length > 0) {
    mdLines.push('### Breaking Changes');
    groups.breaking.forEach((c) => mdLines.push(formatCommitBullet(c)));
    mdLines.push('');
  }

  const orderedTypes = ['feat', 'security', 'fix', 'perf', 'refactor', 'docs', 'test', 'ci', 'build', 'chore', 'revert', 'style'];
  for (const t of orderedTypes) {
    if (groups[t].length > 0) {
      mdLines.push(`### ${CONVENTIONAL_TYPE_MAP[t]}`);
      groups[t].forEach((c) => mdLines.push(formatCommitBullet(c)));
      mdLines.push('');
    }
  }

  if (nonConforming.length > 0) {
    mdLines.push('### Needs Conventional Rewording');
    nonConforming.forEach((n) => mdLines.push(`- Line ${n.line}: \`${n.raw}\` — ${n.reason}`));
    mdLines.push('');
  }

  mdLines.push('### Pre-Merge & Dual-Org Release Checklist');
  mdLines.push('- [ ] `npm test` and unit suites exit `0`');
  mdLines.push('- [ ] `tools/scan-secrets.sh` reports `0 leaks`');
  mdLines.push(`- [ ] Dual-org push: \`git push origin main && git push personal main\` (\`${DUAL_ORG_OWNERS.primary}\` + \`${DUAL_ORG_OWNERS.personal}\`)`);
  mdLines.push('');
  mdLines.push('---');
  mdLines.push('_Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform_');

  return {
    repoName: safeRepo,
    currentVersion: `${major}.${minor}.${patch}`,
    nextVersion,
    bump,
    totalCommits: commits.length,
    validCount,
    nonConformingCount: nonConforming.length,
    breakingCount: groups.breaking.length,
    compliancePct,
    commits,
    nonConforming,
    groups,
    releaseNotesMarkdown: mdLines.join('\n'),
  };
}

/**
 * Lints a GitHub Actions workflow YAML string offline for supply-chain and CI-gate risks.
 */
export function lintWorkflowYaml(yamlText = '') {
  const sanitized = redactSensitiveOutput(yamlText);
  const lines = sanitized.split(/\r?\n/);
  const findings = [];
  const actions = [];
  let score = 100;

  const hasPermissionsBlock = /^\s*permissions\s*:/m.test(sanitized);
  const hasWriteAll = /^\s*permissions\s*:\s*write-all\b/im.test(sanitized);
  const hasConcurrency = /^\s*concurrency\s*:/m.test(sanitized);
  const hasCancelInProgress = /^\s*cancel-in-progress\s*:\s*true\b/im.test(sanitized);
  const hasPullRequestTarget = /\bpull_request_target\b/.test(sanitized);
  const hasTimeoutMinutes = /^\s*timeout-minutes\s*:\s*\d+/m.test(sanitized);

  let checksOutPrHead = false;
  let secretEchoHits = 0;
  let scriptInjectionHits = 0;
  let unpinnedMutableHits = 0;
  let floatingTagHits = 0;
  let pinnedShaCount = 0;

  const UNTRUSTED_EXPR_RE = /\$\{\{\s*github\.event\.(?:issue\.title|issue\.body|pull_request\.title|pull_request\.body|pull_request\.head\.ref|pull_request\.head\.label|comment\.body|review\.body|head_commit\.message|commits\[[^\]]+\]\.message)/i;

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    // 1. Detect `uses:` references
    const usesMatch = trimmed.match(/^(?:-\s*)?uses\s*:\s*['"]?([^'"#\s]+)['"]?/);
    if (usesMatch) {
      const ref = usesMatch[1];
      if (!ref.startsWith('./') && !ref.startsWith('docker://')) {
        const atIdx = ref.lastIndexOf('@');
        const actionName = atIdx >= 0 ? ref.slice(0, atIdx) : ref;
        const versionRef = atIdx >= 0 ? ref.slice(atIdx + 1) : '';
        const isPinnedSha = /^[0-9a-f]{40}$/i.test(versionRef);
        const isMutableBranch = /^(main|master|head|latest|develop|dev)$/i.test(versionRef) || !versionRef;
        const status = isPinnedSha ? 'pinned-sha' : isMutableBranch ? 'mutable-branch' : 'floating-tag';

        actions.push({ line: lineNo, action: actionName, ref: versionRef || '(missing)', status });

        if (isPinnedSha) {
          pinnedShaCount += 1;
        } else if (isMutableBranch) {
          unpinnedMutableHits += 1;
          score -= 18;
          findings.push({
            severity: 'high',
            code: 'ACTION_UNPINNED_BRANCH',
            line: lineNo,
            title: `Unpinned mutable branch action: ${ref}`,
            detail: `Line ${lineNo} references mutable ref "@${versionRef || 'none'}", allowing upstream branch mutation to execute arbitrary code in CI.`,
            remediation: `Pin ${actionName} to a full 40-character commit SHA (e.g. ${actionName}@<40-char-sha> # ${versionRef || 'v4'}).`,
          });
        } else {
          floatingTagHits += 1;
          score -= 6;
          findings.push({
            severity: 'medium',
            code: 'ACTION_FLOATING_TAG',
            line: lineNo,
            title: `Floating tag action: ${ref}`,
            detail: `Line ${lineNo} uses mutable Git tag "@${versionRef}" rather than an immutable 40-char commit SHA.`,
            remediation: `Pin ${actionName} to an immutable commit SHA with a version comment.`,
          });
        }
      }
    }

    // 2. Detect PR head checkout under pull_request_target
    if (
      hasPullRequestTarget &&
      /ref\s*:\s*.*\$\{\{\s*github\.event\.pull_request\.head\.(sha|ref)\s*\}\}/i.test(trimmed)
    ) {
      checksOutPrHead = true;
    }

    // 3. Detect secret echo / printenv in run steps
    if (/(?:\becho\b|\bprintf\b|\bcat\b).*\$\{\{\s*secrets\.[A-Za-z0-9_]+\s*\}\}/i.test(trimmed)) {
      secretEchoHits += 1;
      score -= 22;
      findings.push({
        severity: 'critical',
        code: 'SECRET_ECHO_RISK',
        line: lineNo,
        title: 'Secret referenced directly in shell output command',
        detail: `Line ${lineNo} interpolates a GitHub secret inside an echo/printf command, risking log exposure or shell expansion.`,
        remediation: 'Pass secrets exclusively via job/step env: blocks and never print secret values.',
      });
    }

    // 4. Detect untrusted event expression injection
    if (UNTRUSTED_EXPR_RE.test(trimmed)) {
      scriptInjectionHits += 1;
      score -= 18;
      findings.push({
        severity: 'high',
        code: 'SCRIPT_INJECTION_EXPR',
        line: lineNo,
        title: 'Untrusted GitHub event expression interpolated in workflow',
        detail: `Line ${lineNo} embeds attacker-controlled PR/issue metadata directly via \${{ github.event.* }}.`,
        remediation: 'Bind the expression to an intermediate step env: variable and quote "$VAR" in bash.',
      });
    }
  });

  if (hasWriteAll) {
    score -= 25;
    findings.push({
      severity: 'critical',
      code: 'PERMISSIONS_WRITE_ALL',
      line: null,
      title: 'Overly broad permissions: write-all granted to GITHUB_TOKEN',
      detail: 'Granting write-all violates least privilege across repository contents, packages, and deployments.',
      remediation: 'Declare top-level "permissions: { contents: read }" and scope write rights per job.',
    });
  } else if (!hasPermissionsBlock) {
    score -= 15;
    findings.push({
      severity: 'high',
      code: 'PERMISSIONS_MISSING',
      line: null,
      title: 'Missing top-level least-privilege permissions: block',
      detail: 'Without an explicit permissions: block, workflows inherit repository default GITHUB_TOKEN scopes.',
      remediation: 'Add top-level "permissions:\\n  contents: read" to enforce read-only default token scope.',
    });
  } else {
    findings.push({
      severity: 'pass',
      code: 'PERMISSIONS_EXPLICIT',
      line: null,
      title: 'Explicit permissions: block declared',
      detail: 'Workflow declares scoped GITHUB_TOKEN permissions.',
      remediation: 'Keep write scopes minimal and scoped to release jobs only.',
    });
  }

  if (hasPullRequestTarget && checksOutPrHead) {
    score -= 30;
    findings.push({
      severity: 'critical',
      code: 'PWN_REQUEST_PR_TARGET',
      line: null,
      title: 'Unsafe pull_request_target + PR head checkout detected',
      detail: 'Checking out untrusted fork code under pull_request_target exposes repository write tokens and secrets.',
      remediation: 'Switch trigger to pull_request (read-only fork sandbox) or never execute untrusted fork code under pull_request_target.',
    });
  } else if (hasPullRequestTarget) {
    score -= 10;
    findings.push({
      severity: 'medium',
      code: 'PR_TARGET_TRIGGER',
      line: null,
      title: 'pull_request_target trigger requires manual review',
      detail: 'Workflow runs in base repository context with elevated token access.',
      remediation: 'Prefer standard pull_request unless cross-fork labeling/commenting is strictly needed without checkout.',
    });
  }

  if (!hasConcurrency || !hasCancelInProgress) {
    score -= 8;
    findings.push({
      severity: 'medium',
      code: 'CONCURRENCY_MISSING',
      line: null,
      title: 'Missing concurrency cancel-in-progress guard',
      detail: 'Rapid pushes can run redundant CI jobs simultaneously or race deployments.',
      remediation: 'Add "concurrency:\\n  group: ${{ github.workflow }}-${{ github.ref }}\\n  cancel-in-progress: true".',
    });
  } else {
    findings.push({
      severity: 'pass',
      code: 'CONCURRENCY_OK',
      line: null,
      title: 'Concurrency cancel-in-progress configured',
      detail: 'Superseded workflow runs cancel automatically.',
      remediation: 'No action required.',
    });
  }

  if (!hasTimeoutMinutes) {
    score -= 4;
    findings.push({
      severity: 'info',
      code: 'TIMEOUT_MISSING',
      line: null,
      title: 'Jobs omit explicit timeout-minutes',
      detail: 'Default GitHub runner timeout is 360 minutes; hung tests can burn runner minutes.',
      remediation: 'Set "timeout-minutes: 15" on test and lint jobs.',
    });
  }

  if (pinnedShaCount > 0 && unpinnedMutableHits === 0 && floatingTagHits === 0) {
    findings.push({
      severity: 'pass',
      code: 'ACTIONS_SHA_PINNED',
      line: null,
      title: `All ${pinnedShaCount} action(s) pinned to full 40-char commit SHAs`,
      detail: 'Supply-chain action references are immutable.',
      remediation: 'Update pinned SHAs via reviewed Dependabot/Renovate PRs.',
    });
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  return {
    score: clampedScore,
    grade: gradeFromScore(clampedScore),
    lineCount: lines.length,
    actionsCount: actions.length,
    pinnedShaCount,
    unpinnedCount: unpinnedMutableHits + floatingTagHits,
    unpinnedMutableHits,
    floatingTagHits,
    secretEchoHits,
    scriptInjectionHits,
    hasPermissionsBlock,
    hasConcurrency: hasConcurrency && hasCancelInProgress,
    hasPullRequestTarget,
    actions,
    findings,
  };
}

/**
 * Evaluates local or user-supplied commit signing config and generates zero-secret
 * `.gitconfig` & dual-org remote setup playbooks.
 */
export function evaluateSigningConfig({
  commitGpgSign = false,
  tagGpgSign = false,
  gpgFormat = 'ssh',
  signingKey = '',
  allowedSignersFile = '~/.ssh/allowed_signers',
  userName = 'Neal Frazier',
  userEmail = 'contact@nullai.tech',
  repoSlug = 'zoth-studio-v2',
} = {}) {
  const format = String(gpgFormat || 'ssh').toLowerCase() === 'openpgp' ? 'openpgp' : 'ssh';
  const safeName = redactSensitiveOutput(userName || 'Developer').replace(/[\r\n]/g, '').slice(0, 80);
  const safeEmail = redactSensitiveOutput(userEmail || 'dev@example.invalid').replace(/[\r\n]/g, '').slice(0, 120);
  const safeSlug = isValidRepoSlug(repoSlug) ? repoSlug : 'my-repo';
  const safeAllowedSigners = redactSensitiveOutput(allowedSignersFile || '~/.ssh/allowed_signers').replace(/[\r\n]/g, '');

  const rawKeyStr = String(signingKey || '');
  const privateKeyDetected = PRIVATE_KEY_HEADER_RE.test(rawKeyStr);
  const maskedKey = privateKeyDetected
    ? '[REDACTED_PRIVATE_KEY — NEVER PASTE PRIVATE KEYS]'
    : maskSigningKey(rawKeyStr);

  const findings = [];
  let score = 100;

  if (privateKeyDetected) {
    score -= 50;
    findings.push({
      severity: 'critical',
      code: 'PRIVATE_KEY_INPUT_BLOCKED',
      title: 'Private key material detected and stripped',
      detail: 'Never supply private keys to Git signing configs or web UIs. Use only the public key path (~/.ssh/id_ed25519.pub) or public GPG key ID.',
      remediation: 'Reference your public key path (e.g. ~/.ssh/id_ed25519.pub) or GPG key fingerprint only.',
    });
  }

  if (!commitGpgSign) {
    score -= 25;
    findings.push({
      severity: 'medium',
      code: 'COMMIT_SIGN_DISABLED',
      title: 'commit.gpgsign is disabled',
      detail: 'Commits are not automatically signed.',
      remediation: 'Run: git config --global commit.gpgsign true',
    });
  } else {
    findings.push({
      severity: 'pass',
      code: 'COMMIT_SIGN_ENABLED',
      title: 'commit.gpgsign is enabled',
      detail: 'Every commit invokes cryptographic signing.',
      remediation: 'Keep signing enabled across all dual-org repositories.',
    });
  }

  if (!tagGpgSign) {
    score -= 10;
    findings.push({
      severity: 'info',
      code: 'TAG_SIGN_DISABLED',
      title: 'tag.gpgsign is disabled',
      detail: 'Release tags are not automatically signed.',
      remediation: 'Run: git config --global tag.gpgsign true',
    });
  }

  if (!maskedKey || privateKeyDetected) {
    score -= 20;
    findings.push({
      severity: 'medium',
      code: 'SIGNING_KEY_UNSET',
      title: 'user.signingkey is not configured',
      detail: format === 'ssh'
        ? 'Point user.signingkey to your public SSH key (~/.ssh/id_ed25519.pub).'
        : 'Point user.signingkey to your GPG public key ID.',
      remediation: format === 'ssh'
        ? 'git config --global user.signingkey ~/.ssh/id_ed25519.pub'
        : 'git config --global user.signingkey <GPG_KEY_ID>',
    });
  }

  const keyPlaceholder = format === 'ssh' ? '~/.ssh/id_ed25519.pub' : '<YOUR_GPG_PUBLIC_KEY_ID>';
  const gitconfigSnippet =
    format === 'ssh'
      ? [
          '[user]',
          `\tname = ${safeName}`,
          `\temail = ${safeEmail}`,
          `\tsigningkey = ${!privateKeyDetected && maskedKey ? maskedKey : keyPlaceholder}`,
          '[gpg]',
          '\tformat = ssh',
          '[gpg "ssh"]',
          `\tallowedSignersFile = ${safeAllowedSigners}`,
          '[commit]',
          '\tgpgsign = true',
          '[tag]',
          '\tgpgsign = true',
        ].join('\n')
      : [
          '[user]',
          `\tname = ${safeName}`,
          `\temail = ${safeEmail}`,
          `\tsigningkey = ${!privateKeyDetected && maskedKey ? maskedKey : keyPlaceholder}`,
          '[gpg]',
          '\tprogram = gpg',
          '[commit]',
          '\tgpgsign = true',
          '[tag]',
          '\tgpgsign = true',
        ].join('\n');

  const dualPushCommands = [
    `# 1. Configure dual-org remotes (${DUAL_ORG_OWNERS.primary} + ${DUAL_ORG_OWNERS.personal})`,
    `git remote set-url origin git@github.com:${DUAL_ORG_OWNERS.primary}/${safeSlug}.git`,
    `git remote add personal git@github.com:${DUAL_ORG_OWNERS.personal}/${safeSlug}.git 2>/dev/null || git remote set-url personal git@github.com:${DUAL_ORG_OWNERS.personal}/${safeSlug}.git`,
    '',
    '# 2. Verify remotes, clean status, and commit signature',
    'git remote -v',
    'git status --porcelain=v2 --branch',
    'git log -1 --show-signature',
    '',
    '# 3. Dual-org synchronized push',
    'git push origin main && git push personal main',
  ].join('\n');

  return {
    score: Math.max(0, Math.min(100, score)),
    grade: gradeFromScore(Math.max(0, Math.min(100, score))),
    format,
    commitGpgSign: Boolean(commitGpgSign),
    tagGpgSign: Boolean(tagGpgSign),
    signingKeyMasked: maskedKey,
    allowedSignersFile: safeAllowedSigners,
    privateKeyDetected,
    findings,
    gitconfigSnippet,
    dualPushCommands,
  };
}

export function buildHostGitSnapshot({
  toolchains = [],
  repos = [],
  totalRepoCount = 0,
  signing = {},
  checkedAt = new Date().toISOString(),
} = {}) {
  const cleanToolchains = EXPECTED_GITHUB_TOOLCHAINS.map((spec) => {
    const found = toolchains.find((t) => t.id === spec.id) || {};
    return {
      ...spec,
      installed: Boolean(found.installed),
      path: found.path ? redactSensitiveOutput(found.path) : null,
      version: found.version ? redactSensitiveOutput(found.version).slice(0, 120) : null,
    };
  });

  const cleanRepos = repos.map((r) => redactPayload(r));
  const dualOrgCount = cleanRepos.filter((r) => r.remotes?.dualOrgReady).length;
  const dirtyRepoCount = cleanRepos.filter((r) => !r.status?.clean).length;
  const credLeakRepos = cleanRepos.filter((r) => (r.remotes?.embeddedCredLeaks || 0) > 0).length;
  const avgScore = cleanRepos.length
    ? Math.round(cleanRepos.reduce((acc, r) => acc + (Number(r.score) || 0), 0) / cleanRepos.length)
    : 100;

  return {
    version: GITHUB_OPS_VERSION,
    mode: 'LIVE_HOST_GIT',
    checkedAt,
    redacted: true,
    tokenAccessPolicy: 'ZERO_TOKEN_READS (GH_TOKEN, ~/.config/gh/hosts.yml, ~/.git-credentials, ~/.ssh/id_* never read)',
    toolchains: cleanToolchains,
    signing: {
      commitGpgSign: Boolean(signing.commitGpgSign),
      tagGpgSign: Boolean(signing.tagGpgSign),
      gpgFormat: redactSensitiveOutput(signing.gpgFormat || 'openpgp'),
      signingKeyMasked: maskSigningKey(signing.signingKey || ''),
      allowedSignersFile: redactSensitiveOutput(signing.allowedSignersFile || ''),
    },
    summary: {
      toolchainsInstalled: cleanToolchains.filter((t) => t.installed).length,
      toolchainsTotal: cleanToolchains.length,
      scannedRepos: cleanRepos.length,
      totalReposDiscovered: Math.max(totalRepoCount || 0, cleanRepos.length),
      dualOrgCount,
      dirtyRepoCount,
      cleanRepoCount: cleanRepos.length - dirtyRepoCount,
      credLeakRepos,
      averageHygieneScore: avgScore,
    },
    repos: cleanRepos,
  };
}

export const SAMPLE_OFFLINE_REPOS = Object.freeze([
  {
    repo: 'zoth-studio-v2',
    remoteText: [
      'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (fetch)',
      'origin\thttps://github.com/NullAITech/zoth-studio-v2.git (push)',
      'personal\thttps://github.com/1nc0gn30/zoth-studio-v2.git (fetch)',
      'personal\thttps://github.com/1nc0gn30/zoth-studio-v2.git (push)',
    ].join('\n'),
    statusText: [
      '# branch.oid 89cec2c691e9',
      '# branch.head main',
      '# branch.upstream origin/main',
      '# branch.ab +0 -0',
    ].join('\n'),
    lastCommit: { hash: '89cec2c', subject: 'feat(github-tool): add dual-org fleet & CI-gate workstation', date: '2026-11-27' },
  },
  {
    repo: 'zoth-os',
    remoteText: [
      'origin\thttps://github.com/NullAITech/zoth-os.git (fetch)',
      'origin\thttps://github.com/NullAITech/zoth-os.git (push)',
      'personal\thttps://github.com/1nc0gn30/zoth-os.git (fetch)',
      'personal\thttps://github.com/1nc0gn30/zoth-os.git (push)',
    ].join('\n'),
    statusText: [
      '# branch.oid c2138b01b20d',
      '# branch.head main',
      '# branch.upstream origin/main',
      '# branch.ab +0 -0',
    ].join('\n'),
    lastCommit: { hash: 'c2138b0', subject: 'docs(vault): sync Workstation github-tool canonical route', date: '2026-11-27' },
  },
  {
    repo: 'zoth-edge-sandbox',
    remoteText: [
      'origin\thttps://github.com/NullAITech/zoth-edge-sandbox.git (fetch)',
      'origin\thttps://github.com/NullAITech/zoth-edge-sandbox.git (push)',
    ].join('\n'),
    statusText: [
      '# branch.oid 4a9e12b8091f',
      '# branch.head main',
      '# branch.upstream origin/main',
      '# branch.ab +2 -1',
      '1 .M N... 100644 100644 100644 abcdef1 abcdef2 src/worker.ts',
      '? notes/draft.md',
    ].join('\n'),
    lastCommit: { hash: '4a9e12b', subject: 'fix(edge): guard loopback origin headers', date: '2026-11-26' },
  },
]);

export function buildOfflineGitSnapshot(reason = 'Static deployment or loopback :3000 unreachable — showing offline sample fleet') {
  const sampleAudits = SAMPLE_OFFLINE_REPOS.map((s) =>
    auditRepository({
      repo: s.repo,
      remoteText: s.remoteText,
      statusText: s.statusText,
      lastCommit: s.lastCommit,
    })
  );

  const dualOrgCount = sampleAudits.filter((r) => r.remotes.dualOrgReady).length;
  const dirtyRepoCount = sampleAudits.filter((r) => !r.status.clean).length;
  const avgScore = Math.round(sampleAudits.reduce((acc, r) => acc + r.score, 0) / sampleAudits.length);

  return {
    version: GITHUB_OPS_VERSION,
    mode: 'BROWSER_OFFLINE_FALLBACK',
    reason: redactSensitiveOutput(reason),
    checkedAt: new Date().toISOString(),
    redacted: true,
    tokenAccessPolicy: 'ZERO_TOKEN_READS (Browser-only analyzers never transmit credentials or repo text)',
    toolchains: EXPECTED_GITHUB_TOOLCHAINS.map((spec) => ({
      ...spec,
      installed: false,
      path: null,
      version: 'Unavailable in static browser mode (start Zoth Studio on 127.0.0.1:3000)',
    })),
    signing: {
      commitGpgSign: false,
      tagGpgSign: false,
      gpgFormat: 'ssh',
      signingKeyMasked: '',
      allowedSignersFile: '~/.ssh/allowed_signers',
    },
    summary: {
      toolchainsInstalled: 0,
      toolchainsTotal: EXPECTED_GITHUB_TOOLCHAINS.length,
      scannedRepos: sampleAudits.length,
      totalReposDiscovered: sampleAudits.length,
      dualOrgCount,
      dirtyRepoCount,
      cleanRepoCount: sampleAudits.length - dirtyRepoCount,
      credLeakRepos: 0,
      averageHygieneScore: avgScore,
    },
    repos: sampleAudits,
  };
}

export const SAMPLE_COMMIT_LOG = [
  'a1b2c3d feat(github-tool): add dual-org NullAITech + 1nc0gn30 parity auditor',
  'b2c3d4e feat(api): expose read-only loopback /api/studio/github and /audit endpoints',
  'c3d4e5f fix(a11y): raise Editorial Ivory Light Mode contrast above 4.5:1 WCAG AA',
  'd4e5f60 security(ci): pin GitHub Actions to 40-char commit SHAs and enforce permissions: read',
  'e5f6071 docs(vault): remove dead /studio/github-tool.html and link MCP github notes',
  'f607182 test(github-ops): add pure engine, loopback 403/413, and route hydration suites',
].join('\n');

export const SAMPLE_WORKFLOW_HARDENED = [
  'name: Zoth Studio CI Gate',
  'on:',
  '  push:',
  '    branches: [main]',
  '  pull_request:',
  '    branches: [main]',
  '',
  'permissions:',
  '  contents: read',
  '',
  'concurrency:',
  '  group: ${{ github.workflow }}-${{ github.ref }}',
  '  cancel-in-progress: true',
  '',
  'jobs:',
  '  verify:',
  '    runs-on: ubuntu-latest',
  '    timeout-minutes: 15',
  '    steps:',
  '      - name: Checkout repository',
  '        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9b6834 # v4.2.2',
  '      - name: Setup Node.js',
  '        uses: actions/setup-node@39370e3970a6d050c480ffad7ff0ed4d3fdee5af # v4.1.0',
  '        with:',
  '          node-version: 22',
  '      - name: Build and verify',
  '        run: npm ci && npm run build && npm test',
  '      - name: Secret hygiene scan',
  '        run: bash tools/scan-secrets.sh',
].join('\n');

export const SAMPLE_WORKFLOW_VULNERABLE = [
  'name: Risky Workflow Sample',
  'on:',
  '  pull_request_target:',
  '    types: [opened, synchronize]',
  '',
  'jobs:',
  '  build:',
  '    runs-on: ubuntu-latest',
  '    steps:',
  '      - uses: actions/checkout@main',
  '        with:',
  '          ref: ${{ github.event.pull_request.head.sha }}',
  '      - name: Unsafe title echo',
  '        run: |',
  '          echo "PR: ${{ github.event.pull_request.title }}"',
  '          echo "Token check: ${{ secrets.DEPLOY_TOKEN }}"',
].join('\n');

export function exportGitHubOpsJson({ snapshot, repoAudit, commitReport, workflowReport, signingReport } = {}) {
  const payload = redactPayload({
    schema: 'zoth-github-ops-report/v2.3.0',
    version: GITHUB_OPS_VERSION,
    generatedAt: new Date().toISOString(),
    attribution: 'Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
    mode: snapshot?.mode || 'BROWSER_OFFLINE_FALLBACK',
    summary: snapshot?.summary || null,
    repoAudit: repoAudit || null,
    commitReport: commitReport
      ? {
          repoName: commitReport.repoName,
          currentVersion: commitReport.currentVersion,
          nextVersion: commitReport.nextVersion,
          bump: commitReport.bump,
          totalCommits: commitReport.totalCommits,
          validCount: commitReport.validCount,
          nonConformingCount: commitReport.nonConformingCount,
          compliancePct: commitReport.compliancePct,
        }
      : null,
    workflowReport: workflowReport || null,
    signingReport: signingReport
      ? {
          score: signingReport.score,
          grade: signingReport.grade,
          format: signingReport.format,
          commitGpgSign: signingReport.commitGpgSign,
          tagGpgSign: signingReport.tagGpgSign,
          signingKeyMasked: signingReport.signingKeyMasked,
        }
      : null,
  });
  return JSON.stringify(payload, null, 2);
}

export function exportGitHubOpsMarkdown({ snapshot, repoAudit, commitReport, workflowReport, signingReport } = {}) {
  const lines = [
    '# Zoth GitHub Studio — Operations & Hygiene Report',
    '',
    `- **Engine Version**: \`v${GITHUB_OPS_VERSION}\``,
    `- **Runtime Mode**: \`${redactSensitiveOutput(snapshot?.mode || 'BROWSER_OFFLINE_FALLBACK')}\``,
    `- **Token Safety**: Zero private key or GH_TOKEN access; all home paths redacted to \`~/\``,
    '',
  ];

  if (snapshot?.summary) {
    lines.push('## Fleet Summary');
    lines.push(`- Scanned Repos: **${snapshot.summary.scannedRepos}** (Discovered: ${snapshot.summary.totalReposDiscovered})`);
    lines.push(`- Dual-Org Ready (\`NullAITech\` + \`1nc0gn30\`): **${snapshot.summary.dualOrgCount}/${snapshot.summary.scannedRepos}**`);
    lines.push(`- Clean Working Trees: **${snapshot.summary.cleanRepoCount}/${snapshot.summary.scannedRepos}**`);
    lines.push(`- Average Hygiene Score: **${snapshot.summary.averageHygieneScore}/100**`);
    lines.push('');
  }

  if (repoAudit) {
    lines.push(`## Repository Audit: \`${redactSensitiveOutput(repoAudit.repo)}\``);
    lines.push(`- Hygiene Score: **${repoAudit.score}/100 (${repoAudit.grade})**`);
    lines.push(`- Branch: \`${redactSensitiveOutput(repoAudit.status?.branch || 'unknown')}\` (dirty: ${repoAudit.status?.dirtyCount ?? 0}, ahead: ${repoAudit.status?.ahead ?? 0}, behind: ${repoAudit.status?.behind ?? 0})`);
    lines.push(`- Dual-Org Parity: **${repoAudit.remotes?.dualOrgReady ? 'PASS' : 'INCOMPLETE'}** (${(repoAudit.remotes?.owners || []).join(', ') || 'none'})`);
    lines.push('');
  }

  if (commitReport) {
    lines.push('## Release & Conventional Commits');
    lines.push(`- Version Bump: \`${commitReport.bump}\` (\`v${commitReport.currentVersion}\` -> \`v${commitReport.nextVersion}\`)`);
    lines.push(`- Compliance: **${commitReport.compliancePct}%** (${commitReport.validCount}/${commitReport.totalCommits})`);
    lines.push('');
  }

  if (workflowReport) {
    lines.push('## GitHub Actions CI-Gate Audit');
    lines.push(`- Security Score: **${workflowReport.score}/100 (${workflowReport.grade})**`);
    lines.push(`- Actions Pinned (40-char SHA): **${workflowReport.pinnedShaCount}/${workflowReport.actionsCount}**`);
    lines.push(`- Least-Privilege Permissions: **${workflowReport.hasPermissionsBlock ? 'YES' : 'NO'}**`);
    lines.push('');
  }

  if (signingReport) {
    lines.push('## Commit Signing Readiness');
    lines.push(`- Format: \`${signingReport.format}\` · Score: **${signingReport.score}/100 (${signingReport.grade})**`);
    lines.push(`- commit.gpgsign: \`${signingReport.commitGpgSign}\` · tag.gpgsign: \`${signingReport.tagGpgSign}\``);
    lines.push('');
  }

  lines.push('---');
  lines.push('_Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform_');
  return redactSensitiveOutput(lines.join('\n'));
}

export function exportGitHubOpsCsv({ repos = [], customRows = [] } = {}) {
  const header = ['repo', 'branch', 'clean', 'dirty_count', 'ahead', 'behind', 'dual_org_ready', 'owners', 'score', 'grade', 'last_commit'];
  const rows = [header.join(',')];

  for (const r of repos) {
    rows.push(
      [
        r.repo || '',
        r.status?.branch || '',
        r.status?.clean ? 'true' : 'false',
        String(r.status?.dirtyCount ?? 0),
        String(r.status?.ahead ?? 0),
        String(r.status?.behind ?? 0),
        r.remotes?.dualOrgReady ? 'true' : 'false',
        (r.remotes?.owners || []).join(';'),
        String(r.score ?? 0),
        r.grade || '',
        r.lastCommit?.subject || '',
      ]
        .map(escapeCsvField)
        .join(',')
    );
  }

  for (const c of customRows) {
    rows.push(
      [
        c.repo || '',
        c.branch || '',
        String(c.clean ?? ''),
        String(c.dirtyCount ?? 0),
        String(c.ahead ?? 0),
        String(c.behind ?? 0),
        String(c.dualOrgReady ?? ''),
        c.owners || '',
        String(c.score ?? 0),
        c.grade || '',
        c.lastCommit || '',
      ]
        .map(escapeCsvField)
        .join(',')
    );
  }

  return rows.join('\n');
}
