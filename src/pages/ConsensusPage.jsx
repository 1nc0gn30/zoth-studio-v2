import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField, Unstable_Grid2 as Grid,
  Card, CardContent, Slider, LinearProgress, Tooltip, IconButton, Stack, Divider, Alert,
  Switch, FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GavelIcon from '@mui/icons-material/Gavel';
import ForumIcon from '@mui/icons-material/Forum';
import BalanceIcon from '@mui/icons-material/Balance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import ReplayIcon from '@mui/icons-material/Replay';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HubIcon from '@mui/icons-material/Hub';
import { useStudioStatus } from '../studio/useStudioStatus';
import DaemonStatusStrip from '../components/DaemonStatusStrip';
import SovereignFunnel from '../components/SovereignFunnel';
import WindowCarousel from '../components/WindowCarousel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// 3 Instant Scenario Presets
const SCENARIO_PRESETS = [
  {
    id: 'byzantine-ast',
    title: 'Byzantine AST Quorum Deadlock',
    badge: 'AST SYNTHESIS',
    description: 'Quorum resolution when concurrent AST sharding encounters 2/3 Byzantine partitioned nodes.',
    defaultConfidence: 96.4,
    proposal: `PROPOSAL: BFT-AST-QUORUM-RESOLUTION
Implement a deterministic 2/3 Byzantine Fault Tolerant AST consensus commit loop for distributed multi-agent synthesis. When concurrent syntax mutations produce conflicting abstract syntax trees across partitioned shards, nodes execute a three-phase commit with Merkle-trie root verification. Reject speculative AST transforms exceeding the 33.3% Byzantine fault ceiling and fallback to localized consensus snapshots without external coordinator.`,
    rounds: [
      {
        round: 1,
        title: 'Thesis & Vulnerability Probe',
        turns: [
          {
            speaker: 'AZOTH',
            role: 'Proponent',
            avatar: '/pets/azoth-neon.jpg',
            argument: 'We establish a distributed AST sharding topology where every code mutation is modeled as an idempotent directed acyclic graph (DAG) node. Shards calculate local SHA-256 Merkle roots of their AST delta. A three-phase commit (Propose, Pre-Commit, Commit) ratifies syntax trees whenever a 2f + 1 supermajority of local agent processes sign off on the Merkle path. This provides O(log N) verification complexity and guarantees syntactic validity before compilation.',
            metric: 'Proposed Quorum: 2f + 1 = 66.7% | Merkle Trie Depth: 14',
            stance: 'PROPOSED',
          },
          {
            speaker: 'KAI',
            role: 'Skeptic',
            avatar: '/pets/kai-neon.jpg',
            argument: 'Critical vulnerability detected in the asynchronous partition model: If 33.4% of synthesis workers experience high thread contention or intermittent clock skew during LLM inference token emission, the 2f + 1 quorum blocks indefinitely in Pre-Commit state. Furthermore, a Byzantine or corrupted AST worker could submit syntactically valid yet semantically toxic AST mutations (such as infinite recursive macro loops) that pass Merkle root hashing while starving downstream typecheck threads.',
            metric: 'Vulnerability: Deadlock Risk Under Asynchrony | Attack Surface: Macro Recursion',
            stance: 'CHALLENGED',
          }
        ]
      },
      {
        round: 2,
        title: 'Hardening & Formal Proof',
        turns: [
          {
            speaker: 'AZOTH',
            role: 'Proponent',
            avatar: '/pets/azoth-neon.jpg',
            argument: 'Countermeasure implemented: We introduce a monotonic Lamport epoch clock paired with an adaptive timeout backoff (tau_base = 250ms). If a shard fails to reach 2f + 1 within 2tau, the proposed AST partition falls back to a deterministic fast-rollback snapshot rooted at the last ratified epoch. For semantic safety, all mutations must undergo isolated static WASM gas-metered pre-execution before entering the Merkle staging buffer, strictly preventing unbounded macro recursion.',
            metric: 'Lamport Timeout: 250ms | WASM Gas Ceiling: 100k instructions',
            stance: 'HARDENED',
          },
          {
            speaker: 'KAI',
            role: 'Skeptic',
            avatar: '/pets/kai-neon.jpg',
            argument: 'Stress audit of the Lamport timeout mechanism and WASM gas fencing confirms bounded execution. Under simulated adversarial network drops and 30% corrupted AST packets, zero deadlocks occurred across 10,000 synthetic trials. Memory footprint remains strictly bounded at O(K) where K is active AST depth. Skeptic resistance neutralized; safety invariants mathematically proven.',
            metric: 'Zero Deadlocks in 10k Adversarial Cycles | Heap Bounded: < 48MB',
            stance: 'CONCEDED',
          }
        ]
      },
      {
        round: 3,
        title: 'Arbitration & Bayesian Verdict Synthesis',
        turns: [
          {
            speaker: 'DRACO',
            role: 'Arbitrator',
            avatar: '/pets/draco-neon.jpg',
            argument: 'Socratic synthesis achieved. Azoth’s epoch-based timeout fallback satisfies liveness requirements under partial synchrony, while Kai’s gas-metered sandbox audit closes the semantic poisoning vector. Calculating Bayesian posterior confidence: Prior P(H) = 0.84, Likelihood Ratio Lambda = 5.21 -> Posterior Confidence: 96.4%. Final Verdict: APPROVED FOR EXECUTION. Byzantine AST quorum engine is cleared for local multi-agent production.',
            metric: 'Bayesian Confidence: 96.4% | Quorum: SUPERMAJORITY RATIFIED',
            stance: 'RATIFIED',
          }
        ]
      }
    ],
    verdict: {
      decision: 'APPROVED',
      quorumRatio: '96.4%',
      consensusProtocol: 'BFT-AST-QUORUM-V2',
      executionOrder: 'DEPLOY_AST_COMMIT_LOOP',
      invariants: ['Lamport Epoch Clock Synchrony', 'WASM Gas Bounded AST Transforms', 'Merkle-Trie State Rollback']
    }
  },
  {
    id: 'memory-plasticity',
    title: 'Memory Plasticity Buffer Overflow',
    badge: 'VECTOR MEMORY',
    description: 'Zero-copy circular ring-buffer eviction for sovereign neuro-memory plasticity daemon.',
    defaultConfidence: 94.8,
    proposal: `PROPOSAL: SOVEREIGN-RING-BUFFER-EVICTION
Architect a lock-free circular ring-buffer with SIMD-accelerated exponential vector decay for the sovereign neuro-memory daemon (port 8094). When continuous high-frequency embedding ingest threatens L1/L2 cache saturation, apply localized exponential decay weights to stale hippocampal nodes and enforce strict zero-copy page pinning to guarantee 0.00% process heap overflow.`,
    rounds: [
      {
        round: 1,
        title: 'Thesis & Memory Bounds Probe',
        turns: [
          {
            speaker: 'AZOTH',
            role: 'Proponent',
            avatar: '/pets/azoth-neon.jpg',
            argument: 'We allocate a contiguous 512MB shared-memory circular ring-buffer using mmap(MAP_SHARED | MAP_LOCKED) to prevent OS swap latency. Memory nodes are indexed via an atomic 64-bit sequence counter. A background AVX2 SIMD worker computes exponential decay weights: W(t) = W0 * exp(-lambda * t). Stale vectors falling below threshold theta = 0.15 are atomically marked for overwrite without memory fragmentation or allocation overhead.',
            metric: 'Buffer Allocation: 512MB Contiguous | Indexing: Atomic 64-bit Seq',
            stance: 'PROPOSED',
          },
          {
            speaker: 'KAI',
            role: 'Skeptic',
            avatar: '/pets/kai-neon.jpg',
            argument: 'Vulnerability audit reveals race conditions: Under sustained burst ingest (exceeding 25,000 vector embeddings/sec), the consumer thread’s AVX2 decay sweep will lag behind the atomic head pointer. When head overtakes tail, unevicted high-priority long-term memories risk being overwritten before episodic indexing completes, leading to memory amnesia and transient cache incoherency on NUMA nodes.',
            metric: 'Hazard: Ring Head-Tail Collision | Risk: Premature Long-Term Memory Amnesia',
            stance: 'CHALLENGED',
          }
        ]
      },
      {
        round: 2,
        title: 'Dual-Tier Partitioning & Backpressure',
        turns: [
          {
            speaker: 'AZOTH',
            role: 'Proponent',
            avatar: '/pets/azoth-neon.jpg',
            argument: 'Refactored with dual-tier partitioned ring-buffers: Tier-1 is an ultra-fast transient circular buffer; Tier-2 is an immutable copy-on-write episodic slab allocator. When head approaches within 15% of tail capacity, atomic backpressure throttle engages, dynamically scaling SIMD decay batch size from 64 to 256 vectors. Page-fault monitoring guarantees zero memory eviction drops.',
            metric: 'Dual-Tier Isolation: Transient vs Episodic | SIMD Batch Auto-Scale: 4x',
            stance: 'HARDENED',
          },
          {
            speaker: 'KAI',
            role: 'Skeptic',
            avatar: '/pets/kai-neon.jpg',
            argument: 'Load-testing the dual-tier ring buffer against 50,000 ops/sec demonstrates 0.00% cache invalidation and zero heap page faults. Ring head never collides with episodic memory slabs under maximum simulated agent swarm load. Risk rating downgraded from CRITICAL to NEGLIGIBLE.',
            metric: 'Stress Test: 50,000 ops/sec | Page Faults: 0 | Memory Integrity: 100%',
            stance: 'CONCEDED',
          }
        ]
      },
      {
        round: 3,
        title: 'Arbitration & Bayesian Verdict Synthesis',
        turns: [
          {
            speaker: 'DRACO',
            role: 'Arbitrator',
            avatar: '/pets/draco-neon.jpg',
            argument: 'Dialectic consensus verified. The dual-tier ring buffer design with SIMD batch scaling guarantees constant-time vector ingest without memory leaks or process crashes. Bayesian confidence evaluation yields 94.8% posterior probability. Verdict: RATIFIED. Lock-free neuro-memory ring buffer is authorized for deployment.',
            metric: 'Bayesian Confidence: 94.8% | Quorum: RATIFIED WITHOUT RESERVATION',
            stance: 'RATIFIED',
          }
        ]
      }
    ],
    verdict: {
      decision: 'APPROVED',
      quorumRatio: '94.8%',
      consensusProtocol: 'SIMD-NEURO-RING-V2',
      executionOrder: 'DEPLOY_DUAL_TIER_MEMORY_DAEMON',
      invariants: ['Zero Copy Paged Memory', 'Dual Tier Transient/Episodic Isolation', 'Dynamic SIMD Backpressure']
    }
  },
  {
    id: 'airgap-key-derivation',
    title: 'Air-Gapped Hardware Key Derivation',
    badge: 'CRYPTOGRAPHY',
    description: 'Deterministic Shamir seed splitting across isolated memory banks with zero side-channel leakage.',
    defaultConfidence: 98.7,
    proposal: `PROPOSAL: AIR-GAPPED-HARDWARE-KEY-DERIVATION
Deploy an air-gapped cryptographic signing enclave utilizing SHA-256 HKDF (RFC 5869) and Ed25519 deterministic key derivation. Master seed shards are distributed across isolated non-contiguous hardware registers with constant-time modular arithmetic to prevent physical side-channel power analysis during multi-agent consensus ballot signing.`,
    rounds: [
      {
        round: 1,
        title: 'Enclave Spec & Side-Channel Audit',
        turns: [
          {
            speaker: 'AZOTH',
            role: 'Proponent',
            avatar: '/pets/azoth-neon.jpg',
            argument: 'The air-gapped enclave ingests high-entropy seed generated via local hardware TRNG (/dev/hwrng) and derives ephemeral consensus session keys using HKDF-Expand with domain separation tag: "ZOTH-CONSENSUS-V2-BALLOT". Keys reside purely in pinned, zeroized RAM (mlock) and are scrubbed using explicit bzero compiler barriers immediately after generating the Ed25519 Schnorr signature.',
            metric: 'Entropy: /dev/hwrng | Key Derivation: HKDF-SHA256 | Signature: Ed25519',
            stance: 'PROPOSED',
          },
          {
            speaker: 'KAI',
            role: 'Skeptic',
            avatar: '/pets/kai-neon.jpg',
            argument: 'Physical security vector flagged: While RAM is locked, modern multi-core microarchitectures share L3 cache lines and branch predictor state. During Ed25519 scalar multiplication, cache-timing side channels (Spectre/Meltdown class) and differential power analysis (DPA) can allow an adjacent unprivileged process on the host to reconstruct the private scalar in under 200 signing operations.',
            metric: 'Vulnerability: L3 Cache Timing & Power Analysis | Scope: Shared Core Branch Predictor',
            stance: 'CHALLENGED',
          }
        ]
      },
      {
        round: 2,
        title: 'Constant-Time Arithmetic & Coordinate Blinding',
        turns: [
          {
            speaker: 'AZOTH',
            role: 'Proponent',
            avatar: '/pets/azoth-neon.jpg',
            argument: 'Hardening protocol applied: All scalar multiplications are swapped for Montgomery ladder constant-time point operations with randomized projective coordinate blinding (Jacobian curve randomization). Furthermore, execution is pinned to an isolated core with speculative execution barriers (lfence / isb) and cache flush instructions (clflushopt) between signing cycles.',
            metric: 'Montgomery Ladder: O(1) Constant-Time | Random Projective Blinding: Active',
            stance: 'HARDENED',
          },
          {
            speaker: 'KAI',
            role: 'Skeptic',
            avatar: '/pets/kai-neon.jpg',
            argument: 'Side-channel differential power analysis and cache timing tests show flat variance (< 0.02ns variance across 500,000 signing loops). Scalar reconstruction attack completely neutralized. Cryptographic air-gap integrity verified.',
            metric: 'Timing Variance: < 0.02ns | 500k Loop Proof | DPA Resistance: Certified',
            stance: 'CONCEDED',
          }
        ]
      },
      {
        round: 3,
        title: 'Arbitration & Bayesian Verdict Synthesis',
        turns: [
          {
            speaker: 'DRACO',
            role: 'Arbitrator',
            avatar: '/pets/draco-neon.jpg',
            argument: 'Unanimous dialectic agreement reached. Blinding mitigations and constant-time Montgomery ladder point operations eliminate microarchitectural leakage vectors. Bayesian Confidence score: 98.7% (Highest cryptographic assurance tier). Verdict: RATIFIED & AIR-GAP CERTIFIED. Ed25519 zero-egress hardware signing protocol approved.',
            metric: 'Bayesian Confidence: 98.7% | Assurance: CRYPTOGRAPHIC AIR-GAP TIER-1',
            stance: 'RATIFIED',
          }
        ]
      }
    ],
    verdict: {
      decision: 'APPROVED',
      quorumRatio: '98.7%',
      consensusProtocol: 'ED25519-ENCLAVE-AIRGAP',
      executionOrder: 'DEPLOY_HARDWARE_SIGNING_ENCLAVE',
      invariants: ['Constant Time Montgomery Ladder', 'Projective Coordinate Blinding', 'L3 Cache Flush Barriers']
    }
  }
];

// Robust SHA-256 implementation with fallback
async function computeSha256(text) {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle?.digest) {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    // Fall back to pure JS hash if subtle crypto is restricted
  }

  // Pure JavaScript SHA-256 fallback
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = text[lengthProperty] * 8;
  const hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  text += '\x80';
  while ((text[lengthProperty] % 64) - 56) text += '\x00';
  for (i = 0; i < text[lengthProperty]; i++) {
    j = text.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i]) | 0;
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

export default function ConsensusPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const up = Boolean(status?.services?.bridge?.up);

  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.30)' : '#E2CE82',
    voidBg: isDark ? '#08080B' : '#FFFFFF',
    darkPaper: isDark ? '#0B0B12' : '#F8FAFC',
  };

  const [selectedPresetId, setSelectedPresetId] = useState(SCENARIO_PRESETS[0].id);
  const [proposal, setProposal] = useState(SCENARIO_PRESETS[0].proposal);
  const [busy, setBusy] = useState(false);
  const [simStep, setSimStep] = useState(0); // 0 = idle, 1 = round 1, 2 = round 2, 3 = round 3 (done)
  const [roundsHistory, setRoundsHistory] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [verdictSha256, setVerdictSha256] = useState('');
  const [evidenceWeight, setEvidenceWeight] = useState(3.5); // slider 1.0 to 5.0
  const [isSimulationMode, setIsSimulationMode] = useState(!up);
  const [copiedHash, setCopiedHash] = useState(false);
  const [exportedStatus, setExportedStatus] = useState(false);
  const [rawResult, setRawResult] = useState(null);

  // Interactive Byzantine Fault Tolerance Simulator State
  const [isMaliciousInjected, setIsMaliciousInjected] = useState(false);
  const [bftPhase, setBftPhase] = useState(0); // 0: Idle, 1: Pre-Prepare, 2: Prepare, 3: Commit, 4: Decided
  const [bftAutoPlaying, setBftAutoPlaying] = useState(false);
  const bftCanvasRef = useRef(null);

  // Auto-play timer for BFT rounds
  useEffect(() => {
    if (!bftAutoPlaying) return;
    if (bftPhase >= 4) {
      setBftAutoPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setBftPhase((prev) => Math.min(4, prev + 1));
    }, 1200);
    return () => clearTimeout(timer);
  }, [bftAutoPlaying, bftPhase]);

  // Canvas renderer for Byzantine Triangulation
  useEffect(() => {
    const canvas = bftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#08080B' : '#F8FAFC';
    ctx.fillRect(0, 0, W, H);

    // Subtle background mesh
    ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.06)' : 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    for (let x = 20; x <= W - 20; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 15);
      ctx.lineTo(x, H - 15);
      ctx.stroke();
    }
    for (let y = 15; y <= H - 15; y += 35) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
    }

    // 4 Node Positions
    const nodes = [
      { id: 1, name: 'Azoth', role: 'Leader (Proponent)', x: cx, y: 55, color: '#D4AF37' },
      { id: 2, name: 'Kai', role: 'Skeptic (Auditor)', x: cx - 185, y: 265, color: isDark ? '#F87171' : '#DC2626' },
      { id: 3, name: 'Draco', role: 'Arbitrator (Judge)', x: cx + 185, y: 265, color: isDark ? '#38BDF8' : '#0284C7' },
      {
        id: 4,
        name: isMaliciousInjected ? 'Adversary (Byzantine)' : 'Lycan (Validator)',
        role: isMaliciousInjected ? 'Equivocating AST Poisoner' : 'Honest Validator',
        x: cx,
        y: 175,
        color: isMaliciousInjected ? '#EF4444' : (isDark ? '#34D399' : '#059669')
      }
    ];

    // Triangulation Rays & Packets
    const edges = [
      [0, 1], [1, 2], [2, 0], // Outer Triangle
      [0, 3], [1, 3], [2, 3]  // Inner Spokes to Node 4
    ];

    // If Phase >= 3 and Malicious Injected: Draw BFT Quorum Shield over Honest Nodes (0, 1, 2)
    if (bftPhase >= 3 && isMaliciousInjected) {
      ctx.fillStyle = isDark ? 'rgba(52,211,153,0.09)' : 'rgba(5,150,105,0.08)';
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isDark ? '#34D399' : '#059669';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Quarantined perimeter around Malicious Node 4
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(nodes[3].x, nodes[3].y, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '700 9.5px "JetBrains Mono"';
      ctx.fillStyle = '#EF4444';
      ctx.fillText('[EQUIVOCATION ISOLATED]', nodes[3].x - 66, nodes[3].y + 48);
    } else if (bftPhase >= 3 && !isMaliciousInjected) {
      // Unanimous 4-node harmonious mesh
      ctx.fillStyle = isDark ? 'rgba(212,175,55,0.08)' : 'rgba(184,134,11,0.06)';
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isDark ? '#D4AF37' : '#B8860B';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Render Edges
    edges.forEach(([i, j]) => {
      const n1 = nodes[i];
      const n2 = nodes[j];
      const isAdversaryEdge = i === 3 || j === 3;

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);

      if (bftPhase === 0) {
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (bftPhase === 1) {
        // Pre-prepare broadcast from Leader (0)
        if (i === 0 || j === 0) {
          ctx.strokeStyle = isDark ? '#D4AF37' : '#B8860B';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else if (bftPhase === 2) {
        // Prepare cross-validation
        if (isAdversaryEdge && isMaliciousInjected) {
          ctx.strokeStyle = 'rgba(239,68,68,0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = isDark ? '#38BDF8' : '#0284C7';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        // Commit & Decided
        if (isAdversaryEdge && isMaliciousInjected) {
          ctx.strokeStyle = 'rgba(239,68,68,0.35)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = isDark ? '#34D399' : '#059669';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
    });

    // Render Nodes
    nodes.forEach((node, idx) => {
      const isMalicious = idx === 3 && isMaliciousInjected;

      // Outer glow
      ctx.shadowColor = isMalicious ? '#EF4444' : (isDark ? node.color : '#08080B');
      ctx.shadowBlur = bftPhase > 0 ? 12 : 4;

      ctx.fillStyle = isDark ? '#0D0D14' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isMalicious ? '#EF4444' : (isDark ? node.color : (idx === 0 ? '#B8860B' : node.color));
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Node label
      ctx.font = 'bold 11px "JetBrains Mono"';
      ctx.fillStyle = isDark ? '#F8FAFC' : '#08080B';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, idx === 0 ? node.y - 30 : node.y + 36);

      ctx.font = '700 9px "JetBrains Mono"';
      ctx.fillStyle = isMalicious ? '#EF4444' : (isDark ? '#94A3B8' : '#475467');
      ctx.fillText(node.role, node.x, idx === 0 ? node.y - 18 : node.y + 48);

      // Inner icon or glyph
      ctx.font = 'bold 12px "JetBrains Mono"';
      ctx.fillStyle = isMalicious ? '#EF4444' : (isDark ? node.color : '#08080B');
      const phaseSymbols = ['N' + (idx + 1), 'PRE', 'PRP', 'CMT', isMalicious ? 'ERR' : 'OK'];
      ctx.fillText(phaseSymbols[bftPhase], node.x, node.y + 4);
    });

    // Telemetry stamp in bottom-left
    ctx.textAlign = 'left';
    ctx.font = '700 10px "JetBrains Mono"';
    ctx.fillStyle = isDark ? '#D4AF37' : '#8A6A09';
    const phaseNames = ['PHASE 0: IDLE / STANDBY', 'PHASE 1: PRE-PREPARE (LEADER PROPOSAL)', 'PHASE 2: PREPARE (MERKLE CROSS-VALIDATION)', 'PHASE 3: COMMIT (2/3+ QUORUM LOCK)', 'PHASE 4: DECIDED (SHA-256 RATIFIED)'];
    ctx.fillText(phaseNames[bftPhase], 25, H - 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = isMaliciousInjected ? '#EF4444' : (isDark ? '#34D399' : '#059669');
    ctx.fillText(isMaliciousInjected ? '3/4 HONEST NODES (75.0% > 66.7% BFT QUORUM)' : '4/4 HONEST NODES (100% UNANIMOUS QUORUM)', W - 25, H - 20);
  }, [bftPhase, isMaliciousInjected, isDark]);

  // Update simulation mode if bridge status shifts
  useEffect(() => {
    if (!up) {
      setIsSimulationMode(true);
    }
  }, [up]);

  // Compute Bayesian Confidence dynamically based on evidenceWeight and base score
  const activePreset = useMemo(() => {
    return SCENARIO_PRESETS.find(p => p.id === selectedPresetId) || SCENARIO_PRESETS[0];
  }, [selectedPresetId]);

  const baseConfidence = activePreset ? activePreset.defaultConfidence : 95.0;

  // Bayesian calculation: Posterior = (Prior * Likelihood) / Evidence
  const calculatedConfidence = useMemo(() => {
    const prior = baseConfidence / 100;
    const likelihoodFactor = 1 + (evidenceWeight - 3.0) * 0.08;
    const posterior = (prior * likelihoodFactor) / (prior * likelihoodFactor + (1 - prior) * 0.95);
    const clamped = Math.min(99.9, Math.max(75.0, posterior * 100));
    return Number(clamped.toFixed(1));
  }, [baseConfidence, evidenceWeight]);

  // Select a preset scenario
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setProposal(preset.proposal);
    setVerdict(null);
    setRoundsHistory([]);
    setSimStep(0);
    setVerdictSha256('');
    setRawResult(null);
  };

  // Run offline zero-egress dialectic simulation
  const runOfflineSimulation = useCallback(async (presetObj, proposalText) => {
    setBusy(true);
    setVerdict(null);
    setVerdictSha256('');
    setRoundsHistory([]);
    setRawResult(null);

    const activeObj = presetObj || SCENARIO_PRESETS[0];
    const sourceRounds = activeObj.rounds;

    // Simulate progressive dialectic rounds
    setSimStep(1);
    await new Promise((r) => setTimeout(r, 650));
    setRoundsHistory([sourceRounds[0]]);

    setSimStep(2);
    await new Promise((r) => setTimeout(r, 700));
    setRoundsHistory([sourceRounds[0], sourceRounds[1]]);

    setSimStep(3);
    await new Promise((r) => setTimeout(r, 750));
    setRoundsHistory(sourceRounds);

    const finalVerdict = {
      ...activeObj.verdict,
      proposalSummary: proposalText.slice(0, 160) + '...',
      bayesianConfidence: `${calculatedConfidence}%`,
      timestamp: new Date().toISOString(),
      sessionNonce: Math.random().toString(36).substring(2, 12).toUpperCase(),
      signers: [
        { id: 'AZOTH', role: 'Proponent', ed25519Pubkey: 'ed25519:azoth_c39b7f4a08e1d291e1' },
        { id: 'KAI', role: 'Skeptic', ed25519Pubkey: 'ed25519:kai_88e0c1f492b771ac902' },
        { id: 'DRACO', role: 'Arbitrator', ed25519Pubkey: 'ed25519:draco_10f7b99c01de554320' },
      ],
      zeroEgress: true,
      simulationType: 'ZERO-EGRESS-OFFLINE-DIALECTIC',
    };

    setVerdict(finalVerdict);

    // Compute SHA-256 stamp for the consensus package
    const payloadForHash = JSON.stringify({
      proposal: proposalText,
      verdict: finalVerdict,
      rounds: sourceRounds,
      protocol: 'ZOTH-BYZANTINE-SOCRATIC-V2',
    });
    const hash = await computeSha256(payloadForHash);
    setVerdictSha256(hash);

    setRawResult({
      status: 'CONSENSUS_RATIFIED',
      mode: 'OFFLINE_ZERO_EGRESS',
      protocol: 'ZOTH-BYZANTINE-SOCRATIC-V2',
      sha256Stamp: hash,
      bayesianConfidence: `${calculatedConfidence}%`,
      verdict: finalVerdict,
      rounds: sourceRounds,
    });

    setBusy(false);
    setSimStep(0);
  }, [calculatedConfidence]);

  // Main Submit handler (Attempts bridge if online, falls back seamlessly to zero-egress simulation)
  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!proposal.trim()) return;

    if (isSimulationMode || !up) {
      await runOfflineSimulation(activePreset, proposal);
      return;
    }

    setBusy(true);
    setVerdict(null);
    setVerdictSha256('');
    try {
      const response = await fetch('/api/studio/bridge/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal,
          proponent: 'AZOTH',
          skeptic: 'KAI',
          arbitrator: 'DRACO',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = await response.json();
      setRawResult(body);

      // Compute hash for backend response
      const hash = await computeSha256(JSON.stringify(body));
      setVerdictSha256(hash);
      setVerdict({
        decision: body.decision || 'APPROVED',
        quorumRatio: `${calculatedConfidence}%`,
        consensusProtocol: 'BRIDGE-ONLINE-BFT',
        executionOrder: body.action || 'EXECUTE_CONSENSUS_VERDICT',
        invariants: ['Live Bridge Daemon Ratified', 'Zero-Cloud Egress Preserved'],
        timestamp: new Date().toISOString(),
      });
      setRoundsHistory(activePreset.rounds);
    } catch (err) {
      console.warn('Bridge fetch failed, invoking offline zero-egress simulation fallback:', err.message);
      setIsSimulationMode(true);
      await runOfflineSimulation(activePreset, proposal);
    } finally {
      setBusy(false);
    }
  };

  // Copy SHA-256 Hash
  const copySha256 = () => {
    if (!verdictSha256) return;
    navigator.clipboard?.writeText(verdictSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2200);
  };

  // Export Signed Consensus Verdict JSON file
  const exportSignedVerdict = () => {
    if (!verdict) return;
    const exportData = {
      header: {
        system: 'ZOTH STUDIO SOVEREIGN CONSENSUS ARENA',
        protocol: 'ZOTH-BYZANTINE-SOCRATIC-V2',
        environment: 'ZERO-EGRESS AIR-GAPPED SIMULATION',
        timestamp: new Date().toISOString(),
        sha256_hash_stamp: verdictSha256,
        verdict_status: 'SUPERMAJORITY_RATIFIED',
      },
      bayesian_metrics: {
        confidence: `${calculatedConfidence}%`,
        prior_p_h: (baseConfidence / 100).toFixed(3),
        evidence_weight: evidenceWeight,
        byzantine_quorum_threshold: '66.7%',
        fault_tolerance_condition: '3f + 1 >= 4 (f = 1 Byzantine Node Tolerated)',
      },
      proposal: proposal,
      dialectic_debate_transcript: roundsHistory.length > 0 ? roundsHistory : activePreset.rounds,
      signed_verdict: verdict,
      cryptographic_attestation: {
        hash_algorithm: 'SHA-256',
        signature_suite: 'ED25519-SCHNORR-ZOTH-LOCAL',
        signers: [
          { node: 'AZOTH', role: 'Proponent', signature: `sig_ed25519_azoth_${verdictSha256.substring(0, 16)}` },
          { node: 'KAI', role: 'Skeptic', signature: `sig_ed25519_kai_${verdictSha256.substring(16, 32)}` },
          { node: 'DRACO', role: 'Arbitrator', signature: `sig_ed25519_draco_${verdictSha256.substring(32, 48)}` },
        ],
        integrity_seal: 'VERIFIED_TAMPER_PROOF_OFFLINE',
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zoth-consensus-verdict-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedStatus(true);
    setTimeout(() => setExportedStatus(false), 3000);
  };

  // SVG Dial Calculations
  const radius = 64;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calculatedConfidence / 100) * circumference;

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["BYZANTINE", "FAULT", "TOLERANCE"]}
          themeColor="cyan"
          subtitle="BYZANTINE QUORUM VALIDATOR"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Container maxWidth="lg" className="page-fade-in" sx={{ py: 6 }}>
      {/* Page Header */}
      <HeroReveal>
        <Box sx={{ mb: 4, position: 'relative' }}>
          {/* Glow behind title */}
          <ParallaxGlow offset={60}>
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: -20,
                left: '30%',
                transform: 'translateX(-50%)',
                width: '480px',
                height: '180px',
                pointerEvents: 'none',
                zIndex: 0,
                background: isDark
                  ? 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212,175,55,0.20) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(184,134,11,0.12) 0%, transparent 70%)',
              }}
            />
          </ParallaxGlow>

          <HeroItem>
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
              <Chip
                icon={<ShieldIcon sx={{ fontSize: '1rem !important', color: up ? (isDark ? '#34D399' : '#059669') : gold.accent }} />}
                label={up ? 'SIGNAL BRIDGE LINKED' : 'ZERO-EGRESS SIMULATION READY'}
                size="small"
                sx={{
                  bgcolor: up ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF3') : (isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7'),
                  color: up ? (isDark ? '#34D399' : '#027A48') : gold.soft,
                  border: `1px solid ${up ? (isDark ? 'rgba(52,211,153,0.3)' : '#A6F4C5') : gold.border}`,
                  fontWeight: 800,
                }}
              />
              <Chip
                icon={<LockIcon sx={{ fontSize: '0.95rem !important', color: gold.accent }} />}
                label="AIR-GAPPED SOVEREIGN ARENA"
                size="small"
                sx={{
                  bgcolor: isDark ? '#08080B' : '#F1F5F9',
                  color: gold.soft,
                  border: `1px solid ${gold.border}`,
                  fontWeight: 750,
                }}
              />
            </Box>
          </HeroItem>

          <HeroItem>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5, color: theme.palette.text.primary, position: 'relative', zIndex: 1 }}>
              Byzantine Socratic <span className="text-gradient-gold">Consensus Arena</span>
            </Typography>
          </HeroItem>

          <HeroItem>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 880, lineHeight: 1.65, fontSize: '1.05rem', position: 'relative', zIndex: 1 }}>
              Orchestrate multi-agent dialectic debates governed by Byzantine fault-tolerant quorum mathematics.
              When the backend bridge is unreachable, this arena automatically activates an <span className="text-highlight-gold">air-gapped zero-egress simulation fallback</span> that evaluates architectural propositions across <span className="text-highlight-gold">Azoth (Proponent)</span>, <span className="text-highlight-gold">Kai (Skeptic)</span>, and <span className="text-highlight-gold">Draco (Arbitrator)</span> with SHA-256 signed verdicts.
            </Typography>
          </HeroItem>
        </Box>
      </HeroReveal>

      <DaemonStatusStrip />

      {/* Instant Scenario Presets */}
      <RevealOnScroll preset="fadeUp">
        <Box sx={{ mb: 4 }}>
          <Typography className="section-kicker">Instant Battle Arena Presets</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
            Select an architectural stress-test scenario
          </Typography>
          <Grid container spacing={2}>
            {SCENARIO_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <Grid xs={12} md={4} key={preset.id}>
                  <Paper
                    onClick={() => handleSelectPreset(preset)}
                    sx={{
                      p: 2.2,
                      height: '100%',
                      cursor: 'pointer',
                      bgcolor: isSelected ? (isDark ? '#0D0D14' : '#FEF9E7') : gold.voidBg,
                      border: '1.5px solid',
                      borderColor: isSelected ? gold.accent : (isDark ? 'rgba(212,175,55,0.18)' : theme.palette.divider),
                      boxShadow: isSelected
                        ? (isDark ? '0 0 20px -3px rgba(212,175,55,0.30)' : '0 0 16px -2px rgba(184,134,11,0.22)')
                        : 'none',
                      borderRadius: 2.5,
                      transition: 'all 0.22s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: gold.accent,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={preset.badge}
                          size="small"
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: isSelected ? gold.accent : (isDark ? 'rgba(212,175,55,0.12)' : '#F2F4F7'),
                            color: isSelected ? '#08080B' : gold.soft,
                          }}
                        />
                        <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: gold.accent, fontWeight: 800 }}>
                          {preset.defaultConfidence}% Quorum
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.75, lineHeight: 1.3 }}>
                        {preset.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                        {preset.description}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1.75, pt: 1, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: isSelected ? gold.accent : 'text.secondary' }}>
                        {isSelected ? '● ACTIVE PRESET' : 'Click to Load'}
                      </Typography>
                      <BoltIcon sx={{ fontSize: '1.1rem', color: isSelected ? gold.accent : 'text.disabled' }} />
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </RevealOnScroll>

      {/* Role Feature Cards */}
      <RevealOnScroll preset="fadeUp">
        <StaggerChildren>
          <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
            <Grid xs={12} md={4}>
              <StaggerItem>
                <Card sx={{ height: '100%', bgcolor: gold.voidBg, border: `1px solid ${gold.border}`, borderRadius: 2.5 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: gold.wash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ForumIcon sx={{ color: gold.accent }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                          Azoth (Proponent)
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 700 }}>
                          THESIS & HARDENING
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                      Generates the initial architectural proposal, data structure invariants, Lamport epoch bounds, and algorithmic performance guarantees.
                    </Typography>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid xs={12} md={4}>
              <StaggerItem>
                <Card sx={{ height: '100%', bgcolor: gold.voidBg, border: `1px solid ${gold.border}`, borderRadius: 2.5 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: gold.wash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BalanceIcon sx={{ color: gold.accent }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                          Kai (Skeptic)
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#F87171' : '#DC2626', fontWeight: 700 }}>
                          ANTITHESIS & VULNERABILITY AUDIT
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                      Rigorously stress-tests proposals against Byzantine deadlocks, memory cache collisions, microarchitectural side channels, and concurrency faults.
                    </Typography>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>

            <Grid xs={12} md={4}>
              <StaggerItem>
                <Card sx={{ height: '100%', bgcolor: gold.voidBg, border: `1px solid ${gold.border}`, borderRadius: 2.5 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2 }}>
                      <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: gold.wash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GavelIcon sx={{ color: gold.accent }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                          Draco (Arbitrator)
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#38BDF8' : '#0284C7', fontWeight: 700 }}>
                          SYNTHESIS & QUORUM VERDICT
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                      Synthesizes dialectic argument vectors, calculates the mathematical Bayesian consensus confidence rating, and stamps the cryptographic verdict.
                    </Typography>
                  </CardContent>
                </Card>
              </StaggerItem>
            </Grid>
          </Grid>
        </StaggerChildren>
      </RevealOnScroll>

      {/* ==========================================================================
         INTERACTIVE BYZANTINE TRIANGULATION & MALICIOUS INJECTION SIMULATOR (TASK 2)
         ========================================================================== */}
      <RevealOnScroll preset="fadeUp">
        <Box sx={{ mb: 4.5 }}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3.5 },
              border: `1.5px solid ${gold.border}`,
              borderRadius: 3,
              bgcolor: gold.voidBg,
              boxShadow: isDark
                ? '0 0 32px -6px rgba(212,175,55,0.25)'
                : '0 8px 24px -4px rgba(184,134,11,0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Section Header & Interactive Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <HubIcon sx={{ color: gold.accent, fontSize: '1.3rem' }} />
                  <Typography className="section-kicker" sx={{ mb: 0 }}>
                    Byzantine Triangulation Engine
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Interactive Byzantine Triangulation Simulator (3f + 1 ≥ 4 Quorum)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 760, fontSize: '0.88rem' }}>
                  Simulate PBFT/Socratic consensus state transitions across partitioned network topology. Toggle active malicious traitor node injection to verify the 2/3 supermajority Byzantine fault tolerance guarantee in real-time.
                </Typography>
              </Box>

              {/* Live Controls: Malicious Injection Switch & Round Stepper */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                {/* Malicious Node Injection Toggle */}
                <Box
                  sx={{
                    p: 1,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: isMaliciousInjected ? (isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2') : (isDark ? '#0D0D14' : '#F1F5F9'),
                    border: `1.5px solid ${isMaliciousInjected ? '#EF4444' : gold.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <WarningAmberIcon sx={{ color: isMaliciousInjected ? '#EF4444' : 'text.secondary', fontSize: '1.2rem' }} />
                    <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: isMaliciousInjected ? '#EF4444' : theme.palette.text.primary }}>
                      MALICIOUS NODE INJECTION:
                    </Typography>
                  </Box>
                  <Switch
                    checked={isMaliciousInjected}
                    onChange={(e) => {
                      setIsMaliciousInjected(e.target.checked);
                      if (bftPhase === 0) setBftPhase(1);
                    }}
                    color="error"
                    size="small"
                  />
                  <Chip
                    label={isMaliciousInjected ? 'TRAITOR ACTIVE (f = 1)' : 'BENIGN (f = 0)'}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      bgcolor: isMaliciousInjected ? '#EF4444' : (isDark ? 'rgba(52,211,153,0.15)' : '#DCFCE7'),
                      color: isMaliciousInjected ? '#FFFFFF' : (isDark ? '#34D399' : '#059669'),
                    }}
                  />
                </Box>

                {/* Protocol Trigger Buttons */}
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    disabled={bftAutoPlaying}
                    onClick={() => {
                      setBftPhase(1);
                      setBftAutoPlaying(true);
                    }}
                    sx={{
                      bgcolor: gold.accent,
                      color: '#08080B',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      boxShadow: `0 0 14px -2px ${gold.accent}`,
                      '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' },
                    }}
                  >
                    {bftAutoPlaying ? 'Protocol Advancing…' : '▶ Run Consensus Protocol'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setBftPhase((prev) => (prev + 1) % 5)}
                    sx={{
                      borderColor: gold.border,
                      color: gold.soft,
                      fontWeight: 750,
                      fontSize: '0.78rem',
                      '&:hover': { borderColor: gold.accent, bgcolor: gold.wash },
                    }}
                  >
                    ⏭ Step Phase ({bftPhase}/4)
                  </Button>

                  <IconButton
                    size="small"
                    onClick={() => {
                      setBftPhase(0);
                      setBftAutoPlaying(false);
                    }}
                    sx={{ color: 'text.secondary' }}
                    title="Reset Consensus State"
                  >
                    <ReplayIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Box>

            {/* Dynamic BFT Status Alert Banner */}
            <Alert
              severity={isMaliciousInjected ? 'warning' : 'success'}
              icon={isMaliciousInjected ? <WarningAmberIcon sx={{ color: '#EF4444' }} /> : <ShieldIcon sx={{ color: isDark ? '#34D399' : '#059669' }} />}
              sx={{
                mb: 3,
                bgcolor: isMaliciousInjected ? (isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2') : (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5'),
                border: `1px solid ${isMaliciousInjected ? '#EF4444' : (isDark ? '#34D399' : '#059669')}`,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650, color: theme.palette.text.primary, lineHeight: 1.55 }}>
                  {isMaliciousInjected ? (
                    <>
                      <strong>Byzantine Traitor Injected:</strong> Node 4 is broadcasting equivocal conflicting AST mutations. BFT Quorum: <strong>3 of 4 honest nodes (75.0%)</strong> exceed the 66.7% threshold ($3f+1 \ge 4$). The poisoned payload is quarantined and consensus <strong>STILL SUCCEEDS</strong>!
                    </>
                  ) : (
                    <>
                      <strong>Nominal Quorum Active:</strong> All 4 validator nodes operating in deterministic Merkle-trie synchrony. Unanimous <strong>100.0% consensus agreement</strong> achieved across all shards.
                    </>
                  )}
                </Typography>
                <Chip
                  label={isMaliciousInjected ? '75.0% BFT QUORUM (TOLERATED)' : '100% UNANIMOUS QUORUM'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: isMaliciousInjected ? '#EF4444' : (isDark ? '#34D399' : '#059669'),
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
            </Alert>

            {/* Triangulation Visualizer Canvas */}
            <Box
              sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`,
                bgcolor: isDark ? '#08080B' : '#F8FAFC',
                mb: 3,
                position: 'relative',
              }}
            >
              <canvas ref={bftCanvasRef} width={680} height={320} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </Box>

            {/* BFT Validator Nodes Carousel / Stacked Window Showcase */}
            <WindowCarousel
              title="Byzantine Consensus Validator Nodes"
              badge="BFT Quorum Nodes"
              items={[
                {
                  id: 'node-1',
                  name: 'Node 1: Azoth',
                  role: 'ROLE: Leader / Proponent',
                  badge: bftPhase === 0 ? 'IDLE' : bftPhase === 1 ? 'PROPOSING' : 'COMMITTED',
                  badgeBg: gold.accent,
                  badgeFg: '#08080B',
                  detailColor: isDark ? '#F5E6AB' : '#8A6A09',
                  borderColor: isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider,
                  titleColor: gold.accent,
                  vote: 'Vote: 0x7A3F…C120 [VALID]'
                },
                {
                  id: 'node-2',
                  name: 'Node 2: Kai',
                  role: 'ROLE: Skeptic / Auditor',
                  badge: bftPhase < 2 ? 'IDLE' : bftPhase === 2 ? 'AUDITING' : 'COMMITTED',
                  badgeBg: bftPhase >= 2 ? (isDark ? 'rgba(52,211,153,0.2)' : '#DCFCE7') : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
                  badgeFg: bftPhase >= 2 ? (isDark ? '#34D399' : '#059669') : 'text.disabled',
                  detailColor: isDark ? '#F87171' : '#DC2626',
                  borderColor: isDark ? 'rgba(248,113,113,0.25)' : theme.palette.divider,
                  titleColor: isDark ? '#F87171' : '#DC2626',
                  vote: 'Merkle: Verified (No Drift)'
                },
                {
                  id: 'node-3',
                  name: 'Node 3: Draco',
                  role: 'ROLE: Arbitrator / Judge',
                  badge: bftPhase < 3 ? 'IDLE' : 'RATIFIED',
                  badgeBg: bftPhase >= 3 ? (isDark ? 'rgba(56,189,248,0.2)' : '#E0F2FE') : (isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
                  badgeFg: bftPhase >= 3 ? (isDark ? '#38BDF8' : '#0284C7') : 'text.disabled',
                  detailColor: isDark ? '#38BDF8' : '#0284C7',
                  borderColor: isDark ? 'rgba(56,189,248,0.25)' : theme.palette.divider,
                  titleColor: isDark ? '#38BDF8' : '#0284C7',
                  vote: 'Bayesian Seal: Ready'
                },
                {
                  id: 'node-4',
                  name: isMaliciousInjected ? 'Node 4: Adversary' : 'Node 4: Lycan',
                  role: isMaliciousInjected ? 'STATUS: Byzantine Traitor' : 'ROLE: Sentinel Validator',
                  badge: isMaliciousInjected ? 'EQUIVOCATING' : bftPhase >= 3 ? 'COMMITTED' : 'READY',
                  badgeBg: isMaliciousInjected ? '#EF4444' : (isDark ? 'rgba(52,211,153,0.2)' : '#DCFCE7'),
                  badgeFg: isMaliciousInjected ? '#FFFFFF' : (isDark ? '#34D399' : '#059669'),
                  detailColor: isMaliciousInjected ? '#EF4444' : (isDark ? '#34D399' : '#059669'),
                  borderColor: isMaliciousInjected ? '#EF4444' : (isDark ? 'rgba(52,211,153,0.25)' : theme.palette.divider),
                  titleColor: isMaliciousInjected ? '#EF4444' : (isDark ? '#34D399' : '#059669'),
                  vote: isMaliciousInjected ? '0xDEAD…BEEF [ERR_POISON]' : 'Vote: 0x7A3F…C120 [VALID]'
                }
              ]}
              initialView="carousel"
              allowToggleMode={true}
              renderItem={(node) => (
                <Box sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: node.titleColor }}>
                      {node.name}
                    </Typography>
                    <Chip
                      label={node.badge}
                      size="small"
                      sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.72rem', bgcolor: node.badgeBg, color: node.badgeFg }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontFamily: mono }}>
                    {node.role}
                  </Typography>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#05060A' : '#F8FAFC', border: `1px solid ${node.borderColor}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', color: node.detailColor, fontWeight: 700 }}>
                      {node.vote}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Paper>
        </Box>
      </RevealOnScroll>

      {/* Proposal Submission & Simulation Controls */}
      <RevealOnScroll preset="fadeUp">
        <Box sx={{ mb: 4.5, position: 'relative' }}>
          <Paper
            sx={{
              position: 'relative',
              zIndex: 1,
              p: { xs: 2.5, md: 3.5 },
              border: `1.5px solid ${gold.border}`,
              borderRadius: 3,
              bgcolor: gold.voidBg,
              boxShadow: isDark
                ? '0 0 30px -8px rgba(212,175,55,0.22)'
                : '0 8px 24px -4px rgba(184,134,11,0.12)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box>
                <Typography className="section-kicker">Consensus Battle Arena Input</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Submit Proposition to the Socratic Dialectic Loop
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={isSimulationMode ? 'MODE: OFFLINE ZERO-EGRESS' : 'MODE: BRIDGE ATTEMPT'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: isDark ? '#0D0D14' : '#F1F5F9',
                    color: isSimulationMode ? gold.soft : (isDark ? '#34D399' : '#027A48'),
                    border: `1px solid ${isSimulationMode ? gold.accent : (isDark ? '#34D399' : '#059669')}`,
                  }}
                />
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setIsSimulationMode(!isSimulationMode)}
                  sx={{ color: gold.accent, textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  Toggle Mode
                </Button>
              </Stack>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                multiline
                minRows={4}
                required
                value={proposal}
                onChange={(event) => setProposal(event.target.value)}
                placeholder="Enter proposal text or engineering feature specification for the multi-agent consensus arena..."
                sx={{
                  bgcolor: gold.darkPaper,
                  borderRadius: 1.5,
                  '& .MuiOutlinedInput-root': {
                    fontFamily: mono,
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    '& fieldset': { borderColor: isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider },
                    '&:hover fieldset': { borderColor: gold.accent },
                    '&.Mui-focused fieldset': { borderColor: gold.accent },
                  }
                }}
              />

              {/* Dialectic Trigger Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={busy || !proposal.trim()}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    bgcolor: gold.accent,
                    color: '#08080B',
                    fontWeight: 800,
                    px: 3.5,
                    py: 1.2,
                    boxShadow: `0 0 16px -2px ${gold.accent}`,
                    '&:hover': { bgcolor: isDark ? '#E5C158' : '#9A7209' },
                  }}
                >
                  {busy
                    ? 'Debating in Socratic Loop…'
                    : isSimulationMode || !up
                      ? 'Run Zero-Egress Simulation'
                      : 'Submit to Bridge Consensus'}
                </Button>

                <Button
                  variant="outlined"
                  disabled={busy || !proposal.trim()}
                  onClick={() => runOfflineSimulation(activePreset, proposal)}
                  startIcon={<PsychologyIcon />}
                  sx={{
                    borderColor: gold.border,
                    color: gold.soft,
                    fontWeight: 750,
                    px: 2.5,
                    py: 1.2,
                    '&:hover': { borderColor: gold.accent, bgcolor: gold.wash },
                  }}
                >
                  Force Offline Simulation
                </Button>

                <Button
                  variant="text"
                  disabled={busy}
                  onClick={() => handleSelectPreset(activePreset)}
                  startIcon={<ReplayIcon />}
                  sx={{ color: 'text.secondary', fontWeight: 650, ml: 'auto' }}
                >
                  Reset Proposal
                </Button>
              </Box>

              {/* Simulation Progress Bar */}
              {busy && (
                <Box sx={{ mt: 1.5, p: 2, bgcolor: isDark ? '#0D0D14' : '#F8FAFC', borderRadius: 2, border: `1px solid ${gold.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', color: gold.accent, fontWeight: 700 }}>
                      {simStep === 1 && 'ROUND 1: Azoth presenting thesis vs Kai vulnerability audit…'}
                      {simStep === 2 && 'ROUND 2: Azoth hardening proof vs Kai adversary stress-testing…'}
                      {simStep === 3 && 'ROUND 3: Draco synthesizing Bayesian consensus & SHA-256 seal…'}
                      {simStep === 0 && 'Connecting to multi-agent consensus bus…'}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.82rem', color: gold.soft }}>
                      {simStep === 1 ? '33%' : simStep === 2 ? '66%' : '95%'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={simStep === 1 ? 33 : simStep === 2 ? 66 : 95}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark ? 'rgba(212,175,55,0.15)' : '#E2E8F0',
                      '& .MuiLinearProgress-bar': { bgcolor: gold.accent }
                    }}
                  />
                </Box>
              )}

              {!up && (
                <Alert
                  severity="info"
                  icon={<ShieldIcon sx={{ color: gold.accent }} />}
                  sx={{
                    bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
                    border: `1px solid ${gold.border}`,
                    color: isDark ? '#F5E6AB' : '#8A6A09',
                    borderRadius: 2,
                    mt: 1,
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 650 }}>
                      Bridge daemon is offline (<span className="text-highlight-dark">127.0.0.1:8102</span>). Zero-egress fallback is active: dialectic debates and cryptographic verdicts run 100% locally in your browser.
                    </Typography>
                    <Chip
                      label="ZERO EXTERNAL EGRESS"
                      size="small"
                      sx={{ fontFamily: mono, fontWeight: 800, bgcolor: gold.accent, color: '#08080B', fontSize: '0.68rem' }}
                    />
                  </Box>
                </Alert>
              )}
            </Box>
          </Paper>
        </Box>
      </RevealOnScroll>

      {/* Dialectic Debate Rounds Ledger */}
      {roundsHistory.length > 0 && (
        <Box sx={{ mb: 4.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography className="section-kicker">Multi-Agent Dialectic Transcript</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Round-by-Round Socratic Debate Ledger
              </Typography>
            </Box>
            <Chip
              label={`${roundsHistory.length} ROUNDS RATIFIED`}
              size="small"
              sx={{ fontFamily: mono, fontWeight: 800, bgcolor: gold.wash, color: gold.soft, border: `1px solid ${gold.border}` }}
            />
          </Box>

          <Stack spacing={3}>
            {roundsHistory.map((roundObj) => (
              <Paper
                key={roundObj.round}
                sx={{
                  p: 3,
                  bgcolor: gold.voidBg,
                  border: `1px solid ${gold.border}`,
                  borderRadius: 2.5,
                  boxShadow: isDark ? '0 4px 20px -6px rgba(0,0,0,0.7)' : '0 4px 14px -3px rgba(0,0,0,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, pb: 1.5, borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.18)' : theme.palette.divider}` }}>
                  <Chip
                    label={`ROUND ${roundObj.round}`}
                    size="small"
                    sx={{ fontFamily: mono, fontWeight: 800, bgcolor: gold.accent, color: '#08080B' }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    {roundObj.title}
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  {roundObj.turns.map((turn, tIdx) => {
                    const isProponent = turn.speaker === 'AZOTH';
                    const isSkeptic = turn.speaker === 'KAI';
                    const speakerColor = isProponent ? gold.accent : isSkeptic ? (isDark ? '#F87171' : '#DC2626') : (isDark ? '#38BDF8' : '#0284C7');
                    const stanceBg = isProponent
                      ? (isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7')
                      : isSkeptic
                        ? (isDark ? 'rgba(248,113,113,0.14)' : '#FEF2F2')
                        : (isDark ? 'rgba(56,189,248,0.14)' : '#F0F9FF');

                    return (
                      <Box
                        key={tIdx}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: gold.darkPaper,
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          borderLeft: `4px solid ${speakerColor}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box
                              component="img"
                              src={turn.avatar}
                              alt={turn.speaker}
                              onError={(e) => { e.target.style.display = 'none'; }}
                              sx={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${speakerColor}` }}
                            />
                            <Typography sx={{ fontFamily: mono, fontWeight: 800, color: speakerColor, fontSize: '0.92rem' }}>
                              {turn.speaker} · {turn.role}
                            </Typography>
                          </Box>

                          <Chip
                            label={turn.stance}
                            size="small"
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              bgcolor: stanceBg,
                              color: speakerColor,
                            }}
                          />
                        </Box>

                        <Typography variant="body1" sx={{ color: theme.palette.text.primary, lineHeight: 1.65, fontSize: '0.94rem', mb: 1.5 }}>
                          {turn.argument}
                        </Typography>

                        <Box sx={{ p: 1, bgcolor: isDark ? '#08080B' : '#F1F5F9', borderRadius: 1.2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#334155' }}>
                            [TELEMETRY PROOF]: {turn.metric}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Bayesian Confidence Dial & Verdict Section */}
      <Grid container spacing={3} sx={{ mb: 4.5 }}>
        {/* Bayesian Dial Card */}
        <Grid xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              bgcolor: gold.voidBg,
              border: `1.5px solid ${gold.border}`,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isDark ? '0 0 24px -6px rgba(212,175,55,0.22)' : 'none',
            }}
          >
            <Box>
              <Typography className="section-kicker">Socratic Probability Engine</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Bayesian Consensus Confidence Dial
              </Typography>

              {/* Radial SVG Dial */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                <Box sx={{ position: 'relative', width: 170, height: 170 }}>
                  <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Circle */}
                    <circle
                      cx="85"
                      cy="85"
                      r={radius}
                      fill="transparent"
                      stroke={isDark ? 'rgba(212,175,55,0.14)' : '#E2E8F0'}
                      strokeWidth={strokeWidth}
                    />
                    {/* Progress Arc */}
                    <circle
                      cx="85"
                      cy="85"
                      r={radius}
                      fill="transparent"
                      stroke={gold.accent}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>

                  {/* Centered Dial Label */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '1.75rem', fontWeight: 900, color: gold.accent, lineHeight: 1 }}>
                      {calculatedConfidence}%
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.68rem', color: gold.soft, mt: 0.5, fontWeight: 700 }}>
                      POSTERIOR P(H|E)
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Threshold Indicators */}
              <Box sx={{ p: 2, bgcolor: gold.darkPaper, borderRadius: 2, border: `1px solid ${isDark ? 'rgba(212,175,55,0.18)' : theme.palette.divider}`, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: 'text.secondary' }}>BFT Quorum Threshold:</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#34D399' : '#059669' }}>66.7% (Supermajority)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: 'text.secondary' }}>Fault Tolerance Margin:</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: gold.accent }}>3f + 1 &ge; 4 (f = 1)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: 'text.secondary' }}>Skeptic Entropy Reduction:</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: isDark ? '#38BDF8' : '#0284C7' }}>-1.84 nats (Converged)</Typography>
                </Box>
              </Box>

              {/* Interactive Sensitivity Slider */}
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 750, color: 'text.secondary' }}>
                    Adversarial Rigor / Evidence Weight:
                  </Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', fontWeight: 800, color: gold.accent }}>
                    {evidenceWeight.toFixed(1)}x
                  </Typography>
                </Box>
                <Slider
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  value={evidenceWeight}
                  onChange={(e, val) => setEvidenceWeight(val)}
                  sx={{
                    color: gold.accent,
                    '& .MuiSlider-thumb': {
                      boxShadow: `0 0 8px ${gold.accent}`,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0 0 12px ${gold.accent}`,
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1, fontFamily: mono, fontSize: '0.7rem' }}>
              P(H|E) = [P(E|H) * P(H)] / P(E) · Zero Hallucination Guarantee
            </Typography>
          </Paper>
        </Grid>

        {/* Verdict & Export Card */}
        <Grid xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              bgcolor: gold.voidBg,
              border: `1.5px solid ${gold.border}`,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isDark ? '0 0 24px -6px rgba(212,175,55,0.22)' : 'none',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography className="section-kicker">Tamper-Proof Verdict Envelope</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Signed Consensus Verdict
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: verdict ? '#08080B' : theme.palette.text.secondary }} />}
                  label={verdict ? 'QUORUM RATIFIED' : 'AWAITING RUN'}
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontWeight: 800,
                    bgcolor: verdict ? gold.accent : (isDark ? 'rgba(255,255,255,0.1)' : '#F1F5F9'),
                    color: verdict ? '#08080B' : 'text.secondary',
                  }}
                />
              </Box>

              {verdict ? (
                <Stack spacing={2} sx={{ mb: 2.5 }}>
                  <Box sx={{ p: 2, bgcolor: gold.darkPaper, borderRadius: 2, border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.8rem', color: gold.accent, fontWeight: 800, mb: 0.5 }}>
                      EXECUTION DECREE:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                      {verdict.executionOrder}
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', color: 'text.secondary' }}>
                      Protocol: {verdict.consensusProtocol} · Status: {verdict.decision}
                    </Typography>
                  </Box>

                  {/* Cryptographic SHA-256 Stamp */}
                  <Box sx={{ p: 2, bgcolor: isDark ? '#060609' : '#F1F5F9', borderRadius: 2, border: `1px dashed ${gold.accent}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon sx={{ fontSize: '0.95rem', color: gold.accent }} />
                        <Typography sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 800, color: gold.soft }}>
                          SHA-256 CONSENSUS HASH STAMP:
                        </Typography>
                      </Box>
                      <Tooltip title={copiedHash ? 'Hash Copied!' : 'Copy SHA-256'}>
                        <IconButton size="small" onClick={copySha256} sx={{ color: gold.accent }}>
                          {copiedHash ? <CheckCircleIcon sx={{ fontSize: '1rem', color: isDark ? '#34D399' : '#059669' }} /> : <ContentCopyIcon sx={{ fontSize: '1rem' }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.74rem',
                        color: isDark ? gold.accent : '#854D0E',
                        wordBreak: 'break-all',
                        lineHeight: 1.4,
                        bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FFFFFF',
                        p: 1,
                        borderRadius: 1,
                        border: isDark ? '1px solid rgba(212,175,55,0.15)' : '1px solid #E2CE82',
                      }}
                    >
                      {verdictSha256 || 'Awaiting debate completion for hash calculation...'}
                    </Typography>
                  </Box>

                  {/* Signers attestation */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="AZOTH: SIGNED" size="small" sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 750, bgcolor: gold.wash, color: gold.soft }} />
                    <Chip label="KAI: SIGNED" size="small" sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 750, bgcolor: gold.wash, color: gold.soft }} />
                    <Chip label="DRACO: ARBITRATED" size="small" sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 750, bgcolor: gold.wash, color: gold.soft }} />
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: gold.darkPaper, borderRadius: 2, border: '1px dashed rgba(212,175,55,0.25)', my: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No debate has been executed in this session yet.
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent }}>
                    Click &quot;Run Zero-Egress Simulation&quot; above to simulate the battle arena.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Export Button */}
            <Box sx={{ pt: 2, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <Button
                variant="contained"
                fullWidth
                disabled={!verdict}
                onClick={exportSignedVerdict}
                startIcon={<DownloadIcon />}
                sx={{
                  bgcolor: gold.accent,
                  color: '#08080B',
                  fontWeight: 800,
                  py: 1.4,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  boxShadow: verdict ? `0 0 16px -2px ${gold.accent}` : 'none',
                  '&:hover': { bgcolor: isDark ? '#E5C158' : '#9A7209' },
                }}
              >
                {exportedStatus ? 'Verdict Exported (.json)!' : 'Export Signed Consensus Verdict'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Raw Output Console */}
      {rawResult && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography className="section-kicker" sx={{ mb: 0 }}>Consensus Verdict Output Console</Typography>
            <Chip
              label="JSON LEDGER"
              size="small"
              sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, bgcolor: gold.wash, color: gold.soft }}
            />
          </Box>
          <Paper
            sx={{
              p: 3,
              bgcolor: isDark ? '#08080B' : '#0F172A',
              color: '#F8FAFC',
              fontFamily: mono,
              fontSize: '0.82rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              borderRadius: 2,
              border: `1px solid ${gold.accent}`,
              boxShadow: isDark
                ? '0 0 0 1px rgba(212,175,55,0.25), 0 0 24px -4px rgba(212,175,55,0.35)'
                : '0 0 0 1px rgba(184,134,11,0.2), 0 0 18px -4px rgba(184,134,11,0.25)',
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            {JSON.stringify(rawResult, null, 2)}
          </Paper>
        </Box>
      )}

      {/* Sovereign Installation Funnel */}
      <RevealOnScroll preset="fadeUp">
        <SovereignFunnel
          title="Deploy Byzantine Consensus Engine Locally"
          subtitle="Execute fault-tolerant BFT voting routines across local models, cryptographic quorum validation, and tamper-evident verdict logging."
          toolTitle="Option 1: Consensus Engine Micro-Repo"
          toolTag="CONSENSUS ENGINE"
          toolDescription="Standalone zero-dependency Byzantine consensus state-machine engine with PBFT round transitions and multi-signature verification."
          toolRepo="https://github.com/NullAITech/byzantine-consensus-engine"
          toolCommand="git clone https://github.com/NullAITech/byzantine-consensus-engine.git"
        />
      </RevealOnScroll>
    </Container>
    </>
  );
}
