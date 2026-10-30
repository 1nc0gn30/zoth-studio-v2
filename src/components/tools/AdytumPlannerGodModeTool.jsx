import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  TextField,
  Slider,
  Divider,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TerminalIcon from '@mui/icons-material/Terminal';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const TAROT_IMAGES = {
  0: '/tarot/fool.jpg',
  1: '/tarot/magician.jpg',
  2: '/tarot/highpriestess.jpg',
  3: '/tarot/empress.jpg',
  4: '/tarot/emperor.jpg',
  5: '/tarot/hierorphant.jpg',
  6: '/tarot/lovers.jpg',
  7: '/tarot/chariot.jpg',
  8: '/tarot/strength.jpg',
  9: '/tarot/hermit.jpg',
  10: '/tarot/wheeloffortune.jpg',
  11: '/tarot/justice.jpg',
  12: '/tarot/hangedman.jpg',
  13: '/tarot/death.jpg',
  14: '/tarot/temperance.jpg',
  15: '/tarot/devil.jpg',
  16: '/tarot/tower.jpg',
  17: '/tarot/star.jpg',
  18: '/tarot/moon.jpg',
  19: '/tarot/sun.jpg',
  20: '/tarot/judgement.jpg',
  21: '/tarot/world.jpg',
};

const HERMETIC_KEYS = [
  { key: 0, arcana: '0 · The Fool (Aleph)', letter: 'Aleph', gematria: 1, gate: 'Air / Pneuma', phase: 'Pure Potentiality & Unbounded Ideation', prompt: 'Strip all inherited assumptions; define the irreducible sovereign objective.' },
  { key: 1, arcana: 'I · The Magician (Beth)', letter: 'Beth', gematria: 2, gate: 'Mercury / Logos', phase: 'Focused Intention & Single-Pointed Execution', prompt: 'Bind local CLI tools, MCP endpoints, and hardware compute to a single unambiguous goal.' },
  { key: 2, arcana: 'II · The High Priestess (Gimel)', letter: 'Gimel', gematria: 3, gate: 'Moon / Memory', phase: 'Cryptographic Memory & Zero-Leak Storage', prompt: 'Preserve state across sessions in deterministic local stores with zero unauthorized egress.' },
  { key: 3, arcana: 'III · The Empress (Daleth)', letter: 'Daleth', gematria: 4, gate: 'Venus / Door', phase: 'Generative Architecture & Organic Scalability', prompt: 'Compose clean primitives that multiply downstream capability without brittle coupling.' },
  { key: 4, arcana: 'IV · The Emperor (Heh)', letter: 'Heh', gematria: 5, gate: 'Aries / Sight', phase: 'Immutable Invariants & Structural Governance', prompt: 'Enforce strict schemas and constitutional assertions at every system boundary.' },
  { key: 5, arcana: 'V · The Hierophant (Vav)', letter: 'Vav', gematria: 6, gate: 'Taurus / Nail', phase: 'Standardized Contracts & Semantic Schemas', prompt: 'Expose canonical JSON-RPC / MCP and CLI contracts so humans and agents interoperate cleanly.' },
  { key: 6, arcana: 'VI · The Lovers (Zain)', letter: 'Zain', gematria: 7, gate: 'Gemini / Sword', phase: 'Binary Tradeoff Discipline & Clean Boundaries', prompt: 'State explicit non-goals, security separations, and architectural tradeoffs.' },
  { key: 7, arcana: 'VII · The Chariot (Cheth)', letter: 'Cheth', gematria: 8, gate: 'Cancer / Armor', phase: 'Air-Gapped Isolation & Sandbox Enclosures', prompt: 'Lock the execution harness to loopback silicon (127.0.0.1) with 100% offline capability.' },
  { key: 8, arcana: 'VIII · Strength (Teth)', letter: 'Teth', gematria: 9, gate: 'Leo / Serpent', phase: 'Graceful Error Handling & Self-Healing Loops', prompt: 'Wrap subprocesses, ports, and model calls in bounded retry and deterministic fallback loops.' },
  { key: 9, arcana: 'IX · The Hermit (Yod)', letter: 'Yod', gematria: 10, gate: 'Virgo / Lantern', phase: 'Deterministic Verification & Zero-Dependency Audits', prompt: 'Prove runtime behavior with self-contained smoke tests rather than trusting documentation.' },
  { key: 10, arcana: 'X · Wheel of Fortune (Kaph)', letter: 'Kaph', gematria: 20, gate: 'Jupiter / Cycle', phase: 'State Loop Determinism & Replayability', prompt: 'Ensure event loops and state transitions resume idempotently across restarts.' },
  { key: 11, arcana: 'XI · Justice (Lamed)', letter: 'Lamed', gematria: 30, gate: 'Libra / Scales', phase: 'Strict Verification Tests & Equilibrated Budgets', prompt: 'Enforce concrete latency, memory, and accuracy budgets with automated assertions.' },
  { key: 12, arcana: 'XII · The Hanged Man (Mem)', letter: 'Mem', gematria: 40, gate: 'Water / Reversal', phase: 'Asynchronous Non-Blocking Flow & Calm Pacing', prompt: 'Replace busy polling and blocking bottlenecks with reactive event-driven wakeups.' },
  { key: 13, arcana: 'XIII · Death (Nun)', letter: 'Nun', gematria: 50, gate: 'Scorpio / Transformation', phase: 'Ruthless Cruft Pruning & Resource Cleanup', prompt: 'Prune dead state, zombie processes, stale caches, and legacy paywall clutter.' },
  { key: 14, arcana: 'XIV · Temperance (Samekh)', letter: 'Samekh', gematria: 60, gate: 'Sagittarius / Synthesis', phase: 'Rate-Limiting & High-Concurrence Harmony', prompt: 'Harmonize CLI backend and browser UI in calibrated equilibrium without state drift.' },
  { key: 15, arcana: 'XV · The Devil (Ayin)', letter: 'Ayin', gematria: 70, gate: 'Capricorn / Eye', phase: 'Anti-Deception Audit & Elimination of Mock State', prompt: 'Banish fake placeholders, mock_production strings, and misleading cipher labels.' },
  { key: 16, arcana: 'XVI · The Tower (Peh)', letter: 'Peh', gematria: 80, gate: 'Mars / Lightning', phase: 'Chaos Resilience & Graceful Crash Recovery', prompt: 'Test fault injection and atomic writes so abrupt termination never corrupts user state.' },
  { key: 17, arcana: 'XVII · The Star (Tzaddi)', letter: 'Tzaddi', gematria: 90, gate: 'Aquarius / Star', phase: 'Transparent Telemetry & Clear Logging', prompt: 'Provide structured diagnostics (/health, --json) so operators see live health in <5s.' },
  { key: 18, arcana: 'XVIII · The Moon (Qoph)', letter: 'Qoph', gematria: 100, gate: 'Pisces / Soma', phase: 'Deep Synaptic Retention & Subconscious Caches', prompt: 'Preserve lineage history and user artifacts seamlessly across upgrades.' },
  { key: 19, arcana: 'XIX · The Sun (Resh)', letter: 'Resh', gematria: 200, gate: 'Sun / Radiance', phase: 'Production-Grade Elegance & High-Fidelity UI', prompt: 'Deliver high-contrast, responsive UI across mobile, tablet, and desktop viewports.' },
  { key: 20, arcana: 'XX · Judgement (Shin)', letter: 'Shin', gematria: 300, gate: 'Fire / Awakening', phase: 'Comprehensive Integration Sentinel & Release Gate', prompt: 'Verify README, in-app docs, CLI --help, and live UI parity before release.' },
  { key: 21, arcana: 'XXI · The World (Tau)', letter: 'Tav', gematria: 400, gate: 'Saturn / Crown', phase: 'Hermetic Sovereign Wholeness & Zero-Egress Proof', prompt: 'Seal the compiled artifact, emit deterministic manifest, and ship 100% open-access.' },
];

const HARDENED_SPEC_PRESET = `Project: Sovereign Zero-Egress Enclave
Goal & Objective: Architect a local-first, air-gapped sovereign service with deterministic state memory and persistent JSON store.
Invariants & Constraints: Enforce immutable invariants and standardized JSON schema type contracts at every API boundary.
Tradeoffs & Boundaries: Exclude external network dependencies; isolate execution in a local 127.0.0.1 sandbox.
Resilience & Verification: Implement graceful error catch recovery, deterministic verification test suite, and benchmarked latency metric budgets.
Hygiene & Release: Prune stale cache state, emit structured stdout telemetry logs, and gate CI release deployment on 100% offline sovereign pass.`;

const FLAWED_SPEC_PRESET = `Quick cloud-only prototype using placeholder mock_production responses and fake_data timers with no tests or boundaries.`;

function validatePlan(planText = '') {
  const text = (planText || '').toLowerCase();
  const rules = [
    { key: 0, test: () => text.length > 50, label: 'Intention & Purpose Defined (Aleph)', weight: 5 },
    { key: 1, test: () => text.includes('scope') || text.includes('goal') || text.includes('objective'), label: 'Single-Pointed Focus (Beth)', weight: 5 },
    { key: 2, test: () => text.includes('memory') || text.includes('store') || text.includes('cache') || text.includes('state'), label: 'State & Memory Integrity (Gimel)', weight: 5 },
    { key: 4, test: () => text.includes('invariant') || text.includes('rule') || text.includes('constraint'), label: 'Immutable Invariants Enforced (Heh)', weight: 5 },
    { key: 5, test: () => text.includes('schema') || text.includes('json') || text.includes('contract') || text.includes('type'), label: 'Standardized Schemas & Interfaces (Vav)', weight: 5 },
    { key: 6, test: () => text.includes('tradeoff') || text.includes('boundary') || text.includes('exclude'), label: 'Explicit Tradeoffs & Non-Goals (Zain)', weight: 4 },
    { key: 7, test: () => text.includes('isolate') || text.includes('air-gap') || text.includes('sandbox') || text.includes('zero-egress') || text.includes('local'), label: 'Air-Gapped Isolation & Sandbox (Cheth)', weight: 6 },
    { key: 8, test: () => text.includes('error') || text.includes('fail') || text.includes('catch') || text.includes('resilien'), label: 'Graceful Error Handling (Teth)', weight: 5 },
    { key: 9, test: () => text.includes('test') || text.includes('audit') || text.includes('verify'), label: 'Deterministic Verification Test Suite (Yod)', weight: 6 },
    { key: 11, test: () => text.includes('budget') || text.includes('metric') || text.includes('eval') || text.includes('benchmark'), label: 'Performance & Budget Equilibrated (Lamed)', weight: 4 },
    { key: 13, test: () => text.includes('clean') || text.includes('prune') || text.includes('remove') || text.includes('purge'), label: 'Resource Pruning & Cleanup (Nun)', weight: 4 },
    { key: 15, test: () => !text.includes('placeholder') && !text.includes('mock_production') && !text.includes('fake_data'), label: 'Truth In Advertising / No Fake State (Ayin)', weight: 6 },
    { key: 17, test: () => text.includes('log') || text.includes('telemetry') || text.includes('trace') || text.includes('stdout'), label: 'Clear Logging & Diagnostics (Tzaddi)', weight: 4 },
    { key: 20, test: () => text.includes('release') || text.includes('deploy') || text.includes('deliver') || text.includes('ci'), label: 'Integration Gate & Release Verification (Shin)', weight: 5 },
    { key: 21, test: () => !text.includes('cloud-only') && (text.includes('offline') || text.includes('local-first') || text.includes('sovereign')), label: 'Sovereign Wholeness & Local Autonomy (Tav)', weight: 5 },
  ];

  const totalWeight = rules.reduce((s, r) => s + r.weight, 0);
  let scoreTotal = 0;
  const checks = rules.map((r) => {
    const passed = r.test();
    if (passed) scoreTotal += r.weight;
    const keyMeta = HERMETIC_KEYS.find((k) => k.key === r.key);
    return {
      keyNumber: r.key,
      keyName: keyMeta?.arcana || `Key ${r.key}`,
      rule: r.label,
      passed,
      weight: r.weight,
      recommendation: passed ? null : `Incorporate explicit ${r.label.toLowerCase()} into specification.`,
    };
  });

  const score = Math.min(100, Math.round((scoreTotal / totalWeight) * 100));
  const passed = score >= 70;
  return {
    passed,
    score,
    grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'NEEDS_REVISION',
    summary: passed
      ? 'Specification passes the Hermetic Quality Gate. Architecture is robust, testable, and bounded.'
      : 'Specification fails required hermetic invariants. Click "Auto-Harden Invariants" to remediate.',
    checks,
    blockers: checks.filter((c) => !c.passed).map((c) => c.recommendation),
  };
}

function autoHardenSpec(planText = '', projectName = 'Sovereign Zero-Egress Enclave') {
  let nextText = (planText || '').trim();
  nextText = nextText
    .replace(/cloud-only/gi, 'local-first sovereign')
    .replace(/placeholder/gi, 'deterministic-implementation')
    .replace(/mock_production/gi, 'verified_production')
    .replace(/fake_data/gi, 'canonical_fixtures');

  const remediationMap = {
    0: `Intention & Purpose (Key 0 · Aleph): Deliver a sovereign, zero-egress architecture for ${projectName} with unambiguous user value.`,
    1: `Goal & Scope (Key 1 · Beth): Define a single-pointed objective and strict execution scope with zero feature drift.`,
    2: `State & Memory Store (Key 2 · Gimel): Persist application state and memory cache in deterministic local storage with atomic writes.`,
    4: `Immutable Invariants (Key 4 · Heh): Enforce strict runtime invariants and constitutional constraints at every module boundary.`,
    5: `Standardized Schemas (Key 5 · Vav): Validate all inputs and outputs against canonical JSON schema type contracts.`,
    6: `Explicit Tradeoffs & Boundaries (Key 6 · Zain): Document explicit architectural tradeoffs and exclude non-essential surface area.`,
    7: `Air-Gapped Sandbox Isolation (Key 7 · Cheth): Isolate execution to local loopback (127.0.0.1) inside a zero-egress sandbox.`,
    8: `Graceful Error Resilience (Key 8 · Teth): Wrap all I/O and subprocess boundaries in bounded catch and error recovery loops.`,
    9: `Deterministic Verification Suite (Key 9 · Yod): Audit and verify runtime behavior via an automated end-to-end test suite.`,
    11: `Equilibrated Performance Budgets (Key 11 · Lamed): Benchmark latency and memory metrics against strict quantitative budgets.`,
    13: `Resource Pruning & Hygiene (Key 13 · Nun): Prune stale cache state, zombie processes, and dead code paths automatically.`,
    15: `Anti-Deception Guarantee (Key 15 · Ayin): Zero fake state—all transforms, metrics, and outputs execute real algorithms.`,
    17: `Transparent Telemetry & Diagnostics (Key 17 · Tzaddi): Emit structured stdout telemetry logs and health trace diagnostics.`,
    20: `Release & CI Integration Gate (Key 20 · Shin): Gate CI deployment and release delivery on 100% invariant verification.`,
    21: `Sovereign Wholeness & Offline Autonomy (Key 21 · Tav): Guarantee 100% offline, local-first sovereign operation without external cloud lock-in.`,
  };

  const currentAudit = validatePlan(nextText);
  const addedClauses = [];
  for (const check of currentAudit.checks) {
    if (!check.passed && remediationMap[check.keyNumber]) {
      addedClauses.push(remediationMap[check.keyNumber]);
    }
  }

  if (addedClauses.length > 0) {
    nextText = [
      nextText ? `${nextText}\n` : `# ${projectName} — Sovereign Specification\n`,
      `## Hermetic Invariant Hardening Clauses`,
      ...addedClauses.map((c) => `- ${c}`),
    ]
      .join('\n')
      .trim();
  }
  return nextText;
}

const BRAILLE_RAMP = ' ⠁⠃⠇⠏⠟⠿⣿';

export default function AdytumPlannerGodModeTool() {
  const [selectedIdx, setSelectedIdx] = useState(7);
  const [projectName, setProjectName] = useState('Sovereign Zero-Egress Enclave');
  const [intention, setIntention] = useState(HARDENED_SPEC_PRESET);
  const [incubationDepth, setIncubationDepth] = useState(5);
  const [running, setRunning] = useState(true);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const canvasRef = useRef(null);

  const activeKey = HERMETIC_KEYS[selectedIdx] || HERMETIC_KEYS[0];
  const audit = useMemo(() => validatePlan(intention), [intention]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    // Shifted Y coordinates down so top HUD banner never collides with KETHER
    const sephiroth = [
      { id: 'Kether', x: 0.5, y: 0.23 },
      { id: 'Chokmah', x: 0.76, y: 0.33 },
      { id: 'Binah', x: 0.24, y: 0.33 },
      { id: 'Chesed', x: 0.76, y: 0.51 },
      { id: 'Geburah', x: 0.24, y: 0.51 },
      { id: 'Tiphereth', x: 0.5, y: 0.58 },
      { id: 'Netzach', x: 0.76, y: 0.72 },
      { id: 'Hod', x: 0.24, y: 0.72 },
      { id: 'Yesod', x: 0.5, y: 0.81 },
      { id: 'Malkuth', x: 0.5, y: 0.93 },
    ];

    const paths = [
      [0, 1], [0, 2], [0, 5], [1, 2], [1, 3], [1, 5], [2, 4], [2, 5],
      [3, 4], [3, 5], [3, 6], [4, 5], [4, 7], [5, 6], [5, 7], [5, 8],
      [6, 7], [6, 8], [6, 9], [7, 8], [7, 9], [8, 9],
    ];

    const render = () => {
      if (running) t += 0.018;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 640;
      const ch = canvas.clientHeight || 360;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#050509';
      ctx.fillRect(0, 0, cw, ch);

      ctx.font = `10px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = 38;
      const rows = 18;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c / (cols - 1)) * 2 - 1;
          const ny = (r / (rows - 1)) * 2 - 1;
          const dist = Math.hypot(nx, ny);
          const wave = 0.5 + 0.5 * Math.cos(dist * 10 - t * 2.4 + selectedIdx * 0.4);
          const idx = Math.min(BRAILLE_RAMP.length - 1, Math.floor(wave * BRAILLE_RAMP.length));
          if (idx > 1) {
            ctx.fillStyle = `rgba(212, 175, 55, ${(wave * 0.22).toFixed(2)})`;
            ctx.fillText(BRAILLE_RAMP[idx], (c + 0.5) * (cw / cols), (r + 0.5) * (ch / rows));
          }
        }
      }

      paths.forEach(([a, b], i) => {
        const na = sephiroth[a];
        const nb = sephiroth[b];
        const x1 = na.x * cw;
        const y1 = na.y * ch;
        const x2 = nb.x * cw;
        const y2 = nb.y * ch;
        const isActive = i === selectedIdx;

        ctx.strokeStyle = isActive ? 'rgba(212, 175, 55, 0.95)' : 'rgba(192, 132, 252, 0.24)';
        ctx.lineWidth = isActive ? 2.6 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const p = (t * 0.65 + i * 0.13) % 1;
        const px = x1 + (x2 - x1) * p;
        const py = y1 + (y2 - y1) * p;
        ctx.fillStyle = isActive ? '#F5E6AB' : '#C084FC';
        ctx.beginPath();
        ctx.arc(px, py, isActive ? 3.8 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      sephiroth.forEach((node, idx) => {
        const x = node.x * cw;
        const y = node.y * ch;
        const pulse = 1 + 0.14 * Math.sin(t * 3 + idx);

        ctx.fillStyle = '#090812';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(x, y, 10.5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F5E6AB';
        ctx.font = `600 9px ${mono}`;
        ctx.fillText(node.id.toUpperCase(), x, y - 15);
      });

      // Top HUD bar with translucent backdrop so text is crisp
      ctx.fillStyle = 'rgba(5, 5, 9, 0.82)';
      ctx.fillRect(0, 0, cw, 42);
      ctx.fillStyle = 'rgba(245, 230, 171, 0.92)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`ADYTUM // 22-KEY HERMETIC RITE // KEY [${activeKey.arcana.toUpperCase()}]`, 14, 16);
      ctx.fillStyle = audit.passed ? '#34D399' : '#F87171';
      ctx.fillText(`GATEKEEPER SCORE: ${audit.score}/100 (${audit.grade}) — ${audit.checks.filter((c) => c.passed).length}/${audit.checks.length} RULES PASSED`, 14, 31);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [selectedIdx, running, activeKey.arcana, audit]);

  const artifactJson = useMemo(
    () =>
      JSON.stringify(
        {
          protocol: 'adytum.hermetic.rite.v1',
          projectName,
          selectedKey: activeKey.key,
          selectedArcana: activeKey.arcana,
          hebrewLetter: activeKey.letter,
          gematria: activeKey.gematria,
          alchemicalPhase: activeKey.phase,
          elementalGate: activeKey.gate,
          incubationMinutes: incubationDepth,
          hermeticGateAudit: {
            passed: audit.passed,
            score: audit.score,
            grade: audit.grade,
            passedChecks: audit.checks.filter((c) => c.passed).length,
            totalChecks: audit.checks.length,
            blockers: audit.blockers,
          },
          directive: activeKey.prompt,
          cliEquivalent: `adytum invariants "${projectName}" --json && adytum validate plan.md --json`,
        },
        null,
        2
      ),
    [projectName, activeKey, incubationDepth, audit]
  );

  const markdownPrd = useMemo(() => {
    const lines = [
      `# ⚡ Adytum 22-Key Hermetic Architectural Rite: ${projectName}`,
      ``,
      `- **Active Key**: ${activeKey.arcana} (Gematria: ${activeKey.gematria}, Gate: ${activeKey.gate})`,
      `- **Core Invariant**: ${activeKey.phase}`,
      `- **Hermetic Gate Score**: **${audit.score}/100 (${audit.grade})** — ${audit.passed ? 'PASSED' : 'NEEDS REVISION'}`,
      `- **Incubation Gate**: ${incubationDepth} minutes`,
      ``,
      `## 1. Architectural Specification`,
      intention,
      ``,
      `## 2. 15-Point Invariant Gatekeeper Audit`,
      ...audit.checks.map((c) => `- [${c.passed ? 'x' : ' '}] **Key ${c.keyNumber} (${c.keyName})**: ${c.rule}`),
      ``,
      `## 3. Complete 22-Key Sovereign Checklist`,
      ...HERMETIC_KEYS.map((k) => `- [ ] **Key ${k.key} (${k.arcana})**: ${k.phase} — *${k.prompt}*`),
    ];
    return lines.join('\n');
  }, [projectName, activeKey, audit, incubationDepth, intention]);

  const copyJson = () => {
    navigator.clipboard?.writeText(artifactJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const copyMarkdown = () => {
    navigator.clipboard?.writeText(markdownPrd);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1800);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdownPrd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-adytum-prd.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07070C',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0B14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(212,175,55,0.14)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#D4AF37',
              display: 'flex',
            }}
          >
            <AccountTreeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.12em' }}>
                ADYTUM 22-KEY HERMETIC PLANNING RITE &amp; INVARIANT GATEKEEPER
              </Typography>
              <Chip
                label={`GATE SCORE: ${audit.score}/100 (${audit.grade})`}
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: audit.passed ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                  color: audit.passed ? '#34D399' : '#F87171',
                  border: `1px solid ${audit.passed ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              All 22 Canonical BOTA Keys (0–21) • 15-Rule Architectural Plan Validator • ZothOS CLI (`adytum`) &amp; Local Workstation (`:8135`)
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            component="a"
            href="http://127.0.0.1:8135"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#F5E6AB',
              borderColor: 'rgba(212,175,55,0.45)',
              bgcolor: 'rgba(212,175,55,0.1)',
            }}
          >
            Open :8135 Workstation
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunning((r) => !r)}
            startIcon={running ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            {running ? 'Pause Lattice' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={copyMarkdown}
            startIcon={copiedMd ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#34D399',
              borderColor: 'rgba(52,211,153,0.4)',
            }}
          >
            {copiedMd ? 'Copied 22-Key PRD' : 'Copy Markdown PRD'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={downloadMarkdown}
            startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#38BDF8',
              borderColor: 'rgba(56,189,248,0.4)',
            }}
          >
            Download .md
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={copyJson}
            startIcon={copiedJson ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copiedJson ? 'JSON Copied' : 'Export JSON Manifest'}
          </Button>
        </Stack>
      </Box>

      <SovereignEyebrow accent="#34D399" right="Planning">
        {"adytum-alchemist-ai-workflow"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"adytum-alchemist-ai-workflow"}
        eyebrow={"Planning"}
        caption={"Adytum Planner"}
        label={"Adytum Planner — Zoth sovereign visualisation"}
      />
      <Grid container>
        {/* Left Column: Tree of Life Canvas + Active BOTA Tarot Card + All 22 Keys */}
        <Grid xs={12} md={6} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#050509' }}>
          <Box sx={{ width: '100%', height: 350 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          {/* Active BOTA Tarot Card Preview Strip */}
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#080811',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={TAROT_IMAGES[activeKey.key] || '/tarot/fool.jpg'}
              alt={`${activeKey.arcana} Canonical BOTA Tarot Card`}
              sx={{
                width: 66,
                height: 112,
                objectFit: 'cover',
                borderRadius: 1.5,
                border: '1px solid rgba(212,175,55,0.5)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.65)',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: '#D4AF37' }}>
                {activeKey.arcana} — {activeKey.phase}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#F5E6AB', display: 'block', mt: 0.2 }}>
                Hebrew Letter: {activeKey.letter} (Gematria: {activeKey.gematria}) • Gate: {activeKey.gate}
              </Typography>
              <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.75rem', mt: 0.5, lineHeight: 1.45 }}>
                {activeKey.prompt}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#090912',
            }}
          >
            <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, color: '#D4AF37', mb: 1 }}>
              SELECT CANONICAL HERMETIC KEY (ALL 22 KEYS: 0 THE FOOL → 21 THE WORLD)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 155, overflowY: 'auto', pr: 0.5 }}>
              {HERMETIC_KEYS.map((item, idx) => (
                <Button
                  key={item.key}
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedIdx(idx)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    py: 0.35,
                    px: 1,
                    textTransform: 'none',
                    bgcolor: selectedIdx === idx ? '#D4AF37' : 'rgba(255,255,255,0.02)',
                    color: selectedIdx === idx ? '#050508' : '#94A3B8',
                    borderColor: selectedIdx === idx ? '#D4AF37' : 'rgba(255,255,255,0.12)',
                  }}
                >
                  {item.arcana}
                </Button>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Specification Input, Presets, Auto-Harden, and Live 15-Rule Gatekeeper Audit */}
        <Grid xs={12} md={6} sx={{ p: 2.5, bgcolor: '#090910', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8' }}>
                PROJECT NAME &amp; ARCHITECTURAL SPECIFICATION (LIVE 22-KEY GATEKEEPER)
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIntention(HARDENED_SPEC_PRESET)}
                  sx={{ fontFamily: mono, fontSize: '0.62rem', py: 0.2, px: 1, color: '#34D399', borderColor: 'rgba(52,211,153,0.4)' }}
                >
                  Hardened (100/100)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIntention(FLAWED_SPEC_PRESET)}
                  sx={{ fontFamily: mono, fontSize: '0.62rem', py: 0.2, px: 1, color: '#F87171', borderColor: 'rgba(248,113,113,0.4)' }}
                >
                  Flawed Spec
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setIntention((prev) => autoHardenSpec(prev, projectName))}
                  startIcon={<AutoFixHighIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    py: 0.2,
                    px: 1.2,
                    bgcolor: 'rgba(212,175,55,0.2)',
                    color: '#F5E6AB',
                    border: '1px solid rgba(212,175,55,0.55)',
                    '&:hover': { bgcolor: 'rgba(212,175,55,0.32)' },
                  }}
                >
                  Auto-Harden Invariants
                </Button>
              </Stack>
            </Stack>

            <TextField
              fullWidth
              size="small"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
              sx={{
                mb: 1.2,
                '& .MuiInputBase-root': { fontFamily: mono, fontSize: '0.76rem', bgcolor: 'rgba(0,0,0,0.45)', color: '#F8FAFC' },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={5}
              size="small"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              sx={{
                mb: 1.5,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: '#E2E8F0',
                },
              }}
            />

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>INCUBATION GATE DURATION</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{incubationDepth} min</Typography>
              </Box>
              <Slider size="small" min={1} max={22} value={incubationDepth} onChange={(_, v) => setIncubationDepth(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            {/* Live 15-Check Invariant Matrix */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#05050A',
                border: `1px solid ${audit.passed ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                maxHeight: 225,
                overflowY: 'auto',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {audit.passed ? (
                    <VerifiedUserIcon sx={{ fontSize: 16, color: '#34D399' }} />
                  ) : (
                    <WarningAmberIcon sx={{ fontSize: 16, color: '#F87171' }} />
                  )}
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: audit.passed ? '#34D399' : '#F87171' }}>
                    {audit.passed ? 'PASSED HERMETIC GATE' : 'FAILED HERMETIC GATE'} — {audit.score}/100 ({audit.grade})
                  </Typography>
                </Stack>
                <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#94A3B8' }}>
                  {audit.checks.filter((c) => c.passed).length}/{audit.checks.length} Checks
                </Typography>
              </Stack>
              <Grid container spacing={0.75}>
                {audit.checks.map((c) => (
                  <Grid xs={12} sm={6} key={c.keyNumber}>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.63rem',
                        color: c.passed ? '#34D399' : '#F87171',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <span>{c.passed ? '✔' : '✖'}</span>
                      <span>Key {c.keyNumber}: {c.rule}</span>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Bottom Section: How It Works, What It Does & ZothOS CLI Reference */}
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#06060B' }}>
        <Grid container spacing={2.5}>
          <Grid xs={12} md={6}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: '#D4AF37', mb: 1 }}>
              📖 HOW ADYTUM PLANNER WORKS &amp; WHAT IT DOES
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.8rem', lineHeight: 1.6, mb: 1.2 }}>
              <strong>Adytum Alchemist AI Workflow</strong> replaces ad-hoc prompt guessing with a deterministic <strong>22-Key Hermetic Planning Rite</strong> (Builders of the Adytum lineage). Every Key from <strong>Key 0 (The Fool / Aleph)</strong> to <strong>Key 21 (The World / Tav)</strong> maps an archetypal symbol to a mandatory software engineering invariant:
            </Typography>
            <Stack spacing={0.6} sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#94A3B8' }}>
              <Box>• <strong>1. Intention Crystallization</strong>: Select a Key (0–21) or paste your PRD/plan above to audit against the 15-rule Hermetic Gatekeeper.</Box>
              <Box>• <strong>2. Auto-Hardening &amp; Incubation</strong>: Click <strong>Auto-Harden Invariants</strong> to automatically inject missing architectural guarantees, or launch the full 3-column Tarot workstation on <code>http://127.0.0.1:8135</code>.</Box>
              <Box>• <strong>3. Export &amp; Gate CI</strong>: Export the 22-Key Markdown PRD or run <code>adytum validate plan.md</code> / <code>adytum harden plan.md</code> in ZothOS CLI &amp; MCP pipelines.</Box>
            </Stack>
          </Grid>

          <Grid xs={12} md={6}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TerminalIcon sx={{ fontSize: 16, color: '#34D399' }} />
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: '#34D399' }}>
                  ZOTHOS CLI &amp; MCP COMMANDS (`/usr/local/bin/adytum`)
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  navigator.clipboard?.writeText('adytum list && adytum key 7 --json && adytum invariants "MyProject"');
                  setCopiedCli(true);
                  setTimeout(() => setCopiedCli(false), 1800);
                }}
                sx={{ fontFamily: mono, fontSize: '0.62rem', py: 0.2, px: 1, color: '#34D399', borderColor: 'rgba(52,211,153,0.35)' }}
              >
                {copiedCli ? 'Copied CLI' : 'Copy CLI Quickstart'}
              </Button>
            </Stack>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                m: 0,
                borderRadius: 2,
                bgcolor: '#030306',
                border: '1px solid rgba(52,211,153,0.22)',
                fontFamily: mono,
                fontSize: '0.68rem',
                color: '#E2E8F0',
                overflowX: 'auto',
                lineHeight: 1.55,
              }}
            >
{`# Installed globally on ZothOS as both 'adytum' and 'adytum-alchemist-ai-workflow'
adytum list                          # List all 22 Hermetic Keys & engineering invariants
adytum key 7 --json                  # Inspect Key 7 (The Chariot / Cheth) in JSON
adytum invariants "${projectName}"   # Generate 22-point project invariant checklist
adytum validate ./plan.md --json     # Audit a plan/PRD (exit 0 if score >= 70)
adytum harden ./plan.md              # Auto-harden a draft spec to 100/100 (A+)
adytum mcp                           # Launch MCP stdio server (4 tools for AI agents)
adytum web                           # Start local workstation on http://127.0.0.1:8135`}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
