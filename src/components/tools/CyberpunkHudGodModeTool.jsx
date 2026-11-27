import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  LinearProgress,
  Stack,
  Alert,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import RadarIcon from '@mui/icons-material/Radar';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import HubIcon from '@mui/icons-material/Hub';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import {
  CYBERPUNK_HUD_SCHEMA_VERSION,
  ENTROPY_SAMPLE_PACKETS,
  computeShannonEntropy,
  buildBrowserOfflineTelemetry,
  exportHudJson,
  exportHudMarkdown,
  exportHudCsv,
} from '../../utils/cyberpunkHudEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

async function fetchCyberpunkHudTelemetry(timeoutMs = 5500) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/studio/cyberpunk-hud', {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return { ok: false, reason: 'Static deployment (non-JSON response)' };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'Probe timed out' : 'Loopback Studio API unavailable',
    };
  } finally {
    clearTimeout(timer);
  }
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function RadialGauge({ label, valuePct, displayValue, sublabel, strokeColor, tk }) {
  const clamped = Math.max(0, Math.min(100, Number(valuePct) || 0));
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - clamped / 100);

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2,
        bgcolor: tk.card,
        border: `1px solid ${tk.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
      }}
    >
      <svg
        width="92"
        height="92"
        viewBox="0 0 92 92"
        role="img"
        aria-label={`${label}: ${displayValue}`}
        style={{ display: 'block', marginBottom: 8 }}
      >
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke={tk.track}
          strokeWidth="8"
        />
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 46 46)"
        />
        <text
          x="46"
          y="49"
          textAnchor="middle"
          fill={tk.ink}
          fontFamily="JetBrains Mono, monospace"
          fontSize="14"
          fontWeight="800"
        >
          {displayValue}
        </text>
      </svg>
      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted, mt: 0.35 }}>
        {sublabel}
      </Typography>
    </Box>
  );
}

export default function CyberpunkHudGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Strict dual-theme tokens: Editorial Ivory Light (0 dark slabs) & Obsidian Gold Dark (>= 4.5:1 WCAG AA)
  const tk = useMemo(
    () => ({
      bg: isDark ? '#090B11' : '#F8F6F0',
      card: isDark ? '#11141D' : '#FFFFFF',
      inset: isDark ? '#161B28' : '#F1EDE3',
      codeBg: isDark ? '#06080D' : '#F6F3EB',
      track: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.12)',
      border: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.14)',
      ink: isDark ? '#F5F1E6' : '#101828',
      muted: isDark ? '#CBD5E1' : '#344054',
      gold: isDark ? '#D4AF37' : '#7A5808',
      goldSoft: isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF7E0',
      goldBorder: isDark ? 'rgba(212, 175, 55, 0.36)' : '#C89B2B',
      emerald: isDark ? '#34D399' : '#065F46',
      emeraldSoft: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ECFDF5',
      emeraldBorder: isDark ? 'rgba(52, 211, 153, 0.36)' : '#6EE7B7',
      sky: isDark ? '#38BDF8' : '#075985',
      skySoft: isDark ? 'rgba(56, 189, 248, 0.14)' : '#F0F9FF',
      amber: isDark ? '#FBBF24' : '#92400E',
      amberSoft: isDark ? 'rgba(251, 191, 36, 0.14)' : '#FFFBEB',
      crimson: isDark ? '#FB7185' : '#991B1B',
      crimsonSoft: isDark ? 'rgba(251, 113, 133, 0.14)' : '#FEF2F2',
    }),
    [isDark]
  );

  const aliveRef = useRef(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [snapshot, setSnapshot] = useState(() => buildBrowserOfflineTelemetry());
  const [statusLine, setStatusLine] = useState('Sampling loopback host and fleet telemetry...');

  // Tab 1: Entropy & Packet Stream state
  const [customPayload, setCustomPayload] = useState(ENTROPY_SAMPLE_PACKETS[0].payload);

  // Tab 2: Loopback Fleet Matrix filters
  const [fleetStatus, setFleetStatus] = useState('ALL');
  const [fleetQuery, setFleetQuery] = useState('');

  // Tab 3: Diagnostic Exports state
  const [exportFormat, setExportFormat] = useState('json');
  const [copiedKey, setCopiedKey] = useState('');

  const copyWithFeedback = useCallback((text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? '' : prev));
    }, 1800);
  }, []);

  const refreshHud = useCallback(async () => {
    setLoading(true);
    const res = await fetchCyberpunkHudTelemetry(5500);
    if (!aliveRef.current) return;
    if (res.ok && res.data && res.data.mode === 'LIVE_HOST_TELEMETRY') {
      setSnapshot(res.data);
      setStatusLine(
        `Live loopback feed · 127.0.0.1:3000/api/studio/cyberpunk-hud · v${res.data.version || CYBERPUNK_HUD_SCHEMA_VERSION}`
      );
    } else {
      const offline = buildBrowserOfflineTelemetry();
      setSnapshot(offline);
      setStatusLine(
        `Browser offline telemetry fallback (${res.reason || 'loopback API unreachable'}) — zero fabricated host metrics`
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refreshHud();
    return () => {
      aliveRef.current = false;
    };
  }, [refreshHud]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => {
      refreshHud();
    }, 6000);
    return () => clearInterval(id);
  }, [autoRefresh, refreshHud]);

  const isLive = snapshot.mode === 'LIVE_HOST_TELEMETRY' && Boolean(snapshot.host);
  const host = snapshot.host;
  const daemons = snapshot.daemons || { kvm: false, onlineCount: 0, totalCount: 0, core: [] };
  const fleet = snapshot.fleet || {
    total: 0,
    live: 0,
    dark: 0,
    healthPct: 0,
    latencyStats: { count: 0, min: 0, p50: 0, p95: 0, max: 0, avg: 0 },
    ports: [],
  };
  const liveEntropy = snapshot.entropy || computeShannonEntropy('');

  const customEntropy = useMemo(() => computeShannonEntropy(customPayload), [customPayload]);

  const filteredPorts = useMemo(() => {
    const q = fleetQuery.trim().toLowerCase();
    return (fleet.ports || []).filter((p) => {
      if (fleetStatus === 'LIVE' && !p.up) return false;
      if (fleetStatus === 'DARK' && p.up) return false;
      if (!q) return true;
      return `${p.port} :${p.port} ${p.name} ${p.id} ${p.category} ${p.frameHash}`
        .toLowerCase()
        .includes(q);
    });
  }, [fleet.ports, fleetStatus, fleetQuery]);

  const exportOutput = useMemo(() => {
    if (exportFormat === 'markdown') return exportHudMarkdown(snapshot);
    if (exportFormat === 'csv') return exportHudCsv(snapshot);
    return exportHudJson(snapshot);
  }, [exportFormat, snapshot]);

  const handleDownloadExport = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (exportFormat === 'markdown') {
      downloadFile(`cyberpunk-hud-snapshot-${stamp}.md`, exportOutput, 'text/markdown;charset=utf-8');
    } else if (exportFormat === 'csv') {
      downloadFile(`cyberpunk-hud-telemetry-${stamp}.csv`, exportOutput, 'text/csv;charset=utf-8');
    } else {
      downloadFile(`cyberpunk-hud-snapshot-${stamp}.json`, exportOutput, 'application/json;charset=utf-8');
    }
  };

  const thermalTone = (state) => {
    if (state === 'CRITICAL' || state === 'HOT') return { fg: tk.crimson, bg: tk.crimsonSoft };
    if (state === 'WARM') return { fg: tk.amber, bg: tk.amberSoft };
    if (state === 'COOL') return { fg: tk.emerald, bg: tk.emeraldSoft };
    return { fg: tk.muted, bg: tk.inset };
  };

  const tabs = [
    { id: 0, label: 'Live Telemetry HUD', icon: <RadarIcon sx={{ fontSize: 16 }} /> },
    { id: 1, label: 'Entropy & Packet Stream', icon: <GraphicEqIcon sx={{ fontSize: 16 }} /> },
    {
      id: 2,
      label: `Loopback Fleet Matrix (${fleet.live}/${fleet.total || 0})`,
      icon: <HubIcon sx={{ fontSize: 16 }} />,
    },
    { id: 3, label: 'Diagnostic Exports', icon: <DescriptionIcon sx={{ fontSize: 16 }} /> },
  ];

  const maxPortLatency = Math.max(1, fleet.latencyStats?.max || 1);

  return (
    <Box
      data-testid="cyberpunk-hud-workstation"
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 2.5,
        bgcolor: tk.bg,
        border: `1px solid ${tk.border}`,
        color: tk.ink,
        overflowX: 'hidden',
      }}
    >
      {/* Top HUD Command Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 2,
          borderBottom: `1px solid ${tk.border}`,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
            <Chip
              size="small"
              label={isLive ? '● LIVE HOST TELEMETRY' : '○ BROWSER OFFLINE FALLBACK'}
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.7rem',
                bgcolor: isLive ? tk.emeraldSoft : tk.amberSoft,
                color: isLive ? tk.emerald : tk.amber,
                border: `1px solid ${isLive ? tk.emeraldBorder : tk.goldBorder}`,
              }}
            />
            <Chip
              size="small"
              label={`H = ${liveEntropy.entropyBitsPerByte.toFixed(3)} bits/B`}
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.7rem',
                bgcolor: tk.goldSoft,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
              }}
            />
            <Chip
              size="small"
              label={`v${CYBERPUNK_HUD_SCHEMA_VERSION}`}
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: tk.inset,
                color: tk.ink,
                border: `1px solid ${tk.border}`,
              }}
            />
          </Stack>

          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.15rem', sm: '1.35rem' },
              fontWeight: 800,
              color: tk.ink,
              lineHeight: 1.25,
            }}
          >
            Cyberpunk Telemetry HUD Cockpit
          </Typography>
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: '0.74rem',
              color: tk.muted,
              mt: 0.35,
              overflowWrap: 'anywhere',
            }}
          >
            {statusLine}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            type="button"
            variant={autoRefresh ? 'contained' : 'outlined'}
            aria-pressed={autoRefresh}
            onClick={() => setAutoRefresh((prev) => !prev)}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: autoRefresh ? tk.emerald : tk.card,
              color: autoRefresh ? (isDark ? '#04120C' : '#FFFFFF') : tk.ink,
              borderColor: autoRefresh ? tk.emerald : tk.border,
              '&:hover': {
                bgcolor: autoRefresh ? tk.emerald : tk.inset,
                borderColor: tk.gold,
              },
            }}
          >
            Auto-Refresh (6s): {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            type="button"
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshHud}
            disabled={loading}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'none',
              transition: 'none',
              bgcolor: tk.gold,
              color: isDark ? '#08080B' : '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4306' },
              '&.Mui-disabled': {
                bgcolor: tk.inset,
                color: tk.ink,
                border: `1px solid ${tk.border}`,
              },
            }}
          >
            {loading ? 'Sampling...' : 'Refresh HUD'}
          </Button>
        </Stack>
      </Box>

      {/* Accessible Wrapping Tab Bar (minHeight 44, zero clipping on all viewports) */}
      <Box
        role="tablist"
        aria-label="Cyberpunk Telemetry HUD Views"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 2.5,
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              role="tab"
              aria-selected={active}
              type="button"
              startIcon={tab.icon}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                minHeight: 44,
                px: { xs: 1.5, sm: 2 },
                fontFamily: MONO,
                fontSize: { xs: '0.72rem', sm: '0.76rem' },
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: 1.5,
                bgcolor: active ? tk.emerald : tk.card,
                color: active ? (isDark ? '#04120C' : '#FFFFFF') : tk.ink,
                border: `1px solid ${active ? tk.emerald : tk.border}`,
                '&:hover': {
                  bgcolor: active ? tk.emerald : tk.inset,
                  borderColor: active ? tk.emerald : tk.gold,
                },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {/* ====================================================================
          TAB 0: LIVE TELEMETRY HUD
         ==================================================================== */}
      {activeTab === 0 && (
        <Stack spacing={2.5} data-testid="cyberpunk-hud-tab-telemetry">
          {!isLive && (
            <Alert
              severity="info"
              sx={{
                bgcolor: tk.skySoft,
                color: tk.ink,
                border: `1px solid ${tk.border}`,
                '& .MuiAlert-icon': { color: tk.sky },
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.ink }}>
                BROWSER_OFFLINE_FALLBACK Active
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mt: 0.4 }}>
                {snapshot.notice}
              </Typography>
            </Alert>
          )}

          {isLive && host ? (
            <>
              {/* Responsive SVG Telemetry Radial Gauges */}
              <Grid container spacing={2}>
                <Grid xs={6} sm={3}>
                  <RadialGauge
                    label="HOST CPU"
                    valuePct={host.cpu.pct}
                    displayValue={`${host.cpu.pct.toFixed(1)}%`}
                    sublabel={`${host.cpu.cores} cores · L1 ${host.cpu.loadavg[0].toFixed(2)}`}
                    strokeColor={host.cpu.pct > 85 ? tk.crimson : tk.emerald}
                    tk={tk}
                  />
                </Grid>
                <Grid xs={6} sm={3}>
                  <RadialGauge
                    label="MEMORY RAM"
                    valuePct={host.memory.usedPct}
                    displayValue={`${host.memory.usedPct.toFixed(1)}%`}
                    sublabel={`${host.memory.usedMiB.toLocaleString()} / ${host.memory.totalMiB.toLocaleString()} MiB`}
                    strokeColor={host.memory.usedPct > 88 ? tk.crimson : tk.sky}
                    tk={tk}
                  />
                </Grid>
                <Grid xs={6} sm={3}>
                  <RadialGauge
                    label="ROOT DISK"
                    valuePct={host.disk.usedPct}
                    displayValue={`${host.disk.usedPct.toFixed(1)}%`}
                    sublabel={`${host.disk.usedGiB.toFixed(1)} / ${host.disk.totalGiB.toFixed(1)} GiB`}
                    strokeColor={host.disk.usedPct > 88 ? tk.crimson : tk.gold}
                    tk={tk}
                  />
                </Grid>
                <Grid xs={6} sm={3}>
                  <RadialGauge
                    label="FLEET RING"
                    valuePct={fleet.healthPct}
                    displayValue={`${fleet.live}/${fleet.total}`}
                    sublabel={`p50 ${fleet.latencyStats.p50} ms · p95 ${fleet.latencyStats.p95} ms`}
                    strokeColor={tk.emerald}
                    tk={tk}
                  />
                </Grid>
              </Grid>

              {/* Detailed Hardware & GPU Cards */}
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.25,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                      <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold }}>
                        SILICON, LOADAVG &amp; THERMAL ZONES
                      </Typography>
                      <ThermostatIcon sx={{ fontSize: 18, color: tk.gold }} />
                    </Stack>

                    <Stack spacing={0.85} sx={{ mb: 1.75 }}>
                      {[
                        ['Processor', `${host.cpu.model} (${host.cpu.cores} logical)`],
                        ['Load Avg (1m / 5m / 15m)', host.cpu.loadavg.map((v) => v.toFixed(2)).join(' · ')],
                        ['Kernel & Host', `${host.kernel} (${host.arch}) · Up ${host.uptimeFormatted}`],
                        ['Audio Subsystem', `${host.audio.subsystem} — ${host.audio.device}`],
                        [
                          'GPU Telemetry',
                          host.gpu
                            ? `${host.gpu.name} (${host.gpu.tempC ?? 'N/A'}°C · ${host.gpu.memoryUsedMiB}/${host.gpu.memoryTotalMiB} MiB)`
                            : 'No NVIDIA GPU detected',
                        ],
                      ].map(([k, v]) => (
                        <Box
                          key={k}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1.25,
                            py: 0.45,
                            borderBottom: `1px dashed ${tk.border}`,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700, color: tk.muted }}>
                            {k}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: MONO,
                              fontSize: '0.73rem',
                              fontWeight: 700,
                              color: tk.ink,
                              overflowWrap: 'anywhere',
                              textAlign: { xs: 'left', sm: 'right' },
                            }}
                          >
                            {v}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    {/* Thermal Summary + Zone Bars */}
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.ink }}>
                        THERMAL ({host.thermal.count} ZONES): min {host.thermal.minTempC ?? 'N/A'}°C · avg{' '}
                        {host.thermal.avgTempC ?? 'N/A'}°C · max {host.thermal.maxTempC ?? 'N/A'}°C
                      </Typography>
                      <Chip
                        size="small"
                        label={host.thermal.state}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: thermalTone(host.thermal.state).bg,
                          color: thermalTone(host.thermal.state).fg,
                          border: `1px solid ${tk.border}`,
                        }}
                      />
                    </Stack>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {host.thermal.zones.map((z) => (
                        <Chip
                          key={z.name}
                          size="small"
                          label={`${z.type}: ${z.tempC}°C`}
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: tk.inset,
                            color: tk.ink,
                            border: `1px solid ${tk.border}`,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Core Loopback Daemons + Frame Receipt */}
                <Grid xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.25,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                      <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.emerald }}>
                        CORE LOOPBACK DAEMONS ({daemons.onlineCount}/{daemons.totalCount} ONLINE)
                      </Typography>
                      <Chip
                        size="small"
                        label={daemons.kvm ? 'KVM: READY' : 'KVM: OFF'}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: daemons.kvm ? tk.emeraldSoft : tk.inset,
                          color: daemons.kvm ? tk.emerald : tk.muted,
                          border: `1px solid ${tk.border}`,
                        }}
                      />
                    </Stack>

                    <Stack spacing={0.9}>
                      {daemons.core.map((d) => (
                        <Box
                          key={d.id}
                          sx={{
                            p: 1.15,
                            borderRadius: 1.5,
                            bgcolor: tk.inset,
                            border: `1px solid ${tk.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: tk.ink }}>
                              {d.name}{' '}
                              <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                                :{d.port}
                              </Typography>
                            </Typography>
                            {d.modelsCount !== null && d.modelsCount !== undefined && (
                              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>
                                Local models loaded: {d.modelsCount}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            size="small"
                            label={d.status}
                            sx={{
                              fontFamily: MONO,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: d.up ? tk.emeraldSoft : tk.crimsonSoft,
                              color: d.up ? tk.emerald : tk.crimson,
                              border: `1px solid ${d.up ? tk.emeraldBorder : tk.border}`,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>

                    <Box
                      sx={{
                        mt: 1.75,
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: tk.codeBg,
                        border: `1px solid ${tk.border}`,
                      }}
                    >
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, color: tk.gold }}>
                        LIVE TELEMETRY FRAME RECEIPT (FIPS 180-4 SHA-256)
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.7rem',
                          color: tk.ink,
                          mt: 0.35,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {snapshot.frameReceipt?.sha256 || liveEntropy.sha256}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : (
            /* Honest Browser Offline Telemetry Fallback */
            <Grid container spacing={2}>
              {[
                ['Runtime Mode', 'BROWSER_OFFLINE_FALLBACK', <RadarIcon key="i" sx={{ fontSize: 18, color: tk.gold }} />],
                [
                  'Logical CPU Threads',
                  `${snapshot.browser?.hardwareConcurrency || 1} thread(s)`,
                  <MemoryIcon key="i" sx={{ fontSize: 18, color: tk.emerald }} />,
                ],
                [
                  'Device Memory Estimate',
                  snapshot.browser?.deviceMemoryGiB
                    ? `${snapshot.browser.deviceMemoryGiB} GiB`
                    : 'Not exposed by browser',
                  <DeveloperBoardIcon key="i" sx={{ fontSize: 18, color: tk.sky }} />,
                ],
                [
                  'Display & Monotonic Clock',
                  `${snapshot.browser?.screenResolution || 'Unavailable'} · ${snapshot.browser?.monotonicMs ?? 0} ms`,
                  <StorageIcon key="i" sx={{ fontSize: 18, color: tk.amber }} />,
                ],
                [
                  'Network & Locale',
                  `${snapshot.browser?.online ? 'Online' : 'Offline'} · ${snapshot.browser?.language || 'en-US'} · ${snapshot.browser?.timezone || 'UTC'}`,
                  <HubIcon key="i" sx={{ fontSize: 18, color: tk.emerald }} />,
                ],
                [
                  'Offline Frame Entropy',
                  `${liveEntropy.entropyBitsPerByte.toFixed(4)} bits/B (${liveEntropy.tier})`,
                  <GraphicEqIcon key="i" sx={{ fontSize: 18, color: tk.gold }} />,
                ],
              ].map(([title, value, icon]) => (
                <Grid xs={12} sm={6} md={4} key={title}>
                  <Box
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.gold }}>
                        {title.toUpperCase()}
                      </Typography>
                      {icon}
                    </Stack>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.86rem', fontWeight: 800, color: tk.ink, overflowWrap: 'anywhere' }}>
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      )}

      {/* ====================================================================
          TAB 1: ENTROPY & PACKET STREAM
         ==================================================================== */}
      {activeTab === 1 && (
        <Stack spacing={2.5} data-testid="cyberpunk-hud-tab-entropy">
          {/* Live Telemetry Frame Entropy Strip */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold }}>
                ACTIVE TELEMETRY PACKET ENTROPY &amp; RECEIPT
              </Typography>
              <Chip
                size="small"
                label={liveEntropy.tier}
                sx={{
                  fontFamily: MONO,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: tk.emeraldSoft,
                  color: tk.emerald,
                  border: `1px solid ${tk.emeraldBorder}`,
                }}
              />
            </Stack>
            <Grid container spacing={1.5}>
              <Grid xs={6} sm={3}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>SHANNON H (BITS/B)</Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '1.15rem', fontWeight: 800, color: tk.ink }}>
                  {liveEntropy.entropyBitsPerByte.toFixed(4)}
                </Typography>
              </Grid>
              <Grid xs={6} sm={3}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>EFFICIENCY</Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '1.15rem', fontWeight: 800, color: tk.ink }}>
                  {liveEntropy.efficiencyPct.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid xs={6} sm={3}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>UNIQUE SYMBOLS</Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '1.15rem', fontWeight: 800, color: tk.ink }}>
                  {liveEntropy.uniqueSymbols} / 256
                </Typography>
              </Grid>
              <Grid xs={6} sm={3}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>FRAME BYTES</Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '1.15rem', fontWeight: 800, color: tk.ink }}>
                  {liveEntropy.byteLength} B
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Interactive Custom Payload Shannon Entropy Analyzer */}
          <Box
            sx={{
              p: 2.25,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: tk.emerald, mb: 1.25 }}>
              INTERACTIVE SHANNON ENTROPY &amp; BYTE-HISTOGRAM INSPECTOR
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.75 }}>
              {ENTROPY_SAMPLE_PACKETS.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  size="small"
                  variant="outlined"
                  onClick={() => setCustomPayload(preset.payload)}
                  sx={{
                    minHeight: 44,
                    px: 1.4,
                    fontFamily: MONO,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: tk.ink,
                    bgcolor: tk.inset,
                    borderColor: tk.border,
                    '&:hover': { borderColor: tk.gold, bgcolor: tk.goldSoft },
                  }}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                type="button"
                size="small"
                variant="outlined"
                onClick={() => setCustomPayload(exportHudJson(snapshot))}
                sx={{
                  minHeight: 44,
                  px: 1.4,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: tk.gold,
                  bgcolor: tk.goldSoft,
                  borderColor: tk.goldBorder,
                  '&:hover': { borderColor: tk.gold },
                }}
              >
                Load Current HUD Snapshot
              </Button>
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={10}
              label="Payload, Packet Dump, or Log Stream (UTF-8)"
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              inputProps={{
                'aria-label': 'Payload, packet dump, or log stream for Shannon entropy analysis',
                style: { fontFamily: MONO, fontSize: '0.78rem', lineHeight: 1.55 },
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: tk.codeBg,
                  color: tk.ink,
                  '& fieldset': { borderColor: tk.border },
                  '&:hover fieldset': { borderColor: tk.gold },
                },
                '& .MuiInputLabel-root': {
                  color: tk.muted,
                  fontFamily: MONO,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                },
              }}
            />

            <Grid container spacing={2} alignItems="stretch">
              <Grid xs={12} md={5}>
                <Box sx={{ p: 1.75, height: '100%', borderRadius: 1.75, bgcolor: tk.inset, border: `1px solid ${tk.border}` }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                      COMPUTED SHANNON ENTROPY
                    </Typography>
                    <Chip
                      size="small"
                      label={customEntropy.tier}
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: tk.card,
                        color: tk.ink,
                        border: `1px solid ${tk.border}`,
                      }}
                    />
                  </Stack>

                  <Typography sx={{ fontFamily: MONO, fontSize: '1.65rem', fontWeight: 800, color: tk.ink }}>
                    {customEntropy.entropyBitsPerByte.toFixed(4)}{' '}
                    <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.muted }}>
                      / 8.0000 bits/byte
                    </Typography>
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, customEntropy.efficiencyPct)}
                    aria-label="Payload Shannon entropy efficiency percentage"
                    sx={{
                      my: 1.25,
                      height: 10,
                      borderRadius: 1,
                      bgcolor: tk.card,
                      '& .MuiLinearProgress-bar': {
                        bgcolor:
                          customEntropy.entropyBitsPerByte >= 7.2
                            ? tk.crimson
                            : customEntropy.entropyBitsPerByte >= 5.2
                            ? tk.amber
                            : tk.emerald,
                      },
                    }}
                  />

                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                    Efficiency: {customEntropy.efficiencyPct.toFixed(2)}% · Unique symbols: {customEntropy.uniqueSymbols}/256 · Size:{' '}
                    {customEntropy.byteLength} B
                  </Typography>

                  <Box sx={{ mt: 1.5, pt: 1.25, borderTop: `1px dashed ${tk.border}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 800, color: tk.gold }}>
                        SHA-256 FRAME RECEIPT
                      </Typography>
                      <Button
                        type="button"
                        size="small"
                        variant="outlined"
                        startIcon={copiedKey === 'sha256' ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                        onClick={() => copyWithFeedback(customEntropy.sha256, 'sha256')}
                        sx={{
                          minHeight: 44,
                          px: 1.25,
                          fontFamily: MONO,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          color: tk.ink,
                          borderColor: tk.border,
                          bgcolor: tk.card,
                        }}
                      >
                        {copiedKey === 'sha256' ? 'Copied' : 'Copy Hash'}
                      </Button>
                    </Stack>
                    <Typography
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        color: tk.ink,
                        mt: 0.5,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {customEntropy.sha256}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid xs={12} md={7}>
                <Box sx={{ p: 1.75, height: '100%', borderRadius: 1.75, bgcolor: tk.inset, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.sky, mb: 1.1 }}>
                    TOP BYTE FREQUENCY HISTOGRAM (TOP 12 SYMBOLS)
                  </Typography>
                  {customEntropy.topBytes.length === 0 ? (
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted }}>
                      Enter text or load a preset packet to compute byte distribution.
                    </Typography>
                  ) : (
                    <Stack spacing={0.7}>
                      {customEntropy.topBytes.map((b) => (
                        <Box key={b.byte} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, width: 78, flexShrink: 0 }}>
                            {b.label} ({b.hex})
                          </Typography>
                          <Box sx={{ flexGrow: 1, height: 10, borderRadius: 1, bgcolor: tk.card, overflow: 'hidden' }}>
                            <Box
                              sx={{
                                width: `${Math.min(100, Math.max(2, b.ratioPct))}%`,
                                height: '100%',
                                bgcolor: tk.sky,
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted, width: 88, textAlign: 'right', flexShrink: 0 }}>
                            {b.count} ({b.ratioPct.toFixed(1)}%)
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      )}

      {/* ====================================================================
          TAB 2: LOOPBACK FLEET MATRIX
         ==================================================================== */}
      {activeTab === 2 && (
        <Stack spacing={2.5} data-testid="cyberpunk-hud-tab-fleet">
          {/* Percentile KPI Strip */}
          <Grid container spacing={1.5}>
            {[
              ['LIVE PORTS', String(fleet.live), tk.emerald],
              ['DARK PORTS', String(fleet.dark), tk.muted],
              ['TOTAL RING', String(fleet.total), tk.ink],
              ['P50 RTT', `${fleet.latencyStats.p50} ms`, tk.sky],
              ['P95 RTT', `${fleet.latencyStats.p95} ms`, tk.gold],
              ['MAX RTT', `${fleet.latencyStats.max} ms`, tk.amber],
            ].map(([label, value, color]) => (
              <Grid xs={6} sm={4} md={2} key={label}>
                <Box sx={{ p: 1.5, borderRadius: 1.75, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 800, color: tk.muted }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '1.1rem', fontWeight: 800, color }}>
                    {value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Filter & Search Bar */}
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {['ALL', 'LIVE', 'DARK'].map((st) => {
                const selected = fleetStatus === st;
                return (
                  <Button
                    key={st}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFleetStatus(st)}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      fontFamily: MONO,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: selected ? tk.emerald : tk.inset,
                      color: selected ? (isDark ? '#04120C' : '#FFFFFF') : tk.ink,
                      border: `1px solid ${selected ? tk.emerald : tk.border}`,
                    }}
                  >
                    {st}
                  </Button>
                );
              })}
            </Stack>

            <TextField
              label="Filter Loopback Ports or Services"
              value={fleetQuery}
              onChange={(e) => setFleetQuery(e.target.value)}
              inputProps={{
                'aria-label': 'Filter loopback fleet ports or services by port number, name, or category',
                style: { fontFamily: MONO, fontSize: '0.78rem', minHeight: 44, boxSizing: 'border-box', padding: '10px 14px' },
              }}
              sx={{
                minWidth: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  minHeight: 44,
                  bgcolor: tk.codeBg,
                  color: tk.ink,
                  '& fieldset': { borderColor: tk.border },
                },
                '& .MuiInputLabel-root': {
                  color: tk.muted,
                  fontFamily: MONO,
                  fontSize: '0.76rem',
                },
              }}
            />
          </Box>

          {/* Port Rows */}
          {filteredPorts.length === 0 ? (
            <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: tk.card, border: `1px solid ${tk.border}` }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', color: tk.muted }}>
                {fleet.total === 0
                  ? 'Loopback fleet probing requires local Zoth Studio on 127.0.0.1:3000. Zero simulated ports are injected in offline mode.'
                  : 'No loopback ports matched the current filter.'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.85}>
              {filteredPorts.map((p) => {
                const barPct = p.up ? Math.min(100, Math.max(4, (p.latencyMs / maxPortLatency) * 100)) : 0;
                return (
                  <Box
                    key={p.port}
                    sx={{
                      p: 1.35,
                      borderRadius: 1.75,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '92px 1.6fr 1fr 140px 96px' },
                      alignItems: 'center',
                      gap: 1.25,
                    }}
                  >
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: tk.gold }}>
                      :{p.port}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.ink, overflowWrap: 'anywhere' }}>
                        {p.name}
                      </Typography>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>
                        {p.category} · frame {p.frameHash}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        size="small"
                        label={p.up ? `LIVE · HTTP ${p.statusCode}` : 'DARK'}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          bgcolor: p.up ? tk.emeraldSoft : tk.inset,
                          color: p.up ? tk.emerald : tk.muted,
                          border: `1px solid ${p.up ? tk.emeraldBorder : tk.border}`,
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ height: 8, borderRadius: 1, bgcolor: tk.inset, overflow: 'hidden' }}>
                        <Box sx={{ width: `${barPct}%`, height: '100%', bgcolor: p.up ? tk.sky : tk.muted }} />
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: p.up ? tk.ink : tk.muted,
                        textAlign: { xs: 'left', sm: 'right' },
                      }}
                    >
                      {p.up ? `${p.latencyMs} ms` : '—'}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      )}

      {/* ====================================================================
          TAB 3: DIAGNOSTIC EXPORTS
         ==================================================================== */}
      {activeTab === 3 && (
        <Stack spacing={2} data-testid="cyberpunk-hud-tab-exports">
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 800, color: tk.gold, mb: 0.75 }}>
              SANITIZED TELEMETRY DIAGNOSTIC EXPORTER
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: tk.muted, mb: 1.75 }}>
              Exports redact local user home directories to tilde paths and prefix spreadsheet formula characters in CSV cells.
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {[
                { id: 'json', label: 'JSON Snapshot' },
                { id: 'markdown', label: 'Markdown Report' },
                { id: 'csv', label: 'Formula-Safe CSV' },
              ].map((fmt) => {
                const selected = exportFormat === fmt.id;
                return (
                  <Button
                    key={fmt.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setExportFormat(fmt.id)}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      fontFamily: MONO,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: selected ? tk.emerald : tk.inset,
                      color: selected ? (isDark ? '#04120C' : '#FFFFFF') : tk.ink,
                      border: `1px solid ${selected ? tk.emerald : tk.border}`,
                    }}
                  >
                    {fmt.label}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="outlined"
                startIcon={copiedKey === 'export' ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                onClick={() => copyWithFeedback(exportOutput, 'export')}
                sx={{
                  minHeight: 44,
                  px: 1.75,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: tk.ink,
                  bgcolor: tk.card,
                  borderColor: tk.border,
                }}
              >
                {copiedKey === 'export' ? 'Copied Snapshot' : 'Copy Output'}
              </Button>

              <Button
                type="button"
                variant="contained"
                startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                onClick={handleDownloadExport}
                sx={{
                  minHeight: 44,
                  px: 1.75,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: tk.gold,
                  color: isDark ? '#08080B' : '#FFFFFF',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4306' },
                }}
              >
                Download File
              </Button>
            </Stack>

            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 1.75,
                bgcolor: tk.codeBg,
                border: `1px solid ${tk.border}`,
                fontFamily: MONO,
                fontSize: '0.72rem',
                lineHeight: 1.55,
                color: tk.ink,
                maxHeight: 420,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {exportOutput}
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
}
