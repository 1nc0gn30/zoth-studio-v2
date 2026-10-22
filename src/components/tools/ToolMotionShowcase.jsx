import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  Stack,
  Collapse,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import MovieFilterIcon from '@mui/icons-material/MovieFilter';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';
const display = '"Celtic Garamond", Georgia, "Times New Roman", serif';

const DURATION_S = 15.0;

// Deterministic cubic-bezier(0.16, 1, 0.3, 1) approximation (EASE_OUT_EXPO)
function easeOutExpo(x) {
  const t = Math.max(0, Math.min(1, x));
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function prog(t, start, end) {
  return easeOutExpo(clamp01((t - start) / Math.max(0.001, end - start)));
}

export function getCategoryMotionMeta(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('security') || cat.includes('recon') || cat.includes('opsec') || cat.includes('enclave')) {
    return {
      accent: '#EF4444',
      secondary: '#F59E0B',
      archetype: 'radar',
      anchorName: 'Perimeter Radar & Zero-Egress Shield',
      clip: 'hexstrike',
    };
  }
  if (cat.includes('memory') || cat.includes('brain')) {
    return {
      accent: '#C084FC',
      secondary: '#38BDF8',
      archetype: 'synapse',
      anchorName: 'STDP Synaptic Nebula Lattice',
      clip: 'memory',
    };
  }
  if (cat.includes('swarm') || cat.includes('core')) {
    return {
      accent: '#34D399',
      secondary: '#D4AF37',
      archetype: 'swarm',
      anchorName: '21-Agent Byzantine Quorum Ring',
      clip: 'swarm',
    };
  }
  if (cat.includes('web') || cat.includes('growth') || cat.includes('seo')) {
    return {
      accent: '#38BDF8',
      secondary: '#D4AF37',
      archetype: 'ast',
      anchorName: 'Client AST & Semantic Graph Compiler',
      clip: 'webgen',
    };
  }
  if (cat.includes('ai') || cat.includes('knowledge')) {
    return {
      accent: '#00F0FF',
      secondary: '#C084FC',
      archetype: 'synapse',
      anchorName: 'Tri-Model Consensus Constellation',
      clip: 'consensus',
    };
  }
  if (cat.includes('commerce') || cat.includes('pod') || cat.includes('mcp')) {
    return {
      accent: '#10B981',
      secondary: '#D4AF37',
      archetype: 'waterfall',
      anchorName: 'Autonomous Margin & JSON-RPC Pipeline',
      clip: 'bridges',
    };
  }
  if (cat.includes('media') || cat.includes('3d')) {
    return {
      accent: '#D4AF37',
      secondary: '#38BDF8',
      archetype: 'geometry',
      anchorName: '4D Parametric Sacred Polyhedron',
      clip: 'tools',
    };
  }
  return {
    accent: '#D4AF37',
    secondary: '#34D399',
    archetype: 'chronometer',
    anchorName: 'Deterministic Sovereign Chronometer',
    clip: 'tools',
  };
}

export default function ToolMotionShowcase({ tool, onReplayRouteIntro }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const meta = useMemo(() => getCategoryMotionMeta(tool?.category), [tool?.category]);

  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const playingRef = useRef(true);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const scenes = useMemo(() => {
    const execLabel =
      tool?.executionType === 'local_cli'
        ? `127.0.0.1:${tool?.localPort || 'CLI'} LOOPBACK ENCLAVE`
        : '100% IN-BROWSER CLIENT ENGINE';
    return [
      {
        id: '01',
        start: 0.0,
        end: 2.5,
        kicker: 'SCENE 01 · PROBLEM PROVOCATION',
        headline: 'ZERO CLOUD BLOAT.',
        sub: `Eliminate SaaS telemetry leaks & API latency with ${tool?.name || 'Sovereign Compute'}.`,
      },
      {
        id: '02',
        start: 2.5,
        end: 5.5,
        kicker: 'SCENE 02 · HERO ANCHOR MECHANISM',
        headline: meta.anchorName.toUpperCase(),
        sub: tool?.description || 'Deterministic local-first execution with cryptographic verification.',
      },
      {
        id: '03',
        start: 5.5,
        end: 8.5,
        kicker: 'SCENE 03 · SUBSTRATE TELEMETRY',
        headline: execLabel,
        sub: `0.00ms External Egress · v${tool?.version || '2.5.0'} Verified Runtime · Hardware-Anchored.`,
      },
      {
        id: '04',
        start: 8.5,
        end: 11.5,
        kicker: 'SCENE 04 · AUTONOMOUS AGENT MCP',
        headline: `${(tool?.id || 'tool').replace(/-/g, '_').toUpperCase()}_EXECUTE`,
        sub: 'Native Model Context Protocol JSON-RPC 2.0 endpoint for Hermes, Grok CLI & Ollama.',
      },
      {
        id: '05',
        start: 11.5,
        end: 13.5,
        kicker: 'SCENE 05 · INVARIANT SCORE',
        headline: '100 / 100 SOVEREIGN GRADE',
        sub: 'Strict schema validation · Zero external pip/npm runtime traps · Instant Pro unlock.',
      },
      {
        id: '06',
        start: 13.5,
        end: 15.0,
        kicker: 'SCENE 06 · RESOLVE LOCKUP',
        headline: (tool?.name || 'Zoth Tool').toUpperCase(),
        sub: `Engineered by Neal Frazier Tech (@1nc0gn30) • zoth.nullai.tech/tools/${tool?.id || ''}`,
      },
    ];
  }, [tool, meta]);

  const activeScene = useMemo(() => {
    return scenes.find((s) => currentTime >= s.start && currentTime < s.end) || scenes[scenes.length - 1];
  }, [scenes, currentTime]);

  const showreelPrompt = useMemo(() => {
    return `Act as a world-class motion graphics director and lead designer. Make a dynamic 15-second motion graphics video for ${tool?.name}.

Product: ${tool?.name} (${tool?.category} · v${tool?.version || '2.5.0'})
Hero Anchor: The ${meta.accent} ${meta.anchorName} leads every shot with cubic-bezier(0.16, 1, 0.3, 1) snap choreography and zero visual dead space.

Scene Breakdown & Exact On-Screen Copy:
- Scene 1 (0:00 - 0:02.5): Explosive kinetic typography drop. Text: "ZERO CLOUD BLOAT."
- Scene 2 (0:02.5 - 0:05.5): Anchor shape morphs into ${meta.anchorName}. Text: "${tool?.description}"
- Scene 3 (0:05.5 - 0:08.5): High-contrast telemetry snap zoom. Text: "${tool?.executionType === 'local_cli' ? `127.0.0.1:${tool?.localPort || 'CLI'} LOOPBACK ENCLAVE` : '100% IN-BROWSER CLIENT ENGINE'}"
- Scene 4 (0:08.5 - 0:11.5): 3D isometric MCP JSON-RPC dispatch stream. Text: "${(tool?.id || 'tool').replace(/-/g, '_')}_execute"
- Scene 5 (0:11.5 - 0:13.5): Climax gauge rises to 100/100 Sovereign Grade. Text: "ZERO EGRESS. INSTANT ACCESS."
- Scene 6 (0:13.5 - 0:15.0): Branded resolve lockup. Text: "${tool?.name} — zoth.nullai.tech/tools/${tool?.id}"`;
  }, [tool, meta]);

  useEffect(() => {
    let rafId;
    let lastTs = performance.now();

    const renderFrame = (now) => {
      const dt = Math.min(0.1, (now - lastTs) / 1000);
      lastTs = now;

      if (playingRef.current) {
        timeRef.current = (timeRef.current + dt) % DURATION_S;
        setCurrentTime(timeRef.current);
      }

      const t = timeRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth || 720;
        const h = canvas.clientHeight || 250;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
        ctx.save();
        ctx.scale(dpr, dpr);

        // 1. Deep Obsidian Cinema Background
        ctx.fillStyle = '#07070B';
        ctx.fillRect(0, 0, w, h);

        // 2. Drifting Dot Matrix Grid (Living Texture)
        const driftX = (t * 14) % 28;
        const driftY = (t * 8) % 28;
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let gx = -28 + driftX; gx < w; gx += 28) {
          for (let gy = -28 + driftY; gy < h; gy += 28) {
            ctx.fillRect(gx, gy, 1.2, 1.2);
          }
        }

        // 3. Radial Ambient Aura on Right Anchor Stage
        const cx = w > 560 ? w * 0.76 : w * 0.5;
        const cy = h * 0.52;
        const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 130);
        grad.addColorStop(0, `${meta.accent}33`);
        grad.addColorStop(0.55, `${meta.secondary}14`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 4. Domain-Specific Hero Anchor Choreography (Right Stage)
        ctx.save();
        ctx.translate(cx, cy);
        const R = Math.min(w * 0.18, h * 0.36, 86);

        if (meta.archetype === 'radar') {
          // Concentric Tactical Radar + Sweeping Beam + Target Blips
          for (let r = 1; r <= 3; r++) {
            ctx.strokeStyle = `${meta.accent}${r === 3 ? '66' : '33'}`;
            ctx.lineWidth = r === 3 ? 1.5 : 1;
            ctx.beginPath();
            ctx.arc(0, 0, (R * r) / 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          const sweepAngle = t * 2.4;
          ctx.strokeStyle = meta.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(sweepAngle) * R, Math.sin(sweepAngle) * R);
          ctx.stroke();

          // Blips
          for (let i = 0; i < 6; i++) {
            const a = i * 1.05 + 0.4;
            const dist = R * (0.35 + ((i * 19) % 55) / 100);
            const bx = Math.cos(a) * dist;
            const by = Math.sin(a) * dist;
            const pulse = 0.5 + 0.5 * Math.sin(t * 5 + i);
            ctx.fillStyle = i % 2 === 0 ? meta.accent : meta.secondary;
            ctx.beginPath();
            ctx.arc(bx, by, 3 + pulse * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (meta.archetype === 'synapse' || meta.archetype === 'swarm') {
          // Multi-Node Synaptic / Byzantine Ring Constellation
          const count = meta.archetype === 'swarm' ? 12 : 9;
          const pts = [];
          for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2 + t * 0.45;
            const rad = R * (0.68 + 0.24 * Math.sin(t * 1.8 + i * 1.3));
            pts.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad });
          }
          ctx.strokeStyle = `${meta.accent}44`;
          ctx.lineWidth = 1;
          for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
              if ((i + j) % 3 === 0) {
                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
                ctx.stroke();
              }
            }
          }
          pts.forEach((p, idx) => {
            ctx.fillStyle = idx % 3 === 0 ? '#FFFFFF' : idx % 2 === 0 ? meta.accent : meta.secondary;
            ctx.beginPath();
            ctx.arc(p.x, p.y, idx === 0 ? 5 : 3.2, 0, Math.PI * 2);
            ctx.fill();
          });
          // Core Hub
          ctx.fillStyle = meta.accent;
          ctx.beginPath();
          ctx.arc(0, 0, 6 + Math.sin(t * 4) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (meta.archetype === 'geometry') {
          // Rotating Sacred Nested Polyhedra
          for (let layer = 0; layer < 3; layer++) {
            const sides = 6 + layer * 2;
            const rad = R * (0.42 + layer * 0.26);
            const rot = t * (layer % 2 === 0 ? 0.6 : -0.5) + layer;
            ctx.strokeStyle = layer === 1 ? meta.secondary : meta.accent;
            ctx.lineWidth = layer === 2 ? 1.6 : 1.1;
            ctx.beginPath();
            for (let s = 0; s <= sides; s++) {
              const a = (s / sides) * Math.PI * 2 + rot;
              const px = Math.cos(a) * rad;
              const py = Math.sin(a) * rad;
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        } else {
          // AST / Waterfall / Chronometer Telemetry Rings & Bars
          ctx.strokeStyle = `${meta.accent}44`;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.85, 0, Math.PI * 2);
          ctx.stroke();

          const sweep = ((t % 3.0) / 3.0) * Math.PI * 1.65;
          ctx.strokeStyle = meta.accent;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.85, -Math.PI * 0.5, -Math.PI * 0.5 + sweep);
          ctx.stroke();

          // Inner equalizer / waterfall bars
          for (let b = -3; b <= 3; b++) {
            const bh = R * (0.2 + 0.38 * Math.abs(Math.sin(t * 3.2 + b * 0.7)));
            ctx.fillStyle = b % 2 === 0 ? meta.accent : meta.secondary;
            ctx.fillRect(b * 9 - 3, bh * -0.5, 5, bh);
          }
        }
        ctx.restore();

        // 5. Scene-Synchronized Kinetic Typography & Horizon Seam (Left Stage)
        const active = scenes.find((s) => t >= s.start && t < s.end) || scenes[scenes.length - 1];
        const enterP = prog(t, active.start, active.start + 0.55);
        const leftPad = 24;
        const maxTextW = w > 560 ? w * 0.54 : w - 48;

        // Top Aperture Seam Line
        ctx.fillStyle = meta.accent;
        ctx.fillRect(leftPad, 26, maxTextW * enterP, 2);

        // Scene Kicker
        ctx.font = `700 10.5px ${mono}`;
        ctx.fillStyle = meta.accent;
        ctx.fillText(active.kicker, leftPad, 48);

        // Kinetic Headline with Mask Slide
        ctx.save();
        const slideY = (1 - enterP) * 18;
        ctx.globalAlpha = enterP;
        ctx.font = `800 ${w < 480 ? '18px' : '24px'} "Google Sans", "Inter", system-ui, sans-serif`;
        ctx.fillStyle = '#F8FAFC';
        ctx.fillText(active.headline.slice(0, 38), leftPad, 82 + slideY);

        // Subtitle wrapped
        ctx.font = `400 12.5px "Google Sans", "Inter", system-ui, sans-serif`;
        ctx.fillStyle = '#94A3B8';
        const words = active.sub.split(' ');
        let line = '';
        let ly = 108 + slideY;
        for (let i = 0; i < words.length; i++) {
          const test = line + words[i] + ' ';
          if (ctx.measureText(test).width > maxTextW && line.length > 0) {
            ctx.fillText(line.trim(), leftPad, ly);
            line = words[i] + ' ';
            ly += 18;
            if (ly > 148) break;
          } else {
            line = test;
          }
        }
        if (line && ly <= 148) ctx.fillText(line.trim(), leftPad, ly);
        ctx.restore();

        // Bottom Telemetry Pill inside Canvas
        ctx.font = `700 10px ${mono}`;
        ctx.fillStyle = 'rgba(248,250,252,0.55)';
        const tc = `${t.toFixed(2).padStart(5, '0')}s / ${DURATION_S.toFixed(1)}s · 60 FPS DETERMINISTIC`;
        ctx.fillText(tc, leftPad, h - 16);

        ctx.restore();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [meta, scenes]);

  const handleJumpScene = (scene) => {
    timeRef.current = scene.start + 0.05;
    setCurrentTime(timeRef.current);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard?.writeText(showreelPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: isDark ? '#08080C' : '#0B0F19',
        border: `1px solid ${meta.accent}55`,
        boxShadow: isDark
          ? `0 12px 34px rgba(0,0,0,0.65), 0 0 24px -6px ${meta.accent}33`
          : `0 10px 28px rgba(15,23,42,0.18)`,
      }}
    >
      {/* Top Cinema Control Bar */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.4,
          bgcolor: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
          <MovieFilterIcon sx={{ color: meta.accent, fontSize: 19 }} />
          <Typography
            sx={{
              fontFamily: mono,
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#F8FAFC',
              textTransform: 'uppercase',
            }}
          >
            15S CODE-FIRST MOTION EDIT · {meta.anchorName}
          </Typography>
          <Chip
            label={`SCENE ${activeScene.id}/06`}
            size="small"
            sx={{
              height: 20,
              fontFamily: mono,
              fontSize: '0.65rem',
              fontWeight: 800,
              bgcolor: `${meta.accent}22`,
              color: meta.accent,
              border: `1px solid ${meta.accent}55`,
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowPrompt((v) => !v)}
            startIcon={<CodeIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.68rem',
              fontWeight: 700,
              py: 0.35,
              px: 1.2,
              borderColor: 'rgba(255,255,255,0.2)',
              color: '#E2E8F0',
              textTransform: 'none',
              '&:hover': { borderColor: meta.accent, color: meta.accent },
            }}
          >
            {showPrompt ? 'Hide Showreel Spec' : '15s Showreel Prompt'}
          </Button>
          {onReplayRouteIntro && (
            <Button
              size="small"
              variant="contained"
              onClick={onReplayRouteIntro}
              startIcon={<FullscreenIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontFamily: mono,
                fontSize: '0.68rem',
                fontWeight: 800,
                py: 0.4,
                px: 1.4,
                bgcolor: meta.accent,
                color: '#08080B',
                textTransform: 'none',
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              Fullscreen Cinema Cut
            </Button>
          )}
        </Stack>
      </Box>

      {/* 60fps Deterministic Canvas Stage */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 210, sm: 220 } }}>
        <canvas
          ref={canvasRef}
          aria-label={`${tool?.name || 'Tool'} 15-second interactive motion graphic`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Box>

      {/* Beat-Synced 6-Scene Timeline Scrubber */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.2,
          bgcolor: 'rgba(0,0,0,0.45)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <IconButton
            size="small"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause motion reel' : 'Play motion reel'}
            sx={{
              color: '#08080B',
              bgcolor: meta.accent,
              width: 28,
              height: 28,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            {playing ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              timeRef.current = 0;
              setCurrentTime(0);
              setPlaying(true);
            }}
            aria-label="Restart motion reel"
            sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
          >
            <ReplayIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
          {scenes.map((s) => {
            const isActive = activeScene.id === s.id;
            return (
              <Chip
                key={s.id}
                label={`${s.id} · ${s.kicker.split('·')[1]?.trim() || ''}`}
                size="small"
                clickable
                onClick={() => handleJumpScene(s)}
                sx={{
                  height: 22,
                  fontFamily: mono,
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  bgcolor: isActive ? `${meta.accent}28` : 'rgba(255,255,255,0.04)',
                  color: isActive ? meta.accent : '#94A3B8',
                  border: `1px solid ${isActive ? meta.accent : 'rgba(255,255,255,0.1)'}`,
                  '&:hover': { borderColor: meta.accent, color: '#FFFFFF' },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Collapsible 15-Second Showreel Prompt Spec */}
      <Collapse in={showPrompt}>
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#050508',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontFamily: mono, fontSize: '0.72rem', fontWeight: 800, color: meta.accent }}>
              CLAUDE MOTION / REVID.AI 15-SECOND SHOWREEL DIRECTOR BRIEF
            </Typography>
            <Tooltip title={copiedPrompt ? 'Copied!' : 'Copy Showreel Prompt'}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCopyPrompt}
                startIcon={copiedPrompt ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.68rem',
                  color: meta.accent,
                  borderColor: `${meta.accent}55`,
                  textTransform: 'none',
                }}
              >
                {copiedPrompt ? 'Copied Brief' : 'Copy Director Prompt'}
              </Button>
            </Tooltip>
          </Box>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.75,
              borderRadius: 1.5,
              bgcolor: '#090A10',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: mono,
              fontSize: '0.74rem',
              color: '#CBD5E1',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.55,
            }}
          >
            {showreelPrompt}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
