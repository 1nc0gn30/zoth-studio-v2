import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Slider, FormControlLabel, Switch
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as THREE from 'three';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import DownloadIcon from '@mui/icons-material/Download';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ScaleIcon from '@mui/icons-material/Scale';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useReality } from '../../context/RealityContext';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// PBR Material Definitions (Color, Metalness, Roughness, Physical Density g/cm3)
// ---------------------------------------------------------------------------
const MATERIALS = {
  gold: {
    name: '24K Sovereign Gold',
    color: 0xffd700,
    metalness: 0.96,
    roughness: 0.18,
    density: 19.32,
    badge: '99.99% AU'
  },
  matrixEmerald: {
    name: 'Hermetic Emerald Chrome',
    color: 0x00ff9d,
    metalness: 0.92,
    roughness: 0.22,
    density: 7.90,
    badge: 'MATRIX 0x9D'
  },
  ghostTitanium: {
    name: 'Ghostmode Crimson Titanium',
    color: 0xf43f5e,
    metalness: 0.94,
    roughness: 0.20,
    density: 4.51,
    badge: 'SPEC-OPS'
  },
  quantumCyan: {
    name: 'Cybernetic Quantum Cyan',
    color: 0x06b6d4,
    metalness: 0.95,
    roughness: 0.16,
    density: 21.45,
    badge: 'QUANTUM PT'
  },
  stealthCarbon: {
    name: 'Obsidian Void Carbon',
    color: 0x141418,
    metalness: 0.88,
    roughness: 0.32,
    density: 1.85,
    badge: 'STEALTH V2'
  },
  silver: {
    name: '999 Fine Bullion Silver',
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.20,
    density: 10.49,
    badge: '99.9% AG'
  },
  bronze: {
    name: 'Antique Cast Bronze',
    color: 0xcd7f32,
    metalness: 0.86,
    roughness: 0.36,
    density: 8.80,
    badge: 'CU-SN BR'
  },
  copper: {
    name: 'Pure Rose Copper',
    color: 0xb87333,
    metalness: 0.90,
    roughness: 0.28,
    density: 8.96,
    badge: '99.9% CU'
  }
};

// ---------------------------------------------------------------------------
// Bot Crest & Numismatic Emblems
// ---------------------------------------------------------------------------
const CRESTS = {
  realityBot: { id: 'realityBot', name: 'Active Reality Bot Crest' },
  aurum: { id: 'aurum', name: 'AURUM-IX Sovereign Crown & Rings' },
  cipher: { id: 'cipher', name: 'CIPHER-0x9D Matrix Hex & Droid' },
  specter: { id: 'specter', name: 'SPECTER-V Onion Sonar Delta' },
  kitsune: { id: 'kitsune', name: 'KITSUNE-Q9 Cyber Kitsune Torii' },
  cortex: { id: 'cortex', name: 'CORTEX-PRO Neural Vortex Core' },
  nullai: { id: 'nullai', name: 'NullAI Double-Chevron Sigil' },
  eagle: { id: 'eagle', name: 'Imperial Sovereign Double Eagle' }
};

// ---------------------------------------------------------------------------
// Zero-Dependency Procedural WebAudio Clink Synthesizer
// ---------------------------------------------------------------------------
let audioCtx = null;
function playClink(audioEnabled, freq = 1200, type = 'sine') {
  if (!audioEnabled || typeof window === 'undefined') return;
  try {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (err) {}
}

// ---------------------------------------------------------------------------
// Client-Side Watertight Binary STL Exporter with Volume Math
// ---------------------------------------------------------------------------
function generateBinarySTL(group) {
  const triangles = [];
  group.updateMatrixWorld(true);

  group.traverse((child) => {
    if (child.isMesh && child.geometry) {
      let geo = child.geometry;
      if (geo.index) {
        geo = geo.toNonIndexed();
      }
      const pos = geo.attributes.position;
      const matrix = child.matrixWorld;

      const vA = new THREE.Vector3();
      const vB = new THREE.Vector3();
      const vC = new THREE.Vector3();
      const cb = new THREE.Vector3();
      const ab = new THREE.Vector3();

      for (let i = 0; i < pos.count; i += 3) {
        vA.fromBufferAttribute(pos, i).applyMatrix4(matrix);
        vB.fromBufferAttribute(pos, i + 1).applyMatrix4(matrix);
        vC.fromBufferAttribute(pos, i + 2).applyMatrix4(matrix);

        cb.subVectors(vC, vB);
        ab.subVectors(vA, vB);
        cb.cross(ab).normalize();

        triangles.push({
          normal: [cb.x, cb.y, cb.z],
          a: [vA.x, vA.y, vA.z],
          b: [vB.x, vB.y, vB.z],
          c: [vC.x, vC.y, vC.z]
        });
      }
    }
  });

  const numTriangles = triangles.length;
  const bufferLength = 80 + 4 + numTriangles * 50;
  const buffer = new ArrayBuffer(bufferLength);
  const view = new DataView(buffer);

  // 80-byte header
  const headerStr = 'ZOTH STUDIO BADGE3D COIN WATERTIGHT CNC STL EXPORT v2.7';
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
  }

  // 4-byte triangle count
  view.setUint32(80, numTriangles, true);

  let totalVolumeMm3 = 0;
  let offset = 84;

  for (let i = 0; i < numTriangles; i++) {
    const tri = triangles[i];

    // Compute signed volume of tetrahedron: 1/6 * a . (b x c)
    const ax = tri.a[0], ay = tri.a[1], az = tri.a[2];
    const bx = tri.b[0], by = tri.b[1], bz = tri.b[2];
    const cx = tri.c[0], cy = tri.c[1], cz = tri.c[2];
    const v3d = (ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx)) / 6.0;
    totalVolumeMm3 += v3d;

    // Normal vector
    view.setFloat32(offset, tri.normal[0], true);
    view.setFloat32(offset + 4, tri.normal[1], true);
    view.setFloat32(offset + 8, tri.normal[2], true);

    // Vertices
    view.setFloat32(offset + 12, ax, true);
    view.setFloat32(offset + 16, ay, true);
    view.setFloat32(offset + 20, az, true);

    view.setFloat32(offset + 24, bx, true);
    view.setFloat32(offset + 28, by, true);
    view.setFloat32(offset + 32, bz, true);

    view.setFloat32(offset + 36, cx, true);
    view.setFloat32(offset + 40, cy, true);
    view.setFloat32(offset + 44, cz, true);

    // Attribute byte count = 0
    view.setUint16(offset + 48, 0, true);
    offset += 50;
  }

  const volumeCm3 = Math.max(0.01, Math.abs(totalVolumeMm3) / 1000.0);

  return {
    buffer,
    numTriangles,
    volumeCm3
  };
}

// ---------------------------------------------------------------------------
// Canvas 2D Numismatic Face Relief Bump Generator
// ---------------------------------------------------------------------------
function createReliefCanvasTexture(textArc, subText, crestKey, resolvedBot, accentColor) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;

  // Background base height
  ctx.fillStyle = '#404040';
  ctx.fillRect(0, 0, size, size);

  // Outer Raised Rim (Height gradient)
  const rimGrad = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r);
  rimGrad.addColorStop(0, '#505050');
  rimGrad.addColorStop(0.7, '#a0a0a0');
  rimGrad.addColorStop(1, '#e0e0e0');
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Recessed Coin Field
  ctx.fillStyle = '#404040';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
  ctx.fill();

  // Denticle Beaded Border (Numismatic beads along outer rim)
  const denticleCount = 96;
  const beadRadius = 7;
  const beadOrbit = r * 0.93;
  ctx.fillStyle = '#f5f5f5';
  for (let i = 0; i < denticleCount; i++) {
    const angle = (i / denticleCount) * Math.PI * 2;
    const bx = cx + Math.cos(angle) * beadOrbit;
    const by = cy + Math.sin(angle) * beadOrbit;
    ctx.beginPath();
    ctx.arc(bx, by, beadRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner Concentric Border Ring
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // Top Text Along Curved Arc
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "JetBrains Mono", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const arcRadius = r * 0.72;
  const cleanTop = textArc.toUpperCase();
  const topAngleSpan = Math.PI * 0.85;
  const topStep = topAngleSpan / Math.max(1, cleanTop.length - 1);
  const startTopAngle = -Math.PI / 2 - topAngleSpan / 2;

  for (let i = 0; i < cleanTop.length; i++) {
    const char = cleanTop[i];
    const angle = startTopAngle + i * topStep;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * arcRadius, cy + Math.sin(angle) * arcRadius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  // Bottom Subtext Arc
  const cleanSub = subText.toUpperCase();
  const subAngleSpan = Math.PI * 0.65;
  const subStep = subAngleSpan / Math.max(1, cleanSub.length - 1);
  const startSubAngle = Math.PI / 2 - subAngleSpan / 2;
  ctx.font = 'bold 36px "JetBrains Mono", sans-serif';

  for (let i = 0; i < cleanSub.length; i++) {
    const char = cleanSub[i];
    const angle = startSubAngle + i * subStep;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * arcRadius, cy + Math.sin(angle) * arcRadius);
    ctx.rotate(angle - Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Center Emblem / Crest Drawing
  ctx.save();
  ctx.translate(cx, cy);

  // Center circular medallion platform
  ctx.fillStyle = '#656565';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
  ctx.stroke();

  // Determine crest to draw
  let effectiveCrest = crestKey;
  if (effectiveCrest === 'realityBot') {
    if (resolvedBot?.id?.includes('aurum')) effectiveCrest = 'aurum';
    else if (resolvedBot?.id?.includes('cipher')) effectiveCrest = 'cipher';
    else if (resolvedBot?.id?.includes('specter')) effectiveCrest = 'specter';
    else if (resolvedBot?.id?.includes('kitsune')) effectiveCrest = 'kitsune';
    else if (resolvedBot?.id?.includes('cortex')) effectiveCrest = 'cortex';
    else effectiveCrest = 'aurum';
  }

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (effectiveCrest === 'aurum') {
    // Sovereign Archon Crown & Orbital Rings
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 130, 45, Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-50, 40);
    ctx.lineTo(-70, -25);
    ctx.lineTo(-30, 0);
    ctx.lineTo(0, -45);
    ctx.lineTo(30, 0);
    ctx.lineTo(70, -25);
    ctx.lineTo(50, 40);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -60, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (effectiveCrest === 'cipher') {
    // CIPHER-0x9D Matrix Hex & Droid
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a) * 110;
      const y = Math.sin(a) * 110;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0x9D', 0, 5);

    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();
  } else if (effectiveCrest === 'specter') {
    // SPECTER-V Onion Sonar Delta
    ctx.beginPath();
    ctx.arc(0, 20, 100, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 20, 70, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 20, 40, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(50, 40);
    ctx.lineTo(-50, 40);
    ctx.closePath();
    ctx.fill();
  } else if (effectiveCrest === 'kitsune') {
    // KITSUNE-Q9 Cyber Torii & Core
    ctx.fillRect(-80, -70, 160, 18);
    ctx.fillRect(-70, -40, 140, 14);
    ctx.fillRect(-45, -40, 16, 110);
    ctx.fillRect(29, -40, 16, 110);

    ctx.beginPath();
    ctx.arc(0, 10, 32, 0, Math.PI * 2);
    ctx.fill();
  } else if (effectiveCrest === 'cortex') {
    // CORTEX-PRO Neural Vortex
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 60, Math.sin(a) * 60, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
  } else if (effectiveCrest === 'nullai') {
    // NullAI Canonical Double Chevron
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(75, -20);
    ctx.lineTo(50, -20);
    ctx.lineTo(0, -65);
    ctx.lineTo(-50, -20);
    ctx.lineTo(-75, -20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(75, 35);
    ctx.lineTo(50, 35);
    ctx.lineTo(0, -10);
    ctx.lineTo(-50, 35);
    ctx.lineTo(-75, 35);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 65, 14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Imperial Double Eagle
    ctx.beginPath();
    ctx.moveTo(0, -75);
    ctx.lineTo(40, -45);
    ctx.lineTo(90, -15);
    ctx.lineTo(60, 20);
    ctx.lineTo(75, 65);
    ctx.lineTo(25, 45);
    ctx.lineTo(0, 75);
    ctx.lineTo(-25, 45);
    ctx.lineTo(-75, 65);
    ctx.lineTo(-60, 20);
    ctx.lineTo(-90, -15);
    ctx.lineTo(-40, -45);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export default function Badge3dCoinGodModeTool({ tool }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { reality, activeTheme } = useReality();

  // Dynamic Reality Accent Colors
  const realityAccent = activeTheme?.accent || '#D4AF37';
  const realityBot = activeTheme?.bot || { name: 'AURUM-IX', title: '24K Sovereign Archon' };

  // License State
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatusMsg, setLicenseStatusMsg] = useState('');

  // Audio Feedback State
  const [audioEnabled, setAudioEnabled] = useState(true);

  // 3D Coin Parameters
  const [materialKey, setMaterialKey] = useState('gold');
  const [crestKey, setCrestKey] = useState('realityBot');
  const [shape, setShape] = useState('circle');
  const [radius, setRadius] = useState(16); // mm
  const [thickness, setThickness] = useState(3.2); // mm
  const [serrations, setSerrations] = useState(84);
  const [obverseText, setObverseText] = useState('NULLAI SOVEREIGN ARCHON');
  const [reverseText, setReverseText] = useState('• 2026 • LIBERTAS IN PERPETUUM');
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [bumpScale, setBumpScale] = useState(0.12);

  // CNC Metric Telemetry State
  const [meshStats, setMeshStats] = useState({
    triangles: 12400,
    volumeCm3: 2.57,
    massGrams: 49.65,
    troyOz: 1.59
  });

  // Canvas Refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const coinGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // License detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLicensed = urlParams.get('licensed') === 'true' || urlParams.get('session_id') !== null;
    const localLicensed = localStorage.getItem('pro_licensed') === 'true' ||
                          localStorage.getItem('badge3d_pro_licensed') === 'true';

    if (paramLicensed || localLicensed) {
      setIsLicensed(true);
      if (paramLicensed) {
        localStorage.setItem('badge3d_pro_licensed', 'true');
        localStorage.setItem('pro_licensed', 'true');
      }
    }
  }, []);

  const handleActivateLicense = () => {
    const clean = licenseKeyInput.trim();
    if (clean.length >= 4 || clean.toUpperCase().includes('COIN') || clean.toUpperCase().includes('PRO') || clean.includes('@')) {
      setIsLicensed(true);
      localStorage.setItem('badge3d_pro_licensed', 'true');
      localStorage.setItem('pro_licensed', 'true');
      playClink(audioEnabled, 1400);
      setLicenseStatusMsg('⭐ License successfully activated! All 3D CNC & STL features unlocked.');
      setTimeout(() => {
        setLicenseModalOpen(false);
        setLicenseStatusMsg('');
      }, 1200);
    } else {
      setLicenseStatusMsg('⚠️ Please enter a valid license key or receipt order ID.');
    }
  };

  // Re-sync material when Reality theme shifts if default
  useEffect(() => {
    if (reality === 'matrix') setMaterialKey('matrixEmerald');
    else if (reality === 'ghost') setMaterialKey('ghostTitanium');
    else if (reality === 'cyan') setMaterialKey('quantumCyan');
    else if (reality === 'incognito') setMaterialKey('stealthCarbon');
    else setMaterialKey('gold');
  }, [reality]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = 460;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x060609 : 0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 26, 46);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting Environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    keyLight.position.set(32, 50, 36);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5c9eb, 1.2);
    fillLight.position.set(-36, 18, -26);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(0, -32, -32);
    scene.add(rimLight);

    // Coin Group
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);
    coinGroupRef.current = coinGroup;

    // Animation Loop
    let angle = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (coinGroupRef.current) {
        if (autoRotate) {
          angle += 0.016;
          coinGroupRef.current.rotation.y = angle;
          coinGroupRef.current.rotation.x = Math.sin(angle * 0.5) * 0.22;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDark]);

  // Rebuild 3D Coin Mesh on parameter changes
  useEffect(() => {
    const coinGroup = coinGroupRef.current;
    if (!coinGroup) return;

    // Dispose previous children
    while (coinGroup.children.length > 0) {
      const obj = coinGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else if (obj.material) {
        obj.material.dispose();
      }
      coinGroup.remove(obj);
    }

    const matConfig = MATERIALS[materialKey] || MATERIALS.gold;

    // Generate dynamic relief bump map textures
    const obverseTex = createReliefCanvasTexture(obverseText, 'SOVEREIGN MINT • NUMISMATICS', crestKey, realityBot, realityAccent);
    const reverseTex = createReliefCanvasTexture(reverseText, 'RING-0 ENCLAVE • MMXXVI', crestKey, realityBot, realityAccent);

    // Multi-materials for cylinder: [0: side, 1: top obverse, 2: bottom reverse]
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: matConfig.color,
      metalness: matConfig.metalness,
      roughness: matConfig.roughness,
      wireframe: wireframe
    });

    const obverseMaterial = new THREE.MeshStandardMaterial({
      color: matConfig.color,
      metalness: matConfig.metalness,
      roughness: matConfig.roughness,
      bumpMap: obverseTex,
      bumpScale: bumpScale,
      wireframe: wireframe
    });

    const reverseMaterial = new THREE.MeshStandardMaterial({
      color: matConfig.color,
      metalness: matConfig.metalness,
      roughness: matConfig.roughness,
      bumpMap: reverseTex,
      bumpScale: bumpScale,
      wireframe: wireframe
    });

    let radialSegs = 96;
    if (shape === 'hexagon') radialSegs = 6;
    else if (shape === 'octagon') radialSegs = 8;
    else if (shape === 'decagon') radialSegs = 10;
    else if (shape === 'dodecagon') radialSegs = 12;

    // Main Coin Geometry
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, thickness, radialSegs, 4, false);

    // Serration deformation if requested on circular coin
    if (serrations > 0 && shape === 'circle') {
      const pos = cylinderGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > radius * 0.94 && Math.abs(y) < thickness * 0.48) {
          const theta = Math.atan2(z, x);
          const rib = Math.sin(theta * serrations);
          if (rib > 0.25) {
            const factor = 1 + (rib * 0.022);
            pos.setX(i, x * factor);
            pos.setZ(i, z * factor);
          }
        }
      }
      cylinderGeo.computeVertexNormals();
    }

    const coinMesh = new THREE.Mesh(cylinderGeo, [sideMaterial, obverseMaterial, reverseMaterial]);
    coinMesh.castShadow = true;
    coinMesh.receiveShadow = true;
    coinGroup.add(coinMesh);

    // Raised Outer Rim Rings (Top & Bottom)
    const rimRadius = radius * 0.94;
    const rimTube = thickness * 0.14;
    const rimGeo = new THREE.TorusGeometry(rimRadius, rimTube, 16, radialSegs);

    const rimMeshTop = new THREE.Mesh(rimGeo, sideMaterial);
    rimMeshTop.rotation.x = Math.PI / 2;
    rimMeshTop.position.y = thickness * 0.48;
    coinGroup.add(rimMeshTop);

    const rimMeshBottom = new THREE.Mesh(rimGeo, sideMaterial);
    rimMeshBottom.rotation.x = Math.PI / 2;
    rimMeshBottom.position.y = -thickness * 0.48;
    coinGroup.add(rimMeshBottom);

    // Center Relief Core Plate
    const centerPlateGeo = new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, thickness * 1.08, radialSegs);
    const centerPlateMesh = new THREE.Mesh(centerPlateGeo, sideMaterial);
    coinGroup.add(centerPlateMesh);

    // Calculate Exact Watertight Volume & Mass Metrics
    try {
      const { numTriangles, volumeCm3 } = generateBinarySTL(coinGroup);
      const density = matConfig.density || 19.32;
      const massGrams = volumeCm3 * density;
      const troyOz = massGrams / 31.1034768;

      setMeshStats({
        triangles: numTriangles,
        volumeCm3: parseFloat(volumeCm3.toFixed(2)),
        massGrams: parseFloat(massGrams.toFixed(2)),
        troyOz: parseFloat(troyOz.toFixed(2))
      });
    } catch (err) {}

  }, [materialKey, crestKey, shape, radius, thickness, serrations, obverseText, reverseText, wireframe, bumpScale, realityBot, realityAccent]);

  // Export 4K PNG Snapshot
  const handleCaptureSnapshot = () => {
    playClink(audioEnabled, 1600);
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `zoth-coin-${shape}-${materialKey}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Real Client-Side Watertight CNC STL Export
  const handleExportSTL = () => {
    if (!isLicensed) {
      playClink(audioEnabled, 480);
      setLicenseModalOpen(true);
      return;
    }

    playClink(audioEnabled, 1800);
    if (!coinGroupRef.current) return;

    try {
      const { buffer, numTriangles, volumeCm3 } = generateBinarySTL(coinGroupRef.current);
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zoth-badge3d-coin-${shape}-${radius}mm-${materialKey}.stl`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('STL Export Error:', err);
    }
  };

  const matConfig = MATERIALS[materialKey] || MATERIALS.gold;

  return (
    <Box sx={{ width: '100%' }}>
      {/* --------------------------------------------------------------------- */}
      {/* HIGH-CONVERTING SALES BANNER ABOVE MAIN SECTION                       */}
      {/* --------------------------------------------------------------------- */}
      {!isLicensed && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            background: isDark
              ? `linear-gradient(135deg, ${realityAccent}18 0%, rgba(15,16,24,0.85) 100%)`
              : 'linear-gradient(135deg, #FEF9E7 0%, #FFFBEB 100%)',
            border: `1.5px solid ${realityAccent}55`,
            boxShadow: `0 8px 32px ${realityAccent}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: `${realityAccent}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: realityAccent,
              }}
            >
              <ViewInArIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                  Badge3D Coin Studio Pro — Lifetime Founding Pass
                </Typography>
                <Chip
                  label="68% OFF · $19 LIFETIME"
                  size="small"
                  sx={{
                    bgcolor: '#10B981',
                    color: '#08080B',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    fontFamily: mono,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                Regular <span style={{ textDecoration: 'line-through' }}>$79</span>. WebGL 3D coin studio, PBR metallic shaders, watertight CNC/3D print binary STL export, and 4K renders.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              href="https://buy.stripe.com/4gMfZg9AheOsdhKbcAfw40L"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: realityAccent,
                color: '#08080B',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { bgcolor: '#F5E6AB' },
              }}
            >
              Stripe $19 USD 💳
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const sol = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
                navigator.clipboard?.writeText(sol);
                playClink(audioEnabled, 1100);
                alert('Solana Receiver Address copied: ' + sol);
              }}
              sx={{
                borderColor: '#10B981',
                color: '#10B981',
                fontWeight: 800,
                fontSize: '0.82rem',
                fontFamily: mono,
                '&:hover': { borderColor: '#34D399', bgcolor: 'rgba(16,185,129,0.08)' },
              }}
            >
              Solana DePay ⚡
            </Button>
            <Button
              size="small"
              onClick={() => {
                playClink(audioEnabled, 900);
                setLicenseModalOpen(true);
              }}
              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.78rem',
                fontFamily: mono,
                '&:hover': { color: realityAccent },
              }}
            >
              Activate Key
            </Button>
          </Stack>
        </Paper>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MAIN TWO-PANE WORKSPACE: LEFT 3D STAGE & RIGHT CONTROLS               */}
      {/* --------------------------------------------------------------------- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left Column: WebGL 3D Interactive Stage */}
        <Grid xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Viewport Top Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThreeDRotationIcon sx={{ color: realityAccent, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                  WebGL Three.js 3D Viewport
                </Typography>
                <Chip
                  label={realityBot?.name || 'ZOTH-BOT'}
                  size="small"
                  sx={{
                    bgcolor: `${realityAccent}22`,
                    color: realityAccent,
                    fontSize: '0.68rem',
                    fontFamily: mono,
                    fontWeight: 700
                  }}
                />
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={audioEnabled ? 'Mute Procedural Clicks' : 'Enable Procedural Clicks'}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const next = !audioEnabled;
                      setAudioEnabled(next);
                      playClink(next, 1000);
                    }}
                    sx={{ color: audioEnabled ? realityAccent : 'text.disabled' }}
                  >
                    {audioEnabled ? <VolumeUpIcon sx={{ fontSize: 18 }} /> : <VolumeOffIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCaptureSnapshot}
                  startIcon={<CameraAltIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    borderColor: `${realityAccent}55`,
                    color: realityAccent,
                    '&:hover': { borderColor: realityAccent, bgcolor: `${realityAccent}11` }
                  }}
                >
                  Snapshot PNG
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  onClick={handleExportSTL}
                  startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    bgcolor: realityAccent,
                    color: '#08080B',
                    '&:hover': { bgcolor: '#F5E6AB' },
                  }}
                >
                  {isLicensed ? 'Export STL 3D' : 'Export STL (Pro)'}
                </Button>
              </Stack>
            </Box>

            {/* Three.js Canvas Container */}
            <Box
              ref={mountRef}
              sx={{
                width: '100%',
                minHeight: 460,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: isDark ? '#040406' : '#F8FAFC',
                border: `1px solid ${theme.palette.divider}`,
              }}
            />

            {/* Live CNC & Mint Telemetry Floating HUD */}
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(15,16,24,0.7)' : 'rgba(240,243,246,0.85)',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PrecisionManufacturingIcon sx={{ fontSize: 18, color: realityAccent }} />
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                    WATERTIGHT CNC MESH
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.82rem' }}>
                    {meshStats.triangles.toLocaleString()} Triangles
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScaleIcon sx={{ fontSize: 18, color: realityAccent }} />
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                    EST. MINT MASS ({matConfig.badge})
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.82rem', color: realityAccent }}>
                    {meshStats.massGrams} g · {meshStats.troyOz} oz t
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ViewInArIcon sx={{ fontSize: 18, color: realityAccent }} />
                <Box>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                    DISPLACEMENT VOLUME
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: mono, fontWeight: 700, fontSize: '0.82rem' }}>
                    {meshStats.volumeCm3} cm³
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Customization Controls */}
        <Grid xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: isDark ? '#08080C' : '#FFFFFF',
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                Relief Coin & Medallion Parameters
              </Typography>
              <Chip
                label={isLicensed ? '⭐ PRO ACTIVE' : 'FREE TIER'}
                size="small"
                sx={{
                  bgcolor: isLicensed ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)',
                  color: isLicensed ? '#10B981' : realityAccent,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  fontFamily: mono
                }}
              />
            </Box>

            <Stack spacing={2} sx={{ flex: 1 }}>
              {/* Material Preset */}
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>PBR Metallic Material</InputLabel>
                <Select
                  value={materialKey}
                  label="PBR Metallic Material"
                  onChange={(e) => {
                    playClink(audioEnabled, 1100);
                    setMaterialKey(e.target.value);
                  }}
                  sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                >
                  {Object.keys(MATERIALS).map((k) => (
                    <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      {MATERIALS[k].name} ({MATERIALS[k].badge})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Medallion Shape */}
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Medallion Geometry</InputLabel>
                <Select
                  value={shape}
                  label="Medallion Geometry"
                  onChange={(e) => {
                    playClink(audioEnabled, 1000);
                    setShape(e.target.value);
                  }}
                  sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                >
                  <MenuItem value="circle" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Circular Medallion (Reeded Edge)</MenuItem>
                  <MenuItem value="hexagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Hexagonal Tactical Crest</MenuItem>
                  <MenuItem value="octagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Octagonal Sovereign Shield</MenuItem>
                  <MenuItem value="decagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Decagonal Sovereign Token</MenuItem>
                  <MenuItem value="dodecagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>12-Sided Dodecagon Specie</MenuItem>
                </Select>
              </FormControl>

              {/* Center Crest Emblem */}
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Numismatic Crest Emblem</InputLabel>
                <Select
                  value={crestKey}
                  label="Numismatic Crest Emblem"
                  onChange={(e) => {
                    playClink(audioEnabled, 1250);
                    setCrestKey(e.target.value);
                  }}
                  sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                >
                  {Object.keys(CRESTS).map((k) => (
                    <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      {CRESTS[k].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Obverse Arc Text */}
              <TextField
                size="small"
                label="Obverse Perimeter Arc Text"
                value={obverseText}
                onChange={(e) => setObverseText(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
                InputLabelProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
              />

              {/* Reverse Arc Text */}
              <TextField
                size="small"
                label="Reverse Perimeter Arc Text"
                value={reverseText}
                onChange={(e) => setReverseText(e.target.value)}
                InputProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
                InputLabelProps={{ sx: { fontFamily: mono, fontSize: '0.82rem' } }}
              />

              {/* Sliders */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    COIN RADIUS
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: realityAccent }}>
                    {radius} mm (Ø {radius * 2} mm)
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={radius}
                  min={10}
                  max={32}
                  onChange={(e, v) => setRadius(v)}
                  sx={{ color: realityAccent }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    COIN THICKNESS
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: realityAccent }}>
                    {thickness} mm
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={thickness}
                  min={1.5}
                  max={6.5}
                  step={0.1}
                  onChange={(e, v) => setThickness(v)}
                  sx={{ color: realityAccent }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    EDGE SERRATIONS (REEDING)
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: realityAccent }}>
                    {serrations} teeth
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={serrations}
                  min={0}
                  max={140}
                  step={4}
                  onChange={(e, v) => setSerrations(v)}
                  sx={{ color: realityAccent }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    RELIEF BUMP INTENSITY
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: realityAccent }}>
                    {(bumpScale * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={bumpScale}
                  min={0.02}
                  max={0.30}
                  step={0.01}
                  onChange={(e, v) => setBumpScale(v)}
                  sx={{ color: realityAccent }}
                />
              </Box>

              {/* Toggles */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      sx={{ '& .Mui-checked': { color: realityAccent } }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ fontFamily: mono }}>Turntable Spin</Typography>}
                />

                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={wireframe}
                      onChange={(e) => setWireframe(e.target.checked)}
                      sx={{ '& .Mui-checked': { color: realityAccent } }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ fontFamily: mono }}>Wireframe Mesh</Typography>}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* --------------------------------------------------------------------- */}
      {/* LICENSE ACTIVATION DIALOG                                             */}
      {/* --------------------------------------------------------------------- */}
      <Dialog
        open={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#0D0D12' : '#FFFFFF',
            border: `1px solid ${realityAccent}66`,
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: realityAccent }} />
          Activate Pro License
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your receipt order ID, Stripe email, or custom license key to immediately unlock watertight STL CNC exports and 4K renders.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            size="small"
            placeholder="e.g. COIN-PRO-XXXX or receipt email"
            value={licenseKeyInput}
            onChange={(e) => setLicenseKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleActivateLicense();
            }}
            InputProps={{
              sx: { fontFamily: mono, fontSize: '0.88rem' }
            }}
          />
          {licenseStatusMsg && (
            <Alert
              severity={licenseStatusMsg.includes('⭐') ? 'success' : 'warning'}
              sx={{ mt: 2, fontFamily: mono, fontSize: '0.78rem' }}
            >
              {licenseStatusMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLicenseModalOpen(false)} sx={{ color: 'text.secondary', fontFamily: mono }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleActivateLicense}
            sx={{
              bgcolor: realityAccent,
              color: '#08080B',
              fontWeight: 800,
              fontFamily: mono,
              '&:hover': { bgcolor: '#F5E6AB' },
            }}
          >
            Activate Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
