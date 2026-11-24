import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Slider,
  TextField,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignGauge,
  SovereignDataTable,
  SovereignKeyValueGrid,
  downloadJson,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = SOV.gold;

const FRAME_STYLES = [
  { id: 'oak', label: 'Natural Oak', outer: '#C69C6D', inner: '#9E7548', bevel: '#DFBE94' },
  { id: 'walnut', label: 'American Walnut', outer: '#5A3820', inner: '#3D2413', bevel: '#7D5233' },
  { id: 'black', label: 'Matte Black', outer: '#1C1D22', inner: '#0D0E11', bevel: '#373942' },
  { id: 'gold', label: 'Brushed Gold', outer: '#C59B27', inner: '#8C6A12', bevel: '#E8CA68' },
];

const WALL_BACKDROPS = [
  { id: 'ivory', label: 'Gallery Ivory', top: '#F5F0E6', bottom: '#DDD5C7', light: 'rgba(255,250,235,0.58)' },
  { id: 'plaster', label: 'Warm Plaster', top: '#E8DFD1', bottom: '#CBBFA9', light: 'rgba(255,244,224,0.48)' },
  { id: 'slate', label: 'Studio Slate', top: '#2B313D', bottom: '#181C24', light: 'rgba(220,235,255,0.16)' },
  { id: 'obsidian', label: 'Obsidian Vault', top: '#141720', bottom: '#07090E', light: 'rgba(212,175,55,0.16)' },
];

const GARMENT_COLORS = [
  { id: 'washed-black', label: 'Washed Black', hex: '#1F2024', shade: '#101114', highlight: '#363840' },
  { id: 'bone', label: 'Alabaster Bone', hex: '#EBE5D8', shade: '#C9C0AF', highlight: '#FAF7F0' },
  { id: 'sage', label: 'Sage Moss', hex: '#5D6E60', shade: '#404E43', highlight: '#798C7C' },
  { id: 'navy', label: 'Vintage Navy', hex: '#233246', shade: '#141D2A', highlight: '#384C68' },
  { id: 'terracotta', label: 'Terracotta Clay', hex: '#A4533C', shade: '#763624', highlight: '#BF6C54' },
  { id: 'slate', label: 'Heather Slate', hex: '#68717C', shade: '#4A525C', highlight: '#858E9A' },
];

const ART_PRESETS = [
  { id: 'bauhaus-arch', label: 'Bauhaus Sun & Arch', palette: ['#F3EADF', '#C85A32', '#1C1D21', '#D4AF37'] },
  { id: 'aurum-astrolabe', label: 'Aurum Astrolabe', palette: ['#0B0D14', '#D4AF37', '#F5E6AB', '#38BDF8'] },
  { id: 'swiss-grid', label: 'Editorial Swiss Grid', palette: ['#F4EFE4', '#264653', '#2A9D8F', '#E76F51'] },
];

const PRINT_RATIOS = [
  {
    id: '2-3',
    ratio: '2:3',
    label: '2:3 Classic Tall',
    inchesW: 24,
    inchesH: 36,
    sizesNote: '4×6, 8×12, 12×18, 16×24, 24×36 in',
  },
  {
    id: '3-4',
    ratio: '3:4',
    label: '3:4 Gallery Vertical',
    inchesW: 18,
    inchesH: 24,
    sizesNote: '6×8, 9×12, 12×16, 18×24 in',
  },
  {
    id: '4-5',
    ratio: '4:5',
    label: '4:5 Portrait Standard',
    inchesW: 16,
    inchesH: 20,
    sizesNote: '4×5, 8×10, 12×15, 16×20 in',
  },
  {
    id: '11-14',
    ratio: '11:14',
    label: '11:14 Frame Favorite',
    inchesW: 11,
    inchesH: 14,
    sizesNote: '11×14 in exact frame ratio',
  },
  {
    id: 'iso-a',
    ratio: 'ISO A',
    label: 'ISO A-Series (1:√2)',
    inchesW: 16.54,
    inchesH: 23.39,
    sizesNote: 'A5, A4, A3, A2, A1 (42×59.4 cm)',
  },
];

function drawProceduralArtwork(ctx, x, y, w, h, presetId) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (presetId === 'bauhaus-arch') {
    ctx.fillStyle = '#F3EADF';
    ctx.fillRect(x, y, w, h);

    // Subtle linen bands
    ctx.fillStyle = 'rgba(180,150,115,0.12)';
    for (let i = 0; i < 18; i += 1) {
      ctx.fillRect(x, y + (h / 18) * i, w, 1);
    }

    // Terracotta arch
    ctx.fillStyle = '#C85A32';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.54, w * 0.3, Math.PI, 0, false);
    ctx.lineTo(x + w * 0.8, y + h * 0.88);
    ctx.lineTo(x + w * 0.2, y + h * 0.88);
    ctx.closePath();
    ctx.fill();

    // Sun orb
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(x + w * 0.62, y + h * 0.25, w * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Obsidian inner monolith
    ctx.fillStyle = '#181A20';
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.62, w * 0.14, Math.PI, 0, false);
    ctx.lineTo(x + w * 0.64, y + h * 0.88);
    ctx.lineTo(x + w * 0.36, y + h * 0.88);
    ctx.closePath();
    ctx.fill();

    // Horizon hairlines
    ctx.strokeStyle = '#181A20';
    ctx.lineWidth = Math.max(1.5, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.14, y + h * 0.88);
    ctx.lineTo(x + w * 0.86, y + h * 0.88);
    ctx.stroke();
  } else if (presetId === 'aurum-astrolabe') {
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, '#0B0D14');
    bg.addColorStop(1, '#141926');
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);

    const cx = x + w * 0.5;
    const cy = y + h * 0.48;
    const r = Math.min(w, h) * 0.34;

    // Concentric rings
    [1, 0.78, 0.54, 0.28].forEach((m, idx) => {
      ctx.strokeStyle = idx % 2 === 0 ? '#D4AF37' : 'rgba(245,230,171,0.55)';
      ctx.lineWidth = Math.max(1, w * (idx === 0 ? 0.008 : 0.004));
      ctx.beginPath();
      ctx.arc(cx, cy, r * m, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Celestial diamond & crosshairs
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = Math.max(1.2, w * 0.005);
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.15);
    ctx.lineTo(cx, cy + r * 1.15);
    ctx.moveTo(cx - r * 1.15, cy);
    ctx.lineTo(cx + r * 1.15, cy);
    ctx.stroke();

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = Math.max(1.2, w * 0.005);
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.78);
    ctx.lineTo(cx + r * 0.78, cy);
    ctx.lineTo(cx, cy + r * 0.78);
    ctx.lineTo(cx - r * 0.78, cy);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#F5E6AB';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Editorial Swiss Grid
    ctx.fillStyle = '#F4EFE4';
    ctx.fillRect(x, y, w, h);

    const pad = w * 0.1;
    const cellW = (w - pad * 2) / 3;
    const cellH = (h - pad * 2) / 4;
    const colors = ['#264653', '#2A9D8F', '#E76F51', '#E9C46A'];

    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const bx = x + pad + c * cellW;
        const by = y + pad + r * cellH;
        const col = colors[(r * 3 + c) % colors.length];
        ctx.fillStyle = col;
        if ((r + c) % 3 === 0) {
          ctx.beginPath();
          ctx.arc(bx + cellW * 0.5, by + cellH * 0.5, Math.min(cellW, cellH) * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else if ((r + c) % 3 === 1) {
          ctx.fillRect(bx + cellW * 0.08, by + cellH * 0.08, cellW * 0.84, cellH * 0.84);
        } else {
          ctx.beginPath();
          ctx.moveTo(bx + cellW * 0.1, by + cellH * 0.9);
          ctx.lineTo(bx + cellW * 0.5, by + cellH * 0.12);
          ctx.lineTo(bx + cellW * 0.9, by + cellH * 0.9);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }
  ctx.restore();
}

function drawArtworkContained(ctx, img, presetId, x, y, w, h) {
  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = w / h;
    let drawW = w;
    let drawH = h;
    let dx = x;
    let dy = y;
    if (imgRatio > boxRatio) {
      drawH = h;
      drawW = h * imgRatio;
      dx = x - (drawW - w) * 0.5;
    } else {
      drawW = w;
      drawH = w / imgRatio;
      dy = y - (drawH - h) * 0.5;
    }
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  } else {
    drawProceduralArtwork(ctx, x, y, w, h, presetId);
  }
}

function renderMockupScene(ctx, width, height, opts) {
  const {
    surfaceMode,
    frameStyle,
    wallBackdrop,
    matBorderPct,
    frameRatioId,
    garmentType,
    garmentColor,
    printPlacement,
    printScale,
    printOffsetY,
    uploadedImg,
    artPresetId,
    showHud,
  } = opts;

  ctx.clearRect(0, 0, width, height);

  if (surfaceMode === 'wall-art') {
    // Wall backdrop gradient
    const wallGrad = ctx.createLinearGradient(0, 0, 0, height);
    wallGrad.addColorStop(0, wallBackdrop.top);
    wallGrad.addColorStop(1, wallBackdrop.bottom);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle gallery overhead spotlight cone
    const spot = ctx.createRadialGradient(width * 0.5, height * 0.08, width * 0.04, width * 0.5, height * 0.42, width * 0.72);
    spot.addColorStop(0, wallBackdrop.light);
    spot.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);

    // Subtle gallery wainscoting/shadow line near bottom
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, height * 0.88, width, 2);

    const ratioMap = {
      '2-3': 2 / 3,
      '3-4': 3 / 4,
      '4-5': 4 / 5,
      '11-14': 11 / 14,
      'iso-a': 1 / Math.SQRT2,
    };
    const aspect = ratioMap[frameRatioId] || 0.75;
    const maxFrameH = height * 0.74;
    const maxFrameW = width * 0.62;
    let frameH = maxFrameH;
    let frameW = frameH * aspect;
    if (frameW > maxFrameW) {
      frameW = maxFrameW;
      frameH = frameW / aspect;
    }

    const fx = (width - frameW) * 0.5;
    const fy = (height - frameH) * 0.48;
    const molding = Math.max(10, Math.min(frameW, frameH) * 0.055);

    // Directional gallery drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.38)';
    ctx.shadowBlur = Math.max(18, width * 0.045);
    ctx.shadowOffsetX = width * 0.012;
    ctx.shadowOffsetY = height * 0.032;
    ctx.fillStyle = frameStyle.outer;
    ctx.fillRect(fx, fy, frameW, frameH);
    ctx.restore();

    // Outer frame body + mitered bevel highlight
    ctx.fillStyle = frameStyle.outer;
    ctx.fillRect(fx, fy, frameW, frameH);

    ctx.strokeStyle = frameStyle.bevel;
    ctx.lineWidth = Math.max(2, molding * 0.14);
    ctx.strokeRect(fx + 1, fy + 1, frameW - 2, frameH - 2);

    // Inner lip
    ctx.fillStyle = frameStyle.inner;
    ctx.fillRect(fx + molding * 0.78, fy + molding * 0.78, frameW - molding * 1.56, frameH - molding * 1.56);

    // Mat board
    const innerX = fx + molding;
    const innerY = fy + molding;
    const innerW = frameW - molding * 2;
    const innerH = frameH - molding * 2;
    ctx.fillStyle = '#FBF9F4';
    ctx.fillRect(innerX, innerY, innerW, innerH);

    // Artwork aperture
    const matPx = Math.min(innerW, innerH) * (matBorderPct / 100);
    const artX = innerX + matPx;
    const artY = innerY + matPx;
    const artW = Math.max(24, innerW - matPx * 2);
    const artH = Math.max(24, innerH - matPx * 2);

    // Recessed mat bevel shadow
    if (matPx > 2) {
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(artX - 1.5, artY - 1.5, artW + 3, artH + 3);
    }

    drawArtworkContained(ctx, uploadedImg, artPresetId, artX, artY, artW, artH);

    // Subtle anti-reflective museum glass sheen
    const glass = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH);
    glass.addColorStop(0, 'rgba(255,255,255,0.11)');
    glass.addColorStop(0.38, 'rgba(255,255,255,0.01)');
    glass.addColorStop(0.62, 'rgba(255,255,255,0)');
    glass.addColorStop(1, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = glass;
    ctx.fillRect(innerX, innerY, innerW, innerH);
  } else {
    // Apparel Studio Backdrop
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.42, width * 0.08, width * 0.5, height * 0.5, width * 0.72);
    bgGrad.addColorStop(0, '#222630');
    bgGrad.addColorStop(1, '#0C0E14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.52;
    const unit = Math.min(width * 0.86, height * 0.88);

    const drawGarmentPath = () => {
      ctx.beginPath();
      if (garmentType === 'hoodie') {
        // Boxy heavyweight hoodie silhouette
        ctx.moveTo(cx - unit * 0.14, cy - unit * 0.36);
        // Hood crown
        ctx.quadraticCurveTo(cx, cy - unit * 0.48, cx + unit * 0.14, cy - unit * 0.36);
        // Right shoulder + drop sleeve
        ctx.lineTo(cx + unit * 0.28, cy - unit * 0.3);
        ctx.lineTo(cx + unit * 0.45, cy + unit * 0.06);
        ctx.lineTo(cx + unit * 0.35, cy + unit * 0.13);
        ctx.lineTo(cx + unit * 0.25, cy - unit * 0.08);
        // Right torso + rib hem
        ctx.lineTo(cx + unit * 0.26, cy + unit * 0.4);
        ctx.lineTo(cx - unit * 0.26, cy + unit * 0.4);
        // Left torso + drop sleeve
        ctx.lineTo(cx - unit * 0.25, cy - unit * 0.08);
        ctx.lineTo(cx - unit * 0.35, cy + unit * 0.13);
        ctx.lineTo(cx - unit * 0.45, cy + unit * 0.06);
        ctx.lineTo(cx - unit * 0.28, cy - unit * 0.3);
        ctx.closePath();
      } else {
        // Heavyweight crewneck tee silhouette
        ctx.moveTo(cx - unit * 0.11, cy - unit * 0.38);
        ctx.quadraticCurveTo(cx, cy - unit * 0.29, cx + unit * 0.11, cy - unit * 0.38);
        ctx.lineTo(cx + unit * 0.27, cy - unit * 0.32);
        ctx.lineTo(cx + unit * 0.44, cy - unit * 0.09);
        ctx.lineTo(cx + unit * 0.32, cy + unit * 0.0);
        ctx.lineTo(cx + unit * 0.24, cy - unit * 0.11);
        ctx.lineTo(cx + unit * 0.24, cy + unit * 0.4);
        ctx.lineTo(cx - unit * 0.24, cy + unit * 0.4);
        ctx.lineTo(cx - unit * 0.24, cy - unit * 0.11);
        ctx.lineTo(cx - unit * 0.32, cy + unit * 0.0);
        ctx.lineTo(cx - unit * 0.44, cy - unit * 0.09);
        ctx.lineTo(cx - unit * 0.27, cy - unit * 0.32);
        ctx.closePath();
      }
    };

    // Soft studio drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.48)';
    ctx.shadowBlur = Math.max(20, width * 0.045);
    ctx.shadowOffsetY = height * 0.025;
    drawGarmentPath();
    ctx.fillStyle = garmentColor.hex;
    ctx.fill();
    ctx.restore();

    // Clip inside garment for fabric shading, artwork, and weave multiply
    ctx.save();
    drawGarmentPath();
    ctx.clip();

    // Base torso 3D cylindrical lighting
    const bodyGrad = ctx.createLinearGradient(cx - unit * 0.32, cy, cx + unit * 0.32, cy);
    bodyGrad.addColorStop(0, garmentColor.shade);
    bodyGrad.addColorStop(0.24, garmentColor.hex);
    bodyGrad.addColorStop(0.5, garmentColor.highlight);
    bodyGrad.addColorStop(0.76, garmentColor.hex);
    bodyGrad.addColorStop(1, garmentColor.shade);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(0, 0, width, height);

    // Collar rib / hood pocket details
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = Math.max(1.5, unit * 0.005);
    if (garmentType === 'tee') {
      ctx.beginPath();
      ctx.arc(cx, cy - unit * 0.41, unit * 0.11, 0.18 * Math.PI, 0.82 * Math.PI);
      ctx.stroke();
    } else {
      // Kangaroo pocket subtle seam
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      ctx.moveTo(cx - unit * 0.17, cy + unit * 0.18);
      ctx.lineTo(cx + unit * 0.17, cy + unit * 0.18);
      ctx.lineTo(cx + unit * 0.2, cy + unit * 0.35);
      ctx.lineTo(cx - unit * 0.2, cy + unit * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Print area placement
    const scaleFactor = (printScale || 75) / 100;
    const offsetYPx = ((printOffsetY || 0) / 100) * (unit * 0.24);
    let artW = unit * 0.3 * scaleFactor;
    let artH = artW * 1.2;
    let artX = cx - artW * 0.5;
    let artY = cy - unit * 0.19 + offsetYPx;

    if (printPlacement === 'pocket') {
      artW = unit * 0.12 * scaleFactor;
      artH = artW * 1.05;
      artX = cx + unit * 0.055;
      artY = cy - unit * 0.19 + offsetYPx * 0.6;
    } else if (printPlacement === 'back') {
      artW = unit * 0.36 * scaleFactor;
      artH = artW * 1.25;
      artX = cx - artW * 0.5;
      artY = cy - unit * 0.22 + offsetYPx;
    }

    ctx.save();
    ctx.globalAlpha = 0.93;
    drawArtworkContained(ctx, uploadedImg, artPresetId, artX, artY, artW, artH);
    ctx.restore();

    // Procedural fabric weave multiply & drape shadow pass
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0,0,0,0.045)';
    const step = Math.max(3, Math.round(width / 160));
    for (let wy = 0; wy < height; wy += step * 2) {
      ctx.fillRect(0, wy, width, 1);
    }
    const drape = ctx.createLinearGradient(cx - unit * 0.26, cy, cx + unit * 0.26, cy);
    drape.addColorStop(0, 'rgba(0,0,0,0.22)');
    drape.addColorStop(0.28, 'rgba(255,255,255,0.04)');
    drape.addColorStop(0.52, 'rgba(0,0,0,0.06)');
    drape.addColorStop(0.75, 'rgba(255,255,255,0.03)');
    drape.addColorStop(1, 'rgba(0,0,0,0.24)');
    ctx.fillStyle = drape;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.restore(); // end garment clip

    // Crisp outline
    drawGarmentPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = Math.max(1, unit * 0.003);
    ctx.stroke();
  }

  if (showHud) {
    ctx.save();
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = surfaceMode === 'wall-art' && (wallBackdrop.id === 'ivory' || wallBackdrop.id === 'plaster')
      ? 'rgba(16,24,40,0.68)'
      : 'rgba(245,241,230,0.78)';
    const topLabel =
      surfaceMode === 'wall-art'
        ? `FRAMED WALL ART · ${frameStyle.label.toUpperCase()} · MAT ${matBorderPct}% · RATIO ${frameRatioId.toUpperCase()}`
        : `${garmentType.toUpperCase()} · ${garmentColor.label.toUpperCase()} · ${printPlacement.toUpperCase()} (${printScale}%)`;
    ctx.fillText(topLabel, 14, 22);
    ctx.fillText('CLIENT-SIDE DPR CANVAS COMPOSITOR · 2400×2000 PNG EXPORT', 14, height - 14);
    ctx.restore();
  }
}

export default function PodMockupForgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Studio compositor controls
  const [surfaceMode, setSurfaceMode] = useState('wall-art');
  const [frameStyleId, setFrameStyleId] = useState('oak');
  const [wallBackdropId, setWallBackdropId] = useState('ivory');
  const [matBorderPct, setMatBorderPct] = useState(11);
  const [frameRatioId, setFrameRatioId] = useState('3-4');

  const [garmentType, setGarmentType] = useState('tee');
  const [garmentColorId, setGarmentColorId] = useState('washed-black');
  const [printPlacement, setPrintPlacement] = useState('chest');
  const [printScale, setPrintScale] = useState(78);
  const [printOffsetY, setPrintOffsetY] = useState(0);

  const [artPresetId, setArtPresetId] = useState('bauhaus-arch');
  const [uploadedImg, setUploadedImg] = useState(null);
  const [uploadMeta, setUploadMeta] = useState(null);

  // 300 DPI Print Pack Calculator state
  const [targetDpi, setTargetDpi] = useState(300);
  const [jpegQuality, setJpegQuality] = useState(92);
  const [sourceWidthPx, setSourceWidthPx] = useState(5400);
  const [sourceHeightPx, setSourceHeightPx] = useState(7200);

  const frameStyle = useMemo(
    () => FRAME_STYLES.find((f) => f.id === frameStyleId) || FRAME_STYLES[0],
    [frameStyleId],
  );
  const wallBackdrop = useMemo(
    () => WALL_BACKDROPS.find((w) => w.id === wallBackdropId) || WALL_BACKDROPS[0],
    [wallBackdropId],
  );
  const garmentColor = useMemo(
    () => GARMENT_COLORS.find((c) => c.id === garmentColorId) || GARMENT_COLORS[0],
    [garmentColorId],
  );

  // Live DPR-aware canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 560;
      const cssH = canvas.clientHeight || 420;
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderMockupScene(ctx, cssW, cssH, {
        surfaceMode,
        frameStyle,
        wallBackdrop,
        matBorderPct,
        frameRatioId,
        garmentType,
        garmentColor,
        printPlacement,
        printScale,
        printOffsetY,
        uploadedImg,
        artPresetId,
        showHud: true,
      });
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [
    surfaceMode,
    frameStyle,
    wallBackdrop,
    matBorderPct,
    frameRatioId,
    garmentType,
    garmentColor,
    printPlacement,
    printScale,
    printOffsetY,
    uploadedImg,
    artPresetId,
  ]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        setUploadedImg(img);
        setUploadMeta({
          name: file.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
        });
        setSourceWidthPx(img.naturalWidth);
        setSourceHeightPx(img.naturalHeight);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExportPng = () => {
    if (typeof document === 'undefined') return;
    const exportCanvas = document.createElement('canvas');
    // 2400x2000 (6:5 / Etsy-safe >=2000px shortest side)
    exportCanvas.width = 2400;
    exportCanvas.height = 2000;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    renderMockupScene(ctx, 2400, 2000, {
      surfaceMode,
      frameStyle,
      wallBackdrop,
      matBorderPct,
      frameRatioId,
      garmentType,
      garmentColor,
      printPlacement,
      printScale,
      printOffsetY,
      uploadedImg,
      artPresetId,
      showHud: false,
    });
    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `zoth-mockup-${surfaceMode}-${surfaceMode === 'wall-art' ? frameStyleId : garmentType}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 300 DPI Multi-Ratio Wall Art Pack Calculator + Etsy 20 MB ZIP Splitter + 2026 Photo Auditor
  const packAnalysis = useMemo(() => {
    const dpi = Math.max(72, Number(targetDpi) || 300);
    const q = Math.min(100, Math.max(60, Number(jpegQuality) || 92));
    // Realistic photographic JPEG compression factor vs raw 24-bit RGB
    const jpegRatio = q >= 95 ? 0.145 : q >= 90 ? 0.095 : q >= 85 ? 0.068 : 0.048;
    const srcW = Math.max(100, Number(sourceWidthPx) || 5400);
    const srcH = Math.max(100, Number(sourceHeightPx) || 7200);

    const files = PRINT_RATIOS.map((r) => {
      const pxW = Math.round(r.inchesW * dpi);
      const pxH = Math.round(r.inchesH * dpi);
      const cmW = Number((r.inchesW * 2.54).toFixed(1));
      const cmH = Number((r.inchesH * 2.54).toFixed(1));
      const rawRgbMb = (pxW * pxH * 3) / (1024 * 1024);
      const estJpegMb = Math.max(0.6, rawRgbMb * jpegRatio);
      const needsUpscale = pxW > srcW || pxH > srcH;
      const upscaleFactor = Math.max(pxW / srcW, pxH / srcH);
      const status = !needsUpscale ? 'PASS' : upscaleFactor <= 1.25 ? 'WARN' : 'FAIL';

      return {
        id: r.id,
        ratio: r.ratio,
        label: r.label,
        pixels: `${pxW} × ${pxH} px`,
        pxW,
        pxH,
        printSize: `${r.inchesW}×${r.inchesH} in (${cmW}×${cmH} cm)`,
        sizesNote: r.sizesNote,
        rawMb: `${rawRgbMb.toFixed(1)} MB`,
        jpegMb: `${estJpegMb.toFixed(2)} MB`,
        estJpegMbNum: Number(estJpegMb.toFixed(2)),
        status,
      };
    });

    // Greedy bin-packing into <= 19.2 MB Etsy ZIP archives (20 MB hard limit, max 5 ZIPs)
    const ZIP_LIMIT_MB = 19.2;
    const sorted = [...files].sort((a, b) => b.estJpegMbNum - a.estJpegMbNum);
    const zips = [];
    sorted.forEach((f) => {
      const targetBin = zips.find((z) => z.totalMb + f.estJpegMbNum <= ZIP_LIMIT_MB);
      if (targetBin) {
        targetBin.files.push(f.ratio);
        targetBin.totalMb = Number((targetBin.totalMb + f.estJpegMbNum).toFixed(2));
      } else {
        zips.push({
          archive: `WallArt_Pack_0${zips.length + 1}_${dpi}DPI.zip`,
          files: [f.ratio],
          totalMb: Number(f.estJpegMbNum.toFixed(2)),
        });
      }
    });

    // Etsy 2026 Photo Standards Compliance Check on source artwork / 2400x2000 mockup export
    const shortestSide = Math.min(srcW, srcH);
    const srcAspect = srcW / srcH;
    const min2000Ok = shortestSide >= 2000;
    const etsyZipOk = zips.length <= 5 && zips.every((z) => z.totalMb <= 20);
    const dpiOk = dpi >= 300;
    // Check 4:3 (1.333) and 5:4 (1.25) primary thumbnail crop safety for mockup export (2400x2000 = 1.2)
    const mockupAspect = 2400 / 2000;
    const cropLoss4x3Pct = Number((Math.abs(mockupAspect - 4 / 3) / (4 / 3) * 100).toFixed(1));
    const cropLoss5x4Pct = Number((Math.abs(mockupAspect - 5 / 4) / (5 / 4) * 100).toFixed(1));
    const passCount = files.filter((f) => f.status === 'PASS').length;

    let complianceScore = 0;
    if (min2000Ok) complianceScore += 30;
    else complianceScore += Math.round(Math.min(1, shortestSide / 2000) * 20);
    if (dpiOk) complianceScore += 25;
    else complianceScore += 14;
    if (etsyZipOk) complianceScore += 25;
    complianceScore += Math.round((passCount / files.length) * 20);

    const totalPackMb = Number(files.reduce((s, f) => s + f.estJpegMbNum, 0).toFixed(2));

    return {
      files,
      zips,
      totalPackMb,
      shortestSide,
      srcAspect: Number(srcAspect.toFixed(2)),
      min2000Ok,
      etsyZipOk,
      dpiOk,
      cropLoss4x3Pct,
      cropLoss5x4Pct,
      passCount,
      complianceScore: Math.min(100, complianceScore),
    };
  }, [targetDpi, jpegQuality, sourceWidthPx, sourceHeightPx]);

  const printPackSpec = useMemo(
    () => ({
      schema: 'zoth.pod.print_pack_spec.v2',
      mockup_export: {
        surface: surfaceMode,
        dimensions_px: '2400x2000',
        etsy_2026_shortest_side_ok: true,
        thumbnail_4x3_crop_loss_pct: packAnalysis.cropLoss4x3Pct,
        thumbnail_5x4_crop_loss_pct: packAnalysis.cropLoss5x4Pct,
        ...(surfaceMode === 'wall-art'
          ? { frame: frameStyle.id, wall: wallBackdrop.id, mat_border_pct: matBorderPct, ratio: frameRatioId }
          : { garment: garmentType, color: garmentColor.id, placement: printPlacement, scale_pct: printScale, offset_y: printOffsetY }),
      },
      source_artwork: {
        source: uploadMeta ? uploadMeta.name : `preset:${artPresetId}`,
        width_px: sourceWidthPx,
        height_px: sourceHeightPx,
        shortest_side_px: packAnalysis.shortestSide,
        meets_2000px_minimum: packAnalysis.min2000Ok,
      },
      print_pack: {
        target_dpi: targetDpi,
        jpeg_quality: jpegQuality,
        total_estimated_mb: packAnalysis.totalPackMb,
        etsy_20mb_zip_limit_compliant: packAnalysis.etsyZipOk,
        zip_split_plan: packAnalysis.zips,
        ratios: packAnalysis.files.map((f) => ({
          ratio: f.ratio,
          dimensions_px: `${f.pxW}x${f.pxH}`,
          print_size: f.printSize,
          est_jpeg_mb: f.estJpegMbNum,
          upscale_audit: f.status,
        })),
      },
    }),
    [
      surfaceMode,
      packAnalysis,
      frameStyle,
      wallBackdrop,
      matBorderPct,
      frameRatioId,
      garmentType,
      garmentColor,
      printPlacement,
      printScale,
      printOffsetY,
      uploadMeta,
      artPresetId,
      sourceWidthPx,
      sourceHeightPx,
      targetDpi,
      jpegQuality,
    ],
  );

  const specJsonString = useMemo(() => JSON.stringify(printPackSpec, null, 2), [printPackSpec]);

  const kpis = [
    {
      label: 'Etsy 2026 Audit',
      value: `${packAnalysis.complianceScore}/100`,
      unit: packAnalysis.min2000Ok ? '>=2000px PASS' : 'Below 2000px',
      accent: packAnalysis.complianceScore >= 85 ? SOV.emerald : SOV.amber,
    },
    {
      label: 'Mockup Export',
      value: '2400×2000',
      unit: `${surfaceMode === 'wall-art' ? frameStyle.label : garmentType.toUpperCase()} PNG`,
      accent: SOV.gold,
    },
    {
      label: '300 DPI Pack',
      value: `${packAnalysis.totalPackMb} MB`,
      unit: `${packAnalysis.zips.length} ZIP(s) <= 20MB`,
      accent: packAnalysis.etsyZipOk ? SOV.cyber : SOV.crimson,
    },
    {
      label: 'Ratio Readiness',
      value: `${packAnalysis.passCount}/${packAnalysis.files.length}`,
      unit: `Source ${sourceWidthPx}×${sourceHeightPx}`,
      accent: SOV.emerald,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={packAnalysis.min2000Ok && packAnalysis.etsyZipOk ? 'online' : 'standby'}
        label={`DPR CANVAS STUDIO · ${targetDpi} DPI · ${packAnalysis.zips.length} ETSY ZIP(S) · ${packAnalysis.complianceScore}/100`}
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: 'Export Mockup PNG (2400×2000)',
      icon: <DownloadIcon fontSize="small" />,
      onClick: handleExportPng,
      primary: true,
    },
    {
      label: 'Download print-pack-spec.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(printPackSpec, 'print-pack-spec.json'),
    },
    {
      label: 'Upload Local Artwork',
      icon: <UploadFileIcon fontSize="small" />,
      onClick: () => fileInputRef.current?.click(),
    },
    {
      label: 'pod-mockup-forge on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/pod-mockup-forge',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="MOCKUP SURFACE & ARTWORK SOURCE"
        title="Wall Art & Apparel Compositor Controls"
        subtitle="Switch between Framed Wall Art and Heavyweight Tee/Hoodie; upload local PNG/JPG or select a built-in geometric preset"
        accent={ACCENT_RAW}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleImageUpload}
          aria-label="Upload local artwork image"
        />

        {/* Surface Switcher */}
        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          MOCKUP SURFACE MODE
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {[
            { id: 'wall-art', label: 'Framed Wall Art' },
            { id: 'apparel', label: 'Heavyweight Tee / Hoodie' },
          ].map((m) => {
            const active = surfaceMode === m.id;
            return (
              <Button
                key={m.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => setSurfaceMode(m.id)}
                sx={{
                  minHeight: 44,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  ...(active
                    ? { bgcolor: isDark ? SOV.gold : '#B8860B', color: isDark ? '#08080B' : '#FFFFFF' }
                    : { color: 'text.primary', borderColor: 'rgba(148,163,184,0.35)' }),
                }}
              >
                {m.label}
              </Button>
            );
          })}
        </Box>

        {/* Artwork Source */}
        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          ARTWORK SOURCE (LOCAL FILEREADER OR PROCEDURAL PRESETS)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {ART_PRESETS.map((p) => {
            const active = !uploadedImg && artPresetId === p.id;
            return (
              <Chip
                key={p.id}
                label={p.label}
                clickable
                onClick={() => {
                  setUploadedImg(null);
                  setUploadMeta(null);
                  setArtPresetId(p.id);
                }}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.71rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileIcon fontSize="small" />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ minHeight: 36, fontFamily: MONO, fontSize: '0.71rem', fontWeight: 700, textTransform: 'none', color: isDark ? SOV.cyber : '#0369A1', borderColor: rgba(SOV.cyber, 0.45) }}
          >
            Upload PNG/JPG
          </Button>
          {uploadedImg && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon fontSize="small" />}
              onClick={() => {
                setUploadedImg(null);
                setUploadMeta(null);
              }}
              sx={{ minHeight: 36, fontFamily: MONO, fontSize: '0.7rem', textTransform: 'none' }}
            >
              Clear Upload
            </Button>
          )}
        </Box>

        {uploadMeta && (
          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: SOV.emerald, mb: 1.5 }}>
            Loaded local image: {uploadMeta.name} ({uploadMeta.width}×{uploadMeta.height}px · {uploadMeta.sizeMb} MB)
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {surfaceMode === 'wall-art' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
                GALLERY FRAME FINISH
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {FRAME_STYLES.map((f) => {
                  const active = f.id === frameStyleId;
                  return (
                    <Chip
                      key={f.id}
                      label={f.label}
                      clickable
                      onClick={() => setFrameStyleId(f.id)}
                      sx={{
                        minHeight: 36,
                        fontFamily: MONO,
                        fontSize: '0.71rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                        color: active ? accent : 'text.primary',
                        border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
                WALL LIGHTING BACKDROP
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {WALL_BACKDROPS.map((w) => {
                  const active = w.id === wallBackdropId;
                  return (
                    <Chip
                      key={w.id}
                      label={w.label}
                      clickable
                      onClick={() => setWallBackdropId(w.id)}
                      sx={{
                        minHeight: 34,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(SOV.cyber, 0.16) : 'transparent',
                        color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.primary',
                        border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
                FRAME ASPECT RATIO
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {PRINT_RATIOS.map((r) => {
                  const active = r.id === frameRatioId;
                  return (
                    <Chip
                      key={r.id}
                      label={r.ratio}
                      clickable
                      onClick={() => setFrameRatioId(r.id)}
                      sx={{
                        minHeight: 34,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                        color: active ? accent : 'text.primary',
                        border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700 }}>
                  MAT BOARD BORDER
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: accent, fontWeight: 700 }}>
                  {matBorderPct}%
                </Typography>
              </Box>
              <Slider
                value={matBorderPct}
                min={0}
                max={24}
                step={1}
                onChange={(_, v) => setMatBorderPct(Number(v))}
                aria-label="Mat Border Percentage"
                sx={{ color: accent }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
                GARMENT SILHOUETTE & PLACEMENT
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                {[
                  { id: 'tee', label: 'Heavyweight Tee' },
                  { id: 'hoodie', label: 'Boxy Hoodie' },
                ].map((g) => {
                  const active = garmentType === g.id;
                  return (
                    <Chip
                      key={g.id}
                      label={g.label}
                      clickable
                      onClick={() => setGarmentType(g.id)}
                      sx={{
                        minHeight: 36,
                        fontFamily: MONO,
                        fontSize: '0.71rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                        color: active ? accent : 'text.primary',
                        border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {[
                  { id: 'chest', label: 'Front Chest' },
                  { id: 'back', label: 'Full Back' },
                  { id: 'pocket', label: 'Left Crest' },
                ].map((pl) => {
                  const active = printPlacement === pl.id;
                  return (
                    <Chip
                      key={pl.id}
                      label={pl.label}
                      clickable
                      onClick={() => setPrintPlacement(pl.id)}
                      sx={{
                        minHeight: 34,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(SOV.cyber, 0.16) : 'transparent',
                        color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.primary',
                        border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
                GARMENT COLOR SWATCHES
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {GARMENT_COLORS.map((c) => {
                  const active = c.id === garmentColorId;
                  return (
                    <Chip
                      key={c.id}
                      label={c.label}
                      clickable
                      onClick={() => setGarmentColorId(c.id)}
                      avatar={
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: c.hex,
                            border: '1px solid rgba(148,163,184,0.6)',
                          }}
                        />
                      }
                      sx={{
                        minHeight: 36,
                        fontFamily: MONO,
                        fontSize: '0.7rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                        color: active ? accent : 'text.primary',
                        border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700 }}>
                  PRINT SCALE
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: accent, fontWeight: 700 }}>
                  {printScale}%
                </Typography>
              </Box>
              <Slider
                value={printScale}
                min={35}
                max={115}
                step={1}
                onChange={(_, v) => setPrintScale(Number(v))}
                aria-label="Print Scale"
                sx={{ color: accent }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700 }}>
                  VERTICAL Y-OFFSET
                </Typography>
                <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: accent, fontWeight: 700 }}>
                  {printOffsetY > 0 ? `+${printOffsetY}` : printOffsetY}
                </Typography>
              </Box>
              <Slider
                value={printOffsetY}
                min={-60}
                max={60}
                step={2}
                onChange={(_, v) => setPrintOffsetY(Number(v))}
                aria-label="Print Y Offset"
                sx={{ color: accent }}
              />
            </Box>
          </Box>
        )}
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="300 DPI PRINT PACK PARAMETERS"
        title="Source Master & Compression Settings"
        subtitle="Set master artwork resolution, target print DPI, and JPEG archival quality for multi-ratio ZIP planning"
        accent={SOV.cyber}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.75 }}>
          <TextField
            size="small"
            type="number"
            label="Source Width (px)"
            value={sourceWidthPx}
            onChange={(e) => setSourceWidthPx(Math.max(100, Number(e.target.value)))}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
          <TextField
            size="small"
            type="number"
            label="Source Height (px)"
            value={sourceHeightPx}
            onChange={(e) => setSourceHeightPx(Math.max(100, Number(e.target.value)))}
            sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
          />
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          TARGET PRINT RESOLUTION (DPI)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.75 }}>
          {[300, 240, 150].map((d) => {
            const active = targetDpi === d;
            return (
              <Chip
                key={d}
                label={`${d} DPI${d === 300 ? ' (Archival)' : ''}`}
                clickable
                onClick={() => setTargetDpi(d)}
                sx={{
                  minHeight: 34,
                  fontFamily: MONO,
                  fontSize: '0.71rem',
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? rgba(SOV.cyber, 0.16) : 'transparent',
                  color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.primary',
                  border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.34)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700 }}>
              JPEG ARCHIVAL QUALITY
            </Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', color: isDark ? SOV.cyber : '#0369A1', fontWeight: 700 }}>
              {jpegQuality}%
            </Typography>
          </Box>
          <Slider
            value={jpegQuality}
            min={75}
            max={98}
            step={1}
            onChange={(_, v) => setJpegQuality(Number(v))}
            aria-label="JPEG Quality"
            sx={{ color: isDark ? SOV.cyber : '#0369A1' }}
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE DPR HTML5 CANVAS COMPOSITOR"
        title={
          surfaceMode === 'wall-art'
            ? `Framed Wall Art · ${frameStyle.label} (${frameRatioId.toUpperCase()})`
            : `${garmentType === 'hoodie' ? 'Boxy Hoodie' : 'Heavyweight Tee'} · ${garmentColor.label}`
        }
        subtitle="Real-time gallery lighting / fabric weave multiply compositor with 1-click 2400×2000 PNG export"
        accent={ACCENT_RAW}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 300, sm: 380, md: 420 },
            borderRadius: 1.75,
            overflow: 'hidden',
            border: `1px solid ${rgba(accent, 0.42)}`,
            bgcolor: '#0C0E14',
          }}
        >
          <canvas
            ref={canvasRef}
            aria-label="Interactive POD mockup compositor preview"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.71rem', color: 'text.secondary' }}>
            Export renders clean borderless 2400×2000 PNG (exceeds Etsy 2026 2000px floor).
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExportPng}
            sx={{
              minHeight: 44,
              fontFamily: MONO,
              fontSize: '0.73rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: isDark ? SOV.gold : '#B8860B',
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            Download Composited .PNG
          </Button>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="ETSY 2026 PHOTO STANDARDS & 20 MB ZIP SPLITTER"
        title="Compliance Auditor & Multi-ZIP Bin Plan"
        subtitle="Verifies >=2000px shortest side, 4:3 & 5:4 thumbnail crop safety, and Etsy 5×20 MB digital download ZIP limits"
        accent={SOV.emerald}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
          <SovereignGauge
            value={packAnalysis.complianceScore}
            max={100}
            label="ETSY 2026"
            unit="%"
            status={packAnalysis.complianceScore >= 85 ? 'COMPLIANT' : 'REVIEW'}
            thresholds={{ warn: 80, danger: 60 }}
            invertThresholds
          />
          <Box sx={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            {[
              {
                ok: packAnalysis.min2000Ok,
                text: `Shortest side: ${packAnalysis.shortestSide}px (Etsy 2026 minimum >= 2000px)`,
              },
              {
                ok: true,
                text: `Mockup 2400×2000 thumbnail crop loss: ${packAnalysis.cropLoss4x3Pct}% on 4:3 · ${packAnalysis.cropLoss5x4Pct}% on 5:4`,
              },
              {
                ok: packAnalysis.etsyZipOk,
                text: `ZIP split plan: ${packAnalysis.zips.length}/5 archives (max 20 MB per Etsy digital file)`,
              },
              {
                ok: packAnalysis.dpiOk,
                text: `Print density: ${targetDpi} DPI (${packAnalysis.passCount}/${packAnalysis.files.length} ratios zero-upscale)`,
              },
            ].map((chk, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                {chk.ok ? (
                  <CheckCircleOutlineIcon sx={{ fontSize: 16, color: SOV.emerald, mt: 0.15, flexShrink: 0 }} />
                ) : (
                  <WarningAmberIcon sx={{ fontSize: 16, color: SOV.amber, mt: 0.15, flexShrink: 0 }} />
                )}
                <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', lineHeight: 1.4 }}>
                  {chk.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <SovereignKeyValueGrid
          cols={2}
          accent={SOV.cyber}
          items={packAnalysis.zips.map((z) => ({
            label: z.archive,
            value: `Ratios: ${z.files.join(', ')} (${z.totalMb} MB / 20 MB)`,
            badge: z.totalMb <= 20 ? 'PASS' : 'SPLIT',
          }))}
        />
      </SovereignCard>
    </Box>
  );

  const bottomPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow="300 DPI MULTI-RATIO WALL ART PACK CALCULATOR"
        title={`5-Ratio Print Pack Matrix (${targetDpi} DPI · JPEG ${jpegQuality}%)`}
        filename={`wall-art-pack-${targetDpi}dpi.csv`}
        accent={ACCENT_RAW}
        maxHeight={340}
        columns={[
          { key: 'ratio', label: 'Ratio', mono: true },
          { key: 'label', label: 'Pack Slot' },
          { key: 'pixels', label: 'Pixel Dimensions', mono: true },
          { key: 'printSize', label: 'Max Print (in / cm)', mono: true },
          { key: 'rawMb', label: 'Raw RGB', mono: true, align: 'right' },
          { key: 'jpegMb', label: 'Est. JPEG', mono: true, align: 'right' },
          { key: 'status', label: 'Upscale' },
        ]}
        rows={packAnalysis.files}
      />

      <SovereignCard
        index="05"
        eyebrow="PRINT-PACK MANIFEST & LOCAL FORGE DAEMONS (:8119 / :8118)"
        title="Downloadable print-pack-spec.json"
        subtitle="Full machine-readable manifest for automated 300 DPI batch rendering via pod-mockup-forge & digital-asset-forge"
        accent={ACCENT_RAW}
      >
        <SovereignCodeBlock
          title="print-pack-spec.json"
          badge="JSON"
          code={specJsonString}
          filename="print-pack-spec.json"
          accent={ACCENT_RAW}
          maxHeight={260}
        />
        <Box sx={{ mt: 1.5 }}>
          <SovereignCodeBlock
            title="LOCAL FORGE COMPANIONS (:8119 / :8118)"
            badge="CLI"
            code={`# POD Mockup Forge local server (port 8119)\ncd ~/NullAITech/pod-mockup-forge && python3 server.py --port 8119\npod-mockup-forge status\n\n# Digital Asset Forge 300 DPI batch zipper (port 8118)\ncd ~/NullAITech/digital-asset-forge && python3 server.py --port 8118\ndigital-asset-forge status`}
            filename="pod-mockup-commands.sh"
            accent={SOV.cyber}
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · 100% Client-Side Canvas Mockup Compositor & 300 DPI Pack Planner"
          message="Uploaded PNG/JPG artwork is read via browser FileReader and composited on a local HTML5 Canvas (zero files leave your device). Export 2400×2000 PNG mockups and print-pack-spec.json directly here, or run batch 300 DPI multi-ZIP rendering locally on pod-mockup-forge (:8119) and digital-asset-forge (:8118)."
        />
      </Box>
      <SovereignWorkstationShell
        id="pod-mockup-forge"
        category="COMMERCE & POD · DIGITAL ASSET FORGE (:8119 / :8118)"
        title="POD Mockup Studio & 300 DPI Print Pack Forge"
        subtitle="Interactive DPR-aware HTML5 Canvas mockup compositor for framed wall art and heavyweight apparel, paired with a 300 DPI multi-ratio wall art calculator, Etsy 20 MB ZIP splitter, and 2026 photo standards auditor."
        version="2.5.0"
        variant="bayer-field"
        accent={ACCENT_RAW}
        metrics={kpis}
        status={statusNode}
        actions={actions}
        leftPane={leftPane}
        rightPane={rightPane}
        bottomPane={bottomPane}
        leftCols={5}
        rightCols={7}
      />
    </Box>
  );
}
