import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { useReality } from '../context/RealityContext';

const KATAKANA = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ZOTH';

export default function RealityBackgroundCanvas() {
  const canvasRef = useRef(null);
  const { realityId } = useReality();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let rafId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const pointer = { x: width * 0.5, y: height * 0.35, prevX: width * 0.5, prevY: height * 0.35, active: false, pulse: 0 };
    const onMove = (e) => {
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onClick = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.pulse = 1.0;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onClick, { passive: true });

    // Pre-allocate state for all realities
    const nodes = Array.from({ length: 32 }, (_, i) => ({
      x: ((i * 137.5) % 100) / 100 * width,
      y: ((i * 73.1) % 100) / 100 * height,
      vx: (Math.cos(i * 1.7) * 0.35),
      vy: (Math.sin(i * 2.3) * 0.35),
      r: (i % 3 === 0 ? 2.8 : 1.8),
      label: ['TOR:9050', 'RING-0', 'STDP', 'MAC:RND', 'ENCLAVE', 'QUORUM', 'AZOTH', 'NULLAI'][i % 8],
    }));

    const rainCols = Math.min(96, Math.floor(width / 18));
    const rainDrops = Array.from({ length: rainCols }, (_, i) => ({
      x: i * 18 + 9,
      y: ((i * 97) % height),
      speed: 1.4 + (i % 5) * 0.45,
      charIdx: i % KATAKANA.length,
    }));

    // Interactive cursor trail points
    const trail = Array.from({ length: 24 }, () => ({ x: width * 0.5, y: height * 0.35, life: 0 }));

    let t = 0;

    const render = () => {
      t += 0.016;
      if (pointer.pulse > 0) pointer.pulse = Math.max(0, pointer.pulse - 0.025);

      // Update cursor trail
      if (pointer.active) {
        const tr = trail[Math.floor(t * 60) % trail.length];
        tr.x = pointer.x;
        tr.y = pointer.y;
        tr.life = 1.0;
      }
      trail.forEach(tr => {
        if (tr.life > 0) tr.life -= 0.035;
      });

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const alphaScale = isDark ? 1 : 0.45;

      if (realityId === 'gold') {
        // 1. SOVEREIGN GOLD MASTER: Sacred Orbital Rings, Constellation & Cursor Vortex
        const cx = width * 0.5;
        const cy = height * 0.42;
        const maxR = Math.min(width, height) * 0.42;

        [0.38, 0.68, 0.98].forEach((frac, idx) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (idx % 2 === 0 ? 0.08 : -0.06) + idx * 0.5);
          ctx.beginPath();
          ctx.ellipse(0, 0, maxR * frac, maxR * frac * 0.46, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.09 * alphaScale})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        });

        // Golden Stardust Cursor Trail
        trail.forEach((tr) => {
          if (tr.life > 0) {
            ctx.beginPath();
            ctx.arc(tr.x, tr.y, tr.life * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${tr.life * 0.4 * alphaScale})`;
            ctx.fill();
          }
        });

        // Magnetic Node Swirl around Cursor
        nodes.forEach((n, i) => {
          n.x = (n.x + n.vx + width) % width;
          n.y = (n.y + n.vy + height) % height;
          const distP = Math.hypot(n.x - pointer.x, n.y - pointer.y);

          // Magnetic vortex effect
          if (distP < 180 && distP > 10) {
            const angle = Math.atan2(n.y - pointer.y, n.x - pointer.x) + 0.04;
            const newDist = distP * 0.995;
            n.x = pointer.x + Math.cos(angle) * newDist;
            n.y = pointer.y + Math.sin(angle) * newDist;

            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(245, 230, 171, ${(1 - distP / 180) * 0.28 * alphaScale})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = i % 4 === 0
            ? `rgba(245, 230, 171, ${0.38 * alphaScale})`
            : `rgba(212, 175, 55, ${0.24 * alphaScale})`;
          ctx.fill();
        });

      } else if (realityId === 'matrix') {
        // 2. HERMETIC MATRIX EMERALD: Cascading Katakana Rain + Fluid Cursor Repulsion Shield
        ctx.font = '600 12px "JetBrains Mono", monospace';
        rainDrops.forEach((drop) => {
          drop.y += drop.speed * 2.2;
          if (drop.y > height) drop.y = -20;

          // Repulsion field around cursor
          const dx = drop.x - pointer.x;
          const dy = drop.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          const offsetX = dist < 140 ? (dx / Math.max(1, dist)) * (140 - dist) * 0.4 : 0;

          for (let tail = 0; tail < 6; tail++) {
            const ty = drop.y - tail * 14;
            if (ty < 0 || ty > height) continue;
            const ch = KATAKANA[(drop.charIdx + tail + Math.floor(t * 8)) % KATAKANA.length];
            const isHead = tail === 0;
            const nearBoost = dist < 160 ? 0.3 : 0;
            const a = Math.min(0.6, ((1 - tail / 6) * 0.24 + nearBoost) * alphaScale);
            ctx.fillStyle = isHead
              ? `rgba(167, 243, 208, ${Math.min(0.8, a * 1.8)})`
              : `rgba(0, 255, 157, ${a})`;
            ctx.fillText(ch, drop.x + offsetX, ty);
          }
        });

        // STDP Synaptic Beams from cursor to 4 nearest nodes
        const sortedNodes = [...nodes].sort((a, b) => Math.hypot(a.x - pointer.x, a.y - pointer.y) - Math.hypot(b.x - pointer.x, b.y - pointer.y));
        for (let s = 0; s < 4; s++) {
          const sn = sortedNodes[s];
          if (sn) {
            const sd = Math.hypot(sn.x - pointer.x, sn.y - pointer.y);
            if (sd < 240) {
              ctx.beginPath();
              ctx.moveTo(pointer.x, pointer.y);
              ctx.lineTo(sn.x, sn.y);
              ctx.strokeStyle = `rgba(0, 255, 157, ${(1 - sd / 240) * 0.45 * alphaScale})`;
              ctx.lineWidth = 1.4;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(sn.x, sn.y, 4, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 255, 157, ${0.7 * alphaScale})`;
              ctx.fill();
            }
          }
        }

        // Phosphor cursor reticle
        if (pointer.active) {
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 42 + Math.sin(t * 4) * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 157, ${0.28 * alphaScale})`;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

      } else if (realityId === 'ghost') {
        // 3. NULLAI GHOSTMODE: Tor Gravitational Singularity & Dynamic Crimson Laser Tracers
        const cx = pointer.active ? pointer.x : width * 0.5;
        const cy = pointer.active ? pointer.y : height * 0.45;

        // Gravitational singularity rings around cursor
        [50, 110, 190, 280].forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r + pointer.pulse * 50, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 63, 94, ${(0.18 - idx * 0.035) * alphaScale})`;
          ctx.setLineDash(idx % 2 === 1 ? [6, 6] : []);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Singularity suction & dynamic crimson laser tracer lines
        ctx.font = '700 9px "JetBrains Mono", monospace';
        nodes.forEach((n) => {
          n.x = (n.x + n.vx * 0.7 + width) % width;
          n.y = (n.y + n.vy * 0.7 + height) % height;
          const d = Math.hypot(n.x - cx, n.y - cy);

          // Gravitational pull toward cursor
          if (d < 220) {
            if (d < 18) {
              n.x = cx + (Math.random() - 0.5) * 350;
              n.y = cy + (Math.random() - 0.5) * 350;
            } else {
              n.x -= ((n.x - cx) / d) * 0.8;
              n.y -= ((n.y - cy) / d) * 0.8;
            }

            // Laser line tracer
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(n.x, n.y);
            ctx.strokeStyle = `rgba(255, 51, 85, ${(1 - d / 220) * 0.4 * alphaScale})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            const vis = (1 - d / 220) * 0.55 * alphaScale;
            ctx.strokeStyle = `rgba(244, 63, 94, ${vis})`;
            ctx.strokeRect(n.x - 4, n.y - 4, 8, 8);
            ctx.fillStyle = `rgba(253, 164, 175, ${vis})`;
            ctx.fillText(n.label, n.x + 8, n.y + 3);
          }
        });

      } else {
        // 4. COVERT CHAMELEON / FLUENT: Interactive Silk Ripple Wave & Enterprise Grid
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          20,
          pointer.x,
          pointer.y,
          Math.min(width, height) * 0.55
        );
        grad.addColorStop(0, `rgba(56, 189, 248, ${0.12 * alphaScale})`);
        grad.addColorStop(0.5, `rgba(14, 165, 233, ${0.05 * alphaScale})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Interactive concentric fluent ripples from cursor
        [40, 90, 160, 240].forEach((r, idx) => {
          const rip = (r + t * 45) % 280;
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, rip, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - rip / 280) * 0.15 * alphaScale})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // Subtle enterprise 48px grid
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.045 * alphaScale})`;
        ctx.lineWidth = 1;
        const step = 64;
        for (let gx = 0; gx < width; gx += step) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }
        for (let gy = 0; gy < height; gy += step) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(width, gy);
          ctx.stroke();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onClick);
    };
  }, [realityId, isDark]);

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
  );
}
