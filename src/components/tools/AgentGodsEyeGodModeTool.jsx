import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, LinearProgress, Switch, FormControlLabel, Alert, InputAdornment, Tabs, Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RadarIcon from '@mui/icons-material/Radar';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import PublicIcon from '@mui/icons-material/Public';
import ShieldIcon from '@mui/icons-material/Shield';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import BugReportIcon from '@mui/icons-material/BugReport';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DAEMON_BASE = 'http://127.0.0.1:8112';

// Strictly RFC 5737 documentation IPs ONLY — shown ONLY when user explicitly opts into Offline Preview
const RFC5737_PREVIEW_TARGETS = [
  {
    ip: '198.51.100.42',
    country_name: 'United States',
    country: 'US',
    city: 'Ashburn',
    org: 'Perimeter Vision Lab (RFC 5737 Preview)',
    category: 'SURVEILLANCE_CAMERA',
    product: 'RTSP Stream Server 2.4.1',
    ports: [554, 80, 8000],
    threat_level: 'CRITICAL',
    threat_score: 85,
    vulns: ['CVE-2021-36260'],
    tags: ['camera', 'rtsp', 'rfc5737-preview'],
    banner_snippet: 'RTSP/1.0 200 OK — H.264 IPCam Streamer',
    is_simulated: true,
  },
  {
    ip: '203.0.113.19',
    country_name: 'Germany',
    country: 'DE',
    city: 'Nuremberg',
    org: 'GridSim Substation Lab (RFC 5737 Preview)',
    category: 'SCADA_INDUSTRIAL',
    product: 'Modbus TCP Gateway 1.2',
    ports: [502, 102],
    threat_level: 'CRITICAL',
    threat_score: 75,
    vulns: ['CVE-2022-45788'],
    tags: ['scada', 'modbus', 'rfc5737-preview'],
    banner_snippet: 'Modbus Unit ID: 1, Function Code: 0x03 (Read Holding Registers)',
    is_simulated: true,
  },
  {
    ip: '192.0.2.78',
    country_name: 'Japan',
    country: 'JP',
    city: 'Tokyo',
    org: 'Kanto Document Store Lab (RFC 5737 Preview)',
    category: 'DATABASE_CLUSTER',
    product: 'MongoDB Server 6.0.4',
    ports: [27017],
    threat_level: 'CRITICAL',
    threat_score: 85,
    vulns: ['CVE-2019-2386'],
    tags: ['database', 'mongodb', 'rfc5737-preview'],
    banner_snippet: 'MongoDB Server Information: version 6.0.4 authMechanism: NONE',
    is_simulated: true,
  },
  {
    ip: '198.51.100.144',
    country_name: 'India',
    country: 'IN',
    city: 'Mumbai',
    org: 'Mumbai Inference Testbed (RFC 5737 Preview)',
    category: 'FRONTIER_AI',
    product: 'Ollama LLM Inference API 0.1.34',
    ports: [11434, 8000],
    threat_level: 'HIGH',
    threat_score: 60,
    vulns: ['CVE-2024-37032'],
    tags: ['ai', 'llm', 'rfc5737-preview'],
    banner_snippet: 'HTTP/1.1 200 OK — Ollama is running',
    is_simulated: true,
  },
];

function normalizeTarget(raw) {
  const ports = Array.isArray(raw.ports) && raw.ports.length
    ? raw.ports
    : (raw.port ? [raw.port] : []);
  const vulns = Array.isArray(raw.vulns)
    ? raw.vulns
    : (Array.isArray(raw.cves) ? raw.cves : []);
  return {
    ip: raw.ip || raw.ip_str || '0.0.0.0',
    country_name: raw.country_name || raw.country || 'Unknown',
    country: raw.country || raw.country_code || 'XX',
    city: raw.city || '',
    org: raw.org || raw.isp || 'Unknown Organization',
    category: raw.category || 'NETWORK_INFRASTRUCTURE',
    product: raw.product || 'Identified Service',
    ports,
    threat_level: raw.threat_level || (raw.threat_score >= 75 ? 'CRITICAL' : raw.threat_score >= 50 ? 'HIGH' : 'LOW'),
    threat_score: Number(raw.threat_score || 0),
    vulns,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    banner_snippet: raw.banner_snippet || raw.banner || '',
    is_simulated: Boolean(raw.is_simulated),
  };
}

export function AgentGodsEyeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast Dual-Theme Tokens (Editorial Ivory Light >= 4.5:1 + Obsidian Dark)
  const palette = isDark
    ? {
        surface: '#0F111A',
        surfaceAlt: '#151824',
        radarBg: '#090C14',
        radarStroke: 'rgba(212, 175, 55, 0.35)',
        radarLabel: '#F3F4F6',
        border: 'rgba(255, 255, 255, 0.1)',
        gold: '#D4AF37',
        goldSoft: 'rgba(212, 175, 55, 0.14)',
        emerald: '#10B981',
        emeraldSoft: 'rgba(16, 185, 129, 0.14)',
        cyan: '#38BDF8',
        cyanSoft: 'rgba(56, 189, 248, 0.14)',
        crimson: '#F87171',
        crimsonSoft: 'rgba(239, 68, 68, 0.16)',
        amber: '#F59E0B',
        ink: '#F5F5F7',
        muted: '#9CA3AF',
        btnInk: '#08080B',
      }
    : {
        surface: '#FFFFFF',
        surfaceAlt: '#F3EFE6',
        radarBg: '#F6F2E8',
        radarStroke: 'rgba(154, 114, 9, 0.4)',
        radarLabel: '#1C1917',
        border: 'rgba(28, 25, 23, 0.12)',
        gold: '#9A7209',
        goldSoft: 'rgba(154, 114, 9, 0.1)',
        emerald: '#047857',
        emeraldSoft: 'rgba(4, 120, 87, 0.1)',
        cyan: '#0369A1',
        cyanSoft: 'rgba(3, 105, 161, 0.1)',
        crimson: '#BE123C',
        crimsonSoft: 'rgba(190, 18, 60, 0.1)',
        amber: '#B45309',
        ink: '#1C1917',
        muted: '#44403C',
        btnInk: '#FFFFFF',
      };

  const [activeTab, setActiveTab] = useState(0);
  const [searchInput, setSearchInput] = useState('port:554 has_screenshot:true');
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [daemonInfo, setDaemonInfo] = useState(null);
  const [daemonStats, setDaemonStats] = useState(null);
  const [offlinePreview, setOfflinePreview] = useState(false);
  const [allTargets, setAllTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [hostDossier, setHostDossier] = useState(null);
  const [radarAngle, setRadarAngle] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Probing local Agent God\'s Eye daemon on 127.0.0.1:8112...');
  const [copiedIp, setCopiedIp] = useState(null);

  // Subtle radar sweep animation (respects prefers-reduced-motion)
  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const timer = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 55);
    return () => clearInterval(timer);
  }, []);

  // Live probe of http://127.0.0.1:8112
  const syncFromDaemon = useCallback(async () => {
    try {
      const hRes = await fetch(`${DAEMON_BASE}/api/health`, { headers: { Accept: 'application/json' } });
      if (!hRes.ok) throw new Error(`HTTP ${hRes.status}`);
      const health = await hRes.json();
      if (health?.status !== 'ok') throw new Error('Invalid health payload');

      setDaemonOnline(true);

      const [infoRes, statsRes, targetsRes] = await Promise.all([
        fetch(`${DAEMON_BASE}/api/info`),
        fetch(`${DAEMON_BASE}/api/stats`),
        fetch(`${DAEMON_BASE}/api/targets?limit=50`),
      ]);
      const info = infoRes.ok ? await infoRes.json() : null;
      const stats = statsRes.ok ? await statsRes.json() : null;
      const tData = targetsRes.ok ? await targetsRes.json() : { targets: [] };

      setDaemonInfo(info);
      setDaemonStats(stats);

      let loaded = (tData.targets || []).map(normalizeTarget);
      if (loaded.length === 0) {
        // Hydrate initial query cleanly via local daemon
        const sRes = await fetch(`${DAEMON_BASE}/api/search?q=${encodeURIComponent('port:554 has_screenshot:true')}&limit=20`);
        if (sRes.ok) {
          const sData = await sRes.json();
          loaded = (sData.targets || []).map(normalizeTarget);
        }
      }

      setAllTargets(loaded);
      setSelectedTarget((prev) => loaded.find((t) => t.ip === prev?.ip) || loaded[0] || null);
      const modeDesc = info?.api_configured ? 'LIVE SHODAN API' : 'RFC 5737 OFFLINE DEMO';
      setStatusMessage(`Connected to 127.0.0.1:8112 (v${health.version || '2.6.0'}) · Mode: ${modeDesc} · ${loaded.length} targets.`);
    } catch {
      setDaemonOnline(false);
      setDaemonInfo(null);
      setDaemonStats(null);
      setStatusMessage('Local Daemon Offline — Run `agent-gods-eye serve` to connect live :8112 recon, or toggle RFC 5737 Offline Preview below.');
    }
  }, []);

  useEffect(() => {
    syncFromDaemon();
  }, [syncFromDaemon]);

  // Toggle opt-in RFC 5737 offline preview when daemon is down
  useEffect(() => {
    if (!daemonOnline) {
      if (offlinePreview) {
        setAllTargets(RFC5737_PREVIEW_TARGETS);
        setSelectedTarget(RFC5737_PREVIEW_TARGETS[0]);
      } else {
        setAllTargets([]);
        setSelectedTarget(null);
      }
    }
  }, [daemonOnline, offlinePreview]);

  // Live host inspect via :8112/api/host/<ip>
  const inspectHostLive = useCallback(async (target) => {
    setSelectedTarget(target);
    setHostDossier(target);
    if (!daemonOnline || !target?.ip) return;
    try {
      const res = await fetch(`${DAEMON_BASE}/api/host/${encodeURIComponent(target.ip)}`);
      if (res.ok) {
        const data = await res.json();
        setHostDossier(normalizeTarget({ ...target, ...data }));
      }
    } catch {
      // keep existing target details
    }
  }, [daemonOnline]);

  // Execute search via local daemon :8112/api/search (ZERO external browser DoH/InternetDB calls!)
  const executeDaemonSearch = async (queryOverride) => {
    const q = (queryOverride ?? searchInput).trim();
    if (!q) return;

    if (!daemonOnline) {
      if (!offlinePreview) {
        setStatusMessage('Local daemon (:8112) is offline. Run `agent-gods-eye serve` or enable RFC 5737 Offline Preview.');
        return;
      }
      const qLow = q.toLowerCase();
      const matched = RFC5737_PREVIEW_TARGETS.filter((t) =>
        t.ip.includes(qLow) ||
        t.product.toLowerCase().includes(qLow) ||
        t.org.toLowerCase().includes(qLow) ||
        t.tags.some((tg) => qLow.includes(tg)) ||
        t.ports.some((p) => qLow.includes(String(p)))
      );
      setAllTargets(matched);
      setSelectedTarget(matched[0] || null);
      setStatusMessage(`RFC 5737 Offline Preview filtered "${q}" -> ${matched.length} matches.`);
      return;
    }

    setIsSearching(true);
    setStatusMessage(`Executing local daemon sweep via 127.0.0.1:8112/api/search for "${q}"...`);
    try {
      const res = await fetch(`${DAEMON_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ q, limit: 30 }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setStatusMessage(`Search rejected (${res.status}): ${payload.error || 'Invalid query'}`);
        return;
      }
      const normalized = (payload.targets || []).map(normalizeTarget);
      setAllTargets(normalized);
      setSelectedTarget(normalized[0] || null);
      setHostDossier(normalized[0] || null);
      setStatusMessage(`Daemon returned ${normalized.length} targets (${payload.mode === 'live_shodan' ? 'Live Shodan' : 'RFC 5737 Offline Demo'}).`);
      // Refresh stats
      const stRes = await fetch(`${DAEMON_BASE}/api/stats`);
      if (stRes.ok) setDaemonStats(await stRes.json());
    } catch (err) {
      setStatusMessage(`Local daemon request failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = async (format) => {
    const fmt = format === 'csv' ? 'csv' : 'json';
    if (daemonOnline) {
      try {
        const res = await fetch(`${DAEMON_BASE}/api/export?format=${fmt}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `godseye_targets_${Date.now()}.${fmt}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setStatusMessage(`Exported ${fmt.toUpperCase()} bundle from 127.0.0.1:8112.`);
        return;
      } catch (err) {
        setStatusMessage(`Export error: ${err.message}`);
        return;
      }
    }
    const content = fmt === 'csv'
      ? ['ip,country,city,org,threat_score,ports,is_simulated', ...allTargets.map((t) =>
          `"${t.ip}","${t.country_name}","${t.city}","${t.org}","${t.threat_score}","${t.ports.join(';')}","${t.is_simulated}"`
        )].join('\n')
      : JSON.stringify({ version: '2.6.0', count: allTargets.length, targets: allTargets }, null, 2);
    const blob = new Blob([content], { type: fmt === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `godseye_preview_${Date.now()}.${fmt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyIp = (ip) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(ip).catch(() => {});
      setCopiedIp(ip);
      setTimeout(() => setCopiedIp(null), 1800);
    }
  };

  const filteredTargets = allTargets.filter((t) => {
    if (categoryFilter === 'ALL') return true;
    return t.category === categoryFilter;
  });

  // Compute max threat dynamically — NEVER hardcode 96%!
  const maxThreat = allTargets.length > 0
    ? Math.max(...allTargets.map((t) => Number(t.threat_score || 0)))
    : 0;
  const activeDossier = hostDossier || selectedTarget;
  const isLiveShodan = Boolean(daemonInfo?.api_configured && daemonInfo?.mode === 'live_shodan');

  return (
    <Box sx={{ mt: 1, position: 'relative' }}>
      {/* 1. RADAR HUD HEADER */}
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: palette.surface,
          border: `1px solid ${palette.border}`,
          boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.45)' : '0 6px 24px rgba(28,25,23,0.06)',
        }}
      >
        <SovereignEyebrow accent={palette.cyan} right="Security & Recon · v2.6.0">
          agent-gods-eye
        </SovereignEyebrow>
        <SovereignBand
          seed="agent-gods-eye"
          eyebrow="Security & Recon"
          caption="Agent God's Eye"
          label="Agent God's Eye — Local OSINT Tactical Radar"
        />

        {!daemonOnline && (
          <Alert
            severity="warning"
            sx={{ mt: 1.5, mb: 2, fontFamily: mono, fontSize: '0.8rem', alignItems: 'center' }}
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={offlinePreview}
                      onChange={(e) => setOfflinePreview(e.target.checked)}
                      inputProps={{ 'aria-label': 'Enable RFC 5737 Offline Preview' }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>RFC 5737 Preview</Typography>}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={syncFromDaemon}
                  sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700 }}
                >
                  Retry :8112
                </Button>
              </Stack>
            }
          >
            <strong>Local Daemon Offline</strong> — Run <code>agent-gods-eye serve</code> (127.0.0.1:8112) for live SQLite/Shodan recon.
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid xs={12} md={7}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: palette.goldSoft, color: palette.gold, display: 'flex' }}>
                <RadarIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: palette.ink }}>
                  Agent God&rsquo;s Eye <span style={{ color: palette.gold }}>Tactical OSINT Deck</span>
                </Typography>
                <Typography variant="caption" sx={{ color: palette.muted, fontFamily: mono }}>
                  Live Bridge to 127.0.0.1:8112 · Strict SSRF/IP Guard · Zero Unproxied Browser Egress
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip
                icon={<PublicIcon sx={{ fontSize: '0.95rem !important', color: `${daemonOnline ? palette.emerald : palette.amber} !important` }} />}
                label={daemonOnline ? (isLiveShodan ? 'DAEMON :8112 · SHODAN LIVE' : 'DAEMON :8112 · RFC 5737 DEMO') : 'DAEMON OFFLINE (:8112)'}
                sx={{
                  minHeight: 36,
                  bgcolor: daemonOnline ? palette.emeraldSoft : palette.goldSoft,
                  color: daemonOnline ? palette.emerald : palette.amber,
                  fontWeight: 800,
                  fontFamily: mono,
                  border: `1px solid ${daemonOnline ? palette.emerald : palette.amber}`,
                }}
              />
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '0.95rem !important', color: `${palette.cyan} !important` }} />}
                label="SSRF / METADATA GUARD ACTIVE"
                sx={{
                  minHeight: 36,
                  bgcolor: palette.cyanSoft,
                  color: palette.cyan,
                  fontWeight: 700,
                  fontFamily: mono,
                  border: `1px solid ${palette.cyan}`,
                }}
              />
              <Chip
                icon={<SecurityIcon sx={{ fontSize: '0.95rem !important', color: `${palette.crimson} !important` }} />}
                label="STDIO MCP + CSV/JSON EXPORT"
                sx={{
                  minHeight: 36,
                  bgcolor: palette.crimsonSoft,
                  color: palette.crimson,
                  fontWeight: 700,
                  fontFamily: mono,
                  border: `1px solid ${palette.crimson}`,
                }}
              />
            </Stack>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}`, textAlign: 'center' }}>
              <Grid container spacing={1}>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: palette.muted, fontWeight: 700 }}>
                    CATALOGED
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: palette.gold, fontFamily: mono }}>
                    {daemonStats?.total_targets ?? allTargets.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.gold, fontSize: '0.68rem', fontWeight: 700 }}>
                    NODES
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: palette.muted, fontWeight: 700 }}>
                    MAX THREAT
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: palette.crimson, fontFamily: mono }}>
                    {maxThreat}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.crimson, fontSize: '0.68rem', fontWeight: 700 }}>
                    COMPUTED
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" sx={{ color: palette.muted, fontWeight: 700 }}>
                    COUNTRIES
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: palette.emerald, fontFamily: mono }}>
                    {daemonStats?.unique_countries ?? new Set(allTargets.map((t) => t.country)).size}
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.emerald, fontSize: '0.68rem', fontWeight: 700 }}>
                    UNIQUE
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Live Daemon Search Bar */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${palette.border}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="stretch">
            <TextField
              size="small"
              fullWidth
              label="Shodan Filter Query"
              placeholder="port:502 modbus | port:554 has_screenshot:true | has_vuln:true"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeDaemonSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: palette.gold, fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { minHeight: 44, fontFamily: mono, bgcolor: palette.surfaceAlt },
              }}
            />
            <Button
              variant="contained"
              disabled={isSearching}
              onClick={() => executeDaemonSearch()}
              startIcon={<RadarIcon />}
              sx={{
                minHeight: 44,
                whiteSpace: 'nowrap',
                px: 3,
                bgcolor: palette.gold,
                color: palette.btnInk,
                fontWeight: 800,
                '&:hover': { bgcolor: palette.gold, filter: 'brightness(1.08)' },
                borderRadius: 2,
              }}
            >
              {isSearching ? 'SWEEPING...' : 'EXECUTE SWEEP'}
            </Button>
          </Stack>

          {statusMessage && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1.25, fontFamily: mono, color: palette.muted }}>
              {statusMessage}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* 2. WORKSTATION NAVIGATION TABS */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          borderBottom: `1px solid ${palette.border}`,
          '& .MuiTab-root': {
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.88rem',
            minHeight: 48,
            color: palette.muted,
            '&.Mui-selected': { color: palette.gold },
          },
          '& .MuiTabs-indicator': { bgcolor: palette.gold, height: 3 },
        }}
      >
        <Tab icon={<RadarIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Tactical Radar Grid" />
        <Tab icon={<PublicIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Target Host Dossier" />
        <Tab icon={<BugReportIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Correlated CVEs" />
        <Tab icon={<DownloadIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="JSON / CSV Export" />
      </Tabs>

      {/* TAB 0: RADAR GRID */}
      {activeTab === 0 && (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
            {[
              { id: 'ALL', label: 'All Targets', icon: PublicIcon },
              { id: 'SCADA_INDUSTRIAL', label: 'SCADA / Modbus', icon: PrecisionManufacturingIcon },
              { id: 'SURVEILLANCE_CAMERA', label: 'RTSP Surveillance', icon: CameraAltIcon },
              { id: 'DATABASE_CLUSTER', label: 'Databases', icon: StorageIcon },
              { id: 'FRONTIER_AI', label: 'AI Endpoints', icon: MemoryIcon },
            ].map((cat) => (
              <Chip
                key={cat.id}
                icon={<cat.icon sx={{ fontSize: 16 }} />}
                label={cat.label}
                onClick={() => setCategoryFilter(cat.id)}
                variant={categoryFilter === cat.id ? 'filled' : 'outlined'}
                sx={{
                  minHeight: 44,
                  px: 0.75,
                  fontWeight: 700,
                  fontFamily: mono,
                  bgcolor: categoryFilter === cat.id ? palette.gold : 'transparent',
                  color: categoryFilter === cat.id ? palette.btnInk : palette.ink,
                  '& .MuiChip-label, & .MuiChip-icon': {
                    color: categoryFilter === cat.id ? `${palette.btnInk} !important` : palette.ink,
                  },
                  borderColor: palette.gold,
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>

          <Grid container spacing={3}>
            {/* Dual-Theme SVG Tactical Radar Scope (Editorial Parchment in Light Mode!) */}
            <Grid xs={12} lg={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: palette.radarBg,
                  border: `1px solid ${palette.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 430,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <svg width="320" height="320" viewBox="0 0 340 340" role="img" aria-label="Tactical radar scope displaying active OSINT hosts">
                  <defs>
                    <radialGradient id="ageRadarGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={palette.gold} stopOpacity={isDark ? '0.22' : '0.16'} />
                      <stop offset="65%" stopColor={palette.gold} stopOpacity="0.04" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  <circle cx="170" cy="170" r="160" fill="url(#ageRadarGlow)" stroke={palette.radarStroke} strokeWidth="1.2" />
                  <circle cx="170" cy="170" r="120" fill="none" stroke={palette.radarStroke} strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="170" cy="170" r="80" fill="none" stroke={palette.radarStroke} strokeWidth="1" />
                  <circle cx="170" cy="170" r="40" fill="none" stroke={palette.radarStroke} strokeWidth="1" strokeDasharray="3 3" />

                  <line x1="170" y1="10" x2="170" y2="330" stroke={palette.radarStroke} strokeWidth="1" />
                  <line x1="10" y1="170" x2="330" y2="170" stroke={palette.radarStroke} strokeWidth="1" />

                  <g transform={`rotate(${radarAngle} 170 170)`}>
                    <line x1="170" y1="170" x2="330" y2="170" stroke={palette.gold} strokeWidth="2" strokeOpacity="0.85" />
                    <path d="M 170 170 L 330 170 A 160 160 0 0 0 300 80 Z" fill={palette.gold} fillOpacity={isDark ? '0.15' : '0.12'} />
                  </g>

                  {filteredTargets.map((t, idx) => {
                    const angles = [42, 122, 212, 294, 18, 168, 252, 332];
                    const radii = [126, 94, 138, 72, 112, 86, 122, 62];
                    const a = (angles[idx % angles.length] * Math.PI) / 180;
                    const r = radii[idx % radii.length];
                    const cx = 170 + r * Math.cos(a);
                    const cy = 170 + r * Math.sin(a);
                    const isSelected = selectedTarget?.ip === t.ip;

                    let blipColor = palette.cyan;
                    if (t.threat_score >= 75) blipColor = palette.crimson;
                    else if (t.threat_score >= 50) blipColor = palette.amber;

                    return (
                      <g key={t.ip} onClick={() => inspectHostLive(t)} style={{ cursor: 'pointer' }}>
                        {isSelected && (
                          <circle cx={cx} cy={cy} r="13" fill="none" stroke={blipColor} strokeWidth="2" />
                        )}
                        <circle cx={cx} cy={cy} r={isSelected ? '6.5' : '5'} fill={blipColor} />
                        <text x={cx + 9} y={cy + 4} fill={palette.radarLabel} fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {t.country}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <Typography variant="caption" sx={{ color: palette.gold, fontFamily: mono, fontWeight: 700, mt: 1, letterSpacing: '0.08em' }}>
                  BEARING: {radarAngle}° · VISIBLE TARGETS: {filteredTargets.length}
                </Typography>
              </Paper>
            </Grid>

            {/* Target Matrix List */}
            <Grid xs={12} lg={6}>
              <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${palette.border}`, bgcolor: palette.surface, height: 430, overflowY: 'auto' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: palette.ink }}>
                  <PublicIcon sx={{ color: palette.gold }} /> Cataloged OSINT Target Matrix
                </Typography>

                {filteredTargets.length === 0 ? (
                  <Typography variant="body2" sx={{ color: palette.muted, fontFamily: mono, py: 4, textAlign: 'center' }}>
                    {daemonOnline
                      ? 'No targets match this filter. Run a search sweep above.'
                      : 'Daemon offline. Start `agent-gods-eye serve` or toggle RFC 5737 Preview.'}
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {filteredTargets.map((target) => {
                      const isSelected = selectedTarget?.ip === target.ip;
                      return (
                        <Paper
                          key={`${target.ip}-${target.ports.join('-')}`}
                          onClick={() => inspectHostLive(target)}
                          sx={{
                            p: 1.75,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: isSelected ? palette.goldSoft : palette.surfaceAlt,
                            border: `1px solid ${isSelected ? palette.gold : palette.border}`,
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: palette.gold }}>
                                {target.ip}
                              </Typography>
                              <Chip label={target.country} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, fontFamily: mono }} />
                              {target.is_simulated && (
                                <Chip label="DEMO" size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800, fontFamily: mono, bgcolor: palette.goldSoft, color: palette.amber }} />
                              )}
                            </Stack>
                            <Chip
                              label={`${target.threat_level} (${target.threat_score}/100)`}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 24,
                                fontWeight: 800,
                                fontFamily: mono,
                                bgcolor: target.threat_score >= 75 ? palette.crimsonSoft : palette.goldSoft,
                                color: target.threat_score >= 75 ? palette.crimson : palette.gold,
                              }}
                            />
                          </Stack>
                          <Typography variant="caption" sx={{ color: palette.muted, display: 'block', mt: 0.5 }}>
                            {target.org} · {target.city ? `${target.city}, ` : ''}{target.country_name}
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                            {target.ports.map((p) => (
                              <Chip key={p} label={`:${p}`} size="small" sx={{ height: 22, fontSize: '0.68rem', fontFamily: mono }} />
                            ))}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 1: HOST DOSSIER */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${palette.border}`, bgcolor: palette.surface }}>
          {!activeDossier ? (
            <Typography sx={{ color: palette.muted, fontFamily: mono }}>Select a target from the Tactical Radar Grid first.</Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid xs={12} md={7}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 800, color: palette.gold }}>
                    {activeDossier.ip}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyIp(activeDossier.ip)}
                    sx={{ minHeight: 44, fontFamily: mono }}
                  >
                    {copiedIp === activeDossier.ip ? 'Copied!' : 'Copy IP'}
                  </Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Typography variant="caption" sx={{ color: palette.muted }}>ORGANIZATION</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: palette.ink }}>{activeDossier.org}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="caption" sx={{ color: palette.muted }}>LOCATION</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: palette.ink }}>{activeDossier.city}, {activeDossier.country_name}</Typography>
                  </Grid>
                  <Grid xs={12}>
                    <Typography variant="caption" sx={{ color: palette.muted }}>SERVICE &amp; BANNER</Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, color: palette.cyan, mt: 0.5 }}>
                      {activeDossier.product} — {activeDossier.banner_snippet || 'No banner snippet'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid xs={12} md={5}>
                <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.ink }}>Exposure Threat Score</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: activeDossier.threat_score >= 75 ? palette.crimson : palette.gold, fontFamily: mono, my: 1 }}>
                    {activeDossier.threat_score}<span style={{ fontSize: '1rem', color: palette.muted }}>/100</span>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={activeDossier.threat_score}
                    sx={{ height: 8, borderRadius: 4, bgcolor: palette.border, '& .MuiLinearProgress-bar': { bgcolor: activeDossier.threat_score >= 75 ? palette.crimson : palette.gold } }}
                  />
                </Paper>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}

      {/* TAB 2: CORRELATED CVES */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${palette.border}`, bgcolor: palette.surface }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: palette.ink }}>
            Correlated CVEs Across Active Targets
          </Typography>
          <Stack spacing={1.5}>
            {allTargets.filter((t) => t.vulns.length > 0).map((t) => (
              <Paper key={t.ip} sx={{ p: 2, borderRadius: 2, bgcolor: palette.surfaceAlt, border: `1px solid ${palette.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Typography sx={{ fontFamily: mono, fontWeight: 800, color: palette.gold }}>{t.ip} · {t.org}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {t.vulns.map((v) => (
                      <Chip key={v} label={v} size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: palette.crimsonSoft, color: palette.crimson }} />
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {allTargets.every((t) => t.vulns.length === 0) && (
              <Typography variant="body2" sx={{ color: palette.muted, fontFamily: mono }}>No CVEs flagged in current target set.</Typography>
            )}
          </Stack>
        </Paper>
      )}

      {/* TAB 3: EXPORT */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${palette.border}`, bgcolor: palette.surface }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: palette.ink }}>
            Export OSINT Target Inventory
          </Typography>
          <Typography variant="body2" sx={{ color: palette.muted, mb: 2.5 }}>
            Exports directly from <code>http://127.0.0.1:8112/api/export</code> (with CSV spreadsheet formula neutralization) when the local daemon is running.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
              sx={{ minHeight: 44, bgcolor: palette.gold, color: palette.btnInk, fontWeight: 800 }}
            >
              Download JSON Bundle
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              sx={{ minHeight: 44, fontWeight: 800, borderColor: palette.gold, color: palette.gold }}
            >
              Download Formula-Safe CSV
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

export default AgentGodsEyeGodModeTool;
