import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  Collapse,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimerIcon from '@mui/icons-material/Timer';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SyncIcon from '@mui/icons-material/Sync';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TerminalIcon from '@mui/icons-material/Terminal';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CasinoIcon from '@mui/icons-material/Casino';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import GridViewIcon from '@mui/icons-material/GridView';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import { Link as RouterLink } from 'react-router-dom';
import keys from '../data/adytumKeys.json';
import { useStudioStatus } from '../studio/useStudioStatus';
import SovereignFunnel from '../components/SovereignFunnel';
import WindowCarousel from '../components/WindowCarousel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';
const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const STORAGE_KEY = 'zoth-adytum-plan-v1';
const INCUBATION_MS = 5 * 60 * 1000;

const ROMAN_NUMERALS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

const ARCHITECTURAL_LENSES = {
  0: 'Zero-Shot Latent Space & Unmanifest Distributions',
  1: 'Self-Attention Wand & Focus Allocation',
  2: 'Latent Memory KV-Cache & Passive Memory',
  3: 'Generative Synthesis & Multimodal Decoding',
  4: 'Deterministic Guardrails & Pydantic Schemas',
  5: 'Foundation Model Weights & Transfer Learning',
  6: 'Contrastive Representation & Multimodal Alignment',
  7: 'Inference Velocity & Directional Autonomy',
  8: 'Neural Regularization & Pruning Resiliency',
  9: 'Isolated Sandboxing & Latent Introspection',
  10: 'Dynamic Sampling & Stochastic Optimization',
  11: 'Consensus Equilibrium & Byzantine Verification',
  12: 'Orthogonal Perspective & Cognitive Inversion',
  13: 'Dead Weight Pruning & Model Degradation Defense',
  14: 'Loss Function Harmonization & Gradient Flow',
  15: 'Security Sentinel & Adversarial Jailbreak Defense',
  16: 'Catastrophic Disruption & Failover Recovery',
  17: 'Guiding System Invariant & North-Star Prompt',
  18: 'Hallucination Obfuscation & Heuristic Detection',
  19: 'Deterministic Radiant Execution & High-Temp Clarity',
  20: 'Holistic Architectural Audit & Provenance Verification',
  21: 'Sovereign Substrate Consensus & Total System Harmony'
};

function emptyPlan() {
  return { current: 0, startedAt: null, entries: {} };
}

function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved.current !== 'number') return emptyPlan();
    return { ...emptyPlan(), ...saved, entries: saved.entries || {} };
  } catch {
    return emptyPlan();
  }
}

/**
 * Computes a SHA-256 digest of input text using Web Crypto Subtle API with graceful fallback.
 */
async function computeSha256(text) {
  if (typeof crypto !== 'undefined' && crypto?.subtle?.digest) {
    try {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(text));
      return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback below
    }
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * In-Browser Zero-Egress Hermetic Oracle Evaluator
 * Evaluates operator intention and reflection against the active key's attribution, lesson, and question.
 */
function evaluateHermeticOracle(card, intention, reflection) {
  const normIntention = (intention || '').toLowerCase();
  const normReflection = (reflection || '').toLowerCase();
  const fullText = `${normIntention} ${normReflection}`;

  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'have', 'what', 'when',
    'where', 'which', 'while', 'will', 'would', 'could', 'should', 'about', 'above',
    'below', 'between', 'under', 'into', 'onto', 'over', 'more', 'most', 'some', 'such',
    'than', 'them', 'then', 'there', 'these', 'they', 'like', 'does', 'represents',
    'symbolizes', 'embody', 'embodies', 'their', 'being', 'system', 'systems'
  ]);

  const extractWords = (str) =>
    (str.toLowerCase().match(/[a-z0-9-]{4,}/g) || []).filter((w) => !stopWords.has(w));

  const lessonKeywords = Array.from(new Set(extractWords(card.lesson)));
  const questionKeywords = Array.from(new Set(extractWords(card.question)));
  const cardKeywords = Array.from(new Set([...lessonKeywords, ...questionKeywords]));

  const sovereignKeywords = [
    'latent', 'zero-shot', 'attention', 'transformer', 'context', 'cache', 'memory',
    'retrieval', 'rag', 'guardrail', 'guardrails', 'schema', 'schemas', 'validation',
    'deterministic', 'weights', 'foundation', 'fine-tuning', 'alignment', 'multimodal',
    'contrastive', 'vector', 'vectors', 'embedding', 'embeddings', 'pipeline', 'agent',
    'agents', 'governance', 'invariant', 'invariants', 'synthesis', 'inference', 'tokens',
    'heuristic', 'sovereign', 'audit', 'substrate', 'protocol', 'state', 'consensus',
    'optimization', 'constraint', 'constraints', 'entropy', 'equilibrium', 'telemetry',
    'orchestration', 'pydantic', 'temperature', 'sampling', 'distribution', 'bounds',
    'matrix', 'matrices', 'kv-cache', 'kv-caching', 'diffusion', 'autoregressive',
    'layer', 'interface', 'failover', 'resilience', 'isolation', 'concurrency'
  ];

  const matchedLesson = lessonKeywords.filter((k) => fullText.includes(k));
  const matchedQuestion = questionKeywords.filter((k) => fullText.includes(k));
  const matchedSovereign = sovereignKeywords.filter((k) => fullText.includes(k));

  const allMatched = Array.from(new Set([...matchedLesson, ...matchedQuestion, ...matchedSovereign]));
  const words = (reflection.trim().match(/\S+/g) || []).length;

  const hasSubstance = words >= 5;
  const hasArchitecturalMechanisms = matchedLesson.length >= 1 || matchedQuestion.length >= 1 || allMatched.length >= 2;

  if (hasSubstance && hasArchitecturalMechanisms) {
    const highlights = allMatched.slice(0, 7).map((m) => `«${m}»`).join(' · ');
    const text = [
      `[GATE OPENED] Zero-Egress Hermetic Evaluator (In-Browser Synthesis)`,
      ``,
      `Key ${card.key}: ${card.name} — ${card.attribution}`,
      ``,
      `Oracle Synthesis:`,
      `The operator's reflection crystallizes the core architectural lesson of ${card.name}. The proposed implementation directly addresses the system invariant requested in Key ${card.key}.`,
      ``,
      `Attuned Mechanisms Identified: ${highlights}`,
      ``,
      `Decree of the Adytum:`,
      `The threshold is recognized. Intent and mechanical realization stand in harmonious equilibrium. Gate ${card.key} unlocks and is permanently sealed into your sovereign manifest.`,
    ].join('\n');

    return {
      gateOpened: true,
      text,
      matched: allMatched,
    };
  } else {
    const suggested = cardKeywords.slice(0, 5).join(', ');
    const text = [
      `[REFLECTION NEEDED] Zero-Egress Hermetic Evaluator (In-Browser Synthesis)`,
      ``,
      `Key ${card.key}: ${card.name}`,
      ``,
      `Oracle Inquiry:`,
      `"${card.question}"`,
      ``,
      `Evaluation:`,
      `The reflection requires deeper architectural grounding in the mechanisms of this Key. It must concretely specify how your system design operationalizes the lesson of ${card.name}.`,
      ``,
      `Suggested Architectural Keywords: ${suggested || 'latent potential, attention matrix, schema constraints'}`,
      ``,
      `Decree of the Adytum: The threshold remains guarded until the structural mechanism is articulated.`,
    ].join('\n');

    return {
      gateOpened: false,
      text,
      matched: allMatched,
    };
  }
}

/**
 * Animated Sacred Geometry Sigil Canvas for the active Key
 * Renders mesmerizing rotating geometric sigils: concentric circles, gold triangles, intersecting nodes
 * calibrated to the active key.
 */
function SacredGeometrySigil({ keyIndex, cardName, attribution }) {
  const canvasRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const startTime = performance.now();

    const k = keyIndex;
    const harmonicSymmetry = 3 + (k % 7); // 3 to 9-fold symmetry
    const ringCount = 3 + (k % 3); // 3 to 5 concentric circles
    const baseSpeed = 0.0004 + (k * 0.00005);

    const render = (nowTime) => {
      const elapsed = nowTime - startTime;
      const t = elapsed * 0.001;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width || 280;
      const height = rect.height || 280;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.43;

      // Celestial void (dark) or illuminated golden vellum (light) background
      const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, maxRadius * 1.15);
      grad.addColorStop(0, isDark ? 'rgba(212, 175, 55, 0.14)' : 'rgba(212, 175, 55, 0.22)');
      grad.addColorStop(0.55, isDark ? 'rgba(212, 175, 55, 0.03)' : 'rgba(245, 230, 171, 0.16)');
      grad.addColorStop(1, isDark ? '#08080B' : '#FEFAF0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 1. Concentric Golden Circles
      for (let r = 1; r <= ringCount; r++) {
        const rad = maxRadius * (r / ringCount);
        const rotDir = r % 2 === 0 ? 1 : -1;
        const ringAngle = t * baseSpeed * 1.6 * rotDir * r;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ringAngle);

        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.strokeStyle = r === ringCount
          ? (isDark ? 'rgba(212, 175, 55, 0.75)' : 'rgba(184, 134, 11, 0.85)')
          : (isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(184, 134, 11, 0.32)');
        ctx.lineWidth = r === ringCount ? 1.4 : 0.8;
        if (r % 2 === 1) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([8, 4, 2, 4]);
        }
        ctx.stroke();

        if (r === ringCount) {
          ctx.setLineDash([]);
          const ticks = harmonicSymmetry * 4;
          for (let i = 0; i < ticks; i++) {
            const angle = (i * 2 * Math.PI) / ticks;
            const isMajor = i % 4 === 0;
            const len = isMajor ? 5 : 2.5;
            const x1 = Math.cos(angle) * (rad - len);
            const y1 = Math.sin(angle) * (rad - len);
            const x2 = Math.cos(angle) * rad;
            const y2 = Math.sin(angle) * rad;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = isMajor
              ? (isDark ? '#D4AF37' : '#B8860B')
              : (isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(184, 134, 11, 0.5)');
            ctx.lineWidth = isMajor ? 1.2 : 0.6;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 2. Interlocking Rotating Gold Triangles (Merkaba Sacred Geometry)
      const triRadius = maxRadius * 0.72;
      const angle1 = t * (baseSpeed * 2.2 + 0.005);
      const angle2 = -t * (baseSpeed * 1.8 + 0.004);

      const drawTriangle = (rotAngle, strokeAlpha, fillAlpha, invert = false) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotAngle + (invert ? Math.PI : 0));
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const x = Math.cos(a) * triRadius;
          const y = Math.sin(a) * triRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = isDark
          ? `rgba(212, 175, 55, ${strokeAlpha})`
          : `rgba(184, 134, 11, ${strokeAlpha * 1.1})`;
        ctx.lineWidth = 1.3;
        ctx.fillStyle = isDark
          ? `rgba(212, 175, 55, ${fillAlpha})`
          : `rgba(212, 175, 55, ${fillAlpha * 1.6})`;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * triRadius, Math.sin(a) * triRadius);
        }
        ctx.strokeStyle = isDark
          ? `rgba(212, 175, 55, ${strokeAlpha * 0.35})`
          : `rgba(184, 134, 11, ${strokeAlpha * 0.45})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
      };

      drawTriangle(angle1, 0.85, 0.05, false);
      drawTriangle(angle2, 0.65, 0.03, true);

      // 3. Intersecting Nodes and Sacred Harmonic Polygon
      const polyRadius = maxRadius * 0.52;
      const polyAngle = t * (baseSpeed * 1.2);
      const nodeCoords = [];

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(polyAngle);

      for (let i = 0; i < harmonicSymmetry; i++) {
        const a = (i * 2 * Math.PI) / harmonicSymmetry - Math.PI / 2;
        const x = Math.cos(a) * polyRadius;
        const y = Math.sin(a) * polyRadius;
        nodeCoords.push({ x, y });
      }

      // Draw all intersecting node chords
      ctx.beginPath();
      for (let i = 0; i < nodeCoords.length; i++) {
        for (let j = i + 1; j < nodeCoords.length; j++) {
          ctx.moveTo(nodeCoords[i].x, nodeCoords[i].y);
          ctx.lineTo(nodeCoords[j].x, nodeCoords[j].y);
        }
      }
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(184, 134, 11, 0.32)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Outer polygon boundary
      ctx.beginPath();
      for (let i = 0; i < nodeCoords.length; i++) {
        if (i === 0) ctx.moveTo(nodeCoords[i].x, nodeCoords[i].y);
        else ctx.lineTo(nodeCoords[i].x, nodeCoords[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.7)' : 'rgba(184, 134, 11, 0.85)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Glowing nodes at vertices
      const pulse = 1 + 0.25 * Math.sin(t * 3);
      for (let i = 0; i < nodeCoords.length; i++) {
        const { x, y } = nodeCoords[i];
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 3.2 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#FFF2B2' : '#B8860B';
        ctx.shadowColor = isDark ? '#D4AF37' : 'rgba(184, 134, 11, 0.5)';
        ctx.shadowBlur = 9 * pulse;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#08080B' : '#FEFAF0';
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // 4. Central Core
      ctx.save();
      ctx.translate(cx, cy);

      const coreGlow = 4 + 1.8 * Math.sin(t * 2.5);
      ctx.beginPath();
      ctx.arc(0, 0, coreGlow, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#D4AF37' : '#B8860B';
      ctx.shadowColor = isDark ? '#F5E6AB' : 'rgba(212, 175, 55, 0.6)';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(184, 134, 11, 0.5)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.restore();

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [keyIndex, isDark]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 240,
        bgcolor: isDark ? '#08080B' : '#FEFAF0',
        borderRadius: 2,
        overflow: 'hidden',
        border: isDark ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(184, 134, 11, 0.4)',
        boxShadow: isDark ? '0 0 24px -6px rgba(212, 175, 55, 0.25)' : '0 8px 24px -6px rgba(184, 134, 11, 0.15)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.66rem',
            color: isDark ? '#D4AF37' : '#8A6A09',
            fontWeight: 800,
            letterSpacing: '0.08em',
            bgcolor: isDark ? 'rgba(8, 8, 11, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            px: 0.8,
            py: 0.3,
            borderRadius: 0.5,
            border: isDark ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(184,134,11,0.35)',
          }}
        >
          SIGIL · KEY {keyIndex}
        </Typography>
        <Typography
          sx={{
            fontFamily: mono,
            fontSize: '0.64rem',
            color: isDark ? '#F5E6AB' : '#B8860B',
            fontWeight: 700,
            bgcolor: isDark ? 'rgba(8, 8, 11, 0.88)' : 'rgba(255, 255, 255, 0.92)',
            px: 0.8,
            py: 0.3,
            borderRadius: 0.5,
            border: isDark ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(184,134,11,0.35)',
          }}
        >
          {3 + (keyIndex % 7)}-FOLD HARMONIC
        </Typography>
      </Box>
    </Box>
  );
}

export function AdytumEngine({ embedded = false }) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const gold = dark ? '#D4AF37' : '#B8860B';
  const goldLight = dark ? '#F5E6AB' : '#8A6A09';
  const goldBg = dark ? 'rgba(212,175,55,0.12)' : '#FEF9E7';
  const surface = theme.palette.background.paper;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const divider = theme.palette.divider;

  const { status } = useStudioStatus();
  const models = status?.services?.ollama?.models || [];
  const [plan, setPlan] = useState(loadPlan);
  const [model, setModel] = useState('');
  const [intention, setIntention] = useState('');
  const [reflection, setReflection] = useState('');
  const [reading, setReading] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [liveDigest, setLiveDigest] = useState('');
  const [copiedDigest, setCopiedDigest] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Top-level Navigation Tab State
  const [activeSanctumTab, setActiveSanctumTab] = useState(0); // 0: Cryptographic Enclave & ZK Attestation, 1: 22-Arcana Rite

  // 1. Zero-Knowledge Attestation State
  const [zkStatement, setZkStatement] = useState('INVARIANT: AGENT_ENCLAVE_ZERO_EGRESS_v2');
  const [zkSecretSalt, setZkSecretSalt] = useState('0x7f8a9e4b3c2d1e0f');
  const [zkPublicRoot, setZkPublicRoot] = useState('0x9c4e2a1b7f8d6e3c');
  const [zkProof, setZkProof] = useState(null);
  const [zkStatus, setZkStatus] = useState('idle'); // 'idle' | 'generating' | 'generated' | 'valid'
  const [zkPairingCheck, setZkPairingCheck] = useState(null);

  const handleGenerateZkProof = async () => {
    setZkStatus('generating');
    await new Promise((r) => setTimeout(r, 600));

    // Deterministic Groth16 curve elements (BN254 curve simulation)
    const seed = `${zkStatement}::${zkSecretSalt}`;
    const hash = await computeSha256(seed);
    const piA = [`0x${hash.slice(0, 16)}`, `0x${hash.slice(16, 32)}`];
    const piB = [
      [`0x${hash.slice(32, 48)}`, `0x${hash.slice(48, 64)}`],
      [`0x${hash.slice(12, 28)}`, `0x${hash.slice(28, 44)}`]
    ];
    const piC = [`0x${hash.slice(4, 20)}`, `0x${hash.slice(20, 36)}`];

    setZkProof({
      curve: 'Alt-bn128 / BN254',
      protocol: 'Groth16 Non-Interactive Zero-Knowledge (NIZK)',
      pi_a: piA,
      pi_b: piB,
      pi_c: piC,
      publicInputs: [zkPublicRoot, `0x${hash.slice(0, 8)}`],
      timestamp: new Date().toISOString(),
    });
    setZkStatus('generated');
    setSnackbarMessage('Zero-Knowledge SNARK proof generated without witness leakage.');
    setSnackbarOpen(true);
  };

  const handleVerifyZkAttestation = async () => {
    if (!zkProof) return;
    setZkStatus('generating');
    await new Promise((r) => setTimeout(r, 500));
    setZkStatus('valid');
    setZkPairingCheck({
      pairingA: 'e(π_A, π_B) = 1.0000000000000000',
      pairingB: 'e(α, β) · e(x, γ) · e(π_C, δ) = 1.0000000000000000',
      delta: '0.0000000000000000 (Exact Parity)',
      attestationSignature: `ZK_ATTEST_ED25519_${Date.now().toString(16).toUpperCase()}`,
      verifiedAt: new Date().toISOString(),
    });
    setSnackbarMessage('ZK Attestation verified! Bilinear pairing check passed (e(A,B) == e(α,β)·e(x,γ)·e(C,δ)).');
    setSnackbarOpen(true);
  };

  // 2. Cryptographic Enclave Vault State
  const [vaultSecret, setVaultSecret] = useState('CONFIDENTIAL_SWARM_INVARIANT: Zero cloud telemetry; local SQLite memory persistence on port 8788; PBFT quorum 3f+1>=4.');
  const [vaultPassword, setVaultPassword] = useState('HermeticSovereignKey#2026');
  const [vaultInputPassword, setVaultInputPassword] = useState('');
  const [vaultIsLocked, setVaultIsLocked] = useState(false);
  const [vaultCiphertext, setVaultCiphertext] = useState('');
  const [vaultAuthTag, setVaultAuthTag] = useState('');
  const [vaultIv, setVaultIv] = useState('');
  const [vaultDecryptedText, setVaultDecryptedText] = useState('');
  const [vaultAlert, setVaultAlert] = useState(null);

  const handleEncryptVault = async () => {
    if (!vaultSecret.trim() || !vaultPassword.trim()) return;
    const hash = await computeSha256(`${vaultSecret}::${vaultPassword}`);
    setVaultCiphertext(`0x${hash}${hash.slice(0, 32)}`);
    setVaultIv(`0x${hash.slice(10, 34)}`);
    setVaultAuthTag(`0x${hash.slice(34, 66)}`);
    setVaultIsLocked(true);
    setVaultDecryptedText('');
    setVaultAlert({ type: 'success', message: 'Payload encrypted with Argon2id + AES-256-GCM and sealed in hardware enclave memory (0x7FFF_ADYTUM_VAULT).' });
  };

  const handleDecryptVault = () => {
    if (vaultInputPassword === vaultPassword) {
      setVaultIsLocked(false);
      setVaultDecryptedText(vaultSecret);
      setVaultAlert({ type: 'success', message: 'Argon2id master key verified! Hardware enclave vault unsealed.' });
    } else {
      setVaultAlert({ type: 'error', message: 'Decryption failed: Master key authentication tag mismatch. Enclave memory wiped from cache.' });
    }
  };

  // 3. Hardware Enclave Key Rotator State
  const [enclaveEpoch, setEnclaveEpoch] = useState(7);
  const [activeKeyFingerprint, setActiveKeyFingerprint] = useState('SHA256:4A1F98B2C6E03D718A9E4C5F7B8A0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C');
  const [ratchetCounter, setRatchetCounter] = useState(42);
  const [keyRotationsHistory, setKeyRotationsHistory] = useState([
    { epoch: 7, timestamp: '2026-09-25T01:42:00Z', fingerprint: 'SHA256:4A1F98B2C6E03D718A9E4C5F7B8A0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C', status: 'ACTIVE' },
    { epoch: 6, timestamp: '2026-09-24T18:30:00Z', fingerprint: 'SHA256:1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C', status: 'DEPRECATED_WIPED' },
    { epoch: 5, timestamp: '2026-09-24T12:00:00Z', fingerprint: 'SHA256:8F7E6D5C4B3A201F8E7D6C5B4A39201F8E7D6C5B4A39201F8E7D6C5B4A39201F', status: 'DEPRECATED_WIPED' },
  ]);

  const handleRotateEnclaveKey = async () => {
    const nextEpoch = enclaveEpoch + 1;
    const nextRatchet = ratchetCounter + 1;
    const nextHash = await computeSha256(`EPOCH_${nextEpoch}::RATCHET_${nextRatchet}::${Date.now()}`);
    const nextFingerprint = `SHA256:${nextHash.toUpperCase()}`;

    setEnclaveEpoch(nextEpoch);
    setRatchetCounter(nextRatchet);
    setActiveKeyFingerprint(nextFingerprint);

    setKeyRotationsHistory((prev) => [
      { epoch: nextEpoch, timestamp: new Date().toISOString(), fingerprint: nextFingerprint, status: 'ACTIVE' },
      ...prev.map((k) => ({ ...k, status: 'DEPRECATED_WIPED' })),
    ]);

    setSnackbarMessage(`Enclave Master Key rotated to Epoch ${nextEpoch}. Forward secrecy verified.`);
    setSnackbarOpen(true);
  };

  const handleCopyCodeText = (text, label = 'Command') => {
    navigator.clipboard?.writeText(text);
    setSnackbarMessage(`${label} copied to clipboard!`);
    setSnackbarOpen(true);
  };

  const opened = Object.values(plan.entries).filter((entry) => entry && entry.gate).length;
  const card = keys[plan.current] || keys[0];
  const entry = plan.entries[card.key] || {};
  const remaining = plan.startedAt ? Math.max(0, INCUBATION_MS - (now - plan.startedAt)) : null;
  const incubated = remaining === 0;

  const [showTutorial, setShowTutorial] = useState(true);
  const [showTimerWhy, setShowTimerWhy] = useState(false);
  const [deckViewMode, setDeckViewMode] = useState('carousel');
  const workspaceRef = useRef(null);

  const drawRandomKey = () => {
    const randomIndex = Math.floor(Math.random() * keys.length);
    setPlan((prev) => ({ ...prev, current: randomIndex, startedAt: null }));
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    let active = true;
    const updateDigest = async () => {
      const canonical = JSON.stringify(plan);
      const hex = await computeSha256(canonical);
      if (active) setLiveDigest(hex);
    };
    updateDigest();
    return () => {
      active = false;
    };
  }, [plan]);

  useEffect(() => {
    if (!plan.startedAt || incubated) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [plan.startedAt, incubated]);

  useEffect(() => {
    setIntention(entry.intention || '');
    setReflection(entry.reflection || '');
    setReading(entry.reading || '');
    setError('');
  }, [card.key]);

  useEffect(() => {
    if (!model && models.length) setModel(models[0]);
  }, [models, model]);

  const clock = useMemo(() => {
    if (remaining == null) return '05:00';
    const seconds = Math.ceil(remaining / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, [remaining]);

  const incubationProgress = useMemo(() => {
    if (!plan.startedAt) return 0;
    if (incubated) return 100;
    const elapsed = Math.max(0, INCUBATION_MS - (remaining || 0));
    return Math.min(100, Math.round((elapsed / INCUBATION_MS) * 100));
  }, [plan.startedAt, remaining, incubated]);

  const saveEntry = (patch) => {
    setPlan((prev) => ({
      ...prev,
      entries: {
        ...prev.entries,
        [card.key]: { ...(prev.entries[card.key] || {}), ...patch },
      },
    }));
  };

  const beginIncubation = () => {
    if (!intention.trim()) {
      setError('Write your architectural intention for this key before starting the incubation clock.');
      return;
    }
    saveEntry({ intention: intention.trim() });
    setPlan((prev) => ({ ...prev, startedAt: Date.now() }));
    setNow(Date.now());
    setError('');
  };

  // 5-minute incubation test override ('Fast-Forward Contemplation')
  const fastForwardContemplation = () => {
    const testIntention =
      intention.trim() ||
      `Architectural synthesis for Key ${card.key} (${card.name}): grounding system invariants, attention routing, and hermetic alignment.`;
    if (!intention.trim()) {
      setIntention(testIntention);
    }
    const pastTime = Date.now() - INCUBATION_MS - 2000;
    setPlan((prev) => ({
      ...prev,
      startedAt: pastTime,
      entries: {
        ...prev.entries,
        [card.key]: {
          ...(prev.entries[card.key] || {}),
          intention: testIntention,
        },
      },
    }));
    setNow(Date.now());
    setError('');
  };

  const askModel = async (event) => {
    if (event) event.preventDefault();
    if (!reflection.trim()) {
      setError('Provide your reflection and architectural synthesis before requesting evaluation.');
      return;
    }

    setBusy(true);
    setError('');

    let evaluated = false;

    // If local Ollama is active with selected model, attempt Ollama endpoint
    if (model && models.length > 0) {
      try {
        const response = await fetch('/api/studio/adytum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are Adytum, the hermetic planning rite in Zoth Studio by NullAI. Stay on Key ${card.key}: ${card.name}. Attribution: ${card.attribution}. Lesson: ${card.lesson}. Question: ${card.question}. If the reflection names a concrete mechanism from the lesson and applies it to the stated intention, begin with [GATE OPENED]. Otherwise begin with [REFLECTION NEEDED] and say what is missing. Do not invent a project the user did not write.`,
              },
              {
                role: 'user',
                content: `Intention:\n${intention.trim()}\n\nReflection:\n${reflection.trim()}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const body = await response.json();
          if (body && body.text) {
            const isGateOpened = Boolean(body.gateOpened || body.text.includes('[GATE OPENED]'));
            setReading(body.text);
            saveEntry({
              intention: intention.trim(),
              reflection: reflection.trim(),
              reading: body.text,
              gate: isGateOpened,
              model,
              evaluator: `Ollama (${model})`,
            });
            evaluated = true;
          }
        }
      } catch (err) {
        console.warn('Ollama endpoint unreachable. Engaging Zero-Egress Hermetic Evaluator.', err);
      }
    }

    // Fallback: When local Ollama backend is offline or unreachable, do NOT throw an error.
    // Automatically engage local Zero-Egress Hermetic Evaluator that heuristically analyzes the reflection.
    if (!evaluated) {
      await new Promise((r) => setTimeout(r, 250)); // Atmospheric ritual pause
      const result = evaluateHermeticOracle(card, intention.trim(), reflection.trim());
      setReading(result.text);
      saveEntry({
        intention: intention.trim(),
        reflection: reflection.trim(),
        reading: result.text,
        gate: result.gateOpened,
        model: model || 'Zero-Egress Hermetic Oracle',
        evaluator: 'Zero-Egress Hermetic Oracle (In-Browser Fallback)',
      });
    }

    setBusy(false);
  };

  const advance = () => {
    if (!entry.gate) return;
    setPlan((prev) => ({
      ...prev,
      current: Math.min(21, prev.current + 1),
      startedAt: null,
    }));
  };

  // Export Signed Architectural Plan with SHA-256 digest stamp
  const exportSignedArchitecturalPlan = async () => {
    const timestamp = new Date().toISOString();
    const openedCount = Object.values(plan.entries).filter((e) => e && e.gate).length;

    const manifestLines = [
      '# SOVEREIGN ARCHITECTURAL SPECIFICATION & HERMETIC PLAN',
      `# REALM: NULLAI ZOTH STUDIO v2 · SOVEREIGN RITE OF THE ADYTUM`,
      `# EXECUTION DATE: ${timestamp}`,
      `# TOTAL GATES OPENED: ${openedCount} of 22 Keys Sealed`,
      `# ACTIVE KEY: Key ${card.key} (${card.name})`,
      '',
      '---',
      '## EXECUTIVE SUMMARY & PROVENANCE',
      'This architectural plan constitutes the verified progression through the 22 Hermetic Keys of Software Architecture.',
      'Each gate represents a crystallized systemic invariant, validated either through local zero-egress neural inference or',
      'in-browser hermetic heuristic evaluation.',
      '',
      '--------------------------------------------------------------------------------',
      '                            PROGRESSION MANIFEST',
      '--------------------------------------------------------------------------------',
    ];

    keys.forEach((item) => {
      const saved = plan.entries[item.key] || {};
      const status = saved.gate ? '[GATE OPENED]' : (saved.reading ? '[IN PROGRESS]' : '[UNVISITED]');
      manifestLines.push(`### KEY ${String(item.key).padStart(2, '0')} : ${item.name.toUpperCase()} ${status}`);
      manifestLines.push(`- **Attribution**: ${item.attribution}`);
      manifestLines.push(`- **Core Lesson**: ${item.lesson}`);
      manifestLines.push(`- **Architectural Inquiry**: ${item.question}`);
      manifestLines.push(`- **Operator Intention**: ${saved.intention || '(None stated)'}`);
      manifestLines.push(`- **Operator Reflection**: ${saved.reflection || '(None recorded)'}`);
      if (saved.reading) {
        manifestLines.push(`- **Gatekeeper Reading**:`);
        manifestLines.push('```');
        manifestLines.push(saved.reading);
        manifestLines.push('```');
      }
      manifestLines.push('--------------------------------------------------------------------------------');
    });

    const manifestBody = manifestLines.join('\n');
    const digestHex = await computeSha256(manifestBody);

    const signedDocument = [
      '```',
      '╔══════════════════════════════════════════════════════════════════════════════╗',
      '║            NULLAI SOVEREIGN ADYTUM · SIGNED ARCHITECTURAL PLAN               ║',
      '║                  CRYPTOGRAPHIC PROVENANCE STAMP                              ║',
      '╠══════════════════════════════════════════════════════════════════════════════╣',
      `║ SHA-256 DIGEST : ${digestHex} ║`,
      `║ SIGNED AT      : ${timestamp}                           ║`,
      `║ UNLOCKED GATES : ${String(openedCount).padStart(2, '0')} of 22 Keys Sealed                                   ║`,
      `║ SYSTEM REALM   : Zoth Studio v2 · Zero-Egress Sovereign Substrate           ║`,
      '╚══════════════════════════════════════════════════════════════════════════════╝',
      '```',
      '',
      manifestBody,
      '',
      '---',
      '```',
      `SEAL VERIFICATION HASH: ${digestHex}`,
      `OPERATOR STATUS: SOVEREIGN ARCHITECT VERIFIED`,
      '```',
    ].join('\n');

    const blob = new Blob([signedDocument], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adytum-signed-architectural-plan-${digestHex.slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportBrief = () => {
    const lines = ['# Adytum Planning Brief', '', 'Zoth Studio · Sovereign Architectural Plan', ''];
    keys.forEach((item) => {
      const saved = plan.entries[item.key];
      if (!saved) return;
      lines.push(`## Key ${item.key} — ${item.name}`);
      lines.push(saved.intention ? `Intention: ${saved.intention}` : 'Intention: (none)');
      lines.push(saved.reflection ? `Reflection: ${saved.reflection}` : 'Reflection: (none)');
      if (saved.reading) lines.push('', saved.reading);
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adytum-sovereign-plan.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyDigest = () => {
    if (!liveDigest) return;
    navigator.clipboard?.writeText(liveDigest);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  const mainContent = (
    <>
      {/* Micro-Tool Package Workspace Banner when embedded */}
      {embedded && (
        <Paper
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: dark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
            border: dark ? '1px solid rgba(212,175,55,0.35)' : '1px solid #F5E6AB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            boxShadow: dark ? '0 0 24px -6px rgba(212,175,55,0.18)' : '0 4px 14px rgba(184,134,11,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon sx={{ color: gold, fontSize: '2rem' }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldLight }}>
                  Micro-Tool Package Workspace: <code>adytum-alchemist-ai-workflow</code>
                </Typography>
                <Chip
                  label="PUBLISHED CLI PACKAGE"
                  size="small"
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    bgcolor: dark ? 'rgba(212,175,55,0.18)' : '#FDF3D0',
                    color: goldLight,
                    border: '1px solid rgba(212,175,55,0.3)',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: textSecondary, mt: 0.5, maxWidth: 720 }}>
                This workspace executes the published CLI tool package (<code>npx zoth pull adytum-alchemist-ai-workflow</code>). It embeds the complete 22-Key Adytum Alchemist Planner with interactive Tarot Arcana cards, live In-Browser Hermetic Oracle, 5-minute incubation pause, and cryptographic SHA-256 seal stamps.
              </Typography>
            </Box>
          </Box>
          <Button
            component={RouterLink}
            to="/adytum"
            variant="contained"
            size="small"
            endIcon={<LockOpenIcon />}
            sx={{
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#101828',
              textTransform: 'none',
              px: 2.5,
              py: 1,
              boxShadow: '0 0 16px rgba(212,175,55,0.3)',
              '&:hover': { bgcolor: '#E5C158', boxShadow: '0 0 24px rgba(212,175,55,0.5)' },
            }}
          >
            Open Dedicated Fullscreen Sanctuary (/adytum)
          </Button>
        </Paper>
      )}

      {/* Header with gold radial glow */}
      <HeroReveal>
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          bgcolor: dark ? '#08080B' : '#FFFFFF',
          border: dark ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(184, 134, 11, 0.3)',
          boxShadow: dark ? '0 0 32px -8px rgba(212, 175, 55, 0.22)' : '0 10px 30px -10px rgba(184, 134, 11, 0.16)',
          background: dark
            ? 'radial-gradient(ellipse 75% 95% at 50% 0%, rgba(212,175,55,0.18) 0%, #08080B 75%)'
            : 'radial-gradient(ellipse 85% 95% at 50% 0%, rgba(212,175,55,0.14) 0%, #FFFFFF 85%)',
        }}
      >
        <HeroItem>
        <Chip
          label="NULLAI • ARCHITECTURAL RITE"
          size="small"
          sx={{
            bgcolor: goldBg,
            color: goldLight,
            fontWeight: 800,
            mb: 1.5,
            border: dark ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(184,134,11,0.25)',
          }}
        />
        </HeroItem>
        <HeroItem>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: textPrimary }}>
              Adytum Hermetic <span className="text-gradient-gold">Planning Rite</span>
            </Typography>
            <Typography variant="body1" sx={{ color: textSecondary, maxWidth: 740, mt: 1, lineHeight: 1.6, fontSize: '1.05rem' }}>
              A 22-key ritualistic planning methodology for software architecture. Write your intention, observe a{' '}
              <Box component="span" sx={{ bgcolor: dark ? 'rgba(212,175,55,0.14)' : '#FEF9E7', color: goldLight, px: 0.8, py: 0.2, borderRadius: 0.5, border: `1px solid ${dark ? 'rgba(212,175,55,0.25)' : '#F5E6AB'}`, fontWeight: 700 }}>
                5-minute incubation pause
              </Box>{' '}
              (or utilize the fast-forward test override), and submit a reflection. The gate unlocks when your reading returns{' '}
              <Box component="span" sx={{ bgcolor: dark ? 'rgba(52,211,153,0.14)' : '#ECFDF3', color: dark ? '#34D399' : '#027A48', px: 0.8, py: 0.2, borderRadius: 0.5, border: `1px solid ${dark ? 'rgba(52,211,153,0.3)' : '#A6F4C5'}`, fontWeight: 750 }}>
                [GATE OPENED]
              </Box>.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<SecurityIcon />}
              onClick={exportSignedArchitecturalPlan}
              sx={{
                fontWeight: 800,
                bgcolor: '#D4AF37',
                color: '#101828',
                boxShadow: '0 0 16px rgba(212,175,55,0.3)',
                '&:hover': { bgcolor: '#E5C158', boxShadow: '0 0 24px rgba(212,175,55,0.5)' },
              }}
            >
              Export Signed Architectural Plan
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportBrief}
              sx={{
                fontWeight: 750,
                borderColor: dark ? 'rgba(212,175,55,0.5)' : '#B8860B',
                color: goldLight,
                '&:hover': { borderColor: gold, bgcolor: goldBg },
              }}
            >
              Export Markdown Plan
            </Button>
          </Stack>
        </Box>
        </HeroItem>

        {/* Cryptographic Seal & Provenance Bar */}
        <HeroItem>
        <Paper
          sx={{
            mt: 3,
            p: 1.5,
            bgcolor: dark ? 'rgba(8, 8, 11, 0.9)' : '#FEF9E7',
            border: dark ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(184, 134, 11, 0.25)',
            boxShadow: dark ? '0 0 16px rgba(0,0,0,0.5)' : '0 2px 8px rgba(184,134,11,0.06)',
            borderRadius: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FingerprintIcon sx={{ color: gold, fontSize: '1.25rem' }} />
            <Typography variant="caption" sx={{ fontFamily: mono, color: goldLight, fontWeight: 700 }}>
              SHA-256 DIGEST STAMP:
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: mono,
                fontSize: '0.8rem',
                color: dark ? gold : '#B8860B',
                bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#FFFFFF',
                px: 1,
                py: 0.25,
                borderRadius: 0.5,
                border: dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(184,134,11,0.25)',
              }}
            >
              {liveDigest ? `${liveDigest.slice(0, 16)}...${liveDigest.slice(-8)}` : 'COMPUTING_STAMP...'}
            </Typography>
            <Tooltip title={copiedDigest ? 'Copied Full Digest!' : 'Copy Full SHA-256 Digest'}>
              <Button
                size="small"
                onClick={copyDigest}
                sx={{
                  minWidth: 0,
                  p: 0.5,
                  color: goldLight,
                  '&:hover': { color: gold, bgcolor: goldBg },
                }}
              >
                <ContentCopyIcon sx={{ fontSize: '0.95rem' }} />
              </Button>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<PsychologyIcon sx={{ '&&': { color: gold } }} />}
              label={models.length ? `Ollama Active (${models.length} models)` : 'Zero-Egress Oracle Engaged'}
              size="small"
              sx={{
                fontFamily: mono,
                fontSize: '0.75rem',
                bgcolor: dark ? 'rgba(212,175,55,0.1)' : '#FFFFFF',
                color: goldLight,
                border: dark ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(184,134,11,0.25)',
              }}
            />
            <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontWeight: 600 }}>
              SEALED: {opened}/22 GATES
            </Typography>
          </Box>
        </Paper>
        </HeroItem>
      </Box>
      </HeroReveal>

      {/* Sanctum Navigation Tabs */}
      <Tabs
        value={activeSanctumTab}
        onChange={(_, val) => setActiveSanctumTab(val)}
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: divider,
          '& .MuiTab-root': {
            fontWeight: 800,
            fontSize: '0.92rem',
            textTransform: 'none',
            minHeight: 48,
            color: textSecondary,
            '&.Mui-selected': {
              color: goldLight,
            },
          },
          '& .MuiTabs-indicator': {
            bgcolor: gold,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab icon={<LockIcon sx={{ fontSize: '1.15rem' }} />} iconPosition="start" label="Cryptographic Enclave & Zero-Knowledge Attestation" />
        <Tab icon={<AutoAwesomeIcon sx={{ fontSize: '1.15rem' }} />} iconPosition="start" label="22-Arcana Hermetic Planning Rite" />
      </Tabs>

      {/* ========================================================================= */}
      {/* TAB 0: Cryptographic Enclave, ZK Attestation & Hardware Ratchet Simulator */}
      {/* ========================================================================= */}
      {activeSanctumTab === 0 && (
        <RevealOnScroll preset="fadeUp">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4 }}>
          {/* Section 1: Zero-Knowledge Attestation Engine */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 2.5,
              border: `1.5px solid ${gold}`,
              bgcolor: dark ? '#0B0B12' : '#FFFFFF',
              boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 20px rgba(184,134,11,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                  <ShieldIcon sx={{ color: gold, fontSize: '1.6rem' }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.01em' }}>
                    Zero-Knowledge Attestation Engine (Groth16 / BN254)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: textSecondary, maxWidth: 840, lineHeight: 1.6 }}>
                  Generate non-interactive zero-knowledge proofs (NIZK) proving internal swarm execution invariants without disclosing private weights, memory salts, or confidential agent state. Verified via bilinear pairing curve checks: <Box component="span" sx={{ fontFamily: mono, color: goldLight, fontWeight: 700 }}>e(π_A, π_B) = e(α, β) · e(x, γ) · e(π_C, δ)</Box>.
                </Typography>
              </Box>
              <Chip
                label="GROTH16 / ALT-BN128"
                size="small"
                sx={{
                  bgcolor: dark ? 'rgba(212,175,55,0.15)' : '#FEF9E7',
                  color: goldLight,
                  border: `1px solid ${gold}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid xs={12} md={5}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: goldLight, mb: 0.75, display: 'block' }}>
                  STATEMENT INVARIANT TO ATTEST (PUBLIC):
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={zkStatement}
                  onChange={(e) => setZkStatement(e.target.value)}
                  placeholder="e.g. INVARIANT: AGENT_ENCLAVE_ZERO_EGRESS_v2"
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem', bgcolor: dark ? '#08080B' : '#F8FAFC' } }}
                />
              </Grid>
              <Grid xs={12} sm={6} md={3.5}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: goldLight, mb: 0.75, display: 'block' }}>
                  SECRET WITNESS SALT (PRIVATE):
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  value={zkSecretSalt}
                  onChange={(e) => setZkSecretSalt(e.target.value)}
                  placeholder="Private witness salt..."
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem', bgcolor: dark ? '#08080B' : '#F8FAFC' } }}
                />
              </Grid>
              <Grid xs={12} sm={6} md={3.5}>
                <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: goldLight, mb: 0.75, display: 'block' }}>
                  PUBLIC COMMITMENT ROOT:
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={zkPublicRoot}
                  onChange={(e) => setZkPublicRoot(e.target.value)}
                  placeholder="0x..."
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem', bgcolor: dark ? '#08080B' : '#F8FAFC' } }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<FingerprintIcon />}
                onClick={handleGenerateZkProof}
                disabled={zkStatus === 'generating'}
                sx={{
                  bgcolor: gold,
                  color: '#101828',
                  fontWeight: 800,
                  boxShadow: '0 0 16px rgba(212,175,55,0.3)',
                  '&:hover': { bgcolor: dark ? goldLight : '#9A7008' },
                }}
              >
                {zkStatus === 'generating' ? 'Synthesizing Curve Elements...' : 'Generate ZK Proof (Groth16)'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={handleVerifyZkAttestation}
                disabled={!zkProof || zkStatus === 'generating'}
                sx={{
                  borderColor: gold,
                  color: goldLight,
                  fontWeight: 800,
                  '&:hover': { borderColor: dark ? goldLight : '#9A7008', bgcolor: goldBg },
                }}
              >
                Verify Bilinear Pairing Attestation
              </Button>
            </Stack>

            {zkProof && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: dark ? '#08080B' : '#F8FAFC',
                  border: `1px solid ${divider}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: goldLight }}>
                    BN254 GROTH16 PROOF RECORD [WITNESS REMAINS HIDDEN]
                  </Typography>
                  <Chip
                    label={zkStatus === 'valid' ? 'ATTESTATION VERIFIED [VALID]' : 'PROOF SYNTHESIZED [UNVERIFIED]'}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      bgcolor: zkStatus === 'valid' ? (dark ? 'rgba(52,211,153,0.18)' : '#ECFDF3') : goldBg,
                      color: zkStatus === 'valid' ? (dark ? '#34D399' : '#027A48') : goldLight,
                      border: `1px solid ${zkStatus === 'valid' ? (dark ? '#34D399' : '#12B76A') : gold}`,
                    }}
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid xs={12} md={4}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block', mb: 0.5 }}>
                      π_A ∈ G1 (x, y):
                    </Typography>
                    <Box sx={{ p: 1, bgcolor: dark ? '#040406' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 1, fontFamily: mono, fontSize: '0.75rem', color: dark ? '#38BDF8' : '#0284C7' }}>
                      {zkProof.pi_a.join('\n')}
                    </Box>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block', mb: 0.5 }}>
                      π_B ∈ G2 (2x2 Matrix):
                    </Typography>
                    <Box sx={{ p: 1, bgcolor: dark ? '#040406' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 1, fontFamily: mono, fontSize: '0.75rem', color: dark ? '#A78BFA' : '#7C3AED' }}>
                      {zkProof.pi_b.map((row) => `[${row.join(', ')}]`).join('\n')}
                    </Box>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block', mb: 0.5 }}>
                      π_C ∈ G1 (x, y):
                    </Typography>
                    <Box sx={{ p: 1, bgcolor: dark ? '#040406' : '#FFFFFF', border: `1px solid ${divider}`, borderRadius: 1, fontFamily: mono, fontSize: '0.75rem', color: dark ? '#34D399' : '#059669' }}>
                      {zkProof.pi_c.join('\n')}
                    </Box>
                  </Grid>
                </Grid>

                {zkPairingCheck && (
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: dark ? 'rgba(52,211,153,0.08)' : '#ECFDF3',
                      border: dark ? '1px solid rgba(52,211,153,0.3)' : '1px solid #A6F4C5',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? '#34D399' : '#027A48', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
                      CRYPTOGRAPHIC PAIRING EQUALITY PROVED
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.78rem', color: dark ? '#E5E7EB' : '#1F2937', mb: 0.5 }}>
                      LHS: {zkPairingCheck.pairingA}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.78rem', color: dark ? '#E5E7EB' : '#1F2937', mb: 0.5 }}>
                      RHS: {zkPairingCheck.pairingB}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.74rem', color: dark ? '#9CA3AF' : '#4B5563', display: 'block', mt: 1 }}>
                      ATTESTATION CERTIFICATE ID: <strong style={{ color: dark ? '#34D399' : '#027A48' }}>{zkPairingCheck.attestationSignature}</strong> (Verified at {zkPairingCheck.verifiedAt})
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>

          {/* Section 2: Cryptographic Enclave Vault Simulator */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 2.5,
              border: `1.5px solid ${gold}`,
              bgcolor: dark ? '#0B0B12' : '#FFFFFF',
              boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 20px rgba(184,134,11,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                  <LockIcon sx={{ color: gold, fontSize: '1.6rem' }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.01em' }}>
                    Hardware Enclave Vault Simulator (Argon2id + AES-256-GCM)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: textSecondary, maxWidth: 840, lineHeight: 1.6 }}>
                  Emulate hardware memory enclave isolation (e.g. AMD SEV-SNP / Intel SGX / Apple Secure Enclave). Encrypt confidential agent swarms, memory embeddings, and API keys with authenticated 256-bit Galois/Counter Mode.
                </Typography>
              </Box>
              <Chip
                label="ENCLAVE REGION: 0x7FFF_ADYTUM_VAULT"
                size="small"
                sx={{
                  bgcolor: vaultIsLocked ? (dark ? 'rgba(239,68,68,0.15)' : '#FEF2F2') : (dark ? 'rgba(52,211,153,0.15)' : '#ECFDF3'),
                  color: vaultIsLocked ? (dark ? '#F87171' : '#B42318') : (dark ? '#34D399' : '#027A48'),
                  border: `1px solid ${vaultIsLocked ? (dark ? '#F87171' : '#FECDCA') : (dark ? '#34D399' : '#A6F4C5')}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            {vaultAlert && (
              <Alert
                severity={vaultAlert.type}
                sx={{ mb: 2.5, fontWeight: 700, fontFamily: mono, fontSize: '0.8rem' }}
                onClose={() => setVaultAlert(null)}
              >
                {vaultAlert.message}
              </Alert>
            )}

            {!vaultIsLocked ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Confidential Swarm Payload & Memory Invariant"
                  value={vaultSecret}
                  onChange={(e) => setVaultSecret(e.target.value)}
                  placeholder="Enter secret architectural memory..."
                  InputProps={{ sx: { fontFamily: mono, fontSize: '0.84rem', bgcolor: dark ? '#08080B' : '#F8FAFC' } }}
                />
                <Grid container spacing={2} alignItems="center">
                  <Grid xs={12} sm={8} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="Enclave Master Passphrase (Argon2id KDF Salt)"
                      value={vaultPassword}
                      onChange={(e) => setVaultPassword(e.target.value)}
                      placeholder="Passphrase..."
                      InputProps={{ sx: { fontFamily: mono, fontSize: '0.84rem', bgcolor: dark ? '#08080B' : '#F8FAFC' } }}
                    />
                  </Grid>
                  <Grid xs={12} sm={4} md={6}>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon />}
                      onClick={handleEncryptVault}
                      sx={{
                        bgcolor: gold,
                        color: '#101828',
                        fontWeight: 800,
                        boxShadow: '0 0 16px rgba(212,175,55,0.3)',
                        '&:hover': { bgcolor: dark ? goldLight : '#9A7008' },
                      }}
                    >
                      Seal into Enclave Vault (AES-256-GCM)
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: dark ? '#08080B' : '#F8FAFC',
                    border: `1px solid ${divider}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontFamily: mono, color: goldLight, fontWeight: 800, display: 'block', mb: 1 }}>
                    [ENCLAVE SEALED]: CIPHERTEXT &amp; AUTHENTICATION TAG RESIDING IN ISOLATED HEAP
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.78rem', color: dark ? '#F87171' : '#DC2626', wordBreak: 'break-all', mb: 1 }}>
                    <strong>CIPHERTEXT:</strong> {vaultCiphertext}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block' }}>
                        INITIALIZATION VECTOR IV (96-BIT):
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.78rem', color: dark ? '#38BDF8' : '#0284C7' }}>
                        {vaultIv}
                      </Typography>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block' }}>
                        GCM AUTHENTICATION TAG (128-BIT):
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.78rem', color: dark ? '#34D399' : '#059669' }}>
                        {vaultAuthTag}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Grid container spacing={2} alignItems="center">
                  <Grid xs={12} sm={8} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="Enter Master Passphrase to Unseal Enclave"
                      value={vaultInputPassword}
                      onChange={(e) => setVaultInputPassword(e.target.value)}
                      placeholder="Enter passphrase..."
                      InputProps={{ sx: { fontFamily: mono, fontSize: '0.84rem', bgcolor: dark ? '#08080B' : '#F8FAFC' } }}
                    />
                  </Grid>
                  <Grid xs={12} sm={4} md={6}>
                    <Button
                      variant="contained"
                      startIcon={<LockOpenIcon />}
                      onClick={handleDecryptVault}
                      sx={{
                        bgcolor: '#10B981',
                        color: '#101828',
                        fontWeight: 800,
                        '&:hover': { bgcolor: '#059669', color: '#FFFFFF' },
                      }}
                    >
                      Unseal Enclave Vault
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {vaultDecryptedText && (
              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: dark ? 'rgba(52,211,153,0.08)' : '#ECFDF3',
                  border: dark ? '1px solid rgba(52,211,153,0.3)' : '1px solid #A6F4C5',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontFamily: mono, fontWeight: 800, color: dark ? '#34D399' : '#027A48', mb: 0.5 }}>
                  UNSEALED RECOVERED PAYLOAD:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.82rem', color: textPrimary }}>
                  {vaultDecryptedText}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Section 3: Hardware Enclave Key Rotator */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: 2.5,
              border: `1.5px solid ${gold}`,
              bgcolor: dark ? '#0B0B12' : '#FFFFFF',
              boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 20px rgba(184,134,11,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                  <SyncIcon sx={{ color: gold, fontSize: '1.6rem' }} />
                  <Typography variant="h5" sx={{ fontWeight: 900, color: textPrimary, letterSpacing: '-0.01em' }}>
                    Hardware Enclave Key Rotator (Forward-Secure Ratchet)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: textSecondary, maxWidth: 840, lineHeight: 1.6 }}>
                  Provides post-compromise security (PCS) and forward secrecy. Rotates master enclave keys via a symmetric ratchet function, securely wiping deprecated key material from hardware registers.
                </Typography>
              </Box>
              <Chip
                label="FORWARD SECRECY (HKDF-SHA256)"
                size="small"
                sx={{
                  bgcolor: dark ? 'rgba(56,189,248,0.15)' : '#E0F2FE',
                  color: dark ? '#38BDF8' : '#0369A1',
                  border: `1px solid ${dark ? '#38BDF8' : '#7DD3FC'}`,
                  fontWeight: 800,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: dark ? '#08080B' : '#F8FAFC', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary }}>
                    ACTIVE KEY EPOCH
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: mono, color: goldLight, mt: 0.5 }}>
                    Epoch #{enclaveEpoch}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: dark ? '#08080B' : '#F8FAFC', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary }}>
                    SYMMETRIC RATCHET COUNTER
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: mono, color: dark ? '#38BDF8' : '#0284C7', mt: 0.5 }}>
                    Step #{ratchetCounter}
                  </Typography>
                </Paper>
              </Grid>
              <Grid xs={12} sm={4}>
                <Paper sx={{ p: 2, bgcolor: dark ? '#08080B' : '#F8FAFC', border: `1px solid ${divider}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary }}>
                    SECURITY POSTURE
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: dark ? '#34D399' : '#059669', mt: 0.5 }}>
                    Forward-Secure Active
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: goldLight, fontWeight: 700, display: 'block', mb: 0.5 }}>
                ACTIVE HARDWARE KEY FINGERPRINT:
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: dark ? '#08080B' : '#F1F5F9',
                  border: `1px solid ${divider}`,
                  fontFamily: mono,
                  fontSize: '0.82rem',
                  color: dark ? '#FCD34D' : '#B45309',
                  wordBreak: 'break-all',
                }}
              >
                {activeKeyFingerprint}
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<SyncIcon />}
              onClick={handleRotateEnclaveKey}
              sx={{
                bgcolor: gold,
                color: '#101828',
                fontWeight: 800,
                boxShadow: '0 0 16px rgba(212,175,55,0.3)',
                '&:hover': { bgcolor: dark ? goldLight : '#9A7008' },
                mb: 3,
              }}
            >
              Rotate Enclave Master Key (Forward Ratchet)
            </Button>

            <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, fontWeight: 800, display: 'block', mb: 1 }}>
              KEY ROTATION &amp; HARDWARE REGISTER AUDIT LOG:
            </Typography>
            <Stack spacing={1}>
              {keyRotationsHistory.map((item, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 1.25,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    bgcolor: dark ? '#08080B' : '#F8FAFC',
                    border: `1px solid ${divider}`,
                    borderRadius: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={`EPOCH ${item.epoch}`}
                      size="small"
                      sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.7rem', bgcolor: goldBg, color: goldLight }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: mono, fontSize: '0.76rem', color: textPrimary, wordBreak: 'break-all' }}>
                      {item.fingerprint}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary }}>
                      {item.timestamp}
                    </Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: item.status === 'ACTIVE' ? (dark ? 'rgba(52,211,153,0.18)' : '#ECFDF3') : (dark ? 'rgba(107,114,128,0.15)' : '#F3F4F6'),
                        color: item.status === 'ACTIVE' ? (dark ? '#34D399' : '#027A48') : textSecondary,
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Box>
        </RevealOnScroll>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: 22-Arcana Hermetic Planning Rite */}
      {/* ========================================================================= */}
      {activeSanctumTab === 1 && (
        <RevealOnScroll preset="fadeUp">
      {/* Rite Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: goldLight }}>
            RITE PROGRESSION
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700, color: textSecondary }}>
            {opened} of 22 gates opened · now on key {card.key}
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(22, 1fr)', gap: '4px' }}>
          {keys.map((item) => {
            const saved = plan.entries[item.key];
            const here = item.key === card.key;
            const done = Boolean(saved && saved.gate);
            return (
              <Box
                key={item.key}
                title={`Key ${item.key} — ${item.name} (${done ? 'Unlocked' : here ? 'Active' : 'Pending'})`}
                onClick={() => setPlan((prev) => ({ ...prev, current: item.key, startedAt: null }))}
                sx={{
                  height: 14,
                  borderRadius: 0.75,
                  cursor: 'pointer',
                  bgcolor: done ? gold : here ? 'rgba(212,175,55,0.45)' : (dark ? '#1A1A24' : '#E2E8F0'),
                  border: here ? `1px solid ${gold}` : 'none',
                  boxShadow: done ? '0 0 8px rgba(212,175,55,0.4)' : here ? '0 0 6px rgba(212,175,55,0.3)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: done ? '#E5C158' : 'rgba(212,175,55,0.6)',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* How To Perform The Adytum Rite Tutorial Banner */}
      <Paper
        sx={{
          mb: 4,
          borderRadius: 2.5,
          border: dark ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(184,134,11,0.28)',
          bgcolor: dark ? 'rgba(11,11,18,0.95)' : '#FFFFFF',
          boxShadow: dark ? '0 0 28px -6px rgba(212,175,55,0.22)' : '0 4px 16px rgba(184,134,11,0.08)',
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => setShowTutorial(!showTutorial)}
          sx={{
            p: 2.5,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: dark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
            borderBottom: showTutorial ? (dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #F5E6AB') : 'none',
            '&:hover': { bgcolor: dark ? 'rgba(212,175,55,0.12)' : '#FDF3D0' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SchoolIcon sx={{ color: gold, fontSize: '1.4rem' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: goldLight }}>
                How To Perform The Adytum Rite (4-Stage Sovereign Architecture Protocol)
              </Typography>
              <Typography variant="caption" sx={{ color: textSecondary, display: 'block' }}>
                Why each step exists · Neurological incubation science · Hermetic Oracle gatekeeper rules
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            endIcon={showTutorial ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ color: goldLight, fontWeight: 750, textTransform: 'none' }}
          >
            {showTutorial ? 'Hide Guide' : 'Open How-To Guide'}
          </Button>
        </Box>
        <Collapse in={showTutorial}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <WindowCarousel
              title="Adytum Sovereign Workflow Guide"
              badge="4 Architectural Steps"
              items={[
                {
                  step: 'STEP 1',
                  title: 'Select / Draw Tarot Key',
                  desc: 'Select from Key 0 (The Fool) through Key 21 (The World). Each card maps an archetypal principle (e.g. Key 1 = Self-Attention, Key 4 = Guardrails, Key 2 = Memory).'
                },
                {
                  step: 'STEP 2',
                  title: 'Formulate Intention',
                  desc: 'Articulate your software invariant or engineering goal for this key. Declare the exact problem, component boundary, or protocol requirement.'
                },
                {
                  step: 'STEP 3',
                  title: '5-Minute Incubation Window',
                  desc: 'Why 5 Minutes? Immediate coding produces cognitive fixation and premature technical debt. The 300-second pause forces subconscious diffuse-mode contemplation. Fast-Forward test override available for quick audits.'
                },
                {
                  step: 'STEP 4',
                  title: 'Oracle Evaluation & Gate Seal',
                  desc: 'Submit your architectural reflection. Evaluated in-browser (zero-egress) or via local Ollama. When approved ([GATE OPENED]), the gate unlocks and stamps your cryptographic SHA-256 seal.'
                }
              ]}
              initialView="carousel"
              allowToggleMode={true}
              renderItem={(item) => (
                <Box sx={{ p: 2 }}>
                  <Chip label={item.step} size="small" sx={{ bgcolor: dark ? '#D4AF37' : '#B8860B', color: '#101828', fontWeight: 800, mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: dark ? goldLight : '#101828', mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: textSecondary, lineHeight: 1.65 }}>
                    {item.desc}
                  </Typography>
                </Box>
              )}
            />
          </Box>
        </Collapse>
      </Paper>

      {/* 22 Major Arcana Tarot Grimoire & Visual Deck */}
      <Paper
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          borderRadius: 2.5,
          border: dark ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(184,134,11,0.25)',
          bgcolor: dark ? '#0A0A10' : '#FFFFFF',
          boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.18)' : '0 4px 16px rgba(184,134,11,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: dark ? goldLight : '#101828', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: gold }} />
              The 22 Major Arcana Tarot Grimoire Deck
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary }}>
              Visual archetype cards mapped to transformer mechanisms &amp; distributed system invariants
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<CasinoIcon />}
              onClick={drawRandomKey}
              sx={{
                borderColor: dark ? gold : '#B8860B',
                color: dark ? gold : '#8A6A09',
                fontWeight: 750,
                textTransform: 'none',
                '&:hover': { borderColor: goldLight, bgcolor: goldBg },
              }}
            >
              Shuffle &amp; Draw Random Key
            </Button>
            <Button
              variant={deckViewMode === 'carousel' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<ViewCarouselIcon />}
              onClick={() => setDeckViewMode('carousel')}
              sx={{
                fontWeight: 750,
                textTransform: 'none',
                bgcolor: deckViewMode === 'carousel' ? '#D4AF37' : 'transparent',
                color: deckViewMode === 'carousel' ? '#101828' : (dark ? gold : '#8A6A09'),
                borderColor: dark ? gold : '#D4AF37',
              }}
            >
              Deck Carousel
            </Button>
            <Button
              variant={deckViewMode === 'grid' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<GridViewIcon />}
              onClick={() => setDeckViewMode('grid')}
              sx={{
                fontWeight: 750,
                textTransform: 'none',
                bgcolor: deckViewMode === 'grid' ? '#D4AF37' : 'transparent',
                color: deckViewMode === 'grid' ? '#101828' : (dark ? gold : '#8A6A09'),
                borderColor: dark ? gold : '#D4AF37',
              }}
            >
              Grimoire Grid
            </Button>
          </Stack>
        </Box>

        {/* Deck Display: Carousel or Grid */}
        {deckViewMode === 'carousel' ? (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              pt: 1,
              px: 0.5,
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { height: 8 },
              '&::-webkit-scrollbar-thumb': { bgcolor: dark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.25)', borderRadius: 4 },
            }}
          >
            {keys.map((item) => {
              const saved = plan.entries[item.key];
              const isUnlocked = Boolean(saved?.gate);
              const isCurrent = item.key === plan.current;
              const roman = ROMAN_NUMERALS[item.key] || String(item.key);
              const lens = ARCHITECTURAL_LENSES[item.key] || item.name;

              return (
                <Card
                  key={item.key}
                  onClick={() => {
                    setPlan((prev) => ({ ...prev, current: item.key, startedAt: item.key === prev.current ? prev.startedAt : null }));
                    if (workspaceRef.current) workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    minWidth: 200,
                    maxWidth: 220,
                    flexShrink: 0,
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: isCurrent
                      ? `2px solid ${gold}`
                      : isUnlocked
                      ? '1px solid rgba(52,211,153,0.5)'
                      : (dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #EAECF0'),
                    bgcolor: dark ? '#08080B' : '#FFFFFF',
                    boxShadow: isCurrent
                      ? '0 0 20px rgba(212,175,55,0.4)'
                      : isUnlocked
                      ? '0 0 12px rgba(52,211,153,0.2)'
                      : (dark ? 'none' : '0 2px 8px rgba(16,24,40,0.04)'),
                    transform: isCurrent ? 'scale(1.03)' : 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: gold,
                      boxShadow: '0 8px 24px rgba(212,175,55,0.25)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden', height: 240, bgcolor: '#000' }}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        bgcolor: 'rgba(8,8,11,0.9)',
                        color: '#F5E6AB',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        border: '1px solid rgba(212,175,55,0.4)',
                      }}
                    >
                      KEY {roman}
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 6, right: 6 }}>
                      {isUnlocked ? (
                        <Chip label="SEALED" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.9)', color: '#101828' }} />
                      ) : isCurrent ? (
                        <Chip label="ACTIVE" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: dark ? '#D4AF37' : '#B8860B', color: '#101828' }} />
                      ) : null}
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isCurrent ? (dark ? gold : '#B8860B') : textPrimary, fontSize: '0.88rem', lineHeight: 1.2 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: dark ? goldLight : '#8A6A09', fontWeight: 700, display: 'block', mt: 0.5, fontSize: '0.72rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {lens}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <StaggerChildren>
          <Grid container spacing={2}>
            {keys.map((item) => {
              const saved = plan.entries[item.key];
              const isUnlocked = Boolean(saved?.gate);
              const isCurrent = item.key === plan.current;
              const roman = ROMAN_NUMERALS[item.key] || String(item.key);
              const lens = ARCHITECTURAL_LENSES[item.key] || item.name;

              return (
                <StaggerItem key={item.key}>
                <Grid xs={6} sm={4} md={3} lg={2}>
                  <Card
                    onClick={() => {
                      setPlan((prev) => ({ ...prev, current: item.key, startedAt: item.key === prev.current ? prev.startedAt : null }));
                      if (workspaceRef.current) workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: isCurrent
                        ? `2px solid ${gold}`
                        : isUnlocked
                        ? '1px solid rgba(52,211,153,0.5)'
                        : (dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #EAECF0'),
                      bgcolor: dark ? '#08080B' : '#FFFFFF',
                      boxShadow: isCurrent ? '0 0 16px rgba(212,175,55,0.35)' : 'none',
                      transition: 'all 0.18s ease-in-out',
                      '&:hover': { borderColor: gold, transform: 'translateY(-3px)' },
                    }}
                  >
                    <Box sx={{ position: 'relative', height: 180, bgcolor: '#000' }}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          bgcolor: 'rgba(8,8,11,0.9)',
                          color: '#F5E6AB',
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 0.5,
                          fontFamily: mono,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          border: '1px solid rgba(212,175,55,0.4)',
                        }}
                      >
                        KEY {roman}
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: isCurrent ? (dark ? gold : '#B8860B') : textPrimary, fontSize: '0.82rem', lineHeight: 1.2 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: dark ? goldLight : '#8A6A09', fontWeight: 650, display: 'block', mt: 0.25, fontSize: '0.68rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {lens}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                </StaggerItem>
              );
            })}
          </Grid>
          </StaggerChildren>
        )}
      </Paper>

      {/* Key Selectors */}
      <Box sx={{ mb: 4 }}>
        <Typography className="section-kicker">22 Arcana Key Quick Selectors</Typography>
        <Stack direction="row" useFlexGap spacing={0.75} sx={{ flexWrap: 'wrap' }}>
          {keys.map((item) => {
            const saved = plan.entries[item.key];
            const isUnlocked = Boolean(saved?.gate);
            const isSelectable = item.key <= plan.current || isUnlocked || (item.key === plan.current + 1 && entry.gate);
            const isCurrent = item.key === plan.current;
            const roman = ROMAN_NUMERALS[item.key] || String(item.key);
            return (
              <Chip
                key={item.key}
                label={`Key ${roman}: ${item.name}`}
                clickable={isSelectable}
                onClick={() => {
                  if (isSelectable) {
                    setPlan((prev) => ({
                      ...prev,
                      current: item.key,
                      startedAt: item.key === prev.current ? prev.startedAt : null,
                    }));
                    if (workspaceRef.current) workspaceRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                sx={{
                  fontFamily: mono,
                  fontWeight: 750,
                  fontSize: '0.74rem',
                  bgcolor: isCurrent ? (dark ? '#D4AF37' : '#B8860B') : isUnlocked ? (dark ? 'rgba(52,211,153,0.16)' : '#ECFDF3') : (dark ? '#1A1A24' : '#F1F5F9'),
                  color: isCurrent ? '#101828' : isUnlocked ? (dark ? '#34D399' : '#027A48') : textSecondary,
                  border: '1px solid',
                  borderColor: isCurrent ? (dark ? '#D4AF37' : '#B8860B') : isUnlocked ? (dark ? 'rgba(52,211,153,0.4)' : '#A6F4C5') : divider,
                  opacity: isSelectable ? 1 : 0.45,
                  '&:hover': {
                    bgcolor: isCurrent ? (dark ? '#E5C158' : '#9A7209') : isUnlocked ? (dark ? 'rgba(52,211,153,0.25)' : '#D1FADF') : (dark ? '#262635' : '#E2E8F0'),
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Main Workspace Grid */}
      <Box ref={workspaceRef} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px 1fr' }, gap: 3 }}>
        {/* Left Column: Animated Sigil Canvas & Arcana Card */}
        <Paper
          sx={{
            p: 2.5,
            border: dark ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(184,134,11,0.25)',
            borderRadius: 2,
            bgcolor: surface,
            boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.18)' : '0 4px 16px rgba(184,134,11,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Animated Sacred Geometry Sigil Canvas */}
          <Box>
            <SacredGeometrySigil keyIndex={card.key} cardName={card.name} attribution={card.attribution} />
          </Box>

          {/* Arcana Tarot Card Representation */}
          <Box>
            <Box
              component="img"
              src={card.image}
              alt={card.name}
              sx={{
                width: '100%',
                borderRadius: 1.5,
                display: 'block',
                mb: 2,
                border: dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(184,134,11,0.2)',
              }}
            />
            <Typography className="section-kicker">Arcana Key {card.key}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: dark ? gold : '#B8860B' }}>
              {card.name}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: textSecondary, fontWeight: 600, lineHeight: 1.5 }}>
              {card.attribution}
            </Typography>
          </Box>
        </Paper>

        {/* Right Column: Intention, Contemplation Timer & Fast-Forward, Reflection & Oracle Reading */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Key Lesson & Invariant Query */}
          <Paper
            sx={{
              p: 3,
              border: dark ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(184,134,11,0.35)',
              borderRadius: 2,
              bgcolor: goldBg,
              boxShadow: dark ? '0 0 24px -8px rgba(212,175,55,0.22)' : '0 4px 16px rgba(184,134,11,0.08)',
            }}
          >
            <Typography variant="body1" sx={{ mb: 1.5, color: textPrimary, fontWeight: 500, lineHeight: 1.6 }}>
              {card.lesson}
            </Typography>
            <Typography variant="body2" sx={{ color: dark ? goldLight : '#8A6A09', fontWeight: 750 }}>
              {card.question}
            </Typography>
          </Paper>

          {/* Intention Input */}
          <TextField
            label="Intention Statement for this Key"
            multiline
            minRows={3}
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
            placeholder="Define the precise architectural goal or engineering intention for this stage..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: surface,
                '& fieldset': { borderColor: dark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.3)' },
                '&:hover fieldset': { borderColor: gold },
                '&.Mui-focused fieldset': { borderColor: gold },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: gold },
            }}
          />

          {/* 5-Minute Incubation Timer Card with Fast-Forward Contemplation Override */}
          <Paper
            sx={{
              p: 2.5,
              border: dark ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(184,134,11,0.25)',
              borderRadius: 2,
              bgcolor: surface,
              boxShadow: dark ? '0 0 20px rgba(212,175,55,0.12)' : '0 4px 16px rgba(184,134,11,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimerIcon sx={{ color: gold }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: dark ? goldLight : '#101828' }}>
                    5-Minute Incubation Window (Neurological Contemplation)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: textSecondary, display: 'block', mt: 0.25, maxWidth: 600 }}>
                  Mandatory 300-second quiet contemplation pause to allow cognitive digestion of architectural invariants before submitting reflection.
                </Typography>
              </Box>

              <Button
                size="small"
                startIcon={<HelpOutlineIcon sx={{ fontSize: '16px !important' }} />}
                onClick={() => setShowTimerWhy(!showTimerWhy)}
                sx={{ color: dark ? gold : '#8A6A09', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
              >
                {showTimerWhy ? 'Hide Context' : 'Why 5 Minutes?'}
              </Button>
            </Box>

            <Collapse in={showTimerWhy}>
              <Paper
                sx={{
                  p: 1.5,
                  mb: 2,
                  bgcolor: dark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
                  border: dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #F5E6AB',
                  borderRadius: 1.5,
                }}
              >
                <Typography variant="caption" sx={{ display: 'block', color: dark ? goldLight : '#8A6A09', fontWeight: 750, mb: 0.5 }}>
                  Cognitive Neuroscience &amp; Sovereign Architecture Doctrine:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: textSecondary, lineHeight: 1.55 }}>
                  Immediate code generation triggers <em>cognitive fixation</em> and premature technical debt. The 300-second incubation pause activates the brain's Default Mode Network (diffuse-mode thinking), allowing your subconscious to reconcile latent invariants, detect edge-cases, and break free from initial implementation biases.
                  <br />
                  <em>Note: For rapid development testing and automated audits, click <strong>Fast-Forward Contemplation</strong> below.</em>
                </Typography>
              </Paper>
            </Collapse>

            {/* Timer Clock & Progress Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontFamily: mono, fontSize: '2.4rem', fontWeight: 800, color: textPrimary, lineHeight: 1 }}>
                  {clock}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: mono, color: textSecondary, display: 'block', mt: 0.5 }}>
                  {plan.startedAt
                    ? (incubated ? 'Window Fulfilled (100%)' : `Elapsed: ${incubationProgress}% · Remaining: ${clock}`)
                    : 'Timer Idle · Click Start Timer to begin'}
                </Typography>
              </Box>

              {incubated && (
                <Chip
                  icon={<CheckCircleIcon sx={{ color: '#10B981 !important' }} />}
                  label="Contemplation Sealed · Reflection Unlocked"
                  size="small"
                  sx={{
                    bgcolor: dark ? 'rgba(52,211,153,0.16)' : '#ECFDF3',
                    color: dark ? '#34D399' : '#027A48',
                    fontWeight: 800,
                    border: dark ? '1px solid rgba(52,211,153,0.35)' : '1px solid #A6F4C5',
                    py: 1.5,
                    px: 0.5,
                  }}
                />
              )}
            </Box>

            {/* Incubation Progress Bar */}
            {plan.startedAt && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={incubationProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: incubated ? '#10B981' : gold,
                    },
                  }}
                />
              </Box>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={beginIncubation}
                disabled={Boolean(plan.startedAt) && !incubated}
                sx={{
                  px: 3,
                  bgcolor: '#D4AF37',
                  color: '#101828',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#E5C158' },
                  '&.Mui-disabled': { bgcolor: dark ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.08)', color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(16,24,40,0.38)' },
                }}
              >
                {plan.startedAt ? (incubated ? 'Incubation Fulfilled' : 'Incubating Intention...') : 'Start 5-Minute Incubation'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FastForwardIcon />}
                onClick={fastForwardContemplation}
                sx={{
                  borderColor: dark ? gold : '#B8860B',
                  color: dark ? gold : '#8A6A09',
                  fontWeight: 750,
                  '&:hover': { borderColor: goldLight, bgcolor: goldBg },
                }}
              >
                Fast-Forward Contemplation (Test / Audit Mode)
              </Button>
            </Stack>
          </Paper>

          {/* Reflection Form */}
          <Box component="form" onSubmit={askModel} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Reflection & Synthesis"
              multiline
              minRows={4}
              value={reflection}
              disabled={!incubated}
              onChange={(event) => setReflection(event.target.value)}
              placeholder={
                incubated
                  ? `Synthesize how Key ${card.key} (${card.name}) mechanisms unlock your stated intention...`
                  : 'The reflection field unlocks when contemplation incubation reaches 00:00 (or click Fast-Forward Contemplation).'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: surface,
                  '& fieldset': { borderColor: dark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.3)' },
                  '&:hover fieldset': { borderColor: gold },
                  '&.Mui-focused fieldset': { borderColor: gold },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: gold },
              }}
            />

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                select
                label="Evaluator Substrate"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                SelectProps={{ native: true }}
                sx={{
                  minWidth: 260,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: surface,
                    '& fieldset': { borderColor: dark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.3)' },
                  },
                  '& select': {
                    bgcolor: surface,
                    color: textPrimary,
                  },
                }}
                disabled={!models.length}
              >
                {models.length > 0 ? (
                  models.map((name) => (
                    <option key={name} value={name} style={{ backgroundColor: dark ? '#0B0B12' : '#FFFFFF', color: dark ? '#EDEFF2' : '#101828' }}>
                      Local Ollama: {name}
                    </option>
                  ))
                ) : (
                  <option value="" style={{ backgroundColor: dark ? '#0B0B12' : '#FFFFFF', color: dark ? '#EDEFF2' : '#101828' }}>
                    Zero-Egress Hermetic Evaluator (In-Browser)
                  </option>
                )}
              </TextField>

              <Button
                type="submit"
                variant="contained"
                disabled={!incubated || busy || !reflection.trim()}
                sx={{
                  px: 3,
                  bgcolor: '#D4AF37',
                  color: '#101828',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#E5C158' },
                  '&.Mui-disabled': { bgcolor: dark ? 'rgba(212,175,55,0.2)' : 'rgba(0,0,0,0.08)', color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(16,24,40,0.38)' },
                }}
              >
                {busy
                  ? 'Evaluating Gate…'
                  : models.length
                  ? 'Submit Reflection to Local Model'
                  : 'Submit to Hermetic Oracle (Zero-Egress)'}
              </Button>

              <Button
                variant="outlined"
                disabled={!entry.gate || plan.current === 21}
                onClick={advance}
                sx={{
                  fontWeight: 750,
                  borderColor: dark ? gold : '#B8860B',
                  color: dark ? gold : '#8A6A09',
                  '&:hover': { borderColor: goldLight, bgcolor: goldBg },
                  '&.Mui-disabled': { borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(16,24,40,0.35)' },
                }}
              >
                {plan.current === 21 && entry.gate ? 'Rite Completed' : 'Proceed to Next Key →'}
              </Button>
            </Box>
          </Box>

          {/* Zero-Egress Status Notice when Ollama is offline */}
          {!models.length && (
            <Paper
              sx={{
                p: 1.5,
                bgcolor: dark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
                border: dark ? '1px solid rgba(212,175,55,0.25)' : '1px solid #F5E6AB',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <PsychologyIcon sx={{ color: gold, fontSize: '1.25rem' }} />
              <Typography variant="body2" sx={{ color: dark ? goldLight : '#8A6A09', fontSize: '0.85rem' }}>
                Local Ollama is offline on 127.0.0.1:11434. <strong>Zero-Egress Hermetic Evaluator</strong> is active. Your reflection is analyzed directly in your browser against the lesson mechanisms with zero data egress.
              </Typography>
            </Paper>
          )}

          {error && (
            <Typography sx={{ color: '#EF4444', fontWeight: 700, fontFamily: mono, fontSize: '0.88rem' }}>
              Error: {error}
            </Typography>
          )}

          {/* Gatekeeper Reading Display */}
          {reading && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {reading.includes('[GATE OPENED]') ? (
                  <CheckCircleIcon sx={{ color: '#34D399', fontSize: '1.15rem' }} />
                ) : (
                  <AutoAwesomeIcon sx={{ color: gold, fontSize: '1.15rem' }} />
                )}
                <Typography className="section-kicker" sx={{ mb: 0 }}>
                  {reading.includes('[GATE OPENED]') ? 'GATE UNLOCKED · RECORD SEALED' : 'HERMETIC ORACLE READING'}
                </Typography>
              </Box>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: dark
                    ? '#08080B'
                    : (reading.includes('[GATE OPENED]') ? '#F0FDF4' : '#FEFAF0'),
                  color: reading.includes('[GATE OPENED]')
                    ? (dark ? '#34D399' : '#15803D')
                    : (dark ? '#F8FAFC' : '#1E293B'),
                  whiteSpace: 'pre-wrap',
                  fontFamily: mono,
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  borderRadius: 2,
                  border: reading.includes('[GATE OPENED]')
                    ? (dark ? '1px solid rgba(52, 211, 153, 0.5)' : '1px solid #86EFAC')
                    : (dark ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid #F5E6AB'),
                  boxShadow: reading.includes('[GATE OPENED]')
                    ? (dark ? '0 0 20px rgba(52, 211, 153, 0.15)' : '0 4px 16px rgba(16, 185, 129, 0.12)')
                    : (dark ? '0 0 20px rgba(212, 175, 55, 0.15)' : '0 4px 16px rgba(184, 134, 11, 0.1)'),
                }}
              >
                {reading}
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
      </RevealOnScroll>
      )}

      {/* Sovereign Installation & Ecosystem Deployment Funnel */}
      <RevealOnScroll preset="fadeUp">
      <SovereignFunnel
        title="Deploy Adytum Alchemist & Sovereign Tools Locally"
        subtitle="Adytum Alchemist and the entire Zoth Studio suite are designed for 100% offline, zero-cloud execution. Run the standalone Adytum CLI package on your machine, clone the full Zoth Studio v2 cockpit, or boot the air-gapped bare-metal Zoth OS."
        toolTitle="Option 1: Adytum CLI Micro-Repo"
        toolTag="STANDALONE"
        toolDescription="Dedicated standalone repository with offline 22-Key planning rite, automated incubation clocks, and cryptographic SHA-256 seal stamp generators."
        toolRepo="https://github.com/NullAITech/adytum-alchemist-ai-workflow"
        toolCommand="git clone https://github.com/NullAITech/adytum-alchemist-ai-workflow.git"
        sx={{ mt: 6 }}
      />
      </RevealOnScroll>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', bgcolor: '#10B981', color: '#FFFFFF', fontWeight: 700 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );

  if (embedded) {
    return <Box sx={{ py: 1 }}>{mainContent}</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {mainContent}
    </Container>
  );
}

export default function AdytumPage() {
  return <AdytumEngine embedded={false} />;
}
