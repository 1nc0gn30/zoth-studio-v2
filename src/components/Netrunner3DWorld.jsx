import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Typography, Chip, IconButton, Tooltip, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import LabelIcon from '@mui/icons-material/Label';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

const CLUSTER_HEX = {
  'Lucy Oracle': 0xF472B6,
  'Kernel': 0x00F0FF,
  'Consensus': 0xD4AF37,
  'Security': 0xF87171,
  'Vault': 0x10B981,
  'Pantheon': 0xA78BFA,
  'All': 0xD4AF37,
};

function getClusterHex(cluster) {
  return CLUSTER_HEX[cluster] || 0xD4AF37;
}

/**
 * Creates the glowing circular cyberspace grid canvas texture
 */
function makeGridTexture(isDark) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 1024);

  // Minor grid lines
  ctx.strokeStyle = isDark ? 'rgba(0, 240, 255, 0.09)' : 'rgba(10, 37, 64, 0.08)';
  ctx.lineWidth = 1;
  const step = 1024 / 32;
  for (let i = 0; i <= 32; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(1024, i * step);
    ctx.stroke();
  }

  // Major accent lines
  ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(184, 134, 11, 0.2)';
  ctx.lineWidth = 2;
  for (let j = 0; j <= 8; j++) {
    const p = j * (1024 / 8);
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(1024, p);
    ctx.stroke();
  }

  // Radial falloff so grid softly fades at edge
  const grad = ctx.createRadialGradient(512, 512, 120, 512, 512, 500);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, isDark ? '#06070B' : '#EDF2F7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Procedural starfield with spherical distribution
 */
function createStarfield(count = 2200, radius = 1200) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * (0.6 + Math.random() * 0.4);

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    pos[i * 3 + 2] = r * Math.cos(phi);

    // Subtle tint: Gold, Cyan, or White
    const p = Math.random();
    if (p < 0.25) {
      col[i * 3] = 0.83; col[i * 3 + 1] = 0.68; col[i * 3 + 2] = 0.21; // Gold
    } else if (p < 0.45) {
      col[i * 3] = 0.0; col[i * 3 + 1] = 0.94; col[i * 3 + 2] = 1.0; // Cyan
    } else {
      const b = 0.6 + Math.random() * 0.4;
      col[i * 3] = b; col[i * 3 + 1] = b; col[i * 3 + 2] = b; // White
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 1.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  return new THREE.Points(geo, mat);
}

/**
 * High-craftsmanship 3D Netrunner Memory World
 * Velvety smooth OrbitControls, calm ambient auto-rotation, zero frantic jitter.
 */
export default function Netrunner3DWorld({
  memories = [],
  selectedMemory = null,
  onSelectMemory = () => {},
  isDark = true,
  height = 480
}) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const nodeMeshesRef = useRef([]);
  const linkLinesRef = useRef(null);
  const pulseMeshRef = useRef(null);
  const haloMeshRef = useRef(null);
  const coreRef = useRef(null);
  const ringsRef = useRef([]);
  const starsRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredMemory, setHoveredMemory] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Sync auto-rotation state with OrbitControls
  const toggleAutoRotate = () => {
    setAutoRotate((prev) => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }
      return next;
    });
  };

  // Smoothly reset camera to default majestic vantage
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    controls.target.set(0, 16, 0);
    cameraRef.current.position.set(0, 110, 380);
    controls.update();
  }, []);

  // Smoothly center and focus on the currently selected memory node
  const focusSelectedNode = useCallback(() => {
    if (!selectedMemory || !cameraRef.current || !controlsRef.current) return;
    const targetX = selectedMemory.x * 2.2;
    const targetY = selectedMemory.y * 1.8 + 24;
    const targetZ = selectedMemory.z * 2.2;

    const controls = controlsRef.current;
    controls.target.set(targetX, targetY, targetZ);
    cameraRef.current.position.set(targetX, targetY + 45, targetZ + 120);
    controls.update();
  }, [selectedMemory]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 740;
    const h = height;

    // SCENE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x06070B : 0xEDF2F7, 0.0011);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / h, 1, 3000);
    camera.position.set(0, 110, 380);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(isDark ? 0x06070B : 0xEDF2F7, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS — Velvety smooth, calm interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; // Soft deceleration
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.35; // Gentle, not hectic
    controls.minDistance = 60;
    controls.maxDistance = 1100;
    controls.maxPolarAngle = Math.PI * 0.485; // Prevents dipping below the floor
    controls.target.set(0, 16, 0);
    controlsRef.current = controls;

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, isDark ? 0.35 : 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xD4AF37, isDark ? 1.4 : 1.1);
    dirLight1.position.set(160, 200, 240);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00F0FF, isDark ? 1.1 : 0.8);
    dirLight2.position.set(-180, 80, -200);
    scene.add(dirLight2);

    // STARFIELD
    const stars = createStarfield(2000, 1200);
    scene.add(stars);
    starsRef.current = stars;

    // OBSIDIAN SUBSTRATE FLOOR DISK
    const floorGeo = new THREE.CircleGeometry(420, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x080912 : 0xE2E8F0,
      roughness: 0.15,
      metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -32;
    scene.add(floor);

    // HOLOGRAPHIC GRID OVERLAY
    const gridTex = makeGridTexture(isDark);
    const gridMat = new THREE.MeshBasicMaterial({
      map: gridTex,
      transparent: true,
      opacity: isDark ? 0.65 : 0.45,
      depthWrite: false
    });
    const grid = new THREE.Mesh(new THREE.CircleGeometry(410, 64), gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -31.6;
    scene.add(grid);

    // CONCENTRIC ILLUMINATED ORBITAL RINGS (Gold & Cyan)
    function addInlay(r, tube, colorHex, opacity) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, tube, 8, 120),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity,
          blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -31.4;
      scene.add(ring);
      return ring;
    }
    addInlay(120, 0.4, 0xD4AF37, 0.35);
    addInlay(210, 0.32, 0x00F0FF, 0.3);
    addInlay(310, 0.25, 0xF472B6, 0.22);

    // CENTRAL ORACLE CORE (Octahedron & Concentric Gimbal Rings)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 16, 0);

    const coreMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(6.5, 0),
      new THREE.MeshStandardMaterial({
        color: 0x00F0FF,
        emissive: 0x00F0FF,
        emissiveIntensity: isDark ? 0.6 : 0.3,
        roughness: 0.2,
        metalness: 0.9,
        wireframe: false
      })
    );
    coreGroup.add(coreMesh);
    coreRef.current = coreMesh;

    // Lucy Sprite Hologram (if image available)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/assets/lucy.png',
      (tex) => {
        const spriteMat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: 0.88,
          blending: THREE.NormalBlending,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(18, 30, 1);
        sprite.position.set(0, 9, 0);
        coreGroup.add(sprite);
      },
      undefined,
      () => { /* silent fallback */ }
    );

    // Core orbital rings
    const coreRings = [];
    [14, 20, 27].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.22, 6, 80),
        new THREE.MeshBasicMaterial({
          color: i === 0 ? 0xD4AF37 : i === 1 ? 0x00F0FF : 0xF472B6,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      ring.rotation.x = Math.PI / 2 + (i - 1) * 0.4;
      coreGroup.add(ring);
      coreRings.push(ring);
    });
    ringsRef.current = coreRings;
    scene.add(coreGroup);

    // HALO MESH FOR SELECTED MEMORY NODE
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(7, 0.35, 8, 48),
      new THREE.MeshBasicMaterial({
        color: 0x00F0FF,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    halo.visible = false;
    scene.add(halo);
    haloMeshRef.current = halo;

    // MEMORY NODES GROUP
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const meshes = [];
    const memoryPositions = [];

    memories.forEach((m) => {
      const hex = getClusterHex(m.cluster);
      const radius = Math.max(3.5, (m.weight || 0.85) * 5.2);

      const geo = new THREE.SphereGeometry(radius, 20, 20);
      const mat = new THREE.MeshStandardMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: isDark ? 0.45 : 0.25,
        roughness: 0.25,
        metalness: 0.75
      });
      const nodeMesh = new THREE.Mesh(geo, mat);

      const px = m.x * 2.2;
      const py = m.y * 1.8 + 24;
      const pz = m.z * 2.2;

      nodeMesh.position.set(px, py, pz);
      nodeMesh.userData = { memory: m, originalScale: 1, baseRadius: radius };
      nodeGroup.add(nodeMesh);
      meshes.push(nodeMesh);

      memoryPositions.push(new THREE.Vector3(px, py, pz));
    });
    nodeMeshesRef.current = meshes;

    // SYNAPTIC LINKS (Lines connecting neighboring nodes)
    const linkPositions = [];
    const linkPairs = [];

    for (let i = 0; i < memoryPositions.length; i++) {
      for (let j = i + 1; j < memoryPositions.length; j++) {
        const p1 = memoryPositions[i];
        const p2 = memoryPositions[j];
        const dist = p1.distanceTo(p2);
        if (dist < 155) {
          linkPositions.push(p1.x, p1.y, p1.z);
          linkPositions.push(p2.x, p2.y, p2.z);
          linkPairs.push({ p1, p2, dist });
        }
      }
    }

    if (linkPositions.length > 0) {
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: isDark ? 0xD4AF37 : 0x0A2540,
        transparent: true,
        opacity: isDark ? 0.22 : 0.16,
        depthWrite: false
      });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);
      linkLinesRef.current = lines;

      // SYNAPTIC PULSE PARTICLES (Traveling along links)
      const pulseCount = Math.min(64, linkPairs.length * 3);
      if (pulseCount > 0) {
        const pulseGeo = new THREE.SphereGeometry(0.85, 6, 6);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        });
        const pulseInstanced = new THREE.InstancedMesh(pulseGeo, pulseMat, pulseCount);
        pulseInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(pulseInstanced);
        pulseMeshRef.current = { mesh: pulseInstanced, count: pulseCount, pairs: linkPairs };
      }
    }

    // RAYCASTING FOR INTERACTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredNode = null;

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hoveredNode !== hit) {
          if (hoveredNode) {
            hoveredNode.scale.set(1, 1, 1);
          }
          hoveredNode = hit;
          hoveredNode.scale.set(1.35, 1.35, 1.35);
          renderer.domElement.style.cursor = 'pointer';
        }
        setHoveredMemory(hit.userData.memory);
        setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 12 });
      } else {
        if (hoveredNode) {
          hoveredNode.scale.set(1, 1, 1);
          hoveredNode = null;
          renderer.domElement.style.cursor = 'grab';
        }
        setHoveredMemory(null);
      }
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.memory) {
          onSelectMemory(hit.userData.memory);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('click', onClick);

    // RESIZE OBSERVER
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw && nh) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    ro.observe(container);

    // ANIMATION TICK LOOP
    let animId;
    let clock = new THREE.Clock();
    const dummyMat4 = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const elapsed = clock.getElapsedTime();

      // Controls damping
      controls.update();

      // Starfield subtle slow rotation
      if (starsRef.current) {
        starsRef.current.rotation.y = elapsed * 0.008;
      }

      // Core octahedron smooth spinning
      if (coreRef.current) {
        coreRef.current.rotation.y = elapsed * 0.35;
        coreRef.current.rotation.x = Math.sin(elapsed * 0.4) * 0.2;
      }

      // Gimbal rings counter-rotation
      if (ringsRef.current) {
        ringsRef.current.forEach((ring, idx) => {
          ring.rotation.z = elapsed * (0.2 + idx * 0.07) * (idx % 2 === 0 ? 1 : -1);
        });
      }

      // Selected node halo tracking & pulsing
      if (haloMeshRef.current) {
        if (selectedMemory) {
          haloMeshRef.current.visible = true;
          const hx = selectedMemory.x * 2.2;
          const hy = selectedMemory.y * 1.8 + 24;
          const hz = selectedMemory.z * 2.2;
          haloMeshRef.current.position.set(hx, hy, hz);
          haloMeshRef.current.rotation.z = elapsed * 0.6;
          const s = 1 + Math.sin(elapsed * 2.5) * 0.12;
          haloMeshRef.current.scale.set(s, s, s);
        } else {
          haloMeshRef.current.visible = false;
        }
      }

      // Synaptic pulse particles motion
      if (pulseMeshRef.current) {
        const { mesh: pMesh, count: pCount, pairs } = pulseMeshRef.current;
        for (let i = 0; i < pCount; i++) {
          const pair = pairs[i % pairs.length];
          const phase = ((elapsed * 0.4 + i * (1 / pCount)) % 1);
          dummyPos.lerpVectors(pair.p1, pair.p2, phase);
          dummyMat4.identity().setPosition(dummyPos);
          pMesh.setMatrixAt(i, dummyMat4);
        }
        pMesh.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    tick();

    // CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('click', onClick);

      // Dispose Three.js resources
      renderer.dispose();
      scene.clear();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [memories, isDark, height]);

  // Update selected memory halo position
  useEffect(() => {
    if (!haloMeshRef.current) return;
    if (selectedMemory) {
      haloMeshRef.current.visible = true;
      haloMeshRef.current.position.set(
        selectedMemory.x * 2.2,
        selectedMemory.y * 1.8 + 24,
        selectedMemory.z * 2.2
      );
    } else {
      haloMeshRef.current.visible = false;
    }
  }, [selectedMemory]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.22)', bgcolor: isDark ? '#06070B' : '#EDF2F7' }}>
      
      {/* 3D Canvas Mount Point */}
      <Box ref={mountRef} sx={{ width: '100%', height: '100%', cursor: 'grab', '&:active': { cursor: 'grabbing' } }} />

      {/* Floating HUD Controls Bar (Top Right) */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 14,
          zIndex: 5,
          display: 'flex',
          gap: 0.8,
          alignItems: 'center',
          bgcolor: isDark ? 'rgba(8,10,18,0.85)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 2,
          p: 0.5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}
      >
        <Tooltip title={autoRotate ? "Pause Ambient Orbit" : "Resume Ambient Orbit"}>
          <IconButton size="small" onClick={toggleAutoRotate} sx={{ color: autoRotate ? '#D4AF37' : '#94A3B8' }}>
            {autoRotate ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset 3D Vantage">
          <IconButton size="small" onClick={resetCamera} sx={{ color: '#94A3B8', '&:hover': { color: '#00F0FF' } }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {selectedMemory && (
          <Tooltip title={`Focus ${selectedMemory.id}`}>
            <IconButton size="small" onClick={focusSelectedNode} sx={{ color: '#D4AF37' }}>
              <CenterFocusStrongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={showLabels ? "Hide Node Labels" : "Show Node Labels"}>
          <IconButton size="small" onClick={() => setShowLabels(!showLabels)} sx={{ color: showLabels ? '#00F0FF' : '#64748B' }}>
            {showLabels ? <LabelIcon fontSize="small" /> : <LabelOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Ambient Status Telemetry Badge (Top Left) */}
      <Box sx={{ position: 'absolute', top: 12, left: 14, zIndex: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label="NETRUNNER 3D STRATUM // STDP SYNAPTIC CORE"
          size="small"
          sx={{
            bgcolor: isDark ? 'rgba(8,10,18,0.85)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.3)',
            fontFamily: mono,
            fontWeight: 800,
            fontSize: '0.68rem'
          }}
        />
        <Chip
          label={`${memories.length} NODES ACTIVE`}
          size="small"
          sx={{
            bgcolor: 'rgba(0,240,255,0.12)',
            color: '#00F0FF',
            border: '1px solid rgba(0,240,255,0.3)',
            fontFamily: mono,
            fontWeight: 700,
            fontSize: '0.65rem'
          }}
        />
      </Box>

      {/* Floating Hover HUD Tooltip */}
      {hoveredMemory && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            left: Math.min(tooltipPos.x, (mountRef.current?.clientWidth || 700) - 220),
            top: Math.max(16, tooltipPos.y - 70),
            zIndex: 10,
            pointerEvents: 'none',
            p: 1.5,
            bgcolor: 'rgba(10,12,20,0.94)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${getClusterHex(hoveredMemory.cluster) ? '#' + getClusterHex(hoveredMemory.cluster).toString(16).padStart(6, '0') : '#D4AF37'}`,
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: mono, fontWeight: 800, color: '#00F0FF' }}>
              {hoveredMemory.id}
            </Typography>
            <Chip
              label={hoveredMemory.cluster}
              size="small"
              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(212,175,55,0.18)', color: '#D4AF37', fontFamily: mono }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFF', fontSize: '0.78rem', mb: 0.5, lineHeight: 1.3 }}>
            {hoveredMemory.concept || hoveredMemory.id}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.68rem', fontFamily: mono }}>
            <span>STDP Weight: <strong style={{ color: '#10B981' }}>{hoveredMemory.weight}</strong></span>
            <span>({hoveredMemory.x}, {hoveredMemory.y}, {hoveredMemory.z})</span>
          </Box>
        </Paper>
      )}

      {/* Bottom Guidance Subtitle */}
      <Box sx={{ position: 'absolute', bottom: 10, left: 14, pointerEvents: 'none', zIndex: 4 }}>
        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontFamily: mono, fontSize: '0.72rem' }}>
          ◈ Drag to orbit • Scroll to zoom • Click node to select vector &amp; modulate synaptic tone
        </Typography>
      </Box>

    </Box>
  );
}
