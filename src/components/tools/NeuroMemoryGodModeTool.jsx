import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
  Slider,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BoltIcon from '@mui/icons-material/Bolt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  DEFAULT_RECALL_WEIGHTS,
  DEFAULT_STDP_PARAMS,
  NEUROMODULATOR_PROFILES,
  buildOfflineNetrunnerMemorySnapshot,
  computeAssociativeTrace,
  computeEbbinghausRetention,
  computeStdpDelta,
  runHybridRecall,
  sampleStdpCurve,
  sha256Hex,
} from '../../utils/netrunnerMemoryEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Space Grotesk", "Inter", system-ui, sans-serif';

const QUICK_QUERIES = [
  'stdp sqlite wal',
  'loopback security 403',
  'ca3 associative recall',
  'obsidian mcp tools',
];

/**
 * Neuro-Memory Daemon v2.9.0 — Studio God-Mode Deck
 * Pure-MUI Editorial Ivory Light + Obsidian Gold Dark workstation.
 *
 * Uses the shared zero-dependency deterministic engine (netrunnerMemoryEngine.js):
 * - Genuine Robertson-Sparck Jones BM25 + 96-dim hashed n-gram cosine + Ebbinghaus salience recall
 * - Exact Asymmetric Hebbian STDP with Δw(0) === 0 and 5 neuromodulator gain presets
 * - Strictly read-only loopback bridge via GET /api/studio/netrunner-memory (never mutates :8094)
 * - Honest offline fallback when :3000 or :8094 is unavailable
 */
export default function NeuroMemoryGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const tk = useMemo(() => {
    if (isDark) {
      return {
        card: '#11141D',
        inset: '#171B26',
        svgBg: '#0E1118',
        svgGrid: 'rgba(245, 242, 234, 0.14)',
        svgAxis: 'rgba(245, 242, 234, 0.38)',
        ink: '#F5F2EA',
        muted: '#B4BAC6',
        border: 'rgba(212, 175, 55, 0.30)',
        borderSoft: 'rgba(255, 255, 255, 0.12)',
        gold: '#E5C65C',
        goldBg: '#2A220B',
        goldBorder: '#9A781A',
        btnPrimaryBg: '#D4AF37',
        btnPrimaryInk: '#0A0A0D',
        emerald: '#4ADE80',
        emeraldBg: '#0F261A',
        emeraldBorder: '#1E6B42',
        sky: '#7DD3FC',
        skyBg: '#0E2233',
        skyBorder: '#235B85',
        violet: '#D8B4FE',
        violetBg: '#251538',
        violetBorder: '#6B3FA0',
        red: '#FCA5A5',
        redBg: '#301417',
      };
    }
    return {
      card: '#FFFFFF',
      inset: '#F6F2E8',
      svgBg: '#F6F2E8',
      svgGrid: 'rgba(16, 24, 40, 0.12)',
      svgAxis: 'rgba(16, 24, 40, 0.42)',
      ink: '#141418',
      muted: '#475467',
      border: '#D8CEB6',
      borderSoft: '#E4DCCB',
      gold: '#7A5600',
      goldBg: '#F6EED6',
      goldBorder: '#C7A95A',
      btnPrimaryBg: '#7A5600',
      btnPrimaryInk: '#FFFFFF',
      emerald: '#0B5E38',
      emeraldBg: '#E6F5EC',
      emeraldBorder: '#8CC9A7',
      sky: '#0E4F7A',
      skyBg: '#E6F2FA',
      skyBorder: '#94C2E0',
      violet: '#5B21B6',
      violetBg: '#F3EEFC',
      violetBorder: '#C4B5FD',
      red: '#991B1B',
      redBg: '#FEF2F2',
    };
  }, [isDark]);

  const [snapshot, setSnapshot] = useState(() => buildOfflineNetrunnerMemorySnapshot());
  const [localAdditions, setLocalAdditions] = useState([]);
  const [potentiationBoosts, setPotentiationBoosts] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Query & hybrid recall weights
  const [query, setQuery] = useState('stdp sqlite wal');
  const [wBm25, setWBm25] = useState(DEFAULT_RECALL_WEIGHTS.bm25);
  const [wCosine, setWCosine] = useState(DEFAULT_RECALL_WEIGHTS.cosine);
  const [wSalience, setWSalience] = useState(DEFAULT_RECALL_WEIGHTS.salience);

  // STDP & Ebbinghaus parameters
  const [deltaTMs, setDeltaTMs] = useState(14);
  const [neuromodulator, setNeuromodulator] = useState('balanced');
  const [stabilityHours, setStabilityHours] = useState(72);

  // Local browser-only scratch engram encoder (never writes to :8094)
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryTags, setNewMemoryTags] = useState('stdp, sqlite, local-sandbox');

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
      }
    } catch {
      setSnapshot((prev) =>
        prev.mode === 'LIVE_LOOPBACK' ? prev : buildOfflineNetrunnerMemorySnapshot()
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveSnapshot(false);
  }, [fetchLiveSnapshot]);

  const effectiveEngrams = useMemo(() => {
    const base = Array.isArray(snapshot.engrams) ? snapshot.engrams : [];
    const merged = [...localAdditions, ...base];
    return merged.map((item) => {
      const boost = potentiationBoosts[item.id];
      if (!boost) return item;
      return {
        ...item,
        accessCount: Number(item.accessCount ?? 1) + boost.recalls,
        ageHours: Math.max(0.1, Number((Number(item.ageHours ?? 12) * (0.55 ** boost.recalls)).toFixed(1))),
        importance: Math.min(1.0, Number((Number(item.importance ?? 0.6) + boost.recalls * 0.04).toFixed(3))),
      };
    });
  }, [snapshot.engrams, localAdditions, potentiationBoosts]);

  const stdpResult = useMemo(
    () =>
      computeStdpDelta(deltaTMs, {
        ...DEFAULT_STDP_PARAMS,
        neuromodulator,
      }),
    [deltaTMs, neuromodulator]
  );

  const stdpCurve = useMemo(
    () =>
      sampleStdpCurve({
        ...DEFAULT_STDP_PARAMS,
        neuromodulator,
        stepMs: 5,
      }),
    [neuromodulator]
  );

  const retentionPreview = useMemo(
    () =>
      computeEbbinghausRetention({
        ageHours: 24,
        stabilityHours,
        accessCount: 3,
        neuromodulator,
      }),
    [stabilityHours, neuromodulator]
  );

  const recallOutput = useMemo(
    () =>
      runHybridRecall(effectiveEngrams, {
        query,
        weights: { bm25: wBm25, cosine: wCosine, salience: wSalience },
        neuromodulator,
        stabilityHours,
        limit: 10,
      }),
    [effectiveEngrams, query, wBm25, wCosine, wSalience, neuromodulator, stabilityHours]
  );

  const associativeTrace = useMemo(
    () =>
      computeAssociativeTrace(snapshot.graph, {
        seedNodeId: snapshot.graph?.nodes?.[0]?.id || '',
        maxHops: 2,
      }),
    [snapshot.graph]
  );

  const receiptSha256 = useMemo(() => {
    const payload = JSON.stringify({
      version: '2.9.0',
      mode: snapshot.mode,
      query,
      deltaTMs,
      neuromodulator,
      stabilityHours,
      topIds: recallOutput.results.slice(0, 5).map((r) => [r.id, r.compositeScore]),
    });
    return sha256Hex(payload);
  }, [snapshot.mode, query, deltaTMs, neuromodulator, stabilityHours, recallOutput.results]);

  const handlePotentiate = useCallback((id) => {
    setPotentiationBoosts((prev) => ({
      ...prev,
      [id]: { recalls: (prev[id]?.recalls || 0) + 1 },
    }));
  }, []);

  const handleAddLocalEngram = useCallback(() => {
    const trimmed = newMemoryText.trim();
    if (!trimmed) return;
    const tags = newMemoryTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const id = `sandbox-${localAdditions.length + 1}`;
    setLocalAdditions((prev) => [
      {
        id,
        shortId: id,
        category: 'semantic',
        text: trimmed,
        tags: tags.length ? tags : ['sandbox'],
        importance: 0.94,
        accessCount: 1,
        ageHours: 0.1,
        synapseCount: 2,
      },
      ...prev,
    ]);
    setNewMemoryText('');
  }, [newMemoryText, newMemoryTags, localAdditions.length]);

  const handleExportJson = useCallback(async () => {
    const exportObj = {
      tool: 'neuro-memory-daemon',
      version: '2.9.0',
      author: 'Neal Frazier Tech (@1nc0gn30) • NullAI Platform',
      mode: snapshot.mode,
      readOnlyBridge: '/api/studio/netrunner-memory',
      stdp: stdpResult,
      retention24h: retentionPreview,
      recall: recallOutput,
      receiptSha256,
    };
    const text = JSON.stringify(exportObj, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard restrictions in headless tests
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [snapshot.mode, stdpResult, retentionPreview, recallOutput, receiptSha256]);

  // STDP SVG curve path (viewBox 0 0 460 176)
  const stdpSvg = useMemo(() => {
    const xOf = (dt) => 36 + ((dt + 100) / 200) * 396;
    const maxAmp = 1.45;
    const yOf = (dw) => 88 - (dw / maxAmp) * 68;
    const ltdPts = stdpCurve.filter((p) => p.deltaTMs < 0);
    const ltpPts = stdpCurve.filter((p) => p.deltaTMs > 0);
    const toPath = (pts) =>
      pts
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.deltaTMs).toFixed(1)} ${yOf(p.deltaW).toFixed(1)}`)
        .join(' ');
    return {
      xZero: xOf(0),
      yZero: yOf(0),
      ltdPath: toPath(ltdPts),
      ltpPath: toPath(ltpPts),
      markerX: xOf(stdpResult.deltaTMs ?? 0),
      markerY: yOf(stdpResult.deltaW ?? 0),
    };
  }, [stdpCurve, stdpResult.deltaTMs, stdpResult.deltaW]);

  const isLive = snapshot.mode === 'LIVE_LOOPBACK' && snapshot.daemonOnline;
  const totalEngrams = snapshot.summary?.totalMemories ?? effectiveEngrams.length;
  const totalSynapses = snapshot.summary?.totalSynapses ?? 0;

  return (
    <Paper
      data-testid="neuro-memory-godmode-workstation"
      elevation={0}
      sx={{
        p: { xs: 2.25, md: 3.25 },
        mb: 4,
        borderRadius: 3,
        bgcolor: tk.card,
        color: tk.ink,
        border: `1.5px solid ${tk.border}`,
        boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.55)' : '0 10px 28px rgba(20,20,24,0.06)',
      }}
    >
      {/* Header Row — proper H2 → H3 → H4 hierarchy (zero H2 → H5 skip) */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Chip
              icon={<PsychologyIcon sx={{ fontSize: '0.95rem !important', color: `${tk.gold} !important` }} />}
              label="NEURO-MEMORY DAEMON v2.9.0 · STDP RECALL WORKSTATION"
              size="small"
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: tk.goldBg,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
              }}
            />
            <Chip
              label={
                isLive
                  ? `LIVE READ-ONLY :8094 · ${totalEngrams.toLocaleString()} ENGRAMS`
                  : `OFFLINE CURATED CORPUS · ${effectiveEngrams.length} ENGRAMS`
              }
              size="small"
              sx={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: isLive ? tk.emeraldBg : tk.skyBg,
                color: isLive ? tk.emerald : tk.sky,
                border: `1px solid ${isLive ? tk.emeraldBorder : tk.skyBorder}`,
              }}
            />
          </Stack>
          <Typography
            component="h3"
            variant="h5"
            sx={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              color: tk.ink,
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
            }}
          >
            Robertson-Sparck Jones BM25 + 96-Dim Cosine +{' '}
            <Box component="span" sx={{ color: tk.gold }}>
              Asymmetric STDP
            </Box>{' '}
            Engine
          </Typography>
          <Typography variant="body2" sx={{ color: tk.muted, mt: 0.5 }}>
            Strictly read-only loopback bridge (<code>GET /api/studio/netrunner-memory</code> → <code>127.0.0.1:8094</code>)
            with deterministic local simulation. Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loading}
            onClick={() => fetchLiveSnapshot(true)}
            sx={{
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: tk.ink,
              borderColor: tk.border,
              minHeight: 40,
            }}
          >
            {loading ? 'Probing :8094...' : 'Refresh Read-Only'}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
            onClick={handleExportJson}
            sx={{
              fontFamily: MONO,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: tk.btnPrimaryBg,
              color: tk.btnPrimaryInk,
              minHeight: 40,
              '&:hover': { bgcolor: tk.btnPrimaryBg, opacity: 0.92 },
            }}
          >
            {copied ? 'Copied Receipt JSON' : 'Export Verified JSON'}
          </Button>
        </Stack>
      </Stack>

      {/* Read-only telemetry strip */}
      <Alert
        severity="info"
        icon={false}
        sx={{
          mb: 2.5,
          py: 0.75,
          px: 1.75,
          borderRadius: 2,
          bgcolor: tk.inset,
          color: tk.ink,
          border: `1px solid ${tk.borderSoft}`,
          fontFamily: MONO,
          fontSize: '0.74rem',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <span>
            Substrate: <strong>{totalEngrams.toLocaleString()}</strong> engrams ·{' '}
            <strong>{totalSynapses.toLocaleString()}</strong> synapses · CA3 Coherence:{' '}
            <strong>{(associativeTrace.ca3Coherence * 100).toFixed(1)}%</strong>
          </span>
          <span>
            SHA-256 Receipt: <strong>{receiptSha256.slice(0, 16)}…</strong>
          </span>
        </Stack>
      </Alert>

      <Grid container spacing={3}>
        {/* Left Column: Query, Hybrid Weights, STDP Curve & Browser Sandbox Encoder */}
        <Grid xs={12} md={5}>
          <Stack spacing={2.25}>
            <Box>
              <TextField
                fullWidth
                size="small"
                id="nmd-godmode-query"
                label="Hybrid BM25 + Hashed Cosine Recall Query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                inputProps={{ 'aria-label': 'Hybrid BM25 and hashed cosine recall query' }}
              />
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {QUICK_QUERIES.map((q) => (
                  <Chip
                    key={q}
                    label={q}
                    size="small"
                    clickable
                    onClick={() => setQuery(q)}
                    sx={{
                      fontFamily: MONO,
                      fontSize: '0.68rem',
                      bgcolor: query === q ? tk.goldBg : tk.inset,
                      color: query === q ? tk.gold : tk.ink,
                      border: `1px solid ${query === q ? tk.goldBorder : tk.borderSoft}`,
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Recall & Neuromodulator Controls */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: tk.inset,
                border: `1px solid ${tk.borderSoft}`,
              }}
            >
              <Typography
                component="h4"
                sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.gold, mb: 1.5 }}
              >
                HYBRID RECALL WEIGHTS &amp; NEUROMODULATION
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                id="nmd-neuromod-select"
                label="Neuromodulator Gain Profile"
                value={neuromodulator}
                onChange={(e) => setNeuromodulator(e.target.value)}
                inputProps={{ 'aria-label': 'Neuromodulator gain profile' }}
                sx={{ mb: 1.5 }}
              >
                {NEUROMODULATOR_PROFILES.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>

              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink }}>
                BM25 Lexical Weight: {(recallOutput.weights.bm25 * 100).toFixed(0)}%
              </Typography>
              <Slider
                size="small"
                min={0.05}
                max={0.8}
                step={0.05}
                value={wBm25}
                onChange={(_, v) => setWBm25(Number(v))}
                aria-label="BM25 lexical weight"
                sx={{ color: tk.sky }}
              />

              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink }}>
                96-Dim Hashed Cosine Weight: {(recallOutput.weights.cosine * 100).toFixed(0)}%
              </Typography>
              <Slider
                size="small"
                min={0.05}
                max={0.8}
                step={0.05}
                value={wCosine}
                onChange={(_, v) => setWCosine(Number(v))}
                aria-label="96-dim hashed cosine weight"
                sx={{ color: tk.violet }}
              />

              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink }}>
                Temporal Salience Weight: {(recallOutput.weights.salience * 100).toFixed(0)}%
              </Typography>
              <Slider
                size="small"
                min={0.05}
                max={0.8}
                step={0.05}
                value={wSalience}
                onChange={(_, v) => setWSalience(Number(v))}
                aria-label="Temporal salience weight"
                sx={{ color: tk.emerald }}
              />

              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: tk.ink }}>
                Ebbinghaus Base Stability: {stabilityHours}h (24h Retention:{' '}
                {retentionPreview.retentionPct}%)
              </Typography>
              <Slider
                size="small"
                min={12}
                max={240}
                step={12}
                value={stabilityHours}
                onChange={(_, v) => setStabilityHours(Number(v))}
                aria-label="Ebbinghaus stability in hours"
                sx={{ color: tk.gold }}
              />
            </Box>

            {/* Dual-Theme Native STDP SVG Curve (zero dark slabs in light mode) */}
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${tk.border}`,
                bgcolor: tk.svgBg,
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  borderBottom: `1px solid ${tk.borderSoft}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  component="h4"
                  sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.gold, fontWeight: 700 }}
                >
                  ASYMMETRIC STDP LAW · Δw(0) = 0
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: tk.muted }}>
                  Δt = {deltaTMs > 0 ? `+${deltaTMs}` : deltaTMs} ms ({stdpResult.regime})
                </Typography>
              </Box>
              <Box sx={{ px: 1.5, pt: 1 }}>
                <Slider
                  size="small"
                  min={-100}
                  max={100}
                  step={2}
                  value={deltaTMs}
                  onChange={(_, v) => setDeltaTMs(Number(v))}
                  aria-label="STDP spike timing delta in milliseconds"
                  sx={{ color: deltaTMs > 0 ? tk.emerald : deltaTMs < 0 ? tk.red : tk.gold }}
                />
              </Box>
              <svg
                viewBox="0 0 460 176"
                role="img"
                aria-label="Asymmetric Hebbian STDP synaptic weight curve showing causal LTP for positive delta t, anti-causal LTD for negative delta t, and neutral zero at delta t equals zero"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              >
                <rect x="0" y="0" width="460" height="176" fill={tk.svgBg} />
                <line x1="36" y1={stdpSvg.yZero} x2="432" y2={stdpSvg.yZero} stroke={tk.svgAxis} strokeWidth="1.2" />
                <line x1={stdpSvg.xZero} y1="16" x2={stdpSvg.xZero} y2="156" stroke={tk.svgAxis} strokeDasharray="4 4" strokeWidth="1.2" />
                <path d={stdpSvg.ltdPath} fill="none" stroke={tk.red} strokeWidth="2.5" />
                <path d={stdpSvg.ltpPath} fill="none" stroke={tk.emerald} strokeWidth="2.5" />
                <circle cx={stdpSvg.xZero} cy={stdpSvg.yZero} r="3.5" fill={tk.gold} />
                <circle
                  cx={stdpSvg.markerX}
                  cy={stdpSvg.markerY}
                  r="6"
                  fill={tk.gold}
                  stroke={tk.card}
                  strokeWidth="2"
                />
                <text x="44" y="28" fill={tk.red} fontSize="10" fontFamily={MONO} fontWeight="700">
                  LTD (Δt &lt; 0)
                </text>
                <text x="336" y="28" fill={tk.emerald} fontSize="10" fontFamily={MONO} fontWeight="700">
                  LTP (Δt &gt; 0)
                </text>
                <text x="234" y="168" textAnchor="middle" fill={tk.muted} fontSize="10" fontFamily={MONO}>
                  {stdpResult.formula}
                </text>
              </svg>
            </Box>

            {/* Browser-Only Scratch Engram Encoder (strictly local state, never writes :8094) */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: tk.inset,
                border: `1px solid ${tk.borderSoft}`,
              }}
            >
              <Typography
                component="h4"
                sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: tk.ink, mb: 1 }}
              >
                TEST LOCAL SANDBOX ENGRAM (READ-ONLY TO :8094)
              </Typography>
              <Stack spacing={1.25}>
                <TextField
                  fullWidth
                  size="small"
                  id="nmd-sandbox-engram-text"
                  label="Sandbox Engram Observation"
                  placeholder="Enter a test episodic or semantic observation..."
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                />
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    id="nmd-sandbox-engram-tags"
                    label="Tags (comma-separated)"
                    value={newMemoryTags}
                    onChange={(e) => setNewMemoryTags(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddLocalEngram}
                    sx={{
                      bgcolor: tk.btnPrimaryBg,
                      color: tk.btnPrimaryInk,
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: tk.btnPrimaryBg, opacity: 0.92 },
                    }}
                  >
                    Encode
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: Ranked Hybrid Recall Engrams */}
        <Grid xs={12} md={7}>
          <Typography
            component="h4"
            sx={{ fontFamily: MONO, fontSize: '0.76rem', fontWeight: 700, color: tk.gold, mb: 1.25 }}
          >
            RANKED HYBRID RECALL STREAM ({recallOutput.results.length} OF {recallOutput.corpusSize} ENGRAMS)
          </Typography>
          <Stack spacing={1.5}>
            {recallOutput.results.map((m, idx) => {
              const bm25Pct = Math.round(m.bm25Score * 100);
              const cosPct = Math.round(m.cosineScore * 100);
              const retPct = Math.round(m.retentionScore * 100);
              const compPct = (m.compositeScore * 100).toFixed(1);
              return (
                <Box
                  key={m.id}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: tk.inset,
                    border: `1px solid ${idx === 0 ? tk.emeraldBorder : tk.borderSoft}`,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip
                        label={`#${idx + 1} · ${String(m.category).toUpperCase()}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontFamily: MONO,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: idx === 0 ? tk.emeraldBg : tk.violetBg,
                          color: idx === 0 ? tk.emerald : tk.violet,
                          border: `1px solid ${idx === 0 ? tk.emeraldBorder : tk.violetBorder}`,
                        }}
                      />
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', color: tk.muted }}>
                        Age: {m.ageHours}h · Recalls: {m.accessCount} · ID: {m.shortId}
                      </Typography>
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<BoltIcon />}
                      onClick={() => handlePotentiate(m.id)}
                      sx={{
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        py: 0.35,
                        color: tk.gold,
                        borderColor: tk.goldBorder,
                        bgcolor: tk.goldBg,
                      }}
                    >
                      LTP Boost ({compPct}%)
                    </Button>
                  </Stack>

                  <Typography variant="body2" sx={{ mb: 1.25, lineHeight: 1.55, color: tk.ink }}>
                    {m.text}
                  </Typography>

                  <Grid container spacing={1.25} alignItems="center">
                    <Grid xs={4}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.sky }}>
                        BM25: {bm25Pct}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={bm25Pct}
                        aria-label={`BM25 score ${bm25Pct} percent`}
                        sx={{
                          height: 5,
                          borderRadius: 2,
                          bgcolor: tk.borderSoft,
                          '& .MuiLinearProgress-bar': { bgcolor: tk.sky },
                        }}
                      />
                    </Grid>
                    <Grid xs={4}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.violet }}>
                        Cosine: {cosPct}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={cosPct}
                        aria-label={`Hashed cosine score ${cosPct} percent`}
                        sx={{
                          height: 5,
                          borderRadius: 2,
                          bgcolor: tk.borderSoft,
                          '& .MuiLinearProgress-bar': { bgcolor: tk.violet },
                        }}
                      />
                    </Grid>
                    <Grid xs={4}>
                      <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: tk.emerald }}>
                        Retention: {retPct}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={retPct}
                        aria-label={`Ebbinghaus retention ${retPct} percent`}
                        sx={{
                          height: 5,
                          borderRadius: 2,
                          bgcolor: tk.borderSoft,
                          '& .MuiLinearProgress-bar': { bgcolor: tk.emerald },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
