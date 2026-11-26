import React, { useState, useEffect, useRef, useMemo } from 'react';
import { isLocalRuntime } from '../../utils/sovereignRuntime';
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
  useTheme,
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
import { SovereignGLBViewport, ADYTUM_22_TAROT_KEYS } from '../A100SovereignFoundryShowcase.jsx';
import AdytumArcanaCard from './AdytumArcanaCard.jsx';

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
  { key: 21, arcana: 'XXI · The World (Tav)', letter: 'Tav', gematria: 400, gate: 'Saturn / Crown', phase: 'Hermetic Sovereign Wholeness & Zero-Egress Proof', prompt: 'Seal the compiled artifact, emit deterministic manifest, and ship 100% open-access.' },
];

const HARDENED_SPEC_PRESET = `Project: Sovereign Zero-Egress Enclave
Goal & Objective: Architect a local-first, air-gapped sovereign service with deterministic state memory and persistent JSON store.
Invariants & Constraints: Enforce immutable invariants and standardized JSON schema type contracts at every API boundary.
Tradeoffs & Boundaries: Exclude external network dependencies; isolate execution in a local 127.0.0.1 sandbox.
Resilience & Verification: Implement graceful error catch recovery, deterministic verification test suite, and benchmarked latency metric budgets.
Hygiene & Release: Prune stale cache state, emit structured stdout telemetry logs, and gate CI release deployment on 100% offline sovereign pass.`;

const FLAWED_SPEC_PRESET = `Quick cloud-only prototype using placeholder mock_production responses and fake_data timers with no tests or boundaries.`;

const NEGATION_RE = /\b(?:no|without|zero|skip|skipping|none|lack|lacking|missing|never|not|avoid|omits?|omitting)\b/i;

function hasPositiveTerm(text, terms) {
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\w*`, 'gi');
    let match;
    while ((match = re.exec(text)) !== null) {
      const prefix = text.slice(Math.max(0, match.index - 32), match.index);
      const clausePrefix = prefix.split(/[.;\n!?]/).pop() || '';
      if (!NEGATION_RE.test(clausePrefix)) {
        return true;
      }
    }
  }
  return false;
}

export function validatePlan(planText = '') {
  const raw = (planText || '').trim();
  const text = raw.toLowerCase();
  const rules = [
    { key: 0, test: () => raw.length > 50, label: 'Intention & Purpose Defined (Aleph)', weight: 5 },
    { key: 1, test: () => hasPositiveTerm(text, ['scope', 'goal', 'objective']), label: 'Single-Pointed Focus (Beth)', weight: 5 },
    { key: 2, test: () => hasPositiveTerm(text, ['memory', 'store', 'cache', 'state', 'storage']), label: 'State & Memory Integrity (Gimel)', weight: 5 },
    { key: 4, test: () => hasPositiveTerm(text, ['invariant', 'rule', 'constraint']), label: 'Immutable Invariants Enforced (Heh)', weight: 5 },
    { key: 5, test: () => hasPositiveTerm(text, ['schema', 'json', 'contract', 'type']), label: 'Standardized Schemas & Interfaces (Vav)', weight: 5 },
    { key: 6, test: () => hasPositiveTerm(text, ['tradeoff', 'boundary', 'boundaries', 'exclude', 'non-goal']), label: 'Explicit Tradeoffs & Non-Goals (Zain)', weight: 4 },
    { key: 7, test: () => hasPositiveTerm(text, ['isolate', 'isolation', 'air-gap', 'sandbox', 'zero-egress', 'local', 'loopback']), label: 'Air-Gapped Isolation & Sandbox (Cheth)', weight: 6 },
    { key: 8, test: () => hasPositiveTerm(text, ['error', 'fail', 'catch', 'resilien', 'recovery']), label: 'Graceful Error Handling (Teth)', weight: 5 },
    { key: 9, test: () => hasPositiveTerm(text, ['test', 'audit', 'verify', 'verification', 'pytest']), label: 'Deterministic Verification Test Suite (Yod)', weight: 6 },
    { key: 11, test: () => hasPositiveTerm(text, ['budget', 'metric', 'eval', 'benchmark', 'latency']), label: 'Performance & Budget Equilibrated (Lamed)', weight: 4 },
    { key: 13, test: () => hasPositiveTerm(text, ['clean', 'prune', 'remove', 'purge']), label: 'Resource Pruning & Cleanup (Nun)', weight: 4 },
    { key: 15, test: () => !text.includes('placeholder') && !text.includes('mock_production') && !text.includes('fake_data'), label: 'Truth In Advertising / No Fake State (Ayin)', weight: 6 },
    { key: 17, test: () => hasPositiveTerm(text, ['log', 'telemetry', 'trace', 'stdout', 'diagnostic']), label: 'Clear Logging & Diagnostics (Tzaddi)', weight: 4 },
    { key: 20, test: () => hasPositiveTerm(text, ['release', 'deploy', 'deliver', 'ci']), label: 'Integration Gate & Release Verification (Shin)', weight: 5 },
    { key: 21, test: () => !text.includes('cloud-only') && hasPositiveTerm(text, ['offline', 'local-first', 'sovereign']), label: 'Sovereign Wholeness & Local Autonomy (Tav)', weight: 5 },
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

export function autoHardenSpec(planText = '', projectName = 'Sovereign Zero-Egress Enclave') {
  let nextText = (planText || '').trim();
  const replacements = [
    [/\bwith\s+no\s+tests?\s+(?:or|and)\s+boundar(?:y|ies)\b/gi, 'with automated verification tests and explicit security boundaries'],
    [/\b(?:with\s+)?no\s+tests?\b/gi, 'with automated verification tests'],
    [/\bwithout\s+tests?\b/gi, 'with automated verification tests'],
    [/\b(?:with\s+)?no\s+boundar(?:y|ies)\b/gi, 'with explicit security boundaries'],
    [/\bwithout\s+boundar(?:y|ies)\b/gi, 'with explicit security boundaries'],
    [/\bplaceholder\s+mock_production\s+responses\b/gi, 'verified production API handlers'],
    [/\bfake_data\s+timers\b/gi, 'deterministic live execution loops'],
    [/\bcloud-only\b/gi, 'local-first sovereign'],
    [/\bplaceholder\b/gi, 'verified implementation'],
    [/\bmock_production\b/gi, 'verified_production'],
    [/\bfake_data\b/gi, 'canonical_fixtures'],
  ];
  for (const [pattern, repl] of replacements) {
    nextText = nextText.replace(pattern, repl);
  }

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
    15: `Anti-Deception Guarantee (Key 15 · Ayin): Zero fabricated state—all transforms, metrics, and outputs execute real algorithms.`,
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
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

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

  // Dual-theme Editorial Ivory / Sovereign Obsidian palette tokens
  const t = isLight
    ? {
        shellBg: '#FAF8F3',
        topBarBg: '#F3EFE6',
        panelBg: '#FFFFFF',
        subPanelBg: '#F6F2E8',
        codeBg: '#F3EFE6',
        inputBg: '#FFFFFF',
        border: 'rgba(138, 102, 24, 0.24)',
        divider: 'rgba(26, 24, 21, 0.1)',
        gold: '#8A6414',
        goldStrong: '#6E4E0B',
        goldSoftBg: 'rgba(138, 100, 20, 0.1)',
        goldChipBg: '#8A6414',
        goldChipText: '#FFFFFF',
        ink: '#1A1815',
        muted: '#475569',
        emerald: '#047857',
        emeraldBg: 'rgba(4, 120, 87, 0.1)',
        emeraldBorder: 'rgba(4, 120, 87, 0.35)',
        danger: '#B91C1C',
        dangerBg: 'rgba(185, 28, 28, 0.08)',
        dangerBorder: 'rgba(185, 28, 28, 0.35)',
        sky: '#0369A1',
        skyBorder: 'rgba(3, 105, 161, 0.35)',
        scrollThumb: 'rgba(138, 100, 20, 0.42)',
        scrollTrack: '#EDE8DC',
        shadow: '0 14px 40px rgba(26, 24, 21, 0.08)',
      }
    : {
        shellBg: '#07070C',
        topBarBg: '#0B0B14',
        panelBg: '#090910',
        subPanelBg: '#080811',
        codeBg: '#030306',
        inputBg: 'rgba(0,0,0,0.45)',
        border: 'rgba(212, 175, 55, 0.32)',
        divider: 'rgba(255,255,255,0.08)',
        gold: '#D4AF37',
        goldStrong: '#F5E6AB',
        goldSoftBg: 'rgba(212,175,55,0.14)',
        goldChipBg: '#D4AF37',
        goldChipText: '#060609',
        ink: '#F8FAFC',
        muted: '#94A3B8',
        emerald: '#34D399',
        emeraldBg: 'rgba(52,211,153,0.15)',
        emeraldBorder: 'rgba(52,211,153,0.4)',
        danger: '#F87171',
        dangerBg: 'rgba(248,113,113,0.15)',
        dangerBorder: 'rgba(248,113,113,0.4)',
        sky: '#38BDF8',
        skyBorder: 'rgba(56,189,248,0.4)',
        scrollThumb: 'rgba(212, 175, 55, 0.42)',
        scrollTrack: '#0C0C14',
        shadow: '0 20px 60px rgba(0,0,0,0.85)',
      };

  const inlineCodeSx = {
    fontFamily: mono,
    fontSize: '0.9em',
    px: 0.6,
    py: 0.15,
    borderRadius: 1,
    bgcolor: isLight ? 'rgba(138,100,20,0.1)' : 'rgba(255,255,255,0.08)',
    color: t.goldStrong,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let tick = 0;

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
      if (running) tick += 0.018;
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
          const wave = 0.5 + 0.5 * Math.cos(dist * 10 - tick * 2.4 + selectedIdx * 0.4);
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

        const p = (tick * 0.65 + i * 0.13) % 1;
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
        const pulse = 1 + 0.14 * Math.sin(tick * 3 + idx);

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

      ctx.fillStyle = 'rgba(5, 5, 9, 0.86)';
      ctx.fillRect(0, 0, cw, 42);
      ctx.fillStyle = 'rgba(245, 230, 171, 0.94)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`ADYTUM PLANNER // KEY [${activeKey.arcana.toUpperCase()}]`, 14, 16);
      ctx.fillStyle = audit.passed ? '#34D399' : '#F87171';
      ctx.fillText(
        `GATEKEEPER SCORE: ${audit.score}/100 (${audit.grade}) — ${audit.checks.filter((c) => c.passed).length}/${audit.checks.length} RULES PASSED`,
        14,
        31
      );

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
          protocol: 'adytum.hermetic.rite.v2',
          version: '2.4.0',
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
          cliEquivalent: `adytum invariants "${projectName}" --json && adytum validate ./plan.md --json`,
        },
        null,
        2
      ),
    [projectName, activeKey, incubationDepth, audit]
  );

  const markdownPrd = useMemo(() => {
    const lines = [
      `# Adytum Planner — 22-Key Hermetic Architectural Rite: ${projectName}`,
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
    try { navigator.clipboard?.writeText(artifactJson)?.catch?.(() => {}); } catch {}
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  const copyMarkdown = () => {
    try { navigator.clipboard?.writeText(markdownPrd)?.catch?.(() => {}); } catch {}
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

  const scrollStyles = {
    scrollbarWidth: 'thin',
    scrollbarColor: `${t.scrollThumb} ${t.scrollTrack}`,
    '&::-webkit-scrollbar': { width: 6, height: 6 },
    '&::-webkit-scrollbar-track': { background: t.scrollTrack, borderRadius: 4 },
    '&::-webkit-scrollbar-thumb': { background: t.scrollThumb, borderRadius: 4 },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: t.shellBg,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: `1px solid ${t.divider}`,
          bgcolor: t.topBarBg,
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
              bgcolor: t.goldSoftBg,
              border: `1px solid ${t.border}`,
              color: t.gold,
              display: 'flex',
            }}
          >
            <AccountTreeIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: t.gold, letterSpacing: '0.1em' }}>
                ADYTUM PLANNER · 22-KEY HERMETIC AI WORKBENCH &amp; GATEKEEPER
              </Typography>
              <Chip
                label={`GATE SCORE: ${audit.score}/100 (${audit.grade})`}
                size="small"
                sx={{
                  height: 22,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: audit.passed ? t.emeraldBg : t.dangerBg,
                  color: audit.passed ? t.emerald : t.danger,
                  border: `1px solid ${audit.passed ? t.emeraldBorder : t.dangerBorder}`,
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: t.muted, display: 'block', mt: 0.4 }}>
              All 22 Canonical BOTA Keys (0–21) • 15-Rule Negation-Aware Spec Validator • ZothOS CLI{' '}
              <Box component="code" sx={inlineCodeSx}>adytum</Box> &amp; Local Workbench{' '}
              <Box component="code" sx={inlineCodeSx}>127.0.0.1:8135</Box>
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {isLocalRuntime() && (
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
                color: t.goldStrong,
                borderColor: t.border,
                bgcolor: t.goldSoftBg,
              }}
            >
              Open :8135 Workbench
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={() => setRunning((r) => !r)}
            startIcon={running ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: t.ink,
              borderColor: t.divider,
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
              color: t.emerald,
              borderColor: t.emeraldBorder,
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
              color: t.sky,
              borderColor: t.skyBorder,
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
              bgcolor: t.goldChipBg,
              color: t.goldChipText,
              '&:hover': { bgcolor: t.gold },
            }}
          >
            {copiedJson ? 'JSON Copied' : 'Export JSON Manifest'}
          </Button>
        </Stack>
      </Box>

      <SovereignEyebrow accent={t.emerald} right="Planning · v2.4.0">
        {"adytum-alchemist-ai-workflow"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"adytum-alchemist-ai-workflow"}
        eyebrow={"Planning"}
        caption={"Adytum Planner"}
        label={"Adytum Planner — 22-Key Hermetic AI Workbench"}
      />

      <Grid container>
        {/* Left Column: Tree of Life Canvas + Active BOTA Tarot Card + 3D GLB + All 22 Keys */}
        <Grid xs={12} md={6} sx={{ borderRight: { md: `1px solid ${t.divider}` }, bgcolor: t.subPanelBg }}>
          <Box sx={{ width: '100%', height: 340, bgcolor: '#050509' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          {/* Active BOTA Tarot Card Preview Strip + 3D .GLB Diorama & Arcane Video Loop */}
          {(() => {
            const tarot3dMeta = ADYTUM_22_TAROT_KEYS[activeKey.key] || ADYTUM_22_TAROT_KEYS[0];
            return (
              <Box
                sx={{
                  p: 1.75,
                  borderTop: `1px solid ${t.divider}`,
                  bgcolor: t.panelBg,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2, mb: 1.5 }}>
                  <AdytumArcanaCard
                    keyNumber={activeKey.key}
                    themeMode={isLight ? 'light' : 'dark'}
                    width={148}
                    showFlipButton
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: isLight ? t.goldStrong : tarot3dMeta.primaryColor }}>
                      {activeKey.arcana} — {activeKey.phase}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: t.gold, display: 'block', mt: 0.25 }}>
                      Hebrew Letter: {activeKey.letter} (Gematria: {activeKey.gematria}) • Gate: {activeKey.gate}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: isLight ? t.emerald : tarot3dMeta.secondaryColor, display: 'block', mt: 0.25, fontWeight: 700 }}>
                      3D Studio Arcana: {tarot3dMeta.spellName} • Guardian: {tarot3dMeta.guardianAgent}
                    </Typography>
                    <Typography variant="body2" sx={{ color: t.ink, fontSize: '0.78rem', mt: 0.5, lineHeight: 1.45 }}>
                      {activeKey.prompt}
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid xs={12} sm={7}>
                    <SovereignGLBViewport
                      glbUrl={tarot3dMeta.glbUrl}
                      posterUrl={tarot3dMeta.hdImageUrl}
                      primaryColor={tarot3dMeta.primaryColor}
                      secondaryColor={tarot3dMeta.secondaryColor}
                      badgeText={`KEY ${tarot3dMeta.roman} 3D DIORAMA .GLB`}
                      subtitleText={`${tarot3dMeta.guardianAgent} • ${tarot3dMeta.spellName}`}
                      mode="tarot"
                      height={195}
                    />
                  </Grid>
                  <Grid xs={12} sm={5}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 195,
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        border: `1px solid ${t.border}`,
                        bgcolor: '#05070E',
                      }}
                    >
                      <video
                        key={tarot3dMeta.videoUrl}
                        src={tarot3dMeta.videoUrl}
                        poster={tarot3dMeta.hdImageUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <Chip
                        label="LTX-VIDEO 2B ARCANE LOOP"
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          fontFamily: mono,
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          height: 20,
                          bgcolor: 'rgba(5,7,14,0.85)',
                          color: tarot3dMeta.secondaryColor,
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            );
          })()}

          <Box
            sx={{
              p: 1.75,
              borderTop: `1px solid ${t.divider}`,
              bgcolor: t.subPanelBg,
            }}
          >
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: t.gold, mb: 1 }}>
              SELECT CANONICAL HERMETIC KEY (ALL 22 KEYS: 0 THE FOOL → 21 THE WORLD)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 165, overflowY: 'auto', pr: 0.5, ...scrollStyles }}>
              {HERMETIC_KEYS.map((item, idx) => (
                <Button
                  key={item.key}
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedIdx(idx)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    py: 0.45,
                    px: 1.1,
                    textTransform: 'none',
                    bgcolor: selectedIdx === idx ? t.goldChipBg : t.panelBg,
                    color: selectedIdx === idx ? t.goldChipText : t.ink,
                    borderColor: selectedIdx === idx ? t.goldChipBg : t.divider,
                  }}
                >
                  {item.arcana}
                </Button>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Specification Input, Presets, Auto-Harden, and Live 15-Rule Gatekeeper Audit */}
        <Grid xs={12} md={6} sx={{ p: 2.5, bgcolor: t.panelBg, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: t.muted }}>
                PROJECT NAME &amp; ARCHITECTURAL SPECIFICATION (LIVE 22-KEY GATEKEEPER)
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIntention(HARDENED_SPEC_PRESET)}
                  sx={{ fontFamily: mono, fontSize: '0.64rem', py: 0.3, px: 1, color: t.emerald, borderColor: t.emeraldBorder }}
                >
                  Hardened (100/100)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setIntention(FLAWED_SPEC_PRESET)}
                  sx={{ fontFamily: mono, fontSize: '0.64rem', py: 0.3, px: 1, color: t.danger, borderColor: t.dangerBorder }}
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
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    py: 0.3,
                    px: 1.2,
                    bgcolor: t.goldSoftBg,
                    color: t.goldStrong,
                    border: `1px solid ${t.border}`,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: t.goldChipBg, color: t.goldChipText },
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
              inputProps={{ 'aria-label': 'Project Name' }}
              sx={{
                mb: 1.2,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  bgcolor: t.inputBg,
                  color: t.ink,
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={5}
              size="small"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              inputProps={{ 'aria-label': 'Architectural Specification' }}
              sx={{
                mb: 1.5,
                '& .MuiInputBase-root': {
                  fontFamily: mono,
                  fontSize: '0.74rem',
                  bgcolor: t.inputBg,
                  color: t.ink,
                },
                '& textarea': scrollStyles,
              }}
            />

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: t.muted }}>INCUBATION GATE DURATION</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: t.gold, fontWeight: 800 }}>{incubationDepth} min</Typography>
              </Box>
              <Slider size="small" min={1} max={22} value={incubationDepth} onChange={(_, v) => setIncubationDepth(v)} aria-label="Incubation Gate Duration" sx={{ color: t.gold }} />
            </Box>

            {/* Live 15-Check Invariant Matrix */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: t.subPanelBg,
                border: `1px solid ${audit.passed ? t.emeraldBorder : t.dangerBorder}`,
                maxHeight: 230,
                overflowY: 'auto',
                ...scrollStyles,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {audit.passed ? (
                    <VerifiedUserIcon sx={{ fontSize: 16, color: t.emerald }} />
                  ) : (
                    <WarningAmberIcon sx={{ fontSize: 16, color: t.danger }} />
                  )}
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: audit.passed ? t.emerald : t.danger }}>
                    {audit.passed ? 'PASSED HERMETIC GATE' : 'FAILED HERMETIC GATE'} — {audit.score}/100 ({audit.grade})
                  </Typography>
                </Stack>
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: t.muted }}>
                  {audit.checks.filter((c) => c.passed).length}/{audit.checks.length} Checks
                </Typography>
              </Stack>
              <Grid container spacing={0.75}>
                {audit.checks.map((c) => (
                  <Grid xs={12} sm={6} key={c.keyNumber}>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.64rem',
                        color: c.passed ? t.emerald : t.danger,
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

      <Divider sx={{ borderColor: t.divider }} />

      {/* Bottom Section: How It Works, What It Does & Verified ZothOS CLI Reference */}
      <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: t.topBarBg }}>
        <Grid container spacing={2.5}>
          <Grid xs={12} md={6}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: t.gold, mb: 1 }}>
              HOW ADYTUM PLANNER WORKS &amp; WHAT IT DOES
            </Typography>
            <Typography variant="body2" sx={{ color: t.ink, fontSize: '0.82rem', lineHeight: 1.6, mb: 1.2 }}>
              <strong>Adytum Planner — 22-Key Hermetic AI Workbench</strong> maps all 22 Major Arcana (<strong>Key 0 The Fool</strong> through <strong>Key 21 The World</strong>) to concrete software engineering invariants, offline AI-Chemistry study lessons, and a negation-aware 15-rule specification validator:
            </Typography>
            <Stack spacing={0.6} sx={{ fontFamily: mono, fontSize: '0.72rem', color: t.muted }}>
              <Box>• <strong>1. Studio Gatekeeper &amp; 3D Deck</strong>: Audit plans against 15 negation-aware invariants right here, inspect 3D Arcana dioramas, and export Markdown PRDs or JSON manifests.</Box>
              <Box>• <strong>2. Standalone Workbench (:8135)</strong>: Launch <Box component="code" sx={inlineCodeSx}>http://127.0.0.1:8135</Box> for the 22-Key BOTA contemplation timer, offline AI-Chemistry curriculum, and local Ollama guide.</Box>
              <Box>• <strong>3. Deterministic CLI &amp; Loopback API</strong>: Run <Box component="code" sx={inlineCodeSx}>adytum validate</Box>, <Box component="code" sx={inlineCodeSx}>adytum harden</Box>, or <Box component="code" sx={inlineCodeSx}>POST /api/validate</Box> in CI pipelines.</Box>
            </Stack>
          </Grid>

          <Grid xs={12} md={6}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" gap={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TerminalIcon sx={{ fontSize: 16, color: t.emerald }} />
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: t.emerald }}>
                  ZOTHOS CLI COMMANDS (<Box component="code" sx={inlineCodeSx}>/usr/local/bin/adytum</Box>)
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
                sx={{ fontFamily: mono, fontSize: '0.64rem', py: 0.25, px: 1, color: t.emerald, borderColor: t.emeraldBorder }}
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
                bgcolor: t.codeBg,
                border: `1px solid ${t.emeraldBorder}`,
                fontFamily: mono,
                fontSize: '0.68rem',
                color: t.ink,
                overflowX: 'auto',
                lineHeight: 1.55,
                ...scrollStyles,
              }}
            >
{`# Installed globally on ZothOS as 'adytum' and 'adytum-alchemist-ai-workflow'
adytum list                          # List all 22 Hermetic Keys & directives
adytum key 7 --json                  # Inspect Key 7 (The Chariot / Cheth)
adytum invariants "${projectName}"   # Print 22-point project invariant checklist
adytum validate ./plan.md --json     # Negation-aware audit (exit 0 if score >= 70)
adytum harden ./plan.md              # Auto-harden a draft spec to 100/100 (A+)
adytum serve --port 8135             # Start loopback workbench on 127.0.0.1:8135`}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
