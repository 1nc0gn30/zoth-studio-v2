import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, Paper, ToggleButtonGroup, ToggleButton,
  IconButton, Tooltip, Stack, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
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
import FilterListIcon from '@mui/icons-material/FilterList';

import { workstations } from '../data/workstations';
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
    lightBorder: '#FCD34D',
    icon: CodeIcon,
    description: 'Autonomous compilation pipelines, code foundries & WebContainer sandboxes',
    svgPos: { x: 460, y: 75 },
  },
  'Observe': {
    color: '#38BDF8',
    lightColor: '#0369A1',
    wash: 'rgba(56, 189, 248, 0.14)',
    lightWash: '#F0F9FF',
    border: 'rgba(56, 189, 248, 0.35)',
    lightBorder: '#BAE6FD',
    icon: VisibilityIcon,
    description: 'Telemetry arrays, horizon chronicles & mathematical theory academy',
    svgPos: { x: 740, y: 145 },
  },
  'Swarm & Consensus': {
    color: '#34D399',
    lightColor: '#059669',
    wash: 'rgba(52, 211, 153, 0.14)',
    lightWash: '#ECFDF5',
    border: 'rgba(52, 211, 153, 0.35)',
    lightBorder: '#A7F3D0',
    icon: HubIcon,
    description: '3-agent Byzantine AST synthesis, signal bridges & swarm radars',
    svgPos: { x: 740, y: 335 },
  },
  'Security': {
    color: '#F87171',
    lightColor: '#DC2626',
    wash: 'rgba(248, 113, 113, 0.14)',
    lightWash: '#FEF2F2',
    border: 'rgba(248, 113, 113, 0.35)',
    lightBorder: '#FECACA',
    icon: SecurityIcon,
    description: 'Shannon entropy monitors, threat simulation & air-gapped web3 bridges',
    svgPos: { x: 460, y: 405 },
  },
  'Spatial': {
    color: '#C084FC',
    lightColor: '#7E22CE',
    wash: 'rgba(192, 132, 252, 0.14)',
    lightWash: '#FAF5FF',
    border: 'rgba(192, 132, 252, 0.35)',
    lightBorder: '#E9D5FF',
    icon: LayersIcon,
    description: 'Nexus 3D Omniverse viewports, spatial engines & visual linkages',
    svgPos: { x: 180, y: 335 },
  },
  'Studio': {
    color: '#EC4899',
    lightColor: '#BE185D',
    wash: 'rgba(236, 72, 153, 0.14)',
    lightWash: '#FDF2F8',
    border: 'rgba(236, 72, 153, 0.35)',
    lightBorder: '#FBCFE8',
    icon: PaletteIcon,
    description: 'Sovereign netrunner memory hubs, design tokens & alchemical seals',
    svgPos: { x: 180, y: 145 },
  },
};

function getBandConfig(bandName, isDark) {
  const base = BAND_CONFIG[bandName];
  if (!base) return null;
  return {
    ...base,
    color: isDark ? base.color : base.lightColor,
    wash: isDark ? base.wash : base.lightWash,
    border: isDark ? base.border : base.lightBorder,
  };
}

function WorkstationCard({ item, classicUp, isDark, gold }) {
  const bandCfg = getBandConfig(item.band, isDark) || {
    color: gold.accent,
    wash: gold.wash,
    border: gold.border,
    icon: ComputerIcon
  };
  const BandIconComponent = bandCfg.icon;

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
          borderColor: gold.accent,
          transform: 'translateY(-3px)',
          boxShadow: isDark
            ? '0 12px 28px -6px rgba(212, 175, 55, 0.25), 0 0 0 1px rgba(212, 175, 55, 0.3)'
            : '0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 0 0 1px rgba(184, 134, 11, 0.25)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.5 }}>
        {/* Top Badges: Classification Band & Zero-Egress Invariant */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<BandIconComponent sx={{ fontSize: '0.85rem !important', color: `${bandCfg.color} !important` }} />}
            label={item.band}
            sx={{
              height: 24,
              fontSize: '0.74rem',
              fontWeight: 800,
              fontFamily: mono,
              bgcolor: bandCfg.wash,
              color: bandCfg.color,
              border: `1px solid ${bandCfg.border}`,
            }}
          />
          <Chip
            size="small"
            icon={<VerifiedUserIcon sx={{ fontSize: '0.8rem !important', color: `${isDark ? '#34D399' : '#047857'} !important` }} />}
            label="Zero-Egress Invariant Verified"
            sx={{
              height: 24,
              fontSize: '0.68rem',
              fontWeight: 750,
              fontFamily: mono,
              bgcolor: isDark ? 'rgba(52, 211, 153, 0.1)' : '#ECFDF3',
              color: isDark ? '#34D399' : '#047857',
              border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(4, 120, 87, 0.3)'}`,
            }}
          />
        </Box>

        {/* Workstation Name */}
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.05rem',
            fontWeight: 800,
            lineHeight: 1.35,
            mb: 1.25,
            color: isDark ? '#EDEFF2' : '#101828',
          }}
        >
          {item.name}
        </Typography>

        {/* Workstation ID & Path */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.7rem', color: gold.accent, fontWeight: 700 }}>
              ID:
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.72rem', color: isDark ? '#9CA3AF' : '#374151', bgcolor: isDark ? '#14141E' : '#F3F4F6', px: 0.8, py: 0.2, borderRadius: 1, border: `1px solid ${isDark ? '#26262F' : '#E5E7EB'}` }}>
              {item.id}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: mono,
              fontSize: '0.74rem',
              color: isDark ? '#9CA3AF' : '#4B5563',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {item.path}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Direct primary Launch Workstation button */}
        <Button
          size="small"
          variant="contained"
          component={RouterLink}
          to={`/workstations/${item.id}`}
          startIcon={<PlayArrowIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            bgcolor: gold.accent,
            color: '#101828',
            fontWeight: 800,
            fontSize: '0.8rem',
            px: 2,
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
          Launch Workstation
        </Button>

        {classicUp && (
          <Button
            size="small"
            variant="text"
            endIcon={<LaunchIcon sx={{ fontSize: '0.8rem' }} />}
            href={`${CLASSIC}${item.path}`}
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

export default function WorkstationsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [band, setBand] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'topology'
  const { status } = useStudioStatus();
  const classicUp = Boolean(status?.services?.classic?.up);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.28)' : 'rgba(184,134,11,0.25)',
  };

  // Precomputed band counts based on static 37 workstations
  const bandCounts = useMemo(() => {
    const counts = {};
    for (const item of workstations) {
      counts[item.band] = (counts[item.band] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered workstations matching both band and search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workstations.filter((item) => {
      const inBand = band === 'All' || item.band === band;
      if (!inBand) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.band.toLowerCase().includes(q)
      );
    });
  }, [band, search]);

  // Grouped by band for Cadre Topology Map
  const groupedByBand = useMemo(() => {
    const map = {};
    for (const b of ORDERED_BANDS) {
      map[b] = [];
    }
    for (const item of filtered) {
      if (map[item.band]) {
        map[item.band].push(item);
      } else {
        map[item.band] = [item];
      }
    }
    return map;
  }, [filtered]);

  return (
    <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Page Header */}
      <HeroReveal>
        <Box sx={{ mb: 3 }}>
          <HeroItem>
            <Typography variant="overline" sx={{ color: gold.accent, letterSpacing: '0.18em', fontWeight: 800, display: 'block', mb: 1 }}>
              SOVEREIGN WORKSTATION DIRECTORY
            </Typography>
          </HeroItem>
          <HeroItem>
            <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', mb: 1, color: isDark ? '#EDEFF2' : '#101828' }}>
              Workstations
            </Typography>
          </HeroItem>
          <HeroItem>
            <Typography color="text.secondary" sx={{ maxWidth: 880, fontSize: '1.05rem', lineHeight: 1.6 }}>
              All 37 studio workstations are integrated directly into Zoth Studio v2. They render with the native gold-on-void design system, zero external runtime dependency, and immediate interactive execution.
            </Typography>
          </HeroItem>
        </Box>
      </HeroReveal>

      {/* Workstation Stats Bar */}
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
            {/* Stat 1: 37 Sovereign Consoles Native in v2 */}
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
                    37
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                    37 Sovereign Consoles Native in v2
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
                    6 Architectural Bands
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
                    Zero Cloud Dependencies (100% Loopback)
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Stat 4: Legacy server status badge */}
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

      {/* Control Bar: Dual-View Toggle & Instant Search */}
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
          {/* Dual-View Toggle: Grid Matrix vs Cadre Topology Map */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, next) => {
              if (next) setViewMode(next);
            }}
            size="small"
            sx={{
              bgcolor: isDark ? '#0B0B12' : '#FFFFFF',
              border: '1px solid',
              borderColor: isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.25)',
              borderRadius: 2.5,
              p: 0.5,
              alignSelf: { xs: 'flex-start', md: 'center' },
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.8,
                border: 'none',
                borderRadius: '8px !important',
                textTransform: 'none',
                fontWeight: 750,
                fontSize: '0.85rem',
                color: isDark ? '#9CA3AF' : '#4B5563',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: gold.accent,
                  color: isDark ? '#08080B' : '#101828',
                  boxShadow: '0 2px 10px rgba(212,175,55,0.3)',
                  '&:hover': {
                    bgcolor: '#F3D56A',
                    color: isDark ? '#08080B' : '#101828',
                  },
                },
                '&:hover': {
                  bgcolor: isDark ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.08)',
                  color: gold.accent,
                },
              },
            }}
          >
            <ToggleButton value="grid" aria-label="Grid Matrix">
              <GridViewIcon sx={{ fontSize: '1.1rem', mr: 1 }} />
              Grid Matrix
            </ToggleButton>
            <ToggleButton value="topology" aria-label="Cadre Topology Map">
              <AccountTreeIcon sx={{ fontSize: '1.1rem', mr: 1 }} />
              Cadre Topology Map
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Instant Search Input matching workstation name, id, and band */}
          <TextField
            size="small"
            placeholder="Search 37 workstations by name, ID, or band..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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

      {/* Band Filter Chips with Counts */}
      <RevealOnScroll preset="fadeUp" delay={0.4}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3, alignItems: 'center' }}>
          <Chip
            label={`All · ${workstations.length}`}
            clickable
            onClick={() => setBand('All')}
            sx={{
              fontWeight: 800,
              fontSize: '0.82rem',
              fontFamily: mono,
              bgcolor: band === 'All' ? gold.accent : (isDark ? '#0B0B12' : '#FFFFFF'),
              color: band === 'All' ? (isDark ? '#08080B' : '#101828') : 'text.primary',
              border: '1px solid',
              borderColor: band === 'All' ? gold.accent : (isDark ? '#26262F' : '#EAECF0'),
              '&:hover': {
                borderColor: gold.accent,
                bgcolor: band === 'All' ? gold.accent : (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7'),
              },
              transition: 'all 0.18s ease',
            }}
          />

          {ORDERED_BANDS.map((item) => {
            const active = item === band;
            const count = bandCounts[item] || 0;
            const cfg = getBandConfig(item, isDark);
            const IconComp = cfg.icon;

            return (
              <Chip
                key={item}
                icon={<IconComp sx={{ fontSize: '0.9rem !important', color: active ? `${isDark ? '#08080B' : '#101828'} !important` : `${cfg.color} !important` }} />}
                label={`${item} · ${count}`}
                clickable
                onClick={() => setBand(item)}
                sx={{
                  fontWeight: 750,
                  fontSize: '0.82rem',
                  fontFamily: mono,
                  bgcolor: active ? gold.accent : (isDark ? '#0B0B12' : '#FFFFFF'),
                  color: active ? (isDark ? '#08080B' : '#101828') : 'text.primary',
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
      </RevealOnScroll>

      {/* Result Metrics */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: mono, fontSize: '0.85rem' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{workstations.length}</strong> consoles
          {band !== 'All' && <span> in <strong>{band}</strong></span>}
          {search.trim() && <span> matching &ldquo;{search.trim()}&rdquo;</span>}
        </Typography>

        {(band !== 'All' || search) && (
          <Button
            size="small"
            onClick={() => {
              setBand('All');
              setSearch('');
            }}
            sx={{ color: gold.accent, fontSize: '0.78rem', textTransform: 'none', fontWeight: 700 }}
          >
            Reset Filters
          </Button>
        )}
      </Box>

      {/* VIEW MODE 1: GRID MATRIX */}
      {viewMode === 'grid' && (
        <>
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
                No workstations matched criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search terms or selecting &ldquo;All&rdquo; bands.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setBand('All');
                  setSearch('');
                }}
                sx={{ borderColor: gold.accent, color: gold.accent }}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <StaggerChildren>
              <Grid container spacing={3}>
                {filtered.map((item) => (
                  <Grid xs={12} sm={6} md={4} key={item.id}>
                    <StaggerItem>
                      <WorkstationCard item={item} classicUp={classicUp} isDark={isDark} gold={gold} />
                    </StaggerItem>
                  </Grid>
                ))}
              </Grid>
            </StaggerChildren>
          )}
        </>
      )}

      {/* VIEW MODE 2: CADRE TOPOLOGY MAP */}
      {viewMode === 'topology' && (
        <RevealOnScroll preset="scaleUp" delay={0.2}>
          <Box>
            {/* Interactive Visual SVG Node Graph */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, md: 3 },
                mb: 4,
                borderRadius: 3,
                bgcolor: isDark ? '#08080B' : '#FAFAFA',
                border: '1px solid',
                borderColor: isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="overline" sx={{ color: gold.accent, letterSpacing: '0.15em', fontWeight: 800 }}>
                  TOPOLOGY GRAPH // 6 ARCHITECTURAL CADRES
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Interactive node map representing loopback core orchestration. Click any cadre hub to focus band.
                </Typography>
              </Box>
              <Chip
                size="small"
                label={band === 'All' ? 'Cadre Focus: All 6 Bands' : `Cadre Focus: ${band}`}
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  bgcolor: isDark ? 'rgba(212,175,55,0.12)' : '#FEF9E7',
                  color: isDark ? '#D4AF37' : '#8A6A09',
                  border: `1px solid ${gold.border}`,
                }}
              />
            </Box>

            {/* SVG Visual Canvas */}
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <svg
                viewBox="0 0 920 480"
                style={{
                  width: '100%',
                  height: 'auto',
                  minWidth: 700,
                  display: 'block',
                  background: isDark ? 'radial-gradient(circle at 460px 240px, #10101A 0%, #08080B 100%)' : '#FFFFFF',
                  borderRadius: 12,
                }}
              >
                <defs>
                  {/* Glowing Filter */}
                  <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="coreGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F3D56A" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#9A7209" />
                  </linearGradient>
                </defs>

                {/* Concentric Background Grid Rings */}
                <circle cx="460" cy="240" r="100" fill="none" stroke={isDark ? 'rgba(212,175,55,0.12)' : 'rgba(184,134,11,0.22)'} strokeWidth="1.2" strokeDasharray="3 6" />
                <circle cx="460" cy="240" r="190" fill="none" stroke={isDark ? 'rgba(212,175,55,0.10)' : 'rgba(184,134,11,0.20)'} strokeWidth="1.2" strokeDasharray="4 8" />
                <circle cx="460" cy="240" r="275" fill="none" stroke={isDark ? 'rgba(212,175,55,0.08)' : 'rgba(184,134,11,0.2)'} strokeWidth="1.2" strokeDasharray="5 10" />

                {/* Connecting Links from Core to the 6 Band Hubs */}
                {ORDERED_BANDS.map((bName) => {
                  const cfg = getBandConfig(bName, isDark);
                  const active = band === 'All' || band === bName;
                  const isCurrent = band === bName;

                  return (
                    <g key={`link-${bName}`}>
                      <line
                        x1="460"
                        y1="240"
                        x2={cfg.svgPos.x}
                        y2={cfg.svgPos.y}
                        stroke={isCurrent ? cfg.color : (active ? (isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.45)') : (isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.35)'))}
                        strokeWidth={isCurrent ? 3 : (active ? 1.75 : 1.2)}
                        strokeDasharray={isCurrent ? 'none' : '4 4'}
                        opacity={active ? 1 : 0.65}
                      />
                      {/* Pulse particle along link */}
                      {active && (
                        <circle
                          cx={(460 + cfg.svgPos.x) / 2}
                          cy={(240 + cfg.svgPos.y) / 2}
                          r="3"
                          fill={cfg.color}
                          opacity="0.8"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Central Loopback Core Node */}
                <g
                  style={{ cursor: 'pointer' }}
                  onClick={() => setBand('All')}
                >
                  <circle
                    cx="460"
                    cy="240"
                    r="54"
                    fill="none"
                    stroke={gold.accent}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  <circle
                    cx="460"
                    cy="240"
                    r="44"
                    fill={isDark ? '#0B0B12' : '#FFFFFF'}
                    stroke={gold.accent}
                    strokeWidth="2.5"
                    filter="url(#goldGlow)"
                  />
                  <text
                    x="460"
                    y="228"
                    textAnchor="middle"
                    fill={isDark ? '#D4AF37' : '#8A6A09'}
                    fontSize="10"
                    fontWeight="800"
                    fontFamily={mono}
                    letterSpacing="1px"
                  >
                    ZOTH v2 CORE
                  </text>
                  <text
                    x="460"
                    y="244"
                    textAnchor="middle"
                    fill={isDark ? '#34D399' : '#047857'}
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily={mono}
                  >
                    100% LOOPBACK
                  </text>
                  <text
                    x="460"
                    y="258"
                    textAnchor="middle"
                    fill={isDark ? '#9CA3AF' : '#475467'}
                    fontSize="8"
                    fontFamily={mono}
                  >
                    37 CONSOLES
                  </text>
                  <title>Zoth Loopback Core (127.0.0.1) · Click to view All Cadres</title>
                </g>

                {/* 6 Cadre Hub Nodes with Satellites */}
                {ORDERED_BANDS.map((bName) => {
                  const cfg = getBandConfig(bName, isDark);
                  const count = bandCounts[bName] || 0;
                  const active = band === 'All' || band === bName;
                  const isCurrent = band === bName;
                  const hx = cfg.svgPos.x;
                  const hy = cfg.svgPos.y;

                  // Satellites for each workstation in this band
                  const bandItems = workstations.filter((w) => w.band === bName);
                  const dx = hx - 460;
                  const dy = hy - 240;
                  const centerAngle = Math.atan2(dy, dx);
                  const spread = Math.PI * 0.75; // 135 deg arc facing outwards
                  const step = bandItems.length > 1 ? spread / (bandItems.length - 1) : 0;

                  return (
                    <g
                      key={`cadre-group-${bName}`}
                      opacity={active ? 1 : 0.35}
                      style={{ transition: 'opacity 0.25s ease' }}
                    >
                      {/* Satellite Workstation Micro-Nodes */}
                      {bandItems.map((item, idx) => {
                        const satAngle = centerAngle - spread / 2 + idx * step;
                        const orbitR = 48;
                        const sx = hx + orbitR * Math.cos(satAngle);
                        const sy = hy + orbitR * Math.sin(satAngle);

                        return (
                          <g key={`sat-${item.id}`}>
                            {/* Spoke to Hub */}
                            <line
                              x1={hx}
                              y1={hy}
                              x2={sx}
                              y2={sy}
                              stroke={isCurrent ? cfg.color : (isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.35)')}
                              strokeWidth="1.2"
                              strokeDasharray="2 2"
                            />
                            {/* Satellite dot */}
                            <circle
                              cx={sx}
                              cy={sy}
                              r={isCurrent ? 4.5 : 3.5}
                              fill={isCurrent ? cfg.color : (isDark ? '#14141E' : '#FFFFFF')}
                              stroke={cfg.color}
                              strokeWidth="1.5"
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBand(bName);
                              }}
                            >
                              <title>{`${item.name} (${item.id}) · Click to inspect band`}</title>
                            </circle>
                          </g>
                        );
                      })}

                      {/* Cadre Hub Node */}
                      <g
                        style={{ cursor: 'pointer' }}
                        onClick={() => setBand(band === bName ? 'All' : bName)}
                      >
                        {/* Outer Glow Ring if currently focused */}
                        {isCurrent && (
                          <circle
                            cx={hx}
                            cy={hy}
                            r="36"
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="2"
                            strokeDasharray="3 3"
                            filter="url(#goldGlow)"
                          />
                        )}

                        <circle
                          cx={hx}
                          cy={hy}
                          r="28"
                          fill={isDark ? '#0B0B12' : '#FFFFFF'}
                          stroke={isCurrent ? cfg.color : (active ? gold.accent : (isDark ? '#4B5563' : '#9CA3AF'))}
                          strokeWidth={isCurrent ? 3 : 2}
                        />

                        {/* Node Count inside Hub */}
                        <text
                          x={hx}
                          y={hy - 2}
                          textAnchor="middle"
                          fill={cfg.color}
                          fontSize="13"
                          fontWeight="800"
                          fontFamily={mono}
                        >
                          {count}
                        </text>
                        <text
                          x={hx}
                          y={hy + 10}
                          textAnchor="middle"
                          fill={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize="7"
                          fontWeight="700"
                          fontFamily={mono}
                        >
                          NODES
                        </text>

                        {/* Band Label below or above Hub */}
                        <text
                          x={hx}
                          y={hy + (hy > 240 ? 44 : -36)}
                          textAnchor="middle"
                          fill={isCurrent ? cfg.color : (isDark ? '#EDEFF2' : '#101828')}
                          fontSize="11"
                          fontWeight="800"
                          fontFamily={mono}
                        >
                          {bName.toUpperCase()}
                        </text>

                        <title>{`${bName} Cadre · ${count} Workstations · Click to filter`}</title>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </Box>

            {/* Quick Filter Jump Toolbar */}
            <Divider sx={{ my: 2.5, borderColor: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(184,134,11,0.15)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, letterSpacing: '0.1em', mr: 0.5 }}>
                QUICK CADRE JUMP:
              </Typography>
              <Chip
                size="small"
                label={`All Cadres (${workstations.length})`}
                clickable
                onClick={() => setBand('All')}
                sx={{
                  fontFamily: mono,
                  fontWeight: 750,
                  bgcolor: band === 'All' ? gold.accent : (isDark ? 'transparent' : '#FFFFFF'),
                  color: band === 'All' ? (isDark ? '#08080B' : '#101828') : 'text.primary',
                  border: '1px solid',
                  borderColor: band === 'All' ? gold.accent : (isDark ? '#374151' : '#D1D5DB'),
                }}
              />
              {ORDERED_BANDS.map((bName) => (
                <Chip
                  key={`jump-${bName}`}
                  size="small"
                  label={`${bName} (${bandCounts[bName] || 0})`}
                  clickable
                  onClick={() => setBand(bName)}
                  sx={{
                    fontFamily: mono,
                    fontWeight: 750,
                    bgcolor: band === bName ? gold.accent : (isDark ? 'transparent' : '#FFFFFF'),
                    color: band === bName ? (isDark ? '#08080B' : '#101828') : 'text.primary',
                    border: '1px solid',
                    borderColor: band === bName ? gold.accent : (isDark ? '#374151' : '#D1D5DB'),
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Grouped Architectural Cadres Display */}
          <Stack spacing={4}>
            {ORDERED_BANDS.map((bName) => {
              const bItems = groupedByBand[bName] || [];
              if (band !== 'All' && band !== bName) return null;
              const cfg = getBandConfig(bName, isDark);
              const IconComponent = cfg.icon;

              return (
                <Paper
                  key={`cadre-section-${bName}`}
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    bgcolor: isDark ? '#08080B' : '#FFFFFF',
                    border: '1px solid',
                    borderColor: isDark ? '#26262F' : '#EAECF0',
                    boxShadow: isDark ? 'none' : '0 1px 3px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  {/* Cadre Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: cfg.wash,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.color,
                        }}
                      >
                        <IconComponent />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h5" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontWeight: 700, color: isDark ? '#EDEFF2' : '#101828' }}>
                            {bName} Cadre
                          </Typography>
                          <Chip
                            size="small"
                            label={`${bItems.length} Consoles`}
                            sx={{
                              height: 22,
                              fontFamily: mono,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              bgcolor: cfg.wash,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                            }}
                          />
                          <Chip
                            size="small"
                            icon={<VerifiedUserIcon sx={{ fontSize: '0.75rem !important', color: `${isDark ? '#34D399' : '#047857'} !important` }} />}
                            label="Zero-Egress Invariant Verified"
                            sx={{
                              height: 22,
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: isDark ? 'rgba(52,211,153,0.1)' : '#ECFDF3',
                              color: isDark ? '#34D399' : '#047857',
                              border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : 'rgba(4,120,87,0.3)'}`,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.88rem' }}>
                          {cfg.description}
                        </Typography>
                      </Box>
                    </Box>

                    {band !== bName && (
                      <Button
                        size="small"
                        onClick={() => setBand(bName)}
                        sx={{ color: gold.accent, fontSize: '0.78rem', textTransform: 'none', fontWeight: 700 }}
                      >
                        Focus Cadre
                      </Button>
                    )}
                  </Box>

                  {/* Workstations Grid within this Cadre */}
                  {bItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                      No workstations in this cadre match current filter.
                    </Typography>
                  ) : (
                    <Grid container spacing={2.5}>
                      {bItems.map((item) => (
                        <Grid xs={12} sm={6} md={4} key={item.id}>
                          <WorkstationCard item={item} classicUp={classicUp} isDark={isDark} gold={gold} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              );
            })}
          </Stack>
          </Box>
        </RevealOnScroll>
      )}

      {/* Sovereign Installation Funnel */}
      <RevealOnScroll preset="fadeUp" delay={0.4}>
        <SovereignFunnel
          title="Deploy Sovereign Workstations Locally"
          subtitle="Zero-egress developer workstations, offline code compiler sandboxes, local telemetry arrays, and multi-agent coordination bridges."
          toolTitle="Option 1: Zoth CLI Workstations Engine"
          toolTag="WORKSTATIONS"
          toolDescription="Launch any of the 6 sovereign workstation bands locally with offline telemetry arrays, sandboxed runtimes, and local IPC daemon bridges."
          toolRepo="https://github.com/NullAITech/zoth-studio-v2"
          toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git && npm install"
        />
      </RevealOnScroll>
    </Container>
  );
}
