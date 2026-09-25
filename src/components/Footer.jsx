import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Chip, Divider, Stack, IconButton, Tooltip, Unstable_Grid2 as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import TerminalIcon from '@mui/icons-material/Terminal';
import StorageIcon from '@mui/icons-material/Storage';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SovereignMascots from './SovereignMascots';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldLight = isDark ? '#F3E5AB' : '#8A6A09';
  const borderCol = theme.palette.divider;
  const linkColor = isDark ? '#94A3B8' : '#334155';
  const headingColor = isDark ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDark ? '#64748B' : '#475569';

  const workstations = [
    { label: 'Autonomous WebGen', to: '/webgen' },
    { label: 'Netrunner Memory Hub', to: '/memory' },
    { label: 'Byzantine Consensus', to: '/consensus' },
    { label: 'Adytum Alchemist', to: '/adytum' },
    { label: 'HexStrike Red Team', to: '/hexstrike' },
    { label: 'Zoth OS Kernel', to: '/zoth-os' },
    { label: 'Swarm Coordinator', to: '/swarm' },
    { label: 'Workstations Matrix', to: '/workstations' },
    { label: 'Starter Templates', to: '/templates' },
  ];

  const toolsAndRepos = [
    { label: 'Micro-Tools Registry (29)', to: '/tools' },
    { label: 'Zoth Studio v2 Repo', href: 'https://github.com/NullAITech/zoth-studio-v2', external: true },
    { label: 'NullAI Tech GitHub Org', href: 'https://github.com/NullAITech', external: true },
    { label: 'WebGen Autonomous Foundry', href: 'https://github.com/NullAITech/zoth-webgen', external: true },
    { label: 'Neuro-Memory Daemon Repo', href: 'https://github.com/NullAITech/neuro-memory-daemon', external: true },
    { label: 'Adytum Alchemist Repo', href: 'https://github.com/NullAITech/adytum-alchemist-ai-workflow', external: true },
    { label: 'HexStrike AI Terminal Repo', href: 'https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal', external: true },
    { label: 'Polyglot Exporter Repo', href: 'https://github.com/NullAITech/polyglot-framework-exporter', external: true },
    { label: 'Byzantine Consensus Engine', href: 'https://github.com/NullAITech/byzantine-consensus-engine', external: true },
    { label: 'Sovereign Agent Bridge', href: 'https://github.com/NullAITech/sovereign-agent-bridge', external: true },
    { label: 'EnvGuard Secrets Vault', href: 'https://github.com/NullAITech/envguard-secrets-vault', external: true },
    { label: 'Vector Search Engine', href: 'https://github.com/NullAITech/vector-search-engine', external: true },
    { label: 'Zoth OS Daemon Repo', href: 'https://github.com/NullAITech/zoth-os', external: true },
    { label: 'Netlify Ghost Hub Repo', href: 'https://github.com/NullAITech/Netlify-Ghost-Hub', external: true },
    { label: 'Enclave Bridges', to: '/bridges' },
  ];

  const theoryAndDocs = [
    { label: 'Mathematical Foundations', to: '/docs/math' },
    { label: 'STDP Synaptic Plasticity', to: '/docs/math/stdp-plasticity' },
    { label: 'Byzantine Triangulation', to: '/docs/math/byzantine-triangulation' },
    { label: 'Tri-Tier Cryptographic Vault', to: '/docs/math/tri-tier-vault' },
    { label: 'Architecture & Whitepaper', to: '/docs' },
    { label: 'Frequently Asked Questions', to: '/faqs' },
  ];

  const machineStandards = [
    { label: 'Agent AX Specification', to: '/ax' },
    { label: 'LLMs Context (llms.txt)', href: '/llms.txt', external: true },
    { label: 'Full LLMs Corpus (llms-full.txt)', href: '/llms-full.txt', external: true },
    { label: 'Agent Crawlers Spec (ai.txt)', href: '/ai.txt', external: true },
    { label: 'Sitemap XML (sitemap.xml)', href: '/sitemap.xml', external: true },
    { label: 'Zero-Egress Security Invariant', to: '/docs' },
  ];

  const sectionHeadingStyle = {
    fontFamily: mono,
    fontWeight: 800,
    color: headingColor,
    display: 'inline-block',
    mb: 2.2,
    letterSpacing: '0.1em',
    fontSize: '0.76rem',
    textTransform: 'uppercase',
    position: 'relative',
    pb: 0.6,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '22px',
      height: '2px',
      borderRadius: '1px',
      background: isDark
        ? 'linear-gradient(90deg, #D4AF37 0%, rgba(212,175,55,0.2) 100%)'
        : 'linear-gradient(90deg, #B8860B 0%, rgba(184,134,11,0.2) 100%)',
    }
  };

  const navLinkStyle = {
    color: linkColor,
    fontSize: '0.84rem',
    textDecoration: 'none',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    py: 0.35,
    px: 0.8,
    mx: -0.8,
    borderRadius: '6px',
    transition: 'color 0.22s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '3px',
      left: '8px',
      width: 0,
      height: '1.5px',
      borderRadius: '1px',
      background: isDark
        ? 'linear-gradient(90deg, #D4AF37 0%, rgba(212,175,55,0.4) 100%)'
        : 'linear-gradient(90deg, #B8860B 0%, rgba(184,134,11,0.3) 100%)',
      transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    '&:hover': {
      color: gold,
      bgcolor: isDark ? 'rgba(212, 175, 55, 0.06)' : 'rgba(184, 134, 11, 0.06)',
      transform: 'translateX(3px)',
      '&::after': {
        width: 'calc(100% - 16px)',
      },
      '& .nav-external-icon': {
        opacity: 1,
        color: gold,
        transform: 'translate(2px, -2px)',
      }
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: `1px solid ${borderCol}`,
        bgcolor: isDark ? '#06070B' : '#F8FAFC',
        color: theme.palette.text.secondary,
        pt: { xs: 6, md: 8 },
        pb: 4,
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(212,175,55,0.03) 0%, transparent 60%)'
          : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184,134,11,0.04) 0%, transparent 70%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: { xs: '5%', md: '15%' },
          right: { xs: '5%', md: '15%' },
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.4), transparent)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 4, sm: 4, md: 4, lg: 4.5 }}>
          
          {/* Column 1: Brand & Zero-Egress Manifest */}
          <Grid xs={12} lg={4}>
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 2 }}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(184,134,11,0.2)',
                    bgcolor: isDark ? 'rgba(212,175,55,0.05)' : 'rgba(184,134,11,0.05)',
                    boxShadow: isDark ? '0 0 16px rgba(212,175,55,0.08)' : '0 2px 8px rgba(184,134,11,0.06)'
                  }}
                >
                  <Box
                    component="img"
                    src={isDark ? '/brand/ghostbyte-dark.png' : '/brand/ghostbyte.png'}
                    alt="Ghostbyte NullAI Logo"
                    sx={{ height: 32, width: 'auto', display: 'block' }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Celtic Garamond", Georgia, serif',
                      fontWeight: 800,
                      color: isDark ? goldLight : '#101828',
                      lineHeight: 1.15,
                      fontSize: '1.28rem',
                      letterSpacing: '0.015em'
                    }}
                  >
                    Zoth Studio v2
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: gold,
                      fontFamily: mono,
                      fontWeight: 750,
                      fontSize: '0.7rem',
                      letterSpacing: '0.12em',
                      display: 'block',
                      mt: 0.25
                    }}
                  >
                    SOVEREIGN COMPILATION STRATUM
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#94A3B8' : '#475569',
                  mb: 3,
                  lineHeight: 1.68,
                  fontSize: '0.86rem',
                  maxWidth: 380,
                  borderLeft: `2px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.35)'}`,
                  pl: 1.75,
                  py: 0.25
                }}
              >
                High-performance sovereign intelligence suite designed and maintained by{' '}
                <Link
                  href="https://nullai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: gold,
                    fontWeight: 700,
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      color: isDark ? goldLight : '#8A6A09',
                      textDecoration: 'none',
                      '&::after': { width: '100%' }
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: 0,
                      height: '1px',
                      bgcolor: gold,
                      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }
                  }}
                >
                  NullAI Tech
                </Link>
                . Air-gapped neural memory, Byzantine multi-agent consensus, and local WebGPU / WASM execution with zero external cloud egress.
              </Typography>

              {/* Status Badges */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                <Chip
                  icon={
                    <Box
                      sx={{
                        position: 'relative',
                        width: 8,
                        height: 8,
                        ml: 1,
                        mr: -0.2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#10B981',
                          opacity: 0.75,
                          animation: 'loopbackPulse 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
                          '@keyframes loopbackPulse': {
                            '0%': { transform: 'scale(1)', opacity: 0.8 },
                            '70%, 100%': { transform: 'scale(2.4)', opacity: 0 }
                          }
                        }}
                      />
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#10B981',
                          boxShadow: '0 0 6px #10B981'
                        }}
                      />
                    </Box>
                  }
                  label="127.0.0.1 LOCAL LOOPBACK"
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.09)',
                    color: isDark ? '#34D399' : '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.28)',
                    fontFamily: mono,
                    fontSize: '0.67rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: isDark ? '0 0 12px -2px rgba(16, 185, 129, 0.16)' : '0 1px 3px rgba(16, 185, 129, 0.1)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      borderColor: '#10B981',
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                      boxShadow: '0 0 14px rgba(16, 185, 129, 0.25)',
                    }
                  }}
                />
                <Chip
                  icon={
                    <ShieldIcon
                      sx={{
                        fontSize: '0.85rem !important',
                        color: `${gold} !important`,
                        ml: 0.8,
                        filter: isDark ? 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' : 'none',
                      }}
                    />
                  }
                  label="ZERO CLOUD EGRESS"
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(184, 134, 11, 0.08)',
                    color: gold,
                    border: isDark ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(184, 134, 11, 0.3)',
                    fontFamily: mono,
                    fontSize: '0.67rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: isDark ? '0 0 12px -2px rgba(212, 175, 55, 0.15)' : '0 1px 3px rgba(184, 134, 11, 0.08)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      borderColor: gold,
                      bgcolor: isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(184, 134, 11, 0.14)',
                      boxShadow: isDark ? '0 0 14px rgba(212, 175, 55, 0.25)' : '0 2px 8px rgba(184, 134, 11, 0.2)',
                    }
                  }}
                />
              </Stack>

              {/* External Links */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Tooltip title="NullAI Tech Sovereign Portal">
                  <IconButton
                    component="a"
                    href="https://nullai.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: isDark ? 'rgba(16, 18, 26, 0.75)' : '#EDE8D5',
                      color: gold,
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : borderCol}`,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      backdropFilter: 'blur(6px)',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(24, 27, 38, 0.95)' : '#E2DABF',
                        borderColor: gold,
                        transform: 'translateY(-2px)',
                        boxShadow: isDark ? '0 4px 14px rgba(212, 175, 55, 0.2)' : '0 3px 10px rgba(184, 134, 11, 0.18)',
                      }
                    }}
                  >
                    <LanguageIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="NullAI Tech GitHub Organization">
                  <IconButton
                    component="a"
                    href="https://github.com/NullAITech"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: isDark ? 'rgba(16, 18, 26, 0.75)' : '#EDE8D5',
                      color: isDark ? '#FFF' : '#08080B',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : borderCol}`,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      backdropFilter: 'blur(6px)',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(24, 27, 38, 0.95)' : '#E2DABF',
                        borderColor: gold,
                        transform: 'translateY(-2px)',
                        color: gold,
                        boxShadow: isDark ? '0 4px 14px rgba(212, 175, 55, 0.2)' : '0 3px 10px rgba(184, 134, 11, 0.18)',
                      }
                    }}
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Typography variant="caption" sx={{ fontFamily: mono, color: subtextColor, fontSize: '0.74rem', letterSpacing: '0.02em' }}>
                  org: <strong style={{ color: gold }}>NullAITech</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Sovereign Workstations */}
          <Grid xs={6} sm={3} lg={2}>
            <Typography variant="caption" sx={sectionHeadingStyle}>
              WORKSTATIONS
            </Typography>
            <Stack spacing={1.2}>
              {workstations.map((item, idx) => (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={item.to}
                  sx={navLinkStyle}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: NullAI Tech Repos & Tools */}
          <Grid xs={6} sm={3} lg={2.5}>
            <Typography variant="caption" sx={sectionHeadingStyle}>
              NULLAI TECH REPOS
            </Typography>
            <Stack spacing={1.2}>
              {toolsAndRepos.map((item, idx) => (
                item.external ? (
                  <Link
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={navLinkStyle}
                  >
                    {item.label}
                    <OpenInNewIcon className="nav-external-icon" sx={{ fontSize: '0.75rem', opacity: 0.55, ml: 0.5, transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.22s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </Link>
                ) : (
                  <Link
                    key={idx}
                    component={RouterLink}
                    to={item.to}
                    sx={navLinkStyle}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </Stack>
          </Grid>

          {/* Column 4: Theory & Math Pillars */}
          <Grid xs={6} sm={3} lg={2}>
            <Typography variant="caption" sx={sectionHeadingStyle}>
              THEORY &amp; MATH
            </Typography>
            <Stack spacing={1.2}>
              {theoryAndDocs.map((item, idx) => (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={item.to}
                  sx={navLinkStyle}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Column 5: Machine Interfaces & Standards */}
          <Grid xs={6} sm={3} lg={1.5}>
            <Typography variant="caption" sx={sectionHeadingStyle}>
              STANDARDS
            </Typography>
            <Stack spacing={1.2}>
              {machineStandards.map((item, idx) => (
                item.external ? (
                  <Link
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={navLinkStyle}
                  >
                    {item.label}
                    <OpenInNewIcon className="nav-external-icon" sx={{ fontSize: '0.75rem', opacity: 0.55, ml: 0.5, transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.22s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </Link>
                ) : (
                  <Link
                    key={idx}
                    component={RouterLink}
                    to={item.to}
                    sx={navLinkStyle}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </Stack>
          </Grid>

        </Grid>

        {/* Elegant Gradient Divider */}
        <Box
          sx={{
            my: { xs: 4, md: 5 },
            height: '1px',
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 15%, rgba(212,175,55,0.4) 50%, rgba(212,175,55,0.15) 85%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.15) 15%, rgba(184,134,11,0.35) 50%, rgba(184,134,11,0.15) 85%, transparent 100%)',
          }}
        />

        {/* Mascot Interactive Strip with Sanctum Framing */}
        <Box
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            borderRadius: 2.5,
            bgcolor: isDark ? 'rgba(10, 12, 18, 0.55)' : 'rgba(255, 255, 255, 0.55)',
            border: isDark ? '1px solid rgba(212, 175, 55, 0.16)' : '1px solid rgba(184, 134, 11, 0.16)',
            boxShadow: isDark
              ? '0 8px 32px -4px rgba(0, 0, 0, 0.4), inset 0 0 24px rgba(212, 175, 55, 0.03)'
              : '0 4px 20px -2px rgba(0, 0, 0, 0.04), inset 0 0 16px rgba(184, 134, 11, 0.02)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '15%',
              right: '15%',
              height: '1px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.35), transparent)',
              pointerEvents: 'none',
            },
            '& > div': {
              mt: 0,
              pt: 0,
              borderTop: 'none',
            }
          }}
        >
          <SovereignMascots />
        </Box>

        {/* Sub-Footer Copyright & Invariant */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2.5,
            pt: 2.5,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            fontSize: '0.78rem',
            color: subtextColor,
            fontFamily: mono
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <span>© 2026 NullAI Tech &amp; Zoth Studio.</span>
            <Box component="span" sx={{ opacity: 0.4 }}>•</Box>
            <span>Released under Sovereign Apache 2.0 / MIT.</span>
            <Box component="span" sx={{ opacity: 0.4 }}>•</Box>
            <Link
              href="https://nullai.tech"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: gold,
                textDecoration: 'none',
                fontWeight: 700,
                position: 'relative',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: isDark ? goldLight : '#8A6A09',
                  textDecoration: 'underline'
                }
              }}
            >
              nullai.tech
            </Link>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                fontSize: '0.73rem',
                color: subtextColor,
                letterSpacing: '0.04em'
              }}
            >
              <span>AIR-GAPPED ZERO-EGRESS HARDWARE</span>
            </Box>
            <Box component="span" sx={{ opacity: 0.4 }}>•</Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1,
                py: 0.35,
                borderRadius: '4px',
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.07)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: isDark ? '#34D399' : '#059669',
                fontSize: '0.72rem',
                fontWeight: 750,
                letterSpacing: '0.04em'
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: '#10B981',
                  boxShadow: '0 0 6px #10B981'
                }}
              />
              <span>SYSTEM PURITY: 100%</span>
            </Box>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
