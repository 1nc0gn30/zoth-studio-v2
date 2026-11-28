import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import HubIcon from '@mui/icons-material/Hub';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import {
  DEFAULT_RECALL_WEIGHTS,
  DEFAULT_STDP_PARAMS,
  NETRUNNER_MEMORY_SCHEMA_VERSION,
  NEUROMODULATOR_PROFILES,
  buildOfflineNetrunnerMemorySnapshot,
  computeAssociativeTrace,
  computeEbbinghausRetention,
  computeStdpDelta,
  evaluateNetrunnerMemory,
  formatNetrunnerMemoryExports,
  runHybridRecall,
  sampleRetentionCurve,
  sampleStdpCurve,
  synthesizeMemoryPlaybooks,
} from '../../utils/netrunnerMemoryEngine';

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

const QUICK_RECALL_PRESETS = [
  'stdp loopback recall',
  'security egress guard',
  'sqlite wal zero egress',
  'ca3 associative dopamine',
  'voice telemetry 8094',
];

/**
 * Lucy Netrunner Memory Hub (v2.4.0)
 * Pure-MUI Dual-Theme Workstation (Editorial Ivory Light + Obsidian Gold Dark).
 *
 * Strictly read-only loopback bridge to 127.0.0.1:8094 via /api/studio/netrunner-memory,
 * deterministic Asymmetric Hebbian STDP (Δw(0) = 0), Ebbinghaus retention & neuromodulator lab,
 * real BM25 + hashed n-gram cosine + salience hybrid recall, CA3/CA1 multi-hop synaptic graph,
 * copy-only safe CLI playbooks, and formula-safe SHA-256 verified exports.
 */
export default function NetrunnerMemoryHubGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
        bg: '#0B0D12',
        card: '#12151E',
        inset: '#171B26',
        svgBg: '#0E1118',
        svgGrid: 'rgba(245, 242, 234, 0.12)',
        svgAxis: 'rgba(245, 242, 234, 0.35)',
        ink: '#F5F2EA',
        muted: '#B4BAC6',
        border: 'rgba(212, 175, 55, 0.28)',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        gold: '#E5C65C',
        goldBg: '#2A220B',
        goldBorder: '#9A781A',
        goldBtnBg: '#D4AF37',
        goldBtnInk: '#0B0D12',
        emerald: '#4ADE80',
        emeraldBg: '#0F261A',
        emeraldBorder: '#1E6B42',
        amber: '#FBBF24',
        amberBg: '#2B1F09',
        amberBorder: '#8A6312',
        sky: '#7DD3FC',
        skyBg: '#0E2233',
        skyBorder: '#235B85',
        violet: '#D8B4FE',
        violetBg: '#251538',
        violetBorder: '#6B3FA0',
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
      svgBg: '#F6F2E8',
      svgGrid: 'rgba(16, 24, 40, 0.12)',
      svgAxis: 'rgba(16, 24, 40, 0.42)',
      ink: '#101828',
      muted: '#475467',
      border: '#D8CEB6',
      borderSoft: '#E4DCCB',
      gold: '#7A5600',
      goldBg: '#F6EED6',
      goldBorder: '#C7A95A',
      goldBtnBg: '#7A5600',
      goldBtnInk: '#FFFFFF',
      emerald: '#0B5E38',
      emeraldBg: '#E6F5EC',
      emeraldBorder: '#8CC9A7',
      amber: '#7C4A03',
      amberBg: '#FDF2DC',
      amberBorder: '#DFB66A',
      sky: '#0E4F7A',
      skyBg: '#E6F2FA',
      skyBorder: '#94C2E0',
      violet: '#5B21B6',
      violetBg: '#F3EEFC',
      violetBorder: '#C4B5FD',
      red: '#991B1B',
      redBg: '#FEF2F2',
      redBorder: '#F3B4B4',
      codeBg: '#F4EFE4',
    };
  }, [isDark]);

  const categoryColor = useCallback(
    (cat) => {
      const c = String(cat || '').toLowerCase();
      if (c.includes('security') || c.includes('egress')) return tk.red;
      if (c.includes('arch') || c.includes('proc')) return tk.gold;
      if (c.includes('semantic') || c.includes('insight')) return tk.violet;
      if (c.includes('voice') || c.includes('achieve')) return tk.emerald;
      return tk.sky;
    },
    [tk],
  );

  const [activeTab, setActiveTab] = useState(0);
  const [snapshot, setSnapshot] = useState(() => buildOfflineNetrunnerMemorySnapshot());
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // Selected graph node for CA3/CA1 associative inspection
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [maxHops, setMaxHops] = useState(2);

  // STDP & Neuromodulator Lab controls
  const [deltaTMs, setDeltaTMs] = useState(12);
  const [aPlus, setAPlus] = useState(DEFAULT_STDP_PARAMS.aPlus);
  const [aMinus, setAMinus] = useState(DEFAULT_STDP_PARAMS.aMinus);
  const [tauPlusMs, setTauPlusMs] = useState(DEFAULT_STDP_PARAMS.tauPlusMs);
  const [tauMinusMs, setTauMinusMs] = useState(DEFAULT_STDP_PARAMS.tauMinusMs);
  const [initialWeight, setInitialWeight] = useState(0.5);
  const [neuromodulator, setNeuromodulator] = useState('balanced');
  const [ageHours, setAgeHours] = useState(24);
  const [stabilityHours, setStabilityHours] = useState(72);
  const [accessCount, setAccessCount] = useState(3);
  const [serverVerify, setServerVerify] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Hybrid Recall controls
  const [recallQuery, setRecallQuery] = useState('stdp loopback recall');
  const [wBm25, setWBm25] = useState(DEFAULT_RECALL_WEIGHTS.bm25);
  const [wCosine, setWCosine] = useState(DEFAULT_RECALL_WEIGHTS.cosine);
  const [wSalience, setWSalience] = useState(DEFAULT_RECALL_WEIGHTS.salience);

  const fetchLiveSnapshot = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh
        ? '/api/studio/netrunner-memory?refresh=1'
        : '/api/studio/netrunner-memory';
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data && data.ok && data.summary) {
        setSnapshot(data);
        if (Array.isArray(data.graph?.nodes) && data.graph.nodes.length > 0) {
          const topHub = [...data.graph.nodes].sort(
            (a, b) => (b.degree - a.degree) || (b.importance - a.importance),
          )[0];
          setSelectedNodeId((prev) =>
            data.graph.nodes.some((n) => n.id === prev) ? prev : (topHub?.id || data.graph.nodes[0].id),
          );
        }
      }
    } catch {
      setSnapshot((prev) =>
        prev.mode === 'LIVE_LOOPBACK' ? prev : buildOfflineNetrunnerMemorySnapshot(),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSnapshot(false);
  }, [fetchLiveSnapshot]);

  const effectiveSeedId = useMemo(() => {
    const nodes = snapshot.graph?.nodes || [];
    if (selectedNodeId && nodes.some((n) => n.id === selectedNodeId)) return selectedNodeId;
    const topHub = [...nodes].sort(
      (a, b) => (b.degree - a.degree) || (b.importance - a.importance),
    )[0];
    return topHub?.id || nodes[0]?.id || '';
  }, [snapshot.graph, selectedNodeId]);

  const stdpResult = useMemo(
    () =>
      computeStdpDelta(deltaTMs, {
        aPlus,
        aMinus,
        tauPlusMs,
        tauMinusMs,
        initialWeight,
        neuromodulator,
      }),
    [deltaTMs, aPlus, aMinus, tauPlusMs, tauMinusMs, initialWeight, neuromodulator],
  );

  const stdpCurve = useMemo(
    () =>
      sampleStdpCurve({
        aPlus,
        aMinus,
        tauPlusMs,
        tauMinusMs,
        neuromodulator,
        stepMs: 5,
      }),
    [aPlus, aMinus, tauPlusMs, tauMinusMs, neuromodulator],
  );

  const retentionResult = useMemo(
    () =>
      computeEbbinghausRetention({
        ageHours,
        stabilityHours,
        accessCount,
        neuromodulator,
      }),
    [ageHours, stabilityHours, accessCount, neuromodulator],
  );

  const retentionCurve = useMemo(
    () =>
      sampleRetentionCurve({
        stabilityHours,
        accessCount,
        neuromodulator,
        maxHours: 168,
      }),
    [stabilityHours, accessCount, neuromodulator],
  );

  const recallResult = useMemo(
    () =>
      runHybridRecall(snapshot.engrams || [], {
        query: recallQuery,
        weights: { bm25: wBm25, cosine: wCosine, salience: wSalience },
        neuromodulator,
        stabilityHours,
        limit: 12,
      }),
    [snapshot.engrams, recallQuery, wBm25, wCosine, wSalience, neuromodulator, stabilityHours],
  );

  const associativeTrace = useMemo(
    () =>
      computeAssociativeTrace(snapshot.graph, {
        seedNodeId: effectiveSeedId,
        maxHops,
      }),
    [snapshot.graph, effectiveSeedId, maxHops],
  );

  const clientEvaluation = useMemo(
    () =>
      evaluateNetrunnerMemory(
        {
          deltaTMs,
          aPlus,
          aMinus,
          tauPlusMs,
          tauMinusMs,
          initialWeight,
          neuromodulator,
          ageHours,
          stabilityHours,
          accessCount,
          query: recallQuery,
          weights: { bm25: wBm25, cosine: wCosine, salience: wSalience },
          seedNodeId: effectiveSeedId,
          maxHops,
        },
        snapshot,
      ),
    [
      deltaTMs,
      aPlus,
      aMinus,
      tauPlusMs,
      tauMinusMs,
      initialWeight,
      neuromodulator,
      ageHours,
      stabilityHours,
      accessCount,
      recallQuery,
      wBm25,
      wCosine,
      wSalience,
      effectiveSeedId,
      maxHops,
      snapshot,
    ],
  );

  const playbooks = useMemo(
    () => synthesizeMemoryPlaybooks({ query: recallQuery, limit: 12 }),
    [recallQuery],
  );

  const exportsBundle = useMemo(
    () => formatNetrunnerMemoryExports(snapshot, clientEvaluation, playbooks),
    [snapshot, clientEvaluation, playbooks],
  );

  const handleCopy = useCallback(async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((curr) => (curr === id ? '' : curr)), 1800);
  }, []);

  const handleServerVerify = useCallback(async () => {
    setVerifying(true);
    try {
      const resp = await fetch('/api/studio/netrunner-memory/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          deltaTMs,
          aPlus,
          aMinus,
          tauPlusMs,
          tauMinusMs,
          initialWeight,
          neuromodulator,
          ageHours,
          stabilityHours,
          accessCount,
          query: recallQuery,
          weights: { bm25: wBm25, cosine: wCosine, salience: wSalience },
          seedNodeId: effectiveSeedId,
          maxHops,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setServerVerify({
        ok: true,
        receiptSha256: data.receiptSha256,
        deltaW: data.stdp?.deltaW,
        deltaWAtZero: data.deltaWAtZero,
        source: data.source || 'studio-loopback-api',
      });
    } catch {
      setServerVerify({
        ok: false,
        receiptSha256: clientEvaluation.receiptSha256,
        deltaW: stdpResult.deltaW,
        deltaWAtZero: 0,
        source: 'browser-deterministic-engine',
      });
    } finally {
      setVerifying(false);
    }
  }, [
    deltaTMs,
    aPlus,
    aMinus,
    tauPlusMs,
    tauMinusMs,
    initialWeight,
    neuromodulator,
    ageHours,
    stabilityHours,
    accessCount,
    recallQuery,
    wBm25,
    wCosine,
    wSalience,
    effectiveSeedId,
    maxHops,
    clientEvaluation.receiptSha256,
    stdpResult.deltaW,
  ]);

  const isLive = snapshot.mode === 'LIVE_LOOPBACK' && snapshot.daemonOnline;
  const activeNodeMap = useMemo(
    () => new Map((associativeTrace.nodes || []).map((n) => [n.id, n])),
    [associativeTrace.nodes],
  );
  const selectedGraphNode = useMemo(
    () => (snapshot.graph?.nodes || []).find((n) => n.id === effectiveSeedId) || null,
    [snapshot.graph, effectiveSeedId],
  );

  // STDP SVG curve path coordinates (viewBox 0 0 560 220)
  const stdpSvgData = useMemo(() => {
    const xOf = (dt) => 44 + ((dt + 100) / 200) * 484;
    const maxAmp = Math.max(1.2, aPlus * 1.5, aMinus * 1.5);
    const yOf = (dw) => 110 - (dw / maxAmp) * 86;
    const ltdPts = stdpCurve.filter((p) => p.deltaTMs < 0);
    const ltpPts = stdpCurve.filter((p) => p.deltaTMs > 0);
    const toPath = (pts) =>
      pts
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xOf(p.deltaTMs).toFixed(1)} ${yOf(p.deltaW).toFixed(1)}`)
        .join(' ');
    return {
      xOf,
      yOf,
      ltdPath: toPath(ltdPts),
      ltpPath: toPath(ltpPts),
      markerX: xOf(stdpResult.deltaTMs),
      markerY: yOf(stdpResult.deltaW),
      zeroX: xOf(0),
      zeroY: yOf(0),
    };
  }, [stdpCurve, aPlus, aMinus, stdpResult.deltaTMs, stdpResult.deltaW]);

  // Ebbinghaus Retention SVG path (viewBox 0 0 560 190)
  const retentionSvgData = useMemo(() => {
    const xOf = (h) => 44 + (h / 168) * 484;
    const yOf = (r) => 160 - r * 132;
    const path = retentionCurve
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xOf(p.ageHours).toFixed(1)} ${yOf(p.retention).toFixed(1)}`)
      .join(' ');
    const clampedAge = Math.min(168, Math.max(0, ageHours));
    return {
      path,
      markerX: xOf(clampedAge),
      markerY: yOf(retentionResult.retention),
      halfLifeX: retentionResult.halfLifeHours <= 168 ? xOf(retentionResult.halfLifeHours) : null,
    };
  }, [retentionCurve, ageHours, retentionResult.retention, retentionResult.halfLifeHours]);

  const topCategories = (snapshot.categories || []).slice(0, 8);
  const maxCatCount = Math.max(1, ...topCategories.map((c) => c.count));

  return (
    <Box
      sx={{
        bgcolor: tk.bg,
        color: tk.ink,
        borderRadius: 2.5,
        border: `1px solid ${tk.border}`,
        p: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {/* Top Status & Refresh Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 2,
          borderBottom: `1px solid ${tk.borderSoft}`,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Chip
              size="small"
              icon={<HubIcon sx={{ color: `${isLive ? tk.emerald : tk.amber} !important`, fontSize: 16 }} />}
              label={
                isLive
                  ? 'LIVE_LOOPBACK · READ-ONLY :8094 BRIDGE'
                  : 'BROWSER_OFFLINE_FALLBACK · CURATED CORTEX'
              }
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: isLive ? tk.emeraldBg : tk.amberBg,
                color: isLive ? tk.emerald : tk.amber,
                border: `1px solid ${isLive ? tk.emeraldBorder : tk.amberBorder}`,
                height: 28,
              }}
            />
            <Chip
              size="small"
              icon={<VerifiedUserIcon sx={{ color: `${tk.sky} !important`, fontSize: 15 }} />}
              label="READ-ONLY · ZERO WRITES TO :8094"
              sx={{
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: tk.skyBg,
                color: tk.sky,
                border: `1px solid ${tk.skyBorder}`,
                height: 28,
              }}
            />
            <Chip
              size="small"
              label={`SCHEMA v${NETRUNNER_MEMORY_SCHEMA_VERSION}`}
              sx={{
                fontFamily: MONO,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: tk.goldBg,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
                height: 28,
              }}
            />
          </Box>

          <Typography
            component="h3"
            sx={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              color: tk.ink,
              lineHeight: 1.25,
            }}
          >
            Lucy Netrunner Memory Hub — STDP Cortex &amp; Hybrid Recall Workbench
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: tk.muted, mt: 0.35 }}>
            Read-only loopback telemetry over 127.0.0.1:8094 paired with deterministic Asymmetric Hebbian STDP (Δw(0)=0), BM25 + hashed n-gram cosine recall, CA3/CA1 multi-hop topology, and SHA-256 verified exports.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          disabled={loading}
          onClick={() => fetchLiveSnapshot(true)}
          sx={{
            minHeight: 44,
            px: 2,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: '0.78rem',
            bgcolor: tk.goldBtnBg,
            color: tk.goldBtnInk,
            '&:hover': { bgcolor: tk.goldBtnBg, opacity: 0.92 },
          }}
        >
          {loading ? 'Probing :8094...' : 'Refresh Read-Only Probes'}
        </Button>
      </Box>

      {/* Honest Offline Banner when static or daemon unreachable */}
      {!isLive && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            bgcolor: tk.amberBg,
            color: tk.amber,
            border: `1px solid ${tk.amberBorder}`,
            '& .MuiAlert-icon': { color: tk.amber },
          }}
        >
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: tk.ink }}>
            {snapshot.offlineNotice ||
              'Local Neuro-Memory Daemon (:8094) is currently unreachable. Running deterministic BROWSER_OFFLINE_FALLBACK corpus with full STDP, BM25/cosine recall, CA3/CA1 graph explorer, and SHA-256 exports.'}
          </Typography>
        </Alert>
      )}

      {/* KPI Strip */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {[
          {
            label: 'TOTAL CORTEX ENGRAMS',
            value: Number(snapshot.summary?.totalMemories ?? 0).toLocaleString(),
            sub: `${snapshot.summary?.sampledMemories ?? 0} sampled read-only · avg importance ${snapshot.summary?.averageImportance ?? 0}`,
            accent: tk.gold,
          },
          {
            label: 'SYNAPTIC CONNECTIONS',
            value: Number(snapshot.summary?.totalSynapses ?? 0).toLocaleString(),
            sub: `Density ${snapshot.summary?.synapticDensity ?? 0} edges/engram · ${snapshot.summary?.graphNodes ?? 0} plotted nodes`,
            accent: tk.emerald,
          },
          {
            label: 'MEMORY CATEGORIES',
            value: String(snapshot.summary?.categoryCount ?? 0),
            sub: `Avg accesses ${snapshot.summary?.averageAccesses ?? 0} · working memory ${snapshot.summary?.workingMemoryUsage ?? 0}`,
            accent: tk.violet,
          },
          {
            label: 'LOOPBACK DAEMON (:8094)',
            value: snapshot.daemonOnline ? `ONLINE v${snapshot.health?.version || '0.1.0'}` : 'OFFLINE FALLBACK',
            sub: snapshot.daemonOnline
              ? `GET /health ${snapshot.probes?.health?.latencyMs ?? 1}ms · GET /api/stats ${snapshot.probes?.stats?.latencyMs ?? 1}ms`
              : '100% client-side STDP & recall active',
            accent: tk.sky,
          },
        ].map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.label}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                height: '100%',
                bgcolor: tk.card,
                border: `1px solid ${tk.borderSoft}`,
                borderRadius: 2,
              }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.muted, letterSpacing: '0.06em' }}>
                {kpi.label}
              </Typography>
              <Typography sx={{ fontFamily: DISPLAY, fontSize: '1.35rem', fontWeight: 700, color: kpi.accent, mt: 0.4 }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: tk.muted, mt: 0.35 }}>
                {kpi.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 4 Clean Tabs — Zero Desktop Clipping, >= 44px Tap Targets */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: tk.card,
          border: `1px solid ${tk.borderSoft}`,
          borderRadius: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Lucy Netrunner Memory Hub sections"
          sx={{
            px: 1,
            borderBottom: `1px solid ${tk.borderSoft}`,
            '& .MuiTabs-indicator': { backgroundColor: tk.gold, height: 3 },
            '& .MuiTab-root': {
              minHeight: 48,
              fontFamily: MONO,
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'none',
              color: tk.muted,
              '&.Mui-selected': { color: tk.gold },
            },
          }}
        >
          <Tab icon={<HubIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Live Cortex Telemetry" />
          <Tab icon={<TimelineIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="STDP & Neuromodulator Lab" />
          <Tab icon={<SearchIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Hybrid Recall & Graph Explorer" />
          <Tab icon={<TerminalIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Playbooks & Verified Exports" />
        </Tabs>

        <Box sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          {/* TAB 0: LIVE CORTEX TELEMETRY */}
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} lg={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tk.inset,
                    border: `1px solid ${tk.borderSoft}`,
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
                    <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink }}>
                      Dual-Theme Synaptic Constellation ({snapshot.graph?.nodes?.length ?? 0} nodes · {snapshot.graph?.edges?.length ?? 0} edges)
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                      Click any node to inspect CA3/CA1 neighborhood
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      border: `1px solid ${tk.border}`,
                      bgcolor: tk.svgBg,
                    }}
                  >
                    <svg
                      viewBox="0 0 640 340"
                      role="img"
                      aria-label="Synaptic constellation graph showing engram clusters and weighted edges"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    >
                      <rect x="0" y="0" width="640" height="340" fill={tk.svgBg} />
                      {/* Concentric semantic orbit guides */}
                      <ellipse cx="320" cy="170" rx="240" ry="126" fill="none" stroke={tk.svgGrid} strokeDasharray="4 4" />
                      <ellipse cx="320" cy="170" rx="150" ry="78" fill="none" stroke={tk.svgGrid} strokeDasharray="4 4" />
                      <circle cx="320" cy="170" r="24" fill={tk.goldBg} stroke={tk.gold} strokeWidth="1.5" />
                      <text
                        x="320"
                        y="174"
                        textAnchor="middle"
                        fill={tk.gold}
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="700"
                      >
                        LUCY
                      </text>

                      {/* Weighted synaptic edges */}
                      {(snapshot.graph?.edges || []).map((e, idx) => {
                        const sNode = (snapshot.graph?.nodes || []).find((n) => n.id === e.source);
                        const tNode = (snapshot.graph?.nodes || []).find((n) => n.id === e.target);
                        if (!sNode || !tNode) return null;
                        const isTraceEdge =
                          activeNodeMap.has(e.source) && activeNodeMap.has(e.target);
                        return (
                          <line
                            key={`${e.source}-${e.target}-${idx}`}
                            x1={sNode.x}
                            y1={sNode.y}
                            x2={tNode.x}
                            y2={tNode.y}
                            stroke={isTraceEdge ? tk.gold : tk.svgAxis}
                            strokeOpacity={isTraceEdge ? 0.85 : 0.28}
                            strokeWidth={isTraceEdge ? 1.8 : 1}
                          />
                        );
                      })}

                      {/* Engram nodes */}
                      {(snapshot.graph?.nodes || []).map((n) => {
                        const isSelected = n.id === effectiveSeedId;
                        const traceHit = activeNodeMap.get(n.id);
                        const col = categoryColor(n.category);
                        const radius = isSelected ? 9 : traceHit ? 7 : 4.5 + n.importance * 3;
                        return (
                          <g
                            key={n.id}
                            onClick={() => setSelectedNodeId(n.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {isSelected && (
                              <circle
                                cx={n.x}
                                cy={n.y}
                                r={14}
                                fill="none"
                                stroke={tk.gold}
                                strokeWidth="2"
                              />
                            )}
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={radius}
                              fill={col}
                              stroke={tk.card}
                              strokeWidth="1.5"
                            />
                            <title>{`${n.shortId} [${n.category}] (imp ${n.importance}): ${n.label}`}</title>
                          </g>
                        );
                      })}
                    </svg>
                  </Box>

                  {selectedGraphNode && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        bgcolor: tk.card,
                        border: `1px solid ${tk.borderSoft}`,
                        borderRadius: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.gold }}>
                          SELECTED NODE · {selectedGraphNode.shortId} ({selectedGraphNode.category})
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                          Importance {selectedGraphNode.importance} · Degree {selectedGraphNode.degree} · CA3 Coherence {associativeTrace.ca3Coherence}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.84rem', color: tk.ink, lineHeight: 1.55 }}>
                        {selectedGraphNode.label}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: tk.inset,
                    border: `1px solid ${tk.borderSoft}`,
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}>
                    Category Distribution ({snapshot.summary?.categoryCount ?? 0} strata)
                  </Typography>
                  <Stack spacing={1.25}>
                    {topCategories.map((cat) => {
                      const pct = Math.min(100, Math.max(4, Math.round((cat.count / maxCatCount) * 100)));
                      const barCol = categoryColor(cat.name);
                      return (
                        <Box key={cat.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: tk.ink }}>
                              {cat.name}
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.muted }}>
                              {cat.count.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            aria-label={`${cat.name} engram share`}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: tk.card,
                              border: `1px solid ${tk.borderSoft}`,
                              '& .MuiLinearProgress-bar': { bgcolor: barCol },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${tk.borderSoft}` }}>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.muted, mb: 0.75 }}>
                      READ-ONLY LOOPBACK PROBE RECEIPT
                    </Typography>
                    <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.ink, wordBreak: 'break-all' }}>
                      SHA-256: {snapshot.receiptSha256}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Read-Only Engram Sample */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                  <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}>
                    Recent Sampled Engrams ({(snapshot.engrams || []).length} read-only records)
                  </Typography>
                  <Grid container spacing={1.25}>
                    {(snapshot.engrams || []).slice(0, 6).map((eng) => (
                      <Grid item xs={12} md={6} key={eng.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            bgcolor: tk.card,
                            border: `1px solid ${tk.borderSoft}`,
                            borderRadius: 1.5,
                            height: '100%',
                          }}
                        >
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mb: 0.6 }}>
                            <Chip
                              size="small"
                              label={`${eng.shortId} · ${eng.category}`}
                              sx={{
                                fontFamily: MONO,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: tk.goldBg,
                                color: tk.gold,
                                border: `1px solid ${tk.goldBorder}`,
                                height: 24,
                              }}
                            />
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.muted }}>
                              imp {eng.importance} · {eng.synapseCount} syn · {eng.ageHours}h
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.82rem', color: tk.ink, lineHeight: 1.55 }}>
                            {eng.text}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: STDP & NEUROMODULATOR LAB */}
          {activeTab === 1 && (
            <Stack spacing={2}>
              {/* Neuromodulator Presets */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1 }}>
                  Neuromodulator Gain Profile
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
                  {NEUROMODULATOR_PROFILES.map((prof) => {
                    const active = neuromodulator === prof.id;
                    return (
                      <Button
                        key={prof.id}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => setNeuromodulator(prof.id)}
                        sx={{
                          minHeight: 44,
                          px: 1.75,
                          fontFamily: MONO,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: active ? tk.goldBtnBg : tk.card,
                          color: active ? tk.goldBtnInk : tk.ink,
                          borderColor: active ? tk.goldBtnBg : tk.border,
                          '&:hover': { bgcolor: active ? tk.goldBtnBg : tk.goldBg, borderColor: tk.gold },
                        }}
                      >
                        {prof.label}
                      </Button>
                    );
                  })}
                </Box>
                <Typography sx={{ fontSize: '0.84rem', color: tk.muted }}>
                  {(NEUROMODULATOR_PROFILES.find((p) => p.id === neuromodulator) || NEUROMODULATOR_PROFILES[0]).summary}
                </Typography>
              </Paper>

              <Grid container spacing={2}>
                {/* Asymmetric STDP Curve & Controls */}
                <Grid item xs={12} lg={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                      <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink }}>
                        Asymmetric Hebbian STDP Curve (Δw(0) = 0)
                      </Typography>
                      <Chip
                        size="small"
                        label={`${stdpResult.regime} · Δw = ${stdpResult.deltaW >= 0 ? '+' : ''}${stdpResult.deltaW}`}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor:
                            stdpResult.regime === 'LTP'
                              ? tk.emeraldBg
                              : stdpResult.regime === 'LTD'
                              ? tk.redBg
                              : tk.goldBg,
                          color:
                            stdpResult.regime === 'LTP'
                              ? tk.emerald
                              : stdpResult.regime === 'LTD'
                              ? tk.red
                              : tk.gold,
                          border: `1px solid ${
                            stdpResult.regime === 'LTP'
                              ? tk.emeraldBorder
                              : stdpResult.regime === 'LTD'
                              ? tk.redBorder
                              : tk.goldBorder
                          }`,
                        }}
                      />
                    </Box>

                    <Box sx={{ bgcolor: tk.svgBg, border: `1px solid ${tk.border}`, borderRadius: 1.5, mb: 1.5 }}>
                      <svg
                        viewBox="0 0 560 220"
                        role="img"
                        aria-label="Asymmetric Hebbian STDP curve from -100ms to +100ms with neutral point at 0ms"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      >
                        <rect x="0" y="0" width="560" height="220" fill={tk.svgBg} />
                        {/* Axes */}
                        <line x1="44" y1="110" x2="528" y2="110" stroke={tk.svgAxis} strokeWidth="1.2" />
                        <line x1={stdpSvgData.zeroX} y1="18" x2={stdpSvgData.zeroX} y2="200" stroke={tk.svgAxis} strokeWidth="1.2" strokeDasharray="4 4" />
                        {/* LTD & LTP curves */}
                        <path d={stdpSvgData.ltdPath} fill="none" stroke={tk.red} strokeWidth="2.6" />
                        <path d={stdpSvgData.ltpPath} fill="none" stroke={tk.emerald} strokeWidth="2.6" />
                        {/* Neutral origin Δw(0) = 0 */}
                        <circle cx={stdpSvgData.zeroX} cy={stdpSvgData.zeroY} r="4.5" fill={tk.card} stroke={tk.gold} strokeWidth="2" />
                        {/* Active Δt marker */}
                        <line
                          x1={stdpSvgData.markerX}
                          y1="110"
                          x2={stdpSvgData.markerX}
                          y2={stdpSvgData.markerY}
                          stroke={tk.gold}
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle cx={stdpSvgData.markerX} cy={stdpSvgData.markerY} r="6.5" fill={tk.gold} stroke={tk.card} strokeWidth="2" />
                        <text x="52" y="34" fill={tk.red} fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="700">
                          Anti-Causal LTD (Δt &lt; 0)
                        </text>
                        <text x="348" y="34" fill={tk.emerald} fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="700">
                          Causal LTP (Δt &gt; 0)
                        </text>
                        <text x="48" y="210" fill={tk.muted} fontSize="10" fontFamily="JetBrains Mono, monospace">
                          -100ms
                        </text>
                        <text x={stdpSvgData.zeroX - 24} y="210" fill={tk.gold} fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="700">
                          0ms (0)
                        </text>
                        <text x="486" y="210" fill={tk.muted} fontSize="10" fontFamily="JetBrains Mono, monospace">
                          +100ms
                        </text>
                      </svg>
                    </Box>

                    <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.ink, p: 1.25, bgcolor: tk.card, border: `1px solid ${tk.borderSoft}`, borderRadius: 1.5, mb: 1.5 }}>
                      {stdpResult.formula} · Weight {stdpResult.initialWeight} → {stdpResult.nextWeight}
                    </Typography>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography component="label" htmlFor="stdp-delta-t-slider" sx={{ display: 'block', fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.ink, mb: 0.5 }}>
                        Spike Latency Δt (ms): {deltaTMs} ms
                      </Typography>
                      <Slider
                        id="stdp-delta-t-slider"
                        aria-label="Spike latency delta t in milliseconds"
                        min={-100}
                        max={100}
                        step={1}
                        value={deltaTMs}
                        onChange={(_, v) => setDeltaTMs(Number(v))}
                        sx={{ color: tk.gold }}
                      />
                    </Box>

                    <Grid container spacing={1.25}>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          id="stdp-a-plus"
                          label="A+ (LTP amp)"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ step: 0.05, min: 0.05, max: 3 }}
                          value={aPlus}
                          onChange={(e) => setAPlus(Math.max(0.05, Math.min(3, Number(e.target.value) || 0.85)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          id="stdp-a-minus"
                          label="A- (LTD amp)"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ step: 0.05, min: 0.05, max: 3 }}
                          value={aMinus}
                          onChange={(e) => setAMinus(Math.max(0.05, Math.min(3, Number(e.target.value) || 0.45)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField
                          id="stdp-initial-weight"
                          label="Initial Weight"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ step: 0.05, min: 0, max: 1 }}
                          value={initialWeight}
                          onChange={(e) => setInitialWeight(Math.max(0, Math.min(1, Number(e.target.value) || 0)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          id="stdp-tau-plus"
                          label="τ+ (ms)"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ step: 1, min: 2, max: 200 }}
                          value={tauPlusMs}
                          onChange={(e) => setTauPlusMs(Math.max(2, Math.min(200, Number(e.target.value) || 16.8)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          id="stdp-tau-minus"
                          label="τ- (ms)"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ step: 1, min: 2, max: 200 }}
                          value={tauMinusMs}
                          onChange={(e) => setTauMinusMs(Math.max(2, Math.min(200, Number(e.target.value) || 33.7)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Ebbinghaus Retention & Server Verification */}
                <Grid item xs={12} lg={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                      <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink }}>
                        Ebbinghaus Retention Decay R(t, S) = exp(-t / S)
                      </Typography>
                      <Chip
                        size="small"
                        label={`R = ${retentionResult.retentionPct}% · t½ = ${retentionResult.halfLifeHours}h`}
                        sx={{
                          fontFamily: MONO,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: tk.skyBg,
                          color: tk.sky,
                          border: `1px solid ${tk.skyBorder}`,
                        }}
                      />
                    </Box>

                    <Box sx={{ bgcolor: tk.svgBg, border: `1px solid ${tk.border}`, borderRadius: 1.5, mb: 1.5 }}>
                      <svg
                        viewBox="0 0 560 190"
                        role="img"
                        aria-label="Ebbinghaus retention curve over 168 hours"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      >
                        <rect x="0" y="0" width="560" height="190" fill={tk.svgBg} />
                        <line x1="44" y1="160" x2="528" y2="160" stroke={tk.svgAxis} strokeWidth="1.2" />
                        <line x1="44" y1="24" x2="44" y2="160" stroke={tk.svgAxis} strokeWidth="1.2" />
                        <line x1="44" y1="94" x2="528" y2="94" stroke={tk.svgGrid} strokeDasharray="4 4" />
                        <path d={retentionSvgData.path} fill="none" stroke={tk.sky} strokeWidth="2.6" />
                        {retentionSvgData.halfLifeX !== null && (
                          <line
                            x1={retentionSvgData.halfLifeX}
                            y1="24"
                            x2={retentionSvgData.halfLifeX}
                            y2="160"
                            stroke={tk.violet}
                            strokeWidth="1.3"
                            strokeDasharray="3 3"
                          />
                        )}
                        <circle cx={retentionSvgData.markerX} cy={retentionSvgData.markerY} r="6" fill={tk.gold} stroke={tk.card} strokeWidth="2" />
                        <text x="50" y="34" fill={tk.sky} fontSize="10.5" fontFamily="JetBrains Mono, monospace" fontWeight="700">
                          Retention 100%
                        </text>
                        <text x="50" y="90" fill={tk.muted} fontSize="10" fontFamily="JetBrains Mono, monospace">
                          50% Half-Life ({retentionResult.halfLifeHours}h)
                        </text>
                        <text x="44" y="178" fill={tk.muted} fontSize="10" fontFamily="JetBrains Mono, monospace">
                          0h
                        </text>
                        <text x="272" y="178" fill={tk.muted} fontSize="10" fontFamily="JetBrains Mono, monospace">
                          84h
                        </text>
                        <text x="498" y="178" fill={tk.muted} fontSize="10" fontFamily="JetBrains Mono, monospace">
                          168h
                        </text>
                      </svg>
                    </Box>

                    <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: tk.ink, p: 1.25, bgcolor: tk.card, border: `1px solid ${tk.borderSoft}`, borderRadius: 1.5, mb: 1.5 }}>
                      {retentionResult.formula}
                    </Typography>

                    <Grid container spacing={1.25} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <TextField
                          id="ebbinghaus-age-hours"
                          label="Age (hours)"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ min: 0, max: 720, step: 1 }}
                          value={ageHours}
                          onChange={(e) => setAgeHours(Math.max(0, Math.min(720, Number(e.target.value) || 0)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          id="ebbinghaus-stability-hours"
                          label="Stability S (h)"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ min: 4, max: 720, step: 4 }}
                          value={stabilityHours}
                          onChange={(e) => setStabilityHours(Math.max(4, Math.min(720, Number(e.target.value) || 72)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          id="ebbinghaus-access-count"
                          label="Access Count"
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ min: 0, max: 100, step: 1 }}
                          value={accessCount}
                          onChange={(e) => setAccessCount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                          sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25 }}>
                      <Button
                        variant="contained"
                        disabled={verifying}
                        onClick={handleServerVerify}
                        sx={{
                          minHeight: 44,
                          px: 2,
                          fontFamily: MONO,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          bgcolor: tk.goldBtnBg,
                          color: tk.goldBtnInk,
                          '&:hover': { bgcolor: tk.goldBtnBg, opacity: 0.92 },
                        }}
                      >
                        {verifying ? 'Verifying...' : 'Verify on Loopback Engine'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setDeltaTMs(0)}
                        sx={{
                          minHeight: 44,
                          px: 1.75,
                          fontFamily: MONO,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: tk.ink,
                          borderColor: tk.border,
                        }}
                      >
                        Test Δt = 0 Boundary
                      </Button>
                    </Box>

                    {serverVerify && (
                      <Box sx={{ mt: 1.5, p: 1.25, bgcolor: tk.emeraldBg, border: `1px solid ${tk.emeraldBorder}`, borderRadius: 1.5 }}>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.emerald }}>
                          VERIFIED ({serverVerify.source}) · Δw={serverVerify.deltaW} · Δw(0)={serverVerify.deltaWAtZero}
                        </Typography>
                        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.ink, wordBreak: 'break-all', mt: 0.35 }}>
                          Receipt SHA-256: {serverVerify.receiptSha256}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* TAB 2: HYBRID RECALL & GRAPH EXPLORER */}
          {activeTab === 2 && (
            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      id="hybrid-recall-query"
                      label="Hybrid Recall Query (BM25 + Hashed N-Gram Cosine + Salience)"
                      value={recallQuery}
                      onChange={(e) => setRecallQuery(e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                    />
                  </Grid>
                  <Grid item xs={4} md={2}>
                    <TextField
                      id="recall-weight-bm25"
                      label="BM25 Weight"
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0, max: 1, step: 0.05 }}
                      value={wBm25}
                      onChange={(e) => setWBm25(Math.max(0, Math.min(1, Number(e.target.value) || 0)))}
                      sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                    />
                  </Grid>
                  <Grid item xs={4} md={2}>
                    <TextField
                      id="recall-weight-cosine"
                      label="Cosine Weight"
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0, max: 1, step: 0.05 }}
                      value={wCosine}
                      onChange={(e) => setWCosine(Math.max(0, Math.min(1, Number(e.target.value) || 0)))}
                      sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                    />
                  </Grid>
                  <Grid item xs={4} md={2}>
                    <TextField
                      id="recall-weight-salience"
                      label="Salience Weight"
                      type="number"
                      size="small"
                      fullWidth
                      inputProps={{ min: 0, max: 1, step: 0.05 }}
                      value={wSalience}
                      onChange={(e) => setWSalience(Math.max(0, Math.min(1, Number(e.target.value) || 0)))}
                      sx={{ '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  {QUICK_RECALL_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      size="small"
                      variant="outlined"
                      onClick={() => setRecallQuery(preset)}
                      sx={{
                        minHeight: 44,
                        px: 1.5,
                        fontFamily: MONO,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: tk.ink,
                        borderColor: tk.border,
                        bgcolor: tk.card,
                        '&:hover': { borderColor: tk.gold, bgcolor: tk.goldBg },
                      }}
                    >
                      {preset}
                    </Button>
                  ))}
                </Box>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} lg={7}>
                  <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 1.25 }}>
                    Ranked Hybrid Recall ({recallResult.results.length} / {recallResult.corpusSize} corpus · normalized weights {recallResult.weights.bm25}/{recallResult.weights.cosine}/{recallResult.weights.salience})
                  </Typography>
                  <Stack spacing={1.25}>
                    {recallResult.results.slice(0, 8).map((item, idx) => (
                      <Paper
                        key={item.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor: tk.inset,
                          border: `1px solid ${idx === 0 ? tk.goldBorder : tk.borderSoft}`,
                          borderRadius: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.6 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
                            <Chip
                              size="small"
                              label={`#${idx + 1} · ${item.shortId}`}
                              sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, bgcolor: tk.goldBg, color: tk.gold, border: `1px solid ${tk.goldBorder}` }}
                            />
                            <Chip
                              size="small"
                              label={item.category}
                              sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, bgcolor: tk.card, color: tk.ink, border: `1px solid ${tk.borderSoft}` }}
                            />
                          </Box>
                          <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.emerald }}>
                            Score {(item.compositeScore * 100).toFixed(1)}%
                          </Typography>
                        </Box>

                        <Typography sx={{ fontSize: '0.84rem', color: tk.ink, lineHeight: 1.55, mb: 1 }}>
                          {item.text}
                        </Typography>

                        <Grid container spacing={1}>
                          {[
                            { label: 'BM25', val: item.bm25Score, col: tk.sky },
                            { label: 'Cosine', val: item.cosineScore, col: tk.violet },
                            { label: 'Retention', val: item.retentionScore, col: tk.emerald },
                          ].map((m) => (
                            <Grid item xs={4} key={m.label}>
                              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: m.col, mb: 0.25 }}>
                                {m.label}: {(m.val * 100).toFixed(0)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={Math.round(m.val * 100)}
                                aria-label={`${m.label} score for ${item.shortId}`}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: tk.card,
                                  border: `1px solid ${tk.borderSoft}`,
                                  '& .MuiLinearProgress-bar': { bgcolor: m.col },
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                      <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink }}>
                        CA3/CA1 Multi-Hop Associative Trace
                      </Typography>
                      <TextField
                        id="ca3-max-hops"
                        select
                        label="Hops"
                        size="small"
                        value={maxHops}
                        onChange={(e) => setMaxHops(Number(e.target.value))}
                        inputProps={{ 'aria-label': 'CA3 associative trace hop depth' }}
                        sx={{ minWidth: 96, '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                      >
                        <MenuItem value={1}>1-Hop</MenuItem>
                        <MenuItem value={2}>2-Hop</MenuItem>
                        <MenuItem value={3}>3-Hop</MenuItem>
                      </TextField>
                    </Box>

                    <TextField
                      id="ca3-seed-node"
                      select
                      label="Seed Engram Node"
                      size="small"
                      fullWidth
                      value={effectiveSeedId}
                      onChange={(e) => setSelectedNodeId(e.target.value)}
                      inputProps={{ 'aria-label': 'Seed engram node for CA3 associative trace' }}
                      sx={{ mb: 1.5, '& .MuiInputBase-root': { minHeight: 44, bgcolor: tk.card, color: tk.ink }, '& .MuiInputLabel-root': { color: tk.muted } }}
                    >
                      {(snapshot.graph?.nodes || []).slice(0, 24).map((n) => (
                        <MenuItem key={n.id} value={n.id}>
                          {n.shortId} · [{n.category}] {n.label.slice(0, 44)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Box sx={{ p: 1.25, bgcolor: tk.card, border: `1px solid ${tk.borderSoft}`, borderRadius: 1.5, mb: 1.5 }}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.gold }}>
                        Activated: {associativeTrace.totalActivated} nodes · Active Edges: {associativeTrace.activeEdges.length} · CA3 Coherence: {associativeTrace.ca3Coherence}
                      </Typography>
                    </Box>

                    <Stack spacing={1}>
                      {(associativeTrace.nodes || []).slice(0, 8).map((n) => (
                        <Box
                          key={n.id}
                          sx={{
                            p: 1.15,
                            bgcolor: tk.card,
                            border: `1px solid ${n.hop === 0 ? tk.goldBorder : tk.borderSoft}`,
                            borderRadius: 1.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.35 }}>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: n.hop === 0 ? tk.gold : tk.sky }}>
                              HOP {n.hop} · {n.shortId} ({n.category})
                            </Typography>
                            <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, color: tk.emerald }}>
                              Act {(n.activation * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', color: tk.muted }}>
                            {n.label}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* TAB 3: PLAYBOOKS & VERIFIED EXPORTS */}
          {activeTab === 3 && (
            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 0.5 }}>
                  Copy-Only Safe CLI &amp; Loopback Playbooks
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: tk.muted, mb: 1.5 }}>
                  Zero shell execution from the browser and zero write endpoints against 127.0.0.1:8094. Copy and run explicitly in your local terminal.
                </Typography>

                <Grid container spacing={1.25}>
                  {playbooks.map((pb) => (
                    <Grid item xs={12} md={6} key={pb.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor: tk.card,
                          border: `1px solid ${tk.borderSoft}`,
                          borderRadius: 1.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: tk.ink }}>
                              {pb.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={pb.safety}
                              sx={{ fontFamily: MONO, fontSize: '0.66rem', fontWeight: 700, bgcolor: tk.emeraldBg, color: tk.emerald, border: `1px solid ${tk.emeraldBorder}` }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: '0.78rem', color: tk.muted, mb: 0.75 }}>
                            {pb.description}
                          </Typography>
                          <Box
                            component="pre"
                            sx={{
                              m: 0,
                              p: 1,
                              bgcolor: tk.codeBg,
                              border: `1px solid ${tk.borderSoft}`,
                              borderRadius: 1,
                              fontFamily: MONO,
                              fontSize: '0.74rem',
                              color: tk.ink,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all',
                            }}
                          >
                            {pb.command}
                          </Box>
                        </Box>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={copiedId === pb.id ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                          onClick={() => handleCopy(pb.id, pb.command)}
                          sx={{
                            minHeight: 44,
                            alignSelf: 'flex-start',
                            fontFamily: MONO,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: tk.ink,
                            borderColor: tk.border,
                          }}
                        >
                          {copiedId === pb.id ? 'Copied Command' : 'Copy Command'}
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: tk.inset, border: `1px solid ${tk.borderSoft}`, borderRadius: 2 }}>
                <Typography component="h4" sx={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: '1rem', color: tk.ink, mb: 0.5 }}>
                  Verified Exports (JSON, Markdown Dossier &amp; Formula-Safe CSV)
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.emerald, mb: 1.5, wordBreak: 'break-all' }}>
                  FIPS 180-4 SHA-256 Receipt: {exportsBundle.receiptSha256}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('lucy-netrunner-memory-dossier.json', exportsBundle.json, 'application/json')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, bgcolor: tk.goldBtnBg, color: tk.goldBtnInk }}
                  >
                    Download JSON
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('lucy-netrunner-memory-dossier.md', exportsBundle.markdown, 'text/markdown')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: tk.ink, borderColor: tk.border, bgcolor: tk.card }}
                  >
                    Download Markdown
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadTextFile('lucy-netrunner-memory-recall.csv', exportsBundle.csv, 'text/csv')}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: tk.ink, borderColor: tk.border, bgcolor: tk.card }}
                  >
                    Download Formula-Safe CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={copiedId === 'export-json' ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                    onClick={() => handleCopy('export-json', exportsBundle.json)}
                    sx={{ minHeight: 44, fontFamily: MONO, fontSize: '0.75rem', fontWeight: 700, color: tk.ink, borderColor: tk.border, bgcolor: tk.card }}
                  >
                    {copiedId === 'export-json' ? 'Copied JSON' : 'Copy JSON'}
                  </Button>
                </Box>

                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    maxHeight: 260,
                    overflow: 'auto',
                    bgcolor: tk.codeBg,
                    border: `1px solid ${tk.borderSoft}`,
                    borderRadius: 1.5,
                    fontFamily: MONO,
                    fontSize: '0.73rem',
                    lineHeight: 1.55,
                    color: tk.ink,
                  }}
                >
                  {exportsBundle.markdown}
                </Box>
              </Paper>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
