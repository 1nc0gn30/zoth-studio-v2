import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip, Button,
  Paper, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwarmCanvasVisualizer from '../components/SwarmCanvasVisualizer';

const liveAgents = [
  { id: 'AZOTH', role: 'Archon Orchestrator', model: 'Google Antigravity / Pro', status: 'ACTIVE', tasks: 142, load: 45, repo: 'azoth-local-agent' },
  { id: 'HERMES', role: 'Subagent Dispatcher', model: 'Nous Hermes 3 (Local)', status: 'ACTIVE', tasks: 88, load: 62, repo: 'hermes-agent' },
  { id: 'GROK', role: 'Dialectic Synthesizer', model: 'xAI Grok Beta', status: 'STANDBY', tasks: 34, load: 12, repo: 'zoth-consensus' },
  { id: 'OLLAMA', role: 'Local WASM/GGUF Runner', model: 'Ollama Llama 3 8B', status: 'ACTIVE', tasks: 92, load: 78, repo: 'zoth-vos-sandbox' },
  { id: 'HEXSTRIKE', role: 'Penetration Auditor', model: 'CyberSec Specialist', status: 'ACTIVE', tasks: 28, load: 35, repo: 'hexstrike-arsenal' },
  { id: 'WEBGEN', role: 'Autonomous Layout Engine', model: 'Vite/React Builder', status: 'ACTIVE', tasks: 115, load: 55, repo: 'polyglot-framework-exporter' },
  { id: 'NEURO-MEM', role: 'STDP Biomorphic Memory', model: 'HNSW Vector Engine', status: 'ACTIVE', tasks: 210, load: 85, repo: 'neuro-memory-daemon' },
  { id: 'SIGNAL-BRG', role: 'E2EE WebSocket Bridge', model: 'Simplex Mesh Protocol', status: 'ACTIVE', tasks: 340, load: 40, repo: 'sovereign-agent-bridge' },
];

export default function SwarmPage() {
  const [dispatchStatus, setDispatchStatus] = useState({});

  const handleDispatch = (id) => {
    setDispatchStatus((prev) => ({ ...prev, [id]: 'DISPATCHED' }));
    setTimeout(() => {
      setDispatchStatus((prev) => ({ ...prev, [id]: 'COMPLETED' }));
    }, 1500);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<HubIcon sx={{ color: '#B8860B !important' }} />}
          label="21 PANTHEON AGENT SWARM CONTROL PLANE"
          size="small"
          sx={{ bg: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, mb: 1, px: 1 }}
        />
        <Typography variant="h3" sx={{ mb: 1 }}>
          Autonomous Agent Swarm Workstation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and dispatch multi-agent consensus, IPC task channels, and zero-telemetry subagent workers in real-time.
        </Typography>
      </Box>

      {/* Real-time Interactive Canvas Visualizer */}
      <SwarmCanvasVisualizer />

      {/* Operational Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, border: '1px solid #EAECF0' }}>
            <Typography variant="body2" color="text.secondary">Total Swarm Agents</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#101828' }}>21 Active</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, border: '1px solid #EAECF0' }}>
            <Typography variant="body2" color="text.secondary">Completed Swarm Work Orders</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#B8860B' }}>1,049 Tasks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, border: '1px solid #EAECF0' }}>
            <Typography variant="body2" color="text.secondary">IPC Signal Mesh Latency</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#12B76A' }}>0.18 ms</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Live Agent Work Order Table */}
      <Paper sx={{ border: '1px solid #EAECF0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bg: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Agent ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Swarm Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Engine Model</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Micro-Repo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Work Load</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {liveAgents.map((agent) => (
              <TableRow key={agent.id} hover>
                <TableCell sx={{ fontWeight: 700, color: '#B8860B', fontFamily: 'monospace' }}>{agent.id}</TableCell>
                <TableCell>{agent.role}</TableCell>
                <TableCell>{agent.model}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#475467', fontSize: '0.8rem' }}>{agent.repo}</TableCell>
                <TableCell sx={{ width: 140 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={agent.load} sx={{ flexGrow: 1, height: 6, borderRadius: 1, bg: '#F2F4F7', '& .MuiLinearProgress-bar': { bg: '#B8860B' } }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{agent.load}%</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={agent.status}
                    size="small"
                    color={agent.status === 'ACTIVE' ? 'success' : 'default'}
                    variant={agent.status === 'ACTIVE' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant={dispatchStatus[agent.id] === 'COMPLETED' ? 'contained' : 'outlined'}
                    color={dispatchStatus[agent.id] === 'COMPLETED' ? 'success' : 'primary'}
                    startIcon={dispatchStatus[agent.id] === 'COMPLETED' ? <CheckCircleIcon /> : <PlayArrowIcon />}
                    onClick={() => handleDispatch(agent.id)}
                  >
                    {dispatchStatus[agent.id] || 'Dispatch'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

    </Container>
  );
}
