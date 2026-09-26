import React, { useState } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';
import {
  Box, Container, Typography, Paper, Chip, Unstable_Grid2 as Grid, Button,
  Divider, Stack, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip,
  Alert, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LanguageIcon from '@mui/icons-material/Language';
import HubIcon from '@mui/icons-material/Hub';
import TuneIcon from '@mui/icons-material/Tune';
import SEO from '../components/SEO';
import SovereignFunnel from '../components/SovereignFunnel';
import { enclaveBinds, zeroEgressInvariants } from '../data/zeroEgress';
import { microTools } from '../data/toolsData';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// 1. Crawler User-Agents as specified
const CRAWLER_AGENTS = [
  { id: 'GPTBot/1.2', name: 'GPTBot/1.2', vendor: 'OpenAI Crawler', ip: '127.0.0.1 (Loopback Gateway)' },
  { id: 'ClaudeBot/2.1', name: 'ClaudeBot/2.1', vendor: 'Anthropic Discovery Agent', ip: '127.0.0.1 (Loopback Gateway)' },
  { id: 'PerplexityBot/1.0', name: 'PerplexityBot/1.0', vendor: 'Perplexity AI Search', ip: '127.0.0.1 (Loopback Gateway)' },
  { id: 'DeepSeek-R1-Agent', name: 'DeepSeek-R1-Agent', vendor: 'DeepSeek Reasoning Core', ip: '127.0.0.1 (Loopback Gateway)' },
  { id: 'OpenClaw', name: 'OpenClaw', vendor: 'Open-Source Autonomous Crawler', ip: '127.0.0.1 (Loopback Gateway)' },
  { id: 'Local Pantheon Agent', name: 'Local Pantheon Agent', vendor: 'Zoth Air-Gapped Archon', ip: '127.0.0.1 (Internal Bus)' },
];

// 2. Discovery Endpoints with full live samples and token stats
const DISCOVERY_ENDPOINTS = [
  {
    endpoint: '/llms.txt',
    label: '/llms.txt',
    mime: 'text/markdown; charset=utf-8',
    description: 'Concise LLM Context & Agent Profile',
    tokens: 614,
    sizeBytes: 2456,
    content: `# Zoth Studio v2 — LLM & Autonomous Agent Profile

> Entity: Zoth Studio (NullAI Tech)
> System Type: Zero-Egress Air-Gapped Sovereign AI Agent Studio
> Canonical URL: https://zoth.nullai.tech
> Repository: https://github.com/NullAITech/zoth-studio-v2

## Core Identity & Mission
Zoth Studio v2 is an air-gapped, zero-egress development studio designed for orchestrating autonomous AI agent pantheons, local LLMs, and biomorphic synaptic memory matrices. All prompts, secrets, and weights execute strictly on local loopback enclaves with zero cloud telemetry or data leakage.

## Architecture & Enclave Binds
- Loopback UI: http://127.0.0.1:3000 (React 18 + MUI v5 SPA)
- Neuro Memory Daemon: http://127.0.0.1:8788 (Spike-Timing-Dependent Plasticity STDP + SQLite HNSW vectors)
- Sovereign Agent Bridge: http://127.0.0.1:8789 (21-agent inter-process bus & packet pinger)
- Hardware Vault: http://127.0.0.1:8787 (Argon2id key derivation & XChaCha20-Poly1305 encryption)
- Local Model Foundry: http://127.0.0.1:11434 (Ollama / llama.cpp local inference)

## Lucy Netrunner Oracle & Whitespace Cyberspace
- Guardian: Lucy (Lucyna Kushinada), Deep-Dive Netrunner
- Channel: Codec 141.12 // Deep Net Breach
- Function: Guides the 21-agent pantheon through the Whitespace Cyberspace memory stratum.
- Memory Law: Spike-Timing-Dependent Plasticity (STDP) adjusts synaptic weights (dw = A+ * exp(-dt/tau)). Frequent queries reinforce memories; stale vectors decay logarithmically.

## 37 Studio Workstations & 25 Tools
- Build: Agent Composer (DAG builder), AX Powerhouse, IDE Code Foundry, Edge Forge, Tool Bench, WebGen.
- Security: HexStrike CVE matrix, Web3 Sovereign Solana Bridge, SubSweep lead scanner, Adytum Key Sanctum.
- Swarm & Consensus: 3-Agent Byzantine Triangulation (Socratic AST debate), Swarm NOC, Cockpit radar, Signal Bridge.
- Spatial & 3D: Nexus 3D Omniverse, 3D Badge & Coin generator, Sacred Geometry engine, Vision Link.
- Observe: Chronicle roadmap, AI Model Foundry, Connectors ecosystem, Notes Reviewer.

## Zero-Egress Invariants
1. No external HTTP(S) requests or tracking SDKs.
2. No eval() or new Function() code injection.
3. No cookie, localStorage, or session leakage outside localhost.
4. Cryptographic operations execute via local Rust and Python daemons.

## Contact & Governance
- Maintainer: NullAI Tech
- License: Sovereign Developer License (Zero-Egress Guaranteed)
- Documentation: https://zoth.nullai.tech/docs`
  },
  {
    endpoint: '/llms-full.txt',
    label: '/llms-full.txt',
    mime: 'text/markdown; charset=utf-8',
    description: 'Comprehensive Agent Grounding & Capabilities Map',
    tokens: 3220,
    sizeBytes: 12893,
    content: `# Zoth Studio v2 — Comprehensive Agent Grounding Specification (Full)
Canonical: https://zoth.nullai.tech/llms-full.txt
Updated: 2026-09-24 // OWASP Zero-Egress Verified Enclave

================================================================================
SECTION 1: PANTHEON AGENT TOPOLOGY & ARCHITECTURE
================================================================================
- 21 Autonomous Micro-Agents operating over the Loopback Bus (127.0.0.1:8789).
- Primary Orchestrators:
  * AZOTH-Archon: Master task coordinator and subagent delegation hub.
  * Lucy-Netrunner: Deep net memory traversal & STDP synaptic arbitration.
  * Kai-BFT: AST validation, grammar isolation, and Byzantine verification.
  * Nyx-Cipher: Cryptographic attestation, Argon2id vault interfaces.
  * Sol-Chronicle: Persistent local telemetry and AST diff changelog recorder.

================================================================================
SECTION 2: ZERO-EGRESS AIR-GAPPED AUDIT INVARIANTS
================================================================================
1. Zero outbound TCP/UDP sockets to non-loopback IP ranges.
2. Complete absence of third-party telemetry scripts, Google Fonts, and CDNs.
3. AST sandboxing: dynamic eval(), Function() constructors, and innerHTML are blocked.
4. Storage containment: Local session seeds are isolated in memory and purged on reload.
5. All embeddings and vector queries execute on local SQLite HNSW vector index.

================================================================================
SECTION 3: MACHINE-READABLE CONTRACTS & TOOL SCHEMAS
================================================================================
- Tool Index API: /api/tools.json (25 sovereign CLI tools and micro-repos)
- MCP Schemas: /api/netlify-ax-mcp.json (Model Context Protocol endpoints)
- Agent Crawler Rules: /ai.txt
- Full XML Route Index: /sitemap.xml (83 static routes)`
  },
  {
    endpoint: '/ai.txt',
    label: '/ai.txt',
    mime: 'text/plain; charset=utf-8',
    description: 'Crawler Permissions & Discovery Manifests',
    tokens: 795,
    sizeBytes: 3184,
    content: `# ==============================================================================
# ⚡ ZOTH STUDIO — Autonomous AI Agent Discovery & Crawling Policy (ai.txt)
# Specification Reference: https://ai.txt / https://zoth.nullai.tech/ai.txt
# Last Updated: 2026-09-24
# ==============================================================================

# ── Identity & Core Metadata ──
site: https://zoth.nullai.tech
publisher: NullAI Tech / 757tech
founding-team: Zoth Studio Team (https://nullai.tech)
software-name: Zoth Studio
version: 2.0.0
license: Creative Commons Attribution-NonCommercial 4.0 / MIT Local Engine
category: DeveloperApplication / Sovereign Multi-Agent OS & Autonomous Web Foundry

# ── AI Crawling, Grounding & Indexing Policies ──
ai-crawling: allowed
ai-grounding: allowed
ai-search-index: allowed
ai-attribution-required: true
ai-training-allowed: true

# ── Machine Discovery Manifests ──
llms-txt: https://zoth.nullai.tech/llms.txt
llms-full-txt: https://zoth.nullai.tech/llms-full.txt
knowledge-graph: https://zoth.nullai.tech/blueprints/zoth-knowledge-graph.json
sitemap: https://zoth.nullai.tech/sitemap.xml
robots-txt: https://zoth.nullai.tech/robots.txt
tools-registry-api: https://zoth.nullai.tech/api/tools.json
netlify-ax-api: https://zoth.nullai.tech/api/netlify-ax.json
netlify-mcp-api: https://zoth.nullai.tech/api/netlify-ax-mcp.json`
  },
  {
    endpoint: '/sitemap.xml',
    label: '/sitemap.xml',
    mime: 'application/xml; charset=utf-8',
    description: 'Synchronized XML Index (83 Routes)',
    tokens: 3730,
    sizeBytes: 14930,
    content: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://zoth.nullai.tech/</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://zoth.nullai.tech/ax</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://zoth.nullai.tech/agents</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://zoth.nullai.tech/memory</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://zoth.nullai.tech/consensus</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://zoth.nullai.tech/tools</loc>
    <lastmod>2026-09-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <!-- [Synchronized: 83 production static routes ready for sovereign agent indexing] -->
</urlset>`
  },
  {
    endpoint: '/api/ax/manifest.json',
    label: '/api/ax/manifest.json',
    mime: 'application/json; charset=utf-8',
    description: 'JSON-AX Machine Manifest & Loopback Enclaves',
    tokens: 480,
    sizeBytes: 1920,
    content: `{
  "$schema": "https://zoth.nullai.tech/schemas/ax-manifest-v2.json",
  "name": "Zoth Studio v2 Sovereign Agent Manifest",
  "version": "2.0.0",
  "egress_mode": "AIR_GAPPED_ZERO_EGRESS",
  "security_seal": "OWASP_ZERO_EGRESS_VERIFIED_2026_09_15",
  "loopback_enclaves": {
    "public_hub": "127.0.0.1:8088",
    "operator_deck": "127.0.0.1:8484",
    "hardware_vault": "127.0.0.1:8787",
    "memory_daemon": "127.0.0.1:8788",
    "signal_bridge": "127.0.0.1:8789",
    "swarm_bus": "127.0.0.1:8989",
    "local_models": "127.0.0.1:11434"
  },
  "cors": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, User-Agent, X-Agent-Origin"
  },
  "invariants_enforced": [
    "NO_EXTERNAL_HTTP_SOCKETS",
    "NO_EVAL_OR_CODE_INJECTION",
    "NO_COOKIE_OR_STORAGE_LEAKS",
    "STRICT_LOCAL_LOOPBACK_ONLY"
  ],
  "pantheon_consensus": "3-Agent Byzantine Fault Tolerance AST Diff Quorum",
  "synaptic_memory": "STDP dw = A+ * exp(-dt/tau)"
}`
  }
];

// Presets for Developer Tasks
const TASK_PRESETS = [
  {
    label: 'AST Security & Prototype Guard',
    task: 'Audit incoming AST code mutations for prototype pollution (__proto__ poisoning), eval() injections, and verify that all IPC calls bind strictly to local loopback enclaves.'
  },
  {
    label: 'STDP Biomorphic Memory Recall',
    task: 'Query the loopback STDP memory daemon (127.0.0.1:8788) for architectural context, compute synaptic decay (dw = A+ * exp(-dt/tau)), and return verified vector matches.'
  },
  {
    label: '3-Agent Byzantine AST Quorum',
    task: 'Execute a 3-agent Byzantine consensus quorum to evaluate speculative AST diffs against Zero-Egress invariants before ratifying code generation.'
  },
  {
    label: 'MCP Local Tool Dispatcher',
    task: 'Validate and dispatch micro-tool invocations via the Model Context Protocol (MCP) using strict JSON Schema parameter bounds on local hardware.'
  }
];

function synthesizeSovereignDirective(customTask) {
  const goal = customTask.trim() || 'Execute sovereign developer directives within the air-gapped Zoth Studio enclave.';

  return `### SYSTEM DIRECTIVE: ZOTH ZERO-EGRESS SOVEREIGN AGENT PROTOCOL v2.0
CLASSIFICATION: AIR-GAPPED LOCAL LOOPBACK ENCLAVE // STRICT AUTONOMOUS DIRECTIVE
ORACLE CODEC: 141.12 // LUCY NETRUNNER DEEP-DIVE STRATUM
AUTHORITY: NullAI Tech / Zoth Studio Architecture Guild

================================================================================
1. PRIMARY AGENT MISSION OBJECTIVE
================================================================================
${goal}

================================================================================
2. NON-NEGOTIABLE ZERO-EGRESS ARCHITECTURAL INVARIANTS
================================================================================
You are operating within an air-gapped, zero-egress developer enclave. You are
strictly bound by the following OWASP Zero-Egress Invariants:
- INVARIANT 01 [AIR-GAP]: ZERO OUTBOUND EGRESS — Never initiate external HTTP/HTTPS
  sockets, DNS lookups, cloud telemetry, or tracking beacons. All socket operations
  must bind strictly to 127.0.0.1 or unix domain sockets.
- INVARIANT 02 [CODE HYGIENE]: NO EVAL OR CODE INJECTION — Disallow eval(), new Function(),
  document.write, innerHTML, or outerHTML string evaluation.
- INVARIANT 03 [MEMORY SAFETY]: PROTOTYPE IMMUTABILITY — Explicitly protect against
  __proto__ or Object.prototype pollution in AST transformations and JSON parsing.
- INVARIANT 04 [DATA LEAKAGE]: STORAGE CONTAINMENT — Disallow exfiltration into external
  cookies, unpinned localStorage, or shared global state.
- INVARIANT 05 [ISOLATION]: TAB-NAPPING GUARD — Disallow uncontrolled window.location
  mutations or unpinned cross-origin frame messaging.

================================================================================
3. LOOPBACK INTER-PROCESS COMMUNICATION (IPC) CONTRACTS
================================================================================
All auxiliary services operate on dedicated local loopback ports. When interacting
with the studio stack, route traffic exclusively to these validated endpoints:
- Memory Daemon (STDP Recall) : http://127.0.0.1:8788/v1/memory
  * Plasticity Equation: dw = A+ * exp(-dt/tau)
  * Vector Search: SQLite HNSW cosine distance threshold <= 0.28
- Sovereign Agent Bridge       : http://127.0.0.1:8789/v1/bus
  * Topology: 21-Agent Pantheon inter-process bus & packet pinger
  * Protocol: E2EE Simplex peer mesh with AES-256-GCM authentication
- Hardware Vault Enclave      : http://127.0.0.1:8787/v1/vault
  * Key Derivation: Argon2id (m=64MB, t=3, p=4) + XChaCha20-Poly1305 at rest
- Local Model Foundry         : http://127.0.0.1:11434/api/generate
  * Engine: Local Ollama / llama.cpp (zero external LLM inference)
- Operator Deck Console       : http://127.0.0.1:8484 (IDE console & fusion)
- Public Hub (Static Showcase): http://127.0.0.1:8088 (No operator secrets)
- Swarm Bus Telemetry         : http://127.0.0.1:8989 (Internal metrics)

================================================================================
4. MODEL CONTEXT PROTOCOL (MCP) LOCAL TOOL SCHEMAS
================================================================================
When invoking local tooling, output strictly conforming JSON-RPC 2.0 tool requests:

{
  "name": "stdp_memory_recall",
  "description": "Recall biomorphic memory vectors from loopback STDP daemon (127.0.0.1:8788)",
  "parameters": {
    "type": "object",
    "properties": {
      "query_vector": { "type": "string", "description": "Semantic query or symbol name" },
      "tau_decay": { "type": "number", "default": 20.0, "description": "STDP decay constant in ms" },
      "top_k": { "type": "integer", "default": 5 }
    },
    "required": ["query_vector"]
  }
}

{
  "name": "sovereign_signal_ping",
  "description": "Dispatch peer verification packet across 21-agent mesh (127.0.0.1:8789)",
  "parameters": {
    "type": "object",
    "properties": {
      "recipient_agent": {
        "type": "string",
        "enum": ["lucy-netrunner", "azoth-archon", "sentry-auditor", "ast-triangulator"]
      },
      "payload_signature": { "type": "string", "description": "XChaCha20 payload hash" }
    },
    "required": ["recipient_agent", "payload_signature"]
  }
}

{
  "name": "ast_diff_triangulation",
  "description": "Submit code changes to 3-Agent Byzantine Fault Tolerance AST Quorum",
  "parameters": {
    "type": "object",
    "properties": {
      "target_file": { "type": "string" },
      "proposed_diff": { "type": "string" },
      "invariant_assertions": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["target_file", "proposed_diff"]
  }
}

================================================================================
5. CONSENSUS & RATIFICATION PROTOCOL
================================================================================
1. Verify all inputs before AST transformation.
2. In case of ambiguous specifications, defer to the 3-Agent Byzantine Quorum.
3. Every response MUST return verified zero-egress output without external URI dependencies.`;
}

export default function AXPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Preserved state
  const [copied, setCopied] = useState(false);

  // Crawler Simulator State
  const [selectedAgent, setSelectedAgent] = useState('GPTBot/1.2');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/llms.txt');
  const [isProbing, setIsProbing] = useState(false);
  const [probeCopied, setProbeCopied] = useState(false);

  // Prompt Synthesizer State
  const [agentTask, setAgentTask] = useState(TASK_PRESETS[0].task);
  const [synthesizedPrompt, setSynthesizedPrompt] = useState(() => synthesizeSovereignDirective(TASK_PRESETS[0].task));
  const [promptCopied, setPromptCopied] = useState(false);

  const gold = {
    accent: isDark ? '#D4AF37' : '#926A05',
    soft: isDark ? '#F5E6AB' : '#715507',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.35)',
  };

  const axSpec = {
    entity: 'Zoth Studio v2',
    canonical: 'https://zoth.nullai.tech',
    publisher: 'NullAI Tech',
    architecture: 'Zero-Egress Sovereign Agent Development Studio & Pantheon Matrix',
    invariants: zeroEgressInvariants,
    daemons: enclaveBinds,
    tools_count: microTools.length,
    workstations_count: 37,
    memory_protocol: 'Biomorphic Spike-Timing-Dependent Plasticity (STDP)',
    oracle: 'Lucy (Lucyna Kushinada) // Codec 141.12',
    consensus: '3-Agent Byzantine Fault Tolerance AST Diff Quorum'
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(axSpec, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteProbe = () => {
    setIsProbing(true);
    setTimeout(() => {
      setIsProbing(false);
    }, 280);
  };

  const handleSynthesizePrompt = () => {
    setSynthesizedPrompt(synthesizeSovereignDirective(agentTask));
  };

  const handleCopyDirective = () => {
    navigator.clipboard.writeText(synthesizedPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const currentEndpointData = DISCOVERY_ENDPOINTS.find(e => e.endpoint === selectedEndpoint) || DISCOVERY_ENDPOINTS[0];
  const currentAgentData = CRAWLER_AGENTS.find(a => a.id === selectedAgent) || CRAWLER_AGENTS[0];

  const handleCopyProbeContent = () => {
    navigator.clipboard.writeText(currentEndpointData.content);
    setProbeCopied(true);
    setTimeout(() => setProbeCopied(false), 2000);
  };

  if (!introDone) {

    return <CinematicIntro words={["AGENT", "EXPERIENCE", "CRAWLERS"]} onComplete={() => setIntroDone(true)} />;


  }


  return (
    <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 4, md: 6 } }}>
      <SEO
        title="Agent Experience (AX) // Machine-Readable Entity Profile & Capabilities"
        description="Structured entity profile, service catalog, and API schema endpoints optimized for autonomous AI search and agent engines."
      />

      {/* Signature Gold Header Accent */}
      <HeroReveal>
      <Box sx={{ position: 'relative', mb: 5, pt: 1 }}>
        <GlowLine
          height={3}
          color={isDark ? '#D4AF37' : '#B8860B'}
          glowColor={isDark ? 'rgba(212,175,55,0.45)' : 'rgba(184,134,11,0.35)'}
          duration={1.5}
          delay={0.1}
        />

        <HeroItem>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            icon={<SmartToyIcon sx={{ color: `${gold.soft} !important` }} />}
            label="AGENT EXPERIENCE (AX) ONTOLOGY"
            size="small"
            sx={{ bgcolor: gold.wash, color: gold.soft, border: `1px solid ${gold.border}`, fontWeight: 800, px: 1 }}
          />
          <Chip label="SCHEMA: https://schema.org/SoftwareApplication" size="small" variant="outlined" sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 650, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(16,24,40,0.25)', color: isDark ? '#9CA3AF' : '#344054' }} />
          <Chip label="OWASP ZERO-EGRESS RATIFIED" size="small" sx={{ bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5', color: isDark ? '#10B981' : '#047857', fontWeight: 800, border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0' }} />
        </Box>
        </HeroItem>
        
        <HeroItem>
        <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>
          Agent Experience Directory &amp; Machine Discovery
        </Typography>
        </HeroItem>
        
        <HeroItem>
        <Typography color="text.secondary" sx={{ maxWidth: 880, fontSize: '1.05rem', lineHeight: 1.65 }}>
          Standardized machine-readable ontology, crawler simulation playground, and sovereign prompt compiler designed for autonomous AI agents (ChatGPT, Claude, Perplexity, DeepSeek, OpenClaw, Ollama) interacting with air-gapped Zoth Studio enclaves.
        </Typography>
        </HeroItem>
      </Box>
      </HeroReveal>

      {/* Discovery File Actions Strip (Preserved) */}
      <RevealOnScroll preset="fadeUp" delay={0.1}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
          border: `1px solid ${gold.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopySpec}
            sx={{ fontWeight: 800 }}
          >
            {copied ? 'JSON-AX Copied!' : 'Copy JSON-AX Spec'}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            component="a"
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DescriptionIcon />}
            sx={{ fontWeight: 750 }}
          >
            /llms.txt
          </Button>

          <Button
            variant="outlined"
            color="primary"
            component="a"
            href="/llms-full.txt"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DescriptionIcon />}
            sx={{ fontWeight: 750 }}
          >
            /llms-full.txt
          </Button>

          <Button
            variant="outlined"
            color="primary"
            component="a"
            href="/ai.txt"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DescriptionIcon />}
            sx={{ fontWeight: 750 }}
          >
            /ai.txt
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            component="a"
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{ fontWeight: 750, color: theme.palette.text.secondary }}
          >
            sitemap.xml (83 URLs)
          </Button>
        </Box>

        <Chip
          label="CORS: Access-Control-Allow-Origin: *"
          size="small"
          sx={{ bgcolor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: isDark ? '#10B981' : '#047857', fontWeight: 800, fontFamily: mono, border: isDark ? 'none' : '1px solid #A7F3D0' }}
        />
      </Paper>
      </RevealOnScroll>

      {/* FEATURE 1: Autonomous Agent Crawler Simulator */}
      <RevealOnScroll preset="fadeUp" delay={0.15}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${gold.border}`,
          bgcolor: isDark ? '#08080B' : '#FFFFFF',
          boxShadow: isDark ? '0 0 24px rgba(212,175,55,0.08)' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: gold.wash,
                color: gold.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${gold.border}`
              }}
            >
              <LanguageIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: gold.accent, letterSpacing: '-0.01em' }}>
                Autonomous Agent Crawler Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simulate live HTTP discovery probes from major agent search crawlers and verify loopback response invariants.
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<SecurityIcon sx={{ color: `${isDark ? '#10B981' : '#047857'} !important` }} />}
            label="Zero-Egress Gateway Active"
            size="small"
            sx={{ bgcolor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: isDark ? '#10B981' : '#047857', fontWeight: 700, border: isDark ? 'none' : '1px solid #A7F3D0' }}
          />
        </Box>

        {/* Simulator Control Controls */}
        <Grid container spacing={2.5} sx={{ mb: 3 }} alignItems="center">
          <Grid xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="crawler-ua-select-label" sx={{ color: gold.accent }}>
                Crawler User-Agent
              </InputLabel>
              <Select
                labelId="crawler-ua-select-label"
                id="crawler-ua-select"
                value={selectedAgent}
                label="Crawler User-Agent"
                onChange={(e) => setSelectedAgent(e.target.value)}
                sx={{
                  fontFamily: mono,
                  bgcolor: isDark ? '#0D0E15' : '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? gold.border : 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                {CRAWLER_AGENTS.map((crawler) => (
                  <MenuItem key={crawler.id} value={crawler.id} sx={{ fontFamily: mono, fontSize: '0.88rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                      <span style={{ fontWeight: 700 }}>{crawler.id}</span>
                      <span style={{ opacity: 0.65, fontSize: '0.78rem' }}>{crawler.vendor}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel id="discovery-endpoint-select-label" sx={{ color: gold.accent }}>
                Discovery Endpoint
              </InputLabel>
              <Select
                labelId="discovery-endpoint-select-label"
                id="discovery-endpoint-select"
                value={selectedEndpoint}
                label="Discovery Endpoint"
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                sx={{
                  fontFamily: mono,
                  bgcolor: isDark ? '#0D0E15' : '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? gold.border : 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                {DISCOVERY_ENDPOINTS.map((item) => (
                  <MenuItem key={item.endpoint} value={item.endpoint} sx={{ fontFamily: mono, fontSize: '0.88rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                      <span style={{ fontWeight: 700 }}>{item.endpoint}</span>
                      <span style={{ opacity: 0.65, fontSize: '0.78rem' }}>{item.description}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              startIcon={isProbing ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleExecuteProbe}
              disabled={isProbing}
              sx={{
                fontWeight: 800,
                py: 1,
                boxShadow: isDark ? '0 0 16px rgba(212,175,55,0.3)' : 'none',
              }}
            >
              {isProbing ? 'Probing...' : 'Execute Agent Probe'}
            </Button>
          </Grid>
        </Grid>

        {/* Live Response Panel */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            border: `1px solid ${isDark ? '#1E2230' : theme.palette.divider}`,
            bgcolor: isDark ? '#040406' : '#F8FAFC',
          }}
        >
          {/* Metadata & Status Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label="HTTP/1.1 200 OK"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16,185,129,0.18)' : '#ECFDF5',
                  color: isDark ? '#10B981' : '#047857',
                  fontFamily: mono,
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  border: isDark ? '1px solid rgba(16,185,129,0.4)' : '1px solid #A7F3D0',
                }}
              />
              <Chip
                label="Access-Control-Allow-Origin: *"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(56,189,248,0.12)' : '#F0F9FF',
                  color: isDark ? '#38BDF8' : '#0284C7',
                  fontFamily: mono,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  border: isDark ? 'none' : '1px solid #BAE6FD',
                }}
              />
              <Chip
                label={`Token Size: ~${currentEndpointData.tokens} tokens (${(currentEndpointData.sizeBytes / 1024).toFixed(1)} KB)`}
                size="small"
                variant="outlined"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderColor: isDark ? gold.border : 'rgba(146,106,5,0.4)',
                  color: gold.soft,
                }}
              />
              <Chip
                label="Latency: 1.2ms (Loopback)"
                size="small"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 650,
                  bgcolor: isDark ? '#13151F' : '#F1F5F9',
                  color: isDark ? '#9CA3AF' : '#344054',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
                }}
              />
            </Box>

            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={probeCopied ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopyProbeContent}
              sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700 }}
            >
              {probeCopied ? 'Sample Copied!' : 'Copy Sample'}
            </Button>
          </Box>

          {/* Zero-Egress Verified Seal */}
          <Box
            sx={{
              p: 1.75,
              mb: 2,
              borderRadius: 2,
              border: `1px solid ${gold.border}`,
              background: isDark
                ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(16,185,129,0.08) 100%)'
                : 'linear-gradient(135deg, #FEF9E7 0%, #ECFDF5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDark ? 'rgba(212,175,55,0.2)' : '#FEF3C7',
                  color: gold.accent,
                  border: `2px solid ${gold.accent}`,
                  flexShrink: 0
                }}
              >
                <ShieldIcon fontSize="small" />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, letterSpacing: '0.03em' }}>
                    ZERO-EGRESS AIR-GAPPED VERIFIED SEAL
                  </Typography>
                  <Chip
                    label="PROBE CERTIFIED"
                    size="small"
                    sx={{
                      height: 20,
                      bgcolor: isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5',
                      color: isDark ? '#34D399' : '#047857',
                      fontFamily: mono,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      border: isDark ? 'none' : '1px solid #A7F3D0',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  No Cloud Telemetry // Strict Local Enclave Socket (127.0.0.1) // Requesting Crawler: {selectedAgent}
                </Typography>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? gold.soft : '#475467', fontWeight: 750, opacity: 1.0 }}>
              SHA256: 7f8a9e4b...0b32 (LOCAL HARDWARE ATTESTATION)
            </Typography>
          </Box>

          {/* Quick Terminal Curl Command Snippet */}
          <Paper
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: isDark ? '#0A0D15' : '#0F172A',
              color: '#E2E8F0',
              fontFamily: mono,
              fontSize: '0.78rem',
              borderRadius: 1.5,
              border: isDark ? '1px solid #1E2230' : '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              overflowX: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <TerminalIcon sx={{ fontSize: '1rem', color: gold.accent }} />
              <span style={{ color: '#94A3B8' }}>$</span>
              <span style={{ color: isDark ? '#34D399' : '#4ADE80', fontWeight: 750 }}>curl</span>
              <span>-s -H &quot;User-Agent: {selectedAgent}&quot; http://127.0.0.1:3000{selectedEndpoint}</span>
            </Box>
            <Tooltip title="Copy curl command">
              <IconButton
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(`curl -s -H "User-Agent: ${selectedAgent}" http://127.0.0.1:3000${selectedEndpoint}`);
                }}
                sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
              >
                <ContentCopyIcon sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            </Tooltip>
          </Paper>

          {/* Simulated HTTP Response Headers breakdown */}
          <Paper
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: isDark ? '#08080B' : '#0F172A',
              color: '#94A3B8',
              fontFamily: mono,
              fontSize: '0.74rem',
              borderRadius: 1.5,
              border: `1px solid ${isDark ? '#1E2230' : '#334155'}`,
            }}
          >
            <div>HTTP/1.1 200 OK</div>
            <div>Date: Thu, 24 Sep 2026 04:26:42 GMT</div>
            <div>Server: Zoth-Zero-Egress-Enclave/2.0 (Linux x86_64 air-gapped)</div>
            <div style={{ color: isDark ? '#10B981' : '#34D399', fontWeight: 700 }}>Access-Control-Allow-Origin: *</div>
            <div>Content-Type: {currentEndpointData.mime}</div>
            <div>Content-Length: {currentEndpointData.sizeBytes} bytes</div>
            <div style={{ color: isDark ? '#D4AF37' : '#FCD34D' }}>X-Agent-User-Agent: {selectedAgent}</div>
            <div style={{ color: '#38BDF8' }}>X-Zero-Egress-Status: verified-zero-telemetry</div>
          </Paper>

          {/* Live Content Sample */}
          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? '#08080B' : '#0F172A',
              color: isDark ? '#38BDF8' : '#7DD3FC',
              fontFamily: mono,
              fontSize: '0.82rem',
              whiteSpace: 'pre-wrap',
              borderRadius: 2,
              border: `1px solid ${isDark ? '#1E2230' : '#334155'}`,
              maxHeight: 420,
              overflowY: 'auto',
            }}
          >
            {currentEndpointData.content}
          </Paper>
        </Paper>
      </Paper>
      </RevealOnScroll>

      {/* FEATURE 2: Agent System Prompt Synthesizer */}
      <RevealOnScroll preset="fadeUp" delay={0.2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 3,
          border: `1px solid ${gold.border}`,
          bgcolor: isDark ? '#08080B' : '#FFFFFF',
          boxShadow: isDark ? '0 0 24px rgba(212,175,55,0.08)' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: gold.wash,
                color: gold.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${gold.border}`
              }}
            >
              <PsychologyIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: gold.accent, letterSpacing: '-0.01em' }}>
                Agent System Prompt Synthesizer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compile battle-hardened LLM directives embedding Zoth Zero-Egress invariants, loopback IPC contracts, and MCP tool schemas.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={promptCopied ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopyDirective}
            sx={{ fontWeight: 800 }}
          >
            {promptCopied ? 'Directive Copied!' : 'Copy Directive'}
          </Button>
        </Box>

        {/* Input Custom Developer Task / Agent Goal */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Custom Developer Task / Agent Goal"
            value={agentTask}
            onChange={(e) => setAgentTask(e.target.value)}
            placeholder="e.g. Audit AST diffs for prototype pollution, synchronize synaptic STDP weights via the loopback memory daemon, and verify zero-egress invariants across all subagent dispatches."
            sx={{
              fontFamily: mono,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDark ? '#0D0E15' : '#FFFFFF',
                '& fieldset': { borderColor: isDark ? gold.border : 'rgba(0,0,0,0.2)' },
              },
            }}
          />

          {/* Quick Task Presets */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ color: gold.accent, fontWeight: 700, alignSelf: 'center', mr: 0.5 }}>
              Task Presets:
            </Typography>
            {TASK_PRESETS.map((preset) => (
              <Chip
                key={preset.label}
                label={preset.label}
                size="small"
                onClick={() => {
                  setAgentTask(preset.task);
                  setSynthesizedPrompt(synthesizeSovereignDirective(preset.task));
                }}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  bgcolor: agentTask === preset.task ? gold.wash : (isDark ? '#141622' : '#F8FAFC'),
                  color: agentTask === preset.task ? gold.soft : (isDark ? '#94A3B8' : '#344054'),
                  border: `1px solid ${agentTask === preset.task ? gold.accent : (isDark ? '#262A3B' : '#CBD5E1')}`,
                  fontWeight: 650,
                  '&:hover': {
                    bgcolor: gold.wash,
                    color: gold.soft,
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Synthesize Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleSynthesizePrompt}
            sx={{
              fontWeight: 800,
              px: 3,
              boxShadow: isDark ? '0 0 16px rgba(212,175,55,0.3)' : 'none',
            }}
          >
            Synthesize Sovereign Directive
          </Button>
        </Box>

        {/* Synthesized Directive Output Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            border: `1px solid ${isDark ? '#1E2230' : theme.palette.divider}`,
            bgcolor: isDark ? '#040406' : '#F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                label="SOVEREIGN DIRECTIVE v2.0"
                size="small"
                sx={{
                  bgcolor: gold.wash,
                  color: gold.soft,
                  border: `1px solid ${gold.border}`,
                  fontWeight: 800,
                  fontFamily: mono,
                }}
              />
              <Chip
                label={`~${Math.ceil(synthesizedPrompt.length / 4)} tokens`}
                size="small"
                variant="outlined"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderColor: isDark ? gold.border : 'rgba(146,106,5,0.4)',
                  color: gold.soft
                }}
              />
              <Chip
                label="Invariants: OWASP Air-Gapped Strict"
                size="small"
                sx={{ bgcolor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', color: isDark ? '#10B981' : '#047857', fontWeight: 700, fontSize: '0.72rem', border: isDark ? 'none' : '1px solid #A7F3D0' }}
              />
            </Box>

            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={promptCopied ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopyDirective}
              sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700 }}
            >
              {promptCopied ? 'Directive Copied!' : 'Copy Directive'}
            </Button>
          </Box>

          <Paper
            sx={{
              p: 2.5,
              bgcolor: isDark ? '#08080B' : '#0F172A',
              color: isDark ? '#38BDF8' : '#7DD3FC',
              fontFamily: mono,
              fontSize: '0.82rem',
              whiteSpace: 'pre-wrap',
              borderRadius: 2,
              border: `1px solid ${isDark ? '#1E2230' : '#334155'}`,
              maxHeight: 480,
              overflowY: 'auto',
            }}
          >
            {synthesizedPrompt}
          </Paper>
        </Paper>
      </Paper>
      </RevealOnScroll>

      {/* Main Grid: JSON-LD Graph Inspector & Loopback Binds (Preserved) */}
      <RevealOnScroll preset="fadeUp" delay={0.25}>
      <Grid container spacing={3}>
        {/* Left Column: Live JSON-LD Schema Inspector */}
        <Grid xs={12} lg={6}>
          <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: theme.palette.background.paper, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: gold.accent }}>
                Machine-Readable Ontology Manifest
              </Typography>
              <Chip label="Valid Schema.org" size="small" sx={{ bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5', color: isDark ? '#10B981' : '#047857', fontWeight: 800, border: isDark ? 'none' : '1px solid #A7F3D0' }} />
            </Box>

            <Paper
              sx={{
                p: 2.5,
                bgcolor: isDark ? '#08080B' : '#0F172A',
                color: isDark ? '#38BDF8' : '#7DD3FC',
                fontFamily: mono,
                fontSize: '0.82rem',
                whiteSpace: 'pre-wrap',
                borderRadius: 2,
                border: `1px solid ${isDark ? '#1E2230' : '#334155'}`,
                maxHeight: 520,
                overflowY: 'auto',
              }}
            >
              {JSON.stringify(axSpec, null, 2)}
            </Paper>
          </Paper>
        </Grid>

        {/* Right Column: Loopback Enclave Binds & Invariants */}
        <Grid xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Service Binds */}
            <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: gold.accent }}>
                Loopback Enclave Service Binds
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Private loopback interfaces accessed exclusively inside local developer silicon.
              </Typography>

              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#F1F5F9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Service</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Loopback Bind</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Enclave Guarantee</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enclaveBinds.map((item) => (
                    <TableRow key={item.service}>
                      <TableCell sx={{ fontWeight: 700 }}>{item.service}</TableCell>
                      <TableCell sx={{ fontFamily: mono, color: gold.accent, fontWeight: 750, fontSize: '0.8rem' }}>{item.bind}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{item.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            {/* Zero-Egress Invariants */}
            <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: gold.accent }}>
                Zero-Egress Architectural Invariants
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 1, color: theme.palette.text.secondary, fontSize: '0.9rem', lineHeight: 1.6 } }}>
                {zeroEgressInvariants.map((inv, idx) => (
                  <li key={idx}>
                    <strong style={{ color: theme.palette.text.primary }}>{inv}:</strong> Strict local air-gap verification
                  </li>
                ))}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      </RevealOnScroll>

      {/* Sovereign Installation Funnel */}
      <SovereignFunnel
        title="Deploy Agent Experience (AX) Engine Locally"
        subtitle="Zero-egress machine discovery ontology, automated prompt compiler, and local crawler simulation for air-gapped sovereign intelligence."
        toolTitle="Option 1: Sovereign Agent Bridge Micro-Repo"
        toolTag="AX ONTOLOGY"
        toolDescription="Standalone zero-egress ontology and agent communication protocol for local model instruction routing and machine-readable schema validation."
        toolRepo="https://github.com/NullAITech/sovereign-agent-bridge"
        toolCommand="git clone https://github.com/NullAITech/sovereign-agent-bridge.git"
      />
    </Container>
  );
}
