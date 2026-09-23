import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Chip, Button, Paper, TextField,
  LinearProgress, IconButton, Tooltip, Tabs, Tab, RadioGroup, FormControlLabel, Radio,
  ToggleButtonGroup, ToggleButton, Stack, useTheme, useMediaQuery
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import DownloadIcon from '@mui/icons-material/Download';
import LayersIcon from '@mui/icons-material/Layers';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TuneIcon from '@mui/icons-material/Tune';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function WebGenPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#8A6A09';
  const goldBg = dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTemplate, setSelectedTemplate] = useState('Sovereign SaaS Dashboard');
  const [promptText, setPromptText] = useState('Build a sleek, dark-mode SaaS dashboard with golden accent metrics, full-height cards, and real-time terminal output logs.');
  const [selectedFramework, setSelectedFramework] = useState('react-tailwind');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Code, 1: Live Preview, 2: AST, 3: Logs
  const [copied, setCopied] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState('mobile'); // 'mobile' | 'tablet' | 'desktop'
  const [mobileSection, setMobileSection] = useState('prompt'); // 'prompt' | 'code' | 'preview' | 'specs'

  const templates = [
    { name: 'Sovereign SaaS Dashboard', desc: 'Dark theme, metric cards, golden accents, code viewer.' },
    { name: 'Cyberpunk Portfolio', desc: 'Glitch effects, high-contrast typography, interactive terminal.' },
    { name: 'AI Swarm Console', desc: 'Tri-agent matrix, AST diff inspector, real-time log stream.' },
    { name: 'Documentation Hub', desc: 'Side navigation, API reference tables, interactive code runner.' }
  ];

  // Sample generated JSX code based on selected template
  const codeSamples = {
    'react-tailwind': `import React from 'react';

export default function SovereignDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold mb-2">
            ZOTH STUDIO V2 • AUTONOMOUS FOUNDRY
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Sovereign Web Dashboard</h1>
        </div>
        <button className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-full font-semibold shadow-lg hover:shadow-amber-500/20 transition">
          Deploy Bundle
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition">
          <h3 className="font-bold text-amber-400 mb-1 text-sm">Node Latency</h3>
          <p className="text-3xl md:text-4xl font-extrabold text-white">12.4ms</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition">
          <h3 className="font-bold text-amber-400 mb-1 text-sm">AST Seal Hash</h3>
          <p className="text-xl md:text-2xl font-mono text-emerald-400">0x8F4A...3B21</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition">
          <h3 className="font-bold text-amber-400 mb-1 text-sm">Swarm Status</h3>
          <p className="text-3xl md:text-4xl font-extrabold text-amber-400">Active</p>
        </div>
      </div>
    </div>
  );
}`,
    'astro': `---
// Astro Minimalist Sovereign MPA Component
const { title = "Sovereign WebGen" } = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body class="bg-slate-950 text-white p-6">
    <main class="max-w-6xl mx-auto">
      <span class="badge border border-amber-500/30 text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full text-xs font-bold">
        ASTRO MINIMALIST MPA
      </span>
      <h1 class="text-3xl font-extrabold mt-3">{title}</h1>
    </main>
  </body>
</html>`,
    'vue': `<template>
  <div class="sovereign-vue-container p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
    <div class="flex items-center justify-between mb-4">
      <span class="chip text-xs bg-amber-950 text-amber-400 px-3 py-1 rounded-full font-bold">
        VUE 3 SOVEREIGN COMPONENT
      </span>
      <button @click="triggerCompile" class="btn bg-amber-500 text-black px-4 py-2 rounded-full font-semibold">
        Compile Component
      </button>
    </div>
    <h2 class="text-2xl font-bold">{{ title }}</h2>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const title = ref('Vue 3 Sovereign WebGen Component');
function triggerCompile() {
  console.log('Compiling component spec...');
}
</script>`,
    'html-mui': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pure HTML5 + Material-UI</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
</head>
<body style="background-color: #101828; color: #FFFFFF; font-family: Roboto, sans-serif; padding: 24px;">
  <div style="border: 1px solid #EAECF0; padding: 20px; border-radius: 12px; background-color: #1D2939;">
    <span style="background-color: #FEF9E7; color: #B8860B; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 12px;">
      PURE HTML5 / MUI SPECS
    </span>
    <h1 style="margin-top: 12px; font-size: 24px;">Sovereign Material-UI Component</h1>
  </div>
</body>
</html>`
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      if (isMobile) setMobileSection('preview');
    }, 800);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSamples[selectedFramework] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live Component Preview Box Renderer
  const renderLivePreview = () => (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: '#090D16',
        color: '#F8FAFC',
        borderRadius: 2,
        border: '1px solid #1E293B',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip label="LIVE SIMULATED UI CANVAS" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 800, fontSize: '0.7rem' }} />
          <Typography variant="caption" sx={{ fontFamily: mono, color: '#12B76A' }}>● 60 FPS RENDER</Typography>
        </Box>

        <Paper sx={{ p: 2.5, bgcolor: '#101828', border: '1px solid #D4AF3733', borderRadius: 2, mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
            {selectedTemplate}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
            Target Runtime: <Box component="span" sx={{ color: '#D4AF37', fontFamily: mono, fontWeight: 700 }}>{selectedFramework.toUpperCase()}</Box>
          </Typography>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, bgcolor: '#1E293B', borderRadius: 2, border: '1px solid #334155' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>NODE LATENCY</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#F59E0B' }}>12.4ms</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, bgcolor: '#1E293B', borderRadius: 2, border: '1px solid #334155' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>SEAL HASH</Typography>
              <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 700, color: '#10B981', textOverflow: 'ellipsis', overflow: 'hidden' }}>0x8F4A...3B21</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 2, bgcolor: '#1E293B', borderRadius: 2, border: '1px solid #334155' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>SWARM STATUS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#38BDF8' }}>Active</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B' }}>
          Zero Cloud Egress • Local WASM AST Pipeline
        </Typography>
        <Button size="small" variant="contained" color="primary" onClick={handleCopyCode}>
          Export Component
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 6 }, pb: { xs: 10, md: 6 } }}>
      
      {/* Header Section — gold radial glow behind header */}
      <Box
        sx={{
          mb: { xs: 2.5, md: 4 },
          position: 'relative',
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          background: dark
            ? 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(212,175,55,0.16) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(212,175,55,0.10) 0%, transparent 70%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: `${gold} !important` }} />}
            label="AUTONOMOUS SITE FOUNDRY"
            size="small"
            sx={{
              backgroundColor: goldBg,
              color: gold,
              border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`,
              fontWeight: 700,
              px: 1
            }}
          />
          {isMobile && (
            <Chip
              label="📱 MOBILE CYBERPUNK VIEWPORT"
              size="small"
              sx={{ bgcolor: '#101828', color: '#D4AF37', border: '1px solid #D4AF3744', fontWeight: 800 }}
            />
          )}
        </Box>
        
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: textPrimary, fontSize: { xs: '2.2rem', sm: '3rem', md: '3.4rem' } }}>
          Autonomous WebGen Foundry
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
          High-performance sovereign component foundry. Select layout spec templates, preview live UI in device viewports, and export clean React, Astro, Vue, or HTML code.
        </Typography>
      </Box>

      {/* MOBILE-ONLY FUTURISTIC TABBED WORKSTATION BAR */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 3,
            bgcolor: '#101828',
            borderRadius: 3,
            border: '1px solid #D4AF3744',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            position: 'sticky',
            top: 12,
            zIndex: 10
          }}
        >
          <Tabs
            value={mobileSection}
            onChange={(e, val) => setMobileSection(val)}
            variant="fullWidth"
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                minHeight: 42,
                color: '#94A3B8',
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.5,
                px: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  color: '#FFFFFF',
                  bgcolor: gold,
                  boxShadow: '0 2px 8px rgba(184, 134, 11, 0.4)'
                }
              },
              '& .MuiTabs-indicator': { display: 'none' }
            }}
          >
            <Tab value="prompt" icon={<TuneIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Prompt" />
            <Tab value="code" icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Code" />
            <Tab value="preview" icon={<VisibilityIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Preview" />
            <Tab value="specs" icon={<LayersIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Specs" />
          </Tabs>
        </Paper>
      )}

      {/* Main Foundry Workspace Layout */}
      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        
        {/* LEFT / MAIN COLUMN: Controls, Code & Live Device Preview */}
        {(!isMobile || mobileSection === 'prompt' || mobileSection === 'code' || mobileSection === 'preview') && (
          <Grid size={{ xs: 12, md: 8 }}>
            
            {/* 1. Prompt & Spec Configuration Sandbox — gold-tinted generator card */}
            {(!isMobile || mobileSection === 'prompt') && (
              <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, border: `1px solid ${divider}`, borderRadius: 3, mb: 4, backgroundColor: surface, borderLeft: `4px solid ${gold}`, boxShadow: dark ? '0 0 24px -10px rgba(212,175,55,0.2)' : 'none' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, color: textPrimary }}>
                  <AutoAwesomeIcon sx={{ color: gold }} /> Interactive Component Layout Sandbox
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Choose a starter layout template or customize the natural language spec prompt.
                </Typography>

                {/* Starter Templates */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1, display: 'block', letterSpacing: '0.04em' }}>
                  STARTER SPEC TEMPLATES
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {templates.map((tpl) => (
                    <Chip
                      key={tpl.name}
                      label={tpl.name}
                      onClick={() => {
                        setSelectedTemplate(tpl.name);
                        setPromptText(`Build a sleek ${tpl.name.toLowerCase()} component layout with modern styling.`);
                      }}
                      sx={{
                        borderColor: selectedTemplate === tpl.name ? gold : divider,
                        backgroundColor: selectedTemplate === tpl.name ? goldBg : (dark ? '#14141D' : '#F8FAFC'),
                        color: selectedTemplate === tpl.name ? gold : textSecondary,
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: '1px solid',
                        '&:hover': { backgroundColor: goldBg, borderColor: gold }
                      }}
                    />
                  ))}
                </Box>

                {/* Prompt Spec Input */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Component Layout Prompt Spec"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  sx={{ mb: 3 }}
                />

                {/* Target Exporter Framework Selector */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1, display: 'block', letterSpacing: '0.04em' }}>
                  TARGET RUNTIME EXPORTER
                </Typography>
                <RadioGroup
                  row
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  sx={{ mb: 3 }}
                >
                  <FormControlLabel value="react-tailwind" control={<Radio sx={{ color: gold, '&.Mui-checked': { color: gold } }} />} label="React + Tailwind" />
                  <FormControlLabel value="astro" control={<Radio sx={{ color: gold, '&.Mui-checked': { color: gold } }} />} label="Astro MPA" />
                  <FormControlLabel value="vue" control={<Radio sx={{ color: gold, '&.Mui-checked': { color: gold } }} />} label="Vue 3" />
                  <FormControlLabel value="html-mui" control={<Radio sx={{ color: gold, '&.Mui-checked': { color: gold } }} />} label="HTML5 / MUI" />
                </RadioGroup>

                {/* Desktop Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={isCompiling ? <CheckCircleIcon /> : <RocketLaunchIcon />}
                    onClick={handleCompile}
                    disabled={isCompiling}
                    sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                  >
                    {isCompiling ? 'Compiling Spec...' : 'Generate Component Spec'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyCode}
                    sx={{ borderColor: divider, color: textSecondary, py: 1.2, fontWeight: 700 }}
                  >
                    {copied ? 'Copied Code!' : 'Copy Code'}
                  </Button>
                </Box>

                {isCompiling && (
                  <Box sx={{ mt: 2.5 }}>
                    <LinearProgress sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: gold } }} />
                  </Box>
                )}
              </Paper>
            )}

            {/* 2. Device Viewport Frame Controller & Live Preview / Code Console Window */}
            {(!isMobile || mobileSection === 'code' || mobileSection === 'preview') && (
              <Paper sx={{ border: `1px solid ${divider}`, borderRadius: 3, overflow: 'hidden', backgroundColor: '#101828', boxShadow: '0 12px 32px rgba(16,24,40,0.12)' }}>
                
                {/* Console Top Control Bar */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 1.5,
                    backgroundColor: '#1D2939',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #344054',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ color: '#FDD663', fontFamily: mono, fontWeight: 700, fontSize: '0.82rem' }}>
                      FOUNDRY CONSOLE • {selectedFramework.toUpperCase()}
                    </Typography>
                  </Box>

                  {/* Device Viewport Toggle (Mobile / Tablet / Desktop) */}
                  <ToggleButtonGroup
                    size="small"
                    value={deviceFrame}
                    exclusive
                    onChange={(e, val) => val && setDeviceFrame(val)}
                    sx={{ bgcolor: '#101828', border: '1px solid #344054', '& .MuiToggleButton-root': { color: '#94A3B8', px: 1, py: 0.5, '&.Mui-selected': { color: '#FDD663', bgcolor: '#1E293B' } } }}
                  >
                    <ToggleButton value="mobile" aria-label="mobile viewport">
                      <Tooltip title="Mobile Viewport (375px)"><SmartphoneIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="tablet" aria-label="tablet viewport">
                      <Tooltip title="Tablet Viewport (768px)"><TabletIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                    <ToggleButton value="desktop" aria-label="desktop viewport">
                      <Tooltip title="Desktop Viewport (100%)"><DesktopWindowsIcon fontSize="small" /></Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Console Tabs */}
                <Box sx={{ borderBottom: '1px solid #344054', backgroundColor: '#101828' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 40,
                      '& .MuiTab-root': {
                        color: '#9AA0A6',
                        fontFamily: mono,
                        fontSize: '0.8rem',
                        minHeight: 40,
                        textTransform: 'none',
                        '&.Mui-selected': { color: '#FDD663', fontWeight: 700 }
                      },
                      '& .MuiTabs-indicator': { backgroundColor: gold }
                    }}
                  >
                    <Tab icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Generated Code" />
                    <Tab icon={<VisibilityIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Live UI Preview" />
                    <Tab icon={<LayersIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Component AST JSON" />
                    <Tab icon={<SpeedIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Build Logs" />
                  </Tabs>
                </Box>

                {/* Tab Content 0: Code View */}
                {activeTab === 0 && (
                  <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: mono, fontSize: '0.84rem', minHeight: 280, maxHeight: 420, overflowY: 'auto' }}>
                    <pre style={{ margin: 0, color: '#F8FAFC', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {codeSamples[selectedFramework]}
                    </pre>
                  </Box>
                )}

                {/* Tab Content 1: Live Simulated Device Preview */}
                {activeTab === 1 && (
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 3 },
                      display: 'flex',
                      justifyContent: 'center',
                      bgcolor: '#030712',
                      minHeight: 320
                    }}
                  >
                    <Box
                      sx={{
                        width: deviceFrame === 'mobile' ? '375px' : deviceFrame === 'tablet' ? '768px' : '100%',
                        maxWidth: '100%',
                        transition: 'all 0.3s ease-in-out',
                        border: deviceFrame !== 'desktop' ? '2px solid #334155' : 'none',
                        borderRadius: deviceFrame !== 'desktop' ? 3 : 0,
                        overflow: 'hidden',
                        boxShadow: deviceFrame !== 'desktop' ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      {renderLivePreview()}
                    </Box>
                  </Box>
                )}

                {/* Tab Content 2: AST JSON */}
                {activeTab === 2 && (
                  <Box sx={{ p: 3, fontFamily: mono, fontSize: '0.85rem', minHeight: 280, maxHeight: 420, overflowY: 'auto' }}>
                    <pre style={{ margin: 0, color: '#38BDF8', whiteSpace: 'pre-wrap' }}>
{JSON.stringify(
  {
    target_framework: selectedFramework,
    template_spec: selectedTemplate,
    viewport_mode: deviceFrame,
    zero_cloud_egress: true,
    local_ast_hash: '0x8F4A92B10476C128'
  },
  null,
  2
)}
                    </pre>
                  </Box>
                )}

                {/* Tab Content 3: Compiler Logs */}
                {activeTab === 3 && (
                  <Box sx={{ p: 3, fontFamily: mono, fontSize: '0.85rem', minHeight: 280 }}>
                    <div style={{ color: '#10B981', fontWeight: 700 }}>✔ Local WASM WebGen compiler ready.</div>
                    <div style={{ color: '#94A3B8', marginTop: 8 }}>Target: {selectedTemplate} [{selectedFramework}]. 0 egress calls logged.</div>
                  </Box>
                )}

              </Paper>
            )}

          </Grid>
        )}

        {/* RIGHT / SECONDARY COLUMN: Target Exporters & Spec Registry Matrix */}
        {(!isMobile || mobileSection === 'specs') && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
              
              {/* Exporter Runtimes */}
              <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
                <CardContent sx={{ p: 3 }}>
                  <Chip label="TARGET RUNTIMES" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`, fontWeight: 700, fontSize: '0.75rem', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: textPrimary }}>
                    Supported Exporters
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pick your framework to compile optimized output code.
                  </Typography>

                  <Stack spacing={1.5}>
                    {[
                      { id: 'react-tailwind', name: 'React + Vite + Tailwind', status: 'ACTIVE' },
                      { id: 'astro', name: 'Astro Minimalist MPA', status: 'READY' },
                      { id: 'vue', name: 'Vue 3 Sovereign', status: 'READY' },
                      { id: 'html-mui', name: 'Pure HTML5 / MUI', status: 'READY' }
                    ].map((exp) => (
                      <Paper
                        key={exp.id}
                        elevation={0}
                        onClick={() => setSelectedFramework(exp.id)}
                        sx={{
                          p: 1.5,
                          border: selectedFramework === exp.id ? `1.5px solid ${gold}` : `1px solid ${divider}`,
                          bgcolor: selectedFramework === exp.id ? goldBg : (dark ? '#14141D' : '#F9FAFB'),
                          borderRadius: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textPrimary, fontSize: '0.85rem' }}>
                          {exp.name}
                        </Typography>
                        <Chip
                          label={exp.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            bgcolor: selectedFramework === exp.id ? gold : (dark ? '#26262F' : '#EAECF0'),
                            color: selectedFramework === exp.id ? '#FFFFFF' : textSecondary
                          }}
                        />
                      </Paper>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleCopyCode}
                    sx={{ mt: 3, borderRadius: 9999, fontWeight: 700 }}
                  >
                    Export Framework Spec
                  </Button>
                </CardContent>
              </Card>

              {/* Spec Registry */}
              <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface }}>
                <CardContent sx={{ p: 3 }}>
                  <Chip label="SPEC MATRIX" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${dark ? 'rgba(212,175,55,0.4)' : '#F0E1A8'}`, fontWeight: 700, fontSize: '0.75rem', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: textPrimary }}>
                    Component Spec Registry
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pre-compiled sovereign layout specs for instant project insertion.
                  </Typography>

                  <Stack spacing={1.5}>
                    {templates.map((t) => (
                      <Box
                        key={t.name}
                        onClick={() => {
                          setSelectedTemplate(t.name);
                          if (isMobile) setMobileSection('preview');
                        }}
                        sx={{
                          p: 1.5,
                          border: selectedTemplate === t.name ? `1px solid ${gold}` : `1px solid ${divider}`,
                          borderRadius: 2,
                          bgcolor: selectedTemplate === t.name ? goldBg : surface,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: goldBg }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textPrimary }}>
                            {t.name}
                          </Typography>
                          <Chip label="SPEC" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: dark ? 'rgba(56,189,248,0.16)' : '#F0F9FF', color: dark ? '#38BDF8' : '#0284C7', fontWeight: 700 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {t.desc}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

            </Box>
          </Grid>
        )}

      </Grid>

      {/* MOBILE STICKY FLOATING QUICK-ACTION BOTTOM BAR */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: '#101828',
            borderTop: '1px solid #D4AF3744',
            zIndex: 1000,
            display: 'flex',
            gap: 1.5
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={isCompiling ? <CheckCircleIcon /> : <RocketLaunchIcon />}
            onClick={handleCompile}
            disabled={isCompiling}
            sx={{ py: 1.2, fontWeight: 700, borderRadius: 9999 }}
          >
            {isCompiling ? 'Compiling...' : 'Generate Spec'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleCopyCode}
            sx={{ color: '#FDD663', borderColor: '#D4AF3766', minWidth: 100, borderRadius: 9999, fontWeight: 700 }}
          >
            {copied ? 'Copied' : 'Copy Code'}
          </Button>
        </Paper>
      )}

    </Container>
  );
}
