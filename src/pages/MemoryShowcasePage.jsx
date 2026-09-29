import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CinematicIntro from '../components/CinematicIntro';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem } from '../components/MotionReveal';
import { Box, Container, Typography, Paper, Button, Unstable_Grid2 as Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const FEATURES = [
  { icon: <PsychologyIcon />, title: 'Brain-Inspired Memory', desc: 'Persistent memory modeled after biological neurons — context survives between sessions.' },
  { icon: <TrendingUpIcon />, title: 'Learns Over Time', desc: 'Connections strengthen with use and fade when forgotten, just like real synapses.' },
  { icon: <SearchIcon />, title: 'Semantic Search', desc: 'Find anything by meaning, not keywords. Search across every conversation and context.' },
  { icon: <StorageIcon />, title: 'Local-First Privacy', desc: 'Your data never leaves your machine. A local vector database you fully control.' },
];

const AUDIENCES = [
  'AI researchers exploring memory architectures',
  'Developers building context-aware agents',
  'Anyone who wants AI that actually remembers',
];

export default function MemoryShowcasePage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const purple = {
    accent: isDark ? '#C084FC' : '#9333EA',
    wash: isDark ? 'rgba(192,132,252,0.10)' : 'rgba(147,51,234,0.08)',
    border: isDark ? 'rgba(192,132,252,0.30)' : 'rgba(147,51,234,0.25)',
    glow: isDark ? 'rgba(192,132,252,0.45)' : 'rgba(147,51,234,0.35)',
  };

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={['MEMORY', 'STDP', 'SYNAPSE']}
          themeColor="purple"
          subtitle="Biomorphic Spike-Timing-Dependent Plasticity Synaptic Memory Matrix"
          onComplete={() => setIntroDone(true)}
        />
      )}

      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
        {/* ── Hero ── */}
        <HeroReveal>
          <Box sx={{ mb: 6, pt: 1 }}>
            <GlowLine height={3} color={purple.accent} glowColor={purple.glow} duration={1.5} delay={0.1} />

            <HeroItem>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mt: 3,
                  mb: 2,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2rem', sm: '2.8rem', md: '3.6rem' },
                  lineHeight: 1.1,
                }}
              >
                Memory That{' '}
                <span style={{ color: purple.accent }}>Evolves</span>
              </Typography>
            </HeroItem>

            <HeroItem>
              <Typography color="text.secondary" sx={{ maxWidth: 640, fontSize: '1.1rem', lineHeight: 1.6 }}>
                A brain-inspired memory system so your AI agents remember context, learn patterns, and grow stronger over time.
              </Typography>
            </HeroItem>
          </Box>
        </HeroReveal>

        {/* ── Feature Cards ── */}
        <RevealOnScroll preset="fadeUp" delay={0.1}>
          <StaggerChildren>
            <Grid container spacing={3} sx={{ mb: 8 }}>
              {FEATURES.map((f, i) => (
                <Grid xs={12} sm={6} md={3} key={i}>
                  <StaggerItem>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: 3,
                        bgcolor: isDark ? '#0B0B12' : theme.palette.background.paper,
                        border: `1px solid ${purple.border}`,
                        transition: 'border-color 0.3s',
                        '&:hover': { borderColor: purple.accent },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: purple.wash,
                          color: purple.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        {f.icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontFamily: mono }}>
                        {f.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {f.desc}
                      </Typography>
                    </Paper>
                  </StaggerItem>
                </Grid>
              ))}
            </Grid>
          </StaggerChildren>
        </RevealOnScroll>

        {/* ── Built For ── */}
        <RevealOnScroll preset="fadeUp" delay={0.15}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Built For
            </Typography>
            {AUDIENCES.map((a, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: purple.accent,
                    flexShrink: 0,
                  }}
                />
                <Typography color="text.secondary" sx={{ fontSize: '1rem' }}>
                  {a}
                </Typography>
              </Box>
            ))}
          </Box>
        </RevealOnScroll>

        {/* ── CTA ── */}
        <RevealOnScroll preset="fadeUp" delay={0.2}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
              py: 4,
              borderTop: `1px solid ${purple.border}`,
            }}
          >
            <Button
              component={RouterLink}
              to="/memory/docs"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                fontWeight: 700,
                px: 4,
                bgcolor: purple.accent,
                '&:hover': { bgcolor: isDark ? '#A855F7' : '#7C3AED' },
              }}
            >
              Explore Full Documentation
            </Button>
            <Button
              component="a"
              href="https://github.com/NullAITech/vector-search-engine"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              endIcon={<OpenInNewIcon />}
              sx={{
                fontWeight: 700,
                px: 4,
                borderColor: purple.border,
                color: purple.accent,
                '&:hover': { borderColor: purple.accent },
              }}
            >
              View on GitHub
            </Button>
          </Box>
        </RevealOnScroll>
      </Container>
    </>
  );
}
