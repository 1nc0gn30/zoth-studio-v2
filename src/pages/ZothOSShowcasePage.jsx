import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import MotionIntro from '../components/MotionIntro';
import {
  HeroReveal,
  HeroItem,
  GlowLine,
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
} from '../components/MotionReveal';
import SovereignFunnel from '../components/SovereignFunnel';

// Icons
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import UsbIcon from '@mui/icons-material/Usb';
import SecurityIcon from '@mui/icons-material/Security';
import TerminalIcon from '@mui/icons-material/Terminal';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import MemoryIcon from '@mui/icons-material/Memory';
import PaletteIcon from '@mui/icons-material/Palette';
import HealingIcon from '@mui/icons-material/Healing';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function ZothOSShowcasePage() {
  const [introDone, setIntroDone] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldSoft = isDark ? '#F5E6AB' : '#8A6A09';
  const goldWash = isDark ? 'rgba(212, 175, 55, 0.12)' : '#FEF9E7';
  const goldBorder = isDark ? 'rgba(212, 175, 55, 0.35)' : '#E2CE82';
  const textPrimary = isDark ? '#F1F5F9' : '#101828';
  const textSecondary = isDark ? '#94A3B8' : '#475467';
  const cardBg = isDark ? '#11131F' : '#FFFFFF';

  const copyToClipboard = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setToastMessage(`Copied ${label} to clipboard!`);
    }
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: 'Dual Parity Cyber Arsenal (175+ Tools)',
      desc: 'Complete Kali Linux and Parrot Security parity out of the box. Pre-configured Burp Suite, Caido, Nmap, Metasploit, Recon-ng, Wireshark, and NullAI HexStrike Terminal with zero setup friction.',
      badge: 'OFFENSIVE SEC',
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 32 }} />,
      title: 'Frontier AI Agent Core Pre-Installed',
      desc: 'The only operating system shipping with autonomous coding agents pre-configured: Claude Code, Cline, Aider, Hermes Swarm Agent, OpenCode, and Ollama local GGUF models. Zero subscription lock-in.',
      badge: 'FRONTIER AI',
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />,
      title: 'Integrated Zoth Studio v2 Cockpit',
      desc: 'Native desktop deployment of Zoth Studio with 26 micro-tools, 24 workstations, 21 autonomous swarm agents, biomorphic STDP memory, and local WebMCP execution engine at /opt/zoth-studio.',
      badge: 'STUDIO COCKPIT',
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 32 }} />,
      title: 'Ghostmode Tor & Sovereign Vault',
      desc: 'One-command system-wide Tor anonymization, amnesic memory execution profiles, and Argon2id + AES-256 hardware vault (zoth-vault) for zero-leak cryptographic credentials.',
      badge: 'PRIVACY & VAULT',
    },
    {
      icon: <HealingIcon sx={{ fontSize: 32 }} />,
      title: 'Self-Healing Resilience Daemon (zoth-heal)',
      desc: 'Continuous autonomous diagnostics and self-repair across audio, display, network, packages, and disk storage. If an anomaly occurs, zoth-heal detects and restores nominal state instantly.',
      badge: 'RESILIENCE',
    },
    {
      icon: <PaletteIcon sx={{ fontSize: 32 }} />,
      title: 'KDE Plasma 6 Cyber-Gold Custom UX',
      desc: 'Bespoke Hermetic icon sets, obsidian matte finish with cyber gold glow accents, live real-time telemetry HUD (zoth-os Sovereign Desk), and ambient focus classical audio suite.',
      badge: 'ALCHEMICAL DESKTOP',
    },
  ];

  const comparisonRows = [
    {
      feature: 'Offensive Security & Pentesting',
      zoth: '175+ Curated Tools (Kali + Parrot Parity)',
      kali: '150+ Tools',
      parrot: '150+ Tools',
      ubuntu: 'None (Manual install)',
    },
    {
      feature: 'Pre-Installed Frontier AI Coding Agents',
      zoth: 'Claude Code, Cline, Aider, Hermes, OpenCode, agy',
      kali: 'None',
      parrot: 'None',
      ubuntu: 'None',
    },
    {
      feature: 'Integrated AI Development Studio',
      zoth: 'Zoth Studio v2 (26 micro-tools + 24 workstations)',
      kali: 'None',
      parrot: 'None',
      ubuntu: 'None',
    },
    {
      feature: 'Local LLM Inference Engine',
      zoth: 'Ollama + Silicon Models Pre-Wired',
      kali: 'Manual setup',
      parrot: 'Manual setup',
      ubuntu: 'Manual setup',
    },
    {
      feature: 'Self-Healing Diagnostic System',
      zoth: 'zoth-heal Automated Resilience Daemon',
      kali: 'None',
      parrot: 'None',
      ubuntu: 'None',
    },
    {
      feature: 'Sovereign Zero-Leak Hardware Vault',
      zoth: 'Argon2id Rust Daemon + Bitwarden + Pass',
      kali: 'Standard Keyring',
      parrot: 'Standard Keyring',
      ubuntu: 'Standard Keyring',
    },
    {
      feature: 'Tor Anonymization & Ghostmode',
      zoth: 'One-Click Tor Route & Amnesic Mode (zoth ghost)',
      kali: 'Manual configuration',
      parrot: 'AnonSurf module',
      ubuntu: 'None',
    },
  ];

  const builtFor = [
    {
      role: 'Autonomous AI Engineers',
      desc: 'Develop, benchmark, and orchestrate local multi-agent swarms with zero cloud latency and zero subscription overhead.',
    },
    {
      role: 'Offensive Security & Red Teamers',
      desc: 'Full penetration testing suite with an AI-augmented terminal (HexStrike) that correlates vulnerabilities and automates reconnaissance.',
    },
    {
      role: 'Privacy-First Developers & Researchers',
      desc: 'Air-gapped operation, hardware zero-egress invariants, and amnesic runtime profiles to ensure proprietary IP never leaves your machine.',
    },
    {
      role: 'Operators Seeking Turnkey Sovereignty',
      desc: 'Eliminate weeks of configuration. Flash ZothOS to bare metal or run inside KVM/QEMU with every runtime ready on first boot.',
    },
  ];

  return (
    <>
      {!introDone && (
        <MotionIntro page="zoth-os" onComplete={() => setIntroDone(true)} />
      )}

      <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 7 } }}>
        {/* Hero Section */}
        <HeroReveal>
          <HeroItem>
            <GlowLine color={gold} glowColor="rgba(212, 175, 55, 0.4)" />
          </HeroItem>
          <HeroItem>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label="ZOTH OS 1.0 RELEASE"
                size="small"
                sx={{
                  bgcolor: goldWash,
                  color: goldSoft,
                  border: `1px solid ${goldBorder}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
              <Chip
                label="KALI + PARROT DUAL PARITY"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(52, 211, 153, 0.12)' : '#ECFDF3',
                  color: isDark ? '#34D399' : '#027A48',
                  border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.35)' : '#ABE5C6'}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
              <Chip
                label="FRONTIER AI INTEGRATED"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(96, 165, 250, 0.12)' : '#EFF6FF',
                  color: isDark ? '#60A5FA' : '#1D4ED8',
                  border: `1px solid ${isDark ? 'rgba(96, 165, 250, 0.35)' : '#BFDBFE'}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
          </HeroItem>
          <HeroItem>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.6rem', md: '4.8rem' },
                fontWeight: 900,
                color: textPrimary,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                mb: 2,
              }}
            >
              The Sovereign AI &amp;{' '}
              <Box component="span" className="text-gradient-gold">
                Offensive Security OS
              </Box>
            </Typography>
          </HeroItem>
          <HeroItem>
            <Typography
              sx={{
                color: textSecondary,
                fontSize: { xs: '1.05rem', md: '1.25rem' },
                lineHeight: 1.7,
                maxWidth: 820,
                mb: 4,
              }}
            >
              A bootable Linux operating system engineered by NullAI Tech. Combines the full offensive security arsenal of Kali and Parrot with pre-configured frontier AI coding agents, the complete Zoth Studio v2 development suite, and zero-egress hardware isolation.
            </Typography>
          </HeroItem>
          <HeroItem>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 5 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/zoth-os/docs"
                startIcon={<TerminalIcon />}
                sx={{
                  px: 3.5,
                  py: 1.3,
                  fontWeight: 800,
                  fontFamily: mono,
                  boxShadow: `0 4px 20px ${isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.3)'}`,
                }}
              >
                Launch Live Codex &amp; Dials →
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={RouterLink}
                to="/arsenal"
                startIcon={<RocketLaunchIcon />}
                sx={{
                  px: 3.2,
                  py: 1.3,
                  fontWeight: 800,
                  fontFamily: mono,
                  borderColor: goldBorder,
                }}
              >
                Explore Studio Arsenal
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://github.com/NullAITech/zoth-os"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
                sx={{
                  px: 3,
                  py: 1.3,
                  fontWeight: 750,
                  fontFamily: mono,
                  color: textPrimary,
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                  '&:hover': {
                    borderColor: gold,
                    bgcolor: goldWash,
                  },
                }}
              >
                Source Repo
              </Button>
            </Box>
          </HeroItem>
        </HeroReveal>

        {/* Quick Clone & Deployment Terminal Strip */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 8,
            borderRadius: 3,
            bgcolor: isDark ? '#08080B' : '#F8F9FA',
            border: `1px solid ${goldBorder}`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TerminalIcon sx={{ color: gold }} />
            <Typography sx={{ fontFamily: mono, fontSize: '0.85rem', color: goldSoft, fontWeight: 700, overflowWrap: 'anywhere' }}>
              $ git clone https://github.com/NullAITech/zoth-os.git &amp;&amp; cd zoth-os
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => copyToClipboard('git clone https://github.com/NullAITech/zoth-os.git && cd zoth-os', 'Git clone command')}
            startIcon={<ContentCopyIcon />}
            sx={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.76rem',
              color: gold,
              borderColor: goldBorder,
              whiteSpace: 'nowrap',
            }}
          >
            Copy Quickstart
          </Button>
        </Paper>

        {/* 6 Key Pillars Grid */}
        <Box sx={{ mb: 10 }}>
          <Typography
            sx={{
              fontFamily: mono,
              color: gold,
              letterSpacing: '0.12em',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            Sovereign OS Architecture
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: textPrimary, mb: 4, letterSpacing: '-0.02em' }}>
            What <span className="text-gradient-gold">Zoth OS Delivers</span> Out of the Box
          </Typography>

          <StaggerChildren>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {features.map((f, i) => (
                <StaggerItem key={i}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3.5,
                      height: '100%',
                      width: '100%',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3.5,
                      bgcolor: cardBg,
                      border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(0, 0, 0, 0.08)'}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: gold,
                        boxShadow: `0 12px 32px -10px ${isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(184, 134, 11, 0.2)'}`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: gold }}>{f.icon}</Box>
                      <Chip
                        label={f.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.64rem',
                          fontFamily: mono,
                          fontWeight: 800,
                          bgcolor: goldWash,
                          color: goldSoft,
                          border: `1px solid ${goldBorder}`,
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontFamily: mono, fontWeight: 800, color: textPrimary, fontSize: '1.05rem', mb: 1.2 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.7, flex: 1 }}>
                      {f.desc}
                    </Typography>
                  </Paper>
                </StaggerItem>
              ))}
            </Box>
          </StaggerChildren>
        </Box>

        {/* Feature Comparison Matrix */}
        <Box sx={{ mb: 10 }}>
          <Typography
            sx={{
              fontFamily: mono,
              color: gold,
              letterSpacing: '0.12em',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            Ecosystem Comparison
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: textPrimary, mb: 4, letterSpacing: '-0.02em' }}>
            Why Choose <span className="text-gradient-gold">Zoth OS</span> Over Standard Distros
          </Typography>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${goldBorder}`,
              bgcolor: cardBg,
              overflowX: 'auto',
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: isDark ? 'rgba(212, 175, 55, 0.08)' : '#FEF9E7' }}>
                <TableRow>
                  <TableCell sx={{ fontFamily: mono, fontWeight: 800, color: textPrimary, fontSize: '0.85rem' }}>Capability</TableCell>
                  <TableCell sx={{ fontFamily: mono, fontWeight: 900, color: gold, fontSize: '0.85rem' }}>Zoth OS 1.0</TableCell>
                  <TableCell sx={{ fontFamily: mono, fontWeight: 700, color: textSecondary, fontSize: '0.85rem' }}>Kali Linux</TableCell>
                  <TableCell sx={{ fontFamily: mono, fontWeight: 700, color: textSecondary, fontSize: '0.85rem' }}>Parrot OS</TableCell>
                  <TableCell sx={{ fontFamily: mono, fontWeight: 700, color: textSecondary, fontSize: '0.85rem' }}>Ubuntu</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonRows.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:nth-of-type(even)': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.015)' },
                      '&:hover': { bgcolor: isDark ? 'rgba(212, 175, 55, 0.05)' : '#FEF9E7' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 750, color: textPrimary, fontSize: '0.88rem' }}>{row.feature}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: gold, fontFamily: mono, fontSize: '0.82rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: gold }} />
                        {row.zoth}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, fontSize: '0.82rem', fontFamily: mono }}>{row.kali}</TableCell>
                    <TableCell sx={{ color: textSecondary, fontSize: '0.82rem', fontFamily: mono }}>{row.parrot}</TableCell>
                    <TableCell sx={{ color: textSecondary, fontSize: '0.82rem', fontFamily: mono }}>{row.ubuntu}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Built For Personas */}
        <Box sx={{ mb: 10 }}>
          <Typography
            sx={{
              fontFamily: mono,
              color: gold,
              letterSpacing: '0.12em',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            Target Workloads
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: textPrimary, mb: 4, letterSpacing: '-0.02em' }}>
            Engineered Specifically For
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {builtFor.map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: cardBg,
                  borderLeft: `4px solid ${gold}`,
                  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <Typography sx={{ fontFamily: mono, fontWeight: 800, color: goldSoft, fontSize: '1rem', mb: 1 }}>
                  {item.role}
                </Typography>
                <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.7 }}>
                  {item.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Sovereign Funnel Integration */}
        <Box sx={{ mt: 10 }}>
          <SovereignFunnel
            title="Deploy Zoth OS & Studio Ecosystem"
            subtitle="Choose between running Zoth OS on bare metal / KVM, launching the unified Zoth Studio cockpit, or pulling standalone autonomous micro-engines."
            toolTitle="Zoth OS Sovereign Operating System"
            toolTag="OPERATING SYSTEM"
            toolDescription="Dual Kali + Parrot parity Linux distro pre-loaded with local AI agents, cyber tools, and Zoth Studio v2."
            toolRepo="https://github.com/NullAITech/zoth-os"
            toolCommand="git clone https://github.com/NullAITech/zoth-os.git && cd zoth-os"
            studioRepo="https://github.com/NullAITech/zoth-studio-v2"
            osRepo="https://github.com/NullAITech/zoth-os"
          />
        </Box>
      </Container>

      {/* Snackbar Notifications */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setToastMessage(null)} sx={{ fontFamily: mono, fontWeight: 700 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
