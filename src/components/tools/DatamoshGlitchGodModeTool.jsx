import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Unstable_Grid2 as Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CasinoIcon from '@mui/icons-material/Casino';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BoltIcon from '@mui/icons-material/Bolt';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import {
  DATAMOSH_VERSION,
  GLITCH_PRESETS,
  applyPipeline,
  corruptJpegBytes,
  estimateMotionVectors,
  serializePreset,
  parsePresetJson,
} from '../../utils/datamoshGlitchEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const REAL_MCP_TOOLS = [
  ['datamosh_apply', 'Apply parametric glitch presets to BMP/PPM or SMPTE test card'],
  ['datamosh_generate_sequence', 'Synthesize multi-frame continuous I-frame drop sequences'],
  ['datamosh_presets', 'List registered glitch presets and parameter definitions'],
  ['datamosh_corrupt_bytes', 'Header-safe binary byte-stream corruption'],
  ['datamosh_motion_estimate', 'Macroblock SAD optical flow estimation + ASCII/SVG map'],
  ['datamosh_liquid_melt', 'Compounded directional motion-vector liquid-melt sequence'],
  ['datamosh_bitplane_slice', 'True 8-bitplane masking and bit inversion (Bits 0..7)'],
  ['datamosh_sierpinski_xor', 'Spatial coordinate boolean fractal synthesis (XOR/AND/OR)'],
  ['datamosh_bitplane_mosaic', 'XSS-escaped 8-panel SVG bitplane activity mosaic'],
  ['datamosh_diagnostics', 'Runtime, preset count, and zero-dependency health report'],
];

export default function DatamoshGlitchGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast Editorial Ivory Light & Obsidian Gold Dark tokens (all >= 4.5:1)
  const gold = isDark ? '#E2BE4A' : '#7A5808';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : 'rgba(122,88,8,0.10)';
  const goldBorder = isDark ? 'rgba(212,175,55,0.28)' : 'rgba(122,88,8,0.32)';
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldSoft = isDark ? 'rgba(52,211,153,0.14)' : '#ECFDF5';
  const emeraldBorder = isDark ? 'rgba(52,211,153,0.40)' : '#6EE7B7';
  const danger = isDark ? '#FB7185' : '#B91C1C';
  const dangerSoft = isDark ? 'rgba(251,113,133,0.12)' : '#FEF2F2';
  const primaryText = isDark ? '#F5F1E6' : '#0F172A';
  const secondaryText = isDark ? '#A3AAB8' : '#475569';
  const cardBg = isDark ? '#0B0D14' : '#FFFFFF';
  const surfaceBg = isDark ? '#11141F' : '#FAF8F3';
  const subtleBorder = isDark ? 'rgba(245,241,230,0.14)' : 'rgba(15,23,42,0.16)';
  const primaryBtnBg = isDark ? '#D4AF37' : '#0F172A';
  const primaryBtnFg = isDark ? '#08080B' : '#FFFFFF';

  const canvasRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const prevRgbaRef = useRef(null);
  const customImgRef = useRef(null);
  const jpegSeqRef = useRef(0);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(GLITCH_PRESETS[0]);
  const [source, setSource] = useState('bars');
  const [sliceHeight, setSliceHeight] = useState(18);
  const [shiftMax, setShiftMax] = useState(36);
  const [rgbSplit, setRgbSplit] = useState(6);
  const [scanIntensity, setScanIntensity] = useState(15);
  const [fps, setFps] = useState(12);
  const [pixelSort, setPixelSort] = useState(false);
  const [pixelSortLow, setPixelSortLow] = useState(50);
  const [pixelSortHigh, setPixelSortHigh] = useState(220);
  const [pixelSortDir, setPixelSortDir] = useState('row');
  const [jpegBend, setJpegBend] = useState(false);
  const [jpegIntensity, setJpegIntensity] = useState(18);
  const [bitplaneEnabled, setBitplaneEnabled] = useState(false);
  const [keepBits, setKeepBits] = useState([7, 6, 5, 4, 3, 2, 1, 0]);
  const [invertMsb, setInvertMsb] = useState(false);
  const [bitplaneChannel, setBitplaneChannel] = useState('all');
  const [sierpinskiEnabled, setSierpinskiEnabled] = useState(false);
  const [sierpinskiFormula, setSierpinskiFormula] = useState('xor');
  const [sierpinskiBlend, setSierpinskiBlend] = useState(50);
  const [splitPct, setSplitPct] = useState(100);
  const [showMotionVectors, setShowMotionVectors] = useState(false);
  const [mvSummary, setMvSummary] = useState('READY');
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameTick, setFrameTick] = useState(1);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [daemonStatus, setDaemonStatus] = useState({ online: false, uptime: 0, version: DATAMOSH_VERSION });

  useEffect(() => {
    let mounted = true;
    const checkDaemon = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8081/health', { signal: AbortSignal.timeout(1200) });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setDaemonStatus({ online: true, uptime: data.uptime_seconds || 0, version: data.version || DATAMOSH_VERSION });
          }
        } else if (mounted) {
          setDaemonStatus((prev) => ({ ...prev, online: false }));
        }
      } catch {
        if (mounted) setDaemonStatus((prev) => ({ ...prev, online: false }));
      }
    };
    checkDaemon();
    const interval = setInterval(checkDaemon, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    setSliceHeight(preset.sliceHeight);
    setShiftMax(preset.shiftMax);
    setRgbSplit(preset.rgbSplit);
    setScanIntensity(preset.scanIntensity);
    setPixelSort(Boolean(preset.pixelSort));
    setPixelSortLow(preset.pixelSortLow);
    setPixelSortHigh(preset.pixelSortHigh);
    setPixelSortDir(preset.pixelSortDir || 'row');
    setJpegBend(Boolean(preset.jpegBend));
    setJpegIntensity(preset.jpegIntensity || 18);
    setBitplaneEnabled(Boolean(preset.bitplaneEnabled));
    setKeepBits([...(preset.keepBits || [7, 6, 5])]);
    setInvertMsb(Boolean(preset.invertBits?.includes(7)));
    setBitplaneChannel(preset.bitplaneChannel || 'all');
    setSierpinskiEnabled(Boolean(preset.sierpinskiEnabled));
    setSierpinskiFormula(preset.sierpinskiFormula || 'xor');
    setSierpinskiBlend(Math.round((preset.sierpinskiBlend ?? 0.5) * 100));
  };

  const drawBasePattern = useCallback((ctx, w, h, tickVal) => {
    if (source === 'upload' && customImgRef.current) {
      ctx.fillStyle = '#08080C';
      ctx.fillRect(0, 0, w, h);
      const img = customImgRef.current;
      const sc = Math.min(w / img.width, h / img.height);
      const dw = img.width * sc;
      const dh = img.height * sc;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      return;
    }
    if (source === 'grid') {
      ctx.fillStyle = '#060812';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#00E5C4';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.fillStyle = '#E2BE4A';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('DATAMOSH // CYBER GRID', 24, 50);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(36 + ((tickVal * 11) % 340), 110, 68, 68);
      return;
    }
    if (source === 'grad') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#E11D48');
      grad.addColorStop(0.5, '#7C3AED');
      grad.addColorStop(1, '#0891B2');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('NEON HORIZON', 32, 122);
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(340, 140, 52, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const colors = ['#D4D4D4', '#EAB308', '#06B6D4', '#22C55E', '#D946EF', '#EF4444', '#2563EB'];
    const barW = w / colors.length;
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * barW, 0, barW + 1, h * 0.74);
    });
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(0, h * 0.74, w * 0.22, h * 0.26);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(w * 0.22, h * 0.74, w * 0.22, h * 0.26);
    ctx.fillStyle = '#7E22CE'; ctx.fillRect(w * 0.44, h * 0.74, w * 0.22, h * 0.26);
    ctx.fillStyle = '#111827'; ctx.fillRect(w * 0.66, h * 0.74, w * 0.34, h * 0.26);
  }, [source]);

  const composeToCanvas = useCallback((ctx, w, h, origData, glitchedData) => {
    const splitX = Math.round((splitPct / 100) * w);
    const outImg = ctx.createImageData(w, h);
    const dst = outImg.data;
    for (let y = 0; y < h; y++) {
      const row = y * w * 4;
      for (let x = 0; x < w; x++) {
        const i = row + x * 4;
        const src = x < splitX ? glitchedData : origData;
        dst[i] = src[i];
        dst[i + 1] = src[i + 1];
        dst[i + 2] = src[i + 2];
        dst[i + 3] = 255;
      }
    }
    ctx.putImageData(outImg, 0, 0);

    if (showMotionVectors) {
      const ref = prevRgbaRef.current || origData;
      const mv = estimateMotionVectors(ref, glitchedData, w, h, { blockSize: 28, searchRange: 6 });
      setMvSummary(`${mv.totalBlocks} BLKS · AVG ${mv.averageMagnitude}px`);
      ctx.save();
      ctx.strokeStyle = '#00FFCC';
      ctx.fillStyle = '#00FFCC';
      ctx.lineWidth = 1.5;
      for (const v of mv.vectors) {
        if (v.dx === 0 && v.dy === 0) continue;
        const cx = v.mbX + mv.blockSize / 2;
        const cy = v.mbY + mv.blockSize / 2;
        const tx = cx + v.dx * 2.5;
        const ty = cy + v.dy * 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else {
      setMvSummary('READY');
    }

    if (splitPct > 0 && splitPct < 100) {
      ctx.save();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();
      ctx.fillStyle = 'rgba(8,8,12,0.82)';
      ctx.fillRect(8, 8, 86, 22);
      ctx.fillRect(w - 94, 8, 86, 22);
      ctx.fillStyle = '#F5F1E6';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('GLITCHED', 16, 23);
      ctx.fillText('ORIGINAL', w - 86, 23);
      ctx.restore();
    }

    prevRgbaRef.current = new Uint8ClampedArray(glitchedData);
  }, [splitPct, showMotionVectors]);

  const renderGlitch = useCallback((tickVal) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!baseCanvasRef.current) {
      baseCanvasRef.current = document.createElement('canvas');
      baseCanvasRef.current.width = canvas.width;
      baseCanvasRef.current.height = canvas.height;
    }
    const baseCtx = baseCanvasRef.current.getContext('2d', { willReadFrequently: true });
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const w = canvas.width;
    const h = canvas.height;

    drawBasePattern(baseCtx, w, h, tickVal);
    const origData = baseCtx.getImageData(0, 0, w, h).data;
    const glitched = applyPipeline(origData, w, h, {
      sliceHeight,
      shiftMax,
      rgbSplit,
      scanIntensity,
      pixelSort,
      pixelSortLow,
      pixelSortHigh,
      pixelSortDir,
      bitplaneEnabled,
      keepBits,
      invertBits: invertMsb ? [7] : [],
      bitplaneChannel,
      sierpinskiEnabled,
      sierpinskiFormula,
      sierpinskiScale: 1.5,
      sierpinskiBlend: sierpinskiBlend / 100,
      seed: 42 + tickVal * 17,
    });

    composeToCanvas(ctx, w, h, origData, glitched);

    if (jpegBend) {
      const seq = ++jpegSeqRef.current;
      const tmp = document.createElement('canvas');
      tmp.width = w;
      tmp.height = h;
      const tctx = tmp.getContext('2d');
      const id = tctx.createImageData(w, h);
      id.data.set(glitched);
      tctx.putImageData(id, 0, 0);
      const dataUrl = tmp.toDataURL('image/jpeg', 0.86);
      const b64 = dataUrl.split(',')[1];
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const bent = corruptJpegBytes(bytes, { intensity: jpegIntensity, seed: 99 + tickVal });
      const blob = new Blob([bent.bytes], { type: 'image/jpeg' });
      const objUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        if (seq === jpegSeqRef.current) {
          tctx.drawImage(img, 0, 0, w, h);
          const bentRgba = tctx.getImageData(0, 0, w, h).data;
          composeToCanvas(ctx, w, h, origData, bentRgba);
        }
        URL.revokeObjectURL(objUrl);
      };
      img.onerror = () => URL.revokeObjectURL(objUrl);
      img.src = objUrl;
    }
  }, [
    drawBasePattern,
    composeToCanvas,
    sliceHeight,
    shiftMax,
    rgbSplit,
    scanIntensity,
    pixelSort,
    pixelSortLow,
    pixelSortHigh,
    pixelSortDir,
    bitplaneEnabled,
    keepBits,
    invertMsb,
    bitplaneChannel,
    sierpinskiEnabled,
    sierpinskiFormula,
    sierpinskiBlend,
    jpegBend,
    jpegIntensity,
  ]);

  useEffect(() => {
    renderGlitch(frameTick);
  }, [renderGlitch, frameTick]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setInterval(() => {
      setFrameTick((t) => t + 1);
    }, Math.round(1000 / Math.max(4, fps)));
    return () => clearInterval(timer);
  }, [isPlaying, fps]);

  const toggleBit = (bit) => {
    setBitplaneEnabled(true);
    setKeepBits((prev) => (prev.includes(bit) ? prev.filter((b) => b !== bit) : [...prev, bit].sort((a, b) => b - a)));
  };

  const handleUploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      customImgRef.current = img;
      setSource('upload');
      setFrameTick((t) => t + 1);
      setStatusNote(`Loaded image: ${file.name}`);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatusNote('Failed to decode uploaded image.');
    };
    img.src = url;
    event.target.value = '';
  };

  const handleDownload = (format = 'png') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = format === 'webp' ? 'image/webp' : 'image/png';
    const a = document.createElement('a');
    a.download = `datamosh_${selectedPreset.id}_${Date.now()}.${format}`;
    a.href = canvas.toDataURL(mime, 0.92);
    a.click();
    setStatusNote(`Exported ${format.toUpperCase()} frame.`);
  };

  const handleExportPresetJson = () => {
    const jsonStr = serializePreset({
      name: selectedPreset.name,
      sliceHeight,
      shiftMax,
      rgbSplit,
      scanIntensity,
      fps,
      pixelSort,
      pixelSortLow,
      pixelSortHigh,
      pixelSortDir,
      jpegBend,
      jpegIntensity,
      bitplaneEnabled,
      keepBits,
      invertBits: invertMsb ? [7] : [],
      bitplaneChannel,
      sierpinskiEnabled,
      sierpinskiFormula,
      sierpinskiScale: 1.5,
      sierpinskiBlend: sierpinskiBlend / 100,
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datamosh_preset_${selectedPreset.id}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatusNote('Exported validated JSON preset.');
  };

  const handleImportPresetJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parsePresetJson(String(reader.result));
        setSliceHeight(parsed.sliceHeight);
        setShiftMax(parsed.shiftMax);
        setRgbSplit(parsed.rgbSplit);
        setScanIntensity(parsed.scanIntensity);
        setFps(parsed.fps);
        setPixelSort(parsed.pixelSort);
        setPixelSortLow(parsed.pixelSortLow);
        setPixelSortHigh(parsed.pixelSortHigh);
        setPixelSortDir(parsed.pixelSortDir);
        setJpegBend(parsed.jpegBend);
        setJpegIntensity(parsed.jpegIntensity);
        setBitplaneEnabled(parsed.bitplaneEnabled);
        setKeepBits(parsed.keepBits);
        setInvertMsb(parsed.invertBits.includes(7));
        setBitplaneChannel(parsed.bitplaneChannel);
        setSierpinskiEnabled(parsed.sierpinskiEnabled);
        setSierpinskiFormula(parsed.sierpinskiFormula);
        setSierpinskiBlend(Math.round(parsed.sierpinskiBlend * 100));
        setStatusNote(`Imported preset: ${parsed.name}`);
      } catch (err) {
        setStatusNote(`Preset rejected: ${err.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleRecordWebM = (durationSec = 4.0) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.captureStream || recordingVideo) return;
    try {
      setRecordingVideo(true);
      const stream = canvas.captureStream(30);
      const chunks = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datamosh_${selectedPreset.id}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setRecordingVideo(false);
        setStatusNote('Exported 30fps WebM video loop.');
      };
      recorder.start();
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, durationSec * 1000);
    } catch {
      setRecordingVideo(false);
      handleDownload('png');
    }
  };

  const randomizeParams = () => {
    setShiftMax(Math.floor(Math.random() * 55) + 10);
    setRgbSplit(Math.floor(Math.random() * 20));
    setSliceHeight(Math.floor(Math.random() * 28) + 4);
    setScanIntensity(Math.floor(Math.random() * 50) + 10);
    setFrameTick((t) => t + 1);
  };

  return (
    <Box data-testid="datamosh-glitch-workstation" sx={{ width: '100%', mt: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1.5px solid ${goldBorder}`,
          boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.65)' : '0 8px 24px rgba(15,23,42,0.06)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 0.5 }}>
              <PrecisionManufacturingIcon sx={{ color: gold, fontSize: 26 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: primaryText, letterSpacing: '-0.02em' }}>
                DATAMOSH GLITCH STUDIO
              </Typography>
              <Chip
                label={`v${DATAMOSH_VERSION}`}
                size="small"
                sx={{
                  bgcolor: goldSoft,
                  color: gold,
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  border: `1px solid ${goldBorder}`,
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: secondaryText, maxWidth: 680 }}>
              Luminance pixel sorting, header-safe JPEG byte-bending, true 8-bitplane slicing, Sierpinski XOR fractals, and optical-flow motion vectors — 100% client-side with zero paywalls.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip
              icon={<BoltIcon sx={{ fontSize: '14px !important', color: daemonStatus.online ? `${emerald} !important` : `${secondaryText} !important` }} />}
              label={daemonStatus.online ? `API :8081 ONLINE (${daemonStatus.uptime.toFixed(0)}s)` : 'CLIENT 2D CANVAS'}
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: daemonStatus.online ? emeraldSoft : surfaceBg,
                color: daemonStatus.online ? emerald : secondaryText,
                border: `1px solid ${daemonStatus.online ? emeraldBorder : subtleBorder}`,
              }}
            />
            <Chip
              label="100% OPEN ACCESS"
              size="small"
              sx={{
                bgcolor: emeraldSoft,
                color: emerald,
                border: `1px solid ${emeraldBorder}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.7rem',
              }}
            />
          </Stack>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            mb: 2.5,
            borderBottom: `1px solid ${subtleBorder}`,
            '& .MuiTab-root': {
              fontFamily: mono,
              fontSize: '0.78rem',
              fontWeight: 700,
              minHeight: 44,
              color: secondaryText,
              '&.Mui-selected': { color: gold },
            },
            '& .MuiTabs-indicator': { bgcolor: gold },
          }}
        >
          <Tab label="Interactive Mosh Buffer" />
          <Tab label="Preset Catalog & Math" />
          <Tab label="CLI & 10 MCP Tools" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={2.5}>
            {/* Left: Monitor Canvas + Scrubber + Exports */}
            <Grid xs={12} lg={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: surfaceBg,
                  border: `1px solid ${subtleBorder}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '3/2',
                    bgcolor: '#060609',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: `1px solid ${subtleBorder}`,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={320}
                    aria-label="Datamosh glitch synthesis output canvas"
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                  />
                </Box>

                {/* Before/After Split Scrubber */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 700 }}>
                      Before / After Split Scrubber
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                      {splitPct}% Glitched
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={0}
                    max={100}
                    value={splitPct}
                    onChange={(_, v) => setSplitPct(Number(v))}
                    aria-label="Before and after split comparison scrubber"
                    sx={{ color: gold }}
                  />
                </Box>

                {/* Playback & Overlay Controls */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant={isPlaying ? 'contained' : 'outlined'}
                    onClick={() => setIsPlaying(!isPlaying)}
                    startIcon={isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderColor: gold,
                      color: isPlaying ? primaryBtnFg : gold,
                      bgcolor: isPlaying ? primaryBtnBg : 'transparent',
                      whiteSpace: 'nowrap',
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
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderColor: subtleBorder,
                      color: primaryText,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Randomize
                  </Button>
                  <Button
                    size="small"
                    variant={showMotionVectors ? 'contained' : 'outlined'}
                    onClick={() => setShowMotionVectors(!showMotionVectors)}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderColor: subtleBorder,
                      bgcolor: showMotionVectors ? primaryBtnBg : 'transparent',
                      color: showMotionVectors ? primaryBtnFg : primaryText,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {showMotionVectors ? 'MV Overlay: ON' : 'MV Overlay: OFF'}
                  </Button>
                </Stack>

                {/* Real Export Row: PNG, WebP, WebM, Preset JSON Export/Import */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleDownload('png')}
                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      bgcolor: primaryBtnBg,
                      color: primaryBtnFg,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    PNG
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleDownload('webp')}
                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderColor: subtleBorder,
                      color: primaryText,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    WebP
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleRecordWebM(4.0)}
                    disabled={recordingVideo}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderColor: danger,
                      bgcolor: dangerSoft,
                      color: danger,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {recordingVideo ? 'Recording…' : 'Record WebM (4s)'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleExportPresetJson}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderColor: subtleBorder,
                      color: primaryText,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Export JSON
                  </Button>
                  <Button
                    size="small"
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderColor: subtleBorder,
                      color: primaryText,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Import JSON
                    <input
                      type="file"
                      hidden
                      accept="application/json,.json"
                      aria-label="Import datamosh JSON preset file"
                      onChange={handleImportPresetJson}
                    />
                  </Button>
                </Stack>

                <Box
                  sx={{
                    pt: 1.25,
                    borderTop: `1px solid ${subtleBorder}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    fontSize: '0.72rem',
                    fontFamily: mono,
                    color: secondaryText,
                  }}
                >
                  <span>BUFFER: 480×320 RGB</span>
                  <span>MV FLOW: {mvSummary}</span>
                  <span>RATE: {fps} FPS</span>
                </Box>
                {statusNote && (
                  <Typography variant="caption" sx={{ fontFamily: mono, color: emerald, fontWeight: 700 }}>
                    {statusNote}
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Right: Presets, Sources & Real Pixel/Bitplane/Byte-Bend Controls */}
            <Grid xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: cardBg,
                  border: `1px solid ${subtleBorder}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Presets */}
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800, display: 'block', mb: 1 }}>
                    GLITCH PRESET SELECTOR
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                    {GLITCH_PRESETS.map((p) => {
                      const active = selectedPreset.id === p.id;
                      return (
                        <Button
                          key={p.id}
                          size="small"
                          variant={active ? 'contained' : 'outlined'}
                          onClick={() => applyPreset(p)}
                          sx={{
                            minHeight: 44,
                            fontFamily: mono,
                            fontSize: '0.7rem',
                            px: 1,
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            borderColor: active ? primaryBtnBg : subtleBorder,
                            bgcolor: active ? primaryBtnBg : 'transparent',
                            color: active ? primaryBtnFg : primaryText,
                            fontWeight: active ? 800 : 600,
                            lineHeight: 1.2,
                          }}
                        >
                          {p.name}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>

                {/* Signal Sources + Upload Image */}
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800, display: 'block', mb: 1 }}>
                    SIGNAL SOURCE
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, mb: 1 }}>
                    {[
                      { id: 'bars', label: 'SMPTE' },
                      { id: 'grid', label: 'Grid' },
                      { id: 'grad', label: 'Horizon' },
                    ].map((s) => {
                      const active = source === s.id;
                      return (
                        <Button
                          key={s.id}
                          size="small"
                          variant={active ? 'contained' : 'outlined'}
                          onClick={() => setSource(s.id)}
                          sx={{
                            minHeight: 44,
                            fontFamily: mono,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            bgcolor: active ? primaryBtnBg : 'transparent',
                            color: active ? primaryBtnFg : primaryText,
                            borderColor: active ? primaryBtnBg : subtleBorder,
                          }}
                        >
                          {s.label}
                        </Button>
                      );
                    })}
                  </Box>
                  <Button
                    fullWidth
                    size="small"
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderColor: subtleBorder,
                      color: primaryText,
                    }}
                  >
                    Upload Custom Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      aria-label="Upload custom source image"
                      onChange={handleUploadImage}
                    />
                  </Button>
                </Box>

                {/* Core Sliders (every Slider explicitly aria-labeled) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {[
                    { label: 'Slice Height', val: `${sliceHeight}px`, min: 4, max: 64, v: sliceHeight, set: setSliceHeight, aria: 'Macroblock slice height in pixels' },
                    { label: 'Shift Magnitude', val: `${shiftMax}px`, min: 0, max: 96, v: shiftMax, set: setShiftMax, aria: 'Horizontal displacement shift magnitude' },
                    { label: 'RGB Chromatic Split', val: `${rgbSplit}px`, min: 0, max: 32, v: rgbSplit, set: setRgbSplit, aria: 'RGB chromatic aberration split offset' },
                    { label: 'CRT Scanlines', val: `${scanIntensity}%`, min: 0, max: 100, v: scanIntensity, set: setScanIntensity, aria: 'CRT scanline darkening intensity' },
                    { label: 'Animation Rate', val: `${fps} FPS`, min: 4, max: 30, v: fps, set: setFps, aria: 'Animation loop frame rate in frames per second' },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                          {item.val}
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={item.min}
                        max={item.max}
                        value={item.v}
                        onChange={(_, val) => item.set(Number(val))}
                        aria-label={item.aria}
                        sx={{ color: gold }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Advanced Modules: Pixel Sort, JPEG Byte-Bend, True 8-Bitplane, Sierpinski XOR */}
                <Box sx={{ pt: 1.5, borderTop: `1px solid ${subtleBorder}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
                    PIXEL SORT · JPEG BYTE-BEND · 8-BITPLANE · XOR
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <FormControlLabel
                      control={<Switch size="small" checked={pixelSort} onChange={(e) => setPixelSort(e.target.checked)} inputProps={{ 'aria-label': 'Toggle luminance pixel sorting' }} />}
                      label={<Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 700 }}>Pixel Sort</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch size="small" checked={jpegBend} onChange={(e) => setJpegBend(e.target.checked)} inputProps={{ 'aria-label': 'Toggle header-safe JPEG byte-bending' }} />}
                      label={<Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 700 }}>JPEG Bend</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch size="small" checked={bitplaneEnabled} onChange={(e) => setBitplaneEnabled(e.target.checked)} inputProps={{ 'aria-label': 'Toggle true 8-bitplane slicer' }} />}
                      label={<Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 700 }}>8-Bitplane</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch size="small" checked={sierpinskiEnabled} onChange={(e) => setSierpinskiEnabled(e.target.checked)} inputProps={{ 'aria-label': 'Toggle Sierpinski spatial XOR' }} />}
                      label={<Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 700 }}>Sierpinski XOR</Typography>}
                    />
                  </Stack>

                  {bitplaneEnabled && (
                    <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: surfaceBg, border: `1px solid ${subtleBorder}` }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.75, mb: 1 }}>
                        {[7, 6, 5, 4, 3, 2, 1, 0].map((b) => {
                          const on = keepBits.includes(b);
                          return (
                            <Button
                              key={b}
                              size="small"
                              variant={on ? 'contained' : 'outlined'}
                              onClick={() => toggleBit(b)}
                              sx={{
                                minHeight: 40,
                                fontFamily: mono,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: on ? primaryBtnBg : 'transparent',
                                color: on ? primaryBtnFg : primaryText,
                                borderColor: subtleBorder,
                              }}
                            >
                              B{b}
                            </Button>
                          );
                        })}
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Select
                          size="small"
                          value={bitplaneChannel}
                          onChange={(e) => setBitplaneChannel(e.target.value)}
                          inputProps={{ 'aria-label': 'Bitplane channel selector' }}
                          sx={{ fontFamily: mono, fontSize: '0.74rem', minWidth: 130, color: primaryText }}
                        >
                          <MenuItem value="all">All RGB</MenuItem>
                          <MenuItem value="luminance">Luminance</MenuItem>
                          <MenuItem value="r">Red</MenuItem>
                          <MenuItem value="g">Green</MenuItem>
                          <MenuItem value="b">Blue</MenuItem>
                        </Select>
                        <FormControlLabel
                          control={<Switch size="small" checked={invertMsb} onChange={(e) => setInvertMsb(e.target.checked)} inputProps={{ 'aria-label': 'Invert Bit 7 MSB' }} />}
                          label={<Typography variant="caption" sx={{ fontFamily: mono, color: primaryText, fontWeight: 700 }}>Invert MSB</Typography>}
                        />
                      </Stack>
                    </Box>
                  )}

                  {sierpinskiEnabled && (
                    <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: surfaceBg, border: `1px solid ${subtleBorder}` }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Select
                          size="small"
                          value={sierpinskiFormula}
                          onChange={(e) => setSierpinskiFormula(e.target.value)}
                          inputProps={{ 'aria-label': 'Sierpinski boolean formula' }}
                          sx={{ fontFamily: mono, fontSize: '0.74rem', minWidth: 110, color: primaryText }}
                        >
                          <MenuItem value="xor">x XOR y</MenuItem>
                          <MenuItem value="and">x AND y</MenuItem>
                          <MenuItem value="or">x OR y</MenuItem>
                          <MenuItem value="xor_and">XOR &amp; SUM</MenuItem>
                        </Select>
                        <Box sx={{ flex: 1 }}>
                          <Slider
                            size="small"
                            min={10}
                            max={100}
                            value={sierpinskiBlend}
                            onChange={(_, v) => setSierpinskiBlend(Number(v))}
                            aria-label="Sierpinski XOR blend percentage"
                            sx={{ color: gold }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={2}>
            {GLITCH_PRESETS.map((p) => (
              <Grid xs={12} sm={6} md={4} key={p.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: surfaceBg,
                    border: `1px solid ${subtleBorder}`,
                    borderRadius: 2,
                    height: '100%',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mb: 0.5 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: secondaryText, display: 'block', mb: 1.5 }}>
                    {p.desc}
                  </Typography>
                  <Stack spacing={0.5} sx={{ fontSize: '0.72rem', fontFamily: mono, color: primaryText }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><span>Slice / Shift:</span><strong>{p.sliceHeight}px / {p.shiftMax}px</strong></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><span>RGB Split / CRT:</span><strong>{p.rgbSplit}px / {p.scanIntensity}%</strong></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><span>Modes:</span><strong>{[p.pixelSort && 'SORT', p.bitplaneEnabled && 'BITPLANE', p.sierpinskiEnabled && 'XOR'].filter(Boolean).join(' + ') || 'MOSH'}</strong></Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: mono, color: gold, fontWeight: 800 }}>
              ZOTHOS CLI, UNICODE BRAILLE TUI &amp; 10 REAL STDIO MCP TOOLS
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#0B0D14',
                border: `1px solid ${goldBorder}`,
                borderRadius: 2,
                fontFamily: mono,
                fontSize: '0.78rem',
                color: '#F5F1E6',
              }}
            >
              <Box sx={{ color: '#34D399', fontWeight: 700, mb: 0.5 }}># CLI, Braille TUI &amp; Loopback Server (:8081)</Box>
              <Box sx={{ mb: 1.5 }}>
                datamosh-glitch-studio --status --json<br />
                datamosh mosh -p cyberpunk_vcr -o /tmp/glitched.bmp<br />
                datamosh bitplane --keep-bits 7,6,5 --mosaic /tmp/mosaic.svg -o /tmp/bp.bmp<br />
                datamosh-glitch-studio-tui --once<br />
                datamosh mcp
              </Box>
              <Box sx={{ color: '#E2BE4A', fontWeight: 700, mb: 0.5 }}># Registered MCP Tools (10 — JSON-RPC 2.0 over stdio)</Box>
              {REAL_MCP_TOOLS.map(([name, desc]) => (
                <Box key={name} sx={{ py: 0.25 }}>
                  <strong style={{ color: '#38BDF8' }}>{name}</strong> — {desc}
                </Box>
              ))}
            </Paper>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
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
