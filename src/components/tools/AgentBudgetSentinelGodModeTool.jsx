import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  TextField,
  Unstable_Grid2 as Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SavingsIcon from '@mui/icons-material/Savings';
import BoltIcon from '@mui/icons-material/Bolt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import GppBadIcon from '@mui/icons-material/GppBad';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { SovereignEyebrow, titleBaseSx } from '../sovereign/typography.jsx';
import SovereignTutorialModal from '../SovereignTutorialModal.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const DAEMON_BASE = 'http://127.0.0.1:8110';

const MODEL_TIERS = [
  { name: 'Local Sovereign Ollama / AGY / Hermes', inCostPer1M: 0.0, outCostPer1M: 0.0, darkColor: '#34D399', lightColor: '#047857' },
  { name: 'Gemini 3.8 Flash / DeepSeek V3', inCostPer1M: 0.15, outCostPer1M: 0.6, darkColor: '#38BDF8', lightColor: '#0369A1' },
  { name: 'Claude Sonnet 4 / GPT-4.1 / GPT-5', inCostPer1M: 2.0, outCostPer1M: 10.0, darkColor: '#D4AF37', lightColor: '#8A620C' },
  { name: 'Claude Opus 4 / o1 Reasoning Tier', inCostPer1M: 15.0, outCostPer1M: 60.0, darkColor: '#EF4444', lightColor: '#B91C1C' },
];

export default function AgentBudgetSentinelGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast theme tokens (WCAG AA/AAA in both Obsidian & Editorial Ivory)
  const ink = isDark ? '#F3F4F6' : '#101828';
  const muted = isDark ? '#9CA3AF' : '#475467';
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldBg = isDark ? 'rgba(52,211,153,0.14)' : 'rgba(4,120,87,0.10)';
  const emeraldBorder = isDark ? 'rgba(52,211,153,0.35)' : 'rgba(4,120,87,0.34)';
  const gold = isDark ? '#D4AF37' : '#8A620C';
  const goldBg = isDark ? 'rgba(212,175,55,0.14)' : 'rgba(138,98,12,0.10)';
  const goldBorder = isDark ? 'rgba(212,175,55,0.38)' : 'rgba(138,98,12,0.34)';
  const ruby = isDark ? '#EF4444' : '#B91C1C';
  const rubyBg = isDark ? 'rgba(239,68,68,0.14)' : 'rgba(185,28,28,0.10)';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const panelBg = isDark ? 'rgba(10,12,16,0.94)' : '#FFFFFF';
  const subSurface = isDark ? 'rgba(255,255,255,0.03)' : '#F8F5ED';
  const canvasSurface = isDark ? '#07090E' : '#FAF7F0';
  const borderCol = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(16,24,40,0.14)';

  const [tutorialOpen, setTutorialOpen] = useState(false);

  // Live :8110 daemon state
  const [daemonOnline, setDaemonOnline] = useState(false);
  const [daemonVersion, setDaemonVersion] = useState('2.6.0');
  const [liveStats, setLiveStats] = useState(null);
  const [liveTxs, setLiveTxs] = useState([]);
  const [ceilingInput, setCeilingInput] = useState('5.00');
  const [statusNotice, setStatusNotice] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  // Client-side burn-rate & offload optimizer sliders
  const [dailyCalls, setDailyCalls] = useState(1200);
  const [avgInputTokens, setAvgInputTokens] = useState(3500);
  const [avgOutputTokens, setAvgOutputTokens] = useState(900);
  const [hardCapUsd, setHardCapUsd] = useState(25);
  const [localOffloadPct, setLocalOffloadPct] = useState(65);

  const canvasRef = useRef(null);

  const refreshLiveTelemetry = useCallback(async () => {
    try {
      const hRes = await fetch(`${DAEMON_BASE}/api/health`, { cache: 'no-store' });
      if (!hRes.ok) throw new Error('health failed');
      const health = await hRes.json();
      setDaemonOnline(true);
      if (health.version) setDaemonVersion(health.version);

      const [sRes, tRes] = await Promise.all([
        fetch(`${DAEMON_BASE}/api/stats`, { cache: 'no-store' }),
        fetch(`${DAEMON_BASE}/api/transactions?limit=12`, { cache: 'no-store' }),
      ]);
      if (sRes.ok) {
        const stats = await sRes.json();
        setLiveStats(stats);
        if (typeof stats.max_budget_usd === 'number') {
          setCeilingInput(stats.max_budget_usd.toFixed(2));
        }
      }
      if (tRes.ok) {
        const txJson = await tRes.json();
        setLiveTxs(Array.isArray(txJson.transactions) ? txJson.transactions : []);
      }
    } catch (_err) {
      setDaemonOnline(false);
      setLiveStats(null);
      setLiveTxs([]);
    }
  }, []);

  useEffect(() => {
    refreshLiveTelemetry();
    let es = null;
    try {
      es = new EventSource(`${DAEMON_BASE}/api/stream`);
      es.addEventListener('init', (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          setDaemonOnline(true);
          setLiveStats((prev) => ({ ...(prev || {}), ...parsed }));
        } catch (_e) {}
      });
      ['transaction', 'trip', 'reset', 'config_change'].forEach((evt) => {
        es.addEventListener(evt, () => {
          refreshLiveTelemetry();
        });
      });
    } catch (_e) {}
    return () => {
      if (es) es.close();
    };
  }, [refreshLiveTelemetry]);

  const postDaemonAction = async (path, body, okMsg) => {
    if (!daemonOnline) {
      setStatusNotice('Daemon :8110 offline. Start `agent-budget serve --web-port 8110 --proxy-port 8111`.');
      return;
    }
    setBusyAction(true);
    try {
      const res = await fetch(`${DAEMON_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 429) {
        setStatusNotice(data.error || `HTTP ${res.status}`);
      } else {
        setStatusNotice(res.status === 429 ? `BREAKER TRIPPED (429): ${data.reason || 'Budget reached'}` : okMsg);
      }
      await refreshLiveTelemetry();
    } catch (_err) {
      setStatusNotice('Could not reach local daemon on 127.0.0.1:8110.');
    } finally {
      setBusyAction(false);
    }
  };

  const projections = useMemo(() => {
    const totalInM = (dailyCalls * avgInputTokens) / 1_000_000;
    const totalOutM = (dailyCalls * avgOutputTokens) / 1_000_000;
    const cloudFraction = (100 - localOffloadPct) / 100;

    return MODEL_TIERS.map((m) => {
      const rawDaily = totalInM * m.inCostPer1M + totalOutM * m.outCostPer1M;
      const routedDaily = rawDaily * cloudFraction;
      const monthly = routedDaily * 30;
      const tripped = routedDaily > hardCapUsd;
      return {
        ...m,
        color: isDark ? m.darkColor : m.lightColor,
        rawDaily: Number(rawDaily.toFixed(2)),
        routedDaily: Number(routedDaily.toFixed(2)),
        monthly: Number(monthly.toFixed(2)),
        tripped,
      };
    });
  }, [dailyCalls, avgInputTokens, avgOutputTokens, hardCapUsd, localOffloadPct, isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 175;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Subtle grid lines matching theme
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)';
      ctx.lineWidth = 1;
      for (let gy = 28; gy < h - 14; gy += 36) {
        ctx.beginPath();
        ctx.moveTo(14, gy);
        ctx.lineTo(w - 14, gy);
        ctx.stroke();
      }

      const capY = h * 0.30;
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.moveTo(16, capY);
      ctx.lineTo(w - 16, capY);
      ctx.strokeStyle = ruby;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = ruby;
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillText(`CIRCUIT BREAKER CAP ($${hardCapUsd}/day)`, 20, capY - 7);

      projections.forEach((p, idx) => {
        ctx.beginPath();
        for (let x = 16; x < w - 16; x += 6) {
          const prog = (x - 16) / Math.max(1, w - 32);
          const ratio = Math.min(1.32, p.routedDaily / Math.max(1, hardCapUsd));
          const wave = Math.sin(t + prog * 5 + idx) * 2.5;
          const y = h - 18 - prog * ratio * (h - capY - 20) + wave;
          if (x === 16) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [projections, hardCapUsd, isDark, ruby]);

  const breakerState = liveStats?.state || (daemonOnline ? 'CLOSED' : 'OFFLINE');
  const spendUsd = Number(liveStats?.current_spend_usd || 0);
  const maxUsd = Number(liveStats?.max_budget_usd || 5);
  const pctUsed = Number(liveStats?.percentage_used || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: panelBg,
        border: `1px solid ${emeraldBorder}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      {/* Header Row */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.75 }}>
            <Chip
              icon={<SavingsIcon sx={{ fontSize: '0.95rem !important', color: `${emerald} !important` }} />}
              label={daemonOnline ? `LIVE DAEMON ONLINE · v${daemonVersion} (:8110/:8111)` : 'DAEMON OFFLINE · CLIENT ESTIMATOR'}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.7rem',
                bgcolor: daemonOnline ? emeraldBg : goldBg,
                color: daemonOnline ? emerald : gold,
                border: `1px solid ${daemonOnline ? emeraldBorder : goldBorder}`,
              }}
            />
            <Chip
              icon={<BoltIcon sx={{ fontSize: '0.9rem !important', color: `${breakerState === 'TRIPPED' ? ruby : gold} !important` }} />}
              label={`BREAKER: ${breakerState}`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.7rem',
                bgcolor: breakerState === 'TRIPPED' ? rubyBg : goldBg,
                color: breakerState === 'TRIPPED' ? ruby : gold,
                border: `1px solid ${breakerState === 'TRIPPED' ? ruby : goldBorder}`,
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 400, color: ink }}>
            Live Circuit Breaker &amp; <span style={{ color: emerald }}>Zero-Cost Local Offload</span> Deck
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            onClick={() => setTutorialOpen(true)}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.74rem',
              fontWeight: 800,
              bgcolor: emerald,
              color: '#FFFFFF',
              '&:hover': { bgcolor: isDark ? '#10B981' : '#065F46' },
            }}
          >
            Quick Tutorial
          </Button>
          <Button
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.74rem',
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              '&:hover': { bgcolor: '#E5C158' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard?.writeText(
                JSON.stringify({
                  schema: 'zoth/finops-budget-sentinel/v2.6',
                  daemonOnline,
                  liveStats,
                  projections,
                }, null, 2)
              )?.catch?.(() => {});
              setStatusNotice('Copied FinOps policy & telemetry JSON to clipboard.');
            }}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.74rem',
              fontWeight: 700,
              color: emerald,
              borderColor: emeraldBorder,
            }}
          >
            Export JSON
          </Button>
        </Stack>
      </Stack>

      <SovereignEyebrow accent={emerald} right="Security & Network · :8110 / :8111">
        agent-budget-sentinel
      </SovereignEyebrow>

      {/* LIVE DAEMON TELEMETRY & GUARDRAIL CONTROLS */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          bgcolor: subSurface,
          border: `1px solid ${borderCol}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={6}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={1}>
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: muted, fontWeight: 700 }}>
                  HYDRATED SQLITE SPEND (LIVE :8110)
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '1.75rem', fontWeight: 800, color: ink }}>
                  ${spendUsd.toFixed(4)} <span style={{ fontSize: '0.95rem', color: gold }}>/ ${maxUsd.toFixed(2)}</span>
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 700, color: cyan }}>
                {Number(liveStats?.total_requests || 0)} calls · {Number(liveStats?.total_tokens || 0).toLocaleString()} tok · {Number(liveStats?.blocked_requests || 0)} blocked
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, pctUsed))}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
                '& .MuiLinearProgress-bar': { bgcolor: breakerState === 'TRIPPED' ? ruby : emerald },
              }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <TextField
                size="small"
                label="Hard Cap ($)"
                type="number"
                value={ceilingInput}
                onChange={(e) => setCeilingInput(e.target.value)}
                inputProps={{ min: 0.01, step: 0.5, style: { fontFamily: mono } }}
                sx={{ width: 120 }}
              />
              <Button
                variant="outlined"
                disabled={busyAction || !daemonOnline}
                onClick={() => {
                  const val = parseFloat(ceilingInput);
                  if (Number.isFinite(val) && val > 0) {
                    postDaemonAction('/api/budget', { max_budget_usd: val }, `Ceiling persisted at $${val.toFixed(2)} USD.`);
                  } else {
                    setStatusNotice('Enter a valid positive USD ceiling.');
                  }
                }}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: gold, borderColor: goldBorder }}
              >
                Set Cap
              </Button>
              <Button
                variant="outlined"
                disabled={busyAction || !daemonOnline}
                startIcon={<PlayArrowIcon />}
                onClick={() => postDaemonAction('/api/simulate', { model: 'gpt-4.1', prompt_tokens: 1200, completion_tokens: 400 }, 'Simulated 1 metered GPT-4.1 call.')}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: cyan, borderColor: borderCol }}
              >
                Simulate
              </Button>
              <Button
                variant="outlined"
                disabled={busyAction || !daemonOnline}
                startIcon={<GppBadIcon />}
                onClick={() => postDaemonAction('/api/trip', { reason: 'Studio operator kill switch engaged.' }, 'Breaker TRIPPED — :8111 returning HTTP 429.')}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: ruby, borderColor: ruby }}
              >
                Trip
              </Button>
              <Button
                variant="outlined"
                disabled={busyAction || !daemonOnline}
                startIcon={<RestartAltIcon />}
                onClick={() => postDaemonAction('/api/reset', { reset_spend: false }, 'Breaker RESET to CLOSED.')}
                sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: emerald, borderColor: emeraldBorder }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                aria-label="Refresh live telemetry"
                onClick={refreshLiveTelemetry}
                sx={{ minHeight: 44, minWidth: 44, px: 1.25, color: ink, borderColor: borderCol }}
              >
                <RefreshIcon fontSize="small" />
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {statusNotice && (
          <Typography sx={{ mt: 1.25, fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: gold }}>
            {statusNotice}
          </Typography>
        )}
      </Box>

      {/* BURN-RATE OPTIMIZER + LIVE TRANSACTIONS */}
      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: ink, fontWeight: 600 }}>
                Daily Agent Invocations: {dailyCalls.toLocaleString()}
              </Typography>
              <Slider aria-label="Daily Agent Invocations" min={100} max={10000} step={100} value={dailyCalls} onChange={(_, v) => setDailyCalls(v)} sx={{ color: cyan }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: ink, fontWeight: 600 }}>
                Avg Input Context Tokens: {avgInputTokens.toLocaleString()}
              </Typography>
              <Slider aria-label="Average Input Context Tokens" min={500} max={32000} step={500} value={avgInputTokens} onChange={(_, v) => setAvgInputTokens(v)} sx={{ color: isDark ? '#C084FC' : '#7E22CE' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: ink, fontWeight: 600 }}>
                Avg Output Completion Tokens: {avgOutputTokens.toLocaleString()}
              </Typography>
              <Slider aria-label="Average Output Completion Tokens" min={200} max={8000} step={100} value={avgOutputTokens} onChange={(_, v) => setAvgOutputTokens(v)} sx={{ color: gold }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: emerald, fontWeight: 700 }}>
                Local Sovereign Offload: {localOffloadPct}% ($0.00/token)
              </Typography>
              <Slider aria-label="Local Sovereign Offload Percent" min={0} max={95} step={5} value={localOffloadPct} onChange={(_, v) => setLocalOffloadPct(v)} sx={{ color: emerald }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: ruby, fontWeight: 700 }}>
                Daily Hard Circuit-Breaker Cap: ${hardCapUsd} USD
              </Typography>
              <Slider aria-label="Daily Hard Circuit Breaker Cap" min={5} max={200} step={5} value={hardCapUsd} onChange={(_, v) => setHardCapUsd(v)} sx={{ color: ruby }} />
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} md={7}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${emeraldBorder}`,
                bgcolor: canvasSurface,
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.9,
                  borderBottom: `1px solid ${borderCol}`,
                  bgcolor: emeraldBg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: emerald, fontWeight: 800 }}>
                  TOKEN BURN VELOCITY VS. CIRCUIT BREAKER CAP
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: muted, fontWeight: 700 }}>
                  {daemonOnline ? 'LIVE SYNC (:8110)' : 'CLIENT PROJECTION'}
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 175, display: 'block' }} />
            </Box>

            <Stack spacing={1.15}>
              {projections.map((p) => (
                <Box
                  key={p.name}
                  sx={{
                    p: 1.4,
                    borderRadius: 2,
                    bgcolor: subSurface,
                    border: `1px solid ${p.tripped ? ruby : borderCol}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ mb: 0.6 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: p.color }}>
                      {p.name}
                    </Typography>
                    <Chip
                      label={p.tripped ? `TRIPPED ($${p.routedDaily}/d)` : `$${p.routedDaily}/day · $${p.monthly}/mo`}
                      size="small"
                      sx={{
                        height: 22,
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: p.tripped ? ruby : emerald,
                        bgcolor: p.tripped ? rubyBg : emeraldBg,
                      }}
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (p.routedDaily / Math.max(1, hardCapUsd)) * 100)}
                    sx={{
                      height: 6,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: p.tripped ? ruby : p.color },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* LIVE TRANSACTION LEDGER FROM :8110 */}
      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: muted, mb: 1 }}>
          LIVE SQLITE LEDGER ({liveTxs.length} RECENT TRANSACTIONS FROM 127.0.0.1:8110)
        </Typography>
        <TableContainer sx={{ border: `1px solid ${borderCol}`, borderRadius: 2, bgcolor: subSurface }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: muted }}>Model</TableCell>
                <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: muted }}>Tokens</TableCell>
                <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: muted }}>Cost (USD)</TableCell>
                <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: muted }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {liveTxs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontFamily: mono, fontSize: '0.76rem', color: muted, textAlign: 'center', py: 2 }}>
                    {daemonOnline ? 'No transactions logged in budget.db yet.' : 'Start local daemon on :8110 to stream live SQLite transactions.'}
                  </TableCell>
                </TableRow>
              ) : (
                liveTxs.slice(0, 6).map((tx) => {
                  const tripped = tx.tripped === 1 || tx.status_code === 429;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 700, color: gold }}>{tx.model}</TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: ink }}>
                        {(Number(tx.prompt_tokens || 0) + Number(tx.completion_tokens || 0)).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: ink }}>
                        ${Number(tx.cost_usd || 0).toFixed(5)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tripped ? '429 TRIPPED' : `${tx.status_code || 200} OK`}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: tripped ? ruby : emerald,
                            bgcolor: tripped ? rubyBg : emeraldBg,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <SovereignTutorialModal
        toolId="agent-budget-sentinel"
        toolName="Agent Budget Sentinel"
        tagline="Stop runaway AI agents from exhausting your API budget."
        accentColor={emerald}
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        steps={[
          {
            icon: '🪙',
            title: 'Real-Time BPE Metering',
            desc: 'Agent Budget Sentinel meters every request with a zero-dependency Python cl100k_base BPE tokenizer and persists exact spend to SQLite.',
          },
          {
            icon: '🛑',
            title: 'Hard Circuit Breaker (:8111)',
            desc: 'When spend crosses your ceiling or velocity limit, the inline proxy transitions to TRIPPED and immediately returns HTTP 429.',
          },
          {
            icon: '🔌',
            title: 'Stdio MCP & $0.00 Local Offload',
            desc: 'Run `agent-budget mcp` for AI agent inspection and route routine tasks to local Ollama, AGY, or Hermes models at $0.00/token.',
          },
        ]}
      />
    </Paper>
  );
}
