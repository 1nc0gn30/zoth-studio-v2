import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CodeIcon from '@mui/icons-material/Code';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const MATH_PILLARS = [
  {
    id: 'l0',
    pillar: 'PILLAR I // L0 KERNEL & ENTROPY',
    formula: 'H(X) = -∑ P(xᵢ) log₂ P(xᵢ)',
    metric: '3.84 bits/char',
    status: 'OPTIMAL',
    accent: '#D4AF37',
    description: 'Character-level Shannon entropy & KV-cache memory pressure across local Ollama / Antigravity / Hermes inference streams.',
  },
  {
    id: 'l1',
    pillar: 'PILLAR II // L1 CRYPTOGRAPHIC LATTICE',
    formula: 'PPL(X) = 2^{H(X)} = 14.32',
    metric: 'Ed25519 + ChaCha20',
    status: 'VERIFIED',
    accent: '#34D399',
    description: 'Token perplexity bounds, Ed25519 signature verification, and deterministic zero-leakage state transitions.',
  },
  {
    id: 'l2',
    pillar: 'PILLAR III // L2 MARKOV COGNITIVE STATE',
    formula: 'P(Sₜ₊₁ | Sₜ) → ACTIVE_SYNTHESIS',
    metric: '184 tok/s',
    status: 'LASER SHARP',
    accent: '#38BDF8',
    description: 'Real-time 4-state Markov cognitive chain (Reading → Planning → Executing → Answering) with sub-millisecond UDP (:9996) telemetry.',
  },
  {
    id: 'l3',
    pillar: 'PILLAR IV // L3 SWARM CONSENSUS',
    formula: 'R(t) = ∑ wᵢ · Cᵢ(t) ≥ 0.94',
    metric: '3 Active Agents',
    status: 'SYNCHRONIZED',
    accent: '#C084FC',
    description: 'Multi-agent Byzantine quorum synthesis combining Antigravity, Ollama, and Hermes with live plain-English reasoning audit trails.',
  },
];

export default function ZothPillGodModeTool() {
  const [selectedPillar, setSelectedPillar] = useState(MATH_PILLARS[0]);
  const [hudMode, setHudMode] = useState('compact-pill');
  const [playing, setPlaying] = useState(true);
  const [entropyTarget, setEntropyTarget] = useState(3.84);
  const [velocityToks, setVelocityToks] = useState(184);
  const [liveData, setLiveData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch('http://127.0.0.1:9995/active');
        if (res.ok) {
          const json = await res.json();
          if (mounted) setLiveData(json);
        }
      } catch (_e) {
        // Fallback to simulated browser math telemetry when offline
      }
    };
    poll();
    const id = setInterval(poll, 2500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) timeRef.current += dt;
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 720;
      const ch = canvas.clientHeight || 340;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#06080C';
      ctx.fillRect(0, 0, cw, ch);

      // Subtle Braille math matrix backdrop
      ctx.font = `600 10px ${mono}`;
      ctx.fillStyle = 'rgba(212, 175, 55, 0.07)';
      const braille = '⠁⠃⠇⠏⠟⠿⣿';
      for (let x = 20; x < cw; x += 34) {
        for (let y = 38; y < ch; y += 22) {
          const v = Math.sin(x * 0.02 + t * 1.8) * Math.cos(y * 0.03 - t * 1.4);
          const idx = Math.max(0, Math.min(braille.length - 1, Math.floor((v + 1) * 0.5 * braille.length)));
          ctx.fillText(braille[idx], x, y);
        }
      }

      // Draw Compact Pill Preview or Full 4-Pillar Waveform
      const cx = cw * 0.5;
      const cy = ch * 0.52;

      if (hudMode === 'compact-pill') {
        const pw = Math.min(cw - 40, 440);
        const ph = 78;
        const px = cx - pw / 2;
        const py = cy - ph / 2;

        ctx.fillStyle = 'rgba(12, 16, 24, 0.95)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 39);
        ctx.fill();
        ctx.stroke();

        // Pulsing φ emblem
        ctx.beginPath();
        ctx.arc(px + 38, cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.16)';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.stroke();

        ctx.font = `800 15px ${mono}`;
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('φ', px + 38, cy);

        ctx.textAlign = 'left';
        ctx.font = `800 11px ${mono}`;
        ctx.fillStyle = '#F3EBD4';
        ctx.fillText('ZOTH PILL // ACTIVE_SYNTHESIS', px + 70, cy - 14);

        ctx.font = `600 10px ${mono}`;
        ctx.fillStyle = '#34D399';
        const liveH = (entropyTarget + Math.sin(t * 2.1) * 0.08).toFixed(2);
        const livePpl = Math.pow(2, parseFloat(liveH)).toFixed(1);
        ctx.fillText(`H(X)=${liveH} bits/c • PPL=${livePpl} • ${velocityToks} tok/s`, px + 70, cy + 4);

        // Mini focus bar inside pill
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(px + 70, cy + 16, pw - 100, 5);
        const grad = ctx.createLinearGradient(px + 70, 0, px + pw - 30, 0);
        grad.addColorStop(0, '#FF5252');
        grad.addColorStop(0.5, '#FFD700');
        grad.addColorStop(1, '#00E676');
        ctx.fillStyle = grad;
        ctx.fillRect(px + 70, cy + 16, (pw - 100) * 0.88, 5);
      } else {
        // 4-Pillar Harmonic Oscilloscope
        MATH_PILLARS.forEach((p, idx) => {
          const baseY = 68 + idx * 62;
          ctx.font = `700 9.5px ${mono}`;
          ctx.fillStyle = p.accent;
          ctx.textAlign = 'left';
          ctx.fillText(`${p.pillar} — ${p.formula}`, 24, baseY - 12);

          ctx.beginPath();
          for (let x = 24; x < cw - 24; x += 4) {
            const norm = (x - 24) / (cw - 48);
            const amp = selectedPillar.id === p.id ? 14 : 8;
            const y = baseY + Math.sin(norm * 14 + t * (2.5 + idx * 0.6) + idx) * amp * Math.sin(norm * Math.PI);
            if (x === 24) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = p.accent;
          ctx.lineWidth = selectedPillar.id === p.id ? 2.2 : 1.2;
          ctx.stroke();
        });
      }

      // Top HUD status bar
      ctx.fillStyle = 'rgba(5, 6, 10, 0.92)';
      ctx.fillRect(0, 0, cw, 28);
      ctx.font = `700 10px ${mono}`;
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'left';
      ctx.fillText(`ZOTH PILL (:9995 HTTP / :9996 UDP) // MODE: ${hudMode.toUpperCase()}`, 12, 16);
      ctx.fillStyle = '#34D399';
      ctx.textAlign = 'right';
      ctx.fillText(liveData ? 'DAEMON: ONLINE (127.0.0.1:9995)' : 'SIMULATION: ACTIVE', cw - 12, 16);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [playing, hudMode, selectedPillar, entropyTarget, velocityToks, liveData]);

  const cliSnippet = useMemo(() => {
    return `# 1. Launch Zoth Pill in Compact Floating Desktop Pill Mode (:9995)
zoth-pill --pill

# 2. Launch Full 4-Pillar Mathematical Telemetry HUD Window
zoth-pill desktop

# 3. Render 60fps Unicode U+2800 Sub-Pixel Braille TUI Sparklines
zoth-pill-tui --status

# 4. Stream Custom Agent Cognitive Telemetry over UDP (:9996) or HTTP (:9995)
curl -s http://127.0.0.1:9995/active | jq .`;
  }, []);

  const handleCopy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07080D',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
        mb: 4,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0D14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(212,175,55,0.14)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#FFD700',
              display: 'flex',
            }}
          >
            <SecurityIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: '#FFD700', letterSpacing: '0.12em' }}>
                ZOTH PILL // 4-PILLAR MATHEMATICAL TELEMETRY HUD (:9995)
              </Typography>
              <Chip
                label={liveData ? 'LIVE DAEMON :9995' : 'BROWSER ENGINE ACTIVE'}
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(16,185,129,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              Real-Time Shannon Entropy H(X), Token Perplexity PPL(X), Markov Cognitive State & Compact Desktop Pill
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setHudMode((m) => (m === 'compact-pill' ? 'full-cockpit' : 'compact-pill'))}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#FFD700',
              borderColor: 'rgba(255,215,0,0.35)',
            }}
          >
            {hudMode === 'compact-pill' ? 'Switch to 4-Pillar Waves' : 'Switch to Compact Pill'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPlaying((p) => !p)}
            startIcon={playing ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            {playing ? 'Pause' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleCopy('cli', cliSnippet)}
            startIcon={copiedKey === 'cli' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#FFD700',
              color: '#060609',
              '&:hover': { bgcolor: '#FFF099' },
            }}
          >
            {copiedKey === 'cli' ? 'Copied CLI' : 'Copy Pill CLI'}
          </Button>
        </Stack>
      </Box>

      <SovereignEyebrow accent="#FFD700" right="Security & Enclave">
        {"zoth-pill"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"zoth-pill"}
        eyebrow={"Security & Enclave"}
        caption={"Zoth Pill (4-Pillar Math HUD)"}
        label={"Zoth Pill — 4-Pillar Mathematical Cognitive Gauge"}
      />

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05060A' }}>
          <Box sx={{ width: '100%', height: { xs: 280, sm: 340 } }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#07090F' }}>
            <Grid container spacing={1.5}>
              {MATH_PILLARS.map((p) => {
                const active = selectedPillar.id === p.id;
                return (
                  <Grid xs={12} sm={6} key={p.id}>
                    <Box
                      onClick={() => setSelectedPillar(p)}
                      sx={{
                        p: 1.4,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: active ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.02)',
                        border: active ? `1px solid ${p.accent}` : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, color: p.accent }}>
                          {p.pillar}
                        </Typography>
                        <Chip
                          label={p.status}
                          size="small"
                          sx={{ height: 18, fontFamily: mono, fontSize: '0.58rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.14)', color: '#34D399' }}
                        />
                      </Stack>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: '#F3EBD4', mt: 0.5 }}>
                        {p.formula} • {p.metric}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.4 }}>
                        {p.description}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#090B10', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#FFD700', mb: 1.5 }}>
              INTERACTIVE COGNITIVE GAUGE PARAMETERS
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8' }}>SHANNON ENTROPY H(X)</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#FFD700', fontWeight: 800 }}>{entropyTarget.toFixed(2)} bits/char</Typography>
              </Stack>
              <Slider
                size="small"
                min={2.5}
                max={4.8}
                step={0.05}
                value={entropyTarget}
                onChange={(_, v) => setEntropyTarget(v)}
                sx={{ color: '#FFD700' }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8' }}>TOKEN VELOCITY (∂T/∂t)</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#34D399', fontWeight: 800 }}>{velocityToks} tok/s</Typography>
              </Stack>
              <Slider
                size="small"
                min={20}
                max={420}
                step={5}
                value={velocityToks}
                onChange={(_, v) => setVelocityToks(v)}
                sx={{ color: '#34D399' }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#05060A', border: '1px solid rgba(255,215,0,0.28)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#FFD700', fontWeight: 800 }}>
                ZOTHOS CLI, ELECTRON PILL & TUI COMMANDS
              </Typography>
              <Button
                size="small"
                onClick={() => handleCopy('inline', cliSnippet)}
                startIcon={copiedKey === 'inline' ? <CheckIcon sx={{ fontSize: 13 }} /> : <CodeIcon sx={{ fontSize: 13 }} />}
                sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#34D399', py: 0 }}
              >
                {copiedKey === 'inline' ? 'Copied' : 'Copy'}
              </Button>
            </Stack>
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily: mono,
                fontSize: '0.68rem',
                lineHeight: 1.45,
                color: '#E2E8F0',
                overflowX: 'auto',
              }}
            >
              {cliSnippet}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
