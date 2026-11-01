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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CasinoIcon from '@mui/icons-material/Casino';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TuneIcon from '@mui/icons-material/Tune';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const GLITCH_PRESETS = [
  { id: 'iframe', name: 'H.264 I-Frame Drop', desc: 'Missing keyframe compression artifacts with macroblock drag', slice: 18, shift: 36, rgb: 6, scan: 15 },
  { id: 'vcr', name: 'Cyberpunk VCR Tracking', desc: 'Magnetic tape tracking roll and color desync', slice: 6, shift: 48, rgb: 14, scan: 65 },
  { id: 'rgb', name: 'RGB Chromatic Overdrive', desc: 'Spatial separation of red, green, and blue color channels', slice: 12, shift: 16, rgb: 24, scan: 20 },
  { id: 'tape', name: 'Analog Tape Decay', desc: 'Degraded magnetic tape with noise floor & dropout streaks', slice: 10, shift: 24, rgb: 8, scan: 45 },
  { id: 'matrix', name: 'Quantum Matrix Tear', desc: 'High-frequency macroblock corruption & bitflips', slice: 24, shift: 55, rgb: 16, scan: 30 },
  { id: 'bitplane', name: 'Bitplane Solarizer', desc: 'Selective bitplane slicing and MSB inversion', slice: 14, shift: 28, rgb: 12, scan: 35 }
];

export default function DatamoshGlitchGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const emerald = '#10B981';
  const emeraldSoft = 'rgba(16, 185, 129, 0.12)';
  const cyan = '#00F0FF';

  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(GLITCH_PRESETS[0]);
  const [source, setSource] = useState('bars'); // 'bars', 'grid', 'grad'
  const [sliceHeight, setSliceHeight] = useState(18);
  const [shiftMax, setShiftMax] = useState(36);
  const [rgbSplit, setRgbSplit] = useState(6);
  const [scanIntensity, setScanIntensity] = useState(15);
  const [fps, setFps] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [daemonStatus, setDaemonStatus] = useState({ online: false, uptime: 0, presets: 6 });

  // Daemon health check (:8081)
  useEffect(() => {
    let mounted = true;
    const checkDaemon = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8081/health', { signal: AbortSignal.timeout(1200) });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setDaemonStatus({ online: true, uptime: data.uptime_seconds || 0, presets: 6 });
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

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    setSliceHeight(preset.slice);
    setShiftMax(preset.shift);
    setRgbSplit(preset.rgb);
    setScanIntensity(preset.scan);
  };

  const drawBasePattern = (ctx, w, h) => {
    if (source === 'grid') {
      ctx.fillStyle = '#05050A';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('NULLAI // CYBER GRID', 24, 48);
      return;
    }
    if (source === 'grad') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#FF007F');
      grad.addColorStop(0.5, '#7928CA');
      grad.addColorStop(1, '#00DFD8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('NEON HORIZON', 32, 120);
      return;
    }
    // SMPTE Color Bars
    const colors = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
    const barW = w / colors.length;
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * barW, 0, barW, h * 0.75);
    });
    // Bottom signals
    ctx.fillStyle = '#0000C0'; ctx.fillRect(0, h * 0.75, w * 0.2, h * 0.25);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(w * 0.2, h * 0.75, w * 0.2, h * 0.25);
    ctx.fillStyle = '#C000C0'; ctx.fillRect(w * 0.4, h * 0.75, w * 0.2, h * 0.25);
    ctx.fillStyle = '#101010'; ctx.fillRect(w * 0.6, h * 0.75, w * 0.4, h * 0.25);
  };

  const renderGlitch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    drawBasePattern(ctx, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    // 1. Horizontal slice displacement (I-frame drop / tracking roll)
    if (shiftMax > 0 && sliceHeight > 0) {
      for (let y = 0; y < h; y += sliceHeight) {
        if (Math.random() < 0.72) {
          const shift = Math.floor((Math.random() * 2 - 1) * shiftMax);
          const sliceEnd = Math.min(h, y + sliceHeight);
          for (let sy = y; sy < sliceEnd; sy++) {
            for (let sx = 0; sx < w; sx++) {
              const targetX = (sx + shift + w) % w;
              const srcIdx = (sy * w + sx) * 4;
              const dstIdx = (sy * w + targetX) * 4;
              data[dstIdx] = copy[srcIdx];
              data[dstIdx + 1] = copy[srcIdx + 1];
              data[dstIdx + 2] = copy[srcIdx + 2];
            }
          }
        }
      }
    }

    // 2. RGB chromatic split
    if (rgbSplit > 0) {
      const current = new Uint8ClampedArray(data);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const rx = (x + rgbSplit + w) % w;
          const bx = (x - rgbSplit + w) % w;
          const idx = (y * w + x) * 4;
          data[idx] = current[(y * w + rx) * 4];
          data[idx + 2] = current[(y * w + bx) * 4 + 2];
        }
      }
    }

    // 3. Scanline CRT interlacing
    if (scanIntensity > 0) {
      const factor = 1 - scanIntensity / 100;
      for (let y = 0; y < h; y += 3) {
        const rowStart = y * w * 4;
        const rowEnd = rowStart + w * 4;
        for (let i = rowStart; i < rowEnd; i += 4) {
          data[i] = data[i] * factor;
          data[i + 1] = data[i + 1] * factor;
          data[i + 2] = data[i + 2] * factor;
        }
      }
    }

    // 4. Bitplane glitch (if active)
    if (selectedPreset.id === 'bitplane') {
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.06) {
          data[i] = data[i] ^ 0xAA;
          data[i + 1] = data[i + 1] ^ 0x55;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  useEffect(() => {
    renderGlitch();
  }, [selectedPreset, source, sliceHeight, shiftMax, rgbSplit, scanIntensity]);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(renderGlitch, 1000 / fps);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, fps, selectedPreset, source, sliceHeight, shiftMax, rgbSplit, scanIntensity]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `datamosh_${selectedPreset.id}_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const randomizeParams = () => {
    setShiftMax(Math.floor(Math.random() * 55) + 10);
    setRgbSplit(Math.floor(Math.random() * 20));
    setSliceHeight(Math.floor(Math.random() * 30) + 4);
    setScanIntensity(Math.floor(Math.random() * 50) + 10);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text)?.catch?.(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
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
              <PrecisionManufacturingIcon sx={{ color: gold, fontSize: 26 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: isDark ? '#FFF' : '#111', letterSpacing: '-0.02em' }}>
                DATAMOSH GLITCH STUDIO
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
              Parametric video datamoshing, authentic H.264 I-frame drop simulation, delta-frame duplication, and CRT scanlines synthesized 100% client-side with zero paywalls.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<BoltIcon sx={{ fontSize: '14px !important', color: daemonStatus.online ? `${emerald} !important` : '#94A3B8 !important' }} />}
              label={daemonStatus.online ? `DAEMON :8081 ONLINE (${daemonStatus.uptime.toFixed(0)}s)` : 'STANDALONE IN-BROWSER'}
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
          <Tab label="Interactive Mosh Buffer" />
          <Tab label="Preset Catalog & Math" />
          <Tab label="CLI & FastMCP Architecture" />
        </Tabs>

        {/* TAB 0: Interactive Workstation */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Left: Live Canvas Viewport */}
            <Grid xs={12} lg={7}>
              <Paper
                sx={{
                  p: 2.5,
                  bgcolor: isDark ? '#020205' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.18)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 520,
                    aspectRatio: '3/2',
                    bgcolor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2,
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={320}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                  />
                </Box>

                {/* Canvas Status & Controls */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={isPlaying ? 'contained' : 'outlined'}
                      onClick={() => setIsPlaying(!isPlaying)}
                      startIcon={isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderColor: gold,
                        color: isPlaying ? '#000' : gold,
                        bgcolor: isPlaying ? gold : 'transparent',
                        '&:hover': { bgcolor: isPlaying ? '#C5A028' : 'rgba(212,175,55,0.1)' }
                      }}
                    >
                      {isPlaying ? 'Pause Loop' : 'Play Loop'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={randomizeParams}
                      startIcon={<CasinoIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: isDark ? '#E2E8F0' : '#1E293B'
                      }}
                    >
                      Randomize
                    </Button>
                  </Stack>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleDownload}
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
                    Download Frame (PNG)
                  </Button>
                </Box>

                <Box sx={{ width: '100%', mt: 2, pt: 1.5, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: mono, color: isDark ? '#94A3B8' : '#64748B' }}>
                  <span>BUFFER: 480x320 RGB</span>
                  <span>PRESET: {selectedPreset.name.toUpperCase()}</span>
                  <span>RATE: {fps} FPS</span>
                </Box>
              </Paper>
            </Grid>

            {/* Right: Parametric Sliders & Source Selection */}
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
                {/* Glitch Presets Grid */}
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800, display: 'block', mb: 1 }}>
                    GLITCH PRESET SELECTOR
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {GLITCH_PRESETS.map((p) => (
                      <Button
                        key={p.id}
                        size="small"
                        variant={selectedPreset.id === p.id ? 'contained' : 'outlined'}
                        onClick={() => applyPreset(p)}
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          py: 0.8,
                          px: 1,
                          textTransform: 'none',
                          justifyContent: 'flex-start',
                          borderColor: selectedPreset.id === p.id ? gold : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                          bgcolor: selectedPreset.id === p.id ? gold : 'transparent',
                          color: selectedPreset.id === p.id ? '#08080B' : isDark ? '#E2E8F0' : '#1E293B',
                          fontWeight: selectedPreset.id === p.id ? 800 : 500,
                          lineHeight: 1.2
                        }}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Source Pattern */}
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800, display: 'block', mb: 1 }}>
                    TEST PATTERN SOURCE
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {[
                      { id: 'bars', label: 'SMPTE Bars' },
                      { id: 'grid', label: 'Cyber Grid' },
                      { id: 'grad', label: 'Neon Sunrise' }
                    ].map(s => (
                      <Button
                        key={s.id}
                        size="small"
                        variant={source === s.id ? 'contained' : 'outlined'}
                        onClick={() => setSource(s.id)}
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.72rem',
                          flex: 1,
                          bgcolor: source === s.id ? (isDark ? '#334155' : '#CBD5E1') : 'transparent',
                          color: isDark ? '#FFF' : '#000',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
                        }}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                {/* Parametric Controls */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        Slice Height (Macroblock Dimension)
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {sliceHeight}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={4}
                      max={48}
                      value={sliceHeight}
                      onChange={(e, v) => setSliceHeight(v)}
                      sx={{ color: gold }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        Shift Magnitude (Horizontal Displacement)
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {shiftMax}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={80}
                      value={shiftMax}
                      onChange={(e, v) => setShiftMax(v)}
                      sx={{ color: gold }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        RGB Chromatic Aberration Split
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {rgbSplit}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={32}
                      value={rgbSplit}
                      onChange={(e, v) => setRgbSplit(v)}
                      sx={{ color: gold }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        CRT Scanline Interlacing
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {scanIntensity}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={100}
                      value={scanIntensity}
                      onChange={(e, v) => setScanIntensity(v)}
                      sx={{ color: gold }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#CBD5E1' : '#334155' }}>
                        Animation Rate (Loop Speed)
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 700 }}>
                        {fps} FPS
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={4}
                      max={30}
                      value={fps}
                      onChange={(e, v) => setFps(v)}
                      sx={{ color: gold }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: Presets Catalog & Math */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
              MATHEMATICAL GLITCH & MOSH FOUNDATIONS
            </Typography>
            <Grid container spacing={2}>
              {GLITCH_PRESETS.map((p) => (
                <Grid xs={12} sm={6} md={4} key={p.id}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: isDark ? '#040408' : '#F8FAFC',
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mb: 0.5 }}>
                      {p.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', display: 'block', mb: 1.5 }}>
                      {p.desc}
                    </Typography>
                    <Stack spacing={0.5} sx={{ fontSize: '0.72rem', fontFamily: mono, color: isDark ? '#E2E8F0' : '#334155' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Macroblock Slice:</span> <strong>{p.slice}px</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Shift Magnitude:</span> <strong>{p.shift}px</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>RGB Aberration:</span> <strong>{p.rgb}px</strong>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Scanline Attenuation:</span> <strong>{p.scan}%</strong>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* TAB 2: CLI & FastMCP Architecture */}
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
                datamosh-glitch-studio --status<br/>
                datamosh-glitch-studio --json
              </Box>

              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 2. Synthesize Glitched BMP Frame with Cyberpunk VCR Preset
              </Typography>
              <Box sx={{ mb: 2, color: '#F8FAFC' }}>
                datamosh mosh -p cyberpunk_vcr -o /tmp/glitched.bmp
              </Box>

              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 3. Bitplane Slicing & 8-Panel Mosaic SVG
              </Typography>
              <Box sx={{ mb: 2, color: '#F8FAFC' }}>
                datamosh bitplane --keep-bits 7,6,5 -o /tmp/bitplane.bmp<br/>
                datamosh bitplane --mosaic /tmp/mosaic.svg
              </Box>

              <Typography sx={{ color: emerald, fontWeight: 700, mb: 1 }}>
                # 4. FastMCP stdio Server for Claude & Autonomous Agents
              </Typography>
              <Box sx={{ color: '#F8FAFC' }}>
                datamosh mcp
              </Box>
            </Paper>
          </Box>
        )}

        {/* Sovereign Verification Band */}
        <Box sx={{ mt: 4 }}>
          <SovereignBand
            toolId="datamosh-glitch-studio"
            toolTitle="Datamosh Glitch Studio"
            primitive="bayer"
          />
        </Box>
      </Paper>
    </Box>
  );
}
