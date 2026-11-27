import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TerminalIcon from '@mui/icons-material/Terminal';
import ShieldIcon from '@mui/icons-material/Shield';
import BugReportIcon from '@mui/icons-material/BugReport';
import RadarIcon from '@mui/icons-material/Radar';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DnsIcon from '@mui/icons-material/Dns';
import LockIcon from '@mui/icons-material/Lock';
import PolicyIcon from '@mui/icons-material/Policy';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import RouterIcon from '@mui/icons-material/Router';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import {
  parseAndScoreHttpHeaders,
  computeShannonEntropy,
  auditLocalCodeSnippets,
  classifyLoopbackPortProbe,
  buildExecutiveReportMarkdown,
  exportFindingsCsv,
} from '../../utils/hexstrikeEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const MITRE_TACTICS = [
  {
    id: 'TA0043',
    name: 'Reconnaissance',
    techniques: [
      { id: 'T1595', name: 'Active Scanning', sub: 'T1595.002 Port Scanners', severity: 'Medium', desc: 'Probing target interfaces to enumerate reachable services and open TCP listeners.', cmd: 'nmap -sV -sC -- {target}', mitigation: 'Bind internal services strictly to 127.0.0.1 and enforce default-deny firewall rules.' },
      { id: 'T1592', name: 'Gather Victim Host Info', sub: 'T1592.002 Software', severity: 'Low', desc: 'Enumerating server versions and software banners from HTTP headers.', cmd: 'whatweb -a 1 -- https://{target}', mitigation: 'Suppress version tokens in Server and X-Powered-By headers.' },
    ],
  },
  {
    id: 'TA0042',
    name: 'Resource Dev',
    techniques: [
      { id: 'T1588', name: 'Obtain Capabilities', sub: 'T1588.005 Exploits', severity: 'High', desc: 'Correlating exposed service versions against known public CVE advisories.', cmd: 'searchsploit -- {target}', mitigation: 'Track lockfiles and OS packages against vendor security advisories.' },
    ],
  },
  {
    id: 'TA0001',
    name: 'Initial Access',
    techniques: [
      { id: 'T1190', name: 'Exploit Public-Facing App', sub: 'T1190 Web Vulnerability', severity: 'Critical', desc: 'Exploitation of SQL injection, command injection, or SSRF bugs on web endpoints.', cmd: 'sqlmap -u "https://{target}/api?id=1" --batch --banner', mitigation: 'Enforce parameterized queries, strict target allowlists, and SSRF IP blocklists.' },
      { id: 'T1133', name: 'External Remote Services', sub: 'T1133 SSH / VPN', severity: 'High', desc: 'Credential stuffing or key misuse against SSH or VPN gateways.', cmd: 'hydra -L users.txt -P pass.txt ssh://{target}', mitigation: 'Disable password SSH auth; require Ed25519 keys and rate limiting.' },
    ],
  },
  {
    id: 'TA0002',
    name: 'Execution',
    techniques: [
      { id: 'T1059', name: 'Command & Scripting Interpreter', sub: 'T1059.004 Unix Shell', severity: 'Critical', desc: 'OS command injection through unsanitized shell interpolation.', cmd: 'hexstrike-arsenal audit --path . --json', mitigation: 'Use argument-list exec APIs (create_subprocess_exec) and eliminate shell=True.' },
    ],
  },
  {
    id: 'TA0003',
    name: 'Persistence',
    techniques: [
      { id: 'T1543', name: 'Create/Modify System Process', sub: 'T1543.002 Systemd Service', severity: 'Critical', desc: 'Unauthorized systemd user or system units maintaining persistence.', cmd: 'systemctl --user list-unit-files --state=enabled', mitigation: 'Audit systemd units with systemd-analyze verify and NoNewPrivileges=yes.' },
    ],
  },
  {
    id: 'TA0004',
    name: 'Privilege Escalation',
    techniques: [
      { id: 'T1068', name: 'Exploitation for Priv Esc', sub: 'T1068 Kernel / Container', severity: 'Critical', desc: 'Exploiting kernel or container runtime fd leaks to escalate privileges.', cmd: 'uname -a && cat /proc/version', mitigation: 'Patch kernel/runc promptly and run containers rootless with read-only rootfs.' },
    ],
  },
  {
    id: 'TA0005',
    name: 'Defense Evasion',
    techniques: [
      { id: 'T1027', name: 'Obfuscated Files or Info', sub: 'T1027.002 Software Packing', severity: 'Medium', desc: 'Packing or encrypting payloads to evade static signature checks.', cmd: 'hexstrike-arsenal entropy --file payload.bin --json', mitigation: 'Measure Shannon byte entropy (>= 7.2 bits/byte indicates packed/encrypted blocks).' },
    ],
  },
  {
    id: 'TA0006',
    name: 'Credential Access',
    techniques: [
      { id: 'T1552', name: 'Unsecured Credentials', sub: 'T1552.001 Secrets in Files', severity: 'Critical', desc: 'Plaintext API keys, tokens, or private keys committed into repositories.', cmd: 'gitleaks dir .', mitigation: 'Run pre-commit secret scanning and store credentials in Argon2id vaults.' },
    ],
  },
  {
    id: 'TA0007',
    name: 'Discovery',
    techniques: [
      { id: 'T1046', name: 'Network Service Discovery', sub: 'T1046 Local Port Scan', severity: 'Medium', desc: 'Enumerating local host TCP listeners and loopback API daemons.', cmd: 'hexstrike-arsenal scan 127.0.0.1 --json', mitigation: 'Restrict daemon Host/Origin headers to loopback and audit open sockets with ss -tlnp.' },
    ],
  },
  {
    id: 'TA0008',
    name: 'Lateral Movement',
    techniques: [
      { id: 'T1021', name: 'Remote Services', sub: 'T1021.004 SSH Keys', severity: 'Critical', desc: 'Pivoting via forwarded SSH agents or unencrypted private keys.', cmd: 'ssh-add -l', mitigation: 'Disable ForwardAgent and enforce hardware-backed or passphrase-protected keys.' },
    ],
  },
  {
    id: 'TA0009',
    name: 'Collection',
    techniques: [
      { id: 'T1005', name: 'Data from Local System', sub: 'T1005 Path Traversal Read', severity: 'Critical', desc: 'Reading arbitrary host files through unvalidated download paths.', cmd: 'hexstrike-arsenal audit --path . --json', mitigation: 'Validate path IDs with strict regex and assert Path.resolve().is_relative_to(root).' },
    ],
  },
  {
    id: 'TA0011',
    name: 'Command & Control',
    techniques: [
      { id: 'T1071', name: 'Application Layer Protocol', sub: 'T1071.001 Web Protocols', severity: 'High', desc: 'Outbound beaconing over HTTP/HTTPS or DNS channels.', cmd: 'ss -tunp', mitigation: 'Apply outbound egress allowlisting and monitor unexpected WAN connections.' },
    ],
  },
  {
    id: 'TA0010',
    name: 'Exfiltration',
    techniques: [
      { id: 'T1041', name: 'Exfil Over C2 Channel', sub: 'T1041 Encrypted Egress', severity: 'Critical', desc: 'Exfiltrating compressed archives outside the security boundary.', cmd: 'hexstrike-arsenal entropy --file archive.bin', mitigation: 'Inspect outbound destinations and isolate sensitive workloads on loopback.' },
    ],
  },
  {
    id: 'TA0040',
    name: 'Impact',
    techniques: [
      { id: 'T1486', name: 'Data Encrypted for Impact', sub: 'T1486 Ransomware', severity: 'Critical', desc: 'Unauthorized bulk encryption of persistent application volumes.', cmd: 'btrfs subvolume list /', mitigation: 'Maintain immutable offline snapshots and least-privilege filesystem permissions.' },
    ],
  },
];

const CVE_INTEL_DB = [
  {
    id: 'CVE-2024-6387',
    title: 'OpenSSH regreSSHion Signal Handler Race Condition',
    product: 'OpenSSH (9.0p1 - 9.7p1)',
    cvss: 8.1,
    severity: 'High',
    epss: '94.2%',
    vector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H',
    mitre: 'T1190',
    description: 'Signal handler race condition in OpenSSH sshd on glibc Linux systems permitting unauthenticated remote code execution.',
    mitigation: 'Upgrade openssh-server >= 9.8p1 or set LoginGraceTime 0 in sshd_config.',
  },
  {
    id: 'CVE-2024-3094',
    title: 'XZ Utils / liblzma Malicious Backdoor Injection',
    product: 'XZ Utils (5.6.0 & 5.6.1)',
    cvss: 10.0,
    severity: 'Critical',
    epss: '98.7%',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    mitre: 'T1588.005',
    description: 'Supply-chain compromise injecting obfuscated code into liblzma build scripts hooking RSA_public_decrypt in sshd.',
    mitigation: 'Use xz-utils <= 5.4.x or verified clean distribution builds.',
  },
  {
    id: 'CVE-2024-21626',
    title: 'runc Container Leaky File Descriptor Escape',
    product: 'runc (< 1.1.12)',
    cvss: 8.6,
    severity: 'High',
    epss: '86.4%',
    vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:C/C:H/I:H/A:H',
    mitre: 'T1068',
    description: 'Internal fd leak inside runc allowing container processes to escape to the host filesystem.',
    mitigation: 'Update runc >= 1.1.12 and mount host rootfs read-only.',
  },
  {
    id: 'CVE-2023-44487',
    title: 'HTTP/2 Rapid Reset Denial of Service',
    product: 'HTTP/2 Servers & Proxies',
    cvss: 7.5,
    severity: 'High',
    epss: '92.1%',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    mitre: 'T1498',
    description: 'RST_STREAM cancellation flooding exhausting reverse proxy CPU and concurrency pools.',
    mitigation: 'Enforce HTTP/2 stream reset rate limits at edge proxies.',
  },
  {
    id: 'CVE-2023-4863',
    title: 'libwebp Heap Buffer Overflow in Huffman Coding',
    product: 'libwebp (< 1.3.2)',
    cvss: 8.8,
    severity: 'High',
    epss: '95.6%',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H',
    mitre: 'T1204.002',
    description: 'Heap buffer overflow in lossless WebP decoding allowing out-of-bounds writes.',
    mitigation: 'Upgrade libwebp >= 1.3.2 across system libraries and browsers.',
  },
  {
    id: 'CVE-2021-44228',
    title: 'Apache Log4j2 JNDI Remote Code Execution (Log4Shell)',
    product: 'Apache Log4j2 (2.0-beta9 to 2.14.1)',
    cvss: 10.0,
    severity: 'Critical',
    epss: '99.9%',
    vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    mitre: 'T1190',
    description: 'Unauthenticated RCE via attacker-controlled log strings triggering JNDI lookups.',
    mitigation: 'Upgrade Log4j >= 2.17.1 or set log4j2.formatMsgNoLookups=true.',
  },
];

const CURATED_ARSENAL = [
  { id: 'nmap', name: 'Nmap Network Scanner', category: 'Recon', cmd: (t, p) => `nmap -sV -sC -p ${p || '1-1000'} -- ${t}`, desc: 'Network discovery, service version detection, and NSE script auditing.' },
  { id: 'masscan', name: 'Masscan Port Scanner', category: 'Recon', cmd: (t, p) => `masscan -p${p || '1-10000'} ${t} --rate=1000`, desc: 'High-rate asynchronous TCP port scanner for authorized CIDR scopes.' },
  { id: 'amass', name: 'OWASP Amass OSINT', category: 'Recon', cmd: (t) => `amass enum -d ${t}`, desc: 'Attack surface mapping and passive/active subdomain discovery.' },
  { id: 'whatweb', name: 'WhatWeb Fingerprinter', category: 'Recon', cmd: (t) => `whatweb -a 1 -- https://${t}`, desc: 'Web stack identifier detecting CMS platforms, frameworks, and server headers.' },
  { id: 'dnsrecon', name: 'DNSRecon Auditor', category: 'Recon', cmd: (t) => `dnsrecon -d ${t} -t std,spf`, desc: 'DNS zone enumeration, SPF/DMARC checks, and AXFR verification.' },
  { id: 'sqlmap', name: 'SQLMap Injection Auditor', category: 'Web', cmd: (t) => `sqlmap -u "https://${t}/api?id=1" --batch --banner`, desc: 'Automated SQL injection verification against authorized endpoints.' },
  { id: 'nikto', name: 'Nikto Web Server Scanner', category: 'Web', cmd: (t) => `nikto -h https://${t} -ssl`, desc: 'Checks web servers for outdated packages, risky files, and header gaps.' },
  { id: 'gobuster', name: 'Gobuster URI Scanner', category: 'Web', cmd: (t) => `gobuster dir -u https://${t} -w /usr/share/wordlists/dirb/common.txt`, desc: 'Fast directory, DNS, and vhost discovery utility.' },
  { id: 'ffuf', name: 'FFUF Endpoint Fuzzer', category: 'Web', cmd: (t) => `ffuf -u https://${t}/FUZZ -w /usr/share/wordlists/dirb/common.txt`, desc: 'Go-based HTTP endpoint and parameter fuzzer.' },
  { id: 'nuclei', name: 'Nuclei Template Scanner', category: 'Exploit', cmd: (t) => `nuclei -u https://${t} -severity critical,high -silent`, desc: 'YAML-template vulnerability verifier covering CVEs and misconfigurations.' },
  { id: 'searchsploit', name: 'Searchsploit Exploit-DB', category: 'Exploit', cmd: (t) => `searchsploit -- ${t}`, desc: 'Offline local CLI search over the Exploit-DB archive.' },
  { id: 'trivy', name: 'Trivy Container & Repo Scanner', category: 'Audit', cmd: (t) => `trivy image -- ${t}`, desc: 'Vulnerability, misconfiguration, and SBOM scanner for images and repos.' },
  { id: 'lynis', name: 'Lynis Linux Hardening Auditor', category: 'Audit', cmd: () => 'lynis audit system --quick --warnings-only', desc: 'Host-level Linux configuration and kernel hardening auditor.' },
  { id: 'gitleaks', name: 'Gitleaks Secret Scanner', category: 'Audit', cmd: () => 'gitleaks dir .', desc: 'Fast secret and credential detector across git history and working trees.' },
  { id: 'hydra', name: 'THC-Hydra Auth Auditor', category: 'Credentials', cmd: (t) => `hydra -L users.txt -P pass.txt ssh://${t} -t 4`, desc: 'Protocol login strength tester for authorized credential audits.' },
  { id: 'john', name: 'John the Ripper', category: 'Credentials', cmd: () => 'john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt', desc: 'Offline password hash strength auditor.' },
];

const LOCAL_ENCLAVE_TARGETS = [
  { port: 3000, name: 'Zoth Studio Web UI', protocol: 'HTTP' },
  { port: 8094, name: 'Neuro-Memory Daemon', protocol: 'HTTP' },
  { port: 8138, name: 'HexStrike Local Daemon', protocol: 'HTTP' },
  { port: 8787, name: 'Argon2id Vault Daemon', protocol: 'HTTP' },
  { port: 11434, name: 'Ollama Local LLM', protocol: 'HTTP' },
  { port: 22, name: 'SSH Secure Shell', protocol: 'TCP' },
];

const SAMPLE_RAW_HEADERS = [
  'HTTP/1.1 200 OK',
  'Content-Type: text/html; charset=utf-8',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: SAMEORIGIN',
  'Referrer-Policy: strict-origin-when-cross-origin',
  "Content-Security-Policy: default-src 'self'; frame-ancestors 'self'",
].join('\n');

const SAMPLE_CODE_SNIPPET = [
  '# Paste Python, JS, Electron, or GitHub Actions YAML to audit locally',
  'import subprocess',
  'def run_check(host):',
  '    return subprocess.run(["ping", "-c", "1", "--", host], check=False)',
].join('\n');

export function HexStrikeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // WCAG 2.1 AA Dual-Theme Palette (Editorial Ivory Light + Obsidian Crimson Dark)
  const palette = isDark
    ? {
        crimson: '#FB7185',
        crimsonBtn: '#B91C1C',
        crimsonBtnHover: '#991B1B',
        crimsonSoft: 'rgba(185, 28, 28, 0.20)',
        crimsonBorder: 'rgba(251, 113, 133, 0.42)',
        gold: '#E5C158',
        goldSoft: 'rgba(212, 175, 55, 0.14)',
        goldBorder: 'rgba(212, 175, 55, 0.40)',
        emerald: '#34D399',
        emeraldSoft: 'rgba(16, 185, 129, 0.14)',
        emeraldBorder: 'rgba(16, 185, 129, 0.42)',
        cyan: '#7DD3FC',
        cyanSoft: 'rgba(56, 189, 248, 0.14)',
        cyanBorder: 'rgba(56, 189, 248, 0.40)',
        cardBg: '#10121A',
        subtleBg: '#0A0D14',
        codeBg: '#07090F',
        codeInk: '#E2E8F0',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: 'rgba(255, 255, 255, 0.10)',
        heroGrad: 'linear-gradient(135deg, rgba(185, 28, 28, 0.12) 0%, #0E1017 100%)',
      }
    : {
        crimson: '#991B1B',
        crimsonBtn: '#991B1B',
        crimsonBtnHover: '#7F1D1D',
        crimsonSoft: 'rgba(153, 27, 27, 0.09)',
        crimsonBorder: 'rgba(153, 27, 27, 0.34)',
        gold: '#8A6500',
        goldSoft: 'rgba(138, 101, 0, 0.10)',
        goldBorder: 'rgba(138, 101, 0, 0.34)',
        emerald: '#047857',
        emeraldSoft: 'rgba(4, 120, 87, 0.10)',
        emeraldBorder: 'rgba(4, 120, 87, 0.34)',
        cyan: '#0369A1',
        cyanSoft: 'rgba(3, 105, 161, 0.10)',
        cyanBorder: 'rgba(3, 105, 161, 0.34)',
        cardBg: '#FFFFFF',
        subtleBg: '#F3EFE6',
        codeBg: '#F5F0E4',
        codeInk: '#181612',
        textPrimary: '#181612',
        textSecondary: '#475569',
        border: 'rgba(24, 22, 18, 0.13)',
        heroGrad: 'linear-gradient(135deg, #FBF6EE 0%, #FFFFFF 100%)',
      };

  const [activeTab, setActiveTab] = useState(0);
  const [targetScope, setTargetScope] = useState('127.0.0.1');
  const [targetPortInput, setTargetPortInput] = useState('22,3000,8094,8138,8787,11434');
  const [selectedMitreTactic, setSelectedMitreTactic] = useState(MITRE_TACTICS[0]);
  const [cveSearch, setCveSearch] = useState('');
  const [cveSeverityFilter, setCveSeverityFilter] = useState('ALL');
  const [arsenalCategory, setArsenalCategory] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState(null);

  // Daemon connectivity state (checked only when user runs loopback actions; zero external reqs on mount)
  const [daemonMode, setDaemonMode] = useState('BROWSER_OFFLINE_FALLBACK');

  // Defensive engines state
  const [rawHeadersInput, setRawHeadersInput] = useState(SAMPLE_RAW_HEADERS);
  const [headerAuditResults, setHeaderAuditResults] = useState(() =>
    parseAndScoreHttpHeaders(SAMPLE_RAW_HEADERS, { domain: 'offline-sample', mode: 'OFFLINE_RAW_PASTE' })
  );
  const [isAuditingHeaders, setIsAuditingHeaders] = useState(false);

  const [entropyInput, setEntropyInput] = useState('HexStrike v3.2 local defensive entropy baseline — 127.0.0.1:8138');
  const [entropyIsHex, setEntropyIsHex] = useState(false);
  const [entropyError, setEntropyError] = useState(null);
  const [entropyResult, setEntropyResult] = useState(() =>
    computeShannonEntropy('HexStrike v3.2 local defensive entropy baseline — 127.0.0.1:8138')
  );

  const [codeAuditInput, setCodeAuditInput] = useState(SAMPLE_CODE_SNIPPET);
  const [codeAuditResult, setCodeAuditResult] = useState(() => auditLocalCodeSnippets(SAMPLE_CODE_SNIPPET));

  // Loopback port probe state
  const [portProbeResults, setPortProbeResults] = useState([]);
  const [isProbingPorts, setIsProbingPorts] = useState(false);

  // Opt-in public OSINT (DoH & Shodan InternetDB — NEVER called automatically on load!)
  const [dohRecords, setDohRecords] = useState([]);
  const [isResolvingDoh, setIsResolvingDoh] = useState(false);
  const [dohError, setDohError] = useState(null);

  const [shodanInputIp, setShodanInputIp] = useState('1.1.1.1');
  const [shodanData, setShodanData] = useState(null);
  const [isQueryingShodan, setIsQueryingShodan] = useState(false);
  const [shodanError, setShodanError] = useState(null);

  // Interactive Terminal state
  const [cmdInput, setCmdInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    '◈ [HEXSTRIKE-v3.2.0] Local Defensive & Red-Team Workstation initialized.',
    '◈ Zero external network requests made on load. Public DoH & Shodan InternetDB lookups are explicit opt-in only.',
    '◈ Engines ready: HTTP Header Auditor, Shannon Entropy, Local Static Code Audit, Loopback Port Probe, 14 MITRE Tactics.',
    'Type "help" for available commands.',
  ]);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current?.parentElement) {
      terminalEndRef.current.parentElement.scrollTop = terminalEndRef.current.parentElement.scrollHeight;
    }
  }, [terminalHistory]);

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text)?.catch?.(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const runLocalHeaderAudit = async (mode = 'raw') => {
    setIsAuditingHeaders(true);
    if (mode === 'loopback') {
      try {
        const res = await fetch('http://127.0.0.1:8138/api/headers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: 'http://127.0.0.1:8138/' }),
        });
        if (res.ok) {
          const data = await res.json();
          setDaemonMode('LIVE_DAEMON_8138');
          const mapped = {
            domain: data.target,
            mode: 'LIVE_LOOPBACK_8138',
            verified: true,
            status: data.score >= 70 ? 'VERIFIED' : 'NEEDS_HARDENING',
            score: data.score,
            maxScore: 100,
            grade: data.grade,
            observedHeaderCount: data.observed_header_count,
            disclosures: data.disclosures || [],
            findings: (data.findings || []).map((f) => ({
              header: f.header,
              key: f.key,
              present: f.present,
              status: f.status,
              weight: f.weight,
              earned: f.earned,
              observedValue: f.observed_value,
              desc: f.description,
            })),
          };
          setHeaderAuditResults(mapped);
          setTerminalHistory((prev) => [
            ...prev,
            `[HEADER-AUDIT :8138] Observed ${mapped.score}/100 (Grade ${mapped.grade}) on ${mapped.domain}.`,
          ]);
          setIsAuditingHeaders(false);
          return;
        }
      } catch (e) {
        setDaemonMode('BROWSER_OFFLINE_FALLBACK');
      }
      // Honest browser CORS-blocked fallback if daemon is offline
      const unverified = parseAndScoreHttpHeaders('', {
        domain: targetScope,
        corsBlocked: true,
      });
      setHeaderAuditResults(unverified);
      setTerminalHistory((prev) => [
        ...prev,
        `[HEADER-AUDIT] Local :8138 daemon idle; browser CORS prevents reading remote headers -> ${unverified.status}. Paste raw headers to grade offline.`,
      ]);
      setIsAuditingHeaders(false);
      return;
    }

    const parsed = parseAndScoreHttpHeaders(rawHeadersInput, {
      domain: 'offline-raw-paste',
      mode: 'OFFLINE_RAW_PASTE',
    });
    setHeaderAuditResults(parsed);
    setTerminalHistory((prev) => [
      ...prev,
      parsed.verified
        ? `[HEADER-AUDIT OFFLINE] Graded ${parsed.observedHeaderCount} pasted headers -> ${parsed.score}/100 (Grade ${parsed.grade}).`
        : `[HEADER-AUDIT OFFLINE] ${parsed.status} — paste valid HTTP header lines (Key: Value).`,
    ]);
    setIsAuditingHeaders(false);
  };

  const runEntropyAnalysis = (isHexFlag = entropyIsHex) => {
    setEntropyError(null);
    try {
      const res = computeShannonEntropy(entropyInput, { isHex: isHexFlag });
      setEntropyResult(res);
      setTerminalHistory((prev) => [
        ...prev,
        `[ENTROPY] ${res.shannonEntropy} bits/byte (${res.classification}) across ${res.byteCount} bytes.`,
      ]);
    } catch (err) {
      setEntropyError(err.message);
    }
  };

  const runCodeAudit = () => {
    const res = auditLocalCodeSnippets(codeAuditInput);
    setCodeAuditResult(res);
    setTerminalHistory((prev) => [
      ...prev,
      `[CODE-AUDIT] Scanned ${res.lineCount} lines -> Score ${res.score}/100 (${res.findingCount} finding(s)).`,
    ]);
  };

  const probeLocalPorts = async () => {
    setIsProbingPorts(true);
    const ports = LOCAL_ENCLAVE_TARGETS.map((t) => t.port);

    // Prefer authoritative local :8138 TCP socket scan when running
    try {
      const start = performance.now();
      const resp = await fetch(`http://127.0.0.1:8138/api/scan?target=127.0.0.1&ports=${ports.join(',')}`);
      if (resp.ok) {
        const data = await resp.json();
        const elapsed = Math.round(performance.now() - start);
        const openSet = new Set(data.open_ports || []);
        setDaemonMode('LIVE_DAEMON_8138');
        const results = LOCAL_ENCLAVE_TARGETS.map((t) => {
          const classified = classifyLoopbackPortProbe({
            daemonAuthoritative: true,
            daemonOpen: openSet.has(t.port),
            latencyMs: elapsed,
          });
          return { ...t, status: classified.status, note: classified.note, latency: elapsed };
        });
        setPortProbeResults(results);
        setTerminalHistory((prev) => [
          ...prev,
          `[PORT-PROBE :8138] Verified ${data.open_count}/${data.scanned_count} loopback listeners via Python TCP connect_ex.`,
        ]);
        setIsProbingPorts(false);
        return;
      }
    } catch (e) {
      setDaemonMode('BROWSER_OFFLINE_FALLBACK');
    }

    // Honest browser fallback: never reports rejected connections as OPEN
    const results = [];
    for (const target of LOCAL_ENCLAVE_TARGETS) {
      const t0 = performance.now();
      let classified;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 500);
        await fetch(`http://127.0.0.1:${target.port}/`, {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timer);
        classified = classifyLoopbackPortProbe({
          ok: true,
          latencyMs: Math.round(performance.now() - t0),
        });
      } catch (err) {
        classified = classifyLoopbackPortProbe({
          ok: false,
          errorType: err.name,
          latencyMs: Math.round(performance.now() - t0),
        });
      }
      results.push({ ...target, status: classified.status, note: classified.note, latency: classified.latencyMs });
    }
    setPortProbeResults(results);
    setTerminalHistory((prev) => [
      ...prev,
      `[PORT-PROBE FALLBACK] :8138 daemon idle; completed honest browser-mode check (${results.filter((r) => r.status.startsWith('REACHABLE')).length} HTTP-reachable).`,
    ]);
    setIsProbingPorts(false);
  };

  // Explicit Opt-In Public DNS-over-HTTPS Lookup
  const resolveDoH = async (domainToQuery) => {
    const domain = (domainToQuery || targetScope).trim().replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    if (!domain || domain === '127.0.0.1' || domain === 'localhost') {
      setDohError('Enter a public domain (e.g. nullai.tech) to run an opt-in public DoH query.');
      return;
    }
    setIsResolvingDoh(true);
    setDohError(null);
    const results = [];
    for (const type of ['A', 'AAAA', 'MX', 'TXT', 'NS']) {
      try {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
          headers: { Accept: 'application/dns-json' },
        });
        if (res.ok) {
          const data = await res.json();
          (data.Answer || []).forEach((ans) =>
            results.push({ type, name: ans.name, ttl: ans.TTL, data: ans.data })
          );
        }
      } catch (e) {}
    }
    setDohRecords(results);
    if (results.length === 0) {
      setDohError(`No public DoH records returned for "${domain}".`);
    }
    setTerminalHistory((prev) => [
      ...prev,
      `[OPT-IN DoH] Resolved ${results.length} public DNS records for ${domain}.`,
    ]);
    setIsResolvingDoh(false);
  };

  // Explicit Opt-In Public Shodan InternetDB Lookup (unauthenticated public endpoint — zero fake credentials)
  const queryShodan = async (targetInput) => {
    const raw = (targetInput || shodanInputIp).trim();
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(raw)) {
      setShodanError('Enter a valid public IPv4 address (e.g. 1.1.1.1) for public Shodan InternetDB lookup.');
      return;
    }
    setIsQueryingShodan(true);
    setShodanError(null);
    try {
      const res = await fetch(`https://internetdb.shodan.io/${raw}`);
      if (res.ok) {
        const data = await res.json();
        setShodanData(data);
        setTerminalHistory((prev) => [
          ...prev,
          `[OPT-IN INTERNETDB] ${raw}: ${(data.ports || []).length} public port(s), ${(data.vulns || []).length} indexed CVE(s).`,
        ]);
      } else if (res.status === 404) {
        setShodanData({ ip: raw, ports: [], hostnames: [], cpes: [], tags: [], vulns: [] });
      } else {
        setShodanError(`Shodan InternetDB returned HTTP ${res.status}`);
      }
    } catch (err) {
      setShodanError(`Public InternetDB lookup failed: ${err.message}`);
    } finally {
      setIsQueryingShodan(false);
    }
  };

  const executeTerminalCommand = (rawCmd) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;
    setTerminalHistory((prev) => [...prev, `operator@hexstrike:~$ ${trimmed}`]);
    setCmdInput('');
    const [cmd, ...rest] = trimmed.split(/\s+/);
    const arg = rest.join(' ');
    switch (cmd.toLowerCase()) {
      case 'help':
        setTerminalHistory((prev) => [
          ...prev,
          'Commands: headers | headers-loopback | entropy [text] | audit | ports | doh <domain> | report | clear',
        ]);
        break;
      case 'clear':
        setTerminalHistory(['◈ [HEXSTRIKE-v3.2.0] Buffer cleared.']);
        break;
      case 'headers':
        runLocalHeaderAudit('raw');
        break;
      case 'headers-loopback':
        runLocalHeaderAudit('loopback');
        break;
      case 'entropy':
        if (arg) setEntropyInput(arg);
        runEntropyAnalysis(false);
        break;
      case 'audit':
        runCodeAudit();
        break;
      case 'ports':
        probeLocalPorts();
        break;
      case 'doh':
        resolveDoH(arg || targetScope);
        break;
      case 'report':
        setActiveTab(6);
        break;
      default:
        setTerminalHistory((prev) => [...prev, `[INFO] Unknown command "${cmd}". Type "help".`]);
    }
  };

  // Dynamic honest posture score (computed strictly from verified engines)
  const observedPosture = useMemo(() => {
    const scores = [];
    if (headerAuditResults?.verified && typeof headerAuditResults.score === 'number') {
      scores.push(headerAuditResults.score);
    }
    if (codeAuditResult && typeof codeAuditResult.score === 'number') {
      scores.push(codeAuditResult.score);
    }
    if (scores.length === 0) return { label: 'UNVERIFIED', sub: 'RUN AUDIT' };
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { label: `${avg}/100`, sub: avg >= 85 ? 'VERIFIED' : 'REVIEW' };
  }, [headerAuditResults, codeAuditResult]);

  const executiveReportMarkdown = useMemo(
    () =>
      buildExecutiveReportMarkdown({
        targetScope,
        observedHeaders: headerAuditResults,
        observedPorts: portProbeResults,
        entropy: entropyResult,
        codeAudit: codeAuditResult,
        dohRecords,
        shodanData,
      }),
    [targetScope, headerAuditResults, portProbeResults, entropyResult, codeAuditResult, dohRecords, shodanData]
  );

  const downloadBlob = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportCsv = () => {
    const rows = [];
    (headerAuditResults?.findings || []).forEach((f) =>
      rows.push({ category: 'HTTP_HEADER', item: f.header, status: f.status, detail: f.observedValue || 'Not observed' })
    );
    (codeAuditResult?.findings || []).forEach((f) =>
      rows.push({ category: 'CODE_AUDIT', item: `${f.ruleId} L${f.line}`, status: f.severity, detail: f.title })
    );
    (portProbeResults || []).forEach((p) =>
      rows.push({ category: 'LOOPBACK_PORT', item: `127.0.0.1:${p.port}`, status: p.status, detail: p.name })
    );
    downloadBlob(exportFindingsCsv(rows), `hexstrike-audit-${Date.now()}.csv`, 'text/csv;charset=utf-8');
  };

  const filteredCVEs = CVE_INTEL_DB.filter((cve) => {
    const q = cveSearch.toLowerCase();
    const okQ = cve.id.toLowerCase().includes(q) || cve.title.toLowerCase().includes(q) || cve.product.toLowerCase().includes(q);
    const okS = cveSeverityFilter === 'ALL' || cve.severity.toUpperCase() === cveSeverityFilter;
    return okQ && okS;
  });

  const filteredArsenal = CURATED_ARSENAL.filter(
    (tool) => arsenalCategory === 'ALL' || tool.category.toUpperCase() === arsenalCategory.toUpperCase()
  );

  return (
    <Box data-testid="hexstrike-godmode-workstation" sx={{ mt: 1, position: 'relative' }}>
      {/* Single Clean Operator HUD Header */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: 3,
          background: palette.heroGrad,
          border: `1px solid ${palette.crimsonBorder}`,
          boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.45)' : '0 6px 20px rgba(24,22,18,0.06)',
        }}
      >
        <SovereignEyebrow accent={palette.crimson} right="v3.2.0 · 100% Open Access">
          hexstrike-security-arsenal
        </SovereignEyebrow>
        <SovereignBand
          seed="hexstrike-security-arsenal"
          eyebrow="Zoth Studio"
          caption="HexStrike Security Arsenal"
          label="HexStrike Security Arsenal visual band"
        />

        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: palette.crimsonSoft,
                  color: palette.crimson,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ShieldIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography component="h2" variant="h5" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                  HexStrike <span style={{ color: palette.crimson }}>Defensive &amp; Red-Team Cockpit</span>
                </Typography>
                <Typography variant="caption" sx={{ color: palette.textSecondary, fontFamily: mono }}>
                  156-Tool Catalog · 8 MCP Tools · Honest Local Header, Entropy &amp; Static Auditors
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '0.95rem !important', color: `${palette.emerald} !important` }} />}
                label="100% FREE & OPEN ACCESS"
                size="small"
                sx={{ bgcolor: palette.emeraldSoft, color: palette.emerald, fontWeight: 800, fontFamily: mono, border: `1px solid ${palette.emeraldBorder}` }}
              />
              <Chip
                icon={<LockIcon sx={{ fontSize: '0.95rem !important', color: `${palette.cyan} !important` }} />}
                label={daemonMode === 'LIVE_DAEMON_8138' ? 'DAEMON :8138 LIVE' : 'BROWSER_OFFLINE_FALLBACK'}
                size="small"
                sx={{ bgcolor: palette.cyanSoft, color: palette.cyan, fontWeight: 700, fontFamily: mono, border: `1px solid ${palette.cyanBorder}` }}
              />
              <Chip
                icon={<RadarIcon sx={{ fontSize: '0.95rem !important', color: `${palette.gold} !important` }} />}
                label="14 MITRE ATT&CK TACTICS"
                size="small"
                sx={{ bgcolor: palette.goldSoft, color: palette.gold, fontWeight: 700, fontFamily: mono, border: `1px solid ${palette.goldBorder}` }}
              />
              <Button
                size="small"
                variant="outlined"
                component="a"
                href="https://github.com/1nc0gn30/NullAI-HexStrike-AI-Terminal"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  color: palette.gold,
                  borderColor: palette.goldBorder,
                }}
              >
                GITHUB SOURCE
              </Button>
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: palette.subtleBg,
                border: `1px solid ${palette.border}`,
                textAlign: 'center',
              }}
            >
              <Grid container spacing={1}>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 700, display: 'block' }}>
                    OBSERVED
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: palette.emerald, fontFamily: mono }}>
                    {observedPosture.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.textSecondary, fontFamily: mono, fontSize: '0.68rem' }}>
                    {observedPosture.sub}
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 700, display: 'block' }}>
                    CATALOG
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: palette.crimson, fontFamily: mono }}>
                    156
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.textSecondary, fontFamily: mono, fontSize: '0.68rem' }}>
                    8 MCP TOOLS
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: palette.textSecondary, fontWeight: 700, display: 'block' }}>
                    DEFAULT
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: palette.cyan, fontFamily: mono }}>
                    LOCAL
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.textSecondary, fontFamily: mono, fontSize: '0.68rem' }}>
                    127.0.0.1:8138
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Scope Bar */}
      <Paper sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: palette.cardBg, border: `1px solid ${palette.border}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} sm={5}>
            <TextField
              fullWidth
              size="small"
              label="Target Scope / Host"
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LanguageIcon sx={{ color: palette.crimson, fontSize: 19 }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: mono, fontSize: '0.85rem' },
              }}
            />
          </Grid>
          <Grid xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Port List"
              value={targetPortInput}
              onChange={(e) => setTargetPortInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RouterIcon sx={{ color: palette.cyan, fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: mono, fontSize: '0.85rem' },
              }}
            />
          </Grid>
          <Grid xs={12} sm={4}>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                disabled={isAuditingHeaders || isProbingPorts}
                onClick={() => {
                  runLocalHeaderAudit('raw');
                  runEntropyAnalysis(entropyIsHex);
                  runCodeAudit();
                  probeLocalPorts();
                }}
                startIcon={<PlayArrowIcon />}
                sx={{
                  minHeight: 44,
                  bgcolor: palette.crimsonBtn,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  '&:hover': { bgcolor: palette.crimsonBtnHover },
                }}
              >
                RUN LOCAL AUDIT
              </Button>
              <Tooltip title="Probe loopback 127.0.0.1 listeners">
                <IconButton
                  onClick={probeLocalPorts}
                  disabled={isProbingPorts}
                  aria-label="Probe loopback ports"
                  sx={{ minWidth: 44, minHeight: 44, border: `1px solid ${palette.border}`, color: palette.emerald }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${palette.border}`,
          '& .MuiTab-root': {
            minHeight: 48,
            fontFamily: mono,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'none',
            color: palette.textSecondary,
            '&.Mui-selected': { color: palette.crimson },
          },
          '& .MuiTabs-indicator': { bgcolor: palette.crimson },
        }}
      >
        <Tab icon={<ShieldIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Defensive Auditors" />
        <Tab icon={<TerminalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tactical Terminal" />
        <Tab icon={<CodeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Command Arsenal" />
        <Tab icon={<RadarIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Ports & Opt-In OSINT" />
        <Tab icon={<PolicyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="MITRE ATT&CK" />
        <Tab icon={<BugReportIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="CVE Matrix" />
        <Tab icon={<AssessmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Audit Report" />
      </Tabs>

      {/* TAB 0: DEFENSIVE AUDITORS (Headers + Shannon Entropy + Local Static Code Audit) */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {/* HTTP Header Auditor */}
          <Grid xs={12} lg={6}>
            <Paper sx={{ p: 2.25, borderRadius: 2.5, bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                  HTTP Security Header Auditor
                </Typography>
                <Chip
                  size="small"
                  label={
                    headerAuditResults?.verified
                      ? `${headerAuditResults.score}/100 (${headerAuditResults.grade})`
                      : headerAuditResults?.status || 'UNVERIFIED'
                  }
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: headerAuditResults?.verified ? palette.emeraldSoft : palette.goldSoft,
                    color: headerAuditResults?.verified ? palette.emerald : palette.gold,
                    border: `1px solid ${headerAuditResults?.verified ? palette.emeraldBorder : palette.goldBorder}`,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 1.5 }}>
                Paste raw HTTP headers for exact offline scoring, or probe the local <code>127.0.0.1:8138</code> daemon. CORS-blocked requests are reported honestly as <code>UNVERIFIED</code>.
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                value={rawHeadersInput}
                onChange={(e) => setRawHeadersInput(e.target.value)}
                label="Raw HTTP Response Headers"
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                sx={{ mb: 1.5 }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => runLocalHeaderAudit('raw')}
                  sx={{ minHeight: 44, bgcolor: palette.crimsonBtn, color: '#FFFFFF', fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', '&:hover': { bgcolor: palette.crimsonBtnHover } }}
                >
                  Grade Pasted Headers
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => runLocalHeaderAudit('loopback')}
                  sx={{ minHeight: 44, color: palette.cyan, borderColor: palette.cyanBorder, fontFamily: mono, fontWeight: 700, fontSize: '0.74rem' }}
                >
                  Probe :8138 Loopback
                </Button>
              </Stack>

              <TableContainer component={Paper} sx={{ bgcolor: palette.subtleBg, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.textSecondary }}>HEADER</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.textSecondary }}>STATUS</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.textSecondary }}>PTS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(headerAuditResults?.findings || []).map((f) => (
                      <TableRow key={f.key}>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.textPrimary }}>{f.header}</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: f.status === 'PASS' ? palette.emerald : f.status === 'UNVERIFIED' ? palette.gold : palette.crimson }}>
                          {f.status}
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.textSecondary }}>
                          {f.earned}/{f.weight}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Shannon Entropy & Local Code Auditor */}
          <Grid xs={12} lg={6}>
            <Stack spacing={2.5}>
              <Paper sx={{ p: 2.25, borderRadius: 2.5, bgcolor: palette.cardBg, border: `1px solid ${palette.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                    Shannon Byte Entropy Analyzer
                  </Typography>
                  <Chip
                    size="small"
                    label={`${entropyResult.shannonEntropy} bits/byte · ${entropyResult.classification}`}
                    sx={{ fontFamily: mono, fontWeight: 800, bgcolor: palette.cyanSoft, color: palette.cyan, border: `1px solid ${palette.cyanBorder}` }}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={entropyInput}
                  onChange={(e) => setEntropyInput(e.target.value)}
                  label="Text or Hex Payload"
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                  sx={{ mb: 1.25 }}
                />
                {entropyError && (
                  <Alert severity="warning" sx={{ mb: 1.25, fontFamily: mono, fontSize: '0.75rem' }}>
                    {entropyError}
                  </Alert>
                )}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setEntropyIsHex(false);
                      runEntropyAnalysis(false);
                    }}
                    sx={{ minHeight: 44, bgcolor: palette.crimsonBtn, color: '#FFFFFF', fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', '&:hover': { bgcolor: palette.crimsonBtnHover } }}
                  >
                    Compute UTF-8 Entropy
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEntropyIsHex(true);
                      runEntropyAnalysis(true);
                    }}
                    sx={{ minHeight: 44, color: palette.gold, borderColor: palette.goldBorder, fontFamily: mono, fontWeight: 700, fontSize: '0.74rem' }}
                  >
                    Compute Hex Bytes
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ fontFamily: mono, color: palette.textSecondary, display: 'block' }}>
                  Bytes: {entropyResult.byteCount} · Unique: {entropyResult.uniqueBytes}/256 · Printable ASCII: {(entropyResult.printableAsciiRatio * 100).toFixed(1)}%
                </Typography>
              </Paper>

              <Paper sx={{ p: 2.25, borderRadius: 2.5, bgcolor: palette.cardBg, border: `1px solid ${palette.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                    Static Code Hygiene Auditor
                  </Typography>
                  <Chip
                    size="small"
                    label={`Score ${codeAuditResult.score}/100 · ${codeAuditResult.findingCount} Hit(s)`}
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      bgcolor: codeAuditResult.findingCount === 0 ? palette.emeraldSoft : palette.crimsonSoft,
                      color: codeAuditResult.findingCount === 0 ? palette.emerald : palette.crimson,
                      border: `1px solid ${codeAuditResult.findingCount === 0 ? palette.emeraldBorder : palette.crimsonBorder}`,
                    }}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={codeAuditInput}
                  onChange={(e) => setCodeAuditInput(e.target.value)}
                  label="Source Code / Workflow Snippet"
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                  sx={{ mb: 1.25 }}
                />
                <Button
                  variant="outlined"
                  onClick={runCodeAudit}
                  sx={{ minHeight: 44, color: palette.emerald, borderColor: palette.emeraldBorder, fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', mb: 1.25 }}
                >
                  Run Static Audit
                </Button>
                {codeAuditResult.findings.length > 0 ? (
                  <Stack spacing={1}>
                    {codeAuditResult.findings.map((f, idx) => (
                      <Box key={idx} sx={{ p: 1.2, borderRadius: 1.5, bgcolor: palette.subtleBg, border: `1px solid ${palette.crimsonBorder}` }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: palette.crimson }}>
                          [{f.severity}] {f.ruleId} (Line {f.line}): {f.title}
                        </Typography>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.71rem', color: palette.textSecondary }}>
                          Fix: {f.remediation}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ fontFamily: mono, color: palette.emerald, display: 'block' }}>
                    0 unsafe sinks detected across {codeAuditResult.lineCount} line(s).
                  </Typography>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: TACTICAL TERMINAL */}
      {activeTab === 1 && (
        <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: palette.cardBg, border: `1px solid ${palette.crimsonBorder}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: `1px solid ${palette.border}`, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: palette.textSecondary, fontWeight: 700 }}>
              hexstrike-console://operator@{targetScope} ({daemonMode})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setTerminalHistory(['◈ [HEXSTRIKE-v3.2.0] Buffer cleared.'])}
                sx={{ minHeight: 44, color: palette.textSecondary, borderColor: palette.border, fontFamily: mono, fontSize: '0.72rem' }}
              >
                Clear
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleCopy(terminalHistory.join('\n'), 'term')}
                startIcon={copiedKey === 'term' ? <CheckCircleIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
                sx={{ minHeight: 44, color: palette.cyan, borderColor: palette.cyanBorder, fontFamily: mono, fontSize: '0.72rem' }}
              >
                {copiedKey === 'term' ? 'Copied' : 'Copy Log'}
              </Button>
            </Stack>
          </Box>
          <Box
            sx={{
              height: 320,
              overflowY: 'auto',
              p: 1.5,
              borderRadius: 2,
              bgcolor: palette.codeBg,
              border: `1px solid ${palette.border}`,
              fontFamily: mono,
              fontSize: '0.78rem',
              lineHeight: 1.6,
              color: palette.codeInk,
            }}
          >
            {terminalHistory.map((line, idx) => (
              <div key={idx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {line}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeTerminalCommand(cmdInput);
              }}
              placeholder='Type "help", "headers", "entropy sample", "audit", "ports", "report"...'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontFamily: mono, color: palette.crimson, fontWeight: 800, fontSize: '0.8rem' }}>
                      operator@hexstrike:~$
                    </Typography>
                  </InputAdornment>
                ),
                sx: { fontFamily: mono, fontSize: '0.82rem' },
              }}
            />
          </Box>
        </Paper>
      )}

      {/* TAB 2: SECURITY COMMAND ARSENAL */}
      {activeTab === 2 && (
        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {['ALL', 'RECON', 'WEB', 'AUDIT', 'EXPLOIT', 'CREDENTIALS'].map((cat) => (
              <Button
                key={cat}
                size="small"
                variant={arsenalCategory === cat ? 'contained' : 'outlined'}
                onClick={() => setArsenalCategory(cat)}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: arsenalCategory === cat ? palette.crimsonBtn : palette.cardBg,
                  color: arsenalCategory === cat ? '#FFFFFF' : palette.textPrimary,
                  borderColor: palette.border,
                  '&:hover': { bgcolor: arsenalCategory === cat ? palette.crimsonBtnHover : palette.subtleBg },
                }}
              >
                {cat}
              </Button>
            ))}
          </Stack>
          <Grid container spacing={2}>
            {filteredArsenal.map((tool) => {
              const commandStr = tool.cmd(targetScope, targetPortInput);
              return (
                <Grid xs={12} md={6} key={tool.id}>
                  <Card sx={{ bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                            {tool.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: palette.textSecondary }}>
                            {tool.desc}
                          </Typography>
                        </Box>
                        <Chip
                          label={tool.category}
                          size="small"
                          sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, bgcolor: palette.goldSoft, color: palette.gold }}
                        />
                      </Box>
                      <Paper
                        sx={{
                          p: 1.1,
                          bgcolor: palette.codeBg,
                          border: `1px solid ${palette.border}`,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: palette.codeInk, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {commandStr}
                        </Typography>
                        <IconButton
                          aria-label={`Copy ${tool.id} command`}
                          onClick={() => handleCopy(commandStr, tool.id)}
                          sx={{ minWidth: 44, minHeight: 44, color: copiedKey === tool.id ? palette.emerald : palette.textSecondary }}
                        >
                          {copiedKey === tool.id ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* TAB 3: LOOPBACK PORTS & OPT-IN PUBLIC OSINT */}
      {activeTab === 3 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.25, borderRadius: 2.5, bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                  Loopback Enclave Ports (127.0.0.1)
                </Typography>
                <Button
                  variant="outlined"
                  onClick={probeLocalPorts}
                  disabled={isProbingPorts}
                  startIcon={<RefreshIcon />}
                  sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', color: palette.emerald, borderColor: palette.emeraldBorder }}
                >
                  {isProbingPorts ? 'Probing...' : 'Probe 127.0.0.1'}
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 1.5 }}>
                Uses live <code>:8138/api/scan</code> TCP sockets when running locally, or honest browser fallback (refused ports are never reported as OPEN).
              </Typography>
              {portProbeResults.length === 0 ? (
                <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: palette.subtleBg, borderRadius: 2, border: `1px dashed ${palette.border}` }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: palette.textSecondary }}>
                    Click "Probe 127.0.0.1" to audit local loopback listeners.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ bgcolor: palette.subtleBg, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.textSecondary }}>PORT</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.textSecondary }}>SERVICE</TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.textSecondary }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portProbeResults.map((p) => (
                        <TableRow key={p.port}>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: palette.gold }}>:{p.port}</TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.74rem', color: palette.textPrimary }}>{p.name}</TableCell>
                          <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: p.status.includes('OPEN') || p.status.includes('REACHABLE') ? palette.emerald : palette.textSecondary }}>
                            {p.status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          <Grid xs={12} md={6}>
            <Paper sx={{ p: 2.25, borderRadius: 2.5, bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, height: '100%' }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }} flexWrap="wrap">
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                  Opt-In Public OSINT Lookups
                </Typography>
                <Chip
                  size="small"
                  label="OPT-IN PUBLIC LOOKUPS"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: palette.goldSoft, color: palette.gold, border: `1px solid ${palette.goldBorder}` }}
                />
              </Stack>
              <Alert severity="info" sx={{ mb: 2, fontFamily: mono, fontSize: '0.74rem' }}>
                Manual opt-in only: clicking these buttons sends direct browser queries to public DNS-over-HTTPS (<code>dns.google</code>) or unauthenticated Shodan InternetDB (<code>internetdb.shodan.io</code>). Zero requests fire on page load.
              </Alert>

              <Stack spacing={2}>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => resolveDoH(targetScope)}
                    disabled={isResolvingDoh}
                    startIcon={<DnsIcon />}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', color: palette.cyan, borderColor: palette.cyanBorder }}
                  >
                    {isResolvingDoh ? 'Querying DoH...' : `Opt-In DoH Query (${targetScope})`}
                  </Button>
                  {dohError && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: palette.crimson, fontFamily: mono }}>
                      {dohError}
                    </Typography>
                  )}
                  {dohRecords.length > 0 && (
                    <Paper sx={{ mt: 1.5, p: 1.2, bgcolor: palette.codeBg, border: `1px solid ${palette.border}`, maxHeight: 140, overflowY: 'auto' }}>
                      {dohRecords.map((r, i) => (
                        <Typography key={i} sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.codeInk }}>
                          [{r.type}] {r.name} → {r.data} (TTL {r.ttl}s)
                        </Typography>
                      ))}
                    </Paper>
                  )}
                </Box>

                <Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Public IPv4 for Shodan InternetDB"
                      value={shodanInputIp}
                      onChange={(e) => setShodanInputIp(e.target.value)}
                      InputProps={{ sx: { fontFamily: mono, fontSize: '0.8rem' } }}
                    />
                    <Button
                      variant="contained"
                      disabled={isQueryingShodan}
                      onClick={() => queryShodan(shodanInputIp)}
                      startIcon={<SearchIcon />}
                      sx={{ minHeight: 44, bgcolor: palette.crimsonBtn, color: '#FFFFFF', fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', whiteSpace: 'nowrap', '&:hover': { bgcolor: palette.crimsonBtnHover } }}
                    >
                      {isQueryingShodan ? 'Querying...' : 'Query InternetDB'}
                    </Button>
                  </Stack>
                  {shodanError && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: palette.crimson, fontFamily: mono }}>
                      {shodanError}
                    </Typography>
                  )}
                  {shodanData && (
                    <Paper sx={{ mt: 1.5, p: 1.25, bgcolor: palette.subtleBg, border: `1px solid ${palette.border}` }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: palette.textPrimary }}>
                        IP: {shodanData.ip} · Ports: [{(shodanData.ports || []).join(', ') || 'None'}]
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.textSecondary, mt: 0.5 }}>
                        CVEs: {(shodanData.vulns || []).length > 0 ? shodanData.vulns.join(', ') : 'None indexed'}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 4: MITRE ATT&CK MATRIX */}
      {activeTab === 4 && (
        <Grid container spacing={2.5}>
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
              <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: palette.gold }}>
                14 MITRE ATT&amp;CK TACTICS
              </Typography>
              <Stack spacing={0.8}>
                {MITRE_TACTICS.map((tactic) => {
                  const selected = selectedMitreTactic.id === tactic.id;
                  return (
                    <Button
                      key={tactic.id}
                      fullWidth
                      onClick={() => setSelectedMitreTactic(tactic)}
                      sx={{
                        minHeight: 44,
                        justifyContent: 'space-between',
                        px: 1.5,
                        textTransform: 'none',
                        fontFamily: mono,
                        fontSize: '0.76rem',
                        fontWeight: selected ? 800 : 600,
                        bgcolor: selected ? palette.crimsonSoft : palette.subtleBg,
                        color: selected ? palette.crimson : palette.textPrimary,
                        border: `1px solid ${selected ? palette.crimsonBorder : palette.border}`,
                      }}
                    >
                      <span>{tactic.name}</span>
                      <span>{tactic.id}</span>
                    </Button>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12} md={8}>
            <Paper sx={{ p: 2.25, bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
              <Typography component="h3" variant="h6" sx={{ fontWeight: 800, color: palette.textPrimary, mb: 2 }}>
                {selectedMitreTactic.name} <span style={{ color: palette.gold, fontSize: '0.88rem' }}>({selectedMitreTactic.id})</span>
              </Typography>
              <Stack spacing={2}>
                {selectedMitreTactic.techniques.map((tech) => (
                  <Card key={tech.id} sx={{ bgcolor: palette.subtleBg, border: `1px solid ${palette.border}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                            {tech.name} <span style={{ color: palette.cyan, fontFamily: mono }}>({tech.id})</span>
                          </Typography>
                          <Typography variant="caption" sx={{ color: palette.gold, fontFamily: mono }}>
                            {tech.sub}
                          </Typography>
                        </Box>
                        <Chip label={tech.severity} size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: palette.crimsonSoft, color: palette.crimson }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: palette.textSecondary, mb: 1.25 }}>
                        {tech.desc}
                      </Typography>
                      <Paper sx={{ p: 1, bgcolor: palette.codeBg, border: `1px solid ${palette.border}`, borderRadius: 1.5, mb: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', color: palette.codeInk, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tech.cmd.replace('{target}', targetScope)}
                        </Typography>
                        <IconButton aria-label={`Copy ${tech.id} command`} onClick={() => handleCopy(tech.cmd.replace('{target}', targetScope), tech.id)} sx={{ minWidth: 44, minHeight: 44, color: palette.textSecondary }}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                      <Box sx={{ p: 1.1, borderRadius: 1.5, bgcolor: palette.emeraldSoft, border: `1px solid ${palette.emeraldBorder}` }}>
                        <Typography variant="caption" sx={{ color: palette.emerald, fontWeight: 800, fontFamily: mono, display: 'block' }}>
                          DEFENSIVE MITIGATION:
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.textPrimary, fontSize: '0.78rem' }}>
                          {tech.mitigation}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 5: CVE MATRIX */}
      {activeTab === 5 && (
        <Paper sx={{ p: 2.25, bgcolor: palette.cardBg, border: `1px solid ${palette.border}`, borderRadius: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography component="h3" variant="h6" sx={{ fontWeight: 800, color: palette.textPrimary }}>
              Reference CVE &amp; EPSS Threat Matrix
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Search CVE or package..."
                value={cveSearch}
                onChange={(e) => setCveSearch(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem', width: 210 } }}
              />
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <Select value={cveSeverityFilter} onChange={(e) => setCveSeverityFilter(e.target.value)} sx={{ fontFamily: mono, fontSize: '0.78rem' }}>
                  <MenuItem value="ALL">ALL SEV</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                  <MenuItem value="HIGH">HIGH</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
          <Grid container spacing={2}>
            {filteredCVEs.map((cve) => (
              <Grid xs={12} md={6} key={cve.id}>
                <Card sx={{ bgcolor: palette.subtleBg, border: `1px solid ${palette.border}`, borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.crimson, fontFamily: mono }}>
                        {cve.id} · CVSS {cve.cvss}
                      </Typography>
                      <Chip label={`EPSS ${cve.epss}`} size="small" sx={{ fontFamily: mono, fontWeight: 700, bgcolor: palette.cyanSoft, color: palette.cyan }} />
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.textPrimary, mb: 0.5 }}>
                      {cve.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.textSecondary, fontFamily: mono, display: 'block', mb: 1 }}>
                      {cve.product}
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.textSecondary, fontSize: '0.78rem', mb: 1.25 }}>
                      {cve.description}
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: palette.emeraldSoft, border: `1px solid ${palette.emeraldBorder}` }}>
                      <Typography variant="caption" sx={{ color: palette.emerald, fontWeight: 800, fontFamily: mono, display: 'block' }}>
                        REMEDIATION:
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.textPrimary }}>
                        {cve.mitigation}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* TAB 6: HONEST OBSERVED EXECUTIVE REPORT & OPEN EXPORTS */}
      {activeTab === 6 && (
        <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: palette.cardBg, border: `1px solid ${palette.border}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography component="h3" variant="h6" sx={{ fontWeight: 800, color: palette.textPrimary }}>
                Observed Security Audit Report
              </Typography>
              <Typography variant="caption" sx={{ color: palette.textSecondary, fontFamily: mono }}>
                Computed strictly from verified checks · 100% Free &amp; Open Exports (.MD / .JSON / Formula-Safe .CSV)
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                onClick={() => handleCopy(executiveReportMarkdown, 'report_md')}
                startIcon={copiedKey === 'report_md' ? <CheckCircleIcon /> : <ContentCopyIcon />}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', borderColor: palette.goldBorder, color: palette.gold }}
              >
                {copiedKey === 'report_md' ? 'Copied' : 'Copy MD'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleExportCsv}
                startIcon={<DownloadIcon />}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', borderColor: palette.cyanBorder, color: palette.cyan }}
              >
                Export CSV
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  downloadBlob(
                    executiveReportMarkdown,
                    `hexstrike-audit-${targetScope.replace(/[^a-zA-Z0-9.-]/g, '_')}.md`,
                    'text/markdown;charset=utf-8'
                  )
                }
                startIcon={<DownloadIcon />}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', bgcolor: palette.crimsonBtn, color: '#FFFFFF', '&:hover': { bgcolor: palette.crimsonBtnHover } }}
              >
                Export .MD
              </Button>
            </Stack>
          </Box>
          <Paper sx={{ p: 2, bgcolor: palette.codeBg, borderRadius: 2, border: `1px solid ${palette.border}` }}>
            <pre
              style={{
                margin: 0,
                fontFamily: mono,
                fontSize: '0.76rem',
                lineHeight: 1.6,
                color: palette.codeInk,
                whiteSpace: 'pre-wrap',
                maxHeight: 460,
                overflowY: 'auto',
              }}
            >
              {executiveReportMarkdown}
            </pre>
          </Paper>
        </Paper>
      )}
    </Box>
  );
}

export default HexStrikeGodModeTool;
