import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BoltIcon from '@mui/icons-material/Bolt';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';
import ExtensionIcon from '@mui/icons-material/Extension';
import TerminalIcon from '@mui/icons-material/Terminal';

const mono = '"JetBrains Mono", "IBM Plex Mono", monospace';
const displayFont = '"Space Grotesk", "Cinzel", sans-serif';

const AI_PROVIDERS_AND_AGENTS = [
  { id: 'ZothLocal:zoth-bolt-instant', group: 'Zoth Local & CLI Agents', label: '⚡ Zoth Bolt Instant Architect (Deterministic High-Craft + Motion)' },
  { id: 'ZothLocal:agy-engine', group: 'Zoth Local & CLI Agents', label: '⚡ Google Antigravity (AGY Local Coding Agent)' },
  { id: 'ZothLocal:hermes-agent', group: 'Zoth Local & CLI Agents', label: '👑 Nous Hermes 3 Autonomous Agent CLI' },
  { id: 'ZothLocal:grok-cli', group: 'Zoth Local & CLI Agents', label: '🚀 Grok CLI Local Sovereign Agent' },
  { id: 'ZothLocal:claude-cli', group: 'Zoth Local & CLI Agents', label: '🧠 Claude Code Local Agent CLI' },
  { id: 'ZothLocal:opencode', group: 'Zoth Local & CLI Agents', label: '💻 OpenCode Local Agent CLI' },
  { id: 'ZothLocal:cline', group: 'Zoth Local & CLI Agents', label: '🤖 Cline Autonomous Agent CLI' },
  { id: 'ZothLocal:aider', group: 'Zoth Local & CLI Agents', label: '🛠️ Aider Pair-Programming Agent CLI' },
  { id: 'ZothLocal:codex-cli', group: 'Zoth Local & CLI Agents', label: '⚡ OpenAI Codex Local CLI Agent' },
  { id: 'ZothLocal:qwen2.5-coder:1.5b', group: 'Local Ollama Models', label: '🦙 Ollama · Qwen 2.5 Coder (Local Zero-Egress)' },
  { id: 'ZothLocal:llama3.2:1b', group: 'Local Ollama Models', label: '🦙 Ollama · Llama 3.2 (Local Zero-Egress)' },
  { id: 'ZothLocal:zoth-model:latest', group: 'Local Ollama Models', label: '👑 Ollama · Zoth Sovereign Fine-Tune' },
  { id: 'Google:gemini-2.5-pro', group: 'Frontier Cloud Providers', label: '🌟 Google · Gemini 2.5 Pro' },
  { id: 'Google:gemini-2.5-flash', group: 'Frontier Cloud Providers', label: '🌟 Google · Gemini 2.5 Flash' },
  { id: 'Anthropic:claude-3-7-sonnet-20250219', group: 'Frontier Cloud Providers', label: '🟣 Anthropic · Claude 3.7 Sonnet' },
  { id: 'OpenAI:gpt-4o', group: 'Frontier Cloud Providers', label: '🟢 OpenAI · GPT-4o' },
  { id: 'OpenAI:o3-mini', group: 'Frontier Cloud Providers', label: '🟢 OpenAI · o3-mini Reasoning' },
  { id: 'xAI:grok-3', group: 'Frontier Cloud Providers', label: '⚫ xAI · Grok 3' },
  { id: 'Deepseek:deepseek-reasoner', group: 'Frontier Cloud Providers', label: '🔵 DeepSeek · DeepSeek R1 / V3' },
  { id: 'OpenRouter:auto', group: 'Frontier Cloud Providers', label: '🌐 OpenRouter · Any 200+ Cloud Models' },
  { id: 'Groq:llama-3.3-70b-versatile', group: 'Frontier Cloud Providers', label: '⚡ Groq · Llama 3.3 70B LPU' },
];

const MOTION_EDIT_TEMPLATES = [
  {
    id: 'claude-15s-showreel',
    name: '🎬 15s Claude Motion Showreel Hero',
    shader: 'braille',
    accent: '#D4AF37',
    badge: '6-Scene Cinema Cut',
    desc: 'Deterministic 15-second 6-scene product launch film with live timeline scrubber, kinetic canvas choreography, and aperture handoff.',
    ideaSeed: 'Build an elite product launch site featuring a 15-second 6-scene Claude Motion Showreel hero, kinetic canvas choreography, bespoke SVG crests, and interactive workspace.',
  },
  {
    id: 'teknium-uncommon-shader',
    name: '🌐 @teknium Uncommon Web Shader Stage',
    shader: 'dither',
    accent: '#38BDF8',
    badge: 'Braille · Dither · ASCII',
    desc: 'Interactive 60fps HTML5 Canvas shader with live mode pills switching between Unicode Braille Wave, Bayer 4x4 Ordered Dither, and ASCII Matrix.',
    ideaSeed: 'Build an avant-garde developer platform with a 60fps @teknium Uncommon Web Shader hero (Braille Wave, Bayer 4x4 Dither, ASCII Matrix), custom SVG diagrams, and Bento grid.',
  },
  {
    id: 'gameboy-pixel-cinema',
    name: '👾 16-Bit Pixel Art & Retro CRT Arcade',
    shader: 'ascii',
    accent: '#22C55E',
    badge: 'Pixel Art + Chiptune',
    desc: 'Crisp shape-rendering="crispEdges" 16x16 inline SVG pixel-art sprites, animated simulation viewport, CRT scanline toggle, and WebAudio 8-bit synth.',
    ideaSeed: 'Build a 16-bit Pixel Art & Retro CRT Arcade hub featuring crisp inline SVG pixel-art icons, animated simulation canvas, scanline toggle, and WebAudio 8-bit chiptune SFX.',
  },
  {
    id: 'hermes-commerce-drop',
    name: '🛍️ Instant Delivery & Commerce Drop (Sprig/Hatch/Hush)',
    shader: 'constellation',
    accent: '#10B981',
    badge: 'Bespoke SVG + Live ETA',
    desc: 'Editorial neighborhood delivery storefront with multi-layered gradient SVG product artwork, animated SVG ETA ring, and non-blocking slide-over bag.',
    ideaSeed: 'Build a 15-minute neighborhood delivery storefront with multi-layered gradient SVG product art, animated SVG ETA countdown ring, category filters, and slide-over bag.',
  },
  {
    id: 'scroll-choreography-deck',
    name: '🧊 3D Isometric Exploded View & Scroll Stage',
    shader: 'braille',
    accent: '#C084FC',
    badge: 'Spring Physics + SVG',
    desc: 'Multi-layer isometric SVG hardware/architecture stack that separates into annotated layers on slider scrub with live latency calculators.',
    ideaSeed: 'Build an interactive hardware & architecture showcase with a multi-layer isometric SVG exploded-view stage, layer separation slider, and live telemetry calculator.',
  },
  {
    id: 'sovereign-saas-funnel',
    name: '💎 Sovereign Micro-SaaS + Motion Hero',
    shader: 'dither',
    accent: '#F59E0B',
    badge: 'Stripe + Solana Ready',
    desc: 'Complete client-side developer utility with kinetic motion hero, real-time AST/linter gauges, founding member banner, and 1-click license unlock.',
    ideaSeed: 'Build a production Sovereign Micro-SaaS utility with a kinetic motion hero, real-time client-side AST/linter gauges, founding member banner, and instant license unlock.',
  },
];

const PIXEL_ART_SVGS = [
  {
    id: 'pixel-bolt',
    name: 'Zoth Golden Bolt',
    category: 'Cyber · 16x16 SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><path fill="#F5E6AB" d="M9 1h3v2H10v2H9v2h4v2h-2v2H9v2H7v2H5v-3h2V9H4V7h2V5h2V3h1z"/><path fill="#D4AF37" d="M8 2h2v2H8v2H6v2h4v1H8v2H6v3H5v-2h2v-2H3V8h2V6h2V4h1z"/></svg>`,
  },
  {
    id: 'pixel-crown',
    name: 'Sovereign 24K Crown',
    category: 'RPG · 16x16 SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><path fill="#D4AF37" d="M2 5h2v2h2V5h1V3h2v2h1v2h2V5h2v7H2V5z"/><path fill="#F5E6AB" d="M3 6h1v3h8V6h1v4H3V6zm4-2h2v3H7V4z"/><rect x="4" y="10" width="2" height="1" fill="#EF4444"/><rect x="7" y="10" width="2" height="1" fill="#10B981"/><rect x="10" y="10" width="2" height="1" fill="#3B82F6"/><rect x="2" y="12" width="12" height="2" fill="#8C6D1F"/></svg>`,
  },
  {
    id: 'pixel-robot',
    name: 'Swarm Agent Droid',
    category: 'Agent · 16x16 SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="7" y="1" width="2" height="2" fill="#D4AF37"/><rect x="3" y="3" width="10" height="8" fill="#1E293B"/><rect x="4" y="4" width="8" height="6" fill="#0F172A"/><rect x="5" y="5" width="2" height="2" fill="#38BDF8"/><rect x="9" y="5" width="2" height="2" fill="#38BDF8"/><rect x="5" y="8" width="6" height="1" fill="#10B981"/><rect x="4" y="11" width="8" height="3" fill="#334155"/></svg>`,
  },
  {
    id: 'pixel-terminal',
    name: 'CRT Phosphor Deck',
    category: 'CLI · 16x16 SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><rect x="1" y="2" width="14" height="11" fill="#1E293B"/><rect x="2" y="3" width="12" height="9" fill="#05080A"/><path fill="#22C55E" d="M4 5h1v1h1v1H5v1H4V7h1V6H4V5zm3 3h4v1H7V8z"/><rect x="3" y="14" width="10" height="1" fill="#334155"/></svg>`,
  },
  {
    id: 'pixel-coin',
    name: 'Treasury Gold Coin',
    category: 'FinOps · 16x16 SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><path fill="#B45309" d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2z"/><path fill="#FACC15" d="M5 3h6v1h2v2h1v4h-1v2h-2v1H5v-1H3v-2H2V6h1V4h2V3z"/><rect x="7" y="5" width="2" height="6" fill="#FEF08A"/></svg>`,
  },
  {
    id: 'pixel-shield',
    name: 'Zero-Egress Aegis',
    category: 'Security · 16x16 SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges"><path fill="#065F46" d="M3 2h10v6H12v3h-2v2H8v1H6v-2H4V8H3V2z"/><path fill="#10B981" d="M4 3h8v5h-1v2H9v2H7v-2H5V8H4V3z"/><path fill="#A7F3D0" d="M7 4h2v6H7V4zM5 6h6v2H5V6z"/></svg>`,
  },
  {
    id: 'svg-bolt-crest',
    name: 'Sovereign Prism Crest',
    category: 'Multi-Layer Vector SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="36" height="36"><polygon points="60,10 106,36 106,84 60,110 14,84 14,36" fill="#0B0D14" stroke="#D4AF37" stroke-width="4"/><path d="M66 24 L38 64 H58 L52 96 L84 54 H62 Z" fill="#D4AF37"/></svg>`,
  },
  {
    id: 'svg-emerald-seal',
    name: 'Botanical Pantry Seal',
    category: 'Multi-Layer Vector SVG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="36" height="36"><circle cx="60" cy="60" r="52" fill="#06140E" stroke="#10B981" stroke-width="4"/><path d="M60 20 C88 26 96 58 60 98 C24 58 32 26 60 20 Z" fill="#10B981" opacity="0.9"/></svg>`,
  },
];

export default function ZothBoltGodModeTool() {
  const [activeTab, setActiveTab] = useState('architect');
  const [idea, setIdea] = useState(
    'Sprig Neighborhood Pantry — 15-minute organic produce, cold-pressed tonics, and sourdough drops with live courier ETA ring and bespoke botanical SVG art'
  );
  const [selectedModel, setSelectedModel] = useState('ZothLocal:zoth-bolt-instant');
  const [motionTemplate, setMotionTemplate] = useState('claude-15s-showreel');
  const [templateId, setTemplateId] = useState('hermes-sprig');
  const [shader, setShader] = useState('braille');
  const [accent, setAccent] = useState('#22C55E');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [viewport, setViewport] = useState('desktop');
  const [copied, setCopied] = useState(false);
  const [iconQuery, setIconQuery] = useState('bolt');
  const [iconCollection, setIconCollection] = useState('pixelarticons');
  const [iconResults, setIconResults] = useState([
    'pixelarticons:zap',
    'pixelarticons:shield',
    'pixelarticons:trophy',
    'pixelarticons:coin',
    'pixelarticons:android',
    'pixelarticons:gamepad',
    'lucide:sparkles',
    'lucide:rocket',
    'lucide:cpu',
    'lucide:terminal',
    'ph:lightning-fill',
    'ph:cube-focus-fill',
  ]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/studio/webgen/templates')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (Array.isArray(d?.templates)) setTemplates(d.templates);
      })
      .catch(() => {});
    handleSynthesize({
      ideaOverride:
        'Sprig Neighborhood Pantry — 15-minute organic produce, cold-pressed tonics, and sourdough drops with live courier ETA ring and bespoke botanical SVG art',
      templateOverride: 'hermes-sprig',
      shaderOverride: 'braille',
      accentOverride: '#22C55E',
      deployNow: false,
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSynthesize({
    ideaOverride,
    templateOverride,
    shaderOverride,
    accentOverride,
    deployNow = false,
  } = {}) {
    const targetIdea = (ideaOverride ?? idea).trim();
    if (!targetIdea) return;
    if (deployNow) setDeploying(true);
    else setLoading(true);
    setError(null);

    try {
      const [providerName, ...modelParts] = selectedModel.split(':');
      const modelName = modelParts.join(':');

      // Also broadcast to live Zoth Bolt (:5173) if connected
      fetch('http://127.0.0.1:5173/api/webgen/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_prompt',
          prompt: `[AI: ${providerName}/${modelName} | Motion: ${motionTemplate}]\n${targetIdea}`,
        }),
      }).catch(() => {});

      const res = await fetch('/api/studio/webgen/oneshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: targetIdea,
          mode: 'template',
          templateId: (templateOverride ?? templateId) || undefined,
          shader: shaderOverride ?? shader,
          accent: accentOverride ?? accent,
          deploy: Boolean(deployNow),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
      setDeploying(false);
    }
  }

  async function searchFreeIcons() {
    if (!iconQuery.trim()) return;
    try {
      const prefix = iconCollection === 'all' ? '' : `&prefix=${encodeURIComponent(iconCollection)}`;
      const res = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(iconQuery.trim())}&limit=18${prefix}`
      );
      const data = await res.json();
      if (Array.isArray(data?.icons) && data.icons.length > 0) {
        setIconResults(data.icons);
      }
    } catch (_) {}
  }

  function injectAssetIntoIdea(snippet) {
    setIdea((prev) => `${prev.trim()}\n\n${snippet}`);
    setActiveTab('architect');
  }

  function handleDownloadHtml() {
    if (!result?.html) return;
    const blob = new Blob([result.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.slug || 'zoth-bolt-site'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopyHtml() {
    if (!result?.html) return;
    navigator.clipboard.writeText(result.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const previewWidth = viewport === 'mobile' ? '390px' : viewport === 'tablet' ? '768px' : '100%';
  const liveDeployUrl = result?.deploy?.liveUrl || result?.deploy?.deployUrl;

  const mcpSnippet = JSON.stringify(
    {
      mcpServers: {
        'zoth-bolt': {
          command: 'node',
          args: ['~/NullAITech/bolt.diy/packages/mcp-server/index.mjs'],
          env: { WEBGEN_BASE_URL: 'http://127.0.0.1:5173' },
        },
      },
    },
    null,
    2
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3.5,
        bgcolor: '#0A0B10',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
        color: '#F8FAFC',
      }}
    >
      {/* Top Header Strip */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2,
          pb: 1.8,
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
            <Chip
              icon={<BoltIcon sx={{ color: '#08080B !important', fontSize: 16 }} />}
              label="ZOTH BOLT v3.5 // MAIN AI & MOTION ARCHITECT"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 900,
                fontSize: '0.68rem',
                bgcolor: '#D4AF37',
                color: '#08080B',
              }}
            />
            <Chip
              label="23+ AI PROVIDERS & LOCAL CLI AGENTS"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.66rem',
                bgcolor: 'rgba(56, 189, 248, 0.14)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
              }}
            />
            <Chip
              label="6 MOTION EDIT TEMPLATES · 200K+ FREE SVGS & PIXEL ART"
              size="small"
              sx={{
                fontFamily: mono,
                fontWeight: 700,
                fontSize: '0.66rem',
                bgcolor: 'rgba(16, 185, 129, 0.14)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
              }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{ fontFamily: displayFont, fontWeight: 800, color: '#F5E6AB', letterSpacing: '0.02em' }}
          >
            Zoth Bolt — Full-Stack AI, Motion Edit &amp; Asset Architect
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            href="http://127.0.0.1:5173"
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              fontWeight: 900,
              bgcolor: '#D4AF37',
              color: '#08080B',
              textTransform: 'none',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Launch Full Zoth Bolt IDE (:5173)
          </Button>
          <Button
            size="small"
            variant="outlined"
            href="http://127.0.0.1:8092"
            target="_blank"
            rel="noopener"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#CBD5E1',
              textTransform: 'none',
            }}
          >
            Simple QuickSite Starter (:8092)
          </Button>
        </Box>
      </Box>

      {/* Mode Switcher Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2.5,
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            fontFamily: mono,
            fontSize: '0.74rem',
            fontWeight: 800,
            textTransform: 'none',
            color: '#94A3B8',
            borderRadius: 2,
            mr: 1,
            '&.Mui-selected': {
              bgcolor: 'rgba(212, 175, 55, 0.16)',
              color: '#F5E6AB',
              border: '1px solid rgba(212, 175, 55, 0.45)',
            },
          },
          '& .MuiTabs-indicator': { display: 'none' },
        }}
      >
        <Tab value="architect" icon={<BoltIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="1. AI & Motion Architect + Live Netlify Deploy" />
        <Tab value="motion" icon={<MovieFilterIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="2. Motion Edit Templates (6 Cinema Cuts)" />
        <Tab value="vault" icon={<ExtensionIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="3. Icons, SVGs, 16-Bit Pixel Art & MCP Asset Vault" />
        <Tab value="workbench" icon={<TerminalIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="4. Embedded Zoth Bolt WebContainer IDE (:5173)" />
      </Tabs>

      {/* TAB 2: MOTION EDIT TEMPLATES */}
      {activeTab === 'motion' && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.84rem', color: '#94A3B8', mb: 2 }}>
            Select any production Motion Edit template below to seed Zoth Bolt with deterministic 60fps choreography, bespoke multi-layered SVG artwork, and @teknium Uncommon Web shaders:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {MOTION_EDIT_TEMPLATES.map((tpl) => (
              <Box
                key={tpl.id}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: '#111420',
                  border: motionTemplate === tpl.id ? `2px solid ${tpl.accent}` : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={tpl.badge}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: `${tpl.accent}22`,
                        color: tpl.accent,
                        border: `1px solid ${tpl.accent}55`,
                      }}
                    />
                    <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: '#64748B' }}>
                      shader:{tpl.shader}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFF', mb: 0.5 }}>
                    {tpl.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    {tpl.desc}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setMotionTemplate(tpl.id);
                    setShader(tpl.shader);
                    setAccent(tpl.accent);
                    setIdea(tpl.ideaSeed);
                    setActiveTab('architect');
                    handleSynthesize({
                      ideaOverride: tpl.ideaSeed,
                      shaderOverride: tpl.shader,
                      accentOverride: tpl.accent,
                      deployNow: false,
                    });
                  }}
                  sx={{
                    bgcolor: tpl.accent,
                    color: '#08080B',
                    fontFamily: mono,
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    textTransform: 'none',
                  }}
                >
                  ⚡ Load Motion Template &amp; Synthesize
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* TAB 3: ICONS, SVGS, PIXEL ART & MCP ASSET VAULT */}
      {activeTab === 'vault' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#111420', border: '1px solid rgba(212,175,55,0.25)' }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#F5E6AB', mb: 1.5 }}>
              👾 BUILT-IN 16-BIT PIXEL ART SVGS &amp; MULTI-LAYERED VECTOR CRESTS (ZERO EXTERNAL DEPENDENCIES)
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {PIXEL_ART_SVGS.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: '#090B11',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                  <Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFF' }}>{item.name}</Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#64748B' }}>
                      {item.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.8, width: '100%' }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => injectAssetIntoIdea(`Include inline SVG asset (${item.name}):\n${item.svg}`)}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        borderColor: 'rgba(212,175,55,0.4)',
                        color: '#F5E6AB',
                        textTransform: 'none',
                      }}
                    >
                      + Inject
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigator.clipboard.writeText(item.svg)}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.65rem',
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: '#94A3B8',
                        textTransform: 'none',
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Free Iconify 200k+ Search */}
          <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#111420', border: '1px solid rgba(56,189,248,0.25)' }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#38BDF8', mb: 1.2 }}>
              🔍 SEARCH 200,000+ FREE VECTOR &amp; PIXEL-ART ICONS (ICONIFY + DICEBEAR REST API)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <Select
                size="small"
                value={iconCollection}
                onChange={(e) => setIconCollection(e.target.value)}
                sx={{ bgcolor: '#090B11', color: '#FFF', fontFamily: mono, fontSize: '0.75rem', minWidth: 210 }}
              >
                <MenuItem value="pixelarticons">Pixelarticons (8-Bit Pixel Art)</MenuItem>
                <MenuItem value="lucide">Lucide (Clean Vector)</MenuItem>
                <MenuItem value="ph">Phosphor (Editorial Vector)</MenuItem>
                <MenuItem value="game-icons">Game-Icons (RPG &amp; Arcade)</MenuItem>
                <MenuItem value="simple-icons">Simple-Icons (Brand Logos)</MenuItem>
                <MenuItem value="all">All 200,000+ Free Icons</MenuItem>
              </Select>
              <TextField
                size="small"
                value={iconQuery}
                onChange={(e) => setIconQuery(e.target.value)}
                placeholder="Search icons (e.g. sword, bolt, shield, robot, ramen)..."
                sx={{
                  flex: 1,
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': { bgcolor: '#090B11', color: '#FFF', fontFamily: mono, fontSize: '0.78rem' },
                }}
              />
              <Button
                variant="contained"
                onClick={searchFreeIcons}
                sx={{ bgcolor: '#38BDF8', color: '#08080B', fontFamily: mono, fontWeight: 900, fontSize: '0.74rem', textTransform: 'none' }}
              >
                Search Free Icons
              </Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 1 }}>
              {iconResults.map((id) => {
                const [prefix, name] = id.split(':');
                const svgUrl = `https://api.iconify.design/${prefix}/${name}.svg?color=%23D4AF37`;
                return (
                  <Box
                    key={id}
                    onClick={() =>
                      injectAssetIntoIdea(`Use Iconify SVG icon "${id}" via <img src="${svgUrl}" alt="${name} icon" width="24" height="24" />`)
                    }
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: '#090B11',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.6,
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#D4AF37' },
                    }}
                  >
                    <img src={svgUrl} alt={`${name} icon`} width="26" height="26" />
                    <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#CBD5E1', textAlign: 'center' }} noWrap>
                      {name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* MCP Server Snippet */}
          <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#111420', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: '#34D399' }}>
                🔌 ZOTH BOLT MEDIA &amp; FULL-STACK MCP SERVER (zoth_bolt_search_free_icons · zoth_bolt_get_svg_pixel_library · zoth_bolt_list_motion_templates)
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigator.clipboard.writeText(mcpSnippet)}
                sx={{ fontFamily: mono, fontSize: '0.68rem', borderColor: '#34D399', color: '#34D399', textTransform: 'none' }}
              >
                Copy MCP JSON
              </Button>
            </Box>
            <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.7rem', color: '#E2E8F0', overflowX: 'auto' }}>
              {mcpSnippet}
            </pre>
          </Box>
        </Box>
      )}

      {/* TAB 4: EMBEDDED ZOTH BOLT IDE (:5173) */}
      {activeTab === 'workbench' && (
        <Box sx={{ borderRadius: 2.5, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.35)', height: 700, bgcolor: '#05060A' }}>
          <iframe
            src="http://127.0.0.1:5173"
            title="Zoth Bolt Live Full-Stack Workbench (:5173)"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Box>
      )}

      {/* TAB 1: MAIN AI & MOTION ARCHITECT WORKSPACE */}
      {activeTab === 'architect' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '410px 1fr' },
            gap: 2.5,
            alignItems: 'stretch',
          }}
        >
          {/* Left Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2,
              borderRadius: 2.5,
              bgcolor: '#10121B',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.74rem' }}>
                AI Provider / Model / Local Agent CLI
              </InputLabel>
              <Select
                value={selectedModel}
                label="AI Provider / Model / Local Agent CLI"
                onChange={(e) => setSelectedModel(e.target.value)}
                sx={{
                  bgcolor: '#07080D',
                  color: '#F8FAFC',
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.35)' },
                }}
              >
                {AI_PROVIDERS_AND_AGENTS.map((m) => (
                  <MenuItem key={m.id} value={m.id} sx={{ fontFamily: mono, fontSize: '0.74rem' }}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.74rem' }}>
                Motion Edit / Cinema Template
              </InputLabel>
              <Select
                value={motionTemplate}
                label="Motion Edit / Cinema Template"
                onChange={(e) => {
                  const val = e.target.value;
                  setMotionTemplate(val);
                  const found = MOTION_EDIT_TEMPLATES.find((t) => t.id === val);
                  if (found) {
                    setShader(found.shader);
                    setAccent(found.accent);
                  }
                }}
                sx={{
                  bgcolor: '#07080D',
                  color: '#F8FAFC',
                  fontFamily: mono,
                  fontSize: '0.75rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(16,185,129,0.35)' },
                }}
              >
                {MOTION_EDIT_TEMPLATES.map((t) => (
                  <MenuItem key={t.id} value={t.id} sx={{ fontFamily: mono, fontSize: '0.74rem' }}>
                    {t.name} ({t.badge})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: '#D4AF37', fontWeight: 800, mb: 0.6 }}>
                HIGH-CRAFT SITE &amp; MOTION SPECIFICATION
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe any app, storefront, SaaS utility, or motion showreel..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#07080D',
                    color: '#F8FAFC',
                    fontSize: '0.84rem',
                    borderRadius: 2,
                    '& fieldset': { borderColor: 'rgba(212, 175, 55, 0.28)' },
                    '&:hover fieldset': { borderColor: '#D4AF37' },
                  },
                }}
              />
            </Box>

            {/* Quick High-Craft Presets */}
            <Box>
              <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8', mb: 0.6 }}>
                INSTANT HIGH-CRAFT &amp; MOTION SEEDS:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {[
                  {
                    label: '🥬 Sprig Pantry',
                    tpl: 'hermes-sprig',
                    sh: 'braille',
                    ac: '#22C55E',
                    text: 'Sprig Neighborhood Pantry — 15-minute organic produce, cold-pressed tonics, and sourdough drops with live courier ETA ring and bespoke botanical SVG art',
                  },
                  {
                    label: '🍜 Hatch Bento',
                    tpl: 'hermes-hatch',
                    sh: 'dither',
                    ac: '#F97316',
                    text: 'Hatch Late-Night Ramen & Hot Bento Drop — Wagyu katsu sando, black garlic tonkotsu ramen, and crispy gyoza with thermal lock tracking',
                  },
                  {
                    label: '🍷 Hush Cellar',
                    tpl: 'hermes-hush',
                    sh: 'constellation',
                    ac: '#A855F7',
                    text: 'Hush Reserve Spirits & Midnight Cellar — Small-batch Japanese whisky, mezcal, and botanical aperitifs with instant 21+ demo preview',
                  },
                  {
                    label: '🔐 JWT Guard',
                    tpl: 'jwt-inspector-guard',
                    sh: 'ascii',
                    ac: '#D4AF37',
                    text: 'Zero-Egress JWT & OAuth Security Inspector with live HMAC/RSA verifier, algorithm confusion scanner, and token expiry telemetry',
                  },
                ].map((sample) => (
                  <Chip
                    key={sample.label}
                    label={sample.label}
                    size="small"
                    onClick={() => {
                      setIdea(sample.text);
                      setTemplateId(sample.tpl);
                      setShader(sample.sh);
                      setAccent(sample.ac);
                      handleSynthesize({
                        ideaOverride: sample.text,
                        templateOverride: sample.tpl,
                        shaderOverride: sample.sh,
                        accentOverride: sample.ac,
                        deployNow: false,
                      });
                    }}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.67rem',
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255,255,255,0.12)',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#D4AF37', color: '#F5E6AB' },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <FormControl size="small">
                <InputLabel sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.72rem' }}>Base Architecture</InputLabel>
                <Select
                  value={templateId}
                  label="Base Architecture"
                  onChange={(e) => setTemplateId(e.target.value)}
                  sx={{ bgcolor: '#07080D', color: '#F8FAFC', fontFamily: mono, fontSize: '0.73rem' }}
                >
                  <MenuItem value="">✨ Auto-Match Best Architecture</MenuItem>
                  {templates.map((t) => (
                    <MenuItem key={t.id} value={t.id} sx={{ fontFamily: mono, fontSize: '0.73rem' }}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel sx={{ color: '#94A3B8', fontFamily: mono, fontSize: '0.72rem' }}>@teknium Shader</InputLabel>
                <Select
                  value={shader}
                  label="@teknium Shader"
                  onChange={(e) => setShader(e.target.value)}
                  sx={{ bgcolor: '#07080D', color: '#F8FAFC', fontFamily: mono, fontSize: '0.73rem' }}
                >
                  <MenuItem value="braille">⠿ Braille Wave (U+2800)</MenuItem>
                  <MenuItem value="dither">▓ Bayer 4x4 Dither</MenuItem>
                  <MenuItem value="ascii">█ Kinetic ASCII Matrix</MenuItem>
                  <MenuItem value="constellation">✦ Constellation Mesh</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Primary Action Buttons */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5 }}>
              <Button
                variant="contained"
                disabled={loading || deploying}
                startIcon={<AutoAwesomeIcon />}
                onClick={() => handleSynthesize({ deployNow: false })}
                sx={{
                  bgcolor: '#D4AF37',
                  color: '#08080B',
                  fontWeight: 900,
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  py: 1.1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#F5E6AB' },
                }}
              >
                {loading ? 'Synthesizing...' : '⚡ Synthesize Site'}
              </Button>

              <Button
                variant="contained"
                disabled={loading || deploying}
                startIcon={<RocketLaunchIcon />}
                onClick={() => handleSynthesize({ deployNow: true })}
                sx={{
                  background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                  color: '#08080B',
                  fontWeight: 900,
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  py: 1.1,
                  textTransform: 'none',
                }}
              >
                {deploying ? 'Deploying...' : '🚀 Deploy Live Netlify'}
              </Button>
            </Box>

            {(loading || deploying) && <LinearProgress sx={{ bgcolor: 'rgba(212,175,55,0.15)', '& .MuiLinearProgress-bar': { bgcolor: '#D4AF37' } }} />}

            {error && (
              <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                {error}
              </Alert>
            )}

            {liveDeployUrl && (
              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#34D399' }}>
                  <CheckCircleIcon sx={{ fontSize: 13, mr: 0.5, verticalAlign: 'middle' }} />
                  LIVE ON NETLIFY CDN:
                </Typography>
                <a
                  href={liveDeployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: mono, fontSize: '0.74rem', color: '#F8FAFC', fontWeight: 700, textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                  {liveDeployUrl} ↗
                </a>
              </Box>
            )}

            {/* Export Controls */}
            {result && (
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', pt: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadHtml}
                  sx={{ flex: 1, fontFamily: mono, fontSize: '0.68rem', borderColor: 'rgba(212,175,55,0.4)', color: '#F5E6AB', textTransform: 'none' }}
                >
                  .HTML
                </Button>
                {result.outputDir && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    href={`http://127.0.0.1:8092/api/download-zip?dir=${encodeURIComponent(result.outputDir)}`}
                    sx={{ flex: 1, fontFamily: mono, fontSize: '0.68rem', borderColor: 'rgba(56,189,248,0.4)', color: '#38BDF8', textTransform: 'none' }}
                  >
                    .ZIP Bundle
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyHtml}
                  sx={{ fontFamily: mono, fontSize: '0.68rem', borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1', textTransform: 'none' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </Box>
            )}
          </Box>

          {/* Right Live Multi-Viewport Preview */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2.5,
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.28)',
              bgcolor: '#05060A',
              minHeight: 620,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: '#121521',
                borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', color: '#F5E6AB', fontWeight: 700 }}>
                  {result ? `${result.siteName} · ${result.matchedSource}` : 'Zoth Bolt Live Viewport'}
                </Typography>
                <Chip
                  label={selectedModel.split(':')[1] || selectedModel}
                  size="small"
                  sx={{ fontFamily: mono, fontSize: '0.62rem', height: 20, bgcolor: 'rgba(212,175,55,0.14)', color: '#D4AF37' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.6 }}>
                {[
                  { id: 'desktop', label: 'Desktop', icon: <DesktopWindowsIcon sx={{ fontSize: 13 }} /> },
                  { id: 'tablet', label: 'Tablet', icon: <TabletMacIcon sx={{ fontSize: 13 }} /> },
                  { id: 'mobile', label: 'Mobile', icon: <SmartphoneIcon sx={{ fontSize: 13 }} /> },
                ].map((vp) => (
                  <Tooltip key={vp.id} title={`${vp.label} Viewport`}>
                    <Button
                      size="small"
                      startIcon={vp.icon}
                      onClick={() => setViewport(vp.id)}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        py: 0.25,
                        px: 1,
                        minWidth: 'auto',
                        textTransform: 'none',
                        color: viewport === vp.id ? '#08080B' : '#94A3B8',
                        bgcolor: viewport === vp.id ? '#D4AF37' : 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {vp.label}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', bgcolor: '#05060A' }}>
              {result?.html ? (
                <iframe
                  title="Zoth Bolt Live Preview"
                  srcDoc={result.html}
                  style={{
                    width: previewWidth,
                    height: '100%',
                    minHeight: 575,
                    border: 'none',
                    background: '#08080B',
                    transition: 'width 0.25s ease',
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontFamily: mono, fontSize: '0.82rem', p: 4 }}>
                  Initializing Zoth Bolt Architect...
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
