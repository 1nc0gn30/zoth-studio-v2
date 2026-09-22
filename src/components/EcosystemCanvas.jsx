import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';

export default function EcosystemCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = canvas.parentElement.clientWidth || 800);
    const height = (canvas.height = 260);

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Clean White Grid Pattern
      ctx.strokeStyle = 'rgba(234, 236, 240, 0.5)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      angle += 0.015;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Rotating 3D Golden Z Ring
      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 110, 45, angle * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(184, 134, 11, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 30, -angle * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Golden Z Emblem Path
      ctx.strokeStyle = '#B8860B';
      ctx.fillStyle = '#D4AF37';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(-35, -25);
      ctx.lineTo(35, -25);
      ctx.lineTo(-35, 25);
      ctx.lineTo(35, 25);
      ctx.stroke();

      // Glowing Golden Points
      const points = [
        { x: -35, y: -25 },
        { x: 35, y: -25 },
        { x: -35, y: 25 },
        { x: 35, y: 25 },
      ];

      points.forEach((p) => {
        ctx.fillStyle = '#D4AF37';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();

      // Draw Satellite Tool Nodes
      const satelliteCount = 8;
      for (let i = 0; i < satelliteCount; i++) {
        const satAngle = angle + (i * Math.PI * 2) / satelliteCount;
        const sx = centerX + Math.cos(satAngle) * 140;
        const sy = centerY + Math.sin(satAngle) * 65;

        // Line to center
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Node Circle
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Paper sx={{ p: 2, border: '1px solid #EAECF0', mb: 5, overflow: 'hidden', bgcolor: '#FAFAFA' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#B8860B', letterSpacing: '0.05em' }}>
          ✨ ZOTH SOVEREIGN ECOSYSTEM — GOLDEN ARCHITECTURE CANVAS
        </Typography>
        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 600 }}>
          ROSTER MAP • NOT LIVE TELEMETRY
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 260, borderRadius: 1.5, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </Box>
    </Paper>
  );
}
