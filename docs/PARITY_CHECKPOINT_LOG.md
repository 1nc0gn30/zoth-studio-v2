# PARITY CHECKPOINT LOG — "The Particular Invariant"

Resume point for the strict one-tool-at-a-time 5-layer sweep of
`zoth-studio-v2/src/data/toolsData.js`. Regenerate with
`python3 docs/tools/atlas_gen.py`.

| | |
|---|---|
| last updated | 2026-11-15 11:54 |
| tools registered | 80 |
| layers automated so far | A, B, C, D, E (evidence below) |
| layers still manual | Layer A interactive-quality review (the only layer left) |

## Protocol

For each tool, in catalog order: inspect the repo workspace and web entry (Layer A), the
`/tools/<id>` route and component (Layer B), the three CLI surfaces + `--help`/`--json` +
`.desktop` launcher + `zoth-os/tests` (Layer C), the README sections (Layer D), then run
`docs/tools/layerE_http.py` (which wraps the canonical `capture.mjs` harness) at
390x844 / 820x1180 / 1440x900 and require `overflowPx===0`,
`imgsMissingAlt===0`, `errors.length===0` (Layer E). Write the checkpoint here before moving on.

**Status of this pass:** Layers A-D were measured programmatically for all 80 tools in one
deterministic sweep, so the matrix below is complete for those four layers. Layer E was
then measured the same way — every tool captured headlessly at three viewports (static, plus
live for the 10 whose declared port was already listening), and **77/80** came back clean.
Treat `.` under B/C/D as a
confirmed gap, `^A^` as partial, and re-verify any Layer C row if a concurrent writer
has touched that tool since the timestamp above.

## Checkpoints

| # | tool id | category | ver | port | exec | A | B | C | D | E |
|---|---------|----------|-----|------|------|---|---|---|---|---|
| 1 | `pixel-cast` | Hardware & OS | 1.0.0 | `:8148` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 2 | `adytum-alchemist-ai-workflow` | Planning | 1.0.0 | `:8135` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 3 | `azoth-local-agent` | Swarm & Core | 3.0.0 | `:8136` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 4 | `sovereign-agent-bridge` | Swarm & Core | 3.2.0 | `:8102` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 5 | `neuro-memory-daemon` | Memory & Brain | 2.8.0 | `:8094` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 6 | `zoth-os` | Swarm & Core | 3.4.0 | `:8137` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 7 | `vector-search-engine` | Swarm & Core | 2.5.0 | `:8121` | browser | `A` | `B` | `C` | `D` | `E` |
| 8 | `deepsearch-research-agent` | AI & Knowledge | 2.5.0 | `:8122` | browser | `A` | `B` | `C` | `D` | `E` |
| 9 | `promptmaster-studio` | AI & Knowledge | 3.2.0 | `:8123` | browser | `A` | `B` | `C` | `D` | `E` |
| 10 | `hexstrike-arsenal` | Security & Recon | 3.1.0 | `:8138` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 11 | `envguard-secrets-vault` | Security & Recon | 2.5.0 | `:8088` | browser | `A` | `B` | `C` | `D` | `E` |
| 12 | `jwt-inspector-guard` | Security & Recon | 2.6.0 | `:8124` | browser | `A` | `B` | `C` | `D` | `E` |
| 13 | `payload-entropy-studio` | Security & Recon | 2.5.0 | `:8080` | browser | `A` | `B` | `C` | `D` | `E` |
| 14 | `web-security-guard` | Security & Recon | 2.5.0 | `:8125` | browser | `A` | `B` | `C` | `D` | `E` |
| 15 | `polyglot-framework-exporter` | Autonomous Web | 2.5.0 | `:8126` | browser | `A` | `B` | `C` | `D` | `E` |
| 16 | `aeo-graph-engine` | Autonomous Web | 1.4.0 | `:8127` | browser | `A` | `B` | `C` | `D` | `E` |
| 17 | `cwv-speed-engine` | Autonomous Web | 2.5.0 | `:8128` | browser | `A` | `B` | `C` | `D` | `E` |
| 18 | `vision-gesture-control` | Media & 3D | 2.5.0 | `:8089` | browser | `A` | `B` | `C` | `D` | `E` |
| 19 | `subsweep-lead-scanner` | Security & Recon | 2.5.0 | `:8090` | browser | `A` | `B` | `C` | `D` | `E` |
| 20 | `omnipost-social-engine` | Automation | 2.5.0 | `:8091` | browser | `A` | `B` | `C` | `D` | `E` |
| 21 | `cron-rhythm-studio` | Automation | 2.5.0 | `:5174` | browser | `A` | `B` | `C` | `D` | `E` |
| 22 | `certpath-roadmap-studio` | Automation | 2.5.0 | `:8093` | browser | `A` | `B` | `C` | `D` | `E` |
| 23 | `pwa-manifest-builder` | Autonomous Web | 2.5.0 | `:8100` | browser | `A` | `B` | `C` | `D` | `E` |
| 24 | `regex-droid-builder` | Automation | 2.5.0 | `:8101` | browser | `A` | `B` | `C` | `D` | `E` |
| 25 | `schema-illustrator-studio` | Autonomous Web | 2.5.0 | `:8099` | browser | `A` | `B` | `C` | `D` | `E` |
| 26 | `zoth-webgen` | Autonomous Web | 2.5.0 | `:8092` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 27 | `zoth-swarm-multiplexer` | Swarm & Core | 2.5.0 | `:8141` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 28 | `webmcp-protocol-inspector` | AI & Knowledge | 1.0.0 | `:8142` | webgpu | `A` | `B` | `C` | `D` | `E` |
| 29 | `anderson-security-sentinel` | Security & OpSec | 2.5.0 | `:8103` | browser | `A` | `B` | `C` | `D` | `E` |
| 30 | `badge3d-coin-generator` | Media & 3D | 2.5.0 | `:8084` | browser | `A` | `B` | `C` | `D` | `E` |
| 31 | `robots-txt-auditor` | Growth & SEO | 2.5.0 | `:8086` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 32 | `city-desk` | Growth & SEO | 2.5.0 | `:8087` | browser | `A` | `B` | `C` | `D` | `E` |
| 33 | `agent-egress-sentinel` | Security & Network | 2.5.0 | `:8095` | browser | `A` | `B` | `C` | `D` | `E` |
| 34 | `agent-mock-twin` | Simulation & Testing | 2.5.0 | `:8097` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 35 | `agent-prompt-firewall` | Security & Network | 2.5.0 | `:8098` | browser | `A` | `B` | `C` | `D` | `E` |
| 36 | `wcag-contrast-guard` | Accessibility & UI | 2.5.0 | `:8150` | browser | `A` | `B` | `C` | `D` | `E` |
| 37 | `agent-flight-recorder` | Forensics & Telemetry | 2.5.0 | `:8104` | browser | `A` | `B` | `C` | `D` | `E` |
| 38 | `agent-capsule-jail` | Security & Enclave | 2.5.0 | `:8105` | browser | `A` | `B` | `C` | `D` | `E` |
| 39 | `agent-policy-auditor` | Security & Enclave | 2.5.0 | `:8106` | browser | `A` | `B` | `C` | `D` | `E` |
| 40 | `etsy-pod-forge` | Commerce & POD | 2.5.0 | `:8107` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 41 | `etsy-connector` | Commerce & MCP | 2.5.0 | `:8108` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 42 | `mcp-lens` | Simulation & Testing | 2.5.0 | `:8109` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 43 | `agent-budget-sentinel` | Security & Network | 2.5.0 | `:8110` | browser | `A` | `B` | `C` | `D` | `E` |
| 44 | `agent-gods-eye` | Security & Recon | 2.5.0 | `:8112` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 45 | `shopify-connector` | Commerce & MCP | 2.5.0 | `:8113` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 46 | `printify-connector` | Commerce & MCP | 2.5.0 | `:8115` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 47 | `gelato-connector` | Commerce & MCP | 2.5.0 | `:8116` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 48 | `agent-voice-call` | Voice & Real-Time | 2.5.0 | `:8114` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 49 | `pod-smart-router` | Commerce & MCP | 2.5.0 | `:8117` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 50 | `digital-asset-forge` | Commerce & MCP | 2.5.0 | `:8118` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 51 | `pod-mockup-forge` | Commerce & MCP | 2.5.0 | `:8119` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 52 | `pod-margin-sentinel` | Commerce & MCP | 2.5.0 | `:8120` | browser | `A` | `B` | ^C^ | `D` | `E` |
| 53 | `audiocipher-stego-engine` | Security & OpSec | 2.5.0 | `:8096` | browser | `A` | `B` | `C` | `D` | `E` |
| 54 | `cyber-turtle-studio` | Media & 3D | 2.5.0 | `:8129` | browser | `A` | `B` | `C` | `D` | `E` |
| 55 | `datamosh-glitch-studio` | Media & 3D | 2.5.0 | `:8081` | browser | `A` | `B` | `C` | `D` | `E` |
| 56 | `nexus-3d-scene-studio` | Media & 3D | 2.5.0 | `:8082` | browser | `A` | `B` | `C` | `D` | `E` |
| 57 | `ufo-sacred-geometry` | Media & 3D | 2.5.0 | `:8083` | browser | `A` | `B` | `C` | `D` | `E` |
| 58 | `likeness-desk` | Voice & Real-Time | 2.5.0 | `:9395` | local_cli | `A` | `B` | `C` | `D` | . |
| 59 | `osint-scout-skill` | Security & Recon | 2.5.0 | `:8085` | browser | `A` | `B` | `C` | `D` | `E` |
| 60 | `zoth-osint` | Security & Recon | 4.0.0 | `:8149` | hybrid | `A` | `B` | `C` | `D` | `E` |
| 61 | `zoth-bolt` | Autonomous Web | 3.5.0 | `:5173` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 62 | `zoth-civilization` | Swarm & Core | 3.0.0 | `:9393` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 63 | `storefront-catalog` | Commerce & POD | 2.5.0 | `:8143` | local_cli | `A` | `B` | ^C^ | `D` | `E` |
| 64 | `shodan-surface-sentinel` | Security & Enclave | 3.5.0 | `:8130` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 65 | `ghidra-mcp-bridge` | Security & Enclave | 3.5.0 | `:8131` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 66 | `zoth-ascii-magic` | Media & 3D | 2.7.0 | `:8132` | browser | `A` | `B` | `C` | `D` | `E` |
| 67 | `yara-sigma-forge` | Security & Recon | 3.4.0 | `:8133` | browser | `A` | `B` | `C` | `D` | `E` |
| 68 | `reality-shader-forge` | Media & 3D | 3.4.0 | `:8134` | browser | `A` | `B` | `C` | `D` | `E` |
| 69 | `producthunt-connector` | Commerce & POD | 1.1.0 | `:8139` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 70 | `zoth-relay` | Swarm & Core | 0.5.0 | `:8765` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 71 | `zela-glasses-guide` | Swarm & Core | 0.5.0 | `:8144` | browser | `A` | `B` | `C` | `D` | `E` |
| 72 | `zoth-bot` | Swarm & Core | 1.0.0 | `:8146` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 73 | `zoth-bounty` | Security & Enclave | 1.0.0 | `:9494` | local_cli | `A` | `B` | `C` | `D` | . |
| 74 | `zoth-scene-foundry` | Media & 3D | 1.0.0 | `:8823` | browser | `A` | `B` | `C` | `D` | `E` |
| 75 | `zoth-math-pillar` | Security & Enclave | 2.0.0 | `:9995` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 76 | `zothos-lite` | Hardware & OS | 1.2.0 | `:8145` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 77 | `zothnet` | Swarm & Core | 1.2.0 | `:9900` | local_cli | . | `B` | `C` | `D` | . |
| 78 | `creatorplaybooks` | Education & Growth | 1.0.0 | `:5185` | browser | `A` | `B` | `C` | `D` | `E` |
| 79 | `zoth-obsidian-tracker` | Swarm & Core | 1.2.0 | `:8151` | local_cli | ^A^ | `B` | `C` | `D` | `E` |
| 80 | `zoth-x-connector` | Swarm & Core | 1.0.0 | `:8152` | local_cli | `A` | `B` | `C` | `D` | `E` |

## Confirmed gaps carried into Phase 2

- `[B]` no resolvable God-Mode component: none
- `[D]` no README: none
- `[A]` no web entry: `zothnet`
- `[A]` SEO/AEO incomplete (0): none
- `[C]` alias filenames drifting between surfaces (18): `bounty-hub`, `reality-forge`, `robots-txt`, `robots-txt-auditor`, `scene-foundry`, `sigma-forge`, `theme-forge`, `yara-forge`, `zela`, `zela-guide`, `zoth-capsule-jail`, `zoth-egress-sentinel`, `zoth-flight-recorder`, `zoth-foundry`, `zoth-policy-auditor`, `zoth-prompt-firewall`, `zoth-theme-forge`, `zoth-yara-forge`

## Next work

Layers B-E are swept fleet-wide and committed; **Layer A (interactive quality) is the only
layer without automated evidence.** Resume there, most-broken first: `pixel-cast` — the one tool
failing two layers (no God-Mode component) — then the 3 tools whose live API panes stay
empty (`likeness-desk, zoth-bounty, zothnet`), whose own daemons must be up before their panes can render.

