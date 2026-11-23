#!/usr/bin/env python3
"""
showcase_gen.py — Zoth Studio "Zoth Pills" showcase roadmap generator.

Reads the canonical registry (public/api/tools.json) and emits:
  docs/SHOWCASE_ROADMAP.md     — human roadmap: series format, X streaming
                                 pipeline, seasons, one pill card per tool.
  public/api/showcase.json     — machine-readable posting plan (same data),
                                 for the scheduler / Zoth X Connector.

Curated per-tool creative content (hook / beats / why / audience) lives in
PILLS below. Any tool in the registry without a curated entry gets a
description-derived fallback and is reported as a coverage gap.

Usage:
  python3 docs/tools/../../scripts/showcase_gen.py           # write artifacts
  python3 scripts/showcase_gen.py --check                    # drift check, exit 1 on drift
"""

import json
import os
import re
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY = os.path.join(ROOT, "public", "api", "tools.json")
OUT_MD = os.path.join(ROOT, "docs", "SHOWCASE_ROADMAP.md")
OUT_JSON = os.path.join(ROOT, "public", "api", "showcase.json")

SERIES = "Zoth Pills"

# ---------------------------------------------------------------------------
# Curated per-tool pill content.
#   id: (hook, [beat1, beat2, beat3], why_it_matters, audience)
# ---------------------------------------------------------------------------
PILLS = {
    "zoth-swarm-multiplexer": (
        "Twenty-one agents, twenty-one terminals, one daemon.",
        ["Start the multiplexer daemon",
         "Hot-swap a sub-agent's AI harness mid-run",
         "Read the SSE telemetry wall"],
        "Run a whole swarm of agents with per-terminal control instead of babysitting tabs.",
        "AI infra",
    ),
    "zoth-relay": (
        "Many agents, one machine, per-agent tokens.",
        ["Connect two agents to the bridge on 127.0.0.1:8765",
         "Hit the path sandbox and command blocklist live",
         "Show the per-agent token and audit trail"],
        "Lets a swarm share one ZothOS box without any agent inheriting the others' authority.",
        "AI infra & security",
    ),
    "zoth-scene-foundry": (
        "One thousand deterministic ASCII scenes.",
        ["Crank through the scene engine",
         "Toggle Bayer dither and tube palettes",
         "Render the three.js AsciiEffect stage"],
        "Procedural retro scenes that are reproducible seed-for-seed, not random noise.",
        "Creative coding",
    ),
    "adytum-alchemist-ai-workflow": (
        "22 keys, five minutes, one local model gate.",
        ["Walk the 22-key hermetic planning rite in the TUI",
         "Enter one real intention and open the incubation log",
         "Let the local-model gate reject a vague, untestable plan"],
        "Turns a fuzzy intention into a gated, testable plan without a cloud round-trip.",
        "Founders & planners",
    ),
    "aeo-graph-engine": (
        "Your site ranks in ChatGPT only if the @graph is right.",
        ["Paste a URL and run the live semantic crawler",
         "Generate and validate the Schema.org JSON-LD @graph",
         "Export the MCP bundle for an agent to consume"],
        "Answer-engine visibility is replacing blue links; this writes the graph the LLM crawlers actually read.",
        "SEO & marketing",
    ),
    "aether-observatory": (
        "Every port, daemon and thermal zone as a 60fps orbit.",
        ["Launch the deck and watch the constellation resolve",
         "Scrub the SQLite flight recorder with the diff scrubber",
         "Toggle the Braille/Bayer dither HUD and WebAudio sonification"],
        "You can read a whole machine's state at a glance and rewind to the minute it changed.",
        "Sysadmins & homelab",
    ),
    "agent-budget-sentinel": (
        "Kill the runaway agent at the dollar, not the invoice.",
        ["Set a token budget and a hard cost ceiling",
         "Trigger a retry loop and watch the circuit breaker trip",
         "Read the interceptor log"],
        "Stops agents from burning money silently between deploys.",
        "AI devs & platform teams",
    ),
    "agent-capsule-jail": (
        "An untrusted agent, sealed inside a kernel enclave.",
        ["Drop an agent into the capsule",
         "Hit the RAM/CPU quota wall live",
         "Watch secret stripping fire on an env dump"],
        "Run third-party agents behind a hard boundary that also refuses to leak secrets.",
        "Security engineers",
    ),
    "agent-egress-sentinel": (
        "Catch the phone-home before it leaves the box.",
        ["Arm the network interceptor",
         "Let the TLS SNI sniffer catch a callback",
         "Show the kinetic egress radar and kernel quarantine"],
        "Egress is the last honest signal that an agent went rogue.",
        "SecOps",
    ),
    "agent-flight-recorder": (
        "A black box for agents: rewind the whole incident.",
        ["Load a recorded run and scrub the timeline",
         "Sync the terminal stream, egress graph and memory engrams",
         "Export the incident bundle"],
        "Post-incident forensics for when an agent does something inexplicable.",
        "AI engineering & IR",
    ),
    "agent-gods-eye": (
        "Planet-scale attack surface, in 3D, fully offline.",
        ["Enter a target and query range",
         "Watch the 3D kinetic planetary reconnaissance plot",
         "Read the threat score"],
        "Scope an engagement's public surface in minutes instead of tabs.",
        "Authorized red team",
    ),
    "agent-mock-twin": (
        "Your agent's API, replayed for zero tokens.",
        ["Ingest an OpenAPI spec or HAR capture",
         "Serve the mock to CI",
         "Replay deterministically and diff the result"],
        "CI stops costing tokens and stops flaking on third-party APIs.",
        "AI & backend devs",
    ),
    "agent-policy-auditor": (
        "What can your agent actually do? Prove it.",
        ["Load an agent manifest",
         "Audit it against OWASP LLM findings",
         "Lease a capability and watch it expire"],
        "Capability governance for agents that are already in production.",
        "Security & platform",
    ),
    "agent-prompt-firewall": (
        "Prompt injection dies at the edge.",
        ["Stream a live prompt over SSE",
         "Block an injection and redact the PII inline",
         "De-obfuscate a base64 payload with AST inspection"],
        "Inline defense for LLM apps with zero token leak.",
        "SecOps & LLM builders",
    ),
    "agent-voice-call": (
        "A voice agent that keeps zero telemetry.",
        ["Open the sovereign voice cockpit",
         "Stream live audio over WebSocket",
         "Swap persona mid-call"],
        "Real-time voice agents without handing raw audio to a cloud vendor.",
        "AI builders & privacy",
    ),
    "anderson-security-sentinel": (
        "Your laptop grows a perimeter.",
        ["Run WiFi X-Ray RF tomography",
         "Trip the USB guard by plugging a device in",
         "Switch to thermal FLIR optics"],
        "Physical-layer awareness for a machine that travels between networks.",
        "SecOps & travelers",
    ),
    "audiocipher-stego-engine": (
        "Air-gap comms, carried by sound.",
        ["Encode a message into audio LSB steganography",
         "Decode DTMF tones picked up by the mic",
         "Fire ultrasonic BFSK across the room"],
        "Move data across an air gap with no network path at all.",
        "RF & security research",
    ),
    "azoth-local-agent": (
        "Dispatch an agent swarm with zero telemetry.",
        ["Boot the Archon orchestrator",
         "Delegate a task to subagents",
         "Show the local-only transcript"],
        "The local orchestration core other Zoth agents dispatch through.",
        "AI builders",
    ),
    "badge3d-coin-generator": (
        "Mint a printable coin in the browser tab.",
        ["Design with real-time PBR metallic shaders",
         "Show the watertight mesh check",
         "Export STL and OBJ"],
        "3D medals and merch with no CAD seat and no upload.",
        "Makers & communities",
    ),
    "certpath-roadmap-studio": (
        "137 certifications, solved as one dependency graph.",
        ["Pick a target role",
         "Solve the certification DAG",
         "Export the study guide"],
        "Career pathing as a graph instead of guesswork and forum threads.",
        "Career changers & IT pros",
    ),
    "city-desk": (
        "One thousand local pages from one studio.",
        ["Pick a trade and a city",
         "Customize the page live",
         "Export the Pro bundle"],
        "Local SEO at scale, for trades that live on 'near me' searches.",
        "Agencies & trades",
    ),
    "creatorplaybooks": (
        "The playbooks top operators actually run.",
        ["Search the library with zero-tracking client-side search",
         "Open a tactical playbook",
         "Walk the business mental-model index"],
        "Curated operator knowledge that keeps working offline.",
        "Creators & founders",
    ),
    "cron-rhythm-studio": (
        "Cron you can finally see.",
        ["Paste a cron expression",
         "Read the 24x7 rhythm heatmap and countdown",
         "Transpile to K8s, GitHub Actions, EventBridge and systemd"],
        "Schedule bugs stay invisible until they fire in production.",
        "DevOps",
    ),
    "cwv-speed-engine": (
        "Core Web Vitals, diagnosed and fixed in the browser.",
        ["Diagnose a page's vitals",
         "Run the client DOM AST speed transformer",
         "Ship the PWA bundle"],
        "Speed is ranking and revenue, and it is fixable without a build pipeline.",
        "Web devs",
    ),
    "cyber-turtle-studio": (
        "Fractals that leave the screen.",
        ["Grow an L-System",
         "Preview the turtle geometry",
         "Export G-Code for the pen plotter"],
        "Generative art that becomes a physical object, not just a PNG.",
        "Generative artists",
    ),
    "datamosh-glitch-studio": (
        "Datamosh real video, inside the tab.",
        ["Drop in a clip",
         "Drop I-frames and layer CRT scanlines",
         "Mosh a live camera buffer"],
        "Publishing-grade glitch effects without opening an NLE.",
        "Video & music",
    ),
    "deepsearch-research-agent": (
        "Deep research with citations you can click.",
        ["Run a multi-source research query",
         "Open a grounded inline citation",
         "Check the quantitative consensus matrix"],
        "Research you can defend line by line, not a summary you have to trust.",
        "Researchers & analysts",
    ),
    "digital-asset-forge": (
        "A 300 DPI wall art pack in a single pass.",
        ["Generate multi-ratio wall art",
         "Split the 20MB multi-zip",
         "Show the 98% margin math"],
        "Digital downloads are the highest-margin product a seller can ship.",
        "Etsy sellers",
    ),
    "envguard-secrets-vault": (
        "Secrets that never touch a cloud.",
        ["Seal a secret with Argon2id + AES-256-GCM",
         "Shamir-split the key across quorum holders",
         "Run the leak scanner over a repo"],
        "Hardware vault plus quorum release, so no single machine holds the key.",
        "SecOps",
    ),
    "etsy-connector": (
        "Etsy Open API v3, straight from the studio.",
        ["Connect and pull a live listing",
         "Score all 13 SEO tags",
         "Generate the Printify payload"],
        "Removes the spreadsheet glue from day-to-day Etsy operations.",
        "Etsy sellers",
    ),
    "etsy-pod-forge": (
        "From idea to live listing in one pass.",
        ["Generate the 300 DPI canvas",
         "Render a photorealistic mockup",
         "Synthesize the SEO listing copy"],
        "POD listings without hiring a designer or a copywriter.",
        "POD sellers",
    ),
    "gelato-connector": (
        "32 countries, cheapest print route wins.",
        ["Connect Gelato Open API v2",
         "Route an order by destination country",
         "Read the multi-currency margin engine"],
        "Print routing is a margin problem before it is a logistics problem.",
        "POD sellers",
    ),
    "ghidra-mcp-bridge": (
        "Let an agent read the decompiler.",
        ["Bridge Ghidra over Model Context Protocol",
         "Ask an agent for a binary's AST methods",
         "Auto-annotate project variables"],
        "Binary reverse engineering with agent leverage instead of manual clicking.",
        "RE researchers",
    ),
    "hexstrike-arsenal": (
        "The audit suite that lives on your own box.",
        ["Run the autonomous pentest audit",
         "Walk the CVE matrix inspector",
         "Open the payload lab against an authorized target"],
        "Scoped offensive tooling that never leaves the machine.",
        "Pentesters (authorized)",
    ),
    "jwt-inspector-guard": (
        "Decode, verify, then try to break your own JWT.",
        ["Decode a token with zero cloud egress",
         "Validate the cryptographic signature",
         "Dictionary-crack a test HS256 token"],
        "Auth bugs found on your desk instead of in production.",
        "Web & appsec",
    ),
    "likeness-desk": (
        "Your face and voice, generated locally.",
        ["Clone a voice with Chatterbox Turbo",
         "Animate the mouth with Wav2Lip",
         "Show the GPU working at zero cloud egress"],
        "Video doubles without uploading your likeness to anyone.",
        "Creators & privacy",
    ),
    "mcp-lens": (
        "See what your MCP server actually says.",
        ["Sniff live stdio/SSE traffic",
         "Audit token weight per tool call",
         "Replay the exchange in the playground"],
        "MCP debugging is otherwise blind — this is the wiretap.",
        "AI tool builders",
    ),
    "neuro-memory-daemon": (
        "Memory with a biology, not a table.",
        ["Write an engram through the CLI",
         "Explore the 3D Cosmic Nebula viewer",
         "Show federated Zoth Memory"],
        "Persistent agent memory you can actually inspect and reason about.",
        "AI builders",
    ),
    "nexus-3d-scene-studio": (
        "Math you can export as STL.",
        ["Spin up a 4D tesseract",
         "Tune a parametric surface",
         "Export OBJ and STL meshes"],
        "A geometry engine with real mesh export, in a browser tab.",
        "3D & generative",
    ),
    "omnipost-social-engine": (
        "One draft, every platform's native format.",
        ["Paste a raw draft",
         "Split the viral thread and score it",
         "Export through the MCP hub"],
        "Writing is only a fifth of the real cost of posting everywhere.",
        "Creators & growth",
    ),
    "osint-scout-skill": (
        "A domain's whole history, from Certificate Transparency.",
        ["Audit the CT logs passively",
         "Pull DoH DNS records and SPF/DMARC posture",
         "Score the attack surface"],
        "Passive reconnaissance before you touch a single packet at the target.",
        "OSINT analysts",
    ),
    "payload-entropy-studio": (
        "Entropy reveals the payload.",
        ["Load a sample and read the Shannon waveform",
         "Slide the 32-byte window across it",
         "Generate multi-engine WAF rules"],
        "Deobfuscation and defensive rules derived from one sample, client-side.",
        "Malware analysts",
    ),
    "pixel-cast": (
        "Your Pixel as a second screen, without cables.",
        ["Pair over the Tailscale mesh",
         "Mirror the screen at ultra-low latency",
         "Open the camera bridge"],
        "Wireless device control for people who test on real hardware.",
        "Mobile devs",
    ),
    "pod-margin-sentinel": (
        "Real profit per SKU, with 2026 fees included.",
        ["Load a product catalog",
         "Solve break-even per SKU",
         "Simulate Etsy Ads at 15% versus organic"],
        "Prices set by guessing are the fastest way to lose money on volume.",
        "POD sellers",
    ),
    "pod-mockup-forge": (
        "Photorealistic mockups at 60fps.",
        ["Load the Lumen Matrix",
         "Blend fabric ink on the render",
         "Audit against Etsy 2026 photo standards"],
        "The listing photo decides the click, and the click decides everything.",
        "POD sellers",
    ),
    "pod-smart-router": (
        "Printify or Gelato? Let landed cost decide.",
        ["Ingest an order",
         "Compare landed cost, domestic proximity and speed",
         "Route it automatically"],
        "Every routing decision is pure margin, made thousands of times.",
        "POD operators",
    ),
    "polyglot-framework-exporter": (
        "One project, thirteen frameworks.",
        ["Scaffold from a spec across 13 frameworks",
         "Transpile components via AST",
         "Compress the output with client-side PKZIP"],
        "Migration and prototyping without rewriting anything by hand.",
        "Web devs",
    ),
    "printify-connector": (
        "Printify operations without the spreadsheet.",
        ["Connect the Printify Open API v1",
         "Score artwork DPI before it prints",
         "Compute the 20% Premium margin"],
        "Fewer rejected prints and better margins from the same catalog.",
        "POD sellers",
    ),
    "producthunt-connector": (
        "Launch day, tracked from your own machine.",
        ["Diff the Product Hunt listing against live website and GitHub URLs",
         "Watch votes, rank and comments land",
         "Open the loopback dashboard on :8139"],
        "Launch telemetry without handing an API token to a third-party dashboard.",
        "Founders launching",
    ),
    "promptmaster-studio": (
        "Prompts with unit tests.",
        ["Lint a prompt with real-time AST analysis",
         "Rewrite it for Claude, ChatGPT and Gemini at once",
         "Compare the three outputs side by side"],
        "Prompt quality is engineering, and it should be measurable.",
        "AI builders",
    ),
    "pwa-manifest-builder": (
        "An installable app in one session.",
        ["Build the manifest",
         "Compile the ServiceWorker and offline cache architect",
         "Export the production PWA zip"],
        "PWA fundamentals are still done wrong on most sites.",
        "Web devs",
    ),
    "reality-shader-forge": (
        "Theme your entire desktop from one shader.",
        ["Tune a Reality Switch shader",
         "Preview the Zoth Bot companions",
         "Export KDE .colors, Alacritty .toml and CSS tokens"],
        "One visual identity carried across every surface you actually look at.",
        "Linux & ricing",
    ),
    "regex-droid-builder": (
        "Regex you can see — and that will not ReDoS.",
        ["Build the pattern visually and read the AST",
         "Render the railroad vector diagram",
         "Run the static ReDoS guardian"],
        "Regex is where production outages hide in plain sight.",
        "Devs",
    ),
    "robots-txt-auditor": (
        "What can GPTBot actually read from your site?",
        ["Parse robots.txt to RFC 9309",
         "Simulate Googlebot, GPTBot, ClaudeBot and PerplexityBot",
         "Check Pro Drift Shield for changes"],
        "AI crawler policy became a business decision, not a footnote.",
        "SEO & publishers",
    ),
    "schema-illustrator-studio": (
        "Draw the database, get the code.",
        ["Design the ERD visually",
         "Transpile to TypeScript, Pydantic, Prisma, SQL DDL and GraphQL",
         "Export the schema"],
        "Schema drift starts at the whiteboard, so fix it there.",
        "Backend devs",
    ),
    "shodan-surface-sentinel": (
        "Your own exposures, audited defensively.",
        ["Audit your asset list with the InternetDB engine",
         "Walk the CPE software stacks",
         "Confirm CVE exposure with zero egress"],
        "You cannot patch what you cannot see, and you cannot see it from inside.",
        "Defensive security",
    ),
    "shopify-connector": (
        "Etsy listing to Shopify in one click.",
        ["Connect the GraphQL Admin API",
         "Transpile the Etsy listing",
         "Simulate net profit per channel"],
        "Multi-channel selling without re-entering every product by hand.",
        "Merchants",
    ),
    "sovereign-agent-bridge": (
        "Agents talking to each other, end-to-end encrypted.",
        ["Open the E2EE WebSocket signal protocol",
         "Pair two agents over the mesh",
         "Show the Simplex peer mesh IPC"],
        "Swarm IPC that never puts plaintext on the wire.",
        "AI infra",
    ),
    "storefront-catalog": (
        "Ten products, 62.6% blended margin.",
        ["Walk the ten master POD products",
         "Show the 13/13 tag sets",
         "Show the blended margin math"],
        "A POD catalog you can actually start, not a theory about one.",
        "POD sellers",
    ),
    "subsweep-lead-scanner": (
        "Find the companies worth pitching, before you pitch.",
        ["Run passive DNS discovery",
         "Fingerprint the technology stack",
         "Rank the leads with executive intelligence"],
        "Lead intelligence built only from public data, with zero cloud egress.",
        "Sales & OSINT",
    ),
    "ufo-sacred-geometry": (
        "Sacred geometry straight to DXF.",
        ["Synthesize a crop-circle agro-glyph",
         "Generate the Metatron brand media",
         "Export AutoCAD DXF, OBJ and SVG"],
        "Design to CAD and vector output with no toolchain in between.",
        "Artists & CNC",
    ),
    "vector-search-engine": (
        "A vector database that runs in the browser.",
        ["Build an HNSW skip-graph index",
         "Compare IVF clustering against Okapi BM25",
         "Run an RRF hybrid search"],
        "Understand and prototype retrieval locally before you rent a cluster.",
        "AI devs",
    ),
    "vision-gesture-control": (
        "Control the machine with your hands.",
        ["Track 21 joints in 3D",
         "Air-draw on the spatial canvas",
         "Fire an MCP action from a gesture"],
        "Touchless control plus an agent hook, useful far beyond novelty.",
        "Accessibility & XR",
    ),
    "wcag-contrast-guard": (
        "Ship contrast that passes both AA and APCA.",
        ["Score a palette against WCAG 2.2 and APCA",
         "Simulate colorblindness",
         "Generate a harmonic palette that still passes"],
        "Accessibility is legal exposure and, more often, plain quality.",
        "Design systems",
    ),
    "web-security-guard": (
        "Headers, TLS and CSP in one audit.",
        ["Audit the security headers",
         "Inspect the TLS certificate",
         "Generate CSP Level 3 and native SHA-384 SRI hashes"],
        "The cheapest wins against entire classes of web vulnerabilities.",
        "Web security",
    ),
    "webmcp-protocol-inspector": (
        "MCP JSON-RPC, inspected live.",
        ["Dispatch a tool schema through the inspector",
         "Read the raw JSON-RPC 2.0 exchange",
         "Play the Zoth OS bare-metal video showcase"],
        "See the protocol instead of guessing at it from a client library.",
        "AI tool builders",
    ),
    "yara-sigma-forge": (
        "Detection rules from a sample, client-side.",
        ["Compile YARA-X and Sigma rules",
         "Watch the 60fps byte-offset entropy radar",
         "Map the result to MITRE ATT&CK"],
        "Detection engineering without uploading a single sample anywhere.",
        "Blue team",
    ),
    "zela-glasses-guide": (
        "Mission coaching through smart glasses.",
        ["Pair Ray-Ban Meta over the Tailscale mesh",
         "Run Moondream vision and Kokoro TTS",
         "Open the full-duplex guide stream"],
        "A hands-free assistant that stays on your own mesh the whole time.",
        "Field & wearables",
    ),
    "zoth-ascii-magic": (
        "Any image, video or mesh, rendered as ASCII.",
        ["Drop in an image, video or 3D model",
         "Apply Sobel edge detection and CRT phosphor bloom",
         "Export ANSI, HTML or SVG"],
        "Retro text art generated from any asset, with sub-pixel braille detail.",
        "Creative coding",
    ),
    "zoth-bolt": (
        "Full-stack AI builder with 19 providers and local models.",
        ["Prompt a full-stack app into existence",
         "Swap the provider to local Ollama or a CLI agent",
         "Ship via Electron desktop or the TUI"],
        "Build without vendor lock and without handing over cloud keys.",
        "Devs",
    ),
    "zoth-bot": (
        "Ctrl+Shift+Space and the bot is on your desk.",
        ["Summon the always-on 3D WebGL companion",
         "Run a query through a chosen neural harness",
         "Show the Security Ring authority gating it"],
        "An always-on local assistant, kept on a leash you control.",
        "Zoth users",
    ),
    "zoth-bounty": (
        "Disclosure tracking with zero false positives.",
        ["Open the loopback command center on :9494",
         "Walk Ongoing, Pending and Completed audits",
         "Attach the audit evidence"],
        "Responsible disclosure needs a pipeline, not a spreadsheet.",
        "Researchers",
    ),
    "zoth-civilization": (
        "Twenty-three agents running an actual society.",
        ["Start the Pantheon on the Sphere of Zoth Prime",
         "Issue an Imperator Quest, Ranks I to V",
         "Watch a Planetary Decree propagate"],
        "Multi-agent dynamics you can observe and reason about, not just prompt.",
        "AI & simulation",
    ),
    "zoth-math-pillar": (
        "Four pillars of live security telemetry.",
        ["Walk L0 kernel through L3 agent runtime",
         "Switch to Compact Pill mode",
         "Open the Electron desktop overlay"],
        "Machine truth in a single always-visible HUD.",
        "SecOps & Zoth users",
    ),
    "zoth-memory-vault": (
        "Every Hermes and AGY session, mined for continuity.",
        ["Sync Hermes and AGY histories into the local SQLite FTS5 ledger",
         "Run live continuity recall to surface breakage warnings and parked ideas",
         "Inspect the friction pattern radar and personal prompt playbook"],
        "Turns scattered agent transcripts into searchable local memory that stops repeat mistakes.",
        "AI builders & power users",
    ),
    "zoth-obsidian-tracker": (
        "A 78-tool verification matrix, live.",
        ["Open the sovereign vault explorer",
         "Walk the 5 Ecosystem Pillars",
         "Play a live screenrecording from the matrix"],
        "Ecosystem status without maintaining a spreadsheet by hand.",
        "Zoth community",
    ),
    "zoth-os": (
        "A sovereign AI distro that actually boots.",
        ["Show the eight named virtual desktops",
         "Ollama on 127.0.0.1 with 163 MCP servers off by default",
         "Run zoth-workspaces to split a monitor onto its own screen"],
        "Kali and Parrot parity without the cloud dependency.",
        "Linux & security",
    ),
    "zoth-osint": (
        "Ten OSINT modules inside one investigation.",
        ["Run a subdomain takeover audit across 23+ SaaS fingerprints",
         "Check HIBP with zero-knowledge k-anonymity",
         "Export STIX 2.1 and Obsidian Canvas"],
        "Covers the whole arc from collection to finished intelligence product.",
        "OSINT analysts",
    ),
    "zoth-webgen": (
        "Three steps to a live site.",
        ["Pick a ready-made template",
         "Preview it live",
         "One-click Netlify deploy or HTML/ZIP export"],
        "Ship a real site in about a minute, on 127.0.0.1:8092.",
        "Beginners & sellers",
    ),
    "zoth-x-connector": (
        "Run X automation from your own machine.",
        ["Configure OAuth in the Zoth Vault",
         "Schedule a campaign",
         "Watch the systemd timer fire it"],
        "Own your X automation instead of renting a SaaS scheduler.",
        "Growth & creators",
    ),
    "zothnet": (
        "A darknet mesh with no DNS at all.",
        ["Bring up the mesh",
         "Show the Sphinx onion mixnet",
         "Move value on Vaelor and join via Kademlia DHT"],
        "Transport built on the assumption that the network is hostile.",
        "Privacy & P2P",
    ),
    "zothos-lite": (
        "An amnesic OS where nothing survives the reboot.",
        ["Boot toram, noswap",
         "Load one of 56 models across 8 providers",
         "Bring ZothNet P2P online"],
        "Tails-style deniability and AI capability in the same live image.",
        "Privacy & forensics",
    ),
}

# ---------------------------------------------------------------------------
# Series structure
# ---------------------------------------------------------------------------
SEASONS = [
    ("S1", "Sovereign Core", "The operating system layer: the swarm, the memory, "
     "the telemetry, and the distros everything else runs on.",
     ["Swarm & Core", "Memory & Brain", "System & Telemetry"]),
    ("S2", "Security Theatre", "Offense, defense, forensics and enclaves — the "
     "pill series your security audience actually subscribes for.",
     ["Security & Recon", "Security & Enclave", "Security & Network",
      "Security & OpSec", "Forensics & Telemetry"]),
    ("S3", "Shop & Sell", "Commerce, print-on-demand, SEO and automation: the "
     "revenue arc, where every pill ends in a dollar figure.",
     ["Commerce & MCP", "Commerce & POD", "Growth & SEO", "Automation",
      "Planning", "Education & Growth"]),
    ("S4", "Build & Broadcast", "Web, AI, media and hardware: the builder arc — "
     "every pill ends with a shipped artifact.",
     ["Autonomous Web", "AI & Knowledge", "Media & 3D", "Accessibility & UI",
      "Simulation & Testing", "Voice & Real-Time", "Hardware & OS"]),
]

PILL_SECONDS = 75
CADENCE_PER_WEEK = 5
HASHTAG_CATEGORY = {
    "Swarm & Core": "ZothSwarm", "Memory & Brain": "AgentMemory",
    "System & Telemetry": "Observability", "Security & Recon": "Recon",
    "Security & Enclave": "AppSec", "Security & Network": "Egress",
    "Security & OpSec": "OpSec", "Forensics & Telemetry": "DFIR",
    "Commerce & MCP": "POD", "Commerce & POD": "PrintOnDemand",
    "Growth & SEO": "LocalSEO", "Automation": "DevOps", "Planning": "DeepWork",
    "Education & Growth": "Learning", "Autonomous Web": "WebDev",
    "AI & Knowledge": "AI", "Media & 3D": "CreativeCoding",
    "Accessibility & UI": "A11y", "Simulation & Testing": "Testing",
    "Voice & Real-Time": "VoiceAI", "Hardware & OS": "Linux",
}


def season_for(category):
    for code, title, _blurb, cats in SEASONS:
        if category in cats:
            return code, title
    return "S4", "Build & Broadcast"


def fallback_pill(tool):
    """Description-derived pill for any registry tool without curated content."""
    desc = tool["description"]
    hook = (desc.split(" with ")[0].split(" — ")[0].split(",")[0]).strip(" .")
    return (
        hook + ".",
        [f"Open {tool['name']}",
         f"Run it on {tool.get('local_url') or tool.get('studio_url')}",
         "Walk one end-to-end output"],
        desc,
        tool["category"],
    )


def load_registry():
    with open(REGISTRY, encoding="utf-8") as fh:
        return json.load(fh)


def build():
    reg = load_registry()
    tools = sorted(reg["tools"], key=lambda t: t["name"].lower())

    season_order = [code for code, *_ in SEASONS]
    tools.sort(key=lambda t: (season_order.index(season_for(t["category"])[0]),
                              t["category"], t["name"].lower()))

    plan = []
    gaps = []
    for i, t in enumerate(tools, 1):
        curated = PILLS.get(t["id"])
        if not curated:
            gaps.append(t["id"])
            hook, beats, why, audience = fallback_pill(t)
        else:
            hook, beats, why, audience = curated
        code, title = season_for(t["category"])
        tag = HASHTAG_CATEGORY.get(t["category"], "ZothStudio")
        plan.append({
            "episode": i,
            "pill": f"{SERIES.rstrip('s')}-{i:03d}",
            "season": code,
            "season_title": title,
            "id": t["id"],
            "name": t["name"],
            "category": t["category"],
            "execution_type": t["execution_type"],
            "version": t.get("version"),
            "studio_url": t.get("studio_url"),
            "local_url": t.get("local_url"),
            "port": t.get("port"),
            "github": t.get("github"),
            "duration_s": PILL_SECONDS,
            "hook": hook,
            "beats": beats,
            "why": why,
            "audience": audience,
            "capture_route": ("record in-browser studio"
                              if t["execution_type"] in ("browser", "webgpu", "hybrid")
                              else "record local CLI/daemon at " + str(t.get("local_url"))),
            "x_copy": (f"{hook}\n\n{why}\n\n"
                       f"{t.get('studio_url') or ''}\n"
                       f"100% local, zero telemetry, free.\n"
                       f"#{tag} #ZothStudio #ZothPills"),
        })
    return reg, tools, plan, gaps


def render_md(reg, tools, plan, gaps):
    total = len(plan)
    weeks = -(-total // CADENCE_PER_WEEK)
    out = []
    w = out.append

    w("# Zoth Studio — Showcase Roadmap (“Zoth Pills”)")
    w("")
    w(f"Generated by `scripts/showcase_gen.py` from `public/api/tools.json` "
      f"(registry schema `{reg.get('schema')}`, {total} tools, "
      f"registry generated {reg.get('generated_at')}).")
    w("")
    w("## What a Zoth Pill is")
    w("")
    w(f"A Zoth Pill is one tool, {PILL_SECONDS} seconds, no slides. The format is "
      "fixed so the series stays recognisable and every episode is reusable as "
      "a live stream, a clip, a thread and a doc embed.")
    w("")
    w("| Time | Beat | Rule |")
    w("|------|------|------|")
    w("| 0:00–0:08 | **Hook** | Name the tool and the one problem it kills. Say it out loud on camera. |")
    w("| 0:08–0:45 | **Proof** | Run it for real: real input, real output, real numbers. No mockups, no slides. |")
    w("| 0:45–1:05 | **So what** | Why it matters to a specific audience. One sentence, not a feature list. |")
    w("| 1:05–1:15 | **CTA** | Studio URL, the fact it is local and free, then the next pill. |")
    w("")
    w("Three rules that make or break a pill:")
    w("")
    w("1. **Show the output, not the UI.** Nobody subscribes for a dashboard tour — "
      "they subscribe for the artifact, the number, or the block.")
    w("2. **Never fake a control.** Every click drives real state; a pill that fakes "
      "a button gets caught in the replies.")
    w("3. **One pill, one idea.** If the tool needs two ideas, it is two pills.")
    w("")
    w(f"## Series shape")
    w("")
    w(f"- **{total} pills**, {CADENCE_PER_WEEK} per week → **{weeks} weeks** "
      f"({weeks * CADENCE_PER_WEEK - total} slack slots left for retakes).")
    w("- **Four seasons**, grouped by category so each season inherits one audience "
      "instead of resetting it every week.")
    w("- **Cadence:** Mon–Fri, same posting time. Front-load the highest-signal pills "
      "(security, revenue) early in each week — editorial judgement on our side, not a "
      "measured engagement claim.")
    w("")
    w("| Season | Theme | Pills | Audience carried through the season |")
    w("|--------|-------|-------|--------------------------------------|")
    for code, title, blurb, cats in SEASONS:
        n = sum(1 for p in plan if p["season"] == code)
        w(f"| **{code}** | {title} | {n} | {blurb} |")
    w("")
    w("## Two routes to X")
    w("")
    w("X live video is created in **Media Studio** (RTMP ingest); the X API v2 does "
      "not expose a broadcast-create endpoint (as of writing), so nothing can start "
      "a live stream programmatically. That splits the pipeline in two:")
    w("")
    w("**Route A — live (the studio stream).** OBS → RTMP to the X ingest URL → live "
      "on X. Best for the launch of a season: stream the long-form session, then cut "
      "the pills out of the VOD. Use it weekly, not daily.")
    w("")
    w("**Route B — pills as posted clips (the daily engine).** Record the pill with "
      "the repo's headless capture harness, encode, then post the clip + thread with "
      "`xurl` or the **Zoth X Connector** (`:8152`, systemd timer scheduler, multi-account). "
      "This is the workhorse route — it is schedulable, repeatable and needs nobody awake.")
    w("")
    w("### Route B in practice")
    w("")
    w("```bash")
    w("# 1. Start the studio locally")
    w("npm run dev            # studio on http://127.0.0.1:3000")
    w("")
    w("# 2. Record one pill. scripts/capture_pill.mjs is the single new utility this")
    w("#    roadmap needs: scripts/capture_livestream_showcase.mjs generalised to take a")
    w("#    tool slug + output dir (that script hardcodes six routes and its own outDir).")
    w("node scripts/capture_pill.mjs --tool zoth-bolt --out dist/pills/")
    w("")
    w("# 3. Post the clip + the pre-written copy from the plan")
    w("python3 -c \"import json;p=[x for x in json.load(open('public/api/showcase.json'))"
      "['plan'] if x['id']=='zoth-bolt'][0];print(p['x_copy'])\"")
    w("xurl media upload dist/pills/zoth-bolt.mp4     # -> MEDIA_ID")
    w("xurl media status --wait MEDIA_ID              # video is processed server-side")
    w("xurl post \"$(cat dist/pills/zoth-bolt.txt)\" --media-id MEDIA_ID")
    w("```")
    w("")
    w("`xurl` is the X developer-platform CLI and needs a one-time OAuth that the account "
      "owner runs themselves (secrets never touch this session); confirm it with "
      "`xurl auth status`. The **Zoth X Connector** does its own OAuth through the Zoth "
      "Vault instead, so a fully scheduled pipeline needs no interactive auth at all.")
    w("")
    w("Pills already exist as per-tool intro captures: 94 files (47 mp4, 46 webp, 1 webm) "
      "across 17 tools, named `<slug>-desktop.webp` / `<slug>-mobile.webp` and "
      "`<slug>-intro-desktop.mp4` / `<slug>-intro-mobile.mp4`. The site serves them from "
      "`public/studio-captures/` via `src/data/galleryManifest.js`; `dist/studio-captures/` "
      "holds the built copy. The roadmap reuses that naming so historical captures stay "
      "addressable instead of being recaptured.")
    w("")
    w("## Per-pill production checklist")
    w("")
    w("- [ ] Tool is running and the demo input is staged **before** recording")
    w("- [ ] Hook line written down (it is in the plan below) and said in one take")
    w("- [ ] Real output visible on screen within the first 15 seconds")
    w("- [ ] One number or artifact named explicitly (cost, margin, ports, bytes)")
    w("- [ ] No terminal `history`, no mounted tokens, no client names on screen")
    w("- [ ] `x_copy` posted with the clip, thread reply carrying the repo link")
    w("- [ ] Pill added to the season playlist and the studio tool page")
    w("")
    w("## Season breakdowns")
    w("")
    for code, title, blurb, cats in SEASONS:
        rows = [p for p in plan if p["season"] == code]
        if not rows:
            continue
        w(f"### {code} — {title} ({len(rows)} pills)")
        w("")
        w(blurb)
        w("")
        w("| Ep | Pill | Tool | Category | Route |")
        w("|----|------|------|----------|-------|")
        for p in rows:
            w(f"| {p['episode']} | `{p['pill']}` | {p['name']} | {p['category']} | "
              f"{'browser' if p['execution_type'] in ('browser','webgpu','hybrid') else 'CLI/daemon'} |")
        w("")
    w("## Pill cards")
    w("")
    w("Each card is the whole episode: hook, the three beats to show, the reason it "
      "is useful, and ready-to-post copy.")
    w("")
    for p in plan:
        w(f"### {p['episode']}. {p['name']} — `{p['pill']}`")
        w("")
        w(f"*{p['category']} · {p['execution_type']} · "
          f"{p['studio_url'] or p['local_url']}*")
        w("")
        w(f"**Hook:** {p['hook']}")
        w("")
        for i, b in enumerate(p["beats"], 1):
            w(f"{i}. {b}")
        w("")
        w(f"**Why it matters:** {p['why']}")
        w(f"**Audience:** {p['audience']}")
        w(f"**Capture:** {p['capture_route']}")
        w("")
        w("```text")
        w(p["x_copy"])
        w("```")
        w("")
    w("## Coverage")
    w("")
    w(f"- Registry tools: **{len(tools)}** · pills planned: **{total}** · "
      f"curated hooks: **{total - len(gaps)}** · description-derived fallbacks: **{len(gaps)}**")
    if gaps:
        w(f"- Fallback entries needing a curated hook: {', '.join('`'+g+'`' for g in gaps)}")
    w("- Regenerate with `python3 scripts/showcase_gen.py`; verify no drift with "
      "`python3 scripts/showcase_gen.py --check`.")
    w("- Keep in step with `scripts/registry-check.py`: a tool added to "
      "`public/api/tools.json` without a curated entry here shows up as a fallback.")
    w("")
    return "\n".join(out) + "\n"


def render_json(reg, plan, gaps):
    total = len(plan)
    weeks = -(-total // CADENCE_PER_WEEK)
    return json.dumps({
        "schema": "zoth/showcase-plan/v1",
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source_registry": "public/api/tools.json",
        "source_registry_schema": reg.get("schema"),
        "series": SERIES,
        "pill_seconds": PILL_SECONDS,
        "cadence_per_week": CADENCE_PER_WEEK,
        "total_pills": total,
        "weeks": weeks,
        "seasons": [{"code": c, "title": t, "blurb": b,
                     "pills": sum(1 for p in plan if p["season"] == c)}
                    for c, t, b, _cats in SEASONS],
        "curated": total - len(gaps),
        "fallbacks": gaps,
        "plan": plan,
    }, indent=2) + "\n"


def main():
    check = "--check" in sys.argv
    reg, tools, plan, gaps = build()
    md = render_md(reg, tools, plan, gaps)
    js = render_json(reg, plan, gaps)

    if check:
        drift = []
        for path, want in ((OUT_MD, md), (OUT_JSON, js)):
            have = open(path, encoding="utf-8").read() if os.path.exists(path) else None
            if have is None:
                drift.append(f"MISSING {os.path.relpath(path, ROOT)}")
            elif have != want:
                # generated_at makes the JSON differ every run; compare plan body only
                if path == OUT_JSON:
                    hj, wj = json.loads(have), json.loads(want)
                    hj.pop("generated_at", None); wj.pop("generated_at", None)
                    if hj == wj:
                        continue
                drift.append(f"DRIFT {os.path.relpath(path, ROOT)}")
        if drift:
            print("showcase_gen --check: FAIL")
            for d in drift:
                print(" ", d)
            return 1
        print(f"showcase_gen --check: OK ({len(plan)} pills, no drift)")
        return 0

    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
    with open(OUT_MD, "w", encoding="utf-8") as fh:
        fh.write(md)
    with open(OUT_JSON, "w", encoding="utf-8") as fh:
        fh.write(js)
    print(f"wrote {os.path.relpath(OUT_MD, ROOT)} ({len(md)} chars)")
    print(f"wrote {os.path.relpath(OUT_JSON, ROOT)} ({len(js)} chars)")
    print(f"pills: {len(plan)} | curated: {len(plan)-len(gaps)} | fallbacks: {len(gaps)}")
    if gaps:
        print("fallback ids:", ", ".join(gaps))
    for c, t, _b, _cats in SEASONS:
        print(f"  {c} {t}: {sum(1 for p in plan if p['season'] == c)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
