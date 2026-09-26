import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, CardActions,
  Chip, Button, Paper, Stack, IconButton, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import GitHubIcon from '@mui/icons-material/GitHub';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import ShieldIcon from '@mui/icons-material/Shield';
import TerminalIcon from '@mui/icons-material/Terminal';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import LockIcon from '@mui/icons-material/Lock';
import HubIcon from '@mui/icons-material/Hub';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ConstructionIcon from '@mui/icons-material/Construction';
import DnsIcon from '@mui/icons-material/Dns';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Preserved Components
import GoldenZLogo3D from '../components/GoldenZLogo3D';
import MathPillarsGrid from '../components/MathPillarsGrid';
import CompanyTicker from '../components/CompanyTicker';
import WebGPUAIConsole from '../components/WebGPUAIConsole';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';
import { microTools } from '../data/toolsData';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export function ServiceRow() {
  const { status, error } = useStudioStatus();
  const theme = useTheme();
  const services = status ? Object.values(status.services) : [];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
      {error && <Chip label="Status unavailable" size="small" sx={{ fontWeight: 700 }} />}
      {!status && !error && <Chip label="Checking local machine..." size="small" sx={{ fontWeight: 700 }} />}
      {services.map((service) => (
        <Chip
          key={service.name}
          label={`${({
            'Swarm multiplexer': 'Swarm :8989',
            'Neuro memory daemon': 'Memory :8094',
            'Sovereign agent bridge': 'Bridge :8102',
            'Azoth local agent': 'Azoth :8790',
            Ollama: 'Models :11434'
          })[service.name] || `${service.name} :${service.port}`} ${service.up ? 'READY' : 'OFFLINE'}`}
          size="small"
          sx={{
            fontWeight: 750,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            bgcolor: service.up
              ? theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.12)' : '#ECFDF3'
              : theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : '#F2F4F7',
            color: service.up
              ? theme.palette.mode === 'dark' ? '#34D399' : '#027A48'
              : theme.palette.text.secondary,
            border: '1px solid',
            borderColor: service.up
              ? theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.4)' : '#ABE5C6'
              : theme.palette.divider,
          }}
        />
      ))}
    </Box>
  );
}

/* ==========================================================================
   CLI TERMINAL SIMULATOR COMPONENT
   ========================================================================== */
function CliTerminalSimulator({ gold, isDark, monoFont }) {
  const [activeTab, setActiveTab] = useState('up');
  const [copied, setCopied] = useState(false);
  const [selectedTool, setSelectedTool] = useState('subsweep-lead-scanner');
  const [isSimulating, setIsSimulating] = useState(false);
  const { status } = useStudioStatus();

  const services = status?.services ? Object.values(status.services) : [];

  const commands = useMemo(() => ({
    up: {
      id: 'up',
      chipLabel: 'npx zoth up',
      desc: 'CLI sequence: initializes offline daemons (swarm, memory, bridge, studio)',
      cmd: 'npx zoth up',
      lines: [
        { type: 'command', text: '$ npx zoth up' },
        { type: 'dim', text: 'Zoth CLI 2.0.0 · launching sovereign enclaves...' },
        { type: 'empty', text: '' },
        { type: 'success', text: '✔ swarm    ready (21-Agent Multiplexer Daemon)' },
        { type: 'success', text: '✔ memory   ready (STDP Vector Memory Engine)' },
        { type: 'success', text: '✔ bridge   ready (Sovereign Peer Bus & Signal Mesh)' },
        { type: 'success', text: '✔ azoth    ready (Archon Orchestrator Core)' },
        { type: 'success', text: '✔ ollama   ready (Local GGUF Silicon Models)' },
        { type: 'success', text: '✔ studio   ready (In-Browser Zero-Egress Studio)' },
        { type: 'empty', text: '' },
        { type: 'gold', text: '★ All sovereign enclaves initialized. Zero external telemetry active.' },
      ],
    },
    status: {
      id: 'status',
      chipLabel: 'npx zoth status',
      desc: 'Live probe: inspects local daemon sockets and hardware readiness',
      cmd: 'npx zoth status',
      lines: [
        { type: 'command', text: '$ npx zoth status' },
        { type: 'dim', text: 'Zoth CLI 2.0.0 · probing local daemon sockets & hardware...' },
        { type: 'empty', text: '' },
        ...(services.length > 0
          ? services.map((s) => ({
              type: s.up ? 'success' : 'dim',
              text: `  ${s.up ? 'up ' : 'off'}   ${s.name.padEnd(24)} (${s.up ? 'Active listener' : 'Offline · run npx zoth up'})`,
            }))
          : [
              { type: 'dim', text: '  off  Swarm Multiplexer       (Offline · run npx zoth up)' },
              { type: 'dim', text: '  off  Neuro Memory Daemon     (Offline · run npx zoth up)' },
              { type: 'dim', text: '  off  Sovereign Agent Bridge  (Offline · run npx zoth up)' },
              { type: 'dim', text: '  off  Azoth Local Agent       (Offline · run npx zoth up)' },
              { type: 'dim', text: '  off  Ollama Local Engine     (Offline · run ollama serve)' },
            ]),
        { type: 'empty', text: '' },
        { type: 'cyan', text: 'Sovereign Tool Repositories: 25/25 verified on disk' },
        { type: 'gold', text: 'OWASP Zero-Egress Invariant: 0 outbound connections detected. Host air-gapped.' },
      ],
    },
    pull: {
      id: 'pull',
      chipLabel: 'npx zoth pull <tool>',
      desc: 'Pulls standalone tool repositories with zero telemetry',
      cmd: `npx zoth pull ${selectedTool}`,
      lines: [
        { type: 'command', text: `$ npx zoth pull ${selectedTool}` },
        { type: 'dim', text: `Zoth CLI 2.0.0 · fetching air-gapped repository: ${selectedTool}...` },
        { type: 'empty', text: '' },
        { type: 'cyan', text: `Cloning repository: ${selectedTool} from @NullAITech` },
        { type: 'success', text: `✔ Created ./tools/${selectedTool}` },
        { type: 'success', text: '✔ Linked STDP synaptic memory client (local memory enclave)' },
        { type: 'success', text: '✔ Configured Swarm telemetry multiplexer (loopback process)' },
        { type: 'success', text: '✔ Verified Argon2id key derivation & zero cloud telemetry invariants' },
        { type: 'empty', text: '' },
        { type: 'gold', text: `Ready: cd tools/${selectedTool} && npm start` },
      ],
    },
  }), [selectedTool]);

  const activeData = commands[activeTab];

  const handleCopy = (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  return (
    <Box sx={{ mb: 9, pt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography className="section-kicker">Local Terminal Control</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Autonomous CLI &amp; <span className="text-gradient-gold">Enclave Orchestrator</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.65 }}>
            Spin up offline memory daemons, inspect loopback enclaves, and scaffold air-gapped agent cadres with zero cloud dependencies.
          </Typography>
        </Box>
        <Chip
          icon={<TerminalIcon sx={{ fontSize: '1rem !important', color: gold.accent }} />}
          label="NPM &amp; NPX RUNTIME VERIFIED"
          sx={{
            fontFamily: monoFont,
            fontWeight: 800,
            fontSize: '0.72rem',
            bgcolor: gold.wash,
            color: gold.accent,
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`,
          }}
        />
      </Box>

      {/* Terminal Window Box */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 2.5, md: 3.5 },
          overflow: 'hidden',
          maxWidth: '100%',
          boxSizing: 'border-box',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.25)'}`,
          bgcolor: isDark ? '#050508' : '#0F172A',
          boxShadow: isDark
            ? '0 20px 48px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.08)'
            : '0 20px 48px rgba(15,23,42,0.18)',
        }}
      >
        {/* Terminal Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: { xs: 1.1, sm: 1.4 },
            bgcolor: isDark ? '#0A0A10' : '#1E293B',
            borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.1)'}`,
            flexWrap: 'wrap',
            gap: 1.25,
            position: 'relative',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle horizontal gold accent line at bottom edge of header */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              bgcolor: gold.wash,
              opacity: isDark ? 0.35 : 0.25,
              pointerEvents: 'none',
            }}
          />

          {/* Traffic light dots + Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexShrink: 0 }}>
              {[
                { color: '#EF4444' },
                { color: '#F59E0B' },
                { color: '#10B981' },
              ].map((dot, dIdx) => (
                <Box
                  key={dIdx}
                  sx={{
                    position: 'relative',
                    width: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(212,175,55,0.28)' : 'rgba(184,134,11,0.25)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      bgcolor: dot.color,
                    }}
                  />
                </Box>
              ))}
            </Box>
            <Typography
              noWrap
              sx={{
                fontFamily: monoFont,
                fontSize: { xs: '0.70rem', sm: '0.8rem' },
                color: isDark ? '#94A3B8' : '#CBD5E1',
                ml: 0.75,
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              neo@zoth-metal:~ (bash)
            </Typography>
          </Box>

          {/* Action Buttons: Copy & Run */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 'auto', sm: 0 } }}>
            <Button
              size="small"
              onClick={handleRunSimulation}
              startIcon={<PlayArrowIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{
                fontFamily: monoFont,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: '#F5E6AB',
                background: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(212,175,55,0.04) 0px, rgba(212,175,55,0.04) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #181820 0%, #0e0e16 100%)'
                  : 'repeating-linear-gradient(0deg, rgba(184,134,11,0.04) 0px, rgba(184,134,11,0.04) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #2D3A4D 0%, #1F2A3A 100%)',
                border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                px: { xs: 1.25, sm: 2 },
                py: 0.45,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: isDark
                    ? 'repeating-linear-gradient(0deg, rgba(212,175,55,0.07) 0px, rgba(212,175,55,0.07) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #242435 0%, #141420 100%)'
                    : 'repeating-linear-gradient(0deg, rgba(184,134,11,0.07) 0px, rgba(184,134,11,0.07) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #384255 0%, #253042 100%)',
                  borderColor: '#D4AF37',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.4), 0 0 12px rgba(212,175,55,0.15)',
                },
              }}
            >
              Replay
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleCopy(activeData.cmd)}
              startIcon={copied ? <CheckIcon sx={{ fontSize: '0.9rem !important' }} /> : <ContentCopyIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{
                fontFamily: monoFont,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 750,
                bgcolor: copied ? '#059669' : '#D4AF37',
                color: copied ? '#FFFFFF' : (isDark ? '#08080B' : '#101828'),
                borderRadius: 2,
                boxShadow: copied
                  ? 'inset 0 1px 1px rgba(255,255,255,0.35), 0 2px 6px rgba(0,0,0,0.25)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.25), 0 2px 8px rgba(212,175,55,0.35)',
                px: { xs: 1.25, sm: 2 },
                py: 0.45,
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: copied ? '#047857' : '#E5C158',
                  boxShadow: copied
                    ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                    : 'inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -1px 1px rgba(0,0,0,0.3), 0 3px 12px rgba(212,175,55,0.5)',
                },
                '&:active': {
                  transform: 'scale(0.97)',
                },
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>
        </Box>

        {/* Command Selector Tabs Strip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: { xs: 1.5, sm: 2, md: 2.5 },
            py: { xs: 1, sm: 1.2 },
            bgcolor: isDark ? '#07070D' : '#141E33',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.09)'}`,
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            gap: 1,
            position: 'relative',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Thin gold underline beneath entire strip */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              bgcolor: gold.wash,
              opacity: isDark ? 0.4 : 0.25,
              pointerEvents: 'none',
            }}
          />

          {/* Left gold spine accent */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '2px',
              bgcolor: isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.2)',
              opacity: 0.6,
            }}
          />

          {Object.values(commands).map((cmd) => {
            const isSelected = activeTab === cmd.id;
            return (
              <Button
                key={cmd.id}
                onClick={() => setActiveTab(cmd.id)}
                size="small"
                sx={{
                  fontFamily: monoFont,
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  fontWeight: 750,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  px: { xs: 1.4, sm: 2 },
                  py: 0.5,
                  borderRadius: 2.5,
                  color: isSelected ? (isDark ? '#F5E6AB' : '#FCD34D') : (isDark ? '#94A3B8' : '#CBD5E1'),
                  bgcolor: isSelected
                    ? isDark ? 'rgba(212,175,55,0.22)' : 'rgba(212,175,55,0.25)'
                    : 'transparent',
                  border: '1px solid',
                  borderColor: isSelected ? '#D4AF37' : isDark ? 'rgba(148,163,184,0.12)' : 'rgba(255,255,255,0.08)',
                  boxShadow: isSelected
                    ? isDark
                      ? '0 4px 10px rgba(0,0,0,0.5), 0 0 12px rgba(212,175,55,0.25), inset 0 0 8px rgba(212,175,55,0.05)'
                      : '0 2px 8px rgba(184,134,11,0.22), inset 0 0 4px rgba(184,134,11,0.1)'
                    : 'none',
                  letterSpacing: '0.02em',
                  transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: isSelected ? (isDark ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.3)') : isDark ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.06)',
                    borderColor: '#D4AF37',
                  },
                  '&:active': {
                    transform: 'scale(0.96)',
                  },
                }}
              >
                {cmd.chipLabel}
              </Button>
            );
          })}

          {/* If pull selected, provide quick tool picker chips */}
          {activeTab === 'pull' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, ml: { xs: 1, md: 'auto' }, flexShrink: 0, paddingLeft: 0.5 }}>
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.68rem', color: '#64748B', display: { xs: 'none', md: 'block' }, fontWeight: 600, letterSpacing: '0.08em', flexShrink: 0 }}>
                TOOL:
              </Typography>
              {['subsweep-lead-scanner', 'envguard-secrets-vault', 'neuro-memory-daemon'].map((tName) => (
                <Chip
                  key={tName}
                  label={tName}
                  size="small"
                  onClick={() => setSelectedTool(tName)}
                  sx={{
                    fontFamily: monoFont,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    bgcolor: selectedTool === tName ? 'rgba(56,189,248,0.20)' : 'rgba(255,255,255,0.045)',
                    color: selectedTool === tName ? '#38BDF8' : '#94A3B8',
                    border: '1px solid',
                    borderColor: selectedTool === tName ? '#38BDF8' : isDark ? 'rgba(148,163,184,0.15)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 1.5,
                    py: 0.3,
                    px: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: selectedTool === tName ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.07)',
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Terminal Screen Body with Syntax Highlighting */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            fontFamily: monoFont,
            fontSize: { xs: '0.72rem', sm: '0.84rem' },
            lineHeight: { xs: 1.6, sm: 1.75 },
            minHeight: { xs: 240, sm: 280 },
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            opacity: isSimulating ? 0.35 : 1,
            transition: 'opacity 0.18s ease',
            position: 'relative',
            borderRadius: 0,
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle dark vignette overlay on the screen */}
          {isDark && (
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.25) 100%)',
                zIndex: 1,
              }}
            />
          )}

          {/* Scan-line texture effect overlay (dark mode only) */}
          {isDark && (
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 2px)',
                opacity: 0.018,
                zIndex: 1,
              }}
            />
          )}

          {/* Subtle CRT curve hint in screen corners */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 40,
              pointerEvents: 'none',
              zIndex: 1,
              background: isDark
                ? 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 100%)',
              borderRadius: '4px 4px 0 0',
            }}
          />

          {activeData.lines.map((line, idx) => {
            if (line.type === 'empty') {
              return <Box key={idx} sx={{ height: '0.5em' }} />;
            }
            if (line.type === 'command') {
              return (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap', position: 'relative', zIndex: 2, maxWidth: '100%', wordBreak: 'break-word' }}>
                  <Typography component="span" sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#D4AF37', fontWeight: 800, textShadow: isDark ? '0 0 6px rgba(212,175,55,0.4)' : 'none' }}>
                    user@zoth-metal:~
                  </Typography>
                  <Typography component="span" sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#FFFFFF', fontWeight: 800, textShadow: isDark ? '0 0 6px rgba(255,255,255,0.3)' : 'none', wordBreak: 'break-all' }}>
                    {activeData.cmd}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '7px',
                      height: '14px',
                      bgcolor: '#D4AF37',
                      ml: 0.5,
                      boxShadow: '0 0 8px #D4AF37, 0 0 14px rgba(212,175,55,0.6)',
                      animation: 'blinkCursor 1s step-start infinite',
                      '@keyframes blinkCursor': {
                        '50%': { opacity: 0 },
                      },
                    }}
                  />
                </Box>
              );
            }
            if (line.type === 'dim') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#64748B', position: 'relative', zIndex: 2, textShadow: isDark ? '0 0 4px rgba(100,116,139,0.2)' : 'none', whiteSpace: { xs: 'pre-wrap', md: 'pre' }, wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                  {line.text}
                </Typography>
              );
            }
            if (line.type === 'success') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#34D399', fontWeight: 600, position: 'relative', zIndex: 2, textShadow: isDark ? '0 0 6px rgba(52,211,153,0.3)' : 'none', whiteSpace: { xs: 'pre-wrap', md: 'pre' }, wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                  {line.text}
                </Typography>
              );
            }
            if (line.type === 'cyan') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#38BDF8', fontWeight: 600, position: 'relative', zIndex: 2, textShadow: isDark ? '0 0 6px rgba(56,189,248,0.3)' : 'none', whiteSpace: { xs: 'pre-wrap', md: 'pre' }, wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                  {line.text}
                </Typography>
              );
            }
            if (line.type === 'gold') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#F5E6AB', fontWeight: 750, mt: 0.5, position: 'relative', zIndex: 2, textShadow: isDark ? '0 0 8px rgba(245,230,171,0.45)' : '0 0 6px rgba(245,230,171,0.2)', whiteSpace: { xs: 'pre-wrap', md: 'pre' }, wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                  {line.text}
                </Typography>
              );
            }
            return (
              <Typography key={idx} sx={{ fontFamily: monoFont, fontSize: 'inherit', color: '#EDEFF2', position: 'relative', zIndex: 2, whiteSpace: { xs: 'pre-wrap', md: 'pre' }, wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                {line.text}
              </Typography>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

/* ==========================================================================
   5 PILLARS ARCHITECTURE EXPLORER COMPONENT
   ========================================================================== */
function ArchitecturePillarsExplorer({ gold, isDark, monoFont, status }) {
  const [selectedPillar, setSelectedPillar] = useState(0);

  const pillars = useMemo(() => [
    {
      id: 'arsenal',
      indexLabel: '01',
      tabLabel: '1. Sovereign Arsenal (25 Authentic Tools)',
      shortTitle: 'Arsenal',
      badge: 'UNIFIED ARSENAL',
      title: '25 Sovereign Tools & Interactive Workspaces',
      subtitle: 'Zero-Egress In-Browser Multi-Agent Execution Matrix',
      description:
        'All 25 authentic tools are unified directly into Zoth Studio v2. They render with the native gold-on-void design system, zero external runtime dependency, and immediate interactive execution across Security & Recon, Swarm & Core, Developer Velocity, Memory & Cognitive, and Crypto & Identity.',
      metrics: [
        { label: 'Total Arsenal Tools', value: '25 Sovereign', desc: '100% Client-Side Native' },
        { label: 'Loopback Enclaves', value: ':8989 / :8094', desc: 'Air-Gapped Process Isolation' },
        { label: 'Runtime Egress', value: '0.00 KB', desc: 'OWASP Zero-Egress Compliant' },
        { label: 'Cadres Supported', value: '5 Tactical', desc: 'Security, Swarm, Velocity, Memory, Crypto' },
      ],
      invariants: [
        'Pure client-side rendering with zero external telemetry',
        'Direct WebGPU WGSL canvas and SVG schematic visualizers',
        'Deterministic state replay and local session chronicle',
        'Zero cloud fallback required for offline operations',
      ],
      specs: [
        { label: 'Execution Model', value: 'Client-Side Workstation' },
        { label: 'Process Isolation', value: 'Web Workers & Sandboxed Iframes' },
        { label: 'Swarm Multiplexer', value: '21 Sovereign Agents' },
        { label: 'Asset Bundling', value: 'Vite 5 Production Prerendered' },
      ],
      launchButton: {
        label: 'Explore Arsenal',
        to: '/arsenal',
        icon: <RocketLaunchIcon />,
      },
      secondaryButton: {
        label: 'Open Swarm Cockpit',
        to: '/swarm',
        icon: <LaunchIcon />,
      },
      icon: <TerminalIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: '25 AUTHENTIC TOOLS',
    },
    {
      id: 'micro-tools',
      indexLabel: '02',
      tabLabel: '2. Micro-Tools Dossiers (25 Deep Specifications)',
      shortTitle: 'Tool Dossiers',
      badge: 'STANDALONE RUNTIME',
      title: '25 Standalone In-Browser Micro-Tools',
      subtitle: 'Client-Side WebGPU Shaders & Zero-Leakage Cryptographic Utilities',
      description:
        '25 standalone, single-purpose utilities engineered for security researchers, cryptographers, and AI engineers. Features WebGPU tensor matrix shaders, regex droid engines, and WCAG contrast guards without external servers.',
      metrics: [
        { label: 'Catalog Capacity', value: '25 Standalone', desc: '100% Client-Side Ready' },
        { label: 'WebGPU Shaders', value: '14 Hardware Shaders', desc: 'Client WGSL Matrix Matmul' },
        { label: 'Launch Latency', value: '< 16ms Instant', desc: 'Zero Backend Wait Time' },
        { label: 'Egress Risk', value: 'Zero (OWASP L1)', desc: 'No Third-Party Analytics' },
      ],
      invariants: [
        'Zero localStorage, sessionStorage, or cookie exfiltration',
        'WebGPU tensor matrix acceleration with WASM SIMD 128-bit fallback',
        'Self-contained single-page execution with copyable CLI pull hooks',
        'Air-gapped verification against open-source GitHub repositories',
      ],
      specs: [
        { label: 'Execution Tier', value: 'Client WebGPU WGSL + WASM' },
        { label: 'Packaging', value: 'Single-File Standalone Micro-Apps' },
        { label: 'Distribution', value: 'Open Source GitHub Repositories' },
        { label: 'Audit Baseline', value: 'OWASP Zero-Egress Matrix' },
      ],
      launchButton: {
        label: 'View Arsenal',
        to: '/arsenal',
        icon: <FlashOnIcon />,
      },
      secondaryButton: {
        label: 'Open Vision Gesture Engine',
        to: '/tools/vision-gesture-control',
        icon: <LaunchIcon />,
      },
      icon: <FlashOnIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: '25 SOVEREIGN TOOLS',
    },
    {
      id: 'stdp-memory',
      indexLabel: '03',
      tabLabel: '3. STDP Neuro Memory (Lucy Oracle Synaptic Matrix)',
      shortTitle: 'STDP Neuro Memory',
      badge: 'BIOMORPHIC MATRIX',
      title: 'STDP Neuro Memory & Lucy Oracle Synaptic Matrix',
      subtitle: 'Spike-Timing-Dependent Plasticity Synaptic Memory Persistence Daemon',
      description:
        'Biological memory persistence engine executing locally. Models asymmetric Hebbian learning with long-term potentiation (LTP) and long-term depression (LTD). Features 3D pseudo-vector manifold projection and synaptic search.',
      metrics: [
        { label: 'Memory Engine', value: 'Local STDP Model', desc: 'In-Memory / IPC Socket' },
        {
          label: 'Daemon Status',
          value: status?.services?.memory?.up ? 'ONLINE (READY)' : 'OFFLINE (STANDBY)',
          desc: 'Local Memory Health'
        },
        { label: 'Synaptic Projection', value: '3D Manifold (X/Y/Z)', desc: 'Deterministic Embedding' },
        { label: 'Decay Function', value: 'Δw = A₊ e^(-Δt/τ)', desc: 'Asymmetric Hebbian Plasticity' },
      ],
      invariants: [
        'Biological spike timing: pre-before-post spike induces Long-Term Potentiation',
        'Post-before-pre spike causes deterministic Long-Term Depression',
        'Sub-millisecond query latency with zero cloud vector database egress',
        '3D interactive synaptic scatter matrix with semantic tag clustering',
      ],
      specs: [
        { label: 'Memory Architecture', value: 'Client-Side HNSW + STDP Worker' },
        { label: 'Protocol', value: 'Local Air-Gapped IPC / WASM' },
        { label: 'Recall Latency', value: '< 1.2ms Local Retrieval' },
        { label: 'Persistence Format', value: 'Local Encrypted JSON State' },
      ],
      launchButton: {
        label: 'Launch Neuro Memory',
        to: '/memory',
        icon: <MemoryIcon />,
      },
      secondaryButton: {
        label: 'Query Synaptic Matrix',
        to: '/memory',
        icon: <PsychologyIcon />,
      },
      icon: <MemoryIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: 'LUCY ORACLE SYNAPTIC MATRIX',
    },
    {
      id: 'byzantine-consensus',
      indexLabel: '04',
      tabLabel: '4. Byzantine Consensus (3-Agent Quorum Arena)',
      shortTitle: 'Byzantine Consensus',
      badge: 'QUORUM DELIBERATION',
      title: 'Byzantine Consensus: 3-Agent Quorum Arena',
      subtitle: 'Tri-Cadre Socratic Triangulation & Hallucination-Resistant AST Synthesis',
      description:
        'Deterministic multi-agent deliberation chamber with 2/3 Byzantine Fault Tolerance (BFT). Azoth (Proponent), Kai (Skeptic), and Lycan (Auditor) debate proposals across three phases (Propose, Pre-Commit, Commit) with Merkle-trie root verification to guarantee syntax validity.',
      metrics: [
        { label: 'Quorum Threshold', value: '2f + 1 = 66.7%', desc: 'Byzantine Supermajority' },
        { label: 'Agent Quorum', value: 'Azoth · Kai · Lycan', desc: 'Tri-Cadre Dialectic Debate' },
        { label: 'Fault Tolerance', value: '33.3% Max Ceiling', desc: 'Asynchronous Partition Safety' },
        { label: 'Consensus Bus', value: 'Local Mesh / WebWorker Bus', desc: 'E2EE Simplex Peer Mesh' },
      ],
      invariants: [
        'Three-phase commit protocol: Propose -> Pre-Commit -> Final AST Ratification',
        'Merkle-trie root verification ensures tamper-proof code mutation deltas',
        'Dialectical synthesis filters speculative or corrupted syntax modifications',
        'Completely decentralized arbitration with zero external coordinator',
      ],
      specs: [
        { label: 'Arbiter Protocol', value: 'Deterministic Socratic BFT' },
        { label: 'Communication Bus', value: 'WebWorker Simplex Bus' },
        { label: 'Verification Model', value: 'SHA-256 Merkle-Trie AST Diff' },
        { label: 'Synthesis Metric', value: 'Bayesian Weighted Confidence Score' },
      ],
      launchButton: {
        label: 'Launch Consensus',
        to: '/arsenal',
        icon: <GavelIcon />,
      },
      secondaryButton: {
        label: 'Inspect Agent Bridge',
        to: '/tools/sovereign-agent-bridge',
        icon: <HubIcon />,
      },
      icon: <GavelIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: '3-AGENT QUORUM ARENA',
    },
    {
      id: 'adytum-vault',
      indexLabel: '05',
      tabLabel: '5. Adytum Vault (Argon2id Hardware Sanctum)',
      shortTitle: 'Adytum Vault',
      badge: 'HARDWARE SANCTUM',
      title: 'Adytum Vault: Argon2id Hardware Sanctum',
      subtitle: 'Zero-Knowledge Memory-Hard Cryptographic Key Derivation & Incubation Rite',
      description:
        'Air-gapped cryptographic sanctum. Derives high-entropy master keys using memory-hard Argon2id (t=3, m=64MB, p=4) and protects operator secrets at rest with XChaCha20-Poly1305 authenticated encryption and WebCrypto primitives.',
      metrics: [
        { label: 'Cryptographic Engine', value: 'Argon2id + WebCrypto', desc: 'In-Browser Enclave' },
        {
          label: 'Daemon Status',
          value: status?.services?.vault?.up ? 'ONLINE (READY)' : 'OFFLINE (STANDBY)',
          desc: 'Sanctum Daemon Health'
        },
        { label: 'KDF Primitive', value: 'Argon2id v13', desc: 't=3, m=64MB, p=4 Hardness' },
        { label: 'AEAD Cipher', value: 'XChaCha20-Poly1305', desc: '256-bit Authenticated Encryption' },
      ],
      invariants: [
        'Zero-knowledge key derivation with side-channel immune memory hardness',
        '5-Minute (300s) incubation rite enforces tamper-resistant cryptographic patience',
        'Sodium mprotect page locking prevents cold-boot memory dumps',
        'Completely air-gapped from external networks; loopback only',
      ],
      specs: [
        { label: 'Sanctum Binary', value: 'Rust target/release/zoth-vault' },
        { label: 'Key Incubation', value: '300s (5-Minute Sacred Rite)' },
        { label: 'Memory Defense', value: 'Sodium mprotect page locking' },
        { label: 'Network Surface', value: 'Strict Loopback (Zero Egress)' },
      ],
      launchButton: {
        label: 'Launch Workstation',
        to: '/adytum',
        icon: <ShieldIcon />,
      },
      secondaryButton: {
        label: 'Enter Incubation Rite',
        to: '/adytum',
        icon: <LockIcon />,
      },
      icon: <LockIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: 'ARGON2ID HARDWARE SANCTUM',
    },
  ], [status, gold]);

  const activePillar = pillars[selectedPillar];

  return (
    <Box sx={{ mb: 9, pt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography className="section-kicker">Core System Architecture</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            5 Pillars <span className="text-gradient-gold">Architecture Explorer</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 780, lineHeight: 1.65 }}>
            Interactive blueprint of Zoth Studio v2 sovereign foundations: offline workstations, standalone micro-tools, biological neuro memory, quorum consensus, and air-gapped cryptographic vaults.
          </Typography>
        </Box>
        <Chip
          label="ZERO-TELEMETRY SPECIFICATION"
          sx={{
            fontFamily: monoFont,
            fontWeight: 800,
            fontSize: '0.72rem',
            bgcolor: gold.wash,
            color: gold.accent,
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`,
          }}
        />
      </Box>

      {/* Interactive Tabs / Chips for 5 Pillars */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.25,
          overflowX: 'auto',
          pb: 2,
          mb: 3,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: 3 },
        }}
      >
        {pillars.map((pillar, idx) => {
          const isSelected = selectedPillar === idx;
          return (
            <Chip
              key={pillar.id}
              label={pillar.tabLabel}
              onClick={() => setSelectedPillar(idx)}
              clickable
              sx={{
                py: 2.2,
                px: 1.2,
                fontWeight: 750,
                fontSize: { xs: '0.76rem', sm: '0.84rem' },
                fontFamily: monoFont,
                whiteSpace: 'nowrap',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: isSelected
                  ? isDark ? 'rgba(212,175,55,0.18)' : '#FEF9E7'
                  : isDark ? '#0B0B12' : '#F8FAFC',
                color: isSelected ? (isDark ? gold.soft : gold.accent) : 'text.secondary',
                border: '1px solid',
                borderColor: isSelected ? gold.accent : isDark ? '#26262F' : '#EAECF0',
                boxShadow: isSelected
                  ? isDark ? '0 0 16px rgba(212,175,55,0.25)' : '0 2px 8px rgba(184,134,11,0.15)'
                  : 'none',
                '&:hover': {
                  borderColor: gold.accent,
                  bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FFFDF5',
                },
              }}
            />
          );
        })}
      </Box>

      {/* Interactive Preview Card for Selected Pillar */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          borderRadius: 4,
          bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.32)'}`,
          boxShadow: isDark
            ? '0 22px 52px -14px rgba(0,0,0,0.75), 0 0 40px -10px rgba(212,175,55,0.08), 0 0 80px -30px rgba(212,175,55,0.05)'
            : '0 22px 52px -14px rgba(16,24,40,0.1), 0 0 40px -10px rgba(212,175,55,0.10)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.35s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 28px 64px -16px rgba(0,0,0,0.82), 0 0 52px -10px rgba(212,175,55,0.14), 0 0 100px -30px rgba(212,175,55,0.08)'
              : '0 28px 64px -16px rgba(16,24,40,0.13), 0 0 52px -10px rgba(212,175,55,0.16)',
          },
        }}
      >
        {/* Dramatic gold glow — layered radial system */}
        {/* Far outer ambient wash */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 480,
            height: 480,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle at top right, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.04) 45%, transparent 75%)'
              : 'radial-gradient(circle at top right, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.02) 45%, transparent 75%)',
            filter: 'blur(8px)',
          }}
        />
        {/* Mid focused glow */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 320,
            height: 320,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle at top right, rgba(245,230,171,0.16) 0%, rgba(212,175,55,0.06) 40%, transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(254,249,231,0.22) 0%, rgba(212,175,55,0.07) 40%, transparent 70%)',
            filter: 'blur(14px)',
          }}
        />
        {/* Tight warm glow behind icon area */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 20,
            right: 40,
            width: 180,
            height: 180,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle, rgba(245,230,171,0.18) 0%, rgba(212,175,55,0.06) 55%, transparent 75%)'
              : 'radial-gradient(circle, rgba(254,249,231,0.24) 0%, rgba(212,175,55,0.08) 55%, transparent 75%)',
            filter: 'blur(12px)',
          }}
        />
        {/* Bottom-left counter glow */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 380,
            height: 380,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle at bottom left, rgba(212,175,55,0.05) 0%, transparent 65%)'
              : 'radial-gradient(circle at bottom left, rgba(212,175,55,0.04) 0%, transparent 65%)',
            filter: 'blur(16px)',
          }}
        />
        {/* Subtle top-edge gold hairline on the whole card */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0.5,
            right: 0.5,
            height: '1px',
            bgcolor: gold.wash,
            opacity: isDark ? 0.4 : 0.25,
            zIndex: 2,
          }}
        />

        {/* Card Header: Pillar Index, Badges, Title & Subtitle */}
        <Box sx={{ mb: 3.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Pillar icon frame with pulsing inner glow and animated gold ring outline */}
              <Box sx={{ position: 'relative', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: 2.5,
                    border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.35)'}`,
                    bgcolor: 'transparent',
                    pointerEvents: 'none',
                    animation: 'ringPulse 4s ease-in-out infinite',
                    '@keyframes ringPulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.35 },
                      '50%': { transform: 'scale(1.08)', opacity: 0.75 },
                    },
                  }}
                />
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: gold.wash,
                    border: `1px solid ${isDark ? 'rgba(212,175,55,0.45)' : '#F0E1A8'}`,
                    position: 'relative',
                    zIndex: 1,
                    animation: 'iconInnerGlow 5s ease-in-out infinite',
                    '@keyframes iconInnerGlow': {
                      '0%, 100%': {
                        background: isDark
                          ? 'radial-gradient(circle at center, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 100%)'
                          : 'radial-gradient(circle at center, rgba(254,249,231,0.9) 0%, rgba(240,225,168,0.4) 100%)',
                        boxShadow: isDark
                          ? '0 0 10px rgba(212,175,55,0.2), inset 0 0 6px rgba(212,175,55,0.15)'
                          : '0 0 8px rgba(184,134,11,0.15)',
                      },
                      '50%': {
                        background: isDark
                          ? 'radial-gradient(circle at 60% 40%, rgba(212,175,55,0.32) 0%, rgba(212,175,55,0.14) 100%)'
                          : 'radial-gradient(circle at 60% 40%, rgba(254,249,231,1) 0%, rgba(240,225,168,0.6) 100%)',
                        boxShadow: isDark
                          ? '0 0 16px rgba(212,175,55,0.35), inset 0 0 10px rgba(212,175,55,0.25)'
                          : '0 0 12px rgba(184,134,11,0.25)',
                      },
                    },
                  }}
                >
                  {activePillar.icon}
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: monoFont, fontSize: '0.72rem', color: isDark ? gold.soft : gold.accent, fontWeight: 800, letterSpacing: '0.12em' }}>
                  PILLAR {activePillar.indexLabel} // {activePillar.badge}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#EDEFF2' : '#101828', letterSpacing: '-0.02em' }}>
                  {activePillar.title}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={activePillar.featuredChip}
              size="small"
              sx={{
                fontFamily: monoFont,
                fontWeight: 800,
                fontSize: '0.72rem',
                bgcolor: isDark ? 'rgba(212,175,55,0.15)' : '#FEF9E7',
                color: isDark ? gold.soft : gold.accent,
                border: `1px solid ${gold.accent}`,
              }}
            />
          </Box>

          <Typography variant="subtitle1" sx={{ color: isDark ? gold.soft : gold.accent, fontWeight: 700, mb: 1.5, fontSize: '1.05rem' }}>
            {activePillar.subtitle}
          </Typography>
          <Typography variant="body1" sx={{ color: isDark ? '#A6A8B4' : '#475467', lineHeight: 1.7, maxWidth: 900 }}>
            {activePillar.description}
          </Typography>
        </Box>

        {/* Live Metrics Grid (4 Boxes) */}
        <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', fontWeight: 800, color: isDark ? gold.soft : gold.accent, letterSpacing: '0.1em', mb: 1.5 }}>
            LIVE ARCHITECTURAL METRICS
          </Typography>
          <Grid container spacing={2}>
            {activePillar.metrics.map((metric, mIdx) => (
              <Grid key={mIdx} xs={12} sm={6} md={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.2,
                    height: '100%',
                    borderRadius: 2.8,
                    bgcolor: isDark ? '#07070B' : '#F8FAFC',
                    borderColor: isDark ? 'rgba(212,175,55,0.28)' : '#EAECF0',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: gold.accent,
                      transform: 'translateY(-3px)',
                      boxShadow: isDark
                        ? '0 8px 24px -6px rgba(0,0,0,0.6), 0 0 18px rgba(212,175,55,0.3)'
                        : '0 8px 24px -6px rgba(16,24,40,0.12), 0 0 16px rgba(184,134,11,0.25)',
                      '& .metric-accent-top': {
                        bgcolor: gold.accent,
                        opacity: 1,
                      },
                      '& .metric-glow-dot': {
                        opacity: 1,
                        transform: 'scale(1)',
                      },
                    },
                  }}
                >
                  {/* Animated gold accent strip — top */}
                  <Box
                    className="metric-accent-top"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      bgcolor: gold.wash,
                      opacity: isDark ? 0.5 : 0.4,
                      transition: 'all 0.25s ease',
                      borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(184,134,11,0.15)'}`,
                    }}
                  />
                  {/* Subtle glow dot at top-right */}
                  <Box
                    className="metric-glow-dot"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: gold.accent,
                      boxShadow: `0 0 6px ${gold.accent}`,
                      opacity: 0,
                      transform: 'scale(0)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: monoFont, color: isDark ? '#94A3B8' : '#475467', fontWeight: 700, display: 'block', mb: 0.5, mt: 0.3, letterSpacing: '0.04em' }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: monoFont, fontWeight: 800, color: isDark ? gold.soft : gold.accent, mb: 0.5, fontSize: { xs: '1.05rem', md: '1.3rem' }, letterSpacing: '-0.01em' }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.79rem', color: isDark ? '#98A2B3' : '#475467', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`, pt: 0.6, mt: 0.6 }}>
                    {metric.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Architectural Invariants & Technical Specifications Columns */}
        <Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          {/* Architectural Invariants */}
          <Grid xs={12} md={7}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.8,
                bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F9FAFB',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.2)'}`,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle inner glow accent - top edge */}
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  bgcolor: gold.wash,
                  opacity: isDark ? 0.35 : 0.25,
                }}
              />
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', fontWeight: 800, color: isDark ? gold.soft : gold.accent, letterSpacing: '0.1em', mb: 1.5 }}>
                ARCHITECTURAL GUARANTEES &amp; INVARIANTS
              </Typography>
              <Stack spacing={1.3}>
                {activePillar.invariants.map((inv, invIdx) => (
                  <Box key={invIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, p: '3px 0', borderBottom: invIdx < activePillar.invariants.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}` : 'none' }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: gold.wash,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: '1px',
                        border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.25)'}`,
                        boxShadow: isDark ? '0 0 6px rgba(212,175,55,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isDark ? 'rgba(212,175,55,0.2)' : '#FEF9E7',
                          boxShadow: `0 0 10px ${gold.accent}`,
                        },
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#34D399' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: isDark ? '#D1D5DB' : '#374151', lineHeight: 1.55, fontSize: '0.87rem' }}>
                      {inv}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Technical Specifications */}
          <Grid xs={12} md={5}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.8,
                bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#F9FAFB',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.2)'}`,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Left-edge gold accent bar */}
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '3px',
                  bgcolor: isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.3)',
                  borderRadius: 2.8,
                  zIndex: 1,
                }}
              />
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', fontWeight: 800, color: isDark ? gold.soft : gold.accent, letterSpacing: '0.1em', mb: 1.5 }}>
                RUNTIME SPECIFICATIONS
              </Typography>
              <Stack spacing={0.3}>
                {activePillar.specs.map((spec, sIdx) => (
                  <Box
                    key={sIdx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.7,
                      px: 1.2,
                      borderLeft: `2px solid ${gold.wash}`,
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                      transition: 'background-color 0.15s ease, border-left-color 0.2s ease',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.035)',
                        borderLeftColor: gold.accent,
                      },
                    }}
                  >
                    <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#475467', fontWeight: 600 }}>
                      {spec.label}
                    </Typography>
                    <Typography sx={{ fontFamily: monoFont, fontSize: '0.78rem', fontWeight: 750, color: isDark ? gold.soft : gold.accent, letterSpacing: '-0.01em' }}>
                      {spec.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Direct Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            pt: 2.5,
            borderTop: `1px solid ${isDark ? '#26262F' : '#EAECF0'}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Centered gold diamond ornament on divider */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              top: -3,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 6,
              height: 6,
              bgcolor: gold.accent,
              boxShadow: `0 0 6px ${gold.accent}`,
              zIndex: 2,
            }}
          />

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink}
              to={activePillar.launchButton.to}
              variant="contained"
              color="primary"
              size="large"
              startIcon={activePillar.launchButton.icon}
              sx={{
                px: 3.5,
                py: 1.1,
                fontWeight: 800,
                letterSpacing: '0.02em',
                bgcolor: isDark ? '#D4AF37' : '#B8860B',
                color: isDark ? '#08080B' : '#101828',
                boxShadow: isDark
                  ? '0 4px 18px rgba(212,175,55,0.35)'
                  : '0 4px 18px rgba(184,134,11,0.25)',
                '&:hover': {
                  bgcolor: isDark ? '#E5C158' : '#9A7209',
                  boxShadow: isDark
                    ? '0 6px 24px rgba(212,175,55,0.5)'
                    : '0 6px 24px rgba(184,134,11,0.4)',
                },
              }}
            >
              {activePillar.launchButton.label}
            </Button>

            <Button
              component={RouterLink}
              to={activePillar.secondaryButton.to}
              variant="outlined"
              size="large"
              endIcon={activePillar.secondaryButton.icon}
              sx={{
                px: 2.8,
                py: 1.1,
                fontWeight: 750,
                borderColor: isDark ? 'rgba(212,175,55,0.4)' : '#B8860B',
                color: isDark ? gold.soft : gold.accent,
                '&:hover': {
                  borderColor: gold.accent,
                  bgcolor: gold.wash,
                },
              }}
            >
              {activePillar.secondaryButton.label}
            </Button>
          </Box>

          <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#475467' }}>
            Loopback Enclave · Zero Outbound Telemetry · Pure Bare Metal
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

/* ==========================================================================
   HOMEPAGE MAIN COMPONENT
   ========================================================================== */
import CinematicIntro from '../components/CinematicIntro';

export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const published = microTools.filter((tool) => tool.published);
  const { status } = useStudioStatus();
  const [introDone, setIntroDone] = useState(false);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["ZOTH", "WELCOME", "TO", "ZOTH OS"]}
          themeColor="gold"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 7 } }}>
      {/* Soft radial gold glow behind the hero (HomePage signature) */}
      <ParallaxGlow offset={60} style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: { xs: '100%', md: '900px' },
            height: { xs: 420, md: 520 },
            margin: '0 auto',
            background: isDark
              ? 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.18) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
          }}
        />
      </ParallaxGlow>

      {/* Enhanced Hero Section — multi-layered paper treatment with dramatic gold glow system */}
      <Paper
        elevation={0}
        className="breathe-card"
        sx={{
          position: 'relative',
          zIndex: 1,
          p: { xs: 3.5, md: 6 },
          mb: 8.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.25)',
          bgcolor: theme.palette.background.paper,
          /* Paper texture: layered gradients for tactile card feel */
          background: isDark
            ? `
                radial-gradient(ellipse at 15% 15%, rgba(212,175,55,0.055) 0%, transparent 45%),
                radial-gradient(ellipse at 85% 85%, rgba(212,175,55,0.045) 0%, transparent 45%),
                radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.025) 0%, transparent 55%),
                linear-gradient(165deg, ${theme.palette.background.paper} 0%, rgba(212,175,55,0.06) 100%)
              `
            : `
                radial-gradient(ellipse at 15% 15%, rgba(212,175,55,0.075) 0%, transparent 45%),
                radial-gradient(ellipse at 85% 85%, rgba(184,134,11,0.055) 0%, transparent 45%),
                radial-gradient(ellipse at 50% 100%, rgba(184,134,11,0.03) 0%, transparent 55%),
                linear-gradient(165deg, ${theme.palette.background.paper} 0%, #FEF9E726 100%)
              `,
          /* Multi-layered gold glow system: ambient + focused + edge + subtle inner glow border */
          boxShadow: isDark
            ? `
                0 0 0 1px rgba(212,175,55,0.08),
                0 24px 72px -14px rgba(0,0,0,0.75),
                0 0 48px -10px rgba(212,175,55,0.14),
                0 0 80px -24px rgba(212,175,55,0.08),
                inset 0 0 24px rgba(212,175,55,0.05),
                inset 0 1px 0 rgba(212,175,55,0.10),
                inset 0 -1px 0 rgba(255,255,255,0.03)
              `
            : `
                0 0 0 1px rgba(184,134,11,0.12),
                0 24px 72px -14px rgba(16,24,40,0.14),
                0 0 48px -10px rgba(212,175,55,0.18),
                0 0 80px -24px rgba(212,175,55,0.09),
                inset 0 0 24px rgba(184,134,11,0.05),
                inset 0 1px 0 rgba(255,255,255,0.55),
                inset 0 -1px 0 rgba(0,0,0,0.03)
              `,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(280px, 400px)' },
          gap: { xs: 4, md: 7.5 },
          alignItems: 'center',
          transition: 'box-shadow 0.4s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: isDark
              ? `
                  0 0 0 1px rgba(212,175,55,0.15),
                  0 28px 80px -14px rgba(0,0,0,0.8),
                  0 0 56px -10px rgba(212,175,55,0.20),
                  0 0 96px -24px rgba(212,175,55,0.10),
                  inset 0 0 28px rgba(212,175,55,0.08),
                  inset 0 1px 0 rgba(212,175,55,0.12),
                  inset 0 -1px 0 rgba(255,255,255,0.04)
                `
              : `
                  0 0 0 1px rgba(184,134,11,0.20),
                  0 28px 80px -14px rgba(16,24,40,0.16),
                  0 0 56px -10px rgba(212,175,55,0.24),
                  0 0 96px -24px rgba(212,175,55,0.11),
                  inset 0 0 28px rgba(184,134,11,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.62),
                  inset 0 -1px 0 rgba(0,0,0,0.04)
                `,
          },
        }}
      >
        {/* Ambient mega-glow — large, soft, behind logo area */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '48%',
            right: { xs: '6%', md: '12%' },
            transform: 'translateY(-50%)',
            width: { xs: 320, md: 440 },
            height: { xs: 320, md: 440 },
            pointerEvents: 'none',
            zIndex: 0,
            background: isDark
              ? 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.10) 40%, transparent 72%)'
              : 'radial-gradient(circle, rgba(212,175,55,0.34) 0%, rgba(212,175,55,0.13) 40%, transparent 72%)',
            filter: 'blur(22px)',
            transition: 'all 0.5s ease',
          }}
        />

        {/* Secondary glow: tighter, warmer halo near logo */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '52%',
            right: { xs: '10%', md: '16%' },
            transform: 'translateY(-50%)',
            width: { xs: 180, md: 260 },
            height: { xs: 180, md: 260 },
            pointerEvents: 'none',
            zIndex: 1,
            background: isDark
              ? 'radial-gradient(circle, rgba(245,230,171,0.20) 0%, rgba(212,175,55,0.06) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(245,230,171,0.28) 0%, rgba(212,175,55,0.08) 50%, transparent 75%)',
            filter: 'blur(14px)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
            <Box component="img" src="/brand/ghostbyte-dark.png" alt="" sx={{ height: 28, width: 'auto', filter: isDark ? 'drop-shadow(0 0 6px rgba(212,175,55,0.4))' : 'drop-shadow(0 0 4px rgba(184,134,11,0.3))' }} />
            <Typography sx={{ fontFamily: mono, letterSpacing: '0.22em', fontSize: '0.75rem', color: isDark ? gold.soft : gold.accent, fontWeight: 800 }}>
              NULLAI TECH • LOCAL AI WORKSTATION ENGINE
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.4rem', sm: '5rem', md: '6rem' },
              color: theme.palette.text.primary,
              fontWeight: 400,
              lineHeight: 0.92,
              mb: 2,
              letterSpacing: '-0.025em',
            }}
          >
            Zoth
            <Box component="span" className="text-gradient-gold" sx={{ display: 'block', fontSize: { xs: '2.8rem', sm: '4rem', md: '5rem' } }}>
              Studio
            </Box>
          </Typography>

          {/* Decorative gold rule with gradient fade */}
          <Box
            sx={{
              width: { xs: 100, sm: 140, md: 160 },
              height: 4,
              bgcolor: gold.accent,
              mt: 3.5,
              mb: 4.5,
              borderRadius: 2,
              boxShadow: isDark
                ? '0 0 12px rgba(212,175,55,0.5), 0 0 24px rgba(212,175,55,0.2), 0 0 40px rgba(212,175,55,0.1)'
                : '0 0 12px rgba(184,134,11,0.4), 0 0 24px rgba(184,134,11,0.15), 0 0 40px rgba(184,134,11,0.08)',
              transition: 'box-shadow 0.3s ease',
            }}
          />

          <Typography
            sx={{
              maxWidth: 600,
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
              lineHeight: 1.7,
              color: theme.palette.text.primary,
              fontWeight: 450,
            }}
          >
            An autonomous, <span className="text-highlight-gold">Zero-Telemetry Local AI Studio</span> built for mathematical rigor, sovereign multi-agent consensus, real-time memory persistence, and in-browser <span className="text-highlight-dark">WebGPU Compute</span>.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 4.5, flexWrap: 'wrap' }}>
            <Button component={RouterLink} to="/adytum" variant="contained" color="primary" size="large" className="pulse-glow-btn" sx={{ px: 3.8, py: 1.3, fontWeight: 800, boxShadow: isDark ? '0 4px 20px rgba(212,175,55,0.4), 0 0 32px rgba(212,175,55,0.15)' : '0 4px 20px rgba(184,134,11,0.3), 0 0 32px rgba(184,134,11,0.1)', '&:hover': { boxShadow: isDark ? '0 6px 28px rgba(212,175,55,0.55), 0 0 44px rgba(212,175,55,0.22)' : '0 6px 28px rgba(184,134,11,0.45), 0 0 44px rgba(184,134,11,0.16)' } }}>
              Enter Adytum Rite
            </Button>
            <Button component={RouterLink} to="/arsenal" variant="outlined" color="primary" size="large" sx={{ px: 3.2, py: 1.3, fontWeight: 750, borderColor: isDark ? 'rgba(212,175,55,0.4)' : '#B8860B', '&:hover': { borderColor: gold.accent, boxShadow: isDark ? '0 0 20px rgba(212,175,55,0.25)' : '0 0 16px rgba(184,134,11,0.2)' } }}>
              Explore Sovereign Arsenal
            </Button>
            <Button component={RouterLink} to="/zoth-os" variant="text" sx={{ color: isDark ? gold.soft : gold.accent, fontWeight: 800, px: 2.5, mt: 0.5, '&:hover': { bgcolor: gold.wash, borderRadius: 2 } }}>
              Zoth OS ISO →
            </Button>
          </Box>

          {/* Grounded CTA divider rule above ServiceRow */}
          <Box sx={{ mt: 4, pt: 1.5, borderTop: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,134,11,0.15)'}` }}>
            <ServiceRow />
          </Box>
        </Box>

        {/* GoldenZLogo3D with ambient glow rings and subtle vignette */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: { xs: 280, md: 380 },
            borderRadius: 3,
            background: isDark
              ? 'radial-gradient(circle at center, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.22) 70%, transparent 100%)'
              : 'radial-gradient(circle at center, rgba(212,175,55,0.09) 0%, rgba(0,0,0,0.025) 70%, transparent 100%)',
            isolation: 'isolate',
          }}
        >
          {/* Third, even larger, fainter outer halo behind the outer ring */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 360, md: 480 },
              height: { xs: 360, md: 480 },
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, rgba(212,175,55,0.025) 50%, transparent 72%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.035) 50%, transparent 72%)',
              filter: 'blur(32px)',
              animation: 'logoHaloBreath 8s ease-in-out infinite',
              animationDelay: '-4s',
              '@keyframes logoHaloBreath': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.55 },
                '50%': { transform: 'scale(1.06)', opacity: 0.85 },
              },
              transition: 'all 0.4s ease',
            }}
          />

          {/* Outer glow ring - slower 8s, subtler scale 1 -> 1.04 */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 300, md: 400 },
              height: { xs: 300, md: 400 },
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.045) 50%, transparent 72%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.065) 50%, transparent 72%)',
              filter: 'blur(22px)',
              animation: 'logoPulse 8s ease-in-out infinite',
              '@keyframes logoPulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.05)', opacity: 1 },
              },
              transition: 'all 0.4s ease',
            }}
          />

          {/* Additional mid-tone glow ring — between inner and outer */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 240, md: 320 },
              height: { xs: 240, md: 320 },
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(245,230,171,0.13) 0%, rgba(212,175,55,0.05) 55%, transparent 72%)'
                : 'radial-gradient(circle, rgba(254,249,231,0.18) 0%, rgba(212,175,55,0.07) 55%, transparent 72%)',
              filter: 'blur(16px)',
              animation: 'logoMidPulse 6s ease-in-out infinite',
              '@keyframes logoMidPulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                '50%': { transform: 'scale(1.04)', opacity: 0.9 },
              },
            }}
          />

          {/* Inner focused glow */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 200, md: 280 },
              height: { xs: 200, md: 280 },
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, transparent 60%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.38) 0%, transparent 60%)',
              filter: 'blur(12px)',
              transition: 'all 0.4s ease',
            }}
          />

          {/* Logo itself */}
          <GoldenZLogo3D size={{ xs: 240, md: 340 }} />
        </Box>
      </Paper>

      {/* Feature Highlights Banner */}
      <Box
        sx={{
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3.5,
          p: { xs: 2, md: 2.5 },
          mb: 8,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          boxShadow: isDark ? '0 12px 36px -18px rgba(0,0,0,0.85), 0 0 20px rgba(212,175,55,0.04)' : '0 12px 36px -18px rgba(16,24,40,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle full-width gold wash background accent */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            bgcolor: gold.accent,
            opacity: isDark ? 0.85 : 0.7,
            zIndex: 3,
          }}
        />

        {[
          { icon: <ShieldIcon sx={{ color: gold.accent, fontSize: 32 }} />, label: 'Zero-Cloud Telemetry', text: 'All LLM calls, embeddings, and memory retention stay 100% on your local metal.' },
          { icon: <SpeedIcon sx={{ color: gold.accent, fontSize: 32 }} />, label: 'WebGPU WASM Engine', text: 'In-browser tensor matmul and neural inference running directly on client GPU.' },
          { icon: <MemoryIcon sx={{ color: gold.accent, fontSize: 32 }} />, label: 'STDP Neuro Memory', text: 'Biological Spike-Timing-Dependent Plasticity engine running via client memory models or local daemon.' },
          { icon: <TerminalIcon sx={{ color: gold.accent, fontSize: 32 }} />, label: 'Sovereign Agent Bridge', text: 'Decentralized peer-to-peer agent bus & consensus engine for multi-agent workflows.' },
        ].map((item, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2.5,
              p: { xs: 2, md: 2.5 },
              pt: 3,
              borderRight: { md: idx < 3 ? `1px solid ${isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.18)'}` : 'none' },
              transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: isDark
                  ? '0 12px 28px -8px rgba(212,175,55,0.28), 0 0 16px rgba(212,175,55,0.1)'
                  : '0 12px 28px -8px rgba(184,134,11,0.22), 0 0 16px rgba(184,134,11,0.12)',
                '& .feature-icon-ring': {
                  borderColor: gold.accent,
                  boxShadow: isDark ? '0 0 18px rgba(212,175,55,0.4), inset 0 0 8px rgba(212,175,55,0.2)' : '0 0 16px rgba(184,134,11,0.3), inset 0 0 8px rgba(184,134,11,0.15)',
                },
                '& .feature-icon-bg': {
                  bgcolor: isDark ? 'rgba(212,175,55,0.18)' : '#FEF9E7',
                },
              },
            }}
          >
            {/* Thin gold top accent line on each item */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                bgcolor: gold.accent,
                opacity: isDark ? 0.8 : 0.7,
                zIndex: 2,
              }}
            />

            {/* Tiny index number (01, 02, 03, 04) in top-left in tiny mono text */}
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: '0.68rem',
                fontWeight: 800,
                color: isDark ? 'rgba(212,175,55,0.75)' : 'rgba(184,134,11,0.8)',
                letterSpacing: '0.1em',
                mb: 2,
                position: 'relative',
                zIndex: 1,
              }}
            >
              0{idx + 1}
            </Typography>

            {/* Circular icon frame: two-ring treatment with gold wash background and gold border ring with outer glow */}
            <Box
              className="feature-icon-ring"
              sx={{
                position: 'relative',
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                p: '3.5px',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.5)' : 'rgba(184,134,11,0.5)'}`,
                boxShadow: isDark
                  ? '0 0 14px rgba(212,175,55,0.28), inset 0 0 8px rgba(212,175,55,0.12)'
                  : '0 0 12px rgba(184,134,11,0.22)',
                transition: 'all 0.28s ease',
                zIndex: 1,
              }}
            >
              <Box
                className="feature-icon-bg"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: gold.wash,
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8'}`,
                  transition: 'all 0.28s ease',
                }}
              >
                {item.icon}
              </Box>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 850, fontSize: '1.04rem', mb: 0.9, color: theme.palette.text.primary, position: 'relative', zIndex: 1 }}>
              {item.label}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.89rem', color: theme.palette.text.secondary, lineHeight: 1.75, position: 'relative', zIndex: 1 }}>
              {item.text}
            </Typography>

            {/* Subtle dot decoration at bottom-right */}
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 10,
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: gold.wash,
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.25)'}`,
                boxShadow: isDark ? '0 0 4px rgba(212,175,55,0.2)' : 'none',
                transition: 'all 0.28s ease',
                '&:hover': {
                  bgcolor: gold.accent,
                  boxShadow: `0 0 8px ${gold.accent}`,
                },
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Task 1: 5 Pillars Architecture Explorer (Right below Feature Highlights) */}
      <ArchitecturePillarsExplorer
        gold={gold}
        isDark={isDark}
        monoFont={mono}
        status={status}
      />

      {/* Task 2: Quick Interactive CLI Terminal Simulator */}
      <CliTerminalSimulator
        gold={gold}
        isDark={isDark}
        monoFont={mono}
      />

      {/* Section 1: In-Browser WebGPU AI Tensor Engine Console */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Typography className="section-kicker">Local Hardware Accelerator</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
          WebGPU High-Performance <span className="text-gradient-gold">Tensor Matrix Console</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 780, lineHeight: 1.65 }}>
          Execute mathematical matrix multiplication benchmarks directly inside your browser window. Uses native <span className="text-highlight-gold">WGSL compute shaders</span> with automatic fallback to <span className="text-highlight-dark">WASM SIMD 128-bit</span> execution.
        </Typography>
        <WebGPUAIConsole />
      </Box>

      {/* Section 2: Primary Workstation Navigation Grid */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Typography className="section-kicker">Core Workstations</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
          Studio Navigation &amp; <span className="text-gradient-gold">Specialized Workspaces</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 780, lineHeight: 1.65 }}>
          Jump straight into sovereign planning, agent cadre inspection, vector memory search, and real-time IPC bridges.
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' },
            gap: 3,
          }}
        >
          {[
            ['Adytum', '/adytum', 'A ritualistic planning workspace with multi-tier execution roadmap generators and prompt synthesis tools.'],
            ['Pantheon Roster', '/swarm', 'Explore 21 specialized autonomous agent roles organized by tactical cadres, skills, and model mappings.'],
            ['Tool Catalog', '/tools', `Browse ${published.length} open-source CLI & browser tools with instant WebGPU launchers and CLI copy snippets.`],
            ['Neuro Memory', '/memory', 'Query the STDP biological memory daemon running locally on port 8094 with vector decay search.'],
            ['Signal Bridge', '/bridges', 'Inspect real-time agent-to-agent communication, simplex channels, and WebSocket heartbeats on port 8102.'],
            ['Consensus Arena', '/consensus', 'Tri-agent Byzantine fault-tolerant debate chamber for hallucination-resistant AST code synthesis.'],
          ].map(([title, to, copy], index) => (
            <Card
              key={title}
              component={RouterLink}
              to={to}
              sx={{
                gridColumn: { md: 'span 2' },
                height: '100%',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                p: 1.5,
                bgcolor: theme.palette.background.paper,
                backgroundImage: isDark
                  ? 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.07) 0%, rgba(0,0,0,0.28) 100%)'
                  : 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.035) 100%)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(212,175,55,0.28)' : theme.palette.divider,
                boxShadow: isDark
                  ? '0 6px 24px -6px rgba(0,0,0,0.75), 0 0 16px rgba(212,175,55,0.05), inset 0 0 20px rgba(212,175,55,0.02)'
                  : '0 6px 24px -6px rgba(16,24,40,0.10), 0 0 16px rgba(212,175,55,0.06), inset 0 0 20px rgba(212,175,55,0.02)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'cardFadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                animationDelay: `${index * 60}ms`,
                '@keyframes cardFadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(14px) scale(0.99)' },
                  '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                },
                '&:hover': {
                  borderColor: gold.accent,
                  transform: 'translateY(-5px)',
                  boxShadow: isDark
                    ? '0 20px 44px -10px rgba(0,0,0,0.85), 0 0 32px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.10), inset 0 0 28px rgba(212,175,55,0.05)'
                    : '0 20px 44px -10px rgba(16,24,40,0.18), 0 0 28px rgba(184,134,11,0.28), 0 0 52px rgba(184,134,11,0.12), inset 0 0 28px rgba(212,175,55,0.04)',
                  '& .cta-arrow': {
                    transform: 'translateX(5px)',
                  },
                  '& .ws-number-badge': {
                    borderColor: gold.accent,
                    boxShadow: `0 0 10px rgba(212,175,55,0.3)`,
                  },
                },
              }}
            >
              {/* Thin gold top accent line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  bgcolor: gold.accent,
                  opacity: isDark ? 0.8 : 0.7,
                  zIndex: 2,
                  boxShadow: `0 0 8px ${gold.accent}`,
                }}
              />
              {/* Subtle bottom-edge shadow line */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 1,
                  right: 1,
                  height: '1px',
                  bgcolor: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,134,11,0.1)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', pt: 2.5 }}>
                <Box>
                  {/* Number badge pill with gold wash background and gold border */}
                  <Box
                    className="ws-number-badge"
                    sx={{
                      display: 'inline-block',
                      px: 1.4,
                      py: 0.4,
                      borderRadius: '14px',
                      bgcolor: gold.wash,
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.45)' : '#F0E1A8'}`,
                      mb: 1.4,
                      transition: 'all 0.3s ease',
                      boxShadow: isDark ? '0 0 6px rgba(212,175,55,0.12)' : 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: isDark ? gold.soft : gold.accent,
                        letterSpacing: '0.1em',
                        lineHeight: 1,
                      }}
                    >
                      0{index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.3, color: theme.palette.text.primary, letterSpacing: '-0.015em' }}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: '0.9rem' }}>{copy}</Typography>
                </Box>
                <Box sx={{ mt: 2.2, color: gold.accent, fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 0.6, letterSpacing: '0.02em' }}>
                  Open Workspace
                  <Box component="span" className="cta-arrow" sx={{ display: 'inline-block', transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)', fontWeight: 900 }}>
                    →
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Section 3: Six Math Pillars Section */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Typography className="section-kicker">Mathematical Foundations</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: theme.palette.text.primary, letterSpacing: '-0.02em' }}>
          The Six Mathematical <span className="text-gradient-gold">Pillars of Zoth</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 780, lineHeight: 1.65 }}>
          Every local agent algorithm in Zoth Studio is derived from six foundational equations spanning <span className="text-highlight-gold">Matrix Multiplication</span>, <span className="text-highlight-gold">Bayesian Update</span>, <span className="text-highlight-gold">Softmax Entropy</span>, <span className="text-highlight-gold">Gradient Descent</span>, <span className="text-highlight-gold">Cosine Similarity</span>, and <span className="text-highlight-gold">Spike-Timing-Dependent Plasticity</span>.
        </Typography>
        <MathPillarsGrid variant="teaser" />
      </Box>

      {/* AI Models & Framework Partners Ticker */}
      <Box sx={{ mb: 8 }}>
        <CompanyTicker />
      </Box>

      {/* Section 4: Published Micro-Tools Catalog Spotlight */}
      <Box sx={{ mb: 9, pt: 2 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography className="section-kicker">Local Tool Ecosystem</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: theme.palette.text.primary }}>Featured Micro-Tools</Typography>
          </Box>
          <Button component={RouterLink} to="/arsenal" variant="outlined" color="primary" sx={{ fontWeight: 750 }}>
            View All {microTools.length} Sovereign Tools →
          </Button>
        </Box>
        <Grid container spacing={3}>
          {published.slice(0, 6).map((tool) => (
            <Grid key={tool.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: theme.palette.background.paper,
                  backgroundImage: isDark
                    ? 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.07) 0%, rgba(0,0,0,0.28) 100%)'
                    : 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.035) 100%)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(212,175,55,0.28)' : theme.palette.divider,
                  borderRadius: 3.5,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isDark
                    ? '0 6px 20px -6px rgba(0,0,0,0.7), 0 0 12px rgba(212,175,55,0.04), inset 0 0 16px rgba(212,175,55,0.02)'
                    : '0 6px 20px -6px rgba(16,24,40,0.10), 0 0 12px rgba(212,175,55,0.05), inset 0 0 16px rgba(212,175,55,0.02)',
                  '&:hover': {
                    borderColor: gold.accent,
                    transform: 'translateY(-5px)',
                    boxShadow: isDark
                      ? '0 18px 40px -10px rgba(0,0,0,0.82), 0 0 28px rgba(212,175,55,0.28), 0 0 48px rgba(212,175,55,0.10), inset 0 0 24px rgba(212,175,55,0.04)'
                      : '0 18px 40px -10px rgba(16,24,40,0.14), 0 0 24px rgba(184,134,11,0.22), 0 0 40px rgba(184,134,11,0.10), inset 0 0 24px rgba(212,175,55,0.03)',
                    '& .tool-top-accent': {
                      bgcolor: gold.accent,
                      opacity: 1,
                      boxShadow: `0 0 10px ${gold.accent}`,
                    },
                    '& .tool-dot-ornament': {
                      bgcolor: gold.accent,
                      boxShadow: `0 0 8px ${gold.accent}`,
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                {/* Thin gold top accent line */}
                <Box
                  className="tool-top-accent"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    bgcolor: gold.wash,
                    opacity: isDark ? 0.55 : 0.4,
                    transition: 'all 0.3s ease',
                    borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(184,134,11,0.15)'}`,
                    zIndex: 2,
                  }}
                />
                <CardContent sx={{ flex: 1, pt: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.8, gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip
                        label={`v${tool.version}`}
                        size="small"
                        sx={{
                          bgcolor: gold.wash,
                          color: isDark ? gold.soft : gold.accent,
                          fontWeight: 750,
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.3)',
                          fontSize: '0.7rem',
                          fontFamily: mono,
                          letterSpacing: '0.04em',
                          borderRadius: 1.5,
                        }}
                      />
                      {tool.executionType === 'webgpu' && (
                        <Chip
                          label="⚡ WEBGPU"
                          size="small"
                          sx={{
                            bgcolor: isDark ? 'rgba(56,189,248,0.18)' : '#E0F2FE',
                            color: isDark ? '#38BDF8' : '#0369A1',
                            fontWeight: 750,
                            fontSize: '0.68rem',
                            fontFamily: mono,
                            border: `1px solid ${isDark ? 'rgba(56,189,248,0.4)' : '#BAE6FD'}`,
                            borderRadius: 1.5,
                            letterSpacing: '0.04em',
                          }}
                        />
                      )}
                    </Box>
                    {/* Tool type indicator icon with hover glow */}
                    <Tooltip title={tool.executionType === 'webgpu' ? 'WebGPU Shader Accelerated' : tool.localOnly ? 'Local Subprocess Only' : 'GitHub Open Source'}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: gold.accent,
                          opacity: 0.9,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            opacity: 1,
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {tool.executionType === 'webgpu' ? (
                          <FlashOnIcon sx={{ fontSize: 17 }} />
                        ) : tool.localOnly ? (
                          <TerminalIcon sx={{ fontSize: 17 }} />
                        ) : (
                          <GitHubIcon sx={{ fontSize: 17 }} />
                        )}
                      </Box>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.2, color: theme.palette.text.primary, letterSpacing: '-0.015em', fontSize: '1.05rem' }}>{tool.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, fontSize: '0.88rem' }}>{tool.description}</Typography>
                </CardContent>
                <CardActions
                  sx={{
                    px: 2.2,
                    pb: 2.2,
                    pt: 1.8,
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}`,
                    position: 'relative',
                  }}
                >
                  {/* Tiny gold dot ornament centered on divider */}
                  <Box
                    className="tool-dot-ornament"
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      top: -3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: gold.wash,
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.2)'}`,
                      boxShadow: isDark ? '0 0 5px rgba(212,175,55,0.2)' : 'none',
                      transition: 'all 0.3s ease',
                      zIndex: 2,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? gold.soft : gold.accent, fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.02em' }}>{tool.repo}</Typography>
                  {tool.executionType === 'webgpu' ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/tools/${tool.id}`}
                      startIcon={<FlashOnIcon sx={{ fontSize: '0.95rem !important' }} />}
                      sx={{
                        fontSize: '0.76rem',
                        fontWeight: 750,
                        border: '1px solid transparent',
                        borderRadius: 2,
                        px: 2.2,
                        py: 0.55,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.02em',
                        '&:hover': {
                          borderColor: isDark ? '#F5E6AB' : '#D4AF37',
                          boxShadow: '0 0 12px rgba(212,175,55,0.4)',
                          transform: 'translateY(-1px)',
                        },
                        '&:active': {
                          transform: 'scale(0.97)',
                        },
                      }}
                    >
                      Open Tool
                    </Button>
                  ) : tool.localOnly ? (
                    <Chip
                      label="LOCAL ONLY"
                      size="small"
                      sx={{
                        bgcolor: isDark ? 'rgba(148,163,184,0.14)' : '#F1F5F9',
                        color: theme.palette.text.secondary,
                        fontWeight: 750,
                        fontSize: '0.68rem',
                        border: `1px solid ${isDark ? 'rgba(212,175,55,0.22)' : theme.palette.divider}`,
                        borderRadius: 1.5,
                        fontFamily: mono,
                        letterSpacing: '0.04em',
                      }}
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      href={tool.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<GitHubIcon sx={{ fontSize: '0.95rem !important' }} />}
                      sx={{
                        fontSize: '0.76rem',
                        fontWeight: 750,
                        border: '1px solid transparent',
                        borderRadius: 2,
                        px: 2.2,
                        py: 0.55,
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.02em',
                        '&:hover': {
                          borderColor: isDark ? '#F5E6AB' : '#D4AF37',
                          boxShadow: '0 0 12px rgba(212,175,55,0.4)',
                          transform: 'translateY(-1px)',
                        },
                        '&:active': {
                          transform: 'scale(0.97)',
                        },
                      }}
                    >
                      Repo
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sovereign Ecosystem Deployment Funnel */}
      <SovereignFunnel
        title="Deploy Zoth Studio & Sovereign AI Tools Locally"
        subtitle="Experience zero-telemetry AI engineering with sovereign in-browser workstations, bare-metal operating system images, or modular standalone micro-repos."
        toolTitle="Option 1: Adytum Alchemist Micro-Repo"
        toolTag="WORKFLOW CLI"
        toolDescription="Offline cryptographic 22-Key planning rite, automated incubation clocks, and cryptographic SHA-256 seal stamp generators."
        toolRepo="https://github.com/NullAITech/adytum-alchemist-ai-workflow"
        toolCommand="npx zoth pull adytum-alchemist-ai-workflow"
      />
    </Container>
    </>
  );
}
