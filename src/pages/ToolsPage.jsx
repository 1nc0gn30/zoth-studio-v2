import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TerminalIcon from '@mui/icons-material/Terminal';
import LockIcon from '@mui/icons-material/Lock';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LaunchIcon from '@mui/icons-material/Launch';
import SecurityIcon from '@mui/icons-material/Security';
import { Link as RouterLink } from 'react-router-dom';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const categories = ['All', 'Planning', 'Swarm & Core', 'AI & Knowledge', 'Security & Recon', 'Security & Steganography', 'Autonomous Web', 'Media & 3D', 'Automation'];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (pullCmd, id) => {
    navigator.clipboard.writeText(pullCmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = microTools.filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.repo.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<TerminalIcon sx={{ color: '#B8860B !important' }} />}
          label="NULLAI TOOL CATALOG & WEBGPU WORKSTATIONS"
          size="small"
          sx={{ bgcolor: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 800, mb: 1.5, px: 1 }}
        />
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.03em' }}>
          Tool Nexus <span className="text-gradient-gold">Sovereign Repositories</span>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 840, lineHeight: 1.65, fontSize: '1.05rem' }}>
          Click any WebGPU tool below to open its <span className="text-highlight-gold">Real Working In-Browser Tool Workspace</span>. For CLI or daemon-backed tools, copy the checkout command or run <span className="text-highlight-dark">Zoth OS</span> for zero-configuration out-of-the-box execution.
        </Typography>
      </Box>

      {/* Zoth OS Funnel Banner */}
      <Paper
        elevation={0}
        className="breathe-card"
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid #D4AF3744',
          borderRadius: 3,
          bgcolor: '#101828',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(16,24,40,0.15)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ maxWidth: 740 }}>
            <Chip
              icon={<RocketLaunchIcon sx={{ color: '#FDD663 !important' }} />}
              label="SOVEREIGN BARE-METAL DISTRIBUTION"
              size="small"
              sx={{ bgcolor: '#1E293B', color: '#FDD663', border: '1px solid #D4AF3766', fontWeight: 800, mb: 1.5 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FFFFFF' }}>
              Want all 25 micro-tools preinstalled ready to use?
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            placeholder="Search the catalog by name, category, or repo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#B8860B' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category Filter</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCat}
              label="Category Filter"
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tools Counter */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing <strong>{filtered.length}</strong> of <strong>{microTools.length}</strong> micro-tool repositories (
        <Box component="span" sx={{ color: '#B8860B', fontWeight: 800 }}>
          {microTools.filter((t) => t.executionType === 'webgpu').length} WebGPU In-Browser
        </Box>{' '}
        | {microTools.filter((t) => t.executionType === 'local_cli').length} Local CLI / Zoth OS)
      </Typography>

      {/* Tools Grid */}
      <Grid container spacing={3}>
        {filtered.map((tool) => {
          const isWebGPU = tool.executionType === 'webgpu';
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tool.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isWebGPU ? '1.5px solid #D4AF37' : '1px solid #EAECF0',
                  bgcolor: isWebGPU ? '#FFFFFF' : '#FAFAFA',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#D4AF37',
                    boxShadow: isWebGPU ? '0 12px 32px rgba(212, 175, 55, 0.28)' : '0 8px 22px rgba(16,24,40,0.1)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Badge Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                    {isWebGPU ? (
                      <Chip
                        icon={<FlashOnIcon sx={{ color: '#B8860B !important', fontSize: '14px !important' }} />}
                        label="⚡ WebGPU (In-Browser)"
                        size="small"
                        sx={{ bgcolor: '#FEF9E7', color: '#B8860B', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #F0E1A8' }}
                      />
                    ) : (
                      <Chip
                        icon={<LockIcon sx={{ color: '#64748B !important', fontSize: '13px !important' }} />}
                        label="Requires CLI / Zoth OS"
                        size="small"
                        sx={{ bgcolor: '#F1F5F9', color: '#475467', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #E2E8F0' }}
                      />
                    )}
                    <Chip label={`v${tool.version}`} size="small" variant="outlined" sx={{ color: '#667085', fontSize: '0.72rem', fontFamily: mono }} />
                  </Box>

                  <Typography
                    variant="h6"
                    component={RouterLink}
                    to={`/tools/${tool.id}`}
                    sx={{ color: '#101828', mb: 1, fontWeight: 800, textDecoration: 'none', display: 'block', '&:hover': { color: '#B8860B' } }}
                  >
                    {tool.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 44, fontSize: '0.86rem', lineHeight: 1.55 }}>
                    {tool.description}
                  </Typography>

                  <Box sx={{ bgcolor: isWebGPU ? '#101828' : '#F8FAFC', p: 1.25, borderRadius: 1.5, border: isWebGPU ? '1px solid #1D2939' : '1px dashed #EAECF0', fontFamily: mono, fontSize: '0.78rem', color: isWebGPU ? '#F5E6AB' : '#B8860B', wordBreak: 'break-all' }}>
                    $ {tool.pull}
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 1.5, justifyContent: 'space-between', borderTop: '1px solid #EAECF0', bgcolor: isWebGPU ? '#FEF9E733' : 'transparent' }}>
                  {isWebGPU ? (
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/tools/${tool.id}`}
                      startIcon={<FlashOnIcon />}
                      sx={{ fontWeight: 800, py: 0.9 }}
                    >
                      Open WebGPU Tool Workspace
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopy(tool.pull, tool.id)}
                        sx={{ fontWeight: 750 }}
                      >
                        {copiedId === tool.id ? 'Copied!' : 'Copy CLI'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="inherit"
                        href={tool.github || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<GitHubIcon />}
                        disabled={!tool.published || tool.localOnly}
                        sx={{ bgcolor: '#334155', color: '#FFFFFF', fontWeight: 750, '&:hover': { bgcolor: '#0F172A' } }}
                      >
                        Repo
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
