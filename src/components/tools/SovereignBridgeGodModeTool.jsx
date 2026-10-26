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

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';
const DEMO_SIGNAL_RECIPIENT = '+1-555-555-0199';

const INITIAL_CHANNELS = [
  {
    id: 'signal-primary',
    name: 'Signal Messenger',
    endpoint: `${DEMO_SIGNAL_RECIPIENT} • REST Daemon`,
    latencyMs: 12.4,
    status: 'HEALTHY',
    color: '#38BDF8',
  },
  {
    id: 'simplex-stealth',
    name: 'SimpleX Chat',
    endpoint: 'Stealth SMP Relay Node',
    latencyMs: 18.1,
    status: 'HEALTHY',
    color: '#34D399',
  },
  {
    id: 'matrix-federated',
    name: 'Matrix Protocol',
    endpoint: 'Federated E2EE Room',
    latencyMs: 41.6,
    status: 'HEALTHY',
    color: '#C084FC',
  },
  {
    id: 'telegram-relay',
    name: 'Telegram Bot API',
    endpoint: '@SovereignAgentBridgeBot',
    latencyMs: 36.2,
    status: 'HEALTHY',
    color: '#F59E0B',
  },
  {
    id: 'webhook-hmac',
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
  const [selectedChannel, setSelectedChannel] = useState('signal-primary');
  const [recipient, setRecipient] = useState(DEMO_SIGNAL_RECIPIENT);
  const [payload, setPayload] = useState(
    'Sovereign Agent Bridge sync: Byzantine quorum verified across 5 encrypted transport adapters.'
  );
  const [events, setEvents] = useState([
    {
      ts: '00:00.0',
      tag: 'BOOT',
      color: '#34D399',
      msg: 'Sovereign Agent Bridge v1.0 initialized. Listening on 5 encrypted transport adapters.',
    },
    {
      ts: '00:01.4',
      tag: 'CLAIM',
      color: '#D4AF37',
      msg: 'Lock acquired: repo=zoth-studio-v2 holder=agent-conductor ttl=600s',
    },
  ]);

  const canvasRef = useRef(null);

  const handlePingAll = () => {
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        latencyMs: Number((c.latencyMs * (0.88 + Math.random() * 0.24)).toFixed(1)),
      }))
    );
    setEvents((prev) => [
      {
        ts: new Date().toISOString().slice(14, 21),
        tag: 'PING',
        color: '#38BDF8',
        msg: `Latency probe completed across Signal (${DEMO_SIGNAL_RECIPIENT}), SimpleX SMP, Matrix, Telegram, and HMAC pipe.`,
      },
      ...prev.slice(0, 11),
    ]);
  };

  const handleDispatch = () => {
    if (!payload.trim()) return;
    const ch = channels.find((c) => c.id === selectedChannel) || channels[0];
    setEvents((prev) => [
      {
        ts: new Date().toISOString().slice(14, 21),
        tag: ch.name.split(' ')[0].toUpperCase(),
        color: ch.color,
        msg: `[→ ${recipient}] ${payload.trim()} (ACK in ${ch.latencyMs}ms)`,
      },
      ...prev.slice(0, 11),
    ]);
  };

  const handleDialecticConsensus = () => {
    setEvents((prev) => [
      {
        ts: new Date().toISOString().slice(14, 21),
        tag: 'CONSENSUS',
        color: '#C084FC',
        msg: '3-Way Dialectic Synthesis (Proponent × Skeptic × Arbiter): 99.4% Byzantine agreement achieved.',
      },
      ...prev.slice(0, 11),
    ]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const render = () => {
      t += 0.025;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 480;
      const h = canvas.clientHeight || 190;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      channels.forEach((ch, idx) => {
        const angle = (idx / channels.length) * Math.PI * 2 - Math.PI / 2 + t * 0.15;
        const nx = cx + Math.cos(angle) * 125;
        const ny = cy + Math.sin(angle) * 62;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = ch.id === selectedChannel ? ch.color : 'rgba(148,163,184,0.25)';
        ctx.lineWidth = ch.id === selectedChannel ? 2.2 : 1.2;
        ctx.stroke();

        const p = (t * 0.7 + idx * 0.2) % 1;
        const px = cx + (nx - cx) * p;
        const py = cy + (ny - cy) * p;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = ch.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#08090F';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = ch.color;
        ctx.stroke();

        ctx.fillStyle = '#EDEFF2';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${ch.latencyMs}ms`, nx, ny + 3);
      });

      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212,175,55,0.18)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D4AF37';
      ctx.stroke();
      ctx.fillStyle = '#F5E6AB';
      ctx.font = '800 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BRIDGE', cx, cy + 3);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [channels, selectedChannel]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 4,
        borderRadius: 3,
        bgcolor: isDark ? 'rgba(10,12,18,0.92)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.28)'}`,
        boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.65)' : '0 12px 32px rgba(15,23,42,0.06)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Chip
              icon={<HubIcon sx={{ fontSize: '0.95rem !important', color: '#D4AF37 !important' }} />}
              label="SOVEREIGN AGENT BRIDGE · MULTI-CHANNEL WORKSTATION"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(212,175,55,0.14)',
                color: '#F5E6AB',
                border: '1px solid rgba(212,175,55,0.35)',
              }}
            />
            <Chip
              icon={<VerifiedUserIcon sx={{ fontSize: '0.9rem !important', color: '#34D399 !important' }} />}
              label="5 ENCRYPTED ADAPTERS ONLINE"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
                bgcolor: 'rgba(52,211,153,0.14)',
                color: '#34D399',
                border: '1px solid rgba(52,211,153,0.35)',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 400 }}>
            Signal, SimpleX, Matrix &amp; <span style={{ color: '#D4AF37' }}>Byzantine Consensus</span> Relay
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<NetworkCheckIcon />}
            onClick={handlePingAll}
            sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#38BDF8', borderColor: 'rgba(56,189,248,0.4)' }}
          >
            Ping Latencies
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={handleDialecticConsensus}
            sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#C084FC', borderColor: 'rgba(192,132,252,0.4)' }}
          >
            Run 3-Way Consensus
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left: Channel Adapters + Dispatcher */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              {channels.map((c) => (
                <Box
                  key={c.id}
                  onClick={() => setSelectedChannel(c.id)}
                  sx={{
                    p: 1.35,
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor:
                      selectedChannel === c.id
                        ? 'rgba(212,175,55,0.1)'
                        : isDark
                        ? 'rgba(255,255,255,0.025)'
                        : '#F8FAFC',
                    border: `1px solid ${
                      selectedChannel === c.id ? c.color : 'rgba(148,163,184,0.18)'
                    }`,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800 }}>
                      {c.name}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                      {c.endpoint}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${c.latencyMs}ms`}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: c.color,
                      bgcolor: 'rgba(0,0,0,0.35)',
                      border: `1px solid ${c.color}`,
                    }}
                  />
                </Box>
              ))}
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontFamily: mono, fontSize: '0.78rem' }}>Target Transport Adapter</InputLabel>
              <Select
                value={selectedChannel}
                label="Target Transport Adapter"
                onChange={(e) => setSelectedChannel(e.target.value)}
                sx={{ fontFamily: mono, fontSize: '0.8rem' }}
              >
                {channels.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    {c.name} ({c.endpoint})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Recipient / Endpoint Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Signed Message Payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
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
                LIVE SSE TELEMETRY &amp; CLAIM-LOCK STREAM
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
    </Paper>
  );
}
