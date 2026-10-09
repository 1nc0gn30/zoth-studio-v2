/**
 * Zoth Studio v2 - Sovereign Master Arsenal & Unified Catalog
 *
 * Consolidates the 25 curated sovereign tools and micro-repositories into a single
 * air-gapped catalog with real GitHub references and zero localhost port traps.
 */

import { microTools } from './toolsData';

// Helper to convert microTool to unified asset
function toolToAsset(t) {
  let target = `/tools/${t.id}`;
  if (t.id === 'zoth-webgen') target = '/webgen';
  if (t.id === 'zoth-swarm-multiplexer') target = '/swarm';
  if (t.id === 'NullAI-HexStrike-AI-Terminal') target = '/hexstrike';
  if (t.id === 'adytum-alchemist-ai-workflow') target = '/adytum';
  if (t.id === 'neuro-memory-daemon') target = '/memory';
  if (t.id === 'sovereign-agent-bridge') target = '/bridges';

  return {
    id: t.id,
    name: t.name,
    kind: 'tool',
    category: t.category,
    target,
    description: t.description,
    badge: t.executionType === 'webgpu' ? 'WEBGPU TOOL' : (t.localPort ? `PORT :${t.localPort}` : 'LOCAL CLI TOOL'),
    status: t.executionType === 'webgpu' ? 'Browser Native' : (t.localPort ? `Daemon :${t.localPort}` : 'Local Binary'),
    pullCommand: t.pull,
    github: t.github,
    version: t.version,
    executionType: t.executionType,
    localPort: t.localPort,
    localUrl: t.localUrl,
    liveUrl: t.liveUrl,
    isFlagship: [
      'zoth-webgen',
      'zoth-swarm-multiplexer',
      'neuro-memory-daemon',
      'agent-egress-sentinel',
      'agent-mock-twin',
      'agent-prompt-firewall',
      'agent-flight-recorder',
      'agent-capsule-jail',
      'agent-policy-auditor',
      'subsweep-lead-scanner',
      'envguard-secrets-vault'
    ].includes(t.id),
  };
}

// Master unified arsenal
export const masterArsenal = microTools.map(toolToAsset);

// Helper lookup
export function getAssetById(id) {
  return masterArsenal.find((a) => a.id === id);
}

// Unified Counts
export const arsenalStats = {
  total: microTools.length,
  tools: microTools.length,
  cli: microTools.filter((t) => t.executionType === 'local_cli').length,
  webgpu: microTools.filter((t) => t.executionType === 'webgpu').length,
};
