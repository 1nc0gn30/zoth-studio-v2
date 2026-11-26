# Whiteboard Verification Audit — #002 `aeo-graph-engine` (AEO Graph Engine & Studio)

## 1. Header Metadata & 5-Level Scorecard

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#002` — `aeo-graph-engine` (`AEO Graph Engine & Studio`) |
| **Audit Pass** | `v1` Baseline (Test & Analysis Audit — Read-Only on Target Repos) |
| **Start Timestamp** | `2026-11-25 19:41:53 EST` (`2026-11-26 00:41:53 UTC`) |
| **Completion Timestamp** | `2026-11-25 19:48:09 EST` (`2026-11-26 00:48:09 UTC`) |
| **Repo Git SHAs** | `aeo-graph-engine` (`main` @ `8815371`, `origin=1nc0gn30`, `nullai=NullAITech`) · `zoth-studio-v2` (`main` @ `9262c8f`) · `zoth-os` (`main` @ `ef204212`) |
| **Audited Surfaces** | Standalone `:8127` (`server.py` on-demand, cleanly stopped after audit), Zoth Studio v2 (`http://127.0.0.1:3000/tools/aeo-graph-engine`), Python/MCP/AI engine (`src/aeo_graph_engine/`), Electron (`electron/main.cjs`), Host & ZothOS chroot CLIs |
| **Composite Score** | **`5.20 / 10`** |
| **Verdict** | **`NEEDS FIX`** |

### 5-Level Scorecard Table

| Level | Focus Area | Score | Status | Key Blocking Drivers |
| :---: | :--- | :---: | :---: | :--- |
| **L1** | **System** (Runtime, REST APIs, Security, CLI, Packaging, SEO) | **5.5 / 10** | `NEEDS FIX` | P0 SSRF on `/api/scan` (+ 5 crawler endpoints), P0 wildcard `ACAO: *` + `OPTIONS 200`, P0 crash (`TypeError: unhashable type: 'list'`) in `validator.py:78`, `POST /api/export-zip` returns `404`, `POST /api/validate` returns `100.0` on malformed JSON |
| **L2** | **User** (Workflow, AI Connections & Functional Utility) | **5.2 / 10** | `NEEDS FIX` | P0 `Audit Report` throws `ReferenceError: currentScanResults is not defined`, P0 plaintext API keys in `localStorage` & `aeo_ai_config.json`, canned `98.5%` AI simulation ignoring providers, missing AGY/Hermes/Codex/Claude/Grok/Gemini/AZOTH, fake `78/100` offline scan fallback, wrong `http.server` launch command |
| **L3** | **Engineer** (Architecture, Code Quality, Tests, Security, Parity) | **6.0 / 10** | `NEEDS FIX` | `237/237` pytest pass (`2.81s`), but 10+ unescaped `innerHTML` XSS sinks in `public/index.html`, 47 MB unused `public/assets/` bloat (57 `.glb` files), 183 KB HTML monolith + duplicated 90 KB `STUDIO_HTML_TEMPLATE`, 3-way version drift (`1.0.0` / `1.4.0` / `2.0.0`) |
| **L4** | **UI** (Visual Craft, Triple-Viewport & Dual-Theme Proof) | **4.8 / 10** | `NEEDS FIX` | P0 broken dark/light hybrid collision on `:8127` (black top bars + Google white body + unreadable pale-gold-on-lavender/white-on-gold pills), `28/47` (`:8127`) & `48/68` (Studio) mobile `<44px` tap targets, hardcoded pitch-black boxes in Studio Light Mode, raw OS scrollbars |
| **L5** | **Readability** (Copy, Hierarchy, Docs, Accessibility) | **4.5 / 10** | `NEEDS FIX` | P0 fabricated `toolsDocumentation.js:710-744` (`TypeScript/Node.js`, phantom `generate_aeo_graph` MCP tool & `aeo-graph build` CLI), `0` `<h1>` tags on `:8127`, `21/22` unbound `<label>`s, `7` (`:8127`) + `3` (Studio) unlabelled icon buttons, raw `` `.env` `` backticks in UI |
| — | **Composite** | **5.20 / 10** | **`NEEDS FIX`** | Remediation required across all 5 levels to reach `>= 9.0 / 10` |

---

## 2. Test Roadmap & Execution Log

### Executed Checks & Observed Outputs
1. **Memory Recall**: `zoth-memory-vault recall "aeo-graph-engine"` — flagged recurring topic (`6+` past Hermes/AGY threads).
2. **Temp Daemon Boot & Cleanup (`:8127`)**:
   - Pre-audit `ss -tlnp | grep 8127`: `PORT_8127_IDLE`.
   - Booted `python3 ~/NullAITech/aeo-graph-engine/server.py --port 8127 --host 127.0.0.1`: ready in `240 ms`, RSS `26,844 KB` (`~26.2 MB`), loopback-only `127.0.0.1:8127`.
   - Note: Visiting `http://127.0.0.1:3000/tools/aeo-graph-engine` also triggered Zoth Studio's on-demand launcher to spawn `python3 server.py --port 8127` (PID `179726`). Both temporary audit PIDs were cleanly stopped; post-audit `ss -tlnp | grep 8127` confirmed `PORT_8127_IDLE_CONFIRMED` and `NO_8127_SERVER_RUNNING`.
3. **REST API & Security Probes (`127.0.0.1:8127`)**:
   - `GET /` (`200`, `183,366 B`), `GET /health` / `/api/health` / `/api/status` (`200`, `version: "1.0.0"`), `GET /api/schema` (`200`, `2,390 B`), `GET /api/mcp/config` (`200`, `python3 -m aeo_graph_engine.mcp_server`).
   - `POST /api/generate` (`200`), `POST /api/knowledge-graph` (`200`).
   - `POST /api/export-zip` → **`404 Endpoint not found`** (only `GET /api/export-zip` works: `200`, `7,403 B` valid ZIP with 5 files).
   - `POST /api/validate`:
     - `{"schema": {...}}` valid partial → `200`, `score: 80.0`, `errors: 1`.
     - `{"schema": {"@context":"http://wrong","@graph":[{"@type":"Bogus"}]}}` → `200`, `score: 44.0`, `errors: 3`.
     - `{"jsonld": "{not valid json"}` / `{}` / raw `{invalid json` → **`200`, `score: 100.0`, `status: "EXCELLENT"`, `errors_count: 0`**.
   - `POST /api/scan` SSRF probes:
     - `http://127.0.0.1:8127/health` → **`HTTP 200`** (scanned itself! `overall_aeo_score: 50.0`).
     - `http://127.0.0.1:3000` → **`curl (52) Empty reply from server`** (unhandled `TypeError: unhashable type: 'list'` in `validator.py:78`).
     - `http://169.254.169.254/latest/meta-data/` → **attempted live IMDS dial** until `curl (28)` 6s timeout.
     - `file:///etc/passwd` → silently mutated to `https://file:///etc/passwd` (`HTTP 200`, `score: 5.0`).
   - CORS / `OPTIONS` probes:
     - `OPTIONS /api/generate` with `Origin: http://127.0.0.1:3000` and `Origin: https://evil.example.com` → both returned **`HTTP 200` + `Access-Control-Allow-Origin: *`**.
     - `GET /health` with `Origin: https://evil.example.com` and `Origin: http://127.0.0.1:8127.evil.com` → both returned **`HTTP 200` + `Access-Control-Allow-Origin: *`**.
   - `--path-as-is` Traversal Oracle:
     - `/../../../../../etc/passwd`, `/../../../../../etc/nonexistent_xyz`, `/%2e%2e/%2e%2e/%2e%2e/etc/passwd` → identical `404 Endpoint not found` (`Content-Length: 339`).
4. **AI Gateway Probes**:
   - `GET /api/ai/settings` → `200`, `active_provider: "heuristic"`, `endpoints.ollama: "http://0.0.0.0:11434"`.
   - `POST /api/ai/test {"provider":"ollama"}` → `200`, `success: true`, `13.3 ms`, `16 models available`.
   - `POST /api/ai/test {"provider":"agy_bridge"}` & `{"provider":"hermes_zoth"}` → `success: false`, `"Unknown provider or unsupported test protocol"`.
   - `POST /api/ai/simulate {"brand_name":"FakeEmpty","domain":"nonexistent.invalid"}` → `200`, canned `"citation_confidence": "98.5%"`.
5. **CLI & Pytest Verification**:
   - `diff -u` across `/usr/local/bin/`, `~/.local/bin/`, and `zoth-os/config/includes.chroot/usr/local/bin/` for both `aeo-graph-engine` (`3,718 B`) and `aeo-graph-engine-tui` (`3,802 B`): **0 diffs (byte-for-byte identical)**.
   - Tested `/opt/zothos-ai-env/bin/aeo --help`, `aeo-graph-engine` (`--help`, `--version`, `--status`, `--json`, `--ui`, `platform`, `--platform`, `check`, `extract`, `prompt`, `--generate-all --dry-run`, `mcp --config cursor`, `knowledge-graph`, `claims`, `bogus-unknown-cmd-xyz` → **`EXIT=2`**).
   - `which aeo-graph`: **NOT ON `$PATH`**.
   - `PYTHONPATH=src python3 -m pytest -q`: **`237 passed in 2.81s` (`EXIT=0`)**.
6. **Headless Capture & Visual Inspection (`capture.mjs` + CDP + `read_file` on EVERY `.jpg`/`.png`)**:
   - Standalone (`http://127.0.0.1:8127/`): `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0` across mobile/tablet/desktop.
     - [home_desktop.jpg](file:///tmp/whiteboard-audit-002/standalone/home_desktop.jpg)
     - [home_tablet.jpg](file:///tmp/whiteboard-audit-002/standalone/home_tablet.jpg)
     - [home_mobile.jpg](file:///tmp/whiteboard-audit-002/standalone/home_mobile.jpg)
     - [standalone_schema_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/standalone_schema_desktop.jpg)
     - [standalone_visualizer_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/standalone_visualizer_desktop.jpg)
     - [standalone_aigateway_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/standalone_aigateway_desktop.jpg)
   - Studio (`http://127.0.0.1:3000/tools/aeo-graph-engine`): `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0` across mobile/tablet/desktop.
     - [tools_aeo-graph-engine_desktop.jpg](file:///tmp/whiteboard-audit-002/studio/tools_aeo-graph-engine_desktop.jpg)
     - [tools_aeo-graph-engine_tablet.jpg](file:///tmp/whiteboard-audit-002/studio/tools_aeo-graph-engine_tablet.jpg)
     - [tools_aeo-graph-engine_mobile.jpg](file:///tmp/whiteboard-audit-002/studio/tools_aeo-graph-engine_mobile.jpg)
     - [studio_mode1_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode1_scrolled_desktop.jpg)
     - [studio_mode2_top_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode2_top_desktop.jpg)
     - [studio_mode2_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode2_scrolled_desktop.jpg)
     - [studio_mode2_docs_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode2_docs_desktop.jpg)
     - [studio_mode2_mobile.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode2_mobile.jpg)
     - [godmode_deck_light.jpg](file:///tmp/whiteboard-audit-002/interactive/godmode_deck_light.jpg)
     - [godmode_deck_dark.jpg](file:///tmp/whiteboard-audit-002/interactive/godmode_deck_dark.jpg)
   - Static Brand Media Inspected:
     - [og-card.png](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/assets/og-card.png) (`1200×630` PNG, HTTP `200`, clean layout; right-side node cluster overlaps)
     - [og-banner.jpg](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/og-banner.jpg) (`1200×624` PNG data misnamed `.jpg`, abstract 3D violin artifact with no text/branding)

---

## 3. 5-Level Deep Findings (Root Causes by `file:line`)

### Level 1 — System Level (`5.5 / 10`)
1. **[P0] Unmitigated SSRF Across 6 Live-Fetch Endpoints**
   - **Location**: [scanner.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/scanner.py#L68-L108), [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L2489-L2606)
   - **Evidence**: `LiveAEOScanner._fetch_url()` performs raw `urllib.request.urlopen()` with zero scheme allowlist (it prepends `https://` to `file:///etc/passwd`) and zero IP validation (loopback `127.0.0.0/8`, `::1`, private RFC1918, link-local/cloud IMDS `169.254.0.0/16`). `POST /api/scan` scanned `127.0.0.1:8127/health` (`HTTP 200`), attempted `127.0.0.1:3000`, and dialed `169.254.169.254`. Same risk applies to `/api/crawl-sitemap`, `/api/bot-audit`, `/api/compare`, `/api/remediate`, `/api/simulate-citation`.
2. **[P0] Wildcard CORS (`Access-Control-Allow-Origin: *`) & `OPTIONS 200`**
   - **Location**: [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L2287-L2316) & [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L2437)
   - **Evidence**: Unconditionally emits `Access-Control-Allow-Origin: *` for all origins (`https://evil.example.com`, `http://127.0.0.1:8127.evil.com`), and `do_OPTIONS` returns `200 OK` instead of `204 No Content` (loopback only) / `403 Forbidden` (non-loopback). Combined with SSRF + `POST /api/ai/settings`, any malicious tab in the user's browser can scan localhost services and overwrite `aeo_ai_config.json`.
3. **[P0] Unhandled Crash on Valid Multi-Type JSON-LD (`@type` as Array)**
   - **Location**: [validator.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/validator.py#L76-L83)
   - **Evidence**: `found_types.add(etype)` raised `TypeError: unhashable type: 'list'` when scanning `http://127.0.0.1:3000`, crashing the HTTP request thread and dropping the TCP connection (`curl (52)`). JSON-LD 1.1 explicitly permits `"@type": ["SoftwareApplication", "WebApplication"]`.
4. **[P1] REST Contract Defects (`/api/export-zip`, `/api/validate`, `/api/generate`)**
   - **Location**: [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L2352-L2379), [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L2515-L2545)
   - **Evidence**: `POST /api/export-zip` returns `404` despite [README.md](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/README.md#L142) documenting `POST /api/export-zip`; `POST /api/validate` silently ignores malformed JSON or missing `schema` keys and returns `HTTP 200 {"score": 100.0, "status": "EXCELLENT"}`; `POST /api/generate` hardcodes `"score": 100.0`.
5. **[P1] Static Path Containment Prefix Bug**
   - **Location**: [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L2427-L2428)
   - **Evidence**: `str(static_file).startswith(str(candidate_root.resolve()))` lacks `os.sep` or `Path.is_relative_to()`, allowing sibling prefix matches (e.g., `public_secrets/`). Traversal to `/etc/passwd` returned `404` (`339 B`), matching nonexistent paths.
6. **[P1] CLI & Asset Hygiene Gaps**
   - **Location**: [/usr/local/bin/aeo-graph-engine](file:///usr/local/bin/aeo-graph-engine#L86-L114), [/usr/local/bin/aeo-graph-engine-tui](file:///usr/local/bin/aeo-graph-engine-tui#L204-L255), [og-banner.jpg](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/og-banner.jpg), [sitemap.xml](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/sitemap.xml)
   - **Evidence**: `--status` hardcodes `"status": "READY"` without probing `:8127`; `--ui` prints generic banner; `aeo-graph-engine-tui` is a boilerplate `math.sin()` stub with `"Sovereign Aeo Graph Engine engine"` typo and unrelated `-14.0 LUFS` / `canvasui-html-effects` metadata; `aeo-graph` is not on `$PATH`; `public/og-banner.jpg` is a `1200×624` PNG with `.jpg` extension; `sitemap.xml` `<lastmod>` is stale (`2026-10-08`).

### Level 2 — User Level (`5.2 / 10`)
1. **[P0] Broken Header Action (`◆ Audit Report` throws `ReferenceError`)**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L3551-L3569)
   - **Evidence**: `exportFullAuditReportModal()` reads nonexistent `#inpScannerUrl` (real ID: `#inpScanUrl`) and undefined `currentScanResults` (real var: `lastScanData`). Verified live via CDP: clicking it triggers `ALERT: Could not generate report: currentScanResults is not defined`.
2. **[P0] Plaintext API Key Storage in `localStorage` & World-Readable Config File**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L3200-L3245), [ai_gateway.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ai_gateway.py#L58), [ai_gateway.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ai_gateway.py#L127)
   - **Evidence**: Cloud keys (`openai`, `anthropic`, `perplexity`, `groq`, `openrouter`, `deepseek`) are saved in plaintext in `localStorage['aeo_ai_gateway_settings']` and written via `atomic_write_text()` to `./aeo_ai_config.json` in CWD (risking accidental git commits and `0644` exposure).
3. **[P0] Canned / Non-Functional AI Simulation & Client Fallbacks**
   - **Location**: [ai_gateway.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ai_gateway.py#L389-L426), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L2345-L2378), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L2855-L2905), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L3681-L3712), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L2688-L2719)
   - **Evidence**:
     - `simulate_answer_engine_perception()` never calls any LLM — returns hardcoded `"98.5%"` even for `nonexistent.invalid`.
     - `executeLiveScan()` catch block fabricates a fake `78/100` audit (`robots_txt: true`, `word_count: 850`) whenever `/api/scan` fails.
     - `handleClientAeoApi()` fakes `keys_status: { openai: true, anthropic: true, deepseek: true, openrouter: true }` and `score: 100` for `/api/bot-audit`, `/api/compare`, `/api/simulate-citation`.
     - `loadEntityVisualizer()` renders 4 hardcoded nodes (`AEO Graph Engine`, `1nc0gn30`) and is never refreshed by `selectPreset()` / `regenerateAll()`.
     - `selectMcpClient()` outputs broken configs (`npx -y aeo-graph-engine mcp-server`, `node bin/aeo.js mcp`, `https://${domain}/api/mcp/sse`, `aeo_schema_lookup`).
4. **[P1] Missing Sovereign Multi-Provider AI Connections**
   - **Location**: [ai_gateway.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ai_gateway.py#L23-L48), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L1530-L1540)
   - **Evidence**: Missing **AGY Bridge (`:18000`)**, **AGY CLI**, **Hermes CLI**, **Codex CLI**, **Claude Code CLI**, **Grok CLI**, **AZOTH (`:8136`)**, **Google Gemini**, **xAI Grok**, **Ollama Cloud**, and **Custom OpenAI-Compatible**. `hermes_zoth` is listed in `endpoints` (`:8788`, mismatched against `:8094` in `index.html:2354`) yet fails `POST /api/ai/test` with `"Unknown provider"`.
5. **[P1] Wrong Launch Command & Disconnected Studio God-Mode Deck**
   - **Location**: [toolsData.js](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/data/toolsData.js#L334), [tools.json](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/public/api/tools.json#L355), [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L191), [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L244-L268)
   - **Evidence**: `pull` instructs `python3 -m http.server 8127 --directory public` (wipes out all `/api/*` endpoints). `AeoGraphEngineGodModeTool.jsx` does not connect to `:8127`, lacks `llms.txt`/`ai.txt`/`robots.txt` tabs, has a hardcoded `'19.00'` fallback offer price, `+1-555-555-0199` placeholder phone, minimum score floor of `60/100` on blank input, and a hardcoded `Math.max(88, score - 1)` floor for ClaudeBot.

### Level 3 — Engineer Level (`6.0 / 10`)
1. **[P0] 10+ Unescaped `innerHTML` XSS Sinks in `public/index.html`**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L2947-L3062), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L3639-L3665), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L3735-L3742), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L3841-L3876)
   - **Evidence**: Untrusted crawled HTML metadata (`p.title`, `p.url`, `p.h1`, `item.issue`, `q.quote`, `ent.name`) is interpolated directly into `innerHTML`. Scanning a malicious page executes JS in `http://127.0.0.1:8127` and can steal plaintext API keys from `localStorage`.
2. **[P1] 47 MB Unused Asset Bloat in `public/assets/`**
   - **Location**: `~/NullAITech/aeo-graph-engine/public/assets/` (79 files, `47M`)
   - **Evidence**: Contains 57 unreferenced `gpu-blender-v1.glb`..`gpu-blender-v57.glb` files (~22 MB) plus `gpu-showreel-sfx.wav` (5.7 MB), `gpu-ad-15s.mp4` (4.8 MB), `gpu-showreel-30s.mp4` (4.8 MB), `gpu-ad-vertical-9x16.mp4` (3.9 MB).
3. **[P1] 183 KB Monolith + Stale 90 KB Duplicate Template + External CDN Egress**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L128-L132), [ui_server.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/ui_server.py#L49-L2278)
   - **Evidence**: `public/index.html` loads Google Fonts + `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` (breaking zero-egress claims), while `ui_server.py` embeds a diverged 2,230-line `STUDIO_HTML_TEMPLATE`.
4. **[P1] 3-Way Version Drift & `netlify-ax` Alias Ambiguity**
   - **Location**: [pyproject.toml](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/pyproject.toml#L7) (`1.0.0`), [__init__.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/__init__.py#L8) (`1.0.0`), [toolsData.js](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/data/toolsData.js#L333) (`1.4.0`), [package.json](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/package.json#L3) (`2.0.0`), [RealToolWorkspacePage.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/pages/RealToolWorkspacePage.jsx#L260), [workstations.js](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/data/workstations.js#L141-L148)
   - **Evidence**: Three conflicting versions across Python, Studio, and npm. `RealToolWorkspacePage.jsx:260` aliases `'netlify-ax'` (described in `workstations.js` as *Zoth Netlify AX & Serverless Edge Console*) to `AeoGraphEngineGodModeTool`, which is intentional cross-routing for AX/AEO (`public/api/netlify-ax.json` lives in `aeo-graph-engine`) but lacks any Netlify AX edge panel inside `AeoGraphEngineGodModeTool`.
5. **[P2] Preset Default Leakage & 0-Entity 100% Score**
   - **Location**: [core.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/core.py), [knowledge_graph.py](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/src/aeo_graph_engine/knowledge_graph.py)
   - **Evidence**: `POST /api/generate` for `audit.example.com` leaked `"name": "NullAI"`, `"logo": "https://aeo.nullai.tech/assets/logo.svg"`; `aeo-graph-engine knowledge-graph public/index.html --format json` returned `entities_count: 0` with `entity_coverage_score: 100.0`.
   - *Clean checks*: `electron/main.cjs:88-91` properly sets `nodeIntegration: false, contextIsolation: true`; `.coverage` is listed in `.gitignore:41` and NOT git-tracked.

### Level 4 — UI Level (`4.8 / 10`)
1. **[P0] Schizophrenic Dark/Light Theme Collision on `:8127`**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L2), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L134-L155), [zoth-theme.css](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/zoth-theme.css#L112-L126)
   - **Evidence** (visually verified in [home_desktop.jpg](file:///tmp/whiteboard-audit-002/standalone/home_desktop.jpg) & [standalone_aigateway_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/standalone_aigateway_desktop.jpg)): `zoth-theme.css` overrides `--google-blue` to gold `#D4AF37` and injects dark top bars while leaving `--surface-bg: #ffffff` and `--canvas-bg: #f8f9fa` white, creating:
     - Pale-gold text on pastel lavender/white (`Synthesize`, `DeFi`/`AI SaaS`/`Plumbing`, `Audit Report`, active tab underline).
     - White text on metallic gold `#D4AF37` (`Download .zip`, `Scan Website`, `Test Connection`, `Refresh Graph`) — fails WCAG AA.
     - Nearly invisible `0.3` temperature readout (`#EDEFF2` on `#FFFFFF`).
     - Google 4-color dots next to Zoth Studio gold branding.
2. **[P0] Triple Stacked Header, Nested Studio Chrome & Mobile Tap-Target Deficit**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L953-L999), [RealToolWorkspacePage.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/pages/RealToolWorkspacePage.jsx)
   - **Evidence**: Verified in [home_mobile.jpg](file:///tmp/whiteboard-audit-002/standalone/home_mobile.jpg), [home_tablet.jpg](file:///tmp/whiteboard-audit-002/standalone/home_tablet.jpg), [studio_mode2_scrolled_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode2_scrolled_desktop.jpg):
     - `28 / 47` mobile interactive elements on `:8127` (`22–37 px` height) and `48 / 68` on Studio (`25–38 px`) fail the `>= 44px` tap-target minimum.
     - Tablet header squishes `AEO Studio`, `100 / 100`, `Audit Report`, `Download .zip` onto awkward 2-line pills; mobile hides `AI Keys & Ports` (`display: none !important` at `index.html:958`) and stacks the entire sidebar before the workspace tabs.
     - Studio's `:8127` iframe renders a second "Zoth Studio" top bar inside Zoth Studio.
3. **[P1] Hardcoded Dark Cards in Studio Light Mode**
   - **Location**: [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L643), [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L711), [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L698)
   - **Evidence** (visually verified in [godmode_deck_light.jpg](file:///tmp/whiteboard-audit-002/interactive/godmode_deck_light.jpg)): Pitch-black `#06080E` Entity Graph canvas box and `#05060A` JSON-LD code box clash starkly with Editorial Ivory Light Mode (`#FAF8F3`); `LinearProgress` track (`rgba(255,255,255,0.08)`) is invisible on light backgrounds.
4. **[P1] Raw OS Scrollbars & Corner Clipping**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L366-L373) (`tabs-bar`), [tools_aeo-graph-engine_desktop.jpg](file:///tmp/whiteboard-audit-002/studio/tools_aeo-graph-engine_desktop.jpg), [studio_mode2_docs_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/studio_mode2_docs_desktop.jpg)
   - **Evidence**: Unstyled OS horizontal scrollbars bisect the 18-tab bar on `:8127` and the CLI command pill on Studio; `Tool Motion Showcase` top eyebrow clips slightly at rounded top-left/top-right corners.

### Level 5 — Readability Level (`4.5 / 10`)
1. **[P0] Fabricated Studio Documentation Entry (`toolsDocumentation.js`)**
   - **Location**: [toolsDocumentation.js](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/data/toolsDocumentation.js#L710-L744)
   - **Evidence**:
     - Line 713: falsely states `TypeScript / Node.js compiler` (actual: pure Python 3.9+ stdlib).
     - Line 715: documents phantom MCP tool `generate_aeo_graph` (does not exist; real server exposes 12 `aeo_*` tools: `aeo_scan_site`, `aeo_synthesize_prompt`, `aeo_generate_bundle`, `aeo_inject_html`, `aeo_validate`, `aeo_get_framework_snippets`, `aeo_simulate_citation`, `aeo_visualize_schema`, `aeo_crawl_sitemap`, `aeo_extract_knowledge_graph`, `aeo_analyze_claims`, `aeo_generate_claim_matrix`).
     - Line 717: documents phantom CLI command `aeo-graph build --config ./site.config.js --out public/schema.jsonld`.
     - Lines 733–735: uses `NullAITech` org clone URL and `npm install && npm test` instead of `1nc0gn30` + `pip install -e .` + `python3 server.py --port 8127` + `PYTHONPATH=src python3 -m pytest -q`.
2. **[P0] Accessibility & Landmark Failures**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L1020-L1620), [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L612-L619)
   - **Evidence** (measured via CDP):
     - `:8127` has **`0` `<h1>` headings** (`h1Count: 0`), **`21 / 22` `<label>`s without `for="..."`**, and **`7` unlabelled icon buttons** (6× `◉` password toggles + `✕` modal close).
     - Studio `AeoGraphEngineGodModeTool.jsx` has **`3` unlabelled delete-FAQ icon buttons**.
3. **[P1] Typography, Raw Markdown & Copy Hygiene**
   - **Location**: [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L1113), [public/index.html](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/index.html#L1574), [AeoGraphEngineGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AeoGraphEngineGodModeTool.jsx#L434), [README.md](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/README.md#L62-L67)
   - **Evidence**:
     - Raw backticks `` `.env` `` rendered literally in UI (`index.html:1574`, visible in [standalone_aigateway_desktop.jpg](file:///tmp/whiteboard-audit-002/interactive/standalone_aigateway_desktop.jpg)).
     - `Celtic Garamond` renders `Deterministic Schema.org @graph` with illegible `r`/`i` glyph confusion (`godmode_deck_light.jpg`).
     - Stale `http://127.0.0.1:8090` default scan URL & `Localhost (8090)` button on `:8127`.
     - Banned hype adjective `'world-class'` rendered in Studio's 15s showreel prompt (`studio_initial.cliText`).
     - `README.md:62` still suggests `python3 -m http.server 8127 --directory public` and `README.md:67` claims `aeo-graph` is on ZothOS `$PATH`.

---

## 4. Prioritized Fix & Enhancement Backlog

### P0 — Security, Crashes & Broken Core Actions (Must Fix First)
1. **SSRF Protection Module (`src/aeo_graph_engine/net_guard.py`)**: Validate `http`/`https` schemes only, resolve hostnames via `socket.getaddrinfo()`, and block loopback (`127.0.0.0/8`, `::1`), RFC1918 private ranges, link-local/IMDS (`169.254.0.0/16`, `fe80::/10`), multicast, and unspecified IPs across `scanner.py`, `crawler.py`, `bot_inspector.py`, `citation_simulator.py`, and `ui_server.py` (with explicit opt-in flag only for unit tests).
2. **Strict Loopback CORS & `OPTIONS 204` (`ui_server.py`)**: Replace `Access-Control-Allow-Origin: *` with `urllib.parse.urlparse()` + `.port` + strict `netloc` regex validation allowing only `http(s)://(127.0.0.1|localhost)(:<port>)?`; return `204 No Content` on valid `OPTIONS` and `403 Forbidden` on non-loopback `Origin`. Fix static containment to `static_file.is_relative_to(candidate_root.resolve())`.
3. **Fix `validator.py:78` Crash & `POST /api/validate` False Positives**: Normalize `etype` when `isinstance(etype, list)` (iterate strings); reject malformed JSON bodies with `HTTP 400` and missing/empty `schema` with `HTTP 400` instead of `score: 100.0 EXCELLENT`.
4. **Eliminate XSS Sinks (`public/index.html`)**: Add an `escapeHtml()` helper and/or `textContent` DOM nodes for every crawled/API string (`p.title`, `p.url`, `p.h1`, `item.issue`, `q.quote`, `ent.name`, `data.message`).
5. **Fix `◆ Audit Report` Button (`public/index.html:3551-3569`)**: Wire to `#inpScanUrl` and `lastScanData` with proper null handling and non-blocking toast feedback.
6. **Eliminate Plaintext API Key Storage**: Never persist cloud API keys in `localStorage` or CWD `aeo_ai_config.json`; keep keys in-memory or OS-restricted `~/.config/aeo-graph-engine/secrets.json` (`chmod 0600`) and enforce strict redaction on all JSON/ZIP exports.
7. **Unify Theme & Contrast on `:8127`**: Remove the broken Google-white / Zoth-dark collision; implement a cohesive Obsidian Dark + Editorial Ivory Light dual-theme with WCAG AA contrast (`>= 4.5:1`), remove Google 4-color dots and duplicate Zoth brand strip (especially when embedded in Studio iframe via `?embed=1` or `window.self !== window.top`), and fix `0` `<h1>` + `21` unbound `<label>`s + `7` unlabelled icon buttons.
8. **Fix Fabricated Studio Docs (`toolsDocumentation.js:710-744`)**: Document actual Python 3.9+ stdlib architecture, all 12 real `aeo_*` MCP tools, real `aeo-graph-engine` / `aeo` CLI commands, and accurate quickstart (`python3 server.py --port 8127`).

### P1 — Functional Parity, Multi-Provider AI & UI Polish
1. **15-Provider Sovereign AI Hub (`ai_gateway.py` + UI)**: Wire real, verified non-interactive connections to **AGY Bridge (`:18000`)**, **AGY CLI**, **Hermes CLI**, **Codex CLI** (with loop guard), **Claude Code CLI** (with installer-harness guard), **Grok CLI**, **Ollama Local (`:11434`)**, **AZOTH (`:8136`)**, plus Cloud/Custom APIs (**OpenAI**, **Anthropic**, **Google Gemini**, **OpenRouter**, **xAI Grok**, **Perplexity**, **Groq**, **Custom OpenAI-Compatible**). Make `POST /api/ai/simulate` and `/api/agent/synthesize` genuinely invoke the active provider (with clear offline heuristic fallback labeled honestly, never faking `"98.5%"`).
2. **Support `POST /api/export-zip` + Real `score` Calculation on `/api/generate`**: Accept both `GET` and `POST` on `/api/export-zip`; run `validate_schema_jsonld_dict` on generated output instead of hardcoding `100.0`; stop leaking `NullAI` / `aeo.nullai.tech` preset defaults into custom user domains.
3. **Fix Broken Client Tabs (`Entity Visualizer`, `MCP Hub`, `Live Scanner` Fallback)**: Wire `Entity Visualizer` to real `/api/visualize-schema` on every `regenerateAll()`; wire `MCP Hub` to real `/api/mcp/config` (remove phantom `npx`/`node bin/aeo.js` snippets); replace fake `78/100` scan fallback with an honest offline error state + local HTML paste scanner.
4. **Upgrade `AeoGraphEngineGodModeTool.jsx` & Studio Metadata**: Adapt Entity Graph canvas & JSON-LD code card to Editorial Ivory Light Mode; add `aria-label` to Delete FAQ buttons; replace `Celtic Garamond` technical headings with crisp `Space Grotesk`; remove `+1-555-555-0199` / `'19.00'` fallbacks & `88%` ClaudeBot floor; fix `toolsData.js:334` + `public/api/tools.json:355` `pull` command to `python3 server.py --port 8127`; add optional `:8127` live bridge + `llms.txt` / `ai.txt` / `robots.txt` export tabs.
5. **Mobile Tap Targets (`>= 44px`) & Scrollbars**: Bring all mobile interactive targets on `:8127` (`28 → 0` under 44px) and Studio (`48 → 0` under 44px) to `>= 44×44px`; keep `AI Keys & Ports` accessible on mobile; replace raw OS scrollbars with subtle custom thin scrollbars; clean raw `` `.env` `` backticks.
6. **Prune 47 MB Unused Asset Bloat & Fix `og-banner.jpg` / `sitemap.xml`**: Remove unused 57 `gpu-blender-v*.glb` & giant `.wav`/`.mp4` files from `public/assets/`, regenerate a genuine `1200×630` JPEG `og-banner.jpg` (or consolidate on a crisp `og-card.png`), update `sitemap.xml` `<lastmod>`, and bundle JSZip locally (or use `/api/export-zip`) so offline mode has zero CDN dependency.
7. **Unify Version (`2.1.0` or `2.0.0`) & Upgrade CLI/TUI**: Align version across `pyproject.toml`, `__init__.py`, `package.json`, `ui_server.py`, `toolsData.js`, `tools.json`, and `/usr/local/bin/aeo-graph-engine`; make `--status` probe `127.0.0.1:8127/health` live; replace boilerplate `aeo-graph-engine-tui` with a real AEO telemetry/validator TUI; expose `aeo-graph` symlink if documented.

### P2 — Structural Cleanup & Edge Cases
1. **Remove 90 KB Duplicate `STUDIO_HTML_TEMPLATE` in `ui_server.py:49-2278`**: Serve `public/index.html` cleanly with a minimal 20-line fallback HTML if `public/` is absent.
2. **Fix `knowledge_graph.py` 0-Entity Score**: Return `0.0` (not `100.0`) when `entities_count == 0`.
3. **Clean Copy**: Remove `'world-class'` from the Studio showreel prompt generator; update `README.md:62` to drop `python3 -m http.server`.

---

## 5. AGY Perspective (Feedback / Enhancements / Appreciation)

- **Appreciation**: Underneath the UI/security debt sits a genuinely capable, zero-dependency Python engine (`237` passing tests in `2.81s`, 12 real JSON-RPC 2.0 MCP tools, multi-framework exporters for 8 web stacks, RFC-aware bot inspector, claim-evidence matrix with `#:~:text=` fragments, and byte-for-byte synced ZothOS CLI wrappers). That strong core means a focused remediation pass can elevate `#002` cleanly above `9.3 / 10`.
- **Critical Feedback**: The single highest-risk pattern found here is the combination of **wildcard CORS (`*`) + unguarded SSRF (`/api/scan`) + unescaped `innerHTML` XSS + plaintext `localStorage` API keys**. Any one of those is a blocker; together they form a complete browser-to-localhost exploit chain. Visually, injecting `zoth-theme.css` on top of a Google-white Material HTML sheet created a severe dark/light contrast clash that hides the engine's real depth.
- **High-Leverage Enhancements for the 9+/10 Upgrade Pass**:
  1. Reuse the hardened loopback-CORS + 15-provider AI Gateway architecture proven in `#001` (`adytum-alchemist-ai-workflow`) so AEO Studio can run real live citation perception & schema synthesis on **AGY Bridge (`:18000`)**, **Ollama (`:11434`)**, **Hermes**, and **AZOTH (`:8136`)**.
  2. Add an interactive SVG/Canvas Knowledge Graph visualizer driven directly by the compiled `@graph` AST (with Light & Dark palettes) that updates live as the user edits fields.
  3. Add a dedicated `pytest` security regression suite (`tests/test_security_and_contracts.py`) locking in SSRF rejection, loopback CORS + `OPTIONS 204`, `@type: [...]` list handling, `POST /api/export-zip`, and strict `POST /api/validate` error codes.

---

## 6. Post-Remediation Re-Audit (`v2`) — PASS (`9.52 / 10`)

### Metadata & Commit SHAs

| Field | Value |
| :--- | :--- |
| **Remediation Window** | `2026-11-25 19:56:17 EST` → `2026-11-25 20:13:53 EST` (`00:56:17` → `01:13:53 UTC`) |
| **Version Unified** | `v2.1.0` across `pyproject.toml`, `__init__.py`, `presets.py`, `package.json`, `ui_server.py`, `toolsData.js`, `public/api/tools.json`, and ZothOS CLI/TUI |
| **Repo Commit SHAs** | `aeo-graph-engine` (`926de1f`) · `zoth-os` (`67540bf6`) · `zoth-studio-v2` (committed alongside this `v2` report) |
| **Live Daemon State** | Running cleanly on `127.0.0.1:8127` (`server.py`, PID `188941`, `v2.1.0`, `GET /health` `200 OK`) |
| **Post-Remediation Composite** | **`9.52 / 10`** (up from `5.20 / 10`, **`+4.32`**) |
| **Verdict** | **`PASS`** (all 5 levels `>= 9.4 / 10`) |

### Before (`v1`) vs After (`v2`) Scorecard

| Level | Focus Area | `v1` Baseline | `v2` Post-Remediation | Delta | Verified Evidence |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **L1** | **System** | `5.5 / 10` | **`9.6 / 10`** | `+4.1` | SSRF `403` in `<1 ms` (`127.0.0.1`, `169.254.169.254`, `10.0.0.1`, `file://`), strict loopback CORS + `OPTIONS 204` / evil `403`, `CSP: frame-ancestors` for `:3000`, `Path.is_relative_to()` (`404` `26 B` == `26 B`), array `@type` `200`, `POST /api/export-zip` `200`, `POST /api/validate` malformed `400`, `v2.1.0` unified, byte-for-byte live-probe CLI & benchmark TUI, `1200×630` `og-card.png` + `og-banner.jpg`, `sitemap.xml` `2026-11-25` |
| **L2** | **User** | `5.2 / 10` | **`9.5 / 10`** | `+4.3` | `◆ Audit Report` fixed (`auditErr: null`, downloads `AEO_AUDIT_REPORT.md`), 15+ provider AI Hub (`6` local ready: `agy_bridge :18000` `1.2 ms`, `ollama_local :11434` `13.0 ms`, `azoth_local :8136` `1.5 ms`, `agy_cli`, `hermes_cli`, `grok_cli`, loop-guarded `codex_cli`), live LLM `POST /api/ai/simulate` (`agy_bridge` / `gemini-3.8-flash-high`, `14,379.6 ms`, `mode: "live_llm"`), zero `localStorage` keys (`lsKeyLeakCount: 0`), `0600` secrets store, live SVG Knowledge Graph sync (`svgSynced: true`), real 12-tool MCP Hub, Offline HTML Paste Auditor (`/api/scan-html`), Studio `llms.txt`/`ai.txt`/`robots.txt` tabs + `:8127` live validator |
| **L3** | **Engineer** | `6.0 / 10` | **`9.6 / 10`** | `+3.6` | `aeo-graph-engine` `259 passed in 7.28s` (22 new tests in `tests/test_security_and_contracts.py`), `zoth-os` `12 passed in 3.34s`, `zoth-studio-v2` `37/37` hydrated routes (`0` errors), XSS verified blocked (`xssFired: false`), `public/assets/` pruned `47 MB` → `60 KB`, stale 90 KB `STUDIO_HTML_TEMPLATE` removed, zero external CDN dependencies |
| **L4** | **UI** | `4.8 / 10` | **`9.5 / 10`** | `+4.7` | Unified Obsidian Noir Dark + Editorial Ivory Light dual-theme on `:8127` (zero Google dots, zero dark/light collision, crisp `0.3` readout, zero double chrome in Studio iframe), spaced SVG Knowledge Graph, `overflowPx: 0` & `errors: []` across all 6 viewports, **`0 / 38`** mobile `<44px` tap targets on `:8127`, Studio Light Mode adapted (`darkBoxesInLightMode: 0`, `unlabelledIconBtns: 0`) |
| **L5** | **Readability** | `4.5 / 10` | **`9.4 / 10`** | `+4.9` | `toolsDocumentation.js:710-744` accurately documents Python 3.9+ stdlib, all 12 real `aeo_*` MCP tools, real `aeo-graph-engine` CLI & `server.py --port 8127`; `toolsData.js`, `tools.json`, `README.md` drop `http.server`; `'world-class'` removed (`hasWorldClassHype: false`); `:8127` `h1Count: 1`, `unboundLabelCount: 0` (`24/24`), `unlabelledIconBtnCount: 0`, `hasBackticks: false`; `Space Grotesk` headings in Studio |
| — | **Composite** | **`5.20 / 10`** | **`9.52 / 10`** | **`+4.32`** | **`PASS`** |

### Fresh Visually Inspected Screenshots (`read_file` Verified)
- Standalone (`http://127.0.0.1:8127`):
  - [home_desktop.jpg](file:///tmp/whiteboard-audit-002-after/standalone/home_desktop.jpg)
  - [home_tablet.jpg](file:///tmp/whiteboard-audit-002-after/standalone/home_tablet.jpg)
  - [home_mobile.jpg](file:///tmp/whiteboard-audit-002-after/standalone/home_mobile.jpg)
  - [standalone_kg_dark.jpg](file:///tmp/whiteboard-audit-002-after/interactive/standalone_kg_dark.jpg)
  - [standalone_kg_light.jpg](file:///tmp/whiteboard-audit-002-after/interactive/standalone_kg_light.jpg)
  - [standalone_aihub_dark.jpg](file:///tmp/whiteboard-audit-002-after/interactive/standalone_aihub_dark.jpg)
  - [standalone_aihub_light.jpg](file:///tmp/whiteboard-audit-002-after/interactive/standalone_aihub_light.jpg)
- Zoth Studio v2 (`http://127.0.0.1:3000/tools/aeo-graph-engine`):
  - [tools_aeo-graph-engine_desktop.jpg](file:///tmp/whiteboard-audit-002-after/studio/tools_aeo-graph-engine_desktop.jpg)
  - [tools_aeo-graph-engine_tablet.jpg](file:///tmp/whiteboard-audit-002-after/studio/tools_aeo-graph-engine_tablet.jpg)
  - [tools_aeo-graph-engine_mobile.jpg](file:///tmp/whiteboard-audit-002-after/studio/tools_aeo-graph-engine_mobile.jpg)
  - [studio_embed_light.jpg](file:///tmp/whiteboard-audit-002-after/interactive/studio_embed_light.jpg)
  - [studio_godmode_light.jpg](file:///tmp/whiteboard-audit-002-after/interactive/studio_godmode_light.jpg)
  - [studio_godmode_dark.jpg](file:///tmp/whiteboard-audit-002-after/interactive/studio_godmode_dark.jpg)
- Regenerated Brand Assets (`1200×630`):
  - [og-card.png](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/assets/og-card.png)
  - [og-banner.jpg](https://github.com/1nc0gn30/aeo-graph-engine/blob/main/public/og-banner.jpg)

### Updated AGY Perspective (`v2`)
- **What Changed**: Closed the entire browser-to-localhost exploit chain (SSRF + wildcard CORS + `innerHTML` XSS + plaintext `localStorage` keys), fixed the JSON-LD array `@type` crash, replaced canned `"98.5%"` AI output with a live 15+ provider gateway verified against `agy_bridge` (`gemini-3.8-flash-high`) and `ollama_local`, cut `47 MB` of unused asset bloat down to `60 KB`, unified `v2.1.0` across all 3 repos, and visually caught & fixed an `X-Frame-Options: SAMEORIGIN` iframe block via loopback-scoped `CSP: frame-ancestors`.
- **Remaining Minor Opportunity**: When syncing `aeo-graph-engine` to GitHub remotes (`origin=1nc0gn30`, `nullai=NullAITech`), push `main` (`926de1f`) cleanly without force-push whenever ready.
