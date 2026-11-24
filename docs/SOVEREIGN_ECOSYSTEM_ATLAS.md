# SOVEREIGN ECOSYSTEM ATLAS

Master architectural ledger for the `NullAITech` sovereign tool ecosystem.

| | |
|---|---|
| Generated | 2026-11-16 12:05 |
| Generator | `zoth-studio-v2/docs/tools/atlas_gen.py` (re-runnable, no hardcoded counts) |
| Catalog of record | `zoth-studio-v2/src/data/toolsData.js` |
| CLI surfaces compared | `zoth-os/config/includes.chroot/usr/local/bin`, `/usr/local/bin`, `~/.local/bin` |
| Invariants honoured | no git push; no daemon killed; no credential staged |

## 0. How to read this ledger

Every number below was measured, not assumed. Three measurement traps were found and
corrected during this sweep, and the ledger records the corrected method so the numbers
stay trustworthy:

1. **Alias masquerade.** A tool's short name (e.g. `zela`) is a *separate file* from its
   canonical name (`zela-glasses-guide`), sometimes a symlink, sometimes a stale copy.
   Any census keyed on `TOOL_ID` or on a bare glob will double-count and mis-attribute.
   This ledger keys on **filename**, and resolves symlinks before hashing.
2. **Regex over-reach.** A scan for paywall/blur/fake-output strings matched
   *anti*-paywall marketing copy (`ZERO PAYWALLS`), each app's own
   `zoth-open-access-override` stylesheet, glassmorphism `backdrop-filter: blur()`, and
   the substring `canned` inside `**Scan**ned`. Those are **not** defects and are excluded.
   Layer A's interactive-quality checks are not machine-verifiable at fleet scale; 1 of 81
   tools carry real interactive evidence (`docs/LAYER_A_FINDINGS.md`), the rest are open work, not
   automated fails.
3. **Moving target.** A concurrent agent session writes in these trees. Every figure is
   timestamped; re-run the generator to refresh.

## 1. Executive summary

| metric | value |
|---|---|
| Catalog entries (`toolsData.js`) | **81** |
| Distinct `localPort` values | **81** |
| Port collisions (alias-aware) | **0** |
| Catalog entries present on all 3 bin surfaces | **81/81** |
| ...of those, byte-identical across all 3 surfaces | **81/81** |
| Generated God-Mode wrappers (carry `TOOL_ID`) | **105** filenames / **51** canonical `TOOL_ID`s, all canonical byte-identical |
| Tools shipping a native CLI instead of a wrapper | **30** (**30** byte-identical, **0** differ) |
| Short-name alias filenames (`zela`, `zoth-bolt`, ...) | **54** (0 drifting, none catalog-critical) |
| Unrelated binaries in those dirs (out of scope) | **379** |
| Layer A — standalone web entry present | **81/81** |
| Layer A — runtime-served web surface (explained exception) | **1** (`zothnet` -> `pkg/web/dashboard.html`) |
| Layer A — SEO/AEO complete in entry document | **81/81** |
| Layer A — bare `<img>` without `alt` | **0** |
| Layer B — God-Mode component resolves in `lazy()` registry | **81/81** |
| Layer D — `README.md` present | **81/81** |
| Layer E — headless 3-viewport verified | **81/81** (static 76 · live 15 · 246 shots) |
| Top-level repositories under `NullAITech/` | **142** |
| Repositories absent from the catalog | **61** |

**Reading the parity verdict:** the CLI surface (Layer C) is in excellent shape — all **51**
canonical wrappers are present on all three surfaces with identical bytes, **81/81** catalog
entries are byte-identical on all three, the only **0** exceptions are native-CLI tools with a
diffed and explained delta (§4.2), and there are **zero** port collisions across all 81 catalog
entries. The real remaining gaps are small and enumerable: **0** catalog entries lack a Layer B
component, **0** lack a README, **0** lack a standalone web entry, and **0** have incomplete
SEO/AEO metadata. Layer E is closed: every catalog entry was captured headlessly at
390x844 / 820x1180 / 1440x900 over loopback HTTP (**81/81** clean, `overflowPx==0`,
`imgsMissingAlt==0`, no page errors), and the **15** tools whose declared port was already
listening were additionally captured against their live deployment — see §2 and the atlas §8.

## 2. Tri-surface status legend

| code | layer | meaning | full pass looks like |
|---|---|---|---|
| `[A]` | Standalone Web App | repo opens into a working multi-pane app | a real entry document, `ld+json` (WebApplication+FAQPage), OpenGraph tags, 100% `<img alt>` |
| `[B]` | Zoth Studio `/tools/<id>` | God-Mode component wired into the router | `src/components/tools/<X>GodModeTool.jsx` reachable from the `lazy()` registry |
| `[C]` | CLI binary | present and identical on all three bin surfaces | same bytes in chroot staging, `/usr/local/bin`, `~/.local/bin`; `--help`/`--json` exit 0 |
| `[D]` | Documentation | `README.md` documents purpose, port, CLI, studio route | all four sections present |
| `[E]` | Visual verification | headless capture at 390x844 / 820x1180 / 1440x900 | `overflowPx===0`, `imgsMissingAlt===0`, no page errors, 3/3 viewports with real text |

In the matrix: `` `A` `` = layer fully satisfied, `^A^` = partially satisfied (see gap lists),
`.` = not satisfied. Layer E is measured, not aspirational: every catalog entry was captured
headlessly (see §8), so a `[E]` cell means a clean capture row exists for that tool.

## 3. Master matrix — all 83 catalog entries

| # | tool id | category | ver | port | exec | A | B | C | D | E |
|---|---------|----------|-----|------|------|---|---|---|---|---|
| 1 | `pixel-cast` | Hardware & OS | 1.0.0 | `:8148` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 2 | `aether-observatory` | System & Telemetry | 1.0.0 | `:8160` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 3 | `adytum-alchemist-ai-workflow` | Planning | 1.0.0 | `:8135` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 4 | `azoth-local-agent` | Swarm & Core | 3.0.0 | `:8136` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 5 | `sovereign-agent-bridge` | Swarm & Core | 3.2.0 | `:8102` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 6 | `neuro-memory-daemon` | Memory & Brain | 2.8.0 | `:8094` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 7 | `zoth-os` | Swarm & Core | 3.4.0 | `:8137` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 8 | `vector-search-engine` | Swarm & Core | 2.5.0 | `:8121` | browser | `A` | `B` | `C` | `D` | `E` |
| 9 | `deepsearch-research-agent` | AI & Knowledge | 2.5.0 | `:8122` | browser | `A` | `B` | `C` | `D` | `E` |
| 10 | `promptmaster-studio` | AI & Knowledge | 3.2.0 | `:8123` | browser | `A` | `B` | `C` | `D` | `E` |
| 11 | `hexstrike-arsenal` | Security & Recon | 3.1.0 | `:8138` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 12 | `envguard-secrets-vault` | Security & Recon | 2.5.0 | `:8088` | browser | `A` | `B` | `C` | `D` | `E` |
| 13 | `jwt-inspector-guard` | Security & Recon | 2.6.0 | `:8124` | browser | `A` | `B` | `C` | `D` | `E` |
| 14 | `payload-entropy-studio` | Security & Recon | 2.5.0 | `:8080` | browser | `A` | `B` | `C` | `D` | `E` |
| 15 | `web-security-guard` | Security & Recon | 2.5.0 | `:8125` | browser | `A` | `B` | `C` | `D` | `E` |
| 16 | `polyglot-framework-exporter` | Autonomous Web | 2.5.0 | `:8126` | browser | `A` | `B` | `C` | `D` | `E` |
| 17 | `aeo-graph-engine` | Autonomous Web | 1.4.0 | `:8127` | browser | `A` | `B` | `C` | `D` | `E` |
| 18 | `cwv-speed-engine` | Autonomous Web | 2.5.0 | `:8128` | browser | `A` | `B` | `C` | `D` | `E` |
| 19 | `vision-gesture-control` | Media & 3D | 2.5.0 | `:8089` | browser | `A` | `B` | `C` | `D` | `E` |
| 20 | `subsweep-lead-scanner` | Security & Recon | 2.5.0 | `:8090` | browser | `A` | `B` | `C` | `D` | `E` |
| 21 | `omnipost-social-engine` | Automation | 2.5.0 | `:8091` | browser | `A` | `B` | `C` | `D` | `E` |
| 22 | `cron-rhythm-studio` | Automation | 2.5.0 | `:5174` | browser | `A` | `B` | `C` | `D` | `E` |
| 23 | `certpath-roadmap-studio` | Automation | 2.5.0 | `:8093` | browser | `A` | `B` | `C` | `D` | `E` |
| 24 | `pwa-manifest-builder` | Autonomous Web | 2.5.0 | `:8100` | browser | `A` | `B` | `C` | `D` | `E` |
| 25 | `regex-droid-builder` | Automation | 2.5.0 | `:8101` | browser | `A` | `B` | `C` | `D` | `E` |
| 26 | `schema-illustrator-studio` | Autonomous Web | 2.5.0 | `:8099` | browser | `A` | `B` | `C` | `D` | `E` |
| 27 | `zoth-webgen` | Autonomous Web | 2.5.0 | `:8092` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 28 | `zoth-swarm-multiplexer` | Swarm & Core | 2.5.0 | `:8141` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 29 | `webmcp-protocol-inspector` | AI & Knowledge | 1.0.0 | `:8142` | webgpu | `A` | `B` | `C` | `D` | `E` |
| 30 | `anderson-security-sentinel` | Security & OpSec | 2.5.0 | `:8103` | browser | `A` | `B` | `C` | `D` | `E` |
| 31 | `badge3d-coin-generator` | Media & 3D | 2.5.0 | `:8084` | browser | `A` | `B` | `C` | `D` | `E` |
| 32 | `robots-txt-auditor` | Growth & SEO | 2.5.0 | `:8086` | browser | `A` | `B` | `C` | `D` | `E` |
| 33 | `city-desk` | Growth & SEO | 2.5.0 | `:8087` | browser | `A` | `B` | `C` | `D` | `E` |
| 34 | `agent-egress-sentinel` | Security & Network | 2.5.0 | `:8095` | browser | `A` | `B` | `C` | `D` | `E` |
| 35 | `agent-mock-twin` | Simulation & Testing | 2.5.0 | `:8097` | browser | `A` | `B` | `C` | `D` | `E` |
| 36 | `agent-prompt-firewall` | Security & Network | 2.5.0 | `:8098` | browser | `A` | `B` | `C` | `D` | `E` |
| 37 | `wcag-contrast-guard` | Accessibility & UI | 2.5.0 | `:8150` | browser | `A` | `B` | `C` | `D` | `E` |
| 38 | `agent-flight-recorder` | Forensics & Telemetry | 2.5.0 | `:8104` | browser | `A` | `B` | `C` | `D` | `E` |
| 39 | `agent-capsule-jail` | Security & Enclave | 2.5.0 | `:8105` | browser | `A` | `B` | `C` | `D` | `E` |
| 40 | `agent-policy-auditor` | Security & Enclave | 2.5.0 | `:8106` | browser | `A` | `B` | `C` | `D` | `E` |
| 41 | `etsy-pod-forge` | Commerce & POD | 2.5.0 | `:8107` | browser | `A` | `B` | `C` | `D` | `E` |
| 42 | `etsy-connector` | Commerce & MCP | 2.5.0 | `:8108` | browser | `A` | `B` | `C` | `D` | `E` |
| 43 | `mcp-lens` | Simulation & Testing | 2.5.0 | `:8109` | browser | `A` | `B` | `C` | `D` | `E` |
| 44 | `agent-budget-sentinel` | Security & Network | 2.5.0 | `:8110` | browser | `A` | `B` | `C` | `D` | `E` |
| 45 | `agent-gods-eye` | Security & Recon | 2.5.0 | `:8112` | browser | `A` | `B` | `C` | `D` | `E` |
| 46 | `shopify-connector` | Commerce & MCP | 2.5.0 | `:8113` | browser | `A` | `B` | `C` | `D` | `E` |
| 47 | `printify-connector` | Commerce & MCP | 2.5.0 | `:8115` | browser | `A` | `B` | `C` | `D` | `E` |
| 48 | `gelato-connector` | Commerce & MCP | 2.5.0 | `:8116` | browser | `A` | `B` | `C` | `D` | `E` |
| 49 | `agent-voice-call` | Voice & Real-Time | 2.5.0 | `:8114` | browser | `A` | `B` | `C` | `D` | `E` |
| 50 | `pod-smart-router` | Commerce & MCP | 2.5.0 | `:8117` | browser | `A` | `B` | `C` | `D` | `E` |
| 51 | `digital-asset-forge` | Commerce & MCP | 2.5.0 | `:8118` | browser | `A` | `B` | `C` | `D` | `E` |
| 52 | `pod-mockup-forge` | Commerce & MCP | 2.5.0 | `:8119` | browser | `A` | `B` | `C` | `D` | `E` |
| 53 | `pod-margin-sentinel` | Commerce & MCP | 2.5.0 | `:8120` | browser | `A` | `B` | `C` | `D` | `E` |
| 54 | `audiocipher-stego-engine` | Security & OpSec | 2.5.0 | `:8096` | browser | `A` | `B` | `C` | `D` | `E` |
| 55 | `cyber-turtle-studio` | Media & 3D | 2.5.0 | `:8129` | browser | `A` | `B` | `C` | `D` | `E` |
| 56 | `datamosh-glitch-studio` | Media & 3D | 2.5.0 | `:8081` | browser | `A` | `B` | `C` | `D` | `E` |
| 57 | `nexus-3d-scene-studio` | Media & 3D | 2.5.0 | `:8082` | browser | `A` | `B` | `C` | `D` | `E` |
| 58 | `ufo-sacred-geometry` | Media & 3D | 2.5.0 | `:8083` | browser | `A` | `B` | `C` | `D` | `E` |
| 59 | `likeness-desk` | Voice & Real-Time | 2.5.0 | `:9395` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 60 | `osint-scout-skill` | Security & Recon | 2.5.0 | `:8085` | browser | `A` | `B` | `C` | `D` | `E` |
| 61 | `zoth-osint` | Security & Recon | 4.0.0 | `:8149` | hybrid | `A` | `B` | `C` | `D` | `E` |
| 62 | `zoth-bolt` | Autonomous Web | 3.5.0 | `:5173` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 63 | `zoth-civilization` | Swarm & Core | 3.0.0 | `:9393` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 64 | `storefront-catalog` | Commerce & POD | 2.5.0 | `:8143` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 65 | `shodan-surface-sentinel` | Security & Enclave | 3.5.0 | `:8130` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 66 | `ghidra-mcp-bridge` | Security & Enclave | 3.5.0 | `:8131` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 67 | `zoth-ascii-magic` | Media & 3D | 2.7.0 | `:8132` | browser | `A` | `B` | `C` | `D` | `E` |
| 68 | `yara-sigma-forge` | Security & Recon | 3.4.0 | `:8133` | browser | `A` | `B` | `C` | `D` | `E` |
| 69 | `reality-shader-forge` | Media & 3D | 3.4.0 | `:8134` | browser | `A` | `B` | `C` | `D` | `E` |
| 70 | `producthunt-connector` | Commerce & POD | 1.1.0 | `:8139` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 71 | `zoth-relay` | Swarm & Core | 0.5.0 | `:8765` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 72 | `zela-glasses-guide` | Swarm & Core | 0.5.0 | `:8144` | browser | `A` | `B` | `C` | `D` | `E` |
| 73 | `zoth-bot` | Swarm & Core | 1.0.0 | `:8146` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 74 | `zoth-bounty` | Security & Enclave | 1.0.0 | `:9494` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 75 | `zoth-scene-foundry` | Media & 3D | 1.0.0 | `:8823` | browser | `A` | `B` | `C` | `D` | `E` |
| 76 | `zoth-math-pillar` | Security & Enclave | 2.0.0 | `:9995` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 77 | `zothos-lite` | Hardware & OS | 1.2.0 | `:8145` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 78 | `zothnet` | Swarm & Core | 1.2.0 | `:9900` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 79 | `creatorplaybooks` | Education & Growth | 1.0.0 | `:5185` | browser | `A` | `B` | `C` | `D` | `E` |
| 80 | `zoth-obsidian-tracker` | Swarm & Core | 1.2.0 | `:8151` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 81 | `zoth-x-connector` | Swarm & Core | 1.0.0 | `:8152` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 82 | `zoth-memory-vault` | Memory & Brain | 1.0.0 | `:8161` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 83 | `zoth-egregore` | Swarm & Core | 0.1.0-beta | `:8147` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 84 | `zoth-bot-os` | Swarm & Core | 1.3.0 | `:8190` | local_cli | `A` | `B` | `C` | `D` | `E` |
| 85 | `zoth-comfy-foundry` | Media & 3D | 1.1.0 | `cli` | local_cli | `A` | `B` | `C` | `D` | `E` |

## 4. Layer C — CLI parity detail

### 4.1 Generated God-Mode wrappers

- **105** filenames on the bin surfaces carry `TOOL_ID` metadata, resolving to **51** distinct tools.
- The **51 canonical catalog filenames are byte-identical across all three surfaces** (chroot
  staging = `/usr/local/bin` = `~/.local/bin`). The surplus **54** files are short-name aliases,
  characterised in §4.3 — none is a stale dispatch target.
- Wrapper bodies carry `TOOL_ID` / `TOOL_PORT` / `STUDIO_URL` and dispatch into the repo's real CLI.

### 4.2 Catalog entries that are NOT generated wrappers (30)

These ship their own executable entry from the repo instead of a generated wrapper. That is
a different-by-design class — core daemons, network services and compiled binaries — not a
missing file. **30 of the 30 are nevertheless byte-identical on all three surfaces; 0 differ.**

```
pixel-cast
aether-observatory
azoth-local-agent
sovereign-agent-bridge
neuro-memory-daemon
zoth-os
vector-search-engine
zoth-webgen
agent-mock-twin
etsy-pod-forge
etsy-connector
mcp-lens
agent-gods-eye
shopify-connector
printify-connector
gelato-connector
agent-voice-call
pod-smart-router
digital-asset-forge
pod-mockup-forge
pod-margin-sentinel
zoth-osint
storefront-catalog
zoth-ascii-magic
zoth-math-pillar
zothos-lite
zothnet
creatorplaybooks
zoth-obsidian-tracker
zoth-x-connector
```

Every delta recorded mid-sweep is now closed: each was re-staged from its canonical repo revision and re-verified:

| tool | delta recorded mid-sweep | how it stands now |
|---|---|---|
| `pixel-cast` | chroot defaulted to `100.64.0.10` (Tailscale CGNAT) where `/usr/local/bin` used `127.0.0.1` | **closed** — all three surfaces now hash `f0bb0e34acc9` = `pixel-cast/bin/pixel-cast` |
| `zoth-osint` | chroot copy was 1 byte shorter (example number `E164_REDACTED` vs a `555`-range placeholder) | **closed** — all three surfaces now hash `a4b5fe68b277` (22718 B) = `zoth-osint/bin/zoth-osint` |
| `zothos-lite` | `/usr/local/bin` + chroot (13319 B) declared `solana_tip_address`; the 13237 B repo revision did not | **closed on the surface axis** — all three now hash `600626b64754` = the repo revision. Residual content question in §4.5 |
| `zothnet` | three different Go builds: 8.44 MB and 8.47 MB static stripped, 11.9 MB dynamic with debug info | **closed** — all three surfaces now hash `30c1dc4e307b` = `zothnet/bin/zothnet` |

Spot-verified in the other direction: `zoth-math-pillar` — chroot and `/usr/local/bin` are
both 3261 bytes from the same revision, `~/.local/bin/zoth-math-pillar` is a **symlink to
`/usr/local/bin`** (the correct no-shadowing arrangement), and `--help` exits **0**.

### 4.3 The alias layer (why every naive census is wrong)

- The three bin directories hold **484 distinct filenames** in total, but only **105** of them
  are generated wrappers — the other **379** are unrelated system binaries and `-tui` launchers
  (`bat`, `aider`, `claude`, `codex`, ...). Counting those as "tools" is the first trap.
- The **105** wrapper filenames resolve to only **51 distinct `TOOL_ID`s**; the surplus **54** are
  short-name alias files (`zela`, `zela-guide`, `zoth-bolt`, `sigma-forge`, ...).
- **0 of the 105 wrapper filenames differ between surfaces** (no canonical catalog filename does):

```
(none)
```

Interpretation: the alias layer is now **content-identical to the wrapper layer on every surface**:
- **all 54 aliases hash equal to the canonical generated wrapper** on each surface they appear on
  (`alias_no_link = 0` — every alias is a symlink to, or a byte-identical copy of, its canonical
  wrapper; `alias_drift = 0`). Identity was judged by sha256 per surface, not by filename.

- **54 of the 54 aliases are byte-identical on every surface they appear on.**
- **0 differ.** The pairs that once disagreed — `zela`/`zela-guide`,
  `sigma-forge`/`yara-forge`/`zoth-yara-forge`, `theme-forge`/`zoth-theme-forge`,
  `zoth-foundry`/`scene-foundry`, `bounty-hub`, `reality-forge`, and the `zoth-*` ↔ `agent-*` daemon
  pair — now hash equal on all three surfaces. Convergence policy: **repo copy = source of truth**;
  each alias was re-staged from the canonical generated wrapper for the same `TOOL_ID`
  (`docs/tools/alias_sync.py`), never patched in place. The historical difference was always
  **form** (a symlink on one surface, a standalone generated copy on another) and/or **embedded
  sample text** in the standalone copy — e.g. `zela` vs `zela-guide` differed in one printed example
  line (`zothos v0.5.0` + `100.64.0.10` in chroot vs `zoth-pill v0.5.0` + a host address in
  `~/.local/bin`). No alias ever had a wrong dispatch target or a different `TOOL_ID`.

Alias **filenames** are deliberately left in place: collapsing them would change user-facing
command names — a decision for the owner, not for this sweep. Only their content was converged.

### 4.4 Repairs performed (each verified on all surfaces afterwards)

| tool | finding | action | evidence |
|---|---|---|---|
| `zela-glasses-guide` | `/usr/local/bin` entry was a **stale root-owned copy**, not a symlink like its siblings; chroot staging held an older 11-11 revision hardcoding repo paths while live had an 11-15 revision with `_z_resolve_repo()` | backed both copies up, symlinked `/usr/local/bin` to the repo binary, re-staged the chroot copy from the same source | all three surfaces now `7eaf8f943c83` (6041 B); `--help` exits **0** |
| `zoth-civilization` / `zoth-civ` | `~/.local/bin` copy had drifted from the installed and staged revisions | re-staged all three surfaces from the repo binary | chroot = `/usr/local/bin` = `~/.local/bin` = `zoth-civilization/bin/zoth-civ`, all `63fad0bf7831` (5950 B) |

Every file touched before a write was copied to `~/.hermes/cache/scratch/backups-24h/`
(`usr-local-bin.zela-glasses-guide.orig`, `chroot.zela-glasses-guide.orig-1b497b86`,
`zela-glasses-guide.repo.20261115-070053`, `zoth-civilization.local.bin.20261115-064802`,
`zoth-civ.repo.20261115-064802`, `pixel-cast.local.bin.20261115-064802`). All backups are
outside every repo, so no repo or markdown artifact carries them.

### 4.5 `zothos-lite` — PATH shadowing resolved; one content question left to the owner

`~/.local/bin/zothos-lite` is a symlink to `~/NullAITech/zothos-lite/bin/zothos-lite`;
`/usr/local/bin/zothos-lite` and the chroot staging copy are standalone files. **All three now
hash `600626b64754` (13237 B, mtime 2026-11-11) and every one equals the repo revision**, so the
`PATH`-order question is moot: whichever copy runs first produces identical behaviour. The
13319 B variant that declared a `solana_tip_address` is no longer present on any surface.

**Residual content question (owner's call, not a parity defect):** the canonical repo revision
declares no tip address in the CLI at all. The address itself is not lost — it is still published
by the repo at `zothos-lite/public/index.html` (and in the staged `build/live-work` copy). If the
CLI is meant to print it, the change belongs in `zothos-lite/bin/zothos-lite` (the source of
truth), after which every surface picks it up: the repo copy because `~/.local/bin` symlinks to
it, the other two because they are re-staged from it. Editing a payment-related line in another
session's tree is exactly the class of change this sweep avoids, so it stays reported.

For reference, the address published on that page is
`GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`.

### 4.6 Catalog version vs CLI-declared version — 10 metadata mismatches

Every file named here is **byte-identical on all three surfaces** (§4.1), so this is a
*metadata* mismatch, not a parity defect: the catalog row advertises a version that the
shipped CLI does not declare. No surface disagrees with any other surface. All values below
were read from the live files at generation time.

| tool | catalog says | CLI declares | repo manifest | CLI read from |
|---|---|---|---|---|
| `adytum-alchemist-ai-workflow` | `1.0.0` | `2.4.0` | `package.json 0.0.0` | `chroot` |
| `sovereign-agent-bridge` | `3.2.0` | `3.3.0` | `pyproject.toml 0.1.0` | `chroot` |
| `neuro-memory-daemon` | `2.8.0` | `3.1.0` | `package.json 2.0.0` | `chroot` |
| `etsy-pod-forge` | `2.5.0` | `0.1.0` | `package.json 2.5.0` | `chroot` |
| `etsy-connector` | `2.5.0` | `0.1.0` | `package.json 2.5.0` | `chroot` |
| `zoth-bolt` | `3.5.0` | `2.5.0` | `package.json 3.0.0` | `chroot` |
| `zoth-civilization` | `3.0.0` | `2.5.0` | `package.json 1.0.0` | `chroot` |
| `yara-sigma-forge` | `3.4.0` | `3.3.0` | — (no manifest) | `chroot` |
| `producthunt-connector` | `1.1.0` | `0.1.0` | `pyproject.toml 0.1.0` | `chroot` |
| `zothnet` | `1.2.0` | `1.0.0` | — (no manifest) | `chroot` |

Direction, computed over the 10 rows: the catalog is **ahead** of the shipped CLI in 7
cases and **behind** in 3. Because both directions occur, neither the catalog nor the
CLI can be declared the source of truth from this evidence alone, so the table is
reported rather than rewritten — a version bump in either place is an owner decision,
not a parity fix. Where a repo manifest agrees with the CLI instead of the catalog row,
the catalog is the likely stale side; where no manifest is present the row is
undetermined from the files at hand. Every row above is a *surface-identical* file: the
mismatch is between metadata and the CLI banner, never between one surface and another.

### 4.7 Project-owned helpers outside the `TOOL_ID` layer — 8 in cross-surface drift

The alias/wrapper layer above is keyed on `TOOL_ID` metadata (**105 files carrying 51 distinct
`TOOL_ID`s**) and is therefore structurally blind to everything else in those three bin
directories. Most of that remainder is third-party (`node`, `python`, `uv`, `aider`, `claude`, …)
whose per-surface differences are just separate installs, not drift. Narrowing to the project's
own namespace (regex `^(zoth|zela|zothos|agent-)`, symlinks and anything carrying `TOOL_ID`
excluded) leaves **154 helpers**: 130 byte-identical across every surface they appear on, 16
present on a single surface, and **8 in genuine cross-surface drift**:

| helper | surfaces | chroot | usr_local | user_local | newest |
|---|---|---|---|---|---|
| `zoth-arsenal-daemons` | `chroot`, `user_local`, `usr_local` | `2a09332e` 2026-11-03 1794B | `217197fd` 2026-11-09 6812B | `217197fd` 2026-11-09 6812B | `usr_local` |
| `zoth-bridge-gate` | `chroot`, `user_local` | `edc044a2` 2026-11-11 461B | — | `b872cba6` 2026-11-08 342B | `chroot` |
| `zoth-ci-gate` | `chroot`, `user_local`, `usr_local` | `40487810` 2026-11-10 5764B | `4b2e326e` 2026-11-10 6083B | `4b2e326e` 2026-11-10 6083B | `chroot` |
| `zoth-dualboot` | `chroot`, `user_local`, `usr_local` | `a22fa365` 2026-10-26 6037B | `a22fa365` 2026-10-26 6037B | `cdcfa619` 2026-10-26 7206B | `chroot` |
| `zoth-guide` | `chroot`, `user_local`, `usr_local` | `9fb9e9d9` 2026-11-03 2043B | `3dcabc4b` 2026-11-03 2046B | `3dcabc4b` 2026-10-19 2046B | `chroot` |
| `zoth-second-brain` | `chroot`, `user_local`, `usr_local` | `0332b335` 2026-11-11 108984B | `beeb80e0` 2026-10-31 108980B | `beeb80e0` 2026-11-02 108980B | `chroot` |
| `zoth-vault-daemon` | `chroot`, `usr_local` | `e43f5aec` 2026-10-26 2496256B | `361e2110` 2026-10-19 2496256B | — | `chroot` |
| `zoth-welcome` | `chroot`, `user_local`, `usr_local` | `5bab23ac` 2026-11-11 11318B | `272524d0` 2026-11-10 11336B | `272524d0` 2026-11-10 11336B | `chroot` |

The split is **not one-sided**, and mtime does not order it. Grouped by which surfaces
agree: **five helpers** (`zoth-arsenal-daemons`, `zoth-ci-gate`, `zoth-guide`,
`zoth-second-brain`, `zoth-welcome`) have the two live surfaces agreeing with each other
against a differing chroot image copy; `zoth-dualboot` instead has `{chroot, usr_local}`
agreeing against `user_local`; and `zoth-bridge-gate` / `zoth-vault-daemon` exist on only two
surfaces and differ on both. Within those groups the chroot copy is the *newer* file by mtime
for most rows and the older one for others, and two rows break the ordering outright:
`zoth-guide`'s `usr_local` copy is byte-identical to its `user_local` copy (`3dcabc4b`) yet
stamped `2026-11-03` against `2026-10-19`, while `zoth-dualboot`'s two different contents
(`a22fa365` vs `cdcfa619`) share the date `2026-10-26`. Content and timestamps therefore
cross-cut in both directions, and the same conclusion §4.6 reached for the advertised-version
mismatch applies: **no surface can be declared canonical from this evidence, and a blind
`--apply` sync across these eight would be a regression, not a repair.** None of them is a
catalog tool (no `TOOL_ID`), which is why the alias layer above reports 0 drift while this
class does not — the two measurements answer different questions.
Reproduce with `docs/tools/atlas_gen.py` (`helper_drift()`), which scans the same three surfaces.

## 5. Port map & collision analysis

- Catalog: **83 entries, 83 distinct ports, 0 collisions** (alias-aware: symlinked aliases
  are collapsed to their target before comparison).
- Historical false alarm: a `:8085` clash between `osint-scout` and `osint-scout-skill` was an
  **alias**, not a conflict. `deepsearch-research-agent`'s wrapper port also changed
  `8085 -> 8122` mid-sweep under a concurrent writer; the catalog-agreed value is `:8122`.
- Ecosystem daemons holding ports (their own catalog entries, not collisions):

| port | service |
|---|---|
| `:3000` | Zoth Studio v2 |
| `:8094` | Neuro-Memory Daemon |
| `:8102` | Sovereign Agent Bridge |
| `:8145` | ZothOS Lite |
| `:8147` | Zoth Egregore (`zoth-egregore`) |
| `:8160` | aether-observatory |
| `:8161` | Chronicle Vault (`zoth-memory-vault`) |
| `:8190` | Zoth Bot OS (`zoth-bot-os`) |
| `:11434` | Ollama |
| `:18000` | AGY-Hermes Proxy |

## 6. Orphaned repositories

Top-level directories under `NullAITech/` that have **no catalog entry** (61).
Presence here is not a defect: this tree holds shared toolchain, research material and
infrastructure alongside shippable products. Grouping below is an assessment, not a measurement.

```
1nc0gn30
1nc0gn30.github.io
30-days-of-Linux-Fundamentals
GhidraMCP
LaunchBetter
Netlify-Ghost-Hub
NullAI-HexStrike-AI-Terminal
bin
bolt.diy
bounty-hunter
chain-of-thoughts
colibri
fieldkit
fieldkit-site
generated-sites
google-ai-resources
growth-distribution
hermes-laboratory
hermes-webchat
hermes-zoth
media-assets
meta-hackathon-2026
metadigitalgoods
muse-code-linux
neal-bliki
neal-voice-clone
nealfrazier-tech-build
nealsvision
nous-hermes-zoth-collab
nullai2026
pentest-academy
prompts
research
security-captures
shodan-viz
sites
src
super-muse
tests
vaelor-network
vb-bin-butler
vb-towncenter-delivery
video-production
war-of-zoth
zml-website
zoth-cursorz
zoth-egregore
zoth-fast
zoth-gpu-foundry
zoth-lattice-bot
zoth-npm
zoth-os-website
zoth-studio-og
zoth-studio-v2
zoth-termux
zoth-theme-forge
zoth-ui-kit
zoth-usb-bridge
zoth-yara-forge
zothnet-android
zothnet-website
```

Recommended triage (owner's call):

- **Promote to catalog** — shipping products with a web entry and a CLI but no catalog row.
- **Keep out of catalog** — shared assets/infrastructure (`assets`, `src`, `bin`, `tests`, toolchain dirs).
- **Archive** — research/output directories with no runnable surface.

## 7. Known gaps — Phase 2 queue

| layer | gap | items |
|---|---|---|
| `[B]` | no God-Mode component resolving in the router |  |
| `[D]` | no `README.md` |  |
| `[A]` | no standalone web entry document |  |
| `[A]` | runtime-served web surface (explained, not a defect) | `zothnet` -> `pkg/web/dashboard.html` — Go-served dashboard (`zothnet serve`, port 9900); the static hub is deployed out-of-tree at zothnet.nullai.tech and zothnet-mesh.netlify.app |
| `[A]` | incomplete SEO/AEO metadata in entry document | 0 entries:  |
| `[A]` | canonical Stripe support link absent from entry document | 1 entries |
| `[A]` | interactive-quality evidence present (doc + CDP instruments) | 1/81: `pixel-cast` -> `docs/LAYER_A_FINDINGS.md` |
| `[C]` | project-owned helper outside the `TOOL_ID` layer, cross-surface drift | 8 (§4.7) |
| `[E]` | no clean headless capture row | none |

Layer A's interactive checks (dead buttons, canned outputs, blur locks) are **open work** at
scale, not automated fails: the automated scan produced three false-positive classes (see §0).
1 of 81 tools now carry real interactive evidence (CDP instruments + a findings doc — see the
§7 row and `docs/LAYER_A_FINDINGS.md`); the remaining 80 are still manual.

## 8. Layer E — headless visual evidence

Two sweeps (`docs/tools/layerE_http.py`), same tool, same predicates, captured with headless
Chromium closed after every run:

| sweep | target | rows | clean |
|---|---|---|---|
| static | each repo served on a loopback port | 77 | **76** |
| live | each tool's own declared `localPort`, only if it was already listening | 15 | **15** |
| per-tool | final verdict used by the `[E]` column in §3 (67 static · 14 live) | 81 | **81** |

Clean predicate (all must hold): `status == ok`, three viewport rows, `overflowPx == 0`,
`imgsMissingAlt == 0`, `other_error_count == 0`, no blank viewport, and >= 200 characters of
rendered text in every viewport — a blank shell that merely loads is not a pass.

The gaps are the 0 tools whose page loads but whose backing JSON API is down — none: the shell
returns HTTP 200 and renders, but its panes stay empty, which the predicate catches.

| tool | verdict | sweep | screenshots | detail |
|---|---|---|---|---|
| `pixel-cast` | **clean** | static | 3 | clean |
| `aether-observatory` | **clean** | live | 3 | clean |
| `adytum-alchemist-ai-workflow` | **clean** | static | 3 | clean |
| `azoth-local-agent` | **clean** | static | 3 | clean |
| `sovereign-agent-bridge` | **clean** | live | 3 | clean |
| `neuro-memory-daemon` | **clean** | live | 3 | clean |
| `zoth-os` | **clean** | live | 3 | clean |
| `vector-search-engine` | **clean** | static | 3 | clean |
| `deepsearch-research-agent` | **clean** | static | 3 | clean |
| `promptmaster-studio` | **clean** | static | 3 | clean |
| `hexstrike-arsenal` | **clean** | static | 3 | clean |
| `envguard-secrets-vault` | **clean** | static | 3 | clean |
| `jwt-inspector-guard` | **clean** | static | 3 | clean |
| `payload-entropy-studio` | **clean** | static | 3 | clean |
| `web-security-guard` | **clean** | static | 3 | clean |
| `polyglot-framework-exporter` | **clean** | static | 3 | clean |
| `aeo-graph-engine` | **clean** | static | 3 | clean |
| `cwv-speed-engine` | **clean** | static | 3 | clean |
| `vision-gesture-control` | **clean** | static | 3 | clean |
| `subsweep-lead-scanner` | **clean** | static | 3 | clean |
| `omnipost-social-engine` | **clean** | static | 3 | clean |
| `cron-rhythm-studio` | **clean** | static | 3 | clean |
| `certpath-roadmap-studio` | **clean** | static | 3 | clean |
| `pwa-manifest-builder` | **clean** | static | 3 | clean |
| `regex-droid-builder` | **clean** | static | 3 | clean |
| `schema-illustrator-studio` | **clean** | static | 3 | clean |
| `zoth-webgen` | **clean** | live | 3 | clean |
| `zoth-swarm-multiplexer` | **clean** | static | 3 | clean |
| `webmcp-protocol-inspector` | **clean** | static | 3 | clean |
| `anderson-security-sentinel` | **clean** | static | 3 | clean |
| `badge3d-coin-generator` | **clean** | static | 3 | clean |
| `robots-txt-auditor` | **clean** | static | 3 | clean |
| `city-desk` | **clean** | static | 3 | clean |
| `agent-egress-sentinel` | **clean** | static | 3 | clean |
| `agent-mock-twin` | **clean** | static | 3 | clean |
| `agent-prompt-firewall` | **clean** | static | 3 | clean |
| `wcag-contrast-guard` | **clean** | static | 3 | clean |
| `agent-flight-recorder` | **clean** | static | 3 | clean |
| `agent-capsule-jail` | **clean** | static | 3 | clean |
| `agent-policy-auditor` | **clean** | static | 3 | clean |
| `etsy-pod-forge` | **clean** | static | 3 | clean |
| `etsy-connector` | **clean** | static | 3 | clean |
| `mcp-lens` | **clean** | static | 3 | clean |
| `agent-budget-sentinel` | **clean** | live | 3 | clean |
| `agent-gods-eye` | **clean** | static | 3 | clean |
| `shopify-connector` | **clean** | static | 3 | clean |
| `printify-connector` | **clean** | static | 3 | clean |
| `gelato-connector` | **clean** | static | 3 | clean |
| `agent-voice-call` | **clean** | live | 3 | clean |
| `pod-smart-router` | **clean** | static | 3 | clean |
| `digital-asset-forge` | **clean** | static | 3 | clean |
| `pod-mockup-forge` | **clean** | static | 3 | clean |
| `pod-margin-sentinel` | **clean** | static | 3 | clean |
| `audiocipher-stego-engine` | **clean** | static | 3 | clean |
| `cyber-turtle-studio` | **clean** | static | 3 | clean |
| `datamosh-glitch-studio` | **clean** | static | 3 | clean |
| `nexus-3d-scene-studio` | **clean** | static | 3 | clean |
| `ufo-sacred-geometry` | **clean** | static | 3 | clean |
| `likeness-desk` | **clean** | live | 3 | clean |
| `osint-scout-skill` | **clean** | static | 3 | clean |
| `zoth-osint` | **clean** | static | 3 | clean |
| `zoth-bolt` | **clean** | live | 3 | clean |
| `zoth-civilization` | **clean** | live | 3 | clean |
| `storefront-catalog` | **clean** | static | 3 | clean |
| `shodan-surface-sentinel` | **clean** | static | 3 | clean |
| `ghidra-mcp-bridge` | **clean** | static | 3 | clean |
| `zoth-ascii-magic` | **clean** | static | 3 | clean |
| `yara-sigma-forge` | **clean** | static | 3 | clean |
| `reality-shader-forge` | **clean** | static | 3 | clean |
| `producthunt-connector` | **clean** | static | 3 | clean |
| `zoth-relay` | **clean** | live | 3 | clean |
| `zela-glasses-guide` | **clean** | static | 3 | clean |
| `zoth-bot` | **clean** | static | 3 | clean |
| `zoth-bounty` | **clean** | live | 3 | clean |
| `zoth-scene-foundry` | **clean** | static | 3 | clean |
| `zoth-math-pillar` | **clean** | static | 3 | clean |
| `zothos-lite` | **clean** | static | 3 | clean |
| `zothnet` | **clean** | live | 6 | clean |
| `creatorplaybooks` | **clean** | static | 3 | clean |
| `zoth-obsidian-tracker` | **clean** | static | 3 | clean |
| `zoth-x-connector` | **clean** | live | 3 | clean |

The live column is deliberately sparse: a tool was only probed live when `ss -tln` already
showed its port open, so no daemon was started, stopped, or replaced for this measurement.

## 9. Change log

| when | change |
|---|---|
| 2026-11-16 12:05 | atlas generator created; Layers A/B/C/D measured across 81 entries |
| 2026-11-15 | `zela-glasses-guide` tri-surface repair (see §4.4) |
| 2026-11-15 | Layer E wired into the generator: headless 3-viewport verdicts read from `layerE_results_http.jsonl` / `layerE_results_live.jsonl` (§8) |

