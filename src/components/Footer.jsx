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
  const gold = '#D4AF37';
  const goldLight = '#F3E5AB';
  const borderCol = theme.palette.divider;

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
    { label: 'Micro-Tools Registry (28)', to: '/tools' },
    { label: 'Zoth Studio v2 Repo', href: 'https://github.com/NullAITech/zoth-studio-v2', external: true },
    { label: 'NullAI Tech GitHub Org', href: 'https://github.com/NullAITech', external: true },
    { label: 'Memory Daemon Repo', href: 'https://github.com/NullAITech/zoth-memory-daemon', external: true },
    { label: 'Adytum Alchemist Repo', href: 'https://github.com/NullAITech/zoth-adytum', external: true },
    { label: 'HexStrike Security Repo', href: 'https://github.com/NullAITech/zoth-hexstrike', external: true },
    { label: 'WebGen Foundry Repo', href: 'https://github.com/NullAITech/zoth-webgen', external: true },
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

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: `1px solid ${borderCol}`,
        bgcolor: isDark ? '#06070B' : '#F8FAFC',
        color: theme.palette.text.secondary,
        pt: { xs: 5, md: 7 },
        pb: 4,
        position: 'relative',
        zIndex: 2,
        backgroundImage: isDark
          ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)'
          : 'none'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 4, md: 5 }}>
          
          {/* Column 1: Brand & Zero-Egress Manifest */}
          <Grid xs={12} lg={4}>
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box
                  component="img"
                  src={isDark ? '/brand/ghostbyte-dark.png' : '/brand/ghostbyte.png'}
                  alt="Ghostbyte NullAI Logo"
                  sx={{ height: 32, width: 'auto', borderRadius: 1 }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Celtic Garamond", Georgia, serif',
                      fontWeight: 800,
                      color: isDark ? goldLight : '#101828',
                      lineHeight: 1.1,
                      fontSize: '1.25rem'
                    }}
                  >
                    Zoth Studio v2
                  </Typography>
                  <Typography variant="caption" sx={{ color: gold, fontFamily: mono, fontWeight: 700, fontSize: '0.72rem' }}>
                    SOVEREIGN COMPILATION STRATUM
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2.5, lineHeight: 1.6, maxWidth: 360 }}>
                High-performance sovereign intelligence suite designed and maintained by{' '}
                <Link
                  href="https://nullai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: gold, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  NullAI Tech
                </Link>
                . Air-gapped neural memory, Byzantine multi-agent consensus, and local WebGPU / WASM execution with zero external cloud egress.
              </Typography>

              {/* Status Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                <Chip
                  icon={<Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981', ml: 0.8 }} />}
                  label="127.0.0.1 LOCAL LOOPBACK"
                  size="small"
                  sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', fontFamily: mono, fontSize: '0.66rem', fontWeight: 800 }}
                />
                <Chip
                  icon={<ShieldIcon sx={{ fontSize: '0.85rem !important', color: `${gold} !important` }} />}
                  label="ZERO CLOUD EGRESS"
                  size="small"
                  sx={{ bgcolor: 'rgba(212,175,55,0.1)', color: gold, border: `1px solid rgba(212,175,55,0.3)`, fontFamily: mono, fontSize: '0.66rem', fontWeight: 800 }}
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
                      bgcolor: isDark ? '#10121A' : '#EDE8D5',
                      color: gold,
                      border: `1px solid ${borderCol}`,
                      '&:hover': { bgcolor: isDark ? '#181B26' : '#E2DABF', borderColor: gold }
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
                      bgcolor: isDark ? '#10121A' : '#EDE8D5',
                      color: isDark ? '#FFF' : '#08080B',
                      border: `1px solid ${borderCol}`,
                      '&:hover': { bgcolor: isDark ? '#181B26' : '#E2DABF', borderColor: gold }
                    }}
                  >
                    <GitHubIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.74rem' }}>
                  org: <strong style={{ color: gold }}>NullAITech</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Sovereign Workstations */}
          <Grid xs={6} sm={3} lg={2}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#FFF' : '#08080B', display: 'block', mb: 2, letterSpacing: '0.08em' }}>
              WORKSTATIONS
            </Typography>
            <Stack spacing={1.2}>
              {workstations.map((item, idx) => (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={item.to}
                  sx={{
                    color: '#94A3B8',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: gold }
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: NullAI Tech Repos & Tools */}
          <Grid xs={6} sm={3} lg={2.5}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#FFF' : '#08080B', display: 'block', mb: 2, letterSpacing: '0.08em' }}>
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
                    sx={{
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      transition: 'color 0.15s ease',
                      '&:hover': { color: gold }
                    }}
                  >
                    {item.label}
                    <OpenInNewIcon sx={{ fontSize: '0.75rem', opacity: 0.7 }} />
                  </Link>
                ) : (
                  <Link
                    key={idx}
                    component={RouterLink}
                    to={item.to}
                    sx={{
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                      '&:hover': { color: gold }
                    }}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </Stack>
          </Grid>

          {/* Column 4: Theory & Math Pillars */}
          <Grid xs={6} sm={3} lg={2}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#FFF' : '#08080B', display: 'block', mb: 2, letterSpacing: '0.08em' }}>
              THEORY &amp; MATH
            </Typography>
            <Stack spacing={1.2}>
              {theoryAndDocs.map((item, idx) => (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={item.to}
                  sx={{
                    color: '#94A3B8',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: gold }
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Column 5: Machine Interfaces & Standards */}
          <Grid xs={6} sm={3} lg={1.5}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#FFF' : '#08080B', display: 'block', mb: 2, letterSpacing: '0.08em' }}>
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
                    sx={{
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      transition: 'color 0.15s ease',
                      '&:hover': { color: gold }
                    }}
                  >
                    {item.label}
                    <OpenInNewIcon sx={{ fontSize: '0.75rem', opacity: 0.7 }} />
                  </Link>
                ) : (
                  <Link
                    key={idx}
                    component={RouterLink}
                    to={item.to}
                    sx={{
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                      '&:hover': { color: gold }
                    }}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </Stack>
          </Grid>

        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Mascot Interactive Strip */}
        <Box sx={{ mb: 3 }}>
          <SovereignMascots />
        </Box>

        {/* Sub-Footer Copyright & Invariant */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            pt: 2,
            fontSize: '0.78rem',
            color: '#64748B',
            fontFamily: mono
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <span>© 2026 NullAI Tech &amp; Zoth Studio.</span>
            <span>•</span>
            <span>Released under Sovereign Apache 2.0 / MIT.</span>
            <span>•</span>
            <Link
              href="https://nullai.tech"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: gold, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              nullai.tech
            </Link>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>AIR-GAPPED ZERO-EGRESS HARDWARE</span>
            <span>•</span>
            <span style={{ color: '#10B981' }}>SYSTEM PURITY: 100%</span>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
