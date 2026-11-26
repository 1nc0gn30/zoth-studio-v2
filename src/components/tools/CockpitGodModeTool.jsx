import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  LinearProgress,
  Stack,
  Alert,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SpeedIcon from '@mui/icons-material/Speed';
import HubIcon from '@mui/icons-material/Hub';
import SearchIcon from '@mui/icons-material/Search';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DescriptionIcon from '@mui/icons-material/Description';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import { microTools } from '../../data/toolsData';
import { workstations } from '../../data/workstations';
import {
  COCKPIT_SCHEMA_VERSION,
  DEFAULT_OPERATOR_ACTIONS,
  filterFleetServices,
  buildCommandPaletteEntries,
  matchCommandPalette,
  buildOfflineBrowserSnapshot,
  buildCockpitJsonSnapshot,
  buildCockpitMarkdownReport,
  buildCockpitCsvReport,
} from '../../utils/cockpitEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

async function fetchCockpitTelemetry(timeoutMs = 5500) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch('/api/studio/cockpit', {
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
      reason: err?.name === 'AbortError' ? 'Probe timed out' : 'Loopback daemon unreachable',
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

export default function CockpitGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast dual-theme tokens (verified >= 4.5:1 WCAG AA in Light & Dark)
  const tk = useMemo(
    () => ({
      bg: isDark ? '#090B11' : '#F8F6F0',
      card: isDark ? '#0E121B' : '#FFFFFF',
      inset: isDark ? '#121723' : '#F1EDE3',
      codeBg: isDark ? '#06080D' : '#111827',
      border: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.14)',
      ink: isDark ? '#F5F1E6' : '#101828',
      muted: isDark ? '#CBD5E1' : '#334155',
      gold: isDark ? '#D4AF37' : '#7A5808',
      goldSoft: isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF7E0',
      goldBorder: isDark ? 'rgba(212, 175, 55, 0.36)' : '#D9B45A',
      emerald: isDark ? '#34D399' : '#047857',
      emeraldSoft: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ECFDF5',
      emeraldBorder: isDark ? 'rgba(52, 211, 153, 0.36)' : '#6EE7B7',
      amber: isDark ? '#FBBF24' : '#92400E',
      amberSoft: isDark ? 'rgba(251, 191, 36, 0.14)' : '#FFFBEB',
      crimson: isDark ? '#FB7185' : '#B91C1C',
      crimsonSoft: isDark ? 'rgba(251, 113, 133, 0.14)' : '#FEF2F2',
      sky: isDark ? '#38BDF8' : '#0369A1',
      skySoft: isDark ? 'rgba(56, 189, 248, 0.14)' : '#F0F9FF',
    }),
    [isDark]
  );

  const aliveRef = useRef(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPoll, setAutoPoll] = useState(false);
  const [snapshot, setSnapshot] = useState(() => buildOfflineBrowserSnapshot());
  const [statusNote, setStatusNote] = useState('Sampling loopback host telemetry...');

  // Tab 1: Fleet Matrix filters
  const [fleetStatusFilter, setFleetStatusFilter] = useState('ALL');
  const [fleetCategory, setFleetCategory] = useState('ALL');
  const [fleetQuery, setFleetQuery] = useState('');

  // Tab 2: Quick-Launch Command Palette state
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteKind, setPaletteKind] = useState('ALL');

  // Tab 3: Diagnostic Snapshot Exporter state
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

  const refreshTelemetry = useCallback(async () => {
    setLoading(true);
    const res = await fetchCockpitTelemetry(5500);
    if (!aliveRef.current) return;
    if (res.ok && res.data && res.data.host) {
      setSnapshot(res.data);
      setStatusNote(`Live loopback telemetry · 127.0.0.1:3000 · v${res.data.schemaVersion || COCKPIT_SCHEMA_VERSION}`);
    } else {
      const fallback = buildOfflineBrowserSnapshot();
      setSnapshot(fallback);
      setStatusNote(
        `Offline browser-inspector fallback (${res.reason || 'loopback unavailable'}) — zero fabricated host metrics`
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refreshTelemetry();
    return () => {
      aliveRef.current = false;
    };
  }, [refreshTelemetry]);

  useEffect(() => {
    if (!autoPoll) return undefined;
    const id = setInterval(() => {
      refreshTelemetry();
    }, 8000);
    return () => clearInterval(id);
  }, [autoPoll, refreshTelemetry]);

  const isLive = snapshot.mode === 'loopback-live' && Boolean(snapshot.host);
  const host = snapshot.host;
  const daemons = snapshot.daemons;
  const fleet = snapshot.fleet || { total: 0, live: 0, dark: 0, healthPct: 0, categories: [], services: [] };

  const filteredFleet = useMemo(
    () =>
      filterFleetServices(fleet.services, {
        status: fleetStatusFilter,
        category: fleetCategory,
        query: fleetQuery,
      }),
    [fleet.services, fleetStatusFilter, fleetCategory, fleetQuery]
  );

  const paletteEntries = useMemo(
    () => buildCommandPaletteEntries(microTools, workstations, DEFAULT_OPERATOR_ACTIONS),
    []
  );

  const paletteMatches = useMemo(
    () => matchCommandPalette(paletteEntries, paletteQuery, { kind: paletteKind, limit: 36 }),
    [paletteEntries, paletteQuery, paletteKind]
  );

  const exportPreview = useMemo(() => {
    if (exportFormat === 'markdown') return buildCockpitMarkdownReport(snapshot);
    if (exportFormat === 'csv') return buildCockpitCsvReport(fleet.services);
    return buildCockpitJsonSnapshot(snapshot);
  }, [exportFormat, snapshot, fleet.services]);

  const thermalTone = (state) => {
    if (state === 'HOT') return { fg: tk.crimson, bg: tk.crimsonSoft };
    if (state === 'WARM') return { fg: tk.amber, bg: tk.amberSoft };
    if (state === 'COOL') return { fg: tk.emerald, bg: tk.emeraldSoft };
    return { fg: tk.muted, bg: tk.inset };
  };

  const tabs = [
    { id: 0, label: 'Host Telemetry HUD', shortLabel: 'Telemetry', icon: <SpeedIcon sx={{ fontSize: 16 }} /> },
    {
      id: 1,
      label: `Fleet Health (${fleet.live}/${fleet.total || 88})`,
      shortLabel: `Fleet (${fleet.live}/${fleet.total || 88})`,
      icon: <HubIcon sx={{ fontSize: 16 }} />,
    },
    {
      id: 2,
      label: `Command Palette (${paletteEntries.length})`,
      shortLabel: 'Palette',
      icon: <SearchIcon sx={{ fontSize: 16 }} />,
    },
    {
      id: 3,
      label: 'Diagnostic Export',
      shortLabel: 'Export',
      icon: <DescriptionIcon sx={{ fontSize: 16 }} />,
    },
  ];

  const handleDownloadSnapshot = () => {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    if (exportFormat === 'markdown') {
      downloadFile(`zoth-cockpit-diagnostic-${stamp}.md`, exportPreview, 'text/markdown;charset=utf-8');
    } else if (exportFormat === 'csv') {
      downloadFile(`zoth-cockpit-fleet-${stamp}.csv`, exportPreview, 'text/csv;charset=utf-8');
    } else {
      downloadFile(`zoth-cockpit-snapshot-${stamp}.json`, exportPreview, 'application/json;charset=utf-8');
    }
  };

  return (
    <Box
      data-testid="cockpit-workstation"
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 2.5,
        bgcolor: tk.bg,
        border: `1px solid ${tk.border}`,
        color: tk.ink,
      }}
    >
      {/* Top Operator Bar */}
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
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
            <Chip
              size="small"
              label={isLive ? '● LIVE LOOPBACK :3000' : '○ BROWSER INSPECTOR FALLBACK'}
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
              label={`REALITY: ${(snapshot.reality?.mode || 'gold').toUpperCase()}`}
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
              label={`v${COCKPIT_SCHEMA_VERSION}`}
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
            Sovereign Operator Command Deck
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted, mt: 0.35 }}>
            {statusNote}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            type="button"
            variant={autoPoll ? 'contained' : 'outlined'}
            aria-pressed={autoPoll}
            onClick={() => setAutoPoll((prev) => !prev)}
            sx={{
              minHeight: 44,
              px: 1.75,
              fontFamily: MONO,
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: autoPoll ? tk.emerald : 'transparent',
              color: autoPoll ? (isDark ? '#04120C' : '#FFFFFF') : tk.ink,
              borderColor: autoPoll ? tk.emerald : tk.border,
            }}
          >
            Auto-Poll (8s): {autoPoll ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshTelemetry}
            disabled={loading}
            sx={{
              minHeight: 44,
              px: 2,
              fontFamily: MONO,
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'none',
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
            {loading ? 'Sampling...' : 'Refresh Telemetry'}
          </Button>
        </Stack>
      </Box>

      {/* Wrapping Accessible Tab Navigation (Zero right-edge clipping on Mobile/Tablet/Desktop) */}
      <Box
        role="tablist"
        aria-label="Cockpit Workstation Views"
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
                fontSize: { xs: '0.74rem', sm: '0.76rem' },
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
          TAB 0: LIVE HOST TELEMETRY HUD
         ==================================================================== */}
      {activeTab === 0 && (
        <Stack spacing={2.5} data-testid="cockpit-tab-telemetry">
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
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.ink }}>
                Offline Browser-Inspector Mode Active
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: tk.muted, mt: 0.4 }}>
                {snapshot.notice} Start Zoth Studio locally (`zoth open cockpit` or `node server/serve.mjs --port 3000`) for live Linux CPU/RAM/disk/thermal/GPU and 88-port loopback daemon telemetry.
              </Typography>
            </Alert>
          )}

          {isLive && host ? (
            <>
              {/* Primary KPI Gauge Strip */}
              <Grid container spacing={2}>
                {/* CPU Card */}
                <Grid xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold }}>
                        HOST CPU ({host.cpu.cores} CORES)
                      </Typography>
                      <MemoryIcon sx={{ fontSize: 18, color: tk.gold }} />
                    </Stack>
                    <Typography sx={{ fontFamily: MONO, fontSize: '1.65rem', fontWeight: 800, color: tk.ink }}>
                      {host.cpu.pct.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, host.cpu.pct)}
                      aria-label="Host CPU utilization percentage"
                      sx={{
                        my: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: tk.inset,
                        '& .MuiLinearProgress-bar': { bgcolor: host.cpu.pct > 85 ? tk.crimson : tk.emerald },
                      }}
                    />
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                      Load: {host.cpu.loadavg.map((v) => v.toFixed(2)).join(' · ')}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.68rem',
                        color: tk.muted,
                        mt: 0.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={host.cpu.model}
                    >
                      {host.cpu.model}
                    </Typography>
                  </Box>
                </Grid>

                {/* RAM Card */}
                <Grid xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.sky }}>
                        MEMORY (RAM)
                      </Typography>
                      <DeveloperBoardIcon sx={{ fontSize: 18, color: tk.sky }} />
                    </Stack>
                    <Typography sx={{ fontFamily: MONO, fontSize: '1.65rem', fontWeight: 800, color: tk.ink }}>
                      {host.memory.usedPct.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, host.memory.usedPct)}
                      aria-label="Host memory utilization percentage"
                      sx={{
                        my: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: tk.inset,
                        '& .MuiLinearProgress-bar': { bgcolor: host.memory.usedPct > 88 ? tk.crimson : tk.sky },
                      }}
                    />
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                      {host.memory.usedMiB.toLocaleString()} / {host.memory.totalMiB.toLocaleString()} MiB
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted, mt: 0.4 }}>
                      Free: {host.memory.freeMiB.toLocaleString()} MiB
                    </Typography>
                  </Box>
                </Grid>

                {/* Root Disk Card */}
                <Grid xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.emerald }}>
                        ROOT DISK ({host.disk.mount})
                      </Typography>
                      <StorageIcon sx={{ fontSize: 18, color: tk.emerald }} />
                    </Stack>
                    <Typography sx={{ fontFamily: MONO, fontSize: '1.65rem', fontWeight: 800, color: tk.ink }}>
                      {host.disk.usedPct.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, host.disk.usedPct)}
                      aria-label="Root disk utilization percentage"
                      sx={{
                        my: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: tk.inset,
                        '& .MuiLinearProgress-bar': { bgcolor: host.disk.usedPct > 88 ? tk.crimson : tk.emerald },
                      }}
                    />
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                      {host.disk.usedGiB.toFixed(1)} / {host.disk.totalGiB.toFixed(1)} GiB
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted, mt: 0.4 }}>
                      Available: {host.disk.freeGiB.toFixed(1)} GiB
                    </Typography>
                  </Box>
                </Grid>

                {/* Thermal & GPU Card */}
                <Grid xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.amber }}>
                        THERMAL &amp; GPU
                      </Typography>
                      <ThermostatIcon sx={{ fontSize: 18, color: tk.amber }} />
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '1.65rem', fontWeight: 800, color: tk.ink }}>
                        {host.thermal.maxTempC !== null ? `${host.thermal.maxTempC}°C` : 'N/A'}
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
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                      Zones: {host.thermal.zones.length} sensor(s) active
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.68rem',
                        color: tk.muted,
                        mt: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={host.gpu ? `${host.gpu.name} · ${host.gpu.tempC}°C` : 'No NVIDIA GPU detected'}
                    >
                      {host.gpu
                        ? `GPU: ${host.gpu.name} (${host.gpu.tempC ?? '—'}°C · ${host.gpu.memoryUsedMiB}/${host.gpu.memoryTotalMiB} MiB)`
                        : 'GPU: Integrated / no nvidia-smi'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Second Row: System Specs & Thermal Zones + Core Daemons */}
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
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.gold, mb: 1.5 }}>
                      HOST SUBSTRATE &amp; THERMAL SENSORS
                    </Typography>
                    <Stack spacing={0.9}>
                      {[
                        ['Distribution', `${host.distro}${host.release ? ` · ${host.release}` : ''}`],
                        ['Kernel & Arch', `${host.kernel} (${host.arch})`],
                        ['Hostname & Uptime', `${host.hostname} · Up ${host.uptimeFormatted}`],
                        ['Audio Subsystem', `${host.audio.subsystem} — ${host.audio.device}`],
                        ['KVM Virtualization', daemons?.kvm ? 'AVAILABLE (/dev/kvm)' : 'UNAVAILABLE'],
                      ].map(([k, v]) => (
                        <Box
                          key={k}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 1.5,
                            py: 0.5,
                            borderBottom: `1px dashed ${tk.border}`,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.muted }}>
                            {k}
                          </Typography>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.ink }}>
                            {v}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    {host.thermal.zones.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.muted, mb: 1 }}>
                          /sys/class/thermal SENSORS ({host.thermal.zones.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {host.thermal.zones.slice(0, 8).map((z) => (
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
                    )}
                  </Box>
                </Grid>

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
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 800, color: tk.emerald, mb: 1.5 }}>
                      CORE LOOPBACK DAEMONS &amp; LOCAL AI MODELS
                    </Typography>
                    <Stack spacing={1}>
                      {(daemons?.core || []).map((svc) => (
                        <Box
                          key={svc.id}
                          sx={{
                            p: 1.25,
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
                          <Box>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.ink }}>
                              {svc.name}{' '}
                              {svc.port ? (
                                <Typography component="span" sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                                  :{svc.port}
                                </Typography>
                              ) : null}
                            </Typography>
                            {Array.isArray(svc.models) && svc.models.length > 0 && (
                              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: tk.muted }}>
                                Models ({svc.models.length}): {svc.models.slice(0, 4).join(', ')}
                                {svc.models.length > 4 ? ` +${svc.models.length - 4}` : ''}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            size="small"
                            label={svc.up ? 'ONLINE' : 'OFFLINE'}
                            sx={{
                              fontFamily: MONO,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: svc.up ? tk.emeraldSoft : tk.crimsonSoft,
                              color: svc.up ? tk.emerald : tk.crimson,
                              border: `1px solid ${svc.up ? tk.emeraldBorder : tk.border}`,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : (
            /* Honest Offline Browser Inspector Fallback */
            <Grid container spacing={2}>
              {[
                ['Browser Platform', snapshot.browser?.platform || 'Browser Sandbox'],
                ['Hardware Concurrency', `${snapshot.browser?.cores || 1} logical thread(s)`],
                [
                  'Device Memory',
                  snapshot.browser?.deviceMemoryGiB
                    ? `${snapshot.browser.deviceMemoryGiB} GiB (browser estimate)`
                    : 'Not exposed by browser',
                ],
                ['Display & Locale', `${snapshot.browser?.viewport || 'Unknown'} · ${snapshot.browser?.language || 'en-US'}`],
                ['Timezone', snapshot.browser?.timezone || 'UTC'],
                ['Command Palette Index', `${microTools.length} tools · ${workstations.length} workstations ready offline`],
              ].map(([label, value]) => (
                <Grid xs={12} sm={6} md={4} key={label}>
                  <Box
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                    }}
                  >
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 800, color: tk.gold, mb: 0.75 }}>
                      {label.toUpperCase()}
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.88rem', fontWeight: 700, color: tk.ink }}>
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
          TAB 1: LIVE FLEET HEALTH BOARD (88-PORT LOOPBACK MATRIX)
         ==================================================================== */}
      {activeTab === 1 && (
        <Stack spacing={2} data-testid="cockpit-tab-fleet">
          {/* Fleet Summary & Controls */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
                  { id: 'ALL', label: `ALL (${fleet.total})` },
                  { id: 'LIVE', label: `LIVE (${fleet.live})` },
                  { id: 'DARK', label: `DARK (${fleet.dark})` },
                ].map((opt) => {
                  const active = fleetStatusFilter === opt.id;
                  return (
                    <Button
                      key={opt.id}
                      type="button"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setFleetStatusFilter(opt.id)}
                      sx={{
                        minHeight: 44,
                        px: 1.75,
                        fontFamily: MONO,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        bgcolor: active ? tk.emerald : 'transparent',
                        color: active ? (isDark ? '#04120C' : '#FFFFFF') : tk.ink,
                        borderColor: active ? tk.emerald : tk.border,
                      }}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flex: 1, maxWidth: { md: 560 } }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Filter fleet by name, id, or port"
                  value={fleetQuery}
                  onChange={(e) => setFleetQuery(e.target.value)}
                  inputProps={{ 'aria-label': 'Filter fleet services by name, id, or port' }}
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, fontSize: '0.78rem' },
                  }}
                />
                <TextField
                  select
                  size="small"
                  label="Category"
                  value={fleetCategory}
                  onChange={(e) => setFleetCategory(e.target.value)}
                  SelectProps={{
                    inputProps: { 'aria-label': 'Filter fleet by category' },
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, fontSize: '0.78rem' },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                    All Categories ({fleet.categories.length})
                  </MenuItem>
                  {fleet.categories.map((cat) => (
                    <MenuItem key={cat} value={cat} sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>

            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted }}>
              Showing {filteredFleet.length} of {fleet.total} scanned loopback ports (Health: {fleet.healthPct.toFixed(1)}%)
            </Typography>
          </Box>

          {filteredFleet.length === 0 ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.82rem', color: tk.muted }}>
                {fleet.total === 0
                  ? 'Loopback fleet scan requires local Zoth Studio server (http://127.0.0.1:3000/api/studio/cockpit).'
                  : 'No loopback services match the active filter.'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1.5}>
              {filteredFleet.map((svc) => {
                const cliCmd = svc.isCore ? `curl -sS http://127.0.0.1:${svc.port}/` : `zoth open ${svc.id}`;
                const copyId = `fleet-${svc.port}`;
                return (
                  <Grid xs={12} sm={6} lg={4} key={`${svc.port}-${svc.id}`}>
                    <Box
                      sx={{
                        p: 1.75,
                        height: '100%',
                        borderRadius: 2,
                        bgcolor: tk.card,
                        border: `1px solid ${svc.up ? tk.emeraldBorder : tk.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 1.25,
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                          <Chip
                            size="small"
                            label={`:${svc.port}`}
                            sx={{
                              fontFamily: MONO,
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: tk.inset,
                              color: tk.gold,
                              border: `1px solid ${tk.border}`,
                            }}
                          />
                          <Chip
                            size="small"
                            label={svc.up ? `LIVE · ${svc.latencyMs}ms` : 'DARK'}
                            sx={{
                              fontFamily: MONO,
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              bgcolor: svc.up ? tk.emeraldSoft : tk.inset,
                              color: svc.up ? tk.emerald : tk.muted,
                              border: `1px solid ${svc.up ? tk.emeraldBorder : tk.border}`,
                            }}
                          />
                        </Stack>
                        <Typography sx={{ fontFamily: DISPLAY, fontSize: '0.92rem', fontWeight: 700, color: tk.ink }}>
                          {svc.name}
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.muted, mt: 0.25 }}>
                          {svc.category} · {svc.isCore ? 'Core Daemon' : svc.executionType}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {svc.up && (
                          <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={`http://127.0.0.1:${svc.port}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              minHeight: 44,
                              fontFamily: MONO,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              color: tk.emerald,
                              borderColor: tk.emeraldBorder,
                            }}
                          >
                            Open :{svc.port}
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={copiedKey === copyId ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                          onClick={() => copyWithFeedback(cliCmd, copyId)}
                          sx={{
                            minHeight: 44,
                            fontFamily: MONO,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: tk.ink,
                            borderColor: tk.border,
                          }}
                        >
                          {copiedKey === copyId ? 'Copied CLI' : 'Copy CLI'}
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Stack>
      )}

      {/* ====================================================================
          TAB 2: QUICK-LAUNCH COMMAND PALETTE (85 TOOLS + 45 WORKSTATIONS + ACTIONS)
         ==================================================================== */}
      {activeTab === 2 && (
        <Stack spacing={2} data-testid="cockpit-tab-palette">
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
            }}
          >
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                label="Search all 85 tools, 45 workstations, ports, or CLI actions"
                placeholder="Try: cockpit, 8094, chronicle, bus-monitor, hexstrike, budget..."
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                inputProps={{ 'aria-label': 'Search command palette across all tools and workstations' }}
                sx={{
                  '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, fontSize: '0.82rem' },
                }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                {[
                  { id: 'ALL', label: `All (${paletteEntries.length})` },
                  { id: 'tool', label: `Tools (${microTools.length})` },
                  { id: 'workstation', label: `Workstations (${workstations.length})` },
                  { id: 'action', label: `Operator Actions (${DEFAULT_OPERATOR_ACTIONS.length})` },
                ].map((opt) => {
                  const active = paletteKind === opt.id;
                  return (
                    <Button
                      key={opt.id}
                      type="button"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setPaletteKind(opt.id)}
                      sx={{
                        minHeight: 44,
                        px: 1.6,
                        fontFamily: MONO,
                        fontSize: '0.73rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        bgcolor: active ? tk.gold : 'transparent',
                        color: active ? (isDark ? '#08080B' : '#FFFFFF') : tk.ink,
                        borderColor: active ? tk.gold : tk.border,
                      }}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </Stack>
            </Stack>
          </Box>

          <Grid container spacing={1.5}>
            {paletteMatches.map((item) => {
              const copyId = `pal-${item.key}`;
              return (
                <Grid xs={12} md={6} key={item.key}>
                  <Box
                    sx={{
                      p: 1.75,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: tk.card,
                      border: `1px solid ${tk.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 1.25,
                    }}
                  >
                    <Box>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                        <Chip
                          size="small"
                          label={item.kind.toUpperCase()}
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            bgcolor: item.kind === 'tool' ? tk.skySoft : item.kind === 'workstation' ? tk.goldSoft : tk.emeraldSoft,
                            color: item.kind === 'tool' ? tk.sky : item.kind === 'workstation' ? tk.gold : tk.emerald,
                            border: `1px solid ${tk.border}`,
                          }}
                        />
                        <Chip
                          size="small"
                          label={item.category}
                          sx={{
                            fontFamily: MONO,
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            bgcolor: tk.inset,
                            color: tk.ink,
                            border: `1px solid ${tk.border}`,
                          }}
                        />
                        {item.port ? (
                          <Chip
                            size="small"
                            label={`:${item.port}`}
                            sx={{
                              fontFamily: MONO,
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              bgcolor: tk.inset,
                              color: tk.emerald,
                              border: `1px solid ${tk.emeraldBorder}`,
                            }}
                          />
                        ) : null}
                      </Stack>
                      <Typography sx={{ fontFamily: DISPLAY, fontSize: '0.94rem', fontWeight: 700, color: tk.ink }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: tk.muted, mt: 0.4, lineHeight: 1.45 }}>
                        {item.description}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Button
                        size="small"
                        variant="contained"
                        component={RouterLink}
                        to={item.route}
                        sx={{
                          minHeight: 44,
                          fontFamily: MONO,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          bgcolor: tk.emerald,
                          color: isDark ? '#04120C' : '#FFFFFF',
                        }}
                      >
                        Open Route
                      </Button>
                      {item.cli && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={copiedKey === copyId ? <CheckIcon sx={{ fontSize: 14 }} /> : <TerminalIcon sx={{ fontSize: 14 }} />}
                          onClick={() => copyWithFeedback(item.cli, copyId)}
                          sx={{
                            minHeight: 44,
                            fontFamily: MONO,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: tk.ink,
                            borderColor: tk.border,
                          }}
                        >
                          {copiedKey === copyId ? 'Copied!' : item.cli}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      )}

      {/* ====================================================================
          TAB 3: DIAGNOSTIC SNAPSHOT EXPORTER (JSON / MARKDOWN / FORMULA-SAFE CSV)
         ==================================================================== */}
      {activeTab === 3 && (
        <Stack spacing={2} data-testid="cockpit-tab-export">
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {[
                { id: 'json', label: 'Sanitized JSON (.json)' },
                { id: 'markdown', label: 'Markdown Brief (.md)' },
                { id: 'csv', label: 'Formula-Safe Fleet CSV (.csv)' },
              ].map((fmt) => {
                const active = exportFormat === fmt.id;
                return (
                  <Button
                    key={fmt.id}
                    type="button"
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setExportFormat(fmt.id)}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      fontFamily: MONO,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: active ? tk.gold : 'transparent',
                      color: active ? (isDark ? '#08080B' : '#FFFFFF') : tk.ink,
                      borderColor: active ? tk.gold : tk.border,
                    }}
                  >
                    {fmt.label}
                  </Button>
                );
              })}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                startIcon={copiedKey === 'export-preview' ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={() => copyWithFeedback(exportPreview, 'export-preview')}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: tk.ink,
                  borderColor: tk.border,
                }}
              >
                {copiedKey === 'export-preview' ? 'Copied Report' : 'Copy Snapshot'}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadSnapshot}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: tk.emerald,
                  color: isDark ? '#04120C' : '#FFFFFF',
                }}
              >
                Download .{exportFormat === 'markdown' ? 'md' : exportFormat}
              </Button>
            </Stack>
          </Box>

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              borderRadius: 2,
              bgcolor: tk.codeBg,
              color: '#E2E8F0',
              border: `1px solid ${tk.border}`,
              fontFamily: MONO,
              fontSize: '0.74rem',
              lineHeight: 1.6,
              maxHeight: 420,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {exportPreview}
          </Box>
        </Stack>
      )}
    </Box>
  );
}
