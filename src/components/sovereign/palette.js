/**
 * Zoth Sovereign palette + deterministic seeding.
 *
 * Tokens mirror the hex values already hard-coded across
 * src/components/tools/*.jsx so this module introduces ZERO colour drift:
 *   Aurum Gold        #D4AF37
 *   Sovereign Emerald #34D399
 *   Sky Cyber         #38BDF8
 *   Deep Obsidian     #05060B / #0A0D16
 *
 * SSR-safe: this module touches neither window nor document at import time.
 * Every tool page in Zoth Studio is prerendered with react-dom/server, so a
 * module-scope DOM access here would white-page 37 routes.
 */

export const SOV = Object.freeze({
  gold: '#D4AF37',
  emerald: '#34D399',
  cyber: '#38BDF8',
  crimson: '#EF4444',
  amber: '#F59E0B',
  obsidian: '#05060B',
  obsidian2: '#0A0D16',
  obsidian3: '#0E1220',
  ink: '#EDEFF2',
  slate: '#94A3B8',
  slateDim: '#64748B',
});

/** '#D4AF37' -> 'rgba(212,175,55,0.14)'. Malformed input falls back to the gold channel. */
export function rgba(hex, alpha = 1) {
  const h = String(hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(n)) return `rgba(212,175,55,${alpha})`;
  // eslint-disable-next-line no-bitwise
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export const MONO =
  '"JetBrains Mono","IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
export const DISPLAY = '"Space Grotesk","Inter",system-ui,-apple-system,sans-serif';

/** FNV-1a — stable across runs and identical on server and client (no Math.random). */
export function hashSeed(input) {
  const s = typeof input === 'string' ? input : JSON.stringify(input ?? '');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    h ^= s.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    h = Math.imul(h, 0x01000193);
  }
  // eslint-disable-next-line no-bitwise
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32) — used by particle / orbit scenes. */
export function rng(seed) {
  let a = hashSeed(seed) || 1;
  return function next() {
    // eslint-disable-next-line no-bitwise
    a |= 0;
    // eslint-disable-next-line no-bitwise
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    // eslint-disable-next-line no-bitwise
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    // eslint-disable-next-line no-bitwise
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The four sovereign canvas primitives. */
export const VARIANTS = Object.freeze([
  'braille-orbit',
  'bayer-field',
  'scanline-grid',
  'particle-orbit',
]);

export const VARIANT_META = Object.freeze({
  'braille-orbit': { label: 'BRAILLE ORBIT', glyph: 'U+2800', prov: '2×4 SUB-PIXEL CELLS' },
  'bayer-field': { label: 'BAYER FIELD', glyph: '8×8', prov: 'ORDERED DITHER' },
  'scanline-grid': { label: 'SCANLINE GRID', glyph: 'CRT', prov: 'PHOSPHOR RETRACE' },
  'particle-orbit': { label: 'PARTICLE ORBIT', glyph: 'N-BODY', prov: 'FLUID ELLIPTIC' },
});

export const ACCENTS = Object.freeze([SOV.gold, SOV.emerald, SOV.cyber]);

/** Deterministic variant per tool, so /tools/a and /tools/b never look identical. */
export function pickVariant(seed) {
  return VARIANTS[hashSeed(seed) % VARIANTS.length];
}

export function pickAccent(seed, offset = 0) {
  return ACCENTS[(hashSeed(seed) + offset) % ACCENTS.length];
}

/**
 * The accent a tool id resolves to for the canvas band and its eye
 * brow. Single source of truth: SovereignBand and every page eyebrow call
 * this, so a page's chrome can never disagree with its own canvas.
 */
export function bandAccent(seed) {
  const r = hashSeed(seed) % 3;
  return r === 1 ? SOV.emerald : r === 2 ? SOV.cyber : SOV.gold;
}

/**
 * Rec.709 luma of a normalised rgb triple, 0..1 — shared by the dither paths
 * so dithered tone selection matches perceived brightness.
 */
export function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
