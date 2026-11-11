import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SEO from '../components/SEO';
import { resolveRouteIntro } from '../motion/routeIntros';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const serif = '"Cormorant Garamond", Georgia, serif';

const ROUTE_INDEX = [
  { path: '/', introKey: 'home', desc: 'Flagship overview, 77-tool local repository index, and six core systems.' },
  { path: '/arsenal', introKey: 'arsenal', desc: 'Complete searchable 77-tool local repository matrix with grid and list views.' },
  { path: '/tools', introKey: 'tools', desc: 'Categorized standalone CLI and loopback daemon repository directory.' },
  { path: '/workstations', introKey: 'workstations', desc: '18 role-specialized workstation cadres and port topology.' },
  { path: '/zoth-os', introKey: 'zoth-os', desc: 'ZothOS v3.4.0 (Debian 13 + KDE Plasma 6) and ZothOS-Lite v1.2 amnesic edition.' },
  { path: '/swarm', introKey: 'swarm', desc: 'Pantheon 21-agent multiplexer (:8141), Zoth Egregore, and Zoth Civilization (:9393).' },
  { path: '/memory', introKey: 'memory', desc: 'Neuro-Memory STDP synaptic SQLite WAL daemon (:8094) and MCP recall.' },
  { path: '/webgen', introKey: 'webgen', desc: 'Local 6-framework web compiler with Schema.org AEO and viewport guardrails.' },
  { path: '/hexstrike', introKey: 'hexstrike', desc: 'Local security audit terminal, CVE correlation, and entropy inspection.' },
  { path: '/adytum', introKey: 'adytum', desc: '22-stage JSON Schema-validated local AI workflow orchestrator.' },
  { path: '/ax', introKey: 'ax', desc: 'Agent Experience (AX) manifests, /.well-known/mcp.json, and /llms.txt.' },
  { path: '/consensus', introKey: 'consensus', desc: 'Byzantine N >= 3f + 1 multi-model quorum and ground-truth verification.' },
  { path: '/bridges', introKey: 'bridges', desc: 'Loopback-bound MCP stdio/SSE bridges and encrypted WireGuard/Tailscale mesh.' },
  { path: '/voice', introKey: 'voice', desc: 'Local Whisper STT and Kokoro/Piper neural TTS voice pipeline (:8114).' },
  { path: '/agora', introKey: 'agora', desc: 'Structured adversarial multi-agent debate and Socratic design verification.' },
  { path: '/vaelor', introKey: 'vaelor', desc: 'Feeless local DAG ledger specification for cryptographic agent task receipts.' },
  { path: '/docs', introKey: 'docs', desc: 'Master architectural codex, CLI cheat sheets, and security invariants.' },
  { path: '/docs/math', introKey: 'math', desc: 'Six closed-form mathematical pillars: linear algebra, STDP, and Lyapunov proofs.' },
];

export default function GalleryPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const pageBg = isDark ? '#08080B' : '#FAF8F3';
  const cardBg = isDark ? '#0E1016' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F1E6' : '#101828';
  const textSecondary = isDark ? '#A8A29E' : '#334155';
  const hairline = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(16, 24, 40, 0.12)';
  const gold = isDark ? '#D4AF37' : '#7A5808';

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: '100vh', color: textPrimary }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <SEO
          title="Studio Directory & Intro Choreography // Zoth Studio v2"
          description="Interactive route index and 60fps Sub-Pixel Unicode Braille + Bayer 8x8 Dither aperture intro choreography across Zoth Studio v2."
          path="/gallery"
        />

        <Box sx={{ pb: 4, mb: 5, borderBottom: `1px solid ${hairline}` }}>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: gold,
              mb: 1.25,
            }}
          >
            STUDIO ROUTE INDEX & MOTION ARCHITECTURE
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontFamily: serif,
              fontWeight: 600,
              fontSize: { xs: '2.3rem', sm: '3.1rem', md: '3.6rem' },
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: textPrimary,
              mb: 2,
            }}
          >
            Editorial Aperture & Route Directory
          </Typography>
          <Typography
            sx={{
              maxWidth: 740,
              fontSize: { xs: '0.98rem', md: '1.08rem' },
              lineHeight: 1.68,
              color: textSecondary,
            }}
          >
            Every primary route in Zoth Studio v2 opens through a procedural 60fps Unicode U+2800 Sub-Pixel Braille and Ordered Bayer 8x8 Dither emblem stage before parting along a horizontal center-seam aperture. Select any route below to inspect its live layout or preview its full intro sequence.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 2.5,
          }}
        >
          {ROUTE_INDEX.map((item) => {
            const meta = resolveRouteIntro(item.path) || resolveRouteIntro('/');
            const accent = isDark ? meta.accent : (meta.accentLight || gold);

            return (
              <Paper
                key={item.path}
                elevation={0}
                sx={{
                  p: 2.75,
                  borderRadius: 2.5,
                  bgcolor: cardBg,
                  border: `1px solid ${hairline}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: accent,
                        textTransform: 'uppercase',
                      }}
                    >
                      {meta.kicker}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: textSecondary }}>
                      {item.path}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: serif,
                      fontWeight: 600,
                      fontSize: '1.45rem',
                      color: textPrimary,
                      mb: 0.75,
                      lineHeight: 1.15,
                    }}
                  >
                    {meta.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', lineHeight: 1.6, color: textSecondary }}>
                    {item.desc}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    component={RouterLink}
                    to={item.path}
                    size="small"
                    variant="contained"
                    disableElevation
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      bgcolor: isDark ? accent : '#101828',
                      color: isDark ? '#08080B' : '#FFFFFF',
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 1.25,
                      '&:hover': {
                        bgcolor: isDark ? '#F5F1E6' : '#1E293B',
                        color: isDark ? '#08080B' : '#FFFFFF',
                      },
                    }}
                  >
                    Open Route
                  </Button>
                  <Button
                    component={RouterLink}
                    to={`${item.path}?intro=1`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: hairline,
                      color: textPrimary,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 1.25,
                      '&:hover': { borderColor: accent, color: accent },
                    }}
                  >
                    Preview Intro
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
