import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Stack, IconButton, Button, Unstable_Grid2 as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import GhostByteMark from './GhostByteMark';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { STRIPE_COFFEE_URL, SOLANA_TIP_ADDRESS, useCopy } from './sovereign';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { copied: solCopied, copy: copySol } = useCopy(2000);

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';
  const footerBg = isDark ? '#06070B' : '#F3EFE6';

  const systems = [
    { label: `Sovereign Arsenal (${microTools.length} Free Tools)`, to: '/arsenal' },
    { label: 'ZothOS v3.4.0 & Lite v1.2', to: '/zoth-os' },
    { label: 'Pantheon Swarm (:9393)', to: '/swarm' },
    { label: 'Neuro-Memory (:8094)', to: '/memory' },
    { label: 'Zoth Bolt WebGen (:5173)', to: '/webgen' },
    { label: 'HexStrike Security (:8888)', to: '/hexstrike' },
    { label: 'Adytum 22-Key Chamber', to: '/adytum' },
    { label: 'Architecture Dossiers (43)', to: '/workstations' },
  ];

  const ecosystem = [
    { label: 'ZothOS v3.4.0 (23 Daemons)', href: 'https://zothos.nullai.tech' },
    { label: 'ZothOS-Lite v1.2 (56 Models)', href: 'https://zothos-lite.nullai.tech' },
    { label: 'Zoth Civilization v3.0', href: 'https://zoth-civilization.netlify.app' },
    { label: 'ZothNet Encrypted Mesh', href: 'https://zothnet.nullai.tech' },
    { label: 'NullAI Platform', href: 'https://nullai.tech' },
    { label: 'FieldKit Utilities', href: 'https://nullai.tech/fieldkit' },
    { label: '1nc0gn30 Hub', href: 'https://1nc0gn30.si' },
    { label: '79 Public GitHub Repos', href: 'https://github.com/1nc0gn30' },
  ];

  const theoryAndDocs = [
    { label: 'System Documentation', to: '/docs' },
    { label: 'Zoth UI Kit (@zoth/ui)', to: '/ui-kit' },
    { label: 'Six Mathematical Pillars', to: '/docs/math' },
    { label: 'Byzantine Consensus', to: '/consensus' },
    { label: 'Agent Experience (AX)', to: '/ax' },
    { label: 'Studio FAQs', to: '/faqs' },
    { label: 'Studio Gallery', to: '/gallery' },
  ];

  const machineStandards = [
    { label: 'llms.txt', href: '/llms.txt' },
    { label: 'llms-full.txt', href: '/llms-full.txt' },
    { label: 'ai.txt', href: '/ai.txt' },
    { label: 'sitemap.xml', href: '/sitemap.xml' },
    { label: 'robots.txt', href: '/robots.txt' },
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
          <Grid xs={12} md={3.8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.38)' : 'rgba(122,88,8,0.32)'}`,
                  bgcolor: isDark ? 'rgba(212,175,55,0.10)' : 'rgba(122,88,8,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: display,
                  fontWeight: 400,
                  fontSize: '1.1rem',
                  color: gold,
                  flexShrink: 0,
                }}
              >
                Z
              </Box>
              <Box>
                <Typography sx={{ fontFamily: display, fontWeight: 400, fontSize: '1.28rem', color: primaryText, lineHeight: 1.1 }}>
                  Zoth Studio
                </Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', color: gold }}>
                  {microTools.length} FREE OPEN-ACCESS TOOLS
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
              . 56 in-browser/WebGPU utilities, 29 local CLI/daemon packages, 82 public GitHub repos, and 43 Studio workstations running with zero cloud telemetry.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://nullai.tech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="NullAI Platform — Living 3D GhostByte Specimen"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.9,
                  px: 1.2,
                  py: 0.45,
                  borderRadius: '10px',
                  border: `1px solid ${borderCol}`,
                  textDecoration: 'none',
                  color: primaryText,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  '&:hover': { borderColor: gold },
                }}
              >
                <GhostByteMark size={28} variant="hologram" interactive={false} showRings={false} ariaLabel="NullAI 3D GhostByte emblem" />
                <span>NullAI</span>
              </Link>
              <IconButton
                component="a"
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Zoth Studio GitHub repository"
                size="small"
                sx={{ border: `1px solid ${borderCol}`, color: primaryText, minWidth: 40, minHeight: 40 }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          <Grid xs={6} sm={4} md={2.7}>
            <Typography sx={headingSx}>Studio Systems</Typography>
            <Stack spacing={1}>
              {systems.map((item) => (
                <Link key={item.to} component={RouterLink} to={item.to} sx={linkSx}>
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid xs={6} sm={4} md={3}>
            <Typography sx={headingSx}>Sovereign Ecosystem</Typography>
            <Stack spacing={1}>
              {ecosystem.map((item) => (
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
            gap: 1.5,
            fontFamily: mono,
            fontSize: '0.73rem',
            color: secondaryText,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            <span>
              Engineered by Neal Frazier Tech (
              <Link
                href="https://github.com/1nc0gn30/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: primaryText, fontWeight: 700, textDecoration: 'none', '&:hover': { color: gold } }}
              >
                @1nc0gn30
              </Link>
              ) •{' '}
              <Link
                href="https://nullai.tech"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: primaryText, fontWeight: 700, textDecoration: 'none', '&:hover': { color: gold } }}
              >
                NullAI Platform
              </Link>
            </span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              href={STRIPE_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                minHeight: 34,
                px: 1.4,
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: gold,
                borderColor: borderCol,
                '&:hover': { borderColor: gold },
              }}
            >
              ☕ Buy Us a Coffee
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => copySol(SOLANA_TIP_ADDRESS)}
              sx={{
                minHeight: 34,
                px: 1.4,
                fontFamily: mono,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: isDark ? '#34D399' : '#047857',
                borderColor: borderCol,
                '&:hover': { borderColor: isDark ? '#34D399' : '#047857' },
              }}
            >
              {solCopied ? '✓ Copied Solana Tip' : '◎ Solana Tip'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
