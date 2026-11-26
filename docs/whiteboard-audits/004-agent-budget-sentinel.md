# Whiteboard Verification Audit — #004 `agent-budget-sentinel` (Agent Budget Sentinel)

## 1. Header Metadata & 5-Level Scorecard

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#004` — `agent-budget-sentinel` (**Agent Budget Sentinel**) |
| **Audit Mode** | Baseline Read-Only 5-Level Verification Audit (target repos untouched; live daemon `PID 2003` preserved) |
| **Audit Start (EST / UTC)** | `2026-11-25 21:30:45 EST` / `2026-11-26 02:30:45 UTC` |
| **Audit Completion (EST / UTC)** | `2026-11-25 21:37:24 EST` / `2026-11-26 02:37:24 UTC` |
| **Repo & Git State** | `~/NullAITech/agent-budget-sentinel` (`main` @ `16071b8`, clean working tree; `origin=https://github.com/1nc0gn30/agent-budget-sentinel.git`; **missing `nullai` remote**) |
| **Sibling Repos Inspected** | `~/NullAITech/zoth-studio-v2` (`main` @ `a979e4a`), `~/NullAITech/zoth-os` (`main` @ `e8e77f36`) |
| **Observed Versions (3-Way Drift)** | `2.5.0` (`package.json`, `toolsData.js`, `cli.py:143,243`, `/usr/local/bin/agent-budget-sentinel`) vs `v2.5` (`public/index.html:109`) vs `1.0.0` (`pyproject.toml:7`, `server.py:78`, `cli.py:55`) |
| **Live Daemons Preserved** | `PID 2003` (`127.0.0.1:8110` Web/REST/SSE + `127.0.0.1:8111` Inline Proxy, `RSS 28,648 KB`, `0.0%` CPU, uptime `12:29:49`, `breaker_state: "CLOSED"`) |
| **Automated Test Baseline** | `PYTHONPATH=src python3 -m pytest -q tests` → **`34 passed in 3.68s`** (`EXIT=0`) |
| **Overall Verdict** | **`NEEDS FIX`** — **`4.92 / 10`** |

### 5-Level Verification Scorecard

| Level | Dimension | Score | Status | Primary Root Causes |
| :---: | :--- | :---: | :---: | :--- |
| **L1** | **System & Security** | **`4.2 / 10`** | `FAIL` | Proxy SSRF & `file://` local file open via `X-Target-Url` (`proxy.py:80,178-192`); hostname-spoof CORS/CSRF bypass (`127.0.0.1:8110.evil.com` echoed on `:8110` & `:8111`); `?limit=abc` handler crash (`HTTP 000`); `45 MB` asset bloat (`59` `.glb` files); fake boilerplate TUI; chroot drift. |
| **L2** | **User & Workflow** | **`4.8 / 10`** | `FAIL` | Studio `AgentBudgetSentinelGodModeTool.jsx` is 100% disconnected mock (`callsAfterGodMode: []`); `budget_engine.js:104` hardcodes port `8110` and falls back to fabricated spend/transactions + writes fake `BUDGET-PRO-2026` license keys; `breaker.py` fails to hydrate SQLite spend on restart (`$0.0000` vs `$0.99745` in DB); `agent-budget run -- cmd` crashes with `PermissionError: '--'`; outdated 2024 pricing. |
| **L3** | **Engineer & Security** | **`5.2 / 10`** | `NEEDS FIX` | Unescaped `innerHTML` XSS sink in `public/assets/sovereign-upgrade.js:231-240` + broken `/assets/gpu-vertical-ad-9x16.mp4` filename; zero security/edge-case tests for SSRF, CORS spoof, invalid params, or `run --`; external Google Fonts CDN contradicts `"zero-egress"` metadata. |
| **L4** | **UI, Visual & Accessibility** | **`5.0 / 10`** | `NEEDS FIX` | Corrupted `public/assets/banner.png` (`og:image` white-on-white illegible text, tofu glyphs `[]`, forbidden `$19` paywall badge); zero Light Mode on `:8110`; two black slabs + pale mint low-contrast text in Studio Light Mode; `20` mobile `<44px` tap targets on `:8110` & `50` on Studio; double redundant support banners above the fold. |
| **L5** | **Docs, SEO/AEO & Readability** | **`5.4 / 10`** | `NEEDS FIX` | Phantom `budget_circuit_breaker_status` MCP tool & broken `--max-budget` CLI example in `toolsDocumentation.js:1420-1422`; `README.md` calls tripped state `OPEN` instead of `TRIPPED`; `executionType: 'browser'` falsely claims no backend required; `TRY BEFORE BUY` & `founding-badge` remnants; stale `sitemap.xml` (`2026-10-10`). |
| — | **Weighted Composite** | **`4.92 / 10`** | **`NEEDS FIX`** | **Remediate all P0/P1 findings to earn `>= 9.0 / 10` across all 5 levels.** |

---

## 2. Test Roadmap, Execution Log & Inspected Visual Evidence

### Executed Verification Matrix
1. **Memory Recall & Repo Inventory**: `zoth-memory-vault recall "agent-budget-sentinel"` surfaced 6+ prior historical threads; verified `git status`, SHAs (`16071b8`, `a979e4a`, `e8e77f36`), remotes, and live `PID 2003` listening exclusively on `127.0.0.1:8110` and `127.0.0.1:8111`.
2. **Unit Test Suite**: `PYTHONPATH=src python3 -m pytest -q tests` → `34 passed in 3.68s` (`EXIT=0`).
3. **Live Read-Only Probes (`:8110` & `:8111`)**: Verified `/health`, `/api/health`, `/api/stats`, `/api/transactions`, `/api/pricing`, `/api/stream` (SSE), `:8111/health`, `:8111/status`, CORS `OPTIONS`/`GET` with `Origin: https://evil.example.com` and `Origin: http://127.0.0.1:8110.evil.com` / `http://127.0.0.1:8111.evil.com`, and `--path-as-is` traversal.
4. **Isolated Destructive & SSRF Probes (`18110`/`18111` + Temp SQLite DB)**: Spawned temporary isolated instances (`--web-port 18110 --proxy-port 18111 --db-path /tmp/audit-004-iso*/budget.db`) to test `?limit=abc`, `?limit=-1`, `max_budget_usd=-5`/`NaN`, `/api/simulate`, `/api/simulate_runaway`, `HTTP 429` tripped enforcement, `/api/reset`, `X-Target-Url` SSRF (`http://127.0.0.1:18110/api/stats` & `file:///etc/passwd`), and `Authorization: Bearer sk-...` non-persistence in SQLite; cleanly terminated temp PIDs and removed temp dirs.
5. **CLI & ZothOS Chroot Parity Probes**: Verified `which -a`, `diff -u` across `/usr/local/bin`, `~/.local/bin`, and `~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin/`, and executed `--help`, `-v`, `--status`, `status`, `--json`, `bogus-cmd-xyz`, `run -- echo ...`, `run echo ...`, and `agent-budget-sentinel-tui --json`.
6. **Headless Triple-Viewport & CDP Interactive Audit**: Executed `capture.mjs` across mobile (`390×844`), tablet (`768×1024`), and desktop (`1440×900`) on `:8110/`, `:3000/tools/agent-budget-sentinel`, and `:3000/workstations/agent-budget-sentinel`, plus custom CDP audit measuring tap targets, DOM a11y, `localStorage` writes, network requests to `:8110`/`:8111`, and Light/Dark Mode Studio workspaces.

### Visually Inspected Screenshots & Brand Assets (All Verified via `read_file`)
- **Standalone `:8110` Captures**:
  - [home_desktop.jpg](file:///tmp/whiteboard-audit-004/standalone/home_desktop.jpg) — `1440×900`, `overflowPx=0`, `errors=[]`, double support CTA banners stacked above fold, `$0.0000` in-memory spend despite populated DB ledger below.
  - [home_tablet.jpg](file:///tmp/whiteboard-audit-004/standalone/home_tablet.jpg) — `768×1024`, `overflowPx=0`, uneven 2-line wrapping on `BREAKER: CLOSED`, `V2.5 SOVEREIGN`, and `Buy Us a Coffee`.
  - [home_mobile.jpg](file:///tmp/whiteboard-audit-004/standalone/home_mobile.jpg) — `390×844`, `overflowPx=0`, `60 FPS • KINETIC STREAM` wraps to 3 lines with displaced dot; bottom overlay occludes lower half of Aegis shield.
  - [home_desktop_lower.jpg](file:///tmp/whiteboard-audit-004/standalone/home_desktop_lower.jpg) — Shows 8+ historical SQLite transactions contradicting `$0.0000` header, unimplemented Card 6 feature claims, and tiny `21–23px` `A100×HERMES` buttons.
- **Zoth Studio v2 `/tools/agent-budget-sentinel` Captures**:
  - [tools_agent-budget-sentinel_desktop.jpg](file:///tmp/whiteboard-audit-004/studio-tool/tools_agent-budget-sentinel_desktop.jpg) — Editorial Ivory Light Mode; misleading `"Runs 100% in your browser"` banner; raw horizontal scrollbar in CLI command pill.
  - [tools_agent-budget-sentinel_tablet.jpg](file:///tmp/whiteboard-audit-004/studio-tool/tools_agent-budget-sentinel_tablet.jpg) — Pitch-black `:8110` Obsidian iframe slab embedded directly in Ivory Light Mode.
  - [tools_agent-budget-sentinel_mobile.jpg](file:///tmp/whiteboard-audit-004/studio-tool/tools_agent-budget-sentinel_mobile.jpg) — `390×844`, `overflowPx=0`, `50` tap targets `<44px` across page.
  - [studio_dark_workspace.jpg](file:///tmp/whiteboard-audit-004/studio-tool/studio_dark_workspace.jpg) & [studio_light_workspace.jpg](file:///tmp/whiteboard-audit-004/studio-tool/studio_light_workspace.jpg) — Embedded `:8110` iframe stays dark across both Light and Dark Studio themes.
  - [godmode_light.jpg](file:///tmp/whiteboard-audit-004/studio-tool/godmode_light.jpg) & [godmode_dark.jpg](file:///tmp/whiteboard-audit-004/studio-tool/godmode_dark.jpg) — Mode 2 (`AgentBudgetSentinelGodModeTool.jsx`): two pitch-black slabs (`SovereignBand` + `#06080C` chart) and pale mint low-contrast text on Editorial Ivory; `callsAfterGodMode: []`.
- **Zoth Studio v2 `/workstations/agent-budget-sentinel` Captures**:
  - [workstations_agent-budget-sentinel_desktop.jpg](file:///tmp/whiteboard-audit-004/studio-workstation/workstations_agent-budget-sentinel_desktop.jpg), [workstations_agent-budget-sentinel_tablet.jpg](file:///tmp/whiteboard-audit-004/studio-workstation/workstations_agent-budget-sentinel_tablet.jpg), [workstations_agent-budget-sentinel_mobile.jpg](file:///tmp/whiteboard-audit-004/studio-workstation/workstations_agent-budget-sentinel_mobile.jpg) — Mobile capture shows `IntroDirector` aperture seam mid-open with `ENTER ESC` partially clipped at bottom edge.
- **Static Social / OG Assets**:
  - [banner.png](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/banner.png) — **Corrupted OG image** referenced by `index.html`: white title on white background, black grid triangles bisecting copy, tofu boxes `[]`, right-edge clip, and forbidden `DUAL STRIPE + SOLANA ($19)` badge.
  - [og-banner.jpg](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/og-banner.jpg) — `1200×624` PNG misnamed `.jpg` (textless hex aperture).
  - [og-budget-sentinel.png](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/og-budget-sentinel.png) — `1200×630` Obsidian card; top pill border clips `GUARDRAIL` on the right (`IL` outside border).

---

## 3. Five-Level Deep Findings (`file:line`)

### Level 1 — System & Security (`4.2 / 10`)
1. **[P0] Arbitrary Proxy SSRF, Local File Open & Breaker Bypass on `:8111`** — [proxy.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/proxy.py#L80), [proxy.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/proxy.py#L178-L192), [proxy.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/proxy.py#L270), [proxy.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/proxy.py#L543-L545)
   - `_resolve_upstream_url()` directly concatenates untrusted `X-Target-Url` header + `self.path` with zero scheme allowlist (`http`/`https` only) and zero loopback/RFC1918/IMDS (`169.254.169.254`) blocklist.
   - `do_GET()` bypasses both `_is_local_origin()` and `breaker.evaluate_request()`, forwarding arbitrary GET traffic even when tripped.
   - **Observed on isolated `18111`**: `curl -H "X-Target-Url: http://127.0.0.1:18110" http://127.0.0.1:18111/api/stats` returned **`HTTP 200`** with internal JSON; `curl -H "X-Target-Url: file:///etc" http://127.0.0.1:18111/passwd` actually opened `/etc/passwd` via `urllib.request.urlopen()` before crashing at `proxy.py:270` (`TypeError: '<' not supported between instances of 'NoneType' and 'int'`, `curl exit 52`).
2. **[P0] Hostname-Spoof CORS & CSRF Bypass on Both `:8110` and `:8111`** — [server.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/server.py#L34-L50), [proxy.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/proxy.py#L23-L39)
   - `_is_local_origin()` checks `parsed.hostname in ("127.0.0.1", "localhost", "::1")` without validating `parsed.port` or full `netloc`. In Python `urllib.parse.urlparse("http://127.0.0.1:8110.evil.com")`, `.hostname` evaluates to `'127.0.0.1'`.
   - **Observed live**: Both `:8110` and `:8111` echoed `Access-Control-Allow-Origin: http://127.0.0.1:8110.evil.com` and `http://127.0.0.1:8111.evil.com` on `OPTIONS` and `GET`, bypassing POST origin protection.
   - Additionally: `do_OPTIONS` returns `HTTP 200` (not `204`/`403`) even for `https://evil.example.com`; `GET /api/stats`, `/api/transactions`, and SSE `/api/stream` do not reject foreign `Origin` headers; responses omit `Vary: Origin`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy: frame-ancestors`.
3. **[P0] Unhandled Handler Crash & Silent Clamping on Invalid Inputs** — [server.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/server.py#L96), [server.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/server.py#L135-L156), [server.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/server.py#L325)
   - `GET /api/transactions?limit=abc` raises uncaught `ValueError` → dropped socket (`HTTP 000`).
   - `GET /api/transactions?limit=-1` returns `HTTP 200` and dumps unbounded SQLite rows (`LIMIT -1`).
   - `POST /api/budget` with `{"max_budget_usd": -5}` or `{"max_budget_usd": "NaN"}` returns `HTTP 200` silently clamping to `1e-06` instead of `HTTP 400`.
   - `GET /api/health` falls through to `_serve_static` SPA catch-all returning `27,784 B` of `index.html` instead of JSON (`404` should be returned for unknown `/api/*` paths, and `/api/health` should mirror `/health` JSON).
4. **[P1] Massive Static Asset Bloat (`45 MB`), Chroot Drift & Fake Boilerplate TUI** — [public/assets](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets), [agent-budget-sentinel-tui](file:///usr/local/bin/agent-budget-sentinel-tui), [zoth-os chroot](https://github.com/1nc0gn30/zoth-os/blob/main/config/includes.chroot/opt/agent-budget-sentinel)
   - `public/assets/` totals **`45 MB`** containing **`59` `.glb` files** (`gpu-blender-v1.glb`..`v33+`) and `5` large `.mp4`/`.webm` renders unused by the core circuit breaker.
   - `agent-budget-sentinel-tui` (`/usr/local/bin`, `~/.local/bin`, and chroot) is a generic synthetic template (`math.sin()`, hardcoded `audio_lufs: -14.0`, `canvasui-html-effects`) that never queries `:8110` or `budget.db`.
   - `zoth-os/config/includes.chroot/opt/agent-budget-sentinel` has drifted heavily behind repo `16071b8` (missing `electron/`, mismatched `package.json`, stale files).
   - Repo only has `origin` (`1nc0gn30`); missing `nullai` (`NullAITech`) remote.

### Level 2 — User & Workflow (`4.8 / 10`)
1. **[P0] Studio `AgentBudgetSentinelGodModeTool.jsx` Is 100% Disconnected Mock** — [AgentBudgetSentinelGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AgentBudgetSentinelGodModeTool.jsx)
   - Confirmed via CDP network trace (`callsAfterGodMode: []`): switching to `Studio God-Mode Deck` and interacting with controls emits zero requests to `:8110`/`:8111`. Sliders only drive a synthetic sine curve (`Math.sin(...)`).
   - Meanwhile [EnclaveToolsSuite.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/EnclaveToolsSuite.jsx#L4715-L4765) contains a separate unused `AgentBudgetSentinelTool` that polls `:8110` (with hardcoded fake initial state `$0.042` and 2 canned events).
2. **[P0] Hardcoded Port `8110` Detection, Fake Data Fallback & Fake License Keys** — [budget_engine.js](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/budget_engine.js#L104-L177), [index.html](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/index.html#L380-L405)
   - `const isLiveBackend = window.location.port === "8110";` causes any non-`8110` port (reverse proxy, Electron dynamic port, isolated test port) to silently display fabricated `$0.4285` spend, `38` requests, `84,620` tokens, and 5 fake transactions instead of probing `/health` dynamically.
   - Confirmed in browser `localStorage` via CDP: automatically writes 4 obsolete license keys (`budget_sentinel_pro_license: "BUDGET-PRO-2026"`, `agent_budget_pro: "BUDGET-PRO-2026"`, `pro_licensed: "true"`, `zoth_budget_licensed: "true"`).
   - `budget_engine.js:177` embeds an unapproved BTC wallet (`bc1q...`) alongside the approved Solana tip address; Card 6 (`index.html:380-405`) advertises unimplemented features (`Multi-Agent Quota Fencing`, `150,000 tokens/min` anomaly radar, `PDF compliance reports`).
3. **[P1] In-Memory Spend Not Hydrated From SQLite on Restart** — [breaker.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/breaker.py)
   - Observed live on `PID 2003`: `/api/stats` reports `current_spend_usd: 0.0`, `total_requests: 0`, `total_tokens: 0`, while the exact same JSON response's `models`/`hourly` arrays report `12` SQLite transactions totaling `$0.99745` (`o1-preview` `$0.945`, `gpt-4o` `$0.0325`, `claude-3-5-sonnet` `$0.01995`), visibly conflicting in [home_desktop.jpg](file:///tmp/whiteboard-audit-004/standalone/home_desktop.jpg) vs [home_desktop_lower.jpg](file:///tmp/whiteboard-audit-004/standalone/home_desktop_lower.jpg).
4. **[P1] Broken `agent-budget run -- <cmd>` & Split Wrapper/CLI Behavior** — [cli.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/cli.py#L227-L234), [agent-budget-sentinel](file:///usr/local/bin/agent-budget-sentinel#L66-L68)
   - Executed `agent-budget run -- echo hello_sentinel_audit` → `EXIT=1`, `PermissionError: [Errno 13] Permission denied: '--'` because `cli.py:234` passes `'--'` as `argv[0]` to `subprocess.run()`.
   - `cli.py:227-228` exports `HTTP_PROXY`/`HTTPS_PROXY=http://127.0.0.1:8111`, which breaks HTTPS clients because `proxy.py` implements no `do_CONNECT`.
   - Wrapper `/usr/local/bin/agent-budget-sentinel` intercepts `--json` and `--status`, printing static `2.5.0` metadata instead of forwarding to `cli.py` for live telemetry (while `agent-budget status` prints `v1.0.0` live telemetry).
5. **[P1] Outdated 2024 Model Pricing & Missing `$0.00` Local Models** — [calculator.py](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/src/agent_budget_sentinel/calculator.py#L24-L65)
   - Missing 2025/2026 models (`gpt-4.1`, `gpt-5`, `o3`, `o4-mini`, `claude-sonnet-4`, `claude-opus-4`, `gemini-2.5-pro`, `gemini-3.8-flash`) and zero-cost local sovereign backends (`ollama/*`, `agy`, `hermes`, `azoth`, `qwen*`, `llama*`), which fall through to `$2/$8` `default` pricing.

### Level 3 — Engineer & Security (`5.2 / 10`)
1. **[P0] Unescaped `innerHTML` XSS Sink & Broken Media Path** — [sovereign-upgrade.js](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/sovereign-upgrade.js#L231-L240)
   - Interpolates preset JSON fields directly into `card.innerHTML` without HTML escaping/DOM construction.
   - References `/assets/gpu-vertical-ad-9x16.mp4` while the actual file in `public/assets/` is `gpu-ad-vertical-9x16.mp4` (404 mismatch).
2. **[P1] Security & Edge-Case Test Blindspots** — [tests/](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/tests)
   - `34/34` tests pass, and SQLite storage properly omits `Authorization: Bearer` headers and raw prompt strings (`NO_SECRET_OR_PROMPT_IN_DB` confirmed on isolated DB).
   - However, zero tests cover: CORS spoof (`127.0.0.1:8110.evil.com`), proxy `X-Target-Url` SSRF (`127.0.0.1`, `169.254.169.254`, `file://`), invalid query/body inputs (`?limit=abc`, `-1`, `max_budget_usd=-5`/`NaN`), `OPTIONS 204/403`, `/api/health` JSON contract, or `agent-budget run -- <cmd>`.
3. **[P1] External CDN Fonts & Electron Sandbox Flag** — [index.html](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/index.html#L87-L89), [electron/main.cjs](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/electron/main.cjs#L88-L91), [tools.json](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/public/api/tools.json)
   - `index.html:87-89` loads `https://fonts.googleapis.com`, contradicting `tools.json` `"zero-egress"` tag (which also inaccurately tags `"webgpu"`).
   - `electron/main.cjs` correctly sets `nodeIntegration: false` and `contextIsolation: true`, but omits explicit `sandbox: true` and appends `--no-sandbox`.

### Level 4 — UI, Visual & Accessibility (`5.0 / 10`)
1. **[P0] Corrupted OG Banner & Misnamed Asset** — [banner.png](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/banner.png), [og-banner.jpg](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/og-banner.jpg), [og-budget-sentinel.png](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/og-budget-sentinel.png)
   - `public/assets/banner.png` (linked as `og:image`/`twitter:image`) renders illegible white title on white background, broken black grid triangles, tofu glyph boxes `[]`, right-edge clipping, and forbidden `DUAL STRIPE + SOLANA ($19)` copy.
   - `public/og-banner.jpg` is a `1200×624` PNG misnamed `.jpg`; `og-budget-sentinel.png` clips `GUARDRAIL` outside its top pill border.
2. **[P1] Missing Light Mode on `:8110` & Studio Light-Mode Theme Clash** — [style.css](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/style.css), [AgentBudgetSentinelGodModeTool.jsx](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/components/tools/AgentBudgetSentinelGodModeTool.jsx)
   - `:8110` has no Editorial Ivory Light Mode or `?theme=light` sync, producing a dark black iframe box inside Zoth Studio's default Light Mode ([tools_agent-budget-sentinel_tablet.jpg](file:///tmp/whiteboard-audit-004/studio-tool/tools_agent-budget-sentinel_tablet.jpg)).
   - Studio Mode 2 ([godmode_light.jpg](file:///tmp/whiteboard-audit-004/studio-tool/godmode_light.jpg)) renders two pitch-black containers (`SovereignBand` + `#06080C` canvas) and pale mint accent text with insufficient contrast against `#FAF7F0`.
3. **[P1] Tap-Target Violations (`<44px`) & Mobile/Tablet Wrapping** — [style.css](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/style.css#L170-L358), [index.html](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/index.html#L95-L210)
   - CDP measured **`20` elements `<44px`** on standalone mobile (`390×844`), including `21–23px` `A100×HERMES` buttons, `22px` `15s Showreel Blueprint`, `26–28px` support links, and `36px` toolbar buttons.
   - CDP measured **`50` elements `<44px`** on Studio mobile (`390×844`), including a `28×28px` refresh icon button.
   - Above-the-fold stacks two redundant support bars (`Buy Us a Coffee` twice + `100% OPEN ACCESS` twice). Mobile `60 FPS • KINETIC STREAM` wraps awkwardly to 3 lines while bottom canvas pills cover half the shield ([home_mobile.jpg](file:///tmp/whiteboard-audit-004/standalone/home_mobile.jpg)). Studio CLI bar displays a raw browser horizontal scrollbar ([tools_agent-budget-sentinel_desktop.jpg](file:///tmp/whiteboard-audit-004/studio-tool/tools_agent-budget-sentinel_desktop.jpg)).

### Level 5 — Docs, SEO/AEO & Readability (`5.4 / 10`)
1. **[P1] Phantom MCP Tool & Broken CLI Documentation** — [toolsDocumentation.js](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/data/toolsDocumentation.js#L1410-L1455)
   - Advertises `mcpTool: 'budget_circuit_breaker_status'` (no MCP server or tool exists anywhere in the repo).
   - Documents `./bin/agent-budget run --max-budget 2.50 -- python my_agent.py`, which fails on both nonexistent `--max-budget` and `--` (`PermissionError`).
2. **[P1] State Enum, Execution Type, Version & Paywall-Copy Mismatches** — [README.md](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/README.md#L17-L30), [toolsData.js](https://github.com/1nc0gn30/zoth-studio-v2/blob/main/src/data/toolsData.js#L830-L865), [index.html](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/index.html#L252-L409)
   - `README.md:17,30` documents tripped breaker state as `OPEN`; actual enum in `breaker.py:20` is `TRIPPED`.
   - `toolsData.js:838` marks `executionType: 'browser'`, causing Studio to show `"Runs 100% in your browser — no local install or backend required"` despite requiring the local `:8110`/`:8111` Python daemon for real proxying/guardrails.
   - Legacy funnel artifacts remain: `TRY BEFORE BUY` badge (`index.html:252`), `id="btn-blurred-download"` (`index.html:399`), `class="founding-badge"` (`index.html:409`), and `SALES FUNNEL BANNER` CSS comment (`style.css:109`).
3. **[P2] Stale Sitemap Date** — [sitemap.xml](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/sitemap.xml) lists `<lastmod>2026-10-10</lastmod>`.

---

## 4. Prioritized Remediation Backlog (`P0` / `P1` / `P2`)

### P0 — Blockers (Fix Immediately)
1. **Lock down `:8111` Proxy SSRF & Breaker Enforcement (`proxy.py`)**: Add `net_guard.py` allowing only `http`/`https` schemes, resolving hostnames via `socket.getaddrinfo()`, blocking loopback/RFC1918/link-local/IMDS (`169.254.169.254`)/multicast/reserved IPs unless an explicit env allowlist is configured for testing, rejecting `file://` with `403`, and enforcing `_is_local_origin()` + `breaker.evaluate_request()` on `do_GET` and all forwarded methods.
2. **Fix Hostname-Spoof CORS/CSRF on `:8110` & `:8111` (`server.py`, `proxy.py`)**: Strictly parse `Origin` validating scheme (`http`/`https`), exact host (`127.0.0.1`/`localhost`/`[::1]`), and valid integer port (`parsed.port` catch `ValueError`); reject disallowed `Origin` with `HTTP 403` on `OPTIONS`, `GET /api/*`, `POST /api/*`, and `/api/stream`; return `204` on valid `OPTIONS`; add `Vary: Origin`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and loopback `CSP: frame-ancestors`.
3. **Fix API Input Validation & `/api/health` (`server.py`)**: Validate `limit` (`1..500`, `400` on non-int/negative), reject non-finite or `<= 0` `max_budget_usd` with `HTTP 400`, serve JSON on `/api/health`, and return `404` JSON (never HTML) for unknown `/api/*` paths.
4. **Eliminate XSS Sink & Broken Video Path (`public/assets/sovereign-upgrade.js`)**: Replace `card.innerHTML` interpolation with `document.createElement` + `textContent`; fix or remove broken `gpu-vertical-ad-9x16.mp4` reference.
5. **Replace Corrupted `public/assets/banner.png` (`og:image`)**: Generate a clean `1200×630` PNG with crisp typography, zero tofu glyphs, zero `$19` paywall text, and remove misnamed `public/og-banner.jpg`.
6. **Connect Studio `AgentBudgetSentinelGodModeTool.jsx` to Live `:8110`/`:8111` & Remove Fake Fallback in `budget_engine.js`**: Wire Studio Mode 2 directly to live `/health`, `/api/stats`, `/api/transactions`, `/api/pricing`, `/api/budget`, `/api/trip`, `/api/reset`, `/api/stream`; replace `window.location.port === "8110"` in `budget_engine.js` with dynamic `/health` probing, transparent offline state (zero fabricated spend), remove `BUDGET-PRO-2026` `localStorage` writes, and remove unapproved BTC address.

### P1 — High Priority (Required for `>= 9.0 / 10` Parity)
7. **Hydrate `CircuitBreaker` From SQLite on Startup (`breaker.py`, `storage.py`)** + add 2025/2026 & `$0.00` local sovereign models to `calculator.py`.
8. **Fix CLI `run -- <cmd>`, Wrapper Telemetry Forwarding & Real Live TUI (`cli.py`, `/usr/local/bin/agent-budget-sentinel`, `agent-budget-sentinel-tui`)**: Strip leading `--` in `cmd_run`, add `--max-budget` option to `run`, avoid setting `HTTPS_PROXY` without `CONNECT`, let `--json` / `--status` return real live `:8110` telemetry, and replace the fake boilerplate TUI with a real live `:8110` / `budget.db` Braille monitor.
9. **Add Editorial Ivory Light Mode to `:8110` (`?theme=light` Sync) & Fix Studio Light Mode Contrast**: Support full Light/Dark theme toggle on `:8110` synced with Studio iframe; remove pitch-black slabs and low-contrast pale mint text in `AgentBudgetSentinelGodModeTool.jsx`; consolidate duplicate top support bars; enforce `min-height: 44px` on all mobile touch targets; fix tablet/mobile pill wrapping.
10. **Prune `45 MB` Unused `.glb`/Video Bloat, Sync `zoth-os` Chroot, Add `nullai` Remote, Unify Version (`2.6.0` or `3.0.0`), and Fix Docs/MCP Parity**: Either ship a real MCP stdio server exposing `budget_circuit_breaker_status` (recommended) or remove the phantom claim; align `README.md` (`TRIPPED` state), `toolsData.js` (`executionType: 'hybrid'`), remove `TRY BEFORE BUY` / `founding-badge` / `btn-blurred-download`, replace Google Fonts CDN with local/system stack (for true `zero-egress`), and add comprehensive pytest security/API/CLI regression tests.

### P2 — Polish
11. **Refresh `public/sitemap.xml` `<lastmod>`**, remove raw scrollbar on Studio CLI pill, fix `og-budget-sentinel.png` pill overflow, and audit `electron/main.cjs` `sandbox: true` compatibility.

---

## 5. AGY Perspective

`agent-budget-sentinel` already has the hardest core engineering primitive working well: a zero-dependency pure-Python `cl100k_base` BPE tokenizer + SQLite ledger + dual-port (`:8110` / `:8111`) circuit breaker that runs cleanly in `~28 MB` RAM with `34/34` passing unit tests and proper secret non-persistence in SQLite. However, security hardening around the reverse proxy and HTTP control plane fell behind: the `urlparse().hostname` CORS spoof and unguarded `X-Target-Url` SSRF/file-read on `:8111` are textbook P0 blockers, while the disconnected Studio Mode 2 mock, corrupted `$19` OG banner, restart-hydration split, `45 MB` stray `.glb` bloat, and fake boilerplate TUI drag the product experience down to `4.92 / 10`. A focused remediation pass fixing those P0/P1 root causes—plus adding a real lightweight MCP server for `budget_circuit_breaker_status`, real live TUI telemetry, Editorial Ivory Light Mode sync, and security regression tests—will legitimately elevate all 5 levels above `9.0 / 10`.


---

## 6. Post-Remediation Re-Audit (`v2` — `v2.6.0` Upgrade)

| Field | Value |
| :--- | :--- |
| **Remediation Start (EST / UTC)** | `2026-11-25 21:43:11 EST` / `2026-11-26 02:43:11 UTC` |
| **Re-Audit Completion (EST / UTC)** | `2026-11-25 22:01:36 EST` / `2026-11-26 03:01:36 UTC` |
| **Unified Version** | **`2.6.0`** across `pyproject.toml`, `__init__.py`, `package.json`, `server.py`, `proxy.py`, `cli.py`, `mcp_server.py`, `index.html`, `toolsData.js`, `public/api/tools.json`, CLI wrappers, and TUI |
| **Commit SHAs** | `agent-budget-sentinel` @ **`98c32bf`** · `zoth-os` @ **`3411040b`** · `zoth-studio-v2` (committed with this report) |
| **Live Daemon Preserved & Active** | `agent-budget-sentinel.service` (`active`, `PID 267801`, `127.0.0.1:8110` & `127.0.0.1:8111`, `breaker_state: "CLOSED"`, hydrated `$0.99745` spend / `12` requests / `46,400` tokens / `1` blocked) |
| **Automated Test Suites** | `agent-budget-sentinel`: **`44 passed in 4.73s`** (`EXIT=0`) · `zoth-os`: **`12 passed in 7.84s`** (`EXIT=0`) · `zoth-studio-v2`: **`37/37 routes passed, 0 console errors`** (`EXIT=0`) |
| **Post-Remediation Verdict** | **`PASS`** — **`9.52 / 10`** (all 5 levels `>= 9.4 / 10`) |

### Before (`v1`) vs After (`v2`) Scorecard

| Level | Dimension | Baseline (`v1`) | Post-Remediation (`v2`) | Delta | Verified Evidence |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **L1** | **System & Security** | `4.2 / 10` | **`9.6 / 10`** | `+5.4` | `SSRF_LOOPBACK=403`, `SSRF_IMDS=403`, `SSRF_FILE=403`, `SSRF_PRIVATE_V1=403`; `do_GET` tripped enforcement `HTTP 429`; `CORS_8110_SPOOF_GET/OPT=403`, `CORS_8111_SPOOF_GET/OPT=403`, `OPTIONS=204/403`; `LIMIT_ABC/NEG=400`, `BUDGET_NEG/NAN=400`; `/api/health` JSON `200`; unknown `/api/*` JSON `404`; `BIN_DIFF_ZERO=0`; `OPT_CHROOT_DIFF_ZERO=0`. |
| **L2** | **User & Workflow** | `4.8 / 10` | **`9.5 / 10`** | `+4.7` | SQLite restart hydration live (`$0.99745`, `12` calls, `46,400` tokens matching `budget.db` across `:8110`, `:8111`, CLI `--json`, live TUI, MCP, and Studio Mode 2); 2025/2026 + `$0.00` local sovereign pricing (`ollama/*`, `agy/*`, `hermes/*`); `agent-budget run --max-budget 2.50 -- echo ok` (`EXIT=0`); Studio Mode 2 live network trace (`4` calls to `:8110`, `hasOnlineBadge: true`, `hasHydratedSpend: true`); `lsLicenseKeys: []`. |
| **L3** | **Engineer & Security** | `5.2 / 10` | **`9.6 / 10`** | `+4.4` | `44/44` pytest pass including `tests/test_security_and_contracts.py`; zero `innerHTML` sinks in `public/`; `public/assets/` pruned from `45 MB` → **`320 KB`** (`99.3%` reduction); `externalFontLinks: 0` (true zero-egress); `electron/main.cjs` enforces `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`. |
| **L4** | **UI, Visual & Accessibility** | `5.0 / 10` | **`9.5 / 10`** | `+4.5` | Crisp `1200×630` [banner.png](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/banner.png) (zero tofu, zero `$19`); full Editorial Ivory Light Mode on `:8110` (`?theme=light&embed=1`) synced seamlessly into Studio iframe; `godmode_light.jpg` / `godmode_dark.jpg` zero black slabs & WCAG AA contrast; `overflowPx: 0`, `errors: []`, `smallTapTargetsCount: 0` on `:8110` mobile (`390×844`) and `0` `<44px` controls inside `AgentBudgetSentinelGodModeTool.jsx`; raw CLI scrollbar removed. |
| **L5** | **Docs, SEO/AEO & Readability** | `5.4 / 10` | **`9.4 / 10`** | `+4.0` | Live stdio JSON-RPC 2.0 MCP server (`agent-budget mcp`) verified returning live `budget_circuit_breaker_status` JSON (`isError: false`); `README.md` (`TRIPPED` enum), `toolsData.js` (`executionType: 'hybrid'`), `tools.json` (`runtimes: ["python", "cli", "mcp", "zero-egress"]`), `toolsDocumentation.js`, `sitemap.xml` (`2026-11-25`); `rawBackticks: []`; zero paywall/funnel remnants. |
| — | **Weighted Composite** | `4.92 / 10` | **`9.52 / 10`** | **`+4.60`** | **`PASS` — All 5 levels legitimately >= 9.4 / 10.** |

### Fresh Visually Inspected Post-Remediation Evidence (All Verified via `read_file`)
- **Regenerated Brand Asset**: [banner.png](https://github.com/1nc0gn30/agent-budget-sentinel/blob/main/public/assets/banner.png) (`1200×630` PNG, high-contrast Obsidian & 24K Gold Aegis shield, zero tofu glyphs, zero `$19` paywall text).
- **Standalone `:8110` Obsidian Dark**: [home_desktop.jpg](file:///tmp/whiteboard-audit-004-after/standalone/home_desktop.jpg), [home_tablet.jpg](file:///tmp/whiteboard-audit-004-after/standalone/home_tablet.jpg), [home_mobile.jpg](file:///tmp/whiteboard-audit-004-after/standalone/home_mobile.jpg), [home_desktop_lower.jpg](file:///tmp/whiteboard-audit-004-after/standalone/home_desktop_lower.jpg).
- **Standalone `:8110/?theme=light` Editorial Ivory**: [_theme_light_desktop.jpg](file:///tmp/whiteboard-audit-004-after/standalone-light/_theme_light_desktop.jpg), [_theme_light_tablet.jpg](file:///tmp/whiteboard-audit-004-after/standalone-light/_theme_light_tablet.jpg), [_theme_light_mobile.jpg](file:///tmp/whiteboard-audit-004-after/standalone-light/_theme_light_mobile.jpg), [_theme_light_lower.jpg](file:///tmp/whiteboard-audit-004-after/standalone-light/_theme_light_lower.jpg).
- **Zoth Studio v2 `/tools/agent-budget-sentinel` & `/workstations/agent-budget-sentinel`**: [tools_agent-budget-sentinel_desktop.jpg](file:///tmp/whiteboard-audit-004-after/studio-tool/tools_agent-budget-sentinel_desktop.jpg), [tools_agent-budget-sentinel_tablet.jpg](file:///tmp/whiteboard-audit-004-after/studio-tool/tools_agent-budget-sentinel_tablet.jpg), [tools_agent-budget-sentinel_mobile.jpg](file:///tmp/whiteboard-audit-004-after/studio-tool/tools_agent-budget-sentinel_mobile.jpg), [studio_light_iframe.jpg](file:///tmp/whiteboard-audit-004-after/studio-tool/studio_light_iframe.jpg), [godmode_light.jpg](file:///tmp/whiteboard-audit-004-after/studio-tool/godmode_light.jpg), [godmode_dark.jpg](file:///tmp/whiteboard-audit-004-after/studio-tool/godmode_dark.jpg), [workstations_agent-budget-sentinel_desktop.jpg](file:///tmp/whiteboard-audit-004-after/studio-workstation/workstations_agent-budget-sentinel_desktop.jpg), [workstations_agent-budget-sentinel_tablet.jpg](file:///tmp/whiteboard-audit-004-after/studio-workstation/workstations_agent-budget-sentinel_tablet.jpg), [workstations_agent-budget-sentinel_mobile.jpg](file:///tmp/whiteboard-audit-004-after/studio-workstation/workstations_agent-budget-sentinel_mobile.jpg).

### Updated AGY Perspective (`v2`)
The visual self-review loop caught one subtle Light Mode contrast defect (`public/wave.css` overriding `--text-strong` with `#FFFFFF` after `style.css`), which was fixed and visually re-verified across desktop, tablet, mobile, and the embedded Studio iframe. With `net_guard.py` locking down SSRF/CORS, `mcp_server.py` delivering real zero-dependency stdio MCP tools, SQLite restart hydration keeping every telemetry surface synchronized, `public/assets/` slimmed by `99.3%` (`45 MB` → `320 KB`), and both standalone and Studio Mode 2 passing every automated and visual check, `agent-budget-sentinel v2.6.0` is locked at **`9.52 / 10` (`PASS`)**.
