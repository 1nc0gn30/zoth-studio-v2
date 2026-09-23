import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Paper, Button, TextField, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import ForumIcon from '@mui/icons-material/Forum';
import BalanceIcon from '@mui/icons-material/Balance';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function ConsensusPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.bridge?.up);
  const [proposal, setProposal] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

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
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={up ? 'CONSENSUS ENGINE ACTIVE' : 'BRIDGE REQUIRED'}
          size="small"
          sx={{
            bgcolor: up ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : (isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2'),
            color: up ? (isDark ? '#34D399' : '#027A48') : (isDark ? '#FB7185' : '#B42318'),
            fontWeight: 800, mb: 1.5,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
          Socratic Dialectic <span className="text-gradient-gold">Consensus Arena</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.65, fontSize: '1.05rem' }}>
          Submit architectural proposals to the multi-agent consensus debate engine. The proposal is evaluated through a three-role dialectic loop: <span className="text-highlight-gold">Proponent (AZOTH)</span> constructs the implementation blueprint, <span className="text-highlight-gold">Skeptic (KAI)</span> audits vulnerabilities and mathematical edge cases, and <span className="text-highlight-gold">Arbitrator (DRACO)</span> synthesizes the final consensus verdict.
        </Typography>
      </Box>

      {/* Role Feature Cards */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ForumIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Proponent (AZOTH)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Generates the initial solution proposal, code refactoring blueprint, and algorithmic performance claims.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BalanceIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Skeptic (KAI)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Rigorously attacks the proposal for memory leaks, edge-case failures, zero-telemetry violations, and security flaws.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GavelIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Arbitrator (DRACO)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Weighs argument vectors, calculates mathematical confidence ratings, and issues binding execution decisions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submission Form — ConsensusPage signature: gold glow behind the proposal card */}
      <Box sx={{ mb: 5, position: 'relative' }}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '100%', md: '720px' },
            height: 220,
            pointerEvents: 'none',
            zIndex: 0,
            background: isDark
              ? 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(212,175,55,0.16) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(184,134,11,0.08) 0%, transparent 70%)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography className="section-kicker">Proposal Submission Form</Typography>
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            multiline
            minRows={4}
            required
            disabled={!up}
            value={proposal}
            onChange={(event) => setProposal(event.target.value)}
            placeholder="Enter proposal text or engineering feature specification for the local consensus engine..."
            sx={{ bgcolor: theme.palette.background.paper }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={!up || busy} sx={{ alignSelf: 'flex-start', px: 3.5, py: 1.2 }}>
            {busy ? 'Running Multi-Agent Debate…' : 'Submit Proposal for Consensus'}
          </Button>
        </Box>

        {!up && (
          <Box sx={{ p: 2.5, bgcolor: isDark ? 'rgba(244,63,94,0.10)' : '#FEF3F2', border: `1px solid ${isDark ? 'rgba(244,63,94,0.35)' : '#FECDCA'}`, borderRadius: 2, mt: 2 }}>
            <Typography variant="body2" sx={{ color: isDark ? '#FB7185' : '#B42318', fontWeight: 650 }}>
              Signal Bridge daemon is required for consensus debates. Start it: <span className="text-highlight-dark">node bin/zoth.js up</span>.
            </Typography>
          </Box>
        )}

        {error && <Typography sx={{ color: isDark ? '#FB7185' : '#B42318', mt: 2, fontWeight: 700 }}>Error: {error}</Typography>}
        </Box>
      </Box>

      {/* Output Console — ConsensusPage signature: gold border on the result panel */}
      {result && (
        <Box>
          <Typography className="section-kicker">Consensus Verdict Output</Typography>
          <Paper sx={{
            p: 3,
            bgcolor: isDark ? '#0B0B12' : '#0F172A',
            color: '#F8FAFC',
            fontFamily: mono,
            fontSize: '0.85rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            borderRadius: 2,
            border: `1px solid ${gold.accent}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(212,175,55,0.25), 0 0 24px -4px rgba(212,175,55,0.35)'
              : '0 0 0 1px rgba(184,134,11,0.2), 0 0 18px -4px rgba(184,134,11,0.25)',
          }}>
            {JSON.stringify(result, null, 2)}
          </Paper>
        </Box>
      )}
    </Container>
  );
}
