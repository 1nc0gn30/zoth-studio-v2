# Whiteboard Verification Audit — #005 `agent-capsule-jail` (Agent Capsule Jail)

## 1. Header Metadata & 5-Level Scorecard

| Field | Value |
| :--- | :--- |
| **Audit Item** | `#005` — `agent-capsule-jail` (**Agent Capsule Jail**) |
| **Audit Mode** | Baseline (`v1`) read-only 5-level audit. Target repo source untouched (`git status` clean at completion). |
| **Audit Start (EST / UTC)** | `2026-11-25 22:31:44 EST` / `2026-11-26 03:31:44 UTC` |
| **Audit Completion (EST / UTC)** | `2026-11-25 22:39:31 EST` / `2026-11-26 03:39:31 UTC` |
| **Repo & Git State** | `~/NullAITech/agent-capsule-jail` (`main` @ `237b57b`, clean; `origin=https://github.com/1nc0gn30/agent-capsule-jail.git`; **no `NullAITech` remote**) |
| **Sibling Repos Inspected** | `~/NullAITech/zoth-studio-v2` (`main` @ `6a0a754`), `~/NullAITech/zoth-os` (`main` @ `3411040b`) |
| **Observed Versions (3-way drift)** | `2.5.0` (`package.json`, `cli.py:192,249`, `toolsData.js:752`, `/usr/local/bin/agent-capsule-jail`) vs `0.1.0` (`pyproject.toml:7`, `server.py:82` `server_version`, `server.py:128` `/health` body) vs `v2.5 SOVEREIGN` (UI badge) |
| **Temporary Daemon** | `python3 -u server.py --port 8105`, `PID 429564`, bound `127.0.0.1:8105` only, startup `0.14 s` to first `/health 200`, `RSS 23.5 MB` idle → `28.1 MB` after 24 capsules. Terminated with `SIGTERM` at completion; `ss` shows no `:8105` listener, `curl` → `000`. |
| **Sandbox Runtime** | `bubblewrap 0.12.0` (`/usr/bin/bwrap`), `prlimit` present → `/health` reports `"sandbox": "bwrap"` |
| **Automated Test Baseline** | `PYTHONPATH=src python3 -m pytest -q tests` → **`40 passed in 3.20s`** (wall `4.09 s`, exit `0`) |
| **Overall Verdict** | **`NEEDS FIX`** — **`5.68 / 10`** |

### 5-Level Verification Scorecard

| Level | Dimension | Score | Status | Primary Root Causes |
| :---: | :--- | :---: | :---: | :--- |
| **L1** | **System & Security** | **`5.6 / 10`** | `NEEDS FIX` | bwrap containment holds (no network, read-only root, private `/home`, PID namespace, commit-root and path-escape guards). Problems: any `localhost:*` origin gets a reflected ACAO on `GET /`, so it can read the injected exec token and then `POST /api/exec` (`server.py:73-75,183-187`). Hostname-spoof origin `http://127.0.0.1:8105.example.invalid` is accepted (`server.py:70`). `allow_network` can be set from the API and reaches every loopback daemon, including `:8105` itself. `allowed_env` skips the secret denylist (`capsule.py:243-254`). 3 inputs crash the handler (`HTTP 000`). `max_procs` is not clamped and not enforced (32 requested, 198 forks allowed). 45 MB of unused assets. 97-entry chroot `/opt` drift. |
| **L2** | **User & Workflow** | **`5.4 / 10`** | `NEEDS FIX` | On `:8105`, real sandboxed runs work (stdout/stderr/exit code/fs-delta verified in the DOM). But `capsule_engine.js:312-313` catches every failure (401, policy violation, bwrap missing) and shows a made-up **SUCCESS** "ZERO SECRETS DETECTED" result. The Studio God-Mode deck is a browser Web Worker JS evaluator that never calls `:8105`, and its memory slider does nothing. Hardcoded `port === "8105"` switch, seeded fake stats, fake `sha256-…f7c8` "audit seal". |
| **L3** | **Engineer & Code Quality** | **`5.8 / 10`** | `NEEDS FIX` | 40/40 tests pass, but none cover CORS spoofing, malformed params, telemetry accuracy, or the UI fallback. `RUSAGE_CHILDREN` makes per-run CPU/RSS cumulative across all runs (`capsule.py:567-574`). `MemoryError` is classified as `error`, not `oom_killed` (`capsule.py:556-563`). Version drift `2.5.0`/`0.1.0`. The worker egress denylist can be bypassed through the prototype. Electron runs with `--no-sandbox`. Google Fonts CDN contradicts the `"zero-egress"` runtime tag. Stale `'edge-forge'` alias. |
| **L4** | **UI, Visual & Accessibility** | **`6.0 / 10`** | `NEEDS FIX` | All 15 captures: `overflowPx 0`, `errors 0`, `imgsMissingAlt 0`. `:8105` has no Light Mode (light and dark captures are pixel-identical; no `prefers-color-scheme` rule). The `og:image` banner shows a forbidden **"FOUNDING PASS: $19 LIFETIME (Reg $79)"** funnel, clipped and partly unreadable. Mobile `<44px` targets: `6/24` on `:8105`, `50/74` on Studio. Four stat cards push the Run button below roughly 1,600 px on mobile. In Studio Light Mode the iframe stays dark, repeats the support bar and header, and has its own scrollbar. The Syne `0` renders like `o`. |
| **L5** | **Docs, Copy & Readability** | **`5.6 / 10`** | `NEEDS FIX` | Phantom MCP tool `capsule_jail_exec` exists only in `toolsDocumentation.js:1221`, and its output schema field names don't match the API. Studio says "Runs 100% in your browser — no local install or backend required" right beside "Local Daemon Reachable (:8105)" (`executionType: 'browser'`). Tutorial copy describes toggles and syscall telemetry that don't exist. `--status` prints static info, not daemon status. Banner claims "POSIX cgroups" (not used). The Studio motion showcase is labelled "HEXSTRIKE PERIMETER RADAR". Workstation path `/studio/agent-capsule.html` returns 404. |
| — | **Weighted Composite** | **`5.68 / 10`** | **`NEEDS FIX`** | **Fix all P0/P1 findings to reach `>= 9.0 / 10` on every level.** |

---

## 2. Test Roadmap & Execution Log

### 2.1 Level 1 — REST surface (live `:8105`)

| Probe | Result |
| :--- | :--- |
| `GET /` | `200 text/html 37,906 B` (includes injected `<meta name="capsule-token">`, count `1`) |
| `GET /health`, `/api/health` | `200` `{"status":"healthy","sandbox":"bwrap","exec_requires_token":true,"version":"0.1.0",…}` |
| `GET /api/stats`, `/api/capsules` | `200` JSON |
| `GET /api/capsules?limit=abc` | **`000` (connection dropped)**: `int()` ValueError not caught (`server.py:143`) |
| `GET /api/capsules?limit=-1` | `200` (no lower bound) |
| `GET /nope` | `404` JSON |
| `POST /api/exec` no token / wrong token | `401` (hint includes the absolute token-file path, `server.py:224`) |
| `POST` invalid JSON / empty command | `400` / `400` |
| `POST` body `[1]` | **`000`**: `list.get` AttributeError (`server.py:239`) |
| `POST` `timeout_sec:"abc"` | **`000`**: `float()` ValueError (`server.py:246`) |
| `POST` `Content-Length: -1` | `400` "Missing 'command'" (handled) |
| `POST` `Authorization: Bearer …` `echo hello-capsule` | `200` `success`, `exit 0`, stdout `hello-capsule\n`, `24 ms` |
| `timeout_sec:0.01` + `sleep 3` | clamped to `0.5 s`: `timeout`, `exit -9`, `514.8 ms` ✅ |
| CPU loop, `timeout_sec:1` | `timeout`, `exit -9`, `1015 ms` ✅ |
| `bytearray(400 MB)`, `memory_mb:128` | blocked (`MemoryError`), but reported as **`status:"error"`, `memory_exceeded:false`** ❌ |
| `memory_mb:999999` → `ulimit -v` | `4194304` KB (4 GB clamp holds) ✅ |
| `max_procs:99999999` | **`prlimit: failed to set the NPROC resource limit: Operation not permitted`**: request fails (`server.py:252-253` no clamp) |
| Fork pressure, `max_procs:32` | **forked 198 children** before `EAGAIN` (ceiling = host-owned procs + quota, `capsule.py:461`) ❌ |
| `initial_files {"../../evil": …}` | `400` `path escapes the capsule` ✅ |
| `commit:true`, `destination_dir:/tmp/acj-evil` | `400` "outside the allowed commit roots"; dir not created ✅ |

### 2.2 Level 1 — Sandbox containment (inside capsule)

| Probe | Observation |
| :--- | :--- |
| `env` / `sorted(os.environ)` | Only `CAPSULE_ID, HOME, LANG, LC_ALL, LOGNAME, PATH, PWD, PYTHONPATH, PYTHONUNBUFFERED, TERM, TMPDIR, USER`. No secrets ✅. Full host `PATH` (with username paths), `USER` and `LOGNAME` pass through. |
| `ls /home /root ~/.config` | empty tmpfs; token file not visible ✅ |
| `touch /etc/x`, `/usr/x` | `Read-only file system` ✅ |
| `/proc` PID count | `5` (PID namespace) ✅ |
| Default network | interfaces `lo` only; `1.1.1.1:53` → `Network is unreachable`; `127.0.0.1:8105` → `Connection refused` ✅ |
| `allow_network:true` | capsule reaches `http://127.0.0.1:8105/health` → `200` **and fetches `/` with the exec token meta present: `True`** ❌ |
| `allowed_env:["…"]` | any named host variable is passed through, even names matching `SENSITIVE_PATTERNS` (`capsule.py:243-254`) ❌ |

### 2.3 Level 1 — CORS / origin matrix

| Origin | `OPTIONS /api/exec` | `GET /api/stats`, `/api/capsules`, `/` ACAO | `POST /api/exec` (valid token) |
| :--- | :--- | :--- | :--- |
| `http://127.0.0.1:3000` | `204`, reflected | reflected | `200` |
| `https://example.invalid` | `204`, ACAO `http://127.0.0.1` | `http://127.0.0.1` | `403` ✅ |
| **`http://127.0.0.1:8105.example.invalid`** | **`204`, reflected** | **reflected** | **`200`** ❌ (`urlparse().hostname` → `127.0.0.1`; port never validated) |
| `http://localhost:9999` | `204`, reflected | **reflected on `GET /` (token page)** | `200` |
| `null` | `204` | `http://127.0.0.1` | `403` ✅ |

No `Vary: Origin` on any response. `OPTIONS` never returns `403`. Every response sends `frame-ancestors 'self' http://127.0.0.1:* http://localhost:* https://zoth.nullai.tech`.

### 2.4 Level 1 — Static path containment (`curl --path-as-is`)

`/../server.py`, `/%2e%2e/server.py`, `/..%2fserver.py`, `/../public_evil/x`, `/../../../../etc/passwd` all return **`200` + `index.html`**: `_safe_rel()` (`server.py:27-35`) turns any `..` path into the index. Contained, but a soft-200 instead of `404`. `server.py:162` still uses the sibling-prefix pattern `str(target).startswith(str(public_dir))`. It can't be reached today (`_safe_rel` runs first, `0` symlinks in `public/`), but it should become `Path.is_relative_to()`.

### 2.5 Level 1 — CLI, TUI, systemd, chroot

| Check | Result |
| :--- | :--- |
| `which -a` | `~/.local/bin` comes before `/usr/local/bin` (PATH has duplicate entries). `agent-capsule-jail` sha `17aed5a6ba6b` is identical in host `/usr/local/bin`, `~/.local/bin`, and the chroot. `agent-capsule` is a symlink to the wrapper. Host `zoth-capsule-jail` is a regular copy; in the chroot it is a symlink. |
| `-tui` | sha `f5bb702ba96e` same on all 3 surfaces, **≠ repo `bin/agent-capsule-jail-tui`**. Boilerplate: `math.sin()` sparklines, hardcoded `"audio_lufs": -14.0`, `benchmark_ms = elapsed + 0.42`, unconditional `PASS`, `canvasui.dev` install string. |
| `--help` / `--version` | exit `0` / `agent-capsule-jail v2.5.0` |
| `--status` | exit `0`. **Prints static repo/URL info, not daemon status** (wrapper intercepts `--status`; the real `cli.py:174` `cmd_status` only runs via `status`) |
| `--json` | static `"status": "READY"` even when the daemon is down |
| `status --json` | live: `online:true`, health + stats ✅ |
| `exec --json -- python3 …` | `exit 0`, bwrap argv shown, env allowlist confirmed ✅ |
| `token` | exit `0` |
| unknown subcommand | exit `2` (argparse `invalid choice`) ✅ |
| `agent-capsule-jail.service` | `User=zoth`, `--host 127.0.0.1 --port 8105`, `Restart=always`, enabled through `multi-user.target.wants`. **No hardening** (`NoNewPrivileges`, `ProtectSystem`, `PrivateTmp` absent). `KillMode=process` leaves capsule children alive on restart. `After=network.target` with no `network-online` need. Starts at boot, which contradicts the "on-demand" posture. |
| `diff -rq` repo vs `zoth-os/.../opt/agent-capsule-jail` | **97 differences**: chroot lacks `electron/`, `bin/agent-capsule-jail-tui`, and most of `public/assets`. `package.json`, `LICENSE`, `.gitignore`, `hero-banner.svg`, and the showreel prompt differ. Chroot size `884 KB`. |

### 2.6 Level 1 — Guardrail & hygiene

| Check | Result |
| :--- | :--- |
| `netlify.toml` | `publish="public"`, 3 required headers + Permissions-Policy, SPA `/* → /index.html 200` ✅ |
| `robots.txt` | `*`, Googlebot, GPTBot, ClaudeBot, PerplexityBot, Applebot, `Crawl-delay: 0`, absolute sitemap ✅ |
| `sitemap.xml` | `<lastmod>2026-10-11` (stale); lists `/api/health` and `/api/stats`, which on Netlify are canned JSON (`public/api/*` claims `active_capsules: 6`, `secrets_stripped: 38`) |
| Schema.org | `@graph` with `["WebApplication","SoftwareApplication"]`, Offer `price 0`, FAQPage ×3 ✅. Creator is `1nc0gn30`, not "Neal Frazier / Neal Frazier Tech". |
| `og:image` | `https://capsule.nullai.tech/assets/banner.png` exists (sha matches `public/banner.png`). **Image contains the paywall banner** (see L4). `public/og-banner.jpg` is actually PNG data, 1200×624, and is never referenced. |
| `public/assets/` | **50.4 MB total; 72 of 79 files (44.9 MB) unreferenced**: 57× `gpu-blender-v*.glb` (22 MB) plus 19 MB of `.mp4/.webm`; 73 `gpu-*` files tracked in git |
| Paywall grep | Live UI is unlocked, but dead CSS/comments remain: `index.html:93,275,395,790,935` (`paywall`, `filter: blur`, `PAYWALL`), `capsule_engine.js:144-158` (`checkLicense`, `is-blurred`), `capsule_engine.js:297,306` (`localStorage capsuleToken`) |
| Dead files | `capsule_jail.log` (0 B, git-ignored) |

### 2.7 Level 2 — Interactive workflow (CDP probe, real clicks)

| Scenario | DOM result |
| :--- | :--- |
| `:8105` startup | Opens straight into the workbench. `sovereign_tutorial.js` auto-open is commented out (`:127-128`); `tutorialVisible:false` ✅ |
| Preset **Env Secret Strip** → Run | badge `SUCCESS`, real stdout `OPENAI_API_KEY: None …` ✅ |
| Preset **File Writer Diff** → Run | `SUCCESS`, `2 delta items (2 new …)` ✅ |
| `cat /nonexistent-file && exit 3` | `ERROR`, exit `1`, real stderr ✅ |
| Forensic panel | `"sha256_audit_seal": "sha256-000000005a085ec1f7c8"` (32-bit JS hash dressed up as SHA-256, `capsule_engine.js:629-636`); `"flight_recorder_dispatched": true` is hardcoded (`:489`) ❌ |
| **Token tampered → Run** | Console `401`, but UI shows **`SUCCESS` + "ZERO SECRETS DETECTED (CONTAINED)"**: fabricated by `simulateCapsuleExecution()` (`capsule_engine.js:312-313`) ❌ **P0** |
| Studio `/tools/agent-capsule-jail` default tab | iframe `http://127.0.0.1:8105/`. Live and working because the iframe origin is `:8105`. |
| Studio **God-Mode Deck** → "EXECUTE INSIDE CAPSULE JAIL" | Runs JS in a Blob Web Worker (`AgentCapsuleJailGodModeTool.jsx:92-130,179-250`): "Discovered 46 primes", `0.60 ms`. **No request to `:8105/api/exec`** (only resource hit: the iframe document). `memoryLimitMb` slider (`:152,427-431`) is never passed to the worker. |
| `/workstations/agent-capsule-jail` | redirects to `/tools/agent-capsule-jail` (`App.jsx` `WorkstationRedirect`) ✅; `workstations.js:233` path `/studio/agent-capsule.html` → **`404`** |

### 2.8 Level 4 — Screenshot evidence (all opened and inspected with `read_file`)

| Surface | Mobile 390×844 | Tablet 820×1180 | Desktop 1440×900 | Capture stats |
| :--- | :--- | :--- | :--- | :--- |
| `:8105` (default) | `/tmp/whiteboard-audit-005/8105-light/home_mobile.jpg` | `…/8105-light/home_tablet.jpg` | `…/8105-light/home_desktop.jpg` | overflow `0`, errors `0`, noAlt `0`, buttons `22` |
| `:8105` `--dark` | `…/8105-dark/home_mobile.jpg` | `…/8105-dark/home_tablet.jpg` | `…/8105-dark/home_desktop.jpg` | identical to light (no theme support) |
| Studio `/tools/…?theme=light` | `…/studio-tools-light/tools_agent-capsule-jail_mobile.jpg` | `…_tablet.jpg` | `…_desktop.jpg` | overflow `0`, errors `0`, noAlt `0` |
| Studio `/tools/…?theme=dark` | `…/studio-tools-dark/tools_agent-capsule-jail_mobile.jpg` (cold-load spinner "LOADING SPECIFICATION" at 3.5 s) | `…_tablet.jpg` | `…_desktop.jpg` | overflow `0`, errors `0` |
| Studio `/workstations/…` | `…/studio-ws/workstations_agent-capsule-jail_mobile.jpg` | `…_tablet.jpg` | `…_desktop.jpg` | overflow `0`, errors `0` |
| Interactive | `…/interactive/studio-deck-dark-mobile.jpg` | `…/interactive/studio-iframe-light-tablet.jpg` | `…/interactive/8105-after-run-desktop.jpg`, `…/interactive/studio-deck-light-desktop.jpg` | — |
| Brand | `public/assets/banner.png` (= `og:image`), `public/og-banner.jpg` | | | — |

---

## 3. 5-Level Deep Findings (`file:line`)

### L1 — System & Security
1. **Token disclosure to any localhost page (P0).** `server.py:183-187` injects the exec token into every `GET /` response. `server.py:73-75,91-92` reflects ACAO for any `localhost`/`127.0.0.1`/`::1` origin on **all** GET routes, so a page served by any local dev server (any port) can `fetch('http://127.0.0.1:8105/')`, read the token, then `POST /api/exec` (allowed because its origin is "local"). Same exposure for `/api/capsules`, which returns past stdout. The `Host` header is never validated (DNS-rebinding read path on GET).
2. **Origin parser confusion.** `server.py:70` trusts `urlparse(origin).hostname` without validating `.port`, so `http://127.0.0.1:8105.example.invalid` is treated as local and reflected (`OPTIONS`, `GET`, and `POST 200`). Browsers can't emit this origin, but non-browser relays can. Fix with an exact `scheme://host[:digits]` regex and an explicit port allowlist.
3. **API-controlled network + env.** `server.py:254,270` passes `allowed_env` and `allow_network` straight from the request. `capsule.py:243-254` puts explicitly allowed keys back in even when they match `SENSITIVE_PATTERNS` (the comment on `:245` about `FORCE_` prefixes describes a check that doesn't exist). With `allow_network` the capsule shares the host network namespace and can reach every loopback daemon (verified: `:8105` `200`, token readable).
4. **Unvalidated numeric inputs.** `server.py:143` (`limit`), `:239` (non-dict body), `:246/249/252/253` (`float`/`int` casts) raise uncaught exceptions, so the client gets an empty reply (`HTTP 000`). `max_procs` and `max_file_size_mb` have no clamp; a huge `max_procs` makes `prlimit` fail.
5. **Process quota not enforced as a per-capsule limit.** `capsule.py:452-462` sets `RLIMIT_NPROC = owned_host_procs + max_procs + 16` (min 128). With `max_procs:32` the capsule forked **198** children.
6. **CORS hygiene.** No `Vary: Origin` (`server.py:91-96`). `do_OPTIONS` (`:107-111`) always returns `204`. Error 401 hint (`:224`) echoes the absolute token-file path.
7. **Latent prefix check.** `server.py:162` `startswith` sibling-prefix pattern; switch to `target.is_relative_to(public_dir.resolve())` and return `404` instead of falling back to index for `..` paths.
8. **Distribution drift.** The chroot `/opt/agent-capsule-jail` differs in 97 entries. The `-tui` binary on all 3 surfaces is a boilerplate generator unrelated to the repo copy. The systemd unit has no sandboxing directives and uses `KillMode=process`.
9. **Remote & assets.** No `NullAITech` git remote. 44.9 MB of unreferenced `gpu-*` assets in `public/` (shipped to Netlify and tracked in git).

### L2 — User & Workflow
1. **Fabricated success on failure (P0).** `capsule_engine.js:312-313` sends every `/api/exec` failure (401, 400 policy violation, bwrap unavailable, network error) to `simulateCapsuleExecution()` (`:322-404`), which shows `SUCCESS`, invented stdout, fake fs-deltas with 32-char "sha256" values (`:376-377`), and bumps local counters. Reproduced: tampered token gave a console `401` and a UI showing `SUCCESS … (CONTAINED)`.
2. **Hardcoded port switch.** `capsule_engine.js:10` `window.location.port === "8105"`. Any other port (Netlify, `--port 9000`, the Electron `PORT` env) runs simulation only (`:274-281`). Seeded fake telemetry `DEFAULT_STATS`/`DEFAULT_HISTORY` (`:13-27`).
3. **Fake forensic fields.** `simpleHash()` labelled `sha256-` (`:629-636`), `isolation_grade: 'SOVEREIGN_L3_EPHEMERAL'`, `flight_recorder_dispatched: true` (`:488-489`) regardless of the telemetry result. `downloadDeltaBundle` stamps `'SOVEREIGN_L3_VERIFIED'` (`:589`).
4. **Studio God-Mode is disconnected.** `AgentCapsuleJailGodModeTool.jsx` evaluates JS with `new Function` in a Blob worker (`:121`). Nothing reaches the Python enclave, no bwrap, no rlimits. The "Memory Cap Envelope" slider (`:427-431`) is UI only. Chips claim "UNLIMITED JAIL EXECUTION UNLOCKED" (`:310`) and "OFFLINE-CAPABLE WORKER" (`:371`).
5. **Telemetry numbers are wrong for users.** "Peak RSS 21 MB" for `true` and monotonically rising `cpu_time_user_s` (`0.0267 → 0.0678` across unrelated runs) come from cumulative `RUSAGE_CHILDREN` (see L3-2). "Shielded RAM 768 MB" is `cumulative_ram_saved_mb`, a vanity counter.

### L3 — Engineer & Code Quality
1. **Tests:** `40 passed / 0 failed in 3.20s` (`test_sandbox_security.py` 16, `test_capsule.py` 10, `test_bind_host.py` 3, `test_origin_guard.py` 2, `test_static_traversal.py` 1). **Gaps:** hostname-spoof origin, GET-route ACAO/token exposure, `Vary`, malformed `limit`/body/numeric fields, `max_procs` enforcement, `allowed_env` denylist bypass, OOM classification, per-run rusage accuracy, UI fallback behaviour.
2. **Cumulative rusage bug.** `capsule.py:567-574` reads `resource.getrusage(RUSAGE_CHILDREN)`, which is cumulative for the whole server process, so every capsule reports server-lifetime CPU and the max RSS seen so far. Use `os.wait4(proc.pid, 0)` (or diff before/after snapshots) per run.
3. **OOM misclassification.** `capsule.py:556-563`: the `"MemoryError" in stderr` check sits inside `if exit_code < 0`, so Python `MemoryError` (exit `1`) is reported as `error` with `memory_exceeded:false` (reproduced).
4. **Version drift.** `pyproject.toml:7` `0.1.0`, `server.py:82,128` `0.1.0`, `package.json`/`cli.py`/wrapper/toolsData `2.5.0`. `/health` reports `0.1.0` while `status --json` reports `2.5.0` in the same payload.
5. **innerHTML sinks.** `public/assets/sovereign-upgrade.js:231-240` interpolates `p.name/description/payload` from `gpu-domain-presets.json` unescaped (same-origin data, low risk; still a sink). `capsule_engine.js:550` interpolates `r.status` unescaped. Command/stdout/path fields *are* escaped (`:464-466,553`) or set with `textContent` (`:423-426`) ✅.
6. **Worker "egress block" is bypassable.** `AgentCapsuleJailGodModeTool.jsx:111-117` shadows `self.fetch` etc. with own-property getters, but `WorkerGlobalScope.prototype.fetch.call(self, …)` still works, and the Blob worker inherits the Studio origin. The "Egress Violation Intercept" preset (`:66-74`) only shows the naive path.
7. **Electron.** `electron/main.cjs:8,10` append `no-sandbox` and `disable-gpu-sandbox`. The smoke test passes on `htmlLen > 100` (weak).
8. **Egress claims.** `index.html:34-36` loads Google Fonts while `public/api/tools.json` lists `"zero-egress"` and `"webgpu"` runtimes (no WebGPU code exists).
9. **Studio wiring.** `RealToolWorkspacePage.jsx:259` maps `'edge-forge'` to `AgentCapsuleJailGodModeTool` (stale alias; `workstations.js:132` defines a separate `edge-forge`). `EnclaveToolsSuite.jsx:2573-2577` is a pass-through wrapper. `ToolMotionShowcase.jsx:53-61` gives every Security tool the `hexstrike` clip and "Perimeter Radar" anchor.
10. **Dead/odd files.** `capsule_jail.log` (0 B), `public/api/{health,stats,status}` static fakes, `package.json` `serve:public` script (`python3 -m http.server`) that would serve a backend-less UI.

### L4 — UI, Visual & Accessibility
1. **Banner / `og:image` (P0).** `public/assets/banner.png` (1200×630) contains **"FOUNDING PASS: $19 LIFETIME (Reg $79) • STRIPE + SOLANA"** (banned funnel copy), clipped at the right edge. The subtitle is white-on-white and unreadable. Black diamond artifacts top and bottom. Claims "POSIX cgroups". `og-banner.jpg` has a clean visual but the wrong extension and 1200×624, and is unused.
2. **No Light Mode on `:8105`.** Light and dark captures are identical (`bodyBg rgb(8,8,11)`, `colorSchemeMQ:false`). Inside Studio Editorial Ivory, the embedded iframe stays obsidian (`studio-iframe-light-tablet.jpg`).
3. **Duplicate chrome in Studio iframe.** The iframe repeats the coffee bar, title, version badge, "100% FREE" chip, and a second "Buy Us a Coffee", plus its own visible scrollbar at roughly 520 px height.
4. **Mobile.** `:8105` has `6/24` targets `<44px` (support links 26–28 px tall, range sliders 6 px, checkbox 18 px, footer `@1nc0gn30` 17 px). Studio has `50/74` (e.g. "Copy CLI" 37 px, showcase chips 25–26 px). The 4 stacked stat cards plus the support bar push the execution chamber below roughly 1,600 px (`8105-light/home_mobile.jpg`). "100% FREE" appears three times above the fold.
5. **Tablet.** The 4th stat card sits alone on its own row (3+1 grid) on `:8105` at 820 px.
6. **Typography.** Syne display face renders digit `0` like `o` ("o delta items (o new, o mod, o del)", `8105-after-run-desktop.jpg`). Default browser scrollbar visible on the `:8105` desktop.
7. **Strong points:** desktop `:8105` composition is clean (two-pane chamber/telemetry, clear status pill, red stderr rail). Studio light and dark both adapt the deck correctly. Zero overflow, zero console errors, and zero missing alt across all 15 captures.

### L5 — Docs, Copy & Readability
1. **Phantom MCP tool.** `toolsDocumentation.js:1221` `mcpTool: 'capsule_jail_exec'`: a grep across `agent-capsule-jail`, Studio `src`, and the chroot bins finds it only in this doc. Output schema `execution_ms`, `files_diff`, `resource_usage` (`:1236-1244`) vs actual `duration_ms`, `fs_diff`, `cpu_time_*`/`max_rss_kb`.
2. **False architecture copy.** `toolsDocumentation.js:1219,1251-1252` describe "resource.setrlimit" isolation and "copy-on-write scratch" and never mention bubblewrap (the actual boundary). README `Overview` says read-only `/usr,/bin,/lib`, but the code does `--ro-bind / /`.
3. **Execution-type contradiction.** `toolsData.js:744` `executionType: 'browser'` and `public/api/tools.json` `execution_type: "browser"` render "✓ Runs 100% in your browser — no local install or backend required" beside "Local Daemon Reachable (:8105)". Real sandboxing needs the Python daemon and bwrap.
4. **Tutorial phantom features.** `index.html` tutorial steps 2–3 promise "Read-Only filesystem, Network Isolation, or Memory Capping with single-click toggle chips" and "real-time syscalls, network ingress/egress drops". No such controls or telemetry exist (there is no network toggle in the UI).
5. **CLI docs vs behaviour.** README "`agent-capsule --status` — Inspect sandbox mode and daemon telemetry", but the wrapper prints static info. `--help` lists `[subcommand ...]` without `exec/serve/status/token/test` descriptions (only the bare `agent-capsule` banner lists them).
6. **Mislabeled motion.** The Studio showcase reads "15S ASCII & CODE-FIRST MOTION EDIT · HEXSTRIKE PERIMETER RADAR & SWEEP" on the capsule page (`ToolMotionShowcase.jsx:59-60`).
7. **Workstation path.** `workstations.js:233` `/studio/agent-capsule.html` → `404` on `:3000`.
8. **Attribution.** Schema.org author, footer, and CLI show "1nc0gn30 • NullAI", not the required "Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform".
9. **Semantics OK:** single `<h1>` on `:8105` and Studio. `:8105` inputs all bound (`unlabeledInputs: []`). Presets carry `aria-label`. One icon-only control lacks a label on `:8105`. Studio has 4 unlabeled inputs on the page (text/email/text/textarea in shared page sections).

---

## 4. Prioritized Fix Backlog

### P0 — Blockers
| # | Fix | Location |
| :-: | :--- | :--- |
| P0-1 | Remove the simulated-execution fallback from the daemon path. Render the real error (401 / policy violation / sandbox unavailable) with an `ERROR` badge. Keep the simulation only for explicit static/demo mode with a visible "DEMO — not executed" banner. | `public/capsule_engine.js:274-281,312-313,322-404` |
| P0-2 | Stop sending the token to other origins: emit ACAO only for the exact same origin (or an allowlist of `http://127.0.0.1:3000` + self), add `Vary: Origin`, validate the `Host` header (`127.0.0.1:<port>`/`localhost:<port>`), return `403` on foreign `OPTIONS`, and drop CORS headers entirely from `GET /`. | `server.py:59-111,183-187` |
| P0-3 | Replace the `og:image` banner: remove the "$19 / $79 Founding Pass" funnel, fix contrast and clipping, drop the "cgroups" claim, and point `og:image` at a correct 1200×630 asset (or rename and fix `og-banner.jpg`). | `public/assets/banner.png`, `public/banner.png`, `banner.png`, `index.html:17,26` |
| P0-4 | Harden the exec API: strict origin regex with port validation; ignore `allowed_env` names matching `SENSITIVE_PATTERNS` unless the operator opts in via env; put `allow_network` behind an operator flag (`CAPSULE_ALLOW_NETWORK=1`). | `server.py:70,254,270`, `capsule.py:243-254` |

### P1 — Must fix for ≥ 9.0
| # | Fix | Location |
| :-: | :--- | :--- |
| P1-1 | Validate and clamp every numeric field (`limit` 1–200, `timeout_sec`, `memory_mb`, `max_procs` 1–512, `max_file_size_mb` 1–1024); reject non-object bodies with `400`. | `server.py:143,239-257` |
| P1-2 | Per-run rusage via `os.wait4`; classify `MemoryError` / exit-code OOM as `oom_killed`. | `capsule.py:536-574` |
| P1-3 | Real per-capsule process cap (cgroup `pids.max` via `systemd-run --user --scope -p TasksMax=` when available, else document the per-UID limitation and lower the ceiling). | `capsule.py:452-462` |
| P1-4 | Wire the Studio God-Mode deck to `:8105` (`/api/health` probe → token via documented paste field → `POST /api/exec`), keeping the worker only as a labelled offline JS demo. Pass or remove the memory slider. | `AgentCapsuleJailGodModeTool.jsx:92-250,427-431` |
| P1-5 | Fake forensic fields: compute real SHA-256 (`crypto.subtle.digest`), use the server's telemetry result for `flight_recorder_dispatched`, drop the `SOVEREIGN_L3_*` labels. Remove `DEFAULT_STATS/HISTORY` and the hardcoded port check (use `/api/health` detection). | `capsule_engine.js:10-27,484-492,582-598,629-636` |
| P1-6 | Unify version `2.5.0` across `pyproject.toml:7`, `server.py:82,128`. | — |
| P1-7 | Add a Light Mode to `:8105` (`prefers-color-scheme` + `?theme=` param forwarded from the Studio iframe) and an embed mode (`?embed=1`) that hides the coffee bar and header inside Studio. | `public/index.html`, Studio iframe src |
| P1-8 | Docs truth pass: remove/implement `capsule_jail_exec`, fix the output schema, describe bwrap, set `executionType` to `local-daemon`, fix tutorial steps, fix README `--status` and `/usr,/bin,/lib` claims. | `toolsDocumentation.js:1217-1256`, `toolsData.js:744`, `public/api/tools.json`, `index.html` tutorial, `README.md` |
| P1-9 | Make wrapper `--status`/`--json` call the live `cmd_status`; replace boilerplate `-tui` with a real status/telemetry view; sync all 3 bin surfaces and the chroot `/opt` tree (exclude `.glb/.mp4`). | `/usr/local/bin/agent-capsule-jail`, `~/.local/bin/*`, `zoth-os/config/includes.chroot/...` |
| P1-10 | Add tests: origin spoof, GET ACAO/token exposure, `Vary`, malformed params (`HTTP 400` not `000`), `allowed_env` denylist, `max_procs` clamp, OOM classification, per-run rusage. | `tests/` |
| P1-11 | Mobile: ≥44 px support links, slider thumbs and checkbox. Collapse stat cards into a 2×2 grid on ≤480 px so Run is visible near the fold. 2×2 grid on tablet. | `public/index.html` CSS |

### P2 — Polish
| # | Fix |
| :-: | :--- |
| P2-1 | Delete 72 unreferenced assets (44.9 MB), fix `sovereign-upgrade.js` broken refs (`gpu-vertical-ad-9x16.mp4`, `gpu-ltx-neural.webp`, `gpu-hero*.jpg`) or remove the modal; escape the preset fields at `:231-240`. |
| P2-2 | Self-host fonts (or a system stack) to match "zero-egress"; drop the `"webgpu"` runtime tag. |
| P2-3 | Change the Syne numerals to Space Grotesk/JetBrains Mono for counts; style the scrollbar. |
| P2-4 | Remove dead paywall CSS/comments (`index.html:93,275,395,790,935`, `capsule_engine.js:144-158,297,306`), `capsule_jail.log`, `public/api/*` fakes, and the `serve:public` script. |
| P2-5 | Remove the `'edge-forge'` alias (`RealToolWorkspacePage.jsx:259`); add a capsule-specific motion anchor in `ToolMotionShowcase.jsx`; fix `workstations.js:233` path. |
| P2-6 | systemd: add `NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`, `KillMode=control-group`; decide boot-enabled vs on-demand. |
| P2-7 | Add the `NullAITech` remote; refresh `sitemap.xml` `<lastmod>` and drop the `/api/*` URLs; set Schema.org creator to Neal Frazier / Neal Frazier Tech; strip username paths from `PATH` passthrough (use a fixed safe `PATH`); drop the absolute path from the 401 hint. |
| P2-8 | Electron: remove `no-sandbox`, make the smoke test check for `#btnRun` and zero console errors. |

---

## 5. AGY Perspective

**Feedback.** The Python core is better than the surfaces around it. The bwrap argv (`--ro-bind / /`, tmpfs `/home` `/root` `/run`, `--unshare-all`, `--cap-drop ALL`, `--die-with-parent`), the fail-closed `sandbox_mode()`, path-escape checks, and commit roots all held under live probes. The trust problems come from layers that say more than the engine does: a UI that fabricates success when a request fails, a Studio deck that never contacts the enclave, a banner still selling a lifetime pass, and docs that describe rlimits and copy-on-write instead of the namespace jail that actually exists. For a security tool, an honest failure state matters as much as the isolation.

**Enhancements.**
- **Capsule receipt.** Have the server return a real SHA-256 over `{command, exit_code, stdout, stderr, fs_diff}` and show the same receipt in `:8105`, Studio, and the CLI `--json`.
- **Policy presets in the API** (`strict`, `net-egress`, `build`) instead of raw `allow_network`/`allowed_env`, with operator-level ceilings in `~/.config/agent-capsule-jail/policy.json`.
- **Studio live bridge.** A "Run in real enclave" toggle beside the worker demo, using a pasted token stored in `sessionStorage` only.
- **cgroup v2 scope** (`systemd-run --user --scope -p MemoryMax= -p TasksMax= -p CPUQuota=`) when available, for real memory and PID accounting.

**Appreciation.** Token storage at `0600` with `hmac.compare_digest`, the explicit `CAPSULE_ALLOW_UNSANDBOXED` opt-in, a capsule that cannot reach loopback unless asked, and a 0.14 s cold start with a 23 MB footprint make a solid base. The `v2` pass is mostly about making every surface report what the engine really does.


---

## 6. v2 Remediation & Re-Audit Verification (`v2.6.0`)

| Field | Value |
| :--- | :--- |
| **Remediation Window (EST / UTC)** | `2026-11-25 22:44:11 EST` → `2026-11-25 23:03:00 EST` (`2026-11-26 03:44:11 UTC` → `04:03:00 UTC`) |
| **Target Release Version** | **`v2.6.0`** unified across `package.json`, `pyproject.toml`, `__init__.py`, `server.py`, `cli.py`, CLI wrapper, TUI, `toolsData.js`, `public/api/tools.json`, UI badge, and `banner.png` |
| **Automated Test Suites** | `agent-capsule-jail`: **`71 passed in 6.83s`** (`+31` new v2 security/policy/MCP/rusage tests) · `zoth-studio-v2`: `npm run build` + `/opt/zoth-studio/dist/` sync + `npm test` (**`37/37` routes hydrated, `0` console errors**) · `zoth-os`: **`12 passed in 4.26s`** |
| **Secret & Path Scan (`gitleaks`)** | `zoth-studio-v2`: **`no leaks found`** (`68.47 MB`) · `zoth-os`: **`no leaks found`** (`552.70 MB`) |
| **Temp Daemon Cleanup** | Temporary `:8105` server terminated cleanly (`PORT_8105_IDLE_CONFIRMED`) |
| **Final Verdict** | **`PASS`** — **`9.52 / 10`** (**`+3.84`** vs `5.68 / 10` baseline) |

### Before vs After 5-Level Scorecard

| Level | Focus Area | Baseline (`v1`) | Post-Remediation (`v2.6.0`) | Delta | Verdict |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **L1** | **System & Security** (bwrap, cgroup `TasksMax`, CORS/Host, CLI/TUI/MCP, Systemd, Chroot) | `5.6 / 10` | **`9.6 / 10`** | `+4.0` | **`PASS`** |
| **L2** | **User & Workflow** (Honest Error States, SHA-256 Receipts, Studio Live `:8105` Bridge) | `5.4 / 10` | **`9.5 / 10`** | `+4.1` | **`PASS`** |
| **L3** | **Engineer & Code Quality** (`os.wait4` rusage, OOM Classification, Zero-Egress, 71 Tests) | `5.8 / 10` | **`9.6 / 10`** | `+3.8` | **`PASS`** |
| **L4** | **UI, Visual & Accessibility** (New `1200×630` Banner, Editorial Ivory Light + Obsidian Dark, Mobile) | `6.0 / 10` | **`9.5 / 10`** | `+3.5` | **`PASS`** |
| **L5** | **Docs, Copy & Readability** (Real MCP Schemas, Accurate `bwrap` & `local-daemon` Docs, Attribution) | `5.6 / 10` | **`9.4 / 10`** | `+3.8` | **`PASS`** |
| — | **Composite** | **`5.68 / 10`** | **`9.52 / 10`** | **`+3.84`** | **`PASS`** |

### Verified Live Fixes & Observed Evidence

1. **L1 Security, Isolation & Packaging (`5.6 → 9.6 / 10`)**:
   - `GET /` with `Origin: http://localhost:9999` → **`0`** `Access-Control-Allow-Origin` headers (eliminates cross-port `<meta name="capsule-token">` exfiltration).
   - `OPTIONS /api/exec` with `Origin: http://127.0.0.1:8105.example.invalid` → **`403`**; `Origin: https://example.invalid` → **`403`**; `GET /api/stats` with foreign `Host: evil.example.invalid` → **`403`**.
   - Input validation & traversal hardening: `GET /api/capsules?limit=abc` → **`400`**, `POST /api/exec` body `[1]` → **`400`**, `GET /../server.py` (`--path-as-is`) → **`404`** (`Path.is_relative_to()`).
   - Policy gates: `POST /api/exec` with `allow_network: true` → **`403`** unless operator sets `CAPSULE_ALLOW_NETWORK=1`; `SENSITIVE_PATTERNS` enforced even on `allowed_env`; per-capsule `systemd-run --user --scope -p TasksMax=<max_procs+2> -p MemoryMax=` caps forked children strictly (`test_max_procs_enforced_per_capsule` passes with `forked <= 16`).
   - Unified `v2.6.0` CLI wrapper & live `agent-capsule-jail-tui` (`--once` / `--json`, zero `math.sin()` / `-14.0 LUFS` boilerplate) verified bit-identical (`sha256sum`) across `/usr/local/bin`, `~/.local/bin`, and `~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin/` (with consistent symlinks for `agent-capsule` & `zoth-capsule-jail`).
   - Real zero-dependency stdio MCP server (`src/agent_capsule_jail/mcp_server.py`, `agent-capsule-jail mcp`) verified via JSON-RPC `initialize` + `tools/list` + `tools/call` → `['capsule_jail_exec', 'capsule_jail_status']`.
   - Hardened `agent-capsule-jail.service` (`NoNewPrivileges=yes`, `ProtectSystem=strict`, `PrivateTmp=yes`, `KillMode=control-group`), synced chroot `/opt/agent-capsule-jail`, deleted 72 unused `gpu-*` assets (~45 MB), fake `public/api/*`, `capsule_jail.log`, `public/og-banner.jpg`, and `serve:public`.
2. **L2 & L3 Execution Integrity, Per-Run rusage & Tests (`5.4 → 9.5`, `5.8 → 9.6 / 10`)**:
   - Removed simulated-execution fallback on daemon error paths (`public/capsule_engine.js`) — `401`/`403`/`400` render honest `ERROR` states. Dynamic `/api/health` detection replaces hardcoded `port === "8105"`.
   - Added `--as-pid-1` + `os.wait4()` per-capsule CPU/RSS accounting (eliminating cumulative `RUSAGE_CHILDREN` drift) and fixed `MemoryError` → `status: "oom_killed"`, `memory_exceeded: true`.
   - Server computes real 64-hex `receipt_sha256` over `{capsule_id, command, exit_code, stdout, stderr, fs_diff}` (verified `len == 64` live on `POST /api/exec`) and reports honest `flight_recorder_dispatched`.
   - Upgraded `AgentCapsuleJailGodModeTool.jsx` to probe `:8105/api/health`, run real enclave commands via `POST /api/exec` (`sessionStorage`-only token), and clearly label offline Browser JS Worker preview; removed stale `'edge-forge'` alias (`RealToolWorkspacePage.jsx`), removed Google Fonts CDN for true zero-egress, and hardened `electron/main.cjs`.
3. **L4 & L5 Dual-Theme Visual Verification & Documentation Parity (`6.0 → 9.5`, `5.6 → 9.4 / 10`)**:
   - Replaced paywall-tainted `banner.png` with a new `1200×630` obsidian-gold PNG (`public/assets/banner.png`, visually inspected via `read_file` — zero pricing/paywall copy, accurate `v2.6.0` & `bwrap` tags).
   - Added complete Editorial Ivory Light Mode + Obsidian Dark Mode (`?theme=light|dark`, `prefers-color-scheme`, toggle button) + `?embed=1` Studio embed mode + 2×2 mobile/tablet stat grids + `>= 44px` tap targets + tabular numerals.
   - Captured and visually inspected 12 fresh screenshots (`/tmp/whiteboard-audit-005-v2/{8105-dark,8105-light,studio-light,studio-dark}/*.jpg`) via `read_file`: **`overflowPx === 0`, `errors === []`, `imgsMissingAlt === 0`** across all 12 viewports.
   - Updated `README.md`, `toolsDocumentation.js`, `toolsData.js`, `workstations.js`, `public/api/tools.json`, `ToolMotionShowcase.jsx`, `public/sitemap.xml`, and CLI `--help` to reflect `bwrap`, `local-daemon`, real MCP schemas, and `Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform`.
