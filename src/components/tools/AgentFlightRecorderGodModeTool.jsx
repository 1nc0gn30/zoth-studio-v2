import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Alert,
  Switch,
  FormControlLabel,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow, titleBaseSx } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const API_BASE = 'http://127.0.0.1:8104';

const OFFLINE_PREVIEW_SESSION = {
  session_id: 'offline-sample-preview',
  title: 'Offline Sample Preview (Not Live Daemon Data)',
  command: 'agent-flight-recorder record -- python3 -m agent_core',
  duration_seconds: 3.2,
  status: 'preview',
  event_count: 4,
};

const OFFLINE_PREVIEW_EVENTS = [
  { id: 1, seq: 1, offset_ms: 0, event_type: 'marker', severity: 'INFO', payload: { message: 'Offline sample preview active — start local :8104 daemon for live SQLite data' }, event_hash: 'preview0000000001' },
  { id: 2, seq: 2, offset_ms: 650, event_type: 'terminal_stdout', severity: 'INFO', payload: { text: '[*] Sample agent process started in local loopback enclave' }, event_hash: 'preview0000000002' },
  { id: 3, seq: 3, offset_ms: 1800, event_type: 'capsule_execution', severity: 'INFO', payload: { capsule_id: 'cap-sample-01', command: 'python3 -c "print(42)"', exit_code: 0, status: 'success' }, event_hash: 'preview0000000003' },
  { id: 4, seq: 4, offset_ms: 3200, event_type: 'terminal_stdout', severity: 'INFO', payload: { text: '[✓] Sample run completed with exit code 0' }, event_hash: 'preview0000000004' },
];

export default function AgentFlightRecorderGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // High-contrast Dual-Theme Tokens (WCAG AA+ >= 4.5:1 in both Obsidian Dark and Editorial Ivory Light)
  const palette = isDark
    ? {
        cardBg: 'rgba(10, 12, 18, 0.94)',
        surface: '#12151F',
        surfaceAlt: '#0B0D14',
        border: 'rgba(255, 255, 255, 0.12)',
        borderAccent: 'rgba(212, 175, 55, 0.38)',
        textPrimary: '#F3F4F6',
        textSecondary: '#9CA3AF',
        accentBlue: '#38BDF8',
        accentGold: '#D4AF37',
        accentGoldInk: '#08080B',
        accentEmerald: '#34D399',
        accentRuby: '#F87171',
        chipBlueBg: 'rgba(56, 189, 248, 0.14)',
        chipGreenBg: 'rgba(52, 211, 153, 0.14)',
        chipRubyBg: 'rgba(248, 113, 113, 0.14)',
        chipGoldBg: 'rgba(212, 175, 55, 0.14)',
      }
    : {
        cardBg: '#FFFFFF',
        surface: '#FAF7F0',
        surfaceAlt: '#F3EFE6',
        border: 'rgba(28, 25, 23, 0.14)',
        borderAccent: 'rgba(154, 114, 9, 0.42)',
        textPrimary: '#1C1917',
        textSecondary: '#57534E',
        accentBlue: '#0369A1',
        accentGold: '#9A7209',
        accentGoldInk: '#FFFFFF',
        accentEmerald: '#047857',
        accentRuby: '#BE123C',
        chipBlueBg: 'rgba(3, 105, 161, 0.10)',
        chipGreenBg: 'rgba(4, 120, 87, 0.10)',
        chipRubyBg: 'rgba(190, 18, 60, 0.10)',
        chipGoldBg: 'rgba(154, 114, 9, 0.10)',
      };

  const [daemonOnline, setDaemonOnline] = useState(false);
  const [daemonInfo, setDaemonInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [events, setEvents] = useState([]);
  const [chainVerify, setChainVerify] = useState(null);
  const [scrubMs, setScrubMs] = useState(0);
  const [maxMs, setMaxMs] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [offlinePreview, setOfflinePreview] = useState(false);

  // Live ingestion form state
  const [ingestType, setIngestType] = useState('terminal_stdout');
  const [ingestSeverity, setIngestSeverity] = useState('INFO');
  const [ingestPayload, setIngestPayload] = useState('Verified SHA-256 flight checkpoint from Zoth Studio');
  const [ingestStatus, setIngestStatus] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const canvasRef = useRef(null);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const loadSessionDetail = useCallback(async (sid) => {
    if (!sid) return;
    try {
      const [tlRes, verRes] = await Promise.all([
        fetch(`${API_BASE}/api/timeline/${encodeURIComponent(sid)}`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/verify/${encodeURIComponent(sid)}`, { cache: 'no-store' }),
      ]);
      if (tlRes.ok) {
        const tlData = await tlRes.json();
        const evList = Array.isArray(tlData.events) ? tlData.events : [];
        setEvents(evList);
        const mx = evList.length > 0 ? Math.max(...evList.map((e) => Number(e.offset_ms) || 0), 1000) : 1000;
        setMaxMs(mx);
        setScrubMs(mx);
      }
      if (verRes.ok) {
        setChainVerify(await verRes.json());
      } else {
        setChainVerify(null);
      }
    } catch {
      setChainVerify(null);
    }
  }, []);

  const refreshDaemon = useCallback(async () => {
    try {
      const hRes = await fetch(`${API_BASE}/api/health`, {
        signal: AbortSignal.timeout(1500),
        cache: 'no-store',
      });
      if (!hRes.ok) throw new Error('offline');
      const hData = await hRes.json();
      if (hData.service !== 'agent-flight-recorder') throw new Error('wrong-service');

      setDaemonOnline(true);
      setDaemonInfo(hData);
      setOfflinePreview(false);

      const [stRes, sessRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/sessions?limit=50`, { cache: 'no-store' }),
      ]);
      if (stRes.ok) setStats(await stRes.json());
      if (sessRes.ok) {
        const sData = await sessRes.json();
        const list = Array.isArray(sData.sessions) ? sData.sessions : [];
        setSessions(list);
        const targetSid = selectedSessionId && list.some((s) => s.session_id === selectedSessionId)
          ? selectedSessionId
          : (list[0]?.session_id || '');
        setSelectedSessionId(targetSid);
        if (targetSid) {
          await loadSessionDetail(targetSid);
        } else {
          setEvents([]);
          setChainVerify(null);
        }
      }
    } catch {
      setDaemonOnline(false);
      setDaemonInfo(null);
      setStats(null);
      if (offlinePreview) {
        setSessions([OFFLINE_PREVIEW_SESSION]);
        setSelectedSessionId(OFFLINE_PREVIEW_SESSION.session_id);
        setEvents(OFFLINE_PREVIEW_EVENTS);
        setMaxMs(3200);
        setScrubMs(3200);
        setChainVerify(null);
      } else {
        setSessions([]);
        setSelectedSessionId('');
        setEvents([]);
        setChainVerify(null);
      }
    }
  }, [loadSessionDetail, offlinePreview, selectedSessionId]);

  useEffect(() => {
    refreshDaemon();
  }, [refreshDaemon]);

  // Toggle offline sample preview explicitly when daemon is offline
  const handleToggleOfflinePreview = (checked) => {
    setOfflinePreview(checked);
    if (!daemonOnline) {
      if (checked) {
        setSessions([OFFLINE_PREVIEW_SESSION]);
        setSelectedSessionId(OFFLINE_PREVIEW_SESSION.session_id);
        setEvents(OFFLINE_PREVIEW_EVENTS);
        setMaxMs(3200);
        setScrubMs(3200);
        setChainVerify(null);
      } else {
        setSessions([]);
        setSelectedSessionId('');
        setEvents([]);
        setChainVerify(null);
      }
    }
  };

  // Playback loop with auto-rewind
  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setInterval(() => {
      setScrubMs((prev) => {
        const next = prev + 100;
        if (next >= maxMs) {
          setIsPlaying(false);
          return maxMs;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [isPlaying, maxMs]);

  const activeEvents = events.filter((e) => (Number(e.offset_ms) || 0) <= scrubMs);

  // Oscilloscope / Hash-Chain Canvas (Dual-Theme Aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 440;
    const h = canvas.clientHeight || 150;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = palette.surfaceAlt;
    ctx.fillRect(0, 0, w, h);

    const visible = activeEvents.slice(-6);
    if (visible.length === 0) {
      ctx.fillStyle = palette.textSecondary;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        daemonOnline ? 'No events at current scrubber offset' : 'Daemon offline (:8104) — start daemon or toggle preview',
        w / 2,
        h / 2
      );
      ctx.restore();
      return undefined;
    }

    const spacing = visible.length > 1 ? (w - 96) / (visible.length - 1) : 0;
    const cy = h * 0.48;

    visible.forEach((ev, idx) => {
      const x = visible.length === 1 ? w / 2 : 48 + idx * spacing;
      const y = cy + (idx % 2 === 0 ? -10 : 10);
      if (idx < visible.length - 1) {
        const nx = 48 + (idx + 1) * spacing;
        const ny = cy + ((idx + 1) % 2 === 0 ? -10 : 10);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = palette.accentBlue;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = palette.cardBg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = idx === visible.length - 1 ? palette.accentGold : palette.accentBlue;
      ctx.stroke();

      ctx.fillStyle = palette.textPrimary;
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`#${ev.seq || ev.id}`, x, y + 3);
      ctx.fillStyle = palette.textSecondary;
      ctx.fillText(String(ev.event_hash || 'preview').slice(0, 8), x, y + 29);
    });

    ctx.restore();
    return undefined;
  }, [activeEvents, daemonOnline, palette]);

  const handleIngest = async () => {
    if (!daemonOnline || !ingestPayload.trim()) return;
    setIngestStatus('Sending...');
    try {
      const res = await fetch(`${API_BASE}/api/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSessionId || undefined,
          event_type: ingestType,
          severity: ingestSeverity,
          payload: { text: ingestPayload.trim(), source: 'zoth-studio-deck' },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIngestStatus(`Ingested event #${data.event_id} (${String(data.head_hash || '').slice(0, 10)})`);
        setIngestPayload('');
        setSelectedSessionId(data.session_id);
        await refreshDaemon();
      } else {
        setIngestStatus(`Error ${res.status}: ${data.error || 'failed'}`);
      }
    } catch (err) {
      setIngestStatus(`Network error: ${err.message}`);
    }
  };

  const handleExport = (fmt) => {
    if (!daemonOnline || !selectedSessionId) return;
    const ep = fmt === 'html' ? '/api/export/bundle' : `/api/export/${fmt}`;
    window.open(`${API_BASE}${ep}?session_id=${encodeURIComponent(selectedSessionId)}`, '_blank', 'noopener,noreferrer');
  };

  const latestEvent = activeEvents[activeEvents.length - 1] || null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        borderRadius: 3,
        bgcolor: palette.cardBg,
        border: `1px solid ${palette.borderAccent}`,
        boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 10px 30px rgba(28,25,23,0.06)',
        color: palette.textPrimary,
      }}
    >
      {/* Top Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
            <Chip
              icon={<FlightTakeoffIcon sx={{ fontSize: '0.95rem !important', color: `${palette.accentBlue} !important` }} />}
              label={`AGENT FLIGHT RECORDER v${daemonInfo?.version || '2.6.0'} · 127.0.0.1:8104`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: palette.chipBlueBg,
                color: palette.accentBlue,
                border: `1px solid ${palette.accentBlue}`,
              }}
            />
            {daemonOnline ? (
              <Chip
                icon={
                  chainVerify?.valid ? (
                    <VerifiedIcon sx={{ fontSize: '0.9rem !important', color: `${palette.accentEmerald} !important` }} />
                  ) : (
                    <WarningAmberIcon sx={{ fontSize: '0.9rem !important', color: `${palette.accentRuby} !important` }} />
                  )
                }
                label={
                  chainVerify
                    ? chainVerify.valid
                      ? `SHA-256 VALID: ${String(chainVerify.head_hash || '').slice(0, 12)}`
                      : `CHAIN BROKEN @ #${chainVerify.broken_at_event_id}`
                    : 'LIVE DAEMON CONNECTED'
                }
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: chainVerify && !chainVerify.valid ? palette.chipRubyBg : palette.chipGreenBg,
                  color: chainVerify && !chainVerify.valid ? palette.accentRuby : palette.accentEmerald,
                  border: `1px solid ${chainVerify && !chainVerify.valid ? palette.accentRuby : palette.accentEmerald}`,
                }}
              />
            ) : (
              <Chip
                icon={<WarningAmberIcon sx={{ fontSize: '0.9rem !important', color: `${palette.accentRuby} !important` }} />}
                label={offlinePreview ? 'OFFLINE SAMPLE PREVIEW' : 'LOCAL DAEMON OFFLINE (:8104)'}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: palette.chipRubyBg,
                  color: palette.accentRuby,
                  border: `1px solid ${palette.accentRuby}`,
                }}
              />
            )}
          </Stack>
          <Typography variant="h5" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 400, color: palette.textPrimary }}>
            SHA-256 Hash-Chained <span style={{ color: palette.accentBlue }}>Flight Telemetry</span> &amp; Replay Deck
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshDaemon}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.74rem',
              fontWeight: 700,
              color: palette.accentBlue,
              borderColor: palette.accentBlue,
            }}
          >
            Refresh :8104
          </Button>
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noreferrer"
            sx={{
              minHeight: 44,
              bgcolor: palette.accentGold,
              color: palette.accentGoldInk,
              fontWeight: 800,
              fontSize: '0.74rem',
              fontFamily: mono,
              '&:hover': { bgcolor: palette.accentGold, filter: 'brightness(1.08)' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => handleCopy('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK', 'solTip')}
            sx={{
              minHeight: 44,
              borderColor: palette.accentGold,
              color: palette.accentGold,
              fontWeight: 700,
              fontSize: '0.74rem',
              fontFamily: mono,
            }}
          >
            {copiedKey === 'solTip' ? 'COPIED SOL!' : '◎ TIP SOL'}
          </Button>
        </Stack>
      </Stack>

      <SovereignEyebrow accent={palette.accentBlue} right="Forensics & Telemetry • v2.6.0">
        {'agent-flight-recorder'}
      </SovereignEyebrow>
      <SovereignBand
        seed={'agent-flight-recorder'}
        eyebrow={'Forensics & Telemetry'}
        caption={'Agent Flight Recorder (127.0.0.1:8104)'}
        label={'Agent Flight Recorder — live loopback telemetry deck'}
      />

      {/* Honest Offline Banner */}
      {!daemonOnline && (
        <Alert
          severity="warning"
          sx={{
            mb: 2.5,
            borderRadius: 2,
            bgcolor: palette.surface,
            color: palette.textPrimary,
            border: `1px solid ${palette.borderAccent}`,
            '& .MuiAlert-icon': { color: palette.accentGold },
          }}
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={offlinePreview}
                  onChange={(e) => handleToggleOfflinePreview(e.target.checked)}
                  inputProps={{ 'aria-label': 'Enable Offline Sample Preview' }}
                />
              }
              label={<Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.textPrimary }}>Offline Preview</Typography>}
            />
          }
        >
          <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 700 }}>
            Local Daemon Offline — Run <code>agent-flight-recorder serve</code> (or <code>python3 server.py --port 8104</code>)
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: palette.textSecondary, mt: 0.25 }}>
            This deck connects directly to <code>http://127.0.0.1:8104</code> for real SQLite WAL sessions and SHA-256 hash-chain verification. Toggle Offline Preview to inspect sample layout data.
          </Typography>
        </Alert>
      )}

      {/* Session Selector & Scrubber Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: palette.surface,
          border: `1px solid ${palette.border}`,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 320 } }}>
            <InputLabel id="afr-session-label">Recorded Session</InputLabel>
            <Select
              labelId="afr-session-label"
              label="Recorded Session"
              value={selectedSessionId}
              onChange={(e) => {
                const sid = e.target.value;
                setSelectedSessionId(sid);
                if (daemonOnline) loadSessionDetail(sid);
              }}
              sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.78rem' }}
            >
              {sessions.length === 0 && <MenuItem value="">No sessions available</MenuItem>}
              {sessions.map((s) => (
                <MenuItem key={s.session_id} value={s.session_id} sx={{ fontFamily: mono, fontSize: '0.78rem' }}>
                  {s.session_id} • {String(s.title || '').slice(0, 32)} ({s.event_count || 0} ev)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant="contained"
              startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              disabled={events.length === 0}
              onClick={() => {
                if (!isPlaying && scrubMs >= maxMs) setScrubMs(0);
                setIsPlaying((p) => !p);
              }}
              sx={{
                minHeight: 44,
                bgcolor: palette.accentBlue,
                color: '#FFFFFF',
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.74rem',
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            {['html', 'json', 'csv', 'markdown'].map((fmt) => (
              <Button
                key={fmt}
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={!daemonOnline || !selectedSessionId}
                onClick={() => handleExport(fmt)}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                  borderColor: palette.border,
                }}
              >
                .{fmt === 'markdown' ? 'md' : fmt}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 700, color: palette.accentBlue }}>
            SCRUB OFFSET: {(scrubMs / 1000).toFixed(3)}s / {(maxMs / 1000).toFixed(3)}s ({activeEvents.length} / {events.length} events)
          </Typography>
          {stats && (
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.textSecondary }}>
              DB: {stats.total_sessions} sessions · {stats.total_events} events · {stats.storage_size_kb} KB
            </Typography>
          )}
        </Stack>
        <Slider
          aria-label="Timeline scrubber offset in milliseconds"
          value={Math.min(scrubMs, maxMs)}
          min={0}
          max={maxMs}
          step={25}
          onChange={(_, val) => {
            setIsPlaying(false);
            setScrubMs(Number(val));
          }}
          sx={{ color: palette.accentGold, mt: 0.5 }}
        />
      </Paper>

      {/* Main 2-Column Forensics Grid */}
      <Grid container spacing={2.5}>
        <Grid xs={12} md={6}>
          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: palette.surface,
                border: `1px solid ${palette.border}`,
                maxHeight: 310,
                overflowY: 'auto',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: palette.accentGold, mb: 1 }}>
                TIMELINE EVENTS ({activeEvents.length})
              </Typography>
              {activeEvents.length === 0 ? (
                <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: palette.textSecondary }}>
                  {daemonOnline
                    ? 'No recorded events in current scrubber window.'
                    : 'Connect to local :8104 daemon or toggle Offline Preview above.'}
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {activeEvents.slice().reverse().slice(0, 30).map((ev) => (
                    <Box
                      key={ev.id || `${ev.seq}-${ev.offset_ms}`}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: palette.cardBg,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.35 }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: palette.accentBlue }}>
                          #{ev.seq || ev.id} · {ev.event_type} ({ev.severity || 'INFO'})
                        </Typography>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: palette.accentGold }}>
                          sha256:{String(ev.event_hash || 'none').slice(0, 10)}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.71rem', color: palette.textSecondary, wordBreak: 'break-word' }}>
                        {JSON.stringify(ev.payload)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Live Event Ingestion Form */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: palette.textPrimary, mb: 1 }}>
                POST /api/ingest — APPEND LIVE HASH-CHAINED EVENT
              </Typography>
              <Stack spacing={1.25}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Event Type"
                    value={ingestType}
                    onChange={(e) => setIngestType(e.target.value)}
                    disabled={!daemonOnline}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Severity"
                    value={ingestSeverity}
                    onChange={(e) => setIngestSeverity(e.target.value)}
                    disabled={!daemonOnline}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Telemetry Message"
                    value={ingestPayload}
                    onChange={(e) => setIngestPayload(e.target.value)}
                    disabled={!daemonOnline}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    disabled={!daemonOnline || !ingestPayload.trim()}
                    onClick={handleIngest}
                    sx={{
                      minHeight: 44,
                      bgcolor: palette.accentGold,
                      color: palette.accentGoldInk,
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Ingest Event
                  </Button>
                </Stack>
                {ingestStatus && (
                  <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.accentEmerald }}>
                    {ingestStatus}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${palette.border}`,
                bgcolor: palette.surfaceAlt,
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.9,
                  borderBottom: `1px solid ${palette.border}`,
                  bgcolor: palette.surface,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: palette.accentBlue, fontWeight: 700 }}>
                  APPEND-ONLY SHA-256 EVENT CHAIN
                </Typography>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: chainVerify?.valid ? palette.accentEmerald : palette.textSecondary,
                  }}
                >
                  {chainVerify ? (chainVerify.valid ? 'VERIFIED INTACT' : 'TAMPER DETECTED') : 'AWAITING VERIFY'}
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 150, display: 'block' }} />
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: palette.surfaceAlt,
                border: `1px solid ${palette.borderAccent}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: palette.accentGold, fontWeight: 800, mb: 1 }}>
                {latestEvent ? `INSPECTING EVENT #${latestEvent.seq || latestEvent.id}` : 'EVENT PAYLOAD INSPECTOR'}
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  color: palette.textPrimary,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {latestEvent
                  ? JSON.stringify(latestEvent, null, 2)
                  : 'Select or ingest a live event to inspect its canonical SHA-256 hash and payload.'}
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
