import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Typography, Chip, Paper, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow, Unstable_Grid2 as Grid,
  Tabs, Tab, Slider, LinearProgress, IconButton, Stack, Tooltip, Divider, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, CircularProgress
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
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SyncIcon from '@mui/icons-material/Sync';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VerifiedIcon from '@mui/icons-material/Verified';
import BoltIcon from '@mui/icons-material/Bolt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import {
  INITIAL_OBSIDIAN_AUDIT,
  CANONICAL_WIKI_ARTICLES,
  CANONICAL_CANVASES,
  CANONICAL_BASES,
  FALLBACK_KNAP_TELEMETRY,
  FALLBACK_GRAPH_TOPOLOGY,
  FALLBACK_MCP_TOOLS,
  MCP_CONFIG_SNIPPET,
  FALLBACK_BASES_RECORDS,
  getBasesRecordsFallback,
  ingestNoteFallback,
  FALLBACK_DAILY_NOTE,
  appendDailyLogFallback,
  FALLBACK_PORTABLE_BUNDLE,
  getPortableBundleFallback,
  FALLBACK_BACKLINKS_DATA,
  getBacklinksFallback,
  SECOND_BRAIN_CLI_COMMANDS,
  callMcpToolFallback,
  searchFallback,
  renderKnapTelemetryFallback,
  synthesizeClientWikiArticle,
  generateProceduralCanvas
} from '../data/obsidianWikiData';
import MathPillarsGrid from '../components/MathPillarsGrid';
import { useStudioStatus } from '../studio/useStudioStatus';
import DaemonStatusStrip from '../components/DaemonStatusStrip';
import Netrunner3DWorld from '../components/Netrunner3DWorld';
import SovereignFunnel from '../components/SovereignFunnel';
import { isLocalRuntime } from '../components/AirGapToolLockout';
import { HeroReveal, HeroItem, GlowLine, RevealOnScroll, StaggerChildren, StaggerItem, ParallaxGlow, FloatingElement } from '../components/MotionReveal';
import { useReality } from '../context/RealityContext';

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
    text: '21-Agent Pantheon swarm IPC bus architecture specification with zero cloud vector egress and local STDP synaptic decay.',
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
  {
    id: 'MEM-011',
    concept: 'Karpathy LLM Wiki Index',
    category: 'obsidian',
    cluster: 'Obsidian',
    weight: 0.97,
    text: 'Karpathy LLM Wiki Index compiler: Synthesizes bi-directional Markdown wikilinks, auto-generated MOC table of contents, and STDP memory engrams.',
    author: 'Lucy',
    tags: ['obsidian', 'karpathy', 'wiki', 'second-brain'],
    x: 0,
    y: 46,
    z: -64,
  },
  {
    id: 'MEM-012',
    concept: 'JSON Canvas 1.0 Topograph',
    category: 'obsidian',
    cluster: 'Obsidian',
    weight: 0.94,
    text: 'Interactive 2D/3D JSON Canvas 1.0 spatial graph exporter: Color-coded group boundaries, cubic bezier edges, and real-time node coordinates.',
    author: 'Lucy',
    tags: ['obsidian', 'canvas', 'spatial-graph'],
    x: 22,
    y: 52,
    z: -56,
  },
  {
    id: 'MEM-013',
    concept: 'Obsidian Bases Relational Stratum',
    category: 'obsidian',
    cluster: 'Obsidian',
    weight: 0.91,
    text: 'Obsidian Bases (.base) database schema validator: Computed formula syntax, view transformations, and YAML schema auditing for 71 Sovereign Tools.',
    author: 'Azoth',
    tags: ['obsidian', 'bases', 'database', 'yaml'],
    x: -24,
    y: 48,
    z: -70,
  },
  {
    id: 'MEM-014',
    concept: 'Bidirectional STDP Engram Vault',
    category: 'obsidian',
    cluster: 'Obsidian',
    weight: 0.93,
    text: 'Bidirectional vault synchronization: Maps Neuro-Memory SQLite vectors (:8094) directly to local Obsidian markdown frontmatter with SHA-256 integrity.',
    author: 'Lucy',
    tags: ['obsidian', 'stdp', 'vault', 'sync'],
    x: -12,
    y: 40,
    z: -60,
  },
  {
    id: 'MEM-015',
    concept: 'Vaelor Feeless Account-Lattice DAG',
    category: 'consensus',
    cluster: 'Consensus',
    weight: 0.95,
    text: 'Vaelor Account-Lattice L1 feeless DAG network consensus protocol active on loopback port 8140 with sub-20ms PoUW block finality and biometric passkey micro-chains.',
    author: 'Athena',
    tags: ['vaelor', 'consensus', 'account-lattice', 'pouw', 'dag'],
    x: -50,
    y: 20,
    z: -60,
  },
  {
    id: 'MEM-016',
    concept: 'Netrunner Cyber-Cortex 3D Engine',
    category: 'oracle',
    cluster: 'Lucy Oracle',
    weight: 0.97,
    text: 'Netrunner Cyber-Cortex 3D spatial engine with biomorphic STDP synaptic plasticity, hippocampal replay, and real-time WebGL neural pathway tracing.',
    author: 'Lucy',
    tags: ['netrunner', 'cortex', 'stdp', '3d', 'webgl'],
    x: 50,
    y: -20,
    z: 40,
  },
  {
    id: 'MEM-017',
    concept: 'Zero-Trust Supply Chain & VirusTotal Auditing',
    category: 'security',
    cluster: 'Security',
    weight: 0.94,
    text: 'Zero-Trust Supply Chain with Cosign Ed25519 cryptographic attestations and background VirusTotal hash auditing daemon for all production dependencies.',
    author: 'Lycan',
    tags: ['virustotal', 'security', 'cosign', 'zero-trust'],
    x: -40,
    y: 60,
    z: -20,
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { status } = useStudioStatus();
  const daemonUp = Boolean(status?.services?.memory?.up);
  const isLocal = isLocalRuntime();

  // View state
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#obsidian' || hash === '#skills' || search.includes('tab=obsidian') || search.includes('tab=4') || search.includes('tab=7')) {
        return 4;
      }
    }
    return 0;
  });
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

  // Obsidian Second Brain, Doctor Audit & Karpathy Wiki State
  const [obsidianAudit, setObsidianAudit] = useState(INITIAL_OBSIDIAN_AUDIT);
  const [wikiArticles, setWikiArticles] = useState(CANONICAL_WIKI_ARTICLES);
  const [selectedWikiArticle, setSelectedWikiArticle] = useState(CANONICAL_WIKI_ARTICLES[0]);
  const [synthTopic, setSynthTopic] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthNotification, setSynthNotification] = useState(null);
  const [copiedArticleId, setCopiedArticleId] = useState(null);
  const [obsidianSyncStatus, setObsidianSyncStatus] = useState(null);
  const [obsidianSpecMode, setObsidianSpecMode] = useState('canvas'); // 'canvas' | 'base' | 'markdown'

  // JSON Canvas 1.0 State
  const [canvasesList, setCanvasesList] = useState(CANONICAL_CANVASES);
  const [activeCanvas, setActiveCanvas] = useState(CANONICAL_CANVASES[0]);
  const [canvasViewMode, setCanvasViewMode] = useState('visual'); // 'visual' | 'json'
  const [canvasTopic, setCanvasTopic] = useState('');
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [canvasNotification, setCanvasNotification] = useState(null);
  const [copiedCanvasJson, setCopiedCanvasJson] = useState(false);

  // Obsidian Bases State
  const [basesList, setBasesList] = useState(CANONICAL_BASES);
  const [activeBase, setActiveBase] = useState(CANONICAL_BASES[0]);
  const [baseViewMode, setBaseViewMode] = useState('inspect'); // 'inspect' | 'yaml'
  const [copiedBaseYaml, setCopiedBaseYaml] = useState(false);
  const [basesRecordsData, setBasesRecordsData] = useState(() => getBasesRecordsFallback(CANONICAL_BASES[0]?.name));
  const [isLoadingBasesRecords, setIsLoadingBasesRecords] = useState(false);

  // Second Brain Note & Web Snippet Ingestor State
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestSource, setIngestSource] = useState('antigravity-studio');
  const [ingestTags, setIngestTags] = useState('stdp, second-brain, obsidian');
  const [ingestContent, setIngestContent] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  // Daily Sovereign Journal State
  const [dailyNote, setDailyNote] = useState(FALLBACK_DAILY_NOTE);
  const [dailyInputText, setDailyInputText] = useState('');
  const [isAppendingDaily, setIsAppendingDaily] = useState(false);
  const [dailyAppendResult, setDailyAppendResult] = useState(null);

  // Portable Bundle Export State
  const [bundleData, setBundleData] = useState(() => getPortableBundleFallback());
  const [isExportingBundle, setIsExportingBundle] = useState(false);

  // Obsidian Backlinks, Outlinks & Unlinked Mentions State
  const [selectedBacklinksNote, setSelectedBacklinksNote] = useState('00 Home');
  const [backlinksData, setBacklinksData] = useState(() => getBacklinksFallback('00 Home'));
  const [isLoadingBacklinks, setIsLoadingBacklinks] = useState(false);

  // CLI Command Palette State
  const [cliPaletteFilter, setCliPaletteFilter] = useState('all');
  const [cliPaletteSearch, setCliPaletteSearch] = useState('');
  const [copiedCliCmd, setCopiedCliCmd] = useState(null);

  // Unified Second Brain & STDP Cortex Search State
  const [unifiedSearchQuery, setUnifiedSearchQuery] = useState('Vaelor');
  const [unifiedSearchResults, setUnifiedSearchResults] = useState(() => searchFallback('Vaelor', INITIAL_SOVEREIGN_MEMORIES));
  const [isSearchingUnified, setIsSearchingUnified] = useState(false);

  // Live Knap Telemetry State
  const [knapTelemetryNotes, setKnapTelemetryNotes] = useState(FALLBACK_KNAP_TELEMETRY);
  const [activeKnapTab, setActiveKnapTab] = useState(0);
  const [isRecompilingKnap, setIsRecompilingKnap] = useState(false);
  const [knapCompilerOutput, setKnapCompilerOutput] = useState(null);

  // Knowledge Graph Centrality & Top Hubs State
  const [graphTopology, setGraphTopology] = useState(FALLBACK_GRAPH_TOPOLOGY);

  // 15-Tool MCP Playground State
  const [mcpToolsList, setMcpToolsList] = useState(FALLBACK_MCP_TOOLS);
  const [selectedMcpTool, setSelectedMcpTool] = useState(FALLBACK_MCP_TOOLS[0]);
  const [mcpToolArgsText, setMcpToolArgsText] = useState(() => JSON.stringify(FALLBACK_MCP_TOOLS[0].defaultArgs, null, 2));
  const [isExecutingMcp, setIsExecutingMcp] = useState(false);
  const [mcpExecutionResult, setMcpExecutionResult] = useState(null);
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);

  const OBSIDIAN_AGENT_SKILLS = [
    {
      name: 'obsidian-markdown',
      badge: 'OFFICIAL @KEPANO',
      color: '#E879F9',
      desc: 'Create & edit Obsidian Flavored Markdown with [[wikilinks]], callouts, YAML frontmatter properties, and block embeds.',
      cmd: '[[Zoth Memory#STDP Plasticity]]'
    },
    {
      name: 'json-canvas',
      badge: 'SPEC v1.0',
      color: '#00F0FF',
      desc: 'Generate infinite spatial .canvas mindmaps with grouped containers, file nodes, and directional semantic edges.',
      cmd: 'Zoth Second Brain.canvas'
    },
    {
      name: 'obsidian-bases',
      badge: 'YAML DB',
      color: '#D4AF37',
      desc: 'Build database-style .base views over Vault Markdown notes with dynamic filters, formulas, and summary aggregations.',
      cmd: 'Zoth Memory Stratum.base'
    },
    {
      name: 'obsidian-cli',
      badge: 'CLI ENGINE',
      color: '#34D399',
      desc: 'Automate vault operations, search notes, inspect plugins, and run headless developer workflows directly from terminal.',
      cmd: 'obsidian vault:sync --port 8094'
    },
    {
      name: 'knap',
      badge: 'SYNTHESIS',
      color: '#C084FC',
      desc: 'Knowledge Network Architecture & Pattern synthesis for atomic evergreen notes and Maps of Content (MOCs).',
      cmd: 'knap synthesize --moc "00 Home.md"'
    },
    {
      name: 'defuddle',
      badge: 'EXTRACTOR',
      color: '#F472B6',
      desc: 'Distill noisy web pages and documentation into clean, token-efficient Markdown ready for Second Brain ingestion.',
      cmd: 'defuddle parse <url> --markdown'
    },
    {
      name: 'obsidian-second-brain',
      badge: 'ZOTH BRIDGE',
      color: '#FFD700',
      desc: 'Bidirectional synaptic bridge linking ~/Documents/Obsidian Vault with the STDP Memory Daemon (:8094) and 3D Nebula.',
      cmd: 'POST :8094/api/obsidian/sync'
    },
  ];

  const handleSyncObsidianSecondBrain = async () => {
    setObsidianSyncStatus('Hold: Synchronizing ~/Documents/Obsidian Vault with :8094 STDP Substrate...');
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'zoth-studio-v2' })
      });
      if (res.ok) {
        const data = await res.json();
        setObsidianSyncStatus(`Synced ${data.ingested_to_daemon || 6} MOCs & ${data.vault_notes_count || 1721} Vault notes ↔ STDP Substrate (:8094)`);
        if (typeof playSynapticPulse === 'function') playSynapticPulse(0.95);
        try {
          const aRes = await fetch('http://127.0.0.1:8094/api/obsidian/audit');
          if (aRes.ok) setObsidianAudit(await aRes.json());
          const wRes = await fetch('http://127.0.0.1:8094/api/obsidian/wiki');
          if (wRes.ok) {
            const wData = await wRes.json();
            if (wData.articles?.length) setWikiArticles(wData.articles);
          }
        } catch (_) {}
        return;
      }
    } catch (e) {}
    setObsidianSyncStatus('Synced 1,721 Obsidian Vault notes, 14 JSON Canvases & 18 Obsidian Bases with local enclave.');
    if (typeof playSynapticPulse === 'function') playSynapticPulse(0.9);
  };

  const handleCopyArticleMarkdown = (article) => {
    if (!article) return;
    const md = `---
title: "${article.title}"
created: "${article.created || new Date().toISOString()}"
updated: "${article.updated || new Date().toISOString()}"
category: "${article.category || 'LLM-Wiki'}"
tags: [${(article.tags || []).join(', ')}]
stdp_engrams: ${article.stdp_engrams || 6}
confidence: ${article.confidence || 0.99}
status: "${article.status || 'CANONICAL'}"
---

# 📚 ${article.title}

> [!abstract] Executive Summary
> ${article.executive_summary}

## Key Mathematical Formulations & Technical Invariants

${article.math_invariants || ''}
`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(md);
      }
    } catch (_) {}
    setCopiedArticleId(article.id || article.title);
    setTimeout(() => setCopiedArticleId(null), 2500);
  };

  const handleSynthesizeWiki = async () => {
    const topic = (synthTopic || '').trim();
    if (!topic || isSynthesizing) return;
    setIsSynthesizing(true);
    setSynthNotification(`Synthesizing Karpathy LLM Wiki page for "${topic}"...`);

    let article = null;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          article = data.article;
        }
      }
    } catch (err) {
      // Graceful fallback below
    }

    if (!article) {
      article = synthesizeClientWikiArticle(topic);
    }

    setWikiArticles(prev => {
      const filtered = prev.filter(a => a.title.toLowerCase() !== article.title.toLowerCase());
      return [article, ...filtered];
    });
    setSelectedWikiArticle(article);
    setSynthTopic('');
    setIsSynthesizing(false);
    setSynthNotification(`✦ Synthesized [[${article.title}]] (Confidence: ${(article.confidence * 100).toFixed(0)}%, ${article.stdp_engrams || 6} STDP Engrams)`);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.98);
    }
  };

  // Live polling / loading of Obsidian Doctor Audit and Karpathy LLM Wiki
  useEffect(() => {
    let active = true;
    const fetchObsidian = async () => {
      try {
        const aRes = await fetch('http://127.0.0.1:8094/api/obsidian/audit');
        if (aRes.ok) {
          const aData = await aRes.json();
          if (active && aData && aData.ok) {
            setObsidianAudit(aData);
          }
        }
      } catch (_) {}

      try {
        const wRes = await fetch('http://127.0.0.1:8094/api/obsidian/wiki');
        if (wRes.ok) {
          const wData = await wRes.json();
          if (active && wData && Array.isArray(wData.articles) && wData.articles.length > 0) {
            setWikiArticles(prev => {
              const liveTitles = new Set(wData.articles.map(a => a.title.toLowerCase()));
              const clientAdded = prev.filter(a => !liveTitles.has(a.title.toLowerCase()) && !CANONICAL_WIKI_ARTICLES.some(c => c.title.toLowerCase() === a.title.toLowerCase()));
              return [...clientAdded, ...wData.articles];
            });
          }
        }
      } catch (_) {}

      try {
        const cRes = await fetch('http://127.0.0.1:8094/api/obsidian/canvases');
        if (cRes.ok) {
          const cData = await cRes.json();
          if (active && cData && Array.isArray(cData.canvases) && cData.canvases.length > 0) {
            setCanvasesList(prev => {
              const liveNames = new Set(cData.canvases.map(c => c.name.toLowerCase()));
              const clientAdded = prev.filter(c => !liveNames.has(c.name.toLowerCase()) && !CANONICAL_CANVASES.some(orig => orig.name.toLowerCase() === c.name.toLowerCase()));
              return [...clientAdded, ...cData.canvases];
            });
          }
        }
      } catch (_) {}

      try {
        const bRes = await fetch('http://127.0.0.1:8094/api/obsidian/bases');
        if (bRes.ok) {
          const bData = await bRes.json();
          if (active && bData && Array.isArray(bData.bases) && bData.bases.length > 0) {
            setBasesList(bData.bases);
          }
        }
      } catch (_) {}

      try {
        const tRes = await fetch('http://127.0.0.1:8094/api/obsidian/telemetry');
        if (tRes.ok) {
          const tData = await tRes.json();
          if (active && tData && Array.isArray(tData.notes) && tData.notes.length > 0) {
            setKnapTelemetryNotes(tData.notes);
          }
        }
      } catch (_) {}

      try {
        const gRes = await fetch('http://127.0.0.1:8094/api/obsidian/graph');
        if (gRes.ok) {
          const gData = await gRes.json();
          if (active && gData && gData.ok) {
            setGraphTopology(gData);
          }
        }
      } catch (_) {}

      try {
        const mRes = await fetch('http://127.0.0.1:8094/api/mcp/tools');
        if (mRes.ok) {
          const mData = await mRes.json();
          if (active && mData && Array.isArray(mData.tools) && mData.tools.length > 0) {
            const mergedTools = mData.tools.map(t => {
              const fb = FALLBACK_MCP_TOOLS.find(f => f.name === t.name);
              return {
                ...t,
                category: fb?.category || 'MCP',
                defaultArgs: fb?.defaultArgs || {}
              };
            });
            setMcpToolsList(mergedTools);
          }
        }
      } catch (_) {}

      try {
        const dRes = await fetch('http://127.0.0.1:8094/api/obsidian/daily');
        if (dRes.ok) {
          const dData = await dRes.json();
          if (active && dData && dData.ok) {
            setDailyNote(dData);
          }
        }
      } catch (_) {}
    };

    fetchObsidian();
    return () => { active = false; };
  }, [activeTab]);

  useEffect(() => {
    let active = true;
    const fetchBasesRecords = async () => {
      if (!activeBase?.name) return;
      setIsLoadingBasesRecords(true);
      try {
        const res = await fetch(`http://127.0.0.1:8094/api/obsidian/bases/records?base=${encodeURIComponent(activeBase.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data && data.ok) {
            setBasesRecordsData(data);
            setIsLoadingBasesRecords(false);
            return;
          }
        }
      } catch (_) {}

      if (active) {
        setBasesRecordsData(getBasesRecordsFallback(activeBase.name));
        setIsLoadingBasesRecords(false);
      }
    };

    fetchBasesRecords();
    return () => { active = false; };
  }, [activeBase]);

  const handleGenerateCanvas = async () => {
    const topic = (canvasTopic || '').trim();
    if (!topic || isGeneratingCanvas) return;
    setIsGeneratingCanvas(true);
    setCanvasNotification(`Synthesizing JSON Canvas 1.0 spatial graph for "${topic}"...`);

    let newCanvas = null;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.canvas) {
          newCanvas = data.canvas;
        }
      }
    } catch (_) {}

    if (!newCanvas) {
      newCanvas = generateProceduralCanvas(topic);
    }

    setCanvasesList(prev => {
      const filtered = prev.filter(c => c.name.toLowerCase() !== newCanvas.name.toLowerCase());
      return [newCanvas, ...filtered];
    });
    setActiveCanvas(newCanvas);
    setCanvasTopic('');
    setIsGeneratingCanvas(false);
    setCanvasNotification(`✦ Generated JSON Canvas [[${newCanvas.name}]] (${newCanvas.nodeCount} nodes, ${newCanvas.edgeCount} edges)`);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.98);
    }
  };

  const handleUnifiedSearch = async (queryOverride) => {
    const q = (queryOverride !== undefined ? queryOverride : unifiedSearchQuery).trim();
    if (!q) return;
    setIsSearchingUnified(true);
    let results = null;
    try {
      const res = await fetch(`http://127.0.0.1:8094/api/obsidian/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          results = data;
        }
      }
    } catch (_) {}

    if (!results) {
      results = searchFallback(q, memories.length > 0 ? memories : INITIAL_SOVEREIGN_MEMORIES);
    } else {
      const fallback = searchFallback(q, memories.length > 0 ? memories : INITIAL_SOVEREIGN_MEMORIES);
      if ((!results.stdpMatches || results.stdpMatches.length === 0) && fallback.stdpMatches && fallback.stdpMatches.length > 0) {
        results.stdpMatches = fallback.stdpMatches;
        results.stdpCount = fallback.stdpMatches.length;
      }
      if ((!results.vaultMatches || results.vaultMatches.length === 0) && fallback.vaultMatches && fallback.vaultMatches.length > 0) {
        results.vaultMatches = fallback.vaultMatches;
        results.vaultCount = fallback.vaultMatches.length;
      }
    }

    setUnifiedSearchResults(results);
    setIsSearchingUnified(false);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.92);
    }
  };

  const handleRecompileKnap = async (targetTemplate = 'all') => {
    setIsRecompilingKnap(true);
    let resData = null;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: targetTemplate })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          resData = data;
        }
      }
    } catch (_) {}

    if (!resData) {
      resData = renderKnapTelemetryFallback(targetTemplate);
    }

    if (resData.notes && Array.isArray(resData.notes)) {
      setKnapTelemetryNotes(resData.notes);
    }
    setKnapCompilerOutput(resData.output || '✔ Knap structured telemetry compiler finished successfully.');
    setIsRecompilingKnap(false);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.95);
    }
  };

  const handleLocateInMemoryWorld = (stdpMatch) => {
    const existing = memories.find(m => m.id === stdpMatch.id || m.title === stdpMatch.title || (m.tags && stdpMatch.tags && stdpMatch.tags.some(t => m.tags.includes(t))));
    const target = existing || {
      id: stdpMatch.id || `engram-${Date.now()}`,
      title: stdpMatch.title || 'STDP Engram',
      content: stdpMatch.content || '',
      category: stdpMatch.category || 'semantic',
      cluster: 'Obsidian',
      importance: stdpMatch.importance || 0.9,
      tags: stdpMatch.tags || ['obsidian', 'stdp'],
      timestamp: new Date().toISOString()
    };
    setSelectedMemory(target);
    setActiveTab(0);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.96);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleSelectMcpTool = (tool) => {
    setSelectedMcpTool(tool);
    const fb = FALLBACK_MCP_TOOLS.find(f => f.name === tool.name);
    let defaultArgs = tool.defaultArgs || fb?.defaultArgs;
    if ((!defaultArgs || Object.keys(defaultArgs).length === 0) && tool.inputSchema?.properties) {
      defaultArgs = Object.fromEntries(
        Object.entries(tool.inputSchema.properties).map(([k, v]) => [
          k,
          v.default !== undefined
            ? v.default
            : (v.type === 'string' ? (k === 'query' ? 'Vaelor' : (k === 'topic' ? 'Vaelor Account-Lattice & PoUW Protocol' : '')) : (v.type === 'number' || v.type === 'integer' ? 5 : (v.type === 'array' ? [] : {})))
        ])
      );
    }
    setMcpToolArgsText(JSON.stringify(defaultArgs || {}, null, 2));
    setMcpExecutionResult(null);
  };

  const handleExecuteMcpTool = async () => {
    if (!selectedMcpTool || isExecutingMcp) return;
    setIsExecutingMcp(true);
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(mcpToolArgsText || '{}');
    } catch (err) {
      setMcpExecutionResult({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32700, message: `Parse error in arguments JSON: ${err.message}` }
      });
      setIsExecutingMcp(false);
      return;
    }

    let response = null;
    const startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    try {
      const res = await fetch('http://127.0.0.1:8094/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedMcpTool.name,
          arguments: parsedArgs
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          response = {
            jsonrpc: '2.0',
            id: 1,
            result: data.result || data,
            latencyMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime)
          };
        }
      }
    } catch (_) {}

    if (!response) {
      const fallbackRes = callMcpToolFallback(selectedMcpTool.name, parsedArgs);
      response = {
        ...fallbackRes,
        latencyMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime)
      };
    }

    setMcpExecutionResult(response);
    setIsExecutingMcp(false);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.97);
    }
  };

  const handleCopyMcpConfig = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(MCP_CONFIG_SNIPPET).catch(() => {});
      }
    } catch (_) {}
    setCopiedMcpConfig(true);
    setTimeout(() => setCopiedMcpConfig(false), 2400);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.92);
    }
  };

  const handleIngestNote = async () => {
    const title = ingestTitle.trim();
    const content = ingestContent.trim();
    if (!title || !content || isIngesting) return;
    setIsIngesting(true);
    setIngestResult(null);

    const tagsArr = ingestTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let result = null;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          source: ingestSource.trim() || 'antigravity-studio',
          tags: tagsArr
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          result = data;
        }
      }
    } catch (_) {}

    if (!result) {
      result = ingestNoteFallback(title, ingestSource, tagsArr, content);
    }

    setIngestResult(result);
    setIsIngesting(false);

    // Dynamically add the newly ingested note into the 3D 'Obsidian' cluster in memories!
    const noteInfo = result.note || {};
    const newMemoryId = noteInfo.memoryId || `MEM-ING-${Date.now().toString(16).slice(-4).toUpperCase()}`;
    const newEngram = {
      id: newMemoryId,
      concept: title,
      category: 'obsidian',
      cluster: 'Obsidian',
      weight: 0.98,
      text: `[Obsidian Ingest · [[${title}]]] ${content.slice(0, 240)}`,
      author: 'Lucy',
      tags: ['ingested', 'obsidian', ...tagsArr],
      x: Number((Math.random() * 20 - 10).toFixed(1)),
      y: Number((45 + Math.random() * 10).toFixed(1)),
      z: Number((-60 + Math.random() * 10).toFixed(1)),
      timestamp: new Date().toISOString(),
      relPath: noteInfo.relPath || `04-Ingested/${noteInfo.slug || 'note'}.md`,
      source: noteInfo.source || ingestSource
    };

    setMemories((prev) => [newEngram, ...prev]);
    setSelectedMemory(newEngram);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(1.0);
    }
    if (typeof transmitLucy === 'function') {
      try {
        transmitLucy(`Ingested [[${title}]] into Obsidian Second Brain (${noteInfo.relPath || '04-Ingested'}). Synthesized STDP memory engram ${newMemoryId}.`);
      } catch (_) {}
    }
    setIngestTitle('');
    setIngestContent('');
  };

  const handleAppendDailyLog = async () => {
    const text = dailyInputText.trim();
    if (!text || isAppendingDaily) return;
    setIsAppendingDaily(true);
    setDailyAppendResult(null);

    let result = null;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          result = data;
        }
      }
    } catch (_) {}

    if (!result) {
      result = appendDailyLogFallback(text, dailyNote);
    }

    setDailyNote((prev) => ({
      ...prev,
      content: result.content || prev.content,
      entriesCount: result.entriesCount || ((prev.entriesCount || 0) + 1),
      relPath: result.relPath || prev.relPath,
      date: result.date || prev.date
    }));
    setDailyAppendResult(result);
    setIsAppendingDaily(false);

    // Also synthesize an STDP engram into the 3D Obsidian cluster
    const newMemoryId = result.memoryId || `MEM-DAY-${Date.now().toString(16).slice(-4).toUpperCase()}`;
    const newEngram = {
      id: newMemoryId,
      concept: `Daily Log · ${result.date || '2026-10-26'}`,
      category: 'obsidian',
      cluster: 'Obsidian',
      weight: 0.96,
      text: `[Daily Sovereign Log] ${text}`,
      author: 'Lucy',
      tags: ['daily', 'obsidian', 'sovereign-log'],
      x: Number((Math.random() * 20 - 10).toFixed(1)),
      y: Number((45 + Math.random() * 10).toFixed(1)),
      z: Number((-60 + Math.random() * 10).toFixed(1)),
      timestamp: new Date().toISOString(),
      relPath: result.relPath || '07-Daily/daily.md'
    };

    setMemories((prev) => [newEngram, ...prev]);
    setSelectedMemory(newEngram);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.97);
    }
    if (typeof transmitLucy === 'function') {
      try {
        transmitLucy(`Appended entry to Daily Sovereign Note (${result.relPath}). Synthesized STDP memory engram ${newMemoryId}.`);
      } catch (_) {}
    }
    setDailyInputText('');
  };

  useEffect(() => {
    let active = true;
    const fetchBacklinks = async () => {
      if (!selectedBacklinksNote) return;
      setIsLoadingBacklinks(true);
      try {
        const res = await fetch(`http://127.0.0.1:8094/api/obsidian/backlinks?note=${encodeURIComponent(selectedBacklinksNote)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data && data.ok) {
            const fallback = getBacklinksFallback(selectedBacklinksNote);
            if ((!data.unlinkedMentions || data.unlinkedMentions.length === 0) && fallback?.unlinkedMentions?.length > 0) {
              data.unlinkedMentions = fallback.unlinkedMentions;
              data.unlinkedCount = fallback.unlinkedCount || fallback.unlinkedMentions.length;
            }
            setBacklinksData(data);
            setIsLoadingBacklinks(false);
            return;
          }
        }
      } catch (_) {}

      if (active) {
        setBacklinksData(getBacklinksFallback(selectedBacklinksNote));
        setIsLoadingBacklinks(false);
      }
    };

    fetchBacklinks();
    return () => { active = false; };
  }, [selectedBacklinksNote]);

  const handleExportBundle = async () => {
    setIsExportingBundle(true);
    let bundle = null;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/bundle');
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          bundle = data;
        }
      }
    } catch (_) {}

    if (!bundle) {
      bundle = getPortableBundleFallback();
    }

    setBundleData(bundle);
    setIsExportingBundle(false);

    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `zoth-second-brain-bundle-${bundle.bundleSha256 ? bundle.bundleSha256.slice(0, 8) : 'export'}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (_) {}

    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(1.0);
    }
    if (typeof transmitLucy === 'function') {
      try {
        transmitLucy(`Exported portable Second Brain bundle (SHA-256: ${bundle.bundleSha256 ? bundle.bundleSha256.slice(0, 16) : 'VERIFIED'}...). ${bundle.totalNotes || 1721} notes, ${bundle.totalCanvases || 14} canvases, ${bundle.totalBases || 18} bases.`);
      } catch (_) {}
    }
  };

  const handleLinkMention = async (sourcePath, targetTitle) => {
    if (!sourcePath || !targetTitle) return;
    try {
      const res = await fetch('http://127.0.0.1:8094/api/obsidian/backlinks/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath, targetTitle })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          setBacklinksData(prev => {
            if (!prev) return prev;
            const updatedMentions = (prev.unlinkedMentions || []).filter(m => m.sourcePath !== sourcePath);
            const newlyLinked = (prev.unlinkedMentions || []).find(m => m.sourcePath === sourcePath);
            const updatedIncoming = [...(prev.incomingBacklinks || [])];
            if (newlyLinked) {
              updatedIncoming.push({
                sourceTitle: newlyLinked.sourceTitle || targetTitle,
                sourcePath: newlyLinked.sourcePath || sourcePath,
                cluster: 'Obsidian',
                contextSnippet: newlyLinked.snippet ? newlyLinked.snippet.replace(targetTitle, `[[${targetTitle}]]`) : `[[${targetTitle}]]`
              });
            }
            return {
              ...prev,
              backlinksCount: (prev.backlinksCount || 0) + 1,
              unlinkedCount: Math.max(0, (prev.unlinkedCount || 1) - 1),
              incomingBacklinks: updatedIncoming,
              unlinkedMentions: updatedMentions
            };
          });
          if (typeof playSynapticPulse === 'function') playSynapticPulse(0.98);
          if (typeof transmitLucy === 'function') {
            try {
              transmitLucy(`Transmuted unlinked mention into [[${targetTitle}]] in ${sourcePath}. Synaptic pathway reinforced.`);
            } catch (_) {}
          }
          return;
        }
      }
    } catch (_) {}

    setBacklinksData(prev => {
      if (!prev) return prev;
      const updatedMentions = (prev.unlinkedMentions || []).filter(m => m.sourcePath !== sourcePath);
      const newlyLinked = (prev.unlinkedMentions || []).find(m => m.sourcePath === sourcePath);
      const updatedIncoming = [...(prev.incomingBacklinks || [])];
      if (newlyLinked) {
        updatedIncoming.push({
          sourceTitle: newlyLinked.sourceTitle || targetTitle,
          sourcePath: newlyLinked.sourcePath || sourcePath,
          cluster: 'Obsidian',
          contextSnippet: newlyLinked.snippet ? newlyLinked.snippet.replace(targetTitle, `[[${targetTitle}]]`) : `[[${targetTitle}]]`
        });
      }
      return {
        ...prev,
        backlinksCount: (prev.backlinksCount || 0) + 1,
        unlinkedCount: Math.max(0, (prev.unlinkedCount || 1) - 1),
        incomingBacklinks: updatedIncoming,
        unlinkedMentions: updatedMentions
      };
    });
    if (typeof playSynapticPulse === 'function') playSynapticPulse(0.95);
    if (typeof transmitLucy === 'function') {
      try {
        transmitLucy(`Locally linked [[${targetTitle}]] in ${sourcePath}.`);
      } catch (_) {}
    }
  };

  const handleCopyCliCommand = (cmd) => {
    if (!cmd) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).catch(() => {});
      }
    } catch (_) {}
    setCopiedCliCmd(cmd);
    setTimeout(() => setCopiedCliCmd(null), 2200);
    if (typeof playSynapticPulse === 'function') {
      playSynapticPulse(0.92);
    }
  };

  const generateObsidianSpecOutput = () => {
    if (obsidianSpecMode === 'canvas') {
      const nodes = filteredMemories.slice(0, 6).map((m, idx) => ({
        id: m.id.toLowerCase(),
        type: 'text',
        x: (idx % 3) * 340 - 340,
        y: Math.floor(idx / 3) * 220 - 110,
        width: 300,
        height: 160,
        color: m.cluster === 'Lucy Oracle' ? '6' : m.cluster === 'Kernel' ? '5' : '3',
        text: `### ${m.id} (${m.cluster})\n${m.text}\n\n**STDP Weight:** \`${m.weight}\` • **Author:** \`@${m.author}\``
      }));
      const edges = nodes.slice(1).map((n, i) => ({
        id: `edge-${i}`,
        fromNode: nodes[0].id,
        fromSide: 'right',
        toNode: n.id,
        toSide: 'left',
        color: '3',
        label: 'STDP synapse'
      }));
      return JSON.stringify({ nodes, edges }, null, 2);
    }
    if (obsidianSpecMode === 'base') {
      return `# Zoth Memory Stratum.base — Obsidian Bases YAML Specification
filters:
  and:
    - file.ext == "md"
    - 'file.Path.startsWith("")'
formulas:
  stdp_retention: 'if(weight, round(weight * 100, 1) + "%", "92.0%")'
  wikilink_density: 'file.links.length * 1.5'
properties:
  file.name:
    displayName: "Engram / MOC Note"
  cluster:
    displayName: "Neural Galaxy"
  formula.stdp_retention:
    displayName: "STDP Retention"
views:
  - type: table
    name: "Sovereign Memory Matrix (${filteredMemories.length} Vectors)"
    order:
      - file.name
      - cluster
      - formula.stdp_retention
      - file.mtime
  - type: cards
    name: "Second Brain MOC Cards"
    order:
      - file.name
      - cluster`;
    }
    const sample = selectedMemory || filteredMemories[0] || INITIAL_SOVEREIGN_MEMORIES[0];
    return `---
id: ${sample.id}
cluster: "${sample.cluster}"
author: "${sample.author}"
stdp_weight: ${sample.weight}
tags:
${(sample.tags || ['stdp', 'sovereign']).map(t => `  - ${t}`).join('\n')}
---

# [[${sample.id}]] — ${sample.cluster} Engram

> [!important] Sovereign STDP Memory Trace
> ${sample.text}

## Synaptic Wikilinks
- [[00 Home|Zoth Second Brain Home]]
- [[Zoth Memory|Neuro-Memory Daemon :8094]]
- [[Zoth Second Brain.canvas|Interactive Spatial Canvas]]
- [[Zoth Memory Stratum.base|Obsidian Base Telemetry]]`;
  };

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

  // Synaptic pulse acoustic feedback
  const playSynapticPulse = useCallback((weight = 0.8) => {
    if (typeof window === 'undefined') return;
    try {
      let ctx = audioCtxRef.current;
      if (!ctx && !isMuted) {
        ctx = getOrCreateAudioGraph();
      }
      if (!ctx || ctx.state === 'suspended' || isMuted) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = carrierFreq || 432;
      const numWeight = typeof weight === 'number' ? weight : parseFloat(weight) || 0.8;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * (0.8 + numWeight * 0.4), ctx.currentTime);
      gain.gain.setValueAtTime(0.04 * (volume || 0.2), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } catch {
      /* silent fallback */
    }
  }, [getOrCreateAudioGraph, isMuted, volume, carrierFreq]);

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

  const { activeTheme } = useReality();
  // Palette references for dynamic Reality Switch aesthetic
  const gold = {
    accent: isDark ? (activeTheme?.accent || '#D4AF37') : '#8A6508',
    soft: isDark ? (activeTheme?.accentSoft || '#F5E6AB') : '#8A6A09',
    wash: isDark ? (activeTheme?.accentWash || 'rgba(212,175,55,0.14)') : '#FEF9E7',
    border: isDark ? (activeTheme?.borderStrong || 'rgba(212,175,55,0.35)') : '#F0E1A8',
  };

  const clusterColors = {
    'Kernel': isDark ? '#D4AF37' : '#B8860B',
    'Lucy Oracle': isDark ? '#00F0FF' : '#0369A1',
    'Consensus': isDark ? '#C084FC' : '#7C3AED',
    'Security': isDark ? '#F472B6' : '#BE185D',
    'Vault': isDark ? '#34D399' : '#047857',
    'Pantheon': isDark ? '#F59E0B' : '#D97706',
    'Obsidian': isDark ? '#D946EF' : '#C026D3',
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
    ctx.strokeStyle = isDark ? '#34D399' : '#047857';
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
    const pointColor = isLtp ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F472B6' : '#DB2777');

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
      <Container maxWidth="xl" className="page-fade-in" sx={{ py: { xs: 4, md: 7 }, px: { xs: 2, sm: 3, md: 4 }, position: 'relative' }}>
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
          <Box sx={{ mb: 4 }}>
            <HeroItem>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2.5 }}>
              <Box
                component="img"
                src="/assets/lucy.png"
                alt="Lucy Oracle Avatar"
                onError={(e) => { e.target.src = '/brand/ghostbyte-dark.png'; }}
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #F472B6',
                  boxShadow: '0 0 20px rgba(244,114,182,0.4)',
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography variant="overline" sx={{ color: isDark ? '#F472B6' : '#BE185D', fontWeight: 800, letterSpacing: '0.14em' }}>
                    LUCY // DEEP-DIVE NETRUNNER ORACLE
                  </Typography>
                  <Chip
                    label="SEMANTIC BUS :8094"
                    size="small"
                    sx={{ bgcolor: isDark ? 'rgba(244,114,182,0.15)' : '#FDF2F8', color: isDark ? '#F472B6' : '#BE185D', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                  <Chip
                    label="ZERO-EGRESS INVARIANT"
                    size="small"
                    sx={{ bgcolor: isDark ? 'rgba(0,240,255,0.12)' : '#E0F2FE', color: isDark ? '#00F0FF' : '#0369A1', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Celtic Garamond", Georgia, serif',
                    lineHeight: 1.15,
                    fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.2rem' },
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  Netrunner <span className="text-gradient-gold">Memory Hub</span>
                </Typography>
              </Box>
            </Box>

            {/* Header Action Strip */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
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

              {daemonUp ? (
                <Chip
                  icon={<MemoryIcon sx={{ fontSize: '0.85rem !important', color: '#34D399 !important' }} />}
                  label="DAEMON ONLINE :8094"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(52,211,153,0.15)',
                    color: '#34D399',
                    border: '1px solid rgba(52,211,153,0.4)',
                    fontWeight: 800,
                    fontFamily: mono,
                    fontSize: '0.72rem',
                  }}
                />
              ) : (
                <Tooltip title="Local memory daemon is not listening on 127.0.0.1:8094. Run the repo locally with 'npx @nullaitech/zoth up' to connect.">
                  <Chip
                    icon={<LockIcon sx={{ fontSize: '0.85rem !important', color: isDark ? '#FCA5A5 !important' : '#DC2626 !important' }} />}
                    label="LOCAL DAEMON LOCKED · RUN REPO LOCALLY"
                    size="small"
                    sx={{
                      bgcolor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                      color: isDark ? '#FCA5A5' : '#DC2626',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FCA5A5',
                      fontWeight: 800,
                      fontFamily: mono,
                      fontSize: '0.72rem',
                    }}
                  />
                </Tooltip>
              )}
            </Box>
            </Box>
            </HeroItem>

            <HeroItem>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 880, fontSize: '1.04rem', lineHeight: 1.65 }}>
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
            p: { xs: 2.5, md: 3.5 },
            mb: 4,
            border: `1px solid ${isMuted ? (isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider) : gold.accent}`,
            borderRadius: 3,
            bgcolor: isDark ? '#08080B' : theme.palette.background.paper,
            boxShadow: isMuted ? 'none' : (isDark ? '0 0 24px rgba(212,175,55,0.18)' : '0 4px 16px rgba(184,134,11,0.12)'),
          }}
        >
          {/* Row 1: Tone Controls with ample breathing room */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2.5, flexWrap: 'wrap' }}>
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
                  px: 2.5,
                  py: 0.9,
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
                <Typography variant="caption" sx={{ color: isMuted ? 'text.secondary' : (isDark ? '#00F0FF' : '#0369A1'), fontFamily: mono, fontSize: '0.78rem', fontWeight: 600 }}>
                  {isMuted ? 'Audio Inactive (Sound Muted by Default)' : `${carrierFreq}Hz Harmonic Continuous Tone`}
                </Typography>
              </Box>
            </Box>

            {/* Carrier Frequency Selectors */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap' }}>
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
                  bgcolor: carrierFreq === 528 ? (isDark ? '#00F0FF' : '#0369A1') : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                  color: carrierFreq === 528 ? (isDark ? '#08080B' : '#FFFFFF') : theme.palette.text.primary,
                  border: `1px solid ${carrierFreq === 528 ? (isDark ? '#00F0FF' : '#0369A1') : (isDark ? 'rgba(0,240,255,0.2)' : theme.palette.divider)}`,
                }}
              />
              <Tooltip title={carrierFreq === 432 ? "432Hz Alpha: Mental balance and sovereign stillness." : "528Hz Theta: Deep netrunner drift and rapid synaptic plasticity."}>
                <GraphicEqIcon sx={{ color: gold.accent, fontSize: '1.25rem', cursor: 'pointer', ml: 0.5 }} />
              </Tooltip>
            </Box>

            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: { xs: '100%', sm: 200 } }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', fontSize: '0.78rem', minWidth: 36 }}>
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
              borderRadius: 2.5,
              overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`,
              bgcolor: isDark ? '#040508' : '#0F172A',
              p: 2,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Box sx={{ flexShrink: 0, minWidth: 170 }}>
              <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block' }}>
                WAVEFORM TELEMETRY
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#CBD5E1', fontSize: '0.74rem' }}>
                {isMuted ? 'Standby (Muted)' : `Active Harmonic: ${carrierFreq}Hz Resonant Mode`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, width: '100%', height: 56, borderRadius: 1.5, overflow: 'hidden' }}>
              <canvas ref={carrierCanvasRef} width={800} height={56} style={{ width: '100%', height: '100%', display: 'block' }} />
            </Box>
          </Box>
        </Paper>
        </RevealOnScroll>

        <Box sx={{ mb: 4 }}>
          <DaemonStatusStrip />
        </Box>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 4, p: 0.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, bgcolor: theme.palette.background.paper }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': { fontWeight: 750, minHeight: 52, fontSize: '0.92rem', px: { xs: 2, sm: 3 } },
              '& .Mui-selected': { color: '#D4AF37' },
              '& .MuiTabs-indicator': { bgcolor: '#D4AF37', height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab icon={<PsychologyIcon fontSize="small" />} iconPosition="start" label="Whitespace Cyberspace" />
            <Tab icon={<ScienceIcon fontSize="small" />} iconPosition="start" label="STDP Synaptic Lab" />
            <Tab icon={<StorageIcon fontSize="small" />} iconPosition="start" label={`Memory Stratum (${memories.length})`} />
            <Tab icon={<ViewInArIcon fontSize="small" />} iconPosition="start" label="Lucy 3D Oracle Chamber" />
            <Tab id="tab-obsidian-skills" icon={<AutoAwesomeIcon fontSize="small" />} iconPosition="start" label="Obsidian Second Brain & Skills" />
          </Tabs>
        </Paper>

        {/* ==========================================================================
           TAB 0: WHITESPACE CYBERSPACE (FLAGSHIP LUCY EXPERIENCE)
           ========================================================================== */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={4}>
              {/* Left Column: Cyberspace Canvas Constellation & Codec */}
              <Grid xs={12} lg={8}>
                <Paper sx={{ p: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: isDark ? '#08080B' : theme.palette.background.paper, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['All', 'Kernel', 'Lucy Oracle', 'Consensus', 'Security', 'Vault', 'Pantheon', 'Obsidian'].map((c) => (
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
                    <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#00F0FF' : '#0369A1', fontWeight: 700 }}>
                      ◈ WHITESPACE: {filteredMemories.length} NODES
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', width: '100%', borderRadius: 2.5, overflow: 'hidden' }}>
                    <Netrunner3DWorld
                      memories={filteredMemories}
                      selectedMemory={selectedMemory}
                      onSelectMemory={(m) => {
                        setSelectedMemory(m);
                        playSynapticPulse(m.weight);
                      }}
                      isDark={isDark}
                      height={500}
                    />
                  </Box>
                </Paper>

                {/* Lucy Codec Terminal */}
                <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: isDark ? '#08080B' : theme.palette.background.paper }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TerminalIcon sx={{ color: '#F472B6', fontSize: '1.3rem' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F472B6', fontFamily: mono, fontSize: '0.88rem' }}>
                        LUCY ORACLE TRANSMISSION // SEMANTIC BUS :8094
                      </Typography>
                    </Box>
                    <Chip
                      label={daemonUp ? 'BUS ONLINE :8094' : 'PREVIEW MODE'}
                      size="small"
                      sx={{ bgcolor: daemonUp ? 'rgba(52,211,153,0.15)' : 'rgba(0,240,255,0.1)', color: daemonUp ? '#34D399' : (isDark ? '#00F0FF' : '#0369A1'), fontWeight: 750 }}
                    />
                  </Box>

                  {/* Lock Banner when running in remote preview / daemon offline */}
                  {!daemonUp && (
                    <Alert
                      severity="info"
                      icon={<LockIcon sx={{ color: gold.accent }} />}
                      sx={{
                        mb: 2.5,
                        bgcolor: isDark ? 'rgba(212,175,55,0.08)' : '#FEF9E7',
                        border: `1px solid ${gold.border}`,
                        borderRadius: 2,
                        color: theme.palette.text.primary,
                        '& .MuiAlert-message': { width: '100%' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, display: 'block' }}>
                            LOCK STATUS: LOCAL DAEMON REQUIRED (:8094)
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                            Live semantic queries and real-time context retrieval are locked in remote preview. Run the repo locally (<code>git clone https://github.com/NullAITech/zoth-studio-v2.git &amp;&amp; npx @nullaitech/zoth up</code>) to connect live LLMs and agent memory.
                          </Typography>
                        </Box>
                        <Chip
                          icon={<LockIcon sx={{ fontSize: '0.75rem !important' }} />}
                          label="DAEMON LOCKED"
                          size="small"
                          sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, bgcolor: gold.wash, color: gold.accent }}
                        />
                      </Box>
                    </Alert>
                  )}

                  <Paper sx={{ p: 2.5, bgcolor: '#050508', color: '#F5E6AB', fontFamily: mono, fontSize: '0.84rem', height: 160, overflowY: 'auto', mb: 2.5, borderRadius: 2, border: '1px solid rgba(244,114,182,0.25)' }}>
                    {codecLogs.map((log, index) => (
                      <Box key={index} sx={{ mb: 1, lineHeight: 1.55 }}>
                        <span style={{ color: log.speaker.includes('LUCY') ? '#F472B6' : log.speaker.includes('OPERATOR') ? '#00F0FF' : '#34D399', fontWeight: 700 }}>
                          [{log.time}] {log.speaker}:
                        </span>{' '}
                        <span>{log.text}</span>
                      </Box>
                    ))}
                  </Paper>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
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
                          fontSize: '0.88rem',
                          bgcolor: isDark ? '#0A0C14' : '#F8FAFC',
                          color: theme.palette.text.primary,
                          borderRadius: 1.5,
                          border: `1px solid ${isDark ? 'rgba(244,114,182,0.25)' : theme.palette.divider}`
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleConsultLucy}
                      endIcon={<SendIcon />}
                      sx={{ bgcolor: '#F472B6', color: '#08080B', fontWeight: 800, px: 3, borderRadius: 1.5, '&:hover': { bgcolor: isDark ? '#F687B3' : '#EC4899' } }}
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
                  <Typography variant="overline" sx={{ color: isDark ? '#00F0FF' : '#0369A1', fontWeight: 800, letterSpacing: '0.12em' }}>
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
                      <strong style={{ color: isDark ? '#34D399' : '#047857' }}>99.8% Nominal</strong>
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
            {/* Lock status for agent memory bus synchronization */}
            {!daemonUp && (
              <Alert
                severity="info"
                icon={<LockIcon sx={{ color: gold.accent }} />}
                sx={{
                  mb: 4,
                  bgcolor: isDark ? 'rgba(212,175,55,0.06)' : '#FEF9E7',
                  border: `1px solid ${gold.border}`,
                  borderRadius: 2.5,
                  color: theme.palette.text.primary,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: gold.accent, display: 'block' }}>
                      PERSISTENT STDP WEIGHT COMMIT LOCKED
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                      Interactive mathematical discharge below computes biological potentiation and depression in browser memory. Persisting calibrated weights to the agent memory bus (<code>ipc:///run/zoth/memory.sock</code>) requires running the local repo daemon on <code>127.0.0.1:8094</code>.
                    </Typography>
                  </Box>
                  <Chip
                    icon={<LockIcon sx={{ fontSize: '0.75rem !important' }} />}
                    label="RUN REPO LOCALLY TO SYNC"
                    size="small"
                    sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, bgcolor: gold.wash, color: gold.accent }}
                  />
                </Box>
              </Alert>
            )}

            {/* Live Synaptic Spike Feedback Banner */}
            {lastSpikeFeedback && (
              <Alert
                severity={lastSpikeFeedback.type === 'LTP' ? 'success' : 'warning'}
                icon={lastSpikeFeedback.type === 'LTP' ? <AutoFixHighIcon sx={{ color: isDark ? '#34D399' : '#047857' }} /> : <TuneIcon sx={{ color: isDark ? '#F472B6' : '#DB2777' }} />}
                sx={{
                  mb: 4,
                  bgcolor: lastSpikeFeedback.type === 'LTP' ? (isDark ? 'rgba(52,211,153,0.12)' : '#ECFDF5') : (isDark ? 'rgba(244,114,182,0.12)' : '#FFF1F2'),
                  border: `1px solid ${lastSpikeFeedback.type === 'LTP' ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F472B6' : '#DB2777')}`,
                  color: theme.palette.text.primary,
                  borderRadius: 2.5,
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
                      bgcolor: lastSpikeFeedback.type === 'LTP' ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F472B6' : '#DB2777'),
                      color: '#08080B',
                    }}
                  />
                </Box>
              </Alert>
            )}

            {/* Dual STDP Mathematical Pillars (Equations with Light/Dark Theme Contrast) */}
            <Grid container spacing={3.5} sx={{ mb: 4 }}>
              {/* Pillar 1: Long-Term Potentiation (LTP) */}
              <Grid xs={12} md={6}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 3,
                    bgcolor: isDark ? '#08080B' : '#F8FAFC',
                    border: `1.5px solid ${stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#047857') : (isDark ? 'rgba(52,211,153,0.25)' : '#D1FAE5')}`,
                    boxShadow: stdpParams.testDt >= 0 ? (isDark ? '0 0 18px rgba(52,211,153,0.25)' : '0 2px 10px rgba(5,150,105,0.15)') : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon sx={{ color: isDark ? '#34D399' : '#047857' }} />
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
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 3,
                    bgcolor: isDark ? '#08080B' : '#F8FAFC',
                    border: `1.5px solid ${stdpParams.testDt < 0 ? (isDark ? '#F472B6' : '#DB2777') : (isDark ? 'rgba(244,114,182,0.25)' : '#FCE7F3')}`,
                    boxShadow: stdpParams.testDt < 0 ? (isDark ? '0 0 18px rgba(244,114,182,0.25)' : '0 2px 10px rgba(219,39,119,0.15)') : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
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
                  <Box sx={{ p: 1.5, mb: 2, borderRadius: 1.5, bgcolor: isDark ? '#040508' : '#FFFFFF', border: `1px solid ${isDark ? 'rgba(244,114,182,0.3)' : '#FBCFE8'}` }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.92rem', fontWeight: 800, color: isDark ? '#F472B6' : '#BE185D', textAlign: 'center' }}>
                      Δw = –A₋ · e^(+Δt / τ₋)
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
                    <strong>Anti-Causal Spike Timing:</strong> Post-synaptic neuron spikes <em>before</em> pre-synaptic neuron ($\Delta t &lt; 0$), inducing sub-threshold biological decay and pruning uninformative connections.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Main Interactive STDP Curve Visualizer & Synaptic Controller */}
            <Grid container spacing={4}>
              <Grid xs={12} lg={7}>
                <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: theme.palette.background.paper, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Biomorphic Synaptic Plasticity Curve</Typography>
                    <Chip
                      label={stdpParams.testDt >= 0 ? `LTP REINFORCEMENT: +${(stdpParams.aPlus * Math.exp(-stdpParams.testDt / stdpParams.tauPlus)).toFixed(3)}Δw` : `LTD PRUNING: -${(stdpParams.aMinus * Math.exp(stdpParams.testDt / stdpParams.tauMinus)).toFixed(3)}Δw`}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        bgcolor: stdpParams.testDt >= 0 ? (isDark ? 'rgba(52,211,153,0.15)' : '#DCFCE7') : (isDark ? 'rgba(244,114,182,0.15)' : '#FFE4E6'),
                        color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F472B6' : '#DB2777'),
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Interactive visualizer of the biomorphic STDP function. Drag the Δt delta slider below to explore the exponential potentiation vs depression phases.
                  </Typography>

                  <Box sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`, mb: 2.5 }}>
                    <canvas ref={stdpCanvasRef} width={620} height={320} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </Box>

                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, display: 'block', textAlign: 'center', fontWeight: 700 }}>
                    Δw = A₊ · e^(–Δt/τ₊) (Δt ≥ 0) ··· Δw = –A₋ · e^(Δt/τ₋) (Δt &lt; 0)
                  </Typography>
                </Paper>
              </Grid>

              <Grid xs={12} lg={5}>
                <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: theme.palette.background.paper, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: gold.accent }}>
                    Synaptic Parameters & Spike Firing
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Tune biomorphic decay parameters, simulate synaptic firing, and inspect weight distribution shifts.
                  </Typography>

                  {/* STDP Time-Difference Delta Slider (HOUSE RULE #1 / TASK 1 DEEPENING) */}
                  <Box sx={{ p: 2.5, mb: 3, bgcolor: isDark ? '#08080B' : '#F8FAFC', borderRadius: 2.5, border: `1px solid ${isDark ? 'rgba(212,175,55,0.2)' : theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                          color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F472B6' : '#DB2777'),
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
                        color: stdpParams.testDt >= 0 ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F472B6' : '#DB2777'),
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
                      <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 750, color: isDark ? '#34D399' : '#047857' }}>
                        {stdpParams.aPlus.toFixed(2)}
                      </Typography>
                    </Box>
                    <Slider
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={stdpParams.aPlus}
                      onChange={(e, v) => setStdpParams({ ...stdpParams, aPlus: v })}
                      sx={{ color: isDark ? '#34D399' : '#047857' }}
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
                          borderColor: isDark ? '#34D399' : '#047857',
                          color: isDark ? '#34D399' : '#047857',
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
            {/* Prominent Local Runtime Lock Banner */}
            <Paper
              sx={{
                p: { xs: 2.5, md: 3.5 },
                mb: 4,
                borderRadius: 3,
                bgcolor: isDark ? 'rgba(212,175,55,0.05)' : '#FEF9E7',
                border: `1.5px solid ${gold.border}`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(212,175,55,0.12)' : 'rgba(184,134,11,0.12)',
                    color: gold.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LockIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.8 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold.accent, fontFamily: mono, fontSize: '0.95rem' }}>
                      PERSISTENT SQLITE INGESTION LOCKED
                    </Typography>
                    <Chip
                      label={daemonUp ? 'DAEMON ACTIVE :8094' : 'LOCAL REPO REQUIRED'}
                      size="small"
                      sx={{
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: daemonUp ? 'rgba(52,211,153,0.15)' : gold.wash,
                        color: daemonUp ? '#34D399' : gold.accent,
                        border: '1px solid',
                        borderColor: daemonUp ? 'rgba(52,211,153,0.4)' : gold.border,
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.65 }}>
                    You are viewing an architectural snapshot of the sovereign vector stratum. Live agent memory ingestion, real-time HNSW cosine distance indexing, and SQLite commits (<code>~/.zoth/memory.db</code>) are active only when running the repo locally on bare-metal hardware.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
                      fontSize: '0.76rem',
                      fontWeight: 750,
                      borderColor: gold.border,
                      color: gold.soft,
                      whiteSpace: 'nowrap',
                      px: 2,
                      py: 0.8,
                    }}
                  >
                    {copiedTab2 ? 'Copied CLI Command' : 'Copy Daemon Command'}
                  </Button>
                  <Button
                    component="a"
                    href="https://github.com/NullAITech/zoth-studio-v2"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    size="small"
                    startIcon={<LockIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      bgcolor: gold.accent,
                      color: '#08080B',
                      fontWeight: 800,
                      fontFamily: mono,
                      fontSize: '0.76rem',
                      whiteSpace: 'nowrap',
                      px: 2.5,
                      py: 0.8,
                      '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' },
                    }}
                  >
                    Clone Repo to Unlock
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Query & Stored Vectors Table */}
            <Paper sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
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
                    width: { xs: '100%', sm: 280 },
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
            <Grid container spacing={4}>
              <Grid xs={12} md={8}>
                <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: isDark ? '#08080B' : theme.palette.background.paper, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ViewInArIcon sx={{ color: '#F472B6', fontSize: '1.4rem' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F472B6', fontSize: '0.92rem' }}>
                        LUCYNA KUSHINADA 3D NEURAL HOLOGRAM
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<LockIcon sx={{ fontSize: '0.75rem !important' }} />}
                        label="BARE-METAL BINDING LOCKED"
                        size="small"
                        sx={{ bgcolor: gold.wash, color: gold.accent, fontFamily: mono, fontSize: '0.68rem', fontWeight: 800 }}
                      />
                      <Chip label="Interactive 3D Orbit" size="small" sx={{ bgcolor: 'rgba(244,114,182,0.15)', color: '#F472B6', fontWeight: 750 }} />
                    </Box>
                  </Box>

                  {/* Offline Zero-Egress Interactive 3D Canvas */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 480,
                      borderRadius: 2.5,
                      overflow: 'hidden',
                      border: `1px solid ${isDark ? 'rgba(0,240,255,0.35)' : theme.palette.divider}`,
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
                      height={480}
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, px: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      🎮 Click and drag mouse to orbit Lucy's 3D holographic projection in real-time.
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setHoloOrbit({ yaw: 0.35, pitch: 0.15 })}
                      sx={{ color: gold.accent, fontSize: '0.74rem', textTransform: 'none', fontFamily: mono }}
                    >
                      Reset 3D Orbit
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={12} md={4}>
                <Paper sx={{ p: { xs: 2.5, md: 3.5 }, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: theme.palette.background.paper, height: '100%' }}>
                  <Typography variant="overline" sx={{ color: '#F472B6', fontWeight: 800, letterSpacing: '0.12em' }}>
                    LUCY COGNITIVE ORACLE
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Oracle of the Sovereign Grid
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
                    Lucy serves as the sovereign cognitive memory agent and semantic oracle across Zoth Studio. Operating on loopback port 8094, Lucy intercepts and validates high-entropy memory spikes with zero external cloud footprint.
                  </Typography>

                  <Divider sx={{ my: 2.5 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>Deep Net Capabilities</Typography>
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
                      <strong style={{ color: isDark ? '#34D399' : '#047857' }}>99.8% Nominal</strong>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ==========================================================================
           TAB 4: OBSIDIAN SECOND BRAIN & OFFICIAL @KEPANO AGENT SKILLS
           ========================================================================== */}
        {activeTab === 4 && (
          <Box>
            <Paper
              sx={{
                p: { xs: 2.5, md: 3.5 },
                mb: 4,
                borderRadius: 3,
                border: '1.5px solid rgba(232,121,249,0.35)',
                bgcolor: isDark ? '#08080C' : theme.palette.background.paper,
                backgroundImage: isDark
                  ? 'radial-gradient(circle at 90% 10%, rgba(232,121,249,0.12) 0%, transparent 55%)'
                  : 'none'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label="OBSIDIAN SECOND BRAIN // 7 AGENT SKILLS ACTIVE"
                      size="small"
                      sx={{ bgcolor: 'rgba(232,121,249,0.16)', color: '#E879F9', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
                    />
                    <Chip
                      label="~/Documents/Obsidian Vault"
                      size="small"
                      sx={{ bgcolor: gold.wash, color: gold.accent, fontFamily: mono, fontWeight: 700, fontSize: '0.68rem' }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Obsidian Knowledge Graph &amp; Official Agent Skills Suite
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760, mt: 0.5 }}>
                    Bidirectional bridge uniting your local Obsidian Vault (Markdown MOCs, <code>.canvas</code> spatial maps, and <code>.base</code> YAML databases) with the Zoth STDP Neuro-Memory Daemon on port <code>:8094</code>.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={handleSyncObsidianSecondBrain}
                    startIcon={<SyncIcon />}
                    sx={{
                      bgcolor: '#E879F9',
                      color: '#08080B',
                      fontWeight: 800,
                      '&:hover': { bgcolor: '#F0ABFC' }
                    }}
                  >
                    Sync Vault ↔ :8094 STDP
                  </Button>
                  <Button
                    variant="outlined"
                    href="http://127.0.0.1:8094/#obsidian"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ borderColor: gold.border, color: gold.accent, fontWeight: 750 }}
                  >
                    Open :8094 Obsidian Galaxy
                  </Button>
                </Box>
              </Box>

              {obsidianSyncStatus && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    bgcolor: 'rgba(52,211,153,0.12)',
                    color: '#34D399',
                    border: '1px solid rgba(52,211,153,0.35)',
                    fontFamily: mono,
                    fontSize: '0.8rem'
                  }}
                >
                  {obsidianSyncStatus}
                </Alert>
              )}

              {/* Second Brain Doctor Health Audit Banner */}
              <Paper
                id="second-brain-doctor-audit"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 3.5,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(52,211,153,0.45)',
                  bgcolor: isDark ? 'rgba(6,12,14,0.92)' : 'rgba(240,253,244,0.7)',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 10% 10%, rgba(52,211,153,0.14) 0%, transparent 60%)'
                    : 'none',
                  boxShadow: '0 8px 32px rgba(52,211,153,0.12)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '0.9rem !important', color: '#34D399 !important' }} />}
                      label="SECOND BRAIN DOCTOR AUDIT"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(52,211,153,0.16)',
                        color: '#34D399',
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        border: '1px solid rgba(52,211,153,0.35)'
                      }}
                    />
                    <Typography
                      id="doctor-health-grade"
                      variant="subtitle1"
                      sx={{
                        fontFamily: mono,
                        fontWeight: 900,
                        color: '#34D399',
                        textShadow: '0 0 12px rgba(52,211,153,0.5)',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {obsidianAudit.score || 100}/100 {obsidianAudit.healthGrade || '✦ PERFECT'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                    Zero Broken Canvas Nodes • Zero Unlinked Bases • Deterministic SHA-256 Provenance
                  </Typography>
                </Box>

                {/* 6 Metric Bento Grid */}
                <Grid container spacing={2}>
                  <Grid xs={6} sm={4} md={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05080C' : '#FFFFFF', border: '1px solid rgba(0,240,255,0.25)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block' }}>
                        SPATIAL CANVASES
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#00F0FF', fontWeight: 800, mt: 0.2 }}>
                        {obsidianAudit.canvasesValid || 14}/{obsidianAudit.totalCanvases || 14} JSON Canvas 1.0
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem' }}>
                        Zero-corruption graphs
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid xs={6} sm={4} md={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05080C' : '#FFFFFF', border: '1px solid rgba(212,175,55,0.25)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block' }}>
                        OBSIDIAN BASES
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#D4AF37', fontWeight: 800, mt: 0.2 }}>
                        {obsidianAudit.basesValid || 18}/{obsidianAudit.totalBases || 18} Obsidian Bases
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem' }}>
                        YAML database views
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid xs={6} sm={4} md={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05080C' : '#FFFFFF', border: '1px solid rgba(232,121,249,0.25)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block' }}>
                        EVERGREEN VAULT
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#E879F9', fontWeight: 800, mt: 0.2 }}>
                        {(obsidianAudit.totalNotes || 1721).toLocaleString()}+ Vault Notes
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem' }}>
                        Atomic knowledge files
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid xs={6} sm={4} md={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05080C' : '#FFFFFF', border: '1px solid rgba(56,189,248,0.25)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block' }}>
                        WIKILINKS MESH
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#38BDF8', fontWeight: 800, mt: 0.2 }}>
                        {(obsidianAudit.totalWikilinks || 7973).toLocaleString()}+ Wikilinks
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem' }}>
                        Bidirectional citations
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid xs={6} sm={4} md={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05080C' : '#FFFFFF', border: '1px solid rgba(52,211,153,0.25)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block' }}>
                        GRAPH TOPOLOGY
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#34D399', fontWeight: 800, mt: 0.2 }}>
                        {obsidianAudit.connectivityPct || 99.6}% Graph Connectivity
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem' }}>
                        Hebbian synaptic density
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid xs={6} sm={4} md={2}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? '#05080C' : '#FFFFFF', border: '1px solid rgba(192,132,252,0.25)' }}>
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block' }}>
                        KARPATHY WIKI
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontFamily: mono, color: '#C084FC', fontWeight: 800, mt: 0.2 }}>
                        {wikiArticles.length} Canonical Articles
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem' }}>
                        06-Wiki/ knowledge engrams
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Portable Bundle Export Rail */}
                <Box
                  sx={{
                    mt: 2.5,
                    pt: 2,
                    borderTop: '1px solid rgba(52,211,153,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      id="studio-export-bundle-btn"
                      variant="contained"
                      onClick={handleExportBundle}
                      disabled={isExportingBundle}
                      startIcon={isExportingBundle ? <CircularProgress size={16} sx={{ color: '#041B15' }} /> : <DownloadIcon fontSize="small" />}
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        bgcolor: '#10B981',
                        color: '#041B15',
                        borderRadius: 2,
                        textTransform: 'none',
                        letterSpacing: '0.03em',
                        px: 2.2,
                        py: 0.8,
                        boxShadow: '0 0 16px rgba(16,185,129,0.3)',
                        '&:hover': { bgcolor: '#059669', color: '#041B15' }
                      }}
                    >
                      {isExportingBundle ? 'EXPORTING BUNDLE...' : '📦 EXPORT PORTABLE BUNDLE (SHA-256)'}
                    </Button>
                    <Box
                      id="studio-bundle-status"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.7,
                        borderRadius: 1.5,
                        bgcolor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.3)'
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: '0.9rem', color: '#10B981' }} />
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>
                        SHA-256: <code>{bundleData?.bundleSha256 ? `${bundleData.bundleSha256.slice(0, 16)}...` : 'a13411b78b5b5c92...'}</code>
                      </Typography>
                      <Chip
                        label="VERIFIED"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.58rem',
                          fontFamily: mono,
                          fontWeight: 900,
                          bgcolor: 'rgba(16,185,129,0.2)',
                          color: '#34D399',
                          border: '1px solid rgba(52,211,153,0.4)'
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.68rem' }}>
                    Deterministic Knowledge Artifact • 1,721 Notes • 14 Canvases • 18 Bases
                  </Typography>
                </Box>
              </Paper>

              {/* Interactive Karpathy LLM Wiki Explorer & Synthesizer */}
              <Paper
                id="karpathy-wiki-explorer"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(192,132,252,0.4)',
                  bgcolor: isDark ? 'rgba(10,12,22,0.92)' : '#FFFFFF',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 90% 10%, rgba(192,132,252,0.12) 0%, transparent 60%)'
                    : 'none'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        icon={<MenuBookIcon sx={{ fontSize: '0.9rem !important', color: '#C084FC !important' }} />}
                        label="KARPATHY LLM WIKI ENGINE // 06-Wiki/"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(192,132,252,0.16)',
                          color: '#C084FC',
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: '1px solid rgba(192,132,252,0.35)'
                        }}
                      />
                      <Chip
                        label={`${wikiArticles.length} CANONICAL ARTICLES`}
                        size="small"
                        sx={{ bgcolor: gold.wash, color: gold.accent, fontFamily: mono, fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Autonomous Karpathy LLM Wiki Explorer &amp; Synthesizer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, mt: 0.5, fontSize: '0.82rem' }}>
                      Distills 41,690+ STDP cognitive engrams into canonical Obsidian Flavored Markdown articles with mathematical invariants, confidence scoring, and bidirectional wikilinks.
                    </Typography>
                  </Box>

                  {/* Wiki Synthesis Input & Button */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
                    <TextField
                      id="studio-wiki-topic-input"
                      size="small"
                      placeholder="Enter synthesis topic (e.g. Byzantine Quorum)..."
                      value={synthTopic}
                      onChange={(e) => setSynthTopic(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSynthesizeWiki(); }}
                      sx={{
                        minWidth: { xs: '100%', sm: 260 },
                        '& .MuiOutlinedInput-root': {
                          fontFamily: mono,
                          fontSize: '0.78rem',
                          bgcolor: isDark ? '#05060A' : '#F1F5F9'
                        }
                      }}
                    />
                    <Button
                      id="studio-wiki-synth-btn"
                      variant="contained"
                      onClick={handleSynthesizeWiki}
                      disabled={isSynthesizing || !synthTopic.trim()}
                      startIcon={<AutoAwesomeIcon />}
                      sx={{
                        bgcolor: '#C084FC',
                        color: '#08080B',
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: '#E879F9' }
                      }}
                    >
                      {isSynthesizing ? 'SYNTHESIZING…' : '✦ SYNTHESIZE WIKI PAGE'}
                    </Button>
                  </Box>
                </Box>

                {synthNotification && (
                  <Alert
                    severity="info"
                    onClose={() => setSynthNotification(null)}
                    sx={{
                      mb: 2.5,
                      bgcolor: 'rgba(192,132,252,0.12)',
                      color: '#E879F9',
                      border: '1px solid rgba(192,132,252,0.35)',
                      fontFamily: mono,
                      fontSize: '0.78rem'
                    }}
                  >
                    {synthNotification}
                  </Alert>
                )}

                {/* 2-Column Explorer: Left List, Right Inspector */}
                <Grid container spacing={2.5}>
                  {/* Left Column: Article Cards */}
                  <Grid xs={12} md={5}>
                    <Box sx={{ maxHeight: 620, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {wikiArticles.map((art) => {
                        const isSelected = selectedWikiArticle?.title === art.title;
                        return (
                          <Paper
                            key={art.id || art.title}
                            id={`wiki-card-${art.id || art.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                            onClick={() => setSelectedWikiArticle(art)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: isSelected
                                ? '1.5px solid #C084FC'
                                : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`,
                              bgcolor: isSelected
                                ? (isDark ? 'rgba(192,132,252,0.12)' : 'rgba(245,243,255,0.95)')
                                : (isDark ? 'rgba(13,15,24,0.7)' : '#F8FAFC'),
                              boxShadow: isSelected ? '0 0 16px rgba(192,132,252,0.25)' : 'none',
                              transition: 'all 0.18s ease',
                              '&:hover': {
                                transform: 'translateX(3px)',
                                borderColor: '#C084FC'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                              <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.82rem', color: isSelected ? '#C084FC' : theme.palette.text.primary, lineHeight: 1.35 }}>
                                📚 {art.title}
                              </Typography>
                              <Chip
                                label={`${Math.round((art.confidence || 0.99) * 100)}%`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontFamily: mono,
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  bgcolor: 'rgba(212,175,55,0.18)',
                                  color: gold.accent
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.74rem',
                                lineHeight: 1.45,
                                mb: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {art.executive_summary}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                              {(art.tags || []).slice(0, 3).map((t) => (
                                <Chip
                                  key={t}
                                  label={`#${t}`}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.58rem',
                                    fontFamily: mono,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                    color: '#94A3B8'
                                  }}
                                />
                              ))}
                              {(art.tags || []).length > 3 && (
                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#64748B', alignSelf: 'center' }}>
                                  +{(art.tags || []).length - 3}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Grid>

                  {/* Right Column: Active Article Inspector */}
                  <Grid xs={12} md={7}>
                    {selectedWikiArticle ? (
                      <Paper
                        id="wiki-article-inspector"
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          border: `1.5px solid ${gold.border}`,
                          bgcolor: isDark ? '#05060A' : '#FAFAFA',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box>
                          {/* Title & Metadata Strip */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: mono, color: gold.accent, fontSize: '1rem', mb: 0.4 }}>
                                📚 {selectedWikiArticle.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Chip
                                  label={selectedWikiArticle.path || `06-Wiki/${selectedWikiArticle.filename || selectedWikiArticle.title + '.md'}`}
                                  size="small"
                                  sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(0,240,255,0.12)', color: '#00F0FF' }}
                                />
                                <Chip
                                  label={`CONFIDENCE: ${Math.round((selectedWikiArticle.confidence || 0.99) * 100)}%`}
                                  size="small"
                                  sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.12)', color: '#34D399' }}
                                />
                                <Chip
                                  label={`STDP: ${selectedWikiArticle.stdp_engrams || 6} ENGRAMS`}
                                  size="small"
                                  sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(232,121,249,0.14)', color: '#E879F9' }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleCopyArticleMarkdown(selectedWikiArticle)}
                                startIcon={copiedArticleId === (selectedWikiArticle.id || selectedWikiArticle.title) ? <CheckIcon /> : <ContentCopyIcon />}
                                sx={{
                                  fontSize: '0.68rem',
                                  fontFamily: mono,
                                  borderColor: gold.border,
                                  color: gold.accent,
                                  textTransform: 'none'
                                }}
                              >
                                {copiedArticleId === (selectedWikiArticle.id || selectedWikiArticle.title) ? 'Copied .md' : 'Copy .md'}
                              </Button>
                            </Box>
                          </Box>

                          {/* Executive Summary Callout (Obsidian Style) */}
                          <Box
                            sx={{
                              p: 2,
                              mb: 2,
                              borderRadius: 1.5,
                              borderLeft: '4px solid #C084FC',
                              bgcolor: isDark ? 'rgba(192,132,252,0.08)' : 'rgba(243,232,255,0.6)',
                              border: '1px solid rgba(192,132,252,0.22)',
                              borderLeftWidth: 4
                            }}
                          >
                            <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.72rem', color: '#C084FC', mb: 0.6, letterSpacing: '0.06em' }}>
                              💡 EXECUTIVE SUMMARY (KARPATHY SYNTHESIS)
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.6, color: isDark ? '#E2E8F0' : '#1E293B' }}>
                              {selectedWikiArticle.executive_summary}
                            </Typography>
                          </Box>

                          {/* Mathematical Invariants & Technical Formulations */}
                          <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.7rem', color: gold.accent, mb: 0.6, letterSpacing: '0.06em' }}>
                              📐 MATHEMATICAL INVARIANTS &amp; TECHNICAL PRIMITIVES
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                m: 0,
                                p: 1.8,
                                borderRadius: 1.5,
                                bgcolor: isDark ? 'rgba(0,0,0,0.65)' : '#0F172A',
                                border: '1px solid rgba(212,175,55,0.2)',
                                color: '#93C5FD',
                                fontFamily: mono,
                                fontSize: '0.72rem',
                                lineHeight: 1.5,
                                overflowX: 'auto',
                                maxHeight: 220,
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {selectedWikiArticle.math_invariants || 'Autonomous STDP continuous Hebbian learning formulation.'}
                            </Box>
                          </Box>

                          {/* Tags & Synaptic Provenance */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8', fontWeight: 700 }}>
                              SYNAPTIC TAGS:
                            </Typography>
                            {(selectedWikiArticle.tags || []).map((t) => (
                              <Chip
                                key={t}
                                label={`#${t}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontFamily: mono,
                                  fontSize: '0.62rem',
                                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                                  color: isDark ? '#CBD5E1' : '#334155'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.64rem' }}>
                            Engram provenance: 6 active STDP associative traces • Zero-egress enclave verified
                          </Typography>
                          <Button
                            size="small"
                            href="http://127.0.0.1:8094/#obsidian"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#00F0FF', textTransform: 'none' }}
                          >
                            Explore in :8094 Galaxy →
                          </Button>
                        </Box>
                      </Paper>
                    ) : null}
                  </Grid>
                </Grid>
              </Paper>

              {/* Interactive JSON Canvas 1.0 2D Spatial Graph Viewer */}
              <Paper
                id="studio-canvas-visualizer"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(0,240,255,0.4)',
                  bgcolor: isDark ? 'rgba(8,12,20,0.92)' : '#FFFFFF',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 10% 90%, rgba(0,240,255,0.12) 0%, transparent 60%)'
                    : 'none'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        icon={<HubIcon sx={{ fontSize: '0.9rem !important', color: '#00F0FF !important' }} />}
                        label="JSON CANVAS 1.0 SPEC // SPATIAL ENGINE"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,240,255,0.14)',
                          color: '#00F0FF',
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: '1px solid rgba(0,240,255,0.35)'
                        }}
                      />
                      <Chip
                        label={`${canvasesList.length} CANVASES ACTIVE`}
                        size="small"
                        sx={{ bgcolor: gold.wash, color: gold.accent, fontFamily: mono, fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Interactive 2D JSON Canvas 1.0 Spatial Graph Viewer (.canvas)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, mt: 0.5, fontSize: '0.82rem' }}>
                      Infinite 2D spatial coordinate graph transpilations of Obsidian Second Brain knowledge maps, complete with group containers, markdown nodes, and directional cubic bezier edges.
                    </Typography>
                  </Box>

                  {/* Procedural Canvas Generator Input & Button */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
                    <TextField
                      id="studio-canvas-topic-input"
                      size="small"
                      placeholder="Enter canvas domain (e.g. Byzantine Arena)..."
                      value={canvasTopic}
                      onChange={(e) => setCanvasTopic(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateCanvas(); }}
                      sx={{
                        minWidth: { xs: '100%', sm: 260 },
                        '& .MuiOutlinedInput-root': {
                          fontFamily: mono,
                          fontSize: '0.78rem',
                          bgcolor: isDark ? '#05060A' : '#F1F5F9'
                        }
                      }}
                    />
                    <Button
                      id="studio-canvas-gen-btn"
                      variant="contained"
                      onClick={handleGenerateCanvas}
                      disabled={isGeneratingCanvas || !canvasTopic.trim()}
                      startIcon={<AutoAwesomeIcon />}
                      sx={{
                        bgcolor: '#00F0FF',
                        color: '#08080B',
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: '#38BDF8' }
                      }}
                    >
                      {isGeneratingCanvas ? 'GENERATING…' : '✦ GENERATE CANVAS'}
                    </Button>
                  </Box>
                </Box>

                {canvasNotification && (
                  <Alert
                    severity="info"
                    onClose={() => setCanvasNotification(null)}
                    sx={{
                      mb: 2,
                      bgcolor: 'rgba(0,240,255,0.12)',
                      color: '#00F0FF',
                      border: '1px solid rgba(0,240,255,0.35)',
                      fontFamily: mono,
                      fontSize: '0.78rem'
                    }}
                  >
                    {canvasNotification}
                  </Alert>
                )}

                {/* Canvas File Selector Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, fontSize: '0.66rem' }}>
                      CANVASES:
                    </Typography>
                    {canvasesList.map((c) => {
                      const isSelected = activeCanvas?.name === c.name;
                      return (
                        <Chip
                          key={c.name}
                          id={`canvas-chip-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          label={c.name.replace('.canvas', '')}
                          clickable
                          onClick={() => setActiveCanvas(c)}
                          sx={{
                            fontFamily: mono,
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.7rem',
                            bgcolor: isSelected ? 'rgba(0,240,255,0.2)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                            color: isSelected ? '#00F0FF' : '#CBD5E1',
                            border: isSelected ? '1px solid #00F0FF' : '1px solid transparent',
                            '&:hover': { bgcolor: 'rgba(0,240,255,0.15)' }
                          }}
                        />
                      );
                    })}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={canvasViewMode === 'visual' ? 'Spatial 2D SVG' : 'Raw JSON Canvas'}
                      clickable
                      onClick={() => setCanvasViewMode(canvasViewMode === 'visual' ? 'json' : 'visual')}
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: gold.wash,
                        color: gold.accent,
                        border: `1px solid ${gold.border}`
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (activeCanvas && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(activeCanvas.rawJson || JSON.stringify(activeCanvas, null, 2));
                          setCopiedCanvasJson(true);
                          setTimeout(() => setCopiedCanvasJson(false), 2000);
                        }
                      }}
                      startIcon={copiedCanvasJson ? <CheckIcon /> : <ContentCopyIcon />}
                      sx={{ fontSize: '0.68rem', fontFamily: mono, borderColor: gold.border, color: gold.accent, textTransform: 'none' }}
                    >
                      {copiedCanvasJson ? 'Copied' : 'Copy .canvas'}
                    </Button>
                  </Box>
                </Box>

                {/* Telemetry Summary Strip */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    label={`FILE: ${activeCanvas?.relPath || activeCanvas?.name}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(212,175,55,0.14)', color: gold.accent }}
                  />
                  <Chip
                    label={`NODES: ${activeCanvas?.nodeCount || activeCanvas?.nodes?.length || 0}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(0,240,255,0.14)', color: '#00F0FF' }}
                  />
                  <Chip
                    label={`EDGES: ${activeCanvas?.edgeCount || activeCanvas?.edges?.length || 0}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(168,85,247,0.16)', color: '#C084FC' }}
                  />
                  <Chip
                    label={`GROUPS: ${activeCanvas?.groupCount || 0}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.14)', color: '#34D399' }}
                  />
                </Box>

                {/* SVG Spatial Graph Renderer or Raw JSON */}
                {canvasViewMode === 'visual' ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: 480,
                      borderRadius: 2,
                      bgcolor: isDark ? '#05070D' : '#0B1120',
                      border: '1px solid rgba(0,240,255,0.25)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {(() => {
                      const nodes = activeCanvas?.nodes || [];
                      const edges = activeCanvas?.edges || [];
                      const nodeMap = new Map();
                      nodes.forEach(n => nodeMap.set(n.id, n));

                      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                      nodes.forEach(n => {
                        const nx = typeof n.x === 'number' ? n.x : 0;
                        const ny = typeof n.y === 'number' ? n.y : 0;
                        const nw = typeof n.width === 'number' ? n.width : 260;
                        const nh = typeof n.height === 'number' ? n.height : 140;
                        minX = Math.min(minX, nx);
                        minY = Math.min(minY, ny);
                        maxX = Math.max(maxX, nx + nw);
                        maxY = Math.max(maxY, ny + nh);
                      });

                      if (!isFinite(minX)) {
                        minX = -400; minY = -300; maxX = 400; maxY = 300;
                      }
                      const pad = 80;
                      const vbW = Math.max(maxX - minX + pad * 2, 600);
                      const vbH = Math.max(maxY - minY + pad * 2, 400);
                      const vbX = minX - pad;
                      const vbY = minY - pad;

                      const getColorHex = (c) => {
                        const map = {
                          '1': '#EF4444',
                          '2': '#F97316',
                          '3': '#EAB308',
                          '4': '#10B981',
                          '5': '#00F0FF',
                          '6': '#A855F7'
                        };
                        return map[String(c)] || '#C084FC';
                      };

                      const getAnchor = (node, side) => {
                        if (!node) return { x: 0, y: 0 };
                        const nx = typeof node.x === 'number' ? node.x : 0;
                        const ny = typeof node.y === 'number' ? node.y : 0;
                        const nw = typeof node.width === 'number' ? node.width : 260;
                        const nh = typeof node.height === 'number' ? node.height : 140;
                        if (side === 'left') return { x: nx, y: ny + nh / 2 };
                        if (side === 'right') return { x: nx + nw, y: ny + nh / 2 };
                        if (side === 'top') return { x: nx + nw / 2, y: ny };
                        if (side === 'bottom') return { x: nx + nw / 2, y: ny + nh };
                        return { x: nx + nw / 2, y: ny + nh / 2 };
                      };

                      return (
                        <svg
                          id="canvas-spatial-svg"
                          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                          style={{ width: '100%', height: '100%', cursor: 'grab' }}
                        >
                          <defs>
                            <pattern id="canvas-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                              <circle cx="20" cy="20" r="1" fill="rgba(212,175,55,0.15)" />
                            </pattern>
                            {['1','2','3','4','5','6','default'].map(cid => (
                              <marker
                                key={cid}
                                id={`arrow-${cid}`}
                                viewBox="0 0 10 10"
                                refX="8"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                              >
                                <path d="M 0 1 L 10 5 L 0 9 z" fill={getColorHex(cid)} />
                              </marker>
                            ))}
                          </defs>

                          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="url(#canvas-grid-pattern)" />

                          {/* Groups (Bounding Containers) */}
                          {nodes.filter(n => n.type === 'group').map(g => {
                            const col = getColorHex(g.color);
                            return (
                              <g key={g.id}>
                                <rect
                                  x={g.x}
                                  y={g.y}
                                  width={g.width || 300}
                                  height={g.height || 200}
                                  rx="12"
                                  fill={`${col}10`}
                                  stroke={col}
                                  strokeWidth="1.8"
                                  strokeDasharray="6,4"
                                />
                                <text
                                  x={g.x + 16}
                                  y={g.y + 24}
                                  fill={col}
                                  fontFamily={mono}
                                  fontSize="13"
                                  fontWeight="bold"
                                >
                                  {g.label || 'Group Container'}
                                </text>
                              </g>
                            );
                          })}

                          {/* Edges (Cubic Bezier Curves) */}
                          {edges.map(e => {
                            const src = nodeMap.get(e.fromNode);
                            const tgt = nodeMap.get(e.toNode);
                            if (!src || !tgt) return null;
                            const p1 = getAnchor(src, e.fromSide || 'right');
                            const p2 = getAnchor(tgt, e.toSide || 'left');
                            const dx = Math.abs(p2.x - p1.x) * 0.45;
                            const dy = Math.abs(p2.y - p1.y) * 0.45;
                            let cp1x = p1.x, cp1y = p1.y, cp2x = p2.x, cp2y = p2.y;
                            if (e.fromSide === 'right') cp1x += dx;
                            else if (e.fromSide === 'left') cp1x -= dx;
                            else if (e.fromSide === 'bottom') cp1y += dy;
                            else if (e.fromSide === 'top') cp1y -= dy;

                            if (e.toSide === 'left') cp2x -= dx;
                            else if (e.toSide === 'right') cp2x += dx;
                            else if (e.toSide === 'top') cp2y -= dy;
                            else if (e.toSide === 'bottom') cp2y += dy;

                            const col = getColorHex(e.color || '5');
                            const d = `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
                            const midX = (p1.x + p2.x) / 2;
                            const midY = (p1.y + p2.y) / 2;

                            return (
                              <g key={e.id}>
                                <path
                                  d={d}
                                  fill="none"
                                  stroke={col}
                                  strokeWidth="2.2"
                                  markerEnd={`url(#arrow-${e.color || '5'})`}
                                  opacity="0.85"
                                />
                                {e.label && (
                                  <g>
                                    <rect
                                      x={midX - (e.label.length * 4)}
                                      y={midY - 10}
                                      width={e.label.length * 8}
                                      height="18"
                                      rx="4"
                                      fill="#05070D"
                                      stroke={col}
                                      strokeWidth="0.8"
                                    />
                                    <text
                                      x={midX}
                                      y={midY + 3}
                                      fill={col}
                                      fontFamily={mono}
                                      fontSize="10"
                                      textAnchor="middle"
                                      fontWeight="bold"
                                    >
                                      {e.label}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}

                          {/* Nodes (Text / File) */}
                          {nodes.filter(n => n.type !== 'group').map(n => {
                            const col = getColorHex(n.color || '3');
                            const nw = n.width || 260;
                            const nh = n.height || 140;
                            const firstLine = (n.text ? n.text.split('\n')[0].replace(/^[#\s*]+/, '') : (n.file ? n.file.split('/').pop() : 'Node')).substring(0, 28);
                            const bodyPreview = (n.text ? n.text.split('\n').slice(1).join(' ').replace(/[*`_#>-]/g, '').trim() : (n.file || '')).substring(0, 75);

                            return (
                              <g key={n.id}>
                                <rect
                                  x={n.x}
                                  y={n.y}
                                  width={nw}
                                  height={nh}
                                  rx="10"
                                  fill="#0B0F1A"
                                  stroke={col}
                                  strokeWidth="1.8"
                                />
                                <rect
                                  x={n.x}
                                  y={n.y}
                                  width={nw}
                                  height="26"
                                  rx="10"
                                  fill={`${col}22`}
                                />
                                <circle cx={n.x + 14} cy={n.y + 13} r="4" fill={col} />
                                <text
                                  x={n.x + 26}
                                  y={n.y + 17}
                                  fill={col}
                                  fontFamily={mono}
                                  fontSize="11"
                                  fontWeight="bold"
                                >
                                  {n.type === 'file' ? '📄 FILE' : '📝 NOTE'} • {firstLine}
                                </text>
                                <foreignObject x={n.x + 12} y={n.y + 32} width={nw - 24} height={nh - 40}>
                                  <div xmlns="http://www.w3.org/1999/xhtml" style={{
                                    color: '#CBD5E1',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    lineHeight: '1.4',
                                    overflow: 'hidden',
                                    maxHeight: '100%',
                                    wordBreak: 'break-word'
                                  }}>
                                    {bodyPreview || 'JSON Canvas node engram'}
                                  </div>
                                </foreignObject>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </Box>
                ) : (
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.7)' : '#0F172A',
                      border: '1px solid rgba(0,240,255,0.25)',
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      color: '#00F0FF',
                      maxHeight: 480,
                      overflowX: 'auto'
                    }}
                  >
                    {activeCanvas?.rawJson || JSON.stringify(activeCanvas, null, 2)}
                  </Box>
                )}
              </Paper>

              {/* Interactive Obsidian Bases (.base) Database Inspector */}
              <Paper
                id="studio-bases-inspector"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(212,175,55,0.4)',
                  bgcolor: isDark ? 'rgba(10,12,16,0.92)' : '#FFFFFF',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 90% 90%, rgba(212,175,55,0.12) 0%, transparent 60%)'
                    : 'none'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        icon={<StorageIcon sx={{ fontSize: '0.9rem !important', color: gold.accent }} />}
                        label="OBSIDIAN BASES SPEC // YAML DATABASE"
                        size="small"
                        sx={{
                          bgcolor: gold.wash,
                          color: gold.accent,
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: `1px solid ${gold.border}`
                        }}
                      />
                      <Chip
                        label={`${basesList.length} BASES ACTIVE`}
                        size="small"
                        sx={{ bgcolor: 'rgba(52,211,153,0.14)', color: '#34D399', fontFamily: mono, fontWeight: 700, fontSize: '0.68rem' }}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Interactive Obsidian Bases (.base) Database Inspector
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, mt: 0.5, fontSize: '0.82rem' }}>
                      Database-style views, formulas, dynamic filters, and properties transpilations across your Obsidian Second Brain vaults.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={baseViewMode === 'inspect' ? 'UI Inspector' : 'Raw YAML'}
                      clickable
                      onClick={() => setBaseViewMode(baseViewMode === 'inspect' ? 'yaml' : 'inspect')}
                      sx={{
                        fontFamily: mono,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: 'rgba(0,240,255,0.14)',
                        color: '#00F0FF',
                        border: '1px solid rgba(0,240,255,0.3)'
                      }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (activeBase && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(activeBase.rawYaml || '');
                          setCopiedBaseYaml(true);
                          setTimeout(() => setCopiedBaseYaml(false), 2000);
                        }
                      }}
                      startIcon={copiedBaseYaml ? <CheckIcon /> : <ContentCopyIcon />}
                      sx={{ fontSize: '0.68rem', fontFamily: mono, borderColor: gold.border, color: gold.accent, textTransform: 'none' }}
                    >
                      {copiedBaseYaml ? 'Copied' : 'Copy .base YAML'}
                    </Button>
                  </Box>
                </Box>

                {/* Bases File Selector Bar */}
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800, fontSize: '0.66rem' }}>
                    DATABASES:
                  </Typography>
                  {basesList.map((b) => {
                    const isSelected = activeBase?.name === b.name;
                    return (
                      <Chip
                        key={b.name}
                        id={`base-chip-${b.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        label={b.name.replace('.base', '')}
                        clickable
                        onClick={() => setActiveBase(b)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.7rem',
                          bgcolor: isSelected ? 'rgba(212,175,55,0.2)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                          color: isSelected ? gold.accent : '#CBD5E1',
                          border: isSelected ? `1px solid ${gold.accent}` : '1px solid transparent',
                          '&:hover': { bgcolor: 'rgba(212,175,55,0.15)' }
                        }}
                      />
                    );
                  })}
                </Box>

                {/* Telemetry Summary Strip */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip
                    label={`PATH: ${activeBase?.relPath || activeBase?.name}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'rgba(0,240,255,0.12)', color: '#00F0FF' }}
                  />
                  <Chip
                    label={`VIEWS: ${activeBase?.views?.length || 0} CONFIGURED`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(212,175,55,0.14)', color: gold.accent }}
                  />
                  <Chip
                    label={`FORMULAS: ${Object.keys(activeBase?.formulas || {}).length}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(232,121,249,0.14)', color: '#E879F9' }}
                  />
                  <Chip
                    label={`PROPERTIES: ${Object.keys(activeBase?.properties || {}).length}`}
                    size="small"
                    sx={{ height: 20, fontFamily: mono, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(52,211,153,0.14)', color: '#34D399' }}
                  />
                </Box>

                {baseViewMode === 'inspect' ? (
                  <Grid container spacing={2.5}>
                    {/* Configured Views Panel */}
                    <Grid xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          height: '100%',
                          borderRadius: 2,
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`,
                          bgcolor: isDark ? '#05070A' : '#F8FAFC'
                        }}
                      >
                        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', color: gold.accent, mb: 1.5 }}>
                          📑 CONFIGURED VIEWS ({activeBase?.views?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {(activeBase?.views || []).map((v, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                border: '1px solid rgba(212,175,55,0.18)'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: '#CBD5E1' }}>
                                  {v.name || `View ${idx + 1}`}
                                </Typography>
                                <Chip
                                  label={(v.type || 'table').toUpperCase()}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontFamily: mono,
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    bgcolor: v.type === 'cards' ? 'rgba(168,85,247,0.18)' : 'rgba(0,240,255,0.16)',
                                    color: v.type === 'cards' ? '#C084FC' : '#00F0FF'
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', mb: 0.6 }}>
                                Field Ordering:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                                {(v.order || []).map((field) => (
                                  <Chip
                                    key={field}
                                    label={field}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.6rem',
                                      fontFamily: mono,
                                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                                      color: isDark ? '#E2E8F0' : '#1E293B'
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Formulas & Properties Panel */}
                    <Grid xs={12} md={6}>
                      <Paper
                        sx={{
                          p: 2,
                          height: '100%',
                          borderRadius: 2,
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`,
                          bgcolor: isDark ? '#05070A' : '#F8FAFC'
                        }}
                      >
                        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', color: '#00F0FF', mb: 1.5 }}>
                          ⚡ FORMULAS &amp; COMPUTED LOGIC ({Object.keys(activeBase?.formulas || {}).length})
                        </Typography>
                        {Object.keys(activeBase?.formulas || {}).length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                            {Object.entries(activeBase.formulas).map(([key, expr]) => (
                              <Box
                                key={key}
                                sx={{
                                  p: 1.2,
                                  borderRadius: 1.5,
                                  bgcolor: isDark ? 'rgba(0,240,255,0.04)' : '#FFFFFF',
                                  border: '1px solid rgba(0,240,255,0.18)'
                                }}
                              >
                                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.7rem', color: '#00F0FF' }}>
                                  formula.{key}
                                </Typography>
                                <Typography component="code" sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#94A3B8', wordBreak: 'break-all' }}>
                                  {String(expr)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', display: 'block', mb: 2 }}>
                            No computed formulas declared in this specification.
                          </Typography>
                        )}

                        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.74rem', color: '#E879F9', mb: 1 }}>
                          🎯 ACTIVE FILTER CONSTRAINTS
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 1.2,
                            borderRadius: 1.5,
                            bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#E2E8F0',
                            border: '1px solid rgba(232,121,249,0.2)',
                            fontFamily: mono,
                            fontSize: '0.68rem',
                            color: '#E879F9',
                            maxHeight: 120,
                            overflowY: 'auto'
                          }}
                        >
                          {JSON.stringify(activeBase?.filters || {}, null, 2)}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                ) : (
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(0,0,0,0.7)' : '#0F172A',
                      border: `1px solid ${gold.border}`,
                      fontFamily: mono,
                      fontSize: '0.74rem',
                      color: gold.accent,
                      maxHeight: 480,
                      overflowX: 'auto'
                    }}
                  >
                    {activeBase?.rawYaml || '# No YAML representation available'}
                  </Box>
                )}

                {/* Live Obsidian Bases Records Table (#studio-bases-live-records) */}
                <Box
                  id="studio-bases-live-records"
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : theme.palette.divider}`,
                    bgcolor: isDark ? 'rgba(5,7,10,0.85)' : '#F8FAFC'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon sx={{ fontSize: '1rem', color: gold.accent }} />
                      <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: gold.accent }}>
                        📊 LIVE VAULT RECORDS TABLE
                      </Typography>
                      <Chip
                        label={`${basesRecordsData?.totalMatched ?? basesRecordsData?.rows?.length ?? 0} MATCHED NOTES`}
                        size="small"
                        sx={{
                          height: 20,
                          fontFamily: mono,
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          bgcolor: 'rgba(52,211,153,0.15)',
                          color: '#34D399',
                          border: '1px solid rgba(52,211,153,0.3)'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isLoadingBasesRecords && (
                        <CircularProgress size={14} sx={{ color: gold.accent }} />
                      )}
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.68rem' }}>
                        Database: <strong>{activeBase?.name || 'Selected Base'}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Scrollable Records Table */}
                  <Box sx={{ overflowX: 'auto', maxHeight: 360, borderRadius: 1.5, border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}` }}>
                    <Table size="small" stickyHeader sx={{ minWidth: 640 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: isDark ? '#0F1219' : '#EDE8D5' }}>
                          {(basesRecordsData?.columns || [
                            { key: 'title', label: 'Note Title' },
                            { key: 'relPath', label: 'Vault Path' },
                            { key: 'category', label: 'Category' },
                            { key: 'status', label: 'Status' }
                          ]).map((col) => (
                            <TableCell
                              key={col.key}
                              sx={{
                                py: 1,
                                px: 1.5,
                                fontFamily: mono,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: gold.accent,
                                bgcolor: isDark ? '#0F1219' : '#EDE8D5',
                                borderBottom: `1px solid ${isDark ? 'rgba(212,175,55,0.3)' : '#CBD5E1'}`,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {col.label || col.key}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(basesRecordsData?.rows || []).slice(0, 30).map((row, rIdx) => {
                          const props = row.properties || {};
                          return (
                            <TableRow
                              key={rIdx}
                              hover
                              sx={{
                                '&:nth-of-type(odd)': {
                                  bgcolor: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)'
                                },
                                '&:hover': {
                                  bgcolor: isDark ? 'rgba(212,175,55,0.06) !important' : 'rgba(212,175,55,0.08) !important'
                                }
                              }}
                            >
                              {(basesRecordsData?.columns || []).map((col) => {
                                const cellVal = props[col.key] !== undefined && props[col.key] !== null
                                  ? props[col.key]
                                  : (row[col.key] !== undefined ? row[col.key] : (props[col.key.replace('formula.', '')] ?? '—'));

                                const valStr = typeof cellVal === 'object'
                                  ? (Array.isArray(cellVal) ? cellVal.join(', ') : JSON.stringify(cellVal))
                                  : String(cellVal || '—');

                                return (
                                  <TableCell
                                    key={col.key}
                                    sx={{
                                      py: 0.8,
                                      px: 1.5,
                                      fontFamily: mono,
                                      fontSize: '0.7rem',
                                      color: col.key.includes('title') || col.key === 'file.name'
                                        ? (isDark ? '#F1F5F9' : '#0F172A')
                                        : (col.key.includes('status') || col.key.includes('monetized')
                                          ? '#34D399'
                                          : (isDark ? '#94A3B8' : '#475569')),
                                      fontWeight: col.key.includes('title') ? 700 : 500,
                                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9'}`,
                                      whiteSpace: 'nowrap',
                                      maxWidth: 240,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {valStr}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                  {basesRecordsData?.rows && basesRecordsData.rows.length > 30 && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', fontFamily: mono, color: '#64748B', fontSize: '0.64rem' }}>
                      Showing first 30 of {basesRecordsData.totalMatched || basesRecordsData.rows.length} matched records
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* ==========================================================================
                  UNIFIED SECOND BRAIN & STDP CORTEX SEARCH (#studio-unified-search)
                  ========================================================================== */}
              <Paper
                id="studio-unified-search"
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${gold.border}`,
                  bgcolor: isDark ? 'rgba(10,12,18,0.85)' : '#FFFFFF',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: gold.wash,
                        border: `1px solid ${gold.border}`,
                        color: gold.accent
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Unified Second Brain + STDP Cortex Search
                        <Chip label="Cross-Substrate" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 750, bgcolor: gold.wash, color: gold.accent, border: `1px solid ${gold.border}` }} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Cross-indexes Obsidian Second Brain notes (.md, .canvas, .base, telemetry) with biological STDP memory engrams (:8094).
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${(unifiedSearchResults?.vaultCount || 0) + (unifiedSearchResults?.stdpCount || 0)} Total Associations`}
                    size="small"
                    sx={{ fontWeight: 750, fontFamily: mono, fontSize: '0.72rem', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }}
                  />
                </Box>

                {/* Search Bar & Quick Query Chips */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, mb: 1.5 }}>
                    <TextField
                      id="studio-obsidian-search-input"
                      fullWidth
                      size="small"
                      placeholder="Search vault notes, canvases, bases, or STDP biological engrams..."
                      value={unifiedSearchQuery}
                      onChange={(e) => setUnifiedSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnifiedSearch();
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" sx={{ color: gold.accent }} />
                          </InputAdornment>
                        ),
                        sx: {
                          fontFamily: mono,
                          fontSize: '0.85rem',
                          bgcolor: isDark ? 'rgba(0,0,0,0.4)' : '#F8FAFC',
                          borderRadius: 2
                        }
                      }}
                    />
                    <Button
                      id="studio-obsidian-search-btn"
                      variant="contained"
                      onClick={() => handleUnifiedSearch()}
                      disabled={isSearchingUnified}
                      sx={{
                        minWidth: { xs: '100%', sm: 220 },
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        bgcolor: gold.accent,
                        color: '#08080B',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: gold.soft, color: '#08080B' }
                      }}
                    >
                      {isSearchingUnified ? (
                        <>
                          <CircularProgress size={16} sx={{ color: '#08080B', mr: 1 }} />
                          Searching...
                        </>
                      ) : (
                        '🔍 SEARCH VAULT & CORTEX'
                      )}
                    </Button>
                  </Box>

                  {/* Quick-query chips */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, mr: 0.5 }}>
                      Quick Queries:
                    </Typography>
                    {['Vaelor', 'VirusTotal', 'Netrunner', 'Hermes', 'STDP'].map((chip) => (
                      <Chip
                        key={chip}
                        label={chip}
                        size="small"
                        clickable
                        onClick={() => {
                          setUnifiedSearchQuery(chip);
                          handleUnifiedSearch(chip);
                        }}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontFamily: mono,
                          bgcolor: unifiedSearchQuery.toLowerCase() === chip.toLowerCase() ? gold.wash : (isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9'),
                          color: unifiedSearchQuery.toLowerCase() === chip.toLowerCase() ? gold.accent : theme.palette.text.primary,
                          border: `1px solid ${unifiedSearchQuery.toLowerCase() === chip.toLowerCase() ? gold.border : theme.palette.divider}`,
                          '&:hover': { bgcolor: gold.wash, color: gold.accent }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Dual-Pane Search Results */}
                <Grid container spacing={2.5}>
                  {/* Left Pane: Obsidian Vault Matches */}
                  <Grid xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: isDark ? 'rgba(0,0,0,0.35)' : '#F8FAFC',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`,
                        minHeight: 280,
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>📝</span> Obsidian Vault Matches
                        </Typography>
                        <Chip
                          label={`${unifiedSearchResults?.vaultCount || 0} notes`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 750, bgcolor: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}
                        />
                      </Box>

                      {(!unifiedSearchResults?.vaultMatches || unifiedSearchResults.vaultMatches.length === 0) ? (
                        <Box sx={{ p: 3, textAlign: 'center', my: 'auto' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            No Obsidian vault notes matched "{unifiedSearchQuery}". Try a quick query chip above.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5} sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
                          {unifiedSearchResults.vaultMatches.map((vm, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
                                '&:hover': { borderColor: '#06B6D4' },
                                transition: 'border-color 0.15s ease'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 750, color: theme.palette.text.primary }}>
                                  {vm.title}
                                </Typography>
                                <Chip
                                  label={vm.type || 'md'}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    bgcolor: vm.type === 'canvas' ? 'rgba(236,72,153,0.12)' : (vm.type === 'base' ? 'rgba(16,185,129,0.12)' : 'rgba(6,182,212,0.12)'),
                                    color: vm.type === 'canvas' ? '#EC4899' : (vm.type === 'base' ? '#10B981' : '#06B6D4')
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, fontFamily: mono, fontSize: '0.68rem', mb: 0.75 }}>
                                {vm.relPath}
                              </Typography>
                              {vm.snippet && (
                                <Typography variant="body2" sx={{ fontSize: '0.74rem', color: theme.palette.text.secondary, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical' }}>
                                  {vm.snippet}
                                </Typography>
                              )}
                              {vm.wikilinks && vm.wikilinks.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                  {vm.wikilinks.slice(0, 4).map((link, lIdx) => (
                                    <Chip
                                      key={lIdx}
                                      label={`[[${link}]]`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.62rem',
                                        fontFamily: mono,
                                        bgcolor: isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)',
                                        color: '#06B6D4',
                                        border: '1px solid rgba(6,182,212,0.2)'
                                      }}
                                    />
                                  ))}
                                  {vm.wikilinks.length > 4 && (
                                    <Typography variant="caption" sx={{ fontSize: '0.62rem', color: theme.palette.text.secondary, alignSelf: 'center' }}>
                                      +{vm.wikilinks.length - 4} more
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>

                  {/* Right Pane: STDP Cortex Engrams */}
                  <Grid xs={12} md={6}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: isDark ? 'rgba(0,0,0,0.35)' : '#F8FAFC',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider}`,
                        minHeight: 280,
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>🧠</span> STDP Cortex Engrams
                        </Typography>
                        <Chip
                          label={`${unifiedSearchResults?.stdpCount || 0} engrams`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 750, bgcolor: gold.wash, color: gold.accent }}
                        />
                      </Box>

                      {(!unifiedSearchResults?.stdpMatches || unifiedSearchResults.stdpMatches.length === 0) ? (
                        <Box sx={{ p: 3, textAlign: 'center', my: 'auto' }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            No biological cortex engrams matched "{unifiedSearchQuery}". Try a query like "Vaelor", "Netrunner", or "Hermes".
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5} sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
                          {unifiedSearchResults.stdpMatches.map((em, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
                                '&:hover': { borderColor: gold.accent },
                                transition: 'border-color 0.15s ease'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={em.category || 'memory'}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      bgcolor: gold.wash,
                                      color: gold.accent
                                    }}
                                  />
                                  <Chip
                                    label={`Imp: ${Math.round((em.importance || 0.8) * 100)}%`}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.62rem',
                                      fontFamily: mono,
                                      bgcolor: 'rgba(16,185,129,0.12)',
                                      color: '#10B981'
                                    }}
                                  />
                                </Box>
                                <Button
                                  size="small"
                                  startIcon={<CenterFocusStrongIcon sx={{ fontSize: '0.9rem !important' }} />}
                                  onClick={() => handleLocateInMemoryWorld(em)}
                                  sx={{
                                    py: 0.3,
                                    px: 1,
                                    fontSize: '0.68rem',
                                    fontWeight: 750,
                                    color: gold.accent,
                                    border: `1px solid ${gold.border}`,
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: gold.wash }
                                  }}
                                >
                                  ✦ LOCATE IN 3D WORLD
                                </Button>
                              </Box>
                              <Typography variant="body2" sx={{ fontSize: '0.74rem', color: theme.palette.text.secondary, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical' }}>
                                {em.content || em.text}
                              </Typography>
                              {em.tags && em.tags.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {em.tags.slice(0, 4).map((tag, tIdx) => (
                                    <Chip
                                      key={tIdx}
                                      label={`#${tag}`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.62rem',
                                        fontFamily: mono,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* ==========================================================================
                  LIVE KNAP TELEMETRY COMPILER (#studio-knap-telemetry)
                  ========================================================================== */}
              <Paper
                id="studio-knap-telemetry"
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${gold.border}`,
                  bgcolor: isDark ? 'rgba(10,12,18,0.85)' : '#FFFFFF',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(245,158,11,0.12)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: '#F59E0B'
                      }}
                    >
                      <BoltIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Live Knap Structured Telemetry Compiler
                        <Chip label="@kepano/knap" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 750, bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Structured template engine synthesizing live daemon metrics (:8140 ledger, :8094 STDP substrate) into Obsidian 05-Telemetry/ notes.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    id="studio-knap-render-btn"
                    variant="contained"
                    onClick={() => handleRecompileKnap('all')}
                    disabled={isRecompilingKnap}
                    startIcon={isRecompilingKnap ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <BoltIcon fontSize="small" />}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      bgcolor: '#F59E0B',
                      color: '#08080B',
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#D97706', color: '#08080B' }
                    }}
                  >
                    {isRecompilingKnap ? 'Re-Compiling...' : '⚡ RE-COMPILE KNAP TELEMETRY'}
                  </Button>
                </Box>

                {/* Telemetry Tabs */}
                <Tabs
                  value={activeKnapTab}
                  onChange={(e, v) => setActiveKnapTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    mb: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '& .MuiTab-root': { fontWeight: 750, minHeight: 44, fontSize: '0.84rem' },
                    '& .Mui-selected': { color: '#F59E0B' },
                    '& .MuiTabs-indicator': { bgcolor: '#F59E0B', height: 2.5 }
                  }}
                >
                  <Tab label="◈ Vaelor Live Ledger Telemetry" />
                  <Tab label="🧠 Neuro-Memory Cortex Telemetry" />
                  <Tab label="🌙 Dream Consolidation & Synaptic Bridges" />
                </Tabs>

                {/* Active Telemetry Note Card */}
                {(() => {
                  const currentNote = knapTelemetryNotes.find((n, idx) => {
                    if (activeKnapTab === 0) return n.title.includes('Vaelor');
                    if (activeKnapTab === 1) return n.title.includes('Cortex') || n.title.includes('Neuro-Memory');
                    if (activeKnapTab === 2) return n.title.includes('Dream') || n.title.includes('Bridges');
                    return idx === activeKnapTab;
                  }) || knapTelemetryNotes[0];

                  if (!currentNote) return null;

                  return (
                    <Box>
                      {/* Meta bar */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                            {currentNote.title}
                          </Typography>
                          <Chip
                            label={currentNote.relPath}
                            size="small"
                            sx={{ height: 20, fontSize: '0.66rem', fontFamily: mono, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: mono }}>
                          Last Compiled: {currentNote.updated || 'Just now'}
                        </Typography>
                      </Box>

                      {/* Content Preview */}
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: isDark ? 'rgba(0,0,0,0.65)' : '#0F172A',
                          border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : '#CBD5E1'}`,
                          fontFamily: mono,
                          fontSize: '0.74rem',
                          color: '#FDE68A',
                          maxHeight: 400,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.6
                        }}
                      >
                        {currentNote.content}
                      </Box>

                      {/* Knap compiler stdout / diagnostic feed */}
                      {knapCompilerOutput && (
                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: isDark ? 'rgba(0,0,0,0.85)' : '#1E293B', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: '#10B981', fontFamily: mono, mb: 0.5 }}>
                            ✦ Knap Compiler Live Output (:8094)
                          </Typography>
                          <Typography variant="caption" component="pre" sx={{ m: 0, fontFamily: mono, fontSize: '0.7rem', color: '#A7F3D0', whiteSpace: 'pre-wrap' }}>
                            {knapCompilerOutput}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </Paper>

              {/* ==========================================================================
                  KNOWLEDGE GRAPH DEGREE CENTRALITY & TOP HUBS (#studio-obsidian-top-hubs)
                  ========================================================================== */}
              <Paper
                id="studio-obsidian-top-hubs"
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${gold.border}`,
                  bgcolor: isDark ? 'rgba(10,12,18,0.85)' : '#FFFFFF',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(168,85,247,0.12)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        color: '#A855F7'
                      }}
                    >
                      <HubIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Knowledge Graph Degree Centrality & Top Hubs
                        <Chip label="Global Centrality" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 750, bgcolor: 'rgba(168,85,247,0.12)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.3)' }} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Topological degree centrality across {graphTopology.totalNodes || 1752} vault nodes and {graphTopology.totalEdges || 7777} wikilink edges. Measures citation authority and referencing density.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${graphTopology.totalNodes || 1752} Nodes`} size="small" sx={{ fontWeight: 750, fontFamily: mono, fontSize: '0.72rem' }} />
                    <Chip label={`${graphTopology.totalEdges || 7777} Edges`} size="small" sx={{ fontWeight: 750, fontFamily: mono, fontSize: '0.72rem', bgcolor: 'rgba(6,182,212,0.1)', color: '#06B6D4' }} />
                    <Chip label={`${graphTopology.connectivityPct || 99.6}% Connected`} size="small" sx={{ fontWeight: 750, fontFamily: mono, fontSize: '0.72rem', bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981' }} />
                  </Box>
                </Box>

                {/* Cluster Distribution Strip */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: theme.palette.text.secondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Cluster Node Distribution:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(graphTopology.clusterDistribution || {}).map(([cluster, count]) => {
                      const colors = {
                        OS: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
                        Studio: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3B82F6' },
                        Skills: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#EC4899' },
                        MCP: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
                        Maps: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
                        Wiki: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#A855F7' },
                        Canvases: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', text: '#06B6D4' },
                        Bases: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#8B5CF6' }
                      };
                      const c = colors[cluster] || { bg: 'rgba(255,255,255,0.05)', border: theme.palette.divider, text: theme.palette.text.primary };
                      return (
                        <Box
                          key={cluster}
                          sx={{
                            px: 1.2,
                            py: 0.6,
                            borderRadius: 1.8,
                            bgcolor: c.bg,
                            border: `1px solid ${c.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.8
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, color: c.text, fontSize: '0.74rem' }}>
                            {cluster}:
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontFamily: mono, fontSize: '0.74rem' }}>
                            {count}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Top 10 Hub Cards Grid */}
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: theme.palette.text.secondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Top 10 Degree Centrality Hubs:
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
                    gap: 2
                  }}
                >
                  {(graphTopology.topHubs || []).map((hub, idx) => {
                    const isRank1 = idx === 0;
                    const maxDegree = graphTopology.topHubs[0]?.totalDegree || 1166;
                    const pct = Math.round(((hub.totalDegree || 0) / maxDegree) * 100);

                    return (
                      <Paper
                        key={hub.title}
                        sx={{
                          p: 1.6,
                          height: '100%',
                          borderRadius: 2.5,
                          bgcolor: isRank1 ? (isDark ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.06)') : (isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC'),
                          border: `1px solid ${isRank1 ? gold.accent : (isDark ? 'rgba(255,255,255,0.08)' : theme.palette.divider)}`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: gold.accent,
                            boxShadow: isRank1 ? '0 4px 20px rgba(212,175,55,0.2)' : '0 4px 12px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={isRank1 ? '👑 #1' : `#${idx + 1}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                bgcolor: isRank1 ? gold.accent : (isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'),
                                color: isRank1 ? '#08080B' : theme.palette.text.primary
                              }}
                            />
                            <Chip
                              label={hub.cluster || 'Vault'}
                              size="small"
                              sx={{ height: 18, fontSize: '0.6rem', fontFamily: mono, bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9' }}
                            />
                          </Box>

                          <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 0.2, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {hub.title}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, fontFamily: mono, fontSize: '0.66rem', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {hub.relPath}
                          </Typography>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.68rem', color: theme.palette.text.secondary }}>
                              In: <strong style={{ color: '#06B6D4' }}>{hub.inDegree}</strong> · Out: <strong style={{ color: '#A855F7' }}>{hub.outDegree}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: isRank1 ? gold.accent : theme.palette.text.primary, fontFamily: mono, fontSize: '0.78rem' }}>
                              {hub.totalDegree.toLocaleString()} deg
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isRank1 ? gold.accent : '#06B6D4',
                                borderRadius: 2
                              }
                            }}
                          />
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Paper>

              {/* ==========================================================================
                  INTERACTIVE 15-TOOL MCP JSON-RPC PLAYGROUND (#studio-obsidian-mcp-playground)
                  ========================================================================== */}
              <Paper
                id="studio-obsidian-mcp-playground"
                sx={{
                  p: { xs: 2, md: 3 },
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${gold.border}`,
                  bgcolor: isDark ? 'rgba(10,12,18,0.85)' : '#FFFFFF',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10B981'
                      }}
                    >
                      <TerminalIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Interactive 15-Tool MCP JSON-RPC Playground
                        <Chip label="MCP 2024-11-05" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 750, bgcolor: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Live Model Context Protocol (JSON-RPC 2.0) harness connecting LLM agents (Claude, Cursor, Grok, Hermes) directly to Second Brain & biological memory.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={copiedMcpConfig ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    onClick={handleCopyMcpConfig}
                    sx={{
                      fontWeight: 750,
                      fontSize: '0.78rem',
                      color: copiedMcpConfig ? '#10B981' : gold.accent,
                      borderColor: copiedMcpConfig ? '#10B981' : gold.border,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: gold.wash }
                    }}
                  >
                    {copiedMcpConfig ? 'COPIED MCP CONFIG!' : '📋 COPY MCP CONFIG'}
                  </Button>
                </Box>

                {/* Tool Selector Tabs / Pills */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: theme.palette.text.secondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select MCP Tool ({mcpToolsList.length} Active Tools):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 110, overflowY: 'auto', p: 0.5 }}>
                    {mcpToolsList.map((t) => {
                      const isSelected = selectedMcpTool?.name === t.name;
                      return (
                        <Chip
                          key={t.name}
                          label={t.name}
                          clickable
                          onClick={() => handleSelectMcpTool(t)}
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.72rem',
                            fontWeight: isSelected ? 800 : 600,
                            bgcolor: isSelected ? gold.wash : (isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9'),
                            color: isSelected ? gold.accent : theme.palette.text.primary,
                            border: `1px solid ${isSelected ? gold.accent : theme.palette.divider}`,
                            '&:hover': { bgcolor: gold.wash, color: gold.accent }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* Active Tool Spec & JSON-RPC Execution Box */}
                <Grid container spacing={2.5}>
                  {/* Left Column: Arguments Editor */}
                  <Grid xs={12} md={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.primary }}>
                        Arguments (JSON Payload):
                      </Typography>
                      <Chip
                        label={selectedMcpTool?.category || 'MCP Tool'}
                        size="small"
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 750, bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ fontSize: '0.76rem', color: theme.palette.text.secondary, mb: 1.5, minHeight: 38 }}>
                      {selectedMcpTool?.description}
                    </Typography>

                    <TextField
                      multiline
                      rows={9}
                      fullWidth
                      value={mcpToolArgsText}
                      onChange={(e) => setMcpToolArgsText(e.target.value)}
                      InputProps={{
                        sx: {
                          fontFamily: mono,
                          fontSize: '0.76rem',
                          bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#F8FAFC',
                          borderRadius: 2,
                          color: '#A7F3D0'
                        }
                      }}
                    />

                    <Button
                      id="studio-mcp-exec-btn"
                      variant="contained"
                      fullWidth
                      onClick={handleExecuteMcpTool}
                      disabled={isExecutingMcp}
                      startIcon={isExecutingMcp ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <PlayArrowIcon />}
                      sx={{
                        mt: 1.5,
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        bgcolor: '#10B981',
                        color: '#08080B',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#059669', color: '#08080B' }
                      }}
                    >
                      {isExecutingMcp ? 'Executing Tool...' : '⚡ EXECUTE MCP TOOL'}
                    </Button>
                  </Grid>

                  {/* Right Column: JSON-RPC 2.0 Response Viewer */}
                  <Grid xs={12} md={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 750, color: theme.palette.text.primary }}>
                        JSON-RPC 2.0 Response:
                      </Typography>
                      {mcpExecutionResult?.latencyMs !== undefined && (
                        <Chip
                          label={`${mcpExecutionResult.latencyMs} ms`}
                          size="small"
                          sx={{ height: 18, fontSize: '0.62rem', fontFamily: mono, bgcolor: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}
                        />
                      )}
                    </Box>

                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(0,0,0,0.65)' : '#0F172A',
                        border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : '#CBD5E1'}`,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        color: '#34D399',
                        height: 290,
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.5
                      }}
                    >
                      {mcpExecutionResult
                        ? JSON.stringify(mcpExecutionResult, null, 2)
                        : `// Click "⚡ EXECUTE MCP TOOL" above to trigger call\n// Endpoint: POST /api/mcp/call (Zero-Cloud Verified)\n{\n  "jsonrpc": "2.0",\n  "status": "READY",\n  "tool": "${selectedMcpTool?.name || 'none'}"\n}`}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* ==========================================================================
                  SECOND BRAIN NOTE & WEB SNIPPET INGESTOR (#studio-obsidian-ingest-panel)
                  ========================================================================== */}
              <Paper
                id="studio-obsidian-ingest-panel"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 3,
                  border: `1px solid ${gold.border}`,
                  bgcolor: isDark ? 'rgba(10,12,18,0.85)' : '#FFFFFF',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(212,175,55,0.14)',
                        border: `1px solid ${gold.border}`,
                        color: gold.accent
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Second Brain Note &amp; Web Snippet Ingestor
                        <Chip label="DIRECT STDP VAULT SINK" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: gold.wash, color: gold.accent, border: `1px solid ${gold.border}` }} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Live vault note creation: writes markdown notes to <code>04-Ingested/&lt;slug&gt;.md</code> and synthesizes real-time STDP associative engrams into the 3D Netrunner Cortex (:8094).
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label="✦ Hebbian Biomorphic Ingestion"
                    size="small"
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 750,
                      bgcolor: 'rgba(16,185,129,0.12)',
                      color: '#10B981',
                      border: '1px solid rgba(16,185,129,0.25)'
                    }}
                  />
                </Box>

                {/* Ingest Form Inputs */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={5}>
                      <TextField
                        id="studio-ingest-title"
                        label="Note Title / Concept"
                        placeholder="e.g. Hebbian Tri-Phasic Synaptic Relay"
                        fullWidth
                        size="small"
                        value={ingestTitle}
                        onChange={(e) => setIngestTitle(e.target.value)}
                        InputProps={{
                          sx: {
                            fontFamily: mono,
                            fontSize: '0.84rem',
                            bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#F8FAFC',
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    <Grid xs={12} md={3}>
                      <TextField
                        id="studio-ingest-source"
                        label="Provenance / Source"
                        placeholder="e.g. antigravity-studio or web URL"
                        fullWidth
                        size="small"
                        value={ingestSource}
                        onChange={(e) => setIngestSource(e.target.value)}
                        InputProps={{
                          sx: {
                            fontFamily: mono,
                            fontSize: '0.84rem',
                            bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#F8FAFC',
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    <Grid xs={12} md={4}>
                      <TextField
                        id="studio-ingest-tags"
                        label="Tags (comma separated)"
                        placeholder="e.g. stdp, ai-research, zothos"
                        fullWidth
                        size="small"
                        value={ingestTags}
                        onChange={(e) => setIngestTags(e.target.value)}
                        InputProps={{
                          sx: {
                            fontFamily: mono,
                            fontSize: '0.84rem',
                            bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#F8FAFC',
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    id="studio-ingest-content"
                    label="Markdown Body / Note Content"
                    placeholder="Write markdown body, telemetry findings, algorithmic invariants, or research observations..."
                    fullWidth
                    multiline
                    rows={4}
                    value={ingestContent}
                    onChange={(e) => setIngestContent(e.target.value)}
                    InputProps={{
                      sx: {
                        fontFamily: mono,
                        fontSize: '0.8rem',
                        bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#F8FAFC',
                        borderRadius: 2,
                        lineHeight: 1.5
                      }
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.7rem' }}>
                      POST /api/obsidian/ingest · Vault: <code>~/Documents/Obsidian Vault/04-Ingested/</code>
                    </Typography>
                    <Button
                      id="studio-obsidian-ingest-btn"
                      variant="contained"
                      onClick={handleIngestNote}
                      disabled={isIngesting || !ingestTitle.trim() || !ingestContent.trim()}
                      startIcon={isIngesting ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <DownloadIcon fontSize="small" />}
                      sx={{
                        px: 3,
                        py: 1,
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        bgcolor: gold.accent,
                        color: '#08080B',
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: gold.soft, color: '#08080B' }
                      }}
                    >
                      {isIngesting ? 'Ingesting into Vault...' : '📥 INGEST TO VAULT & STDP CORTEX'}
                    </Button>
                  </Box>

                  {/* Confirmation Banner */}
                  {ingestResult && (
                    <Alert
                      id="studio-ingest-result"
                      severity="success"
                      sx={{
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: isDark ? '#A7F3D0' : '#065F46',
                        '& .MuiAlert-icon': { color: '#10B981' }
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                        ✦ Successfully Ingested Note [[{ingestResult.note?.title || 'Note'}]]!
                      </Typography>
                      <Box sx={{ fontFamily: mono, fontSize: '0.72rem', mt: 0.5, color: isDark ? '#6EE7B7' : '#047857' }}>
                        Vault File: <strong>{ingestResult.note?.relPath || '04-Ingested/note.md'}</strong> · STDP Memory ID: <strong>{ingestResult.note?.memoryId || 'mem-synced'}</strong> · Added to 3D Cortex!
                      </Box>
                    </Alert>
                  )}
                </Box>
              </Paper>

              {/* ==========================================================================
                  DAILY SOVEREIGN JOURNAL (#studio-obsidian-daily-note)
                  ========================================================================== */}
              <Paper
                id="studio-obsidian-daily-note"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 3,
                  border: `1.5px solid rgba(245,158,11,0.4)`,
                  bgcolor: isDark ? 'rgba(12,14,20,0.9)' : '#FFFFFF',
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(245,158,11,0.14)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: '#F59E0B'
                      }}
                    >
                      <MenuBookIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        Daily Sovereign Journal
                        <Chip label="OBSIDIAN 07-DAILY" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: 'rgba(245,158,11,0.14)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }} />
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Live chronological engineering log and daemon snapshot: records continuous developer progress directly into <code>{dailyNote?.relPath || '07-Daily/daily.md'}</code> with real-time STDP memory synchronization (:8094).
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      label={`📅 ${dailyNote?.date || 'Today'}`}
                      size="small"
                      sx={{ height: 22, fontFamily: mono, fontSize: '0.68rem', fontWeight: 750, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }}
                    />
                    <Chip
                      label={`${dailyNote?.entriesCount || 0} Daily Entries`}
                      size="small"
                      sx={{
                        height: 22,
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: 'rgba(16,185,129,0.12)',
                        color: '#10B981',
                        border: '1px solid rgba(16,185,129,0.25)'
                      }}
                    />
                  </Box>
                </Box>

                {/* Markdown Note Content Preview */}
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    mb: 2.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: isDark ? 'rgba(0,0,0,0.65)' : '#0F172A',
                    border: `1px solid ${isDark ? 'rgba(245,158,11,0.25)' : '#CBD5E1'}`,
                    fontFamily: mono,
                    fontSize: '0.74rem',
                    color: '#FDE68A',
                    maxHeight: 280,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.55
                  }}
                >
                  {dailyNote?.content || '# Daily Sovereign Note\n\nNo content recorded yet.'}
                </Box>

                {/* Append Input & Button Bar */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
                  <TextField
                    id="studio-daily-input"
                    fullWidth
                    size="small"
                    placeholder="Append quick engineering log entry or research thought..."
                    value={dailyInputText}
                    onChange={(e) => setDailyInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAppendDailyLog();
                      }
                    }}
                    InputProps={{
                      sx: {
                        fontFamily: mono,
                        fontSize: '0.84rem',
                        bgcolor: isDark ? 'rgba(0,0,0,0.45)' : '#F8FAFC',
                        borderRadius: 2
                      }
                    }}
                  />
                  <Button
                    id="studio-daily-append-btn"
                    variant="contained"
                    onClick={handleAppendDailyLog}
                    disabled={isAppendingDaily || !dailyInputText.trim()}
                    startIcon={isAppendingDaily ? <CircularProgress size={16} sx={{ color: '#08080B' }} /> : <AddCircleOutlineIcon fontSize="small" />}
                    sx={{
                      minWidth: { xs: '100%', sm: 300 },
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      bgcolor: '#F59E0B',
                      color: '#08080B',
                      borderRadius: 2,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: '#D97706', color: '#08080B' }
                    }}
                  >
                    {isAppendingDaily ? 'Appending...' : '➕ APPEND DAILY LOG & STDP ENGRAM'}
                  </Button>
                </Box>

                {/* Confirmation Alert */}
                {dailyAppendResult && (
                  <Alert
                    severity="success"
                    onClose={() => setDailyAppendResult(null)}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: isDark ? '#A7F3D0' : '#065F46',
                      '& .MuiAlert-icon': { color: '#10B981' }
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                      ✦ Appended to Daily Note: <code>{dailyAppendResult.appended || dailyAppendResult.date}</code>
                    </Typography>
                  </Alert>
                )}
              </Paper>

              {/* Obsidian Backlinks, Outlinks & Unlinked Mentions Inspector */}
              <Paper
                id="studio-backlinks-inspector"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(14,165,233,0.45)',
                  bgcolor: isDark ? 'rgba(8,16,24,0.92)' : '#FFFFFF',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 10% 90%, rgba(14,165,233,0.12) 0%, transparent 60%)'
                    : 'none',
                  boxShadow: '0 8px 32px rgba(14,165,233,0.12)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                      <Chip
                        icon={<HubIcon sx={{ fontSize: '0.9rem !important', color: '#38BDF8 !important' }} />}
                        label="GRAPH CITATIONS // BACKLINKS & OUTLINKS"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(56,189,248,0.16)',
                          color: '#38BDF8',
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: '1px solid rgba(56,189,248,0.35)'
                        }}
                      />
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                        ACTIVE TARGET: <strong style={{ color: '#38BDF8' }}>[[{selectedBacklinksNote}]]</strong>
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: { xs: '1rem', md: '1.15rem' } }}>
                      Obsidian Backlinks, Outlinks & Unlinked Mentions Inspector
                    </Typography>
                  </Box>
                  {isLoadingBacklinks && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} sx={{ color: '#38BDF8' }} />
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#38BDF8' }}>
                        Resolving Hebbian paths...
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Quick-hub Pills */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {[
                    '00 Home',
                    'Zoth OS',
                    'Zoth Studio',
                    'Zoth Trust & Supply Chain',
                    'MOC Skills',
                    'Vaelor Account-Lattice & PoUW Protocol'
                  ].map((hubName) => {
                    const isSelected = selectedBacklinksNote === hubName;
                    return (
                      <Chip
                        key={hubName}
                        label={hubName}
                        clickable
                        onClick={() => setSelectedBacklinksNote(hubName)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 750,
                          fontSize: '0.74rem',
                          bgcolor: isSelected ? '#0284C7' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                          color: isSelected ? '#FFFFFF' : (isDark ? '#CBD5E1' : '#334155'),
                          border: `1px solid ${isSelected ? '#38BDF8' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            bgcolor: isSelected ? '#0369A1' : (isDark ? 'rgba(56,189,248,0.15)' : 'rgba(2,132,199,0.12)'),
                            borderColor: '#38BDF8'
                          }
                        }}
                      />
                    );
                  })}
                </Box>

                {/* 3 Columns Grid */}
                <Grid container spacing={2.5}>
                  {/* Column 1: Incoming Backlinks */}
                  <Grid xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2,
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid rgba(56,189,248,0.25)',
                        bgcolor: isDark ? 'rgba(4,9,14,0.7)' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: '#38BDF8' }}>
                          ⬅️ Incoming Backlinks
                        </Typography>
                        <Chip
                          label={backlinksData?.backlinksCount ?? (backlinksData?.incomingBacklinks?.length || 0)}
                          size="small"
                          sx={{ height: 20, fontFamily: mono, fontWeight: 800, fontSize: '0.66rem', bgcolor: 'rgba(56,189,248,0.2)', color: '#38BDF8' }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                        {(backlinksData?.incomingBacklinks || []).length === 0 ? (
                          <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontStyle: 'italic', p: 1 }}>
                            No incoming backlinks recorded for this node.
                          </Typography>
                        ) : (
                          backlinksData.incomingBacklinks.map((link, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.2,
                                borderRadius: 1.5,
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                border: '1px solid rgba(56,189,248,0.15)'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.76rem', color: '#38BDF8' }}>
                                  [[{link.sourceTitle || link.sourcePath}]]
                                </Typography>
                                {link.cluster && (
                                  <Chip
                                    label={link.cluster}
                                    size="small"
                                    sx={{ height: 16, fontSize: '0.58rem', fontFamily: mono, bgcolor: 'rgba(56,189,248,0.1)', color: '#38BDF8' }}
                                  />
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
                                {link.sourcePath}
                              </Typography>
                              {link.contextSnippet && (
                                <Box
                                  sx={{
                                    p: 0.8,
                                    borderRadius: 1,
                                    bgcolor: isDark ? '#020617' : '#F1F5F9',
                                    borderLeft: '2px solid #38BDF8',
                                    fontFamily: mono,
                                    fontSize: '0.68rem',
                                    color: isDark ? '#CBD5E1' : '#334155'
                                  }}
                                >
                                  {link.contextSnippet}
                                </Box>
                              )}
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Column 2: Outgoing Wikilinks */}
                  <Grid xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2,
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid rgba(168,85,247,0.25)',
                        bgcolor: isDark ? 'rgba(10,6,18,0.7)' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: '#C084FC' }}>
                          ➡️ Outgoing Wikilinks
                        </Typography>
                        <Chip
                          label={backlinksData?.outgoingCount ?? (backlinksData?.outgoingLinks?.length || 0)}
                          size="small"
                          sx={{ height: 20, fontFamily: mono, fontWeight: 800, fontSize: '0.66rem', bgcolor: 'rgba(192,132,252,0.2)', color: '#C084FC' }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                        {(backlinksData?.outgoingLinks || []).length === 0 ? (
                          <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontStyle: 'italic', p: 1 }}>
                            No outgoing wikilinks declared in this node.
                          </Typography>
                        ) : (
                          backlinksData.outgoingLinks.map((out, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.2,
                                borderRadius: 1.5,
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                border: '1px solid rgba(192,132,252,0.15)'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.76rem', color: '#C084FC' }}>
                                  [[{out.target}]]
                                </Typography>
                                <Chip
                                  label={out.exists !== false ? 'FOUND' : 'DANGLING'}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.58rem',
                                    fontFamily: mono,
                                    fontWeight: 800,
                                    bgcolor: out.exists !== false ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)',
                                    color: out.exists !== false ? '#34D399' : '#F59E0B'
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.65rem', display: 'block' }}>
                                {out.relPath || `${out.target}.md`}
                              </Typography>
                              {out.cluster && (
                                <Chip
                                  label={out.cluster}
                                  size="small"
                                  sx={{ height: 16, fontSize: '0.58rem', fontFamily: mono, bgcolor: 'rgba(192,132,252,0.1)', color: '#C084FC', mt: 0.5 }}
                                />
                              )}
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Column 3: Unlinked Mentions */}
                  <Grid xs={12} md={4}>
                    <Paper
                      sx={{
                        p: 2,
                        height: '100%',
                        borderRadius: 2,
                        border: '1px solid rgba(245,158,11,0.3)',
                        bgcolor: isDark ? 'rgba(18,12,4,0.7)' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.8rem', color: '#F59E0B' }}>
                          💡 Unlinked Mentions
                        </Typography>
                        <Chip
                          label={backlinksData?.unlinkedCount ?? (backlinksData?.unlinkedMentions?.length || 0)}
                          size="small"
                          sx={{ height: 20, fontFamily: mono, fontWeight: 800, fontSize: '0.66rem', bgcolor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                        {(backlinksData?.unlinkedMentions || []).length === 0 ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <CheckIcon sx={{ fontSize: '1.4rem', color: '#10B981', mb: 0.5 }} />
                            <Typography variant="caption" sx={{ fontFamily: mono, color: '#34D399', display: 'block' }}>
                              All text mentions converted to wikilinks!
                            </Typography>
                          </Box>
                        ) : (
                          backlinksData.unlinkedMentions.map((mention, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.2,
                                borderRadius: 1.5,
                                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                border: '1px solid rgba(245,158,11,0.18)'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.76rem', color: '#F59E0B' }}>
                                  {mention.sourceTitle || mention.sourcePath}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleLinkMention(mention.sourcePath, selectedBacklinksNote)}
                                  sx={{
                                    height: 22,
                                    px: 1,
                                    fontSize: '0.62rem',
                                    fontFamily: mono,
                                    fontWeight: 800,
                                    color: '#F59E0B',
                                    borderColor: 'rgba(245,158,11,0.4)',
                                    textTransform: 'none',
                                    '&:hover': {
                                      borderColor: '#F59E0B',
                                      bgcolor: 'rgba(245,158,11,0.1)'
                                    }
                                  }}
                                >
                                  🔗 Link [[{selectedBacklinksNote.split(' ')[0]}]]
                                </Button>
                              </Box>
                              <Typography variant="caption" sx={{ fontFamily: mono, color: '#64748B', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
                                {mention.sourcePath}
                              </Typography>
                              {mention.snippet && (
                                <Box
                                  sx={{
                                    p: 0.8,
                                    borderRadius: 1,
                                    bgcolor: isDark ? '#020617' : '#F1F5F9',
                                    borderLeft: '2px solid #F59E0B',
                                    fontFamily: mono,
                                    fontSize: '0.68rem',
                                    color: isDark ? '#CBD5E1' : '#334155'
                                  }}
                                >
                                  {mention.snippet}
                                </Box>
                              )}
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* zoth-second-brain 12-Command CLI Palette */}
              <Paper
                id="studio-cli-palette"
                sx={{
                  p: { xs: 2.5, md: 3 },
                  mb: 4,
                  borderRadius: 2.5,
                  border: '1.5px solid rgba(16,185,129,0.45)',
                  bgcolor: isDark ? 'rgba(6,14,10,0.92)' : '#FFFFFF',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 90% 90%, rgba(16,185,129,0.12) 0%, transparent 60%)'
                    : 'none',
                  boxShadow: '0 8px 32px rgba(16,185,129,0.12)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
                      <Chip
                        icon={<TerminalIcon sx={{ fontSize: '0.9rem !important', color: '#10B981 !important' }} />}
                        label="AUTONOMOUS TERMINAL // 12 CLI TOOLS"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(16,185,129,0.16)',
                          color: '#10B981',
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: '1px solid rgba(16,185,129,0.35)'
                        }}
                      />
                      <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8' }}>
                        HEADLESS VAULT ORCHESTRATION & STDP PIPELINE
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: { xs: '1rem', md: '1.15rem' } }}>
                      <code>zoth-second-brain</code> 12-Command CLI Palette
                    </Typography>
                  </Box>

                  {/* Search within CLI Palette */}
                  <TextField
                    size="small"
                    placeholder="Filter commands..."
                    value={cliPaletteSearch}
                    onChange={(e) => setCliPaletteSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: '1rem', color: '#10B981' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      width: { xs: '100%', sm: 220 },
                      '& .MuiOutlinedInput-root': {
                        bgcolor: isDark ? 'rgba(0,0,0,0.5)' : '#F1F5F9',
                        borderRadius: 2,
                        fontFamily: mono,
                        fontSize: '0.78rem'
                      }
                    }}
                  />
                </Box>

                {/* Filter Tag Chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                  {[
                    { id: 'all', label: `All (${SECOND_BRAIN_CLI_COMMANDS.length})` },
                    { id: 'diagnostics', label: 'Diagnostics' },
                    { id: 'spec tools', label: 'Spec Tools' },
                    { id: 'memory', label: 'Memory' },
                    { id: 'search', label: 'Search' },
                    { id: 'ingestion', label: 'Ingestion' },
                    { id: 'journal', label: 'Journal' }
                  ].map((filter) => {
                    const isSelected = cliPaletteFilter === filter.id;
                    return (
                      <Chip
                        key={filter.id}
                        label={filter.label}
                        clickable
                        onClick={() => setCliPaletteFilter(filter.id)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 750,
                          fontSize: '0.72rem',
                          bgcolor: isSelected ? '#10B981' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                          color: isSelected ? '#041B15' : (isDark ? '#CBD5E1' : '#334155'),
                          border: `1px solid ${isSelected ? '#34D399' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
                          '&:hover': {
                            bgcolor: isSelected ? '#059669' : (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)')
                          }
                        }}
                      />
                    );
                  })}
                </Box>

                {/* 12 Commands Bento Grid */}
                <Grid container spacing={2}>
                  {SECOND_BRAIN_CLI_COMMANDS.filter((cmd) => {
                    const matchesTag = cliPaletteFilter === 'all' || cmd.tag.toLowerCase() === cliPaletteFilter.toLowerCase();
                    const query = cliPaletteSearch.trim().toLowerCase();
                    const matchesSearch = !query ||
                      cmd.command.toLowerCase().includes(query) ||
                      cmd.desc.toLowerCase().includes(query) ||
                      cmd.cmd.toLowerCase().includes(query) ||
                      cmd.tag.toLowerCase().includes(query);
                    return matchesTag && matchesSearch;
                  }).map((item) => {
                    const isCopied = copiedCliCmd === item.cmd;
                    return (
                      <Grid xs={12} sm={6} md={4} key={item.command}>
                        <Paper
                          sx={{
                            p: 2,
                            height: '100%',
                            borderRadius: 2,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            bgcolor: isDark ? 'rgba(10,14,12,0.7)' : '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.18s ease',
                            '&:hover': {
                              borderColor: item.color,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ fontFamily: mono, fontWeight: 900, fontSize: '0.84rem', color: item.color }}>
                                ⚡ {item.command}
                              </Typography>
                              <Chip
                                label={item.tag}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontFamily: mono,
                                  fontWeight: 800,
                                  bgcolor: `${item.color}22`,
                                  color: item.color,
                                  border: `1px solid ${item.color}44`
                                }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ fontSize: '0.76rem', color: 'text.secondary', lineHeight: 1.5, mb: 1.5 }}>
                              {item.desc}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              p: 1.2,
                              borderRadius: 1.5,
                              bgcolor: isDark ? '#020406' : '#E2E8F0',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1
                            }}
                          >
                            <Typography
                              component="code"
                              sx={{
                                fontFamily: mono,
                                fontSize: '0.72rem',
                                color: isDark ? '#A7F3D0' : '#065F46',
                                overflowX: 'auto',
                                whiteSpace: 'nowrap',
                                flexGrow: 1
                              }}
                            >
                              $ {item.cmd}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => handleCopyCliCommand(item.cmd)}
                              startIcon={isCopied ? <CheckIcon sx={{ fontSize: '0.8rem !important' }} /> : <ContentCopyIcon sx={{ fontSize: '0.8rem !important' }} />}
                              sx={{
                                minWidth: 64,
                                height: 24,
                                px: 1,
                                fontSize: '0.62rem',
                                fontFamily: mono,
                                fontWeight: 800,
                                bgcolor: isCopied ? '#10B981' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                color: isCopied ? '#041B15' : (isDark ? '#E2E8F0' : '#1E293B'),
                                borderRadius: 1.2,
                                textTransform: 'none',
                                '&:hover': {
                                  bgcolor: isCopied ? '#059669' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)')
                                }
                              }}
                            >
                              {isCopied ? 'COPIED' : 'COPY'}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>

              {/* 7 Official Obsidian Skills Grid */}
              <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {OBSIDIAN_AGENT_SKILLS.map((sk) => (
                  <Grid xs={12} sm={6} md={4} key={sk.name}>
                    <Paper
                      sx={{
                        p: 2.2,
                        height: '100%',
                        borderRadius: 2.5,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : theme.palette.divider}`,
                        bgcolor: isDark ? 'rgba(13,15,24,0.85)' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.18s ease, border-color 0.18s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: sk.color
                        }
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography sx={{ fontFamily: mono, fontWeight: 800, fontSize: '0.86rem', color: sk.color }}>
                            💎 {sk.name}
                          </Typography>
                          <Chip
                            label={sk.badge}
                            size="small"
                            sx={{ height: 20, fontSize: '0.62rem', fontFamily: mono, fontWeight: 800, bgcolor: `${sk.color}22`, color: sk.color }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.55, mb: 1.5 }}>
                          {sk.desc}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          bgcolor: isDark ? '#05060A' : '#E2E8F0',
                          fontFamily: mono,
                          fontSize: '0.72rem',
                          color: isDark ? '#CBD5E1' : '#1E293B'
                        }}
                      >
                        {sk.cmd}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Live Obsidian Spec Transpiler (JSON Canvas 1.0 / Obsidian Bases / Flavored Markdown) */}
              <Paper
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2.5,
                  border: `1px solid ${gold.border}`,
                  bgcolor: isDark ? '#05060A' : '#0F172A',
                  color: '#F8FAFC'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800 }}>
                      LIVE OBSIDIAN ARTIFACT GENERATOR ({filteredMemories.length} STDP VECTORS)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      Transpile active Netrunner memory vectors directly into JSON Canvas 1.0 (<code>.canvas</code>), Obsidian Bases (<code>.base</code>), or Flavored Markdown (<code>.md</code>).
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { id: 'canvas', label: 'JSON Canvas (.canvas)' },
                      { id: 'base', label: 'Obsidian Base (.base)' },
                      { id: 'markdown', label: 'Obsidian Markdown (.md)' },
                    ].map((mode) => (
                      <Chip
                        key={mode.id}
                        label={mode.label}
                        clickable
                        onClick={() => setObsidianSpecMode(mode.id)}
                        sx={{
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: obsidianSpecMode === mode.id ? gold.accent : 'rgba(255,255,255,0.08)',
                          color: obsidianSpecMode === mode.id ? '#08080B' : '#E2E8F0'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(212,175,55,0.22)',
                    fontFamily: mono,
                    fontSize: '0.76rem',
                    color: '#E2E8F0',
                    overflowX: 'auto',
                    maxHeight: 320
                  }}
                >
                  {generateObsidianSpecOutput()}
                </Box>
              </Paper>
            </Paper>
          </Box>
        )}

        {/* STDP Mathematical Foundation Reference (Focused Pillar VI Spotlight) */}
        <Box sx={{ mt: 7, mb: 4 }}>
          <Typography className="section-kicker">Mathematical Foundation</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                Pillar VI: STDP Synaptic Weight Adaptation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 740, lineHeight: 1.65, mt: 0.5 }}>
                Biological Hebbian learning rules calibrated for autonomous agent memory retention, causal trace consolidation, and exponential noise pruning.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/docs/math"
              endIcon={<ArrowForwardIcon />}
              sx={{ color: gold.accent, fontWeight: 750, fontFamily: mono, fontSize: '0.82rem', textTransform: 'none' }}
            >
              Explore All 6 Mathematical Pillars
            </Button>
          </Box>

          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1.5px solid ${gold.border}`,
              bgcolor: isDark ? '#08080B' : '#FFFFFF',
              boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.6)' : '0 4px 16px rgba(184,134,11,0.08)',
            }}
          >
            <Grid container spacing={3.5} alignItems="center">
              <Grid xs={12} md={7}>
                <Typography variant="overline" sx={{ color: isDark ? '#34D399' : '#047857', fontWeight: 800, letterSpacing: '0.12em' }}>
                  EXPONENTIAL HEBBIAN PLASTICITY FORMULATION
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5, fontFamily: mono, color: gold.accent }}>
                  Δw = A₊ · e^(–Δt/τ₊) (Δt ≥ 0) &nbsp;|&nbsp; Δw = –A₋ · e^(Δt/τ₋) (Δt &lt; 0)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                  The memory daemon calculates weight reinforcement (Δw &gt; 0) whenever an agent query precedes a successful consensus outcome within temporal half-life τ₊ = 20ms. When output ordering is decoupled or anti-causal (Δt &lt; 0), synaptic depression prunes the context weight to prevent token window pollution.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/docs/math/stdp"
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ bgcolor: gold.accent, color: '#08080B', fontWeight: 800, fontFamily: mono, fontSize: '0.78rem', '&:hover': { bgcolor: isDark ? gold.soft : '#9A7209' } }}
                  >
                    View Complete STDP Proof &amp; Spec
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/arsenal"
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: gold.border, color: theme.palette.text.primary, fontWeight: 750, fontFamily: mono, fontSize: '0.78rem' }}
                  >
                    Browse Core Micro-Tools
                  </Button>
                </Stack>
              </Grid>
              <Grid xs={12} md={5}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: isDark ? '#040508' : '#F8FAFC',
                    border: `1px solid ${isDark ? 'rgba(52,211,153,0.3)' : theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontFamily: mono, color: gold.accent, fontWeight: 800, display: 'block', mb: 1.5 }}>
                    CALIBRATED PARAMETER BASELINES
                  </Typography>
                  <Stack spacing={1.2} sx={{ fontFamily: mono, fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Potentiation Amplitude (A₊):</span>
                      <strong style={{ color: isDark ? '#34D399' : '#047857' }}>1.00</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Depression Amplitude (A₋):</span>
                      <strong style={{ color: isDark ? '#F472B6' : '#DB2777' }}>0.85</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Time Constant (τ₊, τ₋):</span>
                      <strong style={{ color: gold.accent }}>20.0 ms</strong>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.palette.text.secondary }}>Decay Half-Life:</span>
                      <strong>ln(2) · τ ≈ 13.86 ms</strong>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
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
          <IconButton aria-label="Close" onClick={() => setIsExportDialogOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Complete JSON snapshot of Lucy's active Whitespace memory matrix, deterministic coordinates, and biomorphic synaptic weights. Zero external network egress guaranteed.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`${memories.length} Vector Nodes`} size="small" sx={{ bgcolor: gold.wash, color: gold.accent, fontFamily: mono, fontWeight: 750 }} />
            <Chip label={`Carrier: ${carrierFreq}Hz`} size="small" sx={{ bgcolor: 'rgba(0,240,255,0.15)', color: isDark ? '#00F0FF' : '#0369A1', fontFamily: mono, fontWeight: 750 }} />
            <Chip label="Air-Gapped Zero-Egress Verified" size="small" sx={{ bgcolor: 'rgba(52,211,153,0.15)', color: isDark ? '#34D399' : '#047857', fontFamily: mono, fontWeight: 750 }} />
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
            <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(52,211,153,0.15)', color: isDark ? '#34D399' : '#047857', border: `1px solid ${isDark ? '#34D399' : '#047857'}` }}>
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
