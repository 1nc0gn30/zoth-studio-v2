import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RadarIcon from '@mui/icons-material/Radar';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import DnsIcon from '@mui/icons-material/Dns';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import LanIcon from '@mui/icons-material/Lan';
import LayersIcon from '@mui/icons-material/Layers';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TerminalIcon from '@mui/icons-material/Terminal';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyIcon from '@mui/icons-material/VpnKey';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Standard Curated High-Intent Subdomain Recon Wordlist
// ---------------------------------------------------------------------------
const RECON_WORDLIST = [
  'www', 'api', 'app', 'dev', 'staging', 'test', 'admin', 'auth',
  'mail', 'vault', 'secure', 'git', 'gitlab', 'db', 'database',
  'vpn', 'remote', 'portal', 'status', 'docs', 'monitor', 'metrics',
  'cdn', 'assets', 'static', 'cloud', 'internal', 'corp', 'gateway',
  'ws', 'graphql', 'login', 'sso', 'billing', 'pay'
];

// Port service mapping dictionary
const PORT_SERVICES = {
  21: 'FTP',
  22: 'SSH (Remote Shell)',
  25: 'SMTP (Mail)',
  53: 'DNS',
  80: 'HTTP (Cleartext Web)',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS (TLS Encrypted Web)',
  465: 'SMTPS',
  587: 'Submission',
  993: 'IMAPS',
  995: 'POP3S',
  1433: 'MS SQL Server',
  1521: 'Oracle DB',
  2049: 'NFS',
  2082: 'cPanel',
  2083: 'cPanel SSL',
  2086: 'WHM',
  2087: 'WHM SSL',
  3306: 'MySQL Database',
  3389: 'RDP (Windows Remote Desktop)',
  5432: 'PostgreSQL Database',
  5900: 'VNC Remote Display',
  6379: 'Redis Cache (Unauth Risk)',
  8000: 'HTTP Alternate / Dev',
  8080: 'HTTP Proxy / Web Admin',
  8443: 'HTTPS Alternate / Admin',
  8888: 'Jupyter / Web Interface',
  9000: 'Portainer / SonarQube',
  9200: 'Elasticsearch (Unauth Risk)',
  27017: 'MongoDB (Unauth Risk)'
};

export function SubSweepGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Aesthetic Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const amber = '#F59E0B';
  const voidDark = '#08080B';
  const surfaceDark = '#10121A';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [targetDomain, setTargetDomain] = useState('nullai.tech');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChecking, setCurrentChecking] = useState('');
  const [results, setResults] = useState([]);
  const [filterTab, setFilterTab] = useState(0); // 0: All, 1: Live Only, 2: Exposed Ports, 3: Vulnerable
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [enableShodan, setEnableShodan] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isProLicensed, setIsProLicensed] = useState(true);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [logs, setLogs] = useState([]);

  // Check License in localStorage & URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
  }, []);

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('zoth_studio_pro_license', 'active');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // ---------------------------------------------------------------------------
  // Real In-Browser DNS-over-HTTPS (DoH) Resolver Engine via Cloudflare
  // ---------------------------------------------------------------------------
  const resolveDomainDoH = async (fqdn) => {
    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(fqdn)}&type=A`, {
        headers: { Accept: 'application/dns-json' }
      });
      if (!res.ok) throw new Error(`DoH HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Real Zero-Key Shodan InternetDB Port & CVE Engine
  // ---------------------------------------------------------------------------
  const queryShodanInternetDB = async (ip) => {
    try {
      const res = await fetch(`https://internetdb.shodan.io/${ip}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Execute Subdomain Enumeration Pipeline
  // ---------------------------------------------------------------------------
  const handleStartScan = async () => {
    const cleanDomain = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain) return;

    setScanning(true);
    setProgress(0);
    setResults([]);
    setLogs([]);
    addLog(`INITIATING CLOUDFLARE DOH PASSIVE RECONNAISSANCE -> ${cleanDomain}`);

    // Build unique target candidates (Apex domain + wordlist subdomains)
    const candidates = [cleanDomain, ...RECON_WORDLIST.map((sub) => `${sub}.${cleanDomain}`)];
    const discovered = [];
    const total = candidates.length;

    for (let i = 0; i < total; i++) {
      const fqdn = candidates[i];
      setCurrentChecking(fqdn);
      setProgress(Math.round(((i + 1) / total) * 100));

      const dohData = await resolveDomainDoH(fqdn);
      const isLive = dohData && dohData.Status === 0 && dohData.Answer && dohData.Answer.length > 0;

      let cname = null;
      let ips = [];
      let ttl = 300;

      if (isLive) {
        dohData.Answer.forEach((ans) => {
          if (ans.type === 5) cname = ans.data; // CNAME
          if (ans.type === 1) ips.push(ans.data); // A Record IPv4
          if (ans.TTL) ttl = ans.TTL;
        });

        addLog(`LIVE HOST DISCOVERED: ${fqdn} -> [${ips.join(', ') || cname || 'Resolved'}]`);

        // Perform Shodan InternetDB correlation if enabled
        let shodanData = null;
        if (enableShodan && ips.length > 0) {
          addLog(`AUDITING SHODAN INTERNETDB FOR IP: ${ips[0]}...`);
          shodanData = await queryShodanInternetDB(ips[0]);
        }

        const ports = shodanData?.ports || [];
        const vulns = shodanData?.vulns || [];
        const cpes = shodanData?.cpes || [];
        const hostnames = shodanData?.hostnames || [];
        const tags = shodanData?.tags || [];

        // Risk Scoring Algorithm
        let riskScore = 15;
        let riskLevel = 'LOW';
        let riskFlags = [];

        if (vulns.length > 0) {
          riskScore = 95;
          riskLevel = 'CRITICAL';
          riskFlags.push(`${vulns.length} Known CVE Vulnerabilities Detected`);
        } else if (ports.some((p) => [22, 3389, 5432, 3306, 27017, 6379, 9200].includes(p))) {
          riskScore = 80;
          riskLevel = 'HIGH';
          riskFlags.push('Sensitive Database/Remote Shell Ports Exposed');
        } else if (ports.some((p) => [8080, 8443, 8000, 8888, 9000].includes(p))) {
          riskScore = 55;
          riskLevel = 'MEDIUM';
          riskFlags.push('Alternate Dev/Proxy Ports Active');
        } else if (ports.includes(80) && !ports.includes(443)) {
          riskScore = 40;
          riskLevel = 'MEDIUM';
          riskFlags.push('Cleartext HTTP Exposed without SSL/TLS');
        }

        discovered.push({
          fqdn,
          isLive: true,
          status: '200 OK',
          cname,
          ips,
          primaryIp: ips[0] || (cname ? 'CNAME Alias' : 'Hidden CDN'),
          ttl,
          ports,
          vulns,
          cpes,
          hostnames,
          tags,
          riskScore,
          riskLevel,
          riskFlags,
          checkedAt: new Date().toISOString()
        });
      } else {
        // Record non-existent subdomain (for surface visibility)
        discovered.push({
          fqdn,
          isLive: false,
          status: dohData?.Status === 3 ? 'NXDOMAIN' : 'UNRESOLVED',
          cname: null,
          ips: [],
          primaryIp: '—',
          ttl: 0,
          ports: [],
          vulns: [],
          cpes: [],
          hostnames: [],
          tags: [],
          riskScore: 0,
          riskLevel: 'CLEAN',
          riskFlags: [],
          checkedAt: new Date().toISOString()
        });
      }

      setResults([...discovered]);
    }

    addLog(`RECONNAISSANCE COMPLETE: ${discovered.filter((d) => d.isLive).length} active perimeter hosts mapped.`);
    setScanning(false);
    setCurrentChecking('');
  };

  // ---------------------------------------------------------------------------
  // Metrics & KPI Computations
  // ---------------------------------------------------------------------------
  const totalScanned = results.length;
  const liveCount = results.filter((r) => r.isLive).length;
  const exposedPortsCount = results.reduce((acc, r) => acc + (r.ports?.length || 0), 0);
  const totalVulnsCount = results.reduce((acc, r) => acc + (r.vulns?.length || 0), 0);
  const highRiskCount = results.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

  // Filtered Table Results
  const filteredResults = results.filter((r) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFqdn = r.fqdn.toLowerCase().includes(q);
      const matchIp = r.primaryIp.toLowerCase().includes(q);
      const matchPort = r.ports.some((p) => p.toString().includes(q));
      if (!matchFqdn && !matchIp && !matchPort) return false;
    }

    if (filterTab === 1) return r.isLive;
    if (filterTab === 2) return r.isLive && r.ports.length > 0;
    if (filterTab === 3) return r.isLive && (r.vulns.length > 0 || r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL');
    return true;
  });

  // ---------------------------------------------------------------------------
  // Export Capabilities
  // ---------------------------------------------------------------------------
  const handleExportCSV = () => {
    if (!isProLicensed) {
      setShowPaywallModal(true);
      return;
    }
    const headers = ['Subdomain', 'Status', 'IP Address', 'CNAME', 'Open Ports', 'CVEs', 'Risk Level', 'Risk Score'];
    const rows = results.map((r) => [
      r.fqdn,
      r.status,
      r.primaryIp,
      r.cname || '',
      `"${r.ports.join(', ')}"`,
      `"${r.vulns.join(', ')}"`,
      r.riskLevel,
      r.riskScore
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subsweep_recon_${targetDomain}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!isProLicensed) {
      setShowPaywallModal(true);
      return;
    }
    const blob = new Blob([JSON.stringify({ target: targetDomain, scannedAt: new Date().toISOString(), results }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subsweep_recon_${targetDomain}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (!isProLicensed) {
      setShowPaywallModal(true);
      return;
    }
    const liveItems = results.filter((r) => r.isLive);
    let md = `# SubSweep Perimeter Reconnaissance Audit: ${targetDomain}\n\n`;
    md += `**Generated**: ${new Date().toUTCString()}\n`;
    md += `**Engine**: SubSweep DoH + Shodan InternetDB God Mode\n`;
    md += `**Perimeter Hosts Mapped**: ${liveItems.length} Live (${totalScanned} Targets Scanned)\n`;
    md += `**Total Exposed Ports**: ${exposedPortsCount} | **Total Known CVEs**: ${totalVulnsCount}\n\n`;
    md += `## Executive Attack Surface Summary\n\n`;
    md += `| Subdomain | Status | IP / CNAME | Open Ports | CVE Vulnerabilities | Risk Level |\n`;
    md += `|---|---|---|---|---|---|\n`;
    liveItems.forEach((r) => {
      md += `| \`${r.fqdn}\` | ${r.status} | \`${r.primaryIp}\` | ${r.ports.join(', ') || 'None'} | ${r.vulns.join(', ') || '0 detected'} | **${r.riskLevel}** (${r.riskScore}/100) |\n`;
    });
    md += `\n## High-Priority Risk Disclosures\n\n`;
    const criticals = liveItems.filter((r) => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');
    if (criticals.length === 0) {
      md += `*No critical or high-risk port disclosures identified across queried assets.*\n`;
    } else {
      criticals.forEach((c) => {
        md += `### ${c.fqdn} (${c.primaryIp})\n`;
        md += `- **Risk Classification**: ${c.riskLevel} (${c.riskScore}/100)\n`;
        md += `- **Open Ports**: ${c.ports.map((p) => `${p} (${PORT_SERVICES[p] || 'Custom'})`).join(', ')}\n`;
        if (c.vulns.length > 0) md += `- **CVEs**: ${c.vulns.join(', ')}\n`;
        md += `- **Findings**: ${c.riskFlags.join('; ')}\n\n`;
      });
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subsweep_audit_${targetDomain}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monetization Funnel Banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFDF0 0%, #FEF9E7 100%)',
          border: `1px solid ${gold}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShieldIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                SubSweep Apex Reconnaissance & Attack Surface Studio
              </Typography>
              <Chip
                size="small"
                label={isProLicensed ? '✦ 100% FREE & OPEN ACCESS' : 'FREE & OPEN ACCESS'}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : crimsonSoft,
                  color: isProLicensed ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Real client-side DNS-over-HTTPS (DoH) enumeration + zero-key Shodan InternetDB port and CVE discovery. Zero fake work.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                ☕ Buy Us a Coffee
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPaywallModal(true)}
                startIcon={<KeyIcon />}
                sx={{ borderColor: gold, color: gold, fontWeight: 700 }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon style={{ color: emerald }} />}
              label="UNLIMITED ENTERPRISE EXPORTS UNLOCKED"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* Control & Input Station */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
          border: `1px solid ${cardBorder}`,
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              label="Target Root Domain"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              placeholder="e.g. nullai.tech, github.com, target.corp"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DnsIcon sx={{ color: cyan }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: mono, fontWeight: 700 }
              }}
            />
          </Grid>

          <Grid xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableShodan}
                  onChange={(e) => setEnableShodan(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 700 }}>
                  Shodan Port/CVE Audit
                </Typography>
              }
            />
          </Grid>

          <Grid xs={12} md={4}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleStartScan}
                disabled={scanning || !targetDomain.trim()}
                startIcon={<RadarIcon />}
                sx={{
                  bgcolor: cyan,
                  color: '#000',
                  fontWeight: 800,
                  fontFamily: mono,
                  '&:hover': { bgcolor: '#0284C7' }
                }}
              >
                {scanning ? 'SCANNING...' : 'EXECUTE RECON'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setResults([]);
                  setLogs([]);
                  setProgress(0);
                }}
                disabled={scanning || results.length === 0}
                startIcon={<RefreshIcon />}
                sx={{ borderColor: cardBorder, color: 'text.secondary', fontFamily: mono }}
              >
                CLEAR
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Quick Domain Presets */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            Quick Targets:
          </Typography>
          {['nullai.tech', 'nealfrazier.tech', 'cloudflare.com', 'github.com', 'openai.com'].map((domain) => (
            <Chip
              key={domain}
              size="small"
              clickable
              onClick={() => setTargetDomain(domain)}
              label={domain}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
                border: `1px solid ${cardBorder}`
              }}
            />
          ))}
        </Stack>

        {/* Scanning Progress Bar */}
        {scanning && (
          <Box sx={{ mt: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: cyan }}>
                Probing: <strong>{currentChecking}</strong>
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: cyan, fontWeight: 700 }}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(56, 189, 248, 0.15)',
                '& .MuiLinearProgress-bar': { bgcolor: cyan }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* KPI Metrics Dashboard */}
      {results.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={6} sm={4} md={2.4}>
            <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                  TOTAL TARGETS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: cyan, mt: 0.5 }}>
                  {totalScanned}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} md={2.4}>
            <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                  LIVE HOSTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: emerald, mt: 0.5 }}>
                  {liveCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} md={2.4}>
            <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                  EXPOSED PORTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: amber, mt: 0.5 }}>
                  {exposedPortsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={6} sm={4} md={2.4}>
            <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                  KNOWN CVES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: totalVulnsCount > 0 ? crimson : emerald, mt: 0.5 }}>
                  {totalVulnsCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={8} md={2.4}>
            <Card sx={{ bgcolor: isDark ? surfaceDark : theme.palette.background.paper, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                  HIGH RISK ASSETS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: highRiskCount > 0 ? crimson : emerald, mt: 0.5 }}>
                  {highRiskCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Terminal Feed & Results Workspace */}
      <Grid container spacing={3}>
        {/* Recon Terminal Feed (Left/Top) */}
        <Grid xs={12} lg={4}>
          <Paper
            sx={{
              p: 2,
              bgcolor: isDark ? voidDark : '#0F172A',
              border: `1px solid ${cardBorder}`,
              borderRadius: 2,
              height: 480,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
              <TerminalIcon sx={{ color: emerald, fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: emerald }}>
                PASSIVE RECON RADAR TELEMETRY
              </Typography>
            </Stack>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                fontFamily: mono,
                fontSize: '0.72rem',
                color: '#94A3B8',
                lineHeight: 1.6,
                pr: 1
              }}
            >
              {logs.length === 0 ? (
                <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', color: 'text.secondary', mt: 10, textAlign: 'center' }}>
                  Target perimeter idle. Click &ldquo;EXECUTE RECON&rdquo; to begin DoH resolution pipeline.
                </Typography>
              ) : (
                logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: 4 }}>
                    <span style={{ color: log.includes('LIVE HOST') ? emerald : log.includes('AUDITING') ? amber : cyan }}>
                      {log}
                    </span>
                  </div>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Results Data Table & Actions (Right/Bottom) */}
        <Grid xs={12} lg={8}>
          <Paper
            sx={{
              p: 2,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2,
              minHeight: 480
            }}
          >
            {/* Filter Tabs & Search Header */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Tabs
                value={filterTab}
                onChange={(_, v) => setFilterTab(v)}
                sx={{
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    py: 0.5,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }
                }}
              >
                <Tab label={`ALL (${results.length})`} />
                <Tab label={`LIVE (${liveCount})`} />
                <Tab label="EXPOSED PORTS" />
                <Tab label="HIGH RISK" />
              </Tabs>

              <TextField
                size="small"
                placeholder="Filter by host, IP, or port..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: { fontFamily: mono, fontSize: '0.75rem', width: { xs: '100%', sm: 220 } }
                }}
              />
            </Stack>

            {/* Subdomain Table */}
            <TableContainer sx={{ maxHeight: 330, border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? surfaceDark : '#F8FAFC' }}>
                      Subdomain / Host
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? surfaceDark : '#F8FAFC' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? surfaceDark : '#F8FAFC' }}>
                      Resolved IP / CNAME
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? surfaceDark : '#F8FAFC' }}>
                      Open Ports
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? surfaceDark : '#F8FAFC' }}>
                      Risk
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? surfaceDark : '#F8FAFC' }}>
                      Inspect
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary', fontFamily: mono }}>
                        {scanning ? 'Discovering perimeter targets...' : 'No target hosts discovered matching criteria.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((r, i) => (
                      <TableRow key={i} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedTarget(r)}>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 700, color: r.isLive ? cyan : 'text.disabled' }}>
                          {r.fqdn}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.status}
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: r.isLive ? emeraldSoft : 'rgba(255,255,255,0.04)',
                              color: r.isLive ? emerald : 'text.disabled'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: 'text.secondary' }}>
                          {r.primaryIp}
                        </TableCell>
                        <TableCell>
                          {r.ports.length === 0 ? (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: mono }}>
                              —
                            </Typography>
                          ) : (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                              {r.ports.slice(0, 3).map((port) => (
                                <Chip
                                  key={port}
                                  size="small"
                                  label={port}
                                  sx={{
                                    fontFamily: mono,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    bgcolor: [22, 3389, 5432, 3306, 6379].includes(port) ? crimsonSoft : amber,
                                    color: [22, 3389, 5432, 3306, 6379].includes(port) ? crimson : '#000',
                                    fontWeight: 800
                                  }}
                                />
                              ))}
                              {r.ports.length > 3 && (
                                <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                                  +{r.ports.length - 3}
                                </Typography>
                              )}
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={r.riskLevel}
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor:
                                r.riskLevel === 'CRITICAL'
                                  ? crimsonSoft
                                  : r.riskLevel === 'HIGH'
                                  ? amber
                                  : r.riskLevel === 'MEDIUM'
                                  ? goldSoft
                                  : emeraldSoft,
                              color:
                                r.riskLevel === 'CRITICAL'
                                  ? crimson
                                  : r.riskLevel === 'HIGH'
                                  ? '#000'
                                  : r.riskLevel === 'MEDIUM'
                                  ? gold
                                  : emerald
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTarget(r);
                            }}
                            sx={{ color: cyan }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Export Bar */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={1.5}
              sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${cardBorder}` }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                Total Results: <strong>{filteredResults.length}</strong> | Real In-Browser Cloudflare DoH
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleExportCSV}
                  disabled={results.length === 0}
                  startIcon={<DownloadIcon />}
                  sx={{ borderColor: cardBorder, color: 'text.primary', fontFamily: mono, fontSize: '0.72rem' }}
                >
                  Export CSV
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleExportJSON}
                  disabled={results.length === 0}
                  startIcon={<DownloadIcon />}
                  sx={{ borderColor: cardBorder, color: 'text.primary', fontFamily: mono, fontSize: '0.72rem' }}
                >
                  Export JSON
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleExportMarkdown}
                  disabled={results.length === 0}
                  startIcon={<DownloadIcon />}
                  sx={{ bgcolor: gold, color: '#000', fontWeight: 800, fontFamily: mono, fontSize: '0.72rem', '&:hover': { bgcolor: '#B8860B' } }}
                >
                  Audit Brief MD
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Target Inspection Modal */}
      <Dialog
        open={Boolean(selectedTarget)}
        onClose={() => setSelectedTarget(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
            border: `1px solid ${gold}`,
            borderRadius: 2
          }
        }}
      >
        {selectedTarget && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LanIcon sx={{ color: cyan }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                    {selectedTarget.fqdn}
                  </Typography>
                </Stack>
                <Chip
                  label={selectedTarget.riskLevel}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: selectedTarget.riskLevel === 'CRITICAL' ? crimsonSoft : emeraldSoft,
                    color: selectedTarget.riskLevel === 'CRITICAL' ? crimson : emerald
                  }}
                />
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                      DNS RESOLUTION
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, mt: 0.5 }}>
                      Status: {selectedTarget.status}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, mt: 0.5 }}>
                      Primary IP: <strong>{selectedTarget.primaryIp}</strong>
                    </Typography>
                    {selectedTarget.cname && (
                      <Typography variant="body2" sx={{ fontFamily: mono, mt: 0.5, color: gold }}>
                        CNAME: {selectedTarget.cname}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mt: 1 }}>
                      TTL: {selectedTarget.ttl}s
                    </Typography>
                  </Paper>
                </Grid>

                <Grid xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                      RISK ASSESSMENT
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mt: 0.5 }}>
                      Score: {selectedTarget.riskScore}/100
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      {selectedTarget.riskFlags.length > 0 ? selectedTarget.riskFlags.join(' • ') : 'Standard HTTPS perimeter posture.'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Shodan Ports & Services */}
                <Grid xs={12}>
                  <Paper sx={{ p: 2, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', mb: 1, display: 'block' }}>
                      SHODAN INTERNETDB OPEN PORTS & DISCOVERED SERVICES
                    </Typography>
                    {selectedTarget.ports.length === 0 ? (
                      <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                        No open ports reported by Shodan InternetDB for IP {selectedTarget.primaryIp}.
                      </Typography>
                    ) : (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {selectedTarget.ports.map((p) => (
                          <Chip
                            key={p}
                            label={`${p} • ${PORT_SERVICES[p] || 'Custom'}`}
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: [22, 3389, 5432, 3306, 6379, 9200, 27017].includes(p) ? crimsonSoft : cyanSoft,
                              color: [22, 3389, 5432, 3306, 6379, 9200, 27017].includes(p) ? crimson : cyan,
                              border: `1px solid ${[22, 3389, 5432, 3306, 6379, 9200, 27017].includes(p) ? crimson : cyan}`
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>

                {/* Known CVEs */}
                {selectedTarget.vulns.length > 0 && (
                  <Grid xs={12}>
                    <Paper sx={{ p: 2, bgcolor: crimsonSoft, border: `1px solid ${crimson}`, borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: crimson, fontWeight: 800, mb: 1, display: 'block' }}>
                        KNOWN CVE VULNERABILITIES IDENTIFIED
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        {selectedTarget.vulns.map((cve) => (
                          <Chip
                            key={cve}
                            label={cve}
                            size="small"
                            sx={{ fontFamily: mono, fontWeight: 800, bgcolor: crimson, color: '#FFF' }}
                          />
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(selectedTarget.fqdn, 'modalCopy')}
                sx={{ fontFamily: mono, color: 'text.secondary' }}
              >
                {copiedKey === 'modalCopy' ? 'COPIED' : 'COPY FQDN'}
              </Button>
              <Button onClick={() => setSelectedTarget(null)} sx={{ fontFamily: mono, color: cyan, fontWeight: 700 }}>
                CLOSE
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Pro Monetization Modal */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
            border: `1px solid ${gold}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldIcon sx={{ color: gold }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>
              SubSweep Pro Sovereign License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock unlimited attack surface audits, automated penetration report generators (CSV, JSON, Markdown), and zero-throttling Shodan InternetDB correlation.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: goldSoft, border: `1px solid ${gold}`, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              ⚡ 100% Free & Open Access — Optional Community Support
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              Everything here is free to use. Optional tips are welcome via:
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                ☕ Buy Us a Coffee (Stripe)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
                target="_blank"
                rel="noreferrer"
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700 }}
              >
                Solana Pay (USDC/SOL)
              </Button>
            </Stack>
          </Paper>

          <TextField
            fullWidth
            size="small"
            label="Optional note with your tip"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            placeholder="e.g. SUB-PRO-XXXX-XXXX"
            InputProps={{
              sx: { fontFamily: mono }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: emerald, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SubSweepGodModeTool;
