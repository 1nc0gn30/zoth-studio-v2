# PARITY CHECKPOINT LOG — "The Particular Invariant"

Resume point for the strict one-tool-at-a-time 5-layer sweep of
`zoth-studio-v2/src/data/toolsData.js`. Regenerate with
`python3 docs/tools/atlas_gen.py`.

| | |
|---|---|
| last updated | 2026-11-15 08:53 |
| tools registered | 80 |
| layers automated so far | A, B, C, D (evidence below) — Layer A gaps now **0/80** after Phase 2 wave 1 |
| layers still manual | E (visual), Layer A interactive-quality review, `[D]` README for `zoth-math-pillar` |

## Protocol

For each tool, in catalog order: inspect the repo workspace and web entry (Layer A), the
`/tools/<id>` route and component (Layer B), the three CLI surfaces + `--help`/`--json` +
`.desktop` launcher + `zoth-os/tests` (Layer C), the README sections (Layer D), then run
`capture.mjs` at 390x844 / 820x1180 / 1440x900 and require `overflowPx===0`,
`imgsMissingAlt===0`, `errors.length===0` (Layer E). Write the checkpoint here before moving on.

**Status of this pass:** Layers A-D were measured programmatically for all 80 tools in one
deterministic sweep, so the matrix below is complete for those four layers. Layer E is
unrun (`E` = `.` throughout) and is the body of Phase 2. Treat `.` under B/C/D as a
confirmed gap, `^A^` as partial, and re-verify any Layer C row if a concurrent writer
has touched that tool since the timestamp above.

## Checkpoints

| # | tool id | category | ver | port | exec | A | B | C | D | E |
|---|---------|----------|-----|------|------|---|---|---|---|---|
| 1 | `pixel-cast` | Hardware & OS | 1.0.0 | `:8148` | local_cli | `A` | `B` | ^C^ | `D` | . |
| 2 | `adytum-alchemist-ai-workflow` | Planning | 1.0.0 | `:8135` | local_cli | `A` | `B` | `C` | `D` | . |
| 3 | `azoth-local-agent` | Swarm & Core | 3.0.0 | `:8136` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 4 | `sovereign-agent-bridge` | Swarm & Core | 3.2.0 | `:8102` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 5 | `neuro-memory-daemon` | Memory & Brain | 2.8.0 | `:8094` | local_cli | `A` | `B` | `C` | `D` | . |
| 6 | `zoth-os` | Swarm & Core | 3.4.0 | `:8137` | local_cli | `A` | `B` | `C` | `D` | . |
| 7 | `vector-search-engine` | Swarm & Core | 2.5.0 | `:8121` | browser | `A` | `B` | `C` | `D` | . |
| 8 | `deepsearch-research-agent` | AI & Knowledge | 2.5.0 | `:8122` | browser | `A` | `B` | `C` | `D` | . |
| 9 | `promptmaster-studio` | AI & Knowledge | 3.2.0 | `:8123` | browser | `A` | `B` | `C` | `D` | . |
| 10 | `hexstrike-arsenal` | Security & Recon | 3.1.0 | `:8138` | local_cli | `A` | `B` | `C` | `D` | . |
| 11 | `envguard-secrets-vault` | Security & Recon | 2.5.0 | `:8088` | browser | `A` | `B` | `C` | `D` | . |
| 12 | `jwt-inspector-guard` | Security & Recon | 2.6.0 | `:8124` | browser | `A` | `B` | `C` | `D` | . |
| 13 | `payload-entropy-studio` | Security & Recon | 2.5.0 | `:8080` | browser | `A` | `B` | `C` | `D` | . |
| 14 | `web-security-guard` | Security & Recon | 2.5.0 | `:8125` | browser | `A` | `B` | `C` | `D` | . |
| 15 | `polyglot-framework-exporter` | Autonomous Web | 2.5.0 | `:8126` | browser | `A` | `B` | `C` | `D` | . |
| 16 | `aeo-graph-engine` | Autonomous Web | 1.4.0 | `:8127` | browser | `A` | `B` | `C` | `D` | . |
| 17 | `cwv-speed-engine` | Autonomous Web | 2.5.0 | `:8128` | browser | `A` | `B` | `C` | `D` | . |
| 18 | `vision-gesture-control` | Media & 3D | 2.5.0 | `:8089` | browser | `A` | `B` | `C` | `D` | . |
| 19 | `subsweep-lead-scanner` | Security & Recon | 2.5.0 | `:8090` | browser | `A` | `B` | `C` | `D` | . |
| 20 | `omnipost-social-engine` | Automation | 2.5.0 | `:8091` | browser | `A` | `B` | `C` | `D` | . |
| 21 | `cron-rhythm-studio` | Automation | 2.5.0 | `:5174` | browser | `A` | `B` | `C` | `D` | . |
| 22 | `certpath-roadmap-studio` | Automation | 2.5.0 | `:8093` | browser | `A` | `B` | `C` | `D` | . |
| 23 | `pwa-manifest-builder` | Autonomous Web | 2.5.0 | `:8100` | browser | `A` | `B` | `C` | `D` | . |
| 24 | `regex-droid-builder` | Automation | 2.5.0 | `:8101` | browser | `A` | `B` | `C` | `D` | . |
| 25 | `schema-illustrator-studio` | Autonomous Web | 2.5.0 | `:8099` | browser | `A` | `B` | `C` | `D` | . |
| 26 | `zoth-webgen` | Autonomous Web | 2.5.0 | `:8092` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 27 | `zoth-swarm-multiplexer` | Swarm & Core | 2.5.0 | `:8141` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 28 | `webmcp-protocol-inspector` | AI & Knowledge | 1.0.0 | `:8142` | webgpu | `A` | `B` | `C` | `D` | . |
| 29 | `anderson-security-sentinel` | Security & OpSec | 2.5.0 | `:8103` | browser | `A` | `B` | `C` | `D` | . |
| 30 | `badge3d-coin-generator` | Media & 3D | 2.5.0 | `:8084` | browser | `A` | `B` | `C` | `D` | . |
| 31 | `robots-txt-auditor` | Growth & SEO | 2.5.0 | `:8086` | browser | `A` | `B` | `C` | `D` | . |
| 32 | `city-desk` | Growth & SEO | 2.5.0 | `:8087` | browser | ^A^ | `B` | `C` | `D` | . |
| 33 | `agent-egress-sentinel` | Security & Network | 2.5.0 | `:8095` | browser | `A` | `B` | `C` | `D` | . |
| 34 | `agent-mock-twin` | Simulation & Testing | 2.5.0 | `:8097` | browser | `A` | `B` | `C` | `D` | . |
| 35 | `agent-prompt-firewall` | Security & Network | 2.5.0 | `:8098` | browser | `A` | `B` | `C` | `D` | . |
| 36 | `wcag-contrast-guard` | Accessibility & UI | 2.5.0 | `:8150` | browser | `A` | . | `C` | `D` | . |
| 37 | `agent-flight-recorder` | Forensics & Telemetry | 2.5.0 | `:8104` | browser | `A` | `B` | `C` | `D` | . |
| 38 | `agent-capsule-jail` | Security & Enclave | 2.5.0 | `:8105` | browser | `A` | `B` | `C` | `D` | . |
| 39 | `agent-policy-auditor` | Security & Enclave | 2.5.0 | `:8106` | browser | `A` | `B` | `C` | `D` | . |
| 40 | `etsy-pod-forge` | Commerce & POD | 2.5.0 | `:8107` | browser | `A` | `B` | `C` | `D` | . |
| 41 | `etsy-connector` | Commerce & MCP | 2.5.0 | `:8108` | browser | `A` | `B` | `C` | `D` | . |
| 42 | `mcp-lens` | Simulation & Testing | 2.5.0 | `:8109` | browser | `A` | `B` | `C` | `D` | . |
| 43 | `agent-budget-sentinel` | Security & Network | 2.5.0 | `:8110` | browser | `A` | `B` | `C` | `D` | . |
| 44 | `agent-gods-eye` | Security & Recon | 2.5.0 | `:8112` | browser | `A` | `B` | `C` | `D` | . |
| 45 | `shopify-connector` | Commerce & MCP | 2.5.0 | `:8113` | browser | `A` | `B` | `C` | `D` | . |
| 46 | `printify-connector` | Commerce & MCP | 2.5.0 | `:8115` | browser | `A` | `B` | `C` | `D` | . |
| 47 | `gelato-connector` | Commerce & MCP | 2.5.0 | `:8116` | browser | `A` | `B` | `C` | `D` | . |
| 48 | `agent-voice-call` | Voice & Real-Time | 2.5.0 | `:8114` | browser | `A` | `B` | `C` | `D` | . |
| 49 | `pod-smart-router` | Commerce & MCP | 2.5.0 | `:8117` | browser | `A` | `B` | `C` | `D` | . |
| 50 | `digital-asset-forge` | Commerce & MCP | 2.5.0 | `:8118` | browser | `A` | `B` | `C` | `D` | . |
| 51 | `pod-mockup-forge` | Commerce & MCP | 2.5.0 | `:8119` | browser | `A` | `B` | `C` | `D` | . |
| 52 | `pod-margin-sentinel` | Commerce & MCP | 2.5.0 | `:8120` | browser | `A` | `B` | `C` | `D` | . |
| 53 | `audiocipher-stego-engine` | Security & OpSec | 2.5.0 | `:8096` | browser | `A` | `B` | `C` | `D` | . |
| 54 | `cyber-turtle-studio` | Media & 3D | 2.5.0 | `:8129` | browser | `A` | `B` | `C` | `D` | . |
| 55 | `datamosh-glitch-studio` | Media & 3D | 2.5.0 | `:8081` | browser | `A` | `B` | `C` | `D` | . |
| 56 | `nexus-3d-scene-studio` | Media & 3D | 2.5.0 | `:8082` | browser | `A` | `B` | `C` | `D` | . |
| 57 | `ufo-sacred-geometry` | Media & 3D | 2.5.0 | `:8083` | browser | `A` | `B` | `C` | `D` | . |
| 58 | `likeness-desk` | Voice & Real-Time | 2.5.0 | `:9395` | local_cli | `A` | `B` | `C` | `D` | . |
| 59 | `osint-scout-skill` | Security & Recon | 2.5.0 | `:8085` | browser | `A` | `B` | `C` | `D` | . |
| 60 | `zoth-osint` | Security & Recon | 4.0.0 | `:8149` | hybrid | `A` | `B` | ^C^ | `D` | . |
| 61 | `zoth-bolt` | Autonomous Web | 3.5.0 | `:5173` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 62 | `zoth-civilization` | Swarm & Core | 3.0.0 | `:9393` | local_cli | `A` | `B` | `C` | `D` | . |
| 63 | `storefront-catalog` | Commerce & POD | 2.5.0 | `:8143` | local_cli | `A` | `B` | `C` | `D` | . |
| 64 | `shodan-surface-sentinel` | Security & Enclave | 3.5.0 | `:8130` | local_cli | `A` | `B` | `C` | `D` | . |
| 65 | `ghidra-mcp-bridge` | Security & Enclave | 3.5.0 | `:8131` | local_cli | `A` | `B` | `C` | `D` | . |
| 66 | `zoth-ascii-magic` | Media & 3D | 2.7.0 | `:8132` | browser | `A` | `B` | `C` | `D` | . |
| 67 | `yara-sigma-forge` | Security & Recon | 3.4.0 | `:8133` | browser | `A` | `B` | `C` | `D` | . |
| 68 | `reality-shader-forge` | Media & 3D | 3.4.0 | `:8134` | browser | `A` | `B` | `C` | `D` | . |
| 69 | `producthunt-connector` | Commerce & POD | 1.1.0 | `:8139` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 70 | `zoth-relay` | Swarm & Core | 0.5.0 | `:8765` | local_cli | `A` | `B` | `C` | `D` | . |
| 71 | `zela-glasses-guide` | Swarm & Core | 0.5.0 | `:8144` | browser | `A` | `B` | `C` | `D` | . |
| 72 | `zoth-bot` | Swarm & Core | 1.0.0 | `:8146` | local_cli | `A` | `B` | `C` | `D` | . |
| 73 | `zoth-bounty` | Security & Enclave | 1.0.0 | `:9494` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 74 | `zoth-scene-foundry` | Media & 3D | 1.0.0 | `:8823` | browser | `A` | `B` | `C` | `D` | . |
| 75 | `zoth-math-pillar` | Security & Enclave | 2.0.0 | `:9995` | local_cli | ^A^ | `B` | `C` | . | . |
| 76 | `zothos-lite` | Hardware & OS | 1.2.0 | `:8145` | local_cli | `A` | `B` | ^C^ | `D` | . |
| 77 | `zothnet` | Swarm & Core | 1.2.0 | `:9900` | local_cli | . | `B` | ^C^ | `D` | . |
| 78 | `creatorplaybooks` | Education & Growth | 1.0.0 | `:5185` | browser | `A` | `B` | `C` | `D` | . |
| 79 | `zoth-obsidian-tracker` | Swarm & Core | 1.2.0 | `:8151` | local_cli | ^A^ | `B` | `C` | `D` | . |
| 80 | `zoth-x-connector` | Swarm & Core | 1.0.0 | `:8152` | local_cli | `A` | `B` | `C` | `D` | . |

## Phase 2 — wave 1: Layer A remediation (verified)

Every patch below is backed up under `/home/zoth/.hermes/cache/scratch/backups-24h/` and
re-probed afterwards with `python3 docs/tools/parity_probe.py --all --layer A`.

| tool(s) | defect found | fix applied | evidence after |
|---|---|---|---|
| 9 entries: `azoth-local-agent`, `sovereign-agent-bridge`, `zoth-webgen`, `zoth-swarm-multiplexer`, `city-desk`, `zoth-bolt`, `producthunt-connector`, `zoth-bounty`, `zoth-math-pillar` | entry doc had no `application/ld+json` graph and thin OpenGraph | `docs/tools/seo_alchemist.py` — injects fleet-standard OG/Twitter + schema.org `@graph` (`WebApplication` + `FAQPage`) built from the tool's own `toolsData.js` record + README; refuses to run if a graph already exists | `atlas_gen.web_entry()` reports `ld=1 og=5` for all 9 |
| 19 entries: `adytum-alchemist-ai-workflow`, `zoth-os`, `promptmaster-studio`, `agent-capsule-jail`, `agent-policy-auditor`, `mcp-lens`, `agent-budget-sentinel`, `agent-gods-eye`, `shopify-connector`, `printify-connector`, `gelato-connector`, `pod-smart-router`, `digital-asset-forge`, `zoth-relay`, `zela-glasses-guide`, `zoth-bot`, `zoth-scene-foundry`, `zothos-lite`, `zoth-x-connector` | valid JSON-LD present but the software entity declared `"@type": "SoftwareApplication"` only | `docs/tools/ldtype_upgrade.py` — widens `@type` to `["WebApplication", "SoftwareApplication"]` **in place** inside the existing block (no second block injected, FAQPage node untouched, block re-parsed before write) | fleet re-probe: `layerA_gaps = 0 / 80` |
| `wcag-contrast-guard` | support CTA was `<button component="a" onclick="window.open(...)">` — not a navigable link | converted to a real anchor `<a class="btn btn-gold" href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X" target="_blank" rel="noopener noreferrer" title="Support open-access tools">☕ Buy Us a Coffee</a>` | `stripe_anchor=1` in entry doc |
| `zoth-math-pillar` | footer carried no Stripe/Solana support block | added `.footer-support` span: real Stripe anchor + full Solana address (`user-select: all`, dotted underline) | `stripe_anchor=1`, `sol_full=1`; `capture.mjs` clean at 390/820/1440 |
| `zothnet` app templates `pkg/apps/templates/zoth_drive.html`, `zoth_radio.html` | Solana tip rendered truncated (`GG2e..xdXoK`) — not a usable address; anchor missing `rel` | full address + `title` + `user-select:all`; `rel="noopener noreferrer"` on the Stripe anchor | `sol_full=2` per template; `go build ./...` exit 0 |

Scanner correctness repairs (these fixed the *measurement*, not the products):

- `toolsData.js` `repo` is a GitHub `owner/name` slug, **not** a filesystem path →
  `local_repo_dir(t)` tries the slug path, then `ROOT/<id>`, then `ROOT/<basename>`.
- `find_entry()` now prefers the document the repo actually serves or embeds
  (`_referenced_names()` matches `//go:embed`, `res.sendFile`, `open("...html")`), then the
  largest document. Before this fix `zothnet` was flagged "no web entry document" while its
  real served UI — `pkg/web/dashboard.html`, 307 KB, `ld=1 og=6 tw=6`, 2 Stripe anchors and
  the full Solana address — was fully compliant. **That flag is withdrawn as a scanner artifact.**
- An SPA that renders the tip block from `src/` (`_stripe_in_sources()`) is no longer counted
  as missing a support link, and `<img>` alt counting now ignores HTML/JS comments.

## Confirmed gaps carried into Phase 2

- `[B]` no resolvable God-Mode component: `wcag-contrast-guard`
- `[D]` no README: `zoth-math-pillar`
- `[C]` alias filenames drifting between surfaces (16): `bounty-hub`, `scene-foundry`, `sigma-forge`, `theme-forge`, `yara-forge`, `zela`, `zela-guide`, `zoth-capsule-jail`, `zoth-egress-sentinel`, `zoth-flight-recorder`, `zoth-foundry`, `zoth-mock-twin`, `zoth-policy-auditor`, `zoth-prompt-firewall`, `zoth-theme-forge`, `zoth-yara-forge`
- `[E]` never visually verified: all 80
- ~~`[A]` no web entry: `zothnet`~~ — withdrawn, scanner artifact (see above)
- ~~`[A]` incomplete SEO/AEO (9)~~ — resolved (wave 1)
- ~~`[A]` `"SoftwareApplication"` without `WebApplication` (19)~~ — resolved (wave 1)

## Next tool

Resume the manual Layer E sweep at **`pixel-cast`** (catalog index 1), then continue in
catalog order; fold the `[D]` README gap for `zoth-math-pillar` and the `[B]` component gap for
`wcag-contrast-guard` into the queue where those tools come up.

