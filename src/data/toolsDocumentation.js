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
    whyUse: 'Biomorphic synaptic memory daemon modeled after Spike-Timing-Dependent Plasticity (STDP). Retains high-salience context across sessions while automatically decaying stale noise.',
    problemSolved: 'Solves the LLM memory amnesia and context-window pollution crisis without requiring expensive and invasive vector SaaS subscriptions (Pinecone, Weaviate Cloud).',
    architecture: 'Python 3.10+ daemon running at 127.0.0.1:8094. Implements continuous STDP biological weight adaptation with fast SQLite/HNSW vector persistence.',
    aiAgentProtocol: {
      mcpTool: 'memory_recall',
      description: 'Query synaptic memory for high-salience knowledge embeddings from prior sessions.',
      cliExample: 'curl "http://127.0.0.1:8094/api/memory?q=jwt+bypass+rules&top=5"',
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
      'cd neuro-memory-daemon && python3 -m neuro_memory_daemon serve -H 127.0.0.1 -p 8094',
      'curl http://127.0.0.1:8094/health'
    ],
    features: [
      'Biological STDP synaptic reinforcement & exponential decay',
      'Zero-cloud local vector embeddings and recall',
      'Real-time memory visualizer stream for Zoth Studio',
      'Automated session consolidation and knowledge extraction',
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
    whyUse: 'Systematic prompt engineering, template management, and DSPy algorithmic prompt optimization workstation.',
    problemSolved: 'Replaces ad-hoc trial-and-error prompt tweaking with rigorous evaluation metrics, few-shot bootstrapping, and versioned prompt artifacts.',
    architecture: 'Python + TypeScript dual architecture with DSPy optimization framework support and local YAML prompt registries.',
    aiAgentProtocol: {
      mcpTool: 'prompt_optimize',
      description: 'Optimize a prompt template against a target verification metric using DSPy.',
      cliExample: 'promptmaster optimize --template ./prompts/code_review.yaml --metric strict_syntax',
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
      'DSPy prompt compilation & automated few-shot injection',
      'Token budget counter for Ollama, Claude, and OpenAI',
      'Prompt diff & regression detector across LLM versions',
      'Exportable to Hermes skills, Antigravity prompts, and Cursor rules',
      'Zero cloud dependency'
    ]
  },

  'hexstrike-arsenal': {
    whyUse: 'Air-gapped offensive security and penetration testing terminal. Performs autonomous CVE analysis, binary header disassembly, and exploit mitigation audits.',
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
      cliExample: 'npx zoth pull vision-gesture-control',
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
      'npx zoth pull vision-gesture-control',
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
      `cd ${tool.repo} && ${tool.pull || `npx zoth pull ${tool.id}`}`,
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
