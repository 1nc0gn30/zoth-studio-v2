/**
 * Zoth Studio v2 - Sovereign Workstations & Cockpits Matrix
 *
 * Taxonomical Classification:
 * - 'cockpit': Multi-pane developer IDEs & visual operational cockpits for human-agent engineering.
 * - 'integrated_tool': Standalone sovereign micro-tools and CLI utilities available in the Tool Arsenal.
 * - 'enclave_daemon': Core hardware-anchored zero-egress daemons running on local loopback.
 */

export const workstations = [
  // ==========================================
  // 1. STUDIO COCKPITS & DEVELOPER IDES
  // ==========================================
  {
    id: "cockpit",
    name: "The Cockpit // Sovereign Operator Command",
    path: "/workstations/cockpit",
    band: "Swarm & Consensus",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open cockpit",
    description: "Hybrid operator command deck aggregating live loopback host telemetry (CPU %, loadavg, RAM, disk, thermal sensors, GPU), 91-port fleet health board, 85-tool / 45-workstation fuzzy Command Palette, and sanitized diagnostic exports with honest offline browser fallback.",
    alsoInApp: "/workstations/cockpit"
  },
  {
    id: "ide",
    name: "Sovereign Operator IDE & Code Foundry",
    path: "/workstations/ide",
    band: "Build",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open ide",
    description: "Hybrid zero-egress code workstation combining a multi-file browser editor, multi-language AST/symbol outline extractor, deterministic static security and hygiene linter, LCS unified diff/patch workbench, pure recursive-descent expression evaluator (zero eval), and read-only loopback :3000 host toolchain and ~/NullAITech/ file inspection.",
    alsoInApp: "/workstations/ide"
  },
  {
    id: "agent-composer",
    name: "Multi-Agent DAG Composer & Pipeline Foundry",
    path: "/workstations/agent-composer",
    band: "Build",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.2.0",
    pullCommand: "zoth open agent-composer",
    description: "Visual directed-acyclic-graph (DAG) builder and topological wave runner wiring Ollama (:11434), AGY-Hermes (:18000), Azoth (:8136), Neuro-Memory (:8094), and deterministic JS transforms.",
    alsoInApp: "/workstations/agent-composer"
  },
  {
    id: "mission-control",
    name: "Zoth Mission Control & Fleet Dispatcher",
    path: "/workstations/mission-control",
    band: "Swarm & Consensus",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.5.0",
    pullCommand: "zoth open mission-control",
    description: "Hybrid fleet supervisor unifying live 91-port loopback telemetry (/api/studio/fleet), core daemon status (/api/studio/status), read-only Hermes Agent Gateway & WebChat observability, Konsole Relay posture, deterministic Kahn Mission DAG/runbook scheduling, PBFT quorum verification (N >= 3f + 1), and formula-safe JSON/Markdown/CSV/YAML exports with honest browser offline fallback.",
    alsoInApp: "/workstations/mission-control"
  },
  {
    id: "models",
    name: "Zoth AI Model Foundry & Spirit Matrix Pro",
    path: "/studio/models.html",
    band: "Observe",
    type: "cockpit",
    description: "Local model manager with live GGUF, Ollama, vLLM, and LM Studio provider routing.",
    alsoInApp: "/workstations/models"
  },
  {
    id: "ax-powerhouse",
    name: "Zoth AX Powerhouse & Contract Studio",
    path: "/workstations/ax-powerhouse",
    band: "Build",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open ax-powerhouse",
    description: "Live Agent Experience (AX) endpoint auditor, 6-spec machine contract validator (llms.txt, ai.txt, robots.txt, mcp.json, agent.json, Schema.org JSON-LD), and downloadable AX bundle compiler.",
    alsoInApp: "/workstations/ax-powerhouse"
  },
  {
    id: "cyberpunk-hud",
    name: "Cyberpunk Telemetry HUD Cockpit",
    path: "/workstations/cyberpunk-hud",
    band: "Swarm & Consensus",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open cyberpunk-hud",
    description: "Hybrid cybernetic telemetry HUD aggregating live loopback host sensors, core daemons, and 91-port p50/p95 RTT packet streams on :3000 alongside a 100% client-side Shannon entropy analyzer, FIPS 180-4 SHA-256 frame receipts, and honest browser offline telemetry fallback.",
    alsoInApp: "/workstations/cyberpunk-hud"
  },
  {
    id: "chronicle",
    name: "Zoth Chronicle Hub & Engineering Horizon",
    path: "/workstations/chronicle",
    band: "Observe",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open chronicle",
    description: "Hybrid conversation continuity vault (:8161 proxy), browser JSONL/Markdown transcript analyzer, friction pattern radar, and Studio release chronicle.",
    alsoInApp: "/workstations/chronicle"
  },
  {
    id: "notes-reviewer",
    name: "Zoth Visual Notes & Agent Reviewer",
    path: "/studio/notes-reviewer.html",
    band: "Observe",
    type: "cockpit",
    description: "Multi-agent markdown knowledge extraction, synthesis review, and consensus diffs.",
    alsoInApp: "/workstations/notes-reviewer"
  },
  {
    id: "brand",
    name: "Zoth Studio Brand Assets & Alchemical Seals Kit",
    path: "/workstations/brand",
    band: "Studio",
    type: "cockpit",
    executionType: "browser",
    version: "2.3.0",
    pullCommand: "zoth open brand",
    description: "Parametric alchemical seal vector forge, cyber-sigils, official studio emblems, and Editorial Ivory + Obsidian Gold dual-theme design token system.",
    alsoInApp: "/workstations/brand"
  },
  {
    id: "vision-link",
    name: "Zoth Vision Link Multimodal Inspector",
    path: "/studio/vision-link.html",
    band: "Spatial",
    type: "cockpit",
    description: "Spatial image diagnostics, layout segmentation, and camera gesture visualizer.",
    alsoInApp: "/workstations/vision-link"
  },
  {
    id: "web3-hub",
    name: "Web3 Sovereign Bridge & Solana Swarm Tracker",
    path: "/studio/web3-hub.html",
    band: "Security",
    type: "cockpit",
    description: "On-chain state auditor, decentralized ledger bridge, and Solana agent wallet monitor.",
    alsoInApp: "/workstations/web3-hub"
  },
  {
    id: "github-tool",
    name: "Zoth GitHub Studio & Autonomous Repo Workstation",
    path: "/workstations/github-tool",
    band: "Build",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open github-tool",
    description: "Hybrid dual-org GitHub Ops workstation probing local git/gh/gpg/ssh toolchains and ~/NullAITech/ dual-org (NullAITech + 1nc0gn30) repository parity over loopback :3000 with zero token reads, paired with 100% offline browser git status/remote auditing, Conventional Commit release synthesis, GitHub Actions CI-gate linting, and SSH/GPG commit-signing playbook generation.",
    alsoInApp: "/workstations/github-tool"
  },
  {
    id: "edge-forge",
    name: "Zoth Edge Forge & Micro-Kernel Sandbox",
    path: "/workstations/edge-forge",
    band: "Build",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open edge-forge",
    description: "In-browser WebAssembly 1.0 binary assembler and live executor, multi-target Netlify/Cloudflare/WASI/OCI/KVM forge, and live :3000 host toolchain probe.",
    alsoInApp: "/workstations/edge-forge"
  },
  {
    id: "netlify-ax",
    name: "Zoth Netlify AX & Serverless Edge Console",
    path: "/studio/netlify-ax.html",
    band: "Build",
    type: "cockpit",
    description: "Automated edge function deployment, static asset verifier, and production harden pipeline.",
    alsoInApp: "/workstations/netlify-ax"
  },

  // ==========================================
  // 2. INTEGRATED SOVEREIGN TOOLS (In Tool Arsenal)
  // ==========================================
  {
    id: "webgen",
    name: "Zoth Bolt",
    path: "/tools/zoth-bolt",
    band: "Build",
    type: "integrated_tool",
    description: "Zoth Bolt — the bolt.diy fork (1nc0gn30/zoth-webgen): full-stack AI web & motion architect on :5173 with local Ollama, agents, and live WebContainers.",
    alsoInApp: "/tools/zoth-bolt",
    toolRepoId: "zoth-bolt",
    pullCommand: "git clone https://github.com/1nc0gn30/zoth-webgen.git bolt.diy && cd bolt.diy && pnpm install"
  },
  {
    id: "omnipost",
    name: "OmniPost Multi-Platform Social Engine",
    path: "/studio/omnipost.html",
    band: "Spatial",
    type: "integrated_tool",
    description: "Multi-platform content preview synthesizer and scheduler with live character validation.",
    alsoInApp: "/tools/omnipost-social-engine",
    toolRepoId: "omnipost-social-engine",
    pullCommand: "npx @nullaitech/zoth pull omnipost-social-engine"
  },
  {
    id: "subsweep",
    name: "Zoth SubSweep Surface Scanner",
    path: "/studio/subsweep.html",
    band: "Security",
    type: "integrated_tool",
    description: "Local subnet recon probe, port scanner, and zero-egress OSINT lead discovery.",
    alsoInApp: "/tools/subsweep-lead-scanner",
    toolRepoId: "subsweep-lead-scanner",
    pullCommand: "npx @nullaitech/zoth pull subsweep-lead-scanner"
  },
  {
    id: "agent-egress-sentinel",
    name: "Agent Egress Sentinel // Kinetic Network Radar",
    path: "/tools/agent-egress-sentinel",
    band: "Security",
    type: "integrated_tool",
    executionType: "local-daemon",
    description: "Zero-dependency Python userspace HTTP/HTTPS egress proxy (:8195), pre-relay TLS SNI inspector, SSRF guard, and live domain radar (:8095).",
    alsoInApp: "/tools/agent-egress-sentinel",
    toolRepoId: "agent-egress-sentinel",
    pullCommand: "agent-egress-sentinel serve --web-port 8095 --proxy-port 8195"
  },
  {
    id: "audiocipher-stego-engine",
    name: "AudioCipher Stego Studio // Acoustic Cipher & BFSK Modem",
    path: "/tools/audiocipher-stego-engine",
    band: "Security",
    type: "integrated_tool",
    executionType: "hybrid",
    version: "2.6.0",
    description: "Zero-egress loopback daemon (:8096) & hybrid browser workstation for v2 key-separated acoustic cryptography, 16-bit PCM WAV LSB stego, forensic steganalysis, DTMF/Morse DSP, BFSK air-gap modem, and 9-tool stdio MCP.",
    alsoInApp: "/tools/audiocipher-stego-engine",
    toolRepoId: "audiocipher-stego-engine",
    pullCommand: "audiocipher-stego-engine serve --host 127.0.0.1 --port 8096"
  },
  {
    id: "badge3d-coin-generator",
    name: "Badge3D Coin Generator // Parametric 3D Mint & G-Code Slicer",
    path: "/tools/badge3d-coin-generator",
    band: "Spatial",
    type: "integrated_tool",
    executionType: "hybrid",
    version: "2.6.0",
    description: "Zero-egress loopback workstation (:8084) & WebGL studio for watertight 2-manifold Binary STL/OBJ/GLB coin synthesis, SHA-256 rim security stamps, RepRap/Marlin G-code slicing, and 9-tool stdio MCP.",
    alsoInApp: "/tools/badge3d-coin-generator",
    toolRepoId: "badge3d-coin-generator",
    pullCommand: "python3 server.py --host 127.0.0.1 --port 8084"
  },
  {
    id: "agent-mock-twin",
    name: "Agent Mock Twin // Deterministic API Replay",
    path: "/tools/agent-mock-twin",
    band: "Build",
    type: "integrated_tool",
    executionType: "local-daemon",
    description: "Autonomous offline API mock daemon (127.0.0.1:8097) with HAR/OpenAPI {param} matching, SQLite WAL storage, live chaos controls, and 4-tool stdio MCP.",
    alsoInApp: "/tools/agent-mock-twin",
    toolRepoId: "agent-mock-twin",
    pullCommand: "agent-mock-twin serve --host 127.0.0.1 --port 8097"
  },
  {
    id: "agent-prompt-firewall",
    name: "Agent Prompt Firewall // Inline Defense & Radar",
    path: "/tools/agent-prompt-firewall",
    band: "Security",
    type: "integrated_tool",
    executionType: "local-daemon",
    description: "Zero-dependency Python inline LLM security proxy (:8198), pre-storage PII/secret redactor, SHA-256 hash-chained SQLite WAL audit ledger, SSE threat radar (:8098), and 4-tool stdio MCP server.",
    alsoInApp: "/tools/agent-prompt-firewall",
    toolRepoId: "agent-prompt-firewall",
    pullCommand: "agent-prompt-firewall serve --host 127.0.0.1 --web-port 8098 --proxy-port 8198"
  },
  {
    id: "agent-flight-recorder",
    name: "Agent Flight Recorder // Black Box Forensics",
    path: "/tools/agent-flight-recorder",
    band: "Observe",
    type: "integrated_tool",
    description: "Local Python daemon (127.0.0.1:8104) with SHA-256 hash-chained SQLite WAL storage, live SSE time-scrubbing cockpit, 4-tool stdio MCP server, and offline HTML/JSON/CSV/Markdown exports.",
    alsoInApp: "/tools/agent-flight-recorder",
    toolRepoId: "agent-flight-recorder",
    pullCommand: "agent-flight-recorder serve --port 8104"
  },
  {
    id: "agent-capsule-jail",
    name: "Agent Capsule Jail // Kernel Sandbox & Isolation",
    path: "/tools/agent-capsule-jail",
    band: "Security",
    type: "integrated_tool",
    description: "Runs agent commands inside a Linux bubblewrap namespace jail with timeout, memory and process caps, secret-stripped environment, and a SHA-256 receipt per run (local daemon on 127.0.0.1:8105).",
    alsoInApp: "/tools/agent-capsule-jail",
    toolRepoId: "agent-capsule-jail",
    pullCommand: "agent-capsule-jail serve --port 8105"
  },
  {
    id: "agent-policy-auditor",
    name: "Agent Policy Auditor // Capability Leaser & Broker",
    path: "/tools/agent-policy-auditor",
    band: "Security",
    type: "integrated_tool",
    description: "Local Python daemon (127.0.0.1:8106) and 4-tool stdio MCP server issuing HMAC-SHA256 time-bound capability leases, SQLite WAL audit trails, path-traversal guards, and OWASP LLM manifest security auditing.",
    alsoInApp: "/tools/agent-policy-auditor",
    toolRepoId: "agent-policy-auditor",
    pullCommand: "agent-policy-auditor serve --port 8106"
  },
  {
    id: "etsy-pod-forge",
    name: "Etsy POD Forge // Print-on-Demand Studio",
    path: "/tools/etsy-pod-forge",
    band: "Build",
    type: "integrated_tool",
    description: "Local 300-DPI Print-on-Demand canvas generator across 5 cadres, lifestyle mockup compositor, 13-tag SEO & 0%/12%/15% Offsite Ads margin studio, 53-recipe prompt vault, and 6 stdio MCP tools.",
    alsoInApp: "/tools/etsy-pod-forge",
    toolRepoId: "etsy-pod-forge",
    pullCommand: "etsy-pod-forge serve --port 8107"
  },
  {
    id: "etsy-connector",
    name: "Etsy Connector // Open API v3 & MCP Bridge",
    path: "/tools/etsy-connector",
    band: "Observe",
    type: "integrated_tool",
    description: "Etsy Open API v3 & Antigravity MCP bridge with 13-tag SEO auditor, 0%/12%/15% Offsite Ads fee/break-even engine, Printify & Gelato POD payloads, and 8 stdio MCP tools.",
    alsoInApp: "/tools/etsy-connector",
    toolRepoId: "etsy-connector",
    pullCommand: "etsy-connector serve --port 8108"
  },
  {
    id: "mcp-lens",
    name: "MCP Lens // Traffic Sniffer & Token Auditor",
    path: "/tools/mcp-lens",
    band: "Observe",
    type: "integrated_tool",
    description: "Zero-dependency Python 3.10+ stdio/SSE traffic sniffer, BPE token weight auditor, schema minifier, Dual-Theme Web Cockpit (:8109), and 6-tool stdio MCP server.",
    alsoInApp: "/tools/mcp-lens",
    toolRepoId: "mcp-lens",
    pullCommand: "mcp-lens serve --port 8109"
  },
  {
    id: "agent-budget-sentinel",
    name: "Agent Budget Sentinel // Token Cost Circuit Breaker",
    path: "/studio/budget-sentinel.html",
    band: "Observe",
    type: "integrated_tool",
    description: "Autonomous zero-dependency spending guardrail, real-time token cost circuit breaker, and runaway loop interceptor.",
    alsoInApp: "/tools/agent-budget-sentinel",
    toolRepoId: "agent-budget-sentinel",
    pullCommand: "./bin/agent-budget serve --web-port 8110 --proxy-port 8111"
  },
  {
    id: "agent-gods-eye",
    name: "Agent God's Eye // OSINT Planetary Threat Radar",
    path: "/tools/agent-gods-eye",
    band: "Security",
    type: "integrated_tool",
    description: "Local Python 3.10+ Shodan OSINT tactical radar daemon (:8112) with SSRF/IP guards, dual-theme 3D planetary globe, live SSE stream, and stdio MCP server.",
    alsoInApp: "/tools/agent-gods-eye",
    toolRepoId: "agent-gods-eye",
    pullCommand: "./bin/agent-gods-eye serve --port 8112"
  },
  {
    id: "shopify-connector",
    name: "Shopify Connector // GraphQL Admin & POD Sync Engine",
    path: "/studio/shopify-connector.html",
    band: "Observe",
    type: "integrated_tool",
    description: "Shopify GraphQL Admin & Antigravity MCP bridge with Etsy-to-Shopify transpiler, profit margin calculator, and draft publisher.",
    alsoInApp: "/tools/shopify-connector",
    toolRepoId: "shopify-connector",
    pullCommand: "./bin/shopify-connector serve --port 8113"
  },
  {
    id: "agent-voice-call",
    name: "Agent Voice Call // Local-First Voice Station (:8114)",
    path: "/tools/agent-voice-call",
    band: "Studio",
    type: "integrated_tool",
    description: "Zero-dependency Python 3.9+ local-first voice calling daemon (:8114), 6 personas, 0600 persisted debriefs, and 4-tool stdio MCP server.",
    alsoInApp: "/voice",
    toolRepoId: "agent-voice-call",
    pullCommand: "./bin/agent-voice-call serve --port 8114"
  },
  {
    id: "printify-connector",
    name: "Printify Connector // Open API v1 & 20% Premium Margin Engine",
    path: "/studio/printify-connector.html",
    band: "Build",
    type: "integrated_tool",
    description: "Autonomous zero-dependency Printify Open API v1 connector, 20% Premium margin calculator, artwork DPI auditor, and Antigravity MCP suite.",
    alsoInApp: "/tools/printify-connector",
    toolRepoId: "printify-connector",
    pullCommand: "./bin/printify-connector serve --port 8115"
  },
  {
    id: "gelato-connector",
    name: "Gelato Connector // 10-Hub Local POD Router",
    path: "/tools/gelato-connector",
    band: "Build",
    type: "integrated_tool",
    description: "Zero-dependency Gelato Product v3 & Order v4 API connector, 10 Bundled Local Hubs print router, FX-safe multi-currency margin engine, 300-DPI auditor, and 6-tool MCP suite.",
    alsoInApp: "/tools/gelato-connector",
    toolRepoId: "gelato-connector",
    pullCommand: "gelato-connector serve --host 127.0.0.1 --port 8116"
  },
  {
    id: "pod-smart-router",
    name: "POD Smart Router // Printify vs Gelato Arbitrage Engine",
    path: "/studio/pod-smart-router.html",
    band: "Build",
    type: "integrated_tool",
    description: "Autonomous multi-channel POD routing engine, landed cost comparator, and automated customs & tariff avoidance shield.",
    alsoInApp: "/tools/pod-smart-router",
    toolRepoId: "pod-smart-router",
    pullCommand: "./bin/pod-smart-router server --port 8117"
  },
  {
    id: "digital-asset-forge",
    name: "Digital Asset Forge // 300 DPI Wall Art Pack Generator",
    path: "/studio/digital-asset-forge.html",
    band: "Build",
    type: "integrated_tool",
    description: "High-resolution 300 DPI multi-ratio art pack generator, 20MB Etsy ZIP split optimizer, and automated customer printing guide synthesizer.",
    alsoInApp: "/tools/digital-asset-forge",
    toolRepoId: "digital-asset-forge",
    pullCommand: "./bin/digital-asset-forge server --port 8118"
  },
  {
    id: "pod-mockup-forge",
    name: "POD Mockup Forge // 60fps Lumen Matrix & Etsy Photo Auditor",
    path: "/studio/pod-mockup-forge.html",
    band: "Build",
    type: "integrated_tool",
    description: "Multi-product photorealistic vector SVG mockup compositor, dynamic lighting and shadows, and automated Etsy 2026 photo standards compliance auditor.",
    alsoInApp: "/tools/pod-mockup-forge",
    toolRepoId: "pod-mockup-forge",
    pullCommand: "./bin/pod-mockup-forge server --port 8119"
  },
  {
    id: "pod-margin-sentinel",
    name: "POD Margin Sentinel // Multi-Channel Profit & Break-Even Matrix",
    path: "/studio/pod-margin-sentinel.html",
    band: "Build",
    type: "integrated_tool",
    description: "Autonomous profit margin calculator, reverse target margin solver, 5-platform fee comparator, and coupon discount stress-testing engine.",
    alsoInApp: "/tools/pod-margin-sentinel",
    toolRepoId: "pod-margin-sentinel",
    pullCommand: "./bin/pod-margin-sentinel server --port 8120"
  },
  {
    id: "connectors",
    name: "Connectors Hub // AI Providers, CLI Harnesses & MCP Bridges",
    path: "/workstations/connectors",
    band: "Observe",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    description: "Hybrid loopback Connectors Hub probing local AI inference providers (:18000, :11434, :1234, :8000), CLI agent harnesses (hermes, agy, claude, codex, gemini, opencode), core Zoth bridges, and sanitized local MCP servers across the 85-tool ecosystem with zero-secret-leakage config generation.",
    alsoInApp: "/workstations/connectors",
    pullCommand: "zoth open connectors"
  },

  // ==========================================
  // 3. HARDWARE ENCLAVE DAEMONS (Loopback :8094 / :8989)
  // ==========================================
  {
    id: "hexstrike",
    name: "HEXSTRIKE // Threat & Security Radar",
    path: "/studio/hexstrike.html",
    band: "Security",
    type: "enclave_daemon",
    description: "Offline-capable security sentinel with Shannon entropy audit, CVE matrix, and exploit sandbox.",
    alsoInApp: "/hexstrike"
  },
  {
    id: "netrunner-memory",
    name: "Lucy Oracle Biomorphic Memory Hub",
    path: "/studio/netrunner-memory.html",
    band: "Studio",
    type: "enclave_daemon",
    description: "STDP biomorphic spike-timing vector memory and continuous semantic knowledge graph.",
    alsoInApp: "/memory"
  },
  {
    id: "consensus",
    name: "Byzantine Consensus Battle Arena",
    path: "/workstations/consensus",
    band: "Swarm & Consensus",
    type: "cockpit",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open consensus",
    description: "Hybrid Byzantine Fault Tolerant (N >= 3f + 1, Q = 2f + 1) proposal and unified-diff arbitration workstation with deterministic in-browser multi-agent rubric evaluation, live loopback model dispatch (:18000 AGY-Hermes & :11434 Ollama), FIPS 180-4 SHA-256 Merkle verdict receipts, and sanitized JSON/Markdown/CSV exports.",
    alsoInApp: "/workstations/consensus"
  },
  {
    id: "bus-monitor",
    name: "Zoth Swarm NOC & Signal Bridge",
    path: "/workstations/bus-monitor",
    band: "Swarm & Consensus",
    type: "enclave_daemon",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open bus-monitor",
    description: "Real-time loopback service NOC, measured RTT pinger, Signal Bridge session telemetry, and HKDF-SHA256/HMAC envelope verifier.",
    alsoInApp: "/workstations/bus-monitor"
  },
  {
    id: "math-pillars",
    name: "Six Mathematical Pillars Academy",
    path: "/workstations/math-pillars",
    band: "Observe",
    type: "enclave_daemon",
    executionType: "hybrid",
    version: "2.3.0",
    pullCommand: "zoth open math-pillars",
    description: "Deterministic Six Mathematical Pillars & Byzantine BFT Quorum workstation covering Linear Algebra attention/KV-cache bounds, Multivariable Calculus AdamW & LoRA, Probability & Shannon Entropy/KL divergence, Hessian 2x2 curvature/HVP, clamped Lyapunov dynamics, Neuromorphic STDP (Δw(0)=0), and Byzantine fault bounds (N >= 3f + 1).",
    alsoInApp: "/docs/math"
  }
];
