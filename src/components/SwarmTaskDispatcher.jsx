import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Unstable_Grid2 as Grid, Chip, LinearProgress, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SwarmTaskDispatcher() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const [prompt, setPrompt] = useState('Build high-throughput E2EE WebSocket proxy with biomorphic memory recall');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { agent: 'AZOTH', action: 'Decomposing task into 4 parallel micro-work orders...', status: 'DONE' },
    { agent: 'MERCURY', action: 'Dispatching work orders to 21 Pantheon subagent nodes...', status: 'IN_PROGRESS' },
    { agent: 'NEURO-MEM', action: 'Querying local HNSW vector index & STDP memory graph...', status: 'PENDING' },
    { agent: 'HEXSTRIKE', action: 'Auditing payload entropy & checking OWASP zero-egress security...', status: 'PENDING' },
    { agent: 'VIGIL / CONSENSUS', action: 'Synthesizing tri-agent Socratic debate & generating SHA-256 seal...', status: 'PENDING' },
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
    <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, mb: 5, bgcolor: theme.palette.background.paper }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HubIcon sx={{ color: gold }} />
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

      {running && <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 6, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: gold } }} />}

      {/* Step Execution Grid */}
      <Grid container spacing={2}>
        {steps.map((step, idx) => {
          const isDone = idx < activeStep || progress === 100;
          const isCurrent = idx === activeStep && running;
          return (
            <Grid xs={12} key={step.agent}>
              <Card
                sx={{
                  border: isCurrent ? `1.5px solid ${gold}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: isCurrent ? goldSoft : isDone ? theme.palette.background.paper : theme.palette.background.paper,
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={step.agent}
                      size="small"
                      sx={{
                        bgcolor: isDone ? (isDark ? 'rgba(52,211,153,0.16)' : '#ECFDF3') : isCurrent ? (isDark ? 'rgba(217,119,6,0.16)' : '#FEF3C7') : theme.palette.background.paper,
                        color: isDone ? (isDark ? '#34D399' : '#12B76A') : isCurrent ? (isDark ? '#F59E0B' : '#D97706') : theme.palette.text.secondary,
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 500, color: theme.palette.text.primary }}>
                      {step.action}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: isDone ? '#12B76A' : isCurrent ? '#D97706' : theme.palette.text.secondary, fontFamily: 'monospace' }}>
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
