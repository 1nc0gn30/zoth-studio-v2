import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Alert, InputAdornment, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CodeIcon from '@mui/icons-material/Code';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import {
  CURATED_PRESETS,
  parseCron,
  humanizeCron,
  getNextRuns,
  calculateHeatmap,
  toggleHourInExpression,
  transpileCron,
  buildExportBundle,
  auditDst,
  auditFleet,
} from '../../utils/cronRhythmEngine.js';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const DEFAULT_FLEET_JSON = JSON.stringify(
  {
    db_backup: '0 0 * * *',
    nightly_analytics: '0 0 * * *',
    billing_reconciliation: '0 0 * * *',
    cache_eviction: '0 0 * * *',
  },
  null,
  2
);

const DIALECTS = [
  { id: 'systemd', label: 'Systemd Timer' },
  { id: 'kubernetes', label: 'Kubernetes' },
  { id: 'github', label: 'GitHub Actions' },
  { id: 'eventbridge', label: 'AWS EventBridge' },
  { id: 'quartz', label: 'Quartz 7-Field' },
  { id: 'unix', label: 'UNIX Crontab' },
];

export function CronRhythmGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast Dual-Theme Tokens (WCAG >= 4.5:1 in both Obsidian Dark & Editorial Ivory Light)
  const gold = isDark ? '#D4AF37' : '#7A5808';
  const goldSoft = isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(154, 111, 11, 0.11)';
  const goldBorder = isDark ? 'rgba(212, 175, 55, 0.42)' : 'rgba(122, 88, 8, 0.38)';
  const emerald = isDark ? '#34D399' : '#047857';
  const emeraldSoft = isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(4, 120, 87, 0.10)';
  const cyan = isDark ? '#38BDF8' : '#0369A1';
  const cyanSoft = isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(3, 105, 161, 0.10)';
  const crimson = isDark ? '#FB7185' : '#BE123C';
  const crimsonSoft = isDark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(190, 18, 60, 0.10)';
  const surfaceBg = isDark ? '#10121A' : '#FFFFFF';
  const subtleBg = isDark ? '#08080B' : '#F3EFE6';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.13)';
  const textPrimary = isDark ? '#F8FAFC' : '#101828';
  const textSecondary = isDark ? '#CBD5E1' : '#475467';

  // State
  const [cronExpression, setCronExpression] = useState('*/15 * * * *');
  const [tzMode, setTzMode] = useState('UTC');
  const [activeTab, setActiveTab] = useState(0);
  const [dialect, setDialect] = useState('systemd');
  const [copiedKey, setCopiedKey] = useState(null);
  const [countdownText, setCountdownText] = useState('');
  const [dstTz, setDstTz] = useState('America/New_York');
  const [dstYear, setDstYear] = useState(2026);
  const [fleetText, setFleetText] = useState(DEFAULT_FLEET_JSON);

  const canvasRef = useRef(null);

  const ast = useMemo(() => parseCron(cronExpression), [cronExpression]);
  const humanSummary = useMemo(() => humanizeCron(ast), [ast]);
  const nextTriggers = useMemo(
    () => (ast.isValid && !ast.isReboot ? getNextRuns(ast, { count: 8, timezone: tzMode }) : []),
    [ast, tzMode]
  );
  const activeHours = useMemo(() => (ast.isValid && !ast.isReboot ? ast.fields.hour : []), [ast]);
  const heatmap = useMemo(() => calculateHeatmap(ast), [ast]);
  const transpiled = useMemo(() => transpileCron(ast, dialect), [ast, dialect]);
  const dstReport = useMemo(() => auditDst(cronExpression, dstTz, dstYear), [cronExpression, dstTz, dstYear]);
  const fleetReport = useMemo(() => {
    try {
      const parsed = JSON.parse(fleetText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { error: 'Fleet input must be a JSON object.' };
      return auditFleet(parsed);
    } catch (e) {
      return { error: `Invalid JSON: ${e.message}` };
    }
  }, [fleetText]);

  // Live countdown to next trigger
  useEffect(() => {
    if (!ast.isValid) {
      setCountdownText('Invalid syntax');
      return undefined;
    }
    if (ast.isReboot) {
      setCountdownText('On host startup (@reboot)');
      return undefined;
    }
    if (nextTriggers.length === 0) {
      setCountdownText('No runs in search window');
      return undefined;
    }

    const update = () => {
      const diff = nextTriggers[0].getTime() - Date.now();
      if (diff <= 0) {
        setCountdownText('Executing now');
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdownText(`${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextTriggers, ast]);

  // 24-Hour Radial Timing Orbit Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 22;

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(16,24,40,0.12)';
    ctx.lineWidth = 14;
    ctx.stroke();

    for (let hr = 0; hr < 24; hr++) {
      const angle = (hr / 24) * Math.PI * 2 - Math.PI / 2;
      const isActive = activeHours.includes(hr);

      ctx.beginPath();
      ctx.arc(cx, cy, r, angle - 0.08, angle + 0.08);
      ctx.strokeStyle = isActive ? gold : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.06)';
      ctx.lineWidth = isActive ? 16 : 10;
      ctx.stroke();

      const tickInner = r - (isActive ? 16 : 10);
      const tickOuter = r + 12;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * tickInner, cy + Math.sin(angle) * tickInner);
      ctx.lineTo(cx + Math.cos(angle) * tickOuter, cy + Math.sin(angle) * tickOuter);
      ctx.strokeStyle = isActive ? gold : isDark ? 'rgba(255,255,255,0.22)' : 'rgba(16,24,40,0.24)';
      ctx.lineWidth = hr % 6 === 0 ? 2 : 1;
      ctx.stroke();

      if (hr % 6 === 0) {
        const textR = r - 28;
        ctx.fillStyle = isActive ? gold : textSecondary;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${hr}h`, cx + Math.cos(angle) * textR, cy + Math.sin(angle) * textR);
      }
    }

    const now = new Date();
    const curHr = tzMode === 'UTC' ? now.getUTCHours() : now.getHours();
    const curMin = tzMode === 'UTC' ? now.getUTCMinutes() : now.getMinutes();
    const currentAngle = ((curHr * 60 + curMin) / 1440) * Math.PI * 2 - Math.PI / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(currentAngle) * (r - 10), cy + Math.sin(currentAngle) * (r - 10));
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = cyan;
    ctx.fill();
  }, [activeHours, isDark, gold, cyan, textSecondary, tzMode, activeTab]);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadBundle = () => {
    const bundle = buildExportBundle(cronExpression, { name: 'cron-rhythm-job', tz: tzMode });
    if (!bundle.isValid) return;
    const blob = new Blob([bundle.combinedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cron-rhythm-bundle.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box data-testid="cron-rhythm-godmode-workstation" sx={{ mt: 1 }}>
      {/* Main Interactive Expression Editor */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          bgcolor: surfaceBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 2,
        }}
      >
        <SovereignEyebrow accent={gold} right="Automation · v2.6.0">
          cron-rhythm-studio
        </SovereignEyebrow>
        <SovereignBand
          seed="cron-rhythm-studio"
          eyebrow="Automation"
          caption="CronRhythm Studio"
          label="CronRhythm Studio — POSIX/Quartz AST Parser & Multi-Dialect Transpiler"
        />

        <Grid container spacing={2} alignItems="stretch">
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="Cron Expression (5/6/7-Field or @macro)"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              error={!ast.isValid}
              helperText={ast.isValid ? `Valid ${ast.isReboot ? '@reboot macro' : `${ast.fieldCount}-field AST`} · POSIX DOM/DOW OR` : ast.error}
              placeholder="*/15 * * * *"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon sx={{ color: cyan }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: mono, fontSize: '1.05rem', fontWeight: 800, minHeight: 48 },
              }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                height: '100%',
                bgcolor: subtleBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontWeight: 700, display: 'block' }}>
                  NEXT TRIGGER COUNTDOWN ({tzMode}):
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 800, color: ast.isValid ? emerald : crimson, mt: 0.2 }}>
                  {countdownText}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setTzMode((m) => (m === 'UTC' ? 'Local' : 'UTC'))}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  color: cyan,
                  borderColor: cyan,
                  textTransform: 'none',
                }}
              >
                TZ Mode: {tzMode}
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Natural Language Interpretation (Theme-aware Parchment in Light Mode, Obsidian in Dark Mode) */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 2,
            bgcolor: ast.isValid ? subtleBg : crimsonSoft,
            border: `1px solid ${ast.isValid ? goldBorder : crimson}`,
            borderRadius: 1.5,
            color: ast.isValid ? textPrimary : crimson,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <CalendarMonthIcon sx={{ color: ast.isValid ? gold : crimson, fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: ast.isValid ? gold : crimson }}>
              NATURAL LANGUAGE INTERPRETATION
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ fontFamily: mono, fontWeight: 700, color: ast.isValid ? textPrimary : crimson, overflowWrap: 'anywhere' }}>
            {humanSummary}
          </Typography>
        </Paper>

        {/* Curated Production Presets (minHeight: 44 for mobile tap targets) */}
        <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 2, mb: 1, fontFamily: mono, fontWeight: 700 }}>
          CURATED PRODUCTION PRESETS:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {CURATED_PRESETS.map((p) => {
            const active = cronExpression.trim() === p.cron;
            return (
              <Chip
                key={p.id}
                label={p.label.includes(p.cron) ? p.label : `${p.label} (${p.cron})`}
                clickable
                onClick={() => setCronExpression(p.cron)}
                sx={{
                  minHeight: 44,
                  px: 0.5,
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  bgcolor: active ? goldSoft : subtleBg,
                  color: active ? gold : textPrimary,
                  border: `1px solid ${active ? goldBorder : cardBorder}`,
                  fontWeight: active ? 800 : 600,
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* 4-Tab Sovereign Operations Bar */}
      <Paper elevation={0} sx={{ mb: 2.5, bgcolor: surfaceBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="CronRhythm Studio Workbench Tabs"
          sx={{
            borderBottom: `1px solid ${cardBorder}`,
            '& .MuiTab-root': {
              minHeight: 48,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              color: textSecondary,
            },
            '& .Mui-selected': { color: `${gold} !important` },
            '& .MuiTabs-indicator': { bgcolor: gold },
          }}
        >
          <Tab label="Schedule & Orbit" />
          <Tab label="Multi-Dialect Transpiler" />
          <Tab label="DST & Fleet Audit" />
          <Tab label="24x7 Interactive Heatmap" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {/* TAB 0: Schedule & Orbit */}
          {activeTab === 0 && (
            <Grid container spacing={2.5}>
              <Grid xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: subtleBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1.5 }}>
                    24-HOUR RADIAL TIMING ORBIT ({tzMode})
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                    <canvas
                      ref={canvasRef}
                      width={260}
                      height={260}
                      style={{ width: '260px', height: '260px', maxWidth: '100%', display: 'block' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block', mt: 1 }}>
                    Active Hours:{' '}
                    <strong style={{ color: textPrimary }}>
                      {activeHours.length === 24
                        ? 'All 24 Hours'
                        : activeHours.length > 0
                          ? activeHours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ')
                          : 'None'}
                    </strong>
                  </Typography>
                </Paper>
              </Grid>

              <Grid xs={12} md={7}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: emerald }}>
                    UPCOMING CHRONOLOGICAL EXECUTIONS
                  </Typography>
                  <Chip
                    size="small"
                    label={`LIVE ${tzMode} SYNC`}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', bgcolor: emeraldSoft, color: emerald, fontWeight: 800 }}
                  />
                </Stack>

                <TableContainer sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5, maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: subtleBg, color: gold }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: subtleBg, color: textPrimary }}>
                          Local Display
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: subtleBg, color: textPrimary }}>
                          ISO-8601 UTC
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {nextTriggers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ textAlign: 'center', py: 3, color: textSecondary, fontFamily: mono }}>
                            {ast.isReboot ? '@reboot runs once on system boot.' : 'No upcoming executions computed.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        nextTriggers.map((t, idx) => (
                          <TableRow key={t.toISOString() + idx} hover>
                            <TableCell sx={{ fontFamily: mono, fontSize: '0.76rem', color: gold, fontWeight: 800 }}>
                              #{idx + 1}
                            </TableCell>
                            <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: idx === 0 ? 800 : 500, color: idx === 0 ? emerald : textPrimary }}>
                              {t.toLocaleString()} {idx === 0 ? '(NEXT)' : ''}
                            </TableCell>
                            <TableCell sx={{ fontFamily: mono, fontSize: '0.74rem', color: textSecondary }}>
                              {t.toISOString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(transpileCron(ast, 'unix').syntax, 'crontab')}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: cyan, borderColor: cyan }}
                  >
                    {copiedKey === 'crontab' ? 'Copied Crontab' : 'Copy Crontab'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CodeIcon />}
                    onClick={() => handleCopy(transpileCron(ast, 'systemd').syntax, 'systemd')}
                    sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: gold, borderColor: goldBorder }}
                  >
                    {copiedKey === 'systemd' ? 'Copied Systemd' : 'Copy Systemd Timer'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadBundle}
                    disabled={!ast.isValid}
                    sx={{
                      minHeight: 44,
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      bgcolor: gold,
                      color: isDark ? '#08080B' : '#FFFFFF',
                      '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4306' },
                    }}
                  >
                    Download .timer/.service/.crontab
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          )}

          {/* TAB 1: Multi-Dialect Transpiler */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {DIALECTS.map((d) => {
                  const active = dialect === d.id;
                  return (
                    <Button
                      key={d.id}
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setDialect(d.id)}
                      sx={{
                        minHeight: 44,
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: active ? gold : 'transparent',
                        color: active ? (isDark ? '#08080B' : '#FFFFFF') : textPrimary,
                        borderColor: active ? gold : cardBorder,
                      }}
                    >
                      {d.label}
                    </Button>
                  );
                })}
              </Box>

              <Typography variant="body2" sx={{ color: textSecondary, mb: 1.5 }}>
                {transpiled.desc}
              </Typography>

              {transpiled.warnings && transpiled.warnings.length > 0 && (
                <Alert
                  severity="warning"
                  icon={<WarningAmberIcon />}
                  sx={{ mb: 1.5, fontFamily: mono, fontSize: '0.76rem' }}
                >
                  {transpiled.warnings.join(' ')}
                </Alert>
              )}

              <Paper
                elevation={0}
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  bgcolor: subtleBg,
                  color: textPrimary,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 1.5,
                  fontFamily: mono,
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  overflowX: 'auto',
                }}
              >
                {transpiled.syntax}
              </Paper>

              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(transpiled.syntax, 'dialect')}
                  sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: cyan, borderColor: cyan }}
                >
                  {copiedKey === 'dialect' ? 'Copied Spec' : 'Copy Spec'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadBundle}
                  disabled={!ast.isValid}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    bgcolor: gold,
                    color: isDark ? '#08080B' : '#FFFFFF',
                  }}
                >
                  Download Bundle
                </Button>
              </Stack>
            </Box>
          )}

          {/* TAB 2: DST & Fleet Audit */}
          {activeTab === 2 && (
            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: subtleBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold, mb: 1.5 }}>
                    IANA DST ANOMALY AUDITOR
                  </Typography>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 190 }}>
                      <InputLabel id="dst-tz-label">Timezone</InputLabel>
                      <Select
                        labelId="dst-tz-label"
                        label="Timezone"
                        value={dstTz}
                        onChange={(e) => setDstTz(e.target.value)}
                        sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.8rem' }}
                      >
                        <MenuItem value="America/New_York">America/New_York</MenuItem>
                        <MenuItem value="America/Chicago">America/Chicago</MenuItem>
                        <MenuItem value="America/Los_Angeles">America/Los_Angeles</MenuItem>
                        <MenuItem value="Europe/London">Europe/London</MenuItem>
                        <MenuItem value="Europe/Berlin">Europe/Berlin</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Year"
                      type="number"
                      value={dstYear}
                      onChange={(e) => setDstYear(Number(e.target.value) || 2026)}
                      sx={{ width: 100 }}
                      InputProps={{ sx: { minHeight: 44, fontFamily: mono } }}
                    />
                  </Stack>

                  <Alert
                    severity={dstReport.anomalies.length === 0 ? 'success' : 'warning'}
                    sx={{ mb: 1.5, fontFamily: mono, fontSize: '0.76rem' }}
                  >
                    {dstReport.anomalies.length === 0
                      ? `SAFE: No DST clock-shift skips or duplicates in ${dstTz} (${dstYear}).`
                      : `RISK (${dstReport.risk_level}): ${dstReport.anomalies.length} anomaly(ies) detected. Suggested safe schedule: ${dstReport.safe_expression}`}
                  </Alert>

                  {dstReport.anomalies.map((a, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block', fontFamily: mono, color: textPrimary, mb: 0.75 }}>
                      • <strong>{a.type}</strong> ({a.date}): {a.detail}
                    </Typography>
                  ))}

                  {dstReport.safe_expression !== cronExpression && (
                    <Button
                      variant="outlined"
                      onClick={() => setCronExpression(dstReport.safe_expression)}
                      sx={{ minHeight: 44, mt: 1, fontFamily: mono, fontWeight: 700, color: emerald, borderColor: emerald }}
                    >
                      Apply Safe Schedule ({dstReport.safe_expression})
                    </Button>
                  )}
                </Paper>
              </Grid>

              <Grid xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: subtleBg, border: `1px solid ${cardBorder}`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 1.5 }}>
                    FLEET THUNDERING-HERD OPTIMIZER
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={5}
                    label="Fleet Jobs (JSON)"
                    value={fleetText}
                    onChange={(e) => setFleetText(e.target.value)}
                    InputProps={{ sx: { fontFamily: mono, fontSize: '0.78rem' } }}
                    sx={{ mb: 1.5 }}
                  />
                  {fleetReport.error ? (
                    <Alert severity="error" sx={{ fontFamily: mono, fontSize: '0.76rem' }}>{fleetReport.error}</Alert>
                  ) : (
                    <Box>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: textPrimary, display: 'block', mb: 1 }}>
                        Jobs: {fleetReport.job_count} · Peak concurrency: {fleetReport.peak_concurrency} · Collision buckets: {fleetReport.collision_count}
                      </Typography>
                      <Paper
                        elevation={0}
                        component="pre"
                        sx={{
                          p: 1.5,
                          m: 0,
                          bgcolor: surfaceBg,
                          border: `1px solid ${cardBorder}`,
                          borderRadius: 1,
                          fontFamily: mono,
                          fontSize: '0.74rem',
                          color: textPrimary,
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {JSON.stringify(fleetReport.rebalanced_jobs, null, 2)}
                      </Paper>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* TAB 3: 24x7 Interactive Heatmap */}
          {activeTab === 3 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  Click any cell to toggle that hour inside the cron expression.
                </Typography>
                <Chip
                  label={`${heatmap.total_runs_per_week} runs/week · Peak ${String(heatmap.peak_hour).padStart(2, '0')}:00`}
                  sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', bgcolor: goldSoft, color: gold }}
                />
              </Stack>

              <Box sx={{ width: '100%', overflowX: 'auto', pb: 1 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '42px repeat(24, minmax(16px, 1fr))',
                    gap: '4px',
                    minWidth: 460,
                    fontFamily: mono,
                    fontSize: '0.68rem',
                  }}
                >
                  <Box />
                  {Array.from({ length: 24 }, (_, h) => (
                    <Box key={h} sx={{ textAlign: 'center', color: textSecondary }}>
                      {h % 3 === 0 ? h : ''}
                    </Box>
                  ))}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
                    <React.Fragment key={day}>
                      <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: textPrimary }}>{day}</Box>
                      {Array.from({ length: 24 }, (_, h) => {
                        const cell = heatmap.matrix[dIdx]?.[h];
                        const count = cell?.execution_count || 0;
                        const bg =
                          count > 15
                            ? gold
                            : count > 8
                              ? (isDark ? 'rgba(212,175,55,0.7)' : 'rgba(122,88,8,0.72)')
                              : count > 2
                                ? cyan
                                : count > 0
                                  ? (isDark ? 'rgba(56,189,248,0.45)' : 'rgba(3,105,161,0.38)')
                                  : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.08)');
                        return (
                          <Box
                            key={`${day}-${h}`}
                            component="button"
                            type="button"
                            onClick={() => setCronExpression((prev) => toggleHourInExpression(prev, h))}
                            title={`${day} ${String(h).padStart(2, '0')}:00 — ${count} runs/hr (click to toggle hour ${h})`}
                            aria-label={`Toggle hour ${h} on ${day}`}
                            sx={{
                              aspectRatio: '1',
                              borderRadius: '4px',
                              bgcolor: bg,
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              p: 0,
                              '&:hover': { borderColor: gold },
                            }}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default CronRhythmGodModeTool;
