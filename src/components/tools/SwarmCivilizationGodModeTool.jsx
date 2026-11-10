import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Slider,
  Tabs,
  Tab,
  Unstable_Grid2 as Grid,
  LinearProgress,
  Alert,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useReality } from '../../context/RealityContext';
import { ZothBotCharacterCanvas } from '../RealityZothBotHUD';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow, titleBaseSx, ledeSx } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Syne", "Space Grotesk", system-ui, sans-serif';

const PANTHEON_RINGS = [
  {
    ring: 'Inner Ring I — Sovereign Archons',
    radius: 42,
    agents: ['AZOTH', 'HERMES', 'ATHENA', 'APOLLO', 'ARES', 'HEPHAESTUS', 'THOTH'],
  },
  {
    ring: 'Middle Ring II — Tactical Strategists',
    radius: 68,
    agents: ['CHRONOS', 'ORION', 'NYX', 'IRIS', 'PROMETHEUS', 'NEMESIS', 'JANUS'],
  },
  {
    ring: 'Outer Ring III — Forge Artisans',
    radius: 92,
    agents: ['DAEDALUS', 'ARGUS', 'VULCAN', 'ECHO', 'MORPHEUS', 'HELIOS', 'AETHER'],
  },
];

const SWARM_MISSIONS = [
  {
    id: 'imperator-quests',
    label: 'Zoth Civilization v3.0 — Imperator Quests & 22-Key Sanctuary',
    objective: 'Command 23 Pantheon Agents across Zoth Prime, issue 4 Planetary Decrees, complete Imperator Ranks I–V, and link DeepSeek Flash via Hermes Agent (Nous Research).',
    quorumRequired: 16,
  },
  {
    id: 'zero-day-triage',
    label: 'Autonomous CVE Triage & Patch Synthesis',
    objective: 'Decompile target ELF/PHP binary, isolate heap/CGI sink, synthesize YARA-X rule, and verify patch in Ring-3 sandbox.',
    quorumRequired: 15,
  },
  {
    id: 'full-stack-forge',
    label: 'Sovereign Micro-SaaS Build & Guardrail Audit',
    objective: 'Architect zero-egress client engine, wire Stripe + Solana Tip rails, generate Schema.org JSON-LD, and pass triple-viewport check.',
    quorumRequired: 15,
  },
  {
    id: 'civilization-consensus',
    label: '23-Agent Civilization State Epoch Commit',
    objective: 'Synchronize Hebbian STDP episodic memory graph, verify Merkle state root across Zoth Prime & Pantheon rings, and seal epoch.',
    quorumRequired: 16,
  },
];

const PLANETARY_DECREES = [
  { id: 'golden-harvest', name: '🌾 Golden Harvest', effect: '+35% Treasury Yield across City Desk & POD ateliers' },
  { id: 'adytum-light', name: '🕯️ Adytum Illumination', effect: 'Unlocks 22-Key Sanctuary & zero-leak browser meditations' },
  { id: 'hermes-flash', name: '⚡ Hermes × DeepSeek Flash', effect: 'Low-latency BYOK reasoning via Hermes Agent (Nous Research)' },
  { id: 'trade-surge', name: '🏛️ Agora Trade Surge', effect: 'Synchronizes all 23 Pantheon Citizens & Imperator Quest XP' },
];

const EGREGORE_ARCHETYPES = [
  'ORACLE', 'SENTINEL', 'ARCHITECT', 'AZOTH', 'NEXUS', 'DRACO', 'AETHER', 'MIMIR',
  'JANUS', 'FULCRUM', 'SCRIBE', 'ARTIFICER', 'WARDEN', 'ANVIL', 'CANOPY', 'PYTHIA',
  'HELIOS', 'LETHE', 'PROTEUS', 'TELOS', 'CHORUS', 'DAEDALUS', 'ABYSS', 'PANTHEON',
];
const EGREGORE_DOMAINS = [
  'CORRECTNESS', 'PERFORMANCE', 'COST', 'SECURITY', 'RELIABILITY', 'SCALABILITY',
  'INTEGRITY', 'UX', 'MAINTAINABILITY', 'OBSERVABILITY', 'CONCURRENCY', 'STANDARDS',
  'EDGE-CASES', 'ETHICS', 'DEPLOYMENT', 'HUMAN', 'ECONOMICS', 'LONG-TERM',
];
const EGREGORE_STANCES = [
  'advocate', 'skeptic', 'refuter', 'quant', 'reductive', 'empirical', 'decisive', 'recursive',
];

function sampleEgregoreLenses(seedText, count = 8) {
  let h = 2166136261;
  const s = String(seedText || 'egregore');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let stride = (h % 3455) + 1;
  while (stride % 2 === 0 || stride % 3 === 0) stride = (stride % 3455) + 1;
  const out = [];
  for (let k = 0; k < count; k++) {
    const idx = (h + k * stride) % 3456;
    const a = EGREGORE_ARCHETYPES[idx % 24];
    const d = EGREGORE_DOMAINS[Math.floor(idx / 24) % 18];
    const st = EGREGORE_STANCES[Math.floor(idx / (24 * 18)) % 8];
    out.push({ index: idx, signature: `${a}·${d}·${st}`, archetype: a, domain: d, stance: st });
  }
  return out;
}

export default function SwarmCivilizationGodModeTool({ tool }) {
  const { realityId, activeTheme } = useReality();
  const isCivTool = (tool?.id || '').includes('civilization');
  const [missionId, setMissionId] = useState(isCivTool ? 'imperator-quests' : 'zero-day-triage');
  const [activeDecree, setActiveDecree] = useState(PLANETARY_DECREES[2].id);
  const [byzantineFaults, setByzantineFaults] = useState(2);
  const [orbitalVelocity, setOrbitalVelocity] = useState(1.0);
  const [activeTab, setActiveTab] = useState(isCivTool ? 2 : 0);
  const [egregoreSeed, setEgregoreSeed] = useState('distributed consensus under packet loss');
  const [egregoreMode, setEgregoreMode] = useState('auto');
  const [copied, setCopied] = useState(false);

  const egregoreSample = useMemo(() => sampleEgregoreLenses(egregoreSeed, 8), [egregoreSeed]);
  const egregoreSim = useMemo(() => {
    const disagree = Math.min(0.88, Math.max(0.08, ((egregoreSeed.length * 13) % 77) / 100));
    if (egregoreMode === 'probe') {
      return { minds: 8, waves: 1, agreement: +(1 - disagree * 0.4).toFixed(3), confidence: 0.964, stoppedBy: 'probe_wave' };
    }
    if (egregoreMode === '256') {
      return { minds: 256, waves: 4, agreement: +(0.81 - disagree * 0.25).toFixed(3), confidence: 0.992, stoppedBy: 'fixed_256' };
    }
    const needEsc = disagree > 0.42;
    return needEsc
      ? { minds: 72, waves: 3, agreement: 0.742, confidence: 0.958, stoppedBy: 'asc_beta_posterior' }
      : { minds: 8, waves: 1, agreement: 0.912, confidence: 0.981, stoppedBy: 'asc_beta_posterior' };
  }, [egregoreSeed, egregoreMode]);

  useEffect(() => {
    setMissionId(isCivTool ? 'imperator-quests' : 'zero-day-triage');
    setActiveTab(isCivTool ? 2 : 0);
  }, [isCivTool]);

  const canvasRef = useRef(null);

  const activeMission = useMemo(
    () => SWARM_MISSIONS.find((m) => m.id === missionId) || SWARM_MISSIONS[0],
    [missionId]
  );

  // Byzantine Fault Tolerance math: N = 21 agents -> max tolerable faults f_max = floor((21 - 1) / 3) = 6
  const quorumStats = useMemo(() => {
    const total = 21;
    const honest = Math.max(0, total - byzantineFaults);
    const bftSafe = byzantineFaults <= 6;
    const consensusPct = Math.round((honest / total) * 100);
    return {
      total,
      honest,
      faulty: byzantineFaults,
      bftSafe,
      consensusPct,
      merkleRoot: `0x${(honest * 9973 + byzantineFaults * 313).toString(16).padStart(8, '0')}f9a4c2e1`,
    };
  }, [byzantineFaults]);

  // 60fps 21-Agent Pantheon Orbital & Consensus Mesh Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const render = () => {
      t += 0.02 * orbitalVelocity;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#05070B';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.34;
      const cy = h * 0.5;

      const nodePositions = [];
      let globalIdx = 0;

      PANTHEON_RINGS.forEach((ringObj, rIdx) => {
        const r = ringObj.radius;
        ctx.strokeStyle = `${activeTheme.primary}28`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        const dir = rIdx % 2 === 0 ? 1 : -1;
        ringObj.agents.forEach((name, aIdx) => {
          const ang = (aIdx / 7) * Math.PI * 2 + t * dir * (0.7 - rIdx * 0.15);
          const nx = cx + Math.cos(ang) * r;
          const ny = cy + Math.sin(ang) * r;
          const isFaulty = globalIdx < byzantineFaults;
          nodePositions.push({ x: nx, y: ny, name, isFaulty, ring: rIdx + 1 });
          globalIdx++;
        });
      });

      // Draw consensus chords between honest nodes and center Archon core
      nodePositions.forEach((n, idx) => {
        ctx.strokeStyle = n.isFaulty ? 'rgba(244,63,94,0.35)' : `${activeTheme.primary}30`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();

        // Cross-ring chord
        const next = nodePositions[(idx + 7) % nodePositions.length];
        if (next && !n.isFaulty && !next.isFaulty) {
          ctx.strokeStyle = `${activeTheme.secondary}22`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      });

      // Draw 21 agent nodes
      nodePositions.forEach((n) => {
        ctx.fillStyle = n.isFaulty ? '#F43F5E' : activeTheme.primary;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.isFaulty ? 4.2 : 3.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center Sovereign Core pulse
      ctx.fillStyle = quorumStats.bftSafe ? activeTheme.primary : '#F43F5E';
      ctx.beginPath();
      ctx.arc(cx, cy, 7 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Right-hand Telemetry Readout on Canvas
      const rx = w - 265;
      ctx.fillStyle = activeTheme.primary;
      ctx.font = `700 10px ${mono}`;
      ctx.fillText(`21-AGENT PANTHEON BFT QUORUM`, rx, 36);

      ctx.fillStyle = '#F5F0E8';
      ctx.font = `500 9.5px ${mono}`;
      ctx.fillText(`COMMANDER:   ${activeTheme.botName}`, rx, 58);
      ctx.fillText(`HONEST NODES: ${quorumStats.honest} / 21`, rx, 76);
      ctx.fillText(`FAULTY (f):   ${quorumStats.faulty} (MAX f=6)`, rx, 94);
      ctx.fillText(`MERKLE ROOT:  ${quorumStats.merkleRoot}`, rx, 112);

      ctx.fillStyle = quorumStats.bftSafe ? '#10B981' : '#F43F5E';
      ctx.font = `700 10px ${mono}`;
      ctx.fillText(
        quorumStats.bftSafe ? `STATUS: 3f+1 QUORUM SEALED` : `STATUS: QUORUM DEGRADED (f > 6)`,
        rx,
        136
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTheme, byzantineFaults, orbitalVelocity, quorumStats]);

  const swarmYamlExport = useMemo(() => {
    return `# ZothOS 21-Agent Swarm & Civilization Quorum Topology
version: "3.2.0"
reality_profile: "${realityId}"
commander_bot: "${activeTheme.botName}"
mission:
  id: "${activeMission.id}"
  objective: "${activeMission.objective}"
consensus:
  protocol: "Byzantine-PBFT-3f+1"
  total_agents: 21
  honest_nodes: ${quorumStats.honest}
  fault_tolerance_f: ${quorumStats.faulty}
  bft_verified: ${quorumStats.bftSafe}
  merkle_epoch_root: "${quorumStats.merkleRoot}"
rings:
  - name: "Inner Ring I (Archons)"
    agents: [AZOTH, HERMES, ATHENA, APOLLO, ARES, HEPHAESTUS, THOTH]
  - name: "Middle Ring II (Strategists)"
    agents: [CHRONOS, ORION, NYX, IRIS, PROMETHEUS, NEMESIS, JANUS]
  - name: "Outer Ring III (Artisans)"
    agents: [DAEDALUS, ARGUS, VULCAN, ECHO, MORPHEUS, HELIOS, AETHER]`;
  }, [realityId, activeTheme.botName, activeMission, quorumStats]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard?.writeText(swarmYamlExport)?.catch?.(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([swarmYamlExport], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoth-21-swarm-${activeMission.id}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        mb: 5,
        borderRadius: activeTheme.borderRadius || '12px',
        bgcolor: 'rgba(9, 11, 17, 0.9)',
        border: `1px solid ${activeTheme.border}`,
        boxShadow: activeTheme.cardGlow,
      }}
    >
      <SovereignEyebrow accent="#D4AF37" right="Swarm & Core">
        {isCivTool ? 'zoth-civilization' : 'zoth-swarm-multiplexer'}
      </SovereignEyebrow>
      <SovereignBand
        seed={isCivTool ? 'zoth-civilization' : 'zoth-swarm-multiplexer'}
        eyebrow={'Swarm & Core'}
        caption={isCivTool ? 'Zoth Civilization v3.0 (23 Pantheon Agents)' : '21-Agent Swarm Multiplexer'}
        label={
          isCivTool
            ? 'Zoth Civilization v3.0 — 23 Pantheon Agents, Imperator Quests & 22-Key Sanctuary'
            : '21-Agent Swarm Multiplexer — Zoth sovereign visualisation'
        }
      />
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, flexWrap: 'wrap', useFlexGap: true }}>
            <Chip
              label="✦ 100% FREE & OPEN ACCESS"
              size="small"
              sx={{
                bgcolor: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                border: '1px solid #10B981',
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
            <Chip
              icon={<HubIcon sx={{ fontSize: '0.95rem !important', color: `${activeTheme.primary} !important` }} />}
              label={
                isCivTool
                  ? 'ZOTH CIVILIZATION v3.0 • 23 PANTHEON AGENTS'
                  : '21-AGENT PANTHEON SWARM & CIVILIZATION MULTIPLEXER'
              }
              size="small"
              sx={{
                bgcolor: `${activeTheme.primary}18`,
                color: activeTheme.primary,
                border: `1px solid ${activeTheme.border}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
            <Chip
              label={quorumStats.bftSafe ? `BFT QUORUM SEALED (${quorumStats.honest}/21)` : `BFT BREACH (${quorumStats.faulty} FAULTS)`}
              size="small"
              sx={{
                bgcolor: quorumStats.bftSafe ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.18)',
                color: quorumStats.bftSafe ? '#10B981' : '#F43F5E',
                border: `1px solid ${quorumStats.bftSafe ? 'rgba(16,185,129,0.35)' : 'rgba(244,63,94,0.45)'}`,
                fontFamily: mono,
                fontWeight: 800,
                fontSize: '0.68rem',
              }}
            />
          </Stack>
          <Typography variant="h5" sx={{ ...titleBaseSx, fontFamily: display, fontWeight: 800 }}>
            {isCivTool
              ? 'Zoth Civilization v3.0 — Sphere of Zoth Prime & Imperator Deck'
              : '21-Agent Swarm Multiplexer & Byzantine Civilization Hub'}
          </Typography>
          <Typography variant="body2" sx={{ ...ledeSx, color: 'text.secondary', mt: 0.4 }}>
            {isCivTool
              ? 'Explore the autonomous 23-agent society on Zoth Prime, issue Planetary Decrees, unlock the 22-Key Sanctuary, or connect DeepSeek Flash via Hermes Agent (Nous Research).'
              : 'Orchestrate the 3 concentric Pantheon rings, simulate Byzantine fault tolerance (N = 3f + 1), and export deterministic swarm topologies.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true, alignItems: 'center' }}>
          <Button
            size="small"
            variant="contained"
            href="https://zoth-civilization.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#10B981',
              color: '#04130D',
              fontWeight: 900,
              fontSize: '0.72rem',
              fontFamily: mono,
              textTransform: 'none',
              '&:hover': { bgcolor: '#34D399' },
            }}
          >
            🌐 Play Zoth Civilization v3.0 ↗
          </Button>
          <Button
            size="small"
            variant="contained"
            href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#D4AF37',
              color: '#08080B',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: mono,
              textTransform: 'none',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            ☕ Buy Us a Coffee
          </Button>
          <Button
            size="small"
            variant="outlined"
            href="solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK"
            sx={{
              borderColor: '#10B981',
              color: '#10B981',
              fontWeight: 800,
              fontSize: '0.72rem',
              fontFamily: mono,
              textTransform: 'none',
              '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
            }}
          >
            ◎ Solana Tip
          </Button>
          {SWARM_MISSIONS.map((m) => (
            <Button
              key={m.id}
              size="small"
              variant={missionId === m.id ? 'contained' : 'outlined'}
              onClick={() => setMissionId(m.id)}
              sx={{
                fontFamily: mono,
                fontSize: '0.69rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: missionId === m.id ? activeTheme.primary : 'transparent',
                color: missionId === m.id ? '#06080D' : activeTheme.primary,
                borderColor: activeTheme.border,
              }}
            >
              {m.label.split(' &')[0]}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Left Column: 60fps 21-Agent Orbital Canvas & Dials */}
        <Grid xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#05070B',
                border: `1px solid ${activeTheme.border}`,
                position: 'relative',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, fontWeight: 700 }}>
                  60FPS 3-RING PANTHEON ORBITAL CONSTELLATION
                </Typography>
                <Chip
                  label={`MERKLE: ${quorumStats.merkleRoot}`}
                  size="small"
                  sx={{ height: 20, fontFamily: mono, fontSize: '0.64rem', bgcolor: `${activeTheme.primary}20`, color: activeTheme.primary }}
                />
              </Stack>
              <canvas
                ref={canvasRef}
                width={540}
                height={210}
                style={{ width: '100%', height: 210, display: 'block', borderRadius: 6 }}
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid xs={12} sm={6}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    INJECTED BYZANTINE FAULTS (f = {byzantineFaults} / MAX 6)
                  </Typography>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={byzantineFaults}
                    onChange={(_, v) => setByzantineFaults(v)}
                    sx={{ color: quorumStats.bftSafe ? activeTheme.primary : '#F43F5E' }}
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: 'text.secondary' }}>
                    ORBITAL PHASE VELOCITY ({orbitalVelocity.toFixed(1)}x)
                  </Typography>
                  <Slider
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    value={orbitalVelocity}
                    onChange={(_, v) => setOrbitalVelocity(v)}
                    sx={{ color: activeTheme.primary }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Pantheon Ring Roster & Swarm YAML Export */}
        <Grid xs={12} md={6}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 38,
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'none',
                },
              }}
            >
              <Tab icon={<GroupsIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Pantheon Rings (21)" />
              <Tab icon={<CodeIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Swarm Topology (.yaml)" />
              <Tab icon={<TerminalIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Civilization v3.0 (23)" />
              <Tab icon={<TerminalIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Egregore (3,456 Lenses)" />
            </Tabs>
          </Box>

          {activeTab === 2 && (
            <Stack spacing={1.5}>
              <Alert
                severity="info"
                sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.35)' }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', fontWeight: 800, color: '#34D399' }}>
                  Recommended Lightweight AI Path: DeepSeek Flash via Hermes Agent (Nous Research)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                  Play immediately in zero-key Autonomous Sandbox mode (23 Pantheon Agents, Imperator Quests I–V, 22-Key Sanctuary), or connect DeepSeek Flash (`deepseek-v4-flash-0731`) through Hermes Agent for live BYOK dialogues & browser-only meditations.
                </Typography>
              </Alert>

              <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: activeTheme.primary }}>
                ISSUE PLANETARY DECREE ON ZOTH PRIME
              </Typography>
              <Grid container spacing={1}>
                {PLANETARY_DECREES.map((d) => {
                  const sel = activeDecree === d.id;
                  return (
                    <Grid xs={12} sm={6} key={d.id}>
                      <Box
                        onClick={() => setActiveDecree(d.id)}
                        sx={{
                          p: 1.3,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          bgcolor: sel ? `${activeTheme.primary}1F` : '#06080E',
                          border: sel ? `1.5px solid ${activeTheme.primary}` : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <Typography sx={{ fontFamily: mono, fontSize: '0.71rem', fontWeight: 800, color: sel ? activeTheme.primary : '#F5F0E8' }}>
                          {d.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary', mt: 0.35, lineHeight: 1.35 }}>
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
                  sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, bgcolor: activeTheme.primary, color: '#05070B' }}
                >
                  Open Live Sphere World ↗
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  href="https://zoth-civilization.netlify.app/gallery.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: activeTheme.primary, borderColor: activeTheme.border }}
                >
                  22-Key Sanctuary Studio ↗
                </Button>
              </Stack>
            </Stack>
          )}

          {activeTab === 0 && (
            <Stack spacing={1.5}>
              <Alert
                severity={quorumStats.bftSafe ? 'success' : 'error'}
                icon={quorumStats.bftSafe ? <VerifiedUserIcon fontSize="small" /> : <WarningAmberIcon fontSize="small" />}
                sx={{ bgcolor: 'rgba(10, 13, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.74rem', fontWeight: 800 }}>
                  {activeMission.label} — {quorumStats.consensusPct}% Honest Agreement
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                  {activeMission.objective}
                </Typography>
              </Alert>

              {PANTHEON_RINGS.map((r, rIdx) => (
                <Box
                  key={r.ring}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: '#06080E',
                    border: `1px solid ${activeTheme.border}`,
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: activeTheme.primary, mb: 0.75 }}>
                    {r.ring}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
                    {r.agents.map((ag, aIdx) => {
                      const globalIdx = rIdx * 7 + aIdx;
                      const faulty = globalIdx < byzantineFaults;
                      return (
                        <Chip
                          key={ag}
                          label={`${ag} ${faulty ? '• FAULT' : '• OK'}`}
                          size="small"
                          sx={{
                            fontFamily: mono,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: faulty ? 'rgba(244,63,94,0.16)' : `${activeTheme.primary}16`,
                            color: faulty ? '#FDA4AF' : '#F5F0E8',
                            border: `1px solid ${faulty ? 'rgba(244,63,94,0.4)' : activeTheme.border}`,
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}

          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', color: 'text.secondary' }}>
                  21-Agent Swarm Quorum Manifest (`.yaml`)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={handleCopy}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', color: activeTheme.primary, borderColor: activeTheme.border }}
                  >
                    {copied ? 'Copied' : 'Copy YAML'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{ fontFamily: mono, fontSize: '0.7rem', bgcolor: activeTheme.primary, color: '#05070B', fontWeight: 800 }}
                  >
                    Export .yaml
                  </Button>
                </Stack>
              </Stack>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  m: 0,
                  borderRadius: 1.5,
                  bgcolor: '#05070B',
                  border: `1px solid ${activeTheme.border}`,
                  fontFamily: mono,
                  fontSize: '0.73rem',
                  overflowX: 'auto',
                  maxHeight: 310,
                }}
              >
                {swarmYamlExport}
              </Box>
            </Box>
          )}

          {activeTab === 3 && (
            <Stack spacing={1.5}>
              <Alert
                severity="success"
                sx={{ bgcolor: 'rgba(75, 227, 193, 0.08)', border: '1px solid rgba(75, 227, 193, 0.35)' }}
              >
                <Typography sx={{ fontFamily: mono, fontSize: '0.73rem', fontWeight: 800, color: '#4BE3C1' }}>
                  Zoth Egregore v1.0 (:8147) — 1 Model × 3,456 Co-Prime Lenses → 1 Answer
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                  Engineered via Nous Hermes: Self-MoA (arXiv:2502.00674) + Beta-posterior Adaptive-Consistency (arXiv:2305.11860). Walks 24 Archetypes × 18 Domains × 8 Stances with co-prime stride so every wave maximizes perspective diversity.
                </Typography>
              </Alert>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
                  { id: 'probe', label: 'zoth-egregore:probe (8)' },
                  { id: 'auto', label: 'zoth-egregore (adaptive)' },
                  { id: '256', label: 'zoth-egregore:256' },
                ].map((m) => (
                  <Chip
                    key={m.id}
                    label={m.label}
                    size="small"
                    onClick={() => setEgregoreMode(m.id)}
                    sx={{
                      fontFamily: mono,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      bgcolor: egregoreMode === m.id ? 'rgba(75,227,193,0.18)' : 'rgba(255,255,255,0.04)',
                      color: egregoreMode === m.id ? '#4BE3C1' : 'text.secondary',
                      border: egregoreMode === m.id ? '1px solid #4BE3C1' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </Stack>

              <Box
                component="input"
                value={egregoreSeed}
                onChange={(e) => setEgregoreSeed(e.target.value)}
                aria-label="Egregore prompt seed"
                placeholder="Enter question seed to compute co-prime lens stride..."
                sx={{
                  width: '100%',
                  p: 1.1,
                  borderRadius: 1.5,
                  bgcolor: '#05070B',
                  border: `1px solid ${activeTheme.border}`,
                  color: '#F5F0E8',
                  fontFamily: mono,
                  fontSize: '0.73rem',
                }}
              />

              <Box sx={{ p: 1.2, borderRadius: 1.5, bgcolor: '#05070B', border: '1px solid rgba(75,227,193,0.25)' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', color: '#4BE3C1', fontWeight: 800, mb: 0.8 }}>
                  WAVE PROJECTION: {egregoreSim.minds} MINDS · {egregoreSim.waves} WAVE(S) · AGREEMENT {egregoreSim.agreement} · P(LEADER)={egregoreSim.confidence} ({egregoreSim.stoppedBy})
                </Typography>
                <Stack spacing={0.5}>
                  {egregoreSample.map((l) => (
                    <Box key={l.index} sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '0.66rem', color: '#CBD5E1' }}>
                      <span>#{String(l.index).padStart(4, '0')} {l.signature}</span>
                      <span style={{ color: '#94A3B8' }}>{l.stance}</span>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
