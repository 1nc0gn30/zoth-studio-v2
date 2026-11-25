import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { HeroReveal, HeroItem, GlowLine } from '../components/MotionReveal';
import {
  SOV,
  VARIANTS,
  VARIANT_META,
  SovereignBand,
  SovereignCard,
  SovereignKpiStrip,
  SovereignCodeBlock,
  SovereignSupportBar,
  SovereignWorkstationShell,
  SovereignPresetBar,
  SovereignGauge,
  SovereignSparkline,
  SovereignDataTable,
  SovereignKeyValueGrid,
  SovereignAlertBanner,
  SovereignFaqAccordion,
  SovereignHeroSection,
  SovereignFeatureGrid,
  SovereignDiffViewer,
  SovereignTimeline,
  SovereignStepWizard,
  SovereignFilterBar,
  SovereignStatComparison,
  SovereignTerminalLog,
  SovereignStatusPill,
  SovereignJsonTree,
  SovereignFileDropzone,
  SovereignMediaHUD,
  SovereignPromptBox,
  resolveModeAccent,
} from '../components/sovereign';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const ACCENT_OPTIONS = [
  { label: 'Aurum Gold (#D4AF37)', value: SOV.gold },
  { label: 'Sovereign Emerald (#34D399)', value: SOV.emerald },
  { label: 'Sky Cyber (#38BDF8)', value: SOV.cyber },
  { label: 'Crimson Alert (#EF4444)', value: SOV.crimson },
  { label: 'Quantum Violet (#C084FC)', value: '#C084FC' },
];

const ARCHETYPE_OPTIONS = [
  { label: 'Workstation (Telemetry)', value: 'workstation' },
  { label: 'Auditor (Policy + CSV)', value: 'auditor' },
  { label: 'Diff Converter (Before/After)', value: 'diff-converter' },
  { label: 'Landing Site (Hero + FAQ)', value: 'landing' },
];

const TELEMETRY_PRESETS = [
  {
    id: 'nominal',
    label: 'Nominal Node',
    badge: '42%',
    data: { load: 42, series: [28, 34, 38, 41, 39, 44, 42, 40, 42] },
  },
  {
    id: 'burst',
    label: 'Burst Queue',
    badge: '74%',
    data: { load: 74, series: [42, 51, 63, 68, 72, 79, 71, 75, 74] },
  },
  {
    id: 'saturate',
    label: 'Peak Load',
    badge: '91%',
    data: { load: 91, series: [66, 74, 81, 86, 89, 93, 90, 92, 91] },
  },
];

const AUDIT_COLUMNS = [
  { key: 'exportName', label: 'COMPONENT', mono: true },
  { key: 'layer', label: 'LAYER' },
  { key: 'runtime', label: 'RUNTIME', mono: true },
  { key: 'status', label: 'PARITY' },
];

const AUDIT_ROWS = [
  { exportName: 'SovereignWorkstationShell', layer: 'App Layout', runtime: 'React + SSR', status: 'READY' },
  { exportName: 'SovereignCard', layer: 'Bento Panel', runtime: 'React + CSS', status: 'READY' },
  { exportName: 'SovereignKpiStrip', layer: 'Metrics Row', runtime: 'React + CSS', status: 'READY' },
  { exportName: 'SovereignBand', layer: 'Canvas Engine', runtime: '6 Renderers', status: 'READY' },
  { exportName: 'SovereignPresetBar', layer: 'Controls', runtime: 'Client File API', status: 'READY' },
  { exportName: 'SovereignGauge', layer: 'SVG Telemetry', runtime: 'Zero-Dep SVG', status: 'READY' },
  { exportName: 'SovereignSparkline', layer: 'SVG Trend', runtime: 'Zero-Dep SVG', status: 'READY' },
  { exportName: 'SovereignDataTable', layer: 'Tabular Data', runtime: 'Search + CSV', status: 'READY' },
  { exportName: 'SovereignKeyValueGrid', layer: 'Spec Sheet', runtime: '1-Click Copy', status: 'READY' },
  { exportName: 'SovereignAlertBanner', layer: 'Semantic Banner', runtime: '4 Severities', status: 'READY' },
  { exportName: 'SovereignFaqAccordion', layer: 'Disclosure', runtime: 'AEO-Ready', status: 'READY' },
  { exportName: 'SovereignHeroSection', layer: 'Site Hero Block', runtime: 'Dual CTA + Trust', status: 'READY' },
  { exportName: 'SovereignFeatureGrid', layer: 'Site Bento Grid', runtime: 'Responsive Grid', status: 'READY' },
  { exportName: 'SovereignDiffViewer', layer: 'Code Transform', runtime: 'LCS Split/Unified', status: 'READY' },
  { exportName: 'SovereignTimeline', layer: 'Audit Flow', runtime: 'Semantic Nodes', status: 'READY' },
  { exportName: 'SovereignStepWizard', layer: 'Workflow Guide', runtime: 'Controlled/Auto', status: 'READY' },
  { exportName: 'SovereignFilterBar', layer: 'Query Toolbar', runtime: 'Search + Pills', status: 'READY' },
  { exportName: 'SovereignStatComparison', layer: 'Benchmark Bars', runtime: 'Auto Delta %', status: 'READY' },
  { exportName: 'SovereignTerminalLog', layer: 'Log Stream', runtime: 'Severity Filter', status: 'READY' },
  { exportName: 'SovereignStatusPill', layer: 'Telemetry Pill', runtime: 'Pulse CSS', status: 'READY' },
  { exportName: 'SovereignJsonTree', layer: 'AST Inspector', runtime: 'Recursive Tree', status: 'READY' },
  { exportName: 'SovereignFileDropzone', layer: 'Drag & Drop', runtime: 'In-Browser File API', status: 'READY' },
  { exportName: 'SovereignMediaHUD', layer: 'Audio & Media HUD', runtime: 'Waveform Canvas', status: 'READY' },
  { exportName: 'SovereignPromptBox', layer: 'AI Dispatch Deck', runtime: 'Model + Shortcut', status: 'READY' },
];

const SYSTEM_CONTRACT_ITEMS = [
  { label: 'PACKAGE SCOPE', value: '@zoth/ui + zoth-ui-kit', badge: 'v3.0.0', mono: true, copyable: true },
  { label: 'THEME MATRIX', value: 'Obsidian Dark · Ivory Light', badge: 'WCAG AA', copyable: false },
  { label: 'CLI GENERATORS', value: 'zoth-scaffold web | site | studio-tool | audit', badge: '4 COMMANDS', mono: true, copyable: true },
  { label: 'VANILLA RUNTIME', value: '/zoth-ui/zoth-ui.css + zoth-ui.js', badge: '6 CANVAS ENGINES', mono: true, copyable: true },
];

const UI_KIT_FAQ = [
  {
    question: 'Why ship both React components (@zoth/ui) and Vanilla drop-ins (zoth-ui-kit)?',
    tag: 'ARCHITECTURE',
    answer:
      'Zoth Studio v2 uses React + MUI with static prerendering, while standalone Netlify micro-apps run zero-build HTML/CSS/JS. Sharing identical design tokens, canvas math, and widget patterns across both keeps every product visually unified without heavyweight wrappers.',
  },
  {
    question: 'How does zoth-scaffold prevent broken mobile views or missing SEO guardrails?',
    tag: 'GUARDRAILS',
    answer:
      'Every generated web tool, product site, and Studio component pre-populates Schema.org JSON-LD (@graph), robots.txt, sitemap.xml, netlify.toml security headers, dual dark/light tokens, 44px touch targets, and the zero-paywall Buy Us a Coffee support bar. Run `zoth-scaffold audit` to verify all 8 checks programmatically.',
  },
  {
    question: 'Are all 29 exports and 6 canvas renderers SSR-safe for Vite static prerendering?',
    tag: 'SSR + STATIC',
    answer:
      'Yes. Canvas initialization, Clipboard API copy buttons, FileReader uploads, and Blob CSV downloads execute exclusively inside event handlers or useEffect hooks—never at module evaluation time.',
  },
];

const FEATURE_PILLARS = [
  {
    index: '01',
    tag: 'ARCHITECTURE',
    icon: '🜂',
    title: 'Zero-Egress Runtime',
    desc: 'Every analyzer, diff engine, and converter runs deterministically inside the browser with zero external telemetry.',
    metric: '0 B EGRESS',
    accent: SOV.gold,
  },
  {
    index: '02',
    tag: 'WORKFLOW',
    icon: '⚡',
    title: '4 CLI Archetypes',
    desc: 'Scaffold workstation, auditor, diff-converter, or landing sites in one command without rewriting CSS or shell boilerplate.',
    metric: '1-CMD BUILD',
    accent: SOV.emerald,
  },
  {
    index: '03',
    tag: 'GUARDRAILS',
    icon: '🛡',
    title: '8-Point Static Audit',
    desc: 'Built-in `zoth-scaffold audit` enforces Schema.org graphs, crawler policies, viewport meta, and zero paywalls.',
    metric: '8/8 VERIFIED',
    accent: SOV.cyber,
  },
];

const WIZARD_STEPS = [
  {
    id: 'scaffold',
    label: 'Pick Archetype',
    badge: 'CLI v3.0',
    summary: 'Choose between workstation, auditor, diff-converter, or landing via `zoth-scaffold --archetype` or the Explorer below.',
  },
  {
    id: 'compose',
    label: 'Compose Blocks',
    badge: '29 EXPORTS',
    summary: 'Drop in pre-styled React blocks (SovereignHeroSection, SovereignDiffViewer, SovereignTimeline) or Vanilla `data-zoth-*` hooks.',
  },
  {
    id: 'audit',
    label: 'Audit & Ship',
    badge: 'ZERO ERRORS',
    summary: 'Run `zoth-scaffold audit . --json` plus multi-viewport `capture.mjs` verification across Obsidian Dark and Ivory Light modes.',
  },
];

const TIMELINE_EVENTS = [
  {
    time: '00:00.1',
    title: 'Loaded Design System Tokens',
    status: 'pass',
    duration: '2 ms',
    detail: 'Obsidian Dark (#05060B) & Editorial Ivory (#FAF8F3) contrast tokens verified.',
  },
  {
    time: '00:00.4',
    title: 'Mounted Deterministic Canvas Engine',
    status: 'info',
    duration: '14 ms',
    detail: '6 pure SSR-safe renderers registered (hex-lattice + waveform-harmonics active).',
  },
  {
    time: '00:01.0',
    title: 'Evaluated Client Guardrail Checks',
    status: 'pass',
    duration: '6 ms',
    detail: 'zoth-scaffold audit ./zoth-ui-kit -> 8/8 checks passing (100%).',
    mono: true,
  },
  {
    time: '00:01.3',
    title: 'Verified Mobile Viewport Flow',
    status: 'pass',
    duration: '18 ms',
    detail: 'overflowPx === 0 across 390px, 820px, and 1440px viewports.',
  },
];

const BENCHMARK_STATS = [
  { label: 'Standalone CSS + JS Footprint', baseline: 210, current: 58, unit: ' KB', max: 220, better: 'lower' },
  { label: 'New Tool Scaffold Time', baseline: 2400, current: 18, unit: ' s', max: 2400, better: 'lower' },
  { label: 'Guardrail Compliance Score', baseline: 62, current: 100, unit: '%', max: 100, better: 'higher' },
];

const INITIAL_LOGS = [
  { ts: '06:50:12', level: 'INFO', source: '@zoth/ui', message: 'Registered 29 React component exports across Primitives, Widgets, and Blocks.' },
  { ts: '06:50:14', level: 'INFO', source: 'renderers', message: 'Activated hex-lattice and waveform-harmonics deterministic engines.' },
  { ts: '06:50:18', level: 'WARN', source: 'enclave', message: 'Offline loopback enforcement active — outbound tracking pixels blocked.' },
  { ts: '06:50:21', level: 'ERROR', source: 'demo-check', message: 'Simulated alert: example failing artifact lacked viewport meta tag (fixed by scaffold).' },
];

const DIFF_DEFAULT_BEFORE = `{
  "service": "legacy-tool",
  "paywall": true,
  "theme": "dark-only",
  "viewport": "desktop-960px",
  "telemetry": "third-party"
}`;

const DIFF_DEFAULT_AFTER = `{
  "service": "zoth-sovereign-tool",
  "paywall": false,
  "support": "buy-us-a-coffee + solana-tip",
  "theme": "obsidian-dark + editorial-ivory",
  "viewport": "mobile-tablet-desktop-0px-overflow",
  "telemetry": "zero-egress-local"
}`;

const PRIMITIVE_SNIPPETS = {
  SovereignWorkstationShell: {
    title: 'SovereignWorkstationShell',
    badge: 'FULL WORKSTATION',
    filename: 'MyToolWorkstation.jsx',
    desc: 'Assembles SupportBar, Header, Quickstart modal, SovereignBand, KPI strip, Action bar, and 12-col split panes in ~35 lines.',
    code: `<SovereignWorkstationShell
  id="my-tool"
  category="SECURITY"
  title="My Sovereign Tool"
  subtitle="Zero-egress in-browser analyzer."
  metrics={[{ label: 'LATENCY', value: '12 ms', status: 'LOCAL' }]}
  leftPane={<SovereignCard index="01" title="Input">...</SovereignCard>}
  rightPane={<SovereignCodeBlock title="OUTPUT" code={json} />}
/>`,
  },
  SovereignCard: {
    title: 'SovereignCard',
    badge: 'BENTO CONTAINER',
    filename: 'SovereignCardUsage.jsx',
    desc: 'Dual-theme Obsidian/Ivory Bento panel with optional corner reticle ticks, mono index/eyebrow, badge, right slot, and hairline rule.',
    code: `<SovereignCard index="01" eyebrow="DIAGNOSTIC MODULE" title="Entropy Inspector" badge="ZERO EGRESS" accent="#34D399">
  <Typography variant="body2">Adapts cleanly across Dark & Light themes.</Typography>
</SovereignCard>`,
  },
  SovereignKpiStrip: {
    title: 'SovereignKpiStrip',
    badge: 'METRICS ROW',
    filename: 'SovereignKpiStripUsage.jsx',
    desc: 'Responsive 2–4 column KPI metric strip with mono labels, display numbers, units, and semantic status chips.',
    code: `<SovereignKpiStrip
  items={[
    { label: 'THROUGHPUT', value: '1,420', unit: 'tok/s', status: 'NOMINAL', accent: '#34D399' },
    { label: 'EGRESS', value: '0 B', status: 'LOCAL-FIRST', accent: '#D4AF37' },
  ]}
/>`,
  },
  SovereignCodeBlock: {
    title: 'SovereignCodeBlock',
    badge: 'TERMINAL READOUT',
    filename: 'SovereignCodeBlockUsage.jsx',
    desc: 'Scrollable monospaced output block with built-in 1-click Copy and Blob Download controls (44px touch targets).',
    code: `<SovereignCodeBlock title="EXPORT ARTIFACT" badge="JSON-LD" filename="schema.json" code={JSON.stringify(payload, null, 2)} />`,
  },
  SovereignSupportBar: {
    title: 'SovereignSupportBar',
    badge: 'OPEN-ACCESS BAR',
    filename: 'SovereignSupportBarUsage.jsx',
    desc: 'Consistent 100% Free & Open-Access bar linking directly to Buy Us a Coffee (Stripe) and copying the Solana tip address.',
    code: `<SovereignSupportBar label="✦ 100% FREE & OPEN ACCESS · ZERO PAYWALLS" />`,
  },
  SovereignPresetBar: {
    title: 'SovereignPresetBar',
    badge: 'PRESETS + UPLOAD',
    filename: 'SovereignPresetBarUsage.jsx',
    desc: 'One-click sample presets paired with a local-first client-side FileReader uploader and Reset button.',
    code: `<SovereignPresetBar presets={presets} activeId={id} onSelect={onSelect} onUploadText={onUpload} onReset={onReset} />`,
  },
  SovereignGauge: {
    title: 'SovereignGauge',
    badge: 'SVG RADIAL METER',
    filename: 'SovereignGaugeUsage.jsx',
    desc: 'Accessible SVG radial dial with warn/danger threshold color bands, tabular mono readout, and dual-theme contrast.',
    code: `<SovereignGauge value={74} max={100} label="QUEUE PRESSURE" unit="%" status="ELEVATED" thresholds={{ warn: 65, danger: 85 }} />`,
  },
  SovereignSparkline: {
    title: 'SovereignSparkline',
    badge: 'SVG TRENDLINE',
    filename: 'SovereignSparklineUsage.jsx',
    desc: 'Deterministic SVG area sparkline with optional dashed threshold reference line and instant terminal value badge.',
    code: `<SovereignSparkline title="LOCAL QUEUE HISTORY" data={[28, 34, 38, 41, 44, 42]} unit="%" threshold={75} thresholdLabel="WARN 75%" />`,
  },
  SovereignDataTable: {
    title: 'SovereignDataTable',
    badge: 'FILTER + CSV EXPORT',
    filename: 'SovereignDataTableUsage.jsx',
    desc: 'Searchable data table with monospaced column formatting, row count readout, and zero-dependency client-side CSV export.',
    code: `<SovereignDataTable eyebrow="EXPORTS AUDIT" title="@zoth/ui Registry" columns={cols} rows={rows} filename="zoth-ui-registry.csv" />`,
  },
  SovereignKeyValueGrid: {
    title: 'SovereignKeyValueGrid',
    badge: 'SPEC SHEET + COPY',
    filename: 'SovereignKeyValueGridUsage.jsx',
    desc: 'Responsive 1/2/3-column structured metadata grid with status badges, mono styling, and 1-click value copying.',
    code: `<SovereignKeyValueGrid cols={2} items={[{ label: 'PACKAGE', value: '@zoth/ui', badge: 'v3.0.0', mono: true, copyable: true }]} />`,
  },
  SovereignAlertBanner: {
    title: 'SovereignAlertBanner',
    badge: 'SEMANTIC CALLOUT',
    filename: 'SovereignAlertBannerUsage.jsx',
    desc: 'Four semantic severity levels (info, success, warning, error) with high-contrast border stripes and optional 44px CTA action.',
    code: `<SovereignAlertBanner severity="success" title="Local-First Nominal" message="Zero external egress." actionLabel="Simulate Burst" onAction={fn} />`,
  },
  SovereignFaqAccordion: {
    title: 'SovereignFaqAccordion',
    badge: 'AEO / SITE FAQ',
    filename: 'SovereignFaqAccordionUsage.jsx',
    desc: 'Accessible accordion disclosure list styled for tool docs and landing-page FAQ sections.',
    code: `<SovereignFaqAccordion defaultOpenIndex={0} items={[{ question: 'Are widgets SSR-safe?', tag: 'SSR', answer: 'Yes.' }]} />`,
  },
  SovereignHeroSection: {
    title: 'SovereignHeroSection',
    badge: 'HERO BLOCK',
    filename: 'SovereignHeroSectionUsage.jsx',
    desc: 'High-craft product or micro-app hero band with highlighted Celtic Garamond display heading, dual 44px CTAs, and trust strip.',
    code: `<SovereignHeroSection
  eyebrow="ZOTH DESIGN SYSTEM v3"
  badge="ZERO EGRESS"
  title="Ship Sovereign"
  highlight="Web Tools Fast"
  subtitle="Reusable React & Vanilla UI blocks without starting from scratch."
  primaryAction={{ label: 'Jump to Generator', onClick: fn }}
  trustItems={[{ label: 'EXPORTS', value: '29' }, { label: 'PAYWALL', value: 'NONE' }]}
/>`,
  },
  SovereignFeatureGrid: {
    title: 'SovereignFeatureGrid',
    badge: 'CAPABILITY BENTO',
    filename: 'SovereignFeatureGridUsage.jsx',
    desc: 'Multi-column capability card grid inheriting corner ticks, mono index labels, icons, and metric chips.',
    code: `<SovereignFeatureGrid cols={3} items={FEATURE_PILLARS} />`,
  },
  SovereignDiffViewer: {
    title: 'SovereignDiffViewer',
    badge: 'SPLIT / UNIFIED DIFF',
    filename: 'SovereignDiffViewerUsage.jsx',
    desc: 'Client-side LCS line-by-line diff comparator with Split/Unified toggle, +/- line & byte counters, and Copy Transformed button.',
    code: `<SovereignDiffViewer title="CONFIG MIGRATION" beforeText={beforeStr} afterText={afterStr} />`,
  },
  SovereignTimeline: {
    title: 'SovereignTimeline',
    badge: 'AUDIT CHRONOLOGY',
    filename: 'SovereignTimelineUsage.jsx',
    desc: 'Vertical execution/audit step list with semantic node dots (pass/warn/fail/info), duration labels, and optional mono detail text.',
    code: `<SovereignTimeline title="PIPELINE TRACE" items={TIMELINE_EVENTS} />`,
  },
  SovereignStepWizard: {
    title: 'SovereignStepWizard',
    badge: 'STEPPER WORKFLOW',
    filename: 'SovereignStepWizardUsage.jsx',
    desc: 'Multi-step guided workflow bar with linear progress indicator, 44px step buttons, and Previous/Next navigation.',
    code: `<SovereignStepWizard steps={WIZARD_STEPS} />`,
  },
  SovereignFilterBar: {
    title: 'SovereignFilterBar',
    badge: 'SEARCH + FILTERS',
    filename: 'SovereignFilterBarUsage.jsx',
    desc: 'Unified filter toolbar combining live search box, wrap-safe 44px category pills, sort dropdown, count badge, and Reset.',
    code: `<SovereignFilterBar search={q} onSearchChange={setQ} categories={['ALL', 'ARCHITECTURE', 'WORKFLOW']} activeCategory={cat} onCategoryChange={setCat} />`,
  },
  SovereignStatComparison: {
    title: 'SovereignStatComparison',
    badge: 'BENCHMARK BARS',
    filename: 'SovereignStatComparisonUsage.jsx',
    desc: 'Dual track comparison bars showing baseline vs current values with automatic relative improvement percentage chips.',
    code: `<SovereignStatComparison title="BENCHMARKS" items={BENCHMARK_STATS} />`,
  },
  SovereignTerminalLog: {
    title: 'SovereignTerminalLog',
    badge: 'LOG CONSOLE',
    filename: 'SovereignTerminalLogUsage.jsx',
    desc: 'Filterable monospaced log console (`ALL`, `INFO`, `WARN`, `ERROR`) with timestamp, source badge, and 1-click log copy.',
    code: `<SovereignTerminalLog title="LIVE STREAM" logs={logs} onClear={() => setLogs([])} />`,
  },
  SovereignStatusPill: {
    title: 'SovereignStatusPill',
    badge: 'TELEMETRY PILL',
    filename: 'SovereignStatusPillUsage.jsx',
    desc: 'Live daemon & port telemetry pill with animated CSS pulse beacon, port tag, and latency readout.',
    code: `<SovereignStatusPill status="online" label="DAEMON ACTIVE" port={8092} pingMs={14} />`,
  },
  SovereignJsonTree: {
    title: 'SovereignJsonTree',
    badge: 'AST INSPECTOR',
    filename: 'SovereignJsonTreeUsage.jsx',
    desc: 'Collapsible, syntax-highlighted, searchable JSON/AST inspector replacing raw JSON.stringify walls.',
    code: `<SovereignJsonTree title="AST SYNTAX TREE" data={complexPayload} initialDepth={2} />`,
  },
  SovereignFileDropzone: {
    title: 'SovereignFileDropzone',
    badge: 'DRAG & DROP',
    filename: 'SovereignFileDropzoneUsage.jsx',
    desc: 'Zero-dependency in-browser drag & drop file processor with automatic text/binary parsing and size limits.',
    code: `<SovereignFileDropzone onFilesLoaded={(files) => console.log(files)} maxSizeMb={25} />`,
  },
  SovereignMediaHUD: {
    title: 'SovereignMediaHUD',
    badge: 'MEDIA TELEMETRY',
    filename: 'SovereignMediaHUDUsage.jsx',
    desc: 'Audio player, procedural waveform engine & media telemetry with scrubber, speed, and volume controls.',
    code: `<SovereignMediaHUD title="PROCEDURAL SYNTHESIS" duration={180} />`,
  },
  SovereignPromptBox: {
    title: 'SovereignPromptBox',
    badge: 'AI DISPATCH DECK',
    filename: 'SovereignPromptBoxUsage.jsx',
    desc: 'Unified AI prompt, agent orchestration & directive dispatch deck with model selector, tuning, and ⌘↵ shortcut.',
    code: `<SovereignPromptBox value={prompt} onChange={setPrompt} onSubmit={handleExecute} />`,
  },
};

function toPascalComponent(rawSlug) {
  const clean =
    (rawSlug || 'my-tool')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'my-tool';
  return (
    clean
      .split('-')
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') + 'GodModeTool'
  );
}

export default function UiKitPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [bandVariant, setBandVariant] = useState('hex-lattice');
  const [bandCodeMode, setBandCodeMode] = useState(0);
  const [activePrimitive, setActivePrimitive] = useState('SovereignHeroSection');

  const [telemetryPreset, setTelemetryPreset] = useState('nominal');
  const [gaugeValue, setGaugeValue] = useState(42);
  const [sparkSeries, setSparkSeries] = useState([28, 34, 38, 41, 39, 44, 42, 40, 42]);
  const [uploadedNote, setUploadedNote] = useState('');

  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [wizardStep, setWizardStep] = useState(0);
  const [diffSwapped, setDiffSwapped] = useState(false);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  const [slug, setSlug] = useState('zoth-audit-radar');
  const [toolTitle, setToolTitle] = useState('Zoth Audit Radar');
  const [category, setCategory] = useState('Security & Recon');
  const [port, setPort] = useState('8162');
  const [accent, setAccent] = useState(SOV.gold);
  const [archetype, setArchetype] = useState('auditor');
  const [genTab, setGenTab] = useState(0);

  const safeSlug = useMemo(
    () =>
      (slug || 'zoth-audit-radar')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'zoth-audit-radar',
    [slug]
  );

  const filteredPillars = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    return FEATURE_PILLARS.filter((item) => {
      const catOk = filterCategory === 'ALL' || item.tag === filterCategory;
      const qOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [filterCategory, filterSearch]);

  const handleSelectPreset = (preset) => {
    setTelemetryPreset(preset.id);
    setGaugeValue(preset.data.load);
    setSparkSeries(preset.data.series);
    setUploadedNote('');
  };

  const handleUploadTelemetry = ({ name, text, size }) => {
    const nums = (text || '')
      .match(/\d+(\.\d+)?/g)
      ?.map((n) => Math.max(0, Math.min(100, Math.round(Number(n)))))
      .filter((n) => Number.isFinite(n))
      .slice(0, 12);

    const nextSeries =
      nums && nums.length >= 3
        ? nums
        : [25, 38, Math.max(15, (size % 65) + 20), Math.max(20, (text.length % 70) + 18), 54];
    const latest = nextSeries[nextSeries.length - 1];

    setTelemetryPreset('custom');
    setSparkSeries(nextSeries);
    setGaugeValue(latest);
    setUploadedNote(`Parsed ${name} (${size} B) locally in browser.`);
  };

  const handleResetTelemetry = () => {
    handleSelectPreset(TELEMETRY_PRESETS[0]);
  };

  const handleSliderChange = (_, next) => {
    const val = Array.isArray(next) ? next[0] : next;
    setTelemetryPreset('custom');
    setGaugeValue(val);
    setSparkSeries((prev) => [...prev.slice(-8), val]);
  };

  const bannerConfig = useMemo(() => {
    if (gaugeValue >= 85) {
      return {
        severity: 'error',
        title: `Critical Saturation (${gaugeValue}%)`,
        message: 'Local worker threshold (>85%) exceeded. Engage load shedding or inspect table metrics below.',
        actionLabel: 'Optimize Load',
      };
    }
    if (gaugeValue >= 65) {
      return {
        severity: 'warning',
        title: `Elevated Queue Pressure (${gaugeValue}%)`,
        message: 'Batch queue approaching soft limit (65%). Streaming remains 100% local-first on device.',
        actionLabel: 'Rebalance Queue',
      };
    }
    return {
      severity: 'success',
      title: `Local-First Nominal (${gaugeValue}%)`,
      message: uploadedNote || 'All 29 React exports & Vanilla blocks operate locally with zero external egress.',
      actionLabel: 'Simulate Burst',
    };
  }, [gaugeValue, uploadedNote]);

  const handleBannerAction = () => {
    if (gaugeValue >= 65) {
      handleSelectPreset(TELEMETRY_PRESETS[0]);
    } else {
      handleSelectPreset(TELEMETRY_PRESETS[1]);
    }
  };

  const bandSnippet = useMemo(() => {
    if (bandCodeMode === 0) {
      return `import { SovereignBand } from '../components/sovereign';

<SovereignBand
  seed="${safeSlug}"
  variant="${bandVariant}"
  eyebrow="${category.toUpperCase()}"
  caption="${toolTitle}"
/>`;
    }
    return `<link rel="stylesheet" href="/zoth-ui/zoth-ui.css">
<div class="zoth-band">
  <canvas data-zoth-band="${safeSlug}" data-zoth-variant="${bandVariant}"></canvas>
  <div class="zoth-band-scanlines" aria-hidden="true"></div>
  <div class="zoth-band-chrome">
    <span class="zoth-band-eyebrow">${category.toUpperCase()}</span>
    <span class="zoth-band-readout">INITIALIZING</span>
  </div>
</div>
<script src="/zoth-ui/zoth-ui.js" defer></script>`;
  }, [bandCodeMode, bandVariant, category, safeSlug, toolTitle]);

  const scaffoldOutputs = useMemo(() => {
    const cleanPort = parseInt(port, 10) || 8160;
    const compName = toPascalComponent(safeSlug);

    const cliCmd = `# 1) Scaffold standalone ${archetype} web app (HTML/CSS/JS v3 + SEO/AEO + Netlify + Python loopback)
zoth-scaffold web ${safeSlug} \\
  --title "${toolTitle}" \\
  --category "${category}" \\
  --archetype ${archetype} \\
  --variant ${bandVariant} \\
  --port ${cleanPort}

# 2) Scaffold matching Zoth Studio v2 React component in src/components/tools/
zoth-scaffold studio-tool ${safeSlug} \\
  --title "${toolTitle}" \\
  --category "${category}" \\
  --archetype ${archetype} \\
  --variant ${bandVariant}

# 3) Run built-in 8-point Sovereign Guardrail Audit
zoth-scaffold audit ~/NullAITech/${safeSlug} --json`;

    const reactImportsByArch = {
      auditor: `  SovereignGauge,\n  SovereignTimeline,\n  SovereignDataTable,\n  SovereignTerminalLog,`,
      'diff-converter': `  SovereignPresetBar,\n  SovereignDiffViewer,`,
      landing: `  SovereignHeroSection,\n  SovereignFeatureGrid,\n  SovereignStatComparison,\n  SovereignFaqAccordion,`,
      workstation: `  SovereignGauge,\n  SovereignCodeBlock,\n  SovereignAlertBanner,`,
    };

    const reactBodyByArch = {
      auditor: `      leftPane={
        <SovereignCard index="01" eyebrow="TARGET" title="Artifact Input" accent="${accent}">
          <TextField multiline minRows={5} fullWidth value={payload} onChange={(e) => setPayload(e.target.value)} />
        </SovereignCard>
      }
      rightPane={
        <SovereignTerminalLog
          title="${safeSlug.toUpperCase()} CHECKS"
          logs={[{ ts: '00:01', level: 'INFO', source: '${safeSlug}', message: 'Validated ' + bytes + ' bytes locally.' }]}
        />
      }`,
      'diff-converter': `      leftPane={
        <SovereignCard index="01" eyebrow="BEFORE" title="Input Source" accent="${accent}">
          <TextField multiline minRows={6} fullWidth value={payload} onChange={(e) => setPayload(e.target.value)} />
        </SovereignCard>
      }
      rightPane={
        <SovereignDiffViewer
          title="${safeSlug.toUpperCase()} DIFF"
          beforeText={payload}
          afterText={payload.replace('"port":', '"normalized":true,"port":')}
        />
      }`,
      landing: `      children={
        <SovereignHeroSection
          eyebrow="${category.toUpperCase()}"
          badge="OPEN ACCESS"
          title="${toolTitle}"
          subtitle="Zero-egress sovereign platform generated via @zoth/ui v3.0."
          trustItems={[{ label: 'PORT', value: ':${cleanPort}' }, { label: 'EGRESS', value: '0 B' }]}
        />
      }`,
      workstation: `      leftPane={
        <SovereignCard index="01" eyebrow="INPUT" title="Workspace Input" accent="${accent}">
          <TextField multiline minRows={5} fullWidth value={payload} onChange={(e) => setPayload(e.target.value)} sx={{ mb: 2 }} />
          <SovereignGauge value={pressure} label="PAYLOAD" unit="%" />
        </SovereignCard>
      }
      rightPane={
        <SovereignCodeBlock title="${safeSlug.toUpperCase()} ARTIFACT" filename="${safeSlug}.json" accent="${accent}" code={payload} />
      }`,
    };

    const reactCode = `import React, { useMemo, useState } from 'react';
import { TextField } from '@mui/material';
import {
  SovereignWorkstationShell,
  SovereignCard,
${reactImportsByArch[archetype] || reactImportsByArch.workstation}
} from '../sovereign';

export default function ${compName}() {
  const [payload, setPayload] = useState('{"service":"${safeSlug}","port":${cleanPort}}');
  const bytes = useMemo(() => new TextEncoder().encode(payload).length, [payload]);
  const pressure = Math.min(100, Math.max(12, Math.round((bytes / 128) * 100)));

  return (
    <SovereignWorkstationShell
      id="${safeSlug}"
      category="${category.toUpperCase()}"
      title="${toolTitle}"
      version="3.0.0"
      variant="${bandVariant}"
      accent="${accent}"
      subtitle="Generated via Zoth UI Kit v3.0 (${archetype} archetype)."
      metrics={[
        { label: 'BYTES', value: String(bytes), unit: 'B', accent: '${accent}' },
        { label: 'LOAD', value: pressure + '%', status: 'LOCAL' },
        { label: 'ARCHETYPE', value: '${archetype.toUpperCase()}' },
        { label: 'UI KIT', value: '@zoth/ui v3' },
      ]}
${reactBodyByArch[archetype] || reactBodyByArch.workstation}
    />
  );
}`;

    const htmlCode = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolTitle}</title>
  <link rel="stylesheet" href="/zoth-ui/zoth-ui.css">
</head>
<body>
  <div class="zoth-container">
    <div id="zoth-support-mount"></div>
    <div id="zoth-header-mount"></div>
    <div class="zoth-band">
      <canvas data-zoth-band="${safeSlug}" data-zoth-variant="${bandVariant}"></canvas>
      <div class="zoth-band-scanlines" aria-hidden="true"></div>
      <div class="zoth-band-chrome">
        <span class="zoth-band-eyebrow">${category.toUpperCase()} · ${archetype.toUpperCase()}</span>
        <span class="zoth-band-readout">INITIALIZING</span>
      </div>
    </div>
    <section class="zoth-bento">
      <div class="zoth-card zoth-col-6">
        <span class="zoth-eyebrow">01 · TELEMETRY</span>
        <h2 class="zoth-card-title">${toolTitle} Console</h2>
        <div class="zoth-gauge-card" data-zoth-gauge data-value="94" data-label="SCORE" data-unit="%" data-status="NOMINAL"></div>
      </div>
      <div class="zoth-card zoth-col-6">
        <span class="zoth-eyebrow">02 · ${archetype === 'diff-converter' ? 'LINE DIFF' : 'STAT DELTAS'}</span>
        ${
          archetype === 'diff-converter'
            ? `<div class="zoth-diff-wrap" data-zoth-diff data-title="${safeSlug.toUpperCase()}" data-before='{"mode":"legacy"}' data-after='{"mode":"sovereign","v":3}'></div>`
            : `<div class="zoth-stat-list" data-zoth-stat-bars data-items='[{"label":"Runtime Size","baseline":190,"current":58,"unit":" KB","max":200}]'></div>`
        }
      </div>
    </section>
    <div id="zoth-footer-mount"></div>
  </div>
  <script>
    window.ZOTH_APP = { id: "${safeSlug}", name: "${toolTitle}", version: "v3.0.0", repo: "${safeSlug}" };
  </script>
  <script src="/zoth-ui/zoth-ui.js" defer></script>
</body>
</html>`;

    const siteHtmlCode = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolTitle} — Sovereign Platform</title>
  <link rel="stylesheet" href="/zoth-ui/zoth-ui.css">
</head>
<body>
  <div class="zoth-container">
    <div id="zoth-support-mount"></div>
    <div id="zoth-header-mount"></div>
    <section class="zoth-hero">
      <p class="zoth-hero-kicker">${category.toUpperCase()}</p>
      <h1 class="zoth-hero-title">${toolTitle}</h1>
      <p class="zoth-hero-lead">Zero-egress platform scaffolded via zoth-scaffold site (${bandVariant}).</p>
      <div class="zoth-hero-cta">
        <a href="#features" class="zoth-btn zoth-btn-primary">Explore Capabilities</a>
        <a href="#faq" class="zoth-btn zoth-btn-outline">Architecture FAQ</a>
      </div>
    </section>
    <div class="zoth-band">
      <canvas data-zoth-band="${safeSlug}-site" data-zoth-variant="${bandVariant}"></canvas>
      <div class="zoth-band-scanlines" aria-hidden="true"></div>
    </div>
    <section id="features" class="zoth-feature-grid">
      <article class="zoth-feature-card"><span class="zoth-eyebrow">01 · PRIVACY</span><h3>Zero Egress</h3><p>Client-side execution.</p></article>
      <article class="zoth-feature-card"><span class="zoth-eyebrow">02 · THEME</span><h3>Obsidian &amp; Ivory</h3><p>Dual theme contrast.</p></article>
      <article class="zoth-feature-card"><span class="zoth-eyebrow">03 · PORT</span><h3>:${cleanPort}</h3><p>Local HTTP fallback.</p></article>
    </section>
    <section id="faq" class="zoth-card">
      <details class="zoth-faq-item" open>
        <summary>How does ${toolTitle} handle local data?</summary>
        <div class="zoth-faq-body">Everything executes locally in your browser with zero paywalls or tracking telemetry.</div>
      </details>
    </section>
    <div id="zoth-footer-mount"></div>
  </div>
  <script>
    window.ZOTH_APP = { id: "${safeSlug}-site", name: "${toolTitle}", version: "v3.0.0", repo: "${safeSlug}-site" };
  </script>
  <script src="/zoth-ui/zoth-ui.js" defer></script>
</body>
</html>`;

    return [
      { title: 'CLI SCAFFOLD COMMANDS', badge: `ZOTH-SCAFFOLD v3 · ${archetype.toUpperCase()}`, filename: `${safeSlug}-scaffold.sh`, code: cliCmd },
      { title: `${compName}.jsx`, badge: `REACT · ${archetype.toUpperCase()}`, filename: `${compName}.jsx`, code: reactCode },
      { title: 'public/index.html (Tool)', badge: `VANILLA · ${archetype.toUpperCase()}`, filename: `${safeSlug}-tool.html`, code: htmlCode },
      { title: 'public/index.html (Site)', badge: 'VANILLA SITE', filename: `${safeSlug}-site.html`, code: siteHtmlCode },
    ];
  }, [accent, archetype, bandVariant, category, port, safeSlug, toolTitle]);

  const primMeta = PRIMITIVE_SNIPPETS[activePrimitive];
  const goldCol = resolveModeAccent(SOV.gold, isDark);

  const renderPrimitivePreview = () => {
    switch (activePrimitive) {
      case 'SovereignKpiStrip':
        return (
          <SovereignKpiStrip
            cols={6}
            items={[
              { label: 'EXPORTS', value: '24', unit: 'BLOCKS', status: 'READY', accent: SOV.emerald },
              { label: 'EGRESS', value: '0 B', status: 'LOCAL-FIRST', accent: SOV.gold },
            ]}
          />
        );
      case 'SovereignSupportBar':
        return <SovereignSupportBar compact />;
      case 'SovereignPresetBar':
        return (
          <SovereignPresetBar
            presets={TELEMETRY_PRESETS}
            activeId={telemetryPreset}
            onSelect={handleSelectPreset}
            onUploadText={handleUploadTelemetry}
            onReset={handleResetTelemetry}
            accent={SOV.emerald}
          />
        );
      case 'SovereignGauge':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <SovereignGauge
              value={gaugeValue}
              min={0}
              max={100}
              label="QUEUE LOAD"
              unit="%"
              status={gaugeValue >= 85 ? 'CRITICAL' : gaugeValue >= 65 ? 'ELEVATED' : 'NOMINAL'}
              accent={SOV.emerald}
            />
          </Box>
        );
      case 'SovereignSparkline':
        return (
          <SovereignSparkline
            title="LIVE QUEUE TREND"
            data={sparkSeries}
            value={String(gaugeValue)}
            unit="%"
            threshold={75}
            thresholdLabel="WARN 75%"
            accent={SOV.emerald}
          />
        );
      case 'SovereignDataTable':
        return (
          <SovereignDataTable
            eyebrow="LIVE SAMPLE"
            title="Mini Registry"
            columns={AUDIT_COLUMNS}
            rows={AUDIT_ROWS.slice(0, 4)}
            searchPlaceholder="Search export..."
            filename="mini-registry.csv"
            maxHeight={220}
            accent={SOV.emerald}
          />
        );
      case 'SovereignKeyValueGrid':
        return <SovereignKeyValueGrid items={SYSTEM_CONTRACT_ITEMS.slice(0, 2)} cols={1} accent={SOV.emerald} />;
      case 'SovereignAlertBanner':
        return (
          <SovereignAlertBanner
            severity={bannerConfig.severity}
            title={bannerConfig.title}
            message={bannerConfig.message}
            actionLabel={bannerConfig.actionLabel}
            onAction={handleBannerAction}
          />
        );
      case 'SovereignFaqAccordion':
        return <SovereignFaqAccordion items={UI_KIT_FAQ.slice(0, 2)} defaultOpenIndex={0} accent={SOV.emerald} />;
      case 'SovereignHeroSection':
        return (
          <SovereignHeroSection
            eyebrow="SOVEREIGN PLATFORM"
            badge="OPEN ACCESS"
            title="Assemble Tools"
            highlight="In Seconds"
            subtitle="Drop-in hero band with dual 44px CTA buttons and bottom trust badges."
            primaryAction={{ label: 'Primary CTA', onClick: () => setWizardStep(0) }}
            secondaryAction={{ label: 'Secondary', onClick: () => setWizardStep(1) }}
            trustItems={[{ label: 'EGRESS', value: '0 B' }, { label: 'PAYWALL', value: 'NONE' }]}
            accent={SOV.emerald}
          />
        );
      case 'SovereignFeatureGrid':
        return <SovereignFeatureGrid cols={1} items={FEATURE_PILLARS.slice(0, 2)} accent={SOV.emerald} />;
      case 'SovereignDiffViewer':
        return (
          <SovereignDiffViewer
            title="CONFIG DIFF PREVIEW"
            beforeText={'{"paywall": true,\n "theme": "dark"}'}
            afterText={'{"paywall": false,\n "theme": "dual"}'}
            viewMode="unified"
            accent={SOV.emerald}
          />
        );
      case 'SovereignTimeline':
        return <SovereignTimeline title="AUDIT CHRONOLOGY" items={TIMELINE_EVENTS.slice(0, 2)} accent={SOV.emerald} />;
      case 'SovereignStepWizard':
        return <SovereignStepWizard steps={WIZARD_STEPS} activeStep={wizardStep} onStepChange={setWizardStep} accent={SOV.emerald} />;
      case 'SovereignFilterBar':
        return (
          <SovereignFilterBar
            search={filterSearch}
            onSearchChange={setFilterSearch}
            categories={['ALL', 'ARCHITECTURE', 'WORKFLOW', 'GUARDRAILS']}
            activeCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            totalCount={FEATURE_PILLARS.length}
            filteredCount={filteredPillars.length}
            onReset={() => {
              setFilterSearch('');
              setFilterCategory('ALL');
            }}
            accent={SOV.emerald}
          />
        );
      case 'SovereignStatComparison':
        return <SovereignStatComparison title="BENCHMARKS" items={BENCHMARK_STATS.slice(0, 2)} accent={SOV.emerald} />;
      case 'SovereignTerminalLog':
        return <SovereignTerminalLog title="LIVE STREAM" logs={logs.slice(0, 3)} maxHeight={180} accent={SOV.emerald} />;
      case 'SovereignStatusPill':
        return (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <SovereignStatusPill status="online" label="ACTIVE DAEMON" port={8092} pingMs={12} />
            <SovereignStatusPill status="syncing" label="SYNCHRONIZING" pingMs={45} />
            <SovereignStatusPill status="standby" label="IDLE STANDBY" />
            <SovereignStatusPill status="offline" label="OFFLINE SERVICE" />
          </Box>
        );
      case 'SovereignJsonTree':
        return (
          <SovereignJsonTree
            title="INSPECT PARSED AST"
            data={{
              tool: 'zoth-ui',
              version: '3.0.0',
              architecture: { ssr: true, dualTheme: true, components: 29 },
              ports: [8092, 5173, 3000],
              status: 'nominal',
            }}
            initialDepth={2}
            accent={SOV.emerald}
          />
        );
      case 'SovereignFileDropzone':
        return (
          <SovereignFileDropzone
            title="DROP CODE OR SPEC ARTIFACTS"
            subtitle="Text, JSON, and source files parsed locally"
            accent={SOV.emerald}
          />
        );
      case 'SovereignMediaHUD':
        return <SovereignMediaHUD title="AUDIO WAVEFORM TELEMETRY" duration={140} accent={SOV.emerald} />;
      case 'SovereignPromptBox':
        return (
          <SovereignPromptBox
            value="Synthesize responsive landing page with Schema.org WebApplication graph..."
            onChange={() => {}}
            onSubmit={() => {}}
            accent={SOV.emerald}
          />
        );
      default:
        return (
          <SovereignCard
            index="EX"
            eyebrow="LIVE PREVIEW"
            title={primMeta.title}
            badge={primMeta.badge}
            accent={SOV.emerald}
            variant="subtle"
          >
            <Typography variant="body2" color="text.secondary">
              Dual-theme tokens adapt automatically when switching Obsidian Dark and Editorial Ivory Light modes.
            </Typography>
          </SovereignCard>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <HeroReveal>
        <HeroItem>
          <GlowLine color={goldCol} glowColor={`${SOV.gold}55`} />
        </HeroItem>
        <HeroItem>
          <Typography
            component="p"
            sx={{
              fontFamily: mono,
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: goldCol,
              mt: 2,
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            ZOTH UNIFIED DESIGN SYSTEM v3.0 · @ZOTH/UI + ZOTH-UI-KIT + ZOTH-SCAFFOLD
          </Typography>
        </HeroItem>
        <HeroItem>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '2rem', md: '2.85rem' },
              mb: 1.25,
            }}
          >
            Reusable <span style={{ color: goldCol }}>Sovereign UI</span> Kit
          </Typography>
        </HeroItem>
        <HeroItem>
          <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 3.5, lineHeight: 1.65 }}>
            29 SSR-safe React primitives &amp; blocks, 6 deterministic canvas engines, a zero-dependency Vanilla runtime, and a 4-archetype CLI generator + 8-point guardrail auditor.
          </Typography>
        </HeroItem>
      </HeroReveal>

      <SovereignWorkstationShell
        id="zoth-ui-kit-explorer"
        category="COMPONENT EXPLORER & ARCHETYPE SCAFFOLDER"
        title="Sovereign UI Primitives & Generator"
        version="3.0.0"
        variant={bandVariant}
        accent={accent}
        subtitle="Test 6 canvas renderers (01), telemetry widgets (02), workflow/diff/site blocks (03), 29 exports explorer (04), and 4-archetype codegen (05)."
        metrics={[
          { label: 'REACT PRIMITIVES', value: '29', unit: 'EXPORTS', status: 'SSR-SAFE', accent: SOV.gold },
          { label: 'VANILLA DROP-IN', value: '2 FILES', unit: 'CSS + JS v3', status: 'ZERO DEPS', accent: SOV.emerald },
          { label: 'CLI SCAFFOLDER', value: 'zoth-scaffold v3', status: '4 ARCHETYPES', accent: SOV.cyber },
          { label: 'CANVAS ENGINES', value: '6', unit: 'RENDERERS', status: bandVariant.toUpperCase() },
        ]}
        tutorialSteps={[
          { icon: '🎨', title: 'Test 6 Canvas Engines', desc: 'Switch between Braille Orbit, Bayer Field, Scanline Grid, Particle Orbit, Hex Lattice, and Wave Harmonics.' },
          { icon: '📊', title: 'Interact with Widgets & Blocks', desc: 'Test gauges, diffs, timelines, step wizards, filter toolbars, benchmark deltas, and CSV tables live.' },
          { icon: '🚀', title: 'Scaffold & Audit in 1 CLI', desc: 'Select any archetype in Section 05 to generate CLI, React JSX, HTML tool, or Product Site bundles.' },
        ]}
      >
        <Stack spacing={3}>
          {/* Section 01: Live Canvas Band Switcher */}
          <SovereignCard
            index="01"
            eyebrow="CANVAS PRIMITIVE · 6 ENGINES"
            title="Live Canvas Band Switcher"
            subtitle="Six deterministic GPU/2D canvas backdrops shared identically across React (<SovereignBand />) and Vanilla HTML (<canvas data-zoth-band>)."
            badge={VARIANT_META[bandVariant]?.glyph || 'CANVAS'}
            accent={SOV.cyber}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {VARIANTS.map((v) => {
                const active = bandVariant === v;
                return (
                  <Button
                    key={v}
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setBandVariant(v)}
                    sx={{
                      minHeight: 44,
                      px: 1.75,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      ...(active
                        ? { bgcolor: isDark ? SOV.cyber : '#0369A1', color: isDark ? '#05060B' : '#FFFFFF' }
                        : { color: isDark ? SOV.cyber : '#0369A1', borderColor: 'rgba(56,189,248,0.45)' }),
                    }}
                  >
                    {VARIANT_META[v]?.label || v}
                  </Button>
                );
              })}
            </Box>

            <SovereignBand
              seed={`${safeSlug}-${bandVariant}`}
              variant={bandVariant}
              eyebrow={`LIVE PREVIEW · ${VARIANT_META[bandVariant]?.label || bandVariant}`}
              caption={`${toolTitle} — ${VARIANT_META[bandVariant]?.prov || ''}`}
              height={{ xs: 108, md: 136 }}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
              <Tabs value={bandCodeMode} onChange={(_, v) => setBandCodeMode(v)}>
                <Tab label="React (<SovereignBand />)" sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem' }} />
                <Tab label="Vanilla HTML (<canvas data-zoth-band>)" sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem' }} />
              </Tabs>
            </Box>

            <SovereignCodeBlock
              title={bandCodeMode === 0 ? 'REACT COMPONENT USAGE' : 'VANILLA DROP-IN USAGE'}
              badge={bandVariant.toUpperCase()}
              filename={bandCodeMode === 0 ? 'BandExample.jsx' : 'band-example.html'}
              accent={SOV.cyber}
              code={bandSnippet}
            />
          </SovereignCard>

          {/* Section 02: Interactive Data, Telemetry & Site Widgets */}
          <SovereignCard
            index="02"
            eyebrow="TELEMETRY & SITE SUITE"
            title="Interactive Data, Telemetry & Site Widgets"
            subtitle="Seven zero-dependency widgets shared across diagnostic workstations and product landing sites."
            badge="7 WIDGETS"
            accent={SOV.gold}
          >
            <Stack spacing={2.5}>
              <SovereignPresetBar
                presets={TELEMETRY_PRESETS}
                activeId={telemetryPreset}
                onSelect={handleSelectPreset}
                onUploadText={handleUploadTelemetry}
                onReset={handleResetTelemetry}
                accent={goldCol}
              />

              <Box sx={{ px: 0.5 }}>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    color: 'text.secondary',
                    mb: 0.5,
                  }}
                >
                  SIMULATE WORKER LOAD: {gaugeValue}%
                </Typography>
                <Slider
                  value={gaugeValue}
                  min={0}
                  max={100}
                  onChange={handleSliderChange}
                  aria-label="Simulate worker load percentage"
                  sx={{ color: goldCol }}
                />
              </Box>

              <Grid container spacing={2.5} alignItems="stretch">
                <Grid xs={12} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <SovereignGauge
                      value={gaugeValue}
                      min={0}
                      max={100}
                      label="QUEUE LOAD"
                      unit="%"
                      status={gaugeValue >= 85 ? 'CRITICAL' : gaugeValue >= 65 ? 'ELEVATED' : 'NOMINAL'}
                      thresholds={{ warn: 65, danger: 85 }}
                      accent={goldCol}
                    />
                  </Box>
                </Grid>
                <Grid xs={12} md={8}>
                  <SovereignSparkline
                    title="LOCAL WORKER UTILIZATION HISTORY"
                    data={sparkSeries}
                    value={String(gaugeValue)}
                    unit="%"
                    threshold={75}
                    thresholdLabel="WARN 75%"
                    height={112}
                    accent={goldCol}
                  />
                </Grid>
              </Grid>

              <SovereignAlertBanner
                severity={bannerConfig.severity}
                title={bannerConfig.title}
                message={bannerConfig.message}
                actionLabel={bannerConfig.actionLabel}
                onAction={handleBannerAction}
              />

              <SovereignDataTable
                eyebrow="COMPONENT AUDIT"
                title="Zoth Unified UI Registry"
                columns={AUDIT_COLUMNS}
                rows={AUDIT_ROWS}
                searchPlaceholder="Filter components, layers, or runtimes..."
                filename="zoth-ui-registry.csv"
                accent={goldCol}
              />

              <SovereignKeyValueGrid items={SYSTEM_CONTRACT_ITEMS} cols={2} accent={goldCol} />

              <SovereignFaqAccordion items={UI_KIT_FAQ} defaultOpenIndex={0} accent={goldCol} />
            </Stack>
          </SovereignCard>

          {/* Section 03: Higher-Order Workflow, Diff, Timeline & Site Blocks */}
          <SovereignCard
            index="03"
            eyebrow="WORKFLOW, DIFF & SITE BLOCKS"
            title="Interactive Higher-Order Layout Blocks"
            subtitle="Eight composition blocks enabling full product landing pages, policy auditors, step wizards, benchmark deltas, and side-by-side diff converters."
            badge="8 NEW BLOCKS"
            accent={SOV.cyber}
          >
            <Stack spacing={2.5}>
              <SovereignHeroSection
                eyebrow="HERO BLOCK ARCHETYPE"
                badge="ZERO PAYWALLS"
                title="Assemble Production Tools"
                highlight="Without Boilerplate"
                subtitle="Drop-in landing hero section with Celtic Garamond display type, dual 44px CTAs, and verified capability badges."
                primaryAction={{ label: 'Advance Step Wizard', onClick: () => setWizardStep((s) => (s + 1) % WIZARD_STEPS.length) }}
                secondaryAction={{ label: 'Swap Diff Sample', onClick: () => setDiffSwapped((v) => !v) }}
                trustItems={[
                  { label: 'EXPORTS', value: '29' },
                  { label: 'CANVAS', value: '6 ENGINES' },
                  { label: 'GUARDRAIL', value: '8/8 AUDIT' },
                ]}
                accent={goldCol}
              />

              <SovereignFilterBar
                search={filterSearch}
                onSearchChange={setFilterSearch}
                searchPlaceholder="Filter capability pillars below..."
                categories={['ALL', 'ARCHITECTURE', 'WORKFLOW', 'GUARDRAILS']}
                activeCategory={filterCategory}
                onCategoryChange={setFilterCategory}
                totalCount={FEATURE_PILLARS.length}
                filteredCount={filteredPillars.length}
                onReset={() => {
                  setFilterSearch('');
                  setFilterCategory('ALL');
                }}
                accent={goldCol}
              />

              <SovereignFeatureGrid cols={3} items={filteredPillars} accent={goldCol} />

              <SovereignStepWizard
                steps={WIZARD_STEPS}
                activeStep={wizardStep}
                onStepChange={setWizardStep}
                accent={SOV.cyber}
              />

              <SovereignDiffViewer
                title="LINE-BY-LINE MIGRATION DIFF INSPECTOR"
                beforeLabel={diffSwapped ? 'SOVEREIGN v3 MANIFEST' : 'LEGACY CONFIG'}
                afterLabel={diffSwapped ? 'LEGACY CONFIG' : 'SOVEREIGN v3 MANIFEST'}
                beforeText={diffSwapped ? DIFF_DEFAULT_AFTER : DIFF_DEFAULT_BEFORE}
                afterText={diffSwapped ? DIFF_DEFAULT_BEFORE : DIFF_DEFAULT_AFTER}
                accent={SOV.emerald}
              />

              <Grid container spacing={2.5}>
                <Grid xs={12} md={6}>
                  <SovereignStatComparison
                    title="KIT EFFICIENCY & GUARDRAIL DELTAS"
                    items={BENCHMARK_STATS}
                    accent={SOV.emerald}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <SovereignTimeline
                    title="EXECUTION & VERIFICATION TRACE"
                    items={TIMELINE_EVENTS}
                    accent={SOV.cyber}
                  />
                </Grid>
              </Grid>

              <SovereignTerminalLog
                title="LOCAL WORKSTATION EVENT STREAM"
                logs={logs}
                onClear={() => setLogs(logs.length ? [] : INITIAL_LOGS)}
                accent={SOV.cyber}
              />
            </Stack>
          </SovereignCard>

          {/* Section 04: Reusable Bento, Widget & Block Explorer */}
          <SovereignCard
            index="04"
            eyebrow="REACT & VANILLA COMPONENTS"
            title="Reusable Bento, Widget & Block Explorer"
            subtitle="Inspect each standardized component in live Dark or Light theme and copy its usage pattern."
            badge="29 EXPORTS"
            accent={SOV.emerald}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
              {Object.keys(PRIMITIVE_SNIPPETS).map((key) => {
                const active = activePrimitive === key;
                return (
                  <Button
                    key={key}
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setActivePrimitive(key)}
                    sx={{
                      minHeight: 44,
                      px: 1.5,
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      ...(active
                        ? { bgcolor: isDark ? SOV.emerald : '#047857', color: isDark ? '#05060B' : '#FFFFFF' }
                        : { color: isDark ? SOV.emerald : '#047857', borderColor: 'rgba(52,211,153,0.4)' }),
                    }}
                  >
                    {key}
                  </Button>
                );
              })}
            </Box>

            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                    {primMeta.desc}
                  </Typography>
                  {renderPrimitivePreview()}
                </Box>
              </Grid>
              <Grid xs={12} md={6}>
                <SovereignCodeBlock
                  title={primMeta.title}
                  badge={primMeta.badge}
                  filename={primMeta.filename}
                  accent={SOV.emerald}
                  code={primMeta.code}
                />
              </Grid>
            </Grid>
          </SovereignCard>

          {/* Section 05: Interactive Scaffold & Archetype Generator */}
          <SovereignCard
            index="05"
            eyebrow="PROJECT GENERATOR & AUDIT CLI"
            title="Interactive Scaffold & Archetype Generator"
            subtitle="Configure slug, archetype, canvas engine, and accent once to generate zoth-scaffold v3 CLI commands, React JSX, HTML workstations, or Product Sites."
            badge="4 ARCHETYPES"
            accent={accent}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Project Slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  inputProps={{ style: { fontFamily: mono, fontSize: '0.82rem' } }}
                />
              </Grid>
              <Grid xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Display Title"
                  value={toolTitle}
                  onChange={(e) => setToolTitle(e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </Grid>
              <Grid xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Archetype"
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                >
                  {ARCHETYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} sm={6} md={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  inputProps={{ style: { fontFamily: mono, fontSize: '0.82rem' } }}
                />
              </Grid>
              <Grid xs={12} sm={6} md={1.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Accent"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                >
                  {ACCENT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
              <Tabs value={genTab} onChange={(_, v) => setGenTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="zoth-scaffold CLI" sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem' }} />
                <Tab label="React Workstation JSX" sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem' }} />
                <Tab label="Standalone HTML + zoth-ui" sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem' }} />
                <Tab label="Product Website HTML" sx={{ minHeight: 44, fontFamily: mono, fontSize: '0.74rem' }} />
              </Tabs>
            </Box>

            <SovereignCodeBlock
              title={scaffoldOutputs[genTab].title}
              badge={scaffoldOutputs[genTab].badge}
              filename={scaffoldOutputs[genTab].filename}
              accent={accent}
              maxHeight={360}
              code={scaffoldOutputs[genTab].code}
            />
          </SovereignCard>
        </Stack>
      </SovereignWorkstationShell>
    </Container>
  );
}
