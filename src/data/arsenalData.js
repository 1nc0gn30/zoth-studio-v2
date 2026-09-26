/**
 * Zoth Studio v2 - Sovereign Master Arsenal & Unified Catalog
 *
 * Consolidates all Studio Cockpits, Standalone Micro-Tools, and Core Hardware Enclaves
 * into a single unified data matrix with zero duplicates.
 */

import { microTools } from './toolsData';
import { workstations } from './workstations';

// Core Hardware Enclaves (Daemons binding strictly to local loopback :8788)
export const enclaveEntities = [
  {
    id: 'enclave-memory',
    name: 'Lucy Oracle Biomorphic Memory Hub',
    kind: 'enclave',
    band: 'Studio',
    category: 'Swarm & Core',
    target: '/memory',
    description: 'STDP biomorphic spike-timing vector memory and continuous semantic knowledge graph on loopback :8788.',
    badge: 'HARDWARE ENCLAVE',
    status: 'Loopback Active',
    isFlagship: true,
  },
  {
    id: 'enclave-swarm',
    name: '21-Agent Swarm Multiplexer Daemon',
    kind: 'enclave',
    band: 'Swarm & Consensus',
    category: 'Swarm & Core',
    target: '/swarm',
    description: '21-terminal autonomous agent multiplexer daemon with hot-swappable AI harnesses and SSE telemetry.',
    badge: 'HARDWARE ENCLAVE',
    pullCommand: 'git clone https://github.com/NullAITech/zoth-swarm-multiplexer.git && cd zoth-swarm-multiplexer && python3 swarm_cli.py status',
    github: 'https://github.com/NullAITech/zoth-swarm-multiplexer',
    status: 'Loopback Active',
    isFlagship: true,
  },
  {
    id: 'enclave-adytum',
    name: 'Adytum Sanctum Cryptographic Vault',
    kind: 'enclave',
    band: 'Security',
    category: 'Security & Recon',
    target: '/adytum',
    description: 'Hardware-anchored Argon2id KDF & XChaCha20-Poly1305 zero-egress key derivation enclave.',
    badge: 'HARDWARE ENCLAVE',
    status: 'Air-Gap Verified',
    isFlagship: true,
  },
  {
    id: 'enclave-hexstrike',
    name: 'HexStrike // Threat & Security Sentinel',
    kind: 'enclave',
    band: 'Security',
    category: 'Security & Recon',
    target: '/hexstrike',
    description: 'Air-gapped security sentinel with Shannon entropy audit, CVE matrix, and exploit sandbox.',
    badge: 'HARDWARE ENCLAVE',
    github: 'https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal',
    status: 'Zero Telemetry',
    isFlagship: true,
  },
  {
    id: 'enclave-zoth-os',
    name: 'Zoth OS Bare-Metal & KVM Sandbox',
    kind: 'enclave',
    band: 'Build',
    category: 'Autonomous Web',
    target: '/zoth-os',
    description: 'Hardware-isolated Linux KVM hypervisor enclave and WebContainer compilation runtime.',
    badge: 'HARDWARE ENCLAVE',
    status: 'Kernel Isolated',
    isFlagship: true,
  },
  {
    id: 'enclave-consensus',
    name: 'Byzantine Consensus Battle Arena',
    kind: 'enclave',
    band: 'Swarm & Consensus',
    category: 'Swarm & Core',
    target: '/consensus',
    description: '3-agent Byzantine AST synthesis arena with deterministic truth arbitration.',
    badge: 'HARDWARE ENCLAVE',
    github: 'https://github.com/NullAITech/byzantine-consensus-engine',
    status: 'Quorum Verified',
    isFlagship: true,
  },
  {
    id: 'enclave-bridges',
    name: 'Sovereign Signal Bridges & NOC Monitor',
    kind: 'enclave',
    band: 'Swarm & Consensus',
    category: 'Swarm & Core',
    target: '/bridges',
    description: 'Decentralized agent bus monitor with E2EE WebSocket loopback pinger and NOC telemetry.',
    badge: 'HARDWARE ENCLAVE',
    github: 'https://github.com/NullAITech/sovereign-agent-bridge',
    status: 'E2EE Mesh',
    isFlagship: true,
  },
];

// Helper to convert microTool to unified asset
function toolToAsset(t) {
  // Map category to architectural band
  let band = 'Build';
  if (t.category === 'Security & Recon' || t.category === 'Security & Steganography') band = 'Security';
  else if (t.category === 'Media & 3D') band = 'Spatial';
  else if (t.category === 'Swarm & Core') band = 'Swarm & Consensus';
  else if (t.category === 'AI & Knowledge' || t.category === 'Planning') band = 'Observe';
  else if (t.category === 'Automation' || t.category === 'Autonomous Web') band = 'Build';

  // Special cases for dedicated launch routes
  let target = `/tools/${t.id}`;
  if (t.id === 'zoth-webgen') target = '/webgen';
  if (t.id === 'zoth-swarm-multiplexer') target = '/swarm';

  return {
    id: t.id,
    name: t.name,
    kind: 'tool',
    band,
    category: t.category,
    target,
    description: t.description,
    badge: t.executionType === 'webgpu' ? 'WEBGPU TOOL' : 'SOVEREIGN CLI TOOL',
    pullCommand: t.pull,
    github: t.github,
    version: t.version,
    executionType: t.executionType,
    isFlagship: t.id === 'zoth-webgen' || t.id === 'omnipost-social-engine' || t.id === 'subsweep-lead-scanner',
  };
}

// Helper to convert workstation to unified asset
function cockpitToAsset(w) {
  return {
    id: w.id,
    name: w.name,
    kind: 'cockpit',
    band: w.band,
    category: w.band,
    target: `/workstations/${w.id}`,
    description: w.description,
    badge: 'STUDIO COCKPIT',
    pullCommand: w.pullCommand || null,
    isFlagship: ['cockpit', 'ide', 'agent-composer', 'mission-control', 'models'].includes(w.id),
  };
}

// Filter cockpits (exclude items that are already represented as standalone tools or enclaves)
const pureCockpits = workstations.filter((w) => w.type === 'cockpit');

// Master unified arsenal
export const masterArsenal = [
  ...enclaveEntities,
  ...pureCockpits.map(cockpitToAsset),
  ...microTools.map(toolToAsset),
];

// Helper lookup
export function getAssetById(id) {
  return masterArsenal.find((a) => a.id === id);
}

// Category & Cadre Counts
export const arsenalStats = {
  total: masterArsenal.length,
  enclaves: enclaveEntities.length,
  cockpits: pureCockpits.length,
  tools: microTools.length,
};
