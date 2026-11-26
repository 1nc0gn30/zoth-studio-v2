# Whiteboard Verification Audit — #008 `agent-flight-recorder` (Agent Flight Recorder)

## 1. Header Metadata & 5-Level Scorecard

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#008` — `agent-flight-recorder` (**Agent Flight Recorder**) |
| **Audit Mode** | Baseline (`v1`) read-only 5-level audit. Target repo source files and tracked/local `flight_recorder.db` untouched (`git status -sb` clean: `## main...origin/main`; `flight_recorder.db` SHA-256 unchanged: `9061045b8b75b751e93eeba9b99b0bcdaf7700214f72e1a0166b0bab3b73dcf9`). |
| **Audit Start (EST / UTC)** | `2026-11-26 00:17:36 EST` / `2026-11-26 05:17:36 UTC` |
| **Audit Completion (EST / UTC)** | `2026-11-26 00:22:50 EST` / `2026-11-26 05:22:50 UTC` |
| **Repo & Git State** | `~/NullAITech/agent-flight-recorder` (`main` @ `137f163`, `origin=https://github.com/1nc0gn30/agent-flight-recorder.git`, **missing `NullAITech` remote**; `flight_recorder.db` (`147,456 B`) is untracked/gitignored) |
| **Standalone Surfaces Tested** | On-demand `python3 ~/NullAITech/agent-flight-recorder/server.py --host 127.0.0.1 --port 8104 --db /tmp/afr-audit-008.db` (isolated temp SQLite DB; startup `140 ms`, RSS `23.4 MB`, strictly loopback `127.0.0.1:8104`; cleanly terminated and `:8104` confirmed idle at completion) |
| **Studio Surfaces Tested** | `http://127.0.0.1:3000/tools/agent-flight-recorder` & `http://127.0.0.1:3000/workstations/agent-flight-recorder` (live Studio PID `530452`, untouched) |
| **Observed Versions (Drift)** | `2.5.0` (`package.json`, `cli.py --version`, `toolsData.js`, `public/api/*`, header badge `v2.5 SOVEREIGN`) vs **`0.1.0`** (`pyproject.toml:7`, `server.py:95` `/health` & `/api/health`, `public/index.html:952` header subtitle, `public/flight_deck.js:424` offline bundle generator) |
| **Automated Test Baseline** | `PYTHONPATH=src python3 -m pytest -v tests` → **`23 passed in 1.53s`** (exit `0`), with zero coverage for `/api/ingest`, malformed query/JSON bodies, Origin port-suffix bypass, Host header validation, exporter XSS, or CLI subcommands |
| **Overall Verdict** | **`NEEDS FIX`** — **`4.76 / 10`** |

### 5-Level Verification Scorecard

| Level | Dimension | Score | Status | Primary Root Causes |
| :---: | :--- | :---: | :---: | :--- |
| **L1** | **System, APIs, SQLite Storage, Security, CLI, Chroot & SEO** | **`4.2 / 10`** | `NEEDS FIX` | **Origin guard bypass (`src/agent_flight_recorder/server.py:34-50`)**: `OPTIONS`, `GET /api/stats`, and **`POST /api/ingest`** with `Origin: http://127.0.0.1:8104.example.invalid` all returned **`HTTP 200 OK`** and echoed that foreign Origin in `Access-Control-Allow-Origin` (`urlparse().hostname` returns `"127.0.0.1"` without checking `.port`). Missing `Vary: Origin`, `OPTIONS` returns `200` (not `204`/`403`), and zero `Host` header validation (`Host: evil.example:8104` returned `200 OK` on `GET` & `POST` — DNS rebinding). **Cross-daemon orphan & crash (`server.py:270-294, 207-210`)**: ingesting an exact `agent-capsule-jail` payload (`session_id: "capsule-jail-audit"`) writes an orphaned event without creating a `sessions` row (invisible in `/api/sessions`, `404` on `/api/session/capsule-jail-audit`), and `GET /api/export/bundle?session_id=capsule-jail-audit` **crashes the handler** (`curl: (52)`). **Unhandled crashes & unbounded bodies (`server.py:149, 263-268`)**: `/api/scrub/<sid>?offset_ms=abc` and `POST /api/ingest` with `["array"]` both crash (`curl: (52)`); malformed JSON `{not-json` silently returns `200 OK` and ingests an empty event; `2 MB` POST accepted with zero size cap. **Stored XSS in exported HTML (`exporter.py:15-16, 23, 150, 184-185`)**: raw `</script><script>window.__xss=1</script>` confirmed verbatim in exported bundle. No SQLite WAL mode, `foreign_keys=ON`, or SHA-256 hash-chain. Traversal probes (`/../server.py`, `/%2e%2e/server.py`), `/api/events`, and `/api/events/stream` return `200 text/html` SPA fallback; `POST /api/export/bundle` returns `404`. Host wrapper `agent-flight-recorder bogus-cmd` exits `0`; `-tui` is fake `math.sin()` / `-14.0 LUFS` boilerplate; systemd unit has zero hardening; chroot `/opt` drifted; `45 MB` `public/assets/` (`42 MB` across `73` unused `gpu-*` files); fake `public/api/*`; `#paywall` still in `public/sitemap.xml:22`; missing `NullAITech` remote. |
| **L2** | **User & Live Telemetry Forensics Workflow** | **`4.8 / 10`** | `NEEDS FIX` | Standalone `:8104` opens immediately into an active cockpit (no blocking tutorial modal), hydrates live ingested SQLite sessions (`flt-c5a6e033bb`), and scrubs terminal/egress/engrams/threat/tokens cleanly. However, Studio's `AgentFlightRecorderGodModeTool.jsx` is a **100% disconnected mock** (zero `fetch()` to `:8104`, hardcoded `INITIAL_STEPS` with non-cryptographic 64-bit `fnv1aHex` hashes mislabeled `CRYPTOGRAPHIC MERKLE CHAIN TOPOLOGY` & `ZERO DRIFT VERIFIED`), while the `:8104`-aware `AgentFlightRecorderTool` in `EnclaveToolsSuite.jsx:1736` is unmounted dead code. Standalone `:8104` never subscribes to `/api/stream` SSE (requires manual reload to see new events), renders no raw timeline/search/filter view (dropping `capsule_execution`, `file_mutation`, and `system_metric` events visually), hardcodes `window.location.port === "8104"` (`flight_deck.js:73`), overwrites empty sessions with `DEMO_EVENTS` (`:132`), lacks JSON/CSV/Markdown export, stamps a fabricated `"Valid Cryptographic Seal"` (`:445`), and Play fails to restart from `0` when scrubber is at `maxOffset`. |
| **L3** | **Engineer & Code Quality** | **`5.0 / 10`** | `NEEDS FIX` | Clean zero-dependency Python 3.10+ stdlib core (`23/23` `pytest` passing in `1.53s`), but degraded by stored XSS in both server (`exporter.py:15-16, 23, 150, 184-185`) and client (`flight_deck.js:431, 442-443`) HTML exporters, unescaped `innerHTML` + broken asset paths in `sovereign-upgrade.js:181,190,194,231-240`, broken CSS syntax (`.lock-overlay` stray closing brace at `public/index.html:701`) + dead paywall CSS, hardcoded fake `cpu_percent: 1.2` (`recorder.py:66`), broken type annotation `List[str] or str` (`recorder.py:26`), unguarded casts in `storage.py:280-318`, duplicate `charset=utf-8` MIME bug (`server.py:326`), raw exception leak (`server.py:341`), duplicate `change` listener leak (`flight_deck.js:110`), external Google Fonts CDN (`index.html:26-28`) contradicting zero-egress claims, version drift (`2.5.0` vs `0.1.0`), Electron `--no-sandbox` + missing `sandbox: true` + detached orphan backend (`electron/main.cjs:8-10, 62-68, 88-91`), and major test gaps. |
| **L4** | **UI, Visual Craft & Triple-Viewport Proof** | **`5.0 / 10`** | `NEEDS FIX` | All 12 triple-viewport captures (`:8104` default/dark + Studio light/dark) pass `overflowPx: 0`, `errors: []`, and `imgsMissingAlt: 0`. However, `:8104` has **zero Light Mode support** (`standalone-default` and `standalone-dark` are pixel-identical `#08080B`, rendering a dark slab inside Studio's Editorial Ivory Light Mode), displays **conflicting versions in the header** (`v0.1.0` beside `v2.5 SOVEREIGN`), stacks duplicate coffee/open-access chrome consuming ~30% of mobile viewport height, and fails **`13 / 22` (59.1%)** `:8104` mobile `<44 px` tap targets (`1x`/`2x`/`4x` `31×24 px`, scrubber `324×10 px`, header CTA `127×32 px`) and **`31 / 74` (41.9%)** Studio mobile targets (`22×22 px` copy icons). Studio's `AgentFlightRecorderGodModeTool.jsx` Light Mode renders pitch-black `#06080E` / `#05060A` panels and low-contrast `#38BDF8` / `#D4AF37` text on white (~2.0:1). Brand banners (`public/assets/banner.png`, `og-flight-recorder.png`, `og-banner.jpg`) exhibit overlapping gauge art, tofu glyphs, residual `$19` / `FOUNDING LIFETIME` paywall copy, or unbranded AI art. |
| **L5** | **Readability, Copy, Docs & Accessibility** | **`4.8 / 10`** | `NEEDS FIX` | `toolsData.js:724` & `public/api/tools.json` misclassify the Python/SQLite daemon as `executionType: 'browser'` + `"webgpu"`, making Studio claim *"✓ Runs 100% in your browser — no local install or backend required"* right beside *"● Local Daemon Reachable (:8104)"*. `toolsDocumentation.js:1188` invents phantom MCP tool `flight_recorder_scrub` (no MCP implementation exists). `workstations.js:226` points to dead `/studio/agent-flight.html` (`HTTP 404`). `README.md:90,92` documents nonexistent `/api/events/stream` and `POST /api/export/bundle`. Host wrapper `:92` prints broken `agent-flight export <session_id>` (missing `--session`). `public/index.html:1000,1041` hides `<label for>` with `display:none` (stripping labels from the a11y tree); tutorial checkbox (`sovereign_tutorial.js:65`) lacks `aria-label`/`for`. Fabricated claims (`Valid Cryptographic Seal`, `ZERO DRIFT VERIFIED`, `Sub-Millisecond Diffs` / `AST transforms`) and attribution drift (`1nc0gn30 • NullAI` vs `Neal Frazier Tech (@1nc0gn30) • NullAI Platform`). |
| — | **Weighted Composite** | **`4.76 / 10`** | **`NEEDS FIX`** | **Remediate all P0/P1 findings in `v2` pass to drive all 5 levels to `>= 9.0 / 10`.** |

---

## 2. Test Roadmap & Execution Log

### 2.1 Level 1 — Server Boot, REST APIs, Security & Storage Probes

**On-Demand Boot Verification:**
- Command: `python3 ~/NullAITech/agent-flight-recorder/server.py --host 127.0.0.1 --port 8104 --db /tmp/afr-audit-008.db`
- Observed: PID `691089`, startup **`140 ms`**, RSS **`23,380 KB` (`23.4 MB`)**, VSZ `192,408 KB`.
- Listener verification (`ss -tlnp`): `127.0.0.1:8104` — strictly loopback-only (`0.0.0.0` not bound).
- Shutdown verification: Terminated temporary PID `691089` cleanly via `trap` (and terminated Studio auto-spawned on-demand PID `693420` after Studio capture); confirmed `:8104` idle, `:3000` (PID `530452`) untouched, `flight_recorder.db` SHA-256 identical (`9061045b8b75b751e93eeba9b99b0bcdaf7700214f72e1a0166b0bab3b73dcf9`), and `git status -sb` clean (`## main...origin/main`).

| Probe | Observed Result |
| :--- | :--- |
| `GET /`, `GET /robots.txt`, `GET /sitemap.xml` | `HTTP 200` (`37,898 B` HTML, `247 B` `text/plain`, `826 B` `application/xml` containing stale `#paywall` URL) |
| `GET /health`, `GET /api/health`, `HEAD /api/health` | `HTTP 200`, `application/json`, `90 B`: `{"status": "online", "service": "agent-flight-recorder", "port": 8104, "version": "0.1.0"}` (**stale version `0.1.0` & hardcoded port `8104`**) |
| `GET /api/stats` | `HTTP 200`, `application/json`, `140 B` (`total_sessions`, `total_events`, `total_recorded_duration_s`, `storage_size_bytes`, `storage_size_kb`) |
| `GET /api/sessions`, `?limit=abc`, `?limit=-1` | `HTTP 200`, `application/json` (ignores `?limit=` query parameter completely; hardcoded `limit=50`) |
| `GET /api/events` & `GET /api/events/stream` (README alias) | **`SOFT-200`** — both return `HTTP 200 text/html; charset=utf-8` (`37,898 B` `index.html` SPA fallback instead of JSON `404` or SSE stream) |
| `DELETE /api/stats`, `PUT /api/ingest` | `HTTP 501 Unsupported method` (HTML error page) |
| `POST /api/ingest` (valid payload, no `session_id`) | `HTTP 200 OK`: auto-created session `flt-c5a6e033bb` (`Live Ingestion`), returned `event_id: 1..5` |
| `POST /api/ingest` (`agent-capsule-jail` payload with `session_id: "capsule-jail-audit"`) | **`FAIL (P0 Orphan)`** — `HTTP 200 OK` (`event_id: 6`), stored in `/api/timeline/capsule-jail-audit`, **absent from `/api/sessions`**, `GET /api/session/capsule-jail-audit` → **`HTTP 404`** |
| `GET /api/export/bundle?session_id=capsule-jail-audit` | **`FAIL (P0 Crash)`** — `curl: (52) Empty reply from server` (`session` is `None`; `exporter.py:23` raises `AttributeError`) |
| `GET /api/scrub/<sid>?offset_ms=900` | `HTTP 200 OK` JSON (`events_count: 3`, `max_threat_score: 0.92`, `network_nodes: ["api.openai.com"]`) ✅ |
| `GET /api/scrub/<sid>?offset_ms=abc` | **`FAIL (P0 Crash)`** — `curl: (52) Empty reply from server` (unhandled `ValueError` at `server.py:149`) |
| `GET /api/scrub/<sid>?offset_ms=-1` | `HTTP 200 OK` (`events_count: 0`, `scrub_offset_ms: -1.0`) |
| `GET /api/briefing/<sid>` | `HTTP 200 OK` JSON (`briefing_text`, `target_voice: "Kokoro-TTS (:9394)"`, `event_stats`) ✅ |
| `GET /api/export/bundle?session_id=<sid>` (XSS payload check) | **`FAIL (P0 Stored XSS)`** — `HTTP 200 text/html`; line `213` of exported HTML contained verbatim unescaped `"override</script><script>window.__xss=1</script>"` inside `<script>` |
| `POST /api/export/bundle` (README documented method) | **`FAIL (Doc Drift)`** — `HTTP 404 Not Found` `{"error": "Endpoint not found: /api/export/bundle"}` |
| `POST /api/ingest` (`{not-json`) | **`FAIL (Validation)`** — `HTTP 200 OK` (`event_id: 7`), silently ingested empty `custom_event` instead of `400 Bad Request` |
| `POST /api/ingest` (`["array","not","dict"]`) | **`FAIL (P0 Crash)`** — `curl: (52) Empty reply from server` (`AttributeError: 'list' object has no attribute 'get'` at `server.py:270`) |
| `POST /api/ingest` (`2 MB` JSON body) | **`FAIL (Unbounded Body)`** — `HTTP 200 OK` (`event_id: 8`, no `Content-Length` max cap) |
| `GET /api/stream` (SSE) | `HTTP 200 text/event-stream`, emitted `event: connected` + `data: {"status": "monitoring", "port": 8104}` ✅ |
| `OPTIONS`/`GET`/`POST /api/ingest` (`Origin: http://127.0.0.1:3000`) | `OPTIONS 200`, `GET 200`, `POST 200`, `ACAO: http://127.0.0.1:3000`, **missing `Vary: Origin`** |
| `OPTIONS`/`GET`/`POST /api/ingest` (`Origin: https://example.invalid`) | `OPTIONS 200` (`ACAO: http://127.0.0.1`), `GET 200` (`ACAO: http://127.0.0.1`), **`POST 403 Forbidden`** `{"error": "cross-origin request blocked"}` ✅ |
| `OPTIONS`/`GET`/`POST /api/ingest` (`Origin: http://127.0.0.1:8104.example.invalid`) | **`FAIL (P0 Origin Guard Bypass)`** — `OPTIONS 200`, `GET 200`, **`POST 200 OK`**, echoing **`Access-Control-Allow-Origin: http://127.0.0.1:8104.example.invalid`**! |
| `GET /api/stats` & `POST /api/ingest` (`Host: evil.example:8104`, no `Origin`) | **`FAIL (DNS Rebinding)`** — both return **`HTTP 200 OK`** (zero `Host` header validation) |
| `GET --path-as-is` `/../server.py`, `/%2e%2e/server.py`, `/..%2fserver.py`, `/%2e%2e%2fpyproject.toml` | No source leaked, but all 4 return **`HTTP 200 text/html`** (`37,898 B` `index.html` SPA fallback) instead of `403`/`404` |
| Studio routes (`:3000`) | `GET /tools/agent-flight-recorder` → `HTTP 200` (`20,265 B`); `GET /workstations/agent-flight-recorder` → `HTTP 200` (`19,344 B`); `GET /studio/agent-flight.html` → **`HTTP 404`** (`9 B`) |

### 2.2 Level 1 — CLI, TUI, Systemd & ZothOS Chroot Parity

| Surface / Command | Observed Result |
| :--- | :--- |
| `agent-flight-recorder` (`4,663 B`, sha256 `86caf86e...`) | Identical across `/usr/local/bin/agent-flight-recorder`, `~/.local/bin/agent-flight-recorder`, `/usr/local/bin/zoth-flight-recorder`, and `~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin/agent-flight-recorder`. `agent-flight` symlinks to it in all 3 locations (chroot `zoth-flight-recorder` symlinks to `agent-flight`). Wrapper hardcodes `REPO_DIR = ~/NullAITech/agent-flight-recorder` (fails in ZothOS ISO where repo is in `/opt/agent-flight-recorder`) and prints wrong syntax `agent-flight export <session_id>` (missing `--session`). |
| `agent-flight-recorder --version`, `--help`, `--status`, `--json` | All exit `0` (`v2.5.0`); `--json` probes `127.0.0.1:8104/health` and emits valid JSON (`daemon_live: false` when idle). |
| `agent-flight-recorder bogus-cmd` vs `~/NullAITech/agent-flight-recorder/bin/agent-flight bogus-cmd` | Host wrapper exits **`0`** (silently ignores unknown args via `parse_known_args` + `payload nargs='*'`); repo `bin/agent-flight` (`310 B`, sha256 `de038e5b...`) properly exits **`2`** (`invalid choice`). |
| `~/NullAITech/agent-flight-recorder/bin/agent-flight status --db /tmp/afr-cli-probe.db --json` | Exits `0`, emits real SQLite stats JSON (`service: "agent-flight-recorder"`, `version: "2.5.0"`, `online: false`, `stats`, `recent_sessions`). |
| `agent-flight-recorder-tui --json` | Exits `0`, emits **synthetic boilerplate** (`math.sin()` braille wave, `"audio_lufs": -14.0`, `"slug": "canvasui-html-effects"`, `"benchmark_ms": 0.446`). **Parity drift**: host/chroot copy (`3,827 B`, sha256 `36b925c5...`) differs from repo `bin/agent-flight-recorder-tui` (`3,724 B`, sha256 `1c0f1d78...`, missing `--status` & `parse_known_args`). |
| `~/NullAITech/zoth-os/config/includes.chroot/etc/systemd/system/agent-flight-recorder.service` | Uses `Type=simple`, `User=zoth`, `KillMode=process`, `ExecStart=/usr/local/bin/zoth-run-repo agent-flight-recorder /opt/zothos-ai-env/bin/python3 -m agent_flight_recorder.cli serve --host 127.0.0.1 --port 8104`. **Zero systemd hardening directives** (`NoNewPrivileges`, `ProtectSystem`, `PrivateTmp`, `RestrictAddressFamilies`, `MemoryMax` all absent). |
| `diff -rq` repo vs chroot `/opt/agent-flight-recorder` | **Drifted**: chroot is missing `electron/` and `bin/agent-flight-recorder-tui`; `.gitignore`, `package.json`, `assets/hero-banner.svg`, `prompts/motion_graphics_showreel.md` differ; repo `public/assets/` totals **`45 MB`** (`85` files), of which **`42 MB`** (`73` files) are unused `gpu-*` artifacts. |
| `git remote -v` & `public/api/*` | Only `origin` (`https://github.com/1nc0gn30/agent-flight-recorder.git`), **no `NullAITech` remote**. Static `public/api/{health,stats,status}` files serve fabricated metrics (`"frames_recorded": 24610, "merkle_root_verified": true`) when hosted via `serve:public` or Netlify. |

### 2.3 Level 2 — Interactive CDP Workflow Verification

Executed via headless Chrome CDP (`/tmp/whiteboard-audit-008/cdp_probe.mjs`, saved to `/tmp/whiteboard-audit-008/cdp_probe_results.json`):

| Scenario | Observed DOM & Network Result |
| :--- | :--- |
| Load `http://127.0.0.1:8104/` (Desktop `1440×900`) | Immediate active cockpit (`tutorialVisible: false`, `overflowPx: -15` [<=0], `errors: []`, `h1Count: 1`). Hydrated live session `flt-c5a6e033bb • Live Ingestion (0s)` with `9` events (`capsule-jail-audit` completely absent from dropdown). |
| Scrub `#timelineScrubber` to max (`2643.46 ms`) | `timeDisplay` updated to `00:02.643 / 00:02.643`; `#terminalOutput` rendered `[AUDIT] Booting sovereign agent telemetry stream <img src=x onerror=alert(1)>` safely escaped (`xssInjectedImg: 0`); `#networkNodesList` rendered `api.openai.com`; `#engramsList` rendered `engram-audit-008: Verified capsule audit trail`; `#gaugeThreatVal` updated to `0.92`; `#statTokensSaved` updated to `75`. |
| Step `-250ms` / `+250ms` & Play/Pause at max offset | `-250ms` stepped `00:02.643` → `00:02.393`; `+250ms` stepped back to `00:02.643`. Clicking `#btnPlayPause` while at `maxOffset` immediately hit `>= maxOffset` on first tick (`playingLabel: "▶ Play"`), failing to rewind to `0`. |
| Mobile `390×844` tap-target audit (`:8104`) | `overflowPx: 0`, **`13 / 22` (59.1%)** interactive controls `<44 px` (`1x`/`2x`/`4x` `31×24 px`, `#timelineScrubber` `324×10 px`, `#btnHeaderUpgrade` `127×32 px`, coffee bar links `26–28 px`, footer links `17–41 px`). |
| Navigate to `http://127.0.0.1:3000/tools/agent-flight-recorder?theme=light` | Rendered `Live Local App (:8104)` iframe (`1100×718`) inside Editorial Ivory page while simultaneously claiming `✓ Runs 100% in your browser — no local install or backend required` (`hasInBrowserClaim: true`, `hasLiveDaemonClaim: true`). Mobile tap-target audit: **`31 / 74` (41.9%)** `<44 px` (`22×22 px` copy icons, `26 px` footer links). |
| Click `Studio God-Mode Deck` on `/tools/agent-flight-recorder` (Light & Dark) | Mounted `AgentFlightRecorderGodModeTool.jsx` with **zero `:8104` API calls**, hardcoded `INITIAL_STEPS` (`hasHardcodedZothConductor: true`, `hasHardcodedHermesAgent: true`, `hasChainHead: true`, `hasZeroDriftClaim: true`), pitch-black `#06080E` canvas box on Light Mode, and low-contrast `#38BDF8` / `#D4AF37` text on white. |
| Navigate to `http://127.0.0.1:3000/workstations/agent-flight-recorder?theme=light` | `overflowPx: 0`, `errors: []`, rendered `:8104` iframe (`http://127.0.0.1:8104/`) and contradictory `IN-BROWSER` + `LIVE LOCAL :8104` badges. |

### 2.4 Level 3 — Automated Test Baseline (`pytest`)

- Command: `cd ~/NullAITech/agent-flight-recorder && PYTHONPATH=src python3 -m pytest -v tests`
- Result: **`23 passed in 1.53s`** (exit `0`):
  - `test_bind_host.py` (`3/3`), `test_flight_recorder.py` (`9/9`), `test_origin_guard.py` (`2/2`), `test_static_traversal.py` (`9/9`).
- **Observed Test Gaps:**
  - `test_origin_guard.py` never tests malformed port suffix (`http://127.0.0.1:8104.example.invalid`), `OPTIONS` preflight, or `Host` header validation.
  - `test_flight_recorder.py` never tests `POST /api/ingest` (valid, explicit `session_id` auto-create, malformed JSON, non-dict JSON, oversized body), `GET /api/scrub/<id>?offset_ms=abc`, `GET /api/export/bundle` with missing session or `</script>` XSS payload, or CLI commands (`cli.py`).
  - `test_static_traversal.py` only unit-tests `_safe_rel()`, never asserting HTTP `403`/`404` on `FlightDeckRequestHandler`.
  - `test_flight_recorder.py:161` explicitly asserts hardcoded `data["port"] == 8104` even though the test server runs on port `8194`!

### 2.5 Level 4 — Screenshot & Visual Asset Evidence (All 19 Images Inspected via `read_file`)

| Surface & Mode | Mobile (`390×844`) | Tablet (`820×1180`) | Desktop (`1440×900`) | Observed Metrics & Visual Findings |
| :--- | :--- | :--- | :--- | :--- |
| `:8104` Default (`capture.mjs`) | `/tmp/whiteboard-audit-008/standalone-default/home_mobile.jpg` | `/tmp/whiteboard-audit-008/standalone-default/home_tablet.jpg` | `/tmp/whiteboard-audit-008/standalone-default/home_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 22`. **No Light Mode** (`#08080B`), conflicting `v0.1.0` subtitle beside `v2.5 SOVEREIGN`, duplicate coffee/open-access bar + header eating ~30% of mobile screen (cockpit pushed below fold), **`13 / 22` (59.1%)** mobile `<44 px` tap targets. |
| `:8104` Dark (`--dark`) | `/tmp/whiteboard-audit-008/standalone-dark/home_mobile.jpg` | `/tmp/whiteboard-audit-008/standalone-dark/home_tablet.jpg` | `/tmp/whiteboard-audit-008/standalone-dark/home_desktop.jpg` | Pixel-identical to default (`overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`) — proves zero Light Mode / dual-theme CSS tokens. |
| `:8104` Scrubbed Desktop (CDP) | — | — | `/tmp/whiteboard-audit-008/standalone_scrubbed_desktop.jpg` | Confirmed scrubber needle advanced to right edge (`00:02.643 / 00:02.643`) on live ingested session `flt-c5a6e033bb`. |
| Studio `/tools/agent-flight-recorder` Light | `/tmp/whiteboard-audit-008/studio-light/tools_agent-flight-recorder_mobile.jpg` | `/tmp/whiteboard-audit-008/studio-light/tools_agent-flight-recorder_tablet.jpg` | `/tmp/whiteboard-audit-008/studio-light/tools_agent-flight-recorder_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`, `buttons: 113`. Contradictory `IN-BROWSER` + `LIVE LOCAL :8104` chips; tablet renders pitch-black `:8104` iframe with duplicate coffee bar + header inside Editorial Ivory Light Mode; **`31 / 74` (41.9%)** mobile `<44 px` targets. |
| Studio `/tools/agent-flight-recorder` Dark | `/tmp/whiteboard-audit-008/studio-dark/tools_agent-flight-recorder_mobile.jpg` | `/tmp/whiteboard-audit-008/studio-dark/tools_agent-flight-recorder_tablet.jpg` | `/tmp/whiteboard-audit-008/studio-dark/tools_agent-flight-recorder_desktop.jpg` | `overflowPx: 0`, `errors: []`, `imgsMissingAlt: 0`. Dark outer chrome blends better, but iframe repeats coffee bar + standalone header with `v0.1.0` vs `v2.5 SOVEREIGN` clash. |
| Studio God-Mode Deck (CDP Light & Dark) | — | — | `/tmp/whiteboard-audit-008/studio_godmode_light.jpg`, `/tmp/whiteboard-audit-008/studio_godmode_dark.jpg` | Hardcoded mock (`zoth-conductor`, `hermes-agent`, `CHAIN HEAD: 0x9601903846739002`); Light Mode shows pitch-black CRT & Merkle Topology panels and low-contrast `#38BDF8` / `#D4AF37` text on white (~2.0:1). |
| Repo Brand Assets (`read_file`) | `public/assets/banner.png`, `public/assets/og-flight-recorder.png`, `public/og-banner.jpg`, `public/assets/icon.png` | — | — | `banner.png`: octagonal black box overlaps subtitle & covers a **`STRIPE + SOLANA ($19)`** pill, tofu glyphs `□`, harsh white grid lines. `og-flight-recorder.png`: residual **`FOUNDING LIFETIME: 9 □ DUAL STRIPE + SOLANA`**. `og-banner.jpg`: unbranded AI golden compass art. `icon.png`: crisp octagonal oscilloscope dial ✅. |

---

## 3. 5-Level Deep Findings (`file:line`)

### Level 1 — System, APIs, SQLite Storage, Security, CLI & Chroot
1. **`[P0]` Origin Guard Port-Suffix Bypass & Missing `Vary: Origin` / `Host` Validation (`src/agent_flight_recorder/server.py:34-50, 67-80, 251-260`)**
   - `_is_local_origin()` checks only `u.scheme in ("http", "https") and u.hostname in ("localhost", "127.0.0.1", "::1")`. For `Origin: http://127.0.0.1:8104.example.invalid`, Python's `urlparse().hostname` returns `"127.0.0.1"` without validating `u.port` (which raises `ValueError` if accessed!). Live probe confirmed `OPTIONS`, `GET /api/stats`, and **`POST /api/ingest`** all returned **`HTTP 200 OK`** and reflected `Access-Control-Allow-Origin: http://127.0.0.1:8104.example.invalid`.
   - `_set_headers()` omits `Vary: Origin`, `do_OPTIONS()` returns `200` even for untrusted origins (should return `204` for allowed / `403` for rejected), and no `Host` header allowlist exists (`Host: evil.example:8104` succeeded `200 OK` on `GET` & `POST`, enabling DNS rebinding).
2. **`[P0]` Cross-Daemon Ingestion Orphan & Bundle Export Crash (`src/agent_flight_recorder/server.py:207-216, 270-294`, `src/agent_flight_recorder/storage.py:56-98, 118-160`)**
   - When `agent-capsule-jail` (`:8105`) forwards telemetry to `POST /api/ingest` with `"session_id": "capsule-jail-audit"`, `server.py:271` skips `create_session()` because `sid` is truthy. Because `storage.py` never enables `PRAGMA foreign_keys = ON`, `append_event()` silently inserts an orphaned `timeline_events` row whose `session_id` does not exist in `sessions`.
   - Consequently, `GET /api/sessions` hides all `capsule-jail-audit` telemetry, `GET /api/session/capsule-jail-audit` returns `404`, and `GET /api/export/bundle?session_id=capsule-jail-audit` crashes with `AttributeError` (`curl: (52)`) because `server.py:207` passes `session=None` to `generate_single_file_html()`.
   - Additionally, `server.py:213` interpolates raw `sid` into `Content-Disposition: attachment; filename="flight-incident-{sid}.html"` without sanitizing quotes/newlines.
3. **`[P0]` Stored XSS in Offline HTML Incident Bundle Exporter (`src/agent_flight_recorder/exporter.py:14-24, 150, 184-185`, `public/flight_deck.js:431, 442-443`)**
   - `exporter.py:15-16, 184-185` embeds raw `json.dumps(session_data)` and `json.dumps(timeline_events)` directly inside `<script>` without escaping `<` / `</script>` (`\u003c`). Verified live: ingesting `override</script><script>window.__xss=1</script>` emitted the exact script-breakout sequence at line `213` of the exported HTML file.
   - `exporter.py:23, 150` and `flight_deck.js:431, 442-443` also interpolate `session_id` and `command` into `<title>` and `<div>` without HTML-escaping.
4. **`[P0]` Unhandled Request Crashes & Unbounded Ingestion Payload (`src/agent_flight_recorder/server.py:148-150, 263-271`)**
   - `offset_ms = float(offset_str)` (`:149`) crashes the handler (`curl: (52)`) on `?offset_ms=abc`.
   - `content_len = int(self.headers.get("Content-Length", 0))` (`:263`) has no max payload cap (`2 MB` body accepted `200 OK`) and no negative/NaN guard; invalid JSON `{not-json` silently falls back to `{}` and ingests an empty event (`200 OK`); non-dict JSON `["array"]` crashes `data.get(...)` (`curl: (52)`).
5. **`[P1]` SQLite Concurrency, Foreign Keys & Missing Cryptographic Tamper Integrity (`src/agent_flight_recorder/storage.py:56-98, 118-160`)**
   - Missing `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=NORMAL`, `PRAGMA foreign_keys=ON`, and `PRAGMA busy_timeout=5000`.
   - Despite UI/marketing claims of `"Valid Cryptographic Seal"` (`flight_deck.js:445`) and `"merkle_root_verified": true` (`public/api/stats`), `storage.py` stores **zero SHA-256 hash chain** (`prev_hash` / `event_hash`) and provides no `/api/verify/<session_id>` integrity endpoint.
6. **`[P1]` Static Path Containment, Soft-200 API Fallbacks & Missing Export Formats (`src/agent_flight_recorder/server.py:112-119, 194-249, 309-346`)**
   - Traversal probes (`--path-as-is /../server.py`, `/%2e%2e/server.py`) return `200 text/html` (`index.html` fallback) instead of `403`/`404`, and line `315` uses `os.path.abspath(file_path).startswith(os.path.abspath(self.public_dir))` instead of `Path.is_relative_to()`.
   - Unknown `/api/*` GET paths (`/api/events`, README-documented `/api/events/stream`) fall through to `index.html` (`200 text/html`) instead of returning `404 application/json`.
   - `GET /api/sessions` ignores `?limit=`; `POST /api/export/bundle` returns `404` despite `README.md:92`; no JSON/CSV/Markdown export endpoints exist (with CSV formula-injection neutralization `= + - @`).
   - `server.py:95` hardcodes `"port": 8104` and `"version": "0.1.0"`.
7. **`[P1]` CLI Wrapper, Boilerplate TUI, Systemd Hardening, Chroot & Asset Bloat**
   - `/usr/local/bin/agent-flight-recorder:11,43,92` hardcodes `~/NullAITech/agent-flight-recorder`, silently exits `0` on unknown commands (`bogus-cmd`), and prints broken export syntax (`agent-flight export <session_id>`).
   - `bin/agent-flight-recorder-tui` & `/usr/local/bin/agent-flight-recorder-tui` are `math.sin()` / `-14.0 LUFS` / `canvasui-html-effects` boilerplate with hash drift (`1c0f1d78...` vs `36b925c5...`).
   - `~/NullAITech/zoth-os/config/includes.chroot/etc/systemd/system/agent-flight-recorder.service` lacks `NoNewPrivileges=true`, `ProtectSystem=strict`, `PrivateTmp=true`, `RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX`, `ReadWritePaths=`.
   - Chroot `/opt/agent-flight-recorder` is missing `electron/` and `bin/agent-flight-recorder-tui`; `public/assets/` carries `42 MB` of `73` unused `gpu-*` files; `public/api/{health,stats,status}` emit fake static metrics; `public/sitemap.xml:22` still contains `#paywall`; missing `NullAITech` remote.

### Level 2 — User & Live Telemetry Forensics Workflow
1. **`[P0]` Studio God-Mode Deck Is 100% Disconnected Mock (`~/NullAITech/zoth-studio-v2/src/components/tools/AgentFlightRecorderGodModeTool.jsx:24-95, 176-434`)**
   - Zero `fetch()` calls to `http://127.0.0.1:8104`; displays 4 hardcoded fake steps (`zoth-conductor`, `hermes-agent`, `egress-sentinel`, `ui-verifier`) with non-cryptographic 64-bit `fnv1aHex` hashes mislabeled `"CRYPTOGRAPHIC MERKLE CHAIN TOPOLOGY"` and `"ZERO DRIFT VERIFIED"`. Meanwhile `EnclaveToolsSuite.jsx:1736` (`AgentFlightRecorderTool`) is orphaned/never imported.
2. **`[P1]` Standalone Cockpit Missing Live SSE, Raw Event Inspector, Search/Filter & Real Exports (`public/flight_deck.js:73-252, 267-294, 418-461`)**
   - Never connects to `EventSource('/api/stream')` — newly ingested events do not appear live until full page reload.
   - Hardcodes `const isLocalDaemon = (window.location.port === "8104")` (`:73`), breaking live API calls on any alternate `--port`.
   - Silently substitutes `DEMO_EVENTS` when a real session has `0` events (`:132-135`).
   - Only renders 4 event subsets (`terminal_*`, `network_egress`, `synaptic_engram`, `prompt_scan`/`mock_replay`); completely hides `capsule_execution`, `file_mutation`, `system_metric`, `marker`, and custom events, with zero search/severity filter.
   - `startPlayback()` (`:267-284`) does not rewind to `0` when `currentOffsetMs >= maxOffsetMs`, leaving Play non-functional at end-of-tape.
   - Client-side `downloadOfflineBundle()` (`:418-461`) only dumps `<pre>` JSON (not an interactive replay viewer like `exporter.py`), stamps fake `"Valid Cryptographic Seal"` (`:445`), and has no JSON/CSV/Markdown export options.

### Level 3 — Engineer & Code Quality
1. **`[P0]` Unescaped HTML/JS Sinks & Broken Asset Links (`public/assets/sovereign-upgrade.js:177-240`)**
   - Interpolates `p.name`, `p.expected_metric`, `p.description`, `p.payload` directly into `innerHTML` without escaping (`:231-240`).
   - References nonexistent asset filenames (`gpu-vertical-ad-9x16.mp4` vs actual `gpu-ad-vertical-9x16.mp4`, `gpu-ltx-neural.webp`, `gpu-hero-4k.jpg`, `gpu-hero.jpg`).
   - Race condition: `public/sovereign_tutorial.js:22-23` explicitly removes `#zoth-sovereign-a100-bar` created by `sovereign-upgrade.js`.
2. **`[P1]` Backend Bugs & Hardcoded Simulation (`src/agent_flight_recorder/recorder.py:26,41-47,66`, `storage.py:280-318`, `server.py:326,341`)**
   - `recorder.py:66` records a fake constant `"cpu_percent": 1.2` instead of measuring real child CPU deltas (`os.wait4` / `/proc/<pid>/stat` / `RUSAGE_CHILDREN`).
   - `recorder.py:26` uses invalid Python type hint `cmd: List[str] or str` (should be `Union[List[str], str]`).
   - `recorder.py:41-47` unconditionally injects `OPENAI_BASE_URL=:8099` and `HTTP_PROXY=:8096` even when those proxies are offline, breaking child commands that make network calls unless overridden.
   - `storage.py:280-318` calls `p.get(...)`, `float(...)`, and `int(...)` without guarding non-dict payloads or non-numeric strings.
   - `server.py:326` doubles `; charset=utf-8; charset=utf-8` on unknown MIME types; `:341` leaks raw `str(e)` in `500` responses.
3. **`[P1]` Frontend CSS Syntax Error, Listener Leak, External Fonts & Electron Sandbox (`public/index.html:26-28, 699-705`, `public/flight_deck.js:110`, `electron/main.cjs:8-10, 62-68, 88-91`)**
   - `public/index.html:699-705` has a broken CSS block (`.lock-overlay { display: none !important; } align-items: center; justify-content: center; z-index: 20; }`) plus dead paywall CSS (`.sales-banner`, `.urgency-pill`, `.price-strike`, `.frosted-locked`, `.lock-card`, `.modal-*`).
   - `public/index.html:26-28` loads external Google Fonts CDN (`fonts.googleapis.com`), contradicting local zero-egress claims.
   - `flight_deck.js:110-112` attaches a new `change` event listener on `#sessionSelect` every time `populateSessionSelect()` runs.
   - `electron/main.cjs:8-10, 88-91` disables Chromium sandboxing (`no-sandbox`, `disable-gpu-sandbox`, missing `sandbox: true`) and spawns a detached backend (`detached: true`, `unref()`) that is never terminated on app exit (orphan daemon leak).

### Level 4 — UI, Visual Craft & Triple-Viewport Proof
1. **`[P1]` Zero Light Mode / Dual-Theme Parity on `:8104` & Broken Light Mode Contrast on Studio God-Mode Deck**
   - `public/index.html` hardcodes dark obsidian tokens (`--bg: #08080B`) with zero `@media (prefers-color-scheme: light)` or `?theme=light` / toggle support, creating a stark black box inside Studio's Editorial Ivory Light Mode iframe (`studio-light/tools_agent-flight-recorder_tablet.jpg`).
   - `AgentFlightRecorderGodModeTool.jsx:183-429` renders dark `#06080E` / `#05060A` panels on Light Mode and pairs `#38BDF8` cyan and `#D4AF37` gold text on `#FFFFFF`/`#F8FAFC` (~2.0:1 contrast ratio — fails WCAG AA 4.5:1).
2. **`[P1]` Mobile Tap Targets (`59.1%` Fail on `:8104`, `41.9%` Fail on Studio) & Header Chrome Bloat**
   - Standalone mobile (`390×844`): `13 / 22` controls are `<44 px` (`1x`/`2x`/`4x` `31×24 px`, `#timelineScrubber` `324×10 px`, `#btnHeaderUpgrade` `127×32 px` due to `@media (max-width: 480px) { .header-actions .btn { min-height: 32px; } }` at `public/index.html:884-888`, coffee bar links `26–28 px`).
   - Duplicate open-access/coffee chrome (`#zoth-coffee-support-bar` + `<header>` badges + CTA) eats ~30% of mobile height, pushing the Flight Deck cockpit completely below the fold; header simultaneously displays `v0.1.0` and `v2.5 SOVEREIGN`.
   - Studio mobile (`390×844`): `31 / 74` controls `<44 px` (`22×22 px` copy icons, `26 px` footer links).
3. **`[P1]` Defective Brand & OG Social Banners (`public/assets/banner.png`, `public/assets/og-flight-recorder.png`, `public/og-banner.jpg`)**
   - `public/assets/banner.png` (`og:image` & `twitter:image`): octagonal dial overlaps subtitle text and hides a **`STRIPE + SOLANA ($19)`** pill, contains missing-font tofu boxes `□`, and overlays harsh white grid lines across copy.
   - `public/assets/og-flight-recorder.png` advertises **`FOUNDING LIFETIME: 9 □ DUAL STRIPE + SOLANA`**.
   - `public/og-banner.jpg` is an unbranded generic golden astrolabe image.

### Level 5 — Readability, Copy, Docs & Accessibility
1. **`[P0]` Misleading `executionType: 'browser'` & Phantom MCP Tool (`~/NullAITech/zoth-studio-v2/src/data/toolsData.js:724`, `public/api/tools.json`, `toolsDocumentation.js:1188`, `workstations.js:226`)**
   - `toolsData.js:724` and `public/api/tools.json` declare `executionType: 'browser'` and `runtimes: ["browser", "webgpu", "cli", "zero-egress"]`, causing Studio to show *"✓ Runs 100% in your browser — no local install or backend required"* right next to *"● Local Daemon Reachable (:8104)"*. Should be `executionType: 'local-daemon'` with accurate `runtimes: ['local-daemon', 'cli', 'mcp']` once MCP stdio server is implemented.
   - `toolsDocumentation.js:1188` documents phantom MCP tool `flight_recorder_scrub` — zero MCP server or tool handler exists in `agent-flight-recorder`.
   - `workstations.js:226` points `path` to `/studio/agent-flight.html`, which returns **`HTTP 404`** (`9 B`); should point to `/tools/agent-flight-recorder` (matching `agent-capsule-jail` at line `237`).
2. **`[P1]` README, CLI Help, Accessibility & Attribution Drift**
   - `README.md:90, 92` documents `/api/events/stream` (falls through to HTML `200`) and `POST /api/export/bundle` (`404`); `assets/hero-banner.svg:45` says `Mode: BROWSER`.
   - `public/index.html:1000, 1041` applies `style="display:none;"` on `.sr-only` `<label for>` elements, removing them from the accessibility tree; `sovereign_tutorial.js:65` checkbox lacks `aria-label` / explicit `<label for>`.
   - Inflated/unverified claims (`Valid Cryptographic Seal`, `ZERO DRIFT VERIFIED`, `Sub-Millisecond Diffs` / `AST transforms`) and stale attribution (`1nc0gn30 • NullAI` in `package.json`, `pyproject.toml`, `README.md`, `index.html:1159`, `assets/hero-banner.svg:54` instead of `Neal Frazier Tech (@1nc0gn30) • NullAI Platform`).

---

## 4. Prioritized Fix Backlog (`P0` / `P1` / `P2`)

### P0 — Critical Security, Data Integrity & Functional Correctness
- **P0-1 (`src/agent_flight_recorder/server.py`)**: Harden `_is_local_origin()` to validate `u.port` (`try: _ = u.port except ValueError: return False`), emit `Vary: Origin`, return `204`/`403` on `OPTIONS`, enforce `Host` header allowlist (`127.0.0.1`, `localhost`, `[::1]`) against DNS rebinding, and reject unknown `/api/*` GETs with `404 application/json`.
- **P0-2 (`src/agent_flight_recorder/server.py`, `storage.py`)**: Auto-create missing `sessions` row on `POST /api/ingest` when an explicit `session_id` (such as `capsule-jail-audit`) does not yet exist; enable SQLite `PRAGMA journal_mode=WAL`, `PRAGMA foreign_keys=ON`, `PRAGMA busy_timeout=5000`; return `404` JSON cleanly if `/api/export/bundle` references an unknown session; sanitize `Content-Disposition` filename.
- **P0-3 (`src/agent_flight_recorder/server.py`)**: Guard query params (`offset_ms`, `limit`), enforce `MAX_BODY_BYTES` (e.g., `1 MiB` -> `413 Payload Too Large`), reject invalid or non-dict JSON with `400 Bad Request`, fix `Path.is_relative_to()` static containment returning `403` on traversal probes, and implement `GET /api/events`, `GET /api/events/stream` alias, and `POST /api/export/bundle` + JSON/CSV/Markdown export endpoints (with CSV formula-prefix escaping).
- **P0-4 (`src/agent_flight_recorder/exporter.py`, `public/flight_deck.js`)**: Escape `<` as `\u003c` (and `>` / `&` / `\u2028` / `\u2029`) in `<script>` JSON payloads and HTML-escape `session_id`, `title`, and `command` in both `exporter.py` and `flight_deck.js` offline bundle exports; replace fake `"Valid Cryptographic Seal"` with real SHA-256 hash-chain (`prev_hash` / `event_hash`) stored in SQLite and verified via `GET /api/verify/<session_id>`.
- **P0-5 (`~/NullAITech/zoth-studio-v2/src/components/tools/AgentFlightRecorderGodModeTool.jsx`, `toolsData.js`, `workstations.js`, `toolsDocumentation.js`, `public/api/tools.json`)**: Wire `AgentFlightRecorderGodModeTool.jsx` live to `http://127.0.0.1:8104` (sessions, timeline, scrub, ingest, verify hash chain, export) with honest offline state (removing fake `INITIAL_STEPS` / `fnv1aHex` mock); remove dead `AgentFlightRecorderTool` in `EnclaveToolsSuite.jsx`; update `executionType: 'local-daemon'`, fix `workstations.js:226` `path` to `/tools/agent-flight-recorder`, and implement real stdio JSON-RPC 2.0 MCP server (`agent-flight mcp`) backing `flight_recorder_scrub` (plus `flight_recorder_sessions`, `flight_recorder_ingest`, `flight_recorder_verify`).

### P1 — UX, Dual-Theme UI, CLI/Chroot Parity & Guardrail Hygiene
- **P1-1 (`public/index.html`, `public/flight_deck.js`, `public/wave.css`)**: Add full Light/Dark dual-theme support (`?theme=light|dark`, `prefers-color-scheme`, toggle, `?embed=1` compact Studio iframe chrome), collapse duplicate coffee/header bars into one clean header with unified `v2.6.0` version, fix all mobile `<44 px` tap targets (`1x`/`2x`/`4x`, scrubber hit area, buttons, links), remove broken `.lock-overlay` CSS + Google Fonts external CDN (use local/system font stack), and remove `sovereign-upgrade.js` / `42 MB` of `73` unused `gpu-*` assets + fake `public/api/*` files + `#paywall` from `sitemap.xml`.
- **P1-2 (`public/flight_deck.js`)**: Remove hardcoded `port === "8104"` check (probe `/api/health` on `window.location.origin`), subscribe to `/api/stream` SSE for live updates, add raw timeline event inspector with type/severity filter & text search (showing `capsule_execution`, `file_mutation`, `system_metric`), fix Play-from-end rewind, remove duplicate `#sessionSelect` listener leak, and add real JSON/CSV/Markdown/HTML export buttons.
- **P1-3 (CLI, TUI, Systemd, Chroot & Electron)**: Replace boilerplate `agent-flight-recorder-tui` with real SQLite + `:8104` telemetry TUI; fix `/usr/local/bin/agent-flight-recorder` (reject unknown subcommands with exit `2`, auto-detect `/opt/agent-flight-recorder` vs `~/NullAITech/agent-flight-recorder`, fix `export --session` help text); sync host `/usr/local/bin`, `~/.local/bin`, and `zoth-os` chroot (`/usr/local/bin` + `/opt/agent-flight-recorder`); harden `agent-flight-recorder.service`; fix `electron/main.cjs` (`sandbox: true`, clean child shutdown on quit).
- **P1-4 (Brand Assets & Attribution)**: Regenerate clean `public/assets/banner.png` (`og:image`), remove stale `og-flight-recorder.png` (`FOUNDING LIFETIME: 9`) and unbranded `og-banner.jpg`, align version to `2.6.0` across `package.json`, `pyproject.toml`, `/health`, CLI, and Studio, add `NullAITech` git remote, and unify attribution to `Neal Frazier Tech (@1nc0gn30) • NullAI Platform`.

### P2 — Engineering Polish & Test Coverage
- **P2-1 (`src/agent_flight_recorder/recorder.py`, `storage.py`)**: Measure real child CPU/RSS metrics instead of hardcoded `cpu_percent: 1.2`; make proxy env injection opt-in (`--with-proxy`); fix `Union[List[str], str]` annotation; guard non-dict/non-numeric payload fields in `get_session_forensics()`; fix `server.py:326` double `charset=utf-8` & `:341` raw exception leak.
- **P2-2 (`tests/`)**: Expand `pytest` suite to cover Origin port-suffix bypass, `Vary: Origin`, `Host` validation, traversal `403`, `capsule-jail-audit` auto-session creation, SHA-256 hash-chain verification + tamper detection, exporter XSS escaping, CSV injection escaping, malformed JSON/query handling, oversized body `413`, and MCP stdio tools.

---

## 5. AGY Perspective (Feedback / Enhancements / Appreciation)

- **Appreciation:** The core Python standard-library architecture (`storage.py`, `recorder.py`, `ingestion.py`, `exporter.py`, `server.py`, `cli.py`) is genuinely zero-dependency, boots in **`140 ms`** with **`23.4 MB` RSS**, uses parameterized SQL queries throughout, and delivers working millisecond time-scrubbing plus an interactive offline HTML replay viewer (`exporter.py`). The `public/assets/icon.png` octagonal oscilloscope dial is crisp and distinctive, and `flight_deck.js` properly escapes live DOM output (`xssInjectedImg: 0`).
- **Constructive Feedback:** The biggest gap between architectural intent and live reality is the **trust & integration seam**: (1) `agent-capsule-jail` (`:8105`) is already wired to forward real runs to `:8104/api/ingest`, yet those events are silently orphaned in SQLite and crash `/api/export/bundle`; (2) the exported offline HTML bundle has a textbook `</script>` breakout XSS vulnerability; and (3) Studio's `AgentFlightRecorderGodModeTool.jsx` showcases a fabricated FNV-1a "Merkle DAG" instead of connecting to the real `:8104` flight recorder sitting right beside it.
- **High-Leverage Enhancements for `v2`:** Adding a real SHA-256 append-only hash chain (`prev_hash` → `event_hash`) in `storage.py` with a `/api/verify/<session_id>` tamper check and exposing it over both REST and a real `agent-flight mcp` stdio server will turn the current marketing copy into provable cryptographic forensics—and make `agent-capsule-jail` → `agent-flight-recorder` → Zoth Studio a genuinely unified, end-to-end verifiable enclave audit pipeline.


---

## 6. v2 Remediation & Re-Audit Verification (`v2.6.0`)

- **Remediation Start (EST / UTC):** `2026-11-26 00:28:39 EST` / `2026-11-26 05:28:39 UTC`
- **Remediation Completion (EST / UTC):** `2026-11-26 00:45:39 EST` / `2026-11-26 05:45:39 UTC`
- **Unified Release Version:** `v2.6.0` across `package.json`, `pyproject.toml`, `src/agent_flight_recorder/__init__.py`, `server.py` (`/health` & `/api/health`), `cli.py`, CLI wrapper, live TUI, `public/index.html`, `public/assets/banner.png`, `~/NullAITech/zoth-studio-v2/src/data/toolsData.js`, and `~/NullAITech/zoth-studio-v2/public/api/tools.json`.
- **On-Demand Server & DB Hygiene:** Verified against isolated temp `python3 ~/NullAITech/agent-flight-recorder/server.py --host 127.0.0.1 --port 8104 --db /tmp/afr-v2-verify.db`; temporary PID cleanly terminated and port `:8104` confirmed idle (`PORT_8104_IDLE_CONFIRMED`) at completion.

### Before / After 5-Level Scorecard (`v1` -> `v2`)

| Level | Dimension | `v1` Baseline | `v2` Re-Audit | Delta | Verdict | Key Verified Evidence |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **L1** | **System, SQLite WAL, SHA-256 Chain, APIs, Security, CLI, TUI, MCP & Chroot** | `4.2 / 10` | **`9.6 / 10`** | `+5.4` | `PASS` | Strict Origin regex + port bounds (`403` on `127.0.0.1:8104.example.invalid`), `Host` allowlist (`403` on `evil.example:8104`), `Vary: Origin`, `204` OPTIONS, zero `ACAO` on `GET /`, `1 MiB` cap (`413`), malformed/non-dict JSON & bad `offset_ms`/`limit` (`400`), `Path.is_relative_to()` traversal `403`, unknown `/api/*` `404` JSON. SQLite `WAL` + `foreign_keys=ON` + `busy_timeout=5000`, auto-created `capsule-jail-audit` session, real append-only SHA-256 hash chain + `GET /api/verify/<sid>` (with tamper detection verified in pytest), XSS-escaped HTML (`\u003c/script\u003e`), formula-safe CSV, JSON/Markdown exports, 4-tool stdio JSON-RPC 2.0 MCP server (`agent-flight-recorder mcp`), real SQLite/HTTP TUI, strict CLI exit `2` on unknown subcommand, hardened systemd unit, chroot `/opt` synced, `public/assets` pruned `45 MB -> 492 KB`, `NullAITech` remote configured. |
| **L2** | **User & Live Telemetry Forensics Workflow** | `4.8 / 10` | **`9.6 / 10`** | `+4.8` | `PASS` | Standalone `:8104` probes `/api/health` on origin, subscribes live to `EventSource('/api/stream')` (`LIVE_SSE_CHECK`: `7 -> 8` events pushed live with zero reload), displays real `SHA-256 VALID • c680b3d3fd30` badge, adds Raw Event Timeline Inspector with type filter & search (rendering `capsule_execution`, `file_mutation`, `system_metric`), rewinds Play from end-of-tape, removes duplicate `#sessionSelect` listener, and exports `.html`/`.json`/`.csv`/`.md`. Studio `AgentFlightRecorderGodModeTool.jsx` wired live to `127.0.0.1:8104` (`hasLiveChip: true`, `hasCapsuleSession: true`, `hasOldMock: false`) with honest offline banner & opt-in preview; dead `AgentFlightRecorderTool` retired from `EnclaveToolsSuite.jsx`. |
| **L3** | **Engineer & Code Quality** | `5.0 / 10` | **`9.5 / 10`** | `+4.5` | `PASS` | Real child CPU/RSS telemetry via `os.wait4` + `/proc` (eliminating hardcoded `1.2`), opt-in `--with-proxy`, `Union[List[str], str]`, guarded payload casts, double `charset=utf-8` & raw `500` leak fixed, broken `.lock-overlay` CSS + dead paywall CSS + `sovereign-upgrade.js` + external Google Fonts CDN removed, Electron `sandbox: true` + clean `will-quit` shutdown. Automated tests: `31/31` `agent-flight-recorder` pytest (`2.13s`), `39/39` Studio routes passing `npm test`, `12/12` `zoth-os` pytest (`7.07s`). |
| **L4** | **UI, Visual Craft & Triple-Viewport Proof** | `5.0 / 10` | **`9.5 / 10`** | `+4.5` | `PASS` | Full Editorial Ivory Light (`#FAF7F0` / `#FFFFFF` / `#1C1917` / `#9A7209` / `#0369A1`) + Obsidian Dark dual-theme on `:8104` and Studio God-Mode Deck (`>= 4.5:1` contrast, zero dark slabs on Light Mode). Studio iframe passes `?embed=1&theme=light|dark`, stripping duplicate header/hero chrome cleanly. Mobile `390×844` audit on `:8104`: **`0 / 27` `<44 px` tap-target failures**, **`0` unlabeled inputs**, **`overflowPx: 0`**, **`errors: []`**, **`imgsMissingAlt: 0`** across all 12 triple-viewport captures + 2 God-Mode Deck captures + regenerated `1200×630` `public/assets/banner.png` visually inspected via `read_file`. |
| **L5** | **Readability, Copy, Docs & Accessibility** | `4.8 / 10` | **`9.6 / 10`** | `+4.8` | `PASS` | Honest `executionType: 'local-daemon'` and `runtimes: ['local-daemon', 'cli', 'mcp', 'zero-egress']` in `toolsData.js` & `public/api/tools.json` (`hasInBrowserClaim: false`, `hasLocalDaemonClaim: true`), fixed `workstations.js` path to `/tools/agent-flight-recorder`, added `ToolMotionShowcase.jsx` metadata, accurate 4-tool stdio MCP & REST docs in `README.md` and `toolsDocumentation.js`, removed `#paywall` from `sitemap.xml`, true `.sr-only` labels & `aria-label` accessibility, and standardized attribution `Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform`. |
| — | **Weighted Composite** | **`4.76 / 10`** | **`9.56 / 10`** | **`+4.80`** | **`PASS`** | **All 5 levels `>= 9.5 / 10`; all P0, P1, and P2 backlog items resolved and verified.** |

### Verified Check Matrix (`v2`)

- **Backend & Security Tests (`~/NullAITech/agent-flight-recorder`):** `PYTHONPATH=src python3 -m pytest -v tests` → **`31 passed in 2.13s`** (`0` failures).
- **Live HTTP Security & Export Probes (`127.0.0.1:8104`):**
  - `GET /health` → `200 OK` (`port: 8104`, `version: "2.6.0"`)
  - `OPTIONS` & `POST /api/ingest` (`Origin: http://127.0.0.1:8104.example.invalid`) → **`403`** (zero `ACAO`)
  - `GET /api/stats` (`Host: evil.example:8104`) → **`403`**
  - `OPTIONS /api/ingest` (`Origin: http://127.0.0.1:3000`) → **`204 No Content`** + `Vary: Origin` + `ACAO: http://127.0.0.1:3000`; `GET /` → **zero `ACAO`**
  - `POST /api/ingest` (`session_id: "capsule-jail-audit"` + `</script><script>window.__xss=1</script>`) → **`200 OK`**, auto-created session, `GET /api/verify/capsule-jail-audit` → **`valid: true`** (`7` events, `head_hash: c680b3d3fd30fb67b93c9ea0db6b805221ad936b3dbcf25b6df6b041b05f12a2`), `GET` & `POST /api/export/bundle` → **`200 OK`** with `\u003c/script\u003e` escaping verified
  - `GET /api/export/{json,csv,markdown}` → **`200 OK`**
  - `?offset_ms=abc` → **`400`**, `{not-json` → **`400`**, `["array"]` → **`400`**, `>1 MiB` → **`413`**, `/../server.py` & `/%2e%2e/server.py` → **`403`**, `/api/nonexistent` → **`404` JSON**
- **CLI, Live TUI & Stdio MCP:**
  - `agent-flight-recorder --version` → `agent-flight-recorder v2.6.0`; `agent-flight-recorder --json` → `2.6.0 READY`; `agent-flight-recorder bogus-cmd` → exit **`2`**
  - `agent-flight-recorder-tui --once` / `--json` → live `:8104` + offline SQLite fallback (`2.6.0`, zero synthetic boilerplate)
  - `agent-flight-recorder mcp` → verified `initialize`, `tools/list` (`flight_recorder_scrub`, `flight_recorder_sessions`, `flight_recorder_ingest`, `flight_recorder_verify`), and `tools/call`
- **Zoth Studio v2 & ZothOS:**
  - `cd ~/NullAITech/zoth-studio-v2 && npm run build && rsync -a --delete dist/ /opt/zoth-studio/dist/ && npm test` → **39/39 routes passed (`0` console errors)** + `PASS test-routes.mjs`
  - `cd ~/NullAITech/zoth-os && python3 -m pytest -q` → **`12 passed in 7.07s`**
- **Visual Captures Inspected via `read_file`:** All 12 triple-viewport stills (`/tmp/whiteboard-audit-008-v2/{standalone-dark,standalone-light,studio-light,studio-dark}/*.jpg`), both Studio God-Mode Deck stills (`studio_godmode_{light,dark}.jpg`), and `~/NullAITech/agent-flight-recorder/public/assets/banner.png` (`1200×630` PNG) visually verified clean.
