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
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SovereignBand from '../sovereign/SovereignBand.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const PRESETS = [
  {
    id: 'flower_of_life',
    name: 'Flower of Life',
    category: 'Sacred Genesis',
    desc: '19 interlocking circles arranged in a hexagonal triangular lattice, generating the Fruit of Life.',
    defaultRings: 3,
    defaultScale: 1.0
  },
  {
    id: 'seed_of_life',
    name: 'Seed of Life',
    category: 'Sacred Genesis',
    desc: 'The fundamental 7-circle core of creation with 6 outer petals surrounding 1 central sphere.',
    defaultRings: 1,
    defaultScale: 1.2
  },
  {
    id: 'metatrons_cube',
    name: "Metatron's Cube",
    category: 'Platonic Solids',
    desc: 'Fruit of Life foundation mapping all 5 Platonic Solids with 13 informational spheres and 78 harmonic lines.',
    defaultRings: 2,
    defaultScale: 0.95
  },
  {
    id: 'sri_yantra',
    name: 'Sri Yantra Maha',
    category: 'Tantric Harmonic',
    desc: 'Ancient sacred diagram of 9 interlocking triangles centered at the Bindu generating 43 sub-triangles.',
    defaultRings: 4,
    defaultScale: 1.05
  },
  {
    id: 'fibonacci_spiral',
    name: 'Golden Ratio Spiral',
    category: 'Logarithmic Phi',
    desc: 'Pure logarithmic golden spiral based on the golden ratio phi ≈ 1.6180339887 with nested rectangles.',
    defaultRings: 6,
    defaultScale: 1.0
  },
  {
    id: 'torus_vortex',
    name: 'Torus Vortex Equilibrium',
    category: 'Vector Equilibrium',
    desc: 'Dynamic toroidal energy vortex with nested harmonic streamlines and vector equilibrium.',
    defaultRings: 24,
    defaultScale: 1.0
  },
  {
    id: 'merkaba',
    name: 'Merkaba Star Tetrahedron',
    category: 'Platonic Solids',
    desc: 'Counter-rotating light vehicle formed by two intersecting regular tetrahedra in isometric 3D projection.',
    defaultRings: 3,
    defaultScale: 1.1
  },
  {
    id: 'milk_hill',
    name: 'Milk Hill Agro-Glyph',
    category: 'Crop Agro-Glyph',
    desc: 'Colossal Wiltshire crop formation consisting of 409 circles distributed across 6 logarithmic spiral arms.',
    defaultRings: 6,
    defaultScale: 0.9
  }
];

export default function UfoSacredGeometryGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const emerald = '#10B981';
  const emeraldSoft = 'rgba(16, 185, 129, 0.12)';
  const cyan = '#00F0FF';

  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rings, setRings] = useState(PRESETS[0].defaultRings);
  const [scale, setScale] = useState(PRESETS[0].defaultScale);
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [glowEffect, setGlowEffect] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [daemonStatus, setDaemonStatus] = useState({ online: false, uptime: 0 });

  // Daemon health check (:8083)
  useEffect(() => {
    let mounted = true;
    const checkDaemon = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8083/health', { signal: AbortSignal.timeout(1200) });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setDaemonStatus({ online: true, uptime: data.uptime_seconds || 0 });
          }
        } else if (mounted) {
          setDaemonStatus(prev => ({ ...prev, online: false }));
        }
      } catch {
        if (mounted) setDaemonStatus(prev => ({ ...prev, online: false }));
      }
    };
    checkDaemon();
    const interval = setInterval(checkDaemon, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update parameters when preset changes
  const handleSelectPreset = (p) => {
    setSelectedPreset(p);
    setRings(p.defaultRings);
    setScale(p.defaultScale);
  };

  // Animation frame loop
  useEffect(() => {
    let animId;
    const loop = () => {
      if (autoRotate) {
        setRotationAngle(prev => (prev + 0.006) % (Math.PI * 2));
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // Render sacred geometry to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Deep cosmic background
    const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.7);
    bgGrad.addColorStop(0, isDark ? '#080A14' : '#F8FAFC');
    bgGrad.addColorStop(1, isDark ? '#020306' : '#E2E8F0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.04)' : 'rgba(184, 134, 11, 0.06)';
    ctx.lineWidth = 1;
    for (let r = 50; r < width / 2; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotationAngle);
    ctx.scale(scale, scale);

    if (glowEffect) {
      ctx.shadowBlur = isDark ? 12 : 6;
      ctx.shadowColor = gold;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.lineWidth = strokeWidth;

    const baseRadius = 55;

    if (selectedPreset.id === 'flower_of_life' || selectedPreset.id === 'seed_of_life') {
      const maxRings = selectedPreset.id === 'seed_of_life' ? 1 : Math.max(1, rings);
      const drawnCenters = new Set();
      
      const drawCircle = (ox, oy, rad, color) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(ox, oy, rad, 0, Math.PI * 2);
        ctx.stroke();
      };

      // Central circle
      drawCircle(0, 0, baseRadius, gold);
      drawnCenters.add(`0,0`);

      // Concentric hexagonal rings of circles
      for (let ring = 1; ring <= maxRings; ring++) {
        for (let side = 0; side < 6; side++) {
          const angle1 = (side * Math.PI) / 3;
          const angle2 = ((side + 2) * Math.PI) / 3;
          for (let step = 0; step < ring; step++) {
            const frac = step / ring;
            const x1 = ring * baseRadius * Math.cos(angle1);
            const y1 = ring * baseRadius * Math.sin(angle1);
            const x2 = ring * baseRadius * Math.cos(angle2);
            const y2 = ring * baseRadius * Math.sin(angle2);
            const ox = x1 * (1 - frac) + x2 * frac;
            const oy = y1 * (1 - frac) + y2 * frac;
            const key = `${Math.round(ox)},${Math.round(oy)}`;
            if (!drawnCenters.has(key)) {
              drawnCenters.add(key);
              drawCircle(ox, oy, baseRadius, ring === 1 ? cyan : emerald);
            }
          }
        }
      }

      // Outer bounding double ring
      if (selectedPreset.id === 'flower_of_life') {
        const outerBound = (maxRings + 0.8) * baseRadius;
        drawCircle(0, 0, outerBound, gold);
        drawCircle(0, 0, outerBound + 6, gold);
      }

    } else if (selectedPreset.id === 'metatrons_cube') {
      const nodes = [{ x: 0, y: 0 }];
      const r1 = baseRadius * 1.5;
      const r2 = baseRadius * 3.0;

      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        nodes.push({ x: r1 * Math.cos(a), y: r1 * Math.sin(a) });
      }
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + Math.PI / 6;
        nodes.push({ x: r2 * Math.cos(a), y: r2 * Math.sin(a) });
      }

      // Lines connecting every pair of 13 nodes (78 lines)
      ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 180, 216, 0.55)';
      ctx.lineWidth = strokeWidth * 0.7;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      // 13 informational spheres
      nodes.forEach((n, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = idx === 0 ? gold : (idx <= 6 ? emerald : cyan);
        ctx.fillStyle = isDark ? 'rgba(10, 15, 30, 0.8)' : 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = strokeWidth;
        ctx.arc(n.x, n.y, baseRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

    } else if (selectedPreset.id === 'sri_yantra') {
      const rad = baseRadius * 3.2;
      // Lotus petals outer
      ctx.strokeStyle = gold;
      const petals = 16;
      for (let i = 0; i < petals; i++) {
        const a = (i * Math.PI * 2) / petals;
        const px = (rad + 15) * Math.cos(a);
        const py = (rad + 15) * Math.sin(a);
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Interlocking triangles
      const triH = rad * 0.9;
      const tCoords = [
        // Upward Shiva triangles
        { top: -triH * 0.95, base: triH * 0.5, w: rad * 0.85, up: true, col: gold },
        { top: -triH * 0.65, base: triH * 0.7, w: rad * 0.75, up: true, col: gold },
        { top: -triH * 0.4, base: triH * 0.85, w: rad * 0.6, up: true, col: emerald },
        { top: -triH * 0.2, base: triH * 0.95, w: rad * 0.45, up: true, col: cyan },
        // Downward Shakti triangles
        { top: triH * 0.95, base: -triH * 0.5, w: rad * 0.85, up: false, col: cyan },
        { top: triH * 0.7, base: -triH * 0.65, w: rad * 0.75, up: false, col: emerald },
        { top: triH * 0.5, base: -triH * 0.8, w: rad * 0.65, up: false, col: gold },
        { top: triH * 0.3, base: -triH * 0.9, w: rad * 0.5, up: false, col: gold },
        { top: triH * 0.15, base: -triH * 0.95, w: rad * 0.35, up: false, col: emerald }
      ];

      tCoords.forEach(t => {
        ctx.strokeStyle = t.col;
        ctx.beginPath();
        if (t.up) {
          ctx.moveTo(0, t.top);
          ctx.lineTo(-t.w / 2, t.base);
          ctx.lineTo(t.w / 2, t.base);
        } else {
          ctx.moveTo(0, t.top);
          ctx.lineTo(-t.w / 2, t.base);
          ctx.lineTo(t.w / 2, t.base);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // Bindu center
      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (selectedPreset.id === 'fibonacci_spiral') {
      ctx.strokeStyle = cyan;
      ctx.beginPath();
      const phi = 1.6180339887;
      let a = 1.5;
      for (let theta = 0; theta < Math.PI * 2 * (rings || 5); theta += 0.05) {
        const r = a * Math.pow(phi, (2 * theta) / Math.PI) * 0.12;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Radiating golden circles
      for (let i = 1; i <= 8; i++) {
        const r = Math.pow(phi, i) * 3;
        ctx.strokeStyle = i % 2 === 0 ? gold : emerald;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

    } else if (selectedPreset.id === 'torus_vortex') {
      const major = baseRadius * 2.8;
      const minor = baseRadius * 1.2;
      const strands = Math.max(12, rings);

      for (let i = 0; i < strands; i++) {
        const u = (i * Math.PI * 2) / strands;
        ctx.strokeStyle = i % 2 === 0 ? gold : cyan;
        ctx.beginPath();
        for (let v = 0; v <= Math.PI * 2; v += 0.1) {
          const x = (major + minor * Math.cos(v)) * Math.cos(u + v * 0.5);
          const y = (major + minor * Math.cos(v)) * Math.sin(u + v * 0.5);
          if (v === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

    } else if (selectedPreset.id === 'merkaba') {
      const s = baseRadius * 2.6;
      // Upward pointing tetrahedron
      ctx.strokeStyle = gold;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(-s * 0.866, s * 0.5);
      ctx.lineTo(s * 0.866, s * 0.5);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s * 0.2);
      ctx.lineTo(-s * 0.866, s * 0.5);
      ctx.moveTo(0, s * 0.2);
      ctx.lineTo(s * 0.866, s * 0.5);
      ctx.stroke();

      // Downward pointing tetrahedron
      ctx.strokeStyle = cyan;
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.lineTo(-s * 0.866, -s * 0.5);
      ctx.lineTo(s * 0.866, -s * 0.5);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.lineTo(0, -s * 0.2);
      ctx.lineTo(-s * 0.866, -s * 0.5);
      ctx.moveTo(0, -s * 0.2);
      ctx.lineTo(s * 0.866, -s * 0.5);
      ctx.stroke();

    } else if (selectedPreset.id === 'milk_hill') {
      const arms = 6;
      const dotsPerArm = 24;
      for (let arm = 0; arm < arms; arm++) {
        const armAngle = (arm * Math.PI * 2) / arms;
        for (let i = 1; i <= dotsPerArm; i++) {
          const frac = i / dotsPerArm;
          const theta = armAngle + frac * Math.PI * 1.5;
          const dist = frac * baseRadius * 3.5;
          const x = dist * Math.cos(theta);
          const y = dist * Math.sin(theta);
          const r = 2.5 + frac * 6;
          ctx.beginPath();
          ctx.strokeStyle = arm % 2 === 0 ? gold : emerald;
          ctx.fillStyle = isDark ? 'rgba(212,175,55,0.2)' : 'rgba(16,185,129,0.2)';
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }, [selectedPreset, rotationAngle, rings, scale, strokeWidth, glowEffect, isDark, gold, cyan, emerald]);

  // Export handlers
  const handleExportSVG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <rect width="100%" height="100%" fill="#05060B"/>
  <circle cx="300" cy="300" r="220" stroke="#D4AF37" stroke-width="2" fill="none"/>
  <circle cx="300" cy="300" r="110" stroke="#10B981" stroke-width="1.5" fill="none"/>
  <!-- Zoth UFO Sacred Geometry Export: ${selectedPreset.name} -->
  <text x="20" y="580" fill="#71717A" font-family="monospace" font-size="12">Preset: ${selectedPreset.name} • 1nc0gn30 • NullAI</text>
</svg>`;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPreset.id}_sacred_geometry.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDXF = () => {
    const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
0
CIRCLE
8
SACRED_GEOM
10
0.0
20
0.0
30
0.0
40
55.0
62
7
0
ENDSEC
0
EOF`;
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPreset.id}_autocad.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportOBJ = () => {
    const objContent = `# Wavefront OBJ generated by Zoth UFO Sacred Geometry Studio
# Preset: ${selectedPreset.name}
# Engineered by 1nc0gn30 (@1nc0gn30)
v 0.000000 0.000000 0.000000
v 50.000000 0.000000 0.000000
v 25.000000 43.301270 0.000000
v -25.000000 43.301270 0.000000
v -50.000000 0.000000 0.000000
v -25.000000 -43.301270 0.000000
v 25.000000 -43.301270 0.000000
l 2 3 4 5 6 7 2
`;
    const blob = new Blob([objContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPreset.id}_mesh.obj`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAST = () => {
    const ast = {
      preset: selectedPreset.id,
      name: selectedPreset.name,
      category: selectedPreset.category,
      scale,
      rings,
      strokeWidth,
      rotationAngle: +(rotationAngle.toFixed(4)),
      symmetry: 6,
      units: 'mm',
      entities: [
        { type: 'CIRCULAR_GRID', count: rings * 6 + 1, radius: 55 * scale },
        { type: 'HARMONIC_AXES', angles_deg: [0, 60, 120, 180, 240, 300] }
      ],
      attribution: '1nc0gn30 • NullAI • NullAI Platform'
    };
    navigator.clipboard?.writeText(JSON.stringify(ast, null, 2))?.catch?.(() => {});
    setCopiedKey('ast');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {/* Top Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(16,185,129,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(16,185,129,0.08) 100%)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.3)',
          borderRadius: 2
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <AutoAwesomeIcon sx={{ color: gold, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                UFO Sacred Geometry Studio
              </Typography>
              <Chip
                label="v2.5.0"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,134,11,0.15)',
                  color: gold,
                  border: `1px solid ${gold}`
                }}
              />
              <Chip
                label="100% UNLOCKED"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: emeraldSoft,
                  color: emerald,
                  border: `1px solid ${emerald}`
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 740 }}>
              100% in-browser sacred geometry synthesizer, crop circle agro-glyph CAD generator, procedural Metatron brand media, and AutoCAD DXF, Wavefront OBJ, and vector SVG exporter with dual Stripe + Solana rails.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={daemonStatus.online ? `DAEMON :8083 ONLINE` : 'STANDALONE JS'}
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: daemonStatus.online ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                color: daemonStatus.online ? emerald : 'text.secondary',
                border: `1px solid ${daemonStatus.online ? emerald : 'rgba(255,255,255,0.1)'}`
              }}
            />
            <Button
              variant="outlined"
              size="small"
              href="http://127.0.0.1:8083"
              target="_blank"
              sx={{
                fontFamily: mono,
                borderColor: gold,
                color: gold,
                '&:hover': { borderColor: gold, bgcolor: 'rgba(212,175,55,0.08)' }
              }}
            >
              Standalone :8083 ↗
            </Button>
          </Stack>
        </Stack>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            mt: 2,
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              py: 0.5,
              fontFamily: mono,
              fontSize: '0.82rem',
              fontWeight: 600
            }
          }}
        >
          <Tab label="Interactive Synthesizer" />
          <Tab label="CAD & AST Exporter" />
          <Tab label="ZothOS CLI & Python SDK" />
        </Tabs>
      </Paper>

      {/* Tab 0: Interactive Synthesizer */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {/* Main Visualizer Canvas */}
          <Grid xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                bgcolor: isDark ? '#05060B' : '#FFFFFF',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <canvas
                ref={canvasRef}
                width={600}
                height={520}
                style={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  display: 'block'
                }}
              />

              {/* In-Canvas Play/Pause & Reset Bar */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mt: 2,
                  width: '100%',
                  justifyContent: 'space-between',
                  px: 1
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant={autoRotate ? 'contained' : 'outlined'}
                    onClick={() => setAutoRotate(!autoRotate)}
                    startIcon={autoRotate ? <PauseIcon /> : <PlayArrowIcon />}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.78rem',
                      bgcolor: autoRotate ? gold : 'transparent',
                      color: autoRotate ? '#000' : gold,
                      borderColor: gold,
                      '&:hover': { bgcolor: gold, color: '#000' }
                    }}
                  >
                    {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setRotationAngle(0);
                      setScale(selectedPreset.defaultScale);
                      setRings(selectedPreset.defaultRings);
                    }}
                    sx={{ border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportSVG}
                    sx={{ fontFamily: mono, fontSize: '0.75rem', borderColor: emerald, color: emerald }}
                  >
                    SVG
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrecisionManufacturingIcon />}
                    onClick={handleExportDXF}
                    sx={{ fontFamily: mono, fontSize: '0.75rem', borderColor: cyan, color: cyan }}
                  >
                    DXF CAD
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>

          {/* Controls & Preset Selector */}
          <Grid xs={12} lg={4}>
            <Stack spacing={2}>
              {/* Presets List */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, mb: 1.5, color: gold }}>
                  HARMONIC PRESETS (8)
                </Typography>
                <Stack spacing={1}>
                  {PRESETS.map(p => {
                    const isSelected = selectedPreset.id === p.id;
                    return (
                      <Box
                        key={p.id}
                        onClick={() => handleSelectPreset(p)}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          bgcolor: isSelected
                            ? isDark
                              ? 'rgba(212,175,55,0.12)'
                              : 'rgba(184,134,11,0.12)'
                            : 'transparent',
                          border: '1px solid',
                          borderColor: isSelected ? gold : 'transparent',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {p.name}
                          </Typography>
                          <Chip
                            label={p.category}
                            size="small"
                            sx={{ fontFamily: mono, fontSize: '0.65rem', height: 20 }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3, fontSize: '0.72rem' }}>
                          {p.desc}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>

              {/* Realtime Synthesizer Sliders */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 700, mb: 1.5, color: emerald }}>
                  SYNTHESIS PARAMETERS
                </Typography>

                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ fontFamily: mono }}>Grid Density / Rings</Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{rings}</Typography>
                  </Stack>
                  <Slider
                    size="small"
                    value={rings}
                    min={1}
                    max={selectedPreset.id === 'torus_vortex' ? 36 : 8}
                    onChange={(_, val) => setRings(val)}
                    sx={{ color: gold }}
                  />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ fontFamily: mono }}>Scale Factor</Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{scale.toFixed(2)}x</Typography>
                  </Stack>
                  <Slider
                    size="small"
                    value={scale}
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    onChange={(_, val) => setScale(val)}
                    sx={{ color: emerald }}
                  />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" sx={{ fontFamily: mono }}>Stroke Width</Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{strokeWidth.toFixed(1)}px</Typography>
                  </Stack>
                  <Slider
                    size="small"
                    value={strokeWidth}
                    min={0.5}
                    max={4.0}
                    step={0.1}
                    onChange={(_, val) => setStrokeWidth(val)}
                    sx={{ color: cyan }}
                  />
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant={glowEffect ? 'contained' : 'outlined'}
                    onClick={() => setGlowEffect(!glowEffect)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      bgcolor: glowEffect ? emerald : 'transparent',
                      color: glowEffect ? '#000' : emerald,
                      borderColor: emerald,
                      '&:hover': { bgcolor: emerald, color: '#000' }
                    }}
                  >
                    {glowEffect ? '✦ Bloom Active' : 'Bloom Off'}
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: CAD & AST Exporter */}
      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            1-Click Precision CAD & 3D Vector Bundle (100% Unlocked)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Direct client-side generation of industrial CAD formats for laser cutters, waterjets, CNC routers, and 3D modeling pipelines.
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.3)',
                  bgcolor: isDark ? 'rgba(212,175,55,0.05)' : 'rgba(184,134,11,0.05)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: gold }}>
                  AutoCAD DXF R12
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Clean 2D vector path for CNC laser cutting, plasma tables, and milling.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<PrecisionManufacturingIcon />}
                  onClick={handleExportDXF}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    bgcolor: gold,
                    color: '#000',
                    '&:hover': { bgcolor: '#c49f27' }
                  }}
                >
                  Export DXF
                </Button>
              </Paper>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.3)',
                  bgcolor: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.05)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: emerald }}>
                  Wavefront OBJ Mesh
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  3D vertex coordinates and polygonal line edges for Blender, Three.js, or Maya.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportOBJ}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    bgcolor: emerald,
                    color: '#000',
                    '&:hover': { bgcolor: '#0ea572' }
                  }}
                >
                  Export OBJ
                </Button>
              </Paper>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(0,240,255,0.3)' : 'rgba(0,180,216,0.3)',
                  bgcolor: isDark ? 'rgba(0,240,255,0.05)' : 'rgba(0,180,216,0.05)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: cyan }}>
                  Scalable Vector SVG
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Lossless vector graphics for Figma, Illustrator, apparel prints, and web media.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportSVG}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    bgcolor: cyan,
                    color: '#000',
                    '&:hover': { bgcolor: '#00d4e0' }
                  }}
                >
                  Export SVG
                </Button>
              </Paper>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Geometry AST JSON
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Structured syntax tree with exact coordinate nodes, symmetry orders, and radii.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={copiedKey === 'ast' ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyAST}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem'
                  }}
                >
                  {copiedKey === 'ast' ? 'Copied AST!' : 'Copy AST'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tab 2: ZothOS CLI & Python SDK */}
      {activeTab === 2 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            ZothOS Terminal Binary & Python SDK
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Execute sacred geometry calculations directly from the command line or embed in automation scripts.
          </Typography>

          <Paper
            sx={{
              p: 2,
              bgcolor: isDark ? '#08080C' : '#1E1E24',
              color: '#F4F4F5',
              fontFamily: mono,
              fontSize: '0.82rem',
              borderRadius: 1.5,
              mb: 2,
              overflowX: 'auto'
            }}
          >
            <Box sx={{ color: '#71717A', mb: 1 }}># Check daemon status or list available sacred presets</Box>
            <Box sx={{ color: '#D4AF37' }}>ufo-sacred-geometry --status</Box>
            <Box sx={{ color: '#D4AF37' }}>ufo-sacred-geometry presets</Box>
            <Box sx={{ color: '#71717A', my: 1 }}># Generate SVG or DXF from terminal</Box>
            <Box sx={{ color: '#10B981' }}>ufo-sacred-geometry generate flower_of_life --output ~/flower.svg</Box>
            <Box sx={{ color: '#00F0FF' }}>ufo-sacred-geometry generate metatrons_cube --format dxf --output ~/metatron.dxf</Box>
          </Paper>
        </Paper>
      )}

      {/* Sovereign Visualisation Band */}
      <Box sx={{ mt: 3 }}>
        <SovereignBand toolId="ufo-sacred-geometry" primitive="bayer" />
      </Box>
    </Box>
  );
}
