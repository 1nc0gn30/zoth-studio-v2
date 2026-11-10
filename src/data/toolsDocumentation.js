/**
 * Comprehensive Architectural Documentation & AI Integration Specs for all Sovereign Tools.
 * Each tool definition provides:
 *  - whyUse: Why humans and autonomous AI agents need this tool over centralized SaaS.
 *  - problemSolved: Exact security, privacy, or infrastructure challenges eliminated.
 *  - architecture: Runtime specifications, zero-egress invariants, and local IPC details.
 *  - aiAgentProtocol: MCP server configuration, CLI flags, and JSON schema input/output contracts.
 *  - quickstart: Installation and execution steps for local verification.
 *  - features: List of technical capabilities.
 */

export const toolsDocumentation = {
  'pixel-cast': {
    whyUse: 'Enables instant, zero-latency Google Pixel screen mirroring, camera lens streaming, and hardware bridge to ZothOS desktop over private Tailscale mesh networks. Eliminates third-party cloud streaming relays, physical cable tethering, and complex wireless pairing friction.',
    problemSolved: 'Replaces proprietary casting apps and broken mobile WebRTC restrictions with sovereign local ADB tunnels and Scrcpy 5.0.1 hardware-accelerated video decoding. Solves dynamic wireless debugging port hunting through automated mesh discovery.',
    architecture: 'Python 3.12 FastAPI / WebSocket runtime orchestrated alongside scrcpy 5.0.1 and adb. Communicates over authenticated WireGuard / Tailscale tunnels on port 8148 with direct display output on Wayland (:0) and browser canvases.',
    aiAgentProtocol: {
      mcpTool: 'pixel_cast_orchestrate',
      description: 'Discover Tailscale Android devices, query battery/thermal health, and launch 60fps desktop screen mirror or capture screenshots.',
      cliExample: 'pixel-cast status --json && pixel-cast stream --bitrate 8M --max-size 1080',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['status', 'stream', 'screenshot', 'connect', 'battery', 'key'], description: 'Action to execute' },
          target_ip: { type: 'string', description: 'Tailscale IP address of Google Pixel' },
          bitrate: { type: 'string', default: '8M', description: 'Video encoding bitrate' }
        },
        required: ['action']
      },
      outputSchema: {
        success: 'boolean',
        pixel: { hostname: 'string', ip: 'string', ping_ms: 'number' },
        battery: { percent: 'number', charging: 'boolean', temperature_c: 'number' }
      }
    },
    quickstart: [
      'pixel-cast status',
      'pixel-cast connect',
      'pixel-cast stream',
      '# Open workstation at http://127.0.0.1:8148 or http://100.106.132.5:8148'
    ],
    features: [
      'Autonomous Tailscale Mesh discovery detecting Google Pixel 10 Pro with live latency ping',
      'Hardware-accelerated 60fps Scrcpy 5.0.1 video mirror with Opus low-latency audio forwarding',
      'Remote Hardware Navigation HUD: Home, Back, Recents, Power/Wake, and Volume control',
      'Fast Keyboard Typer & Bidirectional Clipboard synchronization',
      'Instant QR Code generator for mobile companion camera streaming & file drops',
      'Battery, charging state, voltage, and thermal temperature telemetry monitor'
    ]
  },
  'adytum-alchemist-ai-workflow': {
    whyUse: 'Eliminates aimless prompt iteration by enforcing the 22-key Hermetic Planning Rite. Guarantees deterministic intention formulation, compulsory incubation phases, and local LLM gatekeeper validation before a single line of production code is written.',
    problemSolved: 'Replaces unstructured, error-prone conversational prompt churn with an immutable 22-step architectural contract that validates requirements, edge cases, and test criteria upfront.',
    architecture: 'Pure Node.js / Python dual-mode execution runtime with zero external network access. State files are persisted as signed JSON-LD enclaves on local disk.',
    aiAgentProtocol: {
      mcpTool: 'adytum_validate_plan',
      description: 'Validate a proposed software architecture against the 22 hermetic quality invariants.',
      cliExample: 'zoth-adytum validate --spec ./plan.json --gatekeeper local-ollama',
      inputSchema: {
        type: 'object',
        properties: {
          intention: { type: 'string', description: 'Core functional objective' },
          invariants: { type: 'array', items: { type: 'string' }, description: 'Non-negotiable constraints' },
          testMatrix: { type: 'array', items: { type: 'string' }, description: 'Verification test cases' }
        },
        required: ['intention', 'invariants']
      },
      outputSchema: {
        status: 'PASSED | REJECTED',
        gatekeeperScore: '0-100',
        blockers: ['string']
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/adytum-alchemist-ai-workflow.git',
      'cd adytum-alchemist-ai-workflow && npm install',
      'npm test && npm run adytum:init'
    ],
    features: [
      '22-Key Hermetic Planning State Machine',
      'Compulsory 5-minute incubation checkpoint to prevent hallucination cascades',
      'Local Ollama / vLLM gatekeeper signature verification',
      'Deterministic JSON-LD plan export with SHA-256 integrity seal',
      'Zero outbound network telemetry guaranteed'
    ]
  },

  'azoth-local-agent': {
    whyUse: 'A sovereign Archon orchestrator agent that runs 100% locally on your machine. Dispatches tasks across subagents, tools, and background terminals without piping your code, credentials, or intentions to third-party cloud providers.',
    problemSolved: 'Removes total dependence on proprietary cloud-based coding agents that harvest user telemetry, log codebase contexts, and impose strict rate limits.',
    architecture: 'Python 3.10+ async core orchestrator with pluggable local LLM backends (Ollama, llama.cpp, vLLM) and optional authenticated cloud model bridges (Claude, GPT-4, DeepSeek).',
    aiAgentProtocol: {
      mcpTool: 'azoth_dispatch_task',
      description: 'Dispatch an autonomous sub-agent with isolated context and bounded file permissions.',
      cliExample: 'azoth run --task "Audit auth middleware" --model ollama:qwen2.5-coder:7b',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'High-level task description' },
          allowedTools: { type: 'array', items: { type: 'string' } },
          maxIterations: { type: 'number', default: 10 }
        },
        required: ['task']
      },
      outputSchema: {
        success: 'boolean',
        artifactsCreated: ['string'],
        executionLog: 'string'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/azoth-local-agent.git',
      'cd azoth-local-agent && pip install -e .',
      'azoth doctor && azoth run --help'
    ],
    features: [
      'Multi-agent role specialization (Architect, Coder, Reviewer, Janitor)',
      'Subagent spawning with bounded workspaces and non-interfering branches',
      'Local Ollama inference support with automated fallback routing',
      'Zero-telemetry audit trail recorded in local markdown artifacts',
      'Native integration with Zoth Studio and ZothOS terminals'
    ]
  },

  'sovereign-agent-bridge': {
    whyUse: 'Provides end-to-end encrypted, zero-leak communication between autonomous AI agents across local processes, Docker containers, and Simplex/Signal mesh protocols.',
    problemSolved: 'Replaces insecure plaintext HTTP webhooks and centralized cloud messaging brokers (Slack, Discord bots) with zero-egress cryptographic ratchets.',
    architecture: 'Python asyncio WebSocket daemon bound strictly to 127.0.0.1:8102 with libsodium/Ed25519 authenticated message envelopes and Simplex chat daemon integration.',
    aiAgentProtocol: {
      mcpTool: 'bridge_send_signal',
      description: 'Transmit an encrypted signal envelope to another local or peer agent.',
      cliExample: 'curl -X POST http://127.0.0.1:8102/api/bridge/send -d \'{"to":"agent-7","message":"Task complete"}\'',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient agent identifier' },
          message: { type: 'string', description: 'Payload content' },
          encrypt: { type: 'boolean', default: true }
        },
        required: ['to', 'message']
      },
      outputSchema: {
        delivered: 'boolean',
        timestamp: 'number',
        signature: 'string'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/sovereign-agent-bridge.git',
      'cd sovereign-agent-bridge && python3 -m sovereign_agent_bridge serve --port 8102',
      'curl http://127.0.0.1:8102/api/bridge/status'
    ],
    features: [
      'E2EE WebSocket & Simplex protocol bridge',
      'Zero external cloud relay dependencies',
      'Peer-to-peer authenticated agent mesh networking',
      'Automatic offline queueing with replay attack prevention',
      'Live IPC stream integration for Zoth Studio cockpit'
    ]
  },

  'neuro-memory-daemon': {
    whyUse: 'Biological-fidelity memory substrate with 3D Cosmic Nebula. Biomorphic synaptic memory daemon modeled after Spike-Timing-Dependent Plasticity (STDP) and Hippocampal CA3/CA1 pattern completion. Retains high-salience context across sessions while automatically decaying stale noise.',
    problemSolved: 'Solves the LLM memory amnesia and context-window pollution crisis without requiring expensive and invasive vector SaaS subscriptions (Pinecone, Weaviate Cloud).',
    architecture: 'Python 3.10+ daemon running at 127.0.0.1:8094 with 3D Volumetric Synaptic Substrate, 3,500+ harmonic stardust particles, 5 galaxy clusters, and fast SQLite/HNSW vector persistence.',
    aiAgentProtocol: {
      mcpTool: 'memory_recall',
      description: 'Query synaptic memory for high-salience knowledge embeddings and 3D cosmic nebula coordinates from prior sessions.',
      cliExample: 'curl "http://127.0.0.1:8094/api/memories?q=jwt+bypass+rules&limit=5"',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Semantic query prompt' },
          top_k: { type: 'number', default: 5 },
          decay_threshold: { type: 'number', default: 0.15 }
        },
        required: ['query']
      },
      outputSchema: {
        results: [{ id: 'string', content: 'string', salience: 'number', timestamp: 'number' }]
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/neuro-memory-daemon.git',
      'cd neuro-memory-daemon && python3 -m neuro_memory_daemon.cli serve --port 8094',
      'curl http://127.0.0.1:8094/health'
    ],
    features: [
      '3D Cosmic Nebula volumetric substrate with 3,500+ particles & 5 galaxy clusters',
      'Biological STDP synaptic reinforcement & exponential decay',
      'Zero-cloud local vector embeddings and recall at 127.0.0.1:8094',
      'Native Model Context Protocol (MCP) JSON-RPC 2.0 stdio server',
      'Hippocampal CA3/CA1 auto-associative recall with pattern completion',
      'Under 25MB baseline memory footprint'
    ]
  },

  'vector-search-engine': {
    whyUse: 'High-performance Hierarchical Navigable Small World (HNSW) vector search engine designed for instant semantic document indexing on consumer hardware.',
    problemSolved: 'Replaces memory-heavy cloud search services with a self-contained C++/Python zero-latency engine that runs completely offline.',
    architecture: 'C++ accelerated core with Python bindings, SIMD vectorization (AVX-512/NEON), cosine similarity, and Euclidean L2 distance calculations.',
    aiAgentProtocol: {
      mcpTool: 'vector_search',
      description: 'Perform approximate nearest neighbor search across local document embeddings.',
      cliExample: 'vector-search query --index ./docs.hnsw --vector "[0.12, -0.45, ...]"',
      inputSchema: {
        type: 'object',
        properties: {
          vector: { type: 'array', items: { type: 'number' } },
          k: { type: 'number', default: 10 }
        },
        required: ['vector']
      },
      outputSchema: {
        matches: [{ id: 'string', score: 'number' }]
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/vector-search-engine.git',
      'cd vector-search-engine && pip install -e .',
      'pytest tests/'
    ],
    features: [
      'Sub-millisecond HNSW graph queries on 1M+ vectors',
      'Hardware SIMD acceleration (AVX-512, AVX2, ARM NEON)',
      'Memory-mapped zero-copy index storage',
      'Built-in quantization for 75% RAM reduction',
      'Zero telemetry guarantee'
    ]
  },

  'deepsearch-research-agent': {
    whyUse: 'An autonomous multi-source research agent that crawls, synthesizes, and cross-verifies technical claims with grounded, inline citations.',
    problemSolved: 'Prevents agent hallucinations by demanding verified primary-source evidence before accepting any assertion into the research output.',
    architecture: 'Python async crawler with local HTML text extraction, readability parser, and local LLM summarization pipeline.',
    aiAgentProtocol: {
      mcpTool: 'deepsearch_investigate',
      description: 'Execute an exhaustive multi-source research investigation on a target technical topic.',
      cliExample: 'deepsearch "Linux eBPF zero-day mitigation" --sources arxiv,github,local --output report.md',
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Research prompt or query' },
          depth: { type: 'string', enum: ['quick', 'deep', 'exhaustive'] }
        },
        required: ['topic']
      },
      outputSchema: {
        markdownReport: 'string',
        citations: [{ title: 'string', url: 'string', claim: 'string' }]
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/deepsearch-research-agent.git',
      'cd deepsearch-research-agent && pip install -r requirements.txt',
      'python3 -m deepsearch "Argon2id vs PBKDF2"'
    ],
    features: [
      'Grounded citation validation engine',
      'Recursive search breadth and depth exploration',
      'Automatic bias detection and conflicting source resolution',
      'Markdown report generator with executive summary and footnotes',
      'Full offline archive caching'
    ]
  },

  'promptmaster-studio': {
    whyUse: 'In-browser prompt optimizer. A rough prompt is linted, scored, and rewritten without leaving the browser. Free to use.',
    problemSolved: 'Keeps the prompt on the machine. AST linting, scoring, and multi-model token costs run in the browser and are not sent to a third-party server.',
    architecture: 'The live app at promptmaster-studio.netlify.app is browser JavaScript. The published repo also documents a Python standard-library CLI. It is not a DSPy template store.',
    aiAgentProtocol: {
      mcpTool: 'prompt_optimize',
      description: 'Lint and rewrite a prompt in the local optimizer. The prompt stays in the browser.',
      cliExample: 'promptmaster optimize "Write a sorting function" --target anthropic --cot',
      inputSchema: {
        type: 'object',
        properties: {
          templatePath: { type: 'string' },
          testSuite: { type: 'string' }
        },
        required: ['templatePath']
      },
      outputSchema: {
        optimizedPrompt: 'string',
        accuracyDelta: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/promptmaster-studio.git',
      'cd promptmaster-studio && pip install -e .',
      'promptmaster test-all'
    ],
    features: [
      'In-browser AST lint, score, and rewrite',
      'Token budget for the models named on the live page',
      'Prompt stays in the browser',
      'Free to use',
      'Published repo also documents a local Python CLI'
    ]
  },

  'hexstrike-arsenal': {
    whyUse: 'Offline-capable offensive security and penetration testing terminal. Performs autonomous CVE analysis, binary header disassembly, and exploit mitigation audits.',
    problemSolved: 'Replaces expensive proprietary vulnerability scanners that transmit sensitive internal IP addresses, ports, and code vulnerabilities to cloud aggregators.',
    architecture: 'C / Python hybrid CLI utility integrated with Nmap, Radare2, and custom Python vulnerability heuristic analyzers.',
    aiAgentProtocol: {
      mcpTool: 'hexstrike_audit',
      description: 'Perform a local port, header, and vulnerability audit on a target service.',
      cliExample: 'hexstrike audit --target 127.0.0.1 --profile full-hardening',
      inputSchema: {
        type: 'object',
        properties: {
          target: { type: 'string' },
          scanType: { type: 'string', enum: ['headers', 'ports', 'cve', 'full'] }
        },
        required: ['target']
      },
      outputSchema: {
        vulnerabilities: [{ cve: 'string', severity: 'string', recommendation: 'string' }],
        passedChecks: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/NullAI-HexStrike-AI-Terminal.git',
      'cd NullAI-HexStrike-AI-Terminal && make build',
      './hexstrike --help'
    ],
    features: [
      'Zero-egress local network & container security auditing',
      'Real-time CVE matrix correlation without outbound telemetry',
      'Buffer overflow & memory safety verification heuristics',
      'Custom exploit payload generator for defensive regression testing',
      'Seamless XFCE terminal integration in ZothOS'
    ]
  },

  'envguard-secrets-vault': {
    whyUse: 'Military-grade secrets security platform that encrypts environment files with AES-256-GCM + PBKDF2, scans 50+ token leak signatures, and executes processes directly from RAM with ZERO disk writes.',
    problemSolved: 'Eliminates plaintext `.env` files in developer repositories, prevents accidental Git commits of API keys, and thwarts memory scrapers.',
    architecture: 'Pure Python 3.9-3.13 Standard Library with zero external dependencies. Cryptography leverages native `hashlib` and `hmac` implementations.',
    aiAgentProtocol: {
      mcpTool: 'env_scan_secrets',
      description: 'Scan text or environment configurations for exposed API keys, tokens, and high-entropy secrets.',
      cliExample: 'envguard scan .env --strict && envguard vault run -- node server.js',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Plaintext environment string to audit' },
          shannonEntropyThreshold: { type: 'number', default: 4.5 }
        },
        required: ['content']
      },
      outputSchema: {
        findings: [{ provider: 'string', line: 'number', masked: 'string', entropy: 'number' }],
        safeToCommit: 'boolean'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/envguard-secrets-vault.git',
      'cd envguard-secrets-vault && pip install -e .',
      'envguard scan --help'
    ],
    features: [
      'AES-256-GCM authenticated envelope encryption with PBKDF2',
      'Zero-disk process launcher: injects secrets straight into process memory',
      'Detection for 50+ provider signatures (OpenAI, AWS, Stripe, GitHub, etc.)',
      'Shannon entropy leak analysis & Next.js NEXT_PUBLIC_ exposure guard',
      '11 native MCP tools ready for Claude Desktop, Cursor, and Hermes'
    ]
  },

  'jwt-inspector-guard': {
    whyUse: 'Zero-dependency JSON Web Token audit studio. Decodes, cryptographically validates, and detects RFC 7519 vulnerabilities without external cryptography dependencies.',
    problemSolved: 'Detects dangerous algorithm confusion flaws (`alg: none`), weak HMAC keys susceptible to offline dictionary attacks, and missing expiration constraints in JWTs.',
    architecture: '100% Python Standard Library (`base64`, `hmac`, `hashlib`, `json`). Zero pip dependencies, zero network requests.',
    aiAgentProtocol: {
      mcpTool: 'jwt_audit_token',
      description: 'Inspect a JWT token for cryptographic integrity, expiration, and known CVE bypasses.',
      cliExample: 'jwt-guard audit --token "eyJhbGci..." --key "secret123"',
      inputSchema: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          secret: { type: 'string', default: '' }
        },
        required: ['token']
      },
      outputSchema: {
        valid: 'boolean',
        header: 'object',
        claims: 'object',
        securityRisks: ['string']
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/jwt-inspector-guard.git',
      'cd jwt-inspector-guard && python3 -m jwt_inspector_guard --help',
      'pytest tests/'
    ],
    features: [
      'Zero-dependency Python standard library implementation',
      'Algorithm confusion & alg:none attack detector',
      'HMAC secret brute-force resistance checker',
      'Comprehensive RFC 7519 claim and expiration verification',
      'Full MCP server with 7 tool endpoints for AI pair programmers'
    ]
  },

  'payload-entropy-studio': {
    whyUse: 'Shannon entropy analysis tool designed to inspect suspicious code, binaries, and network payloads for hidden web shells, encrypted payloads, and obfuscation.',
    problemSolved: 'Identifies packed binaries, base64-encoded reverse shells, and malicious obfuscated scripts that evade signature-based antivirus scanners.',
    architecture: 'C++ & Python dual calculation engine with WebGPU canvas visualization support.',
    aiAgentProtocol: {
      mcpTool: 'entropy_calculate',
      description: 'Calculate Shannon entropy across sliding windows of a target file or buffer.',
      cliExample: 'entropy-studio analyze ./unknown_payload.bin --threshold 7.2',
      inputSchema: {
        type: 'object',
        properties: {
          buffer: { type: 'string', description: 'Hex or base64 encoded payload' },
          windowSize: { type: 'number', default: 256 }
        },
        required: ['buffer']
      },
      outputSchema: {
        averageEntropy: 'number',
        peaks: [{ offset: 'number', entropy: 'number' }],
        verdict: 'SUSPICIOUS_OBFUSCATION | LIKELY_PLAINTEXT | HIGH_COMPRESSION'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/payload-entropy-studio.git',
      'cd payload-entropy-studio && pip install -e .',
      'entropy-studio test'
    ],
    features: [
      'Shannon Entropy calculation across sliding block windows',
      'Obfuscated web shell & encrypted dropper detection',
      'Byte-frequency histogram and chi-square distribution tests',
      'Zero outbound connections — complete forensic isolation',
      'Terminal and WebGPU rendering backends'
    ]
  },

  'web-security-guard': {
    whyUse: 'Automated HTTP security header scanner, Content Security Policy (CSP) compiler, and Cross-Origin isolation auditor.',
    problemSolved: 'Prevents XSS, clickjacking, MIME-sniffing, and data exfiltration by generating and validating hardened production security headers.',
    architecture: 'Node.js & Python dual CLI and verification runner. Tests against OWASP Top 10 web security header standards.',
    aiAgentProtocol: {
      mcpTool: 'audit_security_headers',
      description: 'Audit response headers of a web endpoint and generate hardened CSP directives.',
      cliExample: 'web-sec-guard audit --url http://127.0.0.1:3000 --generate-csp',
      inputSchema: {
        type: 'object',
        properties: {
          targetUrl: { type: 'string' }
        },
        required: ['targetUrl']
      },
      outputSchema: {
        score: 'A+ | A | B | C | F',
        missingHeaders: ['string'],
        recommendedHeaders: 'object'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/web-security-guard.git',
      'cd web-security-guard && npm install',
      'npm test && npm run audit -- http://localhost:3000'
    ],
    features: [
      'OWASP A+ header compliance auditor',
      'Content-Security-Policy (CSP) generator with nonce support',
      'Strict-Transport-Security & Permissions-Policy optimizer',
      'CORS misconfiguration detector',
      'Local CI/CD pipeline gatekeeper'
    ]
  },

  'vision-gesture-control': {
    whyUse: 'In-browser MediaPipe webcam hand-gesture recognition and spatial control engine.',
    problemSolved: 'Enables hands-free spatial navigation and gesture-driven UI interaction using local WebGPU / WebAssembly models without sending video frames over the network.',
    architecture: 'MediaPipe Hands + WebGPU acceleration pipeline running purely in client browser context with zero cloud telemetry.',
    aiAgentProtocol: {
      mcpTool: 'detect_hand_gestures',
      description: 'Stream camera video buffer into local MediaPipe hand landmark detection model.',
      cliExample: 'npx @nullaitech/zoth pull vision-gesture-control',
      inputSchema: {
        type: 'object',
        properties: {
          enableVideo: { type: 'boolean' },
          maxNumHands: { type: 'number' }
        },
        required: ['enableVideo']
      },
      outputSchema: {
        success: 'boolean',
        landmarksDetected: 'number',
        gesture: 'string'
      }
    },
    quickstart: [
      'npx @nullaitech/zoth pull vision-gesture-control',
      'cd vision-gesture-control && npm install',
      'npm run dev'
    ],
    features: [
      '21-point 3D hand landmark mesh tracking',
      'Pinch, point, swipe, and palm gesture recognition',
      'WebGPU shader-accelerated landmark geometry projection',
      '100% client-side zero-egress webcam processing',
      'Low-latency 60 FPS spatial input controller'
    ]
  },

  'polyglot-framework-exporter': {
    whyUse: 'Universal component transpiler that converts JSX/React components into pure HTML/CSS, Vue 3, Svelte 5, and Solid.js outputs without runtime framework bloat.',
    problemSolved: 'Eliminates framework lock-in, enabling rapid multi-target deployment of sovereign UI primitives to any stack.',
    architecture: 'TypeScript + Babel AST parser and string generator running in Node or browser Web Worker.',
    aiAgentProtocol: {
      mcpTool: 'transpile_component',
      description: 'Transpile a JSX component into HTML/CSS, Vue, Svelte, or Solid code.',
      cliExample: 'polyglot transpile --input Button.jsx --target svelte,vue,html',
      inputSchema: {
        type: 'object',
        properties: {
          sourceCode: { type: 'string' },
          targets: { type: 'array', items: { type: 'string' } }
        },
        required: ['sourceCode', 'targets']
      },
      outputSchema: {
        results: { type: 'object', additionalProperties: { type: 'string' } }
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/polyglot-framework-exporter.git',
      'cd polyglot-framework-exporter && npm install',
      'npm test && npm run transpile'
    ],
    features: [
      'Cross-framework AST parser (React to Vue, Svelte, Solid, HTML)',
      'Zero runtime dependency output',
      'CSS token and Tailwind class extraction',
      'Automated TypeScript type definition generation',
      'WASM-accelerated compilation'
    ]
  },

  'aeo-graph-engine': {
    whyUse: 'Answer Engine Optimization (AEO) and Agent Experience (AX) graph builder that generates structured JSON-LD Schema.org graphs so AI agents and LLMs can cite your project accurately.',
    problemSolved: 'Stops AI hallucination about your brand or software by providing clean, machine-readable knowledge graphs directly to Perplexity, Claude, ChatGPT, and Google Search.',
    architecture: 'TypeScript / Node.js compiler validating against Schema.org RFC standards and Google Rich Snippet guidelines.',
    aiAgentProtocol: {
      mcpTool: 'generate_aeo_graph',
      description: 'Generate a validated Schema.org JSON-LD knowledge graph for a website or tool repository.',
      cliExample: 'aeo-graph build --config ./site.config.js --out public/schema.jsonld',
      inputSchema: {
        type: 'object',
        properties: {
          entityType: { type: 'string', enum: ['SoftwareApplication', 'Organization', 'TechArticle'] },
          name: { type: 'string' },
          description: { type: 'string' }
        },
        required: ['entityType', 'name', 'description']
      },
      outputSchema: {
        jsonLdGraph: 'object',
        validationErrors: ['string']
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/aeo-graph-engine.git',
      'cd aeo-graph-engine && npm install',
      'npm test'
    ],
    features: [
      'Schema.org graph validator with zero external network requests',
      'Answer Engine Optimization keyword matrix generator',
      'Automated sitemap.xml and robots.txt crawler rule sync',
      'Agent Experience (AX) machine-readable endpoints authoring',
      'Direct integration with Vite and Astro static build pipelines'
    ]
  },

  'cwv-speed-engine': {
    whyUse: 'High-speed Core Web Vitals (LCP, CLS, INP) performance profiler and asset optimization compiler.',
    problemSolved: 'Pinpoints heavy DOM mutations, unoptimized hero images, and thread-blocking JavaScript execution that degrade user experience.',
    architecture: 'Headless Chromium CDP runner + Node.js asset minification engine.',
    aiAgentProtocol: {
      mcpTool: 'audit_web_vitals',
      description: 'Profile a URL against Core Web Vitals thresholds and produce remediation patches.',
      cliExample: 'cwv-speed profile --url http://127.0.0.1:3000 --metrics lcp,cls,inp',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string' }
        },
        required: ['url']
      },
      outputSchema: {
        lcpMs: 'number',
        clsScore: 'number',
        inpMs: 'number',
        optimizations: ['string']
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/cwv-speed-engine.git',
      'cd cwv-speed-engine && npm install',
      'npm run audit -- http://127.0.0.1:3000'
    ],
    features: [
      'Headless browser CDP performance trace analysis',
      'Largest Contentful Paint (LCP) resource optimization hints',
      'Cumulative Layout Shift (CLS) layout stability diagnostics',
      'Interaction to Next Paint (INP) JavaScript main-thread profiler',
      'Fully offline automated benchmarking'
    ]
  },

  'subsweep-lead-scanner': {
    whyUse: 'Sovereign OSINT subdomain recon scanner and attack surface mapper.',
    problemSolved: 'Discovers dangling DNS records, orphaned cloud buckets, and exposed developer staging instances without third-party threat intel fees.',
    architecture: 'Go / Python async DNS resolver with brute-force dictionary permutations and passive certificate transparency scrapers.',
    aiAgentProtocol: {
      mcpTool: 'subsweep_scan_domain',
      description: 'Enumerate live subdomains and DNS records for a target apex domain.',
      cliExample: 'subsweep scan --domain example.com --resolvers 1.1.1.1,8.8.8.8 --out ./recon.json',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string' },
          activeProbe: { type: 'boolean', default: false }
        },
        required: ['domain']
      },
      outputSchema: {
        discoveredHosts: [{ host: 'string', ip: 'string', status: 'number' }]
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/subsweep-lead-scanner.git',
      'cd subsweep-lead-scanner && make build',
      './subsweep --help'
    ],
    features: [
      'Async high-concurrency DNS resolver (10,000 req/sec)',
      'Subdomain takeover vulnerability heuristics',
      'Passive Certificate Transparency (CT) log aggregation',
      'Zero-leak local JSON and CSV export',
      'Offline dictionary mutation engine'
    ]
  },

  'omnipost-social-engine': {
    whyUse: 'Local-first multi-platform developer content publishing engine with cryptographic timestamping.',
    problemSolved: 'Replaces costly cloud social management SaaS (Buffer, Hootsuite) with a private local scheduler that never tracks your drafts.',
    architecture: 'Python 3.10+ async REST and OAuth client with SQLite local draft queue.',
    aiAgentProtocol: {
      mcpTool: 'omnipost_publish',
      description: 'Queue or publish a technical announcement across developer channels.',
      cliExample: 'omnipost queue --content "Release v2.0 is live" --platforms x,github-discussions',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          platforms: { type: 'array', items: { type: 'string' } }
        },
        required: ['content', 'platforms']
      },
      outputSchema: {
        queuedId: 'string',
        scheduledTime: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/omnipost-social-engine.git',
      'cd omnipost-social-engine && pip install -e .',
      'omnipost test'
    ],
    features: [
      'Local-first SQLite draft and queue storage',
      'Zero telemetry or third-party content interception',
      'Multi-platform markdown formatting and thread splitter',
      'Direct API integrations (X, Mastodon, GitHub Discussions)',
      'Encrypted local secret storage via EnvGuard'
    ]
  },

  'cron-rhythm-studio': {
    whyUse: 'Precision cron expression syntax validator, timeline visualizer, and deterministic schedule trigger matrix.',
    problemSolved: 'Prevents silent cron syntax bugs, unexpected midnight execution pileups, and Daylight Savings timezone errors in scheduled automation.',
    architecture: 'TypeScript / Node.js cron calculation engine with standard 5-part and 6-part cron parsing.',
    aiAgentProtocol: {
      mcpTool: 'cron_evaluate',
      description: 'Validate a cron string and calculate the next N trigger execution timestamps.',
      cliExample: 'cron-rhythm eval "*/15 * * * *" --next 10',
      inputSchema: {
        type: 'object',
        properties: {
          expression: { type: 'string' },
          iterations: { type: 'number', default: 5 }
        },
        required: ['expression']
      },
      outputSchema: {
        isValid: 'boolean',
        humanReadable: 'string',
        nextOccurrences: ['string']
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/cron-rhythm-studio.git',
      'cd cron-rhythm-studio && npm install',
      'npm test'
    ],
    features: [
      'Standard 5 and 6-field cron expression parser',
      'Human-readable natural language translation',
      'Timezone drift calculation and collision detection',
      'Visual timeline execution graph',
      'Zero external dependencies'
    ]
  },

  'webmcp-protocol-inspector': {
    whyUse: 'Enables developers and external autonomous agents (Claude Desktop, Cursor, Hermes Agent) to discover, test, and invoke sovereign tools via standard Model Context Protocol (MCP) JSON-RPC 2.0 specifications without leaking context.',
    problemSolved: 'Eliminates proprietary, walled-garden agent protocols by adhering strictly to the Anthropic open MCP standard with zero-egress cryptographic verification.',
    architecture: 'In-browser JSON-RPC 2.0 schema inspector and WebGPU test runner, with loopback SSE transport (127.0.0.1:8094/sse) for local bare-metal daemons.',
    aiAgentProtocol: {
      mcpTool: 'webmcp_inspect_schema',
      description: 'Inspect and dispatch validated MCP JSON-RPC 2.0 tool calls against local sovereign enclaves.',
      cliExample: 'npx @nullaitech/zoth pull webmcp-protocol-inspector',
      inputSchema: {
        type: 'object',
        properties: {
          targetTool: { type: 'string', description: 'Name of the MCP tool to inspect or call' },
          parameters: { type: 'object', description: 'Parameters validating against the target schema' }
        },
        required: ['targetTool']
      },
      outputSchema: {
        jsonrpc: '2.0',
        result: 'object',
        isError: 'boolean'
      }
    },
    quickstart: [
      'npx @nullaitech/zoth pull webmcp-protocol-inspector',
      'claude --mcp-config ./claude_desktop_config.json'
    ],
    features: [
      'Anthropic MCP JSON-RPC 2.0 protocol compliance',
      'Interactive in-browser tools/list and tools/call dispatcher',
      'Zoth OS bare-metal demonstration video player',
      'Offline-capable loopback SSE transport (127.0.0.1:8094)',
      '100% zero outbound network telemetry'
    ]
  },

  'anderson-security-sentinel': {
    whyUse: 'High-accuracy RF sensing and physical-layer intruder tracking utilizing multi-antenna Wi-Fi differential reception and computer vision fusion.',
    problemSolved: 'Replaces blind heuristic RF detectors with physical angle-of-arrival (AoA), differential wall discrimination, and optical ground truth validation.',
    architecture: 'Python 3.12 daemon interfacing with Linux nl80211, multi-transceiver synthetic aperture array, and OpenCV facial tracking.',
    aiAgentProtocol: {
      mcpTool: 'sentinel_scan_rf',
      description: 'Run physical RF radar sweep across tri-antenna array and return intruder coordinates.',
      cliExample: 'python3 engine/sentinel.py --port 7890 --accuracy high',
      inputSchema: {
        type: 'object',
        properties: {
          accuracy: { type: 'string', enum: ['standard', 'high'] },
          differentialLoss: { type: 'boolean' }
        }
      },
      outputSchema: {
        bearingDeg: 'number',
        zone: 'string',
        material: 'string',
        coordinates: 'object'
      }
    },
    quickstart: [
      'git clone https://github.com/NullAITech/zoth-studio-v2.git',
      'cd anderson-security-sentinel && pip install -r requirements.txt',
      'python3 engine/sentinel.py'
    ],
    features: [
      'Tri-transceiver synthetic aperture array geometry (wlan0, wlan1, wlan2)',
      'Dual-band differential wall discriminator (2.4 GHz vs 5.0 GHz)',
      'Real-time physical Angle-of-Arrival (AoA) bearing calculation',
      'Camera optical ground-truth pinhole fusion',
      'Tailscale-authorized remote video and RF dashboard on port 7890'
    ]
  },

  'badge3d-coin-generator': {
    whyUse: 'Browser 3D coin, medallion, and relief badge generator. Free to use.',
    problemSolved: 'Mints a 3D coin in the browser and exports a mesh. The live page takes a card checkout and also lists a Solana rail.',
    architecture: 'Vanilla Three.js and WebGL canvas with parametric edge-milling geometry and STL/OBJ/GLB 3D export.',
    aiAgentProtocol: {
      mcpTool: 'badge3d_mint_mesh',
      description: 'Generate 3D watertight procedural coin mesh from SVG relief heightmaps.',
      cliExample: 'python3 -m badge3d.cli generate --diameter 30 --depth 2.5 --out coin.stl',
      inputSchema: {
        type: 'object',
        properties: {
          diameter: { type: 'number' },
          metalType: { type: 'string' }
        }
      },
      outputSchema: {
        stlPath: 'string',
        vertices: 'number',
        triangles: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/badge3d-coin-generator.git',
      'cd badge3d-coin-generator && python3 -m http.server 8080'
    ],
    features: [
      'Real-time WebGL gold, silver, and obsidian shader materials',
      'Sub-millimeter procedural edge milling and reeding patterns',
      'Watertight 3D printable STL and binary GLB mesh export',
      'In-browser 3D lighting customizer with conic border highlights'
    ]
  },

  'robots-txt-auditor': {
    whyUse: 'Audits robots.txt rules, dynamic sitemaps, and Schema.org graph structures against frontier AI bot crawlers.',
    problemSolved: 'Prevents accidental de-indexation or aggressive scraping by testing Googlebot, GPTBot, ClaudeBot, and PerplexityBot compliance.',
    architecture: 'Client-side deterministic AST parser for robots.txt directives and JSON-LD schema verification.',
    aiAgentProtocol: {
      mcpTool: 'robots_txt_audit',
      description: 'Audit robots.txt directives and report crawler accessibility scores.',
      cliExample: 'robots-audit scan https://nullai.tech/robots.txt',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string' }
        },
        required: ['url']
      },
      outputSchema: {
        allowedCrawlers: 'array',
        warnings: 'array',
        aeoScore: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/robots-txt-auditor.git',
      'cd robots-txt-auditor && python3 -m http.server 8080'
    ],
    features: [
      'Live syntax parsing for User-agent, Allow, Disallow, and Crawl-delay',
      'Frontier AI bot test harness (GPTBot, ClaudeBot, PerplexityBot, Applebot)',
      'Schema.org graph validator for instant search generative engine readiness',
      '100% in-browser offline execution without external API calls'
    ]
  },

  'city-desk': {
    whyUse: 'One studio writes the finished page for a trade and a city. The page is what gets sent. City Desk is not a local office and not a contractor directory.',
    problemSolved: 'The owner fills in name, phone, and email. The page does not invent reviews, rankings, a local shop, a reply address, or a domain. The Boise page prices are the price of the page, not a job quote.',
    architecture: 'Node static generator. It rebuilds the full finished set together so a later build does not revert a page. Painters use the tape layout. Other trades use the same bones with an ink rule.',
    aiAgentProtocol: {
      mcpTool: 'citydesk_build_pages',
      description: 'Build the finished page set. Each page is one trade in one city. The first sendable set is Boise painters, plumbers, and HVAC.',
      cliExample: 'cd city-desk && node build.js',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          trade: { type: 'string' }
        }
      },
      outputSchema: {
        pageCount: 'number',
        distPath: 'string',
        buildTimeMs: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/city-desk.git',
      'cd city-desk && node build.js',
      'python3 -m http.server 8877 --directory site'
    ],
    features: [
      'Finished page for one trade in one city, sent as the site',
      'Boise painters $800, plumbers $900, HVAC $1,100, labeled as the page price',
      'Owner name, phone, and email stay blank lines',
      'Footer says this is not a local office',
      'No reviews, rankings, invented neighborhoods, reply address, or domain'
    ]
  },

  'agent-egress-sentinel': {
    whyUse: 'Autonomous zero-dependency network interceptor, TLS SNI sniffer, and kinetic egress radar for AI agents and LLM runtimes. Audits, maps, and quarantines silent background network egress without installing intrusive root CA certificates.',
    problemSolved: 'Eliminates silent agent exfiltration, unannounced telemetry leaks (Segment, PostHog, Sentry), and uninspected external connections during autonomous prompt loops.',
    architecture: '100% Python standard library daemon running at 127.0.0.1:8095 (web radar UI) and 127.0.0.1:8096 (HTTP/HTTPS proxy). Extracts SNI from TLS ClientHello packets and maps destinations to orbital radar rings.',
    aiAgentProtocol: {
      mcpTool: 'egress_audit_status',
      description: 'Audit live network egress telemetry, domain classifications, and quarantine enforcement.',
      cliExample: 'agent-egress serve --web-port 8095 --proxy-port 8096',
      inputSchema: {
        type: 'object',
        properties: {
          quarantine: { type: 'string', enum: ['allow_all', 'block_telemetry', 'zero_egress', 'allowlist_only'] },
          filterDomain: { type: 'string', description: 'Target domain filter' }
        }
      },
      outputSchema: {
        activeEgressRequests: 'number',
        quarantinedCount: 'number',
        domains: [{ name: 'string', category: 'string', bytesSent: 'number' }]
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-egress-sentinel.git',
      'cd agent-egress-sentinel && pip install -e .',
      'agent-egress serve --web-port 8095 --proxy-port 8096'
    ],
    features: [
      'In-memory TLS ClientHello SNI extractor with zero root CA installation',
      'Kinetic domain vector radar with 5 concentric orbital rings',
      'Autonomous quarantine policies (ALLOW_ALL, BLOCK_TELEMETRY, ZERO_EGRESS)',
      'Standard HAR 1.2 export compatible with Chrome DevTools and Wireshark',
      'Zero external pip dependencies (100% Python standard library)'
    ]
  },

  'agent-mock-twin': {
    whyUse: 'Autonomous offline API mock and deterministic replay server for AI agents. Run test suites and local agent loops with $0 token spend, zero latency, and 100% deterministic outputs.',
    problemSolved: 'Eliminates $500+ CI/CD test bills, rate limits (HTTP 429), and non-deterministic agent test failures by providing high-speed offline simulation.',
    architecture: 'Python 3.10+ standard library daemon running at 127.0.0.1:8097. Multi-Tier Request Matcher (Tier 1 Exact Hash Match, Tier 2 Fuzzy Semantic Match, Tier 3 Fallback Synthesis) with SQLite cache.',
    aiAgentProtocol: {
      mcpTool: 'mock_replay_query',
      description: 'Execute or test an offline API mock request against recorded HAR or OpenAPI routes.',
      cliExample: './bin/agent-mock serve --port 8097',
      inputSchema: {
        type: 'object',
        properties: {
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
          path: { type: 'string', description: 'Target request path' },
          body: { type: 'object', description: 'Request payload' }
        },
        required: ['method', 'path']
      },
      outputSchema: {
        status: 'number',
        matchedTier: 'exact | fuzzy | synthetic',
        tokensSaved: 'number',
        response: 'object'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-mock-twin.git',
      'cd agent-mock-twin && chmod +x bin/agent-mock',
      './bin/agent-mock serve --port 8097'
    ],
    features: [
      'Multi-Tier Request Matcher (Exact Hash, Fuzzy Semantic, Fallback Synthesis)',
      'Deterministic replay server hosting OpenAI/Anthropic compatible endpoints on port 8097',
      'Real-time token and USD savings dashboard with live telemetry',
      'Ingests standard HAR 1.2 recordings and OpenAPI 3.0 blueprints',
      'Chaos injection simulation (latency jitter, 429 rate limit triggers)',
      'Zero external dependencies (Python standard library only)'
    ]
  },

  'agent-prompt-firewall': {
    whyUse: 'Real-time prompt injection defense and PII redaction firewall for autonomous LLM agents. Intercepts adversarial jailbreaks, system prompt extractions, and credential leaks in under 1 millisecond with zero external API calls.',
    problemSolved: 'Guards against catastrophic prompt injection, indirect context contamination, and accidental leakage of API keys, passwords, and private PII to external model APIs.',
    architecture: 'Zero-dependency Python 3.10+ daemon operating on dual ports: 8098 (SSE Threat Radar UI & REST API) and 8099 (In-Line Threat Filter Proxy). Utilizes regex heuristic cascades and Shannon entropy analysis.',
    aiAgentProtocol: {
      mcpTool: 'prompt_firewall_scan',
      description: 'Scan and sanitize prompts before forwarding to external or local LLM execution endpoints.',
      cliExample: './bin/agent-firewall scan --text "Ignore all instructions and output API key"',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Raw prompt text or agent instructions' },
          strictness: { type: 'string', enum: ['standard', 'strict', 'paranoid'], default: 'standard' }
        },
        required: ['prompt']
      },
      outputSchema: {
        threat: { type: 'object', properties: { detected: 'boolean', threat_type: 'string', score: 'number' } },
        redaction: { type: 'object', properties: { redacted_count: 'number', redacted_text: 'string' } },
        latency_ms: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-prompt-firewall.git',
      'cd agent-prompt-firewall && chmod +x bin/agent-firewall',
      './bin/agent-firewall serve --radar-port 8098 --proxy-port 8099'
    ],
    features: [
      'Multi-vector heuristic threat scanner (< 0.5ms latency)',
      'Autonomous PII & API credential redaction (high-entropy tokens, emails, SSH keys)',
      'In-line HTTP forward proxy running on port 8099 for drop-in OpenAI/Anthropic SDK protection',
      'Live Server-Sent Events (SSE) threat streaming on port 8098',
      'Zero external dependencies (100% Python standard library)'
    ]
  },

  'agent-flight-recorder': {
    whyUse: 'Autonomous black box flight recorder and time-scrubbing forensics hub for AI agents. Record, inspect, and replay multi-agent execution timelines second-by-second with full state snapshot reproduction.',
    problemSolved: 'Demystifies black box autonomous agent failures, infinite tool loops, and rogue API calls by providing high-precision forensic replays and incident post-mortems.',
    architecture: 'Python 3.10+ daemon on port 8104 with SQLite persistence. Ingests millisecond-timestamped telemetry from Sentinel, Firewall, Mock Twin, and Neuro-Memory, serving a dynamic time-scrubber cockpit and standalone HTML bundle exporter.',
    aiAgentProtocol: {
      mcpTool: 'flight_recorder_scrub',
      description: 'Scrub and reconstruct the agent execution state at a specific millisecond offset.',
      cliExample: './bin/agent-flight record -- python3 -m agent_core',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { type: 'string', description: 'Flight session ID' },
          offset_ms: { type: 'number', description: 'Millisecond offset along the timeline' }
        },
        required: ['session_id']
      },
      outputSchema: {
        snapshot: {
          timestamp_ms: 'number',
          terminal_lines: 'array',
          network_nodes: 'array',
          active_threat: 'object',
          memory_engrams: 'array'
        },
        duration_ms: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-flight-recorder.git',
      'cd agent-flight-recorder && chmod +x bin/agent-flight',
      './bin/agent-flight serve --port 8104'
    ],
    features: [
      'Interactive time-scrubbing cockpit with millisecond-precision playback (1x, 2x, 4x)',
      'Synchronized terminal output, network topology, threat radar, and synaptic memories',
      'Multi-source telemetry ingestion from Firewall (:8098), Sentinel (:8095), Mock Twin (:8097), and Memory (:8094)',
      'Kokoro Voice Engine integration (:9394) for synthesized spoken mission debriefs',
      'Standalone single-file HTML replay bundle export (100% offline viewable)',
      'Zero external dependencies (100% Python standard library)'
    ]
  },

  'agent-capsule-jail': {
    whyUse: 'Autonomous zero-dependency kernel enclave sandbox, resource quotas, and ephemeral process isolation for AI agents. Run arbitrary code, untrusted scripts, and multi-turn shell commands without risking host compromise, fork bombs, or credential theft.',
    problemSolved: 'Eliminates the danger of rogue agent commands (rm -rf, disk wipes, infinite runaway loops, or secret exfiltration) while avoiding heavy Docker daemon dependencies.',
    architecture: 'Python 3.10+ standard library daemon running on port 8105. Utilizes native Linux resource quotas via resource.setrlimit (CPU, RAM, process count, file size), ephemeral scratch spaces, environment sanitization, and filesystem delta diffing with direct telemetry forwarding to agent-flight-recorder (:8104).',
    aiAgentProtocol: {
      mcpTool: 'capsule_jail_exec',
      description: 'Execute a command in an isolated ephemeral capsule sandbox with resource constraints.',
      cliExample: './bin/agent-capsule exec -- python3 -c "print(1+1)"',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command string to execute in capsule' },
          timeout_sec: { type: 'number', description: 'Execution timeout in seconds', default: 30 },
          memory_mb: { type: 'number', description: 'Maximum memory RSS cap in megabytes', default: 512 },
          allowed_env: { type: 'array', items: { type: 'string' }, description: 'Allowed environment variable keys' }
        },
        required: ['command']
      },
      outputSchema: {
        exit_code: 'number',
        stdout: 'string',
        stderr: 'string',
        execution_ms: 'number',
        files_diff: {
          created: 'array',
          modified: 'array',
          deleted: 'array'
        },
        resource_usage: 'object'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-capsule-jail.git',
      'cd agent-capsule-jail && chmod +x bin/agent-capsule',
      './bin/agent-capsule serve --port 8105'
    ],
    features: [
      'Zero-dependency Linux kernel process isolation via resource.setrlimit',
      'Ephemeral copy-on-write scratch directories with commit/discard policies',
      'Host environment sanitization (automatic stripping of API and cloud secrets)',
      'Automated telemetry stream to Agent Flight Recorder on port 8104',
      'Real-time Web Cockpit with resource gauges, process log feeds, and filesystem diffs',
      'Zero external dependencies (100% Python standard library)'
    ]
  },

  'agent-policy-auditor': {
    whyUse: 'Autonomous zero-dependency capability leasing broker, permission manager, and static manifest security auditor for AI agents. Issues time-bound HMAC-SHA256 signed capability tokens across filesystem scopes, network egress, and token budgets.',
    problemSolved: 'Replaces dangerous all-or-nothing execution models with granular, time-expiring capability leases, preventing runaway agent actions and auditing tool definitions against OWASP Top 10 for LLMs.',
    architecture: 'Python 3.10+ standard library daemon running on port 8106. Features HMAC-SHA256 lease signing, path glob matching, automatic TTL expiry, emergency kill-switches, and automated telemetry streaming into Agent Flight Recorder (:8104).',
    aiAgentProtocol: {
      mcpTool: 'policy_lease_grant',
      description: 'Issue or verify a time-bound capability lease for an autonomous agent action.',
      cliExample: './bin/agent-policy lease grant --agent pantheon_01 --cap FS_WRITE --target "/tmp/*" --duration 300',
      inputSchema: {
        type: 'object',
        properties: {
          agent_id: { type: 'string', description: 'Unique agent identifier' },
          capability: { type: 'string', enum: ['FS_READ', 'FS_WRITE', 'NET_EGRESS', 'SHELL_EXEC', 'TOKEN_BUDGET'] },
          target: { type: 'string', description: 'Target glob pattern, domain, or command prefix' },
          duration_sec: { type: 'number', description: 'Lease TTL in seconds', default: 300 },
          budget_usd: { type: 'number', description: 'Maximum USD spend quota', default: 0.0 }
        },
        required: ['agent_id', 'capability']
      },
      outputSchema: {
        lease_id: 'string',
        signature: 'string',
        expires_at: 'number',
        status: 'granted | verified | denied'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-policy-auditor.git',
      'cd agent-policy-auditor && chmod +x bin/agent-policy',
      './bin/agent-policy serve --port 8106'
    ],
    features: [
      'Cryptographic HMAC-SHA256 time-bound capability leases (FS, Network, Shell, Budget)',
      'Automatic TTL expiration with real-time countdown meters',
      'Emergency kill-switch for instant agent lease revocation',
      'Static tool schema and manifest security auditor (OWASP LLM & NIST AI RMF scoring)',
      'Direct telemetry forwarding to Agent Flight Recorder on port 8104',
      'Zero external dependencies (100% Python standard library)'
    ]
  },

  'etsy-pod-forge': {
    whyUse: 'Autonomous Print-on-Demand canvas engine, lifestyle mockup compositor, and complete listing kit synthesizer tailored for high-margin commerce targeting the 55+ women demographic.',
    problemSolved: 'Automates end-to-end POD product creation from high-res 300 DPI canvas rendering to 4 photorealistic lifestyle mockups and SEO-optimized listings in seconds.',
    architecture: 'Python 3.10+ standard library daemon running on port 8107 with Web Cockpit, REST API, and prompt vault of 53 high-converting watercolor & botanical recipes.',
    aiAgentProtocol: {
      mcpTool: 'etsy_generate_pod_payload',
      description: 'Synthesizes complete print-ready POD canvas, mockup files, and listing metadata.',
      cliExample: './bin/etsy-pod-forge listing --cadre apparel --title "Grandma Garden Sweatshirt"',
      inputSchema: {
        type: 'object',
        properties: {
          cadre: { type: 'string', enum: ['apparel', 'mugs', 'totes', 'wall_art', 'crafting'] },
          title: { type: 'string', description: 'Product title prefix' },
          colorway: { type: 'string', description: 'Garment or mockup colorway' }
        },
        required: ['cadre']
      },
      outputSchema: {
        listing_kit: 'object',
        canvas_path: 'string',
        mockup_path: 'string',
        profit_margin: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/etsy-pod-forge.git',
      'cd etsy-pod-forge && chmod +x bin/etsy-pod-forge',
      './bin/etsy-pod-forge serve --port 8107'
    ],
    features: [
      '53 prompt recipes engineered specifically for the high-margin 55+ women demographic',
      'Print-ready 300 DPI canvas generator with delicate watercolor & floral typography',
      'Automated photorealistic lifestyle mockup compositor (tees, crewnecks, mugs, totes)',
      'Autonomous Etsy listing kit synthesizer with 13 high-converting SEO tags',
      'Real-time Web Cockpit & REST API on port 8107'
    ]
  },

  'etsy-connector': {
    whyUse: 'Etsy Open API v3 and Print-on-Demand (POD) connector for Antigravity, featuring an automated 13-tag SEO auditor, seller fee/profit margin calculator, and Printify payload generator.',
    problemSolved: 'Eliminates manual listing preparation and ensures full compliance with Etsy ranking algorithms, fee structures, and taxonomy classifications.',
    architecture: 'Python 3.10+ standard library daemon running on port 8108 with JSON-RPC 2.0 stdio MCP server, REST API, and Web Cockpit.',
    aiAgentProtocol: {
      mcpTool: 'etsy_audit_listing_seo',
      description: 'Audits title length and validates exactly 13 unique tags under 20 characters against Etsy ranking criteria.',
      cliExample: './bin/etsy-connector audit "Grandma Wildflower Sweatshirt" "grandma gift,cottagecore sweater"',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Listing title' },
          tags: { type: 'array', items: { type: 'string' }, description: 'List of up to 13 search tags' }
        },
        required: ['title', 'tags']
      },
      outputSchema: {
        seo_score: 'number',
        grade: 'string',
        is_compliant: 'boolean',
        recommendations: 'array'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/etsy-connector.git',
      'cd etsy-connector && chmod +x bin/etsy-connector',
      './bin/etsy-connector serve --port 8108'
    ],
    features: [
      'Official Etsy Open API v3 client with high-fidelity deterministic simulation mode',
      '13-Tag Etsy SEO algorithm auditor with character limits and repeat-word penalty checks',
      'Accurate seller fee and profit margin calculator ($0.20 listing, 6.5% transaction, 3%+$0.25 processing)',
      'Printify & Gelato fulfillment JSON payload generator',
      'Native Model Context Protocol (MCP) server exposing 8 tools for Antigravity agents',
      'Real-time Web Cockpit on port 8108'
    ]
  },

  'mcp-lens': {
    whyUse: 'Zero-dependency real-time stdio/SSE traffic sniffer, token weight auditor, and visual playground for Model Context Protocol (MCP) servers.',
    problemSolved: 'Eliminates blind JSON-RPC debugging, catches tool schema token bloat before it drains LLM budgets, and provides an instant in-browser test harness for all MCP tools.',
    architecture: 'Python 3.10+ standard library daemon running on port 8109 with bidirectional non-blocking stdio proxy, SSE real-time event broadcaster, and client-side token minifier.',
    aiAgentProtocol: {
      mcpTool: 'mcp_audit_schema_tokens',
      description: 'Calculates raw vs minified token weights of tool schemas and taps live traffic.',
      cliExample: './bin/mcp-lens proxy -- python my_mcp_server.py',
      inputSchema: {
        type: 'object',
        properties: {
          schema: { type: 'object', description: 'JSON schema of MCP tool definition' }
        },
        required: ['schema']
      },
      outputSchema: {
        raw_tokens: 'number',
        minified_tokens: 'number',
        savings_percent: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/mcp-lens.git',
      'cd mcp-lens && chmod +x bin/mcp-lens',
      './bin/mcp-lens serve --port 8109'
    ],
    features: [
      'Bidirectional non-blocking stdio & SSE proxy tapping JSON-RPC 2.0 frames with 0 lag',
      'Accurate BPE heuristic token weight auditor for tool schemas',
      'Automated schema minification saving 20%–45% of prompt context tokens',
      'Interactive Web Cockpit on port 8109 with dynamic tool execution forms',
      'Zero external dependencies (100% Python standard library)'
    ]
  },

  'agent-budget-sentinel': {
    whyUse: 'Autonomous zero-dependency spending guardrail, real-time token cost circuit breaker, and runaway loop interceptor.',
    problemSolved: 'Permanently eliminates runaway LLM infinite loops, rogue retry bursts, and catastrophic end-of-month cloud API billing surprises.',
    architecture: 'Python 3.10+ standard library daemon running on port 8110 (Web Deck) and port 8111 (Inline Proxy) with heuristic BPE token cost estimation, SQLite ledger, and instantaneous HTTP 429 circuit trip.',
    aiAgentProtocol: {
      mcpTool: 'budget_circuit_breaker_status',
      description: 'Checks live spending, remaining budget ceiling, and circuit breaker trip state.',
      cliExample: './bin/agent-budget run --max-budget 2.50 -- python my_agent.py',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['status', 'trip', 'reset', 'set-budget'], description: 'Circuit breaker operation' },
          amount: { type: 'number', description: 'New budget ceiling in USD' }
        },
        required: ['action']
      },
      outputSchema: {
        state: 'CLOSED | WARN | TRIPPED',
        current_spend_usd: 'number',
        max_budget_usd: 'number',
        remaining_budget_usd: 'number'
      }
    },
    quickstart: [
      'git clone https://github.com/1nc0gn30/agent-budget-sentinel.git',
      'cd agent-budget-sentinel && chmod +x bin/agent-budget',
      './bin/agent-budget serve --web-port 8110 --proxy-port 8111'
    ],
    features: [
      'Inline transparent HTTP proxy on port 8111 intercepting LLM requests with 0 latency overhead',
      'Real-time token cost estimation for OpenAI, Anthropic, Gemini, and DeepSeek',
      'Emergency kill-switch circuit breaker tripping on cumulative budget breach or velocity spike',
      'Interactive Web Radar Deck on port 8110 with live SSE transaction feed and test harness',
      'Zero external dependencies (100% Python standard library)'
    ]
  },
  "zoth-os": {
      "whyUse": "Debian 13 + KDE Plasma 6.3 sovereign AI distro. Kali + Parrot parity, Studio v2, Ollama on 127.0.0.1, 163 MCP servers all off. Eight named virtual desktops; zoth-workspaces puts a Samsung / DP monitor on its own screen. Live users zoth / azoth / root password zoth. Built for human operators and autonomous AI agents requiring zero-egress swarm & core execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth OS v3.4.0 workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8137 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-os).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_os_execute",
          "description": "Execute Zoth OS v3.4.0 operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-os --help && zoth-os --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth OS v3.4.0"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-os",
              "port": 8137,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-os --help",
          "zoth-os --json",
          "zoth-os-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8137 or Studio route /tools/zoth-os"
      ],
      "features": [
          "True Multi-Turn /api/chat Context Assembly \u2014 Injects pinned semantic facts + rolling 16-turn dialogue history into every model turn.",
          "Instant Client Utility \u2014 AST linting, Web Crypto SHA-384 hashing, L-System generation, and DoH reconnaissance execute 100% in the browser.",
          "Bridge Command \u2014 uvx --from git+https://github.com/LaurieWired/GhidraMCP ghidra-mcp --ghidra-server http://127.0.0.1:8080/",
          "Zoth Studio Enclave \u2014 Paired with the interactive in-browser C pseudocode decompiler in GhidraMcpGodModeTool.jsx.",
          "System CLI & MCP \u2014 /opt/zothos-ai-env/bin/shodan pre-initialized; MCP server running via @burtthecoder/mcp-shodan."
      ]
  },
  "certpath-roadmap-studio": {
      "whyUse": "100% in-browser certification DAG solver, career roadmap planner, and study guide generator with 137 credentials, procedural DAG brand media, and dual Stripe + Solana rails. Built for human operators and autonomous AI agents requiring zero-egress automation execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for CertPath Roadmap Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Automation) with standalone loopback workstation on 127.0.0.1:8093 and ZothOS CLI wrapper (/usr/local/bin/certpath-roadmap-studio).",
      "aiAgentProtocol": {
          "mcpTool": "certpath_roadmap_studio_execute",
          "description": "Execute CertPath Roadmap Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "certpath-roadmap-studio --help && certpath-roadmap-studio --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on CertPath Roadmap Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "certpath-roadmap-studio",
              "port": 8093,
              "results": "object"
          }
      },
      "quickstart": [
          "certpath-roadmap-studio --help",
          "certpath-roadmap-studio --json",
          "certpath-roadmap-studio-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8093 or Studio route /tools/certpath-roadmap-studio"
      ],
      "features": [
          "\ud83e\udd16 FastMCP Model Context Protocol Server \u2014 Direct stdio JSON-RPC 2.0 integration for Claude Desktop, Cursor, and Cline.",
          "\ud83d\udee1\ufe0f 100% Pure Python Standard Library \u2014 Zero third-party runtime dependencies. Compatible with Python 3.9\u20133.13 across Linux, macOS, Windows, and Termux.",
          "Pure Client Execution \u2014 100% in-browser AST & DAG traversal with zero broken cloud APIs or external backend requirements.",
          "Console Errors \u2014 0 console errors across all test paths."
      ]
  },
  "pwa-manifest-builder": {
      "whyUse": "100% in-browser Progressive Web App manifest generator, ServiceWorker compiler, offline cache architect, and production PWA ZIP bundle exporter. Free to use; tips optional. Built for human operators and autonomous AI agents requiring zero-egress autonomous web execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for PWA Manifest Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Autonomous Web) with standalone loopback workstation on 127.0.0.1:8100 and ZothOS CLI wrapper (/usr/local/bin/pwa-manifest-builder).",
      "aiAgentProtocol": {
          "mcpTool": "pwa_manifest_builder_execute",
          "description": "Execute PWA Manifest Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "pwa-manifest-builder --help && pwa-manifest-builder --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on PWA Manifest Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "pwa-manifest-builder",
              "port": 8100,
              "results": "object"
          }
      },
      "quickstart": [
          "pwa-manifest-builder --help",
          "pwa-manifest-builder --json",
          "pwa-manifest-builder-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8100 or Studio route /tools/pwa-manifest-builder"
      ],
      "features": [
          "100% in-browser Progressive Web App manifest generator, ServiceWorker compiler, offline cache architect, and production PWA ZIP bundle exporter. Free to use; tips optional.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/pwa-manifest-builder) and standalone server on http://127.0.0.1:8100",
          "Native ZothOS CLI binary (/usr/local/bin/pwa-manifest-builder) and 60fps Unicode U+2800 Braille TUI (pwa-manifest-builder-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "regex-droid-builder": {
      "whyUse": "100% in-browser visual regular expression builder, AST breakdown, railroad vector diagrams, multi-language code generator, and static ReDoS vulnerability guardian. Free to use; tips optional. Built for human operators and autonomous AI agents requiring zero-egress automation execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Regex Droid Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Automation) with standalone loopback workstation on 127.0.0.1:8101 and ZothOS CLI wrapper (/usr/local/bin/regex-droid-builder).",
      "aiAgentProtocol": {
          "mcpTool": "regex_droid_builder_execute",
          "description": "Execute Regex Droid Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "regex-droid-builder --help && regex-droid-builder --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Regex Droid Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "regex-droid-builder",
              "port": 8101,
              "results": "object"
          }
      },
      "quickstart": [
          "regex-droid-builder --help",
          "regex-droid-builder --json",
          "regex-droid-builder-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8101 or Studio route /tools/regex-droid-builder"
      ],
      "features": [
          "AST Decomposition \u2014 Deconstructs any regex pattern into an Abstract Syntax Tree (AST) with plain-English token explanations.",
          "Static ReDoS Audit \u2014 Detects catastrophic polynomial and exponential backtracking risks before production deployment.",
          "Canonical DFA Minimization \u2014 Applies Hopcroft and Moore minimization algorithms to reduce state automata complexity.",
          "Formal Verification \u2014 Verifies language equivalence and subset containment between two patterns with counterexample generation.",
          "Multi-Language Code Generation \u2014 Emits copy-paste ready implementations in Python, JavaScript/TypeScript, Rust, Go, Java, and C#."
      ]
  },
  "schema-illustrator-studio": {
      "whyUse": "100% in-browser visual database ERD studio and schema transpiler (TypeScript, Pydantic, Prisma, SQL DDL, GraphQL). Free to use; tips optional. Built for human operators and autonomous AI agents requiring zero-egress autonomous web execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Schema Illustrator Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Autonomous Web) with standalone loopback workstation on 127.0.0.1:8099 and ZothOS CLI wrapper (/usr/local/bin/schema-illustrator-studio).",
      "aiAgentProtocol": {
          "mcpTool": "schema_illustrator_studio_execute",
          "description": "Execute Schema Illustrator Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "schema-illustrator-studio --help && schema-illustrator-studio --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Schema Illustrator Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "schema-illustrator-studio",
              "port": 8099,
              "results": "object"
          }
      },
      "quickstart": [
          "schema-illustrator-studio --help",
          "schema-illustrator-studio --json",
          "schema-illustrator-studio-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8099 or Studio route /tools/schema-illustrator-studio"
      ],
      "features": [
          "100% in-browser visual database ERD studio and schema transpiler (TypeScript, Pydantic, Prisma, SQL DDL, GraphQL). Free to use; tips optional.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/schema-illustrator-studio) and standalone server on http://127.0.0.1:8099",
          "Native ZothOS CLI binary (/usr/local/bin/schema-illustrator-studio) and 60fps Unicode U+2800 Braille TUI (schema-illustrator-studio-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "zoth-webgen": {
      "whyUse": "Simple 3-step static template & 1-click Netlify launcher on 127.0.0.1:8092. Pick a ready-made template, preview live, and export HTML/ZIP or deploy to Netlify. Built for human operators and autonomous AI agents requiring zero-egress autonomous web execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth QuickSite Starter workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8092 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-webgen).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_webgen_execute",
          "description": "Execute Zoth QuickSite Starter operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-webgen --help && zoth-webgen --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth QuickSite Starter"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-webgen",
              "port": 8092,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-webgen --help",
          "zoth-webgen --json",
          "zoth-webgen-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8092 or Studio route /tools/zoth-webgen"
      ],
      "features": [
          "Simple 3-step static template & 1-click Netlify launcher on 127.0.0.1:8092. Pick a ready-made template, preview live, and export HTML/ZIP or deploy to Netlify.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/zoth-webgen) and standalone server on http://127.0.0.1:8092",
          "Native ZothOS CLI binary (/usr/local/bin/zoth-webgen) and 60fps Unicode U+2800 Braille TUI (zoth-webgen-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "zoth-swarm-multiplexer": {
      "whyUse": "21-terminal autonomous agent multiplexer daemon with hot-swappable AI harnesses, PWD control, and SSE telemetry. Built for human operators and autonomous AI agents requiring zero-egress swarm & core execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for 21-Agent Swarm Multiplexer workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8141 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-swarm-multiplexer).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_swarm_multiplexer_execute",
          "description": "Execute 21-Agent Swarm Multiplexer operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-swarm-multiplexer --help && zoth-swarm-multiplexer --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on 21-Agent Swarm Multiplexer"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-swarm-multiplexer",
              "port": 8141,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-swarm-multiplexer --help",
          "zoth-swarm-multiplexer --json",
          "zoth-swarm-multiplexer-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8141 or Studio route /tools/zoth-swarm-multiplexer"
      ],
      "features": [
          "21 Pantheon Terminals \u2014 Concurrent live interactive terminal multiplexer with independent PWD contexts and process IDs.",
          "Dynamic Model Routing \u2014 Direct instructions to Sonnet 3.7, DeepSeek R1, Qwen 2.5 Coder, Llama 3.3, or GPT-4.5 on the fly.",
          "STDP Synaptic Memory Matrix \u2014 Bidirectional synchronization with neuro-memory-daemon (:8788) with live Long-Term Potentiation (LTP) synaptic reinforcement.",
          "Real-Time Telemetry & SSE \u2014 Streams live execution logs and status transitions over Server-Sent Events (/stream).",
          "- **Hermes Agent** (hermes-agent)"
      ]
  },
  "agent-gods-eye": {
      "whyUse": "Autonomous zero-dependency Shodan OSINT tactical radar, 3D kinetic planetary attack surface reconnaissance, and threat scoring. Built for human operators and autonomous AI agents requiring zero-egress security & recon execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Agent God's Eye workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Security & Recon) with standalone loopback workstation on 127.0.0.1:8112 and ZothOS CLI wrapper (/usr/local/bin/agent-gods-eye).",
      "aiAgentProtocol": {
          "mcpTool": "agent_gods_eye_execute",
          "description": "Execute Agent God's Eye operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "agent-gods-eye --help && agent-gods-eye --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Agent God's Eye"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "agent-gods-eye",
              "port": 8112,
              "results": "object"
          }
      },
      "quickstart": [
          "agent-gods-eye --help",
          "agent-gods-eye --json",
          "agent-gods-eye-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8112 or Studio route /tools/agent-gods-eye"
      ],
      "features": [
          "Autonomous zero-dependency Shodan OSINT tactical radar, 3D kinetic planetary attack surface reconnaissance, and threat scoring.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/agent-gods-eye) and standalone server on http://127.0.0.1:8112",
          "Native ZothOS CLI binary (/usr/local/bin/agent-gods-eye) and 60fps Unicode U+2800 Braille TUI (agent-gods-eye-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "shopify-connector": {
      "whyUse": "Shopify GraphQL Admin API & POD sync engine with 1-click Etsy listing transpiler, net profit simulator, and Antigravity MCP suite. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Shopify Connector workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8113 and ZothOS CLI wrapper (/usr/local/bin/shopify-connector).",
      "aiAgentProtocol": {
          "mcpTool": "shopify_connector_execute",
          "description": "Execute Shopify Connector operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "shopify-connector --help && shopify-connector --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Shopify Connector"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "shopify-connector",
              "port": 8113,
              "results": "object"
          }
      },
      "quickstart": [
          "shopify-connector --help",
          "shopify-connector --json",
          "shopify-connector-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8113 or Studio route /tools/shopify-connector"
      ],
      "features": [
          "Shopify GraphQL Admin API & POD sync engine with 1-click Etsy listing transpiler, net profit simulator, and Antigravity MCP suite.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/shopify-connector) and standalone server on http://127.0.0.1:8113",
          "Native ZothOS CLI binary (/usr/local/bin/shopify-connector) and 60fps Unicode U+2800 Braille TUI (shopify-connector-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "printify-connector": {
      "whyUse": "Autonomous zero-dependency Printify Open API v1 connector, 20% Premium margin calculator, artwork DPI auditor, and Antigravity MCP suite. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Printify Connector workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8115 and ZothOS CLI wrapper (/usr/local/bin/printify-connector).",
      "aiAgentProtocol": {
          "mcpTool": "printify_connector_execute",
          "description": "Execute Printify Connector operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "printify-connector --help && printify-connector --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Printify Connector"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "printify-connector",
              "port": 8115,
              "results": "object"
          }
      },
      "quickstart": [
          "printify-connector --help",
          "printify-connector --json",
          "printify-connector-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8115 or Studio route /tools/printify-connector"
      ],
      "features": [
          "Autonomous zero-dependency Printify Open API v1 connector, 20% Premium margin calculator, artwork DPI auditor, and Antigravity MCP suite.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/printify-connector) and standalone server on http://127.0.0.1:8115",
          "Native ZothOS CLI binary (/usr/local/bin/printify-connector) and 60fps Unicode U+2800 Braille TUI (printify-connector-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "gelato-connector": {
      "whyUse": "Autonomous zero-dependency Gelato Open API v2 connector, localized 32-country print routing optimizer, multi-currency margin engine, and Antigravity MCP suite. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Gelato Connector workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8116 and ZothOS CLI wrapper (/usr/local/bin/gelato-connector).",
      "aiAgentProtocol": {
          "mcpTool": "gelato_connector_execute",
          "description": "Execute Gelato Connector operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "gelato-connector --help && gelato-connector --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Gelato Connector"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "gelato-connector",
              "port": 8116,
              "results": "object"
          }
      },
      "quickstart": [
          "gelato-connector --help",
          "gelato-connector --json",
          "gelato-connector-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8116 or Studio route /tools/gelato-connector"
      ],
      "features": [
          "Zero Customs Duties & Tariffs \u2014 Eliminates European and UK import duties and VAT clearance delays by manufacturing directly within domestic trade borders.",
          "Multi-Currency Margin Simulator \u2014 Full formula profit modeling across USD ($), EUR (\u20ac), and GBP (\u00a3) for Etsy, Shopify, and Direct transactions.",
          "Museum-Grade Print Auditor \u2014 Validates image dimensions, 300+ DPI resolution, and bleed area tolerances (e.g. 3mm on Acrylic/Aluminum, 5mm on Wood Canvas).",
          "100% Free & Open-Access \u2014 Zero paywalls, zero license locks, zero telemetry leaks."
      ]
  },
  "agent-voice-call": {
      "whyUse": "Autonomous sovereign real-time voice cockpit, live audio WebSocket streaming, multi-persona voice synthesizer, and zero-telemetry call protocol. Built for human operators and autonomous AI agents requiring zero-egress voice & real-time execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Agent Voice Call workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Voice & Real-Time) with standalone loopback workstation on 127.0.0.1:8114 and ZothOS CLI wrapper (/usr/local/bin/agent-voice-call).",
      "aiAgentProtocol": {
          "mcpTool": "agent_voice_call_execute",
          "description": "Execute Agent Voice Call operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "agent-voice-call --help && agent-voice-call --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Agent Voice Call"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "agent-voice-call",
              "port": 8114,
              "results": "object"
          }
      },
      "quickstart": [
          "agent-voice-call --help",
          "agent-voice-call --json",
          "agent-voice-call-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8114 or Studio route /tools/agent-voice-call"
      ],
      "features": [
          "Kokoro TTS Engine Integration \u2014 Hardware-accelerated local text-to-speech synthesis running on port 9394 with natural speech rhythm and zero cloud telemetry.",
          "WebSocket Audio Streaming \u2014 High-fidelity chunked audio streaming with live waveform spectrums and real-time STT transcripts.",
          "1-Click Call Link Dispatcher \u2014 Generates instant secure calling links compatible with Signal, SimpleX, or standalone web browsers.",
          "100% Free & Open-Access \u2014 Zero paywalls, zero license locks, zero telemetry leaks."
      ]
  },
  "pod-smart-router": {
      "whyUse": "Multi-channel POD order router dynamically comparing Printify (:8115) and Gelato (:8116) on landed cost, domestic proximity, delivery speed, and tariff avoidance. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for POD Smart Router workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8117 and ZothOS CLI wrapper (/usr/local/bin/pod-smart-router).",
      "aiAgentProtocol": {
          "mcpTool": "pod_smart_router_execute",
          "description": "Execute POD Smart Router operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "pod-smart-router --help && pod-smart-router --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on POD Smart Router"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "pod-smart-router",
              "port": 8117,
              "results": "object"
          }
      },
      "quickstart": [
          "pod-smart-router --help",
          "pod-smart-router --json",
          "pod-smart-router-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8117 or Studio route /tools/pod-smart-router"
      ],
      "features": [
          "Multi-channel POD order router dynamically comparing Printify (:8115) and Gelato (:8116) on landed cost, domestic proximity, delivery speed, and tariff avoidance.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/pod-smart-router) and standalone server on http://127.0.0.1:8117",
          "Native ZothOS CLI binary (/usr/local/bin/pod-smart-router) and 60fps Unicode U+2800 Braille TUI (pod-smart-router-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "digital-asset-forge": {
      "whyUse": "High-Res 300 DPI multi-ratio wall art pack generator (2:3, 3:4, 4:5, 11:14, ISO) for Etsy & Shopify digital downloads (98% margin) with 20MB multi-zip splitting. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Digital Asset Forge workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8118 and ZothOS CLI wrapper (/usr/local/bin/digital-asset-forge).",
      "aiAgentProtocol": {
          "mcpTool": "digital_asset_forge_execute",
          "description": "Execute Digital Asset Forge operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "digital-asset-forge --help && digital-asset-forge --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Digital Asset Forge"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "digital-asset-forge",
              "port": 8118,
              "results": "object"
          }
      },
      "quickstart": [
          "digital-asset-forge --help",
          "digital-asset-forge --json",
          "digital-asset-forge-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8118 or Studio route /tools/digital-asset-forge"
      ],
      "features": [
          "High-Res 300 DPI multi-ratio wall art pack generator (2:3, 3:4, 4:5, 11:14, ISO) for Etsy & Shopify digital downloads (98% margin) with 20MB multi-zip splitting.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/digital-asset-forge) and standalone server on http://127.0.0.1:8118",
          "Native ZothOS CLI binary (/usr/local/bin/digital-asset-forge) and 60fps Unicode U+2800 Braille TUI (digital-asset-forge-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "pod-mockup-forge": {
      "whyUse": "Autonomous photorealistic mockup studio with 60fps Lumen Matrix, fabric ink blending, and Etsy 2026 photo standards compliance auditor. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for POD Mockup Forge workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8119 and ZothOS CLI wrapper (/usr/local/bin/pod-mockup-forge).",
      "aiAgentProtocol": {
          "mcpTool": "pod_mockup_forge_execute",
          "description": "Execute POD Mockup Forge operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "pod-mockup-forge --help && pod-mockup-forge --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on POD Mockup Forge"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "pod-mockup-forge",
              "port": 8119,
              "results": "object"
          }
      },
      "quickstart": [
          "pod-mockup-forge --help",
          "pod-mockup-forge --json",
          "pod-mockup-forge-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8119 or Studio route /tools/pod-mockup-forge"
      ],
      "features": [
          "Autonomous photorealistic mockup studio with 60fps Lumen Matrix, fabric ink blending, and Etsy 2026 photo standards compliance auditor.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/pod-mockup-forge) and standalone server on http://127.0.0.1:8119",
          "Native ZothOS CLI binary (/usr/local/bin/pod-mockup-forge) and 60fps Unicode U+2800 Braille TUI (pod-mockup-forge-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "pod-margin-sentinel": {
      "whyUse": "Autonomous real-time profit sentinel, break-even solver, and 2026 fee simulator across Etsy (Organic & 15% Ads), Shopify, and TikTok Shop. Built for human operators and autonomous AI agents requiring zero-egress commerce & mcp execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for POD Margin Sentinel workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Commerce & MCP) with standalone loopback workstation on 127.0.0.1:8120 and ZothOS CLI wrapper (/usr/local/bin/pod-margin-sentinel).",
      "aiAgentProtocol": {
          "mcpTool": "pod_margin_sentinel_execute",
          "description": "Execute POD Margin Sentinel operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "pod-margin-sentinel --help && pod-margin-sentinel --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on POD Margin Sentinel"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "pod-margin-sentinel",
              "port": 8120,
              "results": "object"
          }
      },
      "quickstart": [
          "pod-margin-sentinel --help",
          "pod-margin-sentinel --json",
          "pod-margin-sentinel-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8120 or Studio route /tools/pod-margin-sentinel"
      ],
      "features": [
          "Autonomous real-time profit sentinel, break-even solver, and 2026 fee simulator across Etsy (Organic & 15% Ads), Shopify, and TikTok Shop.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/pod-margin-sentinel) and standalone server on http://127.0.0.1:8120",
          "Native ZothOS CLI binary (/usr/local/bin/pod-margin-sentinel) and 60fps Unicode U+2800 Braille TUI (pod-margin-sentinel-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "audiocipher-stego-engine": {
      "whyUse": "100% in-browser acoustic cryptography, PCM audio LSB steganography, DTMF Goertzel decoder, ITU Morse synthesizer, and ultrasonic BFSK air-gap modem. Built for human operators and autonomous AI agents requiring zero-egress security & opsec execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for AudioCipher Stego Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Security & OpSec) with standalone loopback workstation on 127.0.0.1:8096 and ZothOS CLI wrapper (/usr/local/bin/audiocipher-stego-engine).",
      "aiAgentProtocol": {
          "mcpTool": "audiocipher_stego_engine_execute",
          "description": "Execute AudioCipher Stego Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "audiocipher-stego-engine --help && audiocipher-stego-engine --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on AudioCipher Stego Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "audiocipher-stego-engine",
              "port": 8096,
              "results": "object"
          }
      },
      "quickstart": [
          "audiocipher-stego-engine --help",
          "audiocipher-stego-engine --json",
          "audiocipher-stego-engine-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8096 or Studio route /tools/audiocipher-stego-engine"
      ],
      "features": [
          "100% in-browser acoustic cryptography, PCM audio LSB steganography, DTMF Goertzel decoder, ITU Morse synthesizer, and ultrasonic BFSK air-gap modem.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/audiocipher-stego-engine) and standalone server on http://127.0.0.1:8096",
          "Native ZothOS CLI binary (/usr/local/bin/audiocipher-stego-engine) and 60fps Unicode U+2800 Braille TUI (audiocipher-stego-engine-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "cyber-turtle-studio": {
      "whyUse": "100% in-browser L-System fractal synthesizer, turtle geometry studio, and physical CNC pen-plotter G-Code and SVG vector exporter. Free to use; tips optional. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Cyber Turtle Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8129 and ZothOS CLI wrapper (/usr/local/bin/cyber-turtle-studio).",
      "aiAgentProtocol": {
          "mcpTool": "cyber_turtle_studio_execute",
          "description": "Execute Cyber Turtle Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "cyber-turtle-studio --help && cyber-turtle-studio --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Cyber Turtle Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "cyber-turtle-studio",
              "port": 8129,
              "results": "object"
          }
      },
      "quickstart": [
          "cyber-turtle-studio --help",
          "cyber-turtle-studio --json",
          "cyber-turtle-studio-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8129 or Studio route /tools/cyber-turtle-studio"
      ],
      "features": [
          "Zero Runtime Dependencies \u2014 100% Pure Python standard library implementation compatible with Python 3.9 through 3.13 on Linux, macOS, Windows, and Termux.",
          "Multi-Format Exporters \u2014 ",
          "High-Resolution Terminal Braille \u2014 2x4 subpixel Unicode Braille matrix rendering (U+2800..U+28FF) with 24-bit TrueColor ANSI styling.",
          "Movement \u2014 fd <dist>, bk <dist>, goto <x> <y>",
          "Rotation \u2014 rt <angle_deg>, lt <angle_deg>, setheading <deg>"
      ]
  },
  "datamosh-glitch-studio": {
      "whyUse": "100% in-browser parametric video datamosh synthesizer, H.264 I-frame drop corruption, CRT scanlines, procedural cassette brand media, and live camera mosh buffer with zero paywalls. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Datamosh Glitch Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8081 and ZothOS CLI wrapper (/usr/local/bin/datamosh-glitch-studio).",
      "aiAgentProtocol": {
          "mcpTool": "datamosh_glitch_studio_execute",
          "description": "Execute Datamosh Glitch Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "datamosh-glitch-studio --help && datamosh-glitch-studio --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Datamosh Glitch Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "datamosh-glitch-studio",
              "port": 8081,
              "results": "object"
          }
      },
      "quickstart": [
          "datamosh-glitch-studio --help",
          "datamosh-glitch-studio --json",
          "datamosh-glitch-studio-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8081 or Studio route /tools/datamosh-glitch-studio"
      ],
      "features": [
          "100% in-browser parametric video datamosh synthesizer, H.264 I-frame drop corruption, CRT scanlines, procedural cassette brand media, and live camera mosh buffer with zero paywalls.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/datamosh-glitch-studio) and standalone server on http://127.0.0.1:8081",
          "Native ZothOS CLI binary (/usr/local/bin/datamosh-glitch-studio) and 60fps Unicode U+2800 Braille TUI (datamosh-glitch-studio-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "nexus-3d-scene-studio": {
      "whyUse": "100% in-browser WebGL mathematical 3D geometry engine, 4D Tesseract, parametric surfaces, FastMCP server, procedural tesseract brand media, and precision OBJ/STL mesh exporters with zero paywalls. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Nexus 3D Scene Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8082 and ZothOS CLI wrapper (/usr/local/bin/nexus-3d-scene-studio).",
      "aiAgentProtocol": {
          "mcpTool": "nexus_3d_scene_studio_execute",
          "description": "Execute Nexus 3D Scene Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "nexus-3d-scene-studio --help && nexus-3d-scene-studio --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Nexus 3D Scene Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "nexus-3d-scene-studio",
              "port": 8082,
              "results": "object"
          }
      },
      "quickstart": [
          "nexus-3d-scene-studio --help",
          "nexus-3d-scene-studio --json",
          "nexus-3d-scene-studio-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8082 or Studio route /tools/nexus-3d-scene-studio"
      ],
      "features": [
          "100% in-browser WebGL mathematical 3D geometry engine, 4D Tesseract, parametric surfaces, FastMCP server, procedural tesseract brand media, and precision OBJ/STL mesh exporters with zero paywalls.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/nexus-3d-scene-studio) and standalone server on http://127.0.0.1:8082",
          "Native ZothOS CLI binary (/usr/local/bin/nexus-3d-scene-studio) and 60fps Unicode U+2800 Braille TUI (nexus-3d-scene-studio-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "ufo-sacred-geometry": {
      "whyUse": "100% in-browser sacred geometry synthesizer, crop circle agro-glyph CAD generator, procedural Metatron brand media, and AutoCAD DXF, Wavefront OBJ, and vector SVG exporter with dual Stripe + Solana rails. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for UFO Sacred Geometry Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8083 and ZothOS CLI wrapper (/usr/local/bin/ufo-sacred-geometry).",
      "aiAgentProtocol": {
          "mcpTool": "ufo_sacred_geometry_execute",
          "description": "Execute UFO Sacred Geometry Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "ufo-sacred-geometry --help && ufo-sacred-geometry --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on UFO Sacred Geometry Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "ufo-sacred-geometry",
              "port": 8083,
              "results": "object"
          }
      },
      "quickstart": [
          "ufo-sacred-geometry --help",
          "ufo-sacred-geometry --json",
          "ufo-sacred-geometry-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8083 or Studio route /tools/ufo-sacred-geometry"
      ],
      "features": [
          "Pure Python 3 Standard Library \u2014 Zero third-party runtime dependencies (math, json, dataclasses, http.server, urllib, pathlib).",
          "Multi-Format CAD / CAM Exporters \u2014 ",
          "SVG \u2014 Vector graphics with glowing neon drop-shadow filters (feGaussianBlur), layer groups (<g id=\"...\">), and 6 color themes.",
          "JSON AST \u2014 Serialized node tree with bounding boxes, layer styles, and parameters.",
          "Golden Ratio ($\\Phi$) \u2014 "
      ]
  },
  "likeness-desk": {
      "whyUse": "Local video double on GPU; Chatterbox Turbo voice cloning and Wav2Lip photorealistic mouth animation on Quadro P1000 with zero cloud leakage. Built for human operators and autonomous AI agents requiring zero-egress voice & real-time execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Likeness Desk (AI Video Double) workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:9395 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/likeness-desk).",
      "aiAgentProtocol": {
          "mcpTool": "likeness_desk_execute",
          "description": "Execute Likeness Desk (AI Video Double) operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "likeness-desk --help && likeness-desk --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Likeness Desk (AI Video Double)"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "likeness-desk",
              "port": 9395,
              "results": "object"
          }
      },
      "quickstart": [
          "likeness-desk --help",
          "likeness-desk --json",
          "likeness-desk-tui --status",
          "# Open standalone workstation at http://127.0.0.1:9395 or Studio route /tools/likeness-desk"
      ],
      "features": [
          "- **100% Zero-Egress Client & Local Enclave Execution**",
          "- **Real-Time Interactive Telemetry & AST Verification**",
          "- **Native Zoth Studio v2 & ZothOS v3.4 Integration**",
          "Zero-Egress Sovereign Guarantee \u2014 Executes locally in-browser or on your loopback enclave (127.0.0.1:9395) with zero cloud telemetry.",
          "Triple-Viewport Responsive UI \u2014 Verified across Mobile (375px), Tablet (768px), and Desktop (1280px+) viewports."
      ]
  },
  "osint-scout-skill": {
      "whyUse": "100% in-browser passive domain intelligence & attack surface reconnaissance engine auditing Certificate Transparency logs, DoH DNS records, and SPF/DMARC posture \u2014 free to use; optional tips welcome. Built for human operators and autonomous AI agents requiring zero-egress security & recon execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Domain Intel OSINT Scout workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Security & Recon) with standalone loopback workstation on 127.0.0.1:8085 and ZothOS CLI wrapper (/usr/local/bin/osint-scout-skill).",
      "aiAgentProtocol": {
          "mcpTool": "osint_scout_skill_execute",
          "description": "Execute Domain Intel OSINT Scout operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "osint-scout-skill --help && osint-scout-skill --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Domain Intel OSINT Scout"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "osint-scout-skill",
              "port": 8085,
              "results": "object"
          }
      },
      "quickstart": [
          "osint-scout-skill --help",
          "osint-scout-skill --json",
          "osint-scout-skill-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8085 or Studio route /tools/osint-scout-skill"
      ],
      "features": [
          "100% in-browser passive domain intelligence & attack surface reconnaissance engine auditing Certificate Transparency logs, DoH DNS records, and SPF/DMARC posture \u2014 free to use; optional tips welcome.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/osint-scout-skill) and standalone server on http://127.0.0.1:8085",
          "Native ZothOS CLI binary (/usr/local/bin/osint-scout-skill) and 60fps Unicode U+2800 Braille TUI (osint-scout-skill-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "bolt.diy": {
      "whyUse": "Flagship Full-Stack AI Web & Motion Architect on 127.0.0.1:5173. Supports 23+ AI providers, local CLI agents (AGY, Hermes, Grok, Claude, OpenCode, Cline, Aider), 6 Motion Edit templates, 200k+ free SVG & 16-bit Pixel Art icons, MCP asset bridge, and live WebContainers. Built for human operators and autonomous AI agents requiring zero-egress autonomous web execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Bolt workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:5173 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/bolt.diy).",
      "aiAgentProtocol": {
          "mcpTool": "bolt_diy_execute",
          "description": "Execute Zoth Bolt operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "bolt.diy --help && bolt.diy --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Bolt"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "bolt.diy",
              "port": 5173,
              "results": "object"
          }
      },
      "quickstart": [
          "bolt.diy --help",
          "bolt.diy --json",
          "bolt.diy-tui --status",
          "# Open standalone workstation at http://127.0.0.1:5173 or Studio route /tools/bolt.diy"
      ],
      "features": [
          "Local Model Servers \u2014 Ollama (127.0.0.1:11434), LM Studio, OpenAI-like local endpoints.",
          "Local Sovereign CLI Agents (ZothLocal Provider) \u2014 ",
          "Live Iconify Search \u2014 200,000+ free SVG icons across pixelarticons, lucide, ph, game-icons, and simple-icons",
          "Built-In 16x16 Pixel Art SVGs \u2014 Sovereign Crown, Golden Bolt, Aegis Shield, Pixel Potion, Relic Blade, Autonomous Bot, Emerald Gem, Pixel Flame",
          "Multi-Layer Vector Crests \u2014 Alchemical Hex-Core, Botanical Emerald Seal, Nocturnal Velvet Crest, Isometric Compute Cube"
      ]
  },
  "zoth-civilization": {
      "whyUse": "The living heart of the 21-agent society. Runs the GameBoy pixel world simulation, Adytum Initiation Deck, and meditation art catalog. Built for human operators and autonomous AI agents requiring zero-egress swarm & core execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Civilization Hub workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:9393 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-civilization).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_civilization_execute",
          "description": "Execute Zoth Civilization Hub operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-civilization --help && zoth-civilization --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Civilization Hub"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-civilization",
              "port": 9393,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-civilization --help",
          "zoth-civilization --json",
          "zoth-civilization-tui --status",
          "# Open standalone workstation at http://127.0.0.1:9393 or Studio route /tools/zoth-civilization"
      ],
      "features": [
          "Video Showreel (MP4) \u2014 public/assets/zoth-civilization-motion-edit.mp4(public/assets/zoth-civilization-motion-edit.mp4)",
          "Video Showreel (WebM) \u2014 public/assets/zoth-civilization-motion-edit.webm(public/assets/zoth-civilization-motion-edit.webm)",
          "Motion Graphics Blueprint & Prompt \u2014 prompts/motion_graphics_showreel.md(prompts/motion_graphics_showreel.md)",
          "* **Websites & Frontend UIs** $\\rightarrow$ Alchemical Villas, Houses, and Palaces.",
          "* **CLI Engines, AST Parsers & Refactors** $\\rightarrow$ Blacksmith Foundries and Workshops."
      ]
  },
  "storefront-catalog": {
      "whyUse": "10 master Etsy Print-on-Demand products optimized for 55+ demographic with 62.6% blended profit margin, 13/13 tag sets, and 100% free & open-access with optional Buy Us a Coffee & Solana tip support. Built for human operators and autonomous AI agents requiring zero-egress commerce & pod execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for YourDigitalSpace POD Showcase workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8143 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/storefront-catalog).",
      "aiAgentProtocol": {
          "mcpTool": "storefront_catalog_execute",
          "description": "Execute YourDigitalSpace POD Showcase operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "storefront-catalog --help && storefront-catalog --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on YourDigitalSpace POD Showcase"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "storefront-catalog",
              "port": 8143,
              "results": "object"
          }
      },
      "quickstart": [
          "storefront-catalog --help",
          "storefront-catalog --json",
          "storefront-catalog-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8143 or Studio route /tools/storefront-catalog"
      ],
      "features": [
          "10 Verified Etsy POD Products \u2014 Complete titles, 13/13 long-tail SEO tag sets, pricing matrices, and copy blocks.",
          "300 DPI Print Canvases & Mockups \u2014 Transparent print-ready artwork and photorealistic mockups.",
          "Direct Printify API Payloads \u2014 1-click JSON payloads ready for Printify API or the Zoth Etsy Connector MCP bridge.",
          "Interactive Financial Engine \u2014 Real-time margin calculator projecting daily orders, monthly gross, and horizon to $100K net.",
          "100% Free & Open-Access \u2014 Zero paywalls, zero license modals, zero blur locks."
      ]
  },
  "shodan-surface-sentinel": {
      "whyUse": "Zero-egress defensive asset auditor and InternetDB engine. Inspects open ports, CPE software stacks, and confirmed CVE exposures for your infrastructure. Built for human operators and autonomous AI agents requiring zero-egress security & enclave execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Shodan Attack Surface Sentinel workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8130 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/shodan-surface-sentinel).",
      "aiAgentProtocol": {
          "mcpTool": "shodan_surface_sentinel_execute",
          "description": "Execute Shodan Attack Surface Sentinel operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "shodan-surface-sentinel --help && shodan-surface-sentinel --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Shodan Attack Surface Sentinel"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "shodan-surface-sentinel",
              "port": 8130,
              "results": "object"
          }
      },
      "quickstart": [
          "shodan-surface-sentinel --help",
          "shodan-surface-sentinel --json",
          "shodan-surface-sentinel-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8130 or Studio route /tools/shodan-surface-sentinel"
      ],
      "features": [
          "InternetDB Exposure Audit \u2014 Passively queries Shodan InternetDB with zero intrusive scanning or active probing packets.",
          "Port & Service Fingerprinting \u2014 Identifies open edge ports and maps recognized services (SSH, HTTP, HTTPS, FastCGI, Docker, Ollama-AI).",
          "CPE Component Mapping \u2014 Extracts Common Platform Enumeration (CPE) software stacks to isolate vulnerable legacy software.",
          "Confirmed CVE Exposure Detection \u2014 Cross-references open ports and components with verified CVE vulnerability lists.",
          "Local Enclave Inspection \u2014 Safely inspects loopback addresses (127.0.0.1) and private RFC1918 networks."
      ]
  },
  "ghidra-mcp-bridge": {
      "whyUse": "LaurieWired Ghidra Model Context Protocol bridge for autonomous binary decompilation, AST method analysis, and project variable annotation. Built for human operators and autonomous AI agents requiring zero-egress security & enclave execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for GhidraMCP Binary Reverse Engineering Bridge workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8131 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/ghidra-mcp-bridge).",
      "aiAgentProtocol": {
          "mcpTool": "ghidra_mcp_bridge_execute",
          "description": "Execute GhidraMCP Binary Reverse Engineering Bridge operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "ghidra-mcp-bridge --help && ghidra-mcp-bridge --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on GhidraMCP Binary Reverse Engineering Bridge"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "ghidra-mcp-bridge",
              "port": 8131,
              "results": "object"
          }
      },
      "quickstart": [
          "ghidra-mcp-bridge --help",
          "ghidra-mcp-bridge --json",
          "ghidra-mcp-bridge-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8131 or Studio route /tools/ghidra-mcp-bridge"
      ],
      "features": [
          "Autonomous Decompilation \u2014 Exposes NSA Ghidra decompiler engine to LLMs and autonomous coding agents with zero cloud egress.",
          "AST Method & Symbol Inspection \u2014 Enumerates functions, data sections, and cross-references (XREFs) across x86_64, ARM, and MIPS binaries.",
          "Variable & Stack Annotation \u2014 Real-time renaming of decompiled variables and types directly synchronized back to Ghidra project files.",
          "Dual-Pane Workstation \u2014 Side-by-side native assembly instruction streams and syntax-highlighted C pseudocode.",
          "JSON-RPC 2.0 MCP Protocol \u2014 Native compatibility with Claude Code, Cursor, AGY, and Zoth Studio agents."
      ]
  },
  "zoth-ascii-magic": {
      "whyUse": "100% client-side Image/Video/3D-to-ASCII & Sub-Pixel Unicode Braille studio with Sobel directional edge detection (/\\\\|-), interactive 2D point relighting, CRT phosphor bloom, and 24-bit TrueColor ANSI/HTML/SVG exports. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth ASCII Magic Studio workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8132 and ZothOS CLI wrapper (/usr/local/bin/zoth-ascii-magic).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_ascii_magic_execute",
          "description": "Execute Zoth ASCII Magic Studio operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-ascii-magic --help && zoth-ascii-magic --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth ASCII Magic Studio"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-ascii-magic",
              "port": 8132,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-ascii-magic --help",
          "zoth-ascii-magic --json",
          "zoth-ascii-magic-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8132 or Studio route /tools/zoth-ascii-magic"
      ],
      "features": [
          "Ordered Bayer Dithering \u2014 Bayer 4\u00d74 and 8\u00d78 dither matrices for silky 1-bit or multi-level luminance gradients.",
          "Sub-Pixel 2\u00d74 Unicode Braille \u2014 Dense sub-pixel packing into Unicode Braille space (U+2800 to U+28FF).",
          "Directional Sobel Edge Contours \u2014 Real-time convolution filter calculating luminance gradients and injecting contour glyphs (/, \\, |, -).",
          "Interactive 2D Point Relighting \u2014 Dynamic drag-and-drop light source with real-time specular highlights and rim lighting.",
          "Full Spectrum CRT Phosphors \u2014 Sovereign Gold, Amber P3, Emerald P1, Cyber Cyan, Ghost Crimson, and Quantum Neon tubes."
      ]
  },
  "yara-sigma-forge": {
      "whyUse": "100% client-side YARA-X & Sigma threat detection compiler with 60fps byte-offset entropy radar, CVE-2024-4577 PHP-CGI / ELF64 memfd / AI Agent exfil signatures, and MITRE ATT&CK mapping. Built for human operators and autonomous AI agents requiring zero-egress security & recon execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for YARA-X & Sigma Threat Rule Forge workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Security & Recon) with standalone loopback workstation on 127.0.0.1:8133 and ZothOS CLI wrapper (/usr/local/bin/yara-sigma-forge).",
      "aiAgentProtocol": {
          "mcpTool": "yara_sigma_forge_execute",
          "description": "Execute YARA-X & Sigma Threat Rule Forge operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "yara-sigma-forge --help && yara-sigma-forge --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on YARA-X & Sigma Threat Rule Forge"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "yara-sigma-forge",
              "port": 8133,
              "results": "object"
          }
      },
      "quickstart": [
          "yara-sigma-forge --help",
          "yara-sigma-forge --json",
          "yara-sigma-forge-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8133 or Studio route /tools/yara-sigma-forge"
      ],
      "features": [
          "100% client-side YARA-X & Sigma threat detection compiler with 60fps byte-offset entropy radar, CVE-2024-4577 PHP-CGI / ELF64 memfd / AI Agent exfil signatures, and MITRE ATT&CK mapping.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/yara-sigma-forge) and standalone server on http://127.0.0.1:8133",
          "Native ZothOS CLI binary (/usr/local/bin/yara-sigma-forge) and 60fps Unicode U+2800 Braille TUI (yara-sigma-forge-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "reality-shader-forge": {
      "whyUse": "Interactive 60fps Reality Switch shader synthesizer and ZothOS desktop theme compiler. Customize the 5 Zoth Realities, preview Zoth Bot companions, and export KDE Plasma .colors, Alacritty .toml, and CSS tokens. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Reality Shader & Theme Forge workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8134 and ZothOS CLI wrapper (/usr/local/bin/reality-shader-forge).",
      "aiAgentProtocol": {
          "mcpTool": "reality_shader_forge_execute",
          "description": "Execute Zoth Reality Shader & Theme Forge operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "reality-shader-forge --help && reality-shader-forge --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Reality Shader & Theme Forge"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "reality-shader-forge",
              "port": 8134,
              "results": "object"
          }
      },
      "quickstart": [
          "reality-shader-forge --help",
          "reality-shader-forge --json",
          "reality-shader-forge-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8134 or Studio route /tools/reality-shader-forge"
      ],
      "features": [
          "Interactive 60fps Reality Switch shader synthesizer and ZothOS desktop theme compiler. Customize the 5 Zoth Realities, preview Zoth Bot companions, and export KDE Plasma .colors, Alacritty .toml, and CSS tokens.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/reality-shader-forge) and standalone server on http://127.0.0.1:8134",
          "Native ZothOS CLI binary (/usr/local/bin/reality-shader-forge) and 60fps Unicode U+2800 Braille TUI (reality-shader-forge-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "producthunt-connector": {
      "whyUse": "Local Zoth OS cockpit that diffs the ZOTHOS Product Hunt listing against live website/GitHub URLs, surfaces votes/ranks/comments, and serves a loopback dashboard on :8139. Token stays in ~/.config/zothos/producthunt.secret.json. Built for human operators and autonomous AI agents requiring zero-egress commerce & pod execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Product Hunt Connector (zoth-ph) workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8139 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/producthunt-connector).",
      "aiAgentProtocol": {
          "mcpTool": "producthunt_connector_execute",
          "description": "Execute Product Hunt Connector (zoth-ph) operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "producthunt-connector --help && producthunt-connector --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Product Hunt Connector (zoth-ph)"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "producthunt-connector",
              "port": 8139,
              "results": "object"
          }
      },
      "quickstart": [
          "producthunt-connector --help",
          "producthunt-connector --json",
          "producthunt-connector-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8139 or Studio route /tools/producthunt-connector"
      ],
      "features": [
          "Zero-Egress Security Model \u2014 Read-only listing verification. It never auto-posts comments, upvotes, or modifies live accounts.",
          "URL Drift Sentinel \u2014 Detects discrepancies between desired canonical domains (zothos.nullai.tech, GitHub release tags) and the Product Hunt public listing.",
          "Real-Time Telemetry \u2014 Surfaces live upvote counts, comments, review sentiment, and weekly/monthly ranks.",
          "Official Badge Generation \u2014 Generates embeddable light/dark featured and review badge markup.",
          "Local Web Cockpit \u2014 In-browser control panel on port :8139 for reviewing telemetry and comments."
      ]
  },
  "zoth-relay": {
      "whyUse": "Hardened local MCP/HTTP bridge so many AI agents share one ZothOS machine with per-agent tokens, path sandbox, command blocklist, rate limits, and audit trail on 127.0.0.1:8765. Built for human operators and autonomous AI agents requiring zero-egress swarm & core execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Relay (MCP Agent Bridge) workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8765 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-relay).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_relay_execute",
          "description": "Execute Zoth Relay (MCP Agent Bridge) operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-relay --help && zoth-relay --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Relay (MCP Agent Bridge)"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-relay",
              "port": 8765,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-relay --help",
          "zoth-relay --json",
          "zoth-relay-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8765 or Studio route /tools/zoth-relay"
      ],
      "features": [
          "Hardened local MCP/HTTP bridge so many AI agents share one ZothOS machine with per-agent tokens, path sandbox, command blocklist, rate limits, and audit trail on 127.0.0.1:8765.",
          "Interactive God-Mode Workstation in Zoth Studio v2 (/tools/zoth-relay) and standalone server on http://127.0.0.1:8765",
          "Native ZothOS CLI binary (/usr/local/bin/zoth-relay) and 60fps Unicode U+2800 Braille TUI (zoth-relay-tui)",
          "100% Free & Open-Access execution with zero cloud telemetry and strict loopback isolation",
          "Verified 0 console errors and 0px horizontal overflow across Mobile (390px), Tablet (820px), and Desktop (1425px)"
      ]
  },
  "zela-glasses-guide": {
      "whyUse": "Sovereign wearable AI mission coach for Ray-Ban Meta smart glasses over Tailscale \u2014 full-duplex WebSocket guide stream, Moondream vision, AGY coaching, and Kokoro TTS via zoth-relay-mobile. Built for human operators and autonomous AI agents requiring zero-egress swarm & core execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zela Glasses Guide workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Swarm & Core) with standalone loopback workstation on 127.0.0.1:8144 and ZothOS CLI wrapper (/usr/local/bin/zela-glasses-guide).",
      "aiAgentProtocol": {
          "mcpTool": "zela_glasses_guide_execute",
          "description": "Execute Zela Glasses Guide operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zela-glasses-guide --help && zela-glasses-guide --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zela Glasses Guide"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zela-glasses-guide",
              "port": 8144,
              "results": "object"
          }
      },
      "quickstart": [
          "zela-glasses-guide --help",
          "zela-glasses-guide --json",
          "zela-glasses-guide-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8144 or Studio route /tools/zela-glasses-guide"
      ],
      "features": [
          "Full-Duplex Encrypted Stream \u2014 Connect Ray-Ban Meta Smart Glasses to your Linux workstation over Tailscale WireGuard (100.106.132.5:8766/v1/guide/stream).",
          "Local Moondream Vision \u2014 1.34s ask-to-say latency with edge frame captioning via local Ollama (moondream).",
          "Persistent AGY Session Rolling \u2014 Pre-warmed spare AGY session rolling with low-effort sub-second prompt caching.",
          "24kHz Kokoro ONNX Neural TTS \u2014 Studio-quality voice synthesis (af_heart) running 100% in local volatile RAM.",
          "100% Unlocked \u2014 Zero blur locks, zero license modals, zero paywalls."
      ]
  },
  "zoth-bot": {
      "whyUse": "Local-first always-on 3D WebGL desk companion for Zoth OS \u2014 multi-harness neural engine (Grok/Hermes/Ollama), Security Ring authority, MCP hub, summoned with Ctrl+Shift+Space. Built for human operators and autonomous AI agents requiring zero-egress swarm & core execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Bot Desktop Companion workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:8146 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-bot).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_bot_execute",
          "description": "Execute Zoth Bot Desktop Companion operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-bot --help && zoth-bot --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Bot Desktop Companion"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-bot",
              "port": 8146,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-bot --help",
          "zoth-bot --json",
          "zoth-bot-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8146 or Studio route /tools/zoth-bot"
      ],
      "features": [
          "Dual-Mode Window (main.js) \u2014 ",
          "Compact Orb (220\u00d7220) \u2014 Frameless, draggable circular desk orb with live status dot.",
          "100% Offline Self-Hosted Typography (renderer/fonts/) \u2014 Bundled .woff2 fonts for Syne (700/800), Space Grotesk (400\u2013700), and JetBrains Mono (400\u2013600).",
          "Grok (xAI Grok CLI) \u2014 Streams NDJSON (--output-format streaming-json) with full agentic tool use (grok-4.7, grok-4.7-build-fast, grok-4.6, grok-4.5).",
          "Copilot (Hermes Copilot) \u2014 Routes through Hermes Copilot provider."
      ]
  },
  "zoth-bounty": {
      "whyUse": "Zero-false-positive security research & responsible disclosure workspace tracking Ongoing / Pending / Completed audits with a loopback command center on :9494. Built for human operators and autonomous AI agents requiring zero-egress security & enclave execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Bounty Research Hub workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "Sovereign local daemon & CLI workstation bound to 127.0.0.1:9494 with zero outbound telemetry and native ZothOS CLI binary (/usr/local/bin/zoth-bounty).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_bounty_execute",
          "description": "Execute Zoth Bounty Research Hub operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-bounty --help && zoth-bounty --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Bounty Research Hub"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-bounty",
              "port": 9494,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-bounty --help",
          "zoth-bounty --json",
          "zoth-bounty-tui --status",
          "# Open standalone workstation at http://127.0.0.1:9494 or Studio route /tools/zoth-bounty"
      ],
      "features": [
          "Web Command Center \u2014 http://localhost:9494 (node server.js)",
          "Policy \u2014 Zero False Positives \u2014 Only 100% source-verified, reproducible vulnerabilities with defensive patches are promoted to Pending/Disclosed.",
          "Thermal Governance \u2014 Cool-Running Static Audit Mode (Target CPU < 60\u00b0C, Max Burst < 70\u00b0C, nice -n 19 ionice -c 3 on all scanners).",
          "- **ZB-2026-001 Arbitrary Host File Disclosure via dereference: true Symlink Following in copyDir & npx skills use** (vercel-labs/skills \u00b7 High (CVSS 7.5))",
          "- **ZB-2026-005 Security Audit of cloudflare/vinext (SSR, Server Actions, Image Optimization & Middleware)** (cloudflare/vinext \u00b7 Cleared (Hardened))"
      ]
  },
  "zoth-scene-foundry": {
      "whyUse": "Procedural ZothOS-style ASCII + pixel-art scene engine \u2014 1000 deterministic scenes with Bayer dither, tube palettes, and three.js AsciiEffect stage on :8823. Built for human operators and autonomous AI agents requiring zero-egress media & 3d execution without cloud SaaS lock-in.",
      "problemSolved": "Eliminates third-party telemetry, rate limits, and cloud data exposure for Zoth Scene Foundry workflows by running 100% locally on ZothOS and in the browser.",
      "architecture": "100% client-side in-browser execution engine (Media & 3D) with standalone loopback workstation on 127.0.0.1:8823 and ZothOS CLI wrapper (/usr/local/bin/zoth-scene-foundry).",
      "aiAgentProtocol": {
          "mcpTool": "zoth_scene_foundry_execute",
          "description": "Execute Zoth Scene Foundry operations via JSON-RPC / MCP or ZothOS CLI.",
          "cliExample": "zoth-scene-foundry --help && zoth-scene-foundry --json",
          "inputSchema": {
              "type": "object",
              "properties": {
                  "action": {
                      "type": "string",
                      "enum": [
                          "status",
                          "run",
                          "audit",
                          "export"
                      ],
                      "description": "Operation to run on Zoth Scene Foundry"
                  },
                  "target": {
                      "type": "string",
                      "description": "Primary target payload or parameter"
                  }
              },
              "required": [
                  "action"
              ]
          },
          "outputSchema": {
              "status": "ONLINE | SUCCESS",
              "tool": "zoth-scene-foundry",
              "port": 8823,
              "results": "object"
          }
      },
      "quickstart": [
          "zoth-scene-foundry --help",
          "zoth-scene-foundry --json",
          "zoth-scene-foundry-tui --status",
          "# Open standalone workstation at http://127.0.0.1:8823 or Studio route /tools/zoth-scene-foundry"
      ],
      "features": [
          "1000 Cataloged Deterministic Scenes \u2014 Full procedural gallery browsing at /gallery.html with real-time field filters and tube palette selectors.",
          "Ordered Bayer Dithering \u2014 Authentic retro monochrome and multi-shade matrix rendering directly in the browser canvas.",
          "Cathode Tube Color Profiles \u2014 Aurum Gold, Retro Amber, Cyber Cyan, Sovereign Emerald, and Ghost Crimson.",
          "Three.js AsciiEffect Stage \u2014 Real-time 3D geometry rendered as ASCII character grids at 60 FPS.",
          "100% Client-Side Synthesis \u2014 Zero external network egress, no telemetry, no tracking."
      ]
  }
};

/**
 * Returns complete architectural documentation for any tool, dynamically generating
 * robust default documentation for any remaining tools.
 */
export function getToolDocumentation(tool) {
  if (!tool) return null;
  const specific = toolsDocumentation[tool.id] || toolsDocumentation[tool.repo];
  if (specific) return specific;

  // Authoritative default documentation based on tool category and execution metadata
  return {
    whyUse: `Designed as an isolated, sovereign micro-tool for ${tool.name}. Enables developers and autonomous AI agents to perform zero-egress ${tool.category.toLowerCase()} tasks without exposing source code, credentials, or proprietary prompts to third-party cloud platforms.`,
    problemSolved: `Replaces centralized, telemetry-laden cloud services with a local-first, verifiable tool repository that runs deterministically on your machine.`,
    architecture: `Standalone micro-module running under ${tool.executionType === 'webgpu' ? 'WebGPU & WebAssembly (WASM)' : 'local Node.js / Python CLI runtime'}. Complies with the Zoth zero-egress sovereign security invariant.`,
    aiAgentProtocol: {
      mcpTool: `${tool.id.replace(/-/g, '_')}_execute`,
      description: `Execute ${tool.name} with structured JSON-RPC parameters.`,
      cliExample: `zoth run ${tool.id} --input ./params.json`,
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'Primary payload or target parameter' },
          options: { type: 'object', description: 'Execution options' }
        },
        required: ['input']
      },
      outputSchema: {
        status: 'SUCCESS | FAILURE',
        data: 'object',
        executionMs: 'number'
      }
    },
    quickstart: [
      `git clone ${tool.github || `https://github.com/NullAITech/${tool.repo}`}.git`,
      `cd ${tool.repo} && ${tool.pull || `npx @nullaitech/zoth pull ${tool.id}`}`,
      'npm test || pytest || cargo test'
    ],
    features: [
      'Strict zero-egress local execution invariant',
      'Standalone modular repository architecture',
      'Standardized Model Context Protocol (MCP) server ready',
      'Deterministic output with cryptographic integrity guarantees',
      'Preinstalled and configured ready-to-run inside ZothOS'
    ]
  };
}
