/**
 * Zoth Studio v2 - Sovereign Master Arsenal & Unified Catalog
 *
 * Consolidates all 77 sovereign tools and micro-repositories into a single
 * 100% open-access catalog with interactive in-browser God-Mode Workstations,
 * ZothOS local ports, CLI binaries (/usr/local/bin/<id>), and GitHub references.
 */

import { microTools } from './toolsData';

function toolToAsset(t) {
  const target = `/tools/${t.id}`;

  return {
    id: t.id,
    name: t.name,
    kind: 'tool',
    category: t.category,
    target,
    description: t.description,
    badge: t.localPort ? `WEBGPU + :${t.localPort}` : 'WEBGPU + CLI',
    status: t.localPort ? `ZothOS :${t.localPort}` : 'In-Browser + CLI',
    pullCommand: t.pull || `${t.id} --help  # or: git clone https://github.com/NullAITech/${t.repo || t.id}.git`,
    github: t.github,
    version: t.version,
    executionType: t.executionType,
    localPort: t.localPort,
    localUrl: t.localUrl || (t.localPort ? `http://127.0.0.1:${t.localPort}` : undefined),
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
      'envguard-secrets-vault',
      'pixel-cast',
    ].includes(t.id),
  };
}

export const masterArsenal = microTools.map(toolToAsset);

export function getAssetById(id) {
  return masterArsenal.find((a) => a.id === id);
}

export const arsenalStats = {
  total: microTools.length,
  tools: microTools.length,
  cli: microTools.filter((t) => t.executionType === 'local_cli').length,
  webgpu: microTools.filter((t) => t.executionType === 'webgpu' || t.executionType === 'browser' || t.executionType === 'hybrid').length,
};
