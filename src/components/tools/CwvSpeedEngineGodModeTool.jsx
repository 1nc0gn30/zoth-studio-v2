import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  TextField,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BoltIcon from '@mui/icons-material/Bolt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckIcon from '@mui/icons-material/Check';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import {
  DEFAULT_SAMPLE_HTML,
  auditHtml,
  transformHtml,
  compareDiff,
  generateSpeculationRules,
  auditPerformanceBudget,
} from '../../utils/cwvSpeedEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function CwvSpeedEngineGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [htmlInput, setHtmlInput] = useState(DEFAULT_SAMPLE_HTML);
  const [device, setDevice] = useState('mobile');
  const [activeTab, setActiveTab] = useState(0);
  const [optDeferScripts, setOptDeferScripts] = useState(true);
  const [optHeroPriority, setOptHeroPriority] = useState(true);
  const [optImageDims, setOptImageDims] = useState(true);
  const [optFontSwap, setOptFontSwap] = useState(true);
  const [optPreconnect, setOptPreconnect] = useState(true);
  const [specAggressiveness, setSpecAggressiveness] = useState('balanced');
  const [diffCandidateOverride, setDiffCandidateOverride] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const gaugeCanvasRef = useRef(null);

  // Strict WCAG AA (>= 4.5:1) dual-theme tokens
  const tk = isDark
    ? {
        surface: '#0D0F16',
        subtle: '#131622',
        codeBg: '#090B12',
        codeText: '#E2E8F0',
        eyebrow: '#60A5FA',
        gold: '#E5C158',
        good: '#34D399',
        goodBg: 'rgba(16,185,129,0.16)',
        warn: '#FBBF24',
        warnBg: 'rgba(245,158,11,0.16)',
        poor: '#F87171',
        poorBg: 'rgba(239,68,68,0.16)',
        primaryBtnBg: '#10B981',
        primaryBtnFg: '#08080B',
      }
    : {
        surface: '#FFFFFF',
        subtle: '#F3EFE6',
        codeBg: '#F3EFE6',
        codeText: '#101828',
        eyebrow: '#0369A1',
        gold: '#7A5808',
        good: '#046C4E',
        goodBg: '#ECFDF5',
        warn: '#92400E',
        warnBg: '#FEF3C7',
        poor: '#B91C1C',
        poorBg: '#FEE2E2',
        primaryBtnBg: '#046C4E',
        primaryBtnFg: '#FFFFFF',
      };

  const analysis = useMemo(() => {
    const before = auditHtml(htmlInput, device);
    const { transformed, changes } = transformHtml(htmlInput, {
      optDeferScripts,
      optHeroPriority,
      optImageDims,
      optFontSwap,
      optPreconnect,
    });
    const after = auditHtml(transformed, device);
    const diffTarget = diffCandidateOverride.trim() ? diffCandidateOverride : transformed;
    const diff = compareDiff(htmlInput, diffTarget, device);
    const speculation = generateSpeculationRules(htmlInput, 'https://example.com', specAggressiveness);
    const budget = auditPerformanceBudget(htmlInput);
    return { before, after, transformed, changes, diff, speculation, budget };
  }, [
    htmlInput,
    device,
    optDeferScripts,
    optHeroPriority,
    optImageDims,
    optFontSwap,
    optPreconnect,
    specAggressiveness,
    diffCandidateOverride,
  ]);

  // Tachometer Canvas (theme-calibrated contrast)
  useEffect(() => {
    const canvas = gaugeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.66;
    const r = 68;

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(16,24,40,0.14)';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    const pct = analysis.after.score / 100;
    const endAngle = Math.PI * 0.8 + pct * Math.PI * 1.4;
    const arcColor = analysis.after.score >= 90 ? tk.good : analysis.after.score >= 50 ? tk.warn : tk.poor;
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.8, endAngle);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#F5F1E6' : '#101828';
    ctx.font = `800 30px ${mono}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${analysis.after.score}`, cx, cy - 4);

    ctx.fillStyle = arcColor;
    ctx.font = `700 9.5px ${mono}`;
    ctx.fillText('OPTIMIZED CWV SCORE', cx, cy + 16);
  }, [analysis.after.score, isDark, tk.good, tk.warn, tk.poor]);

  const copyText = (key, value) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const downloadFile = (content, filename, mime = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metricColor = (rating) =>
    rating === 'GOOD' ? tk.good : rating === 'NEEDS_IMPROVEMENT' ? tk.warn : tk.poor;
  const metricBg = (rating) =>
    rating === 'GOOD' ? tk.goodBg : rating === 'NEEDS_IMPROVEMENT' ? tk.warnBg : tk.poorBg;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Clean Open-Access Banner (Zero Paywall / License Scaffolding) */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: tk.goodBg,
          border: `1px solid ${tk.good}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<BoltIcon sx={{ color: `${tk.primaryBtnFg} !important`, fontSize: 16 }} />}
            label="100% FREE & OPEN ACCESS · v2.6.0"
            size="small"
            sx={{ bgcolor: tk.primaryBtnBg, color: tk.primaryBtnFg, fontWeight: 800, fontFamily: mono }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            Client-Side CWV Auditor, &lt;head&gt;-Scoped AST Transformer, Diff Comparator, Speculation Rules &amp; Budget Simulator
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={device}
          onChange={(_, val) => val && setDevice(val)}
          aria-label="CWV device simulation profile"
        >
          <ToggleButton value="mobile" sx={{ minHeight: 44, px: 2, fontFamily: mono, fontWeight: 700 }}>
            Mobile
          </ToggleButton>
          <ToggleButton value="desktop" sx={{ minHeight: 44, px: 2, fontFamily: mono, fontWeight: 700 }}>
            Desktop
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <SovereignEyebrow accent={tk.eyebrow} right="Autonomous Web">
        cwv-speed-engine
      </SovereignEyebrow>
      <SovereignBand
        seed="cwv-speed-engine"
        eyebrow="Autonomous Web"
        caption="CWV Speed Engine v2.6.0"
        label="CWV Speed Engine — Zoth sovereign visualisation"
      />

      {/* Top Telemetry Row */}
      <Grid container spacing={2.5}>
        <Grid xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: tk.surface,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <canvas ref={gaugeCanvasRef} width={220} height={135} style={{ display: 'block' }} aria-label="Optimized CWV speed score gauge" />
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, fontWeight: 700 }}>
              Baseline {analysis.before.score}/100 → Optimized {analysis.after.score}/100 ({device})
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {[
              { key: 'lcp', label: 'LCP (Largest Contentful Paint)' },
              { key: 'cls', label: 'CLS (Cumulative Layout Shift)' },
              { key: 'inp', label: 'INP (Interaction to Next Paint)' },
            ].map(({ key, label }) => {
              const beforeM = analysis.before.metrics[key];
              const afterM = analysis.after.metrics[key];
              return (
                <Grid xs={12} sm={4} key={key}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: tk.surface,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      {label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: mono, fontWeight: 900, color: metricColor(afterM.rating), my: 0.5 }}>
                      {afterM.value}{afterM.unit}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', mb: 1 }}>
                      Raw: <del>{beforeM.value}{beforeM.unit}</del> ({afterM.target})
                    </Typography>
                    <Chip
                      label={afterM.rating.replace('_', ' ')}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        fontFamily: mono,
                        fontWeight: 800,
                        bgcolor: metricBg(afterM.rating),
                        color: metricColor(afterM.rating),
                        border: `1px solid ${metricColor(afterM.rating)}`,
                      }}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      {/* Main Two-Column Workbench */}
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, bgcolor: tk.surface }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                1. Raw HTML Document Input
              </Typography>
              <Chip
                label={`${analysis.before.issues.length} Bottleneck(s) Detected`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  bgcolor: analysis.before.issues.length > 0 ? tk.warnBg : tk.goodBg,
                  color: analysis.before.issues.length > 0 ? tk.warn : tk.good,
                  border: `1px solid ${analysis.before.issues.length > 0 ? tk.warn : tk.good}`,
                }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Raw HTML Document Input"
              inputProps={{ 'aria-label': 'Raw HTML document input for CWV audit and transformation' }}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.55 },
              }}
            />
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: tk.gold, display: 'block', mb: 1 }}>
              CLIENT AST TRANSFORMER PASSES:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <FormControlLabel
                sx={{ minHeight: 44 }}
                control={<Switch checked={optDeferScripts} onChange={(e) => setOptDeferScripts(e.target.checked)} inputProps={{ 'aria-label': 'Defer render-blocking scripts in head' }} />}
                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Defer &lt;head&gt; JS</Typography>}
              />
              <FormControlLabel
                sx={{ minHeight: 44 }}
                control={<Switch checked={optHeroPriority} onChange={(e) => setOptHeroPriority(e.target.checked)} inputProps={{ 'aria-label': 'Prioritize hero LCP image' }} />}
                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Hero fetchpriority</Typography>}
              />
              <FormControlLabel
                sx={{ minHeight: 44 }}
                control={<Switch checked={optImageDims} onChange={(e) => setOptImageDims(e.target.checked)} inputProps={{ 'aria-label': 'Inject explicit image dimensions' }} />}
                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>CLS Dimensions</Typography>}
              />
              <FormControlLabel
                sx={{ minHeight: 44 }}
                control={<Switch checked={optFontSwap} onChange={(e) => setOptFontSwap(e.target.checked)} inputProps={{ 'aria-label': 'Append font display swap' }} />}
                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Font-Display Swap</Typography>}
              />
              <FormControlLabel
                sx={{ minHeight: 44 }}
                control={<Switch checked={optPreconnect} onChange={(e) => setOptPreconnect(e.target.checked)} inputProps={{ 'aria-label': 'Inject origin preconnect hints' }} />}
                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Origin Preconnect</Typography>}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: '100%',
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: tk.surface,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2, minHeight: 44 }}
            >
              <Tab label={`Diagnostics (${analysis.before.issues.length})`} sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 44 }} />
              <Tab label="Transformed HTML" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 44 }} />
              <Tab label="Diff" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 44 }} />
              <Tab label="Speculation" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 44 }} />
              <Tab label="Budget / LoAF" sx={{ fontSize: '0.76rem', fontWeight: 800, minHeight: 44 }} />
            </Tabs>

            {/* Tab 0: Diagnostics */}
            {activeTab === 0 && (
              <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                {analysis.before.issues.length === 0 ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: tk.goodBg, border: `1px solid ${tk.good}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: tk.good }}>
                      All Core Web Vitals AST checks passed.
                    </Typography>
                  </Box>
                ) : (
                  analysis.before.issues.map((iss) => (
                    <Box
                      key={iss.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: tk.subtle,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                          {iss.title}
                        </Typography>
                        <Chip
                          label={iss.metric}
                          size="small"
                          sx={{ height: 20, fontSize: '0.64rem', fontFamily: mono, fontWeight: 800 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        <AutoFixHighIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom', color: tk.good }} />
                        {iss.fix}
                      </Typography>
                    </Box>
                  ))
                )}
                <Button
                  variant="contained"
                  onClick={() => setActiveTab(1)}
                  sx={{
                    mt: 'auto',
                    minHeight: 44,
                    bgcolor: tk.primaryBtnBg,
                    color: tk.primaryBtnFg,
                    fontWeight: 800,
                  }}
                >
                  View Transformed HTML ({analysis.after.score}/100 Score) →
                </Button>
              </Stack>
            )}

            {/* Tab 1: Transformed HTML (Light-mode parchment, Dark-mode obsidian) */}
            {activeTab === 1 && (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: tk.codeBg,
                    color: tk.codeText,
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    overflowX: 'auto',
                    maxHeight: 340,
                    flexGrow: 1,
                  }}
                >
                  {analysis.transformed}
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={copiedKey === 'html' ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={() => copyText('html', analysis.transformed)}
                    sx={{ minHeight: 44, fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}
                  >
                    {copiedKey === 'html' ? 'Copied Optimized HTML' : 'Copy Transformed HTML'}
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadFile(analysis.transformed, 'cwv-optimized-index.html', 'text/html;charset=utf-8')}
                    sx={{ minHeight: 44, bgcolor: tk.primaryBtnBg, color: tk.primaryBtnFg, fontFamily: mono, fontWeight: 800, fontSize: '0.75rem' }}
                  >
                    Export Optimized HTML
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Tab 2: Performance Diff */}
            {activeTab === 2 && (
              <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Candidate HTML Override (leave empty to compare against Transformed HTML)"
                  inputProps={{ 'aria-label': 'Candidate HTML for performance diff comparison' }}
                  value={diffCandidateOverride}
                  onChange={(e) => setDiffCandidateOverride(e.target.value)}
                  placeholder="Paste candidate HTML (or identical HTML to verify 0 delta)..."
                  sx={{ '& .MuiInputBase-input': { fontFamily: mono, fontSize: '0.74rem' } }}
                />
                <Box sx={{ p: 1.8, borderRadius: 2, bgcolor: tk.subtle, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 900, color: analysis.diff.scoreDelta >= 0 ? tk.good : tk.poor }}>
                    {analysis.diff.scoreDelta > 0 ? `+${analysis.diff.scoreDelta}` : analysis.diff.scoreDelta} pts
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {analysis.diff.summary}
                  </Typography>
                  <Grid container spacing={1}>
                    {['lcp', 'cls', 'inp', 'fcp', 'ttfb'].map((k) => {
                      const d = analysis.diff.metricDeltas[k];
                      return (
                        <Grid xs={6} sm={4} key={k}>
                          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: tk.surface, border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, display: 'block' }}>
                              {k.toUpperCase()}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: d.delta < 0 ? tk.good : d.delta > 0 ? tk.poor : 'text.primary' }}>
                              {d.delta > 0 ? `+${d.delta}` : d.delta}{d.unit}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Stack>
            )}

            {/* Tab 3: Speculation Rules */}
            {activeTab === 3 && (
              <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={specAggressiveness}
                  onChange={(_, val) => val && setSpecAggressiveness(val)}
                  aria-label="Speculation rules aggressiveness"
                >
                  <ToggleButton value="conservative" sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700 }}>Conservative</ToggleButton>
                  <ToggleButton value="balanced" sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700 }}>Balanced</ToggleButton>
                  <ToggleButton value="aggressive" sx={{ minHeight: 44, fontFamily: mono, fontWeight: 700 }}>Aggressive</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
                  Prerender: {analysis.speculation.prerender.join(', ') || 'none'} · Guarded/Excluded: {analysis.speculation.excluded.join(', ') || 'none'}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: tk.codeBg,
                    color: tk.codeText,
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    overflowX: 'auto',
                  }}
                >
                  {analysis.speculation.scriptTag}
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadFile(analysis.speculation.scriptTag, 'speculation-rules.html', 'text/html;charset=utf-8')}
                  sx={{ minHeight: 44, fontFamily: mono, fontWeight: 800 }}
                >
                  Download speculation-rules.html
                </Button>
              </Stack>
            )}

            {/* Tab 4: Performance Budget & LoAF */}
            {activeTab === 4 && (
              <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                <Grid container spacing={1}>
                  {analysis.budget.checks.map((c) => (
                    <Grid xs={6} sm={4} key={c.resourceType}>
                      <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: tk.subtle, border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                          {c.resourceType}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, color: c.status === 'PASS' ? tk.good : tk.poor }}>
                          {c.actualKb} / {c.budgetKb} KB ({c.status})
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: tk.gold }}>
                  LoAF SYNCHRONOUS SCRIPT RISKS: {analysis.budget.loafRisks.length}
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: tk.codeBg,
                    color: tk.codeText,
                    border: `1px solid ${theme.palette.divider}`,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(analysis.budget.lighthouseBudgetJson, null, 2)}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() =>
                    downloadFile(
                      JSON.stringify(analysis.budget.lighthouseBudgetJson, null, 2),
                      'budget.json',
                      'application/json;charset=utf-8',
                    )
                  }
                  sx={{ minHeight: 44, bgcolor: tk.primaryBtnBg, color: tk.primaryBtnFg, fontFamily: mono, fontWeight: 800 }}
                >
                  Export Lighthouse budget.json
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
