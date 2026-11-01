import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import { pantheonAgents, pantheonCadres, pantheonAnimationStates } from '../data/pantheon';

/**
 * Live Animated Pixel Character Canvas
 * Renders the 8-frame row from `/assets/pantheon/pixel/<id>_spritesheet.png` (768x576, 8 cols x 6 rows of 96x96)
 * with nearest-neighbor scaling + procedural ability particles & holographic telemetry.
 */
function PixelCharacterCanvas({ agent, stateObj, frameIdx }) {
  const canvasRef = useRef(null);
  const spriteRef = useRef(null);
  const [loadedUrl, setLoadedUrl] = useState('');

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = agent.pixelSpritesheetUrl;
    img.onload = () => {
      if (active) {
        spriteRef.current = img;
        setLoadedUrl(agent.pixelSpritesheetUrl);
      }
    };
    return () => {
      active = false;
    };
  }, [agent.pixelSpritesheetUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle dark cyber grid backdrop
    ctx.fillStyle = '#070912';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = `${agent.color}22`;
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ground platform ellipse & ability aura
    const cx = w / 2;
    const cy = h * 0.78;
    const pulse = Math.sin((frameIdx / 8) * Math.PI * 2);
    const isAbility = stateObj.key === 'ability' || stateObj.key === 'ultimate';

    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, isAbility ? 96 : 64);
    grad.addColorStop(0, `${agent.color}66`);
    grad.addColorStop(0.55, `${agent.secondaryColor}33`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, isAbility ? 88 + pulse * 8 : 62 + pulse * 4, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw 96x96 frame from 768x576 spritesheet with nearest-neighbor scaling
    if (spriteRef.current && loadedUrl === agent.pixelSpritesheetUrl) {
      ctx.imageSmoothingEnabled = false;
      const sx = (frameIdx % 8) * 96;
      const sy = stateObj.index * 96;
      const drawSize = 192;
      ctx.drawImage(
        spriteRef.current,
        sx,
        sy,
        96,
        96,
        cx - drawSize / 2,
        h / 2 - drawSize / 2 - 6,
        drawSize,
        drawSize
      );
    }

    // Procedural ability / ultimate particle rings
    const particleCount = stateObj.key === 'ultimate' ? 18 : stateObj.key === 'ability' ? 12 : 6;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (frameIdx / 8) * Math.PI * 2;
      const rx = (isAbility ? 78 : 54) + Math.sin(angle * 3 + frameIdx) * 8;
      const ry = (isAbility ? 62 : 42) + Math.cos(angle * 2 + frameIdx) * 6;
      const px = cx + Math.cos(angle) * rx;
      const py = h * 0.48 + Math.sin(angle) * ry;
      ctx.fillStyle = i % 2 === 0 ? agent.color : agent.secondaryColor;
      ctx.fillRect(Math.round(px / 3) * 3, Math.round(py / 3) * 3, isAbility ? 5 : 3, isAbility ? 5 : 3);
    }

    // HUD overlay inside canvas
    ctx.fillStyle = 'rgba(7, 9, 18, 0.78)';
    ctx.fillRect(8, 8, 152, 22);
    ctx.fillStyle = agent.color;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`ROW ${stateObj.index} • FRAME 0${frameIdx + 1}/08`, 14, 22);
  }, [agent, stateObj, frameIdx, loadedUrl]);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={260}
        height={240}
        style={{
          width: '100%',
          height: 220,
          display: 'block',
          borderRadius: 8,
          imageRendering: 'pixelated',
          border: `1px solid ${agent.color}44`,
          background: '#070912',
        }}
      />
    </Box>
  );
}

/**
 * Interactive 3D Character & Ability Projection Canvas
 * Renders a rotatable 3D holographic rig representing the agent's unique anatomy,
 * weapon artifact, pet companion orbital, and ability VFX geometry, with direct .GLB download.
 */
function Interactive3DAbilityCanvas({ agent, stateObj, frameIdx }) {
  const canvasRef = useRef(null);
  const [rotY, setRotY] = useState(0.45);
  const [rotX, setRotX] = useState(0.22);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, baseRotY: 0.45, baseRotX: 0.22 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Deep space background
    const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.65);
    bg.addColorStop(0, `${agent.color}26`);
    bg.addColorStop(0.5, '#090C18');
    bg.addColorStop(1, '#05070E');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const phase = (frameIdx / 8) * Math.PI * 2;
    const yaw = rotY + phase * 0.35;
    const pitch = rotX;

    const project = (x, y, z) => {
      // Rotate Y
      const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
      const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
      // Rotate X
      const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
      const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
      const fov = 260 / (260 + z2 + 60);
      return {
        x: w / 2 + x1 * fov,
        y: h / 2 + y2 * fov,
        z: z2,
        scale: fov,
      };
    };

    // Draw 3D floor Tarot / Hermetic ring
    ctx.strokeStyle = `${agent.secondaryColor}66`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const p = project(Math.cos(a) * 68, 52, Math.sin(a) * 68);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Draw 3D Character Core Polyhedron + Archetype Wings / Tails / Rings
    const bob = Math.sin(phase) * (stateObj.key === 'meditate' ? -8 : 5);
    const vertices = [
      // Head octahedron
      [0, -48 + bob, 0],
      [-14, -34 + bob, -14],
      [14, -34 + bob, -14],
      [14, -34 + bob, 14],
      [-14, -34 + bob, 14],
      [0, -20 + bob, 0],
      // Torso prism
      [-20, -16 + bob, -12],
      [20, -16 + bob, -12],
      [20, -16 + bob, 12],
      [-20, -16 + bob, 12],
      [-14, 22 + bob, -10],
      [14, 22 + bob, -10],
      [14, 22 + bob, 10],
      [-14, 22 + bob, 10],
    ];

    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
      [6, 7], [7, 8], [8, 9], [9, 6],
      [10, 11], [11, 12], [12, 13], [13, 10],
      [6, 10], [7, 11], [8, 12], [9, 13],
    ];

    const projVerts = vertices.map(([vx, vy, vz]) => project(vx, vy, vz));

    // Draw archetype-specific 3D appendages (wings, 9-tails, tentacles, astrolabe rings)
    const wingCount =
      agent.id === 'KITSUNE' ? 9 : agent.id === 'KRAKEN' ? 8 : agent.id === 'VIGIL' ? 6 : 4;
    for (let wIdx = 0; wIdx < wingCount; wIdx++) {
      const spread = ((wIdx / (wingCount - 1)) - 0.5) * Math.PI * 1.1;
      const flair = stateObj.key === 'ability' || stateObj.key === 'ultimate' ? 64 : 44;
      const wx = Math.sin(spread) * flair;
      const wy = -12 + bob - Math.cos(spread) * 26 + Math.sin(phase + wIdx) * 6;
      const wz = -18 - Math.abs(Math.sin(spread)) * 16;
      const p0 = project(0, -10 + bob, -10);
      const p1 = project(wx, wy, wz);
      ctx.strokeStyle = wIdx % 2 === 0 ? agent.color : agent.secondaryColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      ctx.fillStyle = agent.color;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw wireframe edges
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = 1.6;
    edges.forEach(([a, b]) => {
      const pa = projVerts[a];
      const pb = projVerts[b];
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Draw orbiting Pet Companion 3D node
    const petOrbX = Math.cos(phase) * 54;
    const petOrbZ = Math.sin(phase) * 54;
    const petPos = project(petOrbX, -8 + Math.sin(phase * 2) * 8, petOrbZ);
    ctx.fillStyle = agent.secondaryColor;
    ctx.beginPath();
    ctx.arc(petPos.x, petPos.y, 6 * petPos.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '12px sans-serif';
    ctx.fillText(agent.petIcon, petPos.x - 6, petPos.y - 8);

    // Ability / Ultimate 3D Helical Rings
    if (stateObj.key === 'ability' || stateObj.key === 'ultimate' || stateObj.key === 'meditate') {
      const ringRadius = stateObj.key === 'ultimate' ? 78 : 58;
      ctx.strokeStyle = agent.secondaryColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2 + phase;
        const p = project(
          Math.cos(a) * ringRadius,
          Math.sin(a * 2) * 28,
          Math.sin(a) * ringRadius
        );
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // HUD overlay
    ctx.fillStyle = 'rgba(7, 9, 18, 0.78)';
    ctx.fillRect(8, 8, 184, 22);
    ctx.fillStyle = agent.secondaryColor;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(`3D GLB RIG • ${agent.archetype.toUpperCase()}`, 14, 22);
  }, [agent, stateObj, frameIdx, rotX, rotY]);

  const handleMouseDown = (e) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseRotY: rotY,
      baseRotX: rotX,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = (e.clientX - dragRef.current.startX) * 0.012;
    const dy = (e.clientY - dragRef.current.startY) * 0.012;
    setRotY(dragRef.current.baseRotY + dx);
    setRotX(Math.max(-0.8, Math.min(0.8, dragRef.current.baseRotX + dy)));
  };

  const handleMouseUp = () => {
    dragRef.current.active = false;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={260}
        height={240}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: 220,
          display: 'block',
          borderRadius: 8,
          cursor: 'grab',
          border: `1px solid ${agent.secondaryColor}44`,
          background: '#05070E',
        }}
      />
    </Box>
  );
}

// The 21 Sovereign Companions — real mascot & pixel avatars from the Zoth pantheon,
// rendered as an interactive badge ring in the footer + full 21-Agent Pixel • Braille • 3D Ability Studio Modal.
export default function SovereignMascots() {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const [studioOpen, setStudioOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('AZOTH');
  const [selectedCadre, setSelectedCadre] = useState('All');
  const [selectedStateKey, setSelectedStateKey] = useState('ability');
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [brailleCache, setBrailleCache] = useState({});
  const [copiedBraille, setCopiedBraille] = useState(false);

  const selectedAgent = useMemo(
    () => pantheonAgents.find((a) => a.id === selectedAgentId) || pantheonAgents[0],
    [selectedAgentId]
  );

  const selectedStateObj = useMemo(
    () => pantheonAnimationStates.find((s) => s.key === selectedStateKey) || pantheonAnimationStates[0],
    [selectedStateKey]
  );

  const filteredAgents = useMemo(
    () =>
      selectedCadre === 'All'
        ? pantheonAgents
        : pantheonAgents.filter((a) => a.cadre === selectedCadre),
    [selectedCadre]
  );

  // 8-frame animation loop when modal is open
  useEffect(() => {
    if (!studioOpen || !isPlaying) return undefined;
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % 8);
    }, 125);
    return () => clearInterval(timer);
  }, [studioOpen, isPlaying]);

  // Fetch Unicode U+2800 Braille JSON for the active agent
  useEffect(() => {
    if (!studioOpen || !selectedAgent?.brailleUrl) return;
    if (brailleCache[selectedAgent.id]) return;

    let active = true;
    fetch(selectedAgent.brailleUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && data.states) {
          setBrailleCache((prev) => ({ ...prev, [selectedAgent.id]: data.states }));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [studioOpen, selectedAgent, brailleCache]);

  const currentBrailleLines = useMemo(() => {
    const agentStates = brailleCache[selectedAgent.id];
    if (agentStates && agentStates[selectedStateKey] && agentStates[selectedStateKey][frameIdx]) {
      return agentStates[selectedStateKey][frameIdx];
    }
    // Instant deterministic fallback while JSON fetches
    return [
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀',
      `⠀⠀⠀⠀⠀⠀⣾⣿⣿⡿⠿⠛⠋⠉⠙⠛⠿⢿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀`,
      '⠀⠀⠀⠀⠀⢸⣿⣿⠋⠀⢀⣠⣤⣤⣄⡀⠀⠀⠙⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠸⣿⣿⡄⠀⢾⣿⣿⣿⣿⡷⠀⠀⢠⣿⣿⠇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠹⣿⣿⣦⣄⣉⣉⣉⣉⣠⣤⣾⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⢀⣠⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    ];
  }, [brailleCache, selectedAgent.id, selectedStateKey, frameIdx]);

  const handleOpenAgent = (agentId, defaultState = 'ability') => {
    setSelectedAgentId(agentId);
    setSelectedStateKey(defaultState);
    setFrameIdx(0);
    setStudioOpen(true);
  };

  const handleCopyBraille = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentBrailleLines.join('\n')).catch(() => {});
      setCopiedBraille(true);
      setTimeout(() => setCopiedBraille(false), 1600);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 3, pt: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Typography
        component="div"
        sx={{
          textAlign: 'center',
          fontFamily: '"Celtic Garamond", Georgia, serif',
          fontSize: '1.15rem',
          letterSpacing: '0.04em',
          color: dark ? '#D4AF37' : '#8A6508',
          mb: 0.75,
        }}
      >
        ✦ The 21 Sovereign Companions ✦
      </Typography>
      <Typography
        component="div"
        sx={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: theme.palette.text.secondary,
          mb: 1.5,
          maxWidth: 720,
          mx: 'auto',
        }}
      >
        The pantheon of familiars who keep vigil in the Void beside Zoth. Click any agent badge to inspect their 48-frame Pixel Spritesheet, 60fps Unicode U+2800 Braille Rig, 3D .GLB Anatomy &amp; Primary Ability.
      </Typography>

      {/* Prominent CTA Button right above the 21 badges */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          onClick={() => handleOpenAgent(selectedAgentId, 'ability')}
          variant="outlined"
          size="small"
          data-testid="open-pantheon-ability-studio-btn"
          sx={{
            borderRadius: 9999,
            px: 2.5,
            py: 0.75,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'none',
            color: dark ? '#FDE68A' : '#78350F',
            borderColor: dark ? 'rgba(212,175,55,0.65)' : '#D4AF37',
            background: dark
              ? 'linear-gradient(135deg, rgba(212,175,55,0.16) 0%, rgba(56,189,248,0.12) 100%)'
              : 'linear-gradient(135deg, #FEF9E7 0%, #FDE68A 100%)',
            boxShadow: '0 4px 18px -4px rgba(212,175,55,0.35)',
            '&:hover': {
              borderColor: '#F59E0B',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 24px -4px rgba(245,158,11,0.5)',
            },
          }}
        >
          ⚔️ Open 21-Agent Pixel • Braille • 3D Ability Studio
        </Button>
      </Box>

      {/* 21 Agent Interactive Companion Ring */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          maxWidth: 1120,
          mx: 'auto',
        }}
      >
        {pantheonAgents.map((agent) => (
          <Tooltip
            key={agent.id}
            title={`${agent.petIcon} ${agent.id} (${agent.tarotKey}) — ${agent.abilitySpec?.name}: ${agent.role}`}
            arrow
          >
            <Box
              onClick={() => handleOpenAgent(agent.id, 'ability')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenAgent(agent.id, 'ability');
                }
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.1,
                py: 0.5,
                borderRadius: 9999,
                border: `1px solid ${dark ? `${agent.color}55` : '#F0E1A8'}`,
                background: dark ? 'rgba(13, 16, 28, 0.82)' : '#FEF9E7',
                color: theme.palette.text.primary,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': {
                  borderColor: agent.color || '#D4AF37',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px -6px ${agent.color || '#D4AF37'}66`,
                },
              }}
            >
              <Avatar
                src={agent.pixelIdleUrl || agent.img}
                alt={`${agent.id} pixel avatar`}
                sx={{
                  width: 26,
                  height: 26,
                  border: `1px solid ${agent.color || '#D4AF37'}`,
                  bgcolor: dark ? '#0B0B12' : '#FFFFFF',
                  '& img': { imageRendering: 'pixelated' },
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  color: dark ? '#F8FAFC' : '#1E293B',
                }}
              >
                {agent.id}
              </Typography>
              <Typography component="span" sx={{ fontSize: '0.78rem', lineHeight: 1 }}>
                {agent.petIcon}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* ⚡ Pantheon 21 Character & Ability Studio Modal */}
      <Dialog
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: '#080B14',
            color: '#F8FAFC',
            border: `1px solid ${selectedAgent.color}55`,
            borderRadius: 3,
            boxShadow: `0 24px 80px -12px ${selectedAgent.color}40`,
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Header Bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              pb: 2,
              mb: 2,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={selectedAgent.pixelIdleUrl || selectedAgent.img}
                alt={`${selectedAgent.id} avatar`}
                sx={{
                  width: 48,
                  height: 48,
                  border: `2px solid ${selectedAgent.color}`,
                  bgcolor: '#05070E',
                  '& img': { imageRendering: 'pixelated' },
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography
                    sx={{
                      fontFamily: '"Syne", Georgia, serif',
                      fontWeight: 800,
                      fontSize: { xs: '1.1rem', md: '1.35rem' },
                      color: '#F8FAFC',
                    }}
                  >
                    ⚡ Pantheon 21 Character &amp; Ability Studio — {selectedAgent.id}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${selectedAgent.petIcon} ${selectedAgent.petName}`}
                    sx={{
                      bgcolor: `${selectedAgent.color}22`,
                      color: selectedAgent.color,
                      border: `1px solid ${selectedAgent.color}55`,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                  <Chip
                    size="small"
                    label={selectedAgent.tarotKey}
                    sx={{
                      bgcolor: `${selectedAgent.secondaryColor}22`,
                      color: selectedAgent.secondaryColor,
                      border: `1px solid ${selectedAgent.secondaryColor}55`,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: 'rgba(226,232,240,0.76)',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {selectedAgent.role} • Cadre: {selectedAgent.cadre} • Archetype: {selectedAgent.archetype}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsPlaying((p) => !p)}
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.72rem',
                  color: '#F8FAFC',
                  borderColor: 'rgba(255,255,255,0.25)',
                }}
              >
                {isPlaying ? '⏸ Pause Loop' : '▶ Play Loop'}
              </Button>
              <IconButton
                onClick={() => setStudioOpen(false)}
                aria-label="Close Pantheon Studio"
                sx={{ color: '#94A3B8', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                ✕
              </IconButton>
            </Box>
          </Box>

          {/* Cadre Filter + 21 Agent Switcher Strip */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.25 }}>
              {pantheonCadres.map((cadre) => (
                <Chip
                  key={cadre}
                  label={
                    cadre === 'All'
                      ? `All 21 Agents`
                      : `${cadre} (${pantheonAgents.filter((a) => a.cadre === cadre).length})`
                  }
                  size="small"
                  onClick={() => setSelectedCadre(cadre)}
                  sx={{
                    cursor: 'pointer',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    bgcolor: selectedCadre === cadre ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                    color: selectedCadre === cadre ? '#05070E' : '#CBD5E1',
                  }}
                />
              ))}
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(212,175,55,0.35)',
                  borderRadius: 3,
                },
              }}
            >
              {filteredAgents.map((agent) => {
                const active = agent.id === selectedAgent.id;
                return (
                  <Box
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.6,
                      borderRadius: 2,
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: `1px solid ${active ? agent.color : 'rgba(255,255,255,0.12)'}`,
                      background: active ? `${agent.color}24` : 'rgba(15, 23, 42, 0.75)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Avatar
                      src={agent.pixelIdleUrl || agent.img}
                      alt={agent.id}
                      sx={{
                        width: 24,
                        height: 24,
                        '& img': { imageRendering: 'pixelated' },
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.72rem',
                        fontWeight: active ? 800 : 600,
                        color: active ? '#FFFFFF' : '#CBD5E1',
                      }}
                    >
                      {agent.id}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                      {agent.petIcon}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* 6 Animation States Selector Bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mb: 2.5,
              p: 1.25,
              borderRadius: 2,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {pantheonAnimationStates.map((st) => {
                const isSelected = st.key === selectedStateKey;
                return (
                  <Button
                    key={st.key}
                    size="small"
                    onClick={() => {
                      setSelectedStateKey(st.key);
                      setFrameIdx(0);
                    }}
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      border: `1px solid ${
                        isSelected ? selectedAgent.color : 'rgba(255,255,255,0.14)'
                      }`,
                      background: isSelected
                        ? `linear-gradient(135deg, ${selectedAgent.color}38, ${selectedAgent.secondaryColor}28)`
                        : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#FFFFFF' : '#94A3B8',
                    }}
                  >
                    {st.label}
                  </Button>
                );
              })}
            </Box>

            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.75rem',
                color: selectedAgent.color,
              }}
            >
              [{selectedStateObj.badge}] — {selectedAgent.animations?.[selectedStateKey]}
            </Typography>
          </Box>

          {/* 4-Stage Bento Grid: Pixel Canvas | Braille Lattice | 3D GLB Stage | High-Res Portrait & Ability Dossier */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {/* 1. 👾 Live Animated Pixel Character Canvas */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: 'rgba(13, 17, 30, 0.92)',
                border: `1px solid ${selectedAgent.color}44`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: selectedAgent.color,
                  }}
                >
                  👾 1. Live 48-Frame Pixel Character Canvas
                </Typography>
                <Button
                  component="a"
                  href={selectedAgent.pixelSpritesheetUrl}
                  download={`${selectedAgent.id.toLowerCase()}_spritesheet.png`}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.68rem',
                    textTransform: 'none',
                    color: '#E2E8F0',
                    border: '1px solid rgba(255,255,255,0.18)',
                    px: 1,
                    py: 0.2,
                  }}
                >
                  ⬇ Spritesheet .PNG
                </Button>
              </Box>
              <PixelCharacterCanvas
                agent={selectedAgent}
                stateObj={selectedStateObj}
                frameIdx={frameIdx}
              />
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '0.74rem',
                  color: '#94A3B8',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                Weapon: <strong style={{ color: '#F8FAFC' }}>{selectedAgent.weapon}</strong> • Headgear:{' '}
                <strong style={{ color: '#F8FAFC' }}>{selectedAgent.headgear}</strong> • Back:{' '}
                <strong style={{ color: '#F8FAFC' }}>{selectedAgent.backItem}</strong>
              </Typography>
            </Box>

            {/* 2. ⣿ Live Animated Unicode U+2800 ASCII Braille Lattice Stage */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: 'rgba(13, 17, 30, 0.92)',
                border: `1px solid ${selectedAgent.secondaryColor}44`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: selectedAgent.secondaryColor,
                  }}
                >
                  ⣿ 2. Live Unicode U+2800 Braille Lattice Stage
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Button
                    size="small"
                    onClick={handleCopyBraille}
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.68rem',
                      textTransform: 'none',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255,255,255,0.18)',
                      px: 1,
                      py: 0.2,
                    }}
                  >
                    {copiedBraille ? '✓ Copied' : '📋 Copy Braille'}
                  </Button>
                  <Button
                    component="a"
                    href={selectedAgent.brailleUrl}
                    target="_blank"
                    rel="noreferrer"
                    size="small"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.68rem',
                      textTransform: 'none',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255,255,255,0.18)',
                      px: 1,
                      py: 0.2,
                    }}
                  >
                    ⬇ .JSON Rig
                  </Button>
                </Box>
              </Box>

              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  height: 220,
                  borderRadius: 2,
                  background: '#05070E',
                  border: `1px solid ${selectedAgent.secondaryColor}33`,
                  color: selectedAgent.color,
                  textShadow: `0 0 10px ${selectedAgent.color}66`,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.76rem',
                  lineHeight: 1.12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  userSelect: 'all',
                }}
              >
                {currentBrailleLines.join('\n')}
              </Box>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '0.74rem',
                  color: '#94A3B8',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                2×4 Sub-Pixel U+2800 Matrix • State:{' '}
                <strong style={{ color: '#F8FAFC' }}>{selectedStateObj.label}</strong> (Frame {frameIdx + 1}/8)
              </Typography>
            </Box>

            {/* 3. 🧊 Interactive 3D Character & Ability Canvas + .GLB Download */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: 'rgba(13, 17, 30, 0.92)',
                border: `1px solid ${selectedAgent.secondaryColor}44`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#F8FAFC',
                  }}
                >
                  🧊 3. Interactive 3D Anatomy &amp; Ability Rig
                </Typography>
                <Button
                  component="a"
                  href={selectedAgent.glbUrl}
                  download={`${selectedAgent.id.toLowerCase()}.glb`}
                  size="small"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: '#05070E',
                    bgcolor: selectedAgent.color,
                    px: 1.2,
                    py: 0.25,
                    '&:hover': { bgcolor: selectedAgent.secondaryColor },
                  }}
                >
                  ⬇ Download 3D .GLB ({selectedAgent.id})
                </Button>
              </Box>

              <Interactive3DAbilityCanvas
                agent={selectedAgent}
                stateObj={selectedStateObj}
                frameIdx={frameIdx}
              />
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '0.74rem',
                  color: '#94A3B8',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                Drag to orbit 3D rig • Blender 4.0 Multi-Mesh Artifact:{' '}
                <code style={{ color: selectedAgent.secondaryColor }}>{selectedAgent.glbUrl}</code>
              </Typography>
            </Box>

            {/* 4. 🖼️ High-Res Portrait & Ability Dossier Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background: 'rgba(13, 17, 30, 0.92)',
                border: `1px solid ${selectedAgent.color}44`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: selectedAgent.color,
                    mb: 1.25,
                  }}
                >
                  🖼️ 4. High-Res Portrait &amp; Ability Dossier
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1.5 }}>
                  <Box
                    component="img"
                    src={selectedAgent.portraitUrl || selectedAgent.img}
                    alt={`${selectedAgent.id} high-res portrait`}
                    sx={{
                      width: 112,
                      height: 112,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: `2px solid ${selectedAgent.color}`,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Syne", sans-serif',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: '#FFFFFF',
                        mb: 0.4,
                      }}
                    >
                      ⚡ {selectedAgent.abilitySpec?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 0.75 }}>
                      <Chip
                        size="small"
                        label={`CD: ${selectedAgent.abilitySpec?.cooldown}`}
                        sx={{
                          height: 20,
                          fontSize: '0.66rem',
                          fontFamily: '"JetBrains Mono", monospace',
                          bgcolor: 'rgba(255,255,255,0.08)',
                          color: '#FDE68A',
                        }}
                      />
                      <Chip
                        size="small"
                        label={`VFX: ${selectedAgent.abilitySpec?.vfxType}`}
                        sx={{
                          height: 20,
                          fontSize: '0.66rem',
                          fontFamily: '"JetBrains Mono", monospace',
                          bgcolor: 'rgba(255,255,255,0.08)',
                          color: '#38BDF8',
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                      {selectedAgent.abilitySpec?.description}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    background: 'rgba(5, 7, 14, 0.75)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.72rem',
                      color: selectedAgent.secondaryColor,
                      fontWeight: 700,
                      mb: 0.4,
                    }}
                  >
                    BUFF / TACTICAL EFFECT: {selectedAgent.abilitySpec?.effect}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.7rem',
                      color: '#94A3B8',
                    }}
                  >
                    ULTIMATE: {selectedAgent.animations?.ultimate}
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  mt: 1.25,
                  fontSize: '0.68rem',
                  color: '#64748B',
                  fontFamily: '"JetBrains Mono", monospace',
                  textAlign: 'right',
                }}
              >
                Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
