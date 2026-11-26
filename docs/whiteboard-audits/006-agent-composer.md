# Whiteboard Verification Audit — #006 `agent-composer` (Multi-Agent DAG Composer & Pipeline Foundry)

## 1. Header Metadata & 5-Level Scorecard

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#006` — `agent-composer` (**Multi-Agent DAG Composer & Pipeline Foundry**) |
| **Audit Mode** | Baseline (`v1`) read-only 5-level audit. Repo source files untouched (`git status` clean except audit docs). |
| **Audit Start (EST / UTC)** | `2026-11-25 23:08:18 EST` / `2026-11-26 04:08:18 UTC` |
| **Audit Completion (EST / UTC)** | `2026-11-25 23:12:44 EST` / `2026-11-26 04:12:44 UTC` |
| **Repo & Git State** | `~/NullAITech/zoth-studio-v2` (`main` @ `9bbb61b`, Studio Workstation — no standalone repo; `origin=https://github.com/NullAITech/zoth-studio-v2.git`, `personal=https://github.com/1nc0gn30/zoth-studio-v2.git`) |
| **Live Server Inspected** | `http://127.0.0.1:3000` (`server/serve.mjs`, PID `1573`, untouched) |
| **Live Loopback Services Observed** | `:3000` Studio (`200`), `:8094` Neuro-Memory (`200`), `:8102` Sovereign Agent Bridge (`200`), `:8136` Azoth Local Agent (`200`), `:8768` Signal Bridge (`200`), `:8787` Vault (`200`), `:11434` Ollama (`200`), `:18000` AGY-Hermes (`200`) |
| **Observed Versions (Drift)** | `2.2.0` (`package.json`, navbar `v2.2`) vs synthetic `v3.3.0` badge rendered on `/tools/agent-composer` (`RealToolWorkspacePage.jsx:335`) |
| **Automated Test Baseline** | `npm test` → **`37/37` routes hydrated, `0` console errors, `all serve checks passed`** (exit `0`), **but neither `/workstations/agent-composer` nor `/tools/agent-composer` is covered** |
| **Overall Verdict** | **`NEEDS FIX`** — **`3.70 / 10`** |

### 5-Level Verification Scorecard

| Level | Dimension | Score | Status | Primary Root Causes |
| :---: | :--- | :---: | :---: | :--- |
| **L1** | **System, Routing, APIs & Security** | **`3.6 / 10`** | `NEEDS FIX` | `App.jsx:101-105,187` redirects `/workstations/agent-composer` → `/tools/agent-composer` on hydration, orphaning `WorkstationDetailPage.jsx` (2,382 lines, `0` imports). Legacy `workstations.js:35` path `/studio/agent-composer.html` returns **`404`**. Zero DAG/composer/workflow/provider execution routes exist in `server/serve.mjs` or `server/studio-api.mjs` (`/api/composer/*`, `/api/workflows`, `/api/providers`, `/api/ollama`, `/api/hermes` soft-200 SPA HTML; `/api/studio/composer` & `/api/studio/workflows` → `404`). `/api/studio/agent/triad` returns **`500`** (wrong `CONDUCTOR_BIN` path, leaks absolute home path). `/api/studio/agent/dispatch` passes double-quoted JSON to `exec()` (`studio-api.mjs:650-652`). Redirect clobbers `<title>` with the homepage title and drops both `SoftwareApplication` and `FAQPage` from JSON-LD (`site.js:176-187,546-565`). CLI commands `zoth open` / `zoth run` do not exist in `bin/zoth.js`. |
| **L2** | **User & DAG Workflow Utility** | **`2.8 / 10`** | `NEEDS FIX` | Live user path (`/workstations` → `/workstations/agent-composer` → `/tools/agent-composer`) delivers **zero DAG composer utility** — `RealToolWorkspacePage.jsx:248` maps `'agent-composer'` to `AzothArchonGodModeTool` (a single-prompt Azoth `:8136` ReAct launcher with a `setTimeout(..., 400)` offline mock fallback and an invisible disabled submit button). Meanwhile, the orphaned `AgentComposerWorkstation` (`WorkstationDetailPage.jsx:53-212`) is a fake `setInterval(..., 900)` string logger with zero DAG edges, zero topological sort/cycle checks, zero real provider routing (Ollama/Hermes/AGY/Memory/Bridge), zero node edit/delete/reorder/prompts, zero JSON/YAML/Python export/import, and zero `localStorage` persistence. |
| **L3** | **Engineer & Code Quality** | **`3.4 / 10`** | `NEEDS FIX` | Split-brain dead code (`WorkstationDetailPage.jsx` completely unmounted; `RealToolWorkspacePage.jsx:248` stale alias to `AzothArchonGodModeTool`). `AgentComposerWorkstation` has an uncleaned `setInterval` leak + stale `nodes` closure (`:89-101`), colliding sequential IDs `String(nodes.length + 1)` (`:74`), hardcoded initial timestamps `[23:10:01]`/`[23:10:02]` (`:67-68`), broken `0${index + 1}` padding (`:139` → `010` at 10+ nodes), and fake `Math.random()` telemetry loop (`:2101-2112`). Double lazy-load waterfall (`WorkstationRedirect` → lazy `RealToolWorkspacePage` → lazy `AzothArchonGodModeTool`) causes cold-load `LOADING SPECIFICATION` stalls past `2.2 s`. Zero unit or route tests cover `agent-composer` or DAG graph logic. |
| **L4** | **UI, Visual & Accessibility** | **`4.8 / 10`** | `NEEDS FIX` | All captures pass `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, and Studio's Ivory/Obsidian outer shell is crisp. However, `AzothArchonGodModeTool` renders a hardcoded jet-black `#06070B` panel inside Editorial Ivory Light Mode (`deck-light-desktop.jpg`, `deck-light-mobile.jpg`), and `Dispatch Directive` turns dark-on-dark invisible while disabled (`deck-after-dispatch-desktop.jpg`). Four of six `capture.mjs` shots at `2,200 ms` stalled on `LOADING SPECIFICATION`. Mobile (`390×844`) has **`79 / 131` (60.3%)** interactive targets `<44 px`. Live page has `0` `<h2>` tags (`h1` → `h6` skip) and **`9 / 11`** unlabeled inputs; orphaned `WorkstationDetailPage.jsx:2214` lacks an `<h1>` entirely (`variant="h3"`) and uses a hardcoded `#0F172A` log box in Light Mode with no node-graph canvas. |
| **L5** | **Copy, Honesty & Documentation** | **`3.9 / 10`** | `NEEDS FIX` | Severe copy-vs-reality mismatch: hero claims *"Visual node-graph builder for orchestrating complex multi-agent execution pipelines"* + *"✓ Runs 100% in your browser — no local install or backend required"* directly above **`AZOTH LOCAL ARCHON ORCHESTRATOR · PORT :8136 ONLINE`**. `toolsDocumentation.js` has no `agent-composer` entry, falling back (`:3476-3516`) to phantom MCP tool `agent_composer_execute` and non-existent `zoth run agent-composer --input ./params.json`. `WorkstationDetailPage.jsx:2202,2219,2326-2331` claims *"verified hardware TRNG entropy"* and *"STRICT LOOPBACK :8094"* backed only by `Math.random()`. Version drift (`v2.2` vs `v3.3.0`), generic fallback motion anchor (*"Deterministic Sovereign Chronometer"*), and dead `/studio/agent-composer.html` path in `workstations.js:35`. |
| — | **Weighted Composite** | **`3.70 / 10`** | **`NEEDS FIX`** | **Fix all P0/P1 findings to build a real DAG Composer & Pipeline Foundry and reach `>= 9.0 / 10` across all 5 levels.** |

---

## 2. Test Roadmap & Execution Log

### 2.1 Level 1 — HTTP Routes, Studio APIs & Live Daemon Probes (`http://127.0.0.1:3000`)

| Probe | Observed Result |
| :--- | :--- |
| `GET /workstations/agent-composer` | `HTTP 200 OK`, `text/html; charset=utf-8`, `19,182 B`. Prerendered `<title>Multi-Agent DAG Composer & Pipeline Foundry // Zoth Studio Workstation</title>`, canonical `https://zoth.nullai.tech/workstations/agent-composer`, JSON-LD `@graph` with `SoftwareApplication` (no `FAQPage`). **Redirected client-side on hydration to `/tools/agent-composer`.** |
| `GET /workstations` | `HTTP 200 OK`, `text/html; charset=utf-8`, `32,668 B`. Catalog card renders `Multi-Agent DAG Composer & Pipeline Foundry` linking to `/workstations/agent-composer`. |
| `GET /studio/agent-composer.html` | **`HTTP 404 Not Found`**, `text/plain`, `9 B` (`Not found`). `public/studio/` and `dist/studio/` do not exist; `serve.mjs:48-49` treats `.html` as a missing asset. |
| `GET /tools/agent-composer` | `HTTP 200 OK`, `text/html; charset=utf-8`, `22,905 B` (SPA `dist/index.html` fallback — not prerendered under `/tools/agent-composer`). `<title>` is the generic Studio homepage title. |
| `GET /robots.txt` | `HTTP 200 OK`, `1,177 B`. Allows `*`, `Googlebot`, `Google-Extended`, `GPTBot`, `OAI-SearchBot`, etc., `Crawl-delay: 0`. |
| `GET /sitemap.xml` | `HTTP 200 OK`, `27,967 B`. Line `652` lists `<loc>https://zoth.nullai.tech/workstations/agent-composer</loc>`. |
| `GET /api/composer/status`, `/api/workflows`, `/api/providers`, `/api/ollama`, `/api/hermes` | All return **`HTTP 200 OK` with SPA `index.html`** (`serve.mjs:48-50` only routes `/api/studio/*` and `/api/swarm/*` to `studioMiddleware`, and non-dotted paths fall through to `index.html`). |
| `GET /api/studio/composer`, `/api/studio/workflows` | **`HTTP 404`** `{"error":"Unknown studio API route."}` (`studio-api.mjs:1049`). |
| `GET /api/studio/status` | `HTTP 200 OK` JSON: `memory (:8094) up:true`, `bridge (:8102) up:true`, `vault (:8787) up:true`, `ollama (:11434) up:true`. |
| `GET /api/studio/agent/triad` | **`HTTP 500`** `{"error":"Command failed: '~/NullAITech/bin/zoth-agent-conductor' agents --json\n"}` (actual response leaked the literal home-directory path; binary lives at `/usr/local/bin/zoth-agent-conductor`, not `~/NullAITech/bin/`). |
| `POST /api/studio/agent/dispatch` (`Origin: https://evil.example`) | **`HTTP 403 Forbidden`** `{"error":"Cross-origin request blocked."}` ✅ (`studio-api.mjs:445-448`). |
| Live local daemons (direct `curl` on `127.0.0.1`) | `:8094/health` → `200` (`neuro-memory-daemon`); `:11434/api/tags` → `200` (Ollama, e.g. `hermes3-64k:latest`); `:18000/health` → `200` (`models_count: 6`); `:8768/health` → `200` (`zoth-signal-bridge`); `:8136/health` (`Origin: http://127.0.0.1:3000`) → `200` (`azoth-local-agent`, `ACAO: http://127.0.0.1:3000`, `Vary: Origin`). |

### 2.2 Level 1 — CLI & Binary Parity Check

| Command / Surface | Observed Result |
| :--- | :--- |
| `which -a zoth zoth-studio` | `/usr/local/bin/zoth` and `/usr/local/bin/zoth-studio` present on `PATH` (duplicated `PATH` entries; `studio root /opt/zoth-studio`). |
| `zoth open agent-composer --help` | Exits `0` and prints the generic `Zoth CLI` help banner (`doctor`, `list`, `pull`, `up`, `down`, `swarm`). **No `open` subcommand exists** (`bin/zoth.js:337-358`). |
| `zoth run agent-composer --air-gap` | Exits `0` and prints the generic `Zoth CLI` help banner. **No `run` subcommand or `--air-gap` flag exists.** |
| `which -a agent-composer` | Not found (`exit 1`). No standalone CLI binary exists for `agent-composer`. |
| `which -a azoth zoth-agent-conductor` | `~/.local/bin/azoth`, `/usr/local/bin/azoth`, and `/usr/local/bin/zoth-agent-conductor` exist (confirming `studio-api.mjs:13` looks in the wrong folder for `zoth-agent-conductor`). |

### 2.3 Level 2 — Interactive CDP Workflow Verification (`/workstations/agent-composer`)

Executed via headless Chrome CDP (`/tmp/whiteboard-audit-006/cdp_probe.mjs`, results saved to `/tmp/whiteboard-audit-006/cdp_probe_results.json`):

| Scenario | Observed DOM & Network Result |
| :--- | :--- |
| Navigate to `/workstations/agent-composer?theme=light` | `location.href` immediately redirects to `http://127.0.0.1:3000/tools/agent-composer?theme=light`. `hasDagTopology: false`, `hasAzothArchon: true`, `hasPort8136Online: true`, `hasStrictLoopback8094: false`. Network hits: `/workstations/agent-composer?theme=light (200)`, `/api/studio/reality (200)`, `http://127.0.0.1:8136/health (200)`. |
| Document `<title>` & JSON-LD after hydration | `document.title` overwritten to `"Zoth Studio // 85 Sovereign Open-Access Tools, Pantheon Matrix & Local AI Studio"`. `canonical` updates to `https://zoth.nullai.tech/tools/agent-composer`. JSON-LD `@graph` contains `['Person','WebSite','Organization',['WebApplication','SoftwareApplication'],'WebPage','BreadcrumbList']` — **both workstation `SoftwareApplication` and `FAQPage` are missing**. |
| Runtime strip vs interactive deck | Strip reads `"✓ Runs 100% in your browser — no local install or backend required"`; deck immediately below reads `"AZOTH LOCAL ARCHON ORCHESTRATOR · PORT :8136 ONLINE"` with `"Open :8136 Cockpit"`. |
| Click `Hermes` subagent chip + `Dispatch Directive` | Canvas active node switches to `Hermes Agent CLI (:8099)` (`deck-after-dispatch-desktop.jpg`). Clicking `Dispatch Directive` sets `executing=true`, **rendering the disabled button dark-on-dark invisible** against `#080A12` while `POST http://127.0.0.1:8136/api/chat` is pending (and falls back to a fake `setTimeout(..., 400)` mock response on any error/offline condition at `AzothArchonGodModeTool.jsx:218-234`). |
| `/workstations` catalog card | Card found: `BUILD · STUDIO MODULE · Multi-Agent DAG Composer & Pipeline Foundry`, `href="/workstations/agent-composer"`, clone strip `git clone https://github.com/NullAITech/zoth-studio-v2.git`. |
| Orphaned `AgentComposerWorkstation` code walk (`WorkstationDetailPage.jsx:53-212`) | Unreachable via router. Static inspection confirms: `handleRunPipeline` (`:85-102`) runs `setInterval(..., 900)` emitting canned `[NODE-${step}] Node ${nodes[step - 1]?.name} successfully executed.`, never calls `fetch`, never cleans up `interval` on unmount, closes over stale `nodes`, has no edges/DAG model/validation/edit/delete/export/import, and keeps state in memory only (`useState`, lost on reload). |

### 2.4 Level 3 — Automated Test Baseline (`npm test`)

Command: `cd ~/NullAITech/zoth-studio-v2 && npm test` (exit `0`):
- `registry-check.py`, `test-arsenal.mjs`, `test-ground-truth.mjs`, and `test-serve.mjs` + `test-routes.mjs` all passed (`37/37` routes hydrated, `0` console errors).
- **Coverage gap:** `test-routes.mjs` checks `/workstations/cockpit` and `/workstations/mission-control`, **not `/workstations/agent-composer` or `/tools/agent-composer`**. Zero unit tests exist for DAG topological sort, cycle detection, node CRUD, or workflow import/export.

### 2.5 Level 4 — Screenshot Evidence (All 16 `.jpg` Captures Visually Inspected via `read_file`)

| Surface & Mode | Mobile (`390×844`) | Tablet (`820×1180`) | Desktop (`1440×900`) | Observed Stats & Visual Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/workstations/agent-composer?theme=light` (`capture.mjs`, `2200 ms`) | `/tmp/whiteboard-audit-006/ws-light/workstations_agent-composer_mobile.jpg` (**stalled on `LOADING SPECIFICATION`**) | `/tmp/whiteboard-audit-006/ws-light/workstations_agent-composer_tablet.jpg` (shows dark Azoth card inside light Ivory page) | `/tmp/whiteboard-audit-006/ws-light/workstations_agent-composer_desktop.jpg` (hero rendered; `v3.3.0`, `IN-BROWSER`) | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 137`, `textLength: 7950–8149` |
| `/workstations/agent-composer?theme=dark` (`capture.mjs`, `2200 ms`, `--dark`) | `/tmp/whiteboard-audit-006/ws-dark/workstations_agent-composer_mobile.jpg` (**stalled on `LOADING SPECIFICATION`**) | `/tmp/whiteboard-audit-006/ws-dark/workstations_agent-composer_tablet.jpg` (**stalled on `LOADING SPECIFICATION`**) | `/tmp/whiteboard-audit-006/ws-dark/workstations_agent-composer_desktop.jpg` (**stalled on `LOADING SPECIFICATION`**) | `overflowPx: 0`, `errors: []`, `buttons: 78`, `textLength: 1022–1133` (cold lazy-load waterfall > 2.2 s) |
| `/workstations` Light (`capture.mjs`) | `/tmp/whiteboard-audit-006/ws-light/workstations_mobile.jpg` | `/tmp/whiteboard-audit-006/ws-light/workstations_tablet.jpg` | `/tmp/whiteboard-audit-006/ws-light/workstations_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 229` |
| `/workstations` Dark (`capture.mjs`, `--dark`) | `/tmp/whiteboard-audit-006/ws-dark/workstations_mobile.jpg` | `/tmp/whiteboard-audit-006/ws-dark/workstations_tablet.jpg` | `/tmp/whiteboard-audit-006/ws-dark/workstations_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 229` |
| Interactive hydrated Light (`cdp_probe.mjs`) | `/tmp/whiteboard-audit-006/interactive/deck-light-mobile.jpg` (black Azoth card inside Ivory page) | — | `/tmp/whiteboard-audit-006/interactive/deck-light-desktop.jpg`, `/tmp/whiteboard-audit-006/interactive/deck-after-dispatch-desktop.jpg` (**invisible disabled Dispatch button**) | Mobile `<44 px` targets: **`79 / 131` (60.3%)**; `unlabeledInputs: 9 / 11`; `h2Count: 0` |
| Interactive hydrated Dark (`cdp_probe.mjs`) | `/tmp/whiteboard-audit-006/interactive/hero-dark-mobile.jpg` (clean dark hero; CLI string scrolls horizontally) | — | `/tmp/whiteboard-audit-006/interactive/hero-dark-desktop.jpg`, `/tmp/whiteboard-audit-006/interactive/deck-dark-desktop.jpg` | Mobile `<44 px` targets: **`79 / 131` (60.3%)**; `unlabeledInputs: 9 / 11`; `h2Count: 0` |

---

## 3. 5-Level Deep Findings (`file:line`)

### L1 — System, Routing, APIs & Security
1. **Workstation route hijacked; `WorkstationDetailPage.jsx` is orphaned dead code (P0).** `src/App.jsx:101-105,187` routes `/workstations/:workstationId` to `<WorkstationRedirect />`, immediately issuing `<Navigate to="/tools/${workstationId}..." replace />`. A repo-wide grep shows `WorkstationDetailPage.jsx` (2,382 lines) is imported nowhere in `src/`.
2. **Dead legacy workstation path (P1).** `src/data/workstations.js:35` declares `path: "/studio/agent-composer.html"`, which returns `HTTP 404 Not Found` (`9 B`) on `:3000` because neither `public/studio/` nor `dist/studio/` exists.
3. **Zero DAG execution or provider discovery APIs in `server/studio-api.mjs` (P0).** `server/serve.mjs:42-51` and `server/studio-api.mjs:435-1053` expose zero endpoints for `/api/studio/composer/*`, `/api/studio/workflows/*`, `/api/studio/providers`, or Ollama/Hermes DAG step dispatch (only `/api/studio/bot/chat` hardcoded to `qwen2.5-coder:1.5b` at `:533` and `/api/studio/adytum` at `:824`). Unmatched `/api/*` paths outside `/api/studio` and `/api/swarm` silently return `200 text/html` (`index.html`).
4. **Broken `/api/studio/agent/triad` (`HTTP 500`) + path leak + shell interpolation footgun (P1).** `server/studio-api.mjs:13` defaults `CONDUCTOR_BIN` to `path.join(NULLAITECH_ROOT, 'bin', 'zoth-agent-conductor')`, which does not exist (actual binary is `/usr/local/bin/zoth-agent-conductor`), returning `HTTP 500` with the literal absolute filesystem path in JSON. At `server/studio-api.mjs:650-652`, `/api/studio/agent/dispatch` passes `JSON.stringify(promptText)` and `JSON.stringify(dirPath)` inside double-quoted shell arguments to `child_process.exec()`, which permits `$(...)` / backtick shell expansion by any local caller (use `execFile` / `spawn` with an argv array instead).
5. **Non-existent CLI commands advertised (P1).** `WorkstationDetailPage.jsx:2248,2268` advertises `zoth open agent-composer` and `zoth run agent-composer --air-gap`, and `toolsDocumentation.js:3489` advertises `zoth run agent-composer --input ./params.json`. `bin/zoth.js:337-358` implements none of `open`, `run`, or `--air-gap` (silently printing help and exiting `0`).
6. **Client-side redirect destroys route SEO & Schema.org graph (P1).** Prerendered `/workstations/agent-composer` has accurate `<title>`, `canonical`, and `SoftwareApplication` (`site.js:190-201,566-583`), though still no `FAQPage`. After `<WorkstationRedirect />` navigates to `/tools/agent-composer`, `site.js:176-187,546-565` searches only `microTools` (missing `workstations`), overwriting `document.title` with the Studio homepage title and dropping `SoftwareApplication` and `FAQPage` from JSON-LD.

### L2 — User & DAG Workflow Utility
1. **Live route renders the wrong tool — zero DAG composer exists (P0).** `RealToolWorkspacePage.jsx:248` aliases `'agent-composer': AzothArchonGodModeTool`. Users clicking **Multi-Agent DAG Composer & Pipeline Foundry** on `/workstations` land on **Azoth Local Archon Orchestrator** (`AzothArchonGodModeTool.jsx`), a single-prompt `:8136` directive form with an orbiting hub animation and a fake `setTimeout(..., 400)` mock fallback (`:218-234`) when `:8136` is unreachable.
2. **Orphaned `AgentComposerWorkstation` is a fake `setInterval` simulation (P0).** `WorkstationDetailPage.jsx:85-102` runs `setInterval(..., 900)` emitting canned `[NODE-${step}] Node ${nodes[step - 1]?.name} successfully executed.` strings. It performs zero real LLM/agent/tool execution, zero DAG edge modeling, zero topological sort or cycle detection, zero node prompt/model/role/condition configuration, zero node edit/delete/reorder controls, zero JSON/YAML/Python workflow export/import, and zero `localStorage` persistence (all added stages disappear on reload).
3. **Silent failure / invisible pending state during live dispatch (P1).** In `AzothArchonGodModeTool.jsx:524-540`, clicking `Dispatch Directive` sets `executing=true`, which leaves the MUI disabled button visually dark-on-dark (`deck-after-dispatch-desktop.jpg`) with no cancel/abort control (`AbortController` missing) while `:8136/api/chat` runs.

### L3 — Engineer & Code Quality
1. **`setInterval` memory leak & stale closure (P0).** `WorkstationDetailPage.jsx:89-101` creates `const interval = setInterval(...)` without storing the timer ID in a `useRef` or cleaning it up in a `useEffect` unmount teardown. Because `handleAddNode` (`:71-83`) is not disabled during execution and `interval` closes over the render-time `nodes` array (`:91,95,99`), adding a node mid-run desynchronizes `step <= nodes.length` and logs stale node names.
2. **Colliding node IDs & broken label padding (P1).** `WorkstationDetailPage.jsx:74` assigns `id: String(nodes.length + 1)` (collides as soon as node deletion is added; use `crypto.randomUUID()` or a monotonic counter ref). Line `:139` formats step badges as `` `0${index + 1}` ``, producing `010`, `011` at 10+ nodes (use `String(index + 1).padStart(2, '0')`).
3. **Hardcoded timestamps & fake telemetry loop (P1).** `WorkstationDetailPage.jsx:67-68` hardcodes `[23:10:01]` and `[23:10:02]` in the initial `execLog`. Lines `:2092-2112` run a `2,200 ms` `Math.random()` interval fabricating IPC latency (`0.18–0.30 ms`), throughput (`2.1–2.8 MB/s`), TRNG entropy (`7.986–7.997`), and incrementing packet counts for `:8094` without ever querying `:8094`.
4. **Synthetic workstation metadata & wrong GitHub org default (P1).** `RealToolWorkspacePage.jsx:321-338` invents `version: '3.3.0'` (`:335`, contradicting `package.json` `2.2.0`) and `github: 'https://github.com/NullAITech/zoth-studio-v2'` (`:330`, whereas personal attribution links point to `1nc0gn30`).
5. **Cold-load double lazy waterfall (P1).** Navigating to `/workstations/agent-composer` executes `<WorkstationRedirect />` → lazy `RealToolWorkspacePage` → lazy `AzothArchonGodModeTool`, stalling on `LOADING SPECIFICATION` past `2,200 ms` in 4 of 6 `capture.mjs` runs (`ws-light` mobile + all 3 `ws-dark` viewports).
6. **Zero test coverage for `agent-composer` or DAG engine (P1).** `scripts/test-routes.mjs` omits `/workstations/agent-composer` and `/tools/agent-composer`, and the repo has no unit tests for DAG graph validation, topological execution, cycle rejection, or persistence.

### L4 — UI, Visual & Accessibility
1. **Hardcoded obsidian deck in Editorial Ivory Light Mode (P0).** `AzothArchonGodModeTool.jsx:278,287,407,433,466,635` hardcodes `#06070B`, `#0A0D16`, `#05060B`, `#080A12` with zero `theme.palette.mode` awareness, creating a jarring black slab in Light Mode (`deck-light-desktop.jpg`, `deck-light-mobile.jpg`). Similarly, `WorkstationDetailPage.jsx:193` hardcodes `bgcolor: '#0F172A'` for the log terminal in Light Mode.
2. **No visual node-graph canvas (P0).** Neither the live rendered `AzothArchonGodModeTool` (decorative spinning star hub) nor the orphaned `AgentComposerWorkstation` (4 flat stacked `<Paper>` rows) provides an actual interactive DAG canvas with directed edges, port connections, node selection, or step I/O inspection.
3. **Invisible disabled submit button (P1).** `AzothArchonGodModeTool.jsx:524-540` does not override `&.Mui-disabled`, so `Dispatch Directive` disappears against `#080A12` when `executing === true` (`deck-after-dispatch-desktop.jpg`).
4. **Mobile tap targets `<44 px` (P1).** On `390×844` mobile (`mobile_light` and `mobile_dark`), **`79 / 131` (60.3%)** interactive elements fail the 44 px minimum target height (including `All 85 Repositories` 37 px, `Copy CLI` 37 px, `Open Interactive Deck` 42 px, `Open :8136 Cockpit` 38 px, `Pause Orbit` 38 px, `Copy azoth CLI` 36 px, and all 7 subagent buttons at 36 px).
5. **Heading hierarchy & unlabeled form controls (P1).** Live `/tools/agent-composer` has `1` `<h1>`, **`0` `<h2>`** (skipping heading levels), and **`9 / 11` unlabeled inputs** (directive `<textarea>`, concurrency `<input type="range">`, plus shared workbench/footer inputs). Orphaned `WorkstationDetailPage.jsx:2214` renders the title as `Typography variant="h3"` (no `<h1>` on page), and both `TextField` controls at `:162-180` lack `label` / `aria-label`.
6. **Verified clean invariants:** `overflowPx === 0`, `consoleErrors.length === 0`, and `imgsMissingAlt === 0` across every inspected viewport and theme.

### L5 — Copy, Honesty & Documentation
1. **Direct contradiction on the live page (P0).** Above the fold, the page promises *"Multi-Agent DAG Composer & Pipeline Foundry — Visual node-graph builder for orchestrating complex multi-agent execution pipelines"* and *"✓ Runs 100% in your browser — no local install or backend required"*, then immediately renders **`AZOTH LOCAL ARCHON ORCHESTRATOR · PORT :8136 ONLINE`** with Azoth `:8136` documentation (`AzothArchonGodModeTool.jsx:638-672`).
2. **Boilerplate fallback docs invent phantom MCP & CLI contracts (P1).** `src/data/toolsDocumentation.js` has no `agent-composer` key; `getToolDocumentation()` (`:3476-3516`) fabricates `mcpTool: "agent_composer_execute"`, `cliExample: "zoth run agent-composer --input ./params.json"`, and claims *"Standalone modular repository architecture"* (false — it is a Studio-native module with no standalone repo).
3. **Fabricated hardware/enclave telemetry copy (P1).** `WorkstationDetailPage.jsx:2202,2219,2326-2331` asserts *"STRICT LOOPBACK :8094"*, *"verified hardware TRNG entropy"*, *"loopback inter-process messaging"*, and *"deterministic zero-telemetry execution"*, none of which are performed by `AgentComposerWorkstation`.
4. **Generic motion showcase & version drift (P2).** `ToolMotionShowcase.jsx` has no `agent-composer` entry in `TOOL_MOTION_OVERRIDES`, falling back to *"Deterministic Sovereign Chronometer"* (`:140`). Navbar shows `v2.2` while the synthetic workstation chip displays `v3.3.0`. Breadcrumb reads `← All 85 Repositories` instead of returning to `/workstations`.

---

## 4. Prioritized Fix Backlog (`v2` Remediation Plan)

### P0 — Blockers
| # | Fix | Target Location |
| :-: | :--- | :--- |
| **P0-1** | **Build a real dedicated `AgentComposerGodModeTool` (Visual Multi-Agent DAG Composer & Pipeline Foundry)** and bind `'agent-composer'` to it (replacing the stale `AzothArchonGodModeTool` alias). Include: interactive SVG/Canvas directed node-graph editor (add/edit/delete/drag nodes, add/remove directed edges, port badges), Kahn's topological sort + DFS cycle detection, per-node provider/model/prompt/role/template variables (`{{prev.output}}`), live execution engine (real local provider dispatch via Studio API → Ollama `:11434` / AGY-Hermes `:18000` / Neuro-Memory `:8094`, PLUS honest deterministic in-browser dry-run/transform mode when offline — never silent fake success), `AbortController` cancel, `localStorage` persistence, and JSON / YAML / Python workflow import & export. | `src/components/tools/AgentComposerGodModeTool.jsx` (new), `src/pages/RealToolWorkspacePage.jsx:248` |
| **P0-2** | **Add real loopback DAG & provider execution API endpoints in `server/studio-api.mjs`**: `GET /api/studio/composer/providers` (probes Ollama `:11434` models, AGY-Hermes `:18000`, Neuro-Memory `:8094`, Bridge `:8102`, Signal `:8768`), `POST /api/studio/composer/step` (executes one DAG node against selected local provider with `isLocalRequest(req)` guard, timeout, and structured `{ ok, provider, model, output, durationMs, error }`). Return JSON `404` for unknown `/api/*` paths instead of SPA HTML where appropriate. | `server/studio-api.mjs`, `server/serve.mjs` |
| **P0-3** | **Resolve route & dead-code split-brain**: Either retire/clean up orphaned `WorkstationDetailPage.jsx` or clearly unify workstation routing so `/workstations/agent-composer` renders the real DAG Composer cleanly without clobbering `<title>`, `canonical`, or JSON-LD `@graph`. | `src/App.jsx:101-105,187`, `src/pages/WorkstationDetailPage.jsx`, `src/config/site.js:176-201,546-583` |
| **P0-4** | **Full Editorial Ivory Light + Obsidian Dark theme parity** on the new `AgentComposerGodModeTool` (zero hardcoded `#06070B` / `#0F172A` surfaces in Light Mode) and fix `AzothArchonGodModeTool` disabled-button contrast (`&.Mui-disabled`). | `src/components/tools/AgentComposerGodModeTool.jsx`, `src/components/tools/AzothArchonGodModeTool.jsx:524-540` |

### P1 — Must Fix for `>= 9.0 / 10`
| # | Fix | Target Location |
| :-: | :--- | :--- |
| **P1-1** | **Fix `server/studio-api.mjs` conductor path & shell safety**: resolve `zoth-agent-conductor` via `/usr/local/bin/zoth-agent-conductor` fallback (stop `500` on `/api/studio/agent/triad`, stop leaking absolute home paths in errors), and replace `exec()` string interpolation in `/api/studio/agent/dispatch` (`:650-652`) with `execFile()` argv array. | `server/studio-api.mjs:13,628-664` |
| **P1-2** | **Fix SEO/AEO on `/tools/agent-composer` & `/workstations/agent-composer`**: have `getRouteMeta('/tools/:id')` and `generateSchemaGraph('/tools/:id')` fall back to `workstations` when `id` is not in `microTools`, and include a dedicated `FAQPage` (3 concrete Q&As on DAG execution, local provider privacy, and open-access usage) plus `SoftwareApplication` with accurate `version: '2.2.0'`. | `src/config/site.js:176-201,451-583`, `scripts/prerender.mjs` |
| **P1-3** | **Fix `workstations.js:35` dead path & `toolsDocumentation.js` truth pass**: update `workstations.js:35` (remove or redirect dead `/studio/agent-composer.html`), add an explicit `'agent-composer'` documentation entry in `src/data/toolsDocumentation.js` describing actual DAG mechanics, real API/CLI commands, and honest hybrid runtime (`executionType: 'hybrid'` — client-side DAG editor + optional local loopback provider execution). | `src/data/workstations.js:33-40`, `src/data/toolsDocumentation.js`, `src/pages/RealToolWorkspacePage.jsx:321-338` |
| **P1-4** | **Fix CLI parity (`bin/zoth.js`)**: implement `zoth open <id>` (prints/opens canonical Studio URL) or update every UI CLI chip & doc snippet to reference only commands that genuinely execute in `bin/zoth.js`. | `bin/zoth.js:324-358`, `src/data/toolsDocumentation.js` |
| **P1-5** | **Fix accessibility, headings & mobile tap targets**: add proper `<h2>` section headings (no `h1` → `h6` skip), associate explicit `<label>` / `aria-label` on every composer input/select/slider/textarea, enforce `minHeight: 44` / `minWidth: 44` on all mobile (`390×844`) interactive controls in the composer and tool workspace shell, and eliminate the cold-load `LOADING SPECIFICATION` stall (>2.2 s). | `src/components/tools/AgentComposerGodModeTool.jsx`, `src/pages/RealToolWorkspacePage.jsx` |
| **P1-6** | **Add automated unit + route tests**: extract pure DAG engine (`src/utils/dagEngine.js`: topological sort, cycle detection, variable interpolation, JSON/YAML/Python serialization) with Node test suite (`node --test`), plus add `/workstations/agent-composer` and `/tools/agent-composer` to `scripts/test-routes.mjs` and API checks to `scripts/test-serve.mjs`. | `src/utils/dagEngine.js` (new), `scripts/test-dag-engine.mjs` (new), `scripts/test-routes.mjs`, `scripts/test-serve.mjs` |

### P2 — Polish
| # | Fix | Target Location |
| :-: | :--- | :--- |
| **P2-1** | Add a dedicated `'agent-composer'` entry in `TOOL_MOTION_OVERRIDES` (`ToolMotionShowcase.jsx`) with a DAG topology anchor shape instead of *"Deterministic Sovereign Chronometer"*. | `src/components/tools/ToolMotionShowcase.jsx:53-65` |
| **P2-2** | Fix breadcrumb on workstation-backed `/tools/:id` routes (`← Back to Workstations` alongside `All Repositories`) and unify the synthetic version badge to `v2.2.0` (matching `package.json`). | `src/pages/RealToolWorkspacePage.jsx:335,553-569` |
| **P2-3** | Reconcile footer count drift (`79 Public GitHub Repos` link vs `82 public GitHub repos` copy visible in `ws-dark` captures). | `src/components/Footer.jsx` |

---

## 5. AGY Perspective

**Feedback.** The biggest finding in `#006` wasn't obvious from reading `WorkstationDetailPage.jsx` alone: the live router (`App.jsx:187`) completely bypasses `WorkstationDetailPage.jsx` and redirects `/workstations/agent-composer` to `/tools/agent-composer`, where a stale alias (`RealToolWorkspacePage.jsx:248`) silently swaps in `AzothArchonGodModeTool`. As a result, `agent-composer` suffers a double failure: the live route doesn't show a DAG composer at all, and the orphaned `AgentComposerWorkstation` behind it is a 160-line `setInterval` mock with leaks and zero graph semantics. Because the host already runs real local Ollama (`:11434`), AGY-Hermes (`:18000`), Neuro-Memory (`:8094`), and Bridge (`:8102`) daemons, the `v2` pass can wire a genuine, deterministic multi-agent DAG foundry in one clean vertical slice.

**Enhancements.**
- **Pure `dagEngine.js` core** shared between UI and tests: Kahn's topological sort with parallel execution layers (waves), explicit cycle path reporting, `{{nodeId.output}}` mustache template interpolation, and deterministic dry-run vs live-provider execution modes.
- **Interactive SVG node-graph canvas** with Bézier directed edges, animated active-edge pulse during execution, click-to-connect ports, auto-layout (layered Sugiyama columns), and 3 built-in real templates (*Code Review & Security Audit DAG*, *Research → Memory Sync → Brief DAG*, *Multi-Model Consensus Triangulation DAG*).
- **One-click real exports:** Export any composed DAG as portable **JSON**, **GitHub Actions / Zoth YAML**, or a standalone runnable **Python (`urllib` / Ollama) script** that executes the exact same topological waves locally from the terminal.

**Appreciation.** The surrounding Studio infrastructure is already strong: `server/serve.mjs` cleanly blocks cross-origin writes (`403 Forbidden`), `robots.txt` / `sitemap.xml` / `netlify.toml` headers are well-structured, `overflowPx === 0` and `consoleErrors === 0` hold across all viewports, and all core loopback daemons (`:8094`, `:8102`, `:8787`, `:11434`, `:18000`) are healthy and ready to back a real DAG execution bridge in `v2`.

---

## 6. v2 Remediation & Re-Audit Verification

| Field | Value |
| :--- | :--- |
| **Remediation Start (EST / UTC)** | `2026-11-25 23:16:47 EST` / `2026-11-26 04:16:47 UTC` |
| **Remediation Completion (EST / UTC)** | `2026-11-25 23:36:46 EST` / `2026-11-26 04:36:46 UTC` |
| **Live Server Reloaded** | `zoth-studio.service` (`active`, serving `~/NullAITech/zoth-studio-v2/server/serve.mjs --port 3000`, synced `dist/` + `server/` to `/opt/zoth-studio/`) |
| **Automated Test Gate (`npm test`)** | **100% PASS** — `registry-check.py` (85 tools, 43 workstations, 0 collisions), `test-dag-engine.mjs` (`8/8`), `test-arsenal.mjs` (`85/85`), `test-ground-truth.mjs` (`12/12`), `test-serve.mjs` (all API/CSRF/404 checks + `test-routes.mjs` **`39/39`** routes hydrated, **`0`** console errors) |
| **Secrets Scan (`bash tools/scan-secrets.sh`)** | **`0 leaks`** (Gitleaks clean; zero literal home paths) |
| **Final v2 Verdict** | **`PASS`** — **`9.52 / 10`** (`+5.82` over v1 baseline `3.70 / 10`) |

### Before / After 5-Level Scorecard

| Level | Dimension | Baseline (`v1`) | Post-Remediation (`v2`) | Delta | Verified Evidence |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **L1** | **System, Routing, APIs & Security** | `3.6 / 10` | **`9.6 / 10`** | `+6.0` | Added `GET /api/studio/composer/providers` (`200` JSON: Ollama 16 models, AGY-Hermes 6 models, Azoth `:8136`, Neuro-Memory `:8094`, Bridge `:8102`, Transform, + 4 CLI binaries via safe `fs.existsSync`) and `POST /api/studio/composer/step` (`403` cross-origin, `200` live verified against `transform`, `neuro-memory`, and `ollama` `qwen2.5:0.5b`). Fixed `CONDUCTOR_BIN` lookup (`/usr/local/bin/zoth-agent-conductor`, `/api/studio/agent/triad` `200`, sanitized `~/` paths), replaced `exec()` with `execFile()` argv array in `/api/studio/agent/dispatch`, returned JSON `404` for unknown `/api/*` in `server/serve.mjs`. Mounted `/workstations/:workstationId` directly in `src/App.jsx` (no redirect clobber); both `/workstations/agent-composer` and `/tools/agent-composer` emit accurate `<title>`, `SoftwareApplication` (`v2.2.0`), and `FAQPage` (3 Q&As). Fixed dead path in `src/data/workstations.js:35` and implemented `zoth open agent-composer [--json]` in `bin/zoth.js`. |
| **L2** | **User & DAG Workflow Utility** | `2.8 / 10` | **`9.6 / 10`** | `+6.8` | Built zero-dependency `src/utils/dagEngine.js` (DFS cycle detection with exact cycle path, Kahn topological parallel waves, `{{input}}` & `{{nodeId.output}}` interpolation without `eval`, 4 deterministic JS transforms, Sugiyama barycenter auto-layout, JSON/YAML/runnable Python 3 export + validated JSON import) and dedicated `src/components/tools/AgentComposerGodModeTool.jsx` bound to `'agent-composer'` in `src/pages/RealToolWorkspacePage.jsx`. Retired the orphaned `AgentComposerWorkstation` `setInterval` mock in `src/pages/WorkstationDetailPage.jsx`. Verified interactively via headless Chrome CDP: 4→5 node addition persists across reload (`localStorage`), live Neuro-Memory step completes (`513–698ms`), live Ollama step completes (`200 OK`), and JSON/YAML/Python exports validate. |
| **L3** | **Engineer & Code Quality** | `3.4 / 10` | **`9.5 / 10`** | `+6.1` | Removed all `setInterval` leaks, stale closures, colliding IDs (`crypto.randomUUID()`), fake `Math.random()` loops, and double-lazy `LOADING SPECIFICATION` / `<Suspense>` spinner stalls. Fixed cross-port `:8141` CORS noise via `/api/studio/swarm/mux-status`. Added `scripts/test-dag-engine.mjs` (`8/8` pass, wired into `npm test`), added `/workstations/agent-composer` & `/tools/agent-composer` assertions to `scripts/test-routes.mjs` (`39/39` pass), and added composer/triad/404 API checks to `scripts/test-serve.mjs`. Unified synthetic version badge to `v2.2.0` (`package.json` parity). |
| **L4** | **UI, Visual & Accessibility** | `4.8 / 10` | **`9.4 / 10`** | `+4.6` | Full dual-theme Editorial Ivory Light (`#FAF7F0` / `#FFFFFF` / `#F5F1E8` parchment consoles, `#1C1917` espresso ink, `#9A7209` bronze-gold — zero dark slabs in Light Mode) and Obsidian Dark (`#090B10` / `#121621` / `#D4AF37` gold), visually inspected via `read_file` across 11 `.jpg` captures (`mobile`/`tablet`/`desktop` Light & Dark + interactive post-run canvas/outputs). Fixed `AzothArchonGodModeTool` disabled button contrast (`&.Mui-disabled`). Proper `h1 → h2 → h3` hierarchy (`h1:1, h2:4, h3:6`), `0` unlabeled composer fields, **`33 / 33` (100%) `>= 44px` mobile tap targets** inside the DAG Composer (page-wide `<44px` reduced from `60.3%` to `19.5%`), `overflowPx: 0`, `imgsMissingAlt: 0`, `errors: []`. |
| **L5** | **Copy, Honesty & Documentation** | `3.9 / 10` | **`9.5 / 10`** | `+5.6` | Honest `HYBRID` runtime banner matching browser DAG + `127.0.0.1` loopback architecture. Added dedicated `'agent-composer'` documentation in `src/data/toolsDocumentation.js` (real `/api/studio/composer/*` endpoints, live provider matrix, real `zoth open agent-composer` CLI — zero phantom MCP tools or fabricated TRNG telemetry). Added `'agent-composer'` (`Topological DAG Wave Lattice`) in `src/components/tools/ToolMotionShowcase.jsx`, `← Workstations` breadcrumb in `RealToolWorkspacePage.jsx`, and reconciled `82 Public GitHub Repos` in `src/components/Footer.jsx`. |
| — | **Weighted Composite** | **`3.70 / 10`** | **`9.52 / 10`** | **`+5.82`** | **All 5 levels `>= 9.0 / 10` — `PASS`.** |

### Verified Live Probes & Visual Evidence (`v2`)
- **Live Loopback APIs (`http://127.0.0.1:3000`)**:
  - `GET /api/studio/composer/providers` → `HTTP 200` (`ollama: 16 models`, `agy-hermes: 6 models`, `azoth: up`, `neuro-memory: up`, `sovereign-bridge: up`, `transform: up`, `cli: hermes/agy/codex/claude detected: true`).
  - `POST /api/studio/composer/step` (`Origin: https://evil.example`) → `HTTP 403` (`{"error":"Cross-origin request blocked."}`).
  - `POST /api/studio/composer/step` (`transform` / `json-validate`) → `HTTP 200` (`ok: true`, `1ms`).
  - `POST /api/studio/composer/step` (`neuro-memory`) → `HTTP 200` (`ok: true`, live STDP engrams).
  - `POST /api/studio/composer/step` (`ollama` / `qwen2.5:0.5b`) → `HTTP 200` (`ok: true`, `output: "VERIFIED"`, `7180ms`).
  - `GET /api/studio/agent/triad` → `HTTP 200` (sanitized `~/` paths, zero `500` or `/home/` leaks).
  - `GET /api/nonexistent-check` → `HTTP 404` (`application/json`, `{"error":"Unknown API route."}`).
- **CLI Parity**: `zoth open agent-composer --json` → `exit 0`, returns canonical `http://127.0.0.1:3000/workstations/agent-composer` and `https://zoth.nullai.tech/workstations/agent-composer`.
- **Visual Captures Inspected via `read_file` (`/tmp/whiteboard-audit-006-v2/`)**:
  - Triple-viewport Light & Dark (`390×844`, `820×1180`, `1440×900`): `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 131–158`, `textLength: 11,249–13,213`, zero spinner/stall frames.
  - Interactive Post-Run Canvas & Outputs (`composer-canvas-light-desktop.jpg`, `composer-outputs-light-desktop.jpg`, `composer-postrun-dark-desktop.jpg`, `composer-outputs-dark-desktop.jpg`): crisp SVG Bézier graph, live emerald `COMPLETED` badges, warm Ivory parchment outputs, and runnable Python 3 / JSON / YAML exports.
