import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HubIcon from '@mui/icons-material/Hub';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useCopy, downloadText, downloadJson } from '../sovereign/hooks.js';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import {
  BUS_MONITOR_VERSION,
  LOOPBACK_BUS_TARGETS,
  validateLoopbackPort,
  classifyProbeStatus,
  computeLatencyStats,
  inspectEnvelopeStructure,
  signHmacSha256Envelope,
  verifyHmacSha256Envelope,
  exportBusReportJson,
  exportBusReportCsv,
  exportBusReportMarkdown,
} from '../../utils/busMonitorEngine';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const DEFAULT_ENVELOPE_PAYLOAD = JSON.stringify(
  {
    type: 'swarm.bus.heartbeat',
    sender: 'zoth-noc-operator',
    target: 'signal-bridge:8102',
    scope: 'loopback-only',
  },
  null,
  2
);

function generateHexNonce(byteLength = 12) {
  const bytes = new Uint8Array(byteLength);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i += 1) bytes[i] = (i * 37 + 19) & 0xff;
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function createInitialOfflineNodes() {
  return LOOPBACK_BUS_TARGETS.map((t) => ({
    ...t,
    host: '127.0.0.1',
    ok: false,
    httpStatus: null,
    rttMs: null,
    status: 'OFFLINE',
    checkedAt: null,
  }));
}

export default function BusMonitorGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { copied, copy } = useCopy(1800);

  // Dual-theme high-contrast palette (>= 4.5:1 across all text, chips, badges & buttons)
  const pal = useMemo(() => {
    if (isDark) {
      return {
        shellBg: '#08080B',
        surfaceBg: '#0D0F16',
        subCardBg: '#121520',
        codeBg: '#0A0C12',
        border: 'rgba(245, 241, 230, 0.14)',
        borderStrong: 'rgba(212, 175, 55, 0.36)',
        inkPrimary: '#F5F1E6',
        inkSecondary: '#B6BDCB',
        inkMuted: '#9EA7B8',
        gold: '#D4AF37',
        goldBg: 'rgba(212, 175, 55, 0.14)',
        goldOnSolid: '#08080B',
        emerald: '#34D399',
        emeraldBg: 'rgba(52, 211, 153, 0.14)',
        emeraldBorder: 'rgba(52, 211, 153, 0.35)',
        sky: '#38BDF8',
        skyBg: 'rgba(56, 189, 248, 0.14)',
        amber: '#FBBF24',
        amberBg: 'rgba(251, 191, 36, 0.14)',
        crimson: '#F87171',
        crimsonBg: 'rgba(248, 113, 113, 0.16)',
        svgGrid: 'rgba(245, 241, 230, 0.10)',
        svgHubFill: '#121520',
        svgNodeOfflineFill: '#11141D',
        svgNodeOnlineFill: '#0E241C',
      };
    }
    return {
      shellBg: '#FAF8F3',
      surfaceBg: '#FFFFFF',
      subCardBg: '#F4F1EA',
      codeBg: '#F3EFE6',
      border: 'rgba(16, 24, 40, 0.14)',
      borderStrong: 'rgba(122, 88, 8, 0.36)',
      inkPrimary: '#101828',
      inkSecondary: '#344054',
      inkMuted: '#475467',
      gold: '#7A5808',
      goldBg: 'rgba(122, 88, 8, 0.10)',
      goldOnSolid: '#FFFFFF',
      emerald: '#047857',
      emeraldBg: '#ECFDF5',
      emeraldBorder: '#A7F3D0',
      sky: '#0369A1',
      skyBg: '#E0F2FE',
      amber: '#9A3412',
      amberBg: '#FEF3C7',
      crimson: '#B91C1C',
      crimsonBg: '#FEE2E2',
      svgGrid: 'rgba(16, 24, 40, 0.12)',
      svgHubFill: '#FFFFFF',
      svgNodeOfflineFill: '#F4F1EA',
      svgNodeOnlineFill: '#ECFDF5',
    };
  }, [isDark]);

  // 1. Live Bus Telemetry State
  const [nodes, setNodes] = useState(createInitialOfflineNodes);
  const [bridge, setBridge] = useState({ online: false, port: 8102 });
  const [unixSockets, setUnixSockets] = useState([]);
  const [lastSweepAt, setLastSweepAt] = useState(null);
  const [telemetryMode, setTelemetryMode] = useState('idle'); // idle | live | offline-browser | error
  const [sweeping, setSweeping] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ONLINE | OFFLINE
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Targeted Loopback Pinger State
  const [pingPortInput, setPingPortInput] = useState('3000');
  const [pinging, setPinging] = useState(false);
  const [lastPingResult, setLastPingResult] = useState(null);
  const [pingError, setPingError] = useState('');
  const [pingHistory, setPingHistory] = useState([]);

  // 3. HKDF-SHA256 / HMAC-SHA256 Envelope Inspector State
  const [envSecret, setEnvSecret] = useState('zoth-local-loopback-signing-key-32b');
  const [envNonce, setEnvNonce] = useState('01a2b3c4d5e6f708192a3b4c');
  const [envTimestamp, setEnvTimestamp] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [envPayload, setEnvPayload] = useState(DEFAULT_ENVELOPE_PAYLOAD);
  const [envSignature, setEnvSignature] = useState('');
  const [envVerifyResult, setEnvVerifyResult] = useState(null);
  const [envBusy, setEnvBusy] = useState(false);

  // 4. Filterable Real Event Stream State (ZERO fake boot entries)
  const [events, setEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('ALL'); // ALL | SWEEP | PING | CRYPTO | ERROR

  const appendEvent = useCallback((category, severity, message) => {
    setEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        ts: new Date().toISOString().slice(11, 23),
        category,
        severity,
        message,
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const runLiveSweep = useCallback(async () => {
    if (!isLocalRuntime()) {
      setTelemetryMode('offline-browser');
      appendEvent(
        'SWEEP',
        'INFO',
        'Static browser preview detected (non-loopback origin). Run Zoth Studio on 127.0.0.1:3000 for live loopback sweeps.'
      );
      return;
    }
    setSweeping(true);
    try {
      const res = await fetch('/api/studio/bus/telemetry', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.nodes)) {
        setNodes(data.nodes);
      }
      setBridge(data.bridge || { online: false, port: 8102 });
      setUnixSockets(Array.isArray(data.unixSockets) ? data.unixSockets : []);
      setLastSweepAt(data.timestamp || new Date().toISOString());
      setTelemetryMode('live');
      const onlineCount = data.summary?.onlineCount ?? 0;
      const totalTargets = data.summary?.totalTargets ?? (data.nodes?.length || 0);
      const p50 = data.summary?.p50Ms;
      appendEvent(
        'SWEEP',
        'OK',
        `Loopback sweep completed: ${onlineCount}/${totalTargets} online${p50 != null ? ` (p50 ${p50} ms)` : ''}, ${Array.isArray(data.unixSockets) ? data.unixSockets.length : 0} Unix sockets.`
      );
    } catch (err) {
      setTelemetryMode('error');
      appendEvent('ERROR', 'ERR', `Loopback telemetry sweep unavailable (${err.message}).`);
    } finally {
      setSweeping(false);
    }
  }, [appendEvent]);

  useEffect(() => {
    runLiveSweep();
  }, [runLiveSweep]);

  // Pre-compute an initial WebCrypto HMAC-SHA256 signature on mount so Verify MAC is immediately interactive
  useEffect(() => {
    let active = true;
    signHmacSha256Envelope({
      payload: DEFAULT_ENVELOPE_PAYLOAD,
      secret: 'zoth-local-loopback-signing-key-32b',
      nonce: '01a2b3c4d5e6f708192a3b4c',
      timestamp: envTimestamp,
    })
      .then((signed) => {
        if (active && !envSignature) {
          setEnvSignature(signed.signatureHex);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTargetedPing = async (overridePort) => {
    const portStr = String(overridePort ?? pingPortInput).trim();
    if (overridePort !== undefined) setPingPortInput(portStr);
    setPingError('');

    const check = validateLoopbackPort(portStr);
    if (!check.valid) {
      setPingError(check.error);
      appendEvent('ERROR', 'ERR', `Ping rejected locally: ${check.error}`);
      return;
    }

    if (!isLocalRuntime()) {
      setPingError('Live loopback probes require Zoth Studio running locally on 127.0.0.1:3000.');
      appendEvent('ERROR', 'ERR', `Cannot probe 127.0.0.1:${check.port} from static remote host.`);
      return;
    }

    setPinging(true);
    try {
      const res = await fetch('/api/studio/bus/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: check.port }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || `HTTP ${res.status}`;
        setPingError(msg);
        appendEvent('ERROR', 'ERR', `Ping :${check.port} rejected (${msg}).`);
        return;
      }
      setLastPingResult(data);
      setPingHistory((prev) => [data, ...prev.slice(0, 11)]);
      appendEvent(
        'PING',
        data.ok ? 'OK' : 'WARN',
        `127.0.0.1:${data.port} (${data.name}) -> ${data.status}${data.rttMs != null ? ` · ${data.rttMs} ms` : ''}${data.httpStatus ? ` · HTTP ${data.httpStatus}` : ''}`
      );
    } catch (err) {
      setPingError(`Probe failed: ${err.message}`);
      appendEvent('ERROR', 'ERR', `Ping :${check.port} transport error (${err.message}).`);
    } finally {
      setPinging(false);
    }
  };

  const handleSignEnvelope = async () => {
    setEnvBusy(true);
    setEnvVerifyResult(null);
    try {
      const signed = await signHmacSha256Envelope({
        payload: envPayload,
        secret: envSecret,
        nonce: envNonce,
        timestamp: envTimestamp,
      });
      setEnvSignature(signed.signatureHex);
      setEnvVerifyResult({
        verified: true,
        reason: 'Signed canonical frame with WebCrypto HMAC-SHA256.',
        algorithm: signed.algorithm,
      });
      appendEvent('CRYPTO', 'OK', `Signed HMAC-SHA256 envelope (nonce ${envNonce.slice(0, 8)}…, tag ${signed.signatureHex.slice(0, 12)}…).`);
    } catch (err) {
      setEnvVerifyResult({ verified: false, reason: err.message });
      appendEvent('ERROR', 'ERR', `Envelope signing failed: ${err.message}`);
    } finally {
      setEnvBusy(false);
    }
  };

  const handleVerifyEnvelope = async () => {
    setEnvBusy(true);
    try {
      const result = await verifyHmacSha256Envelope({
        payload: envPayload,
        secret: envSecret,
        nonce: envNonce,
        timestamp: envTimestamp,
        signatureHex: envSignature,
      });
      setEnvVerifyResult(result);
      appendEvent(
        'CRYPTO',
        result.verified ? 'OK' : 'WARN',
        result.verified ? 'Verified HMAC-SHA256 envelope tag in constant time.' : `Verification failed: ${result.reason}`
      );
    } catch (err) {
      setEnvVerifyResult({ verified: false, reason: err.message });
      appendEvent('ERROR', 'ERR', `Envelope verify error: ${err.message}`);
    } finally {
      setEnvBusy(false);
    }
  };

  const summary = useMemo(() => computeLatencyStats(nodes), [nodes]);

  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter((n) => {
      const st = n.status || classifyProbeStatus({ ok: Boolean(n.ok), rttMs: n.rttMs });
      if (statusFilter === 'ONLINE' && st === 'OFFLINE') return false;
      if (statusFilter === 'OFFLINE' && st !== 'OFFLINE') return false;
      if (!q) return true;
      return (
        String(n.name).toLowerCase().includes(q) ||
        String(n.code).toLowerCase().includes(q) ||
        String(n.port).includes(q) ||
        String(n.category).toLowerCase().includes(q)
      );
    });
  }, [nodes, statusFilter, searchQuery]);

  const envelopeAudit = useMemo(
    () =>
      inspectEnvelopeStructure({
        payload: envPayload,
        secret: envSecret,
        nonce: envNonce,
        timestamp: envTimestamp,
        signatureHex: envSignature,
      }),
    [envPayload, envSecret, envNonce, envTimestamp, envSignature]
  );

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'ALL') return events;
    return events.filter((e) => e.category === eventFilter);
  }, [events, eventFilter]);

  const currentSnapshot = useMemo(
    () => ({
      schemaVersion: BUS_MONITOR_VERSION,
      timestamp: lastSweepAt || new Date().toISOString(),
      summary,
      nodes,
      bridge,
      unixSockets,
    }),
    [lastSweepAt, summary, nodes, bridge, unixSockets]
  );

  const statusTone = (status) => {
    if (status === 'ONLINE') return { fg: pal.emerald, bg: pal.emeraldBg };
    if (status === 'DEGRADED') return { fg: pal.amber, bg: pal.amberBg };
    return { fg: pal.crimson, bg: pal.crimsonBg };
  };

  const inputSx = {
    '& .MuiInputLabel-root': {
      color: pal.inkSecondary,
      fontFamily: mono,
      fontSize: '0.78rem',
      fontWeight: 600,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: pal.gold,
    },
    '& .MuiOutlinedInput-root': {
      fontFamily: mono,
      fontSize: '0.82rem',
      color: pal.inkPrimary,
      bgcolor: pal.codeBg,
      minHeight: 44,
      '& fieldset': { borderColor: pal.border },
      '&:hover fieldset': { borderColor: pal.gold },
      '&.Mui-focused fieldset': { borderColor: pal.gold },
    },
    '& .MuiInputBase-input, & .MuiNativeSelect-select': {
      minHeight: 44,
      boxSizing: 'border-box',
      py: 1.25,
    },
  };

  const bridgeLiveSessionsCount =
    (bridge?.liveSummary?.muse_sessions_count || 0) +
    (bridge?.liveSummary?.antigravity_sessions_count || 0);

  return (
    <Box
      data-testid="bus-monitor-workstation"
      sx={{
        bgcolor: pal.shellBg,
        color: pal.inkPrimary,
        borderRadius: 2.5,
        border: `1px solid ${pal.borderStrong}`,
        overflow: 'hidden',
      }}
    >
      {/* Workstation Header Strip */}
      <Box
        sx={{
          p: { xs: 2, md: 2.75 },
          bgcolor: pal.surfaceBg,
          borderBottom: `1px solid ${pal.border}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: pal.skyBg,
              color: pal.sky,
              border: `1px solid ${pal.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HubIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Typography
                component="h3"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: { xs: '0.92rem', sm: '1rem' },
                  color: pal.inkPrimary,
                  letterSpacing: '0.03em',
                }}
              >
                ZOTH SWARM NOC &amp; SIGNAL BRIDGE
              </Typography>
              <Chip
                label={`v${BUS_MONITOR_VERSION}`}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: pal.goldBg,
                  color: pal.gold,
                  border: `1px solid ${pal.borderStrong}`,
                }}
              />
              <Chip
                label={
                  telemetryMode === 'live'
                    ? 'LIVE LOOPBACK TELEMETRY'
                    : telemetryMode === 'offline-browser'
                    ? 'STATIC BROWSER PREVIEW'
                    : 'LOOPBACK STANDBY'
                }
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: telemetryMode === 'live' ? pal.emeraldBg : pal.skyBg,
                  color: telemetryMode === 'live' ? pal.emerald : pal.sky,
                  border: `1px solid ${pal.border}`,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: pal.inkSecondary, mt: 0.4 }}>
              Strict 127.0.0.1 loopback service probes · SSRF-guarded port pinger · WebCrypto HKDF-SHA256 / HMAC-SHA256 inspector
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="contained"
            disableElevation
            disabled={sweeping}
            onClick={runLiveSweep}
            startIcon={<RefreshIcon sx={{ fontSize: 17 }} />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: pal.gold,
              color: pal.goldOnSolid,
              px: 2,
              '&:hover': { bgcolor: pal.gold, opacity: 0.92 },
            }}
          >
            {sweeping ? 'Sweeping…' : 'Refresh Live Sweep'}
          </Button>
          {isLocalRuntime() && (
            <Button
              component="a"
              href="http://127.0.0.1:8102"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
              sx={{
                minHeight: 44,
                fontFamily: mono,
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                color: pal.sky,
                borderColor: pal.border,
                bgcolor: pal.skyBg,
                px: 1.75,
                '&:hover': { borderColor: pal.sky, bgcolor: pal.skyBg },
              }}
            >
              Open :8102 Bridge
            </Button>
          )}
        </Box>
      </Box>

      {/* Honest Offline Banner when Studio API is not reachable */}
      {telemetryMode !== 'live' && (
        <Box sx={{ px: { xs: 2, md: 2.75 }, pt: 2 }}>
          <Alert
            severity="info"
            sx={{
              bgcolor: pal.skyBg,
              color: pal.inkPrimary,
              border: `1px solid ${pal.border}`,
              '& .MuiAlert-icon': { color: pal.sky },
              fontFamily: mono,
              fontSize: '0.76rem',
            }}
          >
            {telemetryMode === 'offline-browser'
              ? 'Offline / Static Browser Preview: Remote origins cannot probe localhost. Start Zoth Studio locally (`npm run serve` on 127.0.0.1:3000) for live sweeps; the WebCrypto HMAC-SHA256 Envelope Inspector below runs 100% client-side.'
              : 'Studio backend telemetry not yet loaded or offline. All unprobed targets are marked OFFLINE with null RTT (zero fabricated numbers).'}
          </Alert>
        </Box>
      )}

      {/* KPI Strip */}
      <Box sx={{ p: { xs: 2, md: 2.75 }, pb: 0 }}>
        <Grid container spacing={1.5}>
          {[
            {
              label: 'ONLINE TARGETS',
              value: `${summary.onlineCount} / ${summary.count}`,
              sub: `${summary.offlineCount} offline`,
              accent: pal.emerald,
            },
            {
              label: 'MEASURED P50 RTT',
              value: summary.p50Ms != null ? `${summary.p50Ms} ms` : '—',
              sub: summary.minMs != null ? `min ${summary.minMs} ms` : 'no online probes',
              accent: pal.sky,
            },
            {
              label: 'MEASURED P95 RTT',
              value: summary.p95Ms != null ? `${summary.p95Ms} ms` : '—',
              sub: summary.maxMs != null ? `max ${summary.maxMs} ms` : 'no online probes',
              accent: pal.gold,
            },
            {
              label: 'LIVE BRIDGE SESSIONS',
              value: bridge.online ? String(bridgeLiveSessionsCount) : 'OFFLINE',
              sub: bridge.online
                ? `:8102 (${bridge.rttMs ?? '—'} ms) · ${unixSockets.length} sock`
                : `0 active · ${unixSockets.length} Unix sock`,
              accent: bridge.online ? pal.emerald : pal.inkSecondary,
            },
          ].map((kpi) => (
            <Grid xs={6} md={3} key={kpi.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  bgcolor: pal.surfaceBg,
                  border: `1px solid ${pal.border}`,
                  height: '100%',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: pal.inkMuted,
                    mb: 0.5,
                  }}
                >
                  {kpi.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                    fontWeight: 800,
                    color: kpi.accent,
                    lineHeight: 1.2,
                  }}
                >
                  {kpi.value}
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: pal.inkSecondary, mt: 0.35 }}>
                  {kpi.sub}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* SECTION 1: Live Loopback Bus Matrix & SVG Star Topology */}
      <Box sx={{ p: { xs: 2, md: 2.75 } }}>
        <Grid container spacing={2.5}>
          {/* Left: Matrix Table + Filters */}
          <Grid xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                bgcolor: pal.surfaceBg,
                border: `1px solid ${pal.border}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.25,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    component="h3"
                    sx={{ fontFamily: mono, fontSize: '0.86rem', fontWeight: 800, color: pal.inkPrimary }}
                  >
                    1. LIVE LOOPBACK BUS MATRIX (127.0.0.1)
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: pal.inkSecondary }}>
                    {lastSweepAt
                      ? `Last measured sweep: ${lastSweepAt.slice(11, 19)} UTC · click any row to ping`
                      : 'Measured status across 12 canonical ZothOS loopback services'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {['ALL', 'ONLINE', 'OFFLINE'].map((f) => {
                    const active = statusFilter === f;
                    return (
                      <Button
                        key={f}
                        size="small"
                        variant={active ? 'contained' : 'outlined'}
                        disableElevation
                        onClick={() => setStatusFilter(f)}
                        sx={{
                          minHeight: 44,
                          minWidth: 64,
                          fontFamily: mono,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: active ? pal.gold : 'transparent',
                          color: active ? pal.goldOnSolid : pal.inkPrimary,
                          borderColor: active ? pal.gold : pal.border,
                          '&:hover': {
                            bgcolor: active ? pal.gold : pal.subCardBg,
                            borderColor: pal.gold,
                          },
                        }}
                      >
                        {f === 'ALL' ? `All (${nodes.length})` : f === 'ONLINE' ? `Online (${summary.onlineCount})` : `Offline (${summary.offlineCount})`}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Filter loopback services by name, code, port, or category"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'Filter loopback services' }}
                sx={{ ...inputSx, mb: 2 }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredNodes.map((n) => {
                  const st = n.status || classifyProbeStatus({ ok: Boolean(n.ok), rttMs: n.rttMs });
                  const tone = statusTone(st);
                  return (
                    <Box
                      key={n.id}
                      component="button"
                      type="button"
                      onClick={() => handleTargetedPing(n.port)}
                      sx={{
                        width: '100%',
                        minHeight: 48,
                        textAlign: 'left',
                        p: 1.25,
                        borderRadius: 1.5,
                        border: `1px solid ${pal.border}`,
                        bgcolor: pal.subCardBg,
                        color: pal.inkPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        transition: 'border-color 0.15s ease',
                        '&:hover': { borderColor: pal.gold },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                        <Box
                          sx={{
                            px: 0.9,
                            py: 0.35,
                            borderRadius: 1,
                            fontFamily: mono,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: pal.surfaceBg,
                            color: pal.gold,
                            border: `1px solid ${pal.border}`,
                            flexShrink: 0,
                          }}
                        >
                          {n.code}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: pal.inkPrimary,
                            }}
                          >
                            {n.name}
                          </Typography>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: pal.inkSecondary }}>
                            127.0.0.1:{n.port} · {n.protocol || 'HTTP'} · {n.category}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: n.rttMs != null ? pal.inkPrimary : pal.inkMuted,
                          }}
                        >
                          {n.rttMs != null ? `${n.rttMs} ms` : '—'}
                        </Typography>
                        <Chip
                          label={n.httpStatus ? `${st} · ${n.httpStatus}` : st}
                          size="small"
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            bgcolor: tone.bg,
                            color: tone.fg,
                            border: `1px solid ${pal.border}`,
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
                {filteredNodes.length === 0 && (
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: pal.inkSecondary, py: 2, textAlign: 'center' }}>
                    No loopback targets match your current filter.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right: Interactive Dual-Theme SVG Star Topology + Targeted Loopback Pinger */}
          <Grid xs={12} lg={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* SVG Star Topology */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  bgcolor: pal.surfaceBg,
                  border: `1px solid ${pal.border}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
                  <Typography
                    component="h3"
                    sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 800, color: pal.inkPrimary }}
                  >
                    LOOPBACK STAR TOPOLOGY
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700, color: pal.sky }}>
                    127.0.0.1 ONLY
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    borderRadius: 1.5,
                    bgcolor: pal.codeBg,
                    border: `1px solid ${pal.border}`,
                    p: 1,
                  }}
                >
                  <svg
                    viewBox="0 0 420 280"
                    role="img"
                    aria-label="Loopback Star-Topology Network Map for 12 ZothOS Services"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  >
                    <title>Zoth Swarm NOC 127.0.0.1 Star Topology</title>
                    <circle cx="210" cy="140" r="108" fill="none" stroke={pal.svgGrid} strokeDasharray="4 4" />
                    <circle cx="210" cy="140" r="64" fill="none" stroke={pal.svgGrid} />
                    {nodes.map((n, idx) => {
                      const angle = (idx / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
                      const nx = 210 + Math.cos(angle) * 108;
                      const ny = 140 + Math.sin(angle) * 102;
                      const isOnline = n.status === 'ONLINE' || n.status === 'DEGRADED';
                      const strokeColor = isOnline ? pal.emerald : pal.svgGrid;
                      return (
                        <g key={n.id}>
                          <line
                            x1="210"
                            y1="140"
                            x2={nx}
                            y2={ny}
                            stroke={strokeColor}
                            strokeWidth={isOnline ? 1.8 : 1}
                            strokeDasharray={isOnline ? undefined : '3 3'}
                          />
                          <circle
                            cx={nx}
                            cy={ny}
                            r="20"
                            fill={isOnline ? pal.svgNodeOnlineFill : pal.svgNodeOfflineFill}
                            stroke={isOnline ? pal.emerald : pal.inkMuted}
                            strokeWidth={isOnline ? 2 : 1.2}
                          />
                          <text
                            x={nx}
                            y={ny - 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={isOnline ? pal.emerald : pal.inkPrimary}
                            fontFamily="JetBrains Mono, monospace"
                            fontSize="9"
                            fontWeight="800"
                          >
                            {n.code}
                          </text>
                          <text
                            x={nx}
                            y={ny + 9}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={pal.inkSecondary}
                            fontFamily="JetBrains Mono, monospace"
                            fontSize="7"
                            fontWeight="600"
                          >
                            :{n.port}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="210" cy="140" r="32" fill={pal.svgHubFill} stroke={pal.gold} strokeWidth="2.5" />
                    <text
                      x="210"
                      y="135"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={pal.gold}
                      fontFamily="JetBrains Mono, monospace"
                      fontSize="10"
                      fontWeight="800"
                    >
                      NOC
                    </text>
                    <text
                      x="210"
                      y="148"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={pal.inkSecondary}
                      fontFamily="JetBrains Mono, monospace"
                      fontSize="8"
                      fontWeight="700"
                    >
                      127.0.0.1
                    </text>
                  </svg>
                </Box>
              </Paper>

              {/* SECTION 2: Targeted Loopback Pinger */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 2,
                  bgcolor: pal.surfaceBg,
                  border: `1px solid ${pal.border}`,
                }}
              >
                <Typography
                  component="h3"
                  sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 800, color: pal.inkPrimary, mb: 0.5 }}
                >
                  2. TARGETED LOOPBACK PINGER
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: pal.inkSecondary, mb: 2 }}>
                  Probes strictly <code>127.0.0.1:&lt;port&gt;</code> (<code>1024..65535</code>). External hosts &amp; metadata IPs are rejected.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <FormControl fullWidth size="small" sx={inputSx}>
                    <InputLabel htmlFor="bus-target-select" shrink>
                      Preset Loopback Service
                    </InputLabel>
                    <Select
                      native
                      label="Preset Loopback Service"
                      inputProps={{
                        id: 'bus-target-select',
                        'aria-label': 'Preset Loopback Service',
                      }}
                      value={
                        LOOPBACK_BUS_TARGETS.some((t) => String(t.port) === String(pingPortInput))
                          ? String(pingPortInput)
                          : ''
                      }
                      onChange={(e) => setPingPortInput(String(e.target.value))}
                    >
                      <option value="">Custom 127.0.0.1 Port</option>
                      {LOOPBACK_BUS_TARGETS.map((t) => (
                        <option key={t.id} value={String(t.port)}>
                          [{t.code}] {t.name} (:{t.port})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                      size="small"
                      label="127.0.0.1 Port (1024–65535)"
                      value={pingPortInput}
                      onChange={(e) => setPingPortInput(e.target.value)}
                      inputProps={{ 'aria-label': 'Loopback target port' }}
                      sx={{ ...inputSx, flex: '1 1 160px' }}
                    />
                    <Button
                      variant="contained"
                      disableElevation
                      disabled={pinging}
                      onClick={() => handleTargetedPing()}
                      startIcon={<NetworkCheckIcon sx={{ fontSize: 17 }} />}
                      sx={{
                        minHeight: 44,
                        fontFamily: mono,
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        bgcolor: pal.emerald,
                        color: isDark ? '#06130E' : '#FFFFFF',
                        px: 2,
                        '&:hover': { bgcolor: pal.emerald, opacity: 0.92 },
                      }}
                    >
                      {pinging ? 'Probing…' : 'Ping 127.0.0.1'}
                    </Button>
                  </Box>

                  {pingError && (
                    <Alert
                      severity="error"
                      sx={{
                        bgcolor: pal.crimsonBg,
                        color: pal.crimson,
                        border: `1px solid ${pal.border}`,
                        fontFamily: mono,
                        fontSize: '0.74rem',
                      }}
                    >
                      {pingError}
                    </Alert>
                  )}

                  {lastPingResult && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: pal.subCardBg,
                        border: `1px solid ${pal.border}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: pal.inkPrimary }}>
                          127.0.0.1:{lastPingResult.port} · {lastPingResult.name}
                        </Typography>
                        <Chip
                          label={lastPingResult.status}
                          size="small"
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            bgcolor: statusTone(lastPingResult.status).bg,
                            color: statusTone(lastPingResult.status).fg,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: pal.inkSecondary, mt: 0.5 }}>
                        RTT: {lastPingResult.rttMs != null ? `${lastPingResult.rttMs} ms` : 'OFFLINE'} · Protocol:{' '}
                        {lastPingResult.protocol} · HTTP: {lastPingResult.httpStatus ?? '—'}
                      </Typography>
                    </Box>
                  )}

                  {pingHistory.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, color: pal.inkMuted, mb: 0.75 }}>
                        SESSION PROBE HISTORY ({pingHistory.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {pingHistory.slice(0, 5).map((h, i) => (
                          <Box
                            key={`${h.checkedAt}-${i}`}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontFamily: mono,
                              fontSize: '0.72rem',
                              color: pal.inkSecondary,
                              px: 1,
                              py: 0.4,
                              borderRadius: 1,
                              bgcolor: pal.codeBg,
                            }}
                          >
                            <span>:{h.port} ({h.protocol})</span>
                            <span style={{ color: statusTone(h.status).fg, fontWeight: 700 }}>
                              {h.status} {h.rttMs != null ? `· ${h.rttMs}ms` : ''}
                            </span>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* SECTION 3: Signal Bridge Sessions & HKDF-SHA256 / HMAC-SHA256 Envelope Inspector */}
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {/* Live Bridge Sessions & Unix Sockets */}
          <Grid xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                bgcolor: pal.surfaceBg,
                border: `1px solid ${pal.border}`,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography
                  component="h3"
                  sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 800, color: pal.inkPrimary }}
                >
                  3A. SIGNAL BRIDGE (:8102) &amp; UNIX SOCKETS
                </Typography>
                <Chip
                  label={bridge.online ? 'DAEMON ONLINE' : 'DAEMON OFFLINE'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    bgcolor: bridge.online ? pal.emeraldBg : pal.crimsonBg,
                    color: bridge.online ? pal.emerald : pal.crimson,
                  }}
                />
              </Box>

              {bridge.online ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: pal.subCardBg,
                      border: `1px solid ${pal.border}`,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      color: pal.inkSecondary,
                    }}
                  >
                    <Box sx={{ color: pal.inkPrimary, fontWeight: 700, mb: 0.4 }}>
                      Daemon v{bridge.health?.version || '0.1.0'} · Measured RTT {bridge.rttMs ?? '—'} ms
                    </Box>
                    <Box>
                      Messages sent: {bridge.stats?.messages_sent ?? 0} · Active claims: {bridge.stats?.active_claims ?? 0} ·
                      Muse: {bridge.liveSummary?.muse_sessions_count ?? 0} · AGY: {bridge.liveSummary?.antigravity_sessions_count ?? 0}
                    </Box>
                  </Box>

                  {Array.isArray(bridge.channels) && bridge.channels.length > 0 && (
                    <Box>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 700, color: pal.inkMuted, mb: 0.75 }}>
                        CONFIGURED ADAPTERS ({bridge.channels.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {bridge.channels.map((ch) => (
                          <Box
                            key={ch.id}
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: pal.codeBg,
                              border: `1px solid ${pal.border}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: pal.inkPrimary }}>
                                [{ch.code}] {ch.name}
                              </Typography>
                              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: pal.inkSecondary }}>
                                {ch.endpoint}
                              </Typography>
                            </Box>
                            <Chip
                              label={ch.isStaticMock ? 'STATIC METADATA' : ch.status}
                              size="small"
                              sx={{
                                fontFamily: mono,
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                bgcolor: ch.isStaticMock ? pal.amberBg : pal.emeraldBg,
                                color: ch.isStaticMock ? pal.amber : pal.emerald,
                                flexShrink: 0,
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 1.5,
                    bgcolor: pal.subCardBg,
                    border: `1px solid ${pal.border}`,
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 700, color: pal.inkPrimary, mb: 0.5 }}>
                    127.0.0.1:8102 is offline or unreachable from this host
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: pal.inkSecondary }}>
                    Launch locally with <code>python3 server.py --port 8102</code> inside <code>sovereign-agent-bridge</code> to inspect live sessions and claim locks here via Studio&apos;s same-origin proxy.
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${pal.border}` }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: pal.inkMuted, mb: 0.75 }}>
                  UNIX DOMAIN SOCKETS (/run/zoth &amp; $XDG_RUNTIME_DIR/zoth)
                </Typography>
                {unixSockets.length === 0 ? (
                  <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: pal.inkSecondary }}>
                    0 active Unix domain sockets detected (reported truthfully without fabrication).
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {unixSockets.map((s) => (
                      <Typography key={s.path} sx={{ fontFamily: mono, fontSize: '0.74rem', color: pal.emerald }}>
                        ● {s.path}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Offline-Capable HKDF-SHA256 / HMAC-SHA256 Envelope Inspector */}
          <Grid xs={12} lg={7}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                bgcolor: pal.surfaceBg,
                border: `1px solid ${pal.border}`,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon sx={{ fontSize: 18, color: pal.gold }} />
                  <Typography
                    component="h3"
                    sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 800, color: pal.inkPrimary }}
                  >
                    3B. HKDF-SHA256 / HMAC-SHA256 ENVELOPE INSPECTOR
                  </Typography>
                </Box>
                <Chip
                  label={`${envelopeAudit.passedCount}/${envelopeAudit.totalChecks} SCHEMA CHECKS`}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    bgcolor: envelopeAudit.valid ? pal.emeraldBg : pal.amberBg,
                    color: envelopeAudit.valid ? pal.emerald : pal.amber,
                  }}
                />
              </Box>

              <Grid container spacing={1.5}>
                <Grid xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Shared Signing Key (Test Material)"
                    value={envSecret}
                    onChange={(e) => setEnvSecret(e.target.value)}
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Replay Nonce (Hex)"
                      value={envNonce}
                      onChange={(e) => setEnvNonce(e.target.value)}
                      sx={inputSx}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEnvNonce(generateHexNonce(12));
                        setEnvTimestamp(String(Math.floor(Date.now() / 1000)));
                      }}
                      sx={{
                        minHeight: 44,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: pal.inkPrimary,
                        borderColor: pal.border,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      New Nonce
                    </Button>
                  </Box>
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unix Epoch Timestamp"
                    value={envTimestamp}
                    onChange={(e) => setEnvTimestamp(e.target.value)}
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="HMAC-SHA256 Signature (64-hex)"
                    value={envSignature}
                    onChange={(e) => setEnvSignature(e.target.value)}
                    placeholder="Click Sign Envelope to compute real WebCrypto MAC"
                    sx={inputSx}
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    label="Canonical Envelope Payload (JSON or UTF-8)"
                    value={envPayload}
                    onChange={(e) => setEnvPayload(e.target.value)}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.75 }}>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={envBusy}
                  onClick={handleSignEnvelope}
                  startIcon={<SecurityIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: pal.gold,
                    color: pal.goldOnSolid,
                    '&:hover': { bgcolor: pal.gold, opacity: 0.92 },
                  }}
                >
                  Sign Envelope (HMAC-SHA256)
                </Button>
                <Button
                  variant="outlined"
                  disabled={envBusy || !envSignature}
                  onClick={handleVerifyEnvelope}
                  startIcon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: pal.emerald,
                    borderColor: pal.emeraldBorder,
                    bgcolor: pal.emeraldBg,
                    '&.Mui-disabled': {
                      color: pal.inkSecondary,
                      borderColor: pal.border,
                      bgcolor: pal.subCardBg,
                    },
                  }}
                >
                  Verify MAC
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    copy(
                      JSON.stringify(
                        {
                          algorithm: 'HKDF-SHA256 / HMAC-SHA256',
                          timestamp: envTimestamp,
                          nonce: envNonce,
                          signatureHex: envSignature,
                          payload: envPayload,
                        },
                        null,
                        2
                      ),
                      'envelope'
                    )
                  }
                  startIcon={copied === 'envelope' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: pal.inkPrimary,
                    borderColor: pal.border,
                  }}
                >
                  {copied === 'envelope' ? 'Copied Envelope' : 'Copy Envelope JSON'}
                </Button>
              </Box>

              {envVerifyResult && (
                <Alert
                  severity={envVerifyResult.verified ? 'success' : 'error'}
                  sx={{
                    mt: 1.5,
                    bgcolor: envVerifyResult.verified ? pal.emeraldBg : pal.crimsonBg,
                    color: envVerifyResult.verified ? pal.emerald : pal.crimson,
                    border: `1px solid ${pal.border}`,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                  }}
                >
                  {envVerifyResult.reason}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                {envelopeAudit.checks.map((c) => (
                  <Chip
                    key={c.id}
                    label={`${c.pass ? '✓' : '✕'} ${c.label}`}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: c.pass ? pal.emeraldBg : pal.amberBg,
                      color: c.pass ? pal.emerald : pal.amber,
                      border: `1px solid ${pal.border}`,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* SECTION 4: Filterable Real Event Stream & Sanitized Diagnostic Exports */}
        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            bgcolor: pal.surfaceBg,
            border: `1px solid ${pal.border}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.25,
              mb: 1.75,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TerminalIcon sx={{ fontSize: 18, color: pal.sky }} />
              <Typography
                component="h3"
                sx={{ fontFamily: mono, fontSize: '0.84rem', fontWeight: 800, color: pal.inkPrimary }}
              >
                4. NOC EVENT STREAM &amp; DIAGNOSTIC EXPORTS
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => downloadJson(JSON.parse(exportBusReportJson(currentSnapshot)), `zoth-bus-noc-${Date.now()}.json`)}
                startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: pal.inkPrimary,
                  borderColor: pal.border,
                }}
              >
                Export JSON
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => downloadText(exportBusReportCsv(currentSnapshot), `zoth-bus-noc-${Date.now()}.csv`, 'text/csv;charset=utf-8')}
                startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: pal.inkPrimary,
                  borderColor: pal.border,
                }}
              >
                Export CSV
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => downloadText(exportBusReportMarkdown(currentSnapshot), `zoth-bus-noc-${Date.now()}.md`, 'text/markdown;charset=utf-8')}
                startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: pal.inkPrimary,
                  borderColor: pal.border,
                }}
              >
                Export Markdown
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => copy(exportBusReportJson(currentSnapshot), 'report')}
                startIcon={copied === 'report' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
                sx={{
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: pal.gold,
                  borderColor: pal.borderStrong,
                  bgcolor: pal.goldBg,
                }}
              >
                {copied === 'report' ? 'Copied JSON' : 'Copy Snapshot'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
            {['ALL', 'SWEEP', 'PING', 'CRYPTO', 'ERROR'].map((cat) => {
              const active = eventFilter === cat;
              return (
                <Button
                  key={cat}
                  size="small"
                  variant={active ? 'contained' : 'outlined'}
                  disableElevation
                  onClick={() => setEventFilter(cat)}
                  sx={{
                    minHeight: 44,
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: active ? pal.sky : 'transparent',
                    color: active ? (isDark ? '#06131C' : '#FFFFFF') : pal.inkPrimary,
                    borderColor: active ? pal.sky : pal.border,
                  }}
                >
                  {cat}
                </Button>
              );
            })}
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: pal.codeBg,
              border: `1px solid ${pal.border}`,
              maxHeight: 240,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
            }}
          >
            {filteredEvents.length === 0 ? (
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: pal.inkSecondary }}>
                No recorded events in this filter yet. Run a live sweep, ping a loopback port, or sign an envelope above.
              </Typography>
            ) : (
              filteredEvents.map((ev) => {
                const badgeColor =
                  ev.severity === 'OK'
                    ? pal.emerald
                    : ev.severity === 'ERR'
                    ? pal.crimson
                    : ev.severity === 'WARN'
                    ? pal.amber
                    : pal.sky;
                return (
                  <Box
                    key={ev.id}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: pal.surfaceBg,
                      borderLeft: `3px solid ${badgeColor}`,
                      borderTop: `1px solid ${pal.border}`,
                      borderRight: `1px solid ${pal.border}`,
                      borderBottom: `1px solid ${pal.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.25 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: badgeColor }}>
                        [{ev.category}]
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: pal.inkMuted }}>
                        {ev.ts} UTC
                      </Typography>
                    </Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: pal.inkPrimary }}>
                      {ev.message}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
