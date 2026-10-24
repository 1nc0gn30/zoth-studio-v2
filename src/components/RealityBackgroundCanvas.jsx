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

    const pointer = { x: width * 0.5, y: height * 0.35, active: false, pulse: 0 };
    const onMove = (e) => {
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

    // Pre-allocate state for all 5 realities
    const nodes = Array.from({ length: 28 }, (_, i) => ({
      x: ((i * 137.5) % 100) / 100 * width,
      y: ((i * 73.1) % 100) / 100 * height,
      vx: (Math.cos(i * 1.7) * 0.35),
      vy: (Math.sin(i * 2.3) * 0.35),
      r: (i % 3 === 0 ? 2.6 : 1.7),
      label: ['TOR:9050', 'RING-0', 'STDP', 'MAC:RND', 'ENCLAVE', 'QUORUM'][i % 6],
    }));

    const rainCols = Math.min(90, Math.floor(width / 18));
    const rainDrops = Array.from({ length: rainCols }, (_, i) => ({
      x: i * 18 + 9,
      y: ((i * 97) % height),
      speed: 1.4 + (i % 5) * 0.45,
      charIdx: i % KATAKANA.length,
    }));

    let t = 0;

    const render = () => {
      t += 0.016;
      if (pointer.pulse > 0) pointer.pulse = Math.max(0, pointer.pulse - 0.025);

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const alphaScale = isDark ? 1 : 0.45;

      if (realityId === 'gold') {
        // 1. SOVEREIGN GOLD MASTER: Sacred Orbital Rings & 21-Agent Constellation
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

        nodes.forEach((n, i) => {
          n.x = (n.x + n.vx + width) % width;
          n.y = (n.y + n.vy + height) % height;
          const distP = Math.hypot(n.x - pointer.x, n.y - pointer.y);
          if (distP < 210) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(245, 230, 171, ${(1 - distP / 210) * 0.24 * alphaScale})`;
            ctx.lineWidth = 1;
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
        // 2. HERMETIC MATRIX EMERALD: Interactive Katakana Digital Rain + Cursor Repulsion
        ctx.font = '600 12px "JetBrains Mono", monospace';
        rainDrops.forEach((drop, idx) => {
          drop.y += drop.speed * 2.2;
          if (drop.y > height) drop.y = -20;

          const dx = drop.x - pointer.x;
          const dy = drop.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          const offsetX = dist < 140 ? (dx / Math.max(1, dist)) * (140 - dist) * 0.35 : 0;

          for (let tail = 0; tail < 6; tail++) {
            const ty = drop.y - tail * 14;
            if (ty < 0 || ty > height) continue;
            const ch = KATAKANA[(drop.charIdx + tail + Math.floor(t * 8)) % KATAKANA.length];
            const isHead = tail === 0;
            const nearBoost = dist < 160 ? 0.25 : 0;
            const a = Math.min(0.55, ((1 - tail / 6) * 0.22 + nearBoost) * alphaScale);
            ctx.fillStyle = isHead
              ? `rgba(167, 243, 208, ${Math.min(0.7, a * 1.6)})`
              : `rgba(0, 255, 157, ${a})`;
            ctx.fillText(ch, drop.x + offsetX, ty);
          }
        });

        // Phosphor cursor reticle
        if (pointer.active) {
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 48 + Math.sin(t * 4) * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 157, ${0.22 * alphaScale})`;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (realityId === 'ghost') {
        // 3. NULLAI GHOSTMODE STEALTH: Crimson Sonar Sweep & Cloaked Onion Nodes
        const cx = pointer.active ? pointer.x : width * 0.5;
        const cy = pointer.active ? pointer.y : height * 0.45;

        // Rotating sonar rings around cursor / center
        [65, 140, 230].forEach((r, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r + pointer.pulse * 40, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 63, 94, ${(0.16 - idx * 0.04) * alphaScale})`;
          ctx.setLineDash(idx === 1 ? [6, 6] : []);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // Radar sweep line
        const sweepAngle = t * 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * 230, cy + Math.sin(sweepAngle) * 230);
        ctx.strokeStyle = `rgba(244, 63, 94, ${0.28 * alphaScale})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cloaked nodes only reveal when near sonar sweep or cursor
        ctx.font = '700 9px "JetBrains Mono", monospace';
        nodes.forEach((n) => {
          n.x = (n.x + n.vx * 0.7 + width) % width;
          n.y = (n.y + n.vy * 0.7 + height) % height;
          const d = Math.hypot(n.x - cx, n.y - cy);
          if (d < 250) {
            const vis = (1 - d / 250) * 0.42 * alphaScale;
            ctx.strokeStyle = `rgba(244, 63, 94, ${vis})`;
            ctx.strokeRect(n.x - 4, n.y - 4, 8, 8);
            ctx.fillStyle = `rgba(253, 164, 175, ${vis})`;
            ctx.fillText(n.label, n.x + 8, n.y + 3);
          }
        });
      } else if (realityId === 'cyan') {
        // 4. CYBER CYAN QUANTUM: 4D Tesseract Projection & STDP Synapse Network
        const cx = width * 0.5;
        const cy = height * 0.42;
        const size = Math.min(width, height) * 0.18;

        // Project 2 rotating squares connected as a hypercube
        const rot = t * 0.55;
        const sq = [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ];
        const outerPts = sq.map(([x, y]) => ({
          x: cx + (x * Math.cos(rot) - y * Math.sin(rot)) * size,
          y: cy + (x * Math.sin(rot) + y * Math.cos(rot)) * size * 0.65,
        }));
        const innerPts = sq.map(([x, y]) => ({
          x: cx + (x * Math.cos(-rot * 1.3) - y * Math.sin(-rot * 1.3)) * (size * 0.52),
          y: cy + (x * Math.sin(-rot * 1.3) + y * Math.cos(-rot * 1.3)) * (size * 0.52) * 0.65,
        }));

        ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * alphaScale})`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          const next = (i + 1) % 4;
          ctx.beginPath();
          ctx.moveTo(outerPts[i].x, outerPts[i].y);
          ctx.lineTo(outerPts[next].x, outerPts[next].y);
          ctx.moveTo(innerPts[i].x, innerPts[i].y);
          ctx.lineTo(innerPts[next].x, innerPts[next].y);
          ctx.moveTo(outerPts[i].x, outerPts[i].y);
          ctx.lineTo(innerPts[i].x, innerPts[i].y);
          ctx.stroke();
        }

        // STDP Synapse Mesh
        nodes.forEach((n, i) => {
          n.x = (n.x + n.vx * 1.1 + width) % width;
          n.y = (n.y + n.vy * 1.1 + height) % height;
          const next = nodes[(i + 1) % nodes.length];
          const dNext = Math.hypot(n.x - next.x, n.y - next.y);
          if (dNext < 220) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dNext / 220) * 0.16 * alphaScale})`;
            ctx.stroke();
          }
          const dp = Math.hypot(n.x - pointer.x, n.y - pointer.y);
          if (dp < 200) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = `rgba(192, 132, 252, ${(1 - dp / 200) * 0.32 * alphaScale})`;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${0.35 * alphaScale})`;
          ctx.fill();
        });
      } else {
        // 5. COVERT CHAMELEON GUISE: Fluent Mica Aurora & Clean Enterprise Grid
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          20,
          pointer.x,
          pointer.y,
          Math.min(width, height) * 0.55
        );
        grad.addColorStop(0, `rgba(56, 189, 248, ${0.09 * alphaScale})`);
        grad.addColorStop(0.5, `rgba(14, 165, 233, ${0.04 * alphaScale})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

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
