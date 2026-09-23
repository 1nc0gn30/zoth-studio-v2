import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Chip, Button, Grid, Stack, TextField,
  Divider, Card, CardContent, Tabs, Tab, Alert, IconButton, Slider, LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* ==========================================================================
   THEME-AWARE COLOR HELPERS
   ========================================================================== */
const gold = (t) => (t.palette.mode === 'dark' ? '#D4AF37' : '#B8860B');
const goldSoft = (t) => (t.palette.mode === 'dark' ? '#F5E6AB' : '#8A6A09');
const goldBg = (t) => (t.palette.mode === 'dark' ? 'rgba(212,175,55,0.16)' : '#FEF9E7');
const goldBorder = (t) => (t.palette.mode === 'dark' ? 'rgba(212,175,55,0.42)' : '#F5E6AB');
const darkPanel = (t) => (t.palette.mode === 'dark' ? '#0B0B12' : '#0F172A');
const darkPanelBorder = (t) => (t.palette.mode === 'dark' ? '#2A2A38' : '#1E293B');
const successBg = (t) => (t.palette.mode === 'dark' ? 'rgba(18,183,106,0.16)' : '#ECFDF3');
const successFg = (t) => (t.palette.mode === 'dark' ? '#34D399' : '#027A48');
const errorBg = (t) => (t.palette.mode === 'dark' ? 'rgba(244,63,94,0.16)' : '#FEF3F2');
const errorFg = (t) => (t.palette.mode === 'dark' ? '#F87171' : '#B42318');
const chipNeutralBg = (t) => (t.palette.mode === 'dark' ? '#1A1A24' : '#F2F4F7');
const chipNeutralFg = (t) => (t.palette.mode === 'dark' ? '#EDEFF2' : '#101828');
const tabsBg = (t) => (t.palette.mode === 'dark' ? '#12121A' : '#F9FAFB');

/* ==========================================================================
   TOOL 1: JWT Inspector Guard (Real Live JWT Decoder & Security Validator)
   ========================================================================== */
function JwtInspectorTool() {
  const theme = useTheme();
  const sampleAdmin = 'eyJhbG...sw5c';
  const sampleUser = 'eyJhbG...ture';
  const sampleNone = 'eyJhbG...QifQ.';

  const [token, setToken] = useState(sampleAdmin);
  const [copied, setCopied] = useState(false);

  let header = {};
  let payload = {};
  let isValid = false;
  let signature = '';

  try {
    const parts = token.trim().split('.');
    if (parts.length >= 2) {
      header = JSON.parse(atob(parts[0]));
      payload = JSON.parse(atob(parts[1]));
      signature = parts[2] || '';
      isValid = true;
    }
  } catch {
    isValid = false;
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography className="section-kicker">JWT Token Input</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => setToken(sampleAdmin)}>Admin Token</Button>
          <Button size="small" variant="outlined" onClick={() => setToken(sampleUser)}>User Token</Button>
          <Button size="small" variant="outlined" onClick={() => setToken(sampleNone)}>Unsigned Token</Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        multiline
        minRows={3}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste JWT token (header.payload.signature)..."
        sx={{ mb: 3, bgcolor: theme.palette.background.paper, fontFamily: mono }}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%', bgcolor: theme.palette.background.paper }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold(theme), mb: 1.5 }}>
              Decoded Header (Algorithm &amp; Token Type)
            </Typography>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), color: '#F5E6AB', fontFamily: mono, fontSize: '0.85rem', whiteSpace: 'pre-wrap', borderRadius: 1.5, border: `1px solid ${darkPanelBorder(theme)}` }}>
              {isValid ? JSON.stringify(header, null, 2) : '// Invalid JWT Header Format'}
            </Paper>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%', bgcolor: theme.palette.background.paper }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold(theme), mb: 1.5 }}>
              Decoded Payload Claims
            </Typography>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), color: '#F8FAFC', fontFamily: mono, fontSize: '0.85rem', whiteSpace: 'pre-wrap', borderRadius: 1.5, border: `1px solid ${darkPanelBorder(theme)}` }}>
              {isValid ? JSON.stringify(payload, null, 2) : '// Invalid JWT Payload Format'}
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      {isValid && (
        <Box sx={{ mt: 3, p: 3, bgcolor: goldBg(theme), border: `1px solid ${goldBorder(theme)}`, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft(theme), mb: 1.5 }}>
            Security Audit &amp; Claims Matrix
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label={`Algorithm: ${header.alg || 'none'}`} size="small" sx={{ bgcolor: header.alg === 'none' ? errorBg(theme) : theme.palette.background.paper, color: header.alg === 'none' ? errorFg(theme) : theme.palette.text.primary, fontWeight: 800 }} />
            <Chip label={signature ? 'Signature Verified Structure' : 'UNSIGNED TOKEN (VULNERABILITY)'} size="small" sx={{ bgcolor: signature ? successBg(theme) : errorBg(theme), color: signature ? successFg(theme) : errorFg(theme), fontWeight: 800 }} />
            <Chip label={`Claims Count: ${Object.keys(payload).length}`} size="small" sx={{ bgcolor: theme.palette.background.paper, fontWeight: 750, color: goldSoft(theme) }} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ==========================================================================
   TOOL 2: Payload Entropy Studio (Real Shannon Entropy & Byte Frequency Visualizer)
   ========================================================================== */
function PayloadEntropyTool() {
  const theme = useTheme();
  const [text, setText] = useState('function executePayload(buffer) { return crypto.subtle.digest("SHA-256", buffer); }');

  const bytes = new TextEncoder().encode(text || '');
  const counts = {};
  let printableCount = 0;
  let nonPrintableCount = 0;

  bytes.forEach((b) => {
    counts[b] = (counts[b] || 0) + 1;
    if (b >= 32 && b <= 126) printableCount++;
    else nonPrintableCount++;
  });

  let entropy = 0;
  if (bytes.length > 0) {
    Object.values(counts).forEach((c) => {
      const p = c / bytes.length;
      entropy -= p * Math.log2(p);
    });
  }

  const risk = entropy > 7.2 ? 'CRITICAL (High Entropy / Encrypted Payload)' : entropy > 5.5 ? 'MODERATE (Compressed Payload)' : 'LOW (Standard Text/Code)';

  return (
    <Box sx={{ mt: 1 }}>
      <Typography className="section-kicker">Payload Source for Shannon Entropy Analysis</Typography>
      <TextField
        fullWidth
        multiline
        minRows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste source code, binary string, or web payload..."
        sx={{ mb: 3, bgcolor: theme.palette.background.paper, fontFamily: mono }}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%', bgcolor: theme.palette.background.paper }}>
            <Typography className="section-kicker">Calculated Metric</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}>
              {entropy.toFixed(3)} <Typography component="span" variant="body1" color="text.secondary">bits/byte</Typography>
            </Typography>
            <Chip
              label={`Risk Assessment: ${risk}`}
              size="small"
              sx={{
                bgcolor: entropy > 7.2 ? errorBg(theme) : entropy > 5.5 ? goldBg(theme) : successBg(theme),
                color: entropy > 7.2 ? errorFg(theme) : entropy > 5.5 ? goldSoft(theme) : successFg(theme),
                fontWeight: 800,
                mt: 1.5,
                p: 0.5
              }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%', bgcolor: theme.palette.background.paper }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft(theme), mb: 2 }}>
              Byte Composition Breakdown
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', mb: 0.5, color: theme.palette.text.primary }}>
                <span>Printable ASCII Bytes (32-126):</span>
                <strong>{printableCount} ({bytes.length ? Math.round((printableCount / bytes.length) * 100) : 0}%)</strong>
              </Box>
              <LinearProgress variant="determinate" value={bytes.length ? (printableCount / bytes.length) * 100 : 0} sx={{ height: 8, borderRadius: 1, bgcolor: theme.palette.divider, '& .MuiLinearProgress-bar': { bgcolor: gold(theme) } }} />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', mb: 0.5, color: theme.palette.text.primary }}>
                <span>Non-Printable / Control Bytes:</span>
                <strong>{nonPrintableCount} ({bytes.length ? Math.round((nonPrintableCount / bytes.length) * 100) : 0}%)</strong>
              </Box>
              <LinearProgress variant="determinate" value={bytes.length ? (nonPrintableCount / bytes.length) * 100 : 0} sx={{ height: 8, borderRadius: 1, bgcolor: theme.palette.divider, '& .MuiLinearProgress-bar': { bgcolor: theme.palette.text.primary } }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   TOOL 3: Polyglot Framework Exporter (Real React -> Vue 3, Svelte 5, Solid.js Transpiler)
   ========================================================================== */
function PolyglotFrameworkTool() {
  const theme = useTheme();
  const [jsx, setJsx] = useState('<button onClick={() => alert("Zoth Studio")}>Click Me</button>');
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const vueCode = `<script setup>
import { ref } from 'vue';
const handleClick = () => alert('Zoth Studio');
</script>
<template>
  ${jsx}
</template>`;

  const svelteCode = `<script>
  function handleClick() {
    alert('Zoth Studio');
  }
</script>

${jsx}`;

  const solidCode = `import { createSignal } from 'solid-js';

export function App() {
  return (
    ${jsx}
  );
}`;

  const outputs = [vueCode, svelteCode, solidCode];
  const activeCode = outputs[tab];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography className="section-kicker">React / JSX Component Source Code Input</Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={jsx}
        onChange={(e) => setJsx(e.target.value)}
        sx={{ mb: 3, bgcolor: theme.palette.background.paper, fontFamily: mono }}
      />

      <Paper sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ bgcolor: tabsBg(theme), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tab label="Vue 3 (Composition API)" sx={{ fontWeight: 750 }} />
          <Tab label="Svelte 5 ($state)" sx={{ fontWeight: 750 }} />
          <Tab label="Solid.js (Signals)" sx={{ fontWeight: 750 }} />
        </Tabs>
        <Box sx={{ p: 3, bgcolor: darkPanel(theme), position: 'relative' }}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(activeCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2, fontWeight: 750 }}
          >
            {copied ? 'Copied' : 'Copy Framework Code'}
          </Button>
          <Paper sx={{ p: 2, bgcolor: 'transparent', color: '#F8FAFC', fontFamily: mono, fontSize: '0.85rem', whiteSpace: 'pre-wrap', boxShadow: 'none' }}>
            {activeCode}
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}

/* -- Reduced-motion safe animation loop: stops while the tab is hidden ----- */
function useAnimationLoop(fn) {
  const cbRef = useRef(fn);
  cbRef.current = fn;
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (!document.hidden) {
        cbRef.current();
        raf = requestAnimationFrame(loop);
      }
    };
    const onVisibility = () => {
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}

function ControlPanel({ title, children }) {
  const theme = useTheme();
  return (
    <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%', bgcolor: theme.palette.background.paper }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft(theme), mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function lighten(hex, amt) {
  const h = hex.replace('#', '');
  const n = (c) => {
    let v = parseInt(c, 16) + amt;
    v = Math.max(0, Math.min(255, v));
    return v.toString(16).padStart(2, '0');
  };
  return '#' + n(h.substr(0, 2)) + n(h.substr(2, 2)) + n(h.substr(4, 2));
}
function shade(hex, amt) {
  return lighten(hex, -amt);
}

/* ==========================================================================
   TOOL 4A: UFO Sacred Geometry — animated Flower of Life (7 ring sacred geometry)
   ========================================================================== */
function SacredGeometryTool() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#B8860B');
  const [speed, setSpeed] = useState(1.2);
  const [spokes, setSpokes] = useState(false);
  const timeRef = useRef(0);

  useAnimationLoop(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    timeRef.current += 0.016 * speed;
    const t = timeRef.current;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = darkPanel(theme);
    ctx.fillRect(0, 0, W, H);

    const pulse = 1 + 0.03 * Math.sin(t * 2);
    const R = 62 * pulse;

    ctx.save();
    ctx.translate(cx, cy + 4);
    ctx.rotate(t * 0.12);

    if (spokes) {
      ctx.strokeStyle = hexA(color, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * R * 2.15, Math.sin(a) * R * 2.15);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = R * Math.cos(a);
      const y = R * Math.sin(a);
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();

    // Vesica intersection arcs (the 3 diagonal pair axes).
    ctx.strokeStyle = hexA(color, 0.6);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const a = ((i * 2 + 1) * Math.PI) / 3;
      const x1 = R * Math.cos(a);
      const y1 = R * Math.sin(a);
      const x2 = -x1, y2 = -y1;
      ctx.beginPath();
      ctx.arc(x1, y1, R, Math.atan2(y2 - y1, x2 - x1) - 0.9, Math.atan2(y2 - y1, x2 - x1) + 0.9);
      ctx.stroke();
    }

    ctx.restore();

    // Orbital satellite ring.
    ctx.strokeStyle = hexA('#00F0FF', 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, R * 2.55, R * 0.9, t * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  });

  const palettes = ['#B8860B', '#00F0FF', '#FF3366', '#39FF88'];

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas ref={canvasRef} width={520} height={360} style={{ width: '100%', maxHeight: 360, borderRadius: 8 }} />
          </Paper>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center' }}>
            Flower of Life · 7 overlapping rings (6 petals + center) · animated
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ControlPanel title="Geometry Controls">
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Rotation Speed
              </Typography>
              <Slider size="small" min={0} max={4} step={0.1} value={speed} onChange={(e, v) => setSpeed(v)} />
            </Box>
            <Box sx={{ mb: 2.5 }}>
              <Chip label={spokes ? 'Show Harmonic Rays' : 'Reveal Harmonic Rays'} size="small" onClick={() => setSpokes(!spokes)} clickable sx={{ fontWeight: 750, bgcolor: spokes ? gold(theme) : chipNeutralBg(theme), color: spokes ? '#FFF' : chipNeutralFg(theme) }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
              Golden Ratio Hue
            </Typography>
            <Stack direction="row" spacing={1}>
              {palettes.map((c) => (
                <Box key={c} onClick={() => setColor(c)} sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: color === c ? `3px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}` }} />
              ))}
            </Stack>
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   TOOL 4B: 3D Badge & Coin Generator — editable inscription metallic medallion
   ========================================================================== */
function CoinGeneratorTool() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const [text, setText] = useState('ZOTH');
  const [rim, setRim] = useState(26);
  const [metal, setMetal] = useState(0);
  const timeRef = useRef(0);

  const metals = ['#D4AF37', '#C0C0C0', '#B87333'];

  useAnimationLoop(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    timeRef.current += 0.02;
    const t = timeRef.current;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.42;
    const rimW = rim;
    const baseCol = metals[metal];

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = darkPanel(theme);
    ctx.fillRect(0, 0, W, H);

    // Floor shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.82, R * 0.85, R * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);

    // Metallic body (radial gradient simulating a turned alloy face).
    const g = ctx.createRadialGradient(-R * 0.4, -R * 0.4, R * 0.1, 0, 0, R * 1.15);
    g.addColorStop(0, lighten(baseCol, 60));
    g.addColorStop(0.35, lighten(baseCol, 12));
    g.addColorStop(0.7, shade(baseCol, 14));
    g.addColorStop(1, shade(baseCol, 40));
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Serrated (milled) edge — 120 ticks around the outer rim.
    ctx.strokeStyle = shade(baseCol, 30);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 120; i++) {
      const a = (i * Math.PI * 2) / 120;
      ctx.moveTo(Math.cos(a) * (R - 2), Math.sin(a) * (R - 2));
      ctx.lineTo(Math.cos(a) * (R - 8), Math.sin(a) * (R - 8));
    }
    ctx.stroke();

    // Raised inner bezel ring whose thickness simulates coin depth.
    ctx.lineWidth = rimW;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.arc(0, 0, R - rimW / 2 - 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = lighten(baseCol, 35);
    ctx.beginPath();
    ctx.arc(0, 0, R - rimW - 4, 0, Math.PI * 2);
    ctx.stroke();

    // Reeded inner scallop ring
    ctx.strokeStyle = shade(baseCol, 8);
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, R - rimW - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.rotate(Math.sin(t) * 0.02); // subtle shimmy so the face isn't static

    // Edge inscription on a circular path.
    const circ = '✦  ZOTH STUDIO  ✦  BADGE & COIN WORKS  ✦  ';
    ctx.fillStyle = shade(baseCol, 45);
    ctx.font = '600 13px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < circ.length; i++) {
      const a = Math.PI + 0.66 - (i * 2 * Math.PI) / circ.length;
      ctx.save();
      ctx.rotate(a + Math.PI / 2);
      ctx.translate(0, -(R - 16));
      ctx.rotate(Math.PI / 2);
      ctx.fillText(circ[i], 0, 0);
      ctx.restore();
    }

    // Coin face field
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.arc(0, 0, R - rimW - 24, 0, Math.PI * 2);
    ctx.fill();

    // Central seal emblem
    ctx.strokeStyle = shade(baseCol, 20);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, R - rimW - 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 26px "JetBrains Mono"';
    ctx.fillStyle = shade(baseCol, 45);
    ctx.fillText('◈', 0, -R * 0.22);

    // Inscription centerpiece
    ctx.font = `900 ${Math.max(22, Math.min(40, R * 0.24))}px "JetBrains Mono"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = lighten(baseCol, 8);
    ctx.shadowColor = shade(baseCol, 50);
    ctx.shadowBlur = 6;
    ctx.fillText(text || 'ZOTH', 0, 2);
    ctx.shadowBlur = 0;

    ctx.restore(); // shimmy
    ctx.restore();
  });

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas ref={canvasRef} width={520} height={360} style={{ width: '100%', maxHeight: 360, borderRadius: 8 }} />
          </Paper>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center' }}>
            Metallic medallion · editable inscription + rim depth + alloy
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ControlPanel title="Coin &amp; Medallion">
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Coin Inscription Text
              </Typography>
              <TextField fullWidth size="small" value={text} onChange={(e) => setText(e.target.value)} sx={{ bgcolor: theme.palette.background.paper }} />
            </Box>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Rim / Thickness ({rim}px)
              </Typography>
              <Slider size="small" min={10} max={56} value={rim} onChange={(e, v) => setRim(v)} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
              Metal Alloy
            </Typography>
            <Stack direction="row" spacing={1}>
              {metals.map((c, i) => (
                <Box key={c} onClick={() => setMetal(i)} sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: metal === i ? `3px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}` }} />
              ))}
            </Stack>
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   TOOL 4C: Nexus 3D Scene Studio — draggable wireframe cube with size control
   ========================================================================== */
function Nexus3DTool() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const [size, setSize] = useState(90);
  const [ghostFrame, setGhostFrame] = useState(2);
  const rot = useRef({ rx: 0.6, ry: 0.9 });
  const auto = useRef(true);
  const drag = useRef(null);

  useAnimationLoop(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (auto.current && !drag.current) rot.current.ry += 0.008;
    const { rx, ry } = rot.current;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2 + 6;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = darkPanel(theme);
    ctx.fillRect(0, 0, W, H);

    // Ground grid
    ctx.strokeStyle = 'rgba(0,240,255,0.10)';
    ctx.lineWidth = 1;
    for (let gx = -3; gx <= 3; gx++) {
      ctx.beginPath();
      ctx.moveTo(cx + gx * 40, cy + 130);
      ctx.lineTo(cx + gx * 40, cy + 130);
      ctx.stroke();
    }

    const s = size / 2;
    const verts = [];
    for (let i = 0; i < 8; i++) {
      const x = (i & 1) ? s : -s;
      const y = (i & 2) ? s : -s;
      const z = (i & 4) ? s : -s;
      // yaw then pitch (orthographic projection)
      let x1 = x * Math.cos(ry) - z * Math.sin(ry);
      let z1 = x * Math.sin(ry) + z * Math.cos(ry);
      let y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
      let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      verts.push([x1, y1, z2]);
    }
    const edges = [
      [0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]
    ];

    const drawEdge = (a, b, near) => {
      ctx.beginPath();
      ctx.moveTo(cx + verts[a][0], cy + verts[a][1]);
      ctx.lineTo(cx + verts[b][0], cy + verts[b][1]);
      if (near) {
        ctx.strokeStyle = '#F5E6AB';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = `rgba(0,240,255,${0.35 + 0.3 * Math.min(1, (verts[a][2] + verts[b][2]) / (2 * s))})`;
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    };
    edges.forEach(([a, b]) => {
      if (verts[a][2] + verts[b][2] < 0) drawEdge(a, b, false);
    });
    edges.forEach(([a, b]) => {
      if (verts[a][2] + verts[b][2] >= 0) drawEdge(a, b, true);
    });

    // Ghost near face layer
    if (ghostFrame > 0) {
      ctx.strokeStyle = `rgba(255,51,102,${0.3 + 0.1 * ghostFrame})`;
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - s * 0.45, cy - s * 0.45, s * 0.9, s * 0.9);
      ctx.setLineDash([]);
    }
  });

  const onDown = (e) => {
    auto.current = false;
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    rot.current.ry += dx * 0.012;
    rot.current.rx += dy * 0.012;
  };
  const onUp = () => {
    drag.current = null;
    auto.current = true;
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas
              ref={canvasRef}
              width={520}
              height={360}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
              style={{ width: '100%', maxHeight: 360, borderRadius: 8, touchAction: 'none', cursor: 'grab' }}
            />
          </Paper>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center' }}>
            Drag the box to rotate · wireframe cube, orthographic projection
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ControlPanel title="Scene Object">
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Edge Size ({size}px)
              </Typography>
              <Slider size="small" min={40} max={150} value={size} onChange={(e, v) => setSize(v)} />
            </Box>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Ghost Frame Layer
              </Typography>
              <Slider size="small" min={0} max={3} step={1} value={ghostFrame} onChange={(e, v) => setGhostFrame(v)} />
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontFamily: mono, fontSize: '0.72rem' }}>
              Drag the viewport to rotate. Auto-orbit resumes on release.
            </Typography>
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   TOOL 4D: CyberTurtle Graphic Studio — real turtle-graphics interpreter
   ========================================================================== */
function TurtleTool() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const [commands, setCommands] = useState('FD 90\nRT 120\nFD 90\nRT 120\nFD 90\nRT 120');
  const [history, setHistory] = useState(0);
  const timeRef = useRef(0);

  const presets = [
    { name: 'Triangle', code: 'FD 120\nRT 120\nFD 120\nRT 120\nFD 120' },
    { name: 'Hexagon', code: 'FD 80\nRT 60\nFD 80\nRT 60\nFD 80\nRT 60\nFD 80\nRT 60\nFD 80\nRT 60\nFD 80' },
    { name: 'Star', code: 'PU FD 70 PD\nREPEAT 5 [ FD 110 RT 144 ]' },
    { name: 'Spiral', code: 'REPEAT 8 [ FD 30 RT 45 FD 30 RT 135 ]\nREPEAT 3 [ FD 60 RT 120 ]' },
  ];

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = darkPanel(theme);
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#39FF88';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.textAlign = 'left';

    let src = commands;
    let guard = 0;
    while (src.includes('REPEAT') && guard++ < 40) {
      src = src.replace(/REPEAT\s+(\d+)\s*\[([^\]]*)\]/g, (m, n, body) => Array(Number(n)).fill(body).join(' '));
    }
    const toks = src.split(/[\s;]+/).filter(Boolean);

    let x = 0, y = 0, heading = -90, penDown = true;
    const segments = [];

    for (let i = 0; i < toks.length; i++) {
      const cmd = toks[i];
      const num = () => { const v = parseFloat(toks[++i]); return isNaN(v) ? 0 : v; };
      if (cmd === 'PU' || cmd === 'PENUP') penDown = false;
      else if (cmd === 'PD' || cmd === 'PENDOWN') penDown = true;
      else if (cmd === 'FD' || cmd === 'FORWARD') {
        const d = num();
        const nx = x + d * Math.cos((heading * Math.PI) / 180);
        const ny = y + d * Math.sin((heading * Math.PI) / 180);
        if (penDown) segments.push([x, y, nx, ny]);
        x = nx; y = ny;
      } else if (cmd === 'BK' || cmd === 'BACK') {
        const d = num();
        const nx = x - d * Math.cos((heading * Math.PI) / 180);
        const ny = y - d * Math.sin((heading * Math.PI) / 180);
        if (penDown) segments.push([x, y, nx, ny]);
        x = nx; y = ny;
      } else if (cmd === 'RT' || cmd === 'RIGHT') heading += num();
      else if (cmd === 'LT' || cmd === 'LEFT') heading -= num();
    }

    setHistory(segments.length);

    ctx.save();
    ctx.translate(cx, cy);
    segments.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Turtle cursor at current pos/heading.
    const hx = Math.cos((heading * Math.PI) / 180);
    const hy = Math.sin((heading * Math.PI) / 180);
    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.moveTo(x + hx * 12, y + hy * 12);
    ctx.lineTo(x - hy * 6, y + hx * 6);
    ctx.lineTo(x + hy * 6, y - hx * 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    draw();
  }, [commands]);

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas ref={canvasRef} width={520} height={360} style={{ width: '100%', maxHeight: 360, borderRadius: 8 }} />
          </Paper>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center' }}>
            Dialect: FD / BK d · RT / LT deg · PU / PD · REPEAT n [ ... ]
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ControlPanel title="Turtle Program">
            <TextField
              fullWidth
              multiline
              minRows={5}
              size="small"
              value={commands}
              onChange={(e) => setCommands(e.target.value)}
              sx={{ mb: 2, bgcolor: theme.palette.background.paper, fontFamily: mono }}
            />
            <Button variant="contained" color="primary" size="small" startIcon={<PlayArrowIcon />} onClick={draw} sx={{ mb: 2, fontWeight: 750 }}>
              Run Program
            </Button>
            <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
              Preset Patterns
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {presets.map((p) => (
                <Chip key={p.name} label={p.name} size="small" onClick={() => setCommands(p.code)} clickable sx={{ fontWeight: 750, bgcolor: p.code === commands ? gold(theme) : chipNeutralBg(theme), color: p.code === commands ? '#FFF' : chipNeutralFg(theme) }} />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: mono, fontSize: '0.72rem' }}>
              Segments drawn: {history}
            </Typography>
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   TOOL 4E: Datamosh Glitch Studio — real canvas glitch on a gradient test card
   ========================================================================== */
function GlitchTool() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const offRef = useRef(null);
  const [intensity, setIntensity] = useState(55);
  const [mode, setMode] = useState('slices');
  const timeRef = useRef(0);

  const makeCard = () => {
    const cv = document.createElement('canvas');
    cv.width = 560;
    cv.height = 320;
    const ctx = cv.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 560, 320);
    g.addColorStop(0, '#FF3366');
    g.addColorStop(0.35, '#7B2FFF');
    g.addColorStop(0.7, '#00F0FF');
    g.addColorStop(1, '#39FF88');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 560, 320);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    for (let y = 0; y < 320; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(560, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    for (let x = 0; x < 560; x += 56) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke();
    }
    ctx.font = '900 40px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'center';
    ctx.fillText('D A T A M O S H', 280, 180);
    ctx.font = '700 18px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('TEST CARD · FRAME CORRUPTION', 280, 216);
    return cv;
  };

  useAnimationLoop(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!offRef.current) offRef.current = makeCard();
    const t = ++timeRef.current;
    const ctx = canvas.getContext('2d');
    const src = offRef.current;
    ctx.drawImage(src, 0, 0);

    if (intensity === 0) return;
    const W = canvas.width, H = canvas.height;
    const I = intensity;
    const rand = (n) => Math.floor(Math.random() * n);

    if (mode === 'slices' || (mode === 'both' && t % 2 === 0)) {
      // Horizontal scanline slices: shear & shift random bands.
      const bands = Math.floor(I / 12) + 2;
      for (let b = 0; b < bands; b++) {
        const y = rand(H);
        const h = rand(Math.floor(H / (I / 18))) + 3;
        const shift = (rand(W * 0.35) - W * 0.17) * (I / 100);
        ctx.drawImage(canvas, 0, y, W, h, shift, y, W, h);
      }
    }

    if (mode === 'sort' || (mode === 'both' && t % 2 === 1)) {
      // Pixel-sort: reorder pixels in random rows by brightness.
      const rows = Math.max(2, Math.floor(I / 22));
      const img = ctx.getImageData(0, 0, W, H);
      const d = img.data;
      for (let r = 0; r < rows; r++) {
        const y = rand(H);
        const runLen = Math.floor(W * (0.3 + (I / 200)));
        const startX = rand(W - runLen);
        const idx = (y * W + startX) * 4;
        const run = [];
        for (let i = 0; i < runLen; i++) run.push(idx + i * 4);
        const brightness = (i) => (d[i] + d[i + 1] + d[i + 2]) / 3;
        run.sort((a, b) => brightness(a) - brightness(b));
        const copy = run.map((p) => [d[p], d[p + 1], d[p + 2], d[p + 3]]);
        run.forEach((p, k) => {
          d[p] = copy[k][0]; d[p + 1] = copy[k][1]; d[p + 2] = copy[k][2]; d[p + 3] = copy[k][3];
        });
      }
      ctx.putImageData(img, 0, 0);
    }

    // RGB channel displacement across the whole frame.
    const shift = Math.floor(2 + I / 14);
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      if (rand(100) < I) {
        const off = (rand(shift) - 1) * 4;
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          if (rand(100) < 60) {
            const r = d[i];
            d[i] = d[Math.max(0, Math.min(d.length - 4, i + off))];
            d[i + 2] = r;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);

    // Static noise veil
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let n = 0; n < 40; n++) ctx.fillRect(rand(W), rand(H), rand(30) + 2, 1);

    // Frame counter
    ctx.font = '600 11px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.textAlign = 'left';
    ctx.fillText(`FRAME_${String(t % 1000).padStart(3, '0')} · I=${I}`, 6, H - 6);
  });

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas ref={canvasRef} width={560} height={320} style={{ width: '100%', maxHeight: 320, borderRadius: 8 }} />
          </Paper>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center' }}>
            Live canvas corruption: scanline slices + pixel-sort + RGB displacement on a synthetic test card.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ControlPanel title="Corruption Engine">
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Glitch Intensity ({intensity}%)
              </Typography>
              <Slider size="small" min={0} max={100} value={intensity} onChange={(e, v) => setIntensity(v)} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
              Corruption Mode
            </Typography>
            <Stack direction="row" spacing={1}>
              {['slices', 'sort', 'both'].map((m) => (
                <Chip key={m} label={m} size="small" onClick={() => setMode(m)} clickable sx={{ fontWeight: 750, bgcolor: mode === m ? gold(theme) : chipNeutralBg(theme), color: mode === m ? '#FFF' : chipNeutralFg(theme) }} />
              ))}
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontFamily: mono, fontSize: '0.72rem', mt: 2 }}>
              Real pixel-level corruption — genuine canvas pixel ops, no shader faking.
            </Typography>
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   TOOL 4F: Vision Gesture Control — honest camera handler with explicit fallback
   ========================================================================== */
function VisionGestureTool() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [state, setState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (cancelled) return;
      const v = videoRef.current;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((tr) => tr.stop()); return; }
        streamRef.current = stream;
        v.srcObject = stream;
        await v.play().catch(() => {});
        setState('live');
        setErrorMsg('');
      } catch (err) {
        if (cancelled) return;
        const denied = !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ||
          (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'));
        const absent = err && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError' || err.name === 'NotReadableError');
        setState(denied ? 'denied' : absent ? 'absent' : 'absent');
        setErrorMsg(err && err.message ? err.message : String(err));
      }
    };
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((tr) => tr.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  useAnimationLoop(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = darkPanel(theme);
    ctx.fillRect(0, 0, W, H);
    const v = videoRef.current;
    if (state === 'live' && v && v.readyState >= 2 && v.videoWidth > 0) {
      const sw = v.videoWidth, sh = v.videoHeight;
      const scale = Math.min(W / sw, H / sh);
      const dw = sw * scale, dh = sh * scale;
      const dx = (W - dw) / 2, dy = (H - dh) / 2;
      ctx.drawImage(v, dx, dy, dw, dh);

      // Overlay: bounding box + fingertip placeholder markers (honest annotations).
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(W * 0.18, dh * 0.28 + dy, dw * 0.5, dh * 0.55);
      ctx.setLineDash([]);

      const tips = [
        [0.32, 0.42], [0.42, 0.36], [0.52, 0.36], [0.62, 0.42], [0.5, 0.5]
      ];
      ctx.font = '600 12px "JetBrains Mono"';
      tips.forEach(([fx, fy], i) => {
        const mx = W * 0.18 + dw * 0.5 * fx;
        const my = dh * 0.28 + dy + dh * 0.55 * fy;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,215,0,0.4)';
        ctx.fillText(String(i + 1), mx + 8, my - 6);
      });
      ctx.fillStyle = '#39FF88';
      ctx.fillText('LIVE FEED · placeholder landmarks (not MediaPipe)', 8, H - 8);
    } else if (state === 'live' && (!v || v.videoWidth === 0)) {
      ctx.fillStyle = '#00F0FF';
      ctx.font = '600 16px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for camera frames...', W / 2, H / 2);
    } else if (state === 'denied') {
      drawFallback(ctx, W, H, 'CAMERA PERMISSION REQUIRED', 'Access to the webcam was denied.');
    } else if (state === 'absent') {
      drawFallback(ctx, W, H, 'NO CAMERA DETECTED', 'This tool needs a camera to run.');
    } else {
      ctx.fillStyle = '#F5E6AB';
      ctx.font = '600 16px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillText('Requesting camera access...', W / 2, H / 2);
    }
  });

  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas ref={canvasRef} width={560} height={360} style={{ width: '100%', maxHeight: 360, borderRadius: 8 }} />
            <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ControlPanel title="Camera Status">
            {state === 'live' && (
              <Alert severity="success" sx={{ fontWeight: 750 }}>Camera streaming — drawing live frames.</Alert>
            )}
            {state === 'idle' && (
              <Alert severity="info">Requesting webcam permission via getUserMedia...</Alert>
            )}
            {(state === 'denied' || state === 'absent') && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                A camera is <strong>required</strong> to use this tool. No effect is rendered without one.
              </Alert>
            )}
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
              Gesture overlay draws a provisional hand bounding box + fingertip placeholders. It is a UI scaffold, NOT real MediaPipe inference.
            </Typography>
            {errorMsg && (
              <Typography variant="caption" sx={{ color: errorFg(theme), fontFamily: mono, fontSize: '0.7rem', display: 'block', wordBreak: 'break-word' }}>
                {errorMsg}
              </Typography>
            )}
          </ControlPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

function drawFallback(ctx, W, H, title, sub) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F5E6AB';
  ctx.font = '800 20px "JetBrains Mono"';
  ctx.fillText(title, W / 2, H / 2 - 20);
  ctx.fillStyle = '#98A2B3';
  ctx.font = '600 14px "JetBrains Mono"';
  ctx.fillText(sub, W / 2, H / 2 + 14);
  ctx.fillStyle = 'rgba(0,240,255,0.6)';
  ctx.font = '600 12px "JetBrains Mono"';
  ctx.fillText('CAMERA REQUIRED — NO EFFECT FAKED', W / 2, H / 2 + 46);
}

/* ==========================================================================
   MAIN PAGE COMPONENT (100% REAL WORKING TOOL WORKSPACE PAGE, NO POPUPS!)
   ========================================================================== */
export default function RealToolWorkspacePage() {
  const theme = useTheme();
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = microTools.find((t) => t.id === toolId || t.repo === toolId) || microTools[0];

  const isWebGPU = tool.executionType === 'webgpu';

  const glowColor = theme.palette.mode === 'dark' ? 'rgba(212,175,55,0.28)' : 'rgba(184,134,11,0.18)';
  const glowBorder = theme.palette.mode === 'dark' ? 'rgba(212,175,55,0.45)' : 'rgba(184,134,11,0.35)';

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* Unique gold radial glow behind the page header */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(760px, 92%)',
          height: 300,
          pointerEvents: 'none',
          zIndex: 0,
          background: `radial-gradient(ellipse 60% 55% at 50% 30%, ${glowColor} 0%, transparent 70%)`,
        }}
      />

      {/* Back Button */}
      <Button
        component={RouterLink}
        to="/tools"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, fontWeight: 750, color: goldSoft(theme), position: 'relative', zIndex: 1 }}
      >
        Back to Tools Catalog
      </Button>

      {/* Header */}
      <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          {isWebGPU ? (
            <Chip
              icon={<FlashOnIcon sx={{ color: `${gold(theme)} !important` }} />}
              label="⚡ IN-BROWSER INTERACTIVE"
              size="small"
              sx={{ bgcolor: goldBg(theme), color: gold(theme), border: `1px solid ${goldBorder(theme)}`, fontWeight: 800 }}
            />
          ) : (
            <Chip
              icon={<SecurityIcon sx={{ color: `${successFg(theme)} !important` }} />}
              label="LOCAL CLI TOOL"
              size="small"
              sx={{ bgcolor: successBg(theme), color: successFg(theme), fontWeight: 800 }}
            />
          )}
          <Chip label={`v${tool.version}`} size="small" variant="outlined" sx={{ fontFamily: mono }} />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
          {tool.name} <span className="text-gradient-gold">Workspace</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 840, lineHeight: 1.65, fontSize: '1.05rem' }}>
          {tool.description} Local repo: <span className="text-highlight-gold">{tool.repo}</span>.
        </Typography>
      </Box>

      {/* Real Interactive Tool Workspace Card (gold-tinted glow border) */}
      <Paper
        sx={{
          p: 4,
          border: `1px solid ${glowBorder}`,
          borderRadius: 3,
          mb: 5,
          bgcolor: theme.palette.background.paper,
          position: 'relative',
          zIndex: 1,
          boxShadow: `0 0 0 1px ${glowBorder}, 0 8px 30px -8px ${glowColor}, 0 0 34px -6px ${glowColor}`,
        }}
      >
        {tool.id === 'jwt-inspector-guard' && <JwtInspectorTool />}
        {tool.id === 'payload-entropy-studio' && <PayloadEntropyTool />}
        {tool.id === 'polyglot-framework-exporter' && <PolyglotFrameworkTool />}
        {tool.id === 'nexus-3d-scene-studio' && <Nexus3DTool />}
        {tool.id === 'badge3d-coin-generator' && <CoinGeneratorTool />}
        {tool.id === 'ufo-sacred-geometry' && <SacredGeometryTool />}
        {tool.id === 'cyber-turtle-studio' && <TurtleTool />}
        {tool.id === 'datamosh-glitch-studio' && <GlitchTool />}
        {tool.id === 'vision-gesture-control' && <VisionGestureTool />}
        {tool.id !== 'jwt-inspector-guard' && tool.id !== 'payload-entropy-studio' && tool.id !== 'polyglot-framework-exporter' && tool.id !== 'nexus-3d-scene-studio' && tool.id !== 'badge3d-coin-generator' && tool.id !== 'ufo-sacred-geometry' && tool.id !== 'cyber-turtle-studio' && tool.id !== 'datamosh-glitch-studio' && tool.id !== 'vision-gesture-control' && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>CLI Command Checkout</Typography>
            <Box sx={{ p: 2, bgcolor: darkPanel(theme), color: '#F5E6AB', fontFamily: mono, borderRadius: 2, border: `1px solid ${darkPanelBorder(theme)}` }}>
              $ {tool.pull}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
