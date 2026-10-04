import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent,
  Button, Chip, useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CodeIcon from '@mui/icons-material/Code';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  HeroReveal, HeroItem, GlowLine, RevealOnScroll,
  StaggerChildren, StaggerItem,
} from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const FEATURES = [
  { icon: AutoAwesomeIcon, title: 'Prompt to Website', desc: 'Describe what you need — get a complete site in seconds.' },
  { icon: CodeIcon, title: '6 Framework Exports', desc: 'React, Vue, Svelte, Solid, Astro, or clean HTML.' },
  { icon: WifiOffIcon, title: '100% Local & Offline', desc: 'Runs on your machine. No cloud, no tracking, ever.' },
  { icon: DarkModeIcon, title: 'Beautiful Themes', desc: 'Four stunning dark-mode design systems built in.' },
];

const AUDIENCE = [
  'Developers who want instant site scaffolds',
  'Founders who need a landing page fast',
  'Anyone who wants code ownership without cloud lock-in',
];

export default function WebGenShowcasePage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const accent = '#34D399';
  const accentGlow = 'rgba(52, 211, 153, 0.45)';
  const cardBg = dark ? 'rgba(52, 211, 153, 0.04)' : 'rgba(52, 211, 153, 0.06)';
  const cardBorder = dark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(52, 211, 153, 0.25)';
  const surfaceBg = dark ? '#0B0B12' : theme.palette.background.default;


  return (
    <Box sx={{ bgcolor: surfaceBg, minHeight: '100vh' }}>
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 5, md: 7 } }}>

        {/* ── Hero ── */}
        <HeroReveal>
          <HeroItem>
            <GlowLine color={accent} glowColor={accentGlow} />
          </HeroItem>

          <HeroItem>
            <Chip
              label="WEBGEN"
              size="small"
              sx={{
                mt: 4, fontFamily: mono, fontWeight: 700, letterSpacing: '0.12em',
                bgcolor: `${accent}18`, color: accent, border: `1px solid ${accent}40`,
              }}
            />
          </HeroItem>

          <HeroItem>
            <Typography
              variant="h2"
              sx={{
                mt: 2, fontWeight: 900, letterSpacing: '-0.02em',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
                color: dark ? '#fff' : 'text.primary',
              }}
            >
              Websites from Words.
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              sx={{
                mt: 1.5, maxWidth: 540, color: 'text.secondary',
                fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.6,
              }}
            >
              Type a prompt, pick a framework, and get a production-ready website — all running locally on your machine.
            </Typography>
          </HeroItem>
        </HeroReveal>

        {/* ── Feature Cards ── */}
        <StaggerChildren style={{ marginTop: 56 }}>
          <Grid container spacing={3} alignItems="stretch">
            {FEATURES.map((f) => (
              <Grid xs={12} sm={6} md={3} key={f.title} sx={{ display: 'flex' }}>
                <StaggerItem>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%', width: '100%', flex: 1, bgcolor: cardBg,
                      border: `1px solid ${cardBorder}`, borderRadius: 3,
                      transition: 'border-color 0.3s',
                      '&:hover': { borderColor: accent },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <f.icon sx={{ fontSize: 32, color: accent, mb: 1.5 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {f.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {f.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </Grid>
            ))}
          </Grid>
        </StaggerChildren>

        {/* ── Built For ── */}
        <RevealOnScroll preset="fadeUp" delay={0.1}>
          <Box sx={{ mt: 8, mb: 2 }}>
            <Typography
              variant="overline"
              sx={{ fontFamily: mono, color: accent, letterSpacing: '0.15em', fontWeight: 700 }}
            >
              Built For
            </Typography>
            <Box component="ul" sx={{ mt: 1.5, pl: 2.5, listStyle: 'none', p: 0 }}>
              {AUDIENCE.map((line) => (
                <Typography
                  component="li" key={line} variant="body1"
                  sx={{
                    py: 0.6, color: 'text.secondary', display: 'flex',
                    alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6, height: 6, borderRadius: '50%',
                      bgcolor: accent, flexShrink: 0,
                    }}
                  />
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>
        </RevealOnScroll>

        {/* ── CTA ── */}
        <RevealOnScroll preset="fadeUp" delay={0.15}>
          <Box sx={{ mt: 7, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/webgen/docs"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: accent, color: '#000', fontWeight: 700,
                textTransform: 'none', borderRadius: 2, px: 3, py: 1.2,
                '&:hover': { bgcolor: '#2CC489' },
              }}
            >
              Explore Full Documentation
            </Button>
            <Button
              href="https://github.com/NullAITech/zoth-webgen"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<GitHubIcon />}
              sx={{
                borderColor: cardBorder, color: dark ? '#fff' : 'text.primary',
                textTransform: 'none', borderRadius: 2, px: 3, py: 1.2,
                '&:hover': { borderColor: accent, color: accent },
              }}
            >
              View on GitHub
            </Button>
          </Box>
        </RevealOnScroll>

      </Container>
    </Box>
  );
}
