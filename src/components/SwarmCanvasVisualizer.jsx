import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { pantheonAgents } from '../data/pantheon';

export default function SwarmCanvasVisualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = canvas.parentElement.clientWidth || 800);
    const height = (canvas.height = 320);

    const agentRoles = pantheonAgents.map((agent) => agent.id);

    const nodes = agentRoles.map((role, i) => {
      const angle = (i / agentRoles.length) * Math.PI * 2;
      const radius = i === 0 ? 0 : 100 + (i % 3) * 35;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * (radius * 0.7);
      return {
        id: role,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        isCore: i === 0 || role === 'AZOTH' || role === 'HERMES'
      };
    });

    const particles = Array.from({ length: 16 }).map(() => ({
      from: Math.floor(Math.random() * nodes.length),
      to: Math.floor(Math.random() * nodes.length),
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.01
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background Grid Pattern
      ctx.strokeStyle = 'rgba(234, 236, 240, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.35 * (1 - dist / 160)})`;
            ctx.lineWidth = nodes[i].isCore || nodes[j].isCore ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Move and Draw Particles
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.from = Math.floor(Math.random() * nodes.length);
          p.to = Math.floor(Math.random() * nodes.length);
        }
        const fromNode = nodes[p.from];
        const toNode = nodes[p.to];
        const px = fromNode.x + (toNode.x - fromNode.x) * p.progress;
        const py = fromNode.y + (toNode.y - fromNode.y) * p.progress;

        ctx.fillStyle = '#D4AF37';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and Draw Nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce bounds
        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        // Node Glow
        ctx.fillStyle = node.isCore ? '#B8860B' : '#101828';
        ctx.strokeStyle = node.isCore ? '#D4AF37' : '#B8860B';
        ctx.lineWidth = node.isCore ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.isCore ? 8 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Node Label
        ctx.font = node.isCore ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillStyle = node.isCore ? '#B8860B' : '#475467';
        ctx.fillText(node.id, node.x + 10, node.y + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <Paper sx={{ p: 2, border: '1px solid #EAECF0', mb: 4, overflow: 'hidden', position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#B8860B', letterSpacing: '0.05em' }}>
          PANTHEON ROSTER MAP
        </Typography>
        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 700, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace' }}>
          Diagram of names. Not a live bus.
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 320, background: '#FAFAFA', borderRadius: 1.5, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </Box>
    </Paper>
  );
}
