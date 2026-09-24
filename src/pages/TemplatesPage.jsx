import React, { useMemo, useState } from 'react';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, CardActions,
  Chip, Button, TextField, InputAdornment, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Tabs, Tab, Alert, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TerminalIcon from '@mui/icons-material/Terminal';
import LayersIcon from '@mui/icons-material/Layers';
import { templates } from '../data/templates';
import { useStudioStatus } from '../studio/useStudioStatus';

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
          icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#34D399' }} />}
          size="small"
          label={`${templates.length} Curated Templates Viewable in v2`}
          sx={{ bgcolor: isDark ? 'rgba(52,211,153,0.14)' : '#ECFDF3', color: '#34D399', fontWeight: 800 }}
        />
        <Chip
          size="small"
          label={`${openableCount} Offline HTML Previews`}
          sx={{ bgcolor: gold.wash, color: gold.accent, fontWeight: 750 }}
        />
        <Chip
          size="small"
          label={classicUp ? 'Live Preview Server Online · :8088' : 'Classic Server Standby (Optional)'}
          sx={{ bgcolor: classicUp ? 'rgba(52,211,153,0.15)' : 'transparent', color: classicUp ? '#34D399' : theme.palette.text.secondary, fontWeight: 700 }}
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
          sx={{ fontWeight: 750, alignSelf: 'center', bgcolor: openableOnly ? gold.accent : 'transparent', color: openableOnly ? '#101828' : theme.palette.text.primary, border: '1px solid', borderColor: openableOnly ? gold.accent : theme.palette.divider }}
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
                color: active ? '#101828' : theme.palette.text.primary,
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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, transition: 'all 0.2s ease', '&:hover': { borderColor: '#D4AF37', transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                  <Chip size="small" label={item.category} sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                  {item.openable && (
                    <Chip label="Offline HTML" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: '#34D399', fontWeight: 750, fontSize: '0.68rem' }} />
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 750, textTransform: 'capitalize', lineHeight: 1.35 }}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontFamily: mono, fontSize: '0.72rem', wordBreak: 'break-all' }}>
                  {item.id}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CodeIcon />}
                  onClick={() => {
                    setSelectedTemplate(item);
                    setDialogTab(0);
                  }}
                  sx={{ bgcolor: gold.accent, color: '#101828', fontWeight: 750, '&:hover': { bgcolor: '#F5E6AB' } }}
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
                    sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}
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
        <Dialog open={Boolean(selectedTemplate)} onClose={() => setSelectedTemplate(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LayersIcon sx={{ color: gold.accent }} />
              <span>{selectedTemplate.name}</span>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={selectedTemplate.category} size="small" sx={{ bgcolor: gold.wash, color: gold.accent, fontWeight: 800 }} />
              {selectedTemplate.openable && (
                <Chip label="HTML Pre-rendered" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.18)', color: '#34D399', fontWeight: 800 }} />
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
                <Paper sx={{ p: 1.5, bgcolor: isDark ? '#08080B' : '#0F172A', color: '#F5E6AB', fontFamily: mono, fontSize: '0.82rem', mb: 2.5, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{selectedTemplate.path || `/templates-source/${selectedTemplate.id}/`}</span>
                  <IconButton size="small" onClick={() => copyToClipboard(selectedTemplate.path || `/templates-source/${selectedTemplate.id}/`, 'path')}>
                    {copiedCmd === 'path' ? <CheckIcon sx={{ color: '#34D399', fontSize: '1rem' }} /> : <ContentCopyIcon sx={{ fontSize: '1rem', color: '#F5E6AB' }} />}
                  </IconButton>
                </Paper>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Local Run &amp; Install Command
                </Typography>
                <Paper sx={{ p: 2, bgcolor: isDark ? '#08080B' : '#0F172A', color: '#38BDF8', fontFamily: mono, fontSize: '0.85rem', mb: 2.5, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code>cd "{selectedTemplate.path ? selectedTemplate.path.replace(/^\//, '') : `templates-source/${selectedTemplate.id}`}" && npm install && npm run dev</code>
                  <IconButton size="small" onClick={() => copyToClipboard(`cd "${selectedTemplate.path ? selectedTemplate.path.replace(/^\//, '') : `templates-source/${selectedTemplate.id}`}" && npm install && npm run dev`, 'cmd')}>
                    {copiedCmd === 'cmd' ? <CheckIcon sx={{ color: '#34D399', fontSize: '1.1rem' }} /> : <ContentCopyIcon sx={{ fontSize: '1.1rem', color: '#38BDF8' }} />}
                  </IconButton>
                </Paper>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  CLI Quick Scaffolder
                </Typography>
                <Paper sx={{ p: 1.5, bgcolor: isDark ? '#0A0D15' : '#F1F5F9', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Project Scaffold Hierarchy
                </Typography>
                <Paper sx={{ p: 2, bgcolor: isDark ? '#08080B' : '#0F172A', color: '#F8FAFC', fontFamily: mono, fontSize: '0.82rem', borderRadius: 1.5 }}>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Pre-configured npm Scripts
                </Typography>
                <Stack spacing={1} sx={{ mb: 2.5 }}>
                  <Paper sx={{ p: 1.5, bgcolor: isDark ? '#0A0D15' : '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 750, color: '#38BDF8' }}>npm run dev</Typography>
                    <Typography variant="caption" color="text.secondary">Starts Vite local HMR server (default :3000)</Typography>
                  </Paper>
                  <Paper sx={{ p: 1.5, bgcolor: isDark ? '#0A0D15' : '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 750, color: '#34D399' }}>npm run build</Typography>
                    <Typography variant="caption" color="text.secondary">Compiles static production distribution to dist/</Typography>
                  </Paper>
                  <Paper sx={{ p: 1.5, bgcolor: isDark ? '#0A0D15' : '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 750, color: '#D4AF37' }}>npm run preview</Typography>
                    <Typography variant="caption" color="text.secondary">Spins up local zero-egress preview server</Typography>
                  </Paper>
                </Stack>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Primary Stack Foundations
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="React 18" size="small" variant="outlined" />
                  <Chip label="Vite 5" size="small" variant="outlined" />
                  <Chip label="Tailwind / Emotion" size="small" variant="outlined" />
                  <Chip label="Zero-Egress Netlify Functions" size="small" variant="outlined" />
                </Box>
              </Box>
            )}

            {/* Tab 3: Netlify Deploy */}
            {dialogTab === 3 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Production netlify.toml Configuration
                </Typography>
                <Paper sx={{ p: 2, bgcolor: isDark ? '#08080B' : '#0F172A', color: '#34D399', fontFamily: mono, fontSize: '0.8rem', borderRadius: 1.5, mb: 2, whiteSpace: 'pre-wrap' }}>
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

          <DialogActions sx={{ p: 2 }}>
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
            <Button variant="contained" onClick={() => setSelectedTemplate(null)} sx={{ bgcolor: gold.accent, color: '#101828', fontWeight: 750 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
