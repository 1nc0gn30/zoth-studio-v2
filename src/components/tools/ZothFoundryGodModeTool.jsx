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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const FOUNDRY_MODES = {
  'zoth-webgen': {
    title: 'Zoth WebGen Autonomous Site Foundry',
    subtitle: '6-Archetype Full-Stack Compiler with Schema.org AEO & Triple-Viewport Guardrails',
    accent: '#D4AF37',
    glyphs: ' ·,:;+*?%S#@',
  },
  'zoth-swarm-multiplexer': {
    title: 'Zoth Swarm Daemon Multiplexer',
    subtitle: '22-Daemon Loopback PTY Multiplexer & Byzantine Quorum Bus (:8094–:8121)',
    accent: '#38BDF8',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿',
  },
  'zoth-civilization': {
    title: 'Zoth Multi-Agent Civilization Engine',
    subtitle: 'Emergent Autonomous Agent Society, Resource Ledger & Consensus Simulation',
    accent: '#34D399',
    glyphs: ' ·░▒▓█',
  },
  'vision-gesture-control': {
    title: 'Vision 21-Joint 3D Spatial Hand Tracker',
    subtitle: 'Sub-15ms MediaPipe Skeletal Kinematics & Air-Canvas MCP Bridge',
    accent: '#C084FC',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿',
  },
  'likeness-desk': {
    title: 'Likeness Desk Identity & Rights Vault',
    subtitle: 'Cryptographic Biometric Consent Ledger & Perceptual Hash Watermarker',
    accent: '#EC4899',
    glyphs: ' .01379ACEF#',
  },
  'bolt-diy': {
    title: 'Bolt.DIY Local Full-Stack Sandbox',
    subtitle: 'Air-Gapped WebContainer & Local Ollama Code Generation Workbench',
    accent: '#F59E0B',
    glyphs: ' ·,:;+*?%S#@',
  },
  'city-desk': {
    title: 'City Desk 1,000-Page Programmatic Trade & Geo Engine',
    subtitle: 'Static Trade × City AEO Matrix, Schema.org LocalBusiness Graph & Zero-Bloat Navbar',
    accent: '#34D399',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿',
  },
};

export default function ZothFoundryGodModeTool({ tool }) {
  const slug = tool?.id || 'zoth-webgen';
  const mode = FOUNDRY_MODES[slug] || {
    title: `${tool?.name || 'Sovereign Foundry'} God-Mode Studio`,
    subtitle: 'Deterministic 60fps ASCII/Vector Synthesizer & Autonomous Artifact Compiler',
    accent: '#D4AF37',
    glyphs: ' ⠁⠃⠇⠏⠟⠿⣿',
  };

  const [density, setDensity] = useState(52);
  const [harmonic, setHarmonic] = useState(3.0);
  const [directive, setDirective] = useState(
    `Compile production artifact for ${tool?.name || 'Sovereign Foundry'} with zero console errors and verified contact metadata`
  );
  const [running, setRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      if (running) t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 350;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#05060B';
      ctx.fillRect(0, 0, cw, ch);

      const cols = density;
      const rows = Math.max(16, Math.round(cols * (ch / cw) * 0.55));
      const cellW = cw / cols;
      const cellH = ch / rows;
      const ramp = mode.glyphs;

      ctx.font = `600 ${Math.max(8, Math.floor(cellH * 0.88))}px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        const ny = (r / (rows - 1)) * 2 - 1;
        for (let c = 0; c < cols; c++) {
          const nx = ((c / (cols - 1)) * 2 - 1) * (cw / ch) * 0.75;
          const dist = Math.hypot(nx, ny);
          const ang = Math.atan2(ny, nx);
          const v = Math.max(
            0,
            Math.min(
              0.99,
              0.48 +
                0.35 * Math.cos(dist * 11 - t * 3.4 + Math.sin(ang * harmonic)) +
                0.22 * Math.sin(nx * 6 * harmonic + t * 2.1)
            )
          );
          const idx = Math.floor(v * ramp.length);
          if (idx > 0) {
            ctx.fillStyle = v > 0.78 ? '#FFFBEB' : mode.accent;
            ctx.globalAlpha = 0.16 + v * 0.82;
            ctx.fillText(ramp[idx], c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
            ctx.globalAlpha = 1;
          }
        }
      }

      ctx.fillStyle = 'rgba(5, 6, 11, 0.88)';
      ctx.fillRect(0, 0, cw, 28);
      ctx.fillStyle = 'rgba(245,230,171,0.88)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`FOUNDRY_CORE // ${slug.toUpperCase()} // ${cols}x${rows} MATRIX`, 14, 16);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [density, harmonic, running, mode.accent, mode.glyphs, slug]);

  const manifest = JSON.stringify(
    {
      workstation: slug,
      title: mode.title,
      operator: 'Neal Frazier (Neal Frazier Tech)',
      dispatchEmail: 'neal@nealfrazier.tech',
      gridMatrix: `${density} cols`,
      harmonicOrder: harmonic,
      directive,
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(manifest);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07080E',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0D16',
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
            <AutoAwesomeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.14em' }}>
                {mode.title.toUpperCase()}
              </Typography>
              <Chip
                label="60 FPS SOVEREIGN CORE"
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
              {mode.subtitle}
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
            {running ? 'Pause Shader' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleCopy}
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
            {copied ? 'Manifest Copied' : 'Export Foundry Spec'}
          </Button>
        </Stack>
      </Box>

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05060B' }}>
          <Box sx={{ width: '100%', height: 350 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#080A12', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              FOUNDRY EXECUTION DIRECTIVE
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.76rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                },
              }}
            />

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>ASCII MATRIX DENSITY</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{density} cols</Typography>
              </Box>
              <Slider size="small" min={36} max={84} step={2} value={density} onChange={(_, v) => setDensity(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>SYMMETRY HARMONIC ORDER</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{harmonic.toFixed(1)}</Typography>
              </Box>
              <Slider size="small" min={1} max={8} step={0.5} value={harmonic} onChange={(_, v) => setHarmonic(v)} sx={{ color: '#D4AF37' }} />
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
              maxHeight: 150,
            }}
          >
            {manifest}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
