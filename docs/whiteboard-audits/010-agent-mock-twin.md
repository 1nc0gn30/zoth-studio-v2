# Whiteboard Verification Audit — #010 `agent-mock-twin` (Agent Mock Twin)

## 1. Header Metadata & 5-Level Scorecard

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#010` — `agent-mock-twin` (**Agent Mock Twin**) |
| **Audit Mode** | Baseline (`v1`) read-only 5-level audit. Target repo source files untouched (`git status -sb` clean: `## main...origin/main`). Direct audit daemon ran against isolated `/tmp/amt-audit-010*.db` (`agent_mock.db` remained unchanged `0d8a6a33bcd1bd01102367bdeca3072f389f8f79676190ca0922b9d3f13739b6`); subsequent Studio `/tools/agent-mock-twin` capture auto-spawned on-demand PID `802917`, which was cleanly terminated and `:8097` confirmed idle. |
| **Audit Start (EST / UTC)** | `2026-11-26 01:36:55 EST` / `2026-11-26 06:36:55 UTC` |
| **Audit Completion (EST / UTC)** | `2026-11-26 01:48:17 EST` / `2026-11-26 06:48:17 UTC` |
| **Repo & Git State** | `~/NullAITech/agent-mock-twin` (`main` @ `cfd84e6`, `origin=https://github.com/1nc0gn30/agent-mock-twin.git`, **missing `NullAITech` remote**; `agent_mock.db` (`81,920 B`) is untracked/gitignored via `*.db`) |
| **Standalone Surfaces Tested** | On-demand `python3 ~/NullAITech/agent-mock-twin/server.py --host 127.0.0.1 --port 8097 --db /tmp/amt-audit-010.db` (PID `797822`, startup **`150 ms`**, RSS **`24.2 MB`** / `24,244 KB`, VSZ `118,856 KB`, strictly loopback `127.0.0.1:8097`; cleanly terminated and `:8097` confirmed idle at completion) |
| **Studio Surfaces Tested** | `http://127.0.0.1:3000/tools/agent-mock-twin` & `http://127.0.0.1:3000/workstations/agent-mock-twin` (live Studio PID `530452`, untouched) |
| **Observed Versions (Drift)** | `2.5.0` (`package.json:3`, `mock_server.py:126` `/health`, `cli.py:154,271` `--version`, `toolsData.js:676`, `public/api/tools.json`, header badge `v2.5 SOVEREIGN`) vs **`0.1.0`** (`pyproject.toml:7`, `src/agent_mock_twin/__init__.py:7`, `public/assets/banner.png` pill `v0.1.0`) vs **`1.0.0`** (`mock_engine.js:245` Docker bundle export) |
| **Automated Test Baseline** | `PYTHONPATH=src python3 -m pytest -v tests` → **`23 passed in 0.96s`** (exit `0`), with zero coverage for Origin port-suffix bypass, Host validation, CRLF header injection, `/health`, `/api/upload`, `/api/config`, `/api/hits`, `/api/test`, `/api/clear`, `/api/stream`, or CLI subcommands |
| **Overall Verdict** | **`NEEDS FIX`** — **`4.18 / 10`** |

### 5-Level Verification Scorecard

| Level | Dimension | Score | Status | Primary Root Causes |
| :---: | :--- | :---: | :---: | :--- |
| **L1** | **System, Mock/Admin APIs, Security, CLI, Chroot & SEO** | **`3.7 / 10`** | `NEEDS FIX` | **Origin guard port-suffix bypass (`src/agent_mock_twin/mock_server.py:37-53`)**: `OPTIONS 204`, `GET 200`, and **`POST 200`** with `Origin: http://127.0.0.1:8097.example.invalid` all succeed and echo the attacker origin in `Access-Control-Allow-Origin`. Missing `Vary: Origin`, `OPTIONS` returns `204` for untrusted origins, and zero `Host` header validation (`Host: evil.example:8097` returns `200 OK` on `GET` & `POST` — DNS rebinding). **Proven CRLF Response Header Injection (`mock_server.py:291-293`)**: uploaded `response_headers` containing `\r\n` inject arbitrary HTTP response headers (`X-Injected-Header: crlf-proven`) directly onto the wire. **`SIGTERM` Signal-Handler Deadlock (`server.py:37-40`, `cli.py:103-106`)**: calling `server.shutdown()` inside the main-thread signal handler deadlocks `serve_forever()` indefinitely until `SIGKILL`. **Broken `/health` key mapping (`mock_server.py:128,130`)**: always reports `routes_count: 0` and `saved_dollars: 0.0` because `storage.get_stats()` returns `routes_count` / `total_usd_saved` rather than `total_routes` / `saved_dollars`. **Unhandled crashes (`mock_server.py:146,185`)**: `/api/hits?limit=abc` and `Content-Length: abc` throw `ValueError` (`curl: (52)` / `b''`); `?limit=-1` unclamped; unbounded POST read; `/api/config` accepts `["arr"]` and out-of-range values (`chaos_rate: 99.0`, `base_latency_ms: -50`). Unknown `/api/*` (`/api/requests`, `/api/unknown-xyz`) silently fall through to synthetic `200 OK` and pollute `mock_hits`. Static traversal probes (`/../server.py`, `/%2e%2e/server.py`) return `200 text/html` SPA fallback without `Path.resolve().is_relative_to()`. No SQLite WAL/FK/`busy_timeout`; full DB reload on every `get_routes()`/`get_stats()`. OpenAPI `{id}` template matching absent (`GET /v1/users/42` misses `/v1/users/{id}`). Chroot `/opt/agent-mock-twin` badly drifted (missing `server.py`, `electron/`, `sovereign_tutorial.js`, stale Python & JS); `bin/agent-mock:5` hardcodes local developer repo path; `-tui` is fake `math.sin()`/`-14.0 LUFS` boilerplate with host/repo drift (`--status` exits `2` on repo copy); `agent-mock-twin.service` lacks hardening directives; fake static `public/api/{health,stats,status}` (`cassettes_loaded: 42`, `tokens_saved: 482900`); `47 MB` `public/assets/` (`46 MB` across `73` unused `gpu-*` files + `scenes_30s/`); `package.json:8` `serve:public`; missing `NullAITech` remote. |
| **L2** | **User, Real Mock Twin Workflow, Chaos/HAR Replay & Studio Bridge** | **`3.9 / 10`** | `NEEDS FIX` | Standalone `:8097` opens immediately into an active cockpit (no blocking modal) and live SSE `/api/stream` successfully receives external `:8097` requests. However: (1) **Double-counting on `Send Mock Test Request` (`public/mock_engine.js:562-571, 693-696`)**: clicking once calls `recordLocalHit()` both from the `/api/test` JSON response AND from the SSE `event: hit` broadcast (`statHits: "2"` & `replayCards: 2` in DOM vs `1` hit in SQLite); (2) **Sample buttons never persist to `:8097` (`mock_engine.js:425-520`)**: `loadSampleOpenAI()` and `loadSampleAnthropic()` mutate client state only (`statRoutes: "4"` while backend `/api/routes` has `0`), causing live test requests to hit `FALLBACK` instead of exact/fuzzy match; (3) **Fake `Simulate 503 Outage` button & zero real chaos controls (`mock_engine.js:264-279, 609-610`, `index.html:814`)**: never calls `/api/config`, injects a client-only card, falsely adds `35` saved tokens / `$0.00018` via `hit.tokens_saved || 35`, while static decorative text claims `5.0% Rate Limits` & `Jaccard 0.85` (actual defaults: `0%` & `0.4`); (4) **Broken `Solana Tip ⚡` button (`index.html:876-890`)**: invokes out-of-scope `showNotification` (`typeof === "undefined"`), falling into blocking `window.prompt()`; (5) hardcoded `window.location.port === "8097"` (`mock_engine.js:29`) + seeded `142` fake hits / `34,500` tokens when non-`:8097`; (6) **Studio `AgentMockTwinGodModeTool.jsx` is 100% disconnected from `:8097` (`callsTo8097: 0`)**, renders seeded `65` hits / `8,125` tokens at a mismatched `$30/1M` rate (vs backend `$5/1M`), and hardcodes `https://api.openai.com` in MSW/Pytest exports for Anthropic & Ollama routes. |
| **L3** | **Engineer & Code Quality** | **`4.8 / 10`** | `NEEDS FIX` | Clean zero-dependency Python 3.10+ stdlib codebase (`23/23` `pytest` passing in `0.96s`) and proper `escapeHtml()` escaping in `mock_engine.js` route/replay renderers. Degraded by: unescaped `innerHTML` DOM XSS in `public/assets/sovereign-upgrade.js:231-240` (+ 5 broken `/assets/gpu-*` URLs, leaking `window` `pointerup`/`pointermove` listeners, and infinite 90ms `setInterval` persisting after `sovereign_tutorial.js:22-23` removes its bar); 3-way version drift (`2.5.0` vs `0.1.0` vs `1.0.0`); external Google Fonts CDN (`index.html:30-32`) contradicting `"zero-egress"`; dead paywall/license remnants (`wave-states.css:28,51-52`, `index.html:229,567,586`, `mock_engine.js:4`, broken `scripts/verify_ui.py` asserting `#proModal`/`MOCK-PRO-2026` on port `8847`); Electron `--no-sandbox` + missing `sandbox: true` + detached orphan daemon (`electron/main.cjs:8-10,62-68,88-91`); unused `import re` in `parser.py:12`; non-deterministic timestamp IDs in fallback synthesis; and broad `pytest` coverage gaps. |
| **L4** | **UI, Visual Craft & Triple-Viewport Proof** | **`4.1 / 10`** | `NEEDS FIX` | All 12 `capture.mjs` captures pass `overflowPx: 0`, `errors: []`, and `imgsMissingAlt: 0`, and `public/assets/banner.png` (`og:image`) is clean Obsidian dark with zero paywall text (only stale `v0.1.0` pill & minor inner-ring text overlap). Visual inspection via `read_file` exposed major defects: (1) **Triple-stacked Coffee/Solana support bars above the fold on `:8097`** (`#zoth-coffee-support-bar` + `<header>` + `#salesBanner`), consuming ~82% of Mobile `390×844` height and pushing the hero & all controls off-screen; (2) **Zero Light Mode on `:8097`** (`standalone-default` and `standalone-dark` are pixel-identical `#08080B`), embedding as a dark slab with duplicate coffee bars inside Studio Editorial Ivory Light Mode; (3) **`14 / 21` (66.7%)** `:8097` mobile `<44 px` tap-target failures (`27–40 px` coffee/header/select/export/chaos/slider controls) and **`31 / 74` (41.9%)** Studio mobile failures; (4) double sparkle `✨ ✨` toast overlapping mobile `<h1>`; (5) Studio God-Mode Deck Light & Dark renders squished 3-line circular `Buy Us a Coffee` / `TIP SOL` buttons and low-contrast neon KPI text (`#00FF9D`/`#D4AF37`/`#38BDF8` on white, ~1.4–2.1:1); (6) `public/assets/icon.png` has unmasked solid white circle halo protruding past its gold border on dark backgrounds. |
| **L5** | **Readability, Copy, Docs & Accessibility** | **`4.4 / 10`** | `NEEDS FIX` | `toolsData.js:666` & `public/api/tools.json` misclassify the Python/SQLite daemon as `executionType: 'browser'` + `"webgpu"` + `"zero-egress"`, causing Studio to claim *"✓ Runs 100% in your browser — no local install or backend required"* directly beside *"● Local Daemon Reachable (:8097)"*. `toolsDocumentation.js:1113` invents phantom MCP tool `mock_replay_query` (zero MCP server exists). `workstations.js:204` points to dead `/studio/agent-mock.html` (`HTTP 404`, `9 B`). `README.md:16` claims OpenAPI path-template matching (unimplemented). `index.html:18-19,27` and `sitemap.xml` split canonical domains (`agent-mock.nullai.tech` vs `agent-mock-twin.nullai.tech`). Attribution drifts (`1nc0gn30 • NullAI` in `package.json`, `pyproject.toml`, JSON-LD `creator`, `sovereign_tutorial.js`, `-tui`). `#latencySlider` lacks `<label for>`/`aria-label`; `#harDropZone` is a non-focusable `<div>` with no `role="button"`/`tabindex="0"`/keyboard support; Mobile Studio CLI box truncates command mid-line. |
| — | **Weighted Composite** | **`4.18 / 10`** | **`NEEDS FIX`** | **Remediate all P0/P1/P2 findings in `v2` pass to drive all 5 levels to `>= 9.0 / 10`.** |

---

## 2. Test Roadmap & Execution Log

### 2.1 Level 1 — Server Boot, REST/Mock APIs, Security & Parser/Matcher Probes

**On-Demand Boot & Teardown Verification:**
- Command: `python3 ~/NullAITech/agent-mock-twin/server.py --host 127.0.0.1 --port 8097 --db /tmp/amt-audit-010.db`
- Observed: PID `797822`, startup **`150 ms`**, RSS **`24,244 KB` (`24.2 MB`)**, VSZ `118,856 KB`.
- Listener verification (`ss -tlnp`): `127.0.0.1:8097` — strictly loopback-only (`0.0.0.0` not bound).
- Shutdown observation: Sending `SIGTERM` to PID `797822` **deadlocked indefinitely** inside `server.py:39` (`server.shutdown_cleanly()` calling `self.shutdown()` from the main-thread signal handler while `serve_forever()` holds the main thread), requiring `SIGKILL` to exit! After cleanup (and terminating Studio auto-spawned PID `802917`), `:8097` was confirmed idle, `:3000` (PID `530452`) untouched, `agent_mock.db` SHA-256 unchanged (`0d8a6a33bcd1bd01102367bdeca3072f389f8f79676190ca0922b9d3f13739b6`), and `git status -sb` clean (`## main...origin/main`).

| Probe | Observed Result |
| :--- | :--- |
| `GET /`, `GET /robots.txt`, `GET /sitemap.xml` | `HTTP 200` (`38,728 B` HTML, `256 B` `text/plain` referencing `agent-mock-twin.nullai.tech/sitemap.xml`, `469 B` `application/xml` listing both `agent-mock.nullai.tech` and `agent-mock-twin.nullai.tech`) |
| `GET /health`, `/api/health`, `/status`, `/api/status` (fresh DB) | `HTTP 200`, `application/json`, `192 B`: `{"status": "ok", "service": "agent-mock-twin", "version": "2.5.0", "port": 8097, "routes_count": 0, "total_hits": 0, "saved_dollars": 0.0, "license": "100% Free & Open Access (Zero Paywalls)"}` |
| `GET /health` **after** uploading 2 routes & 5 replay hits (`total_usd_saved: 0.0006`) | **`FAIL (P0 Bug)`** — still returned **`"routes_count": 0`** and **`"saved_dollars": 0.0`** while `/api/stats` returned `"routes_count": 2, "total_usd_saved": 0.0006` (`mock_server.py:128,130` reads wrong keys `total_routes`/`saved_dollars`) |
| `GET /api/stats`, `/api/routes`, `/api/hits`, `/api/config` | `HTTP 200`, valid JSON (`routes: []`, `hits: []`, `base_latency_ms: 25`, `jitter_ms: 15`, `chaos_rate: 0.0`, `chaos_type: "429_rate_limit"`) ✅ |
| `GET /api/requests`, `GET /api/unknown-xyz` | **`FAIL (Soft-200 Pollution)`** — both fell through to `_handle_mock_request()` returning `HTTP 200` synthesized fallback (`x-mock-type: fallback`) AND polluting `mock_hits` (`total_hits` incremented `0 -> 2`) |
| `GET /api/hits?limit=abc` | **`FAIL (P0 Crash)`** — **`curl: (52) Empty reply from server`**; server traceback: `ValueError: invalid literal for int() with base 10: 'abc'` at `mock_server.py:146` |
| `GET /api/hits?limit=-1`, `?limit=999999` | `HTTP 200` — SQLite `LIMIT -1` returns full table; no bounds clamping |
| `POST /api/upload` (valid HAR 1.2 OpenAI chat + valid OpenAPI 3.0 `/v1/users/{id}`) | `HTTP 200` (`imported_count: 1` each, `routes_count: 2`) ✅ |
| `POST /v1/chat/completions` (exact HAR body) | `HTTP 200`, `x-mock-twin: true`, `x-mock-type: exact`, `x-mock-tokens-saved: 42`, body `audit-pong` ✅ |
| `POST /v1/messages` (unseen Anthropic fallback) | `HTTP 200`, `x-mock-twin: true`, `x-mock-type: fallback`, `x-mock-tokens-saved: 40`, synthesized Anthropic JSON ✅ |
| `GET /v1/users/42` (against uploaded OpenAPI `/v1/users/{id}`) | **`FAIL (Missing Feature / Doc Drift)`** — returned `x-mock-type: fallback` generic JSON instead of matching `/v1/users/{id}` (`matcher.py` has zero path-template matching despite `README.md:16`) |
| `POST /api/upload` (`{not-json`, `null`, `123`, `"hello"`, `{"log":"not-a-dict"}`, `[{"invalid":"route"}]`) | All 6 returned `HTTP 400 Bad Request` JSON ✅ (caught by broad `except Exception` in `mock_server.py:368`) |
| `POST /api/config` (`{bad`, `["arr"]`, `{"base_latency_ms":-50,"jitter_ms":-10,"chaos_rate":99.0,"chaos_type":"bogus"}`) | `{bad` → `400`; **`["arr"]` → `HTTP 200 OK`**; **out-of-range negative/99.0/bogus config → `HTTP 200 OK`** (accepted & applied unvalidated!) |
| `POST /api/config` (`chaos_rate: 1.0`, `chaos_type: "500_internal_error"`) + live `POST /v1/chat/completions` | Returned `HTTP 500 Internal Server Error`, `x-mock-type: chaos`, `retry-after: 5`, JSON error body ✅ |
| **CRLF Response Header Injection** (`POST /api/upload` route with `x-custom: "ok\r\nX-Injected-Header: crlf-proven"` → `GET /v1/crlf-check`) | **`FAIL (P0 HTTP Response Splitting)`** — server emitted literal injected header **`X-Injected-Header: crlf-proven`** on the wire (`mock_server.py:291-293`) |
| Raw socket `POST /api/config` with `Content-Length: abc` | **`FAIL (P0 Crash)`** — server dropped connection (`RAW_BAD_CL: b''`), traceback `ValueError` at `mock_server.py:185` |
| `POST /api/upload` with `2 MiB` JSON payload | Accepted into memory & parsed (returned `400 Unrecognized format`, NOT `413 Payload Too Large` — zero `MAX_BODY_BYTES` guard!) |
| `TRACE /api/stats` | `HTTP 501 Unsupported method ('TRACE')` (default HTML error page) |
| `OPTIONS` / `GET /api/stats` / `POST /api/config` (`Origin: http://127.0.0.1:3000`) | `OPTIONS 204`, `GET 200`, `POST 200`, `ACAO: http://127.0.0.1:3000`, **missing `Vary: Origin`** |
| `OPTIONS` / `GET /api/stats` / `POST /api/config` (`Origin: https://example.invalid`) | `OPTIONS 204` (`ACAO: http://127.0.0.1`), `GET 200` (`ACAO: http://127.0.0.1`), **`POST 403 Forbidden`** `{"error": "cross-origin request blocked"}` |
| `OPTIONS` / `GET /api/stats` / `POST /api/config` (`Origin: http://127.0.0.1:8097.example.invalid`) | **`FAIL (P0 Origin Guard Bypass)`** — **`OPTIONS 204`**, **`GET 200`**, AND **`POST 200 OK`**, echoing **`Access-Control-Allow-Origin: http://127.0.0.1:8097.example.invalid`**! |
| `GET /api/stats` & `POST /api/config` (`Host: evil.example:8097`, no `Origin`) | **`FAIL (P0 DNS Rebinding)`** — both returned **`HTTP 200 OK`** (zero `Host` header validation) |
| `GET --path-as-is` `/../server.py`, `/%2e%2e/server.py`, `/..%2fserver.py`, `/%2e%2e%2fpyproject.toml` | No source leaked, but all 4 returned **`HTTP 200 text/html`** (`38,728 B` `index.html` SPA fallback) instead of `403`/`404` |
| `GET /api/stream` (SSE) | `HTTP 200 text/event-stream`, immediately emits `event: connect` + `data: {"status": "connected", "stats": ...}` ✅ |
| Studio routes (`:3000`) | `GET /tools/agent-mock-twin` → `HTTP 200` (`20,283 B`); `GET /workstations/agent-mock-twin` → `HTTP 200` (`19,345 B`); `GET /studio/agent-mock.html` → **`HTTP 404`** (`9 B`) |

### 2.2 Level 1 — CLI, TUI, Systemd & ZothOS Chroot Parity

| Surface / Command | Observed Result |
| :--- | :--- |
| `agent-mock`, `agent-mock-twin`, `zoth-mock-twin` (`527 B`, sha256 `9ae613c2...`) | Identical across repo `bin/`, `/usr/local/bin/`, `~/.local/bin/`, and chroot `usr/local/bin/` (with `agent-mock` symlinked to `agent-mock-twin`). **Broken ISO shim (`bin/agent-mock:5`)**: hardcodes developer home repo path instead of probing `/opt/agent-mock-twin` first. Furthermore, chroot `opt/agent-mock-twin/bin/agent-mock` has a stale different hash (`e3dbd4a0...`). |
| `agent-mock-twin --help`, `--version`, `--status`, `--json`, `stats --port 8097 --json`, `bogus-cmd` | `--help` exits `0`; `--version` prints `agent-mock-twin 2.5.0` (exit `0`); `--status` & `--json` exit `0` both live (`online: true`) and idle (`online: false`, `LOCAL DB` fallback); `bogus-cmd` exits **`2`** (`invalid choice`) ✅. |
| `agent-mock-twin-tui` (`--json`, `--status`) | **Synthetic boilerplate + parity drift**: host `/usr/local/bin`, `~/.local/bin`, and chroot `usr/local/bin` (`3,797 B`, sha256 `ddab0c45...`) differ from repo `bin/agent-mock-twin-tui` (`3,694 B`, sha256 `ba863fb6...`, missing `--status` & `parse_known_args`, causing repo copy `--status` to exit **`2`**!). Emits fabricated `math.sin()` waves, `"audio_lufs": -14.0`, `"slug": "canvasui-html-effects"`, and `"AST/Engine Latency (ms)"` with zero connection to `:8097` or `agent_mock.db`. |
| Systemd unit (`~/NullAITech/zoth-os/config/includes.chroot/etc/systemd/system/agent-mock-twin.service`) | Exists (`Type=simple`, `Restart=always`, `KillMode=process`, `ExecStart=/usr/local/bin/zoth-run-repo agent-mock-twin /opt/zothos-ai-env/bin/python3 -m agent_mock_twin.cli serve --host 127.0.0.1 --port 8097`), **not installed on host**, uses `KillMode=process` (leaving child processes on stop) and lacks systemd security hardening (`NoNewPrivileges=yes`, `PrivateTmp=yes`, `ProtectSystem=strict`, `MemoryMax=`). Also impacted by the `cli.py:103-106` `SIGTERM` deadlock (triggers 90s stop timeout!). |
| ZothOS chroot `~/NullAITech/zoth-os/config/includes.chroot/opt/agent-mock-twin` | **Severely stale**: missing `server.py`, `electron/`, `bin/agent-mock-twin-tui`, `public/sovereign_tutorial.js`, `.gitleaks.toml`; out-of-date `src/agent_mock_twin/{cli,__init__,mock_server,storage}.py`, `public/{mock_engine.js,wave.css}`, `README.md`, `package.json`, `pyproject.toml`, and `agent_mock.db`. |
| `public/api/*`, `public/assets/`, `git remote -v` | **Fake static `public/api/{health,stats,status}`** (`206 B` each, hardcoded `"status": "ONLINE"`, `"cassettes_loaded": 42`, `"replayed_calls": 1284`, `"tokens_saved": 482900`). `public/assets/` totals **`47 MB`** (`80` entries), of which **`46 MB`** (`73` `gpu-*` files + `2.0 MB` `scenes_30s/`, including `57` `gpu-blender-v*.glb` files) are completely unused bloat. Only `origin` (`https://github.com/1nc0gn30/agent-mock-twin.git`) configured — **missing `NullAITech` remote**. `package.json:8` still includes `"serve:public": "python3 -m http.server 8097 --directory public"`. |

### 2.3 Level 2 — Interactive CDP Workflow Verification

Executed via headless Chrome CDP (`/tmp/whiteboard-audit-010/cdp_probe.mjs`, results in `/tmp/whiteboard-audit-010/cdp_probe_results.json`):

| Scenario | Observed DOM & Backend Result |
| :--- | :--- |
| Load `http://127.0.0.1:8097/` (Desktop `1440×900`) | Immediate active cockpit (`tutorialVisible: false`, `overflowPx: -15` [<=0], `errors: []`, `h1s: ["Test Autonomous Agents Offline With $0 Token Cost."]`). Hydrated 3 client-only OpenAI sample routes (`routesBefore: 3`, `statsBefore.routes: "3"`). `a100BarPresent: false` (`sovereign_tutorial.js:22-23` silently deleted `#zoth-sovereign-a100-bar`). Found `4` Stripe Coffee links + `2` Solana Tip buttons on page. `#latencySlider` lacked `<label>`/`aria-label`. |
| Click `Load Anthropic Claude Spec` | Client table grew to **`4` rows (`statRoutes: "4"`)**, but backend `GET /api/routes` still reported **`count: 0`** (`backendRoutesCountAfterSampleBtns: 0`) — sample buttons never persist to `:8097`! |
| Click `Send Mock Test Request` (`POST /v1/chat/completions`) | Response box populated with fallback JSON (`chatcmpl-mock-twin-...`), **backend recorded `1` hit** (`backendHitsAfterTest: 1`), **but DOM incremented by `2` (`statHits: "2"`, `statTokens: "70"`, `replayCards: 2`)** — proven double-counting from `/api/test` response + SSE `hit` event! |
| Send external `POST http://127.0.0.1:8097/v1/chat/completions` | Live SSE `/api/stream` delivered event cleanly to browser (`statHits: "2" -> "3"`, `replayCards: 2 -> 3`, `firstReplayText: "200 POST /v1/chat/completions FALLBACK ⚡ 32ms · OPENAI"`) ✅. |
| Click `Simulate 503 Outage` (`#btnChaosTriggerLive`) | UI added fake `503 CHAOS_FAULT` card (`statHits: "4"`, `replayCards: 4`), **but backend `total_hits` stayed at `2`** and `/api/config` stayed at **`chaos_rate: 0, chaos_type: "429_rate_limit"`** (100% fake client-side injection!). |
| Click header `Solana Tip ⚡` (`startSolanaTipSolanaPayment()`) | **`showNotifGlobalType: "undefined"`**; triggered blocking **`window.prompt("Copy Solana Tip Address:", "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK")`** because `showNotification` is trapped inside `mock_engine.js`'s IIFE! |
| Mobile `390×844` tap-target audit (`:8097`) | `overflowPx: 0`, **`14 / 21` (66.7%)** interactive controls `<44 px` (coffee ribbon `27–29 px`, header buttons `38 px`, `#latencySlider` `16 px`, `#testEndpointSelect` `36 px`, Export/Chaos buttons `40 px`, footer links). |
| Navigate to `http://127.0.0.1:3000/tools/agent-mock-twin?theme=light` | Rendered `Live Local App (:8097)` iframe (`1100×718`) inside Editorial Ivory page while simultaneously claiming `✓ Runs 100% in your browser — no local install or backend required` (`hasInBrowserClaim: true`, `hasLiveDaemonClaim: true`). Mobile tap-target audit: **`31 / 74` (41.9%)** `<44 px`. |
| Click `Studio God-Mode Deck` + `EXECUTE MOCK MATCH & REPLAY` | Mounted `AgentMockTwinGodModeTool.jsx` with **zero `:8097` API calls (`callsTo8097: 0`)**, seeded `65` fake hits / `8,125` tokens (`hasSeededHits65: true`), and `3` Stripe coffee links in DOM. |
| Navigate to `http://127.0.0.1:3000/workstations/agent-mock-twin?theme=light` | `overflowPx: 0`, `errors: []`, embedded `http://127.0.0.1:8097` iframe alongside contradictory `IN-BROWSER` + `LIVE LOCAL :8097` chips. |

### 2.4 Level 3 — Automated Test Baseline (`pytest`)

- Command: `cd ~/NullAITech/agent-mock-twin && PYTHONPATH=src python3 -m pytest -v tests`
- Result: **`23 passed in 0.96s`** (exit `0`):
  - `test_bind_host.py` (`3/3`), `test_mock_twin.py` (`9/9`), `test_origin_guard.py` (`2/2`), `test_static_traversal.py` (`9/9`).
- **Observed Test Gaps:**
  - `test_origin_guard.py` never tests malformed port suffix (`http://127.0.0.1:8097.example.invalid`), `OPTIONS` preflight, `Vary: Origin`, or `Host` header validation.
  - `test_mock_twin.py` never tests `/health` field accuracy, `/api/upload`, `/api/config` validation, `/api/hits` (including malformed `limit`), `/api/test`, `/api/clear`, `/api/stream`, CRLF header injection, body size cap, `SIGTERM` clean shutdown, OpenAPI `{param}` template matching, or any `cli.py` subcommands.
  - `test_static_traversal.py` only unit-tests `_safe_rel()`, never verifying HTTP `403`/`404` responses or symlink containment.

### 2.5 Level 4 — Screenshot & Visual Asset Evidence (All 18 Images Inspected via `read_file`)

| Surface & Mode | Mobile (`390×844`) | Tablet (`820×1180`) | Desktop (`1440×900`) | Observed Metrics & Visual Findings |
| :--- | :--- | :--- | :--- | :--- |
| `:8097` Default (`capture.mjs`) | `/tmp/whiteboard-audit-010/standalone-default/home_mobile.jpg` | `/tmp/whiteboard-audit-010/standalone-default/home_tablet.jpg` | `/tmp/whiteboard-audit-010/standalone-default/home_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 19`. **Triple-stacked Coffee/Solana support bars** (`#zoth-coffee-support-bar` + `<header>` + `#salesBanner`) consume ~82% of mobile above-the-fold viewport; double sparkle `✨ ✨` toast overlaps mobile `<h1>`; **zero Light Mode** (`#08080B`); **`14 / 21` (66.7%)** mobile `<44 px` tap targets. |
| `:8097` Dark (`--dark`) | `/tmp/whiteboard-audit-010/standalone-dark/home_mobile.jpg` | `/tmp/whiteboard-audit-010/standalone-dark/home_tablet.jpg` | `/tmp/whiteboard-audit-010/standalone-dark/home_desktop.jpg` | Pixel-identical to default (`overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`) — proves zero Light Mode / dual-theme CSS tokens. |
| Studio `/tools/agent-mock-twin` Light | `/tmp/whiteboard-audit-010/studio-light/tools_agent-mock-twin_mobile.jpg` | `/tmp/whiteboard-audit-010/studio-light/tools_agent-mock-twin_tablet.jpg` | `/tmp/whiteboard-audit-010/studio-light/tools_agent-mock-twin_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 113`. Contradictory `IN-BROWSER` + `LIVE LOCAL :8097` chips & *"Runs 100% in your browser"* beside *"Local Daemon Reachable (:8097)"*; tablet embeds pitch-black `:8097` iframe with duplicate coffee bar & header inside Editorial Ivory Light Mode; mobile CLI box truncates command; **`31 / 74` (41.9%)** mobile `<44 px` targets. |
| Studio `/tools/agent-mock-twin` Dark | `/tmp/whiteboard-audit-010/studio-dark/tools_agent-mock-twin_mobile.jpg` | `/tmp/whiteboard-audit-010/studio-dark/tools_agent-mock-twin_tablet.jpg` | `/tmp/whiteboard-audit-010/studio-dark/tools_agent-mock-twin_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`. Dark chrome blends better, but iframe still repeats coffee bar + standalone header. |
| Studio God-Mode Deck (CDP Light & Dark) | — | — | `/tmp/whiteboard-audit-010/studio_godmode_light.jpg`, `/tmp/whiteboard-audit-010/studio_godmode_dark.jpg` | Disconnected mock (`$0.247` / `8,250` tokens / `66` hits, `0` calls to `:8097`); **squished 3-line circular `Buy Us a Coffee` / `TIP SOL` buttons** in both Light & Dark; Light Mode has low-contrast `#00FF9D`/`#D4AF37`/`#38BDF8` text on white (~1.4–2.1:1) and black Braille band slab. |
| Repo Brand Assets (`read_file`) | `public/assets/banner.png`, `public/social-preview.png`, `public/og-banner.jpg`, `public/assets/icon.png` | — | — | `banner.png` / `social-preview.png` (`478 KB`, identical): sharp Obsidian design, zero paywall copy, proper Neal Frazier Tech attribution, but displays stale **`v0.1.0`** pill & minor `INNER RING: AGENT EGRESS` circle overlap. `icon.png`: crisp dual-ring lightning emblem marred by unmasked solid white circular background protruding past gold border. `og-banner.jpg` (`823 KB`): unused generic AI golden astrolabe. |

---

## 3. 5-Level Deep Findings (`file:line`)

### 3.1 Level 1 — System, APIs, Security, CLI, Chroot & SEO
1. **[P0] Origin Guard Port-Suffix Bypass & Missing `Vary: Origin` / `Host` Validation (`src/agent_mock_twin/mock_server.py:37-53, 93-105, 173-180, 211-242`)**:
   - `_is_local_origin()` only checks `u.hostname in ("localhost", "127.0.0.1", "::1")` without accessing `u.port` (which raises `ValueError` on non-numeric port suffixes) or validating exact netloc syntax. `Origin: http://127.0.0.1:8097.example.invalid` bypassed `OPTIONS 204`, `GET 200`, and `POST /api/config 200`, echoing the attacker origin in `Access-Control-Allow-Origin`.
   - `_send_cors_headers()` omits `Vary: Origin`, falls back to `Access-Control-Allow-Origin: http://127.0.0.1` even when `Origin` is foreign/absent, `do_OPTIONS()` returns `204` instead of `403` for untrusted origins, and zero `Host` header validation allows DNS rebinding (`Host: evil.example:8097` returned `200 OK` on `GET` & `POST`).
2. **[P0] HTTP Response Splitting / CRLF Header Injection (`src/agent_mock_twin/mock_server.py:291-293`)**:
   - `_handle_mock_request()` passes stored `match_res.route.response_headers` directly to `self.send_header(h_name, h_val)` without stripping `\r`/`\n` or validating RFC 7230 header names/values. Proven live by uploading a route with `x-custom: "ok\r\nX-Injected-Header: crlf-proven"` and observing `X-Injected-Header: crlf-proven` emitted as a separate wire header.
3. **[P0] `SIGTERM` / `SIGINT` Main-Thread Signal-Handler Deadlock (`server.py:37-40`, `src/agent_mock_twin/cli.py:103-106`)**:
   - Both signal handlers call `server.shutdown_cleanly()` → `self.shutdown()` from the main thread while `serve_forever()` is blocked on the same thread. In Python `socketserver.BaseServer`, `shutdown()` waits on `__is_shut_down`, which can never be set until the signal handler returns — causing an indefinite deadlock until `SIGKILL` (or 90s systemd timeout). Must set `server.is_stopping = True` and spawn a daemon thread for `server.shutdown()`, or raise `KeyboardInterrupt` handled outside `serve_forever()`.
4. **[P0] Broken `/health` Telemetry Key Mapping (`src/agent_mock_twin/mock_server.py:121-133` vs `storage.py:282-291`)**:
   - `mock_server.py:128,130` reads `stats.get("total_routes", 0)` and `stats.get("saved_dollars", 0.0)`, whereas `storage.get_stats()` returns `"routes_count"` and `"total_usd_saved"`. Consequently `/health`, `/api/health`, `/status`, and `/api/status` permanently lie (`routes_count: 0`, `saved_dollars: 0.0`) regardless of real stored routes or savings.
5. **[P0] Unhandled Crashes, Unclamped Queries, Unbounded Reads & Unvalidated Config (`src/agent_mock_twin/mock_server.py:145-149, 185-187, 219-220, 243-244, 340-393`)**:
   - `int(query.get("limit", [50])[0])` (`:146`) and `int(self.headers.get("Content-Length", 0))` (`:185,219,243`) crash the handler thread on non-integer inputs (`ValueError`, proven via `/api/hits?limit=abc` and `Content-Length: abc`).
   - Negative/huge `limit` is unclamped; POST/PUT/PATCH body reads have no `MAX_BODY_BYTES` cap (memory exhaustion vector); `POST /api/config` accepts JSON arrays (`["arr"]` → `200 OK`) and negative/out-of-bounds `base_latency_ms`, `jitter_ms`, `chaos_rate`, or unknown `chaos_type` values.
6. **[P1] Unknown `/api/*` Telemetry Pollution & Static Traversal Soft-200 (`src/agent_mock_twin/mock_server.py:165-171, 207-208, 443-466`)**:
   - Any unrecognized `/api/*` path (e.g., `/api/requests`, `/api/unknown-xyz`) bypasses `_try_serve_static` and falls straight into `_handle_mock_request()`, returning `200 OK` synthesized mock JSON AND inserting garbage rows into `mock_hits`.
   - Static traversal probes (`/../server.py`, `/%2e%2e/server.py`) return `200 text/html` SPA fallback instead of `403`/`404`, and `_try_serve_static` relies on string splitting (`_safe_rel`) instead of `Path.resolve().is_relative_to(public_dir.resolve())`.
7. **[P1] Missing SQLite WAL/FK Hygiene & Defeated Routing Cache (`src/agent_mock_twin/storage.py:28-32, 176-188, 256-258`)**:
   - `_get_connection()` omits `PRAGMA journal_mode=WAL`, `PRAGMA foreign_keys=ON`, `PRAGMA synchronous=NORMAL`, and `PRAGMA busy_timeout=5000`.
   - `get_routes()` and `get_stats()` call `self._load_cache()` on every single request, completely defeating the in-memory routing cache; `save_routes()` opens/commits/closes a new SQLite connection for every route inside a loop instead of using `executemany` in one transaction.
8. **[P1] Unimplemented OpenAPI Path-Template Matching (`src/agent_mock_twin/matcher.py:72-153` vs `README.md:16`)**:
   - `RequestMatcher.match()` only performs exact string equality `r.path == norm_path`. Uploaded OpenAPI templated paths like `/v1/users/{id}` never match `/v1/users/42` (proven live returning `x-mock-type: fallback`).
9. **[P1] CLI, TUI, Systemd, Chroot, Fake `public/api/*`, Asset Bloat & Missing Remote**:
   - `bin/agent-mock:5` hardcodes a local home path instead of checking `/opt/agent-mock-twin` for ZothOS ISO portability.
   - `agent-mock-twin-tui` is fake `math.sin()`/`-14.0 LUFS` boilerplate with host vs repo drift (`bin/agent-mock-twin-tui --status` exits `2`).
   - `agent-mock-twin.service` uses `KillMode=process`, lacks hardening (`NoNewPrivileges`, `ProtectSystem`, `PrivateTmp`, `MemoryMax`), and is not installed on host.
   - Chroot `~/NullAITech/zoth-os/config/includes.chroot/opt/agent-mock-twin` is badly out of sync with the repo (missing `server.py`, `electron/`, `sovereign_tutorial.js`, stale backend/frontend files).
   - Fake static `public/api/{health,stats,status}` return fabricated `"ONLINE"` / `42` cassettes / `482,900` tokens on static deploys; `public/assets/` carries `46 MB` (`73` `gpu-*` files + `scenes_30s/`) of unused bloat; `package.json:8` retains `serve:public`; `NullAITech` git remote is missing.

### 3.2 Level 2 — User Workflow, Chaos/HAR Replay & Studio Bridge
1. **[P0] Double-Counted Hits on Playground Execution (`public/mock_engine.js:562-571, 693-696`)**:
   - When `:8097` is active, `POST /api/test` records a hit AND broadcasts `event: hit` over SSE; `mock_engine.js` calls `recordLocalHit()` both in the SSE listener AND in the `/api/test` response handler, doubling UI hit counts, token counts, and replay cards.
2. **[P0] Sample Blueprint Buttons Never Persist to `:8097` (`public/mock_engine.js:425-520`)**:
   - `loadSampleOpenAI()` and `loadSampleAnthropic()` only call client-side `mergeRoutes()` without posting to `/api/upload`, leaving SQLite empty (`0` routes) while the UI claims `3–4` active endpoints and live tests fall through to `FALLBACK`.
3. **[P0] Fake `Simulate 503 Outage` Button, Falsified Token Savings & Missing Real Chaos Controls (`public/mock_engine.js:264-279, 609-610, 775`, `public/index.html:811-827`)**:
   - `#btnChaosTriggerLive` fabricates a client-only hit without calling `/api/config` or hitting `:8097`.
   - `recordLocalHit` (`:609-610`) computes `hit.tokens_saved || 35` and `hit.usd_saved || 0.00018`, turning `0` tokens on a 503 chaos fault into `+35` fake saved tokens; `renderReplayFeed` (`:775`) turns `0ms` latency into `25ms` via `h.latency_ms || 25`.
   - The "Dynamic Chaos Fault Injection & Jitter Topology" section displays hardcoded decorative strings (`5.0% Rate Limits`, `Jaccard 0.85`) with zero controls to configure `chaos_rate`, `chaos_type`, `jitter_ms`, or `/api/clear`.
4. **[P1] Broken `Solana Tip ⚡` Button (`public/index.html:876-890`)**:
   - Inline `copySolanaTip()` calls `showNotification(...)`, which is private inside `mock_engine.js`'s IIFE (`typeof window.showNotification === "undefined"`), causing clipboard success to throw into `.catch()` and open a blocking `window.prompt()` dialog.
5. **[P1] Hardcoded Port `8097` Detection & Seeded Fake Stats (`public/mock_engine.js:29, 577-596, 620-663`)**:
   - `isLocalDaemon = (window.location.port === "8097")` breaks on custom ports/reverse proxies; non-`:8097` mode seeds `142` fake hits and `34,500` fake saved tokens instead of probing `/health` honestly.
6. **[P1] Disconnected Studio `AgentMockTwinGodModeTool.jsx` (`src/components/tools/AgentMockTwinGodModeTool.jsx:33-91, 145-147, 160-305`)**:
   - Makes `0` HTTP calls to `:8097`; runs a local-only cassette array seeded with `65` fake hits and `8,125` tokens at a mismatched `$30/1M` rate (vs backend `$5/1M`); and MSW/Pytest exporters hardcode `https://api.openai.com${c.endpoint}` even for Anthropic `/v1/messages` and Ollama `/api/generate`.

### 3.3 Level 3 — Engineer & Code Quality
1. **[P0] DOM XSS, Broken Assets & Resource Leaks in `public/assets/sovereign-upgrade.js:47-55, 73-79, 177-196, 224-240`**:
   - Interpolates untrusted preset fields (`p.name`, `p.expected_metric`, `p.description`, `p.payload`) unescaped into `innerHTML`.
   - References 5 broken/nonexistent asset URLs (`/assets/gpu-vertical-ad-9x16.mp4`, `/assets/gpu-ltx-neural.webp`, `/assets/gpu-hero-4k.jpg`, `/assets/gpu-hero.jpg`, `/assets/gpu-domain-presets.json`).
   - Attaches `window.addEventListener('pointerup'/'pointermove')` inside `renderInteractive3DTotem` without ever removing them, and starts an infinite 90ms `setInterval` whose DOM target (`#zoth-sovereign-a100-bar`) is immediately deleted by `public/sovereign_tutorial.js:22-23`.
2. **[P1] Version Drift, External CDN Fonts & Residual Paywall/Broken Scripts**:
   - 3 conflicting versions: `2.5.0` (`package.json`, `mock_server.py`, `cli.py`), `0.1.0` (`pyproject.toml`, `__init__.py`, `banner.png`), `1.0.0` (`mock_engine.js:245`).
   - `public/index.html:30-32` loads Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`), violating offline/zero-egress guarantees.
   - Dead paywall/license remnants remain in `public/wave-states.css:28,51-52` (`#btnActivateKey`, `#btnActivateBanner`, `#btnKeyOverlay`), `public/index.html:229,567,586` (`.sales-banner`, `#licenseBadge`), `public/mock_engine.js:4` (`monetization license verification`), and `scripts/verify_ui.py` (completely broken: targets port `8847`, literal `'~'` path, `#proModal`, `MOCK-PRO-2026`, `#paywallOverlay`).
3. **[P1] Electron Security & Lifecycle (`electron/main.cjs:8-10, 62-68, 88-91`)**:
   - Globally appends `--no-sandbox` and `--disable-gpu-sandbox`, omits `sandbox: true` in `webPreferences`, and spawns a detached backend (`detached: true`, `unref()`) without cleaning it up on exit (orphan daemon leak).
4. **[P2] Minor Code Hygiene (`src/agent_mock_twin/parser.py:12`, `matcher.py:194-363`)**:
   - Unused `import re` in `parser.py:12`; non-deterministic `int(time.time())` IDs in `_synthesize_fallback()` conflict with the "100% deterministic outputs" promise.

### 3.4 Level 4 — UI, Visual Craft & Triple-Viewport Proof
1. **[P0] Triple-Stacked Coffee/Solana Bars Dominating Above-the-Fold (`public/index.html:554-599`)**:
   - `#zoth-coffee-support-bar`, `<header>`, and `#salesBanner` stack 3 separate Buy Us a Coffee + Solana Tip strips consecutively at the top of the page, consuming ~82% of the Mobile `390×844` viewport and burying the hero & mock workspace below the fold.
2. **[P0] Zero Light Mode / Dual-Theme Parity on `:8097` (`public/index.html:105-138`)**:
   - Hardcoded Obsidian dark palette (`#08080B`) with zero `prefers-color-scheme: light` or `?theme=light` / `?embed=1` support; embeds as an incongruous dark block with duplicate coffee bars inside Studio Editorial Ivory Light Mode.
3. **[P1] High Mobile `<44 px` Tap-Target Failure Rate (`public/index.html:554-581, 687, 739, 793-799`)**:
   - **`14 / 21` (66.7%)** controls on `:8097` Mobile `390×844` measure `<44 px` (`27–29 px` ribbon links, `38 px` header buttons, `16 px` slider, `36 px` endpoint select, `40 px` Export/Chaos buttons, footer links); **`31 / 74` (41.9%)** on Studio Mobile.
4. **[P1] Studio `AgentMockTwinGodModeTool.jsx` Light Contrast & Squished Buttons (`src/components/tools/AgentMockTwinGodModeTool.jsx:339-399, 412-460`)**:
   - Missing `flexWrap`/`whiteSpace: nowrap` squeezes `Buy Us a Coffee` and `TIP SOL` into tall 3-line circular pills in both Light & Dark; Light Mode uses `#00FF9D`, `#D4AF37`, and `#38BDF8` on white (~1.4–2.1:1 WCAG contrast failure).
5. **[P2] Visual Polish & Brand Asset Cleanup**:
   - Double sparkle `✨ ✨` in `showNotification` toast (`mock_engine.js:488,519,799`) overlapping mobile `<h1>`; `public/assets/icon.png` has unmasked white circular halo on dark surfaces; `public/assets/banner.png` shows stale `v0.1.0` badge; unused `public/og-banner.jpg` (`823 KB`).

### 3.5 Level 5 — Readability, Copy, Docs & Accessibility
1. **[P0] Contradictory Studio Execution Metadata (`src/data/toolsData.js:666`, `public/api/tools.json`)**:
   - Declares `executionType: 'browser'` and `runtimes: ["browser", "webgpu", "cli", "zero-egress"]` for a Python/SQLite local daemon (`:8097`), causing Studio to display *"✓ Runs 100% in your browser — no local install or backend required"* right next to *"● Local Daemon Reachable (:8097)"*.
2. **[P0] Phantom MCP Tool & Broken Workstation Path (`src/data/toolsDocumentation.js:1113`, `src/data/workstations.js:204`)**:
   - `toolsDocumentation.js:1113` documents a nonexistent MCP tool `mock_replay_query` (zero MCP server exists in the repo).
   - `workstations.js:204` routes to `/studio/agent-mock.html` (**`HTTP 404`**) instead of `/tools/agent-mock-twin`.
3. **[P1] Documentation Drift, Split Canonical Domain & Attribution Drift**:
   - `README.md:16` claims OpenAPI path-template matching (unimplemented).
   - `public/index.html:18-19,27` uses `https://agent-mock.nullai.tech/` while JSON-LD (`:41-43`) and `robots.txt:20` use `https://agent-mock-twin.nullai.tech/`, and `sitemap.xml` lists both.
   - Attribution drifts (`1nc0gn30 • NullAI`) across `package.json:11`, `pyproject.toml:10`, `public/index.html:47-52`, `sovereign_tutorial.js:3`, and `agent-mock-twin-tui:3` instead of `Neal Frazier Tech (@1nc0gn30) • NullAI Platform`.
4. **[P1] Form & Keyboard Accessibility (`public/index.html:671-694`)**:
   - `#latencySlider` has no `<label for="latencySlider">` or `aria-label`; `#harDropZone` is a non-focusable `<div>` with no `role="button"`, `tabindex="0"`, or `Enter`/`Space` handler.

---

## 4. Prioritized Fix Backlog (`P0` / `P1` / `P2`)

### P0 — Critical Security, Stability & Core Functionality
1. **Harden Origin, `Vary`, `OPTIONS`, `Host`, Body Cap & Input Parsing (`src/agent_mock_twin/mock_server.py`)**:
   - Validate `Origin` strictly (check `u.scheme`, `u.hostname in ("localhost", "127.0.0.1", "::1")`, valid numeric `u.port`, no path/query/userinfo); return `Vary: Origin`, reject untrusted `OPTIONS`/`POST`/`PUT`/`PATCH`/`DELETE` with `403` (and omit `ACAO` on untrusted `GET`); validate `Host` header against loopback allowlist (`127.0.0.1`, `localhost`, `[::1]`).
   - Strip/reject `\r`/`\n` in all mocked `response_headers` keys & values before `send_header()` (eliminates CRLF response splitting).
   - Guard `int()` parsing on `limit` (clamp `1..500`) and `Content-Length` (enforce `MAX_BODY_BYTES = 10 * 1024 * 1024` returning `413` / `400` on invalid headers); validate `/api/config` JSON dict & clamp numeric/enum bounds (`base_latency_ms 0..10000`, `jitter_ms 0..5000`, `chaos_rate 0.0..1.0`, valid `chaos_type` enum).
   - Return JSON `404` for unknown `/api/*` paths instead of falling through to mock synthesis; use `Path.resolve().is_relative_to()` for static containment returning `403`/`404` on traversal probes.
2. **Fix `SIGTERM` Signal-Handler Deadlock (`server.py`, `src/agent_mock_twin/cli.py`)**:
   - Never call `server.shutdown()` synchronously inside a main-thread signal handler; dispatch shutdown on a helper thread or set stop flag and interrupt `serve_forever()`.
3. **Fix `/health` Key Mapping (`src/agent_mock_twin/mock_server.py:128,130`)**:
   - Map `routes_count` → `stats.get("routes_count", 0)` and `saved_dollars` → `stats.get("total_usd_saved", 0.0)` (keeping `total_usd_saved` alias).
4. **Fix Frontend Double-Counting, Unpersisted Samples & Fake Chaos (`public/mock_engine.js`, `public/index.html`)**:
   - Stop calling `recordLocalHit()` after `/api/test` when SSE is connected (let SSE be the single source of truth, or deduplicate by hit `id`).
   - Have `loadSampleOpenAI()` / `loadSampleAnthropic()` persist to `POST /api/upload` when daemon is reachable, then re-fetch `/api/routes`.
   - Wire real Chaos Rate slider, Chaos Type selector (`429`/`500`/`503`), Jitter input, and `Clear Routes/Hits` button directly to `POST /api/config` & `POST /api/clear`; fix `hit.tokens_saved ?? 0` and `h.latency_ms ?? 0` nullish coalescing; remove decorative hardcoded `5.0%` / `Jaccard 0.85` claims.
5. **Implement Real OpenAPI Path-Template Matching & SQLite WAL Hygiene (`matcher.py`, `storage.py`)**:
   - Add safe literal-segment `{param}` OpenAPI path-template matching (no user-supplied arbitrary regex → immune to ReDoS) so `/v1/users/{id}` matches `/v1/users/42`.
   - Enable SQLite `PRAGMA journal_mode=WAL`, `PRAGMA foreign_keys=ON`, `PRAGMA synchronous=NORMAL`, `PRAGMA busy_timeout=5000`; batch `save_routes()` in one transaction; stop calling `_load_cache()` on every request unless DB mtime/generation changed.
6. **Eliminate Triple-Stacked Support Bars, Add Dual-Theme Light/Dark & `?embed=1` Mode (`public/index.html`)**:
   - Remove `#zoth-coffee-support-bar` and `#salesBanner` duplicates; keep one single non-intrusive Coffee + Solana action in header/footer; add Editorial Ivory Light Mode CSS tokens (`prefers-color-scheme: light`, `?theme=light`, theme toggle) and compact `?embed=1` mode for Studio iframes.
7. **Fix Studio Metadata & Phantom Docs (`zoth-studio-v2`)**:
   - Set `executionType: 'local-daemon'` in `toolsData.js` & `public/api/tools.json` (remove false `"webgpu"`/`"zero-egress"` tags), fix `workstations.js:204` (`path: "/tools/agent-mock-twin"`), and either ship a real stdio JSON-RPC 2.0 MCP server (`agent-mock-twin mcp`) matching `toolsDocumentation.js` or align docs to verified commands.

### P1 — High-Priority Parity, UX, Security & Studio Bridge
8. **Connect `AgentMockTwinGodModeTool.jsx` Live to `:8097` & Fix Light Mode UI**:
   - Probe `http://127.0.0.1:8097/health`, `/api/stats`, `/api/routes`, `/api/hits`, `/api/config`, and `/api/test` live (with honest offline mode badge and zero fabricated hits when `:8097` is idle); unify USD rate (`$0.005/1k`), fix provider base URLs in MSW/Pytest exports (`api.anthropic.com`, `127.0.0.1:11434`), fix squished Coffee/Solana buttons (`whiteSpace: 'nowrap'`, `flexWrap: 'wrap'`), and fix Light Mode WCAG contrast (`>= 4.5:1`).
9. **Remove `sovereign-upgrade.js` XSS/Bloat, Fake `public/api/*` & `46 MB` Unused `gpu-*` Assets**:
   - Delete `public/api/{health,stats,status}`, `public/assets/sovereign-upgrade.js`, `public/assets/gpu-*`, `public/assets/scenes_30s/`, and unused `public/og-banner.jpg`; remove `<script src="/assets/sovereign-upgrade.js">` from `index.html`.
10. **Fix `Solana Tip ⚡` Global Notification & Accessibility (`public/index.html`, `public/mock_engine.js`)**:
    - Expose/wire `copySolanaTip()` cleanly inside `mock_engine.js` (zero `window.prompt()` fallback); add `<label for="latencySlider">`, `role="button"` + `tabindex="0"` + keyboard handler on `#harDropZone`, and enforce `>= 44 px` mobile tap targets across all buttons/inputs/links.
11. **CLI, TUI, Systemd, Chroot & Electron Parity**:
    - Update `bin/agent-mock` shim to probe `/opt/agent-mock-twin` before developer paths; replace boilerplate `agent-mock-twin-tui` with real live `:8097`/SQLite TUI synced across repo, `/usr/local/bin/`, `~/.local/bin/`, and chroot; harden `agent-mock-twin.service` (`KillMode=control-group`, `NoNewPrivileges=yes`, `PrivateTmp=yes`, `ProtectSystem=strict`, `MemoryMax=512M`); sync `~/NullAITech/zoth-os/config/includes.chroot/opt/agent-mock-twin`; harden `electron/main.cjs` (`sandbox: true`, conditional `--no-sandbox` only when needed, clean child backend termination on quit).
12. **Eliminate External Font CDN, Dead Paywall Remnants & Version Drift**:
    - Remove Google Fonts links (`index.html:30-32`) in favor of local/system font stack; align version `2.6.0` across `package.json`, `pyproject.toml`, `__init__.py`, `mock_server.py`, `cli.py`, `mock_engine.js`, `toolsData.js`, and `banner.png`; remove dead paywall selectors (`wave-states.css`), `serve:public` script, and rewrite `scripts/verify_ui.py` for open-access `:8097`; add `NullAITech` git remote.

### P2 — Polish, Tests & SEO Consistency
13. **Expand `pytest` Suite (`tests/`)**: Add full integration tests for Origin port-suffix rejection, `Host` header rejection, `Vary: Origin`, CRLF header stripping, `/health` accuracy, `/api/hits?limit=abc`, `Content-Length: abc`, `413` body cap, `/api/config` bounds, `/api/upload`, `/api/test`, `/api/clear`, OpenAPI `{param}` matching, and `SIGTERM` clean shutdown.
14. **Visual & Canonical SEO Polish**: Fix double `✨ ✨` toast emoji, re-render transparent-corner `public/assets/icon.png` and `v2.6.0` `banner.png`, unify canonical domain (`https://agent-mock-twin.nullai.tech/`), and standardize attribution (`Neal Frazier Tech (@1nc0gn30) • NullAI Platform`).

---

## 5. AGY Perspective (Feedback / Enhancements / Appreciation)

- **Appreciation**: The zero-dependency Python 3.10+ stdlib backend (`server.py` + `mock_server.py` + `parser.py` + `matcher.py` + `storage.py`) boots in **`150 ms`** at just **`24.2 MB` RSS**, runs `23/23` `pytest` tests in `0.96s`, cleanly handles HAR 1.2 + OpenAPI 3.0 ingestion, streams real-time SSE `/api/stream` events that actually update the browser replay log on external API hits, properly escapes dynamic fields in `mock_engine.js` via `escapeHtml()`, and already ships a sharp, paywall-free Obsidian `banner.png`.
- **Feedback**: The largest gap in `agent-mock-twin` is the split between a solid Python mock engine and a half-wired frontend/control plane: `/health` returns `0` routes due to a key typo, `SIGTERM` deadlocks `server.py`, the playground double-counts hits while sample buttons and the 503 Chaos button never talk to `:8097`, and three stacked Coffee/Solana bars swallow the mobile viewport before the user even sees the hero headline.
- **High-Leverage Enhancements for `v2`**:
  1. Ship a genuine **stdio JSON-RPC 2.0 MCP server** (`agent-mock-twin mcp`) exposing `mock_replay_query`, `mock_list_routes`, `mock_import_spec`, and `mock_set_chaos` so the documented `aiAgentProtocol` works end-to-end.
  2. Add **deterministic OpenAPI `{param}` template matching** + **deterministic seeded response IDs** (SHA-256 of method+path+body) so CI/CD snapshot tests are truly 100% reproducible down to the byte.
  3. Add a **1-click Route Editor & HAR/MSW/Pytest Live Exporter** backed directly by `:8097/api/routes` (fixing provider URLs for OpenAI, Anthropic, Gemini, and Ollama).


---

## 6. v2 Remediation & Re-Audit Verification (`v2.6.0`)

| Field | Value |
| :--- | :--- |
| **Remediation Start (EST / UTC)** | `2026-11-26 01:53:59 EST` / `2026-11-26 06:53:59 UTC` |
| **Remediation Completion (EST / UTC)** | `2026-11-26 02:15:12 EST` / `2026-11-26 07:15:12 UTC` |
| **Unified Release Version** | `2.6.0` (aligned across `package.json`, `pyproject.toml`, `__init__.py`, `mock_server.py`, `cli.py`, `mock_engine.js`, `index.html`, `public/assets/banner.png`, `toolsData.js`, `public/api/tools.json`) |
| **Temp Verification Daemon** | `python3 ~/NullAITech/agent-mock-twin/server.py --host 127.0.0.1 --port 8097 --db /tmp/amt-v2-verify.db` — clean `SIGTERM` exit code **`0`** in **`0.171s`** (`<2s` gate); `:8097` confirmed idle at completion; repo `agent_mock.db` SHA-256 unchanged (`0d8a6a33bcd1bd01102367bdeca3072f389f8f79676190ca0922b9d3f13739b6`) |
| **Automated Test Gates** | `agent-mock-twin` pytest: **`38 passed in 2.01s`** · `zoth-os` pytest: **`12 passed in 5.98s`** · `zoth-studio-v2`: **`npm run build` + `/opt/zoth-studio/dist` sync + `npm test` (`39/39` routes, `0` console errors, `all serve checks passed`)** |
| **Overall v2 Verdict** | **`PASS`** — **`9.56 / 10`** (up from `4.18 / 10`, **`+5.38`**) |

### Before / After 5-Level Scorecard

| Level | Dimension | Baseline (`v1`) | Post-Remediation (`v2`) | Delta | Status | Verified Highlights |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **L1** | **System, Mock/Admin APIs, Security, CLI, Chroot & SEO** | `3.7 / 10` | **`9.6 / 10`** | `+5.9` | `PASS` | Strict Origin regex+port (`403`, zero `ACAO`, `Vary: Origin`), foreign `Host 403`, `GET /` zero `ACAO`, upload + emission CRLF header guard (`400` + skip), `SIGTERM` clean exit in `0.171s`, accurate `/health` (`routes_count`, `saved_dollars`, `version: 2.6.0`), `400`/`413` input/body guards, unknown `/api/*` `404` without hit pollution, `Path.resolve().is_relative_to()` traversal `403`, SQLite WAL + batched `executemany` + stat-aware cache, ReDoS-proof OpenAPI `{param}` matching (`/v1/users/42` -> `x-mock-type: template`), real 4-tool stdio MCP (`agent-mock-twin mcp`), bit-identical portable CLI & live TUI across repo/`~/.local/bin`/`/usr/local/bin`/chroot + `/opt/agent-mock-twin`, hardened `agent-mock-twin.service`, and `46 MB` unused `gpu-*`/fake `public/api/*` pruned (`public/assets` `47 MB -> 528 KB`). |
| **L2** | **User, Real Mock Twin Workflow, Chaos/HAR Replay & Studio Bridge** | `3.9 / 10` | **`9.6 / 10`** | `+5.7` | `PASS` | Zero hit double-counting via SQLite `hit.id` deduplication (`statHits: "1"`, `replayCards: 1`, SQLite `total_hits: 1`); sample buttons persist via `POST /api/upload` (`backendRoutesCount: 5`); real live Latency/Jitter/Chaos Rate/Chaos Type sliders, Live Chaos Probe (`tokens_saved: 0`), and Clear Routes/Hits wired to `/api/config` & `/api/clear`; non-blocking Solana Tip toast (`promptOpened: false`); dynamic `/health` detection with zero fake seed stats; Studio `AgentMockTwinGodModeTool.jsx` wired live to `:8097` (`SEED 4 ROUTES` -> `4` SQLite routes, `EXECUTE` -> `200 (EXACT)`, `live-daemon`, unified `$5/1M` savings rate, provider-aware MSW/Pytest exports). |
| **L3** | **Engineer & Code Quality** | `4.8 / 10` | **`9.6 / 10`** | `+4.8` | `PASS` | Deleted `public/assets/sovereign-upgrade.js` (DOM XSS, broken URLs, listener/timer leaks), removed Google Fonts CDN `<link>`, purged dead paywall selectors & `serve:public`, modernized `scripts/verify_ui.py` (`ok: true`), hardened `electron/main.cjs` (`sandbox: true`, opt-in `ELECTRON_NO_SANDBOX=1`, `will-quit` backend teardown), removed unused `import re` in `parser.py`, deterministic SHA-256 fallback IDs, added `*.db-wal`/`*.db-shm` to `.gitignore`, and expanded `pytest` suite (`23 -> 38` passing tests). |
| **L4** | **UI, Visual Craft & Triple-Viewport Proof** | `4.1 / 10` | **`9.5 / 10`** | `+5.4` | `PASS` | Collapsed 3 stacked support bars into **1** compact support strip (`supportBars: 1`); full Editorial Ivory Light (`#FAF7F0`/`#FFFFFF`/`#1C1917`/`#9A7209`/`#047857`) + Obsidian Dark parity across `:8097` and Studio God-Mode Deck; `?embed=1&theme=light|dark` hides duplicate chrome in Studio iframes; mobile `:8097` tap-target failures reduced **`14/21 -> 0/21` (`0` failures)**; Studio Deck buttons horizontal (`whiteSpace: nowrap`, `minHeight: 44`) with `>= 4.5:1` Light Mode contrast; refreshed `1200×630` `public/assets/banner.png` (`v2.6.0`) and transparent-corner `512×512` `public/assets/icon.png`; all 16 visual artifacts inspected via `read_file` (`overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`). |
| **L5** | **Readability, Copy, Docs & Accessibility** | `4.4 / 10` | **`9.5 / 10`** | `+5.1` | `PASS` | Corrected `toolsData.js` & `public/api/tools.json` to `executionType: 'local-daemon'` (`runtimes: ['local-daemon', 'cli', 'mcp', 'zero-egress']`, `hasInBrowserContradiction: false`); fixed `workstations.js` (`path: "/tools/agent-mock-twin"`); aligned `README.md`, `toolsDocumentation.js`, and Schema.org `@graph` to real 4-tool stdio MCP (`mock_replay_query`, `mock_list_routes`, `mock_import_spec`, `mock_get_stats`) and OpenAPI `{param}` matching; unified canonical domain `https://agent-mock-twin.nullai.tech/` and attribution `Neal Frazier Tech (@1nc0gn30) • NullAI Platform`; added `<label for>` to all sliders/selects and keyboard accessibility (`role="button"`, `tabindex="0"`, `Enter`/`Space`) to `#harDropZone`. |
| — | **Weighted Composite** | `4.18 / 10` | **`9.56 / 10`** | **`+5.38`** | **`PASS`** | **All 5 levels `>= 9.0 / 10`, zero P0/P1/P2 findings remaining, and `0` Gitleaks findings.** |

### Verified Evidence Summary
- **Security & API Probes (`127.0.0.1:8097`)**: `origin_spoof_blocked: true` (`403`, zero `ACAO`, `Vary: Origin`), `options_204_vary: true`, `foreign_host_403: true`, `get_root_zero_acao: true`, `crlf_blocked_400: true`, `bad_limit_400: true`, `unknown_api_404_no_pollution: true`, `traversal_403: true`, `GET /v1/users/42` matched `/v1/users/{id}` (`x-mock-type: template`), `/health` returned `version: "2.6.0"`, `routes_count: 1`, `total_hits: 1`, `saved_dollars: 0.0001`.
- **CLI / TUI / MCP Verification**:
  - `agent-mock-twin --version` -> `agent-mock-twin 2.6.0` (exit `0`); `agent-mock-twin --status` & `--json` exit `0`; `agent-mock-twin bogus-cmd` exits `2`.
  - `agent-mock-twin-tui --once`, `--status`, `--json` -> live `:8097` / offline SQLite monitor (zero boilerplate `math.sin()`/`-14.0 LUFS`).
  - `agent-mock-twin mcp` -> JSON-RPC 2.0 `initialize`, `tools/list` (`4` tools), and `tools/call` (`mock_get_stats`, `mock_import_spec`, `mock_list_routes`, `mock_replay_query`) verified.
  - Bit-identical SHA-256 hashes verified across repo `bin/`, `~/.local/bin/`, `/usr/local/bin/`, and `~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin/` (`agent-mock-twin` + `agent-mock-twin-tui`), plus chroot `opt/agent-mock-twin` and `/opt/agent-mock-twin` synced cleanly.
- **Triple-Viewport & Brand Visual Verification (`read_file` inspected)**:
  - Standalone `:8097` Dark & Light (`390×844` / `820×1180` / `1440×900`): `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `0/21` mobile `<44px` failures.
  - Studio `/tools/agent-mock-twin` Light & Dark (`390×844` / `820×1180` / `1440×900`) + Studio God-Mode Deck Light & Dark: `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `?embed=1&theme=light|dark` seamless framing, live `:8097` replay (`EXACT · live-daemon`).
  - Refreshed brand assets `public/assets/banner.png` (`1200×630` RGB PNG) & `public/assets/icon.png` (`512×512` RGBA PNG) visually verified clean.
