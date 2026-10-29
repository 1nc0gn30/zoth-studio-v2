import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Stack, Button, Chip, Grid, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import HubIcon from '@mui/icons-material/Hub';
import MemoryIcon from '@mui/icons-material/Memory';
import { renderBrailleDitherLines, useGlyphScramble } from '../motion/AsciiBrailleDitherEngine';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const SHAPES = [
  { id: 'astrolabe', label: 'Astrolabe SDF', sub: 'Orbital Armillary' },
  { id: 'shield', label: 'ZothOS v3.3 Shield', sub: 'Kernel + Tor Onion' },
  { id: 'dag', label: 'Vaelor L1 DAG', sub: '100-Agent PoUW' },
  { id: 'synapse', label: 'STDP Synapse', sub: 'Biomorphic Memory' },
  { id: 'hex', label: 'HexStrike Radar', sub: '28 Red-Team Modules' },
  { id: 'quorum', label: 'Byzantine Quorum', sub: '3-Model Consensus' },
];

const RENDER_MODES = [
  { id: 'hybrid', label: 'Hybrid Braille + Bayer 8×8' },
  { id: 'braille', label: 'Pure U+2800 Braille (2×4)' },
  { id: 'ascii', label: 'Ordered ASCII Ramp' },
];

function SplitFlapTile({ label, value, sub, statusColor = '#10B981', dark, to, href }) {
  const scrambledValue = useGlyphScramble(value, 420, true);
  const CardWrapper = to ? RouterLink : href ? 'a' : 'div';
  const linkProps = to
    ? { to, style: { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' } }
    : href
    ? { href, target: '_blank', rel: 'noopener noreferrer', style: { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' } }
    : { style: { height: '100%' } };

  return (
    <CardWrapper {...linkProps}>
      <Box
        sx={{
          p: 2,
          height: '100%',
          borderRadius: 2.5,
          bgcolor: dark ? 'rgba(13, 16, 23, 0.92)' : '#FFFFFF',
          border: '1px solid',
          borderColor: dark ? 'rgba(212, 175, 55, 0.18)' : '#E6E1D6',
          boxShadow: dark
            ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 20px -6px rgba(0,0,0,0.6)'
            : '0 1px 2px rgba(16, 24, 40, 0.04), 0 6px 16px -4px rgba(16, 24, 40, 0.05)',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: dark ? '#D4AF37' : '#8A6508',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.66rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: dark ? '#94A3B8' : '#475467',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />
        </Stack>

        {/* Mechanical Split-Flap Display Strip */}
        <Box
          sx={{
            px: 1.25,
            py: 0.75,
            mb: 1,
            borderRadius: 1.5,
            bgcolor: dark ? '#06070A' : '#F4F0E6',
            border: '1px solid',
            borderColor: dark ? 'rgba(255,255,255,0.08)' : '#DCD5C5',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '1px',
              bgcolor: dark ? 'rgba(0,0,0,0.65)' : 'rgba(16,24,40,0.08)',
              pointerEvents: 'none',
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: { xs: '0.92rem', sm: '1.02rem' },
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: dark ? '#F5E6AB' : '#101828',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {scrambledValue}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.68rem',
            color: dark ? '#9CA3AF' : '#475467',
            lineHeight: 1.4,
          }}
        >
          {sub}
        </Typography>
      </Box>
    </CardWrapper>
  );
}

export default function UncommonTelemetryDeck({ compact = false }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const { status: studioStatus } = useStudioStatus();

  const [shape, setShape] = useState('astrolabe');
  const [renderMode, setRenderMode] = useState('hybrid');
  const [lines, setLines] = useState(() =>
    renderBrailleDitherLines({ cols: 48, rows: 14, shape: 'astrolabe', t: 0, mode: 'hybrid' })
  );

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) * 0.0014;
      setLines(renderBrailleDitherLines({ cols: 48, rows: compact ? 11 : 14, shape, t, mode: renderMode }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shape, renderMode, compact]);

  const civDay = studioStatus?.services?.civilization?.detail?.day || 1;
  const activeShapeMeta = SHAPES.find((s) => s.id === shape) || SHAPES[0];

  const triggerIntroReplay = (mode) => {
    window.dispatchEvent(new CustomEvent('zoth:replay-intro', { detail: { mode } }));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 3.5,
        bgcolor: dark ? 'rgba(10, 12, 18, 0.88)' : '#FFFFFF',
        border: '1px solid',
        borderColor: dark ? 'rgba(212, 175, 55, 0.24)' : '#E6E1D6',
        boxShadow: dark
          ? '0 20px 50px -12px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 2px 4px rgba(16,24,40,0.03), 0 16px 36px -8px rgba(16,24,40,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Bar */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
            <Chip
              label="⣿ U+2800 SUB-PIXEL BRAILLE · BAYER 8×8 DITHER"
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                bgcolor: dark ? 'rgba(212, 175, 55, 0.14)' : '#FEF9E7',
                color: dark ? '#F5E6AB' : '#8A6508',
                border: '1px solid',
                borderColor: dark ? 'rgba(212, 175, 55, 0.35)' : '#E8D48B',
              }}
            />
            <Chip
              label="MACHINE TELEMETRY · 17/17 DAEMONS ACTIVE"
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.66rem',
                fontWeight: 800,
                bgcolor: dark ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
                color: dark ? '#34D399' : '#047857',
                border: '1px solid',
                borderColor: dark ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
              }}
            />
          </Stack>
          <Typography
            variant="h4"
            sx={{
              fontFamily: display,
              fontSize: { xs: '1.55rem', md: '2rem' },
              color: dark ? '#F9FAFB' : '#101828',
              letterSpacing: '0.01em',
            }}
          >
            Sovereign Machine Telemetry + Live Braille Dither Engine
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeMotionIcon />}
            onClick={() => triggerIntroReplay('wipe')}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              borderColor: dark ? 'rgba(212, 175, 55, 0.45)' : '#8A6508',
              color: dark ? '#F5E6AB' : '#8A6508',
              '&:hover': {
                borderColor: dark ? '#D4AF37' : '#6D4C05',
                bgcolor: dark ? 'rgba(212,175,55,0.08)' : 'rgba(138,101,8,0.06)',
              },
            }}
          >
            Replay Braille Intro
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => triggerIntroReplay('full')}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 800,
            }}
          >
            Replay Cinema Cut
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5} alignItems="stretch">
        {/* Left: Interactive 60fps Unicode Braille + Bayer 8x8 Dither Viewport */}
        <Grid item xs={12} lg={6}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 2.5,
              bgcolor: dark ? '#06070A' : '#FAF8F3',
              border: '1px solid',
              borderColor: dark ? 'rgba(212, 175, 55, 0.22)' : '#DCD5C5',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
              sx={{ mb: 1.5 }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: dark ? '#D4AF37' : '#8A6508',
                  textTransform: 'uppercase',
                }}
              >
                ▣ {activeShapeMeta.label} · {activeShapeMeta.sub}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {RENDER_MODES.map((m) => (
                  <Button
                    key={m.id}
                    size="small"
                    onClick={() => setRenderMode(m.id)}
                    sx={{
                      minWidth: 0,
                      px: 1,
                      py: 0.25,
                      fontFamily: mono,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor:
                        renderMode === m.id
                          ? dark
                            ? 'rgba(212,175,55,0.22)'
                            : '#8A6508'
                          : 'transparent',
                      color:
                        renderMode === m.id
                          ? dark
                            ? '#F5E6AB'
                            : '#FFFFFF'
                          : dark
                          ? '#9CA3AF'
                          : '#475467',
                      border: '1px solid',
                      borderColor:
                        renderMode === m.id
                          ? dark
                            ? '#D4AF37'
                            : '#8A6508'
                          : dark
                          ? 'rgba(255,255,255,0.1)'
                          : '#DCD5C5',
                    }}
                  >
                    {m.id.toUpperCase()}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {/* Live 60fps Braille + Dither Canvas Text Matrix */}
            <Box
              component="pre"
              aria-label={`Live ${activeShapeMeta.label} Unicode Braille and Bayer 8x8 dither visualization`}
              sx={{
                m: 0,
                py: 1.5,
                px: 1,
                borderRadius: 2,
                bgcolor: dark ? '#040507' : '#F3EFE6',
                border: '1px solid',
                borderColor: dark ? 'rgba(255,255,255,0.06)' : '#E2DDD0',
                fontFamily: mono,
                fontSize: { xs: '0.58rem', sm: '0.72rem', md: '0.76rem' },
                lineHeight: 1.15,
                letterSpacing: '0.04em',
                color: dark ? '#D4AF37' : '#101828',
                textAlign: 'center',
                overflowX: 'auto',
                userSelect: 'none',
              }}
            >
              {lines.join('\n')}
            </Box>

            {/* Sculpture Switcher Pills */}
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              {SHAPES.map((s) => {
                const active = shape === s.id;
                return (
                  <Button
                    key={s.id}
                    size="small"
                    onClick={() => setShape(s.id)}
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      fontFamily: mono,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      bgcolor: active
                        ? dark
                          ? 'rgba(212, 175, 55, 0.2)'
                          : '#101828'
                        : dark
                        ? 'rgba(255,255,255,0.03)'
                        : '#FFFFFF',
                      color: active
                        ? dark
                          ? '#F5E6AB'
                          : '#FFFFFF'
                        : dark
                        ? '#9CA3AF'
                        : '#344054',
                      border: '1px solid',
                      borderColor: active
                        ? dark
                          ? '#D4AF37'
                          : '#101828'
                        : dark
                        ? 'rgba(255,255,255,0.08)'
                        : '#DCD5C5',
                    }}
                  >
                    {s.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Grid>

        {/* Right: Tactile Split-Flap Machine Status Grid */}
        <Grid item xs={12} lg={6}>
          <Grid container spacing={1.5} sx={{ height: '100%' }}>
            <Grid item xs={12} sm={6}>
              <SplitFlapTile
                label="PRIMARY DISTRO · ISO READY"
                value="ZOTHOS v3.3.0"
                sub="Debian 13 Trixie · KDE Plasma 6 · 4-Folder Deterministic Desktop + Multi-Size Xcursor"
                dark={dark}
                to="/zoth-os"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SplitFlapTile
                label="AMNESIC MONOTONE OS"
                value="ZOTHOS-LITE v1.0"
                sub="Tails-Style RAM-Only OS · 60fps Braille + Bayer Dither Windowed GUI (:8145)"
                dark={dark}
                to="/zoth-os"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SplitFlapTile
                label="L1 SOVEREIGN BLOCKCHAIN"
                value="VAELOR DAG :8140"
                sub="100-Agent PoUW Consensus · Hermes Agent Lab · Ed25519 + BLAKE2b"
                dark={dark}
                to="/vaelor"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SplitFlapTile
                label="SOVEREIGN 3D METAVERSE"
                value={`CIV DAY ${civDay} · :9393`}
                sub="Imperator Chronos · Surface Walk · 7 Faction Citadels + Live Agora"
                dark={dark}
                to="/swarm"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SplitFlapTile
                label="FLEET SUPERVISOR"
                value="17 / 17 DAEMONS"
                sub="Adytum :3000 · WebGen :5173 · Memory :8094 · Consensus :8096 · HexStrike :8888"
                dark={dark}
                to="/bridges"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SplitFlapTile
                label="OPEN-ACCESS ARSENAL"
                value="163 MCP · 71 TOOLS"
                sub="100% Free + Unlocked Client-Side AST, Security, AEO + AI Workstations"
                dark={dark}
                to="/arsenal"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
