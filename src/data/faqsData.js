/**
 * Central FAQs and Architectural Knowledge Base for Zoth Studio v2
 * Used by FaqsPage.jsx, Schema.org FAQPage generation in site.js,
 * and semantic static HTML generation in scripts/prerender.mjs.
 */

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
    q: "What is the exact mathematical formulation for Lucy's STDP synaptic weight decay?",
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
    q: "What client-side fallback tiers exist when WebGPU is unavailable in the operator's browser?",
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
