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
    { label: 'Sovereign Arsenal', to: '/arsenal' },
  ];

  const toolsAndRepos = [
    { label: 'Micro-Tools Registry (25)', to: '/tools' },
    { label: 'Zoth Studio v2 Repo', href: 'https://github.com/NullAITech/zoth-studio-v2', external: true },
    { label: 'NullAI Tech GitHub Org', href: 'https://github.com/NullAITech', external: true },
    { label: 'WebGen Autonomous Foundry', href: 'https://github.com/NullAITech/zoth-webgen', external: true },
    { label: 'Neuro-Memory Daemon Repo', href: 'https://github.com/NullAITech/neuro-memory-daemon', external: true },
    { label: 'Adytum Alchemist Repo', href: 'https://github.com/NullAITech/adytum-alchemist-ai-workflow', external: true },
    { label: 'HexStrike AI Terminal Repo', href: 'https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal', external: true },
    { label: 'Polyglot Exporter Repo', href: 'https://github.com/NullAITech/polyglot-framework-exporter', external: true },
    { label: '21-Agent Swarm Multiplexer', href: 'https://github.com/NullAITech/zoth-swarm-multiplexer', external: true },
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

  // Refined section heading — clearer hierarchy with depth shadow
  const sectionHeadingStyle = {
    fontFamily: mono,
    fontWeight: 800,
    color: headingColor,
    display: 'inline-block',
    mb: 2.8,
    letterSpacing: '0.12em',
    fontSize: '0.74rem',
    textTransform: 'uppercase',
    position: 'relative',
    pb: 0.7,
    '.MuiTypography-root': {
      background: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '28px',
      height: '2px',
      borderRadius: '1px',
      background: isDark
        ? 'linear-gradient(90deg, #D4AF37 0%, rgba(212,175,55,0.15) 100%)'
        : 'linear-gradient(90deg, #B8860B 0%, rgba(184,134,11,0.15) 100%)',
      boxShadow: isDark ? '0 0 8px rgba(212,175,55,0.25)' : '0 0 6px rgba(184,134,11,0.15)',
    },
  };

  // Elegant link hover — gold gradient underline with silk-smooth transition
  const navLinkStyle = {
    color: linkColor,
    fontSize: '0.84rem',
    textDecoration: 'none',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    py: 0.45,
    px: 0.9,
    mx: -0.9,
    borderRadius: '6px',
    transition: 'color 0.25s cubic-bezier(0.16,1,0.3,1), background-color 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '4px',
      left: '10px',
      width: 0,
      height: '1.5px',
      borderRadius: '1px',
      background: isDark
        ? 'linear-gradient(90deg, #D4AF37 0%, rgba(212,175,55,0.5) 100%)'
        : 'linear-gradient(90deg, #B8860B 0%, rgba(184,134,11,0.4) 100%)',
      transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
      boxShadow: isDark ? '0 0 6px rgba(212,175,55,0.3)' : 'none',
    },
    '&:hover': {
      color: gold,
      bgcolor: isDark ? 'rgba(212,175,55,0.07)' : 'rgba(184,134,11,0.07)',
      transform: 'translateX(4px)',
      '&::after': {
        width: 'calc(100% - 20px)',
      },
      '& .nav-external-icon': {
        opacity: 1,
        color: goldLight,
        transform: 'translate(3px, -2px) scale(1.1)',
      },
    },
    '&:active': {
      transform: 'translateX(2px) scale(0.98)',
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: `1px solid ${borderCol}`,
        bgcolor: isDark ? '#06070B' : '#F8FAFC',
        color: theme.palette.text.secondary,
        pt: { xs: 7, md: 9 },
        pb: 5,
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 72%), radial-gradient(ellipse 50% 45% at 100% 100%, rgba(212,175,55,0.035) 0%, transparent 62%)'
          : 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(184,134,11,0.045) 0%, transparent 72%), radial-gradient(ellipse 40% 35% at 100% 100%, rgba(184,134,11,0.025) 0%, transparent 65%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: { xs: '4%', md: '12%' },
          right: { xs: '4%', md: '12%' },
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.55), rgba(212,175,55,0.35), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.45), rgba(184,134,11,0.25), transparent)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 4.5, sm: 4.5, md: 4.5, lg: 5 }}>

          {/* Column 1: Brand & Manifest — elevated with logo halo */}
          <Grid xs={12} lg={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                {/* Logo with premium halo ring */}
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isDark
                      ? '1px solid rgba(212,175,55,0.3)'
                      : '1px solid rgba(184,134,11,0.25)',
                    bgcolor: isDark
                      ? 'rgba(212,175,55,0.065)'
                      : 'rgba(184,134,11,0.065)',
                    boxShadow: isDark
                      ? '0 0 20px rgba(212,175,55,0.1), inset 0 0 12px rgba(212,175,55,0.04)'
                      : '0 2px 12px rgba(184,134,11,0.08), inset 0 0 8px rgba(184,134,11,0.03)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: isDark
                        ? '0 0 28px rgba(212,175,55,0.18), inset 0 0 16px rgba(212,175,55,0.06)'
                        : '0 4px 16px rgba(184,134,11,0.14), inset 0 0 12px rgba(184,134,11,0.05)',
                      borderColor: isDark ? 'rgba(212,175,55,0.5)' : 'rgba(184,134,11,0.45)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={isDark ? '/brand/ghostbyte-dark.png' : '/brand/ghostbyte.png'}
                    alt="Ghostbyte NullAI Logo"
                    sx={{ height: 36, width: 'auto', display: 'block', filter: isDark ? 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' : 'drop-shadow(0 0 4px rgba(184,134,11,0.2))' }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Celtic Garamond", Georgia, serif',
                      fontWeight: 800,
                      color: isDark ? goldLight : '#101828',
                      lineHeight: 1.12,
                      fontSize: '1.32rem',
                      letterSpacing: '0.018em',
                      transition: 'color 0.2s ease',
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
                      fontSize: '0.68rem',
                      letterSpacing: '0.14em',
                      display: 'block',
                      mt: 0.35,
                    }}
                  >
                    SOVEREIGN COMPILATION STRATUM
                  </Typography>
                </Box>
              </Box>

              {/* Manifest description — refined border, better rhythm */}
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#94A3B8' : '#475569',
                  mb: 3.5,
                  lineHeight: 1.72,
                  fontSize: '0.86rem',
                  maxWidth: 400,
                  borderLeft: `2px solid ${isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.4)'}`,
                  pl: 2,
                  py: 0.3,
                  fontWeight: 400,
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
                    transition: 'color 0.22s ease',
                    '&:hover': {
                      color: isDark ? goldLight : '#8A6A09',
                      '&::after': { width: '100%' },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      width: 0,
                      height: '1px',
                      bgcolor: gold,
                      transition: 'width 0.25s cubic-bezier(0.16,1,0.3,1)',
                    },
                  }}
                >
                  NullAI Tech
                </Link>
                . Air-gapped neural memory, Byzantine multi-agent consensus, and local WebGPU / WASM execution with zero external cloud egress.
              </Typography>

              {/* Status Badges — elevated, animated pulse */}
              <Stack direction="row" spacing={1.75} flexWrap="wrap" useFlexGap sx={{ mb: 3.5 }}>
                <Chip
                  icon={
                    <TerminalIcon
                      sx={{
                        fontSize: '0.88rem !important',
                        color: `${isDark ? '#34D399' : '#059669'} !important`,
                        ml: 1,
                      }}
                    />
                  }
                  label="SOVEREIGN RUNTIME SPEC"
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(52,211,153,0.09)' : 'rgba(5,150,105,0.08)',
                    color: isDark ? '#34D399' : '#059669',
                    border: `1px solid ${isDark ? 'rgba(52,211,153,0.32)' : 'rgba(5,150,105,0.35)'}`,
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                />
                <Chip
                  icon={
                    <ShieldIcon
                      sx={{
                        fontSize: '0.88rem !important',
                        color: `${gold} !important`,
                        ml: 1,
                        filter: isDark ? 'drop-shadow(0 0 5px rgba(212,175,55,0.5))' : 'none',
                        transition: 'filter 0.2s ease',
                        '&:hover': {
                          filter: isDark ? 'drop-shadow(0 0 8px rgba(212,175,55,0.7))' : 'drop-shadow(0 0 4px rgba(184,134,11,0.4))',
                        },
                      }}
                    />
                  }
                  label="ZERO CLOUD EGRESS"
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(212,175,55,0.085)' : 'rgba(184,134,11,0.085)',
                    color: gold,
                    border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.35)'}`,
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    boxShadow: isDark
                      ? '0 0 14px -2px rgba(212,175,55,0.18), inset 0 0 8px rgba(212,175,55,0.03)'
                      : '0 1px 4px rgba(184,134,11,0.08), inset 0 0 6px rgba(184,134,11,0.02)',
                    transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                    '&:hover': {
                      borderColor: gold,
                      bgcolor: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,134,11,0.15)',
                      boxShadow: isDark ? '0 0 20px rgba(212,175,55,0.3)' : '0 2px 10px rgba(184,134,11,0.22)',
                      transform: 'translateY(-1px) scale(1.02)',
                    },
                  }}
                />
              </Stack>

              {/* External Links — refined icon buttons */}
              <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                <Tooltip title="NullAI Tech Sovereign Portal">
                  <IconButton
                    component="a"
                    href="https://nullai.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: isDark ? 'rgba(16,18,26,0.82)' : '#EDE8D5',
                      color: gold,
                      border: `1px solid ${isDark ? 'rgba(212,175,55,0.22)' : borderCol}`,
                      borderRadius: 2,
                      transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(24,27,38,0.97)' : '#E2DABF',
                        borderColor: gold,
                        transform: 'translateY(-2px)',
                        boxShadow: isDark
                          ? '0 6px 20px rgba(212,175,55,0.22), 0 0 0 1px rgba(212,175,55,0.15)'
                          : '0 5px 14px rgba(184,134,11,0.2), 0 0 0 1px rgba(184,134,11,0.12)',
                      },
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
                      bgcolor: isDark ? 'rgba(16,18,26,0.82)' : '#EDE8D5',
                      color: isDark ? '#FFF' : '#08080B',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : borderCol}`,
                      borderRadius: 2,
                      transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(24,27,38,0.97)' : '#E2DABF',
                        borderColor: gold,
                        transform: 'translateY(-2px)',
                        color: gold,
                        boxShadow: isDark
                          ? '0 6px 20px rgba(212,175,55,0.22), 0 0 0 1px rgba(212,175,55,0.15)'
                          : '0 5px 14px rgba(184,134,11,0.2), 0 0 0 1px rgba(184,134,11,0.12)',
                      },
                    }}
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Typography variant="caption" sx={{ fontFamily: mono, color: subtextColor, fontSize: '0.72rem', letterSpacing: '0.03em', fontWeight: 600 }}>
                  org: <strong style={{ color: gold, fontWeight: 800 }}>NullAITech</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Sovereign Workstations */}
          <Grid xs={6} sm={3} lg={2}>
            <Typography variant="caption" sx={sectionHeadingStyle}>
              Workstations
            </Typography>
            <Stack spacing={1.3}>
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
              NullAI Tech Repos
            </Typography>
            <Stack spacing={1.3}>
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
                    <OpenInNewIcon className="nav-external-icon" sx={{ fontSize: '0.72rem', opacity: 0.5, ml: 0.6, transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.25s cubic-bezier(0.16,1,0.3,1), color 0.25s cubic-bezier(0.16,1,0.3,1)' }} />
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
              Theory &amp; Math
            </Typography>
            <Stack spacing={1.3}>
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
              Standards
            </Typography>
            <Stack spacing={1.3}>
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
                    <OpenInNewIcon className="nav-external-icon" sx={{ fontSize: '0.72rem', opacity: 0.5, ml: 0.6, transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.25s cubic-bezier(0.16,1,0.3,1), color 0.25s cubic-bezier(0.16,1,0.3,1)' }} />
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

        {/* Elegant Gradient Divider — richer gold bloom */}
        <Box
          sx={{
            my: { xs: 5, md: 6 },
            height: '1px',
            background: isDark
              ? 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.12) 12%, rgba(212,175,55,0.45) 50%, rgba(212,175,55,0.12) 88%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(184,134,11,0.12) 12%, rgba(184,134,11,0.38) 50%, rgba(184,134,11,0.12) 88%, transparent 100%)',
          }}
        />

        {/* Mascot Interactive Strip — refined sanctum framing */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3.5,
            bgcolor: isDark
              ? 'rgba(10,12,18,0.62)'
              : 'rgba(255,255,255,0.6)',
            border: isDark
              ? '1px solid rgba(212,175,55,0.18)'
              : '1px solid rgba(184,134,11,0.18)',
            boxShadow: isDark
              ? '0 10px 40px -6px rgba(0,0,0,0.45), inset 0 0 30px rgba(212,175,55,0.03), 0 0 0 1px rgba(212,175,55,0.06)'
              : '0 6px 24px -3px rgba(0,0,0,0.05), inset 0 0 20px rgba(184,134,11,0.025), 0 0 0 1px rgba(184,134,11,0.06)',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '12%',
              right: '12%',
              height: '1px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), rgba(212,175,55,0.25), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.4), rgba(184,134,11,0.2), transparent)',
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.15), transparent)',
              pointerEvents: 'none',
            },
          }}
        >
          <SovereignMascots />
        </Box>

        {/* Sub-Footer Copyright & Invariant — refined spacing */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 3,
            pt: 3,
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.065)' : 'rgba(0,0,0,0.065)'}`,
            fontSize: '0.76rem',
            color: subtextColor,
            fontFamily: mono,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <span>© 2026 NullAI Tech &amp; Zoth Studio.</span>
            <Box component="span" sx={{ opacity: 0.35, fontSize: '0.7rem' }}>•</Box>
            <span>Released under Sovereign Apache 2.0 / MIT.</span>
            <Box component="span" sx={{ opacity: 0.35, fontSize: '0.7rem' }}>•</Box>
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
                  textDecoration: 'underline',
                  '&::after': { width: '100%' },
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  width: 0,
                  height: '1px',
                  bgcolor: gold,
                  transition: 'width 0.22s ease',
                },
              }}
            >
              nullai.tech
            </Link>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.72rem',
                color: subtextColor,
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              <span>AIR-GAPPED ZERO-EGRESS HARDWARE</span>
            </Box>
            <Box component="span" sx={{ opacity: 0.35, fontSize: '0.7rem' }}>•</Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.45,
                borderRadius: '5px',
                bgcolor: isDark ? 'rgba(16,185,129,0.09)' : 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: isDark ? '#34D399' : '#059669',
                fontSize: '0.7rem',
                fontWeight: 750,
                letterSpacing: '0.05em',
                boxShadow: isDark ? '0 0 10px -2px rgba(16,185,129,0.18)' : '0 1px 4px rgba(16,185,129,0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#10B981',
                  bgcolor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.14)',
                  boxShadow: '0 0 16px rgba(16,185,129,0.25)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: '#10B981',
                  boxShadow: '0 0 8px #10B981',
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
