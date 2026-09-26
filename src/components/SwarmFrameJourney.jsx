import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Container, Typography, Chip, Paper, Stack, Button, IconButton,
  LinearProgress, Card, Tooltip, Unstable_Grid2 as Grid, Tabs, Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';
import ShieldIcon from '@mui/icons-material/Shield';
import HubIcon from '@mui/icons-material/Hub';
import MemoryIcon from '@mui/icons-material/Memory';
import GavelIcon from '@mui/icons-material/Gavel';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';
import RouterIcon from '@mui/icons-material/Router';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';
import { pantheonAgents } from '../data/pantheon';
import SwarmCanvasVisualizer from './SwarmCanvasVisualizer';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const CADRE_THEMES = {
  Architects: { color: '#D4AF37', label: 'Architects Cadre' },
  Code: { color: '#38BDF8', label: 'Code Engineering' },
  Security: { color: '#F87171', label: 'Security & Defense' },
  Creative: { color: '#C084FC', label: 'Creative & Cognitive' },
  Swarm: { color: '#34D399', label: 'Swarm Multiplexing' },
};

const FRAMES = [
  { id: 'whys', num: '01', title: 'THE WHYS', subtitle: 'Why Monolithic Cloud AI Fails & Why Swarms Win' },
  { id: 'whats', num: '02', title: 'THE WHATS', subtitle: 'The 21-Agent Pantheon & 5 Tactical Cadres' },
  { id: 'hows', num: '03', title: 'THE HOWS', subtitle: 'The Zero-Egress Tri-Socket Infrastructure' },
  { id: 'whens', num: '04', title: 'THE WHENS', subtitle: 'The 5-Phase Autonomous Lifecycle Play-by-Play' },
  { id: 'visuals', num: '05', title: 'USING IT', subtitle: 'Visualizing Real-World Execution in Real Time' },
  { id: 'launch', num: '06', title: 'TAKE FLIGHT', subtitle: 'Launch the Matrix & Enter the Live Cockpit' },
];

export default function SwarmFrameJourney({ onEnterCockpit, onBackToFunnel }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? '#F5E6AB' : '#8A6A09';
  const goldBorder = isDark ? 'rgba(212,175,55,0.3)' : '#E2CE82';
  const cardBg = isDark ? '#0A0D14' : '#FFFFFF';
  const darkPaper = isDark ? '#08080B' : '#F8FAFC';

  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Frame 2 interactive cadre filter
  const [selectedCadre, setSelectedCadre] = useState('Architects');

  // Frame 4 interactive phase scrubber
  const [activePhase, setActivePhase] = useState(1);

  // Frame 5 query simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Copied start command state
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Frame auto-play timer
  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }

    const duration = 8500; // 8.5 seconds per frame
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveFrameIndex((curr) => {
            if (curr < FRAMES.length - 1) return curr + 1;
            setIsPlaying(false);
            return curr;
          });
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, activeFrameIndex]);

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleNext = () => {
    setProgress(0);
    setActiveFrameIndex((curr) => Math.min(curr + 1, FRAMES.length - 1));
  };

  const handlePrev = () => {
    setProgress(0);
    setActiveFrameIndex((curr) => Math.max(curr - 1, 0));
  };

  const handleJump = (index) => {
    setProgress(0);
    setActiveFrameIndex(index);
  };

  const currentFrame = FRAMES[activeFrameIndex];

  return (
    <Box sx={{ position: 'relative', width: '100%', py: 3 }}>
      {/* Top Journey HUD Controller Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: darkPaper,
          border: `1px solid ${goldBorder}`,
          position: 'sticky',
          top: 72,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {onBackToFunnel && (
              <Button
                size="small"
                variant="text"
                onClick={onBackToFunnel}
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  color: isDark ? '#9CA3AF' : '#475467',
                }}
              >
                Overview
              </Button>
            )}
            <Chip
              label={`FRAME ${currentFrame.num} / 06`}
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.74rem',
                bgcolor: isDark ? 'rgba(212,175,55,0.18)' : '#FEF9E7',
                color: gold,
                border: `1px solid ${goldBorder}`,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
              {currentFrame.title}: <span style={{ color: goldSoft, fontWeight: 600 }}>{currentFrame.subtitle}</span>
            </Typography>
          </Box>

          {/* Interactive Player Controls */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={isPlaying ? "Pause auto-play (Space)" : "Start auto-play (Space)"}>
              <IconButton
                size="small"
                onClick={() => setIsPlaying(!isPlaying)}
                sx={{
                  color: gold,
                  border: `1px solid ${goldBorder}`,
                  bgcolor: isPlaying ? 'rgba(212,175,55,0.2)' : 'transparent',
                }}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Previous frame (←)">
              <span>
                <IconButton
                  size="small"
                  onClick={handlePrev}
                  disabled={activeFrameIndex === 0}
                  sx={{ color: isDark ? '#EDEFF2' : '#1E293B' }}
                >
                  <ArrowBackIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Next frame (→)">
              <span>
                <IconButton
                  size="small"
                  onClick={handleNext}
                  disabled={activeFrameIndex === FRAMES.length - 1}
                  sx={{ color: isDark ? '#EDEFF2' : '#1E293B' }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Button
              size="small"
              variant="outlined"
              onClick={onEnterCockpit}
              endIcon={<TerminalIcon sx={{ fontSize: '15px !important' }} />}
              sx={{
                fontFamily: mono,
                fontSize: '0.72rem',
                fontWeight: 750,
                borderColor: goldBorder,
                color: gold,
                ml: 1,
              }}
            >
              Cockpit (:8989)
            </Button>
          </Stack>
        </Stack>

        {/* Progress Bar & Frame Pills */}
        <Box sx={{ mt: 1.5 }}>
          {isPlaying && (
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 3,
                borderRadius: 1,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: gold,
                },
                mb: 1.5,
              }}
            />
          )}

          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
            {FRAMES.map((f, i) => (
              <Chip
                key={f.id}
                label={`${f.num} ${f.title}`}
                size="small"
                onClick={() => handleJump(i)}
                clickable
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  bgcolor: activeFrameIndex === i ? gold : isDark ? 'rgba(255,255,255,0.04)' : '#F2F4F7',
                  color: activeFrameIndex === i ? '#000000' : isDark ? '#9CA3AF' : '#475467',
                  border: '1px solid',
                  borderColor: activeFrameIndex === i ? gold : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: activeFrameIndex === i ? gold : isDark ? 'rgba(212,175,55,0.15)' : '#E4E7EC',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Main Interactive Stage */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFrameIndex}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ======================================================== */}
          {/* FRAME 1: THE WHYS                                         */}
          {/* ======================================================== */}
          {activeFrameIndex === 0 && (
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3.5, bgcolor: cardBg, border: `1px solid ${goldBorder}` }}>
              <Box sx={{ mb: 4 }}>
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: '0.85rem !important', color: `${gold} !important` }} />}
                  label="FRAME 01 // ARCHITECTURAL JUSTIFICATION"
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.12)', color: gold, mb: 1.5 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  The Why: <span style={{ color: gold }}>Breaking Free from Monolithic Cloud AI</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860, fontSize: '1.05rem', lineHeight: 1.6 }}>
                  Why do modern software development and cybersecurity require a 21-agent sovereign swarm instead of a single prompt in ChatGPT or Claude?
                  Monolithic models suffer from attention saturation, context collapse, and dangerous external data egress.
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* The Cloud LLM Trap */}
                <Grid xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: isDark ? '#12080A' : '#FFF5F5',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECDD3',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF4444' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#EF4444' }}>
                        The Monolithic Cloud AI Trap
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: '0.92rem', color: isDark ? '#FECACA' : '#991B1B' }}>
                          ❌ Context Degradation &amp; Drift
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          A single model asked to write ASTs, audit security, and design UI forgets earlier constraints as token depth passes 16k, introducing silent regressions.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: '0.92rem', color: isDark ? '#FECACA' : '#991B1B' }}>
                          ❌ Cloud Egress &amp; Exfiltration Hazard
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Proprietary source code, environment secrets, and cryptographic keys are transmitted across public WAN endpoints to 3rd-party servers.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: '0.92rem', color: isDark ? '#FECACA' : '#991B1B' }}>
                          ❌ Zero Adversarial Verification
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Single models act as both author and validator, enthusiastically validating their own flawed logic and hallucinated functions without resistance.
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                {/* The Sovereign Swarm Solution */}
                <Grid xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: isDark ? '#08120D' : '#F0FDF4',
                      borderColor: isDark ? 'rgba(52, 211, 153, 0.35)' : '#BBF7D0',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#10B981' }}>
                        The 21-Agent Sovereign Solution
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: '0.92rem', color: isDark ? '#A7F3D0' : '#166534' }}>
                          ✔ Extreme Cognitive Specialization
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          21 specialized nodes divided across 5 cadres: Architects design, Engineers compile, Red-Team Security audits, and Consensus Arbiters ratify.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: '0.92rem', color: isDark ? '#A7F3D0' : '#166534' }}>
                          ✔ 100% Loopback Zero-Egress Boundary
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          All communication executes on 127.0.0.1 across ports 8989, 8102, 8094, and 11434. Network egress is blocked at the kernel level via cgroupv2.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 750, fontSize: '0.92rem', color: isDark ? '#A7F3D0' : '#166534' }}>
                          ✔ Mathematical 2f+1 Byzantine Consensus
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          No code is written to disk without 66.7% supermajority ratification. Hallucinated AST mutations are rejected in &lt;16ms via SHA-256 Merkle trie audits.
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* Bottom Navigation Prompt */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 750,
                    bgcolor: gold,
                    color: '#000000',
                    px: 3,
                    py: 1,
                    '&:hover': { bgcolor: '#F5E6AB' },
                  }}
                >
                  Next: See The 21 Agents (Frame 02)
                </Button>
              </Box>
            </Paper>
          )}

          {/* ======================================================== */}
          {/* FRAME 2: THE WHATS                                        */}
          {/* ======================================================== */}
          {activeFrameIndex === 1 && (
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3.5, bgcolor: cardBg, border: `1px solid ${goldBorder}` }}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<HubIcon sx={{ fontSize: '0.85rem !important', color: `${gold} !important` }} />}
                  label="FRAME 02 // AGENT PANTHEON TAXONOMY"
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.12)', color: gold, mb: 1.5 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  The What: <span style={{ color: gold }}>The 21-Agent Pantheon &amp; 5 Cadres</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860, fontSize: '1rem', lineHeight: 1.6 }}>
                  The swarm is divided into 5 tactical cadres. Explore each cadre below to inspect its agents, roles, and assigned cognitive tasks.
                </Typography>
              </Box>

              {/* Cadre Selector Tabs */}
              <Tabs
                value={selectedCadre}
                onChange={(e, v) => setSelectedCadre(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: `1.5px solid ${goldBorder}`,
                  mb: 3,
                  '& .MuiTab-root': {
                    fontFamily: mono,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    color: isDark ? '#9CA3AF' : '#475467',
                    '&.Mui-selected': { color: CADRE_THEMES[selectedCadre]?.color || gold },
                  },
                  '& .MuiTabs-indicator': {
                    bgcolor: CADRE_THEMES[selectedCadre]?.color || gold,
                    height: 3,
                  },
                }}
              >
                {Object.keys(CADRE_THEMES).map((cName) => (
                  <Tab
                    key={cName}
                    value={cName}
                    label={`${CADRE_THEMES[cName].label} (${pantheonAgents.filter((a) => a.cadre === cName).length})`}
                  />
                ))}
              </Tabs>

              {/* Agent Grid for Selected Cadre */}
              <Grid container spacing={2}>
                {pantheonAgents
                  .filter((a) => a.cadre === selectedCadre)
                  .map((agent) => (
                    <Grid key={agent.id} xs={12} sm={6} md={4}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 2.5,
                          bgcolor: darkPaper,
                          borderColor: `${CADRE_THEMES[selectedCadre]?.color}40`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: CADRE_THEMES[selectedCadre]?.color,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              bgcolor: `${CADRE_THEMES[selectedCadre]?.color}20`,
                              border: `1.5px solid ${CADRE_THEMES[selectedCadre]?.color}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: mono,
                              fontWeight: 900,
                              fontSize: '0.8rem',
                              color: CADRE_THEMES[selectedCadre]?.color,
                            }}
                          >
                            {agent.id.slice(0, 2)}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, fontFamily: mono, fontSize: '0.95rem' }}>
                              {agent.id}
                            </Typography>
                            <Chip
                              label={agent.cadre}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 750,
                                bgcolor: `${CADRE_THEMES[selectedCadre]?.color}18`,
                                color: CADRE_THEMES[selectedCadre]?.color,
                              }}
                            />
                          </Box>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, fontSize: '0.82rem' }}>
                          {agent.role}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.7rem' }}>
                            STATUS: READY
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: CADRE_THEMES[selectedCadre]?.color, fontWeight: 700, fontSize: '0.7rem' }}>
                            ZERO_EGRESS_OK
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
              </Grid>

              {/* Bottom Navigation */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={handlePrev} startIcon={<ArrowBackIcon />} sx={{ fontFamily: mono }}>
                  Back: The Whys
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontFamily: mono, fontWeight: 750, bgcolor: gold, color: '#000000', '&:hover': { bgcolor: '#F5E6AB' } }}
                >
                  Next: The Hows &amp; Plumbing (Frame 03)
                </Button>
              </Box>
            </Paper>
          )}

          {/* ======================================================== */}
          {/* FRAME 3: THE HOWS                                         */}
          {/* ======================================================== */}
          {activeFrameIndex === 2 && (
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3.5, bgcolor: cardBg, border: `1px solid ${goldBorder}` }}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<RouterIcon sx={{ fontSize: '0.85rem !important', color: `${gold} !important` }} />}
                  label="FRAME 03 // LOOPBACK PLUMBING & SOCKETS"
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.12)', color: gold, mb: 1.5 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  The How: <span style={{ color: gold }}>The Zero-Egress Tri-Socket Mesh</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860, fontSize: '1rem', lineHeight: 1.6 }}>
                  How do 21 agents exchange state, recall memories, and execute models at sub-millisecond speeds without colliding or touching the internet?
                </Typography>
              </Box>

              {/* 4 Loopback Pillars */}
              <Grid container spacing={2.5}>
                {[
                  {
                    port: ':8989',
                    name: 'Swarm Multiplexer Daemon',
                    desc: 'Central task broker and Server-Sent Events (SSE) telemetry multiplexer. Dispatches parallel AST mutation requests to all 21 agents.',
                    protocol: 'HTTP/2 Loopback & SSE',
                    color: '#34D399',
                  },
                  {
                    port: ':8102',
                    name: 'Sovereign Signal Bridge',
                    desc: 'E2EE Simplex peer mesh with Ed25519 signing. Unidirectional channels prevent deadlock loops and isolate agent failure domains.',
                    protocol: 'WebSocket Simplex E2EE',
                    color: '#38BDF8',
                  },
                  {
                    port: ':8094',
                    name: 'Neuro Memory Daemon (Lucy)',
                    desc: 'Spike-Timing-Dependent Plasticity (STDP) synaptic memory. Reinforces verified patterns and exponetially decays stale context with zero cloud vector store.',
                    protocol: 'Local HNSW & Asymmetric STDP',
                    color: '#C084FC',
                  },
                  {
                    port: ':11434',
                    name: 'Ollama Silicon Model Foundry',
                    desc: 'Local quantized model weights (Qwen 2.5 Coder 32B, Llama 3.2). Direct GPU VRAM passthrough via WebGPU and Metal/CUDA.',
                    protocol: 'Localhost GGUF Native Inference',
                    color: '#D4AF37',
                  },
                ].map((s) => (
                  <Grid key={s.port} xs={12} sm={6}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: 3,
                        bgcolor: darkPaper,
                        borderColor: `${s.color}35`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontFamily: mono, fontWeight: 900, color: s.color, fontSize: '1.1rem' }}>
                          127.0.0.1{s.port}
                        </Typography>
                        <Chip label={s.protocol} size="small" sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 700 }} />
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontSize: '1rem' }}>
                        {s.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {s.desc}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Bottom Navigation */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={handlePrev} startIcon={<ArrowBackIcon />} sx={{ fontFamily: mono }}>
                  Back: The Whats
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontFamily: mono, fontWeight: 750, bgcolor: gold, color: '#000000', '&:hover': { bgcolor: '#F5E6AB' } }}
                >
                  Next: The 5-Phase Lifecycle (Frame 04)
                </Button>
              </Box>
            </Paper>
          )}

          {/* ======================================================== */}
          {/* FRAME 4: THE WHENS                                        */}
          {/* ======================================================== */}
          {activeFrameIndex === 3 && (
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3.5, bgcolor: cardBg, border: `1px solid ${goldBorder}` }}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<SpeedIcon sx={{ fontSize: '0.85rem !important', color: `${gold} !important` }} />}
                  label="FRAME 04 // 5-PHASE RUNTIME PLAY-BY-PLAY"
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.12)', color: gold, mb: 1.5 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  The When: <span style={{ color: gold }}>Lifecycle of an Autonomous Build</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860, fontSize: '1rem', lineHeight: 1.6 }}>
                  Step through the 5 millisecond-scale phases of how the 21-agent collective receives, debates, writes, red-teams, and ratifies code without human intervention.
                </Typography>
              </Box>

              {/* Phase Stepper Pills */}
              <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
                {[
                  { phase: 1, time: 'T+0ms', label: 'Entropy Audit' },
                  { phase: 2, time: 'T+45ms', label: 'Socratic Debate' },
                  { phase: 3, time: 'T+120ms', label: 'Parallel Synthesis' },
                  { phase: 4, time: 'T+210ms', label: 'Red-Team Fuzzing' },
                  { phase: 5, time: 'T+320ms', label: 'Quorum Ratification' },
                ].map((p) => (
                  <Chip
                    key={p.phase}
                    label={`Phase ${p.phase}: ${p.label} (${p.time})`}
                    onClick={() => setActivePhase(p.phase)}
                    clickable
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      bgcolor: activePhase === p.phase ? gold : isDark ? '#141420' : '#F2F4F7',
                      color: activePhase === p.phase ? '#000000' : isDark ? '#EDEFF2' : '#344054',
                      border: '1px solid',
                      borderColor: activePhase === p.phase ? gold : 'transparent',
                    }}
                  />
                ))}
              </Stack>

              {/* Active Phase Deep Dive Card */}
              <Card variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: darkPaper, borderColor: goldBorder, mb: 3 }}>
                {activePhase === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: gold, mb: 1 }}>
                      Phase 1 (T+0ms): Input Ingestion &amp; Shannon Entropy Gate
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Before any LLM sees the prompt, Sentinel evaluates the request against mathematical Shannon entropy limits:
                      <Box component="span" sx={{ fontFamily: mono, color: '#38BDF8', ml: 1 }}>
                        H(X) = -Σ P(x) log₂ P(x)
                      </Box>
                      . If entropy exceeds 7.2 bits/byte, the payload is rejected as an obfuscated shell injection attack.
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: isDark ? '#000000' : '#F8FAFC', fontFamily: mono, fontSize: '0.78rem', color: '#10B981' }}>
                      [SENTINEL :8989] Payload verified: 421 bytes · Shannon Entropy: 4.31 bits/byte (SAFE) · Forwarding to Architects Cadre.
                    </Paper>
                  </Box>
                )}
                {activePhase === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#38BDF8', mb: 1 }}>
                      Phase 2 (T+45ms): Socratic Triad Consensus Deliberation
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Azoth (Proponent) drafts an AST mutation thesis. Kai (Skeptic) interrogates edge cases, race hazards, and memory leaks. Draco (Consensus Arbiter) computes Bayesian confidence to reach a ratified architectural contract.
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: isDark ? '#000000' : '#F8FAFC', fontFamily: mono, fontSize: '0.78rem', color: '#38BDF8' }}>
                      [SOCRATIC_ARENA :8102] Azoth: Thesis DAG proposed → Kai: Probing 3 async race vectors → Draco: Bayesian Posterior 0.984 (APPROVED).
                    </Paper>
                  </Box>
                )}
                {activePhase === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#C084FC', mb: 1 }}>
                      Phase 3 (T+120ms): Parallel Cadre Multi-Discipline Synthesis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      All 4 technical cadres execute concurrently: Hephaestus writes TypeScript core logic, Vulcan compiles WGSL compute shaders, Apollo emits WCAG AAA color tokens, and Chronos builds the immutable commit DAG.
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: isDark ? '#000000' : '#F8FAFC', fontFamily: mono, fontSize: '0.78rem', color: '#C084FC' }}>
                      [PARALLEL_EXEC] Hephaestus: 142 LOC emitted · Vulcan: WGSL Matmul Shader OK · Apollo: Dark UI contrast verified 12.8:1.
                    </Paper>
                  </Box>
                )}
                {activePhase === 4 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F87171', mb: 1 }}>
                      Phase 4 (T+210ms): Adversarial Red-Team Fuzzing Assault
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Lycan and Onyx simulate 50+ exploit vectors against the synthesized AST. They test prototype pollution, loopback port binding bypasses, and memory buffer overflows with zero external telemetry.
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: isDark ? '#000000' : '#F8FAFC', fontFamily: mono, fontSize: '0.78rem', color: '#F87171' }}>
                      [RED_TEAM :8102] Lycan: Injected 50 fuzzing mutations · 0 vulnerabilities detected · Memory page mlock active.
                    </Paper>
                  </Box>
                )}
                {activePhase === 5 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#34D399', mb: 1 }}>
                      Phase 5 (T+320ms): 2f+1 Quorum Ratification &amp; Disk Commit
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      A supermajority (15 of 21 agents) signs the SHA-256 Merkle root. Janus advances the Lamport epoch counter and commits the files to disk. The neuro-memory daemon records synaptic potentiations for future recall.
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: isDark ? '#000000' : '#F8FAFC', fontFamily: mono, fontSize: '0.78rem', color: '#34D399' }}>
                      [MERKLE_ROOT] Quorum supermajority achieved (21/21 votes) · Hash 4a8e...f219 committed · Lamport Epoch 1,842 ratified.
                    </Paper>
                  </Box>
                )}
              </Card>

              {/* Bottom Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={handlePrev} startIcon={<ArrowBackIcon />} sx={{ fontFamily: mono }}>
                  Back: The Hows
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontFamily: mono, fontWeight: 750, bgcolor: gold, color: '#000000', '&:hover': { bgcolor: '#F5E6AB' } }}
                >
                  Next: Real-World Visuals (Frame 05)
                </Button>
              </Box>
            </Paper>
          )}

          {/* ======================================================== */}
          {/* FRAME 5: WHAT HAPPENS USING IT                             */}
          {/* ======================================================== */}
          {activeFrameIndex === 4 && (
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3.5, bgcolor: cardBg, border: `1px solid ${goldBorder}` }}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={<BoltIcon sx={{ fontSize: '0.85rem !important', color: `${gold} !important` }} />}
                  label="FRAME 05 // REAL-WORLD VISUAL EXECUTION"
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.12)', color: gold, mb: 1.5 }}
                />
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  Using It: <span style={{ color: gold }}>Live Multi-Agent Mesh Visualizer</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 860, fontSize: '1rem', lineHeight: 1.6 }}>
                  Watch the 21 sovereign agents exchange force-directed telemetry in real time. The canvas below renders live nodes, packet pulses, and zero-egress loopback channels.
                </Typography>
              </Box>

              {/* Embedded Live Canvas Visualizer */}
              <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', border: `1px solid ${goldBorder}` }}>
                <SwarmCanvasVisualizer />
              </Box>

              {/* Status Chips */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 3 }}>
                <Chip label="21-AGENT TOPOLOGY" size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(212,175,55,0.18)', color: gold }} />
                <Chip label="AIR-GAPPED ARCHITECTURE" size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399' }} />
                <Chip label="ZERO CLOUD EGRESS" size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(52,211,153,0.12)', color: '#34D399' }} />
              </Stack>

              {/* Bottom Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={handlePrev} startIcon={<ArrowBackIcon />} sx={{ fontFamily: mono }}>
                  Back: The Whens
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontFamily: mono, fontWeight: 750, bgcolor: gold, color: '#000000', '&:hover': { bgcolor: '#F5E6AB' } }}
                >
                  Final: Launch the Matrix (Frame 06)
                </Button>
              </Box>
            </Paper>
          )}

          {/* ======================================================== */}
          {/* FRAME 6: TAKE FLIGHT (LAUNCH & COCKPIT ACCESS)            */}
          {/* ======================================================== */}
          {activeFrameIndex === 5 && (
            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3.5, bgcolor: cardBg, border: `1px solid ${goldBorder}` }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: '0.85rem !important', color: '#10B981 !important' }} />}
                  label="FRAME 06 // JOURNEY COMPLETE · SYSTEM READY"
                  size="small"
                  sx={{ fontFamily: mono, fontWeight: 800, bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399', mb: 1.5 }}
                />
                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1 }}>
                  Take Flight: <span style={{ color: gold }}>Enter the Sovereign Swarm</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  You have completed the play-by-play journey. The 21-agent collective is ready for operator commands on local loopback. Choose your next action below.
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ my: 2 }}>
                {/* 1. Enter Live Cockpit */}
                <Grid xs={12} sm={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: darkPaper,
                      borderColor: gold,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 8px 28px rgba(212,175,55,0.15)',
                    }}
                  >
                    <Box>
                      <Chip label="PRIMARY RUNTIME" size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: gold, color: '#000', mb: 1.5 }} />
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        Launch Live Multiplexer Cockpit
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                        Access the interactive 21-terminal daemon multiplexer, inspect live SSE streams, dispatch parallel tasks, and test cadre loopback latency.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={onEnterCockpit}
                      endIcon={<TerminalIcon />}
                      fullWidth
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        bgcolor: gold,
                        color: '#000000',
                        py: 1.2,
                        '&:hover': { bgcolor: '#F5E6AB' },
                      }}
                    >
                      Enter Live Cockpit (:8989)
                    </Button>
                  </Card>
                </Grid>

                {/* 2. Run Daemon Locally */}
                <Grid xs={12} sm={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor: darkPaper,
                      borderColor: `${goldBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Chip label="LOCAL CLI OPERATION" size="small" sx={{ fontFamily: mono, fontWeight: 800, bgcolor: isDark ? '#1F2937' : '#E5E7EB', color: 'text.primary', mb: 1.5 }} />
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        Start Swarm Daemon Locally
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                        Start the Python multiplexer daemon on port 8989 to stream real-time agent state into the browser with zero cloud overhead.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText('cd zoth-micro-repos/zoth-swarm-multiplexer && python3 swarm_daemon.py');
                        setCopiedCmd(true);
                        setTimeout(() => setCopiedCmd(false), 2200);
                      }}
                      startIcon={copiedCmd ? <CheckIcon /> : <ContentCopyIcon />}
                      fullWidth
                      sx={{
                        fontFamily: mono,
                        fontWeight: 750,
                        borderColor: goldBorder,
                        color: gold,
                        py: 1.2,
                      }}
                    >
                      {copiedCmd ? 'Command Copied to Clipboard!' : 'Copy Daemon Start Command'}
                    </Button>
                  </Card>
                </Grid>
              </Grid>

              {/* Bottom Replay Action */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => handleJump(0)}
                  startIcon={<ReplayIcon />}
                  sx={{ fontFamily: mono, color: 'text.secondary', fontWeight: 700 }}
                >
                  Replay Journey from Frame 01
                </Button>
              </Box>
            </Paper>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
