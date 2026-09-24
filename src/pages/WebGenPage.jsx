import React, { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, Chip, Button, Paper, TextField,
  LinearProgress, IconButton, Tooltip, Tabs, Tab, RadioGroup, FormControlLabel, Radio,
  ToggleButtonGroup, ToggleButton, Stack, useTheme, useMediaQuery, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, InputAdornment, Collapse
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
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import HubIcon from '@mui/icons-material/Hub';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckIcon from '@mui/icons-material/Check';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// -------------------------------------------------------------
// TEMPLATE PRESETS (6 Presets)
// -------------------------------------------------------------
const TEMPLATES = [
  {
    id: 'saas-dashboard',
    name: 'Sovereign SaaS Dashboard',
    desc: 'Dark theme, metric cards, golden accents, latency monitors, code viewer.',
    tag: 'ANALYTICS',
    icon: DashboardIcon,
    defaultPrompt: 'Build a sleek, dark-mode SaaS dashboard with golden accent metrics, full-height cards, and real-time terminal output logs.'
  },
  {
    id: 'cyberpunk-portfolio',
    name: 'Cyberpunk Portfolio',
    desc: 'Glitch effects, high-contrast typography, interactive terminal deck, project matrix.',
    tag: 'CREATIVE',
    icon: TerminalIcon,
    defaultPrompt: 'Design a high-contrast Cyberpunk developer portfolio with terminal prompt, glitch headers, neon-gold project matrix, and status telemetry.'
  },
  {
    id: 'ai-swarm-console',
    name: 'AI Swarm Console',
    desc: 'Tri-agent matrix, autonomous execution pipeline, AST diff inspector, real-time log stream.',
    tag: 'AGENTS',
    icon: HubIcon,
    defaultPrompt: 'Create an autonomous AI Swarm mission console featuring tri-agent pipeline topology, WASM AST hash validation, and real-time execution log streams.'
  },
  {
    id: 'documentation-hub',
    name: 'Documentation Hub',
    desc: 'Side navigation, API reference tables, token specs, interactive code runner.',
    tag: 'DEVELOPER',
    icon: MenuBookIcon,
    defaultPrompt: 'Synthesize a multi-pane technical documentation hub with side navigation, API endpoint specs, payload inspection tabs, and interactive curl runner.'
  },
  {
    id: 'solana-web3-mint',
    name: 'Solana Web3 Mint Deck',
    desc: 'Non-custodial wallet connector, candy machine mint counter, SOL live price feed, verified contract hash.',
    tag: 'WEB3',
    icon: CurrencyBitcoinIcon,
    defaultPrompt: 'Generate a non-custodial Solana NFT minting deck featuring Phantom wallet connector, candy machine live progress bar, verified contract seal, and instant SOL transaction calculator.'
  },
  {
    id: 'biomorphic-neuro-shop',
    name: 'Biomorphic Neuro Shop',
    desc: 'Organic neural mesh UI, synaptic product grid, bio-metric feedback cards, neuro-adaptive cart.',
    tag: 'ECOMMERCE',
    icon: PsychologyIcon,
    defaultPrompt: 'Craft an organic biomorphic neuro-shop layout with synaptic bio-metric product cards, bio-resonance telemetry score, and neuro-adaptive shopping bag.'
  }
];

// -------------------------------------------------------------
// FRAMEWORKS (5 Exporter Engines)
// -------------------------------------------------------------
const FRAMEWORKS = [
  { id: 'react-tailwind', name: 'React + Tailwind', badge: 'REACT 19', status: 'ACTIVE' },
  { id: 'astro', name: 'Astro 4.0 MPA', badge: 'ASTRO 4', status: 'READY' },
  { id: 'svelte', name: 'Svelte 5 Runes', badge: 'SVELTE 5', status: 'READY' },
  { id: 'vue', name: 'Vue 3 Composition', badge: 'VUE 3.4', status: 'READY' },
  { id: 'html', name: 'Zero-JS Clean HTML', badge: 'PURE HTML5', status: 'READY' }
];

// -------------------------------------------------------------
// DESIGN THEMES & TOKEN SYSTEMS (4 High-Contrast Systems)
// -------------------------------------------------------------
const THEMES = [
  { id: 'gold', name: 'Sovereign Imperial Gold', primary: '#D4AF37', bg: '#08080B', desc: 'Imperial obsidian with brushed gold accents & Celtic serif typography.' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', primary: '#00F0FF', bg: '#050508', desc: 'Neon cyan & electric magenta glow with monospaced telemetry.' },
  { id: 'matrix', name: 'Matrix Terminal', primary: '#22C55E', bg: '#010A03', desc: 'Phosphor green CRT terminal with scanline accents.' },
  { id: 'minimal', name: 'Editorial Minimalist', primary: '#3B82F6', bg: '#0F172A', desc: 'Clean slate architecture with subtle borders and clear readability.' },
];

// -------------------------------------------------------------
// GUIDELINE SKILLS (6 Builder Skills)
// -------------------------------------------------------------
const SKILLS = [
  { id: 'visual', label: 'Visual Design', desc: 'Color harmony, spacing tokens, and typography hierarchy' },
  { id: 'seo', label: 'SEO & AEO Graph', desc: 'JSON-LD schema markup and LLM crawler tags' },
  { id: 'a11y', label: 'WCAG AAA A11y', desc: 'High-contrast compliance and screen-reader semantics' },
  { id: 'motion', label: '3D & Motion', desc: 'Smooth WebGL shaders and CSS micro-interactions' },
  { id: 'business', label: 'Conversion Funnels', desc: 'Clear call-to-actions and trust badges' },
  { id: 'forms', label: 'Lead Capture & Forms', desc: 'Client-side sanitized input fields with validation' },
];

// -------------------------------------------------------------
// COMPILER RUNTIME ENGINES (3 Engine Modes)
// -------------------------------------------------------------
const ENGINES = [
  { id: 'wasm', name: 'Fast Local WASM Isolate (<25ms)', desc: 'Instant in-browser deterministic AST compiler' },
  { id: 'ollama', name: 'Local Ollama Model (qwen2.5-coder)', desc: '100% offline neural generation via 127.0.0.1:11434' },
  { id: 'triad', name: 'Tri-Agent Multi-Model Consensus', desc: 'Pantheon tri-model architecture & AST review' },
];

// -------------------------------------------------------------
// CODE GENERATOR ENGINE (30 Combinations: 6 Templates x 5 Frameworks)
// -------------------------------------------------------------
function getGeneratedCode(templateName, frameworkId) {
  switch (templateName) {
    case 'Sovereign SaaS Dashboard':
      if (frameworkId === 'react-tailwind') {
        return `import React, { useState } from 'react';
import { Activity, ShieldCheck, Cpu, Terminal, ChevronRight } from 'lucide-react';

export default function SovereignDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [latency, setLatency] = useState('12.4ms');

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-100 p-6 md:p-10 font-sans selection:bg-[#D4AF37]/30">
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-8 border-b border-[#D4AF37]/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            ZOTH STUDIO • SOVEREIGN FOUNDRY v2
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Sovereign SaaS Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Autonomous layout engine with zero cloud egress & local WASM telemetry.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold text-sm transition">
            Export AST
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#08080B] font-bold text-sm shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] transition">
            Deploy Bundle
          </button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Cluster Latency', value: latency, icon: Activity, change: '-4.2ms', status: 'optimal' },
          { label: 'AST Seal Hash', value: '0x8F4A...3B21', icon: ShieldCheck, change: 'Verified', status: 'verified' },
          { label: 'Swarm Nodes', value: '6 / 6 Online', icon: Cpu, change: '100% Health', status: 'optimal' },
          { label: 'Zero-Egress Security', value: '0 Bytes Out', icon: Terminal, change: 'Air-Gapped', status: 'optimal' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-5 hover:border-[#D4AF37]/60 transition duration-300 shadow-xl group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition" />
            </div>
            <div className="text-2xl lg:text-3xl font-black text-white font-mono">{kpi.value}</div>
            <div className="mt-2 text-xs font-semibold text-[#10B981] flex items-center gap-1">
              <span>●</span> {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Analytics Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              Real-time Throughput Pipeline
            </h3>
            <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-md border border-[#D4AF37]/30">60 FPS WASM</span>
          </div>
          <div className="h-48 flex items-end gap-2 pt-8 px-2 bg-[#08080B]/60 rounded-xl border border-slate-800/80">
            {[45, 62, 58, 84, 76, 92, 88, 95, 82, 98, 91, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[#D4AF37]/30 to-[#D4AF37] rounded-t-sm hover:brightness-125 transition" style={{ height: \`\${h}%\` }} />
            ))}
          </div>
        </div>

        <div className="bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-white mb-4">Sovereign Node State</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-3 rounded-lg bg-[#08080B] border border-slate-800">
                <span className="text-slate-400">Memory Allocation</span>
                <span className="text-[#D4AF37] font-bold">18.4 MB (Static)</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[#08080B] border border-slate-800">
                <span className="text-slate-400">AST Tree Depth</span>
                <span className="text-emerald-400 font-bold">7 Levels (Pruned)</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[#08080B] border border-slate-800">
                <span className="text-slate-400">Egress Packet Drop</span>
                <span className="text-cyan-400 font-bold">100% Enforced</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] rounded-xl text-sm font-bold hover:bg-[#D4AF37] hover:text-[#08080B] transition">
            Trigger Health Check
          </button>
        </div>
      </div>
    </div>
  );
}`;
      }
      if (frameworkId === 'astro') {
        return `---
// Astro 4.0 Sovereign MPA Dashboard
interface Props {
  title?: string;
  clusterLatency?: string;
}

const { title = "Sovereign SaaS Dashboard", clusterLatency = "12.4ms" } = Astro.props;
const metrics = [
  { label: 'Cluster Latency', value: clusterLatency, status: '12.4ms' },
  { label: 'AST Seal Hash', value: '0x8F4A...3B21', status: 'Cryptographic' },
  { label: 'Swarm Nodes', value: '6 / 6 Online', status: 'Autonomous' },
  { label: 'Zero-Egress', value: '0 B Egress', status: 'Air-Gapped' }
];
---

<!DOCTYPE html>
<html lang="en" class="bg-[#08080B] text-slate-100">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} • Zoth Studio</title>
  </head>
  <body class="min-h-screen p-6 md:p-10 font-sans">
    <header class="flex justify-between items-center pb-6 mb-8 border-b border-[#D4AF37]/20">
      <div>
        <span class="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
          ASTRO 4.0 ZERO-RUNTIME MPA
        </span>
        <h1 class="text-3xl font-extrabold text-white mt-2">{title}</h1>
      </div>
      <button class="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#08080B] font-bold rounded-xl shadow-lg">
        Deploy Bundle
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((m) => (
        <div class="bg-[#12131C] border border-[#D4AF37]/20 p-5 rounded-2xl">
          <div class="text-xs text-slate-400 font-mono uppercase">{m.label}</div>
          <div class="text-2xl font-black text-white font-mono mt-1">{m.value}</div>
          <div class="text-xs text-emerald-400 font-semibold mt-2">● {m.status}</div>
        </div>
      ))}
    </div>
  </body>
</html>`;
      }
      if (frameworkId === 'svelte') {
        return `<script>
  // Svelte 5 Runes Engine
  let latency = $state('12.4ms');
  let swarmHealth = $state(100);
  let isChecking = $state(false);

  let statusText = $derived(swarmHealth === 100 ? 'All 6 Nodes Operational' : 'Degraded');

  function checkHealth() {
    isChecking = true;
    setTimeout(() => {
      latency = '11.8ms';
      isChecking = false;
    }, 600);
  }
</script>

<main class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
  <div class="flex justify-between items-center pb-6 border-b border-[#D4AF37]/20 mb-8">
    <div>
      <span class="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
        SVELTE 5 RUNES FOUNDRY
      </span>
      <h1 class="text-3xl font-black text-white mt-2">Sovereign SaaS Dashboard</h1>
    </div>
    <button onclick={checkHealth} class="px-5 py-2.5 bg-[#D4AF37] text-[#08080B] rounded-xl font-bold hover:brightness-110">
      {isChecking ? 'Auditing...' : 'Run Diagnostics'}
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="p-6 bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl">
      <div class="text-xs font-mono text-[#D4AF37]">CLUSTER LATENCY</div>
      <div class="text-4xl font-extrabold text-white font-mono mt-2">{latency}</div>
    </div>
    <div class="p-6 bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl">
      <div class="text-xs font-mono text-[#D4AF37]">SWARM HEALTH</div>
      <div class="text-4xl font-extrabold text-emerald-400 font-mono mt-2">{swarmHealth}%</div>
      <div class="text-xs text-slate-400 mt-1">{statusText}</div>
    </div>
    <div class="p-6 bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl">
      <div class="text-xs font-mono text-[#D4AF37]">AST PURITY</div>
      <div class="text-4xl font-extrabold text-white font-mono mt-2">100% WASM</div>
    </div>
  </div>
</main>`;
      }
      if (frameworkId === 'vue') {
        return `<template>
  <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
    <header class="flex justify-between items-center pb-6 border-b border-[#D4AF37]/20 mb-8">
      <div>
        <span class="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
          VUE 3.4 COMPOSITION FOUNDRY
        </span>
        <h1 class="text-3xl font-black text-white mt-2">{{ title }}</h1>
      </div>
      <button @click="refreshMetrics" class="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#08080B] font-bold rounded-xl">
        Deploy Bundle
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(metric, idx) in metrics" :key="idx" class="p-6 bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl">
        <span class="text-xs font-mono text-slate-400 uppercase">{{ metric.label }}</span>
        <div class="text-3xl font-bold font-mono text-white mt-1">{{ metric.val }}</div>
        <div class="text-xs text-emerald-400 font-bold mt-2">● {{ metric.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const title = ref('Sovereign SaaS Dashboard');
const metrics = ref([
  { label: 'Cluster Latency', val: '12.4ms', status: 'Optimal' },
  { label: 'AST Seal Hash', val: '0x8F4A...3B21', status: 'Cryptographic' },
  { label: 'Zero-Egress', val: '0 Bytes Out', status: 'Air-Gapped' }
]);

function refreshMetrics() {
  metrics.value[0].val = '11.9ms';
}
</script>`;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sovereign SaaS Dashboard • Zero-JS Clean HTML</title>
  <style>
    :root { --gold: #D4AF37; --void: #08080B; --card: #12131C; --text: #F8FAFC; }
    body { background-color: var(--void); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); color: var(--gold); border-radius: 999px; font-size: 11px; font-weight: 700; font-family: monospace; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 24px; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .card { background: var(--card); border: 1px solid rgba(212,175,55,0.2); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .btn { background: var(--gold); color: var(--void); font-weight: 800; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; }
    .metric { font-size: 32px; font-weight: 900; color: #FFF; font-family: monospace; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <span class="badge">ZERO-JS SOVEREIGN BUNDLE</span>
      <h1 style="margin: 8px 0 0 0; font-size: 28px;">Sovereign SaaS Dashboard</h1>
    </div>
    <button class="btn">Deploy Bundle</button>
  </div>
  <div class="grid">
    <div class="card">
      <div style="font-size: 12px; color: #94A3B8; font-family: monospace;">NODE LATENCY</div>
      <div class="metric">12.4ms</div>
    </div>
    <div class="card">
      <div style="font-size: 12px; color: #94A3B8; font-family: monospace;">AST SEAL HASH</div>
      <div class="metric" style="color: #10B981; font-size: 24px;">0x8F4A...3B21</div>
    </div>
    <div class="card">
      <div style="font-size: 12px; color: #94A3B8; font-family: monospace;">SWARM STATUS</div>
      <div class="metric" style="color: var(--gold);">6 / 6 Active</div>
    </div>
  </div>
</body>
</html>`;

    case 'Cyberpunk Portfolio':
      if (frameworkId === 'react-tailwind') {
        return `import React, { useState } from 'react';
import { Terminal, Code, Cpu, ExternalLink, Zap } from 'lucide-react';

export default function CyberpunkPortfolio() {
  const [cmdInput, setCmdInput] = useState('');
  const [logs, setLogs] = useState([
    'NEO-KERNEL v4.9.1 BOOT SEQUENCE INITIALIZED',
    'IDENTITY CONFIRMED: SOVEREIGN OPERATIVE 0x7E1',
    'TYPE "projects" OR "skills" TO QUERY DECK'
  ]);

  const handleCommand = (e) => {
    if (e.key === 'Enter' && cmdInput.trim()) {
      const val = cmdInput.trim().toLowerCase();
      if (val === 'projects') {
        setLogs(prev => [...prev, '> projects', '● AZOTH-OS: Autonomous Neural OS', '● HEXSTRIKE: Micro-Agent Arsenal', '● CIPHER-STEGO: Zero-Egress Vault']);
      } else if (val === 'clear') {
        setLogs([]);
      } else {
        setLogs(prev => [...prev, \`> \${cmdInput}\`, 'CMD NOT RECOGNIZED. TRY: projects, skills, clear']);
      }
      setCmdInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-200 p-6 md:p-12 font-mono selection:bg-[#D4AF37] selection:text-black">
      {/* Glitch Header */}
      <header className="border-b border-[#D4AF37]/40 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs text-[#D4AF37] tracking-widest font-black uppercase">// SYSTEM: ARCHITECT DECK [ONLINE]</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-1 hover:text-[#D4AF37] transition">
            NEO.SOVEREIGN_
          </h1>
          <p className="text-slate-400 text-xs mt-1">Autonomous Agent Systems • Rust & WASM High-Frequency Synthesizer</p>
        </div>
        <div className="text-xs text-[#10B981] font-bold px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded">
          ● LATENCY: 3.8ms // AIR-GAPPED
        </div>
      </header>

      {/* Terminal Deck */}
      <div className="bg-[#10121A] border border-[#D4AF37]/30 rounded-xl overflow-hidden mb-8 shadow-2xl">
        <div className="bg-[#181B26] px-4 py-2 border-b border-[#D4AF37]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-slate-400 ml-2 font-bold">bash - zoth-shell</span>
          </div>
          <span className="text-[10px] text-[#D4AF37]">WASM ROOT SESSION</span>
        </div>
        <div className="p-4 space-y-1.5 text-xs text-slate-300 max-h-48 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className={log.startsWith('>') ? 'text-[#D4AF37] font-bold' : ''}>{log}</div>
          ))}
          <div className="flex items-center gap-2 pt-2 text-[#D4AF37]">
            <span>root@sovereign:~$</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              onKeyDown={handleCommand}
              placeholder="type command..."
              className="bg-transparent text-white focus:outline-none flex-1 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Featured Projects Grid */}
      <h2 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#D4AF37]" /> Classified Deployments
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'AZOTH-OS 2.0', tag: 'CORE RUNTIME', desc: 'Zero-cloud micro-kernel with local LLM tensor pipeline and fast reactive IPC.' },
          { name: 'NEURO-DAEMON', tag: 'SYNAPTIC DB', desc: 'Vectorized memory daemon running at 8788/v1 with instant vector synthesis.' },
          { name: 'HEXSTRIKE ARSENAL', tag: 'SECURITY', desc: 'High-entropy AST validation shield guarding against cloud exfiltration.' }
        ].map((proj, i) => (
          <div key={i} className="bg-[#12131C] border border-[#D4AF37]/20 p-5 rounded-xl hover:border-[#D4AF37] transition group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30 font-bold">{proj.tag}</span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#D4AF37] transition" />
            </div>
            <h3 className="font-bold text-white text-lg">{proj.name}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{proj.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`;
      }
      if (frameworkId === 'astro') {
        return `---
// Astro 4.0 Cyberpunk Matrix Portfolio
const projects = [
  { name: 'AZOTH-OS 2.0', cat: 'RUNTIME', desc: 'Zero-cloud micro-kernel with local tensor pipeline.' },
  { name: 'NEURO-DAEMON', cat: 'SYNAPSE', desc: 'Vectorized memory daemon running on 8788/v1.' },
  { name: 'HEXSTRIKE', cat: 'DEFENSE', desc: 'High-entropy AST validation shield.' }
];
---
<html lang="en" class="bg-[#08080B] text-slate-100 font-mono">
  <head><meta charset="utf-8"/><title>Cyberpunk Portfolio</title></head>
  <body class="p-8 max-w-6xl mx-auto">
    <div class="border-b border-[#D4AF37]/30 pb-4 mb-8">
      <span class="text-xs text-[#D4AF37] tracking-widest">// ARCHITECT MATRIX //</span>
      <h1 class="text-4xl font-black text-white mt-1">NEO.SOVEREIGN_</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projects.map((p) => (
        <article class="bg-[#12131C] border border-[#D4AF37]/20 p-6 rounded-xl hover:border-[#D4AF37]">
          <span class="text-xs text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-1 rounded">{p.cat}</span>
          <h3 class="text-xl font-bold text-white mt-3">{p.name}</h3>
          <p class="text-xs text-slate-400 mt-2">{p.desc}</p>
        </article>
      ))}
    </div>
  </body>
</html>`;
      }
      if (frameworkId === 'svelte') {
        return `<script>
  let prompt = $state('projects');
  let activeFilter = $state('ALL');
  const items = [
    { title: 'AZOTH-OS', type: 'KERNEL', speed: '0.8ms' },
    { title: 'NEURO-MEM', type: 'DAEMON', speed: '1.2ms' },
    { title: 'HEX-STRIKE', type: 'SECURITY', speed: '0.4ms' }
  ];
</script>

<div class="min-h-screen bg-[#08080B] text-slate-200 p-8 font-mono">
  <h1 class="text-3xl font-black text-white tracking-widest border-b border-[#D4AF37]/30 pb-4">
    CYBERPUNK_PORTFOLIO // SVELTE 5
  </h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
    {#each items as item}
      <div class="p-5 bg-[#12131C] border border-[#D4AF37]/30 rounded-xl">
        <span class="text-xs text-[#D4AF37] font-bold">[{item.type}]</span>
        <h3 class="text-xl font-bold text-white mt-1">{item.title}</h3>
        <p class="text-xs text-emerald-400 mt-2 font-mono">EXEC_SPEED: {item.speed}</p>
      </div>
    {/each}
  </div>
</div>`;
      }
      if (frameworkId === 'vue') {
        return `<template>
  <div class="min-h-screen bg-[#08080B] text-slate-200 p-8 font-mono">
    <div class="border-b border-[#D4AF37]/30 pb-4 mb-6">
      <span class="text-xs text-[#D4AF37] font-black">// CYBERPUNK VUE 3.4 //</span>
      <h1 class="text-3xl font-black text-white mt-1">OPERATIVE_DECK</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="p in projects" :key="p.name" class="p-5 bg-[#12131C] border border-[#D4AF37]/20 rounded-xl">
        <span class="text-xs text-[#D4AF37] font-bold">{{ p.status }}</span>
        <h3 class="text-lg font-black text-white mt-2">{{ p.name }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const projects = ref([
  { name: 'AZOTH-OS 2.0', status: '[ONLINE]' },
  { name: 'NEURO-DAEMON', status: '[ACTIVE]' },
  { name: 'HEXSTRIKE-STUDIO', status: '[SEALED]' }
]);
</script>`;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyberpunk Portfolio • Zero-JS Clean HTML</title>
  <style>
    body { background: #08080B; color: #E2E8F0; font-family: monospace; padding: 32px; }
    h1 { color: #FFF; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card { background: #12131C; border: 1px solid rgba(212,175,55,0.3); padding: 20px; border-radius: 8px; }
    .tag { color: #D4AF37; font-weight: bold; font-size: 11px; }
  </style>
</head>
<body>
  <div class="tag">// CYBERPUNK SOVEREIGN DECK //</div>
  <h1>NEO.SOVEREIGN_PORTFOLIO</h1>
  <div class="grid">
    <div class="card"><div class="tag">[OS]</div><h3>AZOTH-OS 2.0</h3><p>Zero-cloud micro-kernel.</p></div>
    <div class="card"><div class="tag">[MEM]</div><h3>NEURO-DAEMON</h3><p>Vectorized local memory engine.</p></div>
    <div class="card"><div class="tag">[SEC]</div><h3>HEXSTRIKE</h3><p>Cryptographic AST validation shield.</p></div>
  </div>
</body>
</html>`;

    case 'AI Swarm Console':
      if (frameworkId === 'react-tailwind') {
        return `import React, { useState } from 'react';
import { Bot, Play, Pause, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AiSwarmConsole() {
  const [agents, setAgents] = useState([
    { id: 'agent-1', name: 'Planner Alpha', role: 'Decomposition & Task Routing', status: 'RUNNING', tasks: 14, latency: '8ms' },
    { id: 'agent-2', name: 'Coder Omega', role: 'WASM Code Synthesis', status: 'SYNTHESIZING', tasks: 38, latency: '14ms' },
    { id: 'agent-3', name: 'Auditor Sigma', role: 'Zero-Egress Security Gate', status: 'VERIFYING', tasks: 12, latency: '4ms' }
  ]);

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-100 p-6 md:p-10 font-sans">
      <header className="flex justify-between items-center pb-6 mb-8 border-b border-[#D4AF37]/30">
        <div>
          <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
            TRI-AGENT CONSENSUS MATRIX
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">AI Swarm Mission Console</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl text-xs font-bold font-mono">
            Halt Swarm
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#08080B] rounded-xl text-xs font-bold font-mono">
            Dispatch Task
          </button>
        </div>
      </header>

      {/* Agents Topology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {agents.map((ag) => (
          <div key={ag.id} className="bg-[#12131C] border border-[#D4AF37]/20 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
                <Bot className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                {ag.status}
              </span>
            </div>
            <h3 className="font-extrabold text-xl text-white">{ag.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{ag.role}</p>
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Processed: <strong className="text-white">{ag.tasks}</strong></span>
              <span className="text-slate-400">Latency: <strong className="text-[#D4AF37]">{ag.latency}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Telemetry Log */}
      <div className="bg-[#10121A] border border-[#D4AF37]/30 rounded-2xl p-6">
        <h3 className="font-bold text-white text-sm mb-4 font-mono flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          SWARM LOCAL LOG STREAM (0 EGRESS)
        </h3>
        <div className="space-y-2 font-mono text-xs text-slate-300">
          <div className="p-2 bg-[#08080B] rounded border border-slate-800 flex justify-between">
            <span>[04:02:18] Planner Alpha routed subtask 0x3A9 to Coder Omega.</span>
            <span className="text-[#D4AF37]">PASS</span>
          </div>
          <div className="p-2 bg-[#08080B] rounded border border-slate-800 flex justify-between">
            <span>[04:02:19] Coder Omega synthesized 142 AST nodes in 11.2ms.</span>
            <span className="text-[#10B981]">COMPILED</span>
          </div>
          <div className="p-2 bg-[#08080B] rounded border border-slate-800 flex justify-between">
            <span>[04:02:20] Auditor Sigma sealed bundle with SHA256 0x8F4A...3B21.</span>
            <span className="text-cyan-400">VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}`;
      }
      if (frameworkId === 'astro') {
        return `---
// Astro 4.0 AI Swarm Console
const swarmNodes = [
  { name: 'Planner Alpha', status: 'ACTIVE', job: 'Intent decomposition' },
  { name: 'Coder Omega', status: 'ACTIVE', job: 'Polyglot AST synthesis' },
  { name: 'Auditor Sigma', status: 'SEALED', job: 'Zero-cloud verification' }
];
---
<html lang="en" class="bg-[#08080B] text-slate-100 font-sans">
  <head><meta charset="utf-8"/><title>AI Swarm Console</title></head>
  <body class="p-8 max-w-6xl mx-auto">
    <div class="border-b border-[#D4AF37]/30 pb-4 mb-8">
      <span class="text-xs font-mono text-[#D4AF37] font-bold">ASTRO 4 MPA SWARM MATRIX</span>
      <h1 class="text-3xl font-black text-white mt-2">Autonomous Agent Mission Deck</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {swarmNodes.map((node) => (
        <div class="bg-[#12131C] border border-[#D4AF37]/20 p-6 rounded-2xl">
          <span class="text-xs font-mono text-emerald-400 font-bold">{node.status}</span>
          <h3 class="text-xl font-bold text-white mt-2">{node.name}</h3>
          <p class="text-xs text-slate-400 mt-1">{node.job}</p>
        </div>
      ))}
    </div>
  </body>
</html>`;
      }
      if (frameworkId === 'svelte') {
        return `<script>
  let activeTasks = $state(64);
  let swarmState = $state('OPTIMAL');
  const agents = ['Alpha (Planner)', 'Omega (Synthesizer)', 'Sigma (Auditor)'];
</script>

<div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
  <h1 class="text-3xl font-black text-white border-b border-[#D4AF37]/30 pb-4 mb-8">
    AI SWARM RUNES CONSOLE
  </h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each agents as agent}
      <div class="p-6 bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl">
        <span class="text-xs text-[#D4AF37] font-mono font-bold">NODE DISPATCH</span>
        <h3 class="text-lg font-black text-white mt-2">{agent}</h3>
        <p class="text-xs text-emerald-400 mt-2">Status: {swarmState}</p>
      </div>
    {/each}
  </div>
</div>`;
      }
      if (frameworkId === 'vue') {
        return `<template>
  <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
    <div class="border-b border-[#D4AF37]/30 pb-4 mb-8">
      <h1 class="text-3xl font-black text-white">AI Swarm Mission Console (Vue 3)</h1>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="agent in agents" :key="agent" class="p-6 bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl">
        <h3 class="text-lg font-bold text-white">{{ agent }}</h3>
        <span class="text-xs text-emerald-400 font-mono">100% Deterministic</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const agents = ref(['Planner Alpha', 'Coder Omega', 'Auditor Sigma']);
</script>`;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Swarm Console • Zero-JS Clean HTML</title>
  <style>
    body { background: #08080B; color: #FFF; font-family: sans-serif; padding: 32px; }
    .card { background: #12131C; border: 1px solid rgba(212,175,55,0.3); padding: 24px; border-radius: 16px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>AI Swarm Mission Console</h1>
  <div class="card"><h3>Planner Alpha</h3><p>Status: Active • Zero Egress</p></div>
  <div class="card"><h3>Coder Omega</h3><p>Status: Active • Zero Egress</p></div>
  <div class="card"><h3>Auditor Sigma</h3><p>Status: Sealed • Zero Egress</p></div>
</body>
</html>`;

    case 'Documentation Hub':
      if (frameworkId === 'react-tailwind') {
        return `import React, { useState } from 'react';
import { BookOpen, Copy, Check, ChevronRight, Hash } from 'lucide-react';

export default function DocumentationHub() {
  const [activeSection, setActiveSection] = useState('ast-engine');
  const [copied, setCopied] = useState(false);

  const curlSnippet = \`curl -X POST http://127.0.0.1:8788/v2/ast/compile \\
  -H "Content-Type: application/json" \\
  -d '{"template": "sovereign-saas", "framework": "react-tailwind"}'\`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-100 flex font-sans">
      {/* Side Navigation */}
      <aside className="w-64 border-r border-[#D4AF37]/20 p-6 hidden md:block bg-[#0D0E15]">
        <div className="text-xs font-mono font-bold text-[#D4AF37] mb-6">ZOTH SPEC DOCS v2.4</div>
        <nav className="space-y-1">
          {['overview', 'ast-engine', 'swarm-consensus', 'zero-egress-security', 'polyglot-exporters'].map((slug) => (
            <button
              key={slug}
              onClick={() => setActiveSection(slug)}
              className={\`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-semibold transition \${
                activeSection === slug
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }\`}
            >
              # {slug}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        <header className="border-b border-[#D4AF37]/20 pb-6 mb-8">
          <span className="text-xs font-mono text-[#D4AF37] font-bold">API REFERENCE & RUNTIME SPECS</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-1">Autonomous AST Engine</h1>
          <p className="text-slate-400 text-sm mt-2">Synthesize and verify sovereign layouts with deterministic WASM hashing.</p>
        </header>

        {/* Code Snippet Box */}
        <div className="bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <div className="bg-[#181A26] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono text-slate-300">HTTP / cURL Spec</span>
            <button onClick={copyCurl} className="text-xs font-mono text-[#D4AF37] hover:underline flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-[#F5E6AB] overflow-x-auto leading-relaxed">
            {curlSnippet}
          </pre>
        </div>

        {/* Endpoint Specs Table */}
        <h3 className="font-bold text-white text-lg mb-4">Core Endpoint Contracts</h3>
        <div className="border border-[#D4AF37]/20 rounded-xl overflow-hidden font-mono text-xs">
          <div className="grid grid-cols-3 bg-[#181A26] p-3 text-[#D4AF37] font-bold border-b border-slate-800">
            <span>METHOD & PATH</span>
            <span>PAYLOAD</span>
            <span>RUNTIME</span>
          </div>
          <div className="grid grid-cols-3 p-3 border-b border-slate-800/60 bg-[#12131C]">
            <span className="text-[#10B981] font-bold">POST /v2/ast/compile</span>
            <span className="text-slate-300">{"{ template, framework }"}</span>
            <span className="text-cyan-400">Local WASM</span>
          </div>
          <div className="grid grid-cols-3 p-3 bg-[#12131C]">
            <span className="text-[#10B981] font-bold">GET /v2/swarm/status</span>
            <span className="text-slate-300">Empty</span>
            <span className="text-cyan-400">IPC Daemon</span>
          </div>
        </div>
      </main>
    </div>
  );
}`;
      }
      if (frameworkId === 'astro') {
        return `---
// Astro 4.0 Documentation Hub
const docs = [
  { slug: 'ast-engine', title: 'Autonomous AST Engine', method: 'POST /v2/ast/compile' },
  { slug: 'swarm', title: 'Swarm Consensus', method: 'GET /v2/swarm/status' }
];
---
<html lang="en" class="bg-[#08080B] text-slate-100 font-sans">
  <body class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-extrabold text-white border-b border-[#D4AF37]/30 pb-4">Documentation Hub</h1>
    <div class="space-y-4 mt-6">
      {docs.map((d) => (
        <div class="p-5 bg-[#12131C] border border-[#D4AF37]/20 rounded-xl">
          <div class="text-xs font-mono text-[#D4AF37]">{d.method}</div>
          <h3 class="text-xl font-bold text-white mt-1">{d.title}</h3>
        </div>
      ))}
    </div>
  </body>
</html>`;
      }
      if (frameworkId === 'svelte') {
        return `<script>
  let activeTab = $state('endpoints');
</script>

<div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
  <h1 class="text-3xl font-black text-white border-b border-[#D4AF37]/30 pb-4">
    DOCUMENTATION HUB • SVELTE 5
  </h1>
  <div class="p-6 bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl mt-6">
    <div class="text-xs font-mono text-[#D4AF37]">POST /v2/ast/compile</div>
    <p class="text-sm text-slate-300 mt-2">Zero-egress layout compiler contract.</p>
  </div>
</div>`;
      }
      if (frameworkId === 'vue') {
        return `<template>
  <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
    <h1 class="text-3xl font-bold text-white border-b border-[#D4AF37]/30 pb-4">Documentation Hub</h1>
    <div class="p-6 bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl mt-6">
      <span class="text-xs font-mono text-[#D4AF37]">VUE 3.4 COMPONENT SPEC</span>
      <h3 class="text-xl font-bold text-white mt-2">Local WASM API Reference</h3>
    </div>
  </div>
</template>`;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Documentation Hub • Zero-JS Clean HTML</title>
  <style>
    body { background: #08080B; color: #FFF; font-family: sans-serif; padding: 32px; }
    pre { background: #12131C; border: 1px solid rgba(212,175,55,0.3); padding: 16px; border-radius: 8px; color: #D4AF37; }
  </style>
</head>
<body>
  <h1>Documentation Hub (Zero-JS)</h1>
  <pre>POST /v2/ast/compile\nContent-Type: application/json\nZero-Cloud Egress Enforced</pre>
</body>
</html>`;

    case 'Solana Web3 Mint Deck':
      if (frameworkId === 'react-tailwind') {
        return `import React, { useState } from 'react';
import { Wallet, Coins, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function SolanaMintDeck() {
  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const pricePerNft = 1.25;

  const handleMint = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      alert('Simulated Sovereign NFT Minted Successfully!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-100 p-6 md:p-12 font-sans selection:bg-[#D4AF37]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-8 border-b border-[#D4AF37]/30 gap-4">
        <div>
          <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
            SOLANA MAINNET • NON-CUSTODIAL
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mt-2">Sovereign NFT Mint Deck</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#12131C] border border-[#D4AF37]/40 rounded-xl font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-slate-300">8xJ9...4QmK</span>
          <span className="text-[#D4AF37] font-bold">14.82 SOL</span>
        </div>
      </header>

      {/* Mint Matrix Card */}
      <div className="max-w-2xl mx-auto bg-[#12131C] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider font-bold">CANDY MACHINE v3</span>
          <span className="text-xs font-mono text-slate-400">3,412 / 5,000 MINTED</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#08080B] rounded-full h-3 border border-slate-800 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#F5E6AB] h-full rounded-full transition-all duration-500" style={{ width: '68.2%' }} />
        </div>

        {/* Price & Quantity Controls */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-[#08080B] p-5 rounded-2xl border border-slate-800">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Unit Price</span>
            <div className="text-2xl font-black text-white font-mono mt-1">{pricePerNft} SOL</div>
          </div>
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase">Total Due</span>
            <div className="text-2xl font-black text-[#D4AF37] font-mono mt-1">{(mintAmount * pricePerNft).toFixed(2)} SOL</div>
          </div>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isMinting}
          className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#08080B] font-extrabold text-lg rounded-2xl shadow-xl shadow-[#D4AF37]/20 hover:scale-[1.01] transition flex justify-center items-center gap-2"
        >
          {isMinting ? <Sparkles className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
          {isMinting ? 'Confirming On-Chain...' : \`Mint \${mintAmount} Sovereign NFT\`}
        </button>

        <div className="mt-6 text-center text-xs font-mono text-slate-500">
          Verified Contract: SoV19d8...88aF • Zero Royalty Egress
        </div>
      </div>
    </div>
  );
}`;
      }
      if (frameworkId === 'astro') {
        return `---
// Astro 4.0 Solana Web3 Mint Deck
const contract = "SoV19d8...88aF";
const mintedCount = "3,412 / 5,000";
const solPrice = "1.25 SOL";
---
<html lang="en" class="bg-[#08080B] text-slate-100 font-sans">
  <body class="p-8 max-w-2xl mx-auto">
    <header class="border-b border-[#D4AF37]/30 pb-4 mb-6">
      <span class="text-xs font-mono text-[#D4AF37] font-bold">SOLANA AIR-GAPPED MINT</span>
      <h1 class="text-3xl font-black text-white mt-1">Sovereign Mint Deck</h1>
    </header>
    <div class="bg-[#12131C] border border-[#D4AF37]/30 p-8 rounded-3xl text-center">
      <div class="text-4xl font-extrabold font-mono text-white mb-2">{solPrice}</div>
      <p class="text-xs font-mono text-slate-400 mb-6">{mintedCount} Minted</p>
      <button class="w-full py-3.5 bg-[#D4AF37] text-[#08080B] font-extrabold rounded-xl">
        Connect Phantom & Mint
      </button>
      <p class="text-[10px] font-mono text-slate-500 mt-4">Verified Hash: {contract}</p>
    </div>
  </body>
</html>`;
      }
      if (frameworkId === 'svelte') {
        return `<script>
  let amount = $state(1);
  const price = 1.25;
  let total = $derived((amount * price).toFixed(2));
</script>

<div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
  <div class="max-w-xl mx-auto bg-[#12131C] border border-[#D4AF37]/30 p-8 rounded-3xl">
    <h1 class="text-3xl font-black text-white mb-4">Solana Mint Deck (Svelte 5)</h1>
    <div class="text-2xl font-mono text-[#D4AF37] mb-6">Total: {total} SOL</div>
    <button class="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl">
      Mint with Runes
    </button>
  </div>
</div>`;
      }
      if (frameworkId === 'vue') {
        return `<template>
  <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
    <div class="max-w-xl mx-auto bg-[#12131C] border border-[#D4AF37]/30 p-8 rounded-3xl">
      <h1 class="text-3xl font-black text-white mb-2">Solana Mint Deck</h1>
      <p class="text-[#D4AF37] font-mono text-xl mb-6">Price: 1.25 SOL</p>
      <button class="w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl">Mint NFT</button>
    </div>
  </div>
</template>`;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Solana Mint Deck • Zero-JS Clean HTML</title>
  <style>
    body { background: #08080B; color: #FFF; font-family: sans-serif; padding: 40px; text-align: center; }
    .box { max-width: 480px; margin: 0 auto; background: #12131C; border: 1px solid rgba(212,175,55,0.3); padding: 32px; border-radius: 20px; }
    .btn { background: #D4AF37; color: #000; font-weight: bold; border: none; padding: 14px; width: 100%; border-radius: 12px; font-size: 16px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="box">
    <h1 style="margin-top:0;">Solana Mint Deck</h1>
    <p style="color: #D4AF37; font-size: 24px; font-family: monospace;">1.25 SOL</p>
    <p style="color: #94A3B8; font-size: 12px;">3,412 / 5,000 Minted</p>
    <button class="btn">Mint NFT</button>
  </div>
</body>
</html>`;

    case 'Biomorphic Neuro Shop':
      if (frameworkId === 'react-tailwind') {
        return `import React, { useState } from 'react';
import { ShoppingBag, Brain, Zap, HeartPulse, ChevronRight } from 'lucide-react';

export default function BiomorphicNeuroShop() {
  const [cartCount, setCartCount] = useState(0);
  const products = [
    { id: 'p1', name: 'Cortical Neural Interface v3', price: '2.40 GOLD', resonance: '99.4%', desc: 'Direct synapse-to-WASM bridge with ultra-low latency.' },
    { id: 'p2', name: 'Dopamine Synapse Stabilizer', price: '0.85 GOLD', resonance: '97.8%', desc: 'Adaptive bio-metric modulation for focused deep work.' },
    { id: 'p3', name: 'Bio-Resonance Transceiver', price: '1.75 GOLD', resonance: '98.9%', desc: 'Zero-cloud bio-telemetry tracker with cryptographic sealing.' }
  ];

  return (
    <div className="min-h-screen bg-[#08080B] text-slate-100 p-6 md:p-10 font-sans">
      <header className="flex justify-between items-center pb-6 mb-8 border-b border-[#D4AF37]/30">
        <div>
          <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
            NEURAL MESH • BIO-ADAPTIVE STORE
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">Biomorphic Neuro Shop</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12131C] border border-[#D4AF37]/30 rounded-xl text-xs font-mono text-[#D4AF37]">
            <HeartPulse className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Resonance: 98.6%</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#08080B] rounded-xl font-bold text-xs">
            <ShoppingBag className="w-4 h-4" />
            <span>Bag ({cartCount})</span>
          </button>
        </div>
      </header>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-[#12131C] border border-[#D4AF37]/20 p-6 rounded-2xl hover:border-[#D4AF37]/60 transition duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <Brain className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {p.resonance} SYNC
                </span>
              </div>
              <h3 className="font-extrabold text-xl text-white">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-lg font-black text-[#D4AF37] font-mono">{p.price}</span>
              <button
                onClick={() => setCartCount(c => c + 1)}
                className="px-4 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-[#D4AF37] hover:text-black transition"
              >
                Add to Synapse
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
      }
      if (frameworkId === 'astro') {
        return `---
// Astro 4.0 Biomorphic Neuro Shop
const items = [
  { name: 'Cortical Interface v3', price: '2.40 GOLD', sync: '99.4%' },
  { name: 'Dopamine Stabilizer', price: '0.85 GOLD', sync: '97.8%' }
];
---
<html lang="en" class="bg-[#08080B] text-slate-100 font-sans">
  <body class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-extrabold text-white border-b border-[#D4AF37]/30 pb-4">Biomorphic Neuro Shop</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {items.map((i) => (
        <div class="p-6 bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl">
          <span class="text-xs font-mono text-emerald-400">{i.sync} SYNC</span>
          <h3 class="text-xl font-bold text-white mt-2">{i.name}</h3>
          <p class="text-lg font-mono text-[#D4AF37] mt-3">{i.price}</p>
        </div>
      ))}
    </div>
  </body>
</html>`;
      }
      if (frameworkId === 'svelte') {
        return `<script>
  let cart = $state([]);
  function add(name) {
    cart = [...cart, name];
  }
</script>

<div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
  <h1 class="text-3xl font-black text-white border-b border-[#D4AF37]/30 pb-4">
    BIOMORPHIC NEURO SHOP (SVELTE 5)
  </h1>
  <div class="p-6 bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl mt-6">
    <h3 class="text-xl font-bold text-white">Cortical Neural Interface v3</h3>
    <button onclick={() => add('Interface')} class="mt-4 px-4 py-2 bg-[#D4AF37] text-black font-bold rounded-xl">
      Add to Synapse (Cart: {cart.length})
    </button>
  </div>
</div>`;
      }
      if (frameworkId === 'vue') {
        return `<template>
  <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
    <h1 class="text-3xl font-bold text-white border-b border-[#D4AF37]/30 pb-4">Biomorphic Neuro Shop</h1>
    <div class="p-6 bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl mt-6">
      <h3 class="text-xl font-bold text-white">Cortical Neural Interface v3</h3>
      <p class="text-[#D4AF37] font-mono mt-2">2.40 GOLD</p>
    </div>
  </div>
</template>`;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Biomorphic Neuro Shop • Zero-JS Clean HTML</title>
  <style>
    body { background: #08080B; color: #FFF; font-family: sans-serif; padding: 32px; }
    .card { background: #12131C; border: 1px solid rgba(212,175,55,0.3); padding: 24px; border-radius: 16px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Biomorphic Neuro Shop</h1>
  <div class="card">
    <h3>Cortical Neural Interface v3</h3>
    <p style="color: #D4AF37; font-family: monospace;">2.40 GOLD • 99.4% SYNC</p>
  </div>
</body>
</html>`;

    default:
      return '// Sovereign WebGen Component Engine Ready';
  }
}

// -------------------------------------------------------------
// STANDALONE HTML BUNDLE GENERATOR (Zero-Dependency Single File)
// -------------------------------------------------------------
function generateStandaloneHtml(templateName) {
  const dateStr = new Date().toISOString();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateName} • Zoth Studio Sovereign Bundle</title>
  <style>
    :root {
      --void: #08080B;
      --surface: #10121A;
      --card: #141724;
      --gold: #D4AF37;
      --gold-light: #F5E6AB;
      --gold-border: rgba(212, 175, 55, 0.28);
      --gold-glow: rgba(212, 175, 55, 0.15);
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --emerald: #10B981;
      --cyan: #38BDF8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--void);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      padding: 32px 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: var(--gold-glow);
      border: 1px solid var(--gold-border);
      color: var(--gold);
      border-radius: 999px;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 8px var(--emerald);
    }
    header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 24px;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--gold-border);
    }
    @media (min-width: 768px) {
      header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
    h1 {
      font-size: 32px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }
    .btn-gold {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
      color: #08080B;
      font-weight: 800;
      font-size: 14px;
      padding: 10px 22px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px var(--gold-glow);
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .btn-gold:hover {
      transform: translateY(-1px);
      filter: brightness(1.1);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--gold-border);
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      transition: border-color 0.2s ease;
    }
    .card:hover {
      border-color: var(--gold);
    }
    .card-title {
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .card-metric {
      font-size: 32px;
      font-weight: 900;
      font-family: ui-monospace, monospace;
      color: #FFFFFF;
    }
    .card-status {
      margin-top: 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--emerald);
    }
    .terminal-box {
      background: #0D0E16;
      border: 1px solid var(--gold-border);
      border-radius: 16px;
      padding: 20px;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      color: #E2E8F0;
      margin-bottom: 32px;
      overflow-x: auto;
    }
    .terminal-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 10px;
      margin-bottom: 12px;
      color: var(--gold);
      font-weight: 700;
    }
    footer {
      border-top: 1px solid var(--gold-border);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
      font-family: ui-monospace, monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="badge">
          <span class="pulse-dot"></span>
          ZOTH STUDIO • AUTONOMOUS FOUNDRY
        </div>
        <h1 style="margin-top: 8px;">${templateName}</h1>
        <p style="color: var(--text-muted); font-size: 13px;">Self-contained zero-dependency standalone bundle • Local WASM Execution</p>
      </div>
      <div>
        <button class="btn-gold" onclick="alert('Bundle is active on local edge sandbox.')">
          Execute Local Sandbox
        </button>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-title">Latency Telemetry</div>
        <div class="card-metric" style="color: var(--gold);">12.4ms</div>
        <div class="card-status">● 100% PURE WASM PIPELINE</div>
      </div>
      <div class="card">
        <div class="card-title">Cryptographic Seal</div>
        <div class="card-metric" style="color: var(--emerald); font-size: 24px;">0x8F4A...3B21</div>
        <div class="card-status">● AIR-GAPPED VERIFIED</div>
      </div>
      <div class="card">
        <div class="card-title">Egress Packet Audit</div>
        <div class="card-metric" style="color: var(--cyan);">0 Bytes Out</div>
        <div class="card-status">● ZERO CLOUD EGRESS</div>
      </div>
    </div>

    <div class="terminal-box">
      <div class="terminal-header">
        <span>SOVEREIGN WASM KERNEL CONSOLE</span>
        <span>STATUS: SEALED</span>
      </div>
      <div style="line-height: 1.8;">
        <div>[${dateStr}] Initializing autonomous layout engine for ${templateName}...</div>
        <div>[${dateStr}] Framework target: Zero-Dependency Standalone HTML Micro-Bundle.</div>
        <div>[${dateStr}] All 142 AST nodes sealed with deterministic cryptographic hash.</div>
        <div style="color: var(--gold);">✔ Standalone sovereign bundle ready for instant offline execution.</div>
      </div>
    </div>

    <footer>
      <div>Generated by Zoth Studio v2 Layout Foundry</div>
      <div>Zero Cloud Egress • 100% Deterministic</div>
    </footer>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// AST TREE SPECIFICATION GENERATOR
// -------------------------------------------------------------
function getAstTreeData(templateName, frameworkId) {
  return [
    {
      id: 'node-root',
      type: 'RootNode',
      label: 'Program [AST_ROOT]',
      line: '1:0',
      depth: 0,
      badge: 'AST_ROOT',
      color: '#A855F7',
      desc: 'Top-level AST Module Container with zero-egress WASM sealing',
      attrs: { sourceType: 'module', pureWasm: true, hash: '0x8F4A92B10476C128', tokenCount: 412 },
      children: [
        {
          id: 'node-decl',
          type: 'ComponentDeclaration',
          label: `export default function ${templateName.replace(/[^a-zA-Z]/g, '')}()`,
          line: '5:0',
          depth: 1,
          badge: 'DECLARATION',
          color: '#D4AF37',
          desc: 'Primary sovereign component declaration & export contract',
          attrs: { scope: 'ModuleRoot', exportType: 'default', purity: '100%' },
          children: [
            {
              id: 'node-hooks',
              type: 'ReactiveHooks',
              label: frameworkId === 'svelte' ? '$state & $derived Runes (3 bindings)' : 'useState & useMemo Hooks (3 bindings)',
              line: '6:2',
              depth: 2,
              badge: 'REACTIVE_HOOKS',
              color: '#F59E0B',
              desc: 'Reactive state bindings & computed dependencies',
              attrs: { stateVar: 'latency', derivedCount: 2, egressTrigger: false },
              children: [
                { id: 'node-hook-1', type: 'ReactiveHooks', label: 'latencyBinding: "12.4ms"', line: '7:4', depth: 3, badge: 'STATE_HOOK', color: '#F59E0B', attrs: { initial: '12.4ms', immutable: false } },
                { id: 'node-hook-2', type: 'ReactiveHooks', label: 'sealHashMemo: "0x8F4A...3B21"', line: '8:4', depth: 3, badge: 'MEMO_HOOK', color: '#F59E0B', attrs: { memoized: true, recomputeCost: '0.01ms' } }
              ]
            },
            {
              id: 'node-jsx-root',
              type: 'JSXElement',
              label: '<Container className="...">',
              line: '12:4',
              depth: 2,
              badge: 'JSX_ELEMENT',
              color: '#38BDF8',
              desc: 'Top-level layout viewport container wrapper',
              attrs: { tag: 'div', childrenCount: 3, responsive: true },
              children: [
                {
                  id: 'node-jsx-header',
                  type: 'JSXElement',
                  label: '<Header className="flex justify-between...">',
                  line: '14:6',
                  depth: 3,
                  badge: 'JSX_ELEMENT',
                  color: '#38BDF8',
                  desc: 'Header bar with sovereign foundry badge & deployment actions',
                  attrs: { tag: 'header', role: 'banner' },
                  children: [
                    { id: 'node-jsx-title', type: 'JSXElement', label: '<TitleHeading level={1}>', line: '16:8', depth: 4, badge: 'JSX_ELEMENT', color: '#38BDF8', attrs: { text: templateName } },
                    { id: 'node-jsx-btn', type: 'JSXElement', label: '<DeployButton variant="gold">', line: '20:8', depth: 4, badge: 'JSX_ELEMENT', color: '#38BDF8', attrs: { onClick: 'handleDeploy' } }
                  ]
                },
                {
                  id: 'node-jsx-grid',
                  type: 'JSXElement',
                  label: '<MetricGrid columns={4} gap={5}>',
                  line: '28:6',
                  depth: 3,
                  badge: 'JSX_ELEMENT',
                  color: '#38BDF8',
                  desc: 'Responsive metrics grid holding sovereign KPI cards',
                  attrs: { tag: 'div', gridCols: '1 md:4', gap: 5 },
                  children: [
                    { id: 'node-jsx-kpi-1', type: 'JSXElement', label: '<MetricCard title="Latency" value="12.4ms">', line: '30:8', depth: 4, badge: 'JSX_ELEMENT', color: '#38BDF8', attrs: { icon: 'Activity', status: 'optimal' } },
                    { id: 'node-jsx-kpi-2', type: 'JSXElement', label: '<MetricCard title="Seal Hash" value="0x8F4A">', line: '36:8', depth: 4, badge: 'JSX_ELEMENT', color: '#38BDF8', attrs: { icon: 'Shield', status: 'verified' } }
                  ]
                }
              ]
            },
            {
              id: 'node-tailwind-root',
              type: 'TailwindClasses',
              label: 'TailwindClasses (84 Utility Tokens Parsed)',
              line: '12:15',
              depth: 2,
              badge: 'TAILWIND_TOKENS',
              color: '#10B981',
              desc: 'High-performance zero-runtime atomic CSS utility bindings',
              attrs: { totalTokens: 84, layoutTokens: 28, colorTokens: 32, effectTokens: 24 },
              children: [
                { id: 'node-tw-1', type: 'TailwindClasses', label: 'bg-[#08080B] text-slate-100 p-6 md:p-10', line: '12:20', depth: 3, badge: 'LAYOUT_COLOR', color: '#10B981', attrs: { category: 'Background & Padding' } },
                { id: 'node-tw-2', type: 'TailwindClasses', label: 'border border-[#D4AF37]/30 rounded-2xl shadow-xl', line: '28:20', depth: 3, badge: 'BORDER_SHADOW', color: '#10B981', attrs: { category: 'Borders & Elevation' } },
                { id: 'node-tw-3', type: 'TailwindClasses', label: 'hover:border-[#D4AF37] transition duration-300', line: '30:20', depth: 3, badge: 'INTERACTION', color: '#10B981', attrs: { category: 'Transitions' } }
              ]
            }
          ]
        }
      ]
    }
  ];
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function WebGenPage() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#8A6A09';
  const goldBg = dark ? 'rgba(212,175,55,0.12)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const cardBg = dark ? '#121420' : '#F8FAFC';
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [selectedTemplate, setSelectedTemplate] = useState('Sovereign SaaS Dashboard');
  const [promptText, setPromptText] = useState(TEMPLATES[0].defaultPrompt);
  const [siteName, setSiteName] = useState('sovereign-matrix');
  const [selectedTheme, setSelectedTheme] = useState('gold');
  const [selectedSkills, setSelectedSkills] = useState(['visual', 'seo', 'a11y']);
  const [selectedEngine, setSelectedEngine] = useState('wasm');
  const [selectedFramework, setSelectedFramework] = useState('react-tailwind');
  const [tweakText, setTweakText] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // Default 1: Live UI Preview (front and center!)
  const [copied, setCopied] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [mobileSection, setMobileSection] = useState('preview'); // 'prompt' | 'code' | 'preview' | 'specs'

  // AST Tab State
  const [astSearch, setAstSearch] = useState('');
  const [astCategory, setAstCategory] = useState('ALL'); // 'ALL' | 'RootNode' | 'ComponentDeclaration' | 'JSXElement' | 'TailwindClasses' | 'ReactiveHooks'
  const [selectedAstNode, setSelectedAstNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({ 'node-root': true, 'node-decl': true, 'node-jsx-root': true, 'node-tailwind-root': true, 'node-hooks': true });
  const [astMode, setAstMode] = useState('tree'); // 'tree' | 'diff'

  // Deploy Dialog & Snackbar
  const [deployOpen, setDeployOpen] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle skill toggle
  const handleToggleSkill = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  // Handle interactive tweak
  const handleTweak = () => {
    if (!tweakText.trim()) return;
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setSnackbarMessage(`Applied tweak: "${tweakText}" to live sneak-peek preview!`);
      setSnackbarOpen(true);
      setActiveTab(1);
    }, 600);
  };

  // Active code generated based on template and framework
  const currentCode = useMemo(() => {
    return getGeneratedCode(selectedTemplate, selectedFramework);
  }, [selectedTemplate, selectedFramework]);

  // AST Data based on template & framework
  const astData = useMemo(() => {
    return getAstTreeData(selectedTemplate, selectedFramework);
  }, [selectedTemplate, selectedFramework]);

  // Handle template selection
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.name);
    setPromptText(tpl.defaultPrompt);
    setActiveTab(1);
    if (isMobile) setMobileSection('preview');
  };

  // Compile Trigger
  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setSnackbarMessage(`Successfully synthesized ${selectedTemplate} for ${selectedFramework.toUpperCase()}`);
      setSnackbarOpen(true);
      setActiveTab(1);
      if (isMobile) setMobileSection('preview');
    }, 700);
  };

  // Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setSnackbarMessage('Code copied to clipboard!');
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy Arbitrary Command / Text
  const handleCopyCodeText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setSnackbarMessage('Command copied to clipboard!');
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Standalone HTML Bundle
  const handleExportBundle = () => {
    const htmlBundle = generateStandaloneHtml(selectedTemplate);
    const blob = new Blob([htmlBundle], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webgen-sovereign-bundle.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbarMessage('Downloaded webgen-sovereign-bundle.html (Zero-dependency standalone bundle)');
    setSnackbarOpen(true);
  };

  // Deploy Bundle Dialog Trigger
  const handleDeployModalOpen = () => {
    setDeployOpen(true);
    setDeployStep(1);
    setTimeout(() => setDeployStep(2), 500);
    setTimeout(() => setDeployStep(3), 1100);
    setTimeout(() => setDeployStep(4), 1700);
  };

  // Toggle AST Node Expand
  const toggleNodeExpand = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter AST Nodes recursively
  const filterAstNodes = (nodes) => {
    return nodes
      .map(node => {
        const matchesCategory = astCategory === 'ALL' || node.type === astCategory;
        const matchesSearch = !astSearch.trim() ||
          node.label.toLowerCase().includes(astSearch.toLowerCase()) ||
          node.type.toLowerCase().includes(astSearch.toLowerCase()) ||
          (node.desc && node.desc.toLowerCase().includes(astSearch.toLowerCase()));

        let filteredChildren = [];
        if (node.children) {
          filteredChildren = filterAstNodes(node.children);
        }

        if ((matchesCategory && matchesSearch) || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredAst = useMemo(() => {
    return filterAstNodes(astData);
  }, [astData, astCategory, astSearch]);

  // -------------------------------------------------------------
  // LIVE TEMPLATE PREVIEW RENDERERS
  // -------------------------------------------------------------
  const renderTemplateLivePreview = () => {
    switch (selectedTemplate) {
      case 'Cyberpunk Portfolio':
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary, fontFamily: mono }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, mb: 3, borderBottom: `1px solid ${divider}` }}>
              <Box>
                <Typography variant="caption" sx={{ color: dark ? gold : '#8A6A09', fontWeight: 800 }}>// OPERATIVE MATRIX //</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.02em' }}>NEO.SOVEREIGN_</Typography>
              </Box>
              <Chip label="ONLINE // 3.8ms" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', border: dark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0', fontFamily: mono, fontWeight: 700 }} />
            </Box>
            <Paper sx={{ p: 2, bgcolor: dark ? '#10121A' : surface, border: `1px solid ${divider}`, borderRadius: 2, mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: dark ? gold : '#8A6A09', display: 'block', mb: 1 }}>root@sovereign:~$ cat deployments.matrix</Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.8rem', mb: 0.5 }}>● AZOTH-OS: Autonomous Neural OS (Zero-Egress)</Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.8rem' }}>● HEXSTRIKE: Cryptographic AST Shield</Typography>
            </Paper>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>AZOTH-OS 2.0</Typography>
                  <Typography variant="caption" sx={{ color: textSecondary }}>Micro-kernel WASM runtime.</Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>NEURO-DAEMON</Typography>
                  <Typography variant="caption" sx={{ color: textSecondary }}>Local vectorized memory on :8788.</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 'AI Swarm Console':
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Chip label="TRI-AGENT CONSENSUS ACTIVE" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono }} />
              <Typography variant="caption" sx={{ color: dark ? '#10B981' : '#059669', fontFamily: mono, fontWeight: 700 }}>● 3 NODES SYNCED</Typography>
            </Box>
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              {[
                { name: 'Planner Alpha', status: 'RUNNING', job: 'Task Routing', color: dark ? '#10B981' : '#059669' },
                { name: 'Coder Omega', status: 'SYNTHESIZING', job: 'AST Generation', color: dark ? '#D4AF37' : '#B8860B' },
                { name: 'Auditor Sigma', status: 'VERIFYING', job: 'Zero-Egress Seal', color: dark ? '#38BDF8' : '#0284C7' }
              ].map((ag, i) => (
                <Grid key={i} xs={12} sm={4}>
                  <Box sx={{ p: 1.5, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: textPrimary }}>{ag.name}</Typography>
                      <span style={{ fontSize: '0.65rem', color: ag.color, fontWeight: 800, fontFamily: 'monospace' }}>{ag.status}</span>
                    </Box>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{ag.job}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Paper sx={{ p: 2, bgcolor: dark ? '#0D0E16' : '#F1F5F9', border: `1px solid ${divider}`, borderRadius: 2, fontFamily: mono, fontSize: '0.75rem' }}>
              <div style={{ color: dark ? '#10B981' : '#047857' }}>✔ Planner Alpha dispatched task: Synthesize 142 AST nodes.</div>
              <div style={{ color: textSecondary, marginTop: 4 }}>✔ Coder Omega sealed AST with hash 0x8F4A...3B21 (Zero egress).</div>
            </Paper>
          </Box>
        );

      case 'Documentation Hub':
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip label="API REFERENCE & CONTRACTS" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono }} />
              <Typography variant="caption" sx={{ color: dark ? gold : '#8A6A09', fontFamily: mono }}>v2.4 LOCAL WASM</Typography>
            </Box>
            <Paper sx={{ p: 2, bgcolor: dark ? '#121420' : surface, border: `1px solid ${divider}`, borderRadius: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary, mb: 1 }}>POST /v2/ast/compile</Typography>
              <Box sx={{ p: 1.5, bgcolor: dark ? '#08080B' : '#F1F5F9', border: `1px solid ${divider}`, borderRadius: 1.5, fontFamily: mono, fontSize: '0.75rem', color: dark ? goldLight : '#8A6A09' }}>
                curl -X POST http://127.0.0.1:8788/v2/ast/compile -d '&#123;"template":"sovereign"&#125;'
              </Box>
            </Paper>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="200 OK" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', border: dark ? 'none' : '1px solid #A7F3D0', fontWeight: 800, fontSize: '0.7rem' }} />
              <Chip label="0 EGRESS PACKETS" size="small" sx={{ bgcolor: dark ? 'rgba(56,189,248,0.15)' : '#E0F2FE', color: dark ? '#38BDF8' : '#0369A1', border: dark ? 'none' : '1px solid #BAE6FD', fontWeight: 800, fontSize: '0.7rem' }} />
            </Box>
          </Box>
        );

      case 'Solana Web3 Mint Deck':
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip label="SOLANA CANDY MACHINE v3" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono }} />
              <Typography variant="caption" sx={{ color: dark ? '#10B981' : '#059669', fontFamily: mono, fontWeight: 700 }}>🟢 PHANTOM CONNECTED</Typography>
            </Box>
            <Paper sx={{ p: 3, bgcolor: dark ? '#121420' : surface, border: `1px solid ${divider}`, borderRadius: 3, mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: textPrimary, fontFamily: mono, mb: 0.5 }}>1.25 SOL</Typography>
              <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, display: 'block', mb: 2 }}>
                3,412 / 5,000 Minted (68.2%)
              </Typography>
              <Box sx={{ width: '100%', bgcolor: dark ? '#08080B' : '#E2E8F0', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2 }}>
                <Box sx={{ width: '68.2%', height: '100%', bgcolor: gold }} />
              </Box>
              <Button fullWidth variant="contained" sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontWeight: 800, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}>
                Mint Sovereign NFT
              </Button>
            </Paper>
            <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, fontSize: '0.7rem' }}>
              Verified Contract: SoV19d8...88aF • Zero Royalty Egress
            </Typography>
          </Box>
        );

      case 'Biomorphic Neuro Shop':
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip label="NEURAL MESH STORE" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono }} />
              <Typography variant="caption" sx={{ color: dark ? '#10B981' : '#059669', fontFamily: mono, fontWeight: 700 }}>● 98.6% SYNC</Typography>
            </Box>
            <Grid container spacing={1.5}>
              {[
                { name: 'Cortical Neural Interface v3', price: '2.40 GOLD', sync: '99.4%' },
                { name: 'Dopamine Synapse Stabilizer', price: '0.85 GOLD', sync: '97.8%' }
              ].map((p, i) => (
                <Grid key={i} xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>{p.name}</Typography>
                      <span style={{ fontSize: '0.65rem', color: dark ? '#10B981' : '#059669', fontWeight: 800 }}>{p.sync}</span>
                    </Box>
                    <Typography variant="h6" sx={{ color: gold, fontWeight: 900, fontFamily: mono, mt: 1 }}>{p.price}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      default: // Sovereign SaaS Dashboard
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip label="LIVE SIMULATED UI CANVAS" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontSize: '0.7rem' }} />
              <Typography variant="caption" sx={{ fontFamily: mono, color: dark ? '#10B981' : '#059669', fontWeight: 700 }}>● 60 FPS LOCAL RENDER</Typography>
            </Box>

            <Paper sx={{ p: 2.5, bgcolor: dark ? '#121420' : surface, border: `1px solid ${divider}`, borderRadius: 2, mb: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textPrimary, mb: 0.5 }}>
                {selectedTemplate}
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.82rem' }}>
                Target Runtime: <Box component="span" sx={{ color: gold, fontFamily: mono, fontWeight: 700 }}>{selectedFramework.toUpperCase()}</Box>
              </Typography>
            </Paper>

            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: dark ? '#161824' : '#FFFFFF', borderRadius: 2, border: `1px solid ${divider}` }}>
                  <Typography variant="caption" sx={{ color: textSecondary }}>NODE LATENCY</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: gold }}>12.4ms</Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: dark ? '#161824' : '#FFFFFF', borderRadius: 2, border: `1px solid ${divider}` }}>
                  <Typography variant="caption" sx={{ color: textSecondary }}>SEAL HASH</Typography>
                  <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 700, color: dark ? '#10B981' : '#059669', textOverflow: 'ellipsis', overflow: 'hidden' }}>0x8F4A...3B21</Typography>
                </Box>
              </Grid>
              <Grid xs={12} sm={4}>
                <Box sx={{ p: 2, bgcolor: dark ? '#161824' : '#FFFFFF', borderRadius: 2, border: `1px solid ${divider}` }}>
                  <Typography variant="caption" sx={{ color: textSecondary }}>SWARM STATUS</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: dark ? '#38BDF8' : '#0284C7' }}>Active (6/6)</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  // -------------------------------------------------------------
  // RECURSIVE AST TREE NODE COMPONENT
  // -------------------------------------------------------------
  const renderAstNode = (node) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedAstNode?.id === node.id;

    return (
      <Box key={node.id} sx={{ ml: node.depth * 2, mb: 1 }}>
        <Paper
          elevation={0}
          onClick={() => setSelectedAstNode(node)}
          sx={{
            p: 1.2,
            px: 1.6,
            bgcolor: isSelected ? (dark ? 'rgba(212,175,55,0.18)' : '#FEF9E7') : (dark ? '#10121A' : '#FFFFFF'),
            border: isSelected ? `1.5px solid ${gold}` : `1px solid ${divider}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: gold,
              bgcolor: dark ? 'rgba(212,175,55,0.08)' : '#FEF9E7'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpand(node.id);
                }}
                sx={{ p: 0.2, color: textSecondary }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </IconButton>
            ) : (
              <Box sx={{ width: 20 }} />
            )}

            <Chip
              label={node.badge}
              size="small"
              sx={{
                bgcolor: `${node.color}22`,
                color: node.color,
                border: `1px solid ${node.color}55`,
                fontWeight: 800,
                fontSize: '0.65rem',
                fontFamily: mono,
                height: 20
              }}
            />

            <Typography
              variant="body2"
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.8rem',
                color: isSelected ? (dark ? goldLight : '#8A6A09') : textPrimary,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {node.label}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontSize: '0.7rem' }}>
              line {node.line}
            </Typography>
            {hasChildren && (
              <Chip
                label={`${node.children.length} subnodes`}
                size="small"
                sx={{ bgcolor: dark ? '#1E293B' : '#E2E8F0', color: textSecondary, fontSize: '0.62rem', height: 18, fontFamily: mono }}
              />
            )}
          </Box>
        </Paper>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1 }}>
              {node.children.map(child => renderAstNode(child))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, pb: { xs: 12, md: 6 } }}>
      
      {/* Header Section — gold radial glow behind header */}
      <Box
        sx={{
          mb: { xs: 2.5, md: 4 },
          position: 'relative',
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(212,175,55,0.18) 0%, transparent 70%)',
          border: `1px solid ${divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: `${gold} !important` }} />}
            label="AUTONOMOUS SITE FOUNDRY • SOVEREIGN ENGINE"
            size="small"
            sx={{
              backgroundColor: goldBg,
              color: gold,
              border: `1px solid ${gold}`,
              fontWeight: 800,
              fontFamily: mono,
              px: 1
            }}
          />
          <Chip
            label="ZERO CLOUD EGRESS"
            size="small"
            sx={{
              bgcolor: dark ? '#121420' : '#ECFDF5',
              color: dark ? '#10B981' : '#059669',
              border: dark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0',
              fontWeight: 800,
              fontFamily: mono
            }}
          />
        </Box>
        
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 900, color: textPrimary, fontSize: { xs: '2.2rem', sm: '3rem', md: '3.4rem' }, letterSpacing: '-0.02em' }}>
          Autonomous WebGen Foundry
        </Typography>
        <Typography variant="body1" sx={{ color: textSecondary, maxWidth: 880, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
          High-performance sovereign component foundry. Select layout spec templates, preview live responsive UI in device frames, inspect deterministic AST token trees, and export polyglot code or standalone zero-dependency bundles.
        </Typography>
      </Box>

      {/* MOBILE TABBED WORKSTATION BAR */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 3,
            bgcolor: dark ? '#10121A' : surface,
            borderRadius: 3,
            border: `1px solid ${gold}`,
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
                color: textSecondary,
                fontWeight: 700,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.5,
                px: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  color: dark ? '#08080B' : '#FFFFFF',
                  bgcolor: gold,
                  fontWeight: 800
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

      {/* =========================================================================
          STAGE 01: IDEATION & NATURAL LANGUAGE SPEC PROMPT
          ========================================================================= */}
      {(!isMobile || mobileSection === 'prompt') && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4.5 },
            border: `1px solid ${divider}`,
            borderRadius: 3.5,
            mb: 5,
            backgroundColor: surface,
            borderLeft: `4px solid ${gold}`,
            boxShadow: dark ? '0 0 28px -8px rgba(212,175,55,0.22)' : '0 4px 20px -4px rgba(184,134,11,0.12)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.2, color: textPrimary }}>
                <AutoAwesomeIcon sx={{ color: gold }} /> 1. What should it be?
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Tap an archetype preset to seed the layout tokens or articulate a custom site specification.
              </Typography>
            </Box>
            <Chip
              label="STAGE 01 // SPEC FOUNDRY"
              size="small"
              sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
            />
          </Box>

          <Divider sx={{ my: 2.5, borderColor: divider }} />

          {/* Starter Templates (6 Presets) */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
            STARTER ARCHETYPE PRESETS ({TEMPLATES.length} SEEDS)
          </Typography>
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate === tpl.name;
              const IconComp = tpl.icon;
              return (
                <Grid key={tpl.id} xs={12} sm={6} md={4}>
                  <Box
                    onClick={() => handleSelectTemplate(tpl)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: isSelected ? `2px solid ${gold}` : `1px solid ${divider}`,
                      backgroundColor: isSelected ? goldBg : (dark ? '#121420' : '#F1F5F9'),
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: gold,
                        backgroundColor: goldBg,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconComp sx={{ fontSize: '1.15rem', color: isSelected ? gold : textSecondary }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary, fontSize: '0.88rem' }}>
                          {tpl.name}
                        </Typography>
                      </Box>
                      <Chip label={tpl.tag} size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: isSelected ? gold : (dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'), color: isSelected ? (dark ? '#08080B' : '#FFFFFF') : textSecondary, fontFamily: mono, fontWeight: 800 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: textSecondary, lineHeight: 1.4, fontSize: '0.76rem' }}>
                      {tpl.desc}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Prompt Spec Input */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
            NATURAL LANGUAGE SPECIFICATION PROMPT
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe your site in plain language (e.g. 'A calm minimalist portfolio for a systems architect: dark background, gold accents, metric cards, and responsive contact drawer')."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: dark ? '#0D0F18' : '#FFFFFF',
                color: textPrimary,
                borderRadius: 2,
                '& fieldset': { borderColor: divider },
                '&:hover fieldset': { borderColor: gold },
                '&.Mui-focused fieldset': { borderColor: gold }
              }
            }}
          />
        </Paper>
      )}

      {/* =========================================================================
          STAGE 02: BRAND LOOK, VISUAL THEME TOKENS & BUILDER SKILLS
          ========================================================================= */}
      {(!isMobile || mobileSection === 'prompt') && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4.5 },
            border: `1px solid ${divider}`,
            borderRadius: 3.5,
            mb: 5,
            backgroundColor: surface,
            borderLeft: `4px solid ${gold}`,
            boxShadow: dark ? '0 0 28px -8px rgba(212,175,55,0.18)' : '0 4px 20px -4px rgba(184,134,11,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.2, color: textPrimary }}>
                <TuneIcon sx={{ color: gold }} /> 2. Name, Theme &amp; Builder Skills
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Configure your project slug identifier, aesthetic design token palette, and generation skill guides.
              </Typography>
            </Box>
            <Chip
              label="STAGE 02 // AESTHETICS & SKILLS"
              size="small"
              sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
            />
          </Box>

          <Divider sx={{ my: 2.5, borderColor: divider }} />

          {/* Project Name Slug Input */}
          <Box sx={{ mb: 3.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
              PROJECT IDENTIFIER (SLUG)
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={siteName}
              onChange={(e) => setSiteName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="e.g. sovereign-matrix"
              helperText="Letters, numbers, and dashes. Used for export bundle directory and local daemon routing."
              sx={{
                maxWidth: 480,
                '& .MuiOutlinedInput-root': {
                  bgcolor: dark ? '#0D0F18' : '#FFFFFF',
                  fontFamily: mono,
                  '& fieldset': { borderColor: divider },
                  '&:hover fieldset': { borderColor: gold },
                  '&.Mui-focused fieldset': { borderColor: gold }
                }
              }}
            />
          </Box>

          {/* 4 Theme Selection Cards */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
            HIGH-CONTRAST TOKEN PALETTES (4 THEME SYSTEMS)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3.5 }}>
            {THEMES.map((th) => {
              const isSelected = selectedTheme === th.id;
              return (
                <Grid key={th.id} xs={12} sm={6} md={3}>
                  <Box
                    onClick={() => setSelectedTheme(th.id)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: isSelected ? `2px solid ${th.primary}` : `1px solid ${divider}`,
                      backgroundColor: isSelected ? (dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF') : (dark ? '#10121C' : '#F8FAFC'),
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      height: '100%',
                      boxShadow: isSelected ? `0 4px 20px ${th.primary}33` : 'none',
                      '&:hover': {
                        borderColor: th.primary,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: th.primary, border: '1px solid rgba(255,255,255,0.3)' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? th.primary : textPrimary, fontSize: '0.84rem' }}>
                        {th.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.74rem', lineHeight: 1.4, display: 'block' }}>
                      {th.desc}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Builder Skills Guide Chips */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
            BUILDER GUIDELINE SKILLS (CLICK TO TOGGLE)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SKILLS.map((sk) => {
              const isOn = selectedSkills.includes(sk.id);
              return (
                <Chip
                  key={sk.id}
                  label={sk.label}
                  onClick={() => handleToggleSkill(sk.id)}
                  sx={{
                    bgcolor: isOn ? goldBg : (dark ? '#121420' : '#F1F5F9'),
                    color: isOn ? (dark ? goldLight : '#8A6A09') : textSecondary,
                    border: isOn ? `1.5px solid ${gold}` : `1px solid ${divider}`,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: goldBg, borderColor: gold }
                  }}
                />
              );
            })}
          </Box>
        </Paper>
      )}

      {/* =========================================================================
          STAGE 03: COMPILER ENGINE SELECTION & SYNTHESIS TRIGGER
          ========================================================================= */}
      {(!isMobile || mobileSection === 'prompt') && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4.5 },
            border: `1px solid ${divider}`,
            borderRadius: 3.5,
            mb: 5,
            backgroundColor: surface,
            borderLeft: `4px solid ${gold}`,
            boxShadow: dark ? '0 0 28px -8px rgba(212,175,55,0.18)' : '0 4px 20px -4px rgba(184,134,11,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.2, color: textPrimary }}>
                <RocketLaunchIcon sx={{ color: gold }} /> 3. Compiler Engine &amp; Synthesis Trigger
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Choose execution runtime, target exporter language, and launch compilation into the sneak-peek preview.
              </Typography>
            </Box>
            <Chip
              label="STAGE 03 // ENGINE & BUILD"
              size="small"
              sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
            />
          </Box>

          <Divider sx={{ my: 2.5, borderColor: divider }} />

          {/* Engine Modes */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1.5, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
            GENERATION HARNESS ENGINE
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {ENGINES.map((eng) => {
              const isSelected = selectedEngine === eng.id;
              return (
                <Grid key={eng.id} xs={12} md={4}>
                  <Box
                    onClick={() => setSelectedEngine(eng.id)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: isSelected ? `2px solid ${gold}` : `1px solid ${divider}`,
                      bgcolor: isSelected ? goldBg : (dark ? '#10121C' : '#F8FAFC'),
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      height: '100%',
                      '&:hover': { borderColor: gold, bgcolor: goldBg }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? (dark ? goldLight : '#8A6A09') : textPrimary, mb: 0.5 }}>
                      {eng.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.74rem', lineHeight: 1.4 }}>
                      {eng.desc}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Target Exporter Framework */}
          <Typography variant="caption" sx={{ fontWeight: 800, color: textSecondary, mb: 1, display: 'block', letterSpacing: '0.04em', fontFamily: mono }}>
            TARGET EXPORTER RUNTIME
          </Typography>
          <RadioGroup
            row
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            sx={{ mb: 3.5 }}
          >
            {FRAMEWORKS.map((f) => (
              <FormControlLabel
                key={f.id}
                value={f.id}
                control={<Radio sx={{ color: gold, '&.Mui-checked': { color: gold } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: selectedFramework === f.id ? textPrimary : textSecondary }}>{f.name}</span>
                    <Chip label={f.badge} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: selectedFramework === f.id ? goldBg : (dark ? '#1A1C2A' : '#F1F5F9'), color: selectedFramework === f.id ? gold : textSecondary, fontFamily: mono }} />
                  </Box>
                }
                sx={{ mr: 2, mb: 1 }}
              />
            ))}
          </RadioGroup>

          {/* Action Trigger Buttons */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={isCompiling ? <CheckCircleIcon /> : <RocketLaunchIcon />}
              onClick={handleCompile}
              disabled={isCompiling}
              sx={{
                bgcolor: gold,
                color: dark ? '#08080B' : '#FFFFFF',
                px: 4,
                py: 1.4,
                fontWeight: 900,
                fontSize: '0.95rem',
                borderRadius: 2,
                boxShadow: dark ? '0 4px 20px rgba(212,175,55,0.35)' : '0 4px 15px rgba(184,134,11,0.25)',
                '&:hover': { bgcolor: dark ? goldLight : '#9A7008' }
              }}
            >
              {isCompiling ? 'Synthesizing Site...' : '⚡ Synthesize & Build Website'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportBundle}
              sx={{ borderColor: gold, color: gold, py: 1.4, px: 3, fontWeight: 800, borderRadius: 2, bgcolor: goldBg, '&:hover': { bgcolor: dark ? 'rgba(212,175,55,0.25)' : 'rgba(184,134,11,0.18)' } }}
            >
              Export Standalone Bundle (.html)
            </Button>

            <Button
              variant="contained"
              size="large"
              startIcon={<CloudDoneIcon />}
              onClick={handleDeployModalOpen}
              sx={{ bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, color: textPrimary, py: 1.4, px: 3, fontWeight: 750, borderRadius: 2, '&:hover': { borderColor: gold } }}
            >
              Deploy Local Edge
            </Button>
          </Box>

          {isCompiling && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: gold } }} />
            </Box>
          )}
        </Paper>
      )}

      {/* =========================================================================
          STAGE 04: REAL-TIME SNEAK-PEEK LIVE PREVIEW & WORKSTATION
          ========================================================================= */}
      {(!isMobile || mobileSection === 'code' || mobileSection === 'preview') && (
        <Paper
          sx={{
            border: `1px solid ${divider}`,
            borderRadius: 3.5,
            overflow: 'hidden',
            backgroundColor: dark ? '#10121A' : surface,
            boxShadow: dark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 12px 36px rgba(0,0,0,0.08)',
            mb: 6
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              backgroundColor: dark ? '#141724' : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${divider}`,
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 0.8 }}>
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#27C93F' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ color: dark ? goldLight : '#8A6A09', fontFamily: mono, fontWeight: 800, fontSize: '0.84rem' }}>
                4. SNEAK-PEEK CONSOLE • {siteName.toUpperCase()} • {FRAMEWORKS.find(f => f.id === selectedFramework)?.name.toUpperCase()}
              </Typography>
            </Box>

            {/* Device Viewport Switcher */}
            <ToggleButtonGroup
              size="small"
              value={deviceFrame}
              exclusive
              onChange={(e, val) => val && setDeviceFrame(val)}
              sx={{ bgcolor: dark ? '#0D0E15' : '#FFFFFF', border: `1px solid ${divider}`, '& .MuiToggleButton-root': { color: textSecondary, px: 1.5, py: 0.6, '&.Mui-selected': { color: gold, bgcolor: goldBg } } }}
            >
              <ToggleButton value="desktop" aria-label="desktop viewport">
                <Tooltip title="Desktop Viewport (100%)"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><DesktopWindowsIcon fontSize="small" /><span style={{ fontSize: '0.72rem', fontFamily: mono }}>Desktop</span></Box></Tooltip>
              </ToggleButton>
              <ToggleButton value="tablet" aria-label="tablet viewport">
                <Tooltip title="Tablet Viewport (768px)"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TabletIcon fontSize="small" /><span style={{ fontSize: '0.72rem', fontFamily: mono }}>Tablet</span></Box></Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile" aria-label="mobile viewport">
                <Tooltip title="Mobile Viewport (375px)"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><SmartphoneIcon fontSize="small" /><span style={{ fontSize: '0.72rem', fontFamily: mono }}>Mobile</span></Box></Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Console Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${divider}`, backgroundColor: dark ? '#10121A' : surface }}>
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 46,
                '& .MuiTab-root': {
                  color: textSecondary,
                  fontFamily: mono,
                  fontSize: '0.84rem',
                  minHeight: 46,
                  textTransform: 'none',
                  '&.Mui-selected': { color: gold, fontWeight: 800 }
                },
                '& .MuiTabs-indicator': { backgroundColor: gold }
              }}
            >
              <Tab icon={<VisibilityIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Live Sneak-Peek Preview" />
              <Tab icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Generated Polyglot Code" />
              <Tab icon={<AccountTreeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Deterministic AST Inspector" />
              <Tab icon={<SpeedIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Compiler Telemetry" />
            </Tabs>
          </Box>

          {/* Tab 0: Live Sneak-Peek Preview & Viewport */}
          {activeTab === 0 && (
            <Box sx={{ bgcolor: dark ? '#030508' : '#F1F5F9' }}>
              {/* Iterative Tweak Bar */}
              <Box sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: dark ? '#10121A' : '#FFFFFF', borderBottom: `1px solid ${divider}`, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? goldLight : '#8A6A09', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TuneIcon sx={{ fontSize: '1rem' }} /> ITERATIVE TWEAK:
                </Typography>
                <TextField
                  size="small"
                  placeholder="Want a change? e.g. Make buttons neon cyan and add trust badges"
                  value={tweakText}
                  onChange={(e) => setTweakText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTweak()}
                  sx={{
                    flex: 1,
                    minWidth: 260,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: dark ? '#08080B' : '#F8FAFC',
                      fontSize: '0.82rem',
                      fontFamily: mono,
                      '& fieldset': { borderColor: divider }
                    }
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleTweak}
                  sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontWeight: 800, px: 2.5, py: 0.8 }}
                >
                  Apply Tweak
                </Button>
              </Box>

              {/* Viewport Frame */}
              <Box sx={{ p: { xs: 1.5, sm: 3 }, display: 'flex', justifyContent: 'center', minHeight: 420 }}>
                <Box
                  sx={{
                    width: deviceFrame === 'mobile' ? '375px' : deviceFrame === 'tablet' ? '768px' : '100%',
                    maxWidth: '100%',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: deviceFrame !== 'desktop' ? `3px solid ${dark ? '#334155' : '#CBD5E1'}` : 'none',
                    borderRadius: deviceFrame === 'mobile' ? 5 : deviceFrame === 'tablet' ? 4 : 0,
                    overflow: 'hidden',
                    boxShadow: deviceFrame !== 'desktop' ? (dark ? '0 16px 40px rgba(0,0,0,0.8)' : '0 16px 40px rgba(0,0,0,0.12)') : 'none',
                    bgcolor: dark ? '#08080B' : surface
                  }}
                >
                  {/* Device Bezel Top (Mobile / Tablet) */}
                  {deviceFrame === 'mobile' && (
                    <Box sx={{ bgcolor: dark ? '#121420' : '#E2E8F0', py: 0.8, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${divider}` }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontSize: '0.65rem' }}>9:41</Typography>
                      <Box sx={{ width: 60, height: 8, bgcolor: dark ? '#08080B' : '#CBD5E1', borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ fontFamily: mono, color: dark ? '#10B981' : '#059669', fontSize: '0.65rem' }}>5G 100%</Typography>
                    </Box>
                  )}

                  {/* Live Render */}
                  {renderTemplateLivePreview()}

                  {/* Device Footer Actions */}
                  <Box sx={{ p: 2, bgcolor: dark ? '#0D0E15' : '#F8FAFC', borderTop: `1px solid ${divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontSize: '0.72rem' }}>
                      Viewport: {deviceFrame.toUpperCase()} • Zero Cloud Egress • Theme: {selectedTheme.toUpperCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" onClick={handleExportBundle} sx={{ color: gold, borderColor: gold, fontSize: '0.7rem', fontWeight: 800 }}>
                        Export Bundle
                      </Button>
                      <Button size="small" variant="contained" onClick={handleDeployModalOpen} sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}>
                        Deploy
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Tab 1: Code View */}
          {activeTab === 1 && (
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 12, right: 16, zIndex: 2, display: 'flex', gap: 1 }}>
                <Chip label={`${currentCode.split('\n').length} LINES`} size="small" sx={{ bgcolor: dark ? '#1E293B' : '#E2E8F0', color: textSecondary, fontFamily: mono, fontSize: '0.7rem' }} />
                <Button size="small" variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopyCode} sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontWeight: 800, py: 0.2, fontSize: '0.72rem', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </Box>
              <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: mono, fontSize: '0.84rem', minHeight: 320, maxHeight: 520, overflowY: 'auto', bgcolor: dark ? '#08080B' : '#F8FAFC' }}>
                <pre style={{ margin: 0, color: dark ? '#F8FAFC' : '#0F172A', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {currentCode}
                </pre>
              </Box>
            </Box>
          )}

          {/* Tab Content 2: AST Diff & Inspector Tab */}
          {activeTab === 2 && (
                  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#090B12' : '#F8FAFC', minHeight: 380 }}>
                    
                    {/* AST Node Count Metrics Header */}
                    <Box sx={{ p: 2, mb: 2.5, bgcolor: dark ? '#10121A' : surface, border: `1px solid ${divider}`, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="AST DETERMINISTIC METRICS" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 800, fontFamily: mono }} />
                          <Chip label="100% WASM PURITY" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', border: dark ? 'none' : '1px solid #A7F3D0', fontWeight: 800, fontFamily: mono }} />
                        </Box>

                        {/* Mode Switcher: Tree vs Diff */}
                        <ToggleButtonGroup
                          size="small"
                          value={astMode}
                          exclusive
                          onChange={(e, v) => v && setAstMode(v)}
                          sx={{ bgcolor: dark ? '#08080B' : '#FFFFFF', border: `1px solid ${divider}`, '& .MuiToggleButton-root': { color: textSecondary, px: 1.5, py: 0.3, fontSize: '0.75rem', fontFamily: mono, '&.Mui-selected': { color: gold, bgcolor: goldBg } } }}
                        >
                          <ToggleButton value="tree">Tree Inspector</ToggleButton>
                          <ToggleButton value="diff">Diff Optimizer</ToggleButton>
                        </ToggleButtonGroup>
                      </Box>

                      {/* Metrics Counter Bar */}
                      <Grid container spacing={1.5}>
                        {[
                          { label: 'Total AST Nodes', count: 142, color: textPrimary },
                          { label: 'Root & Declarations', count: 2, color: '#A855F7' },
                          { label: 'JSX Elements', count: 38, color: '#38BDF8' },
                          { label: 'Tailwind Utility Tokens', count: 84, color: '#10B981' },
                          { label: 'Reactive Hooks', count: 18, color: '#F59E0B' }
                        ].map((m, i) => (
                          <Grid key={i} xs={6} sm={2.4}>
                            <Box sx={{ p: 1, bgcolor: dark ? '#141622' : '#FFFFFF', borderRadius: 1.5, border: `1px solid ${divider}` }}>
                              <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', fontFamily: mono }}>{m.label}</Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: m.color, fontFamily: mono }}>{m.count}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {astMode === 'tree' ? (
                      <Grid container spacing={2}>
                        {/* Tree Left Side: Filter and Hierarchical Tree View */}
                        <Grid xs={12} lg={7}>
                          {/* Search & Category Filter */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <TextField
                              size="small"
                              placeholder="Filter AST nodes..."
                              value={astSearch}
                              onChange={(e) => setAstSearch(e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: textSecondary, fontSize: '1rem' }} /></InputAdornment>
                              }}
                              sx={{
                                flex: 1,
                                minWidth: 160,
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: dark ? '#10121A' : '#FFFFFF',
                                  color: textPrimary,
                                  fontSize: '0.8rem',
                                  fontFamily: mono,
                                  '& fieldset': { borderColor: divider }
                                }
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {['ALL', 'JSXElement', 'TailwindClasses', 'ReactiveHooks'].map((cat) => (
                                <Chip
                                  key={cat}
                                  label={cat === 'ALL' ? 'All' : cat}
                                  size="small"
                                  onClick={() => setAstCategory(cat)}
                                  sx={{
                                    bgcolor: astCategory === cat ? gold : (dark ? '#141622' : '#FFFFFF'),
                                    color: astCategory === cat ? (dark ? '#08080B' : '#FFFFFF') : textSecondary,
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    fontFamily: mono,
                                    cursor: 'pointer',
                                    border: `1px solid ${astCategory === cat ? gold : divider}`
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>

                          {/* Node Tree View */}
                          <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 1 }}>
                            {filteredAst.map(node => renderAstNode(node))}
                          </Box>
                        </Grid>

                        {/* Tree Right Side: Detailed Node Inspector */}
                        <Grid xs={12} lg={5}>
                          <Paper sx={{ p: 2.5, bgcolor: dark ? '#10121A' : surface, border: `1px solid ${divider}`, borderRadius: 2, minHeight: 340 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, mb: 1.5, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LayersIcon sx={{ fontSize: '1rem' }} /> AST Node Inspector
                            </Typography>

                            {selectedAstNode ? (
                              <Box sx={{ fontFamily: mono, fontSize: '0.78rem' }}>
                                <Box sx={{ mb: 2, pb: 1.5, borderBottom: `1px solid ${divider}` }}>
                                  <Chip label={selectedAstNode.type} size="small" sx={{ bgcolor: `${selectedAstNode.color}22`, color: selectedAstNode.color, fontWeight: 800, mb: 1 }} />
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: textPrimary, wordBreak: 'break-all' }}>
                                    {selectedAstNode.label}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.5 }}>
                                    {selectedAstNode.desc}
                                  </Typography>
                                </Box>

                                <Typography variant="caption" sx={{ color: gold, fontWeight: 800, display: 'block', mb: 1 }}>
                                  NODE ATTRIBUTES (CRYPTOGRAPHIC AST)
                                </Typography>
                                <Paper sx={{ p: 1.5, bgcolor: dark ? '#08080B' : '#F1F5F9', border: `1px solid ${divider}`, borderRadius: 1.5, color: dark ? '#38BDF8' : '#0284C7', mb: 2 }}>
                                  <pre style={{ margin: 0, fontSize: '0.72rem', whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(selectedAstNode.attrs, null, 2)}
                                  </pre>
                                </Paper>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: textSecondary, fontSize: '0.7rem' }}>
                                  <span>Location: line {selectedAstNode.line}</span>
                                  <span>Deterministic: 100%</span>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, color: textSecondary, textAlign: 'center' }}>
                                <AccountTreeIcon sx={{ fontSize: '2.4rem', mb: 1, opacity: 0.4 }} />
                                <Typography variant="caption" sx={{ fontFamily: mono }}>
                                  Select any AST node from the tree to inspect tokens, attributes, and cryptographic seal details.
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>
                    ) : (
                      /* Diff Optimizer View */
                      <Paper sx={{ p: 2.5, bgcolor: dark ? '#10121A' : surface, border: `1px solid ${divider}`, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary, fontFamily: mono }}>
                            AST OPTIMIZATION DIFF COMPARISON
                          </Typography>
                          <Chip label="-34.7% AST REDUCTION" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', border: dark ? 'none' : '1px solid #A7F3D0', fontWeight: 800, fontFamily: mono }} />
                        </Box>

                        <Box sx={{ spaceY: 1, fontFamily: mono, fontSize: '0.78rem' }}>
                          <Box sx={{ p: 1.2, mb: 1, bgcolor: dark ? 'rgba(16,185,129,0.08)' : '#ECFDF5', border: dark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0', borderRadius: 1.5, color: dark ? '#10B981' : '#047857' }}>
                            + [OPTIMIZED] Inlined 48 Tailwind tokens into static zero-runtime CSS spec.
                          </Box>
                          <Box sx={{ p: 1.2, mb: 1, bgcolor: dark ? 'rgba(16,185,129,0.08)' : '#ECFDF5', border: dark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0', borderRadius: 1.5, color: dark ? '#10B981' : '#047857' }}>
                            + [OPTIMIZED] Hoisted 12 static DOM subtrees (Zero re-renders on state change).
                          </Box>
                          <Box sx={{ p: 1.2, mb: 1, bgcolor: dark ? 'rgba(239,68,68,0.08)' : '#FEF2F2', border: dark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA', borderRadius: 1.5, color: dark ? '#F87171' : '#B91C1C' }}>
                            - [PRUNED] 18 redundant wrapper &lt;div&gt; nodes eliminated during WASM compilation.
                          </Box>
                          <Box sx={{ p: 1.2, mb: 1, bgcolor: dark ? 'rgba(239,68,68,0.08)' : '#FEF2F2', border: dark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #FECACA', borderRadius: 1.5, color: dark ? '#F87171' : '#B91C1C' }}>
                            - [PRUNED] External client hydration polyfills stripped (0 bytes egress).
                          </Box>
                          <Box sx={{ p: 1.2, bgcolor: dark ? 'rgba(245,158,11,0.08)' : '#FFFBEB', border: dark ? '1px solid rgba(245,158,11,0.3)' : '1px solid #FDE68A', borderRadius: 1.5, color: dark ? '#FBBF24' : '#B45309' }}>
                            ~ [MUTATED] Flattened reactive hook dependency matrix for instant micro-bundle execution.
                          </Box>
                        </Box>
                      </Paper>
                    )}

                  </Box>
                )}

                {/* Tab Content 3: Compiler Logs */}
                {activeTab === 3 && (
                  <Box sx={{ p: 3, fontFamily: mono, fontSize: '0.85rem', minHeight: 320, bgcolor: dark ? '#08080B' : '#F8FAFC' }}>
                    <div style={{ color: dark ? '#10B981' : '#059669', fontWeight: 700 }}>✔ Local WASM WebGen compiler v2.4 initialized.</div>
                    <div style={{ color: textSecondary, marginTop: 8 }}>Target Template: {selectedTemplate}</div>
                    <div style={{ color: textSecondary, marginTop: 4 }}>Target Framework: {FRAMEWORKS.find(f => f.id === selectedFramework)?.name}</div>
                    <div style={{ color: textSecondary, marginTop: 4 }}>Local AST Seal: 0x8F4A92B10476C128 • 0 egress calls logged.</div>
                    <div style={{ color: dark ? gold : '#8A6A09', marginTop: 12, fontWeight: 700 }}>✔ All 142 AST nodes successfully verified and ready for deployment.</div>
                  </Box>
                )}

              </Paper>
            )}

      {/* SECTION 3: Polyglot Exporter Runtimes & Component Spec Registry Matrix (Spacious 2-Column Grid) */}
      {(!isMobile || mobileSection === 'specs') && (
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 6 }}>
          
          {/* Left Column: Polyglot Exporters */}
          <Grid xs={12} md={6}>
            <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip label="TARGET RUNTIMES (5 ENGINES)" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontSize: '0.72rem', fontFamily: mono }} />
                  <Chip label="STAGE 03 // EXPORTERS" size="small" sx={{ bgcolor: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSecondary, fontFamily: mono, fontSize: '0.68rem' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: textPrimary }}>
                  Polyglot Exporters
                </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 2 }}>
                    Pick your framework to compile realistic, optimized code in real-time.
                  </Typography>

                  <Stack spacing={1.5}>
                    {FRAMEWORKS.map((exp) => (
                      <Paper
                        key={exp.id}
                        elevation={0}
                        onClick={() => setSelectedFramework(exp.id)}
                        sx={{
                          p: 1.5,
                          border: selectedFramework === exp.id ? `1.5px solid ${gold}` : `1px solid ${divider}`,
                          bgcolor: selectedFramework === exp.id ? goldBg : (dark ? '#121420' : '#FFFFFF'),
                          borderRadius: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: gold, bgcolor: goldBg }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textPrimary, fontSize: '0.85rem' }}>
                            {exp.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, fontSize: '0.68rem' }}>
                            {exp.badge}
                          </Typography>
                        </Box>
                        <Chip
                          label={exp.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            fontFamily: mono,
                            bgcolor: selectedFramework === exp.id ? gold : (dark ? '#1E202E' : '#F1F5F9'),
                            color: selectedFramework === exp.id ? (dark ? '#08080B' : '#FFFFFF') : textSecondary
                          }}
                        />
                      </Paper>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportBundle}
                    sx={{ mt: 3, py: 1.3, borderRadius: 2, fontWeight: 800, bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
                  >
                    Export Standalone HTML Bundle
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column: Spec Registry Matrix */}
            <Grid xs={12} md={6}>
              <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label="SPEC MATRIX (6 PRESETS)" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontSize: '0.72rem', fontFamily: mono }} />
                    <Chip label="STAGE 04 // REGISTRY" size="small" sx={{ bgcolor: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSecondary, fontFamily: mono, fontSize: '0.68rem' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: textPrimary }}>
                    Component Spec Registry
                  </Typography>
                  <Typography variant="body2" sx={{ color: textSecondary, mb: 3 }}>
                    Pre-compiled sovereign layout specs for instant project insertion, tested against zero-egress sandboxes.
                  </Typography>

                  <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                    {TEMPLATES.map((t) => {
                      const isSelected = selectedTemplate === t.name;
                      const IconC = t.icon;
                      return (
                        <Box
                          key={t.id}
                          onClick={() => handleSelectTemplate(t)}
                          sx={{
                            p: 1.8,
                            border: isSelected ? `1.5px solid ${gold}` : `1px solid ${divider}`,
                            borderRadius: 2,
                            bgcolor: isSelected ? goldBg : (dark ? '#121420' : '#FFFFFF'),
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: goldBg, borderColor: gold }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconC sx={{ fontSize: '1.05rem', color: isSelected ? gold : textSecondary }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textPrimary, fontSize: '0.88rem' }}>
                                {t.name}
                              </Typography>
                            </Box>
                            <Chip label={t.tag} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: dark ? 'rgba(56,189,248,0.15)' : '#E0F2FE', color: dark ? '#38BDF8' : '#0369A1', fontWeight: 800, fontFamily: mono }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: textSecondary, display: 'block', fontSize: '0.76rem', lineHeight: 1.4 }}>
                            {t.desc}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

        </Grid>
      )}

      {/* =========================================================================
          STAGE 06: SOVEREIGN REPOSITORY & INSTALLATION FUNNEL
          ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4.5 },
          mb: 6,
          borderRadius: 3,
          border: `1.5px solid ${gold}`,
          bgcolor: dark ? '#0D0E16' : surface,
          boxShadow: dark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 8px 30px rgba(212,175,55,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <RocketLaunchIcon sx={{ color: gold, fontSize: '1.6rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.01em' }}>
              Deploy WebGen & Autonomous Tools Locally
            </Typography>
          </Box>
          <Chip
            label="AIR-GAPPED SOVEREIGN ECOSYSTEM"
            size="small"
            sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
          />
        </Box>

        <Typography variant="body1" sx={{ color: textSecondary, mb: 3.5, maxWidth: 920, lineHeight: 1.65 }}>
          Zoth WebGen and the accompanying 29+ autonomous developer utilities are engineered for 100% offline, zero-cloud sovereign operation. Run the standalone WebGen foundry micro-repo, clone the unified Zoth Studio v2 cockpit, or install the full bare-metal Zoth OS runtime.
        </Typography>

        <Grid container spacing={3}>
          {/* Funnel Option 1: Standalone WebGen Repo */}
          <Grid xs={12} md={4}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: dark ? '#121420' : '#F8FAFC', border: `1px solid ${divider}`, borderRadius: 2.5, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? goldLight : '#8A6A09' }}>
                  Option 1: Zoth WebGen Micro-Repo
                </Typography>
                <Chip label="STANDALONE" size="small" sx={{ bgcolor: dark ? 'rgba(56,189,248,0.15)' : '#E0F2FE', color: dark ? '#38BDF8' : '#0369A1', fontWeight: 800, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.84rem' }}>
                Dedicated standalone repository with offline WebGen engine, AST transformer, and polyglot framework exporters.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: dark ? '#08080B' : '#EDF2F7', border: `1px solid ${divider}`, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: dark ? '#38BDF8' : '#0284C7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  git clone https://github.com/NullAITech/zoth-webgen.git
                </Typography>
                <IconButton size="small" onClick={() => handleCopyCodeText('git clone https://github.com/NullAITech/zoth-webgen.git')} sx={{ color: gold, ml: 1, p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                href="https://github.com/NullAITech/zoth-webgen"
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
                sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
              >
                Open WebGen GitHub Repo
              </Button>
            </Box>
          </Grid>

          {/* Funnel Option 2: Zoth Studio v2 Unified Cockpit */}
          <Grid xs={12} md={4}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: dark ? '#121420' : '#F8FAFC', border: `1px solid ${divider}`, borderRadius: 2.5, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? goldLight : '#8A6A09' }}>
                  Option 2: Zoth Studio v2 Unified
                </Typography>
                <Chip label="FULL SUITE" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.84rem' }}>
                The full sovereign workstation cockpit featuring 29+ tools, STDP memory neural daemon, and WebGPU hardware shaders.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: dark ? '#08080B' : '#EDF2F7', border: `1px solid ${divider}`, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: dark ? '#38BDF8' : '#0284C7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  git clone https://github.com/NullAITech/zoth-studio-v2.git
                </Typography>
                <IconButton size="small" onClick={() => handleCopyCodeText('git clone https://github.com/NullAITech/zoth-studio-v2.git')} sx={{ color: gold, ml: 1, p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                href="https://github.com/NullAITech/zoth-studio-v2"
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
                sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
              >
                Open Studio v2 GitHub Repo
              </Button>
            </Box>
          </Grid>

          {/* Funnel Option 3: Sovereign Zoth OS */}
          <Grid xs={12} md={4}>
            <Box sx={{ p: 2.5, height: '100%', bgcolor: dark ? '#121420' : '#F8FAFC', border: `1px solid ${divider}`, borderRadius: 2.5, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? goldLight : '#8A6A09' }}>
                  Option 3: Sovereign Zoth OS
                </Typography>
                <Chip label="BARE-METAL OS" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', fontWeight: 800, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="body2" sx={{ color: textSecondary, mb: 2, flexGrow: 1, fontSize: '0.84rem' }}>
                Zero-telemetry air-gapped operating system kernel for autonomous agent swarms, hardware enclave encryption, and memory vaults.
              </Typography>
              <Box sx={{ p: 1.2, mb: 2, bgcolor: dark ? '#08080B' : '#EDF2F7', border: `1px solid ${divider}`, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: dark ? '#10B981' : '#059669', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  https://github.com/NullAITech/zoth-os
                </Typography>
                <IconButton size="small" onClick={() => handleCopyCodeText('https://github.com/NullAITech/zoth-os')} sx={{ color: gold, ml: 1, p: 0.5 }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                variant="outlined"
                href="https://github.com/NullAITech/zoth-os"
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
                sx={{ borderColor: gold, color: gold, fontWeight: 800, textTransform: 'none', '&:hover': { borderColor: dark ? goldLight : '#9A7008', bgcolor: goldBg } }}
              >
                Inspect Zoth OS Architecture
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
            bgcolor: dark ? '#10121A' : surface,
            borderTop: `1px solid ${divider}`,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
            zIndex: 1000,
            display: 'flex',
            gap: 1.5
          }}
        >
          <Button
            fullWidth
            variant="contained"
            startIcon={isCompiling ? <CheckCircleIcon /> : <RocketLaunchIcon />}
            onClick={handleCompile}
            disabled={isCompiling}
            sx={{ py: 1.2, fontWeight: 800, borderRadius: 2, bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
          >
            {isCompiling ? 'Compiling...' : 'Generate Spec'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportBundle}
            sx={{ color: gold, borderColor: gold, minWidth: 110, borderRadius: 2, fontWeight: 800 }}
          >
            Export HTML
          </Button>
        </Paper>
      )}

      {/* DEPLOY BUNDLE PIPELINE MODAL */}
      <Dialog
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: dark ? '#10121A' : surface,
            border: `1px solid ${gold}`,
            borderRadius: 3,
            color: textPrimary
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: mono, fontWeight: 800, borderBottom: `1px solid ${divider}`, color: gold, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudDoneIcon /> Sovereign Deploy Pipeline
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ color: textSecondary, mb: 2 }}>
            Deploying <strong style={{ color: textPrimary }}>{selectedTemplate}</strong> to the local zero-egress sandbox runtime.
          </Typography>

          <Stack spacing={1.5} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
            <Box sx={{ p: 1.5, bgcolor: dark ? '#141624' : '#F8FAFC', borderRadius: 2, border: `1px solid ${divider}`, color: textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>1. Sealing WASM AST Nodes (142 nodes)</span>
              {deployStep >= 1 ? <CheckIcon sx={{ color: dark ? '#10B981' : '#059669', fontSize: '1rem' }} /> : <LinearProgress sx={{ width: 40 }} />}
            </Box>
            <Box sx={{ p: 1.5, bgcolor: dark ? '#141624' : '#F8FAFC', borderRadius: 2, border: `1px solid ${divider}`, color: textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>2. Zero Cloud Egress Audit (0 Bytes out)</span>
              {deployStep >= 2 ? <CheckIcon sx={{ color: dark ? '#10B981' : '#059669', fontSize: '1rem' }} /> : deployStep === 1 ? <LinearProgress sx={{ width: 40 }} /> : <span style={{ color: textSecondary }}>Queued</span>}
            </Box>
            <Box sx={{ p: 1.5, bgcolor: dark ? '#141624' : '#F8FAFC', borderRadius: 2, border: `1px solid ${divider}`, color: textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>3. Inlining Gold Theme Tokens (#D4AF37)</span>
              {deployStep >= 3 ? <CheckIcon sx={{ color: dark ? '#10B981' : '#059669', fontSize: '1rem' }} /> : deployStep === 2 ? <LinearProgress sx={{ width: 40 }} /> : <span style={{ color: textSecondary }}>Queued</span>}
            </Box>
            <Box sx={{ p: 1.5, bgcolor: dark ? '#141624' : '#F8FAFC', borderRadius: 2, border: `1px solid ${divider}`, color: textPrimary, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>4. Target: http://127.0.0.1:8788/sovereign-bundle</span>
              {deployStep >= 4 ? <Chip label="DEPLOYED" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.2)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', border: dark ? 'none' : '1px solid #A7F3D0', fontWeight: 800, fontSize: '0.65rem' }} /> : <span style={{ color: textSecondary }}>Pending</span>}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${divider}` }}>
          <Button onClick={() => setDeployOpen(false)} sx={{ color: textSecondary }}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDeployOpen(false);
              setSnackbarMessage('Sovereign Bundle Deployed to Local Edge Sandbox!');
              setSnackbarOpen(true);
            }}
            sx={{ bgcolor: gold, color: dark ? '#08080B' : '#FFFFFF', fontWeight: 800, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
          >
            Launch Sandbox
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR FEEDBACK */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            bgcolor: dark ? '#121420' : '#FFFFFF',
            color: textPrimary,
            border: `1px solid ${gold}`,
            fontFamily: mono,
            fontSize: '0.8rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': { color: gold }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Container>
  );
}
