import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Stack, IconButton, Unstable_Grid2 as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';
  const footerBg = isDark ? '#06070B' : '#F3EFE6';

  const systems = [
    { label: 'The Sovereign Arsenal (77)', to: '/arsenal' },
    { label: 'ZothOS v3.4.0 & Lite v1.2', to: '/zoth-os' },
    { label: 'Pantheon Swarm (:9393)', to: '/swarm' },
    { label: 'Neuro-Memory (:8094)', to: '/memory' },
    { label: 'Zoth Bolt WebGen (:5173)', to: '/webgen' },
    { label: 'HexStrike Security (:8888)', to: '/hexstrike' },
    { label: 'Adytum Chamber', to: '/adytum' },
    { label: 'Architecture Dossiers (43)', to: '/workstations' },
  ];

  const repositories = [
    { label: 'Zoth Studio v2 Repo', href: 'https://github.com/NullAITech/zoth-studio-v2', external: true },
    { label: 'ZothOS Linux Repo', href: 'https://github.com/NullAITech/zoth-os', external: true },
    { label: 'Zoth Egregore (Beta)', href: 'https://github.com/1nc0gn30/zoth-egregore', external: true },
    { label: 'Egregore Documentation Site', href: 'https://zoth-egregore.netlify.app', external: true },
    { label: 'Zoth Civilization Site', href: 'https://zoth-civilization.netlify.app', external: true },
    { label: 'NullAI Tech GitHub', href: 'https://github.com/NullAITech', external: true },
    { label: '1nc0gn30 GitHub', href: 'https://github.com/1nc0gn30', external: true },
  ];

  const theoryAndDocs = [
    { label: 'System Documentation', to: '/docs' },
    { label: 'Six Mathematical Pillars', to: '/docs/math' },
    { label: 'Byzantine Consensus', to: '/consensus' },
    { label: 'Command Bridges', to: '/bridges' },
    { label: 'Agent Experience (AX)', to: '/ax' },
    { label: 'Studio FAQs', to: '/faqs' },
    { label: 'Studio Gallery', to: '/gallery' },
  ];

  const machineStandards = [
    { label: 'llms.txt', href: '/llms.txt', external: true },
    { label: 'llms-full.txt', href: '/llms-full.txt', external: true },
    { label: 'ai.txt', href: '/ai.txt', external: true },
    { label: 'sitemap.xml', href: '/sitemap.xml', external: true },
    { label: 'robots.txt', href: '/robots.txt', external: true },
    { label: 'humans.txt', href: '/humans.txt', external: true },
  ];

  const headingSx = {
    fontFamily: mono,
    fontWeight: 700,
    color: primaryText,
    display: 'block',
    mb: 2,
    letterSpacing: '0.12em',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
  };

  const linkSx = {
    color: secondaryText,
    fontSize: '0.84rem',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    py: 0.25,
    '&:hover': {
      color: gold,
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: `1px solid ${borderCol}`,
        bgcolor: footerBg,
        color: secondaryText,
        pt: { xs: 6, md: 8 },
        pb: 5,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.38)' : 'rgba(122,88,8,0.32)'}`,
                  bgcolor: isDark ? 'rgba(212,175,55,0.10)' : 'rgba(122,88,8,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: gold,
                  flexShrink: 0,
                }}
              >
                Z
              </Box>
              <Box>
                <Typography sx={{ fontFamily: display, fontWeight: 700, fontSize: '1.25rem', color: primaryText, lineHeight: 1.1 }}>
                  Zoth Studio
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.14em', color: gold }}>
                  LOCAL-FIRST REPOSITORY INDEX
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: secondaryText, lineHeight: 1.7, mb: 2.5, maxWidth: 340 }}>
              Local-first AI engineering suite maintained by{' '}
              <Link href="https://nullai.tech" target="_blank" rel="noopener noreferrer" sx={{ color: gold, fontWeight: 700 }}>
                NullAI
              </Link>{' '}
              &amp;{' '}
              <Link href="https://1nc0gn30.si" target="_blank" rel="noopener noreferrer" sx={{ color: gold, fontWeight: 700 }}>
                1nc0gn30
              </Link>
              . CLI binaries, STDP neural memory daemons, and Byzantine multi-agent orchestration running directly on your hardware.
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                component="a"
                href="https://nullai.tech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NullAI website"
                size="small"
                sx={{ border: `1px solid ${borderCol}`, color: primaryText }}
              >
                <LanguageIcon fontSize="small" />
              </IconButton>
              <IconButton
                component="a"
                href="https://github.com/NullAITech/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zoth Studio GitHub repository"
                size="small"
                sx={{ border: `1px solid ${borderCol}`, color: primaryText }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          <Grid xs={6} sm={4} md={2.75}>
            <Typography sx={headingSx}>Systems</Typography>
            <Stack spacing={1}>
              {systems.map((item) => (
                <Link key={item.to} component={RouterLink} to={item.to} sx={linkSx}>
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid xs={6} sm={4} md={2.75}>
            <Typography sx={headingSx}>Repositories</Typography>
            <Stack spacing={1}>
              {repositories.map((item) => (
                <Link key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" sx={linkSx}>
                  {item.label}
                  <OpenInNewIcon sx={{ fontSize: '0.72rem', opacity: 0.65 }} />
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid xs={12} sm={4} md={2.5}>
            <Typography sx={headingSx}>Docs &amp; Machine Specs</Typography>
            <Stack spacing={1}>
              {theoryAndDocs.map((item) => (
                <Link key={item.to} component={RouterLink} to={item.to} sx={linkSx}>
                  {item.label}
                </Link>
              ))}
              {machineStandards.map((item) => (
                <Link key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" sx={linkSx}>
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: `1px solid ${borderCol}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            fontFamily: mono,
            fontSize: '0.73rem',
            color: secondaryText,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <span>© 2026 1nc0gn30 • NullAI Platform</span>
            <span>·</span>
            <Link href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X" target="_blank" rel="noopener noreferrer" sx={{ color: gold, textDecoration: 'none', fontWeight: 700 }}>
              ☕ Buy Us a Coffee
            </Link>
          </Box>
          <span>LOCAL-FIRST · ZERO CLOUD TELEMETRY</span>
        </Box>
      </Container>
    </Box>
  );
}
