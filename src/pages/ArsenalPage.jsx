import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { masterArsenal } from '../data/arsenalData';
import { microTools } from '../data/toolsData';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine } from '../components/MotionReveal';
import { useCopy } from '../components/sovereign';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const ECOSYSTEM_PILLS = [
  { label: 'ZothOS v3.4.0 (23 Daemons)', href: 'https://zothos.nullai.tech' },
  { label: 'ZothOS-Lite v1.2 (56 Models · toram)', href: 'https://zothos-lite.nullai.tech' },
  { label: 'Civilization v3.0 (23 Pantheon)', href: 'https://zoth-civilization.netlify.app' },
  { label: 'ZothNet Mesh', href: 'https://zothnet.nullai.tech' },
  { label: 'NullAI', href: 'https://nullai.tech' },
  { label: 'FieldKit', href: 'https://nullai.tech/fieldkit' },
  { label: '1nc0gn30', href: 'https://1nc0gn30.si' },
];

function resolveRepoUrl(item) {
  if (['anderson-security-sentinel', 'wcag-contrast-guard', 'zothnet'].includes(item.id) || !item.github) {
    return 'https://github.com/NullAITech/zoth-studio-v2';
  }
  return item.github;
}

function isBrowserSurface(item) {
  return item.executionType === 'browser' || item.executionType === 'webgpu' || item.executionType === 'hybrid';
}

function ArsenalCard({ item, isDark, gold, goldLine, primaryText, secondaryText, cardBg, codeBg, borderCol }) {
  const { copied, copy } = useCopy(2000);
  const repoUrl = resolveRepoUrl(item);
  const cloneCmd = `git clone ${repoUrl.replace(/\.git$/, '')}.git`;
  const inBrowser = isBrowserSurface(item);

  const handleCopy = (e) => {
    e.stopPropagation();
    copy(cloneCmd);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        bgcolor: cardBg,
        border: `1px solid ${item.isFlagship ? (isDark ? 'rgba(212,175,55,0.42)' : 'rgba(184,134,11,0.38)') : borderCol}`,
        borderTop: item.isFlagship ? `2px solid ${goldLine}` : undefined,
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: goldLine,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.66rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: gold,
            }}
          >
            {item.category}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              size="small"
              label={inBrowser ? 'WEBGPU / UI' : 'CLI / DAEMON'}
              sx={{
                height: 19,
                fontFamily: mono,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: inBrowser
                  ? isDark
                    ? 'rgba(212,175,55,0.12)'
                    : 'rgba(184,134,11,0.10)'
                  : isDark
                    ? 'rgba(56,189,248,0.12)'
                    : '#EFF6FF',
                color: inBrowser ? gold : isDark ? '#38BDF8' : '#0369A1',
              }}
            />
            {item.localPort && (
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: isDark ? '#34D399' : '#047857',
                }}
              >
                :{item.localPort}
              </Typography>
            )}
          </Box>
        </Box>

        <Typography
          variant="h6"
          component={RouterLink}
          to={item.target}
          sx={{
            fontSize: '1.04rem',
            fontWeight: 800,
            lineHeight: 1.32,
            mb: 1,
            color: primaryText,
            textDecoration: 'none',
            display: 'block',
            '&:hover': { color: gold },
          }}
        >
          {item.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: secondaryText,
            fontSize: '0.85rem',
            lineHeight: 1.58,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </Typography>

        <Box
          role="button"
          tabIndex={0}
          aria-label={`Copy clone command for ${item.name}`}
          onClick={handleCopy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopy(e);
            }
          }}
          sx={{
            cursor: 'pointer',
            p: 1,
            px: 1.25,
            minHeight: 40,
            borderRadius: 1.5,
            bgcolor: codeBg,
            border: `1px solid ${borderCol}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            '&:hover': { borderColor: goldLine },
          }}
        >
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              color: primaryText,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cloneCmd}
          </Typography>
          {copied ? (
            <CheckIcon sx={{ fontSize: '0.85rem', color: isDark ? '#34D399' : '#047857', flexShrink: 0 }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: '0.8rem', color: secondaryText, flexShrink: 0 }} />
          )}
        </Box>
      </CardContent>

      <CardActions
        sx={{
          px: 2.5,
          pb: 2.25,
          pt: 1.25,
          borderTop: `1px solid ${borderCol}`,
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Button
          size="small"
          variant="contained"
          component={RouterLink}
          to={item.target}
          endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
          sx={{
            minHeight: { xs: 44, sm: 34 },
            bgcolor: isDark ? '#D4AF37' : '#101828',
            color: isDark ? '#08080B' : '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.76rem',
            textTransform: 'none',
            px: 1.8,
            '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
          }}
        >
          Open Tool
        </Button>

        <Button
          size="small"
          variant="outlined"
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<GitHubIcon sx={{ fontSize: '0.88rem !important' }} />}
          sx={{
            minHeight: { xs: 44, sm: 34 },
            borderColor: borderCol,
            color: primaryText,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'none',
            px: 1.4,
            '&:hover': { borderColor: goldLine },
          }}
        >
          GitHub
        </Button>
      </CardActions>
    </Card>
  );
}

export default function ArsenalPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const goldLine = isDark ? '#D4AF37' : '#B8860B';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const pageBg = isDark ? '#08080B' : '#FAF8F3';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const codeBg = isDark ? '#080A0F' : '#F3EFE6';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';
  const specularBorder = isDark ? 'rgba(212, 175, 55, 0.28)' : 'rgba(184, 134, 11, 0.32)';

  const allCategories = useMemo(
    () => ['All', ...Array.from(new Set(masterArsenal.map((a) => a.category)))],
    [],
  );

  const filteredAssets = useMemo(() => {
    return masterArsenal.filter((asset) => {
      if (categoryFilter !== 'All' && asset.category !== categoryFilter) {
        return false;
      }
      if (surfaceFilter === 'browser' && !isBrowserSurface(asset)) {
        return false;
      }
      if (surfaceFilter === 'cli' && isBrowserSurface(asset)) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          asset.name.toLowerCase().includes(q) ||
          asset.id.toLowerCase().includes(q) ||
          asset.description.toLowerCase().includes(q) ||
          asset.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, surfaceFilter, search]);

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4.5, md: 7 } }}>
        <HeroReveal>
          <Box sx={{ mb: 4 }}>
            <GlowLine
              height={2}
              color={goldLine}
              glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.22)'}
            />
            <HeroItem>
              <Typography
                sx={{
                  mt: 2.5,
                  mb: 1,
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: gold,
                }}
              >
                MASTER DIRECTORY · {microTools.length} FREE OPEN-ACCESS TOOLS · 79 PUBLIC GITHUB REPOS
              </Typography>
            </HeroItem>

            <HeroItem>
              <Typography
                component="h1"
                sx={{
                  fontFamily: display,
                  fontSize: { xs: '2.15rem', sm: '2.9rem', md: '3.45rem' },
                  fontWeight: 400,
                  lineHeight: 1.08,
                  color: primaryText,
                  mb: 1.75,
                }}
              >
                The Sovereign Arsenal
              </Typography>
            </HeroItem>

            <HeroItem>
              <Typography
                sx={{
                  color: secondaryText,
                  maxWidth: '68ch',
                  fontSize: { xs: '0.98rem', sm: '1.06rem' },
                  lineHeight: 1.7,
                  mb: 2.5,
                }}
              >
                Unified directory of <strong>{microTools.length} free open-access tools</strong> (56 in-browser/WebGPU + 27 CLI/daemon across{' '}
                <strong>79 public GitHub repositories</strong>) and 43 Studio workstations, plus local telemetry cockpits. Launch any tool in-browser, clone its standalone repository, or pull the complete{' '}
                <Box
                  component="a"
                  href="https://github.com/NullAITech/zoth-studio-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: gold, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  Zoth Studio v2
                </Box>{' '}
                suite locally.
              </Typography>
            </HeroItem>

            <HeroItem>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                <Button
                  variant="contained"
                  href="https://github.com/NullAITech/zoth-studio-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  sx={{
                    minHeight: 44,
                    bgcolor: isDark ? '#D4AF37' : '#101828',
                    color: isDark ? '#08080B' : '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.5,
                    '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
                  }}
                >
                  Get Zoth Studio Repo
                </Button>
                <Button
                  component={RouterLink}
                  to="/zoth-os"
                  variant="outlined"
                  sx={{
                    minHeight: 44,
                    borderColor: borderCol,
                    color: primaryText,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.5,
                    '&:hover': { borderColor: goldLine },
                  }}
                >
                  ZothOS v3.4.0 ISO →
                </Button>
                <Button
                  component={RouterLink}
                  to="/workstations"
                  variant="outlined"
                  sx={{
                    minHeight: 44,
                    borderColor: borderCol,
                    color: primaryText,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.25,
                    '&:hover': { borderColor: goldLine },
                  }}
                >
                  43 Workstations
                </Button>
              </Box>
            </HeroItem>
          </Box>
        </HeroReveal>

        {/* Ground-Truth Summary Metrics */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 1.75,
            mb: 3,
          }}
        >
          {[
            ['Open-Access Tools', String(microTools.length), '56 WebGPU · 27 CLI'],
            ['Public GitHub Repos', '79', 'Standalone Cloneable'],
            ['ZothOS v3.4.0 Daemons', '23', 'Debian 13 · KDE 6'],
            ['Outbound Telemetry', '0 WAN', '100% Free & Unlocked'],
          ].map(([label, val, sub]) => (
            <Paper
              key={label}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderTop: `2px solid ${specularBorder}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '1.35rem', color: primaryText, lineHeight: 1.15 }}>
                {val}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.4,
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.67rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: gold,
                }}
              >
                {label}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.65rem', color: secondaryText }}>
                {sub}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Ecosystem Bridge Bar */}
        <Box
          sx={{
            mb: 3.5,
            p: 1.5,
            px: 2,
            borderRadius: 2,
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: gold,
              mr: 0.5,
            }}
          >
            ECOSYSTEM:
          </Typography>
          {ECOSYSTEM_PILLS.map((p) => (
            <Button
              key={p.href}
              size="small"
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon sx={{ fontSize: '0.72rem !important' }} />}
              sx={{
                minHeight: 32,
                px: 1.15,
                py: 0.35,
                borderRadius: 1.5,
                border: `1px solid ${borderCol}`,
                bgcolor: codeBg,
                color: primaryText,
                fontFamily: mono,
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: goldLine, color: gold },
              }}
            >
              {p.label}
            </Button>
          ))}
        </Box>

        {/* Search + Surface Filter + View Toggle */}
        <Grid container spacing={1.75} alignItems="center" sx={{ mb: 2.25 }}>
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={`Search ${masterArsenal.length} Studio entries by name, ID, or capability…`}
              inputProps={{ 'aria-label': 'Search Sovereign Arsenal' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: goldLine, fontSize: '1.15rem' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={() => setSearch('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  fontFamily: mono,
                  fontSize: '0.84rem',
                  bgcolor: cardBg,
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          <Grid xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'center',
              }}
            >
              <ToggleButtonGroup
                value={surfaceFilter}
                exclusive
                onChange={(_, v) => v && setSurfaceFilter(v)}
                size="small"
                aria-label="Filter by execution surface"
                sx={{
                  bgcolor: cardBg,
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    minHeight: { xs: 40, sm: 36 },
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 1.35,
                    color: primaryText,
                    border: `1px solid ${borderCol}`,
                    '&.Mui-selected': {
                      bgcolor: isDark ? '#D4AF37' : '#101828',
                      color: isDark ? '#08080B' : '#FFFFFF',
                      '&:hover': {
                        bgcolor: isDark ? '#E5C158' : '#1E293B',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="browser">WebGPU / UI</ToggleButton>
                <ToggleButton value="cli">CLI / Daemon</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
                aria-label="Select layout mode"
                sx={{
                  bgcolor: cardBg,
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    minHeight: { xs: 40, sm: 36 },
                    fontFamily: mono,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 1.4,
                    color: primaryText,
                    border: `1px solid ${borderCol}`,
                    '&.Mui-selected': {
                      bgcolor: isDark ? '#D4AF37' : '#101828',
                      color: isDark ? '#08080B' : '#FFFFFF',
                      '&:hover': {
                        bgcolor: isDark ? '#E5C158' : '#1E293B',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="grid">
                  <GridViewIcon sx={{ fontSize: '0.95rem', mr: 0.6 }} /> Grid ({filteredAssets.length})
                </ToggleButton>
                <ToggleButton value="compact">
                  <ViewListIcon sx={{ fontSize: '0.95rem', mr: 0.6 }} /> List
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>

        {/* Complete Dynamic Category Filter Chips */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 0.85 }}>
          {allCategories.map((cat) => {
            const isSelected = categoryFilter === cat;
            const count =
              cat === 'All' ? masterArsenal.length : masterArsenal.filter((a) => a.category === cat).length;

            return (
              <Chip
                key={cat}
                className={isSelected && !isDark ? 'zs-ondark' : undefined}
                clickable
                onClick={() => setCategoryFilter(cat)}
                label={`${cat} · ${count}`}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: isSelected ? (isDark ? '#D4AF37' : '#101828') : cardBg,
                  color: isSelected ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
                  border: `1px solid ${isSelected ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
                  '&:hover': {
                    bgcolor: isSelected ? (isDark ? '#E5C158' : '#1E293B') : isDark ? '#141824' : '#F3EFE6',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Results */}
        {filteredAssets.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px dashed ${borderCol}`,
            }}
          >
            <Typography variant="h6" sx={{ color: primaryText, mb: 1 }}>
              No tools match your current filter.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setSurfaceFilter('all');
              }}
              sx={{
                mt: 1,
                minHeight: 40,
                fontFamily: mono,
                fontSize: '0.78rem',
                textTransform: 'none',
                color: primaryText,
                borderColor: borderCol,
              }}
            >
              Reset Filters
            </Button>
          </Paper>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={2.5}>
            {filteredAssets.map((asset) => (
              <Grid xs={12} sm={6} md={4} key={asset.id} sx={{ display: 'flex' }}>
                <ArsenalCard
                  item={asset}
                  isDark={isDark}
                  gold={gold}
                  goldLine={goldLine}
                  primaryText={primaryText}
                  secondaryText={secondaryText}
                  cardBg={cardBg}
                  codeBg={codeBg}
                  borderCol={borderCol}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {filteredAssets.map((asset) => {
              const repoUrl = resolveRepoUrl(asset);
              return (
                <Paper
                  key={asset.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    px: 2.5,
                    borderRadius: 2,
                    bgcolor: cardBg,
                    border: `1px solid ${borderCol}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    '&:hover': { borderColor: goldLine },
                  }}
                >
                  <Box sx={{ minWidth: 220, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                      <Typography
                        component={RouterLink}
                        to={asset.target}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.96rem',
                          color: primaryText,
                          textDecoration: 'none',
                          '&:hover': { color: gold },
                        }}
                      >
                        {asset.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={asset.category}
                        sx={{ height: 20, fontSize: '0.66rem', fontFamily: mono, fontWeight: 700, bgcolor: codeBg, color: secondaryText }}
                      />
                      {asset.localPort && (
                        <Chip
                          size="small"
                          label={`:${asset.localPort}`}
                          sx={{
                            height: 20,
                            fontSize: '0.66rem',
                            fontFamily: mono,
                            fontWeight: 700,
                            bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
                            color: isDark ? '#34D399' : '#047857',
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.84rem' }}>
                      {asset.description}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Button
                      size="small"
                      variant="contained"
                      component={RouterLink}
                      to={asset.target}
                      sx={{
                        minHeight: { xs: 44, sm: 34 },
                        bgcolor: isDark ? '#D4AF37' : '#101828',
                        color: isDark ? '#08080B' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'none',
                        px: 1.75,
                      }}
                    >
                      Open Tool
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        minHeight: { xs: 44, sm: 34 },
                        borderColor: borderCol,
                        color: primaryText,
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'none',
                      }}
                    >
                      GitHub
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        <SovereignFunnel />
      </Container>
    </Box>
  );
}
