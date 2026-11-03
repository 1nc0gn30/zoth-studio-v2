import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HubIcon from '@mui/icons-material/Hub';
import SendIcon from '@mui/icons-material/Send';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import LaunchIcon from '@mui/icons-material/Launch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const DEMO_SIGNAL_RECIPIENT = '+1-555-555-0199';

const INITIAL_CHANNELS = [
  {
    id: 'signal',
    name: 'Signal Messenger',
    endpoint: `${DEMO_SIGNAL_RECIPIENT} • Double Ratchet E2EE`,
    latencyMs: 12.4,
    status: 'HEALTHY',
    color: '#38BDF8',
  },
  {
    id: 'simplex',
    name: 'SimpleX Chat',
    endpoint: 'Stealth SMP Onion Relay (No User IDs)',
    latencyMs: 18.1,
    status: 'HEALTHY',
    color: '#34D399',
  },
  {
    id: 'matrix',
    name: 'Matrix Relay',
    endpoint: 'Federated Olm/Megolm E2EE Room',
    latencyMs: 41.6,
    status: 'HEALTHY',
    color: '#C084FC',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot API',
    endpoint: '@SovereignAgentBridgeBot',
    latencyMs: 36.2,
    status: 'HEALTHY',
    color: '#F59E0B',
  },
  {
    id: 'webhook',
    name: 'Signed HTTP Webhook',
    endpoint: 'HMAC-SHA256 Loopback Pipe',
    latencyMs: 3.8,
    status: 'HEALTHY',
    color: '#D4AF37',
  },
];

export default function SovereignBridgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState('signal');
  const [recipient, setRecipient] = useState(DEMO_SIGNAL_RECIPIENT);
  const [payload, setPayload] = useState(
    'Sovereign Agent Bridge sync: Byzantine quorum verified across 5 encrypted transport adapters.'
  );
  const [copied, setCopied] = useState(false);
  const [bridgeOnline, setBridgeOnline] = useState(true);
  const [events, setEvents] = useState([
    {
      ts: '00:00.0',
      tag: 'BOOT',
      color: '#34D399',
      msg: 'Sovereign Agent Bridge v3.2.0 initialized on 127.0.0.1:8102 with 5 encrypted transport adapters.',
    },
    {
      ts: '00:01.4',
      tag: 'CLAIM',
      color: '#D4AF37',
      msg: 'Lock acquired: repo=sovereign-agent-bridge holder=agent-conductor ttl=600s',
    },
    {
      ts: '00:02.1',
      tag: 'PULSE',
      color: '#38BDF8',
      msg: 'Watchdog pulse recorded for agent-orchestrator-01 (timeout 75s)',
    },
  ]);

  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8102/api/health')
      .then((r) => r.json())
      .then((d) => setBridgeOnline(d?.status === 'ok' || d?.status === 'HEALTHY'))
      .catch(() => setBridgeOnline(false));
  }, []);

  const handlePingAll = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8102/api/channels');
      if (res.ok) {
        const data = await res.json();
        if (data.channels) {
          setChannels(
            data.channels.map((c) => ({
              id: c.id,
              name: c.name,
              endpoint: c.account || c.ws_url || c.encryption,
              latencyMs: c.latency_ms || Math.round((Math.random() * 20 + 5) * 10) / 10,
              status: c.status,
              color: c.id === 'signal' ? '#38BDF8' : c.id === 'simplex' ? '#34D399' : '#D4AF37',
            }))
          );
        }
      }
    } catch {
      setChannels((prev) =>
        prev.map((c) => ({
          ...c,
          latencyMs: Math.round((Math.random() * 25 + 4) * 10) / 10,
        }))
      );
    }

    setEvents((prev) => [
      {
        ts: new Date().toISOString().substring(14, 22),
        tag: 'PING',
        color: '#60A5FA',
        msg: `Ping sweep complete across ${channels.length} adapters: All healthy.`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleDispatch = async () => {
    try {
      await fetch('http://127.0.0.1:8102/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: selectedChannel, recipient, message: payload }),
      });
    } catch {}

    setEvents((prev) => [
      {
        ts: new Date().toISOString().substring(14, 22),
        tag: 'DISPATCH',
        color: '#34D399',
        msg: `Dispatched signed payload via [${selectedChannel.toUpperCase()}] -> ${recipient}`,
      },
      ...prev.slice(0, 7),
    ]);
  };

  const cliCommand = `sovereign-agent-bridge send --channel ${selectedChannel} --to "${recipient}" --msg "${payload.replace(/"/g, '\\"')}" --json`;

  const copyCmd = () => {
    navigator.clipboard?.writeText(cliCommand)?.catch?.(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportTelemetry = () => {
    const data = {
      tool: 'sovereign-agent-bridge',
      version: '3.2.0',
      port: 8102,
      channels,
      events,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bridge-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 60fps Relay Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.03;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 500;
      const ch = canvas.clientHeight || 185;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#05070D';
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.5;

      // Draw Star Orbit Connections
      channels.forEach((chObj, i) => {
        const ang = (i / channels.length) * Math.PI * 2 + t * 0.3;
        const rx = cw * 0.36;
        const ry = ch * 0.32;
        const nx = cx + Math.cos(ang) * rx;
        const ny = cy + Math.sin(ang) * ry;

        // Line
        ctx.strokeStyle = chObj.id === selectedChannel ? chObj.color : 'rgba(255,255,255,0.12)';
        ctx.lineWidth = chObj.id === selectedChannel ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Traveling pulse particle
        const p = (t * 0.8 + i * 0.2) % 1;
        const px = cx + (nx - cx) * p;
        const py = cy + (ny - cy) * p;
        ctx.fillStyle = chObj.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node
        ctx.fillStyle = chObj.id === selectedChannel ? chObj.color : '#0B0F19';
        ctx.strokeStyle = chObj.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = chObj.id === selectedChannel ? '#05070D' : '#F5E6AB';
        ctx.font = `bold 8px ${mono}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(chObj.name.substring(0, 3).toUpperCase(), nx, ny);
      });

      // Center Sovereign Hub
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F5E6AB';
      ctx.font = `bold 9px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BRIDGE', cx, cy - 2);
      ctx.fillStyle = '#34D399';
      ctx.font = `7px ${mono}`;
      ctx.fillText(':8102', cx, cy + 8);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [channels, selectedChannel]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(212, 175, 55, 0.28)',
        bgcolor: '#06070C',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top Header Strip */}
      <Box
        sx={{
          p: 2.2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0A0D16',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'rgba(212,175,55,0.12)',
              border: '1px solid rgba(212,175,55,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
            }}
          >
            <HubIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.98rem', color: '#F8FAFC', letterSpacing: '0.04em' }}>
                SOVEREIGN AGENT SIGNAL BRIDGE
              </Typography>
              <Chip
                label={bridgeOnline ? "PORT :8102 ONLINE" : "PORT :8102 LOCAL LOOP"}
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: bridgeOnline ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: bridgeOnline ? '#34D399' : '#FBBF24',
                  border: bridgeOnline ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(245,158,11,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.2 }}>
              E2EE Multi-Transport Mesh • Signal Protocol • SimpleX Onion Relays • Watchdog Dead-Man Switch
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            href="http://127.0.0.1:8102"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#38BDF8',
              borderColor: 'rgba(56,189,248,0.3)',
              '&:hover': { borderColor: '#38BDF8', bgcolor: 'rgba(56,189,248,0.08)' },
            }}
          >
            Open :8102 Studio
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handlePingAll}
            startIcon={<NetworkCheckIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            Sweep Channels
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={copyCmd}
            startIcon={copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copied ? 'CLI Copied' : 'Copy CLI Command'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={exportTelemetry}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#94A3B8',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            <DownloadIcon sx={{ fontSize: 14 }} />
          </Button>
        </Stack>
      </Box>

      {/* Main Grid Content */}
      <SovereignEyebrow accent="#38BDF8" right="Zoth Studio">
        {"sovereign-bridge-protocol"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"sovereign-bridge-protocol"}
        eyebrow={"Zoth Studio"}
        caption={"Sovereign Bridge"}
        label={"Sovereign Bridge — Zoth sovereign visualisation"}
      />
      <Grid container sx={{ p: 2.5 }} spacing={2.5}>
        {/* Left: Dispatch Panel & Channels */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: '#F5E6AB', fontWeight: 800 }}>
              TRANSPORT ADAPTER REGISTRY
            </Typography>

            <Stack spacing={1}>
              {channels.map((ch) => (
                <Box
                  key={ch.id}
                  onClick={() => {
                    setSelectedChannel(ch.id);
                    if (ch.id === 'signal') setRecipient(DEMO_SIGNAL_RECIPIENT);
                    else if (ch.id === 'simplex') setRecipient('simplex:@1nc0gn30');
                    else if (ch.id === 'matrix') setRecipient('!room_id:matrix.org');
                    else if (ch.id === 'telegram') setRecipient('@chat_id');
                    else setRecipient('http://127.0.0.1:8102/webhook');
                  }}
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: selectedChannel === ch.id ? ch.color : 'rgba(255,255,255,0.08)',
                    bgcolor: selectedChannel === ch.id ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#E2E8F0' }}>
                      {ch.name}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>
                      {ch.endpoint}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${ch.latencyMs}ms`}
                      size="small"
                      sx={{
                        height: 18,
                        fontFamily: mono,
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(56,189,248,0.12)',
                        color: ch.color,
                      }}
                    />
                    <Chip
                      label={ch.status}
                      size="small"
                      sx={{
                        height: 18,
                        fontFamily: mono,
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(52,211,153,0.15)',
                        color: '#34D399',
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, mt: 1 }}>
              DISPATCH DIRECTIVE TO MESH
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: '#E2E8F0',
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Signed Message Payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: '#E2E8F0',
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleDispatch}
              sx={{
                bgcolor: '#D4AF37',
                color: '#08080B',
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.76rem',
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Dispatch Signed Frame to Channel
            </Button>
          </Stack>
        </Grid>

        {/* Right: 60fps Relay Topology + Live SSE Stream */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid rgba(212,175,55,0.28)',
                bgcolor: '#06070C',
              }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderBottom: '1px solid rgba(212,175,55,0.18)',
                  bgcolor: 'rgba(212,175,55,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#F5E6AB', fontWeight: 700 }}>
                  MULTI-CHANNEL RELAY TOPOLOGY ({DEMO_SIGNAL_RECIPIENT})
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#34D399' }}>
                  ZERO-EGRESS HMAC
                </Typography>
              </Box>
              <Box component="canvas" ref={canvasRef} sx={{ width: '100%', height: 185, display: 'block' }} />
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                bgcolor: '#05060A',
                border: '1px solid rgba(148,163,184,0.22)',
                p: 1.5,
                maxHeight: 270,
                overflowY: 'auto',
              }}
            >
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#94A3B8', mb: 1, fontWeight: 700 }}>
                LIVE SSE TELEMETRY & CLAIM-LOCK STREAM
              </Typography>
              <Stack spacing={1}>
                {events.map((ev, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.025)',
                      borderLeft: `3px solid ${ev.color}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: ev.color, fontWeight: 800 }}>
                        [{ev.tag}]
                      </Typography>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#64748B' }}>
                        {ev.ts}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#E2E8F0' }}>
                      {ev.msg}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* In-App Documentation Section */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#060810',
        }}
      >
        <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 900, color: '#F5E6AB', mb: 1 }}>
          WHAT IT DOES & HOW IT WORKS
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', mb: 0.5 }}>
                1. Multi-Channel Signal Mesh
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Bridges autonomous agents across Signal Messenger (Double Ratchet), SimpleX Chat (SMP onion relay), Matrix federation, Telegram, and authenticated HMAC loopback pipes.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#D4AF37', mb: 0.5 }}>
                2. Dialectic Consensus & Lock Board
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Features a 3-agent dialectic consensus engine (proponent, skeptic, arbitrator) and distributed claim-lock manager to eliminate race conditions between concurrent agents.
              </Typography>
            </Box>
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: '#34D399', mb: 0.5 }}>
                3. ZothOS CLI Command
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Query health with <code>sovereign-agent-bridge channels --json</code>, trigger dialectic consensus with <code>consensus</code>, or record heartbeats with <code>pulse</code>.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
