import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CodeIcon from '@mui/icons-material/Code';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const OS_PILLARS = [
  { id: 'amnesic', name: 'Amnesic RAM Hygiene', glyph: '🛡️', desc: 'Debian 13 boots via toram noswap. Boot USB unmounts; power-off wipes RAM with 0 trace.' },
  { id: 'persistence', name: 'USB & Cloud Persistence', glyph: '💾', desc: 'Auto-mounts external SSDs at /media/$USER/*. Syncs to cloud drives via rclone.' },
  { id: 'ai-swarm', name: '48+ Model Universal AI', glyph: '🤖', desc: 'Universal AI execution on Intel, AMD, NVIDIA, or CPU across 8 major frontier providers.' },
  { id: 'zothnet', name: 'ZothNet Encrypted Mesh', glyph: '🌐', desc: 'Zero-centralization P2P communication via WireGuard, Yggdrasil, and onion routing.' },
];

const DEV_TOOLS = [
  { id: 'swarm', name: 'Multi-Model Swarm Console', role: 'Run 48+ frontier models across 8 providers with client-side key encryption.' },
  { id: 'image-viewer', name: 'Precision Image Viewer', role: 'In-browser zoom, pan, rotation, brightness/contrast filters, and EXIF extraction.' },
  { id: 'av-player', name: 'Precision AV Player', role: 'Frame-accurate scrubbing, 32-band real-time audio spectrum, and snapshot export.' },
  { id: 'packager', name: 'Storage & Cloud Packager', role: 'Client-side zero-dependency PKZIP compressor with SHA256 integrity manifest.' },
];

export default function ZothOSLiteGodModeTool() {
  const [selectedPillar, setSelectedPillar] = useState(OS_PILLARS[0]);
  const [playing, setPlaying] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8145/api/system-status');
        if (res.ok) {
          const json = await res.json();
          if (mounted) setLiveStatus(json);
        }
      } catch (_e) {}
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) timeRef.current += dt;
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 720;
      const ch = canvas.clientHeight || 340;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Monotone Black & Crisp Cyan/Ivory Dither Aesthetic
      ctx.fillStyle = '#05070D';
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.53;

      ctx.font = `700 11px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const glyphs = ' .:-=+*#%@⣿';

      const R1 = 70;
      const R2 = 34;
      for (let rx = -140; rx <= 140; rx += 14) {
        for (let ry = -95; ry <= 95; ry += 14) {
          const d = Math.hypot(rx, ry);
          const ringWave = Math.cos((d - R1) * 0.085 - t * 2.2) * Math.exp(-Math.abs(d - R1) / (R2 * 1.4));
          const val = Math.max(0, Math.min(1, (ringWave + 0.55) * 0.75));
          const gIdx = Math.floor(val * (glyphs.length - 1));
          if (gIdx > 1) {
            ctx.fillStyle = gIdx > 7 ? '#38BDF8' : 'rgba(226, 232, 240, 0.42)';
            ctx.fillText(glyphs[gIdx], cx + rx, cy + ry);
          }
        }
      }

      // Top Monotone Taskbar
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, cw, 28);
      ctx.font = `700 10px ${mono}`;
      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'left';
      ctx.fillText(`⣿ ZOTHOS-LITE v1.2 (TORAM NOSWAP) // TOPIC: ${selectedPillar.id.toUpperCase()}`, 12, 16);
      ctx.fillStyle = '#38BDF8';
      ctx.textAlign = 'right';
      ctx.fillText(liveStatus ? 'DAEMON :8145 ONLINE • 48+ AI MODELS' : 'UNIVERSAL HARDWARE ARMED', cw - 12, 16);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [playing, selectedPillar, liveStatus]);

  const cliSnippet = useMemo(() => {
    return `# 1. Query Universal Amnesic OS Status & Hardware Compatibility
zothos-lite --status

# 2. List 48+ Supported AI Models Across 8 Frontier Providers
zothos-lite --models
zothos-lite --providers

# 3. Read Amnesic & External Persistence Operating Guide
zothos-lite --guide

# 4. List Built-In In-Browser Dev Utilities
zothos-lite --tools`;
  }, []);

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
        bgcolor: '#05070D',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
        mb: 4,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0F19',
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
              bgcolor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38BDF8',
              display: 'flex',
            }}
          >
            <TerminalIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '0.1em' }}>
                ZOTHOS-LITE v1.2 // UNIVERSAL AMNESIC SECURITY OS (:8145)
              </Typography>
              <Chip
                label="48+ MODELS • 8 PROVIDERS • UNIVERSAL x86_64"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              Tails-Style RAM Security (`toram noswap`), 4 Dev Utilities, ZothNet P2P Mesh & Universal Hardware
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            href="https://zothos-lite.nullai.tech"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#38BDF8',
              borderColor: 'rgba(56, 189, 248, 0.4)',
            }}
          >
            Live Site
          </Button>
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
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            {playing ? 'Pause' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleCopy('cli', cliSnippet)}
            startIcon={copiedKey === 'cli' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: '#38BDF8',
              color: '#05070D',
              '&:hover': { bgcolor: '#7DD3FC' },
            }}
          >
            {copiedKey === 'cli' ? 'Copied CLI' : 'Copy CLI Commands'}
          </Button>
        </Stack>
      </Box>

      <SovereignEyebrow accent="#38BDF8" right="Hardware & OS">
        {"zothos-lite"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"zothos-lite"}
        eyebrow={"Hardware & OS"}
        caption={"ZothOS-Lite v1.2 (Universal Sovereign OS)"}
        label={"ZothOS-Lite v1.2 — Universal Amnesic Security OS & AI Swarm"}
      />

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#05070D' }}>
          <Box sx={{ width: '100%', height: { xs: 260, sm: 320 } }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#090D18' }}>
            <Grid container spacing={1.5}>
              {OS_PILLARS.map((s) => {
                const active = selectedPillar.id === s.id;
                return (
                  <Grid xs={12} sm={6} key={s.id}>
                    <Box
                      onClick={() => setSelectedPillar(s)}
                      sx={{
                        p: 1.3,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: active ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.02)',
                        border: active ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: active ? '#38BDF8' : '#F8FAFC' }}>
                        {s.glyph} {s.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.67rem', color: '#94A3B8', mt: 0.4, lineHeight: 1.4 }}>
                        {s.desc}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#090D18', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#38BDF8', mb: 1.2, letterSpacing: '0.08em' }}>
              4 IN-BROWSER ZERO-BLOAT DEV UTILITIES
            </Typography>
            <Stack spacing={1}>
              {DEV_TOOLS.map((pkg) => (
                <Box
                  key={pkg.id}
                  sx={{
                    p: 1.1,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: '#F8FAFC' }}>
                    {pkg.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', mt: 0.2, lineHeight: 1.35 }}>
                    {pkg.role}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#05070D', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#38BDF8', fontWeight: 800 }}>
                ZOTHOS-LITE CLI COMMANDS
              </Typography>
              <Button
                size="small"
                onClick={() => handleCopy('inline', cliSnippet)}
                startIcon={copiedKey === 'inline' ? <CheckIcon sx={{ fontSize: 13 }} /> : <CodeIcon sx={{ fontSize: 13 }} />}
                sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#38BDF8', py: 0 }}
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
              }}
            >
              {cliSnippet}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
