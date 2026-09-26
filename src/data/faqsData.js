/**
 * Central FAQs and Architectural Knowledge Base for Zoth Studio v2
 * Used by FaqsPage.jsx, Schema.org FAQPage generation in site.js,
 * and semantic static HTML generation in scripts/prerender.mjs.
 */

export const FAQS_DATA = [
  {
    id: 'zero-egress-invariant',
    q: 'What is the Zero-Egress Invariant architecture and how does Zoth Studio guarantee privacy?',
    category: 'Architecture',
    keywords: ['zero-egress', 'zero egress', 'invariant', 'privacy', 'telemetry', 'air-gapped', 'client-side', 'security', 'isolation', 'tracking'],
    a: `The Zero-Egress Invariant is Zoth Studio v2's foundational security axiom: all code transformations, token embeddings, cryptographic key derivations, and multi-agent state deliberations run strictly client-side on the operator's local machine.

No telemetry beacons, cloud analytics, tracking pixels, or data exfiltration routes exist within the studio. Prompts, syntax trees, secrets, and tool outputs never leave the local environment under any operational circumstance, making the studio safe for proprietary code, security audits, and air-gapped environments.`,
    summary: 'Zero-Egress guarantees that 100% of code execution, model inference, and state mutations stay local. No external servers or third-party telemetry beacons are permitted.',
    oracleResponse: 'Zero-Egress is absolute: 100% of prompt context, token emission, and agent state is computed locally on client hardware with zero outbound network calls.',
    jumpTargets: [
      { label: 'HexStrike Security Auditor', path: '/hexstrike', type: 'security' },
      { label: 'Sovereign Arsenal (25 Tools)', path: '/arsenal', type: 'arsenal' },
      { label: 'Architecture Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'client-side-micro-tools',
    q: 'How do the 25 sovereign tools execute in the browser without server dependencies?',
    category: 'Architecture',
    keywords: ['micro-tools', 'standalone', 'tools', 'browser', 'client-side', 'execution', 'webgpu', 'wasm', 'webcrypto', 'zero server'],
    a: `All 25 authentic tools in Zoth Studio v2 are engineered as standalone, client-executable micro-applications bundled into the Vite production distribution.

Rather than relying on remote APIs or cloud backend containers, each tool harnesses standard browser-native capabilities:
• WebGPU WGSL compute pipelines for hardware-accelerated matrix operations.
• WebAssembly (WASM) with 128-bit SIMD for high-throughput compiled algorithms.
• WebCrypto API for Argon2id key derivation, SHA-256 Merkle verification, and symmetric encryption.
• Web Workers for non-blocking multi-agent dialectic simulation and AST parsing.

Tools launch instantly in < 16ms with zero server latency.`,
    summary: 'The 25 tools run client-side via WebGPU, WASM, and WebCrypto. Each tool can be launched instantly with < 16ms latency and zero server round-trips.',
    oracleResponse: 'All 25 tools execute client-side using browser-native WebGPU, WASM, and WebCrypto pipelines, delivering instant zero-latency utility without backend servers.',
    jumpTargets: [
      { label: 'Explore Sovereign Arsenal', path: '/arsenal', type: 'arsenal' },
      { label: 'Vision Gesture Engine', path: '/tools/vision-gesture-control', type: 'tools' }
    ]
  },
  {
    id: 'zoth-cli-architecture',
    q: 'What is the Zoth CLI (`npx zoth`) and how do developers use it locally?',
    category: 'CLI & Deployment',
    keywords: ['cli', 'npx zoth', 'terminal', 'commands', 'pull', 'status', 'up', 'scaffold', 'micro-repos', 'npm'],
    a: `The Zoth CLI provides command-line control for developers building with or extending Zoth Studio. It can be invoked directly via npx without global installation:

• npx zoth status: Inspects the local development environment, probes hardware acceleration capabilities, and verifies tool repository integrity.
• npx zoth up: Initializes local studio services, offline cache warmups, and development orchestrators.
• npx zoth pull <tool>: Clones any of the 25 sovereign micro-tool repositories from the @NullAITech ecosystem into an isolated ./tools/<tool> directory with independent package configs.

This allows developers to inspect, modify, or embed individual tools into custom pipelines or run them as dedicated local micro-apps.`,
    summary: 'npx zoth provides local CLI control to scaffold sovereign tool repositories, verify environment readiness, and run tools in standalone micro-app isolation.',
    oracleResponse: 'The Zoth CLI enables developers to probe environment readiness, launch local orchestrators, and pull standalone tool repositories with zero telemetry.',
    jumpTargets: [
      { label: 'Local Terminal Showcase', path: '/', type: 'home' },
      { label: 'Developer Quickstart in Docs', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'argon2id-vault-security',
    q: 'How does the Argon2id Secrets Vault protect API keys and credentials?',
    category: 'Security',
    keywords: ['argon2id', 'vault', 'secrets', 'keys', 'encryption', 'xchacha20', 'poly1305', 'aes-256', 'memory-hard', 'credentials'],
    a: `The Secrets Vault provides zero-knowledge local cryptographic protection for developer credentials, private keys, and local model tokens.

Master cryptographic keys are derived using memory-hard Argon2id (configured with t=3 iterations, m=64MB memory cost, and p=4 parallelism lanes), rendering GPU and ASIC dictionary attacks computationally intractable.

Operator secrets at rest are shielded using authenticated encryption (XChaCha20-Poly1305 or AES-256-GCM via WebCrypto). Decrypted keys are retained strictly in volatile browser memory for the minimum required task duration and securely zeroized upon task completion or window close.`,
    summary: 'High-entropy key derivation with 64MB memory hardness ensures dictionary and brute-force resistance. Secrets live strictly in local encrypted memory.',
    oracleResponse: 'Memory-hard Argon2id key derivation combined with authenticated encryption protects operator secrets locally with zero cloud persistence.',
    jumpTargets: [
      { label: 'HexStrike Security Enclave', path: '/hexstrike', type: 'security' },
      { label: 'Cryptographic Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'local-llm-ollama-integration',
    q: 'How does Zoth Studio connect to local LLMs like Ollama and llama.cpp?',
    category: 'Memory & AI',
    keywords: ['ollama', 'llama.cpp', 'local llm', 'gguf', 'models', 'qwen2.5', 'offline ai', '11434', 'private inference'],
    a: `Zoth Studio interfaces directly with locally running LLM engines (such as Ollama or llama.cpp) via browser fetch requests to local loopback endpoints (e.g. http://127.0.0.1:11434).

Developers can pull recommended open-weight models (e.g. Qwen 2.5 Coder, Llama 3, DeepSeek) and link them directly to studio workspaces. The browser communicates straight to the local model socket:
• Zero prompt data or tokens leave the local network.
• Zero per-token API costs or third-party rate limits.
• Full offline capability for security researchers and enterprise engineers working under strict non-disclosure or data compliance guidelines.`,
    summary: 'Connects directly to local Ollama or llama.cpp instances for unlimited, offline, token-cost-free intelligence with complete data privacy.',
    oracleResponse: 'Direct loopback integration with Ollama and llama.cpp allows sovereign local models to power agent tools with 100% offline data privacy.',
    jumpTargets: [
      { label: 'Swarm Cockpit', path: '/swarm', type: 'swarm' },
      { label: 'WebGen Assistant', path: '/webgen', type: 'tools' }
    ]
  },
  {
    id: 'stdp-neuro-memory',
    q: 'What is the STDP Neuro Memory engine and how does biological synaptic persistence work?',
    category: 'Memory & AI',
    keywords: ['stdp', 'neuro memory', 'synaptic', 'hebbian', 'plasticity', 'vector memory', '3d manifold', 'ltp', 'ltd', 'persistence'],
    a: `The STDP (Spike-Timing-Dependent Plasticity) memory engine models biological asymmetric Hebbian learning for agent context persistence:

• Long-Term Potentiation (LTP): When an agent proposal or action causally leads to a validated architectural outcome, the synaptic connection strength increases exponentially.
• Long-Term Depression (LTD): When an action leads to a syntax error, test failure, or security defect, the connection is weakened.

Synaptic weights are projected onto an interactive 3D manifold visualizer, enabling semantic clustering, tag grouping, and deterministic recall without relying on external cloud vector databases like Pinecone or Weaviate.`,
    summary: 'Biomorphic memory persistence that prunes stale context and reinforces verified patterns using asymmetric Hebbian plasticity.',
    oracleResponse: 'STDP Neuro Memory models biological Hebbian plasticity, reinforcing successful code decisions and pruning unverified noise over time.',
    jumpTargets: [
      { label: 'STDP Neuro Memory Hub', path: '/memory', type: 'memory' },
      { label: 'Six Math Pillars Academy', path: '/docs/math', type: 'math' }
    ]
  },
  {
    id: 'stdp-decay-math',
    q: 'What is the exact mathematical formulation for the STDP synaptic weight decay?',
    category: 'Memory & AI',
    keywords: ['stdp', 'spike-timing', 'decay', 'synaptic', 'weight', 'plasticity', 'mathematics', 'formula', 'ltp', 'ltd', 'tau', 'exponential', 'equations'],
    a: `Spike-Timing-Dependent Plasticity (STDP) governs memory longevity based on relative impulse timing Δt = t_post - t_pre:

• Long-Term Potentiation (LTP, causal firing Δt > 0):
  Δw = A₊ · e^(-Δt / τ₊)
• Long-Term Depression (LTD, acausal firing Δt < 0):
  Δw = -A₋ · e^(Δt / τ₋)

Baseline parameters are configured as A₊ = 0.05, A₋ = 0.025, and time constants τ₊ = τ₋ = 20ms. Inactive memory nodes undergo continuous background exponential decay:
w(t) = w₀ · e^(-λ · Δt)
with decay constant λ = 0.0018 hr⁻¹, pruning stale noise while preserving actively verified architectural invariants.`,
    summary: 'Exponential time-constant formulation Δw = A₊ · e^(-Δt / τ₊) mathematically prunes noise and anchors long-term verified architectural context.',
    oracleResponse: 'STDP synaptic decay follows Δw = A₊ · e^(-Δt/τ₊) for causal spikes, maintaining high signal-to-noise ratio in agent memory.',
    jumpTargets: [
      { label: 'STDP Synaptic Memory Hub', path: '/memory', type: 'memory' },
      { label: 'Six Math Pillars Academy', path: '/docs/math', type: 'math' }
    ]
  },
  {
    id: 'byzantine-consensus-triad',
    q: 'How does the 3-Agent Byzantine Consensus deliberation engine operate?',
    category: 'Consensus',
    keywords: ['byzantine', 'consensus', 'dialectic', 'debate', 'azoth', 'kai', 'lycan', 'proponent', 'skeptic', 'auditor', 'triad', 'quorum', 'bayesian', 'socratic'],
    a: `The Byzantine Consensus chamber coordinates multi-agent dialectic debate across independent agent personas to eliminate AI hallucinations before code is ratified:

• Azoth (The Proponent): Formulates constructive proposals, generating an idempotent Directed Acyclic Graph (DAG) of AST mutations.
• Kai (The Skeptic): Adversarially interrogates the proposal, searching for race conditions, asynchronous deadlocks, and edge-case regressions.
• Lycan / Draco (The Auditor): Evaluates the dialectic through Bayesian posterior probability calculations:
  P(H | E) = [P(E | H) · P(H)] / P(E)
The auditor synthesizes valid counterarguments into hardened invariants and issues a cryptographically ratified verdict.`,
    summary: 'Dialectical consensus between proponent, skeptic, and auditor agents ensures only verified AST modifications are committed.',
    oracleResponse: 'A 3-agent dialectic debates proposals through proponent thesis, skeptic cross-examination, and Bayesian auditor synthesis.',
    jumpTargets: [
      { label: 'Consensus Arena in Arsenal', path: '/arsenal', type: 'consensus' },
      { label: 'Architecture Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'merkle-ast-quorum',
    q: 'What is the Byzantine fault ceiling and how does Merkle-trie AST quorum verification work?',
    category: 'Consensus',
    keywords: ['byzantine', 'fault', 'ceiling', 'merkle', 'ast', 'quorum', '2f+1', 'injection', 'sha-256', 'supermajority', 'rollback', 'lamport', 'proof'],
    a: `Zoth Studio enforces the classical Byzantine fault tolerance bound: f < n/3. To ratify code mutations, a 2f + 1 supermajority (≥ 66.7%) is mandatory across independent agent nodes.

Every proposed code transformation computes a deterministic SHA-256 Merkle trie over its Abstract Syntax Tree (AST) nodes. If a hallucinated or corrupted agent generates invalid syntax or malicious macro loops, the Merkle root hash verification fails with O(log N) audit complexity. The Lamport epoch clock triggers an instantaneous rollback to the last verified snapshot, neutralizing syntax corruption.`,
    summary: 'SHA-256 Merkle trie hashing over syntax trees ensures tamper-proof verification and instantaneous rollback upon invariant violation.',
    oracleResponse: '2f + 1 quorum enforcement combined with SHA-256 Merkle trie verification guarantees deterministic syntax integrity across agent consensus.',
    jumpTargets: [
      { label: 'Byzantine Consensus in Arsenal', path: '/arsenal', type: 'consensus' },
      { label: 'WebGen AST Synthesis', path: '/webgen', type: 'tools' }
    ]
  },
  {
    id: 'tactical-cadres-organization',
    q: 'What are the 5 Tactical Cadres and how are the 25 sovereign tools categorized?',
    category: 'Architecture',
    keywords: ['cadres', '5 cadres', 'categories', 'tools', 'security', 'swarm', 'velocity', 'memory', 'crypto', 'arsenal'],
    a: `The studio organizes its 25 sovereign tools into 5 tactical domains:

1. Security & Recon: HexStrike vulnerability auditor, SubSweep subdomain scanner, EnvGuard secrets detector, and CyberChef format processor.
2. Swarm & Core: 21-Agent telemetry radar, Byzantine consensus chamber, and sovereign agent communication bridge.
3. Developer Velocity: WebGen reactive generator, SVG schematic composer, Regex Droid debugger, and WCAG contrast analyzer.
4. Memory & Cognitive: STDP biomorphic memory matrix, 3D manifold visualizer, and semantic cluster explorer.
5. Crypto & Identity: Argon2id secrets vault, Ed25519 identity generator, and zero-knowledge proof verifiers.`,
    summary: '25 tools grouped into 5 dedicated cadres: Security, Swarm, Developer Velocity, Memory, and Cryptography.',
    oracleResponse: 'The 25 tools are structured across 5 distinct tactical cadres: Security & Recon, Swarm & Core, Developer Velocity, Memory & Cognitive, and Crypto & Identity.',
    jumpTargets: [
      { label: 'Sovereign Arsenal Matrix', path: '/arsenal', type: 'arsenal' },
      { label: 'Workstations Catalog', path: '/workstations', type: 'workstations' }
    ]
  },
  {
    id: 'webgpu-matrix-acceleration',
    q: 'How does in-browser WebGPU matrix acceleration compute client-side tensor shaders?',
    category: 'WebGPU & Tools',
    keywords: ['webgpu', 'wgsl', 'matrix', 'acceleration', 'shaders', 'tensor', 'gpu', 'vulkan', 'metal', 'directx', 'in-browser', 'compute', 'matmul'],
    a: `Zoth Studio runs client-side tensor operations via custom WebGPU Shading Language (WGSL) compute pipelines.

When executing vector embeddings, cosine similarities, or quantized neural matmuls (C = A × B), memory buffers are allocated directly in VRAM and processed across parallel GPU workgroups (8×8 or 16×16 threads). This delivers microsecond-tier matrix operations directly on local hardware (Vulkan, Metal, DirectX 12) without server dependencies or external API round-trips.`,
    summary: 'WGSL compute shaders dispatch parallel workgroups directly to client GPU VRAM for instantaneous local matrix operations.',
    oracleResponse: 'Native WGSL compute shaders execute tensor matmuls directly in client GPU VRAM, achieving hardware performance with zero server egress.',
    jumpTargets: [
      { label: 'Unified Arsenal (25 Tools)', path: '/arsenal', type: 'arsenal' },
      { label: 'Vision Gesture Control', path: '/tools/vision-gesture-control', type: 'tools' }
    ]
  },
  {
    id: 'webgpu-fallback-hierarchy',
    q: 'What client-side fallback tiers exist when WebGPU is unavailable in the browser?',
    category: 'WebGPU & Tools',
    keywords: ['fallback', 'tiers', 'wasm', 'simd', 'cpu', 'webassembly', 'workers', 'precision', 'compatibility'],
    a: `If a browser or platform lacks native WebGPU support, Zoth Studio seamlessly drops into an autonomous fallback hierarchy:
1. Primary: Hardware WebGPU via WGSL compute shaders.
2. Secondary: WebAssembly (WASM) with 128-bit SIMD vector instructions and multi-threaded Web Workers.
3. Tertiary: Optimized pure JavaScript numerical routines.

All three computational tiers produce bit-identical deterministic outputs, ensuring uninterrupted offline capability across modern browsers and legacy hardware.`,
    summary: 'Seamless three-tier fallback: WebGPU WGSL → WASM SIMD 128-bit → CPU Web Workers.',
    oracleResponse: 'Autonomous fallback cascades from WebGPU WGSL to WASM SIMD 128-bit and multi-threaded CPU workers, guaranteeing 100% offline availability.',
    jumpTargets: [
      { label: 'Unified Arsenal (25 Tools)', path: '/arsenal', type: 'arsenal' },
      { label: 'WebGen Workspace', path: '/webgen', type: 'tools' }
    ]
  },
  {
    id: 'mcp-tool-integration',
    q: 'How does Model Context Protocol (MCP) tool integration work in Zoth Studio v2?',
    category: 'Architecture',
    keywords: ['mcp', 'model context protocol', 'stdio', 'ipc', 'tools/list', 'tools/call', 'anthropic', 'agents', 'schema'],
    a: `Zoth Studio implements the Anthropic Model Context Protocol (MCP) specification to bridge tools with external agent frameworks.

External agent environments (such as Claude Code, Hermes Agent, Cursor, or local agents) can connect to the studio interface:
• tools/list: Discovers all 25 sovereign tools with complete input parameter schemas.
• tools/call: Dispatches execution requests against validated JSON-Schema contracts.
• resources/read: Inspects local memory states or architectural specifications.

All tool executions remain contained within the local client runtime without external network leakage.`,
    summary: 'Standard MCP interface allows external AI agents to discover and invoke Zoth Studio\'s 25 tools via validated JSON-Schema contracts.',
    oracleResponse: 'Full MCP standard compliance allows external agents to discover and execute sovereign studio tools via schema-validated interfaces.',
    jumpTargets: [
      { label: 'Unified Arsenal (25 Tools)', path: '/arsenal', type: 'arsenal' },
      { label: 'Signal Bridge Workspace', path: '/tools/sovereign-agent-bridge', type: 'bus' }
    ]
  },
  {
    id: 'signal-bridge-peer-mesh',
    q: 'How does the Sovereign Signal Bridge handle inter-agent communication?',
    category: 'Architecture',
    keywords: ['signal bridge', 'simplex', 'peer mesh', 'e2ee', 'ipc', 'ed25519', 'bus', 'decentralized', 'heartbeats'],
    a: `The Sovereign Signal Bridge acts as a low-latency, point-to-point simplex communication bus for multi-agent workflows.

Agents transmit typed messages across unidirectional event channels, signing payloads with cryptographic keys (Ed25519 or HMAC-SHA256). The simplex architecture isolates individual agent failure domains: if an individual agent encounters an unhandled exception or parsing halt, peer agents continue consensus deliberations without crashing the collective session.`,
    summary: 'Point-to-point event bus with cryptographic message signing and process isolation preventing cascading failure across agents.',
    oracleResponse: 'The Signal Bridge provides low-latency, simplex message passing with signed payloads and fault-isolated channels.',
    jumpTargets: [
      { label: 'Sovereign Arsenal', path: '/arsenal', type: 'arsenal' },
      { label: 'Signal Bridge Workspace', path: '/tools/sovereign-agent-bridge', type: 'bus' }
    ]
  },
  {
    id: 'offline-pwa-service-worker',
    q: 'Can Zoth Studio run completely offline without an internet connection?',
    category: 'CLI & Deployment',
    keywords: ['offline', 'air-gapped', 'pwa', 'cache', 'service worker', 'local', 'disconnected'],
    a: `Yes. Zoth Studio is built from the ground up for sovereign, offline-first reliability.

Once loaded or saved locally:
• All 25 micro-tools, WGSL shaders, UI icons, and CSS stylesheets are bundled directly into static assets without third-party CDN links.
• Static routing and state persistence rely entirely on browser-native storage (IndexedDB, Web Crypto, and local caches).
• No remote API tokens or internet connections are required to run security audits, compile regexes, test WCAG contrast, or simulate multi-agent consensus.`,
    summary: '100% offline-first architecture with local asset caching, zero CDN dependencies, and air-gapped readiness.',
    oracleResponse: 'Zoth Studio operates 100% offline with bundled assets and local storage, requiring zero external internet connection for all core tools.',
    jumpTargets: [
      { label: 'HexStrike Security Enclave', path: '/hexstrike', type: 'security' },
      { label: 'Developer Quickstart in Docs', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'netlify-prerender-aeo',
    q: 'How does Netlify production deployment prerender static routes for search and answer engines?',
    category: 'CLI & Deployment',
    keywords: ['netlify', 'prerender', 'static', 'routes', '71', 'aeo', 'seo', 'schema.org', 'json-ld', 'crawler', 'scripts/prerender.mjs', 'build'],
    a: `Netlify production deployments compile with an automated prerendering pipeline (npm run build -> vite build && node scripts/prerender.mjs).

The engine generates static HTML snapshots for all 71 studio routes—including 25 sovereign tools, interactive flagship workspaces, and 6 math academy pillars. Each snapshot embeds structured Schema.org JSON-LD graphs (FAQPage, SoftwareApplication, TechArticle) and rich semantic DOM structures, providing instant First Contentful Paint (< 200ms) and comprehensive Answer Engine Optimization (AEO).`,
    summary: 'Prerenders 71 static route shells with structured Schema.org JSON-LD for instant load times and search crawler indexing.',
    oracleResponse: '71 static route shells are pre-compiled with embedded Schema.org graphs and semantic metadata, enabling instant load times and authoritative AEO indexing.',
    jumpTargets: [
      { label: 'Agent AX Discovery Manifest', path: '/ax', type: 'ax' },
      { label: 'Full Engineering Documentation', path: '/docs', type: 'doc' }
    ]
  },
  {
    id: 'security-headers-defense',
    q: 'Which production security headers protect Zoth Studio against web vulnerabilities?',
    category: 'Security',
    keywords: ['security', 'headers', 'netlify', 'csp', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'cache-control', 'zero-egress', 'isolation'],
    a: `In netlify.toml, production builds enforce strict defense-in-depth HTTP response headers:
• Content-Security-Policy: Restricts frame ancestors to verified origins and eliminates external script injection.
• X-Frame-Options: SAMEORIGIN (prevents clickjacking attacks).
• X-Content-Type-Options: nosniff (mitigates MIME-type sniffing).
• Referrer-Policy: strict-origin-when-cross-origin (prevents URL parameter leakage).
• Permissions-Policy: camera=(), microphone=(), geolocation=() (disables invasive sensor APIs).
• Static assets receive immutable caching headers for instant repeat visits.`,
    summary: 'Strict CSP, SAMEORIGIN, nosniff, and zero sensor permissions ensure a hardened, tamper-proof runtime environment.',
    oracleResponse: 'Hardened HTTP headers enforce frame isolation, strict MIME handling, zero sensor permissions, and immutable asset caching.',
    jumpTargets: [
      { label: 'HexStrike Security Enclave', path: '/hexstrike', type: 'security' },
      { label: 'Deployment Specs', path: '/docs', type: 'doc' }
    ]
  }
];
