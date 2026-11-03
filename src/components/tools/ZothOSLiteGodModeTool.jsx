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
import SovereignBand from '../sovereign/SovereignBand.jsx';
import { SovereignEyebrow } from '../sovereign/typography.jsx';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const DESKTOP_SCENES = [
  { id: 'torus-monolith', name: 'Torus Monolith (1-Bit Bayer 8x8)', glyph: '⣿', desc: 'Tails-style RAM-only (`toram noswap`) 1-Bit monotone ASCII & Braille desktop.' },
  { id: 'helios-planets', name: 'Helios-Zoth 6-Planet System', glyph: '🪐', desc: '6 procedural GLB planetary worlds with real-time orbital mechanics.' },
  { id: 'tarot-sanctum', name: 'Adytum 22 Tarot 3D Sanctum', glyph: '🃏', desc: '22 Hermetic Arcana 3D dioramas paired with the 21 Pantheon Agent Rigs.' },
  { id: 'cyber-cathedral', name: 'A100 80GB Foundry Cathedral', glyph: '⚡', desc: 'Local qwen3.8:27b + gemma3:27b + FLUX.1 + LTX-Video 2B compute enclave.' },
];

const CORE_PACKAGES = [
  { id: 'envguard', bin: 'zoth-envguard', name: 'EnvGuard Secrets Vault', role: 'AES-256-GCM .env vault & Shannon scanner' },
  { id: 'ghostbyte', bin: 'zoth-ghostbyte', name: 'GhostByte RAM Enclave', role: 'Volatile tmpfs + mat2 metadata shredder' },
  { id: 'hexstrike', bin: 'zoth-hexstrike', name: 'HexStrike Net Sentinel', role: 'ELF PIE/RELRO auditor + Tor kill-switch' },
  { id: 'vaelor', bin: 'zoth-node-lite', name: 'Vaelor L1 Cold Signer', role: 'Ed25519 air-gapped lattice cold wallet' },
  { id: 'cot', bin: 'zoth-cot', name: 'Chain-of-Thoughts DAG', role: 'Deterministic local reasoning & MCP server' },
  { id: 'kali-parrot', bin: 'anonsurf / checksec', name: '45 Kali/Parrot CLI Tools', role: 'Pre-armed offensive & defensive binary suite' },
];

export default function ZothOSLiteGodModeTool() {
  const [selectedScene, setSelectedScene] = useState(DESKTOP_SCENES[0]);
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

      // Pure 1-Bit Monotone Black & Crisp Ivory Dither Aesthetic
      ctx.fillStyle = '#030305';
      ctx.fillRect(0, 0, cw, ch);

      const cx = cw * 0.5;
      const cy = ch * 0.53;

      ctx.font = `700 11px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const glyphs = ' .:-=+*#%@⣿';

      const R1 = 68;
      const R2 = 32;
      for (let rx = -140; rx <= 140; rx += 14) {
        for (let ry = -95; ry <= 95; ry += 14) {
          const d = Math.hypot(rx, ry);
          const ringWave = Math.cos((d - R1) * 0.085 - t * 2.4) * Math.exp(-Math.abs(d - R1) / (R2 * 1.4));
          const val = Math.max(0, Math.min(1, (ringWave + 0.55) * 0.75));
          const gIdx = Math.floor(val * (glyphs.length - 1));
          if (gIdx > 1) {
            ctx.fillStyle = gIdx > 7 ? '#F8FAFC' : 'rgba(226, 232, 240, 0.48)';
            ctx.fillText(glyphs[gIdx], cx + rx, cy + ry);
          }
        }
      }

      // Top Monotone Taskbar
      ctx.fillStyle = '#0F1117';
      ctx.fillRect(0, 0, cw, 28);
      ctx.font = `700 10px ${mono}`;
      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'left';
      ctx.fillText(`⣿ ZOTHOS-LITE v1.1 (TORAM NOSWAP) // SCENE: ${selectedScene.id.toUpperCase()}`, 12, 16);
      ctx.fillStyle = '#34D399';
      ctx.textAlign = 'right';
      ctx.fillText(liveStatus ? 'ENCLAVE :8145 ONLINE' : 'THERMAL GUARD <80°C ARMED', cw - 12, 16);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [playing, selectedScene, liveStatus]);

  const cliSnippet = useMemo(() => {
    return `# 1. Launch ZothOS-Lite v1.1 Native Electron Workstation (:8145)
zothos-lite desktop

# 2. Query Live A100 80GB Foundry, 21 Pantheon Agents, 6 Planets & 22 Tarot Keys
zothos-lite --status
zothos-lite --pantheon
zothos-lite --planets
zothos-lite --tarot

# 3. Run Unicode U+2800 Sub-Pixel Braille TUI & Benchmark Harness
zothos-lite-tui --status`;
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
        bgcolor: '#050608',
        border: '1px solid rgba(248, 250, 252, 0.28)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
        mb: 4,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          bgcolor: '#0A0C10',
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
              bgcolor: 'rgba(248,250,252,0.1)',
              border: '1px solid rgba(248,250,252,0.35)',
              color: '#F8FAFC',
              display: 'flex',
            }}
          >
            <TerminalIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.78rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '0.1em' }}>
                ZOTHOS-LITE v1.1 // 1-BIT MONOTONE AMNESIC WORKSTATION (:8145)
              </Typography>
              <Chip
                label="21 PANTHEON • 6 PLANETS • 22 TAROT"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(52,211,153,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(52,211,153,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              Tails-Style RAM-Only Security OS (`toram noswap`), AZOTH Embodied Braille AI, A100 80GB Foundry & 45 Kali/Parrot CLI Tools
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
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            {playing ? 'Pause Dither' : 'Resume Dither'}
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
              bgcolor: '#F8FAFC',
              color: '#050608',
              '&:hover': { bgcolor: '#E2E8F0' },
            }}
          >
            {copiedKey === 'cli' ? 'Copied CLI' : 'Copy ZothOS-Lite CLI'}
          </Button>
        </Stack>
      </Box>

      <SovereignEyebrow accent="#F8FAFC" right="Hardware & OS">
        {"zothos-lite"}
      </SovereignEyebrow>
      <SovereignBand
        seed={"zothos-lite"}
        eyebrow={"Hardware & OS"}
        caption={"ZothOS-Lite v1.1 (Amnesic Monotone OS)"}
        label={"ZothOS-Lite v1.1 — 1-Bit Monotone Amnesic Workstation"}
      />

      <Grid container>
        <Grid xs={12} md={7} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#030305' }}>
          <Box sx={{ width: '100%', height: { xs: 280, sm: 340 } }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#07090F' }}>
            <Grid container spacing={1.5}>
              {DESKTOP_SCENES.map((s) => {
                const active = selectedScene.id === s.id;
                return (
                  <Grid xs={12} sm={6} key={s.id}>
                    <Box
                      onClick={() => setSelectedScene(s)}
                      sx={{
                        p: 1.3,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        bgcolor: active ? 'rgba(248,250,252,0.1)' : 'rgba(255,255,255,0.02)',
                        border: active ? '1px solid #F8FAFC' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Typography sx={{ fontFamily: mono, fontSize: '0.7rem', fontWeight: 800, color: '#F8FAFC' }}>
                        {s.glyph} {s.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.4 }}>
                        {s.desc}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Grid>

        <Grid xs={12} md={5} sx={{ p: 2.5, bgcolor: '#090B10', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#F8FAFC', mb: 1.2 }}>
              CORE IMMUTABLE SECURITY & AI PACKAGES
            </Typography>
            <Stack spacing={1}>
              {CORE_PACKAGES.map((pkg) => (
                <Box
                  key={pkg.id}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#F8FAFC' }}>
                      {pkg.name}
                    </Typography>
                    <Chip
                      label={pkg.bin}
                      size="small"
                      sx={{ height: 18, fontFamily: mono, fontSize: '0.58rem', bgcolor: 'rgba(248,250,252,0.1)', color: '#E2E8F0' }}
                    />
                  </Stack>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', mt: 0.2 }}>
                    {pkg.role}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#05060A', border: '1px solid rgba(248,250,252,0.25)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.64rem', color: '#F8FAFC', fontWeight: 800 }}>
                ZOTHOS-LITE CLI & TUI COMMANDS
              </Typography>
              <Button
                size="small"
                onClick={() => handleCopy('inline', cliSnippet)}
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
