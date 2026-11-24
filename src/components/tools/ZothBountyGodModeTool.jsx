import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import GitHubIcon from '@mui/icons-material/GitHub';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppBadIcon from '@mui/icons-material/GppBad';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  useCopy,
  downloadText,
  MONO,
  rgba,
} from '../sovereign';

const ACCENT_DARK = '#EF4444';
const ACCENT_LIGHT = '#B91C1C';

/** FIRST.org CVSS v3.1 Metric Definitions & Exact Numerical Weights */
const CVSS_METRICS = [
  {
    key: 'AV',
    name: 'Attack Vector (AV)',
    options: [
      { code: 'N', label: 'Network', weight: 0.85 },
      { code: 'A', label: 'Adjacent', weight: 0.62 },
      { code: 'L', label: 'Local', weight: 0.55 },
      { code: 'P', label: 'Physical', weight: 0.2 },
    ],
  },
  {
    key: 'AC',
    name: 'Attack Complexity (AC)',
    options: [
      { code: 'L', label: 'Low', weight: 0.77 },
      { code: 'H', label: 'High', weight: 0.44 },
    ],
  },
  {
    key: 'PR',
    name: 'Privileges Required (PR)',
    options: [
      { code: 'N', label: 'None', weightU: 0.85, weightC: 0.85 },
      { code: 'L', label: 'Low', weightU: 0.62, weightC: 0.68 },
      { code: 'H', label: 'High', weightU: 0.27, weightC: 0.5 },
    ],
  },
  {
    key: 'UI',
    name: 'User Interaction (UI)',
    options: [
      { code: 'N', label: 'None', weight: 0.85 },
      { code: 'R', label: 'Required', weight: 0.62 },
    ],
  },
  {
    key: 'S',
    name: 'Scope (S)',
    options: [
      { code: 'U', label: 'Unchanged' },
      { code: 'C', label: 'Changed' },
    ],
  },
  {
    key: 'C',
    name: 'Confidentiality (C)',
    options: [
      { code: 'N', label: 'None', weight: 0.0 },
      { code: 'L', label: 'Low', weight: 0.22 },
      { code: 'H', label: 'High', weight: 0.56 },
    ],
  },
  {
    key: 'I',
    name: 'Integrity (I)',
    options: [
      { code: 'N', label: 'None', weight: 0.0 },
      { code: 'L', label: 'Low', weight: 0.22 },
      { code: 'H', label: 'High', weight: 0.56 },
    ],
  },
  {
    key: 'A',
    name: 'Availability (A)',
    options: [
      { code: 'N', label: 'None', weight: 0.0 },
      { code: 'L', label: 'Low', weight: 0.22 },
      { code: 'H', label: 'High', weight: 0.56 },
    ],
  },
];

const CVSS_PRESETS = [
  {
    id: 'idor',
    label: 'IDOR (Auth Read)',
    metrics: { AV: 'N', AC: 'L', PR: 'L', UI: 'N', S: 'U', C: 'H', I: 'N', A: 'N' },
  },
  {
    id: 'stored-xss',
    label: 'Stored XSS',
    metrics: { AV: 'N', AC: 'L', PR: 'L', UI: 'R', S: 'C', C: 'L', I: 'L', A: 'N' },
  },
  {
    id: 'ssrf-cloud',
    label: 'SSRF to Metadata',
    metrics: { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'C', C: 'H', I: 'N', A: 'N' },
  },
  {
    id: 'rce-unauth',
    label: 'Unauth RCE',
    metrics: { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' },
  },
  {
    id: 'csrf-low',
    label: 'CSRF (State Change)',
    metrics: { AV: 'N', AC: 'L', PR: 'N', UI: 'R', S: 'U', C: 'N', I: 'L', A: 'N' },
  },
];

/** FIRST.org CVSS v3.1 Appendix A exact Roundup implementation */
function cvssRoundUp(input) {
  const intInput = Math.round(input * 100000);
  if (intInput % 10000 === 0) {
    return intInput / 100000.0;
  }
  return (Math.floor(intInput / 10000) + 1) / 10.0;
}

function computeCvss31(m) {
  const getOpt = (key) => {
    const def = CVSS_METRICS.find((d) => d.key === key);
    return def.options.find((o) => o.code === m[key]) || def.options[0];
  };

  const av = getOpt('AV').weight;
  const ac = getOpt('AC').weight;
  const prOpt = getOpt('PR');
  const pr = m.S === 'C' ? prOpt.weightC : prOpt.weightU;
  const ui = getOpt('UI').weight;
  const c = getOpt('C').weight;
  const i = getOpt('I').weight;
  const a = getOpt('A').weight;

  const iss = 1 - (1 - c) * (1 - i) * (1 - a);
  const impact =
    m.S === 'U'
      ? 6.42 * iss
      : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
  const exploitability = 8.22 * av * ac * pr * ui;

  let baseScore = 0.0;
  if (impact > 0) {
    baseScore =
      m.S === 'U'
        ? cvssRoundUp(Math.min(impact + exploitability, 10))
        : cvssRoundUp(Math.min(1.08 * (impact + exploitability), 10));
  }

  let severity = 'None';
  let severityColor = '#94A3B8';
  if (baseScore >= 9.0) {
    severity = 'Critical';
    severityColor = '#EF4444';
  } else if (baseScore >= 7.0) {
    severity = 'High';
    severityColor = '#F97316';
  } else if (baseScore >= 4.0) {
    severity = 'Medium';
    severityColor = '#EAB308';
  } else if (baseScore >= 0.1) {
    severity = 'Low';
    severityColor = '#38BDF8';
  }

  const vector = `CVSS:3.1/AV:${m.AV}/AC:${m.AC}/PR:${m.PR}/UI:${m.UI}/S:${m.S}/C:${m.C}/I:${m.I}/A:${m.A}`;

  return {
    baseScore: Number(baseScore.toFixed(1)),
    impactSubscore: Number(Math.max(0, impact).toFixed(2)),
    exploitabilitySubscore: Number(exploitability.toFixed(2)),
    severity,
    severityColor,
    vector,
  };
}

function escapeRegex(str) {
  return str.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

function parseTargetInput(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    return {
      raw: trimmed,
      hostname: u.hostname.toLowerCase(),
      port: u.port || '',
      pathname: u.pathname || '/',
      hostPath: `${u.hostname.toLowerCase()}${u.pathname || '/'}`,
    };
  } catch {
    const clean = trimmed.toLowerCase().replace(/^\/+/, '');
    const slashIdx = clean.indexOf('/');
    const host = (slashIdx >= 0 ? clean.slice(0, slashIdx) : clean).split(':')[0];
    const path = slashIdx >= 0 ? clean.slice(slashIdx) : '/';
    return {
      raw: trimmed,
      hostname: host,
      port: '',
      pathname: path,
      hostPath: `${host}${path}`,
    };
  }
}

function matchScopePattern(patternRaw, target) {
  let pat = String(patternRaw || '').trim().toLowerCase();
  if (!pat) return false;
  pat = pat.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');

  const hasPath = pat.includes('/');
  if (!hasPath) {
    // Strip optional port on hostname-only rule
    pat = pat.split(':')[0];
    // Special-case leading `*.domain.tld` so it requires at least one subdomain label
    if (pat.startsWith('*.')) {
      const suffix = pat.slice(2);
      const rx = new RegExp(`^([a-z0-9-]+\\.)+${escapeRegex(suffix).replace(/\\\*/g, '.*')}$`, 'i');
      return rx.test(target.hostname);
    }
    const rx = new RegExp(`^${escapeRegex(pat).replace(/\\\*/g, '.*')}$`, 'i');
    return rx.test(target.hostname);
  }

  // Host + path pattern matching
  const slashIdx = pat.indexOf('/');
  const hostPat = pat.slice(0, slashIdx).split(':')[0];
  const pathPat = pat.slice(slashIdx);

  const hostMatch = matchScopePattern(hostPat, {
    ...target,
    hostPath: target.hostname,
  });
  if (!hostMatch) return false;

  const pathRx = new RegExp(`^${escapeRegex(pathPat).replace(/\\\*/g, '.*')}$`, 'i');
  return pathRx.test(target.pathname);
}

function evaluateScopeRules(rawRules, rawExclusions, rawTargets) {
  const inScopeRules = [];
  const outScopeRules = [];

  for (const line of String(rawRules || '').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    if (t.startsWith('!')) {
      const rule = t.slice(1).trim();
      if (rule) outScopeRules.push(rule);
    } else {
      inScopeRules.push(t);
    }
  }

  for (const line of String(rawExclusions || '').split('\n')) {
    const t = line.trim().replace(/^!+/, '').trim();
    if (!t || t.startsWith('#')) continue;
    outScopeRules.push(t);
  }

  const targets = String(rawTargets || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

  const results = targets.map((line) => {
    const parsed = parseTargetInput(line);
    if (!parsed || !parsed.hostname) {
      return {
        raw: line,
        status: 'invalid',
        matchedIn: [],
        matchedOut: [],
        parsed: null,
      };
    }
    const matchedOut = outScopeRules.filter((r) => matchScopePattern(r, parsed));
    const matchedIn = inScopeRules.filter((r) => matchScopePattern(r, parsed));

    let status = 'unmatched';
    if (matchedOut.length > 0) {
      status = 'out_of_scope';
    } else if (matchedIn.length > 0) {
      status = 'in_scope';
    }
    return {
      raw: line,
      status,
      matchedIn,
      matchedOut,
      parsed,
    };
  });

  return { inScopeRules, outScopeRules, results };
}

function slugify(str) {
  return (
    String(str || 'triage-report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'triage-report'
  );
}

const DEFAULT_METRICS = {
  AV: 'N',
  AC: 'L',
  PR: 'L',
  UI: 'N',
  S: 'U',
  C: 'H',
  I: 'N',
  A: 'N',
};

const DEFAULT_IN_SCOPE = `*.example.com
api.example.com/v2/*
!admin.example.com`;

const DEFAULT_OUT_SCOPE = `staging.example.com
*.marketing.example.com
api.example.com/v2/health`;

const DEFAULT_TARGETS = `https://app.example.com/api/v2/invoices/1042
https://admin.example.com/login
https://api.example.com/v2/users
https://evil-example.com/v2/users`;

export default function ZothBountyGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const { copied, copy } = useCopy();

  // 1. CVSS v3.1 state
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const cvss = useMemo(() => computeCvss31(metrics), [metrics]);

  // 2. Scope Matcher state
  const [inScopeText, setInScopeText] = useState(DEFAULT_IN_SCOPE);
  const [outScopeText, setOutScopeText] = useState(DEFAULT_OUT_SCOPE);
  const [targetInput, setTargetInput] = useState(DEFAULT_TARGETS);

  const scopeEval = useMemo(
    () => evaluateScopeRules(inScopeText, outScopeText, targetInput),
    [inScopeText, outScopeText, targetInput],
  );

  const inScopeCount = scopeEval.results.filter((r) => r.status === 'in_scope').length;
  const excludedCount = scopeEval.results.filter((r) => r.status === 'out_of_scope').length;

  // 3. Triage PoC Report Composer state
  const [platform, setPlatform] = useState('hackerone');
  const [reportTitle, setReportTitle] = useState(
    'IDOR on GET /api/v2/invoices/{id} Exposes Cross-Tenant Billing Records',
  );
  const [reportAsset, setReportAsset] = useState('https://app.example.com/api/v2/invoices/{id}');
  const [reproSteps, setReproSteps] = useState(
    `1. Authenticate as User A (standard low-privilege tenant) and capture the Bearer token.
2. Create an invoice as User B and note its numeric identifier (e.g. 1042).
3. Replay the request below using User A's session token:
   curl -i -H "Authorization: Bearer <USER_A_TOKEN>" https://app.example.com/api/v2/invoices/1042
4. Observe HTTP 200 OK returning User B's full invoice JSON (email, billing address, line items).`,
  );
  const [impact, setImpact] = useState(
    'Any authenticated user can enumerate sequential invoice IDs and read confidential billing records belonging to other organizations without authorization.',
  );
  const [remediation, setRemediation] = useState(
    'Enforce server-side tenant ownership checks (WHERE id = $1 AND org_id = $2 derived from the verified JWT) on every invoice lookup and switch external identifiers to non-sequential UUIDv4 values.',
  );

  // Evaluate report asset against current scope rules
  const assetScopeCheck = useMemo(() => {
    const res = evaluateScopeRules(inScopeText, outScopeText, reportAsset);
    return res.results[0] || null;
  }, [inScopeText, outScopeText, reportAsset]);

  const markdownReport = useMemo(() => {
    const scopeLabel =
      assetScopeCheck?.status === 'in_scope'
        ? `Verified IN SCOPE (matched: \`${assetScopeCheck.matchedIn.join(', ')}\`)`
        : assetScopeCheck?.status === 'out_of_scope'
        ? `WARNING — OUT OF SCOPE (excluded by: \`${assetScopeCheck.matchedOut.join(', ')}\`)`
        : 'Unverified against current scope rules';

    const platformHeader =
      platform === 'bugcrowd'
        ? '## Bugcrowd Submission Brief'
        : '## HackerOne Triage Report';

    return `# ${reportTitle.trim() || 'Untitled Security Finding'}

${platformHeader}

| Field | Value |
| --- | --- |
| **Asset / Endpoint** | \`${reportAsset.trim() || 'N/A'}\` |
| **Scope Verification** | ${scopeLabel} |
| **Severity** | **${cvss.severity}** (${cvss.baseScore.toFixed(1)} / 10.0) |
| **CVSS v3.1 Vector** | \`${cvss.vector}\` |
| **Subscores** | Impact: \`${cvss.impactSubscore}\` · Exploitability: \`${cvss.exploitabilitySubscore}\` |

## Steps to Reproduce

${reproSteps.trim() || '_Add deterministic reproduction steps._'}

## Security Impact

${impact.trim() || '_Describe concrete confidentiality, integrity, or availability impact._'}

## Recommended Remediation

${remediation.trim() || '_Describe server-side fix and regression test._'}

---
*Prepared with Zoth Bounty Research Hub — zero-false-positive responsible disclosure workflow.*
`;
  }, [
    platform,
    reportTitle,
    reportAsset,
    reproSteps,
    impact,
    remediation,
    cvss,
    assetScopeCheck,
  ]);

  const handleDownloadMd = () => {
    downloadText(
      markdownReport,
      `${slugify(reportTitle)}-poc.md`,
      'text/markdown;charset=utf-8',
    );
  };

  const kpis = [
    {
      label: 'CVSS v3.1 Score',
      value: cvss.baseScore.toFixed(1),
      unit: cvss.severity.toUpperCase(),
      accent: cvss.severityColor,
    },
    {
      label: 'Subscores',
      value: `${cvss.impactSubscore} / ${cvss.exploitabilitySubscore}`,
      unit: 'Impact / Exploit',
      accent: '#D4AF37',
    },
    {
      label: 'Scope Matches',
      value: `${inScopeCount} / ${scopeEval.results.length}`,
      unit: `${excludedCount} excluded`,
      accent: '#34D399',
    },
    {
      label: 'Report Format',
      value: platform === 'bugcrowd' ? 'Bugcrowd' : 'HackerOne',
      unit: `${markdownReport.length} chars`,
      accent: '#38BDF8',
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status="online"
        label={`CLIENT-SIDE FIRST.ORG CVSS v3.1 · ${cvss.vector}`}
        accent={cvss.severityColor}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'report' ? 'Copied Markdown PoC' : 'Copy Markdown Report',
      icon: copied === 'report' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(markdownReport, 'report'),
      primary: true,
    },
    {
      label: 'Download .md Report',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleDownloadMd,
    },
    {
      label: copied === 'vector' ? 'Copied CVSS Vector' : 'Copy CVSS Vector',
      icon: copied === 'vector' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(`${cvss.vector} (${cvss.baseScore.toFixed(1)} ${cvss.severity})`, 'vector'),
    },
    {
      label: 'Reset Calculator',
      icon: <RestartAltIcon fontSize="small" />,
      onClick: () => setMetrics(DEFAULT_METRICS),
    },
    {
      label: 'zoth-bounty on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/zoth-bounty',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="FIRST.ORG SPECIFICATION · 8 BASE METRICS"
        title="CVSS v3.1 Base Score Calculator"
        subtitle="Exact FIRST.org roundup math with Scope-dependent Privileges Required weights"
        accent={accent}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            p: 1.75,
            mb: 2,
            borderRadius: 1.5,
            border: `1px solid ${rgba(cvss.severityColor, 0.4)}`,
            bgcolor: isDark ? rgba(cvss.severityColor, 0.08) : rgba(cvss.severityColor, 0.06),
          }}
        >
          <SovereignGauge
            value={cvss.baseScore}
            max={10}
            label="CVSS v3.1"
            unit="/ 10"
            status={cvss.severity.toUpperCase()}
            thresholds={{ warn: 4.0, danger: 7.0 }}
          />
          <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Chip
                label={`${cvss.severity.toUpperCase()} · ${cvss.baseScore.toFixed(1)}`}
                size="small"
                sx={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  bgcolor: rgba(cvss.severityColor, 0.18),
                  color: isDark ? cvss.severityColor : '#101828',
                  border: `1px solid ${rgba(cvss.severityColor, 0.55)}`,
                }}
              />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: 'text.secondary' }}>
                Impact {cvss.impactSubscore} · Exploit {cvss.exploitabilitySubscore}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? '#07080D' : '#FFFFFF',
                fontFamily: MONO,
                fontSize: '0.72rem',
                wordBreak: 'break-all',
              }}
            >
              {cvss.vector}
            </Box>
          </Box>
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: 'text.secondary', mb: 1 }}>
          QUICK PRESETS
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85, mb: 2 }}>
          {CVSS_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.label}
              size="small"
              clickable
              onClick={() => setMetrics(preset.metrics)}
              sx={{
                minHeight: 34,
                fontFamily: MONO,
                fontSize: '0.71rem',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {CVSS_METRICS.map((metric) => (
            <Box key={metric.key}>
              <Typography
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  mb: 0.65,
                }}
              >
                {metric.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {metric.options.map((opt) => {
                  const selected = metrics[metric.key] === opt.code;
                  return (
                    <Chip
                      key={opt.code}
                      label={`${opt.label} (${opt.code})`}
                      clickable
                      onClick={() =>
                        setMetrics((prev) => ({ ...prev, [metric.key]: opt.code }))
                      }
                      sx={{
                        minHeight: 36,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: selected ? 700 : 500,
                        bgcolor: selected ? rgba(accent, 0.16) : 'transparent',
                        color: selected ? accent : 'text.primary',
                        border: `1px solid ${selected ? accent : 'rgba(148,163,184,0.3)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="WILDCARD HOST & PATH EVALUATOR"
        title="Bug Bounty Scope Matcher"
        subtitle="Use *.domain.com for subdomains, path wildcards like api.example.com/v2/*, and !prefix or Exclusions for out-of-scope rules"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label="In-Scope Patterns (one per line, !rule marks exclusion)"
            multiline
            minRows={3}
            fullWidth
            value={inScopeText}
            onChange={(e) => setInScopeText(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
          />
          <TextField
            label="Out-of-Scope Exclusions (always override in-scope)"
            multiline
            minRows={2}
            fullWidth
            value={outScopeText}
            onChange={(e) => setOutScopeText(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
          />
          <TextField
            label="Test Target URL(s) or Hostname(s) (one per line)"
            multiline
            minRows={3}
            fullWidth
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
            {scopeEval.results.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: MONO, fontSize: '0.76rem' }}>
                Enter one or more target hosts or URLs above to evaluate scope rules.
              </Typography>
            ) : (
              scopeEval.results.map((item, idx) => {
                const isIn = item.status === 'in_scope';
                const isOut = item.status === 'out_of_scope';
                const rowColor = isIn ? '#34D399' : isOut ? '#EF4444' : '#F59E0B';
                const statusLabel = isIn
                  ? 'IN SCOPE'
                  : isOut
                  ? 'OUT OF SCOPE'
                  : 'NOT MATCHED';
                const IconComp = isIn
                  ? VerifiedUserIcon
                  : isOut
                  ? GppBadIcon
                  : HelpOutlineIcon;
                return (
                  <Box
                    key={`${item.raw}-${idx}`}
                    sx={{
                      p: 1.15,
                      borderRadius: 1.25,
                      border: `1px solid ${rgba(rowColor, 0.4)}`,
                      bgcolor: isDark ? rgba(rowColor, 0.06) : rgba(rowColor, 0.05),
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.4,
                    }}
                  >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, wordBreak: 'break-all' }}>
                        {item.raw}
                      </Typography>
                      <Chip
                        size="small"
                        icon={<IconComp sx={{ fontSize: '0.9rem !important' }} />}
                        label={statusLabel}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          bgcolor: rgba(rowColor, 0.16),
                          color: isDark ? rowColor : '#101828',
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {isOut
                        ? `Excluded by: ${item.matchedOut.join(', ')}${item.matchedIn.length ? ` (overrode ${item.matchedIn.join(', ')})` : ''}`
                        : isIn
                        ? `Matched: ${item.matchedIn.join(', ')}`
                        : `Host "${item.parsed?.hostname || item.raw}" matched no in-scope pattern`}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="HACKERONE / BUGCROWD MARKDOWN GENERATOR"
        title="Triage PoC Report Composer"
        subtitle="Automatically binds your live CVSS v3.1 vector, subscores, and scope check into a clean disclosure brief"
        accent={accent}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {[
            { id: 'hackerone', label: 'HackerOne Template' },
            { id: 'bugcrowd', label: 'Bugcrowd Template' },
          ].map((tpl) => {
            const active = platform === tpl.id;
            return (
              <Chip
                key={tpl.id}
                label={tpl.label}
                clickable
                onClick={() => setPlatform(tpl.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            size="small"
            label="Finding Title"
            fullWidth
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="Target Asset / Endpoint"
            fullWidth
            value={reportAsset}
            onChange={(e) => setReportAsset(e.target.value)}
            helperText={
              assetScopeCheck?.status === 'in_scope'
                ? `In scope via: ${assetScopeCheck.matchedIn.join(', ')}`
                : assetScopeCheck?.status === 'out_of_scope'
                ? `Warning: excluded by ${assetScopeCheck.matchedOut.join(', ')}`
                : 'Asset not matched by current in-scope patterns'
            }
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            label="Reproduction Steps"
            multiline
            minRows={4}
            fullWidth
            value={reproSteps}
            onChange={(e) => setReproSteps(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
          />
          <TextField
            label="Security Impact"
            multiline
            minRows={2}
            fullWidth
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
          />
          <TextField
            label="Recommended Remediation"
            multiline
            minRows={2}
            fullWidth
            value={remediation}
            onChange={(e) => setRemediation(e.target.value)}
            sx={{ '& textarea': { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 } }}
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="LIVE MARKDOWN OUTPUT & EXPORT"
        title="Disclosure Report Preview"
        subtitle="Ready to paste directly into HackerOne, Bugcrowd, or save as a local .md dossier"
        accent={accent}
      >
        <SovereignCodeBlock
          title={`${slugify(reportTitle)}-poc.md`}
          badge={`${cvss.severity.toUpperCase()} ${cvss.baseScore.toFixed(1)}`}
          code={markdownReport}
          filename={`${slugify(reportTitle)}-poc.md`}
          maxHeight={360}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={copied === 'inline-md' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copy(markdownReport, 'inline-md')}
            sx={{
              minHeight: 42,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: accent,
              color: '#FFFFFF',
            }}
          >
            {copied === 'inline-md' ? 'Copied Markdown' : 'Copy Markdown Report'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleDownloadMd}
            sx={{
              minHeight: 42,
              fontFamily: MONO,
              fontSize: '0.75rem',
              textTransform: 'none',
            }}
          >
            Download .md File
          </Button>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="05"
        eyebrow="LOCAL DAEMON CLI (:9494)"
        title="Zoth Bounty Local Hub Commands"
        subtitle="Sync dossiers and audit statuses with the local zoth-bounty workspace"
        accent={accent}
      >
        <SovereignCodeBlock
          title="ZOTH-BOUNTY CLI"
          badge="LOCAL :9494"
          code={`# Check local zoth-bounty hub status\nzoth-bounty --status\n\n# Start loopback command center on http://127.0.0.1:9494\ncd ~/NullAITech/zoth-bounty && node server.js`}
          filename="zoth-bounty-commands.sh"
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="100% Client-Side Security Research Workbench"
          message="CVSS v3.1 scoring, wildcard scope matching, and HackerOne/Bugcrowd PoC report generation execute entirely in your browser with zero external requests. Keep sensitive vulnerability evidence local."
        />
      </Box>
      <SovereignWorkstationShell
        id="zoth-bounty"
        category="SECURITY & ENCLAVE · TRIAGE"
        title="Zoth Bounty Research Hub"
        subtitle="Exact FIRST.org CVSS v3.1 base score calculator, wildcard in-scope/out-of-scope URL matcher, and HackerOne/Bugcrowd Markdown PoC report composer."
        version="1.0.0"
        variant="scanline-grid"
        accent={ACCENT_DARK}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
