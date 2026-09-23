import React, { useState } from 'react';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow, Grid, Card, CardContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MathPillarsGrid from '../components/MathPillarsGrid';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MemoryPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.memory?.up);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  const search = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/studio/memory?q=${encodeURIComponent(query)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      const list = body.memories || body.results || [];
      setRows(list);
    } catch (err) {
      setRows(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>
      {/* MemoryPage signature: gold radial glow behind the header */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '100%', md: '860px' },
          height: { xs: 380, md: 480 },
          pointerEvents: 'none',
          zIndex: 0,
          background: isDark
            ? 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.20) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={up ? 'DAEMON ACTIVE :8788' : 'DAEMON OFFLINE'}
          size="small"
          sx={{
            bgcolor: up ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : (isDark ? 'rgba(244,63,94,0.12)' : '#FEF3F2'),
            color: up ? (isDark ? '#34D399' : '#027A48') : (isDark ? '#FB7185' : '#B42318'),
            fontWeight: 800, mb: 1.5,
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary }}>
          Neuro Memory <span className="text-gradient-gold">Daemon Engine</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.65, fontSize: '1.05rem' }}>
          The <span className="text-highlight-gold">neuro-memory-daemon</span> maintains long-term contextual memory between agent executions. It uses a biological <span className="text-highlight-dark">Spike-Timing-Dependent Plasticity (STDP)</span> weight adjustment algorithm to decay stale memories and strengthen frequently referenced code patterns.
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MemoryIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>STDP Temporal Decay</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Memories decay logarithmically over time (Δw = A₊ · e^(-Δt/τ)) unless reinforced by active agent queries.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StorageIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Zero-Cloud Storage</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Stored entirely in local SQLite & vector binary indexes on disk at <span className="text-highlight-gold">~/.zoth/memory.db</span>.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoFixHighIcon sx={{ color: gold.accent }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Consensus Sync</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Automatically feeds verified architectural decisions into the <span className="text-highlight-dark">Sovereign Agent Bridge</span>.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Query Section */}
      <Box sx={{ mb: 5 }}>
        <Typography className="section-kicker">Daemon Query Interface</Typography>
        <Box component="form" onSubmit={search} sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stored memory vectors or code snippets..."
            disabled={!up}
            sx={{
              flex: '1 1 320px',
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused': {
                  boxShadow: isDark
                    ? '0 0 0 3px rgba(212,175,55,0.22), 0 0 18px -2px rgba(212,175,55,0.35)'
                    : '0 0 0 3px rgba(184,134,11,0.18), 0 0 14px -2px rgba(184,134,11,0.25)',
                },
              },
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: gold.accent }} /></InputAdornment> }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={!up || loading} sx={{ px: 3 }}>
            {loading ? 'Searching Memory…' : 'Query Daemon'}
          </Button>
        </Box>

        {!up && (
          <Box sx={{ p: 2.5, bgcolor: isDark ? 'rgba(244,63,94,0.10)' : '#FEF3F2', border: `1px solid ${isDark ? 'rgba(244,63,94,0.35)' : '#FECDCA'}`, borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: isDark ? '#FB7185' : '#B42318', fontWeight: 650 }}>
              Daemon is offline. Start it from your terminal: <span className="text-highlight-dark">node bin/zoth.js up</span> or <span className="text-highlight-dark">npm run zoth -- up</span>.
            </Typography>
          </Box>
        )}

        {error && <Typography sx={{ color: isDark ? '#FB7185' : '#B42318', mb: 2, fontWeight: 700 }}>Error: {error}</Typography>}

        {rows && (
          <Paper sx={{ border: `1px solid ${theme.palette.divider}`, mb: 5, overflow: 'hidden', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Vector ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Memory Content</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ py: 3, textAlign: 'center', color: theme.palette.text.secondary }}>
                      No memories matched the search query.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => (
                  <TableRow key={row.id || row.text} hover>
                    <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: gold.soft, fontWeight: 700 }}>{row.id || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>{row.text || row.content || JSON.stringify(row)}</TableCell>
                    <TableCell>
                      <Chip label={row.category || 'general'} size="small" sx={{ bgcolor: gold.wash, color: gold.soft, fontWeight: 750 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      {/* STDP Mathematical Foundation Reference */}
      <Box>
        <Typography className="section-kicker">Mathematical Foundation</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>Pillar VI: STDP Synaptic Weight Adaptation</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 740, lineHeight: 1.6 }}>
          The memory daemon is driven by Spike-Timing-Dependent Plasticity, where memory weight updates depend strictly on the relative arrival time between agent query impulses:
        </Typography>
        <MathPillarsGrid />
      </Box>
      </Box>
    </Container>
  );
}
