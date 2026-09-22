/** Invariants from public/assets/OWASP_ZERO_EGRESS_AUDIT.md (2026-09-15, @Lycan). */
export const zeroEgressInvariants = [
  'No eval() or new Function()',
  'No innerHTML / outerHTML / document.write',
  'No localStorage, sessionStorage, or cookie leaks',
  'No hardcoded external http(s) URLs in audited assets',
  'No analytics or tracking SDK calls',
  'No __proto__ prototype pollution',
  'No javascript: URI injection',
  'No postMessage cross-origin bridges',
  'No window.location exfiltration',
  'No _blank tab-napping vectors',
  'No dynamic createElement / importScripts injection',
  'Fetches restricted to relative paths or loopback',
];

/**
 * Loopback enclave binds documented in the legacy architecture notes
 * and the v2 workstation pages. Nothing here is a public listener.
 */
export const enclaveBinds = [
  { service: 'Public hub (static)', bind: '127.0.0.1:8088', note: 'Showcase only. No operator secrets.' },
  { service: 'Operator deck', bind: '127.0.0.1:8484', note: 'Agent execution, fusion, and the IDE console.' },
  { service: 'Hardware vault', bind: '127.0.0.1:8787', note: 'Argon2id key derivation + XChaCha20-Poly1305 at rest.' },
  { service: 'Memory daemon', bind: '127.0.0.1:8788', note: 'HNSW / STDP recall. JSON over loopback.' },
  { service: 'Signal bridge', bind: '127.0.0.1:8789', note: 'E2EE Simplex peer mesh. AES-256-GCM.' },
  { service: 'Swarm bus', bind: '127.0.0.1:8989', note: 'Pantheon telemetry. Never leaves the host.' },
  { service: 'Local models', bind: '127.0.0.1:11434', note: 'Ollama / llama.cpp. No cloud fallback.' },
];

export const legacyWorkstations = [
  { file: 'swarm.html', job: '21-agent pantheon control plane and IPC topology', to: '/swarm' },
  { file: 'signal-bridge.html', job: 'E2EE WebSocket signal bridge and packet pinger', to: '/bridges' },
  { file: 'bus-monitor.html', job: 'Loopback bus channels and mesh latency', to: '/bridges' },
  { file: 'netrunner-memory.html', job: 'Biomorphic STDP memory daemon and vector search', to: '/memory' },
  { file: 'consensus.html', job: 'Socratic debate arena and AST diff console', to: '/consensus' },
  { file: 'fusion-arena.html', job: 'Multi-model fusion arbitration', to: '/consensus' },
  { file: 'webgen.html', job: 'Layout foundry and polyglot framework exporter', to: '/webgen' },
  { file: 'ide.html', job: 'Local code workstation and diff review', to: '/webgen' },
  { file: 'hexstrike.html', job: 'Cybersec arsenal and CVE matrix', to: '/hexstrike' },
  { file: 'vos-sandbox.html', job: 'QEMU / KVM hypervisor sandbox', to: '/zoth-os' },
  { file: 'edge-forge.html', job: 'Edge dispatch inside the isolated VM', to: '/zoth-os' },
  { file: 'mission-control.html', job: 'Operator mission board for the swarm', to: '/swarm' },
  { file: 'models.html', job: 'Local model connectors (Ollama, llama.cpp)', to: '/docs' },
  { file: 'connectors.html', job: 'Tool and model connector directory', to: '/tools' },
  { file: 'subsweep.html', job: 'Subdomain recon, now subsweep-lead-scanner', to: '/tools' },
  { file: 'omnipost.html', job: 'Cross-post scheduler, now omnipost-social-engine', to: '/tools' },
  { file: '3d-editor.html', job: 'Nexus 3D scene studio', to: '/tools' },
  { file: 'notes-reviewer.html', job: 'Annotation and codex review', to: '/docs' },
  { file: 'chronicle.html', job: 'Session chronicle of swarm verdicts and audits', to: '/docs' },
  { file: 'ax-powerhouse.html', job: 'Agent-experience and answer-engine surfaces', to: '/docs' },
  { file: 'math-pillars.html', job: 'Six math pillars and the learning academy', to: '/docs#sec-math' },
];
