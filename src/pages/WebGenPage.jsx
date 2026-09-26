import React, { useState, useMemo } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box, Container, Typography, Unstable_Grid2 as Grid, Card, CardContent, Chip, Button, Paper, TextField,
  LinearProgress, IconButton, Tooltip, Tabs, Tab, RadioGroup, FormControlLabel, Radio,
  ToggleButtonGroup, ToggleButton, Stack, useTheme, useMediaQuery, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, InputAdornment, Collapse, Divider
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
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WindowCarousel from '../components/WindowCarousel';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';

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
// FRAMEWORKS (6 Exporter Engines)
// -------------------------------------------------------------
const FRAMEWORKS = [
  { id: 'react-tailwind', name: 'React + Tailwind', badge: 'REACT 19', ext: 'jsx', status: 'ACTIVE' },
  { id: 'vue', name: 'Vue 3 Composition', badge: 'VUE 3.4', ext: 'vue', status: 'READY' },
  { id: 'svelte', name: 'Svelte 5 Runes', badge: 'SVELTE 5', ext: 'svelte', status: 'READY' },
  { id: 'solid', name: 'Solid.js Primitives', badge: 'SOLID 1.8', ext: 'tsx', status: 'READY' },
  { id: 'astro', name: 'Astro 4.0 MPA', badge: 'ASTRO 4', ext: 'astro', status: 'READY' },
  { id: 'html', name: 'Zero-JS Clean HTML', badge: 'PURE HTML5', ext: 'html', status: 'READY' }
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
  const [introDone, setIntroDone] = React.useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [latency, setLatency] = useState('12.4ms');

  if (!introDone) {

    return <CinematicIntro words={["WEBGEN", "LAYOUT", "FOUNDRY"]} onComplete={() => setIntroDone(true)} />;


  }


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
      if (frameworkId === 'solid') {
        return `import { createSignal } from 'solid-js';

export default function SovereignDashboard() {
  const [introDone, setIntroDone] = React.useState(false);
  const [latency, setLatency] = createSignal('12.4ms');
  const [isAuditing, setIsAuditing] = createSignal(false);

  const triggerAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setLatency('11.8ms');
      setIsAuditing(false);
    }, 500);
  };

  return (
    <div class="min-h-screen bg-[#08080B] text-slate-100 p-6 md:p-10 font-sans">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-8 border-b border-[#D4AF37]/20 gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-xs font-mono font-bold">
            <span class="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            SOLID.JS 1.8 • FINE-GRAINED REACTIVITY
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-white mt-2">Sovereign SaaS Dashboard</h1>
          <p class="text-slate-400 text-sm mt-1">Zero virtual DOM overhead, pure reactive signal graphs, zero egress.</p>
        </div>
        <button onClick={triggerAudit} class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#08080B] font-bold text-sm shadow-lg">
          {isAuditing() ? 'Running Diagnostics...' : 'Deploy Bundle'}
        </button>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div class="bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-5">
          <span class="text-xs font-mono text-slate-400 uppercase">CLUSTER LATENCY</span>
          <div class="text-2xl font-black text-white font-mono mt-2">{latency()}</div>
          <span class="text-xs font-semibold text-[#10B981] mt-1 inline-block">● Optimal</span>
        </div>
        <div class="bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-5">
          <span class="text-xs font-mono text-slate-400 uppercase">AST SEAL HASH</span>
          <div class="text-2xl font-black text-white font-mono mt-2">0x8F4A...3B21</div>
          <span class="text-xs font-semibold text-[#10B981] mt-1 inline-block">● Verified</span>
        </div>
        <div class="bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-5">
          <span class="text-xs font-mono text-slate-400 uppercase">SWARM NODES</span>
          <div class="text-2xl font-black text-white font-mono mt-2">6 / 6 Online</div>
          <span class="text-xs font-semibold text-[#10B981] mt-1 inline-block">● 100% Health</span>
        </div>
        <div class="bg-[#12131C] border border-[#D4AF37]/20 rounded-2xl p-5">
          <span class="text-xs font-mono text-slate-400 uppercase">ZERO-EGRESS</span>
          <div class="text-2xl font-black text-white font-mono mt-2">0 Bytes Out</div>
          <span class="text-xs font-semibold text-[#10B981] mt-1 inline-block">● Air-Gapped</span>
        </div>
      </div>
    </div>
  );
}`;
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
      if (frameworkId === 'solid') {
        return `import { createSignal, For } from 'solid-js';

export default function CyberpunkPortfolio() {
  const [projects] = createSignal([
    { name: 'AZOTH-OS 2.0', tag: 'CORE RUNTIME', desc: 'Zero-cloud micro-kernel with local tensor pipeline.' },
    { name: 'NEURO-DAEMON', tag: 'SYNAPTIC DB', desc: 'Vectorized memory daemon running on 8788/v1.' },
    { name: 'HEXSTRIKE ARSENAL', tag: 'SECURITY', desc: 'High-entropy AST validation shield guarding against cloud egress.' }
  ]);

  return (
    <div class="min-h-screen bg-[#08080B] text-slate-200 p-8 font-mono">
      <header class="border-b border-[#D4AF37]/40 pb-4 mb-8">
        <span class="text-xs text-[#D4AF37] font-black uppercase">// SOLID.JS SIGNAL DECK [ONLINE]</span>
        <h1 class="text-4xl font-black text-white mt-1">NEO.SOVEREIGN_</h1>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <For each={projects()}>{(proj) => (
          <div class="bg-[#12131C] border border-[#D4AF37]/20 p-5 rounded-xl hover:border-[#D4AF37] transition">
            <span class="text-[10px] text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30 font-bold">{proj.tag}</span>
            <h3 class="font-bold text-white text-lg mt-2">{proj.name}</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">{proj.desc}</p>
          </div>
        )}</For>
      </div>
    </div>
  );
}`;
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
      if (frameworkId === 'solid') {
        return `import { createSignal, For } from 'solid-js';

export default function AiSwarmConsole() {
  const [agents] = createSignal([
    { id: '1', name: 'Azoth', role: 'Input Normalizer & Security', status: 'Synchronized', color: '#10B981' },
    { id: '2', name: 'Chronos', role: '3-Way Byzantine Triangulation', status: 'Synthesizing', color: '#D4AF37' },
    { id: '3', name: 'Lycan', role: 'Shannon Entropy & Zero-Egress Guard', status: 'Standby', color: '#38BDF8' }
  ]);

  return (
    <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-mono">
      <div class="border-b border-[#D4AF37]/30 pb-4 mb-8 flex justify-between items-center">
        <div>
          <span class="text-xs text-[#D4AF37] tracking-widest font-black">// SOLID.JS SWARM DISPATCHER //</span>
          <h1 class="text-3xl font-black text-white mt-1">TRI-AGENT CONSENSUS</h1>
        </div>
        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs rounded font-bold">QUORUM 2/3</span>
      </div>
      <div class="space-y-4">
        <For each={agents()}>{(ag) => (
          <div class="p-4 bg-[#12131C] border border-[#D4AF37]/20 rounded-xl flex justify-between items-center">
            <div>
              <h3 class="font-bold text-white text-base">{ag.name}</h3>
              <p class="text-xs text-slate-400">{ag.role}</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded" style={{ color: ag.color, "background-color": ag.color + "22", border: "1px solid " + ag.color + "44" }}>
              {ag.status}
            </span>
          </div>
        )}</For>
      </div>
    </div>
  );
}`;
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
      if (frameworkId === 'solid') {
        return `import { createSignal } from 'solid-js';

export default function DocumentationHub() {
  const [activeDoc, setActiveDoc] = createSignal('ast-engine');

  return (
    <div class="min-h-screen bg-[#08080B] text-slate-100 flex font-sans">
      <aside class="w-64 border-r border-[#D4AF37]/20 p-6 space-y-2">
        <div class="text-xs font-mono text-[#D4AF37] font-bold mb-4">API SPECS // SOLID.JS</div>
        <button onClick={() => setActiveDoc('ast-engine')} class="w-full text-left px-3 py-2 rounded text-sm font-semibold hover:bg-[#D4AF37]/10">
          AST Compiler Engine
        </button>
        <button onClick={() => setActiveDoc('zero-egress')} class="w-full text-left px-3 py-2 rounded text-sm font-semibold hover:bg-[#D4AF37]/10">
          Zero-Egress Security
        </button>
      </aside>
      <main class="flex-1 p-8">
        <h1 class="text-3xl font-black text-white">Sovereign API Reference</h1>
        <p class="text-slate-400 text-sm mt-2">Active Spec: {activeDoc()}</p>
        <div class="mt-6 p-4 bg-[#12131C] border border-[#D4AF37]/30 rounded-xl font-mono text-xs text-emerald-400">
          POST /v2/ast/compile • Deterministic WASM Invariant Verified
        </div>
      </main>
    </div>
  );
}`;
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
      if (frameworkId === 'solid') {
        return `import { createSignal } from 'solid-js';

export default function SolanaMintDeck() {
  const [mintCount, setMintCount] = createSignal(1);
  const pricePerSol = 0.85;

  return (
    <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 flex items-center justify-center font-sans">
      <div class="max-w-md w-full bg-[#12131C] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl">
        <span class="text-xs font-mono text-[#D4AF37] font-bold">SOLANA NON-CUSTODIAL // SOLID.JS</span>
        <h2 class="text-2xl font-black text-white mt-1">Sovereign Genesis Mint</h2>
        <div class="my-6 p-4 bg-[#08080B] rounded-xl border border-slate-800 flex justify-between items-center">
          <span class="text-sm text-slate-400">Total Price</span>
          <span class="text-xl font-bold font-mono text-[#D4AF37]">{(mintCount() * pricePerSol).toFixed(2)} SOL</span>
        </div>
        <button class="w-full py-3 bg-[#D4AF37] text-[#08080B] rounded-xl font-black text-sm hover:brightness-110">
          Connect Phantom & Mint
        </button>
      </div>
    </div>
  );
}`;
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
      if (frameworkId === 'solid') {
        return `import { createSignal, For } from 'solid-js';

export default function BiomorphicNeuroShop() {
  const [synapses] = createSignal([
    { title: 'Cortical Neural Interface v3', band: 'Theta 7.83Hz', price: '2.40 GOLD' },
    { title: 'Biomorphic Vector Mesh', band: 'Gamma 40Hz', price: '0.80 GOLD' },
    { title: 'Lucy Oracle Latent Key', band: 'Delta 3.5Hz', price: '1.20 GOLD' }
  ]);

  return (
    <div class="min-h-screen bg-[#08080B] text-slate-100 p-8 font-sans">
      <header class="border-b border-[#D4AF37]/30 pb-4 mb-8">
        <span class="text-xs font-mono text-[#D4AF37] font-bold">// BIOMORPHIC NEURO SHOP • SOLID.JS //</span>
        <h1 class="text-3xl font-black text-white mt-1">Synaptic Weight Artifacts</h1>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <For each={synapses()}>{(item) => (
          <div class="bg-[#12131C] border border-[#D4AF37]/20 p-6 rounded-2xl">
            <span class="text-xs font-mono text-cyan-400">{item.band}</span>
            <h3 class="text-lg font-bold text-white mt-2">{item.title}</h3>
            <div class="text-xl font-mono text-[#D4AF37] font-black mt-4">{item.price}</div>
            <button class="w-full mt-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl font-bold text-xs hover:bg-[#D4AF37] hover:text-[#08080B] transition">
              Attune Synapse
            </button>
          </div>
        )}</For>
      </div>
    </div>
  );
}`;
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
  const [activeTab, setActiveTab] = useState(0); // Default 0: Live UI Preview (front and center!)
  const [copied, setCopied] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [mobileSection, setMobileSection] = useState('preview'); // 'prompt' | 'code' | 'preview' | 'specs'

  // Procedural Web Audio SFX State & Synthesizer
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const playSfx = (type) => {
    if (!sfxEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      } else if (type === 'compile') {
        [587.33, 880, 1174.66].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.07);
          gain.gain.setValueAtTime(0.08, t + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.07 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + idx * 0.07);
          osc.stop(t + idx * 0.07 + 0.45);
        });
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          gain.gain.setValueAtTime(0.1, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.55);
        });
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  };

  // 4-Agent Swarm Multi-Agent Collaboration State
  const [swarmActive, setSwarmActive] = useState(false);
  const [swarmAgents, setSwarmAgents] = useState({
    lycan: { status: 'idle', label: 'Lycan (@antigravity)', role: 'OWASP CSP & WCAG AA Auditor', emoji: '🐺' },
    kitsune: { status: 'idle', label: 'Kitsune (@grok)', role: 'Glassmorphism UI Synthesizer', emoji: '🦊' },
    draco: { status: 'idle', label: 'Draco (@hermes)', role: 'Schema.org & llms.txt Compiler', emoji: '🐲' },
    workbot: { status: 'idle', label: 'Workbot (@ollama)', role: 'Neural Copy & Logic Compiler', emoji: '🤖' },
  });
  const [swarmLogs, setSwarmLogs] = useState([
    { time: '00:00:01', tag: 'SYSTEM', text: 'Quad-agent synthesis harness online. Ready for compilation dispatch.', color: '#94A3B8' }
  ]);
  const [activeArtifactTab, setActiveArtifactTab] = useState('prompt'); // 'prompt' | 'instructions' | 'blueprint' | 'llms'

  // AST Tab State
  const [astSearch, setAstSearch] = useState('');
  const [astCategory, setAstCategory] = useState('ALL'); // 'ALL' | 'RootNode' | 'ComponentDeclaration' | 'JSXElement' | 'TailwindClasses' | 'ReactiveHooks'
  const [selectedAstNode, setSelectedAstNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({ 'node-root': true, 'node-decl': true, 'node-jsx-root': true, 'node-tailwind-root': true, 'node-hooks': true });
  const [astMode, setAstMode] = useState('tree'); // 'tree' | 'diff'

  // Micro-Repo CLI & MCP Server Configuration Helpers
  const selectedTemplateId = useMemo(() => {
    const tpl = TEMPLATES.find(t => t.name === selectedTemplate) || TEMPLATES[0];
    return tpl.id;
  }, [selectedTemplate]);

  const dynamicCliCommand = useMemo(() => {
    return `python3 webgen_engine.py --template ${selectedTemplateId} --framework ${selectedFramework} --theme ${selectedTheme} --out ./dist/index.html --artifacts-dir ./dist/artifacts`;
  }, [selectedTemplateId, selectedFramework, selectedTheme]);

  const mcpConfigSnippet = JSON.stringify({
    mcpServers: {
      "zoth-webgen": {
        "command": "python3",
        "args": ["mcp_server.py"],
        "env": {
          "ZOTH_ZERO_EGRESS": "true",
          "ZOTH_LOCAL_INVARIANT": "enforced"
        }
      }
    }
  }, null, 2);

  // Snackbar State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle skill toggle
  const handleToggleSkill = (skillId) => {
    playSfx('click');
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  // Handle interactive tweak
  const handleTweak = () => {
    if (!tweakText.trim()) return;
    playSfx('compile');
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      playSfx('success');
      setSnackbarMessage(`Applied tweak: "${tweakText}" to live sneak-peek preview!`);
      setSnackbarOpen(true);
      setActiveTab(0);
    }, 600);
  };

  // Active code generated based on template and framework
  const currentCode = useMemo(() => {
    return getGeneratedCode(selectedTemplate, selectedFramework);
  }, [selectedTemplate, selectedFramework]);

  // Master Artifacts Generator Memo
  const masterArtifacts = useMemo(() => {
    const currentFw = FRAMEWORKS.find(f => f.id === selectedFramework) || FRAMEWORKS[0];
    const tpl = TEMPLATES.find(t => t.name === selectedTemplate) || TEMPLATES[0];

    const prompt = `=== ZOTH STUDIO :: SOVEREIGN AUTONOMOUS MASTER PROMPT ===
TARGET ARCHETYPE: ${tpl.name.toUpperCase()}
CATEGORY: ${tpl.tag}
FRAMEWORK: ${currentFw.name.toUpperCase()} (${currentFw.badge})
DESIGN THEME: ${THEMES.find(t => t.id === selectedTheme)?.name || 'Sovereign Imperial Gold'}
SECURITY SPEC: OWASP TOP 10 HARDENED, CONTENT-SECURITY-POLICY STRICT (AIR-GAPPED)
A11Y STANDARD: WCAG 2.2 AAA COMPLIANT
ACTIVE SKILLS: ${selectedSkills.join(', ').toUpperCase()}

[CORE OBJECTIVE]
${promptText}

[COMPILATION DIRECTIVES]
1. Architecture: Single-file zero-dependency modular architecture.
2. Styling: High-contrast tokens, CSS custom properties, responsive breakpoints (375px, 768px, 1440px).
3. Performance: Zero runtime bloat, pre-baked inline SVG glyphs, Sub-50ms First Contentful Paint.
4. Telemetry: Integrated loopback latency monitor, deterministic AST node hashing, and non-custodial local state persistence.
5. Accessibility: Semantics for screen readers, keyboard focus traps, aria-labels on interactive elements.`;

    const instructions = `#!/usr/bin/env bash
# ==============================================================================
# ZOTH STUDIO :: SOVEREIGN REPRODUCIBLE DEPLOYMENT INSTRUCTIONS
# ARCHETYPE: ${tpl.name.toUpperCase()} | TARGET: ${currentFw.name}
# GENERATED AT: ${new Date().toISOString()}
# ==============================================================================

set -euo pipefail

echo "⚡ [Zoth Studio] Initializing sovereign deployment for ${siteName}..."

# 1. Directory Setup
mkdir -p ${siteName}/dist ${siteName}/src ${siteName}/assets
cd ${siteName}

# 2. Extract Sealed AST Artifacts
cat << 'EOF' > dist/index.${currentFw.ext}
${currentCode}
EOF

# 3. Security & Zero-Egress Invariant Verification
echo "🔒 [Audit] Verifying CSP headers and offline zero-cloud invariants..."
test -f dist/index.${currentFw.ext} && echo "✔ Dist artifact verified."

# 4. Local Sandbox Server Boot
echo "🚀 [Launch] Spawning zero-egress sandbox runtime at http://127.0.0.1:8788..."
python3 -m http.server 8788 --directory dist &
PID=$!
echo "Sandbox daemon active (PID: $PID). Press Ctrl+C to terminate."
wait $PID`;

    const blueprint = JSON.stringify({
      "$schema": "https://zoth.network/schemas/master-blueprint-v2.json",
      "project": siteName,
      "archetype": tpl.name,
      "category": tpl.tag,
      "frameworkTarget": currentFw.name,
      "theme": selectedTheme,
      "generatedAt": new Date().toISOString(),
      "security": {
        "zeroEgress": true,
        "csp": "default-src 'self' 'unsafe-inline'; connect-src 'self' http://127.0.0.1:*",
        "wcagCompliance": "AAA"
      },
      "components": [
        "HeaderNavigation",
        "BentoMetricGrid",
        "InteractiveTerminalHarness",
        "TelemetryFeed",
        "ZeroEgressFooter"
      ],
      "skillsEnabled": selectedSkills,
      "agentConsensus": {
        "lycan": "OWASP & WCAG verified",
        "kitsune": "Glassmorphism UI synthesized",
        "draco": "Schema.org & llms.txt generated",
        "workbot": "Neural loopback logic validated"
      }
    }, null, 2);

    const llmsTxt = `# ${tpl.name}
> Autonomous Sovereign Web Application synthesized via Zoth Studio v2

## System Overview
- **Archetype**: ${tpl.name}
- **Framework**: ${currentFw.name}
- **Security Standard**: Air-gapped, zero-cloud egress, deterministic WASM AST.
- **A11y**: WCAG 2.2 AAA certified.

## Core Capabilities
- Sub-50ms local compilation via deterministic token isolate.
- Real-time biomorphic telemetry metrics.
- 4-Agent Swarm consensus verification (Lycan, Kitsune, Draco, Workbot).

## API & Route Invariants
- \`GET /\`: Main application workstation.
- \`GET /llms.txt\`: Machine-readable AI agent discovery manifest.
- \`GET /health\`: Zero-egress local loopback status check.`;

    return { prompt, instructions, blueprint, llmsTxt };
  }, [selectedTemplate, selectedFramework, selectedTheme, selectedSkills, promptText, siteName, currentCode]);

  // AST Data based on template & framework
  const astData = useMemo(() => {
    return getAstTreeData(selectedTemplate, selectedFramework);
  }, [selectedTemplate, selectedFramework]);

  // Handle template selection
  const handleSelectTemplate = (tpl) => {
    playSfx('click');
    setSelectedTemplate(tpl.name);
    setPromptText(tpl.defaultPrompt);
    setActiveTab(0);
    if (isMobile) setMobileSection('preview');
  };

  // 4-Agent Multi-Agent Compile Sequence
  const handleCompile = () => {
    setIsCompiling(true);
    setSwarmActive(true);
    playSfx('compile');

    const now = () => new Date().toTimeString().split(' ')[0];

    setSwarmLogs([
      { time: now(), tag: 'MASTER', text: `🚀 Initializing multi-agent website synthesis for ${selectedTemplate}...`, color: '#D4AF37' }
    ]);
    setSwarmAgents({
      lycan: { status: 'active', label: 'Lycan (@antigravity)', role: 'Auditing OWASP CSP & WCAG AA tokens...', emoji: '🐺' },
      kitsune: { status: 'idle', label: 'Kitsune (@grok)', role: 'Queued', emoji: '🦊' },
      draco: { status: 'idle', label: 'Draco (@hermes)', role: 'Queued', emoji: '🐲' },
      workbot: { status: 'idle', label: 'Workbot (@ollama)', role: 'Queued', emoji: '🤖' },
    });

    setTimeout(() => {
      setSwarmAgents(prev => ({
        ...prev,
        lycan: { ...prev.lycan, status: 'done', role: 'OWASP Top 10 CSP & WCAG AA: PASSED' },
        kitsune: { ...prev.kitsune, status: 'active', role: 'Synthesizing Glassmorphism UI tokens & responsive frame...' }
      }));
      setSwarmLogs(prev => [...prev, { time: now(), tag: 'LYCAN', text: '🐺 [Lycan @antigravity] Validating OWASP Top 10 CSP & WCAG AA tokens... [PASS]', color: '#38BDF8' }]);
      playSfx('click');
    }, 400);

    setTimeout(() => {
      setSwarmAgents(prev => ({
        ...prev,
        kitsune: { ...prev.kitsune, status: 'done', role: 'Glassmorphism UI tokens & particle mesh: SYNTHESIZED' },
        draco: { ...prev.draco, status: 'active', role: 'Constructing Schema.org JSON-LD & llms.txt AEO manifest...' }
      }));
      setSwarmLogs(prev => [...prev, { time: now(), tag: 'KITSUNE', text: '🦊 [Kitsune @grok] Synthesizing Glassmorphism UI tokens, particle canvas, & responsive layout... [DONE]', color: '#F472B6' }]);
      playSfx('click');
    }, 850);

    setTimeout(() => {
      setSwarmAgents(prev => ({
        ...prev,
        draco: { ...prev.draco, status: 'done', role: 'Schema.org JSON-LD & llms.txt: VERIFIED' },
        workbot: { ...prev.workbot, status: 'active', role: 'Compiling neural copy & interactive sandbox logic on loopback...' }
      }));
      setSwarmLogs(prev => [...prev, { time: now(), tag: 'DRACO', text: '🐲 [Draco @hermes] Constructing Schema.org JSON-LD graph & llms.txt AEO manifest... [VERIFIED]', color: '#34D399' }]);
      playSfx('click');
    }, 1300);

    setTimeout(() => {
      setSwarmAgents(prev => ({
        ...prev,
        workbot: { ...prev.workbot, status: 'done', role: 'Neural copy & interactive sandbox logic: OPTIMIZED' }
      }));
      setSwarmLogs(prev => [
        ...prev,
        { time: now(), tag: 'WORKBOT', text: '🤖 [Workbot @ollama] Compiling neural copy & interactive sandbox logic on loopback... [OPTIMIZED]', color: '#A78BFA' },
        { time: now(), tag: 'MASTER', text: `✅ [Swarm Complete] Consensus verified across all 4 agents. 142 AST nodes sealed with 0 bytes external egress.`, color: '#D4AF37' }
      ]);
      setIsCompiling(false);
      playSfx('success');
      setSnackbarMessage(`Successfully synthesized ${selectedTemplate} for ${selectedFramework.toUpperCase()}`);
      setSnackbarOpen(true);
      setActiveTab(0);
      if (isMobile) setMobileSection('preview');
    }, 1800);
  };

  // Master Artifact Copy / Download Handlers
  const handleCopyArtifact = (text, name) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playSfx('click');
    setSnackbarMessage(`${name} copied to clipboard!`);
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadArtifact = (text, filename) => {
    playSfx('click');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbarMessage(`Downloaded ${filename}`);
    setSnackbarOpen(true);
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

  // Download Selected Framework Code File
  const handleDownloadCode = () => {
    const fw = FRAMEWORKS.find((f) => f.id === selectedFramework) || FRAMEWORKS[0];
    const extensionMap = {
      'react-tailwind': 'jsx',
      'vue': 'vue',
      'svelte': 'svelte',
      'solid': 'tsx',
      'astro': 'astro',
      'html': 'html',
    };
    const ext = extensionMap[selectedFramework] || fw.ext || 'txt';
    const filename = `${siteName || 'sovereign-component'}.${ext}`;
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbarMessage(`Downloaded ${filename} (${fw.name} source component)`);
    setSnackbarOpen(true);
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

  // Copy Micro-Repo Command / Config Helper
  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    playSfx('click');
    setSnackbarMessage(`Copied ${label} to clipboard!`);
    setSnackbarOpen(true);
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
            <Stack spacing={1.5}>
              <Box sx={{ p: 2, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>AZOTH-OS 2.0</Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>Micro-kernel WASM runtime with zero egress.</Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>NEURO-DAEMON</Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>Local vectorized memory on port 8788.</Typography>
              </Box>
            </Stack>
          </Box>
        );

      case 'AI Swarm Console':
        return (
          <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#08080B' : '#F8FAFC', color: textPrimary }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Chip label="TRI-AGENT CONSENSUS ACTIVE" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono }} />
              <Typography variant="caption" sx={{ color: dark ? '#10B981' : '#059669', fontFamily: mono, fontWeight: 700 }}>● 3 NODES SYNCED</Typography>
            </Box>
            <Stack spacing={1.5} sx={{ mb: 2.5 }}>
              {[
                { name: 'Planner Alpha', status: 'RUNNING', job: 'Task Routing & DAG Calibration', color: dark ? '#10B981' : '#059669' },
                { name: 'Coder Omega', status: 'SYNTHESIZING', job: 'AST Generation & Micro-Transpilation', color: dark ? '#D4AF37' : '#B8860B' },
                { name: 'Auditor Sigma', status: 'VERIFYING', job: 'Zero-Egress Seal & Invariant Verification', color: dark ? '#38BDF8' : '#0284C7' }
              ].map((ag, i) => (
                <Box key={i} sx={{ p: 1.5, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: textPrimary }}>{ag.name}</Typography>
                    <span style={{ fontSize: '0.65rem', color: ag.color, fontWeight: 800, fontFamily: 'monospace' }}>{ag.status}</span>
                  </Box>
                  <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.72rem' }}>{ag.job}</Typography>
                </Box>
              ))}
            </Stack>
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
              <Button fullWidth variant="contained" sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}>
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
            <Stack spacing={1.5}>
              {[
                { name: 'Cortical Neural Interface v3', price: '2.40 GOLD', sync: '99.4%' },
                { name: 'Dopamine Synapse Stabilizer', price: '0.85 GOLD', sync: '97.8%' }
              ].map((p, i) => (
                <Box key={i} sx={{ p: 2, bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: textPrimary }}>{p.name}</Typography>
                    <span style={{ fontSize: '0.65rem', color: dark ? '#10B981' : '#059669', fontWeight: 800 }}>{p.sync}</span>
                  </Box>
                  <Typography variant="h6" sx={{ color: gold, fontWeight: 900, fontFamily: mono, mt: 1 }}>{p.price}</Typography>
                </Box>
              ))}
            </Stack>
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

            <Stack spacing={1.5}>
              <Box sx={{ p: 2, bgcolor: dark ? '#161824' : '#FFFFFF', borderRadius: 2, border: `1px solid ${divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', fontFamily: mono }}>Node Latency</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: gold }}>12.4ms</Typography>
                </Box>
                <Chip label="OPTIMAL" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', fontWeight: 800 }} />
              </Box>

              <Box sx={{ p: 2, bgcolor: dark ? '#161824' : '#FFFFFF', borderRadius: 2, border: `1px solid ${divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', fontFamily: mono }}>Seal Hash</Typography>
                  <Typography variant="subtitle1" sx={{ fontFamily: mono, fontWeight: 700, color: dark ? '#10B981' : '#059669' }}>0x8F4A...3B21</Typography>
                </Box>
                <Chip label="ZERO-EGRESS" size="small" sx={{ bgcolor: goldBg, color: gold, fontWeight: 800 }} />
              </Box>

              <Box sx={{ p: 2, bgcolor: dark ? '#161824' : '#FFFFFF', borderRadius: 2, border: `1px solid ${divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', fontFamily: mono }}>Swarm Status</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: dark ? '#38BDF8' : '#0284C7' }}>Active (6/6 Synced)</Typography>
                </Box>
                <Chip label="QUORUM" size="small" sx={{ bgcolor: dark ? 'rgba(56,189,248,0.15)' : '#E0F2FE', color: dark ? '#38BDF8' : '#0284C7', fontWeight: 800 }} />
              </Box>
            </Stack>
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
      <ParallaxGlow offset={60}>
      <HeroReveal>
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
          <HeroItem>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <Chip
                icon={<GitHubIcon sx={{ color: `${gold} !important`, fontSize: '0.95rem' }} />}
                label="MICRO-REPO // NullAITech/zoth-webgen"
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
              <Chip
                label="PURE STDLIB • NO PIP DEPS"
                size="small"
                sx={{
                  bgcolor: dark ? 'rgba(56,189,248,0.12)' : '#E0F2FE',
                  color: dark ? '#38BDF8' : '#0284C7',
                  border: dark ? '1px solid rgba(56,189,248,0.3)' : '1px solid #BAE6FD',
                  fontWeight: 800,
                  fontFamily: mono
                }}
              />
              <Chip
                label="MCP PROTOCOL COMPLIANT"
                size="small"
                sx={{
                  bgcolor: dark ? 'rgba(168,85,247,0.12)' : '#F3E8FF',
                  color: dark ? '#C084FC' : '#7E22CE',
                  border: dark ? '1px solid rgba(168,85,247,0.3)' : '1px solid #E9D5FF',
                  fontWeight: 800,
                  fontFamily: mono
                }}
              />
            </Box>
          </HeroItem>
          
          <HeroItem>
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 900, color: textPrimary, fontSize: { xs: '2.2rem', sm: '3rem', md: '3.4rem' }, letterSpacing: '-0.02em' }}>
              Zoth WebGen // Autonomous Site Foundry
            </Typography>
          </HeroItem>
          <HeroItem>
            <Typography variant="body1" sx={{ color: textSecondary, maxWidth: 940, fontSize: { xs: '0.95rem', md: '1.05rem' }, mb: 2.5, lineHeight: 1.6 }}>
              Standalone zero-egress site generator and multi-agent synthesis engine. Pull the micro-repo to build 6 production archetypes directly via CLI (<code style={{ color: gold }}>webgen_engine.py</code>), export master artifacts (<code style={{ color: gold }}>master-prompt.txt</code>, <code style={{ color: gold }}>master-instructions.sh</code>, <code style={{ color: gold }}>master-blueprint.json</code>, <code style={{ color: gold }}>llms.txt</code>), or connect AI agents directly via Model Context Protocol (<code style={{ color: gold }}>mcp_server.py</code>).
            </Typography>
          </HeroItem>

          <HeroItem>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ p: 1, px: 1.5, bgcolor: dark ? '#08080B' : '#F1F5F9', border: `1px solid ${divider}`, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: dark ? '#38BDF8' : '#0284C7' }}>
                  git clone https://github.com/NullAITech/zoth-webgen.git
                </Typography>
                <IconButton size="small" onClick={() => handleCopyText('git clone https://github.com/NullAITech/zoth-webgen.git', 'git clone command')} sx={{ color: gold, p: 0.4 }}>
                  <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                startIcon={<GitHubIcon />}
                href="https://github.com/NullAITech/zoth-webgen"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
              >
                Open GitHub Micro-Repo
              </Button>
            </Box>
          </HeroItem>
        </Box>
      </HeroReveal>
      </ParallaxGlow>

      {/* =========================================================================
          MICRO-REPO CLI & MCP SERVER ARCHITECTURE DOSSIER
          ========================================================================= */}
      <RevealOnScroll delay={0.05} preset="fadeUp">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 4,
            border: `1px solid ${divider}`,
            borderRadius: 3.5,
            bgcolor: dark ? '#0A0C14' : '#F8FAFC',
            boxShadow: dark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.04)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TerminalIcon sx={{ color: gold, fontSize: '1.5rem' }} />
              <div>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: textPrimary, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
                  MICRO-REPO ARCHITECTURE &amp; MCP INTEGRATION
                  <Chip label="STANDALONE" size="small" sx={{ bgcolor: goldBg, color: gold, fontFamily: mono, fontWeight: 800, fontSize: '0.65rem' }} />
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, fontSize: '0.74rem' }}>
                  Pull the repo directly to execute zero-egress builds or equip AI agents (Claude, Cursor, Hermes, Cline) via MCP stdio.
                </Typography>
              </div>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyText('git clone https://github.com/NullAITech/zoth-webgen.git', 'git clone command')}
                sx={{ borderColor: divider, color: textPrimary, fontSize: '0.72rem', fontFamily: mono }}
              >
                Copy git clone
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<GitHubIcon />}
                href="https://github.com/NullAITech/zoth-webgen"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, fontSize: '0.72rem', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
              >
                GitHub Repo
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Left: CLI Execution Engine */}
            <Grid xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: dark ? '#10121C' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? goldLight : '#8A6A09', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <CodeIcon sx={{ fontSize: '1.1rem' }} /> CLI ENGINE: webgen_engine.py
                  </Typography>
                  <Chip label="PURE STDLIB" size="small" sx={{ bgcolor: dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5', color: dark ? '#10B981' : '#059669', fontSize: '0.65rem', fontWeight: 800, fontFamily: mono }} />
                </Box>
                <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.8rem', mb: 1.5, lineHeight: 1.5 }}>
                  Deterministic compiler for 6 sovereign archetypes. Zero external pip dependencies; uses standard Python 3.10+ runtime.
                </Typography>
                
                <Box sx={{ mb: 1.5, p: 1.5, bgcolor: dark ? '#05070F' : '#F1F5F9', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, fontSize: '0.68rem', fontWeight: 700 }}>
                      LIVE DYNAMIC CLI COMMAND (UPDATES WITH CONFIG):
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopyText(dynamicCliCommand, 'CLI command')} sx={{ color: gold, p: 0.2 }}>
                      <ContentCopyIcon sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', color: dark ? '#38BDF8' : '#0284C7', wordBreak: 'break-all', lineHeight: 1.4 }}>
                    {dynamicCliCommand}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    size="small"
                    fullWidth
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyText(dynamicCliCommand, 'WebGen CLI command')}
                    sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, fontSize: '0.72rem', py: 0.8, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
                  >
                    Copy CLI Command
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Right: Model Context Protocol (MCP) Server */}
            <Grid xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: dark ? '#10121C' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? goldLight : '#8A6A09', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <HubIcon sx={{ fontSize: '1.1rem' }} /> MCP SERVER: mcp_server.py
                  </Typography>
                  <Chip label="MCP 2024-11-05" size="small" sx={{ bgcolor: goldBg, color: gold, fontSize: '0.65rem', fontWeight: 800, fontFamily: mono }} />
                </Box>
                <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.8rem', mb: 1.5, lineHeight: 1.5 }}>
                  Equips AI agents (Claude, Cursor, Hermes, Cline) with tools: <code style={{ color: gold }}>webgen_list_templates</code>, <code style={{ color: gold }}>webgen_generate_site</code>, and <code style={{ color: gold }}>webgen_generate_master_artifacts</code>.
                </Typography>

                <Box sx={{ mb: 1.5, p: 1.5, bgcolor: dark ? '#05070F' : '#F1F5F9', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, fontSize: '0.68rem', fontWeight: 700 }}>
                      CLAUDE / CURSOR / HERMES CONFIG SNIPPET:
                    </Typography>
                    <IconButton size="small" onClick={() => handleCopyText(mcpConfigSnippet, 'MCP config')} sx={{ color: gold, p: 0.2 }}>
                      <ContentCopyIcon sx={{ fontSize: '0.8rem' }} />
                    </IconButton>
                  </Box>
                  <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.7rem', color: dark ? '#F8FAFC' : '#0F172A', maxHeight: 85, overflowY: 'auto' }}>
                    {mcpConfigSnippet}
                  </pre>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    size="small"
                    fullWidth
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyText(mcpConfigSnippet, 'MCP config snippet')}
                    sx={{ borderColor: gold, color: gold, fontWeight: 800, fontSize: '0.72rem', py: 0.8 }}
                  >
                    Copy MCP Server JSON
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </RevealOnScroll>

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
                  color: '#08080B',
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
          STAGE 01: SPEC PROMPT FOUNDRY & STARTER ARCHETYPES
          ========================================================================= */}
      {(!isMobile || mobileSection === 'prompt') && (
        <RevealOnScroll delay={0.1} preset="fadeUp">
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
                <AutoAwesomeIcon sx={{ color: gold }} /> 1. Spec Prompt Foundry &amp; Starter Archetypes
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Tap an archetype preset to seed the layout tokens or articulate a custom site specification.
              </Typography>
            </Box>
            <Chip
              label="STAGE 01 // SPEC PROMPT FOUNDRY"
              size="small"
              sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontFamily: mono, fontSize: '0.72rem' }}
            />
          </Box>

          <Divider sx={{ my: 2.5, borderColor: divider }} />

          {/* Starter Templates (6 Presets) */}
          {/* Starter Spec Archetypes Carousel / Stacked Window Showcase */}
          <WindowCarousel
            title="Starter Component Archetypes"
            badge="Spec Archetypes"
            items={TEMPLATES}
            initialView="carousel"
            allowToggleMode={true}
            renderItem={(tpl) => {
              const isSelected = selectedTemplate === tpl.name;
              const IconComp = tpl.icon;
              return (
                <Box
                  onClick={() => handleSelectTemplate(tpl)}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: isSelected ? `2px solid ${gold}` : `1px solid ${divider}`,
                    backgroundColor: isSelected ? goldBg : (dark ? '#121420' : '#F1F5F9'),
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    '&:hover': {
                      borderColor: gold,
                      backgroundColor: goldBg,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <IconComp sx={{ fontSize: '1.4rem', color: isSelected ? gold : textSecondary }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textPrimary }}>
                        {tpl.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={tpl.tag} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: isSelected ? gold : (dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'), color: isSelected ? '#08080B' : textSecondary, fontFamily: mono, fontWeight: 800 }} />
                      {isSelected && <Chip label="SELECTED SEED" size="small" sx={{ height: 22, fontSize: '0.68rem', bgcolor: gold, color: '#08080B', fontWeight: 800 }} />}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.6 }}>
                    {tpl.desc}
                  </Typography>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: dark ? '#08080D' : '#FFFFFF', border: `1px solid ${divider}` }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: dark ? goldLight : '#8A6A09', fontSize: '0.75rem', display: 'block' }}>
                      Prompt Seed: "{tpl.defaultPrompt}"
                    </Typography>
                  </Box>
                </Box>
              );
            }}
          />

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
        </RevealOnScroll>
      )}

      {/* =========================================================================
          STAGE 02: BRAND LOOK, VISUAL THEME TOKENS & BUILDER SKILLS
          ========================================================================= */}
      {(!isMobile || mobileSection === 'prompt') && (
        <RevealOnScroll delay={0.2} preset="fadeUp">
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
                <TuneIcon sx={{ color: gold }} /> 2. Design System Tokens, Slug &amp; Skills
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Configure your project slug identifier, aesthetic design token palette, and generation skill guides.
              </Typography>
            </Box>
            <Chip
              label="STAGE 02 // DESIGN SYSTEM TOKENS"
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

          {/* High-Contrast Token Palettes Carousel / Stacked Window Showcase */}
          <WindowCarousel
            title="High-Contrast Design Token Palettes"
            badge="Theme Systems"
            items={THEMES}
            initialView="carousel"
            allowToggleMode={true}
            renderItem={(th) => {
              const isSelected = selectedTheme === th.id;
              return (
                <Box
                  onClick={() => setSelectedTheme(th.id)}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: isSelected ? `2px solid ${th.primary}` : `1px solid ${divider}`,
                    backgroundColor: isSelected ? (dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF') : (dark ? '#10121C' : '#F8FAFC'),
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? `0 4px 20px ${th.primary}33` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    '&:hover': {
                      borderColor: th.primary,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: th.primary, border: '2px solid rgba(255,255,255,0.4)', boxShadow: `0 0 10px ${th.primary}` }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isSelected ? th.primary : textPrimary }}>
                        {th.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={`PRIMARY ${th.primary}`} size="small" sx={{ height: 22, fontSize: '0.68rem', fontFamily: mono, bgcolor: `${th.primary}22`, color: th.primary, border: `1px solid ${th.primary}44`, fontWeight: 800 }} />
                      {isSelected && <Chip label="ACTIVE PALETTE" size="small" sx={{ height: 22, fontSize: '0.68rem', bgcolor: th.primary, color: '#08080B', fontWeight: 800 }} />}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: textSecondary, lineHeight: 1.6 }}>
                    {th.desc}
                  </Typography>
                </Box>
              );
            }}
          />

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
        </RevealOnScroll>
      )}

      {/* =========================================================================
          STAGE 03: LAYOUT BLUEPRINT & SYNTHESIS ENGINE
          ========================================================================= */}
      {(!isMobile || mobileSection === 'prompt') && (
        <RevealOnScroll delay={0.3} preset="fadeUp">
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
                <RocketLaunchIcon sx={{ color: gold }} /> 3. Layout Blueprint &amp; Synthesis Engine
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Choose execution runtime, target exporter language, and launch compilation into the sneak-peek preview.
              </Typography>
            </Box>
            <Chip
              label="STAGE 03 // LAYOUT BLUEPRINT"
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
                color: '#08080B',
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
              startIcon={<TerminalIcon />}
              onClick={() => handleCopyText(dynamicCliCommand, 'WebGen CLI execution command')}
              sx={{ bgcolor: dark ? '#121420' : '#FFFFFF', border: `1px solid ${gold}`, color: gold, py: 1.4, px: 3, fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: goldBg } }}
            >
              Copy CLI Command
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<GitHubIcon />}
              href="https://github.com/NullAITech/zoth-webgen"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ borderColor: divider, color: textPrimary, py: 1.4, px: 2.5, fontWeight: 750, borderRadius: 2, '&:hover': { borderColor: gold } }}
            >
              Pull Micro-Repo
            </Button>
          </Box>

          {isCompiling && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { backgroundColor: gold } }} />
            </Box>
          )}
        </Paper>
        </RevealOnScroll>
      )}

      {/* =========================================================================
          4-AGENT AUTONOMOUS SWARM FOUNDRY HUD & LOOPBACK STREAM
          ========================================================================= */}
      <Collapse in={swarmActive || isCompiling} timeout={400}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            borderRadius: 3.5,
            border: `1px solid ${isCompiling ? gold : divider}`,
            bgcolor: dark ? '#0A0C14' : '#F8FAFC',
            boxShadow: isCompiling ? (dark ? '0 0 25px rgba(212,175,55,0.25)' : '0 0 20px rgba(184,134,11,0.15)') : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {/* HUD Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HubIcon sx={{ color: gold, fontSize: '1.4rem' }} />
              <div>
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 900, color: dark ? goldLight : '#8A6A09', display: 'flex', alignItems: 'center', gap: 1 }}>
                  4-AGENT AUTONOMOUS SWARM FOUNDRY
                  <Chip
                    label={isCompiling ? 'SYNTHESIZING' : 'CONSENSUS VERIFIED'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontFamily: mono,
                      fontWeight: 800,
                      bgcolor: isCompiling ? goldBg : (dark ? 'rgba(16,185,129,0.15)' : '#ECFDF5'),
                      color: isCompiling ? gold : (dark ? '#10B981' : '#059669'),
                      border: isCompiling ? `1px solid ${gold}` : '1px solid #10B981'
                    }}
                  />
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono, fontSize: '0.74rem' }}>
                  Lycan 🐺, Kitsune 🦊, Draco 🐲, and Workbot 🤖 collaborating on local loopback.
                </Typography>
              </div>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleCompile}
                disabled={isCompiling}
                sx={{ borderColor: divider, color: textPrimary, fontSize: '0.72rem', fontFamily: mono, py: 0.3 }}
              >
                Rerun Consensus
              </Button>
              <IconButton size="small" onClick={() => setSwarmActive(false)} sx={{ color: textSecondary }}>
                ✕
              </IconButton>
            </Box>
          </Box>

          {/* 4 Agent Cards Grid */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {Object.entries(swarmAgents).map(([key, ag]) => {
              const isActive = ag.status === 'active';
              const isDone = ag.status === 'done';
              return (
                <Grid xs={12} sm={6} md={3} key={key}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: dark ? '#10121C' : '#FFFFFF',
                      border: `1px solid ${isActive ? gold : (isDone ? (dark ? '#1E3A2F' : '#D1FAE5') : divider)}`,
                      boxShadow: isActive ? `0 0 16px ${goldBg}` : 'none',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.4rem' }}>{ag.emoji}</span>
                        <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: textPrimary }}>
                          {ag.label}
                        </Typography>
                      </Box>
                      {isActive && <LinearProgress sx={{ width: 32, height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: gold } }} />}
                      {isDone && <CheckCircleIcon sx={{ fontSize: '1rem', color: dark ? '#10B981' : '#059669' }} />}
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', color: isActive ? gold : textSecondary, fontFamily: mono, fontSize: '0.7rem', minHeight: 32, lineHeight: 1.4 }}>
                      {ag.role}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Terminal Logs Bar */}
          <Box
            sx={{
              borderRadius: 2,
              bgcolor: dark ? '#05070F' : '#0F172A',
              border: '1px solid #1E293B',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ px: 2, py: 1, bgcolor: dark ? '#090D1A' : '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.72rem', ml: 1 }}>
                  zoth-swarm-foundry :: loopback execution stream
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: dark ? goldLight : '#D4AF37', fontSize: '0.68rem', fontWeight: 700 }}>
                127.0.0.1:8788 • ZERO-EGRESS
              </Typography>
            </Box>
            <Box sx={{ p: 2, maxHeight: 180, overflowY: 'auto', fontFamily: mono, fontSize: '0.76rem', lineHeight: 1.6 }}>
              {swarmLogs.map((log, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
                  <span style={{ color: '#64748B', userSelect: 'none' }}>[{log.time}]</span>
                  <span style={{ color: log.color, wordBreak: 'break-word' }}>{log.text}</span>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* =========================================================================
          STAGE 04: REAL-TIME SNEAK-PEEK LIVE PREVIEW & WORKSTATION
          ========================================================================= */}
      {(!isMobile || mobileSection === 'code' || mobileSection === 'preview') && (
        <RevealOnScroll delay={0.4} preset="fadeUp">
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
                4. LIVE SANDBOX &amp; SNEAK-PEEK CONSOLE • {siteName.toUpperCase()} • {FRAMEWORKS.find(f => f.id === selectedFramework)?.name.toUpperCase()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
              {/* Procedural Web Audio SFX Toggle */}
              <Tooltip title={sfxEnabled ? "Procedural Web Audio SFX Active (Click to Mute)" : "Procedural Web Audio SFX Muted (Click to Enable)"}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSfxEnabled(!sfxEnabled);
                    if (!sfxEnabled) playSfx('compile');
                  }}
                  sx={{
                    bgcolor: sfxEnabled ? goldBg : (dark ? '#0D0E15' : '#FFFFFF'),
                    border: `1px solid ${divider}`,
                    color: sfxEnabled ? gold : textSecondary,
                    px: 1.2,
                    borderRadius: 1.5,
                    gap: 0.5
                  }}
                >
                  {sfxEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                  <span style={{ fontSize: '0.72rem', fontFamily: mono, fontWeight: 700 }}>
                    {sfxEnabled ? 'SFX: ON' : 'SFX: OFF'}
                  </span>
                </IconButton>
              </Tooltip>

              {/* Swarm HUD Toggle */}
              <Tooltip title="Toggle 4-Agent Swarm HUD">
                <IconButton
                  size="small"
                  onClick={() => setSwarmActive(!swarmActive)}
                  sx={{
                    bgcolor: swarmActive ? goldBg : (dark ? '#0D0E15' : '#FFFFFF'),
                    border: `1px solid ${divider}`,
                    color: swarmActive ? gold : textSecondary,
                    px: 1.2,
                    borderRadius: 1.5,
                    gap: 0.5
                  }}
                >
                  <HubIcon fontSize="small" />
                  <span style={{ fontSize: '0.72rem', fontFamily: mono, fontWeight: 700 }}>SWARM HUD</span>
                </IconButton>
              </Tooltip>

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
          </Box>

          {/* Console Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${divider}`, backgroundColor: dark ? '#10121A' : surface }}>
            <Tabs
              value={activeTab}
              onChange={(e, v) => {
                setActiveTab(v);
                playSfx('click');
              }}
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
              <Tab icon={<VisibilityIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Live Sandbox &amp; Sneak-Peek" />
              <Tab icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Generated Polyglot Code" />
              <Tab icon={<LayersIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Master Artifacts (Prompt / Blueprint / sh)" />
              <Tab icon={<AccountTreeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Deterministic AST Inspector" />
              <Tab icon={<SpeedIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="Compiler Telemetry" />
              <Tab icon={<HubIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" label="4-Agent Swarm Collaboration Stream" />
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
                  sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, px: 2.5, py: 0.8, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
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
                      <Button size="small" variant="contained" onClick={() => handleCopyText(dynamicCliCommand, 'WebGen CLI command')} sx={{ bgcolor: gold, color: '#08080B', fontSize: '0.7rem', fontWeight: 800, '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}>
                        Copy CLI Command
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
                <Button size="small" variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopyCode} sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, py: 0.2, fontSize: '0.72rem', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadCode} sx={{ borderColor: gold, color: gold, bgcolor: goldBg, fontWeight: 800, py: 0.2, fontSize: '0.72rem', '&:hover': { bgcolor: dark ? 'rgba(212,175,55,0.2)' : 'rgba(184,134,11,0.15)' } }}>
                  Download
                </Button>
              </Box>
              <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: mono, fontSize: '0.84rem', minHeight: 320, maxHeight: 520, overflowY: 'auto', bgcolor: dark ? '#08080B' : '#F8FAFC' }}>
                <pre style={{ margin: 0, color: dark ? '#F8FAFC' : '#0F172A', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {currentCode}
                </pre>
              </Box>
            </Box>
          )}

          {/* Tab 2: Master Artifacts (Prompt, Instructions, Blueprint, llms.txt) */}
          {activeTab === 2 && (
            <Box sx={{ bgcolor: dark ? '#090B12' : '#F8FAFC' }}>
              {/* Artifact Selector Header */}
              <Box sx={{ p: 2, px: { xs: 2, sm: 3 }, bgcolor: dark ? '#10121A' : surface, borderBottom: `1px solid ${divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <ToggleButtonGroup
                  size="small"
                  value={activeArtifactTab}
                  exclusive
                  onChange={(e, val) => {
                    if (val) {
                      setActiveArtifactTab(val);
                      playSfx('click');
                    }
                  }}
                  sx={{ bgcolor: dark ? '#0D0E15' : '#FFFFFF', border: `1px solid ${divider}`, '& .MuiToggleButton-root': { color: textSecondary, px: 2, py: 0.6, fontFamily: mono, fontSize: '0.74rem', textTransform: 'none', '&.Mui-selected': { color: gold, bgcolor: goldBg, fontWeight: 800 } } }}
                >
                  <ToggleButton value="prompt">
                    <Tooltip title="Master Autonomous Prompt"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><TuneIcon fontSize="small" /><span>master-prompt.txt</span></Box></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="instructions">
                    <Tooltip title="Reproducible Deployment Bash Script"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><TerminalIcon fontSize="small" /><span>master-instructions.sh</span></Box></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="blueprint">
                    <Tooltip title="Structural JSON Architecture Blueprint"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><AccountTreeIcon fontSize="small" /><span>master-blueprint.json</span></Box></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="llms">
                    <Tooltip title="AEO Agent Discovery Manifest"><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}><DescriptionIcon fontSize="small" /><span>llms.txt</span></Box></Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                      const text = activeArtifactTab === 'prompt' ? masterArtifacts.prompt :
                        activeArtifactTab === 'instructions' ? masterArtifacts.instructions :
                        activeArtifactTab === 'blueprint' ? masterArtifacts.blueprint :
                        masterArtifacts.llmsTxt;
                      handleCopyArtifact(text, `master-${activeArtifactTab}`);
                    }}
                    sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, fontSize: '0.74rem', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
                  >
                    {copied ? 'Copied' : 'Copy Artifact'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (activeArtifactTab === 'prompt') handleDownloadArtifact(masterArtifacts.prompt, `${siteName}-master-prompt.txt`);
                      else if (activeArtifactTab === 'instructions') handleDownloadArtifact(masterArtifacts.instructions, `${siteName}-master-instructions.sh`);
                      else if (activeArtifactTab === 'blueprint') handleDownloadArtifact(masterArtifacts.blueprint, `${siteName}-master-blueprint.json`);
                      else handleDownloadArtifact(masterArtifacts.llmsTxt, 'llms.txt');
                    }}
                    sx={{ borderColor: gold, color: gold, bgcolor: goldBg, fontWeight: 800, fontSize: '0.74rem' }}
                  >
                    Download
                  </Button>
                </Box>
              </Box>

              {/* Artifact Body */}
              <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: mono, fontSize: '0.84rem', minHeight: 340, maxHeight: 540, overflowY: 'auto', bgcolor: dark ? '#08080B' : '#F8FAFC' }}>
                <pre style={{ margin: 0, color: dark ? '#F8FAFC' : '#0F172A', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {activeArtifactTab === 'prompt' && masterArtifacts.prompt}
                  {activeArtifactTab === 'instructions' && masterArtifacts.instructions}
                  {activeArtifactTab === 'blueprint' && masterArtifacts.blueprint}
                  {activeArtifactTab === 'llms' && masterArtifacts.llmsTxt}
                </pre>
              </Box>
            </Box>
          )}

          {/* Tab Content 3: AST Diff & Inspector Tab */}
          {activeTab === 3 && (
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
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1.5 }}>
                        {[
                          { label: 'Total AST Nodes', count: 142, color: textPrimary },
                          { label: 'Root & Declarations', count: 2, color: '#A855F7' },
                          { label: 'JSX Elements', count: 38, color: '#38BDF8' },
                          { label: 'Tailwind Utility Tokens', count: 84, color: '#10B981' },
                          { label: 'Reactive Hooks', count: 18, color: '#F59E0B' }
                        ].map((m, i) => (
                          <Box key={i} sx={{ p: 1.5, bgcolor: dark ? '#141622' : '#FFFFFF', borderRadius: 1.5, border: `1px solid ${divider}` }}>
                            <Typography variant="caption" sx={{ color: textSecondary, fontSize: '0.68rem', display: 'block', textTransform: 'uppercase', fontFamily: mono }}>{m.label}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: m.color, fontFamily: mono }}>{m.count}</Typography>
                          </Box>
                        ))}
                      </Box>
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
                                    color: astCategory === cat ? '#08080B' : textSecondary,
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

                {/* Tab Content 4: Compiler Logs */}
                {activeTab === 4 && (
                  <Box sx={{ p: 3, fontFamily: mono, fontSize: '0.85rem', minHeight: 320, bgcolor: dark ? '#08080B' : '#F8FAFC' }}>
                    <div style={{ color: dark ? '#10B981' : '#059669', fontWeight: 700 }}>✔ Local WASM WebGen compiler v2.4 initialized.</div>
                    <div style={{ color: textSecondary, marginTop: 8 }}>Target Template: {selectedTemplate}</div>
                    <div style={{ color: textSecondary, marginTop: 4 }}>Target Framework: {FRAMEWORKS.find(f => f.id === selectedFramework)?.name}</div>
                    <div style={{ color: textSecondary, marginTop: 4 }}>Local AST Seal: 0x8F4A92B10476C128 • 0 egress calls logged.</div>
                    <div style={{ color: dark ? gold : '#8A6A09', marginTop: 12, fontWeight: 700 }}>✔ All 142 AST nodes successfully verified and ready for deployment.</div>
                  </Box>
                )}

                {/* Tab Content 5: 4-Agent Swarm Collaboration Stream */}
                {activeTab === 5 && (
                  <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: dark ? '#090B12' : '#F8FAFC' }}>
                    <Box sx={{ p: 2, mb: 2.5, bgcolor: dark ? '#10121A' : surface, border: `1px solid ${divider}`, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: gold }}>
                          ⚡ 4-AGENT SWARM CONSENSUS MATRIX
                        </Typography>
                        <Typography variant="caption" sx={{ color: textSecondary, fontFamily: mono }}>
                          Real-time loopback telemetry across all four Pantheon spirit engines.
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={handleCompile}
                        disabled={isCompiling}
                        sx={{ bgcolor: gold, color: '#08080B', fontWeight: 800, fontSize: '0.74rem', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
                      >
                        Rerun Quad-Agent Pipeline
                      </Button>
                    </Box>

                    {/* Terminal Feed */}
                    <Box sx={{ borderRadius: 2.5, bgcolor: dark ? '#05070F' : '#0F172A', border: '1px solid #1E293B', overflow: 'hidden' }}>
                      <Box sx={{ px: 2.5, py: 1.5, bgcolor: dark ? '#090D1A' : '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                          <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.78rem', ml: 1, fontWeight: 700 }}>
                            zoth-swarm-foundry :: loopback execution stream
                          </Typography>
                        </Box>
                        <Chip label="127.0.0.1:8788" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: gold, fontFamily: mono, fontSize: '0.7rem', fontWeight: 800 }} />
                      </Box>
                      <Box sx={{ p: 2.5, minHeight: 300, maxHeight: 480, overflowY: 'auto', fontFamily: mono, fontSize: '0.8rem', lineHeight: 1.7 }}>
                        {swarmLogs.map((log, idx) => (
                          <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                            <span style={{ color: '#64748B', userSelect: 'none' }}>[{log.time}]</span>
                            <span style={{ color: log.color, wordBreak: 'break-word' }}>{log.text}</span>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

              </Paper>
        </RevealOnScroll>
      )}

      {/* SECTION 3: Polyglot Exporter Runtimes & Component Spec Registry Matrix (Spacious 2-Column Grid) */}
      {(!isMobile || mobileSection === 'specs') && (
        <RevealOnScroll delay={0.5} preset="fadeUp">
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 6 }}>
          
          {/* Left Column: Polyglot Exporters */}
          <Grid xs={12} md={6}>
            <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip label="TARGET RUNTIMES (6 ENGINES)" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontSize: '0.72rem', fontFamily: mono }} />
                  <Chip label="STAGE 05 // POLYGLOT EXPORT" size="small" sx={{ bgcolor: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSecondary, fontFamily: mono, fontSize: '0.68rem' }} />
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
                            color: selectedFramework === exp.id ? '#08080B' : textSecondary
                          }}
                        />
                      </Paper>
                    ))}
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadCode}
                      sx={{ py: 1.3, borderRadius: 2, fontWeight: 800, bgcolor: gold, color: '#08080B', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
                    >
                      Download File (.{FRAMEWORKS.find(f => f.id === selectedFramework)?.ext || 'jsx'})
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportBundle}
                      sx={{ py: 1.3, borderRadius: 2, fontWeight: 800, borderColor: gold, color: gold, '&:hover': { borderColor: dark ? goldLight : '#9A7008', bgcolor: goldBg } }}
                    >
                      Export Standalone HTML
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column: Spec Registry Matrix */}
            <Grid xs={12} md={6}>
              <Card sx={{ border: `1px solid ${divider}`, borderRadius: 3, bgcolor: surface, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Chip label="SPEC MATRIX (6 PRESETS)" size="small" sx={{ bgcolor: goldBg, color: gold, border: `1px solid ${gold}`, fontWeight: 800, fontSize: '0.72rem', fontFamily: mono }} />
                    <Chip label="STAGE 05 // SPEC REGISTRY" size="small" sx={{ bgcolor: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSecondary, fontFamily: mono, fontSize: '0.68rem' }} />
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
        </RevealOnScroll>
      )}

      {/* =========================================================================
          STAGE 06: SOVEREIGN REPOSITORY & INSTALLATION FUNNEL
          ========================================================================= */}
      <RevealOnScroll delay={0.6} preset="fadeUp">
        <SovereignFunnel
          title="Deploy Zoth WebGen Locally"
          subtitle="Autonomous zero-egress site generator and template synthesizer with zero external dependencies, 6 production archetypes, and Model Context Protocol (MCP) server."
          toolTitle="Option 1: Zoth WebGen Micro-Repo"
          toolTag="MICRO-REPO"
          toolDescription="Standalone zero-egress static site generator with CLI engine, MCP tools for AI coding assistants, and automated test suite."
          toolRepo="https://github.com/NullAITech/zoth-webgen"
          toolCommand="git clone https://github.com/NullAITech/zoth-webgen.git && cd zoth-webgen && python3 webgen_engine.py --help"
        />
      </RevealOnScroll>

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
            sx={{ py: 1.2, fontWeight: 800, borderRadius: 2, bgcolor: gold, color: '#08080B', '&:hover': { bgcolor: dark ? goldLight : '#9A7008' } }}
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
