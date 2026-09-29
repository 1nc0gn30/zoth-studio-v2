import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import CinematicIntro from '../components/CinematicIntro';
import {
  HeroReveal,
  HeroItem,
  GlowLine,
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
} from '../components/MotionReveal';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import UsbIcon from '@mui/icons-material/Usb';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function ZothOSShowcasePage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent = isDark ? '#C084FC' : '#9333EA';
  const accentWash = isDark ? 'rgba(192,132,252,0.10)' : 'rgba(147,51,234,0.08)';
  const accentBorder = isDark ? 'rgba(192,132,252,0.28)' : 'rgba(147,51,234,0.22)';
  const accentGlow = isDark ? 'rgba(192,132,252,0.45)' : 'rgba(147,51,234,0.25)';
  const textPrimary = isDark ? '#F1F5F9' : '#101828';
  const textSecondary = isDark ? '#94A3B8' : '#475467';
  const cardBg = isDark ? 'rgba(192,132,252,0.04)' : '#FAFAFA';

  const features = [
    { icon: <RocketLaunchIcon />, title: 'AI workstation in a box', desc: 'A complete development environment, ready the moment you boot up.' },
    { icon: <BuildCircleIcon />, title: 'Zero setup required', desc: 'Every Zoth tool pre-installed. No packages to chase, no configs to tweak.' },
    { icon: <SmartToyIcon />, title: 'Local AI models included', desc: 'Run language models privately on your own hardware — no cloud needed.' },
    { icon: <UsbIcon />, title: 'Boot from USB or VM', desc: 'Flash to a thumb drive or spin up a virtual machine. Your choice.' },
  ];

  const builtFor = [
    'Developers who want a turnkey AI environment',
    'Privacy-focused teams needing air-gapped setups',
    'Anyone tired of dependency hell',
  ];

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={['ZOTH OS', 'KVM', 'HYPERVISOR']}
          themeColor="purple"
          subtitle="Hardware-Isolated Linux KVM Virtualization & WebContainer Sandbox"
          onComplete={() => setIntroDone(true)}
        />
      )}

      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
          {/* Hero */}
          <HeroReveal>
            <HeroItem>
              <GlowLine color={accent} glowColor={accentGlow} />
            </HeroItem>
            <HeroItem>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: mono,
                  fontWeight: 900,
                  color: textPrimary,
                  mt: 4,
                  fontSize: { xs: '2rem', md: '3rem' },
                  letterSpacing: '-0.03em',
                }}
              >
                Your AI operating system.{' '}
                <Box component="span" sx={{ color: accent }}>Ready to boot.</Box>
              </Typography>
            </HeroItem>
            <HeroItem>
              <Typography sx={{ color: textSecondary, mt: 2, fontSize: '1.15rem', maxWidth: 600 }}>
                A complete Linux distro built for AI development — every tool installed, local models loaded, security hardened. Just flash and go.
              </Typography>
            </HeroItem>
          </HeroReveal>

          {/* Feature Cards */}
          <StaggerChildren sx={{ mt: 8 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {features.map((f, i) => (
                <StaggerItem key={i}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: cardBg,
                      border: `1px solid ${accentBorder}`,
                      transition: 'border-color 0.3s',
                      '&:hover': { borderColor: accent },
                    }}
                  >
                    <Box sx={{ color: accent, mb: 1.5, '& svg': { fontSize: 28 } }}>{f.icon}</Box>
                    <Typography sx={{ fontFamily: mono, fontWeight: 700, color: textPrimary, fontSize: '1rem', mb: 0.5 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.6 }}>
                      {f.desc}
                    </Typography>
                  </Paper>
                </StaggerItem>
              ))}
            </Box>
          </StaggerChildren>

          {/* Built For */}
          <RevealOnScroll>
            <Box sx={{ mt: 10, mb: 2 }}>
              <Typography
                variant="overline"
                sx={{ fontFamily: mono, color: accent, letterSpacing: '0.15em', fontSize: '0.75rem' }}
              >
                Built For
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {builtFor.map((line, i) => (
                  <Typography key={i} sx={{ color: textSecondary, fontSize: '1.05rem', pl: 2, borderLeft: `2px solid ${accentBorder}` }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            </Box>
          </RevealOnScroll>

          {/* CTA */}
          <RevealOnScroll>
            <Box sx={{ mt: 10, mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component={RouterLink}
                to="/zoth-os/docs"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  bgcolor: accent,
                  color: '#08080B',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: isDark ? '#D8B4FE' : '#7C3AED' },
                }}
              >
                Download Zoth OS →
              </Button>
              <Button
                variant="outlined"
                href="https://github.com/NullAITech/zoth-os"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  color: accent,
                  borderColor: accentBorder,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { borderColor: accent, bgcolor: accentWash },
                }}
              >
                View on GitHub →
              </Button>
            </Box>
          </RevealOnScroll>
        </Container>
    </>
  );
}
