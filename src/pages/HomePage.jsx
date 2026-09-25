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
          label={`${({ 'Neuro memory daemon': 'Memory :8788', 'Sovereign agent bridge': 'Bridge :8789', 'Vault daemon': 'Vault :8787', Ollama: 'Models :11434' })[service.name] || service.name} ${service.up ? 'READY' : 'OFFLINE'}`}
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
  const [selectedTemplate, setSelectedTemplate] = useState('sovereign-cadre');
  const [isSimulating, setIsSimulating] = useState(false);

  const commands = useMemo(() => ({
    up: {
      id: 'up',
      chipLabel: 'npx zoth up',
      desc: 'Starts offline daemons (memory, bridge, vault, studio)',
      cmd: 'npx zoth up',
      lines: [
        { type: 'command', text: '$ npx zoth up' },
        { type: 'dim', text: 'Zoth CLI 2.0.0 · studio root ~/.../zoth-studio-v2' },
        { type: 'empty', text: '' },
        { type: 'success', text: '✔ memory   pid 41802  listening on 127.0.0.1:8788  (STDP HNSW Daemon)' },
        { type: 'success', text: '✔ bridge   pid 41819  listening on 127.0.0.1:8789  (Sovereign Peer Bus)' },
        { type: 'success', text: '✔ vault    pid 41835  listening on 127.0.0.1:8787  (Argon2id Hardware Sanctum)' },
        { type: 'success', text: '✔ classic  pid 41848  listening on 127.0.0.1:8088  (37 Sovereign Workstations)' },
        { type: 'success', text: '✔ ollama   ready      4 local models detected (qwen2.5-coder, llama3)' },
        { type: 'success', text: '✔ UI       ready      http://127.0.0.1:3000/ (Zero-Egress Studio)' },
        { type: 'empty', text: '' },
        { type: 'gold', text: '★ All 5 offline enclaves initialized. Zero external telemetry active.' },
      ],
    },
    status: {
      id: 'status',
      chipLabel: 'npx zoth status',
      desc: 'Checks loopback enclaves & hardware readiness',
      cmd: 'npx zoth status',
      lines: [
        { type: 'command', text: '$ npx zoth status' },
        { type: 'dim', text: 'Zoth CLI 2.0.0 · probing loopback enclaves & hardware readiness...' },
        { type: 'empty', text: '' },
        { type: 'success', text: '  up   Memory Daemon           127.0.0.1:8788   latency: 0.32ms (Lucy Oracle Synaptic Matrix)' },
        { type: 'success', text: '  up   Sovereign Agent Bridge  127.0.0.1:8789   latency: 0.41ms (E2EE Simplex Mesh)' },
        { type: 'success', text: '  up   Hardware Vault Daemon   127.0.0.1:8787   latency: 0.28ms (Argon2id / XChaCha20-Poly1305)' },
        { type: 'success', text: '  up   Classic Workstations    127.0.0.1:8088   latency: 0.55ms (37 Consoles In-App)' },
        { type: 'success', text: '  up   Ollama Local Engine     127.0.0.1:11434  local models: 4 (Zero-Cloud Fallback)' },
        { type: 'success', text: '  yes  /dev/kvm                QEMU/KVM Hardware Hypervisor Acceleration (vCPU Sandboxed)' },
        { type: 'empty', text: '' },
        { type: 'cyan', text: 'Published Tool Checkouts: 25/25 verified on disk' },
        { type: 'gold', text: 'OWASP Zero-Egress Invariant: 0 outbound connections detected. Host strictly air-gapped.' },
      ],
    },
    clone: {
      id: 'clone',
      chipLabel: 'npx zoth clone <template>',
      desc: 'Scaffolds open-source templates and cadres',
      cmd: `npx zoth clone ${selectedTemplate}`,
      lines: [
        { type: 'command', text: `$ npx zoth clone ${selectedTemplate}` },
        { type: 'dim', text: `Zoth CLI 2.0.0 · fetching scaffold for template: ${selectedTemplate}...` },
        { type: 'empty', text: '' },
        { type: 'cyan', text: `Scaffolding template: ${selectedTemplate} (Zero-egress architecture)` },
        { type: 'success', text: `✔ Created ./cadres/${selectedTemplate} with 21 pantheon definitions` },
        { type: 'success', text: '✔ Linked STDP synaptic memory client to loopback port :8788' },
        { type: 'success', text: '✔ Configured Byzantine consensus arbiter on loopback port :8789' },
        { type: 'success', text: '✔ Verified Argon2id vault hardware secret derivation hooks' },
        { type: 'success', text: '✔ Scaffold complete: 0 outbound dependencies, pure local execution.' },
        { type: 'empty', text: '' },
        { type: 'gold', text: `Ready: cd cadres/${selectedTemplate} && npx zoth up` },
      ],
    },
  }), [selectedTemplate]);

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
          borderRadius: 3.5,
          overflow: 'hidden',
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
            px: { xs: 2, md: 2.5 },
            py: 1.4,
            bgcolor: isDark ? '#0A0A10' : '#1E293B',
            borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.1)'}`,
            flexWrap: 'wrap',
            gap: 1.5,
            position: 'relative',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
              {[
                { color: '#EF4444' },
                { color: '#F59E0B' },
                { color: '#10B981' },
              ].map((dot, dIdx) => (
                <Box
                  key={dIdx}
                  sx={{
                    position: 'relative',
                    width: 15,
                    height: 15,
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
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: dot.color,
                    }}
                  />
                </Box>
              ))}
            </Box>
            <Typography
              sx={{
                fontFamily: monoFont,
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                color: isDark ? '#94A3B8' : '#CBD5E1',
                ml: 1,
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              neo@zoth-metal:~ (bash — 127.0.0.1)
            </Typography>
          </Box>

          {/* Action Buttons: Copy & Run */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={handleRunSimulation}
              startIcon={<PlayArrowIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                fontFamily: monoFont,
                fontSize: '0.75rem',
                color: '#F5E6AB',
                background: isDark
                  ? 'repeating-linear-gradient(0deg, rgba(212,175,55,0.03) 0px, rgba(212,175,55,0.03) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #151520 0%, #0c0c12 100%)'
                  : 'repeating-linear-gradient(0deg, rgba(184,134,11,0.03) 0px, rgba(184,134,11,0.03) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #2A374A 0%, #1E293B 100%)',
                border: '1px solid rgba(212,175,55,0.35)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                px: 1.5,
                py: 0.4,
                '&:hover': {
                  background: isDark
                    ? 'repeating-linear-gradient(0deg, rgba(212,175,55,0.05) 0px, rgba(212,175,55,0.05) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #1f1f2e 0%, #12121c 100%)'
                    : 'repeating-linear-gradient(0deg, rgba(184,134,11,0.05) 0px, rgba(184,134,11,0.05) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #334155 0%, #243248 100%)',
                  borderColor: '#D4AF37',
                },
              }}
            >
              Replay Command
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleCopy(activeData.cmd)}
              startIcon={copied ? <CheckIcon sx={{ fontSize: '1rem !important' }} /> : <ContentCopyIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{
                fontFamily: monoFont,
                fontSize: '0.75rem',
                fontWeight: 750,
                bgcolor: copied ? '#059669' : '#D4AF37',
                color: copied ? '#FFFFFF' : '#08080B',
                boxShadow: copied
                  ? 'inset 0 1px 1px rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.2)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -1px 1px rgba(0,0,0,0.25), 0 2px 6px rgba(212,175,55,0.3)',
                px: 1.8,
                py: 0.4,
                '&:hover': {
                  bgcolor: copied ? '#047857' : '#E5C158',
                  boxShadow: copied
                    ? 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.3)'
                    : 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.3), 0 3px 10px rgba(212,175,55,0.45)',
                },
              }}
            >
              {copied ? 'Copied!' : 'Copy Command'}
            </Button>
          </Box>
        </Box>

        {/* Command Selector Tabs Strip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: { xs: 2, md: 2.5 },
            py: 1.25,
            bgcolor: isDark ? '#07070D' : '#141E33',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)'}`,
            overflowX: 'auto',
            gap: 1.2,
            position: 'relative',
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
              opacity: isDark ? 0.35 : 0.22,
              pointerEvents: 'none',
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
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 0.5,
                  borderRadius: 2,
                  color: isSelected ? '#F5E6AB' : '#94A3B8',
                  bgcolor: isSelected ? 'rgba(212,175,55,0.18)' : 'transparent',
                  border: '1px solid',
                  borderColor: isSelected ? '#D4AF37' : 'rgba(148,163,184,0.15)',
                  boxShadow: isSelected
                    ? isDark
                      ? '0 3px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(212,175,55,0.25)'
                      : '0 2px 6px rgba(184,134,11,0.2)'
                    : 'none',
                  '&:hover': {
                    bgcolor: 'rgba(212,175,55,0.1)',
                    borderColor: '#D4AF37',
                  },
                }}
              >
                {cmd.chipLabel}
              </Button>
            );
          })}

          {/* If clone selected, provide quick template picker chips */}
          {activeTab === 'clone' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 'auto' }}>
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.7rem', color: '#64748B', display: { xs: 'none', md: 'block' } }}>
                TEMPLATE:
              </Typography>
              {['sovereign-cadre', 'webgpu-tensor-flow', 'hexstrike-guard'].map((tName) => (
                <Chip
                  key={tName}
                  label={tName}
                  size="small"
                  onClick={() => setSelectedTemplate(tName)}
                  sx={{
                    fontFamily: monoFont,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    bgcolor: selectedTemplate === tName ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.04)',
                    color: selectedTemplate === tName ? '#38BDF8' : '#94A3B8',
                    border: '1px solid',
                    borderColor: selectedTemplate === tName ? '#38BDF8' : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Terminal Screen Body with Syntax Highlighting */}
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            fontFamily: monoFont,
            fontSize: { xs: '0.78rem', sm: '0.86rem' },
            lineHeight: 1.75,
            minHeight: 280,
            overflowX: 'auto',
            opacity: isSimulating ? 0.35 : 1,
            transition: 'opacity 0.18s ease',
            position: 'relative',
          }}
        >
          {/* Scan-line texture effect overlay (dark mode only) */}
          {isDark && (
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 2px)',
                opacity: 0.015,
                zIndex: 1,
              }}
            />
          )}

          {activeData.lines.map((line, idx) => {
            if (line.type === 'empty') {
              return <Box key={idx} sx={{ height: '0.6em' }} />;
            }
            if (line.type === 'command') {
              return (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
                  <Typography component="span" sx={{ fontFamily: monoFont, color: '#D4AF37', fontWeight: 800 }}>
                    user@zoth-metal:~$
                  </Typography>
                  <Typography component="span" sx={{ fontFamily: monoFont, color: '#FFFFFF', fontWeight: 800 }}>
                    {activeData.cmd}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: '8px',
                      height: '15px',
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
                <Typography key={idx} sx={{ fontFamily: monoFont, color: '#64748B', fontSize: '0.82rem', position: 'relative', zIndex: 2 }}>
                  {line.text}
                </Typography>
              );
            }
            if (line.type === 'success') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, color: '#34D399', fontWeight: 600, position: 'relative', zIndex: 2 }}>
                  {line.text}
                </Typography>
              );
            }
            if (line.type === 'cyan') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, color: '#38BDF8', fontWeight: 600, position: 'relative', zIndex: 2 }}>
                  {line.text}
                </Typography>
              );
            }
            if (line.type === 'gold') {
              return (
                <Typography key={idx} sx={{ fontFamily: monoFont, color: '#F5E6AB', fontWeight: 750, mt: 0.5, position: 'relative', zIndex: 2 }}>
                  {line.text}
                </Typography>
              );
            }
            return (
              <Typography key={idx} sx={{ fontFamily: monoFont, color: '#EDEFF2', position: 'relative', zIndex: 2 }}>
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
      id: 'workstations',
      indexLabel: '01',
      tabLabel: '1. Workstations (37 Sovereign Consoles)',
      shortTitle: 'Workstations',
      badge: 'SOVEREIGN RUNTIME',
      title: '37 Sovereign Consoles & Operative Cockpits',
      subtitle: 'Zero-Egress In-Browser Multi-Agent Execution Matrix',
      description:
        'All 37 studio workstations are integrated directly into Zoth Studio v2. They render with the native gold-on-void design system, zero external runtime dependency, and immediate interactive execution across Spatial, Build, Swarm, and Observe cadres.',
      metrics: [
        { label: 'Total Consoles', value: '37 Sovereign', desc: '100% In-Browser Native' },
        { label: 'Loopback Enclaves', value: ':8088 / :8484', desc: 'Air-Gapped Process Isolation' },
        { label: 'Runtime Egress', value: '0.00 KB', desc: 'OWASP Zero-Egress Compliant' },
        { label: 'Cadres Supported', value: '4 Tactical', desc: 'Spatial, Build, Swarm, Observe' },
      ],
      invariants: [
        'Pure client-side rendering with zero external telemetry',
        'Direct WebGPU WGSL canvas and SVG schematic visualizers',
        'Deterministic state replay and local session chronicle',
        'Zero cloud fallback required for offline operations',
      ],
      specs: [
        { label: 'Primary Port', value: '127.0.0.1:8088 (Static Hub)' },
        { label: 'Process Isolation', value: 'Dedicated Subprocess Daemons' },
        { label: 'Operator Deck', value: '127.0.0.1:8484 (Consensus IDE)' },
        { label: 'Asset Bundling', value: 'Vite 5 Production Prerendered' },
      ],
      launchButton: {
        label: 'Launch Workstation',
        to: '/workstations',
        icon: <RocketLaunchIcon />,
      },
      secondaryButton: {
        label: 'Open Agent Composer',
        to: '/workstations/agent-composer',
        icon: <LaunchIcon />,
      },
      icon: <TerminalIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: '37 SOVEREIGN CONSOLES',
    },
    {
      id: 'micro-tools',
      indexLabel: '02',
      tabLabel: '2. Micro-Tools (25 Standalone In-Browser Tools)',
      shortTitle: 'Micro-Tools',
      badge: 'STANDALONE RUNTIME',
      title: '25 Standalone In-Browser Micro-Tools',
      subtitle: 'Client-Side WebGPU Shaders & Zero-Leakage Cryptographic Utilities',
      description:
        '25 standalone, single-purpose utilities engineered for security researchers, cryptographers, and AI engineers. Features WebGPU tensor matrix shaders, steganographic audio encoders, regex droid engines, and WCAG contrast guards without external servers.',
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
        label: 'Launch Tool',
        to: '/tools',
        icon: <FlashOnIcon />,
      },
      secondaryButton: {
        label: 'Open WebGPU Tensor Engine',
        to: '/tools/nexus-3d-scene-studio',
        icon: <LaunchIcon />,
      },
      icon: <FlashOnIcon sx={{ fontSize: 32, color: gold.accent }} />,
      featuredChip: '25 STANDALONE TOOLS',
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
        'Biological memory persistence engine executing locally on loopback port 8788. Models asymmetric Hebbian learning with long-term potentiation (LTP) and long-term depression (LTD). Features 3D pseudo-vector manifold projection and the Lucy Oracle synaptic search.',
      metrics: [
        { label: 'Daemon Port', value: '127.0.0.1:8788', desc: 'Loopback IPC Socket' },
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
        { label: 'Daemon Architecture', value: 'Python 3 HNSW + STDP Worker' },
        { label: 'Endpoint', value: 'http://127.0.0.1:8788/v1/memory' },
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
        { label: 'Consensus Bus', value: '127.0.0.1:8789', desc: 'E2EE Simplex Peer Mesh' },
      ],
      invariants: [
        'Three-phase commit protocol: Propose -> Pre-Commit -> Final AST Ratification',
        'Merkle-trie root verification ensures tamper-proof code mutation deltas',
        'Dialectical synthesis filters speculative or corrupted syntax modifications',
        'Completely decentralized arbitration with zero external coordinator',
      ],
      specs: [
        { label: 'Arbiter Protocol', value: 'Deterministic Socratic BFT' },
        { label: 'Communication Bus', value: 'Loopback Simplex Socket :8789' },
        { label: 'Verification Model', value: 'SHA-256 Merkle-Trie AST Diff' },
        { label: 'Synthesis Metric', value: 'Bayesian Weighted Confidence Score' },
      ],
      launchButton: {
        label: 'Launch Workstation',
        to: '/consensus',
        icon: <GavelIcon />,
      },
      secondaryButton: {
        label: 'Inspect Agent Bridge',
        to: '/bridges',
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
        'Air-gapped cryptographic sanctum listening on loopback port 8787. Derives high-entropy master keys using memory-hard Argon2id (t=3, m=64MB, p=4) and protects operator secrets at rest with XChaCha20-Poly1305 authenticated encryption and the 5-minute incubation rite.',
      metrics: [
        { label: 'Vault Daemon Port', value: '127.0.0.1:8787', desc: 'Hardware Enclave Listener' },
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
          borderRadius: 3.5,
          bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.28)'}`,
          boxShadow: isDark
            ? '0 18px 42px rgba(0,0,0,0.65), 0 0 28px rgba(212,175,55,0.06)'
            : '0 18px 42px rgba(16,24,40,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft pillar background accent glow - top right */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 320,
            height: 320,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle at top right, rgba(212,175,55,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Mirrored opposing glow - bottom left */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 420,
            height: 420,
            pointerEvents: 'none',
            background: isDark
              ? 'radial-gradient(circle at bottom left, rgba(212,175,55,0.07) 0%, transparent 70%)'
              : 'radial-gradient(circle at bottom left, rgba(212,175,55,0.05) 0%, transparent 70%)',
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
                    p: 2,
                    height: '100%',
                    borderRadius: 2.5,
                    bgcolor: isDark ? '#07070B' : '#F8FAFC',
                    borderColor: isDark ? 'rgba(212,175,55,0.22)' : '#EAECF0',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.22s ease',
                    '&:hover': {
                      borderColor: gold.accent,
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 6px 20px -4px rgba(0,0,0,0.6), 0 0 16px rgba(212,175,55,0.25)'
                        : '0 6px 20px -4px rgba(16,24,40,0.1), 0 0 14px rgba(184,134,11,0.2)',
                    },
                  }}
                >
                  {/* Subtle gold top accent strip */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      bgcolor: gold.wash,
                      borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.2)'}`,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: monoFont, color: isDark ? '#94A3B8' : '#64748B', fontWeight: 700, display: 'block', mb: 0.5, mt: 0.2 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: monoFont, fontWeight: 800, color: isDark ? gold.soft : gold.accent, mb: 0.5, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.78rem', color: isDark ? '#64748B' : '#98A2B3' }}>
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
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
                border: `1px solid ${isDark ? '#26262F' : '#EAECF0'}`,
                height: '100%',
              }}
            >
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', fontWeight: 800, color: isDark ? gold.soft : gold.accent, letterSpacing: '0.1em', mb: 1.5 }}>
                ARCHITECTURAL GUARANTEES &amp; INVARIANTS
              </Typography>
              <Stack spacing={1.2}>
                {activePillar.invariants.map((inv, invIdx) => (
                  <Box key={invIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: gold.wash,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: '1px',
                        border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.2)'}`,
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#34D399' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: isDark ? '#D1D5DB' : '#374151', lineHeight: 1.55, fontSize: '0.86rem' }}>
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
                borderRadius: 2.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
                border: `1px solid ${isDark ? '#26262F' : '#EAECF0'}`,
                height: '100%',
              }}
            >
              <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', fontWeight: 800, color: isDark ? gold.soft : gold.accent, letterSpacing: '0.1em', mb: 1.5 }}>
                RUNTIME SPECIFICATIONS
              </Typography>
              <Stack spacing={1.2}>
                {activePillar.specs.map((spec, sIdx) => (
                  <Box
                    key={sIdx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.6,
                      px: 1,
                      borderLeft: `2px solid ${gold.wash}`,
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(212,175,55,0.04)' : 'rgba(212,175,55,0.03)',
                      },
                    }}
                  >
                    <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                      {spec.label}
                    </Typography>
                    <Typography sx={{ fontFamily: monoFont, fontSize: '0.78rem', fontWeight: 750, color: isDark ? gold.soft : gold.accent }}>
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
                color: isDark ? '#08080B' : '#FFFFFF',
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

          <Typography sx={{ fontFamily: monoFont, fontSize: '0.74rem', color: isDark ? '#64748B' : '#94A3B8' }}>
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
export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const published = microTools.filter((tool) => tool.published);
  const { status } = useStudioStatus();

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 7 } }}>
      {/* Soft radial gold glow behind the hero (HomePage signature) */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '100%', md: '900px' },
          height: { xs: 420, md: 520 },
          pointerEvents: 'none',
          zIndex: 0,
          background: isDark
            ? 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.18) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
        }}
      />

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
                radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.04) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.03) 0%, transparent 50%),
                linear-gradient(165deg, ${theme.palette.background.paper} 0%, rgba(212,175,55,0.05) 100%)
              `
            : `
                radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.06) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(184,134,11,0.04) 0%, transparent 50%),
                linear-gradient(165deg, ${theme.palette.background.paper} 0%, #FEF9E720 100%)
              `,
          /* Multi-layered gold glow system: ambient + focused + edge + subtle inner glow border */
          boxShadow: isDark
            ? `
                0 0 0 1px rgba(212,175,55,0.08),
                0 20px 60px -12px rgba(0,0,0,0.7),
                0 0 40px -8px rgba(212,175,55,0.12),
                inset 0 0 20px rgba(212,175,55,0.05),
                inset 0 1px 0 rgba(212,175,55,0.08)
              `
            : `
                0 0 0 1px rgba(184,134,11,0.12),
                0 20px 60px -12px rgba(16,24,40,0.12),
                0 0 40px -8px rgba(212,175,55,0.15),
                inset 0 0 20px rgba(184,134,11,0.05),
                inset 0 1px 0 rgba(255,255,255,0.5)
              `,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(280px, 400px)' },
          gap: { xs: 4, md: 7 },
          alignItems: 'center',
          transition: 'box-shadow 0.4s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: isDark
              ? `
                  0 0 0 1px rgba(212,175,55,0.15),
                  0 24px 72px -12px rgba(0,0,0,0.75),
                  0 0 56px -8px rgba(212,175,55,0.18),
                  inset 0 0 24px rgba(212,175,55,0.08),
                  inset 0 1px 0 rgba(212,175,55,0.12)
                `
              : `
                  0 0 0 1px rgba(184,134,11,0.2),
                  0 24px 72px -12px rgba(16,24,40,0.15),
                  0 0 56px -8px rgba(212,175,55,0.22),
                  inset 0 0 24px rgba(184,134,11,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
          },
        }}
      >
        {/* Soft, large ambient gold glow behind logo */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '50%',
            right: { xs: '8%', md: '14%' },
            transform: 'translateY(-50%)',
            width: { xs: 300, md: 420 },
            height: { xs: 300, md: 420 },
            pointerEvents: 'none',
            zIndex: 0,
            background: isDark
              ? 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.09) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(212,175,55,0.30) 0%, rgba(212,175,55,0.12) 40%, transparent 70%)',
            filter: 'blur(16px)',
            transition: 'all 0.5s ease',
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
                ? '0 0 12px rgba(212,175,55,0.5), 0 0 24px rgba(212,175,55,0.2)'
                : '0 0 12px rgba(184,134,11,0.4), 0 0 24px rgba(184,134,11,0.15)',
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
            <Button component={RouterLink} to="/adytum" variant="contained" color="primary" size="large" className="pulse-glow-btn" sx={{ px: 3.8, py: 1.3, fontWeight: 800 }}>
              Enter Adytum Rite
            </Button>
            <Button component={RouterLink} to="/tools" variant="outlined" color="primary" size="large" sx={{ px: 3.2, py: 1.3, fontWeight: 750 }}>
              Explore 25 Micro-Tools
            </Button>
            <Button component={RouterLink} to="/zoth-os" variant="text" sx={{ color: isDark ? gold.soft : gold.accent, fontWeight: 800, px: 2.5, mt: 0.5 }}>
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
              ? 'radial-gradient(circle at center, rgba(212,175,55,0.07) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)'
              : 'radial-gradient(circle at center, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.02) 70%, transparent 100%)',
          }}
        >
          {/* Third, even larger, fainter outer halo behind the outer ring */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 340, md: 460 },
              height: { xs: 340, md: 460 },
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.02) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.03) 50%, transparent 70%)',
              filter: 'blur(28px)',
              animation: 'logoHaloBreath 8s ease-in-out infinite',
              animationDelay: '-4s',
              '@keyframes logoHaloBreath': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                '50%': { transform: 'scale(1.05)', opacity: 0.9 },
              },
              transition: 'all 0.4s ease',
            }}
          />

          {/* Outer glow ring - slower 8s, subtler scale 1 -> 1.04 */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              width: { xs: 280, md: 380 },
              height: { xs: 280, md: 380 },
              borderRadius: '50%',
              background: isDark
                ? 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.20) 0%, rgba(212,175,55,0.06) 50%, transparent 70%)',
              filter: 'blur(20px)',
              animation: 'logoPulse 8s ease-in-out infinite',
              '@keyframes logoPulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.75 },
                '50%': { transform: 'scale(1.04)', opacity: 1 },
              },
              transition: 'all 0.4s ease',
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
                ? 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 60%)'
                : 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 60%)',
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
          borderRadius: 3,
          p: { xs: 2, md: 2.5 },
          mb: 8,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          boxShadow: isDark ? '0 10px 30px -18px rgba(0,0,0,0.8)' : '0 10px 30px -18px rgba(16,24,40,0.18)',
        }}
      >
        {[
          { icon: <ShieldIcon sx={{ color: gold.accent, fontSize: 30 }} />, label: 'Zero-Cloud Telemetry', text: 'All LLM calls, embeddings, and memory retention stay 100% on your local metal.' },
          { icon: <SpeedIcon sx={{ color: gold.accent, fontSize: 30 }} />, label: 'WebGPU WASM Engine', text: 'In-browser tensor matmul and neural inference running directly on client GPU.' },
          { icon: <MemoryIcon sx={{ color: gold.accent, fontSize: 30 }} />, label: 'STDP Neuro Memory', text: 'Biological Spike-Timing-Dependent Plasticity daemon listening on 127.0.0.1:8788.' },
          { icon: <TerminalIcon sx={{ color: gold.accent, fontSize: 30 }} />, label: 'Sovereign Agent Bridge', text: 'Decentralized peer-to-peer agent bus & consensus engine listening on 127.0.0.1:8789.' },
        ].map((item, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              p: { xs: 2, md: 2.5 },
              pt: 2.5,
              borderRight: { md: idx < 3 ? `1px solid ${isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.18)'}` : 'none' },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 8px 24px -6px rgba(212,175,55,0.22)'
                  : '0 8px 24px -6px rgba(184,134,11,0.18)',
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
                opacity: isDark ? 0.75 : 0.65,
              }}
            />

            {/* Tiny index number (01, 02, 03, 04) in top-left in tiny mono text */}
            <Typography
              sx={{
                fontFamily: mono,
                fontSize: '0.68rem',
                fontWeight: 800,
                color: isDark ? 'rgba(212,175,55,0.7)' : 'rgba(184,134,11,0.75)',
                letterSpacing: '0.1em',
                mb: 1.5,
              }}
            >
              0{idx + 1}
            </Typography>

            {/* Circular icon frame: two-ring treatment with gold wash background and gold border ring with outer glow */}
            <Box
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.75,
                p: '3px',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.45)' : 'rgba(184,134,11,0.45)'}`,
                boxShadow: isDark
                  ? '0 0 12px rgba(212,175,55,0.22), inset 0 0 6px rgba(212,175,55,0.1)'
                  : '0 0 10px rgba(184,134,11,0.18)',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: gold.wash,
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#F0E1A8'}`,
                }}
              >
                {item.icon}
              </Box>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 850, fontSize: '1.02rem', mb: 0.8, color: theme.palette.text.primary }}>
              {item.label}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.88rem', color: theme.palette.text.secondary, lineHeight: 1.7 }}>
              {item.text}
            </Typography>
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
            ['Neuro Memory', '/memory', 'Query the STDP biological memory daemon running locally on port 8788 with vector decay search.'],
            ['Signal Bridge', '/bridges', 'Inspect real-time agent-to-agent communication, simplex channels, and WebSocket heartbeats on port 8789.'],
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
                p: 1,
                bgcolor: theme.palette.background.paper,
                backgroundImage: isDark
                  ? 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0.25) 100%)'
                  : 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.03) 100%)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(212,175,55,0.22)' : theme.palette.divider,
                boxShadow: isDark
                  ? '0 4px 20px -4px rgba(0,0,0,0.7), 0 0 12px rgba(212,175,55,0.04)'
                  : '0 4px 16px -4px rgba(16,24,40,0.08)',
                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'cardFadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
                animationDelay: `${index * 60}ms`,
                '@keyframes cardFadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(12px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                '&:hover': {
                  borderColor: gold.accent,
                  transform: 'translateY(-4px)',
                  boxShadow: isDark
                    ? '0 16px 36px -8px rgba(0,0,0,0.8), 0 0 28px rgba(212,175,55,0.3)'
                    : '0 16px 36px -8px rgba(16,24,40,0.15), 0 0 24px rgba(184,134,11,0.25)',
                  '& .cta-arrow': {
                    transform: 'translateX(4px)',
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
                  height: '2px',
                  bgcolor: gold.accent,
                  opacity: isDark ? 0.75 : 0.65,
                  zIndex: 2,
                }}
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', pt: 2.2 }}>
                <Box>
                  {/* Number badge pill with gold wash background and gold border */}
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.2,
                      py: 0.3,
                      borderRadius: '12px',
                      bgcolor: gold.wash,
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
                      mb: 1.2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: isDark ? gold.soft : gold.accent,
                        letterSpacing: '0.08em',
                        lineHeight: 1,
                      }}
                    >
                      0{index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.2, color: theme.palette.text.primary }}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{copy}</Typography>
                </Box>
                <Box sx={{ mt: 2, color: gold.accent, fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Open Workspace
                  <Box component="span" className="cta-arrow" sx={{ display: 'inline-block', transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
          <Button component={RouterLink} to="/tools" variant="outlined" color="primary" sx={{ fontWeight: 750 }}>
            View All {microTools.length} Micro-Tools →
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
                    ? 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0.25) 100%)'
                    : 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.03) 100%)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(212,175,55,0.22)' : theme.palette.divider,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: gold.accent,
                    transform: 'translateY(-4px)',
                    boxShadow: isDark
                      ? '0 16px 36px -8px rgba(0,0,0,0.8), 0 0 24px rgba(212,175,55,0.25)'
                      : '0 16px 36px -8px rgba(16,24,40,0.12), 0 0 20px rgba(184,134,11,0.2)',
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
                    height: '2px',
                    bgcolor: gold.accent,
                    opacity: isDark ? 0.75 : 0.65,
                    zIndex: 2,
                  }}
                />
                <CardContent sx={{ flex: 1, pt: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={`v${tool.version}`}
                        size="small"
                        sx={{
                          bgcolor: gold.wash,
                          color: isDark ? gold.soft : gold.accent,
                          fontWeight: 750,
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.25)',
                        }}
                      />
                      {tool.executionType === 'webgpu' && (
                        <Chip
                          label="⚡ WEBGPU"
                          size="small"
                          sx={{
                            bgcolor: isDark ? 'rgba(56,189,248,0.14)' : '#E0F2FE',
                            color: isDark ? '#38BDF8' : '#0369A1',
                            fontWeight: 750,
                            fontSize: '0.68rem',
                            fontFamily: mono,
                            border: `1px solid ${isDark ? 'rgba(56,189,248,0.35)' : '#BAE6FD'}`,
                          }}
                        />
                      )}
                    </Box>
                    {/* Tool type indicator icon */}
                    <Tooltip title={tool.executionType === 'webgpu' ? 'WebGPU Shader Accelerated' : tool.localOnly ? 'Local Subprocess Only' : 'GitHub Open Source'}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: gold.accent, opacity: 0.85 }}>
                        {tool.executionType === 'webgpu' ? (
                          <FlashOnIcon sx={{ fontSize: 16 }} />
                        ) : tool.localOnly ? (
                          <TerminalIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <GitHubIcon sx={{ fontSize: 16 }} />
                        )}
                      </Box>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>{tool.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tool.description}</Typography>
                </CardContent>
                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 1.5,
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${isDark ? 'rgba(212,175,55,0.18)' : theme.palette.divider}`,
                    position: 'relative',
                  }}
                >
                  {/* Tiny gold dot ornament centered on divider */}
                  <Box
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      top: -2.5,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: gold.accent,
                      boxShadow: `0 0 5px ${gold.accent}`,
                      zIndex: 2,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? gold.soft : gold.accent, fontWeight: 600 }}>{tool.repo}</Typography>
                  {tool.executionType === 'webgpu' ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/tools/${tool.id}`}
                      startIcon={<FlashOnIcon sx={{ fontSize: '0.95rem !important' }} />}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 750,
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isDark ? '#F5E6AB' : '#D4AF37',
                          boxShadow: '0 0 10px rgba(212,175,55,0.35)',
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
                        bgcolor: isDark ? 'rgba(148,163,184,0.12)' : '#F1F5F9',
                        color: theme.palette.text.secondary,
                        fontWeight: 750,
                        fontSize: '0.68rem',
                        border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}`,
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
                        fontSize: '0.75rem',
                        fontWeight: 750,
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isDark ? '#F5E6AB' : '#D4AF37',
                          boxShadow: '0 0 10px rgba(212,175,55,0.35)',
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
  );
}
