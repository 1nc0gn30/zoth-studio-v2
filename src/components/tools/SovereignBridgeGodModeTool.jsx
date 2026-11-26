import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HubIcon from '@mui/icons-material/Hub';
import SendIcon from '@mui/icons-material/Send';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import LaunchIcon from '@mui/icons-material/Launch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';
import { useCopy, downloadJson } from '../sovereign/hooks.js';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
import { normalizeBridgeChannels } from '../../utils/busMonitorEngine';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const DEFAULT_ADAPTERS = normalizeBridgeChannels([
  {
    id: 'signal',
    type: 'signal',
    name: 'Signal Messenger',
    endpoint: 'Local Signal adapter (configure in :8102)',
    encryption: 'HKDF-SHA256 / HMAC-SHA256',
    status: 'UNPROBED',
    latencyMs: null,
  },
  {
    id: 'simplex',
    type: 'simplex',
    name: 'SimpleX Chat',
    endpoint: '127.0.0.1:5225 SMP local CLI relay',
    encryption: 'SMP Queue + HKDF-SHA256',
    status: 'UNPROBED',
    latencyMs: null,
  },
  {
    id: 'matrix',
    type: 'matrix',
    name: 'Matrix Relay',
    endpoint: 'Local Matrix homeserver bridge',
    encryption: 'HKDF-SHA256 / HMAC-SHA256',
    status: 'UNPROBED',
    latencyMs: null,
  },
  {
    id: 'telegram',
    type: 'telegram',
    name: 'Telegram Bot API',
    endpoint: 'Opt-in bot adapter',
    encryption: 'HKDF-SHA256 / HMAC-SHA256',
    status: 'UNPROBED',
    latencyMs: null,
  },
  {
    id: 'webhook',
    type: 'webhook',
    name: 'Signed HTTP Webhook',
    endpoint: 'http://127.0.0.1:8102/webhook',
    encryption: 'HMAC-SHA256 Loopback Pipe',
    status: 'UNPROBED',
    latencyMs: null,
  },
]);

function defaultRecipientForChannel(channelId) {
  if (channelId === 'signal') return 'signal-recipient-handle';
  if (channelId === 'simplex') return 'simplex-local-contact';
  if (channelId === 'matrix') return '!room_id:localhost';
  if (channelId === 'telegram') return '@bot_chat_id';
  return 'http://127.0.0.1:8102/webhook';
}

export default function SovereignBridgeGodModeTool({ tool }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isZothRelay = (tool?.id || '') === 'zoth-relay';
  const { copied, copy } = useCopy(2000);

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
        canvasBg: '#0A0D16',
        canvasHubFill: '#121520',
        canvasNodeFill: '#11141D',
        canvasText: '#F5F1E6',
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
      canvasBg: '#F3EFE6',
      canvasHubFill: '#FFFFFF',
      canvasNodeFill: '#FFFFFF',
      canvasText: '#101828',
    };
  }, [isDark]);

  const [channels, setChannels] = useState(DEFAULT_ADAPTERS);
  const [selectedChannel, setSelectedChannel] = useState(isZothRelay ? 'webhook' : 'signal');
  const [recipient, setRecipient] = useState(
    isZothRelay ? 'http://127.0.0.1:8102/webhook' : defaultRecipientForChannel('signal')
  );
  const [payload, setPayload] = useState(
    isZothRelay
      ? 'Zoth Relay HMAC-SHA256 loopback webhook verification frame.'
      : 'Sovereign Agent Bridge loopback verification message.'
  );
  const [bridgeOnline, setBridgeOnline] = useState(false);
  const [bridgeVersion, setBridgeVersion] = useState(null);
  const [agentMesh, setAgentMesh] = useState(null);
  const [busTarget, setBusTarget] = useState('local-agent-peer');
  const [busSubject, setBusSubject] = useState('Loopback Bus Handoff');
  const [busBody, setBusBody] = useState('Shared workspace verification ready for peer review.');
  const [events, setEvents] = useState([]);

  const canvasRef = useRef(null);

  const appendEvent = useCallback((tag, toneKey, msg) => {
    setEvents((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        ts: new Date().toISOString().slice(11, 23),
        tag,
        toneKey,
        msg,
      },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const fetchAgentMesh = useCallback(async () => {
    if (!isLocalRuntime()) return;
    try {
      const r = await fetch('/api/studio/bridge/live', { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const d = await r.json();
        setAgentMesh(d);
      }
    } catch {
      // Offline or unreachable — leave state honest
    }
  }, []);

  const fetchBridgeSummary = useCallback(async () => {
    if (!isLocalRuntime()) {
      setBridgeOnline(false);
      return;
    }
    try {
      const r = await fetch('/api/studio/bridge', { headers: { Accept: 'application/json' } });
      if (!r.ok) {
        setBridgeOnline(false);
        return;
      }
      const d = await r.json();
      setBridgeOnline(Boolean(d?.health?.status === 'ok' || d?.health?.status === 'HEALTHY'));
      setBridgeVersion(d?.health?.version || null);
      if (Array.isArray(d?.channels?.channels)) {
        setChannels(normalizeBridgeChannels(d.channels.channels));
      }
    } catch {
      setBridgeOnline(false);
    }
  }, []);

  useEffect(() => {
    const chId = isZothRelay ? 'webhook' : 'signal';
    setSelectedChannel(chId);
    setRecipient(defaultRecipientForChannel(chId));
  }, [isZothRelay]);

  useEffect(() => {
    if (!isLocalRuntime()) {
      setBridgeOnline(false);
      return undefined;
    }
    fetchBridgeSummary();
    fetchAgentMesh();
    const id = setInterval(fetchAgentMesh, 8000);
    return () => clearInterval(id);
  }, [fetchBridgeSummary, fetchAgentMesh]);

  const handleSendAgentBus = async () => {
    if (!isLocalRuntime()) {
      appendEvent('OFFLINE', 'crimson', 'Cross-agent handoff requires local Zoth Studio (:3000) + Bridge (:8102).');
      return;
    }
    try {
      const res = await fetch('/api/studio/bridge/agents/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'zoth-studio-operator',
          recipient: busTarget,
          subject: busSubject,
          body: busBody,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        appendEvent('ERROR', 'crimson', `Handoff failed (HTTP ${res.status}): ${errBody.error || 'Bridge offline'}`);
        return;
      }
      await fetchAgentMesh();
      appendEvent('HANDOFF', 'gold', `Delivered cross-agent message -> ${busTarget}: ${busSubject}`);
    } catch (err) {
      appendEvent('ERROR', 'crimson', `Handoff network error: ${err.message}`);
    }
  };

  const handlePingAll = async () => {
    if (!isLocalRuntime()) {
      appendEvent('OFFLINE', 'amber', 'Cannot sweep :8102 adapters from a static remote host.');
      return;
    }
    try {
      const res = await fetch('/api/studio/bridge', { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        setBridgeOnline(false);
        appendEvent('ERROR', 'crimson', `Bridge sweep failed (HTTP ${res.status}): 127.0.0.1:8102 offline.`);
        return;
      }
      const data = await res.json();
      setBridgeOnline(true);
      setBridgeVersion(data?.health?.version || null);
      const raw = data?.channels?.channels;
      if (Array.isArray(raw)) {
        const normalized = normalizeBridgeChannels(raw);
        setChannels(normalized);
        const mockCount = normalized.filter((c) => c.isStaticMock).length;
        appendEvent(
          'SWEEP',
          'sky',
          `Loaded ${normalized.length} adapters from :8102 via Studio proxy${mockCount > 0 ? ` (${mockCount} static adapter metadata entries)` : ''}.`
        );
      } else {
        appendEvent('SWEEP', 'amber', 'Bridge responded, but /api/channels returned no adapter array.');
      }
    } catch (err) {
      setBridgeOnline(false);
      appendEvent('ERROR', 'crimson', `Bridge sweep error: ${err.message}`);
    }
  };

  const handleDispatch = async () => {
    if (!isLocalRuntime()) {
      appendEvent('OFFLINE', 'crimson', 'Dispatch requires local Zoth Studio (:3000) proxying 127.0.0.1:8102.');
      return;
    }
    try {
      const res = await fetch('/api/studio/bridge/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: selectedChannel, recipient, message: payload }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        appendEvent('ERROR', 'crimson', `Dispatch rejected (HTTP ${res.status}): ${errBody.error || 'Bridge offline'}`);
        return;
      }
      appendEvent('DISPATCH', 'emerald', `Dispatched signed frame via [${selectedChannel.toUpperCase()}] -> ${recipient}`);
    } catch (err) {
      appendEvent('ERROR', 'crimson', `Dispatch error: ${err.message}`);
    }
  };

  const cliCommand = `sovereign-agent-bridge send --channel ${selectedChannel} --to "${recipient}" --msg "${payload.replace(/"/g, '\\"')}" --json`;

  const exportTelemetry = () => {
    downloadJson(
      {
        tool: 'sovereign-agent-bridge',
        bridgeVersion: bridgeVersion || 'offline',
        port: 8102,
        bridgeOnline,
        channels,
        events,
        exportedAt: new Date().toISOString(),
      },
      `bridge-telemetry-${Date.now()}.json`
    );
  };

  // Dual-Theme Relay Topology Canvas (unique 4-char adapter codes: SGNL, SMPX, MTRX, TGRM, HOOK)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 500;
      const ch = canvas.clientHeight || 190;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = pal.canvasBg;
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.5;

      channels.forEach((chObj, i) => {
        const ang = (i / Math.max(1, channels.length)) * Math.PI * 2 + t * 0.25;
        const rx = cw * 0.35;
        const ry = ch * 0.33;
        const nx = cx + Math.cos(ang) * rx;
        const ny = cy + Math.sin(ang) * ry;
        const nodeColor = isDark ? chObj.color : chObj.colorLight || pal.gold;
        const isSelected = chObj.id === selectedChannel;

        ctx.strokeStyle = isSelected ? nodeColor : pal.border;
        ctx.lineWidth = isSelected ? 2 : 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        const p = (t * 0.65 + i * 0.2) % 1;
        const px = cx + (nx - cx) * p;
        const py = cy + (ny - cy) * p;
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isSelected ? nodeColor : pal.canvasNodeFill;
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(nx, ny, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? (isDark ? '#08080B' : '#FFFFFF') : pal.canvasText;
        ctx.font = `bold 8px ${mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chObj.code || chObj.id.slice(0, 4).toUpperCase(), nx, ny);
      });

      ctx.fillStyle = pal.canvasHubFill;
      ctx.strokeStyle = pal.gold;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pal.gold;
      ctx.font = `bold 9px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BRIDGE', cx, cy - 3);
      ctx.fillStyle = bridgeOnline ? pal.emerald : pal.inkMuted;
      ctx.font = `bold 7.5px ${mono}`;
      ctx.fillText(':8102', cx, cy + 8);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [channels, selectedChannel, isDark, pal, bridgeOnline]);

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
      fontSize: '0.8rem',
      color: pal.inkPrimary,
      bgcolor: pal.codeBg,
      minHeight: 44,
      '& fieldset': { borderColor: pal.border },
      '&:hover fieldset': { borderColor: pal.gold },
      '&.Mui-focused fieldset': { borderColor: pal.gold },
    },
    '& .MuiInputBase-input': {
      minHeight: 44,
      boxSizing: 'border-box',
      py: 1.25,
    },
  };

  const resolveToneColor = (toneKey) => pal[toneKey] || pal.sky;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1px solid ${pal.borderStrong}`,
        bgcolor: pal.shellBg,
        color: pal.inkPrimary,
      }}
    >
      {/* Top Header Strip */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderBottom: `1px solid ${pal.border}`,
          bgcolor: pal.surfaceBg,
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
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: pal.goldBg,
              border: `1px solid ${pal.borderStrong}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: pal.gold,
              flexShrink: 0,
            }}
          >
            <HubIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.96rem', color: pal.inkPrimary, letterSpacing: '0.03em' }}>
                {isZothRelay ? 'ZOTH RELAY — HMAC LOOPBACK & WEBHOOK TUNNEL' : 'SOVEREIGN AGENT SIGNAL BRIDGE'}
              </Typography>
              <Chip
                label={bridgeOnline ? `PORT :8102 ONLINE${bridgeVersion ? ` (v${bridgeVersion})` : ''}` : 'DAEMON OFFLINE / LOCAL PROXY READY'}
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: bridgeOnline ? pal.emeraldBg : pal.skyBg,
                  color: bridgeOnline ? pal.emerald : pal.sky,
                  border: `1px solid ${pal.border}`,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: pal.inkSecondary, display: 'block', mt: 0.35 }}>
              {isZothRelay
                ? 'HMAC-SHA256 Signed Webhook Pipe · Replay-Protected Nonces · Zero-DNS Loopback Relay'
                : 'Python Stdlib Loopback Daemon (:8102) · HKDF-SHA256 / HMAC-SHA256 Envelopes · Same-Origin Studio Proxy'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {isLocalRuntime() && (
            <Button
              size="small"
              variant="outlined"
              href="http://127.0.0.1:8102"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<LaunchIcon sx={{ fontSize: 15 }} />}
              sx={{
                minHeight: 44,
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'none',
                color: pal.sky,
                borderColor: pal.border,
                bgcolor: pal.skyBg,
              }}
            >
              Open :8102 Bridge
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            onClick={handlePingAll}
            startIcon={<NetworkCheckIcon sx={{ fontSize: 15 }} />}
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
            Sweep Channels
          </Button>

          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={() => copy(cliCommand, 'cli')}
            startIcon={copied === 'cli' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              minHeight: 44,
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: pal.gold,
              color: pal.goldOnSolid,
              '&:hover': { bgcolor: pal.gold, opacity: 0.92 },
            }}
          >
            {copied === 'cli' ? 'CLI Copied' : 'Copy CLI Command'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            aria-label="Download telemetry JSON"
            onClick={exportTelemetry}
            sx={{
              minHeight: 44,
              minWidth: 44,
              fontFamily: mono,
              color: pal.inkPrimary,
              borderColor: pal.border,
            }}
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
          </Button>
        </Box>
      </Box>

      <SovereignEyebrow accent={pal.sky} right="Zoth Studio">
        {'sovereign-bridge-protocol'}
      </SovereignEyebrow>
      <SovereignBand
        seed={'sovereign-bridge-protocol'}
        eyebrow={'Zoth Studio'}
        caption={'Sovereign Bridge'}
        label={'Sovereign Bridge — Zoth sovereign visualisation'}
      />

      <Grid container sx={{ p: { xs: 2, md: 2.5 } }} spacing={2.5}>
        {/* Left: Dispatch Panel & Channels */}
        <Grid xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: pal.gold, fontWeight: 800 }}>
              TRANSPORT ADAPTER REGISTRY
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {channels.map((ch) => {
                const active = selectedChannel === ch.id;
                const accentCol = isDark ? ch.color : ch.colorLight || pal.gold;
                return (
                  <Box
                    key={ch.id}
                    component="button"
                    type="button"
                    onClick={() => {
                      setSelectedChannel(ch.id);
                      setRecipient(defaultRecipientForChannel(ch.id));
                    }}
                    sx={{
                      width: '100%',
                      minHeight: 52,
                      textAlign: 'left',
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: active ? accentCol : pal.border,
                      bgcolor: active ? pal.surfaceBg : pal.subCardBg,
                      cursor: 'pointer',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: pal.inkPrimary }}>
                        [{ch.code}] {ch.name}
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: pal.inkSecondary }}>
                        {ch.endpoint}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                      <Chip
                        label={ch.latencyMs != null ? `${ch.latencyMs}ms` : 'N/A'}
                        size="small"
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          bgcolor: pal.skyBg,
                          color: pal.sky,
                        }}
                      />
                      <Chip
                        label={ch.isStaticMock ? 'STATIC METADATA' : ch.status}
                        size="small"
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          bgcolor: ch.isStaticMock ? pal.amberBg : pal.emeraldBg,
                          color: ch.isStaticMock ? pal.amber : pal.emerald,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: pal.inkSecondary, fontWeight: 800, mt: 0.5 }}>
              DISPATCH DIRECTIVE VIA STUDIO PROXY
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              sx={inputSx}
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Signed Message Payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              sx={inputSx}
            />

            <Button
              variant="contained"
              disableElevation
              startIcon={<SendIcon />}
              onClick={handleDispatch}
              sx={{
                minHeight: 44,
                bgcolor: pal.gold,
                color: pal.goldOnSolid,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.76rem',
                textTransform: 'none',
                '&:hover': { bgcolor: pal.gold, opacity: 0.92 },
              }}
            >
              Dispatch Frame via /api/studio/bridge/send
            </Button>
          </Box>
        </Grid>

        {/* Right: Dual-Theme Relay Topology + Honest Telemetry Log */}
        <Grid xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${pal.borderStrong}`,
                bgcolor: pal.surfaceBg,
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.85,
                  borderBottom: `1px solid ${pal.border}`,
                  bgcolor: pal.goldBg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: pal.gold, fontWeight: 800 }}>
                  MULTI-CHANNEL RELAY TOPOLOGY
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: pal.emerald, fontWeight: 700 }}>
                  HKDF-SHA256 / HMAC
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 190, display: 'block' }} />
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                bgcolor: pal.surfaceBg,
                border: `1px solid ${pal.border}`,
                p: 1.75,
                maxHeight: 270,
                overflowY: 'auto',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: pal.inkSecondary, mb: 1, fontWeight: 800 }}>
                BRIDGE TELEMETRY &amp; EVENT LOG
              </Typography>
              {events.length === 0 ? (
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: pal.inkMuted }}>
                  No bridge actions recorded in this session yet. Click &ldquo;Sweep Channels&rdquo; or dispatch a frame.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {events.map((ev) => {
                    const c = resolveToneColor(ev.toneKey);
                    return (
                      <Box
                        key={ev.id}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: pal.codeBg,
                          borderLeft: `3px solid ${c}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.25 }}>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: c, fontWeight: 800 }}>
                            [{ev.tag}]
                          </Typography>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: pal.inkMuted }}>
                            {ev.ts} UTC
                          </Typography>
                        </Box>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: pal.inkPrimary }}>
                          {ev.msg}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Full-Width Row: Live Cross-Agent Mesh Radar */}
        <Grid xs={12}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: pal.surfaceBg,
              border: `1px solid ${pal.borderStrong}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: pal.gold }}>
                CROSS-AGENT MESH RADAR (LOCAL SESSIONS &amp; TOOL GATEKEEPER)
              </Typography>
              <Chip
                label={
                  agentMesh?.summary
                    ? `${agentMesh.summary.muse_sessions_count} MUSE · ${agentMesh.summary.antigravity_sessions_count} AGY`
                    : bridgeOnline
                    ? 'WAITING FOR SESSION POLL...'
                    : 'DAEMON :8102 OFFLINE'
                }
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: agentMesh?.summary ? pal.emeraldBg : pal.subCardBg,
                  color: agentMesh?.summary ? pal.emerald : pal.inkSecondary,
                  border: `1px solid ${pal.border}`,
                }}
              />
            </Box>

            <Grid container spacing={2}>
              {/* Active Agent Cards */}
              <Grid xs={12} md={7}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {(agentMesh?.muse_sessions || []).slice(0, 2).map((m) => (
                    <Box
                      key={m.session_id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: pal.subCardBg,
                        borderLeft: `3px solid ${pal.gold}`,
                        borderTop: `1px solid ${pal.border}`,
                        borderRight: `1px solid ${pal.border}`,
                        borderBottom: `1px solid ${pal.border}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: pal.inkPrimary }}>
                          [MUSE] {m.short_id} · {m.model}
                        </Typography>
                        <Chip
                          label={`${m.status} · PID ${m.pid || 'IDLE'}`}
                          size="small"
                          sx={{ fontFamily: mono, fontSize: '0.64rem', bgcolor: pal.goldBg, color: pal.gold }}
                        />
                      </Box>
                    </Box>
                  ))}

                  {(agentMesh?.antigravity_sessions || []).slice(0, 2).map((a) => (
                    <Box
                      key={a.session_id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: pal.subCardBg,
                        border: `1px solid ${pal.border}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: pal.sky }}>
                          [ANTIGRAVITY] {a.short_id} · Step {a.step_index}
                        </Typography>
                        <Chip
                          label={`${a.status} · ${a.last_active_ago_sec}s ago`}
                          size="small"
                          sx={{ fontFamily: mono, fontSize: '0.64rem', bgcolor: pal.skyBg, color: pal.sky }}
                        />
                      </Box>
                    </Box>
                  ))}

                  {(!agentMesh || ((agentMesh.muse_sessions || []).length === 0 && (agentMesh.antigravity_sessions || []).length === 0)) && (
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: pal.inkSecondary }}>
                      No live local sessions reported by /api/studio/bridge/live.
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Cross-Agent Handoff Dispatcher */}
              <Grid xs={12} md={5}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: pal.subCardBg,
                    border: `1px solid ${pal.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: pal.emerald }}>
                    POST CROSS-AGENT HANDOFF
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Target Agent"
                    value={busTarget}
                    onChange={(e) => setBusTarget(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Subject"
                    value={busSubject}
                    onChange={(e) => setBusSubject(e.target.value)}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    label="Handoff Message & Artifact Paths"
                    value={busBody}
                    onChange={(e) => setBusBody(e.target.value)}
                    sx={inputSx}
                  />
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={handleSendAgentBus}
                    sx={{
                      minHeight: 44,
                      bgcolor: pal.emerald,
                      color: isDark ? '#06130E' : '#FFFFFF',
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      '&:hover': { bgcolor: pal.emerald, opacity: 0.92 },
                    }}
                  >
                    Post Handoff to Shared Agent Bus
                  </Button>
                </Box>
              </Grid>

              {/* AI Tool Gatekeeper Policy Strip */}
              <Grid xs={12}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: pal.subCardBg,
                    border: `1px solid ${pal.border}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: pal.gold }}>
                      AI TOOL GATEKEEPER POLICY (CLICK TO TOGGLE VIA STUDIO PROXY)
                    </Typography>
                    <Chip
                      label={`${(agentMesh?.tool_policies || []).filter((p) => p.enabled).length}/${(agentMesh?.tool_policies || []).length} ALLOWED`}
                      size="small"
                      sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700, bgcolor: pal.emeraldBg, color: pal.emerald }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(agentMesh?.tool_policies || []).map((p) => (
                      <Button
                        key={p.tool_name}
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/studio/bridge/agents/policy', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tool_name: p.tool_name, enabled: !p.enabled }),
                            });
                            if (!res.ok) {
                              appendEvent('ERROR', 'crimson', `Policy toggle failed for ${p.tool_name} (HTTP ${res.status}).`);
                              return;
                            }
                            await fetchAgentMesh();
                            appendEvent('POLICY', 'gold', `${p.tool_name} -> ${!p.enabled ? 'ALLOWED' : 'LOCKED'}`);
                          } catch (err) {
                            appendEvent('ERROR', 'crimson', `Policy toggle error: ${err.message}`);
                          }
                        }}
                        sx={{
                          minHeight: 44,
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          bgcolor: p.enabled ? pal.emeraldBg : pal.crimsonBg,
                          color: p.enabled ? pal.emerald : pal.crimson,
                          borderColor: p.enabled ? pal.emeraldBorder : pal.border,
                        }}
                      >
                        {p.tool_name.toUpperCase()} · {p.enabled ? 'VIA BRIDGE' : 'LOCKED'} ({p.total_runs})
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* In-App Documentation Section */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderTop: `1px solid ${pal.border}`,
          bgcolor: pal.surfaceBg,
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 800, color: pal.gold, mb: 1.25 }}>
          WHAT IT DOES &amp; HOW IT WORKS
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: pal.subCardBg, border: `1px solid ${pal.border}`, height: '100%' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: pal.sky, mb: 0.5 }}>
                1. Loopback Signal Bridge (:8102)
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: pal.inkSecondary, lineHeight: 1.55 }}>
                Runs a zero-dependency Python stdlib HTTP daemon (`python3 server.py --port 8102`) with HKDF-SHA256 / SHA256-CTR / HMAC-SHA256 envelope signing.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: pal.subCardBg, border: `1px solid ${pal.border}`, height: '100%' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: pal.gold, mb: 0.5 }}>
                2. Same-Origin Studio Proxy (:3000)
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: pal.inkSecondary, lineHeight: 1.55 }}>
                Routes bridge queries and writes through Studio&apos;s hardened `/api/studio/bridge*` endpoints with strict 403 rejection on untrusted Host or Origin headers.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: pal.subCardBg, border: `1px solid ${pal.border}`, height: '100%' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: pal.emerald, mb: 0.5 }}>
                3. ZothOS CLI Commands
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: pal.inkSecondary, lineHeight: 1.55 }}>
                Inspect adapters with <code>sovereign-agent-bridge channels --json</code>, check health at <code>/api/health</code>, or launch the NOC at <code>zoth open bus-monitor</code>.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
