import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, TextField } from '@mui/material';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function ConsensusPage() {
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.bridge?.up);
  const [proposal, setProposal] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/studio/bridge/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal,
          proponent: 'AZOTH',
          skeptic: 'KAI',
          arbitrator: 'DRACO',
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      setResult(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Chip
        label={up ? 'BRIDGE CONSENSUS API' : 'BRIDGE REQUIRED'}
        size="small"
        sx={{ bgcolor: up ? '#ECFDF3' : '#FEF3F2', color: up ? '#027A48' : '#B42318', fontWeight: 700, mb: 1.5 }}
      />
      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
        Consensus
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        A debate runs only when sovereign-agent-bridge answers on 127.0.0.1:8789. The result below is the JSON that process returns. This page does not keep a fake vote tally.
      </Typography>
      <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        <TextField
          multiline
          minRows={3}
          required
          disabled={!up}
          value={proposal}
          onChange={(event) => setProposal(event.target.value)}
          placeholder="Proposal for the bridge consensus engine"
        />
        <Button type="submit" variant="contained" color="primary" disabled={!up || busy} sx={{ alignSelf: 'flex-start' }}>
          {busy ? 'Waiting on the bridge…' : 'Ask the bridge'}
        </Button>
      </Box>
      {!up && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start it with <Box component="span" sx={{ fontFamily: mono, color: '#8A6A09' }}>npm run zoth -- up</Box>.
        </Typography>
      )}
      {error && <Typography sx={{ color: '#B42318', mb: 2 }}>{error}</Typography>}
      {result && (
        <Paper sx={{ p: 2.5, bgcolor: '#101828', color: '#E6F4EA', fontFamily: mono, fontSize: '0.82rem', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(result, null, 2)}
        </Paper>
      )}
    </Container>
  );
}
