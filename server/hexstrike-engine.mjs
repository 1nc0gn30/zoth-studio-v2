/**
 * HexStrike Security Arsenal — Pure Zero-Dependency Defensive Security Engine (v3.2.0)
 * Shared between Zoth Studio v2 browser workstation and Node.js server mirror.
 *
 * Guarantees:
 * - Never fabricates PASS or 100/100 scores when headers are CORS-blocked or absent.
 * - Never classifies browser-refused closed ports as OPEN.
 * - Exact Shannon byte entropy (0.0-8.0 bits/byte), local static code audit,
 *   formula-safe CSV exports, and honest executive report generation.
 */

export const SECURITY_HEADER_SPEC = [
  {
    key: 'strict-transport-security',
    header: 'Strict-Transport-Security (HSTS)',
    weight: 20,
    recommended: 'max-age=31536000; includeSubDomains; preload',
    desc: 'Enforces HTTPS transport and mitigates SSL downgrade attacks.',
  },
  {
    key: 'content-security-policy',
    header: 'Content-Security-Policy (CSP)',
    weight: 25,
    recommended: "default-src 'self'; object-src 'none'; frame-ancestors 'self'",
    desc: 'Restricts script, media, and frame origins to mitigate XSS and injection.',
  },
  {
    key: 'x-frame-options',
    header: 'X-Frame-Options',
    weight: 15,
    recommended: 'SAMEORIGIN',
    desc: 'Protects against clickjacking by restricting iframe embedding.',
  },
  {
    key: 'x-content-type-options',
    header: 'X-Content-Type-Options',
    weight: 15,
    recommended: 'nosniff',
    desc: 'Prevents MIME-type sniffing and polyglot script execution.',
  },
  {
    key: 'referrer-policy',
    header: 'Referrer-Policy',
    weight: 15,
    recommended: 'strict-origin-when-cross-origin',
    desc: 'Controls outbound referrer metadata disclosure.',
  },
  {
    key: 'permissions-policy',
    header: 'Permissions-Policy',
    weight: 10,
    recommended: 'camera=(), microphone=(), geolocation=()',
    desc: 'Restricts browser hardware APIs and sensor permissions.',
  },
];

const CODE_AUDIT_RULES = [
  {
    ruleId: 'HS-AST-001',
    severity: 'HIGH',
    title: 'Shell execution sink (shell=True / create_subprocess_shell / os.popen)',
    pattern: /\b(?:create_subprocess_shell|shell\s*=\s*True|os\.popen\s*\(|bash\s+-c)\b/,
    remediation: 'Use argument-list exec APIs (create_subprocess_exec / execFile) with strict input allowlists.',
  },
  {
    ruleId: 'HS-AST-002',
    severity: 'HIGH',
    title: 'Dynamic code evaluation sink (eval / new Function)',
    pattern: /\b(?:eval\s*\(|new\s+Function\s*\()/,
    remediation: 'Replace dynamic evaluation with structured parsers or explicit dispatch maps.',
  },
  {
    ruleId: 'HS-AST-003',
    severity: 'MEDIUM',
    title: 'Raw innerHTML / dangerouslySetInnerHTML DOM sink',
    pattern: /(?:\.innerHTML\s*=|dangerouslySetInnerHTML)/,
    remediation: 'Render untrusted values with textContent or DOM element builders.',
  },
  {
    ruleId: 'HS-AST-004',
    severity: 'CRITICAL',
    title: 'Hardcoded secret or private key pattern',
    pattern: /(?:AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/,
    remediation: 'Revoke credential immediately and move secrets to environment/vault custody.',
  },
  {
    ruleId: 'HS-AST-005',
    severity: 'HIGH',
    title: 'Disabled TLS verification or Electron webSecurity',
    pattern: /(?:ssl\s*=\s*False|verify\s*=\s*False|webSecurity\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0)/,
    remediation: 'Keep TLS verification and Electron webSecurity enabled at all times.',
  },
  {
    ruleId: 'HS-AST-006',
    severity: 'MEDIUM',
    title: 'Unpinned GitHub Actions reference (@main / @master / floating tag)',
    pattern: /uses:\s*[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@(?:main|master|v\d+)\b/,
    remediation: 'Pin third-party GitHub Actions to full 40-character commit SHAs.',
  },
];

/**
 * Parse raw HTTP header lines or a header object into a normalized lowercase map.
 */
export function normalizeHeaderMap(rawHeadersOrMap) {
  const out = {};
  if (!rawHeadersOrMap) return out;

  if (typeof rawHeadersOrMap === 'string') {
    const lines = rawHeadersOrMap.split(/\r?\n/);
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();
      if (key && !key.startsWith('http/')) {
        out[key] = val;
      }
    }
    return out;
  }

  if (typeof rawHeadersOrMap === 'object') {
    for (const [k, v] of Object.entries(rawHeadersOrMap)) {
      const key = String(k).trim().toLowerCase();
      if (key && v !== undefined && v !== null && String(v).trim() !== '') {
        out[key] = String(v).trim();
      }
    }
  }
  return out;
}

/**
 * Honestly audit observed HTTP security headers.
 * Never returns PASS or 100/100 when CORS blocks inspection or zero headers are observed.
 */
export function parseAndScoreHttpHeaders(rawHeadersOrMap, opts = {}) {
  const map = normalizeHeaderMap(rawHeadersOrMap);
  const observedCount = Object.keys(map).length;
  const corsBlocked = Boolean(opts.corsBlocked) || observedCount === 0;

  if (corsBlocked) {
    return {
      domain: opts.domain || 'unknown',
      mode: opts.corsBlocked ? 'CORS_BLOCKED' : 'NO_HEADERS_OBSERVED',
      verified: false,
      status: 'UNVERIFIED (CORS-blocked)',
      score: null,
      maxScore: 100,
      grade: 'UNVERIFIED',
      observedHeaderCount: 0,
      disclosures: [],
      findings: SECURITY_HEADER_SPEC.map((spec) => ({
        header: spec.header,
        key: spec.key,
        present: false,
        status: 'UNVERIFIED',
        weight: spec.weight,
        earned: 0,
        observedValue: null,
        recommended: spec.recommended,
        desc: spec.desc,
      })),
    };
  }

  let score = 0;
  const findings = SECURITY_HEADER_SPEC.map((spec) => {
    const val = map[spec.key] || null;
    const present = Boolean(val);
    if (present) score += spec.weight;
    return {
      header: spec.header,
      key: spec.key,
      present,
      status: present ? 'PASS' : 'MISSING',
      weight: spec.weight,
      earned: present ? spec.weight : 0,
      observedValue: val,
      recommended: spec.recommended,
      desc: spec.desc,
    };
  });

  const disclosures = [];
  const srv = map['server'] || '';
  if (srv && /(?:python\/|basehttp|apache\/|nginx\/|php\/)/i.test(srv)) {
    disclosures.push(`Server banner leaks version details: ${srv}`);
  }
  if (map['x-powered-by']) {
    disclosures.push(`X-Powered-By header exposes stack: ${map['x-powered-by']}`);
  }

  const grade =
    score >= 95 ? 'A+' : score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : score >= 30 ? 'D' : 'F';

  return {
    domain: opts.domain || 'offline-paste',
    mode: opts.mode || 'OBSERVED',
    verified: true,
    status: score >= 70 ? 'VERIFIED' : 'NEEDS_HARDENING',
    score,
    maxScore: 100,
    grade,
    observedHeaderCount: observedCount,
    disclosures,
    findings,
  };
}

/**
 * Compute exact Shannon byte entropy (0.0000 - 8.0000 bits/byte), printable ASCII ratio,
 * and 16-bin byte histogram on UTF-8 text, Uint8Array, or hex string.
 */
export function computeShannonEntropy(input, opts = {}) {
  let bytes;
  if (input instanceof Uint8Array) {
    bytes = input;
  } else if (typeof input === 'string') {
    if (opts.isHex) {
      const cleaned = input.replace(/[^0-9a-fA-F]/g, '');
      if (cleaned.length % 2 !== 0) {
        throw new Error('Hex input must have an even number of hexadecimal digits.');
      }
      bytes = new Uint8Array(cleaned.length / 2);
      for (let i = 0; i < cleaned.length; i += 2) {
        bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
      }
    } else {
      bytes = new TextEncoder().encode(input);
    }
  } else {
    bytes = new Uint8Array(0);
  }

  const total = bytes.length;
  if (total === 0) {
    return {
      byteCount: 0,
      uniqueBytes: 0,
      shannonEntropy: 0,
      maxEntropy: 8,
      printableAsciiRatio: 0,
      classification: 'EMPTY',
      topBytes: [],
      histogram16: new Array(16).fill(0),
    };
  }

  const counts = new Uint32Array(256);
  const histogram16 = new Array(16).fill(0);
  let printable = 0;

  for (let i = 0; i < total; i++) {
    const b = bytes[i];
    counts[b]++;
    histogram16[b >> 4]++;
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) {
      printable++;
    }
  }

  let entropy = 0;
  let uniqueBytes = 0;
  const nonZero = [];
  for (let b = 0; b < 256; b++) {
    const c = counts[b];
    if (c > 0) {
      uniqueBytes++;
      const p = c / total;
      entropy -= p * Math.log2(p);
      nonZero.push({ byteHex: `0x${b.toString(16).padStart(2, '0')}`, count: c, ratio: Number(p.toFixed(4)) });
    }
  }

  nonZero.sort((a, b) => b.count - a.count);
  const roundedEntropy = Number(entropy.toFixed(4));
  let classification = 'LOW_ENTROPY / STRUCTURED';
  if (roundedEntropy >= 7.2) classification = 'PACKED / ENCRYPTED';
  else if (roundedEntropy >= 6.0) classification = 'HIGH_ENTROPY / COMPRESSED';
  else if (roundedEntropy >= 3.5) classification = 'NORMAL_TEXT_OR_CODE';

  return {
    byteCount: total,
    uniqueBytes,
    shannonEntropy: roundedEntropy,
    maxEntropy: 8,
    printableAsciiRatio: Number((printable / total).toFixed(4)),
    classification,
    topBytes: nonZero.slice(0, 8),
    histogram16,
  };
}

/**
 * Audit source code or workflow snippets locally for defensive hygiene defects.
 */
export function auditLocalCodeSnippets(source) {
  const text = String(source || '');
  const lines = text.split(/\r?\n/);
  const findings = [];

  lines.forEach((line, idx) => {
    for (const rule of CODE_AUDIT_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          ruleId: rule.ruleId,
          severity: rule.severity,
          title: rule.title,
          line: idx + 1,
          snippet: line.trim().slice(0, 120),
          remediation: rule.remediation,
        });
      }
    }
  });

  const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0 };
  for (const f of findings) {
    if (severityCounts[f.severity] !== undefined) {
      severityCounts[f.severity]++;
    }
  }

  const penalty = severityCounts.CRITICAL * 30 + severityCounts.HIGH * 15 + severityCounts.MEDIUM * 7;
  const score = Math.max(0, 100 - penalty);
  return {
    lineCount: lines.length,
    findingCount: findings.length,
    severityCounts,
    score,
    status: findings.length === 0 ? 'CLEAN' : severityCounts.CRITICAL > 0 ? 'CRITICAL' : 'FINDINGS_DETECTED',
    findings,
  };
}

/**
 * Honestly classify a loopback port probe result.
 * Never marks refused/CORS-rejected browser fetches as OPEN (Active Listener).
 */
export function classifyLoopbackPortProbe({
  ok = false,
  status = null,
  errorType = null,
  latencyMs = 0,
  daemonAuthoritative = false,
  daemonOpen = false,
} = {}) {
  if (daemonAuthoritative) {
    return {
      status: daemonOpen ? 'OPEN' : 'CLOSED',
      authoritative: true,
      note: daemonOpen ? 'Verified via :8138 TCP socket connect_ex' : 'Port closed/refused via :8138 socket probe',
      latencyMs,
    };
  }
  if (ok) {
    return {
      status: 'REACHABLE (HTTP)',
      authoritative: false,
      note: status ? `HTTP ${status} observed` : 'Opaque HTTP response received (browser no-cors)',
      latencyMs,
    };
  }
  if (errorType === 'AbortError') {
    return {
      status: 'TIMEOUT / FILTERED',
      authoritative: false,
      note: 'Probe timed out before response',
      latencyMs,
    };
  }
  return {
    status: 'CLOSED / UNREACHABLE',
    authoritative: false,
    note: 'Browser fetch rejected (connection refused or non-HTTP service); start :8138 daemon for TCP socket confirmation',
    latencyMs,
  };
}

/**
 * Formula-safe CSV cell serializer (blocks Excel/Sheets =,+,-,@ formula injection).
 */
export function sanitizeCsvCell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportFindingsCsv(rows, columns = ['category', 'item', 'status', 'detail']) {
  const header = columns.map(sanitizeCsvCell).join(',');
  const body = (rows || []).map((row) => columns.map((c) => sanitizeCsvCell(row[c])).join(','));
  return [header, ...body].join('\n');
}

/**
 * Build a deterministic, 100% honest Executive Security Audit Markdown report strictly
 * from real observed data (never hardcodes A+ / 98/100 / 0 Criticals).
 */
export function buildExecutiveReportMarkdown({
  targetScope = '127.0.0.1',
  observedHeaders = null,
  observedPorts = [],
  entropy = null,
  codeAudit = null,
  dohRecords = [],
  shodanData = null,
  generatedAt = new Date().toISOString(),
} = {}) {
  const openPorts = (observedPorts || []).filter((p) => p.status === 'OPEN' || p.status === 'REACHABLE (HTTP)');
  const headerScoreText =
    observedHeaders && observedHeaders.verified
      ? `${observedHeaders.score}/100 (Grade ${observedHeaders.grade})`
      : observedHeaders
      ? `${observedHeaders.status} (no score assigned)`
      : 'Not executed yet';

  const codeAuditSummary = codeAudit
    ? `${codeAudit.score}/100 (${codeAudit.findingCount} findings: ${codeAudit.severityCounts.CRITICAL} Critical, ${codeAudit.severityCounts.HIGH} High, ${codeAudit.severityCounts.MEDIUM} Medium)`
    : 'Not executed yet';

  const entropySummary = entropy
    ? `${entropy.shannonEntropy} bits/byte (${entropy.classification}, ${entropy.byteCount} bytes)`
    : 'Not executed yet';

  // Composite posture computed strictly from verified observations
  let postureLine = 'UNVERIFIED (Run at least one defensive check to compute a verified posture score)';
  const numericScores = [];
  if (observedHeaders && observedHeaders.verified && typeof observedHeaders.score === 'number') {
    numericScores.push(observedHeaders.score);
  }
  if (codeAudit && typeof codeAudit.score === 'number') {
    numericScores.push(codeAudit.score);
  }
  if (numericScores.length > 0) {
    const avg = Math.round(numericScores.reduce((a, b) => a + b, 0) / numericScores.length);
    const grade = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 65 ? 'C' : avg >= 50 ? 'D' : 'F';
    postureLine = `${avg}/100 (Grade ${grade}) — computed from ${numericScores.length} verified check(s)`;
  }

  const headerLines =
    observedHeaders && Array.isArray(observedHeaders.findings)
      ? observedHeaders.findings
          .map((f) => `- ${f.header}: **${f.status}** (${f.observedValue || 'Not observed'})`)
          .join('\n')
      : '- Header audit not run yet.';

  const portLines =
    observedPorts && observedPorts.length > 0
      ? observedPorts.map((p) => `- \`127.0.0.1:${p.port}\` (${p.name || 'TCP'}): **${p.status}** (${p.latency ?? p.latencyMs ?? 0}ms)`).join('\n')
      : '- Loopback port probe not run yet.';

  const dohLines =
    dohRecords && dohRecords.length > 0
      ? dohRecords.map((r) => `[${r.type}] ${r.name} -> ${r.data} (TTL: ${r.ttl}s)`).join('\n')
      : 'No opt-in public DoH queries executed in this session.';

  const shodanSection = shodanData
    ? `- **IP Queried (Opt-In Public InternetDB)**: \`${shodanData.ip}\`\n- **Indexed Public Ports**: \`[${(shodanData.ports || []).join(', ') || 'None'}]\`\n- **Indexed CVEs**: ${(shodanData.vulns || []).length > 0 ? shodanData.vulns.join(', ') : 'None indexed in InternetDB'}`
    : '- No opt-in Shodan InternetDB lookup executed in this session.';

  return `# HEXSTRIKE SECURITY ARSENAL — OBSERVED AUDIT REPORT
**Target Scope**: \`${targetScope}\`
**Generated (UTC)**: ${generatedAt}
**Engine**: HexStrike Security Arsenal v3.2.0 • Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform

---

## 1. OBSERVED POSTURE SUMMARY
- **Computed Posture**: ${postureLine}
- **HTTP Security Headers**: ${headerScoreText}
- **Static Code Audit**: ${codeAuditSummary}
- **Shannon Byte Entropy**: ${entropySummary}
- **Loopback Listeners Probed**: ${observedPorts.length > 0 ? `${openPorts.length} active / ${observedPorts.length} probed` : 'Not executed yet'}

---

## 2. HTTP SECURITY HEADERS (OBSERVED)
${headerLines}

---

## 3. LOOPBACK PORT PROBE (127.0.0.1)
${portLines}

---

## 4. OPT-IN PUBLIC DNS-OVER-HTTPS (DoH)
\`\`\`
${dohLines}
\`\`\`

---

## 5. OPT-IN SHODAN INTERNETDB EXPOSURE
${shodanSection}
`;
}
