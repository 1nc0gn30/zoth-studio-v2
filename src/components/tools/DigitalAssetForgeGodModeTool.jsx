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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import DescriptionIcon from '@mui/icons-material/Description';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignAlertBanner,
  SovereignCodeBlock,
  SovereignPresetBar,
  SovereignGauge,
  SovereignDataTable,
  SovereignKeyValueGrid,
  useCopy,
  downloadJson,
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = SOV.gold;

const FINE_ART_PRESETS = [
  {
    id: 'terracotta-arch',
    label: 'Mid-Century Terracotta Arch',
    badge: 'Warm Japandi',
    palette: ['#F4EDE2', '#C55A38', '#D9A441', '#1B1D22'],
  },
  {
    id: 'ink-horizon',
    label: 'Minimalist Ink Horizon',
    badge: 'Sumi-e Paper',
    palette: ['#EFECE4', '#1F2329', '#5A616C', '#B89456'],
  },
  {
    id: 'botanical-gold',
    label: 'Botanical Gold Geometry',
    badge: 'Noir & Foil',
    palette: ['#10141D', '#D4AF37', '#F2DF9B', '#2E4F46'],
  },
];

const MAT_COLORS = [
  { id: 'ivory', label: 'Archival Ivory', hex: '#FAF7F0' },
  { id: 'linen', label: 'Warm Linen', hex: '#F1EADF' },
  { id: 'white', label: 'Gallery White', hex: '#FFFFFF' },
  { id: 'obsidian', label: 'Obsidian Mat', hex: '#14161D' },
];

const PRINT_RATIOS = [
  {
    id: '2x3',
    ratio: '2:3',
    label: '2:3 Classic Tall',
    shortCode: '2x3',
    inchesW: 24,
    inchesH: 36,
    aspect: 2 / 3,
    frameSizes: '4×6", 8×12", 12×18", 16×24", 20×30", 24×36"',
    cmSizes: '10×15, 20×30, 30×45, 40×60, 60×90 cm',
    exportW: 2400,
    exportH: 3600,
  },
  {
    id: '3x4',
    ratio: '3:4',
    label: '3:4 Gallery Vertical',
    shortCode: '3x4',
    inchesW: 18,
    inchesH: 24,
    aspect: 3 / 4,
    frameSizes: '6×8", 9×12", 12×16", 15×20", 18×24"',
    cmSizes: '15×20, 22×30, 30×40, 45×60 cm',
    exportW: 2700,
    exportH: 3600,
  },
  {
    id: '4x5',
    ratio: '4:5',
    label: '4:5 Portrait Standard',
    shortCode: '4x5',
    inchesW: 16,
    inchesH: 20,
    aspect: 4 / 5,
    frameSizes: '4×5", 8×10", 12×15", 16×20"',
    cmSizes: '10×12.5, 20×25, 30×38, 40×50 cm',
    exportW: 2880,
    exportH: 3600,
  },
  {
    id: '11x14',
    ratio: '11:14',
    label: '11:14 Frame Favorite',
    shortCode: '11x14',
    inchesW: 11,
    inchesH: 14,
    aspect: 11 / 14,
    frameSizes: '11×14" exact frame ratio',
    cmSizes: '27.9×35.6 cm exact standard',
    exportW: 3300,
    exportH: 4200,
  },
  {
    id: 'iso-a',
    ratio: 'ISO A-Series',
    label: 'ISO A-Series (A1/A2/A3/A4)',
    shortCode: 'ISO-A',
    inchesW: 16.54,
    inchesH: 23.39,
    aspect: 1 / Math.SQRT2,
    frameSizes: 'A5, A4, A3, A2, A1 (1:√2 international)',
    cmSizes: '14.8×21, 21×29.7, 29.7×42, 42×59.4, 59.4×84.1 cm',
    exportW: 2546,
    exportH: 3600,
  },
];

function drawFineArtPreset(ctx, x, y, w, h, presetId) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (presetId === 'terracotta-arch') {
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, '#F6F0E6');
    bg.addColorStop(1, '#EADFD0');
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);

    // Subtle archival linen grain lines
    ctx.fillStyle = 'rgba(148, 121, 90, 0.08)';
    for (let i = 0; i < 32; i += 1) {
      ctx.fillRect(x, y + (h / 32) * i, w, Math.max(1, h * 0.0012));
    }

    // Warm ochre sun orb
    ctx.fillStyle = '#D9A441';
    ctx.beginPath();
    ctx.arc(x + w * 0.65, y + h * 0.24, Math.min(w, h) * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Primary terracotta mid-century arch
    ctx.fillStyle = '#C55A38';
    const archR = w * 0.31;
    ctx.beginPath();
    ctx.arc(x + w * 0.46, y + h * 0.54, archR, Math.PI, 0, false);
    ctx.lineTo(x + w * 0.46 + archR, y + h * 0.87);
    ctx.lineTo(x + w * 0.46 - archR, y + h * 0.87);
    ctx.closePath();
    ctx.fill();

    // Deep obsidian inner portal
    ctx.fillStyle = '#1B1D22';
    const innerR = w * 0.135;
    ctx.beginPath();
    ctx.arc(x + w * 0.54, y + h * 0.63, innerR, Math.PI, 0, false);
    ctx.lineTo(x + w * 0.54 + innerR, y + h * 0.87);
    ctx.lineTo(x + w * 0.54 - innerR, y + h * 0.87);
    ctx.closePath();
    ctx.fill();

    // Crisp architectural baseline & counterpoint arc
    ctx.strokeStyle = '#1B1D22';
    ctx.lineWidth = Math.max(1.5, w * 0.005);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.11, y + h * 0.87);
    ctx.lineTo(x + w * 0.89, y + h * 0.87);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(27,29,34,0.45)';
    ctx.lineWidth = Math.max(1, w * 0.003);
    ctx.beginPath();
    ctx.arc(x + w * 0.65, y + h * 0.24, Math.min(w, h) * 0.21, -0.35 * Math.PI, 0.72 * Math.PI);
    ctx.stroke();
  } else if (presetId === 'ink-horizon') {
    const bg = ctx.createLinearGradient(x, y, x, y + h);
    bg.addColorStop(0, '#F3F0E8');
    bg.addColorStop(0.65, '#E7E2D6');
    bg.addColorStop(1, '#DCD5C6');
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);

    // Muted bronze moon
    ctx.fillStyle = '#B89456';
    ctx.beginPath();
    ctx.arc(x + w * 0.32, y + h * 0.26, Math.min(w, h) * 0.11, 0, Math.PI * 2);
    ctx.fill();

    // Distant sumi-e ink ridge
    ctx.fillStyle = 'rgba(42, 47, 56, 0.34)';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.6);
    ctx.bezierCurveTo(x + w * 0.25, y + h * 0.45, x + w * 0.55, y + h * 0.52, x + w, y + h * 0.44);
    ctx.lineTo(x + w, y + h * 0.72);
    ctx.lineTo(x, y + h * 0.72);
    ctx.closePath();
    ctx.fill();

    // Foreground brushed ink mountain mass
    ctx.fillStyle = '#1E2228';
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.67);
    ctx.bezierCurveTo(x + w * 0.22, y + h * 0.56, x + w * 0.46, y + h * 0.65, x + w * 0.7, y + h * 0.53);
    ctx.bezierCurveTo(x + w * 0.84, y + h * 0.47, x + w * 0.93, y + h * 0.56, x + w, y + h * 0.62);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // Water reflection mist lines
    ctx.fillStyle = 'rgba(243, 240, 232, 0.24)';
    for (let i = 0; i < 6; i += 1) {
      const ly = y + h * (0.76 + i * 0.035);
      const inset = w * (0.08 + i * 0.05);
      ctx.fillRect(x + inset, ly, w - inset * 2, Math.max(1.2, h * 0.003));
    }

    // Minimalist red-ochre seal chop mark
    const sealSize = Math.min(w, h) * 0.045;
    ctx.fillStyle = '#A83F2B';
    ctx.fillRect(x + w * 0.82, y + h * 0.14, sealSize, sealSize * 1.25);
  } else {
    // Botanical Gold Geometry
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, '#0E121B');
    bg.addColorStop(1, '#19222C');
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);

    const cx = x + w * 0.5;
    const cy = y + h * 0.49;
    const radius = Math.min(w, h) * 0.34;

    // Fine metallic gold outer double border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.62)';
    ctx.lineWidth = Math.max(1.2, w * 0.0035);
    ctx.strokeRect(x + w * 0.08, y + h * 0.07, w * 0.84, h * 0.86);

    // Sacred geometry concentric rings & diamond
    [1, 0.72].forEach((m, idx) => {
      ctx.strokeStyle = idx === 0 ? '#D4AF37' : 'rgba(242, 223, 155, 0.45)';
      ctx.lineWidth = Math.max(1.2, w * (idx === 0 ? 0.005 : 0.0028));
      ctx.beginPath();
      ctx.arc(cx, cy, radius * m, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius * 1.18);
    ctx.lineTo(cx + radius * 0.78, cy);
    ctx.lineTo(cx, cy + radius * 1.18);
    ctx.lineTo(cx - radius * 0.78, cy);
    ctx.closePath();
    ctx.stroke();

    // Stylized botanical stem & gold-veined leaves
    ctx.strokeStyle = '#F2DF9B';
    ctx.lineWidth = Math.max(1.8, w * 0.0055);
    ctx.beginPath();
    ctx.moveTo(cx, y + h * 0.83);
    ctx.quadraticCurveTo(cx - w * 0.03, cy, cx + w * 0.02, y + h * 0.19);
    ctx.stroke();

    const leafPairs = [
      { t: 0.72, s: 1.0 },
      { t: 0.58, s: 0.92 },
      { t: 0.45, s: 0.78 },
      { t: 0.33, s: 0.6 },
    ];
    leafPairs.forEach((lp) => {
      const ly = y + h * lp.t;
      const lw = radius * 0.44 * lp.s;
      const lh = radius * 0.16 * lp.s;
      [-1, 1].forEach((dir) => {
        ctx.save();
        ctx.translate(cx, ly);
        ctx.rotate(dir * -0.42);
        ctx.fillStyle = dir === -1 ? 'rgba(46, 79, 70, 0.92)' : 'rgba(212, 175, 55, 0.85)';
        ctx.beginPath();
        ctx.ellipse(dir * lw * 0.56, 0, lw * 0.52, lh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#F2DF9B';
        ctx.lineWidth = Math.max(0.8, w * 0.0022);
        ctx.stroke();
        ctx.restore();
      });
    });
  }

  ctx.restore();
}

function renderRatioArtwork(ctx, targetW, targetH, opts) {
  const { uploadedImg, presetId, fitMode, matBorderPct, matHex, bleedIn, inchesW, showGuides } = opts;

  // Fill archival mat / paper base
  ctx.fillStyle = matHex || '#FAF7F0';
  ctx.fillRect(0, 0, targetW, targetH);

  const marginPx = fitMode === 'mat' ? Math.round(Math.min(targetW, targetH) * (matBorderPct / 100)) : 0;
  const boxX = marginPx;
  const boxY = marginPx;
  const boxW = Math.max(16, targetW - marginPx * 2);
  const boxH = Math.max(16, targetH - marginPx * 2);

  if (uploadedImg && uploadedImg.naturalWidth > 0 && uploadedImg.naturalHeight > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    const imgAspect = uploadedImg.naturalWidth / uploadedImg.naturalHeight;
    const boxAspect = boxW / boxH;
    let drawW = boxW;
    let drawH = boxH;
    let dx = boxX;
    let dy = boxY;

    if (fitMode === 'crop') {
      // Cover (crop-to-fill)
      if (imgAspect > boxAspect) {
        drawH = boxH;
        drawW = boxH * imgAspect;
        dx = boxX - (drawW - boxW) * 0.5;
      } else {
        drawW = boxW;
        drawH = boxW / imgAspect;
        dy = boxY - (drawH - boxH) * 0.5;
      }
    } else {
      // Contain inside mat aperture
      if (imgAspect > boxAspect) {
        drawW = boxW;
        drawH = boxW / imgAspect;
        dy = boxY + (boxH - drawH) * 0.5;
      } else {
        drawH = boxH;
        drawW = boxH * imgAspect;
        dx = boxX + (boxW - drawW) * 0.5;
      }
    }
    ctx.drawImage(uploadedImg, dx, dy, drawW, drawH);
    ctx.restore();
  } else {
    drawFineArtPreset(ctx, boxX, boxY, boxW, boxH, presetId);
  }

  // Subtle recessed hairline around mat aperture if mat is active
  if (fitMode === 'mat' && marginPx > 2) {
    ctx.strokeStyle = matHex === '#14161D' ? 'rgba(255,255,255,0.14)' : 'rgba(16,24,40,0.14)';
    ctx.lineWidth = Math.max(1, targetW * 0.0015);
    ctx.strokeRect(boxX, boxY, boxW, boxH);
  }

  // Optional live preview print bleed guides (never drawn on exported PNG)
  if (showGuides && bleedIn > 0) {
    const bleedPx = Math.max(3, (bleedIn / inchesW) * targetW);
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(bleedPx, bleedPx, targetW - bleedPx * 2, targetH - bleedPx * 2);
    ctx.restore();
  }
}

export default function DigitalAssetForgeGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Synthesizer Controls
  const [presetId, setPresetId] = useState(FINE_ART_PRESETS[0].id);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [uploadMeta, setUploadMeta] = useState(null);
  const [activeRatioId, setActiveRatioId] = useState(PRINT_RATIOS[0].id);
  const [fitMode, setFitMode] = useState('crop');
  const [matBorderPct, setMatBorderPct] = useState(10);
  const [matColorId, setMatColorId] = useState('ivory');
  const [bleedIn, setBleedIn] = useState(0.125);
  const [exportScaleMode, setExportScaleMode] = useState('high');
  const [lastExportNote, setLastExportNote] = useState('');

  // Pack Planner & Print Guide Controls
  const [packTitle, setPackTitle] = useState('Mid-Century Terracotta Arch Gallery Set');
  const [shopName, setShopName] = useState('NullAI Atelier');
  const [paperSpec, setPaperSpec] = useState('230–310 gsm Archival Matte or Cotton Rag (Acid-Free)');
  const [targetDpi, setTargetDpi] = useState(300);
  const [jpegQuality, setJpegQuality] = useState(92);
  const [retailPrice, setRetailPrice] = useState(11.99);
  const [monthlySales, setMonthlySales] = useState(180);
  const [guideTab, setGuideTab] = useState('markdown');

  const activeRatio = useMemo(
    () => PRINT_RATIOS.find((r) => r.id === activeRatioId) || PRINT_RATIOS[0],
    [activeRatioId],
  );
  const matColor = useMemo(
    () => MAT_COLORS.find((c) => c.id === matColorId) || MAT_COLORS[0],
    [matColorId],
  );

  // Live DPR-Aware Preview Canvas (draws active hero frame + 5-ratio silhouette strip)
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 620;
      const cssH = canvas.clientHeight || 440;
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Studio matboard backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, cssH);
      if (isDark) {
        bgGrad.addColorStop(0, '#13161E');
        bgGrad.addColorStop(1, '#0A0C12');
      } else {
        bgGrad.addColorStop(0, '#EDE7DC');
        bgGrad.addColorStop(1, '#DDD4C5');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cssW, cssH);

      // Subtle architectural grid
      ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.06)' : 'rgba(16,24,40,0.05)';
      ctx.lineWidth = 1;
      for (let gx = 24; gx < cssW; gx += 28) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, cssH);
        ctx.stroke();
      }
      for (let gy = 24; gy < cssH; gy += 28) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cssW, gy);
        ctx.stroke();
      }

      // Compute hero frame size for activeRatio inside upper 74% of canvas
      const topPad = 36;
      const stripH = 82;
      const availH = cssH - topPad - stripH - 22;
      const availW = cssW - 48;
      let frameH = availH;
      let frameW = frameH * activeRatio.aspect;
      if (frameW > availW) {
        frameW = availW;
        frameH = frameW / activeRatio.aspect;
      }
      const fx = (cssW - frameW) * 0.5;
      const fy = topPad + (availH - frameH) * 0.5;

      // Gallery drop shadow
      ctx.save();
      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.62)' : 'rgba(16,24,40,0.24)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = matColor.hex;
      ctx.fillRect(fx, fy, frameW, frameH);
      ctx.restore();

      // Render active ratio artwork inside frame
      ctx.save();
      ctx.translate(fx, fy);
      renderRatioArtwork(ctx, frameW, frameH, {
        uploadedImg,
        presetId,
        fitMode,
        matBorderPct,
        matHex: matColor.hex,
        bleedIn,
        inchesW: activeRatio.inchesW,
        showGuides: true,
      });
      ctx.restore();

      // Crisp gallery frame hairline
      ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.45)' : 'rgba(16,24,40,0.28)';
      ctx.lineWidth = 1.25;
      ctx.strokeRect(fx, fy, frameW, frameH);

      // Bottom 5-ratio mini preview strip
      const stripY = cssH - stripH + 6;
      const slotW = (cssW - 36) / PRINT_RATIOS.length;
      PRINT_RATIOS.forEach((r, idx) => {
        const thumbMaxH = 50;
        const thumbW = thumbMaxH * r.aspect;
        const tx = 18 + idx * slotW + (slotW - thumbW) * 0.5;
        const ty = stripY;
        const isSelected = r.id === activeRatio.id;

        ctx.save();
        ctx.translate(tx, ty);
        renderRatioArtwork(ctx, thumbW, thumbMaxH, {
          uploadedImg,
          presetId,
          fitMode,
          matBorderPct,
          matHex: matColor.hex,
          bleedIn: 0,
          inchesW: r.inchesW,
          showGuides: false,
        });
        ctx.restore();

        ctx.strokeStyle = isSelected ? '#D4AF37' : isDark ? 'rgba(255,255,255,0.22)' : 'rgba(16,24,40,0.24)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(tx, ty, thumbW, thumbMaxH);

        ctx.fillStyle = isSelected ? (isDark ? '#F5E6AB' : '#8A6300') : isDark ? 'rgba(245,241,230,0.72)' : 'rgba(16,24,40,0.7)';
        ctx.font = `${isSelected ? '700' : '500'} 10px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(r.shortCode, tx + thumbW * 0.5, ty + thumbMaxH + 13);
      });

      // Top HUD
      ctx.textAlign = 'left';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = isDark ? 'rgba(245,241,230,0.82)' : 'rgba(16,24,40,0.78)';
      const exactW = Math.round(activeRatio.inchesW * targetDpi);
      const exactH = Math.round(activeRatio.inchesH * targetDpi);
      ctx.fillText(
        `ACTIVE RATIO ${activeRatio.ratio} · ${exactW}×${exactH} PX @ ${targetDpi} DPI · ${fitMode === 'crop' ? 'CROP-TO-FILL' : `FIT + ${matBorderPct}% MAT`}${bleedIn > 0 ? ` · ${bleedIn}" BLEED` : ''}`,
        14,
        21,
      );
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [isDark, activeRatio, uploadedImg, presetId, fitMode, matBorderPct, matColor, bleedIn, targetDpi]);

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
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Real client-side high-res PNG synthesizer & download for ANY ratio
  const handleDownloadRatioPng = (ratioObj) => {
    if (typeof document === 'undefined') return;
    const r = ratioObj || activeRatio;
    // Scale factor: 'high' exports crisp high-res print PNG (2400–3600px, safe across all browsers);
    // 'master300' exports exact 300 DPI for 11:14/4:5/3:4/ISO and 4800px-capped ultra-high for 24x36.
    const rawW = Math.round(r.inchesW * targetDpi);
    const rawH = Math.round(r.inchesH * targetDpi);
    let outW = r.exportW;
    let outH = r.exportH;
    if (exportScaleMode === 'master300') {
      const maxEdge = 5400;
      const scale = Math.min(1, maxEdge / Math.max(rawW, rawH));
      outW = Math.round(rawW * scale);
      outH = Math.round(rawH * scale);
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outW;
    exportCanvas.height = outH;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    renderRatioArtwork(ctx, outW, outH, {
      uploadedImg,
      presetId,
      fitMode,
      matBorderPct,
      matHex: matColor.hex,
      bleedIn: 0,
      inchesW: r.inchesW,
      showGuides: false,
    });

    const slug = (packTitle || 'wall-art')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) || 'wall-art';
    const filename = `${slug}-${r.shortCode}-${outW}x${outH}px-${targetDpi}dpi.png`;

    if (exportCanvas.toBlob) {
      exportCanvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } else {
      const dataUrl = exportCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setLastExportNote(`Exported ${r.ratio} PNG (${outW}×${outH} px)`);
  };

  // 300 DPI Pixel Matrices + Etsy <=20 MB Multi-ZIP Partitioning + 98%-Margin Profit Economics
  const packData = useMemo(() => {
    const dpi = Math.max(150, Number(targetDpi) || 300);
    const q = Math.min(100, Math.max(70, Number(jpegQuality) || 92));
    const jpegFactor = q >= 95 ? 0.14 : q >= 90 ? 0.092 : q >= 85 ? 0.065 : 0.048;
    const pngFactor = 0.34;
    const srcW = uploadMeta ? uploadMeta.width : 5400;
    const srcH = uploadMeta ? uploadMeta.height : 7200;

    const matrix = PRINT_RATIOS.map((r) => {
      const pxW = Math.round(r.inchesW * dpi);
      const pxH = Math.round(r.inchesH * dpi);
      const rawRgbMb = (pxW * pxH * 3) / (1024 * 1024);
      const estJpegMb = Math.max(0.8, rawRgbMb * jpegFactor);
      const estPngMb = Math.max(2.1, rawRgbMb * pngFactor);
      const upscaleRatio = Math.max(pxW / srcW, pxH / srcH);
      const sourceReadiness = !uploadMeta || upscaleRatio <= 1.05 ? 'PASS' : upscaleRatio <= 1.35 ? 'WARN' : 'FAIL';

      return {
        id: r.id,
        ratio: r.ratio,
        shortCode: r.shortCode,
        label: r.label,
        dimensions: `${pxW} × ${pxH} px`,
        pxW,
        pxH,
        maxPrint: `${r.inchesW}×${r.inchesH}"`,
        frameSizes: r.frameSizes,
        cmSizes: r.cmSizes,
        rawMb: `${rawRgbMb.toFixed(1)} MB`,
        jpegMb: `${estJpegMb.toFixed(2)} MB`,
        pngMb: `${estPngMb.toFixed(1)} MB`,
        estJpegMbNum: Number(estJpegMb.toFixed(2)),
        estPngMbNum: Number(estPngMb.toFixed(1)),
        status: sourceReadiness,
      };
    });

    // Bin-pack 300 DPI JPEGs into <= 19.2 MB ZIP archives (Etsy 20 MB per file, max 5 files)
    const ZIP_CAP_MB = 19.2;
    const bins = [];
    const sorted = [...matrix].sort((a, b) => b.estJpegMbNum - a.estJpegMbNum);
    sorted.forEach((item) => {
      const found = bins.find((b) => b.totalMb + item.estJpegMbNum <= ZIP_CAP_MB);
      if (found) {
        found.items.push(item);
        found.totalMb = Number((found.totalMb + item.estJpegMbNum).toFixed(2));
      } else {
        bins.push({
          items: [item],
          totalMb: Number(item.estJpegMbNum.toFixed(2)),
        });
      }
    });

    const zipBundles = bins.map((b, idx) => {
      const codes = b.items.map((i) => i.shortCode);
      const archiveName = `Pack-${idx + 1}-${codes.join('-and-')}.zip`;
      return {
        id: `zip-${idx + 1}`,
        archive: archiveName,
        ratiosIncluded: b.items.map((i) => i.ratio).join(' + '),
        fileCount: `${b.items.length} prints + Guide`,
        estSize: `${b.totalMb.toFixed(2)} MB`,
        headroom: `${(20 - b.totalMb).toFixed(2)} MB free`,
        status: b.totalMb <= 20 ? 'PASS' : 'FAIL',
      };
    });

    const totalJpegMb = Number(matrix.reduce((s, m) => s + m.estJpegMbNum, 0).toFixed(2));
    const etsyCompliant = zipBundles.length <= 5 && zipBundles.every((z) => z.status === 'PASS');

    // Digital Download Profit Breakdown (Zero COGS, Zero Shipping)
    const p = Math.max(0.99, Number(retailPrice) || 11.99);
    const vol = Math.max(1, Number(monthlySales) || 180);
    const etsyListingFee = 0.2;
    const etsyTxnFee = p * 0.065;
    const etsyPayFee = p * 0.03 + 0.25;
    const etsyTotalFee = etsyListingFee + etsyTxnFee + etsyPayFee;
    const etsyNet = p - etsyTotalFee;
    const etsyNetMarginPct = (etsyNet / p) * 100;

    const offsiteFee = etsyTotalFee + p * 0.15;
    const offsiteNet = p - offsiteFee;
    const offsiteMarginPct = (offsiteNet / p) * 100;

    const directStripeFee = p * 0.029 + 0.3;
    const directNet = p - directStripeFee;
    const directMarginPct = (directNet / p) * 100;

    const profitRows = [
      {
        id: 'gross-digital',
        channel: 'Digital Product Gross (Zero COGS / Zero Shipping)',
        fees: '$0.00 COGS · $0.00 Ship',
        netUnit: `$${p.toFixed(2)}`,
        margin: '100.0%',
        monthlyNet: `$${(p * vol).toFixed(0)}`,
        status: 'PASS',
      },
      {
        id: 'etsy-organic',
        channel: 'Etsy Organic Digital Download ($0.20 + 6.5% + 3%+$0.25)',
        fees: `$${etsyTotalFee.toFixed(2)}`,
        netUnit: `$${etsyNet.toFixed(2)}`,
        margin: `${etsyNetMarginPct.toFixed(1)}%`,
        monthlyNet: `$${(etsyNet * vol).toFixed(0)}`,
        status: etsyNetMarginPct >= 80 ? 'PASS' : 'WARN',
      },
      {
        id: 'etsy-offsite',
        channel: 'Etsy Offsite Ads Digital (+15% Attribution)',
        fees: `$${offsiteFee.toFixed(2)}`,
        netUnit: `$${offsiteNet.toFixed(2)}`,
        margin: `${offsiteMarginPct.toFixed(1)}%`,
        monthlyNet: `$${(offsiteNet * vol).toFixed(0)}`,
        status: offsiteMarginPct >= 65 ? 'PASS' : 'WARN',
      },
      {
        id: 'direct-shopify',
        channel: 'Direct Shopify / Stripe Digital (2.9% + $0.30)',
        fees: `$${directStripeFee.toFixed(2)}`,
        netUnit: `$${directNet.toFixed(2)}`,
        margin: `${directMarginPct.toFixed(1)}%`,
        monthlyNet: `$${(directNet * vol).toFixed(0)}`,
        status: 'PASS',
      },
    ];

    return {
      matrix,
      zipBundles,
      totalJpegMb,
      etsyCompliant,
      etsyTotalFee,
      etsyNet,
      etsyNetMarginPct,
      directMarginPct,
      profitRows,
    };
  }, [targetDpi, jpegQuality, uploadMeta, retailPrice, monthlySales]);

  // Buyer Printing Guide Generator (Markdown + Plain Text)
  const buyerGuide = useMemo(() => {
    const title = packTitle.trim() || 'Digital Wall Art Pack';
    const shop = shopName.trim() || 'NullAI Atelier';
    const paper = paperSpec.trim() || '230–310 gsm Archival Matte Paper';
    const ratioLinesMd = packData.matrix
      .map(
        (m) =>
          `- **${m.ratio}** (\`${m.dimensions}\` @ ${targetDpi} DPI) — Prints up to **${m.maxPrint}**: ${m.frameSizes} _(${m.cmSizes})_`,
      )
      .join('\n');

    const zipLinesMd = packData.zipBundles
      .map((z) => `- \`${z.archive}\` — Contains **${z.ratiosIncluded}** (${z.estSize})`)
      .join('\n');

    const md = `# ${title} — Buyer Printing & Framing Guide

Thank you for supporting **${shop}**! Your download includes **5 high-resolution ${targetDpi} DPI sRGB print files** engineered to fit over 20 international & US standard frames with zero distortion or cropping loss.

## 1. Included Print Ratios & Frame Size Chart
${ratioLinesMd}

## 2. ZIP Download Bundles (Etsy <= 20 MB Compliant)
${zipLinesMd}

## 3. Recommended Paper & Print Settings
- **Color Profile**: sRGB IEC61966-2.1 (calibrated for professional giclée & photo labs)
- **Resolution**: ${targetDpi} DPI (print at **100% / Actual Size** — do not select "Scale to Fit" if printing exact mat borders)
- **Paper Stock**: ${paper}
- **Bleed / Border Setting**: ${fitMode === 'crop' ? 'Full-bleed Crop-to-Fill edge-to-edge artwork' : `Built-in ${matBorderPct}% ${matColor.label} gallery mat border`}

## 4. Where to Print
1. **Local Print Shops**: FedEx Office, Staples, Office Depot, or local archival framing studios (ask for matte heavyweight cardstock or giclée fine-art stock).
2. **Online Fine-Art Labs**: Mpix, Printique, FinerWorks, Gelato, or Nations Photo Lab.
3. **At Home**: Use pigment ink on matte photo paper with printer quality set to *Best / High Resolution*.

## 5. License & Support
- Licensed for **personal display and gifting**. Commercial resale or redistribution of digital source files is not permitted.
- Need a custom aspect ratio? Message **${shop}** directly through your order receipt and we will prepare a tailored crop free of charge.
`;

    const txt = md
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .replace(/_/g, '');

    return { md, txt };
  }, [packTitle, shopName, paperSpec, packData, targetDpi, fitMode, matBorderPct, matColor]);

  // Downloadable digital-pack-manifest.json
  const packManifest = useMemo(
    () => ({
      schema: 'zoth.digital_asset_forge.pack_manifest.v2',
      pack_title: packTitle.trim() || 'Digital Wall Art Pack',
      shop_name: shopName.trim() || 'NullAI Atelier',
      artwork_source: uploadMeta ? uploadMeta.name : `preset:${presetId}`,
      dpi: targetDpi,
      jpeg_quality: jpegQuality,
      layout: {
        fit_mode: fitMode,
        mat_border_pct: fitMode === 'mat' ? matBorderPct : 0,
        mat_color: matColor.hex,
        bleed_inches: bleedIn,
      },
      ratios: packData.matrix.map((m) => ({
        ratio: m.ratio,
        pixels: `${m.pxW}x${m.pxH}`,
        max_print: m.maxPrint,
        compatible_frames: m.frameSizes,
        est_jpeg_mb: m.estJpegMbNum,
        est_png_mb: m.estPngMbNum,
      })),
      etsy_zip_bundles: packData.zipBundles,
      economics: {
        retail_price_usd: Number(retailPrice),
        cogs_usd: 0,
        shipping_usd: 0,
        etsy_fees_usd: Number(packData.etsyTotalFee.toFixed(2)),
        etsy_net_profit_usd: Number(packData.etsyNet.toFixed(2)),
        etsy_net_margin_pct: Number(packData.etsyNetMarginPct.toFixed(1)),
        direct_net_margin_pct: Number(packData.directMarginPct.toFixed(1)),
      },
    }),
    [
      packTitle,
      shopName,
      uploadMeta,
      presetId,
      targetDpi,
      jpegQuality,
      fitMode,
      matBorderPct,
      matColor,
      bleedIn,
      packData,
      retailPrice,
    ],
  );

  const kpis = [
    {
      label: 'Ratios Synthesized',
      value: '5 / 5',
      unit: '2:3 · 3:4 · 4:5 · 11:14 · ISO',
      accent: SOV.gold,
    },
    {
      label: 'Etsy ZIP Bundles',
      value: `${packData.zipBundles.length} ZIPs`,
      unit: `${packData.totalJpegMb} MB total (<=20 MB cap)`,
      accent: packData.etsyCompliant ? SOV.emerald : '#EF4444',
    },
    {
      label: 'Digital Net Margin',
      value: `${packData.etsyNetMarginPct.toFixed(1)}%`,
      unit: `${packData.directMarginPct.toFixed(1)}% direct · $0 COGS`,
      accent: SOV.emerald,
    },
    {
      label: 'Active Frame',
      value: activeRatio.ratio,
      unit: `${Math.round(activeRatio.inchesW * targetDpi)}×${Math.round(activeRatio.inchesH * targetDpi)} px`,
      accent: SOV.cyber,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={packData.etsyCompliant ? 'online' : 'warn'}
        label={
          lastExportNote
            ? `${lastExportNote.toUpperCase()} · ${packData.zipBundles.length} ETSY ZIPS READY`
            : `${targetDpi} DPI SYNTHESIZER · ${packData.zipBundles.length} ETSY <=20MB ZIPS · ${packData.etsyNetMarginPct.toFixed(1)}% NET MARGIN`
        }
        accent={ACCENT_RAW}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: `Download ${activeRatio.ratio} High-Res PNG`,
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => handleDownloadRatioPng(activeRatio),
      primary: true,
    },
    {
      label: 'Download PRINTING_GUIDE.md',
      icon: <DescriptionIcon fontSize="small" />,
      onClick: () => downloadText(buyerGuide.md, 'PRINTING_GUIDE.md', 'text/markdown;charset=utf-8'),
    },
    {
      label: 'Download digital-pack-manifest.json',
      icon: <FolderZipIcon fontSize="small" />,
      onClick: () => downloadJson(packManifest, 'digital-pack-manifest.json'),
    },
    {
      label: 'digital-asset-forge on GitHub',
      icon: <GitHubIcon fontSize="small" />,
      href: 'https://github.com/1nc0gn30/digital-asset-forge',
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="ARTWORK INPUT · 100% IN-BROWSER FILEREADER"
        title="Source Artwork & Framing Controls"
        subtitle="Upload local PNG/JPG artwork or choose a procedural fine-art preset; toggle Crop-to-Fill vs Fit-with-Mat-Border and bleed guides"
        accent={ACCENT_RAW}
        right={<AspectRatioIcon sx={{ color: accent }} />}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<UploadFileIcon fontSize="small" />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              minHeight: 40,
              fontFamily: MONO,
              fontSize: '0.73rem',
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: accent,
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            {uploadMeta ? `Replace (${uploadMeta.name.slice(0, 18)})` : 'Upload Local PNG / JPG'}
          </Button>
          {uploadMeta && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltIcon fontSize="small" />}
              onClick={() => {
                setUploadedImg(null);
                setUploadMeta(null);
              }}
              sx={{
                minHeight: 40,
                fontFamily: MONO,
                fontSize: '0.72rem',
                textTransform: 'none',
                color: 'text.secondary',
                borderColor: 'rgba(148,163,184,0.35)',
              }}
            >
              Use Preset
            </Button>
          )}
        </Box>

        {uploadMeta && (
          <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: isDark ? SOV.emerald : '#047857', mb: 1.25 }}>
            Loaded locally: {uploadMeta.name} · {uploadMeta.width}×{uploadMeta.height} px ({uploadMeta.sizeMb} MB)
          </Typography>
        )}

        <Box sx={{ mb: 1.75 }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
            PROCEDURAL FINE-ART PRESETS
          </Typography>
          <SovereignPresetBar
            presets={FINE_ART_PRESETS}
            activeId={presetId}
            onSelect={(p) => {
              setPresetId(p.id);
              setUploadedImg(null);
              setUploadMeta(null);
              setPackTitle(`${p.label} Gallery Print Pack`);
            }}
            onReset={() => {
              setPresetId(FINE_ART_PRESETS[0].id);
              setUploadedImg(null);
              setUploadMeta(null);
            }}
            accent={ACCENT_RAW}
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              COMPOSITION MODE
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[
                { id: 'crop', label: 'Crop-to-Fill (Full Bleed)' },
                { id: 'mat', label: 'Fit-with-Mat-Border' },
              ].map((m) => {
                const active = fitMode === m.id;
                return (
                  <Chip
                    key={m.id}
                    label={m.label}
                    clickable
                    onClick={() => setFitMode(m.id)}
                    sx={{
                      minHeight: 36,
                      fontFamily: MONO,
                      fontSize: '0.71rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                      color: active ? accent : 'text.secondary',
                      border: `1px solid ${active ? accent : 'rgba(148,163,184,0.35)'}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {fitMode === 'mat' && (
            <>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>MAT BORDER WIDTH</Typography>
                  <Typography sx={{ fontFamily: MONO, fontSize: '0.73rem', fontWeight: 700, color: accent }}>{matBorderPct}%</Typography>
                </Box>
                <Slider
                  value={matBorderPct}
                  min={2}
                  max={22}
                  step={1}
                  onChange={(_, v) => setMatBorderPct(Number(v))}
                  aria-label="Mat Border Percentage"
                  sx={{ color: accent }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {MAT_COLORS.map((c) => {
                  const active = matColorId === c.id;
                  return (
                    <Chip
                      key={c.id}
                      label={c.label}
                      clickable
                      onClick={() => setMatColorId(c.id)}
                      sx={{
                        minHeight: 34,
                        fontFamily: MONO,
                        fontSize: '0.69rem',
                        fontWeight: active ? 700 : 500,
                        bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                        color: active ? accent : 'text.secondary',
                        border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                      }}
                    />
                  );
                })}
              </Box>
            </>
          )}

          <Box>
            <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
              PRINT BLEED OVERLAY & PNG EXPORT TIER
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[
                { val: 0, label: '0" Bleed' },
                { val: 0.125, label: '0.125" Std' },
                { val: 0.25, label: '0.25" Heavy' },
              ].map((b) => {
                const active = bleedIn === b.val;
                return (
                  <Chip
                    key={b.label}
                    label={b.label}
                    size="small"
                    clickable
                    onClick={() => setBleedIn(b.val)}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.69rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(SOV.cyber, 0.16) : 'transparent',
                      color: active ? (isDark ? SOV.cyber : '#0369A1') : 'text.secondary',
                      border: `1px solid ${active ? SOV.cyber : 'rgba(148,163,184,0.34)'}`,
                    }}
                  />
                );
              })}
              {[
                { id: 'high', label: 'Fast High-Res PNG (3600px)' },
                { id: 'master300', label: 'Ultra 300 DPI PNG (<=5400px)' },
              ].map((m) => {
                const active = exportScaleMode === m.id;
                return (
                  <Chip
                    key={m.id}
                    label={m.label}
                    size="small"
                    clickable
                    onClick={() => setExportScaleMode(m.id)}
                    sx={{
                      minHeight: 34,
                      fontFamily: MONO,
                      fontSize: '0.69rem',
                      fontWeight: active ? 700 : 500,
                      bgcolor: active ? rgba(SOV.emerald, 0.16) : 'transparent',
                      color: active ? (isDark ? SOV.emerald : '#047857') : 'text.secondary',
                      border: `1px solid ${active ? SOV.emerald : 'rgba(148,163,184,0.34)'}`,
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="PACK METADATA & 98%-MARGIN ECONOMICS"
        title="Bundle Settings & Digital Margin"
        subtitle="Configure print guide branding, DPI / JPEG compression, and Etsy digital download retail pricing ($0 COGS, $0 shipping)"
        accent={SOV.emerald}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <TextField
            size="small"
            fullWidth
            label="Artwork Pack Title"
            value={packTitle}
            onChange={(e) => setPackTitle(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              label="Shop / Brand Name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              sx={{ flex: '1 1 140px', '& input': { fontFamily: MONO, fontSize: '0.78rem' } }}
            />
            <TextField
              size="small"
              type="number"
              label="Target DPI"
              value={targetDpi}
              onChange={(e) => setTargetDpi(Math.max(150, Math.min(600, Number(e.target.value))))}
              sx={{ flex: '0 1 110px', '& input': { fontFamily: MONO } }}
            />
          </Box>
          <TextField
            size="small"
            fullWidth
            label="Recommended Paper Stock"
            value={paperSpec}
            onChange={(e) => setPaperSpec(e.target.value)}
            sx={{ '& input': { fontFamily: MONO, fontSize: '0.75rem' } }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            <TextField
              size="small"
              type="number"
              label="Retail Price ($)"
              value={retailPrice}
              onChange={(e) => setRetailPrice(Math.max(0.99, Number(e.target.value)))}
              inputProps={{ min: 0.99, step: 1 }}
              sx={{ flex: '1 1 115px', '& input': { fontFamily: MONO } }}
            />
            <TextField
              size="small"
              type="number"
              label="JPEG Quality (70–100)"
              value={jpegQuality}
              onChange={(e) => setJpegQuality(Math.max(70, Math.min(100, Number(e.target.value))))}
              inputProps={{ min: 70, max: 100 }}
              sx={{ flex: '1 1 130px', '& input': { fontFamily: MONO } }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', color: 'text.secondary' }}>MONTHLY DIGITAL DOWNLOAD SALES</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.74rem', fontWeight: 700, color: isDark ? SOV.emerald : '#047857' }}>
                {monthlySales} sales / mo (${(packData.etsyNet * monthlySales).toFixed(0)} Etsy net)
              </Typography>
            </Box>
            <Slider
              value={monthlySales}
              min={10}
              max={1000}
              step={10}
              onChange={(_, v) => setMonthlySales(Number(v))}
              aria-label="Monthly Digital Download Sales"
              sx={{ color: isDark ? SOV.emerald : '#047857' }}
            />
          </Box>
        </Box>
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="LIVE DPR-AWARE MULTI-RATIO STUDIO CANVAS"
        title="5-Ratio Wall Art Synthesizer & Direct PNG Export"
        subtitle="Preview all 5 printable ratios live with red bleed guides, switch hero aspect ratio, and export any ratio as a high-res PNG"
        accent={ACCENT_RAW}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {PRINT_RATIOS.map((r) => {
            const active = activeRatioId === r.id;
            return (
              <Chip
                key={r.id}
                label={`${r.ratio} (${r.inchesW}×${r.inchesH}")`}
                clickable
                onClick={() => setActiveRatioId(r.id)}
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

        <Box
          sx={{
            width: '100%',
            height: { xs: 340, sm: 420, md: 450 },
            borderRadius: 1.5,
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(212,175,55,0.28)' : 'rgba(16,24,40,0.16)'}`,
            mb: 1.5,
          }}
        >
          <canvas
            ref={previewCanvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-label="300 DPI multi-ratio wall art live preview canvas"
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          <Typography sx={{ fontFamily: MONO, fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
            EXPORT HIGH-RES PNG:
          </Typography>
          {PRINT_RATIOS.map((r) => (
            <Button
              key={r.id}
              size="small"
              variant={r.id === activeRatioId ? 'contained' : 'outlined'}
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={() => handleDownloadRatioPng(r)}
              sx={{
                minHeight: 36,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                ...(r.id === activeRatioId
                  ? { bgcolor: accent, color: isDark ? '#08080B' : '#FFFFFF' }
                  : { color: 'text.primary', borderColor: 'rgba(148,163,184,0.38)' }),
              }}
            >
              {r.shortCode}.png
            </Button>
          ))}
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="ETSY 20 MB MULTI-ZIP PARTITION PLANNER"
        title="300 DPI Pixel Matrix & <=20 MB ZIP Splitter"
        subtitle="Automatically partitions all 5 high-res print files into Etsy-compliant <= 20 MB ZIP bundles (max 5 attachments per listing)"
        accent={SOV.cyber}
        right={<FolderZipIcon sx={{ color: isDark ? SOV.cyber : '#0369A1' }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 1.5 }}>
          <SovereignGauge
            value={packData.etsyCompliant ? 100 : 62}
            label="Etsy 20 MB"
            unit="%"
            size={102}
            accent={packData.etsyCompliant ? SOV.emerald : '#EF4444'}
          />
          <Box sx={{ flex: '1 1 220px' }}>
            <SovereignKeyValueGrid
              cols={2}
              accent={SOV.cyber}
              items={[
                { label: 'ZIP Archives Needed', value: `${packData.zipBundles.length} / 5 max`, badge: packData.etsyCompliant ? 'PASS' : 'SPLIT' },
                { label: 'Combined Pack Size', value: `${packData.totalJpegMb} MB`, badge: `Q${jpegQuality} JPEG` },
              ]}
            />
          </Box>
        </Box>

        <SovereignDataTable
          eyebrow="300 DPI MULTI-RATIO PIXEL MATRIX"
          title="Exact Dimensions & File Weight Estimates"
          filename="wall-art-300dpi-matrix.csv"
          accent={SOV.cyber}
          maxHeight={240}
          columns={[
            { key: 'ratio', label: 'Ratio', mono: true },
            { key: 'dimensions', label: 'Pixels', mono: true },
            { key: 'maxPrint', label: 'Max Print', mono: true },
            { key: 'rawMb', label: 'Raw RGB', mono: true, align: 'right' },
            { key: 'jpegMb', label: `JPEG Q${jpegQuality}`, mono: true, align: 'right' },
            { key: 'pngMb', label: 'Est PNG', mono: true, align: 'right' },
            { key: 'status', label: 'Source' },
          ]}
          rows={packData.matrix}
        />

        <Box sx={{ mt: 2 }}>
          <SovereignDataTable
            eyebrow="AUTOMATIC <= 20 MB ETSY ZIP PARTITION"
            title="Ready-to-Upload Digital Download Bundles"
            filename="etsy-20mb-zip-plan.csv"
            accent={SOV.emerald}
            maxHeight={210}
            columns={[
              { key: 'archive', label: 'ZIP Archive Name', mono: true },
              { key: 'ratiosIncluded', label: 'Ratios Packed' },
              { key: 'estSize', label: 'Est Size', mono: true, align: 'right' },
              { key: 'headroom', label: '20 MB Margin', mono: true, align: 'right' },
              { key: 'status', label: 'Etsy Cap' },
            ]}
            rows={packData.zipBundles}
          />
        </Box>
      </SovereignCard>
    </Box>
  );

  const bottomPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignDataTable
        eyebrow="ZERO-COGS DIGITAL DOWNLOAD ECONOMICS"
        title={`Profit & Margin Summary ($${Number(retailPrice).toFixed(2)} Retail · ${monthlySales} Sales/Mo · $0 COGS / $0 Shipping)`}
        filename="digital-download-profit-margins.csv"
        accent={SOV.emerald}
        maxHeight={260}
        columns={[
          { key: 'channel', label: 'Sales Channel & Fee Schedule' },
          { key: 'fees', label: 'Fees / Order', mono: true, align: 'right' },
          { key: 'netUnit', label: 'Net / Order', mono: true, align: 'right' },
          { key: 'margin', label: 'Net Margin', mono: true, align: 'right' },
          { key: 'monthlyNet', label: `Mo Net (${monthlySales})`, mono: true, align: 'right' },
          { key: 'status', label: 'Health' },
        ]}
        rows={packData.profitRows}
      />

      <SovereignCard
        index="05"
        eyebrow="BUYER PRINTING GUIDE & MANIFEST GENERATOR"
        title="Ready-to-Bundle Buyer Print Guide (PRINTING_GUIDE.md / .txt)"
        subtitle="Include inside every Etsy ZIP bundle to eliminate buyer framing questions and reduce support tickets"
        accent={ACCENT_RAW}
        right={<DescriptionIcon sx={{ color: accent }} />}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[
              { id: 'markdown', label: 'PRINTING_GUIDE.md' },
              { id: 'txt', label: 'PRINTING_GUIDE.txt' },
              { id: 'manifest', label: 'digital-pack-manifest.json' },
            ].map((t) => {
              const active = guideTab === t.id;
              return (
                <Chip
                  key={t.id}
                  label={t.label}
                  clickable
                  onClick={() => setGuideTab(t.id)}
                  sx={{
                    minHeight: 34,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.secondary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.34)'}`,
                  }}
                />
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={copied === 'guide' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              onClick={() =>
                copy(
                  guideTab === 'markdown'
                    ? buyerGuide.md
                    : guideTab === 'txt'
                    ? buyerGuide.txt
                    : JSON.stringify(packManifest, null, 2),
                  'guide',
                )
              }
              sx={{
                minHeight: 34,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: accent,
                borderColor: rgba(accent, 0.45),
              }}
            >
              {copied === 'guide' ? 'Copied' : 'Copy Active Document'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={() => downloadText(buyerGuide.txt, 'PRINTING_GUIDE.txt', 'text/plain;charset=utf-8')}
              sx={{
                minHeight: 34,
                fontFamily: MONO,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'none',
                color: 'text.primary',
                borderColor: 'rgba(148,163,184,0.38)',
              }}
            >
              Download .txt
            </Button>
          </Box>
        </Box>

        <SovereignCodeBlock
          title={
            guideTab === 'markdown'
              ? 'PRINTING_GUIDE.md'
              : guideTab === 'txt'
              ? 'PRINTING_GUIDE.txt'
              : 'digital-pack-manifest.json'
          }
          badge={guideTab.toUpperCase()}
          code={
            guideTab === 'markdown'
              ? buyerGuide.md
              : guideTab === 'txt'
              ? buyerGuide.txt
              : JSON.stringify(packManifest, null, 2)
          }
          filename={
            guideTab === 'markdown'
              ? 'PRINTING_GUIDE.md'
              : guideTab === 'txt'
              ? 'PRINTING_GUIDE.txt'
              : 'digital-pack-manifest.json'
          }
          accent={ACCENT_RAW}
          maxHeight={260}
        />
      </SovereignCard>

      <SovereignCard
        index="06"
        eyebrow="LOCAL CLI & BATCH ZIP DAEMON (:8118)"
        title="Digital Asset Forge Local Execution"
        subtitle="Batch-render 7200×10800 px CMYK/sRGB TIFF/JPEG masters and assemble multi-ZIP bundles locally via Pillow/CLI"
        accent={ACCENT_RAW}
      >
        <SovereignCodeBlock
          title="DIGITAL-ASSET-FORGE LOCAL CLI (:8118)"
          badge="LOCAL BATCH"
          code={`# Check local Digital Asset Forge status\ndigital-asset-forge status\n\n# Launch loopback workstation on http://127.0.0.1:8118\ncd ~/NullAITech/digital-asset-forge && python3 server.py --port 8118`}
          filename="digital-asset-forge.sh"
          accent={ACCENT_RAW}
        />
      </SovereignCard>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <SovereignAlertBanner
          severity="info"
          title="Runtime Scope · 100% Client-Side Canvas PNG Synthesizer + Local Batch Daemon (:8118)"
          message="Local artwork loading via FileReader, live 5-ratio DPR canvas framing, Crop-to-Fill / Mat-Border compositing, high-res PNG downloads, Etsy <=20 MB ZIP partitioning, and buyer print guides run strictly in-browser with zero file uploads. Use local digital-asset-forge (:8118) for multi-gigabyte batch ZIP archiving."
        />
      </Box>
      <SovereignWorkstationShell
        id="digital-asset-forge"
        category="COMMERCE & MCP · 300 DPI DIGITAL PACK FORGE (:8118)"
        title="Digital Asset Forge"
        subtitle="300 DPI multi-ratio wall art synthesizer (2:3, 3:4, 4:5, 11:14, ISO A-Series) with live DPR canvas framing, in-browser PNG exports, Etsy <=20 MB multi-ZIP planner, and buyer printing guide generator."
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
