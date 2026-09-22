import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Chip, LinearProgress, Card, CardContent } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SwarmTaskDispatcher() {
  const [prompt, setPrompt] = useState('Build high-throughput E2EE WebSocket proxy with biomorphic memory recall');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { agent: 'AZOTH', action: 'Decomposing task into 4 parallel micro-work orders...', status: 'DONE' },
    { agent: 'HERMES', action: 'Dispatching work orders to 21 Pantheon subagent nodes...', status: 'IN_PROGRESS' },
    { agent: 'NEURO-MEM', action: 'Recalling HNSW vector embeddings from 127.0.0.1:8788...', status: 'PENDING' },
    { agent: 'HEXSTRIKE', action: 'Auditing payload entropy & checking OWASP zero-egress security...', status: 'PENDING' },
    { agent: 'GROK / CONSENSUS', action: 'Synthesizing tri-agent Socratic debate & generating SHA-256 seal...', status: 'PENDING' },
  ];

  const handleRunSwarm = () => {
    if (!prompt || running) return;
    setRunning(true);
    setProgress(10);
    setActiveStep(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          return 100;
        }
        const next = prev + 22;
        setActiveStep(Math.min(Math.floor((next / 100) * steps.length), steps.length - 1));
        return next;
      });
    }, 800);
  };

  return (
    <Paper sx={{ p: 3, border: '1px solid #EAECF0', mb: 5, bgcolor: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HubIcon sx={{ color: '#B8860B' }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Interactive 21 Pantheon Agent Task Dispatcher
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Dispatch zero-telemetry multi-agent work orders across local IPC channels
          </Typography>
        </Box>
      </Box>

      {/* Prompt Input Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Enter task prompt for 21-agent swarm dispatch..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={running}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={progress === 100 ? <CheckCircleIcon /> : <PlayArrowIcon />}
          onClick={handleRunSwarm}
          disabled={running}
          sx={{ px: 4, minWidth: 160 }}
        >
          {running ? 'Executing...' : progress === 100 ? 'Completed!' : 'Dispatch Swarm'}
        </Button>
      </Box>

      {running && <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 6, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: '#B8860B' } }} />}

      {/* Step Execution Grid */}
      <Grid container spacing={2}>
        {steps.map((step, idx) => {
          const isDone = idx < activeStep || progress === 100;
          const isCurrent = idx === activeStep && running;
          return (
            <Grid size={{ xs: 12 }} key={step.agent}>
              <Card
                sx={{
                  border: isCurrent ? '1.5px solid #D4AF37' : '1px solid #EAECF0',
                  bgcolor: isCurrent ? '#FEF9E7' : isDone ? '#FAFAFA' : '#FFFFFF',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={step.agent}
                      size="small"
                      sx={{
                        bgcolor: isDone ? '#ECFDF3' : isCurrent ? '#FEF3C7' : '#F2F4F7',
                        color: isDone ? '#12B76A' : isCurrent ? '#D97706' : '#667085',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 500, color: '#101828' }}>
                      {step.action}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: isDone ? '#12B76A' : isCurrent ? '#D97706' : '#98A2B3', fontFamily: 'monospace' }}>
                    {isDone ? '✔ DONE' : isCurrent ? '⚡ RUNNING' : 'WAITING'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
