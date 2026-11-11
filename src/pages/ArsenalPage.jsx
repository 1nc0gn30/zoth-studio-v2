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
  Stack,
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

import { masterArsenal, arsenalStats } from '../data/arsenalData';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const ORDERED_CATEGORIES = [
  'All',
  'Security & Network',
  'Simulation & Testing',
  'Memory & Brain',
  'Security & Recon',
  'Swarm & Core',
  'Autonomous Web',
  'Planning',
  'Automation',
  'AI & Knowledge',
  'Media & 3D',
];

function resolveRepoUrl(item) {
  if (['anderson-security-sentinel', 'wcag-contrast-guard', 'zothnet'].includes(item.id) || !item.github) {
    return 'https://github.com/NullAITech/zoth-studio-v2';
  }
  return item.github;
}

function ArsenalCard({ item, isDark, gold, primaryText, secondaryText, cardBg, codeBg, borderCol }) {
  const [copied, setCopied] = useState(false);
  const repoUrl = resolveRepoUrl(item);
  const cloneCmd = `git clone ${repoUrl.replace(/\.git$/, '')}.git`;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cloneCmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        border: `1px solid ${item.isFlagship ? (isDark ? 'rgba(212,175,55,0.45)' : 'rgba(122,88,8,0.4)') : borderCol}`,
        transition: 'border-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: gold,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: gold,
            }}
          >
            {item.category}
          </Typography>

          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: item.localPort ? (isDark ? '#34D399' : '#047857') : secondaryText,
            }}
          >
            {item.localPort ? `LOCAL :${item.localPort}` : `v${item.version || '2.5.0'}`}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          component={RouterLink}
          to={item.target}
          sx={{
            fontSize: '1.05rem',
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
          onClick={handleCopy}
          sx={{
            cursor: 'pointer',
            p: 1,
            px: 1.25,
            borderRadius: 1.5,
            bgcolor: codeBg,
            border: `1px solid ${borderCol}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
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
            bgcolor: isDark ? '#D4AF37' : '#101828',
            color: isDark ? '#08080B' : '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.76rem',
            textTransform: 'none',
            px: 1.8,
            '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
          }}
        >
          View Specs
        </Button>

        <Button
          size="small"
          variant="outlined"
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<GitHubIcon sx={{ fontSize: '0.88rem !important' }} />}
          sx={{
            borderColor: borderCol,
            color: primaryText,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'none',
            px: 1.4,
            '&:hover': { borderColor: gold },
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
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const pageBg = isDark ? '#08080B' : '#FAF8F3';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const codeBg = isDark ? '#080A0F' : '#F3F4F6';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';

  const filteredAssets = useMemo(() => {
    return masterArsenal.filter((asset) => {
      if (categoryFilter !== 'All' && asset.category !== categoryFilter) {
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
  }, [categoryFilter, search]);

  const daemonCount = useMemo(() => masterArsenal.filter((a) => Boolean(a.localPort)).length, []);

  return (
    <Box sx={{ bgcolor: pageBg, minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <HeroReveal>
          <Box sx={{ mb: 4.5 }}>
            <GlowLine
              height={2}
              color={gold}
              glowColor={isDark ? 'rgba(212,175,55,0.35)' : 'rgba(122,88,8,0.2)'}
            />
            <HeroItem>
              <Typography
                sx={{
                  mt: 2.5,
                  mb: 1,
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: gold,
                }}
              >
                MASTER REPOSITORY DIRECTORY · {arsenalStats.total} LOCAL PACKAGES
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
              <Typography sx={{ color: secondaryText, maxWidth: 800, fontSize: { xs: '0.98rem', sm: '1.06rem' }, lineHeight: 1.7, mb: 2.5 }}>
                A unified index of all {arsenalStats.total} local-first repositories, CLI utilities, and loopback daemons. Instead of running fragile simulations in a web browser, clone any standalone repository directly or install the full{' '}
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
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  href="https://github.com/NullAITech/zoth-studio-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  sx={{
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
                    borderColor: borderCol,
                    color: primaryText,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2.5,
                    '&:hover': { borderColor: gold },
                  }}
                >
                  ZothOS Pre-Installed ISO →
                </Button>
              </Stack>
            </HeroItem>
          </Box>
        </HeroReveal>

        {/* Clean Summary Metrics */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 1.75,
            mb: 4,
          }}
        >
          {[
            ['Total Repositories', arsenalStats.total],
            ['Loopback Daemons', daemonCount],
            ['CLI & MCP Ready', '100%'],
            ['Outbound Telemetry', '0 WAN'],
          ].map(([label, val]) => (
            <Paper
              key={label}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '1.35rem', color: primaryText, lineHeight: 1.15 }}>
                {val}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: mono,
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: secondaryText,
                }}
              >
                {label}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Search + View Toggle */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
          <Grid xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search 77 repositories by name, ID, or capability…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: gold, fontSize: '1.15rem' }} />
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
                  fontSize: '0.85rem',
                  bgcolor: cardBg,
                  borderRadius: 2,
                },
              }}
            />
          </Grid>

          <Grid xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{
                bgcolor: cardBg,
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 1.8,
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
                <GridViewIcon sx={{ fontSize: '1rem', mr: 0.75 }} /> Grid ({filteredAssets.length})
              </ToggleButton>
              <ToggleButton value="compact">
                <ViewListIcon sx={{ fontSize: '1rem', mr: 0.75 }} /> List ({filteredAssets.length})
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Category Filter Chips */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
          {ORDERED_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat;
            const count =
              cat === 'All' ? masterArsenal.length : masterArsenal.filter((a) => a.category === cat).length;

            return (
              <Chip
                key={cat}
                clickable
                onClick={() => setCategoryFilter(cat)}
                label={`${cat} · ${count}`}
                sx={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: '0.73rem',
                  bgcolor: isSelected ? (isDark ? '#D4AF37' : '#101828') : cardBg,
                  color: isSelected ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
                  border: `1px solid ${isSelected ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
                  '&:hover': {
                    bgcolor: isSelected ? (isDark ? '#E5C158' : '#1E293B') : (isDark ? '#141824' : '#F3F4F6'),
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
              No repositories match your filter.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
              }}
              sx={{ mt: 1, fontFamily: mono, fontSize: '0.78rem', textTransform: 'none', color: primaryText, borderColor: borderCol }}
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
          <Stack spacing={1.25}>
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
                    '&:hover': { borderColor: gold },
                  }}
                >
                  <Box sx={{ minWidth: 240, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
                      <Typography
                        component={RouterLink}
                        to={asset.target}
                        sx={{ fontWeight: 800, fontSize: '0.96rem', color: primaryText, textDecoration: 'none', '&:hover': { color: gold } }}
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

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      variant="contained"
                      component={RouterLink}
                      to={asset.target}
                      sx={{
                        bgcolor: isDark ? '#D4AF37' : '#101828',
                        color: isDark ? '#08080B' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'none',
                        px: 1.75,
                      }}
                    >
                      Specs
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: borderCol,
                        color: primaryText,
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'none',
                      }}
                    >
                      GitHub
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}

        <SovereignFunnel />
      </Container>
    </Box>
  );
}
