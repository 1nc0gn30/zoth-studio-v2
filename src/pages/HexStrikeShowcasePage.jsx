import React from 'react';
import CinematicIntro from '../components/CinematicIntro';
import { Link as RouterLink } from 'react-router-dom';
import {
  HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem,
} from '../components/MotionReveal';
import {
  Box, Container, Typography, Card, CardContent,
  Unstable_Grid2 as Grid, Button, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RadarIcon from '@mui/icons-material/Radar';
import BugReportIcon from '@mui/icons-material/BugReport';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MemoryIcon from '@mui/icons-material/Memory';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const FEATURES = [
  {
    icon: RadarIcon,
    title: 'Vulnerability Scanning',
    desc: 'Automatically find weak spots across your entire local stack.',
  },
  {
    icon: BugReportIcon,
    title: 'CVE Database & Threat Analysis',
    desc: 'Cross-reference known exploits and assess real-world risk.',
  },
  {
    icon: VisibilityOffIcon,
    title: 'Steganography Tools',
    desc: 'Hide and detect concealed data inside ordinary files.',
  },
  {
    icon: MemoryIcon,
    title: 'Runs on Your Hardware',
    desc: 'Everything executes locally — no cloud, no data leaves your machine.',
  },
];

const BUILT_FOR = [
  'Security researchers & pen-testers',
  'Red team operators',
  'Developers who take security seriously',
];

export default function HexStrikeShowcasePage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#EF4444' : '#DC2626';
  const accentWash = isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2';
  const accentBorder = isDark ? 'rgba(239,68,68,0.28)' : '#FECACA';
  const voidBg = isDark ? '#08080B' : '#FFFFFF';

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["HEXSTRIKE", "OFFENSIVE", "SECURITY"]}
          themeColor="crimson"
          subtitle="Autonomous Penetration Testing & CVE Vulnerability Matrix"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6, position: 'relative' }}>

        {/* Hero Section */}
        <HeroReveal>
          <HeroItem>
            <GlowLine height={3} color={accent} glowColor={isDark ? 'rgba(239,68,68,0.40)' : 'rgba(220,38,38,0.22)'} duration={1.5} delay={0.1} />
          </HeroItem>

          <HeroItem>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                mt: 4,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.6rem' },
                lineHeight: 1.1,
                color: theme.palette.text.primary,
              }}
            >
              Offensive Security,{' '}
              <Box component="span" sx={{ color: accent }}>On Your Terms</Box>
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 640, mb: 6, fontSize: '1.1rem', lineHeight: 1.65 }}
            >
              Scan for vulnerabilities, analyze threats, and simulate attacks — all from your own machine. No cloud required.
            </Typography>
          </HeroItem>
        </HeroReveal>

        {/* Feature Cards */}
        <RevealOnScroll preset="fadeUp" delay={0.1}>
          <Grid container spacing={2.5} sx={{ mb: 8 }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Grid xs={12} sm={6} md={3} key={f.title}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: voidBg,
                      border: `1px solid ${accentBorder}`,
                      borderRadius: 2.5,
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      '&:hover': { borderColor: accent, transform: 'translateY(-3px)' },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          p: 1, borderRadius: 1.5, bgcolor: accentWash,
                          display: 'inline-flex', mb: 1.5,
                        }}
                      >
                        <Icon sx={{ color: accent, fontSize: '1.4rem' }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: theme.palette.text.primary }}>
                        {f.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                        {f.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </RevealOnScroll>

        {/* Built For Section */}
        <RevealOnScroll preset="fadeUp" delay={0.15}>
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 3, color: theme.palette.text.primary }}
            >
              Built For
            </Typography>
            <StaggerChildren>
              {BUILT_FOR.map((persona) => (
                <StaggerItem key={persona}>
                  <Box
                    sx={{
                      py: 1.5, px: 2.5, mb: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${accentBorder}`,
                      bgcolor: isDark ? 'rgba(239,68,68,0.04)' : '#FFFBFB',
                      fontFamily: mono,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {persona}
                  </Box>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </Box>
        </RevealOnScroll>

        {/* CTA Block */}
        <RevealOnScroll preset="fadeUp" delay={0.2}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: isDark ? '#0E0E14' : '#FAFAFA',
              border: `1px solid ${accentBorder}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: theme.palette.text.primary }}>
              Ready to take control of your security?
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={RouterLink}
                to="/hexstrike/docs"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: accent,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontFamily: mono,
                  px: 3, py: 1.2,
                  borderRadius: 2,
                  '&:hover': { bgcolor: isDark ? '#F87171' : '#B91C1C' },
                }}
              >
                Explore Full Documentation →
              </Button>
              <Button
                component="a"
                href="https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<GitHubIcon />}
                sx={{
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB',
                  color: theme.palette.text.primary,
                  fontWeight: 700,
                  fontFamily: mono,
                  px: 3, py: 1.2,
                  borderRadius: 2,
                  '&:hover': { borderColor: accent, color: accent },
                }}
              >
                View on GitHub →
              </Button>
            </Stack>
          </Box>
        </RevealOnScroll>

      </Container>
    </>
  );
}
