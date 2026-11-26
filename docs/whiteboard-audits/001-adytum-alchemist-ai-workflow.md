# Whiteboard Verification Audit — #001 `adytum-alchemist-ai-workflow`

## 1. Header Metadata

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#001` |
| **Tool ID** | `adytum-alchemist-ai-workflow` (Adytum Planner / Adytum Alchemist Guide / Adytum Sanctuary 3D) |
| **Audit Start** | `2026-11-25 18:23:16 EST` (`2026-11-25 23:23:16 UTC`) |
| **Audit Completion** | `2026-11-25 18:26:47 EST` (`2026-11-25 23:26:47 UTC`) |
| **Repo SHA (`adytum-alchemist-ai-workflow`)** | `98140ad` (`main`, clean working tree) |
| **Repo SHA (`zoth-studio-v2`)** | `df90519` |
| **Repo SHA (`zoth-os`)** | `2c407135` |
| **Overall Verdict** | **`NEEDS FIX`** (Composite: **6.6 / 10**) |

### 5-Level Scorecard

| Level | Score / 10 | Status | Headline Finding |
| :--- | :---: | :--- | :--- |
| **Level 1 — System** | **7.5 / 10** | `PASS WITH NOTES` | Live `:8135` loopback daemon healthy (19.2 MB RSS, 0% CPU) & zero CLI shadow drift, but `server.py` lacks `OPTIONS` preflight (`501`), leaks host path existence (`404` vs `200`), `sitemap.xml` lacks `<lastmod>`, and `og:image` is `100x172px`. |
| **Level 2 — User** | **6.5 / 10** | `PASS WITH NOTES` | Both `:8135` (22 keys, BOTA protocol) and Studio God-Mode Deck (3D GLB, LTX-Video, 15-rule validator) work interactively, but users hit 5 conflicting product identities, a 5-min meditation screen with no cancel/back button, and naive keyword validation (`"no tests"` passes Key 9). |
| **Level 3 — Engineer** | **6.0 / 10** | `NEEDS FIX` | `tsc --noEmit` (0) and `node tests/test_adytum.mjs` (3/3) pass, but **`handleDownloadSession()` exports plaintext API keys in JSON (`P0`)**, `pytest` collects 0 tests (exit 5), `adytumKeys.json` & `AdytumAlchemistTool.jsx` are dead code, and `package.json` carries unused `express`/`dotenv`/`motion`. |
| **Level 4 — UI** | **7.5 / 10** | `PASS WITH NOTES` | Zero horizontal overflow (`overflowPx === 0`), zero console errors, zero missing `alt` across all 9 triple-viewport captures + dark-mode Studio shots; however **33/33 mobile interactive targets on `:8135` are `<44px`**, desktop `:8135` clips the correspondence matrix mid-card, and God-Mode Deck stays dark inside Studio Light Mode. |
| **Level 5 — Readability** | **5.5 / 10** | `NEEDS FIX` | Standalone `README.md` is concrete and accurate, but Studio `/adytum`, `/adytum/docs`, `AdytumPlannerGodModeTool`, and `toolsDocumentation.js` document **phantom CLI subcommands** (`validate`, `run`, `resume`, `inspect`, `list`, `key`, `harden`, `mcp`, `zoth-adytum`, `npm run adytum:init`) and `/adytum` `<title>` claims an Argon2id secrets vault (`Adytum Sanctum`). |

---

## 2. Test Roadmap & Execution Log

| # | Check / Command | Observed Result | Status |
| :-: | :--- | :--- | :---: |
| 1 | `ss -tlnp \| grep -E ':8135\|:3000'` & `ps -eo pid,ppid,etime,%cpu,%mem,rss,cmd` | `127.0.0.1:8135` bound exclusively by PID `1514` (`python3 server.py --port 8135 --host 127.0.0.1`), uptime `09:15:43`, `0.0% CPU`, `0.0% MEM`, `19212 KB RSS`. `:3000` bound by PID `1573` (`serve.mjs`). | `PASS` |
| 2 | `curl -i http://127.0.0.1:8135/{,health,api/health,api/status}` | All 4 return `HTTP/1.0 200 OK`; JSON endpoints return `{"status":"online","service":"adytum-alchemist-ai-workflow","title":"Adytum Sanctuary 3D (22 Major Arcana)","arcana_count":22,"port":8135}`. | `PASS` |
| 3 | `curl` CORS & preflight (`Origin: https://evil.example.com`, `Origin: http://127.0.0.1:3000`, `-X OPTIONS`) | Evil origin -> `403 Forbidden` (`Cross-origin requests restricted to loopback`); loopback origin -> `200 OK` + `Access-Control-Allow-Origin: http://127.0.0.1:3000` + `Vary: Origin`; `OPTIONS` -> **`501 Unsupported method ('OPTIONS')`**. | `WARN` |
| 4 | `curl --path-as-is` traversal probe (`/../../../../../etc/passwd` vs `/../../../../../etc/nonexistent_xyz`) | `/etc/passwd` -> **`HTTP 404`**; `/etc/nonexistent_xyz` -> **`HTTP 200`** (`index.html`). No file content disclosed, but host path-existence oracle confirmed. | `WARN` |
| 5 | CLI shadow & flag audit (`which -a`, `diff -q`, `--help`, `--version`, `--status`, `--json`, `--ui`, `-tui --json`) | `/usr/local/bin`, `~/.local/bin`, and `zoth-os` chroot copies are byte-identical (`diff` empty) for `adytum`, `adytum-alchemist-ai-workflow`, and `adytum-alchemist-ai-workflow-tui`. All standard flags exit `0`. | `PASS` |
| 6 | Documented CLI subcommands (`adytum validate`, `adytum invariants`, `adytum run`, `which zoth-adytum`, `npm run adytum:init`) | `zoth-adytum` missing; `adytum:init` not in `package.json`; `adytum validate/invariants/run` all silently ignore args and print static status card (`exit 0`). | `FAIL` |
| 7 | Hygiene & SEO checks (`netlify.toml`, `robots.txt`, `sitemap.xml`, `index.html`, paywall/DePay grep, `fool.jpg` size) | Zero paywall/DePay/blur locks; valid `netlify.toml`, `robots.txt`, Schema.org `@graph` (`WebApplication`, `SoftwareApplication`, `FAQPage`). **`sitemap.xml` missing `<lastmod>`**; **`og:image` (`fool.jpg`) is `100x172px`**. | `WARN` |
| 8 | Automated tests & typecheck (`pytest -v`, `npx tsc --noEmit`, `node tests/test_adytum.mjs`) | `tsc --noEmit` -> `exit 0`; `node tests/test_adytum.mjs` -> `3/3 pass` (`exit 0`); **`pytest -v` -> `collected 0 items` (`exit 5`)**. | `WARN` |
| 9 | Interactive CDP workflow probe (`:8135`, `/tools/adytum-alchemist-ai-workflow`, `/adytum`, `/adytum/docs`) | `:8135`: 22/22 keys switch cleanly, 0 broken images, canonical excerpt `3,088 chars`, BOTA protocol renders 3 textareas, **`33/33` mobile targets `<44px`**. Studio tool: 22 arcana entries, Chariot 07 MP4 loop (`readyState: 4`), 10 canvases, `Flawed Spec` (`22/100`) -> `Auto-Harden` (`100/100`), 0 console errors, 0 failed HTTP requests. | `WARN` |
| 10 | Triple-viewport `capture.mjs` + dual-theme visual review via `read_file` (14 `.jpg` screenshots inspected) | All 9 `capture.mjs` shots + 5 interactive/dark-mode shots returned `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`. Visual defects documented in Level 4 below. | `PASS WITH NOTES` |

### Captured & Visually Inspected Screenshots

- **Standalone `:8135`**:
  - [home_desktop.jpg](file:///tmp/whiteboard-audit-001/standalone/home_desktop.jpg) (1440×900)
  - [home_tablet.jpg](file:///tmp/whiteboard-audit-001/standalone/home_tablet.jpg) (820×1180)
  - [home_mobile.jpg](file:///tmp/whiteboard-audit-001/standalone/home_mobile.jpg) (390×844)
  - [standalone_workbench_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/standalone_workbench_desktop.jpg) (Key 21 Workbench View, 1440×900)
- **Zoth Studio `/tools/adytum-alchemist-ai-workflow`**:
  - [tools_adytum-alchemist-ai-workflow_desktop.jpg](file:///tmp/whiteboard-audit-001/studio/tools_adytum-alchemist-ai-workflow_desktop.jpg) (Light Mode, 1440×900)
  - [tools_adytum-alchemist-ai-workflow_tablet.jpg](file:///tmp/whiteboard-audit-001/studio/tools_adytum-alchemist-ai-workflow_tablet.jpg) (Light Mode, 820×1180)
  - [tools_adytum-alchemist-ai-workflow_mobile.jpg](file:///tmp/whiteboard-audit-001/studio/tools_adytum-alchemist-ai-workflow_mobile.jpg) (Light Mode, 390×844)
  - [studio_tool_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_tool_scrolled_desktop.jpg) (Light Mode, God-Mode Deck scrolled)
  - [studio_tool_light_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_tool_light_desktop.jpg) (Dark Mode toggle, top)
  - [studio_tool_light_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_tool_light_scrolled_desktop.jpg) (Dark Mode toggle, God-Mode Deck scrolled)
- **Zoth Studio `/adytum`**:
  - [adytum_desktop.jpg](file:///tmp/whiteboard-audit-001/studio/adytum_desktop.jpg) (Light Mode, 1440×900)
  - [adytum_tablet.jpg](file:///tmp/whiteboard-audit-001/studio/adytum_tablet.jpg) (Light Mode, 820×1180)
  - [adytum_mobile.jpg](file:///tmp/whiteboard-audit-001/studio/adytum_mobile.jpg) (Light Mode, 390×844)
  - [studio_adytum_light_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_adytum_light_desktop.jpg) (Dark Mode toggle, 1440×900)

---

## 3. 5-Level Deep Findings

### Level 1 — System Level (7.5 / 10)
- **Runtime Stability (Verified)**: `server.py` runs cleanly on `127.0.0.1:8135` (PID `1514`, 19.2 MB RSS, 0.0% CPU, loopback-only socket, zero port conflicts). `/health`, `/api/health`, `/api/status` return consistent JSON.
- **CLI Packaging Parity (Verified)**: All 3 binaries (`adytum`, `adytum-alchemist-ai-workflow`, `adytum-alchemist-ai-workflow-tui`) match byte-for-byte across `/usr/local/bin/`, `~/.local/bin/`, and `~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin/`. No stale `~/.local/bin` shadowing exists.
- **Defect 1.1 — Missing `OPTIONS` CORS Preflight Handler (`server.py:28-73`)**: `AdytumHandler` inherits `SimpleHTTPRequestHandler` without defining `do_OPTIONS()`. Any browser preflight (`OPTIONS /api/status`) receives `501 Unsupported method ('OPTIONS')`.
- **Defect 1.2 — Host Filesystem Existence Oracle & Fragile Origin Parser (`server.py:21-25, 68-71`)**:
  - `os.path.join(DIST_DIR, req_path)` is checked with `os.path.exists(full_path)` without resolving/confining `realpath` inside `DIST_DIR`. Confirmed: `GET /../../../../../etc/passwd` returns `404` while `GET /../../../../../etc/nonexistent_xyz` returns `200` (`index.html`), exposing host file existence.
  - `_allowed_origin` splits `origin` on `:` (`":".join(origin.split(":")[:2])`) instead of parsing with `urllib.parse.urlparse()` and validating `scheme` + `hostname in {"127.0.0.1", "localhost"}`.
- **Defect 1.3 — Sitemap & Social Card Hygiene (`public/sitemap.xml:1-7`, `index.html:20,29`)**:
  - `public/sitemap.xml` omits `<lastmod>` (required by Pre-Deployment Production Guardrail §5.2).
  - `index.html` points `og:image` and `twitter:image` to `/tarot/fool.jpg`, which is only **`100x172px`** (fails §5.5 minimum `1200x630` or `1:1` high-res asset spec).
- **Defect 1.4 — Version & Category Drift**:
  - `package.json:4` declares `"version": "0.0.0"`.
  - `zoth-studio-v2/public/api/tools.json:74` & `toolsData.js` declare `"version": "1.0.0"`, category `"Planning"`.
  - `/usr/local/bin/adytum-alchemist-ai-workflow:8-9` declares `TOOL_VERSION = '2.4.0'`, `TOOL_CATEGORY = 'Creative & Design'`.
- **Defect 1.5 — Silent Subcommand Swallow in CLI (`/usr/local/bin/adytum-alchemist-ai-workflow:35-38`)**: `parser.parse_known_args(args)` accepts arbitrary positional `payload` arguments and ignores them, returning `exit 0` with the static status card for `adytum validate`, `adytum run`, `adytum invariants`, etc.

### Level 2 — User Level (6.5 / 10)
- **Active Workbench Entry (Verified)**: `:8135` opens directly into the 22-Key Major Arcana deck with Key 0 (`The Fool`) preview, correspondence matrix, and one-click `Open Key in Workbench` (no blocking welcome splash).
- **End-to-End Interactive Parity (Verified)**:
  - On `:8135`, all 22 Arcana buttons update the card, title, Hermetic correspondence matrix, and canonical BOTA excerpt (`3,088 chars` for Key 21) with zero errors.
  - On `:3000/tools/adytum-alchemist-ai-workflow`, local Studio detects `:8135` live and embeds it in an iframe (`Live Local App (:8135)`), while also rendering the full `Studio God-Mode Deck` (`AdytumPlannerGodModeTool`) below with live Tree of Life canvas, 3D `.glb` diorama, LTX-Video 2B MP4 (`readyState: 4`), 22 key selectors, preset switcher (`Flawed Spec` -> `22/100`, `Auto-Harden` -> `100/100`), and Markdown/JSON export.
- **Defect 2.1 — Severe 5-Way Product Identity Fragmentation**:
  1. `toolsData.js` / `tools.json`: **"Adytum Planner"** (Planning — 22-key hermetic planning rite).
  2. `server.py:63` / CLI wrapper: **"Adytum Sanctuary 3D (22 Major Arcana)"** (Creative & Design — promises 3D dioramas, which `:8135` does NOT have!).
  3. Standalone `:8135` (`index.html:6`, `src/App.tsx:732`): **"Adytum Alchemist Guide | AI Tarot Initiation"** (2D BOTA Tarot study + Socratic AI chemistry guide).
  4. Studio `/adytum` page content (`AdytumShowcasePage.jsx:8-12`): **"Adytum Workflow Engine — Deterministic AI Workflow Pipelines"** (claims JSON Schema Draft 2020-12 DAG orchestrator & disk checkpoints).
  5. Studio `/adytum` HTML `<title>` & `src/config/site.js:45-47`: **"Adytum Sanctum // Sovereign Key Management & Zero-Egress Secrets"** (Argon2id + XChaCha20-Poly1305 cryptographic vault).
- **Defect 2.2 — Meditation Timer Traps the User (`src/App.tsx:1205-1232`)**: Once `stage === "meditating"` starts (`300s`), there is no Cancel, Pause, Skip/Complete Early, or `← All 22 Keys` button. Users must reload or click `Clear Logs` (which wipes all progress) to escape.
- **Defect 2.3 — Destructive Unconfirmed `Clear Logs` (`src/App.tsx:550-563, 746-748`)**: Clicking `Clear Logs` immediately erases `sessionLog` and all 22-key `progress` in `localStorage` with zero confirmation dialog.
- **Defect 2.4 — Naive Substring Gatekeeper (`AdytumPlannerGodModeTool.jsx:91-185`)**:
  - `validatePlan()` uses raw `.includes()` checks without negation awareness: `"with no tests or boundaries"` passes Rule Key 9 (`text.includes('test')` is `true`!).
  - `autoHardenSpec()` does brittle regex swaps (`mock_production` -> `verified_production`) leaving nonsensical prose (`"using deterministic-implementation verified_production responses ... with no tests or boundaries"`) while awarding `100/100 (A+)`.
- **Defect 2.5 — Cloud-First Default Provider (`src/App.tsx:49-58`)**: `DEFAULT_PROVIDER_SETTINGS.provider` defaults to `"openai"` (requiring a cloud API key) instead of `"ollama_local"` (`http://localhost:11434`), contradicting the local-first ZothOS posture.

### Level 3 — Engineer Level (6.0 / 10)
- **Build & Static Checks (Verified)**: `npx tsc --noEmit` exits `0`; `node tests/test_adytum.mjs` passes `3/3`; `dist/` (`2026-11-23 13:39:38`) is cleanly compiled after the latest `src/App.tsx` edit (`2026-11-23 13:39:18`); `electron/main.cjs` enforces `nodeIntegration: false` and `contextIsolation: true`; fonts are locally bundled (`@fontsource-variable/geist`).
- **Defect 3.1 (`P0` Security) — Plaintext API Keys Exported in Session JSON (`src/App.tsx:565-577`)**:
  ```ts
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    providerSettings, // <-- includes raw openaiApiKey & ollamaCloudApiKey!
  ```
  Clicking `Download Session` writes the user's live OpenAI and Ollama Cloud API keys in cleartext to `adytum-session-*.json`, creating an immediate credential-leak hazard if the user shares or commits a session log.
- **Defect 3.2 — Zero Python Tests (`pytest -v` Exit 5) & Shallow JS Test Coverage**:
  - No `test_*.py` exists in `adytum-alchemist-ai-workflow` (`pytest` exits `5`).
  - `tests/test_adytum.mjs` checks only 3 items (22 jpg count, hygiene grep, `/health` + 403 cross-origin). It misses `OPTIONS` handling, traversal checks, `handleDownloadSession` redaction, SPA fallback, and all React UI flows.
- **Defect 3.3 — Dead / Orphaned & Miswired Code in `zoth-studio-v2`**:
  - `src/data/adytumKeys.json` (178 lines, 22 rich AI-Chemistry Tarot entries) has **`0` imports** across the entire codebase.
  - `src/components/tools/AdytumAlchemistTool.jsx` (3-line re-export of `AdytumPlannerGodModeTool`) has **`0` imports** (`RealToolWorkspacePage.jsx:44` imports `AdytumPlannerGodModeTool` directly).
  - `src/pages/RealToolWorkspacePage.jsx:253` maps the `'chronicle'` tool slug to `AdytumPlannerGodModeTool`.
  - `src/config/site.js:44-49, 492` & `scripts/prerender.mjs:78, 405` hardcode stale `"Adytum Sanctum"` Argon2id vault metadata for `/adytum`.
- **Defect 3.4 — Unused Dependencies, Repo Clutter & GitHub Org Mismatch**:
  - `package.json:19,21,23` installs `express`, `dotenv`, and `motion` with **`0` references** anywhere in `src/`.
  - Stale repo files: 0-byte `.codex` and `.tmp/{test.gif,x01.gif}` remain in the repository root.
  - `git remote -v` is `https://github.com/1nc0gn30/adytum-alchemist-ai-workflow.git`, whereas `src/App.tsx:1247`, `README.md:43`, `toolsData.js:63`, `AdytumPage.jsx:13`, and `AdytumShowcasePage.jsx:16` link to `https://github.com/NullAITech/adytum-alchemist-ai-workflow`.
- **Defect 3.5 — Missing React ErrorBoundary (`src/main.tsx:1-10`, `src/App.tsx`)**: No error boundary wraps `<App />` or `<ReactMarkdown>`.

### Level 4 — UI Level (7.5 / 10)
- **Verified Passes**:
  - `overflowPx === 0`, `errors.length === 0`, `imgsMissingAlt === 0` across **all 9 triple-viewport captures** (`390px`, `820px`, `1440px`) on `:8135`, `/tools/adytum-alchemist-ai-workflow`, and `/adytum`, plus Dark Mode Studio views.
  - Tablet `:8135` ([home_tablet.jpg](file:///tmp/whiteboard-audit-001/standalone/home_tablet.jpg)) and both Light & Dark `/adytum` ([adytum_desktop.jpg](file:///tmp/whiteboard-audit-001/studio/adytum_desktop.jpg), [studio_adytum_light_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_adytum_light_desktop.jpg)) render with crisp hierarchy and contrast.
  - Tree of Life Sephiroth canvas in `AdytumPlannerGodModeTool` renders cleanly with zero HUD overlap over `KETHER` ([studio_tool_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_tool_scrolled_desktop.jpg)).
- **Defect 4.1 — Mobile Touch Targets Below 44px on `:8135` (`src/App.tsx:737-748, 894-909`)**:
  - Measured on 390×844 mobile: **`33/33` interactive elements are `<44px` tall** (`AI Settings`, `Progress`, `Download Session`, `Clear Logs` are `26px` tall; all 22 Major Arcana pills are `30px` tall). Fails WCAG 2.5.5 and Pre-Deployment Guardrail §5.6 (`>= 44px`).
- **Defect 4.2 — Desktop Cramping & Mid-Card Clipping on `:8135` ([home_desktop.jpg](file:///tmp/whiteboard-audit-001/standalone/home_desktop.jpg), `src/App.tsx:727, 882-886`)**:
  - `max-w-3xl` (768px) + `sm:h-[90dvh]` on a 1440×900 desktop viewport leaves wide empty outer margins while squeezing the 2-column grid (`300px` + `1fr`). Result: `22 MAJOR ARCANA DECK` and `0/22 Done` wrap to 2 lines, and the `HERMETIC & ARCHITECTURAL CORRESPONDENCE` box is clipped horizontally halfway down the card without a visible scroll cue.
- **Defect 4.3 — Pixelated Upscaled Tarot Cards on `:8135` (`public/tarot/*.jpg`)**:
  - Source images are `100x172px`, upscaled to `176px` (`w-44`) in the preview and `340px` (`max-w-[340px]`) in the lesson workbench (`3.4x` stretch). Studio already hosts 22 high-res cards in `public/assets/tarot3d/cards/`.
- **Defect 4.4 — Hardcoded Dark Deck Inside Studio Light Mode & Unstyled Scrollbar ([studio_tool_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-001/interactive/studio_tool_scrolled_desktop.jpg), `AdytumPlannerGodModeTool.jsx:404, 754-770`)**:
  - `AdytumPlannerGodModeTool` ignores Studio's Editorial Ivory Light Mode (hardcoded `#07070C` / `#0B0B14`) and its multiline `<TextField>` renders a bright white native scrollbar against `#05050A`.
- **Defect 4.5 — Mid-Word Wrap in Mobile CLI Snippet ([tools_adytum-alchemist-ai-workflow_mobile.jpg](file:///tmp/whiteboard-audit-001/studio/tools_adytum-alchemist-ai-workflow_mobile.jpg))**:
  - On 390px mobile, the URL inside the dark CLI pill breaks mid-word as `adyt` / `um-alchemist-ai-workflow.git`.

### Level 5 — Readability Level (5.5 / 10)
- **Standalone Clarity (Verified)**: On `:8135`, a first-time user grasps the 22-Key BOTA Tarot & AI Chemistry workbench within ~5 seconds; `README.md` clearly covers What It Does, How It Works, CLI flags, and Quick Start with concrete, hype-free prose.
- **Defect 5.1 — Pervasive Phantom CLI & Feature Documentation Across Zoth Studio**:
  - `src/pages/AdytumPage.jsx:26-30, 64` documents nonexistent `adytum validate <manifest.json>`, `adytum run`, `adytum resume`, `adytum inspect`, and `.adytum/runs/` SHA-256 checkpoints.
  - `src/components/tools/AdytumPlannerGodModeTool.jsx:845, 886-892` documents nonexistent `adytum list`, `adytum key 7`, `adytum invariants`, `adytum validate`, `adytum harden`, `adytum mcp`, `adytum web`.
  - `src/data/toolsDocumentation.js:218, 237` documents nonexistent `zoth-adytum validate --spec ./plan.json` and nonexistent `npm run adytum:init`.
- **Defect 5.2 — Raw Markdown Backticks Rendered in UI (`AdytumPlannerGodModeTool.jsx:456, 854`)**:
  - Renders literal `` (`adytum`) ``, `` (`:8135`) ``, and `` (`/usr/local/bin/adytum`) `` as plain text characters instead of styled `<code>` tags.
- **Defect 5.3 — Reduced Legibility from Stylized Uncial Display Font (`tools_adytum-alchemist-ai-workflow_desktop.jpg`)**:
  - The decorative heading font renders lowercase `r` as `ı` and `t` as `†` (`Ady†um Planneı`, `Inteıactive Enclave Woıkstation`, `Localhost Daemon (127.0.0.1:8135)`), hurting technical scannability on IP/port labels.
- **Defect 5.4 — Unbound Form `<label>` Elements (`src/App.tsx:1105, 1115, 1125`)**:
  - The 3 BOTA Practice Protocol `<label>` elements (`1. Conscious Intention`, `2. Symbol Observation`, `3. Subconscious Directive`) lack `htmlFor` attributes matching their `<Textarea id=...>` inputs, degrading screen-reader accessibility.

---

## 4. Prioritized Fix & Enhancement Backlog

### `P0` — Broken / Security / Critical Misrepresentation
1. **Redact Secrets from Session JSON Export (`adytum-alchemist-ai-workflow/src/App.tsx:565-577`)**:
   - Strip `openaiApiKey` and `ollamaCloudApiKey` from `exportPayload.providerSettings` before constructing the download `Blob` (export provider name, model, and base URLs only). Add a regression unit test in `tests/test_adytum.mjs`.
2. **Eliminate Phantom CLI Commands & Align Docs (`zoth-studio-v2` + `zoth-os` CLI)**:
   - Either implement real `list`, `key <0-21>`, `invariants`, `validate <file>`, and `harden <file>` subcommands in `/usr/local/bin/adytum` (and sync to `~/.local/bin` + `zoth-os` chroot) OR immediately update `AdytumPage.jsx`, `AdytumPlannerGodModeTool.jsx`, and `toolsDocumentation.js` to document only working commands (`--help`, `--status`, `--json`, `--ui`, `--tui`, `serve`).
3. **Fix `/adytum` Wrong SEO Metadata (`zoth-studio-v2/src/config/site.js:44-49, 492`, `scripts/prerender.mjs:78, 405`)**:
   - Replace `"Adytum Sanctum // Sovereign Key Management & Zero-Egress Secrets"` (Argon2id vault copy) with accurate Adytum Planner / Hermetic AI Workflow metadata so Google/Perplexity/social cards stop indexing `/adytum` as a password vault.

### `P1` — Drift / UX / Accessibility / Compliance
4. **Harden `server.py` (`adytum-alchemist-ai-workflow/server.py:21-73`)**:
   - Add `do_OPTIONS()` returning `204 No Content` with loopback CORS headers (or `403` for non-loopback).
   - Parse `Origin` with `urllib.parse.urlparse()` instead of string splitting.
   - Canonicalize `full_path = os.path.realpath(os.path.join(DIST_DIR, req_path))` and verify `full_path.startswith(os.path.realpath(DIST_DIR) + os.sep)` before `os.path.exists()` to eliminate the host file-existence oracle.
5. **Fix `:8135` Mobile Touch Targets (`>=44px`) & Desktop Layout Cramping (`src/App.tsx:727, 737-748, 882-910`)**:
   - Expand desktop card container from `max-w-3xl` to `max-w-5xl` (or `max-w-6xl`) so the 22-key deck header never wraps and the Correspondence Matrix fits cleanly above the fold on 1440×900.
   - Increase mobile tap targets (`min-h-[44px]`) on top action buttons and Arcana strip pills.
6. **Add Escape Hatch to 5-Minute Meditation & Confirmation on `Clear Logs` (`src/App.tsx:550-563, 1205-1232`)**:
   - Add `Pause / Resume` and `← Return to Key` controls on the meditation stage, and require confirmation before wiping all 22-key progress in `handleClearLogs()`.
7. **Unify Product Naming, Version & GitHub Org Across All 5 Surfaces**:
   - Decide one canonical name/tagline + single version (e.g. `v2.4.0`) across `package.json`, `toolsData.js`, `tools.json`, `server.py`, CLI wrapper, and `/adytum`.
   - Reconcile GitHub URLs (`github.com/1nc0gn30/adytum-alchemist-ai-workflow` vs `github.com/NullAITech/adytum-alchemist-ai-workflow`) to match the actual `origin` remote.
8. **Fix Guardrail SEO Gaps (`public/sitemap.xml`, `index.html`)**:
   - Add `<lastmod>` to `public/sitemap.xml`.
   - Replace `100x172px` `fool.jpg` `og:image`/`twitter:image` with a dedicated `1200x630` social card (and upgrade `public/tarot/*.jpg` to higher-resolution assets matching Studio's `tarot3d/cards/`).
9. **Add Negation-Aware Plan Validation & Real `pytest` Suite**:
   - Update `validatePlan()` in `AdytumPlannerGodModeTool.jsx` to reject negated phrases (`/\bno\s+tests?\b/i`, `/\bwithout\s+boundar/i`).
   - Add `tests/test_server.py` (covering `/health`, loopback CORS, `OPTIONS`, path-traversal confinement) so `pytest` executes real tests instead of exiting `5`.

### `P2` — Polish & Code Hygiene
10. **Remove Dead Code & Unused Packages**:
    - Either wire `zoth-studio-v2/src/data/adytumKeys.json` into the workbench or remove it; remove unused `AdytumAlchemistTool.jsx`; fix `'chronicle': AdytumPlannerGodModeTool` mapping in `RealToolWorkspacePage.jsx:253`.
    - Remove unused `express`, `dotenv`, `motion` from `adytum-alchemist-ai-workflow/package.json` and delete `.codex` + `.tmp/*.gif`.
11. **Polish UI Details**:
    - Replace literal backticks in `AdytumPlannerGodModeTool.jsx:456, 854` with `<code>` elements; style dark scrollbars inside Studio's multiline `<TextField>`; add `htmlFor`/`id` bindings to the 3 BOTA `<label>` elements (`src/App.tsx:1105-1125`); default `provider` to `ollama_local`; add a React `ErrorBoundary`.
    - Add Light Mode surface adaptation (or an explicit dark-canvas frame label) for `AdytumPlannerGodModeTool` inside Editorial Ivory Studio, and switch technical subheadings (`Localhost Daemon (127.0.0.1:8135)`) out of the decorative uncial font.

---

## 5. AGY Perspective (Candid Review)

### Feedback
The single biggest drag on Item `#001` is **narrative drift outpacing code reality**. Right now, a developer clicking around Zoth Studio encounters *five different products* wearing the "Adytum" badge: a BOTA Tarot contemplation app on `:8135`, a 3D RPG/GLB + Hermetic PRD gatekeeper on `/tools/adytum-alchemist-ai-workflow`, a JSON-Schema DAG workflow orchestrator on `/adytum` & `/adytum/docs`, an Argon2id cryptographic secrets vault in `/adytum`'s `<title>`/`site.js`, and a CLI wrapper that prints a static card while swallowing every documented subcommand with `exit 0`. Individually, both the standalone BOTA study app and the Studio God-Mode Deck work smoothly without console errors—but the contradictory copy erodes engineering trust faster than a visible bug would. And on the security side, exporting raw `openaiApiKey` / `ollamaCloudApiKey` inside `Download Session` is a genuine footgun that must be patched before anyone shares a session log.

### Enhancements
1. **Unify CLI + Gatekeeper Engine (`adytum validate` / `adytum harden` / `adytum key <n>`)**: Port the 22-Key Hermetic matrix and negation-aware invariant validator into a real Python module used by *both* `/usr/local/bin/adytum` and `server.py` (`POST /api/validate`), turning the currently phantom CLI commands into a real CI/CD pre-flight gate.
2. **Bring Studio's 4K Tarot Art & 3D Diorama Toggle to `:8135`**: Zoth Studio already contains 22 HD cards, 22 `.glb` dioramas, and 22 LTX-Video loops in `public/assets/tarot3d/`. Upgrading `:8135`'s `100x172px` thumbnails to HD cards (with an optional 3D view toggle) would instantly close the visual gap between the CLI's `"Adytum Sanctuary 3D"` promise and the standalone app.
3. **Wire Orphaned `adytumKeys.json` as an Offline AI-Chemistry Curriculum**: `zoth-studio-v2/src/data/adytumKeys.json` already holds 22 well-written AI-engineering lessons + Socratic reflection questions (e.g. Key 0 = Zero-Shot Prompting, Key 1 = Self-Attention, Key 9 = RAG). Loading it directly into `:8135` gives users full AI-Chemistry lessons 100% offline even without Ollama/OpenAI configured.
4. **Live Local Ollama Auto-Detection on `:8135`**: Default to `ollama_local` and probe `http://127.0.0.1:11434/api/tags` on load so installed local models populate a dropdown automatically instead of asking the user to type model names or paste an OpenAI key.
5. **Interactive Tree-of-Life Path Clicking**: Make the 22 glowing Sephiroth paths in `AdytumPlannerGodModeTool`'s canvas clickable hit-targets so clicking a path directly selects its corresponding Arcana Key.

### Appreciation
- **Zero-Crash Discipline & Asset Completeness**: Across 14 full captures and interactive DOM sweeps on 4 routes, there were **zero console errors, zero uncaught exceptions, zero failed HTTP requests, zero broken images, and zero horizontal overflow**. All 22 HD cards, 22 `.glb` models, 22 LTX-Video loops (`readyState: 4`), and 22 Braille assets actually exist and load cleanly.
- **Tactile Craft on the Tree of Life & Bayer 8×8 Dither Band**: `AdytumPlannerGodModeTool`'s animated Sephiroth lattice (with explicit Y-offset clearance so the HUD never collides with `KETHER`) paired with `SovereignBand`'s 8×8 ordered dither feels genuinely distinctive—nothing cookie-cutter about it.
- **Clean Open-Access Hygiene & Loopback Discipline**: Zero paywalls, zero blur locks, zero DePay remnants, clean canonical attribution (`Neal Frazier Tech (@1nc0gn30) • NullAI Platform`), locally bundled Geist Variable fonts, byte-identical CLI sync across `/usr/local/bin`, `~/.local/bin`, and `zoth-os` chroot, and active loopback-only binding on `:8135`.

---

## 6. Post-Remediation Re-Audit (`v2`)

### Remediation Metadata

| Field | Value |
| :--- | :--- |
| **Remediation Start** | `2026-11-25 18:35:49 EST` (`2026-11-25 23:35:49 UTC`) |
| **Remediation Completion** | `2026-11-25 18:48:58 EST` (`2026-11-25 23:48:58 UTC`) |
| **Commit (`adytum-alchemist-ai-workflow`)** | `286cb75` (from `98140ad`) |
| **Commit (`zoth-studio-v2`)** | `87595c8` (from `df90519`) |
| **Commit (`zoth-os`)** | `ef204212` (from `2c407135`) |
| **Post-Remediation Verdict** | **`PASS`** (Composite: **9.38 / 10**, all 5 levels `>= 9.0 / 10`) |

### Before vs After 5-Level Scorecard

| Level | Before (`v1`) | After (`v2`) | Delta | Status | Verified Post-Remediation Evidence |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. System** | `7.5 / 10` | **9.5 / 10** | `+2.0` | `PASS` | `:8135` `server.py` hardened (`OPTIONS` `204`, strict `urlparse` + `.port` + `netloc` loopback check blocking `127.0.0.1:8135.evil.com` with `403`, zero traversal existence oracle `400 == 400`, live `GET /api/keys`, `POST /api/validate`, `POST /api/harden`); real `adytum` CLI (`list`/`key`/`invariants`/`validate`/`harden`/`serve`, `exit 2` on unknown commands) byte-identical across `/usr/local/bin`, `~/.local/bin`, `zoth-os` chroot; `1200×630` `og-banner.jpg`, `<lastmod>` in `sitemap.xml`, unified `v2.4.0`. |
| **2. User** | `6.5 / 10` | **9.3 / 10** | `+2.8` | `PASS` | Unified canonical identity (**Adytum Planner — 22-Key Hermetic AI Workbench**) across all surfaces; 22 offline AI-Chemistry lessons wired into `:8135`; local Ollama default (`127.0.0.1:11434`) with `/api/tags` discovery; meditation stage adds `Pause Timer`, `Complete Early`, `← Back to Key`; two-step `Clear Logs` confirmation; negation-aware validator fails `"with no tests or boundaries"` (`7/100`, Key 9 `✖`) and coherent `Auto-Harden` reaches `100/100` with zero negated leftovers. |
| **3. Engineer** | `6.0 / 10` | **9.4 / 10** | `+3.4` | `PASS` | **`P0` secret leak fixed** via `sanitizeProviderSettingsForExport()` with runtime test proving zero API keys in exported JSON; `pytest -v` passes `6/6` (`0.13s`), `npm test` passes `5/5`, `zoth-studio-v2 npm test` passes `37/37` routes + registry/arsenal/ground-truth/serve, `zoth-os pytest -q` passes `12/12`; orphaned `AdytumAlchemistTool.jsx` & Studio `adytumKeys.json` deleted; `'chronicle'` remapped to `ChronicleVaultGodModeTool`; unused `express`/`dotenv`/`motion`, `.codex`, `.tmp/*.gif` removed; `AdytumErrorBoundary` added; GitHub URLs unified to `github.com/1nc0gn30/adytum-alchemist-ai-workflow`. |
| **4. UI** | `7.5 / 10` | **9.4 / 10** | `+1.9` | `PASS` | Mobile `:8135` touch targets under 44px dropped from **`33/33` → `0/33`**; desktop `:8135` widened to `max-w-5xl xl:max-w-6xl` with zero mid-card clipping and sharp `480×720` HD cards; meditation controls sit cleanly unclipped above footer; `AdytumPlannerGodModeTool` fully adapted to Editorial Ivory Light Mode & Sovereign Obsidian Dark Mode with themed scrollbars; mobile CLI bar scrolls cleanly with zero mid-word breaks; `0` overflow, `0` console errors, `0` missing `alt` across all 18 fresh screenshots. |
| **5. Readability** | `5.5 / 10` | **9.3 / 10** | `+3.8` | `PASS` | Stale `"Adytum Sanctum // Argon2id"` vault SEO/prerender/docs copy completely purged; 100% of documented CLI commands (`list`, `key`, `invariants`, `validate`, `harden`, `serve`) exist and pass live checks (phantom `zoth-adytum`, `adytum:init`, `adytum run/resume/inspect/mcp/web` removed); literal backticks replaced with `<code>`; technical port headings switched to crisp `Space Grotesk`; all 3 BOTA `<label>`/`<Textarea>` pairs bound via `htmlFor`/`id`. |

### Post-Remediation Verification Log

| # | Check / Command | Observed Result | Status |
| :-: | :--- | :--- | :---: |
| 1 | `cd ~/NullAITech/adytum-alchemist-ai-workflow && npx tsc --noEmit && npm run build` | `exit 0`, built `dist/` (`1868` modules, `3.25s`) | `PASS` |
| 2 | `npm test` (`node --test tests/test_adytum.mjs`) | **`5/5 pass`** (`0 fail`), including `1200×630` `og-banner.jpg`, `480×720` HD cards, runtime API-key redaction check, CLI parity, and HTTP API tests | `PASS` |
| 3 | `pytest -v` (`tests/test_server.py`) | **`6 passed in 0.13s`** (`/health`, `urlparse` + `.port` CORS rejection of `127.0.0.1:8135.evil.com`, `OPTIONS 204`, traversal `400 == 400`, `/api/keys`, negation-aware `/api/validate` & `/api/harden`) | `PASS` |
| 4 | Live `:8135` daemon probes (`ss -tlnp`, `curl` `/health`, `OPTIONS`, evil `Origin`, traversal, `/api/keys`, `/api/validate`) | PID `152583` bound to `127.0.0.1:8135`; `/health` returns `v2.4.0`; `OPTIONS` returns `204`; evil origin returns `403`; `/etc/passwd` & `/etc/nonexistent_xyz` both return `400`; `/api/keys` returns `22`; `/api/validate` scores flawed spec `7/100` with `key9_tests: False` | `PASS` |
| 5 | CLI binary diff & live execution (`adytum --version`, `list`, `key 7`, `invariants`, `validate`, `harden`, `bogus-unknown-cmd`) | `diff -q` 0 bytes across `/usr/local/bin`, `~/.local/bin`, `zoth-os` chroot; all 6 real subcommands pass (`harden` -> `100/100`, `has_no_tests: False`); unknown command exits `2` | `PASS` |
| 6 | `cd ~/NullAITech/zoth-studio-v2 && npm run build && rsync -a --delete dist/ /opt/zoth-studio/dist/ && npm test` | `exit 0`; `registry-check.py`, `test-arsenal`, `test-ground-truth`, `test-serve`, and **`37/37` hydrated routes (`0` console errors)** passed; `/adytum` `<title>` verified as `Adytum Planner // 22-Key Hermetic AI Workbench & Spec Gatekeeper` | `PASS` |
| 7 | `cd ~/NullAITech/zoth-os && pytest -q` | **`12 passed in 3.47s`** (`exit 0`) | `PASS` |
| 8 | Fresh CDP interactive & triple-viewport captures (`/tmp/whiteboard-audit-001-after/`) | `:8135` mobile `<44px`: **`0/33`**; `fool.jpg`: `480×720`; `confirmVisible: true`; `hasOfflineLesson: true`; `boundLabels: 3`; `medControls`: all 3 `true`; Studio God-Mode Deck: `Flawed Spec` → `7/100` (`key9Failed: true`), `Auto-Harden` → `100/100` (`stillSaysNoTests: false`), `literalBackticks: false`, `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0` across all viewports & both themes | `PASS` |

### Fresh Post-Remediation Screenshots (All Visually Inspected via `read_file`)

- **Standalone `:8135`**:
  - [home_desktop.jpg](file:///tmp/whiteboard-audit-001-after/standalone/home_desktop.jpg) (1440×900 — wide card, crisp HD Fool art, full correspondence matrix & BOTA excerpt unclipped)
  - [home_tablet.jpg](file:///tmp/whiteboard-audit-001-after/standalone/home_tablet.jpg) (820×1180)
  - [home_mobile.jpg](file:///tmp/whiteboard-audit-001-after/standalone/home_mobile.jpg) (390×844 — `0/33` tap targets under 44px)
  - [standalone_meditation_controls_desktop.jpg](file:///tmp/whiteboard-audit-001-after/interactive/standalone_meditation_controls_desktop.jpg) (1440×900 — `Pause Timer`, `Complete Early`, `← Back to Key` all unclipped)
- **Zoth Studio `/tools/adytum-alchemist-ai-workflow`**:
  - [tools_adytum-alchemist-ai-workflow_desktop.jpg](file:///tmp/whiteboard-audit-001-after/studio/tools_adytum-alchemist-ai-workflow_desktop.jpg) (Light Mode, `v2.4.0`, crisp `Space Grotesk` daemon heading)
  - [tools_adytum-alchemist-ai-workflow_tablet.jpg](file:///tmp/whiteboard-audit-001-after/studio/tools_adytum-alchemist-ai-workflow_tablet.jpg)
  - [tools_adytum-alchemist-ai-workflow_mobile.jpg](file:///tmp/whiteboard-audit-001-after/studio/tools_adytum-alchemist-ai-workflow_mobile.jpg) (No mid-word CLI wrap)
  - [studio_godmode_light_desktop.jpg](file:///tmp/whiteboard-audit-001-after/interactive/studio_godmode_light_desktop.jpg) (Editorial Ivory Light Mode God-Mode Deck + themed scrollbar + coherent hardened spec)
  - [studio_godmode_dark_desktop.jpg](file:///tmp/whiteboard-audit-001-after/interactive/studio_godmode_dark_desktop.jpg) (Sovereign Obsidian Dark Mode God-Mode Deck)
  - [studio_tool_light_deck_desktop.jpg](file:///tmp/whiteboard-audit-001-after/interactive/studio_tool_light_deck_desktop.jpg) & [studio_tool_dark_deck_desktop.jpg](file:///tmp/whiteboard-audit-001-after/interactive/studio_tool_dark_deck_desktop.jpg) (Embedded `:8135` iframe in Light & Dark Studio)
- **Zoth Studio `/adytum` & `/adytum/docs`**:
  - [adytum_desktop.jpg](file:///tmp/whiteboard-audit-001-after/studio/adytum_desktop.jpg), [adytum_tablet.jpg](file:///tmp/whiteboard-audit-001-after/studio/adytum_tablet.jpg), [adytum_mobile.jpg](file:///tmp/whiteboard-audit-001-after/studio/adytum_mobile.jpg) (Light Mode)
  - [studio_adytum_dark_desktop.jpg](file:///tmp/whiteboard-audit-001-after/interactive/studio_adytum_dark_desktop.jpg) (Dark Mode)
  - [adytum_docs_desktop.jpg](file:///tmp/whiteboard-audit-001-after/studio/adytum_docs_desktop.jpg), [adytum_docs_tablet.jpg](file:///tmp/whiteboard-audit-001-after/studio/adytum_docs_tablet.jpg), [adytum_docs_mobile.jpg](file:///tmp/whiteboard-audit-001-after/studio/adytum_docs_mobile.jpg)

### Updated AGY Perspective (`v2`)

- **What Changed Most**: Closing the truth gap between documentation, CLI, and live runtime completely transformed this tool's credibility. Every CLI command documented in Zoth Studio now genuinely executes and passes deterministic tests; `test_server.py` even caught a subtle Python `urllib.parse.urlparse` quirk (`http://127.0.0.1:8135.evil.com`) before release, proving why real automated tests matter.
- **Standout Upgrades**: Wiring the 22 offline AI-Chemistry lessons directly into `:8135` paired with the `480×720` HD card art and wide desktop layout turned the standalone workstation from a cramped preview into a self-contained study tool; meanwhile, adapting `AdytumPlannerGodModeTool` to Editorial Ivory Light Mode makes the Studio workbench look native in both themes.
- **Remaining Minor Opportunity (Non-Blocking)**: `/adytum/docs` still inherits the root Studio `<title>` because `site.js` does not define a dedicated `/adytum/docs` entry, and standalone `:8135` remains dark-only (intentionally matching its sanctuary theme). Neither blocks a `9+ / 10` release.

---

## 7. v3 Enhancement Pass (Museum Card Overhaul + 15-Provider AI Connection Hub)

### v3 Metadata

| Field | Value |
| :--- | :--- |
| **v3 Start** | `2026-11-25 19:07:27 EST` (`2026-11-26 00:07:27 UTC`) |
| **v3 Completion** | `2026-11-25 19:28:18 EST` (`2026-11-26 00:28:18 UTC`) |
| **Commit (`adytum-alchemist-ai-workflow`)** | `59cce62` (from `286cb75`) |
| **Commit (`zoth-studio-v2`)** | `d4c91a1` (from `87595c8`) |
| **Commit (`zoth-os`)** | `ef204212` (unchanged, `12/12` pytest passing) |
| **v3 Verdict** | **`PASS`** (Composite: **9.66 / 10**, all 5 levels `>= 9.4 / 10`) |

### Updated 5-Level Scorecard (`v1` → `v2` → `v3`)

| Level | `v1` Baseline | `v2` Remediation | `v3` Enhancement | Status | Key v3 Verified Upgrades |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. System** | `7.5 / 10` | `9.5 / 10` | **9.7 / 10** | `PASS` | Threaded loopback bridge in `server.py` (`GET /api/providers`, `POST /api/providers/test`, `POST /api/chat`) with `shell=False` argv execution, `SAFE_MODEL_RE` validation rejecting shell injection (`400`), instant harness/loop wrapper detection (`codex_cli` & `claude_code` report honestly in `0 ms`), and regenerated `1200×630` `og-banner.jpg` + 22 crisp `960×1440` / `560×840` plates. |
| **2. User** | `6.5 / 10` | `9.3 / 10` | **9.7 / 10** | `PASS` | Categorized **15-Engine AI Provider Connection Hub** (8 Local Agents/Daemons + 7 Cloud/Custom APIs) with live `ONLINE`/`CLI READY`/`OFFLINE` badges, live **Test Connection** latency diagnostics, intelligent default to live `AGY Bridge (:18000)`, verified live `POST /api/chat` round-trip (`gemini-3.8-flash-high`, `16,786 ms`), and interactive 3D-tilting/flippable `AdytumArcanaCard` (Front Sacred Geometry ↔ Engraved Hermetic Backplate). |
| **3. Engineer** | `6.0 / 10` | `9.4 / 10` | **9.6 / 10** | `PASS` | `exportSanitizer.ts` extended and unit-tested to redact all 7 cloud/custom API key fields (`openaiApiKey`, `anthropicApiKey`, `geminiApiKey`, `openrouterApiKey`, `xaiApiKey`, `ollamaCloudApiKey`, `customApiKey`); `pytest -v` passes **`7/7`** (`0.25s`), `npm test` passes **`5/5`**, `zoth-studio-v2 npm test` passes **`37/37`** routes + serve/arsenal/ground-truth/registry checks, `zoth-os pytest -q` passes **`12/12`**. |
| **4. UI** | `7.5 / 10` | `9.4 / 10` | **9.8 / 10** | `PASS` | Eliminated all blurry 100×172 scans, clipped borders, and tofu `[]` glyphs across all 22 static plates (`scripts/generate_arcana_plates.py`) AND mounted live vector `AdytumArcanaCard` in both `:8135` and Zoth Studio Light & Dark Modes; **`0/34`** mobile tap targets `<44px`, `0` overflow, `0` console errors, `0` missing `alt` across all inspected v3 captures. |
| **5. Readability** | `5.5 / 10` | `9.3 / 10` | **9.5 / 10** | `PASS` | Crisp DOM typography on card front & engraved backplate (`0`–`XXI`, real Hebrew `א`–`ת` + Gematria, elemental sigil pill, title + concise subtitle), clear separation of Local Sovereign Agents vs Cloud APIs in the Provider Hub, and transparent status details for every provider. |

### Live Multi-Provider Verification Matrix (`127.0.0.1:8135`)

| Provider ID | Group | Transport | Live Observed Status (`POST /api/providers/test`) | Latency | Observed Detail / Models |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `agy_bridge` | Local | HTTP (`:18000`) | **`online`** (`ok: true`) | `2 ms` | 6 models (`gemini-3.8-flash-high`, `gemini-4-argon-medium`, `claude-sonnet-5-5-high`, `claude-opus-5-5-high`, `gpt-oss-120b-medium`) — **live `POST /api/chat` verified (`16,786 ms`)** |
| `ollama_local` | Local | HTTP (`:11434`) | **`online`** (`ok: true`) | `11 ms` | 16 local models (`hermes3-64k:latest`, `hermes3:8b`, `zoth-coder:latest`, `qwen3:1.7b`, etc.) |
| `azoth_local` | Local | HTTP (`:8136`) | **`online`** (`ok: true`) | `2 ms` | `AZOTH Local health: healthy` (`/api/chat`) |
| `agy_cli` | Local | CLI (`agy`) | **`cli_ready`** (`ok: true`) | `186 ms` | `1.5.17` (`agy --model <m> -p <prompt> --output-format text`) |
| `hermes_cli` | Local | CLI (`hermes`) | **`cli_ready`** (`ok: true`) | `1060 ms` | `Hermes Agent v0.23.3+1139.g084538c` (`hermes chat -q <prompt> --oneshot -Q`) |
| `grok_cli` | Local | CLI (`grok`) | **`cli_ready`** (`ok: true`) | `39 ms` | `grok 1.0.70 (f50904eaee6c) [stable]` (`grok -p <prompt> --output-format plain`) |
| `codex_cli` | Local | CLI (`codex`) | `offline` (`ok: false`) | `0 ms` | Honest detection: recursive gatekeeper wrapper detected without underlying `@openai/codex` binary |
| `claude_code` | Local | CLI (`claude`) | `offline` (`ok: false`) | `0 ms` | Honest detection: ZothOS installer harness present (`claude install` required) |
| Cloud & Custom (7) | Cloud | Server-Proxied HTTP | `configured_via_key` | — | `openai`, `anthropic` (CORS-safe proxy), `gemini_api` (`x-goog-api-key` header), `openrouter`, `xai_grok`, `ollama_cloud`, `custom_openai` (`missing_key` verified in `pytest`) |

### Visually Inspected v3 Screenshots & Plates (`read_file` Verified)

- **Regenerated Static Museum Plates & Social Card**:
  - [fool.jpg](https://github.com/1nc0gn30/adytum-alchemist-ai-workflow/blob/main/public/tarot/fool.jpg), [chariot.jpg](https://github.com/1nc0gn30/adytum-alchemist-ai-workflow/blob/main/public/tarot/chariot.jpg), [world.jpg](https://github.com/1nc0gn30/adytum-alchemist-ai-workflow/blob/main/public/tarot/world.jpg), [og-banner.jpg](https://github.com/1nc0gn30/adytum-alchemist-ai-workflow/blob/main/public/og-banner.jpg) (`1200×630`)
- **Standalone `:8135` (Redesigned Card + Backplate + Provider Hub)**:
  - [home_desktop.jpg](file:///tmp/whiteboard-audit-001-v3/standalone/home_desktop.jpg) (1440×900 — Front illuminated plate + `AI: AGY Bridge · gemini-3.8-flash-high`)
  - [home_tablet.jpg](file:///tmp/whiteboard-audit-001-v3/standalone/home_tablet.jpg) (820×1180)
  - [home_mobile.jpg](file:///tmp/whiteboard-audit-001-v3/standalone/home_mobile.jpg) (390×844 — `0/34` tap targets under 44px)
  - [standalone_flipped_backplate_desktop.jpg](file:///tmp/whiteboard-audit-001-v3/interactive/standalone_flipped_backplate_desktop.jpg) (Engraved Hermetic Backplate)
  - [standalone_provider_hub_desktop.jpg](file:///tmp/whiteboard-audit-001-v3/interactive/standalone_provider_hub_desktop.jpg) (15-Engine AI Provider Connection Hub + live `✔ agy_bridge [online] · 2 ms`)
- **Zoth Studio `/tools/adytum-alchemist-ai-workflow` (Dual-Theme `AdytumArcanaCard`)**:
  - [studio_godmode_card_light_desktop.jpg](file:///tmp/whiteboard-audit-001-v3/interactive/studio_godmode_card_light_desktop.jpg) (Editorial Ivory Light Mode)
  - [studio_godmode_card_dark_desktop.jpg](file:///tmp/whiteboard-audit-001-v3/interactive/studio_godmode_card_dark_desktop.jpg) (Sovereign Obsidian Dark Mode)
