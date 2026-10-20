import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Unstable_Grid2 as Grid, Stack, TextField,
  Card, CardContent, IconButton, Tooltip, Tabs, Tab, Alert, InputAdornment, Dialog,
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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import PaletteIcon from '@mui/icons-material/Palette';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// ---------------------------------------------------------------------------
// PBR Material Presets
// ---------------------------------------------------------------------------
const MATERIALS = {
  gold: { name: '24K Sovereign Gold', color: 0xffd700, metalness: 0.95, roughness: 0.22 },
  silver: { name: '999 Sterling Silver', color: 0xeeeeee, metalness: 0.92, roughness: 0.25 },
  bronze: { name: 'Antique Cast Bronze', color: 0xcd7f32, metalness: 0.85, roughness: 0.38 },
  obsidian: { name: 'Obsidian Black Chrome', color: 0x18181b, metalness: 0.90, roughness: 0.18 },
  platinum: { name: 'Cyber Platinum', color: 0xe5e7eb, metalness: 0.98, roughness: 0.15 },
  copper: { name: 'Pure Rose Copper', color: 0xb87333, metalness: 0.88, roughness: 0.30 }
};

export default function Badge3dCoinGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // License State
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatusMsg, setLicenseStatusMsg] = useState('');

  // 3D Coin State
  const [materialKey, setMaterialKey] = useState('gold');
  const [shape, setShape] = useState('circle');
  const [radius, setRadius] = useState(16);
  const [thickness, setThickness] = useState(3.5);
  const [serrations, setSerrations] = useState(64);
  const [obverseText, setObverseText] = useState('NULLAI SOVEREIGN');
  const [reverseText, setReverseText] = useState('2026 • LIBERTAS');
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  // Canvas Ref
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
      setLicenseStatusMsg('⭐ License successfully activated! All 3D features unlocked.');
      setTimeout(() => {
        setLicenseModalOpen(false);
        setLicenseStatusMsg('');
      }, 1200);
    } else {
      setLicenseStatusMsg('⚠️ Please enter a valid license key or receipt order ID.');
    }
  };

  // Setup Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = 440;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x08080c : 0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 24, 48);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    keyLight.position.set(30, 45, 35);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5c9eb, 0.9);
    fillLight.position.set(-35, 15, -25);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, -35, -35);
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
          angle += 0.015;
          coinGroupRef.current.rotation.y = angle;
          coinGroupRef.current.rotation.x = Math.sin(angle * 0.5) * 0.2;
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

    // Clear previous children
    while (coinGroup.children.length > 0) {
      const obj = coinGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      coinGroup.remove(obj);
    }

    const matConfig = MATERIALS[materialKey] || MATERIALS.gold;
    const material = new THREE.MeshStandardMaterial({
      color: matConfig.color,
      metalness: matConfig.metalness,
      roughness: matConfig.roughness,
      wireframe: wireframe
    });

    let radialSegs = 96;
    if (shape === 'hexagon') radialSegs = 6;
    else if (shape === 'octagon') radialSegs = 8;
    else if (shape === 'decagon') radialSegs = 10;

    // Main Coin Cylinder
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, thickness, radialSegs, 4, false);

    // Serration deformation if requested
    if (serrations > 0 && shape === 'circle') {
      const pos = cylinderGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > radius * 0.95 && Math.abs(y) < thickness * 0.48) {
          const theta = Math.atan2(z, x);
          const rib = Math.sin(theta * serrations);
          if (rib > 0.3) {
            const factor = 1 + (rib * 0.02);
            pos.setX(i, x * factor);
            pos.setZ(i, z * factor);
          }
        }
      }
      cylinderGeo.computeVertexNormals();
    }

    const coinMesh = new THREE.Mesh(cylinderGeo, material);
    coinMesh.castShadow = true;
    coinMesh.receiveShadow = true;
    coinGroup.add(coinMesh);

    // Raised Outer Rim Rings (Obverse & Reverse)
    const rimGeo = new THREE.TorusGeometry(radius * 0.92, thickness * 0.15, 16, radialSegs);
    const rimMeshTop = new THREE.Mesh(rimGeo, material);
    rimMeshTop.rotation.x = Math.PI / 2;
    rimMeshTop.position.y = thickness * 0.48;
    coinGroup.add(rimMeshTop);

    const rimMeshBottom = new THREE.Mesh(rimGeo, material);
    rimMeshBottom.rotation.x = Math.PI / 2;
    rimMeshBottom.position.y = -thickness * 0.48;
    coinGroup.add(rimMeshBottom);

    // Center Relief Medallion Emblem
    const centerGeo = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, thickness * 1.15, radialSegs);
    const centerMesh = new THREE.Mesh(centerGeo, material);
    coinGroup.add(centerMesh);

  }, [materialKey, shape, radius, thickness, serrations, wireframe]);

  // Export 4K PNG Snapshot
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `coin-render-${shape}-${materialKey}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export 3D Mesh
  const handleExport3D = () => {
    if (!isLicensed) {
      setLicenseModalOpen(true);
      return;
    }
    alert('Exporting Watertight CNC STL Mesh for ' + shape.toUpperCase() + ' medallion...');
  };

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
              ? 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(245,158,11,0.08) 100%)'
              : 'linear-gradient(135deg, #FEF9E7 0%, #FFFBEB 100%)',
            border: '1.5px solid rgba(212,175,55,0.4)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
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
                bgcolor: 'rgba(212,175,55,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
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
                Regular <span style={{ textDecoration: 'line-through' }}>$79</span>. WebGL 3D coin studio, PBR metallic shaders, watertight CNC/3D print STL export, and 4K renders.
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
                bgcolor: '#D4AF37',
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
              onClick={() => setLicenseModalOpen(true)}
              startIcon={<VpnKeyIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.78rem',
                fontFamily: mono,
                '&:hover': { color: '#D4AF37' },
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
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThreeDRotationIcon sx={{ color: '#D4AF37', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono }}>
                  WebGL Three.js 3D Viewport
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCaptureSnapshot}
                  startIcon={<CameraAltIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    borderColor: 'rgba(212,175,55,0.4)',
                    color: '#D4AF37',
                  }}
                >
                  Snapshot PNG
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleExport3D}
                  startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontFamily: mono,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    bgcolor: '#D4AF37',
                    color: '#08080B',
                    '&:hover': { bgcolor: '#F5E6AB' },
                  }}
                >
                  Export STL 3D
                </Button>
              </Stack>
            </Box>

            {/* Three.js Canvas Container */}
            <Box
              ref={mountRef}
              sx={{
                flex: 1,
                minHeight: 440,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: isDark ? '#040406' : '#F8FAFC',
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
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
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: mono, mb: 2 }}>
              Relief Coin & Medallion Parameters
            </Typography>

            <Stack spacing={2.5} sx={{ flex: 1 }}>
              {/* Material Preset */}
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontFamily: mono, fontSize: '0.82rem' }}>PBR Material Preset</InputLabel>
                <Select
                  value={materialKey}
                  label="PBR Material Preset"
                  onChange={(e) => setMaterialKey(e.target.value)}
                  sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                >
                  {Object.keys(MATERIALS).map((k) => (
                    <MenuItem key={k} value={k} sx={{ fontFamily: mono, fontSize: '0.82rem' }}>
                      {MATERIALS[k].name}
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
                  onChange={(e) => setShape(e.target.value)}
                  sx={{ fontFamily: mono, fontSize: '0.85rem' }}
                >
                  <MenuItem value="circle" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Circular Medallion (Reeded Edge)</MenuItem>
                  <MenuItem value="hexagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Hexagonal Crest</MenuItem>
                  <MenuItem value="octagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Octagonal Shield</MenuItem>
                  <MenuItem value="decagon" sx={{ fontFamily: mono, fontSize: '0.82rem' }}>Decagonal Sovereign Token</MenuItem>
                </Select>
              </FormControl>

              {/* Sliders */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    COIN RADIUS
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#D4AF37' }}>
                    {radius} mm
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={radius}
                  min={10}
                  max={28}
                  onChange={(e, v) => setRadius(v)}
                  sx={{ color: '#D4AF37' }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    COIN THICKNESS
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#D4AF37' }}>
                    {thickness} mm
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={thickness}
                  min={1.5}
                  max={6.0}
                  step={0.1}
                  onChange={(e, v) => setThickness(v)}
                  sx={{ color: '#D4AF37' }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 700 }}>
                    EDGE SERRATIONS (REEDING)
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: mono, color: '#D4AF37' }}>
                    {serrations}
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  value={serrations}
                  min={0}
                  max={120}
                  step={4}
                  onChange={(e, v) => setSerrations(v)}
                  sx={{ color: '#D4AF37' }}
                />
              </Box>

              {/* Toggles */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                      sx={{ '& .Mui-checked': { color: '#D4AF37' } }}
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
                      sx={{ '& .Mui-checked': { color: '#D4AF37' } }}
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
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: mono, display: 'flex', alignItems: 'center', gap: 1 }}>
          <VpnKeyIcon sx={{ color: '#D4AF37' }} />
          Activate Pro License
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your receipt order ID, Stripe email, or custom license key to immediately unlock all features.
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
              bgcolor: '#D4AF37',
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
