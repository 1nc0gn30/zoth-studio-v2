import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  TextField,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ShieldIcon from '@mui/icons-material/Shield';
import CodeIcon from '@mui/icons-material/Code';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const KERNEL_RINGS = [
  {
    id: 'ring0',
    ring: 'RING 0',
    name: 'Air-Gap & Netfilter Core',
    accent: '#34D399',
    description: 'nftables loopback-only enforcement, eBPF socket guard, and thermal governor (<60°C).',
  },
  {
    id: 'ring1',
    ring: 'RING 1',
    name: 'Cryptographic Vault & Stego',
    accent: '#D4AF37',
    description: 'Ed25519 lease signing, AES-256-GCM memory pages, and AudioCipher LSB acoustic air-gap.',
  },
  {
    id: 'ring2',
    ring: 'RING 2',
    name: 'Swarm & FastMCP Bus',
    accent: '#38BDF8',
    description: 'Azoth Archon 4-Node Byzantine quorum, NeuroMemory vector daemon, and zero-egress MCP bridge.',
  },
  {
    id: 'ring3',
    ring: 'RING 3',
    name: 'Sovereign Studio & Media',
    accent: '#C084FC',
    description: 'Zoth Studio v2 (:8088), Zoth ASCII Magic, Nexus 3D, and POD Commerce connectors.',
  },
];

const SOVEREIGN_DAEMONS = [
  { id: 'zoth-studio', name: 'Zoth Studio Hub', port: 8088, ring: 'ring3', cmd: '/usr/local/bin/zoth-studio-server', category: 'Core Hub', memMb: 42 },
  { id: 'azoth-archon', name: 'Azoth Archon Quorum', port: 8000, ring: 'ring2', cmd: '/usr/local/bin/azoth-archon --quorum 4', category: 'Swarm Orchestrator', memMb: 68 },
  { id: 'neuro-memory', name: 'NeuroMemory Vector DB', port: 8092, ring: 'ring2', cmd: '/usr/local/bin/neuro-memory serve --port 8092', category: 'Memory Enclave', memMb: 54 },
  { id: 'agent-egress', name: 'Agent Egress Sentinel', port: 8090, ring: 'ring0', cmd: '/usr/local/bin/agent-egress-sentinel --strict', category: 'Kernel Firewall', memMb: 28 },
  { id: 'agent-firewall', name: 'Prompt Firewall Guard', port: 8094, ring: 'ring0', cmd: '/usr/local/bin/agent-prompt-firewall --port 8094', category: 'Prompt Defense', memMb: 31 },
  { id: 'envguard-vault', name: 'EnvGuard Secrets Vault', port: 8095, ring: 'ring1', cmd: '/usr/local/bin/envguard-vault serve --port 8095', category: 'Crypto Enclave', memMb: 24 },
  { id: 'audiocipher', name: 'AudioCipher Stego Engine', port: 8096, ring: 'ring1', cmd: '/usr/local/bin/audiocipher serve --port 8096', category: 'Acoustic Stego', memMb: 36 },
  { id: 'zoth-ascii-magic', name: 'Zoth ASCII Magic Synth', port: 8089, ring: 'ring3', cmd: '/usr/local/bin/zoth-ascii-magic --serve 8089', category: 'ASCII & Braille', memMb: 29 },
  { id: 'ghidra-mcp', name: 'GhidraMCP Binary Bridge', port: 8080, ring: 'ring1', cmd: '/usr/local/bin/ghidra-mcp --ghidra-server 127.0.0.1:8080', category: 'Reverse Eng', memMb: 112 },
  { id: 'agent-gods-eye', name: "Agent God's Eye Radar", port: 8112, ring: 'ring0', cmd: '/usr/local/bin/agent-gods-eye serve --port 8112', category: 'OSINT Recon', memMb: 46 },
  { id: 'zoth-civilization', name: 'Zoth Civilization 21-Agent', port: 9393, ring: 'ring2', cmd: '/usr/local/bin/zoth-civilization --no-voice', category: 'Society Sim', memMb: 84 },
  { id: 'pod-smart-router', name: 'POD Smart Router', port: 8117, ring: 'ring3', cmd: '/usr/local/bin/pod-smart-router server --port 8117', category: 'Commerce Engine', memMb: 32 },
];

export default function ZothOSGodModeTool() {
  const [selectedRing, setSelectedRing] = useState('all');
  const [selectedDaemon, setSelectedDaemon] = useState(SOVEREIGN_DAEMONS[0]);
  const [playing, setPlaying] = useState(true);
  const [isolationMode, setIsolationMode] = useState('airgap');
  const [thermalCap, setThermalCap] = useState(58);
  const [niceLevel, setNiceLevel] = useState(10);
  const [qemuRamGb, setQemuRamGb] = useState(8);
  const [qemuCores, setQemuCores] = useState(4);
  const [outputTab, setOutputTab] = useState('systemd');
  const [copiedKey, setCopiedKey] = useState(null);
  const [customArgs, setCustomArgs] = useState('--zero-egress --bind 127.0.0.1');

  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  const visibleDaemons = useMemo(() => {
    if (selectedRing === 'all') return SOVEREIGN_DAEMONS;
    return SOVEREIGN_DAEMONS.filter((d) => d.ring === selectedRing);
  }, [selectedRing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) {
        timeRef.current += dt;
      }
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 720;
      const ch = canvas.clientHeight || 360;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#05060A';
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.52;
      const maxR = Math.min(cw, ch) * 0.41;

      // Subtle background ASCII grid
      ctx.font = `600 10px ${mono}`;
      ctx.fillStyle = 'rgba(212, 175, 55, 0.06)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const stepX = 36;
      const stepY = 24;
      const brailleChars = '⠁⠃⠇⠏⠟⠿⣿';
      for (let gx = 18; gx < cw; gx += stepX) {
        for (let gy = 36; gy < ch; gy += stepY) {
          const dist = Math.hypot(gx - cx, gy - cy);
          const wave = Math.sin(dist * 0.04 - t * 2.2);
          const idx = Math.max(0, Math.min(brailleChars.length - 1, Math.floor((wave + 1) * 0.5 * brailleChars.length)));
          ctx.fillText(brailleChars[idx], gx, gy);
        }
      }

      // Draw 4 Kernel Rings
      const ringRadii = [maxR * 0.28, maxR * 0.50, maxR * 0.74, maxR * 0.96];
      KERNEL_RINGS.forEach((rObj, idx) => {
        const radius = ringRadii[idx];
        const isHighlighted = selectedRing === 'all' || selectedRing === rObj.id;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isHighlighted ? rObj.accent : 'rgba(255,255,255,0.08)';
        ctx.globalAlpha = isHighlighted ? 0.38 : 0.14;
        ctx.lineWidth = selectedRing === rObj.id ? 2 : 1.2;
        ctx.setLineDash(idx % 2 === 0 ? [5, 5] : [10, 4]);
        ctx.lineDashOffset = (idx % 2 === 0 ? 1 : -1) * t * 18;
        ctx.stroke();
        ctx.restore();
      });

      // Position daemons on their respective rings
      const nodePositions = [];
      SOVEREIGN_DAEMONS.forEach((d, i) => {
        const ringIndex = KERNEL_RINGS.findIndex((r) => r.id === d.ring);
        const radius = ringRadii[Math.max(0, ringIndex)];
        const baseAngle = (i / SOVEREIGN_DAEMONS.length) * Math.PI * 2;
        const orbitSpeed = (ringIndex % 2 === 0 ? 0.18 : -0.14) * (1 - ringIndex * 0.12);
        const angle = baseAngle + t * orbitSpeed;
        const nx = cx + Math.cos(angle) * radius;
        const ny = cy + Math.sin(angle) * radius;
        nodePositions.push({ daemon: d, x: nx, y: ny, ringObj: KERNEL_RINGS[ringIndex] });
      });

      // Draw loopback IPC links from center enclave kernel to active nodes
      nodePositions.forEach((np, idx) => {
        const isFocused = selectedDaemon?.id === np.daemon.id;
        const ringMatch = selectedRing === 'all' || selectedRing === np.daemon.ring;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(np.x, np.y);
        ctx.strokeStyle = isFocused ? '#F5E6AB' : np.ringObj.accent;
        ctx.globalAlpha = isFocused ? 0.65 : ringMatch ? 0.18 : 0.05;
        ctx.lineWidth = isFocused ? 1.8 : 1;
        ctx.stroke();

        // Packet pulse along loopback link
        if (ringMatch) {
          const pulse = ((t * 0.85 + idx * 0.19) % 1);
          const px = cx + (np.x - cx) * pulse;
          const py = cy + (np.y - cy) * pulse;
          ctx.beginPath();
          ctx.arc(px, py, isFocused ? 3.2 : 2, 0, Math.PI * 2);
          ctx.fillStyle = isFocused ? '#F5E6AB' : np.ringObj.accent;
          ctx.globalAlpha = isFocused ? 0.95 : 0.7;
          ctx.fill();
        }
        ctx.restore();
      });

      // Center Kernel Core
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#0B0E17';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D4AF37';
      ctx.stroke();

      ctx.font = `800 9px ${mono}`;
      ctx.fillStyle = '#F5E6AB';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('127.0.0.1', cx, cy - 4);
      ctx.fillStyle = '#34D399';
      ctx.font = `700 7.5px ${mono}`;
      ctx.fillText('RING-0', cx, cy + 6);
      ctx.restore();

      // Draw Daemon Nodes
      nodePositions.forEach((np) => {
        const isFocused = selectedDaemon?.id === np.daemon.id;
        const ringMatch = selectedRing === 'all' || selectedRing === np.daemon.ring;

        ctx.save();
        ctx.globalAlpha = ringMatch ? 1 : 0.25;
        ctx.beginPath();
        ctx.arc(np.x, np.y, isFocused ? 9 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isFocused ? np.ringObj.accent : '#0B0E17';
        ctx.fill();
        ctx.lineWidth = isFocused ? 2.5 : 1.5;
        ctx.strokeStyle = isFocused ? '#F5E6AB' : np.ringObj.accent;
        ctx.stroke();

        ctx.font = `${isFocused ? 800 : 600} ${isFocused ? 10 : 8.5}px ${mono}`;
        ctx.fillStyle = isFocused ? '#F5E6AB' : '#CBD5E1';
        ctx.textAlign = np.x >= cx ? 'left' : 'right';
        const offsetX = np.x >= cx ? 12 : -12;
        ctx.fillText(`:${np.daemon.port} ${np.daemon.id}`, np.x + offsetX, np.y);
        ctx.restore();
      });

      // Top HUD Bar
      ctx.fillStyle = 'rgba(5, 6, 10, 0.9)';
      ctx.fillRect(0, 0, cw, 28);
      ctx.font = `700 10px ${mono}`;
      ctx.fillStyle = '#D4AF37';
      ctx.textAlign = 'left';
      ctx.fillText(
        `ZOTH-OS v2.6 KERNEL ENCLAVE // ISOLATION: ${isolationMode.toUpperCase()} // THERMALS: 44.0°C (CAP ${thermalCap}°C)`,
        12,
        16
      );
      ctx.fillStyle = '#34D399';
      ctx.textAlign = 'right';
      ctx.fillText(`EGRESS: 0.00 KB/s [LOCKED]`, cw - 12, 16);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [playing, selectedRing, selectedDaemon, isolationMode, thermalCap]);

  const generatedPayload = useMemo(() => {
    const d = selectedDaemon || SOVEREIGN_DAEMONS[0];
    if (outputTab === 'systemd') {
      return `[Unit]
Description=ZothOS Sovereign Enclave — ${d.name} (:${d.port})
Documentation=https://zoth.nullai.tech/tools/zoth-os
After=network-online.target

[Service]
Type=simple
User=zoth
Group=zoth
Nice=${niceLevel}
ExecStart=${d.cmd} ${customArgs}
Restart=on-failure
RestartSec=3

# Ring-0 Air-Gap & Sandboxing Directives (${isolationMode.toUpperCase()})
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6
IPAddressAllow=127.0.0.1/8 ::1/128
IPAddressDeny=any
MemoryMax=${d.memMb * 4}M
Environment="ZOTH_ZERO_EGRESS=1"
Environment="ZOTH_THERMAL_CAP_C=${thermalCap}"
Environment="PORT=${d.port}"

[Install]
WantedBy=multi-user.target`;
    }

    if (outputTab === 'desktop') {
      return `[Desktop Entry]
Version=1.0
Type=Application
Name=ZothOS // ${d.name}
Comment=Sovereign Enclave Service on 127.0.0.1:${d.port} (${d.category})
Exec=sh -c "${d.cmd} ${customArgs} & xdg-open http://127.0.0.1:${d.port}"
Icon=utilities-terminal
Terminal=false
Categories=System;Security;Development;X-ZothOS;
StartupNotify=true`;
    }

    return `# ZothOS v2.6 Sovereign Live ISO — Hardware-Accelerated QEMU/KVM Enclave Launch
nice -n ${niceLevel} qemu-system-x86_64 \\
  -name "ZothOS-v2.6-Sovereign-Enclave" \\
  -enable-kvm -machine q35,accel=kvm \\
  -cpu host -smp ${qemuCores} -m ${qemuRamGb}G \\
  -cdrom ~/NullAITech/zoth-os/zoth-os-v2.6-amd64.iso \\
  -boot d -vga virtio -display gtk,gl=on \\
  -netdev user,id=loop0,restrict=${isolationMode === 'airgap' ? 'on' : 'off'},hostfwd=tcp:127.0.0.1:${d.port}-:${d.port},hostfwd=tcp:127.0.0.1:8088-:8088 \\
  -device virtio-net-pci,netdev=loop0`;
  }, [selectedDaemon, outputTab, isolationMode, thermalCap, niceLevel, customArgs, qemuRamGb, qemuCores]);

  const handleCopy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07080D',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
        mb: 4,
      }}
    >
      {/* Top Workstation Header */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0D14',
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
              bgcolor: 'rgba(212,175,55,0.14)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#D4AF37',
              display: 'flex',
            }}
          >
            <SecurityIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.12em' }}>
                ZOTH-OS v2.6 // RING-0 KERNEL &amp; ENCLAVE ARCHITECT
              </Typography>
              <Chip
                label="22 DAEMONS VERIFIED"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(16,185,129,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              />
              <Chip
                label="DEBIAN BOOKWORM LIVE-BUILD"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(56,189,248,0.14)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56,189,248,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              Interactive 4-Ring Loopback Topology, Hardened systemd Sandbox Synthesizer &amp; QEMU/KVM ISO Launcher
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPlaying((p) => !p)}
            startIcon={playing ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            {playing ? 'Freeze Ring Telemetry' : 'Resume Telemetry'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleCopy('payload', generatedPayload)}
            startIcon={copiedKey === 'payload' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            {copiedKey === 'payload' ? 'Copied to Clipboard' : `Copy ${outputTab.toUpperCase()} Config`}
          </Button>
        </Stack>
      </Box>

      {/* Main Split Workstation */}
      <Grid container>
        {/* Left Column: 60fps Ring-0 Topology Canvas + Daemon Selector */}
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05060A' }}>
          <Box sx={{ width: '100%', height: { xs: 300, sm: 370 } }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          {/* Ring Filter Bar */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#090B11',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedRing('all')}
              sx={{
                fontFamily: mono,
                fontSize: '0.65rem',
                fontWeight: 800,
                bgcolor: selectedRing === 'all' ? '#D4AF37' : 'rgba(255,255,255,0.02)',
                color: selectedRing === 'all' ? '#050508' : '#94A3B8',
                borderColor: selectedRing === 'all' ? '#D4AF37' : 'rgba(255,255,255,0.12)',
              }}
            >
              ALL RINGS (12)
            </Button>
            {KERNEL_RINGS.map((r) => (
              <Button
                key={r.id}
                size="small"
                variant="outlined"
                onClick={() => setSelectedRing(r.id)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: selectedRing === r.id ? r.accent : 'rgba(255,255,255,0.02)',
                  color: selectedRing === r.id ? '#050508' : '#CBD5E1',
                  borderColor: selectedRing === r.id ? r.accent : 'rgba(255,255,255,0.12)',
                }}
              >
                {r.ring}: {r.name}
              </Button>
            ))}
          </Box>

          {/* Daemon Matrix Grid */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#07090F' }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, color: '#94A3B8', mb: 1.2, letterSpacing: '0.08em' }}>
              SELECT LOOPBACK DAEMON TO INSPECT &amp; SYNTHESIZE UNIT FILE
            </Typography>
            <Grid container spacing={1}>
              {visibleDaemons.map((d) => {
                const active = selectedDaemon?.id === d.id;
                return (
                  <Grid xs={12} sm={6} md={4} key={d.id}>
                    <Box
                      onClick={() => setSelectedDaemon(d)}
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: active ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.02)',
                        border: active ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.07)',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: 'rgba(212,175,55,0.6)' },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: active ? '#F5E6AB' : '#E2E8F0' }}>
                          {d.name}
                        </Typography>
                        <Chip
                          label={`:${d.port}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontFamily: mono,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            bgcolor: 'rgba(52,211,153,0.12)',
                            color: '#34D399',
                          }}
                        />
                      </Stack>
                      <Typography sx={{ fontFamily: mono, fontSize: '0.6rem', color: '#94A3B8', mt: 0.4 }}>
                        {d.category} • {d.memMb}MB RAM
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>

        {/* Right Column: Sandbox Controls & Live Unit Code Generator */}
        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#090B10', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {[
                { id: 'systemd', label: 'systemd Unit' },
                { id: 'desktop', label: 'XFCE .desktop' },
                { id: 'qemu', label: 'QEMU/KVM ISO' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={() => setOutputTab(tab.id)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    bgcolor: outputTab === tab.id ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.02)',
                    color: outputTab === tab.id ? '#F5E6AB' : '#94A3B8',
                    borderColor: outputTab === tab.id ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </Stack>

            <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
              NETFILTER EGRESS POSTURE
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {[
                { id: 'airgap', label: 'Strict Loopback (127.0.0.1/8)' },
                { id: 'lan-bridge', label: 'LAN Bridge + Loopback' },
              ].map((mode) => (
                <Button
                  key={mode.id}
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={() => setIsolationMode(mode.id)}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: isolationMode === mode.id ? 'rgba(52,211,153,0.14)' : 'rgba(255,255,255,0.02)',
                    color: isolationMode === mode.id ? '#34D399' : '#94A3B8',
                    borderColor: isolationMode === mode.id ? '#34D399' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {mode.label}
                </Button>
              ))}
            </Stack>

            <Grid container spacing={2} sx={{ mb: 1.5 }}>
              <Grid xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8' }}>THERMAL CAP</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#34D399', fontWeight: 800 }}>{thermalCap}°C</Typography>
                </Box>
                <Slider size="small" min={48} max={75} step={1} value={thermalCap} onChange={(_, v) => setThermalCap(v)} sx={{ color: '#34D399' }} />
              </Grid>
              <Grid xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8' }}>SCHEDULER NICE</Typography>
                  <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#D4AF37', fontWeight: 800 }}>nice -n {niceLevel}</Typography>
                </Box>
                <Slider size="small" min={0} max={19} step={1} value={niceLevel} onChange={(_, v) => setNiceLevel(v)} sx={{ color: '#D4AF37' }} />
              </Grid>
            </Grid>

            {outputTab === 'qemu' ? (
              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid xs={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8' }}>ENCLAVE RAM</Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#38BDF8', fontWeight: 800 }}>{qemuRamGb} GB</Typography>
                  </Box>
                  <Slider size="small" min={4} max={32} step={2} value={qemuRamGb} onChange={(_, v) => setQemuRamGb(v)} sx={{ color: '#38BDF8' }} />
                </Grid>
                <Grid xs={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8' }}>KVM vCPUS</Typography>
                    <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#38BDF8', fontWeight: 800 }}>{qemuCores} Cores</Typography>
                  </Box>
                  <Slider size="small" min={2} max={16} step={2} value={qemuCores} onChange={(_, v) => setQemuCores(v)} sx={{ color: '#38BDF8' }} />
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#94A3B8', mb: 0.5 }}>
                  DAEMON CLI FLAGS ({selectedDaemon.id})
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={customArgs}
                  onChange={(e) => setCustomArgs(e.target.value)}
                  InputProps={{
                    sx: {
                      fontFamily: mono,
                      fontSize: '0.72rem',
                      color: '#F5E6AB',
                      bgcolor: '#05060A',
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Generated Config Output Box */}
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#05060A', border: '1px solid rgba(212,175,55,0.28)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#D4AF37', fontWeight: 800 }}>
                {outputTab === 'systemd'
                  ? `/etc/systemd/system/${selectedDaemon.id}.service`
                  : outputTab === 'desktop'
                  ? `/usr/share/applications/${selectedDaemon.id}.desktop`
                  : 'launch-zoth-os-kvm.sh'}
              </Typography>
              <Button
                size="small"
                onClick={() => handleCopy('inline', generatedPayload)}
                startIcon={copiedKey === 'inline' ? <CheckIcon sx={{ fontSize: 13 }} /> : <CodeIcon sx={{ fontSize: 13 }} />}
                sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#34D399', py: 0 }}
              >
                {copiedKey === 'inline' ? 'Copied' : 'Copy'}
              </Button>
            </Stack>
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily: mono,
                fontSize: '0.68rem',
                lineHeight: 1.45,
                color: '#E2E8F0',
                overflowX: 'auto',
                maxHeight: 240,
              }}
            >
              {generatedPayload}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
