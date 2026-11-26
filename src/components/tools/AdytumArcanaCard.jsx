import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const ARCANA_META = {
  0: { keyNumber: 0, roman: '0', name: 'The Fool', subtitle: 'Zero-Point Potential', hebrew: 'א', letterName: 'Aleph', gematria: 1, element: 'Air', gate: 'Air / Pneuma', guardian: 'AZOTH', phase: 'Pure Potentiality & Unbounded Ideation', directive: 'Strip all inherited assumptions; define the irreducible sovereign objective.' },
  1: { keyNumber: 1, roman: 'I', name: 'The Magician', subtitle: 'Single-Pointed Logos', hebrew: 'ב', letterName: 'Beth', gematria: 2, element: 'Air', gate: 'Mercury / Logos', guardian: 'HERMES', phase: 'Focused Intention & Single-Pointed Execution', directive: 'Bind local CLI tools, MCP endpoints, and hardware compute to a single unambiguous goal.' },
  2: { keyNumber: 2, roman: 'II', name: 'The High Priestess', subtitle: 'Cryptographic Memory', hebrew: 'ג', letterName: 'Gimel', gematria: 3, element: 'Water', gate: 'Moon / Memory', guardian: 'LUCY', phase: 'Cryptographic Memory & Zero-Leak Storage', directive: 'Preserve state across sessions in deterministic local stores with zero unauthorized egress.' },
  3: { keyNumber: 3, roman: 'III', name: 'The Empress', subtitle: 'Generative Synthesis', hebrew: 'ד', letterName: 'Daleth', gematria: 4, element: 'Earth', gate: 'Venus / Door', guardian: 'AURORA', phase: 'Generative Architecture & Organic Scalability', directive: 'Compose clean primitives that multiply downstream capability without brittle coupling.' },
  4: { keyNumber: 4, roman: 'IV', name: 'The Emperor', subtitle: 'Immutable Invariants', hebrew: 'ה', letterName: 'Heh', gematria: 5, element: 'Fire', gate: 'Aries / Sight', guardian: 'ATLAS', phase: 'Immutable Invariants & Structural Governance', directive: 'Enforce strict schemas and constitutional assertions at every system boundary.' },
  5: { keyNumber: 5, roman: 'V', name: 'The Hierophant', subtitle: 'Canonical Contracts', hebrew: 'ו', letterName: 'Vav', gematria: 6, element: 'Earth', gate: 'Taurus / Nail', guardian: 'CODEX', phase: 'Standardized Contracts & Semantic Schemas', directive: 'Expose canonical JSON-RPC / MCP and CLI contracts so humans and agents interoperate cleanly.' },
  6: { keyNumber: 6, roman: 'VI', name: 'The Lovers', subtitle: 'Explicit Boundaries', hebrew: 'ז', letterName: 'Zain', gematria: 7, element: 'Air', gate: 'Gemini / Sword', guardian: 'ORION', phase: 'Binary Tradeoff Discipline & Clean Boundaries', directive: 'State explicit non-goals, security separations, and architectural tradeoffs.' },
  7: { keyNumber: 7, roman: 'VII', name: 'The Chariot', subtitle: 'Loopback Enclosure', hebrew: 'ח', letterName: 'Cheth', gematria: 8, element: 'Water', gate: 'Cancer / Armor', guardian: 'DRACO', phase: 'Air-Gapped Isolation & Sandbox Enclosures', directive: 'Lock the execution harness to loopback silicon (127.0.0.1) with 100% offline capability.' },
  8: { keyNumber: 8, roman: 'VIII', name: 'Strength', subtitle: 'Resilient Recovery', hebrew: 'ט', letterName: 'Teth', gematria: 9, element: 'Fire', gate: 'Leo / Serpent', guardian: 'AEGIS', phase: 'Graceful Error Handling & Self-Healing Loops', directive: 'Wrap subprocesses, ports, and model calls in bounded retry and deterministic fallback loops.' },
  9: { keyNumber: 9, roman: 'IX', name: 'The Hermit', subtitle: 'Deterministic Audits', hebrew: 'י', letterName: 'Yod', gematria: 10, element: 'Earth', gate: 'Virgo / Lantern', guardian: 'SENTINEL', phase: 'Deterministic Verification & Zero-Dependency Audits', directive: 'Prove runtime behavior with self-contained smoke tests rather than trusting documentation.' },
  10: { keyNumber: 10, roman: 'X', name: 'Wheel of Fortune', subtitle: 'Replayable State Loops', hebrew: 'כ', letterName: 'Kaph', gematria: 20, element: 'Fire', gate: 'Jupiter / Cycle', guardian: 'CHRONOS', phase: 'State Loop Determinism & Replayability', directive: 'Ensure event loops and state transitions resume idempotently across restarts.' },
  11: { keyNumber: 11, roman: 'XI', name: 'Justice', subtitle: 'Equilibrated Budgets', hebrew: 'ל', letterName: 'Lamed', gematria: 30, element: 'Air', gate: 'Libra / Scales', guardian: 'MAAT', phase: 'Strict Verification Tests & Equilibrated Budgets', directive: 'Enforce concrete latency, memory, and accuracy budgets with automated assertions.' },
  12: { keyNumber: 12, roman: 'XII', name: 'The Hanged Man', subtitle: 'Reactive Async Flow', hebrew: 'מ', letterName: 'Mem', gematria: 40, element: 'Water', gate: 'Water / Reversal', guardian: 'NEXUS', phase: 'Asynchronous Non-Blocking Flow & Calm Pacing', directive: 'Replace busy polling and blocking bottlenecks with reactive event-driven wakeups.' },
  13: { keyNumber: 13, roman: 'XIII', name: 'Death', subtitle: 'Cruft Pruning', hebrew: 'נ', letterName: 'Nun', gematria: 50, element: 'Water', gate: 'Scorpio / Transformation', guardian: 'SCYTHE', phase: 'Ruthless Cruft Pruning & Resource Cleanup', directive: 'Prune dead state, zombie processes, stale caches, and legacy paywall clutter.' },
  14: { keyNumber: 14, roman: 'XIV', name: 'Temperance', subtitle: 'Calibrated Equilibrium', hebrew: 'ס', letterName: 'Samekh', gematria: 60, element: 'Fire', gate: 'Sagittarius / Synthesis', guardian: 'ALCHEMIST', phase: 'Rate-Limiting & High-Concurrence Harmony', directive: 'Harmonize CLI backend and browser UI in calibrated equilibrium without state drift.' },
  15: { keyNumber: 15, roman: 'XV', name: 'The Devil', subtitle: 'Anti-Deception Audit', hebrew: 'ע', letterName: 'Ayin', gematria: 70, element: 'Earth', gate: 'Capricorn / Eye', guardian: 'VERITAS', phase: 'Anti-Deception Audit & Elimination of Mock State', directive: 'Banish fake placeholders, mock responses, and misleading cipher labels.' },
  16: { keyNumber: 16, roman: 'XVI', name: 'The Tower', subtitle: 'Chaos Resilience', hebrew: 'פ', letterName: 'Peh', gematria: 80, element: 'Fire', gate: 'Mars / Lightning', guardian: 'VULCAN', phase: 'Chaos Resilience & Graceful Crash Recovery', directive: 'Test fault injection and atomic writes so abrupt termination never corrupts user state.' },
  17: { keyNumber: 17, roman: 'XVII', name: 'The Star', subtitle: 'Transparent Telemetry', hebrew: 'צ', letterName: 'Tzaddi', gematria: 90, element: 'Air', gate: 'Aquarius / Star', guardian: 'AETHER', phase: 'Transparent Telemetry & Clear Logging', directive: 'Provide structured diagnostics (/health, --json) so operators see live health in <5s.' },
  18: { keyNumber: 18, roman: 'XVIII', name: 'The Moon', subtitle: 'Deep Synaptic Retention', hebrew: 'ק', letterName: 'Qoph', gematria: 100, element: 'Water', gate: 'Pisces / Soma', guardian: 'MNEMOSYNE', phase: 'Deep Synaptic Retention & Subconscious Caches', directive: 'Preserve lineage history and user artifacts seamlessly across upgrades.' },
  19: { keyNumber: 19, roman: 'XIX', name: 'The Sun', subtitle: 'High-Fidelity Craft', hebrew: 'ר', letterName: 'Resh', gematria: 200, element: 'Fire', gate: 'Sun / Radiance', guardian: 'HELIOS', phase: 'Production-Grade Elegance & High-Fidelity UI', directive: 'Deliver high-contrast, responsive UI across mobile, tablet, and desktop viewports.' },
  20: { keyNumber: 20, roman: 'XX', name: 'Judgement', subtitle: 'Release Gate Sentinel', hebrew: 'ש', letterName: 'Shin', gematria: 300, element: 'Fire', gate: 'Fire / Awakening', guardian: 'ARCHON', phase: 'Comprehensive Integration Sentinel & Release Gate', directive: 'Verify README, in-app docs, CLI --help, and live UI parity before release.' },
  21: { keyNumber: 21, roman: 'XXI', name: 'The World', subtitle: 'Sovereign Wholeness', hebrew: 'ת', letterName: 'Tav', gematria: 400, element: 'Earth', gate: 'Saturn / Crown', guardian: 'THOTH', phase: 'Hermetic Sovereign Wholeness & Zero-Egress Proof', directive: 'Seal the compiled artifact, emit deterministic manifest, and ship 100% open-access.' },
};

const ELEMENT_COLORS = {
  Air: { glow: 'rgba(56, 189, 248, 0.24)', stroke: '#7DD3FC', badgeText: '#BAE6FD', badgeBorder: 'rgba(125, 211, 252, 0.48)' },
  Fire: { glow: 'rgba(249, 115, 22, 0.24)', stroke: '#FDBA74', badgeText: '#FED7AA', badgeBorder: 'rgba(253, 186, 116, 0.48)' },
  Water: { glow: 'rgba(129, 140, 248, 0.26)', stroke: '#A5B4FC', badgeText: '#C7D2FE', badgeBorder: 'rgba(165, 180, 252, 0.48)' },
  Earth: { glow: 'rgba(16, 185, 129, 0.24)', stroke: '#6EE7B7', badgeText: '#A7F3D0', badgeBorder: 'rgba(110, 231, 183, 0.48)' },
};

function starPath(cx, cy, rOut, rIn, pts, rotDeg = -90) {
  const coords = [];
  for (let i = 0; i < pts * 2; i += 1) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = ((rotDeg + i * (180 / pts)) * Math.PI) / 180;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${coords.join(' L')} Z`;
}

function polyPath(cx, cy, r, sides, rotDeg = -90) {
  const coords = [];
  for (let i = 0; i < sides; i += 1) {
    const a = ((rotDeg + i * (360 / sides)) * Math.PI) / 180;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${coords.join(' L')} Z`;
}

function StudioArcanaSVG({ keyNumber, element }) {
  const accent = ELEMENT_COLORS[element].stroke;
  const cx = 120;
  const cy = 125;
  const R = 84;
  const goldGrad = `url(#sgold-${keyNumber})`;
  const glowGrad = `url(#sglow-${keyNumber})`;

  const ticks = Array.from({ length: 36 }, (_, i) => {
    const deg = i * 10;
    const a = (deg * Math.PI) / 180;
    const major = deg % 30 === 0;
    const r1 = major ? R - 8 : R - 4;
    return (
      <line
        key={deg}
        x1={cx + r1 * Math.cos(a)}
        y1={cy + r1 * Math.sin(a)}
        x2={cx + R * Math.cos(a)}
        y2={cy + R * Math.sin(a)}
        stroke={major ? '#F8E5A0' : 'rgba(212,175,55,0.45)'}
        strokeWidth={major ? 1.5 : 0.8}
      />
    );
  });

  const renderSymbol = () => {
    switch (keyNumber) {
      case 0:
        return (
          <g>
            <path d={starPath(cx, cy - 22, 34, 15, 12)} fill="rgba(212,175,55,0.22)" stroke={goldGrad} strokeWidth="1.5" />
            <circle cx={cx} cy={cy - 22} r="13" fill="#FAF6EA" stroke={goldGrad} strokeWidth="1.5" />
            <polygon points={`${cx - 56},${cy + 46} ${cx - 18},${cy - 2} ${cx + 18},${cy + 46}`} fill="none" stroke={goldGrad} strokeWidth="1.8" />
            <polygon points={`${cx - 8},${cy + 46} ${cx + 28},${cy + 8} ${cx + 56},${cy + 46}`} fill="none" stroke={accent} strokeWidth="1.8" />
            <line x1={cx - 60} y1={cy + 46} x2={cx + 60} y2={cy + 46} stroke={goldGrad} strokeWidth="1.6" />
          </g>
        );
      case 1:
        return (
          <g>
            <path d="M 80 86 C 80 68, 108 68, 120 86 C 132 104, 160 104, 160 86 C 160 68, 132 68, 120 86 C 108 104, 80 104, 80 86 Z" fill="none" stroke={goldGrad} strokeWidth="2.4" />
            <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 54} stroke={goldGrad} strokeWidth="2.4" />
            <circle cx={cx} cy={cy - 22} r="5" fill="#F8E5A0" />
            <path d={polyPath(cx - 38, cy + 16, 14, 3, -90)} fill="none" stroke={accent} strokeWidth="1.6" />
            <path d={polyPath(cx + 38, cy + 16, 14, 3, 90)} fill="none" stroke={accent} strokeWidth="1.6" />
            <path d={polyPath(cx - 28, cy + 44, 11, 4, 45)} fill="none" stroke={goldGrad} strokeWidth="1.5" />
            <circle cx={cx + 28} cy={cy + 44} r="10" fill="none" stroke={goldGrad} strokeWidth="1.5" />
          </g>
        );
      case 2:
        return (
          <g>
            <rect x={cx - 52} y={cy - 46} width="18" height="94" rx="2" fill="rgba(20,24,38,0.9)" stroke={goldGrad} strokeWidth="1.6" />
            <rect x={cx + 34} y={cy - 46} width="18" height="94" rx="2" fill="rgba(245,238,220,0.9)" stroke={goldGrad} strokeWidth="1.6" />
            <circle cx={cx} cy={cy - 10} r="22" fill="none" stroke={accent} strokeWidth="1.7" />
            <path d={`M ${cx - 16} ${cy + 26} A 18 18 0 1 0 ${cx + 16} ${cy + 26} A 13 13 0 1 1 ${cx - 16} ${cy + 26} Z`} fill={goldGrad} />
          </g>
        );
      case 3:
        return (
          <g>
            <circle cx={cx} cy={cy - 10} r="28" fill="none" stroke={goldGrad} strokeWidth="2.4" />
            <line x1={cx} y1={cy + 18} x2={cx} y2={cy + 56} stroke={goldGrad} strokeWidth="2.4" />
            <line x1={cx - 20} y1={cy + 36} x2={cx + 20} y2={cy + 36} stroke={goldGrad} strokeWidth="2.4" />
            <path d={polyPath(cx, cy - 10, 18, 6)} fill="none" stroke={accent} strokeWidth="1.5" />
          </g>
        );
      case 4:
        return (
          <g>
            <rect x={cx - 38} y={cy - 16} width="76" height="64" fill="none" stroke={goldGrad} strokeWidth="2" />
            <rect x={cx - 24} y={cy - 2} width="48" height="36" fill="none" stroke={accent} strokeWidth="1.5" />
            <polyline points={`${cx - 36},${cy - 20} ${cx - 18},${cy - 48} ${cx},${cy - 26} ${cx + 18},${cy - 48} ${cx + 36},${cy - 20}`} fill="none" stroke={goldGrad} strokeWidth="2.2" />
          </g>
        );
      case 5:
        return (
          <g>
            <line x1={cx} y1={cy - 50} x2={cx} y2={cy + 50} stroke={goldGrad} strokeWidth="2.5" />
            <line x1={cx - 14} y1={cy - 34} x2={cx + 14} y2={cy - 34} stroke={goldGrad} strokeWidth="2.2" />
            <line x1={cx - 22} y1={cy - 18} x2={cx + 22} y2={cy - 18} stroke={goldGrad} strokeWidth="2.2" />
            <line x1={cx - 30} y1={cy} x2={cx + 30} y2={cy} stroke={goldGrad} strokeWidth="2.2" />
            <line x1={cx - 36} y1={cy + 44} x2={cx + 36} y2={cy + 6} stroke={accent} strokeWidth="2" />
            <line x1={cx + 36} y1={cy + 44} x2={cx - 36} y2={cy + 6} stroke={goldGrad} strokeWidth="2" />
          </g>
        );
      case 6:
        return (
          <g>
            <circle cx={cx - 18} cy={cy + 10} r="30" fill="none" stroke={goldGrad} strokeWidth="2" />
            <circle cx={cx + 18} cy={cy + 10} r="30" fill="none" stroke={accent} strokeWidth="2" />
            <path d={starPath(cx, cy - 38, 22, 10, 12)} fill="rgba(212,175,55,0.22)" stroke={goldGrad} strokeWidth="1.5" />
          </g>
        );
      case 7:
        return (
          <g>
            <rect x={cx - 40} y={cy - 44} width="80" height="72" fill="none" stroke={goldGrad} strokeWidth="2.2" />
            <path d={polyPath(cx, cy - 8, 24, 4, 45)} fill="none" stroke={accent} strokeWidth="1.8" />
            <circle cx={cx - 44} cy={cy + 28} r="16" fill="none" stroke={goldGrad} strokeWidth="2" />
            <circle cx={cx + 44} cy={cy + 28} r="16" fill="none" stroke={goldGrad} strokeWidth="2" />
            <path d={starPath(cx - 20, cy - 30, 6, 2.5, 6)} fill="#F8E5A0" />
            <path d={starPath(cx, cy - 30, 6, 2.5, 6)} fill="#F8E5A0" />
            <path d={starPath(cx + 20, cy - 30, 6, 2.5, 6)} fill="#F8E5A0" />
          </g>
        );
      case 8:
        return (
          <g>
            <path d="M 86 84 C 86 70, 110 70, 120 84 C 130 98, 154 98, 154 84 C 154 70, 130 70, 120 84 C 110 98, 86 98, 86 84 Z" fill="none" stroke={goldGrad} strokeWidth="2.2" />
            <path d={starPath(cx, cy + 12, 42, 26, 16)} fill="rgba(212,175,55,0.16)" stroke={goldGrad} strokeWidth="1.8" />
            <circle cx={cx} cy={cy + 12} r="22" fill="none" stroke={accent} strokeWidth="2" />
          </g>
        );
      case 9:
        return (
          <g>
            <path d={polyPath(cx, cy, 48, 6, 0)} fill="none" stroke={goldGrad} strokeWidth="2" />
            <path d={polyPath(cx, cy, 38, 3, -90)} fill="none" stroke={goldGrad} strokeWidth="2" />
            <path d={polyPath(cx, cy, 38, 3, 90)} fill="none" stroke={accent} strokeWidth="2" />
            <circle cx={cx} cy={cy} r="8" fill="#FAF6EA" />
          </g>
        );
      case 10:
        return (
          <g>
            <circle cx={cx} cy={cy} r="54" fill="none" stroke={goldGrad} strokeWidth="2.4" />
            <circle cx={cx} cy={cy} r="40" fill="none" stroke={accent} strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="16" fill="none" stroke={goldGrad} strokeWidth="2" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              return <line key={i} x1={cx + 16 * Math.cos(a)} y1={cy + 16 * Math.sin(a)} x2={cx + 54 * Math.cos(a)} y2={cy + 54 * Math.sin(a)} stroke={goldGrad} strokeWidth="1.7" />;
            })}
          </g>
        );
      case 11:
        return (
          <g>
            <line x1={cx} y1={cy - 54} x2={cx} y2={cy + 54} stroke={goldGrad} strokeWidth="2.6" />
            <line x1={cx - 46} y1={cy - 12} x2={cx + 46} y2={cy - 12} stroke={goldGrad} strokeWidth="2.2" />
            <polyline points={`${cx - 50},${cy + 16} ${cx - 38},${cy - 12} ${cx - 26},${cy + 16}`} fill="none" stroke={accent} strokeWidth="1.6" />
            <polyline points={`${cx + 26},${cy + 16} ${cx + 38},${cy - 12} ${cx + 50},${cy + 16}`} fill="none" stroke={accent} strokeWidth="1.6" />
          </g>
        );
      case 12:
        return (
          <g>
            <line x1={cx - 46} y1={cy - 40} x2={cx + 46} y2={cy - 40} stroke={goldGrad} strokeWidth="3" />
            <line x1={cx} y1={cy - 40} x2={cx} y2={cy + 22} stroke={goldGrad} strokeWidth="2.4" />
            <path d={polyPath(cx, cy - 2, 28, 3, 90)} fill="none" stroke={accent} strokeWidth="2" />
            <path d={starPath(cx, cy + 34, 22, 10, 12)} fill="rgba(212,175,55,0.2)" stroke={goldGrad} strokeWidth="1.6" />
          </g>
        );
      case 13:
        return (
          <g>
            {Array.from({ length: 5 }, (_, i) => {
              const a = ((-90 + i * 72) * Math.PI) / 180;
              return <circle key={i} cx={cx + 18 * Math.cos(a)} cy={cy - 4 + 18 * Math.sin(a)} r="15" fill="none" stroke="#FAF6EA" strokeWidth="1.7" />;
            })}
            <circle cx={cx} cy={cy - 4} r="9" fill={goldGrad} />
            <path d={`M ${cx - 48} ${cy + 36} A 54 54 0 0 1 ${cx + 48} ${cy + 36}`} fill="none" stroke={accent} strokeWidth="2.4" />
          </g>
        );
      case 14:
        return (
          <g>
            <rect x={cx - 38} y={cy - 38} width="76" height="76" fill="none" stroke={goldGrad} strokeWidth="1.8" />
            <path d={polyPath(cx, cy + 4, 34, 3, -90)} fill="none" stroke={goldGrad} strokeWidth="2.2" />
            <path d={`M ${cx - 46} ${cy} Q ${cx - 22} ${cy - 22}, ${cx} ${cy} T ${cx + 46} ${cy}`} fill="none" stroke={accent} strokeWidth="2.4" />
          </g>
        );
      case 15:
        return (
          <g>
            <path d="M 120 172 L 90 88 L 164 140 L 76 140 L 150 88 Z" fill="none" stroke={goldGrad} strokeWidth="2" />
            <ellipse cx={cx} cy={cy} rx="26" ry="14" fill="none" stroke={accent} strokeWidth="1.8" />
            <circle cx={cx} cy={cy} r="8" fill={goldGrad} />
          </g>
        );
      case 16:
        return (
          <g>
            <polygon points={`${cx - 22},${cy + 52} ${cx - 16},${cy - 26} ${cx + 16},${cy - 26} ${cx + 22},${cy + 52}`} fill="none" stroke={goldGrad} strokeWidth="2" />
            <polyline points={`${cx + 48},${cy - 52} ${cx + 10},${cy - 18} ${cx + 24},${cy - 12} ${cx - 38},${cy + 30}`} fill="none" stroke={accent} strokeWidth="3.2" />
          </g>
        );
      case 17:
        return (
          <g>
            <path d={starPath(cx, cy - 8, 38, 14, 8)} fill="rgba(212,175,55,0.22)" stroke={goldGrad} strokeWidth="1.8" />
            <path d={`M ${cx - 46} ${cy + 36} Q ${cx - 22} ${cy + 28}, ${cx} ${cy + 36} T ${cx + 46} ${cy + 36}`} fill="none" stroke={accent} strokeWidth="1.8" />
          </g>
        );
      case 18:
        return (
          <g>
            <path d={`M ${cx + 12} ${cy - 48} A 24 24 0 1 0 ${cx + 12} ${cy - 4} A 18 18 0 1 1 ${cx + 12} ${cy - 48} Z`} fill={goldGrad} />
            <rect x={cx - 48} y={cy + 4} width="22" height="44" fill="none" stroke={goldGrad} strokeWidth="1.8" />
            <rect x={cx + 26} y={cy + 4} width="22" height="44" fill="none" stroke={goldGrad} strokeWidth="1.8" />
          </g>
        );
      case 19:
        return (
          <g>
            <path d={starPath(cx, cy, 54, 28, 16)} fill="rgba(212,175,55,0.22)" stroke={goldGrad} strokeWidth="1.8" />
            <circle cx={cx} cy={cy} r="24" fill="rgba(212,175,55,0.55)" stroke="#FAF6EA" strokeWidth="2" />
          </g>
        );
      case 20:
        return (
          <g>
            <polygon points={`${cx - 10},${cy - 50} ${cx + 10},${cy - 50} ${cx + 26},${cy - 4} ${cx - 26},${cy - 4}`} fill="none" stroke={goldGrad} strokeWidth="2" />
            <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 48} stroke={accent} strokeWidth="2.8" />
            <line x1={cx - 30} y1={cy + 20} x2={cx + 30} y2={cy + 20} stroke={accent} strokeWidth="2.8" />
          </g>
        );
      default:
        return (
          <g>
            <ellipse cx={cx} cy={cy} rx="38" ry="54" fill="none" stroke={goldGrad} strokeWidth="3.2" />
            <ellipse cx={cx} cy={cy} rx="31" ry="47" fill="none" stroke={accent} strokeWidth="1.4" />
            <path d={starPath(cx, cy, 24, 10, 8)} fill="rgba(212,175,55,0.22)" stroke={goldGrad} strokeWidth="1.6" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 240 250" style={{ width: '100%', height: '100%', display: 'block' }} role="img" aria-label={`Sacred geometry plate for Key ${keyNumber}`}>
      <defs>
        <linearGradient id={`sgold-${keyNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8E5A0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8F6A1B" />
        </linearGradient>
        <radialGradient id={`sglow-${keyNumber}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ELEMENT_COLORS[element].glow} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R + 12} fill={glowGrad} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(212,175,55,0.42)" strokeWidth="1.2" />
      {ticks}
      {renderSymbol()}
    </svg>
  );
}

export default function AdytumArcanaCard({ keyNumber = 0, themeMode = 'dark', width = 164, showFlipButton = true }) {
  const meta = ARCANA_META[keyNumber] || ARCANA_META[0];
  const elColor = ELEMENT_COLORS[meta.element];
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef(null);

  useEffect(() => { setFlipped(false); }, [keyNumber]);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq) setReducedMotion(mq.matches);
  }, []);

  const isLight = themeMode === 'light';
  const shellBg = isLight
    ? 'linear-gradient(160deg, #211D17 0%, #15120E 60%, #1D1812 100%)'
    : 'linear-gradient(160deg, #12111A 0%, #090910 55%, #0F0D18 100%)';

  const onMove = (e) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 10, ry: (px - 0.5) * 12, gx: px * 100, gy: py * 100, active: true });
  };

  return (
    <Box sx={{ width, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.9 }}>
      <Box
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false })}
        sx={{ width: '100%', aspectRatio: '2 / 3', perspective: '900px', userSelect: 'none' }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: '14px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)',
            transform: reducedMotion
              ? (flipped ? 'rotateY(180deg)' : 'none')
              : `perspective(900px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${(flipped ? 180 : 0) + tilt.ry}deg)`,
            boxShadow: isLight ? '0 12px 28px rgba(26,24,21,0.22)' : '0 16px 36px rgba(0,0,0,0.72)',
          }}
        >
          {/* FRONT */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '14px',
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              background: shellBg,
              border: '1.5px solid rgba(212, 175, 55, 0.72)',
              backfaceVisibility: 'hidden',
            }}
          >
            {!reducedMotion && tilt.active && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 2,
                  background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(248,229,160,0.22) 0%, transparent 62%)`,
                }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.8, py: 0.45, borderRadius: 1, bgcolor: 'rgba(6,6,11,0.88)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '0.68rem', fontWeight: 700, color: '#F5E6AB' }}>{meta.roman}</Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: '#F8FAFC' }}>{meta.hebrew} · {meta.gematria}</Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.52rem', fontWeight: 700, color: elColor.badgeText, px: 0.5, borderRadius: 1, border: `1px solid ${elColor.badgeBorder}` }}>{meta.element}</Typography>
            </Box>

            <Box sx={{ flex: 1, my: 0.7, borderRadius: 1.5, bgcolor: 'rgba(5,5,9,0.5)', border: '1px solid rgba(212,175,55,0.2)', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StudioArcanaSVG keyNumber={meta.keyNumber} element={meta.element} />
            </Box>

            <Box sx={{ px: 0.8, py: 0.65, borderRadius: 1, bgcolor: 'rgba(6,6,11,0.92)', border: '1px solid rgba(212,175,55,0.35)', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '0.72rem', fontWeight: 700, color: '#F5E6AB', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meta.name}
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.54rem', color: '#CBD5E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meta.subtitle}
              </Typography>
            </Box>
          </Box>

          {/* BACKPLATE */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '14px',
              p: 1.25,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
              background: shellBg,
              border: '1.5px solid rgba(212, 175, 55, 0.72)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Box sx={{ textAlign: 'center', borderBottom: '1px solid rgba(212,175,55,0.28)', pb: 0.6 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.54rem', color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                KEY {meta.keyNumber} · {meta.roman}
              </Typography>
              <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '0.76rem', fontWeight: 700, color: '#F5E6AB' }}>
                {meta.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55, my: 'auto' }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.56rem', color: '#F5E6AB' }}>
                {meta.letterName} ({meta.hebrew}) · {meta.gematria}
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.55rem', color: '#CBD5E1' }}>
                Gate: {meta.gate}
              </Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.55rem', color: '#34D399' }}>
                Guardian: {meta.guardian}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#E2E8F0', lineHeight: 1.35, mt: 0.3 }}>
                {meta.directive}
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.5rem', color: '#94A3B8', textAlign: 'center', borderTop: '1px solid rgba(212,175,55,0.2)', pt: 0.5 }}>
              ADYTUM PLANNER · v2.4.0
            </Typography>
          </Box>
        </Box>
      </Box>

      {showFlipButton && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setFlipped((f) => !f)}
          startIcon={<FlipCameraAndroidIcon sx={{ fontSize: 13 }} />}
          sx={{
            minHeight: 36,
            width: '100%',
            fontFamily: mono,
            fontSize: '0.6rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 99,
            color: isLight ? '#6E4E0B' : '#F5E6AB',
            borderColor: isLight ? 'rgba(138,100,20,0.45)' : 'rgba(212,175,55,0.45)',
          }}
        >
          {flipped ? 'Front Plate' : 'Flip Card'}
        </Button>
      )}
    </Box>
  );
}
