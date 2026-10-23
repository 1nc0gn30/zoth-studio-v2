import React, { useEffect, useRef } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useReality } from '../context/RealityContext';

const ORBITS = [
  { count: 3, rx: 0.5, ry: 0.2, tilt: 0.15, speed: 0.55, phase: 0 },
  { count: 6, rx: 0.72, ry: 0.3, tilt: -0.35, speed: -0.38, phase: 0.4 },
  { count: 12, rx: 0.96, ry: 0.42, tilt: 0.7, speed: 0.24, phase: 1.1 },
];

function strokeZ(ctx, arm, rise, width) {
  if (!Number.isFinite(arm) || !Number.isFinite(rise) || !Number.isFinite(width)) return;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-arm, -rise);
  ctx.lineTo(arm, -rise);
  ctx.lineTo(-arm, rise);
  ctx.lineTo(arm, rise);
  ctx.stroke();
}

export default function GoldenZLogo3D({ size = 42, interactive = true, realityOverride = null }) {
  const canvasRef = useRef(null);
  const { realityId: ctxRealityId, reality } = useReality();
  const activeMode = realityOverride || ctxRealityId || 'gold';

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  let resolvedSize = 42;
  if (typeof size === 'number') {
    resolvedSize = size;
  } else if (size && typeof size === 'object') {
    if (isXl && size.xl != null) resolvedSize = size.xl;
    else if (isLg && size.lg != null) resolvedSize = size.lg;
    else if (isMd && size.md != null) resolvedSize = size.md;
    else if (isSm && size.sm != null) resolvedSize = size.sm;
    else if (size.xs != null) resolvedSize = size.xs;
    else {
      const firstNum = Object.values(size).find((v) => typeof v === 'number' && Number.isFinite(v));
      resolvedSize = firstNum != null ? firstNum : 42;
    }
  }

  const numericSize = Math.max(16, Number.isFinite(resolvedSize) ? resolvedSize : 42);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(numericSize * dpr);
    canvas.height = Math.round(numericSize * dpr);
    ctx.scale(dpr, dpr);

    let angle = 0;
    let targetSpeed = 0.015;
    let currentSpeed = 0.015;
    const hero = numericSize >= 120;
    const showNodes = numericSize >= 96;
    const nodeScale = hero ? 1 : 0.72;

    const onEnter = () => { if (interactive) targetSpeed = 0.048; };
    const onLeave = () => { if (interactive) targetSpeed = 0.015; };
    const parent = canvas.parentElement;
    if (parent && interactive) {
      parent.addEventListener('mouseenter', onEnter);
      parent.addEventListener('mouseleave', onLeave);
    }

    const render = () => {
      ctx.clearRect(0, 0, numericSize, numericSize);
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      angle += currentSpeed;

      const cx = numericSize / 2;
      const cy = numericSize / 2;
      const r = numericSize * 0.45;

      ctx.save();
      ctx.translate(cx, cy);

      if (activeMode === 'matrix') {
        // MATRIX LOGO: Rotating Emerald Hex-Grid + Glitch Scanbar Z
        ctx.save();
        ctx.rotate(angle * 0.5);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const hx = Math.cos(a) * r * 0.92;
          const hy = Math.sin(a) * r * 0.92;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 255, 157, 0.55)';
        ctx.lineWidth = hero ? 1.8 : 1.2;
        ctx.stroke();
        ctx.restore();

        // Phosphor scanbars
        for (let sy = -r * 0.6; sy <= r * 0.6; sy += r * 0.3) {
          const w = r * (0.75 + 0.15 * Math.sin(angle * 3 + sy));
          ctx.strokeStyle = 'rgba(0, 255, 157, 0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-w, sy);
          ctx.lineTo(w, sy);
          ctx.stroke();
        }

        const arm = r * 0.42;
        const rise = r * 0.44;
        const bar = Math.max(3, numericSize * 0.055);
        ctx.strokeStyle = '#00FF9D';
        ctx.shadowColor = '#00FF9D';
        ctx.shadowBlur = hero ? 14 : 5;
        strokeZ(ctx, arm, rise, bar);
        ctx.shadowBlur = 0;
      } else if (activeMode === 'ghost') {
        // GHOSTMODE LOGO: Crimson Stealth Diamond + Counter-Rotating Radar Reticle + Phantom Z
        ctx.save();
        ctx.rotate(-angle * 0.8);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
        ctx.lineWidth = hero ? 1.6 : 1.1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Stealth diamond
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.78);
        ctx.lineTo(r * 0.78, 0);
        ctx.lineTo(0, r * 0.78);
        ctx.lineTo(-r * 0.78, 0);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(253, 164, 175, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const arm = r * 0.38;
        const rise = r * 0.4;
        const bar = Math.max(3, numericSize * 0.052);
        ctx.strokeStyle = '#F43F5E';
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = hero ? 14 : 5;
        strokeZ(ctx, arm, rise, bar);
        ctx.shadowBlur = 0;
      } else if (activeMode === 'cyan') {
        // QUANTUM CYAN LOGO: 4D Rotating Tesseract Hypercube + Neon Cyan Z
        const sOut = r * 0.68;
        const sIn = r * 0.36;
        const sq = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        const outPts = sq.map(([x, y]) => ({
          x: (x * Math.cos(angle) - y * Math.sin(angle)) * sOut,
          y: (x * Math.sin(angle) + y * Math.cos(angle)) * sOut,
        }));
        const inPts = sq.map(([x, y]) => ({
          x: (x * Math.cos(-angle * 1.4) - y * Math.sin(-angle * 1.4)) * sIn,
          y: (x * Math.sin(-angle * 1.4) + y * Math.cos(-angle * 1.4)) * sIn,
        }));

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 4; i++) {
          const nx = (i + 1) % 4;
          ctx.beginPath();
          ctx.moveTo(outPts[i].x, outPts[i].y);
          ctx.lineTo(outPts[nx].x, outPts[nx].y);
          ctx.moveTo(inPts[i].x, inPts[i].y);
          ctx.lineTo(inPts[nx].x, inPts[nx].y);
          ctx.moveTo(outPts[i].x, outPts[i].y);
          ctx.lineTo(inPts[i].x, inPts[i].y);
          ctx.stroke();
        }

        const arm = r * 0.36;
        const rise = r * 0.38;
        const bar = Math.max(3, numericSize * 0.052);
        ctx.strokeStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = hero ? 14 : 5;
        strokeZ(ctx, arm, rise, bar);
        ctx.shadowBlur = 0;
      } else if (activeMode === 'incognito') {
        // COVERT CHAMELEON LOGO: Clean Fluent 4-Pane Window Emblem
        const pane = r * 0.38;
        const gap = Math.max(1.5, r * 0.09);
        const offsets = [
          [-pane - gap * 0.5, -pane - gap * 0.5, '#38BDF8'],
          [gap * 0.5, -pane - gap * 0.5, '#0EA5E9'],
          [-pane - gap * 0.5, gap * 0.5, '#0284C7'],
          [gap * 0.5, gap * 0.5, '#60A5FA'],
        ];
        offsets.forEach(([ox, oy, col]) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.roundRect(ox, oy, pane, pane, Math.max(2, pane * 0.18));
          ctx.fill();
        });
      } else {
        // DEFAULT GOLD MASTER: 24K Extruded 3D Z + 21-Seat Pantheon Orbits
        const rings = ORBITS.map((orbit, i) => {
          const nodes = [];
          for (let n = 0; n < orbit.count; n += 1) {
            const t = orbit.phase + angle * orbit.speed + (n / orbit.count) * Math.PI * 2;
            const x = Math.cos(t) * r * orbit.rx;
            const y = Math.sin(t) * r * orbit.ry;
            const depth = Math.sin(t);
            nodes.push({ x, y, depth, core: i === 0 });
          }
          return { orbit, nodes };
        });

        const drawRing = (ring, front) => {
          const { orbit, nodes } = ring;
          ctx.save();
          ctx.rotate(orbit.tilt);
          ctx.beginPath();
          const rx = Math.max(1, r * orbit.rx);
          const ry = Math.max(1, r * orbit.ry);
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = front ? 'rgba(212,175,55,0.55)' : 'rgba(212,175,55,0.22)';
          ctx.lineWidth = hero ? 1.4 : 1;
          ctx.stroke();
          if (showNodes) {
            nodes
              .filter((node) => (front ? node.depth >= 0 : node.depth < 0))
              .forEach((node) => {
                const radius = (node.core ? 3.4 : 2.2) * nodeScale * (0.75 + node.depth * 0.35);
                ctx.beginPath();
                ctx.arc(node.x, node.y, Math.max(1.1, radius), 0, Math.PI * 2);
                ctx.fillStyle = node.depth > 0.35 ? '#FFE57F' : '#D4AF37';
                ctx.shadowColor = '#D4AF37';
                ctx.shadowBlur = hero ? 8 : 0;
                ctx.fill();
                ctx.shadowBlur = 0;
              });
          }
          ctx.restore();
        };

        rings.forEach((ring) => drawRing(ring, false));

        const arm = r * 0.42;
        const rise = r * 0.46;
        const bar = Math.max(3.5, numericSize * 0.055);
        const depth = Math.max(2, bar * 0.45);
        const turn = Math.cos(angle * 0.7) * 0.12 + 0.9;

        if (Number.isFinite(arm) && Number.isFinite(rise) && arm > 0 && rise > 0) {
          ctx.save();
          ctx.scale(turn, 1);
          for (let i = depth; i >= 1; i -= 1) {
            ctx.strokeStyle = i === 1 ? '#4A3700' : `rgba(74,55,0,${0.35 + ((depth - i) / depth) * 0.4})`;
            strokeZ(ctx, arm, rise, bar);
            ctx.translate(0.7, 0.7);
          }
          const grad = ctx.createLinearGradient(-arm, -rise, arm, rise);
          grad.addColorStop(0, '#FFF1B8');
          grad.addColorStop(0.35, '#F0D060');
          grad.addColorStop(0.7, '#B8860B');
          grad.addColorStop(1, '#6E5200');
          ctx.strokeStyle = grad;
          ctx.shadowColor = 'rgba(212,175,55,0.55)';
          ctx.shadowBlur = hero ? 16 : 4;
          strokeZ(ctx, arm, rise, bar);
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255,245,200,0.85)';
          ctx.lineWidth = Math.max(1, bar * 0.18);
          ctx.beginPath();
          ctx.moveTo(-arm, -rise - bar * 0.28);
          ctx.lineTo(arm, -rise - bar * 0.28);
          ctx.stroke();
          ctx.restore();
        }

        rings.forEach((ring) => drawRing(ring, true));
      }

      ctx.restore();
      frame = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(frame);
      if (parent && interactive) {
        parent.removeEventListener('mouseenter', onEnter);
        parent.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [numericSize, interactive, activeMode]);

  const dropShadowColor = reality?.accent || '#D4AF37';

  return (
    <Box
      sx={{
        width: numericSize,
        height: numericSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        filter: `drop-shadow(0 4px 14px ${dropShadowColor}55)`,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${numericSize}px`,
          height: `${numericSize}px`,
          display: 'block',
        }}
      />
    </Box>
  );
}
