import React from 'react';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import VerifiedIcon from '@mui/icons-material/Verified';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import {
  HeroReveal,
  HeroItem,
  GlowLine,
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
} from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const FEATURES = [
  { icon: <AccountTreeIcon />, title: 'Chained Workflows', desc: 'Link AI calls into automated, multi-step pipelines.' },
  { icon: <VerifiedIcon />, title: 'Schema-Validated I/O', desc: 'Every input and output is checked against a contract.' },
  { icon: <FactCheckIcon />, title: 'Plan & Verify', desc: 'Built-in planning and result verification at every stage.' },
  { icon: <ComputerIcon />, title: 'Runs Locally', desc: 'Your machine, your models — nothing leaves your network.' },
];

const AUDIENCES = [
  'AI engineers building production pipelines',
  'Teams automating repetitive LLM tasks',
  'Builders who need reliable, repeatable AI workflows',
];

export default function AdytumShowcasePage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const goldGlow = isDark ? 'rgba(212,175,55,0.45)' : 'rgba(184,134,11,0.35)';
  const surface = isDark
    ? 'rgba(212,175,55,0.06)'
    : 'rgba(184,134,11,0.06)';
  const bg = isDark ? '#08080B' : theme.palette.background.default;

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={['ADYTUM', 'KEYMASTER', 'SANCTUM']}
          themeColor="gold"
          subtitle="22-Key Hermetic Planning Rite & Memory-Hard Cryptographic Vault"
          onComplete={() => setIntroDone(true)}
        />
      )}

      <Box sx={{ bgcolor: bg, minHeight: '100vh' }}>
        <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
          {/* ── Hero ─────────────────────────────────── */}
          <HeroReveal>
            <HeroItem>
              <GlowLine color={gold} glowColor={goldGlow} />
            </HeroItem>

            <HeroItem>
              <Chip
                label="ADYTUM"
                size="small"
                sx={{
                  mt: 4,
                  fontFamily: mono,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: gold,
                  borderColor: gold,
                  bgcolor: surface,
                }}
                variant="outlined"
              />
            </HeroItem>

            <HeroItem>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  mt: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Orchestrate AI Workflows,{' '}
                <Box component="span" sx={{ color: gold }}>
                  Automatically
                </Box>
              </Typography>
            </HeroItem>

            <HeroItem>
              <Typography
                sx={{ mt: 1, maxWidth: 600, color: theme.palette.text.secondary }}
              >
                Define your workflow once — Adytum chains every AI call, validates
                results, and keeps the whole pipeline on track.
              </Typography>
            </HeroItem>
          </HeroReveal>

          {/* ── Feature Cards ────────────────────────── */}
          <RevealOnScroll preset="fadeUp" delay={0.1}>
            <StaggerChildren
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20,
                marginTop: 48,
              }}
            >
              {FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      bgcolor: surface,
                      borderColor: isDark
                        ? 'rgba(212,175,55,0.18)'
                        : 'rgba(184,134,11,0.18)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ color: gold, mb: 1 }}>{f.icon}</Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontFamily: mono, fontWeight: 700, color: gold }}
                      >
                        {f.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: theme.palette.text.secondary }}
                      >
                        {f.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </RevealOnScroll>

          {/* ── Built For ────────────────────────────── */}
          <RevealOnScroll preset="fadeUp" delay={0.15}>
            <Box sx={{ mt: 8 }}>
              <Typography
                variant="overline"
                sx={{ fontFamily: mono, color: gold, letterSpacing: '0.14em' }}
              >
                Built For
              </Typography>
              {AUDIENCES.map((a) => (
                <Box
                  key={a}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mt: 1.5,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 18, color: gold }} />
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    {a}
                  </Typography>
                </Box>
              ))}
            </Box>
          </RevealOnScroll>

          {/* ── CTA ──────────────────────────────────── */}
          <RevealOnScroll preset="fadeUp" delay={0.2}>
            <Box sx={{ mt: 8, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/adytum/docs"
                variant="contained"
                sx={{
                  bgcolor: gold,
                  color: '#000',
                  fontFamily: mono,
                  fontWeight: 700,
                  '&:hover': { bgcolor: isDark ? '#b8960e' : '#9a7209' },
                }}
              >
                Explore Full Documentation →
              </Button>
              <Button
                href="https://github.com/NullAITech/adytum-alchemist-ai-workflow"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{
                  borderColor: gold,
                  color: gold,
                  fontFamily: mono,
                  fontWeight: 700,
                  '&:hover': { borderColor: gold, bgcolor: surface },
                }}
              >
                View on GitHub →
              </Button>
            </Box>
          </RevealOnScroll>
        </Container>
      </Box>
    </>
  );
}
