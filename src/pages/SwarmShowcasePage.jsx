import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box, Container, Typography, Button, Paper, Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem,
} from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const FEATURES = [
  { icon: AccountTreeIcon, title: 'Tri-Agent Pipeline', desc: 'A planner, coder, and auditor work together autonomously.' },
  { icon: AltRouteIcon, title: 'Self-Coordinating Routing', desc: 'Tasks flow to the right agent without manual wiring.' },
  { icon: VerifiedIcon, title: 'Built-In Verification', desc: 'Every output is checked before it reaches you.' },
  { icon: CloudOffIcon, title: 'Fully Local', desc: 'Runs entirely on your machine — zero cloud calls.' },
];

const AUDIENCE = [
  'AI engineers building agent systems',
  'Teams wanting autonomous code generation',
  'Anyone exploring multi-model orchestration',
];

export default function SwarmShowcasePage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent = isDark ? '#34D399' : '#059669';
  const accentWash = isDark ? 'rgba(52,211,153,0.10)' : 'rgba(5,150,105,0.08)';
  const accentBorder = isDark ? 'rgba(52,211,153,0.30)' : 'rgba(5,150,105,0.22)';
  const bg = isDark ? '#08080B' : theme.palette.background.default;

  if (!introDone) {
    return (
      <CinematicIntro
        words={['21 LOCAL', 'SWARM', 'PANTHEON']}
        themeColor="emerald"
        subtitle="Autonomous Agent Coordination Matrix // 5 Operational Cadres"
        onComplete={() => setIntroDone(true)}
      />
    );
  }

  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh' }}>
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
        {/* Hero */}
        <HeroReveal>
          <HeroItem>
            <GlowLine color={accent} glowColor={`${accent}66`} />
          </HeroItem>
          <HeroItem>
            <Typography
              variant="h2"
              sx={{
                fontFamily: mono, fontWeight: 800, mt: 4, mb: 2,
                background: `linear-gradient(135deg, ${accent}, #FFFFFF)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              AI Agents That Work Together
            </Typography>
          </HeroItem>
          <HeroItem>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mb: 5 }}>
              A team of AI models that plan, build, and verify — running entirely on your hardware.
            </Typography>
          </HeroItem>
        </HeroReveal>

        {/* Feature Cards */}
        <StaggerChildren>
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {FEATURES.map((f) => (
              <Grid xs={12} sm={6} md={3} key={f.title}>
                <StaggerItem>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3, height: '100%', bgcolor: accentWash,
                      border: `1px solid ${accentBorder}`, borderRadius: 2,
                    }}
                  >
                    <f.icon sx={{ fontSize: 32, color: accent, mb: 1.5 }} />
                    <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 700, mb: 0.5 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </Paper>
                </StaggerItem>
              </Grid>
            ))}
          </Grid>
        </StaggerChildren>

        {/* Built For */}
        <RevealOnScroll>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 700, mb: 3, color: accent }}>
              Built For
            </Typography>
            {AUDIENCE.map((a) => (
              <Typography key={a} variant="body1" color="text.secondary" sx={{ mb: 1, pl: 2, borderLeft: `3px solid ${accentBorder}` }}>
                {a}
              </Typography>
            ))}
          </Box>
        </RevealOnScroll>

        {/* CTA */}
        <RevealOnScroll>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={RouterLink} to="/swarm/docs" variant="contained" size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: accent, color: '#000', fontFamily: mono, fontWeight: 700,
                '&:hover': { bgcolor: isDark ? '#2AB886' : '#047857' },
              }}
            >
              Explore Full Documentation
            </Button>
            <Button
              href="https://github.com/NullAITech/zoth-swarm-multiplexer"
              target="_blank" rel="noopener noreferrer" variant="outlined" size="large"
              endIcon={<OpenInNewIcon />}
              sx={{
                borderColor: accentBorder, color: accent, fontFamily: mono, fontWeight: 700,
                '&:hover': { borderColor: accent, bgcolor: accentWash },
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
