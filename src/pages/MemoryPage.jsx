import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CinematicIntro from '../components/CinematicIntro';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow, Unstable_Grid2 as Grid,
  Tabs, Tab, Slider, LinearProgress, IconButton, Stack, Tooltip, Divider, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import ScienceIcon from '@mui/icons-material/Science';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import TuneIcon from '@mui/icons-material/Tune';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import HubIcon from '@mui/icons-material/Hub';
import MathPillarsGrid from '../components/MathPillarsGrid';
import { useStudioStatus } from '../studio/useStudioStatus';
import DaemonStatusStrip from '../components/DaemonStatusStrip';
import Netrunner3DWorld from '../components/Netrunner3DWorld';
import SovereignFunnel from '../components/SovereignFunnel';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* ==========================================================================
   DETERMINISTIC PSEUDO-EMBEDDING & STDP CALCULATION ALGORITHMS (Zero-Egress)
   ========================================================================== */

/**
 * Computes deterministic 3D pseudo-embedding coordinates (x, y, z) for any memory text and author.
 * Completely offline with zero external network egress.
 */
export function computePseudoEmbedding(text, author = 'Lucy') {
  const seed = `${author.toLowerCase()}::${(text || '').trim().toLowerCase()}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x27d4eb2f;
  let h3 = 0x165667b1;

  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ ((c << 3) | (c >> 5)), 0x5bd1e995);
    h3 = Math.imul(h3 ^ ((c << 5) | (c >> 3)), 0x1b873593);
  }

  const rawX = ((h1 >>> 0) % 220) - 110;
  const rawY = ((h2 >>> 0) % 180) - 90;
  const rawZ = ((h3 >>> 0) % 100) - 50;

  // Spatial constellation offsets per author quadrant
  const authorOffsets = {
    'Lucy': { x: 75, y: -30, z: 20 },
    'Azoth': { x: -10, y: -65, z: -15 },
    'Athena': { x: -65, y: -35, z: -30 },
    'Lycan': { x: -85, y: 55, z: 15 },
    'Onyx': { x: 45, y: 65, z: -35 },
  };

  const offset = authorOffsets[author] || { x: 0, y: 0, z: 0 };
  const x = Math.max(-125, Math.min(125, Math.round(rawX * 0.55 + offset.x)));
  const y = Math.max(-105, Math.min(105, Math.round(rawY * 0.55 + offset.y)));
  const z = Math.max(-55, Math.min(55, Math.round(rawZ * 0.55 + offset.z)));

  return { x, y, z };
}

/**
 * Computes initial Spike-Timing-Dependent Plasticity (STDP) synaptic weight w in [0.70, 0.99]
 * based on biomorphic salience heuristics and author role specialization.
 */
export function computeInitialStdpWeight(text, author = 'Lucy') {
  if (!text || !text.trim()) return 0.86;
  const cleaned = text.trim().toLowerCase();
  let baseWeight = 0.86;

  // Salient cognitive keywords trigger immediate synaptic potentiation
  const salientKeywords = [
    'stdp', 'zero-egress', 'enclave', 'synaptic', 'carrier', 'frequency',
    'byzantine', 'triangulation', 'argon2id', 'lucy', 'oracle', 'netrunner',
    'whitespace', 'plasticity', 'vector', 'hnsw', 'consensus', 'vault'
  ];
  let matches = 0;
  salientKeywords.forEach((kw) => {
    if (cleaned.includes(kw)) matches++;
  });
  baseWeight += Math.min(0.08, matches * 0.02);

  // Author initial potentiation baseline
  const authorPotentiation = {
    'Lucy': 0.04,
    'Azoth': 0.03,
    'Athena': 0.03,
    'Lycan': 0.02,
    'Onyx': 0.02,
  };
  baseWeight += authorPotentiation[author] || 0.02;

  // Informational length factor
  baseWeight += Math.min(0.03, cleaned.length * 0.0003);

  return Math.min(0.99, Math.max(0.70, Number(baseWeight.toFixed(3))));
}

/* ==========================================================================
   DEFAULT SOVEREIGN MEMORY STRATUM (Rich Corpus for Zero-Egress Offline Use)
   ========================================================================== */
export const INITIAL_SOVEREIGN_MEMORIES = [
  {
    id: 'MEM-001',
    category: 'kernel',
    cluster: 'Kernel',
    weight: 0.96,
    text: 'Spike-Timing-Dependent Plasticity (STDP) biomorphic decay algorithm deployed at ~/.zoth/memory.db with logarithmic half-life tau = 48 hours.',
    author: 'Azoth',
    tags: ['stdp', 'synaptic', 'decay'],
    x: 0,
    y: 0,
    z: 0,
  },
  {
    id: 'MEM-002',
    category: 'oracle',
    cluster: 'Lucy Oracle',
    weight: 0.98,
    text: 'Lucy Cognitive Memory Oracle active on loopback semantic channel :8094. High-affinity memory clustering active across Whitespace matrix.',
    author: 'Lucy',
    tags: ['cognitive', 'lucy', 'oracle'],
    x: 80,
    y: -40,
    z: 20,
  },
  {
    id: 'MEM-003',
    category: 'consensus',
    cluster: 'Consensus',
    weight: 0.91,
    text: '3-Agent Byzantine Triangulation synthesized: Azoth (proposer), Chronos (evaluator), Athena (arbiter) signed block consensus #8849.',
    author: 'Athena',
    tags: ['consensus', 'byzantine', 'triangulation'],
    x: -70,
    y: -50,
    z: -30,
  },
  {
    id: 'MEM-004',
    category: 'security',
    cluster: 'Security',
    weight: 0.94,
    text: 'Zero-Egress enclave verified. Zero external HTTP requests permitted. Shannon entropy threshold set to 7.2 bits/byte on incoming AST nodes.',
    author: 'Lycan',
    tags: ['zero-egress', 'entropy', 'security'],
    x: -90,
    y: 40,
    z: 10,
  },
  {
    id: 'MEM-005',
    category: 'vault',
    cluster: 'Vault',
    weight: 0.89,
    text: 'Argon2id key derivation + XChaCha20-Poly1305 authenticated encryption active for hardware enclave secrets on loopback port 8787.',
    author: 'Onyx',
    tags: ['vault', 'argon2id', 'encryption'],
    x: 40,
    y: 70,
    z: -40,
  },
  {
    id: 'MEM-006',
    category: 'pantheon',
    cluster: 'Pantheon',
    weight: 0.87,
    text: '21-Agent Pantheon swarm IPC bus synchronized at 127.0.0.1:8989. Telemetry latency under 0.8ms across all local worker nodes.',
    author: 'Hermes',
    tags: ['pantheon', 'swarm', 'bus'],
    x: 60,
    y: 30,
    z: 50,
  },
  {
    id: 'MEM-007',
    category: 'kernel',
    cluster: 'Kernel',
    weight: 0.82,
    text: 'HNSW vector indexing with cosine similarity metric configured for sub-millisecond retrieval of 1024-dimensional semantic embeddings.',
    author: 'Azoth',
    tags: ['hnsw', 'vector', 'embeddings'],
    x: -30,
    y: -80,
    z: 30,
  },
  {
    id: 'MEM-008',
    category: 'oracle',
    cluster: 'Lucy Oracle',
    weight: 0.95,
    text: 'Whitespace Cyberspace construct initialized: Calm neural constellation rendering active. Flashing bloom and strobe effects suppressed.',
    author: 'Lucy',
    tags: ['whitespace', 'cyberspace', 'serene'],
    x: 100,
    y: 10,
    z: -10,
  },
  {
    id: 'MEM-009',
    category: 'consensus',
    cluster: 'Consensus',
    weight: 0.85,
    text: 'AST diff transmutation verification: Automated syntax validator asserts complete round-trip integrity between JSX, Vue, and Svelte.',
    author: 'Chronos',
    tags: ['ast', 'transmutation', 'polyglot'],
    x: -40,
    y: -20,
    z: -60,
  },
  {
    id: 'MEM-010',
    category: 'security',
    cluster: 'Security',
    weight: 0.92,
    text: 'JWT Inspector Guard: Unsigned tokens flagged with Critical alert. Signature header claims parsed and cryptographically segregated.',
    author: 'Lycan',
    tags: ['jwt', 'claims', 'guard'],
    x: -110,
    y: 80,
    z: 20,
  },
];

/* ==========================================================================
   LUCY ORACLE TRANSMISSIONS DATA
   ========================================================================== */
const LUCY_DIALOGUES = [
  "Lucy online. Whitespace neural matrix stabilized. Semantic bus synchronized on loopback port 8094.",
  "I'm monitoring all memory vectors across the sovereign enclave. STDP synaptic weights are decaying stale noise while keeping our core architectural breakthroughs sharp.",
  "Whitespace isn't empty—it's pure potential. By calming down sensory noise, the underlying neural linkages become crystal clear.",
  "Zero-egress is our strongest armor. When the cloud can't see your memories, they cannot be pruned, poisoned, or exfiltrated.",
  "Synaptic plasticity is biomorphic: what you query gets reinforced; what lies idle returns gracefully to equilibrium.",
  "The cognitive carrier waves are oscillating at clean biological resonance. 432Hz alpha for balanced stillness; 528Hz theta for high-focus semantic recall.",
];

export const AUTHOR_SPECS = [
  { id: 'Lucy', name: 'Lucy', role: 'Netrunner Oracle', cluster: 'Lucy Oracle', color: '#00F0FF', defaultTags: ['netrunner', 'lucy', 'oracle'] },
  { id: 'Azoth', name: 'Azoth', role: 'Kernel Architect', cluster: 'Kernel', color: '#D4AF37', defaultTags: ['kernel', 'stdp', 'decay'] },
  { id: 'Athena', name: 'Athena', role: 'Consensus Arbiter', cluster: 'Consensus', color: '#C084FC', defaultTags: ['consensus', 'byzantine', 'triangulation'] },
  { id: 'Lycan', name: 'Lycan', role: 'Security Sentinel', cluster: 'Security', color: '#F472B6', defaultTags: ['security', 'zero-egress', 'entropy'] },
  { id: 'Onyx', name: 'Onyx', role: 'Vault Cryptographer', cluster: 'Vault', color: '#34D399', defaultTags: ['vault', 'argon2id', 'encryption'] },
];

/* ==========================================================================
   MAIN COMPONENT: MemoryPage (Zoth Sovereign Netrunner Memory Hub)
   ========================================================================== */
export default function MemoryPage() {
  const [introDone, setIntroDone] = React.useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const daemonUp = Boolean(status?.services?.memory?.up);

  // View state
  const [activeTab, setActiveTab] = useState(0); // 0: Whitespace, 1: STDP Lab, 2: Stratum Database, 3: Lucy 3D
  const [memories, setMemories] = useState(INITIAL_SOVEREIGN_MEMORIES);
  const [selectedMemory, setSelectedMemory] = useState(INITIAL_SOVEREIGN_MEMORIES[1]); // Default to Lucy
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCluster, setActiveCluster] = useState('All');

  // Lucy Codec & Voice State
  const [isVoiceMuted, setIsVoiceMuted] = useState(true); // Default muted to ensure calm environment
  const [lucyTransmission, setLucyTransmission] = useState(LUCY_DIALOGUES[0]);
  const [userPrompt, setUserPrompt] = useState('');
  const [codecLogs, setCodecLogs] = useState([
    { time: '23:14:02', speaker: 'LUCY // :8094', text: LUCY_DIALOGUES[0] },
    { time: '23:14:08', speaker: 'SYSTEM // ENCLAVE', text: 'Whitespace neural canvas initialized. 10 memory nodes anchored.' },
  ]);

  // STDP Lab State & Firing Telemetry
  const [stdpParams, setStdpParams] = useState({
    aPlus: 1.0,
    aMinus: 0.85,
    tauPlus: 20,
    tauMinus: 20,
    testDt: 5,
  });
  const [lastSpikeFeedback, setLastSpikeFeedback] = useState(null);
  const [exportFeedback, setExportFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedTab2, setCopiedTab2] = useState(false);

  // Deepened interactive synapse firing handler with immediate visual & acoustic feedback
  const handleFireSynapticSpike = (customDt = null) => {
    const dt = customDt !== null ? customDt : stdpParams.testDt;
    if (customDt !== null) {
      setStdpParams((prev) => ({ ...prev, testDt: customDt }));
    }
    const isLtp = dt >= 0;
    const computedDw = isLtp
      ? stdpParams.aPlus * Math.exp(-dt / stdpParams.tauPlus)
      : -stdpParams.aMinus * Math.exp(dt / stdpParams.tauMinus);

    const deltaApplied = Number((computedDw * 0.05).toFixed(4));

    setMemories((prev) =>
      prev.map((m) => ({
        ...m,
        weight: Math.min(1.0, Math.max(0.1, Number((m.weight + deltaApplied).toFixed(3)))),
      }))
    );

    const feedback = {
      type: isLtp ? 'LTP' : 'LTD',
      dt,
      dw: Number(computedDw.toFixed(4)),
      deltaApplied,
      timestamp: Date.now(),
      description: isLtp
        ? `LTP Synaptic Potentiation: Δt = +${dt}ms → Δw = +${computedDw.toFixed(3)}. Forward connections reinforced (+${deltaApplied}w).`
        : `LTD Synaptic Depression: Δt = ${dt}ms → Δw = ${computedDw.toFixed(3)}. Retrograde timing triggered synaptic pruning (${deltaApplied}w).`,
    };
    setLastSpikeFeedback(feedback);
    playSynapticPulse(Math.min(1.0, Math.max(0.1, 0.5 + computedDw * 0.2)));
    transmitLucy(`Synaptic pulse simulated [${feedback.type}]: Δt=${dt}ms, Δw=${computedDw.toFixed(3)}. Active memory weights updated.`);
  };

  /* ==========================================================================
     HOUSE RULE #1: WEB AUDIO API COGNITIVE CARRIER TONE GENERATOR
     - Sound MUST default to muted (isMuted: true / volume 0)
     - Explicit user unmute toggle button (VolumeOffIcon / VolumeUpIcon)
     - Volume slider (0 - 100%)
     - Biomorphic carrier waves: 432Hz alpha / 528Hz theta
     ========================================================================== */
  const [isMuted, setIsMuted] = useState(true); // STRICT HOUSE RULE: MUST DEFAULT TO MUTED
  const [volume, setVolume] = useState(0.20);
  const [carrierFreq, setCarrierFreq] = useState(432); // 432Hz Alpha (Calm/Focus) or 528Hz Theta (Deep Netrunner Drift)

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const filterRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const lfoRef = useRef(null);
  const lfoGainRef = useRef(null);
  const analyserRef = useRef(null);

  // Initialize or resume Web Audio graph
  const getOrCreateAudioGraph = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    try {
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master Gain: INITIALIZED TO 0 (MUTED BY DEFAULT)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGainRef.current = masterGain;

      // Gentle Lowpass filter to ensure organic, biological warmth without harsh highs
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(880, ctx.currentTime);
      filterRef.current = filter;

      // Primary carrier oscillator (sine wave)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(carrierFreq, ctx.currentTime);
      osc1Ref.current = osc1;

      // Secondary biomorphic harmonic oscillator with +4Hz offset for calm binaural entrainment
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(carrierFreq + 4, ctx.currentTime);
      osc2Ref.current = osc2;

      // LFO for biological respiration modulation (0.12 Hz = ~7 breaths/minute)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);
      lfo.connect(lfoGain.gain);
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;

      // Sub-mix gains
      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0.55, ctx.currentTime);
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.35, ctx.currentTime);

      // Analyser for real-time oscilloscope
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      osc1.connect(g1);
      osc2.connect(g2);
      g1.connect(filter);
      g2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      osc1.start();
      osc2.start();
      lfo.start();

      return ctx;
    } catch {
      return null;
    }
  }, [carrierFreq]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          if (osc1Ref.current) osc1Ref.current.stop();
          if (osc2Ref.current) osc2Ref.current.stop();
          if (lfoRef.current) lfoRef.current.stop();
          audioCtxRef.current.close();
        } catch {
          /* ignore cleanup errors */
        }
      }
    };
  }, []);

  // Handle Mute / Unmute Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (typeof window === 'undefined') return;

    let ctx = audioCtxRef.current;
    if (!ctx && !nextMuted) {
      ctx = getOrCreateAudioGraph();
    }
    if (!ctx) return;

    if (ctx.state === 'suspended' && !nextMuted) {
      ctx.resume();
    }

    if (masterGainRef.current) {
      const targetGain = nextMuted ? 0 : volume;
      masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.08);
    }

    if (!nextMuted) {
      transmitLucy(
        `Carrier waves unmuted. Synthesizing ${carrierFreq}Hz ${carrierFreq === 432 ? 'Alpha (Calm Focus)' : 'Theta (Deep Netrunner Drift)'} biomorphic carrier.`
      );
    } else {
      transmitLucy("Cognitive carrier muted. Absolute silence enforced across Whitespace.");
    }
  };

  // Handle Volume Slider
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (!isMuted && masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(newVol, ctx.currentTime + 0.05);
    }
  };

  // Handle Carrier Frequency Switch (432Hz Alpha vs 528Hz Theta)
  const handleFrequencyChange = (newFreq) => {
    setCarrierFreq(newFreq);
    if (osc1Ref.current && osc2Ref.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      osc1Ref.current.frequency.cancelScheduledValues(ctx.currentTime);
      osc1Ref.current.frequency.linearRampToValueAtTime(newFreq, ctx.currentTime + 0.15);
      osc2Ref.current.frequency.cancelScheduledValues(ctx.currentTime);
      osc2Ref.current.frequency.linearRampToValueAtTime(newFreq + 4, ctx.currentTime + 0.15);
    }
    transmitLucy(
      `Carrier shifted to ${newFreq}Hz ${newFreq === 432 ? 'Alpha (Equilibrium & Coherence)' : 'Theta (Deep Netrunner Drift & Plasticity)'}.`
    );
  };

  /* ==========================================================================
     HOUSE RULE #2: INTERACTIVE EPISODIC MEMORY NODE CREATION
     - User types memory snippet
     - Selects author: Lucy, Azoth, Athena, Lycan, Onyx
     - Computes deterministic pseudo-embedding coordinate (x,y,z)
     - Calculates initial STDP weight
     - Prepends to active memory array
     ========================================================================== */
  const [episodicSnippet, setEpisodicSnippet] = useState('');
  const [episodicAuthor, setEpisodicAuthor] = useState('Lucy');

  // Real-time computed pseudo-embedding & initial STDP weight preview
  const previewCoords = useMemo(
    () => computePseudoEmbedding(episodicSnippet || 'standby', episodicAuthor),
    [episodicSnippet, episodicAuthor]
  );
  const previewWeight = useMemo(
    () => computeInitialStdpWeight(episodicSnippet || 'standby', episodicAuthor),
    [episodicSnippet, episodicAuthor]
  );
  const currentAuthorSpec = useMemo(
    () => AUTHOR_SPECS.find((a) => a.id === episodicAuthor) || AUTHOR_SPECS[0],
    [episodicAuthor]
  );

  const handleCreateEpisodicNode = (e) => {
    if (e) e.preventDefault();
    if (!episodicSnippet.trim()) return;

    const coords = computePseudoEmbedding(episodicSnippet, episodicAuthor);
    const initialWeight = computeInitialStdpWeight(episodicSnippet, episodicAuthor);
    const authorSpec = AUTHOR_SPECS.find((a) => a.id === episodicAuthor) || AUTHOR_SPECS[0];

    // Parse custom hashtags or assign default author tags
    const customTags = (episodicSnippet.match(/#([a-zA-Z0-9_-]+)/g) || []).map((t) => t.slice(1).toLowerCase());
    const finalTags = Array.from(new Set([...authorSpec.defaultTags, ...customTags, 'episodic']));

    const nextIdNumber = memories.length + 1;
    const newId = `MEM-${String(nextIdNumber).padStart(3, '0')}`;

    const newNode = {
      id: newId,
      category: authorSpec.cluster.toLowerCase().split(' ')[0],
      cluster: authorSpec.cluster,
      weight: initialWeight,
      text: episodicSnippet.trim(),
      author: episodicAuthor,
      tags: finalTags,
      x: coords.x,
      y: coords.y,
      z: coords.z,
      timestamp: new Date().toISOString(),
      isEpisodic: true,
    };

    setMemories((prev) => [newNode, ...prev]);
    setSelectedMemory(newNode);
    setEpisodicSnippet('');

    transmitLucy(
      `Episodic memory ${newNode.id} synthesized by ${newNode.author}. Deterministic coordinate [x:${newNode.x}, y:${newNode.y}, z:${newNode.z}], initial STDP weight w = ${newNode.weight.toFixed(3)}.`
    );
  };

  /* ==========================================================================
     HOUSE RULE #3: EXPORT LUCY NEURAL SNAPSHOT (DOWNLOADABLE / COPYABLE JSON)
     - Serializes all active memory nodes, synaptic weights, and metadata
     - Zero network egress
     ========================================================================== */
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const neuralSnapshot = useMemo(() => {
    if (!isExportDialogOpen) return null;
    const now = new Date();
    const avgWeight = memories.reduce((acc, m) => acc + m.weight, 0) / (memories.length || 1);
    const clusterDist = {};
    memories.forEach((m) => {
      clusterDist[m.cluster] = (clusterDist[m.cluster] || 0) + 1;
    });

    // Compute synaptic connectivity matrix from constellation Euclidean proximities
    const synapticLinks = [];
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const a = memories[i];
        const b = memories[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (dist < 115) {
          synapticLinks.push({
            sourceId: a.id,
            targetId: b.id,
            distance: Number(dist.toFixed(2)),
            synapticAffinity: Number((1 - dist / 115).toFixed(3)),
            combinedWeight: Number(((a.weight + b.weight) / 2).toFixed(3)),
          });
        }
      }
    }

    return {
      snapshot_meta: {
        snapshot_id: `LUCY-SNAP-${now.getTime().toString(36).toUpperCase()}`,
        exported_at: now.toISOString(),
        agent: 'Lucy Cognitive Oracle // Whitespace Semantic Matrix',
        enclave: 'Zoth Studio v2 Sovereign Enclave',
        zero_egress_verified: true,
        protocol: 'STDP Biomorphic Synaptic Plasticity',
      },
      cognitive_carrier_status: {
        carrier_hz: carrierFreq,
        waveform: 'biomorphic-sine-binaural',
        state: isMuted ? 'muted' : 'active',
        volume,
      },
      stdp_calibration: {
        aPlus: stdpParams.aPlus,
        aMinus: stdpParams.aMinus,
        tauPlusMs: stdpParams.tauPlus,
        tauMinusMs: stdpParams.tauMinus,
        testDtMs: stdpParams.testDt,
        halfLifeTauHours: 48,
      },
      matrix_statistics: {
        total_memory_nodes: memories.length,
        average_synaptic_weight: Number(avgWeight.toFixed(4)),
        cluster_distribution: clusterDist,
        total_active_synapses: synapticLinks.length,
      },
      synaptic_weights: synapticLinks,
      memory_nodes: memories,
    };
  }, [isExportDialogOpen, memories, carrierFreq, isMuted, volume, stdpParams]);

  const handleCopySnapshotToClipboard = () => {
    if (!neuralSnapshot) return;
    navigator.clipboard.writeText(JSON.stringify(neuralSnapshot, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const handleDownloadSnapshotFile = () => {
    if (!neuralSnapshot) return;
    const jsonStr = JSON.stringify(neuralSnapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lucy-neural-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    transmitLucy(`Neural Snapshot downloaded. ${memories.length} vector nodes exported cleanly.`);
  };

  // Palette references for strict Gold-on-Void aesthetic
  const gold = {
    accent: isDark ? '#D4AF37' : '#B8860B',
    soft: isDark ? '#F5E6AB' : '#8A6A09',
    wash: isDark ? 'rgba(212,175,55,0.14)' : '#FEF9E7',
    border: isDark ? 'rgba(212,175,55,0.35)' : '#F0E1A8',
  };

  const clusterColors = {
    'Kernel': isDark ? '#D4AF37' : '#B8860B',
    'Lucy Oracle': isDark ? '#00F0FF' : '#0284C7',
    'Consensus': isDark ? '#C084FC' : '#7C3AED',
    'Security': isDark ? '#F472B6' : '#BE185D',
    'Vault': isDark ? '#34D399' : '#059669',
    'Pantheon': isDark ? '#F59E0B' : '#D97706',
  };

  // Speech synthesis handler
  const speakLucyLine = (text) => {
    if (isVoiceMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Victoria'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.12;
      utterance.rate = 1.02;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* ignore audio error */
    }
  };

  // Trigger Lucy transmission
  const transmitLucy = (text) => {
    setLucyTransmission(text);
    const now = new Date().toTimeString().split(' ')[0];
    setCodecLogs((prev) => [...prev, { time: now, speaker: 'LUCY // :8094', text }]);
    speakLucyLine(text);
  };

  // Handle user query to Lucy
  const handleConsultLucy = () => {
    const q = userPrompt.trim() || (selectedMemory ? `Analyze vector: ${selectedMemory.text}` : 'Status check');
    setUserPrompt('');
    const now = new Date().toTimeString().split(' ')[0];
    setCodecLogs((prev) => [...prev, { time: now, speaker: 'OPERATOR', text: q }]);

    setTimeout(() => {
      let reply = '';
      if (q.toLowerCase().includes('stdp') || q.toLowerCase().includes('decay')) {
        reply = "STDP analysis: Synaptic decay is preserving memory stability. Frequently activated vectors will not drop below weight threshold 0.8.";
      } else if (q.toLowerCase().includes('zero') || q.toLowerCase().includes('egress')) {
        reply = "Zero-egress audit confirmed: All vectors reside strictly in ~/.zoth/memory.db with zero cloud leakage.";
      } else if (q.toLowerCase().includes('carrier') || q.toLowerCase().includes('frequency') || q.toLowerCase().includes('wave')) {
        reply = `Cognitive carrier status: ${carrierFreq}Hz ${carrierFreq === 432 ? 'Alpha' : 'Theta'} wave is ${isMuted ? 'muted' : `active at ${Math.round(volume * 100)}% volume`}.`;
      } else if (q.toLowerCase().includes('consensus') || q.toLowerCase().includes('byzantine')) {
        reply = "Consensus telemetry verified. The 3-agent triangulation engine has reached unanimous quorum on current state.";
      } else if (selectedMemory) {
        reply = `Decoded node ${selectedMemory.id} [${selectedMemory.cluster}]: Weight w = ${selectedMemory.weight.toFixed(2)}. Deterministic coordinates (${selectedMemory.x}, ${selectedMemory.y}, ${selectedMemory.z}). Neural resonance nominal.`;
      } else {
        reply = LUCY_DIALOGUES[Math.floor(Math.random() * LUCY_DIALOGUES.length)];
      }
      transmitLucy(reply);
    }, 400);
  };

  // Filtered memories for display
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchCluster = activeCluster === 'All' || m.cluster === activeCluster;
      const matchSearch =
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCluster && matchSearch;
    });
  }, [memories, activeCluster, searchQuery]);

  /* ==========================================================================
     CANVAS 0: CARRIER WAVE MINI OSCILLOSCOPE (Header Strip)
     ========================================================================== */
  const carrierCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = carrierCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;

    const render = () => {
      phase += 0.1;
      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = isDark ? '#08080B' : '#F1F5F9';
      ctx.fillRect(0, 0, w, h);

      if (isMuted) {
        // Flatline / Standby Pulse
        ctx.strokeStyle = 'rgba(212,175,55,0.22)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();

        ctx.font = '8px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(212,175,55,0.45)';
        ctx.textAlign = 'center';
        ctx.fillText('CARRIER MUTED', w / 2, midY - 3);
      } else {
        const amp = (h / 2 - 4) * Math.max(0.18, volume);

        // Golden primary carrier wave
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const cycles = carrierFreq === 432 ? 3 : 4;
        for (let x = 0; x < w; x++) {
          const y = midY + Math.sin((x / w) * cycles * Math.PI * 2 + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Cyan secondary wave (+4Hz binaural pulse)
        ctx.strokeStyle = 'rgba(0,240,255,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y = midY + Math.sin((x / w) * (cycles + 0.15) * Math.PI * 2 + phase * 0.9) * (amp * 0.7);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Live badge
        ctx.font = '8px "JetBrains Mono"';
        ctx.fillStyle = '#00F0FF';
        ctx.textAlign = 'right';
        ctx.fillText(`${carrierFreq}Hz`, w - 4, 10);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isMuted, volume, carrierFreq, isDark]);

  /* ==========================================================================
     CANVAS 1: WHITESPACE CYBERSPACE CONSTELLATION VISUALIZER
     ========================================================================== */
  const canvasRef = useRef(null);
  const rotRef = useRef({ x: 0.2, y: 0.4 });
  const zoomRef = useRef(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let autoAngle = 0;

    const render = () => {
      autoAngle += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Void Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(W, H) * 0.7);
      bgGrad.addColorStop(0, isDark ? '#0C0F1A' : '#F8FAFC');
      bgGrad.addColorStop(1, isDark ? '#06070B' : '#EDF2F7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle Cyberspace Grid Lines
      ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.06)' : 'rgba(184,134,11,0.08)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Orbital 3D Projection
      const cosA = Math.cos(autoAngle + rotRef.current.y);
      const sinA = Math.sin(autoAngle + rotRef.current.y);
      const cosB = Math.cos(rotRef.current.x);
      const sinB = Math.sin(rotRef.current.x);
      const zoom = zoomRef.current;

      const projected = filteredMemories.map((m) => {
        const x1 = m.x * cosA - m.z * sinA;
        const z1 = m.x * sinA + m.z * cosA;
        const y1 = m.y * cosB - z1 * sinB;
        const z2 = m.y * sinB + z1 * cosB;

        const distance = 260;
        const fov = distance / (distance + z2);
        const sx = cx + x1 * fov * 2.2 * zoom;
        const sy = cy + y1 * fov * 2.2 * zoom;

        return { ...m, sx, sy, fov, zIndex: z2 };
      });

      projected.sort((a, b) => b.zIndex - a.zIndex);

      // Synaptic Constellation Links
      ctx.lineWidth = 1.2;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.35;
            ctx.strokeStyle = isDark ? `rgba(212,175,55,${alpha})` : `rgba(184,134,11,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }
      }

      // Nodes
      projected.forEach((p) => {
        const isSelected = selectedMemory?.id === p.id;
        const baseColor = clusterColors[p.cluster] || '#D4AF37';
        const nodeRadius = Math.max(5, (p.weight * 9) * p.fov);

        if (isSelected) {
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, nodeRadius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '600 10px "JetBrains Mono"';
        ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B';
        ctx.fillText(p.id, p.sx + nodeRadius + 5, p.sy + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [filteredMemories, selectedMemory, isDark]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    let closest = null;
    let minDist = 40;
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;

    filteredMemories.forEach((m) => {
      const approxX = cx + m.x * 2.2;
      const approxY = cy + m.y * 2.2;
      const d = Math.hypot(clickX - approxX, clickY - approxY);
      if (d < minDist) {
        minDist = d;
        closest = m;
      }
    });

    if (closest) {
      setSelectedMemory(closest);
      transmitLucy(`Decoded node ${closest.id} [${closest.cluster}]. Weight w = ${closest.weight.toFixed(2)}.`);
    }
  };

  /* ==========================================================================
     CANVAS 2: STDP SYNAPTIC PLASTICITY CURVE PLOTTER
     ========================================================================== */
  const stdpCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = stdpCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#08080B' : '#F8FAFC';
    ctx.fillRect(0, 0, W, H);

    // Subtle background grid
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let x = 30; x <= W - 30; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, H - 20);
      ctx.stroke();
    }
    for (let y = 20; y <= H - 20; y += 35) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(W - 30, y);
      ctx.stroke();
    }

    // Main axes
    ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, cy);
    ctx.lineTo(W - 30, cy);
    ctx.moveTo(cx, 20);
    ctx.lineTo(cx, H - 20);
    ctx.stroke();

    // Labels
    ctx.font = '700 10.5px "JetBrains Mono"';
    ctx.fillStyle = isDark ? '#F472B6' : '#C2185B';
    ctx.fillText('–Δt (Post before Pre: LTD)', 38, cy - 10);
    ctx.fillStyle = isDark ? '#34D399' : '#047857';
    ctx.fillText('+Δt (Pre before Post: LTP)', W - 195, cy - 10);
    ctx.fillStyle = isDark ? '#D4AF37' : '#8A6A09';
    ctx.fillText('+Δw (Potentiation)', cx + 8, 32);
    ctx.fillText('–Δw (Depression)', cx + 8, H - 22);

    const scaleX = (W / 2 - 40) / 60;
    const scaleY = (H / 2 - 30);

    // LTD Shaded Region (Post-before-pre)
    ctx.fillStyle = isDark ? 'rgba(244,114,182,0.10)' : 'rgba(219,39,119,0.07)';
    ctx.beginPath();
    ctx.moveTo(cx + (-60) * scaleX, cy);
    for (let dt = -60; dt <= 0; dt += 0.5) {
      const dw = -stdpParams.aMinus * Math.exp(dt / stdpParams.tauMinus);
      const px = cx + dt * scaleX;
      const py = cy - dw * scaleY;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();

    // LTP Shaded Region (Pre-before-post)
    ctx.fillStyle = isDark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let dt = 0; dt <= 60; dt += 0.5) {
      const dw = stdpParams.aPlus * Math.exp(-dt / stdpParams.tauPlus);
      const px = cx + dt * scaleX;
      const py = cy - dw * scaleY;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(cx + 60 * scaleX, cy);
    ctx.closePath();
    ctx.fill();

    // Draw LTD Curve
    ctx.strokeStyle = isDark ? '#F472B6' : '#DB2777';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let dt = -60; dt <= 0; dt += 0.5) {
      const dw = -stdpParams.aMinus * Math.exp(dt / stdpParams.tauMinus);
      const px = cx + dt * scaleX;
      const py = cy - dw * scaleY;
      if (dt === -60) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw LTP Curve
    ctx.strokeStyle = isDark ? '#34D399' : '#059669';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let dt = 0; dt <= 60; dt += 0.5) {
      const dw = stdpParams.aPlus * Math.exp(-dt / stdpParams.tauPlus);
      const px = cx + dt * scaleX;
      const py = cy - dw * scaleY;
      if (dt === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Compute Active Test Point
    const testDt = stdpParams.testDt;
    const testDw = testDt >= 0
      ? stdpParams.aPlus * Math.exp(-testDt / stdpParams.tauPlus)
      : -stdpParams.aMinus * Math.exp(testDt / stdpParams.tauMinus);
    const testPx = cx + testDt * scaleX;
    const testPy = cy - testDw * scaleY;

    // Dashed guide lines to point
    ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.45)' : 'rgba(184,134,11,0.4)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(testPx, cy);
    ctx.lineTo(testPx, testPy);
    ctx.lineTo(cx, testPy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing halo around active point
    const isLtp = testDt >= 0;
    const pointColor = isLtp ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F472B6' : '#DB2777');

    ctx.fillStyle = pointColor;
    ctx.shadowColor = pointColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(testPx, testPy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = isDark ? '#08080B' : '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // If last spike fired recently, draw shockwave ripple
    if (lastSpikeFeedback && (Date.now() - lastSpikeFeedback.timestamp < 3500)) {
      ctx.strokeStyle = isLtp ? 'rgba(52,211,153,0.7)' : 'rgba(244,114,182,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(testPx, testPy, 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Coordinate telemetry tag
    ctx.font = 'bold 11px "JetBrains Mono"';
    ctx.fillStyle = isDark ? '#F5E6AB' : '#101828';
    const tagX = testPx > W - 140 ? testPx - 130 : testPx + 10;
    const tagY = testPy < 40 ? testPy + 20 : testPy - 10;
    ctx.fillText(`Δt=${testDt}ms, Δw=${testDw >= 0 ? '+' : ''}${testDw.toFixed(3)}`, tagX, tagY);
  }, [stdpParams, isDark, lastSpikeFeedback]);

  /* ==========================================================================
     CANVAS 3: ZERO-EGRESS INTERACTIVE 3D HOLOGRAPHIC CHAMBER (Offline Lucy)
     - Replaces external Sketchfab iframe to strictly preserve Zero-Egress invariant
     - Interactive 3D mouse orbit rotation (pitch, yaw)
     - Concentric Euler gimbal rings in gold (#D4AF37) and cyan (#00F0FF)
     - Ethereal local Lucy holographic projection
     ========================================================================== */
  const holoCanvasRef = useRef(null);
  const holoImgRef = useRef(null);
  const [holoOrbit, setHoloOrbit] = useState({ yaw: 0.35, pitch: 0.15 });
  const isDraggingHoloRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Pre-load local Lucy portrait offline
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = '/assets/lucy.png';
    img.onload = () => {
      holoImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = holoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let holoPulse = 0;

    const renderHolo = () => {
      holoPulse += 0.02;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2 + 10;

      ctx.clearRect(0, 0, W, H);

      // Deep void background
      ctx.fillStyle = '#08080B';
      ctx.fillRect(0, 0, W, H);

      // Perspective Cyberspace Ground Plane
      ctx.strokeStyle = 'rgba(212,175,55,0.12)';
      ctx.lineWidth = 1;
      const floorY = cy + 130;
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 24, floorY);
        ctx.lineTo(cx + i * 110, H);
        ctx.stroke();
      }
      for (let j = 0; j < 5; j++) {
        const py = floorY + Math.pow(j / 4, 1.8) * (H - floorY);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py);
        ctx.stroke();
      }

      // 3D Concentric Gimbal Rings in Gold and Cyan
      const yaw = holoOrbit.yaw;
      const pitch = holoOrbit.pitch;

      const draw3dRing = (radius, ringYaw, ringPitch, color, lineWidth = 1.5) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const rx = radius * Math.cos(theta);
          const rz = radius * Math.sin(theta);
          const ry = 0;

          // Rotate around X (pitch) then Y (yaw)
          const y1 = ry * Math.cos(ringPitch) - rz * Math.sin(ringPitch);
          const z1 = ry * Math.sin(ringPitch) + rz * Math.cos(ringPitch);
          const x2 = rx * Math.cos(ringYaw) - z1 * Math.sin(ringYaw);
          const z2 = rx * Math.sin(ringYaw) + z1 * Math.cos(ringYaw);

          const fov = 320 / (320 + z2);
          const sx = cx + x2 * fov;
          const sy = cy + y1 * fov;

          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      };

      // Outer Euler Gimbal Rings
      draw3dRing(170, yaw + holoPulse * 0.4, pitch + 0.3, 'rgba(212,175,55,0.45)', 2);
      draw3dRing(145, yaw - holoPulse * 0.6, pitch - 0.2, 'rgba(0,240,255,0.5)', 1.5);
      draw3dRing(120, yaw + holoPulse * 0.8, pitch + 0.5, 'rgba(244,114,182,0.4)', 1.2);

      // Central Holographic Light Pillar
      const beamGrad = ctx.createLinearGradient(0, cy - 140, 0, cy + 120);
      beamGrad.addColorStop(0, 'rgba(0,240,255,0)');
      beamGrad.addColorStop(0.3, 'rgba(0,240,255,0.06)');
      beamGrad.addColorStop(0.7, 'rgba(212,175,55,0.08)');
      beamGrad.addColorStop(1, 'rgba(212,175,55,0.25)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 110, 110, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Render Lucy Holographic Avatar
      if (holoImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.88 + Math.sin(holoPulse * 3) * 0.08;
        const imgW = 150;
        const imgH = 150;
        const imgX = cx - imgW / 2 + Math.sin(yaw) * 15;
        const imgY = cy - imgH / 2 - 20 + Math.sin(pitch) * 15;

        // Soft circular crop for hologram
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(holoImgRef.current, imgX, imgY, imgW, imgH);
        ctx.restore();

        // Holographic boundary ring
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 82, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Holographic Scanlines
      ctx.fillStyle = 'rgba(0,240,255,0.04)';
      for (let y = cy - 150; y < cy + 140; y += 4) {
        ctx.fillRect(cx - 160, y, 320, 1.5);
      }

      // Emitter Base Ring in Gold
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 120, 130, 22, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Telemetry HUD overlay
      ctx.font = '9px "JetBrains Mono"';
      ctx.fillStyle = '#00F0FF';
      ctx.textAlign = 'left';
      ctx.fillText('HOLOPROJECTOR // ZERO-EGRESS AIR-GAPPED', 18, 25);
      ctx.fillStyle = '#D4AF37';
      ctx.fillText(`CARRIER RESONANCE: ${carrierFreq}Hz ${isMuted ? '[MUTED]' : '[ACTIVE]'}`, 18, 40);
      ctx.fillText(`ORBIT: YAW ${(yaw * 57.3).toFixed(1)}° · PITCH ${(pitch * 57.3).toFixed(1)}°`, 18, 55);

      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'right';
      ctx.fillText('INTERACTIVE 3D ORBIT · DRAG WITH MOUSE', W - 18, 25);

      animId = requestAnimationFrame(renderHolo);
    };

    renderHolo();
    return () => cancelAnimationFrame(animId);
  }, [holoOrbit, carrierFreq, isMuted]);

  // Holographic 3D mouse interaction
  const handleHoloMouseDown = (e) => {
    isDraggingHoloRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleHoloMouseMove = (e) => {
    if (!isDraggingHoloRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setHoloOrbit((prev) => ({
      yaw: prev.yaw + dx * 0.008,
      pitch: Math.max(-0.6, Math.min(0.6, prev.pitch + dy * 0.008)),
    }));
  };

  const handleHoloMouseUp = () => {
    isDraggingHoloRef.current = false;
  };

  return (
    <>
      {!introDone && (
        <CinematicIntro
          words={["STDP", "NEURAL", "MEMORY"]}
          themeColor="gold"
          subtitle="BIOMORPHIC STDP SYNAPSE MATRIX"
          onComplete={() => setIntroDone(true)}
        />
      )}
      <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 3, md: 5 }, position: 'relative' }}>
      {/* Background Radial Glow */}
      <ParallaxGlow offset={60}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '100%', md: '940px' },
            height: { xs: 400, md: 520 },
            pointerEvents: 'none',
            zIndex: 0,
            background: isDark
              ? 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.18) 0%, rgba(244,114,182,0.08) 45%, transparent 75%)'
              : 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,55,0.10) 0%, rgba(244,114,182,0.05) 45%, transparent 75%)',
          }}
        />
      </ParallaxGlow>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header / Lucy Oracle Status Bar */}
        <HeroReveal>
          <Box sx={{ mb: 3 }}>
            <HeroItem>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/assets/lucy.png"
                alt="Lucy Oracle Avatar"
                onError={(e) => { e.target.src = '/brand/ghostbyte-dark.png'; }}
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #F472B6',
                  boxShadow: '0 0 16px rgba(244,114,182,0.4)',
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="overline" sx={{ color: isDark ? '#F472B6' : '#BE185D', fontWeight: 800, letterSpacing: '0.14em' }}>
                    LUCY // DEEP-DIVE NETRUNNER ORACLE
                  </Typography>
                  <Chip
                    label="SEMANTIC BUS :8094 // COGNITIVE ORACLE"
                    size="small"
                    sx={{ bgcolor: isDark ? 'rgba(244,114,182,0.15)' : '#FDF2F8', color: isDark ? '#F472B6' : '#BE185D', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                  <Chip
                    label="ZERO-EGRESS INVARIANT"
                    size="small"
                    sx={{ bgcolor: isDark ? 'rgba(0,240,255,0.12)' : '#E0F2FE', color: isDark ? '#00F0FF' : '#0284C7', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                </Box>
                <Typography variant="h3" sx={{ fontFamily: '"Celtic Garamond", Georgia, serif', lineHeight: 1.15 }}>
                  Netrunner Memory Hub
                </Typography>
              </Box>
            </Box>

            {/* Header Action Strip */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Export Lucy Neural Snapshot Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => setIsExportDialogOpen(true)}
                sx={{
                  borderColor: gold.accent,
                  color: gold.accent,
                  fontWeight: 750,
                  bgcolor: 'rgba(212,175,55,0.08)',
                  '&:hover': { bgcolor: 'rgba(212,175,55,0.18)', borderColor: gold.accent },
                }}
              >
                Export Lucy Neural Snapshot
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={isVoiceMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                onClick={() => {
                  const next = !isVoiceMuted;
                  setIsVoiceMuted(next);
                  if (!next) speakLucyLine("Lucy voice synthesis online.");
                }}
                sx={{
                  borderColor: isVoiceMuted ? theme.palette.divider : '#F472B6',
                  color: isVoiceMuted ? theme.palette.text.secondary : '#F472B6',
                  fontWeight: 750,
                }}
              >
                {isVoiceMuted ? 'Voice Muted' : 'Voice Active'}
              </Button>

              <Chip
                label={daemonUp ? 'DAEMON ONLINE :8094' : 'LOCAL ENCLAVE CACHE'}
                size="small"
                sx={{
                  bgcolor: daemonUp ? 'rgba(52,211,153,0.15)' : gold.wash,
                  color: daemonUp ? '#34D399' : gold.accent,
                  fontWeight: 800,
                }}
              />
            </Box>
            </Box>
            </HeroItem>

            <HeroItem>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 880, fontSize: '1.02rem', lineHeight: 1.6 }}>
                The sovereign memory matrix with Lucy's deep-net breach oracle and serene whitespace neural constellation. Long-term memory is calibrated with biological <span className="text-highlight-gold">Spike-Timing-Dependent Plasticity (STDP)</span> weight decay, zero cloud exfiltration, and local SQLite persistence.
              </Typography>
            </HeroItem>
          </Box>
        </HeroReveal>

        {/* ==========================================================================
           BIOMORPHIC FREQUENCY CARRIER WAVE TONE GENERATOR BAR (HOUSE RULE #1)
           ========================================================================== */}
        <RevealOnScroll preset="fadeUp" delay={0.1}>
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            border: `1px solid ${isMuted ? (isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider) : gold.accent}`,
            borderRadius: 2.5,
            bgcolor: isDark ? '#08080B' : theme.palette.background.paper,
            boxShadow: isMuted ? 'none' : (isDark ? '0 0 24px rgba(212,175,55,0.18)' : '0 4px 16px rgba(184,134,11,0.12)'),
          }}
        >
          {/* Row 1: Tone Controls with ample breathing room */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant={isMuted ? 'outlined' : 'contained'}
                size="small"
                startIcon={isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                onClick={handleToggleMute}
                sx={{
                  bgcolor: isMuted ? 'transparent' : gold.accent,
                  color: isMuted ? theme.palette.text.secondary : '#08080B',
                  borderColor: isMuted ? (isDark ? 'rgba(212,175,55,0.4)' : theme.palette.divider) : gold.accent,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  px: 2,
                  py: 0.75,
                  '&:hover': {
                    bgcolor: isMuted ? (isDark ? 'rgba(212,175,55,0.1)' : '#FEF9E7') : gold.accent,
                  },
                }}
              >
                {isMuted ? 'Carrier Muted' : 'Carrier Active'}
              </Button>

              <Box>
                <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block' }}>
                  COGNITIVE CARRIER ENGINE
                </Typography>
                <Typography variant="caption" sx={{ color: isMuted ? 'text.secondary' : (isDark ? '#00F0FF' : '#0284C7'), fontFamily: mono, fontSize: '0.75rem', fontWeight: 600 }}>
                  {isMuted ? 'Audio Inactive (Sound Muted by Default)' : `${carrierFreq}Hz Harmonic Continuous Tone`}
                </Typography>
              </Box>
            </Box>

            {/* Carrier Frequency Selectors */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', mr: 0.5, fontWeight: 700 }}>
                MODE:
              </Typography>
              <Chip
                label="432Hz Alpha (Calm)"
                size="small"
                clickable
                onClick={() => handleFrequencyChange(432)}
                sx={{
                  fontFamily: mono,
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  bgcolor: carrierFreq === 432 ? gold.accent : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                  color: carrierFreq === 432 ? '#08080B' : theme.palette.text.primary,
                  border: `1px solid ${carrierFreq === 432 ? gold.accent : (isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider)}`,
                }}
              />
              <Chip
                label="528Hz Theta (Synaptic)"
                size="small"
                clickable
                onClick={() => handleFrequencyChange(528)}
                sx={{
                  fontFamily: mono,
                  fontWeight: 750,
                  fontSize: '0.75rem',
                  bgcolor: carrierFreq === 528 ? (isDark ? '#00F0FF' : '#0284C7') : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                  color: carrierFreq === 528 ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
                  border: `1px solid ${carrierFreq === 528 ? (isDark ? '#00F0FF' : '#0284C7') : (isDark ? 'rgba(0,240,255,0.2)' : theme.palette.divider)}`,
                }}
              />
              <Tooltip title={carrierFreq === 432 ? "432Hz Alpha: Mental balance and sovereign stillness." : "528Hz Theta: Deep netrunner drift and rapid synaptic plasticity."}>
                <GraphicEqIcon sx={{ color: gold.accent, fontSize: '1.2rem', cursor: 'pointer', ml: 0.5 }} />
              </Tooltip>
            </Box>

            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: { xs: '100%', sm: 180 } }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.75rem', minWidth: 32 }}>
                VOL {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </Typography>
              <Slider
                size="small"
                value={isMuted ? 0 : Math.round(volume * 100)}
                min={0}
                max={100}
                disabled={isMuted}
                onChange={(e, val) => handleVolumeChange(val / 100)}
                sx={{
                  color: gold.accent,
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Row 2: Live Full-Width Carrier Wave Oscilloscope (Spacious, Never Squished) */}
          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`,
              bgcolor: isDark ? '#040508' : '#0F172A',
              p: 1.5,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ flexShrink: 0, minWidth: 160 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block' }}>
                WAVEFORM TELEMETRY
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#CBD5E1', fontSize: '0.72rem' }}>
                {isMuted ? 'Standby (Muted)' : `Active Harmonic: ${carrierFreq}Hz Resonant Mode`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, width: '100%', height: 48, borderRadius: 1.5, overflow: 'hidden' }}>
              <canvas ref={carrierCanvasRef} width={800} height={48} style={{ width: '100%', height: '100%', display: 'block' }} />
            </Box>
          </Box>
        </Paper>
        </RevealOnScroll>

        <DaemonStatusStrip />

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': { fontWeight: 750, minHeight: 48, fontSize: '0.9rem' },
              '& .Mui-selected': { color: '#D4AF37' },
              '& .MuiTabs-indicator': { bgcolor: '#D4AF37' },
            }}
          >
            <Tab icon={<PsychologyIcon fontSize="small" />} iconPosition="start" label="Whitespace Cyberspace" />
            <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="STDP Synaptic Lab" />
            <Tab icon={<StorageIcon fontSize="small" />} iconPosition="start" label={`Memory Stratum (${memories.length})`} />
            <Tab icon={<ViewInArIcon fontSize="small" />} iconPosition="start" label="Lucy 3D Oracle Chamber" />
          </Tabs>
        </Paper>

        {/* ==========================================================================
           TAB 0: WHITESPACE CYBERSPACE (FLAGSHIP LUCY EXPERIENCE)
           ========================================================================== */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              {/* Left Column: Cyberspace Canvas Constellation & Codec */}
              <Grid xs={12} lg={8}>
                <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: isDark ? '#08080B' : theme.palette.background.paper, mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['All', 'Kernel', 'Lucy Oracle', 'Consensus', 'Security', 'Vault', 'Pantheon'].map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          size="small"
                          clickable
                          onClick={() => setActiveCluster(c)}
                          sx={{
                            fontWeight: 750,
                            bgcolor: activeCluster === c ? (clusterColors[c] || gold.accent) : (isDark ? 'transparent' : '#F1F5F9'),
                            color: activeCluster === c ? '#08080B' : theme.palette.text.primary,
                            border: `1px solid ${activeCluster === c ? (clusterColors[c] || gold.accent) : theme.palette.divider}`,
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#00F0FF' : '#0284C7', fontWeight: 700 }}>
                      ◈ WHITESPACE: {filteredMemories.length} NODES
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                    <Netrunner3DWorld
                      memories={filteredMemories}
                      selectedMemory={selectedMemory}
                      onSelectMemory={(m) => {
                        setSelectedMemory(m);
                        playSynapticPulse(m.weight);
                      }}
                      isDark={isDark}
                      height={460}
                    />
                  </Box>
                </Paper>

                {/* Episodic Memory Node Synthesis Engine (HOUSE RULE #2) */}
                <Paper
                  sx={{
                    p: 2.5,
                    border: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: isDark ? '#08080B' : theme.palette.background.paper,
                    mb: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon sx={{ color: gold.accent, fontSize: '1.4rem' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, fontFamily: mono }}>
                        WHY NEUROMORPHIC STDP MEMORY REQUIRES A LOCAL ENCLAVE
                      </Typography>
                    </Box>
                    <Chip
                      label="ZERO CLOUD EGRESS INVARIANT"
                      size="small"
                      sx={{ bgcolor: gold.wash, color: gold.soft, fontFamily: mono, fontSize: '0.72rem', fontWeight: 800 }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.65 }}>
                    Biological Spike-Timing-Dependent Plasticity (STDP) requires sub-millisecond weight updates across millions of synaptic connections. Transmitting memory queries or continuous thought vectors to third-party cloud APIs leaks proprietary system prompts, exposes codebase topologies, and introduces crippling latency. Zoth Memory operates strictly on your physical machine via local loopback.
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ p: 1.5, height: '100%', bgcolor: isDark ? '#05070E' : '#F8FAFC', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDark ? gold.soft : '#8A6A09', mb: 0.5, fontSize: '0.8rem' }}>
                          ⚡ Microsecond Latency
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block' }}>
                          Local SQLite vector indices on <code>127.0.0.1:8094</code> deliver 0.4ms cosine similarity lookup without WAN roundtrips.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ p: 1.5, height: '100%', bgcolor: isDark ? '#05070E' : '#F8FAFC', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', mb: 0.5, fontSize: '0.8rem' }}>
                          🛡️ Zero-Knowledge Recall
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block' }}>
                          Embeddings are stored in hardware-encrypted local enclaves. Your agent thoughts never leave your physical storage.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ p: 1.5, height: '100%', bgcolor: isDark ? '#05070E' : '#F8FAFC', border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', mb: 0.5, fontSize: '0.8rem' }}>
                          🧠 STDP Synaptic Pruning
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block' }}>
                          Autonomous Long-Term Potentiation (LTP) and Depression (LTD) continuously reinforce critical insights and prune noise.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Local Funnel Strip */}
                  <Box sx={{ p: 2, bgcolor: isDark ? '#04050A' : '#F1F5F9', border: `1px solid ${gold.border}`, borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, display: 'block', mb: 0.8 }}>
                      RUN NEURO-MEMORY-DAEMON LOCALLY (MICRO-REPO):
                    </Typography>
                    <Box sx={{ p: 1, mb: 1.5, bgcolor: isDark ? '#000000' : '#FFFFFF', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', color: isDark ? '#38BDF8' : '#0284C7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        git clone https://github.com/NullAITech/neuro-memory-daemon.git &amp;&amp; cd neuro-memory-daemon &amp;&amp; python3 src/daemon.py --port 8094
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText('git clone https://github.com/NullAITech/neuro-memory-daemon.git && cd neuro-memory-daemon && python3 src/daemon.py --port 8094');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        sx={{ color: gold.accent, ml: 1, p: 0.5 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.85rem' }} />
                      </IconButton>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        href="https://github.com/NullAITech/neuro-memory-daemon"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ bgcolor: gold.accent, color: '#08080B', fontWeight: 800, fontSize: '0.74rem', textTransform: 'none', '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' } }}
                      >
                        Open Daemon GitHub Repo
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        component={RouterLink}
                        to="/tools/vector-search-engine"
                        sx={{ borderColor: gold.border, color: gold.soft, fontWeight: 800, fontSize: '0.74rem', textTransform: 'none', '&:hover': { borderColor: gold.accent, bgcolor: gold.wash } }}
                      >
                        Inspect Vector Search Engine
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        component={RouterLink}
                        to="/zoth-os"
                        sx={{ borderColor: isDark ? '#38BDF8' : '#0284C7', color: isDark ? '#38BDF8' : '#0284C7', fontWeight: 800, fontSize: '0.74rem', textTransform: 'none' }}
                      >
                        Boot via Zoth OS
                      </Button>
                    </Stack>
                  </Box>
                </Paper>

                {/* Lucy Codec Terminal */}
                <Paper sx={{ p: 2.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: isDark ? '#08080B' : theme.palette.background.paper }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerminalIcon sx={{ color: '#F472B6', fontSize: '1.2rem' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F472B6', fontFamily: mono }}>
                        LUCY ORACLE TRANSMISSION // SEMANTIC BUS :8094
                      </Typography>
                    </Box>
                    <Chip label="Zero Egress Enclave" size="small" sx={{ bgcolor: 'rgba(0,240,255,0.1)', color: isDark ? '#00F0FF' : '#0284C7', fontWeight: 700 }} />
                  </Box>

                  <Paper sx={{ p: 2, bgcolor: '#050508', color: '#F5E6AB', fontFamily: mono, fontSize: '0.82rem', height: 140, overflowY: 'auto', mb: 2, borderRadius: 1.5, border: '1px solid rgba(244,114,182,0.25)' }}>
                    {codecLogs.map((log, index) => (
                      <Box key={index} sx={{ mb: 0.75, lineHeight: 1.45 }}>
                        <span style={{ color: log.speaker.includes('LUCY') ? '#F472B6' : log.speaker.includes('OPERATOR') ? '#00F0FF' : '#34D399', fontWeight: 700 }}>
                          [{log.time}] {log.speaker}:
                        </span>{' '}
                        <span>{log.text}</span>
                      </Box>
                    ))}
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Prompt Lucy or ask for vector analysis..."
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleConsultLucy(); }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontFamily: mono,
                          fontSize: '0.85rem',
                          bgcolor: isDark ? '#0A0C14' : '#F8FAFC',
                          color: theme.palette.text.primary,
                          border: `1px solid ${isDark ? 'rgba(244,114,182,0.25)' : theme.palette.divider}`
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleConsultLucy}
                      endIcon={<SendIcon />}
                      sx={{ bgcolor: '#F472B6', color: '#08080B', fontWeight: 800, px: 2.5, '&:hover': { bgcolor: isDark ? '#F687B3' : '#EC4899' } }}
                    >
                      Transmit
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Column: Selected Node Inspector & Cyberware Specs */}
              <Grid xs={12} lg={4}>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.background.paper, mb: 3 }}>
                  <Typography variant="overline" sx={{ color: gold.accent, fontWeight: 800, letterSpacing: '0.12em' }}>
                    VECTOR NODE INSPECTOR
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {selectedMemory ? `${selectedMemory.id} · ${selectedMemory.cluster}` : 'Select a Node'}
                  </Typography>

                  {selectedMemory && (
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.85rem' }}>
                          <span>Synaptic Weight (w)</span>
                          <strong style={{ color: gold.accent }}>{selectedMemory.weight.toFixed(3)}</strong>
                        </Box>
                        <LinearProgress variant="determinate" value={selectedMemory.weight * 100} sx={{ height: 8, borderRadius: 1 }} />
                      </Box>

                      <Paper sx={{
                        p: 2,
                        bgcolor: isDark ? '#08080B' : '#F8FAFC',
                        color: theme.palette.text.primary,
                        fontFamily: mono,
                        fontSize: '0.85rem',
                        borderRadius: 1.5,
                        border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}`
                      }}>
                        {selectedMemory.text}
                      </Paper>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`Author: ${selectedMemory.author}`} size="small" variant="outlined" />
                        <Chip label={`Cluster: ${selectedMemory.cluster}`} size="small" sx={{ bgcolor: clusterColors[selectedMemory.cluster] + '22', color: clusterColors[selectedMemory.cluster], fontWeight: 700 }} />
                        <Chip label={`Coord: (${selectedMemory.x}, ${selectedMemory.y}, ${selectedMemory.z})`} size="small" sx={{ fontFamily: mono, bgcolor: 'rgba(212,175,55,0.1)', color: gold.accent }} />
                        {selectedMemory.tags.map((t) => (
                          <Chip key={t} label={`#${t}`} size="small" />
                        ))}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Button
                        variant="contained"
                        startIcon={<AutoFixHighIcon />}
                        onClick={handleConsultLucy}
                        sx={{ bgcolor: gold.accent, color: '#08080B', fontWeight: 800, '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' } }}
                      >
                        Consult Lucy on Vector
                      </Button>
                    </Stack>
                  )}
                </Paper>

                {/* Netrunner Cyberdeck Specs */}
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
                  <Typography variant="overline" sx={{ color: isDark ? '#00F0FF' : '#0284C7', fontWeight: 800, letterSpacing: '0.12em' }}>
                    COGNITIVE SPECS
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                    Lucy Cognitive Architecture
                  </Typography>

                  <Stack spacing={1.5} sx={{ fontSize: '0.85rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Neural Interface:</span>
                      <strong>Biomorphic Synaptic Bridge</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Vector Engine:</span>
                      <strong>Whitespace STDP Matrix</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Carrier Frequency:</span>
                      <strong style={{ color: gold.accent }}>{carrierFreq}Hz ({carrierFreq === 432 ? 'Alpha' : 'Theta'})</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Buffer Retention:</span>
                      <strong>Zero-Egress SQLite</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Neural Sync:</span>
                      <strong style={{ color: isDark ? '#34D399' : '#059669' }}>99.8% Nominal</strong>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ==========================================================================
           TAB 1: STDP SYNAPTIC LAB (DEEPENED INTERACTIVE BIOMORPHIC ENGINE)
           ========================================================================== */}
        {activeTab === 1 && (
          <Box>
            {/* Live Synaptic Spike Feedback Banner */}
            {lastSpikeFeedback && (
              <Alert
                severity={lastSpikeFeedback.type === 'LTP' ? 'success' : 'warning'}
                icon={lastSpikeFeedback.type === 'LTP' ? <AutoFixHighIcon sx={{ color: isDark ? '#34D399' : '#059669' }} /> : <TuneIcon sx={{ color: isDark ? '#F472B6' : '#DB2777' }} />}
                sx={{
                  mb: 3,
                  bgcolor: lastSpikeFeedback.type === 'LTP' ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5') : (isDark ? 'rgba(244,114,182,0.12)' : '#FFF1F2'),
                  border: `1px solid ${lastSpikeFeedback.type === 'LTP' ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F472B6' : '#DB2777')}`,
                  color: theme.palette.text.primary,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    ⚡ {lastSpikeFeedback.description}
                  </Typography>
                  <Chip
                    label={`AVERAGE WEIGHT: ${(memories.reduce((a, b) => a + b.weight, 0) / memories.length).toFixed(3)}w`}
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontWeight: 800,
                      bgcolor: lastSpikeFeedback.type === 'LTP' ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F472B6' : '#DB2777'),
                      color: '#08080B',
                    }}
                  />
                </Box>
              </Alert>
            )}

            {/* Dual STDP Mathematical Pillars (Equations with Light/Dark Theme Contrast) */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {/* Pillar 1: Long-Term Potentiation (LTP) */}
              <Grid xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: isDark ? '#08080B' : '#F8FAFC',
                    border: `1.5px solid ${stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#059669') : (isDark ? 'rgba(52,211,153,0.25)' : '#D1FAE5')}`,
                    boxShadow: stdpParams.testDt >= 0 ? (isDark ? '0 0 18px rgba(52,211,153,0.25)' : '0 2px 10px rgba(5,150,105,0.15)') : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon sx={{ color: isDark ? '#34D399' : '#059669' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#34D399' : '#047857' }}>
                        Long-Term Potentiation (LTP)
                      </Typography>
                    </Box>
                    <Chip
                      label={stdpParams.testDt >= 0 ? 'ACTIVE ZONE (Δt > 0)' : 'INACTIVE'}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: stdpParams.testDt >= 0 ? (isDark ? 'rgba(52,211,153,0.2)' : '#D1FAE5') : (isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'),
                        color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#047857') : 'text.disabled',
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 1.2, mb: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#040508' : '#FFFFFF', border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : '#A7F3D0'}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.86rem', fontWeight: 800, color: isDark ? '#34D399' : '#047857', textAlign: 'center' }}>
                      Δw = A₊ · e^(–Δt / τ₊)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <strong>Causal Spike Timing:</strong> Pre-synaptic neuron spikes <em>before</em> post-synaptic neuron within the critical temporal window ($\Delta t &gt; 0$), triggering calcium influx and synaptic conductance reinforcement.
                  </Typography>
                </Paper>
              </Grid>

              {/* Pillar 2: Long-Term Depression (LTD) */}
              <Grid xs={12} md={6}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: isDark ? '#08080B' : '#F8FAFC',
                    border: `1.5px solid ${stdpParams.testDt < 0 ? (isDark ? '#F472B6' : '#DB2777') : (isDark ? 'rgba(244,114,182,0.25)' : '#FCE7F3')}`,
                    boxShadow: stdpParams.testDt < 0 ? (isDark ? '0 0 18px rgba(244,114,182,0.25)' : '0 2px 10px rgba(219,39,119,0.15)') : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon sx={{ color: isDark ? '#F472B6' : '#DB2777' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#F472B6' : '#BE185D' }}>
                        Long-Term Depression (LTD)
                      </Typography>
                    </Box>
                    <Chip
                      label={stdpParams.testDt < 0 ? 'ACTIVE ZONE (Δt < 0)' : 'INACTIVE'}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: stdpParams.testDt < 0 ? (isDark ? 'rgba(244,114,182,0.2)' : '#FCE7F3') : (isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'),
                        color: stdpParams.testDt < 0 ? (isDark ? '#F472B6' : '#BE185D') : 'text.disabled',
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 1.2, mb: 1.5, borderRadius: 1.5, bgcolor: isDark ? '#040508' : '#FFFFFF', border: `1px solid ${isDark ? 'rgba(244,114,182,0.3)' : '#FBCFE8'}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.86rem', fontWeight: 800, color: isDark ? '#F472B6' : '#BE185D', textAlign: 'center' }}>
                      Δw = –A₋ · e^(+Δt / τ₋)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <strong>Anti-Causal Spike Timing:</strong> Post-synaptic neuron spikes <em>before</em> pre-synaptic neuron ($\Delta t &lt; 0$), inducing sub-threshold biological decay and pruning uninformative connections.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Main Interactive STDP Curve Visualizer & Synaptic Controller */}
            <Grid container spacing={3}>
              <Grid xs={12} lg={7}>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, bgcolor: theme.palette.background.paper, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Biomorphic Synaptic Plasticity Curve</Typography>
                    <Chip
                      label={stdpParams.testDt >= 0 ? `LTP REINFORCEMENT: +${(stdpParams.aPlus * Math.exp(-stdpParams.testDt / stdpParams.tauPlus)).toFixed(3)}Δw` : `LTD PRUNING: -${(stdpParams.aMinus * Math.exp(stdpParams.testDt / stdpParams.tauMinus)).toFixed(3)}Δw`}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        bgcolor: stdpParams.testDt >= 0 ? (isDark ? 'rgba(52,211,153,0.15)' : '#DCFCE7') : (isDark ? 'rgba(244,114,182,0.15)' : '#FFE4E6'),
                        color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F472B6' : '#DB2777'),
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Interactive visualizer of the biomorphic STDP function. Drag the Δt delta slider below to explore the exponential potentiation vs depression phases.
                  </Typography>

                  <Box sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`, mb: 2 }}>
                    <canvas ref={stdpCanvasRef} width={620} height={320} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </Box>

                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, display: 'block', textAlign: 'center', fontWeight: 700 }}>
                    Δw = A₊ · e^(–Δt/τ₊) (Δt ≥ 0) ··· Δw = –A₋ · e^(Δt/τ₋) (Δt &lt; 0)
                  </Typography>
                </Paper>
              </Grid>

              <Grid xs={12} lg={5}>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, bgcolor: theme.palette.background.paper, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: gold.accent }}>
                    Synaptic Parameters & Spike Firing
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Tune biomorphic decay parameters, simulate synaptic firing, and inspect weight distribution shifts.
                  </Typography>

                  {/* STDP Time-Difference Delta Slider (HOUSE RULE #1 / TASK 1 DEEPENING) */}
                  <Box sx={{ p: 2, mb: 2.5, bgcolor: isDark ? '#08080B' : '#F8FAFC', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: mono, color: gold.accent }}>
                        TEST SPIKE TIMING Δt
                      </Typography>
                      <Chip
                        label={`${stdpParams.testDt > 0 ? '+' : ''}${stdpParams.testDt} ms (${stdpParams.testDt >= 0 ? 'LTP' : 'LTD'})`}
                        size="small"
                        sx={{
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          bgcolor: stdpParams.testDt >= 0 ? (isDark ? 'rgba(52,211,153,0.18)' : '#DCFCE7') : (isDark ? 'rgba(244,114,182,0.18)' : '#FFE4E6'),
                          color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F472B6' : '#DB2777'),
                        }}
                      />
                    </Box>
                    <Slider
                      min={-40}
                      max={40}
                      step={1}
                      value={stdpParams.testDt}
                      onChange={(e, v) => setStdpParams({ ...stdpParams, testDt: v })}
                      sx={{
                        color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F472B6' : '#DB2777'),
                        '& .MuiSlider-thumb': {
                          boxShadow: `0 0 10px ${stdpParams.testDt >= 0 ? '#34D399' : '#F472B6'}`,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem', mt: 0.5 }}>
                      {stdpParams.testDt >= 0
                        ? `Pre-synaptic fires ${stdpParams.testDt}ms before post-synaptic → Positive potentiation.`
                        : `Post-synaptic fires ${Math.abs(stdpParams.testDt)}ms before pre-synaptic → Anti-causal depression.`}
                    </Typography>
                  </Box>

                  {/* Amplitude & Time Constants */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 750 }}>
                        Potentiation Amplitude A₊
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? '#34D399' : '#059669' }}>
                        {stdpParams.aPlus.toFixed(2)}
                      </Typography>
                    </Box>
                    <Slider
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={stdpParams.aPlus}
                      onChange={(e, v) => setStdpParams({ ...stdpParams, aPlus: v })}
                      sx={{ color: isDark ? '#34D399' : '#059669' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 750 }}>
                        Depression Amplitude A₋
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? '#F472B6' : '#DB2777' }}>
                        {stdpParams.aMinus.toFixed(2)}
                      </Typography>
                    </Box>
                    <Slider
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={stdpParams.aMinus}
                      onChange={(e, v) => setStdpParams({ ...stdpParams, aMinus: v })}
                      sx={{ color: isDark ? '#F472B6' : '#DB2777' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 750 }}>
                        Time Constant τ₊ / τ₋ (Half-life)
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: gold.accent }}>
                        {stdpParams.tauPlus} ms
                      </Typography>
                    </Box>
                    <Slider
                      min={5}
                      max={50}
                      step={1}
                      value={stdpParams.tauPlus}
                      onChange={(e, v) => setStdpParams({ ...stdpParams, tauPlus: v, tauMinus: v })}
                      sx={{ color: gold.accent }}
                    />
                  </Box>

                  {/* Interactive Synaptic Firing Triggers (Immediate Visual & Audio Feedback) */}
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontFamily: mono, fontWeight: 800 }}>
                    EXECUTE SYNAPTIC DISCHARGE:
                  </Typography>

                  <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={() => handleFireSynapticSpike(15)}
                        sx={{
                          borderColor: isDark ? '#34D399' : '#059669',
                          color: isDark ? '#34D399' : '#059669',
                          fontWeight: 800,
                          bgcolor: isDark ? 'rgba(52,211,153,0.08)' : '#ECFDF5',
                          '&:hover': { bgcolor: isDark ? 'rgba(52,211,153,0.18)' : '#D1FAE5' },
                        }}
                      >
                        ⚡ Fire LTP (+15ms)
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        onClick={() => handleFireSynapticSpike(-15)}
                        sx={{
                          borderColor: isDark ? '#F472B6' : '#DB2777',
                          color: isDark ? '#F472B6' : '#DB2777',
                          fontWeight: 800,
                          bgcolor: isDark ? 'rgba(244,114,182,0.08)' : '#FFF1F2',
                          '&:hover': { bgcolor: isDark ? 'rgba(244,114,182,0.18)' : '#FCE7F3' },
                        }}
                      >
                        ❄️ Fire LTD (-15ms)
                      </Button>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleFireSynapticSpike()}
                      sx={{
                        bgcolor: gold.accent,
                        color: '#08080B',
                        fontWeight: 850,
                        py: 1.1,
                        boxShadow: `0 0 16px -2px ${gold.accent}`,
                        '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' },
                      }}
                    >
                      🎯 Discharge Synaptic Impulse (Δt = {stdpParams.testDt > 0 ? `+${stdpParams.testDt}` : stdpParams.testDt}ms)
                    </Button>
                  </Stack>

                  {/* Quick Export Calibrated Weights */}
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadSnapshotFile}
                    sx={{
                      borderColor: gold.accent,
                      color: gold.accent,
                      fontWeight: 750,
                      '&:hover': { bgcolor: gold.wash },
                    }}
                  >
                    Export Calibrated Snapshot (.json)
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ==========================================================================
           TAB 2: SOVEREIGN MEMORY STRATUM (DATABASE & EPISODIC INGESTION)
           ========================================================================== */}
        {activeTab === 2 && (
          <Box>
            {/* Architectural Rationale & Local Ingestion Dossier */}
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                border: `1px solid ${gold.border}`,
                borderRadius: 2.5,
                bgcolor: isDark ? '#08080B' : '#FFFFFF',
                mb: 4,
                boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6)' : '0 4px 16px rgba(184,134,11,0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PsychologyIcon sx={{ color: gold.accent }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Why Autonomous Memory Must Run in a Local Hardware Enclave
                  </Typography>
                </Box>
                <Chip
                  label="ZERO CLOUD EGRESS INVARIANT"
                  size="small"
                  sx={{
                    fontFamily: mono,
                    bgcolor: isDark ? 'rgba(34,197,94,0.15)' : '#DCFCE7',
                    color: '#22C55E',
                    border: '1px solid rgba(34,197,94,0.3)',
                    fontWeight: 800,
                  }}
                />
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                Cloud vector databases (Pinecone, Weaviate, remote Qdrant) represent a catastrophic security failure for sovereign AI agents: every proprietary AST node, cryptographic seed, and system observation is streamed in plaintext across the public internet. Furthermore, remote network latency (150–600ms) starves autonomous multi-agent loops that require sub-millisecond synaptic recall.
              </Typography>

              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 2.5,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: isDark ? '#0D0D12' : '#F8FAFC',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold.accent, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon fontSize="small" /> Ring-0 Local Vector Index
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.86rem' }}>
                      Embeddings are indexed directly on physical NVMe using local SIMD cosine distance (AVX-512 / Apple AMX). Zero bytes leave loopback <code>127.0.0.1:8094</code>.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 2.5,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: isDark ? '#0D0D12' : '#F8FAFC',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GraphicEqIcon fontSize="small" /> Biomorphic STDP Plasticity
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.86rem' }}>
                      Unlike static RAG that suffers from context poisoning, the local daemon exponentially decays ephemeral noise while reinforcing proven architectural breakthroughs.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 2.5,
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: isDark ? '#0D0D12' : '#F8FAFC',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#00F0FF', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TerminalIcon fontSize="small" /> Universal MCP Protocol
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.86rem' }}>
                      Native JSON-RPC stdio daemon exposes <code>memory_store</code>, <code>memory_recall</code>, and <code>memory_decay</code> to Claude Code, Hermes Agent, OpenCode, and Codex.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Local Execution Quick-Copy Strip */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? '#040406' : '#F1F5F9',
                  border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <TerminalIcon sx={{ color: gold.accent, fontSize: 20 }} />
                  <Typography
                    sx={{
                      fontFamily: mono,
                      fontSize: { xs: '0.78rem', sm: '0.86rem' },
                      color: isDark ? '#E2E8F0' : '#1E293B',
                      wordBreak: 'break-all',
                    }}
                  >
                    git clone https://github.com/NullAITech/neuro-memory-daemon.git &amp;&amp; cd neuro-memory-daemon &amp;&amp; python3 src/daemon.py --port 8094
                  </Typography>
                </Box>
                <Tooltip title={copiedTab2 ? 'Copied command!' : 'Copy to clipboard'}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (navigator?.clipboard?.writeText) {
                        navigator.clipboard.writeText('git clone https://github.com/NullAITech/neuro-memory-daemon.git && cd neuro-memory-daemon && python3 src/daemon.py --port 8094');
                        setCopiedTab2(true);
                        setTimeout(() => setCopiedTab2(false), 2000);
                      }
                    }}
                    startIcon={copiedTab2 ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderColor: gold.border,
                      color: gold.soft,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copiedTab2 ? 'Copied' : 'Copy CLI Command'}
                  </Button>
                </Tooltip>
              </Box>

              {/* Funnel Options */}
              <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.82rem' }}>
                  ⚡ Standalone Zero-Dependency Python stdlib daemon with SQLite persistence &amp; MCP 2024-11-05 server.
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    component="a"
                    href="https://github.com/NullAITech/neuro-memory-daemon"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: gold.border, color: theme.palette.text.primary, fontWeight: 750, fontFamily: mono, fontSize: '0.78rem' }}
                  >
                    Inspect Micro-Repo
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/zoth-os"
                    variant="contained"
                    size="small"
                    sx={{ bgcolor: gold.accent, color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.78rem', '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' } }}
                  >
                    Boot in Zoth OS
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Query & Stored Vectors Table */}
            <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Stored Vectors ({filteredMemories.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setIsExportDialogOpen(true)}
                    sx={{ borderColor: gold.accent, color: gold.accent, fontWeight: 750, '&:hover': { bgcolor: gold.wash } }}
                  >
                    Export Snapshot
                  </Button>
                </Box>
                <TextField
                  size="small"
                  placeholder="Filter vectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{
                    width: 280,
                    '& .MuiInputBase-root': {
                      bgcolor: isDark ? '#08080B' : '#F8FAFC',
                      color: theme.palette.text.primary,
                    }
                  }}
                />
              </Box>

              <Table size="small">
                <TableHead sx={{ bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Vector ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Memory Payload</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Cluster</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Spatial Coord</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Synaptic Weight</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>Author</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMemories.map((row) => (
                    <TableRow key={row.id} hover onClick={() => setSelectedMemory(row)} sx={{ cursor: 'pointer' }}>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', fontWeight: 700, color: clusterColors[row.cluster] }}>
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>{row.text}</TableCell>
                      <TableCell>
                        <Chip label={row.cluster} size="small" sx={{ bgcolor: clusterColors[row.cluster] + '22', color: clusterColors[row.cluster], fontWeight: 750 }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: mono, fontSize: '0.75rem', color: isDark ? gold.soft : '#8A6A09', fontWeight: 600 }}>
                        ({row.x}, {row.y}, {row.z})
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={row.weight * 100} sx={{ width: 60, height: 6, borderRadius: 1 }} />
                          <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>{row.weight.toFixed(2)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>{row.author}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* ==========================================================================
           TAB 3: LUCY 3D ORACLE CHAMBER (ZERO-EGRESS AIR-GAPPED HOLOGRAPHIC PROJECTOR)
           ========================================================================== */}
        {activeTab === 3 && (
          <Box>
            <Grid container spacing={3}>
              <Grid xs={12} md={8}>
                <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: isDark ? '#08080B' : theme.palette.background.paper, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ViewInArIcon sx={{ color: '#F472B6' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F472B6' }}>
                        LUCYNA KUSHINADA 3D NEURAL HOLOGRAM
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label="Zero-Egress Air-Gapped" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: isDark ? '#34D399' : '#059669', fontWeight: 750 }} />
                      <Chip label="Interactive 3D Orbit" size="small" sx={{ bgcolor: 'rgba(244,114,182,0.15)', color: '#F472B6', fontWeight: 750 }} />
                    </Box>
                  </Box>

                  {/* Offline Zero-Egress Interactive 3D Canvas */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 440,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `1px solid ${isDark ? 'rgba(0,240,255,0.4)' : theme.palette.divider}`,
                      bgcolor: isDark ? '#08080B' : '#0B0F19',
                      cursor: 'grab',
                      '&:active': { cursor: 'grabbing' },
                    }}
                    onMouseDown={handleHoloMouseDown}
                    onMouseMove={handleHoloMouseMove}
                    onMouseUp={handleHoloMouseUp}
                    onMouseLeave={handleHoloMouseUp}
                  >
                    <canvas
                      ref={holoCanvasRef}
                      width={740}
                      height={440}
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, px: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      🎮 Click and drag mouse to orbit Lucy's 3D holographic projection in real-time.
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setHoloOrbit({ yaw: 0.35, pitch: 0.15 })}
                      sx={{ color: gold.accent, fontSize: '0.72rem', textTransform: 'none', fontFamily: mono }}
                    >
                      Reset 3D Orbit
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={12} md={4}>
                <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.background.paper, height: '100%' }}>
                  <Typography variant="overline" sx={{ color: '#F472B6', fontWeight: 800, letterSpacing: '0.12em' }}>
                    LUCY COGNITIVE ORACLE
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Oracle of the Sovereign Grid
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    Lucy serves as the sovereign cognitive memory agent and semantic oracle across Zoth Studio. Operating on loopback port 8094, Lucy intercepts and validates high-entropy memory spikes with zero external cloud footprint.
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Deep Net Capabilities</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Zero-Egress Isolation" size="small" sx={{ bgcolor: 'rgba(244,114,182,0.15)', color: '#F472B6', fontWeight: 700 }} />
                      <Typography variant="caption">Zero packet interception</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="STDP Regulator" size="small" sx={{ bgcolor: 'rgba(212,175,55,0.15)', color: gold.accent, fontWeight: 700 }} />
                      <Typography variant="caption">Logarithmic half-life decay</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Zero-Egress Guard" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: isDark ? '#34D399' : '#059669', fontWeight: 700 }} />
                      <Typography variant="caption">Strict loopback containment</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Cognitive Waves" size="small" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: isDark ? '#00F0FF' : '#0284C7', fontWeight: 700 }} />
                      <Typography variant="caption">432Hz Alpha / 528Hz Theta</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* STDP Mathematical Foundation Reference */}
        <Box sx={{ mt: 5 }}>
          <Typography className="section-kicker">Mathematical Foundation</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
            Pillar VI: STDP Synaptic Weight Adaptation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 740, lineHeight: 1.6 }}>
            The memory daemon is driven by Spike-Timing-Dependent Plasticity, where memory weight updates depend strictly on the relative arrival time between agent query impulses:
          </Typography>
          <MathPillarsGrid />
        </Box>
      </Box>

      {/* ==========================================================================
         EXPORT LUCY NEURAL SNAPSHOT DIALOG (HOUSE RULE #3)
         ========================================================================== */}
      <Dialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#08080B' : theme.palette.background.paper,
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.4)' : theme.palette.divider}`,
            borderRadius: 2,
            boxShadow: isDark ? '0 0 30px rgba(0,0,0,0.9)' : '0 10px 40px rgba(16,24,40,0.15)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DownloadIcon sx={{ color: gold.accent }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: gold.accent, fontFamily: mono }}>
              LUCY NEURAL SNAPSHOT // SERIALIZATION
            </Typography>
          </Box>
          <IconButton onClick={() => setIsExportDialogOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Complete JSON snapshot of Lucy's active Whitespace memory matrix, deterministic coordinates, and biomorphic synaptic weights. Zero external network egress guaranteed.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`${memories.length} Vector Nodes`} size="small" sx={{ bgcolor: gold.wash, color: gold.accent, fontFamily: mono, fontWeight: 750 }} />
            <Chip label={`Carrier: ${carrierFreq}Hz`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: isDark ? '#00F0FF' : '#0284C7', fontFamily: mono, fontWeight: 750 }} />
            <Chip label="Air-Gapped Zero-Egress Verified" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: isDark ? '#34D399' : '#059669', fontFamily: mono, fontWeight: 750 }} />
          </Box>

          <Paper
            sx={{
              p: 2,
              bgcolor: isDark ? '#040407' : '#F8FAFC',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}`,
              borderRadius: 1.5,
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            <pre style={{ margin: 0, fontFamily: mono, fontSize: '0.78rem', color: isDark ? '#F5E6AB' : '#0F172A' }}>
              {neuralSnapshot ? JSON.stringify(neuralSnapshot, null, 2) : 'Generating snapshot...'}
            </pre>
          </Paper>

          {copyFeedback && (
            <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(52,211,153,0.15)', color: isDark ? '#34D399' : '#059669', border: `1px solid ${isDark ? '#34D399' : '#059669'}` }}>
              Lucy Neural Snapshot copied to clipboard!
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}` }}>
          <Button
            variant="outlined"
            startIcon={copyFeedback ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={handleCopySnapshotToClipboard}
            sx={{
              borderColor: isDark ? 'rgba(212,175,55,0.5)' : theme.palette.divider,
              color: isDark ? gold.soft : '#8A6A09',
              fontWeight: 750,
              '&:hover': { borderColor: gold.accent },
            }}
          >
            {copyFeedback ? 'Copied!' : 'Copy JSON to Clipboard'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadSnapshotFile}
            sx={{
              bgcolor: gold.accent,
              color: '#08080B',
              fontWeight: 800,
              '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' },
            }}
          >
            Download Snapshot (.json)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sovereign Installation Funnel */}
      <RevealOnScroll preset="fadeUp">
        <SovereignFunnel
          title="Deploy Netrunner Memory & Vector Search Locally"
          subtitle="Zero-egress local memory consolidation engine powered by STDP synaptic plasticity, 3D semantic clustering, and offline vector similarity search."
          toolTitle="Option 1: Vector Search Engine Micro-Repo"
          toolTag="VECTOR ENGINE"
          toolDescription="Standalone zero-egress vector similarity and semantic search micro-engine with cosine indexing and local memory storage."
          toolRepo="https://github.com/NullAITech/vector-search-engine"
          toolCommand="git clone https://github.com/NullAITech/vector-search-engine.git"
        />
      </RevealOnScroll>
    </Container>
    </>
  );
}
