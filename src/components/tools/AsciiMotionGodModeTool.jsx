import React, { useState, useEffect, useRef } from 'react';
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
import TerminalIcon from '@mui/icons-material/Terminal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const GLYPH_RAMPS = {
  ascii: {
    id: 'ascii',
    label: 'Sovereign ASCII',
    chars: ' ·,:;+*?%S#@',
  },
  braille: {
    id: 'braille',
    label: 'Unicode Braille',
    chars: ' ⠁⠃⠇⠏⠟⠿⣿',
  },
  blocks: {
    id: 'blocks',
    label: 'Block Density',
    chars: ' ·░▒▓█',
  },
  hex: {
    id: 'hex',
    label: 'Cyber Hex',
    chars: ' .01379ACEF#',
  },
};

const SHADER_PRESETS = {
  torus4d: {
    id: 'torus4d',
    name: '4D Rotating Torus Knot',
    subtitle: 'Harmonic topological surface with dual-axis phase precession',
    accent: '#D4AF37',
  },
  merkaba: {
    id: 'merkaba',
    name: 'Sacred Merkaba Hypercube',
    subtitle: 'Counter-rotating star tetrahedron & golden ratio interference rings',
    accent: '#C084FC',
  },
  datamosh: {
    id: 'datamosh',
    name: 'CRT Datamosh Wavefront',
    subtitle: 'I-frame displacement vectors with scanline quantization',
    accent: '#EC4899',
  },
  quorum: {
    id: 'quorum',
    name: 'Byzantine Quorum Vortex',
    subtitle: '4-node consensus spiral with cryptographic phase locking',
    accent: '#38BDF8',
  },
  radar: {
    id: 'radar',
    name: 'Perimeter Radar Matrix',
    subtitle: '360° polar sweep with deterministic harmonic target pings',
    accent: '#34D399',
  },
  sigil: {
    id: 'sigil',
    name: 'ZothOS Kernel Sigil',
    subtitle: 'Standing wave lattice & sovereign enclave boundary field',
    accent: '#F59E0B',
  },
};

const SLUG_DEFAULTS = {
  'datamosh-glitch-studio': { preset: 'datamosh', ramp: 'blocks' },
  'nexus-3d-scene-studio': { preset: 'torus4d', ramp: 'ascii' },
  'ufo-sacred-geometry': { preset: 'merkaba', ramp: 'braille' },
  'cyber-turtle-studio': { preset: 'sigil', ramp: 'ascii' },
  'og-canvas-forge': { preset: 'quorum', ramp: 'braille' },
};

function evaluateField(nx, ny, t, preset, warp, freq) {
  const x = nx * freq;
  const y = ny * freq;
  const r = Math.hypot(x, y);
  const a = Math.atan2(y, x);

  if (preset === 'torus4d') {
    const ring1 = Math.cos((r - 0.52 - 0.14 * Math.sin(3 * a + t * 2.1)) * 13);
    const twist = Math.sin(4 * a - t * 2.6 + r * 6 * warp);
    const core = Math.exp(-r * 2.2) * Math.cos(r * 16 - t * 4);
    return Math.max(0, Math.min(1, ring1 * 0.5 + twist * 0.35 + core * 0.45 + 0.55));
  }

  if (preset === 'merkaba') {
    const tri1 = Math.cos(3 * (a + t * 0.9)) * Math.exp(-Math.abs(r - 0.55) * 4.5);
    const tri2 = Math.cos(3 * (a - t * 0.9 + Math.PI / 3)) * Math.exp(-Math.abs(r - 0.55) * 4.5);
    const lattice =
      Math.sin((x * Math.cos(t * 0.5) - y * Math.sin(t * 0.5)) * 10 * warp) *
      Math.cos((x * Math.sin(t * 0.5) + y * Math.cos(t * 0.5)) * 10 * warp);
    const center = Math.exp(-r * 3.8);
    return Math.max(0, Math.min(1, 0.48 + tri1 * 0.45 + tri2 * 0.45 + lattice * 0.25 + center * 0.4));
  }

  if (preset === 'datamosh') {
    const glitchShift = Math.sin(Math.floor((ny + 1) * 12) * 3.7 + Math.floor(t * 6)) * 0.35 * warp;
    const gx = x + glitchShift;
    const band = Math.sin(gx * 8 - t * 5) * Math.cos(y * 14 + Math.sin(t * 3) * 2);
    const macroblock = ((Math.floor((gx + 2) * 4) ^ Math.floor((y + 2) * 4)) % 5) / 5;
    return Math.max(0, Math.min(1, 0.45 + band * 0.45 + (macroblock - 0.5) * 0.35 * warp));
  }

  if (preset === 'quorum') {
    const spiral = Math.sin(r * 15 - t * 4.2 + a * 4);
    const nodes = Math.cos(a * 4 - t * 1.8) * Math.exp(-Math.abs(r - 0.58) * 5);
    const pulse = Math.exp(-r * 2.5) * (0.5 + 0.5 * Math.sin(t * 5));
    return Math.max(0, Math.min(1, 0.48 + spiral * 0.32 * warp + nodes * 0.42 + pulse * 0.3));
  }

  if (preset === 'radar') {
    const sweepAngle = (t * 2.2) % (Math.PI * 2);
    const diff = (((a - sweepAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const beam = Math.exp(-diff * 3.2) * Math.exp(-r * 0.9);
    const rings = Math.pow(Math.max(0, Math.cos(r * 16)), 6) * 0.55;
    const cross = Math.abs(nx) < 0.035 || Math.abs(ny) < 0.035 ? 0.45 : 0;
    return Math.max(0, Math.min(1, beam * 0.85 + rings + cross));
  }

  const hexWave = Math.cos(6 * a + Math.sin(r * 10 - t * 3) * warp * 2);
  const seal = Math.exp(-Math.abs(r - 0.62) * 6.5) + Math.exp(-Math.abs(r - 0.32) * 7.5);
  const standing = Math.cos(r * 18 - t * 3.8) * 0.35;
  return Math.max(0, Math.min(1, 0.25 + seal * 0.55 + hexWave * 0.25 + standing));
}

export default function AsciiMotionGodModeTool({ tool }) {
  const defaultCfg = SLUG_DEFAULTS[tool?.id] || SLUG_DEFAULTS[tool?.slug] || { preset: 'torus4d', ramp: 'ascii' };
  const [preset, setPreset] = useState(defaultCfg.preset);
  const [rampKey, setRampKey] = useState(defaultCfg.ramp);
  const [cols, setCols] = useState(68);
  const [speed, setSpeed] = useState(1.0);
  const [warp, setWarp] = useState(1.15);
  const [freq, setFreq] = useState(1.25);
  const [playing, setPlaying] = useState(true);
  const [asciiSnapshot, setAsciiSnapshot] = useState('');
  const [copiedMode, setCopiedMode] = useState(null);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const cfg = SLUG_DEFAULTS[tool?.id] || SLUG_DEFAULTS[tool?.slug];
    if (cfg) {
      setPreset(cfg.preset);
      setRampKey(cfg.ramp);
    }
  }, [tool?.id, tool?.slug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();
    let frameCounter = 0;

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) {
        timeRef.current += dt * speed;
      }
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 720;
      const ch = canvas.clientHeight || 360;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, cw, ch);

      const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
      const ramp = (GLYPH_RAMPS[rampKey] || GLYPH_RAMPS.ascii).chars;

      const rows = Math.max(16, Math.round(cols * (ch / cw) * 0.55));
      const cellW = cw / cols;
      const cellH = ch / rows;
      const fontSize = Math.max(9, Math.min(16, Math.floor(cellH * 0.92)));

      ctx.font = `600 ${fontSize}px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textRows = [];
      const captureText = frameCounter % 12 === 0;

      for (let r = 0; r < rows; r++) {
        const ny = (r / (rows - 1)) * 2 - 1;
        let rowStr = '';
        for (let c = 0; c < cols; c++) {
          const nx = ((c / (cols - 1)) * 2 - 1) * (cw / ch) * 0.72;
          const v = evaluateField(nx, ny, t, preset, warp, freq);
          const idx = Math.min(ramp.length - 1, Math.max(0, Math.floor(v * ramp.length)));
          const chGlyph = ramp[idx];
          if (captureText) rowStr += chGlyph;

          if (idx > 0) {
            const alpha = (0.16 + v * 0.84).toFixed(2);
            if (v > 0.78) {
              ctx.fillStyle = `rgba(255, 250, 235, ${alpha})`;
            } else {
              ctx.fillStyle = activePreset.accent;
              ctx.globalAlpha = Number(alpha);
            }
            ctx.fillText(chGlyph, c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
            ctx.globalAlpha = 1;
          }
        }
        if (captureText) textRows.push(rowStr);
      }

      ctx.fillStyle = 'rgba(245, 230, 171, 0.7)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(
        `ASCII_SHADER // ${activePreset.name.toUpperCase()} // ${cols}x${rows} MATRIX // t=${t.toFixed(2)}s`,
        14,
        18
      );

      ctx.restore();

      if (captureText) {
        setAsciiSnapshot(textRows.join('\n'));
      }
      frameCounter++;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [preset, rampKey, cols, speed, warp, freq, playing]);

  const copyPayload = (mode) => {
    const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
    const ramp = (GLYPH_RAMPS[rampKey] || GLYPH_RAMPS.ascii).chars;

    let text = '';
    if (mode === 'frame') {
      text = [`/* ZOTH STUDIO // ASCII MOTION FRAME (${activePreset.name}) */`, asciiSnapshot].join('\n');
    } else if (mode === 'embed') {
      text = `<!-- Zoth Studio Standalone 60FPS ASCII Motion Shader (${activePreset.name}) -->
<pre id="zoth-ascii-stage" style="background:#050508;color:${activePreset.accent};font:600 11px/1.15 'JetBrains Mono',monospace;padding:20px;border-radius:12px;overflow:hidden;margin:0;"></pre>
<script>
(function(){
  const pre = document.getElementById('zoth-ascii-stage');
  const ramp = ${JSON.stringify(ramp)};
  const cols = ${Math.min(cols, 72)}, rows = 26;
  let t = 0;
  function tick(){
    t += 0.04 * ${speed};
    let out = '';
    for (let r = 0; r < rows; r++) {
      const ny = (r / (rows - 1)) * 2 - 1;
      for (let c = 0; c < cols; c++) {
        const nx = ((c / (cols - 1)) * 2 - 1) * 1.35;
        const dist = Math.hypot(nx * ${freq}, ny * ${freq});
        const ang = Math.atan2(ny, nx);
        const v = Math.max(0, Math.min(0.99, 0.5 + 0.35 * Math.cos(dist * 12 - t * 3.5) + 0.25 * Math.sin(ang * 4 + t * 2)));
        out += ramp[Math.floor(v * ramp.length)];
      }
      out += '\\n';
    }
    pre.textContent = out;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
</script>`;
    }

    navigator.clipboard?.writeText(text);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 1800);
  };

  const activePresetObj = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07080D',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
      }}
    >
      {/* Top Header Strip */}
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
              color: '#D4AF37',
              display: 'flex',
            }}
          >
            <TerminalIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.14em' }}>
                ASCII &amp; BRAILLE MOTION SYNTH
              </Typography>
              <Chip
                label="60 FPS DETERMINISTIC"
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
              {activePresetObj.name} — {activePresetObj.subtitle}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            {playing ? 'Pause Field' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => copyPayload('frame')}
            startIcon={copiedMode === 'frame' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#F5E6AB',
              borderColor: 'rgba(212,175,55,0.45)',
              bgcolor: 'rgba(212,175,55,0.12)',
            }}
          >
            {copiedMode === 'frame' ? 'ASCII Copied' : 'Copy ASCII Frame'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => copyPayload('embed')}
            startIcon={copiedMode === 'embed' ? <CheckIcon sx={{ fontSize: 15 }} /> : <CodeIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copiedMode === 'embed' ? 'Snippet Copied' : 'Export HTML/JS Shader'}
          </Button>
        </Stack>
      </Box>

      {/* Main Grid */}
      <Grid container>
        <Grid xs={12} md={8} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#050508' }}>
          <Box sx={{ width: '100%', height: { xs: 300, sm: 380 } }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#090B11',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {Object.values(SHADER_PRESETS).map((item) => (
              <Button
                key={item.id}
                size="small"
                variant="outlined"
                onClick={() => setPreset(item.id)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: preset === item.id ? item.accent : 'rgba(255,255,255,0.02)',
                  color: preset === item.id ? '#050508' : '#94A3B8',
                  borderColor: preset === item.id ? item.accent : 'rgba(255,255,255,0.12)',
                  '&:hover': {
                    bgcolor: preset === item.id ? '#F5E6AB' : 'rgba(255,255,255,0.08)',
                    borderColor: item.accent,
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={4} sx={{ p: 2.5, bgcolor: '#090B10', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1, letterSpacing: '0.08em' }}>
              CHARACTER RAMP QUANTIZER
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {Object.values(GLYPH_RAMPS).map((r) => (
                <Grid xs={6} key={r.id}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => setRampKey(r.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      fontFamily: mono,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 0.8,
                      bgcolor: rampKey === r.id ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.02)',
                      color: rampKey === r.id ? '#F5E6AB' : '#94A3B8',
                      borderColor: rampKey === r.id ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {r.label}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>MATRIX COLUMNS</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{cols} cols</Typography>
              </Box>
              <Slider size="small" min={42} max={96} step={2} value={cols} onChange={(_, v) => setCols(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>TEMPORAL VELOCITY</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{speed.toFixed(2)}x</Typography>
              </Box>
              <Slider size="small" min={0.2} max={2.5} step={0.05} value={speed} onChange={(_, v) => setSpeed(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>HARMONIC WARP</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{warp.toFixed(2)}</Typography>
              </Box>
              <Slider size="small" min={0.3} max={2.4} step={0.05} value={warp} onChange={(_, v) => setWarp(v)} sx={{ color: '#D4AF37' }} />
            </Box>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#050508', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#94A3B8', fontWeight: 700 }}>LIVE DOM TEXT MATRIX</Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#34D399', fontWeight: 800 }}>READY TO EMBED</Typography>
            </Box>
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily: mono,
                fontSize: '6.5px',
                lineHeight: '7px',
                color: 'rgba(212,175,55,0.85)',
                overflow: 'hidden',
                maxHeight: 96,
              }}
            >
              {asciiSnapshot}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
