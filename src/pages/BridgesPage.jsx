import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, TextField } from '@mui/material';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function BridgesPage() {
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.bridge?.up);
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Chip
        label={up ? 'BRIDGE ANSWERING :8789' : 'BRIDGE NOT ANSWERING'}
        size="small"
        sx={{ bgcolor: up ? '#ECFDF3' : '#FEF3F2', color: up ? '#027A48' : '#B42318', fontWeight: 700, mb: 1.5 }}
      />
      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
        Signal bridge
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 740, mb: 3 }}>
        sovereign-agent-bridge serves its own HTTP API. This page shows that response and nothing else. Start it with <Box component="span" sx={{ fontFamily: mono, color: '#8A6A09' }}>npm run zoth -- up</Box>. The studio binds it to 8789 so it does not collide with the memory daemon.
      </Typography>

      <Box component="form" onSubmit={send} sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message for /api/send"
          disabled={!up}
          required
          sx={{ flex: '1 1 320px' }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={!up || !message}>
          Send
        </Button>
      </Box>

      {error && <Typography sx={{ color: '#B42318', mb: 2 }}>{error}</Typography>}

      <Paper sx={{ p: 2.5, bgcolor: '#101828', color: '#E6F4EA', fontFamily: mono, fontSize: '0.82rem', whiteSpace: 'pre-wrap', minHeight: 180 }}>
        {result
          ? JSON.stringify(result, null, 2)
          : info
            ? JSON.stringify(info, null, 2)
            : up
              ? 'Waiting for /api/health…'
              : 'Bridge is down. No packets have been sent from this page.'}
      </Paper>
    </Container>
  );
}
