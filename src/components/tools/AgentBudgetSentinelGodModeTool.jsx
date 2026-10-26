import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Slider,
  Unstable_Grid2 as Grid,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SavingsIcon from '@mui/icons-material/Savings';
import BoltIcon from '@mui/icons-material/Bolt';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const MODEL_TIERS = [
  { name: 'Zoth Local Ollama 1.5B (Loopback)', inCostPer1M: 0.0, outCostPer1M: 0.0, color: '#34D399' },
  { name: 'Gemini 2.5 Flash / DeepSeek V3', inCostPer1M: 0.15, outCostPer1M: 0.6, color: '#38BDF8' },
  { name: 'Claude 4.5 Sonnet / GPT-4o', inCostPer1M: 3.0, outCostPer1M: 15.0, color: '#D4AF37' },
  { name: 'Frontier Reasoning Opus Tier', inCostPer1M: 15.0, outCostPer1M: 75.0, color: '#EF4444' },
];

export default function AgentBudgetSentinelGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [dailyCalls, setDailyCalls] = useState(1200);
  const [avgInputTokens, setAvgInputTokens] = useState(3500);
  const [avgOutputTokens, setAvgOutputTokens] = useState(900);
  const [hardCapUsd, setHardCapUsd] = useState(25);
  const [localOffloadPct, setLocalOffloadPct] = useState(65);

  const canvasRef = useRef(null);

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
        rawDaily: Number(rawDaily.toFixed(2)),
        routedDaily: Number(routedDaily.toFixed(2)),
        monthly: Number(monthly.toFixed(2)),
        tripped,
      };
    });
  }, [dailyCalls, avgInputTokens, avgOutputTokens, hardCapUsd, localOffloadPct]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.03;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 460;
      const h = canvas.clientHeight || 175;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Draw circuit breaker threshold line
      const capY = h * 0.32;
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.moveTo(16, capY);
      ctx.lineTo(w - 16, capY);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#EF4444';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillText(`CIRCUIT BREAKER CAP ($${hardCapUsd}/day)`, 22, capY - 6);

      // Draw burn curves
      projections.forEach((p, idx) => {
        ctx.beginPath();
        for (let x = 16; x < w - 16; x += 6) {
          const prog = (x - 16) / (w - 32);
          const ratio = Math.min(1.35, p.routedDaily / Math.max(1, hardCapUsd));
          const wave = Math.sin(t + prog * 6 + idx) * 4;
          const y = h - 20 - prog * ratio * (h - capY - 20) + wave;
          if (x === 16) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [projections, hardCapUsd]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,12,16,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(52,211,153,0.35)' : 'rgba(16,185,129,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          icon={<SavingsIcon sx={{ fontSize: '0.95rem !important', color: '#34D399 !important' }} />}
          label="AGENT BUDGET SENTINEL · FINOPS CIRCUIT BREAKER"
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: 'rgba(52,211,153,0.14)',
            color: '#34D399',
            border: '1px solid rgba(52,211,153,0.35)',
          }}
        />
        <Chip
          icon={<BoltIcon sx={{ fontSize: '0.9rem !important', color: '#D4AF37 !important' }} />}
          label={`LOCAL LOOPBACK OFFLOAD: ${localOffloadPct}%`}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: 'rgba(212,175,55,0.14)',
            color: '#F5E6AB',
          }}
        />
      </Stack>
      <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400, mb: 3 }}>
        Token Burn-Rate Governor & <span style={{ color: '#34D399' }}>Zero-Cost Local Offload</span> Optimizer
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                Daily Agent Invocations: {dailyCalls.toLocaleString()}
              </Typography>
              <Slider min={100} max={10000} step={100} value={dailyCalls} onChange={(_, v) => setDailyCalls(v)} sx={{ color: '#38BDF8' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                Avg Input Context Tokens: {avgInputTokens.toLocaleString()}
              </Typography>
              <Slider min={500} max={32000} step={500} value={avgInputTokens} onChange={(_, v) => setAvgInputTokens(v)} sx={{ color: '#C084FC' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                Avg Output Completion Tokens: {avgOutputTokens.toLocaleString()}
              </Typography>
              <Slider min={200} max={8000} step={100} value={avgOutputTokens} onChange={(_, v) => setAvgOutputTokens(v)} sx={{ color: '#D4AF37' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>
                ZothOS Local Loopback Offload: {localOffloadPct}% ($0.00/token)
              </Typography>
              <Slider min={0} max={95} step={5} value={localOffloadPct} onChange={(_, v) => setLocalOffloadPct(v)} sx={{ color: '#34D399' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#EF4444', fontWeight: 700 }}>
                Daily Hard Circuit-Breaker Cap: ${hardCapUsd} USD
              </Typography>
              <Slider min={5} max={200} step={5} value={hardCapUsd} onChange={(_, v) => setHardCapUsd(v)} sx={{ color: '#EF4444' }} />
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} md={7}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(52,211,153,0.3)',
                bgcolor: '#06080C',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid rgba(52,211,153,0.18)',
                  bgcolor: 'rgba(52,211,153,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#34D399', fontWeight: 700 }}>
                  REAL-TIME TOKEN BURN VELOCITY VS. CIRCUIT BREAKER
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                  60 FPS FINOPS TELEMETRY
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 170, display: 'block' }} />
            </Box>

            <Stack spacing={1.25}>
              {projections.map((p) => (
                <Box
                  key={p.name}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F8FAFC',
                    border: `1px solid ${p.tripped ? 'rgba(239,68,68,0.45)' : 'rgba(148,163,184,0.18)'}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: p.color }}>
                      {p.name}
                    </Typography>
                    <Chip
                      label={p.tripped ? `BREAKER TRIPPED ($${p.routedDaily}/d)` : `$${p.routedDaily}/day · $${p.monthly}/mo`}
                      size="small"
                      sx={{
                        height: 20,
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: p.tripped ? '#EF4444' : '#34D399',
                        bgcolor: p.tripped ? 'rgba(239,68,68,0.14)' : 'rgba(52,211,153,0.12)',
                      }}
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (p.routedDaily / Math.max(1, hardCapUsd)) * 100)}
                    sx={{
                      height: 5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': { bgcolor: p.tripped ? '#EF4444' : p.color },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
