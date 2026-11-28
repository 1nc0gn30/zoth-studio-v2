import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HermesGatewayTelemetryPanel from './HermesGatewayTelemetryPanel';
import {
  MISSION_CONTROL_SCHEMA_VERSION,
  MISSION_PRESETS,
  buildOfflineMissionControlSnapshot,
  formatMissionControlExports,
  planMissionDag,
} from '../../utils/missionControlEngine';

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const DISPLAY = "'Space Grotesk', 'Inter', system-ui, sans-serif";

function downloadTextFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Zoth Mission Control & Fleet Dispatcher (v2.5.0)
 * Pure-MUI Dual-Theme Workstation (Editorial Ivory Light + Obsidian Gold Dark).
 *
 * Unifies live 91-port loopback fleet telemetry, core daemons, Konsole Relay,
 * hardened Hermes Gateway/WebChat observability, deterministic Kahn Mission DAG
 * wave planning, PBFT quorum verification (N >= 3f + 1), incident triage, and
 * formula-safe JSON/Markdown/CSV/YAML exports with honest BROWSER_OFFLINE_FALLBACK.
 */
export default function MissionControlGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
        bg: '#0B0D12',
        card: '#12151E',
        inset: '#171B26',
        ink: '#F5F2EA',
        muted: '#B4BAC6',
        border: 'rgba(212, 175, 55, 0.28)',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        gold: '#E5C65C',
        goldBg: '#2A220B',
        goldBorder: '#9A781A',
        goldBtnBg: '#D4AF37',
        goldBtnInk: '#0B0D12',
        goldBtnDisabledBg: '#C9A42E',
        goldBtnDisabledInk: '#0B0D12',
        emerald: '#4ADE80',
        emeraldBg: '#0F261A',
        emeraldBorder: '#1E6B42',
        amber: '#FBBF24',
        amberBg: '#2B1F09',
        amberBorder: '#8A6312',
        sky: '#7DD3FC',
        skyBg: '#0E2233',
        skyBorder: '#235B85',
        red: '#FCA5A5',
        redBg: '#301417',
        redBorder: '#8F2B34',
        codeBg: '#0E1118',
      };
    }
    return {
      bg: '#FAF8F3',
      card: '#FFFFFF',
      inset: '#F4EFE4',
      ink: '#101828',
      muted: '#475467',
      border: '#D8CEB6',
      borderSoft: '#E4DCCB',
      gold: '#7A5600',
      goldBg: '#F6EED6',
      goldBorder: '#C7A95A',
      goldBtnBg: '#7A5600',
      goldBtnInk: '#FFFFFF',
      goldBtnDisabledBg: '#6B4F08',
      goldBtnDisabledInk: '#FFFFFF',
      emerald: '#0B5E38',
      emeraldBg: '#E6F5EC',
      emeraldBorder: '#8CC9A7',
      amber: '#7C4A03',
      amberBg: '#FDF2DC',
      amberBorder: '#DFB66A',
      sky: '#0E4F7A',
      skyBg: '#E6F2FA',
      skyBorder: '#94C2E0',
      red: '#991B1B',
      redBg: '#FEF2F2',
      redBorder: '#F3B4B4',
      codeBg: '#F4EFE4',
    };
  }, [isDark]);

  const [activeTab, setActiveTab] = useState(0);
  const [snapshot, setSnapshot] = useState(() => buildOfflineMissionControlSnapshot());
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Tab 1: Fleet filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('all'); // all | live | dark | core

  // Tab 3: Mission DAG & PBFT Planner state
  const [selectedPresetId, setSelectedPresetId] = useState(MISSION_PRESETS[0].id);
  const [missionName, setMissionName] = useState(MISSION_PRESETS[0].name);
  const [pbftN, setPbftN] = useState(String(MISSION_PRESETS[0].pbft.n));
  const [pbftF, setPbftF] = useState(String(MISSION_PRESETS[0].pbft.f));
  const [stages, setStages] = useState(() => MISSION_PRESETS[0].stages.map((s) => ({ ...s, dependsOn: [...s.dependsOn] })));
  const [newStageId, setNewStageId] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newStagePort, setNewStagePort] = useState('');
  const [newStageMs, setNewStageMs] = useState('150');
  const [newStageDeps, setNewStageDeps] = useState('');
  const [serverPlanMeta, setServerPlanMeta] = useState(null);
  const [planBusy, setPlanBusy] = useState(false);

  // Tab 4: Export preview format
  const [exportFormat, setExportFormat] = useState('yaml');

  const fetchSnapshot = useCallback(async (refresh = false, signal = undefined) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/studio/mission-control${refresh ? '?refresh=1' : ''}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data && typeof data === 'object' && data.schemaVersion && data.fleet) {
        setSnapshot(data);
      } else {
        setSnapshot(buildOfflineMissionControlSnapshot());
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setSnapshot(buildOfflineMissionControlSnapshot());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchSnapshot(false, ctrl.signal);
    return () => ctrl.abort();
  }, [fetchSnapshot]);

  const handleCopy = (id, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? '' : prev)), 1800);
  };

  const categories = useMemo(() => {
    const list = (snapshot.fleet?.categories || []).map((c) => c.category);
    return ['ALL', ...list];
  }, [snapshot.fleet]);

  const filteredPorts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (snapshot.fleet?.ports || []).filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (statusFilter === 'live' && !p.up) return false;
      if (statusFilter === 'dark' && p.up) return false;
      if (statusFilter === 'core' && !p.isCore) return false;
      if (q) {
        const hay = `${p.port} ${p.id} ${p.name} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [snapshot.fleet, searchQuery, categoryFilter, statusFilter]);

  const currentMissionSpec = useMemo(() => ({
    id: selectedPresetId || 'custom-mission',
    name: missionName || 'Custom Operator Mission',
    pbft: {
      n: Math.max(1, Number(pbftN) || 4),
      f: Math.max(0, Number(pbftF) || 0),
    },
    stages,
  }), [selectedPresetId, missionName, pbftN, pbftF, stages]);

  const planResult = useMemo(() => planMissionDag(currentMissionSpec, {
    fleetPorts: snapshot.fleet?.ports || [],
    mode: snapshot.mode,
  }), [currentMissionSpec, snapshot.fleet, snapshot.mode]);

  const exportsBundle = useMemo(
    () => formatMissionControlExports(snapshot, planResult),
    [snapshot, planResult]
  );

  const handleLoadPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setMissionName(preset.name);
    setPbftN(String(preset.pbft.n));
    setPbftF(String(preset.pbft.f));
    setStages(preset.stages.map((s) => ({ ...s, dependsOn: [...s.dependsOn] })));
    setServerPlanMeta(null);
  };

  const handleAddStage = () => {
    const cleanId = newStageId.trim().replace(/[^a-zA-Z0-9._-]/g, '-');
    if (!cleanId) return;
    if (stages.some((s) => s.id === cleanId)) return;
    const deps = newStageDeps
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedPort = newStagePort.trim() === '' ? null : Number(newStagePort.trim());
    const parsedMs = Math.max(10, Math.min(600000, Number(newStageMs) || 150));
    setStages((prev) => [
      ...prev,
      {
        id: cleanId,
        name: newStageName.trim() || cleanId,
        owner: 'operator-stage',
        port: Number.isInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535 ? parsedPort : null,
        estimatedMs: parsedMs,
        dependsOn: deps,
        critical: true,
      },
    ]);
    setNewStageId('');
    setNewStageName('');
    setNewStagePort('');
    setNewStageDeps('');
    setServerPlanMeta(null);
  };

  const handleRemoveStage = (idToRemove) => {
    setStages((prev) =>
      prev
        .filter((s) => s.id !== idToRemove)
        .map((s) => ({ ...s, dependsOn: s.dependsOn.filter((d) => d !== idToRemove) }))
    );
    setServerPlanMeta(null);
  };

  const handleVerifyPlanServer = async () => {
    setPlanBusy(true);
    setServerPlanMeta(null);
    if (snapshot.liveApiReachable) {
      try {
        const resp = await fetch('/api/studio/mission-control/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(currentMissionSpec),
        });
        const data = await resp.json();
        if (resp.ok && data?.ok) {
          setServerPlanMeta({
            source: 'LOOPBACK API VERIFIED (/api/studio/mission-control/plan)',
            receiptSha256: data.receiptSha256,
            ok: true,
            message: `Verified ${data.waveCount} wave(s), critical path ${data.criticalPathMs} ms, readiness ${data.readinessScore}%.`,
          });
          setPlanBusy(false);
          return;
        }
        setServerPlanMeta({
          source: 'LOOPBACK API REJECTED',
          ok: false,
          message: data?.error || `HTTP ${resp.status}`,
        });
        setPlanBusy(false);
        return;
      } catch {
        // Fall through cleanly to local pure engine
      }
    }
    setServerPlanMeta({
      source: 'CLIENT-SIDE ENGINE VERIFIED (OFFLINE FALLBACK)',
      receiptSha256: planResult.receiptSha256 || '',
      ok: Boolean(planResult.ok),
      message: planResult.ok
        ? `Verified locally: ${planResult.waveCount} wave(s), critical path ${planResult.criticalPathMs} ms.`
        : planResult.error,
    });
    setPlanBusy(false);
  };

  const isLive = snapshot.mode === 'LIVE_LOOPBACK';
  const stamp = new Date().toISOString().slice(0, 10);
  const kr = snapshot.konsoleRelay;
  const krTokenCheck = kr?.permissions?.tokenFile?.mode
    ? kr.permissions.tokenFile.mode === '0600' && !kr.permissions.tokenFile.worldOrGroupPermissive
    : (kr?.posture?.tokenHardened ?? kr?.posture?.checks?.find((c) => c.id === 'token_mode')?.passed);
  const krPostureGrade = kr?.posture?.grade ? ` · Posture ${kr.posture.score}/100 (${kr.posture.grade})` : '';

  const fieldSx = {
    bgcolor: tk.inset,
    '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, fontSize: '0.8rem', color: tk.ink },
    '& .MuiInputBase-input, & .MuiNativeSelect-select': { minHeight: 44, height: '44px', boxSizing: 'border-box', py: '10px', color: tk.ink },
    '& .MuiInputLabel-root': { color: tk.muted, fontSize: '0.8rem' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: tk.border },
  };
  const stageFieldSx = {
    bgcolor: tk.card,
    '& .MuiInputBase-root': { minHeight: 44, fontFamily: MONO, fontSize: '0.78rem', color: tk.ink },
    '& .MuiInputBase-input, & .MuiNativeSelect-select': { minHeight: 44, height: '44px', boxSizing: 'border-box', py: '10px', color: tk.ink },
    '& .MuiInputLabel-root': { color: tk.muted },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: tk.border },
  };

  const chipWrapSx = {
    height: 'auto',
    minHeight: 28,
    maxWidth: '100%',
    '& .MuiChip-label': {
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      py: 0.35,
      lineHeight: 1.3,
    },
  };

  const btnOutlinedSx = {
    minHeight: 44,
    px: 1.75,
    fontFamily: MONO,
    fontSize: '0.74rem',
    fontWeight: 700,
    textTransform: 'none',
    color: tk.ink,
    borderColor: tk.border,
    bgcolor: tk.inset,
    '&:hover': { borderColor: tk.gold, bgcolor: tk.goldBg },
  };

  const btnPrimarySx = {
    minHeight: 44,
    px: 2,
    fontFamily: MONO,
    fontSize: '0.76rem',
    fontWeight: 800,
    textTransform: 'none',
    bgcolor: tk.goldBtnBg,
    color: tk.goldBtnInk,
    transition: 'none',
    '&:hover': { bgcolor: isDark ? '#E5C65C' : '#5E4305' },
    '&.Mui-disabled': {
      bgcolor: tk.goldBtnDisabledBg,
      color: tk.goldBtnDisabledInk,
      border: `1px solid ${tk.goldBorder}`,
      opacity: 1,
    },
  };

  return (
    <Paper
      elevation={0}
      data-testid="mission-control-workstation"
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        borderRadius: 2.5,
        bgcolor: tk.card,
        border: `1px solid ${tk.border}`,
        color: tk.ink,
        minWidth: 0,
        overflow: 'hidden',
        scrollMarginTop: '88px',
      }}
    >
      {/* Top Status & Control Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Chip
              size="small"
              data-testid="mission-control-mode-badge"
              label={isLive ? 'LIVE_LOOPBACK · 127.0.0.1:3000' : 'BROWSER_OFFLINE_FALLBACK · UNPROBED'}
              sx={{
                ...chipWrapSx,
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: '0.69rem',
                bgcolor: isLive ? tk.emeraldBg : tk.amberBg,
                color: isLive ? tk.emerald : tk.amber,
                border: `1px solid ${isLive ? tk.emeraldBorder : tk.amberBorder}`,
              }}
            />
            <Chip
              size="small"
              icon={<SecurityIcon sx={{ fontSize: '15px !important', color: `${tk.sky} !important`, flexShrink: 0 }} />}
              label={`READ-ONLY · ZERO SECRETS · v${MISSION_CONTROL_SCHEMA_VERSION}`}
              sx={{
                ...chipWrapSx,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.68rem',
                bgcolor: tk.skyBg,
                color: tk.sky,
                border: `1px solid ${tk.skyBorder}`,
              }}
            />
          </Stack>

          <Typography
            component="h2"
            sx={{
              fontFamily: DISPLAY,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 700,
              color: tk.ink,
              lineHeight: 1.2,
            }}
          >
            Zoth Mission Control &amp; Fleet Dispatcher
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: '0.86rem',
              color: tk.muted,
              lineHeight: 1.55,
            }}
          >
            Unified read-only fleet supervisor across 91 loopback ports, core daemons, Hermes Agent Gateway &amp; WebChat, Konsole Relay, deterministic Kahn Mission DAG scheduling, and PBFT quorum triage.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            onClick={() => fetchSnapshot(true)}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={btnPrimarySx}
          >
            {loading ? 'Refreshing…' : 'Refresh Fleet'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleCopy('mc-cli', 'zoth open mission-control --json')}
            startIcon={copiedId === 'mc-cli' ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
            sx={btnOutlinedSx}
          >
            {copiedId === 'mc-cli' ? 'Copied CLI' : 'Copy CLI'}
          </Button>
        </Stack>
      </Box>

      {/* Top 4 KPI Summary Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2.25 }}>
        {[
          {
            label: 'FLEET PORTS LIVE',
            value: isLive
              ? `${snapshot.summary.livePorts} / ${snapshot.summary.totalPorts}`
              : `0 / ${snapshot.summary.totalPorts} (unprobed)`,
            sub: isLive
              ? `${snapshot.summary.availabilityPct}% reachable · ${snapshot.summary.darkPorts} dark`
              : 'Connect local :3000 for live port probes',
            tone: isLive ? tk.emerald : tk.amber,
          },
          {
            label: 'LOOPBACK RTT (p50 / p95)',
            value: isLive
              ? `${snapshot.summary.p50LatencyMs} ms / ${snapshot.summary.p95LatencyMs} ms`
              : '— / —',
            sub: isLive
              ? `min ${snapshot.fleet.latency.min} ms · max ${snapshot.fleet.latency.max} ms`
              : 'Measured over 127.0.0.1 loopback',
            tone: tk.sky,
          },
          {
            label: 'CORE DAEMONS & RELAY',
            value: `${snapshot.summary.coreDaemonsLive} / ${snapshot.summary.coreDaemonsTotal} online`,
            sub: `Hermes ${snapshot.summary.hermesGatewayActive ? `PID ${snapshot.summary.hermesGatewayPid}` : 'unprobed'} · Konsole ${snapshot.summary.konsoleRelayActive ? `PID ${snapshot.summary.konsoleRelayPid}` : 'unprobed'}`,
            tone: snapshot.summary.coreDaemonsLive > 0 ? tk.gold : tk.muted,
          },
          {
            label: 'PBFT & INCIDENT QUEUE',
            value: `${snapshot.summary.totalIncidents} advisory(s)`,
            sub: `${snapshot.pbft.safetyFormula} (${snapshot.summary.criticalIncidents} critical)`,
            tone: snapshot.summary.criticalIncidents > 0 ? tk.red : snapshot.summary.warningIncidents > 0 ? tk.amber : tk.emerald,
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.75,
                bgcolor: tk.inset,
                border: `1px solid ${tk.borderSoft}`,
                height: '100%',
                minWidth: 0,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.67rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.07em' }}>
                {card.label}
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.98rem', fontWeight: 800, color: card.tone, mt: 0.4, overflowWrap: 'anywhere' }}>
                {card.value}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: tk.muted, mt: 0.35, overflowWrap: 'anywhere' }}>
                {card.sub}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 4-Tab Navigation Bar (scrollable on narrow screens, zero desktop clipping) */}
      <Box sx={{ borderBottom: `1px solid ${tk.borderSoft}`, mb: 2.25 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Mission Control workstation sections"
          sx={{
            minHeight: 46,
            '& .MuiTabs-indicator': { bgcolor: tk.gold, height: 3 },
            '& .MuiTab-root': {
              minHeight: 46,
              fontFamily: MONO,
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.muted,
              px: { xs: 1.5, sm: 2.25 },
              '&.Mui-selected': { color: tk.gold },
            },
          }}
        >
          <Tab label="Fleet & Daemons" id="mc-tab-0" aria-controls="mc-panel-0" />
          <Tab label="Hermes Supervisor" id="mc-tab-1" aria-controls="mc-panel-1" />
          <Tab label="Mission DAG & PBFT" id="mc-tab-2" aria-controls="mc-panel-2" />
          <Tab label={`Triage & Exports (${snapshot.summary.totalIncidents})`} id="mc-tab-3" aria-controls="mc-panel-3" />
        </Tabs>
      </Box>

      {/* TAB 0: FLEET & DAEMON MATRIX */}
      {activeTab === 0 && (
        <Box role="tabpanel" id="mc-panel-0" aria-labelledby="mc-tab-0">
          {/* Core Daemons + Konsole Relay Strip */}
          <Typography
            component="h3"
            sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold, mb: 1.25, letterSpacing: '0.07em' }}
          >
            CORE DAEMONS, KVM &amp; KONSOLE RELAY (:8797)
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, height: '100%' }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 800, color: tk.ink, mb: 0.6 }}>
                  KONSOLE RELAY (KDE D-BUS · :8797)
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.84rem', fontWeight: 800, color: kr?.active ? tk.emerald : tk.amber }}>
                  {kr?.active ? `ACTIVE · PID ${kr.systemd?.pid ?? '—'}` : (isLive ? 'INACTIVE' : 'UNPROBED (OFFLINE FALLBACK)')}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: tk.muted, mt: 0.4, overflowWrap: 'anywhere' }}>
                  Unit: <code>{kr?.unit || 'konsole-relay.service'}</code> · RAM {kr?.systemd?.memoryCurrentMb != null ? `${kr.systemd.memoryCurrentMb} MiB` : '—'} · Token 0600: {krTokenCheck === true ? 'verified' : krTokenCheck === false ? 'advisory' : 'unprobed'}{krPostureGrade}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, height: '100%' }}>
                <Stack direction="row" spacing={0.85} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={`KVM Hypervisor: ${snapshot.daemons.kvm ? 'READY' : 'UNAVAILABLE'}`}
                    sx={{
                      ...chipWrapSx,
                      fontFamily: MONO,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: snapshot.daemons.kvm ? tk.emeraldBg : tk.card,
                      color: snapshot.daemons.kvm ? tk.emerald : tk.muted,
                      border: `1px solid ${snapshot.daemons.kvm ? tk.emeraldBorder : tk.borderSoft}`,
                    }}
                  />
                  {snapshot.daemons.daemons.slice(0, 12).map((d) => (
                    <Chip
                      key={d.id}
                      size="small"
                      label={`${d.id}${d.port ? `:${d.port}` : ''} · ${d.up ? 'UP' : 'DOWN'}`}
                      sx={{
                        ...chipWrapSx,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: d.up ? tk.emeraldBg : tk.card,
                        color: d.up ? tk.emerald : tk.muted,
                        border: `1px solid ${d.up ? tk.emeraldBorder : tk.borderSoft}`,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* Filter Bar */}
          <Typography
            component="h3"
            sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold, mb: 1.25, letterSpacing: '0.07em' }}
          >
            91-PORT LOOPBACK FLEET MATRIX ({filteredPorts.length} SHOWN / {snapshot.fleet.total} TOTAL)
          </Typography>

          <Grid container spacing={1.25} sx={{ mb: 1.75 }} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="mc-fleet-search"
                label="Search port, service, or category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ 'aria-label': 'Search fleet ports, services, or categories' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="mc-fleet-category"
                select
                SelectProps={{ native: true }}
                label="Fleet Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ 'aria-label': 'Filter fleet by category' }}
                sx={fieldSx}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? `All Categories (${snapshot.fleet.total})` : cat}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {[
                  { id: 'all', label: `All (${snapshot.fleet.total})` },
                  { id: 'live', label: `Live (${snapshot.fleet.live})` },
                  { id: 'dark', label: `Dark (${snapshot.fleet.dark})` },
                  { id: 'core', label: 'Core' },
                ].map((flt) => {
                  const active = statusFilter === flt.id;
                  return (
                    <Button
                      key={flt.id}
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setStatusFilter(flt.id)}
                      sx={{
                        minHeight: 44,
                        px: 1.4,
                        fontFamily: MONO,
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: active ? tk.goldBtnBg : tk.inset,
                        color: active ? tk.goldBtnInk : tk.ink,
                        borderColor: active ? tk.goldBtnBg : tk.border,
                        '&:hover': { bgcolor: active ? (isDark ? '#E5C65C' : '#5E4305') : tk.goldBg },
                      }}
                    >
                      {flt.label}
                    </Button>
                  );
                })}
              </Stack>
            </Grid>
          </Grid>

          {/* Responsive Port Grid (Zero Horizontal Overflow at 390px) */}
          <Grid container spacing={1}>
            {filteredPorts.slice(0, 36).map((p) => (
              <Grid item xs={12} sm={6} md={4} key={`${p.port}-${p.id}`}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: tk.inset,
                    border: `1px solid ${p.up ? tk.emeraldBorder : tk.borderSoft}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.45,
                    height: '100%',
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 800, color: tk.gold }}>
                      :{p.port}
                    </Typography>
                    <Chip
                      size="small"
                      label={p.up ? `LIVE · ${p.latencyMs} ms` : (p.status === 'unprobed' ? 'UNPROBED' : 'DARK')}
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.67rem',
                        fontWeight: 800,
                        bgcolor: p.up ? tk.emeraldBg : tk.card,
                        color: p.up ? tk.emerald : tk.muted,
                        border: `1px solid ${p.up ? tk.emeraldBorder : tk.borderSoft}`,
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: tk.ink, overflowWrap: 'anywhere' }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.muted, overflowWrap: 'anywhere' }}>
                    {p.category}{p.isCore ? ' · CORE' : ''}{p.tailnetOnly ? ' · TAILNET' : ''}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {filteredPorts.length > 36 && (
            <Typography sx={{ mt: 1.25, fontFamily: MONO, fontSize: '0.74rem', color: tk.muted }}>
              Showing first 36 of {filteredPorts.length} matching ports — refine search/category filter or export full 91-port CSV/JSON in Triage &amp; Exports.
            </Typography>
          )}
          {filteredPorts.length === 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              No fleet ports matched the active filter criteria.
            </Alert>
          )}
        </Box>
      )}

      {/* TAB 1: HERMES & SUBAGENT SUPERVISOR */}
      {activeTab === 1 && (
        <Box role="tabpanel" id="mc-panel-1" aria-labelledby="mc-tab-1">
          <HermesGatewayTelemetryPanel headingComponent="h3" subHeadingComponent="h4" compact />
        </Box>
      )}

      {/* TAB 2: MISSION DAG & RUNBOOK DISPATCHER */}
      {activeTab === 2 && (
        <Box role="tabpanel" id="mc-panel-2" aria-labelledby="mc-tab-2">
          <Typography
            component="h3"
            sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold, mb: 1.25, letterSpacing: '0.07em' }}
          >
            MISSION PRESETS &amp; DETERMINISTIC KAHN WAVE PLANNER
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {MISSION_PRESETS.map((preset) => {
              const active = selectedPresetId === preset.id;
              return (
                <Button
                  key={preset.id}
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => handleLoadPreset(preset)}
                  sx={{
                    minHeight: 44,
                    px: 1.5,
                    fontFamily: MONO,
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: active ? tk.goldBtnBg : tk.inset,
                    color: active ? tk.goldBtnInk : tk.ink,
                    borderColor: active ? tk.goldBtnBg : tk.border,
                    '&:hover': { bgcolor: active ? (isDark ? '#E5C65C' : '#5E4305') : tk.goldBg },
                  }}
                >
                  {preset.name}
                </Button>
              );
            })}
          </Stack>

          {/* Mission Name & PBFT Quorum Controls */}
          <Grid container spacing={1.25} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                id="mc-mission-name"
                label="Mission Runbook Name"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ 'aria-label': 'Mission runbook name' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                id="mc-pbft-n"
                label="PBFT Nodes (N)"
                type="number"
                value={pbftN}
                onChange={(e) => setPbftN(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 1, max: 1000, 'aria-label': 'PBFT total node count N' }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                id="mc-pbft-f"
                label="Byzantine Faults (f)"
                type="number"
                value={pbftF}
                onChange={(e) => setPbftF(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, max: 333, 'aria-label': 'PBFT tolerated faulty nodes f' }}
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          {/* Action Row */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleVerifyPlanServer}
              disabled={planBusy}
              startIcon={<PlayArrowIcon />}
              sx={btnPrimarySx}
            >
              {planBusy ? 'Verifying…' : 'Schedule & Verify Plan'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleCopy('plan-yaml', exportsBundle.yaml)}
              startIcon={copiedId === 'plan-yaml' ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
              sx={btnOutlinedSx}
            >
              {copiedId === 'plan-yaml' ? 'Copied Runbook YAML' : 'Copy Runbook YAML'}
            </Button>
          </Stack>

          {serverPlanMeta && (
            <Alert severity={serverPlanMeta.ok ? 'success' : 'error'} sx={{ mb: 2, fontFamily: MONO, fontSize: '0.76rem' }}>
              <strong>{serverPlanMeta.source}:</strong> {serverPlanMeta.message}
              {serverPlanMeta.receiptSha256 ? ` · SHA-256: ${serverPlanMeta.receiptSha256.slice(0, 16)}…` : ''}
            </Alert>
          )}

          {!planResult.ok ? (
            <Alert severity="error" sx={{ mb: 2, fontFamily: MONO, fontSize: '0.78rem' }}>
              {planResult.error}
            </Alert>
          ) : (
            <>
              {/* Plan KPIs & PBFT Verification */}
              <Grid container spacing={1.25} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.35, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, color: tk.muted }}>KAHN WAVES</Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.96rem', fontWeight: 800, color: tk.gold, mt: 0.25 }}>
                      {planResult.waveCount} waves · {planResult.stageCount} stages
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.35, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, color: tk.muted }}>CRITICAL PATH</Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.96rem', fontWeight: 800, color: tk.sky, mt: 0.25 }}>
                      {planResult.criticalPathMs} ms ({planResult.parallelSpeedup}x)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.35, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, color: tk.muted }}>FLEET READINESS</Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.96rem', fontWeight: 800, color: planResult.readinessScore >= 80 ? tk.emerald : tk.amber, mt: 0.25 }}>
                      {planResult.readinessScore}% ({planResult.readyStages}/{planResult.stageCount})
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 1.35, borderRadius: 1.5, bgcolor: planResult.pbft.quorumSafe ? tk.emeraldBg : tk.redBg, border: `1px solid ${planResult.pbft.quorumSafe ? tk.emeraldBorder : tk.redBorder}` }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, color: planResult.pbft.quorumSafe ? tk.emerald : tk.red }}>
                      PBFT QUORUM ({planResult.pbft.quorumSafe ? 'SAFE' : 'UNSAFE'})
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.8rem', fontWeight: 800, color: tk.ink, mt: 0.25 }}>
                      {planResult.pbft.safetyFormula}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Wave Timeline */}
              <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                {planResult.waves.map((w) => (
                  <Box key={w.wave} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: tk.gold }}>
                        WAVE {w.wave} · {w.stages.length} PARALLEL STAGE(S)
                      </Typography>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                        Wave Ceiling: {w.waveLatencyMs} ms
                      </Typography>
                    </Box>
                    <Grid container spacing={1}>
                      {w.stages.map((st) => {
                        const onCrit = planResult.criticalPathStageIds.includes(st.id);
                        const ready = st.readiness?.up;
                        return (
                          <Grid item xs={12} sm={6} key={st.id}>
                            <Box
                              sx={{
                                p: 1.2,
                                borderRadius: 1.25,
                                bgcolor: tk.card,
                                border: `1px solid ${onCrit ? tk.goldBorder : tk.borderSoft}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: 1,
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.ink, overflowWrap: 'anywhere' }}>
                                  {st.name} <code>({st.id})</code>
                                </Typography>
                                <Typography sx={{ fontFamily: MONO, fontSize: '0.69rem', color: tk.muted, mt: 0.3, overflowWrap: 'anywhere' }}>
                                  {st.port ? `Port :${st.port}` : 'Local stage'} · {st.estimatedMs} ms · {st.readiness?.status}
                                  {onCrit ? ' · CRITICAL PATH' : ''}
                                </Typography>
                              </Box>
                              <Button
                                variant="outlined"
                                aria-label={`Remove stage ${st.id}`}
                                onClick={() => handleRemoveStage(st.id)}
                                disabled={stages.length <= 1}
                                sx={{
                                  minWidth: 44,
                                  minHeight: 44,
                                  p: 0.5,
                                  color: ready ? tk.muted : tk.red,
                                  borderColor: tk.borderSoft,
                                  '&.Mui-disabled': {
                                    color: tk.muted,
                                    borderColor: tk.borderSoft,
                                    opacity: 0.8,
                                  },
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </Button>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          {/* Add Custom Stage Form */}
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}` }}>
            <Typography component="h4" sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 800, color: tk.ink, mb: 1.25 }}>
              ADD CUSTOM MISSION STAGE
            </Typography>
            <Grid container spacing={1.25} alignItems="center">
              <Grid item xs={12} sm={4} md={2.5}>
                <TextField
                  id="mc-stage-id"
                  label="Stage ID"
                  placeholder="audit-gate"
                  value={newStageId}
                  onChange={(e) => setNewStageId(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 'aria-label': 'New mission stage identifier' }}
                  sx={stageFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={8} md={3}>
                <TextField
                  id="mc-stage-name"
                  label="Stage Name"
                  placeholder="Verify Checksums"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 'aria-label': 'New mission stage display name' }}
                  sx={stageFieldSx}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={1.75}>
                <TextField
                  id="mc-stage-port"
                  label="Port (opt)"
                  placeholder="8094"
                  value={newStagePort}
                  onChange={(e) => setNewStagePort(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 'aria-label': 'Optional loopback port for new stage' }}
                  sx={stageFieldSx}
                />
              </Grid>
              <Grid item xs={6} sm={4} md={1.5}>
                <TextField
                  id="mc-stage-ms"
                  label="Est ms"
                  value={newStageMs}
                  onChange={(e) => setNewStageMs(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 'aria-label': 'Estimated stage duration in milliseconds' }}
                  sx={stageFieldSx}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <TextField
                  id="mc-stage-deps"
                  label="Depends On (csv)"
                  placeholder="hub-check"
                  value={newStageDeps}
                  onChange={(e) => setNewStageDeps(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ 'aria-label': 'Comma-separated stage dependencies' }}
                  sx={stageFieldSx}
                />
              </Grid>
              <Grid item xs={12} md={1.25}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddStage}
                  startIcon={<AddIcon />}
                  sx={btnPrimarySx}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* TAB 3: INCIDENT TRIAGE & FORMULA-SAFE EXPORTS */}
      {activeTab === 3 && (
        <Box role="tabpanel" id="mc-panel-3" aria-labelledby="mc-tab-3">
          <Typography
            component="h3"
            sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold, mb: 1.25, letterSpacing: '0.07em' }}
          >
            RANKED INCIDENT TRIAGE ({snapshot.triage.length})
          </Typography>

          <Stack spacing={1} sx={{ mb: 2.5 }}>
            {snapshot.triage.length === 0 ? (
              <Alert severity="success" sx={{ fontFamily: MONO, fontSize: '0.78rem' }}>
                Zero active incidents or advisories detected across monitored loopback surfaces.
              </Alert>
            ) : (
              snapshot.triage.map((inc) => {
                const isCrit = inc.severity === 'critical';
                const isWarn = inc.severity === 'warning';
                return (
                  <Box
                    key={inc.id}
                    sx={{
                      p: 1.4,
                      borderRadius: 1.5,
                      bgcolor: isCrit ? tk.redBg : isWarn ? tk.amberBg : tk.inset,
                      border: `1px solid ${isCrit ? tk.redBorder : isWarn ? tk.amberBorder : tk.borderSoft}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.4 }}>
                      <WarningAmberIcon sx={{ fontSize: 16, color: isCrit ? tk.red : isWarn ? tk.amber : tk.sky }} />
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 800, color: isCrit ? tk.red : isWarn ? tk.amber : tk.sky }}>
                        [{String(inc.severity).toUpperCase()}] {inc.source} — {inc.title}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.8rem', color: tk.ink, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                      {inc.detail}
                    </Typography>
                    {inc.remediation && (
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted, mt: 0.45, overflowWrap: 'anywhere' }}>
                        Remediation: {inc.remediation}
                      </Typography>
                    )}
                  </Box>
                );
              })
            )}
          </Stack>

          {/* Formula-Safe Export Suite */}
          <Typography
            component="h3"
            sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 800, color: tk.gold, mb: 1, letterSpacing: '0.07em' }}
          >
            FORMULA-SAFE EXPORTS &amp; FIPS 180-4 SHA-256 RECEIPT
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted, mb: 1.5, overflowWrap: 'anywhere' }}>
            Bundle SHA-256: <code>{exportsBundle.receiptSha256}</code> · Snapshot SHA-256: <code>{snapshot.receiptSha256}</code>
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {[
              { key: 'json', label: 'JSON', ext: 'json', mime: 'application/json;charset=utf-8' },
              { key: 'markdown', label: 'Markdown', ext: 'md', mime: 'text/markdown;charset=utf-8' },
              { key: 'csv', label: 'CSV', ext: 'csv', mime: 'text/csv;charset=utf-8' },
              { key: 'yaml', label: 'Runbook YAML', ext: 'yaml', mime: 'text/yaml;charset=utf-8' },
            ].map((fmt) => (
              <Button
                key={fmt.key}
                variant={exportFormat === fmt.key ? 'contained' : 'outlined'}
                onClick={() => setExportFormat(fmt.key)}
                sx={exportFormat === fmt.key ? btnPrimarySx : btnOutlinedSx}
              >
                Preview {fmt.label}
              </Button>
            ))}
            <Button
              variant="outlined"
              onClick={() => handleCopy(`exp-${exportFormat}`, exportsBundle[exportFormat])}
              startIcon={copiedId === `exp-${exportFormat}` ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
              sx={btnOutlinedSx}
            >
              {copiedId === `exp-${exportFormat}` ? 'Copied' : `Copy ${exportFormat.toUpperCase()}`}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const extMap = { json: 'json', markdown: 'md', csv: 'csv', yaml: 'yaml' };
                const mimeMap = {
                  json: 'application/json;charset=utf-8',
                  markdown: 'text/markdown;charset=utf-8',
                  csv: 'text/csv;charset=utf-8',
                  yaml: 'text/yaml;charset=utf-8',
                };
                downloadTextFile(`zoth-mission-control-${stamp}.${extMap[exportFormat]}`, exportsBundle[exportFormat], mimeMap[exportFormat]);
              }}
              startIcon={<DownloadIcon />}
              sx={btnOutlinedSx}
            >
              Download {exportFormat.toUpperCase()}
            </Button>
          </Stack>

          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: tk.codeBg,
              border: `1px solid ${tk.borderSoft}`,
              fontFamily: MONO,
              fontSize: '0.74rem',
              lineHeight: 1.55,
              color: tk.ink,
              maxHeight: 360,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {exportsBundle[exportFormat]}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
