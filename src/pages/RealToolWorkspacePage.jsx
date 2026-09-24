import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
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
import DnsIcon from '@mui/icons-material/Dns';
import { microTools } from '../data/toolsData';
import ZothAIAssistant from '../components/ZothAIAssistant';
import { useStudioStatus } from '../studio/useStudioStatus';
import {
  AdytumPlannerTool,
  AzothArchonTool,
  SovereignBridgeTool,
  NeuroMemoryTool,
  VectorSearchTool,
  DeepSearchResearchTool,
  PromptMasterTool,
  HexStrikeTool,
  EnvGuardVaultTool,
  WebSecurityGuardTool,
  AudioCipherStegoTool,
  AeoGraphEngineTool,
  CwvSpeedEngineTool,
  SubSweepTool,
  OmniPostSocialTool,
  CronRhythmTool
} from '../components/tools/EnclaveToolsSuite';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* ==========================================================================
   THEME-AWARE COLOR HELPERS
   ========================================================================== */
const gold = (t) => (t.palette.mode === 'dark' ? '#D4AF37' : '#B8860B');
const goldSoft = (t) => (t.palette.mode === 'dark' ? '#F5E6AB' : '#8A6A09');
const goldBg = (t) => (t.palette.mode === 'dark' ? 'rgba(212,175,55,0.16)' : '#FEF9E7');
const goldBorder = (t) => (t.palette.mode === 'dark' ? 'rgba(212,175,55,0.42)' : 'rgba(184,134,11,0.35)');
const darkPanel = (t) => (t.palette.mode === 'dark' ? '#0B0B12' : '#0F172A');
const darkPanelBorder = (t) => (t.palette.mode === 'dark' ? 'rgba(212,175,55,0.3)' : '#334155');
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
function b64urlDecode(part) {
  const pad = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

function JwtInspectorTool() {
  const theme = useTheme();
  // Real base64url JWTs. Signature is present but NOT cryptographically verified — the chip says so.
  const sampleAdmin = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhem90aCIsInJvbGUiOiJhZG1pbiIsImlzcyI6InpvdGgtc3R1ZGlvIiwiZXhwIjoxODkzNDU2MDAwLCJzY29wZSI6WyJ2YXVsdCIsInN3YXJtIl19.c2lnbmF0dXJlLW5vdC12ZXJpZmllZC1oZXJl';
  const sampleUser = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrYWkiLCJyb2xlIjoicmVhZGVyIiwiaXNzIjoiem90aC1zdHVkaW8iLCJleHAiOjE4OTM0NTYwMDB9.c2lnbmF0dXJlLW5vdC12ZXJpZmllZC1oZXJl';
  const sampleNone = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhbm9uIiwicm9sZSI6Im5vbmUiLCJpc3MiOiJ6b3RoLXN0dWRpbyJ9.';

  const [token, setToken] = useState(sampleAdmin);
  const [copied, setCopied] = useState(false);

  let header = {};
  let payload = {};
  let isValid = false;
  let signature = '';

  try {
    const parts = token.trim().split('.');
    if (parts.length >= 2) {
      header = b64urlDecode(parts[0]);
      payload = b64urlDecode(parts[1]);
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
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%', bgcolor: theme.palette.background.paper }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold(theme), mb: 1.5 }}>
              Decoded Header (Algorithm &amp; Token Type)
            </Typography>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), color: '#F5E6AB', fontFamily: mono, fontSize: '0.85rem', whiteSpace: 'pre-wrap', borderRadius: 1.5, border: `1px solid ${darkPanelBorder(theme)}` }}>
              {isValid ? JSON.stringify(header, null, 2) : '// Invalid JWT Header Format'}
            </Paper>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
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
            <Chip
              label={`Algorithm: ${header.alg || 'none'}`}
              size="small"
              sx={{
                bgcolor: header.alg === 'none' ? errorBg(theme) : theme.palette.background.paper,
                color: header.alg === 'none' ? errorFg(theme) : theme.palette.text.primary,
                border: `1px solid ${header.alg === 'none' ? errorFg(theme) : theme.palette.divider}`,
                fontWeight: 800
              }}
            />
            <Chip
              label={signature ? 'Signature present — not verified' : 'UNSIGNED TOKEN'}
              size="small"
              sx={{
                bgcolor: signature ? (theme.palette.mode === 'dark' ? 'rgba(212,175,55,0.22)' : '#FFF8E1') : errorBg(theme),
                color: signature ? (theme.palette.mode === 'dark' ? '#F5E6AB' : '#8A6A09') : errorFg(theme),
                border: `1px solid ${signature ? goldBorder(theme) : errorFg(theme)}`,
                fontWeight: 800
              }}
            />
            <Chip
              label={`Claims Count: ${Object.keys(payload).length}`}
              size="small"
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 750,
                color: goldSoft(theme)
              }}
            />
          </Box>
        </Box>
      )}

      <ZothAIAssistant
        toolName="JWT Inspector"
        actions={[
          { name: 'setToken', desc: 'Set the JWT token to decode', fn: (v) => setToken(String(v)) },
          { name: 'loadAdmin', desc: 'Load the admin sample token', fn: () => setToken(sampleAdmin) },
          { name: 'loadUser', desc: 'Load the user sample token', fn: () => setToken(sampleUser) },
          { name: 'loadUnsigned', desc: 'Load the unsigned (vulnerable) sample token', fn: () => setToken(sampleNone) },
        ]}
      />
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
        <Grid xs={12} md={5}>
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

        <Grid xs={12} md={7}>
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

                <ZothAIAssistant
                  toolName="Payload Entropy"
                  actions={[
                    { name: 'setText', desc: 'Set the payload text to analyze', fn: (v) => setText(String(v)) },
                    { name: 'loadSample', desc: 'Load the sample code payload', fn: () => setText('function executePayload(buffer) { return crypto.subtle.digest("SHA-256", buffer); }') },
                  ]}
                />
              </Box>
            );
          }

          /* ==========================================================================
             TOOL 3: Polyglot Framework Exporter (Real React -> Vue 3, Svelte 5, Solid.js Transpiler)
             ========================================================================== */
function translateJsx(src, target) {
  // Honest, limited translator. Converts the attributes it understands and
  // leaves a comment where it does not invent a conversion.
  let out = src;
  const notes = [];
  const className = [...src.matchAll(/className=\{([^}]+)\}|className="([^"]+)"/g)];
  out = out.replace(/className="([^"]+)"/g, (_, v) => target === 'vue' ? `:class="'${v}'"` : target === 'svelte' ? `class="${v}"` : `class="${v}"`);
  out = out.replace(/className=\{([^}]+)\}/g, (_, v) => {
    if (target === 'vue') return `:class="${v.trim()}"`;
    if (target === 'svelte') return `class={${v.trim()}}`;
    return `class={${v.trim()}}`;
  });
  out = out.replace(/onClick=\{([^}]+)\}/g, (_, v) => {
    const expr = v.trim();
    if (target === 'vue') return `@click="${expr.replace(/^\(\)\s*=>\s*/, '')}"`;
    if (target === 'svelte') return `on:click={${expr}}`;
    return `onClick={${expr}}`;
  });
  out = out.replace(/htmlFor=/g, target === 'vue' ? 'for=' : 'for=');
  if (/useState|useEffect|useMemo/.test(src)) {
    notes.push(target === 'vue'
      ? 'React hooks are not translated. Replace useState with ref() yourself.'
      : target === 'svelte'
        ? 'React hooks are not translated. Replace useState with a let binding.'
        : 'React hooks are not translated. Replace useState with createSignal().');
  }
  if (!className.length && !/onClick=/.test(src) && !notes.length) {
    notes.push('No className/onClick/hooks found. Markup is passed through with framework event syntax only where matched.');
  }
  return { code: out, notes };
}

function PolyglotFrameworkTool() {
  const theme = useTheme();
  const [jsx, setJsx] = useState('<button className="seal" onClick={() => alert("Zoth Studio")}>Click Me</button>');
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const targets = ['vue', 'svelte', 'solid'];
  const target = targets[tab];
  const translated = translateJsx(jsx, target);
  const wrapped = {
    vue: `<script setup>\n// Translated from JSX. ${translated.notes[0] || 'className -> :class, onClick -> @click.'}\n</script>\n<template>\n  ${translated.code}\n</template>`,
    svelte: `<script>\n  // Translated from JSX. ${translated.notes[0] || 'className -> class, onClick -> on:click.'}\n</script>\n\n${translated.code}`,
    solid: `// Translated from JSX. ${translated.notes[0] || 'Solid keeps JSX; className -> class.'}\nexport function App() {\n  return (\n    ${translated.code}\n  );\n}`,
  };
  const activeCode = wrapped[target];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography className="section-kicker">React / JSX source</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Translates className, onClick, and htmlFor. It does not pretend to be a full compiler — unmatched React hooks are called out in the output comment.
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={jsx}
        onChange={(e) => setJsx(e.target.value)}
        sx={{ mb: 3, bgcolor: theme.palette.background.paper, fontFamily: mono }}
      />

      <Paper sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ bgcolor: tabsBg(theme), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tab label="Vue 3" sx={{ fontWeight: 750 }} />
          <Tab label="Svelte" sx={{ fontWeight: 750 }} />
          <Tab label="Solid.js" sx={{ fontWeight: 750 }} />
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
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Paper sx={{ p: 2, pr: 12, bgcolor: 'transparent', color: '#F8FAFC', fontFamily: mono, fontSize: '0.85rem', whiteSpace: 'pre-wrap', boxShadow: 'none' }}>
            {activeCode}
          </Paper>
        </Box>
      </Paper>

      <ZothAIAssistant
        toolName="Polyglot Exporter"
        actions={[
          { name: 'setJsx', desc: 'Set the JSX component source code', fn: (v) => setJsx(String(v)) },
          { name: 'switchVue', desc: 'Show the Vue 3 output tab', fn: () => setTab(0) },
          { name: 'switchSvelte', desc: 'Show the Svelte output tab', fn: () => setTab(1) },
          { name: 'switchSolid', desc: 'Show the Solid.js output tab', fn: () => setTab(2) },
        ]}
      />
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

/* -- Responsive canvas: fills its container, keeps internal resolution in sync -- */
function useResponsiveCanvas(canvasRef, aspectRatio = 4 / 3) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      // Let CSS width:100% size the canvas to its grid cell; measure the rendered
      // width and set internal resolution to match (crisp on any DPR).
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || parent.clientWidth || 600;
      const h = w / aspectRatio;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [canvasRef, aspectRatio]);
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

  useResponsiveCanvas(canvasRef, 520 / 360);

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
        <Grid xs={12} md={7}>
          <Box sx={{ width: '100%', flex: '1 1 auto', minWidth: 0 }}>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
              <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 8 }} />
            </Paper>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center', width: '100%' }}>
              Flower of Life · 7 overlapping rings (6 petals + center) · animated
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={5}>
          <ControlPanel title="Geometry Controls">
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Rotation Speed
              </Typography>
              <Slider size="small" min={0} max={4} step={0.1} value={speed} onChange={(e, v) => setSpeed(v)} />
            </Box>
            <Box sx={{ mb: 2.5 }}>
              <Chip
                label={spokes ? 'Show Harmonic Rays' : 'Reveal Harmonic Rays'}
                size="small"
                onClick={() => setSpokes(!spokes)}
                clickable
                sx={{
                  fontWeight: 750,
                  bgcolor: spokes ? gold(theme) : chipNeutralBg(theme),
                  color: spokes ? (theme.palette.mode === 'dark' ? '#08080B' : '#0F172A') : chipNeutralFg(theme),
                  border: '1px solid',
                  borderColor: spokes ? gold(theme) : theme.palette.divider
                }}
              />
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

                  <ZothAIAssistant
                    toolName="Sacred Geometry"
                    actions={[
                      { name: 'setColor', desc: 'Set the geometry hue color (hex)', fn: (v) => setColor(String(v)) },
                      { name: 'setSpeed', desc: 'Set the rotation speed (0-4)', fn: (v) => setSpeed(Number(v)) },
                      { name: 'toggleSpokes', desc: 'Toggle the harmonic rays on or off', fn: () => setSpokes((s) => !s) },
                    ]}
                  />
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

  useResponsiveCanvas(canvasRef, 520 / 360);

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
    const rimW = Math.min(rim, Math.max(0, R - 40));
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
        <Grid xs={12} md={7}>
          <Box sx={{ width: '100%', flex: '1 1 auto', minWidth: 0 }}>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
              <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 8 }} />
            </Paper>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center', width: '100%' }}>
              Metallic medallion · editable inscription + rim depth + alloy
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={5}>
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

      <ZothAIAssistant
        toolName="Coin Generator"
        actions={[
          { name: 'setText', desc: 'Set the coin inscription text', fn: (v) => setText(String(v)) },
          { name: 'setRim', desc: 'Set the rim thickness in px (10-56)', fn: (v) => setRim(Number(v)) },
          { name: 'setMetal', desc: 'Set the metal alloy index (0 gold, 1 silver, 2 bronze)', fn: (v) => setMetal(Number(v)) },
        ]}
      />
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

  useResponsiveCanvas(canvasRef, 520 / 360);

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
        <Grid xs={12} md={7}>
          <Box sx={{ width: '100%', flex: '1 1 auto', minWidth: 0 }}>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
              <canvas
                ref={canvasRef}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerLeave={onUp}
                style={{ display: 'block', width: '100%', borderRadius: 8, touchAction: 'none', cursor: 'grab' }}
              />
            </Paper>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center', width: '100%' }}>
              Drag the box to rotate · wireframe cube, orthographic projection
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={5}>
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

      <ZothAIAssistant
        toolName="Nexus 3D"
        actions={[
          { name: 'setSize', desc: 'Set the cube edge size in px (40-150)', fn: (v) => setSize(Number(v)) },
          { name: 'setGhostFrame', desc: 'Set the ghost frame layer (0-3)', fn: (v) => setGhostFrame(Number(v)) },
        ]}
      />
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

  useResponsiveCanvas(canvasRef, 520 / 360);

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
        <Grid xs={12} md={7}>
          <Box sx={{ width: '100%', flex: '1 1 auto', minWidth: 0 }}>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
              <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 8 }} />
            </Paper>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center', width: '100%' }}>
              Dialect: FD / BK d · RT / LT deg · PU / PD · REPEAT n [ ... ]
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={5}>
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
                <Chip
                  key={p.name}
                  label={p.name}
                  size="small"
                  onClick={() => setCommands(p.code)}
                  clickable
                  sx={{
                    fontWeight: 750,
                    bgcolor: p.code === commands ? gold(theme) : chipNeutralBg(theme),
                    color: p.code === commands ? (theme.palette.mode === 'dark' ? '#08080B' : '#0F172A') : chipNeutralFg(theme),
                    border: '1px solid',
                    borderColor: p.code === commands ? gold(theme) : theme.palette.divider
                  }}
                />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: mono, fontSize: '0.72rem' }}>
              Segments drawn: {history}
            </Typography>
          </ControlPanel>
        </Grid>
      </Grid>

      <ZothAIAssistant
        toolName="CyberTurtle"
        actions={[
          { name: 'setCommands', desc: 'Set the turtle program commands', fn: (v) => setCommands(String(v)) },
          { name: 'runProgram', desc: 'Run the current turtle program', fn: () => draw() },
          { name: 'loadTriangle', desc: 'Load the triangle preset', fn: () => setCommands('FD 120\nRT 120\nFD 120\nRT 120\nFD 120') },
          { name: 'loadStar', desc: 'Load the star preset', fn: () => setCommands('PU FD 70 PD\nREPEAT 5 [ FD 110 RT 144 ]') },
        ]}
      />
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

  useResponsiveCanvas(canvasRef, 560 / 320);

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
        <Grid xs={12} md={7}>
          <Box sx={{ width: '100%', flex: '1 1 auto', minWidth: 0 }}>
            <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
              <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 8 }} />
            </Paper>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1, display: 'block', textAlign: 'center', width: '100%' }}>
              Live canvas corruption: scanline slices + pixel-sort + RGB displacement on a synthetic test card.
            </Typography>
          </Box>
        </Grid>
        <Grid xs={12} md={5}>
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
                <Chip
                  key={m}
                  label={m}
                  size="small"
                  onClick={() => setMode(m)}
                  clickable
                  sx={{
                    fontWeight: 750,
                    bgcolor: mode === m ? gold(theme) : chipNeutralBg(theme),
                    color: mode === m ? (theme.palette.mode === 'dark' ? '#08080B' : '#0F172A') : chipNeutralFg(theme),
                    border: '1px solid',
                    borderColor: mode === m ? gold(theme) : theme.palette.divider
                  }}
                />
              ))}
            </Stack>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', fontFamily: mono, fontSize: '0.72rem', mt: 2 }}>
              Real pixel-level corruption — genuine canvas pixel ops, no shader faking.
            </Typography>
          </ControlPanel>
        </Grid>
      </Grid>

      <ZothAIAssistant
        toolName="Datamosh Glitch"
        actions={[
          { name: 'setIntensity', desc: 'Set the glitch intensity percent (0-100)', fn: (v) => setIntensity(Number(v)) },
          { name: 'setMode', desc: 'Set the corruption mode (slices, sort, or both)', fn: (v) => setMode(String(v)) },
        ]}
      />
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

  useResponsiveCanvas(canvasRef, 560 / 360);

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
        <Grid xs={12} md={7}>
          <Paper sx={{ p: 2, bgcolor: darkPanel(theme), borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', border: `1px solid ${darkPanelBorder(theme)}` }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 8 }} />
            <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
          </Paper>
        </Grid>
        <Grid xs={12} md={5}>
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

      <ZothAIAssistant
        toolName="Vision Gesture"
        actions={[
          { name: 'requestCamera', desc: 'Request camera access to start the live feed', fn: () => window.location.reload() },
        ]}
      />
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

  const { status } = useStudioStatus();
  const isBackendConnected = Boolean(status?.services);
  const requiresLocalDaemon = tool.executionType === 'local_cli' || Boolean(tool.localOnly);
  const isWebGPU = tool.executionType === 'webgpu';
  const [copiedCmd, setCopiedCmd] = useState('');
  const handleCopyCmd = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(''), 2500);
  };

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
              icon={<FlashOnIcon sx={{ color: `${successFg(theme)} !important` }} />}
              label={isBackendConnected ? "⚡ SOVEREIGN ENCLAVE (LOCAL BACKEND ACTIVE)" : "⚡ LOCAL CLI ENCLAVE"}
              size="small"
              sx={{ bgcolor: successBg(theme), color: successFg(theme), border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`, fontWeight: 800 }}
            />
          )}
          <Chip label={`v${tool.version}`} size="small" variant="outlined" sx={{ fontFamily: mono, borderColor: theme.palette.divider }} />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
          {tool.name} <span className="text-gradient-gold">Workspace</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 840, lineHeight: 1.65, fontSize: '1.05rem' }}>
          {tool.description} Local repo: <span className="text-highlight-gold">{tool.repo}</span>.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 2.5,
          border: `1px solid ${goldBorder(theme)}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ minWidth: 0, flex: '1 1 280px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: goldSoft(theme), mb: 0.5 }}>
            {isWebGPU ? 'In-Browser WebGPU & WebGL Enclave.' : 'Dedicated Sovereign Workspace Running in Zoth Studio v2.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Install <Box component="span" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Zoth Studio</Box> to check this repo out and run it with the local daemons, or boot <Box component="span" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Zoth OS</Box> and every tool is already on the disk.
          </Typography>
          <Box sx={{
            mt: 1.25,
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: theme.palette.mode === 'dark' ? '#0B0B12' : '#F8FAFC',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(212,175,55,0.35)' : '1px solid #CBD5E1',
            color: theme.palette.mode === 'dark' ? '#F5E6AB' : '#0F172A',
            fontFamily: mono,
            fontSize: '0.78rem',
            wordBreak: 'break-all'
          }}>
            <Box component="span" sx={{ color: gold(theme), fontWeight: 800, mr: 0.75 }}>$</Box>
            npm install -g zoth-studio && zoth pull {tool.repo}
          </Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
          {tool.github && (
            <Button
              href={tool.github}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 800, borderColor: gold(theme), color: gold(theme), '&:hover': { bgcolor: goldBg(theme) } }}
            >
              GitHub Repo ↗
            </Button>
          )}
          <Button component={RouterLink} to="/docs" variant="outlined" color="primary" size="small" sx={{ fontWeight: 800 }}>
            Install Zoth Studio
          </Button>
          <Button component={RouterLink} to="/zoth-os" variant="contained" color="primary" size="small" sx={{ fontWeight: 800 }}>
            Get Zoth OS
          </Button>
        </Stack>
      </Paper>

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
        {requiresLocalDaemon && !isBackendConnected && !bypassSimulated ? (
          <Box sx={{ py: 5, px: 2, textAlign: 'center', maxWidth: 660, mx: 'auto' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(212,175,55,0.12)',
                border: `1px solid ${goldBorder(theme)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <DnsIcon sx={{ fontSize: 36, color: gold(theme) }} />
            </Box>

            <Chip
              label="LOCAL DAEMON REQUIRED · ZERO-EGRESS HARDWARE LOOPBACK"
              size="small"
              sx={{ bgcolor: goldBg(theme), color: gold(theme), border: `1px solid ${goldBorder(theme)}`, fontWeight: 800, mb: 2, px: 1 }}
            />

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>
              Local Backend Daemon Required
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.65 }}>
              <strong>{tool.name}</strong> executes directly against your sovereign local loopback environment (<code style={{ color: gold(theme) }}>127.0.0.1:11434</code> for Ollama, <code style={{ color: gold(theme) }}>:8788</code> for STDP memory, and <code style={{ color: gold(theme) }}>:8787</code> for BYOK secret vault). Zero-egress invariants prevent cloud web browsers from accessing raw system daemons without a local bridge.
            </Typography>

            <Paper
              sx={{
                p: 2,
                mb: 3.5,
                bgcolor: darkPanel(theme),
                border: `1px solid ${darkPanelBorder(theme)}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                textAlign: 'left',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? '#F5E6AB' : '#FCD34D', fontWeight: 750, display: 'block', mb: 0.5 }}>
                  START LOCAL DAEMON (RUN IN TERMINAL):
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.86rem', color: '#FFFFFF', wordBreak: 'break-all' }}>
                  <Box component="span" sx={{ color: theme.palette.mode === 'dark' ? '#D4AF37' : '#38BDF8', fontWeight: 800, mr: 0.75 }}>$</Box>
                  node bin/zoth.js up
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => navigator.clipboard.writeText('node bin/zoth.js up')}
                sx={{ borderColor: theme.palette.mode === 'dark' ? gold(theme) : 'rgba(255,255,255,0.4)', color: theme.palette.mode === 'dark' ? gold(theme) : '#FFFFFF', flexShrink: 0, fontWeight: 750, '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' } }}
              >
                Copy
              </Button>
            </Paper>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/docs"
                sx={{ fontWeight: 800, px: 3 }}
              >
                Local Daemon Setup Guide
              </Button>
              <Button
                variant="outlined"
                onClick={() => setBypassSimulated(true)}
                sx={{ fontWeight: 750, borderColor: gold(theme), color: gold(theme), px: 2.5 }}
              >
                Enable Offline Simulated Mode
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            {requiresLocalDaemon && !isBackendConnected && bypassSimulated && (
              <Alert
                severity="warning"
                sx={{
                  mb: 3.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(217,119,6,0.14)' : '#FFFBEB',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(217,119,6,0.35)' : '#FCD34D'}`,
                  color: theme.palette.mode === 'dark' ? '#F59E0B' : '#92400E',
                  '& .MuiAlert-icon': {
                    color: theme.palette.mode === 'dark' ? '#F59E0B' : '#B45309'
                  }
                }}
                action={
                  <Button size="small" color="inherit" onClick={() => setBypassSimulated(false)} sx={{ fontWeight: 750 }}>
                    Re-lock Tool
                  </Button>
                }
              >
                <strong>Offline Simulated Mode Active:</strong> Local hardware daemon is offline. Operations run in-browser against local state mocks without network egress.
              </Alert>
            )}

            {tool.id === 'jwt-inspector-guard' && <JwtInspectorTool />}
            {tool.id === 'payload-entropy-studio' && <PayloadEntropyTool />}
            {tool.id === 'polyglot-framework-exporter' && <PolyglotFrameworkTool />}
            {tool.id === 'nexus-3d-scene-studio' && <Nexus3DTool />}
            {tool.id === 'badge3d-coin-generator' && <CoinGeneratorTool />}
            {tool.id === 'ufo-sacred-geometry' && <SacredGeometryTool />}
            {tool.id === 'cyber-turtle-studio' && <TurtleTool />}
            {tool.id === 'datamosh-glitch-studio' && <GlitchTool />}
            {tool.id === 'vision-gesture-control' && <VisionGestureTool />}
            {tool.id === 'adytum-alchemist-ai-workflow' && <AdytumPlannerTool />}
            {tool.id === 'azoth-local-agent' && <AzothArchonTool />}
            {tool.id === 'sovereign-agent-bridge' && <SovereignBridgeTool />}
            {tool.id === 'neuro-memory-daemon' && <NeuroMemoryTool />}
            {tool.id === 'vector-search-engine' && <VectorSearchTool />}
            {tool.id === 'deepsearch-research-agent' && <DeepSearchResearchTool />}
            {tool.id === 'promptmaster-studio' && <PromptMasterTool />}
            {tool.id === 'hexstrike-arsenal' && <HexStrikeTool />}
            {tool.id === 'envguard-secrets-vault' && <EnvGuardVaultTool />}
            {tool.id === 'web-security-guard' && <WebSecurityGuardTool />}
            {tool.id === 'audiocipher-stego-engine' && <AudioCipherStegoTool />}
            {tool.id === 'aeo-graph-engine' && <AeoGraphEngineTool />}
            {tool.id === 'cwv-speed-engine' && <CwvSpeedEngineTool />}
            {tool.id === 'subsweep-lead-scanner' && <SubSweepTool />}
            {tool.id === 'omnipost-social-engine' && <OmniPostSocialTool />}
            {tool.id === 'cron-rhythm-studio' && <CronRhythmTool />}
          </>
        )}
      </Paper>

      {/* SOVEREIGN INSTALLATION & DEPLOYMENT FUNNEL */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: `1px solid ${goldBorder(theme)}`,
          bgcolor: darkPanel(theme),
          boxShadow: `0 8px 32px rgba(0,0,0,0.35)`,
          position: 'relative',
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <RocketLaunchIcon sx={{ color: gold(theme) }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              Run {tool.name} in Your Sovereign Local Enclave
            </Typography>
          </Box>
          <Chip
            label="AIR-GAPPED SOVEREIGN ENVIRONMENT"
            size="small"
            sx={{ bgcolor: goldBg(theme), color: gold(theme), border: `1px solid ${goldBorder(theme)}`, fontWeight: 800, fontFamily: mono, fontSize: '0.7rem' }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3, maxWidth: 840, lineHeight: 1.65 }}>
          Every tool in the Zoth Studio suite is engineered for zero external telemetry. Run this tool offline on your workstation, orchestrate it via local CLI, or deploy it bare-metal within the sovereign Zoth OS terminal.
        </Typography>

        <Grid container spacing={2.5}>
          {/* Option A: Zoth Studio v2 */}
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldSoft(theme) }}>
                  Option 1: Clone Zoth Studio v2 Repo
                </Typography>
                <Chip label="LOCAL-FIRST SUITE" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: gold(theme), fontWeight: 750, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, flexGrow: 1, fontSize: '0.84rem' }}>
                Full workstation cockpit with 29+ interactive micro-tools, STDP neural memory daemon, and WebGPU accelerators.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: '#050508', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: '#38BDF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  git clone https://github.com/NullAITech/zoth-studio-v2.git
                </Typography>
                <IconButton size="small" onClick={() => handleCopyCmd('git clone https://github.com/NullAITech/zoth-studio-v2.git')} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  component="a"
                  href="https://github.com/NullAITech/zoth-studio-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: gold(theme), color: '#08080B', fontWeight: 800, fontSize: '0.8rem', '&:hover': { bgcolor: goldSoft(theme) } }}
                >
                  View Zoth Studio v2 Repo ↗
                </Button>
                {tool.pull && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleCopyCmd(tool.pull)}
                    sx={{ borderColor: goldBorder(theme), color: gold(theme), fontSize: '0.78rem', fontWeight: 750, mt: 1 }}
                  >
                    {copiedCmd === tool.pull ? 'Copied Pull Command!' : `Copy: ${tool.pull}`}
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Option B: Zoth OS */}
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#34D399' }}>
                  Option 2: Install Sovereign Zoth OS
                </Typography>
                <Chip label="FULL OS ISO" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399', fontWeight: 750, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, flexGrow: 1, fontSize: '0.84rem' }}>
                Complete alchemical intelligence operating system with Kali/Parrot tool parity, local Ollama models, and Tor Ghostmode.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: '#050508', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: '#34D399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  https://github.com/NullAITech/zoth-os
                </Typography>
                <IconButton size="small" onClick={() => handleCopyCmd('https://github.com/NullAITech/zoth-os')} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                component="a"
                href="https://github.com/NullAITech/zoth-os"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                fullWidth
                sx={{ borderColor: '#34D399', color: '#34D399', fontWeight: 800, fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(52,211,153,0.1)' } }}
              >
                Explore &amp; Install Zoth OS ↗
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
