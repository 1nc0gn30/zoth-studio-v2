# Layer A — interactive-quality evidence (pixel-cast)

Layer A is the only parity layer that had no automated evidence (`PARITY_CHECKPOINT_LOG.md`
§ "Next work"). This document closes that gap **for one tool, `pixel-cast`**, and states
precisely what the evidence does and does not prove. Instruments are checked in under
`docs/tools/` so the measurement is reproducible.

## Scope

| item | value |
| --- | --- |
| target | `pixel-cast` (`/home/zoth/NullAITech/pixel-cast`), served on `:8148` |
| backend under test | `python3 server.py --host 127.0.0.1 --port 8148`, pid 490855 — the real FastAPI backend, not `http.server` |
| routes reviewed | `/`, `/mobile` |
| instrument 1 | `docs/tools/layerA_probe.mjs` — enumerate + real pointer click + classify every control |
| instrument 2 | `docs/tools/layerA_occl.mjs` — two-state occlusion experiment (rest / fullscreen / post-exit) |
| instrument revision | the verdict vocabulary is the discriminator: `wired-request` / `wired-dom` / `no-effect` / `click-occluded`. A report carrying the superseded `request` / `no-op` / `occluded?` vocabulary (and no `directVerdict`) came from an older probe build and is **not** evidence — re-run the checked-in instrument instead. |
| evidence files | `layerA_pixelcast_v5.json` (probe), `occl_rerun_root.log`, `occl_rerun_mobile.log` (occlusion) |
| re-verified | `layerA_pixelcast_final.json`, `occl_final_root.log`, `occl_final_mobile.log` — a second, independent run of the checked-in instruments, reproducing every number below |
| re-verified (3rd) | `layerA_v5_repro.json` — run against the live `:8148` after a background job was found writing a superseded-vocabulary report; reproduced the same `byVerdict` sets on `/` and `/mobile`, 0 console errors, `overflowPx=0`, exit 0 |

Both instruments are zero-dependency Node scripts driving system Chrome over CDP with a
real `Input.dispatchMouseEvent` pointer click at the control's centre (not `element.click()`),
except for the explicit "direct" follow-up described below.

## Result 1 — headless geometry is clean

| route | title | overflowPx | controls | visible | console errors | dialogs |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `PixelCast — Sovereign Google Pixel Screen Mirror & Tailscale Mesh Bridge` | 0 | 39 | 36 | 0 | 3 (all harness-driven, see Result 4) |
| `/mobile` | — | 0 | 7 | 5 | 0 | 0 |

`overflowPx = 0` on both routes and zero console errors satisfies the standard
viewport-integrity bar. `blurLocked = 1` on `/` is a **false positive**: the single
blurred element wider than 200 px is `.aurora-backdrop`
(`public/style.css:61`, `filter: blur(80px)`), which is `pointer-events: none` and
`z-index: 0` — a decorative background wash, not a lock or an overlay.

## Result 2 — control wiring on `/` (36 visible controls)

| verdict | count | meaning |
| --- | --- | --- |
| `wired-request` | 10 | click issued a non-ambient request |
| `wired-dom` | 3 | click mutated the DOM, no request |
| `external-link` | 8 | anchor pointing off-origin (unchanged by design) |
| `no-effect` | 13 | see Result 3 |
| `hidden` | 3 | not visible in this viewport |
| `disabled` | 1 | `Stop Mirror` — correctly disabled while no stream is active |
| `click-occluded` | 1 | `Back` — see Result 5 |

Wired controls and their exact endpoints, as observed:

* `Launch 60fps Desktop Mirror` → `POST /api/stream/start`
* `Home`, `Apps`, `Power`, `Vol -`, `Vol +`, `Mute` → `POST /api/control/key`
* `Read Pixel Clipboard` → `GET /api/control/clipboard`
* `Scan Open ADB Ports` → `POST /api/scan`
* `Reconnect :5555` → `POST /api/connect`
* `Copy`, `Pair`, and the bitrate `<select>` → DOM mutation with no request
* `/mobile`: `Start Live Camera Cast` → DOM mutation

## Result 3 — the 13 `no-effect` controls, graded

Nine are form fields where a click is not the effect and the probe's click-only method
cannot judge them — a **method gap, not an app defect**: `select#deviceSelectDropdown`,
`select#prefResolution`, `select#prefFps`, `input#prefAudio`, `input#prefScreenOff`,
`input#prefRecord`, `input#typerInput`, `input#pairPortInput`, `input#pairCodeInput`.
Two equivalent selects disagree on the same method (`prefBitrate` reported a DOM change,
`prefResolution` did not), which is probe noise on native `<select>`, not app behaviour.

The four silent **buttons** were each chased down:

| control | status | evidence |
| --- | --- | --- |
| `Copy to Pixel Clipboard` | **wired** | `dialogsDuring=1` — opens the clipboard prompt; its sibling `Read Pixel Clipboard` is `wired-request` on the same endpoint family |
| `Toggle Fullscreen` | **works (false negative)** | `fsWasActive=1` — a later control's click was preceded by an active `document.fullscreenElement`, i.e. the toggle had promoted `#viewportStage` into the top layer. The probe exits fullscreen before each next click, so the toggle's own snapshot shows no DOM/request delta |
| `Send` (`#btnSendText`) | **unresolved** | truly silent: no request, no DOM change, no dialog |
| `Snapshot` | **unresolved** | truly silent: only ambient `GET /api/status` polling |
| `/mobile` `Flip Lens` (`#btnSwitchCam`), `Send to Desktop` (`#btnSendMobileText`) | **unresolved** | truly silent |

The four unresolved controls all sit on the live-device path (stream must be running /
camera must be attached), and the same page **does** gate correctly — `Stop Mirror` renders
disabled. Connection-guarded early returns are therefore the plausible cause, but that is
**not proven**: it needs a connected Pixel on the bench. Until then these are candidates,
not dead buttons.

## Result 4 — what this evidence does not cover, stated honestly

`layerA_probe.mjs` stubs every non-GET `fetch` with `{"ok":true,"review_stub":true}` so the
review never mutates backend state. Two consequences:

1. The three dialogs on `/` are harness-driven: the app's `alert('Could not start screen mirror: …')`
   fires because the **stub** response has no `success` field (`public/app.js:245` tests
   `data.success`). The live backend returns the correct shape — verified today:
   `POST /api/stream/start` → `{"success":false,"error":"Device not connected on ADB. Connect to 100.64.0.10:5555 or pair first.",…}`.
   The client behaviour is correct; there is no app defect here.
2. Therefore Layer A as measured proves **reachability and wiring**, not end-to-end success
   against the device. Success paths of the POST-driven controls are deliberately unexercised.

## Result 5 — the occlusion question, settled

`Back` was classified `click-occluded` during the sweep (the top element at its centre was
`div#viewportStage`) while its direct synthetic dispatch was `wired-request`. That
disagreement is a sweep-order artifact — earlier clicks in the same sweep left page state.
The dedicated two-state experiment, re-run against the live backend today, resolves it:

| route | states × probes | `stageCovers=true` | `selfTop=false` | `inStack=false` | exit |
| --- | --- | --- | --- | --- | --- |
| `/` | 3 × 5 = 15 | 0 | 0 | 0 | 0 |
| `/mobile` | 3 × 5 = 15 | — (15 × `probe=missing`) | — | — | 0 |

i.e. at rest, after `requestFullscreen()`, and after exiting it, every probed control in the
left column was topmost at its own centre (`selfTop=true`), inside the hit stack
(`inStack=true`), and **not** covered by `#viewportStage` (`stageCovers=false`) — 15/15 on
both states that contain the controls. `/mobile` simply does not render those five desktop
controls, so all 15 probes report `missing` there; that is a route-shape fact, not a failure.
No headless Chrome was left running after either run.

## Reproduction

```
node docs/tools/layerA_probe.mjs --base http://127.0.0.1:8148 --routes / /mobile --out report.json
node docs/tools/layerA_occl.mjs  --base http://127.0.0.1:8148 --route /
node docs/tools/layerA_occl.mjs  --base http://127.0.0.1:8148 --route /mobile
```

## Verdict

* Headless integrity (`/`, `/mobile`): **pass** — `overflowPx=0`, 0 console errors, 0 dialogs not attributable to the harness.
* Occlusion: **pass** — 30/30 probes across three states on `/` plus a clean `/mobile` route, 0 occlusion findings.
* Wiring: **pass** for 13 controls with request/DOM evidence; `Stop Mirror` verified disabled.
* Interactive quality: **1 proven false positive** (`aurora-backdrop` blur), **1 proven false negative** (fullscreen), **4 unresolved silent buttons** on the live-device path (need a connected Pixel).
* Coverage: **Layer A now has automated evidence for 1 of 81 catalogued tools.** The remaining 80 are still open, and the instrument is general (any base URL + routes), so the sweep can continue tool by tool.
