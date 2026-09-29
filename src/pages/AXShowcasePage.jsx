import React, { useState } from 'react';
import { Container, Typography, Box, Button, Paper, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import SchemaIcon from '@mui/icons-material/Schema';
import ExtensionIcon from '@mui/icons-material/Extension';
import CinematicIntro from '../components/CinematicIntro';
import {
  HeroReveal,
  HeroItem,
  GlowLine,
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
} from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const GOLD = '#D4AF37';
const GOLD_GLOW = 'rgba(212,175,55,0.45)';

const FEATURES = [
  { icon: <SearchIcon />, title: 'Tool Discovery', desc: 'Agents find and understand your tools automatically.' },
  { icon: <ChatIcon />, title: 'Standardized Communication', desc: 'A common language every AI agent already speaks.' },
  { icon: <SchemaIcon />, title: 'OpenAPI Schemas', desc: 'Industry-standard specs, zero custom glue code.' },
  { icon: <ExtensionIcon />, title: 'Universal Plug-In', desc: 'Works with any agent framework out of the box.' },
];

const AUDIENCES = [
  'AI agent framework developers',
  'Teams connecting tools to LLM systems',
  'Anyone building agent-to-tool bridges',
];

export default function AXShowcasePage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const [introDone, setIntroDone] = useState(false);

  const accent = dark ? GOLD : '#B8860B';
  const bg = dark ? '#08080B' : theme.palette.background.default;
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const cardBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  if (!introDone) {
    return (
      <CinematicIntro
        words={['AGENT', 'EXPERIENCE', 'SPECS']}
        themeColor="gold"
        subtitle="Machine-Readable Entity Architecture, Capabilities & OpenAPI Schemas"
        onComplete={() => setIntroDone(true)}
      />
    );
  }

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh' }}>
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
        {/* ── Hero ── */}
        <HeroReveal>
          <HeroItem>
            <GlowLine color={GOLD} glowColor={GOLD_GLOW} />
          </HeroItem>

          <HeroItem>
            <Typography
              variant="h2"
              sx={{
                mt: 4,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.6rem', md: '3.2rem' },
                background: `linear-gradient(135deg, ${accent}, #FFF, ${accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Let AI Agents Find Your Tools
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              color="text.secondary"
              sx={{ mt: 1.5, maxWidth: 560, fontSize: '1.05rem' }}
            >
              AX gives every tool a machine-readable identity so any AI agent
              can discover, understand, and use it — instantly.
            </Typography>
          </HeroItem>
        </HeroReveal>

        {/* ── Feature Cards ── */}
        <RevealOnScroll preset="fadeUp" delay={0.15}>
          <StaggerChildren
            staggerDelay={0.08}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              marginTop: 48,
            }}
          >
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    height: '100%',
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: accent },
                  }}
                >
                  <Box sx={{ color: accent, mb: 1.5 }}>{f.icon}</Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontFamily: mono, fontWeight: 700, mb: 0.5 }}
                  >
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </Paper>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </RevealOnScroll>

        {/* ── Built For ── */}
        <RevealOnScroll preset="fadeUp" delay={0.2}>
          <Box sx={{ mt: 8, mb: 2 }}>
            <Typography
              variant="h5"
              sx={{ fontFamily: mono, fontWeight: 700, mb: 3, color: accent }}
            >
              Built For
            </Typography>
            <Stack spacing={1.5}>
              {AUDIENCES.map((a) => (
                <Typography
                  key={a}
                  variant="body1"
                  sx={{
                    pl: 2,
                    borderLeft: `3px solid ${accent}`,
                    color: 'text.secondary',
                  }}
                >
                  {a}
                </Typography>
              ))}
            </Stack>
          </Box>
        </RevealOnScroll>

        {/* ── CTA ── */}
        <RevealOnScroll preset="fadeUp" delay={0.25}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 6, mb: 4 }}>
            <Button component={RouterLink} to="/ax/docs" variant="contained" size="large"
              sx={{ bgcolor: accent, color: '#000', fontFamily: mono, fontWeight: 700,
                '&:hover': { bgcolor: dark ? '#E5C04B' : '#9A7209' } }}>
              Explore Full Documentation →
            </Button>
            <Button component="a" href="https://github.com/NullAITech/zoth-studio-v2"
              target="_blank" rel="noopener noreferrer" variant="outlined" size="large"
              sx={{ borderColor: accent, color: accent, fontFamily: mono, fontWeight: 700,
                '&:hover': { borderColor: accent, bgcolor: `${accent}14` } }}>
              View on GitHub →
            </Button>
          </Stack>
        </RevealOnScroll>
      </Container>
    </Box>
  );
}
