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
    id: 'zero-day-triage',
    label: 'Autonomous CVE Triage & Patch Synthesis',
    objective: 'Decompile target ELF/PHP binary, isolate heap/CGI sink, synthesize YARA-X rule, and verify patch in Ring-3 sandbox.',
    quorumRequired: 15,
  },
  {
    id: 'full-stack-forge',
    label: 'Sovereign Micro-SaaS Build & Guardrail Audit',
    objective: 'Architect zero-egress client engine, wire Stripe + Solana DePay rails, generate Schema.org JSON-LD, and pass triple-viewport check.',
    quorumRequired: 15,
  },
  {
    id: 'civilization-consensus',
    label: '21-Agent Civilization State Epoch Commit',
    objective: 'Synchronize Hebbian STDP episodic memory graph, verify Merkle state root across all 3 Pantheon rings, and seal epoch.',
    quorumRequired: 15,
  },
];

export default function SwarmCivilizationGodModeTool() {
  const { realityId, activeTheme } = useReality();
  const [missionId, setMissionId] = useState(SWARM_MISSIONS[0].id);
  const [byzantineFaults, setByzantineFaults] = useState(2);
  const [orbitalVelocity, setOrbitalVelocity] = useState(1.0);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

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
      navigator.clipboard.writeText(swarmYamlExport);
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
              icon={<HubIcon sx={{ fontSize: '0.95rem !important', color: `${activeTheme.primary} !important` }} />}
              label="21-AGENT PANTHEON SWARM & CIVILIZATION MULTIPLEXER"
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
          <Typography variant="h5" sx={{ fontFamily: display, fontWeight: 800 }}>
            21-Agent Swarm Multiplexer & Byzantine Civilization Hub
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
            Orchestrate the 3 concentric Pantheon rings, simulate Byzantine fault tolerance (<code>N = 3f + 1</code>), and export deterministic swarm topologies.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
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
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 38,
                  fontFamily: mono,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                },
              }}
            >
              <Tab icon={<GroupsIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Pantheon Rings (21)" />
              <Tab icon={<CodeIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Swarm Topology (.yaml)" />
            </Tabs>
          </Box>

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
        </Grid>
      </Grid>
    </Paper>
  );
}
