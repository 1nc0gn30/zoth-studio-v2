import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Slider,
  Stack,
  Tabs,
  Tab,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalculateIcon from '@mui/icons-material/Calculate';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  MATH_PILLARS_ENGINE_VERSION,
  PILLAR_CATALOG,
  evaluatePillar,
  exportEvaluationJson,
  exportEvaluationMarkdown,
  exportEvaluationCsv,
  exportEvaluationLatex,
} from '../../utils/mathPillarsEngine';

const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const DISPLAY = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const DEFAULT_PARAMS = {
  linear: {
    vectorA: '1.2, 0.8, -0.4, 0.9',
    vectorB: '0.9, 1.1, -0.2, 0.5',
    layers: 32,
    heads: 16,
    dHead: 128,
    seqLen: 4096,
    dtypeBytes: 2,
  },
  calculus: {
    learningRate: 0.05,
    beta1: 0.9,
    beta2: 0.999,
    weightDecay: 0.01,
    gradClip: 1.0,
    theta0: 2.5,
    curvature: 1.2,
    steps: 20,
    loraRank: 16,
    dIn: 4096,
    dOut: 4096,
    loraAlpha: 32,
  },
  probability: {
    logits: '2.4, 1.1, -0.5, 0.2, -1.2',
    temperature: 0.7,
    topP: 0.9,
  },
  hessian: {
    h11: 4.2,
    h12: 1.1,
    h22: 1.4,
    v1: 1.0,
    v2: 0.5,
  },
  lyapunov: {
    lambda: -0.42,
    timeSec: 4.0,
    delta0: 0.01,
    entropyH: 0.34,
    maxEntropyH: 4.0,
  },
  stdp: {
    deltaTMs: 12.0,
    aPlus: 0.85,
    aMinus: 0.45,
    tauPlus: 16.8,
    tauMinus: 33.7,
    initialWeight: 0.5,
    learningRate: 0.25,
    spikeDeltas: '12, 8, -15, 5, 0, 18, -22',
  },
  bft: {
    nodes: 7,
    faulty: 2,
  },
};

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function PillarCurveSvg({ chart, isDark, tk, pillarId }) {
  const pts = chart?.points || [];
  if (!pts.length) return null;

  const width = 620;
  const height = 220;
  const padL = 52;
  const padR = 18;
  const padT = 18;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const ys = pts.map((p) => Number(p.y) || 0);
  const rawMin = Math.min(...ys, pillarId === 'stdp' ? -0.5 : 0);
  const rawMax = Math.max(...ys, pillarId === 'stdp' ? 0.9 : 1);
  const span = Math.max(rawMax - rawMin, 1e-6);
  const yMin = rawMin - span * 0.08;
  const yMax = rawMax + span * 0.08;
  const yRange = Math.max(yMax - yMin, 1e-6);

  const mapX = (idx) => (pts.length === 1 ? padL + plotW / 2 : padL + (idx / (pts.length - 1)) * plotW);
  const mapY = (val) => padT + plotH - ((val - yMin) / yRange) * plotH;

  const zeroY = yMin <= 0 && yMax >= 0 ? mapY(0) : null;
  const polylinePoints = pts.map((p, i) => `${mapX(i).toFixed(1)},${mapY(p.y).toFixed(1)}`).join(' ');

  const useBars = pillarId === 'probability' || pillarId === 'bft';
  const barW = Math.max(16, Math.min(44, plotW / Math.max(pts.length * 1.6, 1)));

  const labelStep = Math.max(1, Math.ceil(pts.length / 7));

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: tk.inset,
        border: `1px solid ${tk.border}`,
        overflowX: 'auto',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily: MONO,
          fontWeight: 800,
          color: tk.gold,
          letterSpacing: '0.06em',
          display: 'block',
          mb: 1,
        }}
      >
        LIVE DETERMINISTIC CURVE // {chart.yLabel} vs {chart.xLabel}
      </Typography>
      <svg
        role="img"
        aria-label={`${chart.yLabel} versus ${chart.xLabel} mathematical plot`}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 240 }}
      >
        <title>{`${chart.yLabel} vs ${chart.xLabel}`}</title>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padT + frac * plotH;
          const v = yMax - frac * yRange;
          return (
            <g key={frac}>
              <line
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke={isDark ? 'rgba(245,241,230,0.10)' : 'rgba(16,24,40,0.10)'}
                strokeDasharray="3 3"
              />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                fill={tk.muted}
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {Math.abs(v) >= 1000 ? v.toExponential(1) : v.toFixed(Math.abs(v) < 10 ? 2 : 0)}
              </text>
            </g>
          );
        })}

        {/* Zero reference axis */}
        {zeroY !== null && (
          <line
            x1={padL}
            y1={zeroY}
            x2={width - padR}
            y2={zeroY}
            stroke={tk.goldBorder}
            strokeWidth="1.2"
          />
        )}

        {/* Bars or Polyline */}
        {useBars ? (
          pts.map((p, idx) => {
            const cx = mapX(idx);
            const yTop = mapY(Math.max(0, p.y));
            const yBot = zeroY !== null ? zeroY : padT + plotH;
            const h = Math.max(2, yBot - yTop);
            return (
              <g key={`${p.label}-${idx}`}>
                <rect
                  x={cx - barW / 2}
                  y={yTop}
                  width={barW}
                  height={h}
                  rx="4"
                  fill={tk.gold}
                  opacity="0.88"
                />
                <text
                  x={cx}
                  y={yTop - 5}
                  textAnchor="middle"
                  fill={tk.ink}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  {p.y}
                </text>
              </g>
            );
          })
        ) : (
          <>
            <polyline
              fill="none"
              stroke={tk.gold}
              strokeWidth="2.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polylinePoints}
            />
            {pts.map((p, idx) => {
              const cx = mapX(idx);
              const cy = mapY(p.y);
              const isOrigin = pillarId === 'stdp' && p.x === 0;
              return (
                <circle
                  key={`${p.label}-${idx}`}
                  cx={cx}
                  cy={cy}
                  r={isOrigin ? 5 : 3.2}
                  fill={isOrigin ? tk.emerald : tk.gold}
                  stroke={tk.card}
                  strokeWidth="1.2"
                />
              );
            })}
          </>
        )}

        {/* X-axis tick labels */}
        {pts.map((p, idx) => {
          if (idx % labelStep !== 0 && idx !== pts.length - 1) return null;
          return (
            <text
              key={`x-${idx}`}
              x={mapX(idx)}
              y={height - 10}
              textAnchor="middle"
              fill={tk.muted}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </Box>
  );
}

export default function MathPillarsGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Dual-Theme Tokens: Editorial Ivory Light (#FAF8F3/#FFFFFF, #101828 ink, #7A5600 antique bronze >= 5.8:1) vs Obsidian Gold Dark (#0B0D12)
  const tk = useMemo(
    () => ({
      bg: isDark ? '#0B0D12' : '#FAF8F3',
      card: isDark ? '#10131C' : '#FFFFFF',
      inset: isDark ? '#141925' : '#F4F1EA',
      codeBg: isDark ? '#090C13' : '#F4F1EA',
      codeInk: isDark ? '#E2E8F0' : '#101828',
      border: isDark ? 'rgba(245, 241, 230, 0.14)' : 'rgba(16, 24, 40, 0.14)',
      ink: isDark ? '#F5F1E6' : '#101828',
      muted: isDark ? '#CBD5E1' : '#334155',
      gold: isDark ? '#D4AF37' : '#7A5600',
      goldSoft: isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF7E0',
      goldBorder: isDark ? 'rgba(212, 175, 55, 0.42)' : '#8A6508',
      goldBtnBg: isDark ? '#D4AF37' : '#7A5600',
      goldBtnInk: isDark ? '#08080B' : '#FFFFFF',
      emerald: isDark ? '#34D399' : '#047857',
      emeraldSoft: isDark ? 'rgba(52, 211, 153, 0.14)' : '#ECFDF5',
      emeraldBorder: isDark ? 'rgba(52, 211, 153, 0.38)' : '#059669',
      red: isDark ? '#F87171' : '#B91C1C',
      redSoft: isDark ? 'rgba(248, 113, 113, 0.14)' : '#FEF2F2',
      redBorder: isDark ? 'rgba(248, 113, 113, 0.38)' : '#DC2626',
    }),
    [isDark],
  );

  const [activePillar, setActivePillar] = useState('linear');
  const [paramsByPillar, setParamsByPillar] = useState(() => ({ ...DEFAULT_PARAMS }));
  const [exportTab, setExportTab] = useState('markdown');
  const [copiedKey, setCopiedKey] = useState('');
  const [apiMode, setApiMode] = useState('BROWSER_LOCAL_ENGINE');
  const [apiStatusNote, setApiStatusNote] = useState('Pure client-side deterministic engine active');

  // Optional one-shot same-origin Studio loopback probe (NEVER polls :9995!)
  useEffect(() => {
    let cancelled = false;
    const isLocalHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');
    if (!isLocalHost) {
      setApiMode('BROWSER_OFFLINE_FALLBACK');
      setApiStatusNote('Static deployment — 100% deterministic in-browser solver active');
      return undefined;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 2000);
    fetch('/api/studio/math-pillars', {
      signal: ctl.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        if (!res.ok || !ct.includes('application/json')) return null;
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.ok) {
          setApiMode('HYBRID_LOOPBACK_VERIFIED');
          setApiStatusNote(`Loopback /api/studio/math-pillars v${data.schemaVersion} verified`);
        } else {
          setApiMode('BROWSER_OFFLINE_FALLBACK');
          setApiStatusNote('Pure client-side deterministic solver active');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiMode('BROWSER_OFFLINE_FALLBACK');
          setApiStatusNote('Pure client-side deterministic solver active');
        }
      })
      .finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctl.abort();
    };
  }, []);

  const currentParams = paramsByPillar[activePillar] || {};
  const evaluation = useMemo(
    () => evaluatePillar(activePillar, currentParams),
    [activePillar, currentParams],
  );

  const updateParam = useCallback((pillarId, key, value) => {
    setParamsByPillar((prev) => ({
      ...prev,
      [pillarId]: {
        ...prev[pillarId],
        [key]: value,
      },
    }));
  }, []);

  const handleReset = () => {
    setParamsByPillar((prev) => ({
      ...prev,
      [activePillar]: { ...DEFAULT_PARAMS[activePillar] },
    }));
  };

  const exportText = useMemo(() => {
    if (exportTab === 'json') return exportEvaluationJson(evaluation);
    if (exportTab === 'csv') return exportEvaluationCsv(evaluation);
    if (exportTab === 'latex') return exportEvaluationLatex(evaluation);
    return exportEvaluationMarkdown(evaluation);
  }, [evaluation, exportTab]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1800);
    } catch {
      setCopiedKey('');
    }
  };

  const handleDownload = () => {
    const extMap = {
      markdown: { ext: 'md', mime: 'text/markdown;charset=utf-8' },
      json: { ext: 'json', mime: 'application/json;charset=utf-8' },
      csv: { ext: 'csv', mime: 'text/csv;charset=utf-8' },
      latex: { ext: 'tex', mime: 'application/x-tex;charset=utf-8' },
    };
    const meta = extMap[exportTab] || extMap.markdown;
    downloadFile(`zoth-math-${activePillar}-proof.${meta.ext}`, exportText, meta.mime);
  };

  const activeCatalog = PILLAR_CATALOG.find((c) => c.id === activePillar) || PILLAR_CATALOG[0];

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: tk.card,
      color: tk.ink,
      fontFamily: MONO,
      fontSize: '0.86rem',
      '& fieldset': { borderColor: tk.border },
      '&:hover fieldset': { borderColor: tk.goldBorder },
      '&.Mui-focused fieldset': { borderColor: tk.gold },
    },
    '& .MuiInputLabel-root': {
      color: tk.muted,
      fontWeight: 700,
    },
  };

  const renderControls = () => {
    switch (activePillar) {
      case 'linear':
        return (
          <Stack spacing={2.5}>
            <TextField
              label="Query / Vector A (comma-separated)"
              value={currentParams.vectorA}
              onChange={(e) => updateParam('linear', 'vectorA', e.target.value)}
              inputProps={{ 'aria-label': 'Vector A values' }}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <TextField
              label="Key / Vector B (comma-separated)"
              value={currentParams.vectorB}
              onChange={(e) => updateParam('linear', 'vectorB', e.target.value)}
              inputProps={{ 'aria-label': 'Vector B values' }}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Transformer Layers (L)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {currentParams.layers}
                </Typography>
              </Stack>
              <Slider
                aria-label="Transformer Layers"
                value={Number(currentParams.layers)}
                min={4}
                max={96}
                step={4}
                onChange={(_, v) => updateParam('linear', 'layers', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Attention Heads (H) × Head Dim (d_h = {currentParams.dHead})
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {currentParams.heads} heads
                </Typography>
              </Stack>
              <Slider
                aria-label="Attention Heads"
                value={Number(currentParams.heads)}
                min={4}
                max={64}
                step={4}
                onChange={(_, v) => updateParam('linear', 'heads', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Sequence Context Length (S)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {currentParams.seqLen} tokens
                </Typography>
              </Stack>
              <Slider
                aria-label="Sequence Context Length"
                value={Number(currentParams.seqLen)}
                min={512}
                max={32768}
                step={512}
                onChange={(_, v) => updateParam('linear', 'seqLen', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
          </Stack>
        );

      case 'calculus':
        return (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  AdamW Learning Rate (η)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.learningRate).toFixed(3)}
                </Typography>
              </Stack>
              <Slider
                aria-label="AdamW Learning Rate"
                value={Number(currentParams.learningRate)}
                min={0.005}
                max={0.25}
                step={0.005}
                onChange={(_, v) => updateParam('calculus', 'learningRate', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Gradient L2 Clip Threshold (‖g‖₂)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.gradClip).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Gradient L2 Clip Threshold"
                value={Number(currentParams.gradClip)}
                min={0.2}
                max={5.0}
                step={0.1}
                onChange={(_, v) => updateParam('calculus', 'gradClip', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Decoupled Weight Decay (λ)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.weightDecay).toFixed(3)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Decoupled Weight Decay"
                value={Number(currentParams.weightDecay)}
                min={0.0}
                max={0.1}
                step={0.005}
                onChange={(_, v) => updateParam('calculus', 'weightDecay', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  LoRA Adapter Rank (r)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  r = {currentParams.loraRank}
                </Typography>
              </Stack>
              <Slider
                aria-label="LoRA Adapter Rank"
                value={Number(currentParams.loraRank)}
                min={4}
                max={128}
                step={4}
                onChange={(_, v) => updateParam('calculus', 'loraRank', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
          </Stack>
        );

      case 'probability':
        return (
          <Stack spacing={2.5}>
            <TextField
              label="Token Logit Vector z (comma-separated)"
              value={currentParams.logits}
              onChange={(e) => updateParam('probability', 'logits', e.target.value)}
              inputProps={{ 'aria-label': 'Token Logit Vector' }}
              fullWidth
              size="small"
              sx={inputSx}
            />
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Softmax Temperature (τ)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.temperature).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Softmax Temperature"
                value={Number(currentParams.temperature)}
                min={0.1}
                max={2.5}
                step={0.05}
                onChange={(_, v) => updateParam('probability', 'temperature', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Top-p Nucleus Cutoff (p)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.topP).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Top-p Nucleus Cutoff"
                value={Number(currentParams.topP)}
                min={0.2}
                max={1.0}
                step={0.05}
                onChange={(_, v) => updateParam('probability', 'topP', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
          </Stack>
        );

      case 'hessian':
        return (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Diagonal Curvature H₁₁
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.h11).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Hessian Entry H11"
                value={Number(currentParams.h11)}
                min={-6}
                max={10}
                step={0.2}
                onChange={(_, v) => updateParam('hessian', 'h11', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Off-Diagonal Coupling H₁₂ = H₂₁
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.h12).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Hessian Off-Diagonal H12"
                value={Number(currentParams.h12)}
                min={-5}
                max={5}
                step={0.1}
                onChange={(_, v) => updateParam('hessian', 'h12', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Diagonal Curvature H₂₂
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.h22).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Hessian Entry H22"
                value={Number(currentParams.h22)}
                min={-6}
                max={10}
                step={0.2}
                onChange={(_, v) => updateParam('hessian', 'h22', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
          </Stack>
        );

      case 'lyapunov':
        return (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Maximum Lyapunov Exponent (λ)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.lambda).toFixed(2)} s⁻¹
                </Typography>
              </Stack>
              <Slider
                aria-label="Maximum Lyapunov Exponent"
                value={Number(currentParams.lambda)}
                min={-3.0}
                max={3.0}
                step={0.05}
                onChange={(_, v) => updateParam('lyapunov', 'lambda', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Integration Horizon (t)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.timeSec).toFixed(1)} s
                </Typography>
              </Stack>
              <Slider
                aria-label="Integration Horizon Time"
                value={Number(currentParams.timeSec)}
                min={0.5}
                max={25.0}
                step={0.5}
                onChange={(_, v) => updateParam('lyapunov', 'timeSec', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  System Entropy H (bits, H_max = {currentParams.maxEntropyH})
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.entropyH).toFixed(2)} bits
                </Typography>
              </Stack>
              <Slider
                aria-label="System Entropy H"
                value={Number(currentParams.entropyH)}
                min={0.0}
                max={4.0}
                step={0.05}
                onChange={(_, v) => updateParam('lyapunov', 'entropyH', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
          </Stack>
        );

      case 'stdp':
        return (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Spike Timing Interval (Δt = t_post − t_pre)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.deltaTMs).toFixed(1)} ms
                </Typography>
              </Stack>
              <Slider
                aria-label="Spike Timing Interval Delta t"
                value={Number(currentParams.deltaTMs)}
                min={-80}
                max={80}
                step={1}
                onChange={(_, v) => updateParam('stdp', 'deltaTMs', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Initial Synapse Weight (w₀ ∈ [0, 1])
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  {Number(currentParams.initialWeight).toFixed(2)}
                </Typography>
              </Stack>
              <Slider
                aria-label="Initial Synapse Weight"
                value={Number(currentParams.initialWeight)}
                min={0.0}
                max={1.0}
                step={0.05}
                onChange={(_, v) => updateParam('stdp', 'initialWeight', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <TextField
              label="Multi-Spike Trace Δt Sequence (ms)"
              value={currentParams.spikeDeltas}
              onChange={(e) => updateParam('stdp', 'spikeDeltas', e.target.value)}
              inputProps={{ 'aria-label': 'Multi-Spike Timing Sequence' }}
              fullWidth
              size="small"
              sx={inputSx}
            />
          </Stack>
        );

      case 'bft':
        return (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Total Swarm Validators (N)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  N = {currentParams.nodes}
                </Typography>
              </Stack>
              <Slider
                aria-label="Total Swarm Validators N"
                value={Number(currentParams.nodes)}
                min={1}
                max={31}
                step={1}
                onChange={(_, v) => updateParam('bft', 'nodes', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700, color: tk.ink }}>
                  Assumed Byzantine Faults (f)
                </Typography>
                <Typography component="span" variant="subtitle2" sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold }}>
                  f = {currentParams.faulty}
                </Typography>
              </Stack>
              <Slider
                aria-label="Assumed Byzantine Faults f"
                value={Number(currentParams.faulty)}
                min={0}
                max={10}
                step={1}
                onChange={(_, v) => updateParam('bft', 'faulty', v)}
                sx={{ color: tk.gold }}
              />
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      data-testid="math-pillars-workstation"
      sx={{
        p: { xs: 2, sm: 3, md: 3.5 },
        borderRadius: 3,
        bgcolor: tk.bg,
        color: tk.ink,
        border: `1px solid ${tk.border}`,
      }}
    >
      {/* Workstation Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 1 }}>
            <Chip
              icon={<FunctionsIcon sx={{ color: `${tk.gold} !important`, fontSize: '1rem' }} />}
              label={`MATH PILLARS ENGINE v${MATH_PILLARS_ENGINE_VERSION}`}
              size="small"
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                bgcolor: tk.goldSoft,
                color: tk.gold,
                border: `1px solid ${tk.goldBorder}`,
              }}
            />
            <Chip
              icon={<VerifiedUserIcon sx={{ color: `${tk.emerald} !important`, fontSize: '0.95rem' }} />}
              label={apiMode}
              size="small"
              sx={{
                fontFamily: MONO,
                fontWeight: 800,
                bgcolor: tk.emeraldSoft,
                color: tk.emerald,
                border: `1px solid ${tk.emeraldBorder}`,
              }}
            />
          </Stack>
          <Typography
            component="h2"
            variant="h5"
            sx={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              color: tk.ink,
              fontSize: { xs: '1.35rem', md: '1.75rem' },
              lineHeight: 1.2,
            }}
          >
            Six Mathematical Pillars &amp; Byzantine BFT Workbench
          </Typography>
          <Typography variant="body2" sx={{ color: tk.muted, mt: 0.5 }}>
            {apiStatusNote} · Deterministic in-browser solvers with SHA-256 verification receipts and zero external telemetry.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          <Button
            component={RouterLink}
            to="/docs/math"
            variant="outlined"
            startIcon={<MenuBookIcon />}
            sx={{
              minHeight: 44,
              borderColor: tk.border,
              color: tk.ink,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { borderColor: tk.goldBorder, bgcolor: tk.goldSoft },
            }}
          >
            Theory Academy
          </Button>
          <Button
            component={RouterLink}
            to={activeCatalog.docsRoute}
            variant="contained"
            endIcon={<OpenInNewIcon />}
            sx={{
              minHeight: 44,
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4200' },
            }}
          >
            Pillar {activeCatalog.numeral} Spec
          </Button>
        </Stack>
      </Stack>

      {/* Scrollable Pillar Selector Tabs */}
      <Tabs
        value={activePillar}
        onChange={(_, val) => setActivePillar(val)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Select Mathematical Pillar Solver"
        sx={{
          mb: 3,
          minHeight: 48,
          bgcolor: tk.card,
          borderRadius: 2,
          border: `1px solid ${tk.border}`,
          px: 0.5,
          '& .MuiTab-root': {
            minHeight: 44,
            fontWeight: 700,
            fontSize: '0.84rem',
            textTransform: 'none',
            color: tk.muted,
            borderRadius: 1.5,
            my: 0.5,
            '&.Mui-selected': {
              bgcolor: tk.goldBtnBg,
              color: tk.goldBtnInk,
            },
          },
          '& .MuiTabs-indicator': { display: 'none' },
        }}
      >
        {PILLAR_CATALOG.map((p) => (
          <Tab key={p.id} value={p.id} label={`${p.numeral}. ${p.shortTitle}`} />
        ))}
      </Tabs>

      {/* Main Two-Column Solver Grid */}
      <Grid container spacing={2.5}>
        {/* Left: Controls & Formula */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              height: '100%',
              borderRadius: 2.5,
              bgcolor: tk.card,
              border: `1px solid ${tk.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <CalculateIcon sx={{ color: tk.gold }} />
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  Pillar {activeCatalog.numeral}: {activeCatalog.title}
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{
                  minHeight: 44,
                  borderColor: tk.border,
                  color: tk.ink,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Reset
              </Button>
            </Stack>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: tk.codeBg,
                color: tk.codeInk,
                fontFamily: MONO,
                fontSize: '0.78rem',
                border: `1px solid ${tk.border}`,
                borderLeft: `4px solid ${tk.gold}`,
                overflowX: 'auto',
              }}
            >
              {evaluation.formula}
            </Box>

            {renderControls()}

            <Alert
              severity={activePillar === 'bft' && !evaluation.data?.safetyHolds ? 'error' : 'info'}
              icon={<FunctionsIcon fontSize="inherit" />}
              sx={{
                mt: 'auto',
                borderRadius: 2,
                bgcolor:
                  activePillar === 'bft' && !evaluation.data?.safetyHolds
                    ? tk.redSoft
                    : tk.emeraldSoft,
                color:
                  activePillar === 'bft' && !evaluation.data?.safetyHolds
                    ? tk.red
                    : tk.emerald,
                border: `1px solid ${
                  activePillar === 'bft' && !evaluation.data?.safetyHolds
                    ? tk.redBorder
                    : tk.emeraldBorder
                }`,
                '& .MuiAlert-icon': {
                  color:
                    activePillar === 'bft' && !evaluation.data?.safetyHolds
                      ? tk.red
                      : tk.emerald,
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: MONO, fontSize: '0.78rem' }}>
                {evaluation.summary}
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Right: Metrics Table, Live Curve & Step-by-Step Derivation */}
        <Grid xs={12} lg={7}>
          <Stack spacing={2.5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
              }}
            >
              <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink, mb: 1.5 }}>
                Closed-Form Evaluation Results
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: `1px solid ${tk.border}`, borderRadius: 2, bgcolor: tk.card, mb: 2 }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: tk.inset }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: tk.ink }}>Computed Quantity</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: tk.ink }}>Exact Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(evaluation.metrics || []).map((row) => (
                      <TableRow key={row.label}>
                        <TableCell sx={{ color: tk.ink, fontWeight: 600, fontSize: '0.84rem' }}>
                          {row.label}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: MONO, fontWeight: 800, color: tk.gold, fontSize: '0.84rem' }}
                        >
                          {row.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <PillarCurveSvg
                chart={evaluation.chart}
                isDark={isDark}
                tk={tk}
                pillarId={activePillar}
              />
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                bgcolor: tk.card,
                border: `1px solid ${tk.border}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 800, color: tk.ink }}>
                  Step-by-Step Derivation &amp; Verification Receipt
                </Typography>
                <Chip
                  label={`SHA-256: ${(evaluation.receiptSha256 || '').slice(0, 16)}…`}
                  size="small"
                  sx={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    bgcolor: tk.inset,
                    color: tk.muted,
                    border: `1px solid ${tk.border}`,
                  }}
                />
              </Stack>
              <Stack spacing={1}>
                {(evaluation.steps || []).map((step, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: tk.inset,
                      border: `1px solid ${tk.border}`,
                      fontFamily: MONO,
                      fontSize: '0.78rem',
                      color: tk.ink,
                      lineHeight: 1.55,
                    }}
                  >
                    {step}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: tk.border }} />

      {/* Formula-Safe Exporters (Markdown / JSON / CSV / LaTeX) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2.5,
          bgcolor: tk.card,
          border: `1px solid ${tk.border}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Tabs
            value={exportTab}
            onChange={(_, val) => setExportTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Export Proof Format"
            sx={{
              minHeight: 44,
              bgcolor: tk.inset,
              borderRadius: 2,
              p: 0.4,
              '& .MuiTab-root': {
                minHeight: 44,
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: 1.5,
                color: tk.muted,
                '&.Mui-selected': {
                  bgcolor: tk.goldBtnBg,
                  color: tk.goldBtnInk,
                },
              },
              '& .MuiTabs-indicator': { display: 'none' },
            }}
          >
            <Tab value="markdown" label="Markdown Proof" />
            <Tab value="json" label="JSON Receipt" />
            <Tab value="csv" label="CSV Table" />
            <Tab value="latex" label="LaTeX Snippet" />
          </Tabs>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={copiedKey === 'export' ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={() => handleCopy(exportText, 'export')}
              sx={{
                minHeight: 44,
                borderColor: tk.border,
                color: tk.ink,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {copiedKey === 'export' ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                minHeight: 44,
                bgcolor: tk.goldBtnBg,
                color: tk.goldBtnInk,
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4200' },
              }}
            >
              Download
            </Button>
          </Stack>
        </Stack>

        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            maxHeight: 240,
            overflow: 'auto',
            borderRadius: 2,
            bgcolor: tk.codeBg,
            color: tk.codeInk,
            border: `1px solid ${tk.border}`,
            fontFamily: MONO,
            fontSize: '0.78rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {exportText}
        </Box>
      </Paper>
    </Paper>
  );
}
