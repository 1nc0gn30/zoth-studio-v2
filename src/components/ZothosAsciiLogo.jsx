import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const BIT = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];
const ASCII_RAMP = ' .:-=+*#%@⣿';

// Crisp 7-row pixel matrix for "ZOTHOS"
const GLYPH_MAP = {
  Z: [
    '1111111',
    '1111111',
    '0000110',
    '0011100',
    '0110000',
    '1111111',
    '1111111',
  ],
  O: [
    '0111110',
    '1111111',
    '1100011',
    '1100011',
    '1100011',
    '1111111',
    '0111110',
  ],
  T: [
    '1111111',
    '1111111',
    '0011100',
    '0011100',
    '0011100',
    '0011100',
    '0011100',
  ],
  H: [
    '1100011',
    '1100011',
    '1111111',
    '1111111',
    '1100011',
    '1100011',
    '1100011',
  ],
  S: [
    '0111111',
    '1110000',
    '1111110',
    '0111111',
    '0000111',
    '1111111',
    '1111110',
  ],
};

// Build a normalized 2D bitmap of "ZOTHOS" for high-density Braille/Bayer/Voxel sampling
const WORD = 'ZOTHOS';
const WORD_H = 7;
const WORD_W = WORD.length * 8 - 1;
const WORD_GRID = (() => {
  const g = Array.from({ length: WORD_H }, () => new Uint8Array(WORD_W));
  for (let c = 0; c < WORD.length; c++) {
    const mat = GLYPH_MAP[WORD[c]];
    for (let y = 0; y < WORD_H; y++) {
      for (let x = 0; x < 7; x++) {
        if (mat[y][x] === '1') {
          g[y][c * 8 + x] = 1;
        }
      }
    }
  }
  return g;
})();

// 3D Lattice Cube vertices & edges (3x3x3 subdivided lattice)
const LAT_P = [];
const LAT_E = [];
const LN = 2;
for (let i = 0; i <= LN; i++) {
  for (let j = 0; j <= LN; j++) {
    for (let k = 0; k <= LN; k++) {
      LAT_P.push([(i / LN) * 2 - 1, (j / LN) * 2 - 1, (k / LN) * 2 - 1]);
    }
  }
}
const lid = (i, j, k) => (i * (LN + 1) + j) * (LN + 1) + k;
for (let i = 0; i <= LN; i++) {
  for (let j = 0; j <= LN; j++) {
    for (let k = 0; k <= LN; k++) {
      if (i < LN) LAT_E.push([lid(i, j, k), lid(i + 1, j, k)]);
      if (j < LN) LAT_E.push([lid(i, j, k), lid(i, j + 1, k)]);
      if (k < LN) LAT_E.push([lid(i, j, k), lid(i, j, k + 1)]);
    }
  }
}

const FX_MODES = ['hybrid', 'braille', 'dither', 'ascii', 'lattice'];

/**
 * Compact 60fps Unicode U+2800 Braille + 3D Lattice + Ordered Bayer 4x4 Dither Brand Mark
 * Used in Navbar (`size="sm"`), Footer (`size="md"`), and Hero (`size="hero"`).
 */
export default function ZothosAsciiLogo({ size = 'sm' }) {
  if (size === 'hero') {
    return <ZothosHeroLogoStage />;
  }
  return <ZothosCompactLogoBadge size={size} />;
}

function ZothosCompactLogoBadge({ size }) {
  const canvasRef = useRef(null);
  const [fxIndex, setFxIndex] = useState(0);
  const hoveredRef = useRef(false);
  const fxRef = useRef('hybrid');
  fxRef.current = FX_MODES[fxIndex % FX_MODES.length];

  const isMd = size === 'md';
  const W = isMd ? 248 : 208;
  const H = isMd ? 50 : 42;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    // Floating Braille/dither wake embers for the compact mark
    const sparks = Array.from({ length: 24 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0.35 + Math.random() * 0.9,
      glyph: '⣿⠿⠇⠋01/>#'[i % 9],
      tone: i % 3,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    const render = (now) => {
      const t = now * 0.001;
      const fx = fxRef.current;
      const boost = hoveredRef.current ? 2.4 : 1.0;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // 1. Background subtle Bayer 4x4 dithered obsidian grid
      ctx.fillStyle = '#050609';
      ctx.fillRect(0, 0, W, H);

      // 2. Left Emblem: 60fps Rotating 3D Braille/Bayer Lattice Cube + Extruded Z Monolith
      const cx = isMd ? 26 : 22;
      const cy = H * 0.5;
      const cubeR = isMd ? 14.5 : 12;
      const ay = t * 0.9 * boost;
      const ax = 0.48 + Math.sin(t * 0.7) * 0.25;
      const cyRot = Math.cos(ay),
        syRot = Math.sin(ay),
        cxRot = Math.cos(ax),
        sxRot = Math.sin(ax);

      const proj = LAT_P.map(([x, y, z]) => {
        const X = x * cyRot - z * syRot;
        let Z = x * syRot + z * cyRot;
        const Y = y * cxRot - Z * sxRot;
        Z = y * sxRot + Z * cxRot;
        const f = 2.4 / (3.1 + Z);
        return [cx + X * cubeR * f, cy + Y * cubeR * f, Z];
      });

      // Draw 3D lattice edges with Ordered Bayer dither points
      ctx.lineWidth = 0.9;
      for (let e = 0; e < LAT_E.length; e++) {
        const [aIdx, bIdx] = LAT_E[e];
        const A = proj[aIdx];
        const B = proj[bIdx];
        const depthAlpha = 0.2 + ((2 - (A[2] + B[2]) * 0.5) / 4) * 0.45;
        ctx.strokeStyle = `rgba(212, 175, 55, ${depthAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
      }

      // Draw glowing 3D vertices
      for (let v = 0; v < proj.length; v++) {
        const P = proj[v];
        if (P[2] < 0.2) {
          ctx.fillStyle = P[2] < -0.4 ? '#FFF1B8' : '#D4AF37';
          ctx.fillRect(P[0] - 1.1, P[1] - 1.1, 2.2, 2.2);
        }
      }

      // Central extruded 24K Gold "Z" inside the 3D lattice
      const zArm = isMd ? 8.5 : 7.2;
      const zRise = isMd ? 9.5 : 8.0;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(Math.cos(t * 1.1) * 0.14 + 0.88, 1);
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      // Shadow extrusion
      ctx.strokeStyle = '#5C4308';
      ctx.lineWidth = isMd ? 3.2 : 2.7;
      ctx.beginPath();
      ctx.moveTo(-zArm + 1.2, -zRise + 1.2);
      ctx.lineTo(zArm + 1.2, -zRise + 1.2);
      ctx.lineTo(-zArm + 1.2, zRise + 1.2);
      ctx.lineTo(zArm + 1.2, zRise + 1.2);
      ctx.stroke();
      // Specular 24K Gold front stroke
      ctx.strokeStyle = '#FFE89E';
      ctx.lineWidth = isMd ? 2.8 : 2.3;
      ctx.beginPath();
      ctx.moveTo(-zArm, -zRise);
      ctx.lineTo(zArm, -zRise);
      ctx.lineTo(-zArm, zRise);
      ctx.lineTo(zArm, zRise);
      ctx.stroke();
      ctx.restore();

      // Divider tick
      const divX = isMd ? 50 : 42;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(divX, 7);
      ctx.lineTo(divX, H - 7);
      ctx.stroke();

      // 3. Right Wordmark: High-Density Sub-Pixel Braille + Bayer 4x4 Dither "ZOTHOS"
      const startX = isMd ? 58 : 49;
      const startY = isMd ? 8 : 6.5;
      const cellW = isMd ? 3.45 : 2.88;
      const cellH = isMd ? 3.2 : 2.68;
      const scanWave = ((t * 0.65 * boost) % 1.4) - 0.2;

      for (let gy = 0; gy < WORD_H; gy++) {
        for (let gx = 0; gx < WORD_W; gx++) {
          if (!WORD_GRID[gy][gx]) continue;
          const nx = gx / WORD_W;
          const ny = gy / WORD_H;
          const px = startX + gx * cellW;
          const py = startY + gy * cellH;

          // Edge detection for Sobel rim highlight
          const isTopOrLeft =
            gy === 0 || gx === 0 || !WORD_GRID[gy - 1]?.[gx] || !WORD_GRID[gy]?.[gx - 1];
          const waveDist = Math.abs(nx - scanWave);
          const waveGlow = Math.max(0, 1 - waveDist * 5.5);

          // Bayer 4x4 threshold
          const bayer = BAYER4[(gy & 3) * 4 + (gx & 3)];
          const lum = 0.62 + (1 - ny) * 0.28 + (isTopOrLeft ? 0.25 : 0) + waveGlow * 0.45;

          // Dissolve wake on right edge
          const dissolveZone = nx > 0.78 && bayer > 0.55 + Math.sin(t * 3 + gy) * 0.2;
          const offsetX = dissolveZone ? Math.sin(t * 4 + gy * 0.7) * 2.5 + 1.5 : 0;

          if (fx === 'braille') {
            ctx.fillStyle = waveGlow > 0.3 || isTopOrLeft ? '#FFF3C4' : '#D4AF37';
            ctx.beginPath();
            ctx.arc(px + cellW * 0.45 + offsetX, py + cellH * 0.45, cellW * 0.38, 0, Math.PI * 2);
            ctx.fill();
          } else if (fx === 'dither') {
            if (lum < bayer * 0.55) continue;
            ctx.fillStyle = lum > 0.95 ? '#FFF3C4' : lum > 0.72 ? '#F5B82E' : '#9A7014';
            ctx.fillRect(px + offsetX, py, cellW - 0.4, cellH - 0.4);
          } else if (fx === 'ascii') {
            ctx.font = `bold ${isMd ? 4.5 : 3.8}px "JetBrains Mono", monospace`;
            ctx.fillStyle = isTopOrLeft || waveGlow > 0.25 ? '#FFF3C4' : '#D4AF37';
            ctx.fillText(isTopOrLeft ? '#' : '⣿', px + offsetX, py + cellH);
          } else if (fx === 'lattice') {
            ctx.strokeStyle = isTopOrLeft ? '#FFF3C4' : '#D4AF37';
            ctx.lineWidth = 0.75;
            ctx.strokeRect(px + offsetX, py, cellW - 0.5, cellH - 0.5);
          } else {
            // HYBRID: Solid bevel + Bayer dither interior + Braille/voxel right wake
            ctx.fillStyle =
              waveGlow > 0.35
                ? '#FFF7D6'
                : isTopOrLeft
                ? '#F7E29C'
                : lum > bayer * 0.45 + 0.45
                ? '#D4AF37'
                : '#8C6510';
            ctx.fillRect(px + offsetX, py, cellW - 0.35, cellH - 0.35);
          }
        }
      }

      // 4. Streaming Braille & Bayer embers across right side
      ctx.font = `bold ${isMd ? 8.5 : 7.5}px "JetBrains Mono", monospace`;
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.x += s.vx * boost;
        if (s.x > W - 6) {
          s.x = startX + WORD_W * cellW * 0.55 + Math.random() * 25;
          s.y = 6 + Math.random() * (H - 18);
        }
        const alpha = 0.28 + 0.35 * Math.sin(t * 3 + s.phase);
        ctx.fillStyle =
          s.tone === 0
            ? `rgba(255, 241, 184, ${alpha.toFixed(2)})`
            : `rgba(212, 175, 55, ${alpha.toFixed(2)})`;
        if (i % 2 === 0) {
          ctx.fillText(s.glyph, s.x, s.y);
        } else {
          ctx.fillRect(s.x, s.y - 3, 2, 2);
        }
      }

      // 5. Crisp Micro-Telemetry Sub-Line under ZOTHOS
      ctx.font = `bold ${isMd ? 7.8 : 6.6}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.fillStyle = '#9A8B68';
      const subText = `⣿ U+2800 · ${fx.toUpperCase()} · v3.4`;
      ctx.fillText(subText, startX, H - (isMd ? 5.5 : 4.5));

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [W, H, isMd]);

  return (
    <Box
      role="img"
      aria-label="ZOTHOS 60fps Unicode Braille, 3D Lattice, and Bayer Dither Brand Emblem"
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onClick={(e) => {
        // Cycle shader mode if user clicks logo while already on home
        if (window.location.pathname === '/') {
          e.preventDefault();
          setFxIndex((i) => (i + 1) % FX_MODES.length);
        }
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        bgcolor: '#050609',
        border: '1px solid rgba(212, 175, 55, 0.55)',
        boxShadow: '0 4px 18px -2px rgba(212, 175, 55, 0.25), inset 0 0 12px rgba(212, 175, 55, 0.08)',
        overflow: 'hidden',
        maxWidth: '100%',
        userSelect: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
        '&:hover': {
          borderColor: '#FFE57F',
          boxShadow: '0 6px 22px -2px rgba(212, 175, 55, 0.45)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${W}px`,
          height: `${H}px`,
          maxWidth: '100%',
          display: 'block',
        }}
      />
    </Box>
  );
}

/**
 * Monumental 60fps Interactive Hero ZOTHOS 3D Volumetric Emblem, Braille Lattice & Bayer Dither Turntable
 */
function ZothosHeroLogoStage() {
  const canvasRef = useRef(null);
  const [activeFx, setActiveFx] = useState('hybrid');
  const [activeLoop, setActiveLoop] = useState('orbit');
  const stateRef = useRef({
    fx: 'hybrid',
    loop: 'orbit',
    yaw: 0,
    pitch: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    dragging: false,
    dragStartX: 0,
    morphStart: performance.now(),
  });

  stateRef.current.fx = activeFx;
  stateRef.current.loop = activeLoop;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CW = 560;
    const CH = 460;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;

    // Pre-build 3D voxel point cloud for the monumental Z Monolith + Outer Octagon Shield
    const shieldVoxels = [];
    for (let gy = -26; gy <= 26; gy++) {
      for (let gx = -26; gx <= 26; gx++) {
        const nx = gx / 26;
        const ny = gy / 26;
        const r = Math.hypot(nx, ny);
        // Octagonal shield ring
        const oct = Math.max(Math.abs(nx), Math.abs(ny), (Math.abs(nx) + Math.abs(ny)) * 0.73);
        const onShieldRing = oct >= 0.84 && oct <= 0.96;
        const onInnerRing = Math.abs(r - 0.64) < 0.045;

        // Bold Z monolith inside shield
        const inTopBar = ny >= -0.46 && ny <= -0.28 && nx >= -0.44 && nx <= 0.44;
        const inBotBar = ny >= 0.28 && ny <= 0.46 && nx >= -0.44 && nx <= 0.44;
        const diagDist = Math.abs(nx + ny * 0.95);
        const inDiag = ny >= -0.32 && ny <= 0.32 && diagDist <= 0.14;
        const inCenterCross = Math.abs(ny) <= 0.06 && Math.abs(nx) <= 0.24;

        const isZ = inTopBar || inBotBar || inDiag || inCenterCross;
        if (!isZ && !onShieldRing && !onInnerRing) continue;

        const isEdge =
          isZ &&
          (Math.abs(ny + 0.46) < 0.05 ||
            Math.abs(ny - 0.46) < 0.05 ||
            Math.abs(nx + 0.44) < 0.05 ||
            Math.abs(nx - 0.44) < 0.05 ||
            Math.abs(diagDist - 0.14) < 0.045);

        const bayer = BAYER4[((gy + 32) & 3) * 4 + ((gx + 32) & 3)];
        const zDepth = isZ ? (isEdge ? 26 : 16) : onShieldRing ? -8 : 4;
        const tone = isEdge ? 2 : isZ ? 1 : onShieldRing ? 1 : 0;
        const brailleChar = String.fromCharCode(
          0x2800 +
            ((isZ ? 0xff : 0x36) ^ (((gx * 17 + gy * 31) & 0x7f) & (isEdge ? 0x00 : 0x24))),
        );
        const asciiChar = isEdge ? '#' : isZ ? '@' : onShieldRing ? '=' : '+';

        shieldVoxels.push({
          gx,
          gy,
          nx,
          ny,
          z: zDepth,
          bayer,
          tone,
          isZ,
          isEdge,
          brailleChar,
          asciiChar,
          seed: ((gx * 73 + gy * 151) & 255) / 255,
        });
      }
    }

    // Floating Braille & hex particles
    const embers = Array.from({ length: 75 }, (_, i) => ({
      x: Math.random() * CW,
      y: 30 + Math.random() * (CH - 90),
      vx: 0.5 + Math.random() * 1.6,
      vy: (Math.random() - 0.5) * 0.5,
      glyph: '⣿⠿⠇⠋01/>_#*λ'[i % 12],
      tone: i % 4 === 0 ? 2 : i % 2 === 0 ? 1 : 0,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    const render = (now) => {
      const t = now * 0.001;
      const st = stateRef.current;
      const fx = st.fx;
      const morphElapsed = now - st.morphStart;
      const morphU = Math.min(1, morphElapsed / 680);
      const vortexAmp = morphU < 1 ? Math.sin(morphU * Math.PI) : 0;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, CW, CH);

      // 1. Background 3D Perspective Hypercube Lattice in Braille/Bayer Dither
      const cx = CW * 0.5;
      const cy = CH * 0.43;
      const spinSpeed = st.loop === 'spin' ? 1.35 : st.loop === 'pulse' ? 0.85 : 0.45;
      const yaw = t * spinSpeed + st.yaw + (st.mouseX - 0.5) * 0.75;
      const pitch = 0.32 + Math.sin(t * 0.5) * 0.14 + (st.mouseY - 0.5) * 0.4;
      const cosY = Math.cos(yaw),
        sinY = Math.sin(yaw);
      const cosX = Math.cos(pitch),
        sinX = Math.sin(pitch);

      const bgScale = 152;
      const bgProj = LAT_P.map(([x, y, z]) => {
        const X = x * cosY - z * sinY;
        let Z = x * sinY + z * cosY;
        const Y = y * cosX - Z * sinX;
        Z = y * sinX + Z * cosX;
        const f = 3.0 / (3.8 + Z);
        return [cx + X * bgScale * f, cy + Y * bgScale * f, Z];
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < LAT_E.length; i++) {
        const [a, b] = LAT_E[i];
        const A = bgProj[a],
          B = bgProj[b];
        const alpha = 0.08 + ((2 - (A[2] + B[2]) * 0.5) / 4) * 0.18;
        ctx.strokeStyle = `rgba(212, 175, 55, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
      }

      // 2. 3D Perspective Holo-Pedestal & Degree Ring under the Monolith
      const pedY = CH * 0.82;
      const pedRx = 185;
      const pedRy = 38;
      const deg = (((yaw * 180) / Math.PI) % 360 + 360) % 360;

      const floorGlow = ctx.createRadialGradient(cx, pedY, 8, cx, pedY, pedRx * 1.15);
      floorGlow.addColorStop(0, 'rgba(245, 184, 46, 0.24)');
      floorGlow.addColorStop(0.6, 'rgba(138, 101, 20, 0.08)');
      floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = floorGlow;
      ctx.beginPath();
      ctx.ellipse(cx, pedY, pedRx * 1.15, pedRy * 1.35, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + yaw;
        const sA = Math.sin(a),
          cA = Math.cos(a);
        const dAlpha = 0.2 + (sA + 1) * 0.35;
        const maj = i % 3 === 0;
        ctx.strokeStyle = maj
          ? `rgba(245, 184, 46, ${dAlpha.toFixed(2)})`
          : `rgba(138, 101, 20, ${dAlpha.toFixed(2)})`;
        ctx.lineWidth = maj ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + cA * pedRx * (maj ? 0.88 : 0.94), pedY + sA * pedRy * (maj ? 0.88 : 0.94));
        ctx.lineTo(cx + cA * pedRx * (maj ? 1.05 : 1.0), pedY + sA * pedRy * (maj ? 1.05 : 1.0));
        ctx.stroke();

        if (i % 9 === 0) {
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(242, 234, 214, ${(dAlpha * 0.9).toFixed(2)})`;
          ctx.fillText(
            `${(i * 10) % 360}°`,
            cx + cA * pedRx * 1.14 - 12,
            pedY + sA * pedRy * 1.18 + 3,
          );
        }
      }

      ctx.strokeStyle = 'rgba(245, 184, 46, 0.42)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, pedY, pedRx, pedRy, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Ambient Streaming Braille & Bayer Embers
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.x += p.vx;
        p.y += p.vy + Math.sin(t * 2 + p.phase) * 0.2;
        if (p.x > CW - 16) {
          p.x = 40 + Math.random() * 140;
          p.y = 40 + Math.random() * (CH - 130);
        }
        const a = 0.22 + 0.25 * Math.sin(t * 3.5 + p.phase);
        ctx.fillStyle =
          p.tone === 2
            ? `rgba(242, 234, 214, ${a.toFixed(2)})`
            : p.tone === 1
            ? `rgba(245, 184, 46, ${a.toFixed(2)})`
            : `rgba(138, 101, 20, ${a.toFixed(2)})`;
        if (fx === 'ascii' || fx === 'braille') {
          ctx.fillText(p.glyph, p.x, p.y);
        } else {
          ctx.fillRect(p.x, p.y, 2.6, 2.6);
        }
      }

      // 4. Monumental 3D ZOTHOS Shield & Extruded Z Point-Cloud / Voxel Stage
      const bobY = Math.sin(t * 2.8) * 4;
      const pulseScale = st.loop === 'pulse' ? 1 + Math.sin(t * 5) * 0.06 : 1;
      const voxSpacing = 4.7 * pulseScale;
      const rotY = st.loop === 'spin' ? yaw : Math.sin(t * 1.2) * 0.42 + st.yaw + (st.mouseX - 0.5) * 0.65;
      const cY = Math.cos(rotY),
        sY = Math.sin(rotY);

      ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
      for (let i = 0; i < shieldVoxels.length; i++) {
        const v = shieldVoxels[i];
        const bx = v.gx * voxSpacing;
        const by = v.gy * voxSpacing;
        const bz = v.z + Math.sin(t * 3 + v.gx * 0.2) * 3.5;

        // 3D rotation around Y axis
        const rx = bx * cY - bz * sY;
        const rz = bx * sY + bz * cY;
        const fov = 420 / (420 + rz);

        // Helical vortex swirl during mode switch / click
        const swirlAngle = vortexAmp * Math.PI * (0.8 + v.seed) * (i % 2 === 0 ? 1 : -1);
        const vx =
          cx +
          rx * fov +
          Math.sin(swirlAngle) * (35 + v.seed * 65) * vortexAmp +
          (v.nx > 0.35 ? Math.sin(t * 3.5 + v.gy * 0.3) * (v.nx - 0.35) * 26 : 0);
        const vy = cy - 18 + bobY + by * fov + Math.cos(swirlAngle) * 18 * vortexAmp;

        const isLit = v.isEdge || rz < -8;
        const color = isLit
          ? '#FFF3C4'
          : v.tone === 2
          ? '#F2EAD6'
          : v.tone === 1
          ? '#F5B82E'
          : '#8A6514';

        if (fx === 'braille') {
          ctx.fillStyle = color;
          ctx.fillText(v.brailleChar, vx - 3, vy + 3);
        } else if (fx === 'ascii') {
          ctx.fillStyle = color;
          ctx.fillText(v.asciiChar, vx - 3, vy + 3);
        } else if (fx === 'dither') {
          if (!v.isEdge && v.bayer > 0.72) continue;
          ctx.fillStyle = color;
          const sz = (v.isZ ? 4.2 : 3.2) * fov;
          ctx.fillRect(vx - sz * 0.5, vy - sz * 0.5, sz, sz);
        } else if (fx === 'lattice') {
          ctx.strokeStyle = color;
          ctx.lineWidth = v.isZ ? 1.1 : 0.7;
          const sz = (v.isZ ? 4.4 : 3.4) * fov;
          ctx.strokeRect(vx - sz * 0.5, vy - sz * 0.5, sz, sz);
        } else {
          // HYBRID: Crisp bevel blocks on left/center + dissolving U+2800 Braille vortex on right
          ctx.fillStyle = color;
          if (v.nx > 0.28 && (i + ((t * 6) | 0)) % 3 === 0) {
            ctx.fillText(v.brailleChar, vx - 2, vy + 3);
          } else {
            const sz = (v.isZ ? 4.3 : 3.3) * fov;
            ctx.fillRect(vx - sz * 0.5, vy - sz * 0.5, sz, sz);
          }
        }
      }

      // 5. High-Density Volumetric "ZOTHOS" Banner Floating Across Pedestal Front
      const wordScaleX = 6.2;
      const wordScaleY = 5.4;
      const wordStartX = cx - (WORD_W * wordScaleX) / 2;
      const wordStartY = pedY - 36;
      for (let gy = 0; gy < WORD_H; gy++) {
        for (let gx = 0; gx < WORD_W; gx++) {
          if (!WORD_GRID[gy][gx]) continue;
          const wx = wordStartX + gx * wordScaleX;
          const wy = wordStartY + gy * wordScaleY;
          const isTop = gy === 0 || !WORD_GRID[gy - 1]?.[gx];
          ctx.fillStyle = isTop ? '#FFF5CC' : '#F5B82E';
          if (fx === 'braille' || fx === 'ascii') {
            ctx.font = 'bold 7px "JetBrains Mono", monospace';
            ctx.fillText(fx === 'ascii' ? '#' : '⣿', wx, wy + 5);
          } else {
            ctx.fillRect(wx, wy, wordScaleX - 0.9, wordScaleY - 0.9);
          }
        }
      }

      // 6. Live Telemetry Pill at Bottom of Pedestal
      ctx.font = 'bold 11.5px "JetBrains Mono", ui-monospace, monospace';
      const degStr = String(Math.round(deg)).padStart(3, '0') + '°';
      const pill = `⣿ ${degStr} · ZOTHOS U+2800 LATTICE · FX:${fx.toUpperCase()} · DRAG TO SPIN`;
      const tw = ctx.measureText(pill).width + 24;
      const px = cx - tw / 2;
      const py = pedY + pedRy + 10;
      ctx.fillStyle = 'rgba(5, 6, 9, 0.92)';
      ctx.fillRect(px, py, tw, 24);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(px, py, tw, 24);
      ctx.fillStyle = '#F5E6AB';
      ctx.fillText(pill, px + 12, py + 16);

      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  const triggerMorph = () => {
    stateRef.current.morphStart = performance.now();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 560,
        mx: 'auto',
        minWidth: 0,
      }}
    >
      <Box
        onPointerDown={(e) => {
          stateRef.current.dragging = true;
          stateRef.current.dragStartX = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          stateRef.current.mouseX = (e.clientX - r.left) / Math.max(1, r.width);
          stateRef.current.mouseY = (e.clientY - r.top) / Math.max(1, r.height);
          if (stateRef.current.dragging) {
            const dx = e.clientX - stateRef.current.dragStartX;
            stateRef.current.dragStartX = e.clientX;
            stateRef.current.yaw += dx * 0.012;
          }
        }}
        onPointerUp={() => {
          stateRef.current.dragging = false;
          triggerMorph();
        }}
        sx={{
          width: '100%',
          aspectRatio: '560 / 460',
          borderRadius: 3.5,
          bgcolor: '#050609',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.8), 0 0 32px rgba(212, 175, 55, 0.14)',
          overflow: 'hidden',
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
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

      {/* Interactive Shader & Loop Controls */}
      <Box
        sx={{
          mt: 1.2,
          p: 0.8,
          width: '100%',
          borderRadius: 2,
          bgcolor: '#050609',
          border: '1px solid rgba(212, 175, 55, 0.32)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 0.6,
        }}
      >
        {[
          { id: 'hybrid', label: '⣿ hybrid' },
          { id: 'braille', label: '⠿ braille' },
          { id: 'dither', label: '▦ dither' },
          { id: 'ascii', label: '# ascii' },
          { id: 'lattice', label: '⬡ 3d lattice' },
        ].map((m) => {
          const active = activeFx === m.id;
          return (
            <Box
              key={m.id}
              component="button"
              type="button"
              onClick={() => {
                setActiveFx(m.id);
                triggerMorph();
              }}
              sx={{
                px: 1.1,
                py: 0.45,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: '0.7rem',
                fontWeight: active ? 800 : 600,
                bgcolor: active ? '#D4AF37' : '#0B0D13',
                color: active ? '#000000' : '#E2E8F0',
                border: '1px solid',
                borderColor: active ? '#D4AF37' : 'rgba(212, 175, 55, 0.25)',
                borderRadius: 1,
                cursor: 'pointer',
              }}
            >
              {m.label}
            </Box>
          );
        })}
        {[
          { id: 'orbit', label: '∞ orbit' },
          { id: 'spin', label: '↻ 360° spin' },
          { id: 'pulse', label: '⚡ pulse' },
        ].map((l) => {
          const active = activeLoop === l.id;
          return (
            <Box
              key={l.id}
              component="button"
              type="button"
              onClick={() => {
                setActiveLoop(l.id);
                triggerMorph();
              }}
              sx={{
                px: 1.1,
                py: 0.45,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontSize: '0.7rem',
                fontWeight: active ? 800 : 600,
                bgcolor: active ? 'rgba(212, 175, 55, 0.22)' : '#0B0D13',
                color: active ? '#FFE57F' : '#94A3B8',
                border: '1px solid',
                borderColor: active ? '#D4AF37' : 'rgba(255, 255, 255, 0.12)',
                borderRadius: 1,
                cursor: 'pointer',
              }}
            >
              {l.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
