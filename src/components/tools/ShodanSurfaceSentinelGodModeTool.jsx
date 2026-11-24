import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BugReportIcon from '@mui/icons-material/BugReport';
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

const ACCENT_DARK = '#F59E0B';
const ACCENT_LIGHT = '#B45309';
const SENTINEL_PORT = 8130;
const SENTINEL_BASE_URL = `http://127.0.0.1:${SENTINEL_PORT}`;

const RISKY_PORTS = {
  21: { service: 'FTP', severity: 'high', weight: 12, note: 'Cleartext credentials & file transfer; migrate to SFTP/FTPS.' },
  22: { service: 'SSH', severity: 'medium', weight: 7, note: 'Restrict to VPN/bastion CIDR, enforce Ed25519 keys, disable PasswordAuthentication.' },
  23: { service: 'Telnet', severity: 'critical', weight: 22, note: 'Unencrypted remote shell; disable immediately and replace with SSH over VPN.' },
  445: { service: 'SMB', severity: 'critical', weight: 20, note: 'Internet-exposed SMB is high-risk for ransomware/worm lateral movement; block at edge.' },
  3306: { service: 'MySQL', severity: 'high', weight: 16, note: 'Database port exposed publicly; bind to 127.0.0.1 or private VPC subnet with TLS.' },
  3389: { service: 'RDP', severity: 'critical', weight: 18, note: 'Exposed Remote Desktop; enforce NLA and place strictly behind WireGuard/Tailscale.' },
  5432: { service: 'PostgreSQL', severity: 'high', weight: 16, note: 'Expose PostgreSQL only on private interface; require scram-sha-256 + ssl=on.' },
  5900: { service: 'VNC', severity: 'high', weight: 15, note: 'Unencrypted remote framebuffer; tunnel over SSH or restrict to loopback.' },
  6379: { service: 'Redis', severity: 'critical', weight: 22, note: 'Exposed Redis risks unauthenticated RCE/data wipe; bind 127.0.0.1 + ACL + protected-mode yes.' },
  8080: { service: 'HTTP-Alt / Admin', severity: 'medium', weight: 6, note: 'Audit for exposed dev dashboards, proxies, or unauthenticated metrics endpoints.' },
  9200: { service: 'Elasticsearch', severity: 'critical', weight: 20, note: 'Unauthenticated search cluster leaks full indices; enforce X-Pack TLS & private bind.' },
  27017: { service: 'MongoDB', severity: 'critical', weight: 20, note: 'Public MongoDB risks immediate collection exfiltration; enable auth + private bindIp.' },
};

const RISKY_TAGS = {
  compromised: { weight: 24, note: 'Host tagged as compromised in threat telemetry; isolate and run forensic triage.' },
  'eol-os': { weight: 14, note: 'End-of-life operating system detected; schedule immediate OS migration.' },
  'self-signed': { weight: 8, note: 'Self-signed TLS certificate on public interface; issue automated ACME/PKI cert.' },
  database: { weight: 10, note: 'Database banner exposed to internet; move behind private enclave.' },
  'remote-access': { weight: 10, note: 'Remote administration service exposed; enforce zero-trust tunnel.' },
  starttls: { weight: 3, note: 'Verify strict TLS downgrade protections and modern cipher suites.' },
};

const DORK_PRESETS = [
  {
    id: 'exposed-admin',
    label: 'Exposed Admin Panels',
    summary: 'Locate publicly reachable Grafana, Portainer, Jenkins, or custom admin dashboards within your org CIDR.',
    filters: {
      org: 'Example Infrastructure LLC',
      net: '198.51.100.0/24',
      port: '8080,8443,3000,9000',
      product: '',
      vuln: '',
      httpTitle: 'Admin',
      sslCn: '',
      country: 'US',
      extra: 'has_screenshot:true',
    },
  },
  {
    id: 'unencrypted-db',
    label: 'Unencrypted Databases',
    summary: 'Audit owned subnets for publicly exposed MySQL, PostgreSQL, Redis, Elasticsearch, or MongoDB ports.',
    filters: {
      org: '',
      net: '203.0.113.0/24',
      port: '3306,5432,6379,9200,27017',
      product: '',
      vuln: '',
      httpTitle: '',
      sslCn: '',
      country: '',
      extra: '-has_ssl:true',
    },
  },
  {
    id: 'self-signed-tls',
    label: 'Self-Signed TLS',
    summary: 'Find services presenting self-signed or default localhost TLS certificates across your domain perimeter.',
    filters: {
      org: '',
      net: '192.0.2.0/24',
      port: '443,8443',
      product: '',
      vuln: '',
      httpTitle: '',
      sslCn: 'localhost',
      country: '',
      extra: 'tag:self-signed',
    },
  },
  {
    id: 'stale-ssh-nginx',
    label: 'Stale OpenSSH / Nginx',
    summary: 'Identify legacy OpenSSH or Nginx edge nodes flagged with known high-impact CVEs.',
    filters: {
      org: '',
      net: '198.51.100.0/24',
      port: '22,80,443',
      product: 'OpenSSH',
      vuln: 'CVE-2024-6387',
      httpTitle: '',
      sslCn: '',
      country: '',
      extra: '',
    },
  },
];

const INTERNETDB_PRESETS = [
  {
    id: 'staging-db',
    label: 'Exposed Redis + Postgres (203.0.113.42)',
    record: {
      ip: '203.0.113.42',
      ports: [22, 80, 443, 5432, 6379, 8080],
      cpes: [
        'cpe:/a:openbsd:openssh:8.4',
        'cpe:/a:igor_sysoev:nginx:1.18.0',
        'cpe:/a:postgresql:postgresql:13.4',
        'cpe:/a:redis:redis:6.0.9',
      ],
      hostnames: ['staging-api.example.net', 'cache-01.example.net'],
      tags: ['database', 'self-signed'],
      vulns: ['CVE-2024-6387', 'CVE-2022-24735', 'CVE-2021-23017'],
    },
  },
  {
    id: 'legacy-elastic',
    label: 'Legacy Telnet + Elastic (198.51.100.77)',
    record: {
      ip: '198.51.100.77',
      ports: [22, 23, 3306, 9200, 27017],
      cpes: [
        'cpe:/a:openbsd:openssh:7.9',
        'cpe:/a:elasticsearch:elasticsearch:7.10.2',
        'cpe:/a:mongodb:mongodb:4.4.6',
      ],
      hostnames: ['dev-search.example.org'],
      tags: ['database', 'eol-os', 'remote-access'],
      vulns: ['CVE-2023-38408', 'CVE-2021-44228', 'CVE-2021-22145', 'CVE-2020-7020'],
    },
  },
  {
    id: 'rdp-bastion',
    label: 'Windows RDP + SMB Edge (192.0.2.88)',
    record: {
      ip: '192.0.2.88',
      ports: [443, 445, 3389],
      cpes: ['cpe:/o:microsoft:windows_server_2019', 'cpe:/a:microsoft:iis:10.0'],
      hostnames: ['jump-win01.example.com'],
      tags: ['remote-access', 'self-signed'],
      vulns: ['CVE-2023-21554', 'CVE-2022-21907'],
    },
  },
  {
    id: 'hardened-edge',
    label: 'Hardened Edge Resolver (1.1.1.1)',
    record: {
      ip: '1.1.1.1',
      ports: [53, 80, 443, 853],
      cpes: ['cpe:/a:cloudflare:edge:1.0'],
      hostnames: ['one.one.one.one'],
      tags: [],
      vulns: [],
    },
  },
];

const QUICK_ADD_PORTS = [22, 23, 3306, 5432, 6379, 9200, 27017, 3389];

function quoteIfNeeded(val) {
  const trimmed = String(val || '').trim();
  if (!trimmed) return '';
  if (/\s/.test(trimmed) && !/^".*"$/.test(trimmed)) {
    return `"${trimmed.replace(/"/g, '\\"')}"`;
  }
  return trimmed;
}

function composeShodanQuery(filters) {
  const tokens = [];
  const pairs = [
    ['org', filters.org],
    ['net', filters.net],
    ['port', filters.port],
    ['product', filters.product],
    ['vuln', filters.vuln],
    ['http.title', filters.httpTitle],
    ['ssl.cert.subject.cn', filters.sslCn],
    ['country', filters.country],
  ];
  pairs.forEach(([key, raw]) => {
    const cleaned = String(raw || '').trim();
    if (!cleaned) return;
    tokens.push({ key, value: cleaned, rendered: `${key}:${quoteIfNeeded(cleaned)}` });
  });
  const extra = String(filters.extra || '').trim();
  if (extra) {
    tokens.push({ key: 'extra', value: extra, rendered: extra });
  }
  return {
    tokens,
    query: tokens.map((t) => t.rendered).join(' '),
  };
}

function isValidIpOrCidr(value) {
  const s = String(value || '').trim();
  if (!s) return false;
  const ipv4 = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)(\/([0-9]|[1-2]\d|3[0-2]))?$/;
  const ipv6 = /^[0-9a-fA-F:]+(\/\d{1,3})?$/;
  return ipv4.test(s) || (s.includes(':') && ipv6.test(s));
}

function analyzeInternetDbRecord(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    return { ok: false, error: `Invalid JSON: ${err.message}` };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'InternetDB payload must be a JSON object with ip, ports, cpes, vulns, hostnames, tags.' };
  }

  const ip = typeof parsed.ip === 'string' && parsed.ip.trim() ? parsed.ip.trim() : '203.0.113.10';
  const ports = Array.isArray(parsed.ports)
    ? [...new Set(parsed.ports.map((p) => Number(p)).filter((p) => Number.isInteger(p) && p > 0 && p <= 65535))].sort((a, b) => a - b)
    : [];
  const cpes = Array.isArray(parsed.cpes)
    ? [...new Set(parsed.cpes.map((c) => String(c).trim()).filter(Boolean))]
    : [];
  const vulns = Array.isArray(parsed.vulns)
    ? [...new Set(parsed.vulns.map((v) => String(v).trim().toUpperCase()).filter(Boolean))]
    : [];
  const hostnames = Array.isArray(parsed.hostnames)
    ? [...new Set(parsed.hostnames.map((h) => String(h).trim()).filter(Boolean))]
    : [];
  const tags = Array.isArray(parsed.tags)
    ? [...new Set(parsed.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))]
    : [];

  let score = 0;
  const flaggedPorts = [];
  const remediation = [];
  const breakdown = [];

  ports.forEach((port) => {
    const profile = RISKY_PORTS[port];
    if (profile) {
      score += profile.weight;
      flaggedPorts.push({ port, ...profile });
      remediation.push({
        id: `port-${port}`,
        severity: profile.severity,
        title: `Harden / Restrict TCP/${port} (${profile.service})`,
        detail: profile.note,
      });
    } else if (port !== 80 && port !== 443 && port !== 53 && port !== 853) {
      score += 2;
    }
  });

  if (flaggedPorts.length > 0) {
    const portPts = flaggedPorts.reduce((acc, p) => acc + p.weight, 0);
    breakdown.push({ label: 'Risky Exposed Ports', points: portPts, detail: flaggedPorts.map((p) => `${p.port}/${p.service}`).join(', ') });
  }

  // CVE impact scoring
  let cvePts = 0;
  vulns.forEach((cve) => {
    // Known RCE / critical infrastructure CVEs receive elevated weighting
    const isHighProfile = /(2021-44228|2024-6387|2023-38408|2022-24735|2023-21554)/.test(cve);
    cvePts += isHighProfile ? 14 : 9;
  });
  cvePts = Math.min(45, cvePts);
  score += cvePts;
  if (vulns.length > 0) {
    breakdown.push({ label: 'Confirmed CVE Surface', points: cvePts, detail: `${vulns.length} CVE(s) referenced` });
    remediation.push({
      id: 'patch-cves',
      severity: vulns.length >= 3 ? 'critical' : 'high',
      title: `Patch ${vulns.length} Confirmed CVE(s)`,
      detail: `Prioritize package upgrades or virtual patching for: ${vulns.join(', ')}.`,
    });
  }

  // Tag penalties
  let tagPts = 0;
  tags.forEach((tag) => {
    const meta = RISKY_TAGS[tag];
    if (meta) {
      tagPts += meta.weight;
      remediation.push({
        id: `tag-${tag}`,
        severity: meta.weight >= 14 ? 'critical' : 'medium',
        title: `Resolve Threat Tag: ${tag}`,
        detail: meta.note,
      });
    }
  });
  score += tagPts;
  if (tagPts > 0) {
    breakdown.push({ label: 'Telemetry Risk Tags', points: tagPts, detail: tags.join(', ') });
  }

  // Attack surface breadth (ports + CPEs)
  const breadthPts = Math.min(12, Math.max(0, ports.length - 2) * 2 + Math.floor(cpes.length / 2));
  if (breadthPts > 0) {
    score += breadthPts;
    breakdown.push({ label: 'Service & CPE Breadth', points: breadthPts, detail: `${ports.length} ports · ${cpes.length} CPEs` });
  }

  const finalScore = Math.min(100, Math.max(0, score));
  const tier =
    finalScore >= 75
      ? { label: 'CRITICAL', color: SOV.crimson }
      : finalScore >= 45
        ? { label: 'HIGH', color: SOV.amber }
        : finalScore >= 20
          ? { label: 'MODERATE', color: SOV.cyber }
          : { label: 'LOW', color: SOV.emerald };

  if (remediation.length === 0) {
    remediation.push({
      id: 'baseline-ok',
      severity: 'low',
      title: 'Maintain Minimal Edge Exposure',
      detail: 'No risky database/remote-admin ports or CVEs detected in this InternetDB snapshot. Continue periodic diff checks.',
    });
  }

  return {
    ok: true,
    record: { ip, ports, cpes, vulns, hostnames, tags },
    score: finalScore,
    tier,
    flaggedPorts,
    remediation,
    breakdown,
  };
}

export default function ShodanSurfaceSentinelGodModeTool() {
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
    fetch(`${SENTINEL_BASE_URL}/health`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('offline'))))
      .then(() => setDaemonState('online'))
      .catch(() => {
        if (!ctrl.signal.aborted) setDaemonState('offline');
      });
    return () => ctrl.abort();
  }, []);

  // 1. Shodan Dork Composer state
  const [filters, setFilters] = useState(DORK_PRESETS[0].filters);
  const [activePresetId, setActivePresetId] = useState(DORK_PRESETS[0].id);

  // 2. InternetDB JSON Risk Matrix state
  const [selectedDbPreset, setSelectedDbPreset] = useState(INTERNETDB_PRESETS[0].id);
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(INTERNETDB_PRESETS[0].record, null, 2));
  const [checkedRemediation, setCheckedRemediation] = useState({});

  // 3. CLI & Export Tab state
  const [cliTab, setCliTab] = useState('curl'); // 'curl' | 'shodan' | 'daemon' | 'markdown'

  const composed = useMemo(() => composeShodanQuery(filters), [filters]);
  const analysis = useMemo(() => analyzeInternetDbRecord(jsonInput), [jsonInput]);

  const targetIp = analysis.ok ? analysis.record.ip : '203.0.113.42';
  const netValid = !filters.net.trim() || isValidIpOrCidr(filters.net.trim());

  const handleApplyDorkPreset = (preset) => {
    setActivePresetId(preset.id);
    setFilters({ ...preset.filters });
  };

  const handleFilterChange = (field, value) => {
    setActivePresetId('custom');
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveToken = (key) => {
    const fieldMap = {
      org: 'org',
      net: 'net',
      port: 'port',
      product: 'product',
      vuln: 'vuln',
      'http.title': 'httpTitle',
      'ssl.cert.subject.cn': 'sslCn',
      country: 'country',
      extra: 'extra',
    };
    const field = fieldMap[key];
    if (field) handleFilterChange(field, '');
  };

  const handleLoadDbPreset = (preset) => {
    setSelectedDbPreset(preset.id);
    setJsonInput(JSON.stringify(preset.record, null, 2));
    setCheckedRemediation({});
  };

  const handleTogglePortInJson = (portNum) => {
    if (!analysis.ok) return;
    const exists = analysis.record.ports.includes(portNum);
    const nextPorts = exists
      ? analysis.record.ports.filter((p) => p !== portNum)
      : [...analysis.record.ports, portNum].sort((a, b) => a - b);
    const updated = { ...analysis.record, ports: nextPorts };
    setSelectedDbPreset('custom');
    setJsonInput(JSON.stringify(updated, null, 2));
  };

  const markdownReport = useMemo(() => {
    const queryStr = composed.query || '(empty query)';
    if (!analysis.ok) {
      return `# Shodan Attack Surface Audit Report\n\n- **Composed Query**: \`${queryStr}\`\n- **Parser Status**: ${analysis.error}\n`;
    }
    const { record, score, tier, flaggedPorts, remediation, breakdown } = analysis;
    const lines = [
      `# Shodan Attack Surface Sentinel — Audit Report`,
      '',
      `- **Target IP**: \`${record.ip}\``,
      `- **Hostnames**: ${record.hostnames.length ? record.hostnames.join(', ') : 'None recorded'}`,
      `- **Exposure Severity Score**: **${score}/100 (${tier.label})**`,
      `- **Composed Shodan Query**: \`${queryStr}\``,
      '',
      '## 1. Exposed Ports & Risk Classification',
      `- **All Open Ports**: ${record.ports.length ? record.ports.join(', ') : 'None'}`,
      `- **Flagged High-Risk Ports**: ${flaggedPorts.length ? flaggedPorts.map((p) => `${p.port} (${p.service} · ${p.severity.toUpperCase()})`).join(', ') : 'None'}`,
      '',
      '## 2. Software Stack (CPEs) & CVEs',
      '### CPE Fingerprints',
      ...(record.cpes.length ? record.cpes.map((c) => `- \`${c}\``) : ['- None']),
      '',
      '### Confirmed Vulnerabilities',
      ...(record.vulns.length ? record.vulns.map((v) => `- \`${v}\``) : ['- None']),
      '',
      '## 3. Deterministic Score Breakdown',
      ...(breakdown.length ? breakdown.map((b) => `- **+${b.points} pts** — ${b.label}: ${b.detail}`) : ['- +0 pts — Clean edge surface']),
      '',
      '## 4. Prioritized Remediation Checklist',
      ...remediation.map((r) => `- [${checkedRemediation[r.id] ? 'x' : ' '}] **[${r.severity.toUpperCase()}] ${r.title}** — ${r.detail}`),
      '',
      '---',
      '_Generated client-side by Shodan Attack Surface Sentinel v3.5.0 · Engineered by Neal Frazier Tech (@1nc0gn30) · NullAI Platform_',
    ];
    return lines.join('\n');
  }, [analysis, composed.query, checkedRemediation]);

  const jsonAuditPayload = useMemo(() => {
    return JSON.stringify(
      {
        schema: 'shodan-surface-sentinel/audit/v3.5',
        composed_query: composed.query,
        filters,
        analysis: analysis.ok
          ? {
              ip: analysis.record.ip,
              score: analysis.score,
              severity_tier: analysis.tier.label,
              ports: analysis.record.ports,
              flagged_ports: analysis.flaggedPorts,
              cpes: analysis.record.cpes,
              vulns: analysis.record.vulns,
              hostnames: analysis.record.hostnames,
              tags: analysis.record.tags,
              breakdown: analysis.breakdown,
              remediation: analysis.remediation,
            }
          : { error: analysis.error },
      },
      null,
      2,
    );
  }, [analysis, composed.query, filters]);

  const curlCommands = useMemo(() => {
    const safeIp = targetIp.replace(/[^0-9a-fA-F.:]/g, '') || '1.1.1.1';
    return [
      '# 1. Zero-key InternetDB host lookup (fast passive JSON)',
      `curl -sS "https://internetdb.shodan.io/${safeIp}" | jq .`,
      '',
      '# 2. Extract only open ports & confirmed CVEs',
      `curl -sS "https://internetdb.shodan.io/${safeIp}" | jq '{ip, ports, vulns, tags}'`,
      '',
      '# 3. Batch audit a list of owned asset IPs (1 req/sec polite rate)',
      'while read -r ip; do',
      '  [ -z "$ip" ] && continue',
      '  curl -sS "https://internetdb.shodan.io/${ip}" | jq -c "{ip, ports, vulns}"',
      '  sleep 1',
      'done < ~/owned-assets.txt',
    ].join('\n');
  }, [targetIp]);

  const shodanCliCommands = useMemo(() => {
    const q = (composed.query || 'net:198.51.100.0/24').replace(/'/g, "'\\''");
    const safeIp = targetIp.replace(/[^0-9a-fA-F.:]/g, '') || '1.1.1.1';
    return [
      '# Requires local shodan CLI (`pipx install shodan && shodan init <API_KEY>`)',
      '# 1. Count matching exposures without consuming query credits',
      `shodan count '${q}'`,
      '',
      '# 2. Top exposed ports & products breakdown (facets)',
      `shodan stats --facets port:10,product:10 '${q}'`,
      '',
      '# 3. Export matching asset banners to compressed JSONL',
      `shodan download --limit 100 surface-audit.json.gz '${q}'`,
      '',
      '# 4. Inspect full host record for target IP',
      `shodan host ${safeIp}`,
    ].join('\n');
  }, [composed.query, targetIp]);

  const localDaemonCommands = useMemo(() => {
    const safeIp = targetIp.replace(/[^0-9a-fA-F.:]/g, '') || '1.1.1.1';
    return [
      '# Start local Shodan Attack Surface Sentinel daemon on 127.0.0.1:8130',
      'cd ~/NullAITech/shodan-surface-sentinel && python3 server.py --port 8130',
      '',
      '# Or run directly via ZothOS CLI binary',
      `shodan-sentinel scan ${safeIp}`,
      'shodan-sentinel --status',
      '',
      '# Query local loopback API (zero browser CORS leakage)',
      `curl -sS "${SENTINEL_BASE_URL}/api/scan?ip=${safeIp}" | jq .`,
    ].join('\n');
  }, [targetIp]);

  const activeCliBlock = useMemo(() => {
    switch (cliTab) {
      case 'shodan':
        return { title: 'shodan-cli-audit.sh', badge: 'SHODAN CLI', code: shodanCliCommands };
      case 'daemon':
        return { title: 'shodan-sentinel-local.sh', badge: 'LOCAL DAEMON :8130', code: localDaemonCommands };
      case 'markdown':
        return { title: 'shodan-audit-report.md', badge: 'MARKDOWN REPORT', code: markdownReport };
      default:
        return { title: 'internetdb-curl.sh', badge: 'INTERNETDB CURL', code: curlCommands };
    }
  }, [cliTab, curlCommands, shodanCliCommands, localDaemonCommands, markdownReport]);

  const kpis = [
    {
      label: 'Exposure Score',
      value: analysis.ok ? `${analysis.score}/100` : 'ERR',
      unit: analysis.ok ? analysis.tier.label : 'fix JSON',
      accent: analysis.ok ? analysis.tier.color : SOV.crimson,
    },
    {
      label: 'Flagged Ports',
      value: analysis.ok ? `${analysis.flaggedPorts.length}/${analysis.record.ports.length}` : '0',
      unit: 'risky / open',
      accent: analysis.ok && analysis.flaggedPorts.length > 0 ? SOV.crimson : SOV.emerald,
    },
    {
      label: 'Confirmed CVEs',
      value: analysis.ok ? String(analysis.record.vulns.length) : '0',
      unit: analysis.ok ? `${analysis.record.cpes.length} CPEs` : 'parse error',
      accent: analysis.ok && analysis.record.vulns.length > 0 ? SOV.amber : SOV.emerald,
    },
    {
      label: 'Query Filters',
      value: String(composed.tokens.length),
      unit: daemonState === 'online' ? 'loopback :8130 live' : 'zero-egress client',
      accent: ACCENT_DARK,
    },
  ];

  const statusNode = (
    <SovereignStatusPill
      status={daemonState === 'online' ? 'online' : 'standby'}
      label={
        daemonState === 'online'
          ? 'LOCALHOST :8130 DAEMON REACHABLE'
          : daemonState === 'offline'
            ? 'LOCALHOST :8130 OFFLINE · ZERO-EGRESS CLIENT ENGINE'
            : 'ZERO-EGRESS BROWSER ENGINE · NO REMOTE CALLS'
      }
      sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
    />
  );

  const actions = [
    {
      label: copied === 'query' ? 'Copied Shodan Query' : 'Copy Shodan Query',
      icon: copied === 'query' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />,
      onClick: () => copy(composed.query || '', 'query'),
      primary: true,
    },
    {
      label: 'Download Audit (.md)',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(markdownReport, `shodan-audit-${targetIp}.md`, 'text/markdown;charset=utf-8'),
    },
    {
      label: 'Download Audit (.json)',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadText(jsonAuditPayload, `shodan-audit-${targetIp}.json`, 'application/json;charset=utf-8'),
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
        title="Runtime Scope Disclosure — Zero-Egress Defensive Auditor"
        message={
          daemonState === 'online'
            ? 'Detected local shodan-surface-sentinel daemon on 127.0.0.1:8130. Query composition, InternetDB risk scoring, and report generation run 100% locally in-browser with zero unrequested outbound fetches.'
            : 'All Shodan dork composition, InternetDB JSON parsing, CVE/port risk scoring, and Markdown/JSON report exports execute 100% client-side with zero external network calls. Run the generated curl or shodan CLI commands from your authorized terminal.'
        }
      />

      <SovereignCard
        index="01"
        eyebrow="SHODAN DORK & FILTER COMPOSER"
        title="Defensive Search Query Builder"
        subtitle="Select an audit preset or combine org, CIDR net, ports, products, CVEs, HTTP titles, and TLS CN filters"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {DORK_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <Chip
                key={preset.id}
                label={preset.label}
                clickable
                onClick={() => handleApplyDorkPreset(preset)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(ACCENT_DARK, isDark ? 0.2 : 0.14) : 'transparent',
                  color: active ? accent : textSecondary,
                  border: `1px solid ${active ? rgba(accent, 0.55) : borderSubtle}`,
                }}
              />
            );
          })}
          <Chip
            icon={<RestartAltIcon fontSize="small" />}
            label="Clear"
            clickable
            onClick={() => {
              setActivePresetId('custom');
              setFilters({ org: '', net: '', port: '', product: '', vuln: '', httpTitle: '', sslCn: '', country: '', extra: '' });
            }}
            sx={{
              minHeight: 36,
              fontFamily: MONO,
              fontSize: '0.72rem',
              border: `1px solid ${borderSubtle}`,
              color: textSecondary,
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <TextField
            size="small"
            label="org:"
            placeholder="Example Infrastructure LLC"
            value={filters.org}
            onChange={(e) => handleFilterChange('org', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="net: (IP / CIDR)"
            placeholder="198.51.100.0/24"
            value={filters.net}
            error={!netValid}
            helperText={!netValid ? 'Expected IPv4/IPv6 CIDR (e.g. 198.51.100.0/24)' : ''}
            onChange={(e) => handleFilterChange('net', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="port:"
            placeholder="22,80,443,6379"
            value={filters.port}
            onChange={(e) => handleFilterChange('port', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="product:"
            placeholder="OpenSSH or nginx"
            value={filters.product}
            onChange={(e) => handleFilterChange('product', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="vuln: (CVE)"
            placeholder="CVE-2024-6387"
            value={filters.vuln}
            onChange={(e) => handleFilterChange('vuln', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="http.title:"
            placeholder="Admin or Grafana"
            value={filters.httpTitle}
            onChange={(e) => handleFilterChange('httpTitle', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <TextField
            size="small"
            label="ssl.cert.subject.cn:"
            placeholder="*.example.com or localhost"
            value={filters.sslCn}
            onChange={(e) => handleFilterChange('sslCn', e.target.value)}
            InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
          />
          <FormControl size="small">
            <InputLabel>country:</InputLabel>
            <Select
              label="country:"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              sx={{ fontFamily: MONO, fontSize: '0.8rem' }}
            >
              <MenuItem value="">Any Country</MenuItem>
              <MenuItem value="US">US — United States</MenuItem>
              <MenuItem value="GB">GB — United Kingdom</MenuItem>
              <MenuItem value="DE">DE — Germany</MenuItem>
              <MenuItem value="CA">CA — Canada</MenuItem>
              <MenuItem value="JP">JP — Japan</MenuItem>
              <MenuItem value="SG">SG — Singapore</MenuItem>
              <MenuItem value="NL">NL — Netherlands</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          size="small"
          fullWidth
          label="Additional Raw Filters"
          placeholder="has_screenshot:true -has_ssl:true tag:self-signed"
          value={filters.extra}
          onChange={(e) => handleFilterChange('extra', e.target.value)}
          sx={{ mt: 1.5 }}
          InputProps={{ sx: { fontFamily: MONO, fontSize: '0.8rem' } }}
        />

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: surfaceBg,
            border: `1px solid ${rgba(accent, 0.35)}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: accent, letterSpacing: '0.08em' }}>
              COMPOSED SHODAN QUERY
            </Typography>
            <Button
              size="small"
              onClick={() => copy(composed.query, 'query_box')}
              startIcon={copied === 'query_box' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              sx={{ fontFamily: MONO, fontSize: '0.72rem', textTransform: 'none', color: accent, minHeight: 36 }}
            >
              {copied === 'query_box' ? 'Copied' : 'Copy Query'}
            </Button>
          </Box>
          <Typography
            component="pre"
            sx={{
              m: 0,
              fontFamily: MONO,
              fontSize: '0.8rem',
              color: textPrimary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {composed.query || '# Add at least one filter above to compose a defensive Shodan query'}
          </Typography>
          {composed.tokens.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
              {composed.tokens.map((tok) => (
                <Chip
                  key={`${tok.key}-${tok.value}`}
                  size="small"
                  label={tok.rendered}
                  onDelete={() => handleRemoveToken(tok.key)}
                  sx={{
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    bgcolor: isDark ? rgba(ACCENT_DARK, 0.12) : rgba(ACCENT_LIGHT, 0.08),
                    color: textPrimary,
                    border: `1px solid ${rgba(accent, 0.35)}`,
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="INTERNETDB JSON SNAPSHOT"
        title="Zero-Egress Asset Payload"
        subtitle="Paste output from curl https://internetdb.shodan.io/<ip> or toggle risky ports to simulate exposure impact"
        accent={SOV.cyber}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {INTERNETDB_PRESETS.map((preset) => {
            const active = selectedDbPreset === preset.id;
            const cyberAccent = resolveModeAccent(SOV.cyber, isDark);
            return (
              <Chip
                key={preset.id}
                label={preset.label}
                clickable
                onClick={() => handleLoadDbPreset(preset)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.cyber, isDark ? 0.2 : 0.12) : 'transparent',
                  color: active ? cyberAccent : textSecondary,
                  border: `1px solid ${active ? rgba(cyberAccent, 0.5) : borderSubtle}`,
                }}
              />
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: textSecondary, mb: 0.75 }}>
          TOGGLE HIGH-RISK PORTS IN SNAPSHOT:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
          {QUICK_ADD_PORTS.map((portNum) => {
            const present = analysis.ok && analysis.record.ports.includes(portNum);
            const meta = RISKY_PORTS[portNum];
            const col = severityColor(meta.severity);
            return (
              <Chip
                key={portNum}
                size="small"
                clickable
                label={`${present ? '✓ ' : '+ '}${portNum} ${meta.service}`}
                onClick={() => handleTogglePortInJson(portNum)}
                sx={{
                  minHeight: 32,
                  fontFamily: MONO,
                  fontSize: '0.7rem',
                  fontWeight: present ? 700 : 500,
                  bgcolor: present ? rgba(col, isDark ? 0.22 : 0.12) : 'transparent',
                  color: present ? col : textSecondary,
                  border: `1px solid ${present ? rgba(col, 0.55) : borderSubtle}`,
                }}
              />
            );
          })}
        </Box>

        <TextField
          multiline
          minRows={8}
          maxRows={14}
          fullWidth
          label="InternetDB JSON Record (ip, ports, cpes, vulns, hostnames, tags)"
          value={jsonInput}
          onChange={(e) => {
            setSelectedDbPreset('custom');
            setJsonInput(e.target.value);
          }}
          error={!analysis.ok}
          helperText={!analysis.ok ? analysis.error : `Parsed ${analysis.record.ports.length} ports · ${analysis.record.cpes.length} CPEs · ${analysis.record.vulns.length} CVEs`}
          InputProps={{
            sx: { fontFamily: MONO, fontSize: '0.76rem', lineHeight: 1.55 },
          }}
        />
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <SovereignCard
        index="03"
        eyebrow="DETERMINISTIC RISK MATRIX"
        title="Port, CPE & CVE Exposure Scoring"
        subtitle="Computed 100% locally from open services, high-risk database/admin ports, threat tags, and CVEs"
        accent={analysis.ok ? analysis.tier.color : SOV.crimson}
      >
        {!analysis.ok ? (
          <SovereignAlertBanner severity="error" title="JSON Parse Error" message={analysis.error} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              }}
            >
              <SovereignGauge
                value={analysis.score}
                min={0}
                max={100}
                label="EXPOSURE"
                unit="/100"
                status={analysis.tier.label}
                thresholds={{ warn: 45, danger: 75 }}
                size={140}
              />
              <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: textSecondary }}>
                  TARGET ASSET
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '1.1rem', fontWeight: 700, color: textPrimary }}>
                  {analysis.record.ip}
                </Typography>
                {analysis.record.hostnames.length > 0 && (
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: textSecondary, mt: 0.25 }}>
                    {analysis.record.hostnames.join(' · ')}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 1.25 }}>
                  {analysis.breakdown.map((b) => (
                    <Chip
                      key={b.label}
                      size="small"
                      label={`+${b.points} ${b.label}`}
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.68rem',
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                        border: `1px solid ${borderSubtle}`,
                        color: textPrimary,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Flagged Ports */}
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: textSecondary, mb: 1 }}>
                FLAGGED RISKY PORTS ({analysis.flaggedPorts.length})
              </Typography>
              {analysis.flaggedPorts.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1.5, bgcolor: rgba(SOV.emerald, 0.08), border: `1px solid ${rgba(SOV.emerald, 0.3)}` }}>
                  <CheckCircleOutlineIcon fontSize="small" sx={{ color: resolveModeAccent(SOV.emerald, isDark) }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: textPrimary }}>
                    No high-risk database, Telnet, SMB, or RDP ports exposed on this snapshot.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {analysis.flaggedPorts.map((fp) => {
                    const col = severityColor(fp.severity);
                    return (
                      <Box
                        key={fp.port}
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: surfaceBg,
                          border: `1px solid ${rgba(col, 0.4)}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box sx={{ flex: '1 1 220px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.35 }}>
                            {fp.severity === 'critical' ? (
                              <ErrorOutlineIcon fontSize="small" sx={{ color: col }} />
                            ) : (
                              <WarningAmberIcon fontSize="small" sx={{ color: col }} />
                            )}
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 700, color: textPrimary }}>
                              TCP/{fp.port} · {fp.service}
                            </Typography>
                            <Chip
                              size="small"
                              label={fp.severity.toUpperCase()}
                              sx={{
                                height: 20,
                                fontFamily: MONO,
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                bgcolor: rgba(col, isDark ? 0.2 : 0.12),
                                color: col,
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: textSecondary }}>
                            {fp.note}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: col }}>
                          +{fp.weight} pts
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* CVEs & CPEs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: surfaceBg, border: `1px solid ${borderSubtle}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                  <BugReportIcon fontSize="small" sx={{ color: resolveModeAccent(SOV.crimson, isDark) }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: textPrimary }}>
                    CONFIRMED CVEs ({analysis.record.vulns.length})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {analysis.record.vulns.length === 0 ? (
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: textSecondary }}>None listed</Typography>
                  ) : (
                    analysis.record.vulns.map((cve) => (
                      <Chip
                        key={cve}
                        size="small"
                        label={cve}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: rgba(SOV.crimson, isDark ? 0.18 : 0.1),
                          color: resolveModeAccent(SOV.crimson, isDark),
                          border: `1px solid ${rgba(SOV.crimson, 0.35)}`,
                        }}
                      />
                    ))
                  )}
                </Box>
              </Box>

              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: surfaceBg, border: `1px solid ${borderSubtle}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                  <SecurityIcon fontSize="small" sx={{ color: accent }} />
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: textPrimary }}>
                    DETECTED CPE STACK ({analysis.record.cpes.length})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                  {analysis.record.cpes.length === 0 ? (
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: textSecondary }}>None listed</Typography>
                  ) : (
                    analysis.record.cpes.map((cpe) => (
                      <Typography key={cpe} sx={{ fontFamily: MONO, fontSize: '0.72rem', color: textSecondary, wordBreak: 'break-all' }}>
                        • {cpe}
                      </Typography>
                    ))
                  )}
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Remediation Checklist */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <ShieldIcon fontSize="small" sx={{ color: accent }} />
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: textPrimary }}>
                  REMEDIATION CHECKLIST ({Object.values(checkedRemediation).filter(Boolean).length}/{analysis.remediation.length} VERIFIED)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {analysis.remediation.map((item) => {
                  const col = severityColor(item.severity);
                  const checked = Boolean(checkedRemediation[item.id]);
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
                            onChange={(e) => setCheckedRemediation((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                            sx={{ p: 0.5, mr: 1, mt: 0.1 }}
                          />
                        }
                        label={
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                color: textPrimary,
                                textDecoration: checked ? 'line-through' : 'none',
                              }}
                            >
                              <Box component="span" sx={{ color: col, mr: 0.75 }}>
                                [{item.severity.toUpperCase()}]
                              </Box>
                              {item.title}
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
            </Box>
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="LOCAL CLI & INTERNETDB COMMANDS"
        title="Copyable Audit & Report Generator"
        subtitle="Run passive InternetDB curl lookups, shodan CLI queries, or export the full Markdown audit report"
        accent={ACCENT_DARK}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {[
            { id: 'curl', label: 'InternetDB curl', icon: <TerminalIcon fontSize="small" /> },
            { id: 'shodan', label: 'shodan CLI' },
            { id: 'daemon', label: 'Local :8130 CLI' },
            { id: 'markdown', label: 'Markdown Report' },
          ].map((tab) => {
            const active = cliTab === tab.id;
            return (
              <Chip
                key={tab.id}
                label={tab.label}
                clickable
                onClick={() => setCliTab(tab.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
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
          title={activeCliBlock.title}
          badge={activeCliBlock.badge}
          code={activeCliBlock.code}
          filename={activeCliBlock.title}
          accent={ACCENT_DARK}
          maxHeight={320}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="shodan-surface-sentinel"
      category="SECURITY & ENCLAVE"
      title="Shodan Attack Surface Sentinel"
      subtitle="Zero-egress defensive asset auditor, Shodan dork composer, and InternetDB port/CPE/CVE risk matrix. Engineered by Neal Frazier Tech (@1nc0gn30) · NullAI Platform."
      version="3.5.0"
      accent={ACCENT_DARK}
      metrics={kpis}
      actions={actions}
      status={statusNode}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={5}
      rightCols={7}
      tutorialSteps={[
        {
          title: 'Compose Defensive Shodan Filters',
          description: 'Pick an audit preset or fill org, net CIDR, ports, product, vuln, and TLS CN filters to generate an exact Shodan query.',
        },
        {
          title: 'Paste InternetDB JSON Snapshot',
          description: 'Run the generated curl https://internetdb.shodan.io/<ip> command in your terminal and paste the JSON to score port, CPE, and CVE exposure locally.',
        },
        {
          title: 'Verify Remediation & Export Report',
          description: 'Check off remediation actions as you harden services and export a timestamped Markdown or JSON security audit report.',
        },
      ]}
    />
  );
}
