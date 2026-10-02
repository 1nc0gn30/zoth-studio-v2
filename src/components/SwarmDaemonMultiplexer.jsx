import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Container, Typography, Chip, Card, CardContent, Unstable_Grid2 as Grid, Avatar, Stack,
  Button, Paper, Tooltip, IconButton, TextField, InputAdornment, Select, MenuItem, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Badge, Divider, LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TerminalIcon from '@mui/icons-material/Terminal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MemoryIcon from '@mui/icons-material/Memory';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CallSplitIcon from '@mui/icons-material/CallSplit';

import { pantheonAgents, pantheonCadres } from '../data/pantheon';
import { useStudioStatus } from '../studio/useStudioStatus';
import { useSovereignRuntime } from '../utils/sovereignRuntime';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const HARNESS_OPTIONS = [
  { id: 'hermes-agent', name: 'Hermes Agent', icon: '🐲' },
  { id: 'agy', name: 'Antigravity (Agy)', icon: '🐺' },
  { id: 'codex', name: 'OpenAI Codex CLI', icon: '🤖' },
  { id: 'claude-code', name: 'Claude Code CLI', icon: '🦊' },
  { id: 'opencode', name: 'OpenCode CLI', icon: '⚡' },
  { id: 'ollama', name: 'Ollama Local Ring-0', icon: '🦙' },
  { id: 'groq', name: 'Groq LPU Engine', icon: '🚀' },
  { id: 'openrouter', name: 'OpenRouter Sovereign', icon: '🌐' },
];

const MODEL_OPTIONS = [
  'claude-3-7-sonnet',
  'claude-3-5-sonnet',
  'gemini-2.5-pro',
  'gpt-4.5',
  'deepseek-r1:70b',
  'qwen2.5-coder:32b',
  'llama3.3:70b',
  'hermes-3:70b',
];

const QUICK_COMMANDS = [
  'zoth status --air-gap',
  'git status -s',
  'stdp memory sync --daemon',
  'verify zero-egress',
  'npm run build',
  'cat /etc/zoth/invariants.conf',
];

const CADRE_THEME_COLORS = {
  Architects: { dark: '#D4AF37', light: '#8A6A09', bgDark: 'rgba(212,175,55,0.12)', bgLight: '#FEF9E7' },
  Code: { dark: '#38BDF8', light: '#0284C7', bgDark: 'rgba(56,189,248,0.12)', bgLight: '#E0F2FE' },
  Security: { dark: '#F87171', light: '#DC2626', bgDark: 'rgba(248,113,113,0.12)', bgLight: '#FEE2E2' },
  Creative: { dark: '#C084FC', light: '#7C3AED', bgDark: 'rgba(192,132,252,0.12)', bgLight: '#F3E8FF' },
  Swarm: { dark: '#34D399', light: '#059669', bgDark: 'rgba(52,211,153,0.12)', bgLight: '#D1FADF' },
};

export default function SwarmDaemonMultiplexer({ embedded = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isLocal } = useSovereignRuntime();
  const { status } = useStudioStatus();

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldText = isDark ? '#F5E6AB' : '#715507';
  const voidDark = isDark ? '#08080B' : '#FFFFFF';
  const cardSurface = isDark ? '#0C0D16' : '#FFFFFF';
  const terminalBg = isDark ? '#05050A' : '#0B0F19';
  const borderCol = isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.28)';

  // View mode: 'matrix' (all 21), 'cadre' (filtered group), 'spotlight' (single agent)
  const [viewMode, setViewMode] = useState('matrix');
  const [selectedCadre, setSelectedCadre] = useState('All');
  const [spotlightAgentId, setSpotlightAgentId] = useState('AZOTH');
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Agent dynamic states
  const [agentStates, setAgentStates] = useState(() => {
    const states = {};
    pantheonAgents.forEach((agent, idx) => {
      const defaultHarness = idx % 2 === 0 ? 'agy' : (idx % 3 === 0 ? 'hermes-agent' : 'claude-code');
      const defaultModel = idx % 2 === 0 ? 'claude-3-7-sonnet' : 'deepseek-r1:70b';
      const defaultPwd = agent.cadre === 'Security'
        ? '~/NullAITech/NullAI-HexStrike-AI-Terminal'
        : (agent.cadre === 'Creative'
          ? '~/NullAITech/zoth-webgen'
          : '~/NullAITech/zoth-studio-v2');

      states[agent.id] = {
        harness: defaultHarness,
        model: defaultModel,
        pwd: defaultPwd,
        status: 'IDLE',
        pid: 1024 + idx * 7,
        input: '',
        copied: false,
        memoryScore: 92 + (idx % 8),
        synapses: 140 + idx * 12,
        logs: [
          { type: 'system', text: `[${agent.id} STANDBY] Agent harness initialized in ${agent.cadre} cadre.` },
          { type: 'thought', text: `Monitoring cadre channel #${agent.cadre.toLowerCase()}. Ready for sovereign tasks.` },
        ],
      };
    });
    return states;
  });

  // Filtered agents
  const visibleAgents = useMemo(() => {
    if (viewMode === 'spotlight') {
      return pantheonAgents.filter((a) => a.id === spotlightAgentId);
    }
    if (selectedCadre === 'All') return pantheonAgents;
    return pantheonAgents.filter((a) => a.cadre === selectedCadre);
  }, [selectedCadre, viewMode, spotlightAgentId]);

  // Terminal scroll anchors
  const termEndRefs = useRef({});

  const scrollToBottom = (agentId) => {
    if (termEndRefs.current[agentId]) {
      termEndRefs.current[agentId].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Execute command on a single agent
  const handleExecute = (agentId, cmdToRun = null) => {
    const agent = agentStates[agentId];
    if (!agent) return;
    const command = (cmdToRun || agent.input).trim();
    if (!command) return;

    const timeStr = new Date().toLocaleTimeString();

    setAgentStates((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        input: '',
        status: 'RUNNING',
        logs: [
          ...prev[agentId].logs,
          { type: 'user', text: `$ ${command}`, time: timeStr },
          { type: 'thought', text: `Analyzing task via ${prev[agentId].harness} [${prev[agentId].model}] in ${prev[agentId].pwd}...` },
        ],
      },
    }));

    setTimeout(() => {
      let outputText = '';
      if (command.includes('status')) {
        outputText = `[${agentId} STATUS] OK · Memory: ${agent.memoryScore}% · Synapses: ${agent.synapses} · Egress: 0 Bytes · PID: ${agent.pid}`;
      } else if (command.includes('git')) {
        outputText = `On branch main\nYour branch is up to date with 'origin/main'.\nnothing to commit, working tree clean`;
      } else if (command.includes('stdp') || command.includes('memory')) {
        outputText = `✔ STDP Synaptic Matrix local tick. LTP weight reinforced (+0.05).`;
      } else if (command.includes('build')) {
        outputText = `✔ Built 1234 modules in 4.8s. All 72 routes prerendered with Schema.org graph.`;
      } else {
        outputText = `[${agentId} EXECUTION OK] Command completed with code 0 in ${agent.pwd}.\nOutputs buffered locally in zero-knowledge enclave.`;
      }

      setAgentStates((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'IDLE',
          logs: [
            ...prev[agentId].logs,
            { type: 'assistant', text: outputText, time: new Date().toLocaleTimeString() },
          ],
        },
      }));
    }, 450);
  };

  // Broadcast command to all visible agents
  const handleBroadcast = () => {
    const cmd = broadcastInput.trim();
    if (!cmd) return;
    setIsBroadcasting(true);

    visibleAgents.forEach((agent) => {
      handleExecute(agent.id, cmd);
    });

    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastInput('');
    }, 600);
  };

  const handleUpdateHarness = (agentId, harness) => {
    setAgentStates((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        harness,
        logs: [
          ...prev[agentId].logs,
          { type: 'system', text: `Harness switched to [${harness}]. Environment variables re-seeded.` },
        ],
      },
    }));
  };

  const handleUpdateModel = (agentId, model) => {
    setAgentStates((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        model,
        logs: [
          ...prev[agentId].logs,
          { type: 'system', text: `Model weights re-routed to [${model}]. Zero-egress tokens cached.` },
        ],
      },
    }));
  };

  const handleClearLogs = (agentId) => {
    setAgentStates((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        logs: [{ type: 'system', text: `Terminal context reset. STDP synapses preserved.` }],
      },
    }));
  };

  const handleCopyLogs = (agentId) => {
    const logs = agentStates[agentId]?.logs || [];
    const text = logs.map((l) => `${l.type.toUpperCase()}: ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setAgentStates((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], copied: true },
    }));
    setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        [agentId]: { ...prev[agentId], copied: false },
      }));
    }, 1500);
  };

  return (
    <Box sx={{ width: '100%', py: embedded ? 1 : 3 }}>
      {/* ─── MASTER CONTROLLER HEADER ─── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          bgcolor: cardSurface,
          border: `1px solid ${borderCol}`,
          borderRadius: 3,
          boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.06)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(8,8,11,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(254,249,231,0.8) 0%, #FFFFFF 100%)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Title & Telemetry */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(212,175,55,0.15)' : '#FEF9E7',
                border: `1.5px solid ${gold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: gold,
              }}
            >
              <TerminalIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: mono, color: isDark ? '#FFFFFF' : '#101828' }}>
                  SWARM DAEMON MATRIX
                </Typography>
                <Chip
                  size="small"
                  label="21 AGENTS ONLINE"
                  sx={{
                    bgcolor: isDark ? 'rgba(52,211,153,0.15)' : '#D1FADF',
                    color: isDark ? '#34D399' : '#059669',
                    fontFamily: mono,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#059669'}`,
                  }}
                />
                {isLocal && status?.services?.swarm && (
                  <Chip
                    size="small"
                    label={status.services.swarm.up ? `DAEMON :${status.services.swarm.port} UP` : `PORT :${status.services.swarm.port} STANDBY`}
                    sx={{
                      bgcolor: status.services.swarm.up ? (isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7') : (isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7'),
                      color: status.services.swarm.up ? '#22C55E' : '#D97706',
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      border: '1px solid',
                      borderColor: status.services.swarm.up ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)',
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#475467', fontFamily: mono }}>
                ZERO-EGRESS AIR-GAPPED PROCESS MULTIPLEXER // WORKSPACE HARNESS
              </Typography>
            </Box>
          </Box>

          {/* View Mode Switcher */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant={viewMode === 'matrix' ? 'contained' : 'outlined'}
              startIcon={<ViewModuleIcon />}
              onClick={() => setViewMode('matrix')}
              sx={{
                bgcolor: viewMode === 'matrix' ? gold : 'transparent',
                color: viewMode === 'matrix' ? '#08080B' : (isDark ? '#E5E7EB' : '#101828'),
                borderColor: borderCol,
                fontFamily: mono,
                fontWeight: 750,
                '&:hover': { bgcolor: viewMode === 'matrix' ? gold : (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7') }
              }}
            >
              Matrix (21)
            </Button>
            <Button
              size="small"
              variant={viewMode === 'cadre' ? 'contained' : 'outlined'}
              startIcon={<CallSplitIcon />}
              onClick={() => setViewMode('cadre')}
              sx={{
                bgcolor: viewMode === 'cadre' ? gold : 'transparent',
                color: viewMode === 'cadre' ? '#08080B' : (isDark ? '#E5E7EB' : '#101828'),
                borderColor: borderCol,
                fontFamily: mono,
                fontWeight: 750,
                '&:hover': { bgcolor: viewMode === 'cadre' ? gold : (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7') }
              }}
            >
              Cadre Split
            </Button>
            <Button
              size="small"
              variant={viewMode === 'spotlight' ? 'contained' : 'outlined'}
              startIcon={<CenterFocusStrongIcon />}
              onClick={() => setViewMode('spotlight')}
              sx={{
                bgcolor: viewMode === 'spotlight' ? gold : 'transparent',
                color: viewMode === 'spotlight' ? '#08080B' : (isDark ? '#E5E7EB' : '#101828'),
                borderColor: borderCol,
                fontFamily: mono,
                fontWeight: 750,
                '&:hover': { bgcolor: viewMode === 'spotlight' ? gold : (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7') }
              }}
            >
              Spotlight
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

        {/* ─── FILTERS & BROADCAST DECK ─── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Cadre Filter Chips */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
            {pantheonCadres.map((c) => {
              const count = c === 'All' ? 21 : pantheonAgents.filter((a) => a.cadre === c).length;
              const isSelected = selectedCadre === c;
              return (
                <Chip
                  key={c}
                  label={`${c.toUpperCase()} (${count})`}
                  onClick={() => setSelectedCadre(c)}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 750,
                    fontSize: '0.78rem',
                    bgcolor: isSelected ? gold : (isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9'),
                    color: isSelected ? '#08080B' : (isDark ? '#D1D5DB' : '#334155'),
                    border: `1px solid ${isSelected ? gold : borderCol}`,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: isSelected ? gold : (isDark ? 'rgba(212,175,55,0.15)' : '#FEF9E7') },
                  }}
                />
              );
            })}
          </Stack>

          {/* Global Broadcast Command Input */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: { xs: '100%', md: 440 } }}>
            <TextField
              size="small"
              fullWidth
              value={broadcastInput}
              onChange={(e) => setBroadcastInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
              placeholder="⚡ Broadcast instruction or command to all 21 agents..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BoltIcon sx={{ color: gold, fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: {
                  fontFamily: mono,
                  fontSize: '0.82rem',
                  bgcolor: terminalBg,
                  color: isDark ? '#E5E7EB' : '#101828',
                  borderRadius: 1.5,
                  '& fieldset': { borderColor: borderCol },
                  '&:hover fieldset': { borderColor: gold },
                },
              }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={handleBroadcast}
              disabled={isBroadcasting || !broadcastInput.trim()}
              startIcon={<SendIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: gold,
                color: '#08080B',
                fontFamily: mono,
                fontWeight: 800,
                px: 2,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7209' },
              }}
            >
              Broadcast
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ─── 21-TERMINAL MATRIX GRID ─── */}
      <Grid container spacing={2}>
        {visibleAgents.map((agent) => {
          const state = agentStates[agent.id] || {};
          const cadreStyle = CADRE_THEME_COLORS[agent.cadre] || CADRE_THEME_COLORS.Architects;
          const cadreColor = isDark ? cadreStyle.dark : cadreStyle.light;
          const cadreBg = isDark ? cadreStyle.bgDark : cadreStyle.bgLight;

          const isSpotlight = viewMode === 'spotlight' || spotlightAgentId === agent.id;
          const colSpan = viewMode === 'spotlight' ? 12 : (viewMode === 'cadre' ? { xs: 12, md: 6 } : { xs: 12, sm: 6, lg: 4 });

          return (
            <Grid xs={colSpan.xs || 12} sm={colSpan.sm || 12} lg={colSpan.lg || 12} md={colSpan.md || 12} key={agent.id}>
              <Card
                sx={{
                  bgcolor: cardSurface,
                  border: `1.5px solid ${isSpotlight ? gold : borderCol}`,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  boxShadow: isSpotlight
                    ? `0 0 24px -6px ${gold}`
                    : (isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.05)'),
                  '&:hover': {
                    borderColor: gold,
                    transform: viewMode === 'matrix' ? 'translateY(-2px)' : 'none',
                  },
                }}
              >
                {/* ── Card Header ── */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                    borderBottom: `1px solid ${borderCol}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Avatar
                      src={agent.img}
                      alt={agent.id}
                      sx={{
                        width: 32,
                        height: 32,
                        border: `1.5px solid ${cadreColor}`,
                        boxShadow: `0 0 8px ${cadreColor}44`,
                      }}
                    />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono, color: isDark ? '#FFFFFF' : '#101828', fontSize: '0.9rem' }}>
                          {agent.id}
                        </Typography>
                        <Chip
                          size="small"
                          label={agent.cadre.toUpperCase()}
                          sx={{
                            bgcolor: cadreBg,
                            color: cadreColor,
                            fontFamily: mono,
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            height: 18,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: isDark ? '#9CA3AF' : '#64748B', fontSize: '0.72rem', display: 'block', lineHeight: 1.1 }}>
                        {agent.role}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions / Status */}
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={state.status || 'IDLE'}
                      sx={{
                        bgcolor: state.status === 'RUNNING' ? 'rgba(56,189,248,0.2)' : 'rgba(52,211,153,0.15)',
                        color: state.status === 'RUNNING' ? '#38BDF8' : '#34D399',
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        height: 20,
                        fontWeight: 750,
                      }}
                    />
                    <Tooltip title="Spotlight this agent">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSpotlightAgentId(agent.id);
                          setViewMode(viewMode === 'spotlight' ? 'matrix' : 'spotlight');
                        }}
                        sx={{ color: gold }}
                      >
                        {viewMode === 'spotlight' ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* ── Harness, Model & PWD Selectors ── */}
                <Box
                  sx={{
                    px: 1.8,
                    py: 1,
                    bgcolor: isDark ? 'rgba(8,8,11,0.5)' : '#F1F5F9',
                    borderBottom: `1px solid ${borderCol}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Harness & Model */}
                  <Stack direction="row" spacing={1} sx={{ flex: 1, minWidth: { xs: '100%', sm: 260 } }}>
                    <FormControl size="small" sx={{ minWidth: 125, flex: 1 }}>
                      <Select
                        value={state.harness}
                        onChange={(e) => handleUpdateHarness(agent.id, e.target.value)}
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.72rem',
                          bgcolor: cardSurface,
                          color: isDark ? '#E5E7EB' : '#101828',
                          height: 26,
                          '& .MuiSelect-select': { py: 0.5, px: 1 },
                        }}
                      >
                        {HARNESS_OPTIONS.map((h) => (
                          <MenuItem key={h.id} value={h.id} sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                            {h.icon} {h.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 140, flex: 1.2 }}>
                      <Select
                        value={state.model}
                        onChange={(e) => handleUpdateModel(agent.id, e.target.value)}
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.72rem',
                          bgcolor: cardSurface,
                          color: isDark ? '#E5E7EB' : '#101828',
                          height: 26,
                          '& .MuiSelect-select': { py: 0.5, px: 1 },
                        }}
                      >
                        {MODEL_OPTIONS.map((m) => (
                          <MenuItem key={m} value={m} sx={{ fontFamily: mono, fontSize: '0.75rem' }}>
                            {m}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* STDP Memory Score Badge */}
                  <Tooltip title={`STDP Synapses: ${state.synapses} | Memory Retention: ${state.memoryScore}%`}>
                    <Chip
                      size="small"
                      icon={<PsychologyIcon sx={{ fontSize: '13px !important', color: `${gold} !important` }} />}
                      label={`${state.memoryScore}% MEM`}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        height: 22,
                        bgcolor: isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7',
                        color: goldText,
                        fontWeight: 750,
                        border: `1px solid ${gold}44`,
                      }}
                    />
                  </Tooltip>
                </Box>

                {/* ── Working Directory (PWD) Banner ── */}
                <Box
                  sx={{
                    px: 1.8,
                    py: 0.6,
                    bgcolor: isDark ? '#06060A' : '#E2E8F0',
                    borderBottom: `1px solid ${borderCol}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, overflow: 'hidden' }}>
                    <FolderIcon sx={{ color: gold, fontSize: 14 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        color: isDark ? '#9CA3AF' : '#475467',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {state.pwd}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.65rem', color: isDark ? '#6B7280' : '#64748B' }}>
                    PID:{state.pid}
                  </Typography>
                </Box>

                {/* ── Terminal Output REPL Console ── */}
                <Box
                  sx={{
                    bgcolor: terminalBg,
                    p: 1.5,
                    height: isSpotlight ? 420 : 210,
                    overflowY: 'auto',
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                  }}
                >
                  {state.logs.map((log, lIdx) => {
                    if (log.type === 'system') {
                      return (
                        <Box key={lIdx} sx={{ color: isDark ? '#60A5FA' : '#2563EB', fontSize: '0.70rem' }}>
                          ⚡ {log.text}
                        </Box>
                      );
                    }
                    if (log.type === 'thought') {
                      return (
                        <Box key={lIdx} sx={{ color: isDark ? '#A78BFA' : '#7C3AED', fontStyle: 'italic', opacity: 0.9 }}>
                          💭 &lt;thought&gt; {log.text}
                        </Box>
                      );
                    }
                    if (log.type === 'user') {
                      return (
                        <Box key={lIdx} sx={{ color: gold, fontWeight: 700 }}>
                          {log.text}
                        </Box>
                      );
                    }
                    return (
                      <Box key={lIdx} sx={{ color: isDark ? '#E5E7EB' : '#F8FAFC', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {log.text}
                      </Box>
                    );
                  })}
                  <div ref={(el) => (termEndRefs.current[agent.id] = el)} />
                </Box>

                {/* ── Interactive Command Input & Action Bar ── */}
                <Box
                  sx={{
                    p: 1.25,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                    borderTop: `1px solid ${borderCol}`,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={state.input}
                      onChange={(e) =>
                        setAgentStates((prev) => ({
                          ...prev,
                          [agent.id]: { ...prev[agent.id], input: e.target.value },
                        }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleExecute(agent.id)}
                      placeholder={`Send command to ${agent.id}...`}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><span style={{ color: gold, fontFamily: mono }}>$</span></InputAdornment>,
                        sx: {
                          fontFamily: mono,
                          fontSize: '0.74rem',
                          height: 30,
                          bgcolor: cardSurface,
                          color: isDark ? '#E5E7EB' : '#101828',
                          '& fieldset': { borderColor: borderCol },
                          '&:hover fieldset': { borderColor: gold },
                        },
                      }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleExecute(agent.id)}
                      disabled={!state.input?.trim()}
                      sx={{
                        bgcolor: gold,
                        color: '#08080B',
                        minWidth: 32,
                        px: 1.2,
                        fontFamily: mono,
                        fontWeight: 800,
                        '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7209' },
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 16 }} />
                    </Button>
                  </Box>

                  {/* Quick Presets & Utility Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto', py: 0.2 }}>
                      <Chip
                        size="small"
                        label="status"
                        onClick={() => handleExecute(agent.id, 'zoth status --air-gap')}
                        sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18, cursor: 'pointer' }}
                      />
                      <Chip
                        size="small"
                        label="stdp sync"
                        onClick={() => handleExecute(agent.id, 'stdp memory sync --daemon')}
                        sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18, cursor: 'pointer' }}
                      />
                      <Chip
                        size="small"
                        label="git diff"
                        onClick={() => handleExecute(agent.id, 'git status -s')}
                        sx={{ fontFamily: mono, fontSize: '0.62rem', height: 18, cursor: 'pointer' }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Copy transcript logs">
                        <IconButton size="small" onClick={() => handleCopyLogs(agent.id)} sx={{ p: 0.4, color: isDark ? '#9CA3AF' : '#475467' }}>
                          {state.copied ? <CheckIcon sx={{ fontSize: 14, color: '#34D399' }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Clear terminal">
                        <IconButton size="small" onClick={() => handleClearLogs(agent.id)} sx={{ p: 0.4, color: isDark ? '#9CA3AF' : '#475467' }}>
                          <RefreshIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
