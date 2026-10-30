/**
 * The four sovereign canvas scenes.
 *
 * Contract: renderer(ctx, env) -> optional stats object.
 *   env = { w, h, t, dt, dpr, reduced, intensity, seed, accent, rng }
 *   w/h are CSS px; ctx already carries the devicePixelRatio transform, so a
 *   renderer never multiplies by dpr itself.
 *
 * Rules every renderer obeys:
 *   - never touches window/document at module scope (SSR prerender safety);
 *   - tolerates w<=0 || h<=0 by returning early (no NaN into canvas state);
 *   - is a pure function of `t` where possible, so a paused loop resumes
 *     without a visual jump and reduced-motion renders one honest frame.
 */

import { SOV, rgba, pickAccent, rng as makeRng } from './palette.js';
import { drawBrailleField } from './braille.js';
import { ditherFieldToRGBA } from './bayer.js';

/** Per-ctx scratch cache. Keyed off the context object, so it is released
 *  with the canvas — no module-level leak across route changes. */
function cache(ctx) {
  if (!ctx.__sovCache) {
    // eslint-disable-next-line no-param-reassign
    ctx.__sovCache = { key: '', field: null, rgba: null, off: null, img: null };
  }
  return ctx.__sovCache;
}

/* ------------------------------------------------------------------ *
 * 1. BRAILLE ORBIT — 2×4 sub-pixel braille cells driven by orbiting
 *    ring-band fields with a travelling bright bead per ring.
 * ------------------------------------------------------------------ */
const RINGS = [
  { r0: 0.30, amp: 0.055, speed: 0.55, width: 0.052, k: 5, spin: 0.18 },
  { r0: 0.52, amp: 0.075, speed: -0.37, width: 0.044, k: 7, spin: -0.11 },
  { r0: 0.78, amp: 0.10, speed: 0.24, width: 0.038, k: 9, spin: 0.07 },
];

export function brailleOrbit(ctx, env) {
  const { w, h, t, accent, seed } = env;
  if (w <= 4 || h <= 4) return null;

  const cx = w / 2;
  const cy = h / 2;
  const R = Math.max(8, h / 2 - 6);
  const phase = (seed % 360) * (Math.PI / 180);

  const field = (x, y, tt) => {
    const dx = (x - cx) / R;
    const dy = (y - cy) / R;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 1.35) return 0;
    let v = 0;
    for (let i = 0; i < RINGS.length; i += 1) {
      const g = RINGS[i];
      const radius = g.r0 + g.amp * Math.sin(tt * g.speed + phase + i * 1.7);
      const delta = Math.abs(d - radius);
      if (delta < g.width) v += 1 - delta / g.width;
      // travelling bead: angular gaussian around a moving theta
      const theta = Math.atan2(dy, dx);
      const bead = (tt * g.spin) + i * 2.1;
      let da = theta - bead;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      if (delta < g.width * 1.6 && Math.abs(da) < 0.34) {
        v += 0.9 * (1 - Math.abs(da) / 0.34) * (1 - delta / (g.width * 1.6));
      }
    }
    return v > 1 ? 1 : v;
  };

  const colorAt = (x, y) => {
    const dx = (x - cx) / R;
    const dy = (y - cy) / R;
    const d = Math.min(1.35, Math.sqrt(dx * dx + dy * dy));
    if (d < 0.42) return SOV.gold;
    if (d < 0.72) return accent === SOV.gold ? SOV.emerald : accent;
    return accent === SOV.cyber ? SOV.emerald : SOV.cyber;
  };

  const stats = drawBrailleField(ctx, {
    w,
    h,
    t,
    cell: h < 110 ? 8 : 9,
    sample: field,
    colorAt,
    bg: 'rgba(5,6,11,0)',
    dots: env.forceDots === true,
  });

  // Gold core: one radial gradient + reticle, drawn beneath the glyph bed is
  // impossible after the fact, so it is drawn as a soft overlay instead.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
  core.addColorStop(0, rgba(SOV.gold, 0.20));
  core.addColorStop(0.55, rgba(SOV.gold, 0.05));
  core.addColorStop(1, rgba(SOV.gold, 0));
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = rgba(SOV.gold, 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(3, R * 0.06), 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + R * 0.08, cy);
  ctx.lineTo(cx + R * 0.20, cy);
  ctx.moveTo(cx - R * 0.08, cy);
  ctx.lineTo(cx - R * 0.20, cy);
  ctx.stroke();
  ctx.restore();

  return stats;
}

/* ------------------------------------------------------------------ *
 * 2. BAYER FIELD — ordered 8×8 dithered interference field rendered at
 *    half resolution then nearest-neighbour upscaled (authentic
 *    low-colour look, cheap on the GPU).
 * ------------------------------------------------------------------ */
const BAYER_COLORS = { low: SOV.obsidian2, high: SOV.gold, mid: [SOV.emerald, SOV.cyber] };

export function bayerField(ctx, env) {
  const { w, h, t, seed } = env;
  if (w <= 4 || h <= 4) return null;

  const c = cache(ctx);
  const w2 = Math.max(2, Math.ceil(w / 2));
  const h2 = Math.max(2, Math.ceil(h / 2));
  const key = `${w2}x${h2}`;
  if (c.key !== key) {
    c.key = key;
    c.field = new Float32Array(w2 * h2);
    c.rgba = new Uint8ClampedArray(w2 * h2 * 4);
    c.img = null;
    if (typeof document !== 'undefined' && document.createElement) {
      c.off = document.createElement('canvas');
      c.off.width = w2;
      c.off.height = h2;
    }
  }
  if (!c.off || !c.field) return null;
  const offCtx = c.off.getContext('2d');
  if (!offCtx) return null;
  if (!c.img) c.img = offCtx.createImageData(w2, h2);

  const ph = (seed % 1000) / 1000;
  const field = c.field;
  const nx = w2;
  for (let y = 0; y < h2; y += 1) {
    const vy = y / h2;
    for (let x = 0; x < nx; x += 1) {
      const vx = x / w2;
      // interference of three travelling waves + a slow diagonal shear
      const a = Math.sin((vx * 7.0) + t * 0.85 + ph * 6.28);
      const b = Math.sin((vy * 5.0) - t * 0.62);
      const d = Math.sin((vx + vy) * 4.2 + t * 0.35);
      let v = 0.5 + 0.19 * a + 0.17 * b + 0.13 * d;
      // radial well keeps the centre visually anchored
      const dx = vx - 0.5;
      const dy = vy - 0.5;
      v -= 0.22 * Math.min(1, Math.sqrt(dx * dx + dy * dy) * 1.8);
      field[(y * nx) + x] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
  }

  ditherFieldToRGBA(field, w2, h2, c.rgba, {
    low: BAYER_COLORS.low,
    high: BAYER_COLORS.high,
    mid: BAYER_COLORS.mid,
    midFrom: 0.58,
    midTo: 0.74,
  });
  c.img.data.set(c.rgba);
  offCtx.putImageData(c.img, 0, 0);

  const prevSmoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(c.off, 0, 0, w2, h2, 0, 0, w, h);
  ctx.imageSmoothingEnabled = prevSmoothing;

  // Emerald threshold contour: every 8th device column gets a hairline, which
  // reads as the dither matrix's own grid without drawing over the field.
  ctx.save();
  ctx.strokeStyle = rgba(SOV.emerald, 0.10);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < w; x += 8) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  ctx.stroke();
  ctx.restore();

  return { cells: w2 * h2, lit: 0, glyphs: false };
}

/* ------------------------------------------------------------------ *
 * 3. SCANLINE GRID — CRT phosphor grid, beam retrace, roll bar,
 *    occasional horizontal tear and a vignette.
 * ------------------------------------------------------------------ */
export function scanlineGrid(ctx, env) {
  const { w, h, t, seed, reduced } = env;
  if (w <= 4 || h <= 4) return null;

  ctx.fillStyle = SOV.obsidian;
  ctx.fillRect(0, 0, w, h);

  const colW = 34;
  const rowH = 22;
  const drift = reduced ? 0 : (t * 9) % colW;

  // Grid
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(SOV.cyber, 0.13);
  ctx.beginPath();
  for (let x = -drift; x < w; x += colW) {
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, h);
  }
  for (let y = 0; y < h; y += rowH) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(w, Math.round(y) + 0.5);
  }
  ctx.stroke();

  // Lit grid intersections pulse in a travelling diagonal
  ctx.fillStyle = rgba(SOV.gold, 0.85);
  for (let y = 0, ry = 0; y < h; y += rowH, ry += 1) {
    for (let x = -drift, rx = 0; x < w; x += colW, rx += 1) {
      const phase = (rx * 0.7 + ry * 1.3 + (seed % 17) + t * 1.6) % 9;
      if (phase > 0.34) continue;
      ctx.fillRect(Math.round(x) + 0.5, Math.round(y) + 0.5, 1, 1);
    }
  }

  // Roll bar (vertical retrace)
  if (!reduced) {
    const rollY = ((t * 46) % (h + 60)) - 30;
    const band = ctx.createLinearGradient(0, rollY - 26, 0, rollY + 26);
    band.addColorStop(0, rgba(SOV.emerald, 0));
    band.addColorStop(0.5, rgba(SOV.emerald, 0.16));
    band.addColorStop(1, rgba(SOV.emerald, 0));
    ctx.fillStyle = band;
    ctx.fillRect(0, rollY - 26, w, 52);
  }

  // CRT horizontal scanlines
  ctx.fillStyle = 'rgba(3,4,8,0.34)';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

  // Beam cursor
  const bx = Math.round(((t * 120) % (w + 40)) - 20);
  ctx.fillStyle = rgba(SOV.cyber, 0.75);
  ctx.fillRect(bx, 0, 1, h);

  // Occasional tear — deterministic in t so no RNG state leaks between frames
  const tearCycle = Math.floor(t / 2.6);
  const tearSeed = makeRng(`${seed}:${tearCycle}`)();
  if (!reduced && tearSeed > 0.55) {
    const y0 = Math.floor(tearSeed * (h - 6));
    const shift = 6 + Math.floor(tearSeed * 10);
    try {
      const strip = ctx.getImageData(0, y0, w, 3);
      ctx.putImageData(strip, shift, y0);
    } catch (e) {
      /* tainted or zero-size canvas — tear is decorative only */
    }
  }

  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.18, w / 2, h / 2, Math.max(w, h) * 0.72);
  vig.addColorStop(0, 'rgba(5,6,11,0)');
  vig.addColorStop(1, 'rgba(5,6,11,0.72)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  return { cols: Math.ceil(w / colW), rows: Math.ceil(h / rowH) };
}

/* ------------------------------------------------------------------ *
 * 4. PARTICLE ORBIT — fluid elliptical n-body drift with additive
 *    trails around a gold core. Stateful only through a fading
 *    translucent overdraw, which is self-limiting across pauses.
 * ------------------------------------------------------------------ */
const BODIES = 9;

export function particleOrbit(ctx, env) {
  const { w, h, t, accent, seed, dt, reduced } = env;
  if (w <= 4 || h <= 4) return null;

  const cx = w / 2;
  const cy = h / 2;
  const R = Math.max(10, h / 2 - 8);
  const c = cache(ctx);
  if (!c.bodies || c.bodiesKey !== `${seed}:${BODIES}`) {
    const rand = makeRng(`particles:${seed}`);
    c.bodies = Array.from({ length: BODIES }, (_, i) => ({
      a: 0.22 + rand() * 0.74,
      b: 0.10 + rand() * 0.42,
      speed: (0.28 + rand() * 0.42) * (i % 3 === 0 ? -1 : 1),
      phase: rand() * Math.PI * 2,
      tilt: (rand() - 0.5) * 1.1,
      size: 0.9 + rand() * 1.9,
      hue: i % 3,
      trail: [],
    }));
    c.bodiesKey = `${seed}:${BODIES}`;
  }

  // Fade instead of clear → the trail is the previous frame's blit, and a
  // hidden-tab pause simply freezes it (no jump when it resumes).
  ctx.save();
  ctx.fillStyle = reduced ? SOV.obsidian : rgba(SOV.obsidian, 0.17);
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';

  // Core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.34);
  core.addColorStop(0, rgba(SOV.gold, 0.5));
  core.addColorStop(0.4, rgba(SOV.gold, 0.12));
  core.addColorStop(1, rgba(SOV.gold, 0));
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, w, h);

  // Orbit paths (dim)
  ctx.strokeStyle = rgba(SOV.slate, 0.13);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < BODIES; i += 1) {
    const bd = c.bodies[i];
    if (i % 2) continue;
    const a = bd.a * R;
    const b = bd.b * R;
    ctx.ellipse(cx, cy, a, b, bd.tilt, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Bodies + filaments
  const frameScale = reduced ? 0 : Math.min(2.5, dt * 60);
  for (let i = 0; i < BODIES; i += 1) {
    const bd = c.bodies[i];
    const th = bd.phase + t * bd.speed;
    const wob = 1 + 0.12 * Math.sin(t * 1.7 + i);
    const px = cx + Math.cos(th) * bd.a * R * wob;
    const py = cy + Math.sin(th) * bd.b * R * wob;
    const Y = py - cy;
    const rot = px - cx;
    const rx2 = cx + (rot * Math.cos(bd.tilt) - Y * Math.sin(bd.tilt)) * 1;
    const ry2 = cy + (rot * Math.sin(bd.tilt) + Y * Math.cos(bd.tilt)) * 1;

    const col = bd.hue === 0 ? SOV.gold : bd.hue === 1 ? SOV.emerald : SOV.cyber;
    if (!reduced) {
      bd.trail.push([rx2, ry2]);
      const max = 26;
      if (bd.trail.length > max) bd.trail.shift();
    }
    if (bd.trail.length > 1) {
      ctx.strokeStyle = rgba(col, 0.34);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bd.trail[0][0], bd.trail[0][1]);
      for (let k = 1; k < bd.trail.length; k += 1) ctx.lineTo(bd.trail[k][0], bd.trail[k][1]);
      ctx.stroke();
    }

    // Filament to the core
    ctx.strokeStyle = rgba(col, 0.10);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(rx2, ry2);
    ctx.stroke();

    // Glow bead
    const glow = ctx.createRadialGradient(rx2, ry2, 0, rx2, ry2, bd.size * 7);
    glow.addColorStop(0, rgba(col, 0.85));
    glow.addColorStop(0.35, rgba(col, 0.22));
    glow.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(rx2 - bd.size * 7, ry2 - bd.size * 7, bd.size * 14, bd.size * 14);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(rx2, ry2, bd.size * (reduced ? 1 : 0.9 + 0.2 * Math.sin(t * 3 + i)), 0, Math.PI * 2);
    ctx.fill();
    // eslint-disable-next-line no-unused-expressions
    frameScale;
  }
  ctx.restore();

  return { bodies: BODIES };
}

/* ------------------------------------------------------------------ *
 * Variant → renderer dispatch. */
export const RENDERERS = Object.freeze({
  'braille-orbit': brailleOrbit,
  'bayer-field': bayerField,
  'scanline-grid': scanlineGrid,
  'particle-orbit': particleOrbit,
});

export function getRenderer(variant) {
  return RENDERERS[variant] || brailleOrbit;
}

/** Accent resolution shared by every variant (kept here so scenes agree). */
export function sceneAccent(seed, variant) {
  if (variant === 'braille-orbit') return SOV.gold;
  if (variant === 'bayer-field') return SOV.emerald;
  return pickAccent(seed);
}
