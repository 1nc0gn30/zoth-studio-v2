import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

// 21 pantheon seats. Inner ring is the three cores, then the working cadres.
const ORBITS = [
  { count: 3, rx: 0.5, ry: 0.2, tilt: 0.15, speed: 0.55, phase: 0 },
  { count: 6, rx: 0.72, ry: 0.3, tilt: -0.35, speed: -0.38, phase: 0.4 },
  { count: 12, rx: 0.96, ry: 0.42, tilt: 0.7, speed: 0.24, phase: 1.1 },
];

function strokeZ(ctx, arm, rise, width) {
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

export default function GoldenZLogo3D({ size = 42, interactive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.scale(dpr, dpr);

    let angle = 0;
    let targetSpeed = 0.012;
    let currentSpeed = 0.012;
    const hero = size >= 120;
    // 40px nav cannot resolve 21 dots. Three rings, nodes only when there is room.
    const showNodes = size >= 96;
    const nodeScale = hero ? 1 : 0.72;

    const onEnter = () => { if (interactive) targetSpeed = 0.045; };
    const onLeave = () => { if (interactive) targetSpeed = 0.012; };
    const parent = canvas.parentElement;
    if (parent && interactive) {
      parent.addEventListener('mouseenter', onEnter);
      parent.addEventListener('mouseleave', onLeave);
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      angle += currentSpeed;

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.46;

      ctx.save();
      ctx.translate(cx, cy);

      // Rings sit behind the Z. Draw back half, then the emblem, then the front half.
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
        ctx.ellipse(0, 0, r * orbit.rx, r * orbit.ry, 0, 0, Math.PI * 2);
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

      // Thick extruded Z. The bar width scales with the canvas so the nav mark stays a Z.
      const arm = r * 0.42;
      const rise = r * 0.46;
      const bar = Math.max(3.5, size * 0.055);
      const depth = Math.max(2, bar * 0.45);
      const turn = Math.cos(angle * 0.7) * 0.12 + 0.9;

      ctx.save();
      ctx.scale(turn, 1);
      for (let i = depth; i >= 1; i -= 1) {
        ctx.strokeStyle = i === 1 ? '#4A3700' : `rgba(74,55,0,${0.35 + (depth - i) / depth * 0.4})`;
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
      // Specular along the top bar so the stroke reads as metal, not a flat line.
      ctx.strokeStyle = 'rgba(255,245,200,0.85)';
      ctx.lineWidth = Math.max(1, bar * 0.18);
      ctx.beginPath();
      ctx.moveTo(-arm, -rise - bar * 0.28);
      ctx.lineTo(arm, -rise - bar * 0.28);
      ctx.stroke();
      ctx.restore();

      rings.forEach((ring) => drawRing(ring, true));
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
  }, [size, interactive]);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
        filter: 'drop-shadow(0 4px 14px rgba(212, 175, 55, 0.35))',
      }}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size, display: 'block' }} />
    </Box>
  );
}
