import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip, Paper,
  Button, TextField, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import StorageIcon from '@mui/icons-material/Storage';

const memoryItems = [
  { id: 'MEM-001', agent: 'AZOTH', query: 'Argon2id master salt derivation formula', similarity: '99.4%', timestamp: '2 mins ago', type: 'Vector' },
  { id: 'MEM-002', agent: 'HERMES', query: 'E2EE Signal Bridge WebSocket session handshake token', similarity: '98.7%', timestamp: '5 mins ago', type: 'KeyValue' },
  { id: 'MEM-003', agent: 'GROK', query: 'Consensus Socratic debate verdict for SHA-256 AST diff', similarity: '96.2%', timestamp: '12 mins ago', type: 'Vector' },
  { id: 'MEM-004', agent: 'HEXSTRIKE', query: 'CVE-2026-3829 exploit payload signature bypass', similarity: '95.1%', timestamp: '24 mins ago', type: 'Graph' },
  { id: 'MEM-005', agent: 'WEBGEN', query: 'Vite React Tailwind glassmorphism design tokens', similarity: '93.8%', timestamp: '45 mins ago', type: 'Vector' },
];

export default function MemoryPage() {
  const [search, setSearch] = useState('');

  const filtered = memoryItems.filter(
    (m) => m.query.toLowerCase().includes(search.toLowerCase()) || m.agent.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Section Header Banner */}
      <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', border: '1px solid #EAECF0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <Box component="img" src="/assets/banners/memory.jpg" alt="Biomorphic Memory Banner" sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<MemoryIcon sx={{ color: '#B8860B !important' }} />}
          label="BIOMORPHIC STDP MEMORY DAEMON"
          size="small"
          sx={{ bg: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, mb: 1, px: 1 }}
        />
        <Typography variant="h3" sx={{ mb: 1 }}>
          Netrunner Sovereign Memory Core
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Zero-telemetry local vector store, biomorphic STDP synapse decay engine, and cross-session agent context recall daemon running at <code style={{ color: '#B8860B' }}>http://127.0.0.1:8788/v1/memory</code>.
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, border: '1px solid #EAECF0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StorageIcon sx={{ color: '#B8860B' }} />
              <Typography variant="body2" color="text.secondary">Total Vector Embeddings</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828' }}>14,280 Nodes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, border: '1px solid #EAECF0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MemoryIcon sx={{ color: '#12B76A' }} />
              <Typography variant="body2" color="text.secondary">STDP Synaptic Retention</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#12B76A' }}>94.8% Active</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, border: '1px solid #EAECF0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <RefreshIcon sx={{ color: '#0369A1' }} />
              <Typography variant="body2" color="text.secondary">Recall Latency</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0369A1' }}>0.18 ms</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search Bar & Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Query local biomorphic vector memory embeddings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#B8860B' }} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" color="primary" startIcon={<RefreshIcon />}>
          Consolidate STDP
        </Button>
        <Button variant="outlined" color="primary" startIcon={<DownloadIcon />}>
          Export Vault
        </Button>
      </Box>

      {/* Memory Entries Table */}
      <Paper sx={{ border: '1px solid #EAECF0', overflow: 'hidden', mb: 5 }}>
        <Table>
          <TableHead sx={{ bg: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Memory ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Agent Owner</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Recalled Context Vector</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Match Score</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Store Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontWeight: 700, color: '#B8860B', fontFamily: 'monospace' }}>{item.id}</TableCell>
                <TableCell><Chip label={item.agent} size="small" sx={{ bg: '#FEF9E7', color: '#B8860B', fontWeight: 700 }} /></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{item.query}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#12B76A' }}>{item.similarity}</TableCell>
                <TableCell><Chip label={item.type} size="small" variant="outlined" /></TableCell>
                <TableCell color="text.secondary">{item.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* API Code Integration Card */}
      <Card sx={{ border: '1px solid #EAECF0' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MemoryIcon sx={{ color: '#B8860B' }} /> Local Memory Daemon API Endpoint
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All subagents and tools automatically query the local Zoth Memory Daemon HTTP API to store and recall session knowledge without any external API keys or cloud dependencies.
          </Typography>
          <Paper sx={{ p: 2.5, bg: '#101828', color: '#81C995', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            <div>curl -X POST http://127.0.0.1:8788/v1/memory/query \</div>
            <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
            <div>&nbsp;&nbsp;-d '&#123; "agent_id": "AZOTH", "query": "Argon2id salt", "top_k": 5 &#125;'</div>
          </Paper>
        </CardContent>
      </Card>

    </Container>
  );
}
