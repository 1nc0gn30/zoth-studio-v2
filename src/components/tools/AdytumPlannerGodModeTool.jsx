import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Slider,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const HERMETIC_KEYS = [
  { key: 0, arcana: '0 · The Fool (Aleph)', phase: 'Zero-State Intention', gate: 'Air / Pneuma', prompt: 'Strip all inherited assumptions; define the irreducible sovereign objective.' },
  { key: 1, arcana: 'I · The Magician (Beth)', phase: 'Tool & Will Alignment', gate: 'Mercury / Logos', prompt: 'Bind local CLI tools, MCP endpoints, and hardware compute to the single intention.' },
  { key: 7, arcana: 'VII · The Chariot (Cheth)', phase: 'Deterministic Execution Vector', gate: 'Cancer / Armor', prompt: 'Lock the execution harness into a bounded, zero-drift trajectory with verify gates.' },
  { key: 9, arcana: 'IX · The Hermit (Yod)', phase: 'Air-Gapped Incubation', gate: 'Virgo / Lantern', prompt: 'Isolate the reasoning loop inside loopback silicon (127.0.0.1) with zero external egress.' },
  { key: 11, arcana: 'XI · Justice (Lamed)', phase: 'Invariant Equilibrium Audit', gate: 'Libra / Scales', prompt: 'Verify mathematical invariants, memory safety, and cryptographic proofs before commit.' },
  { key: 21, arcana: 'XXI · The World (Tau)', phase: 'Manifestation & Seal', gate: 'Saturn / Crown', prompt: 'Seal the compiled artifact, emit deterministic SHA-256 manifest, and close the rite.' },
];

const BRAILLE_RAMP = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AdytumPlannerGodModeTool() {
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [intention, setIntention] = useState('Architect zero-egress Byzantine consensus enclave with deterministic local verification');
  const [incubationDepth, setIncubationDepth] = useState(5);
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const activeKey = HERMETIC_KEYS[selectedIdx] || HERMETIC_KEYS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const sephiroth = [
      { id: 'Kether', x: 0.5, y: 0.13 },
      { id: 'Chokmah', x: 0.76, y: 0.25 },
      { id: 'Binah', x: 0.24, y: 0.25 },
      { id: 'Chesed', x: 0.76, y: 0.45 },
      { id: 'Geburah', x: 0.24, y: 0.45 },
      { id: 'Tiphereth', x: 0.5, y: 0.52 },
      { id: 'Netzach', x: 0.76, y: 0.68 },
      { id: 'Hod', x: 0.24, y: 0.68 },
      { id: 'Yesod', x: 0.5, y: 0.78 },
      { id: 'Malkuth', x: 0.5, y: 0.91 },
    ];

    const paths = [
      [0, 1], [0, 2], [0, 5], [1, 2], [1, 3], [1, 5], [2, 4], [2, 5],
      [3, 4], [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8],
      [6, 7], [6, 8], [6, 9], [7, 8], [7, 9], [8, 9],
    ];

    const render = () => {
      if (running) t += 0.018;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 360;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#050509';
      ctx.fillRect(0, 0, cw, ch);

      ctx.font = `10px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = 38;
      const rows = 18;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c / (cols - 1)) * 2 - 1;
          const ny = (r / (rows - 1)) * 2 - 1;
          const dist = Math.hypot(nx, ny);
          const wave = 0.5 + 0.5 * Math.cos(dist * 10 - t * 2.4 + selectedIdx);
          const idx = Math.min(BRAILLE_RAMP.length - 1, Math.floor(wave * BRAILLE_RAMP.length));
          if (idx > 1) {
            ctx.fillStyle = `rgba(212, 175, 55, ${(wave * 0.22).toFixed(2)})`;
            ctx.fillText(BRAILLE_RAMP[idx], (c + 0.5) * (cw / cols), (r + 0.5) * (ch / rows));
          }
        }
      }

      paths.forEach(([a, b], i) => {
        const na = sephiroth[a];
        const nb = sephiroth[b];
        const x1 = na.x * cw;
        const y1 = na.y * ch;
        const x2 = nb.x * cw;
        const y2 = nb.y * ch;
        const isActive = i % HERMETIC_KEYS.length === selectedIdx;

        ctx.strokeStyle = isActive ? 'rgba(212, 175, 55, 0.85)' : 'rgba(192, 132, 252, 0.24)';
        ctx.lineWidth = isActive ? 2.2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const p = (t * 0.65 + i * 0.13) % 1;
        const px = x1 + (x2 - x1) * p;
        const py = y1 + (y2 - y1) * p;
        ctx.fillStyle = isActive ? '#F5E6AB' : '#C084FC';
        ctx.beginPath();
        ctx.arc(px, py, isActive ? 3.2 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      sephiroth.forEach((node, idx) => {
        const x = node.x * cw;
        const y = node.y * ch;
        const pulse = 1 + 0.14 * Math.sin(t * 3 + idx);

        ctx.fillStyle = '#090812';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, 11 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F5E6AB';
        ctx.font = `600 9px ${mono}`;
        ctx.fillText(node.id.toUpperCase(), x, y - 16);
      });

      ctx.fillStyle = 'rgba(245, 230, 171, 0.72)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`ADYTUM // 22-KEY HERMETIC RITE // KEY [${activeKey.arcana.toUpperCase()}]`, 14, 18);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [selectedIdx, running, activeKey.arcana]);

  const artifactJson = JSON.stringify(
    {
      protocol: 'adytum.hermetic.rite.v1',
      selectedArcana: activeKey.arcana,
      alchemicalPhase: activeKey.phase,
      elementalGate: activeKey.gate,
      sovereignIntention: intention,
      incubationMinutes: incubationDepth,
      localModelGate: 'ollama://qwen2.5-coder:1.5b-instruct (127.0.0.1:11434)',
      directive: activeKey.prompt,
    },
    null,
    2
  );

  const copyPlan = () => {
    navigator.clipboard?.writeText(artifactJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07070C',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0B14',
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
              color: '#D4AF37',
              display: 'flex',
            }}
          >
            <AccountTreeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.14em' }}>
                ADYTUM 22-KEY HERMETIC PLANNING RITE
              </Typography>
              <Chip
                label="60 FPS TREE OF LIFE LATTICE"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(192,132,252,0.15)',
                  color: '#C084FC',
                  border: '1px solid rgba(192,132,252,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              Deterministic intention crystallization, 5-minute incubation timer & local-model gate
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunning((r) => !r)}
            startIcon={running ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            {running ? 'Pause Lattice' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={copyPlan}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copied ? 'Rite Copied' : 'Export Rite Manifest'}
          </Button>
        </Stack>
      </Box>

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#050509' }}>
          <Box sx={{ width: '100%', height: 350 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#090912',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {HERMETIC_KEYS.map((item, idx) => (
              <Button
                key={item.key}
                size="small"
                variant="outlined"
                onClick={() => setSelectedIdx(idx)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: selectedIdx === idx ? '#D4AF37' : 'rgba(255,255,255,0.02)',
                  color: selectedIdx === idx ? '#050508' : '#94A3B8',
                  borderColor: selectedIdx === idx ? '#D4AF37' : 'rgba(255,255,255,0.12)',
                }}
              >
                {item.arcana}
              </Button>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#090910', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              SOVEREIGN INTENTION VECTOR
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                },
              }}
            />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>INCUBATION GATE DURATION</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{incubationDepth} min</Typography>
              </Box>
              <Slider size="small" min={1} max={22} value={incubationDepth} onChange={(_, v) => setIncubationDepth(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#D4AF37' }}>
                {activeKey.arcana} — {activeKey.phase}
              </Typography>
              <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.78rem', mt: 0.5 }}>
                {activeKey.prompt}
              </Typography>
            </Box>
          </Box>

          <Box
            component="pre"
            sx={{
              p: 1.5,
              m: 0,
              borderRadius: 2,
              bgcolor: '#040407',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: mono,
              fontSize: '0.68rem',
              color: '#34D399',
              overflowX: 'auto',
              maxHeight: 145,
            }}
          >
            {artifactJson}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
