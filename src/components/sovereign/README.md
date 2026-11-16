# @zoth/ui (Sovereign components)

The shared UI kit for every Zoth Studio tool and page. **Check here before you write
a new card, code block, copy button, table, or support link.**

```js
import {
  SovereignWorkstationShell, SovereignCard, SovereignCodeBlock,
  useCopy, downloadJson, STRIPE_COFFEE_URL, SOLANA_TIP_ADDRESS,
} from '../sovereign';
```

You can see every component live, in light and dark mode, at **`/ui-kit`** (`src/pages/UiKitPage.jsx`).
The matching zero-build HTML/CSS/JS version is `~/NullAITech/zoth-ui-kit` (`zoth-ui.css` + `zoth-ui.js`).

## Never hand-roll these

| Instead of writing… | Use |
|---|---|
| `navigator.clipboard.writeText(...)` + `setTimeout(setCopied)` | `const { copied, copy } = useCopy()`. `copy(text, key)` supports many buttons from one hook, cleans up on unmount, and falls back to a hidden textarea on plain http. |
| `new Blob` + `createObjectURL` + `<a download>` | `downloadText(str, name, mime)`, `downloadJson(obj, name)`, `toCsv(rows, cols)` |
| Hardcoded Stripe / Solana strings | `STRIPE_COFFEE_URL`, `SOLANA_TIP_ADDRESS`, or the whole `<SovereignSupportBar />` |
| A `<Paper>` + `<pre>` with Copy/Download buttons | `<SovereignCodeBlock code filename />` |
| `<Stack direction="row">` for chips/buttons | `<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>`, which wraps cleanly at 390px |
| An extra Quickstart dialog | `tutorialSteps` prop on `SovereignWorkstationShell` |

## Components (29)

### Layout & primitives (`SovereignPrimitives.jsx`, `SovereignWorkstationShell.jsx`)
| Component | Key props | Use for |
|---|---|---|
| `SovereignWorkstationShell` | `id, title, subtitle, category, version, variant, metrics[], actions[], status, tutorialSteps[], leftPane, rightPane, leftCols=5, rightCols=7, bottomPane` | A full tool page: support bar, header, canvas band, KPI strip, action bar, and split panes. **Start new tools here.** |
| `SovereignCard` | `index, eyebrow, title, subtitle, badge, right, accent, ticks` | Any bento panel with corner ticks |
| `SovereignKpiStrip` | `items=[{label,value,unit,status,accent}]` | A row of 1–4 metrics |
| `SovereignCodeBlock` | `title, badge, code, filename, maxHeight` | Output or export artifacts (Copy and Download built in) |
| `SovereignSupportBar` | `label, compact` | Open-access strip with Coffee and Solana tip |
| `SovereignActionBar` | `actions=[{label,onClick,href,primary,icon,accent}], status` | 44px action buttons plus a status chip |
| `SovereignStatusPill` | `status: online/offline/standby/syncing, label, port, pingMs, compact, accent` | Real-time daemon & port telemetry pill with pulse beacon |
| `SovereignBand` | `seed, variant, eyebrow, caption, height` | Animated canvas header. Variants: `braille-orbit`, `bayer-field`, `scanline-grid`, `particle-orbit`, `hex-lattice`, `waveform-harmonics` |

### Widgets (`SovereignWidgets.jsx`)
| Component | Key props | Use for |
|---|---|---|
| `SovereignPresetBar` | `presets=[{id,label,badge}], activeId, onSelect, onUploadText, onReset` | Sample inputs plus local file upload (`onUploadText({name,size,text})`) |
| `SovereignGauge` | `value, max, label, unit, status, thresholds={warn,danger}, invertThresholds` | Radial score or load meter |
| `SovereignSparkline` | `data[], title, unit, threshold, thresholdLabel` | Trend line with an optional warning line |
| `SovereignDataTable` | `columns=[{key,label,mono}], rows[], title, eyebrow, filename` | Searchable table with CSV and JSON export |
| `SovereignKeyValueGrid` | `items=[{label,value,badge,mono,copyable}], cols` | Spec sheets and metadata |
| `SovereignAlertBanner` | `severity: info/success/warning/error, title, message, actionLabel, onAction` | Callouts |
| `SovereignFaqAccordion` | `items=[{question,answer,tag}], defaultOpenIndex` | In-app docs and FAQs |
| `SovereignJsonTree` | `data, title, initialDepth, searchable, copyable, maxHeight, accent` | Collapsible, syntax-highlighted, searchable JSON/AST inspector |
| `SovereignFileDropzone` | `onFilesLoaded, accept, multiple, maxSizeMb, title, subtitle, accent` | In-browser drag & drop file processor with auto text/binary parsing |
| `SovereignMediaHUD` | `src, title, subtitle, duration, bars, accent, onPlayStateChange` | Audio player, procedural waveform engine & media telemetry |

### Blocks (`SovereignBlocks.jsx`)
| Component | Key props | Use for |
|---|---|---|
| `SovereignHeroSection` | `eyebrow, badge, title, highlight, subtitle, primaryAction, secondaryAction, trustItems[]` | Landing or product hero |
| `SovereignFeatureGrid` | `items=[{index,tag,icon,title,desc,metric,footer,accent}], cols` | Capability cards |
| `SovereignDiffViewer` | `beforeText, afterText, beforeLabel, afterLabel, viewMode` | Converters and migrations (LCS diff, split or unified view) |
| `SovereignTimeline` | `items=[{time,title,status: pass/warn/fail/info,duration,detail,mono}]` | Audit and pipeline traces |
| `SovereignStepWizard` | `steps=[{id,label,badge,summary}], activeStep, onStepChange` (controlled or uncontrolled) | Guided multi-step flows |
| `SovereignFilterBar` | `search, onSearchChange, categories[], activeCategory, sortOptions[], totalCount, filteredCount, onReset` | Toolbar above any list |
| `SovereignStatComparison` | `items=[{label,baseline,current,unit,max,better: 'lower'/'higher'}]` | Before/after benchmarks |
| `SovereignTerminalLog` | `logs=[{ts,level,source,message}], onClear, maxHeight` | Live event streams with level filter and copy |
| `SovereignPromptBox` | `value, onChange, onSubmit, onClear, loading, models[], systemPrompt, temperature, accent` | AI prompt & agent directive dispatch deck with shortcut execution |

### Typography (`typography.jsx`)
`SovereignEyebrow` (mono provenance line), `SovereignSectionHead`, `SovereignLede`, `SovereignMeta`,
`SovereignRule`, plus the `eyebrowSx / titleSx / ledeSx / metaSx` style objects.

### Tokens & utilities
`SOV` palette, `rgba()`, `MONO`, `DISPLAY`, `bandAccent(seed)`, `resolveModeAccent(accent, isDark)`
(darkens neon accents so they stay readable on Ivory light mode), and `copyText`, `downloadText`,
`downloadJson`, `toCsv`, `useCopy` from `hooks.js`.

## Generating new projects

```bash
zoth-scaffold list                                    # everything above, as JSON with --json
zoth-scaffold studio-tool my-tool --archetype auditor --variant hex-lattice   # React tool in src/components/tools/
zoth-scaffold web my-tool --archetype diff-converter  # standalone Netlify app (HTML + zoth-ui)
zoth-scaffold site my-product --archetype landing     # product website
zoth-scaffold audit ~/NullAITech/my-tool --json       # 8-point guardrail check (SEO graph, robots, sitemap, netlify, support links, viewport…)
```

Archetypes: `workstation`, `auditor`, `diff-converter`, `landing`.

## Rules for the kit itself
- Everything must be SSR-safe. Never touch `window`, `navigator`, or `document` at import time; `npm run build` prerenders 150 routes.
- Every new export goes into `index.js`, this README, and a tab in `/ui-kit`.
- Touch targets are at least 44px. Verify both themes at 390, 820, and 1440 with `capture.mjs`.
