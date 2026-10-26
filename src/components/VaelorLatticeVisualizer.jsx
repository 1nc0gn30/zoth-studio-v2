import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, Button, Chip, Stack, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import MemoryIcon from '@mui/icons-material/Memory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const VALIDATORS = [
  { id: 'VAL-01', name: 'US-East', region: 'us-east-1', flag: '🇺🇸', color: '#38BDF8' },
  { id: 'VAL-02', name: 'EU-Central', region: 'eu-central-1', flag: '🇩🇪', color: '#F59E0B' },
  { id: 'VAL-03', name: 'Asia-East', region: 'ap-northeast-1', flag: '🇯🇵', color: '#10B981' },
  { id: 'VAL-04', name: 'ZothOS-Core', region: 'edge-node :8140', flag: '⚡', color: '#FFD700' },
  { id: 'VAL-05', name: 'Neuro-Cortex', region: 'global-anycast', flag: '🌐', color: '#C084FC' }
];

const ACCOUNTS = [
  { handle: '@zoth', role: 'Compute Node', color: '#FFD700', blocks: 19 },
  { handle: '@sprig', role: 'Merchant POS', color: '#34D399', blocks: 38 },
  { handle: '@hatch', role: 'Agent Workspace', color: '#38BDF8', blocks: 14 },
  { handle: '@citizen', role: 'Passkey Wallet', color: '#E879F9', blocks: 68 },
  { handle: '@neal', role: 'Founder Core', color: '#F59E0B', blocks: 24 }
];

export default function VaelorLatticeVisualizer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Telemetry HUD state
  const [hudStats, setHudStats] = useState({
    activeChains: 5,
    quorumFinality: '5/5 Ed25519',
    lastLatency: '14.2ms',
    gasFee: '$0.00 Feeless',
    lastEvent: 'Account-Lattice DAG active • 5 Sovereign BFT Validators online'
  });
  const [activePulseMode, setActivePulseMode] = useState(null);

  // Visual simulation state
  const simStateRef = useRef({
    time: 0,
    lasers: [],
    packets: [],
    waves: [],
    blocks: {},
    particles: []
  });

  // Initialize or reset micro-chain blocks
  useEffect(() => {
    const blocks = {};
    ACCOUNTS.forEach((acc, i) => {
      blocks[acc.handle] = [
        { id: `b_${acc.handle}_0`, height: acc.blocks - 2, type: 'GENESIS', xOffset: -40 },
        { id: `b_${acc.handle}_1`, height: acc.blocks - 1, type: 'TRANSFER', xOffset: 0 },
        { id: `b_${acc.handle}_2`, height: acc.blocks, type: 'CONFIRMED', xOffset: 40 }
      ];
    });
    simStateRef.current.blocks = blocks;

    // Ambient floating lattice particles
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
    simStateRef.current.particles = particles;
  }, []);

  // 1. Broadcast Feeless Tx Pulse
  const handleFeelessTxPulse = useCallback(() => {
    setActivePulseMode('FEELSS_PULSE');
    const sender = '@citizen';
    const recipient = '@sprig';
    const latency = (Math.random() * 4 + 11.2).toFixed(1);

    setHudStats(prev => ({
      ...prev,
      lastLatency: `${latency}ms`,
      gasFee: '$0.00 Gas Free',
      lastEvent: `[BFT 5/5] Feeless transfer ${sender} → ${recipient} finalized in ${latency}ms ($0.00 gas • 2.5% cashback)`
    }));

    // Spawn animated packet from citizen microchain to sprig microchain
    simStateRef.current.packets.push({
      fromHandle: sender,
      toHandle: recipient,
      progress: 0,
      duration: 55, // ~900ms
      color: '#34D399',
      label: '15.00 ◈ VLR (Gas: $0)'
    });

    // Spawn 5 validator laser quorums targeting the recipient chain
    VALIDATORS.forEach(v => {
      simStateRef.current.lasers.push({
        valId: v.id,
        targetHandle: recipient,
        progress: 0,
        duration: 40,
        color: v.color
      });
    });

    setTimeout(() => setActivePulseMode(null), 1200);
  }, []);

  // 2. Trigger PoUW Block Wave
  const handlePouwBlockWave = useCallback(() => {
    setActivePulseMode('POUW_WAVE');
    const reward = (Math.random() * 3 + 14.5).toFixed(2);
    const latency = (Math.random() * 3 + 10.5).toFixed(1);

    setHudStats(prev => ({
      ...prev,
      lastLatency: `${latency}ms`,
      gasFee: '$0.00 Gas Free',
      lastEvent: `[PoUW MINT] Cognitive audit wave verified across 5 BFT validators: +${reward} ◈ VLR minted on @zoth chain`
    }));

    // Spawn expansive cognitive wave from @zoth
    simStateRef.current.waves.push({
      originHandle: '@zoth',
      radius: 0,
      maxRadius: 360,
      color: '#FFD700',
      alpha: 1.0
    });

    // Convergence lasers back from all 5 validators to @zoth
    VALIDATORS.forEach(v => {
      simStateRef.current.lasers.push({
        valId: v.id,
        targetHandle: '@zoth',
        progress: 0,
        duration: 45,
        color: '#FFD700'
      });
    });

    setTimeout(() => setActivePulseMode(null), 1400);
  }, []);

  // 3. Simulate Shielded Pedersen Tx
  const handleShieldedPedersenTx = useCallback(() => {
    setActivePulseMode('SHIELDED_TX');
    const cmtHash = Math.random().toString(16).substring(2, 8);
    const latency = (Math.random() * 4 + 12.8).toFixed(1);

    setHudStats(prev => ({
      ...prev,
      lastLatency: `${latency}ms`,
      gasFee: '$0.00 Gas Free',
      lastEvent: `[PEDERSEN ZK] Confidential cmt_${cmtHash}.. attested with auditor view-key vk_757 (zero plaintext disclosure)`
    }));

    // Spawn shielded cryptochrome packet from @neal to @citizen
    simStateRef.current.packets.push({
      fromHandle: '@neal',
      toHandle: '@citizen',
      progress: 0,
      duration: 65,
      color: '#C084FC',
      label: `cmt_${cmtHash}... [Pedersen ZK]`
    });

    // Dual view-key laser verification from validators
    ['VAL-01', 'VAL-04', 'VAL-05'].forEach(valId => {
      simStateRef.current.lasers.push({
        valId,
        targetHandle: '@citizen',
        progress: 0,
        duration: 45,
        color: '#C084FC'
      });
    });

    setTimeout(() => setActivePulseMode(null), 1300);
  }, []);

  // Main Canvas Render Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = Math.max(380, Math.min(460, rect.width * 0.45));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      simStateRef.current.time += 0.016;
      const t = simStateRef.current.time;

      ctx.clearRect(0, 0, width, height);

      // Background subtle space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isDark) {
        bgGrad.addColorStop(0, '#06070B');
        bgGrad.addColorStop(1, '#020306');
      } else {
        bgGrad.addColorStop(0, '#F8FAFC');
        bgGrad.addColorStop(1, '#EDF2F7');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle lattice grid lines
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ambient drifting lattice particles
      ctx.fillStyle = isDark ? 'rgba(212,175,55,0.3)' : 'rgba(184,134,11,0.25)';
      simStateRef.current.particles.forEach(p => {
        p.x = (p.x + p.vx + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Layout Geometry
      // 1. Validator positions in an arched constellation at top (Y: 55 to 75)
      const valPositions = {};
      const valCount = VALIDATORS.length;
      const valMarginX = width * 0.12;
      const valStepX = (width - valMarginX * 2) / (valCount - 1);
      VALIDATORS.forEach((v, i) => {
        const vx = valMarginX + i * valStepX;
        const archOffset = Math.sin((i / (valCount - 1)) * Math.PI) * 16;
        const vy = 55 - archOffset;
        valPositions[v.id] = { x: vx, y: vy, ...v };
      });

      // 2. Account micro-chain pipelines across bottom (Y: 135 to height - 40)
      const accPositions = {};
      const accCount = ACCOUNTS.length;
      const accTopY = 135;
      const accStepY = (height - accTopY - 30) / Math.max(1, accCount - 1);
      ACCOUNTS.forEach((acc, i) => {
        const ay = accTopY + i * accStepY;
        accPositions[acc.handle] = { y: ay, ...acc };
      });

      // Inter-validator BFT ring threads
      ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.18)' : 'rgba(212,175,55,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      VALIDATORS.forEach((v, i) => {
        const pos = valPositions[v.id];
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Account-Lattice Parallel Micro-Chains
      ACCOUNTS.forEach((acc) => {
        const accPos = accPositions[acc.handle];
        const chainY = accPos.y;

        // Pipeline track
        const lineGrad = ctx.createLinearGradient(0, chainY, width, chainY);
        lineGrad.addColorStop(0, 'rgba(255,255,255,0.01)');
        lineGrad.addColorStop(0.2, isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
        lineGrad.addColorStop(0.8, isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
        lineGrad.addColorStop(1, 'rgba(255,255,255,0.01)');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, chainY);
        ctx.lineTo(width - 30, chainY);
        ctx.stroke();

        // Handle Badge on left
        const badgeX = 85;
        ctx.fillStyle = isDark ? 'rgba(10,14,20,0.85)' : '#FFFFFF';
        ctx.strokeStyle = acc.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(badgeX - 60, chainY - 14, 115, 28, 6);
        ctx.fill();
        ctx.stroke();

        // Account text
        ctx.fillStyle = acc.color;
        ctx.font = `bold 11px ${mono}`;
        ctx.textAlign = 'left';
        ctx.fillText(acc.handle, badgeX - 52, chainY + 4);

        // Chain height label
        ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
        ctx.font = `9px ${mono}`;
        ctx.textAlign = 'right';
        ctx.fillText(`h:${acc.blocks}`, badgeX + 48, chainY + 4);

        // Draw micro-blocks along this chain
        const blockSpacing = Math.min(80, (width - 240) / 4);
        const startBlockX = 220;
        for (let b = 0; b < 4; b++) {
          const bx = startBlockX + b * blockSpacing;
          const isLatest = b === 3;

          // Block connecting link
          if (b > 0) {
            ctx.strokeStyle = acc.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx - blockSpacing + 12, chainY);
            ctx.lineTo(bx - 12, chainY);
            ctx.stroke();

            // Directional arrow head
            ctx.fillStyle = acc.color;
            ctx.beginPath();
            ctx.moveTo(bx - 10, chainY);
            ctx.lineTo(bx - 15, chainY - 3);
            ctx.lineTo(bx - 15, chainY + 3);
            ctx.closePath();
            ctx.fill();
          }

          // Block node rectangle
          const bSize = isLatest ? 20 : 16;
          ctx.fillStyle = isLatest ? acc.color : (isDark ? '#0D131A' : '#E2E8F0');
          ctx.strokeStyle = acc.color;
          ctx.lineWidth = isLatest ? 2 : 1;
          ctx.beginPath();
          ctx.roundRect(bx - bSize / 2, chainY - bSize / 2, bSize, bSize, 4);
          ctx.fill();
          ctx.stroke();

          // Block pulsing aura if latest
          if (isLatest) {
            const pulse = (Math.sin(t * 4) + 1) * 0.5;
            ctx.strokeStyle = acc.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4 + pulse * 0.4;
            ctx.beginPath();
            ctx.arc(bx, chainY, bSize * 0.9 + pulse * 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      });

      // Draw PoUW Cognitive Waves
      simStateRef.current.waves = simStateRef.current.waves.filter(w => {
        w.radius += 4;
        w.alpha -= 0.015;
        if (w.alpha <= 0 || w.radius > w.maxRadius) return false;

        const origin = accPositions[w.originHandle];
        if (!origin) return false;

        const ox = 220 + 3 * Math.min(80, (width - 240) / 4);
        const oy = origin.y;

        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = Math.max(0, w.alpha);
        ctx.beginPath();
        ctx.arc(ox, oy, w.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Second inner resonance harmonic
        if (w.radius > 40) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ox, oy, w.radius * 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
        return true;
      });

      // Draw Ed25519 Quorum Lasers from Validators to targets
      simStateRef.current.lasers = simStateRef.current.lasers.filter(l => {
        l.progress += 1 / l.duration;
        if (l.progress >= 1) return false;

        const val = valPositions[l.valId];
        const acc = accPositions[l.targetHandle];
        if (!val || !acc) return false;

        const targetX = 220 + 3 * Math.min(80, (width - 240) / 4);
        const targetY = acc.y;

        const curX = val.x + (targetX - val.x) * l.progress;
        const curY = val.y + (targetY - val.y) * l.progress;

        // Laser beam line
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = (1 - l.progress) * 0.85;
        ctx.beginPath();
        ctx.moveTo(val.x, val.y);
        ctx.lineTo(curX, curY);
        ctx.stroke();

        // Laser head spark
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(curX, curY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
        return true;
      });

      // Draw Packets moving between accounts
      simStateRef.current.packets = simStateRef.current.packets.filter(p => {
        p.progress += 1 / p.duration;
        if (p.progress >= 1) return false;

        const fromAcc = accPositions[p.fromHandle];
        const toAcc = accPositions[p.toHandle];
        if (!fromAcc || !toAcc) return false;

        const blockSpacing = Math.min(80, (width - 240) / 4);
        const startX = 220 + 2 * blockSpacing;
        const endX = 220 + 3 * blockSpacing;
        const startY = fromAcc.y;
        const endY = toAcc.y;

        // Bezier arch curve between chains
        const midX = (startX + endX) / 2 + 30;
        const midY = (startY + endY) / 2 + (startY < endY ? -25 : 25);

        const u = p.progress;
        const px = (1 - u) * (1 - u) * startX + 2 * (1 - u) * u * midX + u * u * endX;
        const py = (1 - u) * (1 - u) * startY + 2 * (1 - u) * u * midY + u * u * endY;

        // Packet trajectory trace
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Packet glowing orb
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Packet label
        ctx.fillStyle = p.color;
        ctx.font = `bold 9px ${mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(p.label, px, py - 10);

        return true;
      });

      // Draw 5 BFT Validators at top
      VALIDATORS.forEach((v) => {
        const val = valPositions[v.id];
        const isPulse = activePulseMode !== null;

        // Validator outer glow ring
        ctx.strokeStyle = val.color;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = isDark ? '#05080E' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(val.x, val.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Flag / Icon
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val.flag, val.x, val.y + 4);

        // Validator ID & Region label
        ctx.fillStyle = isDark ? '#F1F5F9' : '#0F172A';
        ctx.font = `bold 10px ${mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(val.id, val.x, val.y + 28);

        ctx.fillStyle = val.color;
        ctx.font = `8px ${mono}`;
        ctx.fillText(val.name, val.x, val.y + 38);

        // Ed25519 signature pulse aura
        if (isPulse) {
          ctx.strokeStyle = val.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(val.x, val.y, 22 + Math.sin(t * 8) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDark, activePulseMode]);

  return (
    <Paper
      id="vaelor-lattice-3d-visualizer"
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: '1.5px solid rgba(212,175,55,0.4)',
        bgcolor: isDark ? 'rgba(7,9,14,0.96)' : '#FFFFFF',
        boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Visualizer Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
            <MemoryIcon sx={{ color: '#FFD700', fontSize: '1.4rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: '"Syne", sans-serif', letterSpacing: '-0.01em' }}>
              Asynchronous Account-Lattice DAG &amp; 5-Validator BFT Quorum
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem' }}>
            Real-time visual telemetry of Vaelor's feeless parallel micro-chains with instant 5/5 Ed25519 Byzantine Fault Tolerant consensus.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<CheckCircleIcon sx={{ color: '#10B981 !important', fontSize: '0.9rem !important' }} />}
            label="5/5 BFT Quorum Finalized"
            size="small"
            sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#34D399', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
          />
          <Chip
            label="DAG Latency: ~14ms"
            size="small"
            sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontFamily: mono, fontWeight: 800, fontSize: '0.68rem' }}
          />
        </Box>
      </Box>

      {/* Telemetry HUD Strip */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          bgcolor: isDark ? '#030508' : '#F1F5F9',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                PARALLEL CHAINS
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 900, color: '#FFD700', fontSize: '0.82rem' }}>
                5 Active Chains
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                BFT CONSENSUS
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 900, color: '#34D399', fontSize: '0.82rem' }}>
                {hudStats.quorumFinality}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                LAST PULSE
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 900, color: '#38BDF8', fontSize: '0.82rem' }}>
                {hudStats.lastLatency}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontSize: '0.64rem', display: 'block', fontWeight: 800 }}>
                GAS EXPENSE
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 900, color: '#E879F9', fontSize: '0.82rem' }}>
                {hudStats.gasFee}
              </Typography>
            </Box>
          </Box>

          <Typography variant="caption" sx={{ fontFamily: mono, color: isDark ? '#E2E8F0' : '#1E293B', fontSize: '0.72rem', maxWidth: { sm: 420 }, textAlign: { sm: 'right' } }}>
            <code>{hudStats.lastEvent}</code>
          </Typography>
        </Stack>
      </Paper>

      {/* 60FPS Interactive HTML5 Canvas Container */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: { xs: 320, sm: 380, md: 440 },
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: isDark ? '#04060A' : '#F8FAFC',
          border: '1px solid rgba(255,255,255,0.06)',
          mb: 2.5,
          position: 'relative'
        }}
      >
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </Box>

      {/* 3 Interactive Simulation Triggers */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontFamily: mono, color: '#94A3B8', fontWeight: 800 }}>
          DAG PROTOCOL SIMULATION TRIGGERS:
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Trigger 1: Feeless Tx Pulse */}
          <Button
            id="vaelor-dag-pulse-btn"
            variant="contained"
            onClick={handleFeelessTxPulse}
            startIcon={<BoltIcon />}
            sx={{
              bgcolor: '#34D399',
              color: '#08080B',
              fontWeight: 900,
              fontFamily: mono,
              fontSize: '0.78rem',
              px: 2.2,
              borderRadius: 2,
              '&:hover': { bgcolor: '#10B981' }
            }}
          >
            ⚡ Broadcast Feeless Tx Pulse
          </Button>

          {/* Trigger 2: PoUW Cognitive Wave */}
          <Button
            id="vaelor-dag-pouw-btn"
            variant="contained"
            onClick={handlePouwBlockWave}
            startIcon={<SpeedIcon />}
            sx={{
              bgcolor: '#FFD700',
              color: '#08080B',
              fontWeight: 900,
              fontFamily: mono,
              fontSize: '0.78rem',
              px: 2.2,
              borderRadius: 2,
              '&:hover': { bgcolor: '#D4AF37' }
            }}
          >
            ⛏️ Trigger PoUW Block Wave
          </Button>

          {/* Trigger 3: Shielded Pedersen Tx */}
          <Button
            id="vaelor-dag-shield-btn"
            variant="contained"
            onClick={handleShieldedPedersenTx}
            startIcon={<ShieldIcon />}
            sx={{
              bgcolor: '#C084FC',
              color: '#08080B',
              fontWeight: 900,
              fontFamily: mono,
              fontSize: '0.78rem',
              px: 2.2,
              borderRadius: 2,
              '&:hover': { bgcolor: '#A855F7' }
            }}
          >
            🛡️ Simulate Shielded Pedersen Tx
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
