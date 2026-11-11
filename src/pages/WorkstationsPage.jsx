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
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ClearIcon from '@mui/icons-material/Clear';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import LayersIcon from '@mui/icons-material/Layers';
import PaletteIcon from '@mui/icons-material/Palette';
import HubIcon from '@mui/icons-material/Hub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';

import { workstations } from '../data/workstations';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const ORDERED_BANDS = ['Build', 'Observe', 'Security', 'Spatial', 'Studio', 'Swarm & Consensus'];

const BAND_CONFIG = {
  Build: {
    color: '#F59E0B',
    lightColor: '#92400E',
    icon: CodeIcon,
    description: 'Local compilation pipelines, code synthesis engines & AST verification modules',
    svgPos: { x: 460, y: 75 },
  },
  Observe: {
    color: '#38BDF8',
    lightColor: '#0369A1',
    icon: VisibilityIcon,
    description: 'Telemetry arrays, audit flight recorders & mathematical proof specifications',
    svgPos: { x: 740, y: 145 },
  },
  'Swarm & Consensus': {
    color: '#34D399',
    lightColor: '#047857',
    icon: HubIcon,
    description: 'Byzantine quorum engines, IPC bridges & Pantheon multi-agent dispatchers',
    svgPos: { x: 740, y: 335 },
  },
  Security: {
    color: '#F87171',
    lightColor: '#B91C1C',
    icon: SecurityIcon,
    description: 'Entropy monitors, prompt firewalls, egress sentinels & red-team audit suites',
    svgPos: { x: 460, y: 405 },
  },
  Spatial: {
    color: '#C084FC',
    lightColor: '#6D28D9',
    icon: LayersIcon,
    description: '3D scene geometry generators, shader compilers & kinematics pipelines',
    svgPos: { x: 180, y: 335 },
  },
  Studio: {
    color: '#F472B6',
    lightColor: '#9D174D',
    icon: PaletteIcon,
    description: 'Synaptic memory hubs, knowledge graphs & local workspace orchestration',
    svgPos: { x: 180, y: 145 },
  },
};

function WorkstationCard({ item, isDark, gold, primaryText, secondaryText, cardBg, codeBg, borderCol }) {
  const [copied, setCopied] = useState(false);
  const bandMeta = BAND_CONFIG[item.band] || BAND_CONFIG.Build;
  const bandColor = isDark ? bandMeta.color : bandMeta.lightColor;
  const typeLabel =
    item.type === 'integrated_tool'
      ? 'STANDALONE REPO'
      : item.type === 'enclave_daemon'
        ? 'LOOPBACK DAEMON'
        : 'STUDIO MODULE';

  const targetHref = item.alsoInApp || `/workstations/${item.id}`;
  const cloneCmd = item.pullCommand || 'git clone https://github.com/NullAITech/zoth-studio-v2.git';

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
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        border: `1px solid ${borderCol}`,
        bgcolor: cardBg,
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: gold,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.67rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: bandColor,
              textTransform: 'uppercase',
            }}
          >
            {item.band}
          </Typography>
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.66rem',
              fontWeight: 700,
              color: secondaryText,
            }}
          >
            {typeLabel}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          component={RouterLink}
          to={targetHref}
          sx={{
            fontSize: '1.04rem',
            fontWeight: 800,
            lineHeight: 1.34,
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
            fontSize: '0.84rem',
            lineHeight: 1.58,
            mb: 2,
          }}
        >
          {item.description || 'Local-first module integrated inside the Zoth Studio v2 repository.'}
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
              fontSize: '0.69rem',
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
          to={targetHref}
          endIcon={<ArrowForwardIcon sx={{ fontSize: '0.9rem !important' }} />}
          sx={{
            bgcolor: isDark ? '#D4AF37' : '#101828',
            color: isDark ? '#08080B' : '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.76rem',
            textTransform: 'none',
            px: 1.75,
            '&:hover': { bgcolor: isDark ? '#E5C158' : '#1E293B' },
          }}
        >
          Architecture Specs
        </Button>

        <Button
          size="small"
          variant="outlined"
          href="https://github.com/NullAITech/zoth-studio-v2"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<GitHubIcon sx={{ fontSize: '0.88rem !important' }} />}
          sx={{
            borderColor: borderCol,
            color: primaryText,
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'none',
            px: 1.35,
            '&:hover': { borderColor: gold },
          }}
        >
          Studio Repo
        </Button>
      </CardActions>
    </Card>
  );
}

export default function WorkstationsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [band, setBand] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const gold = isDark ? '#D4AF37' : '#7A5808';
  const primaryText = isDark ? '#F5F1E6' : '#101828';
  const secondaryText = isDark ? '#A3AAB8' : '#475467';
  const cardBg = isDark ? '#0D0F16' : '#FFFFFF';
  const codeBg = isDark ? '#080A0F' : '#F3F4F6';
  const borderCol = isDark ? 'rgba(245, 241, 230, 0.12)' : 'rgba(16, 24, 40, 0.12)';

  const bandCounts = useMemo(() => {
    const counts = {};
    for (const item of workstations) {
      counts[item.band] = (counts[item.band] || 0) + 1;
    }
    return counts;
  }, []);

  const typeCounts = useMemo(() => {
    const counts = { all: workstations.length, cockpit: 0, integrated_tool: 0, enclave_daemon: 0 };
    for (const item of workstations) {
      if (item.type && counts[item.type] !== undefined) counts[item.type]++;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workstations.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (band !== 'All' && item.band !== band) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.band.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [typeFilter, band, search]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      {/* Header */}
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
              SYSTEM ARCHITECTURE INDEX · {workstations.length} LOCAL MODULES
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography
              component="h1"
              sx={{
                fontFamily: display,
                fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.4rem' },
                fontWeight: 400,
                lineHeight: 1.08,
                color: primaryText,
                mb: 1.75,
              }}
            >
              Architecture &amp; Daemon Dossiers
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography sx={{ color: secondaryText, maxWidth: 800, fontSize: { xs: '0.98rem', md: '1.05rem' }, lineHeight: 1.7 }}>
              Structural taxonomy of the {workstations.length} local IDE modules, standalone repositories, and loopback hardware daemons inside{' '}
              <Box
                component="a"
                href="https://github.com/NullAITech/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: gold, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Zoth Studio v2
              </Box>
              . Clone the repository to run the local Express/IPC server on <code>127.0.0.1:3000</code>, or run all 77 tools natively inside ZothOS.
            </Typography>
          </HeroItem>
        </Box>
      </HeroReveal>

      {/* Taxonomy 3-Column Overview */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: `1. Studio Modules (${typeCounts.cockpit})`,
            desc: 'Local operator views inside Zoth Studio v2 for composing agent DAGs, inspecting ASTs, and supervising local inference.',
          },
          {
            title: '2. Standalone Repositories (77)',
            desc: 'Independent Git repositories with dedicated CLI binaries and MCP interfaces that run without browser dependencies.',
          },
          {
            title: `3. Loopback Daemons (${typeCounts.enclave_daemon})`,
            desc: 'Background services (Pantheon Swarm :8141, Neuro-Memory :8094, HexStrike :8138) bound strictly to localhost.',
          },
        ].map((col) => (
          <Grid xs={12} md={4} key={col.title} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                width: '100%',
                borderRadius: 2,
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: primaryText, mb: 0.75 }}>
                {col.title}
              </Typography>
              <Typography variant="body2" sx={{ color: secondaryText, fontSize: '0.84rem', lineHeight: 1.6 }}>
                {col.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Controls */}
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
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, next) => next && setViewMode(next)}
          size="small"
          sx={{
            bgcolor: cardBg,
            borderRadius: 2,
            alignSelf: 'flex-start',
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.78rem',
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
            <GridViewIcon sx={{ fontSize: '1rem', mr: 0.8 }} /> Grid ({filtered.length})
          </ToggleButton>
          <ToggleButton value="topology">
            <AccountTreeIcon sx={{ fontSize: '1rem', mr: 0.8 }} /> Cadre Topology
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder={`Search ${workstations.length} architecture modules…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: gold }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Clear search" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            minWidth: { xs: '100%', md: 360 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: cardBg,
              fontFamily: mono,
              fontSize: '0.84rem',
            },
          }}
        />
      </Box>

      {/* Type Filter Chips */}
      <Box sx={{ display: 'flex', gap: 0.9, flexWrap: 'wrap', mb: 1.75 }}>
        {[
          { id: 'all', label: `All (${workstations.length})` },
          { id: 'cockpit', label: `Studio Modules (${typeCounts.cockpit})` },
          { id: 'integrated_tool', label: `Tool Integrations (${typeCounts.integrated_tool})` },
          { id: 'enclave_daemon', label: `Loopback Daemons (${typeCounts.enclave_daemon})` },
        ].map((t) => {
          const active = typeFilter === t.id;
          return (
            <Chip
              key={t.id}
              label={t.label}
              clickable
              onClick={() => setTypeFilter(t.id)}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.73rem',
                bgcolor: active ? (isDark ? '#D4AF37' : '#101828') : cardBg,
                color: active ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
                border: `1px solid ${active ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
              }}
            />
          );
        })}
      </Box>

      {/* Band Filter Chips */}
      <Box sx={{ display: 'flex', gap: 0.9, flexWrap: 'wrap', mb: 3.5 }}>
        <Chip
          label={`All Bands · ${workstations.length}`}
          clickable
          onClick={() => setBand('All')}
          sx={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: '0.73rem',
            bgcolor: band === 'All' ? (isDark ? '#D4AF37' : '#101828') : cardBg,
            color: band === 'All' ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
            border: `1px solid ${band === 'All' ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
          }}
        />
        {ORDERED_BANDS.map((item) => {
          const active = item === band;
          return (
            <Chip
              key={item}
              label={`${item} · ${bandCounts[item] || 0}`}
              clickable
              onClick={() => setBand(item)}
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.73rem',
                bgcolor: active ? (isDark ? '#D4AF37' : '#101828') : cardBg,
                color: active ? (isDark ? '#08080B' : '#FFFFFF') : primaryText,
                border: `1px solid ${active ? (isDark ? '#D4AF37' : '#101828') : borderCol}`,
              }}
            />
          );
        })}
      </Box>

      {/* Topology Diagram */}
      {viewMode === 'topology' && (
        <RevealOnScroll preset="fadeUp">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              mb: 4,
              borderRadius: 2.5,
              bgcolor: cardBg,
              border: `1px solid ${borderCol}`,
            }}
          >
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 700, color: gold, letterSpacing: '0.14em', mb: 0.5 }}>
              CADRE TOPOLOGY · 6 ARCHITECTURAL BANDS
            </Typography>
            <Typography variant="body2" sx={{ color: secondaryText, mb: 2 }}>
              Click any cadre node to filter modules in that band.
            </Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <svg
                viewBox="0 0 920 480"
                style={{
                  width: '100%',
                  height: 'auto',
                  minWidth: 660,
                  display: 'block',
                  background: isDark ? '#090B10' : '#FAF8F3',
                  borderRadius: 8,
                }}
              >
                <circle cx="460" cy="240" r="105" fill="none" stroke={borderCol} strokeWidth="1" strokeDasharray="3 6" />
                <circle cx="460" cy="240" r="195" fill="none" stroke={borderCol} strokeWidth="1" strokeDasharray="4 8" />

                {ORDERED_BANDS.map((bName) => {
                  const cfg = BAND_CONFIG[bName];
                  const col = isDark ? cfg.color : cfg.lightColor;
                  const active = band === 'All' || band === bName;
                  return (
                    <line
                      key={`line-${bName}`}
                      x1="460"
                      y1="240"
                      x2={cfg.svgPos.x}
                      y2={cfg.svgPos.y}
                      stroke={band === bName ? col : borderCol}
                      strokeWidth={band === bName ? 2.5 : 1.4}
                      opacity={active ? 1 : 0.4}
                    />
                  );
                })}

                <g style={{ cursor: 'pointer' }} onClick={() => setBand('All')}>
                  <circle cx="460" cy="240" r="46" fill={cardBg} stroke={gold} strokeWidth="2" />
                  <text x="460" y="236" textAnchor="middle" fill={primaryText} fontSize="10" fontWeight="800" fontFamily={mono}>
                    ZOTH CORE
                  </text>
                  <text x="460" y="251" textAnchor="middle" fill={secondaryText} fontSize="8.5" fontFamily={mono}>
                    127.0.0.1
                  </text>
                </g>

                {ORDERED_BANDS.map((bName) => {
                  const cfg = BAND_CONFIG[bName];
                  const col = isDark ? cfg.color : cfg.lightColor;
                  const count = bandCounts[bName] || 0;
                  const hx = cfg.svgPos.x;
                  const hy = cfg.svgPos.y;
                  return (
                    <g
                      key={`hub-${bName}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setBand(band === bName ? 'All' : bName)}
                    >
                      <circle cx={hx} cy={hy} r="28" fill={cardBg} stroke={col} strokeWidth={band === bName ? 3 : 2} />
                      <text x={hx} y={hy + 4} textAnchor="middle" fill={col} fontSize="13" fontWeight="800" fontFamily={mono}>
                        {count}
                      </text>
                      <text
                        x={hx}
                        y={hy + (hy > 240 ? 44 : -36)}
                        textAnchor="middle"
                        fill={primaryText}
                        fontSize="11"
                        fontWeight="800"
                        fontFamily={mono}
                      >
                        {bName.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Box>
          </Paper>
        </RevealOnScroll>
      )}

      {/* Module Grid */}
      {filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            bgcolor: cardBg,
            border: `1px dashed ${borderCol}`,
            borderRadius: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ color: primaryText, mb: 1 }}>
            No modules matched your filter
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setBand('All');
              setTypeFilter('all');
              setSearch('');
            }}
            sx={{ borderColor: borderCol, color: primaryText, textTransform: 'none' }}
          >
            Reset Filters
          </Button>
        </Paper>
      ) : (
        <StaggerChildren>
          <Grid container spacing={2.5}>
            {filtered.map((item) => (
              <Grid xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex' }}>
                <StaggerItem style={{ display: 'flex', width: '100%' }}>
                  <WorkstationCard
                    item={item}
                    isDark={isDark}
                    gold={gold}
                    primaryText={primaryText}
                    secondaryText={secondaryText}
                    cardBg={cardBg}
                    codeBg={codeBg}
                    borderCol={borderCol}
                  />
                </StaggerItem>
              </Grid>
            ))}
          </Grid>
        </StaggerChildren>
      )}

      <Divider sx={{ my: 2, borderColor: 'transparent' }} />
      <SovereignFunnel
        title="Run Zoth Studio Locally"
        subtitle="Clone the Zoth Studio v2 repository to run the local Express/IPC server and connect directly to loopback daemons on your machine."
        toolTitle="Option 1: Zoth Studio v2 Repo"
        toolTag="MONOREPO"
        toolDescription="Full source repository containing all 6 architectural bands, local IPC bridges, and test suites."
        toolRepo="https://github.com/NullAITech/zoth-studio-v2"
        toolCommand="git clone https://github.com/NullAITech/zoth-studio-v2.git"
      />
    </Container>
  );
}
