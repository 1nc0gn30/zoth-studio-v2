import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, TextField, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CableIcon from '@mui/icons-material/Cable';
import RouterIcon from '@mui/icons-material/Router';
import HubIcon from '@mui/icons-material/Hub';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function BridgesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.bridge?.up);
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  useEffect(() => {
    if (!up) {
      setInfo(null);
      return;
    }
    fetch('/api/studio/bridge')
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
        setInfo(body);
      })
      .catch((err) => setError(err.message));
  }, [up]);

  const send = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/studio/bridge/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'simplex', message, recipient: 'local', agent_id: 'studio' }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      setResult(body);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* BridgesPage signature: gold top-edge glow */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: 2,
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.9) 20%, #D4AF37 50%, rgba(212,175,55,0.9) 80%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.7) 20%, #B8860B 50%, rgba(184,134,11,0.7) 80%, transparent)',
          boxShadow: isDark
            ? '0 0 18px 2px rgba(212,175,55,0.45)'
            : '0 0 12px 1px rgba(184,134,11,0.35)',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={up ? 'BRIDGE ACTIVE :8789' : 'BRIDGE OFFLINE'}
          size="small"
          sx={{
            bgcolor: up ? gold.wash : (isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2'),
            color: up ? gold.soft : (isDark ? '#FB7185' : '#B42318'),
            border: up ? `1px solid ${isDark ? 'rgba(212,175,55,0.42)' : '#F0E1A8'}` : 'none',
            fontWeight: 800, mb: 1.5,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
          Sovereign Agent <span className="text-gradient-gold">Signal Bridge</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.65, fontSize: '1.05rem' }}>
          The <span className="text-highlight-gold">sovereign-agent-bridge</span> micro-service facilitates real-time inter-process signal routing and event broadcasting between local agents. Operating strictly on <span className="text-highlight-dark">127.0.0.1:8789</span>, it provides low-latency websocket channels and simplex HTTP POST dispatching.
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CableIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Simplex Event Bus</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                High-throughput local IPC stream for broadcasting task states, agent heartbeats, and memory updates across sub-processes.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RouterIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Non-Blocking HTTP API</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                RESTful endpoints for dispatching proposals to the consensus engine and pulling agent status vectors.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HubIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Isolated Port Binding</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Bound strictly to port <span className="text-highlight-gold">8789</span> to avoid collisions with the memory daemon on 8788 and UI on 3000.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dispatch Form */}
      <Box sx={{ mb: 5 }}>
        <Typography className="section-kicker">Interactive Packet Dispatcher</Typography>
        <Box component="form" onSubmit={send} sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type payload string for /api/studio/bridge/send..."
            disabled={!up}
            required
            sx={{ flex: '1 1 340px' }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={!up || !message} sx={{ px: 3 }}>
            Dispatch Packet
          </Button>
        </Box>

        {!up && (
          <Box sx={{ p: 2.5, bgcolor: isDark ? 'rgba(244,63,94,0.10)' : '#FEF3F2', border: `1px solid ${isDark ? 'rgba(244,63,94,0.35)' : '#FECDCA'}`, borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: isDark ? '#FB7185' : '#B42318', fontWeight: 650 }}>
              Signal Bridge is offline. Launch it locally: <span className="text-highlight-dark">node bin/zoth.js up</span>.
            </Typography>
          </Box>
        )}

        {error && <Typography sx={{ color: isDark ? '#FB7185' : '#B42318', mb: 2, fontWeight: 700 }}>Bridge Error: {error}</Typography>}
      </Box>

      {/* Terminal Response Container */}
      <Box>
        <Typography className="section-kicker">Live Response Ledger</Typography>
        <Paper sx={{ p: 3, bgcolor: isDark ? '#0B0B12' : '#0F172A', color: '#F8FAFC', fontFamily: mono, fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', minHeight: 220, borderRadius: 2, border: `1px solid ${isDark ? '#2A2A38' : '#1E293B'}` }}>
          {result
            ? JSON.stringify(result, null, 2)
            : info
              ? JSON.stringify(info, null, 2)
              : up
                ? '// Waiting for bridge response output from 127.0.0.1:8789...'
                : '// Signal Bridge is offline. No packets have been transmitted.'}
        </Paper>
      </Box>
      </Box>
    </Container>
  );
}
