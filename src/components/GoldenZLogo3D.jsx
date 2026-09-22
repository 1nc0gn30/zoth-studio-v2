import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

export default function GoldenZLogo3D({ size = 42, interactive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = size * 2);
    const height = (canvas.height = size * 2);
    let angle = 0;
    let targetSpeed = 0.02;
    let currentSpeed = 0.02;

    const handleMouseEnter = () => {
      if (interactive) targetSpeed = 0.08;
    };
    const handleMouseLeave = () => {
      if (interactive) targetSpeed = 0.02;
    };

    const parent = canvas.parentElement;
    if (parent && interactive) {
      parent.addEventListener('mouseenter', handleMouseEnter);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      currentSpeed += (targetSpeed - currentSpeed) * 0.1;
      angle += currentSpeed;

      const cx = width / 2;
      const cy = height / 2;
      const r = size * 0.75;

      // Outer Astrolabe Ring
      ctx.save();
      ctx.translate(cx, cy);

      // Orbital Metallic Ring 1
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.9, r * 0.35, angle, 0, Math.PI * 2);
      ctx.stroke();

      // Orbital Metallic Ring 2
      ctx.strokeStyle = 'rgba(184, 134, 11, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.75, r * 0.28, -angle * 1.2, 0, Math.PI * 2);
      ctx.stroke();

      // 3D Extruded Golden Z Emblem
      const scaleX = Math.cos(angle * 0.8) * 0.25 + 0.75;

      ctx.scale(scaleX, 1);

      // Gold Gradient
      const grad = ctx.createLinearGradient(-r * 0.5, -r * 0.5, r * 0.5, r * 0.5);
      grad.addColorStop(0, '#FFE57F');
      grad.addColorStop(0.3, '#D4AF37');
      grad.addColorStop(0.7, '#B8860B');
      grad.addColorStop(1, '#785A00');

      // Shadow / Extrusion Offset
      ctx.strokeStyle = '#4A3700';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(-r * 0.45 + 2, -r * 0.45 + 2);
      ctx.lineTo(r * 0.45 + 2, -r * 0.45 + 2);
      ctx.lineTo(-r * 0.45 + 2, r * 0.45 + 2);
      ctx.lineTo(r * 0.45 + 2, r * 0.45 + 2);
      ctx.stroke();

      // Front Metallic Golden Z
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, -r * 0.45);
      ctx.lineTo(r * 0.45, -r * 0.45);
      ctx.lineTo(-r * 0.45, r * 0.45);
      ctx.lineTo(r * 0.45, r * 0.45);
      ctx.stroke();

      // Glowing Vertex Points
      const nodes = [
        { x: -r * 0.45, y: -r * 0.45 },
        { x: r * 0.45, y: -r * 0.45 },
        { x: -r * 0.45, y: r * 0.45 },
        { x: r * 0.45, y: r * 0.45 },
      ];

      nodes.forEach((n) => {
        ctx.fillStyle = '#FFE57F';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (parent && interactive) {
        parent.removeEventListener('mouseenter', handleMouseEnter);
        parent.removeEventListener('mouseleave', handleMouseLeave);
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
        filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.35))'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          display: 'block'
        }}
      />
    </Box>
  );
}
