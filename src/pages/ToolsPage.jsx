import React, { useState } from 'react';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Paper, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TerminalIcon from '@mui/icons-material/Terminal';
import LockIcon from '@mui/icons-material/Lock';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LaunchIcon from '@mui/icons-material/Launch';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DnsIcon from '@mui/icons-material/Dns';
import { Link as RouterLink } from 'react-router-dom';
import { microTools } from '../data/toolsData';
import { useStudioStatus } from '../studio/useStudioStatus';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const categories = ['All', 'Planning', 'Swarm & Core', 'AI & Knowledge', 'Security & Recon', 'Security & Steganography', 'Autonomous Web', 'Media & 3D', 'Automation'];

export default function ToolsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const isBackendConnected = Boolean(status?.services);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [execFilter, setExecFilter] = useState('all'); // 'all' | 'webgpu' | 'local_cli'
  const [copiedId, setCopiedId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (pullCmd, id) => {
    navigator.clipboard.writeText(pullCmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = microTools.filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesExec = execFilter === 'all' || t.executionType === execFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.repo.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesExec && matchesSearch;
  });

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
      {/* Page Header with gold top-edge glow (ToolsPage signature) */}
      <Box sx={{ position: 'relative', mb: 4, pt: 1 }}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: 2,
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.9) 20%, #D4AF37 50%, rgba(212,175,55,0.9) 80%, transparent)'
              : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.7) 20%, #B8860B 50%, rgba(184,134,11,0.7) 80%, transparent)',
            boxShadow: isDark
              ? '0 0 18px 2px rgba(212,175,55,0.45)'
              : '0 0 12px 1px rgba(184,134,11,0.35)',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<TerminalIcon sx={{ color: `${gold.accent} !important` }} />}
            label="NULLAI TOOL CATALOG & WEBGPU WORKSTATIONS"
            size="small"
            sx={{ bgcolor: gold.wash, color: gold.accent, border: `1px solid ${isDark ? 'rgba(212,175,55,0.42)' : '#F0E1A8'}`, fontWeight: 800, px: 1 }}
          />
          {isBackendConnected ? (
            <Chip
              icon={<DnsIcon sx={{ color: isDark ? '#34D399 !important' : '#027A48 !important' }} />}
              label="127.0.0.1 BACKEND CONNECTED · ALL 25 TOOLS RUNNING LIVE"
              size="small"
              sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.14)' : '#ECFDF3', color: isDark ? '#34D399' : '#027A48', border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`, fontWeight: 800 }}
            />
          ) : (
            <Chip
              icon={<DnsIcon sx={{ color: isDark ? '#F59E0B !important' : '#92400E !important' }} />}
              label="CLOUD STATIC MODE · IN-BROWSER WEBGPU READY · CLI TOOLS REQUIRE LOCAL DAEMON"
              size="small"
              sx={{ bgcolor: isDark ? 'rgba(245,158,11,0.14)' : '#FFFBEB', color: isDark ? '#F59E0B' : '#92400E', border: `1px solid ${isDark ? 'rgba(245,158,11,0.3)' : '#FCD34D'}`, fontWeight: 800 }}
            />
          )}
        </Box>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.03em', color: theme.palette.text.primary }}>
          Tool Nexus <span className="text-gradient-gold">Sovereign Repositories</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 840, lineHeight: 1.65, fontSize: '1.05rem' }}>
          Click any WebGPU tool below to open its <span className="text-highlight-gold">Real Working In-Browser Tool Workspace</span>. For CLI or daemon-backed tools, copy the checkout command or run <span className="text-highlight-dark">Zoth OS</span> for zero-configuration out-of-the-box execution.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 4 }}>
        {[
          ['Catalog', microTools.length],
          ['In browser', microTools.filter((tool) => tool.executionType === 'webgpu').length],
          ['Local CLI', microTools.filter((tool) => tool.executionType === 'local_cli').length],
          ['Categories', categories.length - 1],
        ].map(([label, value]) => (
          <Box key={label} sx={{ p: 1.75, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
            <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '1.5rem', color: gold.accent, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 750, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Zoth OS Funnel Banner */}
      <Paper
        elevation={0}
        className="breathe-card"
        sx={{
          p: 3.5,
          mb: 5,
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.35)'}`,
          borderRadius: 3,
          bgcolor: isDark ? '#0B0B12' : '#F8FAFC',
          color: theme.palette.text.primary,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 8px 24px rgba(0,0,0,0.5), 0 0 16px -4px rgba(212,175,55,0.2)'
            : '0 8px 24px rgba(16,24,40,0.06), 0 0 16px -4px rgba(184,134,11,0.15)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ maxWidth: 740 }}>
            <Chip
              icon={<RocketLaunchIcon sx={{ color: isDark ? '#FDD663 !important' : '#B8860B !important' }} />}
              label="SOVEREIGN BARE-METAL DISTRIBUTION"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(30,41,59,0.6)' : gold.wash,
                color: isDark ? '#FDD663' : '#8A6A09',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.35)'}`,
                fontWeight: 800,
                mb: 1.5
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
              Want all 25 micro-tools preinstalled ready to use?
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Download the <strong>Zoth OS ISO</strong> image. Flash to USB or boot inside QEMU / KVM to run all 25 tools, local daemons, and 10 Ollama models with zero manual dependencies!
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/zoth-os"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<LaunchIcon />}
            className="pulse-glow-btn"
            sx={{ px: 3.5, py: 1.4, fontWeight: 800, borderRadius: 9999 }}
          >
            Get Zoth OS ISO
          </Button>
        </Box>
      </Paper>

      {/* Filter & Search Bar */}
      <TextField
        fullWidth
        placeholder="Search the catalog by name, category, or repo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: gold.accent }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Execution Substrate Mode Filters */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: gold.accent, letterSpacing: '0.06em', textTransform: 'uppercase', mr: 0.5 }}>
          Substrate:
        </Typography>
        <Chip
          label={`All Modes (${microTools.length})`}
          clickable
          onClick={() => setExecFilter('all')}
          size="small"
          sx={{
            fontWeight: 800,
            bgcolor: execFilter === 'all' ? gold.accent : theme.palette.background.paper,
            color: execFilter === 'all' ? (isDark ? '#08080B' : '#0F172A') : theme.palette.text.primary,
            border: `1px solid ${execFilter === 'all' ? gold.accent : theme.palette.divider}`,
          }}
        />
        <Chip
          icon={<FlashOnIcon sx={{ fontSize: '16px !important', color: execFilter === 'webgpu' ? (isDark ? '#08080B !important' : '#0F172A !important') : `${gold.accent} !important` }} />}
          label={`In-Browser WebGPU (${microTools.filter((t) => t.executionType === 'webgpu').length})`}
          clickable
          onClick={() => setExecFilter('webgpu')}
          size="small"
          sx={{
            fontWeight: 800,
            bgcolor: execFilter === 'webgpu' ? gold.accent : theme.palette.background.paper,
            color: execFilter === 'webgpu' ? (isDark ? '#08080B' : '#0F172A') : theme.palette.text.primary,
            border: `1px solid ${execFilter === 'webgpu' ? gold.accent : theme.palette.divider}`,
          }}
        />
        <Chip
          icon={<TerminalIcon sx={{ fontSize: '16px !important', color: execFilter === 'local_cli' ? (isDark ? '#08080B !important' : '#0F172A !important') : `${gold.accent} !important` }} />}
          label={`Local CLI Enclave (${microTools.filter((t) => t.executionType === 'local_cli').length})`}
          clickable
          onClick={() => setExecFilter('local_cli')}
          size="small"
          sx={{
            fontWeight: 800,
            bgcolor: execFilter === 'local_cli' ? gold.accent : theme.palette.background.paper,
            color: execFilter === 'local_cli' ? (isDark ? '#08080B' : '#0F172A') : theme.palette.text.primary,
            border: `1px solid ${execFilter === 'local_cli' ? gold.accent : theme.palette.divider}`,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
        {categories.map((cat) => {
          const active = selectedCat === cat;
          const count = cat === 'All' ? microTools.length : microTools.filter((tool) => tool.category === cat).length;
          return (
            <Chip
              key={cat}
              label={`${cat} · ${count}`}
              clickable
              onClick={() => setSelectedCat(cat)}
              sx={{
                fontWeight: 750,
                bgcolor: active ? gold.accent : theme.palette.background.paper,
                color: active ? (isDark ? '#08080B' : '#0F172A') : theme.palette.text.primary,
                border: '1px solid',
                borderColor: active ? gold.accent : theme.palette.divider,
              }}
            />
          );
        })}
      </Box>

      {/* Tools Counter */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing <strong>{filtered.length}</strong> of <strong>{microTools.length}</strong> micro-tool repositories (
        <Box component="span" sx={{ color: gold.accent, fontWeight: 800 }}>
          {microTools.filter((t) => t.executionType === 'webgpu').length} WebGPU In-Browser
        </Box>{' '}
        | {microTools.filter((t) => t.executionType === 'local_cli').length} Local CLI / Zoth OS)
      </Typography>

      {/* Tools Grid */}
      <Grid container spacing={3}>
        {filtered.map((tool) => {
          const isWebGPU = tool.executionType === 'webgpu';
          const isExpanded = expanded.has(tool.id);
          return (
            <Grid xs={12} sm={6} md={4} key={tool.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isWebGPU ? (isDark ? '1.5px solid #D4AF37' : '1.5px solid #B8860B') : `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  '&:hover': {
                    borderColor: gold.accent,
                    boxShadow: isWebGPU
                      ? (isDark ? '0 12px 32px rgba(212, 175, 55, 0.32)' : '0 12px 32px rgba(184, 134, 11, 0.22)')
                      : isDark
                        ? '0 8px 22px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.25), 0 0 20px -4px rgba(212,175,55,0.18)'
                        : '0 8px 22px rgba(16,24,40,0.08), 0 0 16px -4px rgba(184,134,11,0.15)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Badge Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                    {isWebGPU ? (
                      <Chip
                        icon={<FlashOnIcon sx={{ color: `${gold.accent} !important`, fontSize: '14px !important' }} />}
                        label="⚡ WebGPU (In-Browser)"
                        size="small"
                        sx={{ bgcolor: gold.wash, color: gold.accent, fontWeight: 800, fontSize: '0.72rem', border: `1px solid ${isDark ? 'rgba(212,175,55,0.42)' : 'rgba(184,134,11,0.35)'}` }}
                      />
                    ) : (
                      <Chip
                        icon={<LockIcon sx={{ color: `${theme.palette.text.secondary} !important`, fontSize: '13px !important' }} />}
                        label="Requires CLI / Zoth OS"
                        size="small"
                        sx={{ bgcolor: isDark ? 'rgba(148,163,184,0.12)' : '#F1F5F9', color: theme.palette.text.secondary, fontWeight: 700, fontSize: '0.72rem', border: `1px solid ${theme.palette.divider}` }}
                      />
                    )}
                    <Chip label={`v${tool.version}`} size="small" variant="outlined" sx={{ color: theme.palette.text.secondary, fontSize: '0.72rem', fontFamily: mono, borderColor: theme.palette.divider }} />
                  </Box>

                  <Typography
                    variant="h6"
                    component={RouterLink}
                    to={`/tools/${tool.id}`}
                    sx={{ color: theme.palette.text.primary, mb: 1, fontWeight: 800, textDecoration: 'none', display: 'block', '&:hover': { color: gold.accent } }}
                  >
                    {tool.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      fontSize: '0.86rem',
                      lineHeight: 1.55,
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {tool.description}
                  </Typography>

                  <Button
                    size="small"
                    onClick={() => toggleExpand(tool.id)}
                    endIcon={<ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />}
                    sx={{ color: gold.accent, fontWeight: 750, fontSize: '0.78rem', textTransform: 'none', p: 0, minHeight: 0, mb: 1.5, '&:hover': { backgroundColor: 'transparent', color: gold.soft } }}
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </Button>

                  <Box sx={{
                    bgcolor: isDark ? '#0B0B12' : (isWebGPU ? '#FEF9E7' : '#F8FAFC'),
                    p: 1.25,
                    borderRadius: 1.5,
                    border: isDark
                      ? (isWebGPU ? '1px solid rgba(212,175,55,0.4)' : '1px dashed rgba(255,255,255,0.18)')
                      : (isWebGPU ? '1px solid rgba(184,134,11,0.35)' : `1px dashed ${theme.palette.divider}`),
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    color: isDark ? (isWebGPU ? '#F5E6AB' : '#EDEFF2') : (isWebGPU ? '#8A6A09' : '#1E293B'),
                    wordBreak: 'break-all'
                  }}>
                    <Box component="span" sx={{ color: gold.accent, fontWeight: 800, mr: 0.75 }}>$</Box>
                    {tool.pull}
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 1.5, flexDirection: 'column', gap: 1, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? 'rgba(212,175,55,0.04)' : 'rgba(184,134,11,0.03)' }}>
                  <Button
                    fullWidth
                    size="small"
                    variant={isWebGPU ? 'contained' : 'outlined'}
                    color="primary"
                    component={RouterLink}
                    to={`/tools/${tool.id}`}
                    startIcon={isWebGPU ? <FlashOnIcon /> : <LaunchIcon />}
                    sx={{ fontWeight: 800, py: 0.85, borderRadius: 2 }}
                  >
                    {isWebGPU ? 'Launch WebGPU Workspace' : 'Launch Tool Workspace'}
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="text"
                      startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={() => handleCopy(tool.pull, tool.id)}
                      sx={{ fontWeight: 750, fontSize: '0.75rem', py: 0.4, color: gold.accent }}
                    >
                      {copiedId === tool.id ? 'Copied!' : 'Copy CLI'}
                    </Button>
                    {tool.github && (
                      <Button
                        size="small"
                        variant="text"
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHubIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ fontWeight: 700, fontSize: '0.75rem', py: 0.4, color: isDark ? '#9CA3AF' : '#475467', flexShrink: 0 }}
                      >
                        Repo
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* SOVEREIGN TOOLS SUITE INSTALLATION FUNNEL */}
      <Paper
        sx={{
          mt: 6,
          p: { xs: 3, md: 4.5 },
          borderRadius: 3,
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.45)' : 'rgba(184,134,11,0.35)'}`,
          bgcolor: isDark ? '#0B0B12' : '#0F172A',
          color: '#FFFFFF',
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 32px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RocketLaunchIcon sx={{ color: gold.accent, fontSize: '1.8rem' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                Need the Complete Air-Gapped Sovereign Suite?
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Clone Zoth Studio v2 to run all 29 tools offline with local models, or boot Zoth OS for bare-metal security parity.
              </Typography>
            </Box>
          </Box>
          <Chip
            label="100% ZERO-EGRESS AIR-GAPPED"
            size="small"
            sx={{ bgcolor: gold.wash, color: gold.accent, border: `1px solid ${gold.accent}`, fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
          />
        </Box>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid xs={12} md={6}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold.soft, mb: 0.5 }}>
                Option 1: Clone Zoth Studio v2 (Workstation Cockpit)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, flexGrow: 1, fontSize: '0.85rem' }}>
                Includes all 29 micro-tools, local WebGPU inference, STDP memory vector daemon, and Byzantine agent consensus.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: '#050508', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: '#38BDF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  git clone https://github.com/NullAITech/zoth-studio-v2.git
                </Typography>
                <IconButton size="small" onClick={() => handleCopy('git clone https://github.com/NullAITech/zoth-studio-v2.git', 'studio-funnel')} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                component="a"
                href="https://github.com/NullAITech/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                sx={{ bgcolor: gold.accent, color: '#08080B', fontWeight: 800, '&:hover': { bgcolor: gold.soft } }}
              >
                {copiedId === 'studio-funnel' ? 'Command Copied!' : 'View Zoth Studio v2 Repo ↗'}
              </Button>
            </Box>
          </Grid>

          <Grid xs={12} md={6}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#34D399', mb: 0.5 }}>
                Option 2: Boot Sovereign Zoth OS (Bare-Metal ISO)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, flexGrow: 1, fontSize: '0.85rem' }}>
                Alchemical Linux operating system based on KDE Plasma 6 with Kali/Parrot security arsenal and Tor Ghostmode.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: '#050508', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: '#34D399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  https://github.com/NullAITech/zoth-os
                </Typography>
                <IconButton size="small" onClick={() => handleCopy('https://github.com/NullAITech/zoth-os', 'os-funnel')} sx={{ color: '#94A3B8', '&:hover': { color: '#FFF' } }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                component="a"
                href="https://github.com/NullAITech/zoth-os"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{ borderColor: '#34D399', color: '#34D399', fontWeight: 800, '&:hover': { bgcolor: 'rgba(52,211,153,0.1)' } }}
              >
                {copiedId === 'os-funnel' ? 'Link Copied!' : 'Explore & Install Zoth OS ↗'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
