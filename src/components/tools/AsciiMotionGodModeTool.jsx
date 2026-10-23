import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Slider,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';
import { useReality } from '../../context/RealityContext';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

const GLYPH_RAMPS = {
  ascii: {
    id: 'ascii',
    label: 'Sovereign ASCII',
    chars: ' ·,:;+*?%S#@',
  },
  braille: {
    id: 'braille',
    label: 'Unicode Braille',
    chars: ' ⠁⠃⠇⠏⠟⠿⣿',
  },
  blocks: {
    id: 'blocks',
    label: 'Block Density',
    chars: ' ·░▒▓█',
  },
  katakana: {
    id: 'katakana',
    label: 'Cyber Matrix',
    chars: ' ·:+=*ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ',
  },
  bayer4: {
    id: 'bayer4',
    label: 'Bayer 4×4 Dither',
    chars: ' ·░▒▓█',
    isDither: true,
  },
  newsprint: {
    id: 'newsprint',
    label: 'Halftone Newsprint',
    chars: ' ·•●⬤',
  },
};

const SHADER_PRESETS = {
  liquidChrome: {
    id: 'liquidChrome',
    name: 'Liquid Metal Chrome (Paper Shaders)',
    subtitle: 'SDF surface normals, specular reflections & pointer illumination',
    accent: '#F1F5F9',
  },
  torus4d: {
    id: 'torus4d',
    name: '4D Rotating Torus Knot',
    subtitle: 'Harmonic topological surface with dual-axis phase precession',
    accent: '#D4AF37',
  },
  merkaba: {
    id: 'merkaba',
    name: 'Sacred Merkaba Hypercube',
    subtitle: 'Counter-rotating star tetrahedron & golden ratio interference rings',
    accent: '#C084FC',
  },
  datamosh: {
    id: 'datamosh',
    name: 'CRT Datamosh Wavefront',
    subtitle: 'I-frame displacement vectors with scanline quantization',
    accent: '#EC4899',
  },
  quorum: {
    id: 'quorum',
    name: 'Byzantine Quorum Vortex',
    subtitle: '4-node consensus spiral with cryptographic phase locking',
    accent: '#38BDF8',
  },
  radar: {
    id: 'radar',
    name: 'Perimeter Radar Matrix',
    subtitle: '360° polar sweep with deterministic harmonic target pings',
    accent: '#34D399',
  },
  sigil: {
    id: 'sigil',
    name: 'ZothOS Kernel Sigil',
    subtitle: 'Standing wave lattice & sovereign enclave boundary field',
    accent: '#F59E0B',
  },
  cyberBust: {
    id: 'cyberBust',
    name: 'ASCII Magic // Cyber Bust',
    subtitle: 'Relightable 3D SDF sovereign bust with Sobel directional edge contours',
    accent: '#38BDF8',
  },
};

const SLUG_DEFAULTS = {
  'zoth-ascii-magic': { preset: 'cyberBust', ramp: 'ascii', edge: true },
  'datamosh-glitch-studio': { preset: 'datamosh', ramp: 'blocks', edge: false },
  'nexus-3d-scene-studio': { preset: 'torus4d', ramp: 'ascii', edge: true },
  'ufo-sacred-geometry': { preset: 'merkaba', ramp: 'braille', edge: false },
  'cyber-turtle-studio': { preset: 'sigil', ramp: 'ascii', edge: true },
  'og-canvas-forge': { preset: 'quorum', ramp: 'braille', edge: false },
};

function evaluateField(nx, ny, t, preset, warp, freq, lightPos) {
  const x = nx * freq;
  const y = ny * freq;
  const r = Math.hypot(x, y);
  const a = Math.atan2(y, x);

  let base = 0.5;

  if (preset === 'liquidChrome') {
    const dx = nx - lightPos.x;
    const dy = ny - lightPos.y;
    const dLight = Math.hypot(dx, dy);
    const ripple = Math.sin(dLight * 14.0 * warp - t * 3.5) * Math.exp(-dLight * 1.8);
    const sigilR = Math.hypot(nx, ny);
    const sigilA = Math.atan2(ny, nx);
    const crest = Math.exp(-Math.abs(sigilR - 0.62) * 8.0) * (0.8 + 0.3 * Math.cos(sigilA * 6));
    const normX = nx + ripple * (dx / Math.max(0.1, dLight)) + Math.cos(sigilA * 3) * 0.15;
    const normY = ny + ripple * (dy / Math.max(0.1, dLight)) + Math.sin(sigilA * 3) * 0.15;
    const spec = Math.pow(Math.max(0, normX * Math.cos(t * 0.8) + normY * Math.sin(t * 0.8)), 5.0);
    const rim = Math.pow(1.0 - Math.min(1.0, Math.hypot(normX, normY)), 2.2);
    base = Math.max(0, Math.min(1, crest * 0.45 + spec * 0.65 + rim * 0.35 + 0.08));
    return base;
  }

  if (preset === 'cyberBust') {
    // Relightable 3D Sphere / Bust SDF with visor & halo ring
    const headR = 0.68;
    const dHead = Math.hypot(nx, ny * 0.92 + 0.05);
    const halo = Math.exp(-Math.abs(r - 0.88) * 14) * (0.65 + 0.35 * Math.sin(a * 8 - t * 3));
    if (dHead < headR) {
      const nz = Math.sqrt(Math.max(0.001, headR * headR - dHead * dHead)) / headR;
      const lx = lightPos.x - nx;
      const ly = lightPos.y - ny;
      const lz = 0.85;
      const lLen = Math.hypot(lx, ly, lz);
      const ndotl = Math.max(0.08, (nx * (lx / lLen) + ny * (ly / lLen) + nz * (lz / lLen)));
      // Visor band
      const visor = Math.abs(ny + 0.08 - 0.04 * Math.cos(nx * 3)) < 0.11 && Math.abs(nx) < 0.48
        ? 0.35 + 0.55 * Math.sin(nx * 14 + t * 5)
        : 0;
      base = Math.min(1, ndotl * 0.85 + visor * 0.45);
    } else {
      const gridBg = Math.max(0, Math.sin(nx * 18) * Math.cos((ny + t * 0.25) * 18)) * 0.15;
      base = Math.min(1, halo + gridBg);
    }
    return base;
  }

  if (preset === 'torus4d') {
    const ring1 = Math.cos((r - 0.52 - 0.14 * Math.sin(3 * a + t * 2.1)) * 13);
    const twist = Math.sin(4 * a - t * 2.6 + r * 6 * warp);
    const core = Math.exp(-r * 2.2) * Math.cos(r * 16 - t * 4);
    base = Math.max(0, Math.min(1, ring1 * 0.5 + twist * 0.35 + core * 0.45 + 0.55));
  } else if (preset === 'merkaba') {
    const tri1 = Math.cos(3 * (a + t * 0.9)) * Math.exp(-Math.abs(r - 0.55) * 4.5);
    const tri2 = Math.cos(3 * (a - t * 0.9 + Math.PI / 3)) * Math.exp(-Math.abs(r - 0.55) * 4.5);
    const lattice =
      Math.sin((x * Math.cos(t * 0.5) - y * Math.sin(t * 0.5)) * 10 * warp) *
      Math.cos((x * Math.sin(t * 0.5) + y * Math.cos(t * 0.5)) * 10 * warp);
    const center = Math.exp(-r * 3.8);
    base = Math.max(0, Math.min(1, 0.48 + tri1 * 0.45 + tri2 * 0.45 + lattice * 0.25 + center * 0.4));
  } else if (preset === 'datamosh') {
    const glitchShift = Math.sin(Math.floor((ny + 1) * 12) * 3.7 + Math.floor(t * 6)) * 0.35 * warp;
    const gx = x + glitchShift;
    const band = Math.sin(gx * 8 - t * 5) * Math.cos(y * 14 + Math.sin(t * 3) * 2);
    const macroblock = ((Math.floor((gx + 2) * 4) ^ Math.floor((y + 2) * 4)) % 5) / 5;
    base = Math.max(0, Math.min(1, 0.45 + band * 0.45 + (macroblock - 0.5) * 0.35 * warp));
  } else if (preset === 'quorum') {
    const spiral = Math.sin(r * 15 - t * 4.2 + a * 4);
    const nodes = Math.cos(a * 4 - t * 1.8) * Math.exp(-Math.abs(r - 0.58) * 5);
    const pulse = Math.exp(-r * 2.5) * (0.5 + 0.5 * Math.sin(t * 5));
    base = Math.max(0, Math.min(1, 0.48 + spiral * 0.32 * warp + nodes * 0.42 + pulse * 0.3));
  } else if (preset === 'radar') {
    const sweepAngle = (t * 2.2) % (Math.PI * 2);
    const diff = (((a - sweepAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const beam = Math.exp(-diff * 3.2) * Math.exp(-r * 0.9);
    const rings = Math.pow(Math.max(0, Math.cos(r * 16)), 6) * 0.55;
    const cross = Math.abs(nx) < 0.035 || Math.abs(ny) < 0.035 ? 0.45 : 0;
    base = Math.max(0, Math.min(1, beam * 0.85 + rings + cross));
  } else {
    const hexWave = Math.cos(6 * a + Math.sin(r * 10 - t * 3) * warp * 2);
    const seal = Math.exp(-Math.abs(r - 0.62) * 6.5) + Math.exp(-Math.abs(r - 0.32) * 7.5);
    const standing = Math.cos(r * 18 - t * 3.8) * 0.35;
    base = Math.max(0, Math.min(1, 0.25 + seal * 0.55 + hexWave * 0.25 + standing));
  }

  // Apply interactive 2D point-light boost
  const dLight = Math.hypot(nx - lightPos.x, ny - lightPos.y);
  const lightBoost = Math.exp(-dLight * 1.45) * 0.38;
  return Math.max(0, Math.min(1, base * 0.82 + lightBoost));
}

export default function AsciiMotionGodModeTool({ tool }) {
  const { activeTheme } = useReality();
  const defaultCfg = SLUG_DEFAULTS[tool?.id] || SLUG_DEFAULTS[tool?.slug] || { preset: 'torus4d', ramp: 'ascii', edge: true };
  const [preset, setPreset] = useState(defaultCfg.preset);
  const [rampKey, setRampKey] = useState(defaultCfg.ramp);
  const [cols, setCols] = useState(72);
  const [speed, setSpeed] = useState(1.0);
  const [warp, setWarp] = useState(1.15);
  const [freq, setFreq] = useState(1.25);
  const [playing, setPlaying] = useState(true);
  const [sobelEdges, setSobelEdges] = useState(Boolean(defaultCfg.edge));
  const [crtScanlines, setCrtScanlines] = useState(true);
  const [lightPos, setLightPos] = useState({ x: -0.35, y: -0.35 });
  const [uploadedGrid, setUploadedGrid] = useState(null);
  const [uploadedName, setUploadedName] = useState('');
  const [asciiSnapshot, setAsciiSnapshot] = useState('');
  const [ansiSnapshot, setAnsiSnapshot] = useState('');
  const [copiedMode, setCopiedMode] = useState(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const timeRef = useRef(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    const cfg = SLUG_DEFAULTS[tool?.id] || SLUG_DEFAULTS[tool?.slug];
    if (cfg) {
      setPreset(cfg.preset);
      setRampKey(cfg.ramp);
      setSobelEdges(Boolean(cfg.edge));
    }
  }, [tool?.id, tool?.slug]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const off = document.createElement('canvas');
        const w = 120;
        const h = 68;
        off.width = w;
        off.height = h;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0, w, h);
        const { data } = octx.getImageData(0, 0, w, h);
        setUploadedGrid({ width: w, height: h, data });
        setUploadedName(file.name);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const updateLightFromPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (((e.clientX - rect.left) / rect.width) * 2 - 1) * 1.25;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setLightPos({
      x: Math.max(-1.3, Math.min(1.3, nx)),
      y: Math.max(-1.0, Math.min(1.0, ny)),
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTs = performance.now();
    let frameCounter = 0;

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      if (playing) {
        timeRef.current += dt * speed;
      }
      const t = timeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.clientWidth || 720;
      const ch = canvas.clientHeight || 360;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, cw, ch);

      const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
      const ramp = (GLYPH_RAMPS[rampKey] || GLYPH_RAMPS.ascii).chars;

      const rows = Math.max(16, Math.round(cols * (ch / cw) * 0.55));
      const cellW = cw / cols;
      const cellH = ch / rows;
      const fontSize = Math.max(9, Math.min(16, Math.floor(cellH * 0.92)));

      ctx.font = `600 ${fontSize}px ${mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Build luminance & RGB grid first so Sobel edge filter can sample neighbors
      const lumGrid = new Float32Array(rows * cols);
      const rgbGrid = new Uint8Array(rows * cols * 3);

      // Parse activePreset.accent hex to RGB
      const hex = activePreset.accent.replace('#', '');
      const baseR = parseInt(hex.slice(0, 2), 16) || 212;
      const baseG = parseInt(hex.slice(2, 4), 16) || 175;
      const baseB = parseInt(hex.slice(4, 6), 16) || 55;

      for (let r = 0; r < rows; r++) {
        const ny = (r / (rows - 1)) * 2 - 1;
        for (let c = 0; c < cols; c++) {
          const nx = ((c / (cols - 1)) * 2 - 1) * (cw / ch) * 0.72;
          const idx = r * cols + c;

          if (uploadedGrid) {
            const ix = Math.min(uploadedGrid.width - 1, Math.floor((c / cols) * uploadedGrid.width));
            const iy = Math.min(uploadedGrid.height - 1, Math.floor((r / rows) * uploadedGrid.height));
            const pIdx = (iy * uploadedGrid.width + ix) * 4;
            const pr = uploadedGrid.data[pIdx];
            const pg = uploadedGrid.data[pIdx + 1];
            const pb = uploadedGrid.data[pIdx + 2];
            const dLight = Math.hypot(nx - lightPos.x, ny - lightPos.y);
            const lMult = 0.75 + Math.exp(-dLight * 1.4) * 0.65;
            const lum = Math.min(1, ((0.299 * pr + 0.587 * pg + 0.114 * pb) / 255) * lMult);
            lumGrid[idx] = lum;
            rgbGrid[idx * 3] = Math.min(255, pr * lMult);
            rgbGrid[idx * 3 + 1] = Math.min(255, pg * lMult);
            rgbGrid[idx * 3 + 2] = Math.min(255, pb * lMult);
          } else {
            const v = evaluateField(nx, ny, t, preset, warp, freq, lightPos);
            lumGrid[idx] = v;
            if (v > 0.78) {
              rgbGrid[idx * 3] = 255;
              rgbGrid[idx * 3 + 1] = 248;
              rgbGrid[idx * 3 + 2] = 225;
            } else {
              rgbGrid[idx * 3] = Math.round(baseR * (0.35 + v * 0.65));
              rgbGrid[idx * 3 + 1] = Math.round(baseG * (0.35 + v * 0.65));
              rgbGrid[idx * 3 + 2] = Math.round(baseB * (0.35 + v * 0.65));
            }
          }
        }
      }

      const textRows = [];
      const ansiRows = [];
      const captureText = frameCounter % 12 === 0;

      for (let r = 0; r < rows; r++) {
        let rowStr = '';
        let ansiStr = '';
        for (let c = 0; c < cols; c++) {
          const cellIdx = r * cols + c;
          const v = lumGrid[cellIdx];
          let chGlyph = ramp[Math.min(ramp.length - 1, Math.max(0, Math.floor(v * ramp.length)))];
          if (rampKey === 'bayer4') {
            const threshold = BAYER_4X4[r % 4][c % 4];
            const ditherVal = Math.max(0, Math.min(0.99, v + (threshold - 0.5) * 0.32));
            chGlyph = ramp[Math.min(ramp.length - 1, Math.max(0, Math.floor(ditherVal * ramp.length)))];
          }

          // Sobel directional edge override
          if (sobelEdges && r > 0 && r < rows - 1 && c > 0 && c < cols - 1) {
            const gx =
              -lumGrid[(r - 1) * cols + (c - 1)] +
              lumGrid[(r - 1) * cols + (c + 1)] -
              2 * lumGrid[r * cols + (c - 1)] +
              2 * lumGrid[r * cols + (c + 1)] -
              lumGrid[(r + 1) * cols + (c - 1)] +
              lumGrid[(r + 1) * cols + (c + 1)];
            const gy =
              -lumGrid[(r - 1) * cols + (c - 1)] -
              2 * lumGrid[(r - 1) * cols + c] -
              lumGrid[(r - 1) * cols + (c + 1)] +
              lumGrid[(r + 1) * cols + (c - 1)] +
              2 * lumGrid[(r + 1) * cols + c] +
              lumGrid[(r + 1) * cols + (c + 1)];
            const mag = Math.hypot(gx, gy);
            if (mag > 0.36) {
              const deg = ((Math.atan2(gy, gx) * 180) / Math.PI + 180) % 180;
              if (deg < 22.5 || deg >= 157.5) chGlyph = '|';
              else if (deg < 67.5) chGlyph = '/';
              else if (deg < 112.5) chGlyph = '-';
              else chGlyph = '\\';
            }
          }

          const cr = rgbGrid[cellIdx * 3];
          const cg = rgbGrid[cellIdx * 3 + 1];
          const cb = rgbGrid[cellIdx * 3 + 2];

          if (captureText) {
            rowStr += chGlyph;
            ansiStr += `\x1b[38;2;${cr};${cg};${cb}m${chGlyph}`;
          }

          if (chGlyph !== ' ') {
            const alpha = Math.min(1, 0.2 + v * 0.85).toFixed(2);
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
            ctx.fillText(chGlyph, c * cellW + cellW * 0.5, r * cellH + cellH * 0.5);
          }
        }
        if (captureText) {
          textRows.push(rowStr);
          ansiRows.push(ansiStr + '\x1b[0m');
        }
      }

      // Draw CRT scanline overlay if enabled
      if (crtScanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        for (let y = 28; y < ch; y += 3) {
          ctx.fillRect(0, y, cw, 1);
        }
      }

      // Draw interactive Point Light indicator
      const lxPx = ((lightPos.x / 1.25 + 1) * 0.5) * cw;
      const lyPx = ((lightPos.y + 1) * 0.5) * ch;
      ctx.save();
      ctx.beginPath();
      ctx.arc(lxPx, lyPx, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 230, 171, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lxPx, lyPx, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#F5E6AB';
      ctx.fill();
      ctx.restore();

      // Top HUD Bar
      ctx.fillStyle = 'rgba(5, 5, 8, 0.9)';
      ctx.fillRect(0, 0, cw, 28);
      ctx.fillStyle = 'rgba(245, 230, 171, 0.92)';
      ctx.font = `700 10px ${mono}`;
      ctx.textAlign = 'left';
      const sourceLabel = uploadedName ? `IMAGE: ${uploadedName.toUpperCase()}` : activePreset.name.toUpperCase();
      ctx.fillText(
        `ASCII_MAGIC // ${sourceLabel} // ${cols}x${rows} // SOBEL:${sobelEdges ? 'ON' : 'OFF'} // DRAG CANVAS TO RELIGHT`,
        14,
        16
      );

      ctx.restore();

      if (captureText) {
        setAsciiSnapshot(textRows.join('\n'));
        setAnsiSnapshot(ansiRows.join('\n'));
      }
      frameCounter++;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [preset, rampKey, cols, speed, warp, freq, playing, sobelEdges, crtScanlines, lightPos, uploadedGrid, uploadedName]);

  const generateSvg = () => {
    const lines = asciiSnapshot.split('\n');
    const lineHeight = 13;
    const charWidth = 7.6;
    const svgW = Math.round(cols * charWidth + 32);
    const svgH = Math.round(lines.length * lineHeight + 36);
    const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
    const accent = activePreset.accent || activeTheme?.accent || '#D4AF37';
    const escapeXml = (str) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const textNodes = lines
      .map((l, i) => `    <text x="16" y="${(i + 1) * lineHeight + 18}" fill="${accent}">${escapeXml(l)}</text>`)
      .join('\n');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">
  <defs>
    <style>
      text { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; font-weight: 600; font-variant-ligatures: none; }
    </style>
  </defs>
  <rect width="100%" height="100%" rx="12" fill="#050508"/>
  <rect width="100%" height="100%" rx="12" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.35"/>
  <g>
${textNodes}
  </g>
</svg>`;
  };

  const downloadSvg = () => {
    const svgCode = generateSvg();
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoth-ascii-${preset}-${cols}cols.svg`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedMode('svg-download');
    setTimeout(() => setCopiedMode(null), 1800);
  };

  const copyPayload = (mode) => {
    const activePreset = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;
    const ramp = (GLYPH_RAMPS[rampKey] || GLYPH_RAMPS.ascii).chars;

    let text = '';
    if (mode === 'frame') {
      text = [`/* ZOTH ASCII MAGIC // ${activePreset.name} */`, asciiSnapshot].join('\n');
    } else if (mode === 'ansi') {
      text = ansiSnapshot;
    } else if (mode === 'svg') {
      text = generateSvg();
    } else if (mode === 'embed') {
      text = `<!-- Zoth Studio Standalone 60FPS ASCII Magic Shader (${activePreset.name}) -->
<pre id="zoth-ascii-stage" style="background:#050508;color:${activePreset.accent};font:600 11px/1.15 'JetBrains Mono',monospace;padding:20px;border-radius:12px;overflow:hidden;margin:0;"></pre>
<script>
(function(){
  const pre = document.getElementById('zoth-ascii-stage');
  const ramp = ${JSON.stringify(ramp)};
  const cols = ${Math.min(cols, 72)}, rows = 26;
  let t = 0;
  function tick(){
    t += 0.04 * ${speed};
    let out = '';
    for (let r = 0; r < rows; r++) {
      const ny = (r / (rows - 1)) * 2 - 1;
      for (let c = 0; c < cols; c++) {
        const nx = ((c / (cols - 1)) * 2 - 1) * 1.35;
        const dist = Math.hypot(nx * ${freq}, ny * ${freq});
        const ang = Math.atan2(ny, nx);
        const v = Math.max(0, Math.min(0.99, 0.5 + 0.35 * Math.cos(dist * 12 - t * 3.5) + 0.25 * Math.sin(ang * 4 + t * 2)));
        out += ramp[Math.floor(v * ramp.length)];
      }
      out += '\\n';
    }
    pre.textContent = out;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
</script>`;
    }

    navigator.clipboard?.writeText(text);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 1800);
  };

  const activePresetObj = SHADER_PRESETS[preset] || SHADER_PRESETS.torus4d;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#07080D',
        border: '1px solid rgba(212, 175, 55, 0.32)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
      }}
    >
      {/* Top Header Strip */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: '#0B0D14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'rgba(212,175,55,0.14)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#D4AF37',
              display: 'flex',
            }}
          >
            <TerminalIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontFamily: mono, fontSize: '0.76rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.14em' }}>
                ZOTH ASCII MAGIC &amp; BRAILLE SYNTH
              </Typography>
              <Chip
                label="SOBEL EDGE + 24-BIT ANSI"
                size="small"
                sx={{
                  height: 20,
                  fontFamily: mono,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(16,185,129,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.3 }}>
              {uploadedName ? `Custom Image Loaded (${uploadedName}) — Drag canvas to relight` : `${activePresetObj.name} — ${activePresetObj.subtitle}`}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<UploadFileIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#38BDF8',
              borderColor: 'rgba(56,189,248,0.4)',
              bgcolor: 'rgba(56,189,248,0.08)',
            }}
          >
            Image → ASCII
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setPlaying((p) => !p)}
            startIcon={playing ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#E2E8F0',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            {playing ? 'Pause' : 'Resume'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => copyPayload('frame')}
            startIcon={copiedMode === 'frame' ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#F5E6AB',
              borderColor: 'rgba(212,175,55,0.45)',
              bgcolor: 'rgba(212,175,55,0.12)',
            }}
          >
            {copiedMode === 'frame' ? 'ASCII Copied' : 'Copy ASCII'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => copyPayload('ansi')}
            startIcon={copiedMode === 'ansi' ? <CheckIcon sx={{ fontSize: 15 }} /> : <AutoFixHighIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#34D399',
              borderColor: 'rgba(52,211,153,0.45)',
              bgcolor: 'rgba(52,211,153,0.1)',
            }}
          >
            {copiedMode === 'ansi' ? 'ANSI Copied' : 'Copy 24-Bit ANSI'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => copyPayload('svg')}
            startIcon={copiedMode === 'svg' ? <CheckIcon sx={{ fontSize: 15 }} /> : <CodeIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#C084FC',
              borderColor: 'rgba(192,132,252,0.45)',
              bgcolor: 'rgba(192,132,252,0.1)',
            }}
          >
            {copiedMode === 'svg' ? 'SVG Copied' : 'Copy SVG'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={downloadSvg}
            startIcon={copiedMode === 'svg-download' ? <CheckIcon sx={{ fontSize: 15 }} /> : <DownloadIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#38BDF8',
              borderColor: 'rgba(56,189,248,0.45)',
              bgcolor: 'rgba(56,189,248,0.1)',
            }}
          >
            {copiedMode === 'svg-download' ? 'Downloaded' : 'Download SVG'}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => copyPayload('embed')}
            startIcon={copiedMode === 'embed' ? <CheckIcon sx={{ fontSize: 15 }} /> : <CodeIcon sx={{ fontSize: 15 }} />}
            sx={{
              fontFamily: mono,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: activeTheme?.accent || '#D4AF37',
              color: '#060609',
              '&:hover': { bgcolor: activeTheme?.accentSoft || '#F5E6AB' },
            }}
          >
            {copiedMode === 'embed' ? 'Snippet Copied' : 'Export HTML/JS'}
          </Button>
        </Stack>
      </Box>

      {/* Main Grid */}
      <Grid container>
        <Grid xs={12} md={8} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.08)' }, bgcolor: '#050508' }}>
          <Box
            sx={{ width: '100%', height: { xs: 300, sm: 380 }, cursor: 'crosshair' }}
            onMouseDown={(e) => {
              draggingRef.current = true;
              updateLightFromPointer(e);
            }}
            onMouseMove={(e) => {
              if (draggingRef.current) updateLightFromPointer(e);
            }}
            onMouseUp={() => {
              draggingRef.current = false;
            }}
            onMouseLeave={() => {
              draggingRef.current = false;
            }}
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              bgcolor: '#090B11',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {Object.values(SHADER_PRESETS).map((item) => (
              <Button
                key={item.id}
                size="small"
                variant="outlined"
                onClick={() => {
                  setUploadedGrid(null);
                  setUploadedName('');
                  setPreset(item.id);
                }}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: !uploadedGrid && preset === item.id ? item.accent : 'rgba(255,255,255,0.02)',
                  color: !uploadedGrid && preset === item.id ? '#050508' : '#94A3B8',
                  borderColor: !uploadedGrid && preset === item.id ? item.accent : 'rgba(255,255,255,0.12)',
                  '&:hover': {
                    bgcolor: !uploadedGrid && preset === item.id ? '#F5E6AB' : 'rgba(255,255,255,0.08)',
                    borderColor: item.accent,
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        </Grid>

        <Grid xs={12} md={4} sx={{ p: 2.5, bgcolor: '#090B10', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: mono, fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', mb: 1, letterSpacing: '0.08em' }}>
              CHARACTER RAMP QUANTIZER
            </Typography>
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {Object.values(GLYPH_RAMPS).map((r) => (
                <Grid xs={6} key={r.id}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => setRampKey(r.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      fontFamily: mono,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 0.7,
                      bgcolor: rampKey === r.id ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.02)',
                      color: rampKey === r.id ? '#F5E6AB' : '#94A3B8',
                      borderColor: rampKey === r.id ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {r.label}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => setSobelEdges((s) => !s)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: sobelEdges ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.02)',
                  color: sobelEdges ? '#38BDF8' : '#94A3B8',
                  borderColor: sobelEdges ? '#38BDF8' : 'rgba(255,255,255,0.12)',
                }}
              >
                Sobel Edges: {sobelEdges ? 'ON (/\\|-)' : 'OFF'}
              </Button>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => setCrtScanlines((s) => !s)}
                sx={{
                  fontFamily: mono,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: crtScanlines ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.02)',
                  color: crtScanlines ? '#34D399' : '#94A3B8',
                  borderColor: crtScanlines ? '#34D399' : 'rgba(255,255,255,0.12)',
                }}
              >
                CRT Scanlines: {crtScanlines ? 'ON' : 'OFF'}
              </Button>
            </Stack>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>MATRIX COLUMNS</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{cols} cols</Typography>
              </Box>
              <Slider size="small" min={42} max={104} step={2} value={cols} onChange={(_, v) => setCols(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>TEMPORAL VELOCITY</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{speed.toFixed(2)}x</Typography>
              </Box>
              <Slider size="small" min={0.2} max={2.5} step={0.05} value={speed} onChange={(_, v) => setSpeed(v)} sx={{ color: '#D4AF37' }} />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#94A3B8' }}>HARMONIC WARP</Typography>
                <Typography sx={{ fontFamily: mono, fontSize: '0.66rem', color: '#D4AF37', fontWeight: 800 }}>{warp.toFixed(2)}</Typography>
              </Box>
              <Slider size="small" min={0.3} max={2.4} step={0.05} value={warp} onChange={(_, v) => setWarp(v)} sx={{ color: '#D4AF37' }} />
            </Box>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#050508', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#94A3B8', fontWeight: 700 }}>LIVE DOM TEXT MATRIX</Typography>
              <Typography sx={{ fontFamily: mono, fontSize: '0.62rem', color: '#34D399', fontWeight: 800 }}>READY TO EMBED</Typography>
            </Box>
            <Box
              component="pre"
              sx={{
                m: 0,
                fontFamily: mono,
                fontSize: '6.5px',
                lineHeight: '7px',
                color: 'rgba(212,175,55,0.85)',
                overflow: 'hidden',
                maxHeight: 96,
              }}
            >
              {asciiSnapshot}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
