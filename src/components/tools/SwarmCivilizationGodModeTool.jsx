import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Slider,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Unstable_Grid2 as Grid,
  useTheme,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import HubIcon from '@mui/icons-material/Hub';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import { useReality } from '../../context/RealityContext';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Syne", "Space Grotesk", system-ui, sans-serif';

const PANTHEON_RINGS = [
  {
    ring: 'Ring I · Sovereign Archons',
    short: 'RING I',
    role: 'Consensus & DAG Planning',
    ratio: 0.36,
    agents: ['AZOTH', 'HERMES', 'ATHENA', 'APOLLO', 'ARES', 'HEPHAESTUS', 'THOTH'],
  },
  {
    ring: 'Ring II · Tactical Strategists',
    short: 'RING II',
    role: 'Verification & Security Audit',
    ratio: 0.64,
    agents: ['CHRONOS', 'ORION', 'NYX', 'IRIS', 'PROMETHEUS', 'NEMESIS', 'JANUS'],
  },
  {
    ring: 'Ring III · Forge Artisans',
    short: 'RING III',
    role: 'Code, Shaders & Execution',
    ratio: 0.90,
    agents: ['DAEDALUS', 'ARGUS', 'VULCAN', 'ECHO', 'MORPHEUS', 'HELIOS', 'AETHER'],
  },
];

const ALL_AGENTS = PANTHEON_RINGS.flatMap((r, rIdx) =>
  r.agents.map((name, aIdx) => ({
    index: rIdx * 7 + aIdx,
    paneId: `tty-${String(rIdx * 7 + aIdx + 1).padStart(2, '0')}`,
    name,
    ringIndex: rIdx,
    ringName: r.ring,
    ringShort: r.short,
    role: r.role,
    pwd: `/srv/zoth/swarm/${name.toLowerCase()}`,
  }))
);

const HARNESS_OPTIONS = [
  { id: 'hermes-deepseek-flash', label: 'Hermes × DeepSeek Flash', badge: 'deepseek-v4.1-flash' },
  { id: 'zoth-egregore-8147', label: 'Egregore :8147 (3,456 Lenses)', badge: 'zoth-egregore' },
  { id: 'zoth-relay-landlock', label: 'Zoth-Relay :8765 (Landlock)', badge: 'ring-3-ipc' },
  { id: 'local-ollama-vllm', label: 'Local Ollama / vLLM', badge: 'zero-egress' },
];

const SWARM_MISSIONS = [
  {
    id: 'zero-day-triage',
    short: 'CVE Triage & Patch',
    label: 'Autonomous CVE Triage & Ring-3 Patch Synthesis',
    objective: 'Audit binary surface via HexStrike (:8138), isolate sink, synthesize regression test, and verify PBFT quorum.',
  },
  {
    id: 'egregore-deliberation',
    short: 'Egregore 256-Lens Wave',
    label: 'Egregore DeepSeek Flash × Hermes Consensus Sweep',
    objective: 'Fan prompt across co-prime Pantheon lenses on :8147, enforce Design+Logic Codex, and commit STDP engram to :8094.',
  },
  {
    id: 'full-stack-forge',
    short: 'Full-Stack Guardrail Build',
    label: 'Sovereign Web Build & Triple-Viewport Audit',
    objective: 'Compile UI tokens, verify APCA contrast (:8150) & Core Web Vitals (:8128), and validate Schema.org @graph (:8127).',
  },
  {
    id: 'imperator-quests',
    short: 'Civilization Epoch Sync',
    label: 'Zoth Civilization v3.0 — 23-Agent Epoch Sync',
    objective: 'Synchronize Planetary Decrees, Imperator Ranks I-V, and Merkle state root across Zoth Prime.',
  },
];

const PLANETARY_DECREES = [
  { id: 'hermes-flash', name: 'Hermes × DeepSeek Flash', effect: 'Low-latency BYOK reasoning via Nous Hermes Agent across all citizen dialogues' },
  { id: 'golden-harvest', name: 'Golden Harvest Treasury', effect: '+35% resource velocity across Zoth Prime ateliers and civic districts' },
  { id: 'adytum-light', name: 'Adytum Sanctuary Seal', effect: 'Unlocks 22-Key Sanctuary & zero-leak client-side browser meditations' },
  { id: 'trade-surge', name: 'Agora Consensus Surge', effect: 'Synchronizes all 23 Pantheon Citizens & Imperator Quest progression' },
];

const EGREGORE_ARCHETYPES = [
  'archon', 'redteam', 'weaver', 'verifier', 'oracle', 'critic',
  'explorer', 'synthesizer', 'skeptic', 'formalist', 'empiricist', 'minimalist',
  'mechanist', 'bayesian', 'historian', 'adversary', 'craftsman', 'diagnostician',
  'cartographer', 'economist', 'ethicist', 'pedagogue', 'inquisitor', 'arbiter',
];
const EGREGORE_DOMAINS = [
  'systems & concurrency', 'algorithms & complexity', 'security & failure modes',
  'mathematics & invariants', 'data & statistics', 'hardware & cost',
  'networking & protocols', 'storage & state', 'compilers & semantics',
  'operating systems', 'cryptography & trust', 'human factors & UX',
  'economics & incentives', 'physics & physical limits', 'biology & adaptation',
  'law, policy & liability', 'operations & incident response', 'epistemology & measurement',
];
const EGREGORE_STANCES = [
  'first-principles', 'contrarian', 'steelman-the-opposite', 'concrete-examples-only',
  'edge-cases-first', 'back-of-envelope', 'historical-precedent', 'minimal-viable',
];

function sampleEgregoreLenses(seedText, count = 6) {
  let h = 2166136261;
  const s = String(seedText || 'egregore');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let stride = (h % 3453) + 3;
  while (stride % 2 === 0 || stride % 3 === 0) stride = (stride + 1) % 3456 || 5;
  const out = [];
  for (let k = 0; k < count; k += 1) {
    const idx = (h + k * stride) % 3456;
    const a = EGREGORE_ARCHETYPES[idx % 24];
    const d = EGREGORE_DOMAINS[Math.floor(idx / 24) % 18];
    const st = EGREGORE_STANCES[Math.floor(idx / (24 * 18)) % 8];
    out.push({ index: idx, signature: `${a}/${st}`, domain: d, stride });
  }
  return out;
}

export default function SwarmCivilizationGodModeTool({ tool }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { realityId, activeTheme } = useReality();
  const isCivTool = (tool?.id || '').includes('civilization');

  const [missionId, setMissionId] = useState(isCivTool ? 'imperator-quests' : 'zero-day-triage');
  const [activeTab, setActiveTab] = useState(isCivTool ? 2 : 0);
  const [selectedIdx, setSelectedIdx] = useState(1); // Default to HERMES (tty-02)
  const [faultSet, setFaultSet] = useState(() => new Set([19, 20]));
  const [orbitalVelocity, setOrbitalVelocity] = useState(0.8);
  const [paneHarnesses, setPaneHarnesses] = useState(() =>
    Object.fromEntries(
      ALL_AGENTS.map((a) => [
        a.index,
        a.index % 5 === 0 ? 'zoth-egregore-8147' : 'hermes-deepseek-flash',
      ])
    )
  );
  const [cmdInput, setCmdInput] = useState('zoth-egregore tools "audit quorum backpressure & memory recall" --probe');
  const [paneLogs, setPaneLogs] = useState(() =>
    Object.fromEntries(
      ALL_AGENTS.map((a) => [
        a.index,
        [
          `[${a.paneId}] session attached · role="${a.role}" · pwd=${a.pwd}`,
          `[${a.paneId}] harness ready -> ${a.index % 5 === 0 ? 'zoth-egregore (:8147)' : 'hermes x deepseek/deepseek-v4.1-flash'}`,
          `[${a.paneId}] heartbeat ACK · PBFT view=14 · Neuro-Memory(:8094)=ONLINE`,
        ],
      ])
    )
  );
  const [activeDecree, setActiveDecree] = useState(PLANETARY_DECREES[0].id);
  const [egregoreSeed, setEgregoreSeed] = useState('Design a lock-free 21-pane PTY telemetry ring buffer');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMissionId(isCivTool ? 'imperator-quests' : 'zero-day-triage');
    setActiveTab(isCivTool ? 2 : 0);
  }, [isCivTool]);

  const canvasRef = useRef(null);
  const nodeHitRegionsRef = useRef([]);

  const tokens = useMemo(
    () => ({
      accent: isDark ? '#34D399' : '#059669',
      accentSoft: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(5, 150, 105, 0.09)',
      accentBorder: isDark ? 'rgba(52, 211, 153, 0.34)' : 'rgba(5, 150, 105, 0.32)',
      mint: isDark ? '#4BE3C1' : '#0B7D63',
      gold: isDark ? '#D4AF37' : '#8C6510',
      goldSoft: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(140, 101, 16, 0.10)',
      danger: isDark ? '#FB7185' : '#BE123C',
      dangerSoft: isDark ? 'rgba(251, 113, 133, 0.14)' : 'rgba(190, 18, 60, 0.09)',
      surface: isDark ? '#0B1017' : '#F8F6F0',
      surfaceInset: isDark ? '#06090E' : '#EFECE3',
      codeBg: isDark ? '#05070B' : '#EAE6DA',
      border: isDark ? 'rgba(148, 179, 202, 0.16)' : 'rgba(15, 22, 30, 0.14)',
      ink: isDark ? '#EDF3F8' : '#0F161E',
      muted: isDark ? '#94A3B8' : '#475569',
      canvasBg: isDark ? '#05080D' : '#EFECE4',
      canvasRing: isDark ? 'rgba(148, 179, 202, 0.16)' : 'rgba(15, 22, 30, 0.14)',
    }),
    [isDark]
  );

  const activeMission = useMemo(
    () => SWARM_MISSIONS.find((m) => m.id === missionId) || SWARM_MISSIONS[0],
    [missionId]
  );

  const selectedAgent = ALL_AGENTS[selectedIdx] || ALL_AGENTS[0];
  const selectedHarnessId = paneHarnesses[selectedAgent.index] || 'hermes-deepseek-flash';

  const quorumStats = useMemo(() => {
    const total = 21;
    const faulty = faultSet.size;
    const honest = Math.max(0, total - faulty);
    const bftSafe = faulty <= 6; // N = 3f + 1 => f_max = 6
    const consensusPct = Math.round((honest / total) * 100);
    const merkleRoot = `0x${(honest * 9973 + faulty * 313 + selectedIdx * 17)
      .toString(16)
      .padStart(6, '0')}c4e91b`;
    return { total, honest, faulty, bftSafe, consensusPct, merkleRoot };
  }, [faultSet, selectedIdx]);

  const handleFaultSlider = (_, count) => {
    const n = Number(count);
    const next = new Set();
    for (let i = 0; i < n; i += 1) {
      next.add(20 - i);
    }
    setFaultSet(next);
  };

  const toggleNodeFault = useCallback((idx) => {
    setFaultSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const dispatchCommand = (broadcast = false) => {
    const trimmed = cmdInput.trim();
    if (!trimmed) return;
    const stamp = new Date().toISOString().slice(11, 19);
    setPaneLogs((prev) => {
      const next = { ...prev };
      const targets = broadcast
        ? ALL_AGENTS.filter((a) => !faultSet.has(a.index))
        : [selectedAgent];
      targets.forEach((ag) => {
        const hId = paneHarnesses[ag.index] || 'hermes-deepseek-flash';
        const lines = [...(next[ag.index] || [])];
        lines.push(`[${stamp}] $ ${trimmed}`);
        lines.push(
          `[${stamp}] -> [${hId}] OK · quorum=${quorumStats.honest}/21 · merkle=${quorumStats.merkleRoot}`
        );
        next[ag.index] = lines.slice(-10);
      });
      return next;
    });
  };

  // High-DPI Responsive 3-Ring Orbital Constellation Canvas (Zero Overlapping Text)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId = 0;
    let phase = 0;

    const render = () => {
      const parent = canvas.parentElement;
      const cssW = Math.max(240, Math.floor(parent?.clientWidth || 420));
      const cssH = 276;
      const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = tokens.canvasBg;
      ctx.fillRect(0, 0, cssW, cssH);

      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      const maxR = Math.min(cssW, cssH) * 0.43;

      const positions = [];
      PANTHEON_RINGS.forEach((ringObj, rIdx) => {
        const r = maxR * ringObj.ratio;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = tokens.canvasRing;
        ctx.lineWidth = 1;
        ctx.stroke();

        const dir = rIdx % 2 === 0 ? 1 : -1;
        ringObj.agents.forEach((name, aIdx) => {
          const globalIdx = rIdx * 7 + aIdx;
          const ang =
            (aIdx / 7) * Math.PI * 2 +
            (reduced ? 0 : phase * dir * (0.55 - rIdx * 0.12));
          const x = cx + Math.cos(ang) * r;
          const y = cy + Math.sin(ang) * r;
          positions.push({
            index: globalIdx,
            name,
            x,
            y,
            faulty: faultSet.has(globalIdx),
            selected: globalIdx === selectedIdx,
          });
        });
      });

      nodeHitRegionsRef.current = positions;

      // Consensus spokes & cross-ring chords
      positions.forEach((n, idx) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = n.faulty
          ? 'rgba(244, 63, 94, 0.28)'
          : n.selected
          ? tokens.gold
          : isDark
          ? 'rgba(52, 211, 153, 0.22)'
          : 'rgba(5, 150, 105, 0.22)';
        ctx.lineWidth = n.selected ? 1.6 : 1;
        ctx.stroke();

        const peer = positions[(idx + 7) % positions.length];
        if (peer && !n.faulty && !peer.faulty) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(peer.x, peer.y);
          ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.11)' : 'rgba(140, 101, 16, 0.12)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // Agent nodes
      positions.forEach((n) => {
        if (n.selected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 9.5, 0, Math.PI * 2);
          ctx.strokeStyle = tokens.gold;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.selected ? 5.2 : 4.0, 0, Math.PI * 2);
        ctx.fillStyle = n.faulty ? tokens.danger : tokens.accent;
        ctx.fill();
      });

      // Central PBFT Quorum Core
      ctx.beginPath();
      ctx.arc(cx, cy, 13, 0, Math.PI * 2);
      ctx.fillStyle = quorumStats.bftSafe ? tokens.accentSoft : tokens.dangerSoft;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = quorumStats.bftSafe ? tokens.accent : tokens.danger;
      ctx.fill();

      if (!reduced) {
        phase += 0.012 * orbitalVelocity;
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [tokens, faultSet, selectedIdx, orbitalVelocity, quorumStats.bftSafe, isDark]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best = null;
    let bestDist = 22;
    nodeHitRegionsRef.current.forEach((n) => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    });
    if (best) {
      setSelectedIdx(best.index);
      if (activeTab !== 0) setActiveTab(0);
    }
  };

  const egregoreLenses = useMemo(() => sampleEgregoreLenses(egregoreSeed, 6), [egregoreSeed]);

  const swarmYamlExport = useMemo(() => {
    const paneLines = ALL_AGENTS.map(
      (a) =>
        `    - pane: "${a.paneId}"\n      agent: "${a.name}"\n      ring: "${a.ringShort}"\n      harness: "${
          paneHarnesses[a.index]
        }"\n      status: "${faultSet.has(a.index) ? 'byzantine_fault' : 'healthy'}"`
    ).join('\n');
    return `# ZothOS 21-Agent Swarm Multiplexer & PBFT Quorum Manifest
version: "2.6.0"
reality_profile: "${realityId}"
commander: "${activeTheme?.botName || 'AZOTH'}"
egregore_endpoint: "http://127.0.0.1:8147/v1"
mission:
  id: "${activeMission.id}"
  objective: "${activeMission.objective}"
consensus:
  protocol: "PBFT-3f+1"
  total_panes: 21
  honest_panes: ${quorumStats.honest}
  injected_faults_f: ${quorumStats.faulty}
  quorum_sealed: ${quorumStats.bftSafe}
  merkle_epoch_root: "${quorumStats.merkleRoot}"
panes:
${paneLines}`;
  }, [realityId, activeTheme, activeMission, quorumStats, paneHarnesses, faultSet]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(swarmYamlExport).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([swarmYamlExport], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoth-swarm-21-${activeMission.id}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Telemetry & Ecosystem Bridge Bar */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Grid container spacing={1.25} sx={{ flex: 1 }}>
          {[
            {
              k: 'ACTIVE PTY PANES',
              v: `${quorumStats.honest} / 21 ONLINE`,
              tone: quorumStats.bftSafe ? tokens.accent : tokens.danger,
            },
            {
              k: 'PBFT 3f+1 QUORUM',
              v: quorumStats.bftSafe ? `SEALED (f=${quorumStats.faulty} <= 6)` : `BREACHED (f=${quorumStats.faulty} > 6)`,
              tone: quorumStats.bftSafe ? tokens.accent : tokens.danger,
            },
            {
              k: 'DEFAULT HARNESS',
              v: 'HERMES × DEEPSEEK FLASH',
              tone: tokens.mint,
            },
            {
              k: 'EPOCH MERKLE ROOT',
              v: quorumStats.merkleRoot,
              tone: tokens.gold,
            },
          ].map((cell) => (
            <Grid xs={6} sm={3} key={cell.k}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  height: '100%',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.63rem',
                    letterSpacing: '0.1em',
                    color: tokens.muted,
                    fontWeight: 700,
                  }}
                >
                  {cell.k}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: cell.tone,
                    mt: 0.35,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {cell.v}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
          <Button
            size="small"
            variant="contained"
            href="https://zoth-egregore.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              minHeight: 40,
              px: 1.75,
              bgcolor: tokens.mint,
              color: isDark ? '#04120E' : '#FFFFFF',
              fontFamily: mono,
              fontWeight: 800,
              fontSize: '0.73rem',
              textTransform: 'none',
              '&:hover': { filter: 'brightness(1.08)', bgcolor: tokens.mint },
            }}
          >
            Egregore AI Model (Beta)
          </Button>
          <Button
            size="small"
            variant="outlined"
            href="https://zoth-civilization.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              minHeight: 40,
              px: 1.5,
              borderColor: tokens.accentBorder,
              color: tokens.accent,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: '0.73rem',
              textTransform: 'none',
            }}
          >
            Zoth Civilization v3.0
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Left Stage: Responsive High-DPI 3-Ring Constellation & Controls */}
        <Grid xs={12} md={5}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor: tokens.surface,
                border: `1px solid ${tokens.border}`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.25, flexWrap: 'wrap', gap: 1 }}
              >
                <Typography
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    color: tokens.accent,
                    fontWeight: 800,
                  }}
                >
                  3-RING PBFT TOPOLOGY · CLICK ANY NODE
                </Typography>
                <Chip
                  size="small"
                  label={`${selectedAgent.paneId} · ${selectedAgent.name}`}
                  sx={{
                    height: 22,
                    fontFamily: mono,
                    fontSize: '0.67rem',
                    fontWeight: 800,
                    bgcolor: tokens.goldSoft,
                    color: tokens.gold,
                    border: `1px solid ${tokens.border}`,
                  }}
                />
              </Stack>

              <Box
                sx={{
                  width: '100%',
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  border: `1px solid ${tokens.border}`,
                  bgcolor: tokens.canvasBg,
                }}
              >
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  aria-label="Interactive 21-agent 3-ring PBFT swarm topology canvas"
                  style={{ width: '100%', height: 276, display: 'block', cursor: 'pointer' }}
                />
              </Box>

              {/* Ring Legend Outside Canvas (Zero Overlap) */}
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 1.25, flexWrap: 'wrap', gap: 1 }}
              >
                {PANTHEON_RINGS.map((r) => (
                  <Typography
                    key={r.short}
                    sx={{ fontFamily: mono, fontSize: '0.65rem', color: tokens.muted }}
                  >
                    <strong style={{ color: tokens.ink }}>{r.short}:</strong> {r.role}
                  </Typography>
                ))}
              </Stack>
            </Box>

            {/* Mission Preset + Fault & Cadence Controls */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: tokens.surface,
                border: `1px solid ${tokens.border}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  letterSpacing: '0.1em',
                  color: tokens.muted,
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                ACTIVE SWARM DIRECTIVE
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', useFlexGap: true, mb: 1.25 }}>
                {SWARM_MISSIONS.map((m) => {
                  const active = missionId === m.id;
                  return (
                    <Button
                      key={m.id}
                      size="small"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setMissionId(m.id)}
                      sx={{
                        minHeight: 34,
                        px: 1.25,
                        fontFamily: mono,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: active ? tokens.accent : 'transparent',
                        color: active ? (isDark ? '#04120C' : '#FFFFFF') : tokens.ink,
                        borderColor: active ? tokens.accent : tokens.border,
                        '&:hover': {
                          bgcolor: active ? tokens.accent : tokens.accentSoft,
                          borderColor: tokens.accent,
                        },
                      }}
                    >
                      {m.short}
                    </Button>
                  );
                })}
              </Stack>
              <Typography sx={{ fontSize: '0.78rem', color: tokens.muted, mb: 2, lineHeight: 1.5 }}>
                {activeMission.objective}
              </Typography>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: tokens.muted, fontWeight: 700 }}>
                    BYZANTINE FAULTS: f = {quorumStats.faulty} (MAX 6)
                  </Typography>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={quorumStats.faulty}
                    onChange={handleFaultSlider}
                    aria-label="Byzantine Fault Count"
                    sx={{ color: quorumStats.bftSafe ? tokens.accent : tokens.danger }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: tokens.muted, fontWeight: 700 }}>
                    ORBITAL CADENCE: {orbitalVelocity.toFixed(1)}x
                  </Typography>
                  <Slider
                    min={0}
                    max={2.0}
                    step={0.1}
                    value={orbitalVelocity}
                    onChange={(_, v) => setOrbitalVelocity(Number(v))}
                    aria-label="Orbital Cadence"
                    sx={{ color: tokens.gold }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Grid>

        {/* Right Stage: 21-Pane PTY Multiplexer, Egregore Bridge, Civilization & YAML */}
        <Grid xs={12} md={7}>
          <Box
            sx={{
              borderRadius: 2,
              bgcolor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 1,
                borderBottom: `1px solid ${tokens.border}`,
                bgcolor: tokens.surfaceInset,
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  fontFamily: mono,
                  fontSize: '0.71rem',
                  fontWeight: 700,
                  textTransform: 'none',
                },
              }}
            >
              <Tab icon={<TerminalIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="21-Pane PTY Matrix" />
              <Tab icon={<HubIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Egregore (:8147) Bridge" />
              <Tab icon={<GroupsIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Civilization v3.0" />
              <Tab icon={<CodeIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Topology (.yaml)" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {/* TAB 0: 21-PANE PTY TERMINAL MATRIX */}
              {activeTab === 0 && (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(3, minmax(0, 1fr))',
                        sm: 'repeat(7, minmax(0, 1fr))',
                      },
                      gap: 0.75,
                    }}
                  >
                    {ALL_AGENTS.map((ag) => {
                      const isSel = ag.index === selectedIdx;
                      const isFault = faultSet.has(ag.index);
                      return (
                        <Box
                          key={ag.paneId}
                          component="button"
                          type="button"
                          onClick={() => setSelectedIdx(ag.index)}
                          sx={{
                            p: 0.75,
                            minHeight: 44,
                            borderRadius: 1,
                            cursor: 'pointer',
                            textAlign: 'left',
                            bgcolor: isSel ? tokens.accentSoft : tokens.surfaceInset,
                            border: `1.5px solid ${
                              isSel ? tokens.accent : isFault ? tokens.danger : tokens.border
                            }`,
                            color: tokens.ink,
                            transition: 'border-color 140ms ease',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontFamily: mono, fontSize: '0.6rem', color: tokens.muted }}>
                              {String(ag.index + 1).padStart(2, '0')}
                            </Typography>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: isFault ? tokens.danger : tokens.accent,
                              }}
                            />
                          </Stack>
                          <Typography
                            sx={{
                              fontFamily: mono,
                              fontSize: '0.63rem',
                              fontWeight: 800,
                              color: isFault ? tokens.danger : tokens.ink,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ag.name}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Selected PTY Inspector */}
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      bgcolor: tokens.surfaceInset,
                      border: `1px solid ${tokens.border}`,
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1.25}
                      sx={{ mb: 1.5 }}
                    >
                      <Box>
                        <Typography sx={{ fontFamily: display, fontWeight: 800, fontSize: '0.98rem', color: tokens.ink }}>
                          {selectedAgent.paneId} · {selectedAgent.name}{' '}
                          <Typography component="span" sx={{ fontFamily: mono, fontSize: '0.72rem', color: tokens.gold }}>
                            ({selectedAgent.ringName})
                          </Typography>
                        </Typography>
                        <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: tokens.muted }}>
                          PWD: {selectedAgent.pwd} · {selectedAgent.role}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', useFlexGap: true }}>
                        <TextField
                          select
                          size="small"
                          label="AI Harness"
                          value={selectedHarnessId}
                          onChange={(e) =>
                            setPaneHarnesses((prev) => ({
                              ...prev,
                              [selectedAgent.index]: e.target.value,
                            }))
                          }
                          sx={{
                            minWidth: 215,
                            '& .MuiInputBase-root': { fontFamily: mono, fontSize: '0.72rem' },
                          }}
                        >
                          {HARNESS_OPTIONS.map((h) => (
                            <MenuItem key={h.id} value={h.id} sx={{ fontFamily: mono, fontSize: '0.72rem' }}>
                              {h.label}
                            </MenuItem>
                          ))}
                        </TextField>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => toggleNodeFault(selectedAgent.index)}
                          sx={{
                            minHeight: 40,
                            fontFamily: mono,
                            fontSize: '0.69rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderColor: faultSet.has(selectedAgent.index) ? tokens.accent : tokens.danger,
                            color: faultSet.has(selectedAgent.index) ? tokens.accent : tokens.danger,
                          }}
                        >
                          {faultSet.has(selectedAgent.index) ? 'Heal Node' : 'Inject Fault'}
                        </Button>
                      </Stack>
                    </Stack>

                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: tokens.codeBg,
                        border: `1px solid ${tokens.border}`,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        lineHeight: 1.6,
                        color: tokens.ink,
                        maxHeight: 156,
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {(paneLogs[selectedAgent.index] || []).join('\n')}
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1.25, flexWrap: 'wrap', useFlexGap: true, alignItems: 'center' }}
                    >
                      <TextField
                        size="small"
                        value={cmdInput}
                        onChange={(e) => setCmdInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') dispatchCommand(false);
                        }}
                        placeholder="Dispatch command to PTY..."
                        inputProps={{ 'aria-label': 'PTY command input' }}
                        sx={{
                          flex: '1 1 240px',
                          minWidth: 0,
                          '& .MuiInputBase-root': { fontFamily: mono, fontSize: '0.74rem' },
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SendIcon sx={{ fontSize: 14 }} />}
                        onClick={() => dispatchCommand(false)}
                        sx={{
                          minHeight: 40,
                          px: 1.5,
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderColor: tokens.accentBorder,
                          color: tokens.accent,
                        }}
                      >
                        Send Pane
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => dispatchCommand(true)}
                        sx={{
                          minHeight: 40,
                          px: 1.5,
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          bgcolor: tokens.accent,
                          color: isDark ? '#04120C' : '#FFFFFF',
                        }}
                      >
                        Broadcast ({quorumStats.honest})
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {/* TAB 1: EGREGORE (:8147) STANDALONE MODEL BRIDGE */}
              {activeTab === 1 && (
                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: tokens.surfaceInset,
                      border: `1px solid ${tokens.accentBorder}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                      sx={{ mb: 1 }}
                    >
                      <Typography sx={{ fontFamily: display, fontWeight: 800, fontSize: '1.05rem', color: tokens.mint }}>
                        EGREGORE (zoth-egregore · v0.1.0-beta)
                      </Typography>
                      <Chip
                        size="small"
                        label="DEEPSEEK FLASH × NOUS HERMES"
                        sx={{
                          fontFamily: mono,
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          bgcolor: tokens.goldSoft,
                          color: tokens.gold,
                        }}
                      />
                    </Stack>
                    <Typography sx={{ fontSize: '0.84rem', color: tokens.muted, lineHeight: 1.6, mb: 1.5 }}>
                      Pair any Swarm Multiplexer pane with <strong>EGREGORE</strong> on <code>127.0.0.1:8147/v1</code>: one OpenAI-compatible face backed by 3,456 co-prime Pantheon lenses, zero-call Beta-posterior stopping, a distilled Design-Director + Formal-Logic Codex, and native routing across 77 ZothOS &amp; Zoth Studio tools.
                    </Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: tokens.gold, mb: 1.5 }}>
                      ROADMAP: Expanded Tests Coming Soon · Public Benchmarks Coming Soon · HuggingFace Coming Soon
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Button
                        size="small"
                        variant="contained"
                        href="https://zoth-egregore.netlify.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          minHeight: 40,
                          bgcolor: tokens.mint,
                          color: isDark ? '#04120E' : '#FFFFFF',
                          fontFamily: mono,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          textTransform: 'none',
                        }}
                      >
                        Open Dedicated Egregore Site
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        href="https://github.com/1nc0gn30/zoth-egregore"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          minHeight: 40,
                          borderColor: tokens.border,
                          color: tokens.ink,
                          fontFamily: mono,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          textTransform: 'none',
                        }}
                      >
                        1nc0gn30/zoth-egregore
                      </Button>
                    </Stack>
                  </Box>

                  <TextField
                    size="small"
                    fullWidth
                    label="Sample Co-Prime Pantheon Lenses (gcd(stride, 3456) = 1)"
                    value={egregoreSeed}
                    onChange={(e) => setEgregoreSeed(e.target.value)}
                    sx={{ '& .MuiInputBase-root': { fontFamily: mono, fontSize: '0.75rem' } }}
                  />

                  <Grid container spacing={1}>
                    {egregoreLenses.map((l) => (
                      <Grid xs={12} sm={6} key={l.index}>
                        <Box
                          sx={{
                            p: 1.1,
                            borderRadius: 1,
                            bgcolor: tokens.codeBg,
                            border: `1px solid ${tokens.border}`,
                          }}
                        >
                          <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: tokens.mint }}>
                            #{String(l.index).padStart(4, '0')} {l.signature}
                          </Typography>
                          <Typography sx={{ fontFamily: mono, fontSize: '0.65rem', color: tokens.muted }}>
                            {l.domain}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}

              {/* TAB 2: ZOTH CIVILIZATION v3.0 */}
              {activeTab === 2 && (
                <Stack spacing={1.75}>
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      bgcolor: tokens.surfaceInset,
                      border: `1px solid ${tokens.border}`,
                    }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800, color: tokens.accent }}>
                      Recommended Lightweight AI Path: DeepSeek Flash via Hermes Agent (Nous Research)
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: tokens.muted, mt: 0.5, lineHeight: 1.55 }}>
                      Explore Zoth Prime immediately in zero-key Autonomous Sandbox mode (23 Pantheon Agents, Imperator Quests I-V, 22-Key Sanctuary), or connect DeepSeek Flash via Hermes Agent for live BYOK citizen dialogues.
                    </Typography>
                  </Box>

                  <Grid container spacing={1}>
                    {PLANETARY_DECREES.map((d) => {
                      const sel = activeDecree === d.id;
                      return (
                        <Grid xs={12} sm={6} key={d.id}>
                          <Box
                            onClick={() => setActiveDecree(d.id)}
                            sx={{
                              p: 1.35,
                              borderRadius: 1.5,
                              cursor: 'pointer',
                              bgcolor: sel ? tokens.accentSoft : tokens.surfaceInset,
                              border: `1.5px solid ${sel ? tokens.accent : tokens.border}`,
                            }}
                          >
                            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: sel ? tokens.accent : tokens.ink }}>
                              {d.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: tokens.muted, mt: 0.35, lineHeight: 1.4 }}>
                              {d.effect}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      variant="contained"
                      href="https://zoth-civilization.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        minHeight: 40,
                        bgcolor: tokens.accent,
                        color: isDark ? '#04120C' : '#FFFFFF',
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'none',
                      }}
                    >
                      Launch Zoth Civilization v3.0
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      href="https://zoth-civilization.netlify.app/gallery.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        minHeight: 40,
                        borderColor: tokens.border,
                        color: tokens.ink,
                        fontFamily: mono,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      22-Key Sanctuary Studio
                    </Button>
                  </Stack>
                </Stack>
              )}

              {/* TAB 3: TOPOLOGY YAML EXPORT */}
              {activeTab === 3 && (
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1.25, flexWrap: 'wrap', gap: 1 }}
                  >
                    <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: tokens.muted }}>
                      21-Pane Swarm Multiplexer &amp; PBFT Manifest (`.yaml`)
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                        onClick={handleCopy}
                        sx={{
                          minHeight: 38,
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          textTransform: 'none',
                          borderColor: tokens.border,
                          color: tokens.ink,
                        }}
                      >
                        {copied ? 'Copied' : 'Copy YAML'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{
                          minHeight: 38,
                          fontFamily: mono,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          bgcolor: tokens.accent,
                          color: isDark ? '#04120C' : '#FFFFFF',
                        }}
                      >
                        Export .yaml
                      </Button>
                    </Stack>
                  </Stack>

                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: tokens.codeBg,
                      border: `1px solid ${tokens.border}`,
                      fontFamily: mono,
                      fontSize: '0.73rem',
                      color: tokens.ink,
                      overflowX: 'auto',
                      maxHeight: 320,
                    }}
                  >
                    {swarmYamlExport}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
