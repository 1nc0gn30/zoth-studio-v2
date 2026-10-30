/**
 * Unicode Braille Patterns (U+2800..U+28FF) as a 2×4 sub-pixel raster surface.
 *
 * A braille cell packs 8 addressable dots in the space of one glyph:
 *
 *        col0 col1
 *   row0  U+01 U+08
 *   row1  U+02 U+10
 *   row2  U+04 U+20
 *   row3  U+40 U+80
 *
 * So one character = 8 samples = 2×4 sub-pixel resolution. A 900×150 CSS-px
 * canvas at a 9px cell is ~187×16 characters ≈ 2992 cells ≈ 23936 addressable
 * sub-pixels — enough for an orbiting field without a single Rectangle().
 *
 * Pure functions only (plus one ctx-based probe) so the encoder is unit-testable.
 */

import { MONO } from './palette.js';

/** DOT_BITS[col][row] — the standard braille dot numbering as bit masks. */
export const DOT_BITS = Object.freeze([
  Object.freeze([0x01, 0x02, 0x04, 0x40]), // left column, rows 0..3
  Object.freeze([0x08, 0x10, 0x20, 0x80]), // right column, rows 0..3
]);

export const BLANK = '\u2800';

/** 0..255 -> '\u2800'..'\u28FF'. */
export function cellChar(bits) {
  return String.fromCharCode(0x2800 + (bits & 0xff));
}

/** Build the 8-bit mask from a 2×4 boolean grid: dots[row][col] === true. */
export function bitsFromDots(dots) {
  let bits = 0;
  for (let row = 0; row < 4; row += 1) {
    const r = dots[row] || [];
    for (let col = 0; col < 2; col += 1) if (r[col]) bits |= DOT_BITS[col][row];
  }
  return bits & 0xff;
}

/** Reverse map, handy for tests and debug readouts. */
export function dotsFromBits(bits) {
  const dots = [[false, false], [false, false], [false, false], [false, false]];
  for (let col = 0; col < 2; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      // eslint-disable-next-line no-bitwise
      dots[row][col] = (bits & DOT_BITS[col][row]) !== 0;
    }
  }
  return dots;
}

/**
 * Does the active font actually carry the Braille Patterns block?
 *
 * A missing glyph resolves to .notdef whose advance is typically shared with
 * every other unmapped codepoint. So: if U+28FF advances identically to a
 * Private-Use codepoint, braille is NOT mapped and drawing it would produce
 * tofu boxes (the exact failure the design mandate forbids). Callers use this
 * to fall back to literal 2×4 dot rectangles, which are geometrically
 * identical and always crisp.
 */
export function probeBrailleSupport(ctx, font = `${9}px ${MONO}`) {
  if (!ctx || typeof ctx.measureText !== 'function') return false;
  const prev = ctx.font;
  try {
    ctx.font = font;
    const braille = ctx.measureText('\u28ff').width;
    const pua = ctx.measureText('\ue000').width;
    const base = ctx.measureText('M').width;
    return braille > 0 && base > 0 && Math.abs(braille - pua) > 0.01;
  } catch (e) {
    return false;
  } finally {
    ctx.font = prev;
  }
}

/**
 * Rasterise a scalar field as braille glyphs.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} env
 * @param {number} env.w        CSS px width
 * @param {number} env.h        CSS px height
 * @param {number} env.t        seconds since scene start
 * @param {(x:number,y:number,t:number)=>number} env.sample intensity 0..1 at a
 *   sub-pixel position, in CSS px coordinates
 * @param {(x:number,y:number,i:number)=>string} [env.colorAt] colour for a lit cell
 * @param {number} [env.cell]   glyph cell height, CSS px (default 9)
 * @param {boolean} [env.dots]  force literal dot rectangles (no font dependency)
 * @param {string} [env.bg]     background fill
 * @returns {{cols:number,rows:number,cells:number,lit:number,glyphs:boolean}}
 */
export function drawBrailleField(ctx, env) {
  const { w, h, t, sample, colorAt } = env;
  const cell = env.cell || 9;
  const bg = env.bg || 'rgba(5,6,11,0)';

  if (env.bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.font = `${cell}px ${MONO}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const adv = Math.max(2, ctx.measureText(BLANK).width || cell * 0.55);
  const rowH = cell * 1.0;
  const cols = Math.max(1, Math.floor(w / adv));
  const rows = Math.max(1, Math.floor(h / rowH));
  const subX = adv / 2;
  const subY = rowH / 4;

  const useGlyphs = !env.dots && probeBrailleSupport(ctx, `${cell}px ${MONO}`);

  // Pass 1 — encode, and bucket cells by colour so fillStyle is set a handful
  // of times per frame instead of once per character.
  const total = cols * rows;
  const codes = new Uint8Array(total); // encoded cell bits, computed once
  const buckets = [new Int32Array(total), new Int32Array(total), new Int32Array(total), new Int32Array(total), new Int32Array(total), new Int32Array(total)];
  const bucketCount = [0, 0, 0, 0, 0, 0];
  let lit = 0;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      let bits = 0;
      let acc = 0;
      let n = 0;
      for (let j = 0; j < 4; j += 1) {
        const py = r * rowH + (j + 0.5) * subY;
        for (let i = 0; i < 2; i += 1) {
          const px = c * adv + (i + 0.5) * subX;
          const v = sample(px, py, t);
          acc += v;
          n += 1;
          if (v > 0.5) bits |= DOT_BITS[i][j];
        }
      }
      if (!bits) continue;
      lit += 1;
      codes[(r * cols) + c] = bits;
      const intensity = n ? acc / n : 0;
      let bucket = Math.floor(intensity * 6);
      if (bucket > 5) bucket = 5;
      if (bucket < 0) bucket = 0;
      buckets[bucket][bucketCount[bucket]] = (r * cols) + c;
      bucketCount[bucket] += 1;
    }
  }

  // Pass 2 — paint. One fillStyle per bucket.
  for (let b = 0; b < 6; b += 1) {
    const count = bucketCount[b];
    if (!count) continue;
    const list = buckets[b];
    const mid = (b + 0.5) / 6;
    const probeX = (list[0] % cols) * adv + adv / 2;
    const probeY = Math.floor(list[0] / cols) * rowH + rowH / 2;
    ctx.fillStyle = colorAt ? colorAt(probeX, probeY, mid) : '#D4AF37';
    for (let k = 0; k < count; k += 1) {
      const idx = list[k];
      const c = idx % cols;
      const r = (idx - c) / cols;
      const bits = codes[idx];
      if (!bits) continue;
      if (useGlyphs) {
        ctx.fillText(cellChar(bits), c * adv, r * rowH + rowH / 2);
      } else {
        // Font-less fallback: literal 2×4 sub-pixel dots, same geometry.
        for (let col = 0; col < 2; col += 1) {
          for (let row = 0; row < 4; row += 1) {
            // eslint-disable-next-line no-bitwise
            if (!(bits & DOT_BITS[col][row])) continue;
            ctx.fillRect(
              c * adv + col * subX + subX * 0.05,
              r * rowH + row * subY + subY * 0.1,
              subX * 0.9,
              subY * 0.8,
            );
          }
        }
      }
    }
  }

  return { cols, rows, cells: total, lit, glyphs: useGlyphs };
}
