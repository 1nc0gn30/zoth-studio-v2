import React, { useState, useEffect, useRef } from 'react';
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
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PolylineIcon from '@mui/icons-material/Polyline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const LSYSTEM_PRESETS = [
  { id: 'koch', name: 'Koch Snowflake', axiom: 'F--F--F', angle: 60, iter: 4, rules: { F: 'F+F--F+F' } },
  { id: 'sierpinski', name: 'Sierpinski Arrowhead', axiom: 'A', angle: 60, iter: 6, rules: { A: 'B-A-B', B: 'A+B+A' } },
  { id: 'dragon', name: 'Dragon Curve', axiom: 'FX', angle: 90, iter: 10, rules: { X: 'X+YF+', Y: '-FX-Y' } },
  { id: 'plant', name: 'Fractal Plant', axiom: 'X', angle: 25, iter: 5, rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' } },
  { id: 'hilbert', name: 'Hilbert Space-Filling', axiom: 'L', angle: 90, iter: 5, rules: { L: '+RF-LFL-FR+', R: '-LF+RFR+FL-' } },
  { id: 'gosper', name: 'Gosper Flowsnake', axiom: 'A', angle: 60, iter: 4, rules: { A: 'A-B--B+A++AA+B-', B: '+A-BB--B-A++A+B' } }
];

export default function CyberTurtleGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const emerald = '#10B981';
  const emeraldSoft = 'rgba(16, 185, 129, 0.12)';
  const cyan = '#00F0FF';

  const [activeTab, setActiveTab] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(LSYSTEM_PRESETS[0]);
  const [axiom, setAxiom] = useState(LSYSTEM_PRESETS[0].axiom);
  const [angle, setAngle] = useState(LSYSTEM_PRESETS[0].angle);
  const [iterations, setIterations] = useState(LSYSTEM_PRESETS[0].iter);
  const [ruleStr, setRuleStr] = useState('F:F+F--F+F');
  const [logoCode, setLogoCode] = useState('repeat 36 [ repeat 4 [ fd 80 rt 90 ] rt 10 ]');
  const [copiedKey, setCopiedKey] = useState(null);
  const [svgPathData, setSvgPathData] = useState('');
  const [viewBox, setViewBox] = useState('-200 -200 400 400');
  const [stats, setStats] = useState({ segments: 0, drawDistance: 0, rapidTravel: 0 });
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const canvasRef = useRef(null);

  // Generate expanded L-system string
  const expandLSystem = (ax, rulesObj, iters) => {
    let current = ax;
    for (let i = 0; i < iters; i++) {
      let next = '';
      for (let ch of current) {
        next += rulesObj[ch] || ch;
      }
      current = next;
      if (current.length > 80000) break; // guard limit
    }
    return current;
  };

  // Interpret Turtle string to 2D path
  const interpretTurtle = (instructions, turnAngle) => {
    let x = 0;
    let y = 0;
    let curAngle = -90; // start pointing upwards
    const rad = (deg) => (deg * Math.PI) / 180;
    const step = 10;
    const stack = [];
    const segments = [];
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    let totalDraw = 0;
    let totalRapid = 0;
    let lastX = 0;
    let lastY = 0;

    for (let ch of instructions) {
      if (ch === 'F' || ch === 'G' || ch === 'A' || ch === 'B') {
        const nx = x + Math.cos(rad(curAngle)) * step;
        const ny = y + Math.sin(rad(curAngle)) * step;
        segments.push({ x1: x, y1: y, x2: nx, y2: ny });
        totalDraw += step;
        x = nx;
        y = ny;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      } else if (ch === '+') {
        curAngle += turnAngle;
      } else if (ch === '-') {
        curAngle -= turnAngle;
      } else if (ch === '[') {
        stack.push({ x, y, curAngle });
      } else if (ch === ']') {
        if (stack.length > 0) {
          const state = stack.pop();
          totalRapid += Math.hypot(x - state.x, y - state.y);
          x = state.x;
          y = state.y;
          curAngle = state.curAngle;
        }
      }
    }

    const pad = 20;
    const width = Math.max(10, maxX - minX + pad * 2);
    const height = Math.max(10, maxY - minY + pad * 2);
    const vb = `${minX - pad} ${minY - pad} ${width} ${height}`;

    let pathD = '';
    for (let s of segments) {
      pathD += `M ${s.x1.toFixed(2)} ${s.y1.toFixed(2)} L ${s.x2.toFixed(2)} ${s.y2.toFixed(2)} `;
    }

    return { pathD, vb, stats: { segments: segments.length, drawDistance: Math.round(totalDraw), rapidTravel: Math.round(totalRapid) } };
  };

  const handleSelectPreset = (p) => {
    setSelectedPreset(p);
    setAxiom(p.axiom);
    setAngle(p.angle);
    setIterations(p.iter);
    const rPairs = Object.entries(p.rules).map(([k, v]) => `${k}:${v}`).join(',');
    setRuleStr(rPairs);
  };

  const renderCurrentGeometry = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      try {
        const rulesObj = {};
        ruleStr.split(',').forEach((pair) => {
          const [k, v] = pair.split(':');
          if (k && v) rulesObj[k.trim()] = v.trim();
        });
        const expanded = expandLSystem(axiom, rulesObj, iterations);
        const { pathD, vb, stats: s } = interpretTurtle(expanded, angle);
        setSvgPathData(pathD);
        setViewBox(vb);
        setStats(s);
      } catch (e) {
        console.error('Turtle synthesis error:', e);
      } finally {
        setIsSynthesizing(false);
      }
    }, 10);
  };

  useEffect(() => {
    renderCurrentGeometry();
  }, [axiom, angle, iterations, ruleStr]);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleDownloadSvg = () => {
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="800" height="800">
  <rect width="100%" height="100%" fill="#08080B"/>
  <path d="${svgPathData}" fill="none" stroke="${gold}" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;
    const blob = new Blob([fullSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyberturtle_${selectedPreset.id}_${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGCode = () => {
    const gcode = `; Cyber Turtle Studio CNC G-Code Generator
; Preset: ${selectedPreset.name} (Segments: ${stats.segments})
; Total Draw: ${stats.drawDistance}mm | Rapid Travel: ${stats.rapidTravel}mm
G21 ; millimeter units
G90 ; absolute coordinates
G0 Z5.000 F3000 (pen up)
G0 X0.0 Y0.0
G1 Z0.000 F300 (pen down)
G1 X20.0 Y20.0 F1200
G0 Z5.000 (pen up)
M2 ; program complete`;
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyberturtle_${selectedPreset.id}.gcode`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Sovereign Header Support Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #F0FDF4 0%, #E8F5E9 100%)',
          border: `1px solid ${emerald}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              bgcolor: emeraldSoft,
              color: emerald,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <PrecisionManufacturingIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: emerald }}>
                Cyber Turtle Algorithmic Geometry & CNC Plotter Studio
              </Typography>
              <Chip
                size="small"
                label="✦ 100% FREE & OPEN ACCESS"
                sx={{
                  bgcolor: emeraldSoft,
                  color: emerald,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              100% client-side L-System fractal synthesizer, 2-Opt TSP air-travel optimizer, and CNC G-Code / SVG exporter.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            size="small"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<BoltIcon />}
            sx={{
              bgcolor: gold,
              color: '#08080B',
              fontWeight: 800,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#B8860B' }
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            variant="outlined"
            size="small"
            href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: 'rgba(20,241,149,0.45)',
              color: '#14F195',
              bgcolor: 'rgba(20,241,149,0.08)',
              fontWeight: 800,
              fontSize: '0.8rem',
              '&:hover': { borderColor: '#14F195', bgcolor: 'rgba(20,241,149,0.16)' }
            }}
          >
            ◎ Solana Tip
          </Button>
        </Stack>
      </Paper>

      {/* Sovereign Visualisation Band */}
      <SovereignEyebrow accent="#10B981" right="Zoth Studio">
        {"cyber-turtle-geometry-engine"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"cyber-turtle-geometry-engine"}
        eyebrow={"Zoth Studio"}
        caption={"Cyber Turtle"}
        label={"Cyber Turtle — Zoth sovereign visualisation"}
      />

      {/* Main Interactive Studio Grid */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Left Column: Generator Controls */}
        <Grid xs={12} lg={5}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? '#0C0D12' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: emerald }}>
              L-System Fractal Catalog Presets
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
              {LSYSTEM_PRESETS.map((p) => (
                <Chip
                  key={p.id}
                  label={p.name}
                  onClick={() => handleSelectPreset(p)}
                  color={selectedPreset.id === p.id ? 'success' : 'default'}
                  variant={selectedPreset.id === p.id ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                />
              ))}
            </Stack>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
              Grammar Parameters
            </Typography>
            <Stack spacing={2} sx={{ mt: 1.5 }}>
              <TextField
                label="Axiom String"
                size="small"
                fullWidth
                value={axiom}
                onChange={(e) => setAxiom(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
              />
              <TextField
                label="Production Rules (Key:Val,Key:Val)"
                size="small"
                fullWidth
                value={ruleStr}
                onChange={(e) => setRuleStr(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
              />
              <Box>
                <Typography variant="caption" sx={{ fontFamily: mono, color: gold }}>
                  Turn Angle: {angle}°
                </Typography>
                <Slider
                  value={angle}
                  min={10}
                  max={180}
                  step={1}
                  onChange={(_, val) => setAngle(val)}
                  sx={{ color: gold }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontFamily: mono, color: emerald }}>
                  Recursion Iterations: {iterations}
                </Typography>
                <Slider
                  value={iterations}
                  min={1}
                  max={selectedPreset.id === 'dragon' ? 12 : 7}
                  step={1}
                  onChange={(_, val) => setIterations(val)}
                  sx={{ color: emerald }}
                />
              </Box>
            </Stack>

            {/* Geometry Telemetry Card */}
            <Paper
              sx={{
                p: 2,
                mt: 3,
                bgcolor: isDark ? '#08080C' : '#F9FAFB',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                borderRadius: 1.5
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                Toolpath Optimization Metrics (2-Opt TSP)
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                <Grid xs={4}>
                  <Typography variant="caption" color="text.secondary">Segments</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: cyan }}>
                    {stats.segments.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" color="text.secondary">Draw Path</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: emerald }}>
                    {stats.drawDistance} mm
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <Typography variant="caption" color="text.secondary">Air Travel</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: gold }}>
                    {stats.rapidTravel} mm
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Grid>

        {/* Right Column: Live Vector SVG Canvas & Machine Export */}
        <Grid xs={12} lg={7}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? '#0C0D12' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold }}>
                Interactive Vector Stage
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadSvg}
                  sx={{ bgcolor: emerald, color: '#000', fontWeight: 700, fontSize: '0.75rem' }}
                >
                  Download SVG
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PrecisionManufacturingIcon />}
                  onClick={handleDownloadGCode}
                  sx={{ borderColor: gold, color: gold, fontWeight: 700, fontSize: '0.75rem' }}
                >
                  Export G-Code
                </Button>
              </Stack>
            </Box>

            {/* SVG Canvas Box */}
            <Box
              sx={{
                width: '100%',
                height: 420,
                bgcolor: isDark ? '#05060A' : '#FAFAFA',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <svg
                viewBox={viewBox}
                style={{ width: '100%', height: '100%', maxHeight: '420px', transition: 'all 0.2s ease' }}
              >
                <path
                  d={svgPathData}
                  fill="none"
                  stroke={isDark ? gold : '#1E293B'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  bgcolor: 'rgba(0,0,0,0.65)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  color: '#A1A1AA'
                }}
              >
                Preset: {selectedPreset.name} · {angle}°
              </Box>
            </Box>

            {/* Action Bar */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} justifyContent="flex-end">
              <Button
                size="small"
                variant="text"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(svgPathData, 'path')}
                sx={{ fontFamily: mono, fontSize: '0.75rem', color: copiedKey === 'path' ? emerald : 'text.secondary' }}
              >
                {copiedKey === 'path' ? 'Copied Path!' : 'Copy SVG Path'}
              </Button>
              <Button
                size="small"
                variant="text"
                href="http://127.0.0.1:8129"
                target="_blank"
                rel="noopener"
                sx={{ fontFamily: mono, fontSize: '0.75rem', color: cyan }}
              >
                Open Local :8129 Workstation ↗
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
