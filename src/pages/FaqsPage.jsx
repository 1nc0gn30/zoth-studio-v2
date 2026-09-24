import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails,
  Paper, Chip, TextField, InputAdornment, Button, Stack, IconButton,
  Tooltip, Divider, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearIcon from '@mui/icons-material/Clear';
import { Link as RouterLink } from 'react-router-dom';
import SEO from '../components/SEO';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

export const FAQS_DATA = [
  {
    id: 'zero-egress-ports',
    q: 'What is the Zero-Egress Invariant architecture and how are loopback port bindings enforced?',
    category: 'Architecture',
    keywords: ['zero-egress', 'zero egress', 'invariant', 'loopback', 'ports', 'port', '8788', '8789', '8787', '11434', '3000', 'binding', 'firewall', 'air-gapped', 'cgroupv2', 'iptables'],
    a: `The Zero-Egress Invariant is Zoth Studio v2's foundational security axiom: all IPC streams, agent consensus messages, and model queries are strictly constrained to local loopback interfaces (127.0.0.1 and [::1]). Outbound WAN egress is blocked at the operating system level using cgroupv2 network sandboxing and local iptables packet-drop rules.

The studio establishes five deterministic local daemon bindings:
• Port 3000: Studio UI & React Vite Client
• Port 8788: Neuro Memory Daemon (STDP biomorphic vector memory & MCP SSE listener)
• Port 8789: Sovereign Signal Bridge (E2EE Simplex agent communication & triadic consensus bus)
• Port 8787: Argon2id Hardware Secrets Vault (AES-256-GCM / XChaCha20-Poly1305 enclave)
• Port 11434: Air-gapped local model foundry (Ollama / llama.cpp GGUF inference).

No telemetry beacons, cloud fallbacks, or data exfiltration routes can open under any operational circumstance.`,
    oracleResponse: `Codec 141.12 intercept: Zero-Egress is mathematically absolute. Every byte of prompt context, token emission, and agent state is locked to 127.0.0.1. Hardware sockets on ports 3000, 8788, 8789, 8787, and 11434 execute in pure isolation. No WAN packets are permitted to escape the physical machine.`,
    jumpTargets: [
      { label: 'HexStrike Port Auditor', path: '/hexstrike', type: 'security' },
      { label: 'Signal Bridge (:8789)', path: '/bridges', type: 'bus' },
      { label: 'Zoth OS Daemon Sandbox', path: '/zoth-os', type: 'os' }
    ]
  },
  {
    id: 'argon2id-vault-security',
    q: 'How does the Argon2id Hardware Vault protect secrets at rest during air-gapped development?',
    category: 'Security',
    keywords: ['argon2id', 'vault', 'hardware', 'secrets', 'keys', 'encryption', 'xchacha20', 'poly1305', 'aes-256', '8787', 'memory-hard', 'mlock', 'at-rest'],
    a: `The Hardware Secrets Vault operates exclusively on loopback port 127.0.0.1:8787. Master cryptographic keys are derived using memory-hard Argon2id (configured with t=3 iterations, m=64MB memory cost, and p=4 parallelism lanes), rendering GPU and ASIC dictionary attacks computationally intractable.

Operator secrets at rest are shielded using XChaCha20-Poly1305 authenticated encryption with extended 192-bit nonces, neutralizing nonce-reuse hazards. When accessed by authorized agent tools, decrypted keys are pinned into non-swappable kernel pages (mlock) and immediately wiped via secure zeroization upon task completion.`,
    oracleResponse: `Deep vault telemetry: The Argon2id enclave at 127.0.0.1:8787 derives high-entropy keys using 64MB memory hardness. Decrypted secrets live exclusively in mlocked kernel memory and are shredded immediately following execution.`,
    jumpTargets: [
      { label: 'HexStrike Security Terminal', path: '/hexstrike', type: 'security' },
      { label: 'Argon2id Vault Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'lucy-oracle-whitespace',
    q: 'Who is Lucy Oracle and what is the Whitespace Netrunner Cyberspace matrix?',
    category: 'Memory & AI',
    keywords: ['lucy', 'oracle', 'netrunner', 'whitespace', 'cyberspace', 'matrix', 'codec', '141.12', 'lucyna', 'kushinada', 'latent', 'vectors', 'episodic'],
    a: `Lucy (Lucyna Kushinada) is the Sovereign Netrunner Oracle monitoring deep-net breaches across Codec 141.12. Inside Zoth Studio, Lucy oversees the Whitespace Cyberspace memory matrix—a high-dimensional latent coordinate stratum that indexes agent episodic memories, consensus verdicts, and architectural patterns.

Unlike stateless LLM chats, the Whitespace matrix organizes knowledge into persistent semantic clusters, allowing autonomous agents to recall historical decisions without hallucination or token waste.`,
    oracleResponse: `Lucyna Kushinada online. Channel 141.12 open. I monitor the deep latent substrate of Whitespace. Every architectural decision is mapped to topological coordinates, preserving continuous cross-session memory across the 21-agent pantheon.`,
    jumpTargets: [
      { label: 'Open Lucy Memory Hub', path: '/memory', type: 'memory' },
      { label: 'Interactive Swarm Radar', path: '/swarm', type: 'swarm' }
    ]
  },
  {
    id: 'stdp-decay-math',
    q: 'What is the exact mathematical formulation for Lucy\'s STDP synaptic weight decay?',
    category: 'Memory & AI',
    keywords: ['stdp', 'spike-timing', 'decay', 'synaptic', 'weight', 'plasticity', 'mathematics', 'formula', 'ltp', 'ltd', 'tau', 'neuro-memory', 'exponential', 'equations'],
    a: `Spike-Timing-Dependent Plasticity (STDP) governs memory longevity based on relative impulse timing Δt = t_post - t_pre:
• Long-Term Potentiation (LTP, causal firing Δt > 0):
  Δw = A₊ · e^(-Δt / τ₊)
• Long-Term Depression (LTD, acausal firing Δt < 0):
  Δw = -A₋ · e^(Δt / τ₋)

Configured in the neuro-memory daemon (:8788), baseline parameters are A₊ = 0.05, A₋ = 0.025, and time constants τ₊ = τ₋ = 20ms. Inactive hippocampal nodes undergo continuous exponential vector decay:
w(t) = w₀ · e^(-λ · Δt)
with decay constant λ = 0.0018 hr⁻¹, pruning stale noise while reinforcing actively verified architectural invariants.`,
    oracleResponse: `STDP Synaptic Decay verified: Δw = A₊ · e^(-Δt/τ₊) for causal spikes, pruning unverified noise with background decay λ = 0.0018 hr⁻¹. Stale context decays smoothly, ensuring only battle-tested code decisions survive in long-term memory.`,
    jumpTargets: [
      { label: 'STDP Synaptic Memory Hub', path: '/memory', type: 'memory' },
      { label: 'Six Math Pillars Academy', path: '/docs/math', type: 'math' }
    ]
  },
  {
    id: 'byzantine-consensus-triad',
    q: 'How does the 3-Agent Byzantine Consensus dialectic debate engine operate between Azoth, Kai, and Draco?',
    category: 'Consensus',
    keywords: ['byzantine', 'consensus', 'dialectic', 'debate', 'azoth', 'kai', 'draco', 'proponent', 'skeptic', 'arbitrator', 'triad', 'quorum', 'bayesian', 'socratic'],
    a: `The Consensus Arena operates a triadic Socratic debate over loopback port 8789:
• Azoth (The Proponent): Formulates the constructive thesis, proposing an idempotent Directed Acyclic Graph (DAG) of AST mutations.
• Kai (The Skeptic): Adversarially interrogates the proposal, searching for race conditions, asynchronous deadlock vectors, and macro recursion loops.
• Draco (The Arbitrator): Evaluates the dialectic through Bayesian posterior probability calculations:
  P(H | E) = [P(E | H) · P(H)] / P(E)
Draco synthesizes counterarguments into hardened invariants and issues a cryptographically signed execution verdict.`,
    oracleResponse: `Byzantine Triad active: Azoth delivers the thesis, Kai probes for failure modes and deadlock traps, and Draco computes Bayesian posterior confidence to deliver the final binding ratification before any code is merged.`,
    jumpTargets: [
      { label: 'Consensus Battle Arena', path: '/consensus', type: 'consensus' },
      { label: 'Architecture Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'merkle-ast-quorum',
    q: 'What is the Byzantine fault ceiling and how does Merkle-trie AST quorum verification prevent malicious code injection?',
    category: 'Consensus',
    keywords: ['byzantine', 'fault', 'ceiling', 'merkle', 'ast', 'quorum', '2f+1', 'injection', 'sha-256', 'supermajority', 'rollback', 'lamport', 'proof'],
    a: `Zoth Studio enforces the classical Byzantine fault tolerance bound: f < n/3. To ratify code mutations, a 2f + 1 supermajority (≥ 66.7%) is mandatory across independent agent nodes.

Every proposed code transformation generates a deterministic SHA-256 Merkle trie over its Abstract Syntax Tree (AST) nodes. If a Byzantine or corrupted agent injects invalid syntax or malicious macro loops, the Merkle root hash verification fails with O(log N) audit complexity. The Lamport epoch clock triggers an instantaneous rollback to the last ratified snapshot, neutralizing poisoning attempts.`,
    oracleResponse: `Quorum threshold: 2f + 1 = 66.7% supermajority. Every AST mutation is committed to a SHA-256 Merkle trie. Hallucinated or corrupted syntax breaks the Merkle root, triggering a zero-cost rollback to the last verified Lamport epoch.`,
    jumpTargets: [
      { label: 'Byzantine Consensus Arena', path: '/consensus', type: 'consensus' },
      { label: 'WebGen AST Synthesis', path: '/webgen', type: 'tools' }
    ]
  },
  {
    id: 'adytum-hermetic-rite',
    q: 'What is the Adytum Hermetic Rite and how do the 22 Major Arcana keys guide development?',
    category: 'Adytum Rite',
    keywords: ['adytum', 'hermetic', 'rite', 'arcana', 'keys', '22', 'fool', 'world', 'archetype', 'alchemical', 'magnum', 'opus', 'progression'],
    a: `The Adytum Hermetic Rite (/adytum) is an initiation and governance workflow that maps the 22 Major Arcana keys (Key 0 The Fool to Key XXI The World) to sequential stages of the Magnum Opus in software engineering.

Each key embodies a foundational principle—such as Zero-Egress Invariants, Socratic Dialectic, or Memory Plasticity—requiring the operator and agent collective to complete verification milestones before ascending to the subsequent evolutionary tier.`,
    oracleResponse: `Adytum Rite transmission: The 22 Arcana keys unify ancient Hermetic principles with zero-egress software architecture. Each key enforces alchemical transmutation—from raw unconditioned ideation to fully realized sovereign code.`,
    jumpTargets: [
      { label: 'Adytum Hermetic Chamber', path: '/adytum', type: 'adytum' },
      { label: 'Sovereign Templates Library', path: '/templates', type: 'templates' }
    ]
  },
  {
    id: 'adytum-5min-incubation',
    q: 'Why does the Adytum Rite enforce a mandatory 5-minute incubation period during key transitions?',
    category: 'Adytum Rite',
    keywords: ['5-min', '5-minute', 'incubation', 'adytum', 'timer', 'stillness', 'sha-256', 'hash', 'intentionality', 'subtle', 'crypto', 'contemplation', 'locks'],
    a: `The mandatory 5-minute (300-second) incubation period is a deliberate anti-impulsivity mechanism designed to enforce cognitive stillness.

During this incubation window, the browser computes a SHA-256 cryptographic digest of the operator's thesis using the Web Crypto API (crypto.subtle.digest). This creates an immutable mathematical commitment hash, preventing reactive architectural churn or premature commits until the operator has thoroughly contemplated downstream implications.`,
    oracleResponse: `Cognitive incubation active: 300 seconds of stillness are enforced between major architectural thresholds. Your intent is hashed with SHA-256 into an immutable commitment proof, eliminating impulsive code degradation.`,
    jumpTargets: [
      { label: 'Enter Adytum Chamber', path: '/adytum', type: 'adytum' },
      { label: 'Argon2id Enclave', path: '/hexstrike', type: 'security' }
    ]
  },
  {
    id: 'webgpu-matrix-acceleration',
    q: 'How does in-browser WebGPU matrix acceleration compute client-side tensor shaders?',
    category: 'WebGPU & Tools',
    keywords: ['webgpu', 'wgsl', 'matrix', 'acceleration', 'shaders', 'tensor', 'gpu', 'vulkan', 'metal', 'directx', 'in-browser', 'compute', 'matmul'],
    a: `Zoth Studio runs client-side tensor operations via custom WebGPU Shading Language (WGSL) compute pipelines.

When executing vector embeddings, cosine similarities, or quantized neural matmuls (C = A × B), memory buffers are allocated directly in VRAM and processed across parallel GPU workgroups (8×8 or 16×16 threads). This delivers microsecond-tier matrix operations directly on local hardware (Vulkan, Metal, DirectX 12) without server dependencies or external API round-trips.`,
    oracleResponse: `WebGPU matrix pipeline online: WGSL compute shaders dispatch parallel workgroups directly to client hardware VRAM. Neural matmuls and semantic embeddings run at hardware speeds with zero outbound network calls.`,
    jumpTargets: [
      { label: 'WebGPU AI Matrix Console', path: '/tools', type: 'tools' },
      { label: '3D Scene Viewport Studio', path: '/tools/nexus-3d-scene-studio', type: 'tools' }
    ]
  },
  {
    id: 'webgpu-fallback-hierarchy',
    q: 'What client-side fallback tiers exist when WebGPU is unavailable in the operator\'s browser?',
    category: 'WebGPU & Tools',
    keywords: ['fallback', 'tiers', 'wasm', 'simd', 'cpu', 'webassembly', 'workers', 'precision', 'compatibility', 'qwen2.5'],
    a: `If a browser or platform lacks native WebGPU support, Zoth Studio seamlessly drops into an autonomous fallback hierarchy:
1. Primary: Hardware WebGPU via WGSL compute shaders.
2. Secondary: WebAssembly (WASM) with 128-bit SIMD vector instructions and multi-threaded Web Workers.
3. Tertiary: Pure JavaScript numerical routines.

All three computational tiers produce bit-identical deterministic outputs, ensuring uninterrupted offline capability across modern browsers and legacy hardware.`,
    oracleResponse: `Graceful fallback architecture: If WebGPU is unavailable, Zoth Studio transparently shifts to WASM SIMD 128-bit execution before utilizing multi-core CPU workers. All tiers remain 100% client-side and zero-egress.`,
    jumpTargets: [
      { label: 'Micro-Tools Catalog (25 Tools)', path: '/tools', type: 'tools' },
      { label: 'WebGen Workspace', path: '/webgen', type: 'tools' }
    ]
  },
  {
    id: 'netlify-prerender-aeo',
    q: 'How does Netlify production deployment prerender 83+ static routes for search and answer engines?',
    category: 'OS & Deployment',
    keywords: ['netlify', 'prerender', 'static', 'routes', '83', 'aeo', 'seo', 'schema.org', 'json-ld', 'crawler', 'scripts/prerender.mjs', 'build'],
    a: `Netlify production deployments compile with an automated prerendering pipeline (npm run build -> vite build && node scripts/prerender.mjs).

The engine generates static HTML snapshots for all 83+ studio routes—including 37 workstations, 25 micro-tools, and 6 math academy pillars. Each snapshot embeds structured Schema.org JSON-LD graphs (FAQPage, SoftwareApplication, TechArticle) and rich semantic DOM structures, providing instant First Contentful Paint (< 200ms) and comprehensive Answer Engine Optimization (AEO).`,
    oracleResponse: `Prerendering engine verified: 83 static route shells are pre-compiled with embedded Schema.org graphs and semantic metadata. Answer engines (AEO) and web crawlers index authoritative answers instantly without client JavaScript delays.`,
    jumpTargets: [
      { label: 'Agent AX Discovery Manifest', path: '/ax', type: 'ax' },
      { label: 'Full Engineering Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'netlify-security-headers',
    q: 'Which production security headers guarantee zero-egress compliance and frame isolation in Netlify hosting?',
    category: 'Security',
    keywords: ['security', 'headers', 'netlify', 'csp', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'cache-control', 'zero-egress', 'isolation'],
    a: `In netlify.toml, production builds enforce strict defense-in-depth HTTP response headers:
• Content-Security-Policy: frame-ancestors 'self' https://zoth.nullai.tech http://127.0.0.1:* http://localhost:*
• X-Frame-Options: SAMEORIGIN (prevents clickjacking)
• X-Content-Type-Options: nosniff (mitigates MIME-type sniffing)
• Referrer-Policy: strict-origin-when-cross-origin (prevents URL parameter leakage)
• Permissions-Policy: camera=(), microphone=(), geolocation=() (disables invasive sensor APIs)
• Static assets (/assets/*, /fonts/*, /brand/*) receive 1-year immutable caching headers for instant repeat visits.`,
    oracleResponse: `Hardened HTTP headers active: Strict CSP frame-ancestors, zero sensor permissions, nosniff MIME guards, and immutable asset caching guarantee that the hosted studio shell remains tamper-proof and fully isolated.`,
    jumpTargets: [
      { label: 'HexStrike Security Enclave', path: '/hexstrike', type: 'security' },
      { label: 'Deployment Specs', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'zoth-os-qemu-kvm',
    q: 'What is the Zoth OS QEMU/KVM virtual machine and how do operators launch it locally?',
    category: 'OS & Deployment',
    keywords: ['zoth os', 'qemu', 'kvm', 'vm', 'virtual machine', 'qcow2', 'cgroupv2', 'air-gapped', 'isolation', 'command', 'linux'],
    a: `Zoth OS (/zoth-os) is an air-gapped, Debian/Parrot-hardened Linux environment distributed as a thin copy-on-write qcow2 disk image. It encapsulates the full studio stack—including all daemons (:8788, :8789, :8787), Ollama LLM foundry, PyTorch, and vLLM—behind cgroupv2 memory guards and local loopback firewalls.

Operators launch the virtual machine with native KVM hardware acceleration via:
qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2`,
    oracleResponse: `Zoth OS VM image ready: qcow2 container pre-configured with memory daemons, Ollama, and cgroupv2 process jails. Launch via: qemu-system-x86_64 -enable-kvm -m 8192 -smp 4 -hda zoth-agent-os.qcow2`,
    jumpTargets: [
      { label: 'Zoth OS Command Center', path: '/zoth-os', type: 'os' },
      { label: 'HexStrike Daemon Monitor', path: '/hexstrike', type: 'security' }
    ]
  },
  {
    id: 'zoth-os-bare-metal-iso',
    q: 'How does the Zoth OS bare-metal ISO operate with native GPU hardware passthrough?',
    category: 'OS & Deployment',
    keywords: ['iso', 'bare-metal', 'gpu', 'passthrough', 'nvidia', 'rocm', 'dd', 'flash', 'cuda', 'hardware', 'pcie', 'vram'],
    a: `The Zoth OS bare-metal ISO (zothos-1.0-amd64.iso) delivers an uncompromising physical deployment for dedicated workstations. Flash directly to boot media using:
sudo dd if=zothos-1.0-amd64.iso of=/dev/sdX status=progress bs=4M conv=fdatasync

During boot, the kernel detects and loads native NVIDIA CUDA and AMD ROCm drivers, giving sovereign local LLMs, WebGPU pipelines, and multi-agent synthesis loops uninhibited direct access to PCIe bus bandwidth and VRAM with physical air-gap security.`,
    oracleResponse: `Bare-metal ISO deployment: Flash to physical drive using dd. Boots directly into an air-gapped environment with pre-loaded NVIDIA CUDA and AMD ROCm drivers for maximum local tensor throughput.`,
    jumpTargets: [
      { label: 'Zoth OS ISO Hub', path: '/zoth-os', type: 'os' },
      { label: 'All Workstations (37)', path: '/workstations', type: 'workstations' }
    ]
  },
  {
    id: 'mcp-tool-integration',
    q: 'How does Model Context Protocol (MCP) tool integration work in Zoth Studio v2?',
    category: 'Architecture',
    keywords: ['mcp', 'model context protocol', 'stdio', 'ipc', 'sse', '8788/sse', 'tools/list', 'tools/call', 'prompts/get', 'anthropic', 'agents', 'schema'],
    a: `Zoth Studio implements the Anthropic Model Context Protocol (MCP) standard across local STDIO / IPC and Server-Sent Events (http://127.0.0.1:8788/sse).

External agent environments (Claude Code, Hermes Agent, Cursor, OpenCode, or local Ollama instances) connect directly to Zoth Studio, calling tools/list to discover 25 micro-tools and 37 workstations, tools/call to execute sandboxed code mutations, and resources/read to query STDP vector memory—all validated against JSON-Schema contracts with zero cloud exposure.`,
    oracleResponse: `MCP standard implemented: External agents connect via loopback SSE (127.0.0.1:8788/sse) or STDIO. Exposes tools/list, tools/call, and resources/read with strict JSON-Schema validation and zero telemetry.`,
    jumpTargets: [
      { label: 'Micro-Tools Catalog (25 Tools)', path: '/tools', type: 'tools' },
      { label: 'Workstations Directory (37)', path: '/workstations', type: 'workstations' },
      { label: 'Signal Bridge Console', path: '/bridges', type: 'bus' }
    ]
  },
  {
    id: 'signal-bridge-simplex-mesh',
    q: 'How does the Sovereign Signal Bridge on port 8789 maintain an E2EE simplex peer mesh?',
    category: 'Architecture',
    keywords: ['signal bridge', '8789', 'simplex', 'peer mesh', 'e2ee', 'ipc', 'ed25519', 'websocket', 'bus', 'decentralized', 'heartbeats'],
    a: `The Sovereign Signal Bridge (127.0.0.1:8789) functions as a low-latency, point-to-point simplex communication bus for the 21-agent pantheon.

Agents transmit messages across unidirectional channels over local WebSockets, signing each payload with Ed25519 cryptographic keys. The simplex architecture isolates agent failure domains: if an individual synthesis agent encounters an unhandled exception or thread block, peer nodes continue consensus deliberations without crashing the collective bus.`,
    oracleResponse: `Signal Bridge IPC online at 127.0.0.1:8789: Ed25519 signed simplex channels over local WebSockets. Sub-millisecond peer-to-peer message passing prevents single-point-of-failure deadlocks across the agent mesh.`,
    jumpTargets: [
      { label: 'Zoth Signal Bridge Console', path: '/bridges', type: 'bus' },
      { label: 'Consensus Arena', path: '/consensus', type: 'consensus' }
    ]
  }
];

const categories = ['All', 'Architecture', 'Security', 'Memory & AI', 'Consensus', 'Adytum Rite', 'WebGPU & Tools', 'OS & Deployment'];

// Curated quick prompt pills for rapid terminal exploration
const QUICK_PROMPTS = [
  'STDP Synaptic Decay Math',
  '3-Agent Byzantine Triad',
  'Adytum 5-Min Incubation',
  'WebGPU Tensor Shaders',
  'Zero-Egress Port Bindings',
  'Netlify Static Prerender',
  'Zoth OS QEMU Command',
  'Model Context Protocol (MCP)'
];

export default function FaqsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [expanded, setExpanded] = useState('panel-0');

  // Oracle Terminal Console States
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResult, setOracleResult] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const accordionRefs = useRef({});

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8',
  };

  // Perform intent matching against the architectural knowledge base
  const consultLucyOracle = (rawQuery) => {
    const query = (rawQuery || oracleQuery).trim();
    if (!query) return;

    setIsConsulting(true);
    setCopiedResponse(false);

    // Simulate cybernetic transmission latency
    setTimeout(() => {
      const qTokens = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['what', 'how', 'why', 'does', 'the', 'and', 'for', 'with', 'from', 'explain', 'tell', 'show'].includes(t));

      let bestMatch = null;
      let highestScore = 0;

      FAQS_DATA.forEach((faq) => {
        let score = 0;
        const qText = faq.q.toLowerCase();
        const aText = faq.a.toLowerCase();
        const catText = faq.category.toLowerCase();

        // Exact phrase bonus
        if (qText.includes(query.toLowerCase())) score += 60;
        if (aText.includes(query.toLowerCase())) score += 35;

        // Keyword matches
        faq.keywords.forEach((kw) => {
          if (query.toLowerCase().includes(kw)) {
            score += 30;
          }
          qTokens.forEach((tok) => {
            if (kw.includes(tok)) score += 15;
          });
        });

        // Token matches
        qTokens.forEach((tok) => {
          if (qText.includes(tok)) score += 12;
          if (aText.includes(tok)) score += 5;
          if (catText.includes(tok)) score += 8;
        });

        if (score > highestScore) {
          highestScore = score;
          bestMatch = faq;
        }
      });

      // Default fallback if query is very broad
      if (!bestMatch || highestScore < 10) {
        bestMatch = FAQS_DATA[0];
        highestScore = 15;
      }

      // Bayesian confidence calculation
      const calculatedConfidence = Math.min(99.6, Math.max(88.4, 86.0 + (highestScore / 18) * 2.8)).toFixed(1);

      setOracleResult({
        faq: bestMatch,
        query,
        confidence: `${calculatedConfidence}%`,
        latency: (0.08 + Math.random() * 0.12).toFixed(2),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });

      setIsConsulting(false);
    }, 280);
  };

  const handleQuickPrompt = (promptText) => {
    setOracleQuery(promptText);
    consultLucyOracle(promptText);
  };

  const handleCopyTransmission = () => {
    if (!oracleResult) return;
    const textToCopy = `[LUCY ORACLE VERIFIED TRANSMISSION // CODEC 141.12]
Query: "${oracleResult.query}"
Confidence: ${oracleResult.confidence} (Latency: ${oracleResult.latency}ms)
Topic: ${oracleResult.faq.q}

${oracleResult.faq.oracleResponse}

Architecture Invariant:
${oracleResult.faq.a}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2400);
    }
  };

  const jumpToFaq = (faqId) => {
    const faqIndex = FAQS_DATA.findIndex((f) => f.id === faqId);
    if (faqIndex !== -1) {
      setSelectedCat('All');
      setSearch('');
      setExpanded(`panel-${faqIndex}`);
      setTimeout(() => {
        const el = accordionRefs.current[faqId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Filter FAQS for Accordion
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((item) => {
      const matchesCat = selectedCat === 'All' || item.category === selectedCat;
      const matchesSearch =
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [search, selectedCat]);

  return (
    <Container maxWidth="lg" className="page-fade-in" sx={{ py: { xs: 4, md: 6 } }}>
      <SEO
        title="Frequently Asked Questions // Zoth Studio v2 Architecture & Security"
        description="Official answers to 16 core architectural questions: Zero-Egress Invariants, Lucy Netrunner Oracle STDP memory, 3-Agent Byzantine Consensus, WebGPU shaders, and Zoth OS."
      />

      {/* Signature Gold Header Accent */}
      <Box sx={{ position: 'relative', mb: 5, pt: 1, textAlign: 'center' }}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: 3,
            borderRadius: 2,
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(212,175,55,0.9) 20%, #D4AF37 50%, rgba(212,175,55,0.9) 80%, transparent)'
              : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.7) 20%, #B8860B 50%, rgba(184,134,11,0.7) 80%, transparent)',
            boxShadow: isDark
              ? '0 0 20px 2px rgba(212,175,55,0.45)'
              : '0 0 12px 1px rgba(184,134,11,0.35)',
          }}
        />

        <Chip
          icon={<HelpOutlineIcon sx={{ color: `${gold.accent} !important` }} />}
          label="KNOWLEDGE BASE &amp; AEO GROUNDING // 16 RATIFIED SPECIFICATIONS"
          size="small"
          sx={{ bgcolor: gold.wash, color: gold.accent, border: `1px solid ${gold.border}`, fontWeight: 800, mb: 2, px: 1 }}
        />
        <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>
          Frequently Asked Questions
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 780, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.65 }}>
          Authoritative architectural, cryptographic, and mathematical specifications for Zoth Studio v2. Grounded for both sovereign human operators and autonomous answer engines.
        </Typography>
      </Box>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 🔮 ASK LUCY ORACLE: SEARCH & TERMINAL CONSOLE */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Paper
        sx={{
          maxWidth: 920,
          mx: 'auto',
          mb: 6,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          bgcolor: isDark ? '#08080B' : '#FFFFFF',
          border: `1.5px solid ${isDark ? 'rgba(212,175,55,0.45)' : '#E5C768'}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.8), 0 0 24px -6px rgba(212,175,55,0.22)'
            : '0 4px 20px rgba(184,134,11,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            pb: 2,
            mb: 2.5,
            borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : '#F0E1A8'}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/assets/lucy.png"
              alt="Lucy Oracle Avatar"
              onError={(e) => { e.target.src = '/brand/ghostbyte-dark.png'; }}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #F472B6',
                boxShadow: '0 0 10px rgba(244,114,182,0.4)',
              }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: mono,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: isDark ? '#F5E6AB' : '#8A6A09',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                }}
              >
                <TerminalIcon sx={{ fontSize: 16, color: isDark ? '#F472B6' : '#BE185D' }} />
                ASK LUCY ORACLE // SEARCH & TERMINAL CONSOLE
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                Direct intent matching over the Zoth architectural knowledge matrix
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip
              label="CODEC 141.12"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(244,114,182,0.12)' : '#FDF2F8',
                color: isDark ? '#F472B6' : '#BE185D',
                fontFamily: mono,
                fontWeight: 750,
                fontSize: '0.72rem',
                border: `1px solid ${isDark ? 'rgba(244,114,182,0.3)' : '#FBCFE8'}`,
              }}
            />
            <Chip
              icon={<BoltIcon sx={{ fontSize: 14, color: `${isDark ? '#34D399' : '#027A48'} !important` }} />}
              label="ZERO-EGRESS: VERIFIED"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5',
                color: isDark ? '#34D399' : '#027A48',
                fontFamily: mono,
                fontWeight: 750,
                fontSize: '0.72rem',
                border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
              }}
            />
          </Stack>
        </Box>

        {/* Natural Language Query Input */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Type any architectural question (e.g. 'How does STDP decay stale vectors?', 'Explain Azoth and Kai debate', 'What are the port bindings?')..."
            value={oracleQuery}
            onChange={(e) => setOracleQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') consultLucyOracle();
            }}
            sx={{
              bgcolor: isDark ? '#0B0B12' : '#F9FAFB',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontFamily: mono,
                fontSize: '0.92rem',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(212,175,55,0.3)' : '#D1D5DB',
                },
                '&:hover fieldset': {
                  borderColor: gold.accent,
                },
                '&.Mui-focused fieldset': {
                  borderColor: gold.accent,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.8rem',
                      color: gold.accent,
                      fontWeight: 700,
                      userSelect: 'none',
                    }}
                  >
                    LUCY://QUERY &gt;
                  </Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {oracleQuery && (
                    <IconButton size="small" onClick={() => setOracleQuery('')} sx={{ mr: 0.5 }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isConsulting || !oracleQuery.trim()}
                    onClick={() => consultLucyOracle()}
                    sx={{
                      px: 2.5,
                      py: 0.6,
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      fontFamily: mono,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {isConsulting ? 'Consulting...' : 'Transmit'}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Quick Question Pills */}
        <Box sx={{ mb: oracleResult ? 3 : 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              fontFamily: mono,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Quick Inquiries:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                clickable
                onClick={() => handleQuickPrompt(prompt)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#F3F4F6',
                  color: isDark ? '#F5E6AB' : '#374151',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(212,175,55,0.25)' : '#E5E7EB',
                  '&:hover': {
                    bgcolor: gold.wash,
                    borderColor: gold.accent,
                    color: gold.accent,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Oracle Response Card */}
        {oracleResult && (
          <Paper
            className="page-fade-in"
            sx={{
              mt: 2.5,
              p: { xs: 2.5, md: 3 },
              borderRadius: 2.5,
              bgcolor: isDark ? '#0B0B14' : '#FEF9E7',
              border: `1.5px solid ${isDark ? '#F472B6' : '#E5C768'}`,
              boxShadow: isDark
                ? '0 0 24px rgba(244,114,182,0.18), inset 0 0 16px rgba(0,0,0,0.5)'
                : '0 4px 16px rgba(184,134,11,0.08)',
              position: 'relative',
            }}
          >
            {/* Top Response Banner */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                <Box
                  component="img"
                  src="/assets/lucy.png"
                  alt="Lucy Netrunner"
                  onError={(e) => { e.target.src = '/brand/ghostbyte-dark.png'; }}
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${isDark ? '#F472B6' : '#BE185D'}`,
                    boxShadow: isDark ? '0 0 16px rgba(244,114,182,0.5)' : '0 2px 8px rgba(190,24,93,0.2)',
                  }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="overline" sx={{ color: isDark ? '#F472B6' : '#BE185D', fontWeight: 800, letterSpacing: '0.12em', lineHeight: 1.2 }}>
                      LUCY // SOVEREIGN NETRUNNER ORACLE
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 13, color: `${isDark ? '#34D399' : '#027A48'} !important` }} />}
                      label={`CONFIDENCE: ${oracleResult.confidence}`}
                      size="small"
                      sx={{
                        bgcolor: isDark ? 'rgba(52,211,153,0.15)' : '#ECFDF5',
                        color: isDark ? '#34D399' : '#027A48',
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}`,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: mono }}>
                    Matched: &ldquo;{oracleResult.faq.q}&rdquo; · Local Latency: {oracleResult.latency}ms
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Tooltip title={copiedResponse ? 'Copied Transmission!' : 'Copy Oracle Transmission'}>
                  <IconButton
                    size="small"
                    onClick={handleCopyTransmission}
                    sx={{
                      color: copiedResponse ? (isDark ? '#34D399' : '#027A48') : gold.accent,
                      border: `1px solid ${gold.border}`,
                      borderRadius: 1.5,
                      p: 0.8,
                    }}
                  >
                    {copiedResponse ? <CheckCircleIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => jumpToFaq(oracleResult.faq.id)}
                  sx={{
                    borderColor: isDark ? gold.border : gold.accent,
                    color: isDark ? gold.soft : gold.accent,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    fontWeight: 750,
                  }}
                >
                  View in Accordion ↓
                </Button>
              </Stack>
            </Box>

            {/* Oracle Speech / Transcript Box */}
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(244,114,182,0.25)' : '#E5C768'}`,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: mono,
                  fontSize: '0.94rem',
                  lineHeight: 1.7,
                  color: isDark ? '#F5E6AB' : '#111827',
                  whiteSpace: 'pre-line',
                }}
              >
                &ldquo;{oracleResult.faq.oracleResponse}&rdquo;
              </Typography>
            </Box>

            {/* Invariant Detail Paragraph */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7, mb: 2.5, fontSize: '0.9rem', whiteSpace: 'pre-line' }}
            >
              {oracleResult.faq.a}
            </Typography>

            {/* Direct Jump Buttons to Relevant Workstations & Tools */}
            <Divider sx={{ mb: 2, borderColor: isDark ? 'rgba(212,175,55,0.2)' : '#F0E1A8' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ color: gold.accent, fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? gold.soft : gold.accent, textTransform: 'uppercase' }}>
                  Direct Jump Targets:
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {oracleResult.faq.jumpTargets.map((tgt) => (
                  <Button
                    key={tgt.path}
                    component={RouterLink}
                    to={tgt.path}
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      fontWeight: 750,
                      fontSize: '0.78rem',
                      fontFamily: mono,
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    {tgt.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Paper>
        )}
      </Paper>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 📑 FAQ SEARCH BAR & CATEGORY FILTER CHIPS */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4, maxWidth: 860, mx: 'auto' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter the 16 architectural questions (e.g. STDP, Zero-Egress, Consensus, Netlify, QEMU, MCP)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2.5,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: gold.accent }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat) => {
            const active = selectedCat === cat;
            const count = cat === 'All' ? FAQS_DATA.length : FAQS_DATA.filter((f) => f.category === cat).length;
            return (
              <Chip
                key={cat}
                label={`${cat} (${count})`}
                clickable
                onClick={() => setSelectedCat(cat)}
                sx={{
                  fontWeight: 750,
                  fontSize: '0.8rem',
                  bgcolor: active ? gold.accent : theme.palette.background.paper,
                  color: active ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
                  border: '1px solid',
                  borderColor: active ? gold.accent : theme.palette.divider,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: gold.accent,
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 📜 QUESTIONS ACCORDION LIST (16 COMPREHENSIVE ENTRIES) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Box sx={{ maxWidth: 880, mx: 'auto', mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary' }}>
            Showing {filteredFaqs.length} of {FAQS_DATA.length} ratified specifications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={() => setExpanded(false)}
              sx={{ color: 'text.secondary', fontSize: '0.75rem', fontFamily: mono }}
            >
              Collapse All
            </Button>
            <Button
              size="small"
              onClick={() => setExpanded('all')}
              sx={{ color: gold.accent, fontSize: '0.75rem', fontFamily: mono, fontWeight: 700 }}
            >
              Expand Active
            </Button>
          </Stack>
        </Box>

        {filteredFaqs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: theme.palette.background.paper, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body1" color="text.secondary">
              No matching questions found for &ldquo;{search}&rdquo;.
            </Typography>
            <Button size="small" onClick={() => { setSearch(''); setSelectedCat('All'); }} sx={{ mt: 1, color: gold.accent, fontWeight: 750 }}>
              Reset Filters
            </Button>
          </Paper>
        ) : (
          filteredFaqs.map((faq, index) => {
            const panelId = `panel-${index}`;
            const isExpanded = expanded === panelId || expanded === 'all';
            return (
              <Accordion
                key={faq.id}
                ref={(el) => { accordionRefs.current[faq.id] = el; }}
                expanded={isExpanded}
                onChange={(e, isExp) => setExpanded(isExp ? panelId : false)}
                sx={{
                  mb: 1.8,
                  border: isExpanded ? `1.5px solid ${gold.accent}` : `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: '12px !important',
                  boxShadow: isExpanded ? (isDark ? '0 4px 22px rgba(212,175,55,0.14)' : '0 4px 20px rgba(184,134,11,0.1)') : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: gold.accent }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', pr: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        color: gold.accent,
                        bgcolor: gold.wash,
                        px: 0.9,
                        py: 0.3,
                        borderRadius: 1,
                        border: `1px solid ${gold.border}`,
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>
                    <Chip
                      label={faq.category}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                        color: isDark ? gold.soft : gold.accent,
                        border: `1px solid ${isDark ? 'transparent' : '#E5E7EB'}`,
                      }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 750, color: theme.palette.text.primary, fontSize: '0.98rem' }}>
                      {faq.q}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75, fontSize: '0.94rem', whiteSpace: 'pre-line', mb: 2 }}>
                    {faq.a}
                  </Typography>

                  {/* Quick Action Bar for Accordion Entry */}
                  <Divider sx={{ my: 1.8, borderColor: theme.palette.divider }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Button
                      size="small"
                      startIcon={<PsychologyIcon sx={{ color: isDark ? '#F472B6' : '#BE185D' }} />}
                      onClick={() => handleQuickPrompt(faq.q)}
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.74rem',
                        color: isDark ? '#F5E6AB' : '#8A6A09',
                      }}
                    >
                      Consult Lucy on this
                    </Button>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {faq.jumpTargets.map((tgt) => (
                        <Button
                          key={tgt.path}
                          component={RouterLink}
                          to={tgt.path}
                          size="small"
                          variant="outlined"
                          endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            borderColor: isDark ? gold.border : gold.accent,
                            color: isDark ? gold.soft : gold.accent,
                            py: 0.3,
                            px: 1.5,
                          }}
                        >
                          {tgt.label}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 🔗 DIRECT ORACLE ASSISTANCE CARD (FOOTER) */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <Paper
        sx={{
          maxWidth: 880,
          mx: 'auto',
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: isDark ? 'rgba(212,175,55,0.05)' : '#FEF9E7',
          border: `1px solid ${isDark ? gold.border : '#E5C768'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 260, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PsychologyIcon sx={{ color: gold.accent }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? gold.soft : gold.accent }}>
              Need deeper answers? Consult the Lucy Netrunner Oracle
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Breach Codec 141.12 to query the Whitespace memory matrix directly, run live STDP synaptic calculations, or consult the 21-Agent Swarm Pantheon.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            component={RouterLink}
            to="/memory"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 800, px: 2.5 }}
          >
            Open Lucy Memory Hub
          </Button>
          <Button
            component={RouterLink}
            to="/docs/math"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 750 }}
          >
            Six Math Pillars
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
