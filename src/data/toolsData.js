export const microTools = [
  // --- Swarm & Sovereign Core ---
  {
    id: 'azoth-local-agent',
    name: 'AZOTH Local Archon Agent',
    repo: 'azoth-local-agent',
    category: 'Swarm & Core',
    github: 'https://github.com/1nc0gn30/azoth-local-agent',
    description: 'Archon Orchestrator core agent for local zero-telemetry task dispatching and subagent delegation.',
    version: '3.0.0',
    pull: 'npx zoth pull azoth-local-agent',
    localPath: '~/azoth-local-agent'
  },
  {
    id: 'sovereign-agent-bridge',
    name: 'Sovereign Agent Signal Bridge',
    repo: 'sovereign-agent-bridge',
    category: 'Swarm & Core',
    github: 'https://github.com/1nc0gn30/sovereign-agent-bridge',
    description: 'E2EE WebSocket signal protocol and Simplex peer mesh IPC communicator.',
    version: '3.2.0',
    pull: 'npx zoth pull sovereign-agent-bridge',
    localPath: '~/sovereign-agent-bridge'
  },
  {
    id: 'neuro-memory-daemon',
    name: 'Neuro Memory Daemon',
    repo: 'neuro-memory-daemon',
    category: 'Swarm & Core',
    github: 'https://github.com/1nc0gn30/neuro-memory-daemon',
    description: 'STDP biomorphic memory vector engine & cross-session agent context recall at 127.0.0.1:8788.',
    version: '2.8.0',
    pull: 'npx zoth pull neuro-memory-daemon',
    localPath: '~/neuro-memory-daemon'
  },
  {
    id: 'vector-search-engine',
    name: 'Vector Search Engine',
    repo: 'vector-search-engine',
    category: 'Swarm & Core',
    github: 'https://github.com/1nc0gn30/vector-search-engine',
    description: 'Local HNSW vector index engine for fast zero-latency semantic similarity search.',
    version: '2.3.0',
    pull: 'npx zoth pull vector-search-engine',
    localPath: '~/vector-search-engine'
  },
  {
    id: 'deepsearch-research-agent',
    name: 'DeepSearch Research Agent',
    repo: 'deepsearch-research-agent',
    category: 'AI & Knowledge',
    github: 'https://github.com/1nc0gn30/deepsearch-research-agent',
    description: 'Autonomous multi-source research agent with grounded inline citations and web scraping.',
    version: '2.4.0',
    pull: 'npx zoth pull deepsearch-research-agent',
    localPath: '~/deepsearch-research-agent'
  },
  {
    id: 'promptmaster-studio',
    name: 'PromptMaster Studio',
    repo: 'promptmaster-studio',
    category: 'AI & Knowledge',
    github: 'https://github.com/1nc0gn30/promptmaster-studio',
    description: 'System prompt engineering workstation, DSPy prompt optimizer, and template store.',
    version: '2.5.0',
    pull: 'npx zoth pull promptmaster-studio',
    localPath: '~/promptmaster-studio'
  },

  // --- Security & Offensive Recon ---
  {
    id: 'hexstrike-arsenal',
    name: 'HexStrike Security Arsenal',
    repo: 'hexstrike-arsenal',
    category: 'Security & Recon',
    github: 'https://github.com/1nc0gn30/hexstrike-arsenal',
    description: 'Autonomous penetration audit suite, CVE matrix inspector, and exploit payload lab.',
    version: '3.1.0',
    pull: 'npx zoth pull hexstrike-arsenal',
    localPath: '~/hexstrike-arsenal'
  },
  {
    id: 'envguard-secrets-vault',
    name: 'EnvGuard Secrets Vault',
    repo: 'envguard-secrets-vault',
    category: 'Security & Recon',
    github: 'https://github.com/1nc0gn30/envguard-secrets-vault',
    description: 'Argon2id + AES-256-GCM hardware vault for zero-cloud secret storage and leak scanning.',
    version: '2.2.0',
    pull: 'npx zoth pull envguard-secrets-vault',
    localPath: '~/envguard-secrets-vault'
  },
  {
    id: 'jwt-inspector-guard',
    name: 'JWT Inspector Guard',
    repo: 'jwt-inspector-guard',
    category: 'Security & Recon',
    github: 'https://github.com/1nc0gn30/jwt-inspector-guard',
    description: 'JWT token decoder, cryptographic signature validator, and auth claim auditor.',
    version: '1.0.8',
    pull: 'npx zoth pull jwt-inspector-guard',
    localPath: '~/jwt-inspector-guard'
  },
  {
    id: 'payload-entropy-studio',
    name: 'Payload Entropy Studio',
    repo: 'payload-entropy-studio',
    category: 'Security & Recon',
    github: 'https://github.com/1nc0gn30/payload-entropy-studio',
    description: 'Shannon entropy analysis tool for detecting obfuscated web shells and encrypted payloads.',
    version: '1.4.0',
    pull: 'npx zoth pull payload-entropy-studio',
    localPath: '~/payload-entropy-studio'
  },
  {
    id: 'web-security-guard',
    name: 'Web Security Guard',
    repo: 'web-security-guard',
    category: 'Security & Recon',
    github: 'https://github.com/1nc0gn30/web-security-guard',
    description: 'Security headers auditor, CSP validator, and WAF protection scanner.',
    version: '1.5.0',
    pull: 'npx zoth pull web-security-guard',
    localPath: '~/web-security-guard'
  },
  {
    id: 'audiocipher-stego-engine',
    name: 'AudioCipher Stego Engine',
    repo: 'audiocipher-stego-engine',
    category: 'Security & Steganography',
    github: 'https://github.com/1nc0gn30/audiocipher-stego-engine',
    description: 'LSB audio steganography encoder/decoder and spectrum hidden signal detector.',
    version: '2.1.0',
    pull: 'npx zoth pull audiocipher-stego-engine',
    localPath: '~/audiocipher-stego-engine'
  },

  // --- Autonomous Web & Exporters ---
  {
    id: 'polyglot-framework-exporter',
    name: 'Polyglot Framework Exporter',
    repo: 'polyglot-framework-exporter',
    category: 'Autonomous Web',
    github: 'https://github.com/1nc0gn30/polyglot-framework-exporter',
    description: 'Exports React/JSX code to HTML/CSS, Vue, Svelte, and Solid.js framework outputs.',
    version: '1.9.0',
    pull: 'npx zoth pull polyglot-framework-exporter',
    localPath: '~/polyglot-framework-exporter'
  },
  {
    id: 'aeo-graph-engine',
    name: 'AEO Graph Engine',
    repo: 'aeo-graph-engine',
    category: 'Autonomous Web',
    github: 'https://github.com/1nc0gn30/aeo-graph-engine',
    description: 'Answer Engine Optimization knowledge graph builder & Schema.org entity linker.',
    version: '1.4.0',
    pull: 'npx zoth pull aeo-graph-engine',
    localPath: '~/aeo-graph-engine'
  },
  {
    id: 'cwv-speed-engine',
    name: 'CWV Speed Engine',
    repo: 'cwv-speed-engine',
    category: 'Autonomous Web',
    github: 'https://github.com/1nc0gn30/cwv-speed-engine',
    description: 'Core Web Vitals LCP, CLS, and INP diagnostic engine & asset minifier.',
    version: '2.0.1',
    pull: 'npx zoth pull cwv-speed-engine',
    localPath: '~/cwv-speed-engine'
  },

  // --- Media, 3D & Vision ---
  {
    id: 'nexus-3d-scene-studio',
    name: 'Nexus 3D Scene Studio',
    repo: 'nexus-3d-scene-studio',
    category: 'Media & 3D',
    github: 'https://github.com/1nc0gn30/nexus-3d-scene-studio',
    description: 'Browser Three.js 3D viewport editor with bloom shaders and object rigging.',
    version: '2.0.0',
    pull: 'npx zoth pull nexus-3d-scene-studio',
    localPath: '~/nexus-3d-scene-studio'
  },
  {
    id: 'badge3d-coin-generator',
    name: '3D Badge & Coin Generator',
    repo: 'badge3d-coin-generator',
    category: 'Media & 3D',
    github: 'https://github.com/1nc0gn30/badge3d-coin-generator',
    description: 'Three.js 3D metallic coin, seal, and interactive badge renderer.',
    version: '1.2.0',
    pull: 'npx zoth pull badge3d-coin-generator',
    localPath: '~/badge3d-coin-generator'
  },
  {
    id: 'cyber-turtle-studio',
    name: 'CyberTurtle Graphic Studio',
    repo: 'cyber-turtle-studio',
    category: 'Media & 3D',
    github: 'https://github.com/1nc0gn30/cyber-turtle-studio',
    description: 'Turtle graphics vector synth & procedural cyberpunk logo generator.',
    version: '1.5.0',
    pull: 'npx zoth pull cyber-turtle-studio',
    localPath: '~/cyber-turtle-studio'
  },
  {
    id: 'datamosh-glitch-studio',
    name: 'Datamosh Glitch Studio',
    repo: 'datamosh-glitch-studio',
    category: 'Media & 3D',
    github: 'https://github.com/1nc0gn30/datamosh-glitch-studio',
    description: 'Canvas I-frame corruption and analog glitch video/image effect engine.',
    version: '1.3.0',
    pull: 'npx zoth pull datamosh-glitch-studio',
    localPath: '~/datamosh-glitch-studio'
  },
  {
    id: 'vision-gesture-control',
    name: 'Vision Gesture Control',
    repo: 'vision-gesture-control',
    category: 'Media & 3D',
    github: 'https://github.com/1nc0gn30/vision-gesture-control',
    description: 'MediaPipe webcam hand-gesture recognition interface controller.',
    version: '1.8.0',
    pull: 'npx zoth pull vision-gesture-control',
    localPath: '~/vision-gesture-control'
  },
  {
    id: 'ufo-sacred-geometry',
    name: 'UFO Sacred Geometry',
    repo: 'ufo-sacred-geometry',
    category: 'Media & 3D',
    github: 'https://github.com/1nc0gn30/ufo-sacred-geometry',
    description: 'Procedural sacred geometry canvas engine & harmonic vector visualizer.',
    version: '1.1.0',
    pull: 'npx zoth pull ufo-sacred-geometry',
    localPath: '~/ufo-sacred-geometry'
  },

  // --- Recon & Automation ---
  {
    id: 'subsweep-lead-scanner',
    name: 'SubSweep Lead Scanner',
    repo: 'subsweep-lead-scanner',
    category: 'Automation',
    github: 'https://github.com/1nc0gn30/subsweep-lead-scanner',
    description: 'Subdomain recon scanner and OSINT lead enrichment engine.',
    version: '2.0.4',
    pull: 'npx zoth pull subsweep-lead-scanner',
    localPath: '~/subsweep-lead-scanner'
  },
  {
    id: 'omnipost-social-engine',
    name: 'OmniPost Social Engine',
    repo: 'omnipost-social-engine',
    category: 'Automation',
    github: 'https://github.com/1nc0gn30/omnipost-social-engine',
    description: 'Multi-platform social content scheduler and cross-post automation engine.',
    version: '2.1.2',
    pull: 'npx zoth pull omnipost-social-engine',
    localPath: '~/omnipost-social-engine'
  },
  {
    id: 'cron-rhythm-studio',
    name: 'CronRhythm Studio',
    repo: 'cron-rhythm-studio',
    category: 'Automation',
    github: 'https://github.com/1nc0gn30/cron-rhythm-studio',
    description: 'Cron expression rhythm visualizer, scheduler simulator, and task trigger matrix.',
    version: '1.0.4',
    pull: 'npx zoth pull cron-rhythm-studio',
    localPath: '~/cron-rhythm-studio'
  }
];
