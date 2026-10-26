# ZothOS Operational Runbook & Architecture Manual

> **Classification**: Sovereign Local Autonomous Infrastructure  
> **Host**: Debian 13 (trixie) | Intel Xeon E-2176M (6c/12t) | 32 GB DDR4 | NVIDIA GP107GLM [Quadro P1000 Mobile 4GB]  
> **Security Boundary**: Zero-Egress Invariant — strictly `127.0.0.1` loopback bindings only. Never `0.0.0.0`.  
> **Registry Truth**: `~/NullAITech/zoth-studio-v2/public/api/tools.json` (65 tools, 0 port collisions)  

---

## 1. System Architecture & Boundaries

ZothOS operates as a sovereign, zero-external-dependency local developer and agent intelligence hub.

```
                    +-------------------------------------------------------------+
                    |             Zoth Studio Hub (127.0.0.1:3000)                |
                    |        Vite / React SPA - 43 Workstations / 65 Tools        |
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

## 2. Complete Port Directory (65 Tools + Core Daemons)

Every tool has an assigned, unique loopback port verified by `registry-check`.

| Port | Service / Tool Name | Category | Runtime / Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `:3000` | **Zoth Studio UI** | `Hub & Studio` | Node / Vite SPA | Command center, route director, fleet & workstation hub |
| `:8094` | **Neuro-Memory Studio UI** | `Core Synaptic` | Python FastAPI | Synaptic graph memory UI & vector recall |
| `:8102` | **Sovereign Signal Bridge** | `Core IPC` | Python AsyncIO | Signal mesh dispatcher & agent consensus bridge |
| `:8110` | **Agent Budget Sentinel Radar** | `FinOps` | Python HTTP | Real-time token & dollar velocity visualization |
| `:8111` | **Budget Sentinel Proxy** | `FinOps` | Python Proxy | Egress/LLM spend proxy with $5 hard breaker |
| `:8114` | **Voice Call Cockpit** | `Voice Real-Time` | Python / WebRTC | Ultra-low latency duplex voice synthesis / clone |
| `:8787` | **Zoth Vault Daemon** | `Security Enclave` | Rust binary | Zero-knowledge credential & token enclave |
| `:8788` | **Neuro-Memory REST API** | `Core Synaptic` | Python FastAPI | Dedicated low-latency neural graph recall REST interface |
| `:11434` | **Ollama LLM Engine** | `Core LLM` | Go / llama.cpp | Local weights execution engine with Quadro P1000 acceleration |
| `:5173` | **Zoth WebGen Foundry** | `Autonomous Web` | local_cli | Published Python generator with 6 archetypes and an MCP server. A separate lo... |
| `:5174` | **Zoth WebGen** | `Autonomous Web` | local_cli | Local full-stack site foundry on 127.0.0.1:5173. GitHub 1nc0gn30/zoth-webgen.... |
| `:8080` | **Payload Entropy Studio** | `Security & Recon` | browser | 100% in-browser Shannon entropy waveform visualizer, 32-byte sliding window, ... |
| `:8081` | **Datamosh Glitch Studio** | `Media & 3D` | browser | 100% in-browser parametric video datamosh synthesizer, H.264 I-frame drop cor... |
| `:8082` | **Nexus 3D Scene Studio** | `Media & 3D` | browser | 100% in-browser WebGL mathematical 3D geometry engine, 4D Tesseract, parametr... |
| `:8083` | **UFO Sacred Geometry Studio** | `Media & 3D` | browser | 100% in-browser sacred geometry synthesizer, crop circle agro-glyph CAD gener... |
| `:8084` | **Badge3D Coin Generator** | `Media & 3D` | browser | 100% in-browser WebGL 3D coin, medallion, and relief badge generator with rea... |
| `:8085` | **Domain Intel OSINT Scout** | `Security & Recon` | browser | 100% in-browser passive domain intelligence & attack surface reconnaissance e... |
| `:8086` | **Robots.txt & AEO Auditor** | `Growth & SEO` | browser | 100% in-browser RFC 9309 robots.txt parser, AI crawler simulator (Googlebot, ... |
| `:8087` | **City Desk** | `Growth & SEO` | browser | One studio writes the finished page for a trade and a city. 1,000 localized s... |
| `:8088` | **EnvGuard Secrets Vault** | `Security & Recon` | browser | Argon2id + AES-256-GCM hardware vault for zero-cloud secret storage, Shamir q... |
| `:8089` | **Vision Gesture Control** | `Media & 3D` | browser | 100% in-browser touchless gesture control, 21-joint 3D hand tracking, spatial... |
| `:8090` | **SubSweep Lead Scanner** | `Security & Recon` | browser | 100% in-browser OSINT reconnaissance, passive DNS discovery, tech stack finge... |
| `:8091` | **OmniPost Social Engine** | `Automation` | browser | 100% in-browser social content formatting, viral thread splitter, virality sc... |
| `:8092` | **CronRhythm Studio** | `Automation` | browser | High-precision cron AST parser, 24x7 rhythm heatmap, countdown timeline, mult... |
| `:8093` | **CertPath Roadmap Studio** | `Automation` | browser | 100% in-browser certification DAG solver, career roadmap planner, and study g... |
| `:8095` | **Agent Egress Sentinel** | `Security & Network` | browser | Autonomous zero-dependency network interceptor, TLS SNI sniffer, kinetic egre... |
| `:8096` | **AudioCipher Stego Studio** | `Security & OpSec` | browser | 100% in-browser acoustic cryptography, PCM audio LSB steganography, DTMF Goer... |
| `:8097` | **Agent Mock Twin** | `Simulation & Testing` | browser | Autonomous offline API mock server & deterministic replay twin for AI agents ... |
| `:8098` | **Agent Prompt Firewall** | `Security & Network` | browser | Autonomous inline prompt injection defense, PII redactor, and threat radar fo... |
| `:8099` | **Schema Illustrator Studio** | `Autonomous Web` | browser | 100% in-browser visual database ERD studio and schema transpiler (TypeScript,... |
| `:8100` | **PWA Manifest Studio** | `Autonomous Web` | browser | 100% in-browser Progressive Web App manifest generator, ServiceWorker compile... |
| `:8101` | **Regex Droid Studio** | `Automation` | browser | 100% in-browser visual regular expression builder, AST breakdown, railroad ve... |
| `:8103` | **Anderson Security Sentinel** | `Security & OpSec` | browser | Autonomous biometric laptop perimeter defense, WiFi X-Ray RF tomography, USB ... |
| `:8104` | **Agent Flight Recorder** | `Forensics & Telemetry` | browser | Black box flight recorder & time-scrubbing telemetry forensics hub for AI age... |
| `:8105` | **Agent Capsule Jail** | `Security & Enclave` | browser | Autonomous kernel enclave sandbox, resource quota manager, and secret strippi... |
| `:8106` | **Agent Policy Auditor** | `Security & Enclave` | browser | Autonomous capability leaser, permission broker, and OWASP LLM manifest secur... |
| `:8107` | **Etsy POD Forge** | `Commerce & POD` | browser | Autonomous 300 DPI canvas generator, photorealistic mockup engine, and Etsy S... |
| `:8108` | **Etsy Connector** | `Commerce & MCP` | browser | Etsy Open API v3 & Antigravity MCP bridge with 13-tag SEO auditor, fee/profit... |
| `:8109` | **MCP Lens** | `Simulation & Testing` | browser | Zero-dependency real-time stdio/SSE traffic sniffer, token weight auditor, an... |
| `:8112` | **Agent God's Eye** | `Security & Recon` | browser | Autonomous zero-dependency Shodan OSINT tactical radar, 3D kinetic planetary ... |
| `:8113` | **Shopify Connector** | `Commerce & MCP` | browser | Shopify GraphQL Admin API & POD sync engine with 1-click Etsy listing transpi... |
| `:8115` | **Printify Connector** | `Commerce & MCP` | browser | Autonomous zero-dependency Printify Open API v1 connector, 20% Premium margin... |
| `:8116` | **Gelato Connector** | `Commerce & MCP` | browser | Autonomous zero-dependency Gelato Open API v2 connector, localized 32-country... |
| `:8117` | **POD Smart Router** | `Commerce & MCP` | browser | Multi-channel POD order router dynamically comparing Printify (:8115) and Gel... |
| `:8118` | **Digital Asset Forge** | `Commerce & MCP` | browser | High-Res 300 DPI multi-ratio wall art pack generator (2:3, 3:4, 4:5, 11:14, I... |
| `:8119` | **POD Mockup Forge** | `Commerce & MCP` | browser | Autonomous photorealistic mockup studio with 60fps Lumen Matrix, fabric ink b... |
| `:8120` | **POD Margin Sentinel** | `Commerce & MCP` | browser | Autonomous real-time profit sentinel, break-even solver, and 2026 fee simulat... |
| `:8121` | **Vector Search Engine & Studio** | `Swarm & Core` | browser | 100% in-browser HNSW skip-graph vector database, IVF clustering, Okapi BM25 l... |
| `:8122` | **DeepSearch Research Agent & Studio** | `AI & Knowledge` | browser | 100% in-browser multi-source deep research agent with grounded inline citatio... |
| `:8123` | **PromptMaster Studio** | `AI & Knowledge` | browser | 100% in-browser prompt engineering and meta-optimization studio with real-tim... |
| `:8124` | **JWT Inspector Guard** | `Security & Recon` | browser | Zero-cloud in-browser JWT token decoder, cryptographic signature validator, H... |
| `:8125` | **Web Security Guard** | `Security & Recon` | browser | 100% in-browser security headers auditor, TLS cert inspector, CSP Level 3 gen... |
| `:8126` | **Polyglot Framework Exporter** | `Autonomous Web` | browser | 100% in-browser multi-framework project scaffolder (13 frameworks), AST compo... |
| `:8127` | **AEO Graph Engine & Studio** | `Autonomous Web` | browser | 100% in-browser Answer Engine Optimization (AEO/GEO) workbench, Schema.org JS... |
| `:8128` | **CWV Speed Engine** | `Autonomous Web` | browser | 100% in-browser Core Web Vitals diagnostic engine, client DOM AST speed trans... |
| `:8129` | **Cyber Turtle Studio** | `Media & 3D` | browser | 100% in-browser L-System fractal synthesizer, turtle geometry studio, and phy... |
| `:8130` | **Shodan Attack Surface Sentinel** | `Security & Enclave` | browser | Zero-egress defensive asset auditor and InternetDB engine. Inspects open port... |
| `:8131` | **GhidraMCP Binary Reverse Engineering Bridge** | `Security & Enclave` | local_cli | LaurieWired Ghidra Model Context Protocol bridge for autonomous binary decomp... |
| `:8132` | **Zoth ASCII Magic Studio** | `Media & 3D` | browser | 100% client-side Image/Video/3D-to-ASCII & Sub-Pixel Unicode Braille studio w... |
| `:8133` | **YARA-X & Sigma Threat Rule Forge** | `Security & Recon` | browser | 100% client-side YARA-X & Sigma threat detection compiler with 60fps byte-off... |
| `:8134` | **Zoth Reality Shader & Theme Forge** | `Media & 3D` | browser | Interactive 60fps Reality Switch shader synthesizer and ZothOS desktop theme ... |
| `:8135` | **YourDigitalSpace POD Showcase** | `Commerce & POD` | browser | 10 master Etsy Print-on-Demand products optimized for 55+ demographic with 62... |
| `:8136` | **WebMCP Protocol Suite** | `AI & Knowledge` | webgpu | In-browser Model Context Protocol (MCP) JSON-RPC 2.0 inspector, tool schema d... |
| `:8137` | **Adytum Planner** | `Planning` | local_cli | The 22-key hermetic planning rite. Intention, five-minute incubation, and a l... |
| `:8138` | **AZOTH Local Archon Agent** | `Swarm & Core` | local_cli | Archon Orchestrator core agent for local zero-telemetry task dispatching and ... |
| `:8790` | **21-Agent Swarm Multiplexer** | `Swarm & Core` | local_cli | 21-terminal autonomous agent multiplexer daemon with hot-swappable AI harness... |
| `:8888` | **HexStrike Security Arsenal** | `Security & Recon` | local_cli | Autonomous penetration audit suite, CVE matrix inspector, and exploit payload... |
| `:9393` | **Zoth Civilization Hub** | `Swarm & Core` | local_cli | The living heart of the 21-agent society. Runs the GameBoy pixel world simula... |
| `:9395` | **Likeness Desk (AI Video Double)** | `Voice & Real-Time` | local_cli | Local video double on GPU; Chatterbox Turbo voice cloning and Wav2Lip photore... |

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
# Check status of all 69 ports, latency, and FinOps breaker
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
1. Zero port collisions across all 65 tools and 9 core hubs.
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
