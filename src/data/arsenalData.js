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
    badge: t.executionType === 'webgpu' ? 'WEBGPU TOOL' : 'LOCAL CLI TOOL',
    status: t.executionType === 'webgpu' ? 'Browser Native' : 'Local Binary',
    pullCommand: t.pull,
    github: t.github,
    version: t.version,
    executionType: t.executionType,
    isFlagship: [
      'zoth-webgen',
      'zoth-swarm-multiplexer',
      'neuro-memory-daemon',
      'subsweep-lead-scanner',
      'envguard-secrets-vault'
    ].includes(t.id),
  };
}

// Master unified arsenal: 25 authentic sovereign tools
export const masterArsenal = microTools.map(toolToAsset);

// Helper lookup
export function getAssetById(id) {
  return masterArsenal.find((a) => a.id === id);
}

// Unified Counts
export const arsenalStats = {
  total: microTools.length, // 25
  tools: microTools.length, // 25
  cli: microTools.filter((t) => t.executionType === 'local_cli').length, // 18
  webgpu: microTools.filter((t) => t.executionType === 'webgpu').length, // 7
};
