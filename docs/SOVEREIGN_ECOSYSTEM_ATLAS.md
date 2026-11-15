# SOVEREIGN ECOSYSTEM ATLAS

Master architectural ledger for the `NullAITech` sovereign tool ecosystem.

| | |
|---|---|
| Generated | 2026-11-15 08:12 |
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
   Layer A's interactive-quality checks therefore remain open work, not automated fails.
3. **Moving target.** A concurrent agent session writes in these trees. Every figure is
   timestamped; re-run the generator to refresh.

## 1. Executive summary

| metric | value |
|---|---|
| Catalog entries (`toolsData.js`) | **80** |
| Distinct `localPort` values | **80** |
| Port collisions (alias-aware) | **0** |
| Catalog entries present on all 3 bin surfaces | **80/80** |
| ...of those, byte-identical across all 3 surfaces | **76/80** |
| Generated God-Mode wrappers (carry `TOOL_ID`) | **130** filenames / **68** canonical `TOOL_ID`s, all canonical byte-identical |
| Tools shipping a native CLI instead of a wrapper | **12** (**8** byte-identical, **4** differ) |
| Short-name alias filenames (`zela`, `zoth-bolt`, ...) | **62** (16 drifting, none catalog-critical) |
| Unrelated binaries in those dirs (out of scope) | **354** |
| Layer A — standalone web entry present | **79/80** |
| Layer A — SEO/AEO complete in entry document | **71/80** |
| Layer A — bare `<img>` without `alt` | **1** |
| Layer B — God-Mode component resolves in `lazy()` registry | **79/80** |
| Layer D — `README.md` present | **79/80** |
| Layer E — visually verified via `capture.mjs` | **0/80** (Phase 2) |
| Top-level repositories under `NullAITech/` | **141** |
| Repositories absent from the catalog | **61** |

**Reading the parity verdict:** the CLI surface (Layer C) is in excellent shape — all **68**
canonical wrappers are present on all three surfaces with identical bytes, **76/80** catalog
entries are byte-identical on all three, the only **4** exceptions are native-CLI tools with a
diffed and explained delta (§4.2), and there are **zero** port collisions across all 80 catalog
entries. The real remaining gaps are small and enumerable: **1** catalog entries lack a Layer B
component, **1** lack a README, **1** lack a standalone web entry, and **9** have incomplete
SEO/AEO metadata. Layer E is deliberately empty: visual verification is Phase 2 work.

## 2. Tri-surface status legend

| code | layer | meaning | full pass looks like |
|---|---|---|---|
| `[A]` | Standalone Web App | repo opens into a working multi-pane app | a real entry document, `ld+json` (WebApplication+FAQPage), OpenGraph tags, 100% `<img alt>` |
| `[B]` | Zoth Studio `/tools/<id>` | God-Mode component wired into the router | `src/components/tools/<X>GodModeTool.jsx` reachable from the `lazy()` registry |
| `[C]` | CLI binary | present and identical on all three bin surfaces | same bytes in chroot staging, `/usr/local/bin`, `~/.local/bin`; `--help`/`--json` exit 0 |
| `[D]` | Documentation | `README.md` documents purpose, port, CLI, studio route | all four sections present |
| `[E]` | Visual verification | `capture.mjs` at 390x844 / 820x1180 / 1440x900 | `overflowPx===0`, `imgsMissingAlt===0`, `errors.length===0` |

In the matrix: `` `A` `` = layer fully satisfied, `^A^` = partially satisfied (see gap lists),
`.` = not satisfied. Layer E is `.` everywhere until Phase 2 runs the captures.

## 3. Master matrix — all 80 catalog entries

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

## 4. Layer C — CLI parity detail

### 4.1 Generated God-Mode wrappers

- **130** filenames on the bin surfaces carry `TOOL_ID` metadata, resolving to **68** distinct tools.
- The **68 canonical catalog filenames are byte-identical across all three surfaces** (chroot
  staging = `/usr/local/bin` = `~/.local/bin`). The surplus **62** files are short-name aliases,
  characterised in §4.3 — none is a stale dispatch target.
- Wrapper bodies carry `TOOL_ID` / `TOOL_PORT` / `STUDIO_URL` and dispatch into the repo's real CLI.

### 4.2 Catalog entries that are NOT generated wrappers (12)

These ship their own executable entry from the repo instead of a generated wrapper. That is
a different-by-design class — core daemons, network services and compiled binaries — not a
missing file. **8 of the 12 are nevertheless byte-identical on all three surfaces; 4 differ.**

```
pixel-cast
azoth-local-agent
sovereign-agent-bridge
neuro-memory-daemon
zoth-os
vector-search-engine
zoth-osint
zoth-math-pillar
zothos-lite
zothnet
zoth-obsidian-tracker
zoth-x-connector
```

The 4 that differ were diffed individually — each delta is explainable, none is a stale stub:

| tool | delta between surfaces | assessment |
|---|---|---|
| `pixel-cast` | chroot defaults to `100.64.0.10` (Tailscale CGNAT) where `/usr/local/bin` uses `127.0.0.1`; one `--host` help line differs | build-environment defaults, not a defect |
| `zoth-osint` | chroot copy is 1 byte shorter: the example phone number is `E164_REDACTED` there, a `555`-range placeholder in `/usr/local/bin` | chroot staging is deliberately sanitised |
| `zothos-lite` | `/usr/local/bin` (13319 B, identical to chroot) declares `solana_tip_address`; the repo binary `~/.local/bin` symlinks to (13237 B) does not — and `~/.local/bin` wins on `PATH` | **open item**: the effective CLI is the copy without the canonical tip address (see §4.5) |
| `zothnet` | three genuinely different Go builds: 8.44 MB and 8.47 MB static stripped, 11.9 MB dynamic with debug info | compiled-artifact drift from separate builds |

Spot-verified in the other direction: `zoth-math-pillar` — chroot and `/usr/local/bin` are
both 3261 bytes from the same revision, `~/.local/bin/zoth-math-pillar` is a **symlink to
`/usr/local/bin`** (the correct no-shadowing arrangement), and `--help` exits **0**.

### 4.3 The alias layer (why every naive census is wrong)

- The three bin directories hold **484 distinct filenames** in total, but only **130** of them
  are generated wrappers — the other **354** are unrelated system binaries and `-tui` launchers
  (`bat`, `aider`, `claude`, `codex`, ...). Counting those as "tools" is the first trap.
- The **130** wrapper filenames resolve to only **68 distinct `TOOL_ID`s**; the surplus **62** are
  short-name alias files (`zela`, `zela-guide`, `zoth-bolt`, `sigma-forge`, ...).
- **16 of the 130 wrapper filenames differ between surfaces** (no canonical catalog filename does):

```
bounty-hub
scene-foundry
sigma-forge
theme-forge
yara-forge
zela
zela-guide
zoth-capsule-jail
zoth-egress-sentinel
zoth-flight-recorder
zoth-foundry
zoth-mock-twin
zoth-policy-auditor
zoth-prompt-firewall
zoth-theme-forge
zoth-yara-forge
```

Interpretation: the alias layer is legacy/hand-made scaffolding around an otherwise exact
wrapper layer. **Every one of the 16 drifting aliases is a symlink to the canonical wrapper on at
least one surface** (`alias_no_link = 0`), so no alias points at a stale target:

- **46 of the 62 aliases are byte-identical on every surface they appear on.**
- **16 differ** — 10 appear on all three surfaces, 6 on two (chroot + `/usr/local/bin` only,
  the `zoth-*` aliases for the `agent-*` daemon family).
- The difference is always **form** (a symlink on one surface, a standalone generated copy on
  another) and/or **embedded sample text** in the standalone copy — verified by diff, e.g.
  `zela` vs `zela-guide` differ in one printed example line (`zothos v0.5.0` + `100.64.0.10`
  staged in chroot vs `zoth-pill v0.5.0` + a host-specific `100.x` address in `~/.local/bin`),
  and `bounty-hub` gains an Electron/`--tui` interceptor preamble on the symlinked surface.
  No alias has a wrong dispatch target or a different `TOOL_ID`.

It is documented here rather than force-synced, because collapsing aliases would change
user-facing command names — a decision for the owner, not for this sweep.

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

### 4.5 Open item — `zothos-lite` shadowing (not fixed, needs an owner decision)

`~/.local/bin/zothos-lite` is a symlink to `/home/zoth/NullAITech/zothos-lite/bin/zothos-lite`
(13237 B, mtime 2026-11-11). `/usr/local/bin/zothos-lite` (13319 B, mtime 2026-11-10) is
byte-identical to the chroot staging copy. `~/.local/bin` precedes `/usr/local/bin` on `PATH`,
so **the repo copy is what actually runs**, and the only difference is one line:

```
- the installed + staged copies declare   "solana_tip_address": "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK",
- the repo copy does not.
```

**Why this is reported and not "fixed":** the two candidates disagree, the repo copy is the
newer one by mtime, and the delta is a support/donation line with no functional effect. Which
revision is intended is the owner's call, and a concurrent agent session is active in this
tree — silently editing a payment-related line in someone else's repo is exactly the class of
change this mission is meant to avoid. Recommended action: add the canonical tip address to
the repo binary (restoring the spec'd address on the copy that actually executes), then re-run
this generator, which will collapse `zothos-lite` into the byte-identical set.

## 5. Port map & collision analysis

- Catalog: **80 entries, 80 distinct ports, 0 collisions** (alias-aware: symlinked aliases
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
| `:8160` | aether-observatory |
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
aether-observatory
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
| `[B]` | no God-Mode component resolving in the router | `wcag-contrast-guard` |
| `[D]` | no `README.md` | `zoth-math-pillar` |
| `[C]` | alias filenames drifting between surfaces (§4.3) | 16 alias names |
| `[A]` | ~~canonical Stripe support link absent from entry document~~ | 2 entries — one was `wcag-contrast-guard` (real, fixed); the other cleared once support-link detection became SPA-aware |
| `[E]` | never visually verified | all 80 |
| `[A]` | ~~no standalone web entry document~~ | ~~`zothnet`~~ — **withdrawn**: scanner artifact, its served UI `pkg/web/dashboard.html` is compliant (see §8) |
| `[A]` | ~~incomplete SEO/AEO metadata in entry document~~ | ~~9 entries~~ — **resolved** Phase 2 wave 1 |
| `[A]` | ~~JSON-LD `@type` lacks `WebApplication`~~ | ~~19 entries~~ — **resolved** Phase 2 wave 1; fleet re-probe `layerA_gaps = 0/80` |

Layer A's interactive checks (dead buttons, canned outputs, blur locks) are **open work**,
not automated fails: the automated scan produced three false-positive classes (see §0).

## 8. Change log

| when | change |
|---|---|
| 2026-11-15 08:12 | atlas generator created; Layers A/B/C/D measured across 80 entries |
| 2026-11-15 08:12 | `zela-glasses-guide` tri-surface repair (see §4.4) |
| 2026-11-15 08:53 | **Phase 2 wave 1 — Layer A remediation.** 9 entries: injected fleet-standard OpenGraph/Twitter + schema.org `@graph` (WebApplication + FAQPage) via `docs/tools/seo_alchemist.py`. 19 entries: widened `@type` to `["WebApplication","SoftwareApplication"]` in place via `docs/tools/ldtype_upgrade.py`. `wcag-contrast-guard`: `<button onclick="window.open">` support CTA → real anchor. `zoth-math-pillar`: added real Stripe anchor + full Solana address to footer. `zothnet` app templates: truncated Solana tip → full address, `rel="noopener noreferrer"`. Fleet probe now reports `layerA_gaps = 0/80`. |
| 2026-11-15 08:53 | **Scanner correctness repairs.** `find_entry()` now prefers the doc the repo actually serves/embeds (matches `//go:embed`, `res.sendFile`, `open("...html")`) then the largest doc — this withdrew the false `zothnet` "no web entry" flag; support-link detection is SPA-aware (`_stripe_in_sources()`); `<img>` alt counting ignores HTML/JS comments. |

