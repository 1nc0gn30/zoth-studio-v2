import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Slider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CodeIcon from '@mui/icons-material/Code';
import {
  SovereignWorkstationShell,
  SovereignCard,
  SovereignStatusPill,
  SovereignCodeBlock,
  useCopy,
  downloadJson,
  downloadText,
  MONO,
  SOV,
  rgba,
  resolveModeAccent,
} from '../sovereign';

const ACCENT_RAW = SOV.gold;

const WIREFRAME_TINTS = [
  { id: 'gold', label: 'Aurum Gold', hex: '#D4AF37', rgbLinear: [0.66, 0.43, 0.04], roughness: 0.24, metallic: 0.92 },
  { id: 'cyan', label: 'Cyber Cyan', hex: '#38BDF8', rgbLinear: [0.04, 0.51, 0.94], roughness: 0.18, metallic: 0.75 },
  { id: 'ivory', label: 'Alabaster Ivory', hex: '#F5F1E6', rgbLinear: [0.91, 0.88, 0.79], roughness: 0.35, metallic: 0.3 },
];

function buildOctahedron() {
  const verts = [
    [0, 1.35, 0],
    [0, -1.35, 0],
    [1.15, 0, 0],
    [-1.15, 0, 0],
    [0, 0, 1.15],
    [0, 0, -1.15],
    [0, 0.55, 0],
    [0, -0.55, 0],
  ];
  const edges = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 4], [4, 3], [3, 5], [5, 2],
    [6, 2], [6, 3], [6, 4], [6, 5],
    [7, 2], [7, 3], [7, 4], [7, 5],
  ];
  return { verts, edges };
}

function buildTorusRing() {
  const majorSegs = 18;
  const minorSegs = 8;
  const R = 1.02;
  const r = 0.36;
  const verts = [];
  const edges = [];

  for (let i = 0; i < majorSegs; i += 1) {
    const u = (i / majorSegs) * Math.PI * 2;
    const cu = Math.cos(u);
    const su = Math.sin(u);
    for (let j = 0; j < minorSegs; j += 1) {
      const v = (j / minorSegs) * Math.PI * 2;
      const cv = Math.cos(v);
      const sv = Math.sin(v);
      verts.push([(R + r * cv) * cu, r * sv, (R + r * cv) * su]);
      const curr = i * minorSegs + j;
      const nextMajor = ((i + 1) % majorSegs) * minorSegs + j;
      const nextMinor = i * minorSegs + ((j + 1) % minorSegs);
      edges.push([curr, nextMajor], [curr, nextMinor]);
    }
  }
  return { verts, edges };
}

function buildCubeLattice() {
  const verts = [];
  const edges = [];
  const coords = [-0.95, 0, 0.95];
  const idx = (x, y, z) => x * 9 + y * 3 + z;

  for (let x = 0; x < 3; x += 1) {
    for (let y = 0; y < 3; y += 1) {
      for (let z = 0; z < 3; z += 1) {
        verts.push([coords[x], coords[y], coords[z]]);
      }
    }
  }

  for (let x = 0; x < 3; x += 1) {
    for (let y = 0; y < 3; y += 1) {
      for (let z = 0; z < 3; z += 1) {
        const a = idx(x, y, z);
        if (x < 2) edges.push([a, idx(x + 1, y, z)]);
        if (y < 2) edges.push([a, idx(x, y + 1, z)]);
        if (z < 2) edges.push([a, idx(x, y, z + 1)]);
      }
    }
  }
  return { verts, edges };
}

function buildSacredPyramid() {
  const verts = [
    [0, 1.32, 0],         // 0 apex
    [-1.15, -0.82, -1.15], // 1 base
    [1.15, -0.82, -1.15],  // 2
    [1.15, -0.82, 1.15],   // 3
    [-1.15, -0.82, 1.15],  // 4
    [-0.62, 0.16, -0.62],  // 5 mid collar
    [0.62, 0.16, -0.62],   // 6
    [0.62, 0.16, 0.62],    // 7
    [-0.62, 0.16, 0.62],   // 8
    [0, -0.82, 0],         // 9 base center
  ];
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
    [5, 6], [6, 7], [7, 8], [8, 5],
    [1, 3], [2, 4],
    [0, 9], [5, 9], [6, 9], [7, 9], [8, 9],
  ];
  return { verts, edges };
}

const GEOMETRIES = [
  {
    id: 'octahedron',
    label: 'Octahedron',
    summary: 'Dual-core faceted bipyramid with internal meridian struts.',
    mesh: buildOctahedron(),
  },
  {
    id: 'torus-ring',
    label: 'Torus Ring',
    summary: '18×8 parametric torus loop with continuous latitudinal/longitudinal rings.',
    mesh: buildTorusRing(),
  },
  {
    id: 'cube-lattice',
    label: 'Cube Lattice',
    summary: '3×3×3 orthogonal structural voxel lattice (27 nodes, 54 struts).',
    mesh: buildCubeLattice(),
  },
  {
    id: 'sacred-pyramid',
    label: 'Sacred Pyramid',
    summary: 'Stepped four-face pyramid with suspended collar ring and axial tension core.',
    mesh: buildSacredPyramid(),
  },
];

function generateBlenderScript({ geometry, tint, scale, fov, rotSpeed }) {
  const [r, g, b] = tint.rgbLinear;
  const geomSlug = geometry.id.replace(/-/g, '_');

  const geometryBlock = {
    octahedron: `bm = bmesh.new()
bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.15)
mesh = bpy.data.meshes.new("Zoth_Octahedron")
bm.to_mesh(mesh)
bm.free()
obj = bpy.data.objects.new("Zoth_Octahedron", mesh)
bpy.context.collection.objects.link(obj)`,
    'torus-ring': `bpy.ops.mesh.primitive_torus_add(
    major_segments=24,
    minor_segments=12,
    major_radius=1.02,
    minor_radius=0.36,
    location=(0.0, 0.0, 0.0),
)
obj = bpy.context.active_object
obj.name = "Zoth_Torus_Ring"`,
    'cube-lattice': `bpy.ops.mesh.primitive_cube_add(size=1.9, location=(0.0, 0.0, 0.0))
obj = bpy.context.active_object
obj.name = "Zoth_Cube_Lattice"
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.subdivide(number_cuts=2)
bpy.ops.object.mode_set(mode='OBJECT')`,
    'sacred-pyramid': `bpy.ops.mesh.primitive_cone_add(
    vertices=4,
    radius1=1.45,
    radius2=0.0,
    depth=2.14,
    location=(0.0, 0.0, 0.0),
)
obj = bpy.context.active_object
obj.name = "Zoth_Sacred_Pyramid"`,
  }[geometry.id];

  const radPerFrame = (rotSpeed / 60).toFixed(5);

  return `"""
Zoth Scene Foundry — Blender 4.x Procedural Generator
Geometry: ${geometry.label} (${geometry.id})
Tint:     ${tint.label} (${tint.hex})
"""
import math
import bpy
import bmesh

# 1. Clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.fps = 60
scene.frame_start = 1
scene.frame_end = 240

# 2. Construct ${geometry.label}
${geometryBlock}
obj.scale = (${scale.toFixed(2)}, ${scale.toFixed(2)}, ${scale.toFixed(2)})

# Wireframe architectural modifier
wire = obj.modifiers.new(name="SovereignWireframe", type='WIREFRAME')
wire.thickness = 0.032
wire.use_replace = True

# 3. Assign Principled BSDF metallic wireframe material (${tint.hex})
mat = bpy.data.materials.new(name="Zoth_${geomSlug}_${tint.id}")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (${r}, ${g}, ${b}, 1.0)
    bsdf.inputs["Metallic"].default_value = ${tint.metallic}
    bsdf.inputs["Roughness"].default_value = ${tint.roughness}
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (${r}, ${g}, ${b}, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.45
obj.data.materials.append(mat)

# 4. Keyframe turntable rotation (${rotSpeed.toFixed(2)} rad/s -> ${radPerFrame} rad/frame)
obj.rotation_euler = (0.32, 0.0, 0.0)
obj.keyframe_insert(data_path="rotation_euler", frame=1)
obj.rotation_euler = (0.32, 0.0, ${(rotSpeed * 4).toFixed(3)})
obj.keyframe_insert(data_path="rotation_euler", frame=240)

# 5. Camera matching FOV = ${fov} deg
cam_data = bpy.data.cameras.new(name="FoundryCamera")
cam_data.angle = math.radians(${fov})
cam_obj = bpy.data.objects.new("FoundryCamera", cam_data)
bpy.context.collection.objects.link(cam_obj)
cam_obj.location = (0.0, -4.6, 1.35)
cam_obj.rotation_euler = (math.radians(74.0), 0.0, 0.0)
scene.camera = cam_obj

# 6. Key & Rim Area Lighting
for name, loc, energy in [
    ("KeyLight", (3.8, -3.5, 4.2), 260.0),
    ("RimLight", (-3.6, 3.2, 2.8), 180.0),
]:
    light_data = bpy.data.lights.new(name=name, type='AREA')
    light_data.energy = energy
    light_data.size = 2.2
    light_obj = bpy.data.objects.new(name=name, object_data=light_data)
    bpy.context.collection.objects.link(light_obj)
    light_obj.location = loc

print("Zoth Scene Foundry build complete:", obj.name)
`;
}

export default function ZothSceneFoundryGodModeTool() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = resolveModeAccent(ACCENT_RAW, isDark);
  const { copied, copy } = useCopy();

  const [geometryId, setGeometryId] = useState('octahedron');
  const [tintId, setTintId] = useState('gold');
  const [rotSpeed, setRotSpeed] = useState(0.65);
  const [fov, setFov] = useState(52);
  const [scale, setScale] = useState(1.1);
  const [paused, setPaused] = useState(false);
  const [codeTab, setCodeTab] = useState('bpy');

  const canvasRef = useRef(null);
  const anglesRef = useRef({ pitch: 0.38, yaw: 0.52 });
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });

  const activeGeometry = useMemo(
    () => GEOMETRIES.find((g) => g.id === geometryId) || GEOMETRIES[0],
    [geometryId],
  );
  const activeTint = useMemo(
    () => WIREFRAME_TINTS.find((t) => t.id === tintId) || WIREFRAME_TINTS[0],
    [tintId],
  );

  // Software-projected 3D wireframe renderer on 2D HTML5 <canvas> (zero WebGL bloat)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let rafId = 0;
    let lastTs = typeof performance !== 'undefined' ? performance.now() : 0;

    const drawFrame = (ts) => {
      const dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000));
      lastTs = ts;

      if (!paused && !dragRef.current.active) {
        anglesRef.current.yaw += rotSpeed * dt;
        anglesRef.current.pitch = 0.35 + Math.sin(anglesRef.current.yaw * 0.45) * 0.16;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 560;
      const cssH = canvas.clientHeight || 340;
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep obsidian viewport stage so Gold, Cyan, and Ivory wireframes always render with crisp contrast
      ctx.fillStyle = '#06080E';
      ctx.fillRect(0, 0, cssW, cssH);

      // Subtle background vignette + radial glow
      const grad = ctx.createRadialGradient(
        cssW * 0.5,
        cssH * 0.48,
        16,
        cssW * 0.5,
        cssH * 0.48,
        Math.max(cssW, cssH) * 0.58,
      );
      grad.addColorStop(0, rgba(activeTint.hex, 0.14));
      grad.addColorStop(1, 'rgba(6,8,14,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cssW, cssH);

      const cx = cssW * 0.5;
      const cy = cssH * 0.5;
      const fovRad = (fov * Math.PI) / 180;
      const focal = (cssH * 0.52) / Math.tan(fovRad * 0.5);
      const camZ = 4.4;

      const sinY = Math.sin(anglesRef.current.yaw);
      const cosY = Math.cos(anglesRef.current.yaw);
      const sinX = Math.sin(anglesRef.current.pitch);
      const cosX = Math.cos(anglesRef.current.pitch);

      const projectPoint = (x0, y0, z0) => {
        const sx = x0 * scale;
        const sy = y0 * scale;
        const sz = z0 * scale;

        // Yaw around Y
        const x1 = sx * cosY - sz * sinY;
        const z1 = sx * sinY + sz * cosY;
        // Pitch around X
        const y2 = sy * cosX - z1 * sinX;
        const z2 = sy * sinX + z1 * cosX;

        const depth = camZ - z2;
        if (depth <= 0.25) return null;
        const p = focal / depth;
        return { x: cx + x1 * p, y: cy - y2 * p, z: z2, depth };
      };

      // Perspective ground floor reference grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(activeTint.hex, 0.12);
      const gridY = -1.25 / Math.max(0.5, scale);
      for (let g = -2; g <= 2; g += 1) {
        const a1 = projectPoint(g * 0.85, gridY, -1.7);
        const b1 = projectPoint(g * 0.85, gridY, 1.7);
        if (a1 && b1) {
          ctx.beginPath();
          ctx.moveTo(a1.x, a1.y);
          ctx.lineTo(b1.x, b1.y);
          ctx.stroke();
        }
        const a2 = projectPoint(-1.7, gridY, g * 0.85);
        const b2 = projectPoint(1.7, gridY, g * 0.85);
        if (a2 && b2) {
          ctx.beginPath();
          ctx.moveTo(a2.x, a2.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.stroke();
        }
      }

      // Project geometry vertices
      const projected = activeGeometry.mesh.verts.map(([vx, vy, vz]) => projectPoint(vx, vy, vz));

      // Depth-sort edges back-to-front
      const sortedEdges = activeGeometry.mesh.edges
        .map(([i, j]) => {
          const pA = projected[i];
          const pB = projected[j];
          if (!pA || !pB) return null;
          return { pA, pB, avgZ: (pA.z + pB.z) * 0.5 };
        })
        .filter(Boolean)
        .sort((e1, e2) => e1.avgZ - e2.avgZ);

      sortedEdges.forEach(({ pA, pB, avgZ }) => {
        const norm = Math.max(0, Math.min(1, (avgZ + 1.8) / 3.6));
        ctx.strokeStyle = rgba(activeTint.hex, 0.24 + norm * 0.72);
        ctx.lineWidth = 0.85 + norm * 1.45;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      });

      // Draw crisp vertex nodes
      projected.forEach((pt) => {
        if (!pt) return;
        const norm = Math.max(0, Math.min(1, (pt.z + 1.8) / 3.6));
        ctx.fillStyle = rgba(activeTint.hex, 0.35 + norm * 0.65);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.4 + norm * 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Corner HUD telemetry overlay
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = rgba(activeTint.hex, 0.88);
      ctx.fillText(
        `${activeGeometry.label.toUpperCase()} · ${activeGeometry.mesh.verts.length}V / ${activeGeometry.mesh.edges.length}E`,
        14,
        22,
      );
      ctx.fillStyle = 'rgba(226, 232, 240, 0.72)';
      ctx.fillText(
        `FOV ${fov}° · SCALE ${scale.toFixed(2)}× · ${paused ? 'PAUSED' : `${rotSpeed.toFixed(2)} RAD/S`}`,
        14,
        cssH - 14,
      );

      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeGeometry, activeTint, rotSpeed, fov, scale, paused]);

  const handlePointerDown = (e) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    anglesRef.current.yaw += dx * 0.01;
    anglesRef.current.pitch = Math.max(-1.25, Math.min(1.25, anglesRef.current.pitch + dy * 0.01));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const resetCamera = () => {
    anglesRef.current = { pitch: 0.38, yaw: 0.52 };
    setRotSpeed(0.65);
    setFov(52);
    setScale(1.1);
    setPaused(false);
  };

  const focalLengthMm = useMemo(
    () => Number((36 / (2 * Math.tan(((fov * Math.PI) / 180) * 0.5))).toFixed(1)),
    [fov],
  );

  const sceneManifest = useMemo(
    () => ({
      schema: 'zoth.scene-foundry.manifest.v1',
      renderer: 'software-2d-perspective-wireframe',
      geometry: {
        id: activeGeometry.id,
        label: activeGeometry.label,
        vertex_count: activeGeometry.mesh.verts.length,
        edge_count: activeGeometry.mesh.edges.length,
        scale: Number(scale.toFixed(2)),
      },
      camera: {
        fov_degrees: fov,
        focal_length_35mm_eq: focalLengthMm,
        distance: 4.4,
      },
      animation: {
        turntable_rad_per_sec: Number(rotSpeed.toFixed(2)),
        fps: 60,
        loop_frames: 240,
      },
      material: {
        preset: activeTint.id,
        label: activeTint.label,
        hex: activeTint.hex,
        linear_rgb: activeTint.rgbLinear,
        metallic: activeTint.metallic,
        roughness: activeTint.roughness,
        wireframe_thickness: 0.032,
      },
    }),
    [activeGeometry, scale, fov, focalLengthMm, rotSpeed, activeTint],
  );

  const manifestJson = useMemo(() => JSON.stringify(sceneManifest, null, 2), [sceneManifest]);

  const blenderScript = useMemo(
    () =>
      generateBlenderScript({
        geometry: activeGeometry,
        tint: activeTint,
        scale,
        fov,
        rotSpeed,
      }),
    [activeGeometry, activeTint, scale, fov, rotSpeed],
  );

  const kpis = [
    {
      label: 'Active Geometry',
      value: activeGeometry.label,
      unit: `${activeGeometry.mesh.verts.length}v · ${activeGeometry.mesh.edges.length}e`,
      accent: activeTint.hex,
    },
    {
      label: 'Camera Optics',
      value: `${fov}°`,
      unit: `${focalLengthMm}mm eq`,
      accent: SOV.cyber,
    },
    {
      label: 'Scale / Spin',
      value: `${scale.toFixed(2)}×`,
      unit: paused ? 'Paused' : `${rotSpeed.toFixed(2)} rad/s`,
      accent: SOV.emerald,
    },
    {
      label: 'Pipeline',
      value: 'Canvas 2D',
      unit: 'Zero WebGL bloat',
      accent: SOV.gold,
    },
  ];

  const statusNode = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <SovereignStatusPill
        status={paused ? 'standby' : 'online'}
        label={paused ? 'VIEWPORT PAUSED · DRAG CANVAS TO ORBIT' : '60 FPS SOFTWARE 3D PROJECTION · DRAG TO ORBIT'}
        sx={{ maxWidth: '100%', '& .MuiTypography-root': { whiteSpace: 'normal', lineHeight: 1.25 } }}
      />
    </Box>
  );

  const actions = [
    {
      label: copied === 'bpy' ? 'Copied Blender Python' : 'Copy Blender bpy Script',
      icon: copied === 'bpy' ? <CheckIcon fontSize="small" /> : <CodeIcon fontSize="small" />,
      onClick: () => copy(blenderScript, 'bpy'),
      primary: true,
    },
    {
      label: 'Download scene-manifest.json',
      icon: <DownloadIcon fontSize="small" />,
      onClick: () => downloadJson(sceneManifest, 'scene-manifest.json'),
    },
    {
      label: paused ? 'Resume Spin' : 'Pause Spin',
      icon: paused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />,
      onClick: () => setPaused((p) => !p),
    },
    {
      label: 'Reset Rig',
      icon: <RestartAltIcon fontSize="small" />,
      onClick: resetCamera,
    },
  ];

  const leftPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="01"
        eyebrow="PARAMETRIC GEOMETRY & WIREFRAME TINT"
        title="Configure 3D Specimen"
        subtitle={activeGeometry.summary}
        accent={ACCENT_RAW}
      >
        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          SELECT GEOMETRY (4 PARAMETRIC MESHES)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {GEOMETRIES.map((geom) => {
            const active = geom.id === activeGeometry.id;
            return (
              <Chip
                key={geom.id}
                label={geom.label}
                clickable
                onClick={() => setGeometryId(geom.id)}
                sx={{
                  minHeight: 38,
                  fontFamily: MONO,
                  fontSize: '0.73rem',
                  fontWeight: active ? 800 : 500,
                  bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                  color: active ? accent : 'text.primary',
                  border: `1px solid ${active ? accent : 'rgba(148,163,184,0.32)'}`,
                }}
              />
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
          WIREFRAME MATERIAL TINT
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {WIREFRAME_TINTS.map((t) => {
            const active = t.id === activeTint.id;
            const chipInk = t.id === 'ivory' && !isDark ? '#475467' : resolveModeAccent(t.hex, isDark);
            return (
              <Chip
                key={t.id}
                label={t.label}
                clickable
                onClick={() => setTintId(t.id)}
                sx={{
                  minHeight: 36,
                  fontFamily: MONO,
                  fontSize: '0.72rem',
                  fontWeight: active ? 800 : 500,
                  bgcolor: active ? rgba(chipInk, 0.16) : 'transparent',
                  color: active ? chipInk : 'text.secondary',
                  border: `1px solid ${active ? chipInk : 'rgba(148,163,184,0.3)'}`,
                }}
              />
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700 }}>
                ROTATION SPEED
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: accent, fontWeight: 700 }}>
                {rotSpeed.toFixed(2)} rad/s
              </Typography>
            </Box>
            <Slider
              value={rotSpeed}
              min={0}
              max={2.8}
              step={0.05}
              onChange={(_, v) => setRotSpeed(Number(v))}
              aria-label="Rotation Speed"
              sx={{ color: accent }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700 }}>
                CAMERA FOV
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: accent, fontWeight: 700 }}>
                {fov}° ({focalLengthMm}mm)
              </Typography>
            </Box>
            <Slider
              value={fov}
              min={28}
              max={95}
              step={1}
              onChange={(_, v) => setFov(Number(v))}
              aria-label="Camera Field of View"
              sx={{ color: accent }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700 }}>
                SPECIMEN SCALE
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: '0.76rem', color: accent, fontWeight: 700 }}>
                {scale.toFixed(2)}×
              </Typography>
            </Box>
            <Slider
              value={scale}
              min={0.5}
              max={1.75}
              step={0.05}
              onChange={(_, v) => setScale(Number(v))}
              aria-label="Specimen Scale"
              sx={{ color: accent }}
            />
          </Box>
        </Box>
      </SovereignCard>

      <SovereignCard
        index="02"
        eyebrow="SCENE MANIFEST JSON"
        title="Downloadable scene-manifest.json"
        subtitle="Exact camera optics, geometry topology, and PBR wireframe material payload"
        accent={ACCENT_RAW}
      >
        <SovereignCodeBlock
          title="scene-manifest.json"
          badge="JSON"
          code={manifestJson}
          filename="scene-manifest.json"
          accent={ACCENT_RAW}
          maxHeight={260}
        />
      </SovereignCard>
    </Box>
  );

  const rightPane = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <SovereignCard
        index="03"
        eyebrow="SOFTWARE 3D PERSPECTIVE VIEWPORT"
        title={`${activeGeometry.label} · ${activeTint.label}`}
        subtitle="Drag directly on the canvas to orbit manually; zero WebGL context allocation"
        accent={ACCENT_RAW}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 280, sm: 340, md: 360 },
            borderRadius: 1.75,
            overflow: 'hidden',
            border: `1px solid ${rgba(activeTint.hex, 0.42)}`,
            bgcolor: '#06080E',
            cursor: 'grab',
            touchAction: 'none',
            '&:active': { cursor: 'grabbing' },
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            aria-label={`Interactive 3D wireframe preview of ${activeGeometry.label}`}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </Box>
      </SovereignCard>

      <SovereignCard
        index="04"
        eyebrow="BLENDER 4.X PYTHON GENERATOR"
        title="Exportable bpy Build Script"
        subtitle="Run via blender --background --python scene_foundry.py or paste into Blender Scripting tab"
        accent={ACCENT_RAW}
        right={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[
              { id: 'bpy', label: 'Blender .py' },
              { id: 'json', label: 'Manifest .json' },
            ].map((tab) => {
              const active = codeTab === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={tab.label}
                  clickable
                  onClick={() => setCodeTab(tab.id)}
                  sx={{
                    minHeight: 32,
                    fontFamily: MONO,
                    fontSize: '0.7rem',
                    fontWeight: active ? 800 : 500,
                    bgcolor: active ? rgba(accent, 0.16) : 'transparent',
                    color: active ? accent : 'text.secondary',
                    border: `1px solid ${active ? accent : 'rgba(148,163,184,0.3)'}`,
                  }}
                />
              );
            })}
          </Box>
        }
      >
        <SovereignCodeBlock
          title={codeTab === 'bpy' ? `scene_foundry_${activeGeometry.id.replace(/-/g, '_')}.py` : 'scene-manifest.json'}
          badge={codeTab === 'bpy' ? 'BLENDER 4.X BPY' : 'JSON'}
          code={codeTab === 'bpy' ? blenderScript : manifestJson}
          filename={codeTab === 'bpy' ? `scene_foundry_${activeGeometry.id.replace(/-/g, '_')}.py` : 'scene-manifest.json'}
          accent={ACCENT_RAW}
          maxHeight={340}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={copied === 'script' ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            onClick={() => copy(blenderScript, 'script')}
            sx={{
              minHeight: 42,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: '0.74rem',
              textTransform: 'none',
              bgcolor: isDark ? SOV.gold : '#101828',
              color: isDark ? '#08080B' : '#FFFFFF',
            }}
          >
            {copied === 'script' ? 'Copied Blender Script' : 'Copy Blender .py'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={() =>
              downloadText(
                blenderScript,
                `scene_foundry_${activeGeometry.id.replace(/-/g, '_')}.py`,
                'text/x-python;charset=utf-8',
              )
            }
            sx={{ minHeight: 42, fontFamily: MONO, fontSize: '0.74rem', textTransform: 'none' }}
          >
            Download .py
          </Button>
        </Box>
      </SovereignCard>
    </Box>
  );

  return (
    <SovereignWorkstationShell
      id="zoth-scene-foundry"
      category="MEDIA & 3D · PARAMETRIC SCENE BUILDER"
      title="Zoth Scene Foundry 3D Workbench"
      subtitle="Interactive software-projected 3D wireframe stage supporting 4 parametric geometries with live camera optics, downloadable scene-manifest.json, and Blender 4.x bpy Python script export."
      version="1.0.0"
      variant="scanline-grid"
      accent={ACCENT_RAW}
      metrics={kpis}
      status={statusNode}
      actions={actions}
      leftPane={leftPane}
      rightPane={rightPane}
      leftCols={5}
      rightCols={7}
    />
  );
}
