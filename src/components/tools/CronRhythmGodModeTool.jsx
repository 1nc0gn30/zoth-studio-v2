import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Divider, Card, CardContent, LinearProgress, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyIcon from '@mui/icons-material/VpnKey';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// Curated Presets
// ---------------------------------------------------------------------------
const PRESETS = [
  { label: 'Every 5 Minutes', cron: '*/5 * * * *', desc: 'Continuous polling and high-frequency health checks' },
  { label: 'Hourly on the Hour', cron: '0 * * * *', desc: 'Standard hourly sync and metric aggregation' },
  { label: 'Daily at Midnight', cron: '0 0 * * *', desc: 'Nightly database vacuum and backup sealing' },
  { label: 'Business Hours (9-5 M-F)', cron: '0 9-17 * * 1-5', desc: 'Dispatches active notifications on workdays' },
  { label: 'Weekly on Sunday 03:00', cron: '0 3 * * 0', desc: 'Deep maintenance and cold log rotation' },
  { label: 'Monthly 1st at 00:00', cron: '0 0 1 * *', desc: 'Monthly invoicing and financial reconciliation' },
  { label: 'Twice Daily (08:00 & 20:00)', cron: '0 8,20 * * *', desc: 'Morning and evening operational synchronization' },
  { label: 'Every 15 Mins M-F', cron: '*/15 9-17 * * 1-5', desc: 'Market trading hours execution interval' }
];

// ---------------------------------------------------------------------------
// Real Zero-Dependency Cron Parser & Field Matcher
// ---------------------------------------------------------------------------
function parseField(fieldStr, minVal, maxVal) {
  const values = new Set();
  const parts = fieldStr.split(',');

  for (const part of parts) {
    if (part === '*') {
      for (let i = minVal; i <= maxVal; i++) values.add(i);
    } else if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10) || 1;
      let start = minVal;
      let end = maxVal;
      if (range !== '*') {
        if (range.includes('-')) {
          const [s, e] = range.split('-').map(Number);
          start = isNaN(s) ? minVal : s;
          end = isNaN(e) ? maxVal : e;
        } else {
          start = parseInt(range, 10) || minVal;
        }
      }
      for (let i = start; i <= end; i += step) {
        if (i >= minVal && i <= maxVal) values.add(i);
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= minVal && i <= maxVal) values.add(i);
        }
      }
    } else {
      const val = parseInt(part, 10);
      if (!isNaN(val) && val >= minVal && val <= maxVal) {
        values.add(val);
      }
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

// Translate cron expression to human-readable English
function describeCron(cronStr) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return 'Invalid cron format. Please provide 5 space-delimited fields (min hour day-of-month month day-of-week).';
  }

  const [min, hour, dom, mon, dow] = parts;

  let desc = 'Executes ';

  // Minute
  if (min === '*') desc += 'every minute';
  else if (min.startsWith('*/')) desc += `every ${min.replace('*/', '')} minutes`;
  else if (min === '0') desc += 'at minute 00';
  else desc += `at minute ${min}`;

  // Hour
  if (hour === '*') desc += ' past every hour';
  else if (hour.startsWith('*/')) desc += `, every ${hour.replace('*/', '')} hours`;
  else if (hour.includes('-')) desc += `, between ${hour.split('-')[0]}:00 and ${hour.split('-')[1]}:59`;
  else if (hour.includes(',')) desc += `, at hours ${hour}`;
  else desc += `, at ${hour.padStart(2, '0')}:00`;

  // Day of Month
  if (dom !== '*') {
    if (dom.startsWith('*/')) desc += `, every ${dom.replace('*/', '')} days`;
    else desc += `, on day ${dom} of the month`;
  }

  // Month
  if (mon !== '*') {
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (mon.startsWith('*/')) desc += `, every ${mon.replace('*/', '')} months`;
    else {
      const mNums = mon.split(',').map((n) => monthNames[parseInt(n, 10)] || n);
      desc += `, in ${mNums.join(', ')}`;
    }
  }

  // Day of Week
  if (dow !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dow.includes('-')) {
      const [s, e] = dow.split('-').map(Number);
      desc += `, ${days[s] || s} through ${days[e] || e}`;
    } else if (dow.includes(',')) {
      const dNames = dow.split(',').map((n) => days[parseInt(n, 10)] || n);
      desc += `, on ${dNames.join(', ')}`;
    } else {
      desc += `, only on ${days[parseInt(dow, 10)] || dow}`;
    }
  }

  return desc + '.';
}

// Calculate the next N trigger execution dates
function calculateNextTriggers(cronStr, count = 8) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minStr, hourStr, domStr, monStr, dowStr] = parts;
  const minutes = parseField(minStr, 0, 59);
  const hours = parseField(hourStr, 0, 23);
  const doms = parseField(domStr, 1, 31);
  const months = parseField(monStr, 1, 12);
  const dows = parseField(dowStr, 0, 6);

  if (minutes.length === 0 || hours.length === 0 || doms.length === 0 || months.length === 0 || dows.length === 0) {
    return [];
  }

  const triggers = [];
  const current = new Date();
  // Move current forward by 1 minute to calculate future executions
  let iter = new Date(current.getTime());
  iter.setSeconds(0, 0);
  iter.setMinutes(iter.getMinutes() + 1);

  // Maximum search horizon: 5 years or 100,000 minute iterations
  let loops = 0;
  while (triggers.length < count && loops < 150000) {
    loops++;
    const mon = iter.getMonth() + 1; // 1-12
    const dom = iter.getDate(); // 1-31
    const dow = iter.getDay(); // 0-6
    const hr = iter.getHours();
    const mn = iter.getMinutes();

    if (months.includes(mon) && doms.includes(dom) && dows.includes(dow) && hours.includes(hr) && minutes.includes(mn)) {
      triggers.push(new Date(iter.getTime()));
      // Advance by at least 1 minute
      iter.setMinutes(iter.getMinutes() + 1);
    } else {
      // Step optimization: if hour not in match, jump to next hour
      if (!hours.includes(hr)) {
        iter.setMinutes(0);
        iter.setHours(iter.getHours() + 1);
      } else {
        iter.setMinutes(iter.getMinutes() + 1);
      }
    }
  }

  return triggers;
}

export function CronRhythmGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Aesthetic Tokens
  const emerald = '#00FF9D';
  const emeraldSoft = 'rgba(0, 255, 157, 0.12)';
  const gold = '#D4AF37';
  const goldSoft = 'rgba(212, 175, 55, 0.14)';
  const crimson = '#FF3355';
  const crimsonSoft = 'rgba(255, 51, 85, 0.12)';
  const cyan = '#38BDF8';
  const cyanSoft = 'rgba(56, 189, 248, 0.12)';
  const voidDark = '#08080B';
  const surfaceDark = '#10121A';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  // Operational State
  const [cronExpression, setCronExpression] = useState('*/5 * * * *');
  const [nextTriggers, setNextTriggers] = useState([]);
  const [activeHours, setActiveHours] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isProLicensed, setIsProLicensed] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [countdownText, setCountdownText] = useState('');

  // Radial 24-Hour Sequencer Canvas
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('licensed') === 'true' || localStorage.getItem('zoth_studio_pro_license') === 'active') {
        setIsProLicensed(true);
      }
    }
  }, []);

  // Update schedule & active hours when expression changes
  useEffect(() => {
    try {
      const triggers = calculateNextTriggers(cronExpression, 8);
      setNextTriggers(triggers);

      const parts = cronExpression.trim().split(/\s+/);
      if (parts.length === 5) {
        const hrs = parseField(parts[1], 0, 23);
        setActiveHours(hrs);
      }
    } catch {
      setNextTriggers([]);
      setActiveHours([]);
    }
  }, [cronExpression]);

  // Live countdown to next trigger
  useEffect(() => {
    if (nextTriggers.length === 0) {
      setCountdownText('Awaiting valid schedule...');
      return;
    }

    const interval = setInterval(() => {
      const target = nextTriggers[0];
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownText('Executing now...');
        setNextTriggers(calculateNextTriggers(cronExpression, 8));
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextTriggers, cronExpression]);

  // ---------------------------------------------------------------------------
  // 24-Hour Radial Circular Clock Render
  // ---------------------------------------------------------------------------
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

    // Outer Track Ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // 24-Hour Hour Segments
    for (let hr = 0; hr < 24; hr++) {
      // Angle: 0 is top (-PI/2)
      const angle = (hr / 24) * Math.PI * 2 - Math.PI * 2 / 4;
      const isActive = activeHours.includes(hr);

      // Arc segment
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle - 0.08, angle + 0.08);
      ctx.strokeStyle = isActive ? gold : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
      ctx.lineWidth = isActive ? 16 : 10;
      ctx.stroke();

      // Tick mark
      const tickInner = r - (isActive ? 16 : 10);
      const tickOuter = r + 12;
      const tx1 = cx + Math.cos(angle) * tickInner;
      const ty1 = cy + Math.sin(angle) * tickInner;
      const tx2 = cx + Math.cos(angle) * tickOuter;
      const ty2 = cy + Math.sin(angle) * tickOuter;

      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.strokeStyle = isActive ? gold : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      ctx.lineWidth = hr % 6 === 0 ? 2 : 1;
      ctx.stroke();

      // Hour Numbers for 0, 6, 12, 18
      if (hr % 6 === 0) {
        const textR = r - 26;
        const lx = cx + Math.cos(angle) * textR;
        const ly = cy + Math.sin(angle) * textR;
        ctx.fillStyle = isActive ? gold : isDark ? '#94A3B8' : '#64748B';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${hr}h`, lx, ly);
      }
    }

    // Current Time Hand
    const now = new Date();
    const currentFraction = (now.getHours() * 60 + now.getMinutes()) / 1440;
    const currentAngle = currentFraction * Math.PI * 2 - Math.PI / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(currentAngle) * (r - 8), cy + Math.sin(currentAngle) * (r - 8));
    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = cyan;
    ctx.fill();
  }, [activeHours, isDark]);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleActivateLicense = () => {
    if (licenseKeyInput.trim().length > 6) {
      localStorage.setItem('zoth_studio_pro_license', 'active');
      setIsProLicensed(true);
      setShowPaywallModal(false);
    }
  };

  // Generate systemd timer calendar format
  const generateSystemdTimer = () => {
    return `[Unit]
Description=ZothOS Sovereign Task Rhythm Trigger
Wants=network-online.target

[Timer]
OnCalendar=*-*-* ${cronExpression.split(' ')[1] || '*'}:${cronExpression.split(' ')[0] || '*'}:00
Persistent=true

[Install]
WantedBy=timers.target`;
  };

  // Generate crontab entry
  const generateCrontab = () => {
    return `# Sovereign Scheduled Task Rhythm
${cronExpression} /usr/local/bin/zoth-agent-tick >> /var/log/zoth/rhythm.log 2>&1`;
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Monetization Funnel Banner */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(8,8,11,0.92) 100%)'
            : 'linear-gradient(135deg, #FFFDF0 0%, #FEF9E7 100%)',
          border: `1px solid ${gold}`,
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
              bgcolor: goldSoft,
              color: gold,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ScheduleIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold }}>
                CronRhythm Apex Task Orchestration Studio
              </Typography>
              <Chip
                size="small"
                label={isProLicensed ? '⭐ PRO ACTIVE' : 'FOUNDING PASS $19'}
                sx={{
                  bgcolor: isProLicensed ? emeraldSoft : crimsonSoft,
                  color: isProLicensed ? emerald : crimson,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  fontFamily: mono
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              5-field POSIX &amp; Quartz cron parser, 24-hour radial execution clock, and systemd timer generator.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          {!isProLicensed ? (
            <>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
                target="_blank"
                rel="noreferrer"
                startIcon={<BoltIcon />}
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#B8860B' }
                }}
              >
                Unlock Pro $19
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowPaywallModal(true)}
                startIcon={<KeyIcon />}
                sx={{ borderColor: gold, color: gold, fontWeight: 700 }}
              >
                Enter Key
              </Button>
            </>
          ) : (
            <Chip
              icon={<CheckCircleIcon style={{ color: emerald }} />}
              label="UNLIMITED SYSTEMD EXPORTS UNLOCKED"
              sx={{ bgcolor: emeraldSoft, color: emerald, fontWeight: 800, fontFamily: mono }}
            />
          )}
        </Stack>
      </Paper>

      {/* Main Interactive Expression Editor */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
          border: `1px solid ${cardBorder}`,
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              label="5-Field Cron Expression"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="* * * * *"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon sx={{ color: cyan }} />
                  </InputAdornment>
                ),
                sx: { fontFamily: mono, fontSize: '1.05rem', fontWeight: 800 }
              }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Paper sx={{ p: 1.5, bgcolor: isDark ? voidDark : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
                NEXT SCHEDULED TRIGGER COUNTDOWN:
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: mono, fontWeight: 800, color: emerald, mt: 0.2 }}>
                {countdownText || 'Calculating...'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Natural Language Translation */}
        <Paper
          sx={{
            p: 2,
            mt: 2,
            bgcolor: isDark ? voidDark : '#0F172A',
            border: `1px solid ${gold}`,
            borderRadius: 1.5,
            color: '#F8FAFC'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <CalendarMonthIcon sx={{ color: gold, fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
              NATURAL LANGUAGE INTERPRETATION
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ fontFamily: mono, fontWeight: 700, color: '#E2E8F0' }}>
            {describeCron(cronExpression)}
          </Typography>
        </Paper>

        {/* Preset Chips */}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 2, mb: 1, fontFamily: mono, fontWeight: 700 }}>
          CURATED PRODUCTION PRESETS:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {PRESETS.map((p) => (
            <Chip
              key={p.cron}
              label={`${p.label} (${p.cron})`}
              clickable
              onClick={() => setCronExpression(p.cron)}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                bgcolor: cronExpression === p.cron ? goldSoft : isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
                color: cronExpression === p.cron ? gold : 'text.primary',
                border: `1px solid ${cronExpression === p.cron ? gold : cardBorder}`,
                fontWeight: cronExpression === p.cron ? 800 : 500
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Visual Radial Sequencer & Upcoming Execution Matrix */}
      <Grid container spacing={3}>
        {/* Left: 24-Hour Circular Sequencer Clock */}
        <Grid xs={12} md={5}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: cyan, mb: 2 }}>
              24-HOUR RADIAL TIMING ORBIT
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                style={{ width: '280px', height: '280px', display: 'block' }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono, display: 'block', mt: 1 }}>
              Active Hours: <strong>{activeHours.length === 24 ? 'All 24 Hours' : activeHours.map((h) => `${h}:00`).join(', ') || 'None'}</strong>
            </Typography>
          </Paper>
        </Grid>

        {/* Right: Next 8 Executions Table */}
        <Grid xs={12} md={7}>
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: emerald }}>
                UPCOMING CHRONOLOGICAL EXECUTIONS
              </Typography>
              <Chip
                size="small"
                label="LIVE CLOCK SYNC"
                sx={{ fontFamily: mono, fontSize: '0.68rem', bgcolor: emeraldSoft, color: emerald, fontWeight: 800 }}
              />
            </Stack>

            <TableContainer sx={{ border: `1px solid ${cardBorder}`, borderRadius: 1.5, maxHeight: 290 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>
                      #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>
                      Execution Date &amp; Time (Local)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontFamily: mono, bgcolor: isDark ? voidDark : '#F8FAFC' }}>
                      UTC Timestamp
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nextTriggers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontFamily: mono }}>
                        No upcoming executions computed. Verify cron expression syntax.
                      </TableCell>
                    </TableRow>
                  ) : (
                    nextTriggers.map((t, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: gold, fontWeight: 800 }}>
                          #{idx + 1}
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: idx === 0 ? 800 : 500, color: idx === 0 ? emerald : 'text.primary' }}>
                          {t.toLocaleString()} {idx === 0 && '⚡ (NEXT)'}
                        </TableCell>
                        <TableCell sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
                          {t.toISOString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Config Generators (systemd + crontab) */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopy(generateCrontab(), 'copyCrontab')}
                sx={{ fontFamily: mono, fontSize: '0.72rem', color: cyan, borderColor: cyan }}
              >
                {copiedKey === 'copyCrontab' ? 'COPIED CRONTAB' : 'COPY CRONTAB ENTRY'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CodeIcon />}
                onClick={() => handleCopy(generateSystemdTimer(), 'copySystemd')}
                sx={{ fontFamily: mono, fontSize: '0.72rem', color: gold, borderColor: gold }}
              >
                {copiedKey === 'copySystemd' ? 'COPIED SYSTEMD' : 'COPY SYSTEMD TIMER'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Pro Monetization Modal */}
      <Dialog
        open={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? surfaceDark : theme.palette.background.paper,
            border: `1px solid ${gold}`,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: `1px solid ${cardBorder}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShieldIcon sx={{ color: gold }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>
              CronRhythm Pro Sovereign License
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unlock automated enterprise task sync, multi-platform systemd service generation, and distributed agent rhythm triggers.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: goldSoft, border: `1px solid ${gold}`, borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 0.5 }}>
              ⚡ Founding Member Pricing: $19 Lifetime (Regular $79)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              Instant license key issued upon checkout. Supported payment rails:
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
                target="_blank"
                rel="noreferrer"
                sx={{ bgcolor: gold, color: '#000', fontWeight: 800 }}
              >
                Stripe Checkout ($19)
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
                target="_blank"
                rel="noreferrer"
                sx={{ borderColor: cyan, color: cyan, fontWeight: 700 }}
              >
                Solana Pay (USDC/SOL)
              </Button>
            </Stack>
          </Paper>

          <TextField
            fullWidth
            size="small"
            label="Already have a License Key or Receipt Email?"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            placeholder="e.g. CRON-PRO-XXXX-XXXX"
            InputProps={{
              sx: { fontFamily: mono }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${cardBorder}` }}>
          <Button onClick={() => setShowPaywallModal(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            disabled={licenseKeyInput.trim().length < 6}
            sx={{ bgcolor: emerald, color: '#000', fontWeight: 800, fontFamily: mono }}
          >
            ACTIVATE PRO
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CronRhythmGodModeTool;
