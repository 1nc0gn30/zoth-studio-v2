import React, { useState, useMemo } from 'react';
import CinematicIntro from '../components/CinematicIntro';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GridViewIcon from '@mui/icons-material/GridView';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TerminalIcon from '@mui/icons-material/Terminal';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ClearIcon from '@mui/icons-material/Clear';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import HubIcon from '@mui/icons-material/Hub';
import HandymanIcon from '@mui/icons-material/Handyman';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GitHubIcon from '@mui/icons-material/GitHub';
import LayersIcon from '@mui/icons-material/Layers';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { masterArsenal, arsenalStats } from '../data/arsenalData';
import SovereignFunnel from '../components/SovereignFunnel';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const ORDERED_CATEGORIES = [
  'All',
  'Security & Recon',
  'Swarm & Core',
  'Autonomous Web',
  'Planning',
  'Automation',
  'AI & Knowledge',
  'Media & 3D'
];

const CATEGORY_CONFIG = {
  'Security & Recon': {
    color: '#F87171',
    lightColor: '#DC2626',
    wash: 'rgba(248, 113, 113, 0.14)',
    icon: SecurityIcon,
  },
  'Swarm & Core': {
    color: '#34D399',
    lightColor: '#059669',
    wash: 'rgba(52, 211, 153, 0.14)',
    icon: HubIcon,
  },
  'Autonomous Web': {
    color: '#F59E0B',
    lightColor: '#B45309',
    wash: 'rgba(245, 158, 11, 0.14)',
    icon: CodeIcon,
  },
  'Planning': {
    color: '#D4AF37',
    lightColor: '#B8860B',
    wash: 'rgba(212, 175, 55, 0.14)',
    icon: LayersIcon,
  },
  'Automation': {
    color: '#38BDF8',
    lightColor: '#0369A1',
    wash: 'rgba(56, 189, 248, 0.14)',
    icon: TerminalIcon,
  },
  'AI & Knowledge': {
    color: '#A78BFA',
    lightColor: '#7C3AED',
    wash: 'rgba(167, 139, 250, 0.14)',
    icon: PsychologyIcon,
  },
  'Media & 3D': {
    color: '#EC4899',
    lightColor: '#BE185D',
    wash: 'rgba(236, 72, 153, 0.14)',
    icon: AutoAwesomeIcon,
  },
};

function UnifiedAssetCard({ item, isDark, gold }) {
  const [copied, setCopied] = useState(false);
  const catCfg = CATEGORY_CONFIG[item.category] || {
    color: gold.accent,
    wash: gold.wash,
    icon: HandymanIcon,
  };
  const CatIconComponent = catCfg.icon;

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
        bgcolor: isDark ? '#0A0A10' : '#FFFFFF',
        border: '1px solid',
        borderColor: item.isFlagship
          ? gold.accent
          : isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
        boxShadow: item.isFlagship
          ? isDark
            ? '0 4px 24px rgba(212, 175, 55, 0.18)'
            : '0 4px 20px rgba(184, 134, 11, 0.15)'
          : isDark
            ? '0 2px 12px rgba(0, 0, 0, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: isDark ? '#38BDF8' : '#0284C7',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.15)'
            : '0 8px 24px rgba(2, 132, 199, 0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        {/* Top Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<CatIconComponent sx={{ fontSize: '0.85rem !important', color: `${isDark ? catCfg.color : catCfg.lightColor} !important` }} />}
            label={item.category}
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 800,
              fontFamily: mono,
              bgcolor: isDark ? catCfg.wash : '#F8FAFC',
              color: isDark ? catCfg.color : catCfg.lightColor,
              border: `1px solid ${isDark ? catCfg.wash : '#E2E8F0'}`,
            }}
          />

          <Chip
            size="small"
            label={item.executionType === 'webgpu' ? 'WebGPU Native' : 'Local CLI'}
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 800,
              fontFamily: mono,
              bgcolor: item.executionType === 'webgpu'
                ? isDark ? 'rgba(56, 189, 248, 0.12)' : '#F0F9FF'
                : isDark ? 'rgba(212, 175, 55, 0.12)' : '#FFFBEB',
              color: item.executionType === 'webgpu'
                ? isDark ? '#38BDF8' : '#0284C7'
                : isDark ? '#D4AF37' : '#B45309',
              border: '1px solid',
              borderColor: item.executionType === 'webgpu'
                ? isDark ? 'rgba(56, 189, 248, 0.3)' : '#BAE6FD'
                : isDark ? 'rgba(212, 175, 55, 0.3)' : '#FDE68A',
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
                  borderColor: isDark ? '#38BDF8' : '#0284C7',
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

        {item.github && (
          <Button
            size="small"
            variant="text"
            startIcon={<GitHubIcon sx={{ fontSize: '0.85rem' }} />}
            href={item.github}
            target="_blank"
            rel="noreferrer"
            sx={{
              color: isDark ? '#9CA3AF' : '#6B7280',
              fontSize: '0.74rem',
              fontFamily: mono,
              p: 0.5,
              '&:hover': { color: gold.accent },
            }}
          >
            GitHub
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default function ArsenalPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.28)' : 'rgba(184,134,11,0.25)',
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return masterArsenal.filter((asset) => {
      // Category filter
      if (categoryFilter !== 'All' && asset.category !== categoryFilter) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesId = asset.id.toLowerCase().includes(q);
        const matchesDesc = asset.description.toLowerCase().includes(q);
        const matchesCat = asset.category.toLowerCase().includes(q);
        return matchesName || matchesId || matchesDesc || matchesCat;
      }
      return true;
    });
  }, [categoryFilter, search]);

  return (
    <Box sx={{ bgcolor: isDark ? '#08080B' : '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Cinematic Intro Banner */}
      {!introDone && (
        <CinematicIntro
          words={['25 SOVEREIGN', 'TOOL', 'ARSENAL']}
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
                One unified directory consolidating all {arsenalStats.total} sovereign micro-tools and repositories. Everything executes strictly on local hardware with zero external cloud dependencies.
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
              {/* Stat 1: Total Sovereign Tools */}
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
                      {arsenalStats.total}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      Sovereign Tool Repositories
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Stat 2: CLI Binaries */}
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
                    <CodeIcon sx={{ fontSize: '1.35rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#EDEFF2' : '#101828', lineHeight: 1.15 }}>
                      {arsenalStats.cli}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      Local CLI Binaries
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Stat 3: WebGPU In-Browser */}
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
                      bgcolor: isDark ? 'rgba(167,139,250,0.12)' : '#FAF5FF',
                      border: `1px solid ${isDark ? 'rgba(167,139,250,0.3)' : '#DDD6FE'}`,
                      color: isDark ? '#A78BFA' : '#7C3AED',
                      flexShrink: 0,
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: '1.35rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#EDEFF2' : '#101828', lineHeight: 1.15 }}>
                      {arsenalStats.webgpu}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      WebGPU In-Browser Tools
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Stat 4: Zero Cloud Dependencies */}
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
                      bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3',
                      border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#ABE5C6'}`,
                      color: isDark ? '#34D399' : '#027A48',
                      flexShrink: 0,
                    }}
                  >
                    <CloudOffIcon sx={{ fontSize: '1.35rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: mono, fontWeight: 800, color: isDark ? '#34D399' : '#027A48', lineHeight: 1.15 }}>
                      0 WAN
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', fontSize: '0.78rem' }}>
                      Zero Outbound Telemetry
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </RevealOnScroll>

        {/* Filter & Search Bar */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search 25 sovereign tools by name, ID, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: gold.accent }} />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    fontFamily: mono,
                    fontSize: '0.85rem',
                    bgcolor: isDark ? '#0D0D14' : '#FFFFFF',
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {/* View Mode Toggle */}
            <Grid xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
                sx={{
                  bgcolor: isDark ? '#0D0D14' : '#FFFFFF',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    px: 1.8,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    '&.Mui-selected': {
                      bgcolor: isDark ? 'rgba(212,175,55,0.18)' : '#FEF3C7',
                      color: gold.accent,
                    },
                  },
                }}
              >
                <ToggleButton value="grid">
                  <GridViewIcon sx={{ fontSize: '1rem', mr: 0.8 }} /> Grid ({filteredAssets.length})
                </ToggleButton>
                <ToggleButton value="compact">
                  <AccountTreeIcon sx={{ fontSize: '1rem', mr: 0.8 }} /> List ({filteredAssets.length})
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>

        {/* Categories Bar */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {ORDERED_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat;
            const count = cat === 'All' ? masterArsenal.length : masterArsenal.filter((a) => a.category === cat).length;
            const catCfg = CATEGORY_CONFIG[cat] || { color: gold.accent, lightColor: gold.accent, wash: gold.wash, icon: HandymanIcon };
            const Icon = catCfg.icon;

            return (
              <Chip
                key={cat}
                clickable
                onClick={() => setCategoryFilter(cat)}
                icon={<Icon sx={{ fontSize: '0.85rem !important', color: `${isSelected ? '#FFFFFF' : (isDark ? catCfg.color : catCfg.lightColor)} !important` }} />}
                label={`${cat} (${count})`}
                sx={{
                  fontFamily: mono,
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 0.8,
                  borderRadius: 2,
                  bgcolor: isSelected
                    ? (isDark ? '#38BDF8' : '#0284C7')
                    : (isDark ? '#0D0D14' : '#FFFFFF'),
                  color: isSelected ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151'),
                  border: '1px solid',
                  borderColor: isSelected
                    ? (isDark ? '#38BDF8' : '#0284C7')
                    : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'),
                  '&:hover': {
                    bgcolor: isSelected ? (isDark ? '#7DD3FC' : '#0369A1') : (isDark ? '#141420' : '#F1F5F9'),
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Asset Grid or List */}
        {filteredAssets.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: isDark ? '#0D0D14' : '#FFFFFF',
              border: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No sovereign tools match your search criteria.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => { setSearch(''); setCategoryFilter('All'); }}
              sx={{ mt: 1, fontFamily: mono, fontSize: '0.8rem' }}
            >
              Reset Filters
            </Button>
          </Paper>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={2.5}>
            {filteredAssets.map((asset) => (
              <Grid xs={12} sm={6} md={4} key={asset.id}>
                <UnifiedAssetCard item={asset} isDark={isDark} gold={gold} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={1.5}>
            {filteredAssets.map((asset) => (
              <Paper
                key={asset.id}
                elevation={0}
                sx={{
                  p: 2,
                  px: 2.5,
                  borderRadius: 2.5,
                  bgcolor: isDark ? '#0A0A10' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  '&:hover': {
                    borderColor: isDark ? '#38BDF8' : '#0284C7',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 260 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#EDEFF2' : '#101828' }}>
                        {asset.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={asset.category}
                        sx={{ height: 20, fontSize: '0.65rem', fontFamily: mono, fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', maxWidth: 540 }}>
                      {asset.description}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.7rem', color: isDark ? '#9CA3AF' : '#4B5563', bgcolor: isDark ? '#14141E' : '#F3F4F6', px: 1, py: 0.3, borderRadius: 1 }}>
                    {asset.id}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    component={RouterLink}
                    to={asset.target}
                    sx={{
                      bgcolor: isDark ? '#38BDF8' : '#0284C7',
                      color: '#FFFFFF',
                      fontFamily: mono,
                      fontWeight: 750,
                      fontSize: '0.75rem',
                      px: 2,
                      borderRadius: 2,
                    }}
                  >
                    Launch ↗
                  </Button>
                  {asset.github && (
                    <Button
                      size="small"
                      variant="outlined"
                      href={asset.github}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        color: isDark ? '#9CA3AF' : '#4B5563',
                        fontFamily: mono,
                        fontSize: '0.75rem',
                        px: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      GitHub
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        <Box sx={{ mt: 8 }}>
          <SovereignFunnel />
        </Box>
      </Container>
    </Box>
  );
}
