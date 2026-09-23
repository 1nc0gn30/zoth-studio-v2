# Zoth Studio v2 — Session Handoff Note

> Written 2026-09-22. For the next session: read this first, then check live state
> (git status, running dev server, subagent transcripts) before acting.

## Where things live
- **Zoth Studio v2 app** (React + MUI + Vite): `~/zoth-studio-v2/`
  - Git repo root = `zoth-studio-v2/` itself (branch `main`, NO `origin` remote — local-only).
  - Dev server: `http://127.0.0.1:3000` (Vite). Started via `npm run dev` or `node ./bin/zoth.js up`.
  - Build: `npm run build` (passes). Do NOT run heavy builds on this laptop per house rule.
- **Original Zoth Studio** (static hub, live at zoth.nullai.tech): `~/zoth-studio/core-app/public/`
  - This is the SOURCE of mascot/pet/brand media assets.
- **Micro-repos** (24 cloned + themed): `~/zoth-micro-repos/`
  - See `README-ZOTH-THEME.md` there. All 24 committed with Zoth gold/void theme.
  - Repos live under GitHub user `1nc0gn30` (NOT the NullAITech org). `azoth-local-agent` has NO GitHub repo (local-only).

## Current task (COMPLETE as of commit 2a85b6f)
User asked to: (1) make light/dark mode look good everywhere with each page having a UNIQUE gold glow, (2) add expandable read-more/learn-more to every tool card, (3) make each tool's interface look/work great, (4) grab media assets from original zoth folder for pets/mascots / 21 swarm.

### DONE — committed 2a85b6f
- **All 13 pages + 10 shared components theme-aware** (useTheme + theme.palette). Cards/panels go dark in dark mode. Verified: all 12 routes render dark cards (rgb(11,11,18)) on void body in dark mode, no overflow.
- **Unique gold glow per page** (hero radial, top-edge, card hover, search focus, sidebar accent, equation glow — distinct per page).
- **ToolsPage read-more**: every tool card has expandable Read more / Show less toggle. Verified working.
- **SwarmPage**: 21 pantheon agents as a card grid with mascot images. Verified: 23 images load, 0 broken.
- **Mascot assets** copied from original zoth core-app into `public/pets/` (20 `*-neon.jpg`) + `public/mascot/` (antigravity/grok/hermes). `pantheon.js` has `img` per agent.
- **Fixed ErrorBoundary**: the Wave-2 agent used `withTheme` from `@mui/material/styles` which does NOT exist in MUI v5 and crashed the WHOLE app (body transparent, no cards). Replaced with a proper class boundary using static gold/void colors (it sits OUTSIDE ThemeProvider in main.jsx, so it can't use useTheme).

### Remaining known console warnings (pre-existing, NOT crashes, don't affect rendering)
- `React does not recognize the InputProps/SelectProps prop` — MUI/React dev-mode warnings in ToolsPage/MemoryPage/AdytumPage search/select fields.
- `Received true for a non-boolean attribute paragraph` — DocsPage.
These were present before this work. Optional cleanup if desired.

### NOT DONE / NEXT
- v2 repo still has NO `origin` remote (local-only). User will connect to NullAITech GitHub later.
- Micro-repos (24) themed + committed separately in `zoth-micro-repos/` (see its README-ZOTH-THEME.md).

## The core problem being fixed
Pages hardcode light hex colors in `sx` props (e.g. `bgcolor '#FFFFFF'`, `'#FCFCFD'`, `'#FEF9E7'`, text `'#101828'`, `'#475467'`), so in dark mode the body goes void but cards stay light (`rgb(252,252,253)`). Fix = make every page theme-aware via `useTheme()` + `theme.palette.*`, with a UNIQUE gold glow per page (distinct radial/edge glows).

## Key conventions / house rules (from skills)
- **Max 3-4 concurrent subagents** (Nous API 429s beyond that). Batch by FILE ownership — never two agents on one file.
- **Never run heavy local builds** (cargo/gradle/npm install) on this machine.
- **Verify subagent work yourself** — render with Python Playwright (headless Chromium, `args=["--no-sandbox"]`) against 127.0.0.1. The browser tool refuses private addresses; Playwright from a script works.
- **Never git commit/branch/stash/checkout** in subagent briefs; another agent (git author `1nc0gn30`) commits under you — check `git status`/`git log` before AND after work.
- **Reuse before inventing** — pull assets from `core-app/public/` (mascots, brand, open-source-library) rather than hand-rolling.
- User prefers: sci-fi/scanner-grade, non-bland, animated neon, live-data-reflecting UI, gold-on-void. Apps should include discoverable GitHub links (star/fork/issues/PR).
- Local build + browser verify first; deploy only on explicit request.

## Verification commands
```bash
cd ~/zoth-studio-v2
npm run build          # must pass
# render check (Playwright): set localStorage zoth-studio-theme = light then dark, reload, check card bg + console errors
```

## Notes / gotchas
- The v2 repo has NO `origin` remote — it's local-only. User will connect to NullAITech GitHub later and hand over login.
- `azoth-local-agent` (25th tool) has no GitHub repo — local-only at `~/azoth-local-agent/`.
- Micro-repo branch note: promptmaster-studio, jwt-inspector-guard, payload-entropy-studio, audiocipher-stego-engine, datamosh-glitch-studio are on `master`; all others `main`.
- The `_zoth-theme/` dir in zoth-micro-repos holds the shared theme CSS + injector script (idempotent, targets LAST `</head>`/`</body>` to avoid JS template strings).
