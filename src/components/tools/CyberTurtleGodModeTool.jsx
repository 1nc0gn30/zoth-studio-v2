import React, { useState, useMemo } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
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
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import RouteIcon from '@mui/icons-material/Route';
import CodeIcon from '@mui/icons-material/Code';
import PolylineIcon from '@mui/icons-material/Polyline';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import {
  LSYSTEM_PRESETS,
  LOGO_SAMPLES,
  expandLSystem,
  interpretLSystem,
  executeLogoDsl,
  optimizeToolpath2Opt,
  exportAutoFitGCode,
  exportThemeAwareSvg,
  rasterizeBraille,
} from '../../utils/cyberTurtleEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function CyberTurtleGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast WCAG AA (>= 4.5:1) palette tokens for both Dark and Light modes
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldBg = isDark ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5';
  const emeraldInk = isDark ? '#04120B' : '#FFFFFF';
  const gold = isDark ? '#FACC15' : '#854D0E';
  const goldBg = isDark ? 'rgba(212, 175, 55, 0.14)' : '#FEF9C3';
  const sky = isDark ? '#38BDF8' : '#0369A1';
  const amber = isDark ? '#F59E0B' : '#B45309';
  const surface = isDark ? '#0C0D12' : '#FFFFFF';
  const surfaceAlt = isDark ? '#08080C' : '#F8FAFC';
  const borderCol = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.16)';
  const inkPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const inkMuted = isDark ? '#CBD5E1' : '#334155';

  const [activeTab, setActiveTab] = useState(0); // 0=L-System, 1=Logo DSL, 2=2-Opt TSP & Exports
  const [selectedPreset, setSelectedPreset] = useState(LSYSTEM_PRESETS[0]);
  const [axiom, setAxiom] = useState(LSYSTEM_PRESETS[0].axiom);
  const [angle, setAngle] = useState(LSYSTEM_PRESETS[0].angle);
  const [iterations, setIterations] = useState(LSYSTEM_PRESETS[0].iter);
  const [ruleStr, setRuleStr] = useState('F:F+F--F+F');
  const [selectedLogoSample, setSelectedLogoSample] = useState(LOGO_SAMPLES[0].id);
  const [logoCode, setLogoCode] = useState(LOGO_SAMPLES[0].code);
  const [sourceMode, setSourceMode] = useState('lsystem'); // 'lsystem' | 'logo'
  const [useTsp, setUseTsp] = useState(false);
  const [showAirOverlay, setShowAirOverlay] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleSelectPreset = (p) => {
    setSelectedPreset(p);
    setAxiom(p.axiom);
    setAngle(p.angle);
    setIterations(p.iter);
    setRuleStr(Object.entries(p.rules).map(([k, v]) => `${k}:${v}`).join(','));
    setSourceMode('lsystem');
  };

  const handleSelectLogoSample = (sample) => {
    setSelectedLogoSample(sample.id);
    setLogoCode(sample.code);
    setSourceMode('logo');
  };

  // Synchronous deterministic geometry + real 2-Opt TSP computation (zero setTimeout)
  const synthesis = useMemo(() => {
    try {
      let baseGeo;
      let activeTitle;
      if (sourceMode === 'logo') {
        baseGeo = executeLogoDsl(logoCode);
        const sObj = LOGO_SAMPLES.find((x) => x.id === selectedLogoSample);
        activeTitle = `Logo DSL: ${sObj ? sObj.name : 'Custom Script'}`;
      } else {
        const rulesObj = {};
        ruleStr.split(/[,\n;]+/).forEach((pair) => {
          const sep = pair.includes('->') ? '->' : (pair.includes('=') ? '=' : ':');
          const idx = pair.indexOf(sep);
          if (idx > 0) {
            const k = pair.slice(0, idx).trim();
            const v = pair.slice(idx + sep.length).trim();
            if (k && v) rulesObj[k] = v;
          }
        });
        const expanded = expandLSystem(axiom, rulesObj, iterations);
        baseGeo = interpretLSystem(expanded, angle, 10);
        activeTitle = `${selectedPreset.name} (${angle}°)`;
      }

      const tsp = optimizeToolpath2Opt(baseGeo.segments);
      const activeSegments = useTsp ? tsp.segments : baseGeo.segments;
      const activeAirMoves = useTsp ? tsp.airMovesAfter : tsp.airMovesBefore;
      const gcode = exportAutoFitGCode(activeSegments, {
        bedWidth: 200,
        bedHeight: 200,
        title: activeTitle,
      });
      const braille = rasterizeBraille(activeSegments, 46, 15);

      return {
        error: null,
        geometry: baseGeo,
        activeSegments,
        activeAirMoves,
        tsp,
        gcode,
        braille,
        activeTitle,
      };
    } catch (err) {
      return {
        error: err.message || String(err),
        geometry: {
          segments: [],
          pathD: '',
          viewBox: '-100 -100 200 200',
          stats: { segments: 0, drawDistance: 0, rapidTravel: 0 },
        },
        activeSegments: [],
        activeAirMoves: [],
        tsp: {
          initialAirTravel: 0,
          optimizedAirTravel: 0,
          savedMm: 0,
          reductionPercent: 0,
          polylines: 0,
        },
        gcode: '; Error during geometry synthesis',
        braille: '[Synthesis Error]',
        activeTitle: 'Error',
      };
    }
  }, [sourceMode, axiom, ruleStr, iterations, angle, selectedPreset, logoCode, selectedLogoSample, useTsp]);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleDownloadSvg = () => {
    const svg = exportThemeAwareSvg(synthesis.geometry, {
      isDark,
      title: synthesis.activeTitle,
      stroke: isDark ? '#FACC15' : '#047857',
      airMoves: showAirOverlay ? synthesis.activeAirMoves : [],
    });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyberturtle_${sourceMode}_${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadGCode = () => {
    const blob = new Blob([synthesis.gcode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyberturtle_${sourceMode}_200mm.gcode`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const airOverlayPathD = useMemo(() => {
    if (!showAirOverlay || !synthesis.activeAirMoves.length) return '';
    return synthesis.activeAirMoves
      .map((m) => `M ${m.x1.toFixed(2)} ${(-m.y1).toFixed(2)} L ${m.x2.toFixed(2)} ${(-m.y2).toFixed(2)}`)
      .join(' ');
  }, [showAirOverlay, synthesis.activeAirMoves]);

  return (
    <Box sx={{ mt: 1 }} data-testid="cyber-turtle-godmode-workstation">
      {/* Workstation Header Banner (No duplicate Coffee CTA — Studio shell carries the single support strip) */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(8,8,11,0.94) 100%)'
            : 'linear-gradient(135deg, #ECFDF5 0%, #FAF8F3 100%)',
          border: `1px solid ${emerald}`,
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1.1,
              borderRadius: 2,
              bgcolor: emeraldBg,
              color: emerald,
              border: `1px solid ${emerald}`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PrecisionManufacturingIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: emerald }}>
                Cyber Turtle Studio v2.6.0 — Vector &amp; CNC Plotter Deck
              </Typography>
              <Chip
                size="small"
                label="100% FREE & OPEN ACCESS"
                sx={{
                  bgcolor: emeraldBg,
                  color: emerald,
                  border: `1px solid ${emerald}`,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: inkMuted, display: 'block', mt: 0.3 }}>
              Deterministic L-System synthesizer, bounded Logo DSL interpreter, Nearest-Neighbor + 2-Opt TSP air-travel optimizer, auto-fit 200mm CNC G-Code, and 2×4 Braille.
            </Typography>
          </Box>
        </Stack>

        {isLocalRuntime() && (
          <Button
            size="small"
            variant="outlined"
            href="http://127.0.0.1:8129"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontFamily: mono,
              fontSize: '0.76rem',
              fontWeight: 800,
              minHeight: 44,
              borderColor: sky,
              color: sky,
              whiteSpace: 'nowrap',
            }}
          >
            Open Local :8129 Workstation ↗
          </Button>
        )}
      </Paper>

      <SovereignEyebrow accent={emerald} right="Zoth Studio">
        {'cyber-turtle-geometry-engine'}
      </SovereignEyebrow>
      <SovereignBand
        seed={'cyber-turtle-geometry-engine'}
        eyebrow={'Zoth Studio'}
        caption={'Cyber Turtle v2.6.0'}
        label={'Cyber Turtle — Zoth sovereign visualisation'}
      />

      {/* Mode Selector Tabs */}
      <Paper sx={{ mt: 2, mb: 2, bgcolor: surface, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            if (val === 0) setSourceMode('lsystem');
            if (val === 1) setSourceMode('logo');
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Cyber Turtle Studio Modes"
          sx={{
            '& .MuiTab-root': {
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.78rem',
              minHeight: 48,
              color: inkMuted,
            },
            '& .Mui-selected': { color: `${emerald} !important` },
            '& .MuiTabs-indicator': { bgcolor: emerald },
          }}
        >
          <Tab icon={<PolylineIcon fontSize="small" />} iconPosition="start" label="L-System Fractals" />
          <Tab icon={<CodeIcon fontSize="small" />} iconPosition="start" label="Logo DSL" />
          <Tab icon={<RouteIcon fontSize="small" />} iconPosition="start" label="2-Opt TSP / G-Code / Braille" />
        </Tabs>
      </Paper>

      {synthesis.error && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: mono }}>
          {synthesis.error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Active Mode Controls + Real 2-Opt TSP Telemetry */}
        <Grid xs={12} lg={5}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: surface,
              border: `1px solid ${borderCol}`,
              borderRadius: 2,
            }}
          >
            {activeTab === 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: emerald }}>
                  L-System Fractal Presets (Incl. Pythagoras Tree)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                  {LSYSTEM_PRESETS.map((p) => {
                    const active = selectedPreset.id === p.id && sourceMode === 'lsystem';
                    return (
                      <Button
                        key={p.id}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => handleSelectPreset(p)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          minHeight: 44,
                          px: 1.4,
                          bgcolor: active ? emerald : 'transparent',
                          color: active ? emeraldInk : inkPrimary,
                          borderColor: active ? emerald : borderCol,
                          '&:hover': { bgcolor: active ? emerald : emeraldBg, borderColor: emerald },
                        }}
                      >
                        {p.name}
                      </Button>
                    );
                  })}
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    label="Axiom String"
                    size="small"
                    fullWidth
                    value={axiom}
                    onChange={(e) => { setAxiom(e.target.value); setSourceMode('lsystem'); }}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                  />
                  <TextField
                    label="Production Rules (Key:Val,Key:Val)"
                    size="small"
                    fullWidth
                    value={ruleStr}
                    onChange={(e) => { setRuleStr(e.target.value); setSourceMode('lsystem'); }}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.85rem' } }}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: gold }}>
                      Turn Angle θ: {angle}°
                    </Typography>
                    <Slider
                      aria-label="Turn Angle in Degrees"
                      value={angle}
                      min={10}
                      max={180}
                      step={1}
                      onChange={(_, val) => { setAngle(val); setSourceMode('lsystem'); }}
                      sx={{ color: gold }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: emerald }}>
                      Recursion Iterations: {iterations}
                    </Typography>
                    <Slider
                      aria-label="Recursion Iterations"
                      value={iterations}
                      min={1}
                      max={selectedPreset.id === 'dragon' ? 12 : 7}
                      step={1}
                      onChange={(_, val) => { setIterations(val); setSourceMode('lsystem'); }}
                      sx={{ color: emerald }}
                    />
                  </Box>
                </Stack>
              </>
            )}

            {activeTab === 1 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: emerald }}>
                  Bounded Logo DSL Samples
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {LOGO_SAMPLES.map((s) => {
                    const active = selectedLogoSample === s.id && sourceMode === 'logo';
                    return (
                      <Button
                        key={s.id}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        onClick={() => handleSelectLogoSample(s)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: '0.73rem',
                          minHeight: 44,
                          bgcolor: active ? emerald : 'transparent',
                          color: active ? emeraldInk : inkPrimary,
                          borderColor: active ? emerald : borderCol,
                          '&:hover': { bgcolor: active ? emerald : emeraldBg, borderColor: emerald },
                        }}
                      >
                        {s.name}
                      </Button>
                    );
                  })}
                </Stack>
                <TextField
                  label="Logo DSL Script (fd, bk, lt, rt, pu, pd, circle, make, to..end, if)"
                  multiline
                  minRows={7}
                  fullWidth
                  value={logoCode}
                  onChange={(e) => { setLogoCode(e.target.value); setSourceMode('logo'); }}
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
                />
              </>
            )}

            {activeTab === 2 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: emerald }}>
                  2-Opt TSP Optimizer &amp; Machine Output
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useTsp}
                        onChange={(e) => setUseTsp(e.target.checked)}
                        inputProps={{ 'aria-label': 'Enable 2-Opt TSP Air-Travel Optimization' }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: inkPrimary }}>
                        Apply 2-Opt TSP Reordering ({synthesis.tsp.polylines} polylines)
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAirOverlay}
                        onChange={(e) => setShowAirOverlay(e.target.checked)}
                        inputProps={{ 'aria-label': 'Show Dashed Air-Travel Overlay' }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, color: inkPrimary }}>
                        Show Dashed Pen-Up Air-Travel Overlay
                      </Typography>
                    }
                  />
                </Stack>

                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold, display: 'block', mb: 0.5 }}>
                  2×4 UNICODE BRAILLE RASTER (U+2800)
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    mb: 2,
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: surfaceAlt,
                    border: `1px solid ${borderCol}`,
                    fontFamily: mono,
                    fontSize: '0.62rem',
                    lineHeight: 1.05,
                    color: emerald,
                    overflow: 'auto',
                    maxHeight: 170,
                  }}
                >
                  {synthesis.braille}
                </Box>

                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: sky, display: 'block', mb: 0.5 }}>
                  AUTO-FIT 200MM BED G-CODE PREVIEW
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.2,
                    borderRadius: 1.5,
                    bgcolor: surfaceAlt,
                    border: `1px solid ${borderCol}`,
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    lineHeight: 1.3,
                    color: inkPrimary,
                    overflow: 'auto',
                    maxHeight: 150,
                  }}
                >
                  {synthesis.gcode.split('\n').slice(0, 32).join('\n')}
                </Box>
              </>
            )}

            {/* Measured 2-Opt TSP Telemetry Card (WCAG AA compliant in Light & Dark) */}
            <Paper
              sx={{
                p: 2,
                mt: 2.5,
                bgcolor: surfaceAlt,
                border: `1px solid ${borderCol}`,
                borderRadius: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: inkMuted, textTransform: 'uppercase' }}>
                  2-Opt TSP Toolpath Telemetry
                </Typography>
                <Button
                  size="small"
                  variant={useTsp ? 'contained' : 'outlined'}
                  onClick={() => setUseTsp((v) => !v)}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    minHeight: 44,
                    bgcolor: useTsp ? emerald : 'transparent',
                    color: useTsp ? emeraldInk : emerald,
                    borderColor: emerald,
                  }}
                >
                  {useTsp ? '2-Opt TSP: ACTIVE' : 'Optimize 2-Opt TSP'}
                </Button>
              </Stack>
              <Grid container spacing={1.2}>
                <Grid xs={6}>
                  <Typography variant="caption" sx={{ color: inkMuted, fontWeight: 700 }}>Segments</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: sky }}>
                    {synthesis.geometry.stats.segments.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" sx={{ color: inkMuted, fontWeight: 700 }}>Draw Path</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: emerald }}>
                    {synthesis.geometry.stats.drawDistance} mm
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" sx={{ color: inkMuted, fontWeight: 700 }}>Air Travel (Before → After)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: gold }}>
                    {synthesis.tsp.initialAirTravel} → {useTsp ? synthesis.tsp.optimizedAirTravel : synthesis.tsp.initialAirTravel} mm
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" sx={{ color: inkMuted, fontWeight: 700 }}>Measured Savings</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: mono, color: emerald }}>
                    {synthesis.tsp.savedMm} mm ({synthesis.tsp.reductionPercent}%)
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Grid>

        {/* Right Column: Live Vector SVG Stage & Exports */}
        <Grid xs={12} lg={7}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: surface,
              border: `1px solid ${borderCol}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold }}>
                Interactive Vector Stage
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadSvg}
                  sx={{ bgcolor: emerald, color: emeraldInk, fontWeight: 800, fontSize: '0.76rem', minHeight: 44 }}
                >
                  Download SVG
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PrecisionManufacturingIcon />}
                  onClick={handleDownloadGCode}
                  sx={{ borderColor: gold, color: gold, bgcolor: goldBg, fontWeight: 800, fontSize: '0.76rem', minHeight: 44 }}
                >
                  Export G-Code
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                width: '100%',
                height: 430,
                bgcolor: isDark ? '#05060A' : '#FAF8F3',
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <svg
                viewBox={synthesis.geometry.viewBox}
                role="img"
                aria-label={`Vector geometry stage showing ${synthesis.activeTitle}`}
                style={{ width: '100%', height: '100%', maxHeight: '430px' }}
              >
                {airOverlayPathD && (
                  <path
                    d={airOverlayPathD}
                    fill="none"
                    stroke={amber}
                    strokeWidth="1.0"
                    strokeDasharray="4 4"
                    strokeOpacity="0.72"
                  />
                )}
                <path
                  d={synthesis.geometry.pathD}
                  fill="none"
                  stroke={isDark ? '#FACC15' : '#047857'}
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  bgcolor: isDark ? 'rgba(8,8,11,0.88)' : 'rgba(255,255,255,0.94)',
                  border: `1px solid ${borderCol}`,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 1,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: inkPrimary,
                }}
              >
                {synthesis.activeTitle} · {useTsp ? '2-Opt TSP' : 'Raw Order'}
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(synthesis.braille, 'braille')}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  minHeight: 44,
                  color: copiedKey === 'braille' ? emerald : inkPrimary,
                  borderColor: borderCol,
                }}
              >
                {copiedKey === 'braille' ? 'Copied Braille!' : 'Copy 2×4 Braille'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(synthesis.gcode, 'gcode')}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  minHeight: 44,
                  color: copiedKey === 'gcode' ? emerald : inkPrimary,
                  borderColor: borderCol,
                }}
              >
                {copiedKey === 'gcode' ? 'Copied G-Code!' : 'Copy G-Code'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
