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
  Link
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
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function MathPillarsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const gold = isDark ? '#D4AF37' : '#926A05';
  const goldHeading = isDark ? '#F5E6AB' : '#715507';
  const goldWash = isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7';
  const borderCol = isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.25)';

  return (
    <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 3, md: 5 } }}>
      <SEO
        title="Six Mathematical Pillars // Theoretical Foundations & Neuromorphic Proofs"
        description="Formal theoretical foundations of Zoth Studio v2: Linear Algebra, Multivariable Calculus, Shannon Probability, Hessian Curvature, Lyapunov Phase Dynamics, and Neuromorphic STDP."
      />

      {/* Navigation Breadcrumbs */}
      <RevealOnScroll preset="fadeUp" delay={0.1}>
        <Breadcrumbs sx={{ mb: 2.5 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            Home
          </Link>
          <Link component={RouterLink} to="/docs" color="inherit" underline="hover">
            Documentation
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 700 }}>
            Six Mathematical Pillars
          </Typography>
        </Breadcrumbs>
      </RevealOnScroll>

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
                  letterSpacing: '0.04em'
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
                  border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0'
                }}
              />
            </Box>
          </HeroItem>

          <HeroItem>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Celtic Garamond", Georgia, serif',
                fontWeight: 800,
                mb: 1.5,
                letterSpacing: '-0.02em',
                color: isDark ? '#EDEFF2' : '#101828'
              }}
            >
              Six Mathematical Pillars
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography color="text.secondary" sx={{ maxWidth: 900, fontSize: '1.05rem', lineHeight: 1.65 }}>
              The computational heart of Zoth Studio v2 rests upon six irreducible mathematical disciplines.
              From scaled dot-product tensor projections to biomorphic Spike-Timing-Dependent Plasticity (STDP) and Lyapunov orbital stability, every engine is grounded in deterministic, closed-form rigor.
            </Typography>
          </HeroItem>
        </Box>
      </HeroReveal>

      {/* Quick Jump Pillar Navigator */}
      <RevealOnScroll preset="fadeUp" delay={0.2}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3,
            bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
            border: `1px solid ${borderCol}`
          }}
        >
          <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: goldHeading, letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
            PILLAR QUICK DIRECTORY // EXPLORE MATHEMATICAL SPECIFICATIONS
          </Typography>

          <StaggerChildren>
            <Grid container spacing={1.5}>
              {mathPillars.map((p) => (
                <Grid xs={12} sm={6} md={4} key={p.id}>
                  <StaggerItem>
                    <Button
                      component={RouterLink}
                      to={`/docs/math/${p.id}`}
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />}
                      sx={{
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
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <span>{p.numeral}. {p.title}</span>
                    </Button>
                  </StaggerItem>
                </Grid>
              ))}
            </Grid>
          </StaggerChildren>
        </Paper>
      </RevealOnScroll>

      {/* Full Interactive Grid */}
      <RevealOnScroll preset="fadeUp" delay={0.3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 6,
            borderRadius: 3,
            bgcolor: isDark ? '#08080B' : '#FFFFFF',
            border: `1px solid ${isDark ? '#26262F' : '#EAECF0'}`
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: goldHeading, mb: 0.5 }}>
              Interactive Mathematical Proofs Matrix
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toggle difficulty tiers (Beginner, Intermediate, Advanced) and audit closed-form equations, audio narration, and LaTeX derivations.
            </Typography>
          </Box>

          <MathPillarsGrid variant="full" />
        </Paper>
      </RevealOnScroll>

      {/* Sovereign Installation Funnel */}
      <RevealOnScroll preset="fadeUp" delay={0.4}>
        <SovereignFunnel
          title="Deploy Mathematical AI Engines Locally"
          subtitle="Zero-egress tensor compilation, STDP neuromorphic vector stores, and Lyapunov stability analyzers for autonomous swarms."
          toolTitle="Option 1: Zoth Mathematical Core Micro-Engine"
          toolTag="MATH PILLARS"
          toolDescription="Standalone Python/WGSL library with GPU-accelerated attention projections, Lyapunov stability evaluators, and STDP synaptic learning rules."
          toolRepo="https://github.com/NullAITech/zoth-studio-v2"
          toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && npm run test:math"
          sx={{ mt: 6 }}
        />
      </RevealOnScroll>
    </Container>
  );
}
