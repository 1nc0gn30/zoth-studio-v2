import React, { useState, useMemo } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, Paper, ToggleButtonGroup, ToggleButton,
  IconButton, Tooltip, Stack, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TerminalIcon from '@mui/icons-material/Terminal';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ClearIcon from '@mui/icons-material/Clear';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import LayersIcon from '@mui/icons-material/Layers';
import PaletteIcon from '@mui/icons-material/Palette';
import HubIcon from '@mui/icons-material/Hub';
import ComputerIcon from '@mui/icons-material/Computer';
import HandymanIcon from '@mui/icons-material/Handyman';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { masterArsenal, arsenalStats } from '../data/arsenalData';
import { useStudioStatus } from '../studio/useStudioStatus';
import SovereignFunnel from '../components/SovereignFunnel';

const CLASSIC = 'http://127.0.0.1:8088';
const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const ORDERED_BANDS = [
  'Build',
  'Observe',
  'Security',
  'Spatial',
  'Studio',
  'Swarm & Consensus'
];

const BAND_CONFIG = {
  'Build': {
    color: '#F59E0B',
    lightColor: '#B45309',
    wash: 'rgba(245, 158, 11, 0.14)',
    lightWash: '#FFFBEB',
    border: 'rgba(245, 158, 11, 0.35)',
    icon: CodeIcon,
    description: 'Autonomous compilation pipelines, code foundries & WebContainer sandboxes',
  },
  'Observe': {
    color: '#38BDF8',
    lightColor: '#0369A1',
    wash: 'rgba(56, 189, 248, 0.14)',
    lightWash: '#F0F9FF',
    border: 'rgba(56, 189, 248, 0.35)',
    icon: VisibilityIcon,
    description: 'Telemetry arrays, horizon chronicles & mathematical theory academy',
  },
  'Swarm & Consensus': {
    color: '#34D399',
    lightColor: '#059669',
    wash: 'rgba(52, 211, 153, 0.14)',
    lightWash: '#ECFDF5',
    border: 'rgba(52, 211, 153, 0.35)',
    icon: HubIcon,
    description: '3-agent Byzantine AST synthesis, signal bridges & swarm multiplexers',
  },
  'Security': {
    color: '#F87171',
    lightColor: '#DC2626',
    wash: 'rgba(248, 113, 113, 0.14)',
    lightWash: '#FEF2F2',
    border: 'rgba(248, 113, 113, 0.35)',
    icon: SecurityIcon,
    description: 'Shannon entropy monitors, threat simulation & air-gapped vaults',
  },
  'Spatial': {
    color: '#C084FC',
    lightColor: '#7E22CE',
    wash: 'rgba(192, 132, 252, 0.14)',
    lightWash: '#FAF5FF',
    border: 'rgba(192, 132, 252, 0.35)',
    icon: LayersIcon,
    description: 'Nexus 3D Omniverse viewports, spatial engines & visual linkages',
  },
  'Studio': {
    color: '#EC4899',
    lightColor: '#BE185D',
    wash: 'rgba(236, 72, 153, 0.14)',
    lightWash: '#FDF2F8',
    border: 'rgba(236, 72, 153, 0.35)',
    icon: PaletteIcon,
    description: 'Sovereign netrunner memory hubs, design tokens & alchemical seals',
  },
};

function getBandConfig(bandName, isDark) {
  const base = BAND_CONFIG[bandName];
  if (!base) return null;
  return {
    ...base,
    color: isDark ? base.color : base.lightColor,
    wash: isDark ? base.wash : base.lightWash,
    border: isDark ? base.border : base.border,
  };
}

function UnifiedAssetCard({ item, classicUp, isDark, gold }) {
  const [copied, setCopied] = useState(false);
  const bandCfg = getBandConfig(item.band, isDark) || {
    color: gold.accent,
    wash: gold.wash,
    border: gold.border,
    icon: ComputerIcon
  };
  const BandIconComponent = bandCfg.icon;

  const isEnclave = item.kind === 'enclave';
  const isCockpit = item.kind === 'cockpit';
  const isTool = item.kind === 'tool';

  const handleCopyPull = (e) => {
    e.stopPropagation();
    if (!item.pullCommand) return;
    try {
      navigator.clipboard.writeText(item.pullCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isDark ? '#26262F' : '#EAECF0',
        bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(16, 24, 40, 0.05)',
        transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
        '&:hover': {
          borderColor: isEnclave ? '#A78BFA' : isCockpit ? gold.accent : '#38BDF8',
          transform: 'translateY(-3px)',
          boxShadow: isDark
            ? '0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.25)'
            : '0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 0 0 1px rgba(184, 134, 11, 0.25)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.5 }}>
        {/* Top Badges: Cadre Type & Architectural Band */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          {isEnclave ? (
            <Chip
              size="small"
              icon={<HubIcon sx={{ fontSize: '0.85rem !important', color: `${isDark ? '#A78BFA' : '#7C3AED'} !important` }} />}
              label="HARDWARE ENCLAVE"
              sx={{
                height: 24,
                fontSize: '0.68rem',
                fontWeight: 800,
                fontFamily: mono,
                bgcolor: isDark ? 'rgba(167, 139, 250, 0.12)' : '#FAF5FF',
                color: isDark ? '#A78BFA' : '#7C3AED',
                border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.3)' : '#DDD6FE'}`,
              }}
            />
          ) : isCockpit ? (
            <Chip
              size="small"
              icon={<TerminalIcon sx={{ fontSize: '0.85rem !important', color: `${gold.accent} !important` }} />}
              label="STUDIO COCKPIT"
              sx={{
                height: 24,
                fontSize: '0.68rem',
                fontWeight: 800,
                fontFamily: mono,
                bgcolor: gold.wash,
                color: gold.accent,
                border: `1px solid ${gold.border}`,
              }}
            />
          ) : (
            <Chip
              size="small"
              icon={<HandymanIcon sx={{ fontSize: '0.85rem !important', color: `${isDark ? '#38BDF8' : '#0284C7'} !important` }} />}
              label={item.badge || 'SOVEREIGN TOOL'}
              sx={{
                height: 24,
                fontSize: '0.68rem',
                fontWeight: 800,
                fontFamily: mono,
                bgcolor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#F0F9FF',
                color: isDark ? '#38BDF8' : '#0284C7',
                border: `1px solid ${isDark ? 'rgba(56, 189, 248, 0.3)' : '#BAE6FD'}`,
              }}
            />
          )}

          <Chip
            size="small"
            icon={<BandIconComponent sx={{ fontSize: '0.85rem !important', color: `${bandCfg.color} !important` }} />}
            label={item.band}
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 800,
              fontFamily: mono,
              bgcolor: bandCfg.wash,
              color: bandCfg.color,
              border: `1px solid ${bandCfg.border}`,
            }}
          />
        </Box>

        {/* Asset Name */}
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.05rem',
            fontWeight: 800,
            lineHeight: 1.35,
            mb: 1,
            color: isDark ? '#EDEFF2' : '#101828',
          }}
        >
          {item.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.84rem',
            lineHeight: 1.55,
            mb: 1.5,
          }}
        >
          {item.description}
        </Typography>

        {/* Asset ID & Zero-Egress verified */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.68rem', color: gold.accent, fontWeight: 700 }}>
                ID:
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#9CA3AF' : '#374151', bgcolor: isDark ? '#14141E' : '#F3F4F6', px: 0.8, py: 0.2, borderRadius: 1, border: `1px solid ${isDark ? '#26262F' : '#E5E7EB'}` }}>
                {item.id}
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={<VerifiedUserIcon sx={{ fontSize: '0.75rem !important', color: `${isDark ? '#34D399' : '#047857'} !important` }} />}
              label="Zero-Egress"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 750,
                fontFamily: mono,
                bgcolor: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ECFDF3',
                color: isDark ? '#34D399' : '#047857',
                border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(4, 120, 87, 0.3)'}`,
              }}
            />
          </Box>

          {/* Copyable pull command */}
          {item.pullCommand && (
            <Box
              onClick={handleCopyPull}
              sx={{
                cursor: 'pointer',
                p: 0.75,
                px: 1,
                borderRadius: 1.5,
                bgcolor: isDark ? '#08080C' : '#F3F4F6',
                border: `1px solid ${isDark ? '#26262F' : '#E5E7EB'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                '&:hover': {
                  borderColor: isTool ? '#38BDF8' : gold.accent,
                  bgcolor: isDark ? '#0E1118' : '#EDEFEF',
                },
                transition: 'all 0.18s ease',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  color: isDark ? '#9CA3AF' : '#4B5563',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.pullCommand}
              </Typography>
              {copied ? (
                <CheckIcon sx={{ fontSize: '0.85rem', color: '#10B981', flexShrink: 0 }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: '0.8rem', color: 'text.secondary', flexShrink: 0 }} />
              )}
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        {isEnclave ? (
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={item.target}
            startIcon={<HubIcon sx={{ fontSize: '0.95rem' }} />}
            sx={{
              bgcolor: isDark ? '#A78BFA' : '#7C3AED',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.78rem',
              px: 2.5,
              py: 0.6,
              borderRadius: 9999,
              boxShadow: '0 2px 10px rgba(167, 139, 250, 0.3)',
              '&:hover': {
                bgcolor: isDark ? '#C4B5FD' : '#6D28D9',
                color: isDark ? '#0B0B12' : '#FFFFFF',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Enter Enclave Hub ↗
          </Button>
        ) : isCockpit ? (
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={item.target}
            startIcon={<PlayArrowIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              bgcolor: gold.accent,
              color: '#101828',
              fontWeight: 800,
              fontSize: '0.8rem',
              px: 2.5,
              py: 0.6,
              borderRadius: 9999,
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
              '&:hover': {
                bgcolor: '#F3D56A',
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.45)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Launch Cockpit
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={item.target}
            startIcon={<RocketLaunchIcon sx={{ fontSize: '0.95rem' }} />}
            sx={{
              bgcolor: isDark ? '#38BDF8' : '#0284C7',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.78rem',
              px: 2.5,
              py: 0.6,
              borderRadius: 9999,
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
              '&:hover': {
                bgcolor: isDark ? '#7DD3FC' : '#0369A1',
                color: isDark ? '#0B0B12' : '#FFFFFF',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Launch Tool ↗
          </Button>
        )}

        {classicUp && item.kind === 'cockpit' && (
          <Button
            size="small"
            variant="text"
            endIcon={<LaunchIcon sx={{ fontSize: '0.8rem' }} />}
            href={`${CLASSIC}/studio/${item.id}.html`}
            target="_blank"
            rel="noreferrer"
            sx={{
              color: isDark ? '#9CA3AF' : '#6B7280',
              fontSize: '0.73rem',
              fontFamily: mono,
              p: 0.5,
              '&:hover': { color: gold.accent },
            }}
          >
            Classic (:8088)
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default function ArsenalPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const location = useLocation();
  const isDark = theme.palette.mode === 'dark';

  // Determine initial kind filter from path
  const initialKind = useMemo(() => {
    if (location.pathname === '/tools') return 'tool';
    if (location.pathname === '/workstations') return 'cockpit';
    return 'all';
  }, [location.pathname]);

  const [kindFilter, setKindFilter] = useState(initialKind); // 'all' | 'enclave' | 'cockpit' | 'tool'
  const [bandFilter, setBandFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { status } = useStudioStatus();
  const classicUp = Boolean(status?.services?.classic?.up);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.28)' : 'rgba(184,134,11,0.25)',
  };

  // Precomputed band counts
  const bandCounts = useMemo(() => {
    const counts = {};
    for (const item of masterArsenal) {
      counts[item.band] = (counts[item.band] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered assets
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return masterArsenal.filter((item) => {
      const inKind = kindFilter === 'all' || item.kind === kindFilter;
      if (!inKind) return false;
      const inBand = bandFilter === 'All' || item.band === bandFilter;
      if (!inBand) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.band.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.pullCommand && item.pullCommand.toLowerCase().includes(q))
      );
    });
  }, [kindFilter, bandFilter, search]);

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["ZOTH", "SOVEREIGN", "ARSENAL"]}
          themeColor="gold"
          subtitle="UNIFIED COMMAND MATRIX"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Page Header */}
        <HeroReveal>
          <Box sx={{ mb: 3 }}>
            <HeroItem>
              <Typography variant="overline" sx={{ color: gold.accent, letterSpacing: '0.18em', fontWeight: 800, display: 'block', mb: 1 }}>
                SOVEREIGN COMMAND HUB &amp; ARSENAL
              </Typography>
            </HeroItem>
            <HeroItem>
              <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', mb: 1, color: isDark ? '#EDEFF2' : '#101828' }}>
                The Sovereign Arsenal
              </Typography>
            </HeroItem>
            <HeroItem>
              <Typography color="text.secondary" sx={{ maxWidth: 880, fontSize: '1.05rem', lineHeight: 1.6 }}>
                One unified directory consolidating all 49 sovereign assets: air-gapped developer cockpits, standalone micro-tools, and zero-egress hardware enclaves. Everything executes strictly on local hardware with zero external cloud dependencies.
              </Typography>
            </HeroItem>
          </Box>
        </HeroReveal>

        {/* Telemetry Stats Bar */}
        <RevealOnScroll preset="fadeUp" delay={0.2}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              mb: 3.5,
              borderRadius: 3,
              bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
              border: '1px solid',
              borderColor: isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.2)',
              boxShadow: isDark
                ? '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.1)'
                : '0 2px 12px rgba(16,24,40,0.06)',
            }}
          >
            <Grid container spacing={2.5} alignItems="center">
              {/* Stat 1: Total Sovereign Assets */}
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(212,175,55,0.12)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      color: gold.accent,
                      flexShrink: 0,
                    }}
                  >
                    <TerminalIcon sx={{ fontSize: '1.35rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, lineHeight: 1.15 }}>
                      {masterArsenal.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      {arsenalStats.cockpits} Cockpits · {arsenalStats.tools} Tools · {arsenalStats.enclaves} Enclaves
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Stat 2: 6 Architectural Bands */}
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDark ? 'rgba(56,189,248,0.12)' : '#F0F9FF',
                      border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : '#BAE6FD'}`,
                      color: isDark ? '#38BDF8' : '#0284C7',
                      flexShrink: 0,
                    }}
                  >
                    <AccountTreeIcon sx={{ fontSize: '1.35rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#EDEFF2' : '#101828', lineHeight: 1.15 }}>
                      6
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      Architectural Cadres
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Stat 3: Zero Cloud Dependencies (100% Loopback) */}
              <Grid xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
                      border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
                      color: isDark ? '#34D399' : '#047857',
                      flexShrink: 0,
                    }}
                  >
                    <CloudOffIcon sx={{ fontSize: '1.35rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#34D399' : '#047857', lineHeight: 1.2 }}>
                      100% Loopback
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      Zero Telemetry / Air-Gapped
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Stat 4: Classic Server Dual-Runtime */}
              <Grid xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 1.25,
                    px: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: classicUp ? (isDark ? 'rgba(52,211,153,0.35)' : '#A7F3D0') : (isDark ? '#26262F' : '#EAECF0'),
                    bgcolor: classicUp
                      ? (isDark ? 'rgba(52,211,153,0.08)' : '#ECFDF3')
                      : (isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.25,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: classicUp ? (isDark ? '#34D399' : '#059669') : '#6B7280',
                        boxShadow: classicUp ? (isDark ? '0 0 8px #34D399' : '0 0 6px rgba(5,150,105,0.4)') : 'none',
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: classicUp ? (isDark ? '#34D399' : '#047857') : 'text.primary', lineHeight: 1.2 }}>
                        {classicUp ? 'Legacy Server Online · :8088' : 'Legacy Server Offline'}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary', fontFamily: mono }}>
                        {classicUp ? 'Dual runtime active' : 'Not Required · v2 Native'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    size="small"
                    label={classicUp ? ':8088 UP' : 'OFFLINE'}
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      fontFamily: mono,
                      bgcolor: classicUp ? (isDark ? 'rgba(52,211,153,0.2)' : '#D1FAE5') : (isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'),
                      color: classicUp ? (isDark ? '#34D399' : '#047857') : 'text.secondary',
                      border: `1px solid ${classicUp ? (isDark ? 'rgba(52,211,153,0.4)' : '#6EE7B7') : (isDark ? '#374151' : '#D1D5DB')}`,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </RevealOnScroll>

        {/* Primary Cadre Segment Tabs */}
        <RevealOnScroll preset="fadeUp" delay={0.25}>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              mb: 3,
              alignItems: 'center',
            }}
          >
            {[
              { id: 'all', label: `All Capabilities (${masterArsenal.length})`, icon: GridViewIcon, color: gold.accent },
              { id: 'cockpit', label: `Studio Cockpits & IDEs (${arsenalStats.cockpits})`, icon: TerminalIcon, color: gold.accent },
              { id: 'tool', label: `Sovereign Micro-Tools (${arsenalStats.tools})`, icon: HandymanIcon, color: '#38BDF8' },
              { id: 'enclave', label: `Hardware Enclaves (${arsenalStats.enclaves})`, icon: HubIcon, color: '#A78BFA' },
            ].map((tab) => {
              const active = kindFilter === tab.id;
              const IconComp = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={active ? 'contained' : 'outlined'}
                  onClick={() => setKindFilter(tab.id)}
                  startIcon={<IconComp sx={{ fontSize: '1.05rem !important' }} />}
                  sx={{
                    px: 2.25,
                    py: 1,
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textTransform: 'none',
                    bgcolor: active ? gold.accent : (isDark ? '#0B0B12' : '#FFFFFF'),
                    color: active ? '#101828' : (isDark ? '#EDEFF2' : '#374151'),
                    borderColor: active ? gold.accent : (isDark ? 'rgba(212,175,55,0.25)' : '#D1D5DB'),
                    boxShadow: active ? '0 2px 12px rgba(212,175,55,0.3)' : 'none',
                    '&:hover': {
                      bgcolor: active ? '#F3D56A' : (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7'),
                      borderColor: gold.accent,
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>
        </RevealOnScroll>

        {/* Control Bar: Dual-View & Search */}
        <RevealOnScroll preset="fadeUp" delay={0.3}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              mb: 2.5,
            }}
          >
            {/* Band Filter Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                label={`All Bands · ${masterArsenal.length}`}
                clickable
                onClick={() => setBandFilter('All')}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  fontFamily: mono,
                  bgcolor: bandFilter === 'All' ? gold.accent : (isDark ? '#0B0B12' : '#FFFFFF'),
                  color: bandFilter === 'All' ? '#101828' : 'text.primary',
                  border: '1px solid',
                  borderColor: bandFilter === 'All' ? gold.accent : (isDark ? '#26262F' : '#EAECF0'),
                  '&:hover': {
                    borderColor: gold.accent,
                    bgcolor: bandFilter === 'All' ? gold.accent : (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7'),
                  },
                  transition: 'all 0.18s ease',
                }}
              />
              {ORDERED_BANDS.map((item) => {
                const active = item === bandFilter;
                const count = bandCounts[item] || 0;
                const cfg = getBandConfig(item, isDark);
                const IconComp = cfg.icon;

                return (
                  <Chip
                    key={item}
                    icon={<IconComp sx={{ fontSize: '0.85rem !important', color: active ? '#101828 !important' : `${cfg.color} !important` }} />}
                    label={`${item} · ${count}`}
                    clickable
                    onClick={() => setBandFilter(item)}
                    sx={{
                      fontWeight: 750,
                      fontSize: '0.8rem',
                      fontFamily: mono,
                      bgcolor: active ? gold.accent : (isDark ? '#0B0B12' : '#FFFFFF'),
                      color: active ? '#101828' : 'text.primary',
                      border: '1px solid',
                      borderColor: active ? gold.accent : (isDark ? '#26262F' : '#EAECF0'),
                      '&:hover': {
                        borderColor: cfg.color,
                        bgcolor: active ? gold.accent : (isDark ? cfg.wash : '#FEF9E7'),
                      },
                      transition: 'all 0.18s ease',
                    }}
                  />
                );
              })}
            </Box>

            {/* Instant Search Input */}
            <TextField
              size="small"
              placeholder="Search across all 49 assets by name, ID, command..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: gold.accent }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} sx={{ color: 'text.secondary' }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                minWidth: { xs: '100%', md: 360 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(212,175,55,0.22)' : 'rgba(184,134,11,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: gold.accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: gold.accent,
                  },
                },
              }}
            />
          </Box>
        </RevealOnScroll>

        {/* Results Counter & Reset */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: mono, fontSize: '0.85rem' }}>
            Showing <strong>{filtered.length}</strong> of <strong>{masterArsenal.length}</strong> sovereign assets
            {kindFilter !== 'all' && <span> in <strong>{kindFilter === 'enclave' ? 'Hardware Enclaves' : kindFilter === 'cockpit' ? 'Studio Cockpits' : 'Sovereign Tools'}</strong></span>}
            {bandFilter !== 'All' && <span> in cadre <strong>{bandFilter}</strong></span>}
            {search.trim() && <span> matching &ldquo;{search.trim()}&rdquo;</span>}
          </Typography>

          {(kindFilter !== 'all' || bandFilter !== 'All' || search) && (
            <Button
              size="small"
              onClick={() => {
                setKindFilter('all');
                setBandFilter('All');
                setSearch('');
              }}
              sx={{ color: gold.accent, fontSize: '0.78rem', textTransform: 'none', fontWeight: 750 }}
            >
              Reset All Filters
            </Button>
          )}
        </Box>

        {/* Master Asset Grid */}
        {filtered.length === 0 ? (
          <Paper
            sx={{
              p: 5,
              textAlign: 'center',
              bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
              border: '1px dashed',
              borderColor: isDark ? '#26262F' : '#EAECF0',
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: gold.accent, mb: 1 }}>
              No sovereign capabilities matched your search
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try clearing your search query or selecting &ldquo;All Capabilities&rdquo;.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setKindFilter('all');
                setBandFilter('All');
                setSearch('');
              }}
              sx={{ borderColor: gold.accent, color: gold.accent }}
            >
              Reset Filters
            </Button>
          </Paper>
        ) : (
          <StaggerChildren>
            <Grid container spacing={3}>
              {filtered.map((item) => (
                <Grid xs={12} sm={6} md={4} key={`${item.kind}-${item.id}`}>
                  <StaggerItem>
                    <UnifiedAssetCard item={item} classicUp={classicUp} isDark={isDark} gold={gold} />
                  </StaggerItem>
                </Grid>
              ))}
            </Grid>
          </StaggerChildren>
        )}

        {/* Sovereign Funnel */}
        <SovereignFunnel
          title="Deploy the Entire Sovereign Arsenal Locally"
          subtitle="Run all 49 studio cockpits, standalone micro-tools, and hardware enclaves on your own bare metal with complete zero-telemetry air-gap guarantees."
          toolTitle="Zoth Sovereign Suite"
          toolTag="FULL ARSENAL"
          toolDescription="Complete local-first developer environment for autonomous AI pantheons. Binds strictly to 127.0.0.1 with zero egress sockets."
          toolRepo="https://github.com/NullAITech/zoth-studio-v2"
          toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && cd zoth-studio-v2 && npm install && npm run dev"
          sx={{ mt: 6 }}
        />
      </Container>
    </>
  );
}
