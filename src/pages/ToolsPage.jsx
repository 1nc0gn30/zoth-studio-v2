import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GitHubIcon from '@mui/icons-material/GitHub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TerminalIcon from '@mui/icons-material/Terminal';
import LockIcon from '@mui/icons-material/Lock';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link as RouterLink } from 'react-router-dom';
import { microTools } from '../data/toolsData';
import WebGPUAIConsole from '../components/WebGPUAIConsole';
import VaultConsole from '../components/VaultConsole';

const categories = ['All', 'Planning', 'Swarm & Core', 'AI & Knowledge', 'Security & Recon', 'Security & Steganography', 'Autonomous Web', 'Media & 3D', 'Automation'];

export default function ToolsPage() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [activeWebGpuModal, setActiveWebGpuModal] = useState(null);

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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<TerminalIcon sx={{ color: '#B8860B !important' }} />}
          label="NULLAI TOOL CATALOG & WORKSTATIONS"
          size="small"
          sx={{ bgcolor: '#FEF9E7', color: '#B8860B', border: '1px solid #F0E1A8', fontWeight: 700, mb: 1.5, px: 1 }}
        />
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
          Tool Nexus Sovereign Repositories
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820 }}>
          WebGPU-enabled tools run instantly in your browser below. For daemon-backed or deep local CLI tools, pull the repo or flash <strong>Zoth OS</strong> for zero-configuration out-of-the-box execution.
        </Typography>
      </Box>

      {/* Zoth OS Funnel Banner */}
      <Paper
        elevation={0}
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
          <Box sx={{ maxWidth: 720 }}>
            <Chip
              icon={<RocketLaunchIcon sx={{ color: '#FDD663 !important' }} />}
              label="ZERO-HASSIEN INSTANT VM / USB OS"
              size="small"
              sx={{ bgcolor: '#1E293B', color: '#FDD663', border: '1px solid #D4AF3766', fontWeight: 800, mb: 1.5 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#FFFFFF' }}>
              Want all 24 micro-tools preinstalled ready to use?
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
              Download the <strong>Zoth OS ISO</strong> image. Flash to a USB drive or boot inside QEMU / KVM to get all 24 tools, local daemons, and 10 Ollama models preconfigured out of the box with zero manual dependencies!
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/zoth-os"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<LaunchIcon />}
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
        <Box component="span" sx={{ color: '#B8860B', fontWeight: 700 }}>
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
                  opacity: isWebGPU ? 1.0 : 0.92,
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  '&:hover': {
                    borderColor: '#D4AF37',
                    boxShadow: isWebGPU ? '0 10px 28px rgba(212, 175, 55, 0.25)' : '0 6px 18px rgba(16,24,40,0.08)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Badge Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                    {isWebGPU ? (
                      <Chip
                        icon={<FlashOnIcon sx={{ color: '#B8860B !important', fontSize: '14px !important' }} />}
                        label="WebGPU (In-Browser)"
                        size="small"
                        sx={{ bgcolor: '#FEF9E7', color: '#B8860B', fontWeight: 800, fontSize: '0.72rem', border: '1px solid #F0E1A8' }}
                      />
                    ) : (
                      <Chip
                        icon={<LockIcon sx={{ color: '#64748B !important', fontSize: '13px !important' }} />}
                        label="Requires Local CLI / Zoth OS"
                        size="small"
                        sx={{ bgcolor: '#F1F5F9', color: '#475467', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #E2E8F0' }}
                      />
                    )}
                    <Chip label={`v${tool.version}`} size="small" variant="outlined" sx={{ color: '#667085', fontSize: '0.72rem', fontFamily: 'monospace' }} />
                  </Box>

                  <Typography variant="h6" sx={{ color: '#101828', mb: 1, fontWeight: 800 }}>
                    {tool.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 44, fontSize: '0.86rem', lineHeight: 1.5 }}>
                    {tool.description}
                  </Typography>

                  <Box sx={{ bgcolor: isWebGPU ? '#101828' : '#F8FAFC', p: 1.25, borderRadius: 1.5, border: isWebGPU ? '1px solid #1D2939' : '1px dashed #EAECF0', fontFamily: 'monospace', fontSize: '0.78rem', color: isWebGPU ? '#F5E6AB' : '#B8860B', wordBreak: 'break-all' }}>
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
                      startIcon={<FlashOnIcon />}
                      onClick={() => setActiveWebGpuModal(tool)}
                      sx={{ fontWeight: 800, py: 0.9 }}
                    >
                      Run In-Browser Tool
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => handleCopy(tool.pull, tool.id)}
                        sx={{ fontWeight: 700 }}
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
                        disabled={!tool.published}
                        sx={{ bgcolor: '#334155', color: '#FFFFFF', fontWeight: 700, '&:hover': { bgcolor: '#0F172A' } }}
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

      {/* WebGPU Interactive Tool Runner Dialog Modal */}
      <Dialog
        open={Boolean(activeWebGpuModal)}
        onClose={() => setActiveWebGpuModal(null)}
        maxWidth="md"
        fullWidth
      >
        {activeWebGpuModal && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#101828', color: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FlashOnIcon sx={{ color: '#D4AF37' }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {activeWebGpuModal.name} — WebGPU In-Browser Engine
                </Typography>
              </Box>
              <Chip label="IN-BROWSER EXECUTABLE" size="small" sx={{ bgcolor: '#FEF9E7', color: '#B8860B', fontWeight: 800 }} />
            </DialogTitle>
            <DialogContent sx={{ py: 3, bgcolor: '#FAFAFA' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {activeWebGpuModal.description} Version recorded in local catalog: {activeWebGpuModal.version}.
              </Typography>

              {activeWebGpuModal.id === 'payload-entropy-studio' || activeWebGpuModal.id === 'jwt-inspector-guard' ? (
                <VaultConsole />
              ) : (
                <WebGPUAIConsole />
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #EAECF0' }}>
              <Button onClick={() => setActiveWebGpuModal(null)} variant="outlined">
                Close Runner
              </Button>
              <Button component={RouterLink} to="/zoth-os" variant="contained" color="primary" startIcon={<RocketLaunchIcon />}>
                Get Full Zoth OS Suite
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </Container>
  );
}
