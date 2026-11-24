import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import PublicIcon from '@mui/icons-material/Public';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
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
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_DARK = '#38BDF8';
const ACCENT_LIGHT = '#0369A1';
const OSINT_PORT = 8085;
const OSINT_BASE_URL = `http://127.0.0.1:${OSINT_PORT}`;

const DOMAIN_PRESETS = ['example.com', 'nullai.tech', 'iana.org'];

const EMAIL_PRESETS = [
  {
    id: 'strict-hardened',
    label: 'Strict Hardened (98/100)',
    spf: 'v=spf1 include:_spf.google.com include:spf.protection.outlook.com -all',
    dmarc: 'v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; pct=100; rua=mailto:dmarc-agg@example.com; ruf=mailto:dmarc-forensic@example.com; fo=1',
  },
  {
    id: 'transitional',
    label: 'Transitional (~all / quarantine)',
    spf: 'v=spf1 include:_spf.google.com include:sendgrid.net include:servers.mcsv.net ~all',
    dmarc: 'v=DMARC1; p=quarantine; pct=50; rua=mailto:security@example.com',
  },
  {
    id: 'broken-permerror',
    label: 'PermError (>10 lookups + +all)',
    spf: 'v=spf1 a mx ptr include:a.example.net include:b.example.net include:c.example.net include:d.example.net include:e.example.net include:f.example.net include:g.example.net include:h.example.net include:i.example.net +all',
    dmarc: 'v=DMARC1; p=none; pct=25',
  },
  {
    id: 'missing-dmarc',
    label: 'Missing DMARC / Weak SPF',
    spf: 'v=spf1 ip4:198.51.100.0/24 ?all',
    dmarc: '',
  },
];

const OPSEC_CHECKLIST_ITEMS = [
  {
    id: 'auth',
    label: 'Written Scope & Authorization Confirmed',
    detail: 'Verify domain ownership, bug bounty ROE, or explicit written permission before collecting intelligence.',
  },
  {
    id: 'passive-only',
    label: 'Passive-Only Collection Enforced',
    detail: 'Limit initial recon to CT logs, DoH DNS, RDAP/WHOIS, and public code search — zero port scanning or brute-forcing.',
  },
  {
    id: 'zero-creds',
    label: 'Zero Credential Stuffing or Intrusive Probing',
    detail: 'Never replay leaked tokens or credentials discovered in public repositories against live endpoints.',
  },
  {
    id: 'boundary',
    label: 'Third-Party & CDN Out-of-Scope Filtering',
    detail: 'Separate customer-owned assets from shared SaaS/CDN IPs before filing vulnerability or exposure reports.',
  },
  {
    id: 'evidence',
    label: 'Timestamped Evidence & Dossier Archival',
    detail: 'Preserve raw TXT records, CT log hashes, and remediation diffs in an encrypted client-side dossier.',
  },
];

/** Strict RFC 1035 / 1123 hostname validator & sanitizer */
function validateDomain(raw) {
  const cleaned = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');

  if (!cleaned) {
    return { valid: false, normalized: '', error: 'Enter a target domain name (e.g. example.com).' };
  }
  if (cleaned.length > 253) {
    return { valid: false, normalized: cleaned, error: 'Domain exceeds RFC 1035 maximum length of 253 characters.' };
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(cleaned)) {
    return { valid: false, normalized: cleaned, error: 'IPv4 literal detected — enter a DNS hostname instead.' };
  }
  if (!cleaned.includes('.')) {
    return { valid: false, normalized: cleaned, error: 'Hostname must include a valid TLD label (e.g. example.com).' };
  }
  const labels = cleaned.split('.');
  const labelRx = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  for (const label of labels) {
    if (!labelRx.test(label)) {
      return {
        valid: false,
        normalized: cleaned,
        error: `Invalid RFC 1123 label "${label}" — labels must be 1–63 alphanumeric chars with internal hyphens only.`,
      };
    }
  }
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || /^\d+$/.test(tld)) {
    return { valid: false, normalized: cleaned, error: `Invalid TLD ".${tld}" — TLD must be alphabetic (min 2 chars).` };
  }
  const orgSlug = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
  return { valid: true, normalized: cleaned, labels, tld, orgSlug, error: null };
}

/** Real client-side RFC 7208 SPF & RFC 7489 DMARC posture parser */
function analyzeEmailPosture(spfRaw, dmarcRaw, domain) {
  const spfText = String(spfRaw || '').trim();
  const dmarcText = String(dmarcRaw || '').trim();
  const findings = [];
  let score = 100;

  // --- SPF Analysis ---
  const spf = {
    present: Boolean(spfText),
    validVersion: false,
    lookups: 0,
    lookupMechanisms: [],
    hasPtr: false,
    allMechanism: 'missing',
    ipCount: 0,
    includes: [],
    redirect: null,
  };

  if (!spfText) {
    score -= 45;
    findings.push({
      scope: 'SPF',
      severity: 'critical',
      title: 'Missing SPF TXT Record',
      detail: 'No v=spf1 record provided. Attackers can spoof envelope-from addresses without sender IP validation.',
    });
  } else {
    const tokens = spfText.replace(/^"+|"+$/g, '').split(/\s+/).filter(Boolean);
    spf.validVersion = tokens[0]?.toLowerCase() === 'v=spf1';
    if (!spf.validVersion) {
      score -= 30;
      findings.push({
        scope: 'SPF',
        severity: 'critical',
        title: 'Invalid SPF Prefix',
        detail: 'SPF record must begin with exact token "v=spf1".',
      });
    }

    tokens.slice(1).forEach((tok) => {
      const lower = tok.toLowerCase();
      if (/^[+\-~?]?all$/.test(lower)) {
        spf.allMechanism = /^[+\-~?]/.test(lower) ? lower : '+all';
        return;
      }
      const stripped = lower.replace(/^[+\-~?]/, '');
      if (stripped.startsWith('include:')) {
        spf.lookups += 1;
        spf.lookupMechanisms.push(tok);
        spf.includes.push(tok.slice(tok.indexOf(':') + 1));
      } else if (stripped === 'a' || stripped.startsWith('a:') || stripped.startsWith('a/')) {
        spf.lookups += 1;
        spf.lookupMechanisms.push(tok);
      } else if (stripped === 'mx' || stripped.startsWith('mx:') || stripped.startsWith('mx/')) {
        spf.lookups += 1;
        spf.lookupMechanisms.push(tok);
      } else if (stripped === 'ptr' || stripped.startsWith('ptr:')) {
        spf.lookups += 1;
        spf.hasPtr = true;
        spf.lookupMechanisms.push(tok);
      } else if (stripped.startsWith('exists:')) {
        spf.lookups += 1;
        spf.lookupMechanisms.push(tok);
      } else if (stripped.startsWith('redirect=')) {
        spf.lookups += 1;
        spf.redirect = tok.slice(tok.indexOf('=') + 1);
        spf.lookupMechanisms.push(tok);
      } else if (stripped.startsWith('ip4:') || stripped.startsWith('ip6:')) {
        spf.ipCount += 1;
      }
    });

    // RFC 7208 10 DNS lookup limit check
    if (spf.lookups > 10) {
      score -= 28;
      findings.push({
        scope: 'SPF',
        severity: 'critical',
        title: `RFC 7208 PermError: ${spf.lookups}/10 DNS Lookups`,
        detail: `Record triggers ${spf.lookups} DNS lookups (${spf.lookupMechanisms.join(', ')}), exceeding the strict RFC 7208 limit of 10 and causing SPF PermError failures.`,
      });
    } else if (spf.lookups >= 9) {
      score -= 6;
      findings.push({
        scope: 'SPF',
        severity: 'medium',
        title: `Approaching SPF Lookup Ceiling (${spf.lookups}/10)`,
        detail: 'Nested includes may push recursive DNS lookups over 10. Flatten unused SaaS includes.',
      });
    }

    if (spf.hasPtr) {
      score -= 10;
      findings.push({
        scope: 'SPF',
        severity: 'high',
        title: 'Deprecated "ptr" Mechanism Present',
        detail: 'RFC 7208 §5.5 deprecates ptr due to slow reverse-DNS amplification and unreliable matching.',
      });
    }

    if (spf.allMechanism === '+all') {
      score -= 35;
      findings.push({
        scope: 'SPF',
        severity: 'critical',
        title: 'Catastrophic "+all" Pass-All Qualifier',
        detail: '"+all" authorizes every IP on the internet to spoof mail for this domain. Replace immediately with "-all".',
      });
    } else if (spf.allMechanism === '?all') {
      score -= 20;
      findings.push({
        scope: 'SPF',
        severity: 'high',
        title: 'Neutral "?all" Policy Offers Zero Spoof Protection',
        detail: 'Upgrade "?all" to "~all" during migration and enforce "-all" once authorized senders are cataloged.',
      });
    } else if (spf.allMechanism === '~all') {
      score -= 8;
      findings.push({
        scope: 'SPF',
        severity: 'medium',
        title: 'SoftFail "~all" Active (Transitional)',
        detail: 'Unauthorized senders are soft-failed rather than rejected. Transition to "-all" when DMARC reports confirm clean alignment.',
      });
    } else if (spf.allMechanism === 'missing' && !spf.redirect) {
      score -= 18;
      findings.push({
        scope: 'SPF',
        severity: 'high',
        title: 'Missing Terminal "all" Mechanism',
        detail: 'Append "-all" so non-matching IPs explicitly fail SPF evaluation.',
      });
    }
  }

  // --- DMARC Analysis ---
  const dmarc = {
    present: Boolean(dmarcText),
    validVersion: false,
    policy: 'missing',
    subPolicy: null,
    pct: 100,
    adkim: 'r',
    aspf: 'r',
    rua: [],
    ruf: [],
    fo: '0',
  };

  if (!dmarcText) {
    score -= 45;
    findings.push({
      scope: 'DMARC',
      severity: 'critical',
      title: 'Missing _dmarc TXT Record',
      detail: 'No v=DMARC1 policy found. Receivers have no enforcement or aggregate reporting instructions for spoofed domains.',
    });
  } else {
    const cleanDmarc = dmarcText.replace(/^"+|"+$/g, '');
    const tags = {};
    cleanDmarc
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const eq = part.indexOf('=');
        if (eq > 0) {
          const k = part.slice(0, eq).trim().toLowerCase();
          const v = part.slice(eq + 1).trim();
          tags[k] = v;
        }
      });

    dmarc.validVersion = tags.v === 'DMARC1';
    if (!dmarc.validVersion) {
      score -= 25;
      findings.push({
        scope: 'DMARC',
        severity: 'critical',
        title: 'Invalid DMARC Version Tag',
        detail: 'DMARC record must start with exact case-sensitive "v=DMARC1".',
      });
    }

    dmarc.policy = (tags.p || 'missing').toLowerCase();
    dmarc.subPolicy = tags.sp ? tags.sp.toLowerCase() : null;
    dmarc.pct = tags.pct !== undefined ? Math.min(100, Math.max(0, Number(tags.pct))) : 100;
    dmarc.adkim = (tags.adkim || 'r').toLowerCase();
    dmarc.aspf = (tags.aspf || 'r').toLowerCase();
    dmarc.rua = tags.rua ? tags.rua.split(',').map((u) => u.trim()).filter(Boolean) : [];
    dmarc.ruf = tags.ruf ? tags.ruf.split(',').map((u) => u.trim()).filter(Boolean) : [];
    dmarc.fo = tags.fo || '0';

    if (dmarc.policy === 'none') {
      score -= 24;
      findings.push({
        scope: 'DMARC',
        severity: 'high',
        title: 'Monitor-Only DMARC Policy (p=none)',
        detail: 'p=none does not block spoofed mail. Progress to p=quarantine and then p=reject once legitimate senders pass DKIM/SPF.',
      });
    } else if (dmarc.policy === 'quarantine') {
      score -= 10;
      findings.push({
        scope: 'DMARC',
        severity: 'medium',
        title: 'Quarantine Policy Active (p=quarantine)',
        detail: 'Spoofed messages route to spam rather than hard rejection. Upgrade to p=reject for full spoofing immunity.',
      });
    } else if (dmarc.policy !== 'reject') {
      score -= 30;
      findings.push({
        scope: 'DMARC',
        severity: 'critical',
        title: `Invalid or Missing DMARC Policy (p=${dmarc.policy})`,
        detail: 'Specify p=reject (recommended) or p=quarantine.',
      });
    }

    if (Number.isNaN(dmarc.pct) || dmarc.pct < 100) {
      score -= 8;
      findings.push({
        scope: 'DMARC',
        severity: 'medium',
        title: `Partial Enforcement Percentage (pct=${Number.isNaN(dmarc.pct) ? '?' : dmarc.pct}%)`,
        detail: 'Raise pct=100 so policy applies to 100% of unaligned traffic.',
      });
    }

    if (dmarc.rua.length === 0) {
      score -= 10;
      findings.push({
        scope: 'DMARC',
        severity: 'medium',
        title: 'No Aggregate Reporting URI (rua=)',
        detail: `Add rua=mailto:dmarc@${domain || 'example.com'} to receive daily XML alignment telemetry.`,
      });
    }
  }

  const finalScore = Math.min(100, Math.max(0, score));
  const grade =
    finalScore >= 90
      ? { label: 'A · HARDENED', color: SOV.emerald }
      : finalScore >= 70
        ? { label: 'B · TRANSITIONAL', color: SOV.cyber }
        : finalScore >= 45
          ? { label: 'C · AT RISK', color: SOV.amber }
          : { label: 'F · SPOOFABLE', color: SOV.crimson };

  // Build deterministic recommended records for remediation diff
  const safeDomain = domain || 'example.com';
  const keptIncludes = spf.includes.slice(0, 6).map((inc) => `include:${inc}`);
  const recommendedSpf = `v=spf1 ${keptIncludes.length ? `${keptIncludes.join(' ')} ` : 'include:_spf.google.com '}-all`;
  const ruaTarget = dmarc.rua[0] || `mailto:dmarc-agg@${safeDomain}`;
  const recommendedDmarc = `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; pct=100; rua=${ruaTarget}; fo=1`;

  if (findings.length === 0) {
    findings.push({
      scope: 'POSTURE',
      severity: 'low',
      title: 'Strict SPF & DMARC Enforcement Verified',
      detail: 'SPF lookups are within RFC 7208 limits with -all hardfail and DMARC enforces p=reject at pct=100 with rua reporting.',
    });
  }

  return {
    score: finalScore,
    grade,
    spf,
    dmarc,
    findings,
    recommendedSpf,
    recommendedDmarc,
  };
}

export default function OsintScoutSkillGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_DARK, isDark);
  const { copied, copy } = useCopy();

  const [daemonState, setDaemonState] = useState('remote');
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const host = window.location.hostname;
    if (host !== '127.0.0.1' && host !== 'localhost') {
      setDaemonState('remote');
      return undefined;
    }
    const ctrl = new AbortController();
    fetch(`${OSINT_BASE_URL}/health`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('offline'))))
      .then(() => setDaemonState('online'))
      .catch(() => {
        if (!ctrl.signal.aborted) setDaemonState('offline');
      });
    return () => ctrl.abort();
  }, []);

  // 1. Domain Recon Pivot Matrix state
  const [domainInput, setDomainInput] = useState('example.com');
  const [pivotTab, setPivotTab] = useState('ct'); // 'ct' | 'doh' | 'rdap' | 'github' | 'headers'

  // 2. SPF / DMARC Posture Analyzer state
  const [emailPresetId, setEmailPresetId] = useState(EMAIL_PRESETS[1].id);
  const [spfInput, setSpfInput] = useState(EMAIL_PRESETS[1].spf);
  const [dmarcInput, setDmarcInput] = useState(EMAIL_PRESETS[1].dmarc);

  // 3. OPSEC Checklist state
  const [opsecState, setOpsecState] = useState({
    auth: true,
    'passive-only': true,
    'zero-creds': true,
    boundary: false,
    evidence: false,
  });

  const domainCheck = useMemo(() => validateDomain(domainInput), [domainInput]);
  const targetDomain = domainCheck.valid ? domainCheck.normalized : 'example.com';
  const orgSlug = domainCheck.valid ? domainCheck.orgSlug : 'example';

  const emailPosture = useMemo(
    () => analyzeEmailPosture(spfInput, dmarcInput, targetDomain),
    [spfInput, dmarcInput, targetDomain],
  );

  const opsecDone = Object.values(opsecState).filter(Boolean).length;

  // Build passive recon pivots
  const pivots = useMemo(() => {
    const d = targetDomain;
    const enc = encodeURIComponent(d);
    const ctCode = [
      `# Certificate Transparency (crt.sh) — Passive Subdomain Enumeration for ${d}`,
      `curl -sS "https://crt.sh/?q=%25.${enc}&output=json" \\`,
      `  | jq -r '.[].name_value' \\`,
      `  | sed 's/\\*\\.//g' | tr '[:upper:]' '[:lower:]' | sort -u`,
      '',
      '# Web pivot URL:',
      `# https://crt.sh/?q=%25.${enc}`,
    ].join('\n');

    const dohTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CAA'];
    const dohCode = [
      `# DNS-over-HTTPS (Cloudflare JSON API) + dig passive sweep for ${d}`,
      ...dohTypes.map(
        (t) => `curl -sS -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=${enc}&type=${t}" | jq '{type:"${t}", answer:[.Answer[]?.data]}'`,
      ),
      `curl -sS -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=_dmarc.${enc}&type=TXT" | jq '{type:"DMARC", answer:[.Answer[]?.data]}'`,
      '',
      '# Equivalent local dig commands:',
      `dig +short ${d} A AAAA MX TXT NS CAA`,
      `dig +short _dmarc.${d} TXT`,
    ].join('\n');

    const rdapCode = [
      `# RDAP Structured Registration & Nameserver Provenance for ${d}`,
      `curl -sSL "https://rdap.org/domain/${enc}" | jq '{ldhName, status, events, nameservers:[.nameservers[]?.ldhName]}'`,
      '',
      '# Classic WHOIS fallback:',
      `whois ${d} | grep -iE "registrar|creation date|expiry|name server|dnssec"`,
      '',
      '# Local osint-scout daemon loopback recon (127.0.0.1:8085):',
      `curl -sS "${OSINT_BASE_URL}/api/recon?domain=${enc}" | jq .`,
    ].join('\n');

    const githubDorks = [
      `"${d}" (filename:.env OR filename:.env.production OR filename:config.yaml)`,
      `"${d}" ("API_KEY" OR "SECRET_KEY" OR "AWS_ACCESS_KEY_ID" OR "PRIVATE KEY")`,
      `"@${d}" (password OR token OR bearer OR smtp)`,
      `org:${orgSlug} "${d}" (staging OR internal OR admin OR dev)`,
      `"${d}" (path:*.tf OR path:*.yml OR path:docker-compose.yml)`,
    ];
    const githubCode = [
      `# GitHub Passive Code & Secret Leak Search Dorks for ${d}`,
      ...githubDorks.map((q, idx) => `# ${idx + 1}. ${q}\n#    https://github.com/search?type=code&q=${encodeURIComponent(q)}`),
    ].join('\n\n');

    const headersCode = [
      `# Passive HTTP Security Header Audit for https://${d}`,
      `curl -sSI --max-time 10 "https://${d}" \\`,
      '  | grep -iE "^(http/|strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|server|x-powered-by):"',
      '',
      '# TLS Certificate & SAN Verification (OpenSSL):',
      `echo | openssl s_client -servername ${d} -connect ${d}:443 2>/dev/null \\`,
      '  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName',
    ].join('\n');

    return {
      ct: { title: `crt-sh-${d}.sh`, badge: 'CERT TRANSPARENCY', code: ctCode },
      doh: { title: `doh-dns-${d}.sh`, badge: 'DNS-OVER-HTTPS', code: dohCode },
      rdap: { title: `rdap-whois-${d}.sh`, badge: 'RDAP / WHOIS', code: rdapCode },
      github: { title: `github-dorks-${d}.txt`, badge: 'GITHUB DORKS', code: githubCode },
      headers: { title: `http-headers-${d}.sh`, badge: 'HTTP HEADERS & TLS', code: headersCode },
    };
  }, [targetDomain, orgSlug]);

  const activePivot = pivots[pivotTab] || pivots.ct;

  const dossierMarkdown = useMemo(() => {
    const lines = [
      `# Passive OSINT Dossier — ${targetDomain}`,
      '',
      `- **Target Domain**: \`${targetDomain}\` (RFC Validation: ${domainCheck.valid ? 'VALID' : 'FALLBACK'})`,
      `- **Email Security Posture Score**: **${emailPosture.score}/100 (${emailPosture.grade.label})**`,
      `- **OPSEC Scope Checklist**: ${opsecDone}/${OPSEC_CHECKLIST_ITEMS.length} verified`,
      '',
      '## 1. SPF & DMARC Audit Summary',
      `- **Current SPF**: \`${spfInput || '(missing)'}\``,
      `- **SPF DNS Lookups**: ${emailPosture.spf.lookups}/10 (RFC 7208 limit) · Terminal Qualifier: \`${emailPosture.spf.allMechanism}\``,
      `- **Current DMARC**: \`${dmarcInput || '(missing)'}\``,
      `- **DMARC Policy**: \`p=${emailPosture.dmarc.policy}\` · \`pct=${emailPosture.dmarc.pct}%\` · \`rua=${emailPosture.dmarc.rua.join(', ') || 'none'}\``,
      '',
      '### Findings',
      ...emailPosture.findings.map((f) => `- **[${f.severity.toUpperCase()} · ${f.scope}] ${f.title}** — ${f.detail}`),
      '',
      '### Recommended Hardened DNS TXT Records',
      '```text',
      `${targetDomain}.       IN TXT "${emailPosture.recommendedSpf}"`,
      `_dmarc.${targetDomain}. IN TXT "${emailPosture.recommendedDmarc}"`,
      '```',
      '',
      '## 2. Passive Reconnaissance Pivot Commands',
      '### Certificate Transparency (crt.sh)',
      '```bash',
      pivots.ct.code,
      '```',
      '',
      '### DNS-over-HTTPS (A/AAAA/MX/TXT/NS/CAA/DMARC)',
      '```bash',
      pivots.doh.code,
      '```',
      '',
      '### RDAP & WHOIS',
      '```bash',
      pivots.rdap.code,
      '```',
      '',
      '### HTTP Security Headers & TLS',
      '```bash',
      pivots.headers.code,
      '```',
      '',
      '## 3. OPSEC & Rules of Engagement Checklist',
      ...OPSEC_CHECKLIST_ITEMS.map((item) => `- [${opsecState[item.id] ? 'x' : ' '}] **${item.label}** — ${item.detail}`),
      '',
      '---',
      '_Generated client-side by Domain Intel OSINT Scout v2.5.0 · Engineered by Neal Frazier Tech (@1nc0gn30) · NullAI Platform_',
    ];
    return lines.join('\n');
  }, [targetDomain, domainCheck.valid, emailPosture, spfInput, dmarcInput, pivots, opsecState, opsecDone]);

  const dossierJson = useMemo(() => {
    return JSON.stringify(
      {
        schema: 'osint-scout-skill/dossier/v2.5',
        domain: targetDomain,
        domain_valid: domainCheck.valid,
        email_posture: {
          score: emailPosture.score,
          grade: emailPosture.grade.label,
          spf_raw: spfInput,
          dmarc_raw: dmarcInput,
          spf_parsed: emailPosture.spf,
          dmarc_parsed: emailPosture.dmarc,
          findings: emailPosture.findings,
          recommended_records: {
            spf: emailPosture.recommendedSpf,
            dmarc: emailPosture.recommendedDmarc,
          },
        },
        opsec_checklist: OPSEC_CHECKLIST_ITEMS.map((i) => ({
          id: i.id,
          label: i.label,
          verified: Boolean(opsecState[i.id]),
        })),
        pivots: {
          crt_sh: `https://crt.sh/?q=%25.${encodeURIComponent(targetDomain)}&output=json`,
          rdap: `https://rdap.org/domain/${encodeURIComponent(targetDomain)}`,
          doh_txt: `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(targetDomain)}&type=TXT`,
          doh_dmarc: `https://cloudflare-dns.com/dns-query?name=_dmarc.${encodeURIComponent(targetDomain)}&type=TXT`,
        },
      },
      null,
      2,
    );
  }, [targetDomain, domainCheck.valid, emailPosture, spfInput, dmarcInput, opsecState]);

  const kpis = [
    {
      label: 'Email Posture',
      value: `${emailPosture.score}/100`,
      unit: emailPosture.grade.label,
      accent: emailPosture.grade.color,
    },
    {
      label: 'SPF Lookups',
      value: `${emailPosture.spf.lookups}/10`,
      unit: emailPosture.spf.allMechanism,
      accent: emailPosture.spf.lookups > 10 || emailPosture.spf.allMechanism === '+all' ? SOV.crimson : SOV.emerald,
    },
    {
      label: 'DMARC Policy',
      value: `p=${emailPosture.dmarc.policy}`,
      unit: `pct=${emailPosture.dmarc.pct}% · ${emailPosture.dmarc.rua.length} rua`,
      accent: emailPosture.dmarc.policy === 'reject' ? SOV.emerald : emailPosture.dmarc.policy === 'quarantine' ? SOV.amber : SOV.crimson,
    },
    {
      label: 'OPSEC Gate',
      value: `${opsecDone}/${OPSEC_CHECKLIST_ITEMS.length}`,
      unit: domainCheck.valid ? targetDomain : 'invalid domain',
      accent: opsecDone === OPSEC_CHECKLIST_ITEMS.length ? SOV.emerald : ACCENT_DARK,
    },
  ];

  const statusNode = (
    <SovereignStatusPill
      status={daemonState === 'online' ? 'online' : 'standby'}
      label={
        daemonState === 'online'
          ? 'LOCALHOST :8085 SCOUT DAEMON ONLINE'
          : daemonState === 'offline'
            ? 'LOCALHOST :8085 OFFLINE · PASSIVE CLIENT WORKSTATION'
            : '100% PASSIVE CLIENT ENGINE · ZERO AUTO-PROBES'
      }
      sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
    />
  );

  const actions = [
    {
      label: copied === 'dossier_md' ? 'Copied Dossier (.md)' : 'Copy Dossier (.md)',
      icon: copied === 'dossier_md' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(dossierMarkdown, 'dossier_md'),
      primary: true,
    },
    {
      label: 'Download osint-dossier.md',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(dossierMarkdown, `osint-dossier-${targetDomain}.md`, 'text/markdown;charset=utf-8'),
    },
    {
      label: 'Download JSON',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(dossierJson, `osint-dossier-${targetDomain}.json`, 'application/json;charset=utf-8'),
    },
  ];

  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? SOV.slate : '#475467';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : '#F8F6F0';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16,24,40,0.12)';

  const severityColor = (sev) => {
    if (sev === 'critical') return resolveModeAccent(SOV.crimson, isDark);
    if (sev === 'high') return resolveModeAccent(SOV.amber, isDark);
    if (sev === 'medium') return resolveModeAccent(SOV.cyber, isDark);
    return resolveModeAccent(SOV.emerald, isDark);
  };

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <SovereignAlertBanner
        severity={daemonState === 'online' ? 'success' : 'info'}
        title="Runtime Scope Disclosure — Passive Recon & Local DNS Parser"
        message={
          daemonState === 'online'
            ? 'Detected local osint-scout-skill daemon on 127.0.0.1:8085. All RFC domain validation, pivot command generation, SPF/DMARC parsing, and dossier exports execute locally without unrequested target probes.'
            : 'Domain validation, passive OSINT pivot matrices (crt.sh, DoH, RDAP, GitHub dorks, TLS/headers), SPF/DMARC parsing, and dossier exports run 100% client-side with zero outbound requests from your browser.'
        }
      />

      <SovereignCard
        index="01"
        eyebrow="PASSIVE DOMAIN RECON MATRIX"
        title="Target Hostname & Recon Pivots"
        subtitle="Strict RFC 1035/1123 hostname validator generating structured CT, DoH, RDAP, GitHub, and header checks"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {DOMAIN_PRESETS.map((d) => (
            <Chip
              key={d}
              label={d}
              clickable
              onClick={() => setDomainInput(d)}
              sx={{
                minHeight: 34,
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: targetDomain === d ? 700 : 500,
                bgcolor: targetDomain === d ? rgba(ACCENT_DARK, isDark ? 0.2 : 0.12) : 'transparent',
                color: targetDomain === d ? accent : textSecondary,
                border: `1px solid ${targetDomain === d ? rgba(accent, 0.55) : borderSubtle}`,
              }}
            />
          ))}
        </Box>

        <TextField
          size="small"
          fullWidth
          label="Target Domain (RFC 1035 / 1123 Hostname)"
          placeholder="example.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          error={!domainCheck.valid}
          helperText={
            domainCheck.valid
              ? `Validated FQDN: ${domainCheck.normalized} · TLD: .${domainCheck.tld} · Labels: ${domainCheck.labels.length}`
              : domainCheck.error
          }
          InputProps={{
            startAdornment: <PublicIcon fontSize="small" sx={{ mr: 1, color: domainCheck.valid ? accent : resolveModeAccent(SOV.crimson, isDark) }} />,
            sx: { fontFamily: MONO, fontSize: '0.84rem' },
          }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2, mb: 1.5 }}>
          {[
            { id: 'ct', label: 'Cert Transparency (crt.sh)' },
            { id: 'doh', label: 'DoH DNS (7 Types)' },
            { id: 'rdap', label: 'RDAP / WHOIS' },
            { id: 'github', label: 'GitHub Dorks' },
            { id: 'headers', label: 'HTTP Headers & TLS' },
          ].map((tab) => {
            const active = pivotTab === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setPivotTab(tab.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(ACCENT_DARK, isDark ? 0.2 : 0.14) : 'transparent',
                  color: active ? accent : textSecondary,
                  border: `1px solid ${active ? rgba(accent, 0.55) : borderSubtle}`,
                }}
              />
            );
          })}
        </Box>

        <SovereignCodeBlock
          title={activePivot.title}
          badge={activePivot.badge}
          code={activePivot.code}
          filename={activePivot.title}
          accent={ACCENT_DARK}
          maxHeight={300}
        />
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="OPSEC & ROE GOVERNANCE"
        title="Pre-Engagement Scope Checklist"
        subtitle="Track operational hygiene checks before exporting your passive OSINT dossier"
        accent={SOV.emerald}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
          {OPSEC_CHECKLIST_ITEMS.map((item) => {
            const checked = Boolean(opsecState[item.id]);
            return (
              <Box
                key={item.id}
                sx={{
                  p: 1,
                  borderRadius: 1.25,
                  bgcolor: checked ? rgba(SOV.emerald, isDark ? 0.1 : 0.07) : surfaceBg,
                  border: `1px solid ${checked ? rgba(SOV.emerald, 0.35) : borderSubtle}`,
                }}
              >
                <FormControlLabel
                  sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={(e) => setOpsecState((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                      sx={{ p: 0.5, mr: 1, mt: 0.1 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: textPrimary }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem', color: textSecondary, mt: 0.2 }}>
                        {item.detail}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            );
          })}
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <SovereignCard
        index="03"
        eyebrow="SPF / DMARC / EMAIL POSTURE ANALYZER"
        title="RFC 7208 & RFC 7489 DNS TXT Parser"
        subtitle="Paste live SPF and _dmarc TXT records to audit DNS lookup counts (<= 10), policy enforcement, and reporting"
        accent={emailPosture.grade.color}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {EMAIL_PRESETS.map((preset) => {
            const active = emailPresetId === preset.id;
            return (
              <Chip
                key={preset.id}
                label={preset.label}
                clickable
                onClick={() => {
                  setEmailPresetId(preset.id);
                  setSpfInput(preset.spf);
                  setDmarcInput(preset.dmarc);
                }}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(ACCENT_DARK, isDark ? 0.2 : 0.12) : 'transparent',
                  color: active ? accent : textSecondary,
                  border: `1px solid ${active ? rgba(accent, 0.55) : borderSubtle}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <TextField
            size="small"
            multiline
            minRows={2}
            fullWidth
            label={`SPF TXT Record (${targetDomain})`}
            placeholder="v=spf1 include:_spf.google.com -all"
            value={spfInput}
            onChange={(e) => {
              setEmailPresetId('custom');
              setSpfInput(e.target.value);
            }}
            InputProps={{
              startAdornment: <MailOutlineIcon fontSize="small" sx={{ mr: 1, mt: 0.4, color: accent }} />,
              sx: { fontFamily: MONO, fontSize: '0.78rem' },
            }}
          />

          <TextField
            size="small"
            multiline
            minRows={2}
            fullWidth
            label={`DMARC TXT Record (_dmarc.${targetDomain})`}
            placeholder="v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@example.com"
            value={dmarcInput}
            onChange={(e) => {
              setEmailPresetId('custom');
              setDmarcInput(e.target.value);
            }}
            InputProps={{
              startAdornment: <SecurityIcon fontSize="small" sx={{ mr: 1, mt: 0.4, color: accent }} />,
              sx: { fontFamily: MONO, fontSize: '0.78rem' },
            }}
          />
        </Box>

        {/* Score & Parsed Mechanics */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2.5,
            p: 1.75,
            borderRadius: 1.5,
            bgcolor: surfaceBg,
            border: `1px solid ${borderSubtle}`,
            mb: 2,
          }}
        >
          <SovereignGauge
            value={emailPosture.score}
            min={0}
            max={100}
            label="POSTURE"
            unit="/100"
            status={emailPosture.grade.label}
            invertThresholds
            thresholds={{ warn: 70, danger: 45 }}
            size={140}
          />
          <Box sx={{ flex: '1 1 220px', minWidth: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box sx={{ p: 1, borderRadius: 1.25, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: `1px solid ${borderSubtle}` }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: textSecondary }}>SPF DNS LOOKUPS</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.95rem', fontWeight: 700, color: emailPosture.spf.lookups > 10 ? resolveModeAccent(SOV.crimson, isDark) : textPrimary }}>
                {emailPosture.spf.lookups} / 10
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: textSecondary }}>
                all: {emailPosture.spf.allMechanism}
              </Typography>
            </Box>

            <Box sx={{ p: 1, borderRadius: 1.25, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: `1px solid ${borderSubtle}` }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: textSecondary }}>DMARC ENFORCEMENT</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.95rem', fontWeight: 700, color: textPrimary }}>
                p={emailPosture.dmarc.policy}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: textSecondary }}>
                pct={emailPosture.dmarc.pct}% · adkim={emailPosture.dmarc.adkim}
              </Typography>
            </Box>

            <Box sx={{ p: 1, borderRadius: 1.25, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', border: `1px solid ${borderSubtle}`, gridColumn: '1 / -1' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', color: textSecondary }}>RUA TELEMETRY TARGETS</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: textPrimary, wordBreak: 'break-all' }}>
                {emailPosture.dmarc.rua.length > 0 ? emailPosture.dmarc.rua.join(', ') : 'None configured (blind to spoofing attempts)'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Findings List */}
        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: textSecondary, mb: 1 }}>
          PARSED AUDIT FINDINGS ({emailPosture.findings.length})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, mb: 2 }}>
          {emailPosture.findings.map((f, idx) => {
            const col = severityColor(f.severity);
            return (
              <Box
                key={`${f.scope}-${idx}`}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: surfaceBg,
                  border: `1px solid ${rgba(col, 0.4)}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.35, flexWrap: 'wrap' }}>
                  {f.severity === 'critical' ? (
                    <ErrorOutlineIcon fontSize="small" sx={{ color: col }} />
                  ) : f.severity === 'low' ? (
                    <CheckCircleOutlineIcon fontSize="small" sx={{ color: col }} />
                  ) : (
                    <WarningAmberIcon fontSize="small" sx={{ color: col }} />
                  )}
                  <Chip
                    size="small"
                    label={`${f.scope} · ${f.severity.toUpperCase()}`}
                    sx={{
                      height: 20,
                      fontFamily: MONO,
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      bgcolor: rgba(col, isDark ? 0.2 : 0.12),
                      color: col,
                    }}
                  />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 700, color: textPrimary }}>
                    {f.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: textSecondary }}>
                  {f.detail}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Remediation Diff */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <VerifiedUserIcon fontSize="small" sx={{ color: resolveModeAccent(SOV.emerald, isDark) }} />
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: textPrimary }}>
              RECOMMENDED DNS REMEDIATION DIFF
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => {
              setEmailPresetId('custom');
              setSpfInput(emailPosture.recommendedSpf);
              setDmarcInput(emailPosture.recommendedDmarc);
            }}
            sx={{ fontFamily: MONO, fontSize: '0.72rem', textTransform: 'none', color: resolveModeAccent(SOV.emerald, isDark), minHeight: 36 }}
          >
            Apply Recommended Records
          </Button>
        </Box>

        <SovereignCodeBlock
          title={`dns-remediation-${targetDomain}.diff`}
          badge="HARDENED SPF + DMARC DIFF"
          code={[
            `# Current vs Recommended DNS TXT Records for ${targetDomain}`,
            `- ${targetDomain}.        IN TXT "${spfInput || '(missing)'}"`,
            `+ ${targetDomain}.        IN TXT "${emailPosture.recommendedSpf}"`,
            '',
            `- _dmarc.${targetDomain}. IN TXT "${dmarcInput || '(missing)'}"`,
            `+ _dmarc.${targetDomain}. IN TXT "${emailPosture.recommendedDmarc}"`,
          ].join('\n')}
          filename={`dns-remediation-${targetDomain}.diff`}
          accent={SOV.emerald}
          maxHeight={200}
        />
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="DOSSIER PREVIEW & EXPORT"
        title="osint-dossier.md"
        subtitle="Full passive recon plan, pivot commands, parsed email posture, and verified OPSEC checklist"
        accent={ACCENT_DARK}
      >
        <SovereignCodeBlock
          title={`osint-dossier-${targetDomain}.md`}
          badge="MARKDOWN DOSSIER"
          code={dossierMarkdown}
          filename={`osint-dossier-${targetDomain}.md`}
          accent={ACCENT_DARK}
          maxHeight={260}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="osint-scout-skill"
      category="SECURITY & RECON"
      title="Domain Intel OSINT Scout"
      subtitle="100% client-side passive domain reconnaissance pivot matrix, RFC 7208/7489 SPF & DMARC posture analyzer, and OPSEC dossier generator. Engineered by Neal Frazier Tech (@1nc0gn30) · NullAI Platform."
      version="2.5.0"
      accent={ACCENT_DARK}
      metrics={kpis}
      actions={actions}
      status={statusNode}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={6}
      rightCols={6}
      tutorialSteps={[
        {
          title: 'Validate Target Domain & Build Pivots',
          description: 'Enter an authorized hostname to generate passive Certificate Transparency, DoH DNS, RDAP/WHOIS, GitHub secret dork, and HTTP header commands.',
        },
        {
          title: 'Audit SPF & DMARC TXT Posture',
          description: 'Paste live SPF and _dmarc records to check the 10-lookup RFC 7208 ceiling, all-qualifier strictness, p=reject/quarantine enforcement, and rua telemetry.',
        },
        {
          title: 'Verify OPSEC Gate & Export Dossier',
          description: 'Complete the pre-engagement OPSEC checklist and export the complete Markdown or JSON OSINT dossier.',
        },
      ]}
    />
  );
}
