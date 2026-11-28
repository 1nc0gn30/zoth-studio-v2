import React from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  Button,
  Unstable_Grid2 as Grid,
  Stack,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalculateIcon from '@mui/icons-material/Calculate';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SEO from '../components/SEO';
import MathPillarsGrid from '../components/MathPillarsGrid';
import SovereignFunnel from '../components/SovereignFunnel';
import { mathPillars } from '../data/mathPillars';
import { HeroReveal, HeroItem } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#7A5600';
  const goldHeading = isDark ? '#F5E6AB' : '#7A5600';
  const goldWash = isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7';
  const borderCol = isDark ? 'rgba(212,175,55,0.3)' : 'rgba(138,101,8,0.28)';

  return (
    <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 4, md: 6 } }}>
      <SEO
        title="Six Math Pillars // Interactive Theory Academy & Formal Systems"
        description="Formal theoretical foundations of Zoth Studio v2: Linear Algebra, Multivariable Calculus, Probability & Shannon Entropy, Hessian Loss Manifolds, Lyapunov Phase Dynamics, Neuromorphic STDP, and Byzantine BFT Quorum bounds."
      />

      {/* Navigation Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2.5 }}>
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          underline="hover"
          sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}
        >
          Home
        </Link>
        <Link
          component={RouterLink}
          to="/docs"
          color="inherit"
          underline="hover"
          sx={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', px: 0.5 }}
        >
          Documentation
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>
          Six Mathematical Pillars
        </Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <HeroReveal>
        <Box sx={{ mb: 4 }}>
          <HeroItem>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<FunctionsIcon sx={{ color: `${goldHeading} !important` }} />}
                label="THEORETICAL FOUNDATIONS & CLOSED-FORM PROOFS"
                size="small"
                sx={{
                  bgcolor: goldWash,
                  color: goldHeading,
                  border: `1px solid ${borderCol}`,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  maxWidth: '100%',
                  height: 'auto',
                  '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
                }}
              />
              <Chip
                icon={<VerifiedUserIcon sx={{ color: `${isDark ? '#10B981' : '#047857'} !important`, fontSize: '14px !important' }} />}
                label="ZERO-EGRESS NUMERICAL INVARIANTS"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
                  color: isDark ? '#10B981' : '#047857',
                  fontWeight: 800,
                  border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
                  maxWidth: '100%',
                  height: 'auto',
                  '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
                }}
              />
            </Box>
          </HeroItem>

          <HeroItem>
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontFamily: '"Celtic Garamond", Georgia, serif',
                fontWeight: 800,
                mb: 1.5,
                letterSpacing: '-0.02em',
                color: isDark ? '#EDEFF2' : '#101828',
                fontSize: { xs: '1.85rem', sm: '2.6rem', md: '3.4rem' },
                lineHeight: 1.15,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              Six Mathematical <span className="text-gradient-gold">Pillars</span>
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography color="text.secondary" sx={{ maxWidth: 900, fontSize: '1.05rem', lineHeight: 1.65, mb: 2.5 }}>
              The computational core of Zoth Studio v2 rests upon six mathematical disciplines paired with Byzantine BFT quorum verification:
              Linear Algebra attention &amp; KV-cache bounds, Multivariable Calculus AdamW dynamics, Shannon Probability &amp; Entropy,
              Hessian curvature eigenspaces, Lyapunov phase stability, and Neuromorphic STDP plasticity.
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5 }}>
              <Button
                component={RouterLink}
                to="/workstations/math-pillars"
                variant="contained"
                startIcon={<CalculateIcon />}
                sx={{
                  minHeight: 44,
                  px: 2.5,
                  bgcolor: isDark ? '#D4AF37' : '#7A5600',
                  color: isDark ? '#08080B' : '#FFFFFF',
                  fontWeight: 800,
                  textTransform: 'none',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#5E4200' },
                }}
              >
                Launch Interactive Math Workstation
              </Button>
            </Stack>
          </HeroItem>
        </Box>
      </HeroReveal>

      {/* Quick Jump Pillar Navigator */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
          border: `1px solid ${borderCol}`,
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: goldHeading, letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
          PILLAR QUICK DIRECTORY // EXPLORE MATHEMATICAL SPECIFICATIONS
        </Typography>

        <Grid container spacing={1.5}>
          {mathPillars.map((p) => (
            <Grid xs={12} sm={6} md={4} key={p.id}>
              <Button
                component={RouterLink}
                to={`/docs/math/${p.id}`}
                variant="outlined"
                fullWidth
                endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{
                  minHeight: 44,
                  justifyContent: 'space-between',
                  textTransform: 'none',
                  py: 1,
                  px: 1.75,
                  borderRadius: 2,
                  borderColor: borderCol,
                  color: isDark ? '#EDEFF2' : '#101828',
                  bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  fontFamily: mono,
                  '&:hover': {
                    borderColor: gold,
                    bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.18s ease',
                }}
              >
                <span>{p.numeral}. {p.title}</span>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Full Interactive Grid */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 6,
          borderRadius: 3,
          bgcolor: isDark ? '#08080B' : '#FFFFFF',
          border: `1px solid ${isDark ? '#26262F' : '#EAECF0'}`,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 800, color: goldHeading, mb: 0.5 }}>
            Interactive Mathematical Proofs Matrix
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toggle difficulty tiers (Beginner, Intermediate, Advanced) and audit closed-form equations, audio narration, and formal derivations.
          </Typography>
        </Box>

        <MathPillarsGrid variant="full" />
      </Paper>

      {/* Sovereign Installation Funnel (single support strip in Footer only -> showSupportStrip={false}) */}
      <SovereignFunnel
        title="Run & Verify the Six Mathematical Pillars Engine Locally"
        subtitle="Deterministic zero-egress solvers for Linear Algebra, AdamW Calculus, Shannon Entropy, Hessian Curvature, Lyapunov Stability, Neuromorphic STDP, and Byzantine BFT Quorums."
        toolTitle="Option 1: Zoth Math Pillars Pure Engine & Tests"
        toolTag="MATH PILLARS"
        toolDescription="Pure ESM deterministic math engine (src/utils/mathPillarsEngine.js & server/math-pillars-engine.mjs) with Node unit tests and loopback Studio API."
        toolRepo="https://github.com/NullAITech/zoth-studio-v2"
        toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2 && npm run test:math-pillars"
        showSupportStrip={false}
        sx={{ mt: 6 }}
      />
    </Container>
  );
}
