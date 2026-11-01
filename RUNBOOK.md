# ZothOS Operational Runbook & Architecture Manual

> **Classification**: Sovereign Local Autonomous Infrastructure  
> **Host**: Debian 13 (trixie) | Intel Xeon E-2176M (6c/12t) | 32 GB DDR4 | NVIDIA GP107GLM [Quadro P1000 Mobile 4GB]  
> **Security Boundary**: Zero-Egress Invariant — strictly `127.0.0.1` loopback bindings only. Never `0.0.0.0`.  
> **Registry Truth**: `~/NullAITech/zoth-studio-v2/public/api/tools.json` (72 tools, 0 port collisions)  

---

## 1. System Architecture & Boundaries

ZothOS operates as a sovereign, zero-external-dependency local developer and agent intelligence hub.

```
                    +-------------------------------------------------------------+
                    |             Zoth Studio Hub (127.0.0.1:3000)                |
                    |        Vite / React SPA - 43 Workstations / 72 Tools        |
                    +------------------------------+------------------------------+
                                                   |
                   +-------------------------------+-------------------------------+
                   |                               |                               |
       +-----------v-----------+       +-----------v-----------+       +-----------v-----------+
       |   Synaptic Memory     |       | Sovereign IPC Bridge  |       |   FinOps Sentinel     |
       |  UI:  127.0.0.1:8094  |       |   127.0.0.1:8102      |       |  Radar: 127.0.0.1:8110|
       |  REST:127.0.0.1:8788  |       |  (Mesh Consensus)     |       |  Proxy: 127.0.0.1:8111|
       +-----------+-----------+       +-----------+-----------+       +-----------+-----------+
                   |                               |                               |
                   +-------------------------------+-------------------------------+
                                                   |
                          +------------------------v-----------------------+
                          |   Agent Circuit Breaker (127.0.0.1:8111)       |
                          |   - Hard Ceiling: $5.00                       |
                          |   - Velocity Tripwire: $2.00 / min             |
                          |   - Target: http://127.0.0.1:11434 (Ollama)    |
                          +------------------------+-----------------------+
                                                   |
                                   +---------------v---------------+
                                   |  Ollama Engine (:11434)      |
                                   |  - qwen2.5-coder:1.5b (Warm)  |
                                   |  - NVIDIA Quadro P1000 Accel  |
                                   +-------------------------------+
```

### Core Invariants:
1. **Zero-Egress Protocol**: Every daemon, HTTP server, and websocket listener MUST explicitly bind to `127.0.0.1`. Any attempt to bind `0.0.0.0` or open external WAN sockets is prohibited.
2. **FinOps Gate**: All automated coding and swarm agent calls to OpenAI-compatible APIs pass through the sentinel proxy on `http://127.0.0.1:8111/v1`. If spend exceeds $5.00 or velocity exceeds $2.00/min, the breaker trips to `OPEN`, immediately cutting off API egress.
3. **Execution Sandbox**: Muse coding agent runs in bubblewrap (`bwrap`) out of `/opt/muse/` with root isolated from `$HOME` to preserve sandbox integrity.

---

## 2. Complete Port Directory (72 Tools + Core Daemons)

Every tool has an assigned, unique loopback port verified by `registry-check`.

| Port | Service / Tool Name | Category | Runtime / Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `:3000` | **Zoth Studio v2 UI** | `Hub & Studio` | Node / Vite SPA | Command center, route director, fleet & 72-tool workstation hub |
| `:5225` | **SimpleX Signal Peer Bus** | `Core IPC` | SimpleX SMP | End-to-end encrypted sovereign agent signal mesh |
| `:8140` | **Vaelor L1 Account-Lattice DAG** | `Sovereign FinTech` | Node.js / BFT | Feeless sub-15ms DAG ledger, PoUW mining & 17-tool MCP hub |
| `:8145` | **ZothOS-Lite v1.1 Webtop** | `Amnesic OS` | Node.js / Braille | 1-Bit Monotone Amnesic RAM OS with AZOTH & Chain of Thoughts |
| `:8787` | **Zoth Vault Daemon** | `Security Enclave` | Rust binary | Argon2id + ChaCha20-Poly1305 memory-only credential enclave |
| `:11434` | **Ollama LLM Engine** | `Core LLM` | Go / llama.cpp | Local weights execution engine bound to 127.0.0.1 |
| `:5173` | **Zoth Bolt** (`bolt.diy`) | `Autonomous Web` | local_cli | Flagship Full-Stack AI Web & Motion Architect on 127.0.0.1:5173. Supports 23+ AI prov... |
| `:5174` | **CronRhythm Studio** (`cron-rhythm-studio`) | `Automation` | browser | High-precision cron AST parser, 24x7 rhythm heatmap, countdown timeline, multi-dialec... |
| `:8080` | **Payload Entropy Studio** (`payload-entropy-studio`) | `Security & Recon` | browser | 100% in-browser Shannon entropy waveform visualizer, 32-byte sliding window, recursiv... |
| `:8081` | **Datamosh Glitch Studio** (`datamosh-glitch-studio`) | `Media & 3D` | browser | 100% in-browser parametric video datamosh synthesizer, H.264 I-frame drop corruption,... |
| `:8082` | **Nexus 3D Scene Studio** (`nexus-3d-scene-studio`) | `Media & 3D` | browser | 100% in-browser WebGL mathematical 3D geometry engine, 4D Tesseract, parametric surfa... |
| `:8083` | **UFO Sacred Geometry Studio** (`ufo-sacred-geometry`) | `Media & 3D` | browser | 100% in-browser sacred geometry synthesizer, crop circle agro-glyph CAD generator, pr... |
| `:8084` | **Badge3D Coin Generator** (`badge3d-coin-generator`) | `Media & 3D` | browser | 100% in-browser WebGL 3D coin, medallion, and relief badge generator with real-time P... |
| `:8085` | **Domain Intel OSINT Scout** (`osint-scout-skill`) | `Security & Recon` | browser | 100% in-browser passive domain intelligence & attack surface reconnaissance engine au... |
| `:8086` | **Robots.txt & AEO Auditor** (`robots-txt-auditor`) | `Growth & SEO` | browser | 100% in-browser RFC 9309 robots.txt parser, AI crawler simulator (Googlebot, GPTBot, ... |
| `:8087` | **City Desk** (`city-desk`) | `Growth & SEO` | browser | One studio writes the finished page for a trade and a city. 1,000 localized service p... |
| `:8088` | **EnvGuard Secrets Vault** (`envguard-secrets-vault`) | `Security & Recon` | browser | Argon2id + AES-256-GCM hardware vault for zero-cloud secret storage, Shamir quorum sp... |
| `:8089` | **Vision Gesture Control** (`vision-gesture-control`) | `Media & 3D` | browser | 100% in-browser touchless gesture control, 21-joint 3D hand tracking, spatial air dra... |
| `:8090` | **SubSweep Lead Scanner** (`subsweep-lead-scanner`) | `Security & Recon` | browser | 100% in-browser OSINT reconnaissance, passive DNS discovery, tech stack fingerprintin... |
| `:8091` | **OmniPost Social Engine** (`omnipost-social-engine`) | `Automation` | browser | 100% in-browser social content formatting, viral thread splitter, virality scoring, M... |
| `:8092` | **Zoth QuickSite Starter** (`zoth-webgen`) | `Autonomous Web` | local_cli | Simple 3-step static template & 1-click Netlify launcher on 127.0.0.1:8092. Pick a re... |
| `:8093` | **CertPath Roadmap Studio** (`certpath-roadmap-studio`) | `Automation` | browser | 100% in-browser certification DAG solver, career roadmap planner, and study guide gen... |
| `:8094` | **Neuro-Memory Daemon** (`neuro-memory-daemon`) | `Memory & Brain` | local_cli | Biological-fidelity memory substrate with 3D Cosmic Nebula and federated Zoth Memory ... |
| `:8095` | **Agent Egress Sentinel** (`agent-egress-sentinel`) | `Security & Network` | browser | Autonomous zero-dependency network interceptor, TLS SNI sniffer, kinetic egress radar... |
| `:8096` | **AudioCipher Stego Studio** (`audiocipher-stego-engine`) | `Security & OpSec` | browser | 100% in-browser acoustic cryptography, PCM audio LSB steganography, DTMF Goertzel dec... |
| `:8097` | **Agent Mock Twin** (`agent-mock-twin`) | `Simulation & Testing` | browser | Autonomous offline API mock server & deterministic replay twin for AI agents ($0 toke... |
| `:8098` | **Agent Prompt Firewall** (`agent-prompt-firewall`) | `Security & Network` | browser | Autonomous inline prompt injection defense, PII redactor, and threat radar for AI age... |
| `:8099` | **Schema Illustrator Studio** (`schema-illustrator-studio`) | `Autonomous Web` | browser | 100% in-browser visual database ERD studio and schema transpiler (TypeScript, Pydanti... |
| `:8100` | **PWA Manifest Studio** (`pwa-manifest-builder`) | `Autonomous Web` | browser | 100% in-browser Progressive Web App manifest generator, ServiceWorker compiler, offli... |
| `:8101` | **Regex Droid Studio** (`regex-droid-builder`) | `Automation` | browser | 100% in-browser visual regular expression builder, AST breakdown, railroad vector dia... |
| `:8102` | **Sovereign Agent Signal Bridge** (`sovereign-agent-bridge`) | `Swarm & Core` | local_cli | E2EE WebSocket signal protocol and Simplex peer mesh IPC communicator. |
| `:8103` | **Anderson Security Sentinel** (`anderson-security-sentinel`) | `Security & OpSec` | browser | Autonomous biometric laptop perimeter defense, WiFi X-Ray RF tomography, USB tripwire... |
| `:8104` | **Agent Flight Recorder** (`agent-flight-recorder`) | `Forensics & Telemetry` | browser | Black box flight recorder & time-scrubbing telemetry forensics hub for AI agents with... |
| `:8105` | **Agent Capsule Jail** (`agent-capsule-jail`) | `Security & Enclave` | browser | Autonomous kernel enclave sandbox, resource quota manager, and secret stripping engin... |
| `:8106` | **Agent Policy Auditor** (`agent-policy-auditor`) | `Security & Enclave` | browser | Autonomous capability leaser, permission broker, and OWASP LLM manifest security audi... |
| `:8107` | **Etsy POD Forge** (`etsy-pod-forge`) | `Commerce & POD` | browser | Autonomous 300 DPI canvas generator, photorealistic mockup engine, and Etsy SEO listi... |
| `:8108` | **Etsy Connector** (`etsy-connector`) | `Commerce & MCP` | browser | Etsy Open API v3 & Antigravity MCP bridge with 13-tag SEO auditor, fee/profit calcula... |
| `:8109` | **MCP Lens** (`mcp-lens`) | `Simulation & Testing` | browser | Zero-dependency real-time stdio/SSE traffic sniffer, token weight auditor, and visual... |
| `:8110` | **Agent Budget Sentinel** (`agent-budget-sentinel`) | `Security & Network` | browser | Autonomous zero-dependency spending guardrail, real-time token cost circuit breaker, ... |
| `:8112` | **Agent God's Eye** (`agent-gods-eye`) | `Security & Recon` | browser | Autonomous zero-dependency Shodan OSINT tactical radar, 3D kinetic planetary attack s... |
| `:8113` | **Shopify Connector** (`shopify-connector`) | `Commerce & MCP` | browser | Shopify GraphQL Admin API & POD sync engine with 1-click Etsy listing transpiler, net... |
| `:8114` | **Agent Voice Call** (`agent-voice-call`) | `Voice & Real-Time` | browser | Autonomous sovereign real-time voice cockpit, live audio WebSocket streaming, multi-p... |
| `:8115` | **Printify Connector** (`printify-connector`) | `Commerce & MCP` | browser | Autonomous zero-dependency Printify Open API v1 connector, 20% Premium margin calcula... |
| `:8116` | **Gelato Connector** (`gelato-connector`) | `Commerce & MCP` | browser | Autonomous zero-dependency Gelato Open API v2 connector, localized 32-country print r... |
| `:8117` | **POD Smart Router** (`pod-smart-router`) | `Commerce & MCP` | browser | Multi-channel POD order router dynamically comparing Printify (:8115) and Gelato (:81... |
| `:8118` | **Digital Asset Forge** (`digital-asset-forge`) | `Commerce & MCP` | browser | High-Res 300 DPI multi-ratio wall art pack generator (2:3, 3:4, 4:5, 11:14, ISO) for ... |
| `:8119` | **POD Mockup Forge** (`pod-mockup-forge`) | `Commerce & MCP` | browser | Autonomous photorealistic mockup studio with 60fps Lumen Matrix, fabric ink blending,... |
| `:8120` | **POD Margin Sentinel** (`pod-margin-sentinel`) | `Commerce & MCP` | browser | Autonomous real-time profit sentinel, break-even solver, and 2026 fee simulator acros... |
| `:8121` | **Vector Search Engine & Studio** (`vector-search-engine`) | `Swarm & Core` | browser | 100% in-browser HNSW skip-graph vector database, IVF clustering, Okapi BM25 lexical e... |
| `:8122` | **DeepSearch Research Agent & Studio** (`deepsearch-research-agent`) | `AI & Knowledge` | browser | 100% in-browser multi-source deep research agent with grounded inline citations, quan... |
| `:8123` | **PromptMaster Studio** (`promptmaster-studio`) | `AI & Knowledge` | browser | 100% in-browser prompt engineering and meta-optimization studio with real-time AST li... |
| `:8124` | **JWT Inspector Guard** (`jwt-inspector-guard`) | `Security & Recon` | browser | Zero-cloud in-browser JWT token decoder, cryptographic signature validator, HS256 dic... |
| `:8125` | **Web Security Guard** (`web-security-guard`) | `Security & Recon` | browser | 100% in-browser security headers auditor, TLS cert inspector, CSP Level 3 generator, ... |
| `:8126` | **Polyglot Framework Exporter** (`polyglot-framework-exporter`) | `Autonomous Web` | browser | 100% in-browser multi-framework project scaffolder (13 frameworks), AST component tra... |
| `:8127` | **AEO Graph Engine & Studio** (`aeo-graph-engine`) | `Autonomous Web` | browser | 100% in-browser Answer Engine Optimization (AEO/GEO) workbench, Schema.org JSON-LD @g... |
| `:8128` | **CWV Speed Engine** (`cwv-speed-engine`) | `Autonomous Web` | browser | 100% in-browser Core Web Vitals diagnostic engine, client DOM AST speed transformer, ... |
| `:8129` | **Cyber Turtle Studio** (`cyber-turtle-studio`) | `Media & 3D` | browser | 100% in-browser L-System fractal synthesizer, turtle geometry studio, and physical CN... |
| `:8130` | **Shodan Attack Surface Sentinel** (`shodan-surface-sentinel`) | `Security & Enclave` | local_cli | Zero-egress defensive asset auditor and InternetDB engine. Inspects open ports, CPE s... |
| `:8131` | **GhidraMCP Binary Reverse Engineering Bridge** (`ghidra-mcp-bridge`) | `Security & Enclave` | local_cli | LaurieWired Ghidra Model Context Protocol bridge for autonomous binary decompilation,... |
| `:8132` | **Zoth ASCII Magic Studio** (`zoth-ascii-magic`) | `Media & 3D` | browser | 100% client-side Image/Video/3D-to-ASCII & Sub-Pixel Unicode Braille studio with Sobe... |
| `:8133` | **YARA-X & Sigma Threat Rule Forge** (`yara-sigma-forge`) | `Security & Recon` | browser | 100% client-side YARA-X & Sigma threat detection compiler with 60fps byte-offset entr... |
| `:8134` | **Zoth Reality Shader & Theme Forge** (`reality-shader-forge`) | `Media & 3D` | browser | Interactive 60fps Reality Switch shader synthesizer and ZothOS desktop theme compiler... |
| `:8135` | **Adytum Planner** (`adytum-alchemist-ai-workflow`) | `Planning` | local_cli | The 22-key hermetic planning rite. Intention, five-minute incubation, and a local-mod... |
| `:8136` | **AZOTH Local Archon Agent** (`azoth-local-agent`) | `Swarm & Core` | local_cli | Archon Orchestrator core agent for local zero-telemetry task dispatching and subagent... |
| `:8137` | **Zoth OS v3.4.0** (`zoth-os`) | `Swarm & Core` | local_cli | Debian 13 + KDE Plasma 6.3 sovereign AI distro. Kali + Parrot parity, Studio v2, Olla... |
| `:8138` | **HexStrike Security Arsenal** (`hexstrike-arsenal`) | `Security & Recon` | local_cli | Autonomous penetration audit suite, CVE matrix inspector, and exploit payload lab. |
| `:8139` | **Product Hunt Connector (zoth-ph)** (`producthunt-connector`) | `Commerce & POD` | local_cli | Local Zoth OS cockpit that diffs the ZOTHOS Product Hunt listing against live website... |
| `:8141` | **21-Agent Swarm Multiplexer** (`zoth-swarm-multiplexer`) | `Swarm & Core` | local_cli | 21-terminal autonomous agent multiplexer daemon with hot-swappable AI harnesses, PWD ... |
| `:8142` | **WebMCP Protocol Suite** (`webmcp-protocol-inspector`) | `AI & Knowledge` | webgpu | In-browser Model Context Protocol (MCP) JSON-RPC 2.0 inspector, tool schema dispatche... |
| `:8143` | **YourDigitalSpace POD Showcase** (`storefront-catalog`) | `Commerce & POD` | local_cli | 10 master Etsy Print-on-Demand products optimized for 55+ demographic with 62.6% blen... |
| `:8144` | **Zela Glasses Guide** (`zela-glasses-guide`) | `Swarm & Core` | browser | Sovereign wearable AI mission coach for Ray-Ban Meta smart glasses over Tailscale — f... |
| `:8146` | **Zoth Bot Desktop Companion** (`zoth-bot`) | `Swarm & Core` | local_cli | Local-first always-on 3D WebGL desk companion for Zoth OS — multi-harness neural engi... |
| `:8148` | **PixelCast** (`pixel-cast`) | `Hardware & OS` | local_cli | Ultra-low latency Google Pixel screenshare, camera bridge, and sovereign wireless ADB... |
| `:8765` | **Zoth Relay (MCP Agent Bridge)** (`zoth-relay`) | `Swarm & Core` | local_cli | Hardened local MCP/HTTP bridge so many AI agents share one ZothOS machine with per-ag... |
| `:8823` | **Zoth Scene Foundry** (`zoth-scene-foundry`) | `Media & 3D` | browser | Procedural ZothOS-style ASCII + pixel-art scene engine — 1000 deterministic scenes wi... |
| `:9393` | **Zoth Civilization Hub** (`zoth-civilization`) | `Swarm & Core` | local_cli | The living heart of the 21-agent society. Runs the GameBoy pixel world simulation, Ad... |
| `:9395` | **Likeness Desk (AI Video Double)** (`likeness-desk`) | `Voice & Real-Time` | local_cli | Local video double on GPU; Chatterbox Turbo voice cloning and Wav2Lip photorealistic ... |
| `:9494` | **Zoth Bounty Research Hub** (`zoth-bounty`) | `Security & Enclave` | local_cli | Zero-false-positive security research & responsible disclosure workspace tracking Ong... |

---

## 3. Daemon Lifecycle Management

ZothOS provides unified process management through systemd user units and the `zoth fleet` supervisor.

### Core Systemd Units:
- **Zoth Studio Hub** (`:3000`): `systemctl --user status zoth-studio.service`
- **Sovereign Signal Bridge** (`:8102`): `systemctl --user status sovereign-agent-bridge.service`
- **Neuro-Memory REST API** (`:8788`): `systemctl --user status neuro-memory-rest.service`
- **Neuro-Memory Studio UI** (`:8094`): `sudo systemctl status neuro-memory.service`
- **Ollama Engine** (`:11434`): `sudo systemctl status ollama.service`
- **Agent Budget Sentinel Radar** (`:8110`): Running as background daemon
- **Agent Budget Sentinel Proxy** (`:8111`): Running as background daemon

### Fleet Supervisor Commands:
The fleet manager commands are accessible globally via `zoth fleet` or `zoth-fleet`:

```bash
# Check status of all 72 ports, latency, and FinOps breaker
zoth fleet status

# Raise all dark browser tools and local servers
zoth fleet up

# Gracefully shut down all fleet tools
zoth fleet down
```

---

## 4. FinOps Circuit Breaker Policy & Operations

The Agent Budget Sentinel protects local and cloud LLM execution against run-away agent loops.

- **Proxy Endpoint**: `http://127.0.0.1:8111/v1`
- **Inspection Radar**: `http://127.0.0.1:8110/`
- **Health JSON**: `curl http://127.0.0.1:8111/`
- **Hard Ceiling**: `$5.00 USD` cumulative session spend.
- **Velocity Limit**: `$2.00 USD / minute` burst limit.
- **Trip Action**: Proxy immediately replies HTTP 429 (`Circuit breaker is OPEN: Hard budget limit reached`).

### Resetting the Breaker:
If tripped during intentional heavy autonomous runs, reset state via:
```bash
curl -X POST http://127.0.0.1:8111/admin/reset
```

---

## 5. Hardware Allocation & Model Scaling Policy

### Hardware Reality:
- **CPU**: Intel Xeon E-2176M @ 2.70GHz (6 Cores, 12 Threads)
- **RAM**: 32 GB DDR4 (20.3 GB currently available)
- **Storage**: NVMe 425 GB (226 GB used / 178 GB free - 56% available)
- **GPU**: NVIDIA GP107GLM [Quadro P1000 Mobile 4GB VRAM]
  - Driver: NVIDIA 550.163.01
  - CUDA: Version 12.4
  - Memory: 4,096 MiB total

### Model Allocation Matrix:
| Model Name | Size | Architecture | Placement | Latency / Throughput |
| :--- | :--- | :--- | :--- | :--- |
| `qwen2.5-coder:1.5b` | 1.16 GB | Q4_K_M | **100% GPU VRAM** | Ultra-low latency (~45 tok/s) - Kept warm persistently |
| `deepseek-coder:6.7b` | 3.8 GB | Q4_K_M | Hybrid (3GB GPU + 1GB CPU) | Fast local coding (~18 tok/s) |
| `qwen2.5-coder:7b` | 4.7 GB | Q4_K_M | CPU Offload (32GB RAM) | Reliable reasoning (~12 tok/s) |
| `qwen2.5-coder:14b` | 9.0 GB | Q4_K_M | CPU Offload (32GB RAM) | High-accuracy architecture (~6 tok/s) |

> [!NOTE]
> The Quadro P1000 VRAM (4GB) cannot comfortably hold a 7B or 14B model entirely with context.
> However, with **20.3 GB free system RAM**, 7B and 14B models run with zero swap or memory pressure via llama.cpp CPU threads.
> The warm policy keeps `qwen2.5-coder:1.5b` resident in VRAM for instant agent queries (`keep_alive: -1`).

---

## 6. Commerce Row Operations

The Print-on-Demand & Commerce automation row comprises:
- `:8107` Printify Mockup Sync Studio
- `:8108` Gelato Global Routing Engine
- `:8117` POD Margin Intelligence Desk
- `:8118` Etsy Taxonomy Keyword Forge
- `:8119` Shopify Headless Store Sync
- `:8120` Multi-Platform Commerce Router

### Operating Guidelines:
1. **Local-First Previews**: All margin calculations, taxonomy lookups, and mockup transforms run 100% client-side in the browser.
2. **Breaker Protection**: When agents invoke LLM enrichment for SEO titles or product descriptions, all requests MUST pass through `:8111`.
3. **No Phantom Syncs**: Store sync daemons only push upstream when explicitly triggered with valid credentials configured in the secure vault (`:8787`).

---

## 7. Quality Gate: `registry-check`

Before making commits or modifying tool definitions:
```bash
registry-check
```
The gate asserts:
1. Zero port collisions across all 72 tools and 9 core hubs.
2. Exact parity between `public/api/tools.json`, `dist/api/tools.json`, and `catalog.json`.
3. Valid JSON schema and reachable local file paths.

---

## 8. Reality Switching System & Environment Engine

ZothOS features an integrated reality engine that synchronizes the entire operating system, terminal themes, desktop app icons, 3D interactive wallpapers, and companion bot characters across 4 specialized profiles:

| Mode ID | Reality Profile | Palette & Accent | Desktop Wallpaper | System App Icons | Konsole / Terminal Theme | Active Bot Character |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gold` | **Sovereign Gold Master** | 24K Gold (`#FFD700`) & Obsidian | `zoth-gold-master.jpg` | `Zoth-Azoth-Gold` | `Zoth-Gold` (Gold OSC) | **Azoth Prime** (`☿`, Solar Architect) |
| `ghost` | **NullAI Ghostmode Stealth** | Crimson (`#FF3355`) & Charcoal | `ghostmode-nullai.png` | `Zoth-Ghost-NullAI` | `Zoth-Ghost` (Crimson OSC) | **Ghostbyte** (`👻`, Amnesic Commander) |
| `matrix` | **Hermetic Matrix Emerald** | Phosphor (`#00FF9D`) & Deep Black | `hermetic-matrix.png` | `Zoth-Hermetic-Matrix` | `Zoth-Matrix` (Phosphor OSC) | **Lucy Netrunner** (`🜂`, STDP Memory Oracle) |
| `incognito` | **Covert Chameleon Disguise** | Azure (`#0078D4`) & Modern Fluent | `win11-bloom.jpg` | `breeze-dark` | `Zoth-Win11` (Fluent OSC) | **Chameleon 11** (`🪟`, Enterprise Assistant) |

### Reality Engine Operations:
- **CLI Mode Switcher**:
  ```bash
  # Interactive mode selector menu
  zoth-mode

  # Direct mode engagement
  zoth-mode gold
  zoth-mode ghost
  zoth-mode matrix
  zoth-mode incognito

  # Quick toggle between Gold and Ghostmode
  zoth-mode toggle
  ```
- **3D Interactive Wallpaper Engine**:
  - Accessible in browser at `http://127.0.0.1:3000/wallpaper.html`
  - Interactive WebGL / Three.js 3D canvas reacting to cursor position, clicks, and mouse drag.
  - Launches via CLI:
    ```bash
    zoth-wallpaper             # Opens 3D interactive wallpaper window
    zoth-wallpaper --fullscreen # Opens fullscreen 3D wallpaper
    ```
- **Two-Way Synchronization**:
  - Web UI and OS communicate via `http://127.0.0.1:3000/api/studio/reality`.
  - Switching reality in the terminal or `zoth-cockpit` updates the browser UI and 3D wallpaper in real time.
  - Switching reality in Zoth Studio triggers the OS-level script (`zoth-mode`), immediately transforming desktop wallpapers, app icons, GTK themes, and Konsole windows.
