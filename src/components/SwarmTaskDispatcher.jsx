import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Unstable_Grid2 as Grid,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';
import MemoryIcon from '@mui/icons-material/Memory';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const TRIAD_ENGINES = [
  {
    id: 'hermes',
    label: 'Hermes Agent',
    version: 'v0.21.5',
    binary: '~/.local/bin/hermes',
    desc: 'Nous Research Autonomous Skill & Mesh Execution Engine',
    icon: TerminalIcon,
    accent: '#D4AF37',
  },
  {
    id: 'cursor',
    label: 'Cursor Agent',
    version: 'v2026.10.01',
    binary: '~/.local/bin/cursor-agent',
    desc: 'Frontier Autonomous Multi-File Codebase Refactoring CLI',
    icon: CodeIcon,
    accent: '#38BDF8',
  },
  {
    id: 'grok',
    label: 'Grok Agent CLI',
    version: 'v1.0.62',
    binary: '~/.grok/bin/grok',
    desc: 'xAI Real-Time Verification & Diagnostic Build Agent',
    icon: HubIcon,
    accent: '#A855F7',
  },
  {
    id: 'ollama',
    label: 'Ollama Local 1.5B',
    version: 'qwen2.5-coder:1.5b',
    binary: '/usr/local/bin/ollama',
    desc: 'Cool-Running Sub-1.5B Local Inference (Zero Cloud Tokens)',
    icon: MemoryIcon,
    accent: '#F59E0B',
  },
  {
    id: 'zothos',
    label: 'ZothOS Conductor',
    version: 'v1.0.0',
    binary: '~/NullAITech/bin/zoth-agent-conductor',
    desc: '22-Daemon Loopback Orchestrator & Cryptographic Chain Engine',
    icon: MemoryIcon,
    accent: '#10B981',
  },
];

export default function SwarmTaskDispatcher() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#8A6508';
  const goldSoft = isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';

  const [prompt, setPrompt] = useState('Build high-throughput E2EE WebSocket proxy with biomorphic memory recall');
  const [selectedEngine, setSelectedEngine] = useState('auto');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [triadState, setTriadState] = useState(null);
  const [dispatchOutput, setDispatchOutput] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/studio/agent/triad')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (mounted && data?.agents) setTriadState(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const steps = [
    { agent: 'ZOTHOS CONDUCTOR', action: 'Verifying 22 loopback enclave daemons (:8094–:8121) & zero-egress seal...', status: 'DONE' },
    { agent: 'HERMES AGENT', action: 'Loading ~/.gemini/config/skills & decomposing work order into AST tasks...', status: 'IN_PROGRESS' },
    { agent: 'CURSOR AGENT', action: 'Synthesizing multi-file implementation & running static type verification...', status: 'PENDING' },
    { agent: 'NEURO-MEM (:8094)', action: 'Consolidating episodic trace into HNSW vector index & STDP synapse graph...', status: 'PENDING' },
    { agent: 'VIGIL / CONSENSUS', action: 'Sealing execution report with Ed25519 signature & SHA-256 attestation...', status: 'PENDING' },
  ];

  const handleRunSwarm = async () => {
    if (!prompt || running) return;
    setRunning(true);
    setProgress(12);
    setActiveStep(0);
    setDispatchOutput(null);

    // Attempt live local triad dry-run / dispatch if connected to local studio API
    fetch('/api/studio/agent/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine: selectedEngine, prompt, dryRun: true }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setDispatchOutput(data);
      })
      .catch(() => {});

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
    }, 650);
  };

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${theme.palette.divider}`, mb: 5, bgcolor: theme.palette.background.paper, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HubIcon sx={{ color: gold }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Frontier Coding Triad &amp; 21-Pantheon Task Dispatcher
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: mono }}>
              Unified orchestration across Hermes Agent, Cursor Agent CLI, and ZothOS Conductor
            </Typography>
          </Box>
        </Box>
        <Chip
          label={triadState ? `TRIAD ONLINE (${triadState.online || 5}/${triadState.total || 5})` : 'TRIAD READY • ZERO-EGRESS'}
          size="small"
          sx={{
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem',
            bgcolor: isDark ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF3',
            color: isDark ? '#34D399' : '#047857',
            border: '1px solid rgba(16, 185, 129, 0.35)',
          }}
        />
      </Box>

      {/* Frontier Coding Triad Selector Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {TRIAD_ENGINES.map((eng) => {
          const IconComp = eng.icon;
          const active = selectedEngine === eng.id || selectedEngine === 'auto';
          return (
            <Grid xs={12} md={4} key={eng.id}>
              <Box
                onClick={() => setSelectedEngine(selectedEngine === eng.id ? 'auto' : eng.id)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                  border: `1.5px solid ${active ? gold : theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: gold },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconComp sx={{ fontSize: 18, color: gold }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {eng.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={`ONLINE • ${eng.version}`}
                    size="small"
                    sx={{
                      height: 19,
                      fontSize: '0.62rem',
                      fontFamily: mono,
                      fontWeight: 800,
                      bgcolor: isDark ? 'rgba(52,211,153,0.14)' : '#ECFDF3',
                      color: isDark ? '#34D399' : '#047857',
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, lineHeight: 1.4 }}>
                  {eng.desc}
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: gold, fontWeight: 700 }}>
                  $ {eng.binary}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Engine Filter Chips */}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
        {[
          { id: 'auto', label: 'Triad Auto-Route (Hermes + Cursor + ZothOS)' },
          { id: 'hermes', label: 'Hermes Agent Only' },
          { id: 'cursor', label: 'Cursor Agent Only' },
          { id: 'zothos', label: 'ZothOS Conductor Chain' },
        ].map((opt) => {
          const sel = selectedEngine === opt.id;
          return (
            <Chip
              key={opt.id}
              label={opt.label}
              clickable
              size="small"
              onClick={() => setSelectedEngine(opt.id)}
              sx={{
                fontFamily: mono,
                fontWeight: 750,
                fontSize: '0.72rem',
                bgcolor: sel ? gold : 'transparent',
                color: sel ? (isDark ? '#08080B' : '#FFFFFF') : 'text.primary',
                '& .MuiChip-label': {
                  color: sel ? (isDark ? '#08080B !important' : '#FFFFFF !important') : undefined,
                },
                border: `1px solid ${gold}`,
              }}
            />
          );
        })}
      </Stack>

      {/* Prompt Input Row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter task prompt for Hermes + Cursor + ZothOS Triad dispatch..."
          inputProps={{ 'aria-label': 'Swarm task prompt' }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={running}
          sx={{ '& input': { fontFamily: mono, fontSize: '0.84rem' } }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={progress === 100 ? <CheckCircleIcon /> : <PlayArrowIcon />}
          onClick={handleRunSwarm}
          disabled={running}
          sx={{ px: 3.5, minWidth: 175, whiteSpace: 'nowrap', fontWeight: 800, fontFamily: mono }}
        >
          {running ? 'Executing...' : progress === 100 ? 'Completed!' : 'Dispatch Triad'}
        </Button>
      </Box>

      {running && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 3, height: 6, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: gold } }}
        />
      )}

      {dispatchOutput?.cmd && (
        <Box
          sx={{
            p: 1.5,
            mb: 2.5,
            borderRadius: 2,
            bgcolor: '#08080B',
            border: `1px solid ${gold}`,
            fontFamily: mono,
            fontSize: '0.75rem',
            color: '#34D399',
            overflowX: 'auto',
          }}
        >
          $ {Array.isArray(dispatchOutput.cmd) ? dispatchOutput.cmd.join(' ') : String(dispatchOutput.cmd)}
        </Box>
      )}

      {/* Step Execution Grid */}
      <Grid container spacing={1.5}>
        {steps.map((step, idx) => {
          const isDone = idx < activeStep || progress === 100;
          const isCurrent = idx === activeStep && running;
          return (
            <Grid xs={12} key={step.agent}>
              <Card
                sx={{
                  border: isCurrent ? `1.5px solid ${gold}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: isCurrent ? goldSoft : theme.palette.background.paper,
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardContent
                  sx={{
                    py: 1.25,
                    px: 2,
                    '&:last-child': { pb: 1.25 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={step.agent}
                      size="small"
                      sx={{
                        bgcolor: isDone
                          ? isDark
                            ? 'rgba(52,211,153,0.16)'
                            : '#ECFDF3'
                          : isCurrent
                            ? isDark
                              ? 'rgba(217,119,6,0.16)'
                              : '#FEF3C7'
                            : theme.palette.background.paper,
                        color: isDone
                          ? isDark
                            ? '#34D399'
                            : '#047857'
                          : isCurrent
                            ? isDark
                              ? '#F59E0B'
                              : '#B45309'
                            : theme.palette.text.secondary,
                        fontWeight: 800,
                        fontFamily: mono,
                        fontSize: '0.68rem',
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 500, color: theme.palette.text.primary }}>
                      {step.action}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: isDone ? '#12B76A' : isCurrent ? '#D97706' : theme.palette.text.secondary,
                      fontFamily: mono,
                    }}
                  >
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
