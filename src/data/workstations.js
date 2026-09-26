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
    path: "/studio/cockpit.html",
    band: "Swarm & Consensus",
    type: "cockpit",
    description: "Master telemetry HUD, real-time agent dispatch status, and unified system overview.",
    alsoInApp: "/workstations/cockpit"
  },
  {
    id: "ide",
    name: "Sovereign Operator IDE & Code Foundry",
    path: "/studio/ide.html",
    band: "Build",
    type: "cockpit",
    description: "Air-gapped full code editor, AST syntax inspection, and multi-agent pair programming.",
    alsoInApp: "/workstations/ide"
  },
  {
    id: "agent-composer",
    name: "Multi-Agent DAG Composer & Pipeline Foundry",
    path: "/studio/agent-composer.html",
    band: "Build",
    type: "cockpit",
    description: "Visual node-graph builder for orchestrating complex multi-agent execution pipelines.",
    alsoInApp: "/workstations/agent-composer"
  },
  {
    id: "mission-control",
    name: "Zoth Mission Control & Fleet Dispatcher",
    path: "/studio/mission-control.html",
    band: "Swarm & Consensus",
    type: "cockpit",
    description: "Fleet supervisor for tracking active subagents, heartbeat telemetry, and queue states.",
    alsoInApp: "/swarm"
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
    path: "/studio/ax-powerhouse.html",
    band: "Build",
    type: "cockpit",
    description: "Agent Experience (AX) machine contract compiler, schema validator, and API forge.",
    alsoInApp: "/workstations/ax-powerhouse"
  },
  {
    id: "cyberpunk-hud",
    name: "Cyberpunk Telemetry HUD Cockpit",
    path: "/studio/cyberpunk-hud.html",
    band: "Swarm & Consensus",
    type: "cockpit",
    description: "High-density cybernetic monitoring cockpit with real-time entropy and packet streams.",
    alsoInApp: "/workstations/cyberpunk-hud"
  },
  {
    id: "chronicle",
    name: "Zoth Chronicle & Engineering Horizon Roadmap",
    path: "/studio/chronicle.html",
    band: "Observe",
    type: "cockpit",
    description: "Milestone timeline, system architecture chronicle, and release telemetry logs.",
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
    path: "/studio/brand.html",
    band: "Studio",
    type: "cockpit",
    description: "Alchemical seal vector forge, cyber-sigils, and dark-theme design token system.",
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
    path: "/studio/github-tool.html",
    band: "Build",
    type: "cockpit",
    description: "Autonomous Git repo management, issue-to-PR pipelines, and commit signer.",
    alsoInApp: "/workstations/github-tool"
  },
  {
    id: "edge-forge",
    name: "Zoth Edge Forge & Micro-Kernel Sandbox",
    path: "/studio/edge-forge.html",
    band: "Build",
    type: "cockpit",
    description: "WASM module packaging, edge container compilation, and bare-metal kernel sandbox.",
    alsoInApp: "/zoth-os"
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
    name: "Zoth WebGen Foundry",
    path: "/studio/webgen.html",
    band: "Build",
    type: "integrated_tool",
    description: "Autonomous multi-framework website generator with 6 production archetypes and MCP integration.",
    alsoInApp: "/webgen",
    toolRepoId: "zoth-webgen",
    pullCommand: "git clone https://github.com/NullAITech/zoth-webgen.git && cd zoth-webgen && python3 webgen_engine.py --help"
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
    pullCommand: "npx zoth pull omnipost-social-engine"
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
    pullCommand: "npx zoth pull subsweep-lead-scanner"
  },
  {
    id: "connectors",
    name: "Zoth Tool Bench & Integration Ecosystem",
    path: "/studio/connectors.html",
    band: "Observe",
    type: "integrated_tool",
    description: "Integration workbench bridging the 21 sovereign micro-repos and MCP contract endpoints.",
    alsoInApp: "/tools",
    toolRepoId: "envguard-secrets-vault",
    pullCommand: "npx zoth tools list"
  },

  // ==========================================
  // 3. HARDWARE ENCLAVE DAEMONS (Loopback :8788)
  // ==========================================
  {
    id: "hexstrike",
    name: "HEXSTRIKE // Threat & Security Radar",
    path: "/studio/hexstrike.html",
    band: "Security",
    type: "enclave_daemon",
    description: "Air-gapped security sentinel with Shannon entropy audit, CVE matrix, and exploit sandbox.",
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
    path: "/studio/consensus.html",
    band: "Swarm & Consensus",
    type: "enclave_daemon",
    description: "3-agent Byzantine AST synthesis arena with deterministic truth arbitration.",
    alsoInApp: "/consensus"
  },
  {
    id: "bus-monitor",
    name: "Zoth Swarm NOC & Signal Bridge",
    path: "/studio/bus-monitor.html",
    band: "Swarm & Consensus",
    type: "enclave_daemon",
    description: "Decentralized agent bus monitor with E2EE WebSocket loopback pinger and NOC telemetry.",
    alsoInApp: "/bridges"
  },
  {
    id: "math-pillars",
    name: "Six Mathematical Pillars Academy",
    path: "/studio/math-pillars.html",
    band: "Observe",
    type: "enclave_daemon",
    description: "Formal mathematical foundations: STDP plasticity, Shannon entropy, and Byzantine fault bounds.",
    alsoInApp: "/docs/math"
  }
];
