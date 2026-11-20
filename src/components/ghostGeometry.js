// Shared parametric 3D GhostByte Specimen geometry & volumetric renderer
// Powers GhostByteMark (live logos/emblems/favicon), GhostByte3D (hero stage), and IntroDirector (route intros).

export const BRAILLE_RAMP = ['⠀', '⠁', '⠃', '⠇', '⠏', '⠟', '⠿', '⡿', '⣿']

export const SPECIMEN_PALETTES = {
  hologram: {
    dark: { primary: '#00d5ff', secondary: '#5b3df5', eye: '#32ff85', core: [32, 26, 96] },
    light: { primary: '#0284c7', secondary: '#4f46e5', eye: '#00d5ff', core: [12, 28, 56] },
  },
  emerald: {
    dark: { primary: '#32ff85', secondary: '#00d5ff', eye: '#00d5ff', core: [12, 58, 46] },
    light: { primary: '#047857', secondary: '#0284c7', eye: '#32ff85', core: [10, 44, 36] },
  },
  amber: {
    dark: { primary: '#ffb800', secondary: '#00d5ff', eye: '#00d5ff', core: [72, 44, 10] },
    light: { primary: '#b45309', secondary: '#0284c7', eye: '#fbbf24', core: [50, 30, 8] },
  },
  quantum: {
    dark: { primary: '#a855f7', secondary: '#32ff85', eye: '#32ff85', core: [56, 20, 84] },
    light: { primary: '#6d28d9', secondary: '#047857', eye: '#38bdf8', core: [36, 14, 60] },
  },
  prism: {
    dark: { primary: '#38bdf8', secondary: '#f472b6', eye: '#facc15', core: [34, 26, 76] },
    light: { primary: '#0369a1', secondary: '#be185d', eye: '#f59e0b', core: [15, 23, 42] },
  },
}

export function createGhostGeometry(rings = 34, segs = 48) {
  const vertices = []
  const ringGrid = []

  for (let i = 0; i <= rings; i++) {
    const v = i / rings
    const row = []
    for (let j = 0; j < segs; j++) {
      const u = (j / segs) * Math.PI * 2
      let r = 0
      let y = 0

      if (v < 0.42) {
        const theta = (v / 0.42) * (Math.PI * 0.5)
        r = Math.sin(theta) * 0.96
        y = -Math.cos(theta) * 1.02 - 0.24
      } else {
        const bv = (v - 0.42) / 0.58
        const flare = 1 + bv * 0.16 * Math.sin(u * 5 + 0.2)
        r = 0.96 * flare
        const tendrilWave = Math.cos(u * 5)
        const centerExtend = Math.max(0, Math.cos(u)) * 0.34
        const drop = (0.82 + 0.24 * tendrilWave + centerExtend) * bv
        y = -0.24 + drop * 1.32
      }

      const x = Math.sin(u) * r
      const z = Math.cos(u) * r * 0.88
      const nx = Math.sin(u)
      const nz = Math.cos(u)
      const ny = v < 0.42 ? -Math.cos((v / 0.42) * Math.PI * 0.5) : 0.14
      const nLen = Math.hypot(nx, ny, nz) || 1

      let feature = null
      if (z > 0.22) {
        const lx = (x + 0.33) * 1.05 + (y + 0.42) * 0.22
        const ly = (y + 0.42) * 0.88 - (x + 0.33) * 0.18
        const rx = (x - 0.33) * 1.05 - (y + 0.42) * 0.22
        const ry = (y + 0.42) * 0.88 + (x - 0.33) * 0.18
        const dL = Math.hypot(lx, ly)
        const dR = Math.hypot(rx, ry)
        const mouthCurveY = -0.04 + Math.pow(x * 1.35, 2) * 0.42
        const isMouth = Math.abs(x) < 0.24 && Math.abs(y - mouthCurveY) < 0.048

        if (dL < 0.175) feature = 'eyeL'
        else if (dR < 0.175) feature = 'eyeR'
        else if (isMouth) feature = 'mouth'
      }

      const idx = vertices.length
      vertices.push({
        x,
        y,
        z,
        u,
        v,
        nx: nx / nLen,
        ny: ny / nLen,
        nz: nz / nLen,
        feature,
        seed: (i * 47 + j * 13) % 100,
      })
      row.push(idx)
    }
    ringGrid.push(row)
  }

  return { vertices, ringGrid, rings, segs }
}

export const GHOST_GEO_HIGH = createGhostGeometry(34, 48)
export const GHOST_GEO_MED = createGhostGeometry(22, 32)
export const GHOST_GEO_MARK = createGhostGeometry(16, 26)

function hexToRgb(hex) {
  const clean = String(hex || '#00d5ff').replace('#', '')
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

/**
 * Renders a single 60fps volumetric 3D GhostByte Specimen frame onto any 2D canvas context.
 */
export function renderGhostSpecimenFrame(ctx, {
  w,
  h,
  t,
  geo = GHOST_GEO_MARK,
  variant = 'hologram',
  isDark = true,
  yaw = 0,
  pitch = -0.06,
  cursorX = 0,
  cursorY = 0,
  blink = 0,
  assemble = 1,
  pulse = 0,
  showRings = true,
  wireframe = true,
  clearCanvas = true,
  bgColor = null,
}) {
  const palGroup = SPECIMEN_PALETTES[variant] || SPECIMEN_PALETTES.hologram
  const pal = isDark ? palGroup.dark : palGroup.light
  const [pr, pg, pb] = hexToRgb(pal.primary)
  const [sr, sg, sb] = hexToRgb(pal.secondary)
  const [cr, cg, cb] = pal.core

  if (clearCanvas) {
    ctx.clearRect(0, 0, w, h)
  }
  if (bgColor) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)
  }

  const minDim = Math.min(w, h)
  const aura = ctx.createRadialGradient(w * 0.5, h * 0.48, minDim * 0.03, w * 0.5, h * 0.48, minDim * 0.48)
  aura.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${isDark ? 0.24 : 0.14})`)
  aura.addColorStop(0.55, `rgba(${sr}, ${sg}, ${sb}, ${isDark ? 0.09 : 0.05})`)
  aura.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`)
  ctx.fillStyle = aura
  ctx.fillRect(0, 0, w, h)

  const cosY = Math.cos(yaw)
  const sinY = Math.sin(yaw)
  const cosX = Math.cos(pitch)
  const sinX = Math.sin(pitch)
  const bobY = Math.sin(t * 2.5) * 0.06
  const camZ = 3.16
  const fov = minDim * 0.88

  // Counter-rotating 3D gyroscope orbital rings
  if (showRings && assemble > 0.35) {
    const ringAlphaScale = Math.min(1, (assemble - 0.35) / 0.65)
    for (let rIdx = 0; rIdx < 2; rIdx++) {
      const rad = rIdx === 0 ? 1.18 : 1.46
      const tiltZ = rIdx === 0 ? 0.2 : -0.28
      const cosZ = Math.cos(tiltZ)
      const sinZ = Math.sin(tiltZ)
      ctx.beginPath()
      for (let a = 0; a <= Math.PI * 2 + 0.12; a += 0.12) {
        const ang = a + t * (rIdx === 0 ? 1.2 : -0.85)
        const rx = Math.cos(ang) * rad
        const ry = 0.92 + Math.sin(ang * 2 + t * 1.8) * 0.04
        const rz = Math.sin(ang) * rad
        const rx2 = rx * cosZ - (ry - 0.92) * sinZ
        const ry2 = 0.92 + rx * sinZ + (ry - 0.92) * cosZ
        const y1 = ry2 * cosX - rz * sinX
        const z1 = ry2 * sinX + rz * cosX
        const depth = z1 + camZ
        const sx = w * 0.5 + (rx2 / depth) * fov
        const sy = h * 0.48 + (y1 / depth) * fov
        if (a === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.strokeStyle =
        rIdx === 0
          ? `rgba(${pr}, ${pg}, ${pb}, ${(isDark ? 0.5 : 0.44) * ringAlphaScale})`
          : `rgba(${sr}, ${sg}, ${sb}, ${(isDark ? 0.32 : 0.28) * ringAlphaScale})`
      ctx.lineWidth = Math.min(2.4, Math.max(0.85, minDim * (rIdx === 0 ? 0.008 : 0.005)))
      ctx.stroke()
    }
  }

  const { vertices, ringGrid, rings, segs } = geo
  const proj = new Array(vertices.length)
  const scatter = 1 - assemble

  for (let i = 0; i < vertices.length; i++) {
    const vtx = vertices[i]
    const clothAmp = vtx.v > 0.38 ? (vtx.v - 0.38) / 0.62 : 0
    const ripple = clothAmp * Math.sin(vtx.u * 5 + t * 4.4) * 0.07
    const swayX = clothAmp * Math.cos(t * 2.7 + vtx.v * 3) * 0.042
    const burst = 1 + pulse * (0.14 + (vtx.seed % 8) * 0.018)

    const sAngle = vtx.seed * 0.62 + t * 2.4
    const sxOff = scatter * Math.cos(sAngle) * (1.2 + (vtx.seed % 7) * 0.22)
    const syOff = scatter * Math.sin(sAngle * 1.3) * 1.35
    const szOff = scatter * Math.sin(sAngle * 0.7) * 1.1

    let px = (vtx.x * (1 + ripple) + swayX) * burst + sxOff
    let py = (vtx.y + bobY + clothAmp * Math.cos(vtx.u * 3 - t * 3.5) * 0.04) * burst + syOff
    const pz = vtx.z * (1 + ripple) * burst + szOff

    if (vtx.feature === 'eyeL' || vtx.feature === 'eyeR') {
      px += cursorX * 0.045
      py += cursorY * 0.045
    }

    const x1 = px * cosY + pz * sinY
    const z1 = -px * sinY + pz * cosY
    const y2 = py * cosX - z1 * sinX
    const z2 = py * sinX + z1 * cosX

    const nx1 = vtx.nx * cosY + vtx.nz * sinY
    const nz1 = -vtx.nx * sinY + vtx.nz * cosY
    const nz2 = vtx.ny * sinX + nz1 * cosX

    const depth = z2 + camZ
    const sx = w * 0.5 + (x1 / depth) * fov
    const sy = h * 0.46 + (y2 / depth) * fov

    const fresnel = Math.pow(1 - Math.min(1, Math.abs(nz2)), 1.6)
    const spec = Math.pow(Math.max(0, nx1 * 0.44 - vtx.ny * 0.45 + nz2 * 0.76), 10)

    proj[i] = { sx, sy, z: z2, fresnel, spec, feature: vtx.feature, seed: vtx.seed }
  }

  // Geodesic wireframe lattice
  if (wireframe && assemble > 0.5) {
    ctx.lineWidth = Math.min(1.3, Math.max(0.45, minDim * 0.003))
    ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${(isDark ? 0.18 : 0.22) * assemble})`
    for (let i = 0; i <= rings; i += 2) {
      ctx.beginPath()
      for (let j = 0; j <= segs; j += 2) {
        const p = proj[ringGrid[i][j % segs]]
        if (j === 0) ctx.moveTo(p.sx, p.sy)
        else ctx.lineTo(p.sx, p.sy)
      }
      ctx.stroke()
    }
    for (let j = 0; j < segs; j += 4) {
      ctx.beginPath()
      for (let i = 0; i <= rings; i += 2) {
        const p = proj[ringGrid[i][j]]
        if (i === 0) ctx.moveTo(p.sx, p.sy)
        else ctx.lineTo(p.sx, p.sy)
      }
      ctx.stroke()
    }
  }

  // Back-to-front crisp voxel splat shading (proportionally scaled to mesh density & canvas size)
  const sorted = proj.slice().sort((a, b) => a.z - b.z)
  const densityScale = rings >= 30 ? 0.0072 : rings >= 20 ? 0.011 : 0.022
  const baseDot = Math.max(1.05, minDim * densityScale)
  const featureDot = Math.max(1.45, baseDot * 1.45)

  for (let i = 0; i < sorted.length; i++) {
    const pt = sorted[i]
    if (pt.feature === 'eyeL' || pt.feature === 'eyeR' || pt.feature === 'mouth') {
      if ((pt.feature === 'eyeL' || pt.feature === 'eyeR') && blink > 0.55) {
        continue
      }
      ctx.fillStyle = isDark ? '#030816' : '#090e1a'
      ctx.beginPath()
      ctx.arc(pt.sx, pt.sy, featureDot, 0, Math.PI * 2)
      ctx.fill()
      continue
    }

    const rim = pt.fresnel
    const rad = baseDot * (0.72 + rim * 0.92)
    const r = Math.min(255, Math.round(cr * (1 - rim) + pr * rim + pt.spec * 95))
    const g = Math.min(255, Math.round(cg * (1 - rim) + pg * rim + pt.spec * 95))
    const b = Math.min(255, Math.round(cb * (1 - rim) + pb * rim + pt.spec * 100))
    const alphaVal = isDark ? 0.42 + rim * 0.56 : 0.66 + rim * 0.34

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alphaVal})`
    ctx.beginPath()
    ctx.arc(pt.sx, pt.sy, rad, 0, Math.PI * 2)
    ctx.fill()
  }

  // Project two exact symmetric 3D glowing pupils (or blinking laser slits) in front of eye sockets
  if (assemble > 0.55) {
    const eyes = [
      { x: -0.31 + cursorX * 0.075, y: -0.43 + bobY + cursorY * 0.065, z: 0.80 },
      { x: 0.31 + cursorX * 0.075, y: -0.43 + bobY + cursorY * 0.065, z: 0.80 },
    ]
    for (const eye of eyes) {
      const x1 = eye.x * cosY + eye.z * sinY
      const z1 = -eye.x * sinY + eye.z * cosY
      const y2 = eye.y * cosX - z1 * sinX
      const z2 = eye.y * sinX + z1 * cosX
      if (z2 < 0.1) continue
      const depth = z2 + camZ
      const ex = w * 0.5 + (x1 / depth) * fov
      const ey = h * 0.46 + (y2 / depth) * fov
      const pupilR = Math.max(1.3, minDim * 0.022)

      if (blink > 0.55) {
        ctx.fillStyle = pal.eye
        ctx.fillRect(ex - pupilR * 1.6, ey - Math.max(0.8, pupilR * 0.25), pupilR * 3.2, Math.max(1.6, pupilR * 0.5))
      } else {
        // Outer eye glow
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, pupilR * 2.4)
        eg.addColorStop(0, pal.eye)
        eg.addColorStop(0.45, `rgba(${pr}, ${pg}, ${pb}, 0.55)`)
        eg.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`)
        ctx.fillStyle = eg
        ctx.beginPath()
        ctx.arc(ex, ey, pupilR * 2.4, 0, Math.PI * 2)
        ctx.fill()

        // Bright core pupil
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(ex, ey, pupilR * 0.62, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}
