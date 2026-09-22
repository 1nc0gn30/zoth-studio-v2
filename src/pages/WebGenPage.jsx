import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
  TextField,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio
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

export default function WebGenPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('Sovereign SaaS Dashboard');
  const [promptText, setPromptText] = useState('Build a sleek, dark-mode SaaS dashboard with golden accent metrics, full-height cards, and real-time terminal output logs.');
  const [selectedFramework, setSelectedFramework] = useState('react-tailwind');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Sample generated JSX code based on selected template
  const codeSamples = {
    'react-tailwind': `import React from 'react';

export default function SovereignDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold mb-2">
            ZOTH STUDIO V2 • AUTONOMOUS FOUNDRY
          </span>
          <h1 className="text-3xl font-extrabold text-white">Sovereign Web Dashboard</h1>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded-full font-semibold shadow-lg hover:shadow-amber-500/20 transition">
          Deploy Bundle
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-full bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-amber-500/40 transition">
          <h3 className="font-bold text-amber-400 mb-2">Node Latency</h3>
          <p className="text-4xl font-extrabold text-white">12.4ms</p>
        </div>
        <div className="h-full bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-amber-500/40 transition">
          <h3 className="font-bold text-amber-400 mb-2">AST Seal Hash</h3>
          <p className="text-2xl font-mono text-emerald-400">0x8F4A...3B21</p>
        </div>
        <div className="h-full bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-amber-500/40 transition">
          <h3 className="font-bold text-amber-400 mb-2">Swarm Status</h3>
          <p className="text-4xl font-extrabold text-amber-400">Active</p>
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
  <body class="bg-slate-950 text-white p-8">
    <main class="max-w-6xl mx-auto">
      <span class="badge border border-amber-500/30 text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full text-xs font-bold">
        ASTRO MINIMALIST MPA
      </span>
      <h1 class="text-4xl font-extrabold mt-3">{title}</h1>
    </main>
  </body>
</html>`,
    'vue': `<template>
  <div className="sovereign-vue-container p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <span className="chip text-xs bg-amber-950 text-amber-400 px-3 py-1 rounded-full font-bold">
        VUE 3 SOVEREIGN COMPONENT
      </span>
      <button @click="triggerCompile" className="btn bg-amber-500 text-black px-4 py-2 rounded-full font-semibold">
        Compile Component
      </button>
    </div>
    <h2 className="text-2xl font-bold">{{ title }}</h2>
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
<body style="background-color: #101828; color: #FFFFFF; font-family: Roboto, sans-serif; padding: 32px;">
  <div style="border: 1px solid #EAECF0; padding: 24px; border-radius: 12px; background-color: #1D2939;">
    <span style="background-color: #FEF9E7; color: #B8860B; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 12px;">
      PURE HTML5 / MUI SPECS
    </span>
    <h1 style="margin-top: 12px; font-size: 28px;">Sovereign Material-UI Component</h1>
  </div>
</body>
</html>`
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
    }, 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSamples[selectedFramework] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templates = [
    { name: 'Sovereign SaaS Dashboard', desc: 'Dark theme, metric cards, golden accents, code viewer.' },
    { name: 'Cyberpunk Portfolio', desc: 'Glitch effects, high-contrast typography, interactive terminal.' },
    { name: 'AI Swarm Console', desc: 'Tri-agent matrix, AST diff inspector, real-time log stream.' },
    { name: 'Documentation Hub', desc: 'Side navigation, API reference tables, interactive code runner.' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Chip
          icon={<AutoAwesomeIcon sx={{ color: '#B8860B !important' }} />}
          label="AUTONOMOUS SITE FOUNDRY"
          size="small"
          sx={{
            backgroundColor: '#FEF9E7',
            color: '#B8860B',
            border: '1px solid #F0E1A8',
            fontWeight: 700,
            mb: 1.5,
            px: 1
          }}
        />
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: '#101828' }}>
          Autonomous WebGen Foundry
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          A browser template. Picking a layout fills the code panel from strings in this page. It does not call a model and it does not time a compile.
        </Typography>
      </Box>

      {/* Main Foundry Workspace Grid */}
      <Grid container spacing={4}>
        
        {/* Left Column: Interactive Layout Sandbox & Code Console (xs=12, md=8) */}
        <Grid size={{ xs: 12, md: 8 }}>
          
          {/* Interactive Control Paper */}
          <Paper sx={{ p: 3.5, border: '1px solid #EAECF0', borderRadius: 3, mb: 4, backgroundColor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: '#B8860B' }} /> Interactive Component Layout Sandbox
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Choose a starter layout template or type a custom natural language prompt to generate clean, modular UI code.
            </Typography>

            {/* Template Buttons */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475467', mb: 1, display: 'block' }}>
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
                  variant={selectedTemplate === tpl.name ? 'filled' : 'outlined'}
                  sx={{
                    borderColor: selectedTemplate === tpl.name ? '#B8860B' : '#EAECF0',
                    backgroundColor: selectedTemplate === tpl.name ? '#FEF9E7' : 'transparent',
                    color: selectedTemplate === tpl.name ? '#B8860B' : '#475467',
                    fontWeight: 700,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#FEF9E7', borderColor: '#F0E1A8' }
                  }}
                />
              ))}
            </Box>

            {/* Prompt TextField */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Component Layout Prompt Spec"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* Framework Selector */}
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475467', mb: 1, display: 'block' }}>
              SELECT EXPORTER TARGET RUNTIME
            </Typography>
            <RadioGroup
              row
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              sx={{ mb: 3 }}
            >
              <FormControlLabel value="react-tailwind" control={<Radio sx={{ color: '#B8860B', '&.Mui-checked': { color: '#B8860B' } }} />} label="React + Vite + Tailwind" />
              <FormControlLabel value="astro" control={<Radio sx={{ color: '#B8860B', '&.Mui-checked': { color: '#B8860B' } }} />} label="Astro Minimalist MPA" />
              <FormControlLabel value="vue" control={<Radio sx={{ color: '#B8860B', '&.Mui-checked': { color: '#B8860B' } }} />} label="Vue 3 Sovereign" />
              <FormControlLabel value="html-mui" control={<Radio sx={{ color: '#B8860B', '&.Mui-checked': { color: '#B8860B' } }} />} label="Pure HTML5 / MUI" />
            </RadioGroup>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={isCompiling ? <CheckCircleIcon /> : <RocketLaunchIcon />}
                onClick={handleCompile}
                disabled={isCompiling}
                sx={{ px: 4 }}
              >
                {isCompiling ? 'Compiling Layout...' : 'Generate Component Spec'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyCode}
                sx={{ borderColor: '#EAECF0', color: '#475467' }}
              >
                {copied ? 'Copied Code!' : 'Copy Code'}
              </Button>
            </Box>

            {isCompiling && (
              <Box sx={{ mt: 2.5 }}>
                <LinearProgress sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: '#B8860B' } }} />
              </Box>
            )}
          </Paper>

          {/* Rich Visual Console Window */}
          <Paper sx={{ border: '1px solid #EAECF0', borderRadius: 3, overflow: 'hidden', backgroundColor: '#101828' }}>
            
            {/* Console Header */}
            <Box
              sx={{
                px: 3,
                py: 1.5,
                backgroundColor: '#1D2939',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #344054'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </Box>
                <Typography variant="subtitle2" sx={{ color: '#FDD663', fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: '1rem', color: '#B8860B' }} />
                  [WEBGEN COMPILER CONSOLE • TARGET: {selectedFramework.toUpperCase()}]
                </Typography>
              </Box>

              <Tooltip title="Copy Generated Code">
                <IconButton size="small" onClick={handleCopyCode} sx={{ color: copied ? '#81C995' : '#9AA0A6' }}>
                  {copied ? <CheckCircleIcon size="small" /> : <ContentCopyIcon size="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Console Tabs */}
            <Box sx={{ borderBottom: '1px solid #344054', backgroundColor: '#101828' }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{
                  minHeight: 40,
                  '& .MuiTab-root': {
                    color: '#9AA0A6',
                    fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
                    fontSize: '0.8rem',
                    minHeight: 40,
                    textTransform: 'none',
                    '&.Mui-selected': { color: '#FDD663', fontWeight: 700 }
                  },
                  '& .MuiTabs-indicator': { backgroundColor: '#B8860B' }
                }}
              >
                <Tab icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Generated Code" />
                <Tab icon={<LayersIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Component Spec AST JSON" />
                <Tab icon={<SpeedIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Compiler Build Logs" />
              </Tabs>
            </Box>

            {/* Tab 0: Generated Code View */}
            {activeTab === 0 && (
              <Box sx={{ p: 3, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', fontSize: '0.85rem', minHeight: 280, maxHeight: 420, overflowY: 'auto' }}>
                <pre style={{ margin: 0, color: '#F8FAFC', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {codeSamples[selectedFramework]}
                </pre>
              </Box>
            )}

            {/* Tab 1: AST JSON */}
            {activeTab === 1 && (
              <Box sx={{ p: 3, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', fontSize: '0.85rem', minHeight: 280, maxHeight: 420, overflowY: 'auto' }}>
                <pre style={{ margin: 0, color: '#38BDF8', whiteSpace: 'pre-wrap' }}>
{JSON.stringify(
  {
    note: 'This object is the selection on this page. It is not an AST and it has no build hash.',
    template: selectedTemplate,
    framework: selectedFramework
  },
  null,
  2
)}
                </pre>
              </Box>
            )}

            {/* Tab 2: Compiler Build Logs */}
            {activeTab === 2 && (
              <Box sx={{ p: 3, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace', fontSize: '0.85rem', minHeight: 280 }}>
                <div style={{ color: '#FDD663' }}>No compiler ran.</div>
                <div style={{ color: '#9AA0A6', marginTop: 8 }}>The code tab is a template string for {selectedTemplate} / {selectedFramework}.</div>
              </Box>
            )}

          </Paper>

        </Grid>

        {/* Right Column: Exporter Cards & Spec Library (xs=12, md=4) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            
            {/* Card 1: Supported Framework Exporters */}
            <Card
              sx={{
                height: '100%',
                border: '1px solid #EAECF0',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#F0E1A8',
                  boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Chip
                    label="TARGET RUNTIMES"
                    size="small"
                    sx={{
                      backgroundColor: '#FEF9E7',
                      color: '#B8860B',
                      border: '1px solid #F0E1A8',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                    Supported Exporters
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Select target framework exporter to compile optimized component artifacts.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedFramework('react-tailwind')}
                      sx={{
                        p: 1.5,
                        border: selectedFramework === 'react-tailwind' ? '1px solid #B8860B' : '1px solid #EAECF0',
                        backgroundColor: selectedFramework === 'react-tailwind' ? '#FEF9E7' : '#F9FAFB',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>React + Vite + Tailwind</Typography>
                      <Chip label="ACTIVE" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setSelectedFramework('astro')}
                      sx={{
                        p: 1.5,
                        border: selectedFramework === 'astro' ? '1px solid #B8860B' : '1px solid #EAECF0',
                        backgroundColor: selectedFramework === 'astro' ? '#FEF9E7' : '#F9FAFB',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>Astro Minimalist MPA</Typography>
                      <Chip label="READY" size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#EAECF0' }} />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setSelectedFramework('vue')}
                      sx={{
                        p: 1.5,
                        border: selectedFramework === 'vue' ? '1px solid #B8860B' : '1px solid #EAECF0',
                        backgroundColor: selectedFramework === 'vue' ? '#FEF9E7' : '#F9FAFB',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>Vue 3 Sovereign</Typography>
                      <Chip label="READY" size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#EAECF0' }} />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setSelectedFramework('html-mui')}
                      sx={{
                        p: 1.5,
                        border: selectedFramework === 'html-mui' ? '1px solid #B8860B' : '1px solid #EAECF0',
                        backgroundColor: selectedFramework === 'html-mui' ? '#FEF9E7' : '#F9FAFB',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>Pure HTML5 / MUI</Typography>
                      <Chip label="READY" size="small" sx={{ height: 20, fontSize: '0.65rem', backgroundColor: '#EAECF0' }} />
                    </Paper>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleCopyCode}
                  sx={{ mt: 3, borderRadius: 9999 }}
                >
                  Export Selected Framework
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Component Spec Library */}
            <Card
              sx={{
                height: '100%',
                border: '1px solid #EAECF0',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#F0E1A8',
                  boxShadow: '0 12px 24px -4px rgba(212, 175, 55, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Chip
                    label="FOUNDRY TEMPLATES"
                    size="small"
                    sx={{
                      backgroundColor: '#FEF9E7',
                      color: '#B8860B',
                      border: '1px solid #F0E1A8',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#101828' }}>
                    Component Spec Matrix
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pre-compiled sovereign layout blocks ready for instant inclusion into your project.
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {templates.map((t) => (
                      <Box
                        key={t.name}
                        sx={{
                          p: 1.5,
                          border: '1px solid #EAECF0',
                          borderRadius: 2,
                          backgroundColor: '#FFFFFF',
                          '&:hover': { backgroundColor: '#F9FAFB' }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#101828' }}>
                            {t.name}
                          </Typography>
                          <Chip label="SPEC" size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#F0F9FF', color: '#0284C7' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {t.desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSelectedTemplate('AI Swarm Console')}
                  sx={{ mt: 3, borderRadius: 9999, borderColor: '#EAECF0', color: '#475467' }}
                >
                  Browse Full Spec Registry
                </Button>
              </CardContent>
            </Card>

          </Box>
        </Grid>

      </Grid>

    </Container>
  );
}
