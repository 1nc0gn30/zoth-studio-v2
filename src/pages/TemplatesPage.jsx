import React, { useMemo, useState } from 'react';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Tabs, Tab, Alert, IconButton, Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TerminalIcon from '@mui/icons-material/Terminal';
import LayersIcon from '@mui/icons-material/Layers';
import { templates } from '../data/templates';
import { useStudioStatus } from '../studio/useStudioStatus';
import SovereignFunnel from '../components/SovereignFunnel';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const CLASSIC = 'http://127.0.0.1:8088';

export default function TemplatesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openableOnly, setOpenableOnly] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [dialogTab, setDialogTab] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState('');
  const { status } = useStudioStatus();
  const classicUp = Boolean(status?.services?.classic?.up);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
  };

  const categories = useMemo(() => {
    const counts = new Map();
    for (const item of templates) counts.set(item.category, (counts.get(item.category) || 0) + 1);
    return [['All', templates.length], ...Array.from(counts.entries())];
  }, []);

  const filtered = templates.filter((item) => {
    if (category !== 'All' && item.category !== category) return false;
    if (openableOnly && !item.openable) return false;
    const q = search.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
  });

  const openableCount = templates.filter((item) => item.openable).length;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(''), 1800);
  };

  return (
    <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Top Gold Illumination Line */}
      <Box sx={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #D4AF37 0%, transparent 60%)', mb: 3 }} />

      <Typography variant="overline" sx={{ color: gold.accent, letterSpacing: '0.18em', fontWeight: 800 }}>
        OPEN-SOURCE TEMPLATE REPOSITORY // 215+ REPRODUCIBLE BLUEPRINTS
      </Typography>
      <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', mb: 1 }}>
        Templates &amp; Agent Scaffolds
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 840, fontSize: '1.05rem', lineHeight: 1.6 }}>
        Zero-egress web and agent templates curated from the Zoth open-source library. Inspect project architectures, stack configurations, and offline build scripts directly in v2.
      </Typography>

      {/* Status Bar */}
      <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', bgcolor: theme.palette.background.paper }}>
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: isDark ? '#34D399' : '#027A48' }} />}
          size="small"
          label={`${templates.length} Curated Templates Viewable in v2`}
          sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.14)' : '#ECFDF3', color: isDark ? '#34D399' : '#027A48', border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`, fontWeight: 800 }}
        />
        <Chip
          size="small"
          label={`${openableCount} Offline HTML Previews`}
          sx={{ bgcolor: gold.wash, color: gold.soft, fontWeight: 750, border: `1px solid ${isDark ? 'rgba(212,175,55,0.42)' : 'rgba(184,134,11,0.3)'}` }}
        />
        <Chip
          size="small"
          label={classicUp ? 'Live Preview Server Online · :8088' : 'Classic Server Standby (Optional)'}
          sx={{
            bgcolor: classicUp ? (isDark ? 'rgba(52,211,153,0.15)' : '#ECFDF3') : (isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F7'),
            color: classicUp ? (isDark ? '#34D399' : '#027A48') : theme.palette.text.secondary,
            fontWeight: 700,
            border: '1px solid',
            borderColor: classicUp ? (isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0') : theme.palette.divider
          }}
        />
      </Paper>

      {/* Search & Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search templates by name, framework, or category..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: gold.accent }} /></InputAdornment> }}
          sx={{ flex: '1 1 260px' }}
        />
        <Chip
          label={openableOnly ? 'Openable only (Active)' : 'All templates'}
          clickable
          onClick={() => setOpenableOnly((value) => !value)}
          sx={{
            fontWeight: 750,
            alignSelf: 'center',
            bgcolor: openableOnly ? gold.accent : theme.palette.background.paper,
            color: openableOnly ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
            border: '1px solid',
            borderColor: openableOnly ? gold.accent : theme.palette.divider
          }}
        />
      </Box>

      {/* Category Pills */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {categories.map(([name, count]) => {
          const active = name === category;
          return (
            <Chip
              key={name}
              label={`${name} · ${count}`}
              clickable
              onClick={() => setCategory(name)}
              sx={{
                fontWeight: 750,
                bgcolor: active ? gold.accent : theme.palette.background.paper,
                color: active ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
                border: '1px solid',
                borderColor: active ? gold.accent : theme.palette.divider,
              }}
            />
          );
        })}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing <strong>{filtered.length}</strong> of <strong>{templates.length}</strong> templates
      </Typography>

      {/* Template Cards Grid */}
      <Grid container spacing={2}>
        {filtered.map((item) => (
          <Grid xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: isDark ? '#D4AF37' : '#B8860B',
                boxShadow: isDark
                  ? '0 8px 24px rgba(0,0,0,0.4), 0 0 16px -2px rgba(212,175,55,0.2)'
                  : '0 8px 20px rgba(16,24,40,0.08), 0 0 12px -2px rgba(184,134,11,0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={item.category}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F2F4F7',
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                  {item.openable && (
                    <Chip
                      label="Offline HTML"
                      size="small"
                      sx={{
                        bgcolor: isDark ? 'rgba(52,211,153,0.15)' : '#ECFDF3',
                        color: isDark ? '#34D399' : '#027A48',
                        border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
                        fontWeight: 750,
                        fontSize: '0.68rem'
                      }}
                    />
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 750, textTransform: 'capitalize', lineHeight: 1.35, color: theme.palette.text.primary }}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontFamily: mono, fontSize: '0.72rem', wordBreak: 'break-all' }}>
                  {item.id}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap', borderTop: `1px solid ${theme.palette.divider}`, bgcolor: isDark ? 'rgba(212,175,55,0.03)' : 'rgba(184,134,11,0.02)' }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CodeIcon />}
                  onClick={() => {
                    setSelectedTemplate(item);
                    setDialogTab(0);
                  }}
                  sx={{
                    bgcolor: isDark ? gold.accent : '#D4AF37',
                    color: '#101828',
                    fontWeight: 750,
                    '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#E4C56A' }
                  }}
                >
                  Inspect
                </Button>
                {item.openable && classicUp && (
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<LaunchIcon sx={{ fontSize: '0.85rem' }} />}
                    href={`${CLASSIC}${item.path}`}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    :8088
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Multi-Tab Template Inspector Dialog */}
      {selectedTemplate && (
        <Dialog
          open={Boolean(selectedTemplate)}
          onClose={() => setSelectedTemplate(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: theme.palette.background.paper,
              backgroundImage: 'none',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.35)' : theme.palette.divider}`,
              borderRadius: 3,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LayersIcon sx={{ color: gold.accent }} />
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                {selectedTemplate.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={selectedTemplate.category} size="small" sx={{ bgcolor: gold.wash, color: gold.soft, border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : 'rgba(184,134,11,0.3)'}`, fontWeight: 800 }} />
              {selectedTemplate.openable && (
                <Chip label="HTML Pre-rendered" size="small" sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.18)' : '#ECFDF3', color: isDark ? '#34D399' : '#027A48', border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`, fontWeight: 800 }} />
              )}
            </Box>
          </DialogTitle>

          <Tabs
            value={dialogTab}
            onChange={(e, v) => setDialogTab(v)}
            sx={{ px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Tab label="Overview & Launch" sx={{ fontWeight: 750 }} />
            <Tab label="File Tree Blueprint" sx={{ fontWeight: 750 }} />
            <Tab label="Dependencies & Scripts" sx={{ fontWeight: 750 }} />
            <Tab label="Netlify Deploy" sx={{ fontWeight: 750 }} />
          </Tabs>

          <DialogContent sx={{ p: 3 }}>
            {/* Tab 0: Overview & Launch */}
            {dialogTab === 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: gold.accent }}>
                  Source Path in Repository
                </Typography>
                <Paper sx={{
                  p: 1.5,
                  bgcolor: isDark ? '#08080B' : '#0F172A',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#334155'}`,
                  color: isDark ? '#F5E6AB' : '#F8FAFC',
                  fontFamily: mono,
                  fontSize: '0.82rem',
                  mb: 2.5,
                  borderRadius: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{selectedTemplate.path || `/templates-source/${selectedTemplate.id}/`}</span>
                  <IconButton size="small" onClick={() => copyToClipboard(selectedTemplate.path || `/templates-source/${selectedTemplate.id}/`, 'path')}>
                    {copiedCmd === 'path' ? <CheckIcon sx={{ color: isDark ? '#34D399' : '#4ADE80', fontSize: '1rem' }} /> : <ContentCopyIcon sx={{ fontSize: '1rem', color: isDark ? '#F5E6AB' : '#94A3B8' }} />}
                  </IconButton>
                </Paper>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Local Run &amp; Install Command
                </Typography>
                <Paper sx={{
                  p: 2,
                  bgcolor: isDark ? '#08080B' : '#0F172A',
                  border: `1px solid ${isDark ? 'rgba(56,189,248,0.3)' : '#334155'}`,
                  color: isDark ? '#38BDF8' : '#7DD3FC',
                  fontFamily: mono,
                  fontSize: '0.85rem',
                  mb: 2.5,
                  borderRadius: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <code>cd "{selectedTemplate.path ? selectedTemplate.path.replace(/^\//, '') : `templates-source/${selectedTemplate.id}`}" && npm install && npm run dev</code>
                  <IconButton size="small" onClick={() => copyToClipboard(`cd "${selectedTemplate.path ? selectedTemplate.path.replace(/^\//, '') : `templates-source/${selectedTemplate.id}`}" && npm install && npm run dev`, 'cmd')}>
                    {copiedCmd === 'cmd' ? <CheckIcon sx={{ color: isDark ? '#34D399' : '#4ADE80', fontSize: '1.1rem' }} /> : <ContentCopyIcon sx={{ fontSize: '1.1rem', color: isDark ? '#38BDF8' : '#7DD3FC' }} />}
                  </IconButton>
                </Paper>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  CLI Quick Scaffolder
                </Typography>
                <Paper sx={{
                  p: 1.5,
                  bgcolor: isDark ? '#0A0D15' : '#F8FAFC',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`,
                  borderRadius: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.82rem', color: theme.palette.text.primary }}>
                    <Box component="span" sx={{ color: gold.accent, fontWeight: 800, mr: 0.75 }}>$</Box>
                    npx zoth clone {selectedTemplate.id.split('/').pop()}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => copyToClipboard(`npx zoth clone ${selectedTemplate.id.split('/').pop()}`, 'npx')}>
                    {copiedCmd === 'npx' ? 'Copied' : 'Copy'}
                  </Button>
                </Paper>

                <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
                  All template code compiles without requiring external cloud endpoints. Local assets and styling bundle deterministically.
                </Alert>
              </Box>
            )}

            {/* Tab 1: File Tree Blueprint */}
            {dialogTab === 1 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: theme.palette.text.primary }}>
                  Project Scaffold Hierarchy
                </Typography>
                <Paper sx={{
                  p: 2,
                  bgcolor: isDark ? '#08080B' : '#0F172A',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#334155'}`,
                  color: '#F8FAFC',
                  fontFamily: mono,
                  fontSize: '0.82rem',
                  borderRadius: 1.5
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <FolderIcon sx={{ color: '#D4AF37', fontSize: '1.1rem' }} />
                    <strong>{selectedTemplate.id.split('/').pop()}</strong>/
                  </Box>
                  <Box sx={{ pl: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <FolderIcon sx={{ color: '#60A5FA', fontSize: '1rem' }} />
                      <span>src/</span>
                    </Box>
                    <Box sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#38BDF8' }}>
                        <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> App.jsx
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#38BDF8' }}>
                        <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> main.jsx
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#38BDF8' }}>
                        <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> index.css
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <FolderIcon sx={{ color: '#60A5FA', fontSize: '1rem' }} />
                      <span>public/</span>
                    </Box>
                    <Box sx={{ pl: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#34D399' }}>
                        <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> index.html
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#34D399' }}>
                        <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> favicon.ico
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#F5E6AB' }}>
                      <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> package.json
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#F5E6AB' }}>
                      <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> vite.config.js
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#A78BFA' }}>
                      <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> netlify.toml
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94A3B8' }}>
                      <InsertDriveFileIcon sx={{ fontSize: '0.9rem' }} /> README.md
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Tab 2: Dependencies & Scripts */}
            {dialogTab === 2 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Pre-configured npm Scripts
                </Typography>
                <Stack spacing={1} sx={{ mb: 2.5 }}>
                  <Paper sx={{
                    p: 1.5,
                    bgcolor: isDark ? '#0A0D15' : '#F8FAFC',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1.5
                  }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? '#38BDF8' : '#0284C7' }}>npm run dev</Typography>
                    <Typography variant="caption" color="text.secondary">Starts Vite local HMR server (default :3000)</Typography>
                  </Paper>
                  <Paper sx={{
                    p: 1.5,
                    bgcolor: isDark ? '#0A0D15' : '#F8FAFC',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1.5
                  }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? '#34D399' : '#059669' }}>npm run build</Typography>
                    <Typography variant="caption" color="text.secondary">Compiles static production distribution to dist/</Typography>
                  </Paper>
                  <Paper sx={{
                    p: 1.5,
                    bgcolor: isDark ? '#0A0D15' : '#F8FAFC',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 1.5
                  }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? '#D4AF37' : '#92400E' }}>npm run preview</Typography>
                    <Typography variant="caption" color="text.secondary">Spins up local zero-egress preview server</Typography>
                  </Paper>
                </Stack>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Primary Stack Foundations
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="React 18" size="small" variant="outlined" sx={{ borderColor: theme.palette.divider }} />
                  <Chip label="Vite 5" size="small" variant="outlined" sx={{ borderColor: theme.palette.divider }} />
                  <Chip label="Tailwind / Emotion" size="small" variant="outlined" sx={{ borderColor: theme.palette.divider }} />
                  <Chip label="Zero-Egress Netlify Functions" size="small" variant="outlined" sx={{ borderColor: theme.palette.divider }} />
                </Box>
              </Box>
            )}

            {/* Tab 3: Netlify Deploy */}
            {dialogTab === 3 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
                  Production netlify.toml Configuration
                </Typography>
                <Paper sx={{
                  p: 2,
                  bgcolor: isDark ? '#08080B' : '#0F172A',
                  border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#334155'}`,
                  color: isDark ? '#34D399' : '#4ADE80',
                  fontFamily: mono,
                  fontSize: '0.8rem',
                  borderRadius: 1.5,
                  mb: 2,
                  whiteSpace: 'pre-wrap'
                }}>
{`[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"`}
                </Paper>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(`[build]\n  command = "npm run build"\n  publish = "dist"\n\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200`, 'toml')}
                >
                  {copiedCmd === 'toml' ? 'Copied netlify.toml' : 'Copy netlify.toml Snippet'}
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            {selectedTemplate.openable && classicUp && (
              <Button
                variant="outlined"
                endIcon={<LaunchIcon />}
                href={`${CLASSIC}${selectedTemplate.path}`}
                target="_blank"
                rel="noreferrer"
              >
                Open on :8088
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => setSelectedTemplate(null)}
              sx={{
                bgcolor: gold.accent,
                color: isDark ? '#08080B' : '#FFFFFF',
                fontWeight: 750,
                '&:hover': { bgcolor: isDark ? '#F5E6AB' : '#9A7008' }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Sovereign Installation Funnel */}
      <SovereignFunnel
        title="Deploy Offline Application Templates Locally"
        subtitle="Every template in this library is designed for zero-telemetry local compilation, isolated Docker sandboxing, or one-click export into Zoth OS."
        toolTitle="Option 1: Template Boilerplate Generator"
        toolTag="BOILERPLATE"
        toolDescription="Generate ready-to-run web application scaffolds directly from CLI with offline-first static builds and Netlify configurations."
        toolRepo="https://github.com/NullAITech/zoth-webgen"
        toolCommand="npx zoth-webgen --template corporate-portal"
      />
    </Container>
  );
}
