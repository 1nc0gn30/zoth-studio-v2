/**
 * Ordered Bayer 8×8 dithering.
 *
 * The 8×8 Bayer matrix is stored row-major, values 0..63 (the canonical
 * distribution 0,32,8,40,...). Normalised threshold = v/64 so the result is
 * strictly inside [0,1) and a uniform grey field dithers to a stable 1:1
 * black/white ratio without banding.
 *
 * Pure functions only — no canvas, no DOM — so this is unit-testable in node.
 */

import { rgba } from './palette.js';

/** Canonical 8×8 ordered dither matrix. */
export const BAYER8 = Object.freeze([
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
]);

/** Normalised threshold for pixel (x, y): tiling every 8px in both axes. */
export function bayer8(x, y) {
  // eslint-disable-next-line no-bitwise
  return BAYER8[((y & 7) << 3) | (x & 7)] / 64;
}

/**
 * Threshold one sample.
 * @param {number} value 0..1 source intensity
 * @param {number} x device column (ints only for the tile to align)
 * @param {number} y device row
 * @param {number} bias mid-tone bias, 0.5 keeps a 50% grey at 1:1
 */
export function dither2Tone(value, x, y, bias = 0.5) {
  return value > bayer8(x, y) * 1.0 + (bias - 0.5) ? 1 : 0;
}

function parseHex(hex) {
  const h = String(hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(full.slice(0, 2), 16) || 0, parseInt(full.slice(2, 4), 16) || 0, parseInt(full.slice(4, 6), 16) || 0];
}

/**
 * Ordered-dither a scalar field into RGBA pixels.
 *
 * @param {Float32Array|number[]} field length w*h, values 0..1
 * @param {number} w
 * @param {number} h
 * @param {Uint8ClampedArray} out RGBA destination, length w*h*4 (reused across frames)
 * @param {object} opts
 * @param {string} opts.low  colour for values below the ramp's first stop
 * @param {string} opts.high colour for values above the ramp's last stop
 * @param {string[]} [opts.mid] optional intermediate tone (accent), applied on the
 *   band [midFrom, midTo] of the normalised value
 * @returns {Uint8ClampedArray} out
 */
export function ditherFieldToRGBA(field, w, h, out, opts) {
  const { low, high } = opts;
  const mids = opts.mid || [];
  const midFrom = opts.midFrom ?? 0.42;
  const midTo = opts.midTo ?? 0.62;
  const [lr, lg, lb] = parseHex(low);
  const [hr, hg, hb] = parseHex(high);
  const midCols = mids.map(parseHex);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      const v = field[i];
      // Ordered threshold decides the tone; the value picks where on the ramp it sits.
      const on = v > bayer8(x, y);
      let r;
      let g;
      let b;
      if (on) {
        r = hr; g = hg; b = hb;
      } else {
        r = lr; g = lg; b = lb;
      }
      if (on && midCols.length && v >= midFrom && v <= midTo) {
        const c = midCols[Math.min(midCols.length - 1, Math.floor(((v - midFrom) / Math.max(1e-6, midTo - midFrom)) * midCols.length))];
        r = c[0]; g = c[1]; b = c[2];
      }
      const o = i * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = 255;
    }
  }
  return out;
}

/** Convenience: emit a CSS colour string for a rise/fall pair, used by legends. */
export function tonePair(low, high) {
  return { low, high, lowSoft: rgba(low, 0.35), highSoft: rgba(high, 0.35) };
}
