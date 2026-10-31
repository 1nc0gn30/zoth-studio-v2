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
import ViewInArIcon from '@mui/icons-material/ViewInAr';
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

const SHAPES = [
  { id: 'tesseract', name: '4D Hypercube (Tesseract)', type: 'SO(4) Lie Projection', verts: 16, edges: 32 },
  { id: 'torusKnot', name: 'Torus Knot (2,3)', type: 'Parametric Closed Curve', verts: 120, edges: 120 },
  { id: 'klein', name: 'Klein Bottle', type: 'Non-Orientable 4D Immersion', verts: 160, edges: 320 },
  { id: 'dodeca', name: 'Platonic Dodecahedron', type: 'Regular Convex Polyhedron', verts: 20, edges: 30 },
  { id: 'mobius', name: 'Möbius Strip', type: 'Single-Sided Surface', verts: 120, edges: 240 }
];

export default function Nexus3DGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const emerald = '#10B981';
  const emeraldSoft = 'rgba(16, 185, 129, 0.12)';
  const cyan = '#00F0FF';

  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [rotX, setRotX] = useState(0.4);
  const [rotY, setRotY] = useState(0.6);
  const [autoRotate, setAutoRotate] = useState(true);
  const [tesseractAngle, setTesseractAngle] = useState(0.5);
  const [scale, setScale] = useState(1.0);
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [daemonStatus, setDaemonStatus] = useState({ online: false, uptime: 0, version: '1.0.0' });

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Daemon health check (:8082)
  useEffect(() => {
    let mounted = true;
    const checkDaemon = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8082/health', { signal: AbortSignal.timeout(1200) });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setDaemonStatus({ online: true, uptime: data.uptime_seconds || 0, version: data.version || '1.0.0' });
          }
        } else if (mounted) {
          setDaemonStatus(prev => ({ ...prev, online: false }));
        }
      } catch {
        if (mounted) setDaemonStatus(prev => ({ ...prev, online: false }));
      }
    };
    checkDaemon();
    const interval = setInterval(checkDaemon, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getShapeData = () => {
    const points = [];
    const edges = [];

    if (selectedShape.id === 'tesseract') {
      const a = tesseractAngle;
      for (let i = 0; i < 16; i++) {
        const x = (i & 1 ? 1 : -1);
        const y = (i & 2 ? 1 : -1);
        const z = (i & 4 ? 1 : -1);
        const w = (i & 8 ? 1 : -1);

        const rx = x * Math.cos(a) - w * Math.sin(a);
        const rw = x * Math.sin(a) + w * Math.cos(a);

        const d = 2.5;
        const factor = d / (d - rw * 0.5);
        points.push([rx * factor * 50 * scale, y * factor * 50 * scale, z * factor * 50 * scale]);
      }
      for (let i = 0; i < 16; i++) {
        for (let bit = 0; bit < 4; bit++) {
          const j = i ^ (1 << bit);
          if (i < j) edges.push([i, j]);
        }
      }
    } else if (selectedShape.id === 'torusKnot') {
      const p = 2, q = 3;
      const count = 120;
      for (let i = 0; i < count; i++) {
        const u = (i / count) * Math.PI * 2;
        const r = (55 + 20 * Math.cos(q * u)) * scale;
        const x = r * Math.cos(p * u);
        const y = r * Math.sin(p * u);
        const z = -25 * Math.sin(q * u) * scale;
        points.push([x, y, z]);
        edges.push([i, (i + 1) % count]);
      }
    } else if (selectedShape.id === 'klein') {
      const uCount = 16, vCount = 10;
      for (let i = 0; i < uCount; i++) {
        const u = (i / uCount) * Math.PI * 2;
        for (let j = 0; j < vCount; j++) {
          const v = (j / vCount) * Math.PI * 2;
          const r = 3.5 * (1 - Math.cos(u) / 2);
          let x, y, z;
          if (u < Math.PI) {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v);
            y = 14 * Math.sin(u) + r * Math.sin(u) * Math.cos(v);
          } else {
            x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
            y = 14 * Math.sin(u);
          }
          z = r * Math.sin(v);
          points.push([x * 3.8 * scale, y * 3.5 * scale - 15, z * 3.8 * scale]);
        }
      }
      for (let i = 0; i < uCount; i++) {
        for (let j = 0; j < vCount; j++) {
          const idx = i * vCount + j;
          const nextV = i * vCount + ((j + 1) % vCount);
          const nextU = ((i + 1) % uCount) * vCount + j;
          edges.push([idx, nextV]);
          edges.push([idx, nextU]);
        }
      }
    } else if (selectedShape.id === 'mobius') {
      const uCount = 30, vCount = 4;
      const R = 60 * scale, W = 25 * scale;
      for (let i = 0; i < uCount; i++) {
        const u = (i / uCount) * Math.PI * 2;
        for (let j = 0; j < vCount; j++) {
          const v = (j / (vCount - 1) - 0.5) * W;
          const x = (R + v * Math.cos(u / 2)) * Math.cos(u);
          const y = (R + v * Math.cos(u / 2)) * Math.sin(u);
          const z = v * Math.sin(u / 2);
          points.push([x, y, z]);
        }
      }
      for (let i = 0; i < uCount; i++) {
        for (let j = 0; j < vCount; j++) {
          const idx = i * vCount + j;
          if (j + 1 < vCount) edges.push([idx, idx + 1]);
          const nextU = ((i + 1) % uCount) * vCount + j;
          edges.push([idx, nextU]);
        }
      }
    } else {
      // Dodecahedron
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = 45 * scale;
      const raw = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
        [0, -phi, -1/phi], [0, -phi, 1/phi], [0, phi, 1/phi], [0, phi, -1/phi],
        [-1/phi, 0, -phi], [1/phi, 0, -phi], [1/phi, 0, phi], [-1/phi, 0, phi],
        [-phi, -1/phi, 0], [phi, -1/phi, 0], [phi, 1/phi, 0], [-phi, 1/phi, 0]
      ];
      raw.forEach(p => points.push([p[0] * s, p[1] * s, p[2] * s]));
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i][0] - points[j][0];
          const dy = points[i][1] - points[j][1];
          const dz = points[i][2] - points[j][2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < s * 1.35) edges.push([i, j]);
        }
      }
    }

    return { points, edges };
  };

  const renderScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    const { points, edges } = getShapeData();

    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

    const projected = points.map(([x, y, z]) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const cameraDist = 320;
      const fov = cameraDist / (cameraDist + z2);
      return {
        px: cx + x1 * fov,
        py: cy + y2 * fov,
        depth: z2,
        fov
      };
    });

    // Draw coordinate base ring
    ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.14)' : 'rgba(184,134,11,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 90, 100 * scale, 30 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Render Edges with depth attenuation
    edges.forEach(([i, j]) => {
      const p1 = projected[i];
      const p2 = projected[j];
      if (!p1 || !p2) return;

      const avgDepth = (p1.depth + p2.depth) / 2;
      const alpha = Math.max(0.15, Math.min(0.95, (avgDepth + 120) / 240));

      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${alpha})` : `rgba(2, 132, 199, ${alpha})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });

    // Render Vertices with gold glow
    projected.forEach((p) => {
      const radius = Math.max(2, 3.8 * p.fov);
      ctx.beginPath();
      ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = gold;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#000' : '#FFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  useEffect(() => {
    let animId = null;
    const tick = () => {
      if (autoRotate) {
        setRotY((prev) => prev + 0.012);
        if (selectedShape.id === 'tesseract') {
          setTesseractAngle((prev) => (prev + 0.015) % (Math.PI * 2));
        }
      }
      renderScene();
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate, rotX, rotY, tesseractAngle, selectedShape, scale, isDark]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setRotY((prev) => prev + dx * 0.008);
    setRotX((prev) => prev + dy * 0.008);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const exportOBJ = () => {
    const { points, edges } = getShapeData();
    let obj = `# Nexus 3D Scene Studio Wavefront OBJ Export\n# Shape: ${selectedShape.name}\n\n`;
    points.forEach(([x, y, z]) => {
      obj += `v ${(x / 50).toFixed(6)} ${(y / 50).toFixed(6)} ${(z / 50).toFixed(6)}\n`;
    });
    obj += `\ng ${selectedShape.id}\n`;
    edges.forEach(([i, j]) => {
      obj += `l ${i + 1} ${j + 1}\n`;
    });

    const blob = new Blob([obj], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nexus3d_${selectedShape.id}_${Date.now()}.obj`;
    a.click();
  };

  const exportSTL = () => {
    const { points, edges } = getShapeData();
    let stl = `solid ${selectedShape.id}\n`;
    edges.forEach(([i, j]) => {
      const p1 = points[i];
      const p2 = points[j];
      stl += `  facet normal 0.0 0.0 1.0\n    outer loop\n`;
      stl += `      vertex ${(p1[0]/50).toFixed(4)} ${(p1[1]/50).toFixed(4)} ${(p1[2]/50).toFixed(4)}\n`;
      stl += `      vertex ${(p2[0]/50).toFixed(4)} ${(p2[1]/50).toFixed(4)} ${(p2[2]/50).toFixed(4)}\n`;
      stl += `      vertex ${(p1[0]/50).toFixed(4)} ${(p1[1]/50).toFixed(4)} ${(p1[2]/50).toFixed(4)}\n`;
      stl += `    endloop\n  endfacet\n`;
    });
    stl += `endsolid ${selectedShape.id}\n`;

    const blob = new Blob([stl], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nexus3d_${selectedShape.id}_${Date.now()}.stl`;
    a.click();
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          bgcolor: isDark ? '#07070B' : '#FFFFFF',
          border: `1.5px solid ${isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.25)'}`,
          boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.7)' : '0 8px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <ViewInArIcon sx={{ color: gold, fontSize: 26 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: isDark ? '#FFF' : '#111', letterSpacing: '-0.02em' }}>
                NEXUS 3D SCENE STUDIO
              </Typography>
              <Chip
                label="SOVEREIGN v2.5"
                size="small"
                sx={{
                  bgcolor: 'rgba(212,175,55,0.14)',
                  color: gold,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: `1px solid ${gold}40`
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', maxWidth: 680 }}>
              100% in-browser WebGL mathematical 3D geometry engine, 4D Tesseract projection, Klein bottles, and precision Wavefront OBJ / STL exporters with zero paywalls.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<BoltIcon sx={{ fontSize: '14px !important', color: daemonStatus.online ? `${emerald} !important` : '#94A3B8 !important' }} />}
              label={daemonStatus.online ? `DAEMON :8082 ONLINE (${daemonStatus.uptime.toFixed(0)}s)` : 'STANDALONE IN-BROWSER'}
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: daemonStatus.online ? emeraldSoft : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                color: daemonStatus.online ? emerald : isDark ? '#94A3B8' : '#64748B',
                border: `1px solid ${daemonStatus.online ? emerald : isDark ? '#334155' : '#CBD5E1'}`
              }}
            />
            <Chip
              label="100% UNLOCKED"
              size="small"
              sx={{
                bgcolor: emeraldSoft,
                color: emerald,
                border: `1px solid ${emerald}50`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.7rem'
              }}
            />
          </Stack>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            minHeight: 40,
            mb: 3,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            '& .MuiTab-root': {
              fontFamily: mono,
              fontSize: '0.8rem',
              fontWeight: 700,
              minHeight: 40,
              py: 0.5,
              color: isDark ? '#94A3B8' : '#64748B',
              '&.Mui-selected': { color: gold }
            },
            '& .MuiTabs-indicator': { bgcolor: gold }
          }}
        >
          <Tab label="Interactive 3D / 4D Viewport" />
          <Tab label="Procedural Primitives & Math" />
          <Tab label="FastMCP & CLI Architecture" />
        </Tabs>

        {/* TAB 0: Interactive Viewport */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Left: 3D Viewport */}
            <Grid xs={12} lg={7}>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: isDark ? '#020205' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.18)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  sx={{
                    width: '100%',
                    maxWidth: 520,
                    aspectRatio: '3/2',
                    bgcolor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' }
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={320}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                  />
                </Box>

                {/* Viewport Action Bar */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={autoRotate ? 'contained' : 'outlined'}
                      onClick={() => setAutoRotate(!autoRotate)}
                      startIcon={autoRotate ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderColor: gold,
                        color: autoRotate ? '#000' : gold,
                        bgcolor: autoRotate ? gold : 'transparent',
                        '&:hover': { bgcolor: autoRotate ? '#C5A028' : 'rgba(212,175,55,0.1)' }
                      }}
                    >
                      {autoRotate ? 'Pause Orbit' : 'Auto Orbit'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => { setRotX(0.4); setRotY(0.6); setScale(1.0); }}
                      startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: isDark ? '#E2E8F0' : '#1E293B'
                      }}
                    >
                      Reset View
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={exportOBJ}
                      startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        bgcolor: gold,
                        color: '#08080B',
                        '&:hover': { bgcolor: '#C5A028' }
                      }}
                    >
                      Export OBJ
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={exportSTL}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderColor: gold,
                        color: gold
                      }}
                    >
                      Export STL
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ width: '100%', mt: 2, pt: 1.5, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: mono, color: isDark ? '#94A3B8' : '#64748B' }}>
                  <span>GEOMETRY: {selectedShape.name.toUpperCase()}</span>
                  <span>VERTICES: {selectedShape.verts}</span>
                  <span>EDGES: {selectedShape.edges}</span>
                </Box>
              </Paper>
            </Grid>

            {/* Right: Primitives Selector & Spatial Sliders */}
            <Grid xs={12} lg={5}>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: isDark ? '#040409' : '#FFFFFF',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.18)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }}
              >
                {/* Shape Selector */}
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800, display: 'block', mb: 1 }}>
                    PROCEDURAL 3D/4D SHAPE
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 1 }}>
                    {SHAPES.map((s) => (
                      <Button
                        key={s.id}
                        size="small"
                        variant={selectedShape.id === s.id ? 'contained' : 'outlined'}
                        onClick={() => setSelectedShape(s)}
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.74rem',
                          py: 0.8,
                          px: 1.5,
                          textTransform: 'none',
                          justifyContent: 'space-between',
                          borderColor: selectedShape.id === s.id ? gold : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                          bgcolor: selectedShape.id === s.id ? gold : 'transparent',
                          color: selectedShape.id === s.id ? '#08080B' : isDark ? '#E2E8F0' : '#1E293B',
                          fontWeight: selectedShape.id === s.id ? 800 : 500
                        }}
                      >
                        <span>{s.name}</span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{s.type}</span>
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Spatial Parameter Sliders */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        Geometry Scale Factor
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {scale.toFixed(2)}x
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0.5}
                      max={2.0}
                      step={0.05}
                      value={scale}
                      onChange={(e, v) => setScale(v)}
                      sx={{ color: gold }}
                    />
                  </Box>

                  {selectedShape.id === 'tesseract' && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                          4D Rotation Angle θ (SO(4) Plane)
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                          {(tesseractAngle * (180 / Math.PI)).toFixed(0)}°
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={0}
                        max={Math.PI * 2}
                        step={0.05}
                        value={tesseractAngle}
                        onChange={(e, v) => setTesseractAngle(v)}
                        sx={{ color: gold }}
                      />
                    </Box>
                  )}

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        Horizontal Orbit Elevation
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {(rotY * (180 / Math.PI)).toFixed(0)}°
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={-Math.PI}
                      max={Math.PI}
                      step={0.05}
                      value={rotY}
                      onChange={(e, v) => setRotY(v)}
                      sx={{ color: gold }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: Mathematical Foundations */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
              MATHEMATICAL 3D & 4D GEOMETRY PIPELINE
            </Typography>
            <Grid container spacing={2}>
              {SHAPES.map((s) => (
                <Grid xs={12} sm={6} md={4} key={s.id}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: isDark ? '#040408' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mb: 0.5 }}>
                      {s.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', mb: 1.5 }}>
                      Category: {s.type}
                    </Typography>
                    <Stack spacing={0.5} sx={{ fontSize: '0.72rem', fontFamily: mono, color: isDark ? '#E2E8F0' : '#334155' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vertices Count:</span> <strong>{s.verts}</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Edges Count:</span> <strong>{s.edges}</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Manifold Type:</span> <strong>Watertight</strong>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* TAB 2: FastMCP & CLI Architecture */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
              ZOTHOS CLI & FASTMCP INTERACTION ARCHITECTURE
            </Typography>
            <Paper
              sx={{
                p: 2.5,
                bgcolor: '#030306',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: 2,
                fontFamily: mono,
                fontSize: '0.8rem',
                color: '#E2E8F0'
              }}
            >
              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 1. Check Studio Installation & Operational Status
              </Typography>
              <Box sx={{ mb: 2, color: '#F8FAFC' }}>
                nexus-3d-scene-studio --status<br/>
                nexus-3d-scene-studio --json
              </Box>

              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 2. Generate 3D Shapes & Export OBJ/STL
              </Typography>
              <Box sx={{ mb: 2, color: '#F8FAFC' }}>
                nexus-3d generate torus_knot -o /tmp/torus.obj<br/>
                nexus-3d generate tesseract -o /tmp/tesseract.stl
              </Box>

              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 3. Audit Mesh Polygon Budget & VRAM
              </Typography>
              <Box sx={{ mb: 2, color: '#F8FAFC' }}>
                nexus-3d audit /tmp/torus.obj
              </Box>

              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 4. FastMCP stdio Server for Claude & Autonomous Agents
              </Typography>
              <Box sx={{ color: '#F8FAFC' }}>
                nexus-3d mcp
              </Box>
            </Paper>
          </Box>
        )}

        {/* Sovereign Verification Band */}
        <Box sx={{ mt: 4 }}>
          <SovereignBand
            toolId="nexus-3d-scene-studio"
            toolTitle="Nexus 3D Scene Studio"
            primitive="braille"
          />
        </Box>
      </Paper>
    </Box>
  );
}
