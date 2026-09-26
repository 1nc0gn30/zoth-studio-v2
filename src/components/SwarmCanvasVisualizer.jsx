import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { pantheonAgents } from '../data/pantheon';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

/* Cadre color coding — each cadre a distinct neon hue so the mesh reads at a glance. */
const CADRE_COLORS = {
  Architects: '#D4AF37', // gold
  Code: '#38BDF8',       // sky
  Security: '#F87171',   // red
  Creative: '#C084FC',   // violet
  Swarm: '#34D399',      // emerald
};
const CORE_IDS = new Set(['AZOTH', 'AETHER', 'MERCURY']);

const BRIDGE_URL = 'http://127.0.0.1:8102/api/stats';
const POLL_MS = 5000;

export default function SwarmCanvasVisualizer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const gold = isDark ? '#D4AF37' : '#B8860B';
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [stats, setStats] = useState(null);
  const [bridgeUp, setBridgeUp] = useState(false);

  /* Live bridge telemetry — poll /api/stats; degrade gracefully when the daemon is down. */
  useEffect(() => {
    let alive = true;
    let timer;
    const poll = async () => {
      try {
        const res = await fetch(BRIDGE_URL, { signal: AbortSignal.timeout(2500) });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (alive) {
          setStats(data);
          setBridgeUp(true);
        }
      } catch {
        if (alive) {
          setStats(null);
          setBridgeUp(false);
        }
      }
      if (alive) timer = setTimeout(poll, POLL_MS);
    };
    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  /* Build the mesh once (positions drift under a gentle force simulation). */
  const buildNodes = useCallback((w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const cadreOrder = Object.keys(CADRE_COLORS);
    // Group agents by cadre, lay cadre clusters around the center.
    const byCadre = {};
    pantheonAgents.forEach((a) => {
      (byCadre[a.cadre] = byCadre[a.cadre] || []).push(a);
    });
    const nodes = [];
    const clusterAngle = {};
    cadreOrder.forEach((cadre, ci) => {
      clusterAngle[cadre] = (ci / cadreOrder.length) * Math.PI * 2 + Math.PI / 2;
    });
    pantheonAgents.forEach((agent) => {
      const isCore = CORE_IDS.has(agent.id);
      const clusterIdx = (byCadre[agent.cadre] || []).indexOf(agent);
      const clusterCount = (byCadre[agent.cadre] || []).length;
      const baseAngle = clusterAngle[agent.cadre];
      const ring = isCore ? 0 : 1 + (clusterIdx % 2);
      const spread = clusterCount > 1 ? (clusterIdx / Math.max(1, clusterCount - 1) - 0.5) * 1.15 : 0;
      const angle = baseAngle + spread;
      const radius = ring === 0 ? 0 : 78 + ring * 62;
      nodes.push({
        id: agent.id,
        role: agent.role,
        cadre: agent.cadre,
        isCore,
        color: CADRE_COLORS[agent.cadre] || gold,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius * 0.82,
        vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                pulse: Math.random() * Math.PI * 2,
                _hx: cx + Math.cos(angle) * radius,
                _hy: cy + Math.sin(angle) * radius * 0.82,
      });
    });
    return nodes;
  }, [gold]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let nodes = [];
    let raf;
    let mouse = { x: -9999, y: -9999 };
    let hoverId = null;
    let dpr = 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth || 600;
      height = wrap.clientHeight || 380;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = buildNodes(width, height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const gridColor = isDark ? 'rgba(38, 38, 47, 0.55)' : 'rgba(234, 236, 240, 0.5)';
    const labelColor = isDark ? '#A6A8B4' : '#475467';
    const dimFactor = isDark ? 0.12 : 0.16;
    const t0 = performance.now();

    const render = (now) => {
      const elapsed = (now - t0) / 1000;
      ctx.clearRect(0, 0, width, height);

      // --- Background grid ---
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0.5; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0.5; y < height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // --- Radar sweep ---
      const sweep = (elapsed * 0.5) % (Math.PI * 2);
      const grad = ctx.createConicGradient
        ? ctx.createConicGradient(sweep, width / 2, height / 2)
        : null;
      if (grad) {
        grad.addColorStop(0, 'rgba(212,175,55,0)');
        grad.addColorStop(0.08, isDark ? 'rgba(212,175,55,0.16)' : 'rgba(184,134,11,0.14)');
        grad.addColorStop(0.2, 'rgba(212,175,55,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      // sweep leading edge line
      ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.35)' : 'rgba(184,134,11,0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2);
      ctx.lineTo(width / 2 + Math.cos(sweep) * width, height / 2 + Math.sin(sweep) * width);
      ctx.stroke();

      // --- Force simulation: gentle repulsion + spring to home ---
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        // spring back toward initial ring position
        a.vx += (a._hx - a.x) * 0.0012;
        a.vy += (a._hy - a.y) * 0.0012;
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1) continue;
          const d = Math.sqrt(d2);
          if (d < 110) {
            const f = (0.05 * (110 - d)) / d;
            a.vx += dx * f;
            a.vy += dy * f;
          }
        }
      }

      // --- Connections (proximity mesh) ---
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 150) continue;
          const involved = hoverId && (a.id === hoverId || b.id === hoverId);
          const alpha = (0.28 * (1 - dist / 150)) * (involved ? 1 : hoverId ? dimFactor : 1);
          if (alpha <= 0.01) continue;
          ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
          ctx.lineWidth = a.isCore || b.isCore ? 1.4 : 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // --- Data particles (packets flowing along mesh) ---
      for (let p = 0; p < 22; p++) {
        const from = nodes[(p * 7) % nodes.length];
        const to = nodes[(p * 13 + 5) % nodes.length];
        const prog = (elapsed * 0.06 + p * 0.037) % 1;
        const px = from.x + (to.x - from.x) * prog;
        const py = from.y + (to.y - from.y) * prog;
        ctx.fillStyle = 'rgba(212,175,55,0.9)';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // --- Nodes ---
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.96;
        node.vy *= 0.96;
        if (node.x < 24 || node.x > width - 24) node.vx *= -0.8;
        if (node.y < 24 || node.y > height - 24) node.vy *= -0.8;

        const isHover = hoverId === node.id;
        const dimmed = hoverId && !isHover;
        const r = node.isCore ? 8 : 5;
        const pulseR = r + 2 + Math.sin(node.pulse + elapsed * 2) * 1.6;
        node.pulse += 0.03;

        // outer glow ring (cores breathe)
        if (node.isCore) {
          ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.5)' : 'rgba(184,134,11,0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = dimmed ? dimFactor : 1;
        ctx.fillStyle = node.color;
        ctx.strokeStyle = isDark ? node.color : node.color;
        ctx.lineWidth = isHover ? 3 : node.isCore ? 2.4 : 1.4;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHover ? 16 : node.isCore ? 12 : 6;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHover ? r + 2 : r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // label
        ctx.font = node.isCore ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillStyle = isHover ? node.color : node.isCore ? gold : labelColor;
        ctx.fillText(node.id, node.x + 10, node.y + 3);
        ctx.globalAlpha = 1;
      });

      // --- Hover tooltip ---
      if (hoverId) {
        const node = nodes.find((n) => n.id === hoverId);
        if (node) {
          const tx = Math.min(Math.max(node.x + 14, 8), width - 220);
          const ty = Math.min(Math.max(node.y - 34, 8), height - 46);
          ctx.fillStyle = isDark ? 'rgba(11,11,18,0.92)' : 'rgba(255,255,255,0.94)';
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tx, ty, 210, 42, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = node.color;
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText(node.id, tx + 8, ty + 15);
          ctx.fillStyle = labelColor;
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(node.role, tx + 8, ty + 30);
        }
      }

      if (!reduced) raf = requestAnimationFrame(render);
    };

    // store home positions for spring target
    const storeHome = () => {
      nodes.forEach((n) => {
        n._hx = n.x;
        n._hy = n.y;
      });
    };
    storeHome();

    // hover detection
    const detectHover = () => {
      let found = null;
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        if (dx * dx + dy * dy < 20 * 20) {
          found = n.id;
          break;
        }
      }
      if (found !== hoverId) {
        hoverId = found;
        setHoverNode(found);
      }
      if (!reduced) raf = requestAnimationFrame(render);
    };

    if (reduced) {
      render(performance.now());
    } else {
      raf = requestAnimationFrame(render);
    }
    const hoverTimer = setInterval(detectHover, 80);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(hoverTimer);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [theme, isDark, gold, buildNodes]);

  const active = stats?.telemetry?.active_agents ?? 0;
  const monitored = stats?.telemetry?.monitored_agents ?? 0;
  const dead = stats?.telemetry?.dead_agents ?? 0;
  const msgs = stats?.telemetry?.messages_sent ?? 0;

  return (
    <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, mb: 4, overflow: 'hidden', position: 'relative', bgcolor: theme.palette.background.paper }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 1, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: gold, letterSpacing: '0.05em', fontFamily: mono }}>
            AGENT MESH NETWORK
          </Typography>
          <Chip
            size="small"
            label={bridgeUp ? 'LIVE BUS' : 'OFFLINE'}
            sx={{
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              bgcolor: bridgeUp ? (isDark ? 'rgba(52,211,153,0.16)' : '#ECFDF3') : (isDark ? 'rgba(248,113,113,0.16)' : '#FEF2F2'),
              color: bridgeUp ? (isDark ? '#34D399' : '#12B76A') : (isDark ? '#F87171' : '#DC2626'),
              border: '1px solid',
              borderColor: bridgeUp ? (isDark ? 'rgba(52,211,153,0.4)' : '#A7F3D0') : (isDark ? 'rgba(248,113,113,0.4)' : '#FECACA'),
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontFamily: mono }}>
          {bridgeUp ? `bridge 127.0.0.1:8102 · ${monitored} monitored` : 'daemon offline · roster diagram'}
        </Typography>
      </Box>

      {/* Live telemetry strip */}
      <Stack direction="row" spacing={1.5} useFlexGap sx={{ px: 1, mb: 1.5, flexWrap: 'wrap' }}>
        {[
          { label: 'ACTIVE', value: active, color: '#34D399' },
          { label: 'DEAD', value: dead, color: '#F87171' },
          { label: 'MONITORED', value: monitored, color: gold },
          { label: 'MSG SENT', value: msgs, color: '#38BDF8' },
        ].map((s) => (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
            <Typography variant="caption" sx={{ color: s.color, fontWeight: 800, fontFamily: mono, fontSize: '0.8rem' }}>
              {String(s.value).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.08em' }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Canvas */}
      <Box ref={wrapRef} sx={{ width: '100%', height: 400, background: isDark ? '#0B0B12' : '#FCFCFD', borderRadius: 1.5, overflow: 'hidden', position: 'relative', border: `1px solid ${theme.palette.divider}` }}>
        <canvas ref={canvasRef} style={{ display: 'block', cursor: 'crosshair' }} />
      </Box>

      {/* Cadre legend */}
      <Stack direction="row" spacing={2} useFlexGap sx={{ px: 1, mt: 1.5, flexWrap: 'wrap' }}>
        {Object.entries(CADRE_COLORS).map(([cadre, color]) => (
          <Box key={cadre} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.06em' }}>
              {cadre.toUpperCase()}
            </Typography>
          </Box>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.62rem' }}>
          {hoverNode ? `HOVER: ${hoverNode}` : 'HOVER a node for its role · cores AZOTH / AETHER / MERCURY'}
        </Typography>
      </Stack>
    </Paper>
  );
}