import React, { useEffect, useRef, useState } from 'react';

const BAYER_8X8 = [
  [ 0, 48, 12, 60,  3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [ 8, 56,  4, 52, 11, 59,  7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [ 2, 50, 14, 62,  1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58,  6, 54,  9, 57,  5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

const BRAILLE_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
];

const ASCII_RAMP = ' ·:;+xX$#▓█';
const SCRAMBLE_GLYPHS = '⣿⣷⣯⣟⡿⢿⣻⣽░▒▓█╬═║⟡⟠∆∇◊01';

/**
 * Character-scramble decode hook using Braille + Bayer Dither glyphs.
 */
export function useGlyphScramble(targetText, durationMs = 460, active = true) {
  const [display, setDisplay] = useState(targetText || '');

  useEffect(() => {
    if (!active || !targetText) {
      setDisplay(targetText || '');
      return undefined;
    }
    let raf;
    const start = performance.now();
    const chars = Array.from(targetText);

    const step = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      const out = chars.map((ch, idx) => {
        if (ch === ' ' || ch === '·') return ch;
        const threshold = (idx / Math.max(1, chars.length)) * 0.68 + 0.32;
        if (p >= threshold) return ch;
        const gIdx = Math.floor((now * 0.06 + idx * 7) % SCRAMBLE_GLYPHS.length);
        return SCRAMBLE_GLYPHS[gIdx];
      }).join('');
      setDisplay(out);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplay(targetText);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetText, durationMs, active]);

  return display;
}

/**
 * Evaluate procedural 3D SDF luminance [0..1] at normalized coordinates nx, ny in [-1..1].
 */
export function sampleProceduralSDF(shape, nx, ny, t) {
  const r = Math.hypot(nx, ny);
  const a = Math.atan2(ny, nx);

  if (shape === 'shield') {
    // ZothOS Kernel Shield & Tor Onion Rings
    const hexA = Math.cos(a * 6 + t * 0.8) * 0.04;
    const shieldRing = Math.exp(-Math.pow((r - (0.58 + hexA)) * 15, 2));
    const innerTorus = Math.exp(-Math.pow((r - 0.34) * 18, 2)) * (0.65 + 0.35 * Math.sin(a * 8 - t * 2.4));
    const core = Math.exp(-r * 5.2) * (0.5 + 0.5 * Math.cos(t * 3));
    const scan = Math.max(0, Math.cos((ny - ((t * 0.45) % 2 - 1)) * 18)) * (r < 0.65 ? 0.35 : 0);
    return Math.min(1, shieldRing * 0.9 + innerTorus * 0.75 + core * 0.8 + scan);
  }

  if (shape === 'dag') {
    // Vaelor L1 PoUW Directed Acyclic Graph Topology
    let v = 0;
    for (let i = 0; i < 7; i++) {
      const na = (i / 7) * Math.PI * 2 + t * 0.45;
      const nr = 0.48 + 0.12 * Math.sin(t * 1.3 + i * 1.7);
      const px = Math.cos(na) * nr;
      const py = Math.sin(na) * nr;
      const d = Math.hypot(nx - px, ny - py);
      v += Math.exp(-d * 14) * 0.85;
      // DAG edge toward center and next node
      const proj = Math.abs(nx * Math.sin(na) - ny * Math.cos(na));
      if (r < nr && proj < 0.045) v += 0.32 * (0.5 + 0.5 * Math.sin(r * 24 - t * 6));
    }
    const hub = Math.exp(-r * 8) * 0.85;
    const wave = Math.exp(-Math.pow((r - ((t * 0.38) % 0.85)) * 16, 2)) * 0.55;
    return Math.min(1, v + hub + wave);
  }

  if (shape === 'synapse') {
    // Neuro-Memory STDP Spiking Neural Lattice
    const arms = Math.sin(a * 5 + r * 8 - t * 2.1) * 0.5 + 0.5;
    const pulse = Math.sin(r * 18 - t * 5.2) * 0.5 + 0.5;
    const soma = Math.exp(-r * 4.5);
    const dendrites = Math.exp(-Math.abs(r - 0.46) * 7) * Math.pow(arms, 2.2) * pulse;
    const outerRing = Math.exp(-Math.pow((r - 0.72) * 18, 2)) * 0.6;
    return Math.min(1, soma * 0.9 + dendrites * 0.95 + outerRing);
  }

  if (shape === 'hex') {
    // HexStrike Offensive Red-Team Radar & Hex Grid
    const sweep = ((a - t * 2.2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const radar = Math.exp(-sweep * 1.1) * (r < 0.76 ? 0.75 : 0);
    const rings = (Math.exp(-Math.pow((r - 0.28) * 22, 2)) + Math.exp(-Math.pow((r - 0.52) * 22, 2)) + Math.exp(-Math.pow((r - 0.74) * 22, 2))) * 0.65;
    const cross = (Math.abs(nx) < 0.02 || Math.abs(ny) < 0.02) && r < 0.78 ? 0.45 : 0;
    return Math.min(1, radar + rings + cross);
  }

  if (shape === 'quorum') {
    // Tri-Model Byzantine Consensus Triangulation
    let field = 0;
    for (let k = 0; k < 3; k++) {
      const ka = (k / 3) * Math.PI * 2 + t * 0.65;
      const cx = Math.cos(ka) * 0.36;
      const cy = Math.sin(ka) * 0.36;
      const d = Math.hypot(nx - cx, ny - cy);
      field += Math.exp(-d * 7.5) * 0.72;
      field += Math.exp(-Math.pow((d - 0.28) * 18, 2)) * 0.55;
    }
    return Math.min(1, field);
  }

  if (shape === 'grid') {
    // Sovereign Arsenal Isometric Voxel Wave
    const gx = Math.abs(((nx * 6 + t * 0.5) % 1 + 1) % 1 - 0.5);
    const gy = Math.abs(((ny * 6 - t * 0.35) % 1 + 1) % 1 - 0.5);
    const wire = (gx < 0.08 || gy < 0.08) ? 0.48 : 0;
    const ripple = (Math.sin(r * 14 - t * 3.8) * 0.5 + 0.5) * Math.exp(-r * 1.4);
    return Math.min(1, wire * Math.exp(-r * 0.9) + ripple * 0.85);
  }

  if (shape === 'tesseract') {
    // 4D Hypercube (Tesseract) projection in 2x4 Sub-Pixel Braille
    const c1 = Math.cos(t * 0.65);
    const s1 = Math.sin(t * 0.65);
    const rx = nx * c1 - ny * s1;
    const ry = nx * s1 + ny * c1;
    const outerBox = Math.max(Math.abs(rx), Math.abs(ry));
    const innerScale = 0.32 + 0.08 * Math.sin(t * 1.4);
    const innerBox = Math.max(Math.abs(rx), Math.abs(ry));
    const outerShell = Math.exp(-Math.pow((outerBox - 0.62) * 20, 2));
    const innerShell = Math.exp(-Math.pow((innerBox - innerScale) * 22, 2));
    const diag = Math.exp(-Math.abs(Math.abs(rx) - Math.abs(ry)) * 26) * (outerBox < 0.64 && outerBox > innerScale * 0.9 ? 0.85 : 0);
    return Math.min(1, outerShell * 0.9 + innerShell * 0.95 + diag);
  }

  if (shape === 'trefoil') {
    // Parametric Trefoil Knot Ribbon with Bayer 8x8 Dither
    let minD = 99;
    const steps = 28;
    for (let i = 0; i < steps; i++) {
      const u = (i / steps) * Math.PI * 2 + t * 0.35;
      const kx = (Math.sin(u) + 2 * Math.sin(2 * u)) * 0.21;
      const ky = (Math.cos(u) - 2 * Math.cos(2 * u)) * 0.21;
      const d = Math.hypot(nx - kx, ny - ky);
      if (d < minD) minD = d;
    }
    const ribbon = Math.exp(-Math.pow(minD * 9.5, 2));
    const halo = Math.exp(-minD * 3.8) * 0.35;
    return Math.min(1, ribbon * 0.95 + halo);
  }

  if (shape === 'metaballs') {
    // Organic Smooth-Minimum Metaball Field (Shader / Media / Likeness)
    let potential = 0;
    for (let i = 0; i < 4; i++) {
      const ang = t * (0.7 + i * 0.25) + i * 1.57;
      const rad = 0.32 * Math.sin(t * 0.9 + i * 2.1);
      const bx = Math.cos(ang) * rad;
      const by = Math.sin(ang * 1.3) * rad;
      const d2 = (nx - bx) * (nx - bx) + (ny - by) * (ny - by) + 0.018;
      potential += 0.042 / d2;
    }
    const isoRing = Math.exp(-Math.pow((potential - 1.0) * 2.5, 2));
    return Math.min(1, potential * 0.45 + isoRing * 0.75);
  }

  if (shape === 'event_horizon') {
    // Relativistic Accretion Disk & Gravitational Lensing
    const tiltY = ny * 2.4 + nx * 0.45 * Math.sin(t * 0.5);
    const diskR = Math.hypot(nx, tiltY);
    const doppler = 0.65 + 0.35 * Math.cos(a - t * 2.5);
    const accretion = Math.exp(-Math.pow((diskR - 0.52) * 11, 2)) * doppler;
    const photonRing = Math.exp(-Math.pow((r - 0.31) * 26, 2)) * 1.1;
    const shadow = r < 0.26 ? 0.05 : 1.0;
    return Math.min(1, (accretion + photonRing) * shadow);
  }

  if (shape === 'lissajous') {
    // Harmonic Phase Oscilloscope (Audio / Stego / Voice / Synth)
    let minD = 99;
    const steps = 36;
    for (let i = 0; i < steps; i++) {
      const u = (i / steps) * Math.PI * 2;
      const lx = Math.sin(3 * u + t * 1.6) * 0.68;
      const ly = Math.sin(4 * u + t * 0.9) * 0.62;
      const d = Math.hypot(nx - lx, ny - ly);
      if (d < minD) minD = d;
    }
    const trace = Math.exp(-minD * 15);
    const carrier = Math.abs(Math.sin(nx * 14 + t * 4) * Math.cos(ny * 8)) * 0.22 * Math.exp(-r * 1.2);
    return Math.min(1, trace + carrier);
  }

  if (shape === 'dungeon_fov') {
    // Roguelike Shadowcast FOV & Cellular Grid (OSINT / Recon / Sentinel)
    const cellX = Math.floor((nx + 1) * 6);
    const cellY = Math.floor((ny + 1) * 6);
    const hash = Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453;
    const pillar = (hash - Math.floor(hash)) > 0.78 && r > 0.22 ? 0.85 : 0;
    const cone = Math.cos(a - t * 1.9);
    const fov = Math.pow(Math.max(0, cone), 3) * Math.exp(-r * 1.1);
    const gridLine = (Math.abs((nx * 6) % 1) < 0.08 || Math.abs((ny * 6) % 1) < 0.08) ? 0.28 : 0;
    return Math.min(1, pillar * 0.75 + fov * 0.9 + gridLine);
  }

  if (shape === 'globe_arcs') {
    // Orthographic Globe with Great-Circle Telemetry Arcs
    if (r > 0.74) {
      const orbit = Math.exp(-Math.pow((r - 0.84) * 22, 2)) * (0.5 + 0.5 * Math.sin(a * 6 - t * 3));
      return Math.min(1, orbit);
    }
    const z = Math.sqrt(Math.max(0, 0.74 * 0.74 - r * r));
    const lon = Math.atan2(nx, z) + t * 0.65;
    const lat = Math.asin(Math.max(-1, Math.min(1, ny / 0.74)));
    const meridian = Math.exp(-Math.pow(Math.sin(lon * 6), 2) * 18);
    const parallel = Math.exp(-Math.pow(Math.sin(lat * 5), 2) * 18);
    const limb = Math.pow(1 - z / 0.74, 1.8) * 0.75;
    return Math.min(1, (meridian + parallel) * 0.55 + limb);
  }

  // Default 'astrolabe': Sacred Orbital Armillary Sphere
  const e1 = Math.hypot(nx, ny * 1.65);
  const e2 = Math.hypot(nx * 1.55, ny);
  const rotX = nx * Math.cos(t * 0.7) - ny * Math.sin(t * 0.7);
  const rotY = nx * Math.sin(t * 0.7) + ny * Math.cos(t * 0.7);
  const e3 = Math.hypot(rotX, rotY * 1.8);
  const ring1 = Math.exp(-Math.pow((e1 - 0.58) * 18, 2));
  const ring2 = Math.exp(-Math.pow((e2 - 0.58) * 18, 2));
  const ring3 = Math.exp(-Math.pow((e3 - 0.44) * 18, 2));
  const core = Math.exp(-r * 6.5) * (0.65 + 0.35 * Math.sin(t * 4));
  return Math.min(1, (ring1 + ring2 + ring3) * 0.75 + core);
}

export const SHAPE_DESCRIPTORS = {
  shield: { name: 'ZothOS Tor Onion & Kernel Ring', formula: 'SDF: exp(-(r-0.58-0.04cos(6θ))²·15²) + Torus(0.34)', badge: '🛡️ TOR+SQUASHFS' },
  dag: { name: 'Vaelor PoUW Directed Acyclic Graph', formula: 'SDF: ∑ exp(-‖p - v_i(t)‖·14) + EdgeProj(θ_i)', badge: '⛓️ DAG-QUORUM' },
  synapse: { name: 'STDP Spiking Neural Engram Lattice', formula: 'SDF: exp(-r·4.5) + exp(-|r-0.46|·7)·sin²(5θ-2.1t)', badge: '🧠 STDP-ENGRAM' },
  hex: { name: 'HexStrike Perimeter Radar & Sweep', formula: 'SDF: exp(-((θ-2.2t) mod 2π)) + ∑ Ring(r_k)', badge: '🎯 HEX-RADAR' },
  quorum: { name: 'Tri-Model Byzantine Consensus Ring', formula: 'SDF: ∑_{k=1..3} exp(-‖p - c_k(t)‖·7.5)', badge: '⚖️ BFT-3F+1' },
  grid: { name: 'Isometric Voxel Wave & AST Matrix', formula: 'SDF: Wire(p mod 1/6) + sin(14r-3.8t)·exp(-1.4r)', badge: '▦ VOXEL-AST' },
  tesseract: { name: '4D Hypercube (Tesseract) XW/YZ Projection', formula: 'SDF: max(|R_θ p|) ∈ {0.62, 0.32} + Diag(XW)', badge: '⬡ 4D-TESSERACT' },
  trefoil: { name: 'Parametric Trefoil Knot Ribbon', formula: 'SDF: min_u ‖p - (sin u+2sin 2u, cos u-2cos 2u)‖', badge: '🪢 TREFOIL-KNOT' },
  metaballs: { name: 'Smooth-Min Liquid Metaball Field', formula: 'SDF: ∑ 0.042 / (‖p - b_i(t)‖² + 0.018) = 1', badge: '💧 METABALL-SDF' },
  event_horizon: { name: 'Relativistic Black Hole Accretion Disk', formula: 'SDF: Doppler(θ)·exp(-(r_tilt-0.52)²·11²) + Photon(0.31)', badge: '🕳️ EVENT-HORIZON' },
  lissajous: { name: 'Harmonic Phase Oscilloscope (3:4)', formula: 'SDF: min_u ‖p - (sin(3u+1.6t), sin(4u+0.9t))‖', badge: '〰️ LISSAJOUS-DSP' },
  dungeon_fov: { name: 'Recursive Shadowcast FOV & Cellular Grid', formula: 'SDF: HashCell(⌊6p⌋) + cos³(θ-1.9t)·exp(-1.1r)', badge: '🔦 SHADOWCAST-FOV' },
  globe_arcs: { name: 'Orthographic Globe & Great-Circle Arcs', formula: 'SDF: sin²(6·atan2(x,z)) + sin²(5·asin(y/R))', badge: '🌐 ORTHO-GLOBE' },
  astrolabe: { name: 'Sacred Orbital Armillary Sphere', formula: 'SDF: ∑_{k=1..3} exp(-(‖E_k R_t p‖ - r_k)²·18²)', badge: '🧭 ASTROLABE' },
};

/**
 * Deterministically maps any of the 72 Sovereign Arsenal tools to a tailored Uncommon Web
 * 2x4 Sub-Pixel Braille + Bayer 8x8 Dither procedural shape.
 */
export function resolveToolBrailleShape(tool) {
  if (!tool) return 'astrolabe';
  const id = (tool.id || '').toLowerCase();
  const cat = (tool.category || '').toLowerCase();

  // Exact tool overrides for bespoke Uncommon Web visual identity
  if (id.includes('zoth-os') || id.includes('zothos') || id.includes('usb-arsenal') || id.includes('privacy')) return 'shield';
  if (id.includes('nexus-3d') || id.includes('scene-foundry') || id.includes('voxel') || id.includes('mockup')) return 'tesseract';
  if (id.includes('sacred-geometry') || id.includes('knot') || id.includes('astrolabe')) return 'trefoil';
  if (id.includes('shader') || id.includes('datamosh') || id.includes('likeness') || id.includes('pixel-cast') || id.includes('ascii')) return 'metaballs';
  if (id.includes('audiocipher') || id.includes('voice') || id.includes('tts') || id.includes('music') || id.includes('synth')) return 'lissajous';
  if (id.includes('osint') || id.includes('shodan') || id.includes('scout') || id.includes('sentinel') || id.includes('crawler')) return 'dungeon_fov';
  if (id.includes('ghidra') || id.includes('yara') || id.includes('hexstrike') || id.includes('pentest') || id.includes('enclave')) return 'event_horizon';
  if (id.includes('vaelor') || id.includes('bounty') || id.includes('relay') || id.includes('bridge') || id.includes('mcp')) return 'dag';
  if (id.includes('memory') || id.includes('obsidian') || id.includes('brain') || id.includes('rag') || id.includes('wiki')) return 'synapse';
  if (id.includes('civilization') || id.includes('swarm') || id.includes('consensus') || id.includes('pantheon') || id.includes('bot')) return 'quorum';
  if (id.includes('shopify') || id.includes('etsy') || id.includes('producthunt') || id.includes('storefront') || id.includes('seo') || id.includes('aeo')) return 'globe_arcs';

  // Category fallbacks across all 14 shapes
  if (cat.includes('security') || cat.includes('recon') || cat.includes('opsec')) return 'hex';
  if (cat.includes('memory') || cat.includes('brain')) return 'synapse';
  if (cat.includes('swarm') || cat.includes('core')) return 'quorum';
  if (cat.includes('media') || cat.includes('3d')) return 'tesseract';
  if (cat.includes('commerce') || cat.includes('pod') || cat.includes('growth') || cat.includes('seo')) return 'globe_arcs';
  if (cat.includes('web') || cat.includes('developer')) return 'grid';
  if (cat.includes('ai') || cat.includes('knowledge')) return 'trefoil';

  // Deterministic hash across remaining tools so every tool is visually distinct
  const pool = ['tesseract', 'trefoil', 'metaballs', 'event_horizon', 'lissajous', 'dungeon_fov', 'globe_arcs', 'astrolabe', 'dag', 'synapse'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

/**
 * Generates an array of strings representing a 2x4 Sub-Pixel Unicode Braille + Bayer 8x8 Dither matrix.
 */
export function renderBrailleDitherLines({ cols = 46, rows = 14, shape = 'astrolabe', t = 0, mode = 'hybrid' }) {
  const lines = [];
  const subW = cols * 2;
  const subH = rows * 4;

  for (let cy = 0; cy < rows; cy++) {
    let rowStr = '';
    for (let cx = 0; cx < cols; cx++) {
      let mask = 0;
      let lumSum = 0;

      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const sx = cx * 2 + dx;
          const sy = cy * 4 + dy;
          const nx = (sx / subW) * 2 - 1;
          const ny = ((sy / subH) * 2 - 1) * (rows * 2 / cols);
          const lum = sampleProceduralSDF(shape, nx, ny, t);
          lumSum += lum;
          const threshold = (BAYER_8X8[sy & 7][sx & 7] + 0.5) / 64.0;
          if (lum > threshold) {
            mask |= BRAILLE_BITS[dy][dx];
          }
        }
      }

      const avgLum = lumSum / 8;
      if (mode === 'ascii') {
        const idx = Math.min(ASCII_RAMP.length - 1, Math.floor(avgLum * ASCII_RAMP.length));
        rowStr += ASCII_RAMP[idx];
      } else if (mode === 'braille') {
        rowStr += String.fromCharCode(0x2800 | mask);
      } else {
        // Hybrid: high-intensity core uses solid ASCII dither blocks, gradients use 2x4 sub-pixel Braille
        if (avgLum > 0.78) {
          const idx = Math.min(ASCII_RAMP.length - 1, Math.floor(avgLum * ASCII_RAMP.length));
          rowStr += ASCII_RAMP[idx];
        } else {
          rowStr += String.fromCharCode(0x2800 | mask);
        }
      }
    }
    lines.push(rowStr);
  }
  return lines;
}

/**
 * Live 60fps ASCII + Unicode U+2800 Braille + Bayer 8x8 Dither Stage for Route Intros.
 */
export function AsciiBrailleIntroStage({ intro, dark, handing, fullVideoMode = false }) {
  const canvasRef = useRef(null);
  const shape = intro?.brailleShape || 'astrolabe';
  const accent = intro?.accent || '#D4AF37';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let raf;
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

    let start = performance.now();

    const draw = (now) => {
      const t = (now - start) * 0.0014;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cols = width < 640 ? 34 : 54;
      const rows = width < 640 ? 14 : 20;
      const lines = renderBrailleDitherLines({ cols, rows, shape, t, mode: 'hybrid' });

      const fontSize = width < 640 ? 11 : 13.5;
      const lineHeight = fontSize * 1.18;
      ctx.font = `600 ${fontSize}px "JetBrains Mono", "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const centerY = fullVideoMode ? height * 0.5 : height * 0.52;
      const totalH = rows * lineHeight;
      const startY = centerY - totalH * 0.5;

      // Ordered Bayer 8x8 corner micro-grids
      ctx.fillStyle = dark ? `${accent}26` : 'rgba(138, 101, 8, 0.16)';
      lines.forEach((line, rIdx) => {
        const distFromMid = Math.abs(rIdx - rows / 2) / (rows / 2);
        const alpha = fullVideoMode
          ? (dark ? 0.24 : 0.22) * (1 - distFromMid * 0.45)
          : (dark ? 0.46 : 0.36) * (1 - distFromMid * 0.35);
        ctx.globalAlpha = Math.max(0.05, alpha);
        ctx.fillStyle = dark ? accent : '#8A6508';
        ctx.fillText(line, width * 0.5, startY + rIdx * lineHeight);
      });

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [shape, accent, dark, fullVideoMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: handing ? 0 : 1,
        transition: 'opacity 0.28s ease',
        mixBlendMode: dark ? 'screen' : 'multiply',
      }}
    />
  );
}
