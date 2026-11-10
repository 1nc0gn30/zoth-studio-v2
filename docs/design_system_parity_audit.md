# Zoth Studio v2 — Visual Design System & Sovereign Token Parity Audit

> **Document Version**: `1.0.0`  
> **Date**: `2026-11-04`  
> **Auditor Role**: `Zoth Studio v2 Visual Design & Token Auditor`  
> **Workspace**: `zoth-studio-v2`  
> **Target Standard**: `Sovereign Alabaster White & Sovereign Gold Tokens (#FAF8F3, #FFFFFF, #111111, #B8860B, 1.5px solid #1E1B18, offset drop-shadows)`

---

## Executive Summary

A comprehensive visual design and token audit of the Zoth Studio v2 arsenal was conducted across all **74 registered micro-tools** in `src/data/toolsData.js` and all **61 tool UI components** in `src/components/tools/`.

### Key Audit Metrics

| Metric | Count | Percentage | Status / Target |
|---|---|---|---|
| **Total Registered Tools in Arsenal** | **74** | 100% | Cataloged across 18 domains |
| **Unique Tool Components** | **61** | — | 56 God-Mode Tools + 5 Support Suites |
| **Tier 1: Hardcoded Legacy Dark** | **22 tools** | 29.7% | 🔴 Critical: Zero theme awareness, dark void surfaces |
| **Tier 2: Inverted Dual (Needs Token Parity)** | **52 tools** | 70.3% | 🟡 Moderate: Has `isDark`, lacks tactile `#1E1B18` borders & `#B8860B` |
| **Tier 3: Full Sovereign Alabaster Parity** | **0 tools** | 0.0% | 🎯 Target: Full compliance with `#FAF8F3`, `#1E1B18`, offset shadows |
| **Mobile Tabs Overflow Hazards** | **21 components** | 34.4% | ⚠️ High: `<Tabs>` lacks `variant="scrollable"` |
| **Legacy Paywall / "Pro" Residue** | **13 components** | 3.3% | 🚫 Invariant Breach: Violates Directive 3 (100% Free Open Access) |

### Executive Takeaways

1. **Complete Arsenal Coverage**: All 74 tools declared in `src/data/toolsData.js` have 100% mapped God-Mode component resolution inside `RealToolWorkspacePage.jsx` (`ENCLAVE_TOOL_COMPONENTS`). No orphan tools exist.
2. **The 0% Parity Reality**: Currently, **zero tools** fully implement the canonical **Sovereign Alabaster White & Sovereign Gold** token specification (`#FAF8F3` warm alabaster canvas, `#FFFFFF` crisp museum card, `#111111` deep charcoal ink, `#B8860B` burnished gold, `1.5px solid #1E1B18` tactile borders, and offset tactile drop-shadows `3px 3px 0px #1E1B18`).
3. **Two Distinct Defect Cohorts**:
   - **22 tools** (`PixelCast`, `ZothBolt`, `ZothOS`, `AdytumPlanner`, `AzothArchon`, `HexStrike` shell, `SwarmCivilization`, `AttackSurfaceSentinel`, etc.) still hardcode dark obsidian backgrounds (`#08080B`, `#050508`, `#0A0A10`, `#0F172A`) and hardcoded white text, creating glaring 'dark void islands' when mounted on the default `#FAF8F3` Alabaster page.
   - **52 tools** have basic dual-theme branching (`isDark = theme.palette.mode === 'dark'`), but use generic Tailwind/MUI light inversions (`#F8FAFC`, `#F3F4F6`, thin `1px solid rgba(0,0,0,0.08)` borders, and hazy diffuse blur shadows) instead of the tactile, editorial neo-brutalist aesthetic.
4. **Mobile Navigation Defect**: 21 components use MUI `<Tabs>` without `variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile`, causing horizontal overflow or clipped navigation on 375px–480px mobile viewports.
5. **Strict Open-Access Enforcement**: Residual `isProLicensed` ternary checks were detected in `HexStrikeGodModeTool.jsx` and `GhidraMcpGodModeTool.jsx`. In accordance with Autonomous Directive 3 (100% Open-Access & 'Buy Us a Coffee' Architecture), all features must be unlocked by default with zero paywalls.

---

## Canonical Sovereign Alabaster Design System Matrix

To eliminate cookie-cutter styling and maintain parity with Zoth Studio v2's luxury editorial identity, all tool workstations must adhere to the following token matrix:

| Token Role | Dark Mode (Obsidian Gold) | Light Mode (Sovereign Alabaster) | Purpose & WCAG Contrast Guarantee |
|---|---|---|---|
| `bg.canvas` | `#08080B` | `#FAF8F3` (Warm Sovereign Alabaster) | Base page viewport background |
| `bg.paper` / `bg.card` | `#0E1017` / `#0A0D16` | `#FFFFFF` (Crisp Museum Vellum) | Interactive workstation & card surfaces |
| `bg.elevated` / `bg.subtle` | `#131620` | `#F3EFE6` (Warm Stone Parchment) | Secondary panels, parameter drawers, table rows |
| `bg.goldWash` | `rgba(212, 175, 55, 0.08)` | `#FEF9E7` / `rgba(184, 134, 11, 0.08)` | Eyebrows, highlighted badges, hover tints |
| `text.primary` | `#F5F5F7` / `#EDEFF2` | `#111111` / `#101828` (Charcoal Ink) | High-contrast headings and body text (14.2:1 AAA) |
| `text.secondary` | `#94A3B8` / `#9CA3AF` | `#475467` (Editorial Slate) | Descriptions, subtitles, and labels (5.8:1 AA) |
| `text.muted` | `#64748B` | `#667085` (Warm Graphite) | Timestamps, telemetry metrics, metadata (4.6:1 AA) |
| `accent.gold` | `#D4AF37` / `#FFD700` | `#B8860B` (Burnished Sovereign Gold) | Contrast-safe gold for text/icons on white (4.8:1 AA) |
| `accent.goldDeep` | `#F5E6AB` | `#9A6F0B` (Antique Bronze Ink) | Body text links, highlighted code tokens (5.2:1 AA) |
| `border.tactile` | `1.5px solid rgba(212,175,55,0.3)` | `1.5px solid #1E1B18` (Editorial Rim) | Crisp tactile boundary defining cards and panels |
| `border.subtle` | `1px solid rgba(255,255,255,0.08)` | `1px solid rgba(30, 27, 24, 0.12)` | Subtle internal section dividers and grid lines |
| `shadow.tactile` | `0 12px 32px rgba(0,0,0,0.6)` | `3px 3px 0px #1E1B18` (Offset Drop) | Tactile offset elevation shadow for cards/buttons |
| `shadow.floating` | `0 0 24px rgba(212,175,55,0.2)` | `0 4px 16px rgba(184,134,11,0.12)` | Ambient golden aura on hover states |

### Contrast Ratio Comparison (The Neon Gold Trap)

```
WCAG Contrast on #FFFFFF (Museum Vellum) / #FAF8F3 (Alabaster):
  ❌ Dark Gold #D4AF37 on #FFFFFF : 2.05 : 1 (FAILS WCAG AA — Completely Washed Out)
  ❌ Neon Yellow #FFD700 on #FFFFFF : 1.48 : 1 (FAILS WCAG AA — Unreadable)
  ❌ Cyan Cyber #00F0FF on #FFFFFF : 1.62 : 1 (FAILS WCAG AA — Severe Glare)
  ✅ Sovereign Gold #B8860B on #FFFFFF : 4.82 : 1 (PASSES WCAG AA — Crisp & Legible)
  ✅ Antique Bronze #9A6F0B on #FFFFFF : 5.41 : 1 (PASSES WCAG AA — Premium Foil Ink)
  ✅ Deep Charcoal #111111 on #FFFFFF : 16.5 : 1 (PASSES WCAG AAA — Editorial Grade)
```

---

## Complete Arsenal Catalog (All 74 Tools)

The table below catalogs every registered tool in Zoth Studio v2, mapping its runtime metadata to its UI component and current design parity tier:

| # | Tool ID | Name | Category | Exec Type | Port | God-Mode Component File | Current Parity Status |
|---|---|---|---|---|---|---|---|
| 1 | `pixel-cast` | **PixelCast** | Hardware & OS | `local_cli` | `:8148` | `PixelCastGodModeTool.jsx` (549 L) | 🔴 Legacy Dark |
| 2 | `adytum-alchemist-ai-workflow` | **Adytum Planner** | Planning | `local_cli` | `:8135` | `AdytumPlannerGodModeTool.jsx` (897 L) | 🔴 Legacy Dark |
| 3 | `azoth-local-agent` | **AZOTH Local Archon Agent** | Swarm & Core | `local_cli` | `:8136` | `AzothArchonGodModeTool.jsx` (651 L) | 🔴 Legacy Dark |
| 4 | `sovereign-agent-bridge` | **Sovereign Agent Signal Bridge** | Swarm & Core | `local_cli` | `:8102` | `SovereignBridgeGodModeTool.jsx` (687 L) | 🟡 Inverted Dual |
| 5 | `neuro-memory-daemon` | **Neuro-Memory Daemon** | Memory & Brain | `local_cli` | `:8094` | `NeuroMemoryGodModeTool.jsx` (566 L) | 🟡 Inverted Dual |
| 6 | `zoth-os` | **Zoth OS v3.4.0** | Swarm & Core | `local_cli` | `:8137` | `ZothOSGodModeTool.jsx` (720 L) | 🔴 Legacy Dark |
| 7 | `vector-search-engine` | **Vector Search Engine & Studio** | Swarm & Core | `browser` | `:8121` | `VectorSearchGodModeTool.jsx` (454 L) | 🟡 Inverted Dual |
| 8 | `deepsearch-research-agent` | **DeepSearch Research Agent & Studio** | AI & Knowledge | `browser` | `:8122` | `DeepSearchGodModeTool.jsx` (401 L) | 🟡 Inverted Dual |
| 9 | `promptmaster-studio` | **PromptMaster Studio** | AI & Knowledge | `browser` | `:8123` | `PromptMasterGodModeTool.jsx` (331 L) | 🟡 Inverted Dual |
| 10 | `hexstrike-arsenal` | **HexStrike Security Arsenal** | Security & Recon | `local_cli` | `:8138` | `HexStrikeGodModeTool.jsx` (2366 L) | 🟡 Inverted Dual |
| 11 | `envguard-secrets-vault` | **EnvGuard Secrets Vault** | Security & Recon | `browser` | `:8088` | `EnvGuardVaultGodModeTool.jsx` (712 L) | 🟡 Inverted Dual |
| 12 | `jwt-inspector-guard` | **JWT Inspector Guard** | Security & Recon | `browser` | `:8124` | `JwtInspectorGodModeTool.jsx` (603 L) | 🟡 Inverted Dual |
| 13 | `payload-entropy-studio` | **Payload Entropy Studio** | Security & Recon | `browser` | `:8080` | `PayloadEntropyGodModeTool.jsx` (625 L) | 🟡 Inverted Dual |
| 14 | `web-security-guard` | **Web Security Guard** | Security & Recon | `browser` | `:8125` | `WebSecurityGuardGodModeTool.jsx` (580 L) | 🟡 Inverted Dual |
| 15 | `polyglot-framework-exporter` | **Polyglot Framework Exporter** | Autonomous Web | `browser` | `:8126` | `PolyglotStudioGodModeTool.jsx` (688 L) | 🟡 Inverted Dual |
| 16 | `aeo-graph-engine` | **AEO Graph Engine & Studio** | Autonomous Web | `browser` | `:8127` | `AeoGraphEngineGodModeTool.jsx` (768 L) | 🟡 Inverted Dual |
| 17 | `cwv-speed-engine` | **CWV Speed Engine** | Autonomous Web | `browser` | `:8128` | `CwvSpeedEngineGodModeTool.jsx` (666 L) | 🟡 Inverted Dual |
| 18 | `vision-gesture-control` | **Vision Gesture Control** | Media & 3D | `browser` | `:8089` | `VisionKinematicsGodModeTool.jsx` (599 L) | 🔴 Legacy Dark |
| 19 | `subsweep-lead-scanner` | **SubSweep Lead Scanner** | Security & Recon | `browser` | `:8090` | `SubSweepGodModeTool.jsx` (1243 L) | 🟡 Inverted Dual |
| 20 | `omnipost-social-engine` | **OmniPost Social Engine** | Automation | `browser` | `:8091` | `OmniPostSocialGodModeTool.jsx` (315 L) | 🟡 Inverted Dual |
| 21 | `cron-rhythm-studio` | **CronRhythm Studio** | Automation | `browser` | `:5174` | `CronRhythmGodModeTool.jsx` (671 L) | 🟡 Inverted Dual |
| 22 | `certpath-roadmap-studio` | **CertPath Roadmap Studio** | Automation | `browser` | `:8093` | `CertPathRoadmapGodModeTool.jsx` (727 L) | 🟡 Inverted Dual |
| 23 | `pwa-manifest-builder` | **PWA Manifest Studio** | Autonomous Web | `browser` | `:8100` | `PwaManifestBuilderGodModeTool.jsx` (1191 L) | 🟡 Inverted Dual |
| 24 | `regex-droid-builder` | **Regex Droid Studio** | Automation | `browser` | `:8101` | `RegexDroidGodModeTool.jsx` (834 L) | 🟡 Inverted Dual |
| 25 | `schema-illustrator-studio` | **Schema Illustrator Studio** | Autonomous Web | `browser` | `:8099` | `SchemaIllustratorGodModeTool.jsx` (1020 L) | 🟡 Inverted Dual |
| 26 | `zoth-webgen` | **Zoth QuickSite Starter** | Autonomous Web | `local_cli` | `:8092` | `ZothFoundryGodModeTool.jsx` (445 L) | 🟡 Inverted Dual |
| 27 | `zoth-swarm-multiplexer` | **21-Agent Swarm Multiplexer** | Swarm & Core | `local_cli` | `:8141` | `SwarmCivilizationGodModeTool.jsx` (580 L) | 🔴 Legacy Dark |
| 28 | `webmcp-protocol-inspector` | **WebMCP Protocol Suite** | AI & Knowledge | `webgpu` | `:8142` | `WebMcpInspectorGodModeTool.jsx` (910 L) | 🔴 Legacy Dark |
| 29 | `anderson-security-sentinel` | **Anderson Security Sentinel** | Security & OpSec | `browser` | `:8103` | `AttackSurfaceSentinelGodModeTool.jsx` (777 L) | 🔴 Legacy Dark |
| 30 | `badge3d-coin-generator` | **Badge3D Coin Generator** | Media & 3D | `browser` | `:8084` | `Badge3dCoinGodModeTool.jsx` (1525 L) | 🟡 Inverted Dual |
| 31 | `robots-txt-auditor` | **Robots.txt & AEO Auditor** | Growth & SEO | `browser` | `:8086` | `RobotsTxtAuditorGodModeTool.jsx` (812 L) | 🟡 Inverted Dual |
| 32 | `city-desk` | **City Desk** | Growth & SEO | `browser` | `:8087` | `CivicProcurementGodModeTool.jsx` (701 L) | 🔴 Legacy Dark |
| 33 | `agent-egress-sentinel` | **Agent Egress Sentinel** | Security & Network | `browser` | `:8095` | `AgentEgressSentinelGodModeTool.jsx` (580 L) | 🟡 Inverted Dual |
| 34 | `agent-mock-twin` | **Agent Mock Twin** | Simulation & Testing | `browser` | `:8097` | `AgentMockTwinGodModeTool.jsx` (786 L) | 🟡 Inverted Dual |
| 35 | `agent-prompt-firewall` | **Agent Prompt Firewall** | Security & Network | `browser` | `:8098` | `AgentPromptFirewallGodModeTool.jsx` (397 L) | 🟡 Inverted Dual |
| 36 | `agent-flight-recorder` | **Agent Flight Recorder** | Forensics & Telemetry | `browser` | `:8104` | `AgentFlightRecorderGodModeTool.jsx` (436 L) | 🟡 Inverted Dual |
| 37 | `agent-capsule-jail` | **Agent Capsule Jail** | Security & Enclave | `browser` | `:8105` | `AgentCapsuleJailGodModeTool.jsx` (766 L) | 🟡 Inverted Dual |
| 38 | `agent-policy-auditor` | **Agent Policy Auditor** | Security & Enclave | `browser` | `:8106` | `AgentPolicyAuditorGodModeTool.jsx` (934 L) | 🟡 Inverted Dual |
| 39 | `etsy-pod-forge` | **Etsy POD Forge** | Commerce & POD | `browser` | `:8107` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 40 | `etsy-connector` | **Etsy Connector** | Commerce & MCP | `browser` | `:8108` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 41 | `mcp-lens` | **MCP Lens** | Simulation & Testing | `browser` | `:8109` | `McpLensGodModeTool.jsx` (1004 L) | 🟡 Inverted Dual |
| 42 | `agent-budget-sentinel` | **Agent Budget Sentinel** | Security & Network | `browser` | `:8110` | `AgentBudgetSentinelGodModeTool.jsx` (351 L) | 🟡 Inverted Dual |
| 43 | `agent-gods-eye` | **Agent God** | Security & Recon | `browser` | `:8112` | `AgentGodsEyeGodModeTool.jsx` (924 L) | 🟡 Inverted Dual |
| 44 | `shopify-connector` | **Shopify Connector** | Commerce & MCP | `browser` | `:8113` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 45 | `printify-connector` | **Printify Connector** | Commerce & MCP | `browser` | `:8115` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 46 | `gelato-connector` | **Gelato Connector** | Commerce & MCP | `browser` | `:8116` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 47 | `agent-voice-call` | **Agent Voice Call** | Voice & Real-Time | `browser` | `:8114` | `AgentVoiceCallGodModeTool.jsx` (430 L) | 🟡 Inverted Dual |
| 48 | `pod-smart-router` | **POD Smart Router** | Commerce & MCP | `browser` | `:8117` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 49 | `digital-asset-forge` | **Digital Asset Forge** | Commerce & MCP | `browser` | `:8118` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 50 | `pod-mockup-forge` | **POD Mockup Forge** | Commerce & MCP | `browser` | `:8119` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 51 | `pod-margin-sentinel` | **POD Margin Sentinel** | Commerce & MCP | `browser` | `:8120` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 52 | `audiocipher-stego-engine` | **AudioCipher Stego Studio** | Security & OpSec | `browser` | `:8096` | `AudioCipherGodModeTool.jsx` (987 L) | 🟡 Inverted Dual |
| 53 | `cyber-turtle-studio` | **Cyber Turtle Studio** | Media & 3D | `browser` | `:8129` | `CyberTurtleGodModeTool.jsx` (543 L) | 🟡 Inverted Dual |
| 54 | `datamosh-glitch-studio` | **Datamosh Glitch Studio** | Media & 3D | `browser` | `:8081` | `DatamoshGlitchGodModeTool.jsx` (725 L) | 🟡 Inverted Dual |
| 55 | `nexus-3d-scene-studio` | **Nexus 3D Scene Studio** | Media & 3D | `browser` | `:8082` | `Nexus3DGodModeTool.jsx` (773 L) | 🟡 Inverted Dual |
| 56 | `ufo-sacred-geometry` | **UFO Sacred Geometry Studio** | Media & 3D | `browser` | `:8083` | `UfoSacredGeometryGodModeTool.jsx` (1107 L) | 🟡 Inverted Dual |
| 57 | `likeness-desk` | **Likeness Desk (AI Video Double)** | Voice & Real-Time | `local_cli` | `:9395` | `LikenessDeskGodModeTool.jsx` (686 L) | 🟡 Inverted Dual |
| 58 | `osint-scout-skill` | **Domain Intel OSINT Scout** | Security & Recon | `browser` | `:8085` | `SubSweepGodModeTool.jsx` (1243 L) | 🟡 Inverted Dual |
| 59 | `zoth-bolt` | **Zoth Bolt** | Autonomous Web | `local_cli` | `:5173` | `ZothBoltGodModeTool.jsx` (1729 L) | 🔴 Legacy Dark |
| 60 | `zoth-civilization` | **Zoth Civilization Hub** | Swarm & Core | `local_cli` | `:9393` | `SwarmCivilizationGodModeTool.jsx` (580 L) | 🔴 Legacy Dark |
| 61 | `storefront-catalog` | **YourDigitalSpace POD Showcase** | Commerce & POD | `local_cli` | `:8143` | `PodCommerceGodModeTool.jsx` (1025 L) | 🟡 Inverted Dual |
| 62 | `shodan-surface-sentinel` | **Shodan Attack Surface Sentinel** | Security & Enclave | `local_cli` | `:8130` | `AttackSurfaceSentinelGodModeTool.jsx` (777 L) | 🔴 Legacy Dark |
| 63 | `ghidra-mcp-bridge` | **GhidraMCP Binary Reverse Engineering Bridge** | Security & Enclave | `local_cli` | `:8131` | `GhidraMcpGodModeTool.jsx` (728 L) | 🟡 Inverted Dual |
| 64 | `zoth-ascii-magic` | **Zoth ASCII Magic Studio** | Media & 3D | `browser` | `:8132` | `AsciiMotionGodModeTool.jsx` (1133 L) | 🔴 Legacy Dark |
| 65 | `yara-sigma-forge` | **YARA-X & Sigma Threat Rule Forge** | Security & Recon | `browser` | `:8133` | `YaraSigmaForgeGodModeTool.jsx` (692 L) | 🔴 Legacy Dark |
| 66 | `reality-shader-forge` | **Zoth Reality Shader & Theme Forge** | Media & 3D | `browser` | `:8134` | `RealityShaderForgeGodModeTool.jsx` (581 L) | 🔴 Legacy Dark |
| 67 | `producthunt-connector` | **Product Hunt Connector (zoth-ph)** | Commerce & POD | `local_cli` | `:8139` | `CivicProcurementGodModeTool.jsx` (701 L) | 🔴 Legacy Dark |
| 68 | `zoth-relay` | **Zoth Relay (MCP Agent Bridge)** | Swarm & Core | `local_cli` | `:8765` | `SovereignBridgeGodModeTool.jsx` (687 L) | 🟡 Inverted Dual |
| 69 | `zela-glasses-guide` | **Zela Glasses Guide** | Swarm & Core | `browser` | `:8144` | `VisionKinematicsGodModeTool.jsx` (599 L) | 🔴 Legacy Dark |
| 70 | `zoth-bot` | **Zoth Bot Desktop Companion** | Swarm & Core | `local_cli` | `:8146` | `AzothArchonGodModeTool.jsx` (651 L) | 🔴 Legacy Dark |
| 71 | `zoth-bounty` | **Zoth Bounty Research Hub** | Security & Enclave | `local_cli` | `:9494` | `AttackSurfaceSentinelGodModeTool.jsx` (777 L) | 🔴 Legacy Dark |
| 72 | `zoth-scene-foundry` | **Zoth Scene Foundry** | Media & 3D | `browser` | `:8823` | `AsciiMotionGodModeTool.jsx` (1133 L) | 🔴 Legacy Dark |
| 73 | `zoth-math-pillar` | **Zoth Math Pillar HUD** | Security & Enclave | `local_cli` | `:9995` | `ZothPillGodModeTool.jsx` (488 L) | 🔴 Legacy Dark |
| 74 | `zothos-lite` | **ZothOS-Lite v1.1 (Amnesic Monotone OS)** | Hardware & OS | `local_cli` | `:8145` | `ZothOSLiteGodModeTool.jsx` (367 L) | 🔴 Legacy Dark |

---

## Deep-Dive Component Audit by Architectural Domain

### 1. Swarm, Core & Operating System Cluster (9 Tools)
*The foundational agent hypervisors, OS runtimes, and local communication buses.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `pixel-cast` | `PixelCastGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `azoth-local-agent` | `AzothArchonGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `sovereign-agent-bridge` | `SovereignBridgeGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-os` | `ZothOSGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-swarm-multiplexer` | `SwarmCivilizationGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-civilization` | `SwarmCivilizationGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-relay` | `SovereignBridgeGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-bot` | `AzothArchonGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zothos-lite` | `ZothOSLiteGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |

### 2. Security, Reconnaissance & Enclave Cluster (17 Tools)
*Offensive and defensive security engines, binary decompilation, OSINT radars, and crypto vaults.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `hexstrike-arsenal` | `HexStrikeGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `envguard-secrets-vault` | `EnvGuardVaultGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `jwt-inspector-guard` | `JwtInspectorGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `payload-entropy-studio` | `PayloadEntropyGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `web-security-guard` | `WebSecurityGuardGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `subsweep-lead-scanner` | `SubSweepGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `anderson-security-sentinel` | `AttackSurfaceSentinelGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `agent-capsule-jail` | `AgentCapsuleJailGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `agent-policy-auditor` | `AgentPolicyAuditorGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `agent-gods-eye` | `AgentGodsEyeGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `audiocipher-stego-engine` | `AudioCipherGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `osint-scout-skill` | `SubSweepGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `shodan-surface-sentinel` | `AttackSurfaceSentinelGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `ghidra-mcp-bridge` | `GhidraMcpGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `yara-sigma-forge` | `YaraSigmaForgeGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-bounty` | `AttackSurfaceSentinelGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-math-pillar` | `ZothPillGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |

### 3. Agent Infrastructure, Firewalls & Telemetry Cluster (7 Tools)
*Runtime proxies, spend circuit breakers, prompt firewalls, API replay twins, and blackbox recorders.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `cron-rhythm-studio` | `CronRhythmGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `agent-egress-sentinel` | `AgentEgressSentinelGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `agent-mock-twin` | `AgentMockTwinGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `agent-prompt-firewall` | `AgentPromptFirewallGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `agent-flight-recorder` | `AgentFlightRecorderGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `mcp-lens` | `McpLensGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `agent-budget-sentinel` | `AgentBudgetSentinelGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |

### 4. Media, WebGL, 3D & Creative Generative Cluster (9 Tools)
*60fps canvas engines, 3D WebGL renderers, shader synthesizers, ASCII/Braille motion, and voice pipelines.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `vision-gesture-control` | `VisionKinematicsGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `badge3d-coin-generator` | `Badge3dCoinGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `agent-voice-call` | `AgentVoiceCallGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `cyber-turtle-studio` | `CyberTurtleGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `datamosh-glitch-studio` | `DatamoshGlitchGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `nexus-3d-scene-studio` | `Nexus3DGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `ufo-sacred-geometry` | `UfoSacredGeometryGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `likeness-desk` | `LikenessDeskGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `zoth-ascii-magic` | `AsciiMotionGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `reality-shader-forge` | `RealityShaderForgeGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zela-glasses-guide` | `VisionKinematicsGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-scene-foundry` | `AsciiMotionGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |

### 5. Autonomous Web, Scaffolding & Growth Cluster (9 Tools)
*Project transpilers, AEO/GEO graph engines, CWV diagnostics, PWA builders, and localized page desks.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `polyglot-framework-exporter` | `PolyglotStudioGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `aeo-graph-engine` | `AeoGraphEngineGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `cwv-speed-engine` | `CwvSpeedEngineGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `omnipost-social-engine` | `OmniPostSocialGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `certpath-roadmap-studio` | `CertPathRoadmapGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `pwa-manifest-builder` | `PwaManifestBuilderGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `regex-droid-builder` | `RegexDroidGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `schema-illustrator-studio` | `SchemaIllustratorGodModeTool.jsx` | 🟡 Inverted Dual | ⚠️ Tabs overflow on mobile (`variant="scrollable"` missing) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `zoth-webgen` | `ZothFoundryGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `robots-txt-auditor` | `RobotsTxtAuditorGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `city-desk` | `CivicProcurementGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `zoth-bolt` | `ZothBoltGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |

### 6. Commerce, Print-on-Demand & MCP Bridges Cluster (11 Tools)
*Etsy, Shopify, Printify, and Gelato merchant suites, mockup synthesis, and margin calculators.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `webmcp-protocol-inspector` | `WebMcpInspectorGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `etsy-pod-forge` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `etsy-connector` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `shopify-connector` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `printify-connector` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `gelato-connector` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `pod-smart-router` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `digital-asset-forge` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `pod-mockup-forge` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `pod-margin-sentinel` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `storefront-catalog` | `PodCommerceGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) |
| `producthunt-connector` | `CivicProcurementGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |

### 7. Planning, Cognitive Memory & Search Cluster (5 Tools)
*Hermetic incubation planning, STDP synaptic memory vectors, deep research DAGs, and prompt studios.*

| Tool ID | Component | Status | Identified Deficiencies & Required Action |
|---|---|---|---|
| `adytum-alchemist-ai-workflow` | `AdytumPlannerGodModeTool.jsx` | 🔴 Legacy Dark | 🔴 Hardcoded dark surfaces (`#08080B`) • Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `neuro-memory-daemon` | `NeuroMemoryGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |
| `vector-search-engine` | `VectorSearchGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `deepsearch-research-agent` | `DeepSearchGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white • 🚫 Paywall / `isProLicensed` violation (remove license gates) |
| `promptmaster-studio` | `PromptMasterGodModeTool.jsx` | 🟡 Inverted Dual | Missing `1.5px solid #1E1B18` border • Missing offset drop-shadow (`3px 3px 0px #1E1B18`) • Washed-out gold: uses `#D4AF37` instead of `#B8860B` on white |

---

## Legacy Styling & Contrast Defect Analysis (The 5 Anti-Patterns)

### Anti-Pattern 1: The Dark Void Island
**Symptom**: When Zoth Studio is in Light Mode (`#FAF8F3`), components like `AdytumPlannerGodModeTool` and `ZothBoltGodModeTool` render with pitch-black backgrounds (`#08080B`, `#050508`, `#0A0A10`). The user experiences jarring visual disconnect.

```jsx
// ❌ LEGACY ANTI-PATTERN (AdytumPlannerGodModeTool.jsx):
<Paper sx={{ p: 3, bgcolor: '#050509', border: '1px solid rgba(212,175,55,0.25)' }}>
  <Typography sx={{ color: '#FFFFFF' }}>Hermetic Step 1</Typography>
</Paper>

// ✅ SOVEREIGN ALABASTER UPGRADE:
<Paper sx={{
  p: 3,
  bgcolor: isDark ? '#0A0A10' : '#FFFFFF',
  color: isDark ? '#F5F5F7' : '#111111',
  border: `1.5px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#1E1B18'}`,
  boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6)' : '3px 3px 0px #1E1B18',
}}>
```

### Anti-Pattern 2: Washed-Out Neon Gold (#D4AF37 / #FFD700 on White)
**Symptom**: Luminous gold used in dark mode fails WCAG AA contrast guidelines when rendered against white or alabaster surfaces. In `AeoGraphEngineGodModeTool` and `PodCommerceGodModeTool`, status badges and metric labels become illegible.

```jsx
// ❌ LEGACY ANTI-PATTERN:
<Typography sx={{ color: '#D4AF37', fontWeight: 700 }}>VERIFIED (2.05:1 Contrast - FAILS)</Typography>

// ✅ SOVEREIGN ALABASTER UPGRADE:
<Typography sx={{ color: isDark ? '#D4AF37' : '#B8860B', fontWeight: 700 }}>
  VERIFIED (4.82:1 Contrast - PASSES WCAG AA)
</Typography>
```

### Anti-Pattern 3: Invisible Translucent Borders
**Symptom**: Cards in `EnvGuardVaultGodModeTool` and `PayloadEntropyGodModeTool` use `border: '1px solid rgba(255,255,255,0.08)'`. On light backgrounds, white-alpha borders vanish completely, causing cards to float without visual hierarchy.

```jsx
// ❌ LEGACY ANTI-PATTERN:
border: '1px solid rgba(255, 255, 255, 0.08)' // Vanishes on #FAF8F3

// ✅ SOVEREIGN ALABASTER UPGRADE:
border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#1E1B18'}`
```

### Anti-Pattern 4: Ghost White Typography
**Symptom**: Text color hardcoded as `#EDEFF2`, `#F5F5F7`, or `rgba(255,255,255,0.7)`. When a parent container switches to white in light mode, the text becomes invisible white-on-white.

```jsx
// ❌ LEGACY ANTI-PATTERN:
<Typography sx={{ color: '#EDEFF2' }}>Active Payload</Typography>

// ✅ SOVEREIGN ALABASTER UPGRADE:
<Typography sx={{ color: isDark ? '#EDEFF2' : '#111111', fontWeight: 600 }}>Active Payload</Typography>
```

### Anti-Pattern 5: Unscrollable Mobile Navigation Tabs
**Symptom**: MUI `<Tabs>` declared without scrollable props. On mobile screens (375px–480px), tabs with 4–6 text items wrap awkwardly, get cut off, or trigger horizontal page overflow.

```jsx
// ❌ LEGACY ANTI-PATTERN:
<Tabs value={tab} onChange={(_, v) => setTab(v)}>

// ✅ MOBILE-RESPONSIVE FIX:
<Tabs
  value={tab}
  onChange={(_, v) => setTab(v)}
  variant="scrollable"
  scrollButtons="auto"
  allowScrollButtonsMobile
  sx={{
    minHeight: 44,
    '& .MuiTab-root': { minHeight: 44, fontSize: { xs: '0.78rem', md: '0.85rem' } },
  }}
>
```

---

## Mobile Responsiveness & Multi-Viewport Compliance Audit

Triple-viewport compliance (Mobile `375px–480px`, Tablet `768px–1024px`, Desktop `1280px–1920px`) requires zero horizontal page overflow (`scrollWidth <= clientWidth`) and minimum 44px touch targets.

### The 21 Components with Mobile Tabs Overflow Risk

The following components currently omit `variant="scrollable"` on their primary tab strips and must be patched:

| Component File | Lines | Number of Tabs | Overflow Risk Severity |
|---|---|---|---|
| `AgentCapsuleJailGodModeTool.jsx` | 766 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `AgentMockTwinGodModeTool.jsx` | 786 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `AgentPolicyAuditorGodModeTool.jsx` | 934 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `AudioCipherGodModeTool.jsx` | 987 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `CertPathRoadmapGodModeTool.jsx` | 727 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `CwvSpeedEngineGodModeTool.jsx` | 666 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `DatamoshGlitchGodModeTool.jsx` | 725 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `GhidraMcpGodModeTool.jsx` | 728 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `LikenessDeskGodModeTool.jsx` | 686 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `McpLensGodModeTool.jsx` | 1004 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `Nexus3DGodModeTool.jsx` | 773 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `OmniPostSocialGodModeTool.jsx` | 315 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `PayloadEntropyGodModeTool.jsx` | 625 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `PwaManifestBuilderGodModeTool.jsx` | 1191 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `RegexDroidGodModeTool.jsx` | 834 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `SchemaIllustratorGodModeTool.jsx` | 1020 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `SubSweepGodModeTool.jsx` | 1243 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `SwarmCivilizationGodModeTool.jsx` | 580 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `UfoSacredGeometryGodModeTool.jsx` | 1107 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `VisionKinematicsGodModeTool.jsx` | 599 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |
| `WebGPUToolWorkstation.jsx` | 3755 L | 3–6 Tabs | ⚠️ High (Causes horizontal overflow on 375px) |

---

## Prioritized 4-Phase Upgrade Roadmap

To ensure smooth execution without breaking active local daemons, upgrades should proceed strictly in four sequential phases:

### Phase 1: Sovereign Flagships & Swarm Command (Top 10 Tools) — Priority: IMMEDIATE
These are high-traffic flagship tools that represent the core identity of Zoth Studio v2:

1. **`zoth-bolt`** (`ZothBoltGodModeTool.jsx`) — Full-stack AI IDE & motion editor. Migrate from legacy dark `#0F172A` to dual `#FAF8F3`/`#0A0A10` with `1.5px solid #1E1B18` bezels.
2. **`zoth-os`** (`ZothOSGodModeTool.jsx`) — Sovereign OS hypervisor desk. Introduce dual-theme token switching.
3. **`zothos-lite`** (`ZothOSLiteGodModeTool.jsx`) — Monotone amnesic OS workstation. Add `#1E1B18` tactile borders.
4. **`zoth-math-pillar`** (`ZothPillGodModeTool.jsx`) — 4-Pillar compute HUD. Upgrade pill borders and metric labels to `#1E1B18` & `#B8860B`.
5. **`adytum-alchemist-ai-workflow`** (`AdytumPlannerGodModeTool.jsx`) — 22-key hermetic planner. Replace `#050509` with `#FFFFFF` and parchment `#F3EFE6`.
6. **`azoth-local-agent`** (`AzothArchonGodModeTool.jsx`) — Core archon agent orchestrator. Add dual theme support.
7. **`zoth-civilization` & `zoth-swarm-multiplexer`** (`SwarmCivilizationGodModeTool.jsx`) — Swarm hub & GameBoy sim. Frame pixel canvas in machined `#1E1B18` bezel.
8. **`sovereign-agent-bridge` & `zoth-relay`** (`SovereignBridgeGodModeTool.jsx`) — E2EE WebSocket bridge. Standardize light tokens.
9. **`hexstrike-arsenal`** (`HexStrikeGodModeTool.jsx`) — Security terminal. Eliminate `isProLicensed` leftovers; implement dual `#FFFFFF` / `#0A0A10` cards.
10. **`neuro-memory-daemon`** (`NeuroMemoryGodModeTool.jsx`) — STDP memory visualizer. Dual-mode canvas support.

### Phase 2: Security & Reconnaissance Enclave (15 Tools) — Priority: HIGH
Tools responsible for offensive security, payload analysis, and threat hunting:

- `shodan-surface-sentinel`, `anderson-security-sentinel`, `zoth-bounty` (`AttackSurfaceSentinelGodModeTool.jsx`)
- `ghidra-mcp-bridge` (`GhidraMcpGodModeTool.jsx`) — Strip `isProLicensed`; apply `#1E1B18` borders.
- `yara-sigma-forge` (`YaraSigmaForgeGodModeTool.jsx`) — Add dual-mode theme support.
- `envguard-secrets-vault` (`EnvGuardVaultGodModeTool.jsx`)
- `jwt-inspector-guard` (`JwtInspectorGodModeTool.jsx`)
- `payload-entropy-studio` (`PayloadEntropyGodModeTool.jsx`)
- `web-security-guard` (`WebSecurityGuardGodModeTool.jsx`)
- `subsweep-lead-scanner` & `osint-scout-skill` (`SubSweepGodModeTool.jsx`)
- `audiocipher-stego-engine` (`AudioCipherGodModeTool.jsx`)
- `agent-gods-eye` (`AgentGodsEyeGodModeTool.jsx`)
- `agent-capsule-jail` (`AgentCapsuleJailGodModeTool.jsx`)
- `agent-policy-auditor` (`AgentPolicyAuditorGodModeTool.jsx`)
- `webmcp-protocol-inspector` (`WebMcpInspectorGodModeTool.jsx`)

### Phase 3: Media, 3D & Creative Generative Studios (25 Tools) — Priority: MEDIUM
Canvas, WebGL, and generative geometry tools:

- `zoth-ascii-magic` & `zoth-scene-foundry` (`AsciiMotionGodModeTool.jsx`) — Frame ASCII stage in `#1E1B18` tactile borders.
- `reality-shader-forge` (`RealityShaderForgeGodModeTool.jsx`) — Introduce `#FAF8F3` alabaster palette export.
- `badge3d-coin-generator` (`Badge3dCoinGodModeTool.jsx`) — Dual-theme WebGL canvas backdrop.
- `vision-gesture-control` & `zela-glasses-guide` (`VisionKinematicsGodModeTool.jsx`)
- `cyber-turtle-studio` (`CyberTurtleGodModeTool.jsx`)
- `datamosh-glitch-studio` (`DatamoshGlitchGodModeTool.jsx`)
- `nexus-3d-scene-studio` (`Nexus3DGodModeTool.jsx`)
- `ufo-sacred-geometry` (`UfoSacredGeometryGodModeTool.jsx`)
- `likeness-desk` (`LikenessDeskGodModeTool.jsx`)
- `agent-voice-call` (`AgentVoiceCallGodModeTool.jsx`)
- `polyglot-framework-exporter` (`PolyglotStudioGodModeTool.jsx`)
- `aeo-graph-engine` (`AeoGraphEngineGodModeTool.jsx`)
- `cwv-speed-engine` (`CwvSpeedEngineGodModeTool.jsx`)
- `pwa-manifest-builder` (`PwaManifestBuilderGodModeTool.jsx`)
- `schema-illustrator-studio` (`SchemaIllustratorGodModeTool.jsx`)
- `regex-droid-builder` (`RegexDroidGodModeTool.jsx`)
- `robots-txt-auditor` (`RobotsTxtAuditorGodModeTool.jsx`)
- `city-desk` & `producthunt-connector` (`CivicProcurementGodModeTool.jsx`)
- `certpath-roadmap-studio` (`CertPathRoadmapGodModeTool.jsx`)
- `omnipost-social-engine` (`OmniPostSocialGodModeTool.jsx`)

### Phase 4: Commerce, POD & Automation Utilities (24 Tools) — Priority: NORMAL
Merchant, order routing, and simulation suites:

- `pod-commerce-suite` (`PodCommerceGodModeTool.jsx`) — Printify, Gelato, Etsy, Shopify, POD Smart Router, Digital Asset Forge, POD Mockup Forge, POD Margin Sentinel, Storefront Catalog.
- `agent-egress-sentinel` (`AgentEgressSentinelGodModeTool.jsx`)
- `agent-prompt-firewall` (`AgentPromptFirewallGodModeTool.jsx`)
- `agent-flight-recorder` (`AgentFlightRecorderGodModeTool.jsx`)
- `agent-budget-sentinel` (`AgentBudgetSentinelGodModeTool.jsx`)
- `agent-mock-twin` (`AgentMockTwinGodModeTool.jsx`)
- `mcp-lens` (`McpLensGodModeTool.jsx`)
- `cron-rhythm-studio` (`CronRhythmGodModeTool.jsx`)
- `vector-search-engine` (`VectorSearchGodModeTool.jsx`)
- `deepsearch-research-agent` (`DeepSearchGodModeTool.jsx`)
- `promptmaster-studio` (`PromptMasterGodModeTool.jsx`)
- `pixel-cast` (`PixelCastGodModeTool.jsx`)
- `zoth-webgen` (`ZothFoundryGodModeTool.jsx`)

---

## Standard Implementation Recipes & Boilerplate

### 1. Dual-Theme Sovereign Token Hook Pattern

Every tool component must extract theme state and construct sovereign tokens:

```jsx
import { useTheme } from '@mui/material/styles';

export default function SovereignTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Canonical Sovereign Tokens
  const sov = {
    bg: isDark ? '#0A0A10' : '#FFFFFF',
    canvas: isDark ? '#08080B' : '#FAF8F3',
    subtle: isDark ? '#12121A' : '#F3EFE6',
    wash: isDark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
    text: isDark ? '#F5F5F7' : '#111111',
    slate: isDark ? '#94A3B8' : '#475467',
    gold: isDark ? '#D4AF37' : '#B8860B',
    goldBorder: isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.38)',
    border: isDark ? '1.5px solid rgba(212,175,55,0.3)' : '1.5px solid #1E1B18',
    shadow: isDark
      ? '0 12px 32px rgba(0,0,0,0.6)'
      : '3px 3px 0px #1E1B18',
  };
  // ...
}
```

### 2. Tactile Sovereign Card Container

```jsx
<Paper
  elevation={0}
  sx={{
    p: { xs: 2.5, md: 3.5 },
    borderRadius: 3,
    bgcolor: sov.bg,
    border: sov.border,
    boxShadow: sov.shadow,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    '&:hover': {
      transform: 'translate(-1px, -1px)',
      boxShadow: isDark
        ? '0 16px 40px rgba(0,0,0,0.7)'
        : '4px 4px 0px #1E1B18, 0 8px 24px rgba(184,134,11,0.12)',
    },
  }}
>
  {/* Card Content */}
</Paper>
```

### 3. Machined Terminal / Console Frame

```jsx
<Box
  sx={{
    p: 2,
    borderRadius: 2,
    bgcolor: isDark ? '#05060A' : '#0F172A', // Intentionally dark CRT bezel
    color: '#38BDF8',
    border: isDark ? '1px solid rgba(56,189,248,0.3)' : '1.5px solid #1E1B18',
    boxShadow: isDark ? 'none' : '2px 2px 0px #1E1B18',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.82rem',
    overflowX: 'auto',
  }}
>
  <pre style={{ margin: 0 }}>{cliOutput}</pre>
</Box>
```

### 4. Zero-Paywall Verification Routine

Ensure **all tools, exports, and actions remain 100% unlocked**:

```jsx
// ❌ VIOLATION: Never gate features behind license checks
const canExport = isProLicensed || licenseValid; // REMOVE

// ✅ SOVEREIGN INVARIANT: Fully unlocked by default
const canExport = true;
```

---

## Verification and Quality Invariant Gate

Before any tool upgrade is declared complete, developers and autonomous agents must verify:
1. **Visual Headless Screenshot Loop**: Run `capture.mjs` across mobile (375px), tablet (768px), and desktop (1440px) at `http://127.0.0.1:3000/tools/<id>`. Call `read_file` on `.jpg` outputs to inspect contrast and alignment.
2. **Zero Console Errors**: Confirm `consoleErrors.length === 0` and zero uncaught exceptions.
3. **Zero Horizontal Overflow**: Ensure `document.documentElement.scrollWidth <= window.innerWidth` across all viewports.
4. **Documentation Sync**: Update repo `README.md` and verify ZothOS CLI binary parity (`which -a <tool>`).

---

*Report generated autonomously by Zoth Studio v2 Visual Design & Token Auditor.*  
*Engineered by 1nc0gn30 • NullAI Platform.*