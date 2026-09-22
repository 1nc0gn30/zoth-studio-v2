import React, { useState } from 'react';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MathPillarsGrid from '../components/MathPillarsGrid';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MemoryPage() {
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.memory?.up);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Chip
        label={up ? 'DAEMON ANSWERING :8788' : 'DAEMON NOT ANSWERING'}
        size="small"
        sx={{ bgcolor: up ? '#ECFDF3' : '#FEF3F2', color: up ? '#027A48' : '#B42318', fontWeight: 700, mb: 1.5 }}
      />
      <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1 }}>
        Memory daemon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 3 }}>
        This page lists memories only when neuro-memory-daemon is listening on 127.0.0.1:8788. Start it with <Box component="span" sx={{ fontFamily: mono, color: '#8A6A09' }}>npm run zoth -- up</Box>. An empty list means the daemon is up and has nothing stored.
      </Typography>

      <Box component="form" onSubmit={search} sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stored text"
          disabled={!up}
          sx={{ flex: '1 1 280px' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={!up || loading}>
          {loading ? 'Asking…' : 'Query daemon'}
        </Button>
      </Box>

      {error && <Typography sx={{ color: '#B42318', mb: 2 }}>{error}</Typography>}

      {rows && (
        <Paper sx={{ border: '1px solid #EAECF0', mb: 5, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>The daemon returned no memories.</TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id || row.text} hover>
                  <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem' }}>{row.id || '—'}</TableCell>
                  <TableCell>{row.text || row.content || JSON.stringify(row)}</TableCell>
                  <TableCell>{row.category || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Typography variant="h5" sx={{ fontWeight: 750, mb: 1 }}>STDP reference</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 680 }}>
        Pillar VI is the formula the daemon is built around. The numbers that used to sit under these cards were examples, so they are gone.
      </Typography>
      <MathPillarsGrid />
    </Container>
  );
}
